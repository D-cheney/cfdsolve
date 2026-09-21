---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-start-solver-selection-diagnosis-validation
title: "求解器与 foamRun 模块选型：结果诊断与可信度验证"
summary: "把连续性误差、能量不平衡率与温度越界三类可观测信号作为选型错误的分流判据，给出阈值与命令行取数方式，并用与基准算例对照的方式证明模块选择正确。"
category:
  slug: openfoam-getting-started
  name: "OpenFOAM 入门与案例组织"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 入门与案例组织"
  - "求解器与 foamRun 模块选型"
  - "结果诊断与可信度验证"
  - "连续性误差"
  - "能量平衡"
seo:
  title: "求解器与 foamRun 模块选型：结果诊断与可信度验证"
  description: "把连续性误差、能量不平衡率与温度越界三类可观测信号作为选型错误的分流判据，给出阈值与命令行取数方式，并用与基准算例对照的方式证明模块选择正确。"
  keywords:
    - "求解器与 foamRun 模块选型"
    - "结果诊断与可信度验证"
    - "连续性误差"
    - "能量平衡"
    - "基准对照"
---

# 求解器与 foamRun 模块选型：结果诊断与可信度验证

模块选错很少以"报错"的形式出现，它更常见的表现是：算得下去，收敛曲线也好看，但结果违反一条本应自动成立的守恒关系。因此选型验证的重点不是检查命令，而是检查三类不依赖模型假设的量——连续性误差、能量不平衡率、以及被求解变量是否越出物理界。本文给出这三类信号的取数方式、阈值与判定试验。

## 连续性误差是最直接的选型信号

不可压模块在每步末尾打印连续性误差，其全局值定义为

$$
\varepsilon_{\text{cont}} = \frac{\sum_f \dot m_f}{\dot m_{\text{in}}}
$$

分子是各面质量流量的代数和，理论上为零。日志中该值以 `time step continuity errors : sum local = ..., global = ..., cumulative = ...` 的形式出现。取 $\dot m_{\text{in}} = 0.0123\ \mathrm{kg/s}$、日志报告的 global 值 $3.2\times 10^{-4}$，对应的绝对不平衡量为 $0.0123\times 3.2\times 10^{-4} = 3.94\times 10^{-6}\ \mathrm{kg/s}$，占入口流量的 $0.032\%$。

判据：稳态段的 global 值应稳定在 $10^{-3}$ 以下且不随时间上升；cumulative 值应趋于常数而不是线性增长。若 global 值长期停留在 $10^{-2}$ 以上，且日志同时出现 `Continuity error cannot be removed by adjusting the outflow.`，说明出口边界类型与所选模块的假设冲突——例如把不可压算例的出口设成 `fixedValue` 压力而入口又给了速度，流量无处可调。

## 能量不平衡率判定可压模块是否真的在解能量

对含能量方程的模块，用进出口焓流核对：

$$
\varepsilon_{E} = \frac{\lvert \dot Q_{\text{in}} - \dot Q_{\text{out}} \rvert}{\dot Q_{\text{in}}}
$$

设加热功率 $\dot Q_{\text{in}} = 4.80\ \mathrm{kW}$，由出口温度、流量与比热反算的焓流为 $4.74\ \mathrm{kW}$，则 $\varepsilon_E = 0.06/4.80 = 0.0125$，即 $1.25\%$。稳态算例中该值应在 $2\%$ 以内；若达到 $30\%$ 以上，同时温度场在空间上几乎均匀，就说明能量方程根本没有被激活——常见原因是用了 `isothermalFluid` 或 `thermophysicalProperties` 中把能量求解关闭了。

取数方式：

```bash
postProcess -func 'fieldMinMax(T)' -time 0.5
postProcess -func 'volFieldValue(T)' -time 0.5
foamDictionary -entry thermoType/energy -value constant/thermophysicalProperties
```

## 越界信号揭示模块与物性不匹配

不可压模块把密度当作常数，若被错误地用于低马赫数但强加热的算例，温度升高后密度不变，浮力被系统性低估；反之把可压模块用于水这类近似不可压介质，密度方程会因声速极高而把时间步压到无法承受。两类错误的可观测信号不同：前者表现为温度远高于能量平衡预测值，后者表现为库朗数限制下的时间步异常小。

对空气算例，温度合理下界可取 $200\ \mathrm{K}$。若 `fieldMinMax(T)` 报告最低温度 $T_{\min} = 148.6\ \mathrm{K}$，比环境温度 $300\ \mathrm{K}$ 低 $151\ \mathrm{K}$，且位置固定在某个入口角点，那是边界值单位写错（例如把摄氏度数值直接填进以开尔文为单位的场）而非模块问题。判定试验：把该边界的值加 273.15 后重跑，最低温度应回到 $300\ \mathrm{K}$ 附近。

## 与基准算例的对照

OpenFOAM 自带教程是选型的基准来源。做法是复制同物理类型的官方教程，只替换几何与物性，先跑通再改。对照量建议选"与模型无关"的积分量：入口流量、出口压力降、总焓流、以及封闭域内的质量守恒。以 $Re = 7.47\times 10^{4}$ 的管流为例，若在教程算例上得到的压降为 $820\ \mathrm{Pa}$，而自己的几何在相同 $Re$ 与相同无量纲长度下得到 $790\ \mathrm{Pa}$，相对差 $3.7\%$，属于网格与入口发展长度带来的正常差异；若得到 $2.4\times 10^{4}\ \mathrm{Pa}$，差 29 倍，则先怀疑模块选错或物性单位错，而不是网格。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| global 连续性误差长期大于 $10^{-2}$ | 出口边界类型与模块假设冲突 | 检查出口是否为 `inletOutlet` 或 `fixedFluxPressure` |
| 温度场空间均匀且能量不平衡率超过 30% | 模块不含能量方程 | `foamDictionary -entry thermoType/energy` 确认能量项开启 |
| 温度最低值比环境低 150 K 左右 | 边界值把摄氏度当开尔文填入 | 边界值加 273.15 重跑，最低温度应回到环境值附近 |
| 时间步被压到 $10^{-8}\ \mathrm{s}$ 且库朗数仍高 | 可压模块用于近似不可压介质 | 改不可压模块后，同 `maxCo` 下步长应回升数个量级 |
| 压降比同 $Re$ 基准大一个数量级以上 | 物性单位或模块选择错误 | 用 $\rho U L/\mu$ 重算 $Re$，并与基准算例的无量纲压降对比 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Chapter "Solvers and Modules".
2. C. J. Greenshields, *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
3. R. I. Issa, "Solution of the implicitly discretised fluid flow equations by operator-splitting", *Journal of Computational Physics*, 62(1):40–65, 1986.
4. S. V. Patankar, *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
5. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
6. F. P. Incropera, D. P. DeWitt, T. L. Bergman, A. S. Lavine, *Fundamentals of Heat and Mass Transfer*, 6th ed., Wiley, 2007.
