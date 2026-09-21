---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-start-dimensioned-types-diagnosis-validation
title: "量纲系统与 dimensioned 类型：结果诊断与可信度验证"
summary: "从报错文本与结果量级两条线索定位量纲错误：用七元组逐项相减判定不一致位置，用运动学压力与静压的换算比判定压力约定错用，并给出无量纲数与源项闭合的交叉验证流程。"
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
  - "量纲系统与 dimensioned 类型"
  - "结果诊断与可信度验证"
  - "量纲一致性"
  - "白金汉定理"
seo:
  title: "量纲系统与 dimensioned 类型：结果诊断与可信度验证"
  description: "从报错文本与结果量级两条线索定位量纲错误：用七元组逐项相减判定不一致位置，用运动学压力与静压的换算比判定压力约定错用，并给出无量纲数与源项闭合的交叉验证流程。"
  keywords:
    - "量纲系统与 dimensioned 类型"
    - "结果诊断与可信度验证"
    - "量纲一致性"
    - "运动学压力"
    - "无量纲数"
---

# 量纲系统与 dimensioned 类型：结果诊断与可信度验证

量纲错误有两种表现：一种在启动阶段就被拦下，另一种一路算完却给出量级离谱的结果。前者只需读报错里的七元组，后者要靠量级比对与无量纲数交叉验证。本文给出从报错文本反推不一致指数的方法、运动学压力与静压的换算判据、源项量纲闭合的检验步骤，以及一次完整的量级核对计算。

## 报错里的两个七元组就是全部证据

量纲不一致时求解器抛出的错误通常长这样：

```
--> FOAM FATAL ERROR:
Different dimensions
    dimensions : [1 -1 -2 0 0 0 0] != [0 2 -2 0 0 0 0]
```

左值是当前对象声明的量纲，右值是方程或另一操作数期望的量纲。把两个七元组逐项相减得 `[1 -3 0 0 0 0 0]`，差值只落在质量与时间两项上，说明这是"静压 Pa"与"运动学压力 $\mathrm{m^2/s^2}$"的混淆，而不是温度或电流指数写错。逐项相减比盯着两组数字看快得多，因为它把差异压缩到具体几个指数。

另一类错误是格式问题而非物理问题：`wrong token type - expected dimensionSet, found word` 说明 `dimensions` 后面跟的不是方括号包裹的整数序列，常见原因是写成了 `dimensions (0 2 -1 0 0 0 0);` 或漏了分号。

## 压力约定错用靠换算比判定

不可压模块求解 $p/\rho$，可压模块求解绝对压力 $p$。两者的换算关系是

$$
p_{\text{Pa}} = \rho \left(\frac{p}{\rho}\right)
$$

若一个不可压算例在出口报告 $p/\rho = 12.5\ \mathrm{m^2/s^2}$，取 $\rho = 1.225\ \mathrm{kg/m^3}$，对应静压 $p = 1.225\times 12.5 = 15.31\ \mathrm{Pa}$。这个量级可以用动压独立校验：来流 $U = 10\ \mathrm{m/s}$ 时动压 $\tfrac{1}{2}\rho U^{2} = 0.5\times 1.225\times 100 = 61.25\ \mathrm{Pa}$，对应运动学动压 $50\ \mathrm{m^2/s^2}$。若出口的 $p/\rho$ 达到 $10^{4}$ 量级，或压力场数值直接等于 $1.013\times 10^{5}$，那就是把绝对压力填进了运动学压力场，量级偏离约 $8\times 10^{3}$ 倍，动量方程会在数步内发散。

判定试验：用 `postProcess -func 'fieldMinMax(p)'` 导出压力极值，与 $\tfrac{1}{2}U_{\text{ref}}^{2}$ 比较。不可压算例的压力波动应落在动压的同一量级内，超出两个数量级即为约定错用。

## 无量纲数把量纲自洽变成可核对等式

量纲正确的一组物性必须能还原出预期的无量纲数。雷诺数与欧拉数分别为

$$
Re = \frac{\rho U L}{\mu}, \qquad Eu = \frac{p}{\rho U^{2}}
$$

取 $\rho = 998.2\ \mathrm{kg/m^3}$、$U = 1.5\ \mathrm{m/s}$、$L = 0.05\ \mathrm{m}$、$\mu = 1.0022\times 10^{-3}\ \mathrm{Pa\cdot s}$，得 $Re = 998.2\times 1.5\times 0.05/1.0022\times 10^{-3} = 74.87/1.0022\times 10^{-3} \approx 7.47\times 10^{4}$。若把 $\mu$ 错填成 $1.0022\times 10^{-6}$（把 $\mathrm{mPa\cdot s}$ 当 $\mathrm{Pa\cdot s}$ 用），$Re$ 会变成 $7.47\times 10^{7}$，从湍流直接跳到完全不符合物理的范围；若把长度单位从毫米误当米，$L$ 差 1000 倍，$Re$ 同样差 1000 倍。因此把 $Re$ 当作量纲自洽的"指纹"，比逐个检查物性文件快。

