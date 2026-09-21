---
template_version: flowlab-knowledge/1.0
slug: openfoam-physics-vof-multiphase-engineering-setup
title: VOF 多相流：工程设置与诊断验证
summary: >-
  用毛细数、韦伯数与 Bond 数判断表面张力是否必须保留，给出 alpha.water 边界、界面压缩 cAlpha、MULES
  子循环与重力字典的完整配置，并手算毛细时间步上限。
category:
  slug: openfoam-physics
  name: OpenFOAM 物理模型
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 物理模型
  - VOF 多相流
  - 工程设置与参数选择
  - interFoam
  - cAlpha
  - 结果诊断与可信度验证
  - Laplace 压力
  - Rayleigh-Taylor
seo:
  title: VOF 多相流：工程设置与诊断验证
  description: >-
    用毛细数、韦伯数与 Bond 数判断表面张力是否必须保留，给出 alpha.water 边界、界面压缩 cAlpha、MULES
    子循环与重力字典的完整配置，并手算毛细时间步上限。
  keywords:
    - VOF 多相流
    - 工程设置与参数选择
    - interFoam
    - cAlpha
    - MULES
    - 结果诊断与可信度验证
    - Laplace 压力
    - Rayleigh-Taylor
    - 虚假流
---
# VOF 多相流：工程设置与诊断验证

VOF 案例的设置错误通常不是"跑不起来"，而是"跑得很稳但界面物理不对"：界面被数值扩散抹厚，或毛细时间步被 CFL 掩盖导致虚假振荡。判断该保留哪些项要从三个无量纲数入手，再决定网格、时间步与界面压缩强度。本文以毫米级水-空气两相流（$\sigma=0.072\ \mathrm{N/m}$）为基准。VOF 结果的可信度不能用"界面看起来像"来判断。真正有效的做法是先跑三个解析或半解析基准，确认求解器在你的网格与时间步下能复现已知答案，再去看工程几何。这三个基准是：静止液滴的 Laplace 压力、Rayleigh-Taylor 不稳定性增长率、以及 Martin-Moyce 溃坝前沿位置。

## 基础概念与控制关系

### 相体积守恒与 alpha 有界性

VOF 不求解相质量方程，相体积守恒完全依赖输运格式。定义相对漂移

$$\epsilon_V=\frac{\left|V_p(t)-V_p(0)\right|}{V_p(0)}$$

在 1000 个时间步后应低于 $10^{-4}$。同时检查 alpha 场极值：合格范围是 $-10^{-6}\le\alpha\le1+10^{-6}$，超出即为限幅器失效。这两个指标可直接由 `volFieldValue` 与 `fieldMinMax` 功能对象在运行时输出。

```cpp
// system/controlDict
functions
{
    phaseVolume
    {
        type            volFieldValue;
        libs            ("libfieldFunctionObjects.so");
        fields          (alpha.water);
        operation       volIntegrate;
        writeFields     false;
    }
    alphaRange
    {
        type            fieldMinMax;
        libs            ("libfieldFunctionObjects.so");
        fields          (alpha.water);
        writeControl    timeStep;
        writeInterval   100;
    }
}
```

## 工程设置与实施

### alpha 场边界与初始化

VOF 的相场叫 `alpha.<phase>`，本例为 `0/alpha.water`。边界类型要区分"水从哪进、气从哪进、界面在哪"。

```cpp
// 0/alpha.water
dimensions      [0 0 0 0 0 0 0];
internalField   uniform 0;
boundaryField
{
    inlet
    {
        type            fixedValue;
        value           uniform 1;      // 纯水入口
    }
    outlet
    {
        type            variableHeightFlowRate;
        lowerBound      0;
        upperBound      1;
        value           uniform 0.5;
    }
    atmosphere
    {
        type            inletOutlet;
        inletValue      uniform 0;
        value           uniform 0;
    }
    walls
    {
        type            zeroGradient;
    }
}
```

`variableHeightFlowRate` 是 VOF 专用的出口条件，它按出口面上的相分率与静压自动调整回流分配，比 `zeroGradient` 更不易在下游产生假水团。若出口是淹没出流（全是水），直接用 `fixedValue 1` 即可，此时 `variableHeightFlowRate` 反而会引入不必要的耦合。

### 三个无量纲数决定模型清单

$$Ca=\frac{\mu U}{\sigma},\qquad We=\frac{\rho U^{2}L}{\sigma},\qquad Bo=\frac{\Delta\rho\,gL^{2}}{\sigma}$$

