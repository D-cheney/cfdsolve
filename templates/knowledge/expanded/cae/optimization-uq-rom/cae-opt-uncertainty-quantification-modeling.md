---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-uncertainty-quantification-modeling
title: "不确定度量化：方法原理与适用范围"
summary: "从输入的概率描述出发，推导 Monte Carlo 的误差率、多项式混沌展开的基函数计数与 Sobol 方差分解，说明随机型与认知型不确定性分开处理的必要性与可靠性问题的模型切换条件。"
category:
  slug: optimization-uq-rom
  name: "优化、不确定性与降阶"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "优化、不确定性与降阶"
  - "不确定度量化"
  - "方法原理与适用范围"
  - "Sobol 指数"
  - "多项式混沌"
seo:
  title: "不确定度量化：方法原理与适用范围"
  description: "从输入的概率描述出发，推导 Monte Carlo 的误差率、多项式混沌展开的基函数计数与 Sobol 方差分解，说明随机型与认知型不确定性分开处理的必要性与可靠性问题的模型切换条件。"
  keywords:
    - "不确定度量化"
    - "方法原理与适用范围"
    - "多项式混沌展开"
    - "Sobol 指数"
    - "失效概率"
---

# 不确定度量化：方法原理与适用范围

不确定度量化的核心不是采样，而是把"哪些量不确定、以什么形式不确定"写成数学模型。描述写错，后续再多采样也只是精确地算错。本文按输入描述、响应传播与方差分解三层说明建模选择。

## 随机型与认知型必须分开描述

材料批次波动、载荷谱散布属于固有随机（aleatory），可用概率分布描述，样本越多估计越稳；模型系数未知、边界条件不确定属于认知型（epistemic），只能用区间或概率盒描述，样本再多也只能缩小范围。把认知型当成概率分布处理会系统性低估尾部风险，反之则过度保守。

## Monte Carlo 的误差率与样本量

$$ \hat{\mu}_N=\frac{1}{N}\sum_{i=1}^{N}Q(\xi_i),\qquad \epsilon_{MC}=\frac{\sigma_Q}{\sqrt{N}} $$

响应标准差 $\sigma_Q=2.5$ MPa 时，$N=10^{4}$ 给出标准误 0.025 MPa。误差按 $N^{-1/2}$ 下降且与输入维数无关，这是 MC 在 20 维以上仍然可用的根本原因。

## 多项式混沌展开与基函数计数

对光滑响应用正交多项式展开：

$$ Q(\xi)\approx\sum_{\alpha\in\mathcal{A}}c_\alpha\Psi_\alpha(\xi),\qquad \mathcal{A}=\left\{\alpha:\ \sum_{i=1}^{d}\alpha_i\le p\right\} $$

总阶数 $p$ 的基函数个数为 $\binom{d+p}{p}$。$d=5$、$p=3$ 时为 $8!/(5!\,3!)=56$ 项。基函数必须与输入分布匹配：高斯配 Hermite、均匀配 Legendre、Beta 配 Jacobi；配错会破坏正交性，均值与方差全错。

## Sobol 分解给出方差归属

$$ \mathrm{Var}\left[Q\right]=\sum_i V_i+\sum_{i<j}V_{ij}+\cdots,\qquad S_i=\frac{V_i}{\mathrm{Var}\left[Q\right]},\qquad \sum_iS_i+\sum_{i<j}S_{ij}+\cdots=1 $$

一组实测 Sobol 指数：$S_1=0.62$、$S_2=0.21$、$S_3=0.09$、$S_4=0.05$、$S_5=0.02$，交互项 $S_{12}=0.01$，合计 1.00。前两个变量贡献 83% 的方差，因此降低不确定度应优先收紧这两个参数，而不是均匀加严全部 5 个。

## 可靠性问题必须换方法

失效概率 $P_f=\Pr(Q>q_{crit})$ 很小时（$10^{-6}$ 量级），直接 MC 需要 $10^{8}$ 量级样本。此时改用 FORM/SORM 或子集模拟：FORM 在设计点线性化极限状态面，一次分析只需几十次求解；SORM 用主曲率修正，代价是二阶导数。若极限状态面强非线性，FORM 的误差可达一个数量级，必须用子集模拟交叉验证。

## 适用边界

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 方差估计随基函数阶数剧烈变化 | 基函数与分布不匹配 | 检查正交性残差是否接近零 |
| 均值收敛但方差收敛慢 | 响应厚尾 | 改报分位数与四分位距 |
| Sobol 指数之和偏离 1 超过 5% | 样本不足或交互项被截断 | 增加样本重算 |
| 认知型参数被当成正态分布 | 描述层级错误 | 用区间分析对照 |
| $P_f$ 估计为 0 | 样本量远小于 $1/P_f$ | 改用子集模拟 |

```python
from math import comb
import numpy as np

# 基函数计数: d 个变量, 总阶数 p
def n_basis(d, p):
    return comb(d + p, p)

print(n_basis(5, 3))                      # 56

# Sobol 一阶指数: 给定条件方差与总方差
def sobol_first(Vi, Vtot):
    return Vi / Vtot

Vtot = 6.25                               # MPa^2, sigma_Q = 2.5 MPa
print(sobol_first(0.62 * Vtot, Vtot))     # 0.62
```

## 参考文献

1. Ghanem R., Spanos P., *Stochastic Finite Elements: A Spectral Approach*, Springer, 1991.
2. Xiu D., Karniadakis G.E., "The Wiener–Askey polynomial chaos for stochastic differential equations," *SIAM Journal on Scientific Computing*, 24, 2002.
3. Sobol I.M., "Global sensitivity indices for nonlinear mathematical models and their Monte Carlo estimates," *Mathematics and Computers in Simulation*, 55, 2001.
4. Sudret B., "Global sensitivity analysis using polynomial chaos expansions," *Reliability Engineering & System Safety*, 93, 2008.
5. Saltelli A., Ratto M., Andres T., Campolongo F., Cariboni J., Gatelli D., Saisana M., Tarantola S., *Global Sensitivity Analysis: The Primer*, Wiley, 2008.
