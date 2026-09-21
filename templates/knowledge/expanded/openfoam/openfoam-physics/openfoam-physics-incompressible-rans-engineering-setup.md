---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-physics-incompressible-rans-engineering-setup
title: "不可压 RANS 设置：工程设置与参数选择"
summary: "从运动学压力约定讲起，给出不可压 RANS 的物性字典、湍流模型字典、首层高度与入口湍流量换算，并附一份可直接运行的单相水管道算例与参数取值依据。"
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
  - "不可压 RANS 设置"
  - "工程设置与参数选择"
  - "kOmegaSST"
  - "kinematic pressure"
seo:
  title: "不可压 RANS 设置：工程设置与参数选择"
  description: "从运动学压力约定讲起，给出不可压 RANS 的物性字典、湍流模型字典、首层高度与入口湍流量换算，并附一份可直接运行的单相水管道算例与参数取值依据。"
  keywords:
    - "不可压 RANS 设置"
    - "工程设置与参数选择"
    - "kinematic pressure"
    - "kOmegaSST"
    - "simpleFoam"
---

# 不可压 RANS 设置：工程设置与参数选择

不可压 RANS 的坑几乎全部来自两处：一是忘了求解器内部压力是运动学量，二是把网格分辨率与壁面处理当成两件独立的事。本文以一段 20 ℃ 水在直径 20 mm 圆管中流动的算例贯穿，给出物性字典、湍流字典、首层高度反算与入口湍流量换算，并说明每个取值从哪个目标量倒推而来。适用于 simpleFoam/pimpleFoam 的单相定常或准定常计算。

## 压力是运动学量，不是帕斯卡

不可压求解器把密度从动量方程中消掉，只保留 $\nu=\mu/\rho$，压力项被同时除以密度，因此 0/p 里存的是

$$p = \frac{P}{\rho}$$

单位为 $\mathrm{m^2/s^2}$。举例：本文算例若真实压降为 2232 Pa，则字典里应写 $p=2.236\ \mathrm{m^2/s^2}$，写成 2232 会让动量方程量级错三个数量级，首次迭代即溢出。出口若用 `fixedValue`，务必确认填的是运动学值；更稳妥的做法是出口给 `fixedValue 0` 并让内部压力自由发展，或改用压力-速度耦合的 `p_rgh` 体系。

## 物性字典与湍流字典

不可压案例的 `constant/physicalProperties` 只需要一个运动黏度，其余物性一律不写；`constant/momentumTransport` 负责模型开关。两处必须同时存在且语义一致，否则求解器会退回默认值并静默运行。

```cpp
// constant/physicalProperties
viscosityModel  constant;
nu              1.004e-06;    // m^2/s, water at 20 C

// constant/momentumTransport
simulationType  RAS;
RAS
{
    model           kOmegaSST;   // 逆压梯度下优于标准 k-epsilon
    turbulence      on;
    printCoeffs     on;
}
```

选 kOmegaSST 而不是 kEpsilon 的理由是可核对的具体差异：本算例 $Re=3.98\times10^4$ 属中等雷诺数，弯头与阀门后存在弱分离，SST 的剪切应力限制器能把涡黏在逆压梯度区压低，标准 k-ε 在此类区域会高估分离长度。若几何是直管且只关心压降，kEpsilon 更省迭代。

## 由雷诺数反算首层高度

管流可用 Blasius 关系先估摩擦因子，再算摩擦速度，最后反推首层单元中心高度：

$$Re=\frac{UD}{\nu},\qquad u_\tau=U\sqrt{\frac{f}{8}},\qquad y=\frac{y^{+}\nu}{u_\tau}$$

代入 $U=2\ \mathrm{m/s}$、$D=0.02\ \mathrm{m}$、$\nu=1.004\times10^{-6}\ \mathrm{m^2/s}$，得 $Re=3.98\times10^4$；$f=0.316Re^{-0.25}=0.0224$；$u_\tau=2\sqrt{0.0224/8}=0.1057\ \mathrm{m/s}$。于是 $y^{+}=1$ 对应首层中心高度 $9.5\times10^{-6}\ \mathrm{m}$，$y^{+}=30$ 对应 $2.85\times10^{-4}\ \mathrm{m}$。

这两个数字决定了网格量级：壁面解析方案首层约 10 μm，管径 20 mm 的模型需要棱柱层从 10 μm 铺到 0.3 mm 以上，单元数比壁面函数方案高一个数量级。若沿用 $y^{+}\approx50$ 的粗网格再切到低雷诺模型，壁面剪切会被系统性高估，这不是收敛问题而是分辨率问题。

