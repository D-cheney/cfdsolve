---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ba8a7abddf7a"
title: "OpenFOAM 14 源码解析：rigidBodyModel.C"
summary: "该文件实现 `rigidBodyModel` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/rigidBodyDynamics/rigidBodyModel/rigidBodyModel.C"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：rigidBodyModel.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/rigidBodyDynamics/rigidBodyModel/rigidBodyModel.C`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：495 行
- 文件标识：`ba8a7abddf7a`

## 2. 功能说明

该文件实现 `rigidBodyModel` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::RBD::rigidBodyModel::initialiseRootBody` | 51 |
| `Foam::RBD::rigidBodyModel::resizeState` | 65 |
| `Foam::RBD::rigidBodyModel::addRestraints` | 86 |
| `Foam::RBD::rigidBodyModel::join_` | 124 |
| `Foam::RBD::rigidBodyModel::rigidBodyModel` | 178 |
| `Foam::RBD::rigidBodyModel::join` | 225 |
| `Foam::RBD::rigidBodyModel::makeComposite` | 299 |
| `Foam::RBD::rigidBodyModel::merge` | 316 |
| `Foam::RBD::rigidBodyModel::X0` | 374 |
| `Foam::RBD::rigidBodyModel::movingBodyNames` | 391 |
| `Foam::RBD::rigidBodyModel::write` | 410 |
| `Foam::RBD::rigidBodyModel::read` | 475 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`rigidBodyModel.H`](../../../17-other-libraries/files/49/rigidbodymodel.h--49aa1bf0e485.md)
- [`masslessBody.H`](../../../17-other-libraries/files/b2/masslessbody.h--b240cd3da085.md)
- [`compositeBody.H`](../../../17-other-libraries/files/13/compositebody.h--13719629ac8b.md)
- [`jointBody.H`](../../../17-other-libraries/files/b5/jointbody.h--b533d84a1aba.md)
- [`nullJoint.H`](../../../17-other-libraries/files/eb/nulljoint.h--eb44dd6d7ec9.md)
- [`rigidBodyRestraint.H`](../../../17-other-libraries/files/83/rigidbodyrestraint.h--833ae4439eea.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
