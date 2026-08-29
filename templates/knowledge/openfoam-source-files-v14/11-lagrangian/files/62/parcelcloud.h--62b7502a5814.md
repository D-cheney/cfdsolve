---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-62b7502a5814"
title: "OpenFOAM 14 源码解析：parcelCloud.H"
summary: "该文件声明或实现 `fluidThermo`、`parcelCloud`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/parcelCloud/parcelCloud.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：parcelCloud.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/parcelCloud/parcelCloud.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：191 行
- 文件标识：`62b7502a5814`

## 2. 功能说明

该文件声明或实现 `fluidThermo`、`parcelCloud`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Virtual abstract base class for parcel clouds. As parcelCloudBase but with additional virtualisation of the evolve method, plus some additional methods that are defined below the parcel-cloud layer (i.e., in Cloud). These methods are implemented by forwarding in the ParcelCloud class. This class contains the selection table and represents the high level interface used by a solver.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fluidThermo` | 56 |
| `parcelCloud` | 60 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **分布式映射**：依据全局到局部寻址重排和交换数据。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`parcelCloudBase.H`](../../../11-lagrangian/files/4a/parcelcloudbase.h--4ac524f70e96.md)

## 8. 直接上层引用

- [src/lagrangian/functionObjects/cloudInfo/cloudInfo.C](../../../11-lagrangian/files/b9/cloudinfo.c--b917e6fdee06.md)
- [src/lagrangian/functionObjects/particles/particles.H](../../../11-lagrangian/files/6d/particles.h--6dc66d11083f.md)
- [src/lagrangian/parcel/parcelCloud/parcelCloud.C](../../../11-lagrangian/files/75/parcelcloud.c--7541d4130c73.md)
- [src/lagrangian/parcel/parcelCloud/ParcelCloud.H](../../../11-lagrangian/files/b0/parcelcloud.h--b038fb3a2438.md)
- [src/lagrangian/parcel/parcelCloud/parcelCloudList.H](../../../11-lagrangian/files/9c/parcelcloudlist.h--9cd62bd70db8.md)
- [src/lagrangian/parcel/parcelCloud/parcelCloudNew.C](../../../11-lagrangian/files/5f/parcelcloudnew.c--5f03171280b1.md)
- [src/lagrangian/parcel/submodels/addOns/radiation/absorptionEmission/cloudAbsorptionEmission/cloudAbsorptionEmission.C](../../../11-lagrangian/files/a7/cloudabsorptionemission.c--a7df3e6cacd5.md)
- [src/lagrangian/parcel/submodels/addOns/radiation/scatter/cloudScatter/cloudScatter.C](../../../11-lagrangian/files/27/cloudscatter.c--27c7cba75788.md)
- [src/lagrangian/parcel/submodels/ReactingMultiphase/StochasticCollision/SuppressionCollision/SuppressionCollision.C](../../../11-lagrangian/files/f5/suppressioncollision.c--f54b9f395cfd.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
