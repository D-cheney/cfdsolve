---
template_version: "flowlab-knowledge/1.0"
slug: cfd-mesh-tetra-polyhedral-engineering-setup
title: "四面体与多面体网格：工程设置与参数选择"
summary: "用体积与尺寸场换算出四面体与多面体的单元量级，说明多面体转换的自由度来源，并给出尺寸场、棱柱层与梯度格式的可复算配置与取值依据。"
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
  - "四面体与多面体网格"
  - "工程设置与参数选择"
  - "尺寸场"
  - "Delaunay 剖分"
seo:
  title: "四面体与多面体网格：工程设置与参数选择"
  description: "用体积与尺寸场换算出四面体与多面体的单元量级，说明多面体转换的自由度来源，并给出尺寸场、棱柱层与梯度格式的可复算配置与取值依据。"
  keywords:
    - "四面体网格"
    - "多面体网格"
    - "尺寸场"
    - "棱柱层"
    - "最小二乘梯度"
---

# 四面体与多面体网格：工程设置与参数选择

四面体网格的自动生成能力最强，代价是同等分辨率下单元数最多、梯度重建误差最大；多面体网格通过合并相邻四面体降低单元数并增加每个单元的邻居数，从而改善梯度和对流项的精度。本文把「尺寸场 → 单元数 → 单元类型 → 梯度格式」这条链条上的每个取值算清楚，避免只凭默认参数交付。

## 尺寸场如何决定单元量级

均匀尺寸 $h$ 下填充体积 $V$ 所需的正则四面体数量，由正则四面体体积 $h^3/(6\sqrt{2})$ 直接得到：

$$
N_{tet} \approx \frac{6\sqrt{2}\,V}{h^3} \approx \frac{8.485\,V}{h^3}
$$

取边长 $0.1\ \mathrm{m}$ 的立方体，$V = 1.0\times10^{-3}\ \mathrm{m^3}$，尺寸场给 $h = 5\ \mathrm{mm}$：

$$
N_{tet} \approx \frac{8.485 \times 1.0\times10^{-3}}{(5\times10^{-3})^3} = \frac{8.485\times10^{-3}}{1.25\times10^{-7}} \approx 6.8\times10^{4}
$$

多面体网格由四面体合并得到，单元数大致降到四分之一，但每个单元的面数与邻居数上升：

$$
N_{poly} \approx \frac{N_{tet}}{4}, \qquad \bar{N}_{f} \approx 14\sim16
$$

即同一个立方体约 $1.7\times10^{4}$ 个多面体单元。单元数下降不等于内存下降：多面体的面数约为四面体的 2 倍，面数据量（面心、面法向、面面积、左右单元索引）随面数线性增长，实际内存通常只降到 60%～70%。

## 表面尺寸与棱柱层的叠加

物面三角化的面片数按面积换算：

$$
N_{tri} \approx \frac{2A}{\sqrt{3}\,h_s^{2}} \approx \frac{2.309\,A}{h_s^{2}}
$$

壁面面积 $A = 0.05\ \mathrm{m^2}$、表面尺寸 $h_s = 2\ \mathrm{mm}$ 时，$N_{tri} \approx 2.309 \times 0.05/(4\times10^{-6}) \approx 2.9\times10^{4}$ 个面片。棱柱层沿法向按几何增长叠加：

$$
L_n = \Delta t_1 \frac{r^{n}-1}{r-1}
$$

取 $\Delta t_1 = 0.05\ \mathrm{mm}$、$r = 1.2$、$n = 12$，则

$$
L_{12} = 0.05 \times \frac{1.2^{12}-1}{0.2} = 0.05 \times 39.58 = 1.98\ \mathrm{mm}
$$

棱柱单元数约为 $2.9\times10^{4} \times 12 \approx 3.5\times10^{5}$，已经超过核心区四面体的量级——这是四面体流程最常见的成本误判来源。

## 梯度重建对单元类型的敏感度

最小二乘梯度用邻居差构造：

$$
\nabla\phi_P = \left(\sum_j w_j\, \mathbf{d}_j \otimes \mathbf{d}_j\right)^{-1} \sum_j w_j (\phi_j-\phi_P)\, \mathbf{d}_j
$$

其中 $\mathbf{d}_j$ 是 $P$ 到邻居 $j$ 的位移，$w_j$ 是权重。四面体的 $\mathbf{d}_j$ 只有 4 个方向，矩阵条件数差；多面体有 14 个以上方向，条件数明显改善。工程取值：OpenFOAM 的 `checkMesh` 要求 `Max non-orthogonality` 小于 70°、`Max skewness` 小于 4；Fluent 要求 `Minimum Orthogonal Quality` 大于 0.15、`Maximum Skewness` 小于 0.85。四面体网格在薄壁或尖角处经常突破这两个界限。

## Gmsh 尺寸场配置片段

```geo
SetFactory("OpenCASCADE");
Mesh.CharacteristicLengthMin = 0.002;   // 2 mm
Mesh.CharacteristicLengthMax = 0.020;   // 20 mm
Field[1] = Distance;  Field[1].SurfacesList[] = {1, 2};
Field[2] = Threshold;
Field[2].InField = 1;
Field[2].SizeMin = 0.002;  Field[2].SizeMax = 0.020;
Field[2].DistMin = 0.005;  Field[2].DistMax = 0.080;
Background Field = 2;
Mesh.Algorithm3D = 1;   // Delaunay
```

`DistMin = 5 mm` 保证近壁 2 mm 的细尺寸只在 5 mm 内维持，`DistMax = 80 mm` 让远场回到 20 mm。若把 `DistMax` 写成 8 mm，远场单元会被拖细，单元数按体积三次方增长，成本会翻几倍。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 生成的多面体网格内存不降反升 | 只比较了单元数，未比较面数 | 统计 `nFaces` 与 `nCells` 之比，确认是否超过 8 |
| 薄壁处出现负体积四面体 | 表面尺寸大于壁厚 | 把 $h_s$ 降到壁厚的 1/3 以下重新生成 |
| 压力场出现棋盘式振荡 | 四面体梯度矩阵条件数差 | 同一算例转多面体，比较压力场的相邻单元跳变幅值 |
| 棱柱层单元数超过核心区 | 按体积估算了棱柱层 | 用 $N_{tri}\times n$ 单独估算棱柱单元数 |
| 远场单元数远超预期 | 尺寸场 `DistMax` 设得过小 | 把 `DistMax` 放大到特征长度的 4 倍以上，比较单元数 |

## 参数台账

交付需记录：体积与特征尺寸、表面尺寸 $h_s$、体尺寸 $h$、尺寸场类型与 $DistMin/DistMax$、棱柱首层厚度与 $r$、层数 $n$、预估与实测的 `nCells`/`nFaces`、以及 `checkMesh` 或 Fluent 的质量报告。四面体与多面体的对比必须在相同表面尺寸与相同棱柱层设置下进行，否则差异无法归因到单元类型。

## 参考文献

1. Shewchuk J.R., "Tetrahedral Mesh Generation by Delaunay Refinement", *Proceedings of the 14th Annual Symposium on Computational Geometry*, pp. 86-95, 1998.
2. Perić M., "Flow Simulation Using Control Volumes of Arbitrary Polyhedral Shape", *ERCOFTAC Bulletin*, No. 62, 2004.
3. Frey P.J., George P.L., *Mesh Generation: Application to Finite Elements*, 2nd ed., ISTE/Wiley, 2008.
4. Mavriplis D.J., "Unstructured Grid Techniques", *Annual Review of Fluid Mechanics*, 29: 473-514, 1997.
