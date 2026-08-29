---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c2ae82ec27a9"
title: "OpenFOAM 14 源码解析：DimensionedFieldListSlicer.H"
summary: "该文件声明或实现 `DimensionedFieldListSlicer`、`PrimitiveField`、`DimensionedFieldListAndSlicer`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/multicomponentThermo/include/DimensionedFieldListSlicer.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：DimensionedFieldListSlicer.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/multicomponentThermo/include/DimensionedFieldListSlicer.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：195 行
- 文件标识：`c2ae82ec27a9`

## 2. 功能说明

该文件声明或实现 `DimensionedFieldListSlicer`、`PrimitiveField`、`DimensionedFieldListAndSlicer`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Class to provide list slices to different parts of a dimensioned field

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `DimensionedFieldListSlicer` | 54 |
| `PrimitiveField` | 73 |
| `DimensionedFieldListAndSlicer` | 140 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`GeometricField.H`](../../../05-finite-volume/files/d9/geometricfield.h--d97ab300040a.md)
- [`FieldListSlice.H`](../../../08-thermophysical/files/24/fieldlistslice.h--24d64925b760.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermo.H](../../../17-other-libraries/files/69/psiumulticomponentthermo.h--699b22124b67.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermoI.H](../../../17-other-libraries/files/d6/psiumulticomponentthermoi.h--d69c17eec0c1.md)
- [src/Lagrangian/LagrangianThermo/multicomponentLagrangianThermo/multicomponentLagrangianThermo.H](../../../11-lagrangian/files/30/multicomponentlagrangianthermo.h--308ba1655679.md)
- [src/thermophysicalModels/multicomponentThermo/multicomponentThermo/multicomponentThermo.H](../../../08-thermophysical/files/b8/multicomponentthermo.h--b890f9230c43.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
