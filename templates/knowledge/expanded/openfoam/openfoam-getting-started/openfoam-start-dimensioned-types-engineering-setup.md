---
template_version: flowlab-knowledge/1.0
slug: openfoam-start-dimensioned-types-engineering-setup
title: 量纲系统与 dimensioned 类型：工程设置与诊断验证
summary: >-
  梳理七指数 dimensionSet 的顺序与含义，给出不可压与可压两套常用场的量纲向量表，说明 dimensionedScalar
  的构造方式与运动学压力/静压的取舍，并用粘度与导热系数两例完成量纲闭合的手算核对。
category:
  slug: openfoam-getting-started
  name: OpenFOAM 入门与案例组织
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 入门与案例组织
  - 量纲系统与 dimensioned 类型
  - 工程设置与参数选择
  - dimensionSet
  - 运动学压力
  - 结果诊断与可信度验证
  - 量纲一致性
  - 白金汉定理
seo:
  title: 量纲系统与 dimensioned 类型：工程设置与诊断验证
  description: >-
    梳理七指数 dimensionSet 的顺序与含义，给出不可压与可压两套常用场的量纲向量表，说明 dimensionedScalar
    的构造方式与运动学压力/静压的取舍，并用粘度与导热系数两例完成量纲闭合的手算核对。
  keywords:
    - 量纲系统与 dimensioned 类型
    - 工程设置与参数选择
    - dimensionSet
    - dimensionedScalar
    - 运动学压力
    - 结果诊断与可信度验证
    - 量纲一致性
    - 无量纲数
---
# 量纲系统与 dimensioned 类型：工程设置与诊断验证

OpenFOAM 把每个物理量都写成"数值 + 七指数向量"的 `dimensioned` 类型，求解器在运行时对加减、乘除、比较逐项校验量纲。这意味着写错量纲不会被静默接受，而是立刻中止；也意味着只要量纲向量写对，物性单位就从"记得住"变成"推导得出"。量纲错误有两种表现：一种在启动阶段就被拦下，另一种一路算完却给出量级离谱的结果。前者只需读报错里的七元组，后者要靠量级比对与无量纲数交叉验证。

## 七个指数的固定顺序

任一物理量的量纲写作

$$
[\phi] = M^{a}\,L^{b}\,T^{c}\,\Theta^{d}\,N^{e}\,I^{f}\,J^{g}
$$

依次为质量、长度、时间、温度、物质的量、电流、发光强度，对应字典中的 `dimensions [a b c d e f g]`。全部无量纲写作 `[0 0 0 0 0 0 0]`。这个顺序不能重排：把速度写成 `[1 -1 0 0 0 0 0]` 是把米每秒误当成千克每米，求解器不会替你猜。

常见误区是把"量纲"和"单位"混为一谈。量纲是物理量的类型，单位是数值的刻度。速度的量纲固定为 $L\,T^{-1}$，用 $\mathrm{m/s}$ 还是 $\mathrm{km/h}$ 只是数值缩放；OpenFOAM 内部统一按 SI 解释数值，因此字典里写 `1.5` 就意味着 $1.5\ \mathrm{m/s}$。

## 常用场的量纲向量对照

表中最容易写错的是 `kappa`。它等于 $\mathrm{kg\cdot m/(s^3\cdot K)}$，即 `[1 1 -3 -1 0 0 0]`，长度指数是正的 1，容易被误写成 `[1 -1 -3 -1 0 0 0]`。

| 物理量 | 典型单位 | dimensions |
|---|---|---|
| 速度 U | m/s | [0 1 -1 0 0 0 0] |
| 密度 rho | kg/m^3 | [1 -3 0 0 0 0 0] |
| 动力粘度 mu | Pa·s | [1 -1 -1 0 0 0 0] |
| 运动粘度 nu | m^2/s | [0 2 -1 0 0 0 0] |
| 运动学压力 p/rho | m^2/s^2 | [0 2 -2 0 0 0 0] |
| 静压 p | Pa | [1 -1 -2 0 0 0 0] |
| 湍动能 k | m^2/s^2 | [0 2 -2 0 0 0 0] |
| 湍流耗散率 epsilon | m^2/s^3 | [0 2 -3 0 0 0 0] |
| 比热容 Cp | J/(kg·K) | [0 2 -2 -1 0 0 0] |
| 导热系数 kappa | W/(m·K) | [1 1 -3 -1 0 0 0] |
| 温度 T | K | [0 0 0 1 0 0 0] |

