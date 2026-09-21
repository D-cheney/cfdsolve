---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-uncertainty-quantification-engineering-setup
title: "不确定度量化：工程设置与参数选择"
summary: "给出 UQ 的可复现配置：由目标精度反推拉丁超立方样本数、稀疏网格层级与求积点数、PCE 回归样本倍率、求解器容差相对不确定度信号的量级比，以及相关输入的 Copula 处理。"
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
  - "不确定度量化"
  - "工程设置与参数选择"
  - "拉丁超立方"
  - "稀疏网格"
seo:
  title: "不确定度量化：工程设置与参数选择"
  description: "给出 UQ 的可复现配置：由目标精度反推拉丁超立方样本数、稀疏网格层级与求积点数、PCE 回归样本倍率、求解器容差相对不确定度信号的量级比，以及相关输入的 Copula 处理。"
  keywords:
    - "不确定度量化"
    - "工程设置与参数选择"
    - "拉丁超立方"
    - "PCE 回归"
    - "求解器容差"
---

# 不确定度量化：工程设置与参数选择

UQ 的配置错误几乎都表现为"看起来收敛、其实算的是数值噪声"。本文给出一套可复现的配置取值，并说明每个取值的来源与验收方式。

## 样本量由目标精度反推

先做 20 个样本的预跑估计响应标准差 $\sigma_Q$，再按目标标准误 $\delta$ 反推样本量：

$$ N\approx\left(\frac{\sigma_Q}{\delta}\right)^{2} $$

$\sigma_Q=2.5$ MPa、要求 $\delta=0.05$ MPa 时 $N\approx2500$。实际取 2500 个 LHS 样本，并报告逐批累计的经验收敛曲线，而不是只报终值。

## 稀疏网格层级与求积点数

高维投影用 Smolyak 稀疏网格，层级 $\ell$ 的求积点数增长远慢于张量积。$d=5$、$\ell=4$ 时约 240 个求积点，而 5 维 5 点全张量积需要 $5^{5}=3125$ 点，相差 13 倍。层级每加 1，点数大约翻倍，因此 $\ell$ 应由目标精度而非习惯决定。

## PCE 回归的样本倍率

用最小二乘回归求系数时，样本数应取基函数个数的 2～3 倍。$d=5$、$p=3$ 有 56 项基函数，配 168 个 LHS 样本（3 倍）。样本位置用 LHS 或 D-最优设计；纯随机采样会让设计矩阵条件数恶化，系数出现震荡。

$$ \min_{\mathbf{c}}\ \left\lVert\mathbf{\Psi}\mathbf{c}-\mathbf{q}\right\rVert_2^{2}+\gamma\left\lVert\mathbf{c}\right\rVert_1 $$

$\ell_1$ 项用于稀疏回归，$d>20$ 时用它替代全基函数回归，因为全基函数个数随维数组合增长。

## 求解器容差必须远小于不确定度信号

若求解器迭代容差引入的目标波动与待测标准差同量级，UQ 结果就是噪声。判据：容差引起的目标变化应小于 $0.1\sigma_Q$。$\sigma_Q=2.5$ MPa 时要求波动小于 0.25 MPa，通常需要把残差容差收到 $10^{-8}$ 以下；这一点在湍流或非线性问题中往往是最容易被忽略的配置项。

## 配置表

| 配置项 | 取值 | 依据 |
|---|---|---|
| 输入维数 | 5 | 先做 Morris 筛选 |
| LHS 样本 | 2500 | $(\sigma_Q/\delta)^{2}$ |
| 稀疏网格层级 | 4 | 约 240 点 |
| PCE 阶数 | 3 | 56 项基函数 |
| 回归样本 | 168 | 3 倍基函数数 |
| 求解器容差 | $10^{-8}$ | 小于 $0.1\sigma_Q$ |
| 随机种子 | 固定 | 可复现 |
| 并行分块 | 100 样本/块 | 失败重试 2 次 |

## 相关输入必须做变换

输入相关时不能独立采样。先用秩相关矩阵或 Copula 建模，再把相关样本经 Nataf 变换转成独立标准正态，之后才可套用 Hermite 基。忽略相关性会让方差低估 10%～40%，且这种偏差不会随样本增加而消失。

```python
import numpy as np
from scipy.stats import qmc, norm

def build_samples(d=5, n=2500, seed=20260920):
    u = qmc.LatinHypercube(d=d, seed=seed).random(n)
    z = np.empty_like(u)
    z[:, :2] = norm.ppf(u[:, :2])          # 前两维: 标准正态
    z[:, 2:] = 2.0 * u[:, 2:] - 1.0        # 后三维: U(-1, 1)
    return z

print(build_samples().shape)               # (2500, 5)
print((0.05 / 2.5) ** -2)                  # 2500, 样本量反推
```

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 方差估计重复运行差 30% | 样本量不足 | 用 $(\sigma_Q/\delta)^{2}$ 重算样本数 |
| PCE 系数震荡 | 样本数小于基函数数 2 倍 | 加到 168 个样本 |
| 目标波动 0.2 MPa 而 $\sigma_Q=0.24$ MPa | 求解器容差过大 | 容差收到 $10^{-8}$ |
| 方差被低估 25% | 输入相关被忽略 | 引入 Copula 后重算 |
| 结果不可复现 | 未固定种子 | 固定种子与并行归约顺序 |
| 稀疏网格点数远超预算 | 层级 $\ell$ 过大 | $\ell$ 由 6 降到 4 |

## 参考文献

1. McKay M.D., Beckman R.J., Conover W.J., "A comparison of three methods for selecting values of input variables in the analysis of output from a computer code," *Technometrics*, 21, 1979.
2. Xiu D., *Numerical Methods for Stochastic Computations: A Spectral Method Approach*, Princeton University Press, 2010.
3. Eldred M.S., Burkardt J., "Comparison of non-intrusive polynomial chaos and stochastic collocation methods for uncertainty quantification," *AIAA Paper 2009-976*, 2009.
4. Joe S., Kuo F.Y., "Constructing Sobol sequences with better two-dimensional projections," *SIAM Journal on Scientific Computing*, 30, 2008.
5. Nelsen R.B., *An Introduction to Copulas*, 2nd ed., Springer, 2006.
