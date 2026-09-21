---
template_version: flowlab-knowledge/1.0
slug: openfoam-start-solver-selection-engineering-setup
title: 求解器与 foamRun 模块选型：工程设置与诊断验证
summary: >-
  按马赫数与雷诺数把问题分流到
  incompressibleFluid、compressibleFluid、shockFluid、incompressibleVoF 等模块，给出
  foamRun -solver 的调用方式、各模块所需的 constant 字典，以及旧求解器名到新模块的映射表。
category:
  slug: openfoam-getting-started
  name: OpenFOAM 入门与案例组织
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 入门与案例组织
  - 求解器与 foamRun 模块选型
  - 工程设置与参数选择
  - foamRun
  - 马赫数
  - 结果诊断与可信度验证
  - 连续性误差
  - 能量平衡
seo:
  title: 求解器与 foamRun 模块选型：工程设置与诊断验证
  description: >-
    按马赫数与雷诺数把问题分流到
    incompressibleFluid、compressibleFluid、shockFluid、incompressibleVoF 等模块，给出
    foamRun -solver 的调用方式、各模块所需的 constant 字典，以及旧求解器名到新模块的映射表。
  keywords:
    - 求解器与 foamRun 模块选型
    - 工程设置与参数选择
    - foamRun
    - compressibleFluid
    - incompressibleVoF
    - 结果诊断与可信度验证
    - 连续性误差
    - 能量平衡
    - 基准对照
---
# 求解器与 foamRun 模块选型：工程设置与诊断验证

从 v10 起 OpenFOAM 把求解器拆成"一个可执行文件 `foamRun` + 若干物理模块"，模块名由 `-solver` 指定。选型不再靠背求解器清单，而是回答三个问题：流体是否可压、是否存在相界面或固体区域、时间推进是稳态还是瞬态。模块选错很少以"报错"的形式出现，它更常见的表现是：算得下去，收敛曲线也好看，但结果违反一条本应自动成立的守恒关系。因此选型验证的重点不是检查命令，而是检查三类不依赖模型假设的量——连续性误差、能量不平衡率、以及被求解变量是否越出物理界。

## 基础概念与控制关系

### 用马赫数决定是否求解能量方程

可压缩性是否需要建模，由马赫数决定：

$$
Ma = \frac{U}{a}, \qquad a = \sqrt{\gamma R T}
$$

常温空气取 $\gamma = 1.4$、$R = 287\ \mathrm{J/(kg\cdot K)}$、$T = 300\ \mathrm{K}$，声速 $a = \sqrt{1.4\times 287\times 300} = \sqrt{1.2054\times 10^{5}} = 347.2\ \mathrm{m/s}$。来流 $U = 30\ \mathrm{m/s}$ 时 $Ma = 30/347.2 = 0.086$。经验判据是 $Ma < 0.3$ 时密度变化小于约 5%，用不可压模块即可；$Ma$ 在 0.3 到 0.8 之间需要可压模块；超过 0.8 或存在激波时必须用密度基格式。

雷诺数决定湍流处理，但不改变模块选择：

$$
Re = \frac{\rho U L}{\mu}
$$

取 $20\ ^\circ\mathrm{C}$ 水 $\rho = 998.2\ \mathrm{kg/m^3}$、$\mu = 1.0022\times 10^{-3}\ \mathrm{Pa\cdot s}$、$U = 1.5\ \mathrm{m/s}$、$L = 0.05\ \mathrm{m}$，得 $Re = 7.47\times 10^{4}$。这个数只用来决定 `momentumTransport` 里选层流还是 RAS 模型，模块仍是 `incompressibleFluid`。

## 工程设置与实施

### 从旧求解器名迁移

多区域算例不再由单一求解器承担，而是用 `foamMultiRun` 驱动多个模块，每个区域有自己的 `system/<region>/` 目录与模块名。迁移时最容易漏掉的是区域目录层级——把所有字典平铺在算例根下会导致区域初始化失败。

| 旧求解器 | v14 模块 | 备注 |
|---|---|---|
| simpleFoam, pimpleFoam | incompressibleFluid | 由 ddtSchemes 区分稳态与瞬态 |
| buoyantSimpleFoam, buoyantPimpleFoam | fluid | 需 buoyancy 模型与 g |
| rhoPimpleFoam | fluid | 含能量方程 |
| rhoCentralFoam | shockFluid | 密度基，适合激波 |
| interFoam | incompressibleVoF | 两相不可压 |
| reactingFoam | combustion | 需反应机理 |
| chtMultiRegionFoam | foamMultiRun | 多区域耦合，模块按区域分别指定 |

### 模块名与调用方式

