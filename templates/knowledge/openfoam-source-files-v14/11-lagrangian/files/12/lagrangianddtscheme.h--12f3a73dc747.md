---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-12f3a73dc747"
title: "OpenFOAM 14 源码解析：LagrangianDdtScheme.H"
summary: "该文件声明或实现 `LagrangianMesh`、`LagrangianEqn`、`ddtScheme`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/Lagrangian/Lagrangian/LagrangianDdtSchemes/LagrangianDdtScheme/LagrangianDdtScheme.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：LagrangianDdtScheme.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/Lagrangian/Lagrangian/LagrangianDdtSchemes/LagrangianDdtScheme/LagrangianDdtScheme.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：291 行
- 文件标识：`12f3a73dc747`

## 2. 功能说明

该文件声明或实现 `LagrangianMesh`、`LagrangianEqn`、`ddtScheme`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Abstract base class for Lagrangian ddt schemes

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LagrangianMesh` | 55 |
| `LagrangianEqn` | 57 |
| `ddtScheme` | 67 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`tmp.H`](../../../04-core-runtime/files/ae/tmp.h--aed1da89cfb2.md)
- [`dimensionedType.H`](../../../04-core-runtime/files/fd/dimensionedtype.h--fd91b2318780.md)
- [`LagrangianFieldsFwd.H`](../../../11-lagrangian/files/55/lagrangianfieldsfwd.h--5540fcfa4b32.md)
- [`LagrangianSubFieldsFwd.H`](../../../11-lagrangian/files/12/lagrangiansubfieldsfwd.h--12be4900f4ed.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`LagrangianDdtScheme.C`](../../../11-lagrangian/files/05/lagrangianddtscheme.c--05340d337cad.md)

## 8. 直接上层引用

- [src/Lagrangian/Lagrangian/Lagrangian/Lagrangianc/LagrangiancDdt.C](../../../11-lagrangian/files/6c/lagrangiancddt.c--6cfbf02874a2.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianDdtSchemes/CrankNicolson/CrankNicolson_LagrangianDdtScheme.H](../../../11-lagrangian/files/4c/cranknicolson_lagrangianddtscheme.h--4c4ab6fbe4ca.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianDdtSchemes/Euler/Euler_LagrangianDdtScheme.H](../../../11-lagrangian/files/03/euler_lagrangianddtscheme.h--0304a9d4332a.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianDdtSchemes/LagrangianDdtScheme/LagrangianDdtScheme.C](../../../11-lagrangian/files/05/lagrangianddtscheme.c--05340d337cad.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianDdtSchemes/LagrangianDdtScheme/LagrangianDdtSchemes.C](../../../11-lagrangian/files/9c/lagrangianddtschemes.c--9c5eec45c097.md)
- [src/Lagrangian/Lagrangian/Lagrangian/Lagrangianm/LagrangianmDdt.C](../../../11-lagrangian/files/75/lagrangianmddt.c--7528befd78ab.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`、`defineNamedTemplateTypeNameAndDebug`、`defineTemplateRunTimeSelectionTable`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
