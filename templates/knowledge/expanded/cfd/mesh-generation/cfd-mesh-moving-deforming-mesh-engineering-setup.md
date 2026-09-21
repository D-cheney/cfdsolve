---
template_version: flowlab-knowledge/1.0
slug: cfd-mesh-moving-deforming-mesh-engineering-setup
title: 移动与变形网格：工程设置与诊断验证
summary: 用几何守恒律的体积变化预算确定时间步长，比较拉普拉斯扩散与线弹性两类运动求解器，给出重网格触发条件与 OpenFOAM 动网格配置片段。
category:
  slug: mesh-generation
  name: 网格与离散质量
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 网格与离散质量
  - 移动与变形网格
  - 工程设置与参数选择
  - 几何守恒律
  - 拉普拉斯扩散
  - 结果诊断与可信度验证
  - 几何守恒律残差
  - 虚假速度
seo:
  title: 移动与变形网格：工程设置与诊断验证
  description: 用几何守恒律的体积变化预算确定时间步长，比较拉普拉斯扩散与线弹性两类运动求解器，给出重网格触发条件与 OpenFOAM 动网格配置片段。
  keywords:
    - 移动与变形网格
    - 几何守恒律
    - 拉普拉斯扩散
    - 重网格
    - ALE
    - 几何守恒律残差
    - 虚假速度
    - 网格质量退化
    - 时间降阶
---
# 移动与变形网格：工程设置与诊断验证

动网格算例的第一位约束不是 CFL，而是每个时间步内单元体积的变化幅度：体积变化过快会让几何守恒律的离散残差主导动量方程，产生看似「物理」的虚假压力波。本文先给出体积变化预算，再讨论运动求解器的选择与重网格触发条件。动网格算例里最难查的一类问题是「网格在动，但动得不守恒」。残差曲线正常，压力场却出现周期性的非物理脉冲；时间步缩小后脉冲变小，看起来像是显式格式的稳定性问题，实际是几何守恒律的离散残差在驱动虚假速度。

## 基础概念与控制关系

### 几何守恒律与体积变化预算

任意拉格朗日-欧拉（ALE）框架下，控制体自身在运动，必须额外满足空间守恒律（GCL）：

$$
\frac{d}{dt}\int_{V(t)} dV - \oint_{\partial V(t)} \mathbf{u}_g \cdot d\mathbf{A} = 0
$$

其离散形式为

$$
\frac{V^{n+1}-V^{n}}{\Delta t} = \sum_f \mathbf{u}_{g,f}\cdot\mathbf{A}_f
$$

$\mathbf{u}_g$ 是网格速度。若离散形式不严格成立，质量方程会多出一个虚假源项。工程上的控制手段是限制单步体积变化率：

以活塞算例为例，单元边长 2 mm，单元体积 $V_e = (2\times10^{-3})^{3} = 8.0\times10^{-9}\ \mathrm{m^3}$，迎流面面积 $A_f = 4.0\times10^{-6}\ \mathrm{m^2}$，活塞速度 $0.5\ \mathrm{m/s}$。时间步 $\Delta t = 1\times10^{-3}\ \mathrm{s}$ 时，单步位移 $0.5 \times 1\times10^{-3} = 5.0\times10^{-4}\ \mathrm{m}$，扫过体积

$$
\Delta V = A_f \cdot \Delta x = 4.0\times10^{-6} \times 5.0\times10^{-4} = 2.0\times10^{-9}\ \mathrm{m^3}
$$

占单元体积的 $2.0\times10^{-9}/8.0\times10^{-9} = 25\%$。这个比例过大，GCL 残差会明显。把步长降到 $2.5\times10^{-4}\ \mathrm{s}$，单步位移 0.125 mm，$\Delta V/V_e = 6.25\%$，落在可接受区间。判据：单步体积变化率控制在 5%～10% 以内。

### 重网格化插值的守恒性

每次重网格化都要核对守恒量是否连续。诊断量是重网格化前后总质量、总动量与总能量的相对变化：

$$
\epsilon_{remesh} = \frac{\left|\sum_e \phi_e V_e^{new} - \sum_e \phi_e V_e^{old}\right|}{\sum_e \left|\phi_e V_e^{old}\right|}
$$

