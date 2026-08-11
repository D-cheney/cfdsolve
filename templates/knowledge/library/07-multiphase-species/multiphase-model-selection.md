---
template_version: "flowlab-knowledge/1.0"
slug: multiphase-model-selection
title: CFD 多相流模型选择框架
summary: 从相分布、体积分数、界面尺度、颗粒浓度和相间耦合强度出发，在 VOF、混合物、Euler–Euler 与 Euler–Lagrange 方法之间做选择。
category:
  slug: multiphase-flow
  name: 多相流与组分输运
level: 进阶
reading_minutes: 14
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [多相流, VOF, Euler-Euler, Euler-Lagrange, 模型选择]
seo:
  title: CFD 多相流模型选择框架｜流研工坊
  description: 根据界面形态、浓度和相间耦合选择适合的多相 CFD 方法。
  keywords: [多相流模型, VOF, Euler-Euler, DPM]
---

# CFD 多相流模型选择框架

多相模型的第一问题是“界面是否需要被解析”，第二问题是“分散相是否可以用统计连续介质描述”。先回答这两个问题，再考虑软件中的模型名称。

## 1. 按相形态选择

清晰的大尺度自由液面、液滴合并或波动通常使用 VOF 等界面捕捉方法。大量分散气泡或颗粒且各相体积分数都重要时，可考虑 Euler–Euler。稀疏颗粒、液滴或气泡轨迹问题常使用 Euler–Lagrange。相间滑移较弱且只关注混合物整体行为时，可用简化混合物模型。

## 2. 耦合强度

稀相可采用单向耦合，连续相影响颗粒而颗粒不反作用；负载增加后需双向动量、能量或质量耦合；高浓度还可能需要颗粒—颗粒碰撞和颗粒应力模型。

## 3. 闭合关系

阻力、升力、湍流扩散、破碎、聚并、传热和相变都需要子模型。子模型应与粒径、形状、Re、We 和体积分数范围相符，不能把软件默认当作已验证参数。

## 4. 网格与时间步

界面捕捉需要足够网格解析曲率和薄液层；拉格朗日颗粒需要控制单元穿越时间；Euler–Euler 需解析相含率梯度。不同方法的时间步限制不可互换。

## 5. 验证路线

先用单液滴、沉降速度、气泡柱或静水自由面等基准验证子模型，再进入复杂设备。报告各相质量守恒、相含率范围、粒径分布和统计采样。

## 6. 参考资料

1. Crowe et al., *Multiphase Flows with Droplets and Particles*.
2. Ishii & Hibiki, *Thermo-Fluid Dynamics of Two-Phase Flow*.

