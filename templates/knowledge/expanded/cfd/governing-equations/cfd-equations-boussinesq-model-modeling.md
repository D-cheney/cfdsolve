---
template_version: flowlab-knowledge/1.0
slug: cfd-equations-boussinesq-model-modeling
title: Boussinesq 浮力近似：原理与工程设置
summary: >-
  从可压缩方程出发说明 Boussinesq 到底删掉了什么、为什么必须把静水压力分离出去、βΔT 与 L/H
  这两个小量各自管什么，并用浮力频率与密度标高做一次量级估算。
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
  - Boussinesq 浮力近似
  - 物理建模与适用边界
  - 浮力频率
  - 密度标高
  - 工程设置与参数选择
  - 热膨胀系数
  - 格拉斯霍夫数
seo:
  title: Boussinesq 浮力近似：原理与工程设置
  description: >-
    从可压缩方程出发说明 Boussinesq 到底删掉了什么、为什么必须把静水压力分离出去、βΔT 与 L/H
    这两个小量各自管什么，并用浮力频率与密度标高做一次量级估算。
  keywords:
    - Boussinesq 浮力近似
    - 物理建模与适用边界
    - 浮力频率
    - 密度标高
    - 静水压力
    - 工程设置与参数选择
    - 热膨胀系数
    - 格拉斯霍夫数
    - buoyantPimpleFoam
---
# Boussinesq 浮力近似：原理与工程设置

Boussinesq 近似不是"给动量方程加一项浮力"这么简单，它同时对连续性方程做了一次截断，因此把声波一起滤掉了。理解这一点才能说清它的适用边界：什么时候截断可忽略，什么时候必须换成滞弹性或全可压缩描述。下面从可压缩方程出发逐步交代。Boussinesq 近似的全部内容只有一句话：密度只在浮力项里随温度变化，其余地方一律取常数。配置时最容易出错的不是 β 的数值，而是参考温度 $T_0$ 与初始温度场不一致，以及把密度同时喂给了连续性方程。下面给出从判据到字典的完整设置顺序。

## 基础概念与控制关系

### 动量方程里只加一项

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

### 两步截断：先滤声波，再滤层结

从可压缩连续性方程出发，把它改写成散度形式：

$$
\nabla\cdot\mathbf{u}=-\frac{1}{\rho}\frac{\mathrm{D}\rho}{\mathrm{D}t}
$$

右侧是密度的物质导数。把密度写成 $T$ 的函数后，它由两部分构成：一部分来自流体微团自身温度变化（热膨胀），另一部分来自微团在层结环境中上下移动（垂直位移）。量级分析给出两者的相对大小分别是 $\beta\Delta T$ 与 $L/H$，$H$ 是密度的垂直标高。

第一步截断（滞弹性）保留位移项、丢掉热膨胀项，得到 $\nabla\cdot(\rho_0\mathbf{u})=0$，声波被滤掉但层结保留；第二步截断（Boussinesq）进一步把 $\rho_0$ 也当作常数，得到

$$
\nabla\cdot\mathbf{u}=0
$$

流体因此在运动学上完全不可压。代价是：任何依赖体积变化的机制——声传播、激波、封闭腔内的压力波——都被整体移除，且无法通过加密网格找回。

### 静水分解是必需的一步

Boussinesq 方程的动量形式常被写成

$$
\frac{\partial\mathbf{u}}{\partial t}+\mathbf{u}\cdot\nabla\mathbf{u}=-\frac{1}{\rho_0}\nabla p_d+\nu\nabla^2\mathbf{u}-\beta(T-T_0)\mathbf{g}
$$

其中 $p_d=p-p_{hyd}$ 是扣掉静水压力后的动力压力。这一步不是形式上的化简：参考态本身满足 $\nabla p_{hyd}=\rho_0\mathbf{g}$，若不做分解，静止的分层流体在离散方程里会残留一个 $\rho_0\mathbf{g}$ 量级的未平衡源项，直接算出虚假流动。判据很直接——把初始温度场设成均匀的 $T_0$，跑一步，速度场应严格保持为零。做不到，说明分解或重力方向写错了。

