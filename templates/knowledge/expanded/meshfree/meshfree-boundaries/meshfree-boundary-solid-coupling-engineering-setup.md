---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-boundary-solid-coupling-engineering-setup
title: "固体耦合边界：工程设置与参数选择"
summary: "给出流固界面成对力求和与力矩定义、界面间隙与固体边界层数取值、附加质量稳定性的密度比判据，并用静水闸门合力与溃坝初位能两个手算算例核对耦合正确性。"
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
  - "固体耦合边界"
  - "工程设置与参数选择"
  - "作用反作用对称性"
  - "附加质量稳定性"
seo:
  title: "固体耦合边界：工程设置与参数选择"
  description: "给出流固界面成对力求和与力矩定义、界面间隙与固体边界层数取值、附加质量稳定性的密度比判据，并用静水闸门合力与溃坝初位能两个手算算例核对耦合正确性。"
  keywords:
    - "固体耦合边界"
    - "工程设置与参数选择"
    - "作用反作用对称性"
    - "附加质量稳定性"
    - "流固界面间隙"
---

# 固体耦合边界：工程设置与参数选择

固体耦合边界要让流体与刚体在同一步内交换力与力矩，并严格满足作用反作用。SPH 用成对力天然实现这一点：流体粒子对壁面粒子的力与壁面对流体的力大小相等方向相反，前提是两侧使用同一套核梯度和同一时刻的状态。本文给出界面力与力矩公式、界面间隙与边界层数取值、附加质量稳定性的密度比判据，并用静水闸门合力与溃坝初位能两个手算算例核对耦合是否正确。

## 界面力与作用反作用

流体作用于固体的合力由壁面粒子与流体粒子的成对求和给出：

$$\mathbf{F}_s=\sum_b\sum_f m_b m_f\left(\frac{p_b}{\rho_b^{2}}+\frac{p_f}{\rho_f^{2}}\right)\nabla_b W_{bf}$$

同一对粒子在流体侧贡献大小相等、方向相反的对应项，因此总动量严格守恒。力矩由 $\mathbf{T}_s=\sum_b\left(\mathbf{x}_b-\mathbf{X}_c\right)\times\mathbf{F}_{s,b}$ 给出，$\mathbf{X}_c$ 是刚体质心。刚体运动由牛顿-欧拉方程推进：

$$M\frac{d\mathbf{V}}{dt}=\mathbf{F}_s+M\mathbf{g},\qquad I\frac{d\boldsymbol{\Omega}}{dt}=\mathbf{T}_s$$

每步结束后应核对守恒残差 $\sum_f\mathbf{F}_{f\to s}+\sum_b\mathbf{F}_{s\to f}=\mathbf{0}$，其相对范数应在机器精度量级；若残差达到 1%，说明两侧用了不同的核梯度或不同步的状态。

## 界面间隙与固体边界层数

固体表面与流体粒子之间必须留出间隙，否则首层粒子被挤入固体内部后核梯度畸变，穿透率迅速上升。取值如下。

| 参数 | 取值 | 依据 |
|---|---|---|
| 界面间隙 | $0.5\Delta p$ | 小于 $0.3\Delta p$ 时穿透率明显上升 |
| 固体边界层数 | 2～3 | 与动态边界粒子保持一致 |
| 固体粒子间距 | $=\Delta p$ | 与流体一致，禁止单独加密 |
| 最大允许穿透 | $0.1\Delta p$ | 超过则加密或叠加排斥力 |
| 密度比 $\rho_s/\rho_f$ | 大于 2.5 时显式耦合稳定 | 附加质量判据 |

## 附加质量与耦合稳定性

显式分区耦合在轻质结构上会因附加质量而发散：流体被固体加速时产生的反作用相当于给固体附加了一份质量，当附加质量超过固体自身质量时，交错推进的位移会被逐步放大。工程判据是固体密度必须明显大于流体密度，$\rho_s/\rho_f\gtrsim2.5$ 留出余量。

取 $\rho_s=2500$ kg/m³（玻璃、混凝土）、$\rho_f=1000$ kg/m³，比值 2.5，显式耦合可用。若结构换成 $\rho_s=500$ kg/m³ 的轻木，比值降到 0.5，每步位移会被放大约 1.4 倍，几步内即发散，此时必须改用隐式耦合或人为加入虚拟质量。

