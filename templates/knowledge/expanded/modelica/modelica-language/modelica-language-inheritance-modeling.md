---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-inheritance-modeling
title: "extends 继承与修改：语言语义与适用边界"
summary: "讲清 extends 带入方程与接口的方式、修改符优先级链、partial 与 replaceable 的职责分工，以及多重继承的冲突消解，并用一阶环节的阶跃响应完成 1.2642 与 1.7293 的手算核对。"
category:
  slug: modelica-language
  name: "Modelica 语言基础"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MODELICA"
  - "Modelica 语言基础"
  - "extends 继承与修改"
  - "语言语义与适用边界"
  - "修改符优先级"
  - "replaceable"
seo:
  title: "extends 继承与修改：语言语义与适用边界"
  description: "讲清 extends 带入方程与接口的方式、修改符优先级链、partial 与 replaceable 的职责分工，以及多重继承的冲突消解，并用一阶环节的阶跃响应完成 1.2642 与 1.7293 的手算核对。"
  keywords:
    - "extends 继承与修改"
    - "语言语义与适用边界"
    - "修改符优先级"
    - "replaceable"
    - "多重继承"
---

# extends 继承与修改：语言语义与适用边界

`extends` 不是代码复制的语法糖，它把基类的变量、方程、接口与图标一并并入派生类，并允许用修改符在派生类或实例处覆盖基类默认值。理解它的关键有两条：方程是累加的，修改符是有优先级的。本文给出优先级链、`partial` 与 `replaceable` 的分工、多重继承的消解规则，并用一阶环节的阶跃响应做一次可手算核对。

## extends 把方程与接口一并带入

`extends` 的效果等价于把基类内容原样展开到派生类中，包括 `equation` 段里的每一条方程。因此派生类的方程数满足

$$n_{eq}(derived) = n_{eq}(base) + n_{eq}(new)$$

变量数同理累加。这条加法性质意味着继承不会破坏结构平衡：只要基类和新增部分各自配平，派生类也配平。反过来，若基类本身欠定，派生类无论加多少方程都无法修正，因为缺失的是一条具体关系而不是计数。

接口也会被继承。`extends Modelica.Blocks.Interfaces.SISO` 直接把 `RealInput u` 与 `RealOutput y` 带入派生块，并继承其图标与放置注解。需要替换外观时，在派生类里再写一个 `annotation(Icon(...))` 即可覆盖。

## 修改符的优先级链

修改符按"越靠近实例越优先"的规则生效。设基类默认值为 $v_{default}$、派生类 `extends` 子句给出 $m_{extends}$、实例化时给出 $m_{inst}$，则生效值为

$$v_{eff} = \begin{cases} m_{inst}, & \text{实例处给出修改符} \\ m_{extends}, & \text{否则用派生类修改符} \\ v_{default}, & \text{否则用基类默认值} \end{cases}$$

这条规则解释了为什么同一个库组件在不同模型里表现不同：修改符写在实例处，只影响那一个实例，不影响库定义。`final` 是在链上切断传递：基类里写成 `final parameter Real k = 1.0` 后，派生类和实例处的修改符都会被拒绝，报 `Trying to modify final element`。

数组元素的修改符用 `each` 批量施加：`cap[N](each C = 100.0)` 等价于给每个元素都写一遍 `C = 100.0`。漏掉 `each` 时工具会尝试把标量分配给数组元素，报维度错误。

## partial 与 replaceable 的职责区分

`partial` 与 `replaceable` 解决两个不同问题，混用会让库结构变脆。

`partial model` 表示"不可独立实例化"，它通常缺少端口或缺少一条构成关系，供派生类补齐。对 `partial` 类直接实例化会报 `Class ... is partial`。

`replaceable` 表示"类型可在派生或实例处替换"，并可用 `constrainedby` 限定可替换范围：

```modelica
partial model BaseController
  replaceable Modelica.Blocks.Interfaces.SISO ctrl
    constrainedby Modelica.Blocks.Interfaces.SISO
    annotation(choicesAllMatching = true);
  Modelica.Blocks.Interfaces.RealInput u;
  Modelica.Blocks.Interfaces.RealOutput y;
equation
  connect(u, ctrl.u);
  connect(ctrl.y, y);
end BaseController;
```

