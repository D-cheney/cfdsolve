---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-12d6a4dc0e1a"
title: "OpenFOAM 14 源码解析：LagrangianPatch.H"
summary: "该文件声明或实现 `LagrangianBoundaryMesh`、`objectRegistry`、`LagrangianPatch`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/LagrangianPatch/LagrangianPatch.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：LagrangianPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/LagrangianPatch/LagrangianPatch.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：207 行
- 文件标识：`12d6a4dc0e1a`

## 2. 功能说明

该文件声明或实现 `LagrangianBoundaryMesh`、`objectRegistry`、`LagrangianPatch`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Base class for Lagrangian patches

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LagrangianBoundaryMesh` | 52 |
| `objectRegistry` | 54 |
| `LagrangianPatch` | 59 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`polyPatch.H`](../../../04-core-runtime/files/51/polypatch.h--5133084941b0.md)
- [`LagrangianSubMesh.H`](../../../11-lagrangian/files/91/lagrangiansubmesh.h--91b304decf8d.md)
- [`LagrangianFieldsFwd.H`](../../../11-lagrangian/files/55/lagrangianfieldsfwd.h--5540fcfa4b32.md)

## 8. 直接上层引用

- [src/generic/genericLagrangianPatches/genericLagrangianPatch/genericLagrangianPatch.H](../../../17-other-libraries/files/03/genericlagrangianpatch.h--03d89beec705.md)
- [src/Lagrangian/cloud/derivedLagrangianPatches/cloudVelocity/cloudVelocityLagrangianPatch.H](../../../11-lagrangian/files/df/cloudvelocitylagrangianpatch.h--dfdde1b1d337.md)
- [src/Lagrangian/Lagrangian/fields/LagrangianPatchFields/LagrangianPatchField/LagrangianPatchField.C](../../../11-lagrangian/files/f0/lagrangianpatchfield.c--f04a02100867.md)
- [src/Lagrangian/Lagrangian/fields/LagrangianPatchFields/LagrangianPatchField/LagrangianPatchField.H](../../../11-lagrangian/files/0c/lagrangianpatchfield.h--0cb026f4d92c.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianBoundaryMesh/LagrangianBoundaryMesh.C](../../../11-lagrangian/files/4c/lagrangianboundarymesh.c--4cd0130271d9.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianBoundaryMesh/LagrangianBoundaryMesh.H](../../../11-lagrangian/files/0c/lagrangianboundarymesh.h--0c242c27cd78.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/cyclic/cyclicLagrangianPatch.H](../../../11-lagrangian/files/6f/cycliclagrangianpatch.h--6f92d7b32d04.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/empty/emptyLagrangianPatch.H](../../../11-lagrangian/files/e0/emptylagrangianpatch.h--e022670cc8c6.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/internal/internalLagrangianPatch.H](../../../11-lagrangian/files/4c/internallagrangianpatch.h--4ce7ae2177c4.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/nonConformalCyclic/nonConformalCyclicLagrangianPatch.H](../../../11-lagrangian/files/5d/nonconformalcycliclagrangianpatch.h--5d107f9d7e3a.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/nonConformalError/nonConformalErrorLagrangianPatch.H](../../../11-lagrangian/files/d6/nonconformalerrorlagrangianpatch.h--d6b79e4e9cb5.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/processor/processorLagrangianPatch.H](../../../11-lagrangian/files/cf/processorlagrangianpatch.h--cf8df9b93c54.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/symmetry/symmetryLagrangianPatch.H](../../../11-lagrangian/files/5d/symmetrylagrangianpatch.h--5dd5abe9f317.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/symmetryPlane/symmetryPlaneLagrangianPatch.H](../../../11-lagrangian/files/1b/symmetryplanelagrangianpatch.h--1bcb6ffa2747.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/constraint/wedge/wedgeLagrangianPatch.H](../../../11-lagrangian/files/7c/wedgelagrangianpatch.h--7c4e8db2944b.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/derived/wall/wallLagrangianPatch.H](../../../11-lagrangian/files/a3/walllagrangianpatch.h--a3f9cdbb21ef.md)
- [src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianPatches/LagrangianPatch/LagrangianPatch.C](../../../11-lagrangian/files/b8/lagrangianpatch.c--b874fba81ff1.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