要求 $\epsilon_{remesh} < 10^{-6}$。同时记录重网格化次数：某算例每 20 步触发一次，累计 200 次，即使单次误差只有 $10^{-6}$，累积也可能达到 $2\times10^{-4}$，对长时程算例不可忽略。

## 工程设置与实施

### 网格运动扩散模型的选择

内部节点的位移由运动求解器分配。最常用的是拉普拉斯扩散：

$$
\nabla\cdot\left(\gamma\,\nabla\mathbf{u}_g\right) = 0
$$

扩散系数 $\gamma$ 决定位移如何随距离衰减。取 $\gamma = 1/d^{2}$（$d$ 为到运动边界的距离）时，位移被强烈限制在边界附近，远场几乎不动，适合小位移；取 $\gamma = 1/d$ 时位移传播更均匀，适合整体运动。

大变形或需要保持单元形状的场合改用线弹性方程：

$$
\nabla\cdot\left[\mu\left(\nabla\mathbf{u}_g + \nabla\mathbf{u}_g^{T}\right) + \lambda\,\mathrm{tr}\left(\nabla\mathbf{u}_g\right)\mathbf{I}\right] = 0
$$

其中 $\mu$、$\lambda$ 是等效剪切模量与拉梅常数，可取 $\mu = 1$、$\lambda = 0$（纯剪切）到 $\lambda = 10\mu$（近不可压，抑制体积变化）。线弹性比拉普拉斯更贵，但在旋转与大幅变形下能保持更好的正交性。

### 重网格触发的定量条件

运动求解器无法维持质量时必须重网格化。触发条件不能凭「看起来歪了」判断，应写成数值阈值：

重网格化会引入插值误差，因此触发阈值不能设得过紧——频繁重网格化的累积插值误差可能超过网格变形本身的误差。经验上每 50～200 步触发一次比较合理。

| 触发量 | 阈值 | 说明 |
|---|---|---|
| 最小单元体积比 | $V_{\min}/V_0 < 0.2$ | 相对初始体积 |
| 最大长宽比 | $AR > 500$ | 贴体层除外 |
| 最大非正交角 | $\theta_{non} > 75°$ | 超过扩散修正能力 |
| 单元体积最大/最小比 | $> 10$ | 全场范围 |

### OpenFOAM 动网格配置

```text
// constant/dynamicMeshDict
dynamicFvMesh   dynamicMotionSolverFvMesh;
motionSolver    displacementLaplacian;

displacementLaplacianCoeffs
{
    diffusivity     inverseDistance 1 (piston);
}

// 变形幅度较大时改用线弹性
// motionSolver  displacementMotionSolver;
// displacementMotionSolverCoeffs { ... }
```

`inverseDistance 1 (piston)` 表示扩散系数按到 `piston` 面距离的一次方倒数衰减。改为 `quadraticDistance` 则按平方倒数，位移更集中在边界附近。生成后需在每个时间步检查 `checkMesh` 的最小体积与最大长宽比，OpenFOAM 会在体积变为负值时直接报 `Negative cell volume` 并终止。

### 网格质量退化轨迹的监控

动网格的质量不是一次检查，而是一条轨迹。需要每若干步记录四个量，并观察它们的走向而非单点值：

轨迹的**斜率**比绝对值更有诊断价值：若正交性在 100 步内从 45° 单调降到 12°，说明运动求解器的扩散系数过弱，位移被推到了不该去的区域；若它在前 20 步就跌到 15° 然后稳定，说明局部几何本身存在窄缝，需要改拓扑而不是调参数。

| 监控量 | 初始值 | 触发重网格 | 备注 |
|---|---|---|---|
| 最小正交性 | 45° | 12° | 从 45° 退化到 12° 时扩散修正失效 |
| 最大偏斜度 | 0.30 | 0.87 | Fluent 上限 0.85 |
| 最大长宽比 | 12 | 320 | 贴体层不计 |
| 体积最大/最小比 | 1.8 | 50 | 超过 10 即需关注 |

### 参数台账

交付需记录：运动边界的速度或位移规律、时间步长、单步体积变化率、运动求解器类型与扩散系数、重网格触发阈值与实际触发次数、以及每次触发后的守恒量变化。若只记录了求解器名称而没有记录扩散系数与对应面，换几何后配置无法复用。

