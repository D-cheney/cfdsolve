---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-cfd-rom-coupling
title: Modelica 与 CFD 特性图、降阶模型耦合
summary: 比较特性图、响应面、状态空间降阶、FMU 联合仿真和在线 CFD 耦合的成本与适用范围，给出接口变量、守恒、时间尺度和误差验证流程。
category: { slug: modelica-integration, name: Modelica 集成与联合仿真 }
level: 专题
reading_minutes: 19
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, CFD, 降阶模型, ROM, 特性图, 联合仿真]
seo:
  title: Modelica 与 CFD 降阶耦合方法
  description: 选择特性图、ROM、FMU 或在线 CFD 耦合，并验证接口守恒、通信步长和域外行为。
  keywords: [Modelica CFD coupling, reduced order model, ROM]
---

# Modelica 与 CFD 特性图、降阶模型耦合

Modelica 适合系统动态，CFD 适合局部三维流动。工程上优先使用能满足目标精度的最低成本耦合层级。

## 1. 耦合层级

- 常数/经验关联式：快速，适合窄工况；
- 多维特性图或响应面：适合设备压降、效率、换热等稳态映射；
- 动态状态空间或其他 ROM：保留主要瞬态；
- FMU 联合仿真：封装独立动态模型；
- 在线 CFD：成本最高，用于无法离线降阶的强三维瞬态。

## 2. 数据设计

采样范围应覆盖预计的流量、转速、温度、压力和控制状态，并在梯度大、转捩或失速附近加密。数据集划分训练、验证和独立测试；记录 CFD 网格、物理模型和数值不确定度。

## 3. 接口变量

明确表压/绝压、总量/静量、质量流量方向、焓/温度和参考状态。压力—流量接口要避免双方同时强制同一变量。能量耦合优先传递守恒的焓流或热流，而非仅传温度。

## 4. 动态与稳定性

通信步长必须解析关键系统动态。强反馈、流向反转或快速阀门动作可能导致显式联合仿真不稳定。离线 ROM 要检查稳定性、因果性和域外限制。

## 5. 验证流程

1. 单独验证 CFD 数据或高保真模型；
2. 验证特性图/ROM 的留出工况误差；
3. 在 Modelica 中做稳态点对点比较；
4. 做阶跃、斜坡和极限工况瞬态比较；
5. 检查系统级质量与能量守恒；
6. 报告代理误差、CFD 不确定度和耦合步长敏感性。

## 6. 参考资料

1. Modelica Association Project FMI, FMI Standard。
2. ASME V&V 20, Computational Fluid Dynamics and Heat Transfer Verification and Validation。

