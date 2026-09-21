---
template_version: flowlab-knowledge/1.0
slug: cae-opt-uncertainty-quantification-modeling
title: 不确定度量化：原理、设置与验证
summary: >-
  从输入的概率描述出发，推导 Monte Carlo 的误差率、多项式混沌展开的基函数计数与 Sobol
  方差分解，说明随机型与认知型不确定性分开处理的必要性与可靠性问题的模型切换条件。
category:
  slug: optimization-uq-rom
  name: 优化、不确定性与降阶
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 优化、不确定性与降阶
  - 不确定度量化
  - 方法原理与适用范围
  - Sobol 指数
  - 多项式混沌
  - 工程设置与参数选择
  - 拉丁超立方
  - 稀疏网格
  - 结果诊断与可信度验证
  - Wilson 区间
  - 留出集验证
seo:
  title: 不确定度量化：原理、设置与验证
  description: >-
    从输入的概率描述出发，推导 Monte Carlo 的误差率、多项式混沌展开的基函数计数与 Sobol
    方差分解，说明随机型与认知型不确定性分开处理的必要性与可靠性问题的模型切换条件。
  keywords:
    - 不确定度量化
    - 方法原理与适用范围
    - 多项式混沌展开
    - Sobol 指数
    - 失效概率
    - 工程设置与参数选择
    - 拉丁超立方
    - PCE 回归
    - 求解器容差
    - 结果诊断与可信度验证
    - Wilson 区间
    - 过拟合
---
# 不确定度量化：原理、设置与验证

不确定度量化的核心不是采样，而是把"哪些量不确定、以什么形式不确定"写成数学模型。描述写错，后续再多采样也只是精确地算错。UQ 的配置错误几乎都表现为"看起来收敛、其实算的是数值噪声"。UQ 报告里最容易被忽略的问题是"这个方差或概率本身有多准"。

## 基础概念与控制关系

### 可靠性问题必须换方法

失效概率 $P_f=\Pr(Q>q_{crit})$ 很小时（$10^{-6}$ 量级），直接 MC 需要 $10^{8}$ 量级样本。此时改用 FORM/SORM 或子集模拟：FORM 在设计点线性化极限状态面，一次分析只需几十次求解；SORM 用主曲率修正，代价是二阶导数。若极限状态面强非线性，FORM 的误差可达一个数量级，必须用子集模拟交叉验证。

### 随机型与认知型必须分开描述

材料批次波动、载荷谱散布属于固有随机（aleatory），可用概率分布描述，样本越多估计越稳；模型系数未知、边界条件不确定属于认知型（epistemic），只能用区间或概率盒描述，样本再多也只能缩小范围。把认知型当成概率分布处理会系统性低估尾部风险，反之则过度保守。

### 多项式混沌展开与基函数计数

对光滑响应用正交多项式展开：

$$ Q(\xi)\approx\sum_{\alpha\in\mathcal{A}}c_\alpha\Psi_\alpha(\xi),\qquad \mathcal{A}=\left\{\alpha:\ \sum_{i=1}^{d}\alpha_i\le p\right\} $$

总阶数 $p$ 的基函数个数为 $\binom{d+p}{p}$。$d=5$、$p=3$ 时为 $8!/(5!\,3!)=56$ 项。基函数必须与输入分布匹配：高斯配 Hermite、均匀配 Legendre、Beta 配 Jacobi；配错会破坏正交性，均值与方差全错。

### Sobol 分解给出方差归属

$$ \mathrm{Var}\left[Q\right]=\sum_i V_i+\sum_{i<j}V_{ij}+\cdots,\qquad S_i=\frac{V_i}{\mathrm{Var}\left[Q\right]},\qquad \sum_iS_i+\sum_{i<j}S_{ij}+\cdots=1 $$

一组实测 Sobol 指数：$S_1=0.62$、$S_2=0.21$、$S_3=0.09$、$S_4=0.05$、$S_5=0.02$，交互项 $S_{12}=0.01$，合计 1.00。前两个变量贡献 83% 的方差，因此降低不确定度应优先收紧这两个参数，而不是均匀加严全部 5 个。

## 适用边界与方案选择

### 适用边界

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

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 方差估计随基函数阶数剧烈变化 | 基函数与分布不匹配 | 检查正交性残差是否接近零 |
| 均值收敛但方差收敛慢 | 响应厚尾 | 改报分位数与四分位距 |
| Sobol 指数之和偏离 1 超过 5% | 样本不足或交互项被截断 | 增加样本重算 |
| 认知型参数被当成正态分布 | 描述层级错误 | 用区间分析对照 |
| $P_f$ 估计为 0 | 样本量远小于 $1/P_f$ | 改用子集模拟 |

