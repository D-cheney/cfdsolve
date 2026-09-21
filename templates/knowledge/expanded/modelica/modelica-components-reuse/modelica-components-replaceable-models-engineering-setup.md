---
template_version: "flowlab-knowledge/1.0"
slug: modelica-components-replaceable-models-engineering-setup
title: "replaceable 可替换模型：工程设置与参数选择"
summary: "constrainedby 划定可替换边界，换入类必须是约束类的子类型。给出子类型与接口计数判据、介质包替换时端口数组维数的变化、choices 与 choicesAllMatching 的取舍表，以及替换失效的五类编译期与初始化期症状。"
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
  - "replaceable 可替换模型"
  - "工程设置与参数选择"
  - "constrainedby"
  - "PartialMedium"
seo:
  title: "replaceable 可替换模型：工程设置与参数选择"
  description: "constrainedby 划定可替换边界，换入类必须是约束类的子类型。给出子类型与接口计数判据、介质包替换时端口数组维数的变化、choices 与 choicesAllMatching 的取舍表，以及替换失效的五类编译期与初始化期症状。"
  keywords:
    - "replaceable 可替换模型"
    - "工程设置与参数选择"
    - "constrainedby"
    - "PartialMedium"
    - "choicesAllMatching"
---

# replaceable 可替换模型：工程设置与参数选择

`replaceable` 把将来可能换实现这件事写进模型代码，`constrainedby` 则规定换进来的类必须满足什么接口。工程上要设置的是三件事：约束类的粒度、默认实现的选择、以及允许用户替换的范围。粒度定得过细会锁死实现，过粗则替换后接口不匹配，编译期报出难以定位的错误。

## 约束类划定的可替换边界

设被替换的默认类为 $T_{default}$，约束类为 $T_{constraint}$，用户换入的类为 $T_{new}$。语言规则要求

$$ T_{new} \preceq T_{constraint} $$

即 $T_{new}$ 必须是 $T_{constraint}$ 的子类型，也就是继承自它或与它同一类。注意约束不与 $T_{default}$ 比较：默认类自己可以带额外参数，但用户换入的类只需满足约束。把 `constrainedby` 写成 `Modelica.Media.Interfaces.PartialMedium`，用户就能换入任意满足该接口的介质；若写成 `Modelica.Media.Water.StandardWater`，替换空间被压到零，`replaceable` 形同虚设。

## 接口一致性的计数检查

替换前后端口结构必须逐项相同。对含 $n_{port}$ 个端口的组件，替换前后应满足

$$ \Delta n_{port} = 0,\qquad \Delta n_{pot} = 0,\qquad \Delta n_{flow} = 0 $$

实际最容易出问题的是数组维数。湿空气 `Modelica.Media.Air.MoistAir` 有 2 个独立组分，`nXi = 2`，端口里 `Xi_outflow[Medium.nXi]` 是长度 2 的数组；液态水 `Modelica.Media.Water.StandardWater` 是单组分介质，`nXi = 0`，同一端口变成零长数组。二者虽然都满足 `PartialMedium` 约束，但数组维数从 2 变成 0，若组件里写死了 `Xi_outflow[1]` 或对 `Xi` 求和，替换后编译失败。因此凡是引用 `Medium.nXi`、`Medium.nX` 的数组，都必须把 `Medium` 在组件与它的每个端口上同步 redeclare。

```modelica
model HeatExchanger
  replaceable package Medium = Modelica.Media.Air.MoistAir
    constrainedby Modelica.Media.Interfaces.PartialMedium
    annotation(choicesAllMatching=true);
  Modelica.Fluid.Interfaces.FluidPort_a port_a(redeclare package Medium = Medium);
  Modelica.Fluid.Interfaces.FluidPort_b port_b(redeclare package Medium = Medium);
  parameter Modelica.Units.SI.Length L = 1.5 "管长";
  parameter Modelica.Units.SI.Diameter d = 0.025 "内径";
equation
  // 端口数组维数随 Medium.nXi 变化，方程本身不需改动
  port_a.Xi_outflow = inStream(port_b.Xi_outflow);
  port_b.Xi_outflow = inStream(port_a.Xi_outflow);
end HeatExchanger;
```

替换时用 `HeatExchanger(redeclare package Medium = Modelica.Media.Water.StandardWater)`，`Xi_outflow` 自动变为零长数组。

## 默认实现与替换范围的取舍

| 设置 | 取值示例 | 适用场景 | 代价 |
|---|---|---|---|
| 约束类为 PartialMedium | 任意 MSL 介质 | 通用换热器、管网 | 用户可换入不收敛的介质 |
| 约束类为 PartialSimpleMedium | 常物性介质 | 控制导向的快速仿真 | 排除 StandardWater 等表格介质 |
| 约束类为自定义 partial | 只含所需属性的最小接口 | 自研库内部 | 需自行维护接口文档 |
| choicesAllMatching 为真 | 工具自动列出子类 | 面向终端用户 | 下拉列表可能上百项 |
| choices 显式列表 | 3 至 5 个已验证介质 | 交付给非专家 | 新增介质需改代码 |

默认实现选 `Modelica.Media.Air.MoistAir`（`nXi = 2`、`nX = 3`、参考压力 101325 Pa）还是 `Modelica.Media.Water.StandardWater`，取决于典型工况。若 80% 的用例是水，默认值应设成水，把湿空气放进 `choices` 列表，避免每次装配都写 redeclare。

## 替换失效的现象与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 class is not a subtype of | 换入类未继承约束类 | 用 extends 检查换入类的祖先链是否包含约束类 |
| 报 dimension mismatch | 端口未随组件一起 redeclare 介质 | 打印 Medium.nXi，确认端口与组件解析到同一个包 |
| 替换后初始化失败 | 换入介质缺少 p_default 或 T_default | 检查换入类是否定义 Medium.p_default、Medium.T_default |
| 结果与默认实现差 20% 以上 | 介质模型层级不同，常物性对表格 | 在同一工况下比较 Medium.d 与 Medium.cp 的数值 |
| 用户下拉列表为空 | 约束类过于具体，无子类可选 | 把 constrainedby 上移到 PartialMedium 层级 |

## 参考

1. Modelica Association. *Modelica Language Specification, Version 3.6*. 2023. — replaceable 与 constrainedby 的子类型规则
2. Modelica Association. *Modelica Standard Library 4.0.0*, `Modelica.Media.Interfaces.PartialMedium`. 2020.
3. Fritzson P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015. — 模型族与约束类
4. Åström K.J., Elmqvist H., Mattsson S.E. Evolution of Continuous-Time Modeling and Simulation. *ESM'98*, 1998.
5. Mattsson S.E., Elmqvist H., Otter M. Physical System Modeling with Modelica. *Control Engineering Practice*, 6(4): 501–510, 1998. — 可替换介质包的工程用法
6. Elmqvist H., Mattsson S.E., Otter M. Modelica — A Language for Physical System Modeling, Visualization and Interaction. *IEEE CACSD*, 1999. — 可替换元素与模型族
