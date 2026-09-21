---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-boundary-dynamic-boundary-engineering-setup
title: "动态边界粒子：工程设置与参数选择"
summary: "讲清动态边界粒子的冻结型与运动型两种状态更新、层数与有效壁面偏移的量化关系、声速时间步限制与刚体反作用力统计，并用静水柱压力与质量守恒给出层数下限依据。"
category:
  slug: meshfree-boundaries
  name: "无网格法边界处理"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法边界处理"
  - "动态边界粒子"
  - "工程设置与参数选择"
  - "DBC"
  - "有效壁面偏移"
seo:
  title: "动态边界粒子：工程设置与参数选择"
  description: "讲清动态边界粒子的冻结型与运动型两种状态更新、层数与有效壁面偏移的量化关系、声速时间步限制与刚体反作用力统计，并用静水柱压力与质量守恒给出层数下限依据。"
  keywords:
    - "动态边界粒子"
    - "工程设置与参数选择"
    - "DBC"
    - "有效壁面偏移"
    - "刚体反作用力"
---

# 动态边界粒子：工程设置与参数选择

动态边界粒子把壁面离散成真实粒子，让它们进入流体的邻居表并参与密度求和与力计算，再用冻结或随刚体运动两种方式更新状态。相比镜像法，它能直接适配任意几何与运动壁面，代价是近壁密度依赖层数、有效壁面位置会随层厚漂移。本文给出层数与间距取值、连续性方程与状态方程的处理、时间步限制、刚体反作用力统计，并用静水压力与质量守恒两个可核对指标验收。

## 冻结型与运动型的状态更新

边界粒子的密度按与流体相同的连续性方程推进，只是位置与速度由壁面规定：

$$\frac{d\rho_b}{dt}=\rho_b\sum_f V_f\left(\mathbf{v}_b-\mathbf{v}_f\right)\cdot\nabla_b W_{bf}$$

冻结型取 $\mathbf{v}_b=\mathbf{0}$、位置恒定，适合静止壁与水箱；运动型取 $\mathbf{v}_b=\mathbf{V}+\boldsymbol{\Omega}\times\mathbf{r}_b$，适合活塞、闸门与旋转机械。两者都必须进入流体的邻居表，否则密度亏损与镜像法漏镜像时完全一样。

压力仍由弱压缩状态方程给出，无需额外赋静水值：

$$p_b=\frac{c_s^{2}\rho_0}{\gamma}\left[\left(\frac{\rho_b}{\rho_0}\right)^{\gamma}-1\right]+p_{bg}$$

$\gamma=7$ 是水的常用指数，$c_s=10\,v_{\max}$ 使密度波动控制在 1% 以内，$p_{bg}$ 为背景压力，通常取 0。

## 层数与有效壁面位置

层数不足会在壁面附近形成密度低谷；层数过多只增加邻居搜索开销。对 $h=1.2\Delta p$，覆盖 $2h$ 需要 3 层。

| 设置项 | 取值 | 说明 |
|---|---|---|
| 边界层数 | 3 | 覆盖 $2h=2.4\Delta p$ |
| 边界粒子间距 | $=\Delta p$ | 与流体一致，禁止只在近壁加密 |
| 冻结/运动 | 静止壁冻结，运动壁按刚体运动学 | 运动型每步更新位置与速度 |
| $c_s$ | $10\,v_{\max}$ | 密度波动小于 1% |
| 有效壁面偏移 | $0.5\Delta p$ | 无滑移面位于首层粒子内侧约半个间距 |

有效壁面偏移是动态边界粒子的系统性偏差来源。$\Delta p=0.01$ m 时偏移 5 mm，在 $d=0.02$ m 的窄通道里占通道宽度的 25%，引用剪应力前必须先用解析解标定这个偏移量，而不是默认壁面就在首层粒子中心。

## 时间步限制

动态边界粒子不引入额外刚度，时间步仍由声速 CFL 控制：

$$\Delta t=0.25\min_i\left(\frac{h}{c_s+|\mathbf{v}_i|}\right)$$

取 $v_{\max}=1.0$ m/s、$c_s=10$ m/s、$h=0.012$ m，得 $\Delta t=0.25\times0.012/11=2.7\times10^{-4}$ s。若把粒子间距加密到 $\Delta p=0.005$ m，$h=0.006$ m，则 $\Delta t$ 减半到 $1.4\times10^{-4}$ s，步数翻倍，这是加密的主要成本来源。边界粒子数量增加本身不改变时间步，只影响单步耗时。

