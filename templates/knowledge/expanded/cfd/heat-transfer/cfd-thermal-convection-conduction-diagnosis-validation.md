---
template_version: "flowlab-knowledge/1.0"
slug: cfd-thermal-convection-conduction-diagnosis-validation
title: "导热与对流耦合：结果诊断与可信度验证"
summary: "给出一套对流—导热结果的核对流程：统一换热系数与体温度的定义，用壁面热流、进出口焓差与 GCI 三条线闭合，并由实测壁面热流反算 h 与 Nu，与 Dittus–Boelter 对照后给出可接受的偏差区间。"
category:
  slug: heat-transfer
  name: "传热与可压缩流"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "传热与可压缩流"
  - "导热与对流耦合"
  - "结果诊断与可信度验证"
  - "换热系数提取"
  - "网格收敛指数"
seo:
  title: "导热与对流耦合：结果诊断与可信度验证"
  description: "给出一套对流—导热结果的核对流程：统一换热系数与体温度的定义，用壁面热流、进出口焓差与 GCI 三条线闭合，并由实测壁面热流反算 h 与 Nu，与 Dittus–Boelter 对照后给出可接受的偏差区间。"
  keywords:
    - "导热与对流耦合"
    - "结果诊断与可信度验证"
    - "换热系数提取"
    - "网格收敛指数"
    - "能量平衡"
---

# 导热与对流耦合：结果诊断与可信度验证

对流—导热算例很少因为跑不动而失败，多数是因为提取口径不统一：同一份流场，用节点温度反算和用壁面热流反算可以得到相差 20% 的换热系数。本文给出一套可执行的核对流程——先统一 $h$ 的定义，再用三条线闭合能量，最后由实测热流反算并与关联式对照。

## 先统一换热系数的提取口径

壁面换热系数必须写成同一套定义：

$$
h=\frac{q''_w}{T_w-T_b},\qquad T_b=\frac{\int_A \rho c_p u T\,dA}{\int_A \rho c_p u\,dA}
$$

$q''_w$ 是壁面法向热流，进流体为正；$T_w$ 是壁面温度；$T_b$ 是质量加权体温度。三个量里最容易出错的是 $T_b$：若用面积平均温度代替质量加权温度，在热入口段会低估 $T_b$ 若干开尔文，进而高估 $h$。参考温度一旦改变，得到的 Nusselt 数

$$
Nu=\frac{hD}{k}
$$

也随之改变，所以 $h$、$T_b$、$k$ 的取值温度必须写在报告同一行。$k$ 建议取膜温 $T_f=(T_w+T_b)/2$ 下的值，空气在 300 K 附近约为 $0.026\ \mathrm{W/(m\cdot K)}$。

## 三条线必须同时闭合

对一段受热通道，稳态下应同时满足

$$
\dot Q_{wall}=\int_{A_w} q''_w\,dA=\dot m c_p(T_{out}-T_{in})=\dot Q_{fluid}
$$

$\dot Q_{wall}$ 由壁面热流积分得到，$\dot Q_{fluid}$ 由进出口焓差得到，两者相对偏差应低于 1%。若壁面还有辐射，需要在 $\dot Q_{wall}$ 中把对流份额与辐射份额分开列出。最容易被忽略的是高 $y^+$ 壁面处理：此时 $q''_w$ 由壁面函数直接给出，若再叠加一个解析对流项就是重复计算，能量收支会凭空多出一块。

## 与关联式对照时留多少容差

工程上把 $Nu$ 与 Dittus–Boelter 对照，容差取 ±10% 是合理的：

$$
Nu_{DB}=0.023\,Re^{0.8}Pr^{0.4}
$$

关联式本身有 ±15% 的散布，网格与湍流模型再贡献几个百分点。偏差超过 15% 时应先怀疑提取口径与边界条件，而不是格式精度；偏差小于 1% 时反而要怀疑是不是把关联式直接当成了壁面热流的输入——两者完全重合通常意味着 $q''_w$ 并非解出来的。

## 网格与壁面处理引起的伪收敛

换热系数对壁面首层高度比对全局网格数敏感得多。做网格收敛时至少取三套，按 Richardson 外推估计离散误差：

$$
\mathrm{GCI}=\frac{F_s|\varepsilon|}{r^p-1},\qquad \varepsilon=\frac{f_2-f_1}{f_1}
$$

$r$ 为网格细化比，$p$ 为表观收敛阶，$F_s$ 取安全因子 1.25。壁面处理的切换会带来阶跃变化：$y^+$ 从 1 变到 40 时 $p$ 会明显偏离 2，此时应先把壁面处理固定，再谈网格收敛。三套网格的 $Nu$ 可取 $36.8$、$38.1$、$38.5$（$r=1.5$），则 $\varepsilon=(38.5-38.1)/38.1=1.05\%$，$\mathrm{GCI}=1.25\times0.0105/(1.5^2-1)=1.31\%$。

## 一次可核对的反算：由壁面热流推 h、Nu 与偏差

