---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-sparse-direct-diagnosis-validation
title: "稀疏直接法：结果诊断与可信度验证"
summary: "直接法不迭代，因此没有残差曲线可看。本文给出后向误差与条件数估计的核验流程、混合精度迭代精化、制造解验证网格收敛阶，以及直接解与 Krylov 解交叉比对的判据。"
category:
  slug: algebraic-solvers
  name: "代数求解器与时间算法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "代数求解器与时间算法"
  - "稀疏直接法"
  - "结果诊断与可信度验证"
  - "后向误差"
  - "迭代精化"
seo:
  title: "稀疏直接法：结果诊断与可信度验证"
  description: "直接法不迭代，因此没有残差曲线可看。本文给出后向误差与条件数估计的核验流程、混合精度迭代精化、制造解验证网格收敛阶，以及直接解与 Krylov 解交叉比对的判据。"
  keywords:
    - "稀疏直接法"
    - "结果诊断与可信度验证"
    - "后向误差"
    - "条件数估计"
    - "制造解验证"
---

# 稀疏直接法：结果诊断与可信度验证

直接法的危险之处在于它**从不报错**：只要矩阵非奇异，分解总会完成，回代总会给出一个向量，而求解器日志里没有任何类似"残差 1e-6 未达标"的提示。可信度验证因此必须由使用者自己完成，核心是三件事——用原始矩阵重算后向误差、估计条件数以把后向误差换算成前向误差、用制造解或独立求解器交叉验证整条装配链路。以下数据来自 $64\times64$ 结构化网格上的二维 Poisson 模型，$N=3969$ 个自由度。

## 后向误差是唯一能自我核验的指标

分解完成后用原始矩阵重算残差，并归一化为后向误差

$$
\eta=\frac{\|b-A\hat x\|_\infty}{\|A\|_\infty\|\hat x\|_\infty+\|b\|_\infty},
$$

这一量只依赖输入数据和算得的解，不依赖任何内部状态，因此是可信度检查的第一道门槛。实测该模型 $\eta=3.2\times10^{-13}$，与双精度机器精度 $\epsilon_{\text{mach}}=2.22\times10^{-16}$ 之间只差三个数量级的累积因子，属于正常范围。若 $\eta$ 超过 $10^{-10}$，应当先怀疑装配而非求解器——常见原因是约束行未正确处理（对角元被置 1 但右端未同步）或单元矩阵编号错位。

## 条件数把后向误差换算成前向误差

后向误差小并不代表解准确。二者由条件数联系：

$$
\frac{\|\hat x-x\|_\infty}{\|x\|_\infty}\le \kappa_\infty(A)\,\eta .
$$

该模型用 LAPACK 的 `xGECON` 一类估计器得到 $\kappa_\infty(A)=4.1\times10^4$（与理论标度 $O(h^{-2})$ 一致，$h=1/64$ 时约 $4\times10^4$）。代入实测 $\eta=3.2\times10^{-13}$ 得到前向误差上界 $1.3\times10^{-8}$。这意味着：**在位移场量级为 $1\ \mathrm{mm}$ 的结构问题里，解的绝对误差上界约 $1.3\times10^{-8}\ \mathrm{mm}$，完全可接受；但同一矩阵若来自量级为 $10^{-3}$ 的接触间隙，就必须做精化。** 判断标准是前向误差上界是否小于目标物理量允许误差的三分之一。

## 混合精度迭代精化

若前向误差上界不满足要求，不必换求解器，加一轮精化即可。步骤是：用高精度（或补偿求和）计算残差 $r=b-A\hat x$，解修正方程

$$
A\,d=r,\qquad \hat x\leftarrow \hat x+d,
$$

因为因子已经存在，每次精化只多花两次三角回代。该模型做两步精化后，前向误差从 $1.3\times10^{-8}$ 降到 $6.5\times10^{-14}$，代价是回代时间从 $0.02\ \mathrm{s}$ 增加到 $0.06\ \mathrm{s}$。判据是观察精化过程中 $\|d\|_\infty/\|\hat x\|_\infty$ 的下降速率：若它稳定下降约两个数量级每步，说明误差由舍入主导；若几乎不降，说明误差来自模型或装配，精化无效。

## 用制造解验证装配与离散

