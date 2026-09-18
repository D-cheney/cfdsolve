---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-functionobjects-postprocessing
title: OpenFOAM functionObjects、采样与守恒后处理
summary: 用 functionObjects 把力、探针、采样面、时间平均与守恒量做成随算例版本化的配置，给出 forces/probes/sampling/fieldAverage 的 controlDict 片段、统计公式与从运行到出图的完整后处理流程。
category: { slug: openfoam-post-troubleshooting, name: OpenFOAM 后处理与排错 }
level: 工程
reading_minutes: 14
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, functionObjects, forces, probes, fieldAverage, 守恒, 后处理]
seo:
  title: OpenFOAM functionObjects 与工程后处理
  description: 用 functionObjects 自动采集力、流量、y+、探针和时间平均量，形成可复现的后处理与守恒报告。
  keywords: [OpenFOAM functionObjects, forces, probes, fieldAverage, sampling]
---

# OpenFOAM functionObjects、采样与守恒后处理

后处理定义应当与求解输入一起版本化。在图形界面里手工点选区域、手工截取时间窗口得到的曲线，既无法批量复现，也会因窗口选择不同而产生难以察觉的偏差。把监控量交给 `functionObjects`，让它们在求解过程中按固定口径落盘，是把"能看的图"变成"可验证的证据"的第一步。

## 1 结论与适用场景

先给结论：

- 关键监控量（力、流量、探针、守恒项）应在**运行时**由 functionObjects 计算，以便及早发现异常；昂贵或探索性的分析可离线用 `postProcess` 完成。
- 运行时与离线必须复用同一份配置片段，否则定义会悄悄漂移。
- 时间平均要用固定的统计窗口，先丢弃启动过渡段，再在窗口内取均值与脉动量。
- 守恒报告要按 patch 给出输入、输出、源项与储存变化，而不是只报两个大数的差。
- 任何力系数都必须写明参考密度、参考速度、参考面积与坐标方向，否则无法与实验或文献比较。

适用场景包括外流升阻力与力矩统计、内流流量与压降预算、传热面的面积平均温度与热流、以及需要随算例归档的监控历史。这些量的共同特点是：一旦定义漂移，结论就无法跨工况、跨网格、跨人员比较；而 functionObjects 恰好把定义固化在字典里，从源头上锁死了口径。

## 2 背景与原理

functionObjects 是挂在求解器上的"观察者"，在每个时间步抽取场量并做运算。它们分成两类执行时机：运行时对象随求解一起推进，把结果写到 `postProcessing/`；离线对象则在算完之后由 `postProcess` 工具调用，对已保存的时间目录做同样的运算。二者共享同一套字典语法，因此把配置抽成可复用的片段是关键。

几个常用脚本按功能归类：`forces`/`forceCoeffs` 做壁面力积分，`surfaceFieldValue` 做面通量与面积平均，`volFieldValue` 做体积分与场极值，`probes` 抽取点的时间序列，`fieldAverage` 维护时间平均场与脉动均方根，`sampling`（`surfaces` 形式的采样）把场插值到线、面或点集。它们的共同点是：输出与网格、坐标系、区域选择强绑定，必须连同这些元信息一起记录。

时间平均的数学定义是第一组必须固定的公式。设物理时间从 $t_0$ 到 $t_0+T$，标量场 $\phi$ 的时间平均为

$$
\bar{\phi} = \frac{1}{T} \int_{t_0}^{t_0+T} \phi \, dt
$$

对应的脉动均方根为

$$
\phi_{rms} = \sqrt{ \frac{1}{T} \int_{t_0}^{t_0+T} \left( \phi - \bar{\phi} \right)^2 dt }
$$

数值实现上，若样本等间隔，则用算术平均近似；若时间步自适应，必须按采样时刻做时间加权，否则平均会被密集采样区段主导。这正是"统计窗口和采样频率要一起记录"的原因。

力系数的无量纲化是第二组必须固定的定义：

$$
C_D = \frac{F_D}{\frac{1}{2} \rho_{ref} U_{ref}^2 A_{ref}}
$$

升力系数 $C_L$、侧向力系数 $C_S$ 用同样的分母、不同的分子方向。总力由压力贡献与黏性贡献之和组成，报告时应能分别给出，并注明力矩中心与旋转轴的正方向。对周期性问题，还需用斯特劳哈尔数描述频率：

$$
St = \frac{f L_{ref}}{U_{ref}}
$$

其中 $f$ 为涡脱落或振荡主频，由对升力或探针时间序列做频谱得到。

守恒则用相对不平衡量表达。以质量为例：

