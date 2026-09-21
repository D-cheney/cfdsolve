---
template_version: flowlab-knowledge/1.0
slug: cfd-equations-equation-of-state-modeling
title: 状态方程与热物性闭合：原理与工程设置
summary: >-
  从自由度闭合的角度说明状态方程在方程组中补的是哪一环、热完全与量热完全的分界、维里展开在什么压力下失效，并用声速、范德瓦尔斯常数与临界压缩因子各做一次定量校验。
category:
  slug: governing-equations
  name: 控制方程与物理建模
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 控制方程与物理建模
  - 状态方程与热物性闭合
  - 物理建模与适用边界
  - 维里展开
  - 声速
  - 工程设置与参数选择
  - 压缩因子
  - Peng-Robinson
seo:
  title: 状态方程与热物性闭合：原理与工程设置
  description: >-
    从自由度闭合的角度说明状态方程在方程组中补的是哪一环、热完全与量热完全的分界、维里展开在什么压力下失效，并用声速、范德瓦尔斯常数与临界压缩因子各做一次定量校验。
  keywords:
    - 状态方程与热物性闭合
    - 物理建模与适用边界
    - 维里展开
    - 声速
    - 临界压缩因子
    - 工程设置与参数选择
    - 压缩因子
    - Peng-Robinson
    - Sutherland
---
# 状态方程与热物性闭合：原理与工程设置

可压缩流动的未知量比方程多一个，状态方程的作用正是补上这一环：它把热力学变量之间的自由度锁死，让压力、密度、温度三者只剩两个独立。选错状态方程不会立刻报错，而是通过声速、密度分层和临界点行为悄悄改变解的结构。本文交代这套闭合关系的边界在哪里。物性设置决定的不只是密度数值，而是整条求解路径：理想气体与真实气体对应不同的压力—密度耦合方式，黏度模型决定边界层厚度，$c_p$ 模型决定能量方程的守恒性。

## 状态方程补的是哪一个自由度

可压缩流动的基本未知量是 $\rho$、$\mathbf{u}$、$p$、$T$，共五个标量场（速度算三个）。守恒方程给出质量、动量、能量共五个方程，看似刚好，但能量方程引入的新变量 $T$ 使系统仍然欠定——还需要两个热力学关系把 $(\rho,p,T)$ 约束到二维流形上。这两个关系就是状态方程与量热关系：

$$
p=p(\rho,T),\qquad e=e(\rho,T)
$$

若只给状态方程而不给量热关系，能量方程无法闭合；若两者来自不同来源（例如密度用真实气体、$c_p$ 用常数），就会出现 $c_p-c_v\ne R$ 之类的不自洽，表现为能量收支随工况漂移。建模时必须把两者作为一组来选。

## 用范德瓦尔斯方程检验常数合理性

$$
p=\frac{RT}{v-b}-\frac{a}{v^2},\qquad a=\frac{27R^2T_c^2}{64p_c},\qquad b=\frac{RT_c}{8p_c}
$$

CO$_2$ 取 $R=188.92\ \mathrm{J/(kg\cdot K)}$、$T_c=304.13\ \mathrm{K}$、$p_c=7.377\times10^6\ \mathrm{Pa}$：

$$
a=\frac{27\times188.92^2\times304.13^2}{64\times7.377\times10^6}=\frac{8.913\times10^{10}}{4.721\times10^8}=188.8\ \mathrm{Pa\cdot m^6/kg^2}
$$

$$
b=\frac{188.92\times304.13}{8\times7.377\times10^6}=\frac{57456}{5.902\times10^7}=9.74\times10^{-4}\ \mathrm{m^3/kg}
$$

与 Peng–Robinson 的 $a=204.6$、$b=6.06\times10^{-4}$ 相比，范德瓦尔斯的 $b$ 大了 $61\%$。这个差异的后果在临界压缩因子上暴露得最清楚：范德瓦尔斯方程对任意物质都给出 $Z_c=3/8=0.375$，而 CO$_2$ 的实际值

$$
Z_c=\frac{p_c}{\rho_cRT_c}=\frac{7.377\times10^6}{467.6\times188.92\times304.13}=\frac{7.377\times10^6}{2.687\times10^7}=0.275
$$

实际值只有 $0.275$，比 $0.375$ 低 $27\%$。凡是以临界点附近状态为主要工作点的算例，范德瓦尔斯方程都应被排除。上述四项校验（$Z$、声速、两组常数、临界压缩因子）用一段脚本即可在建模阶段完成：

