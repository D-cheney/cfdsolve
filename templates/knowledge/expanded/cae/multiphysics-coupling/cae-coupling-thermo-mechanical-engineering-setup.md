---
template_version: "flowlab-knowledge/1.0"
slug: cae-coupling-thermo-mechanical-engineering-setup
title: "热固耦合：工程设置与参数选择"
summary: "讲清热固耦合的单向与双向选择依据、温变材料与应力自由温度设置、接触热阻取值与 Abaqus 顺序耦合配置，附参数取值表和失败模式排查。"
category:
  slug: multiphysics-coupling
  name: "多物理场耦合算法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "多物理场耦合算法"
  - "热固耦合"
  - "工程设置与参数选择"
  - "接触热阻"
  - "应力自由温度"
seo:
  title: "热固耦合：工程设置与参数选择"
  description: "讲清热固耦合的单向与双向选择依据、温变材料与应力自由温度设置、接触热阻取值与 Abaqus 顺序耦合配置，附参数取值表和失败模式排查。"
  keywords:
    - "热固耦合"
    - "工程设置与参数选择"
    - "接触热阻"
    - "热应力"
---

# 热固耦合：工程设置与参数选择

热固耦合的失败很少来自求解器，而来自三件事：热应变是否用了正确的应力自由温度、物性是否随温度更新、接触界面的热阻是否被当成零。本文围绕这三条给出可落地的设置流程，包括单向与双向的判据、温变物性表的准备方式、接触热阻的取值依据，以及 Abaqus 顺序耦合的输入写法。

## 单向还是双向：先比时间尺度

热扩散与结构动力学的时间尺度通常相差几个数量级。热扩散率

$$\alpha_{th}=\frac{k}{\rho c_p}$$

对钢取 $k=50\ \mathrm{W/(m\cdot K)}$、$\rho=7850\ \mathrm{kg/m^3}$、$c_p=500\ \mathrm{J/(kg\cdot K)}$，得 $\alpha_{th}=50/(7850\times500)\approx1.27\times10^{-5}\ \mathrm{m^2/s}$。厚度 $L=0.01\ \mathrm{m}$ 的壁，热响应时间 $\tau_{th}=L^2/\alpha_{th}=1\times10^{-4}/1.27\times10^{-5}\approx7.9\ \mathrm{s}$，而结构一阶模态周期常在毫秒量级，两者相差三到四个数量级。

这意味着一般加热工况下温度场先到位、位移随后跟上，用单向顺序耦合（先热后结构）即可。只有三类情形必须双向：结构变形显著改变对流或辐射面积（如大挠度板）、变形改变接触状态从而改变传热路径、以及存在热弹性耦合引起的颤振或热屈曲。判据是变形引起的换热面积变化超过 1%～2%，或接触开合在时程内发生。

## 温变物性与应力自由温度

热应变按

$$\boldsymbol{\varepsilon}^{th}=\alpha(T)\,(T-T_{ref})\,\mathbf{I}$$

计算，$T_{ref}$ 是应力自由温度（也称零应变温度），必须与制造状态一致，而不是默认的 0 ℃。装配件中不同零件的 $T_{ref}$ 可以不同：焊接件取焊后冷却到室温的时刻，螺栓连接件取预紧时的温度。

温变物性至少准备 $E(T)$、$\alpha(T)$、$k(T)$ 三张表，温度点覆盖工况全区间并在变化剧烈段加密。若结构全约束，热应力可用一维公式快速估算：

$$\sigma=\frac{E\,\alpha\,\Delta T}{1-\nu}$$

取 $E=210\ \mathrm{GPa}$、$\alpha=12\times10^{-6}\ \mathrm{K^{-1}}$、$\Delta T=200\ \mathrm{K}$、$\nu=0.3$，得 $\sigma=210\times10^9\times12\times10^{-6}\times200/0.7\approx7.2\times10^8\ \mathrm{Pa}=720\ \mathrm{MPa}$。这已远超普通碳钢约 235 MPa 的屈服强度，说明必须启用塑性，否则应力会被线性弹性高估甚至掩盖真实失效位置。

## 接触热阻不能当零

装配界面存在微观空隙，热流通过时产生温度跳变：

$$q''=\frac{\Delta T}{R_c''}$$

