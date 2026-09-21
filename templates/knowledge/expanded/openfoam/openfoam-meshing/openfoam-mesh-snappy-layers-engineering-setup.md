---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-snappy-layers-engineering-setup
title: "snappyHexMesh 边界层：工程设置与参数选择"
summary: "用几何级数把 nSurfaceLayers、expansionRatio、finalLayerThickness 与首层高度和 y+ 串起来，说明 relativeSizes 的口径差异并给出层覆盖率与塌陷的判定方法。"
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
  - "snappyHexMesh 边界层"
  - "工程设置与参数选择"
  - "addLayersControls"
  - "y+"
seo:
  title: "snappyHexMesh 边界层：工程设置与参数选择"
  description: "用几何级数把 nSurfaceLayers、expansionRatio、finalLayerThickness 与首层高度和 y+ 串起来，说明 relativeSizes 的口径差异并给出层覆盖率与塌陷的判定方法。"
  keywords:
    - "snappyHexMesh 边界层"
    - "工程设置与参数选择"
    - "addLayersControls"
    - "finalLayerThickness"
---

# snappyHexMesh 边界层：工程设置与参数选择

加层阶段沿表面法向挤出棱柱层，把近壁分辨率从“单元数不够”变成“单元形状不对”。参数只有五个真正起作用：`nSurfaceLayers`、`expansionRatio`、`finalLayerThickness`（或 `firstLayerThickness`）、`minThickness`、`relativeSizes`。前四个由几何级数锁死，第五个决定它们是以米为单位还是以局部单元尺寸为单位。

## 层厚几何级数与总厚度

首层厚 $t_1$、增长率 $r$、层数 $n$ 的层厚序列与总厚为

$$
t_k=t_1 r^{\,k-1},\qquad H=t_1\frac{r^{\,n}-1}{r-1}
$$

`addLayersControls` 里给的是末层 $t_n$ 而不是首层，所以要先反解：

$$
t_1=\frac{t_n}{r^{\,n-1}},\qquad r=\left(\frac{t_n}{t_1}\right)^{1/(n-1)}
$$

## relativeSizes 的两种口径

`relativeSizes true` 时，`finalLayerThickness` 是**末层厚度与局部表面单元尺寸之比**。设该处 $h_3=6.25\,\mathrm{mm}$、`finalLayerThickness 0.3`、`expansionRatio 1.2`、`nSurfaceLayers 5`：

$$
t_5=0.3\times6.25=1.875\,\mathrm{mm},\qquad t_1=\frac{1.875}{1.2^{4}}=\frac{1.875}{2.0736}=0.904\,\mathrm{mm}
$$

$$
H=0.904\times\frac{1.2^{5}-1}{0.2}=0.904\times7.4416=6.73\,\mathrm{mm}
$$

总厚 6.73 mm 已经超过表面单元本身（6.25 mm），加层空间不够，`minThickness 0.25`（即 $0.25\times6.25=1.56\,\mathrm{mm}$）会把末几层删掉，层覆盖率随之下降。这是相对口径的副作用：层厚跟着表面单元走。

改成 `relativeSizes false` 并直接给米制值，就能把层厚和表面单元解耦。设目标 $y^+=1$、空气 $\nu=1.5\times10^{-5}\,\mathrm{m^2/s}$、摩擦速度 $u_\tau=0.35\,\mathrm{m/s}$，首层按单元中心口径反算：

$$
t_1=\frac{2\,y^{+}\nu}{u_\tau}=\frac{2\times1\times1.5\times10^{-5}}{0.35}=8.57\times10^{-5}\,\mathrm{m}
$$

即 0.0857 mm。取 $n=5$、$r=1.2$，末层 $t_5=8.57\times10^{-5}\times1.2^{4}=1.777\times10^{-4}\,\mathrm{m}$（0.178 mm），总厚 $H=8.57\times10^{-5}\times7.4416=6.38\times10^{-4}\,\mathrm{m}$（0.638 mm）。同样的 $n$ 和 $r$，两种口径下总厚相差十倍以上，这就是必须写明 `relativeSizes` 的原因。

反过来若目标改用壁面函数区间 $y^+\approx30$，$t_1=2\times30\times1.5\times10^{-5}/0.35=2.57\times10^{-3}\,\mathrm{m}$，总厚 $H=2.57\times10^{-3}\times7.4416=1.91\times10^{-2}\,\mathrm{m}$，接近 19 mm。此时层厚和几何特征尺度同量级，凹角处几乎必然塌陷，所以壁面函数路线宜用粗网格加单层。

## 字典配置与约束项

```text
addLayersControls
{
    relativeSizes           false;
    expansionRatio          1.2;
    finalLayerThickness     1.78e-4;   // m，末层
    minThickness            2.5e-5;    // m，低于此值的层被删除
    nGrow                   0;
    featureAngle            60;
    nRelaxIter              5;
    nSmoothSurfaceNormals   1;
    nSmoothNormals          3;
    nSmoothThickness        10;
    maxFaceThicknessRatio   0.5;       // 层厚/面尺寸上限
    maxThicknessToMedialRatio 0.3;     // 层厚/中轴距离上限
    minMedianAxisAngle      90;
    nBufferCellsNoExtrude   0;
    nLayerIter              50;

    layers
    {
        "body.*"
        {
            nSurfaceLayers  5;
        }
    }
}
```

