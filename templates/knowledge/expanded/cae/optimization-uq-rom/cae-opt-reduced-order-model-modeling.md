---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-reduced-order-model-modeling
title: "降阶模型：方法原理与适用范围"
summary: "从 Kolmogorov n-width 给出降阶精度的理论上限，推导 POD 能量截断判据并完成一次奇异值手算，说明 Galerkin 与 LSPG 的分界、DEIM 超降阶点数以及 DMD 秩与线性度指标的选取。"
category:
  slug: optimization-uq-rom
  name: "优化、不确定性与降阶"
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "优化、不确定性与降阶"
  - "降阶模型"
  - "方法原理与适用范围"
  - "POD 能量截断"
  - "DEIM 超降阶"
seo:
  title: "降阶模型：方法原理与适用范围"
  description: "从 Kolmogorov n-width 给出降阶精度的理论上限，推导 POD 能量截断判据并完成一次奇异值手算，说明 Galerkin 与 LSPG 的分界、DEIM 超降阶点数以及 DMD 秩与线性度指标的选取。"
  keywords:
    - "降阶模型"
    - "方法原理与适用范围"
    - "POD"
    - "DEIM"
    - "n-width"
---

# 降阶模型：方法原理与适用范围

降阶模型的精度上限由解流形的固有维数决定，而不是由算法决定。选错问题类型（对流主导、强间断）时，任何基函数都无法把误差压到 1% 以下。本文给出三类判据：n-width 判据、能量判据与线性度判据。

## 精度上限由 n-width 决定

$$ d_n(\mathcal{M})=\inf_{\dim V=n}\ \sup_{u\in\mathcal{M}}\ \inf_{v\in V}\left\lVert u-v\right\rVert $$

$\mathcal{M}$ 是参数变化下解的集合。$d_n$ 衰减快（指数或代数 $n^{-\alpha}$，$\alpha\ge2$）时 ROM 才有效；对流主导问题 $d_n$ 衰减极慢，必须用变换坐标或非线性降阶，否则加到 100 阶也只能到 5% 误差。

## POD 能量截断判据与一次手算

快照矩阵 $X$ 的 SVD 给出奇异值 $\sigma_k$，取最小 $r$ 使

$$ \frac{\sum_{k=1}^{r}\sigma_k^{2}}{\sum_{k=1}^{n}\sigma_k^{2}}\ge0.999 $$

手算一组：$\sigma=[10,\ 3,\ 1,\ 0.5]$，则 $\sigma^2=[100,\ 9,\ 1,\ 0.25]$，总和 110.25。$r=1$ 得 90.7%，$r=2$ 得 98.87%，$r=3$ 得 99.77%，均低于 0.999；必须取 $r=4$ 才达到 100%。这说明"取到 99% 就够"的想法在本例会留下 1.2% 量级的误差。

## Galerkin 投影与稳定性分界

把解写成 $\mathbf{q}\approx\Phi\mathbf{a}$，代入离散方程并左乘 $\Phi^{\top}$：

$$ \Phi^{\top}R\left(\Phi\mathbf{a};\mu\right)=\mathbf{0} $$

$n=10^{6}$ 个自由度、$r=20$ 时在线求解规模从 $10^{6}$ 降到 20，单步成本下降约 $5\times10^{4}$ 倍。但对流主导问题中 Galerkin 投影会产生伪模态，应改用最小二乘 Petrov–Galerkin（LSPG），代价是每步多一次最小二乘求解。

## 非线性项必须超降阶

非线性项在满维求值的代价会抵消降维收益。DEIM 用采样矩阵 $P$ 选取 $m$ 个插值点：

$$ \hat{\mathbf{f}}(\mathbf{x})\approx\Phi_f\left(P^{\top}\Phi_f\right)^{-1}P^{\top}\mathbf{f}(\mathbf{x}) $$

$m$ 通常取 $2r$ 到 $3r$，$r=20$ 时 $m=40\sim60$，非线性项求值成本再降一个量级。$m<r$ 会让系数矩阵秩亏，插值失效。

## DMD 的秩与适用域

把相邻快照写成线性映射 $X'\approx AX$，用截断 SVD 求低秩近似：

$$ A\approx X'\hat{V}\hat{\Sigma}^{-1}\hat{U}^{\top} $$

秩取能量 99.9% 对应的值，通常 10～30。DMD 只适合拟线性动力学：若模态增长率随采样窗口改变超过 20%，说明系统非线性强，DMD 预测不可用，应改用算子推断或参数化 DMD。

## 判据表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 能量到 99.9% 但真误差 5% | 能量范数与目标量不一致 | 改按目标量加权范数截断 |
| 加密快照数量误差不降 | n-width 衰减慢 | 估计 $d_n$ 的衰减率 |
| 在线出现非物理振荡 | Galerkin 投影不稳定 | 改用 LSPG 对照 |
| 加速比只有 3 倍 | 非线性项未超降阶 | 加 DEIM，$m=2r$ |
| DMD 模态随窗口变化 | 强非线性 | 缩短窗口或改参数化 DMD |
| $m<r$ 时系数矩阵秩亏 | DEIM 点数不足 | $m$ 提到 $2r=40$ |

```python
import numpy as np

def pod_basis(X, energy=0.999):
    U, s, _ = np.linalg.svd(X, full_matrices=False)
    frac = np.cumsum(s ** 2) / np.sum(s ** 2)
    r = int(np.searchsorted(frac, energy) + 1)
    return U[:, :r], s, r

s = np.array([10.0, 3.0, 1.0, 0.5])
print(np.cumsum(s ** 2) / np.sum(s ** 2))   # [0.907 0.989 0.998 1.000]
print(pod_basis(np.diag(s))[2])             # 4
```

## 参考文献

1. Benner P., Gugercin S., Willcox K., "A survey of projection-based model reduction methods for parametric dynamical systems," *SIAM Review*, 57, 2015.
2. Berkooz G., Holmes P., Lumley J.L., "The proper orthogonal decomposition in the analysis of turbulent flows," *Annual Review of Fluid Mechanics*, 25, 1993.
3. Chaturantabut S., Sorensen D.C., "Nonlinear model reduction via discrete empirical interpolation," *SIAM Journal on Scientific Computing*, 32, 2010.
4. Schmid P.J., "Dynamic mode decomposition of numerical and experimental data," *Journal of Fluid Mechanics*, 656, 2010.
5. Quarteroni A., Manzoni A., Negri F., *Reduced Basis Methods for Partial Differential Equations: An Introduction*, Springer, 2016.
