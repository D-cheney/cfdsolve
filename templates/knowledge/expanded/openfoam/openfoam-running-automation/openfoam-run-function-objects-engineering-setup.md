---
template_version: flowlab-knowledge/1.0
slug: openfoam-run-function-objects-engineering-setup
title: functionObjects 在线统计：工程设置与诊断验证
summary: >-
  给出 fieldAverage、forces、probes、residuals 等 functionObject
  的选型依据，用时间加权平均与积分时间尺度确定统计时长，并完成一次力系数归一化的手算和完整配置片段。
  全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: openfoam-running-automation
  name: OpenFOAM 运行与自动化
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 运行与自动化
  - functionObjects 在线统计
  - 工程设置与参数选择
  - fieldAverage
  - forceCoeffs
  - 结果诊断与可信度验证
  - 置信区间
  - 分块平均
seo:
  title: functionObjects 在线统计：工程设置与诊断验证
  description: >-
    给出 fieldAverage、forces、probes、residuals 等 functionObject
    的选型依据，用时间加权平均与积分时间尺度确定统计时长，并完成一次力系数归一化的手算和完整配置片段。
    全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - functionObjects 在线统计
    - 工程设置与参数选择
    - fieldAverage
    - forceCoeffs
    - 时间加权平均
    - 结果诊断与可信度验证
    - 置信区间
    - 分块平均
    - 自相关时间
---
# functionObjects 在线统计：工程设置与诊断验证

## 工程设置与参数选择

在线统计的价值在于不必保存全部时间步的场：`fieldAverage` 边算边累加，跑完就得到平均值与脉动均方值，磁盘占用只有若干标量文件。代价是统计窗口一旦设错，重算代价与整个算例相当。选型、时长、归一化这三件事必须在启动前定下来。

### 该用哪一类 functionObject

按输出形态分四类。场统计用 `fieldAverage`，产出 `UMean`、`UPrime2Mean` 这类时间平均场，用于后处理流场与雷诺应力。积分量用 `forces`、`forceCoeffs`、`surfaceFieldValue`、`volFieldValue`，产出标量时间序列。点值用 `probes`，在指定坐标处采样。求解器内部量用 `residuals`、`CourantNo`、`timeInfo`，用于监控而非结果。

`fieldAverage` 的关键限制是累加器只能从 `timeStart` 开始、到 `timeEnd` 结束，中途重启会重置。若算例预计要续算，应把统计分成若干段、每段用独立的 `timeStart`，或者改用保存场后离线平均。

### 时间加权平均与统计时长

自适应时间步下各时刻的权重不同，平均值必须按 $\Delta t$ 加权：

$$
\bar\phi = \frac{\sum_{n} \phi_n \Delta t_n}{\sum_{n} \Delta t_n}, \qquad
\phi_{\mathrm{rms}} = \sqrt{\overline{\phi^2} - \bar\phi^{\,2}}
$$

`fieldAverage` 内部就是按时间步权重累加的，所以用 `adjustTimeStep true` 时不能拿等间隔采样去复算它。

统计时长的下限由积分时间尺度决定。圆柱绕流 $D = 0.1\ \mathrm{m}$、$U = 1.0\ \mathrm{m/s}$ 时涡脱周期 $T_s = 0.606\ \mathrm{s}$，积分时间尺度取 $\tau \approx 0.4\,T_s = 0.24\ \mathrm{s}$。要得到 5% 精度的平均值，需要的独立样本数：

$$
N_{\mathrm{ind}} \approx \left(\frac{z_{0.975}\,\sigma_\phi}{\varepsilon_\phi\,\bar\phi}\right)^2
$$

取 $\sigma_\phi/\bar\phi = 0.5$、$\varepsilon_\phi = 0.05$、$z_{0.975} = 1.96$：$N_{\mathrm{ind}} = (1.96 \times 0.5/0.05)^2 = 384$。于是统计时长 $T = N_{\mathrm{ind}}\,\tau = 384 \times 0.24 = 92\ \mathrm{s}$。以 $\Delta t = 5.0\times10^{-4}\ \mathrm{s}$ 计，这相当于 $1.84\times10^5$ 步，统计段本身的机时就是主要成本。把精度放宽到 10%，$N_{\mathrm{ind}}$ 降到 96，时长缩到 23 s。

### 力与力矩系数的归一化

`forceCoeffs` 输出 $C_d$、$C_l$，其分母是动压乘参考面积：

