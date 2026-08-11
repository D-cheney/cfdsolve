---
template_version: "flowlab-knowledge/1.0"
slug: les-hybrid-models
title: LES 与混合 RANS–LES 建模入门
summary: 说明 LES 的滤波思想、亚格子模型、入口湍流、网格与时间步要求，并介绍 DES 类混合方法的适用场景和网格诱导风险。
category:
  slug: turbulence-modeling
  name: 湍流与近壁建模
level: 专题
reading_minutes: 15
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [LES, DES, 亚格子模型, 瞬态湍流, 入口湍流]
seo:
  title: LES 与混合 RANS–LES 入门｜流研工坊
  description: 了解 LES/DES 的网格、时间步、入口湍流和统计收敛要求。
  keywords: [LES, DES, 亚格子模型, 湍流瞬态]
---

# LES 与混合 RANS–LES 建模入门

LES 直接解析大尺度非定常涡，只对网格以下的小尺度建模。它能提供丰富的瞬态结构，但成本和输入要求远高于稳态 RANS，不能仅通过在同一网格上切换模型获得可信结果。

## 1. 分辨率要求

网格应解析主要能量含量尺度，并在剪切层、尾迹和分离区近似各向均匀。壁面解析 LES 的成本随雷诺数急剧增长；壁模型 LES 可降低成本，但引入额外模型误差。

## 2. 时间步与离散

LES 需要低耗散空间格式和足够小的时间步，使局部 Co 与目标频率得到控制。过度耗散的格式会像额外亚格子模型一样抹平涡结构。

## 3. 入口湍流

短入口段若只给平均速度，流场需要较长距离发展。可采用合成湍流、循环映射或上游先导计算，并匹配目标湍流强度、长度尺度和频谱。

## 4. 混合方法

DES 类方法在附着边界层使用 RANS，在分离大涡区转为 LES。网格过早触发或延迟切换会产生网格诱导分离与灰区问题，因此网格设计必须遵循具体模型指南。

## 5. 统计收敛

丢弃初始瞬态后，采集多个大涡周转时间，检查分段均值、RMS 和频谱。报告瞬时图不能替代统计量和采样不确定度。

## 6. 参考资料

1. Pope, *Turbulent Flows*.
2. Sagaut, *Large Eddy Simulation for Incompressible Flows*.