$$
\varepsilon_m = \frac{\left| \sum_{in} \dot m - \sum_{out} \dot m \right|}{\sum_{in} \dot m}
$$

要做到这一步，必须先用统一的符号约定把所有 patch 的外法向通量收集起来，再分别列出输入、输出、源项与储存变化。

还有一层容易混淆的区别：`fieldAverage` 维护的是时间平均**场**，而 `forceCoeffs`、`probes` 给出的是标量或点的时间序列。前者适合看回流区、尾迹与分离区的平均结构，后者适合做频谱、峰值与不确定度分析。两者互补，不能互相替代：只存平均场会丢掉瞬态脉动信息，只存点序列则看不到空间结构。

## 3 关键配置与公式

下面是一份可以直接抄用的 `system/controlDict` 片段，覆盖力、探针、时间平均与采样四类对象：

```cpp
functions
{
    forces
    {
        type            forces;
        libs            (forces);
        writeControl    timeStep;
        writeInterval   1;
        patches         (wing wall);
        rho             rhoInf;
        rhoInf          1.225;
        CofR            (0 0 0);
        log             true;
    }

    forceCoeffs
    {
        type            forceCoeffs;
        libs            (forces);
        patches         (wing);
        rho             rhoInf;
        rhoInf          1.225;
        liftDir         (0 1 0);
        dragDir         (1 0 0);
        pitchAxis       (0 0 1);
        magUInf         20;
        lRef            0.5;
        Aref            0.2;
    }

    probes
    {
        type            probes;
        libs            (sampling);
        fields          (U p);
        probeLocations
        (
            (0.5 0.1 0.02)
            (1.0 0.1 0.02)
        );
        interpolationScheme cellPoint;
    }

    fieldAverage
    {
        type            fieldAverage;
        libs            (fieldFunctionObjects);
        timeStart       0.5;   // 丢弃启动过渡
        fields
        (
            U   { mean on; prime2Mean on; base time; }
            p   { mean on; prime2Mean on; base time; }
        );
    }

    surfaces
    {
        type            surfaces;
        libs            (sampling);
        writeControl    writeTime;
        interpolationScheme cellPoint;
        surfaceFormat   vtk;
        fields          (p U);
        surfaces
        {
            midPlane { type plane; basePoint (0 0 0.02); normal (0 0 1); }
        }
    }
}
```

其中 `timeStart` 是统计窗口起点，务必设置为流场已经充分发展之后；`prime2Mean` 输出脉动均方，是计算 $u_{rms}$ 的来源。`forceCoeffs` 中的 `magUInf`、`lRef`、`Aref` 就是公式里的参考量与参考面积，必须与实验定义一致。

## 4 工程做法与参数

**运行时与离线的分工。** 力、流量、探针这类关键量放在运行时，采样频率高、能及早报警；压力场的切片、涡量场、Q 准则等探索性内容放到离线 `postProcess` 执行，避免拖慢主求解。两者用同一份 `functions` 片段，靠是否开启求解器入口来区分。

**统计窗口的选取。** 先看探针或力的时间序列，识别出启动过渡段与稳定段，把 `timeStart` 设在稳定段起点。周期性流动至少覆盖 5～10 个稳定周期；非周期湍流要做分段统计，检查前半窗口与后半窗口的均值是否一致，不一致说明还没达到统计稳态。

**采样频率与频谱。** 频谱的可用频率上限由采样频率决定，分辨率由窗口长度决定。采样太疏会丢失主频，窗口太短则峰值展宽。建议先估计预期主频，保证每个周期至少采样 10～20 个点，再据此确定写出间隔或探针输出频率。

**面通量与面积平均。** 用 `surfaceFieldValue` 时明确选择是对某个 patch 积分（`patchIntegrate`）、做面积平均（`areaAverage`）还是加权平均。注意通量的法向符号约定，否则"入口"会算出负流量，破坏守恒账本。

**守恒报告的组织。** 为每条边界打上"入口/出口/壁面/对称"标签，按质量、能量、组分分别汇总，输出输入、输出、源项、储存变化和相对不平衡。`y+` 也应作为监控量输出，用来核对近壁分辨率是否与所选壁面处理一致，而不是事后再补。

**版本化与归档。** 把 `functions` 片段、探针坐标文件、采样面定义与后处理脚本一起纳入版本控制；每次运行输出到独立目录，避免覆盖。归档时应保存原始字典、求解日志、`postProcessing/` 下的机器可读表格以及出图脚本，让任何一个第三方能在同一版本上重复得到相同数字。

