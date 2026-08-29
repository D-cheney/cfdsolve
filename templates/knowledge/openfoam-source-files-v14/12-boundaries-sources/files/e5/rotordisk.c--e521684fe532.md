---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e521684fe532"
title: "OpenFOAM 14 源码解析：rotorDisk.C"
summary: "该文件实现 `rotorDisk` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/rotorDisk/rotorDisk.C"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：rotorDisk.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/rotorDisk/rotorDisk.C`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：662 行
- 文件标识：`e521684fe532`

## 2. 功能说明

该文件实现 `rotorDisk` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积物理源项。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::fv::rotorDisk::readCoeffs` | 79 |
| `Foam::fv::rotorDisk::checkData` | 119 |
| `Foam::fv::rotorDisk::setFaceArea` | 156 |
| `Foam::fv::rotorDisk::createCoordinateSystem` | 294 |
| `Foam::fv::rotorDisk::constructGeometry` | 419 |
| `Foam::fv::rotorDisk::inflowVelocity` | 455 |
| `Foam::fv::rotorDisk::addSupFields` | 533 |
| `Foam::fv::rotorDisk::addSup` | 538 |
| `Foam::fv::rotorDisk::movePoints` | 620 |
| `Foam::fv::rotorDisk::topoChange` | 627 |
| `Foam::fv::rotorDisk::mapMesh` | 633 |
| `Foam::fv::rotorDisk::distribute` | 639 |
| `Foam::fv::rotorDisk::read` | 645 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
5. **分布式映射**：依据全局到局部寻址重排和交换数据。
6. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
7. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
8. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
9. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
10. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`rotorDisk.H`](../../../12-boundaries-sources/files/38/rotordisk.h--38da686189e1.md)
- [`fvMatrices.H`](../../../05-finite-volume/files/4d/fvmatrices.h--4d784c209b6a.md)
- [`geometricOneField.H`](../../../05-finite-volume/files/95/geometriconefield.h--95138167ad6f.md)
- [`syncTools.H`](../../../04-core-runtime/files/46/synctools.h--46bd311140af.md)
- [`axesRotation.H`](../../../07-mesh-geometry/files/78/axesrotation.h--78d983aa88ef.md)
- [`omega.H`](../../../04-core-runtime/files/e2/omega.h--e2137956dd4b.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`、`addBackwardCompatibleToRunTimeSelectionTable`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