### 两个小量各管一件事

$\beta\Delta T$ 管的是"密度随温度线性化"的误差，属于热力学截断；$L/H$ 管的是"域内密度可视为常数"的误差，属于几何—重力截断。两者互不替代。

等温大气的密度标高为

$$
H=\frac{RT}{g}
$$

空气 $R=287.05\ \mathrm{J/(kg\cdot K)}$、$T=300\ \mathrm{K}$、$g=9.81\ \mathrm{m/s^2}$：

$$
H=\frac{287.05\times300}{9.81}=8778\ \mathrm{m}\approx8.8\ \mathrm{km}
$$

一个高 $L=3\ \mathrm{m}$ 的实验段，$L/H=3/8778=3.4\times10^{-4}$，密度在域内的真实变化约 $1-e^{-L/H}\approx3.4\times10^{-4}$，即 $0.034\%$，把密度当常数完全合理。反过来，若研究对象是 $100\ \mathrm{m}$ 高的中庭，$L/H=1.1\times10^{-2}$，密度变化 $1.1\%$，仍可接受但已接近需要滞弹性模型的边缘；若研究对象是千米量级的大气边界层，$L/H\sim0.1$，Boussinesq 的层结误差与浮力项同阶，必须升级。

### 分层强度：浮力频率

稳定层结下，温度随高度上升，密度随高度下降。定义浮力频率 $N$ 为

$$
N^2=-\frac{g}{\rho_0}\frac{\mathrm{d}\rho}{\mathrm{d}z}=g\beta\frac{\mathrm{d}T}{\mathrm{d}z}
$$

取 $\mathrm{d}T/\mathrm{d}z=2.0\ \mathrm{K/m}$、$g=9.81\ \mathrm{m/s^2}$、$\beta=3.333\times10^{-3}\ \mathrm{K^{-1}}$：

$$
N^2=9.81\times3.333\times10^{-3}\times2.0=6.54\times10^{-2}\ \mathrm{s^{-2}},\qquad N=0.256\ \mathrm{s^{-1}}
$$

对应振荡周期 $2\pi/N=2\pi/0.256=24.6\ \mathrm{s}$。这个数字有两个直接用途：一是时间步与统计窗口必须远小于它才能分辨内波，否则会把振荡平均掉；二是若算例中出现了周期约 $25\ \mathrm{s}$ 的持续振荡，它很可能是真实的浮力振荡而不是数值不稳定，不应通过加耗散去消除。两项截断误差与浮力频率可以放在同一个脚本里一次算完：

```python
# Boussinesq 准入检查：βΔT、L/H 与浮力频率
import numpy as np

R, g   = 287.05, 9.81          # J/(kg*K), m/s^2
T0     = 300.0                 # 参考温度, K
dT     = 20.0                  # 最大温差, K
dTdz   = 2.0                   # 温度梯度, K/m
L      = 3.0                   # 域高, m
beta   = 1.0 / T0              # 理想气体热膨胀系数, 1/K

print("beta*dT      =", beta * dT)              # 0.0667  < 0.1
H = R * T0 / g                                  # 密度标高, m
print("H            =", H, "m   L/H =", L / H)
print("rho change   =", 1 - np.exp(-L / H))     # 0.034%
N2 = g * beta * dTdz
print("N            =", np.sqrt(N2), "1/s")
print("period       =", 2 * np.pi / np.sqrt(N2), "s")   # 24.6 s
```

脚本的三行输出分别对应三类边界：$\beta\Delta T=0.0667$ 说明线性化可用；$L/H=3.4\times10^{-4}$ 说明域内密度变化可忽略；$N=0.256\ \mathrm{s^{-1}}$ 说明任何短于 $24.6\ \mathrm{s}$ 的统计窗口都可能被内波污染。三者任一越界，就应按前节的升级路径换模型。

