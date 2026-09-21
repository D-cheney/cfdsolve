---
template_version: flowlab-knowledge/1.0
slug: openfoam-physics-incompressible-rans-engineering-setup
title: 不可压 RANS 设置：工程设置与诊断验证
summary: 从运动学压力约定讲起，给出不可压 RANS 的物性字典、湍流模型字典、首层高度与入口湍流量换算，并附一份可直接运行的单相水管道算例与参数取值依据。
category:
  slug: openfoam-physics
  name: OpenFOAM 物理模型
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 物理模型
  - 不可压 RANS 设置
  - 工程设置与参数选择
  - kOmegaSST
  - kinematic pressure
  - 结果诊断与可信度验证
  - Colebrook
  - 网格收敛指数
seo:
  title: 不可压 RANS 设置：工程设置与诊断验证
  description: 从运动学压力约定讲起，给出不可压 RANS 的物性字典、湍流模型字典、首层高度与入口湍流量换算，并附一份可直接运行的单相水管道算例与参数取值依据。
  keywords:
    - 不可压 RANS 设置
    - 工程设置与参数选择
    - kinematic pressure
    - kOmegaSST
    - simpleFoam
    - 结果诊断与可信度验证
    - Colebrook
    - 网格收敛指数
    - Darcy-Weisbach
---
# 不可压 RANS 设置：工程设置与诊断验证

不可压 RANS 的坑几乎全部来自两处：一是忘了求解器内部压力是运动学量，二是把网格分辨率与壁面处理当成两件独立的事。本文以一段 20 ℃ 水在直径 20 mm 圆管中流动的算例贯穿，给出物性字典、湍流字典、首层高度反算与入口湍流量换算，并说明每个取值从哪个目标量倒推而来。适用于 simpleFoam/pimpleFoam 的单相定常或准定常计算。残差降到 1e-4 与结果可信之间没有必然联系：一个把出口压力写成帕斯卡的算例同样能收敛。判断不可压 RANS 结果是否可信，要用三组彼此独立的证据：积分量的力学平衡、与经验关联式的偏差、以及网格收敛指数。本文沿用 20 ℃ 水在 $D=0.02\ \mathrm{m}$、$L=10\ \mathrm{m}$ 圆管中 $U=2\ \mathrm{m/s}$ 的算例，逐条给出可手算的验收值。

## 质量守恒与动量预算的检查方式

不要只看 `continuity errors` 的绝对值，要把它换成有物理含义的指标：

$$\epsilon_m=\frac{\left|\sum_{faces}\dot m\right|}{\dot m_{ref}},\qquad \dot m_{ref}=\rho U A=998.2\times2\times3.1416\times10^{-4}=0.627\ \mathrm{kg/s}$$

定常收敛后 $\epsilon_m$ 应低于 $10^{-5}$，即净质量不平衡小于 $6.3\times10^{-6}\ \mathrm{kg/s}$。若该值停在 $10^{-2}$ 量级，通常是 SIMPLE 未开 `consistent`、压力松弛过小，或出口存在未处理的回流。后者可用 `inletOutlet` 消除，并在日志中监控出口面法向速度的最小值。

## 把三条尺子写成脚本

下面的脚本把力平衡与关联式对照一次算完，可直接与求解器输出的压降对比。

```python
# 管道 RANS 结果的独立验收计算
import math
rho, U, D, L, nu = 998.2, 2.0, 0.02, 10.0, 1.004e-6
Re  = U*D/nu
f   = (0.790*math.log(Re) - 1.64)**-2          # Petukhov, 光滑管
dp  = f*(L/D)*rho*U**2/2                       # Pa
A   = math.pi*D**2/4
tau = dp*A/(math.pi*D*L)                       # Pa
print("Re=%.3e  f=%.5f  dp=%.1f Pa  tau_w=%.3f Pa" % (Re, f, dp, tau))
print("u_tau=%.5f m/s  y(y+=30)=%.4e m" % (math.sqrt(tau/rho), 30*nu/math.sqrt(tau/rho)))
```

```cpp
// system/controlDict
functions
{
    yPlusDist
    {
        type            yPlus;
        libs            ("libfieldFunctionObjects.so");
        executeControl  writeTime;
    }
    wallShear
    {
        type            wallShearStress;
        libs            ("libfieldFunctionObjects.so");
        writeControl    writeTime;
    }
    massFlow
    {
        type            surfaceFieldValue;
        libs            ("libfieldFunctionObjects.so");
        fields          (phi);
        operation       sum;
        regionType      patch;
        name            outlet;
    }
}
```

