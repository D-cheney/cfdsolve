---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-buoyancy-flow-modeling
title: "浮力与自然对流：物理建模与适用边界"
summary: "从 Boussinesq 近似的密度误差出发，说明浮力在动量方程与湍流输运方程中的落点、封闭腔与开口边界的处理方式，并给出 Rayleigh-Bénard 临界值与热边界层网格的量化判据。"
category:
  slug: physics
  name: "流体力学基础"
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "流体力学基础"
  - "浮力与自然对流"
  - "物理建模与适用边界"
  - "Boussinesq 近似"
  - "浮力生成项"
seo:
  title: "浮力与自然对流：物理建模与适用边界"
  description: "从 Boussinesq 近似的密度误差出发，说明浮力在动量方程与湍流输运方程中的落点、封闭腔与开口边界的处理方式，并给出 Rayleigh-Bénard 临界值与热边界层网格的量化判据。"
  keywords:
    - "浮力与自然对流"
    - "物理建模与适用边界"
    - "Boussinesq 近似"
    - "浮力生成项"
---

# 浮力与自然对流：物理建模与适用边界

浮力项写错位置或密度模型选得过粗，会让整个算例在正确的网格上解一个错误的方程。本文只讨论建模层面的三个决定：用 Boussinesq 还是变密度、浮力项落在动量方程与 $k$ 方程的哪一处、以及边界与域尺寸如何决定解的物理性。每条结论都给出可核算的数字，便于判断当前工况是否越界。

## 1 Boussinesq 近似的误差到底有多大

Boussinesq 近似只保留密度随温度变化的一阶项：

$$
\rho(T) = \rho_0\left[1-\beta\left(T-T_0\right)\right], \qquad \beta = -\frac{1}{\rho}\left(\frac{\partial \rho}{\partial T}\right)_p
$$

对理想气体 $\beta = 1/T_0$。近似成立的常用判据是 $\beta\Delta T \lesssim 0.1$，即密度变化不超过 10%。核算两档温差：

- $\Delta T = 20\,\mathrm{K}$、$T_0 = 300\,\mathrm{K}$：$\beta\Delta T = 20/300 = 0.067$，密度变化 6.7%，Boussinesq 可用。
- $\Delta T = 100\,\mathrm{K}$：$\beta\Delta T = 0.333$，密度变化 28%，此时必须改用理想气体状态方程的变密度求解器，否则热羽流上升速度会被系统性低估。

注意除密度外的物性（$\mu$、$k$、$c_p$）在 Boussinesq 框架下仍被当作常数。若 $\Delta T$ 跨越大范围，空气黏度在 300～500 K 间从 $1.85\times10^{-5}$ 升到 $2.67\times10^{-5}\,\mathrm{Pa\cdot s}$（+44%），这个变化与浮力项同阶，也需要一并评估。

## 2 浮力项在动量方程中的写法

不可压 Boussinesq 求解器把浮力作为体积力加入动量方程，并把参考密度并入修正压力：

$$
\frac{\partial \mathbf{u}}{\partial t} + \left(\mathbf{u}\cdot\nabla\right)\mathbf{u} = -\nabla p_{rgh} + \nabla\cdot\left(\nu\nabla\mathbf{u}\right) + \left[1-\beta\left(T-T_0\right)\right]\mathbf{g}
$$

其中 $p_{rgh} = p - \rho_0\,\mathbf{g}\cdot\mathbf{x}$ 是修正压力，它把静水压从压力场中扣除。这一步是浮力算例最容易出错的地方：若求解器使用的是 $p_{rgh}$，那么压力边界必须给修正压力（开口处通常为 0），直接给绝对压力会让整个压力场平移一个 $\rho_0 g H$。对 $H = 2\,\mathrm{m}$ 的空气柱，这个偏差约 $1.18\times9.81\times2 = 23\,\mathrm{Pa}$，看似不大，但对以 Pa 为量级的自然对流压差已经是致命量级。

## 3 湍流方程里的浮力生成项

标准 $k$-$\varepsilon$ 需要额外提供浮力生成项，否则热分层对湍流强度的影响完全丢失：

$$
G_k = -\frac{\mu_t}{\rho\,\sigma_T}\frac{\partial \rho}{\partial x_i}g_i
= \beta\,\frac{\mu_t}{\sigma_T}\,g\,\frac{\partial T}{\partial y}
$$

（取重力沿 $-y$ 方向，$\sigma_T$ 为湍流普朗特数，空气常取 0.85。）符号决定效果：热面向上时 $\partial T/\partial y < 0$，$G_k > 0$，湍流被增强；稳定分层时 $G_k < 0$，湍流被抑制。稳定分层下 $G_k$ 可能超过耗散项，若不施加限制会导致 $k$ 出现负值，因此多数实现会对 $G_k$ 做上限约束或改用 $\mu_t/\mu$ 的 Richardson 数修正。

判断是否需要打开浮力项，用梯度理查森数：

$$
Ri_g = \frac{g\beta\,\partial T/\partial y}{\left(\partial U/\partial y\right)^{2}}
$$

