---
template_version: flowlab-knowledge/1.0
slug: modelica-language-inheritance-modeling
title: extends 继承与修改：原理与诊断验证
summary: >-
  讲清 extends 带入方程与接口的方式、修改符优先级链、partial 与 replaceable
  的职责分工，以及多重继承的冲突消解，并用一阶环节的阶跃响应完成 1.2642 与 1.7293 的手算核对。
category:
  slug: modelica-language
  name: Modelica 语言基础
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - MODELICA
  - Modelica 语言基础
  - extends 继承与修改
  - 语言语义与适用边界
  - 修改符优先级
  - replaceable
  - 结果诊断与可信度验证
  - 菱形继承
  - 展平溯源
seo:
  title: extends 继承与修改：原理与诊断验证
  description: >-
    讲清 extends 带入方程与接口的方式、修改符优先级链、partial 与 replaceable
    的职责分工，以及多重继承的冲突消解，并用一阶环节的阶跃响应完成 1.2642 与 1.7293 的手算核对。
  keywords:
    - extends 继承与修改
    - 语言语义与适用边界
    - 修改符优先级
    - replaceable
    - 多重继承
    - 结果诊断与可信度验证
    - 菱形继承
    - 展平溯源
    - redeclare
---
# extends 继承与修改：原理与诊断验证

`extends` 不是代码复制的语法糖，它把基类的变量、方程、接口与图标一并并入派生类，并允许用修改符在派生类或实例处覆盖基类默认值。理解它的关键有两条：方程是累加的，修改符是有优先级的。继承类故障的典型症状是"参数明明改了，结果却没变"，而源码里找不到任何矛盾。原因通常是修改符被更靠外的赋值覆盖，或 `final` 在链上切断了传递。可信度验证的做法是把展平后的模型当作唯一事实来源，用生效值反推是哪一层修改符胜出。

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

## 菱形继承的合并判定条件

当一个类通过多条路径继承同一个基类时，Modelica 会把相同元素合并成一份，而不是重复展开。合并合法的条件是两条路径上的声明与修改符完全一致：

$$\text{merge}(e_1, e_2) \text{ 合法} \iff \text{decl}(e_1) \equiv \text{decl}(e_2) \;\wedge\; \text{mod}(e_1) = \text{mod}(e_2)$$

只要两处修改符给出不同数值，合并就失败，报 `Duplicate modification of element`。这条规则的好处是避免了"方程被继承两次导致过定"，代价是两条路径不能各自定制同一个参数。

下面这个三层链可以验证合并与覆盖：基类默认 $k = 1.0$，中间层改成 $3.0$，派生层改成 $5.0$。

```modelica
partial model BaseGain
  parameter Real k = 1.0;
  Modelica.Blocks.Interfaces.RealInput u;
  Modelica.Blocks.Interfaces.RealOutput y;
equation
  y = k * u;
end BaseGain;

model MidGain
  extends BaseGain(k = 3.0);
end MidGain;

model LeafGain
  extends MidGain(k = 5.0);
end LeafGain;

model GainChain
  LeafGain leaf(k = 7.0);
  Modelica.Blocks.Sources.Constant src(k = 2.0);
equation
  connect(src.y, leaf.u);
end GainChain;
```

展平后 `leaf.k` 只有一条声明，值为 $7.0$：实例处修改符压过 `extends` 处的 $5.0$，后者压过基类默认 $1.0$。输入为 $2.0$ 时输出 $y = 7.0 \times 2.0 = 14.0$。若展平值是 $5.0$，说明实例修改符写成了 `LeafGain(k = 7.0)` 而实际实例是 `leaf`，作用域错了；若展平值是 $1.0$，说明中间层与基类都加了 `final`。

方程计数也要在展平结果里核对。`BaseGain` 贡献 1 条方程，`MidGain` 与 `LeafGain` 各不新增，`GainChain` 的连接贡献 1 条。展平后总方程数应为 $1 + 1 = 2$，而不是 $3$——基类只展开一次，这正是合并规则的作用。若展平结果里出现两条 `y = k * u`，说明继承路径上有两个互不相同的基类定义，需要检查是否误把同名类放在了不同包中。

## 图标与放置注解的覆盖行为

`Icon` 是一个记录，派生类给出的 `annotation(Icon(...))` 只覆盖它显式列出的字段，但 `graphics` 是数组，一旦给出就整体替换而不是追加：

$$\text{Icon}.graphics_{derived} = \begin{cases} G_{new}, & \text{派生类给出 graphics} \\ G_{base}, & \text{否则沿用基类} \end{cases}$$

因此想"在基类图标上再画一条线"不能直接写一个新的 `graphics` 数组，那样会丢掉基类的全部图元。可行做法是在派生类里复制基类图元并追加，或把基类图元提取到独立 `partial` 类中复用。诊断方法是打开图形编辑器查看图元数量：若派生实例只剩一个矩形，说明基类图元被整体替换了。

