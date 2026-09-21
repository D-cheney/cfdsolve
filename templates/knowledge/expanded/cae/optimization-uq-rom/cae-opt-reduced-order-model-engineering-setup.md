---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-reduced-order-model-engineering-setup
title: "降阶模型：工程设置与参数选择"
summary: "给出离线-在线降阶的完整配置：快照数量与边界加密策略、贪心采样的无量纲残量判据、DEIM 插值点数、基更新触发条件与离线在线成本预算，附可复现的贪心离线脚本。"
category:
  slug: optimization-uq-rom
  name: "优化、不确定性与降阶"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "优化、不确定性与降阶"
  - "降阶模型"
  - "工程设置与参数选择"
  - "贪心采样"
  - "离线在线分解"
seo:
  title: "降阶模型：工程设置与参数选择"
  description: "给出离线-在线降阶的完整配置：快照数量与边界加密策略、贪心采样的无量纲残量判据、DEIM 插值点数、基更新触发条件与离线在线成本预算，附可复现的贪心离线脚本。"
  keywords:
    - "降阶模型"
    - "工程设置与参数选择"
    - "贪心算法"
    - "DEIM"
    - "加速比"
---

# 降阶模型：工程设置与参数选择

降阶模型的成本结构决定了配置方式：离线可以花几小时，在线必须压到亚秒级。配置的核心是让离线快照覆盖参数空间，同时让在线规模尽可能小。本文以 3 个参数、100 个快照、$r=15$ 为例给出完整取值。

## 快照数量与边界加密

快照数应显著多于基的维数，经验起点 $N_s=2r+1$：目标 $r=15$ 时至少 31 个快照，工程上取 100 个以留出验证集。抽样用 LHS 覆盖参数域，再对参数域边界补 20% 的样本，因为 POD 基在边界处最容易失真。

$$ N_s\ge2r+1,\qquad N_{boundary}=0.2\,N_s $$

$r=15$ 时 $N_s\ge31$，边界样本 20 个，总计 120 个快照中 100 个用于训练、20 个用于验证。

## 贪心采样用无量纲残量作停止准则

贪心采样每步选取残量最大的参数点：

$$ \mu_{k+1}=\arg\max_{\mu\in\Xi}\ \eta(\mu),\qquad \eta(\mu)=\frac{\left\lVert R\left(\Phi_k\hat{\mathbf{u}};\mu\right)\right\rVert_2}{\left\lVert R\left(\mathbf{0};\mu\right)\right\rVert_2} $$

$\eta(\mu)$ 是无量纲残量，判据 $\eta<10^{-3}$。用 $\eta$ 作为停止准则比固定快照数可靠，因为它直接反映当前基在参数空间中的最坏表现。

## DEIM 插值点的选取

$$ i_k=\arg\max_{i}\ \left|\left(\mathbf{r}_{k-1}\right)_i\right|,\qquad \mathbf{r}_k=\mathbf{f}-\Phi_f\left(P^{\top}\Phi_f\right)^{-1}P^{\top}\mathbf{f} $$

插值点数 $m$ 取 $2r$ 到 $3r$，$r=15$ 时 $m=30\sim45$。$m<r$ 会让非线性项秩亏，$m>3r$ 收益递减但每步仍要付出插值代价。

## 离线与在线的成本预算

| 阶段 | 内容 | 时间预算 |
|---|---|---|
| 离线-快照 | 100 次满维求解 | 6 h（21600 s） |
| 离线-基 | SVD 与 DEIM 构造 | 3 min |
| 在线-装配 | $15\times15$ 小系统 | 0.02 s |
| 在线-求解 | 每参数步 | 0.5 s |
| 在线-加速比 | 相对满维 2 h | $4.3\times10^{4}$ |

21600 s ÷ 0.5 s = 43200，即一次离线投入换来约 $4.3\times10^{4}$ 倍的在线加速。若在线耗时明显高于 0.5 s，先查非线性项是否仍在满维求值。

## 基更新的触发条件

参数漂移或几何变化后旧基失效。触发条件是留出集上的投影误差超过 2%，或残量 $\eta$ 连续 5 次超过 $10^{-3}$。更新方式有两种：整体重算 SVD（稳妥但需重跑离线），或增量加入新快照并做秩一更新（便宜但基不再正交，需定期重正交）。

## 配置模板

| 配置项 | 取值 | 依据 |
|---|---|---|
| 参数维数 | 3 | 几何加 2 个物性 |
| 快照数 | 100 | 不小于 $2r+1$ |
| 目标基维数 $r$ | 15 | 能量 99.9% |
| DEIM 点数 $m$ | 30 | $2r$ |
| 残量容差 $\eta$ | $10^{-3}$ | 贪心停止 |
| 投影误差阈值 | 2% | 触发基更新 |
| 训练/测试比 | 80 / 20 | 独立验证 |

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

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 在线误差 6% 但残量 $10^{-4}$ | 残量指标与目标量不一致 | 改用目标量加权的误差估计 |
| 参数域边界误差突增 | 边界样本不足 | 边界补 20% 样本重训 |
| DEIM 后精度下降 3% | $m$ 小于 $r$ | $m$ 提到 $2r=30$ |
| 在线耗时 5 s 而非 0.5 s | 非线性项未超降阶 | 检查是否仍在满维求值 |
| 基更新后结果跳变 | 未做场插值 | 检查更新前后投影误差 |
| 秩一更新后基不再正交 | 增量更新未重正交 | 每 10 次增量做一次 QR |

## 参考文献

1. Haasdonk B., Ohlberger M., "Reduced basis method for finite volume approximations of parametrized linear evolution equations," *ESAIM: Mathematical Modelling and Numerical Analysis*, 42, 2008.
2. Hesthaven J.S., Rozza G., Stamm B., *Certified Reduced Basis Methods for Parametrized Partial Differential Equations*, Springer, 2016.
3. Peherstorfer B., Willcox K., "Dynamic data-driven reduced-order models," *Computer Methods in Applied Mechanics and Engineering*, 291, 2015.
4. Barrault M., Maday Y., Nguyen N.C., Patera A.T., "An 'empirical interpolation' method: application to efficient reduced-basis discretization of partial differential equations," *Comptes Rendus Mathematique*, 339, 2004.
5. Bui-Thanh T., Willcox K., Ghattas O., "Parametric reduced-order models for probabilistic analysis of unsteady aerodynamic applications," *AIAA Journal*, 46, 2008.
