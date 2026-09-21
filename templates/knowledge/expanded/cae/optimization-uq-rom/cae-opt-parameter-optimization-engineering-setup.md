---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-parameter-optimization-engineering-setup
title: "参数优化：工程设置与参数选择"
summary: "给出参数优化的可复现配置：变量缩放、有限差分最优步长的推导、SLSQP 容差与迭代上限、多起点与并行分块策略，以及代理模型初始样本数与期望改进加点数的取值。"
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
  - "参数优化"
  - "工程设置与参数选择"
  - "有限差分步长"
  - "期望改进准则"
seo:
  title: "参数优化：工程设置与参数选择"
  description: "给出参数优化的可复现配置：变量缩放、有限差分最优步长的推导、SLSQP 容差与迭代上限、多起点与并行分块策略，以及代理模型初始样本数与期望改进加点数的取值。"
  keywords:
    - "参数优化"
    - "工程设置与参数选择"
    - "缩放"
    - "期望改进"
    - "SLSQP"
---

# 参数优化：工程设置与参数选择

同一套参数优化代码，换一组缩放或差分步长就可能从收敛变成停滞。本文给出可直接落地的配置项与判据，覆盖梯度型算法、代理模型与并行提交三类场景。

## 缩放是第一步而不是优化后的处理

变量量级相差 $10^{3}$ 以上时，Hessian 条件数会恶化到 BFGS 更新失效。做法是把变量除以名义值：

$$ \hat{x}_i=\frac{x_i}{s_i},\qquad s_i=\max\left(\frac{|x_i^{lo}|+|x_i^{up}|}{2},\ 10^{-12}\right) $$

半径 20 mm 与厚度 2 mm 同时作为变量时，$s$ 分别取 20 与 2，缩放后两者都在 1 附近，梯度的量级也随之可比。

## 有限差分步长的最优量级

求解器残差容差为 $10^{-6}$ 时函数值噪声约 $10^{-6}$。中心差分误差由噪声项 $\epsilon/h$ 与截断项 $h^{2}f'''/6$ 竞争，最优步长

$$ h^{\star}=\left(\frac{6\epsilon}{|f'''|}\right)^{1/3} $$

取 $\epsilon=10^{-6}$、$|f'''|\approx1$，得 $h^\star\approx1.8\times10^{-2}$（相对步长）。工程常用 $10^{-3}\sim10^{-2}$；取 $10^{-6}$ 会因噪声得到完全错误的梯度方向。

## 算法与容差配置

| 配置项 | 取值 | 说明 |
|---|---|---|
| 算法 | SLSQP | 含等式与不等式约束 |
| 最优性容差 | $10^{-6}$ | 梯度无穷范数 |
| 约束容差 | $10^{-6}$ | 最大违反量 |
| 最大迭代 | 200 | 单起点 |
| 相对差分步长 | $10^{-3}$ | 无解析梯度时 |
| 多起点数 | 5 | LHS 抽样 |
| 并行核数 | 12 | 按评估分块 |
| 代理初始样本 | 64 | 8 变量 |
| EI 加点数 | 20 | 序贯加点 |

8 个变量取 64 个 LHS 样本，平均每个维度 8 个点；再加 20 个 EI 加点，总评估 84 次。若 84 次后代理的相对预测误差仍高于 5%，说明响应非光滑，应改用 CMA-ES 直接搜索。

## 期望改进准则与采样边界

代理模型给出预测均值 $\mu$ 与标准差 $\sigma$，相对当前最优 $f_{min}$ 的期望改进

$$ EI(\mathbf{x})=\left(f_{min}-\mu\right)\Phi(z)+\sigma\,\phi(z),\qquad z=\frac{f_{min}-\mu}{\sigma} $$

$\Phi$、$\phi$ 是标准正态分布函数与密度。$z<-3$ 的点几乎不会被选中，因此要靠显式的变量边界把搜索限制在物理可行域内，而不是指望 EI 自动避开。

```python
import numpy as np
from scipy.optimize import minimize
from scipy.stats import qmc

def optimize(f, g, x0, lo, hi, nstart=5, maxiter=200):
    s = (np.abs(lo) + np.abs(hi)) / 2.0
    obj = lambda x: f(x * s)
    cons = [{"type": "ineq", "fun": lambda x: -g(x * s)}]
    sampler = qmc.LatinHypercube(d=len(x0), seed=20260920)
    starts = qmc.scale(sampler.random(nstart), lo, hi)
    best = None
    for x in starts:
        r = minimize(obj, x / s, method="SLSQP",
                     bounds=list(zip(lo / s, hi / s)),
                     constraints=cons,
                     options=dict(ftol=1e-6, maxiter=maxiter, eps=1e-3))
        if best is None or r.fun < best.fun:
            best = r
    return best          # 5 起点取最优, 并记录聚类结果
```

## 并行提交与失败重试

参数评估天然并行，按 12 核分块提交，每块 8 个评估。求解失败的样本必须显式记录并重试 2 次，若仍失败则标记为缺失并排除出代理训练集；把失败样本当作"目标值很大"会污染响应面，让优化器绕开本可行但求解器不稳定的区域。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 迭代 1 次即"收敛" | 差分步长过大，梯度被截断 | 步长从 $10^{-2}$ 降到 $10^{-3}$ |
| 梯度方向随机跳变 | 步长小于求解器噪声 $10^{-6}$ | 收紧求解器容差或放大步长 |
| 最优值随起点变化 20% | 目标多峰 | 5 起点聚类比较 |
| 约束违反停在 $10^{-4}$ | 约束与目标量级差过大 | 归一化约束后重跑 |
| 代理预测误差 8% | 响应非光滑 | 改用 CMA-ES |
| 部分样本目标值异常大 | 求解失败被当成目标值 | 记录求解状态并重试 |

## 参考文献

1. Box G.E.P., Wilson K.B., "On the experimental attainment of optimum conditions," *Journal of the Royal Statistical Society: Series B*, 13, 1951.
2. Myers R.H., Montgomery D.C., Anderson-Cook C.M., *Response Surface Methodology: Process and Product Optimization Using Designed Experiments*, 4th ed., Wiley, 2016.
3. Deb K., *Multi-Objective Optimization Using Evolutionary Algorithms*, Wiley, 2001.
4. Hansen N., Ostermeier A., "Completely derandomized self-adaptation in evolution strategies," *Evolutionary Computation*, 9, 2001.
5. Nelder J.A., Mead R., "A simplex method for function minimization," *The Computer Journal*, 7, 1965.
