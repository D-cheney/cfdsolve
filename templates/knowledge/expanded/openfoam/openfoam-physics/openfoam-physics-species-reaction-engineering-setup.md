---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-physics-species-reaction-engineering-setup
title: "组分与反应：工程设置与参数选择"
summary: "给出 reactingMixture 热物性字典、janaf 系数区间、reactions 中 Ta 与 Ea 的换算关系，并用当量比与绝热火焰温估算判断该用有限速率还是平衡化学。"
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
  - "组分与反应"
  - "工程设置与参数选择"
  - "Arrhenius"
  - "janaf"
seo:
  title: "组分与反应：工程设置与参数选择"
  description: "给出 reactingMixture 热物性字典、janaf 系数区间、reactions 中 Ta 与 Ea 的换算关系，并用当量比与绝热火焰温估算判断该用有限速率还是平衡化学。"
  keywords:
    - "组分与反应"
    - "工程设置与参数选择"
    - "Arrhenius"
    - "janaf"
    - "当量比"
---

# 组分与反应：工程设置与参数选择

反应流的字典比纯流动多出两层耦合：组分热物性必须覆盖实际温度区间，反应速率参数必须与求解器选定的化学时间尺度匹配。这两处出错时，算例仍会收敛，只是温度场和组分场同时偏离。本文以甲烷-空气预混燃烧为基准，把当量比、绝热火焰温、Arrhenius 参数与化学求解器选择串成一条可核对的链条。

## 先算当量比与绝热火焰温

甲烷完全燃烧的化学计量式是 $\mathrm{CH_4+2(O_2+3.76N_2)\rightarrow CO_2+2H_2O+7.52N_2}$，理论空燃比为

$$\mathrm{AFR}_{st}=\frac{2\times32.00+7.52\times28.01}{16.04}=17.12$$

当量比定义为 $\phi=\mathrm{AFR}_{st}/\mathrm{AFR}$。$\phi=1$ 对应每 1 kg 甲烷配 17.12 kg 空气；$\phi=0.8$（贫燃）配 21.4 kg 空气；$\phi=1.2$（富燃）配 14.3 kg 空气。入口边界必须按这些质量分数设置，而不是按体积分数。

绝热火焰温可用焓平衡粗估：

$$T_{ad}=T_u+\frac{\mathrm{LHV}}{(1+\mathrm{AFR})\,C_{p,prod}}$$

甲烷 $\mathrm{LHV}=50.0\ \mathrm{MJ/kg}$，$\phi=1$ 时每 kg 燃料对应 18.12 kg 产物。取产物平均 $C_p=1.50\ \mathrm{kJ/(kg\,K)}$，得 $\Delta T=5.00\times10^{7}/(18.12\times1500)=1839\ \mathrm{K}$，$T_{ad}\approx300+1839=2139\ \mathrm{K}$。参考值为 2223 K，偏低 3.8%，差额来自 $C_p$ 随温度上升——这正是必须用 `janaf` 多项式而不是常数 $C_p$ 的原因。

## Arrhenius 参数与 Ta 的换算

OpenFOAM 的 `reactions` 字典用活化温度 $T_a$ 而不是活化能，两者关系是

$$k=A\,T^{\beta}\exp\left(-\frac{T_a}{T}\right),\qquad T_a=\frac{E_a}{R_u}$$

以 $T_a=24400\ \mathrm{K}$ 为例，$E_a=24400\times8.314=2.029\times10^{5}\ \mathrm{J/mol}$，即 202.9 kJ/mol。这个指数项对温度极其敏感：$T=1500\ \mathrm{K}$ 时 $\exp(-24400/1500)=1.07\times10^{-7}$，$T=2000\ \mathrm{K}$ 时 $\exp(-12.20)=5.04\times10^{-6}$，仅升高 500 K 速率就放大 47 倍。若把 $T_a$ 误填成 $E_a$ 的数值（202900），指数项恒为零，反应永不发生而求解器不报错——这是最隐蔽的一类设置错误。

## 热物性与反应字典

`reactingMixture` 需要为每个组分提供 janaf 系数与输运参数，`inertSpecie` 必须出现在组分列表中。

