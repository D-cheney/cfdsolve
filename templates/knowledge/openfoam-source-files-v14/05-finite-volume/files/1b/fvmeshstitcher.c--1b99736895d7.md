---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1b99736895d7"
title: "OpenFOAM 14 源码解析：fvMeshStitcher.C"
summary: "该文件实现 `fvMeshStitcher` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/fvMeshStitchers/fvMeshStitcher/fvMeshStitcher.C"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvMeshStitcher.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/fvMeshStitchers/fvMeshStitcher/fvMeshStitcher.C`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：2447 行
- 文件标识：`1b99736895d7`

## 2. 功能说明

该文件实现 `fvMeshStitcher` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `any` | 72 |
| `Foam::fvMeshStitcher::regionNames` | 106 |
| `Foam::fvMeshStitcher::regionMeshes` | 134 |
| `Foam::fvMeshStitcher::polyFacesBfIO` | 170 |
| `Foam::fvMeshStitcher::loadPolyFacesBf` | 190 |
| `Foam::fvMeshStitcher::getPolyFacesBf` | 284 |
| `Foam::fvMeshStitcher::getOrigNbrBfs` | 300 |
| `Foam::fvMeshStitcher::procFacesToIndices` | 463 |
| `Foam::fvMeshStitcher::matchIndices` | 516 |
| `Foam::fvMeshStitcher::nValidIndices` | 634 |
| `Foam::fvMeshStitcher::createCouplings` | 645 |
| `Foam::fvMeshStitcher::createErrorAndEdgeParts` | 731 |
| `Foam::fvMeshStitcher::intersectNonConformalCyclic` | 762 |
| `Foam::fvMeshStitcher::intersectNonConformalMappedWall` | 896 |
| `Foam::fvMeshStitcher::calculateOwnerOrigBoundaryEdgeParts` | 999 |
| `Foam::fvMeshStitcher::applyOwnerOrigBoundaryEdgeParts` | 1164 |
| `Foam::fvMeshStitcher::stabiliseOrigPatchFaces` | 1407 |
| `Foam::fvMeshStitcher::intersect` | 1460 |
| `Foam::fvMeshStitcher::disconnectThis` | 1655 |
| `Foam::fvMeshStitcher::connectThis` | 1709 |
| `Foam::fvMeshStitcher::preConformSurfaceFields` | 1990 |
| `Foam::fvMeshStitcher::preConformVolFields` | 1999 |
| `Foam::fvMeshStitcher::postUnconformSurfaceFields` | 2037 |
| `Foam::fvMeshStitcher::postUnconformVolFields` | 2046 |
| `Foam::fvMeshStitcher::patchCoupleds` | 2125 |
| `Foam::fvMeshStitcher::geometric` | 2176 |
| `Foam::fvMeshStitcher::openness` | 2210 |
| `Foam::fvMeshStitcher::volumeConservationError` | 2227 |
| `Foam::fvMeshStitcher::projectedVolumeFraction` | 2254 |
| `Foam::fvMeshStitcher::stitches` | 2291 |
| `Foam::fvMeshStitcher::disconnect` | 2311 |
| `Foam::fvMeshStitcher::connect` | 2339 |
| `Foam::fvMeshStitcher::reconnect` | 2390 |
| `Foam::fvMeshStitcher::topoChange` | 2433 |
| `Foam::fvMeshStitcher::mapMesh` | 2437 |
| `Foam::fvMeshStitcher::distribute` | 2441 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
4. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
5. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
6. **分布式映射**：依据全局到局部寻址重排和交换数据。
7. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
8. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
9. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
10. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fvMeshStitcher.H`](../../../05-finite-volume/files/8b/fvmeshstitcher.h--8b22c76f5a55.md)
- [`globalIndex.H`](../../../04-core-runtime/files/3f/globalindex.h--3f1816147c33.md)
- [`fvcSurfaceIntegrate.H`](../../../05-finite-volume/files/4c/fvcsurfaceintegrate.h--4c6ccc53fb7e.md)
- [`MultiRegionList.H`](../../../04-core-runtime/files/3b/multiregionlist.h--3b553a86809c.md)
- [`meshObjects.H`](../../../04-core-runtime/files/f9/meshobjects.h--f974900fdffa.md)
- [`movingWallVelocityFvPatchVectorField.H`](../../../05-finite-volume/files/e4/movingwallvelocityfvpatchvectorfield.h--e4f1ca4e5151.md)
- [`movingWallSlipVelocityFvPatchVectorField.H`](../../../05-finite-volume/files/a2/movingwallslipvelocityfvpatchvectorfield.h--a2a3aa047541.md)
- [`nonConformalBoundary.H`](../../../07-mesh-geometry/files/fc/nonconformalboundary.h--fc36fe8a821c.md)
- [`nonConformalCyclicFvPatch.H`](../../../05-finite-volume/files/7b/nonconformalcyclicfvpatch.h--7bd00ba3a974.md)
- [`nonConformalProcessorCyclicFvPatch.H`](../../../05-finite-volume/files/03/nonconformalprocessorcyclicfvpatch.h--0336c14e90ac.md)
- [`nonConformalErrorFvPatch.H`](../../../05-finite-volume/files/ac/nonconformalerrorfvpatch.h--acf3463979fd.md)
- [`nonConformalMappedWallFvPatch.H`](../../../05-finite-volume/files/e0/nonconformalmappedwallfvpatch.h--e0782902d0cc.md)
- [`nonConformalMappedPolyFacesFvsPatchLabelField.H`](../../../05-finite-volume/files/7b/nonconformalmappedpolyfacesfvspatchlabelfield.h--7b524d464a93.md)
- [`polyTopoChangeMap.H`](../../../04-core-runtime/files/9a/polytopochangemap.h--9ad3af9fe142.md)
- [`polyMeshMap.H`](../../../04-core-runtime/files/6a/polymeshmap.h--6a11015fe40b.md)
- [`polyDistributionMap.H`](../../../04-core-runtime/files/1d/polydistributionmap.h--1d3a143688db.md)
- [`syncTools.H`](../../../04-core-runtime/files/46/synctools.h--46bd311140af.md)
- `surfaceInterpolate.H`
- [`surfaceToVolVelocity.H`](../../../05-finite-volume/files/a2/surfacetovolvelocity.h--a2bcb726954e.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`defineRunTimeSelectionTable`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
