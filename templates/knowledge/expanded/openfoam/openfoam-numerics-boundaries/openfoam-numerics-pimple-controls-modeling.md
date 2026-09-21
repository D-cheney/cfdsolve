---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-pimple-controls-modeling
title: "PIMPLE 与松弛控制：设置机理与适用范围"
summary: "从动量预测、压力方程与速度修正三步导出 PIMPLE 的外迭代结构，解释 SIMPLE 与 PISO 各自的适用区间，给出松弛因子作为固定点加速器的机理与 Courant 数对时间步的约束。"
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
  - "PIMPLE 与松弛控制"
  - "设置机理与适用范围"
  - "压力方程"
  - "松弛因子"
seo:
  title: "PIMPLE 与松弛控制：设置机理与适用范围"
  description: "从动量预测、压力方程与速度修正三步导出 PIMPLE 的外迭代结构，解释 SIMPLE 与 PISO 各自的适用区间，给出松弛因子作为固定点加速器的机理与 Courant 数对时间步的约束。"
  keywords:
    - "PIMPLE 与松弛控制"
    - "设置机理与适用范围"
    - "压力方程"
    - "松弛因子"
    - "Courant 数"
---

# PIMPLE 与松弛控制：设置机理与适用范围

PIMPLE 把 SIMPLE 的亚松弛和 PISO 的多次压力修正合成一个算法：每个时间步内做若干次外迭代，每次外迭代里做若干次压力修正，动量方程可以选择是否先做预测。理解这套结构的关键是压力方程从哪里来，以及松弛因子为什么能加速而不是拖慢收敛。本文给出三步推导、算法谱系对照和适用边界。

## 三步：动量预测、压力方程、速度修正

离散动量方程可以整理成对角系数 $A_P$ 与邻居贡献 $\mathbf{H}(\mathbf{u})$ 两部分：

$$
A_P\mathbf{u}_P=\mathbf{H}(\mathbf{u})-\nabla p
$$

把 $\mathbf{u}_P=\mathbf{H}/A_P-\nabla p/A_P$ 代入连续性方程 $\nabla\cdot\mathbf{u}=0$，得到压力方程：

$$
\nabla\cdot\left(\frac{1}{A_P}\nabla p\right)=\nabla\cdot\left(\frac{\mathbf{H}}{A_P}\right)
$$

这就是 PISO/PIMPLE 的核心。$\mathbf{H}/A_P$ 是"不含压力梯度的预测速度"，左端是一个带变系数的拉普拉斯算子。求解它得到压力，再用 $\mathbf{u}_P=\mathbf{H}/A_P-\nabla p/A_P$ 修正速度。整个循环的每一步都只解一个标量方程加一次显式修正，成本远低于直接解耦合的速度—压力系统。Rhie–Chow 插值的作用是在面上构造出能抑制棋盘格压力的 $\mathbf{H}/A_P$ 面值，这一项缺了，压力场会出现棋盘振荡。

## 亚松弛：为什么 $\alpha<1$ 反而更快

亚松弛把新解与旧解按权重混合：

$$
\phi^{(n+1)}=(1-\alpha)\,\phi^{(n)}+\alpha\,\phi^{*}
$$

$\alpha=1$ 就是不加松弛。直觉上 $\alpha$ 越大收敛越快，但压力—速度耦合是一个固定点迭代，其谱半径可能大于 1；亚松弛的作用是把迭代矩阵的谱半径压到 1 以内，用每步更小的推进换取不振荡。典型取值：速度 $\alpha=0.7$、压力 $\alpha=0.3$ 用于稳态 SIMPLE；瞬态 PIMPLE 里速度可以放到 0.9 甚至不松弛，因为时间项本身提供了对角优势。

判断松弛是否合适的量化指标是外迭代残差的收缩比。若连续两次外迭代的残差之比稳定在 0.2～0.5，说明松弛恰当；若比值在 0.9 以上徘徊，说明 $\alpha$ 太小；若残差出现周期性振荡，说明 $\alpha$ 太大。

## 算法谱系与适用区间

