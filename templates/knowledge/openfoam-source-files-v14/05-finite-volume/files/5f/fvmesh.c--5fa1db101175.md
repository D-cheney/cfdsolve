---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5fa1db101175"
title: "OpenFOAM 14 源码解析：fvMesh.C"
summary: "该文件实现 `fvMesh` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/fvMesh.C"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvMesh.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/fvMesh.C`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1847 行
- 文件标识：`5fa1db101175`

## 2. 功能说明

该文件实现 `fvMesh` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::fvMesh::clearFvGeomNotOldVol` | 93 |
| `Foam::fvMesh::clearFvGeom` | 122 |
| `Foam::fvMesh::updateGeomNotOldVol` | 134 |
| `Foam::fvMesh::storeOldTimeFields` | 168 |
| `Foam::fvMesh::nullOldestTimeFields` | 176 |
| `Foam::fvMesh::printAllocated` | 184 |
| `Foam::fvMesh::clearGeom` | 250 |
| `Foam::fvMesh::clearAddressing` | 260 |
| `Foam::fvMesh::clearOut` | 305 |
| `Foam::fvMesh::polyFacesPatchTypes` | 317 |
| `Foam::fvMesh::polyFacesBfRef` | 340 |
| `Foam::fvMesh::fvMesh` | 402 |
| `Foam::fvMesh::postConstruct` | 616 |
| `Foam::fvMesh::topoChanging` | 689 |
| `Foam::fvMesh::distributing` | 695 |
| `Foam::fvMesh::dynamic` | 701 |
| `Foam::fvMesh::update` | 709 |
| `Foam::fvMesh::move` | 749 |
| `Foam::fvMesh::addFvPatches` | 763 |
| `Foam::fvMesh::removeFvBoundary` | 782 |
| `Foam::fvMesh::swap` | 795 |
| `Foam::fvMesh::readUpdate` | 841 |
| `Foam::fvMesh::boundary` | 938 |
| `Foam::fvMesh::lduAddr` | 944 |
| `Foam::fvMesh::conformal` | 955 |
| `Foam::fvMesh::polyFacesBf` | 961 |
| `Foam::fvMesh::polyBFacePatches` | 991 |
| `Foam::fvMesh::polyBFacePatchFaces` | 1067 |
| `Foam::fvMesh::ownerBf` | 1079 |
| `Foam::fvMesh::stitcher` | 1107 |
| `Foam::fvMesh::topoChanger` | 1119 |
| `Foam::fvMesh::distributor` | 1125 |
| `Foam::fvMesh::mover` | 1131 |
| `Foam::fvMesh::mapFields` | 1137 |
| `Foam::fvMesh::preChange` | 1194 |
| `Foam::fvMesh::setPoints` | 1200 |
| `Foam::fvMesh::movePoints` | 1216 |
| `Foam::fvMesh::topoChange` | 1342 |
| `Foam::fvMesh::mapMesh` | 1402 |
| `Foam::fvMesh::distribute` | 1435 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
4. **分布式映射**：依据全局到局部寻址重排和交换数据。
5. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
6. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
7. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
8. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
9. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
10. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`surfaceFields.H`](../../../05-finite-volume/files/46/surfacefields.h--468a61846d4e.md)
- [`pointFields.H`](../../../05-finite-volume/files/ab/pointfields.h--ab4bc596bad4.md)
- [`slicedVolFields.H`](../../../05-finite-volume/files/57/slicedvolfields.h--57b5df525db6.md)
- [`slicedSurfaceFields.H`](../../../05-finite-volume/files/e9/slicedsurfacefields.h--e9635188adbf.md)
- [`SubField.H`](../../../04-core-runtime/files/82/subfield.h--82a0cf10f077.md)
- [`demandDrivenData.H`](../../../04-core-runtime/files/9e/demanddrivendata.h--9e7164867a61.md)
- [`zonesGenerator.H`](../../../04-core-runtime/files/25/zonesgenerator.h--25286ceea1be.md)
- [`fvMeshLduAddressing.H`](../../../05-finite-volume/files/d6/fvmeshlduaddressing.h--d6e925d61220.md)
- [`fvMeshTopoChanger.H`](../../../05-finite-volume/files/2c/fvmeshtopochanger.h--2cf79fec94af.md)
- [`fvMeshDistributor.H`](../../../05-finite-volume/files/59/fvmeshdistributor.h--59183ccedfca.md)
- [`fvMeshMover.H`](../../../05-finite-volume/files/53/fvmeshmover.h--5318f33ae66f.md)
- [`fvMeshStitcher.H`](../../../05-finite-volume/files/8b/fvmeshstitcher.h--8b22c76f5a55.md)
- [`nonConformalFvPatch.H`](../../../05-finite-volume/files/b8/nonconformalfvpatch.h--b81c339b46e8.md)
- [`polyFacesFvsPatchLabelField.H`](../../../05-finite-volume/files/bc/polyfacesfvspatchlabelfield.h--bc5ca36e4f67.md)
- [`polyTopoChangeMap.H`](../../../04-core-runtime/files/9a/polytopochangemap.h--9ad3af9fe142.md)
- [`MapFvFields.H`](../../../05-finite-volume/files/ab/mapfvfields.h--ab4201a94c85.md)
- [`fvMeshMapper.H`](../../../05-finite-volume/files/af/fvmeshmapper.h--af7a41d5af31.md)
- [`pointMesh.H`](../../../05-finite-volume/files/89/pointmesh.h--89d6d6fe0d17.md)
- [`pointMeshMapper.H`](../../../05-finite-volume/files/8a/pointmeshmapper.h--8a71f122e52a.md)
- [`MapPointField.H`](../../../05-finite-volume/files/69/mappointfield.h--69dd684e652a.md)
- [`meshObjects.H`](../../../04-core-runtime/files/f9/meshobjects.h--f974900fdffa.md)
- [`HashPtrTable.H`](../../../04-core-runtime/files/4a/hashptrtable.h--4ab8e1bdb8c9.md)
- [`CompactListList.H`](../../../04-core-runtime/files/00/compactlistlist.h--009109c57c35.md)
- [`fvcSurfaceIntegrate.H`](../../../05-finite-volume/files/4c/fvcsurfaceintegrate.h--4c6ccc53fb7e.md)
- [`fvcReconstruct.H`](../../../05-finite-volume/files/bc/fvcreconstruct.h--bcc553314882.md)
- `surfaceInterpolate.H`

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
