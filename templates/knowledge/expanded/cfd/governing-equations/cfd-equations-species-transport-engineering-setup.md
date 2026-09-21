---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-species-transport-engineering-setup
title: "组分输运方程：工程设置与参数选择"
summary: "组分输运的落地设置围绕四件事：扩散系数模型、Arrhenius 参数、质量分数约束与有界性格式。本文给出 CH4/空气在 1500 K 与 2000 K 的反应速率手算、达姆科勒数，以及 OpenFOAM 的 chemistryProperties 配置。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 工程
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "组分输运方程"
  - "工程设置与参数选择"
  - "Arrhenius 参数"
  - "质量分数约束"
seo:
  title: "组分输运方程：工程设置与参数选择"
  description: "组分输运的落地设置围绕四件事：扩散系数模型、Arrhenius 参数、质量分数约束与有界性格式。本文给出 CH4/空气在 1500 K 与 2000 K 的反应速率手算、达姆科勒数，以及 OpenFOAM 的 chemistryProperties 配置。"
  keywords:
    - "组分输运方程"
    - "工程设置与参数选择"
    - "Arrhenius 参数"
    - "质量分数约束"
---

# 组分输运方程：工程设置与参数选择

组分输运方程比动量方程多两个坑：一是扩散系数不是常数，选 Fick、恒 Lewis 还是多组分扩散会让结果差几十个百分点；二是反应源项的 Arrhenius 指数对温度极其敏感，活化温度填错一位数就直接把火焰算成惰性混合。设置时的顺序应当是先定扩散模型与物性，再填反应参数，最后用有界格式把质量分数锁在 $[0,1]$ 内。

## 组分方程与质量分数约束

第 $i$ 个组分的质量守恒展开成随体形式

$$
\rho\frac{\partial Y_i}{\partial t} + \rho\mathbf{u}\cdot\nabla Y_i = \nabla\cdot(\rho D_i\nabla Y_i) + \dot\omega_i
$$

$\dot\omega_i$ 是单位体积的组分生成率，量纲 $\mathrm{kg/(m^3\cdot s)}$。与动量方程不同，这组方程有一个硬约束

$$
\sum_{i=1}^{N} Y_i = 1
$$

逐组分求解时这个约束不会被自动满足，必须靠扩散通量的一致性修正（把 $\sum_i \rho D_i\nabla Y_i$ 从对流通量中扣除）来维持。工程上最简单的检查是输出 $\sum_i Y_i$ 的极值：收敛算例应在 $10^{-6}$ 以内偏离 1，若偏离到 $10^{-3}$ 量级，说明修正没做或源项没有守恒地对各组分分配。

## 扩散系数模型：Fick、恒 Lewis 与多组分

层流扩散的严格形式是 Stefan–Maxwell 方程组，工程实现中通常退化为三种模型。Fick 模型逐组分给出二元扩散系数 $D_i$，最接近物理但需要 $N(N-1)/2$ 个系数；恒 Lewis 模型只给一个 Lewis 数，反算 $D_i=\alpha/Le$；恒 Schmidt 模型直接给 $Sc$。三者可以通过两个无量纲数互相换算

$$
Sc = \frac{\nu}{D},\qquad Le = \frac{\alpha}{D} = \frac{Sc}{Pr}
$$

以 298 K、1 atm 下甲烷在空气中的扩散为例，$D_{\mathrm{CH_4\text{-}air}}=1.6\times10^{-5}\ \mathrm{m^2/s}$，空气的运动黏度 $\nu=1.516\times10^{-5}\ \mathrm{m^2/s}$，热扩散率 $\alpha=2.2\times10^{-5}\ \mathrm{m^2/s}$，于是 $Sc=1.516\times10^{-5}/1.6\times10^{-5}=0.948$，$Pr=1.516\times10^{-5}/2.2\times10^{-5}=0.689$，$Le=0.948/0.689=1.375$。若按 OpenFOAM 的 `constantLewis` 默认取 $Le=1$，扩散系数会被设成 $\alpha=2.2\times10^{-5}\ \mathrm{m^2/s}$，比真实值高 37.5%；对甲烷这类 $Le$ 接近 1 的燃料误差可接受，但对氢气（$Le\approx0.3$）会显著改变火焰位置与燃烧速度，必须改用 Fick 或多组分扩散。

## 反应速率的 Arrhenius 参数怎么填

单步总包反应的速率常数写成

$$
k = A\,T^{\beta}\exp\left(-\frac{E_a}{R_u T}\right)
$$

$A$ 的单位随反应级数变化，$\beta$ 是无量纲温度指数，$E_a$ 是活化能，$R_u$ 是通用气体常数。甲烷—空气单步机理的常用取值是 $A=2.119\times10^{11}\ \mathrm{m^3/(kmol\cdot s)}$、$\beta=0$、$E_a=2.027\times10^{8}\ \mathrm{J/kmol}$。OpenFOAM 的 `irreversibleArrheniusReaction` 填的是活化温度 $T_a=E_a/R_u$，用 $R_u=8314\ \mathrm{J/(kmol\cdot K)}$ 换算得

$$
T_a = \frac{2.027\times10^{8}}{8314} = 2.438\times10^{4}\ \mathrm{K}
$$

