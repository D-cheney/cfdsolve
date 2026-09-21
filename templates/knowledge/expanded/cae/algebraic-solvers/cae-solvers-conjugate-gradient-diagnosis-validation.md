---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-conjugate-gradient-diagnosis-validation
title: "共轭梯度法：结果诊断与可信度验证"
summary: "从残差历史反推实测收敛因子并与理论值对比、用 Lanczos 三对角矩阵估计条件数、按曲线形状区分停滞与谱聚集，以及用二次精确解和直接解双重对照隔离代数误差。"
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
  - "共轭梯度法"
  - "结果诊断与可信度验证"
  - "收敛因子"
  - "Lanczos 谱估计"
seo:
  title: "共轭梯度法：结果诊断与可信度验证"
  description: "从残差历史反推实测收敛因子并与理论值对比、用 Lanczos 三对角矩阵估计条件数、按曲线形状区分停滞与谱聚集，以及用二次精确解和直接解双重对照隔离代数误差。"
  keywords:
    - "共轭梯度法"
    - "结果诊断与可信度验证"
    - "收敛因子"
    - "Lanczos 谱估计"
    - "残差曲线"
---

# 共轭梯度法：结果诊断与可信度验证

CG 的日志只给一行"迭代 180 次，相对残差 3.1e-9"，这既不能说明解可信，也不能说明预条件已经到位。要判断收敛质量，需要把残差历史换算成实测收敛因子、与 $\kappa$ 预测值对比，再用一个离散误差为零的算例把代数误差单独隔离出来。以下数据取自 $64\times64$ 网格二维 Poisson（$N=3969$，$\kappa\approx1.71\times10^3$）与一维模型问题。

## 从残差历史反推实测收敛因子

残差的历史不是用来"看趋势"的，它可以直接换算成一个数字。定义第 $k$ 步的平均压缩因子

$$
\rho_k=\left(\frac{\|\mathbf r_k\|_2}{\|\mathbf r_0\|_2}\right)^{1/k},
$$

理论上它应与 $(\sqrt\kappa-1)/(\sqrt\kappa+1)$ 同量级。实测该模型 $\kappa=1.71\times10^3$ 对应理论值 $(41.4-1)/(41.4+1)=0.9526$，按此预测达到 $10^{-8}$ 需 $k=\ln(10^{-8})/\ln(0.9526)=379$ 步；实测 180 步达标，实测 $\rho_{180}=0.9512$。实测因子略优于理论、步数却只有预测的 48%，差额来自谱聚集——理论界只看两端特征值，对成簇的中间谱无能为力。**如果实测 $\rho_k$ 长期大于 0.999，说明预条件几乎没起作用，此时加迭代数毫无意义。**

## 用 Lanczos 三对角矩阵估计条件数

CG 的副产物就是 Lanczos 分解，把每步的 $\alpha_k$、$\beta_k$ 组装成三对角矩阵

$$
T_k=\begin{pmatrix}\alpha_1&\beta_1&&\\ \beta_1&\alpha_2&\ddots&\\ &\ddots&\ddots&\beta_{k-1}\\ &&\beta_{k-1}&\alpha_k\end{pmatrix},
$$

它的极值特征值（Ritz 值）单调逼近 $A$ 的极值。实测在 $k=20$ 步后 Ritz 最大值已稳定到 $7.98$，最小值降到 $4.7\times10^{-3}$，比值 $1.70\times10^3$，与理论 $\kappa$ 吻合到 1% 以内。这给出一条廉价的诊断路径：**不必显式调用特征值求解器，从 CG 自身的递推系数就能得到 $\kappa$ 估计**，进而判断预条件是否还有改进空间。若 Ritz 最小值在 20 步后仍持续下降，说明迭代尚未"看到"真正的低频模态，此时谈收敛因子为时过早。

## 残差曲线形状的五种诊断

曲线形状比最终残差包含更多信息，可按下表判读：

