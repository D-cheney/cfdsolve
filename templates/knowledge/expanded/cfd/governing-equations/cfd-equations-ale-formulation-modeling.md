---
template_version: flowlab-knowledge/1.0
slug: cfd-equations-ale-formulation-modeling
title: ALE 动网格守恒形式：原理与工程设置
summary: >-
  讲清 ALE 为何要人为引入网格速度场、几何守恒律为什么是自由流保持性的前提、扩散权重如何决定变形分配，以及变形量超出分辨率后 ALE
  应该在哪个信号上被放弃。
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
  - ALE 动网格守恒形式
  - 物理建模与适用边界
  - 自由流保持性
  - 网格扩散权重
  - 工程设置与参数选择
  - 几何守恒律
  - 动网格柯朗数
seo:
  title: ALE 动网格守恒形式：原理与工程设置
  description: >-
    讲清 ALE 为何要人为引入网格速度场、几何守恒律为什么是自由流保持性的前提、扩散权重如何决定变形分配，以及变形量超出分辨率后 ALE
    应该在哪个信号上被放弃。
  keywords:
    - ALE 动网格守恒形式
    - 物理建模与适用边界
    - 自由流保持性
    - 网格扩散权重
    - 几何守恒律
    - 工程设置与参数选择
    - 动网格柯朗数
    - velocityLaplacian
---
# ALE 动网格守恒形式：原理与工程设置

ALE 不是一套新物理，而是在拉格朗日与欧拉描述之间插入一个可自由选择的参考运动。这个自由度的代价是：参考运动必须自身满足几何守恒律，否则连均匀来流都无法在动网格上原样保持。本文交代网格速度场的来源、变形在计算域中的分配规律，以及 ALE 应该在什么信号上被换成重叠网格或重划分。ALE 动网格出错的多数场合不是物理选错，而是网格通量与体积变化率没有对上：把流场冻结、只让网格运动，解也会凭空长出或丢掉质量。

## 连续性方程在动网格上的形式变了

把 $\mathbf{u}_g$ 代入守恒律，质量方程变为

$$
\frac{\partial\rho}{\partial t}+\nabla\cdot\left(\rho(\mathbf{u}-\mathbf{u}_g)\right)=0
$$

对常密度流体，$\rho$ 可提出，得到一条与固定网格截然不同的结论：

$$
\nabla\cdot\mathbf{u}=\nabla\cdot\mathbf{u}_g
$$

也就是说，动网格上的不可压流动并不满足 $\nabla\cdot\mathbf{u}=0$，而是与网格体积通量同涨同消。任何按固定网格写死的散度检查、或在动网格上直接读取 $\nabla\cdot\mathbf{u}$ 做诊断的做法都会误判。这条关系同时给出了正确性判据：单元被压缩时 $\nabla\cdot\mathbf{u}_g<0$，流体必须相应地被"挤出"。

## 网格速度场由椭圆方程给出

内部网格速度不是逐点指定的，而是解一个带变系数的拉普拉斯型方程：

$$
\nabla\cdot\left(\gamma(\mathbf{x})\,\nabla\mathbf{u}_g\right)=0,\qquad \gamma=\frac{1}{d^{\alpha}}
$$

$d$ 是单元中心到指定 patch 的距离，$\alpha$ 是阶次。$\alpha=1$ 是线性权重，变形按距离均匀分摊；$\alpha=2$（OpenFOAM 的 `quadratic inverseDistance`）让近壁区刚度按 $d^{-2}$ 急剧上升，近壁几乎刚体平移。这个选择的物理后果是：变形被推给远场的大单元，而不是薄边界层里的小单元。

一次量级估算可以说明差距。域高 $H=50\ \mathrm{mm}$，首层单元 $0.5\ \mathrm{mm}$，壁面单侧位移 $\Delta=2\ \mathrm{mm}$。若按线性权重，首层承担的拉伸量约 $\Delta\times(0.5/50)=0.02\ \mathrm{mm}$，相当于该层被拉长 $4\%$；换成 $\alpha=2$，近壁刚度比远场高 $(50/0.5)^2=10^4$ 倍，首层的拉伸降到 $0.1\%$ 量级。对 $y^+$ 控制而言，前者会把原本 $y^+=1.0$ 的首层推到 $y^+\approx1.04$，后者几乎不变——但代价是远场单元的长宽比明显恶化，因此远场必须留出足够余量。

