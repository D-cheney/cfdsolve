---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-boundary-inlet-outlet-engineering-setup
title: "入口出口粒子生成：工程设置与参数选择"
summary: "由质量通量反算入口粒子生成率与每步生成数、给出缓冲层厚度与总压状态赋值、出口吸收层的松弛时间常数，并用通量守恒误差与压力脉动两个指标验收。"
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
  - "入口出口粒子生成"
  - "工程设置与参数选择"
  - "质量通量守恒"
  - "吸收层松弛"
seo:
  title: "入口出口粒子生成：工程设置与参数选择"
  description: "由质量通量反算入口粒子生成率与每步生成数、给出缓冲层厚度与总压状态赋值、出口吸收层的松弛时间常数，并用通量守恒误差与压力脉动两个指标验收。"
  keywords:
    - "入口出口粒子生成"
    - "工程设置与参数选择"
    - "质量通量守恒"
    - "吸收层松弛"
    - "缓冲层厚度"
---

# 入口出口粒子生成：工程设置与参数选择

入口与出口是唯一与计算域交换质量的边界。粒子法里它们不能靠几何面处理，只能靠在入口外侧持续生成粒子、在出口回收粒子。核心约束是质量通量守恒：生成率必须由断面流速与面积反算，而不是拍一个数；出口必须用缓冲吸收层压掉压力波，否则会形成驻波反射回域内。本文给出生成率公式、缓冲层厚度、状态赋值、吸收层松弛时间与三档验收指标。

## 生成率与每步生成数

入口质量通量 $\dot m_{in}=\rho_0u_{in}A$，粒子质量 $m_p=\rho_0V_p$，因此单位时间需要生成的粒子数为

$$\dot N_{in}=\frac{\dot m_{in}}{m_p}=\frac{u_{in}A}{V_p}$$

每步生成 $N_{gen}=\dot N_{in}\Delta t$。二维通道入口高 $A=0.1$ m、$u_{in}=0.5$ m/s、$\Delta p=0.005$ m，则 $V_p=\Delta p^{2}=2.5\times10^{-5}$ m²，$\dot N_{in}=0.5\times0.1/2.5\times10^{-5}=2000$ 个/s。$\Delta t=1.5\times10^{-4}$ s 时 $N_{gen}=0.3$，即约每 3 步生成 1 个粒子。实现上必须用累加器保留小数部分，直接取整会让长时间通量系统性偏低。

## 缓冲层与状态赋值

入口不能只给速度。若只固定 $\mathbf{v}$，密度与压力完全由内部演化决定，入口内侧会出现压缩波。正确做法是在入口外侧维持 3～4 层缓冲粒子，同时给定速度、密度与压力：

$$\mathbf{v}_{buf}=u_{in}\hat{\mathbf{n}},\qquad \rho_{buf}=\rho_0,\qquad p_{buf}=p_{out}+\frac{1}{2}\rho_0u_{in}^{2}$$

压力用总压形式给出，$p_{out}$ 是出口背压。缓冲层厚度取 $L_{buf}=3\Delta p$；厚度不足时入口区 $\gamma<0.90$，粒子会被密度梯度吸入域内，形成可见的空洞。

## 出口吸收层

出口用删除加缓冲的组合：最外侧 $L_{abs}=10\Delta p$ 作为吸收层，层内对速度施加指数松弛

$$\frac{d\mathbf{v}}{dt}=-\frac{1}{\tau_{abs}}\left(\mathbf{v}-\mathbf{v}_{ref}\right),\qquad \tau_{abs}=\frac{L_{abs}}{c_s}$$

$L_{abs}=10\times0.005=0.05$ m、$c_s=10$ m/s 时 $\tau_{abs}=5.0\times10^{-3}$ s。粒子越过出口面后回收，回收时累计其质量与动量，用于通量核算。松弛强度由 $\tau_{abs}$ 唯一确定，不要再引入第二个可调系数。

## 时间步与启动斜坡

