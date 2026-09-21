---
template_version: flowlab-knowledge/1.0
slug: cfd-equations-energy-equation-modeling
title: 总能量与焓方程：原理与工程设置
summary: >-
  从能量形式之间的恒等关系讲起，说明压力功在动能方程与内能方程之间如何转移、低马赫截断丢掉了哪一项、生成焓与显焓的分界在哪，并用等熵关系给出压力功不可忽略的定量门槛。
  全文同时覆盖原理与适用范围、工程设置与参数选择，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
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
  - 总能量与焓方程
  - 物理建模与适用边界
  - 压力功
  - 低马赫截断
  - 工程设置与参数选择
  - 湍流普朗特数
  - 黏性耗散
seo:
  title: 总能量与焓方程：原理与工程设置
  description: >-
    从能量形式之间的恒等关系讲起，说明压力功在动能方程与内能方程之间如何转移、低马赫截断丢掉了哪一项、生成焓与显焓的分界在哪，并用等熵关系给出压力功不可忽略的定量门槛。
    全文同时覆盖原理与适用范围、工程设置与参数选择，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 总能量与焓方程
    - 物理建模与适用边界
    - 压力功
    - 低马赫截断
    - 生成焓
    - 工程设置与参数选择
    - 湍流普朗特数
    - 黏性耗散
    - sensibleEnthalpy
---
# 总能量与焓方程：原理与工程设置

## 原理与适用范围

总能量、焓、内能三种形式并不是三套物理，而是同一个守恒律的三种记账方式；差别只在压力功被记在哪一栏。把这个记账关系理清，就能判断某类工况里哪些项可以删、删了之后哪一个目标量会出错。下面先给出形式之间的恒等变换，再逐项交代低马赫截断的后果，最后用等熵关系定出压力功不可忽略的门槛。

### 三种形式之间的恒等关系

总能量 $E$、静焓 $h$、动能 $K=|\mathbf{u}|^2/2$ 满足

$$
E=h-\frac{p}{\rho}+\frac{|\mathbf{u}|^2}{2}
$$

把动量方程点乘速度得到动能方程

$$
\frac{\partial(\rho K)}{\partial t}+\nabla\cdot(\rho\mathbf{u}K)=-\mathbf{u}\cdot\nabla p+\mathbf{u}\cdot(\nabla\cdot\boldsymbol{\tau})
$$

用它减去总能量方程，就得到焓方程。压力功 $-\nabla\cdot(p\mathbf{u})$ 在这一步被拆成两项：一部分 $\mathbf{u}\cdot\nabla p$ 进入动能方程，剩下 $p\nabla\cdot\mathbf{u}$ 留在内能方程里。这解释了为什么在 $\nabla\cdot\mathbf{u}=0$ 的流动中压力功不产生热量——它只在动能与压力之间搬运能量，全部被 $p\nabla\cdot\mathbf{u}=0$ 消掉。相反，只要有体积变化，$p\nabla\cdot\mathbf{u}$ 就变成实打实的加热或冷却。

### 低马赫截断删掉了什么

不可压能量方程通常写成

$$
\frac{\partial(\rho c_pT)}{\partial t}+\nabla\cdot(\rho\mathbf{u}c_pT)=\nabla\cdot(k\nabla T)+S_h
$$

与完整的焓方程相比，它同时删掉了三项：压力功 $\mathrm{D}p/\mathrm{D}t$、黏性耗散 $\Phi$、以及动能输运。三项各有自己的量级判据：

- 压力功的相对大小由压力比决定，见下一节的等熵估算；
- 黏性耗散由 $\Delta T_{\mathrm{stag}}/\Delta T=U^2/(2c_p\Delta T)$ 衡量；
- 动能输运的判据是马赫数，密度相对变化约为

$$
\frac{\Delta\rho}{\rho}\approx\frac{\gamma M^2}{2}
$$

空气 $\gamma=1.4$、$M=0.3$ 时该值为 $1.4\times0.09/2=0.063$，即密度已变化 $6.3\%$，此时把流动当作严格不可压会带来同阶误差；$M=0.1$ 时降到 $0.7\%$，通常可接受。三项可以一次算完，据此决定能量方程保留哪些项：

```python
# 能量方程删项前的三项量级检查
import numpy as np

gam, R, cp = 1.4, 287.05, 1005.0     # -, J/(kg*K), J/(kg*K)
T1, p_ratio = 300.0, 2.0             # K, -
U, dT       = 100.0, 20.0            # m/s, K

T2 = T1 * p_ratio ** ((gam - 1) / gam)
print("T2 =", T2, "K   dT =", T2 - T1, "K")      # 压力功 65.7 K
M = U / np.sqrt(gam * R * T1)
print("dRho/Rho  =", gam * M ** 2 / 2)           # 动能输运 0.146
print("dTstag/dT =", U ** 2 / (2 * cp * dT))     # 黏性耗散 0.249
```

