---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-uncertainty-quantification-diagnosis-validation
title: "不确定度量化：结果诊断与可信度验证"
summary: "用批次收敛历史、留出集预测误差、Sobol 指数稳定性与尾部概率置信区间四组证据审查 UQ 结果，给出失效概率相对误差公式与 Wilson 区间的一次完整手算。"
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
  - "不确定度量化"
  - "结果诊断与可信度验证"
  - "Wilson 区间"
  - "留出集验证"
seo:
  title: "不确定度量化：结果诊断与可信度验证"
  description: "用批次收敛历史、留出集预测误差、Sobol 指数稳定性与尾部概率置信区间四组证据审查 UQ 结果，给出失效概率相对误差公式与 Wilson 区间的一次完整手算。"
  keywords:
    - "不确定度量化"
    - "结果诊断与可信度验证"
    - "失效概率"
    - "Wilson 区间"
    - "过拟合"
---

# 不确定度量化：结果诊断与可信度验证

UQ 报告里最容易被忽略的问题是"这个方差或概率本身有多准"。本文给出四类可核对的诊断证据，并用 $P_f=10^{-3}$、$N=10^{4}$ 的例子说明尾部估计的不确定度究竟有多大。

## 收敛历史必须按批次报告

把样本分成 10 批，逐批累计均值与方差。若最后三批的均值变化超过总标准误的 20%，说明尚未收敛。$\sigma_Q=2.5$ MPa、$N=10^{4}$ 时总标准误为 $2.5/\sqrt{10^{4}}=0.025$ MPa，最后三批的均值漂移应小于 0.005 MPa。只看终值无法发现这一类未收敛。

## 留出集验证代理模型

PCE 或高斯过程代理必须在未参与拟合的样本上验证。留出 20%（500 个样本），报告相对预测误差

$$ \epsilon_{test}=\frac{\sqrt{\frac{1}{M}\sum_{m=1}^{M}\left(Q_m-\hat{Q}_m\right)^{2}}}{\left|\bar{Q}\right|} $$

判据为 $\epsilon_{test}<2\%$。训练误差低于 0.1% 而留出误差 8% 是典型过拟合，应降阶或加正则；反过来训练误差 3%、留出误差 3.2% 说明模型欠拟合，应升阶。

## Sobol 指数要报稳定性

一阶 Sobol 指数在样本翻倍时的变化应小于 0.02。$S_1$ 从 0.62 变到 0.58（变化 0.04）说明样本不足，此时不能得出"参数 1 主导"的结论。稳健的做法是给出指数随样本量的收敛曲线，而不是单一数值。

## 尾部概率的不确定度远超均值

$$ \mathrm{CoV}\left[\hat{P}_f\right]=\sqrt{\frac{1-P_f}{N P_f}} $$

$P_f=10^{-3}$、$N=10^{4}$ 时 $\mathrm{CoV}=\sqrt{0.999/10}=0.316$，即相对误差 31.6%，$10^{4}$ 次求解只观察到 10 次失效。Wilson 95% 区间为 $[5.4\times10^{-4},\ 1.84\times10^{-3}]$，上下限相差 3.4 倍。要把它压到 ±10%，样本量需再增加约 10 倍到 $10^{5}$，或改用子集模拟。

## UQ 误差必须与离散误差分开报告

$$ \epsilon_{tot}\approx\epsilon_{disc}+\epsilon_{model}+\epsilon_{input} $$

网格收敛研究给出 $\epsilon_{disc}$（例如 GCI=0.5%），模型验证给出 $\epsilon_{model}$，UQ 只负责 $\epsilon_{input}$。若 UQ 的标准差 0.025 MPa 小于网格离散带来的 0.15 MPa 波动，再增加 UQ 样本也没有意义，应先细化网格。

## 诊断表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 最后三批均值漂移 0.01 MPa | 样本不足 | 按 $N\propto(\sigma_Q/\delta)^{2}$ 加样本 |
| 训练误差 0.1%、留出误差 8% | 过拟合 | 降阶并加 $\ell_1$ 正则 |
| $S_1$ 在样本翻倍时变 0.04 | 指数未收敛 | 加样本至变化小于 0.02 |
| $P_f$ 相对误差 32% | 失效样本仅 10 个 | 改用子集模拟或重要抽样 |
| UQ 标准差小于网格噪声 | 离散误差主导 | 先做网格收敛 |
| 分位数随样本剧烈变化 | 尾部样本不足 | 报告置信区间而非点估计 |

```python
import numpy as np

def wilson_ci(k, n, z=1.96):
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z / d * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return c - h, c + h

lo, hi = wilson_ci(10, 10000)
print(lo, hi)                              # 5.43e-04 1.84e-03
print(np.sqrt(0.999 / (10000 * 0.001)))    # 0.316, 相对误差
```

## 参考文献

1. Owen A.B., *Monte Carlo theory, methods and examples*, 2013.
2. Efron B., Tibshirani R.J., *An Introduction to the Bootstrap*, Chapman & Hall/CRC, 1993.
3. Sobol I.M., "Sensitivity estimates for nonlinear mathematical models," *Mathematical Modelling and Computational Experiments*, 1, 1993.
4. Crestaux T., Le Maître O., Martinez J.-M., "Polynomial chaos expansion for sensitivity analysis," *Reliability Engineering & System Safety*, 94, 2009.
5. Bilionis I., Zabaras N., "Bayesian uncertainty propagation using Gaussian processes," *Journal of Computational Physics*, 227, 2008.
