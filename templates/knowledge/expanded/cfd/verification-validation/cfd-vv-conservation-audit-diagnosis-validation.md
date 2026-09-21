---
template_version: "flowlab-knowledge/1.0"
slug: cfd-vv-conservation-audit-diagnosis-validation
title: "质量能量动量守恒审计：结果诊断与可信度验证"
summary: "给出质量、能量、动量三条守恒残差的归一化定义与验收阈值，用等截面管流算例手算摩擦因子并反查 Blasius 值，配合 OpenFOAM functionObjects 做逐边界审计，并说明积分残差被局部误差相消掩盖时如何用极值与通量分布继续追查。"
category:
  slug: verification-validation
  name: "验证确认与后处理"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "验证确认与后处理"
  - "质量能量动量守恒审计"
  - "结果诊断与可信度验证"
  - "守恒残差"
  - "逐边界审计"
seo:
  title: "质量能量动量守恒审计：结果诊断与可信度验证"
  description: "给出质量、能量、动量三条守恒残差的归一化定义与验收阈值，用等截面管流算例手算摩擦因子并反查 Blasius 值，配合 OpenFOAM functionObjects 做逐边界审计，并说明积分残差被局部误差相消掩盖时如何用极值与通量分布继续追查。"
  keywords:
    - "质量能量动量守恒审计"
    - "结果诊断与可信度验证"
    - "守恒残差"
    - "逐边界审计"
    - "OpenFOAM functionObjects"
---

# 质量能量动量守恒审计：结果诊断与可信度验证

守恒审计把"算完了"换成"账平了"。质量、能量、动量三条平衡各有明确的归一化口径与验收阈值，任一条不平时，逐边界拆解能直接指出是哪个 patch 贡献了不平衡。但守恒残差是积分量，局部误差可以正负相消，残差极小的解仍可能有振荡的局部场。

## 三条残差的归一化定义

质量平衡审计对每个边界面的通量求和：

$$
R_m = \frac{\left|\sum_{in} \rho \mathbf{u}\cdot\mathbf{A} - \sum_{out} \rho \mathbf{u}\cdot\mathbf{A}\right|}{\dot m_{ref}}
$$

$R_m$ 无量纲，$\dot m_{ref}$ 取入口流量。对稳态不可压、压力-速度耦合已收敛的解，工程阈值取 $R_m < 10^{-4}$（0.01%）；瞬态计算则要求每一步的不平衡量小于该步控制体内质量变化的 1%。

能量平衡把壁面热流与流体焓变对齐，并保留瞬态储能项：
$$
R_E = \frac{\left|Q_{wall} + \dot m\, c_p (T_{in} - T_{out}) - \dfrac{dE}{dt}\right|}{Q_{ref}}
$$

稳态时 $dE/dt$ 可略，$Q_{ref}$ 取壁面热流绝对值，阈值取 $R_E < 10^{-3}$（0.1%）。含辐射或黏性耗散时，这两项必须显式进入 $Q_{wall}$ 或焓变，否则残差会把漏掉的物理项记成数值误差。动量平衡在等截面不可压管流里退化为压差与壁面摩擦的平衡：

$$
R_M = \frac{\left|\Delta p\, A + F_{wall} - \dot m (U_{out} - U_{in})\right|}{|\Delta p\, A|}
$$

阈值取 $R_M < 5\times10^{-3}$（0.5%）。壁面力必须来自同一套面积分，不能用点值压差乘几何面积近似，否则采样面不一致会伪造出 1% 量级的残差。

## 等截面管流的一次完整审计
工况为空气在圆管内的充分发展湍流，$\rho = 1.204\ \mathrm{kg/m^3}$、$\mu = 1.81\times10^{-5}\ \mathrm{Pa\cdot s}$、$c_p = 1005\ \mathrm{J/(kg\cdot K)}$、$D = 0.100\ \mathrm{m}$、$L = 10.0\ \mathrm{m}$、$U_{in} = 15.0\ \mathrm{m/s}$、$T_{in} = 300.00\ \mathrm{K}$。先算截面积与质量流量：$A = \pi D^2/4 = 7.854\times10^{-3}\ \mathrm{m^2}$，$\dot m = \rho U_{in} A = 1.204\times15.0\times7.854\times10^{-3} = 0.1418\ \mathrm{kg/s}$。

| 审计项 | 计算口径 | 数值 | 归一化残差 | 阈值 |
|---|---|---|---|---|
| 质量 | 入口 0.141840 与出口 0.141837 $\mathrm{kg/s}$ | $\Delta = 3.0\times10^{-6}$ | $2.1\times10^{-5}$ | $<10^{-4}$ |
| 能量 | $Q_{wall} = -3500.0\ \mathrm{W}$，$\dot m c_p \Delta T = -3499.6\ \mathrm{W}$ | $\Delta = 0.4\ \mathrm{W}$ | $1.1\times10^{-4}$ | $<10^{-3}$ |
| 动量 | $\Delta p\,A = 1.8929\ \mathrm{N}$，$F_{wall} = -1.8894\ \mathrm{N}$ | $\Delta = 3.5\times10^{-3}\ \mathrm{N}$ | $1.9\times10^{-3}$ | $<5\times10^{-3}$ |

