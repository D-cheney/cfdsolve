---
template_version: "flowlab-knowledge/1.0"
slug: cfd-thermal-compressible-flow-diagnosis-validation
title: "可压缩流与总量关系：结果诊断与可信度验证"
summary: "用四类可量化检验判断可压缩流结果是否可信：总温场沿流线的一致性、进出口质量流量双路核对、喉部临界流量的手算对照、激波后总压损失与解析值的偏差，并给出对应的 OpenFOAM 函数对象与后处理命令。"
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
  - "可压缩流与总量关系"
  - "结果诊断与可信度验证"
  - "临界流量"
  - "总压损失"
seo:
  title: "可压缩流与总量关系：结果诊断与可信度验证"
  description: "用四类可量化检验判断可压缩流结果是否可信：总温场沿流线的一致性、进出口质量流量双路核对、喉部临界流量的手算对照、激波后总压损失与解析值的偏差，并给出对应的 OpenFOAM 函数对象与后处理命令。"
  keywords:
    - "可压缩流与总量关系"
    - "结果诊断与可信度验证"
    - "临界流量"
    - "总压损失"
    - "质量流量守恒"
---

# 可压缩流与总量关系：结果诊断与可信度验证

可压缩流算例的残差曲线好看并不代表结果可用，真正能定性的是四个积分量：总温的一致性、进出口质量流量差、喉部临界流量、激波后的总压损失。本文把每个量写成可以手算对照的形式，并给出提取它们的具体命令。

## 总温场是最便宜的一致性检验

绝热、无外功、无体源时，总温沿流线守恒：

$$
T_0=T+\frac{|\mathbf{u}|^2}{2c_p}
$$

把 CFD 的 $T_0$ 场做一次统计，取全场最大值与最小值之差，除以平均值：

$$
\varepsilon_{T_0}=\frac{\max T_0-\min T_0}{\bar T_0}
$$

在纯内流、绝热壁面、无激波的算例里，$\varepsilon_{T_0}$ 应低于 0.5%。若达到 3%，先查能量方程形式与壁面热条件，再查边界是否把总温当静温。跨激波算例里 $T_0$ 仍应守恒（这是它与 $p_0$ 的关键区别），因此这道检验对含激波算例同样有效。

## 质量流量的双路核对

稳态内流应满足

$$
\dot m_{in}=\dot m_{out},\qquad \dot m=\int_A \rho \mathbf{u}\cdot\mathbf{n}\,dA
$$

工程容差取 0.5%：亚声速算例可到 0.1%，含强激波或大分离的算例放宽到 1%。若差到 2% 以上，通常不是格式问题，而是边界反射或出口回流让积分面不再位于均匀区。做法是把积分面向上游平移两个当地边界层厚度再积一次，若差值随位置剧烈变化，说明积分面选错了。

## 喉部临界流量：手算与 CFD 对照

对 $\gamma$ 恒定的理想气体，收缩—扩张喷管在喉部达到声速时，质量流量只由总状态与喉部面积决定：

$$
\dot m=\frac{A^*p_0}{\sqrt{T_0}}\sqrt{\frac{\gamma}{R}}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}
$$

取 $A^*=1.0\times10^{-4}\ \mathrm{m^2}$、$p_0=500\ \mathrm{kPa}$、$T_0=350\ \mathrm{K}$、$\gamma=1.4$、$R=287\ \mathrm{J/(kg\cdot K)}$：

$$
\dot m=\frac{1.0\times10^{-4}\times5.0\times10^5}{\sqrt{350}}\times\sqrt{\frac{1.4}{287}}\times\left(\frac{2}{2.4}\right)^{3}=0.1080\ \mathrm{kg/s}
$$

其中 $\sqrt{350}=18.708$、$\sqrt{1.4/287}=0.06984$、$(0.8333)^3=0.5787$。

用连续性独立复核：$\rho_0=p_0/(RT_0)=5.0\times10^5/(287\times350)=4.978\ \mathrm{kg/m^3}$，$\rho^*=\rho_0(2/2.4)^{2.5}=4.978\times0.6339=3.155\ \mathrm{kg/m^3}$，$T^*=T_0\times2/2.4=291.7\ \mathrm{K}$，$a^*=\sqrt{1.4\times287\times291.7}=342.3\ \mathrm{m/s}$，故

$$
\dot m=\rho^*A^*a^*=3.155\times1.0\times10^{-4}\times342.3=0.1080\ \mathrm{kg/s}
$$

两条路径相差 0.03%，说明公式与状态量的使用一致。CFD 若给出 0.112 kg/s，偏差 3.7%，应先检查喉部面积是否为几何喉道面积、总温是否在入口被误设为静温。

## 激波总压损失的核对

