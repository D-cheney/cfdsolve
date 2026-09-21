---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-reduced-order-model-diagnosis-validation
title: "降阶模型：结果诊断与可信度验证"
summary: "以降阶误差界的有效因子、投影误差与真误差之比、留一交叉验证与外推距离指标四类证据审查 ROM，给出伪模态识别试验、基维数复核方法与在线可用条件的阈值。"
category:
  slug: optimization-uq-rom
  name: "优化、不确定性与降阶"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "优化、不确定性与降阶"
  - "降阶模型"
  - "结果诊断与可信度验证"
  - "有效因子"
  - "留一交叉验证"
seo:
  title: "降阶模型：结果诊断与可信度验证"
  description: "以降阶误差界的有效因子、投影误差与真误差之比、留一交叉验证与外推距离指标四类证据审查 ROM，给出伪模态识别试验、基维数复核方法与在线可用条件的阈值。"
  keywords:
    - "降阶模型"
    - "结果诊断与可信度验证"
    - "误差界"
    - "留一交叉验证"
    - "外推检测"
---

# 降阶模型：结果诊断与可信度验证

ROM 的验证不能只看"新参数上误差小"，因为误差界若低于真误差，说明估计器失效，后续任何参数点都不可信。本文给出四类可核对的证据与对应阈值。

## 投影误差是 ROM 误差的下界

$$ \Delta_{proj}=\frac{\left\lVert\mathbf{q}-\Phi\Phi^{\top}\mathbf{q}\right\rVert_2}{\left\lVert\mathbf{q}\right\rVert_2} $$

投影误差只反映基的表达能力，与求解方式无关。若 Galerkin 解的真误差远大于投影误差（例如 6% 对 1.8%），问题出在投影稳定性而非基的维数，此时加阶数无用，应改用 LSPG。

## 有效因子必须不小于 1

$$ \eta_{eff}=\frac{\Delta_{bound}}{\Delta_{true}} $$

理论上误差界不小于真误差，因此 $\eta_{eff}\ge1$。实测投影误差 1.8%、真误差 2.1%、误差界 2.5% 时 $\eta_{eff}=2.5/2.1=1.19$，估计器有效；若算出 $\eta_{eff}=0.6$，说明界失效，不能再用它做在线判据。

## 留一交叉验证检查基是否过拟合

$$ \epsilon_{LOO}=\frac{1}{N_s}\sum_{i=1}^{N_s}\frac{\left\lVert\mathbf{q}_i-\Phi^{(-i)}\mathbf{a}_i\right\rVert_2}{\left\lVert\mathbf{q}_i\right\rVert_2} $$

$\Phi^{(-i)}$ 是去掉第 $i$ 个快照后重建的基。100 个快照、$r=15$ 时，若 $\epsilon_{LOO}=0.9\%$ 而全部快照的训练误差只有 0.2%，差距说明基对个别快照过拟合，应把快照数增加到 200。

## 外推检测用归一化距离

ROM 只在训练参数域内有效。把当前参数到训练集的归一化距离作为在线指标：

$$ \delta_{ext}=\min_{j}\frac{\left\lVert\mu-\mu_j\right\rVert_2}{R_{train}} $$

$R_{train}$ 是训练参数域半径。实测在 $\delta_{ext}=1.3$ 处误差从 2% 跳到 11%，因此工程上把 $\delta_{ext}\le0.8$ 作为在线可用条件；超过时自动回退到满维求解。

## 伪模态与能量守恒检查

Galerkin 投影在非对称算子上可能产生增长模态。让 ROM 在无外激励下积分 100 个时间步，若总能量增长超过 1%，说明存在伪模态，应加稳定化或改用 LSPG。这一步成本极低，却能拦住最危险的一类在线发散。

## 诊断表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 有效因子 0.6 | 误差界失效 | 用留出集直接测真误差 |
| Galerkin 误差 6%、投影误差 1.8% | 投影不稳定 | 改用 LSPG 对照 |
| 训练误差 0.2%、LOO 0.9% | 基过拟合 | 快照数从 100 加到 200 |
| $\delta_{ext}=1.3$ 时误差 11% | 外推 | 限制在线参数域并回退满维 |
| 无激励下能量增长 2% | 伪模态 | 加稳定化或降低 $r$ |
| $r$ 从 15 增到 25 误差不降 | 奇异值出现平台（噪声） | 检查快照是否含求解器噪声 |

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

## 参考文献

1. Amsallem D., Farhat C., "Interpolation method for adapting reduced-order models and application to aeroelasticity," *AIAA Journal*, 46, 2008.
2. Carlberg K., Bou-Mosleh C., Farhat C., "Efficient non-linear model reduction via a least-squares Petrov–Galerkin projection and compressive tensor approximations," *International Journal for Numerical Methods in Engineering*, 86, 2011.
3. Grepl M.A., Maday Y., Nguyen N.C., Patera A.T., "Efficient reduced-basis treatment of nonaffine and nonlinear partial differential equations," *ESAIM: Mathematical Modelling and Numerical Analysis*, 41, 2007.
4. Ohlberger M., Rave S., "Reduced basis methods: success, limitations and future challenges," *Proceedings of the Conference ALGORITMY*, 2016.
5. Benner P., Ohlberger M., Patera A., Rozza G., Urban K. (eds.), *Model Reduction and Approximation: Theory and Algorithms*, SIAM, 2017.
