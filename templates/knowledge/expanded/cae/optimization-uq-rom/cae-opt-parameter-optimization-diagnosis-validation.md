---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-parameter-optimization-diagnosis-validation
title: "参数优化：结果诊断与可信度验证"
summary: "以 KKT 残差、解析算例标定、多起点聚类与目标改善量对数值噪声的比值四组指标审查参数优化结果，给出假收敛与局部解的识别试验及具体阈值。"
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
  - "参数优化"
  - "结果诊断与可信度验证"
  - "KKT 残差"
  - "多起点聚类"
seo:
  title: "参数优化：结果诊断与可信度验证"
  description: "以 KKT 残差、解析算例标定、多起点聚类与目标改善量对数值噪声的比值四组指标审查参数优化结果，给出假收敛与局部解的识别试验及具体阈值。"
  keywords:
    - "参数优化"
    - "结果诊断与可信度验证"
    - "KKT 残差"
    - "局部最优"
    - "数值噪声"
---

# 参数优化：结果诊断与可信度验证

参数优化给出的只是一个"最优点"，验证它要回答三个问题：它是否满足一阶最优条件、它是不是全局的、以及它的最优值是否被数值误差污染。三类检查都要有独立证据。

## 用可解析算例标定求解器

Rosenbrock 函数

$$ f(x,y)=(1-x)^{2}+100\left(y-x^{2}\right)^{2} $$

的唯一全局极小在 $(1,1)$，$f=0$；在原点 $(0,0)$ 处 $f=1$。用同一求解器从 $(-1.2,1)$ 出发应回到 $(1,1)$ 且梯度无穷范数低于 $10^{-6}$。这一步用来确认缩放、步长与容差配置无误，之后再上真实模型，否则模型层面的错误会被算例掩盖。

## KKT 残差是收敛的硬判据

$$ r_{KKT}=\left\lVert\nabla f+\sum_i\lambda_i\nabla g_i+\sum_j\mu_j\nabla h_j\right\rVert_{\infty}+\left\lVert\max\left(0,\mathbf{g}\right)\right\rVert_{\infty}+\left\lVert\mathbf{h}\right\rVert_{\infty} $$

判据为 $r_{KKT}<10^{-6}$。若目标在最后 20 次迭代只下降 0.01% 而 $r_{KKT}$ 仍停在 $10^{-3}$，是约束容差过松而非真正收敛，此时报告"已收敛"是错的。

## 多起点识别局部解

从 20 个 LHS 初值出发，把最优值按 1% 的相对容差聚类。若得到 3 个聚类且最优值相差 12%，说明目标多峰。报告必须给出每个聚类的吸引域占比，不能只报最好的那一个——因为工程上初值往往来自既有设计，落在哪个吸引域是已知的。

## 约束违反要按类型分解

等式约束违反 $\lVert\mathbf{h}\rVert_\infty$、不等式违反 $\lVert\max(0,\mathbf{g})\rVert_\infty$、以及活跃约束的乘子符号必须分别报告。乘子为负意味着约束被错误判定为活跃，这是最常见的一类假收敛。互补松弛条件 $\lambda_i g_i=0$ 也应逐项核对。

## 目标改善量必须超过数值噪声

求解器容差 $10^{-6}$、目标量级 $10^{4}$ 时，相对噪声约 $10^{-10}$；若优化前后目标只改善 $10^{-4}$，改善量与噪声同量级，结论不成立。判据：目标改善量必须比求解器相对容差大至少两个数量级。更严格的做法是在同一点用两种容差各求一次，比较目标值差异作为噪声量级。

## 诊断表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $r_{KKT}=10^{-3}$ 但目标不再下降 | 约束容差过松 | 收紧到 $10^{-6}$ 重跑 |
| 20 起点得到 3 个最优值 | 目标多峰 | 报告各聚类吸引域占比 |
| 活跃约束乘子为负 | 约束不应活跃 | 放开该约束重解 |
| 目标改善量 $10^{-4}$ | 与求解器噪声同量级 | 收紧求解器容差后重算 |
| 梯度校核误差 50% | 步长不合适 | 扫 $h\in[10^{-6},10^{-2}]$ 找误差最小点 |
| Rosenbrock 算例未回到 $(1,1)$ | 缩放或容差配置错误 | 先修算例再上真实模型 |

```python
import numpy as np

def kkt_residual(grad_f, cons, x, lam, mu):
    r = grad_f(x).copy()
    for l, g in zip(lam, cons["ineq"]):
        r += l * g["grad"](x)
    for m, h in zip(mu, cons["eq"]):
        r += m * h["grad"](x)
    viol_ineq = np.max(np.maximum(0.0, [g["fun"](x) for g in cons["ineq"]]))
    viol_eq = np.max(np.abs([h["fun"](x) for h in cons["eq"]]))
    return np.max(np.abs(r)) + viol_ineq + viol_eq      # 判据 < 1e-6
```

## 参考文献

1. Moré J.J., Garbow B.S., Hillstrom K.E., "Testing unconstrained optimization software," *ACM Transactions on Mathematical Software*, 7, 1981.
2. Dennis J.E., Schnabel R.B., *Numerical Methods for Unconstrained Optimization and Nonlinear Equations*, SIAM, 1996.
3. Rios L.M., Sahinidis N.V., "Derivative-free optimization: a review of algorithms and comparison of software implementations," *Journal of Global Optimization*, 56, 2013.
4. Kolda T.G., Lewis R.M., Torczon V., "Optimization by direct search: new perspectives on some classical and modern methods," *SIAM Review*, 45, 2003.
5. Gill P.E., Murray W., Wright M.H., *Practical Optimization*, Academic Press, 1981.