## 刚体反作用力

运动壁面必须把流体的作用力回传给刚体，否则刚体动力学与流体脱耦，浮体或闸门会以错误加速度运动：

$$\mathbf{F}_{w}=\sum_b\sum_f m_b m_f\left(\frac{p_b}{\rho_b^{2}}+\frac{p_f}{\rho_f^{2}}\right)\nabla_b W_{bf}$$

求和遍历壁面粒子 $b$ 与流体粒子 $f$，符号自然给出反作用。力矩由 $\mathbf{T}_w=\sum_b\left(\mathbf{x}_b-\mathbf{X}_c\right)\times\mathbf{F}_{w,b}$ 给出，$\mathbf{X}_c$ 是刚体质心。

## 配置片段

```python
for step in range(nsteps):
    move_rigid_bodies(dt)                      # 更新 V, Omega, 刚体位姿
    for b in boundary_particles:
        if b.kind == "moving":
            b.x = rigid_map(b.body_id, b.s0)   # 按刚体映射参考坐标
            b.v = V[b.body_id] + cross(Omega[b.body_id], b.x - Xc[b.body_id])
        # 冻结型保持 x, v 不变
        b.rho += dt * b.rho * sum(
            Vf * dot(b.v - vf, gradW(b.x - f.x)) for f in neighbors(b))
        b.p = cs**2 * rho0 / 7.0 * ((b.rho / rho0)**7 - 1.0)
    compute_fluid_forces(include_boundary=True)
    Fw, Tw = accumulate_reaction(boundary_particles)
    apply_to_rigid(Fw, Tw)
```

## 验收：静水压力与质量守恒

静水柱 $H=0.4$ m、$\Delta p=0.01$ m、3 层边界。解析底部压力 $\rho gH=1000\times9.81\times0.4=3924$ Pa。统计 $t=2.0$ s 后壁面粒子的平均压力：3 层方案相对误差应小于 2%，1 层方案实测偏低 6%～9%，这是层数下限的直接量化依据。

质量守恒用于查回收逻辑：统计累计 $\left|M(t)-M(0)\right|/M(0)$，长时间平均应小于 0.5%。溃坝算例中若该比值单调上升，通常是出口删除粒子时没有同步更新邻居表，或边界粒子被错误地也纳入删除集合。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面附近密度出现低谷 | 边界层数少于 $\lceil 2h/\Delta p\rceil$ | 统计壁法向 $\rho/\rho_0$ 剖面，看低谷深度 |
| 剪应力随层数明显变化 | 有效壁面偏移未标定 | 用同一 $\Delta p$ 跑 1/2/3 层，比较 $\tau_w$ |
| 运动壁面穿模 | 运动型只更新了位置未更新速度 | 检查 $b.v$ 是否等于 $\mathbf{V}+\boldsymbol{\Omega}\times\mathbf{r}_b$ |
| 刚体加速度偏大 | 反作用力被重复累加或符号同向 | 核算 $\sum_b\mathbf{F}_{w,b}$ 与流体侧总力是否等大反向 |
| 步数突然翻倍 | 粒子间距减半而声速未重估 | 用 $0.25h/(c_s+v)$ 重算 $\Delta t$ |
| 压力随时间缓慢漂移 | 边界粒子密度未按连续性方程更新 | 检查 $b.\rho$ 是否被直接置为 $\rho_0$ |

## 参考文献

1. Crespo A.J.C., Domínguez J.M., Rogers B.D., et al. DualSPHysics: Open-source parallel CFD solver based on Smoothed Particle Hydrodynamics (SPH). Computer Physics Communications, 2015, 187: 204–216.
2. Monaghan J.J. Smoothed particle hydrodynamics. Annual Review of Astronomy and Astrophysics, 1992, 30: 543–574.
3. Violeau D. Fluid Mechanics and the SPH Method: Theory and Applications. Oxford University Press, 2012.
4. Marrone S., Antuono M., Colagrossi A., et al. δ-SPH model for simulating violent impact flows. Computer Methods in Applied Mechanics and Engineering, 2011, 200(13–16): 1526–1542.
5. Gómez-Gesteira M., Rogers B.D., Crespo A.J.C., et al. SPHysics — development of a free-surface fluid solver — Part 1: Theory and formulations. Computers & Geosciences, 2012, 48: 289–299.
