---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-ale-formulation-engineering-setup
title: "ALE 动网格守恒形式：工程设置与参数选择"
summary: "把 ALE 动网格从概念落到可运行的字典设置：网格速度与几何守恒律如何进入求解器、动网格柯朗数取多少、纯网格运动如何做零流场自检，并给出活塞压缩算例的逐项手算。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "ALE 动网格守恒形式"
  - "工程设置与参数选择"
  - "几何守恒律"
  - "动网格柯朗数"
seo:
  title: "ALE 动网格守恒形式：工程设置与参数选择"
  description: "把 ALE 动网格从概念落到可运行的字典设置：网格速度与几何守恒律如何进入求解器、动网格柯朗数取多少、纯网格运动如何做零流场自检，并给出活塞压缩算例的逐项手算。"
  keywords:
    - "ALE 动网格守恒形式"
    - "工程设置与参数选择"
    - "几何守恒律"
    - "动网格柯朗数"
    - "velocityLaplacian"
---

# ALE 动网格守恒形式：工程设置与参数选择

ALE 动网格出错的多数场合不是物理选错，而是网格通量与体积变化率没有对上：把流场冻结、只让网格运动，解也会凭空长出或丢掉质量。本文给出把几何守恒律写进字典的具体做法、动网格柯朗数的取值区间，以及活塞压缩算例的逐项手算，可直接当作新算例的自检脚本。

## 网格速度改变了哪一项

ALE 形式与固定网格形式只差一个对流速度：通量按相对速度 $\mathbf{u}-\mathbf{u}_g$ 计算，$\mathbf{u}_g$ 是控制体面自身的运动速度。

$$
\frac{\partial(\rho\phi)}{\partial t}+\nabla\cdot\left(\rho(\mathbf{u}-\mathbf{u}_g)\phi\right)=\nabla\cdot(\Gamma\nabla\phi)+S_\phi
$$

固定网格只是 $\mathbf{u}_g\equiv 0$ 的特例。真正额外的约束来自几何守恒律，它不含流场，只讲控制体自身：

$$
\frac{\mathrm{d}}{\mathrm{d}t}\int_{V(t)}\mathrm{d}V=\oint_{\partial V(t)}\mathbf{u}_g\cdot\mathrm{d}\mathbf{A}
$$

离散到第 $P$ 个单元、时间层 $n$，它成为一条必须逐单元成立的代数恒等式：

$$
V_P^{\,n}-V_P^{\,n-1}=\Delta t\sum_f\left(\mathbf{u}_{g,f}\cdot\mathbf{A}_f\right)
$$

工程上把 $\varphi_{g,f}=\mathbf{u}_{g,f}\cdot\mathbf{A}_f$ 称为网格体积通量。求解器组装对流通量时会直接用它；若体积变化率由几何直接算出而与 $\sum_f\varphi_{g,f}$ 不等，差量就表现为虚假源项，并随步数线性累积。

## 字典里要写对的三处

动网格设置分散在三个文件中，漏一处就会出现网格动了但通量没动。

```
// constant/dynamicMeshDict
dynamicFvMesh       dynamicMotionSolverFvMesh;
motionSolverLibs    ("libfvMotionSolvers.so");
solver              velocityLaplacian;
diffusivity         quadratic inverseDistance 1(piston);

// 0/pointDisplacement —— 边界点位移由运动求解器扩散到内部
piston
{
    type            oscillatingDisplacement;
    amplitude       (0 0.01 0);   // 单侧行程 10 mm
    omega           314.16;        // 2*pi*50 rad/s
    value           uniform (0 0 0);
}

// system/fvSchemes —— 网格量随时间变化后必须用二阶时间格式
ddtSchemes      { default backward; }
```

三点说明。其一，`diffusivity` 取 `quadratic inverseDistance` 时权重正比于 $1/d^2$，$d$ 是到指定 patch 的距离；壁面附近 $d$ 小、权重极大，因此近壁单元接近刚体平移，变形被挤到远场，薄边界层不会被拉坏。其二，`ddtSchemes` 必须给 `backward`，一阶欧拉把网格速度取在旧时间层，会留下与 $\Delta t$ 同阶的守恒偏差。其三，`piston` 面上的流场速度在 `0/U` 中用 `movingWallVelocity`，它与网格速度自动一致，不要手填 `fixedValue`。

## 动网格柯朗数与时间步

限制时间步的量有两个。流场柯朗数 $\mathrm{Co}=|\mathbf{u}|\Delta t/\Delta x$ 管对流稳定性；动网格柯朗数

$$
\mathrm{Co}_{\mathrm{mesh}}=\frac{|\mathbf{u}_g|\,\Delta t}{\Delta x_{\min}}
$$