```bash
foamRun -solver incompressibleFluid          # 不可压，稳态或瞬态由 ddtSchemes 决定
foamRun -solver compressibleFluid            # 可压，含能量方程
foamRun -solver isothermalFluid              # 可压但不解能量方程，T 由物性给定
foamRun -solver shockFluid                   # 密度基，可捕捉激波
foamRun -solver incompressibleVoF            # 两相不可压 VOF
foamRun -solver multiphaseEuler              # 多相欧拉
foamRun -solver solidDisplacement            # 固体位移
foamRun -solver incompressibleFluid -help    # 查看该模块的可用选项
```

`foamRun` 自身只负责构建模块并推进时间，物理内容全部在模块里。因此 `-solver` 的名字写错时不会"回退到某个默认模块"，而是在构建阶段抛出未知求解器的致命错误并终止。

不可压与可压共用同一模块名下的两套行为：`incompressibleFluid` 既跑稳态也跑瞬态，切换方式是 `system/fvSchemes` 里的 `ddtSchemes { default steadyState; }` 与 `steadyState` 求解控制；瞬态则写 `Euler` 或 `backward`。这意味着同一个算例目录可以在两种模式间切换，只需改 ddt 方案与 `fvSolution` 中的松弛设置。

### 模块需要的 constant 字典

不可压用 `physicalProperties`，可压用 `thermophysicalProperties`，这个区别是最常见的启动失败来源。`constant/g` 在所有涉及重力的模块中都要提供，2D 竖直流道写 `(0 -9.81 0)`，若写反方向，浮力项会把流动推向相反侧。

| 模块 | 必需字典 | 关键条目 |
|---|---|---|
| incompressibleFluid | physicalProperties, momentumTransport | nu, simulationType |
| compressibleFluid | thermophysicalProperties, momentumTransport | thermoType, mixture, equationOfState |
| isothermalFluid | physicalProperties, momentumTransport | pRef, rho 模型 |
| shockFluid | thermophysicalProperties, momentumTransport | energy 变量选择 |
| incompressibleVoF | physicalProperties, momentumTransport | 两相 nu、rho、sigma |
| solidDisplacement | physicalProperties | mechanicalProperties |

## 异常诊断与失效模式

### 故障模式与判定试验

```bash
# 先确认问题类型
foamDictionary -entry simulationType -value constant/momentumTransport
foamDictionary -entry ddtSchemes/default -value system/fvSchemes
grep -n "thermoType" constant/thermophysicalProperties

# 试运行，只构建不推进，确认模块与字典匹配
foamRun -solver incompressibleFluid -dry-run
```

`-dry-run` 用于在正式计算前确认模块能被正确构建、所有必需字典都能读到，代价远低于跑完整算例。对于长周期瞬态，建议先做一次 0.02 s 的短跑，确认时间步与残差行为正常。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 启动即报未知求解器 | `-solver` 名称拼写错误 | 用 `foamRun -solver <name> -help` 逐个验证名称 |
| 报 `physicalProperties` 未定义 | 可压算例误用不可压字典名 | `ls constant/` 确认应存在 thermophysicalProperties |
| 稳态算例残差持续震荡不下降 | 误用瞬态 ddt 方案 | `foamDictionary -entry ddtSchemes/default` 应为 steadyState |
| 温度场完全不变 | 用了 isothermalFluid 或能量方程被关闭 | 检查 `thermophysicalProperties` 的 energy 条目 |
| 自由液面消失或两相混成一体 | 用了单相模块跑 VOF 算例 | 确认模块为 incompressibleVoF 且存在 alpha 场 |
| global 连续性误差长期大于 $10^{-2}$ | 出口边界类型与模块假设冲突 | 检查出口是否为 `inletOutlet` 或 `fixedFluxPressure` |
| 温度场空间均匀且能量不平衡率超过 30% | 模块不含能量方程 | `foamDictionary -entry thermoType/energy` 确认能量项开启 |
| 温度最低值比环境低 150 K 左右 | 边界值把摄氏度当开尔文填入 | 边界值加 273.15 重跑，最低温度应回到环境值附近 |
| 时间步被压到 $10^{-8}\ \mathrm{s}$ 且库朗数仍高 | 可压模块用于近似不可压介质 | 改不可压模块后，同 `maxCo` 下步长应回升数个量级 |
| 压降比同 $Re$ 基准大一个数量级以上 | 物性单位或模块选择错误 | 用 $\rho U L/\mu$ 重算 $Re$，并与基准算例的无量纲压降对比 |

## 验证、验收与复现

### 与基准算例的对照

