---
template_version: "flowlab-knowledge/1.0"
slug: maxwell-electromagnetic-fem-fdtd
title: 计算电磁学：Maxwell 方程、H(curl) 有限元与 FDTD
summary: 从 Maxwell 一阶方程推导电场旋度旋度方程、H(curl) 弱式和 Yee-FDTD 更新，解释边元、散度约束、PML、色散与稳定步长。
category:
  slug: physics-discretization
  name: 跨物理场离散算法
level: 专题
reading_minutes: 37
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [电磁场, Maxwell方程, Hcurl有限元, FDTD, PML]
seo:
  title: Maxwell、H(curl) 有限元与 FDTD 推导｜CFD菜鸟
  description: 推导计算电磁学旋度弱式、边元和 Yee-FDTD 的稳定性与边界处理。
  keywords: [Maxwell有限元, Hcurl, FDTD, Yee网格]
---

# 计算电磁学：Maxwell 方程、H(curl) 有限元与 FDTD

线性介质中的 Maxwell 方程为

$$
\nabla\times H=J+\sigma E+\frac{\partial D}{\partial t},\qquad
\nabla\times E=-\frac{\partial B}{\partial t},
$$

$$
\nabla\cdot D=\rho,qquad \nabla\cdot B=0,qquad D=\epsilon E,quad B=\mu H.
$$

材料、源和边界决定应使用静电、磁静、涡流、频域或全波瞬态模型。

## 1. 频域旋度旋度方程

采用 $e^{i\omega t}$ 约定。由 Faraday 定律 $H=-(i\omega\mu)^{-1}\nabla\times E$，代入 Ampère 定律：

$$
\nabla\times(\mu^{-1}\nabla\times E)-\omega^2\epsilon E+i\omega\sigma E=-i\omega J.
$$

不同时间谐波符号约定会改变虚部符号，报告必须注明。PEC 边界满足 $n\times E=0$，开放域常用吸收边界或 PML。

## 2. H(curl) 弱式

取测试函数 $F\in H(\mathrm{curl})$，内积并用旋度 Green 公式：

$$
(\mu^{-1}\nabla\times E,\nabla\times F)
-\omega^2(\epsilon E,F)+i\omega(\sigma E,F)
=( -i\omega J,F)+\text{边界项}.
$$

电场的自然函数空间要求切向分量跨单元连续。Nédélec 边元自由度是边上的切向积分，能保持离散 de Rham 序列并抑制标量节点元产生的伪模态。磁通 $B$ 更自然地位于 $H(\mathrm{div})$ 空间。

离散后

$$
(K-\omega^2M_\epsilon+i\omega M_\sigma)e=f,
$$

其中 $K_{ij}=(\mu^{-1}\nabla\times N_j,\nabla\times N_i)$。

## 3. Yee-FDTD 更新

无源均匀介质中，以时间和空间交错的 $E,H$：

$$
H^{n+1/2}=H^{n-1/2}-\Delta t\,\mu^{-1}(\nabla_h\times E^n),
$$

$$
E^{n+1}=E^n+\Delta t\,\epsilon^{-1}(\nabla_h\times H^{n+1/2}-J^{n+1/2}).
$$

三维直角网格 CFL 条件

$$
\Delta t\le\frac1{c\sqrt{\Delta x^{-2}+\Delta y^{-2}+\Delta z^{-2}}}.
$$

Yee 交错布局自然满足离散旋度和散度结构，但阶梯几何与数值色散会降低精度；每波长单元数必须通过相速误差研究确定。

## 4. 开放边界与损耗

PML 通过复坐标拉伸使出射波无反射进入吸收层；离散、层厚或材料突变仍会产生反射。导体损耗功率密度

$$
q_J=\frac12\mathrm{Re}(J\cdot E^*)=\frac12\sigma|E|^2
$$

可作为热方程源项，但场量到热网格的映射必须守恒总功率。

## 5. 验证

- 静电电容、同轴线 TEM 和矩形波导截止频率解析解；
- 检查 Gauss 定律、能量/Poynting 通量与端口功率平衡；
- 频域检查复数符号、端口归一化和网格色散；
- 瞬态检查 CFL、PML 反射与长时间能量漂移。

## 6. 参考资料

1. MFEM, *Maxwell Theory Notes*, https://mfem.org/maxwell-notes/ 。
2. MFEM, *Definite Maxwell Problem*, https://mfem.org/annotated/ex3/ 。
3. Taflove & Hagness, *Computational Electrodynamics: The FDTD Method*.

