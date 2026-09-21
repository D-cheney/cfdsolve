---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-snappy-surface-engineering-setup
title: "snappyHexMesh 表面质量：工程设置与参数选择"
summary: "从弦高偏差反算 STL 三角面尺寸与表面加密级别，给出 surfaceCheck、surfaceFeatureExtract 的字段取值和薄壁、自交、法向不一致的定位方法。"
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
  - "snappyHexMesh 表面质量"
  - "工程设置与参数选择"
  - "surfaceCheck"
  - "弦高偏差"
seo:
  title: "snappyHexMesh 表面质量：工程设置与参数选择"
  description: "从弦高偏差反算 STL 三角面尺寸与表面加密级别，给出 surfaceCheck、surfaceFeatureExtract 的字段取值和薄壁、自交、法向不一致的定位方法。"
  keywords:
    - "snappyHexMesh 表面质量"
    - "工程设置与参数选择"
    - "surfaceCheck"
    - "surfaceFeatureExtract"
---

# snappyHexMesh 表面质量：工程设置与参数选择

STL 的表面质量决定了 snappyHexMesh 能贴出多好的壁面，参数只能在这个上限之内调。真正需要在导入前定下来的只有三件事：三角面尺寸是否足以把曲率误差压到容许值、表面是否封闭且法向一致、哪些棱边必须作为特征保留。这三件事都可以在 `snappyHexMesh` 运行之前用 `surfaceCheck` 和 `surfaceFeatureExtract` 判定。

## 弦高偏差决定三角面尺寸

把半径为 $R$ 的圆柱面离散成夹角 $\theta$ 的折线时，弦到弧的最大偏差为

$$
\varepsilon=R\left(1-\cos\frac{\theta}{2}\right)\approx\frac{R\,\theta^{2}}{8}
$$

反解出给定容许偏差 $\varepsilon$ 所需的最大弦长 $a\approx R\theta$：

$$
a\approx\sqrt{8R\varepsilon}
$$

这条式子是把 CAD 公差翻译成网格要求的标准做法。设圆柱半径 $R=0.05\,\mathrm{m}$、允许的表面偏差 $\varepsilon=0.2\,\mathrm{mm}=2\times10^{-4}\,\mathrm{m}$，则

$$
a\approx\sqrt{8\times0.05\times2\times10^{-4}}=\sqrt{8.0\times10^{-5}}=8.94\times10^{-3}\,\mathrm{m}
$$

即三角面弦长不应超过 8.9 mm。若背景网格 $h_0=20\,\mathrm{mm}$，需要 $h_0/2^{\ell}\le8.94\,\mathrm{mm}$，即 $2^{\ell}\ge2.24$，取 $\ell=2$。这与 `refinementSurfaces` 里给该表面 `level (2 3)` 的下限一致：最低 2 级保证曲率偏差达标，最高 3 级用于处理小特征。

反过来，如果拿到的 STL 弦长只有 3 mm，那么表面加密级别只需满足几何特征分辨率，而不必再为曲率买单，可以省下大量单元。

## 特征边提取的夹角判据

`surfaceFeatureExtract` 用 `includedAngle` 判定哪条边算特征边。设两侧三角面外法向为 $\mathbf{n}_1,\mathbf{n}_2$，法向夹角 $\alpha=\arccos(\mathbf{n}_1\cdot\mathbf{n}_2)$，则表面内二面角为 $180°-\alpha$：

$$
\phi_{in}=180°-\arccos\!\left(\mathbf{n}_1\cdot\mathbf{n}_2\right),\qquad \phi_{in}<\text{includedAngle}\;\Rightarrow\;\text{标记为特征边}
$$

平面处 $\mathbf{n}_1=\mathbf{n}_2$、$\phi_{in}=180°$，不会被标记；直角棱 $\alpha=90°$、$\phi_{in}=90°$，只要 `includedAngle` 大于 90° 就会被标记。默认值 150 相当于把法向偏转超过 $30°$ 的边全部收进来。一个 $R=2\,\mathrm{mm}$ 的倒圆若被离散成 20 段，每段转角 $90°/20=4.5°<30°$，不会误判成特征边，这是合理的；但若该圆角只用了 3 段（每段 $30°$），就会整条被标成特征，`snap` 阶段反而会把它锁成折线。

```text
// surfaceFeatureExtractDict
body.stl
{
    extractionMethod    extractFromSurface;
    includedAngle       150;
    subsetFeatures
    {
        nonManifoldEdges    no;
        openEdges           yes;
    }
}
```

## surfaceCheck 的三个必看项

`surfaceCheck` 的输出里有三项直接决定 snappyHexMesh 能不能跑通：封闭性、自交数量、连通部件数。

```bash
surfaceCheck body.stl | tee log.surfaceCheck
surfaceFeatureExtract | tee log.surfaceFeatureExtract
```

