---
template_version: "flowlab-knowledge/1.0"
slug: modelica-language-inheritance-diagnosis-validation
title: "extends 继承与修改：结果诊断与可信度验证"
summary: "给出用展平结果追溯生效修改符的方法、菱形继承的合并判定条件、redeclare 替换失败的两类原因，以及图标注解的覆盖陷阱，并完成 7.0 增益链的手算核对。"
category:
  slug: modelica-language
  name: "Modelica 语言基础"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MODELICA"
  - "Modelica 语言基础"
  - "extends 继承与修改"
  - "结果诊断与可信度验证"
  - "菱形继承"
  - "展平溯源"
seo:
  title: "extends 继承与修改：结果诊断与可信度验证"
  description: "给出用展平结果追溯生效修改符的方法、菱形继承的合并判定条件、redeclare 替换失败的两类原因，以及图标注解的覆盖陷阱，并完成 7.0 增益链的手算核对。"
  keywords:
    - "extends 继承与修改"
    - "结果诊断与可信度验证"
    - "菱形继承"
    - "展平溯源"
    - "redeclare"
---

# extends 继承与修改：结果诊断与可信度验证

继承类故障的典型症状是"参数明明改了，结果却没变"，而源码里找不到任何矛盾。原因通常是修改符被更靠外的赋值覆盖，或 `final` 在链上切断了传递。可信度验证的做法是把展平后的模型当作唯一事实来源，用生效值反推是哪一层修改符胜出。本文给出溯源流程、菱形继承的合并判定、替换失败的分类，并完成一次增益链手算。

## 用展平结果定位生效值

修改符的生效值只在展平后确定。诊断第一步是把展平模型导出，而不是继续读源码。OpenModelica 用 `--dump` 或 `-d=flatten` 输出展平后的类，Dymola 用 `translateModel` 后检查 `dsmodel.mof`。在展平结果中搜索目标参数名，能看到唯一一条带最终值的声明，以及它来自哪一层。

把这条值与源码中的修改符逐层对照，就能判断优先级链在哪一层被截断。若展平值等于基类默认值，说明所有修改符都失效了，第一嫌疑是 `final`；若展平值等于中间层而非实例层，说明实例处的修改符写在了错误的元素上（例如写成了 `leaf.mid.k`）。

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

## 替换失败的两类原因

`redeclare` 失败只有两类原因，区分开就能快速定位。

第一类是类型不满足约束。替换类型必须是 `constrainedby` 指定类型的子类型：

$$\text{type}(T_{new}) \preceq T_{constrainedby}$$

若 `constrainedby Modelica.Blocks.Interfaces.SISO` 而替换成 `Modelica.Blocks.Interfaces.MISO`，报 `Redeclaration does not satisfy the constrainedby clause`，因为后者有两个输入。第二类是名字查找失败：替换类型必须能被派生类所在作用域解析，跨包替换要写全限定名。若只写短名而该名在派生类作用域中不可见，报 `Class not found`。

还有一类容易被误判为替换失败的情形：替换成功但 `connect` 语句失配。原类型与新类型的端口名不同时，`connect` 会报 `No corresponding component`，这属于接口不兼容，不是替换机制的问题。

## 图标与放置注解的覆盖行为

`Icon` 是一个记录，派生类给出的 `annotation(Icon(...))` 只覆盖它显式列出的字段，但 `graphics` 是数组，一旦给出就整体替换而不是追加：

$$\text{Icon}.graphics_{derived} = \begin{cases} G_{new}, & \text{派生类给出 graphics} \\ G_{base}, & \text{否则沿用基类} \end{cases}$$

因此想"在基类图标上再画一条线"不能直接写一个新的 `graphics` 数组，那样会丢掉基类的全部图元。可行做法是在派生类里复制基类图元并追加，或把基类图元提取到独立 `partial` 类中复用。诊断方法是打开图形编辑器查看图元数量：若派生实例只剩一个矩形，说明基类图元被整体替换了。

`Placement` 注解的行为不同，它描述组件在父模型画布中的位置，属于实例级信息，不参与继承合并。把 `annotation(Placement(...))` 写在 `extends` 上可以给继承来的组件预设位置。

## 失效信号与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 展平值等于基类默认值 | 链上有 `final` 或修改符作用域写错 | 在展平结果中搜索参数名，确认唯一声明的位置 |
| 报 `Duplicate modification of element` | 菱形继承的两条路径给出不同修改符 | 把两处修改符统一，或在一条路径上用 `break` 断开 |
| 展平结果里同一条方程出现两次 | 同名基类位于不同包，被当成两个类 | 用全限定名核对两条 `extends` 指向的类是否同一个 |
| 报 `Redeclaration does not satisfy the constrainedby clause` | 替换类型的端口数与约束不符 | 检查替换类型的输入输出个数是否与约束一致 |
| 派生实例只剩一个矩形图标 | 新 `annotation(Icon(graphics = ...))` 整体替换了基类图元 | 统计图元数量，把基类图元显式复制后再追加 |

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 7.1 节 Inheritance 规定多路径继承的元素合并规则。
2. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 7.3 节 Redeclaration 给出 `constrainedby` 的子类型约束语义。
3. Modelica Association. *Modelica Language Specification, Version 3.6*, 2023 — 第 18 章 Annotations 说明 `Icon`、`Diagram` 与 `Placement` 的记录结构与合并行为。
4. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015 — 第 4 章讨论修改符解析与名字查找顺序。
5. Tiller, M. *Modelica by Example*, 在线版 2014 — 第 9 章用可替换组件演示 `redeclare` 的典型用法。
6. OpenModelica User's Guide, v1.22, 2023 — 第 5 章说明 `--dump` 与 `-d=flatten` 的展平输出格式。
