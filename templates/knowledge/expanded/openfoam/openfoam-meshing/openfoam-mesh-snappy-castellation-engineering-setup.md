---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-snappy-castellation-engineering-setup
title: "snappyHexMesh 分级切割：工程设置与参数选择"
summary: "给出 castellatedMeshControls 的层级、过渡带、区域加密与单元上限取值方法，用 8 倍律估算内存，并给出 level 跨度与缝隙堵塞的排查路径。"
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
  - "snappyHexMesh 分级切割"
  - "工程设置与参数选择"
  - "castellatedMeshControls"
  - "refinementRegions"
seo:
  title: "snappyHexMesh 分级切割：工程设置与参数选择"
  description: "给出 castellatedMeshControls 的层级、过渡带、区域加密与单元上限取值方法，用 8 倍律估算内存，并给出 level 跨度与缝隙堵塞的排查路径。"
  keywords:
    - "snappyHexMesh 分级切割"
    - "工程设置与参数选择"
    - "refinementSurfaces"
    - "nCellsBetweenLevels"
---

# snappyHexMesh 分级切割：工程设置与参数选择

分级切割阶段只做两件事：按 `level` 把背景六面体逐级二分，再把 `locationInMesh` 所在侧之外的单元删掉。它不移动任何顶点，所以这一阶段得到的网格拓扑最干净，也最容易做定量核算。真正要在这里定下来的参数是层级、过渡带宽、区域加密范围与单元上限，其余都可以放到吸附和加层阶段。

## 层级与单元增长的 8 倍律

第 $\ell$ 级加密把单元边长减半，体积单元数按 8 倍增长：

$$
h_\ell=\frac{h_0}{2^{\ell}},\qquad \frac{N_\ell}{N_0}=8^{\ell}
$$

这条式子决定了内存预算。设计算域 $2.0\times1.0\times0.6\,\mathrm{m}$、背景单元 $h_0=0.05\,\mathrm{m}$，则背景网格 $40\times20\times12=9600$ 个单元。若把一个 $0.3\times0.3\times0.3\,\mathrm{m}$ 的区域加密到 3 级：

$$
h_3=\frac{0.05}{8}=6.25\times10^{-3}\,\mathrm{m},\qquad N=\frac{0.027}{6.25\times10^{-3}\,^{3}}=\frac{0.027}{2.441\times10^{-7}}\approx1.11\times10^{5}
$$

同样体积在 0 级只需 $0.027/1.25\times10^{-4}=216$ 个单元，比值 $1.11\times10^{5}/216\approx512=8^{3}$，与 8 倍律吻合。若把这个区域提到 5 级，$h_5=1.5625\,\mathrm{mm}$，单元数变成 $0.027/3.815\times10^{-9}\approx7.08\times10^{6}$，仅这一个区域就占掉 700 万单元。OpenFOAM 网格加基本场的内存约 1 kB/单元，700 万单元对应约 7 GB，这是 `maxGlobalCells` 必须显式设限的原因。

## 过渡带宽度与层级跨度

`nCellsBetweenLevels` 决定两级之间的缓冲单元数。过渡带几何宽度近似为

$$
d_{trans}\approx n_{cbl}\sum_{k=\ell_{min}}^{\ell_{max}-1}h_k
$$

取 $\ell_{min}=0$、$\ell_{max}=3$、$h_0=0.05\,\mathrm{m}$、$n_{cbl}=3$：$h_0+h_1+h_2=0.05+0.025+0.0125=0.0875\,\mathrm{m}$，过渡带约 $3\times0.0875=0.26\,\mathrm{m}$。这解释了为什么加密区看起来比几何本身大得多——它是层级过渡的代价，不是几何膨胀。把 $n_{cbl}$ 降到 1 能把过渡带压到 0.088 m，但相邻单元尺寸比会达到 2，`checkMesh` 的 `max skewness` 通常从 1.5 抬到 3 以上。

经验护栏是层级跨度 $\ell_{max}-\ell_{min}\le3$，且 $n_{cbl}$ 取 2～4。跨度大于 3 时，过渡带上会出现尺寸比 8 的相邻面，切割阶段本身不报错，但吸附阶段几乎没有希望把台阶抹平。

## 表面加密与区域加密的字典

```text
castellatedMeshControls
{
    maxLocalCells       2000000;      // 单进程单元上限，超过即停止加密
    maxGlobalCells      20000000;     // 全局上限，配合内存预算
    minRefinementCells  10;           // 少于该数则不加密该区域
    nCellsBetweenLevels 3;
    resolveFeatureAngle 30;           // 法向偏转超过 30° 的特征边加密
    allowFreeStandingZoneFaces true;
    locationInMesh      (1.0 0.5 0.3);

    refinementSurfaces
    {
        body
        {
            level           (2 4);
            patchInfo       { type wall; }
        }
    }

    refinementRegions
    {
        wake
        {
            mode    inside;
            levels  ((1e9 2));        // 尾流区固定 2 级
        }
        inletRefine
        {
            mode    distance;
            levels  ((0.05 3) (0.2 1));   // 距面 0.05 m 内 3 级，0.2 m 内 1 级
        }
    }
}
```