典型合格输出应包含 `Surface is closed`、`Surface has no self-intersections`、`Surface has 1 unconnected part`，以及 `Min/max edge length`。若 `unconnected part` 是 2 以上，说明几何里有多余的碎片或垫片，snappyHexMesh 会把它们当成独立实体切割，产生额外的封闭腔体。若 `open edges` 非零，`locationInMesh` 的“内外”判定就没有定义，切割阶段会随机保留一侧。

边长的 min/max 也值得对照：若最小边长是 $1\times10^{-5}\,\mathrm{m}$ 而最大是 $0.5\,\mathrm{m}$，跨度达到 5 万倍，`snap` 阶段在小面上几乎必然过冲。工程做法是先对 STL 做一次简化，把小面合并到 $0.1\,\mathrm{mm}$ 以上，再进入网格流程。

## 薄壁与间隙的判定

壁厚 $t$ 与背景单元 $h_0$ 的比值决定了能不能保住这条通道。经验护栏是

$$
t\ge2h_\ell,\qquad g\ge2h_\ell
$$

其中 $h_\ell$ 是该处加密后的单元尺寸。设换热器翅片厚度 $t=0.8\,\mathrm{mm}$、翅片间距 $g=2.0\,\mathrm{mm}$，背景单元 $20\,\mathrm{mm}$，则需要 $2h_\ell\le0.8\,\mathrm{mm}$，即 $h_\ell\le0.4\,\mathrm{mm}$，对应 $20/2^{\ell}\le0.4$，$\ell\ge5.6$，取 $\ell=6$。若按 6 级加密，$h_6=20/64=0.3125\,\mathrm{mm}$，翅片间只能放 $2.0/0.3125=6.4$ 个单元，勉强可算；若把 $\ell$ 降到 4，$h_4=1.25\,\mathrm{mm}$，间隙里只剩 1.6 个单元，缝隙会被直接填死。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Cannot find a cell outside the mesh` | STL 不封闭或整体法向反 | `surfaceCheck` 的 `Surface is closed` 是否为真 |
| 吸附后壁面出现漏面 | 三角面自交或存在退化面 | `surfaceCheck` 报告的 self-intersection 数量与位置 |
| 尖角被抹圆 | 该棱边未被提取为特征边 | 统计 `.eMesh` 中该棱上的特征点个数 |
| 局部曲面欠解析、出现棱角 | 三角面弦长大于 $\sqrt{8R\varepsilon}$ | 量测 STL 边长并与容许弦长对照 |
| 薄壁通道被填死 | 壁厚小于 $2h_\ell$ | 量测壁厚与局部单元尺寸之比 |
| 出现多余的封闭腔体 | 表面有多个 `unconnected part` | `surfaceCheck` 的连通部件计数 |
| `snap` 在小面上过冲 | 面尺寸跨度过大（>10⁴ 倍） | 对比 `Min/max edge length` |
| 同一个几何每次切割结果不同 | 表面存在非流形边 | `surfaceCheck` 的 `non-manifold edges` 计数 |

## 表面清理与归档

清理顺序建议固定为：合并重复点 → 删除退化三角形 → 修补孔洞 → 统一法向 → 提取特征边。每步之后重跑 `surfaceCheck`，并把三项关键输出抄进记录。用 `surfaceMeshTriangulate` 或 `surfaceReduction` 可以降低面数，但降面会同时放大弦高偏差，必须用 $a\approx\sqrt{8R\varepsilon}$ 复核。

归档内容：原始 STL 的哈希、清理后 STL 的哈希、`log.surfaceCheck`、`log.surfaceFeatureExtract`、`.eMesh` 文件、以及 `refinementSurfaces` 中该表面的 `level` 取值。这五样齐了，换人复算时才能在不动几何的前提下只调网格参数。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §4.3 "Surface preparation" 与 §4.4 snappyHexMesh, 2023.
2. OpenFOAM v11 源码 `src/surfMesh/surfaceCheck/`、`src/utilities/surface/surfaceFeatureExtract/`。
3. J. F. Thompson, B. K. Soni, N. P. Weatherill (eds.), *Handbook of Grid Generation*, CRC Press, 1999, Chapter 1 "Surface definition and chordal deviation".
4. P. J. Frey, P.-L. George, *Mesh Generation: Application to Finite Elements*, 2nd ed., ISTE/Wiley, 2008, §5.2 "Geometric error and sizing".
5. S. J. Owen, "A survey of unstructured mesh generation technology", *Proceedings of the 7th International Meshing Roundtable*, pp. 239–267, 1998.
6. C. Geuzaine, J.-F. Remacle, "Gmsh: a three-dimensional finite element mesh generator with built-in pre- and post-processing facilities", *International Journal for Numerical Methods in Engineering*, 79(11): 1309–1331, 2009.
