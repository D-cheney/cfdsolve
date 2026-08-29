---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-bcc89db2c000"
title: "OpenFOAM 14 源码解析：GeometricField.C"
summary: "该文件实现 `GeometricField` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/GeometricFields/GeometricField/GeometricField.C"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：GeometricField.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/GeometricFields/GeometricField/GeometricField.C`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：2160 行
- 文件标识：`bcc89db2c000`

## 2. 功能说明

该文件实现 `GeometricField` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `PrimitiveField` | 68 |
| `PrimitiveField2` | 417 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
5. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
7. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
8. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`GeometricField.H`](../../../05-finite-volume/files/d9/geometricfield.h--d97ab300040a.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`demandDrivenData.H`](../../../04-core-runtime/files/9e/demanddrivendata.h--9e7164867a61.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`localIOdictionary.H`](../../../04-core-runtime/files/f9/localiodictionary.h--f9800e0cf2b8.md)
- [`solutionControl.H`](../../../04-core-runtime/files/41/solutioncontrol.h--4108393f3814.md)
- [`GeometricFieldFunctions.C`](../../../05-finite-volume/files/4d/geometricfieldfunctions.c--4dec04130c30.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/GeometricFields/GeometricField/GeometricField.H](../../../05-finite-volume/files/d9/geometricfield.h--d97ab300040a.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