```cpp
// constant/thermophysicalProperties
thermoType
{
    type            hePsiThermo;
    mixture         reactingMixture;
    transport       sutherland;
    thermo          janaf;
    equationOfState perfectGas;
    specie          specie;
    energy          sensibleEnthalpy;
}
inertSpecie     N2;
species
(
    CH4
    {
        specie          { molWeight 16.043; }
        thermodynamics
        {
            Tlow        200;  Thigh 3500;  Tcommon 1000;
            lowCoeffs   (5.1499 0 -0.013 4.9e-05 -4.8e-08 1.5e-11 0 -1.0e+04 9.6);
            highCoeffs  (1.635 6.6e-03 -3.7e-06 9.7e-10 -9.4e-14 0 -1.0e+04 0.1);
        }
        transport       { As 1.0e-06; Ts 110.4; }
    }
    O2   { specie { molWeight 31.998; } /* 省略系数 */ }
    N2   { specie { molWeight 28.014; } /* 省略系数 */ }
    CO2  { specie { molWeight 44.010; } /* 省略系数 */ }
    H2O  { specie { molWeight 18.015; } /* 省略系数 */ }
);

// constant/reactions
reactions
(
    methaneOxidation
    {
        type            irreversibleArrheniusReaction;
        reaction        "CH4 + 2O2 = CO2 + 2H2O";
        A               2.119e11;
        beta            0;
        Ta              24400;      // K
    }
);
```

## 化学求解器与时间步选择

Damköhler 数 $Da=\tau_{flow}/\tau_{chem}$ 决定该用哪类模型。若流动时间 $\tau_{flow}=L/U=0.1/10=1.0\times10^{-2}\ \mathrm{s}$，而化学时间由火焰厚度与层流火焰速度给出 $\tau_{chem}=\delta_L/S_L=0.5\times10^{-3}/0.38=1.32\times10^{-3}\ \mathrm{s}$（甲烷-空气 $S_L=0.38\ \mathrm{m/s}$、$\delta_L\approx0.5\ \mathrm{mm}$），则 $Da=7.6$。$Da$ 在 1～50 之间属于有限速率与湍流混合同等重要的区间，应选 EDC 或 PaSR 而不是平衡化学。

```cpp
// constant/chemistryProperties
chemistryType
{
    solver          EulerImplicit;
    method          none;
}
chemistry       on;
initialChemicalTimeStep 1.0e-07;    // s
odeCoeffs
{
    solver          seulex;
    absTol          1e-12;
    relTol          1.0e-04;
}

// constant/combustionProperties
combustionModel EDC;
EDC
{
    C1              0.1;
    C2              0.1;
}
```

`initialChemicalTimeStep` 应比 $\tau_{chem}$ 小两个数量级，取 $1\times10^{-7}\ \mathrm{s}$ 对 $\tau_{chem}=1.3\times10^{-3}\ \mathrm{s}$ 是合适的。若取 $1\times10^{-4}\ \mathrm{s}$，刚性 ODE 求解器在点火瞬间会失败并把温度压回未燃值。

## 跨字典一致性检查点

| 检查项 | 三处必须一致 | 不一致的后果 |
|---|---|---|
| 组分集合 | `species` 列表、`reactions` 中出现的组分、`inertSpecie` | 构造机理时报未定义组分 |
| 元素守恒 | 反应式两侧 C/H/O/N 原子数 | 质量分数不守恒，温度漂移 |
| 温度区间 | `Tlow/Thigh` 与预计 $T_{ad}$ | janaf 外推产生虚假 $C_p$ |
| 活化参数 | $T_a$ 与 $E_a/R_u$ | 反应速率差 4 个数量级 |
| 能量变量 | `sensibleEnthalpy` 与 `0/h` | 求解器报缺少场文件 |
| 化学时间步 | `initialChemicalTimeStep` 与 $\tau_{chem}$ | 点火失败或计算量爆炸 |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 温度停在入口值不点火 | $T_a$ 填成了 $E_a$ | 检查 $T_a$ 是否在 $10^4$ 量级 |
| 温度超过 3500 K | `Thigh` 不足导致 janaf 外推 | 把 `Thigh` 提到 4000 并观察是否仍越界 |
| 组分质量分数之和偏离 1 | 反应式元素不守恒 | 手工配平反应式并核对原子数 |
| 点火延迟比实验短一个量级 | 用了平衡化学而非有限速率 | 比较 $Da$ 与 1 的关系 |
| 求解在点火时刻卡住 | `initialChemicalTimeStep` 过大 | 降到 $1\times10^{-7}\ \mathrm{s}$ 重试 |
| 贫燃工况温度反而更高 | 入口质量分数按体积分数填写 | 用 AFR 与 $\phi$ 重算质量分数 |

## 参考文献

1. Westbrook C.K., Dryer F.L., "Simplified Reaction Mechanisms for the Oxidation of Hydrocarbon Fuels in Flames," Combustion Science and Technology, 1981.
2. Turns S.R., An Introduction to Combustion: Concepts and Applications, 3rd ed., McGraw-Hill, 2012.
3. Poinsot T., Veynante D., Theoretical and Numerical Combustion, 2nd ed., Edwards, 2005.
4. Kee R.J., Rupley F.M., Miller J.A., "The Chemkin Thermodynamic Data Base," Sandia National Laboratories Report SAND87-8215B, 1990.
5. OpenFOAM Foundation, reactingFoam 教程与 User Guide（当前发行版，thermophysical 与 chemistry 章节）.
