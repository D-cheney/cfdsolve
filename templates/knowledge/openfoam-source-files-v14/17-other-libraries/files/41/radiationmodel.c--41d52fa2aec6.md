---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-41d52fa2aec6"
title: "OpenFOAM 14 源码解析：radiationModel.C"
summary: "该文件实现 `radiationModel` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/radiationModels/radiationModels/radiationModel/radiationModel.C"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：radiationModel.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/radiationModels/radiationModels/radiationModel/radiationModel.C`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：267 行
- 文件标识：`41d52fa2aec6`

## 2. 功能说明

该文件实现 `radiationModel` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::radiationModel::createIOobject` | 50 |
| `Foam::radiationModel::initialise` | 73 |
| `Foam::radiationModel::radiationModel` | 115 |
| `Foam::radiationModel::correct` | 174 |
| `Foam::radiationModel::read` | 188 |
| `Foam::radiationModel::Sh` | 206 |
| `Foam::radiationModel::ST` | 224 |
| `Foam::radiationModel::absorptionEmission` | 238 |
| `Foam::radiationModel::soot` | 252 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`radiationModel.H`](../../../17-other-libraries/files/d3/radiationmodel.h--d3ba6e978f76.md)
- [`absorptionEmissionModel.H`](../../../17-other-libraries/files/71/absorptionemissionmodel.h--715f408c07d2.md)
- [`scatterModel.H`](../../../17-other-libraries/files/5c/scattermodel.h--5cd23686f7ae.md)
- [`sootModel.H`](../../../17-other-libraries/files/19/sootmodel.h--19ce9c880850.md)
- [`fvmSup.H`](../../../05-finite-volume/files/6c/fvmsup.h--6ce628800519.md)
- [`basicThermo.H`](../../../08-thermophysical/files/f6/basicthermo.h--f61d8b7b6dd2.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`defineRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