管单元会不会被自身运动穿过。取 $\mathrm{Co}_{\mathrm{mesh}}\le 0.3$ 时，单元体积一步内变化不超过三成，`velocityLaplacian` 的扩散解稳定；超过 0.5 后 `checkMesh` 常报最小体积趋零甚至为负。

## 活塞压缩算例：一次可核对的手算

缸径 $D=100\ \mathrm{mm}$，活塞面积

$$
A=\pi(0.05\ \mathrm{m})^2=7.854\times10^{-3}\ \mathrm{m^2}
$$

活塞速度 $u_g=2.0\ \mathrm{m/s}$，缸盖附近最小单元尺度 $\Delta x_{\min}=1.0\ \mathrm{mm}$，时间步 $\Delta t=5\times10^{-5}\ \mathrm{s}$（对应 3000 r/min，即 20 ms 一转、每转 400 步）。

单步网格面位移 $u_g\Delta t=2.0\times5\times10^{-5}=1.0\times10^{-4}\ \mathrm{m}=0.10\ \mathrm{mm}$，于是

$$
\mathrm{Co}_{\mathrm{mesh}}=\frac{0.10\ \mathrm{mm}}{1.0\ \mathrm{mm}}=0.10
$$

再从体积侧核对：$\mathrm{d}V/\mathrm{d}t=A u_g=7.854\times10^{-3}\times2.0=1.571\times10^{-2}\ \mathrm{m^3/s}$，单步体积增量 $\Delta V=1.571\times10^{-2}\times5\times10^{-5}=7.854\times10^{-7}\ \mathrm{m^3}$。单元体积 $V=A\Delta x_{\min}=7.854\times10^{-3}\times1.0\times10^{-3}=7.854\times10^{-6}\ \mathrm{m^3}$，故 $\Delta V/V=0.10$，与 $\mathrm{Co}_{\mathrm{mesh}}$ 完全一致，这正是几何守恒律应有的结果。若日志里 cumulative continuity error 与这个量级同阶，问题出在网格通量没跟上体积变化，而不是流场。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 冻结流场、只动网格也出现质量增减 | 离散几何守恒律未满足，$\sum_f\varphi_{g,f}\Delta t$ 与 $\Delta V$ 不等 | 令 `U=0`、只开动网格跑 20 步，比较体积积分与网格通量之和 |
| 行程增大后单元体积出现负值 | 局部网格位移超过单元尺度 | 读 `checkMesh` 最小体积与 $\mathrm{Co}_{\mathrm{mesh}}$，看是否同一步越限 |
| 压力场出现棋盘状振荡 | $\varphi_{g,f}$ 与对流通量用了不同面积矢量或不同符号约定 | 输出 $\varphi$ 与 $\varphi_g$ 逐面比对，核对 owner/neighbour 正向 |
| 时间步减半守恒误差几乎不变 | 误差来自空间插值而非时间积分 | 只加密网格，看误差是否按 $\Delta x^2$ 下降 |
| 动网格算例的 $k$、$\varepsilon$ 出现负值 | 湍流生成项未按相对速度计算 | 冻结网格到同一物理时刻，对比动网格与静网格的 $k$ 场 |
| 每步都有小的同号漂移 | 网格速度取在旧时间层 | 切到 `backward`，观察 cumulative error 是否停止累积 |

## 收敛与验收要看什么

残差只说明代数方程被解开了，不说明网格账目平了。验收至少留三项：每个时间步 `time step continuity errors` 中 global 项相对入口流量的比例，建议小于 $10^{-4}$；冻结流场自检下体积变化与网格通量的相对差，应在机器精度量级；以及目标量对 $\mathrm{Co}_{\mathrm{mesh}}$ 在 0.05 / 0.10 / 0.20 三档下的变化。若第三项在 0.10 到 0.20 之间跳变，说明网格已经承受不住该行程，应先改运动求解器或加密，而不是继续缩时间步。

## 参考资料

1. Hirt C.W., Amsden A.A., Cook J.L., "An arbitrary Lagrangian-Eulerian computing method for all flow speeds", Journal of Computational Physics, 14(3), 1974, 227-253.
2. Demirdžić I., Perić M., "Space conservation law in finite volume calculations of fluid flow", International Journal for Numerical Methods in Fluids, 8(9), 1988, 1037-1050.
3. Farhat C., Lesoinne M., Maman N., "Mixed explicit/implicit time integration of coupled aeroelastic problems: three-field formulation, geometric conservation and distributed solution", International Journal for Numerical Methods in Fluids, 21(10), 1995, 807-835.
4. Donea J., Huerta A., Ponthot J.-Ph., Rodríguez-Ferran A., "Arbitrary Lagrangian-Eulerian methods", Encyclopedia of Computational Mechanics, Vol. 1, Wiley, 2004.
