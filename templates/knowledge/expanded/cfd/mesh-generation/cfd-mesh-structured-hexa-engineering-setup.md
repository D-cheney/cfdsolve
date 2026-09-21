---
template_version: "flowlab-knowledge/1.0"
slug: cfd-mesh-structured-hexa-engineering-setup
title: "结构六面体网格：工程设置与参数选择"
summary: "把块拓扑、非正交角、长宽比与膨胀率三个可控量写成可核对的取值规则，再用 20 mm 通道算例把首层厚度、线性节点分布与 y+ 一次算清，并给出 blockMeshDict 的可复算写法。"
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
  - "结构六面体网格"
  - "工程设置与参数选择"
  - "O 型网格"
  - "膨胀率"
seo:
  title: "结构六面体网格：工程设置与参数选择"
  description: "把块拓扑、非正交角、长宽比与膨胀率三个可控量写成可核对的取值规则，再用 20 mm 通道算例把首层厚度、线性节点分布与 y+ 一次算清，并给出 blockMeshDict 的可复算写法。"
  keywords:
    - "结构六面体网格"
    - "工程设置与参数选择"
    - "blockMesh 节点分布"
    - "非正交角"
    - "长宽比"
---

# 结构六面体网格：工程设置与参数选择

结构六面体网格的质量上限在画第一条块边时就确定了，节点分布只是在这个上限之内做分配。本文给出非正交角、长宽比、膨胀率三个可控量的量化口径与取值区间，再用一个 20 mm 高通道算例把首层厚度、节点分布与 y+ 一次算清，最后给出可以直接改用的 blockMeshDict 片段。

## 块拓扑决定了误差的方向性

贴体六面体网格的离散误差有明显的方向性：法向与流向正交时，对流项与扩散项的截断误差各自沿一个网格方向分布，误差可以逐方向诊断；拓扑一旦扭曲，误差就在两个方向之间耦合，任何单方向的加密都收不到效果。

翼型、圆柱这类曲面物面用 O 型拓扑，把物面用一圈四边形包住，前缘处的偏斜可以压到 20° 以内；带尾迹的翼型用 C 型，把尾迹包进块内；H 型只适合远场或规则直通道，它在钝前缘会产生超过 60° 的偏斜。判据很简单：块边界的走向应与主要梯度方向平行，且不得穿过高梯度区。

## 三个质量量的量化口径

非正交角定义为面法向 $\mathbf{n}_f$ 与相邻单元中心连线 $\mathbf{d}$ 的夹角：

$$
\theta_{non} = \arccos\left(\frac{\mathbf{n}_f \cdot \mathbf{d}}{|\mathbf{n}_f|\,|\mathbf{d}|}\right)
$$

OpenFOAM 的 `checkMesh` 以 `Max non-orthogonality` 报告该量（内部按 180° 减该角度输出），Fluent 报告的 `Maximum Ortho Skew` 是同类指标。工程上限取 65°～70°，超过后扩散项的非正交修正会引入振荡。

膨胀率与长宽比定义为

$$
r = \frac{\Delta x_{i+1}}{\Delta x_i}, \qquad AR = \frac{\Delta x_{stream}}{\Delta t_1}
$$

其中 $\Delta t_1$ 是壁面法向首层厚度。$r$ 取 1.1～1.2 最稳，超过 1.3 会让过渡单元畸变；贴体层允许 $AR$ 到 100 以上，核心区建议控制在 20 以内。

## 首层厚度与节点分布的手算

几何增长序列前 $N$ 层的总厚度是等比求和：

$$
L_N = \Delta t_1 \frac{r^{N}-1}{r-1}
$$

取 $\Delta t_1 = 0.05\ \mathrm{mm}$、$r = 1.15$、$N = 20$，则

$$
L_{20} = 0.05 \times \frac{1.15^{20}-1}{0.15} = 0.05 \times 102.4 = 5.12\ \mathrm{mm}
$$

反过来，blockMesh 的单值 `simpleGrading` 是**线性**分布（末层与首层尺寸比等于给定值），不是几何分布。半高 10 mm、20 个单元、比例取 4 时，首层由

