---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-469fe4a1557a"
title: "OpenFOAM 14 源码解析：nonConformalCoupledFvPatch.H"
summary: "该文件声明或实现 `nonConformalErrorFvPatch`、`nonConformalCoupledFvPatch`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/fvPatches/constraint/nonConformalCoupled/nonConformalCoupledFvPatch.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：nonConformalCoupledFvPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/fvPatches/constraint/nonConformalCoupled/nonConformalCoupledFvPatch.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：145 行
- 文件标识：`469fe4a1557a`

## 2. 功能说明

该文件声明或实现 `nonConformalErrorFvPatch`、`nonConformalCoupledFvPatch`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Non-conformal coupled FV patch. As nonConformalFvPatch, but is also coupled to another non-conformal patch.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `nonConformalErrorFvPatch` | 57 |
| `nonConformalCoupledFvPatch` | 63 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`cyclicFvPatch.H`](../../../05-finite-volume/files/dd/cyclicfvpatch.h--ddbbe2353ea1.md)
- [`nonConformalCoupledPolyPatch.H`](../../../07-mesh-geometry/files/99/nonconformalcoupledpolypatch.h--99f481a588ec.md)
- [`nonConformalFvPatch.H`](../../../05-finite-volume/files/b8/nonconformalfvpatch.h--b81c339b46e8.md)

## 8. 直接上层引用

- [src/finiteVolume/fvMesh/fvPatches/constraint/nonConformalCoupled/nonConformalCoupledFvPatch.C](../../../05-finite-volume/files/d5/nonconformalcoupledfvpatch.c--d541dbd7eb18.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/nonConformalCyclic/nonConformalCyclicFvPatch.H](../../../05-finite-volume/files/7b/nonconformalcyclicfvpatch.h--7bd00ba3a974.md)
- [src/finiteVolume/fvMesh/fvPatches/constraint/nonConformalProcessorCyclic/nonConformalProcessorCyclicFvPatch.H](../../../05-finite-volume/files/03/nonconformalprocessorcyclicfvpatch.h--0336c14e90ac.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
