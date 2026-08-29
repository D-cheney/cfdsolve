---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-feee19ffd6fd"
title: "OpenFOAM 14 源码解析：checkMesh.H"
summary: "该文件声明或实现 `checkMesh`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/utilities/checkMesh/checkMesh.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：checkMesh.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/utilities/checkMesh/checkMesh.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：183 行
- 文件标识：`feee19ffd6fd`

## 2. 功能说明

该文件声明或实现 `checkMesh`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：Executes primitiveMesh::checkMesh(true) every execute time for which the mesh changed, i.e. moved or changed topology. Useful to check the correctness of changing and morphing meshes. Usage \table Property | Description | Required | Default value type | type name: checkMesh | yes | noTopology | Skip checking the mesh topology | no | false allTopology | Check all addressing | no | false allGeometry | Check all geometry | no | false writeSurfaces | Reconstruct and write problem faces | no | false surfaceFormat | Format for problem faceSets | no | vtk writeSets | Reconstruct and write problem points | no | false setFormat | Format used to write the problem pointSets | no | vtk nonOrthThreshold | Threshold for non-orthogonality errors | no | 70 deg skewThreshold | Threshold for reporting skewness errors | no | 4 stopAt | Stops the run if any mesh checks fail | no | endTime \endtable The opti

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `checkMesh` | 111 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)

## 8. 直接上层引用

- [src/functionObjects/utilities/checkMesh/checkMesh.C](../../../14-postprocessing/files/f1/checkmesh.c--f18e2b8c5a00.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
