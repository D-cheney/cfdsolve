---
template_version: "flowlab-knowledge/1.0"
slug: vof-free-surface
title: VOF 自由液面、表面张力与界面捕捉
summary: 介绍体积分数输运、界面重构、CSF 表面张力与壁面接触角，给出毛细时间步、界面 Courant 数、网格与质量守恒检查方法。
category:
  slug: multiphase-flow
  name: 多相流与组分输运
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [VOF, 自由液面, 表面张力, 接触角, 界面捕捉, CSF]
seo:
  title: VOF 自由液面与界面捕捉｜CFD菜鸟
  description: 正确设置 VOF 体积分数、表面张力、接触角、界面 Courant 数与毛细时间步。
  keywords: [VOF 方法, 自由液面 CFD, 表面张力, 接触角, 界面重构]
---

# VOF 自由液面、表面张力与界面捕捉

VOF 在固定网格上输运各相体积分数，用 0 到 1 之间的过渡单元标识界面。它适合大尺度连续界面，是溃坝、晃荡、波浪、液体注入与液滴合并等问题的首选，但无法在网格以下自动保持真实薄膜、液丝或液滴谱，这一点必须在选型阶段就认清。

## 1. 结论与适用场景

- **适合**：存在清晰、大尺度、可被网格解析的连续界面；关心液位、晃动、翻卷、飞溅、液滴生成与合并；需要壁面接触角与毛细效应。
- **不适合**：界面尺度远小于网格（如雾化初期液滴谱）；两相弥散混合、无连续界面（应改用 Mixture 或 Euler–Euler）；稀疏颗粒轨迹统计（应改用拉格朗日）。
- **关键判据**：界面应被至少 3 到 5 个单元覆盖；毛细主导问题还要保证网格能解析曲率，否则寄生流会污染结果。

## 2. 物理与数学基础

VOF 求解每相体积分数 $\alpha_q$ 的输运方程，并保证相分数守恒：

$$
\sum_{q=1}^{N} \alpha_q = 1
$$

混合物密度与黏度由相分数加权：

$$
\rho = \alpha_1 \rho_1 + \alpha_2 \rho_2, \qquad \mu = \alpha_1 \mu_1 + \alpha_2 \mu_2
$$

动量方程中附加表面张力体积力 $\mathbf{f}_\sigma$：

$$
\frac{\partial (\rho \mathbf{u})}{\partial t} + \nabla \cdot (\rho \mathbf{u}\mathbf{u}) = -\nabla p + \nabla \cdot \boldsymbol{\tau} + \rho \mathbf{g} + \mathbf{f}_\sigma
$$

表面张力只在界面处作用，因此需要重建界面几何来估计法向与曲率。界面被解析的质量，直接决定表面张力与接触角是否可信。

需要强调的是，VOF 是一种体积分数方法而非真实的多相本构模型：它把两相物性按体积加权，界面厚度由数值格式维持在 1 到 2 个单元内，因此无法描述真实界面厚度与界面微结构。这一点决定了它只适合界面尺度远大于网格的问题。

## 3. 关键方程与公式

体积分数的对流输运方程为

$$
\frac{\partial \alpha}{\partial t} + \nabla \cdot (\alpha \mathbf{u}) = 0
$$

界面法向由体积分数梯度得到，曲率是其散度：

$$
\mathbf{n} = \frac{\nabla \alpha}{|\nabla \alpha|}, \qquad \kappa = -\nabla \cdot \mathbf{n}
$$

采用连续表面力（CSF）模型时，表面张力体积力为

$$
\mathbf{f}_\sigma = \sigma \kappa \mathbf{n} \delta_s
$$

其中 $\sigma$ 为表面张力，$\delta_s$ 为只在界面非零的分布函数。毛细效应强度用 Weber 数与 Capillary 数衡量：

$$
We = \frac{\rho U^{2} L}{\sigma}, \qquad Ca = \frac{\mu U}{\sigma}
$$