## 用两条乘积关系做量纲闭合

动力粘度由密度与运动粘度相乘得到：

$$
[\mu] = [\rho]\,[\nu]
$$

指数逐项相加：$[1\,-3\,0\,0\,0\,0\,0] + [0\,2\,-1\,0\,0\,0\,0] = [1\,-1\,-1\,0\,0\,0\,0]$，正是 $\mathrm{Pa\cdot s}$。数值上取 $20\ ^\circ\mathrm{C}$ 的水，$\rho = 998.2\ \mathrm{kg/m^3}$、$\nu = 1.004\times 10^{-6}\ \mathrm{m^2/s}$，得 $\mu = 998.2\times 1.004\times 10^{-6} = 1.0022\times 10^{-3}\ \mathrm{Pa\cdot s}$，与手册值 $1.002\times 10^{-3}\ \mathrm{Pa\cdot s}$ 一致。

导热系数可由比热容与普朗特数反推：

$$
[\kappa] = \frac{[\mu]\,[c_p]}{Pr}, \qquad Pr \text{ 无量纲}
$$

指数相加 $[1\,-1\,-1\,0\,0\,0\,0] + [0\,2\,-2\,-1\,0\,0\,0] = [1\,1\,-3\,-1\,0\,0\,0]$。数值上取 $c_p = 4182\ \mathrm{J/(kg\cdot K)}$、$Pr = 7.01$，得 $\kappa = 1.0022\times 10^{-3}\times 4182/7.01 = 4.191/7.01 = 0.598\ \mathrm{W/(m\cdot K)}$，与 $20\ ^\circ\mathrm{C}$ 水的实测值 $0.598\ \mathrm{W/(m\cdot K)}$ 吻合。这两次核对说明：量纲向量写对之后，物性数值之间也必须自洽，否则模型会用一组互相矛盾的参数推进。

## dimensionedScalar 的构造与预定义集合

在 C++ 源码或 `#codeStream` 中构造带量纲常数有两种写法：

```cpp
// 用预定义 dimensionSet 常量，可读性最好
dimensionedScalar nu("nu", dimViscosity, 1.5e-5);
dimensionedScalar rhoRef("rhoRef", dimDensity, 998.2);

// 直接用 dimensionSet 构造，适合自定义组合量
dimensionedScalar kappaEff
(
    "kappaEff",
    dimensionSet(1, 1, -3, -1, 0, 0, 0),
    0.598
);
```

`dimensionSet` 的构造函数参数顺序与字典中一致，依次是 7 个整数指数，最后可跟一个缩放因子（默认 1）。预定义常量覆盖了绝大多数场景：`dimless`、`dimVelocity`、`dimAcceleration`、`dimPressure`、`dimKinematicPressure`、`dimViscosity`、`dimDynamicViscosity`、`dimDensity`、`dimForce`、`dimEnergy`、`dimPower`、`dimTurbulentKineticEnergy`、`dimTurbulentDissipation`、`dimSpecificHeatCapacity`、`dimThermalConductivity`。用预定义常量而不是手写七元组，能在编译期避免指数位置写错。

## 不可压与可压两套压力

不可压模块把压力当作运动学量求解，字典中 `p` 的量纲是 `[0 2 -2 0 0 0 0]`，单位 $\mathrm{m^2/s^2}$，物理含义是静压除以密度。可压模块求解绝对压力，量纲 `[1 -1 -2 0 0 0 0]`，单位 $\mathrm{Pa}$。两者不能互换：把可压算例的 `0/p` 拿到不可压算例里用，量纲检查会在读场阶段直接失败。

