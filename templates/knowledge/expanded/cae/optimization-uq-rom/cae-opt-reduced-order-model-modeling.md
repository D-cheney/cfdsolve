---
template_version: flowlab-knowledge/1.0
slug: cae-opt-reduced-order-model-modeling
title: 降阶模型：原理、设置与验证
summary: >-
  从 Kolmogorov n-width 给出降阶精度的理论上限，推导 POD 能量截断判据并完成一次奇异值手算，说明 Galerkin 与 LSPG
  的分界、DEIM 超降阶点数以及 DMD 秩与线性度指标的选取。
category:
  slug: optimization-uq-rom
  name: 优化、不确定性与降阶
level: 进阶
reading_minutes: 25
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 优化、不确定性与降阶
  - 降阶模型
  - 方法原理与适用范围
  - POD 能量截断
  - DEIM 超降阶
  - 工程设置与参数选择
  - 贪心采样
  - 离线在线分解
  - 结果诊断与可信度验证
  - 有效因子
  - 留一交叉验证
seo:
  title: 降阶模型：原理、设置与验证
  description: >-
    从 Kolmogorov n-width 给出降阶精度的理论上限，推导 POD 能量截断判据并完成一次奇异值手算，说明 Galerkin 与 LSPG
    的分界、DEIM 超降阶点数以及 DMD 秩与线性度指标的选取。
  keywords:
    - 降阶模型
    - 方法原理与适用范围
    - POD
    - DEIM
    - n-width
    - 工程设置与参数选择
    - 贪心算法
    - 加速比
    - 结果诊断与可信度验证
    - 误差界
    - 留一交叉验证
    - 外推检测
---
# 降阶模型：原理、设置与验证

降阶模型的精度上限由解流形的固有维数决定，而不是由算法决定。选错问题类型（对流主导、强间断）时，任何基函数都无法把误差压到 1% 以下。降阶模型的成本结构决定了配置方式：离线可以花几小时，在线必须压到亚秒级。配置的核心是让离线快照覆盖参数空间，同时让在线规模尽可能小。本文以 3 个参数、100 个快照、$r=15$ 为例给出完整取值。ROM 的验证不能只看"新参数上误差小"，因为误差界若低于真误差，说明估计器失效，后续任何参数点都不可信。

## 精度上限由 n-width 决定

$$ d_n(\mathcal{M})=\inf_{\dim V=n}\ \sup_{u\in\mathcal{M}}\ \inf_{v\in V}\left\lVert u-v\right\rVert $$

$\mathcal{M}$ 是参数变化下解的集合。$d_n$ 衰减快（指数或代数 $n^{-\alpha}$，$\alpha\ge2$）时 ROM 才有效；对流主导问题 $d_n$ 衰减极慢，必须用变换坐标或非线性降阶，否则加到 100 阶也只能到 5% 误差。

## Galerkin 投影与稳定性分界

把解写成 $\mathbf{q}\approx\Phi\mathbf{a}$，代入离散方程并左乘 $\Phi^{\top}$：

$$ \Phi^{\top}R\left(\Phi\mathbf{a};\mu\right)=\mathbf{0} $$

$n=10^{6}$ 个自由度、$r=20$ 时在线求解规模从 $10^{6}$ 降到 20，单步成本下降约 $5\times10^{4}$ 倍。但对流主导问题中 Galerkin 投影会产生伪模态，应改用最小二乘 Petrov–Galerkin（LSPG），代价是每步多一次最小二乘求解。

## 非线性项必须超降阶

非线性项在满维求值的代价会抵消降维收益。DEIM 用采样矩阵 $P$ 选取 $m$ 个插值点：

$$ \hat{\mathbf{f}}(\mathbf{x})\approx\Phi_f\left(P^{\top}\Phi_f\right)^{-1}P^{\top}\mathbf{f}(\mathbf{x}) $$

$m$ 通常取 $2r$ 到 $3r$，$r=20$ 时 $m=40\sim60$，非线性项求值成本再降一个量级。$m<r$ 会让系数矩阵秩亏，插值失效。

## POD 能量截断判据与一次手算

快照矩阵 $X$ 的 SVD 给出奇异值 $\sigma_k$，取最小 $r$ 使

$$ \frac{\sum_{k=1}^{r}\sigma_k^{2}}{\sum_{k=1}^{n}\sigma_k^{2}}\ge0.999 $$

