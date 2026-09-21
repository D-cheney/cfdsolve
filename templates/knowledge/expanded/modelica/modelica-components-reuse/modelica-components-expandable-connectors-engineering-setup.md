---
template_version: "flowlab-knowledge/1.0"
slug: modelica-components-expandable-connectors-engineering-setup
title: "可扩展连接器：工程设置与参数选择"
summary: "可扩展连接器的变量集合推迟到装配期确定，连接方程只在信号出现两次以上时生成。给出方程生成规则、驱动总线的信号清单与 nominal 取值、命名与前缀注解用法，以及信号只连一处导致变量未赋值的定位方法。"
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
  - "可扩展连接器"
  - "工程设置与参数选择"
  - "expandable connector"
  - "总线"
seo:
  title: "可扩展连接器：工程设置与参数选择"
  description: "可扩展连接器的变量集合推迟到装配期确定，连接方程只在信号出现两次以上时生成。给出方程生成规则、驱动总线的信号清单与 nominal 取值、命名与前缀注解用法，以及信号只连一处导致变量未赋值的定位方法。"
  keywords:
    - "可扩展连接器"
    - "工程设置与参数选择"
    - "expandable connector"
    - "信号总线"
    - "defaultComponentName"
---

# 可扩展连接器：工程设置与参数选择

可扩展连接器把信号总线的变量集合推迟到装配期才确定，代价是连接方程不再自动生成。设置要点有三条：总线里到底放哪些信号、每个信号必须被几处引用、以及命名与单位注解怎么统一。搞不清只被引用一次的信号不会产生方程这条规则，模型会在初始化阶段报变量未赋值。

## 与普通连接器相反的一条规则

普通连接器只要被 `connect` 就生成方程；可扩展连接器恰好相反。设某个信号 $v$ 参与的 `connect` 语句数为 $k_v$，则

$$ n_{eq}(v) = \begin{cases} (k_v - 1)\, n_{pot} + n_{flow}, & k_v \ge 2 \\ 0, & k_v = 1 \end{cases} $$

也就是说，只在一处被连接的总线信号等同于一个未连接的普通变量。若组件内部用到了它，工具会报变量未赋值。这是总线设计中最高频的故障，根源是把总线当成了自动全局变量池。

整条总线贡献的方程数按信号逐个累加，只统计出现两次以上的信号：

$$ n_{eq}^{bus} = \sum_{v:\,k_v \ge 2} \bigl[(k_v - 1)\, n_{pot}(v) + n_{flow}(v)\bigr] $$

信号全为势变量时简化为 $\sum (k_v - 1)$。用下一节的驱动总线代入：$2+1+3+1+4+1+3+1 = 16$ 条方程，其中 `u[3]` 的三个元素各贡献 1 条。这个 16 可以直接与工具输出的方程计数核对，差 1 就说明有信号被漏连。

## 总线信号清单与规模

总线上每个信号都应带单位与 `nominal`，便于缩放和文档化。以一个驱动总线为例。

| 信号 | 类型与单位 | nominal | 出现次数 |
|---|---|---|---|
| w_ref | SI.AngularVelocity (rad/s) | 100 | 3 |
| tau_ref | SI.Torque (N.m) | 10 | 2 |
| v_dc | SI.Voltage (V) | 560 | 4 |
| i_dc | SI.Current (A) | 20 | 2 |
| enable | Boolean | — | 5 |
| fault | Boolean | — | 2 |
| u[3] | Real | — | 2 |
| tSample | SI.Time (s) | 0.001 | 2 |

八个信号里任何一个出现次数等于 1 都会触发欠定；上表最小值为 2，说明每个信号至少在两个组件间共享。信号总数从 8 增加到 20 时，连接方程数按各信号累加，但 `connect` 语句数不增加，这是总线相对逐个连接的主要收益。

## 命名、注解与前缀

```modelica
expandable connector DriveBus
  "驱动总线：只声明跨组件共享的信号"
  Modelica.Units.SI.AngularVelocity w_ref(nominal = 100);
  Modelica.Units.SI.Torque tau_ref(nominal = 10);
  Modelica.Units.SI.Voltage v_dc(nominal = 560);
  Modelica.Units.SI.Current i_dc(nominal = 20);
  Boolean enable;
  Boolean fault;
  Real u[3];
  annotation(defaultComponentName = "driveBus");
end DriveBus;
```

`defaultComponentName` 让工具在拖放时自动把实例命名为 `driveBus`，避免同一模型里出现 `bus1`、`bus2` 混用。若要给整个总线一个统一前缀，用 `annotation(defaultComponentPrefixes = "inner")`。

## 装配规则与常见误用

可扩展连接器只允许出现在组件声明中，且参与连接的必须是同类可扩展连接器。下列做法在语言层面就不成立：把可扩展连接器连到普通连接器（变量集合不匹配）、在 `connect` 之外依赖总线信号自动赋值（工具会报变量未赋值）、以及把物理量（压力、流量）放进总线。物理量必须走 `flow`/势变量机制，总线只承载因果信号。

## 未连接变量的排查

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 driveBus.w_ref is not assigned | 该信号出现次数等于 1，未生成连接方程 | 统计每个信号在 connect 中出现的次数 |
| 总线里部分信号在结果文件中恒为零 | 写入方组件未真正给该信号赋值 | 在写入组件内加一条 driveBus.w_ref 等于 w_ref 的断言 |
| 报 expandable connector cannot be connected to connector | 一端是普通连接器 | 检查被连接对象的声明类型 |
| 增加信号后模型过定 | 新信号同时被两个组件赋值 | 确认每个信号只有一个写入方 |
| 转速指令被放大 9.55 倍 | 一处用 rad/s、另一处用 rpm | 统一在总线声明里写 unit 与 nominal |

最后一行给出量级：100 rad/s 对应约 955 rpm，若两侧单位不一致，转速指令会被放大 9.55 倍或缩小同样倍数；若混用 $2\pi$ 因子则只差 6.28 倍，更隐蔽。

## 参考

1. Modelica Association. *Modelica Language Specification, Version 3.6*. 2023. — 可扩展连接器与变量出现次数规则
2. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Blocks.Interfaces`. 2020.
3. Otter M., Elmqvist H., Mattsson S.E. Hybrid Modeling in Modelica Based on the Synchronous Data Flow Principle. *IEEE CACSD*, 1999. — 因果信号与总线
4. Modelica Association. *Functional Mock-up Interface Specification, Version 3.0*. 2022. — 总线信号的映射与导出
5. Fritzson P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015. — 连接器与总线设计
6. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Electrical.Analog.Interfaces`. 2020.