换算关系为 $p_{\mathrm{Pa}} = \rho\,(p/\rho)$。取 $\rho = 1.225\ \mathrm{kg/m^3}$、运动学压力 $12.5\ \mathrm{m^2/s^2}$，静压为 $1.225\times 12.5 = 15.31\ \mathrm{Pa}$。反过来，若一个不可压算例报告 $p = 101325$，那是把静压填进了运动学压力的位置，量纲虽未报错（因为都是数值），但物理量级偏大约 $8\times 10^{3}$ 倍，动量方程会立刻发散。

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 启动报 `Different dimensions` 并列出两组七元组 | 场文件量纲与方程期望不符 | 逐项相减，确认是哪一个指数不同 |
| 报 `wrong token type - expected dimensionSet` | `dimensions` 后缺少方括号或写成 `(...)` | 检查该行是否为 `dimensions [0 2 -1 0 0 0 0];` |
| 压力数量级偏大 $10^{3}$ 以上 | 把静压填入运动学压力场 | 用 $p/\rho$ 反算，量级应回到 $10^{1}\ \mathrm{m^2/s^2}$ 内 |
| 温度场量纲写成 `[0 0 0 0 0 0 0]` | 误用 `dimless` | 改为 `[0 0 0 1 0 0 0]`，热物性模型才能读取 |
| 自定义源项一加入就报量纲错 | 源项量纲与方程因变量不匹配 | 用因变量量纲除以时间量纲，反推源项应取的指数 |
| 报 `Different dimensions` 并列出两组七元组 | 操作数或被赋值对象量纲不符 | 逐项相减，差值集中在质量与时间项即为压力约定错用 |
| 报 `wrong token type - expected dimensionSet` | `dimensions` 未用方括号包裹 | 检查该行语法，应为 `dimensions [0 2 -1 0 0 0 0];` |
| 压力场极值达 $10^{4}$ 以上 | 绝对压力填入运动学压力场 | 用 $\tfrac{1}{2}U^{2}$ 估动压，压力波动应同量级 |
| 由物性反算的 $Re$ 偏离设计值 1000 倍 | 长度或粘度单位错用（mm 当 m、mPa·s 当 Pa·s） | 用 $\rho U L/\mu$ 重算，并核对单位标注 |
| 温度结果比能量平衡预测高数倍 | $c_p$ 数值与单位不匹配 | 用 $\Delta T = \dot Q/(\dot m c_p)$ 反算并比对 |

## 诊断量级偏差的验证计算

一次真实的量级排查：某可压算例的出口温度报告 $T = 311.4\ \mathrm{K}$，入口 $T = 300.0\ \mathrm{K}$，比热 $c_p = 1005\ \mathrm{J/(kg\cdot K)}$，流量 $0.42\ \mathrm{kg/s}$，加热功率设计值 $4.8\ \mathrm{kW}$。由能量平衡，温升应为

$$
\Delta T = \frac{\dot Q}{\dot m\,c_p} = \frac{4800}{0.42\times 1005} = \frac{4800}{422.1} = 11.37\ \mathrm{K}
$$

预测出口温度 $300.0 + 11.37 = 311.37\ \mathrm{K}$，与报告的 $311.4\ \mathrm{K}$ 相差 $0.03\ \mathrm{K}$，相对偏差 $9.6\times 10^{-5}$。这说明热物性、流量与能量源项的量纲与数值彼此自洽。若实测出口为 $341\ \mathrm{K}$，温升 $41\ \mathrm{K}$ 接近计算值的 3.6 倍，最可能的解释是 $c_p$ 被填成了 $\mathrm{J/(kg\cdot K)}$ 的千分之一或流量单位错用，而不是湍流模型的问题。

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

## 参考资料

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Section "Dimensional units and dimensioned types".
2. OpenFOAM Foundation, *OpenFOAM Programmer's Guide*, v14, Chapter "Primitive types: dimensionSet".
3. BIPM, *Le Système international d'unités (SI)*, 9th ed., 2019.
4. ISO, *ISO 80000-1:2009 Quantities and units — Part 1: General*, International Organization for Standardization, 2009.
5. I. Mills, T. Cvitaš, K. Homann, N. Kallay, K. Kuchitsu, *Quantities, Units and Symbols in Physical Chemistry*, 3rd ed., RSC Publishing, 2007.
6. F. P. Incropera, D. P. DeWitt, T. L. Bergman, A. S. Lavine, *Fundamentals of Heat and Mass Transfer*, 6th ed., Wiley, 2007.
7. E. Buckingham, "On physically similar systems; illustrations of the use of dimensional equations", *Physical Review*, 4(4):345–376, 1914.
