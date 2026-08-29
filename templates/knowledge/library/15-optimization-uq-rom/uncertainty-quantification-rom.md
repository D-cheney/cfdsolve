---
template_version: "flowlab-knowledge/1.0"
slug: uncertainty-quantification-rom
title: 不确定性量化与降阶：Monte Carlo、PCE、POD 和 DMD
summary: 推导 Monte Carlo 估计误差、Polynomial Chaos 投影、POD 的 SVD 最优性、DMD 线性演化近似，并说明代理模型的训练验证隔离。
category:
  slug: optimization-uq-rom
  name: 优化、不确定性与降阶
level: 专题
reading_minutes: 36
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [不确定性量化, Monte Carlo, PCE, POD, DMD, 降阶模型]
seo:
  title: CAE 不确定性量化与 POD/DMD 降阶推导｜流研工坊
  description: 从概率估计、正交多项式和 SVD 推导 CAE UQ 与降阶模型核心算法。
  keywords: [UQ, Monte Carlo, PCE, POD, DMD]
---

# 不确定性量化与降阶：Monte Carlo、PCE、POD 和 DMD

确定性离散误差与输入不确定性必须分开：前者通过网格/时间步验证，后者通过概率、区间或证据模型传播。降阶模型用于降低重复求解成本，但必须给出有效参数域。

## 1. Monte Carlo

对随机输入 $\xi$ 和响应 $Q(\xi)$，独立样本估计

$$
\hat\mu_N=\frac1N\sum_{i=1}^NQ_i,
\qquad
\hat\sigma_N^2=\frac1{N-1}\sum_i(Q_i-\hat\mu_N)^2.
$$

均值标准误差约为 $\sigma/\sqrt N$，收敛率与维数无关但很慢。拉丁超立方和低差异序列改善空间覆盖；稀有失效概率需重要抽样、子集模拟或可靠度方法。

## 2. Polynomial Chaos Expansion

选择与 $\xi$ 分布正交的多项式 $\Psi_\alpha$：

$$
Q(\xi)\approx\sum_{|\alpha|\le p}c_\alpha\Psi_\alpha(\xi).
$$

投影系数

$$
c_\alpha=\frac{\mathbb E[Q\Psi_\alpha]}{\mathbb E[\Psi_\alpha^2]}.
$$

可用随机 Galerkin 联立求解，或非侵入式求积/回归。光滑低维响应收敛快；间断、强非线性和高维导致项数 $\binom{d+p}{p}$ 激增，应使用稀疏、自适应或局部分解。

## 3. POD/SVD

把去均值快照组成 $X=[x_1,\ldots,x_m]$，SVD

$$
X=U\Sigma V^T.
$$

前 $r$ 个左奇异向量 $\Phi=U_{:,1:r}$ 在二范数意义下给出最佳秩-$r$ 近似：

$$
\min_{\mathrm{rank}(\tilde X)=r}\|X-\tilde X\|_F^2=\sum_{i>r}\sigma_i^2.
$$

令状态 $x\approx\bar x+\Phi a$，Galerkin 投影残量得到低维 ODE。对流主导问题的移动结构难以由少量固定模态表示；超降阶 DEIM、GNAT 用于降低非线性项组装成本。

## 4. DMD

快照对 $X=[x_1,\ldots,x_{m-1}]$、$X'=[x_2,\ldots,x_m]$，寻找 $X'\approx AX$。用截断 SVD $X=U_r\Sigma_rV_r^T$：

$$
\tilde A=U_r^TX'V_r\Sigma_r^{-1}.
$$

求 $\tilde A W=W\Lambda$，DMD 模态

$$
\Phi=X'V_r\Sigma_r^{-1}W.
$$

特征值给出离散时间增长/衰减和频率。DMD 是数据上的最佳线性演化近似，不等同于识别了真实非线性物理。

## 5. 训练、验证与可信边界

- 训练、验证和最终测试样本必须隔离；
- 参数采样覆盖实际使用域，禁止无声明外推；
- 误差同时报告状态范数与工程量；
- ROM 误差、原始高保真模型误差和输入不确定性分别量化；
- 在线稳定性和守恒可能需要结构保持、约束或闭合模型。

## 6. 参考资料

1. Xiu & Karniadakis, “The Wiener–Askey Polynomial Chaos”, 2002.
2. Sirovich, “Turbulence and the Dynamics of Coherent Structures”, 1987.
3. Schmid, “Dynamic Mode Decomposition of Numerical and Experimental Data”, 2010.
4. NASA, *Verification, Validation and Uncertainty Quantification* technical reports, https://ntrs.nasa.gov/ 。
