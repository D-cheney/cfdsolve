---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-physics-lagrangian-cloud-engineering-setup
title: "拉格朗日颗粒云：工程设置与参数选择"
summary: "用颗粒弛豫时间与 Stokes 数判断该用哪种曳力与弥散模型，给出 cloudProperties 中 injectionModels、dispersionModel、粒子受力与 parcel 数量的完整配置和取值依据。"
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
  - "拉格朗日颗粒云"
  - "工程设置与参数选择"
  - "cloudProperties"
  - "Stokes 数"
seo:
  title: "拉格朗日颗粒云：工程设置与参数选择"
  description: "用颗粒弛豫时间与 Stokes 数判断该用哪种曳力与弥散模型，给出 cloudProperties 中 injectionModels、dispersionModel、粒子受力与 parcel 数量的完整配置和取值依据。"
  keywords:
    - "拉格朗日颗粒云"
    - "工程设置与参数选择"
    - "cloudProperties"
    - "Stokes 数"
    - "patchInjection"
---

# 拉格朗日颗粒云：工程设置与参数选择

拉格朗日颗粒云的设置核心不是"填哪些字段"，而是先确定颗粒与流场的耦合强度，再由耦合强度决定曳力模型、弥散模型和 parcel 数量。判据只有一个无量纲数：Stokes 数。本文以空气（$\mu=1.8\times10^{-5}\ \mathrm{Pa\,s}$、$\rho_f=1.2\ \mathrm{kg/m^3}$）中喷射水滴为例，把这条链条走通。

## 颗粒弛豫时间与 Stokes 数

Stokes 阻力下，颗粒速度向流体速度弛豫的特征时间是

$$\tau_p=\frac{\rho_p d_p^{2}}{18\mu},\qquad St=\frac{\tau_p}{\tau_f},\qquad \tau_f=\frac{L}{U}$$

$d_p=100\ \mathrm{\mu m}$、$\rho_p=1000\ \mathrm{kg/m^3}$ 时，$\tau_p=1000\times(10^{-4})^{2}/(18\times1.8\times10^{-5})=3.09\times10^{-2}\ \mathrm{s}$，即 30.9 ms。同样几何下 $d_p=10\ \mathrm{\mu m}$ 的颗粒 $\tau_p=3.09\times10^{-4}\ \mathrm{s}$，只有前者的 1%。

流场时间尺度取 $\tau_f=L/U=0.1/10=1.0\times10^{-2}\ \mathrm{s}$，则 $St=3.09$（100 μm）与 $St=0.031$（10 μm）。这两个值给出完全不同的建模策略：$St\ll1$ 时颗粒跟随流线，可用平衡欧拉法且弥散模型影响很小；$St\approx1$ 时出现优先聚集，必须用随机弥散模型；$St\gg1$ 时颗粒走弹道轨迹，弥散模型几乎不起作用，但重力与初速度方向必须准确。

## 终端速度与颗粒雷诺数决定曳力模型

重力与阻力平衡给出终端速度：

$$v_t=\tau_p g,\qquad Re_p=\frac{\rho_f\left|\mathbf{u}-\mathbf{v}\right|d_p}{\mu}$$

100 μm 颗粒 $v_t=3.09\times10^{-2}\times9.81=0.303\ \mathrm{m/s}$，对应 $Re_p=1.2\times0.303\times10^{-4}/1.8\times10^{-5}=2.02$。10 μm 颗粒 $v_t=3.03\times10^{-3}\ \mathrm{m/s}$，$Re_p=2.02\times10^{-3}$。

$Re_p<1$ 时 Stokes 阻力严格成立，可直接用 `Stokes`；$1<Re_p<1000$ 必须用带修正的曳力系数：

$$C_D=\frac{24}{Re_p}\left(1+0.15Re_p^{0.687}\right)$$

$Re_p=2.02$ 时该式给出 $C_D=24/2.02\times(1+0.15\times1.62)=11.88\times1.243=14.8$，比纯 Stokes 的 11.88 高 25%。在 OpenFOAM 中对应 `sphereDrag`；若颗粒是液滴且可能变形，应改用 `distortedDrag` 或 `TaylorAnalogy`。

## cloudProperties 的完整结构

