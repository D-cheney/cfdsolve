---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-foundations
title: SPH 核近似、邻居搜索与稳定性
summary: 从粒子体积加权核近似进入密度、对称压力离散和显式时间步，结合本项目实现说明自由表面、地形接触、声速和邻居表的误差来源。
category: { slug: meshfree-sph, name: "无网格法 · SPH 理论与实现" }
level: 进阶
reading_minutes: 10
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-10T00:00:00.000Z"
tags: [无网格法, SPH, 核函数, CFL, 邻居搜索]
---

# SPH 核近似、邻居搜索与稳定性

## 1. 核近似与粒子求和

SPH 用邻域粒子的体积权重近似连续场。对标量场 A，常用表达为：

$$
A_i\approx\sum_j\frac{m_j}{\rho_j}A_jW(\mathbf{x}_i-\mathbf{x}_j,h),\qquad
\rho_i=\sum_j m_jW_{ij}
$$

核函数具有归一化、紧支撑等性质；求和只包含支持域内邻居。核的定义和不同维度的归一化系数可对照[交互式 SPH 核函数说明](https://learn.physics-simulation.org/examples/sph_kernel.html)。核积分满足条件并不意味着任意无序粒子分布的离散求和自动精确。

## 2. 从通用压力项到项目实现

常用对称压力加速度可写为：

$$
\frac{d\mathbf{v}_i}{dt}=-\sum_jm_j\left(\frac{p_i}{\rho_i^2}+\frac{p_j}{\rho_j^2}\right)\nabla_iW_{ij}+\mathbf{g}+\mathbf{a}_{\mathrm{diss},i}
$$

成对对称项便于维持内力平衡；人工黏性与真实物理黏性需分别解释。弱可压缩方法用状态方程关联密度与压力，显式步长受声学 CFL、加速度和黏性扩散限制。这些通用关系可参照[DualSPHysics 官方 SPH formulation](https://github.com/DualSPHysics/DualSPHysics/wiki/3.-SPH-formulation)。

本项目三维原型使用线性正压状态方程，而非直接照搬其他求解器的状态方程：

$$
p_i=c_0^2\max(\rho_i-\rho_0,0)
$$

相互作用分母的密度另设不低于参考密度的下限；Wendland C2 核取 h＝1.3Δp、支持半径 2h。项目的正则化宾汉黏性还有黏度上限，低剪切区结果需检查对正则化和上限的敏感性。实现及参数依据[三维原始模板](/meshfree/documents/sph3d-model.md)与[求解脚本](/meshfree/model/src/simulate_sph3d.py)。

## 3. 时间步与声速应一起核查

步长限制的量级关系为：

$$
\Delta t\lesssim\min\left(C_c\frac{h}{c_0+v_{\max}},\ C_a\sqrt{\frac{h}{a_{\max}}},\ C_\nu\frac{h^2}{\nu_{\max}}\right)
$$

这是解释尺度的通式，系数和精确表达以选用的求解器为准。增加声速会收紧步长；降低声速虽可加速，却需重新评估可压缩误差。现有配置声速为 150 m/s，运行摘要峰值速度约 42.67 m/s，两者比值约 0.284；摘要还给出峰值密度比约 1.1025。因此不能仅凭运行完成就认定不可压缩近似充分，应开展声速和时间步敏感性分析。[配置](/meshfree/model/config/sph3d_480k.json)与[原运行摘要](/meshfree/evidence/summary.json)提供该计算依据。

## 4. 邻居表与边界并非次要细节

项目空间哈希只加速三维邻居查询，不是欧拉动力网格。桶碰撞需要真实单元坐标筛选，邻居表溢出必须报错。缓存表带 0.5Δp 缓冲区，粒子移动达到缓冲宽度一半后重建；求力时仍按真实核支持半径筛选。

自由表面缺少邻居会影响密度核求和；本项目的 DEM 接触投影也不等于具有核补偿的固体边界算法。低密度不能直接解释成低含沙量，表面光滑也不能证明近床压力正确。应结合[数值验证清单](/knowledge/meshfree-validation)检查内力、邻居表、非穿透和标准算例。
