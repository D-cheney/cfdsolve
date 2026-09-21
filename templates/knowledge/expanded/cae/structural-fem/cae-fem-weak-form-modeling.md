---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-weak-form-modeling
title: "弱形式与虚功原理：物理建模与适用边界"
summary: "弱形式成立的前提是外载能做功、系统可写成能量泛函。本文给出本质/自然边界的处理差别、保守与不保守载荷的分界、虚功与势能泛函的等价条件，并用一根轴向杆完成 5.0 J 量级的功-能核对。"
category:
  slug: structural-fem
  name: "结构与有限元算法"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "结构与有限元算法"
  - "弱形式与虚功原理"
  - "物理建模与适用边界"
  - "能量泛函"
  - "自然边界"
seo:
  title: "弱形式与虚功原理：物理建模与适用边界"
  description: "弱形式成立的前提是外载能做功、系统可写成能量泛函。本文给出本质/自然边界的处理差别、保守与不保守载荷的分界、虚功与势能泛函的等价条件，并用一根轴向杆完成 5.0 J 量级的功-能核对。"
  keywords:
    - "弱形式与虚功原理"
    - "物理建模与适用边界"
    - "虚功方程"
    - "势能泛函"
    - "自然边界条件"
---

# 弱形式与虚功原理：物理建模与适用边界

弱形式不是推导技巧，而是有限元能在低连续形函数上工作的唯一理由：它把二阶导数降为一阶，让分片线性形函数可行。但它成立有前提——外载必须能对虚位移做功，并且只有当系统保守时才能改写成势能泛函。本文讲清这两条前提的边界，说明本质与自然边界为何待遇不同，并用一根轴向杆把"外力功=应变能"核对到 5.0 J 量级。

## 从强式到虚功方程

静力平衡的强式要求 $\nabla\cdot\boldsymbol\sigma+\mathbf b=\mathbf 0$ 逐点成立，需要解具备二阶连续导数。取满足 $\delta\mathbf u=\mathbf 0$ 于位移边界的试验函数加权并分部积分，散度定理把体积分的二阶项换成体积分的一阶项加边界项，得到

$$
\int_\Omega \delta\boldsymbol\varepsilon:\boldsymbol\sigma\,d\Omega=\int_\Omega \delta\mathbf u\cdot\mathbf b\,d\Omega+\int_{\Gamma_t}\delta\mathbf u\cdot\bar{\mathbf t}\,d\Gamma
$$

左端是内虚功，右端是外虚功。这个等式对任何满足边界约束的 $\delta\mathbf u$ 成立，意味着"积分意义下的加权平衡"取代了"逐点平衡"，对解的连续性要求从 $C^2$ 降到 $H^1$，这正是线性单元可行的数学根源。应力通过本构进入弱形式：

$$
\boldsymbol\sigma=\mathbf C:\boldsymbol\varepsilon,\qquad \boldsymbol\varepsilon=\tfrac12\left(\nabla\mathbf u+\nabla\mathbf u^{T}\right)
$$

对线弹性，$\mathbf C$ 对称正定，双线性型 $a(\mathbf u,\delta\mathbf u)=\int\delta\boldsymbol\varepsilon:\mathbf C:\boldsymbol\varepsilon\,d\Omega$ 连续且强制，Lax–Milgram 定理保证解存在唯一，刚度矩阵对称正定。

## 本质边界与自然边界为何待遇不同

弱式推导中，边界项 $\int_{\partial\Omega}\delta\mathbf u\cdot(\boldsymbol\sigma\cdot\mathbf n)\,d\Gamma$ 只在未约束位移的边界上保留。这产生两类条件：本质（Dirichlet）条件约束解本身，必须写进试探空间与试验空间，试验函数在其上取零才能消去该段边界项；自然（Neumann）条件给定面力，通过边界项自动进入右端，不需要额外约束。

判断某个条件属于哪一类，看它约束的是位移（本质）、面力（自然），还是两者的线性组合。弹簧支撑与对流换热属于第三类（Robin），形式为 $\boldsymbol\sigma\cdot\mathbf n=-k_s\mathbf u$，它把贡献并入双线性型而非右端，因此会改变刚度矩阵对称性以外的结构。实现时最容易出错的地方是自然边界的符号：$\bar{\mathbf t}$ 进入右端的正负由外法向约定决定，方向反了会在模型里凭空产生源或汇。

## 保守载荷与不保守载荷的分界

当外载可写成势的负梯度，整个系统有总势能泛函

$$
\Pi(\mathbf u)=\tfrac12\int_\Omega \boldsymbol\varepsilon:\boldsymbol\sigma\,d\Omega-\int_\Omega \mathbf u\cdot\mathbf b\,d\Omega-\int_{\Gamma_t}\mathbf u\cdot\bar{\mathbf t}\,d\Gamma
$$