`constrainedby` 施加的是子类型约束：被替换的类型必须与该接口兼容，否则报 `Redeclaration does not satisfy the constrainedby clause`。`choicesAllMatching = true` 让图形工具只列出匹配的候选类，避免把信号块换成物理端口。

## 多重继承与 break

一个类可以 `extends` 多个基类。若两个基类定义了同名元素且类型不同，直接继承会报冲突。用 `break` 显式断开其中一个继承来的元素，再在派生类里重新声明：

```modelica
model TwoPortDevice
  extends Modelica.Electrical.Analog.Interfaces.OnePort;
  extends Modelica.Thermal.HeatTransfer.Interfaces.PartialElementaryOnePort;
equation
  // 两个基类的 v 与 T 互不相干，各自保留
end TwoPortDevice;
```

若两个基类都带同名 `v`，必须写 `extends A(break v)` 声明放弃其中一个，否则翻译器报 `Duplicate elements`。`break` 只断开指定名字，其余元素照常继承。多重继承的顺序会影响查找优先级：先出现的基类在名字冲突时优先，但显式 `break` 永远优先于顺序规则。

## 一阶环节的继承与阶跃响应手算

下面把静态增益与时间常数放进 `partial` 基类，派生类只负责改参数并接上信号源：

```modelica
partial model PartialFirstOrder
  parameter Real k = 1.0 "静态增益";
  parameter Modelica.Units.SI.Time T = 1.0 "时间常数";
  Modelica.Blocks.Interfaces.RealInput u;
  Modelica.Blocks.Interfaces.RealOutput y(start = 0.0);
equation
  T * der(y) + y = k * u;
end PartialFirstOrder;

model FirstOrderStep
  extends PartialFirstOrder(k = 2.0, T = 0.5);
  Modelica.Blocks.Sources.Step step(height = 1.0, startTime = 0.0);
equation
  connect(step.y, u);
end FirstOrderStep;
```

`extends PartialFirstOrder(k = 2.0, T = 0.5)` 把基类默认的 $k = 1.0$、$T = 1.0$ 覆盖为 $k = 2.0$、$T = 0.5\ \mathrm{s}$。输入为幅值 $1.0$ 的阶跃时，稳态输出 $y_\infty = k \cdot u = 2.0 \times 1.0 = 2.0$。一阶环节的解析解为

$$y(t) = y_\infty \left(1 - e^{-t/T}\right)$$

在 $t = T = 0.5\ \mathrm{s}$ 处，$y = 2.0 \times (1 - e^{-1}) = 2.0 \times 0.63212 = 1.2642$；在 $t = 2T = 1.0\ \mathrm{s}$ 处，$y = 2.0 \times (1 - e^{-2}) = 2.0 \times 0.86466 = 1.7293$。若仿真在这两个时刻偏离超过 $10^{-3}$，说明修改符没有生效或基类方程被重复继承了一次。

## 继承失效的典型信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 实例参数改了但输出不变 | 基类中该参数被 `final` 锁定 | 查看基类声明，去掉 `final` 或改用派生类覆盖 |
| 报 `Class ... is partial` | 直接实例化了 `partial` 类 | 检查是否缺少端口或构成方程，补全后再实例化 |
| 报 `Trying to modify final element` | 修改符链上遇到 `final` | 沿 `extends` 链逐层查找 `final` 出现位置 |
| 报 `Duplicate elements` | 多重继承中两个基类定义了同名元素 | 用 `extends A(break v)` 断开其一，再重新声明 |
| 数组组件只有第一个元素参数生效 | 修改符漏写 `each` | 把 `(C = 100.0)` 改为 `(each C = 100.0)` 重跑 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 7 章 Inheritance 规定 `extends`、修改符优先级与 `break` 的语义。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 7.3 节 Redeclaration 给出 `replaceable`、`constrainedby` 与 `choicesAllMatching` 的规则。
3. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 4 章讨论继承、修改符与名字查找。
4. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 9 章用可替换组件搭建控制系统。
5. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Blocks.Interfaces.SISO` 与 `Modelica.Blocks.Sources.Step`, 2020.
6. Åkesson, J., Ekman, T., Hedin, G. "Implementation of a Modelica Compiler using JastAdd." *LDTA*, 2007.
