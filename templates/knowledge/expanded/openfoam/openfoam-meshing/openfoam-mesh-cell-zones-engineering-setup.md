---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-cell-zones-engineering-setup
title: "cellZone 与 faceZone：工程设置与参数选择"
summary: "说明 cellZone 与 faceZone 的生成途径、名字一致性要求、baffle 双面法向约定，以及在 MRF、多孔区与 fvOptions 中引用 zone 时的校验步骤。"
category:
  slug: openfoam-meshing
  name: "OpenFOAM 网格"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OPENFOAM"
  - "OpenFOAM 网格"
  - "cellZone 与 faceZone"
  - "工程设置与参数选择"
  - "baffle"
  - "setsToZones"
seo:
  title: "cellZone 与 faceZone：工程设置与参数选择"
  description: "说明 cellZone 与 faceZone 的生成途径、名字一致性要求、baffle 双面法向约定，以及在 MRF、多孔区与 fvOptions 中引用 zone 时的校验步骤。"
  keywords:
    - "cellZone 与 faceZone"
    - "工程设置与参数选择"
    - "cellZone"
    - "faceZone"
---

# cellZone 与 faceZone：工程设置与参数选择

`cellZone` 是一组单元的名字，`faceZone` 是一组面的名字，两者都是求解器配置里用来“指位置”的句柄：旋转机械区、多孔区、热源区靠 `cellZone` 定位，挡板、内界面、监测截面靠 `faceZone` 定位。它们不是网格质量的一部分，但一旦名字缺失或与字典不匹配，求解器会在读字典时直接中止。这里的工程重点是把 zone 的生成、命名、校验做成一条固定链路。

## 两类 zone 的语义差别

`cellZone` 只记录单元索引集合，没有任何方向信息；`faceZone` 记录面索引集合，并且每个面都有一个**翻转标记**（flipMap），表示该面法向相对于其所属单元的朝向。翻转标记是挡板类应用的命门：

$$
\mathbf{S}_{f,+}=-\mathbf{S}_{f,-},\qquad \sum_{f\in Z}\mathbf{S}_f=\mathbf{0}
$$

对于一张内部挡板，正反两侧法向必须相反，面矢量的矢量和在闭合挡板上为零。若翻转标记搞错，同一个面两侧的通量会按同一方向累加，质量守恒立刻破坏，表现为“加挡板后总流量莫名增加”。

用 `topoSet` 生成 zone 后，写入 `polyMesh` 需要 `setsToZones`，它默认按集合内部的几何关系决定翻转标记；加 `-noFlipMap` 则强制不翻转。对挡板类应用通常保留默认翻转，对薄板两侧都要作为边界的场合则要看清楚再选。

## 由 snappyHexMesh 直接产生 zone

在 `refinementSurfaces` 里加两行，就能让 snappyHexMesh 在生成壁面 patch 的同时把对应的面集和体集写成 zone：

```text
refinementSurfaces
{
    radiator
    {
        level           (2 5);
        patchInfo       { type wall; }
        faceZone        radiatorFaces;
        cellZone        radiatorCells;
        cellZoneInside  inside;
    }
}
```

`cellZoneInside inside` 表示取三角面**内部**的单元作为 `cellZone`；若几何是壳体而流体在外，要改成 `outside`。这个关键字与 `locationInMesh` 是同一套内外判定，几何不封闭时两者会一起出错。

## 用 topoSet 造一个多孔区

若几何里没有实体，只是要在流场中划出一块多孔介质区，用 `topoSet` 按坐标框选最快：

```text
actions
(
    // 先清空，避免残留
    ( clear )

    ( boxToCell
      radiator
      { box (-0.05 -0.05 -0.02) (0.05 0.05 0.02); }
    )

    ( cellSetToCellZone radiatorCells )
);
```

执行后需要把集合转成真正的 zone：

```bash
topoSet -dict system/topoSetDict -noSync 2>&1 | tee log.topoSet.zone
setsToZones -noFlipMap 2>&1 | tee log.setsToZones.zone
checkMesh -allGeometry | grep -A3 "cellZones"
```

体积分数是判断框选是否正确的第一手数据。设框选区域为 $0.1\times0.1\times0.04\,\mathrm{m}=4.0\times10^{-4}\,\mathrm{m^3}$，全域为 $1.0\,\mathrm{m^3}$，则该 zone 体积分数

