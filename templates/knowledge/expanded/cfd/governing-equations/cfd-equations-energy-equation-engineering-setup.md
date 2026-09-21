---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-energy-equation-engineering-setup
title: "总能量与焓方程：工程设置与参数选择"
summary: "把能量方程落到字典与参数：显焓、绝对焓与总能量各适合什么工况，湍流普朗特数怎么取，黏性耗散在多大流速下才可忽略，并给出空气滞止温升与布林克曼数的完整手算。"
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
  - "总能量与焓方程"
  - "工程设置与参数选择"
  - "湍流普朗特数"
  - "黏性耗散"
seo:
  title: "总能量与焓方程：工程设置与参数选择"
  description: "把能量方程落到字典与参数：显焓、绝对焓与总能量各适合什么工况，湍流普朗特数怎么取，黏性耗散在多大流速下才可忽略，并给出空气滞止温升与布林克曼数的完整手算。"
  keywords:
    - "总能量与焓方程"
    - "工程设置与参数选择"
    - "湍流普朗特数"
    - "黏性耗散"
    - "sensibleEnthalpy"
---

# 总能量与焓方程：工程设置与参数选择

能量方程的设置错误很少表现为发散，更多表现为"温度场看着对、壁面热流差 20%"。原因集中在三处：求解变量选错、湍流普朗特数照抄默认值、以及该保留的黏性耗散被关掉。下面按这三个问题给出取值依据与自检方法。

## 求解变量选哪一个

三种形式的差别只在压力功与动能的处理方式。总能量形式最完整：

$$
\frac{\partial(\rho E)}{\partial t}+\nabla\cdot(\rho\mathbf{u}E)=-\nabla\cdot(p\mathbf{u})+\nabla\cdot(\boldsymbol{\tau}\cdot\mathbf{u})+\nabla\cdot(k\nabla T)+S_h
$$

焓形式把压力功显式写出，工程上更常用：

$$
\frac{\partial(\rho h)}{\partial t}+\nabla\cdot(\rho\mathbf{u}h)=\frac{\mathrm{D}p}{\mathrm{D}t}+\nabla\cdot(k\nabla T)+\Phi,\qquad \Phi=\boldsymbol{\tau}:\nabla\mathbf{u}
$$

显焓 $h_s$ 则是把生成焓剔除后的部分：

$$
h_s=\int_{T_{\mathrm{ref}}}^{T}c_p\,\mathrm{d}T
$$

选择规则很直接：有化学反应、需要组分生成焓时用绝对焓（`absoluteEnthalpy`）；单组分无反应、只关心温升时用显焓（`sensibleEnthalpy`），可少一次生成焓查表；马赫数超过 0.3 或存在激波时用总能量（`totalEnergy`），因为焓形式需要额外处理动能通量，容易在强压缩区失配。

## 字典条目与格式设置

```
// constant/thermophysicalProperties
thermoType
{
    type            hePsiThermo;
    mixture         pureMixture;
    transport       sutherland;
    thermo          janaf;
    equationOfState perfectGas;
    specie          specie;
    energy          sensibleEnthalpy;
}

// constant/momentumTransport（湍流普朗特数）
Prt             0.85;

// system/fvSchemes —— 焓与动能通量必须同阶，否则总温会漂
divSchemes
{
    div(phi,U)      Gauss limitedLinearV 1;
    div(phi,h)      Gauss limitedLinear 1;
    div(phi,K)      Gauss limitedLinear 1;
}

// system/controlDict —— 壁面热流必须用函数对象显式记录
functions
{
    wallHeatFlux
    {
        type            wallHeatFlux;
        libs            ("libfieldFunctionObjects.so");
        patches         (wall);
    }
}
```

`Prt = 0.85` 是空气、水和多数气体的合理默认值（雷诺比拟给出的典型值 0.85～0.9）。液态金属是明确例外：$Pr\sim10^{-2}$，其湍流普朗特数接近 0.01 量级，沿用 0.85 会让壁面热流被低估数倍。钠钾合金、锂、铅铋等冷却剂算例必须先查 `Prt` 再跑。

## 手算：黏性耗散什么时候可以关掉

空气取 $c_p=1005\ \mathrm{J/(kg\cdot K)}$。黏性耗散会把动能转成内能，等效温升由滞止温度给出：

$$
\Delta T_{\mathrm{stag}}=\frac{U^2}{2c_p}
$$

$U=30\ \mathrm{m/s}$ 时

$$
\Delta T_{\mathrm{stag}}=\frac{30^2}{2\times1005}=\frac{900}{2010}=0.45\ \mathrm{K}
$$

