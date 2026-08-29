---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-checkmesh-quality
title: OpenFOAM checkMesh 质量诊断与修复顺序
summary: 解释 checkMesh 的拓扑、几何、非正交、偏斜和体积类检查，强调最差单元定位，并提供从致命拓扑错误到关键区质量优化的修复顺序。
category: { slug: openfoam-meshing, name: OpenFOAM 网格 }
level: 工程
reading_minutes: 12
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, checkMesh, 非正交, 偏斜, 网格质量]
seo:
  title: OpenFOAM checkMesh 诊断与修复
  description: 解读 checkMesh 输出，定位最差单元并按风险顺序修复网格。
  keywords: [checkMesh, mesh quality, non-orthogonality]
---

# OpenFOAM checkMesh 质量诊断与修复顺序

`checkMesh` 是诊断工具，不是“通过即可信”的认证。可接受阈值取决于离散格式、物理梯度和坏单元位置。

## 1. 检查层次

- 拓扑：开放边、非法连接、重复面、非流形结构；
- 几何：负体积、极小体积、面法向与单元中心关系；
- 数值风险：非正交、偏斜、凹面、长宽比和尺寸跳变；
- 边界：patch 数量、面数、类型和周期/接口映射。

## 2. 修复优先级

1. 负体积、非法拓扑和区域泄漏；
2. 边界命名、周期、耦合面和多区域不一致；
3. 强梯度区、源项区和接口附近的最差单元；
4. 过快尺寸增长、边界层中断和局部高偏斜；
5. 远场内不影响目标量的统计尾部。

## 3. 空间定位

使用当前版本支持的写出选项生成问题 cell/face 集合，在 ParaView 中与压力、速度或温度梯度叠加。最大非正交值相同的两个网格，若坏单元位置不同，计算风险可能完全不同。

## 4. 求解器配合

非正交修正次数只能缓解部分离散误差，不能修复错误几何。若线性迭代突然升高、局部出现非物理极值或 Courant 数热点，应回到对应 cellSet 检查网格。

## 5. 验收记录

保存完整日志、最差单元集合、质量分布、关键区截图、边界层统计和最终工程量的网格敏感性结果。

## 6. 参考资料

1. 当前 OpenFOAM 版本的 checkMesh 帮助与 Mesh Quality 文档。

