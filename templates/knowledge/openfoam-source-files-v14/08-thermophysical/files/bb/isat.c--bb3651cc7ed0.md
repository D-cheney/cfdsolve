---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-bb3651cc7ed0"
title: "OpenFOAM 14 源码解析：ISAT.C"
summary: "该文件实现 `ISAT`、`addToMRU`、`calcNewC`、`grow` 等过程，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/ISAT.C"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：ISAT.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/ISAT.C`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：698 行
- 文件标识：`bb3651cc7ed0`

## 2. 功能说明

该文件实现 `ISAT`、`addToMRU`、`calcNewC`、`grow` 等过程，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::chemistryTabulationMethods::ISAT::ISAT` | 154 |
| `Foam::chemistryTabulationMethods::ISAT::addToMRU` | 178 |
| `Foam::chemistryTabulationMethods::ISAT::calcNewC` | 224 |
| `Foam::chemistryTabulationMethods::ISAT::grow` | 288 |
| `Foam::chemistryTabulationMethods::ISAT::cleanAndBalance` | 325 |
| `Foam::chemistryTabulationMethods::ISAT::computeA` | 368 |
| `Foam::chemistryTabulationMethods::ISAT::retrieve` | 427 |
| `Foam::chemistryTabulationMethods::ISAT::add` | 510 |
| `Foam::chemistryTabulationMethods::ISAT::writePerformance` | 638 |
| `Foam::chemistryTabulationMethods::ISAT::reset` | 676 |
| `Foam::chemistryTabulationMethods::ISAT::update` | 688 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`ISAT.H`](../../../08-thermophysical/files/96/isat.h--9696611181ab.md)
- [`standard_chemistryModel.H`](../../../08-thermophysical/files/3f/standard_chemistrymodel.h--3fca5ef9f747.md)
- [`LUscalarMatrix.H`](../../../06-linear-algebra/files/05/luscalarmatrix.h--05d029fc195b.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
