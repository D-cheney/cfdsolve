---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-convection-schemes-modeling
title: "divSchemes 对流格式：设置机理与适用范围"
summary: "从面值重构、限制器函数与 Godunov 定理出发解释 divSchemes 对流格式的作用机理，给出网格 Péclet 数与数值耗散的量级判据，说明一阶迎风、linearUpwind 与 limitedLinear 各自何时成立、何时必须换档。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "divSchemes 对流格式"
  - "设置机理与适用范围"
  - "限制器"
  - "数值耗散"
seo:
  title: "divSchemes 对流格式：设置机理与适用范围"
  description: "从面值重构、限制器函数与 Godunov 定理出发解释 divSchemes 对流格式的作用机理，给出网格 Péclet 数与数值耗散的量级判据，说明一阶迎风、linearUpwind 与 limitedLinear 各自何时成立、何时必须换档。"
  keywords:
    - "divSchemes 对流格式"
    - "设置机理与适用范围"
    - "限制器函数"
    - "网格 Péclet 数"
    - "Godunov 定理"
---

# divSchemes 对流格式：设置机理与适用范围

`divSchemes` 里 `div(phi,U)` 一行决定动量方程的对流通量在面上取什么值，也决定结果是有界光滑还是过冲振荡。一阶迎风在任何网格上都无条件有界，代价是把扩散项人为放大几个数量级；中心差分二阶精确，却要求单元 Péclet 数不超过 2，工程网格几乎不可能满足。本文把面值重构、限制器函数与 Godunov 定理串成一条机理链，并给出判断该用哪一档格式的量化边界。

## 对流通量离散的真正未知量

有限体积把对流体散度在控制体 $V_P$ 上积分，用散度定理转成面积分：

$$
\int_{V_P}\nabla\cdot(\rho\phi\mathbf{u})\,dV=\sum_f \rho_f\phi_f\mathbf{u}_f\cdot\mathbf{S}_f
$$

$\mathbf{S}_f$ 是面外法向面积矢量，量纲 $\mathrm{m^2}$。单元中心值 $\phi_P$、$\phi_N$ 是已知量，未知的只有面值 $\phi_f$，所以对流格式的全部工作就是用一个重构规则把两个中心值组合成面值。这一步不破坏守恒性——只要相邻单元共用的那个面只有一个面值，通量必然成对抵消——但它完全决定离散系统的单调性。

## 迎风、中心与限制器如何组合出面值

把面值写成迎风值加一个受限制的修正量：

$$
\phi_f=\phi_P+\frac{1}{2}\psi(r)\left(\phi_N-\phi_P\right),\qquad r=\frac{\phi_P-\phi_W}{\phi_N-\phi_P}
$$

$r$ 是上游梯度比，$\psi(r)$ 是限制器函数。$\psi\equiv 0$ 退化为严格一阶迎风，$\psi\equiv 1$ 就是中心差分；Sweby 限制器 $\psi(r)=\max\left[0,\min(2r,1),\min(r,2)\right]$ 在 TVD 区域内取值，OpenFOAM 的 `limitedLinear` 实现为对 $\psi=2\min(r,1)$ 再截断到 $[0,2]$。$\psi$ 越接近 0，面值越贴近迎风值，数值耗散越大；越接近 2，越接近二阶中心。因此限制器系数不是精度旋钮，而是耗散与振荡之间的连续权衡。

数值耗散可以估出量级。一阶迎风的等效扩散系数约为 $\Gamma_{num}\approx \rho u\Delta x/2$。取空气 $\rho=1.2\ \mathrm{kg/m^3}$、$u=20\ \mathrm{m/s}$、$\Delta x=0.004\ \mathrm{m}$，得

$$
\Gamma_{num}\approx\frac{1.2\times20\times0.004}{2}=0.048\ \mathrm{Pa\cdot s}
$$

而空气分子黏度只有 $1.8\times10^{-5}\ \mathrm{Pa\cdot s}$，两者相差约 2700 倍。这就解释了一阶迎风为什么把温度或浓度前沿抹宽：在该网格上，标量输运的扩散几乎完全由数值耗散而不是物性决定。

## 有界性与单调性：高阶为什么必须配限制器

把离散写成 $a_P\phi_P=\sum_N a_N\phi_N+b_P$ 后，只要邻居系数非负且对角占优，无源处就不会产生新极值。中心差分对应的系数为

$$
a_E=D-\frac{F}{2},\qquad a_W=D+\frac{F}{2},\qquad F=\rho u A,\qquad D=\frac{\Gamma A}{\Delta x}
$$

