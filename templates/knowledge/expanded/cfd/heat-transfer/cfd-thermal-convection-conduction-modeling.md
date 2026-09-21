---
template_version: "flowlab-knowledge/1.0"
slug: cfd-thermal-convection-conduction-modeling
title: "导热与对流耦合：物理建模与适用边界"
summary: "从能量方程的对流项与导热项量级出发，用 Pe、Bi、Nu 与热入口长度划出耦合传热的模型层级，给出层流管内换热的解析锚点、Dittus–Boelter 与 Gnielinski 的适用区间，并完成一次水—钢管算例的完整量级估算。"
category:
  slug: heat-transfer
  name: "传热与可压缩流"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "传热与可压缩流"
  - "导热与对流耦合"
  - "物理建模与适用边界"
  - "Peclet数"
  - "热入口长度"
seo:
  title: "导热与对流耦合：物理建模与适用边界"
  description: "从能量方程的对流项与导热项量级出发，用 Pe、Bi、Nu 与热入口长度划出耦合传热的模型层级，给出层流管内换热的解析锚点、Dittus–Boelter 与 Gnielinski 的适用区间，并完成一次水—钢管算例的完整量级估算。"
  keywords:
    - "导热与对流耦合"
    - "物理建模与适用边界"
    - "Peclet数"
    - "热入口长度"
    - "Nusselt数"
---

# 导热与对流耦合：物理建模与适用边界

对流与导热不是可以随意取舍的两种传热方式，它们在同一控制体内按热阻并联：只要流体在动，对流项就一定存在；只有当 Peclet 数小到导热能在流动方向上把热量铺开时，轴向导热才重新变成主导。本文给出判断谁主导的三个无量纲数、层流管内的解析锚点，以及一次可以直接复算的水—钢管估算。

## 对流项与导热项在同一控制体内的分工

不可压缩、常物性的能量方程写为

$$
\rho c_p\left(\frac{\partial T}{\partial t}+\mathbf{u}\cdot\nabla T\right)=\nabla\cdot(k\nabla T)+\Phi+q_v
$$

左端括号内第一项是当地储能、第二项是对流携带；右端依次是导热、黏性耗散与体源。把方程无量纲化后，对流项与导热项之比就是 Peclet 数：

$$
Pe=Re\,Pr=\frac{UL}{\alpha},\qquad \alpha=\frac{k}{\rho c_p}
$$

$\alpha$ 为热扩散率，单位 $\mathrm{m^2/s}$。$Pe\gg1$ 表示热量主要被流动带走，温度场由上游历史决定；$Pe\lesssim10$ 表示轴向导热不可忽略，此时用抛物型边界层近似会在入口段产生系统偏差。需要注意：$Pe$ 判断的是流向对流与导热的竞争，而壁面法向的换热强度由 Nusselt 数给出：

$$
Nu=\frac{hL}{k}
$$

$Nu$ 是壁面附近温度梯度的无量纲化，它不回答谁主导，只回答边界上换了多少热。把两者混为一谈，是建模阶段最常见的误判来源。

## 三个阈值决定要不要建流体域、要不要建固体域

第一组是 $Pe$。$Pe>100$ 时可用边界层式的一维对流模型；$Pe<10$ 时必须保留轴向导热，短通道、液态金属与微通道常落在这个区间。

第二组是毕渥数

$$
Bi=\frac{hL_c}{k_s}
$$

$L_c$ 取固体体积除以换热面积。$Bi<0.1$ 时固体内部温度梯度小于表面温差的 10%，可以用集中参数或等温壁；$0.1<Bi<10$ 时必须显式建固体域；$Bi>10$ 时固体内部导热成为瓶颈，表面换热系数的不确定性反而次要。

第三组是热入口长度。层流管内热边界层充分发展所需的长度约为

$$
L_t\approx0.05\,Re\,Pr\,D
$$

$L_t/D<10$ 时可近似认为充分发展，直接用常数 $Nu$；否则沿程 $Nu$ 会明显高于充分发展值，必须按局部值处理。这一条直接决定"能不能套充分发展关联式"。

## 层流管内的解析锚点

充分发展层流管内换热的两个精确解是校验一切数值结果的基准：壁温恒定时 $Nu=3.66$，壁面热流恒定时 $Nu=4.36$。它们与 $Re$、$Pr$ 无关，只依赖边界类型，因此是判断"算例是否真的进入充分发展区"的第一把尺子。

湍流区间的工程关联式是 Dittus–Boelter

$$
Nu=0.023\,Re^{0.8}Pr^{n}
$$

加热时 $n=0.4$，冷却时 $n=0.3$。它的适用范围是 $Re>10^4$、$0.7<Pr<160$、$L/D>10$；用它算层流或过渡区会高估换热系数 30% 以上。更宽的区间用 Gnielinski 式：

$$
Nu=\frac{(f/8)(Re-1000)Pr}{1+12.7\sqrt{f/8}\left(Pr^{2/3}-1\right)},\qquad f=(0.79\ln Re-1.64)^{-2}
$$

它覆盖 $3000<Re<5\times10^6$、$0.5<Pr<2000$，在过渡区给出连续结果，因此算例落在 $Re=2000\sim10000$ 时应优先用它。