## 工程设置与实施

### 相关输入必须做变换

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

### 稀疏网格层级与求积点数

高维投影用 Smolyak 稀疏网格，层级 $\ell$ 的求积点数增长远慢于张量积。$d=5$、$\ell=4$ 时约 240 个求积点，而 5 维 5 点全张量积需要 $5^{5}=3125$ 点，相差 13 倍。层级每加 1，点数大约翻倍，因此 $\ell$ 应由目标精度而非习惯决定。

### 配置表

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

### 求解器容差必须远小于不确定度信号

若求解器迭代容差引入的目标波动与待测标准差同量级，UQ 结果就是噪声。判据：容差引起的目标变化应小于 $0.1\sigma_Q$。$\sigma_Q=2.5$ MPa 时要求波动小于 0.25 MPa，通常需要把残差容差收到 $10^{-8}$ 以下；这一点在湍流或非线性问题中往往是最容易被忽略的配置项。

### 样本量由目标精度反推

先做 20 个样本的预跑估计响应标准差 $\sigma_Q$，再按目标标准误 $\delta$ 反推样本量：

$$ N\approx\left(\frac{\sigma_Q}{\delta}\right)^{2} $$

$\sigma_Q=2.5$ MPa、要求 $\delta=0.05$ MPa 时 $N\approx2500$。实际取 2500 个 LHS 样本，并报告逐批累计的经验收敛曲线，而不是只报终值。

### PCE 回归的样本倍率

用最小二乘回归求系数时，样本数应取基函数个数的 2～3 倍。$d=5$、$p=3$ 有 56 项基函数，配 168 个 LHS 样本（3 倍）。样本位置用 LHS 或 D-最优设计；纯随机采样会让设计矩阵条件数恶化，系数出现震荡。

$$ \min_{\mathbf{c}}\ \left\lVert\mathbf{\Psi}\mathbf{c}-\mathbf{q}\right\rVert_2^{2}+\gamma\left\lVert\mathbf{c}\right\rVert_1 $$

$\ell_1$ 项用于稀疏回归，$d>20$ 时用它替代全基函数回归，因为全基函数个数随维数组合增长。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 方差估计重复运行差 30% | 样本量不足 | 用 $(\sigma_Q/\delta)^{2}$ 重算样本数 |
| PCE 系数震荡 | 样本数小于基函数数 2 倍 | 加到 168 个样本 |
| 目标波动 0.2 MPa 而 $\sigma_Q=0.24$ MPa | 求解器容差过大 | 容差收到 $10^{-8}$ |
| 方差被低估 25% | 输入相关被忽略 | 引入 Copula 后重算 |
| 结果不可复现 | 未固定种子 | 固定种子与并行归约顺序 |
| 稀疏网格点数远超预算 | 层级 $\ell$ 过大 | $\ell$ 由 6 降到 4 |

### 诊断表

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

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 最后三批均值漂移 0.01 MPa | 样本不足 | 按 $N\propto(\sigma_Q/\delta)^{2}$ 加样本 |
| 训练误差 0.1%、留出误差 8% | 过拟合 | 降阶并加 $\ell_1$ 正则 |
| $S_1$ 在样本翻倍时变 0.04 | 指数未收敛 | 加样本至变化小于 0.02 |
| $P_f$ 相对误差 32% | 失效样本仅 10 个 | 改用子集模拟或重要抽样 |
| UQ 标准差小于网格噪声 | 离散误差主导 | 先做网格收敛 |
| 分位数随样本剧烈变化 | 尾部样本不足 | 报告置信区间而非点估计 |

## 验证、验收与复现

### 收敛历史必须按批次报告

把样本分成 10 批，逐批累计均值与方差。若最后三批的均值变化超过总标准误的 20%，说明尚未收敛。$\sigma_Q=2.5$ MPa、$N=10^{4}$ 时总标准误为 $2.5/\sqrt{10^{4}}=0.025$ MPa，最后三批的均值漂移应小于 0.005 MPa。只看终值无法发现这一类未收敛。

### Monte Carlo 的误差率与样本量

$$ \hat{\mu}_N=\frac{1}{N}\sum_{i=1}^{N}Q(\xi_i),\qquad \epsilon_{MC}=\frac{\sigma_Q}{\sqrt{N}} $$