声速取 $c_s=10u_{in}=5.0$ m/s，$h=0.006$ m，声速 CFL 给出 $\Delta t=0.25h/c_s=0.25\times0.006/5.0=3.0\times10^{-4}$ s；黏性限制 $\Delta t=0.125h^{2}/\nu=0.125\times3.6\times10^{-5}/1.0\times10^{-6}=4.5$ s，远不构成限制，可以忽略。启动阶段用斜坡把入口速度在 $t_{ramp}=0.5$ s 内从零升到 $u_{in}$，可把启动冲击的压力幅值降低一个量级；$t_{ramp}$ 小于 0.1 s 时入口会激发出明显振荡。

## 生成与回收片段

```python
acc = 0.0
def inlet_step(dt, t, u_in, A, Vp, ramp_t):
    global acc
    u = u_in * min(1.0, t / ramp_t)        # 启动斜坡
    acc += (u * A / Vp) * dt               # 保留小数，避免通量偏置
    n_new = int(acc)
    acc -= n_new
    for _ in range(n_new):
        x = sample_inlet_plane()
        add_particle(x, v=(u, 0.0, 0.0), rho=rho0,
                     p=p_out + 0.5 * rho0 * u * u)
    for q in buffer_particles:             # 3~4 层缓冲
        q.v = (u, 0.0, 0.0)
        q.rho = rho0

def outlet_step(dt):
    for q in absorption_layer:             # 厚 10*dp
        q.v += -dt / tau_abs * (q.v - v_ref)
    for q in particles:
        if q.x[0] > x_out:
            m_out += q.m
            p_out_flux += q.m * q.v
            remove(q)
```

## 验收三指标

通量守恒：长时间累计 $\left|m_{in}-m_{out}\right|/M_0<0.1\%$，采样窗口至少覆盖 20 个穿越时间。入口稳定性：入口后 $5\Delta p$ 处的压力脉动均方根应小于 $0.5\%\rho_0c_s^{2}=0.005\times1000\times25=125$ Pa。速度剖面：在入口下游 $10\Delta p$ 处提取，与目标剖面的偏差小于 2%。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 入口内侧出现周期性压力振荡 | 只指定速度，密度与压力未协调 | 测入口后 $5\Delta p$ 处压力脉动均方根 |
| 入口附近出现空洞 | 缓冲层厚度小于 $3\Delta p$，支撑不足 | 统计入口区 $\gamma$ 是否低于 0.90 |
| 长时间质量缓慢漂移 | 生成率取整丢掉了小数部分 | 累计 $m_{in}-m_{out}$ 与 $M(t)$ 对比 |
| 出口前形成驻波 | 无吸收层或 $\tau_{abs}$ 取值过小 | 在出口前 0.1 m 处测压力脉动谱 |
| 入口速度剖面突变 | 斜坡时间短于 0.1 s | 把 $t_{ramp}$ 从 0.1 s 提到 0.5 s 看冲击 |
| 入口层粒子数单调增长 | 生成率大于实际流出率 | 统计入口缓冲层内粒子数随时间变化 |

## 参考文献

1. Federico I., Marrone S., Colagrossi A., Le Touzé D. Simulating 2D open-channel flows through an SPH model. European Journal of Mechanics B/Fluids, 2012, 34: 35–46.
2. Violeau D. Fluid Mechanics and the SPH Method: Theory and Applications. Oxford University Press, 2012.
3. Crespo A.J.C., Domínguez J.M., Rogers B.D., et al. DualSPHysics: Open-source parallel CFD solver based on SPH. Computer Physics Communications, 2015, 187: 204–216.
4. Lastiwka M., Quinlan N., Basa M. Adaptive particle distribution for smoothed particle hydrodynamics. International Journal for Numerical Methods in Fluids, 2005, 47(10–11): 1403–1409.
5. Gómez-Gesteira M., Rogers B.D., Crespo A.J.C., et al. SPHysics — development of a free-surface fluid solver — Part 1: Theory and formulations. Computers & Geosciences, 2012, 48: 289–299.
6. Monaghan J.J. Smoothed particle hydrodynamics. Annual Review of Astronomy and Astrophysics, 1992, 30: 543–574.