能量项的出口温度由壁面热流反算得到，这是最实用的手算校核：$\Delta T = Q_{wall}/(\dot m c_p) = -3500.0/142.5 = -24.55\ \mathrm{K}$，故 $T_{out} = 275.45\ \mathrm{K}$。若求解器输出的质量加权出口温度偏离该值超过 0.05 K，说明壁面热流积分或焓变口径有误。

动量项可以进一步用摩擦因子交叉验证。由压降反算 Darcy 摩擦因子

$$
f = \frac{2\,\Delta p\, D}{\rho U^2 L} = \frac{2\times241.0\times0.100}{1.204\times225\times10.0} = \frac{48.2}{2709} = 0.01779
$$

该工况雷诺数为 $Re = \rho U D/\mu = 1.204\times15.0\times0.100/1.81\times10^{-5} = 9.98\times10^{4}$，处在 Blasius 关系式适用范围内，$f_{Blasius} = 0.3164\,Re^{-0.25} = 0.3164/17.773 = 0.01780$，与审计值相差 $0.06\%$，说明压降与壁面摩擦的一致性不是巧合。若 $f$ 与关联式相差超过 5%，优先怀疑壁面第一层网格落在缓冲层：本例 $u_\tau = U\sqrt{f/8} = 15.0\times0.04717 = 0.708\ \mathrm{m/s}$，首层高度 $0.5\ \mathrm{mm}$ 对应 $y^+ = 19.5$，已低于壁面函数通常要求的 $y^+ \ge 30$。

## 逐边界审计定位不平衡

全局残差只说"账不平"，不说是哪个边界。逐边界审计对每个 patch 单独输出通量，再用"流入减流出"的代数关系找异常项。下面是一段可放进 `system/controlDict` 的配置：

```cpp
functions
{
    massIn  { type flowRatePatch; patch inlet; }
    massOut { type flowRatePatch; patch outlet; }
    wallHeat
    {
        type    wallHeatFlux;
        libs    ("libfieldFunctionObjects.so");
        patches (pipeWall);
    }
    forceOnWall
    {
        type    forces;
        libs    ("libforces.so");
        patches (pipeWall);
        rho     rhoInf;
        rhoInf  1.204;              // 与能量平衡保持同一密度口径
        CofR    (0 0 0);
    }
    TExit
    {
        type        surfaceFieldValue;
        fields      (T);
        operation   flowRateWeightedAverage;
        regionType  patch;
        name        outlet;
    }
}
```

读数是：`massIn` 与 `massOut` 之差给出 $R_m$ 的分子；`wallHeat` 的积分给出 $Q_{wall}$；`forceOnWall` 的轴向分量给出 $F_{wall}$，符号必须与压差力相反；`TExit` 必须用 `flowRateWeightedAverage` 而非 `areaAverage`。若质量残差集中在出口，统计 $u_x < 0$ 的面积占比，超过 1% 说明计算域偏短，应延长下游段或改压力出口。

## 残差小不等于局部正确

守恒残差是体积分或面积分，正负误差可以在积分中相消：一个单元上多出的通量被相邻单元少算的通量抵消，全局账目依然平整。所以 $R_m = 2.1\times10^{-5}$ 只说明积分层面没问题，不能替代局部检查。局部检查看三个量：场的极值（`fieldMinMax`）确认没有非物理过冲；通量场分布确认没有单元级锯齿；库朗数确认格式仍在稳定区。

瞬态审计还要注意比较口径：每一步的守恒残差应与该步控制体内的储能变化率同量级，而不是与总能量比较。正确写法是 $R_E^{step} = |\Delta E_{step} - \dot Q_{net}\Delta t|/(\dot Q_{ref}\Delta t)$。
## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 质量残差 0.5% 且随迭代不下降 | 出口出现回流，`inletOutlet` 反复切换 | 统计出口回流面积占比，超过 1% 则延长计算域或改压力出口 |
| 能量残差 2% 而温度场看起来合理 | 壁面热流漏掉辐射或漏掉黏性耗散 | 分别输出辐射与对流热流积分，与 $\dot m c_p \Delta T$ 逐项对比 |
| 动量残差随网格加密线性下降 | 压差取点值、壁面力取面积分，采样面不一致 | 统一用同一截面的面积分压差重算 |
| 瞬态每步残差都超线 | 与总能量比较而非与该步储能变化比较 | 改用 $\Delta t$ 内的净热量作分母重算 |
| $f$ 与 Blasius 值差 8% | 首层网格落在缓冲层，壁面摩擦被低估 | 打印 $y^+$ 分布，$y^+ < 30$ 时改用低雷诺数壁面处理 |
## 审计记录要点

记录应包含：三条残差的分子与分母取值、归一化残差与阈值对比、逐边界通量清单、压差与壁面力的采样面定义、$y^+$ 范围、摩擦因子与关联式的偏差，以及瞬态计算的分母口径。若某条残差超标，还要写明已排除与未排除的假设。
## 参考文献

1. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
2. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
3. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
4. OpenFOAM Foundation, *OpenFOAM User Guide v10: Function Objects*, 2022.
5. ASME V&V 20-2009, *Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, ASME, 2009.
6. Roache P.J., *Computational Fluid Dynamics*, Hermosa Publishers, 1972.