```python
# 状态方程建模阶段四项校验
import numpy as np

Ru, W   = 8.31446, 0.0440095      # J/(mol*K), kg/mol
R       = Ru / W                  # CO2 气体常数, J/(kg*K)
Tc, pc  = 304.13, 7.377e6         # K, Pa
rho_c   = 467.6                   # 临界密度, kg/m^3

p, T, rho = 6.0e6, 300.0, 190.0   # 工作点
print("Z      =", p / (rho * R * T))                 # 0.557
print("c_ideal=", np.sqrt(1.4 * 287.05 * 300), "m/s")  # 347.2
print("a_vdW  =", 27 * R**2 * Tc**2 / (64 * pc))     # 188.8
print("b_vdW  =", R * Tc / (8 * pc))                 # 9.74e-4
print("Zc     =", pc / (rho_c * R * Tc))             # 0.275
```

输出中 $Z=0.557$ 与 $Z_c=0.275$ 是两条独立的边界信号：前者说明工作点已远离理想气体区，后者说明范德瓦尔斯方程对 CO$_2$ 结构性失效，必须改用 Peng–Robinson 或专用多参数方程。

## 热完全与量热完全是两件事

热完全指满足 $p=\rho RT$，即分子间作用力可忽略、$Z=1$；量热完全进一步要求 $c_p$、$c_v$ 为常数，即分子内部模态未被激发。空气在 $300\ \mathrm{K}$ 时 $c_p=1005\ \mathrm{J/(kg\cdot K)}$，到 $1500\ \mathrm{K}$ 时升到约 $1230\ \mathrm{J/(kg\cdot K)}$，变化 $22\%$——此时热完全仍成立（$Z\approx1$），但量热完全已经失效。判据因此要分开写：$Z$ 检查热完全，$c_p(T)$ 的斜率检查量热完全。

## 维里展开：Z 偏离的两个来源

$$
Z=1+\frac{B(T)}{v}+\frac{C(T)}{v^2}+\cdots
$$

$B$ 是二阶维里系数，反映两分子相互作用；$C$ 反映三体作用。$B$ 的符号和大小决定低压端的偏离方向。

以 CO$_2$ 在 $300\ \mathrm{K}$ 为例，取 $B\approx-120\ \mathrm{cm^3/mol}$。常压 $101325\ \mathrm{Pa}$ 下摩尔体积

$$
v=\frac{R_uT}{p}=\frac{8.31446\times300}{101325}=2.462\times10^{-2}\ \mathrm{m^3/mol}=24620\ \mathrm{cm^3/mol}
$$

于是 $Z=1-120/24620=1-4.9\times10^{-3}$，偏离不到 $0.5\%$——这就是常压下把 CO$_2$ 当理想气体没问题的定量依据。升到 $6\ \mathrm{MPa}$，摩尔体积缩到 $415.7\ \mathrm{cm^3/mol}$，二阶截断给出 $Z=1-120/415.7=0.711$。而该状态的真实值是 $Z=0.557$，截断误差达 $28\%$。原因很清楚：$p/p_c=6.0/7.377=0.81$，已经远离维里级数的收敛区，必须用完整状态方程。维里展开适合的区域大致是 $p/p_c<0.3$。

## 声速：真实气体与理想气体的分歧

声速由等熵压缩率定义：

$$
c^2=\left(\frac{\partial p}{\partial\rho}\right)_s
$$

理想气体给出闭式结果 $c=\sqrt{\gamma RT}$。空气取 $\gamma=1.4$、$R=287.05\ \mathrm{J/(kg\cdot K)}$、$T=300\ \mathrm{K}$：

$$
c=\sqrt{1.4\times287.05\times300}=\sqrt{120561}=347.2\ \mathrm{m/s}
$$

真实气体的声速可能比该值低 $10\%$ 以上（临界点附近急剧下降），而声速又直接进入可压缩求解器的压力—密度耦合与边界条件。用理想气体声速算跨音速喷管，质量流量会系统性偏大。临界点附近还有一个更严重的问题：$(\partial p/\partial\rho)_T\to0$，$c^2$ 可能变号，此时求解器的特征速度失去物理意义，迭代必然失效。因此跨临界算例的第一项检查就是计算 $c^2$ 的符号与量级。

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

## 选型时的三条硬约束