## 量级估算：内径 20 mm 水管中的 Pe 与热入口长度

取常温水：$\rho=997\ \mathrm{kg/m^3}$、$c_p=4180\ \mathrm{J/(kg\cdot K)}$、$k=0.60\ \mathrm{W/(m\cdot K)}$、$\nu=8.57\times10^{-7}\ \mathrm{m^2/s}$，$Pr=5.83$。管径 $D=0.02\ \mathrm{m}$，平均流速 $U=0.02\ \mathrm{m/s}$。

先算热扩散率：

$$
\alpha=\frac{0.60}{997\times4180}=1.44\times10^{-7}\ \mathrm{m^2/s}
$$

再算 Reynolds 数与 Peclet 数：

$$
Re=\frac{UD}{\nu}=\frac{0.02\times0.02}{8.57\times10^{-7}}=467,\qquad Pe=\frac{UD}{\alpha}=\frac{0.02\times0.02}{1.44\times10^{-7}}=2778
$$

$Re=467$ 属于层流，$Pe=2778\gg1$，说明流向对流远强于轴向导热，可用抛物型模型。但热入口长度不能忽略：

$$
L_t\approx0.05\times467\times5.83\times0.02=2.72\ \mathrm{m}
$$

即 $L_t/D\approx136$。对一根 1 m 长的换热管，出口处热边界层远未充分发展，若直接套 $Nu=3.66$ 会低估换热 2 倍以上，此时应改用沿程局部解或 Shah 关联式。

反过来算一次充分发展区的换热系数：$h=Nu\,k/D=3.66\times0.60/0.02=110\ \mathrm{W/(m^2\cdot K)}$。再由 Stanton 数核对：

$$
St=\frac{Nu}{Re\,Pr}=\frac{3.66}{467\times5.83}=1.35\times10^{-3},\qquad h=St\,\rho c_p U=1.35\times10^{-3}\times997\times4180\times0.02=113\ \mathrm{W/(m^2\cdot K)}
$$

两条路径相差 3%，说明单位与定义一致。

```python
rho, cp, k, nu, Pr = 997.0, 4180.0, 0.60, 8.57e-7, 5.83
D, U = 0.02, 0.02
alpha = k / (rho * cp)          # 1.44e-7 m^2/s
Re = U * D / nu                 # 467
Pe = U * D / alpha              # 2778
Lt = 0.05 * Re * Pr * D         # 2.72 m
Nu_fd = 3.66                    # 恒壁温充分发展层流
h = Nu_fd * k / D               # 110 W/(m^2*K)
St = Nu_fd / (Re * Pr)          # 1.35e-3
h_chk = St * rho * cp * U       # 113 W/(m^2*K)
print(alpha, Re, Pe, Lt, h, St, h_chk)
```

## 耦合传热的失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 用 Dittus–Boelter 得到的 $Nu$ 比 CFD 高 30% 以上 | 算例 $Re<10^4$ 已进入层流或过渡区，关联式超域 | 打印 $Re$ 与 $L/D$，越界则换 Gnielinski 或层流解析值 |
| 沿程换热系数从入口到出口下降数倍 | 热入口段未发展，局部 $Nu$ 远高于充分发展值 | 提取沿程局部 $h$，检查是否落在 $L_t$ 之内 |
| 加密网格后 $Nu$ 单调上升且不收敛 | 壁面首层过厚，或 $h$ 由节点温度而非热流反算 | 改用壁面热流积分反算 $h$，并做三套网格对比 |
| $Pe<10$ 时出口焓高于入口能量平衡值 | 轴向导热被丢弃，入口预热未计入 | 加密轴向网格，比较含与不含轴向导热项的解 |
| 液体算例用常物性却偏差 15% | 黏度随温度变化改变了近壁速度剖面 | 以膜温 $T_f=(T_w+T_b)/2$ 重新取物性重算 |

## 边界条件与物性的适用区间

关联式给出的是局部换热系数，边界类型决定用哪个解：恒定壁温对应 $Nu=3.66$，恒定热流对应 $Nu=4.36$，两者在 $L_t$ 内差异可达 20%。物性一律取膜温，气体还需考虑 $k\propto T^{0.7\sim0.8}$ 的弱温变。当 $Bi$ 落在 $0.1\sim10$ 之间时，固体侧温降与流体侧温降同量级，必须双向耦合求解，任何单侧假设都会把误差推到 10% 以上。

## 参考文献

1. Incropera F.P., DeWitt D.P., Bergman T.L., Lavine A.S., *Fundamentals of Heat and Mass Transfer*, 7th ed., Wiley, 2011.
2. Gnielinski V., "New equations for heat and mass transfer in turbulent pipe and channel flow", *International Chemical Engineering*, 16(2), 359–368, 1976.
3. Dittus F.W., Boelter L.M.K., "Heat transfer in automobile radiators of the tubular type", *University of California Publications in Engineering*, 2, 443–461, 1930.
4. Shah R.K., London A.L., *Laminar Flow Forced Convection in Ducts*, Academic Press, 1978.
5. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
6. Moffat R.J., "Describing the uncertainties in experimental results", *Experimental Thermal and Fluid Science*, 1(1), 3–17, 1988.