`Placement` 注解的行为不同，它描述组件在父模型画布中的位置，属于实例级信息，不参与继承合并。把 `annotation(Placement(...))` 写在 `extends` 上可以给继承来的组件预设位置。

## 故障模式与判定试验

`redeclare` 失败只有两类原因，区分开就能快速定位。

第一类是类型不满足约束。替换类型必须是 `constrainedby` 指定类型的子类型：

$$\text{type}(T_{new}) \preceq T_{constrainedby}$$

若 `constrainedby Modelica.Blocks.Interfaces.SISO` 而替换成 `Modelica.Blocks.Interfaces.MISO`，报 `Redeclaration does not satisfy the constrainedby clause`，因为后者有两个输入。第二类是名字查找失败：替换类型必须能被派生类所在作用域解析，跨包替换要写全限定名。若只写短名而该名在派生类作用域中不可见，报 `Class not found`。

还有一类容易被误判为替换失败的情形：替换成功但 `connect` 语句失配。原类型与新类型的端口名不同时，`connect` 会报 `No corresponding component`，这属于接口不兼容，不是替换机制的问题。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 实例参数改了但输出不变 | 基类中该参数被 `final` 锁定 | 查看基类声明，去掉 `final` 或改用派生类覆盖 |
| 报 `Class ... is partial` | 直接实例化了 `partial` 类 | 检查是否缺少端口或构成方程，补全后再实例化 |
| 报 `Trying to modify final element` | 修改符链上遇到 `final` | 沿 `extends` 链逐层查找 `final` 出现位置 |
| 报 `Duplicate elements` | 多重继承中两个基类定义了同名元素 | 用 `extends A(break v)` 断开其一，再重新声明 |
| 数组组件只有第一个元素参数生效 | 修改符漏写 `each` | 把 `(C = 100.0)` 改为 `(each C = 100.0)` 重跑 |
| 展平值等于基类默认值 | 链上有 `final` 或修改符作用域写错 | 在展平结果中搜索参数名，确认唯一声明的位置 |
| 报 `Duplicate modification of element` | 菱形继承的两条路径给出不同修改符 | 把两处修改符统一，或在一条路径上用 `break` 断开 |
| 展平结果里同一条方程出现两次 | 同名基类位于不同包，被当成两个类 | 用全限定名核对两条 `extends` 指向的类是否同一个 |
| 报 `Redeclaration does not satisfy the constrainedby clause` | 替换类型的端口数与约束不符 | 检查替换类型的输入输出个数是否与约束一致 |
| 派生实例只剩一个矩形图标 | 新 `annotation(Icon(graphics = ...))` 整体替换了基类图元 | 统计图元数量，把基类图元显式复制后再追加 |

## 用展平结果定位生效值

修改符的生效值只在展平后确定。诊断第一步是把展平模型导出，而不是继续读源码。OpenModelica 用 `--dump` 或 `-d=flatten` 输出展平后的类，Dymola 用 `translateModel` 后检查 `dsmodel.mof`。在展平结果中搜索目标参数名，能看到唯一一条带最终值的声明，以及它来自哪一层。

把这条值与源码中的修改符逐层对照，就能判断优先级链在哪一层被截断。若展平值等于基类默认值，说明所有修改符都失效了，第一嫌疑是 `final`；若展平值等于中间层而非实例层，说明实例处的修改符写在了错误的元素上（例如写成了 `leaf.mid.k`）。

## 参考资料

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 7 章 Inheritance 规定 `extends`、修改符优先级与 `break` 的语义。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 7.3 节 Redeclaration 给出 `replaceable`、`constrainedby` 与 `choicesAllMatching` 的规则。
3. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 4 章讨论继承、修改符与名字查找。
4. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 9 章用可替换组件搭建控制系统。
5. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Blocks.Interfaces.SISO` 与 `Modelica.Blocks.Sources.Step`, 2020.
6. Åkesson, J., Ekman, T., Hedin, G. "Implementation of a Modelica Compiler using JastAdd." *LDTA*, 2007.
7. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 7.1 节 Inheritance 规定多路径继承的元素合并规则。
8. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 7.3 节 Redeclaration 给出 `constrainedby` 的子类型约束语义。
9. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 18 章 Annotations 说明 `Icon`、`Diagram` 与 `Placement` 的记录结构与合并行为。
10. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 4 章讨论修改符解析与名字查找顺序。
11. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 9 章用可替换组件演示 `redeclare` 的典型用法。
12. OpenModelica User's Guide, v1.22, 2023 — 第 5 章说明 `--dump` 与 `-d=flatten` 的展平输出格式。