| 算法 | 外迭代 | 压力修正 | 时间项 | 适用 |
|---|---|---|---|---|
| SIMPLE | 无 | 1 | 无 | 稳态，强松弛 |
| PISO | 1 | 2～4 | 有 | 瞬态，小 Courant，无需松弛 |
| PIMPLE | 2～4 | 1～2 | 有 | 瞬态，大 Courant，可作稳态替代 |

PIMPLE 的价值在于它允许 Courant 数远大于 1。PISO 要求 $Co<1$ 才能保证压力修正与对流同步；PIMPLE 通过外迭代反复更新动量预测，把 $Co$ 放宽到 5～10 仍能稳定。代价是每个时间步的计算量按外迭代次数线性增加。

时间步的上限由 Courant 数给出：

$$
\Delta t\le\frac{Co_{max}}{\max_P\left(\frac{1}{2V_P}\sum_f|\phi_f|\right)}
$$

分母是每个单元的面通量绝对值之和除以两倍体积，量纲为 $\mathrm{s^{-1}}$。以 $0.01\ \mathrm{m}$ 网格、$2\ \mathrm{m/s}$ 来流为例，单元尺度上的特征频率约为 $2/0.01=200\ \mathrm{s^{-1}}$，$Co_{max}=2$ 对应 $\Delta t\approx10^{-2}\ \mathrm{s}$；若把 $Co_{max}$ 放到 10，$\Delta t$ 可以取到 $5\times10^{-2}\ \mathrm{s}$，但时间离散误差会把高频结构抹平。

```cpp
PIMPLE
{
    nOuterCorrectors   2;      // 每个时间步的外迭代次数
    nCorrectors        2;      // 每次外迭代内的压力修正次数
    nNonOrthogonalCorrectors 1;
    momentumPredictor  yes;    // 先解动量再解压力
    pRefCell           0;
    pRefValue          0;
}
```

```cpp
relaxationFactors
{
    fields    { p 0.3; }
    equations { U 0.7; k 0.7; epsilon 0.7; }
}
```

瞬态 PIMPLE 通常把 `relaxationFactors` 全部设为 1（即不松弛），因为外迭代本身承担了收敛职责；只有在 `nOuterCorrectors 1` 的准 PISO 模式下才需要显式松弛。稳态求解器用 PIMPLE 时则应保留 SIMPLE 那套松弛因子，并配合 `residualControl` 判断收敛。

## PIMPLE 设置何时失效

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场出现棋盘格 | Rhie–Chow 项失效或网格存在奇偶失耦 | 换更小的 `pRefCell` 邻域，检查压力二阶差分 |
| 外迭代残差比值停在 0.9 以上 | 松弛因子过小 | 把 $\alpha$ 从 0.3 提到 0.5，观察收缩比 |
| 残差随外迭代周期性振荡 | 松弛因子过大 | 把速度 $\alpha$ 从 0.9 降到 0.7 |
| 增大 `nOuterCorrectors` 后结果不变 | 已收敛到时间离散误差主导 | 对比 `Co` 减半后的结果 |
| 每个时间步的连续性误差超过 $10^{-4}$ | 压力修正次数不足 | 把 `nCorrectors` 从 1 提到 2 |

判断 PIMPLE 设置是否够用的标准是：把 `nOuterCorrectors` 加一再跑一遍，关键工程量是否变化小于工程容差；以及把 `maxCo` 减半后结果是否稳定。两个方向都稳定，才说明时间推进与内迭代都已经受控。

## 参考文献

1. Issa R.I., *Solution of the implicitly discretised fluid flow equations by operator-splitting*, Journal of Computational Physics, 62(1), 40–65, 1986.
2. Patankar S.V., Spalding D.B., *A calculation procedure for heat, mass and momentum transfer in three-dimensional parabolic flows*, International Journal of Heat and Mass Transfer, 15(10), 1787–1806, 1972.
3. Rhie C.M., Chow W.L., *Numerical study of the turbulent flow past an airfoil with trailing edge separation*, AIAA Journal, 21(11), 1525–1532, 1983.
4. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
5. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
6. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.5 Solution and Algorithm Control, 2024.
