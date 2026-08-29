---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-df6e4c946723"
title: "OpenFOAM 14 源码解析：OldTimeField.H"
summary: "该文件声明或实现 `OldTimeField`、`OldTimeField0Type`、`Field`、`SubField`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/OldTimeField/OldTimeField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：OldTimeField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/OldTimeField/OldTimeField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：352 行
- 文件标识：`df6e4c946723`

## 2. 功能说明

该文件声明或实现 `OldTimeField`、`OldTimeField0Type`、`Field`、`SubField`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Class to add into field types to provide old-time storage and retrieval

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `OldTimeField` | 54 |
| `OldTimeField0Type` | 61 |
| `Field` | 76 |
| `SubField` | 79 |
| `OldTimeOtherFieldType` | 98 |
| `OtherPrimitiveField` | 111 |
| `OldTimeBaseFieldType` | 283 |
| `OldTimeFieldCopy` | 308 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`VoidT.H`](../../../04-core-runtime/files/76/voidt.h--7615e521f3b6.md)
- [`OldTimeFieldI.H`](../../../05-finite-volume/files/f1/oldtimefieldi.h--f1073ff2dcf7.md)
- [`OldTimeField.C`](../../../05-finite-volume/files/a8/oldtimefield.c--a8c5396e2c01.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/DimensionedFields/DimensionedField/DimensionedField.H](../../../05-finite-volume/files/5d/dimensionedfield.h--5d3e98805c1c.md)
- [src/finiteVolume/fields/OldTimeField/OldTimeField.C](../../../05-finite-volume/files/a8/oldtimefield.c--a8c5396e2c01.md)
- [src/finiteVolume/fields/OldTimeField/OldTimeFieldI.H](../../../05-finite-volume/files/f1/oldtimefieldi.h--f1073ff2dcf7.md)
- [src/finiteVolume/fields/UniformDimensionedFields/UniformDimensionedField.H](../../../05-finite-volume/files/b1/uniformdimensionedfield.h--b19d8b85e336.md)
- [src/Lagrangian/Lagrangian/fields/IODynamicField.H](../../../11-lagrangian/files/14/iodynamicfield.h--1404864a6d0e.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