当 $We$ 或 $Ca$ 很小，表面张力主导，必须限制毛细时间步：

$$
\Delta t_\sigma \leq \frac{1}{2}\sqrt{\frac{\rho_m h^{3}}{\pi \sigma}}
$$

其中 $h$ 为网格尺度。壁面接触角通过修正界面法向施加，静态角与动态角应区分。

## 4. 工程做法与参数

1. **界面重构**：几何重构（PLIC）比纯代数压缩更锐利，但实现复杂；代数 VOF 需谨慎设置压缩系数，过大产生锯齿与假液滴。
2. **网格**：界面区和薄液层加密；曲率敏感问题保持界面附近网格近似均匀，避免尺寸突变。
3. **时间步**：控制界面 Courant 数（常取 0.25 以下），叠加毛细时间步限制；喷溅与破碎段再减小。界面 Courant 数定义为界面法向速度乘以时间步与网格尺度之比，过大将导致界面穿越多个单元并产生体积误差。
4. **接触角**：明确从哪一相测量，区分静态角与推进/后退动态角；微通道中接触角不确定度可能主导结果。
5. **初始化**：用几何区域精确设置液位，避免大量模糊界面单元；初始场与边界条件须自洽。
6. **求解策略**：使用压力-速度耦合的瞬态求解器，界面处至少二阶或 TVD 对流格式。

## 5. 可复现示例

下面给出二维溃坝算例的关键步骤，以及毛细时间步与界面 Courant 时间步的估算脚本。

步骤：

1. 建二维矩形槽，底部与两侧为无滑移壁面，顶部为压力出口。
2. 用几何区域在左侧初始化水柱（$\alpha_{water}=1$），其余为空气。
3. 打开重力 $g=9.81$，开启 CSF 表面张力，水气表面张力取 $0.072$ N/m。
4. 设置界面 Courant 数 0.25，先算 2 s。
5. 监控每相总体积与底部压力时程，与基准比较。

```python
import math
rho, sigma, h = 998.0, 0.072, 2.5e-3
dt_cap = 0.5 * math.sqrt(rho * h**3 / (math.pi * sigma))
co = 0.25
u_est = 1.5  # 特征速度 m/s
dt_co = co * h / u_est
print("毛细时间步上限 dt_sigma <= %.3e s" % dt_cap)
print("界面 Courant 时间步 dt_co ~ %.3e s" % dt_co)
print("建议初始时间步 = %.3e s" % min(dt_cap, dt_co))
```

运行后取二者较小值作为初始时间步，并根据自适应调整继续细化。若毛细时间步远小于 Courant 时间步，说明该问题由表面张力主导，需优先加密界面网格。

## 6. 常见坑与排查

- **寄生流**：曲率噪声产生非物理界面流动；加密并平滑界面网格、降低压缩系数。
- **质量不守恒**：界面穿过粗网格时体积漂移；检查库朗数与重构格式。
- **假液滴与锯齿**：压缩系数过大或界面欠解析；改用几何重构或减小时间步。
- **接触角方向错误**：法向定义反相，润湿结果整体翻转；确认测量相与符号约定。
- **静水压不静**：初始化界面与重力未平衡，出现初始振荡；先算静态平衡再启动。
- **薄液层丢失**：网格不足以致薄膜消失；局部加密或采用子网格液膜模型。

## 7. 检查清单与参考

- [ ] 界面是否被至少 3 到 5 个单元覆盖？
- [ ] 是否监控每相总体积与质量守恒？
- [ ] 毛细时间步与界面 Courant 数是否同时满足？
- [ ] 接触角定义、测量相与动态角是否明确？
- [ ] 是否用静水、静止液滴 Laplace 压差或溃坝基准验证？

参考：Hirt & Nichols, "Volume of Fluid Method for the Dynamics of Free Boundaries," 1981；Scardovelli & Zaleski, "Direct Numerical Simulation of Free-Surface and Interfacial Flow," 1999。
