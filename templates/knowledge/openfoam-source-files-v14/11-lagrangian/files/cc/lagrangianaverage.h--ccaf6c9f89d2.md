---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ccaf6c9f89d2"
title: "OpenFOAM 14 源码解析：LagrangianAverage.H"
summary: "该文件声明或实现 `LagrangianAverage`、`LagrangianAverageNewReturnType`、`PsiPF`、`WeightPsiPF`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/Lagrangian/LagrangianAverage/LagrangianAverage/LagrangianAverage.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：LagrangianAverage.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/Lagrangian/LagrangianAverage/LagrangianAverage/LagrangianAverage.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：272 行
- 文件标识：`ccaf6c9f89d2`

## 2. 功能说明

该文件声明或实现 `LagrangianAverage`、`LagrangianAverageNewReturnType`、`PsiPF`、`WeightPsiPF`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Base class for methods of local-averaging of Lagrangian properties

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LagrangianAverage` | 53 |
| `LagrangianAverageNewReturnType` | 56 |
| `PsiPF` | 131 |
| `WeightPsiPF` | 141 |

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

- [`dimensionSet.H`](../../../04-core-runtime/files/bc/dimensionset.h--bca4d2124acd.md)
- [`LagrangianFieldsFwd.H`](../../../11-lagrangian/files/55/lagrangianfieldsfwd.h--5540fcfa4b32.md)
- [`LagrangianSubFieldsFwd.H`](../../../11-lagrangian/files/12/lagrangiansubfieldsfwd.h--12be4900f4ed.md)
- [`LagrangianAverage.C`](../../../11-lagrangian/files/03/lagrangianaverage.c--034230262141.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/fields/CloudAverageField/CloudAverageField.H](../../../11-lagrangian/files/04/cloudaveragefield.h--04c7bf787aaf.md)
- [src/Lagrangian/Lagrangian/LagrangianAverage/cell/cell_LagrangianAverage.H](../../../11-lagrangian/files/3d/cell_lagrangianaverage.h--3d268d487b84.md)
- [src/Lagrangian/Lagrangian/LagrangianAverage/cellPoint/cellPoint_LagrangianAverage.H](../../../11-lagrangian/files/6e/cellpoint_lagrangianaverage.h--6ebdfddf9c6a.md)
- [src/Lagrangian/Lagrangian/LagrangianAverage/LagrangianAverage/LagrangianAverage.C](../../../11-lagrangian/files/03/lagrangianaverage.c--034230262141.md)
- [src/Lagrangian/Lagrangian/LagrangianAverage/LagrangianAverage/LagrangianAverages.C](../../../11-lagrangian/files/10/lagrangianaverages.c--102dc247c163.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