`minThickness` 是覆盖率的第一杀手：任何一层被挤压到低于该值就整层删除，且删除是逐面进行的，所以覆盖率会呈局部斑块下降。`maxThicknessToMedialRatio 0.3` 限制层厚不超过到中轴距离的 30%，这是凹角和窄缝处的物理约束——两条汇聚壁面之间的空间放不下设定层厚时，snappy 主动收薄而不是产生负体积。

`featureAngle 60` 决定哪些棱边被当作凸角保护。小于 60° 的凸角处，加层方向会因两侧法向冲突而互相挤压，通常需要减小 `nSurfaceLayers` 或单独为该面设层数。

## 层覆盖率的量测

`snappyHexMesh` 日志按 patch 打印层信息，形如 `Layer mesh : cells:N faces:N points:N` 以及各面的层数分布。覆盖率定义为达到设计层数的面占比：

$$
C=\frac{A_{n=n_{target}}}{A_{total}}\times100\%
$$

对一块 0.3 m × 0.2 m 的平板，面积 $0.06\,\mathrm{m^2}$，若日志显示 5 层的面占 $0.055\,\mathrm{m^2}$、3 层的面占 $0.005\,\mathrm{m^2}$，则 $C=91.7\%$，平均层数 $\bar n=(0.055\times5+0.005\times3)/0.06=4.83$。工程上 $C<85\%$ 就应回查 `minThickness` 与 `maxThicknessToMedialRatio`。

还要复核首层实际厚度：提取首层单元中心到壁面的距离，与 $t_1/2$ 对比；若实测等于 $t_1$ 而非 $t_1/2$，说明口径按单元高度，实际 $y^+$ 会翻倍。

```bash
snappyHexMesh -overwrite 2>&1 | tee log.layers
grep -iE "Layer|thickness|failed" log.layers
checkMesh -allGeometry | tee log.checkMesh.layers
postProcess -func writeCellCentres -latestTime
```

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 层覆盖率只有 60% 左右 | `minThickness` 过大导致层被逐面删除 | 把它从 0.25 降到 0.1 相对值重跑，看覆盖率变化 |
| 首层比设计厚十倍 | `relativeSizes true` 下末层随表面单元缩放 | 量首层厚度与表面单元尺寸之比，应等于 `finalLayerThickness` 量级 |
| 凹角与窄缝处层塌陷 | `maxThicknessToMedialRatio` 过大 | 降到 0.3 重跑，统计凹角处层数 |
| 薄缝被两侧层堵死 | 两侧层厚之和超过缝宽 | 量缝宽与 $2H$ 之比，必要时减层数 |
| 层加入后 `maxNonOrtho` 超标 | 凸角处法向冲突，层被扭曲 | 把 `featureAngle` 降到 45 或该面减少层数 |
| 层覆盖率随版本波动 | `nLayerIter` 或 `nRelaxIter` 不足 | 提高到 50/5 后对比同一 patch 的层数分布 |
| 加层阶段反复回退、耗时长 | `meshQualityControls` 阈值过严 | 看日志中 `Layer addition ... failed` 的出现次数 |
| 实测 y+ 是设计值的两倍 | 首层按单元高度而非单元中心口径 | 用 $t_1=2y^+\nu/u_\tau$ 重算并与实测中心距对照 |

## 单因素对照与记录

建议三组对照：`expansionRatio` 取 1.1/1.2/1.3；`nSurfaceLayers` 取 3/5/8；`relativeSizes` 开与关。每组只动一项，输出统一记录 $C$（%）、平均层数、首层实测厚度（mm）、$H$（mm）、`maxNonOrtho`（°）。记录里必须包含 $h_\ell$、$u_\tau$、$\nu$、目标 $y^+$，否则首层厚度无从复核。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §4.4.3 "Adding layers", 2023.
2. OpenFOAM v11 源码 `src/mesh/snappyHexMesh/snappyHexMeshDriver/addLayerCells.C`、`layerParameters.C`。
3. S. B. Pope, *Turbulent Flows*, Cambridge University Press, 2000, §7.1 "Wall-bounded flows and the law of the wall".
4. D. B. Spalding, "A single formula for the law of the wall", *Journal of Applied Mechanics*, 28(3): 455–458, 1961.
5. G. Kalitzin, G. Medic, G. Iaccarino, P. Durbin, "Near-wall behavior of RANS turbulence models and implications for wall functions", *Journal of Computational Physics*, 204(1): 265–291, 2005.
6. F. R. Menter, "Two-equation eddy-viscosity turbulence models for engineering applications", *AIAA Journal*, 32(8): 1598–1605, 1994.