跨过一道正激波，总温不变而总压按解析式下降：

$$
\frac{p_{0,2}}{p_{0,1}}=\left[\frac{(\gamma+1)M_1^2}{2+(\gamma-1)M_1^2}\right]^{\frac{\gamma}{\gamma-1}}\left[\frac{\gamma+1}{2\gamma M_1^2-(\gamma-1)}\right]^{\frac{1}{\gamma-1}}
$$

$M_1=1.5$、$\gamma=1.4$ 时该比值为 $0.9304$。若 CFD 给出 0.915，偏低 1.6%，属于网格耗散略大的典型表现；若给出 0.965，偏高 3.7%，多半是激波被涂抹得过宽、总压损失被低估。这条比值比激波厚度更值得写进报告，因为厚度是数值离散的产物。

```cpp
// system/functions —— 提取总温、总压与质量流量
functions
{
    T0
    {
        type            totalTemperature;
        libs            ("libfieldFunctionObjects.so");
        executeControl  writeTime;
    }
    p0
    {
        type            totalPressure;
        libs            ("libfieldFunctionObjects.so");
        executeControl  writeTime;
    }
    massIn
    {
        type            surfaceFieldValue;
        libs            ("libfieldFunctionObjects.so");
        surfaceFormat   none;
        regionType      patch;
        name            inlet;
        operation       sum;
        fields          (phi);
        executeControl  writeTime;
    }
}
```

```bash
postProcess -func "totalTemperature" -time 3000
postProcess -func "totalPressure" -time 3000
postProcess -func "fieldMinMax(T0)" -time 3000
```

```python
import math
g, R, cp = 1.4, 287.0, 1005.0
Astar, p0, T0 = 1.0e-4, 5.0e5, 350.0
mdot = Astar * p0 / math.sqrt(T0) * math.sqrt(g / R) * (2 / (g + 1)) ** ((g + 1) / (2 * (g - 1)))
rho0 = p0 / (R * T0)
rho_s = rho0 * (2 / (g + 1)) ** (1 / (g - 1))
Ts = T0 * 2 / (g + 1)
as_ = math.sqrt(g * R * Ts)
print(mdot, rho_s * Astar * as_)        # 0.1080, 0.1080
```

## 边界反射与超定欠定

超声速出口上施加静压会在出口形成驻波，表现为出口面压力与相邻内部单元压力持续存在 5% 以上的差。诊断方法是把出口压力监测点向内平移 10 个单元，若两点压力差随迭代不下降，说明边界在向上游注入扰动。亚声速入口只给一个量则会出现总压缓慢漂移。两类问题的共同根源都是边界指定量与当地马赫数不匹配，与格式和网格无关。

## 诊断表：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $\varepsilon_{T_0}=3\%$ 且绝热无外功 | 用了简化能量形式，压力功被丢弃 | 换总能量形式重算，比较 $T_0$ 场的极差 |
| 进出口质量流量差 2.4% | 积分面落在回流区，或出口边界反射 | 把积分面向上游平移两个边界层厚度再积一次 |
| 喉部流量比手算高 3.7% | 入口把总温当静温，或喉部面积用了网格面积 | 用 $\rho^*A^*a^*$ 复核，核对几何喉道面积 |
| 激波后总压比解析值高 3.7% | 激波涂抹过宽，损失被低估 | 加密激波法向网格并比较 $p_{0,2}/p_{0,1}$ |
| 出口压力与内部压力差 5% 且不收敛 | 超声速出口被施加了静压 | 移除出口压力条件后重算，观察是否消失 |

## 验证记录该留什么

记录里至少包含：$\varepsilon_{T_0}$ 的数值与采样时间、进出口质量流量与相对差、喉部临界流量的手算值与 CFD 值、激波前后 $p_0$ 比与解析值的偏差、三套网格上的出口马赫数。把这五项与所用 $\gamma$、$R$ 一起归档，任何人重跑时都能判断偏差来自物性、边界还是网格。若手算与 CFD 的偏差在加密后稳定收敛到 1% 以内，就可以认为该工况的结果已经闭合。

## 参考文献

1. Toro E.F., *Riemann Solvers and Numerical Methods for Fluid Dynamics*, 3rd ed., Springer, 2009.
2. Thompson P.A., *Compressible-Fluid Dynamics*, McGraw-Hill, 1972.
3. LeVeque R.J., *Finite Volume Methods for Hyperbolic Problems*, Cambridge University Press, 2002.
4. Hirsch C., *Numerical Computation of Internal and External Flows*, 2nd ed., Butterworth-Heinemann, 2007.
5. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
6. Bertin J.J., Cummings R.M., *Aerodynamics for Engineers*, 6th ed., Pearson, 2014.
