---
template_version: "flowlab-knowledge/1.0"
slug: modelica-integration-external-data-diagnosis-validation
title: "表格与外部数据：结果诊断与可信度验证"
summary: "外部数据表出错多半不是读不到文件，而是口径不同：横轴是时间还是索引、单位是 K 还是 °C、越界是外推还是报错。本文用插值误差界、保单调条件与外推偏差三项判据逐层定位。"
category:
  slug: modelica-integration
  name: "Modelica 集成与联合仿真"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 集成与联合仿真"
  - "表格与外部数据"
  - "结果诊断与可信度验证"
  - "CombiTable 插值外推"
seo:
  title: "表格与外部数据：结果诊断与可信度验证"
  description: "外部数据表出错多半不是读不到文件，而是口径不同：横轴是时间还是索引、单位是 K 还是 °C、越界是外推还是报错。本文用插值误差界、保单调条件与外推偏差三项判据逐层定位。"
  keywords:
    - "表格与外部数据"
    - "结果诊断与可信度验证"
    - "CombiTable1Ds"
    - "smoothness 与 extrapolation"
---

# 表格与外部数据：结果诊断与可信度验证

外部数据表的问题很少出在“读不到文件”，而是出在“读到了但口径不同”：横轴是绝对时间还是相对时间、单位是 K 还是 °C、超出表尾是外推还是报错。诊断按“横轴与单位 → 插值口径 → 外推策略 → 数据版本”逐层推进，每一层都有可量化的判定量。下面用一张 5 点的水密度表给出完整的误差预算与一次外推对照。

## 横轴、单位与文件格式

MSL 的表格文件有固定头两行：第一行 `#1` 表示一维表，第二行给出名字与维度，之后才是数据。`tableName` 必须与第二行名字一致，`columns` 指定取哪一列作为输出（第 1 列固定是自变量）。

```text
#1
double rho(5,2)
273.15  999.8
293.15  998.2
313.15  992.2
333.15  983.2
353.15  971.8
```

横轴用时间时要确认是绝对时间还是相对时间：`Modelica.Blocks.Sources.TimeTable` 直接以仿真时间查表，而 `CombiTable1Ds` 把第一列当作自变量。若表是从 CFD 后处理导出的相对时间序列，必须补上起始时刻偏移，否则整段响应会平移。

## 插值与外推开关

```modelica
model WaterDensity
  Modelica.Blocks.Sources.TimeTable Tin(
    table = [0.0, 293.15; 30.0, 373.15; 60.0, 353.15])
    annotation(Placement(transformation(extent = {{-70, -10}, {-50, 10}})));
  Modelica.Blocks.Tables.CombiTable1Ds rho(
    tableOnFile = true,
    tableName = "rho",
    fileName = "modelica://MyProps/Resources/Data/water_rho.txt",
    columns = {2},
    smoothness = Modelica.Blocks.Types.Smoothness.MonotoneContinuousDerivative1,
    extrapolation = Modelica.Blocks.Types.Extrapolation.Error,
    verboseRead = true);
equation
  connect(Tin.y, rho.u) annotation(Line(points = {{-49, 0}, {-30, 0}}));
end WaterDensity;
```

`smoothness` 有 `LinearSegments`、`ConstantSegments`、`MonotoneContinuousDerivative1`、`MonotoneContinuousDerivative2` 四种取值，对应线性、阶梯与两种保单调三次 Hermite；`extrapolation` 有 `LastTwoPoints`、`Constant`、`Linear`、`Error`，只有 `Error` 会在越界时直接报错，其余三种都会静默给出数值。

## 插值误差界与保单调条件

线性插值的局部误差受二阶导数控制：

$$\lvert f(x)-P(x)\rvert\le \frac{h^{2}}{8}\max\lvert f''\rvert$$

保单调三次 Hermite 用 Fritsch–Carlson 条件限制节点导数 $\delta_i$，避免插值在陡变段产生过冲：

$$\alpha^{2}+\beta^{2}\le 9,\qquad \alpha=\frac{\Delta_{i-1}}{\delta_{i}},\quad \beta=\frac{\Delta_{i}}{\delta_{i}}$$

满足该条件时三次插值误差降到 $O(h^4)$，且在单调段内不引入新的极值——这正是把 `smoothness` 从 `LinearSegments` 换成 `MonotoneContinuousDerivative1` 的收益。

## 一次误差预算与手算

