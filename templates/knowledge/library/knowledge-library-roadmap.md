---
template_version: "flowlab-knowledge/1.0"
slug: knowledge-library-roadmap
title: 流研工坊知识库导航与学习路线
summary: 按 CFD 基础、数值方法、网格、边界、湍流、传热、多相流、验证确认和 Modelica 九个专题组织全部知识块，并提供面向不同任务的推荐阅读顺序。
category:
  slug: knowledge-navigation
  name: 知识库导航
level: 入门
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T01:00:00.000Z"
tags: [知识地图, 学习路线, CFD, Modelica, 索引]
seo:
  title: CFD 与 Modelica 知识库导航｜流研工坊
  description: 浏览流研工坊九大知识专题，按任务选择 CFD、验证确认与 Modelica 学习路线。
  keywords: [CFD 知识库, CFD 学习路线, Modelica 教程, 知识地图]
---

# 流研工坊知识库导航与学习路线

知识库把一个完整仿真项目拆成可独立检索的知识块。建议先从目标任务出发选择路线，再进入专题逐篇阅读；遇到具体设置问题时，也可直接从分类或标签定位文章。

## 1. CFD 基础

1. [CFD 问题定义与标准计算流程](/knowledge/cfd-problem-definition)
2. [流体物性、单位与量纲检查](/knowledge/fluid-properties-and-units)
3. [CFD 常用无量纲数与尺度判断](/knowledge/dimensionless-numbers-for-cfd)
4. [质量、动量与能量守恒方程概览](/knowledge/conservation-equations-overview)

## 2. 数值方法

1. [有限体积法：从积分守恒到离散方程](/knowledge/finite-volume-method)
2. [对流项离散格式选择与有界性检查](/knowledge/convection-scheme-selection)
3. [不可压缩流的压力—速度耦合方法](/knowledge/pressure-velocity-coupling)
4. [瞬态 CFD 的时间步、Courant 数与采样长度](/knowledge/transient-time-step-courant)
5. [残差、监控量与 CFD 收敛判定](/knowledge/residuals-and-convergence)

## 3. 网格与边界

1. [CFD 网格拓扑与单元类型选择](/knowledge/mesh-topology-selection)
2. [CFD 网格质量指标与修复顺序](/knowledge/mesh-quality-metrics)
3. [边界层网格、首层高度与 y+ 设计](/knowledge/boundary-layer-mesh-yplus)
4. [CFD 网格无关性与系统加密方法](/knowledge/mesh-independence-study)
5. [CFD 出口回流与边界一致性检查](/knowledge/outlet-backflow-control)
6. [CFD 入口边界、剖面与湍流量设置](/knowledge/inlet-boundary-specification)
7. [CFD 出口回流、计算域长度与压力边界](/knowledge/outlet-backflow-control)
8. [CFD 壁面运动、粗糙度与热边界条件](/knowledge/wall-boundary-heat-transfer)
9. [对称、周期、接口边界与初始场设置](/knowledge/symmetry-periodic-initialization)

## 4. 湍流建模

1. [RANS 湍流模型选择框架](/knowledge/rans-model-selection)
2. [标准、RNG 与可实现 k-ε 模型使用指南](/knowledge/k-epsilon-model-guide)
3. [k-ω SST 模型与分离流计算指南](/knowledge/k-omega-sst-model-guide)
4. [壁函数、低雷诺模型与近壁结果判读](/knowledge/wall-functions-low-reynolds)
5. [LES 与混合 RANS–LES 建模入门](/knowledge/les-hybrid-models)

## 5. 传热与可压缩流

1. [CFD 能量方程与对流传热建模](/knowledge/energy-equation-heat-transfer)
2. [共轭传热、薄壁与接触热阻建模](/knowledge/conjugate-heat-transfer)
3. [热辐射模型选择与能量平衡](/knowledge/radiation-model-selection)
4. [可压缩流边界、总静参数与激波计算](/knowledge/compressible-flow-shock-guidelines)

## 6. 多相流与组分输运

1. [CFD 多相流模型选择框架](/knowledge/multiphase-model-selection)
2. [VOF 自由液面、表面张力与界面捕捉](/knowledge/vof-free-surface)
3. [拉格朗日颗粒追踪与双向耦合](/knowledge/lagrangian-particle-tracking)
4. [空化模型、汽蚀判据与结果判读](/knowledge/cavitation-modeling)
5. [组分输运、扩散与反应源项建模](/knowledge/species-transport-reaction)

## 7. 验证、确认与后处理

1. [CFD 验证、确认与不确定度基础](/knowledge/verification-validation-uncertainty)
2. [CFD 质量、动量、能量与组分守恒检查](/knowledge/conservation-balance-checks)
3. [GCI 与 CFD 离散不确定度报告](/knowledge/gci-discretization-uncertainty)
4. [力系数、时间平均与 CFD 可复现报告](/knowledge/force-coefficients-reporting)

## 8. Modelica 系统建模

1. [Modelica 方程式建模与模型平衡](/knowledge/modelica-equation-based-modeling)
2. [Modelica 连接器、连接方程与能流方向](/knowledge/modelica-connectors-connections)
3. [Modelica 初始化、初始方程与稳态起点](/knowledge/modelica-initialization)
4. [Modelica 事件、混合系统与 CFD 降阶耦合](/knowledge/modelica-events-cfd-coupling)

## 9. 按任务选择路线

- 入门与首个案例：基础 → 数值方法 → 网格与边界 → 验证确认；
- 湍流内流与换热：基础 → 网格 → 边界 → 湍流 → 传热 → 验证确认；
- 自由液面或颗粒：基础 → 瞬态方法 → 网格与边界 → 多相流 → 验证确认；
- 高速气动：基础 → 数值方法 → 湍流 → 可压缩流 → 验证确认；
- 系统联合仿真：传热与流动基础 → Modelica → CFD 特性图/降阶耦合 → 验证确认。

## 10. 使用原则

知识文章用于建立计算方法和检查清单，不能替代具体软件版本手册、项目试验数据或专业审查。关键工程结论应保留输入、网格、日志、验证数据和不确定度说明。

