---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-926f7cda0c41"
title: "OpenFOAM 14 源码解析：rigidBody.H"
summary: "该文件声明或实现 `subBody`、`rigidBody`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/rigidBodyDynamics/bodies/rigidBody/rigidBody.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：rigidBody.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/rigidBodyDynamics/bodies/rigidBody/rigidBody.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：205 行
- 文件标识：`926f7cda0c41`

## 2. 功能说明

该文件声明或实现 `subBody`、`rigidBody`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：SourceFiles rigidBodyI.H

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `subBody` | 56 |
| `rigidBody` | 57 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`rigidBodyInertia.H`](../../../17-other-libraries/files/0b/rigidbodyinertia.h--0b9bfdd81c93.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`primitiveFieldsFwd.H`](../../../04-core-runtime/files/7a/primitivefieldsfwd.h--7a313a3cc235.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`rigidBodyI.H`](../../../17-other-libraries/files/1f/rigidbodyi.h--1f61a499b82d.md)

## 8. 直接上层引用

- [src/rigidBodyMotion/rigidBodyDynamics/bodies/compositeBody/compositeBody.H](../../../17-other-libraries/files/13/compositebody.h--13719629ac8b.md)
- [src/rigidBodyMotion/rigidBodyDynamics/bodies/cuboid/cuboid.H](../../../17-other-libraries/files/fe/cuboid.h--fe2ccd4254a6.md)
- [src/rigidBodyMotion/rigidBodyDynamics/bodies/masslessBody/masslessBody.H](../../../17-other-libraries/files/b2/masslessbody.h--b240cd3da085.md)
- [src/rigidBodyMotion/rigidBodyDynamics/bodies/pointMasses/pointMasses.H](../../../17-other-libraries/files/b9/pointmasses.h--b9dc5e79e71b.md)
- [src/rigidBodyMotion/rigidBodyDynamics/bodies/rigidBody/rigidBody.C](../../../17-other-libraries/files/6c/rigidbody.c--6ccf81ec43b6.md)
- [src/rigidBodyMotion/rigidBodyDynamics/bodies/sphere/sphere.H](../../../17-other-libraries/files/3a/sphere.h--3a414935cf6b.md)
- [src/rigidBodyMotion/rigidBodyDynamics/bodies/subBody/subBody.H](../../../17-other-libraries/files/3e/subbody.h--3eee99ad3c40.md)
- [src/rigidBodyMotion/rigidBodyDynamics/rigidBodyModel/rigidBodyModel.H](../../../17-other-libraries/files/49/rigidbodymodel.h--49aa1bf0e485.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