`maxLocalCells` 与 `maxGlobalCells` 是硬刹车：日志里 `Current number of cells` 一旦触顶，snappyHexMesh 会保留当前层级并继续往下走，而不是报错退出，所以必须主动看日志判断是否被截断。`minRefinementCells` 用来过滤极小区域，避免为几个单元付出完整一次加密的代价。

`mode distance` 的 `levels` 是成对的距离-级别表，距离按米给，且必须单调；写成 `((0.2 1) (0.05 3))` 会被解析器拒绝。

## 缝隙与特征的分辨率判据

切割阶段能否保住一条缝，取决于缝宽 $g$ 与局部单元尺寸的比值：

$$
\frac{g}{h_\ell}\ge2
$$

设阀座间隙 $g=1.2\,\mathrm{mm}$，若该处加密到 4 级、$h_4=0.05/16=3.125\,\mathrm{mm}$，则 $g/h_4=0.38$，间隙里连一个完整单元都放不下，切割结果会把两侧壁面合并成一张面，通道消失。要保住它必须把 $\ell$ 提到 $0.05/2^{\ell}\le0.6\,\mathrm{mm}$，即 $2^{\ell}\ge83.3$，取 $\ell=7$（$h_7=0.391\,\mathrm{mm}$，$g/h_7=3.07$）。从 4 级到 7 级，该区域单元数按 $8^{3}=512$ 倍增长，这是必须提前算清的代价。

同理，`resolveFeatureAngle 30` 会为法向偏转超过 $30°$ 的边自动加密；若几何上有 $15°$ 的缓折角而工程上必须保留，就得把它单独放进 `refinementSurfaces` 提高 `level`，或者先把它提成特征边。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 切割阶段内存耗尽 | `maxGlobalCells` 设得过大 | 看日志 `Current number of cells` 的增长曲线与触顶行 |
| 加密区边界出现一层坏单元 | `nCellsBetweenLevels` 取了 1 | 改为 3 重跑，对比 `max skewness` |
| 薄缝被填死 | 缝宽小于 $2h_\ell$ | 量缝宽与局部 $h_\ell$ 之比，必要时提高 `level` |
| 加密没有生效 | `refinementSurfaces` 键名与 STL 名不一致 | 日志中 `Refined from X to Y cells` 的区名 |
| 保留的是固体而不是流体 | `locationInMesh` 落在壳内或面上 | 交换符号重跑，看保留侧是否翻转 |
| 层级在日志里被截断 | 触到 `maxLocalCells` 上限 | 搜索日志中的 `Maximum number of cells reached` |
| 特征边附近出现台阶 | `resolveFeatureAngle` 过大 | 降到 20 重跑，比较特征边两侧单元尺寸 |
| `mode distance` 解析失败 | `levels` 距离未按升序排列 | 检查成对表的单调性 |

## 分阶段验收

切割阶段应单独跑一次，把 `snap` 与 `addLayers` 置 `false`，用 `-overwrite` 之外的方式保留中间网格：

```bash
snappyHexMesh -noFunctionObjects 2>&1 | tee log.castellate
checkMesh -allGeometry -allTopology | tee log.checkMesh.castellate
```

这一阶段的 `checkMesh` 只应关心 `max non-orthogonality`（通常 <10，因为全是正交六面体）、`max aspect ratio`（应接近 1，最多 2）、以及 `number of cells` 与 8 倍律的对照。若切割阶段就出现非正交角超过 20°，说明背景网格本身有问题，继续往下调 snappy 参数没有意义。

记录建议：$h_0$、各 `level`、$n_{cbl}$、$maxGlobalCells$、实际单元数、各 level 的单元数分布、过渡带量测宽度。这七项能唯一确定一次切割配置。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §4.4.1 "Mesh refinement / castellated mesh", 2023.
2. OpenFOAM v11 源码 `src/mesh/snappyHexMesh/refinementSurfaces/`、`refinementRegions/`、`castellatedMeshControls.H`。
3. J. F. Thompson, B. K. Soni, N. P. Weatherill (eds.), *Handbook of Grid Generation*, CRC Press, 1999, Chapter 5 "Cartesian and octree methods".
4. T. J. Baker, "Mesh generation: Art or science?", *Progress in Aerospace Sciences*, 41(1): 29–63, 2005.
5. P. J. Frey, P.-L. George, *Mesh Generation: Application to Finite Elements*, 2nd ed., ISTE/Wiley, 2008, §7.3 "Adaptive refinement and size gradation".
6. OpenFOAM v11 教程 `tutorials/incompressible/simpleFoam/motorBike` 中的 `snappyHexMeshDict`。