第一，$Z$ 与 1 的偏差超过容差就必须离开理想气体，这一条与温度无关，只看 $(T,p)$ 落在哪个区间。第二，$c^2$ 必须处处为正且量级合理，跨临界算例要在运行前扫描状态空间确认这一点。第三，量热关系与状态方程必须成对选取并满足 $c_p-c_v=R$（理想气体）或其对应形式，否则能量方程会在长时积分中漂移。三条约束都可以在建模阶段用手算完成，不需要跑算例。

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

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 临界点附近迭代始终不收敛 | $(\partial p/\partial\rho)_T$ 趋零，$c^2$ 失去意义 | 在该状态计算 $c^2$ 的符号与量级 |
| 跨音速喷管流量系统性偏大 | 用理想气体声速，真实声速更低 | 比较 $\sqrt{\gamma RT}$ 与真实状态方程给出的 $c$ |
| 维里截断到二阶误差仍达三成 | $p/p_c$ 接近 1，三阶项已不可忽略 | 比较 $B/v$ 与 $C/v^2$ 的相对大小 |
| 范德瓦尔斯方程拟不出临界点 | 该方程强制 $Z_c=0.375$，与实测不符 | 计算 $Z_c=p_c/(\rho_cRT_c)$ 并对比 0.375 |
| 高温段 $c_p$ 常数假设失效 | 振动模态被激发，量热完全不再成立 | 比较 $300\ \mathrm{K}$ 与 $1500\ \mathrm{K}$ 的 $c_p$ |
| 单相求解器在饱和线附近振荡 | 状态方程未覆盖两相区 | 检查状态点是否落入两相包络 |
| 高压算例密度偏低四成 | 用了 `perfectGas`，$Z$ 偏离被忽略 | 由查表密度反算 $Z=p/(\rho RT)$，看是否小于 0.95 |
| 低温段黏度偏差超过一成 | Sutherland 被外推到标定区间之外 | 用两个温度点的实测 $\mu$ 做两点校验 |
| 温度场整体平移一个常数 | 摩尔质量取错，$R$ 随之出错 | 手算 $R=R_u/W$ 并与求解器输出对照 |
| 能量方程与状态方程不自洽 | $c_p-c_v\ne R$，说明两个模型不配套 | 检查字典中 $c_p$、$c_v$、$R$ 是否满足恒等式 |
| 跨临界算例在饱和线附近发散 | 单一状态方程跨越了两相区 | 检查 $T/T_c$ 与 $p/p_c$ 是否落入两相包络内 |
| 多组分算例密度系统性偏差 | 质量分数与摩尔分数混用 | 按 $W=\sum y_iW_i$ 重算混合摩尔质量 |

## 记录与复核

物性设置的可复算记录应包含：$R$ 的计算式与摩尔质量来源；工作点 $(T,p)$ 与对应的 $Z$；$T/T_c$ 与 $p/p_c$ 两个对比值；黏度模型的标定温度区间与当前工况是否落在区间内；以及 $c_p-c_v$ 与 $R$ 的差值。工况压力或温度跨越临界参数的一半时，这几项都必须重算，不能沿用原结论。

## 参考资料

1. van der Waals J.D., Over de Continuïteit van den Gas- en Vloeistoftoestand, PhD thesis, Universiteit Leiden, 1873.
2. Peng D.Y., Robinson D.B., "A new two-constant equation of state", Industrial & Engineering Chemistry Fundamentals, 15(1), 1976, 59-64.
3. Span R., Wagner W., "A new equation of state for carbon dioxide covering the fluid region from the triple-point temperature to 1100 K at pressures up to 800 MPa", Journal of Physical and Chemical Reference Data, 25(6), 1996, 1509-1596.
4. Poling B.E., Prausnitz J.M., O'Connell J.P., The Properties of Gases and Liquids, 5th ed., McGraw-Hill, 2001.
5. Wagner W., Pruß A. 《The IAPWS Formulation 1995 for the Thermodynamic Properties of Ordinary Water Substance for General and Scientific Use》. Journal of Physical and Chemical Reference Data, 2002.
6. Dymond J.H., Marsh K.N., Wilhoit R.C., Wong K.C. 《Virial Coefficients of Pure Gases and Mixtures》. Springer, 2002.
7. Lemmon E.W., Huber M.L., McLinden M.O. 《NIST Reference Fluid Thermodynamic and Transport Properties Database》. NIST Standard Reference Database 23, 2018.
8. White F.M., Viscous Fluid Flow, 3rd ed., McGraw-Hill, 2006.