## 压力是运动学量，不是帕斯卡

不可压求解器把密度从动量方程中消掉，只保留 $\nu=\mu/\rho$，压力项被同时除以密度，因此 0/p 里存的是

$$p = \frac{P}{\rho}$$

单位为 $\mathrm{m^2/s^2}$。举例：本文算例若真实压降为 2232 Pa，则字典里应写 $p=2.236\ \mathrm{m^2/s^2}$，写成 2232 会让动量方程量级错三个数量级，首次迭代即溢出。出口若用 `fixedValue`，务必确认填的是运动学值；更稳妥的做法是出口给 `fixedValue 0` 并让内部压力自由发展，或改用压力-速度耦合的 `p_rgh` 体系。

## 物性字典与湍流字典

不可压案例的 `constant/physicalProperties` 只需要一个运动黏度，其余物性一律不写；`constant/momentumTransport` 负责模型开关。两处必须同时存在且语义一致，否则求解器会退回默认值并静默运行。

```cpp
// constant/physicalProperties
viscosityModel  constant;
nu              1.004e-06;    // m^2/s, water at 20 C

// constant/momentumTransport
simulationType  RAS;
RAS
{
    model           kOmegaSST;   // 逆压梯度下优于标准 k-epsilon
    turbulence      on;
    printCoeffs     on;
}
```

选 kOmegaSST 而不是 kEpsilon 的理由是可核对的具体差异：本算例 $Re=3.98\times10^4$ 属中等雷诺数，弯头与阀门后存在弱分离，SST 的剪切应力限制器能把涡黏在逆压梯度区压低，标准 k-ε 在此类区域会高估分离长度。若几何是直管且只关心压降，kEpsilon 更省迭代。

## 由雷诺数反算首层高度

管流可用 Blasius 关系先估摩擦因子，再算摩擦速度，最后反推首层单元中心高度：

$$Re=\frac{UD}{\nu},\qquad u_\tau=U\sqrt{\frac{f}{8}},\qquad y=\frac{y^{+}\nu}{u_\tau}$$

代入 $U=2\ \mathrm{m/s}$、$D=0.02\ \mathrm{m}$、$\nu=1.004\times10^{-6}\ \mathrm{m^2/s}$，得 $Re=3.98\times10^4$；$f=0.316Re^{-0.25}=0.0224$；$u_\tau=2\sqrt{0.0224/8}=0.1057\ \mathrm{m/s}$。于是 $y^{+}=1$ 对应首层中心高度 $9.5\times10^{-6}\ \mathrm{m}$，$y^{+}=30$ 对应 $2.85\times10^{-4}\ \mathrm{m}$。

这两个数字决定了网格量级：壁面解析方案首层约 10 μm，管径 20 mm 的模型需要棱柱层从 10 μm 铺到 0.3 mm 以上，单元数比壁面函数方案高一个数量级。若沿用 $y^{+}\approx50$ 的粗网格再切到低雷诺模型，壁面剪切会被系统性高估，这不是收敛问题而是分辨率问题。

## 入口湍流量换算

入口需要给出 $k$ 与 $\omega$。用湍流强度 $I$ 与长度尺度 $L$ 换算：

$$k=\frac{3}{2}\left(UI\right)^2,\qquad \omega=\frac{\sqrt{k}}{C_\mu^{1/4}L}$$

取 $I=5\%$、$U=2\ \mathrm{m/s}$，得 $k=0.015\ \mathrm{m^2/s^2}$；$L$ 常取 $0.07D=1.4\times10^{-3}\ \mathrm{m}$，$C_\mu=0.09$，故 $\omega=\sqrt{0.015}/(0.09^{0.25}\times1.4\times10^{-3})=160\ \mathrm{s^{-1}}$。若把 $\omega$ 误填成 $k$ 的量级（如 0.015），入口涡黏 $\mu_t/\rho=k/\omega$ 会放大四个数量级，边界层被人为吹厚，压降偏小。

