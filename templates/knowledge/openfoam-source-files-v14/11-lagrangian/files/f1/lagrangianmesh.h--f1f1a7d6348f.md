---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f1f1a7d6348f"
title: "OpenFOAM 14 源码解析：LagrangianMesh.H"
summary: "该文件声明或实现 `LagrangianInjection`、`nonConformalCyclicPolyPatch`、`LagrangianMesh`、`GeoField`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianMesh.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：LagrangianMesh.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianMesh.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：974 行
- 文件标识：`f1f1a7d6348f`

## 2. 功能说明

该文件声明或实现 `LagrangianInjection`、`nonConformalCyclicPolyPatch`、`LagrangianMesh`、`GeoField`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Class containing Lagrangian geometry and topology

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LagrangianInjection` | 62 |
| `nonConformalCyclicPolyPatch` | 64 |
| `LagrangianMesh` | 69 |
| `GeoField` | 289 |
| `changer` | 383 |
| `linearDisplacement` | 425 |
| `parabolicDisplacement` | 455 |
| `elementGroup` | 497 |
| `EnumerationRef` | 503 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `element` | 534 |

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`barycentricField.H`](../../../11-lagrangian/files/73/barycentricfield.h--739487fcd376.md)
- [`barycentricIODynamicField.H`](../../../11-lagrangian/files/ad/barycentriciodynamicfield.h--ad269bd6f81a.md)
- [`LagrangianBoundaryMesh.H`](../../../11-lagrangian/files/0c/lagrangianboundarymesh.h--0c242c27cd78.md)
- [`LagrangianFieldsFwd.H`](../../../11-lagrangian/files/55/lagrangianfieldsfwd.h--5540fcfa4b32.md)
- [`LagrangianSchemes.H`](../../../11-lagrangian/files/29/lagrangianschemes.h--29cfa36def4a.md)
- [`LagrangianSolution.H`](../../../11-lagrangian/files/1c/lagrangiansolution.h--1c84155c4089.md)
- [`LagrangianState.H`](../../../11-lagrangian/files/5c/lagrangianstate.h--5c8340e65fd3.md)
- [`LagrangianSubMesh.H`](../../../11-lagrangian/files/91/lagrangiansubmesh.h--91b304decf8d.md)
- [`labelIODynamicField.H`](../../../11-lagrangian/files/f5/labeliodynamicfield.h--f5d284a841a8.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`LagrangianMeshI.H`](../../../11-lagrangian/files/ad/lagrangianmeshi.h--ad27182e8b34.md)
- [`LagrangianMeshTemplates.C`](../../../11-lagrangian/files/37/lagrangianmeshtemplates.c--3738a4f4e546.md)

## 8. 直接上层引用

- [applications/utilities/postProcessing/graphics/PVReaders/vtkPVFoam/vtkPVFoamFields.C](../../../03-utilities/files/b2/vtkpvfoamfields.c--b29f8e04f3fc.md)
- [applications/utilities/postProcessing/graphics/PVReaders/vtkPVFoam/vtkPVFoamMesh.C](../../../03-utilities/files/08/vtkpvfoammesh.c--08f94886101c.md)
- [applications/utilities/postProcessing/graphics/PVReaders/vtkPVFoam/vtkPVFoamMeshLagrangian.C](../../../03-utilities/files/50/vtkpvfoammeshlagrangian.c--50992a837bb7.md)
- [applications/utilities/postProcessing/graphics/PVReaders/vtkPVFoam/vtkPVFoamUpdateInfo.C](../../../03-utilities/files/e1/vtkpvfoamupdateinfo.c--e1f6ef38aefa.md)
- [src/Lagrangian/cloud/fields/CloudDerivedField/CloudDerivedField.H](../../../11-lagrangian/files/dc/cloudderivedfield.h--dc71477214ea.md)
- [src/Lagrangian/cloud/LagrangianModels/diskInjection/diskInjection.C](../../../11-lagrangian/files/aa/diskinjection.c--aa2ba6eaa723.md)
- [src/Lagrangian/Lagrangian/fields/LagrangianFields/LagrangianFields.H](../../../11-lagrangian/files/0e/lagrangianfields.h--0e720ce1f457.md)
- [src/Lagrangian/Lagrangian/fields/LagrangianFieldSources/LagrangianFieldSource/LagrangianFieldSource.C](../../../11-lagrangian/files/e5/lagrangianfieldsource.c--e543192d8f92.md)
- [src/Lagrangian/Lagrangian/fields/LagrangianPatchFields/LagrangianPatchField/LagrangianPatchField.C](../../../11-lagrangian/files/f0/lagrangianpatchfield.c--f04a02100867.md)
- [src/Lagrangian/Lagrangian/fields/makeLagrangianFieldFunctions.C](../../../11-lagrangian/files/b2/makelagrangianfieldfunctions.c--b28fb8dcdca5.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianAccumulationSchemes/cell/cell_LagrangianAccumulationScheme.C](../../../11-lagrangian/files/1a/cell_lagrangianaccumulationscheme.c--1a029632a6c2.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianAccumulationSchemes/cellPoint/cellPoint_LagrangianAccumulationScheme.C](../../../11-lagrangian/files/f2/cellpoint_lagrangianaccumulationscheme.c--f25c70d8351c.md)
- [src/Lagrangian/Lagrangian/Lagrangian/Lagrangianc/LagrangiancAccumulate.C](../../../11-lagrangian/files/c8/lagrangiancaccumulate.c--c8c4a64be732.md)
- [src/Lagrangian/Lagrangian/Lagrangian/Lagrangianc/LagrangiancDdt.C](../../../11-lagrangian/files/6c/lagrangiancddt.c--6cfbf02874a2.md)
- [src/Lagrangian/Lagrangian/Lagrangian/Lagrangianm/LagrangianmDdt.C](../../../11-lagrangian/files/75/lagrangianmddt.c--7528befd78ab.md)
- [src/Lagrangian/Lagrangian/Lagrangian/Lagrangianm/LagrangianmSp.C](../../../11-lagrangian/files/0e/lagrangianmsp.c--0e8501be114b.md)
- [src/Lagrangian/Lagrangian/LagrangianEqn/LagrangianCoeff.H](../../../11-lagrangian/files/5f/lagrangiancoeff.h--5f2a4609504b.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianBoundaryMesh/LagrangianBoundaryMesh.C](../../../11-lagrangian/files/4c/lagrangianboundarymesh.c--4cd0130271d9.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianMesh.C](../../../11-lagrangian/files/ea/lagrangianmesh.c--eafb2e318052.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianMeshI.H](../../../11-lagrangian/files/ad/lagrangianmeshi.h--ad27182e8b34.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianMeshLocation.H](../../../11-lagrangian/files/fd/lagrangianmeshlocation.h--fd3867c78360.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianMeshTemplates.C](../../../11-lagrangian/files/37/lagrangianmeshtemplates.c--3738a4f4e546.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/cyclic/cyclicLagrangianPatch.C](../../../11-lagrangian/files/04/cycliclagrangianpatch.c--04e86842f870.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/empty/emptyLagrangianPatch.C](../../../11-lagrangian/files/3d/emptylagrangianpatch.c--3d84f6b946b3.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/internal/internalLagrangianPatch.C](../../../11-lagrangian/files/9b/internallagrangianpatch.c--9b0722530b30.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