$R_c''$ 是单位面积接触热阻，单位 $\mathrm{m^2\cdot K/W}$。机加工金属干接触的典型值为 $1\times10^{-4}\sim1\times10^{-3}\ \mathrm{m^2\cdot K/W}$，涂导热硅脂后可降到 $1\times10^{-5}$ 量级。取热流密度 $q''=5\times10^4\ \mathrm{W/m^2}$、$R_c''=2\times10^{-4}\ \mathrm{m^2\cdot K/W}$，界面温降 $\Delta T=5\times10^4\times2\times10^{-4}=10\ \mathrm{K}$。同样热流穿过 10 mm 厚钢板的温降为 $q''L/k=5\times10^4\times0.01/50=10\ \mathrm{K}$——也就是说，忽略这个接触面，等效于凭空删掉了 10 mm 钢材。

## Abaqus 顺序耦合设置

单向热固耦合的标准写法是先做传热分析，再把温度场作为预定义场读入静力分析，并显式给出接触导热：

```text
*MATERIAL, NAME=STEEL
*ELASTIC
210.E9, 0.3
*EXPANSION, ZERO=20.
1.2E-5,
*CONDUCTIVITY
50.,
*DENSITY
7850.,
*SPECIFIC HEAT
500.,
**
*SURFACE INTERACTION, NAME=INT1
*GAP CONDUCTANCE
2.E4, 0., 0.
**
*STEP, NLGEOM=ON
*STATIC
1., 60.
*TEMPERATURE, FILE=heatjob, BSTEP=1, ESTEP=1
```

`*EXPANSION, ZERO=20.` 把应力自由温度设为 20 ℃；`*GAP CONDUCTANCE` 的 2.E4 即接触导热系数 $h_c=1/R_c''=2\times10^4\ \mathrm{W/(m^2\cdot K)}$，与上一节的 $R_c''=5\times10^{-5}$ 对应。`*TEMPERATURE, FILE=` 指定从传热作业读取温度场，实现顺序耦合。

## 关键参数取值表

| 参数 | 典型取值 | 依据 |
|---|---|---|
| 应力自由温度 $T_{ref}$ | 制造/装配温度，如 20 ℃ | 与无应力状态一致 |
| 接触热阻 $R_c''$ | $1\times10^{-4}\sim1\times10^{-3}\ \mathrm{m^2K/W}$ | 干接触机加工面 |
| 接触导热系数 $h_c$ | $1\times10^3\sim1\times10^4\ \mathrm{W/(m^2K)}$ | $h_c=1/R_c''$ |
| 辐射发射率 $\epsilon$ | 抛光金属 0.05～0.1，氧化钢 0.8 | 高温工况需计入 |
| 时间步 | $\Delta t\le\tau_{th}/20\approx0.4\ \mathrm{s}$ | 分辨热瞬态 |

## 失败模式与排查

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 温度场合理但应力整体偏大 | 应力自由温度取了默认 0 ℃ | 把 $T_{ref}$ 改为装配温度，看应力是否平移 |
| 装配界面两侧温度完全连续 | 未定义接触热阻 | 在界面插入薄层单元并赋 $k$，对比温降 |
| 应力超过屈服却不收敛 | 未启用塑性 | 加入双线性硬化，检查是否恢复收敛 |
| 物性表外插后结果突变 | 温度点未覆盖工况区间 | 检查最高温是否落在表内 |
| 循环加载后位移不可恢复 | 误用单向耦合忽略塑性累积 | 改为双向或加入随动硬化 |

## 参考文献

1. Boley B.A., Weiner J.H., *Theory of Thermal Stresses*, Wiley, 1960.
2. Hetnarski R.B., Eslami M.R., *Thermal Stresses—Advanced Theory and Applications*, Springer, 2009.
3. Incropera F.P., DeWitt D.P., *Fundamentals of Heat and Mass Transfer*, 5th ed., Wiley, 2002.
4. Zienkiewicz O.C., Taylor R.L., *The Finite Element Method*, Vol. 2, Butterworth-Heinemann, 2000.
5. Dassault Systèmes, *Abaqus Analysis User's Guide*, Section on coupled temperature–displacement analysis.
6. ANSYS Inc., *Mechanical APDL Theory Reference*, Release 2021R2.
