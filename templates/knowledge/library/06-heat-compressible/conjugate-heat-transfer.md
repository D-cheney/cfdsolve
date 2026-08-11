---
template_version: "flowlab-knowledge/1.0"
slug: conjugate-heat-transfer
title: 共轭传热、薄壁与接触热阻建模
summary: 说明流体对流与固体导热的耦合方式，比较显式固体域和薄壁模型，给出材料物性、接触热阻、接口网格和热平衡检查项。
category:
  slug: heat-transfer
  name: 传热与可压缩流
level: 工程
reading_minutes: 12
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [共轭传热, 固体导热, 接触热阻, 薄壁, 热平衡]
seo:
  title: CFD 共轭传热与接触热阻｜流研工坊
  description: 同时求解流体对流与固体导热，并正确处理薄壁、接口和接触热阻。
  keywords: [共轭传热, CHT, 接触热阻, 薄壁模型]
---

# 共轭传热、薄壁与接触热阻建模

共轭传热同时求解流体能量和固体导热，接口满足温度与热流耦合。它适合壁温未知、固体内部导热影响明显的设备。

## 1. 建模选择

厚实体或内部温度梯度重要时建立固体域；厚度远小于其他尺度且法向温度变化可简化时使用薄壁。薄壁模型需要真实厚度、导热系数和面方向，不能把厚度重复建入几何。

## 2. 接口条件

理想接触要求界面温度连续、两侧法向热流守恒。存在涂层、间隙或接触不良时，用面热阻或薄层模型表达。非共形接口必须验证插值后的总热量守恒。

## 3. 固体网格与物性

根据 Biot 数和预期梯度安排固体厚度方向网格。金属导热系数、复合材料各向异性和温度依赖都可能影响热点位置；材料方向必须与坐标一致。

## 4. 收敛与时间尺度

固体热惯性常比流体时间尺度长，瞬态 CHT 需要覆盖足够物理时间。强耦合问题可逐步加载热源，监控接口热流和固体储能。

## 5. 验证

用热阻网络估算总温差，检查加热功率、流体焓升、外壁散热和固体储能闭合。对接口两侧分别积分热流，差异应低于项目容差。

## 6. 参考资料

1. Incropera et al., *Fundamentals of Heat and Mass Transfer*.
2. Versteeg & Malalasekera, *An Introduction to Computational Fluid Dynamics*.

