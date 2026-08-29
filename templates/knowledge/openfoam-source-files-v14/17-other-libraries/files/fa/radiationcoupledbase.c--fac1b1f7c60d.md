---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fac1b1f7c60d"
title: "OpenFOAM 14 源码解析：radiationCoupledBase.C"
summary: "该文件实现 `radiationCoupledBase`、`emissivity`、`map`、`reset` 等过程，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/radiationModels/derivedFvPatchFields/radiationCoupledBase/radiationCoupledBase.C"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：radiationCoupledBase.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/radiationModels/derivedFvPatchFields/radiationCoupledBase/radiationCoupledBase.C`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：198 行
- 文件标识：`fac1b1f7c60d`

## 2. 功能说明

该文件实现 `radiationCoupledBase`、`emissivity`、`map`、`reset` 等过程，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::radiationCoupledBase::radiationCoupledBase` | 71 |
| `Foam::radiationCoupledBase::emissivity` | 121 |
| `Foam::radiationCoupledBase::map` | 164 |
| `Foam::radiationCoupledBase::reset` | 177 |
| `Foam::radiationCoupledBase::write` | 189 |

## 5. 算法与控制流程

1. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`radiationCoupledBase.H`](../../../17-other-libraries/files/3c/radiationcoupledbase.h--3c52e734acc0.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`fieldMapper.H`](../../../04-core-runtime/files/96/fieldmapper.h--9635053bfe32.md)
- [`mappedFvPatchBaseBase.H`](../../../05-finite-volume/files/48/mappedfvpatchbasebase.h--488fa85927cc.md)
- [`radiationModel.H`](../../../17-other-libraries/files/d3/radiationmodel.h--d3ba6e978f76.md)
- [`opaqueSolid.H`](../../../17-other-libraries/files/8f/opaquesolid.h--8facfb5bf8de.md)
- [`absorptionEmissionModel.H`](../../../17-other-libraries/files/71/absorptionemissionmodel.h--715f408c07d2.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