$|Ri_g| \gg 1$ 表示浮力主导湍流生成，必须打开 $G_k$。

## 4 流动区制与临界值

封闭腔的传热强弱由瑞利数决定，封闭腔换热常用 Globe-Dropkin 关联式（$3\times10^{5} < Ra < 7\times10^{9}$）：

$$
Nu = 0.069\,Ra^{1/3}\,Pr^{0.074}
$$

核算一个 $H = 0.5\,\mathrm{m}$、$\Delta T = 20\,\mathrm{K}$ 的空气腔体：$Ra = 9.81 \times 3.33\times10^{-3} \times 20 \times 0.5^{3} / (1.57\times10^{-5}\times2.2\times10^{-5}) = 2.37\times10^{8}$，$Ra^{1/3} = 618.6$，$Pr^{0.074} = 0.975$，得 $Nu = 0.069\times618.6\times0.975 = 41.6$，壁面热流 $q = Nu\,k\Delta T/H = 41.6\times0.0262\times20/0.5 = 43.6\,\mathrm{W/m^2}$。

底部加热的水平流体层另有硬阈值：Rayleigh-Bénard 对流在 $Ra_c = 1708$ 处起始（刚性上下边界）。低于该值只有纯导热，任何"解出对流胞"的结果都说明边界或初始条件引入了扰动。这条判据在验证求解器时非常有用。

## 5 网格与边界：热边界层才是限制

自然对流不需要解析黏性底层，但必须解析热边界层。其厚度可由 $Nu$ 估计：

$$
\delta_T \approx \frac{H}{Nu}
$$

上例中 $\delta_T \approx 0.5/41.6 = 12\,\mathrm{mm}$，要求壁面法向至少 5 层单元落在 $\delta_T$ 内，即首层厚度约 1～2 mm，增长率不超过 1.2。开口边界则应给总压与温度（entrainment 方向），并把计算域向外扩到 $5H$ 以上，否则卷吸流被壁面人为阻断，$Nu$ 会偏高 10% 以上。

OpenFOAM 中一个可直接套用的 Boussinesq 物性字典：

```cpp
// constant/thermophysicalProperties
thermophysicalProperties
{
    type            Boussinesq;
    mixture         pureMixture;
    transport       const;
    thermo          hConst;
    equationOfState Boussinesq;
    specie          pureMixture;

    mixture
    {
        beta        3.33e-03;   // 1/K
        T0          300;        // K
        rho0        1.18;       // kg/m^3
        mu          1.85e-05;   // Pa.s
        Pr          0.71;
        Cp          1005;       // J/(kg.K)
        Hf          0;
    }
}

// constant/g
dimensions      [0 1 -2 0 0 0 0];
value           (0 -9.81 0);
```

## 6 适用边界与失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 热羽流上升速度比经验值低 30% 以上 | $\beta\Delta T > 0.1$ 却仍用 Boussinesq | 计算 $\beta\Delta T$，超过 0.1 换变密度求解器复算 |
| 压力场整体偏移约 $\rho_0 gH$ | 把绝对压力赋给了修正压力边界 | 检查压力边界类型与量纲，改回 $p_{rgh}$ 口径 |
| 稳定分层区 $k$ 出现负值或爆掉 | $G_k$ 未做上限约束 | 监控 $G_k/\varepsilon$，必要时限制或改用代数热通量模型 |
| 底加热腔在 $Ra = 800$ 时出现对流胞 | 初始扰动或侧壁边界引入非物理对流 | 用纯导热初值重算，确认 $Ra < 1708$ 时 $Nu \to 1$ |
| $Nu$ 比关联式高 15% 且随域尺寸变化 | 开口域太小，卷吸被阻断 | 把域扩到 $5H$ 以上重算，看 $Nu$ 是否回落 |
| 网格加密后 $Nu$ 持续漂移 | 热边界层内单元数不足 | 统计 $\delta_T$ 内层数，补到 5 层以上 |

## 7 建模选择清单

1. 由 $\beta\Delta T$ 判断 Boussinesq 是否成立，必要时切换变密度。
2. 明确求解器的压力口径是绝对压力还是修正压力，边界条件与之匹配。
3. 热分层显著时打开湍流方程的浮力生成项，并检查其符号与幅值。
4. 封闭腔传热先核对 $Ra$ 落在哪条关联式的有效区间。
5. 用 $\delta_T = H/Nu$ 估算热边界层厚度，据此定首层厚度与增长率。
6. 开口算例的域尺寸要能容纳卷吸流，且外边界给温度与总压。

## 8 参考文献

1. Gray D.D., Giorgini A., "The Validity of the Boussinesq Approximation for Liquids and Gases," *International Journal of Heat and Mass Transfer*, 1976.
2. de Vahl Davis G., "Natural Convection of Air in a Square Cavity: A Bench Mark Numerical Solution," *International Journal for Numerical Methods in Fluids*, 1983.
3. Henkes R.A.W.M., van der Vlugt F.F., Hoogendoorn C.J., "Natural-Convection Flow in a Square Cavity Calculated with Low-Reynolds-Number Turbulence Models," *International Journal of Heat and Mass Transfer*, 1991.
4. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