用白金汉定理还能预先算出独立无量纲数的个数：对不可压等温流动，相关量有 $\rho$、$U$、$L$、$\mu$、$p$ 共 5 个，基本量纲 3 个，独立无量纲数 $5-3 = 2$ 个，正好对应 $Re$ 与 $Eu$。若你的设置里出现第 3 个独立无量纲数，说明多引入了一个未被方程使用的参数，通常是单位不一致的信号。

## 源项量纲闭合的检验步骤

自定义源项最容易出错，因为它不经过标准场的量纲检查。以湍动能方程的耗散源项为例，因变量 $k$ 的量纲是 $[0\,2\,-2\,0\,0\,0\,0]$，方程整体量纲为 $k$ 除以时间，即 $[0\,2\,-3\,0\,0\,0\,0]$，与 $\varepsilon$ 相同。因此源项必须具有相同量纲；若写成 $\mathrm{W/m^3}$ 即 `[1 -1 -3 0 0 0 0]`，就多了质量指数、少了长度指数，运行时会报 `Different dimensions`。

检验方法是把源项表达式中每个因子展开成七元组相加，看结果是否等于因变量量纲除以时间。这一步可以在纸面上完成，不需要运行求解器。

## 诊断量级偏差的验证计算

一次真实的量级排查：某可压算例的出口温度报告 $T = 311.4\ \mathrm{K}$，入口 $T = 300.0\ \mathrm{K}$，比热 $c_p = 1005\ \mathrm{J/(kg\cdot K)}$，流量 $0.42\ \mathrm{kg/s}$，加热功率设计值 $4.8\ \mathrm{kW}$。由能量平衡，温升应为

$$
\Delta T = \frac{\dot Q}{\dot m\,c_p} = \frac{4800}{0.42\times 1005} = \frac{4800}{422.1} = 11.37\ \mathrm{K}
$$

预测出口温度 $300.0 + 11.37 = 311.37\ \mathrm{K}$，与报告的 $311.4\ \mathrm{K}$ 相差 $0.03\ \mathrm{K}$，相对偏差 $9.6\times 10^{-5}$。这说明热物性、流量与能量源项的量纲与数值彼此自洽。若实测出口为 $341\ \mathrm{K}$，温升 $41\ \mathrm{K}$ 接近计算值的 3.6 倍，最可能的解释是 $c_p$ 被填成了 $\mathrm{J/(kg\cdot K)}$ 的千分之一或流量单位错用，而不是湍流模型的问题。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 报 `Different dimensions` 并列出两组七元组 | 操作数或被赋值对象量纲不符 | 逐项相减，差值集中在质量与时间项即为压力约定错用 |
| 报 `wrong token type - expected dimensionSet` | `dimensions` 未用方括号包裹 | 检查该行语法，应为 `dimensions [0 2 -1 0 0 0 0];` |
| 压力场极值达 $10^{4}$ 以上 | 绝对压力填入运动学压力场 | 用 $\tfrac{1}{2}U^{2}$ 估动压，压力波动应同量级 |
| 由物性反算的 $Re$ 偏离设计值 1000 倍 | 长度或粘度单位错用（mm 当 m、mPa·s 当 Pa·s） | 用 $\rho U L/\mu$ 重算，并核对单位标注 |
| 温度结果比能量平衡预测高数倍 | $c_p$ 数值与单位不匹配 | 用 $\Delta T = \dot Q/(\dot m c_p)$ 反算并比对 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Section "Dimensional units and dimensioned types".
2. OpenFOAM Foundation, *OpenFOAM Programmer's Guide*, v14, Chapter "Primitive types: dimensionSet".
3. E. Buckingham, "On physically similar systems; illustrations of the use of dimensional equations", *Physical Review*, 4(4):345–376, 1914.
4. BIPM, *Le Système international d'unités (SI)*, 9th ed., 2019.
5. ISO, *ISO 80000-1:2009 Quantities and units — Part 1: General*, International Organization for Standardization, 2009.
6. F. P. Incropera, D. P. DeWitt, T. L. Bergman, A. S. Lavine, *Fundamentals of Heat and Mass Transfer*, 6th ed., Wiley, 2007.
