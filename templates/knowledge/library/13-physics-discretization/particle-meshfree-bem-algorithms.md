---
template_version: "flowlab-knowledge/1.0"
slug: particle-meshfree-bem-algorithms
title: 粒子、介观与边界算法：SPH、DEM、LBM、MPM 和 BEM
summary: 用统一的离散对象和守恒观点比较 SPH 核近似、DEM 接触积分、LBM 碰撞迁移、MPM 粒子网格传递及 BEM 边界积分。
category:
  slug: physics-discretization
  name: 跨物理场离散算法
level: 专题
reading_minutes: 39
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [SPH, DEM, LBM, MPM, BEM, 无网格法]
seo:
  title: SPH、DEM、LBM、MPM 与 BEM 算法公式｜CFD菜鸟
  description: 比较主要粒子法、介观法、物质点法和边界元的离散公式与适用边界。
  keywords: [SPH算法, DEM算法, LBM算法, MPM, BEM]
---

# 粒子、介观与边界算法：SPH、DEM、LBM、MPM 和 BEM

这些方法并非“无网格”的同义词：SPH 以核积分近似场，DEM 追踪离散刚/柔颗粒，LBM 演化离散速度分布，MPM 用粒子携带历史而在背景网格求解，BEM 则只离散连续域边界。

## 1. SPH 核近似

用归一化核 $W(x,h)$ 近似

$$
f(x)=\int f(x')\delta(x-x')dx'\approx\int f(x')W(x-x',h)dx'.
$$

粒子离散为

$$
f_i\approx\sum_j\frac{m_j}{\rho_j}f_jW_{ij},
\qquad
\nabla f_i\approx\sum_j\frac{m_j}{\rho_j}f_j\nabla_iW_{ij}.
$$

守恒形式常对称化压力梯度：

$$
\frac{dv_i}{dt}=-\sum_jm_j\left(\frac{p_i}{\rho_i^2}+\frac{p_j}{\rho_j^2}+\Pi_{ij}\right)\nabla_iW_{ij}+g.
$$

核一致性、邻居数、自由面缺核、人工黏性和张力不稳定是关键误差源。

## 2. DEM 接触动力学

每个颗粒满足

$$
m_i\dot v_i=\sum_jF_{ij}+m_ig,
\qquad
I_i\dot\omega_i=\sum_jT_{ij}.
$$

线性弹簧阻尼法向接触

$$
F_n=k_n\delta_n+c_n\dot\delta_n,
$$

切向力累积并受 $|F_t|\le\mu|F_n|$ 限制。显式步长需远小于接触周期，近似 $\Delta t<C\sqrt{m_{eff}/k_n}$。接触刚度过小改变压实性，过大则显著减小稳定步长。

## 3. LBM 碰撞—迁移

BGK 格子 Boltzmann 方程

$$
f_i(x+c_i\Delta t,t+\Delta t)-f_i(x,t)
=-\frac1\tau[f_i-f_i^{eq}]+\Delta t F_i.
$$

宏观量 $\rho=\sum_if_i$、$\rho u=\sum_ic_if_i$，低马赫平衡分布由速度的二阶展开给出。运动黏度

$$
\nu=c_s^2(\tau-1/2)\Delta t.
$$

$\tau\to1/2$ 时数值稳定裕量下降；MRT/中心矩方法通过不同矩的松弛率改善稳定性。LBM 适合规则格子和复杂孔隙，但并非任意可压缩高速流的直接替代。

## 4. MPM 粒子—网格循环

粒子保存质量、应力、塑性历史，背景网格用于梯度和动量更新：

1. P2G：$m_i=\sum_pN_i(x_p)m_p$，$p_i=\sum_pN_i m_pv_p$；
2. 网格内力：$f_i^{int}=-\sum_pV_p\sigma_p\nabla N_i(x_p)$；
3. 更新网格速度并施加边界；
4. G2P：$v_p^{n+1}=\sum_iN_i(x_p)v_i^{n+1}$，更新位置和变形梯度。

PIC 耗散较强，FLIP 通过速度增量传递降低耗散但噪声更大；APIC 保留局部仿射速度。粒子跨单元会造成网格穿越误差，GIMP/CPDI 扩展粒子域以改善连续性。

## 5. BEM 维数降低

对有基本解 $G$ 的线性算子，Green 恒等式把域内 PDE 转成边界积分：

$$
c(\xi)u(\xi)+\int_\Gamma u\,\partial_nG\,d\Gamma
=\int_\Gamma Gq\,d\Gamma+\int_\Omega Gf\,d\Omega.
$$

无体源时只需边界网格，适合无限域、裂纹和声电散射；非线性、强非均匀介质会重新引入域积分，稠密矩阵需要快速多极子或低秩压缩。

## 6. 选型与验证

| 场景 | 优先考虑 | 主要验证量 |
|---|---|---|
| 自由面、大变形流体 | SPH/MPS | 质量、核一致性、压力噪声 |
| 颗粒流和破碎 | DEM | 接触参数、时间步、堆积角 |
| 孔隙低马赫流 | LBM | 黏度映射、Mach 数、格子收敛 |
| 冲击、贯穿、历史材料 | MPM | 能量、网格穿越、传递格式 |
| 无限域线性场 | BEM | 奇异积分、非唯一性、远场 |

## 7. 参考资料

1. Monaghan, “Smoothed Particle Hydrodynamics”, *Reports on Progress in Physics*, 2005.
2. Cundall & Strack, “A Discrete Numerical Model for Granular Assemblies”, 1979.
3. Succi, *The Lattice Boltzmann Equation*.
4. Sulsky, Chen & Schreyer, “A Particle Method for History-Dependent Materials”, 1994.
5. Bonnet, *Boundary Integral Equation Methods for Solids and Fluids*.
