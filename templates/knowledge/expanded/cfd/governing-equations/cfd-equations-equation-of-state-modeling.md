---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-equation-of-state-modeling
title: "状态方程与热物性闭合：物理建模与适用边界"
summary: "从自由度闭合的角度说明状态方程在方程组中补的是哪一环、热完全与量热完全的分界、维里展开在什么压力下失效，并用声速、范德瓦尔斯常数与临界压缩因子各做一次定量校验。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "状态方程与热物性闭合"
  - "物理建模与适用边界"
  - "维里展开"
  - "声速"
seo:
  title: "状态方程与热物性闭合：物理建模与适用边界"
  description: "从自由度闭合的角度说明状态方程在方程组中补的是哪一环、热完全与量热完全的分界、维里展开在什么压力下失效，并用声速、范德瓦尔斯常数与临界压缩因子各做一次定量校验。"
  keywords:
    - "状态方程与热物性闭合"
    - "物理建模与适用边界"
    - "维里展开"
    - "声速"
    - "临界压缩因子"
---

# 状态方程与热物性闭合：物理建模与适用边界

可压缩流动的未知量比方程多一个，状态方程的作用正是补上这一环：它把热力学变量之间的自由度锁死，让压力、密度、温度三者只剩两个独立。选错状态方程不会立刻报错，而是通过声速、密度分层和临界点行为悄悄改变解的结构。本文交代这套闭合关系的边界在哪里。

## 状态方程补的是哪一个自由度

可压缩流动的基本未知量是 $\rho$、$\mathbf{u}$、$p$、$T$，共五个标量场（速度算三个）。守恒方程给出质量、动量、能量共五个方程，看似刚好，但能量方程引入的新变量 $T$ 使系统仍然欠定——还需要两个热力学关系把 $(\rho,p,T)$ 约束到二维流形上。这两个关系就是状态方程与量热关系：

$$
p=p(\rho,T),\qquad e=e(\rho,T)
$$

若只给状态方程而不给量热关系，能量方程无法闭合；若两者来自不同来源（例如密度用真实气体、$c_p$ 用常数），就会出现 $c_p-c_v\ne R$ 之类的不自洽，表现为能量收支随工况漂移。建模时必须把两者作为一组来选。

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

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 临界点附近迭代始终不收敛 | $(\partial p/\partial\rho)_T$ 趋零，$c^2$ 失去意义 | 在该状态计算 $c^2$ 的符号与量级 |
| 跨音速喷管流量系统性偏大 | 用理想气体声速，真实声速更低 | 比较 $\sqrt{\gamma RT}$ 与真实状态方程给出的 $c$ |
| 维里截断到二阶误差仍达三成 | $p/p_c$ 接近 1，三阶项已不可忽略 | 比较 $B/v$ 与 $C/v^2$ 的相对大小 |
| 范德瓦尔斯方程拟不出临界点 | 该方程强制 $Z_c=0.375$，与实测不符 | 计算 $Z_c=p_c/(\rho_cRT_c)$ 并对比 0.375 |
| 高温段 $c_p$ 常数假设失效 | 振动模态被激发，量热完全不再成立 | 比较 $300\ \mathrm{K}$ 与 $1500\ \mathrm{K}$ 的 $c_p$ |
| 单相求解器在饱和线附近振荡 | 状态方程未覆盖两相区 | 检查状态点是否落入两相包络 |

## 选型时的三条硬约束

第一，$Z$ 与 1 的偏差超过容差就必须离开理想气体，这一条与温度无关，只看 $(T,p)$ 落在哪个区间。第二，$c^2$ 必须处处为正且量级合理，跨临界算例要在运行前扫描状态空间确认这一点。第三，量热关系与状态方程必须成对选取并满足 $c_p-c_v=R$（理想气体）或其对应形式，否则能量方程会在长时积分中漂移。三条约束都可以在建模阶段用手算完成，不需要跑算例。

## 参考资料

1. van der Waals J.D., Over de Continuïteit van den Gas- en Vloeistoftoestand, PhD thesis, Universiteit Leiden, 1873.
2. Peng D.Y., Robinson D.B., "A new two-constant equation of state", Industrial & Engineering Chemistry Fundamentals, 15(1), 1976, 59-64.
3. Span R., Wagner W., "A new equation of state for carbon dioxide covering the fluid region from the triple-point temperature to 1100 K at pressures up to 800 MPa", Journal of Physical and Chemical Reference Data, 25(6), 1996, 1509-1596.
4. Poling B.E., Prausnitz J.M., O'Connell J.P., The Properties of Gases and Liquids, 5th ed., McGraw-Hill, 2001.
5. Wagner W., Pruß A. 《The IAPWS Formulation 1995 for the Thermodynamic Properties of Ordinary Water Substance for General and Scientific Use》. Journal of Physical and Chemical Reference Data, 2002.
6. Dymond J.H., Marsh K.N., Wilhoit R.C., Wong K.C. 《Virial Coefficients of Pure Gases and Mixtures》. Springer, 2002.
7. Lemmon E.W., Huber M.L., McLinden M.O. 《NIST Reference Fluid Thermodynamic and Transport Properties Database》. NIST Standard Reference Database 23, 2018.