取 $\mu=1.0\times10^{-3}\ \mathrm{Pa\,s}$、$\rho=998\ \mathrm{kg/m^3}$、$U=0.1\ \mathrm{m/s}$、$L=1\ \mathrm{mm}$、$\Delta\rho=997\ \mathrm{kg/m^3}$：

- $Ca=1.0\times10^{-3}\times0.1/0.072=1.39\times10^{-3}$，远小于 1，表面张力在界面动量平衡中占主导；
- $We=998\times0.01\times0.001/0.072=0.139$，惯性力远弱于毛细力，不会发生破碎；
- $Bo=997\times9.81\times10^{-6}/0.072=0.136$，重力可忽略。

若把尺度放大到 $L=10\ \mathrm{mm}$，$Bo$ 变成 13.6，重力完全主导，此时表面张力项仍要保留但影响减弱；$We$ 变为 1.39，接近破碎阈值，必须检查网格能否解析液滴变形。

### 毛细时间步是真正的限制

OpenFOAM 的 VOF 求解器要求时间步同时满足对流 CFL 与毛细稳定性：

$$\Delta t_{\sigma}=\sqrt{\frac{\rho\,\Delta x^{3}}{2\pi\sigma}},\qquad \Delta t_{CFL}=\frac{Co\,\Delta x}{U}$$

$\Delta x=5\times10^{-4}\ \mathrm{m}$、$\rho=998\ \mathrm{kg/m^3}$、$\sigma=0.072\ \mathrm{N/m}$ 时，$\Delta t_{\sigma}=\sqrt{998\times1.25\times10^{-10}/(2\pi\times0.072)}=\sqrt{2.76\times10^{-7}}=5.25\times10^{-4}\ \mathrm{s}$。而 $\Delta t_{CFL}=0.5\times5\times10^{-4}/0.1=2.5\times10^{-3}\ \mathrm{s}$，比毛细限制宽 4.8 倍。

这解释了一个常见现象：`maxCo` 设为 0.5 却仍在界面上出现高频振荡，因为求解器被 `maxAlphaCo` 与毛细项卡在 0.5 ms。正确做法是把 `maxAlphaCo` 设为 0.5，并确认日志中实际时间步接近 $5\times10^{-4}\ \mathrm{s}$ 而非 $2.5\times10^{-3}\ \mathrm{s}$。

### 物性、重力与表面张力字典

```cpp
// constant/physicalProperties
phases (water air);
water
{
    transportModel  Newtonian;
    nu              1.0e-06;      // m^2/s
    rho             998.2;        // kg/m^3
}
air
{
    transportModel  Newtonian;
    nu              1.48e-05;     // m^2/s
    rho             1.2;          // kg/m^3
}

// constant/g
dimensions      [0 1 -2 0 0 0 0];
value           (0 -9.81 0);      // m/s^2

// constant/momentumTransport
simulationType  RAS;
RAS
{
    model           kOmegaSST;
    turbulence      on;
}
surfaceTension
(
    (air water) 0.072;            // N/m
);
```

`surfaceTension` 的相名对必须与 `phases` 中出现的名字一致且顺序无关；若写成 `(water air)` 而字典中只有 `water`，求解器在构造 CSF 源项时会报找不到配对。重力方向必须与网格坐标一致，把 $(0,-9.81,0)$ 用在 $y$ 向上的网格里会让水往错误方向流。

### 界面压缩与 MULES 子循环

界面锐度由 `cAlpha` 控制，它是对流项中压缩速度与相对速度的比值上限。取值越大界面越锐，但过大会在界面处产生非物理速度。

```cpp
// system/fvSolution
"alpha.water.*"
{
    nAlphaCorr      2;
    nAlphaSubCycles 2;
    cAlpha          1;
    MULESCorr       yes;
    nLimiterIter    5;
    solver          smoothSolver;
    smoother        symGaussSeidel;
    tolerance       1e-8;
    relTol          0;
}
```

`nAlphaSubCycles 2` 把相输运在单个时间步内再细分两次，等效于把界面 Courant 数减半；`cAlpha 1` 表示界面法向压缩速度不超过相对速度，是精度与稳定的平衡点。若静止液滴上就出现速度噪声，先把 `cAlpha` 降到 0.5 观察噪声是否减小。

### 跨字典一致性检查点

