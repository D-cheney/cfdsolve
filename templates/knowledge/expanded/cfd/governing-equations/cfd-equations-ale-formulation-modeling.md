---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-ale-formulation-modeling
title: "ALE 动网格守恒形式：物理建模与适用边界"
summary: "讲清 ALE 为何要人为引入网格速度场、几何守恒律为什么是自由流保持性的前提、扩散权重如何决定变形分配，以及变形量超出分辨率后 ALE 应该在哪个信号上被放弃。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "ALE 动网格守恒形式"
  - "物理建模与适用边界"
  - "自由流保持性"
  - "网格扩散权重"
seo:
  title: "ALE 动网格守恒形式：物理建模与适用边界"
  description: "讲清 ALE 为何要人为引入网格速度场、几何守恒律为什么是自由流保持性的前提、扩散权重如何决定变形分配，以及变形量超出分辨率后 ALE 应该在哪个信号上被放弃。"
  keywords:
    - "ALE 动网格守恒形式"
    - "物理建模与适用边界"
    - "自由流保持性"
    - "网格扩散权重"
    - "几何守恒律"
---

# ALE 动网格守恒形式：物理建模与适用边界

ALE 不是一套新物理，而是在拉格朗日与欧拉描述之间插入一个可自由选择的参考运动。这个自由度的代价是：参考运动必须自身满足几何守恒律，否则连均匀来流都无法在动网格上原样保持。本文交代网格速度场的来源、变形在计算域中的分配规律，以及 ALE 应该在什么信号上被换成重叠网格或重划分。

## ALE 站在拉格朗日与欧拉之间

纯拉格朗日让网格随流体走，$\mathbf{u}_g=\mathbf{u}$，对流项消失，但网格很快畸变；纯欧拉让网格不动，$\mathbf{u}_g=0$，网格质量稳定，但界面和自由面被数值扩散抹开。ALE 取中间：网格以任意速度 $\mathbf{u}_g$ 运动，只要求它把关心的界面贴住、同时不让单元畸变。

$$
\mathbf{u}_g=\left.\frac{\partial\mathbf{x}}{\partial t}\right|_{\chi},\qquad \mathbf{x}=\mathbf{x}(\chi,t)
$$

$\chi$ 是参考坐标，与流体质点无关。因此 $\mathbf{u}_g$ 既不是物理量，也不受动量方程约束——它是一个由使用者选定的辅助场，这正是 ALE 灵活与危险并存的原因。

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

## 什么信号说明 ALE 该退场

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 均匀来流在动网格上不再保持常数 | 几何守恒律未满足，自由流保持性被破坏 | 设均匀来流加网格振荡，看内部场偏差是否随时间单调增长 |
| 变形集中在远场，长宽比失控 | 扩散权重取线性，近壁未刚体化 | 把 `diffusivity` 换成 `quadratic inverseDistance`，对比远场长宽比 |
| 刚体旋转算例的时间步被压到不可用 | 用 ALE 描述纯旋转，网格速度与物理速度同量级 | 换 MRF 或滑移网格，比较各自允许的 $\Delta t$ |
| 接触、穿透或破裂工况下体积变为负 | ALE 要求网格拓扑不变，无法处理合并与分裂 | 检查是否出现面接触或单元穿透 |
| 壁面热流比基准低一截 | 首层被反复拉伸，$y^+$ 在时间上漂移 | 逐时刻输出首层高度与 $y^+$ 的极值 |
| 网格速度场出现高频振荡 | 网格运动与流场双向耦合未做内迭代 | 冻结流场只解网格运动，看场是否平滑 |

最后两行是 ALE 的主要失效边界：一是拓扑必须保持，一旦需要网格合并、分裂或穿透处理，必须换成重叠网格、界面重构或重划分；二是变形必须留在分辨率预算内，首层高度的时间漂移会直接污染壁面通量。用工程语言说，ALE 的适用域由"拓扑不变"和"首层拉伸可忽略"两条边界围成，越界后继续缩时间步只会增加成本而不会恢复精度。

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

## 参考资料

1. Hughes T.J.R., Liu W.K., Zimmermann T.K., "Lagrangian-Eulerian finite element formulation for incompressible viscous flows", Computer Methods in Applied Mechanics and Engineering, 29(3), 1981, 329-349.
2. Thomas P.D., Lombard C.K., "Geometric conservation law and its application to flow computations on moving grids", AIAA Journal, 17(10), 1979, 1030-1037.
3. Lesoinne M., Farhat C., "Geometric conservation laws for flow problems with moving boundaries and deformable meshes, and their impact on aeroelastic computations", Computer Methods in Applied Mechanics and Engineering, 134(1-2), 1996, 71-90.
4. Batina J.T., "Unsteady Euler airfoil solutions using unstructured dynamic meshes", AIAA Journal, 28(8), 1990, 1381-1388.