```cpp
// 0/k
internalField   uniform 0.015;
boundaryField
{
    inlet  { type turbulentIntensityKineticEnergyInlet; intensity 0.05; value uniform 0.015; }
    outlet { type inletOutlet; inletValue uniform 0.015; value uniform 0.015; }
    wall   { type kqRWallFunction; value uniform 0.015; }
}
// 0/omega
internalField   uniform 160;
boundaryField
{
    inlet  { type turbulentMixingLengthFrequencyInlet; mixingLength 0.0014; value uniform 160; }
    outlet { type inletOutlet; inletValue uniform 160; value uniform 160; }
    wall   { type omegaWallFunction; value uniform 160; }
}
```

## 数值格式与求解控制的保守起点

定常不可压的默认组合建议：`div(phi,U)` 用 `bounded Gauss linearUpwind grad(U)`，湍流量用 `bounded Gauss limitedLinear 1`，`laplacian` 用 `Gauss linear corrected`。代数上 U 用 `smoothSolver`、`GAMG` 预条件，$p$ 用 `GAMG` 配 `DICGaussSeidel`，`SIMPLE` 的 `consistent yes` 可减少一次压力修正的外循环。松弛起步取 U 0.7、k/omega 0.5、p 0.3；稳定后可把 p 提到 0.5。

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 首步残差冲到 1e6 后发散 | 0/p 填了帕斯卡而非 $\mathrm{m^2/s^2}$ | 检查出口 p 量级：应为 1e0 而非 1e3 |
| 压降随网格加密单调下降不收敛 | 首层落在 $5<y^{+}<30$ 缓冲层 | 输出 yPlus 直方图，确认落在 1 或 30 附近 |
| 弯头后分离区长度随迭代摆动 | 湍流方程松弛过大或格式无界 | 把 k/omega 松弛降到 0.3，观察是否平直 |
| 出口出现回流且 $k$ 为负 | 出口用 fixedValue 且未设 inletOutlet | 换 inletOutlet 并监控最小 $k$ |
| 质量不守恒残差 1e-2 不再下降 | SIMPLE 未开 consistent，或 p 松弛过小 | 打开 consistent，把 p 松弛提到 0.5 |
| 压降与 Colebrook 差 20% 以上 | 首层 $y^{+}$ 落在缓冲层，壁面函数失效 | 把首层加密到 $y^{+}<1$ 重算，看偏差是否收窄 |
| 残差平但压降随迭代缓慢爬升 | 出口回流未定常，或 SIMPLE 外循环不足 | 增加外循环次数至 2000，观察压降是否平直 |
| 加密网格压降单调下降 | 数值扩散主导，格式欠精 | 把 `div(phi,U)` 从 upwind 换为 `linearUpwind` 对比 |
| 出口 $k$ 出现负值 | 湍流格式无界或源项过大 | 换 `limitedLinear 1` 并把 k 松弛降到 0.3 |
| 剪应力与压力平衡差 15% | 壁面法向网格过粗，梯度重构失真 | 输出 `wallShearStress` 并与 $\Delta p A/(\pi D L)$ 对比 |

## 网格收敛指数给出不确定区间

只有两套网格无法证明收敛。按 Richardson 外推，用三套细化比 $r=1.5$ 的网格（单元数约 0.4 M、1.4 M、4.7 M）计算：

$$p=\frac{\ln\left|\frac{\phi_3-\phi_2}{\phi_2-\phi_1}\right|}{\ln r},\qquad GCI=\frac{1.25\left|\phi_2-\phi_1\right|/\phi_1}{r^{p}-1}$$

若三套网格压降分别为 21.3 kPa、22.0 kPa、22.4 kPa，则 $\phi_2-\phi_1=-0.7$、$\phi_3-\phi_2=-0.4$，比值 0.571，$\ln0.571/\ln1.5=-1.39$，出现负的观测阶，说明尚未进入渐近区，此时任何外推都不可信。正确做法是继续加密并把首层 $y^{+}$ 锁定在同一区间，直到观测阶落在 $1\sim2$。

## 局部量与全局量要分别验收

全局压降达标不代表局部可信。曾有一个弯管算例整体压降只偏 3%，但弯头内壁 $y^{+}$ 高达 220，壁面剪切在分离点附近被高估 40%，只是被下游直管的欠预测抵消掉了。

| 诊断量 | 提取方式 | 可信阈值 |
|---|---|---|
| 壁面 $y^{+}$ 分布 | `postProcess -func yPlus` | 壁面函数方案：$30\sim300$；解析方案：$\le 1$ |
| 壁面剪切应力 | `wallShearStress` 功能对象 | 与 $\tau_w=11.05\ \mathrm{Pa}$ 偏差 $<5\%$ |
| 湍动能最小值 | `fieldMinMax -fields k` | $k>0$，无负值 |
| 出口回流比例 | 面积加权负法向速度占比 | $<2\%$ |
| 质量不平衡 | `sum(phi)` 全场积分 | $<10^{-5}$ |