```cpp
// constant/cloudProperties
cloudName       spray;
solution
{
    active          true;
    coupled         true;          // 双向耦合
    transient       yes;
    cellValueSourceCorrection on;
    maxCo           0.3;
    sourceTerms
    {
        schemes
        {
            rho         explicit 1;
            U           explicit 1;
            Yi          explicit 1;
            h           explicit 1;
        }
    }
}
constantProperties
{
    rho0            1000;          // kg/m^3, 液滴密度
    minParticleMass 1.0e-13;       // kg
    youngsModulus   1.0e+06;
    poissonsRatio   0.4;
}
subModels
{
    particleForces
    {
        gravity         (0 -9.81 0);   // m/s^2
        sphereDrag;
    }
    injectionModels
    {
        injector1
        {
            type            patchInjection;
            patch           inlet;
            massTotal       1.0e-02;   // kg
            SOI             0;         // s
            duration        1.0;       // s
            parcelsPerSecond 1000;
            flowRateProfile constant 1;
            U0              (10 0 0);  // m/s
            sizeDistribution
            {
                type            fixedValue;
                fixedValueDistribution { value 1.0e-04; }
            }
        }
    }
    dispersionModel     stochasticDispersionRAS;
    patchInteractionModel standardWallInteraction;
    surfaceFilmModel    none;
    heatTransferModel   none;
    phaseChangeModel    none;
}
```

## parcel 数量的量级估算

拉格朗日方法用 parcel 代表一组相同颗粒，`nParticle` 是每个 parcel 的颗粒数。先算单颗粒质量：

$$m_p=\rho_p\frac{\pi}{6}d_p^{3}=1000\times0.5236\times10^{-12}=5.24\times10^{-10}\ \mathrm{kg}$$

`massTotal` 为 $1.0\times10^{-2}\ \mathrm{kg}$、`nParticle` 取 $1\times10^{5}$ 时，所需 parcel 数为 $10^{-2}/(5.24\times10^{-10}\times10^{5})=191$ 个。设成 1 则 parcel 数变成 $1.91\times10^{7}$，计算量增加五个数量级；设成 $1\times10^{8}$ 则只有 0.19 个。建议把 parcel 数控制在 $10^{3}\sim10^{5}$。

```cpp
// system/fvSolution 中的云求解控制
"cloud:spray"
{
    solver          steadyState;
}
```

## 跨字典一致性检查点

| 检查项 | 必须一致的两处 | 不一致的后果 |
|---|---|---|
| 云名 | `cloudName` 与求解器/场名 | 云未注册，无颗粒输出 |
| 粒径与质量 | `sizeDistribution` 与 `massTotal` | parcel 数偏离预期量级 |
| 密度 | `constantProperties.rho0` 与 `d_p` | 弛豫时间算错，轨迹偏差 |
| 弥散模型 | `stochasticDispersionRAS` 与连续相 `momentumTransport` | 无湍流场可采样，弥散失效 |
| 受力 | `gravity` 与网格坐标方向 | 颗粒向上飘 |
| 双向耦合 | `coupled` 与 `sourceTerms` 的 `explicit` 系数 | 相间动量不守恒 |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 颗粒轨迹完全笔直 | `dispersionModel` 设为 `none` 或湍流场为空 | 输出颗粒速度脉动统计量 |
| 颗粒数远少于预期 | `parcelsPerSecond` 与 `duration` 不匹配 | 用 $m_p$ 与 `massTotal` 反算 parcel 数 |
| 颗粒反向飞出计算域 | `gravity` 方向与网格坐标不一致 | 检查 `constant/g` 与云内 `gravity` 是否同向 |
| 100 μm 颗粒紧跟流线 | 用了 Stokes 阻力但 $Re_p>1$ | 手算 $Re_p$ 并换 `sphereDrag` |
| 相间动量不守恒 | `coupled` 打开但 `sourceTerms` 为 `none` | 对比流体动量残差与颗粒动量变化 |
| 计算在注入瞬间卡死 | `parcelsPerSecond` 过大导致单步 parcel 过多 | 降低注入率并观察单步耗时 |

## 参考文献

1. Crowe C.T., Sommerfeld M., Tsuji Y., Multiphase Flows with Droplets and Particles, CRC Press, 1998.
2. Maxey M.R., Riley J.J., "Equation of Motion for a Small Rigid Sphere in a Nonuniform Flow," Physics of Fluids, 1983.
3. Gosman A.D., Ioannides E., "Aspects of Computer Simulation of Liquid-Fueled Combustors," Journal of Energy, 1981.
4. Sommerfeld M., van Wachem B., Oliemans R., Best Practice Guidelines for Computational Fluid Dynamics of Dispersed Multi-Phase Flows, ERCOFTAC, 2008.
5. OpenFOAM Foundation, lagrangian 教程与 User Guide（当前发行版，cloudProperties 与 injection models 章节）.
