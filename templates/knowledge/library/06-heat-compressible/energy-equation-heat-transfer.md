---
template_version: "flowlab-knowledge/1.0"
slug: energy-equation-heat-transfer
title: CFD 能量方程与对流传热建模
summary: 梳理焓、温度和总能量形式，说明导热、对流、黏性耗散、压力功和体热源的作用，并给出换热系数与能量平衡检查方法。
category:
  slug: heat-transfer
  name: 传热与可压缩流
level: 进阶
reading_minutes: 13
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [能量方程, 对流传热, 导热, 换热系数, 能量守恒]
seo:
  title: CFD 能量方程与传热建模｜流研工坊
  description: 理解能量方程中的对流、导热和源项，并用总能量收支验证结果。
  keywords: [CFD 能量方程, 对流换热, 热流, 换热系数]
---

# CFD 能量方程与对流传热建模

当温度影响目标量、物性、密度或浮力时必须求解能量方程。选择温度、焓或总能量形式取决于速度、压缩性、相变和求解器实现。

## 1. 主要输运机制

能量通过质量流携带、通过温度梯度导热，并由体热源、黏性耗散、压力功、反应和辐射改变。低速常物性问题可简化，但高速、高黏流体和强压缩时不能忽略相关项。

## 2. 物性与湍流

需要给出 `cp`、导热系数和密度关系。湍流传热常通过湍流普朗特数闭合，该参数会影响壁面换热和混合，重要项目应做敏感性检查。

## 3. 换热系数

```text
h = q'' / (Tw - Tref)
Nu = h L / k
```

`Tref` 可能是入口温度、截面混合平均温度或局部主流温度，必须明确。不同参考温度会得到不同 h，不能脱离定义比较。

## 4. 能量平衡

稳定问题应核对入口焓流、出口焓流、壁面热量和体源项。瞬态问题还包含域内储能变化。积分方向和热流符号要统一。

## 5. 验证

用 Nusselt 关联式、解析导热解、热阻网络或实验数据比较。除温度云图外，报告总功率、壁面热流分布、峰值位置和能量不平衡。

## 6. 参考资料

1. Incropera et al., *Fundamentals of Heat and Mass Transfer*.
2. Patankar, *Numerical Heat Transfer and Fluid Flow*.