## 几何守恒律是自由流保持性的前提

几何守恒律要求每个单元的网格通量之和精确等于其体积变化率，这一条与流场无关，却决定了解能否被正确重构。它之所以是建模层面的条件而非实现细节，看一个最简单的例子就清楚：均匀来流 $\mathbf{u}=U\hat{\mathbf{x}}$、$\rho$ 为常数，在任意运动的网格上物理场都应保持常数，因此对每个单元必须有

$$
\sum_f\varphi_f=\sum_f\varphi_{g,f}
$$

即物理通量与网格通量逐单元相等。若体积变化率用几何算、网格通量用插值算，两者不等，这个差就成了每步注入的假源项，解的误差随步数线性增长。满足几何守恒律时，自由流保持性是精确的，与时间步、网格质量无关。这一条可以在自己的求解器上逐单元验证：

```python
# 几何守恒律自检：网格通量之和与几何体积增量逐单元比对
import numpy as np

V_old, V_new = np.load("V_old.npy"), np.load("V_new.npy")   # 单元体积, m^3
phi_g  = np.load("phi_g.npy")                                # 面网格通量, m^3/s
dt     = 5.0e-5                                              # 时间步, s
owner, neighbour = np.load("own.npy"), np.load("nei.npy")

dV_flux = np.zeros_like(V_old)
for f in range(phi_g.size):
    dV_flux[owner[f]]     += phi_g[f] * dt
    if neighbour[f] >= 0:                       # 内部面才有 neighbour
        dV_flux[neighbour[f]] -= phi_g[f] * dt

dV_geo = V_new - V_old
err = np.abs(dV_flux - dV_geo).max() / np.abs(dV_geo).max()
print("max relative GCL error =", err)          # 目标 < 1e-12
```

输出量级若在 $10^{-12}$ 以上，说明体积由几何更新、通量由插值计算，两条路径不一致；此时把两者改为由同一组面位移量导出，即可恢复自由流保持性。

## ALE 站在拉格朗日与欧拉之间

纯拉格朗日让网格随流体走，$\mathbf{u}_g=\mathbf{u}$，对流项消失，但网格很快畸变；纯欧拉让网格不动，$\mathbf{u}_g=0$，网格质量稳定，但界面和自由面被数值扩散抹开。ALE 取中间：网格以任意速度 $\mathbf{u}_g$ 运动，只要求它把关心的界面贴住、同时不让单元畸变。

$$
\mathbf{u}_g=\left.\frac{\partial\mathbf{x}}{\partial t}\right|_{\chi},\qquad \mathbf{x}=\mathbf{x}(\chi,t)
$$

$\chi$ 是参考坐标，与流体质点无关。因此 $\mathbf{u}_g$ 既不是物理量，也不受动量方程约束——它是一个由使用者选定的辅助场，这正是 ALE 灵活与危险并存的原因。

## 什么信号说明 ALE 该退场

最后两行是 ALE 的主要失效边界：一是拓扑必须保持，一旦需要网格合并、分裂或穿透处理，必须换成重叠网格、界面重构或重划分；二是变形必须留在分辨率预算内，首层高度的时间漂移会直接污染壁面通量。用工程语言说，ALE 的适用域由"拓扑不变"和"首层拉伸可忽略"两条边界围成，越界后继续缩时间步只会增加成本而不会恢复精度。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 均匀来流在动网格上不再保持常数 | 几何守恒律未满足，自由流保持性被破坏 | 设均匀来流加网格振荡，看内部场偏差是否随时间单调增长 |
| 变形集中在远场，长宽比失控 | 扩散权重取线性，近壁未刚体化 | 把 `diffusivity` 换成 `quadratic inverseDistance`，对比远场长宽比 |
| 刚体旋转算例的时间步被压到不可用 | 用 ALE 描述纯旋转，网格速度与物理速度同量级 | 换 MRF 或滑移网格，比较各自允许的 $\Delta t$ |
| 接触、穿透或破裂工况下体积变为负 | ALE 要求网格拓扑不变，无法处理合并与分裂 | 检查是否出现面接触或单元穿透 |
| 壁面热流比基准低一截 | 首层被反复拉伸，$y^+$ 在时间上漂移 | 逐时刻输出首层高度与 $y^+$ 的极值 |
| 网格速度场出现高频振荡 | 网格运动与流场双向耦合未做内迭代 | 冻结流场只解网格运动，看场是否平滑 |