## 入口湍流量换算

入口需要给出 $k$ 与 $\omega$。用湍流强度 $I$ 与长度尺度 $L$ 换算：

$$k=\frac{3}{2}\left(UI\right)^2,\qquad \omega=\frac{\sqrt{k}}{C_\mu^{1/4}L}$$

取 $I=5\%$、$U=2\ \mathrm{m/s}$，得 $k=0.015\ \mathrm{m^2/s^2}$；$L$ 常取 $0.07D=1.4\times10^{-3}\ \mathrm{m}$，$C_\mu=0.09$，故 $\omega=\sqrt{0.015}/(0.09^{0.25}\times1.4\times10^{-3})=160\ \mathrm{s^{-1}}$。若把 $\omega$ 误填成 $k$ 的量级（如 0.015），入口涡黏 $\mu_t/\rho=k/\omega$ 会放大四个数量级，边界层被人为吹厚，压降偏小。

```cpp
// 0/k
internalField   uniform 0.015;
boundaryField
{
    inlet  { type turbulentIntensityKineticEnergyInlet; intensity 0.05; value uniform 0.015; }
    outlet { type inletOutlet; inletValue uniform 0.015; value uniform 0.015; }
    wall   { type kqRWallFunction; value uniform 0.015; }
}
// 0/omega
internalField   uniform 160;
boundaryField
{
    inlet  { type turbulentMixingLengthFrequencyInlet; mixingLength 0.0014; value uniform 160; }
    outlet { type inletOutlet; inletValue uniform 160; value uniform 160; }
    wall   { type omegaWallFunction; value uniform 160; }
}
```

## 数值格式与求解控制的保守起点

定常不可压的默认组合建议：`div(phi,U)` 用 `bounded Gauss linearUpwind grad(U)`，湍流量用 `bounded Gauss limitedLinear 1`，`laplacian` 用 `Gauss linear corrected`。代数上 U 用 `smoothSolver`、`GAMG` 预条件，$p$ 用 `GAMG` 配 `DICGaussSeidel`，`SIMPLE` 的 `consistent yes` 可减少一次压力修正的外循环。松弛起步取 U 0.7、k/omega 0.5、p 0.3；稳定后可把 p 提到 0.5。

## 单因素对照与记录

参数选择要靠对照而非试数，本文建议至少三组：

| 变量 | 基线 | 对照 A | 对照 B | 观察量 |
|---|---|---|---|---|
| 首层 $y^{+}$ | 30 | 1 | 50 | 压降、壁面剪切 |
| 湍流模型 | kOmegaSST | kEpsilon | realizableKE | 分离位置 |
| 入口 $I$ | 5% | 1% | 10% | 压降、出口湍动能 |

每组的输入哈希、`nu`、`I`、`L`、首层高度必须写进同一张表，否则后续无法判断差异来自哪一项。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 首步残差冲到 1e6 后发散 | 0/p 填了帕斯卡而非 $\mathrm{m^2/s^2}$ | 检查出口 p 量级：应为 1e0 而非 1e3 |
| 压降随网格加密单调下降不收敛 | 首层落在 $5<y^{+}<30$ 缓冲层 | 输出 yPlus 直方图，确认落在 1 或 30 附近 |
| 弯头后分离区长度随迭代摆动 | 湍流方程松弛过大或格式无界 | 把 k/omega 松弛降到 0.3，观察是否平直 |
| 出口出现回流且 $k$ 为负 | 出口用 fixedValue 且未设 inletOutlet | 换 inletOutlet 并监控最小 $k$ |
| 质量不守恒残差 1e-2 不再下降 | SIMPLE 未开 consistent，或 p 松弛过小 | 打开 consistent，把 p 松弛提到 0.5 |

## 参考文献

1. Blasius H., "Grenzschichten in Flüssigkeiten mit kleiner Reibung," Zeitschrift für Mathematik und Physik, 1908.
2. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications," AIAA Journal, 1994.
3. Patankar S.V., Numerical Heat Transfer and Fluid Flow, Hemisphere Publishing, 1980.
4. Ferziger J.H., Perić M., Street R.L., Computational Methods for Fluid Dynamics, 4th ed., Springer, 2020.
5. OpenFOAM Foundation, OpenFOAM User Guide（当前发行版，incompressible solvers 与 fvSolution 章节）.
