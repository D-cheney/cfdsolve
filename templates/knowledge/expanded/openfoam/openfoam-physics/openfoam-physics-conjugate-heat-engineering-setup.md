---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-physics-conjugate-heat-engineering-setup
title: "共轭传热区域：工程设置与参数选择"
summary: "用热阻网络与扩散时间尺度决定固体域是否需要瞬态求解，给出 regionProperties、固体热物性字典、耦合温度边界与 fvConstraints 的完整写法及跨区域一致性核对表。"
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
  - "共轭传热区域"
  - "工程设置与参数选择"
  - "chtMultiRegionFoam"
  - "Biot 数"
seo:
  title: "共轭传热区域：工程设置与参数选择"
  description: "用热阻网络与扩散时间尺度决定固体域是否需要瞬态求解，给出 regionProperties、固体热物性字典、耦合温度边界与 fvConstraints 的完整写法及跨区域一致性核对表。"
  keywords:
    - "共轭传热区域"
    - "工程设置与参数选择"
    - "chtMultiRegionFoam"
    - "Biot 数"
    - "耦合温度边界"
---

# 共轭传热区域：工程设置与参数选择

共轭传热的多区域设置，真正需要提前决策的只有两件事：固体域要不要参与瞬态、耦合界面用什么边界类型。这两个决定一旦定错，后面改字典的代价远大于改网格。本文以水冷铝板（流道 1 m、壁厚 5 mm、水侧对流换热系数 5000 W/(m²·K)）为例，把热阻网络、扩散时间尺度、区域字典与耦合边界一次讲清。

## 先用热阻与时间尺度做决策

固体内温度分布是否可用集总参数处理，由 Biot 数决定；固体响应是否跟得上流体，由扩散时间与流动时间之比决定：

$$Bi=\frac{hL}{k},\qquad \alpha=\frac{k}{\rho C_p},\qquad \tau_s=\frac{L^{2}}{\alpha}$$

铝的 $k=237\ \mathrm{W/(m\,K)}$、$\rho=2700\ \mathrm{kg/m^3}$、$C_p=900\ \mathrm{J/(kg\,K)}$，故 $\alpha=237/(2700\times900)=9.75\times10^{-5}\ \mathrm{m^2/s}$。取半厚 $L=0.005\ \mathrm{m}$，$\tau_s=2.5\times10^{-5}/9.75\times10^{-5}=0.256\ \mathrm{s}$。同一几何换成钢（$k=15$、$\rho=7850$、$C_p=500$），$\alpha=3.82\times10^{-6}\ \mathrm{m^2/s}$，$\tau_s=6.54\ \mathrm{s}$。

水流在 1 m 流道内以 $1\ \mathrm{m/s}$ 通过的时间是 1 s。铝的 $\tau_s=0.256\ \mathrm{s}$ 远小于 1 s，固体近似准定常，可用稳态固体域；钢的 $\tau_s=6.54\ \mathrm{s}$ 是流动时间的 6.5 倍，必须做瞬态固体，否则启动阶段的壁温会被严重低估。

## 热阻网络给出界面温差的量级

界面热流连续，串联热阻决定温差分配：

$$q''=\frac{T_f-T_{s,o}}{1/h+L/k},\qquad \Delta T_{solid}=\frac{q''L}{k}$$

取 $q''=5\times10^{4}\ \mathrm{W/m^2}$：铝侧固体温差 $\Delta T=5\times10^{4}\times0.005/237=1.06\ \mathrm{K}$，水侧对流温差 $q''/h=10.0\ \mathrm{K}$。同一热流下钢侧固体温差为 $16.7\ \mathrm{K}$，是铝的 15.8 倍。这解释了为什么散热器选材时 $k$ 比 $h$ 更敏感：在 $Bi\ll1$ 时固体热阻可忽略，在 $Bi>1$ 时它主导。

## 区域与固体热物性字典

多区域案例用 `constant/regionProperties` 声明区域划分，每个区域有自己的 `constant/<region>/thermophysicalProperties`。固体必须用 `heSolidThermo` 且 `transport` 为 `constIso`（各向同性）或 `constAniso`（各向异性）。

```cpp
// constant/regionProperties
regions
(
    fluid   (fluid)
    solid   (solid)
);

// constant/solid/thermophysicalProperties
thermoType
{
    type            heSolidThermo;
    mixture         pureMixture;
    transport       constIso;
    thermo          hConst;
    equationOfState rhoConst;
    specie          specie;
    energy          sensibleEnthalpy;
}
mixture
{
    specie          { molWeight 26.98; }
    transport       { kappa 237; }        // W/(m K), aluminium
    thermodynamics  { Cp 900; Hf 0; }
    equationOfState { rho 2700; }         // kg/m^3
}
```

