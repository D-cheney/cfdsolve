---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-53a19b4f5eb6"
title: "OpenFOAM 14 源码解析：surfaceTensionModel.H"
summary: "该文件实现 `surfaceTensionModel` 相关对象的读取、写出或流序列化。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/interfaceProperties/surfaceTensionModels/surfaceTensionModel/surfaceTensionModel.H"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：surfaceTensionModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/interfaceProperties/surfaceTensionModels/surfaceTensionModel/surfaceTensionModel.H`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：167 行
- 文件标识：`53a19b4f5eb6`

## 2. 功能说明

该文件实现 `surfaceTensionModel` 相关对象的读取、写出或流序列化。

中文导航角色：两相流与界面模型。

上游说明：Abstract base-class for surface tension models which return the surface tension coefficient field. Usage Example of the surface tension specification: \verbatim sigma { type <surface tension model type>; <coefficient name> <coefficient value>; . . . } \endverbatim For simplicity and backward-compatibility the constant value format is also supported, e.g. \verbatim sigma 0.07; \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMesh` | 73 |
| `surfaceTensionModel` | 79 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`regIOobject.H`](../../../04-core-runtime/files/7f/regioobject.h--7f9eca9df0dd.md)
- [`dimensionedTypes.H`](../../../04-core-runtime/files/e7/dimensionedtypes.h--e7b52390401f.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/correctAlpha.C](../../../02-solver-modules/files/27/correctalpha.c--27d236a29c4c.md)
- [applications/modules/isothermalFilm/momentumPredictor.C](../../../02-solver-modules/files/b0/momentumpredictor.c--b02ab83d85a3.md)
- [src/twoPhaseModels/compressibleInterfaceProperties/surfaceTensionModels/liquidProperties/liquidPropertiesSurfaceTension.H](../../../10-multiphase/files/f3/liquidpropertiessurfacetension.h--f30a6f87cfc1.md)
- [src/twoPhaseModels/interfaceProperties/interfaceProperties.H](../../../10-multiphase/files/36/interfaceproperties.h--36dd1adcc231.md)
- [src/twoPhaseModels/interfaceProperties/surfaceTensionModels/constant/constantSurfaceTension.H](../../../10-multiphase/files/d5/constantsurfacetension.h--d5b85cf86c67.md)
- [src/twoPhaseModels/interfaceProperties/surfaceTensionModels/surfaceTensionModel/surfaceTensionModel.C](../../../10-multiphase/files/ca/surfacetensionmodel.c--caad2b0e1b41.md)
- [src/twoPhaseModels/interfaceProperties/surfaceTensionModels/surfaceTensionModel/surfaceTensionModelNew.C](../../../10-multiphase/files/55/surfacetensionmodelnew.c--551e253b900d.md)
- [src/twoPhaseModels/interfaceProperties/surfaceTensionModels/temperatureDependent/temperatureDependentSurfaceTension.H](../../../10-multiphase/files/05/temperaturedependentsurfacetension.h--053c5204ff19.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
