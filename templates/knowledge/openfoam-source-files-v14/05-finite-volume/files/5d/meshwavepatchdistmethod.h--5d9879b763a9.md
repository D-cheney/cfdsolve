---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5d9879b763a9"
title: "OpenFOAM 14 源码解析：meshWavePatchDistMethod.H"
summary: "该文件声明或实现 `meshWave`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/wallDist/patchDistMethods/meshWave/meshWavePatchDistMethod.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：meshWavePatchDistMethod.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/wallDist/patchDistMethods/meshWave/meshWavePatchDistMethod.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：153 行
- 文件标识：`5d9879b763a9`

## 2. 功能说明

该文件声明或实现 `meshWave`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Fast topological mesh-wave method for calculating the distance to nearest patch for all cells and boundary. For regular/un-distorted meshes this method is accurate but for skewed, non-orthogonal meshes it is approximate with the error increasing with the degree of mesh distortion. The distance from the near-wall cells to the boundary may optionally be corrected for mesh distortion by setting a number of correction iterations. Example of the wallDist specification in fvSchemes: \verbatim wallDist { method meshWave; // Number of corrections nCorrectors 3; // Optional entry enabling the calculation // of the normal-to-wall field nRequired false; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `meshWave` | 82 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`patchDistMethod.H`](../../../05-finite-volume/files/f7/patchdistmethod.h--f75c6ffc5601.md)

## 8. 直接上层引用

- [src/finiteVolume/fvMesh/wallDist/patchDistMethods/meshWave/meshWavePatchDistMethod.C](../../../05-finite-volume/files/a1/meshwavepatchdistmethod.c--a17ec2c87331.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