| 检查项 | 必须一致的两处 | 不一致的后果 |
|---|---|---|
| 相名 | `phases` 与 `0/alpha.<phase>` 文件名 | 相场找不到，初始化失败 |
| 表面张力配对 | `surfaceTension` 相名与 `phases` | 报缺少配对或源项为零 |
| 重力方向 | `constant/g` 与网格坐标 | 浮力方向错误 |
| 时间步限制 | `maxAlphaCo` 与毛细 $\Delta t_\sigma$ | 界面高频振荡 |
| 密度/黏度 | `physicalProperties` 与 $Re$ 估算 | 边界层与湍流尺度不匹配 |

### 用命令行做三个基准的快速判读

```bash
# 1) Laplace 基准：液滴内外压差
postProcess -func "volFieldValue(p)" -region region0 -latestTime
#    读数为内部体积分压力，除以液滴体积即为 p_in；与 p_out=0 之差应为 144 Pa

# 2) 相体积漂移
postProcess -func "volFieldValue(alpha.water)" -latestTime

# 3) 界面厚度：沿一条线输出 alpha，统计 0.05~0.95 跨越的单元数
postProcess -func "graphUniform(alpha.water)" -latestTime
```

判读顺序建议固定为 Laplace → 相体积 → 界面厚度 → 溃坝前沿。前一项不达标时后一项的偏差无法归因，继续看下去只会浪费计算资源。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面扩散到 5 个单元以上 | `cAlpha` 过小或网格过粗 | 把 `cAlpha` 从 0.5 提到 1 并对比界面厚度 |
| 静止液滴自发流动 | 虚假流（parasitic currents） | 关闭重力与入口，观察最大速度是否降到 1e-3 m/s 以下 |
| 水面持续上下振荡 | 时间步超过毛细限制 | 检查日志实际 $\Delta t$ 与 $\Delta t_\sigma$ 的比值 |
| 出口出现假水团 | 出口用了 `zeroGradient` 且存在回流 | 换 `variableHeightFlowRate` 重算 |
| 水从气相入口倒灌 | `inletOutlet` 的 `inletValue` 设成 1 | 确认气相入口 `inletValue` 为 0 |
| 质量不守恒随步数累积 | `MULESCorr` 关闭且子循环不足 | 打开 `MULESCorr` 并监控相体积积分 |
| 静止液滴内部持续流动 | CSF 源项离散误差（虚假流） | 跑 Laplace 基准，测最大速度 |
| 界面跨越 6 个单元 | `cAlpha` 过小或网格过粗 | 把 `cAlpha` 提到 1 并比较界面厚度 |
| 相体积随时间单调减少 | 压缩项把水输运出计算域 | 监控出口面的相通量积分 |
| 溃坝前沿始终慢于基准 | 对流项数值耗散过强 | 加密界面附近网格，观察偏差是否收窄 |
| 短波扰动全部消失 | 网格未解析 $\lambda_c/4$ | 用 4 mm 与 2 mm 网格各算一遍对比 |
| alpha 出现 1.02 | 限幅迭代不足 | 把 `nLimiterIter` 从 5 提到 10 |

### 诊断量汇总

| 诊断量 | 提取方式 | 合格阈值 |
|---|---|---|
| Laplace 压差 | 液滴内外压力积分差 | $144\pm7\ \mathrm{Pa}$（5%） |
| 虚假流速度 | 静止液滴内最大 $|\mathbf{U}|$ | $<0.072\ \mathrm{m/s}$ |
| 界面厚度 | alpha 从 0.05 到 0.95 跨越的单元数 | $\le3$ |
| 相体积漂移 | `volIntegrate(alpha.water)` | $<10^{-4}$ |
| alpha 极值 | `fieldMinMax` | $[-10^{-6},1+10^{-6}]$ |
| 溃坝前沿 | 最大 $x$ 处 alpha=0.5 位置 | 与解析式偏差 $<10\%$ |

## 验证、验收与复现

### 基准一：静止液滴的 Laplace 压力

静止液滴内部压力高于外部，压差由 Young-Laplace 关系给出：

$$\Delta p=\sigma\left(\frac{1}{R_1}+\frac{1}{R_2}\right)=\frac{2\sigma}{R}$$

取 $R=1.0\times10^{-3}\ \mathrm{m}$、$\sigma=0.072\ \mathrm{N/m}$，得 $\Delta p=2\times0.072/10^{-3}=144\ \mathrm{Pa}$。换算成水柱高，$h=\Delta p/(\rho g)=144/(998\times9.81)=1.47\times10^{-2}\ \mathrm{m}$，即 14.7 mm 水柱。

