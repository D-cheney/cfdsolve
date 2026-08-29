---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0e2e21b817ea"
title: "OpenFOAM 14 源码解析：fvMatrix.C"
summary: "该文件实现 `fvMatrix` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMatrices/fvMatrix/fvMatrix.C"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvMatrix.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMatrices/fvMatrix/fvMatrix.C`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：2607 行
- 文件标识：`0e2e21b817ea`

## 2. 功能说明

该文件实现 `fvMatrix` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ListType` | 503 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::checkMethod` | 1424 |
| `Foam::correction` | 1496 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **隐式时间项**：把时间导数装配到矩阵对角与源项，参与线性方程求解。
3. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
4. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
5. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 时间项：$\int_V \partial \phi/\partial t\,\mathrm{d}V$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`surfaceFields.H`](../../../05-finite-volume/files/46/surfacefields.h--468a61846d4e.md)
- [`calculatedFvPatchFields.H`](../../../05-finite-volume/files/b0/calculatedfvpatchfields.h--b00e252b7646.md)
- [`extrapolatedCalculatedFvPatchFields.H`](../../../05-finite-volume/files/27/extrapolatedcalculatedfvpatchfields.h--279c6557ffdc.md)
- [`coupledFvPatchFields.H`](../../../05-finite-volume/files/db/coupledfvpatchfields.h--db41229e7a70.md)
- [`UIndirectList.H`](../../../04-core-runtime/files/1a/uindirectlist.h--1afe1af204d9.md)
- [`UCompactListList.H`](../../../04-core-runtime/files/e5/ucompactlistlist.h--e595663225a2.md)
- [`fvmDdt.H`](../../../05-finite-volume/files/be/fvmddt.h--bee4ba370e19.md)
- [`fvMatrixSolve.C`](../../../05-finite-volume/files/b6/fvmatrixsolve.c--b62d4b771112.md)

## 8. 直接上层引用

- [src/finiteVolume/fvMatrices/fvMatrix/fvMatrix.H](../../../05-finite-volume/files/72/fvmatrix.h--7269aa48a1c0.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
