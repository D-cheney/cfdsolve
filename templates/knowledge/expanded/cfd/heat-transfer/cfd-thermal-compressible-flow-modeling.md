---
template_version: flowlab-knowledge/1.0
slug: cfd-thermal-compressible-flow-modeling
title: 可压缩流与总量关系：原理与诊断验证
summary: >-
  从总焓守恒出发说明总温总压的建模含义、能量方程中压力功与黏性耗散的取舍、绝热壁温与恢复因子的关系，并给出 M=0.85
  外流的总温、总压、恢复温度与壁面热流完整换算，以及比热比假设失效的温度门槛。
category:
  slug: heat-transfer
  name: 传热与可压缩流
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 传热与可压缩流
  - 可压缩流与总量关系
  - 物理建模与适用边界
  - 总温
  - 恢复因子
  - 结果诊断与可信度验证
  - 临界流量
  - 总压损失
seo:
  title: 可压缩流与总量关系：原理与诊断验证
  description: >-
    从总焓守恒出发说明总温总压的建模含义、能量方程中压力功与黏性耗散的取舍、绝热壁温与恢复因子的关系，并给出 M=0.85
    外流的总温、总压、恢复温度与壁面热流完整换算，以及比热比假设失效的温度门槛。
  keywords:
    - 可压缩流与总量关系
    - 物理建模与适用边界
    - 总温
    - 恢复因子
    - 总焓
    - 结果诊断与可信度验证
    - 临界流量
    - 总压损失
    - 质量流量守恒
---
# 可压缩流与总量关系：原理与诊断验证

高速流动里，静温与总温相差的动能项可以达到几十开尔文，直接决定壁面热流的方向和大小。可压缩流算例的残差曲线好看并不代表结果可用，真正能定性的是四个积分量：总温的一致性、进出口质量流量差、喉部临界流量、激波后的总压损失。本文把每个量写成可以手算对照的形式，并给出提取它们的具体命令。

## 基础概念与控制关系

### 静量与总量的定义差别

把流动等熵滞止到零速度，得到的温度、压力、密度就是总参数：

$$
T_0=T\left(1+\frac{\gamma-1}{2}M^2\right),\qquad \frac{p_0}{p}=\left(1+\frac{\gamma-1}{2}M^2\right)^{\frac{\gamma}{\gamma-1}}
$$

$T_0$ 的物理含义是"把这股气流的动能全部转回内能后的温度"，它与 $T$ 的差就是 $\frac{U^2}{2c_p}$。$p_0$ 则只在等熵过程里保持不变，任何熵增都会让它下降。两者性质完全不同：$T_0$ 是守恒量，$p_0$ 是损失指标。把 $T_0$ 当作边界输入、把 $p_0$ 当作结果输出，是高速算例里最稳的分工方式。

### 能量方程中的压力功与总焓守恒

用总焓 $H=h+\frac{1}{2}|\mathbf{u}|^2$ 书写的能量方程是

$$
\frac{\partial(\rho E)}{\partial t}+\nabla\cdot(\rho H\mathbf{u})=\nabla\cdot(k\nabla T)+\nabla\cdot(\boldsymbol{\tau}\cdot\mathbf{u})+q_v
$$

$E=e+\frac{1}{2}|\mathbf{u}|^2$ 为总能量，$\boldsymbol{\tau}\cdot\mathbf{u}$ 是黏性功，它同时包含黏性耗散与压力功的贡献。稳态、绝热、无外功时，方程右端只剩黏性功，且对绝热壁面其积分为零，于是 $\nabla\cdot(\rho H\mathbf{u})=0$，即总焓沿流线守恒。这条性质是诊断高速算例的第一把尺子：若绝热无外功的算例里 $T_0$ 沿流线变了，问题一定在能量方程形式或边界定义，而不在格式。

### 什么时候总量关系不再成立

等熵总量关系建立在理想气体、定比热比两个假设上。空气的 $\gamma=1.4$ 在 800 K 以下误差小于 1%；到 1200 K 时振动自由度被激发，$\gamma$ 降到约 1.33；2500 K 以上开始离解，$\gamma$ 与 $R$ 都随温度变化，此时必须用真实气体模型。水蒸气在 400 K 附近 $\gamma\approx1.33$，燃气约 1.33，都不能套 1.4。另外，跨激波后仍用等熵关系反算 $p_0$ 会系统性高估下游总压，应改用正激波关系。

### 算例：M=0.85 外流的总温、总压与壁面热流

