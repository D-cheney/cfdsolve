---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-equation-of-state-engineering-setup
title: "状态方程与热物性闭合：工程设置与参数选择"
summary: "给出状态方程选型与物性字典配置的完整判据：用压缩因子决定理想气体能否使用、Sutherland 黏度的适用温度区间、Peng–Robinson 常数的算法，并用空气与高压 CO2 各做一次可核对手算。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "状态方程与热物性闭合"
  - "工程设置与参数选择"
  - "压缩因子"
  - "Peng-Robinson"
seo:
  title: "状态方程与热物性闭合：工程设置与参数选择"
  description: "给出状态方程选型与物性字典配置的完整判据：用压缩因子决定理想气体能否使用、Sutherland 黏度的适用温度区间、Peng–Robinson 常数的算法，并用空气与高压 CO2 各做一次可核对手算。"
  keywords:
    - "状态方程与热物性闭合"
    - "工程设置与参数选择"
    - "压缩因子"
    - "Peng-Robinson"
    - "Sutherland"
---

# 状态方程与热物性闭合：工程设置与参数选择

物性设置决定的不只是密度数值，而是整条求解路径：理想气体与真实气体对应不同的压力—密度耦合方式，黏度模型决定边界层厚度，$c_p$ 模型决定能量方程的守恒性。本文给出选型判据、字典条目与两组可核对的手算，用于在跑算例前先把物性区间框定。

## 先算 R 和 Z，再选模型

气体常数由通用常数与摩尔质量换算：

$$
R=\frac{R_u}{W},\qquad p=\rho RT
$$

$R_u=8.31446\ \mathrm{J/(mol\cdot K)}$。空气 $W=0.0289644\ \mathrm{kg/mol}$：

$$
R=\frac{8.31446}{0.0289644}=287.05\ \mathrm{J/(kg\cdot K)}
$$

$T=300\ \mathrm{K}$、$p=101325\ \mathrm{Pa}$ 时

$$
\rho=\frac{101325}{287.05\times300}=1.1766\ \mathrm{kg/m^3}
$$

真实气体偏离理想行为的程度用压缩因子衡量：

$$
Z=\frac{p}{\rho RT}
$$

经验判据是：$T/T_c>2$ 且 $p/p_c<0.1$ 时 $Z$ 与 1 的偏差通常小于 $2\%$，理想气体可用；超出该区间必须先算 $Z$。以 CO$_2$ 为例，$T_c=304.13\ \mathrm{K}$、$p_c=7.377\ \mathrm{MPa}$，故门槛约为 $T>608\ \mathrm{K}$、$p<0.74\ \mathrm{MPa}$。

## 手算：6 MPa CO2 的压缩因子

$T=300\ \mathrm{K}$、$p=6.0\ \mathrm{MPa}$ 时，理想气体给出

$$
\rho_{\mathrm{id}}=\frac{6.0\times10^{6}}{188.92\times300}=105.9\ \mathrm{kg/m^3}
$$

其中 CO$_2$ 的 $R=8.31446/0.0440095=188.92\ \mathrm{J/(kg\cdot K)}$。查 NIST/REFPROP 数据表得该状态密度 $\rho=190.0\ \mathrm{kg/m^3}$，于是

$$
Z=\frac{6.0\times10^{6}}{190.0\times188.92\times300}=0.557
$$

$Z=0.557$ 意味着理想气体把比容高估了 $(190.0-105.9)/190.0=44\%$。这个量级的误差不可能靠调网格或湍流模型补救，必须换真实气体状态方程。

## Peng–Robinson 常数怎么算

$$
p=\frac{RT}{v-b}-\frac{a\alpha(T)}{v^2+2bv-b^2}
$$

$$
a=0.45724\frac{R^2T_c^2}{p_c},\qquad b=0.07780\frac{RT_c}{p_c}
$$

代入 CO$_2$ 的 $T_c=304.13\ \mathrm{K}$、$p_c=7.377\times10^6\ \mathrm{Pa}$、$R=188.92\ \mathrm{J/(kg\cdot K)}$：

$$
a=0.45724\times\frac{188.92^2\times304.13^2}{7.377\times10^6}=\frac{1.509\times10^9}{7.377\times10^6}=204.6\ \mathrm{Pa\cdot m^6/kg^2}
$$

$$
b=0.07780\times\frac{188.92\times304.13}{7.377\times10^6}=0.07780\times7.789\times10^{-3}=6.06\times10^{-4}\ \mathrm{m^3/kg}
$$

