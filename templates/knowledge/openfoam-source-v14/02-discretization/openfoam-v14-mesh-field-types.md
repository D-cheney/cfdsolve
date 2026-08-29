---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-mesh-field-types
title: OpenFOAM 14 polyMesh、fvMesh、几何量与场类型
summary: 从 points、faces、owner、neighbour 构造多面体拓扑，解释 fvMesh 的体积和面几何量，以及 vol/surface/point 场、内部场和 patch field 的模板组合。
category: { slug: openfoam-v14-discretization, name: OpenFOAM 14 数学与离散 }
level: 进阶
reading_minutes: 20
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, polyMesh, fvMesh, GeometricField, 网格拓扑]
---

# OpenFOAM 14 polyMesh、fvMesh、几何量与场类型

`polyMesh` 保存拓扑，`fvMesh` 在其上增加有限体积几何与离散配置。内部面只有一个 owner 和 neighbour；边界面只有 owner，并由 boundaryMesh 分组为 patch。

## 1. 几何关系

对单元 `P`，体积为 `V_P`，面面积向量 `S_f` 指向 owner 外侧。高斯公式把体积分散度转成面通量和：

```text
\int_{V_P}\nabla\cdot\mathbf{F}\,dV
=\oint_{\partial V_P}\mathbf{F}\cdot d\mathbf{S}
\approx\sum_{f\in P}\mathbf{F}_f\cdot\mathbf{S}_f
```

owner/neighbour 符号使同一内部面通量在相邻单元中一正一负，离散层天然保持局部守恒。

## 2. 场类型

`volScalarField` 是单元中心标量，`volVectorField` 是单元中心矢量，`surfaceScalarField` 常保存面通量。它们是 `GeometricField<Type, PatchField, GeoMesh>` 的常用别名，组合内部值、量纲、边界字段和 mesh 引用。

## 3. patch

几何 patch 描述拓扑连接；`fvPatchField` 描述某个场在该 patch 上的数学边界行为。网格 patch 类型与字段边界类型不是同一层，但耦合边界必须兼容。

## 4. 参考源码

1. `src/OpenFOAM/meshes/polyMesh/`。
2. `src/finiteVolume/fvMesh/fvMesh.H`。
3. `src/finiteVolume/fields/GeometricFields/` 与 `src/finiteVolume/fields/fvPatchFields/`。
