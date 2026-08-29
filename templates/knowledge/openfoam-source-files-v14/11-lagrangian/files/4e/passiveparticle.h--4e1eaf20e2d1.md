---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4e1eaf20e2d1"
title: "OpenFOAM 14 源码解析：passiveParticle.H"
summary: "该文件声明或实现 `passiveParticle`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/basic/passiveParticle/passiveParticle.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：passiveParticle.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/basic/passiveParticle/passiveParticle.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：127 行
- 文件标识：`4e1eaf20e2d1`

## 2. 功能说明

该文件声明或实现 `passiveParticle`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Copy of base particle

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `passiveParticle` | 56 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- `particle.H`
- [`IOstream.H`](../../../04-core-runtime/files/ad/iostream.h--adf73bfa6083.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)

## 8. 直接上层引用

- [applications/utilities/miscellaneous/foamFormatConvert/foamFormatConvert.C](../../../03-utilities/files/58/foamformatconvert.c--584a7d021eb6.md)
- [applications/utilities/postProcessing/dataConversion/foamToEnsight/ensightParticlePositions.C](../../../03-utilities/files/bd/ensightparticlepositions.c--bd07ab515901.md)
- [applications/utilities/postProcessing/dataConversion/foamToEnsightParts/ensightOutputFunctions.C](../../../03-utilities/files/f0/ensightoutputfunctions.c--f05030efa111.md)
- [applications/utilities/postProcessing/dataConversion/foamToGMV/foamToGMV.C](../../../03-utilities/files/1c/foamtogmv.c--1c3d791b8675.md)
- [applications/utilities/postProcessing/dataConversion/foamToVTK/foamToVTK.C](../../../03-utilities/files/c7/foamtovtk.c--c7553829b250.md)
- [applications/utilities/postProcessing/dataConversion/foamToVTK/foamToVTK/lagrangianWriter.C](../../../03-utilities/files/9b/lagrangianwriter.c--9b4f74035838.md)
- [applications/utilities/postProcessing/graphics/ensightFoamReader/libuserd.C](../../../03-utilities/files/f2/libuserd.c--f23ac01200a7.md)
- [src/lagrangian/basic/passiveParticle/passiveParticleCloud.H](../../../11-lagrangian/files/94/passiveparticlecloud.h--94598f07ae20.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
