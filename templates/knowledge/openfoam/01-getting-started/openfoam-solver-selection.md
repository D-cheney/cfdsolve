---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-solver-selection
title: OpenFOAM 求解器与物理模型选择方法
summary: 用稳态或瞬态、不可压缩或可压缩、单相或多相、等温或传热等问题维度选择 OpenFOAM 求解器，并说明如何核实求解器实际读取的字段与模型。
category: { slug: openfoam-getting-started, name: OpenFOAM 入门与案例组织 }
level: 工程
reading_minutes: 12
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, 求解器选择, 物理模型, SIMPLE, PIMPLE]
seo:
  title: OpenFOAM 求解器选择方法
  description: 按时间特性、可压缩性、相态和能量方程选择并核实 OpenFOAM 求解器。
  keywords: [OpenFOAM solver, 求解器选择, SIMPLE, PIMPLE]
---

# OpenFOAM 求解器与物理模型选择方法

求解器选择应从方程组出发，而不是从名称猜测。新版本可能把多个旧求解器合并为模块化求解器，因此最终依据应是当前版本文档、源码和启动日志。

## 1. 决策维度

1. 时间：稳态统计量还是必须解析瞬态；
2. 密度：常密度、弱可压缩还是完整可压缩；
3. 相态：单相、自由液面、欧拉多相还是拉格朗日颗粒；
4. 能量：等温、传热、浮力、共轭传热或反应；
5. 流变：牛顿、非牛顿或其他本构；
6. 区域：单一区域还是固体—流体多区域。

## 2. 选择流程

先找当前安装版本中物理最接近的官方教程，确认它读取哪些场、物性文件和模型字典。运行日志通常会打印所选湍流、热物性和离散模型，可用于核对“以为启用”与“实际启用”是否一致。

稳态算法适合稳定统计解，但不能把本质非稳态流动强行收敛为唯一答案。瞬态算法还要根据 Courant 数和目标频率确定时间步与采样长度。

## 3. 最小基准

复杂案例应逐层增加物理：层流单相 → 湍流单相 → 传热/浮力 → 多相/反应。每一层都保存守恒、压降或换热量等基准，新增模型导致异常时才能快速定位。

## 4. 不应作为唯一依据的信息

- 求解器名称中的 `simple`、`pimple` 或 `rho`；
- 来自另一发行线或旧版本的博客配置；
- 仅凭残差下降判断物理模型正确；
- “能跑完”而没有质量、能量与量纲检查。

## 5. 参考资料

1. 当前安装发行版的 Solver/Applications 文档。
2. 当前版本随附 tutorials 与求解器源码。

