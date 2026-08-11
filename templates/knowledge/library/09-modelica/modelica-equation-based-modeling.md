---
template_version: "flowlab-knowledge/1.0"
slug: modelica-equation-based-modeling
title: Modelica 方程式建模与模型平衡
summary: 介绍声明式方程、参数、状态变量、代数变量和模型平衡概念，说明如何从物理守恒关系构造可组合、可检查的 Modelica 组件。
category:
  slug: modelica
  name: Modelica 系统建模
level: 入门
reading_minutes: 12
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [Modelica, 方程式建模, 模型平衡, DAE, 系统仿真]
seo:
  title: Modelica 方程式建模与模型平衡｜流研工坊
  description: 从物理方程、变量和参数建立结构平衡的 Modelica 可复用组件。
  keywords: [Modelica 教程, 方程式建模, 模型平衡, DAE]
---

# Modelica 方程式建模与模型平衡

Modelica 使用声明式方程描述变量之间的物理关系，工具决定求解方向。模型不应依赖固定输入—输出顺序，而应围绕守恒、构成关系和连接接口组织。

## 1. 基本元素

`parameter` 在一次仿真中保持不变，普通变量由方程求解，带 `der(x)` 的变量可能成为状态。方程使用等号表达关系，不是赋值语句。

```modelica
model ThermalMass
  parameter Real C(unit="J/K") = 1000;
  Real T(unit="K", start=300);
  Real Q_flow(unit="W");
equation
  C * der(T) = Q_flow;
end ThermalMass;
```

## 2. 模型平衡

局部平衡要求未知变量与独立方程数量匹配。少方程导致欠定，多方程导致过定。连接器中的 flow 变量和外部输入也会影响计数，不能只数源码中的等号。

## 3. 单位与类型

为物理量声明 SI 单位、合理的 `min/max` 和初值。工具的单位检查能发现许多结构正确但物理错误的方程。

## 4. 建模顺序

1. 写清组件边界和能量/质量存储；
2. 定义连接器与参数；
3. 添加守恒方程和构成关系；
4. 检查模型平衡与单位；
5. 用极限工况和解析解测试；
6. 再组合为更大系统。

## 5. 参考资料

1. Modelica Association, *Modelica Language Specification*.
2. Fritzson, *Principles of Object-Oriented Modeling and Simulation with Modelica*.

