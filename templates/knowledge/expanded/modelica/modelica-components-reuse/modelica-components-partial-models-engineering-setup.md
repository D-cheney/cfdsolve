---
template_version: "flowlab-knowledge/1.0"
slug: modelica-components-partial-models-engineering-setup
title: "partial 基类：工程设置与参数选择"
summary: "partial 类不可实例化，只提供端口、参数与方程的公共骨架。给出未知数减方程的平衡判据、基类与派生类的方程计数关系、哪些方程该放基类的归属表、基类参数默认值的选取依据，以及派生类漏写方程的五类现象。"
category:
  slug: modelica-components-reuse
  name: "Modelica 组件与复用"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 组件与复用"
  - "partial 基类"
  - "工程设置与参数选择"
  - "方程计数"
  - "PartialTwoPort"
seo:
  title: "partial 基类：工程设置与参数选择"
  description: "partial 类不可实例化，只提供端口、参数与方程的公共骨架。给出未知数减方程的平衡判据、基类与派生类的方程计数关系、哪些方程该放基类的归属表、基类参数默认值的选取依据，以及派生类漏写方程的五类现象。"
  keywords:
    - "partial 基类"
    - "工程设置与参数选择"
    - "方程计数"
    - "PartialTwoPort"
    - "模型平衡性"
---

# partial 基类：工程设置与参数选择

`partial` 类不可实例化，只用于提供端口、参数和方程的公共骨架。工程上要决定的是哪些方程放进基类、哪些留给派生类，以及基类参数默认值取多少。判断依据是方程计数：一个基类在补上派生类的方程后必须恰好平衡，否则要到实例化阶段才会暴露欠定或过定。

## partial 只禁止实例化，不改变语义

`partial` 关键字的作用域检查很简单：直接或间接包含 `partial` 前缀的类不能出现在组件声明里。除此之外，基类与普通类完全一样——可以声明端口、可以写方程、可以带 `replaceable` 元素、可以继承别的类。因此不要把 `partial` 当成接口描述，它是未完成的实现，通常缺的是守恒方程。

## 平衡性：未知数减方程等于零

一个可实例化的模型必须满足

$$ n_{unknown} - n_{eq} = 0 $$

基类设计时先把端口变量与内部变量数出来，再数方程。以一个双端口基类为例：两个端口各 3 个变量（`p`、`m_flow`、`h_outflow`），内部变量 `m_flow` 1 个，则 $n_{unknown} = 2\times3 + 1 = 7$。基类里写 4 条方程，派生类必须再补 3 条，模型才平衡。

$$ n_{eq}(D) = n_{eq}(B) + n_{eq}(D_{own}) $$

这条关系是拆分基类时的唯一硬约束。把 $n_{eq}(D_{own})$ 记在派生类文档里，就能在不读全部代码的情况下判断派生类是否写全。

## 基类该放什么

放进基类的方程应满足两个条件：对全部派生类都成立、不引用派生类专有变量。典型归属如下。

| 内容 | 放基类 | 放派生类 |
|---|---|---|
| 端口声明 | 是 | 否 |
| 端口流量和为零 | 是 | 否 |
| 端口焓流传递 | 是 | 否 |
| 介质与几何参数 | 是 | 否 |
| 本构关系（摩擦、换热） | 否 | 是 |
| 质量与能量积累项 | 否 | 是 |
| 控制信号与输出 | 否 | 是 |

```modelica
partial model PartialTwoPort
  replaceable package Medium = Modelica.Media.Water.StandardWater
    constrainedby Modelica.Media.Interfaces.PartialMedium;
  Modelica.Fluid.Interfaces.FluidPort_a port_a(redeclare package Medium = Medium);
  Modelica.Fluid.Interfaces.FluidPort_b port_b(redeclare package Medium = Medium);
  Modelica.Units.SI.MassFlowRate m_flow(nominal = 1.0);
equation
  port_a.m_flow + port_b.m_flow = 0;
  m_flow = port_a.m_flow;
  port_a.h_outflow = inStream(port_b.h_outflow);
  port_b.h_outflow = inStream(port_a.h_outflow);
end PartialTwoPort;
```

这个基类给出 4 条方程，端口加内部共 7 个未知数，因此它自身永远不平衡，只能由派生类补足。这正是 `partial` 的用途。

## 基类参数的默认值怎么定

默认值要让派生类在不写任何修饰符时也能得到物理上合理的结果。管长取 1.5 m、内径取 0.025 m、参考温度取 293.15 K、参考压力取 101325 Pa，都是 DN25 管路的常规量级；若默认内径写成 1.0 m，派生类忘记赋值时会得到一个流通面积偏大 $1.6\times10^{3}$ 倍的模型，而报错信息不会提示任何异常。

对必须由派生类给定的参数，不要给默认值，直接声明 `parameter` 不给初值，让工具在实例化时报 parameter has no value。这比给一个随便的默认值更安全。

## 派生类漏写方程的现象

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 too few equations | 派生类未补足方程差值 | 数派生类方程条数，与基类文档记录的差值比对 |
| 报 too many equations | 基类与派生类重复写了同一条守恒式 | 注释掉派生类里的流量和为零式，看是否转为平衡 |
| 方程数正确但仍报不平衡 | 有方程是另一条的线性组合 | 检查是否两处都写了端口焓的 inStream 传递 |
| 端口压力自由漂移 | 基类里缺少参考压力方程 | 检查是否有一个端口连到压力边界 |
| 派生类能编译但结果全零 | 基类参数默认值给了 0 | 搜索基类 parameter 是否显式写了等于 0 |

## 拆分基类的回归做法

把一个大基类拆成两层（如 `PartialTwoPort` 与 `PartialTwoPortTransport`）时，必须保证每一层单独看都处于缺方程状态，合并后总数不变。具体做法是记录三组数：基类方程数、中间类方程数、终端类方程数，三者之和等于该终端模型的总方程数。对上面例子，4 + 0 + 3 = 7，与 $n_{unknown} = 7$ 一致。任何一次拆分只要让这个和不等于未知数个数，模型就会在实例化阶段失败。

## 参考

1. Modelica Association. *Modelica Language Specification, Version 3.6*. 2023. — partial 类与模型平衡性
2. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Fluid.Interfaces.PartialTwoPort`. 2020.
3. Fritzson P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015. — 抽象基类与继承
4. Cellier F.E., Kofman E. *Continuous System Simulation*. Springer, 2006. — 方程计数与结构奇异
5. Elmqvist H., Mattsson S.E., Otter M. Modelica — A Language for Physical System Modeling, Visualization and Interaction. *IEEE CACSD*, 1999. — 面向对象建模
6. Tiller M. *Introduction to Physical Modeling with Modelica*. Kluwer Academic Publishers, 2001. — 基类参数默认值