### 什么时候必须离开 Boussinesq

前两行属于可以事先算出来的边界，后四行需要在运行中发现。判据的统一逻辑是：只要截断误差开始与目标量的工程容差同阶，就该升级模型，而不是继续调网格或松弛。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 竖直槽内出现无法解释的低频振荡 | 参考温度梯度与 $T_0$ 不配套，$N^2$ 反号或量级错误 | 由 $\mathrm{d}T/\mathrm{d}z$ 手算 $N^2$，与初始密度剖面对照 |
| 高塔或深水算例的浮力明显偏强 | 忽略 $L/H$，域内密度实际变化超过 1% | 计算 $L/H$ 与 $1-e^{-L/H}$，与 1% 比较 |
| 超临界流体算例结果不可信 | $\beta$ 在临界点附近急剧增大甚至变号 | 查该温压下的 $\beta$ 表并与 $1/T$ 对比 |
| 需要声学耦合时结果完全对不上 | 第二步截断已把声波移除 | 检查马赫数与是否存在声源、封闭腔 |
| 稳定层结在长时间积分后被抹平 | 温度输运格式耗散过强，梯度被数值扩散吃掉 | 对比一阶与二阶格式下 $N^2$ 的保持情况 |
| 热羽流上升速度偏低约 15% | $\Delta T$ 偏大时线性化截断已不可忽略 | 用真实状态方程跑同一工况做对照 |

### 升级路径怎么选

超出 $\beta\Delta T\ll1$ 但层结仍弱时，第一步是把线性化换成真实状态方程，保留不可压运动学；超出 $L/H\ll1$ 时，应换用滞弹性（anelastic）形式，它保留 $\nabla\cdot(\rho_0\mathbf{u})=0$ 的层结效应但仍滤声波；只有在声学、激波或封闭腔压力波本身就是目标量时，才需要回到全可压缩方程。三者的选择依据是目标量是否依赖密度变化，而不是温差本身的大小——温差大但流动完全由外部压差驱动时，Boussinesq 依然可用。

## 工程设置与实施

### 浮力强度与网格的关系

判断自然对流是否显著，用格拉斯霍夫数与瑞利数：

$$
Gr=\frac{g\beta\Delta T L^3}{\nu^2},\qquad Ra=Gr\,Pr
$$

空气在 $300\ \mathrm{K}$ 时 $\nu=1.568\times10^{-5}\ \mathrm{m^2/s}$，取 $L=0.1\ \mathrm{m}$、$\Delta T=20\ \mathrm{K}$、$\beta=3.333\times10^{-3}\ \mathrm{K^{-1}}$：

$$
Gr=\frac{9.81\times3.333\times10^{-3}\times20\times10^{-3}}{\left(1.568\times10^{-5}\right)^2}=\frac{6.54\times10^{-4}}{2.459\times10^{-10}}=2.7\times10^{6}
$$

配合 $Pr=0.71$ 得 $Ra\approx1.9\times10^{6}$。这个量级意味着浮力与惯性同阶，但整体仍属层流—转捩过渡区，第一层网格应按 $y^+\approx1$ 布置；若算例是竖直平板外流，$Ra=1.9\times10^{6}$ 对应的平均努塞尔数约 $0.59\,Ra^{1/4}=0.59\times37=22$，可作为量级校验。

### 先用 βΔT 决定能不能用

线性化密度关系为

$$
\rho=\rho_0\left[1-\beta(T-T_0)\right],\qquad \beta=-\frac{1}{\rho}\left(\frac{\partial\rho}{\partial T}\right)_p
$$

只有 $\beta\Delta T$ 足够小时，忽略二次项才成立。工程上取

$$
\beta\,\Delta T\le0.1
$$