$b$ 是排斥体积，可直接与临界比容对照：$b/v_c$ 对 PR 约为 0.25，而范德瓦尔斯取 1/3。这两个常数只依赖临界参数与偏心因子 $\omega$，写进字典即可：

```
// constant/thermophysicalProperties —— 高压 CO2
thermoType
{
    type            heRhoThermo;
    mixture         pureMixture;
    transport       const;
    thermo          hConst;
    equationOfState PengRobinsonGas;
    specie          specie;
    energy          sensibleEnthalpy;
}
mixture
{
    specie            { molWeight 44.00995; }
    equationOfState   { Tc 304.13; pc 7.377e+06; omega 0.2238; }
    thermodynamics    { Cp 900; Hf 0; }
    transport         { mu 1.50e-05; Pr 0.75; }
}
```

温度跨度超过 $200\ \mathrm{K}$ 时把 `hConst` 换成 `janaf` 或 `hPolynomial`，否则 $c_p$ 的常数假设会与状态方程不一致。

## Sutherland 黏度与它的适用区间

$$
\mu=\mu_0\left(\frac{T}{T_0}\right)^{3/2}\frac{T_0+S}{T+S}
$$

空气取 $\mu_0=1.716\times10^{-5}\ \mathrm{Pa\cdot s}$（$T_0=273.15\ \mathrm{K}$）、$S=110.4\ \mathrm{K}$。$T=350\ \mathrm{K}$ 时：

$$
\mu=1.716\times10^{-5}\times\left(\frac{350}{273.15}\right)^{1.5}\times\frac{383.55}{460.4}
$$

其中 $(350/273.15)^{1.5}=1.2814^{1.5}=1.4505$，$383.55/460.4=0.8331$，故

$$
\mu=1.716\times10^{-5}\times1.4505\times0.8331=2.07\times10^{-5}\ \mathrm{Pa\cdot s}
$$

与空气在 $350\ \mathrm{K}$ 的实测值 $2.08\times10^{-5}\ \mathrm{Pa\cdot s}$ 相符。Sutherland 的标定区间大致是 $170\ \mathrm{K}$ 到 $1900\ \mathrm{K}$，低温端（接近液化温度）与高温离解区都会失准；把温度外推到区间外时，误差会以百分之十计。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 高压算例密度偏低四成 | 用了 `perfectGas`，$Z$ 偏离被忽略 | 由查表密度反算 $Z=p/(\rho RT)$，看是否小于 0.95 |
| 低温段黏度偏差超过一成 | Sutherland 被外推到标定区间之外 | 用两个温度点的实测 $\mu$ 做两点校验 |
| 温度场整体平移一个常数 | 摩尔质量取错，$R$ 随之出错 | 手算 $R=R_u/W$ 并与求解器输出对照 |
| 能量方程与状态方程不自洽 | $c_p-c_v\ne R$，说明两个模型不配套 | 检查字典中 $c_p$、$c_v$、$R$ 是否满足恒等式 |
| 跨临界算例在饱和线附近发散 | 单一状态方程跨越了两相区 | 检查 $T/T_c$ 与 $p/p_c$ 是否落入两相包络内 |
| 多组分算例密度系统性偏差 | 质量分数与摩尔分数混用 | 按 $W=\sum y_iW_i$ 重算混合摩尔质量 |

## 记录与复核

物性设置的可复算记录应包含：$R$ 的计算式与摩尔质量来源；工作点 $(T,p)$ 与对应的 $Z$；$T/T_c$ 与 $p/p_c$ 两个对比值；黏度模型的标定温度区间与当前工况是否落在区间内；以及 $c_p-c_v$ 与 $R$ 的差值。工况压力或温度跨越临界参数的一半时，这几项都必须重算，不能沿用原结论。

## 参考资料

1. Peng D.Y., Robinson D.B., "A new two-constant equation of state", Industrial & Engineering Chemistry Fundamentals, 15(1), 1976, 59-64.
2. Poling B.E., Prausnitz J.M., O'Connell J.P., The Properties of Gases and Liquids, 5th ed., McGraw-Hill, 2001.
3. White F.M., Viscous Fluid Flow, 3rd ed., McGraw-Hill, 2006.
4. Span R., Wagner W., "A new equation of state for carbon dioxide covering the fluid region from the triple-point temperature to 1100 K at pressures up to 800 MPa", Journal of Physical and Chemical Reference Data, 25(6), 1996, 1509-1596.
