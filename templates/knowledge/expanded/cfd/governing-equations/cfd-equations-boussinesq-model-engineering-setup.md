---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-boussinesq-model-engineering-setup
title: "Boussinesq 浮力近似：工程设置与参数选择"
summary: "给出 Boussinesq 浮力近似的落地配置：βΔT 的有效上限、参考温度与参考密度的取法、物性字典条目、格拉斯霍夫数估算，以及用真实气体密度反查线性化误差的手算流程。"
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
  - "Boussinesq 浮力近似"
  - "工程设置与参数选择"
  - "热膨胀系数"
  - "格拉斯霍夫数"
seo:
  title: "Boussinesq 浮力近似：工程设置与参数选择"
  description: "给出 Boussinesq 浮力近似的落地配置：βΔT 的有效上限、参考温度与参考密度的取法、物性字典条目、格拉斯霍夫数估算，以及用真实气体密度反查线性化误差的手算流程。"
  keywords:
    - "Boussinesq 浮力近似"
    - "工程设置与参数选择"
    - "热膨胀系数"
    - "格拉斯霍夫数"
    - "buoyantPimpleFoam"
---

# Boussinesq 浮力近似：工程设置与参数选择

Boussinesq 近似的全部内容只有一句话：密度只在浮力项里随温度变化，其余地方一律取常数。配置时最容易出错的不是 β 的数值，而是参考温度 $T_0$ 与初始温度场不一致，以及把密度同时喂给了连续性方程。下面给出从判据到字典的完整设置顺序。

## 先用 βΔT 决定能不能用

线性化密度关系为

$$
\rho=\rho_0\left[1-\beta(T-T_0)\right],\qquad \beta=-\frac{1}{\rho}\left(\frac{\partial\rho}{\partial T}\right)_p
$$

只有 $\beta\Delta T$ 足够小时，忽略二次项才成立。工程上取

$$
\beta\,\Delta T\le0.1
$$

作为准入条件，对应密度相对变化不超过 10%。对理想气体 $\beta=1/T_0$，于是 $T_0=300\ \mathrm{K}$ 时允许的最大温差 $\Delta T\le30\ \mathrm{K}$；$T_0=350\ \mathrm{K}$ 时放宽到 $35\ \mathrm{K}$。若工况温差超过这条线，必须改用带真实状态方程的浮力求解器，而不是把 β 调大。

## 动量方程里只加一项

Boussinesq 动量方程把密度变化全部塞进浮力源项，其余系数取参考态常数：

$$
\rho_0\frac{\mathrm{D}\mathbf{u}}{\mathrm{D}t}=-\nabla p'+\mu\nabla^2\mathbf{u}-\rho_0\beta(T-T_0)\mathbf{g}
$$

注意压力已拆成静水部分与剩余部分 $p'$。这一拆分是必须的：若把 $p$ 与 $\rho_0\mathbf{g}$ 同时留在方程里，静止分层流体也会被算出流动。配置上的对应做法是求解 $p_{rgh}=p-\rho_0\mathbf{g}\cdot\mathbf{h}$，并把重力写在独立文件中：

```
// constant/g
dimensions      [0 1 -2 0 0 0 0];
value           (0 -9.81 0);

// constant/thermophysicalProperties
thermoType
{
    type            heRhoThermo;
    mixture         pureMixture;
    transport       const;
    thermo          hConst;
    equationOfState Boussinesq;
    specie          specie;
    energy          sensibleEnthalpy;
}
mixture
{
    specie            { molWeight 28.96; }
    equationOfState   { rho0 1.1766; T0 300; beta 3.333e-03; }
    thermodynamics    { Cp 1005; Hf 0; }
    transport         { mu 1.8e-05; Pr 0.71; }
}
```

`rho0` 必须等于 $T_0$ 下的真实密度，`T0` 必须等于初始场的体积平均温度，`beta` 必须由 $T_0$ 处的物性决定。三者只要有一个错位，第一步迭代就会产生一个本不该存在的浮力。

## 手算：从真实气体密度反查线性化误差

空气按理想气体处理，$R=287.05\ \mathrm{J/(kg\cdot K)}$，$p=101325\ \mathrm{Pa}$。

参考态 $T_0=300\ \mathrm{K}$：

$$
\rho_0=\frac{101325}{287.05\times300}=1.1766\ \mathrm{kg/m^3}
$$

理想气体热膨胀系数 $\beta=1/T_0=1/300=3.333\times10^{-3}\ \mathrm{K^{-1}}$。取 $\Delta T=20\ \mathrm{K}$，Boussinesq 给出

$$
\rho_B=1.1766\times\left(1-3.333\times10^{-3}\times20\right)=1.1766\times0.93333=1.0983\ \mathrm{kg/m^3}
$$

