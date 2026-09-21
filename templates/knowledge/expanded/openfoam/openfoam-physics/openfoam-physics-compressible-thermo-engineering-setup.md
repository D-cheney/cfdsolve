---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-physics-compressible-thermo-engineering-setup
title: "可压缩热物性：工程设置与参数选择"
summary: "拆解 thermophysicalProperties 的六个选择项，用空气的 R、γ、Cp、Sutherland 系数把 molWeight、Cp、As/Ts 之间的量纲关系算通，并给出 0/p、0/T 边界与 fvModels 的配套写法。"
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
  - "可压缩热物性"
  - "工程设置与参数选择"
  - "hePsiThermo"
  - "sutherland"
seo:
  title: "可压缩热物性：工程设置与参数选择"
  description: "拆解 thermophysicalProperties 的六个选择项，用空气的 R、γ、Cp、Sutherland 系数把 molWeight、Cp、As/Ts 之间的量纲关系算通，并给出 0/p、0/T 边界与 fvModels 的配套写法。"
  keywords:
    - "可压缩热物性"
    - "工程设置与参数选择"
    - "hePsiThermo"
    - "sutherland"
    - "sensibleEnthalpy"
---

# 可压缩热物性：工程设置与参数选择

可压缩求解器的热物性字典不是一组可以照抄的常数，而是一个必须自洽的方程组：`molWeight` 决定气体常数，气体常数与 `Cp` 共同决定比热比，比热比又反过来决定声速和马赫数。只要其中一项与工况温度不匹配，`hePsiThermo` 就会给出量级正确但数值偏差 10% 以上的密度场，而残差照样下降。本文以 300 K、1 bar 空气为基准，把六个选择项逐个算通。

## 六个选择项各自的含义

`thermoType` 里的六行分别决定：能量方程解哪个变量、混合物如何处理、黏度用哪条关系、焓如何随温度变化、密度由哪条状态方程给出、组分模型。它们不是自由组合，比如 `sensibleEnthalpy` 必须配合求解器写出 `0/h`，而 `sensibleInternalEnergy` 要求 `0/e`。

```cpp
// constant/thermophysicalProperties
thermoType
{
    type            hePsiThermo;
    mixture         pureMixture;
    transport       sutherland;
    thermo          hConst;
    equationOfState perfectGas;
    specie          specie;
    energy          sensibleEnthalpy;
}
mixture
{
    specie
    {
        molWeight   28.96;        // g/mol, dry air
    }
    thermodynamics
    {
        Cp          1005;         // J/(kg K)
        Hf          0;
    }
    transport
    {
        As          1.458e-06;    // kg/(m s sqrt(K))
        Ts          110.4;        // K
    }
}
```

## 用理想气体状态方程锁定密度

可压缩求解器把压力当作热力学量求解，密度由状态方程反算：

$$p=\rho R T,\qquad R=\frac{R_u}{W}=\frac{8314.46}{28.96}=287.1\ \mathrm{J/(kg\,K)}$$

代入 $T=300\ \mathrm{K}$、$p=10^{5}\ \mathrm{Pa}$，得 $\rho=10^{5}/(287.1\times300)=1.161\ \mathrm{kg/m^3}$。若把 `molWeight` 误填成 1（当作氢气），$R$ 变成 $8314.46\ \mathrm{J/(kg\,K)}$，同样压力下密度只有 $0.0401\ \mathrm{kg/m^3}$，质量流量整体偏小 29 倍。

## Sutherland 黏度必须与温度区间匹配

`hConst` 表示焓与温度成线性关系，`sutherland` 表示黏度按下式随温度变化：

$$\mu(T)=\frac{A_s T^{3/2}}{T+T_s}$$

代入 $A_s=1.458\times10^{-6}$、$T_s=110.4\ \mathrm{K}$、$T=300\ \mathrm{K}$：$T^{3/2}=5196$，故 $\mu=1.458\times10^{-6}\times5196/410.4=1.846\times10^{-5}\ \mathrm{Pa\,s}$，与 300 K 空气实测值 $1.85\times10^{-5}\ \mathrm{Pa\,s}$ 吻合。若换成 `const` 并填 $1.8\times10^{-5}$，在 800 K 的燃烧后区域会低估黏度约 90%，边界层厚度被压薄、壁面热流被高估。Sutherland 式在 $T<200\ \mathrm{K}$ 与 $T>2500\ \mathrm{K}$ 都会失准，低温工况应改用 `polynomial` 或 `tabulated`。

## 比热比、声速与马赫数的自洽检查

`Cp` 不能独立给定，它必须与 `molWeight` 通过 $R=C_p-C_v$ 保持一致：