$$
C_d = \frac{F_d}{\tfrac{1}{2}\rho U^2 A_{\mathrm{ref}}}
$$

取圆柱 $D = 0.1\ \mathrm{m}$、展长 $L_z = 0.5\ \mathrm{m}$，则 $A_{\mathrm{ref}} = DL_z = 0.05\ \mathrm{m^2}$；空气 $\rho = 1.225\ \mathrm{kg/m^3}$，$U = 10\ \mathrm{m/s}$。动压项为：

$$
\tfrac{1}{2}\rho U^2 A_{\mathrm{ref}} = 0.5 \times 1.225 \times 100 \times 0.05 = 3.063\ \mathrm{N}
$$

`forces` 输出的流向力为 $3.68\ \mathrm{N}$，则 $C_d = 3.68/3.063 = 1.20$，与 $Re = 1.0\times10^5$ 圆柱的公认值 1.2 吻合。若忘了设 `rhoInf`（默认取 1），$C_d$ 会变成 1.47，误差 22%。`magUInf` 与 `lRef`、`Aref` 三个量必须与物理设置一致，`CofR` 只影响力矩不影响力。

`forceCoeffs` 把原始力与归一化系数写在同一个文件里，核对时可以直接取列相除：

```bash
head -12 postProcessing/forceCoeffs1/0/coefficient.dat | tail -3
awk '!/^#/ && NF>=5 {printf "t=%.2f  Fd=%.4f  Cd=%.4f\n", $1, $2, $5}' \
    postProcessing/forceCoeffs1/0/coefficient.dat | tail -5
```

若 $C_d$ 列与手算的 $F_d/3.063$ 对不上，问题一定在归一化参数而非流场。

### 配置片段

```text
functions
{
    #includeFunc residuals
    #includeFunc CourantNo

    fieldAverage1
    {
        type            fieldAverage;
        libs            ("libfieldFunctionObjects.so");
        fields
        (
            U   { mean on; prime2Mean on; }
            p   { mean on; }
        );
        timeStart       20;      // 跳过前 20 s 启动瞬态
        timeEnd         112;
    }

    forceCoeffs1
    {
        type            forceCoeffs;
        libs            ("libforces.so");
        patches         (cylinder);
        rho             rhoInf;
        rhoInf          1.225;
        magUInf         10;
        lRef            0.1;
        Aref            0.05;
        CofR            (0 0 0);
        writeControl    timeStep;
        writeInterval   10;
    }
}
```

`writeControl` 在 functionObject 内部是独立的，与全局 controlDict 无关。`forceCoeffs` 用 `timeStep` 配 `writeInterval 10` 得到每 10 步一个系数样本，足以做频谱；`fieldAverage` 不需要写控制，它在内存中累加、只在全局写出时刻落盘。

### 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| postProcessing 目录为空 | 未加载 libs，或 FO 名与已有对象重名 | 日志中 grep 该 FO 名，看是否报 "already exists" |
| 平均值随 timeStart 改变 | 统计窗口仍包含启动瞬态 | 用 timeStart 20 与 40 各算一次，比较均值 |
| UPrime2Mean 出现负的对角分量 | mean 与 prime2Mean 的时间列未对齐 | 检查 postProcessing 两个文件的时间戳是否逐行一致 |
| 在线 Cd 与手算差 20% | rhoInf 未设或 Aref 用了直径而非投影面积 | 用 $0.5\rho U^2 A$ 手算分母核对 |
| 并行运行时 probes 输出出现两份 | 探针落在子域交界，被多个进程各写一次 | 把探针坐标移到单元中心后重测 |
| 开统计后每步时间明显上升 | writeInterval 过小，每步都落盘 | 对比开/关 FO 的单步墙钟时间 |
| 统计场在重启后从头累加 | fieldAverage 累加器随运行重置 | 看 postProcessing 时间列首值是否回到 timeStart |

### 参考文献

1. Pope S. B. Turbulent Flows. Cambridge University Press, 2000.
2. Tennekes H., Lumley J. L. A First Course in Turbulence. MIT Press, 1972.
3. Weller H. G., Tabor G., Jasak H., Fureby C. A tensorial approach to computational continuum mechanics using object-oriented techniques. Computers in Physics, 12(6):620–631, 1998.
4. Franke J., Hellsten A., Schlünzen H., Carissimo B. (eds.) Best Practice Guideline for the CFD Simulation of Flows in the Urban Environment. COST Action 732, 2007.
5. Schlichting H., Gersten K. Boundary-Layer Theory, 9th ed. Springer, 2017.
6. OpenCFD Ltd. OpenFOAM v11 User Guide. 2024. Chapter on function objects.