## 单因素对照与记录

参数选择要靠对照而非试数，本文建议至少三组：

每组的输入哈希、`nu`、`I`、`L`、首层高度必须写进同一张表，否则后续无法判断差异来自哪一项。

| 变量 | 基线 | 对照 A | 对照 B | 观察量 |
|---|---|---|---|---|
| 首层 $y^{+}$ | 30 | 1 | 50 | 压降、壁面剪切 |
| 湍流模型 | kOmegaSST | kEpsilon | realizableKE | 分离位置 |
| 入口 $I$ | 5% | 1% | 10% | 压降、出口湍动能 |

## 先建立力学平衡这一硬约束

管内充分发展流的压力驱动力必须与壁面剪切力平衡，这是不依赖任何湍流模型的热力学约束：

$$\Delta p \cdot A = \tau_w \cdot \pi D L,\qquad \tau_w=\frac{f}{8}\rho U^{2}$$

其中 $A=\pi D^{2}/4=3.1416\times10^{-4}\ \mathrm{m^2}$。取 Petukhov 关联式给出的光滑管摩擦因子 $f=(0.790\ln Re-1.64)^{-2}$，$Re=3.98\times10^{4}$ 时 $f=0.0221$。则

$$\Delta p = f\frac{L}{D}\frac{\rho U^{2}}{2}=0.0221\times500\times1996.4=2.21\times10^{4}\ \mathrm{Pa}$$

反推剪切力：$\Delta p\cdot A=2.21\times10^{4}\times3.1416\times10^{-4}=6.94\ \mathrm{N}$，除以湿周面积 $\pi D L=0.6283\ \mathrm{m^2}$ 得 $\tau_w=11.05\ \mathrm{Pa}$，与 $f\rho U^{2}/8=11.03\ \mathrm{Pa}$ 一致，误差 0.2%。若你的模拟压降是 18 kPa 或 30 kPa，先算这条平衡，再谈模型。

## 用 Colebrook 式做外部对照

光滑管与粗糙管的统一参照是 Colebrook-White 隐式关系：

$$\frac{1}{\sqrt{f}}=-2\log_{10}\left(\frac{\varepsilon}{3.7D}+\frac{2.51}{Re\sqrt{f}}\right)$$

$Re=3.98\times10^{4}$、相对粗糙度 $\varepsilon/D=0$ 时迭代得 $f=0.0221$，与 Petukhov 式相差 0.1% 以内。若管壁取 $\varepsilon=0.05\ \mathrm{mm}$（$\varepsilon/D=2.5\times10^{-3}$，普通碳钢管量级），$f$ 升到约 0.0262，压降相应升至 26.2 kPa。这条对照能直接回答"我的算例偏大 18% 是粗糙度还是模型误差"——先确认几何与壁面参数是否与关联式口径一致，再讨论湍流模型。

## 参考资料

1. Blasius H., "Grenzschichten in Flüssigkeiten mit kleiner Reibung," Zeitschrift für Mathematik und Physik, 1908.
2. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications," AIAA Journal, 1994.
3. Patankar S.V., Numerical Heat Transfer and Fluid Flow, Hemisphere Publishing, 1980.
4. Ferziger J.H., Perić M., Street R.L., Computational Methods for Fluid Dynamics, 4th ed., Springer, 2020.
5. OpenFOAM Foundation, OpenFOAM User Guide（当前发行版，incompressible solvers 与 fvSolution 章节）.
6. Colebrook C.F., "Turbulent Flow in Pipes, with Particular Reference to the Transition Region between the Smooth and Rough Pipe Laws," Journal of the Institution of Civil Engineers, 1939.
7. Petukhov B.S., "Heat Transfer and Friction in Turbulent Pipe Flow with Variable Physical Properties," Advances in Heat Transfer, 1970.
8. Roache P.J., "Perspective: A Method for Uniform Reporting of Grid Refinement Studies," Journal of Fluids Engineering, 1994.
9. Celik I.B. et al., "Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications," Journal of Fluids Engineering, 2008.
10. OpenFOAM Foundation, OpenFOAM User Guide（当前发行版，function objects 与 postProcess 章节）.
