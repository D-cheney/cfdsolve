---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ffe06b1f4abd"
title: "OpenFOAM 14 源码解析：MomentumCloud.H"
summary: "该文件声明或实现 `integrationScheme`、`InjectionModelList`、`DispersionModel`、`PatchInteractionModel`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/clouds/Templates/MomentumCloud/MomentumCloud.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：MomentumCloud.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/clouds/Templates/MomentumCloud/MomentumCloud.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：669 行
- 文件标识：`ffe06b1f4abd`

## 2. 功能说明

该文件声明或实现 `integrationScheme`、`InjectionModelList`、`DispersionModel`、`PatchInteractionModel`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Templated base class for momentum cloud - cloud function objects - particle forces, e.g. - buoyancy - drag - pressure gradient - ... - sub-models: - dispersion model - injection model - patch interaction model - stochastic collision model - surface film model

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `integrationScheme` | 81 |
| `InjectionModelList` | 83 |
| `DispersionModel` | 86 |
| `PatchInteractionModel` | 89 |
| `SurfaceFilmModel` | 92 |
| `StochasticCollisionModel` | 95 |
| `MomentumCloud` | 110 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `cpuLoad` | 554 |

## 5. 算法与控制流程

1. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
2. **分布式映射**：依据全局到局部寻址重排和交换数据。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- `particle.H`
- [`Cloud.H`](../../../11-lagrangian/files/0f/cloud.h--0fc43918cc09.md)
- [`timeIOdictionary.H`](../../../04-core-runtime/files/fa/timeiodictionary.h--fa839555249b.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`randomGenerator.H`](../../../04-core-runtime/files/9b/randomgenerator.h--9b6aa7dc2c72.md)
- [`standardNormal.H`](../../../04-core-runtime/files/98/standardnormal.h--98bb32a671fd.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`fvMatrices.H`](../../../05-finite-volume/files/4d/fvmatrices.h--4d784c209b6a.md)
- [`cloudSolution.H`](../../../11-lagrangian/files/81/cloudsolution.h--813dcb642630.md)
- [`fluidThermo.H`](../../../08-thermophysical/files/9e/fluidthermo.h--9e58ccc4fa8c.md)
- [`ParticleForceList.H`](../../../11-lagrangian/files/a6/particleforcelist.h--a6f5f5d97934.md)
- [`CloudFunctionObjectList.H`](../../../11-lagrangian/files/0c/cloudfunctionobjectlist.h--0c9502657d0e.md)
- [`MomentumCloudI.H`](../../../11-lagrangian/files/d7/momentumcloudi.h--d7aea88dd34e.md)
- [`MomentumCloud.C`](../../../11-lagrangian/files/8f/momentumcloud.c--8ffc36e4736c.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/clouds/derived/collidingCloud/collidingCloud.H](../../../11-lagrangian/files/65/collidingcloud.h--653dc4ce5472.md)
- [src/lagrangian/parcel/clouds/derived/momentumCloud/momentumCloud.H](../../../11-lagrangian/files/e1/momentumcloud.h--e1ab6b30c731.md)
- [src/lagrangian/parcel/clouds/derived/mppicCloud/mppicCloud.H](../../../11-lagrangian/files/d3/mppiccloud.h--d35ccf4df1c4.md)
- [src/lagrangian/parcel/clouds/derived/reactingCloud/reactingCloud.H](../../../11-lagrangian/files/b7/reactingcloud.h--b76df5028c2b.md)
- [src/lagrangian/parcel/clouds/derived/reactingMultiphaseCloud/reactingMultiphaseCloud.H](../../../11-lagrangian/files/51/reactingmultiphasecloud.h--51b013e28311.md)
- [src/lagrangian/parcel/clouds/derived/sprayCloud/sprayCloud.H](../../../11-lagrangian/files/d3/spraycloud.h--d35676d3516d.md)
- [src/lagrangian/parcel/clouds/derived/thermoCloud/thermoCloud.H](../../../11-lagrangian/files/11/thermocloud.h--11f0b081792c.md)
- [src/lagrangian/parcel/clouds/Templates/MomentumCloud/MomentumCloud.C](../../../11-lagrangian/files/8f/momentumcloud.c--8ffc36e4736c.md)
- [src/lagrangian/parcel/clouds/Templates/MomentumCloud/MomentumCloudName.C](../../../11-lagrangian/files/8b/momentumcloudname.c--8b8246b5cc11.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