这一步换算是输入正确性的关键：把 $T_a$ 误填成 $E_a$ 的数值（2.027e8）会让 $\exp(-E_a/R_uT)$ 直接下溢为零，反应完全不发生；反过来把 $E_a$ 当成 $T_a$ 填入又会让反应瞬时完成。两个温度的速率对比很能说明指数敏感性：$T=1500\ \mathrm{K}$ 时 $E_a/(R_uT)=2.027\times10^8/(8314\times1500)=16.25$，$k=2.119\times10^{11}\times e^{-16.25}=2.119\times10^{11}\times8.716\times10^{-8}=1.85\times10^{4}\ \mathrm{m^3/(kmol\cdot s)}$；$T=2000\ \mathrm{K}$ 时 $E_a/(R_uT)=12.19$，$k=2.119\times10^{11}\times5.109\times10^{-6}=1.08\times10^{6}$。温度只升 33%，速率放大 58.6 倍。

这个倍数决定了数值策略。设燃料摩尔浓度 $C_{\mathrm{CH_4}}=0.5\ \mathrm{kmol/m^3}$，化学时间尺度 $\tau_{chem}=1/(kC)=1/(1.85\times10^4\times0.5)=1.08\times10^{-4}\ \mathrm{s}$，即 0.108 ms；流动时间尺度取 $\tau_{flow}=L/U=0.3/20=0.015\ \mathrm{s}$，达姆科勒数

$$
Da = \frac{\tau_{flow}}{\tau_{chem}} = \frac{0.015}{1.08\times10^{-4}} = 139
$$

$Da\gg1$ 表示反应远快于流动，火焰薄且强耦合，必须用小时间步或隐式化学积分（`seulex`、`EulerImplicit`）配合 $10^{-7}\ \mathrm{s}$ 量级的初始化学时间步。

```cpp
// constant/combustionProperties
reactions
{
    methaneAir
    {
        type        irreversibleArrheniusReaction;
        reaction    "CH4 + 2O2 = CO2 + 2H2O";
        A           2.119e11;      // m^3/(kmol s)
        beta        0;
        Ta          24380;         // = Ea/Ru，K；不是 Ea
    }
}

// constant/chemistryProperties
chemistry       on;
initialChemicalTimeStep 1e-7;
odeCoeffs { solver seulex; absTol 1e-12; relTol 1e-4; }
```

## 边界条件与数值有界性

入口给定质量分数、出口用 `inletOutlet`（回流时取内部值）、不参与反应的壁面用 `zeroGradient`。若壁面有催化或吸附，需要换成对应的通量边界，此时壁面反应速率与体相速率用同一套 Arrhenius 参数会更自洽。

数值上，组分方程在反应区极薄、梯度极陡，普通二阶格式会产生负质量分数。做法是把对流项设成 `Gauss limitedLinear 1`，并在源项很强时启用 MULES 限制器做显式有界修正，同时保留隐式源项做时间推进。判据很直接：输出各 $Y_i$ 的最小值，出现负值就说明限制器没生效或时间步过大。

| 参数 | 取值 | 依据 |
|---|---|---|
| $D_{\mathrm{CH_4\text{-}air}}$ | $1.6\times10^{-5}\ \mathrm{m^2/s}$ | 298 K、1 atm |
| $Sc$ / $Le$ | 0.948 / 1.375 | $\nu/D$ 与 $\alpha/D$ |
| 预混甲烷质量分数 | 0.055 | 化学当量：16.04 g CH₄ 配 275.9 g 空气 |
| $A$ / $\beta$ / $T_a$ | $2.119\times10^{11}$ / 0 / 24380 K | 甲烷单步机理 |
| 化学时间步 | $1\times10^{-7}\ \mathrm{s}$ | $\tau_{chem}=0.108\ \mathrm{ms}$ 的千分之一 |
| 达姆科勒数 | 139 | $\tau_{flow}/\tau_{chem}$ |

## 失败模式：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 温度场升到 2000 K 但组分完全不变 | $T_a$ 填成了 $E_a$，指数项下溢 | 打印 $T_a$ 与 $E_a/R_u$ 的比值，应为 1 |
| 质量分数之和偏离 1 达 1% | 扩散通量未做一致性修正，各组分独立扩散 | 输出 $\sum_i Y_i$ 极值，应在 $10^{-6}$ 内 |
| 火焰面上出现负质量分数 | 对流格式无界或时间步过大 | 检查 $Y_i$ 最小值；把格式换成 `limitedLinear 1` 并把 $\Delta t$ 减半 |
| 氢燃料火焰位置比实验靠下游 | 用 $Le=1$ 代替真实 $Le\approx0.3$，扩散被低估 | 改成 Fick 扩散并输出 $Le$ 场，观察火焰前锋是否上移 |
| 反应区温度出现网格相关的尖峰 | 化学时间步未自适应，刚性方程显式积分失稳 | 输出化学积分器接受的步长，应小于 $10^{-6}\ \mathrm{s}$ |
| 封闭腔内燃料缓慢单调减少 | 出口边界泄漏，或源项符号写反 | 积分总体燃料质量随时间，质量守恒应闭合到 $10^{-6}$ |

## 参考文献

1. Westbrook C.K., Dryer F.L., "Simplified reaction mechanisms for the oxidation of hydrocarbon fuels in flames", *Combustion Science and Technology*, 27:31–43, 1981.
2. Bird R.B., Stewart W.E., Lightfoot E.N., *Transport Phenomena*, 2nd ed., Wiley, 2002.
3. Kee R.J., Rupley F.M., Miller J.A., *CHEMKIN-II: A Fortran Chemical Kinetics Package for the Analysis of Gas-Phase Chemical Kinetics*, Sandia National Laboratories, SAND89-8009, 1989.
4. Turns S.R., *An Introduction to Combustion*, 3rd ed., McGraw-Hill, 2012.
