---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-packages-redeclare
title: Modelica 包、继承、replaceable 与 redeclare
summary: 以 package 分层、partial 定义契约、replaceable/redeclare 提供可替换实现，说明 constrainedby 类型约束、修改器优先级与多态替换点如何构建可维护、可回归的领域模型库。
category: { slug: modelica-components-reuse, name: Modelica 组件与复用 }
level: 进阶
reading_minutes: 15
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, package, extends, replaceable, redeclare, constrainedby, 模型库, 多态]
seo:
  title: Modelica 包继承、replaceable 与 redeclare 复用
  description: 用 partial 接口、受约束 replaceable 与 redeclare 构建可扩展模型库，并解释修改器优先级与兼容性检查。
  keywords: [Modelica redeclare, replaceable, constrainedby, package, extends, 模型库复用]
---

# Modelica 包、继承、replaceable 与 redeclare

在物理系统库中，组件复用的维护成本大多来自接口漂移与替换点失控，而不是方程本身写错。本文给出一套以 `package` 分层、`partial` 定义契约、`replaceable`/`redeclare` 提供可替换实现，并用 `constrainedby` 把替换限制在安全集合内的工程方法。

## 1. 结论与适用场景

结论：可维护模型库 = 稳定接口 + 可运行默认实例 + 受约束替换点 + 显式依赖版本。继承（`extends`）用于共享方程与连接器；替换（`replaceable`/`redeclare`）用于在接口不变的前提下更换实现；二者职责不同，混用会让下游模型难以追踪。

适用场景：

- 同一物理对象（管道、换热器、泵）需在多种关联式或物性下复用；
- 介质、摩擦模型、控制器需按工况或精度切换；
- 多人并行开发，需要契约化接口避免互相破坏。

不适用：一次性脚本模型、参数化程度低的对象。为替换而替换只会带来过度抽象与调试负担。

## 2. 语言机制与数学基础

`extends` 在类型层面做声明合并：基类的变量、方程、连接器与图形注解并入子类，再叠加子类自身方程。合并后方程集必须保持结构平衡。设展开后连续未知量数为 $n$、独立方程数为 $m$，平衡条件为

$$ n = m $$

若 $n > m$ 为欠定（缺少约束），$n < m$ 为过定（约束冲突），二者都会在检查阶段报错。

`replaceable` 声明一个槽位，其默认实现是类型 $T_d$；`constrainedby T_c` 把槽位收窄到契约 $T_c$ 允许的替换集合。任一合法替换类型 $T_r$ 必须满足子类型关系

$$ T_r \leq T_c $$

`redeclare` 在实例化点把槽位绑定到具体实现。替换后模型的连接器与关键参数名必须与契约一致，否则方程无法闭合。

## 3. 关键语法与公式

修改器（modification）按由外向内、后写覆盖先写的规则生效。若默认值、内层修改、外层修改分别给出，最终取值为

$$ v_{final} = (M_{outer} \circ M_{inner})(v_{default}) $$

参数受 min/max 约束时，最终值还需落在允许区间内

$$ v_{min} \leq v_{final} \leq v_{max} $$

`constrainedby` 只约束类型成员（有哪些参数与连接器），不约束数值；因此仍需在类内部给出参数的默认值与合理范围。典型的受约束替换写法：

```modelica
replaceable model Friction = LinearFriction
  constrainedby FrictionBase;
```

```modelica
redeclare model Friction = Colebrook(roughness = 4.5e-5);
```

包级依赖用 `uses` 注解声明版本范围，例如 `uses(Modelica(version="4.0.0"))`，把编译期依赖写成可审查的合同。

## 4. 工程做法与参数

目录分层：`UsersGuide`、`Interfaces`（连接器与纯接口 partial）、`BaseClasses`（partial 基类与关联式骨架）、`Media`、`Components`、`Examples`、`Tests`。公共组件必须配最小可运行示例，`Tests` 用于回归。

接口稳定：对外类的参数名、连接器类型与默认值一旦发布即视为公共契约；内部名称不暴露给用户层级，避免上游依赖深层路径。

partial 使用：`partial model` 表达不完整接口，不可直接实例化。partial 中只放契约所需的参数、连接器与方程，不放入特定关联式实现。

替换点粒度：优先替换“模型”（含方程）或“包”（含介质/关联式集合），而非替换单个函数；函数级替换会渗透到所有调用点，破坏封装。

版本与回归：升级标准库或第三方库前，先跑全部 `Examples` 与 `Tests`；重点关注参数默认值、连接器数量与物性接口的变化，不要依赖工具自动转换的结果。

## 5. 可复现示例

下面示例展示一个可替换介质与可替换摩擦模型的抽象泵源：默认实现可直接仿真，替换点通过 `constrainedby` 收窄。

```modelica
package ReuseDemo
  partial model FrictionBase
    input Modelica.Units.SI.VolumeFlowRate V_flow;
    output Modelica.Units.SI.PressureDifference dp;
  end FrictionBase;

  model LinearFriction
    extends FrictionBase;
    parameter Modelica.Units.SI.PressureDifference dp_nominal = 1.0e5;
    parameter Modelica.Units.SI.VolumeFlowRate V_flow_nominal = 0.001;
  equation
    dp = dp_nominal * V_flow / V_flow_nominal;
  end LinearFriction;

  partial model PartialSource
    replaceable package Medium = Modelica.Media.Water.StandardWater
      constrainedby Modelica.Media.Interfaces.PartialMedium;
    replaceable model Friction = LinearFriction
      constrainedby FrictionBase;
    Friction friction;
    Modelica.Fluid.Interfaces.FluidPort_a port(redeclare package Medium = Medium);
    parameter Modelica.Units.SI.MassFlowRate m_flow_nominal = 1.0;
  equation
    friction.V_flow = port.m_flow / 1000.0;
    port.p = friction.dp;
  end PartialSource;

  model PumpSource
    extends PartialSource;
  end PumpSource;

  model PumpSourceAir
    extends PartialSource(
      redeclare package Medium = Modelica.Media.Air.MoistAir);
  end PumpSourceAir;
end ReuseDemo;
```

验证：`PumpSource` 与 `PumpSourceAir` 都应通过检查并可短时积分；替换只改了介质，连接器 `port` 与参数 `m_flow_nominal` 保持同一契约。

## 6. 常见坑与排查

- 替换后过定/欠定：替换对象连接器数量或方程数与契约不一致。检查展开后的方程数 $m$ 与未知量数 $n$。
- 深层修改难追踪：关键参数藏在多层嵌套修改里。改为顶层显式暴露。
- 循环包依赖：两个包互相 `uses`。把公共接口拆到独立的 `Interfaces` 包。
- 默认实例不可运行：默认实现缺方程或参数非法。默认实例必须结构平衡且能初始化。
- 工具专有注解污染核心方程：把厂商注解隔离到独立层，保持物理方程可移植。
- 过期 `uses` 版本：声明范围与实际使用不符，升级后出现静默行为变化。

## 7. 检查清单与参考

- 默认实例是否结构平衡、可初始化、可短时仿真；
- 替换对象是否满足同一连接器与关键参数契约；
- 关键参数是否在顶层显式暴露；
- 是否存在循环包依赖；
- `uses` 版本范围是否与实测一致；
- `Examples`/`Tests` 是否覆盖主要 redeclare 组合；
- 工具专有注解是否与核心物理方程隔离。

参考：

1. Modelica Association, *Modelica Language Specification* — Inheritance, Modifications and Redeclarations.
2. Modelica Standard Library 的 `Interfaces`/`Media` 包组织方式。
3. Tiller, *Introduction to Physical Modeling with Modelica*.
