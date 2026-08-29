---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-567c53c5fe23"
title: "OpenFOAM 14 源码解析：propellerDiskTemplates.C"
summary: "该文件实现 `addActuationDiskAxialInertialResistance` 等过程，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/propellerDisk/propellerDiskTemplates.C"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：propellerDiskTemplates.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/propellerDisk/propellerDiskTemplates.C`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：206 行
- 文件标识：`567c53c5fe23`

## 2. 功能说明

该文件实现 `addActuationDiskAxialInertialResistance` 等过程，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::fv::propellerDisk::addActuationDiskAxialInertialResistance` | 40 |

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
4. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
5. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`propellerDisk.H`](../../../12-boundaries-sources/files/f6/propellerdisk.h--f65b17995dae.md)
- [`fvMatrix.H`](../../../05-finite-volume/files/72/fvmatrix.h--7269aa48a1c0.md)
- [`pimpleNoLoopControl.H`](../../../05-finite-volume/files/21/pimplenoloopcontrol.h--211d4bd02bbb.md)
- [`mathematicalConstants.H`](../../../04-core-runtime/files/80/mathematicalconstants.h--8059f1c384fb.md)

## 8. 直接上层引用

- [src/fvModels/propellerDisk/propellerDisk.H](../../../12-boundaries-sources/files/f6/propellerdisk.h--f65b17995dae.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
