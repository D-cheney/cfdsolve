---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-16af563707e7"
title: "OpenFOAM 14 源码解析：mappedExtrudedWallFvPatch.H"
summary: "该文件声明或实现 `mappedExtrudedWallFvPatch`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/fvPatches/derived/mapped/mappedExtrudedWallFvPatch.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：mappedExtrudedWallFvPatch.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/fvPatches/derived/mapped/mappedExtrudedWallFvPatch.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：89 行
- 文件标识：`16af563707e7`

## 2. 功能说明

该文件声明或实现 `mappedExtrudedWallFvPatch`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `mappedExtrudedWallFvPatch` | 53 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`wallFvPatch.H`](../../../05-finite-volume/files/91/wallfvpatch.h--91e9c7f67f00.md)
- [`mappedFvPatchBase.H`](../../../05-finite-volume/files/2e/mappedfvpatchbase.h--2e95acbd755e.md)
- [`mappedExtrudedWallPolyPatch.H`](../../../07-mesh-geometry/files/2a/mappedextrudedwallpolypatch.h--2ad88790372c.md)

## 8. 直接上层引用

- [src/finiteVolume/fvMesh/fvPatches/derived/mapped/mappedExtrudedWallFvPatch.C](../../../05-finite-volume/files/58/mappedextrudedwallfvpatch.c--587f5474414d.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
