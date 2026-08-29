---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-types-functions-algorithms
title: Modelica 类型、单位、数组、函数与 algorithm
summary: 说明类型属性和 SI 单位、数组方程、函数的纯计算边界以及 algorithm 中赋值语义，帮助在声明式模型中安全封装重复计算与数据处理。
category: { slug: modelica-language, name: Modelica 语言基础 }
level: 进阶
reading_minutes: 15
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, 类型, 单位, 数组, function, algorithm]
seo:
  title: Modelica 类型数组函数与算法段
  description: 使用 SI 类型、数组方程、函数和 algorithm，区分方程关系与顺序赋值。
  keywords: [Modelica function, algorithm, array, units]
---

# Modelica 类型、单位、数组、函数与 algorithm

类型和单位是模型接口的一部分。优先使用 `Modelica.Units.SI` 类型，并设置合理的 `min`、`max`、`nominal`、`start` 和显示单位，可在仿真前发现量纲与尺度问题。

## 1. 类型与属性

`type` 可基于基础类型定义专用物理量；`enumeration` 适合有限模式；`record` 适合参数或结果数据结构。`start` 通常是初值猜测，只有与相应固定属性或初始方程配合时才是强约束。

## 2. 数组

数组方程可紧凑表达分布参数或多组件系统。维度应尽量由参数静态确定，并用 `size()`、切片和向量化操作减少索引错误。循环生成的是一组方程，不代表时间顺序。

## 3. function

函数适合确定的输入—输出计算、插值和可复用关联式。函数内部可以用 `algorithm`，但应避免隐藏全局状态或不透明副作用。分段函数若在连续方程中使用，要明确是否产生事件以及导数是否连续。

## 4. algorithm 语义

`algorithm` 中的 `:=` 是按顺序执行的赋值，与 `equation` 中的 `=` 不同。算法段整体参与方程系统；对同一输出的多次赋值仍形成一个最终定义，不应按等号数量判断平衡。

## 5. 数值尺度

当变量量级相差悬殊时设置 `nominal`，同时检查单位换算。不要通过无量纲化常数或随意乘系数来掩盖求解器缩放问题。

## 6. 参考资料

1. Modelica Language Specification, Classes, Arrays, Functions and Equations。