`molWeight` 在固体里只用于一致性检查，不影响传热；真正起作用的是 `kappa`、`Cp`、`rho` 三者。若把 `kappa` 写成温度相关形式，需要改用 `polynomial` 并保证与 `hConst` 的焓定义区间不冲突。

## 耦合温度边界与约束

流体与固体之间的界面必须成对使用 `compressible::turbulentTemperatureCoupledBaffleMixed`，它按两侧导热系数加权构造界面温度，等效于在界面上求解 $k_f\partial T/\partial n|_f=k_s\partial T/\partial n|_s$。

```cpp
// 0/T.solid
dimensions      [0 0 0 1 0 0 0];
internalField   uniform 300;
boundaryField
{
    fluid_to_solid
    {
        type            compressible::turbulentTemperatureCoupledBaffleMixed;
        Tnbr            T;
        kappaMethod     solidThermo;
        kappa           kappa;
        value           uniform 320;
    }
    outerWall
    {
        type            fixedValue;
        value           uniform 350;
    }
}
```

若需要把某个换热器芯体简化为定温块，用 `fvConstraints` 而不是边界条件：

```cpp
// constant/solid/fvConstraints
fvConstraints
{
    coreIsothermal
    {
        type            fixedTemperatureConstraint;
        mode            uniform;
        cellZone        core;
        temperature     uniform 330;   // K
    }
}
```

`mode uniform` 会强制该 cellZone 内所有单元温度为 330 K，相当于无限大导热率，仅适用于 $Bi\ll1$ 的金属芯体。若 $Bi>0.1$，这种简化会抹掉内部温度梯度。

## 跨字典一致性检查点

| 检查项 | 三处必须一致 | 不一致的后果 |
|---|---|---|
| 区域名 | `regionProperties` 与网格 `constant/<region>` 目录 | 求解器找不到区域直接退出 |
| 耦合场名 | `Tnbr` 与相邻区域的场文件名 | 界面温度取到零值 |
| 导热模型 | `kappaMethod` 与固体 `transport` 类型 | `kappa` 字段缺失或量纲错 |
| 边界配对 | 两侧 patch 名与网格 blockMesh 定义 | 界面成为绝热壁 |
| 状态方程 | `rhoConst` 必须有 `rho` 条目 | 初始化报缺少条目 |

## 参数取值与对照设计

| 变量 | 基线 | 对照 | 观察量 |
|---|---|---|---|
| 固体 `kappa` | 237 W/(m·K) | 15 W/(m·K) | 界面温度、外壁温度 |
| 固体时间处理 | 稳态 | 瞬态 | 启动 0～10 s 的壁温历史 |
| 界面 `kappaMethod` | solidThermo | fluidThermo | 界面热流偏差 |
| 水侧 $h$ | 5000 W/(m²·K) | 2000 W/(m²·K) | 总热阻分配 |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面温度等于两侧初值的平均 | 界面 patch 未配对或类型写成 `zeroGradient` | 检查两侧 patch 是否都指向同一 `Tnbr` |
| 固体域温度全场均匀 | `kappa` 填成 0 或漏写 | 输出 `kappa` 场并确认量级为 1e2 |
| 能量在界面处不守恒 | 两侧网格不共形且未用 `Mixed` 型边界 | 用 `wallHeatFlux` 分别积分两侧界面热流 |
| 瞬态固体启动温度偏低 | 固体用稳态求解但流动是瞬态 | 对比 $\tau_s$ 与流动时间 |
| 计算在 1 s 内温度爆升 | 固体 `Cp` 单位填成 kJ/(kg·K) | 用 $\alpha=k/(\rho C_p)$ 反算并对比手册值 |

## 参考文献

1. Incropera F.P., DeWitt D.P., Bergman T.L., Lavine A.S., Fundamentals of Heat and Mass Transfer, 7th ed., Wiley, 2011.
2. Patankar S.V., Numerical Heat Transfer and Fluid Flow, Hemisphere Publishing, 1980.
3. Bejan A., Heat Transfer, Wiley, 1993.
4. Versteeg H.K., Malalasekera W., An Introduction to Computational Fluid Dynamics: The Finite Volume Method, 2nd ed., Pearson, 2007.
5. OpenFOAM Foundation, chtMultiRegionFoam 教程与 User Guide（当前发行版，multi-region 与 thermophysical properties 章节）.
