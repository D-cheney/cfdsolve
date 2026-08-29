---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-08d6ca742155"
title: "OpenFOAM 14 源码解析：patchToPatch.H"
summary: "该文件声明或实现 `patchToPatch`，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshTools/patchToPatch/patchToPatch/patchToPatch.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：patchToPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshTools/patchToPatch/patchToPatch/patchToPatch.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：422 行
- 文件标识：`08d6ca742155`

## 2. 功能说明

该文件声明或实现 `patchToPatch`，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Class to generate coupling geometry between two primitive patches

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `patchToPatch` | 61 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`distributionMap.H`](../../../04-core-runtime/files/2c/distributionmap.h--2c72c12e6e17.md)
- [`primitivePatch.H`](../../../04-core-runtime/files/24/primitivepatch.h--243caf926767.md)
- [`primitiveOldTimePatch.H`](../../../07-mesh-geometry/files/53/primitiveoldtimepatch.h--53cddbc7fc73.md)
- [`remote.H`](../../../04-core-runtime/files/08/remote.h--08261f08b70d.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`treeBoundBox.H`](../../../04-core-runtime/files/21/treeboundbox.h--21ae69859ea4.md)
- [`patchToPatchI.H`](../../../07-mesh-geometry/files/7b/patchtopatchi.h--7b08f3f5a25b.md)
- [`patchToPatchTemplates.C`](../../../07-mesh-geometry/files/94/patchtopatchtemplates.c--9431d5ad1b15.md)

## 8. 直接上层引用

- [applications/test/patchToPatch/Test-patchToPatch.C](../../../17-other-libraries/files/2e/test-patchtopatch.c--2ee882f07d54.md)
- [src/meshTools/mappedPatches/mappedPatchBase/mappedPatchBase.H](../../../07-mesh-geometry/files/ec/mappedpatchbase.h--ec75730251c5.md)
- [src/meshTools/meshToMesh/meshToMesh.H](../../../07-mesh-geometry/files/e1/meshtomesh.h--e1f647730f72.md)
- [src/meshTools/patchToPatch/intersection/intersectionPatchToPatch.H](../../../07-mesh-geometry/files/90/intersectionpatchtopatch.h--9042a418eb9f.md)
- [src/meshTools/patchToPatch/nearby/nearbyPatchToPatch.H](../../../07-mesh-geometry/files/fe/nearbypatchtopatch.h--fea3f9cfdbf5.md)
- [src/meshTools/patchToPatch/patchToPatch/patchToPatch.C](../../../07-mesh-geometry/files/8a/patchtopatch.c--8abbb58f95c6.md)
- [src/meshTools/patchToPatch/patchToPatch/patchToPatchI.H](../../../07-mesh-geometry/files/7b/patchtopatchi.h--7b08f3f5a25b.md)
- [src/meshTools/patchToPatch/patchToPatch/patchToPatchParallelOps.C](../../../07-mesh-geometry/files/ca/patchtopatchparallelops.c--caaf4c9ff158.md)
- [src/meshTools/patchToPatch/patchToPatch/patchToPatchTemplates.C](../../../07-mesh-geometry/files/94/patchtopatchtemplates.c--9431d5ad1b15.md)
- [src/meshTools/patchToPatch/patchToPatchStabilisation/patchToPatchStabilisation.H](../../../07-mesh-geometry/files/61/patchtopatchstabilisation.h--61337643df6c.md)
- [src/meshTools/patchToPatch/rays/raysPatchToPatch.H](../../../07-mesh-geometry/files/3e/rayspatchtopatch.h--3ee4d211a7c9.md)
- [src/meshTools/patchToPatchFieldMapper/patchToPatchFieldMapper.H](../../../07-mesh-geometry/files/f1/patchtopatchfieldmapper.h--f162ae65287f.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
