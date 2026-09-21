---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-geometric-nonlinearity-modeling
title: "几何非线性：物理建模与适用边界"
summary: "几何非线性的触发条件是大转动而非大位移本身。本文用 Green–Lagrange 应变区分大位移、大转动与大应变，由悬臂梁 $\\delta/L=10\\%$ 算出 3.0 mm 轴向缩短与 0.6% 轴向应变，给出 TL/UL 选择与升级判据。"
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
  - "几何非线性"
  - "物理建模与适用边界"
  - "Green-Lagrange 应变"
  - "Total Lagrangian"
seo:
  title: "几何非线性：物理建模与适用边界"
  description: "几何非线性的触发条件是大转动而非大位移本身。本文用 Green–Lagrange 应变区分大位移、大转动与大应变，由悬臂梁 δ/L=10% 算出 3.0 mm 轴向缩短与 0.6% 轴向应变，给出 TL/UL 选择与升级判据。"
  keywords:
    - "几何非线性"
    - "物理建模与适用边界"
    - "Green-Lagrange 应变"
    - "Total Lagrangian"
    - "跟随载荷"
---

# 几何非线性：物理建模与适用边界

判断要不要开几何非线性，看的不是位移绝对值，而是转动幅值与应变幅值：一根很长的柔性梁端部横移 50 mm 可能仍属小应变，而一个短粗构件转动 20° 却已产生不可忽略的几何应变。本文用 Green–Lagrange 应变把这三者分开，说明 Total/Updated Lagrangian 的选择依据，并用悬臂梁的轴向缩短量给出一个可以手算的升级判据。

## 三种"大"的区分

线性分析假设应变是位移梯度的线性部分，且构形不变。几何非线性来自应变度量中的二次项。以一维为例，Green–Lagrange 正应变

$$
E_{xx}=\frac{\partial u}{\partial x}+\frac{1}{2}\left[\left(\frac{\partial u}{\partial x}\right)^{2}+\left(\frac{\partial v}{\partial x}\right)^{2}\right]
$$

第二项就是几何非线性的来源。区分三种情形的判据是：大位移而小转动、小应变（如刚体平移、柔性梁小幅弯曲）——二次项中 $(\partial v/\partial x)^{2}$ 是转角平方，转角小于 $1^{\circ}$（0.017 rad）时其平方为 $3\times10^{-4}$，可忽略；大转动（转角超过 $10^{\circ}$，即 0.175 rad）——二次项达 1.5%，必须保留；大应变（$\varepsilon>5\%$）——需要用有限应变张量与乘性分解，本构也要换成真应力-真应变。

## Total 与 Updated Lagrangian 的选择

两种格式的区别在于参考构形：Total Lagrangian（TL）始终以初始构形 $\Omega_0$ 为参考，用第二类 Piola–Kirchhoff 应力 $\mathbf S$ 与 Green 应变 $\mathbf E$，弱形式写成

$$
\int_{\Omega_0}\delta\mathbf E:\mathbf S\,d\Omega_0=\int_{\Omega_0}\delta\mathbf u\cdot\mathbf b_0\,d\Omega_0+\int_{\Gamma_{t0}}\delta\mathbf u\cdot\bar{\mathbf t}_0\,d\Gamma_0
$$

Updated Lagrangian（UL）以当前构形 $\Omega_n$ 为参考，用 Cauchy 应力与真应变增量。选择依据：材料本构以工程应力-应变给出、应变中等（$<10\%$）时 TL 更直观；涉及接触、流体或需要每步更新几何的场合，UL 更方便。两者在数学上等价，差别只在实现与数值条件。

跟随载荷是几何非线性里最容易被忽略的一环。压力始终垂直于变形后的表面，$\bar{\mathbf t}=-p\,\mathbf n(\mathbf u)$，其切线刚度不对称，需要非对称求解器；若把压力当作方向固定的死载荷，结果会系统性偏差。

## 一次可核对的升级判据

