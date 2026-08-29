---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e9e39b22d2d2"
title: "OpenFOAM 14 源码解析：psiThermo.H"
summary: "该文件声明或实现 `psiThermo`、`implementation`、`composite`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/basic/psiThermo/psiThermo.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：psiThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/basic/psiThermo/psiThermo.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：233 行
- 文件标识：`e9e39b22d2d2`

## 2. 功能说明

该文件声明或实现 `psiThermo`、`implementation`、`composite`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Base-class for fluid thermodynamic properties based on compressibility.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `psiThermo` | 59 |
| `implementation` | 69 |
| `composite` | 72 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`PsiThermo.H`](../../../08-thermophysical/files/57/psithermo.h--576143cd8bf2.md)
- [`pureThermo.H`](../../../08-thermophysical/files/b9/purethermo.h--b9bdef8aeb56.md)
- [`fluidThermo.H`](../../../08-thermophysical/files/9e/fluidthermo.h--9e58ccc4fa8c.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermo.H](../../../17-other-libraries/files/69/psiumulticomponentthermo.h--699b22124b67.md)
- [applications/modules/shockFluid/shockFluid.H](../../../02-solver-modules/files/a1/shockfluid.h--a1c77b1647ce.md)
- [src/thermophysicalModels/basic/psiThermo/psiThermo.C](../../../08-thermophysical/files/0d/psithermo.c--0dca3925a114.md)
- [src/thermophysicalModels/basic/psiThermo/psiThermos.C](../../../08-thermophysical/files/36/psithermos.c--36866d3b8e3c.md)
- [src/thermophysicalModels/multicomponentThermo/psiMulticomponentThermo/psiMulticomponentThermo.H](../../../08-thermophysical/files/35/psimulticomponentthermo.h--3549c58c2c85.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