以 $1\ \mathrm{K}$ 的温度容差衡量，压力功给出的 $65.7\ \mathrm{K}$ 远超容差，必须保留；$U=100\ \mathrm{m/s}$ 时黏性耗散占壁面温差的 $24.9\%$，同样不能关掉；密度变化 $14.6\%$ 则说明不可压假设在该工况已经不成立。

### 压力功的门槛：一次等熵估算

对绝热可逆过程，

$$
\frac{T_2}{T_1}=\left(\frac{p_2}{p_1}\right)^{(\gamma-1)/\gamma}
$$

空气 $\gamma=1.4$，故指数为 $(\gamma-1)/\gamma=0.2857$。取 $T_1=300\ \mathrm{K}$，从 $1\ \mathrm{bar}$ 压到 $2\ \mathrm{bar}$：

$$
T_2=300\times2^{0.2857}=300\times1.219=365.7\ \mathrm{K}
$$

即压力比 $2$ 对应温升 $65.7\ \mathrm{K}$。同过程的密度比为 $(p_2/p_1)^{1/\gamma}=2^{0.7143}=1.641$，可用状态方程反查：$(p_2/p_1)(T_1/T_2)=2/1.219=1.641$，两者一致。

反过来说，若目标量的工程容差是 $1\ \mathrm{K}$，则允许的温升对应压力比满足 $300\times r^{0.2857}-300\le1$，解得 $r\le1.0118$，即压力比超过约 $1.2\%$ 时压力功就不再可忽略。这条门槛比"马赫数大于 0.3"更贴近工程判断，因为它直接给出温度误差。

封闭腔内加热是另一个必须保留压力功的场景。刚性腔内理想气体等容加热，$p=\rho RT$ 给出

$$
\frac{\mathrm{d}p}{\mathrm{d}t}=\rho R\frac{\mathrm{d}T}{\mathrm{d}t}=1.1766\times287.05\times5.0=1689\ \mathrm{Pa/s}
$$

取升温速率 $5\ \mathrm{K/s}$，$10\ \mathrm{s}$ 后压升 $16.9\ \mathrm{kPa}$，已达标准大气压的 $17\%$。若求解器按不可压能量方程丢弃 $\mathrm{D}p/\mathrm{D}t$，这个压升不会出现，后续所有依赖密度的结果都会偏。

### 生成焓与显焓的分界

显焓从参考温度起算，不含化学键能；绝对焓在它之上叠加生成焓 $h_f^\circ$。燃烧、分解、相变等工况里，反应热完全来自生成焓差，此时若用显焓变量，放热会整体丢失——温度场仍然"收敛"，只是没有任何温升。反过来，单组分无反应流动用显焓可以少一次查表，且避免参考态不一致带来的偏移。判据是：温度变化是否只由外部换热与做功引起？是则显焓够用，否则必须用绝对焓并核对各组分的 $h_f^\circ$。

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 封闭腔持续加热但压力不上升 | 使用不可压能量方程，$\mathrm{D}p/\mathrm{D}t$ 被丢弃 | 由 $\rho R\,\mathrm{d}T/\mathrm{d}t$ 估算压升速率，与计算值对比 |
| 激波前后总焓不守恒 | 用焓形式且未同步输运动能 | 改用总能量形式，比较波前波后总焓 |
| 燃烧算例温度不升 | 求解变量是显焓，生成焓未进入能量收支 | 检查是否启用 `absoluteEnthalpy` 并核对各组分 $Hf$ |
| 低压比工况出现虚假温升 | 保留了压力功而流动实际不可压 | 计算等熵压力比门槛并与实际压力比比较 |
| 等熵喷管出口温度比实测低 | 边界给静温而目标量是总温 | 用 $T_2/T_1=(p_2/p_1)^{0.2857}$ 换算总温 |
| 绝热壁面温度低于理论值 | 黏性耗散未计入，恢复因子未校核 | 比较 $\Delta T_{\mathrm{stag}}=U^2/(2c_p)$ 与壁面实际温升 |

### 三条边界的共同逻辑