$$
N \Delta t_1 \frac{1+s}{2} = 20 \times \Delta t_1 \times \frac{5}{2} = 10\ \mathrm{mm}
$$

解得 $\Delta t_1 = 0.2\ \mathrm{mm}$，末层 $0.8\ \mathrm{mm}$。流向取 2 mm 单元，则 $AR = 2/0.2 = 10$。

这 0.2 mm 的首层是否合格，要用壁面摩擦速度换算。该通道中心速度 $12\ \mathrm{m/s}$、空气 $\nu = 1.5\times10^{-5}\ \mathrm{m^2/s}$，估算 $u_\tau = 0.55\ \mathrm{m/s}$，则

$$
y^+ = \frac{u_\tau \Delta t_1}{\nu} = \frac{0.55 \times 2\times10^{-4}}{1.5\times10^{-5}} = 7.3
$$

7.3 落在缓冲层，壁函数与低雷诺解析都不成立。要落到壁函数可用的 $y^+ = 30$，首层需放宽到 $30 \times 1.5\times10^{-5}/0.55 = 0.82\ \mathrm{mm}$；要真正解析黏性底层，需缩到 $1 \times 1.5\times10^{-5}/0.55 = 0.027\ \mathrm{mm}$。两者相差 30 倍，必须在建块之前定下来。

## blockMeshDict 的两块对称写法

把通道沿中线切成两块，各自从壁面向中心线性放粗，就能得到上下对称的分布：

```text
blocks
(
    hex (0 1 2 3 4 5 6 7)   (500 20 1) simpleGrading (1 4    1)
    hex (4 5 6 7 8 9 10 11) (500 20 1) simpleGrading (1 0.25 1)
);
edges ();

defaultPatch { name walls; type wall; }
```

下块从壁面（首层）到中线（末层）比例为 4，上块方向相反故取 0.25，两块在中线处尺寸连续。生成后用 `checkMesh -allGeometry -allTopology` 核对 `Max non-orthogonality` 与 `Max aspect ratio`，再确认 `Mesh OK`。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 前缘出现周期性压力尖峰 | H 型拓扑在钝前缘偏斜超 60° | 把前缘块换成 O 型，比较同一位置的偏斜角与压力脉动幅值 |
| 加密流向网格后阻力不变 | 误差由壁面法向分辨率主导 | 只加密法向首层，观察阻力变化是否超过 1% |
| 首层 y+ 云图整片落在 5～30 | 首层厚度按几何尺度过小、未做摩擦速度换算 | 用求解器输出的 `wallShearStress` 反算 $u_\tau$，重算 $\Delta t_1$ |
| 通道中心出现速度过冲 | 两侧块在中线不连续或末层过粗 | 沿中线取节点坐标，检查相邻单元尺寸比是否 ≤ 1.3 |
| `checkMesh` 报高非正交但场量光滑 | 远场块角部扭曲，梯度很小 | 在远场做单块正交化，确认目标量变化 < 0.1% |

## 参数台账与复算要求

交付时至少留下：块拓扑图与块边界坐标、首层厚度及其 $u_\tau$ 来源、$r$ 与 $N$、流向单元尺寸、`simpleGrading` 三元组、`checkMesh` 的最大非正交角与最大长宽比、以及目标量在流向加密一倍后的变化量。若首层厚度只写了数值而没写对应的 $u_\tau$ 与 $y^+$，这份台账在换流体或换流速后无法复用。

## 参考文献

1. Thompson J.F., Warsi Z.U.A., Mastin C.W., *Numerical Grid Generation: Foundations and Applications*, North-Holland, 1985.
2. Knupp P., Steinberg S., *Fundamentals of Grid Generation*, CRC Press, 1993.
3. Baker T.J., "Mesh Generation: Art or Science?", *Progress in Aerospace Sciences*, 41(1): 29-63, 2005.
4. Soni B.K., "Grid Generation for Internal Flow Configurations", *Computers & Mathematics with Applications*, 24(5-6): 191-201, 1992.