$U=100\ \mathrm{m/s}$ 时同一算法给出 $10000/2010=4.98\ \mathrm{K}$。

再看它与壁面温差 $\Delta T=20\ \mathrm{K}$ 的比例：$30\ \mathrm{m/s}$ 时为 $2.2\%$，可忽略；$100\ \mathrm{m/s}$ 时为 $24.9\%$，必须保留。求"可忽略"的流速门限，令 $\Delta T_{\mathrm{stag}}/\Delta T\le1\%$：

$$
U\le\sqrt{0.01\times2c_p\Delta T}=\sqrt{0.02\times1005\times20}=\sqrt{402}=20.0\ \mathrm{m/s}
$$

即空气在 $20\ \mathrm{K}$ 壁面温差下，约 $20\ \mathrm{m/s}$ 以下可以关掉耗散项，以上必须打开。用布林克曼数 $\mathrm{Br}=\mu U^2/(k\Delta T)$ 得到同向结论：$\mu=1.85\times10^{-5}\ \mathrm{Pa\cdot s}$、$k=0.0262\ \mathrm{W/(m\cdot K)}$，$U=30\ \mathrm{m/s}$ 时 $\mathrm{Br}=1.85\times10^{-5}\times900/(0.0262\times20)=0.032$，$U=100\ \mathrm{m/s}$ 时 $\mathrm{Br}=0.353$。两者相差十倍，与温升比例一致。

## 能量收支必须单独审计

温度残差收敛不等于能量守恒。可复算的做法是建立一个整体能量账：入口带入焓流 $\dot m c_p T_{\mathrm{in}}$、出口带出焓流、壁面热流积分 $\int q_w\,\mathrm{d}A$、以及体热源。稳态下四者应闭合到 $1\%$ 以内。以 $U=30\ \mathrm{m/s}$、通道截面 $0.02\ \mathrm{m^2}$、空气 $\rho=1.1766\ \mathrm{kg/m^3}$ 为例，质量流量

$$
\dot m=\rho U A=1.1766\times30\times0.02=0.706\ \mathrm{kg/s}
$$

若壁面总热流为 $3000\ \mathrm{W}$，则温升 $\Delta T=3000/(0.706\times1005)=4.23\ \mathrm{K}$；用这个数去核对进出口温度差，就能判断壁面热流是否自洽。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面热流比实验低三成以上 | 湍流普朗特数沿用 0.85，而工质是液态金属 | 查工质 $Pr$ 与推荐 $Prt$，重算壁面热流 |
| 高速算例温度整体偏高 | 未开启黏性耗散或动能通量项 | 计算 $\Delta T_{\mathrm{stag}}$ 与壁面温差的比值 |
| 无粘区总温沿程下降 | `div(phi,K)` 格式耗散强于 `div(phi,h)` | 换 `limitedLinear` 并比较沿程总温 |
| 瞬态温度响应滞后 | 能量方程外迭代不足，或时间格式一阶 | 加密时间步并改用 `backward`，看滞后是否消失 |
| 低温工况 $c_p$ 常数假设导致大偏差 | `hConst` 在温度跨度大时失效 | 换 `janaf` 并核对 $c_p(T)$ 曲线 |
| 封闭腔内温度持续单调上升 | 壁面热流与体源项符号重复计入 | 逐 patch 积分热流并与体源求和，检查是否重复 |

## 记录与复核

每个算例至少保存：求解变量类型（`sensibleEnthalpy` / `absoluteEnthalpy` / `totalEnergy`）与选择理由；`Prt` 的取值及其来源；$\Delta T_{\mathrm{stag}}/\Delta T$ 与 $\mathrm{Br}$ 的当前值；整体能量账的四项数值与闭合残差。速度或壁面温差改变一个量级时，耗散项与 $Prt$ 都要重新评估，不能沿用上一次的结论。

## 参考资料

1. Bird R.B., Stewart W.E., Lightfoot E.N., Transport Phenomena, 2nd ed., Wiley, 2002.
2. Kays W.M., Crawford M.E., Weigand B., Convective Heat and Mass Transfer, 4th ed., McGraw-Hill, 2005.
3. Incropera F.P., DeWitt D.P., Fundamentals of Heat and Mass Transfer, 6th ed., Wiley, 2007.
4. OpenFOAM Foundation, OpenFOAM User Guide, thermophysical modelling and function objects 章节.
5. White F.M. 《Viscous Fluid Flow》. McGraw-Hill, 2006.
6. Schlichting H., Gersten K. 《Boundary-Layer Theory》. Springer, 2017.
7. Greenshields C.J., Weller H.G. 《Notes on Computational Fluid Dynamics: General Principles》. CFD Direct, 2022.