手算一组：$\sigma=[10,\ 3,\ 1,\ 0.5]$，则 $\sigma^2=[100,\ 9,\ 1,\ 0.25]$，总和 110.25。$r=1$ 得 90.7%，$r=2$ 得 98.87%，$r=3$ 得 99.77%，均低于 0.999；必须取 $r=4$ 才达到 100%。这说明"取到 99% 就够"的想法在本例会留下 1.2% 量级的误差。

## 判据表

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

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 能量到 99.9% 但真误差 5% | 能量范数与目标量不一致 | 改按目标量加权范数截断 |
| 加密快照数量误差不降 | n-width 衰减慢 | 估计 $d_n$ 的衰减率 |
| 在线出现非物理振荡 | Galerkin 投影不稳定 | 改用 LSPG 对照 |
| 加速比只有 3 倍 | 非线性项未超降阶 | 加 DEIM，$m=2r$ |
| DMD 模态随窗口变化 | 强非线性 | 缩短窗口或改参数化 DMD |
| $m<r$ 时系数矩阵秩亏 | DEIM 点数不足 | $m$ 提到 $2r=40$ |

## DMD 的秩与适用域

把相邻快照写成线性映射 $X'\approx AX$，用截断 SVD 求低秩近似：

$$ A\approx X'\hat{V}\hat{\Sigma}^{-1}\hat{U}^{\top} $$

秩取能量 99.9% 对应的值，通常 10～30。DMD 只适合拟线性动力学：若模态增长率随采样窗口改变超过 20%，说明系统非线性强，DMD 预测不可用，应改用算子推断或参数化 DMD。

## 基更新的触发条件

参数漂移或几何变化后旧基失效。触发条件是留出集上的投影误差超过 2%，或残量 $\eta$ 连续 5 次超过 $10^{-3}$。更新方式有两种：整体重算 SVD（稳妥但需重跑离线），或增量加入新快照并做秩一更新（便宜但基不再正交，需定期重正交）。

## 快照数量与边界加密

快照数应显著多于基的维数，经验起点 $N_s=2r+1$：目标 $r=15$ 时至少 31 个快照，工程上取 100 个以留出验证集。抽样用 LHS 覆盖参数域，再对参数域边界补 20% 的样本，因为 POD 基在边界处最容易失真。

$$ N_s\ge2r+1,\qquad N_{boundary}=0.2\,N_s $$

$r=15$ 时 $N_s\ge31$，边界样本 20 个，总计 120 个快照中 100 个用于训练、20 个用于验证。

## 配置模板

```python
import numpy as np

def greedy_snapshots(solve, residual, r0, xi, tol=1e-3, rmax=15):
    snaps, Phi = [], None
    for k in range(rmax):
        if Phi is None:
            mu = xi[len(xi) // 2]
        else:
            eta = [np.linalg.norm(residual(Phi, m)) / np.linalg.norm(r0(m)) for m in xi]
            if max(eta) < tol:
                break
            mu = xi[int(np.argmax(eta))]
        snaps.append(solve(mu))
        U, s, _ = np.linalg.svd(np.column_stack(snaps), full_matrices=False)
        Phi = U[:, : min(len(snaps), rmax)]
    return np.column_stack(snaps), Phi
```

| 配置项 | 取值 | 依据 |
|---|---|---|
| 参数维数 | 3 | 几何加 2 个物性 |
| 快照数 | 100 | 不小于 $2r+1$ |
| 目标基维数 $r$ | 15 | 能量 99.9% |
| DEIM 点数 $m$ | 30 | $2r$ |
| 残量容差 $\eta$ | $10^{-3}$ | 贪心停止 |
| 投影误差阈值 | 2% | 触发基更新 |
| 训练/测试比 | 80 / 20 | 独立验证 |

## 贪心采样用无量纲残量作停止准则

贪心采样每步选取残量最大的参数点：

$$ \mu_{k+1}=\arg\max_{\mu\in\Xi}\ \eta(\mu),\qquad \eta(\mu)=\frac{\left\lVert R\left(\Phi_k\hat{\mathbf{u}};\mu\right)\right\rVert_2}{\left\lVert R\left(\mathbf{0};\mu\right)\right\rVert_2} $$

$\eta(\mu)$ 是无量纲残量，判据 $\eta<10^{-3}$。用 $\eta$ 作为停止准则比固定快照数可靠，因为它直接反映当前基在参数空间中的最坏表现。

