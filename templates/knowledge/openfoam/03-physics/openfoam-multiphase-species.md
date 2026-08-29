---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-multiphase-species
title: OpenFOAM 多相流、组分与反应建模路线
summary: 按界面尺度、相含率、颗粒体积分数和反应时间尺度选择 VOF、欧拉多相或拉格朗日方法，并给出组分、相间交换、化学反应和守恒验证的递进流程。
category: { slug: openfoam-physics, name: OpenFOAM 物理模型 }
level: 专题
reading_minutes: 18
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, 多相流, VOF, 颗粒, 组分输运, 反应]
seo:
  title: OpenFOAM 多相流与组分反应建模
  description: 按物理尺度选择多相方法，并逐层验证相分数、组分与反应守恒。
  keywords: [OpenFOAM multiphase, VOF, species transport]
---

# OpenFOAM 多相流、组分与反应建模路线

模型选择取决于是否解析界面、分散相尺度、相间滑移和耦合强度，而不是“相数越多模型越高级”。

![VOF 溃坝自由液面与速度场](../../assets/simulations/openfoam-vof-dam-break.png)

*图：VOF 溃坝过程中自由液面卷曲、夹气区和液相速度分布的概念图。该图为 AI 生成的教学示意，用于辨认应关注的场结构，不作为相分数或速度的定量结果。*

## 1. 路线选择

- VOF：需要解析大尺度自由界面，重点是界面压缩、表面张力和重力；
- 欧拉—欧拉：各相视为连续介质，需要闭合相间曳力、升力、传热或传质；
- 拉格朗日颗粒：跟踪离散颗粒/液滴，可从单向逐步增加双向和碰撞耦合；
- 组分输运：单相混合物内求解质量分数与扩散；
- 反应流：在流动与组分基础上增加动力学、热效应和刚性化学时间尺度。

## 2. 递进建模

先完成不含相间交换或反应的流动基准，再开启一个闭合项。每一步核对相分数和、组分质量分数和、总质量流率、相间源项成对平衡以及能量释放。

## 3. 时间步与有界性

除流动 Courant 数外，还要考虑界面 Courant 数、颗粒响应时间、反应时间尺度和源项刚性。相分数或质量分数越界不应只靠裁剪掩盖，应检查格式、时间步、边界回流和源项线性化。

## 4. 初始与边界条件

用场初始化工具明确设置相区或组分区，并核实几何选择。入口必须给出相含率/组分，出口要考虑回流时的组成；壁面需按润湿、反弹、捕集或反应机理定义。

## 5. 验收

报告总体与逐相质量守恒、界面/颗粒统计、压降、停留时间、组分转化率和网格时间步敏感性。多相结果应同时展示模型闭合假设。

## 6. 参考资料

1. 当前 OpenFOAM 版本的 Multiphase、Lagrangian 与 Combustion 文档。
