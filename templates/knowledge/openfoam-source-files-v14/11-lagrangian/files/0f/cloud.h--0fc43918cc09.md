---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0fc43918cc09"
title: "OpenFOAM 14 源码解析：Cloud.H"
summary: "该文件声明或实现 `IOPosition`、`Cloud`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/basic/Cloud/Cloud.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：Cloud.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/basic/Cloud/Cloud.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：363 行
- 文件标识：`0fc43918cc09`

## 2. 功能说明

该文件声明或实现 `IOPosition`、`Cloud`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Base cloud calls templated on particle type

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `IOPosition` | 56 |
| `Cloud` | 62 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `size` | 198 |
| `cpuLoad` | 205 |
| `clear` | 245 |

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- `cloud.H`
- [`IDLList.H`](../../../04-core-runtime/files/38/idllist.h--38575faace5d.md)
- [`IOField.H`](../../../04-core-runtime/files/32/iofield.h--321ce3fad2b9.md)
- [`CompactIOField.H`](../../../04-core-runtime/files/4f/compactiofield.h--4f013e2e1871.md)
- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`PackedBoolList.H`](../../../04-core-runtime/files/6e/packedboollist.h--6eaf5d33f077.md)
- [`Cloud.C`](../../../11-lagrangian/files/bc/cloud.c--bc5dc5c9517f.md)

## 8. 直接上层引用

- [applications/utilities/miscellaneous/foamFormatConvert/foamFormatConvert.C](../../../03-utilities/files/58/foamformatconvert.c--584a7d021eb6.md)
- [applications/utilities/postProcessing/dataConversion/foamToEnsight/ensightCloudField.H](../../../03-utilities/files/f9/ensightcloudfield.h--f9e2cf9fb111.md)
- [applications/utilities/postProcessing/dataConversion/foamToEnsight/ensightParticlePositions.C](../../../03-utilities/files/bd/ensightparticlepositions.c--bd07ab515901.md)
- [applications/utilities/postProcessing/dataConversion/foamToEnsightParts/ensightOutputFunctions.H](../../../03-utilities/files/a6/ensightoutputfunctions.h--a6b933aab2e4.md)
- [applications/utilities/postProcessing/dataConversion/foamToGMV/foamToGMV.C](../../../03-utilities/files/1c/foamtogmv.c--1c3d791b8675.md)
- [applications/utilities/postProcessing/dataConversion/foamToVTK/foamToVTK.C](../../../03-utilities/files/c7/foamtovtk.c--c7553829b250.md)
- [applications/utilities/postProcessing/dataConversion/foamToVTK/foamToVTK/lagrangianWriter.C](../../../03-utilities/files/9b/lagrangianwriter.c--9b4f74035838.md)
- [applications/utilities/postProcessing/dataConversion/foamToVTK/foamToVTK/lagrangianWriterTemplates.C](../../../03-utilities/files/f4/lagrangianwritertemplates.c--f4b7fe88d036.md)
- [applications/utilities/postProcessing/graphics/ensightFoamReader/libuserd.C](../../../03-utilities/files/f2/libuserd.c--f23ac01200a7.md)
- [applications/utilities/postProcessing/lagrangian/particleTracks/particleTracks.C](../../../03-utilities/files/c2/particletracks.c--c27e86a0b688.md)
- [applications/utilities/postProcessing/lagrangian/steadyParticleTracks/steadyParticleTracks.C](../../../03-utilities/files/88/steadyparticletracks.c--883e12e6500e.md)
- [src/functionObjects/field/nearWallFields/findCellParticle.H](../../../14-postprocessing/files/0a/findcellparticle.h--0a864614959f.md)
- [src/functionObjects/field/streamlines/streamlinesCloud.H](../../../14-postprocessing/files/4f/streamlinescloud.h--4f2ae280a2b4.md)
- [src/functionObjects/field/streamlines/streamlinesParticle.H](../../../14-postprocessing/files/b1/streamlinesparticle.h--b1c9c4491e1a.md)
- [src/lagrangian/basic/Cloud/Cloud.C](../../../11-lagrangian/files/bc/cloud.c--bc5dc5c9517f.md)
- [src/lagrangian/basic/Cloud/CloudIO.C](../../../11-lagrangian/files/2f/cloudio.c--2f69843b86d6.md)
- [src/lagrangian/basic/passiveParticle/passiveParticleCloud.H](../../../11-lagrangian/files/94/passiveparticlecloud.h--94598f07ae20.md)
- [src/lagrangian/DSMC/clouds/Templates/DSMCCloud/DSMCCloud.H](../../../11-lagrangian/files/dd/dsmccloud.h--dd9826c99d1f.md)
- [src/lagrangian/DSMC/parcels/Templates/DSMCParcel/DSMCParcelIO.C](../../../11-lagrangian/files/bc/dsmcparcelio.c--bc4749315404.md)
- [src/lagrangian/molecularDynamics/molecule/molecule.H](../../../11-lagrangian/files/61/molecule.h--614396c741a1.md)
- [src/lagrangian/molecularDynamics/moleculeCloud/moleculeCloud.H](../../../11-lagrangian/files/45/moleculecloud.h--4594a6062d01.md)
- [src/lagrangian/parcel/clouds/Templates/CollidingCloud/CollidingCloud.H](../../../11-lagrangian/files/d8/collidingcloud.h--d888c12f19d5.md)
- [src/lagrangian/parcel/clouds/Templates/MomentumCloud/MomentumCloud.H](../../../11-lagrangian/files/ff/momentumcloud.h--ffe06b1f4abd.md)
- [src/lagrangian/parcel/clouds/Templates/MPPICCloud/MPPICCloud.H](../../../11-lagrangian/files/3c/mppiccloud.h--3c734e223b2e.md)
- [src/lagrangian/parcel/clouds/Templates/ReactingCloud/ReactingCloud.H](../../../11-lagrangian/files/53/reactingcloud.h--531be5ad1703.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
