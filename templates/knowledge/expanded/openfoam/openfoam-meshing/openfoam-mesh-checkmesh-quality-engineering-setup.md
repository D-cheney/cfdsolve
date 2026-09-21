---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-checkmesh-quality-engineering-setup
title: "checkMesh 质量诊断：工程设置与参数选择"
summary: "逐项解读 checkMesh 输出的非正交角、偏斜度、体积、面权重与 determinant，给出阈值来源、与 meshQualityControls 的对应关系和坏单元定位命令。"
category:
  slug: openfoam-meshing
  name: "OpenFOAM 网格"
level: 工程
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OPENFOAM"
  - "OpenFOAM 网格"
  - "checkMesh 质量诊断"
  - "工程设置与参数选择"
  - "maxNonOrtho"
  - "skewness"
seo:
  title: "checkMesh 质量诊断：工程设置与参数选择"
  description: "逐项解读 checkMesh 输出的非正交角、偏斜度、体积、面权重与 determinant，给出阈值来源、与 meshQualityControls 的对应关系和坏单元定位命令。"
  keywords:
    - "checkMesh 质量诊断"
    - "工程设置与参数选择"
    - "maxNonOrtho"
    - "maxSkewness"
---

# checkMesh 质量诊断：工程设置与参数选择

`checkMesh` 的价值不在于最后那行 `Mesh OK`，而在于几个极值指标以及它们出现在哪里。阈值不是拍脑袋来的：非正交角决定离散格式的非对角占优性，偏斜度决定插值精度，体积比决定压力方程的条件数。知道每个数字对应哪一项数值风险，才能在“改网格”和“改求解器设置”之间做出正确选择。

## 非正交角的定义与阈值来源

面法向 $\mathbf{S}_f$ 与单元中心连线 $\mathbf{d}$ 的夹角即非正交角：

$$
\theta=\arccos\!\left(\frac{\mathbf{d}\cdot\mathbf{S}_f}{|\mathbf{d}|\,|\mathbf{S}_f|}\right)\cdot\frac{180°}{\pi}
$$

拉普拉斯项的标准分解把 $\mathbf{d}$ 拆成沿 $\mathbf{S}_f$ 的正交分量和与之垂直的“非正交修正”分量，修正量随 $\tan\theta$ 增长。$\theta=65°$ 时 $\tan\theta=2.14$，修正项已是正交项的两倍多，隐式求解的非对角占优性开始失效，因此 `meshQualityControls` 的默认 `maxNonOrtho` 就是 65。$\theta$ 超过 70° 时通常需要 2 个以上非正交修正迭代，成本与稳定性同时恶化。

工程上把非正交角按用途分级：$\theta<60°$ 可直接用默认设置；$60°\sim70°$ 需要 `nNonOrthogonalCorrectors 1`；超过 70° 应回到网格阶段处理，而不是靠加修正次数硬撑。

## 偏斜度、体积与面权重

偏斜度衡量单元中心连线与面交点偏离面中心的程度：

$$
\psi=\frac{\left|\mathbf{x}_{f}-\mathbf{x}_{P\!f}\right|}{\left|\mathbf{x}_{N}-\mathbf{x}_{P}\right|}
$$

其中 $\mathbf{x}_{P\!f}$ 是中心连线与面所在平面的交点。`maxInternalSkewness` 默认 4，`maxBoundarySkewness` 默认 20——边界更宽松是因为边界面的插值只有单侧。$\psi>4$ 时面值的线性插值误差可达 $\psi$ 的量级，迎风与中心差分的混合系数会被迫上移，数值扩散随之增大。

单元体积用散度定理从面几何算出，是与几何定义完全独立的一条校验：

$$
V_P=\frac{1}{3}\sum_{f}\mathbf{x}_f\cdot\mathbf{S}_f
$$

若某单元 $V_P$ 为负或与相邻单元的体积比小于 `minVolRatio 0.01`，压力方程就会出现接近奇异的系数。一个边界层算例中，若首层高 $8.57\times10^{-5}\,\mathrm{m}$、面内尺寸 $6.25\times10^{-3}\,\mathrm{m}$，最小单元体积约 $3.35\times10^{-9}\,\mathrm{m^3}$，远高于默认 `minVol 1e-13`，这类薄单元靠体积判据是抓不出来的，必须看长宽比。

长宽比 $AR=h_{\max}/h_{\min}=6.25\times10^{-3}/8.57\times10^{-5}=72.9$。边界层单元到 100 量级属于正常，但 `checkMesh` 的 `max aspect ratio` 会把它报出来，不能据此判定失败。

## 一段真实的 checkMesh 输出

