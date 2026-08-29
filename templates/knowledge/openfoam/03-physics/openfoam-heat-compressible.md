---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-heat-compressible
title: OpenFOAM 传热、浮力与可压缩流配置
summary: 从热物性、状态方程、焓温关系、浮力压力变量和边界总静参数出发，整理 OpenFOAM 传热与可压缩案例的配置顺序及能量守恒验收方法。
category: { slug: openfoam-physics, name: OpenFOAM 物理模型 }
level: 工程
reading_minutes: 17
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, 传热, 浮力, 可压缩流, 热物性, 能量守恒]
seo:
  title: OpenFOAM 传热与可压缩流配置
  description: 检查热物性、状态方程、浮力压力和总静边界，并用能量平衡验收。
  keywords: [OpenFOAM heat transfer, buoyancy, compressible]
---

# OpenFOAM 传热、浮力与可压缩流配置

此类案例最常见的问题不是数值格式，而是热力学模型、求解变量和边界量定义不一致。

![管内共轭换热温度场与流线](../../assets/simulations/openfoam-conjugate-heat-pipe.png)

*图：加热管道内流体温升、热边界层与固体壁面导热的概念性可视化。该图为 AI 生成的教学示意，不含定量标尺，工程结论仍应来自实际求解与能量平衡。*

## 1. 配置顺序

1. 判断密度是否可视为常数，以及是否需要状态方程；
2. 选择温度、焓或总能量等求解表述；
3. 定义比热、导热率、黏度等随温度变化关系；
4. 浮力案例确认重力方向、参考高度和压力变量含义；
5. 可压缩入口/出口区分总压、静压、总温与静温；
6. 固—流多区域检查材料、界面和接触热阻。

## 2. 压力与温度

某些浮力求解器使用去除静水项的压力变量，后处理中直接当绝对压力会产生误解。某些可压缩求解器内部以焓工作，温度由热物性关系恢复。初始化和边界条件必须针对实际求解字段设置。

## 3. 稳定策略

先用常物性、较保守格式和较小时间步建立基线，再逐步引入温变物性、辐射或自然对流。检查温度、密度和热物性是否落在有效范围；非物理温度常会触发后续热物性失败。

## 4. 能量验收

对控制域计算入口焓流、出口焓流、壁面热流、体热源和储能变化。稳态时净差应接近零；瞬态时净输入应与内能变化一致。共轭传热还应检查界面两侧热流连续与温度跳变是否符合接触模型。

## 5. 参考资料

1. 当前 OpenFOAM 版本的 Thermophysical Models 与 Heat Transfer 教程。
