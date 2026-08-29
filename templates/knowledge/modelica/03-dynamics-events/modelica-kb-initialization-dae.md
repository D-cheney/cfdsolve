---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-initialization-dae
title: Modelica DAE 初始化、start/fixed 与稳态起点
summary: 解释初始化问题、start 与 fixed 属性、initial equation、稳态初始化和同伦方法，提供从小系统到完整网络逐步消除奇异与不一致初值的流程。
category: { slug: modelica-dynamics-events, name: Modelica 动态、初始化与事件 }
level: 工程
reading_minutes: 17
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, 初始化, DAE, start, fixed, homotopy]
seo:
  title: Modelica DAE 初始化与稳态起点
  description: 正确使用 start、fixed 和 initial equation，诊断过定、欠定与不一致初值。
  keywords: [Modelica initialization, DAE, initial equation]
---

# Modelica DAE 初始化、start/fixed 与稳态起点

仿真开始前，工具必须求解一组初始化方程以确定状态、导数、代数量和离散模式。初始化失败常是物理约束冲突，而非单纯的求解器问题。

## 1. start 与 fixed

`start` 通常提供非线性求解初猜；`fixed=true` 才把该起始值作为约束。不同变量类型和工具默认值可能不同，应显式写出关键状态的意图。不要把所有变量都设为固定初值，这往往造成过定。

## 2. initial equation

用 `initial equation` 描述起点关系，例如初始温度、初始库存或稳态条件 `der(x)=0`。完整系统只应提供足够独立的初始约束；边界压力、总质量和各容积压力同时固定时可能互相冲突。

## 3. 稳态初始化

对具有积分状态或封闭库存的系统，稳态可能不唯一或根本不存在。先确认外部质量、能量和控制信号允许稳态，再选择哪些状态设 `der(x)=0`，哪些保留指定初值。

## 4. 诊断流程

1. 在组件级运行最小示例；
2. 查看展开后初始化未知量与方程；
3. 识别冲突固定值、冗余边界和奇异连接；
4. 为非线性变量提供物理初猜与 nominal；
5. 从简化方程或 `homotopy` 起步；
6. 逐步恢复完整模型并保存回归案例。

## 5. 验收

检查初始化残差、质量/能量库存、离散模式、阀门开闭和物性有效范围。一个数学可解的起点也可能物理上不可能。

## 6. 参考资料

1. Modelica Language Specification, Initialization and Homotopy。

