---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9696611181ab"
title: "OpenFOAM 14 源码解析：ISAT.H"
summary: "该文件声明或实现 `ISAT`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/ISAT.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：ISAT.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/ISAT.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：321 行
- 文件标识：`9696611181ab`

## 2. 功能说明

该文件声明或实现 `ISAT`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Implementation of the ISAT (In-situ adaptive tabulation), for chemistry calculation. Reference: \verbatim Pope, S. B. (1997). Computationally efficient implementation of combustion chemistry using in situ adaptive tabulation. Combustion Theory and Modelling, 1, 41-63. \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ISAT` | 66 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `reduction` | 257 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`chemistryTabulationMethod.H`](../../../08-thermophysical/files/0f/chemistrytabulationmethod.h--0fcf9606180d.md)
- [`binaryTree.H`](../../../08-thermophysical/files/e9/binarytree.h--e948bca55166.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`cpuTime.H`](../../../17-other-libraries/files/df/cputime.h--df3d0ebfb092.md)

## 8. 直接上层引用

- [src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/binaryNode/binaryNode.C](../../../08-thermophysical/files/0c/binarynode.c--0c1b693e9236.md)
- [src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/chemPointISAT/chemPointISAT.C](../../../08-thermophysical/files/fc/chempointisat.c--fc1ebec8159e.md)
- [src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/ISAT.C](../../../08-thermophysical/files/bb/isat.c--bb3651cc7ed0.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