```text
Mesh stats
    points:           1245632
    faces:            3719820
    internal faces:   3562840
    cells:            1208456
    boundary patches: 4
    face zones:       1
    cell zones:       1

Checking geometry...
    Overall domain bounding box (-0.5 -0.25 -0.05) (1.5 0.25 0.05)
    Min volume = 4.2e-13. Max volume = 8.1e-08. Total volume = 0.0125.
    Min face weight (with the boundary) = 0.018. Max face weight = 0.98.
    Mesh non-orthogonality Max: 58.3 average: 9.7
    Max skewness = 2.8 OK.
    Min determinant = 0.0031 OK.
    Max aspect ratio = 72.9 OK.
    Mesh OK.
```

`Total volume = 0.0125` 应与 CAD 的流体域体积对照：域 $2.0\times0.5\times0.1\,\mathrm{m}$ 减去固体后的净体积若为 $0.0125\,\mathrm{m^3}$，说明单位与尺度都没错。这是导入外部网格后最快的一次整体校验。

`average: 9.7` 与 `Max: 58.3` 的差距同样重要：平均值低说明大部分单元健康，最大值只出现在少数位置。用下面的命令把坏单元写出来看位置：

```bash
checkMesh -allGeometry -allTopology -writeSets vtk 2>&1 | tee log.checkMesh
checkMesh -meshQuality -writeSets vtk
```

`-writeSets vtk` 会把 `badFaces`、`badCells` 写成 VTK 集合，直接在 ParaView 里定位到具体位置；若坏单元集中在某个凹角或加层边缘，处理方向就很明确。

## 与 meshQualityControls 的对应

`meshQualityControls` 是 snappyHexMesh 各阶段内部的强制护栏，取值应与 `checkMesh` 默认阈值一致，否则会出现“snappy 说通过、checkMesh 说超标”的矛盾。默认对应关系是：`maxNonOrtho 65` 对 `Mesh non-orthogonality Max`，`maxBoundarySkewness 20` 与 `maxInternalSkewness 4` 对 `Max skewness`，`minVol 1e-13` 对 `Min volume`，`minVolRatio 0.01` 与 `minFaceWeight 0.05` 对 `Min face weight`，`maxConcave 80` 对凹面判定。

把 `maxNonOrtho` 从 65 放宽到 75 确实能让 snappy 少回退几次，但代价是把风险转嫁到求解器上，必须同步把 `nNonOrthogonalCorrectors` 从 0 提到 1 或 2，并在 `fvSolution` 里降低松弛因子。这笔账要算清，不能只看到网格生成变快。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 求解器一开始就发散，`maxNonOrtho` > 70 | 非正交修正不足或网格本身扭曲 | 加 `nNonOrthogonalCorrectors 1` 看是否缓解，不缓解则回网格 |
| `Mesh OK` 但残差平台抬高 | 平均非正交角偏大而非极值超标 | 看 `average:` 数值，>15 时应加密过渡带 |
| `Min determinant` 报警 | 单元过于扭曲，面法向接近共面 | `-writeSets vtk` 定位后局部加密 |
| 压力方程收敛慢 | `Min face weight` 偏低 | 检查面权重最小值及所在 patch |
| 边界层网格报 `high aspect ratio` | 首层薄、面内尺寸大 | 确认 $AR$ 是否 >200，100 量级可接受 |
| `Total volume` 与 CAD 差一个数量级 | 单位是 mm 而字典按 m 解释 | 用 `transformPoints -scale` 缩放后复查 |
| 边界开放 | 几何未封闭或 patch 定义缺面 | 看 `Boundary openness` 的数值与方向 |
| 坏单元集中在凹角 | 加层在凸凹混合处扭曲 | 降低该面 `nSurfaceLayers` 后重跑对比 |

## 归档与复算

质量记录应包含：OpenFOAM 版本、`nCells`、`Total volume`（m³）、`Max non-orthogonality`（°）、`average`（°）、`Max skewness`、`Min determinant`、`Max aspect ratio`、以及坏单元集合文件的哈希。只保留 `Mesh OK` 这一行没有意义——同一行 `Mesh OK` 背后可能是 `average 3°` 也可能是 `average 25°`，两者的求解行为完全不同。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §5.1 "Mesh description and checkMesh", 2023.
2. H. Jasak, *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996, §3.6 "Non-orthogonality and mesh quality".
3. OpenFOAM v11 源码 `src/utilities/mesh/manipulation/checkMesh/checkMesh.C`、`src/OpenFOAM/meshes/polyMesh/polyMeshCheck/polyMeshCheck.C`。
4. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020, §7.4 "Mesh quality and its effect on accuracy".
5. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007, §11.4 "Non-orthogonal grids".
6. F. Moukalled, L. Mangani, M. Darwish, *The Finite Volume Method in Computational Fluid Dynamics*, Springer, 2016, §8.6 "Mesh-induced errors and non-orthogonal correction".