## 静水闸门手算核对

闸门高 $h_g=0.4$ m、按单位宽度计，上游水位与闸门顶齐平，$\rho=1000$ kg/m³、$g=9.81$ m/s²。总压力为

$$F=\frac{1}{2}\rho g h_g^{2}=\frac{1}{2}\times1000\times9.81\times0.16=784.8\ \mathrm{N/m}$$

压力中心位于底部以上 $h_g/3=0.133$ m 处。SPH 积分得到的合力与力矩应分别落在 784.8 N/m 的 2% 与 0.133 m 的 3% 以内。若力矩偏差明显大于合力偏差，通常是力臂参考点 $\mathbf{X}_c$ 与固体粒子坐标更新不同步。

## 溃坝冲击与能量核算

溃坝水柱高 $H_0=0.3$ m、长 $L_0=0.3$ m，冲击位于下游的弹性闸门。按单位宽度计的初始势能为 $E_0=\frac{1}{2}\rho gH_0^{2}L_0=0.5\times1000\times9.81\times0.09\times0.3=132.4$ J/m。冲击后统计流体动能、流体势能与固体弹性变形能之和，总能量漂移应小于 $E_0$ 的 2%，即 2.6 J/m。总能量单调增长说明耦合步序在注入能量，通常是刚体位置更新在流体力计算之前、两侧状态不同步所致。

## 分区显式耦合片段

```python
for step in range(nsteps):
    compute_fluid_forces(include_solid_particles=True)
    Fs = zeros(3); Ts = zeros(3)
    for b in solid_particles:
        fb = pair_force_on_boundary(b)      # 与流体侧共用 gradW
        Fs += fb
        Ts += cross(b.x - Xc, fb)
    V     += dt * (Fs / M + g)              # 刚体平动更新
    Omega += dt * (Ts / I)                  # 刚体转动更新
    Xc    += dt * V
    theta += dt * Omega
    move_solid_particles(theta, Xc)         # 同步固体粒子位置
    residual = check_action_reaction(Fs)    # 校验 sum(F) = 0
    if norm(residual) > 1e-6 * norm(Fs):
        raise RuntimeError("作用反作用残差过大")
```

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 浮体随时间持续加速 | 反作用力缺失或方向同向 | 核算 $\sum_f\mathbf{F}_{f\to s}+\sum_b\mathbf{F}_{s\to f}$ |
| 固体表面出现粒子穿透 | 界面间隙小于 $0.3\Delta p$ | 统计最大穿透深度是否超过 $0.1\Delta p$ |
| 轻质结构几步内发散 | $\rho_s/\rho_f$ 过小，附加质量不稳定 | 把 $\rho_s$ 提到 $2.5\rho_f$ 重跑 |
| 力矩方向与手算相反 | 力臂参考点与坐标原点定义不一致 | 静水闸门力矩应与 $h_g/3$ 吻合 |
| 固体运动后流体出现空洞 | 固体速度超过粒子跟随能力 | 检查界面附近 $\gamma$ 是否低于 0.90 |
| 总能量随时间单调上升 | 耦合步序不同步，两侧状态错位 | 统计动能加势能加变形能的漂移 |

## 参考文献

1. Antoci C., Gallati M., Sibilla S. Numerical simulation of fluid–structure interaction by SPH. Computers & Structures, 2007, 85(11–14): 879–890.
2. Bouscasse B., Colagrossi A., Marrone S., Antuono M. Nonlinear water wave interaction with floating bodies in SPH. Journal of Fluids and Structures, 2013, 42: 112–129.
3. Cummins S.J., Rudman M. An SPH projection method. Journal of Computational Physics, 1999, 152(2): 584–607.
4. Monaghan J.J. Smoothed particle hydrodynamics. Annual Review of Astronomy and Astrophysics, 1992, 30: 543–574.
5. Violeau D. Fluid Mechanics and the SPH Method: Theory and Applications. Oxford University Press, 2012.
6. Crespo A.J.C., Domínguez J.M., Rogers B.D., et al. DualSPHysics: Open-source parallel CFD solver based on SPH. Computer Physics Communications, 2015, 187: 204–216.