取空气（$k=0.026\ \mathrm{W/(m\cdot K)}$、$Pr=0.71$、$\nu=1.8\times10^{-5}\ \mathrm{m^2/s}$）在内径 $D=0.02\ \mathrm{m}$ 的圆管中流动，$Re=20000$。CFD 提取到 $q''_w=1502\ \mathrm{W/m^2}$、$T_w=350.0\ \mathrm{K}$、$T_b=320.0\ \mathrm{K}$。

$$
h=\frac{1502}{350.0-320.0}=\frac{1502}{30.0}=50.07\ \mathrm{W/(m^2\cdot K)}
$$

$$
Nu=\frac{50.07\times0.02}{0.026}=38.5
$$

关联式给出 $Re^{0.8}=2043$、$Pr^{0.4}=0.872$，故 $Nu_{DB}=0.023\times2043\times0.872=41.0$。偏差 $(38.5-41.0)/41.0=-6.1\%$，落在 ±10% 容差内，说明提取口径与壁面处理基本一致。

再用能量平衡交叉核对：平均流速 $U=Re\,\nu/D=20000\times1.8\times10^{-5}/0.02=18\ \mathrm{m/s}$，截面积 $A=\pi D^2/4=3.142\times10^{-4}\ \mathrm{m^2}$，密度取 $\rho=1.16\ \mathrm{kg/m^3}$，则 $\dot m=1.16\times18\times3.142\times10^{-4}=6.56\times10^{-3}\ \mathrm{kg/s}$。若进出口温差 $\Delta T_b=40\ \mathrm{K}$、$c_p=1007\ \mathrm{J/(kg\cdot K)}$，则 $\dot Q_{fluid}=6.56\times10^{-3}\times1007\times40=264.3\ \mathrm{W}$。壁面需提供同样功率，所需换热长度

$$
L=\frac{\dot Q}{q''_w\pi D}=\frac{264.3}{1502\times0.0628}=2.80\ \mathrm{m}
$$

两个数一致，热平衡闭合。

```python
q_w, Tw, Tb = 1502.0, 350.0, 320.0
k, D, Re, Pr, nu = 0.026, 0.02, 20000.0, 0.71, 1.8e-5
h = q_w / (Tw - Tb)                  # 50.07 W/(m^2*K)
Nu = h * D / k                       # 38.5
Nu_db = 0.023 * Re**0.8 * Pr**0.4    # 41.0
dev = (Nu - Nu_db) / Nu_db * 100
U = Re * nu / D
mdot = 1.16 * U * 3.14159 * D**2 / 4
print(Nu, Nu_db, dev, U, mdot)
```

```bash
# OpenFOAM：分别取壁面热流、体温度与壁温，再做外部反算
postProcess -func "wallHeatFlux" -time 2000
postProcess -func "fieldMinMax(T)" -time 2000
postProcess -func "volFieldValue(volFieldValue1)" -time 2000
```

## 诊断表：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $h$ 随壁面法向网格加密下降 15% | 首层过厚，壁面温度取自第一个节点而非壁面 | 用壁面热流与壁面温度反算 $h$，做三套网格对比 |
| 沿程 $Nu$ 出现台阶状跳变 | 局部 $T_b$ 用面积平均，采样面位置不一致 | 统一改为质量加权体温度并固定采样面 |
| $\dot Q_{wall}$ 与 $\dot Q_{fluid}$ 差 8% | 入口段轴向导热或壁面辐射未计入 | 关闭辐射重算，检查入口段温度剖面 |
| 三套网格的 $p$ 只有 0.8 | 壁面处理随网格切换，误差不单调 | 固定 $y^+$ 区间后重新做网格收敛 |
| 与关联式偏差 25% 但残差很低 | 关联式超域（$Re<10^4$）或物性取错温度 | 打印 $Re$、$Pr$ 与膜温，按膜温重取物性 |

## 验证报告要留下哪些量

报告里至少并列 $Re$、$Pr$、$y^+$、$T_b$ 的定义、$k$ 的取值温度、$\dot Q_{wall}$ 与 $\dot Q_{fluid}$、三套网格的 $Nu$ 与 GCI，以及所用关联式的适用区间。缺任何一项，后续读者都无法判断这 6% 的偏差来自物性还是提取口径。把 GCI 与关联式容差放在同一张表里，可以直接读出离散误差与模型误差谁更大。

## 参考文献

1. ASME, *V&V 20-2009: Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, American Society of Mechanical Engineers, 2009.
2. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
3. Celik I.B., Ghia U., Roache P.J., Freitas C.J., "Procedure for estimation and reporting of uncertainty due to discretization in CFD applications", *Journal of Fluids Engineering*, 130(7), 078001, 2008.
4. Kader B.A., "Temperature and concentration profiles in fully turbulent boundary layers", *International Journal of Heat and Mass Transfer*, 24(9), 1541–1544, 1981.
5. Bejan A., *Convection Heat Transfer*, 4th ed., Wiley, 2013.
6. Churchill S.W., "A comprehensive correlating equation for forced convection from flat plates", *AIChE Journal*, 22(2), 264–268, 1976.