其驻值条件 $\delta\Pi=0$ 与虚功方程完全等价，且二阶变分正定给出最小势能原理。这一等价是有限元能直接用对称求解器的前提。典型的不保守载荷是随动压力：压力始终垂直于变形后的表面，$\bar{\mathbf t}=-p\,\mathbf n(\mathbf u)$，法向随位移转动，其切线刚度不对称，无法再写成势能，只能回到增量虚功形式。气动弹性、流体压力耦合与跟随力问题都落在这个边界之外。

## 一次可核对的功-能核算

取一根轴向受拉杆：长度 $L=2.0\,\mathrm m$，截面积 $A=1.0\times10^{-4}\,\mathrm{m^2}$（即 $100\,\mathrm{mm^2}$），弹性模量 $E=200\,\mathrm{GPa}$，端部轴向力 $F=10.0\,\mathrm{kN}$。按 $EA$ 模型，端部伸长

$$
\delta=\frac{FL}{EA}=\frac{1.0\times10^4\times2.0}{2.0\times10^{11}\times1.0\times10^{-4}}=1.0\times10^{-3}\,\mathrm m=1.0\,\mathrm{mm}
$$

由几何与载荷反算应力与应变：$\sigma=F/A=100\,\mathrm{MPa}$，$\varepsilon=\sigma/E=5.0\times10^{-4}$。应变能为

$$
U=\tfrac12F\delta=\tfrac12\times1.0\times10^4\times1.0\times10^{-3}=5.0\,\mathrm J
$$

再用能量密度核对：$\tfrac12\sigma\varepsilon=25.0\,\mathrm{kJ/m^3}$，杆体积 $V=AL=2.0\times10^{-4}\,\mathrm{m^3}$，两者相乘得 $5.0\,\mathrm J$，与外载荷做功一致。这个核对说明：只要本构线性、载荷与位移无关，虚功方程左右两端必然平衡，误差只来自离散。若把该杆改成随动压力加载，同样的 5.0 J 核算将不再成立，因为外力功多了一项与法向转动有关的贡献。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 端部反力与外载不平衡 | 自然边界项符号或外法向约定错误 | 对轴向杆施加已知端载，核对 $\sum F$ 与 $\int_{\Gamma_t}\bar{\mathbf t}\,d\Gamma$ |
| 刚度矩阵奇异、解整体漂移 | 只给了自然边界，未施加任何本质约束 | 检查 $\mathbf K$ 零空间维数，应为 0 |
| 残差很小但应变能与外力功不符 | 边界项被重复计入或漏计 | 比较 $\tfrac12\mathbf u^T\mathbf K\mathbf u$ 与 $\tfrac12\mathbf u^T\mathbf f$ |
| 压力方向随变形偏转却不更新 | 把随动载荷当作死载荷处理 | 大变形下改变加载方向，观察反力方向是否跟随 |
| 用势能泛函求解不保守问题得到伪极小 | 系统无势能，$\Pi$ 不存在 | 检查载荷是否显含位移 |

## 装配骨架

下面的伪代码把虚功方程落到单元循环上，最后一行是能量自检：

```
for e in elements:
    Ke = integrate(B.T @ C @ B, gauss_points)   # 内虚功
    fe = integrate(N.T @ b) + integrate(N.T @ tbar, boundary)  # 外虚功
    assemble(Ke, fe)
apply essential BC by eliminating rows and columns
solve K u = f
energy_check = 0.5 * u @ K @ u - 0.5 * u @ f   # 线性问题应接近 0
```

`energy_check` 的绝对值与 $\tfrac12\mathbf u^T\mathbf f$ 之比应小于 $10^{-6}$；若显著偏离，说明边界项或本构装配有误，而不是求解器精度问题。

## 适用边界与升级判据

线性弱形式在四类情况下失效，需要换形式：位移或转动超出小变形范围（转动超过约 $10^\circ$、位移超过构件尺寸的 5%）时改用 Total/Updated Lagrangian 增量弱形式；载荷依赖变形时切线矩阵不对称，需非对称求解；接触与冲击引入不等式约束，弱形式升级为变分不等式或 KKT 系统；材料进入塑性后刚度不再是常数，需按增量步更新切线模量。判断是否升级的一个廉价信号是位移-载荷曲线的线性度：当载荷加倍而位移偏离两倍超过 5%，就应放弃线性弱形式。

## 参考文献

1. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
2. Hughes, T.J.R. *The Finite Element Method: Linear Static and Dynamic Finite Element Analysis*. Dover, 2000.
3. Zienkiewicz, O.C., Taylor, R.L., Zhu, J.Z. *The Finite Element Method: Its Basis and Fundamentals*, 7th ed. Butterworth-Heinemann, 2013.
4. Bonet, J., Wood, R.D. *Nonlinear Continuum Mechanics for Finite Element Analysis*, 2nd ed. Cambridge University Press, 2008.
5. Belytschko, T., Liu, W.K., Moran, B. *Nonlinear Finite Elements for Continua and Structures*. Wiley, 2000.
6. Crisfield, M.A. *Non-linear Finite Element Analysis of Solids and Structures*, Vol. 1. Wiley, 1991.