作为准入条件，对应密度相对变化不超过 10%。对理想气体 $\beta=1/T_0$，于是 $T_0=300\ \mathrm{K}$ 时允许的最大温差 $\Delta T\le30\ \mathrm{K}$；$T_0=350\ \mathrm{K}$ 时放宽到 $35\ \mathrm{K}$。若工况温差超过这条线，必须改用带真实状态方程的浮力求解器，而不是把 β 调大。

## 异常诊断与失效模式

### 故障模式与判定试验

最后一行的边界层尺度 $\delta/L=Gr^{-1/4}=(2.7\times10^{6})^{-1/4}=0.0247$，即 $L=0.1\ \mathrm{m}$ 时热边界层厚约 $2.5\ \mathrm{mm}$，首层网格必须显著小于它，否则壁面热流会被严重低估。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 静止分层流体自发产生流动 | 未做静水压力分离，或 `g` 的符号与坐标轴不一致 | 令初始温度场均匀等于 `T0`，跑一步看速度是否保持为零 |
| 浮力驱动流量比预期大一截 | `beta` 按另一温度取值，与 `T0` 不配套 | 手算 $1/T_0$ 与字典中的 `beta` 对比 |
| 温度场正确但流向相反 | $(T-T_0)$ 的符号与 `g` 方向组合错误 | 交换 `g` 分量符号，看流场是否镜像 |
| 残差已收敛，但努塞尔数比关联式低 20% | 密度被同时代入连续性方程，破坏了 $\nabla\cdot\mathbf{u}=0$ | 检查求解器是否真的使用 Boussinesq 状态方程，并核对出入口体积流量差 |
| 温差加大后质量不再闭合 | 超出 $\beta\Delta T\le0.1$ 仍用常数密度 | 计算 $\beta\Delta T$ 并与 0.1 比较 |
| 近壁温度梯度出现振荡 | 首层 $y^+$ 过大，浮力边界层未被解析 | 输出首层 $y^+$ 与 $Gr^{1/4}$ 尺度 $\delta/L=Gr^{-1/4}=0.025$ |

## 验证、验收与复现

### 手算：从真实气体密度反查线性化误差

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

### 记录与复核要点

一份可复算的 Boussinesq 设置记录至少要留四样东西：$T_0$、$\rho_0$、$\beta$ 三个数与它们的来源（理想气体用 $1/T_0$，液体查物性表并注明温度）；$\beta\Delta T$ 的当前值及对应的线性化误差估算；$Gr$、$Ra$ 与由此确定的首层网格尺度；以及一个把 `T0` 置为初始场均匀温度后的零速度自检结果。温差或参考温度任一项改变时，$\beta$、$\rho_0$ 和线性化误差必须同时重算，不能沿用旧值。

## 参考资料

1. Oberbeck A., "Über die Wärmeleitung der Flüssigkeiten bei Berücksichtigung der Strömungen infolge von Temperaturdifferenzen", Annalen der Physik und Chemie, 243(6), 1879, 271-292.
2. Spiegel E.A., Veronis G., "On the Boussinesq approximation for a compressible fluid", Astrophysical Journal, 131, 1960, 442-447.
3. Gray D.D., Giorgini A., "The validity of the Boussinesq approximation for liquids and gases", International Journal of Heat and Mass Transfer, 19(5), 1976, 545-551.
4. Tritton D.J., Physical Fluid Dynamics, 2nd ed., Oxford University Press, 1988.
5. Boussinesq J. 《Théorie analytique de la chaleur》. Gauthier-Villars, 1901.
6. Turner J.S. 《Buoyancy Effects in Fluids》. Cambridge University Press, 1973.
7. Vallis G.K. 《Atmospheric and Oceanic Fluid Dynamics: Fundamentals and Large-Scale Circulation》. Cambridge University Press, 2006.
8. Boussinesq J., Théorie analytique de la chaleur, Gauthier-Villars, 1903.
9. Ferziger J.H., Perić M., Street R.L., Computational Methods for Fluid Dynamics, 4th ed., Springer, 2020.
