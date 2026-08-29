---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c1e450df1c20"
title: "OpenFOAM 14 源码解析：NonUniformTable1.H"
summary: "该文件声明或实现 `NonUniformTable`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/primitives/functions/Function1/NonUniformTable1/NonUniformTable1.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：NonUniformTable1.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/primitives/functions/Function1/NonUniformTable1/NonUniformTable1.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：180 行
- 文件标识：`c1e450df1c20`

## 2. 功能说明

该文件声明或实现 `NonUniformTable`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：Non-uniform tabulated property function that linearly interpolates between the values. To speed-up the search of the non-uniform table a uniform jump-table is created on construction which is used for fast indirect addressing into the table. Usage \table Property | Description values | List of value pairs \endtable Example for the density of water between 280 and 350K \verbatim rho { type nonUniformTable; values ( (280 999.87) (300 995.1) (350 973.7) ); } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `NonUniformTable` | 81 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)
- [`Tuple2.H`](../../../04-core-runtime/files/ab/tuple2.h--ab8ee5c9d4ce.md)
- [`TableReader.H`](../../../04-core-runtime/files/b9/tablereader.h--b94298a06f45.md)
- [`NonUniformTable1I.H`](../../../04-core-runtime/files/9b/nonuniformtable1i.h--9bffa487757f.md)
- [`NonUniformTable1.C`](../../../04-core-runtime/files/9c/nonuniformtable1.c--9c0099382c5e.md)

## 8. 直接上层引用

- [applications/test/nonUniformTable/Test-nonUniformTable.C](../../../17-other-libraries/files/86/test-nonuniformtable.c--86c283dc79e2.md)
- [src/OpenFOAM/primitives/functions/Function1/makeFunction1s.H](../../../04-core-runtime/files/b9/makefunction1s.h--b9f238101669.md)
- [src/OpenFOAM/primitives/functions/Function1/NonUniformTable1/NonUniformTable1.C](../../../04-core-runtime/files/9c/nonuniformtable1.c--9c0099382c5e.md)
- [src/thermophysicalModels/solidThermo/solidSpecie/transport/tabulated/tabulatedSolidTransport.H](../../../08-thermophysical/files/5e/tabulatedsolidtransport.h--5e664bb6a402.md)
- [src/thermophysicalModels/specie/equationOfState/icoTabulated/icoTabulated.H](../../../08-thermophysical/files/a5/icotabulated.h--a5422147329b.md)
- [src/thermophysicalModels/specie/thermophysicalFunctions/integratedNonUniformTable1/integratedNonUniformTable1.H](../../../08-thermophysical/files/6e/integratednonuniformtable1.h--6e35e8b8c424.md)
- [src/thermophysicalModels/specie/transport/icoTabulated/icoTabulatedTransport.H](../../../08-thermophysical/files/d6/icotabulatedtransport.h--d6274a6b0600.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
