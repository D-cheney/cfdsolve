---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-bd59a3288282"
title: "OpenFOAM 14 源码解析：FaceCellWave.H"
summary: "该文件声明或实现 `polyMesh`、`polyPatch`、`transformer`、`FaceCellWave`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/algorithms/FaceCellWave/FaceCellWave.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：FaceCellWave.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/algorithms/FaceCellWave/FaceCellWave.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：388 行
- 文件标识：`bd59a3288282`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`polyPatch`、`transformer`、`FaceCellWave`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Wave propagation of information through grid. Every iteration information goes through one layer of cells. Templated on information that is transferred. Handles parallel and cyclics and non-parallel cyclics. Note: whether to propagate depends on the return value of Type::update which returns true (i.e. propagate) if the value changes by more than a certain tolerance. This tolerance can be very strict for normal face-cell and parallel cyclics (we use a value of 0.01 just to limit propagation of small changes) but for non-parallel cyclics this tolerance can be critical and if chosen too small can lead to non-convergence.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 67 |
| `polyPatch` | 68 |
| `transformer` | 69 |
| `FaceCellWave` | 81 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`PackedBoolList.H`](../../../04-core-runtime/files/6e/packedboollist.h--6eaf5d33f077.md)
- [`DynamicList.H`](../../../04-core-runtime/files/d0/dynamiclist.h--d0fb805f1b2f.md)
- [`primitiveFieldsFwd.H`](../../../04-core-runtime/files/7a/primitivefieldsfwd.h--7a313a3cc235.md)
- [`labelPair.H`](../../../04-core-runtime/files/99/labelpair.h--99ee54a01645.md)
- [`FaceCellWave.C`](../../../07-mesh-geometry/files/2c/facecellwave.c--2c9cb85bfb1b.md)

## 8. 直接上层引用

- [applications/utilities/deprecated/topoSet/topoSetSources/faceZoneSources/setAndPointToFaceZone/setAndPointToFaceZone.C](../../../03-utilities/files/2e/setandpointtofacezone.c--2eaa66585401.md)
- [applications/utilities/mesh/advanced/selectCells/selectCells.C](../../../03-utilities/files/2d/selectcells.c--2d96d40d84b3.md)
- [src/functionObjects/field/layerAverage/layerAverage.C](../../../14-postprocessing/files/53/layeraverage.c--5348dfa80f98.md)
- [src/mesh/snappyHexMesh/meshRefinement/meshRefinementProblemCells.C](../../../07-mesh-geometry/files/4f/meshrefinementproblemcells.c--4f5c81fd4bd2.md)
- [src/meshTools/algorithms/FaceCellWave/FaceCellWave.C](../../../07-mesh-geometry/files/2c/facecellwave.c--2c9cb85bfb1b.md)
- [src/meshTools/algorithms/FaceCellWave/FaceCellWaveName.C](../../../07-mesh-geometry/files/fb/facecellwavename.c--fb44c5af9268.md)
- [src/meshTools/cellClassification/cellClassification.C](../../../07-mesh-geometry/files/50/cellclassification.c--504eded4b322.md)
- [src/meshTools/cellsToCells/cellsToCellsStabilisation/cellsToCellsStabilisation.C](../../../07-mesh-geometry/files/cc/cellstocellsstabilisation.c--cca72a971aa9.md)
- [src/meshTools/mappedPatches/mappedExtrudedPatchBase/mappedExtrudedPatchBase.C](../../../07-mesh-geometry/files/eb/mappedextrudedpatchbase.c--eb99d93dd128.md)
- [src/meshTools/meshStructure/meshStructure.C](../../../07-mesh-geometry/files/c3/meshstructure.c--c34dc55f5562.md)
- [src/meshTools/patchDist/patchDistWave/patchDistWave.C](../../../07-mesh-geometry/files/0d/patchdistwave.c--0d1fc8ff2079.md)
- [src/meshTools/regionSplit/regionSplit.C](../../../07-mesh-geometry/files/32/regionsplit.c--325739a932a7.md)
- [src/parallel/decompose/decompositionMethods/decompositionMethod/decompositionMethod.C](../../../13-parallel/files/c1/decompositionmethod.c--c1194bcc0467.md)
- [src/parallel/decompose/decompositionMethods/structured/structured.C](../../../13-parallel/files/be/structured.c--be1db41d7612.md)
- [src/polyTopoChange/meshCut/directions/directions.C](../../../07-mesh-geometry/files/88/directions.c--885e43bca0b6.md)
- [src/polyTopoChange/polyTopoChange/hexRef8/hexRef8.C](../../../07-mesh-geometry/files/5f/hexref8.c--5fea5dbb8cd1.md)
- [src/renumber/renumberMethods/structuredRenumber/OppositeFaceCellWave.H](../../../17-other-libraries/files/6a/oppositefacecellwave.h--6aeb1ea7ed59.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
