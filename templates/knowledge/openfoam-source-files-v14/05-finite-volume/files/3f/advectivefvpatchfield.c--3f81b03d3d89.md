---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3f81b03d3d89"
title: "OpenFOAM 14 源码解析：advectiveFvPatchField.C"
summary: "该文件为“有限体积离散”提供 `advectiveFvPatchField` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/derived/advective/advectiveFvPatchField.C"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：advectiveFvPatchField.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/derived/advective/advectiveFvPatchField.C`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：325 行
- 文件标识：`3f81b03d3d89`

## 2. 功能说明

该文件为“有限体积离散”提供 `advectiveFvPatchField` 相关接口、模板实例或支撑定义。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`advectiveFvPatchField.H`](../../../05-finite-volume/files/f8/advectivefvpatchfield.h--f80b3f89bc06.md)
- [`fieldMapper.H`](../../../04-core-runtime/files/96/fieldmapper.h--9635053bfe32.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`EulerDdtScheme.H`](../../../05-finite-volume/files/af/eulerddtscheme.h--afa5e4cb5ca0.md)
- [`CrankNicolsonDdtScheme.H`](../../../05-finite-volume/files/a7/cranknicolsonddtscheme.h--a7153d5e8cf9.md)
- [`backwardDdtScheme.H`](../../../05-finite-volume/files/bf/backwardddtscheme.h--bf1fece08203.md)
- [`localEulerDdtScheme.H`](../../../05-finite-volume/files/fb/localeulerddtscheme.h--fb7ce050de98.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/fvPatchFields/derived/advective/advectiveFvPatchField.H](../../../05-finite-volume/files/f8/advectivefvpatchfield.h--f80b3f89bc06.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