上面六行可以归到一句话：能量方程的每一项都对应一个具体的能量搬运通道，删项等于关闭通道，被关闭通道承担的那部分能量会以温度偏差的形式出现。判断是否可删，不看方程复杂度，只看该通道的通量是否小于目标量容差。工程上因此建议同时报告三个无量纲数——压力比、马赫数、$\Delta T_{\mathrm{stag}}/\Delta T$——它们分别对应压力功、动能输运与黏性耗散，任一超出容差就必须升级能量形式。

### 参考资料

1. Anderson J.D., Modern Compressible Flow: With Historical Perspective, 3rd ed., McGraw-Hill, 2003.
2. Bird R.B., Stewart W.E., Lightfoot E.N., Transport Phenomena, 2nd ed., Wiley, 2002.
3. Toro E.F., Riemann Solvers and Numerical Methods for Fluid Dynamics, 3rd ed., Springer, 2009.
4. LeVeque R.J., Finite Volume Methods for Hyperbolic Problems, Cambridge University Press, 2002.

## 工程设置与参数选择

能量方程的设置错误很少表现为发散，更多表现为"温度场看着对、壁面热流差 20%"。原因集中在三处：求解变量选错、湍流普朗特数照抄默认值、以及该保留的黏性耗散被关掉。下面按这三个问题给出取值依据与自检方法。

### 求解变量选哪一个

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

### 字典条目与格式设置

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

### 手算：黏性耗散什么时候可以关掉

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

### 能量收支必须单独审计

温度残差收敛不等于能量守恒。可复算的做法是建立一个整体能量账：入口带入焓流 $\dot m c_p T_{\mathrm{in}}$、出口带出焓流、壁面热流积分 $\int q_w\,\mathrm{d}A$、以及体热源。稳态下四者应闭合到 $1\%$ 以内。以 $U=30\ \mathrm{m/s}$、通道截面 $0.02\ \mathrm{m^2}$、空气 $\rho=1.1766\ \mathrm{kg/m^3}$ 为例，质量流量

$$
\dot m=\rho U A=1.1766\times30\times0.02=0.706\ \mathrm{kg/s}
$$

若壁面总热流为 $3000\ \mathrm{W}$，则温升 $\Delta T=3000/(0.706\times1005)=4.23\ \mathrm{K}$；用这个数去核对进出口温度差，就能判断壁面热流是否自洽。

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面热流比实验低三成以上 | 湍流普朗特数沿用 0.85，而工质是液态金属 | 查工质 $Pr$ 与推荐 $Prt$，重算壁面热流 |
| 高速算例温度整体偏高 | 未开启黏性耗散或动能通量项 | 计算 $\Delta T_{\mathrm{stag}}$ 与壁面温差的比值 |
| 无粘区总温沿程下降 | `div(phi,K)` 格式耗散强于 `div(phi,h)` | 换 `limitedLinear` 并比较沿程总温 |
| 瞬态温度响应滞后 | 能量方程外迭代不足，或时间格式一阶 | 加密时间步并改用 `backward`，看滞后是否消失 |
| 低温工况 $c_p$ 常数假设导致大偏差 | `hConst` 在温度跨度大时失效 | 换 `janaf` 并核对 $c_p(T)$ 曲线 |
| 封闭腔内温度持续单调上升 | 壁面热流与体源项符号重复计入 | 逐 patch 积分热流并与体源求和，检查是否重复 |

### 记录与复核

每个算例至少保存：求解变量类型（`sensibleEnthalpy` / `absoluteEnthalpy` / `totalEnergy`）与选择理由；`Prt` 的取值及其来源；$\Delta T_{\mathrm{stag}}/\Delta T$ 与 $\mathrm{Br}$ 的当前值；整体能量账的四项数值与闭合残差。速度或壁面温差改变一个量级时，耗散项与 $Prt$ 都要重新评估，不能沿用上一次的结论。

### 参考资料

1. Bird R.B., Stewart W.E., Lightfoot E.N., Transport Phenomena, 2nd ed., Wiley, 2002.
2. Kays W.M., Crawford M.E., Weigand B., Convective Heat and Mass Transfer, 4th ed., McGraw-Hill, 2005.
3. Incropera F.P., DeWitt D.P., Fundamentals of Heat and Mass Transfer, 6th ed., Wiley, 2007.
4. OpenFOAM Foundation, OpenFOAM User Guide, thermophysical modelling and function objects 章节.
5. White F.M. 《Viscous Fluid Flow》. McGraw-Hill, 2006.
6. Schlichting H., Gersten K. 《Boundary-Layer Theory》. Springer, 2017.
7. Greenshields C.J., Weller H.G. 《Notes on Computational Fluid Dynamics: General Principles》. CFD Direct, 2022.