取悬臂梁，长度 $L=0.5\,\mathrm m$，端部横移 $\delta=0.05\,\mathrm m$，即 $\delta/L=10\%$。小变形理论认为梁只是弯曲，长度不变；但几何上梁会轴向缩短。对端部集中力下的三次挠曲线 $w(x)=\delta(3x^{2}L-x^{3})/(2L^{3})$，其轴向缩短为

$$
\Delta=\int_0^{L}\tfrac12\left(\frac{\mathrm dw}{\mathrm dx}\right)^{2}\mathrm dx=\frac{3}{5}\frac{\delta^{2}}{L}=\frac{0.6\times(0.05)^{2}}{0.5}=3.0\times10^{-3}\,\mathrm m=3.0\,\mathrm{mm}
$$

即缩短量为梁长的 0.6%。若该梁两端轴向被刚性约束，这 0.6% 的几何缩短会产生轴向应变，按 $E=210\,\mathrm{GPa}$ 估算应力

$$
\sigma=E\varepsilon=210\times10^{9}\times6.0\times10^{-3}=1.26\times10^{9}\,\mathrm{Pa}=1.26\,\mathrm{GPa}
$$

远超 $355\,\mathrm{MPa}$ 的屈服强度，说明几何效应足以把构件推到塑性。这个 3.0 mm 与 1.26 GPa 就是判据：当 $\delta/L>5\%$ 或端部转角 $\theta=1.5\delta/L>0.075\,\mathrm{rad}$（4.3°）时，线性分析已不可靠，必须开启几何非线性。反之，若 $\delta/L<2\%$，轴向缩短低于 0.24 mm，通常可忽略。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 线性与非线性结果差 20% 以上 | 转动幅值超过小转角范围 | 计算端部转角 $1.5\delta/L$，与 0.075 rad 比较 |
| 轴向约束处应力被高估或低估 | 忽略了几何缩短产生的轴向应变 | 用上式估算 $\Delta$，与约束反力对照 |
| 压力载荷方向不随变形转动 | 把跟随载荷当死载荷 | 大变形下改变加载方向，检查反力方向 |
| 打开 NLGEOM 后不收敛 | 载荷步过大或切线不对称 | 减小载荷步，启用非对称求解 |
| 大应变下体积不守恒 | 用小应变本构配大变形几何 | 换算真应力-真应变后复算 |
| 结果依赖参考构形设置 | TL/UL 混用导致应力度量不一致 | 固定一种格式，核对 $\mathbf S$ 与 $\boldsymbol\sigma$ 换算 |

## 几何非线性求解设置

Abaqus 中开启几何非线性并处理跟随载荷的典型设置：

```
*STEP, NLGEOM=YES, INC=200
*STATIC
0.05, 1.0, 1.0e-6, 0.05
*CLOAD
NODE_TIP, 2, -500.0
*DLOAD, OP=NEW
FACE_PRESSURE, P, 0.5      # 压力随变形更新法向
*OUTPUT, FIELD
*NODE FILE
U, RF
```

`NLGEOM=YES` 激活 TL/UL 格式；`*DLOAD` 的 `P` 类型为跟随压力；初始增量 0.05 便于在大转动区稳定收敛。

## 参考文献

1. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
2. Crisfield, M.A. *Non-linear Finite Element Analysis of Solids and Structures*, Vol. 1. Wiley, 1991.
3. Bonet, J., Wood, R.D. *Nonlinear Continuum Mechanics for Finite Element Analysis*, 2nd ed. Cambridge University Press, 2008.
4. Belytschko, T., Liu, W.K., Moran, B. *Nonlinear Finite Elements for Continua and Structures*. Wiley, 2000.
5. Zienkiewicz, O.C., Taylor, R.L., Zhu, J.Z. *The Finite Element Method: Its Basis and Fundamentals*, 7th ed. Butterworth-Heinemann, 2013.
6. Wriggers, P. *Nonlinear Finite Element Methods*. Springer, 2008.