空气取 $\gamma=1.4$、$R=287\ \mathrm{J/(kg\cdot K)}$、$c_p=1005\ \mathrm{J/(kg\cdot K)}$、$Pr=0.72$，来流 $T=288.15\ \mathrm{K}$、$p=50000\ \mathrm{Pa}$、$M=0.85$。

先算声速与流速：

$$
a=\sqrt{\gamma RT}=\sqrt{1.4\times287\times288.15}=340.3\ \mathrm{m/s},\qquad U=Ma=0.85\times340.3=289.2\ \mathrm{m/s}
$$

再算总温与总压：

$$
T_0=288.15\times(1+0.2\times0.7225)=288.15\times1.1445=329.8\ \mathrm{K}
$$

$$
\frac{p_0}{p}=1.1445^{3.5}=1.604,\qquad p_0=1.604\times50000=80200\ \mathrm{Pa}
$$

用总焓交叉核对：$\frac{U^2}{2}=289.2^2/2=41818\ \mathrm{J/kg}$，$c_pT=1005\times288.15=289591\ \mathrm{J/kg}$，两者之和 $331409\ \mathrm{J/kg}$；而 $c_pT_0=1005\times329.8=331449\ \mathrm{J/kg}$，相对偏差 $0.012\%$，仅来自四舍五入。

层流恢复因子 $r=Pr^{1/3}=0.72^{1/3}=0.896$，绝热壁温

$$
T_{aw}=288.15\times(1+0.896\times0.2\times0.7225)=288.15\times1.1295=325.5\ \mathrm{K}
$$

比总温低 $4.3\ \mathrm{K}$。若壁面维持 $T_w=350\ \mathrm{K}$、$h=150\ \mathrm{W/(m^2\cdot K)}$，则

$$
q''_w=150\times(350-325.5)=3675\ \mathrm{W/m^2}
$$

热流由壁面流向流体。若误用静温 $288.15\ \mathrm{K}$ 作参考，会得到 $9278\ \mathrm{W/m^2}$，高估 2.5 倍。

```python
g, R, cp, Pr = 1.4, 287.0, 1005.0, 0.72
T, p, M, Tw, h = 288.15, 50000.0, 0.85, 350.0, 150.0
a = (g * R * T) ** 0.5                 # 340.3 m/s
U = M * a                              # 289.2 m/s
T0 = T * (1 + (g - 1) / 2 * M**2)      # 329.8 K
p0 = p * (1 + (g - 1) / 2 * M**2) ** (g / (g - 1))   # 80200 Pa
r = Pr ** (1.0 / 3.0)                  # 0.896
Taw = T * (1 + r * (g - 1) / 2 * M**2) # 325.5 K
q_w = h * (Tw - Taw)                   # 3675 W/m^2
print(a, U, T0, p0, r, Taw, q_w)
```

## 异常诊断与失效模式

### 诊断表：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $\varepsilon_{T_0}=3\%$ 且绝热无外功 | 用了简化能量形式，压力功被丢弃 | 换总能量形式重算，比较 $T_0$ 场的极差 |
| 进出口质量流量差 2.4% | 积分面落在回流区，或出口边界反射 | 把积分面向上游平移两个边界层厚度再积一次 |
| 喉部流量比手算高 3.7% | 入口把总温当静温，或喉部面积用了网格面积 | 用 $\rho^*A^*a^*$ 复核，核对几何喉道面积 |
| 激波后总压比解析值高 3.7% | 激波涂抹过宽，损失被低估 | 加密激波法向网格并比较 $p_{0,2}/p_{0,1}$ |
| 出口压力与内部压力差 5% 且不收敛 | 超声速出口被施加了静压 | 移除出口压力条件后重算，观察是否消失 |

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 绝热无外功算例里 $T_0$ 沿流线变化超过 1% | 能量方程用了简化温度形式，丢了压力功或耗散 | 换总能量形式重算，比较 $T_0$ 场的最大最小差 |
| 入口给静压后总压比预期低 60% | 把总压边界当静压使用，等于少给了一个滞止量 | 核对 $p+\frac{1}{2}\rho U^2$ 与指定值是否一致 |
| 绝热壁面算出非零热流 | 壁温条件不是零梯度，或参考温度用错 | 检查壁面是否设为零梯度并比较 $T_w$ 与 $T_{aw}$ |
| $M>1$ 区下游总压高于上游 | 跨激波仍套等熵关系 | 用正激波总压比公式核对 |
| 燃气算例整体偏差 8% | 比热比按 1.4 取值，实际约 1.33 | 用 $c_p(T)$ 反算当地 $\gamma$ 并重算总温 |

