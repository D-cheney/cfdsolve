---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-91b304decf8d"
title: "OpenFOAM 14 源码解析：LagrangianSubMesh.H"
summary: "该文件声明或实现 `LagrangianMesh`、`LagrangianSubMesh`、`PrimitiveField`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianSubMesh/LagrangianSubMesh.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：LagrangianSubMesh.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianSubMesh/LagrangianSubMesh.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：307 行
- 文件标识：`91b304decf8d`

## 2. 功能说明

该文件声明或实现 `LagrangianMesh`、`LagrangianSubMesh`、`PrimitiveField`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Mesh that relates to a sub-section of a Lagrangian mesh. This is used to construct fields that relate to a contiguous sub-set of the Lagrangian elements. This class only stores references and the indices defining the range of the sub-set, so it is very lightweight and can be constructed and thrown away largely without consideration of expense.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LagrangianMesh` | 57 |
| `LagrangianSubMesh` | 63 |
| `PrimitiveField` | 195 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`LagrangianState.H`](../../../11-lagrangian/files/5c/lagrangianstate.h--5c8340e65fd3.md)
- [`LagrangianFieldsFwd.H`](../../../11-lagrangian/files/55/lagrangianfieldsfwd.h--5540fcfa4b32.md)
- [`LagrangianSubFieldsFwd.H`](../../../11-lagrangian/files/12/lagrangiansubfieldsfwd.h--12be4900f4ed.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`LagrangianSubMeshI.H`](../../../11-lagrangian/files/2a/lagrangiansubmeshi.h--2a2770c67709.md)
- [`LagrangianSubMeshTemplates.C`](../../../11-lagrangian/files/29/lagrangiansubmeshtemplates.c--298711178cd6.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/LagrangianModels/patchInjection/patchInjection.C](../../../11-lagrangian/files/05/patchinjection.c--05780d465db9.md)
- [src/Lagrangian/Lagrangian/fields/LagrangianFieldSources/LagrangianFieldSource/LagrangianFieldSource.C](../../../11-lagrangian/files/e5/lagrangianfieldsource.c--e543192d8f92.md)
- [src/Lagrangian/Lagrangian/fields/LagrangianSubFields/LagrangianSubFields.H](../../../11-lagrangian/files/be/lagrangiansubfields.h--be7d6ffac93f.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianAccumulationSchemes/LagrangianAccumulationScheme/LagrangianAccumulationScheme.C](../../../11-lagrangian/files/ab/lagrangianaccumulationscheme.c--aba5c6c297ca.md)
- [src/Lagrangian/Lagrangian/LagrangianEqn/LagrangianEqnBase.H](../../../11-lagrangian/files/38/lagrangianeqnbase.h--38023205a1ae.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianMesh.H](../../../11-lagrangian/files/f1/lagrangianmesh.h--f1f1a7d6348f.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/LagrangianPatch/LagrangianPatch.H](../../../11-lagrangian/files/12/lagrangianpatch.h--12d6a4dc0e1a.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianSubMesh/LagrangianSubMesh.C](../../../11-lagrangian/files/d9/lagrangiansubmesh.c--d945c7b3a43b.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianSubMesh/LagrangianSubMeshI.H](../../../11-lagrangian/files/2a/lagrangiansubmeshi.h--2a2770c67709.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianSubMesh/LagrangianSubMeshTemplates.C](../../../11-lagrangian/files/29/lagrangiansubmeshtemplates.c--298711178cd6.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