OpenFOAM 自带教程是选型的基准来源。做法是复制同物理类型的官方教程，只替换几何与物性，先跑通再改。对照量建议选"与模型无关"的积分量：入口流量、出口压力降、总焓流、以及封闭域内的质量守恒。以 $Re = 7.47\times 10^{4}$ 的管流为例，若在教程算例上得到的压降为 $820\ \mathrm{Pa}$，而自己的几何在相同 $Re$ 与相同无量纲长度下得到 $790\ \mathrm{Pa}$，相对差 $3.7\%$，属于网格与入口发展长度带来的正常差异；若得到 $2.4\times 10^{4}\ \mathrm{Pa}$，差 29 倍，则先怀疑模块选错或物性单位错，而不是网格。

### 连续性误差是最直接的选型信号

不可压模块在每步末尾打印连续性误差，其全局值定义为

$$
\varepsilon_{\text{cont}} = \frac{\sum_f \dot m_f}{\dot m_{\text{in}}}
$$

分子是各面质量流量的代数和，理论上为零。日志中该值以 `time step continuity errors : sum local = ..., global = ..., cumulative = ...` 的形式出现。取 $\dot m_{\text{in}} = 0.0123\ \mathrm{kg/s}$、日志报告的 global 值 $3.2\times 10^{-4}$，对应的绝对不平衡量为 $0.0123\times 3.2\times 10^{-4} = 3.94\times 10^{-6}\ \mathrm{kg/s}$，占入口流量的 $0.032\%$。

判据：稳态段的 global 值应稳定在 $10^{-3}$ 以下且不随时间上升；cumulative 值应趋于常数而不是线性增长。若 global 值长期停留在 $10^{-2}$ 以上，且日志同时出现 `Continuity error cannot be removed by adjusting the outflow.`，说明出口边界类型与所选模块的假设冲突——例如把不可压算例的出口设成 `fixedValue` 压力而入口又给了速度，流量无处可调。

### 能量不平衡率判定可压模块是否真的在解能量

对含能量方程的模块，用进出口焓流核对：

$$
\varepsilon_{E} = \frac{\lvert \dot Q_{\text{in}} - \dot Q_{\text{out}} \rvert}{\dot Q_{\text{in}}}
$$

设加热功率 $\dot Q_{\text{in}} = 4.80\ \mathrm{kW}$，由出口温度、流量与比热反算的焓流为 $4.74\ \mathrm{kW}$，则 $\varepsilon_E = 0.06/4.80 = 0.0125$，即 $1.25\%$。稳态算例中该值应在 $2\%$ 以内；若达到 $30\%$ 以上，同时温度场在空间上几乎均匀，就说明能量方程根本没有被激活——常见原因是用了 `isothermalFluid` 或 `thermophysicalProperties` 中把能量求解关闭了。

取数方式：

```bash
postProcess -func 'fieldMinMax(T)' -time 0.5
postProcess -func 'volFieldValue(T)' -time 0.5
foamDictionary -entry thermoType/energy -value constant/thermophysicalProperties
```

### 越界信号揭示模块与物性不匹配

不可压模块把密度当作常数，若被错误地用于低马赫数但强加热的算例，温度升高后密度不变，浮力被系统性低估；反之把可压模块用于水这类近似不可压介质，密度方程会因声速极高而把时间步压到无法承受。两类错误的可观测信号不同：前者表现为温度远高于能量平衡预测值，后者表现为库朗数限制下的时间步异常小。

对空气算例，温度合理下界可取 $200\ \mathrm{K}$。若 `fieldMinMax(T)` 报告最低温度 $T_{\min} = 148.6\ \mathrm{K}$，比环境温度 $300\ \mathrm{K}$ 低 $151\ \mathrm{K}$，且位置固定在某个入口角点，那是边界值单位写错（例如把摄氏度数值直接填进以开尔文为单位的场）而非模块问题。判定试验：把该边界的值加 273.15 后重跑，最低温度应回到 $300\ \mathrm{K}$ 附近。

## 参考资料

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Chapter "Solvers and Modules".
2. C. J. Greenshields, *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
3. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
4. J. D. Anderson, *Modern Compressible Flow: With Historical Perspective*, 3rd ed., McGraw-Hill, 2003.
5. R. I. Issa, "Solution of the implicitly discretised fluid flow equations by operator-splitting", *Journal of Computational Physics*, 62(1):40–65, 1986.
6. Weller, H. G., Tabor, G., Jasak, H., Fureby, C., "A tensorial approach to computational continuum mechanics using object-oriented techniques", *Computers in Physics*, 12(6):620–631, 1998.
7. S. V. Patankar, *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
8. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
9. F. P. Incropera, D. P. DeWitt, T. L. Bergman, A. S. Lavine, *Fundamentals of Heat and Mass Transfer*, 6th ed., Wiley, 2007.
