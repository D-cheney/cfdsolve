---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-physics-vof-multiphase-engineering-setup
title: "VOF 多相流：工程设置与参数选择"
summary: "用毛细数、韦伯数与 Bond 数判断表面张力是否必须保留，给出 alpha.water 边界、界面压缩 cAlpha、MULES 子循环与重力字典的完整配置，并手算毛细时间步上限。"
category:
  slug: openfoam-physics
  name: "OpenFOAM 物理模型"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 物理模型"
  - "VOF 多相流"
  - "工程设置与参数选择"
  - "interFoam"
  - "cAlpha"
seo:
  title: "VOF 多相流：工程设置与参数选择"
  description: "用毛细数、韦伯数与 Bond 数判断表面张力是否必须保留，给出 alpha.water 边界、界面压缩 cAlpha、MULES 子循环与重力字典的完整配置，并手算毛细时间步上限。"
  keywords:
    - "VOF 多相流"
    - "工程设置与参数选择"
    - "interFoam"
    - "cAlpha"
    - "MULES"
---

# VOF 多相流：工程设置与参数选择

VOF 案例的设置错误通常不是"跑不起来"，而是"跑得很稳但界面物理不对"：界面被数值扩散抹厚，或毛细时间步被 CFL 掩盖导致虚假振荡。判断该保留哪些项要从三个无量纲数入手，再决定网格、时间步与界面压缩强度。本文以毫米级水-空气两相流（$\sigma=0.072\ \mathrm{N/m}$）为基准。

## 三个无量纲数决定模型清单

$$Ca=\frac{\mu U}{\sigma},\qquad We=\frac{\rho U^{2}L}{\sigma},\qquad Bo=\frac{\Delta\rho\,gL^{2}}{\sigma}$$

取 $\mu=1.0\times10^{-3}\ \mathrm{Pa\,s}$、$\rho=998\ \mathrm{kg/m^3}$、$U=0.1\ \mathrm{m/s}$、$L=1\ \mathrm{mm}$、$\Delta\rho=997\ \mathrm{kg/m^3}$：

- $Ca=1.0\times10^{-3}\times0.1/0.072=1.39\times10^{-3}$，远小于 1，表面张力在界面动量平衡中占主导；
- $We=998\times0.01\times0.001/0.072=0.139$，惯性力远弱于毛细力，不会发生破碎；
- $Bo=997\times9.81\times10^{-6}/0.072=0.136$，重力可忽略。

若把尺度放大到 $L=10\ \mathrm{mm}$，$Bo$ 变成 13.6，重力完全主导，此时表面张力项仍要保留但影响减弱；$We$ 变为 1.39，接近破碎阈值，必须检查网格能否解析液滴变形。

## 毛细时间步是真正的限制

OpenFOAM 的 VOF 求解器要求时间步同时满足对流 CFL 与毛细稳定性：

$$\Delta t_{\sigma}=\sqrt{\frac{\rho\,\Delta x^{3}}{2\pi\sigma}},\qquad \Delta t_{CFL}=\frac{Co\,\Delta x}{U}$$

$\Delta x=5\times10^{-4}\ \mathrm{m}$、$\rho=998\ \mathrm{kg/m^3}$、$\sigma=0.072\ \mathrm{N/m}$ 时，$\Delta t_{\sigma}=\sqrt{998\times1.25\times10^{-10}/(2\pi\times0.072)}=\sqrt{2.76\times10^{-7}}=5.25\times10^{-4}\ \mathrm{s}$。而 $\Delta t_{CFL}=0.5\times5\times10^{-4}/0.1=2.5\times10^{-3}\ \mathrm{s}$，比毛细限制宽 4.8 倍。

这解释了一个常见现象：`maxCo` 设为 0.5 却仍在界面上出现高频振荡，因为求解器被 `maxAlphaCo` 与毛细项卡在 0.5 ms。正确做法是把 `maxAlphaCo` 设为 0.5，并确认日志中实际时间步接近 $5\times10^{-4}\ \mathrm{s}$ 而非 $2.5\times10^{-3}\ \mathrm{s}$。

## 物性、重力与表面张力字典

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

## alpha 场边界与初始化

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

## 界面压缩与 MULES 子循环

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

## 跨字典一致性检查点

| 检查项 | 必须一致的两处 | 不一致的后果 |
|---|---|---|
| 相名 | `phases` 与 `0/alpha.<phase>` 文件名 | 相场找不到，初始化失败 |
| 表面张力配对 | `surfaceTension` 相名与 `phases` | 报缺少配对或源项为零 |
| 重力方向 | `constant/g` 与网格坐标 | 浮力方向错误 |
| 时间步限制 | `maxAlphaCo` 与毛细 $\Delta t_\sigma$ | 界面高频振荡 |
| 密度/黏度 | `physicalProperties` 与 $Re$ 估算 | 边界层与湍流尺度不匹配 |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面扩散到 5 个单元以上 | `cAlpha` 过小或网格过粗 | 把 `cAlpha` 从 0.5 提到 1 并对比界面厚度 |
| 静止液滴自发流动 | 虚假流（parasitic currents） | 关闭重力与入口，观察最大速度是否降到 1e-3 m/s 以下 |
| 水面持续上下振荡 | 时间步超过毛细限制 | 检查日志实际 $\Delta t$ 与 $\Delta t_\sigma$ 的比值 |
| 出口出现假水团 | 出口用了 `zeroGradient` 且存在回流 | 换 `variableHeightFlowRate` 重算 |
| 水从气相入口倒灌 | `inletOutlet` 的 `inletValue` 设成 1 | 确认气相入口 `inletValue` 为 0 |
| 质量不守恒随步数累积 | `MULESCorr` 关闭且子循环不足 | 打开 `MULESCorr` 并监控相体积积分 |

## 参考文献

1. Hirt C.W., Nichols B.D., "Volume of Fluid (VOF) Method for the Dynamics of Free Boundaries," Journal of Computational Physics, 1981.
2. Brackbill J.U., Kothe D.B., Zemach C., "A Continuum Method for Modeling Surface Tension," Journal of Computational Physics, 1992.
3. Rusche H., "Computational Fluid Dynamics of Dispersed Two-Phase Flows at High Phase Fractions," PhD Thesis, Imperial College London, 2002.
4. Deshpande S.S., Anumolu L., Trujillo M.F., "Evaluating the Performance of the Two-Phase Flow Solver interFoam," Computational Science & Discovery, 2012.
5. OpenFOAM Foundation, interFoam 教程与 User Guide（当前发行版，multiphase 与 surface tension 章节）.
