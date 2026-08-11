---
template_version: "flowlab-knowledge/1.0"
slug: mesh-topology-selection
title: CFD 网格拓扑与单元类型选择
summary: 比较结构六面体、非结构四面体、多面体、棱柱边界层和二维四边形网格，说明根据流动方向、几何复杂度与目标梯度选择网格的方法。
category:
  slug: mesh-generation
  name: 网格与离散质量
level: 入门
reading_minutes: 11
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [网格, 六面体, 四面体, 多面体, 网格拓扑]
seo:
  title: CFD 网格拓扑与单元类型选择｜流研工坊
  description: 根据几何、流向和梯度选择六面体、四面体、多面体与棱柱网格。
  keywords: [CFD 网格, 六面体网格, 多面体网格, 四面体网格]
---

# CFD 网格拓扑与单元类型选择

网格类型没有绝对优劣。好的网格用有限单元数解析目标方向的梯度，并让数值通量尽量沿合理方向传递。

## 1. 常见单元

结构六面体可沿流向和法向有计划地分布节点，适合管道、叶道和边界层，但复杂几何分块成本高。四面体自动化程度高，适合复杂几何初始建模，却容易在相同精度下需要更多单元。多面体通常具有较多邻接面，对复杂非结构区域较稳健。壁面附近常叠加棱柱层，以控制法向分辨率和增长率。

## 2. 按物理选择方向

边界层需要高法向分辨率而允许较大切向尺度；尾迹、射流和剪切层应沿主传播方向加密；旋转界面和周期面要保证映射质量；激波需要足够法向分辨率并控制单元倾斜。

## 3. 二维、轴对称与三维

只有几何、边界和预期解均满足简化假设时才能使用二维或轴对称。弯曲、旋转、端壁和三维不稳定性可能使低维模型给出错误结论。

## 4. 选择流程

1. 标记壁面、间隙、前缘、尾迹和预期高梯度区；
2. 选择能控制这些方向分辨率的拓扑；
3. 预估单元量与内存；
4. 生成粗网格检查边界和连通性；
5. 通过网格加密验证，而不是凭外观验收。

## 5. 参考资料

1. Thompson, Soni & Weatherill, *Handbook of Grid Generation*.
2. Moukalled, Mangani & Darwish, *The Finite Volume Method in Computational Fluid Dynamics*.