### 绝热壁温与恢复因子

真实壁面有摩擦加热，绝热壁温不等于静温，也不完全等于总温，而由恢复因子 $r$ 决定：

$$
T_{aw}=T\left(1+r\frac{\gamma-1}{2}M^2\right),\qquad r\approx Pr^{1/3}\ (\text{层流}),\quad r\approx Pr^{1/2}\ (\text{湍流})
$$

空气 $Pr\approx0.72$ 时，层流 $r\approx0.896$，湍流 $r\approx0.849$。壁面热流必须用绝热壁温而不是静温或总温作参考：

$$
q''_w=h(T_w-T_{aw})
$$

用错参考温度会让热流符号都反过来：以静温作参考时，冷壁可能被算成受热。

## 验证、验收与复现

### 喉部临界流量：手算与 CFD 对照

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

### 验证记录该留什么

记录里至少包含：$\varepsilon_{T_0}$ 的数值与采样时间、进出口质量流量与相对差、喉部临界流量的手算值与 CFD 值、激波前后 $p_0$ 比与解析值的偏差、三套网格上的出口马赫数。把这五项与所用 $\gamma$、$R$ 一起归档，任何人重跑时都能判断偏差来自物性、边界还是网格。若手算与 CFD 的偏差在加密后稳定收敛到 1% 以内，就可以认为该工况的结果已经闭合。

### 总温场是最便宜的一致性检验

绝热、无外功、无体源时，总温沿流线守恒：

$$
T_0=T+\frac{|\mathbf{u}|^2}{2c_p}
$$

把 CFD 的 $T_0$ 场做一次统计，取全场最大值与最小值之差，除以平均值：

$$
\varepsilon_{T_0}=\frac{\max T_0-\min T_0}{\bar T_0}
$$

在纯内流、绝热壁面、无激波的算例里，$\varepsilon_{T_0}$ 应低于 0.5%。若达到 3%，先查能量方程形式与壁面热条件，再查边界是否把总温当静温。跨激波算例里 $T_0$ 仍应守恒（这是它与 $p_0$ 的关键区别），因此这道检验对含激波算例同样有效。

### 质量流量的双路核对

稳态内流应满足

$$
\dot m_{in}=\dot m_{out},\qquad \dot m=\int_A \rho \mathbf{u}\cdot\mathbf{n}\,dA
$$

工程容差取 0.5%：亚声速算例可到 0.1%，含强激波或大分离的算例放宽到 1%。若差到 2% 以上，通常不是格式问题，而是边界反射或出口回流让积分面不再位于均匀区。做法是把积分面向上游平移两个当地边界层厚度再积一次，若差值随位置剧烈变化，说明积分面选错了。

### 激波总压损失的核对

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

### 边界反射与超定欠定

超声速出口上施加静压会在出口形成驻波，表现为出口面压力与相邻内部单元压力持续存在 5% 以上的差。诊断方法是把出口压力监测点向内平移 10 个单元，若两点压力差随迭代不下降，说明边界在向上游注入扰动。亚声速入口只给一个量则会出现总压缓慢漂移。两类问题的共同根源都是边界指定量与当地马赫数不匹配，与格式和网格无关。

## 参考资料

1. Anderson J.D., *Modern Compressible Flow: With Historical Perspective*, 3rd ed., McGraw-Hill, 2003.
2. Shapiro A.H., *The Dynamics and Thermodynamics of Compressible Fluid Flow*, Ronald Press, 1953.
3. White F.M., *Viscous Fluid Flow*, 3rd ed., McGraw-Hill, 2006.
4. Kays W.M., Crawford M.E., Weigand B., *Convective Heat and Mass Transfer*, 4th ed., McGraw-Hill, 2005.
5. Liepmann H.W., Roshko A., *Elements of Gasdynamics*, Wiley, 1957.
6. Zucrow M.J., Hoffman J.D., *Gas Dynamics*, Vol. 1, Wiley, 1976.
7. Toro E.F., *Riemann Solvers and Numerical Methods for Fluid Dynamics*, 3rd ed., Springer, 2009.
8. Thompson P.A., *Compressible-Fluid Dynamics*, McGraw-Hill, 1972.
9. LeVeque R.J., *Finite Volume Methods for Hyperbolic Problems*, Cambridge University Press, 2002.
10. Hirsch C., *Numerical Computation of Internal and External Flows*, 2nd ed., Butterworth-Heinemann, 2007.
11. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
12. Bertin J.J., Cummings R.M., *Aerodynamics for Engineers*, 6th ed., Pearson, 2014.