## 诊断与可信度验证

一个不带误差棒的时间平均值没有意义。`fieldAverage` 和 `forceCoeffs` 给出的是数字，判断这些数字能不能用，需要回答三个问题：样本之间是否独立、均值的不确定度是多少、以及统计对象本身有没有改变解。前两个是统计问题，第三个是数值问题，验证方法完全不同。

### 统计量的误差棒怎么给

时间序列的样本高度相关，不能直接用样本数 $N$ 算标准误。要先估计积分自相关时间：

$$
\tau = \int_{0}^{\infty} \frac{R(t)}{R(0)}\,\mathrm{d}t, \qquad
R(t) = \overline{\phi(t')\phi(t'+t)} - \bar\phi^{\,2}
$$

工程上取 $\tau \approx 0.4\,T_s$（$T_s$ 为涡脱周期），独立样本数 $N_{\mathrm{ind}} = T_{\mathrm{stat}}/\tau$。均值的不确定度与 95% 置信区间为：

$$
\sigma_{\bar\phi} = \frac{\sigma_\phi}{\sqrt{N_{\mathrm{ind}}}}, \qquad
\mathrm{CI}_{95} = \pm 1.96\,\sigma_{\bar\phi}
$$

圆柱算例的 $C_d$ 时间序列在统计段内给出 $\bar C_d = 1.203$、样本标准差 $\sigma_{C_d} = 0.146$。若统计时长 $T_{\mathrm{stat}} = 96\ \mathrm{s}$、$\tau = 0.24\ \mathrm{s}$，则 $N_{\mathrm{ind}} = 400$，$\sigma_{\bar C_d} = 0.146/20 = 0.0073$，$\mathrm{CI}_{95} = \pm 0.0143$，即 $C_d = 1.203 \pm 0.014$，相对不确定度 1.2%。

若统计时长只有 24 s，$N_{\mathrm{ind}} = 100$，$\sigma_{\bar C_d} = 0.0146$，区间扩大到 $\pm 0.029$，相对不确定度 2.4%。要在同样条件下把不确定度压到 1%，需要 $N_{\mathrm{ind}} = (1.96 \times 0.146/(0.01 \times 1.203))^2 = 566$，统计时长 136 s。

### 分块平均判断收敛

把统计段等分成 8 块，逐块算均值。若各块均值落在 $\pm 2\sigma_{\bar\phi}$ 之内且没有单调趋势，说明统计已收敛；若块均值随块序单调漂移，说明 $\tau$ 被低估或统计段仍含未衰减的慢模态。

```bash
# 从 forceCoeffs 输出中按时间排序取 Cd 列
awk '!/^#/ {print $1, $2}' postProcessing/forceCoeffs1/0/coefficient.dat > cd.dat
# 分成 8 块统计均值与标准差
awk '{n=NR; s+=$2; v[NR]=$2}
     END{m=s/n; for(i=1;i<=n;i++) q+=(v[i]-m)^2;
         printf "mean=%.4f  sd=%.4f  n=%d\n", m, sqrt(q/n), n}' cd.dat
```

块内样本数应不少于 $5\tau/\Delta t_{\mathrm{out}}$。对 $\tau = 0.24\ \mathrm{s}$、采样间隔 $5.0\times10^{-3}\ \mathrm{s}$，每块至少要 240 个样本，8 块合计 1920 个样本、9.6 s 的采样跨度——这只覆盖 16 个积分时间尺度，仍不足。所以实际做法是把块数减到 4，每块 2400 个样本。

### 在线统计与离线重算的互校

`fieldAverage` 的时间加权平均可以用保存的场离线复算，两者应在输出精度内一致。差异来源只有两个：时间加权方式不同，或者统计窗口的起止时刻不一致。

离线复算要用瞬时场的时间步权重：

$$
\bar\phi_{\mathrm{offline}} = \frac{\sum_k \phi_k \Delta t_k}{\sum_k \Delta t_k}
$$

若用等权平均而 $\Delta t$ 在统计段内变化超过 5%，两者会出现可观的系统偏差。$4.0\times10^6$ 单元算例中统计段内 $\Delta t$ 从 $5.0\times10^{-4}$ 变到 $1.2\times10^{-3}\ \mathrm{s}$，变化幅度 140%，等权与时间加权的差别会达到百分之几量级，此时必须用时间加权。

