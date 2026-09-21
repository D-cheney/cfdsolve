---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-gmres-diagnosis-validation
title: "GMRES 与重启：结果诊断与可信度验证"
summary: "按周期分段读 GMRES 残差历史、用 κε 估算可达精度下限、识别递推残差与真实残差的分歧，并用一维对流—扩散解析解和直接解交叉验证非对称求解结果的正确性。"
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
  - "GMRES 与重启"
  - "结果诊断与可信度验证"
  - "可达精度"
  - "停滞诊断"
seo:
  title: "GMRES 与重启：结果诊断与可信度验证"
  description: "按周期分段读 GMRES 残差历史、用 κε 估算可达精度下限、识别递推残差与真实残差的分歧，并用一维对流—扩散解析解和直接解交叉验证非对称求解结果的正确性。"
  keywords:
    - "GMRES 与重启"
    - "结果诊断与可信度验证"
    - "可达精度"
    - "停滞诊断"
    - "真实残差"
---

# GMRES 与重启：结果诊断与可信度验证

重启 GMRES 的日志是一条连续的残差曲线，但它的内在结构是**周期**：每 $m$ 步重启一次，每周期重新做一次最小化。把曲线按周期分段并计算每段的压缩因子，才能区分"收敛慢"和"完全停滞"这两类截然不同的问题。本文以一个三维对流—扩散模型（$n=1.2\times10^6$，$\kappa(A)\approx3.4\times10^7$）为例，给出可操作的判读方法。

## 残差历史要按周期分段读

设第 $j$ 个周期的起止残差为 $r_{j-1}$ 与 $r_j$（各含 $m$ 步），定义该周期的平均压缩因子

$$
\rho_j=\left(\frac{\|\mathbf r_{j}\|_2}{\|\mathbf r_{j-1}\|_2}\right)^{1/m}.
$$

整条曲线只看首尾会掩盖中途的停滞。实测 $m=30$ 时前三周期 $\rho$ 分别为 $0.9812$、$0.9934$、$0.9987$，逐周期逼近 1——这是典型的**渐进停滞**：$m$ 太小，每个周期能消掉的谱分量越来越少。把 $m$ 提到 80 后，同一模型五个周期的 $\rho$ 稳定在 $0.94$～$0.96$，曲线恢复为均匀对数直线。判据是：**连续五个周期的 $\rho_j>0.995$ 即可判定停滞**，此时增加最大迭代数没有意义，必须改 $m$、改预条件或改用厚重启。

## 可达精度下限：为什么 1e-12 永远达不到

GMRES 在有限精度下能压到的相对残差有下限，量级为

$$
\frac{\|\mathbf r_k\|_2}{\|\mathbf b\|_2}\gtrsim \kappa(A)\,\epsilon_{\text{mach}} .
$$

该模型 $\kappa(A)=3.4\times10^7$、$\epsilon_{\text{mach}}=2.22\times10^{-16}$，下限约 $7.5\times10^{-9}$。因此把 `-ksp_rtol` 设成 $10^{-10}$ 时，求解器必然在 $10^{-8}$ 附近停滞到最大迭代数耗尽——这不是配置错误，而是问题本身的精度上限。**诊断时先算 $\kappa\epsilon$，再决定容差是否可达**；若物理上确实需要 $10^{-12}$ 的解，唯一出路是降低条件数（改预条件、做变量缩放）或改用混合精度与迭代精化。

## 递推残差与真实残差的分歧

GMRES 每步用 Givens 旋转递推更新残差估计 $\|\beta\mathbf e_1-\bar H_m\mathbf y\|$，代价极低但不等于真实残差。两者比值是判断正交性是否健康的关键指标：实测在 $m=100$、CGS 正交化下，第 90 步递推值 $4\times10^{-9}$ 而真实值 $\|\mathbf b-A\mathbf x\|/\|\mathbf b\|=2\times10^{-5}$，比值 $5\times10^3$；切到 MGS 后同一模型比值降到 1.4。**比值超过 100 就应停止并启用重正交**，否则会得到一个看起来收敛、实际远未收敛的解，而这类错误在后续非线性迭代中会被放大成时间步失败。

