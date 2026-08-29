---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-thermal-fluid-systems
title: Modelica 热流体网络、介质与守恒建模
summary: 介绍热端口、流体端口、介质包、容积和阻力组件的功能分工，覆盖压力基准、流向反转、物性有效域和系统级质量能量守恒。
category: { slug: modelica-physical-domains, name: Modelica 物理域建模 }
level: 工程
reading_minutes: 18
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, Fluid, Thermal, Medium, 热流体, 守恒]
seo:
  title: Modelica 热流体系统建模
  description: 用介质包、流体端口、容积和阻力组件构建守恒且可初始化的热流体网络。
  keywords: [Modelica Fluid, Medium, thermal fluid system]
---

# Modelica 热流体网络、介质与守恒建模

系统级热流体模型强调库存、压降、换热和控制动态，不解析三维流场。组件的功能应清晰分为存储、输运、边界和控制。

## 1. 介质模型

全网络相连组件通常需要兼容的 Medium 包。选择不可压缩液体、理想气体、湿空气或两相介质时，要确认温压范围、状态变量和物性计算成本。介质 redeclare 应在系统顶层统一管理。

## 2. 组件角色

- 容积/储罐：存储质量与能量，产生动态状态；
- 管阻/阀门：建立压差—流量构成关系，通常不存储；
- 泵/风机：增加流体机械能并消耗轴功；
- 换热器：在两个流路或热端口间交换能量；
- 边界：规定压力、温度、焓、质量流量或组成中的适当组合。

## 3. 结构与初始化

闭合回路需要压力或库存基准，但不能把每个节点压力都固定。避免把一串零容积阻力与理想源组合成高指标或奇异代数环；必要时加入有物理依据的小容积、惯性或正则化。

## 4. 反向流和零流量

阀门关闭、泵切换和自然循环会发生流向反转。组件必须正确使用 stream 语义，并在零流量附近采用连续、守恒的关联式。禁用反向流只能在工况确实保证单向时作为性能优化。

## 5. 验收

对每个容积和整个系统检查质量、组分和能量平衡；核对泵功、壁面热流和库存变化。再与厂商曲线、实验或解析网络解比较。

## 6. 参考资料

1. Modelica Standard Library, Modelica.Fluid and Modelica.Thermal UsersGuide。

