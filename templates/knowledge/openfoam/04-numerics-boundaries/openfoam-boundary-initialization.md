---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-boundary-initialization
title: OpenFOAM 初始场、边界条件与场初始化
summary: 解释 fixedValue、zeroGradient、混合、入口出口、对称、周期与壁面边界的物理含义，给出 patch 一致性、压力基准、回流和 setFields 初始化检查清单。
category: { slug: openfoam-numerics-boundaries, name: OpenFOAM 边界与数值设置 }
level: 工程
reading_minutes: 16
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, 边界条件, 初始场, setFields, 压力基准]
seo:
  title: OpenFOAM 边界条件与初始化
  description: 保持几何 patch、场边界、压力基准和初始区域一致，处理出口回流。
  keywords: [OpenFOAM boundary condition, setFields, fixedValue]
---

# OpenFOAM 初始场、边界条件与场初始化

边界条件表达数学约束，名称相同也未必适合所有物理场。必须逐个字段检查入口、出口、壁面、对称与耦合接口。

## 1. 基本关系

`fixedValue` 约束边界值，`zeroGradient` 约束法向梯度为零；混合或入口出口类条件会根据流向切换。压力与速度边界必须成对形成适定问题，闭域不可压缩流还需要唯一压力基准。

## 2. patch 一致性

网格的 patch 名和类型必须与每个初始场文件一致。网格重生成或重命名后，应扫描所有字段，避免遗留默认 patch 或错误壁面类型。周期、处理器、AMI 和多区域接口还要检查配对与几何映射。

## 3. 回流

出口发生回流通常说明计算域过短、流动本质非稳态或出口条件不适合。应先改善域和物理设置；若允许短时回流，必须为速度、湍流量、温度和组分定义有界且物理合理的回流值。

## 4. 初始化

均匀 `internalField` 适合简单起点；`setFields` 或映射旧解适合分区和复杂初场。初始化后立即可视化区域、相分数、温度和速度方向。映射结果必须检查守恒和边界，不应假定网格间自动保持所有量。

## 5. 验收清单

- 单位、坐标方向和表压/绝压定义；
- 入口流量与速度剖面是否一致；
- 壁面运动、热、粗糙度和湍流条件；
- 压力参考与封闭域约束；
- 回流组成与温度；
- 初场是否接近可实现状态。

## 6. 参考资料

1. 当前 OpenFOAM 版本的 Boundary Conditions 文档。