$F$ 是对流通量（$\mathrm{kg/s}$），$D$ 是扩散导度。$a_E\ge0$ 要求 $|F|\le2D$，即单元 Péclet 数 $|Pe_\Delta|=|F|/D\le2$。仍用上面的空气参数：$F=1.2\times20\times A=24A$，$D=1.8\times10^{-5}A/0.004=4.5\times10^{-3}A$，于是

$$
Pe_\Delta=\frac{24A}{4.5\times10^{-3}A}\approx 5300
$$

比安全上限 2 高出三个数量级，中心差分在这种网格上必然振荡。把 $Pe_\Delta$ 压回 2 需要 $\Delta x\approx1.5\times10^{-6}\ \mathrm{m}$，对 $1\ \mathrm{m}$ 长的计算域意味着十亿量级的网格，工程上不可行——这正是必须引入限制器而不是一味加密的原因。

量级判断可以固化成一段可复算的估算，改几个数就能套到新工况上：

```text
输入: rho = 1.2 kg/m^3, u = 20 m/s, dx = 0.004 m, mu = 1.8e-5 Pa·s
F/A  = rho*u        = 24.0        kg/(m^2·s)
D/A  = mu/dx        = 4.5e-3      kg/(m^2·s)
Pe   = (F/A)/(D/A)  = 5.3e3       远大于安全上限 2
结论: 中心差分无界，必须使用 bounded 高阶格式或限制器
```

Godunov 定理给出更根本的限制：任何线性、守恒且单调的格式至多一阶精度。想同时拿到高阶与有界，格式必须是非线性的，即限制器依赖当地解。这条定理解释了为什么 `bounded` 前缀和限制器不是可选项，而是高阶对流在真实网格上能用的前提条件。

## 格式档位与适用边界

| 格式 | 精度 | 有界性 | 典型适用场合 |
|---|---|---|---|
| `Gauss upwind` | 一阶 | 无条件有界 | 启动调试、极端畸变网格 |
| `Gauss linearUpwind grad(U)` | 二阶 | 需配 `bounded` | 光滑内流、外流主力格式 |
| `Gauss limitedLinear 1` | 二阶级 | 有界 | 湍流量、标量输运 |
| `Gauss linear` | 二阶 | 无界 | 高正交网格、小时间步 LES |

一个可直接用于不可压缩求解器的起点：

```cpp
divSchemes
{
    default                         none;
    div(phi,U)                      bounded Gauss linearUpwind grad(U);
    div(phi,k)                      bounded Gauss limitedLinear 1;
    div(phi,epsilon)                bounded Gauss limitedLinear 1;
    div(phi,omega)                  bounded Gauss limitedLinear 1;
    div(phi,nuTilda)                bounded Gauss limitedLinear 1;
    div((nuEff*dev2(T(grad(U)))))   Gauss linear;
}
```

`default none` 是有意设置：任何未显式列出的 `div` 项都会让求解器直接报错，避免新加的方程悄悄落在一个没被验证过的格式上。相分数、质量分数这类有硬边界的量要把限制器收紧到 `limitedLinear01 1` 或 `Minmod`，因为 `limitedLinear 1` 只保证不产生新极值，并不保证结果落在 $[0,1]$ 区间内。

## 对流格式的失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 标量出现负值或大于 1 的峰 | 高阶格式缺限制器或未加 `bounded` | 分别关掉 `bounded` 和限制器各跑一次，看极值是否消失 |
| 温度前沿明显宽于网格尺度 | 限制器退化到迎风 | 统计 $\psi<0.05$ 的单元占比，超过 30% 说明网格不足或格式过保守 |
| 加密网格后阻力反而上升 | 格式误差与网格误差混叠 | 固定格式只加密网格，检查阻力是否单调趋稳 |
| 加 `bounded` 后残差停在 $10^{-3}$ | 延迟修正的显式项未收敛 | 增加外迭代次数，观察残差是否继续下降 |

判断格式是否够用的标准不是残差降到多小，而是关键工程量在网格与格式双重扰动下是否稳定。若把 `linearUpwind` 换成 `limitedLinear 1` 后目标量变化小于工程容差，说明对流离散已不是误差主导项；若变化显著，正确做法是继续加密网格，而不是在几档格式里挑一个看起来最顺眼的结果。

## 参考文献

1. Godunov S.K., *A difference method for numerical calculation of discontinuous solutions of the equations of hydrodynamics*, Matematicheskii Sbornik, 47(3), 271–306, 1959.
2. Sweby P.K., *High resolution schemes using flux limiters for hyperbolic conservation laws*, SIAM Journal on Numerical Analysis, 21(5), 995–1011, 1984.
3. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
4. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
5. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
6. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