$$
\phi_V=\frac{V_Z}{V_{total}}=\frac{4.0\times10^{-4}}{1.0}=4.0\times10^{-4}
$$

若单元尺寸 $5\,\mathrm{mm}$，zone 内应有 $4.0\times10^{-4}/1.25\times10^{-7}=3200$ 个单元。`topoSet` 日志中的 `Selected N cells` 若与 3200 相差超过 10%，说明框的边界切到了单元内部，实际选中数会随网格对齐情况浮动，这属于正常现象，但差异过大就要检查坐标单位。

## 引用 zone 的字典校验

`cellZone` 被引用的位置很多，且各自报错方式不同：

```text
// constant/MRFProperties
MRF1
{
    cellZone    rotorCells;
    origin      (0 0 0);
    axis        (0 0 1);
    omega       52.36;      // rad/s，对应 500 rpm
}

// constant/fvOptions
porosity1
{
    type        explicitPorositySource;
    cellZone    radiatorCells;
    selectionMode cellZone;
    explicitPorositySourceCoeffs
    {
        type DarcyForchheimer;
        d   (5e6 5e6 5e6);
        f   (0 0 0);
    }
}
```

转速要换算：500 rpm 对应 $\omega=2\pi\times500/60=52.36\,\mathrm{rad/s}$。这个数字写错不会报错，只会让结果差 60 倍，所以必须在记录里同时留 rpm 和 rad/s 两个口径。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Cannot find cellZone rotorCells` | zone 未写入 `polyMesh` 或名字大小写不符 | `checkMesh` 输出的 cellZones 列表逐字比对 |
| 加挡板后总流量增加 | `faceZone` 翻转标记错误 | 检查面矢量在闭合挡板上的矢量和是否为零 |
| 多孔区压降为零 | 选中单元集为空 | 看 `topoSet` 日志的 `Selected N cells` |
| `0/` 目录缺对应 patch | `faceZone` 未通过 `createPatch`/`createBaffles` 转成 patch | 检查 `constant/polyMesh/boundary` 中是否有该名 |
| 挡板两侧通量不守恒 | 两侧面法向同向 | 取挡板两侧面法向点积，应接近 $-1$ |
| 并行下 zone 只在部分进程存在 | zone 跨 processor 边界未同步 | 逐个检查 `processor*/constant/polyMesh/cellZones` |
| 旋转区没有产生切向速度 | `cellZone` 名对但 `axis` 方向写反 | 交换 `axis` 符号重跑，看切向速度方向 |
| 运行中提示 zone 大小为零 | 框选坐标单位是 mm 而字典按 m | 打印框的 min/max 与网格包围盒对照 |

## 命名与归档约定

zone 名建议带后缀区分用途：`*Cells` 给 cellZone，`*Faces` 给 faceZone，`*Baffle` 给转成 patch 的挡板。这样在 `fvOptions`、`MRFProperties`、`fvSchemes` 里引用时不容易把两类名字写混。

归档时记录：zone 名、类型、生成方式（snappy 直出还是 topoSet 框选）、单元数或面数、体积（m³）或面积（m²）、翻转标记策略（`setsToZones` 是否加 `-noFlipMap`）、以及引用它的字典文件名。这六项能唯一确定一次 zone 配置，换人接手时不必反查 `polyMesh`。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §5.2 "Mesh zones" 与 §5.2.1 topoSet, 2023.
2. OpenFOAM v11 源码 `src/OpenFOAM/meshes/polyMesh/zones/cellZone/cellZone.H`、`faceZone/faceZone.H` 与 `src/utilities/mesh/manipulation/setsToZones/`。
3. OpenFOAM v11 工具文档 `createBaffles`、`createPatch`、`topoSet` 的 `-noFlipMap` 与 `-noSync` 选项说明。
4. H. G. Weller, G. Tabor, H. Jasak, C. Fureby, "A tensorial approach to computational continuum mechanics using object-oriented techniques", *Computers in Physics*, 12(6): 620–631, 1998.
5. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020, §9.5 "Internal boundaries and baffles".
6. F. Moukalled, L. Mangani, M. Darwish, *The Finite Volume Method in Computational Fluid Dynamics*, Springer, 2016, §15.3 "Porous media and source-term treatment in zones".