这个数值有双重用途：一是验收压力场，二是量化虚假流。真实静止液滴内速度应严格为零，数值解会出现由 CSF 源项离散误差引起的寄生速度。把该速度代入毛细数 $Ca_{sp}=\mu u_{sp}/\sigma$，合格标准是 $Ca_{sp}<10^{-3}$，即 $u_{sp}<0.072\ \mathrm{m/s}$。若你的算例给出 0.5 m/s，界面会在几个时间步内自发变形，后续所有结果作废。

### 基准二：Rayleigh-Taylor 增长率与截止波长

两层流体界面的线性增长率由重力与表面张力竞争决定：

$$\omega=\sqrt{A_t g k-\frac{\sigma k^{3}}{\rho_1+\rho_2}},\qquad A_t=\frac{\rho_1-\rho_2}{\rho_1+\rho_2}$$

水-空气的 Atwood 数 $A_t=(998-1.2)/(998+1.2)=0.9976$。取扰动波长 $\lambda=20\ \mathrm{mm}$，$k=2\pi/\lambda=314.2\ \mathrm{m^{-1}}$：$A_tgk=0.9976\times9.81\times314.2=3074\ \mathrm{s^{-2}}$，$\sigma k^{3}/(\rho_1+\rho_2)=0.072\times3.10\times10^{7}/999.2=2234\ \mathrm{s^{-2}}$，故 $\omega=\sqrt{840}=29.0\ \mathrm{s^{-1}}$，特征增长时间 34.5 ms。

令 $\omega=0$ 可解出截止波长 $\lambda_c=17.0\ \mathrm{mm}$：比它短的扰动被表面张力稳定。这意味着网格必须至少解析 $\lambda_c/4\approx4\ \mathrm{mm}$ 才能正确区分"稳定"与"失稳"，否则数值耗散会人为抹平所有短波扰动，得到一个永远稳定的假结果。

### 基准三：Martin-Moyce 溃坝前沿

二维溃坝的实验室数据被广泛用作 VOF 验证基准。无量纲前沿位置 $x/a$ 是 $t\sqrt{2g/a}$ 的函数，在 $0.5<t\sqrt{2g/a}<2.0$ 区间近似为线性：

$$\frac{x}{a}=1.2+1.6\,t\sqrt{\frac{2g}{a}}$$

以水柱宽 $a=0.057\ \mathrm{m}$ 为例，$\sqrt{2g/a}=\sqrt{19.62/0.057}=18.6\ \mathrm{s^{-1}}$。在 $t=0.05\ \mathrm{s}$ 时 $t\sqrt{2g/a}=0.930$，理论 $x/a=2.69$，即前沿位于 0.153 m。若模拟给出 0.130 m，偏低 15%，说明界面处的对流被过度耗散，应检查 `cAlpha` 与网格各向异性。

## 参考资料

1. Hirt C.W., Nichols B.D., "Volume of Fluid (VOF) Method for the Dynamics of Free Boundaries," Journal of Computational Physics, 1981.
2. Brackbill J.U., Kothe D.B., Zemach C., "A Continuum Method for Modeling Surface Tension," Journal of Computational Physics, 1992.
3. Rusche H., "Computational Fluid Dynamics of Dispersed Two-Phase Flows at High Phase Fractions," PhD Thesis, Imperial College London, 2002.
4. Deshpande S.S., Anumolu L., Trujillo M.F., "Evaluating the Performance of the Two-Phase Flow Solver interFoam," Computational Science & Discovery, 2012.
5. OpenFOAM Foundation, interFoam 教程与 User Guide（当前发行版，multiphase 与 surface tension 章节）.
6. Martin J.C., Moyce W.J., "An Experimental Study of the Collapse of Liquid Columns on a Rigid Horizontal Plane," Philosophical Transactions of the Royal Society A, 1952.
7. Sussman M., Smereka P., Osher S., "A Level Set Approach for Computing Solutions to Incompressible Two-Phase Flow," Journal of Computational Physics, 1994.
8. Lafaurie B., Nardone C., Scardovelli R., Zaleski S., Zanetti G., "Modelling Merging and Fragmentation in Multiphase Flows with SURFER," Journal of Computational Physics, 1994.
9. Popinet S., "An Accurate Adaptive Solver for Surface-Tension-Driven Interfacial Flows," Journal of Computational Physics, 2009.