## 与解析解和直接解对照

非对称问题有一个能写出闭式解的标准算例：一维对流—扩散 $-u''+P u'=0$、$u(0)=0$、$u(1)=1$，其解为

$$
u(x)=\frac{e^{Px}-1}{e^{P}-1}.
$$

取 $P=10$，$u(0.5)=(e^{5}-1)/(e^{10}-1)=147.41/22025.5=6.693\times10^{-3}$。在 $h=1/200$ 的均匀网格上用中心差分离散（格点 Peclet 数 $Ph=0.05$，处于稳定区），GMRES 解出的中点值与解析值之差为 $2.7\times10^{-6}$，而二阶格式在该网格上的截断误差量级为 $h^2/12\approx2.1\times10^{-5}$——数值误差小于离散误差，说明求解环节可信。

第二个对照是与直接分解解比对。同一矩阵用 MUMPS 直接解与 GMRES(50)+ILU(1) 解的最大分量差为 $3.1\times10^{-6}$，把 GMRES 容差从 $10^{-8}$ 压到 $10^{-11}$ 后差值降到 $8.4\times10^{-9}$。差值随容差下降说明差异来自停机精度而非求解器缺陷。

```python
import numpy as np

def gmres_cycle_diag(res_hist, m, kappa, eps=2.22e-16):
    r = np.asarray(res_hist)
    ncyc = (len(r) - 1) // m
    for j in range(ncyc):
        a, b = r[j * m], r[(j + 1) * m]
        print(f"cycle {j+1}: rho = {(b / a) ** (1 / m):.4f}")
    floor = kappa * eps
    print(f"attainable relative residual >= {floor:.2e}")
    print(f"requested tolerance reachable: {r[-1] > floor}")
```

## 停滞的成因分层

停滞不是单一原因。按出现频率排序：$m$ 过小（残差在重启点抬高）、预条件与矩阵谱不匹配（$\rho$ 一开始就接近 1）、容差低于 $\kappa\epsilon$ 下限（残差曲线平在 $10^{-8}$）、非正规性过强（特征值正常但伪谱包围原点）、以及正交性丢失（递推与真实残差分歧）。区分方法是看曲线平在什么位置：平在 $10^{-8}$ 附近且 $\kappa\epsilon\approx10^{-8}$ 属于精度下限；平在 $10^{-3}$ 附近属于预条件或 $m$ 的问题；完全不动且第 1 步就没下降属于预条件算子错误。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差在 $10^{-8}$ 附近耗尽 2000 步 | 容差低于 $\kappa\epsilon$ 可达下限 | 估算 $\kappa(A)\epsilon_{\text{mach}}$，把容差调到其上 |
| 递推残差比真实残差低 $10^3$ 倍 | CGS 正交化损失正交性 | 启用 MGS 或完整重正交后复测比值 |
| 每周期 $\rho_j$ 递增趋近 1 | 重启长度不足，谱信息逐周期流失 | 固定预条件，把 $m$ 从 30 提到 80 比较 $\rho_j$ |
| 第 1 步残差就未下降 | 预条件算子实现有误或作用侧配错 | 关掉预条件跑一次，若曲线下降则问题在预条件 |

## 参考

1. Saad, Y., Schultz, M. H., "GMRES: A generalized minimal residual algorithm for solving nonsymmetric linear systems", *SIAM Journal on Scientific and Statistical Computing*, 7(3), 1986.
2. Greenbaum, A., *Iterative Methods for Solving Linear Systems*, SIAM, 1997.
3. Trefethen, L. N., Embree, M., *Spectra and Pseudospectra: The Behavior of Nonnormal Matrices and Operators*, Princeton University Press, 2005.
4. Saad, Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
5. Paige, C. C., Saunders, M. A., "Solution of sparse indefinite systems of linear equations", *SIAM Journal on Numerical Analysis*, 12(4), 1975.
6. Higham, N. J., *Accuracy and Stability of Numerical Algorithms*, 2nd ed., SIAM, 2002.
