---
template_version: "flowlab-knowledge/1.0"
slug: cfd-thermal-compressible-flow-modeling
title: "可压缩流与总量关系：物理建模与适用边界"
summary: "从总焓守恒出发说明总温总压的建模含义、能量方程中压力功与黏性耗散的取舍、绝热壁温与恢复因子的关系，并给出 M=0.85 外流的总温、总压、恢复温度与壁面热流完整换算，以及比热比假设失效的温度门槛。"
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
  - "可压缩流与总量关系"
  - "物理建模与适用边界"
  - "总温"
  - "恢复因子"
seo:
  title: "可压缩流与总量关系：物理建模与适用边界"
  description: "从总焓守恒出发说明总温总压的建模含义、能量方程中压力功与黏性耗散的取舍、绝热壁温与恢复因子的关系，并给出 M=0.85 外流的总温、总压、恢复温度与壁面热流完整换算，以及比热比假设失效的温度门槛。"
  keywords:
    - "可压缩流与总量关系"
    - "物理建模与适用边界"
    - "总温"
    - "恢复因子"
    - "总焓"
---

# 可压缩流与总量关系：物理建模与适用边界

高速流动里，静温与总温相差的动能项可以达到几十开尔文，直接决定壁面热流的方向和大小。本文从总焓守恒出发，说明总量关系在能量方程里的位置、绝热壁温与恢复因子的换算，并给出一次 $M=0.85$ 外流的完整数值链路。

## 静量与总量的定义差别

把流动等熵滞止到零速度，得到的温度、压力、密度就是总参数：

$$
T_0=T\left(1+\frac{\gamma-1}{2}M^2\right),\qquad \frac{p_0}{p}=\left(1+\frac{\gamma-1}{2}M^2\right)^{\frac{\gamma}{\gamma-1}}
$$

$T_0$ 的物理含义是"把这股气流的动能全部转回内能后的温度"，它与 $T$ 的差就是 $\frac{U^2}{2c_p}$。$p_0$ 则只在等熵过程里保持不变，任何熵增都会让它下降。两者性质完全不同：$T_0$ 是守恒量，$p_0$ 是损失指标。把 $T_0$ 当作边界输入、把 $p_0$ 当作结果输出，是高速算例里最稳的分工方式。

## 能量方程中的压力功与总焓守恒

用总焓 $H=h+\frac{1}{2}|\mathbf{u}|^2$ 书写的能量方程是

$$
\frac{\partial(\rho E)}{\partial t}+\nabla\cdot(\rho H\mathbf{u})=\nabla\cdot(k\nabla T)+\nabla\cdot(\boldsymbol{\tau}\cdot\mathbf{u})+q_v
$$

$E=e+\frac{1}{2}|\mathbf{u}|^2$ 为总能量，$\boldsymbol{\tau}\cdot\mathbf{u}$ 是黏性功，它同时包含黏性耗散与压力功的贡献。稳态、绝热、无外功时，方程右端只剩黏性功，且对绝热壁面其积分为零，于是 $\nabla\cdot(\rho H\mathbf{u})=0$，即总焓沿流线守恒。这条性质是诊断高速算例的第一把尺子：若绝热无外功的算例里 $T_0$ 沿流线变了，问题一定在能量方程形式或边界定义，而不在格式。

## 绝热壁温与恢复因子

真实壁面有摩擦加热，绝热壁温不等于静温，也不完全等于总温，而由恢复因子 $r$ 决定：

$$
T_{aw}=T\left(1+r\frac{\gamma-1}{2}M^2\right),\qquad r\approx Pr^{1/3}\ (\text{层流}),\quad r\approx Pr^{1/2}\ (\text{湍流})
$$

空气 $Pr\approx0.72$ 时，层流 $r\approx0.896$，湍流 $r\approx0.849$。壁面热流必须用绝热壁温而不是静温或总温作参考：

$$
q''_w=h(T_w-T_{aw})
$$

用错参考温度会让热流符号都反过来：以静温作参考时，冷壁可能被算成受热。

## 什么时候总量关系不再成立

等熵总量关系建立在理想气体、定比热比两个假设上。空气的 $\gamma=1.4$ 在 800 K 以下误差小于 1%；到 1200 K 时振动自由度被激发，$\gamma$ 降到约 1.33；2500 K 以上开始离解，$\gamma$ 与 $R$ 都随温度变化，此时必须用真实气体模型。水蒸气在 400 K 附近 $\gamma\approx1.33$，燃气约 1.33，都不能套 1.4。另外，跨激波后仍用等熵关系反算 $p_0$ 会系统性高估下游总压，应改用正激波关系。

## 算例：M=0.85 外流的总温、总压与壁面热流

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

## 失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 绝热无外功算例里 $T_0$ 沿流线变化超过 1% | 能量方程用了简化温度形式，丢了压力功或耗散 | 换总能量形式重算，比较 $T_0$ 场的最大最小差 |
| 入口给静压后总压比预期低 60% | 把总压边界当静压使用，等于少给了一个滞止量 | 核对 $p+\frac{1}{2}\rho U^2$ 与指定值是否一致 |
| 绝热壁面算出非零热流 | 壁温条件不是零梯度，或参考温度用错 | 检查壁面是否设为零梯度并比较 $T_w$ 与 $T_{aw}$ |
| $M>1$ 区下游总压高于上游 | 跨激波仍套等熵关系 | 用正激波总压比公式核对 |
| 燃气算例整体偏差 8% | 比热比按 1.4 取值，实际约 1.33 | 用 $c_p(T)$ 反算当地 $\gamma$ 并重算总温 |

## 参考文献

1. Anderson J.D., *Modern Compressible Flow: With Historical Perspective*, 3rd ed., McGraw-Hill, 2003.
2. Shapiro A.H., *The Dynamics and Thermodynamics of Compressible Fluid Flow*, Ronald Press, 1953.
3. White F.M., *Viscous Fluid Flow*, 3rd ed., McGraw-Hill, 2006.
4. Kays W.M., Crawford M.E., Weigand B., *Convective Heat and Mass Transfer*, 4th ed., McGraw-Hill, 2005.
5. Liepmann H.W., Roshko A., *Elements of Gasdynamics*, Wiley, 1957.
6. Zucrow M.J., Hoffman J.D., *Gas Dynamics*, Vol. 1, Wiley, 1976.
