---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-aa44523a9f93"
title: "OpenFOAM 14 源码解析：functionObject.C"
summary: "该文件实现 `functionObject` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/db/functionObjects/functionObject/functionObject.C"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：functionObject.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/db/functionObjects/functionObject/functionObject.C`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：207 行
- 文件标识：`aa44523a9f93`

## 2. 功能说明

该文件实现 `functionObject` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::functionObject::functionObject` | 61 |
| `Foam::functionObject::New` | 77 |
| `Foam::functionObject::name` | 146 |
| `Foam::functionObject::read` | 151 |
| `Foam::functionObject::executeAtStart` | 165 |
| `Foam::functionObject::end` | 171 |
| `Foam::functionObject::timeToNextAction` | 177 |
| `Foam::functionObject::maxDeltaT` | 183 |
| `Foam::functionObject::movePoints` | 189 |
| `Foam::functionObject::topoChange` | 193 |
| `Foam::functionObject::mapMesh` | 197 |
| `Foam::functionObject::distribute` | 201 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **分布式映射**：依据全局到局部寻址重排和交换数据。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`functionObject.H`](../../../04-core-runtime/files/6f/functionobject.h--6f77b47a79fa.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`dlLibraryTable.H`](../../../04-core-runtime/files/21/dllibrarytable.h--21801390dc37.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`defineRunTimeSelectionTable`

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