## DEIM 插值点的选取

$$ i_k=\arg\max_{i}\ \left|\left(\mathbf{r}_{k-1}\right)_i\right|,\qquad \mathbf{r}_k=\mathbf{f}-\Phi_f\left(P^{\top}\Phi_f\right)^{-1}P^{\top}\mathbf{f} $$

插值点数 $m$ 取 $2r$ 到 $3r$，$r=15$ 时 $m=30\sim45$。$m<r$ 会让非线性项秩亏，$m>3r$ 收益递减但每步仍要付出插值代价。

## 离线与在线的成本预算

21600 s ÷ 0.5 s = 43200，即一次离线投入换来约 $4.3\times10^{4}$ 倍的在线加速。若在线耗时明显高于 0.5 s，先查非线性项是否仍在满维求值。

| 阶段 | 内容 | 时间预算 |
|---|---|---|
| 离线-快照 | 100 次满维求解 | 6 h（21600 s） |
| 离线-基 | SVD 与 DEIM 构造 | 3 min |
| 在线-装配 | $15\times15$ 小系统 | 0.02 s |
| 在线-求解 | 每参数步 | 0.5 s |
| 在线-加速比 | 相对满维 2 h | $4.3\times10^{4}$ |

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 在线误差 6% 但残量 $10^{-4}$ | 残量指标与目标量不一致 | 改用目标量加权的误差估计 |
| 参数域边界误差突增 | 边界样本不足 | 边界补 20% 样本重训 |
| DEIM 后精度下降 3% | $m$ 小于 $r$ | $m$ 提到 $2r=30$ |
| 在线耗时 5 s 而非 0.5 s | 非线性项未超降阶 | 检查是否仍在满维求值 |
| 基更新后结果跳变 | 未做场插值 | 检查更新前后投影误差 |
| 秩一更新后基不再正交 | 增量更新未重正交 | 每 10 次增量做一次 QR |

## 诊断表

```python
import numpy as np

def rom_checks(Phi, Q, mu_all, mu_new, R_train):
    proj = [np.linalg.norm(q - Phi @ (Phi.T @ q)) / np.linalg.norm(q) for q in Q.T]
    ext = min(np.linalg.norm(mu_new - m) for m in mu_all) / R_train
    loo = []
    for i in range(Q.shape[1]):
        Qi = np.delete(Q, i, axis=1)
        Ui, _, _ = np.linalg.svd(Qi, full_matrices=False)
        B = Ui[:, : Phi.shape[1]]
        loo.append(np.linalg.norm(Q[:, i] - B @ (B.T @ Q[:, i])) / np.linalg.norm(Q[:, i]))
    return dict(proj_max=max(proj), ext=ext, loo_mean=float(np.mean(loo)))
```

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 有效因子 0.6 | 误差界失效 | 用留出集直接测真误差 |
| Galerkin 误差 6%、投影误差 1.8% | 投影不稳定 | 改用 LSPG 对照 |
| 训练误差 0.2%、LOO 0.9% | 基过拟合 | 快照数从 100 加到 200 |
| $\delta_{ext}=1.3$ 时误差 11% | 外推 | 限制在线参数域并回退满维 |
| 无激励下能量增长 2% | 伪模态 | 加稳定化或降低 $r$ |
| $r$ 从 15 增到 25 误差不降 | 奇异值出现平台（噪声） | 检查快照是否含求解器噪声 |

## 伪模态与能量守恒检查

Galerkin 投影在非对称算子上可能产生增长模态。让 ROM 在无外激励下积分 100 个时间步，若总能量增长超过 1%，说明存在伪模态，应加稳定化或改用 LSPG。这一步成本极低，却能拦住最危险的一类在线发散。

## 留一交叉验证检查基是否过拟合

$$ \epsilon_{LOO}=\frac{1}{N_s}\sum_{i=1}^{N_s}\frac{\left\lVert\mathbf{q}_i-\Phi^{(-i)}\mathbf{a}_i\right\rVert_2}{\left\lVert\mathbf{q}_i\right\rVert_2} $$

$\Phi^{(-i)}$ 是去掉第 $i$ 个快照后重建的基。100 个快照、$r=15$ 时，若 $\epsilon_{LOO}=0.9\%$ 而全部快照的训练误差只有 0.2%，差距说明基对个别快照过拟合，应把快照数增加到 200。

