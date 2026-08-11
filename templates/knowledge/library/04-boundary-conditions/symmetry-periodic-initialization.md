---
template_version: "flowlab-knowledge/1.0"
slug: symmetry-periodic-initialization
title: 对称、周期、接口边界与初始场设置
summary: 说明对称简化的成立条件、平移与旋转周期映射、非共形接口守恒检查，以及稳态和瞬态计算的初始场与参考压力设置。
category:
  slug: boundary-conditions
  name: 边界条件与初始化
level: 进阶
reading_minutes: 12
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [对称边界, 周期边界, 非共形接口, 初始化, 参考压力]
seo:
  title: CFD 对称周期接口与初始化｜流研工坊
  description: 判断对称与周期假设，检查接口守恒，并构造与边界一致的初始流场。
  keywords: [CFD 对称边界, 周期边界, 网格接口, 初始化]
---

# 对称、周期、接口边界与初始场设置

对称和周期可以显著降低计算成本，但它们同时限制了解的空间模式。几何重复不等于流动一定重复，旋转失速、非对称分离和随机扰动都可能破坏简化假设。

## 1. 对称边界

对称面通常要求法向速度为零，其他变量法向梯度为零。只有几何、材料、边界载荷和预期解都关于该面对称时才能使用。对称面若切穿主旋涡，会人为抑制横向运动。

## 2. 周期边界

平移周期用于重复通道，旋转周期用于扇区或叶道。配对面必须具有正确变换关系，质量流量、压降或旋转相位设置要相容。非共形周期接口还应检查插值守恒和分辨率差异。

## 3. 区域接口

流固、旋静和不同网格区之间的接口应传递所需通量。检查接口是否存在未配对面、重叠、缝隙或法向错误，并在计算后比较接口两侧质量、能量和力的平衡。

## 4. 初始场

初始场不是边界条件，但会影响非线性收敛路径。可用入口状态、势流、低阶模型或已收敛工况初始化。多相流需特别避免初始体积分数与边界不一致。

## 5. 参考压力

不可压缩压力通常只确定到一个常数，需要设置参考位置或出口压力。参考点应远离强梯度区，并在所有后处理与实验比较中保持同一压力基准。

## 6. 参考资料

1. Ferziger, Perić & Street, *Computational Methods for Fluid Dynamics*.
2. Versteeg & Malalasekera, *An Introduction to Computational Fluid Dynamics*.

