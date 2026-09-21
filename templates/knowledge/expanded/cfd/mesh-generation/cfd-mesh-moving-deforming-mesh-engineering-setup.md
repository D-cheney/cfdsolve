---
template_version: "flowlab-knowledge/1.0"
slug: cfd-mesh-moving-deforming-mesh-engineering-setup
title: "移动与变形网格：工程设置与参数选择"
summary: "用几何守恒律的体积变化预算确定时间步长，比较拉普拉斯扩散与线弹性两类运动求解器，给出重网格触发条件与 OpenFOAM 动网格配置片段。"
category:
  slug: mesh-generation
  name: "网格与离散质量"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "网格与离散质量"
  - "移动与变形网格"
  - "工程设置与参数选择"
  - "几何守恒律"
  - "拉普拉斯扩散"
seo:
  title: "移动与变形网格：工程设置与参数选择"
  description: "用几何守恒律的体积变化预算确定时间步长，比较拉普拉斯扩散与线弹性两类运动求解器，给出重网格触发条件与 OpenFOAM 动网格配置片段。"
  keywords:
    - "移动与变形网格"
    - "几何守恒律"
    - "拉普拉斯扩散"
    - "重网格"
    - "ALE"
---

# 移动与变形网格：工程设置与参数选择

动网格算例的第一位约束不是 CFL，而是每个时间步内单元体积的变化幅度：体积变化过快会让几何守恒律的离散残差主导动量方程，产生看似「物理」的虚假压力波。本文先给出体积变化预算，再讨论运动求解器的选择与重网格触发条件。

## 几何守恒律与体积变化预算

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

## 网格运动扩散模型的选择

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

## 重网格触发的定量条件

运动求解器无法维持质量时必须重网格化。触发条件不能凭「看起来歪了」判断，应写成数值阈值：

| 触发量 | 阈值 | 说明 |
|---|---|---|
| 最小单元体积比 | $V_{\min}/V_0 < 0.2$ | 相对初始体积 |
| 最大长宽比 | $AR > 500$ | 贴体层除外 |
| 最大非正交角 | $\theta_{non} > 75°$ | 超过扩散修正能力 |
| 单元体积最大/最小比 | $> 10$ | 全场范围 |

重网格化会引入插值误差，因此触发阈值不能设得过紧——频繁重网格化的累积插值误差可能超过网格变形本身的误差。经验上每 50～200 步触发一次比较合理。

## OpenFOAM 动网格配置

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

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场出现非物理脉冲 | 单步体积变化率过大，GCL 残差主导 | 把步长减半，观察脉冲幅值是否随之下降 |
| 运动边界附近单元被压扁 | 扩散系数过强，位移集中在边界 | 改用 `inverseDistance` 并减小指数，比较最小体积 |
| 远场单元跟着大幅移动 | 扩散系数过弱或未指定面 | 检查 `diffusivity` 面列表，比较远场位移 |
| 出现 `Negative cell volume` | 单步位移超过单元尺度 | 反算单步位移与单元边长之比，要求小于 0.2 |
| 重网格化后守恒量跳变 | 插值不守恒或触发过频 | 统计重网格化次数与每次的质量变化 |

## 参数台账

交付需记录：运动边界的速度或位移规律、时间步长、单步体积变化率、运动求解器类型与扩散系数、重网格触发阈值与实际触发次数、以及每次触发后的守恒量变化。若只记录了求解器名称而没有记录扩散系数与对应面，换几何后配置无法复用。

## 参考文献

1. Hirt C.W., Amsden A.A., Cook J.L., "An Arbitrary Lagrangian-Eulerian Computing Method for All Flow Speeds", *Journal of Computational Physics*, 14(3): 227-253, 1974.
2. Demirdžić I., Perić M., "Space Conservation Law in Finite Volume Calculations of Fluid Flow", *International Journal for Numerical Methods in Fluids*, 8(9): 1037-1050, 1988.
3. Jasak H., Tuković Ž., "Automatic Mesh Motion for the Unstructured Finite Volume Method", *Transactions of FAMENA*, 30(2): 1-20, 2006.
4. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