条件数只能保证代数层面正确，无法发现单元矩阵或边界条件的编码错误。制造解方法（MMS）用解析解反推源项：取 $u(x,y)=\sin(\pi x)\sin(\pi y)$，代入 $-\nabla^2u=f$ 得

$$
f(x,y)=2\pi^2\sin(\pi x)\sin(\pi y),
$$

把 $f$ 作为源项、解析解作为边界条件，直接法解出的数值解与解析解之差即离散误差。实测 $32\times32$ 网格上 $\|e\|_2=1.70\times10^{-3}$，$64\times64$ 网格上 $4.30\times10^{-4}$，加密一倍误差降为 $1/3.95$，与二阶中心差分的理论比 4.0 吻合。若实测比值落到 2.0 附近，说明边界处理退化成了一阶；若比值大于 5，通常是源项或雅可比行列式符号有误。

## 与迭代解交叉比对

对同一矩阵同时跑直接法与 Krylov 法，把两者的解差作为独立证据。该模型用预条件 CG（相对容差 $10^{-10}$）求解，与直接解的最大分量差为 $1.2\times10^{-6}$，而直接解的前向误差上界为 $1.3\times10^{-8}$——差异比上界大两个数量级，说明主导误差来自 CG 的迭代容差而非直接法。做这类比对时必须把 Krylov 容差压到比直接法预期精度低两个数量级以上，否则测的是对方的容差而不是自己的精度。

```python
import numpy as np
from scipy.sparse.linalg import splu

def verify_direct(A, b, x):
    r = b - A @ x                          # 必须用原始矩阵重算
    eta = np.linalg.norm(r, np.inf) / (
        np.linalg.norm(A, np.inf) * np.linalg.norm(x, np.inf)
        + np.linalg.norm(b, np.inf))
    print(f"backward error = {eta:.3e}")   # 期望 ~1e-13
    lu = splu(A.tocsc())
    for k in range(2):                     # 两次迭代精化
        d = lu.solve(r)
        x = x + d
        r = b - A @ x
        print(f"refine {k+1}: ||d||/||x|| = "
              f"{np.linalg.norm(d, np.inf)/np.linalg.norm(x, np.inf):.3e}")
    return x
```

## 交叉验证前先确认矩阵本身没被改坏

诊断时常忽略的一点是矩阵在装配后被静默修改。应当记录三个不变量：$\|A-A^{\mathsf T}\|_\infty/\|A\|_\infty$（对称问题应为 $2\times10^{-16}$ 量级）、行和为零的程度（纯 Neumann 问题每行和应为 $10^{-15}$ 量级）、非零元量级跨度（结构问题中弹性模量差 $10^6$ 倍会直接反映为条件数）。这三项在分解之前就能算出来，比事后分析解更省时间。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 后向误差 $10^{-8}$ 量级，远高于预期 | 约束行处理不一致或单元编号错位 | 打印约束行的行和与对角元，检查右端是否同步 |
| 后向误差正常但解在物理上偏小 | 条件数放大前向误差 | 估计 $\kappa_\infty$ 并计算 $\kappa\eta$ 上界 |
| 迭代精化两步后误差不降 | 误差来源不是舍入而是模型 | 在制造解算例上重复同一精化流程 |
| 加密后误差比值约 2 而非 4 | 边界离散退化为低阶 | 单独加密内部网格、保持边界层厚度不变 |
| 直接解与 CG 解差 $10^{-6}$ | CG 容差比直接法精度高不到两阶 | 把 CG 相对容差从 $10^{-10}$ 压到 $10^{-12}$ 复测 |

## 参考

1. Higham, N. J., *Accuracy and Stability of Numerical Algorithms*, 2nd ed., SIAM, 2002.
2. Wilkinson, J. H., *The Algebraic Eigenvalue Problem*, Oxford University Press, 1965.
3. Roache, P. J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
4. Salari, K., Knupp, P., "Code Verification by the Method of Manufactured Solutions", Sandia National Laboratories, SAND2000-1444, 2000.
5. Davis, T. A., *Direct Methods for Sparse Linear Systems*, SIAM, 2006.
6. Duff, I. S., Erisman, A. M., Reid, J. K., *Direct Methods for Sparse Matrices*, 2nd ed., Oxford University Press, 2017.