**参考系与旋转机械。** 若涉及 MRF 或 AMI 旋转区，力矩与功率要明确是在绝对系还是相对系中定义，并统一参考轴。不同参考系下同一个几何得到的扭矩可能符号相反，这也是旋流问题报错的高发区。

**不确定度的最低限度。** 报告力系数或热流时，至少给出均值、脉动均方根、采样长度与统计窗口；若是周期性，再加上主频与对应的斯特劳哈尔数。这些量共同构成“数值 + 样本”的最小可信集。

## 5 可复现示例

运行时监控（写在 `controlDict` 中，随 `foamRun` 自动执行）与离线复算是同一条流程的两端。离线可以用 `postProcess` 对已保存的时间目录重算监控量：

```bash
foamRun -case . > log.foamRun 2>&1
```

```bash
postProcess -func "forceCoeffs(name=coeffs,patches=(wing))" -time "0.5:2.0" -case .
```

```bash
foamPostProcess -func "fieldAverage" -case . 2>/dev/null || true
ls postProcessing/forces/0/forceCoeffs.dat postProcessing/probes/0/U
```

把力系数与探针时间序列整理成报告表的伪代码：

```text
读取 forceCoeffs.dat -> (t, Cd, Cl, Cm)
读取 probes/0/U       -> (t, Ux, Uy, Uz) 在若干探针点

# 1) 统计窗口
t0 = 0.5; T = 1.5
w = 选取 t0 <= t <= t0+T 的样本

# 2) 均值与脉动
Cd_bar = mean(Cd[w]); Cd_rms = sqrt(mean((Cd[w]-Cd_bar)^2))

# 3) 频谱与主频
f, P = 对 Cl[w] 做 FFT; St = argmax(P)*lRef/magUInf

# 4) 守恒
eps_m = abs(sum(m_in) - sum(m_out)) / sum(m_in)

# 5) 输出报告
若 eps_m < 1e-3 且 分段统计一致: 标记 统计收敛
```

一个具体例子：某翼型瞬态算例在 `t=0.5` 之后进入周期振荡，用最后 1.5 个时间单位统计，得到 $\bar{C}_L = 0.82$、$C_{L,rms} = 0.11$，升力频谱主频 $f = 42\ \mathrm{Hz}$，代入 $St = f L_{ref} / U_{ref}$ 得 $St \approx 0.21$，与文献同雷诺数结果一致；同时进出口质量不平衡为 $6 \times 10^{-4}$，`y+` 峰值约 0.8，与所用低雷诺数壁面处理相符。整个链条可被同一脚本一键复算。

## 6 常见坑与排查

- **手工后处理无法复现**：在图形界面里选区域、截窗口，换个人做就得到不同曲线。
- **统计窗口含启动段**：均值被瞬态污染，脉动量被严重高估。
- **参考量不一致**：`magUInf`、`Aref`、`rhoInf` 与实验定义不同，系数直接失去可比性。
- **探针落在网格外**：`probes` 以最近单元插值，位置错误不会报错，只会给出静默的错值。
- **面通量符号混乱**：不统一外法向约定，守恒账里"入口"出现负流量。
- **等间隔假设被破坏**：自适应时间步下仍用算术平均，导致加权偏倚。
- **只存云图不存数值**：图能解释结构，但不能替代数值表与不确定度说明。
- **忽略 `y+` 监控**：算完才发现近壁分辨率与壁面函数不匹配。
- **平均场与瞬态量混用**：拿时间平均后的速度场去算脉动量，得到的是零而不是真实脉动。

排查顺序：① 确认 functionObjects 是否真的被写入 `postProcessing/`；② 核对参考量、坐标方向与力矩中心；③ 检查统计窗口与采样频率；④ 检查探针/采样面位置与网格的对应关系；⑤ 核对各 patch 的通量符号与守恒账；⑥ 最后才怀疑湍流模型或边界。

## 7 检查清单与参考

检查清单：

1. `functions` 片段、探针坐标与采样面定义是否与算例一起版本化？
2. 关键监控量是否在运行时输出，能否及早报警？
3. 时间平均的 `timeStart` 是否落在统计稳定段内？
4. 采样频率与窗口长度是否足以分辨主频并给出稳定峰值？
5. 力系数的参考密度、速度、面积与方向是否明确且一致？
6. 守恒报告是否分别给出输入、输出、源项与相对不平衡？
7. `y+` 等近壁指标是否作为常规监控项？

参考资料：

1. 当前 OpenFOAM 发行版 Function Objects 与 Sampling 文档。
2. 本项目《OpenFOAM 日志中的残差、Courant 数与守恒诊断》《力系数、时间平均与 CFD 可复现报告》。