响应标准差 $\sigma_Q=2.5$ MPa 时，$N=10^{4}$ 给出标准误 0.025 MPa。误差按 $N^{-1/2}$ 下降且与输入维数无关，这是 MC 在 20 维以上仍然可用的根本原因。

### UQ 误差必须与离散误差分开报告

$$ \epsilon_{tot}\approx\epsilon_{disc}+\epsilon_{model}+\epsilon_{input} $$

网格收敛研究给出 $\epsilon_{disc}$（例如 GCI=0.5%），模型验证给出 $\epsilon_{model}$，UQ 只负责 $\epsilon_{input}$。若 UQ 的标准差 0.025 MPa 小于网格离散带来的 0.15 MPa 波动，再增加 UQ 样本也没有意义，应先细化网格。

### 留出集验证代理模型

PCE 或高斯过程代理必须在未参与拟合的样本上验证。留出 20%（500 个样本），报告相对预测误差

$$ \epsilon_{test}=\frac{\sqrt{\frac{1}{M}\sum_{m=1}^{M}\left(Q_m-\hat{Q}_m\right)^{2}}}{\left|\bar{Q}\right|} $$

判据为 $\epsilon_{test}<2\%$。训练误差低于 0.1% 而留出误差 8% 是典型过拟合，应降阶或加正则；反过来训练误差 3%、留出误差 3.2% 说明模型欠拟合，应升阶。

### Sobol 指数要报稳定性

一阶 Sobol 指数在样本翻倍时的变化应小于 0.02。$S_1$ 从 0.62 变到 0.58（变化 0.04）说明样本不足，此时不能得出"参数 1 主导"的结论。稳健的做法是给出指数随样本量的收敛曲线，而不是单一数值。

### 尾部概率的不确定度远超均值

$$ \mathrm{CoV}\left[\hat{P}_f\right]=\sqrt{\frac{1-P_f}{N P_f}} $$

$P_f=10^{-3}$、$N=10^{4}$ 时 $\mathrm{CoV}=\sqrt{0.999/10}=0.316$，即相对误差 31.6%，$10^{4}$ 次求解只观察到 10 次失效。Wilson 95% 区间为 $[5.4\times10^{-4},\ 1.84\times10^{-3}]$，上下限相差 3.4 倍。要把它压到 ±10%，样本量需再增加约 10 倍到 $10^{5}$，或改用子集模拟。

## 参考资料

1. Ghanem R., Spanos P., *Stochastic Finite Elements: A Spectral Approach*, Springer, 1991.
2. Xiu D., Karniadakis G.E., "The Wiener–Askey polynomial chaos for stochastic differential equations," *SIAM Journal on Scientific Computing*, 24, 2002.
3. Sobol I.M., "Global sensitivity indices for nonlinear mathematical models and their Monte Carlo estimates," *Mathematics and Computers in Simulation*, 55, 2001.
4. Sudret B., "Global sensitivity analysis using polynomial chaos expansions," *Reliability Engineering & System Safety*, 93, 2008.
5. Saltelli A., Ratto M., Andres T., Campolongo F., Cariboni J., Gatelli D., Saisana M., Tarantola S., *Global Sensitivity Analysis: The Primer*, Wiley, 2008.
6. McKay M.D., Beckman R.J., Conover W.J., "A comparison of three methods for selecting values of input variables in the analysis of output from a computer code," *Technometrics*, 21, 1979.
7. Xiu D., *Numerical Methods for Stochastic Computations: A Spectral Method Approach*, Princeton University Press, 2010.
8. Eldred M.S., Burkardt J., "Comparison of non-intrusive polynomial chaos and stochastic collocation methods for uncertainty quantification," *AIAA Paper 2009-976*, 2009.
9. Joe S., Kuo F.Y., "Constructing Sobol sequences with better two-dimensional projections," *SIAM Journal on Scientific Computing*, 30, 2008.
10. Nelsen R.B., *An Introduction to Copulas*, 2nd ed., Springer, 2006.
11. Owen A.B., *Monte Carlo theory, methods and examples*, 2013.
12. Efron B., Tibshirani R.J., *An Introduction to the Bootstrap*, Chapman & Hall/CRC, 1993.
13. Sobol I.M., "Sensitivity estimates for nonlinear mathematical models," *Mathematical Modelling and Computational Experiments*, 1, 1993.
14. Crestaux T., Le Maître O., Martinez J.-M., "Polynomial chaos expansion for sensitivity analysis," *Reliability Engineering & System Safety*, 94, 2009.
15. Bilionis I., Zabaras N., "Bayesian uncertainty propagation using Gaussian processes," *Journal of Computational Physics*, 227, 2008.
