---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-cc82f1d0ab82"
title: "OpenFOAM 14 源码解析：DRGEP.H"
summary: "该文件声明或实现 `DRGEP`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/chemistryModel/Standard/reduction/DRGEP/DRGEP.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：DRGEP.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/chemistryModel/Standard/reduction/DRGEP/DRGEP.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：188 行
- 文件标识：`cc82f1d0ab82`

## 2. 功能说明

该文件声明或实现 `DRGEP`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：The DRGEP algorithm [1] is based on |sum_i=1->Nr vAi wi dBi| rAB = --------------------------- , max(PA, CA) PA = sum_i=1->Nr (max (0, vAi wi)) -> production of species A CA = sum_i=1->Nr (max (0, -vAi wi)) -> consumption of species A where i is the reaction index, Nr the number of reactions, vAi is the net stoichiometric coefficient of species A in the ith reaction (vAi = v''-v') , wi is the progress variable of reaction i and dBi equals 1 if reaction i involves B and O otherwise. rAB show the error introduced to the production rates of A when B and all the reactions including it are removed. It is computed as in [2] so that the algorithm is O(Nr). DAC uses a initial set of species that represents the major parts of the combustion mechanism, i.e. H2/O2, fuel decomposition and CO2 production. Usually, it includes the fuel, HO2 and CO. Then it computes the dependence of these set to the o

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `DRGEP` | 124 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`chemistryReductionMethod.H`](../../../08-thermophysical/files/b0/chemistryreductionmethod.h--b007ed07a773.md)
- [`DRGEP.C`](../../../08-thermophysical/files/41/drgep.c--41a250cb41a3.md)

## 8. 直接上层引用

- [etc/codeTemplates/dynamicCode/chemistryModelTemplate.C](../../../15-build-config/files/77/chemistrymodeltemplate.c--77a8d58b02c2.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/DRGEP/DRGEP.C](../../../08-thermophysical/files/41/drgep.c--41a250cb41a3.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/DRGEP/DRGEPChemistryReductionMethods.C](../../../08-thermophysical/files/88/drgepchemistryreductionmethods.c--88859148e5f0.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
