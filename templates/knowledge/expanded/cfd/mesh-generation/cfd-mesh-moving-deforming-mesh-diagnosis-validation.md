---
template_version: "flowlab-knowledge/1.0"
slug: cfd-mesh-moving-deforming-mesh-diagnosis-validation
title: "移动与变形网格：结果诊断与可信度验证"
summary: "把动网格的异常归因到几何守恒律残差、网格质量退化与时间降阶三条主线，给出虚假速度的量级换算、质量退化监控指标与可执行的判定试验。"
category:
  slug: mesh-generation
  name: "网格与离散质量"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "网格与离散质量"
  - "移动与变形网格"
  - "结果诊断与可信度验证"
  - "几何守恒律残差"
  - "虚假速度"
seo:
  title: "移动与变形网格：结果诊断与可信度验证"
  description: "把动网格的异常归因到几何守恒律残差、网格质量退化与时间降阶三条主线，给出虚假速度的量级换算、质量退化监控指标与可执行的判定试验。"
  keywords:
    - "移动与变形网格"
    - "几何守恒律残差"
    - "虚假速度"
    - "网格质量退化"
    - "时间降阶"
---

# 移动与变形网格：结果诊断与可信度验证

动网格算例里最难查的一类问题是「网格在动，但动得不守恒」。残差曲线正常，压力场却出现周期性的非物理脉冲；时间步缩小后脉冲变小，看起来像是显式格式的稳定性问题，实际是几何守恒律的离散残差在驱动虚假速度。本文给出把这类问题量化定位的流程。

## GCL 残差与虚假速度的量级换算

几何守恒律的离散残差定义为

$$
R_{GCL} = \frac{V^{n+1}-V^{n}}{\Delta t} - \sum_f \mathbf{u}_{g,f}\cdot\mathbf{A}_f
$$

它等价于一个额外的体积源，换算成密度后就是虚假质量源 $\dot m_{spur} = \rho R_{GCL}$。把残差除以面积得到虚假法向速度：

$$
u_{spur} = \frac{R_{GCL}}{A_f}
$$

以活塞算例的单元为例：$V_e = 8.0\times10^{-9}\ \mathrm{m^3}$、单步体积变化 $\Delta V = 2.0\times10^{-9}\ \mathrm{m^3}$、$\Delta t = 1\times10^{-3}\ \mathrm{s}$、迎流面面积 $A_f = 4.0\times10^{-6}\ \mathrm{m^2}$。若网格速度的累加误差为体积变化的 $10^{-6}$，则

$$
R_{GCL} = 10^{-6} \times \frac{2.0\times10^{-9}}{1\times10^{-3}} = 2.0\times10^{-12}\ \mathrm{m^3/s}
$$

$$
u_{spur} = \frac{2.0\times10^{-12}}{4.0\times10^{-6}} = 5.0\times10^{-7}\ \mathrm{m/s}
$$

相对活塞速度 $0.5\ \mathrm{m/s}$ 只有 $10^{-6}$，可忽略。若累加误差恶化到 $10^{-3}$，则 $u_{spur} = 5.0\times10^{-4}\ \mathrm{m/s}$，占活塞速度的 0.1%，已经足以在长时程内改变腔内压力。判据是 $u_{spur}/U < 10^{-5}$。

## 网格质量退化轨迹的监控

动网格的质量不是一次检查，而是一条轨迹。需要每若干步记录四个量，并观察它们的走向而非单点值：

| 监控量 | 初始值 | 触发重网格 | 备注 |
|---|---|---|---|
| 最小正交性 | 45° | 12° | 从 45° 退化到 12° 时扩散修正失效 |
| 最大偏斜度 | 0.30 | 0.87 | Fluent 上限 0.85 |
| 最大长宽比 | 12 | 320 | 贴体层不计 |
| 体积最大/最小比 | 1.8 | 50 | 超过 10 即需关注 |

轨迹的**斜率**比绝对值更有诊断价值：若正交性在 100 步内从 45° 单调降到 12°，说明运动求解器的扩散系数过弱，位移被推到了不该去的区域；若它在前 20 步就跌到 15° 然后稳定，说明局部几何本身存在窄缝，需要改拓扑而不是调参数。