$$\gamma=\frac{C_p}{C_v}=\frac{C_p}{C_p-R}=\frac{1005}{1005-287.1}=1.40,\qquad a=\sqrt{\gamma R T}$$

由 $a=\sqrt{1.4\times287.1\times300}=347.2\ \mathrm{m/s}$ 可知，来流 $U=100\ \mathrm{m/s}$ 对应 $Ma=0.288$，属亚声速可压缩范围，必须开启可压缩求解器而不是当作不可压处理。若出口马赫数超过 0.3 而仍用不可压近似，密度变化被忽略会带来 3%～5% 的压降误差。

顺带可算出总温，用于核对 `totalPressure` 边界：

$$T_0=T\left(1+\frac{\gamma-1}{2}Ma^{2}\right)=300\times(1+0.2\times0.0829)=305.0\ \mathrm{K}$$

## 边界与源项的配套写法

可压缩入口用 `totalPressure` 时必须同时给总压与总温，出口用 `fixedValue` 给静压。`0/h` 的初值应等于 $C_pT=1005\times300=3.015\times10^{5}\ \mathrm{J/kg}$。

```cpp
// 0/p
internalField   uniform 1e5;
boundaryField
{
    inlet  { type zeroGradient; }
    outlet { type fixedValue; value uniform 1e5; }
    wall   { type zeroGradient; }
}
// 0/T
internalField   uniform 300;
boundaryField
{
    inlet  { type totalTemperature; T0 uniform 305; gamma 1.4; phi phi; psi thermo:psi; }
    outlet { type zeroGradient; }
    wall   { type fixedValue; value uniform 350; }
}
// constant/fvModels
fvModels
{
    heatExchanger
    {
        type            heatSource;
        cellZone        core;
        volumeMode      specific;
        q               5e5;      // W/kg, volumetric source
    }
}
fvConstraints
{
    limitTemperature
    {
        type            limitTemperature;
        min             250;      // K
        max             2500;     // K
    }
}
```

`fvConstraints` 里的 `limitTemperature` 不是可选项：`hConst` 线性焓在低温端可能给出负温度，加入上下限可避免 `sqrt(T)` 取负导致发散。

## 跨字典一致性检查点

| 检查项 | 关系式 | 容差 |
|---|---|---|
| `molWeight` 与 $R$ | $R=8314.46/W$ | 与求解日志中 `R` 一致 |
| `Cp` 与 $\gamma$ | $\gamma=C_p/(C_p-R)$ | 目标 $\gamma$ 偏差 $<0.5\%$ |
| `As`、`Ts` 与工况 $T$ | Sutherland 式 | 与实测黏度偏差 $<3\%$ |
| 能量变量与场文件 | `sensibleEnthalpy` 对应 `0/h` | 缺 `0/h` 时求解器直接报错 |
| 边界类型与热物性 | `totalTemperature` 需 `thermo:psi` | 与 `psi` 字段名一致 |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 首步温度变为负值 | `hConst` 线性焓外推越界 | 加 `limitTemperature` 并把初值设到工况温度 |
| 密度场比预期小一个数量级 | `molWeight` 单位填成 kg/mol 或数值错 | 用 $p/(RT)$ 手算核对 |
| 高温区壁面热流偏大 | 黏度用了 `const` 而非 `sutherland` | 用 Sutherland 式手算 800 K 黏度对比 |
| 入口总温与静温混淆 | 把 $T_0$ 直接写进 `0/T` 的 `fixedValue` | 核对 $T_0/T=1+(\gamma-1)Ma^{2}/2$ |
| 马赫数 0.5 以上仍用不可压 | 未切换求解器与 `equationOfState` | 检查 `thermoType` 是否为 `hePsiThermo` |

## 参考文献

1. Sutherland W., "The Viscosity of Gases and Molecular Force," Philosophical Magazine, 1893.
2. Anderson J.D., Modern Compressible Flow: With Historical Perspective, 2nd ed., McGraw-Hill, 1990.
3. Poling B.E., Prausnitz J.M., O'Connell J.P., The Properties of Gases and Liquids, 5th ed., McGraw-Hill, 2001.
4. Čengel Y.A., Boles M.A., Thermodynamics: An Engineering Approach, 8th ed., McGraw-Hill, 2015.
5. OpenFOAM Foundation, OpenFOAM User Guide（当前发行版，thermophysical properties 与 fvModels 章节）.
6. Anderson J.D. 《Hypersonic and High-Temperature Gas Dynamics》. AIAA, 2006.
7. White F.M. 《Viscous Fluid Flow》. McGraw-Hill, 2006.
8. McBride B.J., Zehe M.J., Gordon S. 《NASA Glenn Coefficients for Calculating Thermodynamic Properties of Individual Species》. NASA TP-2002-211556, 2002.