### functionObject 是否改变了结果

`fieldAverage`、`residuals`、`CourantNo` 只读取场，理论上不改变解。但 `fieldExpression`、带 `writeFields true` 的对象会写回场，可能影响后续计算。验证方法是跑两个短算例，一个开统计一个关统计，比较同一时刻的场极值：

```bash
foamRun -case case_withFO  > log.fo > 2>&1
foamRun -case case_noFO    > log.no > 2>&1
diff <(grep -A2 "min(mag(U))" log.fo) <(grep -A2 "min(mag(U))" log.no)
```

两者应逐位相同。若出现 $1\times10^{-6}$ 以上的差别，说明某个对象写回了场。判据是：只读型对象的结果差应为 0；一旦非零，先在 `functions` 里逐个关闭对象定位来源。

### 力的归一化与解析对照

层流小雷诺数下有解析解可对照。球体 $Re < 1$ 时 $C_d = 24/Re$。取 $D = 1.0\times10^{-3}\ \mathrm{m}$、$\nu = 1.0\times10^{-6}\ \mathrm{m^2/s}$、$U = 1.0\times10^{-4}\ \mathrm{m/s}$，则 $Re = UD/\nu = 1.0\times10^{-4} \times 1.0\times10^{-3}/1.0\times10^{-6} = 0.1$，解析值 $C_d = 240$。若 `forceCoeffs` 给出 248，偏差 3.3%，在 $Re = 0.1$ 时有限域与分辨率效应可以解释这一量级。若给出 120 或 480，就是 $A_{\mathrm{ref}}$ 用了半径而非直径这类设置错误。

### 诊断表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 块均值单调漂移 | 统计段仍含未衰减慢模态，$\tau$ 被低估 | 把统计段延长一倍后重算块均值 |
| 在线均值与离线重算差 3% | 离线用等权平均而 $\Delta t$ 在统计段内变化大 | 用 $\Delta t$ 加权重算离线值 |
| 在线 Cd 与解析值差一倍 | Aref 或 rhoInf 与物理设置不一致 | 用 $0.5\rho U^2 A$ 手算分母 |
| 开关 functionObject 后场极值不同 | 某个对象写回了场 | 逐个关闭对象定位来源 |
| 并行下 probes 数值与串行不同 | 探针落在子域交界，插值权重不同 | 把探针移到单元中心重测 |
| 统计场在重启点断裂 | fieldAverage 累加器随运行重置 | 检查 postProcessing 时间列首尾 |
| UPrime2Mean 对角分量为负 | mean 与 prime2Mean 采样时刻未对齐 | 逐行比较两个文件的时间戳 |

### 一次统计收敛核算

圆柱算例统计段 96 s，$\tau = 0.24\ \mathrm{s}$，$N_{\mathrm{ind}} = 400$，得 $C_d = 1.203 \pm 0.014$。分 4 块后各块均值为 1.196、1.207、1.209、1.200，块间标准差 0.0057，与 $\sigma_{\bar\phi}/\sqrt{4} = 0.0037$ 同量级，没有单调趋势，统计通过。与文献在 $Re = 1.0\times10^5$ 的圆柱阻力系数 1.2 相比，偏差 0.25%，小于 1.2% 的自身不确定度，对照有效。

若把统计时长缩到 24 s，区间变成 $1.203 \pm 0.029$，与文献值 1.2 的差 0.25% 就被自身不确定度完全淹没，此时不能声称与文献一致。

### 参考文献

1. Pope S. B. Turbulent Flows. CUP, 2000, ch. 12 (statistical description of turbulence).
2. Tennekes H., Lumley J. L. A First Course in Turbulence. MIT Press, 1972, ch. 6.
3. Sreenivasan K. R., Antonia R. A., Danh H. Q. Temperature dissipation fluctuations in a turbulent boundary layer. Physics of Fluids, 20(8):1238–1249, 1977.
4. Oliver T. A., Malaya N., Ulerich R., Moser R. D. Estimating uncertainties in statistics computed from direct numerical simulation. Physics of Fluids, 26(3):035101, 2014.
5. Norberg C. Fluctuating lift on a circular cylinder. Journal of Fluids and Structures 17(1), 2003.
6. OpenCFD Ltd. OpenFOAM User Guide v11. 2024. Chapter: Function objects.