### GCL 残差的复算脚本

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

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场出现非物理脉冲 | 单步体积变化率过大，GCL 残差主导 | 把步长减半，观察脉冲幅值是否随之下降 |
| 运动边界附近单元被压扁 | 扩散系数过强，位移集中在边界 | 改用 `inverseDistance` 并减小指数，比较最小体积 |
| 远场单元跟着大幅移动 | 扩散系数过弱或未指定面 | 检查 `diffusivity` 面列表，比较远场位移 |
| 出现 `Negative cell volume` | 单步位移超过单元尺度 | 反算单步位移与单元边长之比，要求小于 0.2 |
| 重网格化后守恒量跳变 | 插值不守恒或触发过频 | 统计重网格化次数与每次的质量变化 |
| 压力场出现周期性脉冲 | GCL 离散残差驱动虚假速度 | 把步长减半，脉冲幅值应随之下降；同时核算 $u_{spur}/U$ |
| 腔内压力随时间缓慢上升 | 虚假质量源累积 | 统计总质量随步数的漂移率，定位到具体单元 |
| 时间步收敛只有一阶 | 移动边界未满足 GCL | 三档步长计算观测阶 $p_t$，与 1.8 比较 |
| 运动边界附近单元质量骤降 | 扩散系数过弱，位移集中 | 记录正交性轨迹斜率，调整扩散指数 |
| 重网格化后守恒量跳变 | 插值不守恒或触发过频 | 统计 $\epsilon_{remesh}$ 与触发次数 |

## 验证、验收与复现

### 复算与验收

可信的动网格结果需要给出：$R_{GCL}$ 或其相对量级、$u_{spur}/U$、网格质量四量的时间轨迹、时间步收敛研究的观测阶 $p_t$、重网格化次数与每次的 $\epsilon_{remesh}$、以及单步体积变化率。缺少 GCL 量化记录时，即使目标量看起来合理，也无法排除它是由虚假源项补偿得到的。

### GCL 残差与虚假速度的量级换算

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

### 时间精度是否被降阶

移动边界的时间离散若不满足 GCL，会在时间上退化为一阶。诊断方法是做时间步收敛研究：取 $\Delta t$、$\Delta t/2$、$\Delta t/4$ 三档，用同一网格比较目标量（如活塞推力），按

$$
p_t = \frac{1}{\ln 2}\left|\ln\left|\frac{\phi_3-\phi_2}{\phi_2-\phi_1}\right|\right|
$$

计算观测阶。二阶格式应给出 $p_t \approx 1.8\sim2.0$；若实测 $p_t = 1.0$，说明 GCL 未被满足，时间格式实际退化为一阶。这一步能把「时间精度问题」与「网格质量问题」彻底分开。

## 参考资料

1. Hirt C.W., Amsden A.A., Cook J.L., "An Arbitrary Lagrangian-Eulerian Computing Method for All Flow Speeds", *Journal of Computational Physics*, 14(3): 227-253, 1974.
2. Demirdžić I., Perić M., "Space Conservation Law in Finite Volume Calculations of Fluid Flow", *International Journal for Numerical Methods in Fluids*, 8(9): 1037-1050, 1988.
3. Jasak H., Tuković Ž., "Automatic Mesh Motion for the Unstructured Finite Volume Method", *Transactions of FAMENA*, 30(2): 1-20, 2006.
4. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
5. Farhat C., Lesoinne M., Maman N., "Mixed Explicit/Implicit Time Integration of Coupled Aeroelastic Problems", *International Journal for Numerical Methods in Fluids*, 21(10): 807-835, 1995.
6. Farhat C., Geuzaine P., Grandmont C., "The Discrete Geometric Conservation Law and the Nonlinear Stability of ALE Schemes for the Solution of Flow Problems on Moving Grids", *Journal of Computational Physics*, 174(2): 669-694, 2001.
7. Tuković Ž., Jasak H., "A Moving Mesh Finite Volume Interface Tracking Method for Surface Tension Dominated Interfacial Fluid Flow", *Computers & Fluids*, 55: 70-84, 2012.
8. Donea J., Huerta A., Ponthot J.-Ph., Rodríguez-Ferran A., "Arbitrary Lagrangian-Eulerian Methods", *Encyclopedia of Computational Mechanics*, John Wiley & Sons, 2004.