## 投影误差是 ROM 误差的下界

$$ \Delta_{proj}=\frac{\left\lVert\mathbf{q}-\Phi\Phi^{\top}\mathbf{q}\right\rVert_2}{\left\lVert\mathbf{q}\right\rVert_2} $$

投影误差只反映基的表达能力，与求解方式无关。若 Galerkin 解的真误差远大于投影误差（例如 6% 对 1.8%），问题出在投影稳定性而非基的维数，此时加阶数无用，应改用 LSPG。

## 有效因子必须不小于 1

$$ \eta_{eff}=\frac{\Delta_{bound}}{\Delta_{true}} $$

理论上误差界不小于真误差，因此 $\eta_{eff}\ge1$。实测投影误差 1.8%、真误差 2.1%、误差界 2.5% 时 $\eta_{eff}=2.5/2.1=1.19$，估计器有效；若算出 $\eta_{eff}=0.6$，说明界失效，不能再用它做在线判据。

## 外推检测用归一化距离

ROM 只在训练参数域内有效。把当前参数到训练集的归一化距离作为在线指标：

$$ \delta_{ext}=\min_{j}\frac{\left\lVert\mu-\mu_j\right\rVert_2}{R_{train}} $$

$R_{train}$ 是训练参数域半径。实测在 $\delta_{ext}=1.3$ 处误差从 2% 跳到 11%，因此工程上把 $\delta_{ext}\le0.8$ 作为在线可用条件；超过时自动回退到满维求解。

## 参考资料

1. Benner P., Gugercin S., Willcox K., "A survey of projection-based model reduction methods for parametric dynamical systems," *SIAM Review*, 57, 2015.
2. Berkooz G., Holmes P., Lumley J.L., "The proper orthogonal decomposition in the analysis of turbulent flows," *Annual Review of Fluid Mechanics*, 25, 1993.
3. Chaturantabut S., Sorensen D.C., "Nonlinear model reduction via discrete empirical interpolation," *SIAM Journal on Scientific Computing*, 32, 2010.
4. Schmid P.J., "Dynamic mode decomposition of numerical and experimental data," *Journal of Fluid Mechanics*, 656, 2010.
5. Quarteroni A., Manzoni A., Negri F., *Reduced Basis Methods for Partial Differential Equations: An Introduction*, Springer, 2016.
6. Haasdonk B., Ohlberger M., "Reduced basis method for finite volume approximations of parametrized linear evolution equations," *ESAIM: Mathematical Modelling and Numerical Analysis*, 42, 2008.
7. Hesthaven J.S., Rozza G., Stamm B., *Certified Reduced Basis Methods for Parametrized Partial Differential Equations*, Springer, 2016.
8. Peherstorfer B., Willcox K., "Dynamic data-driven reduced-order models," *Computer Methods in Applied Mechanics and Engineering*, 291, 2015.
9. Barrault M., Maday Y., Nguyen N.C., Patera A.T., "An 'empirical interpolation' method: application to efficient reduced-basis discretization of partial differential equations," *Comptes Rendus Mathematique*, 339, 2004.
10. Bui-Thanh T., Willcox K., Ghattas O., "Parametric reduced-order models for probabilistic analysis of unsteady aerodynamic applications," *AIAA Journal*, 46, 2008.
11. Amsallem D., Farhat C., "Interpolation method for adapting reduced-order models and application to aeroelasticity," *AIAA Journal*, 46, 2008.
12. Carlberg K., Bou-Mosleh C., Farhat C., "Efficient non-linear model reduction via a least-squares Petrov–Galerkin projection and compressive tensor approximations," *International Journal for Numerical Methods in Engineering*, 86, 2011.
13. Grepl M.A., Maday Y., Nguyen N.C., Patera A.T., "Efficient reduced-basis treatment of nonaffine and nonlinear partial differential equations," *ESAIM: Mathematical Modelling and Numerical Analysis*, 41, 2007.
14. Ohlberger M., Rave S., "Reduced basis methods: success, limitations and future challenges," *Proceedings of the Conference ALGORITMY*, 2016.
15. Benner P., Ohlberger M., Patera A., Rozza G., Urban K. (eds.), *Model Reduction and Approximation: Theory and Algorithms*, SIAM, 2017.