## 变形预算的一个可用上限

把动网格柯朗数 $\mathrm{Co}_{\mathrm{mesh}}=|\mathbf{u}_g|\Delta t/\Delta x_{\min}$ 控制在 0.3 以内，就得到单步允许的最大网格速度。以 $\Delta x_{\min}=0.5\ \mathrm{mm}$、$\Delta t=1.0\times10^{-4}\ \mathrm{s}$ 为例：

$$
|\mathbf{u}_g|_{\max}=\frac{0.3\times0.5\ \mathrm{mm}}{1.0\times10^{-4}\ \mathrm{s}}=1.5\ \mathrm{m/s}
$$

若边界做频率 $f=20\ \mathrm{Hz}$ 的正弦运动，峰值速度 $2\pi f a\le1.5\ \mathrm{m/s}$ 给出振幅上限

$$
a\le\frac{1.5}{2\pi\times20}=0.012\ \mathrm{m}\approx12\ \mathrm{mm}
$$

超过这个振幅，要么缩小 $\Delta x_{\min}$（提高分辨率而非降低成本），要么把运动交给重叠网格。这条上限与具体求解器无关，只取决于分辨率预算，因此适合在建模阶段先算一遍，再决定参考运动的描述方式。

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

## 动网格柯朗数与时间步

限制时间步的量有两个。流场柯朗数 $\mathrm{Co}=|\mathbf{u}|\Delta t/\Delta x$ 管对流稳定性；动网格柯朗数

$$
\mathrm{Co}_{\mathrm{mesh}}=\frac{|\mathbf{u}_g|\,\Delta t}{\Delta x_{\min}}
$$

管单元会不会被自身运动穿过。取 $\mathrm{Co}_{\mathrm{mesh}}\le 0.3$ 时，单元体积一步内变化不超过三成，`velocityLaplacian` 的扩散解稳定；超过 0.5 后 `checkMesh` 常报最小体积趋零甚至为负。

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

## 故障模式与判定试验

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

1. Hughes T.J.R., Liu W.K., Zimmermann T.K., "Lagrangian-Eulerian finite element formulation for incompressible viscous flows", Computer Methods in Applied Mechanics and Engineering, 29(3), 1981, 329-349.
2. Thomas P.D., Lombard C.K., "Geometric conservation law and its application to flow computations on moving grids", AIAA Journal, 17(10), 1979, 1030-1037.
3. Lesoinne M., Farhat C., "Geometric conservation laws for flow problems with moving boundaries and deformable meshes, and their impact on aeroelastic computations", Computer Methods in Applied Mechanics and Engineering, 134(1-2), 1996, 71-90.
4. Batina J.T., "Unsteady Euler airfoil solutions using unstructured dynamic meshes", AIAA Journal, 28(8), 1990, 1381-1388.
5. Hirt C.W., Amsden A.A., Cook J.L., "An arbitrary Lagrangian-Eulerian computing method for all flow speeds", Journal of Computational Physics, 14(3), 1974, 227-253.
6. Demirdžić I., Perić M., "Space conservation law in finite volume calculations of fluid flow", International Journal for Numerical Methods in Fluids, 8(9), 1988, 1037-1050.
7. Farhat C., Lesoinne M., Maman N., "Mixed explicit/implicit time integration of coupled aeroelastic problems: three-field formulation, geometric conservation and distributed solution", International Journal for Numerical Methods in Fluids, 21(10), 1995, 807-835.
8. Donea J., Huerta A., Ponthot J.-Ph., Rodríguez-Ferran A., "Arbitrary Lagrangian-Eulerian methods", Encyclopedia of Computational Mechanics, Vol. 1, Wiley, 2004.