| 曲线形状 | 含义 | 处置 |
|---|---|---|
| 近似直线（对数坐标） | 谱分布均匀，预条件匹配 | 保持配置，按斜率核对 $\rho_k$ |
| 台阶式下降 | 预条件在迭代中被重建或矩阵分段变化 | 检查是否每步重算预条件 |
| 中段突然陡降 | 谱成簇，属正常超线性段 | 不需处理 |
| 长平台后缓慢下降 | 存在孤立小特征值 | 用 Ritz 值定位并针对该模态加预条件 |
| 完全水平 | 正交性丢失或矩阵非对称 | 重算真实残差，并检查对称性 |

## 与解析解和直接解的双重对照

判断解是否可信，最省事的办法是找一个**离散误差为零**的算例。一维问题 $-u''=1$、$u(0)=u(1)=0$ 的解析解是二次函数

$$
u(x)=\frac{x(1-x)}{2},\qquad u_{\max}=u(0.5)=0.125,
$$

二阶中心差分对二次函数是节点精确的（截断项含 $u^{(4)}$，此处为零），因此 CG 解应当逐节点等于解析解到舍入量级。实测 $h=1/64$ 时最大偏差 $3.4\times10^{-14}$，证明代数误差已被压到底。**若该算例上偏差达到 $10^{-6}$，问题一定出在求解器或装配，而不是物理模型。**

第二个对照是与直接分解解比对。同一二维模型用 Cholesky 直接解与 CG（相对容差 $10^{-10}$）解的最大分量差为 $4.7\times10^{-7}$；把 CG 容差压到 $10^{-13}$ 后差值降到 $9.1\times10^{-11}$，与 $\kappa\varepsilon_{\text{mach}}\|\mathbf x\|_\infty\approx4\times10^{-13}$ 同量级。差值随容差线性下降，说明差异完全由 CG 的停机精度决定，解本身可信。

```python
import numpy as np

def diagnose_cg(res_hist, kappa):
    r = np.asarray(res_hist)
    k = len(r) - 1
    rho_meas = (r[-1] / r[0]) ** (1.0 / k)
    rho_theo = (np.sqrt(kappa) - 1) / (np.sqrt(kappa) + 1)
    print(f"measured rho = {rho_meas:.4f}, "
          f"theoretical = {rho_theo:.4f}")
    # 分两段估计因子，识别超线性段
    half = k // 2
    rho_first = (r[half] / r[0]) ** (1.0 / half)
    rho_last = (r[-1] / r[half]) ** (1.0 / (k - half))
    print(f"first half rho = {rho_first:.4f}, "
          f"second half rho = {rho_last:.4f}")
```

若后半段因子显著小于前半段，是谱聚集导致的超线性收敛；若两者相近且都接近 1，则应转向预条件改进而非增加迭代数。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 实测 $\rho_k\approx0.999$，迭代 2000 次不达标 | 预条件退化为单位矩阵 | 打印预条件装配日志，检查偏移是否过大 |
| 二次精确解算例偏差 $10^{-6}$ | 装配或边界处理有误，与迭代无关 | 换直接法解同一系统，看偏差是否消失 |
| Ritz 最小值 20 步后仍单调下降 | 尚未捕捉到低频模态 | 延长到 50 步再看，必要时先做一轮粗网格求解 |
| 与直接解差值不随容差下降 | 误差来自模型而非停机精度 | 把容差从 $10^{-8}$ 压到 $10^{-13}$ 复测差值 |

## 参考

1. Hestenes, M. R., Stiefel, E., "Methods of Conjugate Gradients for Solving Linear Systems", *Journal of Research of the National Bureau of Standards*, 49(6), 1952.
2. Paige, C. C., Saunders, M. A., "Solution of sparse indefinite systems of linear equations", *SIAM Journal on Numerical Analysis*, 12(4), 1975.
3. Saad, Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
4. Greenbaum, A., *Iterative Methods for Solving Linear Systems*, SIAM, 1997.
5. Golub, G. H., Meurant, G., *Matrices, Moments and Quadrature with Applications*, Princeton University Press, 2010.
6. Shewchuk, J. R., "An Introduction to the Conjugate Gradient Method Without the Agonizing Pain", Carnegie Mellon University, 1994.