真实值用状态方程算：$\rho_{320}=101325/(287.05\times320)=1.1033\ \mathrm{kg/m^3}$。相对偏差

$$
\frac{1.1033-1.0983}{1.1033}=0.45\%
$$

即 $20\ \mathrm{K}$ 温差的线性化误差不到 $0.5\%$，远小于典型网格与湍流模型误差，因此该工况可以放心使用 Boussinesq。若把温差拉到 $60\ \mathrm{K}$，同一算法给出 $\rho_B=1.1766\times(1-0.2)=0.9413\ \mathrm{kg/m^3}$，而真实值 $101325/(287.05\times360)=0.9805\ \mathrm{kg/m^3}$，偏差升到 $4.0\%$，已经进入需要真实状态方程的区间。

## 浮力强度与网格的关系

判断自然对流是否显著，用格拉斯霍夫数与瑞利数：

$$
Gr=\frac{g\beta\Delta T L^3}{\nu^2},\qquad Ra=Gr\,Pr
$$

空气在 $300\ \mathrm{K}$ 时 $\nu=1.568\times10^{-5}\ \mathrm{m^2/s}$，取 $L=0.1\ \mathrm{m}$、$\Delta T=20\ \mathrm{K}$、$\beta=3.333\times10^{-3}\ \mathrm{K^{-1}}$：

$$
Gr=\frac{9.81\times3.333\times10^{-3}\times20\times10^{-3}}{\left(1.568\times10^{-5}\right)^2}=\frac{6.54\times10^{-4}}{2.459\times10^{-10}}=2.7\times10^{6}
$$

配合 $Pr=0.71$ 得 $Ra\approx1.9\times10^{6}$。这个量级意味着浮力与惯性同阶，但整体仍属层流—转捩过渡区，第一层网格应按 $y^+\approx1$ 布置；若算例是竖直平板外流，$Ra=1.9\times10^{6}$ 对应的平均努塞尔数约 $0.59\,Ra^{1/4}=0.59\times37=22$，可作为量级校验。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 静止分层流体自发产生流动 | 未做静水压力分离，或 `g` 的符号与坐标轴不一致 | 令初始温度场均匀等于 `T0`，跑一步看速度是否保持为零 |
| 浮力驱动流量比预期大一截 | `beta` 按另一温度取值，与 `T0` 不配套 | 手算 $1/T_0$ 与字典中的 `beta` 对比 |
| 温度场正确但流向相反 | $(T-T_0)$ 的符号与 `g` 方向组合错误 | 交换 `g` 分量符号，看流场是否镜像 |
| 残差已收敛，但努塞尔数比关联式低 20% | 密度被同时代入连续性方程，破坏了 $\nabla\cdot\mathbf{u}=0$ | 检查求解器是否真的使用 Boussinesq 状态方程，并核对出入口体积流量差 |
| 温差加大后质量不再闭合 | 超出 $\beta\Delta T\le0.1$ 仍用常数密度 | 计算 $\beta\Delta T$ 并与 0.1 比较 |
| 近壁温度梯度出现振荡 | 首层 $y^+$ 过大，浮力边界层未被解析 | 输出首层 $y^+$ 与 $Gr^{1/4}$ 尺度 $\delta/L=Gr^{-1/4}=0.025$ |

最后一行的边界层尺度 $\delta/L=Gr^{-1/4}=(2.7\times10^{6})^{-1/4}=0.0247$，即 $L=0.1\ \mathrm{m}$ 时热边界层厚约 $2.5\ \mathrm{mm}$，首层网格必须显著小于它，否则壁面热流会被严重低估。

## 记录与复核要点

一份可复算的 Boussinesq 设置记录至少要留四样东西：$T_0$、$\rho_0$、$\beta$ 三个数与它们的来源（理想气体用 $1/T_0$，液体查物性表并注明温度）；$\beta\Delta T$ 的当前值及对应的线性化误差估算；$Gr$、$Ra$ 与由此确定的首层网格尺度；以及一个把 `T0` 置为初始场均匀温度后的零速度自检结果。温差或参考温度任一项改变时，$\beta$、$\rho_0$ 和线性化误差必须同时重算，不能沿用旧值。

## 参考资料

1. Boussinesq J., Théorie analytique de la chaleur, Gauthier-Villars, 1903.
2. Gray D.D., Giorgini A., "The validity of the Boussinesq approximation for liquids and gases", International Journal of Heat and Mass Transfer, 19(5), 1976, 545-551.
3. Spiegel E.A., Veronis G., "On the Boussinesq approximation for a compressible fluid", Astrophysical Journal, 131, 1960, 442-447.
4. Ferziger J.H., Perić M., Street R.L., Computational Methods for Fluid Dynamics, 4th ed., Springer, 2020.