上表 5 个节点间距 $h=20.0\,\mathrm{K}$。一阶差分 $\Delta_1=-1.6$、$\Delta_2=-6.0$、$\Delta_3=-9.0$、$\Delta_4=-11.4\,\mathrm{kg/m^3}$，二阶差分商为 $(\Delta_2-\Delta_1)/h^2=-0.011$、$(\Delta_3-\Delta_2)/h^2=-0.0075$、$(\Delta_4-\Delta_3)/h^2=-0.006\,\mathrm{kg/(m^3\cdot K^2)}$，故 $\max\lvert f''\rvert\approx0.011$。代入误差界得 $20^2/8\times0.011=0.55\,\mathrm{kg/m^3}$，相对 $998.2\,\mathrm{kg/m^3}$ 为 $5.5\times10^{-4}$。把间距加密到 $10.0\,\mathrm{K}$ 时误差界降到 $0.14\,\mathrm{kg/m^3}$，比值 4.0，符合二阶。

外推的代价要大得多。查询 $T=373.15\,\mathrm{K}$，超出末节点 $20.0\,\mathrm{K}$：`LastTwoPoints` 用末段斜率 $(971.8-983.2)/20=-0.57\,\mathrm{kg/(m^3\cdot K)}$，给出 $971.8-0.57\times20=960.4\,\mathrm{kg/m^3}$，而饱和液密度参考值约 $958.4\,\mathrm{kg/m^3}$，偏差 $2.0\,\mathrm{kg/m^3}$ 即 0.21%；`Constant` 保持 $971.8\,\mathrm{kg/m^3}$，偏差 $13.4\,\mathrm{kg/m^3}$ 即 1.4%。两者都不报警，这就是把 `extrapolation` 设为 `Error` 的直接理由。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 整段响应比预期晚 $30.0\,\mathrm{s}$ | 表的时间列是相对时间，未加起始偏移 | 把 `TimeTable` 起点改为 $-30.0\,\mathrm{s}$ 重跑 |
| 密度在 $T>353.15\,\mathrm{K}$ 后仍平滑下降 | `extrapolation` 为 `LastTwoPoints`，静默外推 | 改为 `Error`，应立刻报越界 |
| 温度曲线出现 $0.4\,\mathrm{K}$ 台阶 | `smoothness` 为 `ConstantSegments` | 换成 `LinearSegments`，台阶应消失 |
| 同一张表在两台机器上结果不同 | 表文件版本或编码不同 | 比对 `sha256sum`，并检查首行是否为 `#1` |
| $T=273.15\,\mathrm{K}$ 处密度给出 $998.0\,\mathrm{kg/m^3}$ | 表头写 °C 而模型按 K 解释 | 在 273.15 K 处查表应得 $999.8\,\mathrm{kg/m^3}$ |
| 插值后出现负密度 | 陡变段用过冲的三次插值，且无单调限制 | 换 `MonotoneContinuousDerivative1` 并检查 $\alpha^2+\beta^2$ |

## 数据包的打包与版本核对

表文件用 `modelica://` 引用并随库分发；导出 FMU 时工具会把 `Resources` 一并打入压缩包，因此不要再依赖开发机绝对路径。交付前核对三件事：表文件头两行与 `tableName`/`columns` 一致、`sha256sum` 与记录一致、越界查询会触发 `assert` 或错误码而不是返回 0。

```bash
head -n 3 Resources/Data/water_rho.txt
sha256sum Resources/Data/water_rho.txt
```

## 参考文献

1. Modelica Association, *Modelica Standard Library 4.0.0*, `Modelica.Blocks.Tables.CombiTable1Ds`, `Modelica.Blocks.Types.Smoothness`, `Modelica.Blocks.Types.Extrapolation`.
2. Fritsch F. N., Carlson R. E., "Monotone Piecewise Cubic Interpolation", *SIAM Journal on Numerical Analysis*, 17(2), 1980, pp. 238-246.
3. Modelica Association, *Modelica Language Specification 3.6*, 2023, §12.9.4 表格文件格式与 `modelica://` 资源.
4. Wagner W., Pruß A., "The IAPWS Formulation 1995 for the Thermodynamic Properties of Ordinary Water Substance for General and Scientific Use", *Journal of Physical and Chemical Reference Data*, 31(2), 2002, pp. 387-535.
5. Wetter M., "Modelica-based modelling and simulation to support research and development in building energy and control systems", *Journal of Building Performance Simulation*, 2(2), 2009, pp. 143-161.
6. Modelica Association, *Functional Mock-up Interface Specification 3.0*, 2022, §2.1.3.