## 时间精度是否被降阶

移动边界的时间离散若不满足 GCL，会在时间上退化为一阶。诊断方法是做时间步收敛研究：取 $\Delta t$、$\Delta t/2$、$\Delta t/4$ 三档，用同一网格比较目标量（如活塞推力），按

$$
p_t = \frac{1}{\ln 2}\left|\ln\left|\frac{\phi_3-\phi_2}{\phi_2-\phi_1}\right|\right|
$$

计算观测阶。二阶格式应给出 $p_t \approx 1.8\sim2.0$；若实测 $p_t = 1.0$，说明 GCL 未被满足，时间格式实际退化为一阶。这一步能把「时间精度问题」与「网格质量问题」彻底分开。

## 重网格化插值的守恒性

每次重网格化都要核对守恒量是否连续。诊断量是重网格化前后总质量、总动量与总能量的相对变化：

$$
\epsilon_{remesh} = \frac{\left|\sum_e \phi_e V_e^{new} - \sum_e \phi_e V_e^{old}\right|}{\sum_e \left|\phi_e V_e^{old}\right|}
$$

要求 $\epsilon_{remesh} < 10^{-6}$。同时记录重网格化次数：某算例每 20 步触发一次，累计 200 次，即使单次误差只有 $10^{-6}$，累积也可能达到 $2\times10^{-4}$，对长时程算例不可忽略。

## GCL 残差的复算脚本

```python
import numpy as np
V_e, dV = 8.0e-9, 2.0e-9        # 单元体积、单步体积变化 [m3]
dt, Af, U = 1.0e-3, 4.0e-6, 0.5 # 步长 [s]、迎流面面积 [m2]、边界速度 [m/s]
for rel in (1e-6, 1e-3):        # 网格速度累加的相对误差
    R = rel * dV / dt
    u_spur = R / Af
    print(f"rel={rel:.0e}  R_GCL={R:.2e} m3/s  "
          f"u_spur={u_spur:.2e} m/s  u_spur/U={u_spur / U:.1e}")
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场出现周期性脉冲 | GCL 离散残差驱动虚假速度 | 把步长减半，脉冲幅值应随之下降；同时核算 $u_{spur}/U$ |
| 腔内压力随时间缓慢上升 | 虚假质量源累积 | 统计总质量随步数的漂移率，定位到具体单元 |
| 时间步收敛只有一阶 | 移动边界未满足 GCL | 三档步长计算观测阶 $p_t$，与 1.8 比较 |
| 运动边界附近单元质量骤降 | 扩散系数过弱，位移集中 | 记录正交性轨迹斜率，调整扩散指数 |
| 重网格化后守恒量跳变 | 插值不守恒或触发过频 | 统计 $\epsilon_{remesh}$ 与触发次数 |

## 复算与验收

可信的动网格结果需要给出：$R_{GCL}$ 或其相对量级、$u_{spur}/U$、网格质量四量的时间轨迹、时间步收敛研究的观测阶 $p_t$、重网格化次数与每次的 $\epsilon_{remesh}$、以及单步体积变化率。缺少 GCL 量化记录时，即使目标量看起来合理，也无法排除它是由虚假源项补偿得到的。

## 参考文献

1. Farhat C., Lesoinne M., Maman N., "Mixed Explicit/Implicit Time Integration of Coupled Aeroelastic Problems", *International Journal for Numerical Methods in Fluids*, 21(10): 807-835, 1995.
2. Farhat C., Geuzaine P., Grandmont C., "The Discrete Geometric Conservation Law and the Nonlinear Stability of ALE Schemes for the Solution of Flow Problems on Moving Grids", *Journal of Computational Physics*, 174(2): 669-694, 2001.
3. Tuković Ž., Jasak H., "A Moving Mesh Finite Volume Interface Tracking Method for Surface Tension Dominated Interfacial Fluid Flow", *Computers & Fluids*, 55: 70-84, 2012.
4. Donea J., Huerta A., Ponthot J.-Ph., Rodríguez-Ferran A., "Arbitrary Lagrangian-Eulerian Methods", *Encyclopedia of Computational Mechanics*, John Wiley & Sons, 2004.
