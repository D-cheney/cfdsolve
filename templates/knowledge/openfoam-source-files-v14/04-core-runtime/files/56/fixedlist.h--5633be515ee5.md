---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5633be515ee5"
title: "OpenFOAM 14 源码解析：FixedList.H"
summary: "该文件声明或实现 `FixedList`、`UList`、`SLListBase`、`LList`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/containers/Lists/FixedList/FixedList.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：FixedList.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/containers/Lists/FixedList/FixedList.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：400 行
- 文件标识：`5633be515ee5`

## 2. 功能说明

该文件声明或实现 `FixedList`、`UList`、`SLListBase`、`LList`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：A 1D vector of objects of type \<T\> with a fixed size \<Size\>.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `FixedList` | 60 |
| `UList` | 71 |
| `SLListBase` | 73 |
| `LList` | 75 |
| `Hash` | 102 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`bool.H`](../../../04-core-runtime/files/ea/bool.h--ea2fc16a96bb.md)
- [`label.H`](../../../04-core-runtime/files/a8/label.h--a882f8e92b47.md)
- [`uLabel.H`](../../../04-core-runtime/files/95/ulabel.h--9591ce94b988.md)
- [`Hash.H`](../../../04-core-runtime/files/47/hash.h--47f7216a2177.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- `type_traits`
- `initializer_list`
- [`FixedListI.H`](../../../04-core-runtime/files/be/fixedlisti.h--beac7e660add.md)
- [`FixedList.C`](../../../04-core-runtime/files/86/fixedlist.c--8675c2ef19d6.md)

## 8. 直接上层引用

- [applications/test/FixedList/Test-FixedList.C](../../../17-other-libraries/files/91/test-fixedlist.c--91695b6da9e2.md)
- [src/fvModels/general/radialActuationDisk/radialActuationDisk.H](../../../12-boundaries-sources/files/f8/radialactuationdisk.h--f82b8bb6847d.md)
- [src/lagrangian/basic/particle/particle.H](../../../11-lagrangian/files/a0/particle.h--a0fa02be07f4.md)
- [src/lagrangian/parcel/submodels/Spray/BreakupModel/TAB/TAB.H](../../../11-lagrangian/files/71/tab.h--71d863268e74.md)
- [src/meshTools/cutTriTet/cutTriTet.H](../../../07-mesh-geometry/files/19/cuttritet.h--19b14ba0d042.md)
- [src/meshTools/tetOverlapVolume/tetOverlapVolume.H](../../../07-mesh-geometry/files/28/tetoverlapvolume.h--28f83cfdbb0c.md)
- [src/meshTools/triSurface/triSurfaceTools/pointToPointPlanarInterpolation.H](../../../07-mesh-geometry/files/e7/pointtopointplanarinterpolation.h--e7fd8dd91c5c.md)
- [src/meshTools/triSurface/triSurfaceTools/triSurfaceTools.H](../../../07-mesh-geometry/files/6a/trisurfacetools.h--6ab25699e4cd.md)
- [src/OpenFOAM/algorithms/dynamicIndexedOctree/dynamicIndexedOctree.H](../../../04-core-runtime/files/2b/dynamicindexedoctree.h--2b7fa13d3998.md)
- [src/OpenFOAM/algorithms/indexedOctree/indexedOctree.H](../../../04-core-runtime/files/9d/indexedoctree.h--9dbfd26d8444.md)
- [src/OpenFOAM/containers/Lists/FixedList/FixedList.C](../../../04-core-runtime/files/86/fixedlist.c--8675c2ef19d6.md)
- [src/OpenFOAM/containers/Lists/FixedList/FixedListIO.C](../../../04-core-runtime/files/ab/fixedlistio.c--abe8cb0d1b39.md)
- [src/OpenFOAM/containers/Lists/List/List.C](../../../04-core-runtime/files/6b/list.c--6bd8091308b0.md)
- [src/OpenFOAM/containers/NamedEnum/NamedEnum.H](../../../04-core-runtime/files/34/namedenum.h--3437c5255062.md)
- [src/OpenFOAM/matrices/LduMatrix/LduMatrix/SolverPerformance.H](../../../06-linear-algebra/files/9b/solverperformance.h--9be669b35e36.md)
- [src/OpenFOAM/meshes/boundBox/boundBoxTemplates.C](../../../04-core-runtime/files/f8/boundboxtemplates.c--f8a56662456d.md)
- [src/OpenFOAM/meshes/meshShapes/edge/edge.H](../../../04-core-runtime/files/48/edge.h--4833667a5506.md)
- [src/OpenFOAM/meshes/meshShapes/tetCell/tetCell.H](../../../04-core-runtime/files/9b/tetcell.h--9b229df5eb7e.md)
- [src/OpenFOAM/meshes/meshShapes/triFace/triFace.H](../../../04-core-runtime/files/6a/triface.h--6a1e567bfca7.md)
- [src/OpenFOAM/meshes/primitiveShapes/line/line.H](../../../04-core-runtime/files/7d/line.h--7d2279967432.md)
- [src/OpenFOAM/meshes/primitiveShapes/tetrahedron/tetrahedron.H](../../../04-core-runtime/files/0d/tetrahedron.h--0d25099c939b.md)
- [src/OpenFOAM/meshes/primitiveShapes/triangle/triangle.H](../../../04-core-runtime/files/56/triangle.h--56ca3b5f3594.md)
- [src/OpenFOAM/meshes/treeBoundBox/treeBoundBoxTemplates.C](../../../04-core-runtime/files/6a/treeboundboxtemplates.c--6ae1a7dbfcdc.md)
- [src/parallel/decompose/decompositionMethods/hierarchical/hierarchical.H](../../../13-parallel/files/44/hierarchical.h--44e0a7130c2d.md)
- [src/polyTopoChange/polyTopoChange/hexRef8/refinementHistory.H](../../../07-mesh-geometry/files/41/refinementhistory.h--41c7cb618b4a.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
