---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-equations-balance
title: Modelica 声明式方程、变量与模型平衡
summary: 从 parameter、变量、der、equation 和 algorithm 的语义出发，解释局部与全局平衡、DAE 结构以及如何按守恒关系构建可组合组件。
category: { slug: modelica-language, name: Modelica 语言基础 }
level: 入门
reading_minutes: 14
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, 声明式建模, 方程, 模型平衡, DAE]
seo:
  title: Modelica 方程语义与模型平衡
  description: 理解声明式方程、状态导数、参数和局部平衡，构造可组合 Modelica 模型。
  keywords: [Modelica equation, balanced model, DAE]
---

# Modelica 声明式方程、变量与模型平衡

Modelica 的 `equation` 表达变量关系，不指定从左向右的计算顺序。编译器展开层次模型、生成连接方程并进行符号处理后，再选择状态和数值求解顺序。

## 1. 变量角色

`parameter` 在单次仿真中固定，`constant` 是更强的全局常量语义；普通 `Real` 可能成为代数量或状态，`der(x)` 表示时间导数。是否成为状态由模型结构和工具的状态选择共同决定。

```modelica
model ThermalCapacitance
  parameter Modelica.Units.SI.HeatCapacity C = 1000;
  Modelica.Units.SI.Temperature T(start=293.15);
  Modelica.Units.SI.HeatFlowRate Q_flow;
equation
  C*der(T) = Q_flow;
end ThermalCapacitance;
```

## 2. 模型平衡

可独立使用的非 `partial` 组件应在其接口约束计入后保持未知量与方程数匹配。欠定会缺少约束，过定会产生冲突。不能只数源码中的等号，因为连接器、数组方程、条件组件和函数会改变展开后的系统。

## 3. 建模顺序

1. 定义组件边界和存储量；
2. 定义端口与参数；
3. 写守恒方程；
4. 写构成关系；
5. 加入初始化约束；
6. 用极限工况和解析解验证；
7. 再与其他组件连接。

## 4. 常见错误

- 把方程当赋值，依赖文本顺序；
- 同时给状态固定初值和互相冲突的初始方程；
- 在组件内部重复写连接网络已生成的守恒式；
- 用大量输入输出信号替代物理端口，破坏可组合性。

## 5. 参考资料

1. Modelica Association, *Modelica Language Specification*。
2. Modelica Standard Library 源码与 UsersGuide。

