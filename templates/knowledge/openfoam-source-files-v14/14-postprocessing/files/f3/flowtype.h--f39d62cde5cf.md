---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f39d62cde5cf"
title: "OpenFOAM 14 源码解析：flowType.H"
summary: "该文件声明或实现 `flowType`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/field/flowType/flowType.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：flowType.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/field/flowType/flowType.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：148 行
- 文件标识：`f39d62cde5cf`

## 2. 功能说明

该文件声明或实现 `flowType`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：Calculates and writes a field in the range -1 to 1, in which: - 1 = rotational flow - 0 = parallel shear (50% rotational, 50% shear) - -1 = pure shear deformation The field is calculated as: \verbatim flowType = -(devGradU && devGradU.T())/magSqr(devGradU) \endverbatim where \c devGradU = \c dev(fvc::grad(U)). The \c flowType parameter is designed for visualisation of vortices, by extracting an iso-surface of these fields at a specified value. The parameter is similar to \c Q and \c Lambda2, except that \c Q and \c Lambda2 represent the rotational speed, or "strength", of vortices whereas \c flowType is normalised to a scale between -1 and 1, making it independent of vortex strength. The normalisation of \c flowType provides the advantage that it is much easier to select a value of iso-surface to visualise vortices effectively. Generally a value of 0.2 (or between 0.05 - 0.2) is recommen

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `flowType` | 87 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。

## 6. 数学与离散关系

- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)
- [`writeLocalObjects.H`](../../../04-core-runtime/files/0d/writelocalobjects.h--0dda5168d043.md)

## 8. 直接上层引用

- [src/functionObjects/field/flowType/flowType.C](../../../14-postprocessing/files/a3/flowtype.c--a3eecd3744ef.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
