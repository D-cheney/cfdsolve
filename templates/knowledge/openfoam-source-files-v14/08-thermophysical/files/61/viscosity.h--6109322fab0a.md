---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6109322fab0a"
title: "OpenFOAM 14 源码解析：viscosity.H"
summary: "该文件声明或实现 `viscosity`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/physicalProperties/viscosity/viscosity.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：viscosity.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/physicalProperties/viscosity/viscosity.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：103 行
- 文件标识：`6109322fab0a`

## 2. 功能说明

该文件声明或实现 `viscosity`，属于“热物性与反应”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Abstract base class for all fluid physical properties

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `viscosity` | 55 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`primitiveFieldsFwd.H`](../../../04-core-runtime/files/7a/primitivefieldsfwd.h--7a313a3cc235.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)

## 8. 直接上层引用

- [applications/modules/compressibleMultiphaseVoF/compressibleMultiphaseVoFMixture/compressibleMultiphaseVoFMixture.H](../../../02-solver-modules/files/f2/compressiblemultiphasevofmixture.h--f29585f59903.md)
- [applications/modules/incompressibleMultiphaseVoF/incompressibleMultiphaseVoFMixture/incompressibleMultiphaseVoFMixture.H](../../../02-solver-modules/files/1e/incompressiblemultiphasevofmixture.h--1e38566d94c4.md)
- [src/Lagrangian/cloud/clouds/coupled/coupled.C](../../../11-lagrangian/files/6f/coupled.c--6f6768de7e30.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/generalisedNewtonianViscosityModel/generalisedNewtonianViscosityModel.H](../../../09-turbulence-transport/files/07/generalisednewtonianviscositymodel.h--07e050655036.md)
- [src/MomentumTransportModels/momentumTransportModels/momentumTransportModel.H](../../../09-turbulence-transport/files/36/momentumtransportmodel.h--36c367269e58.md)
- [src/physicalProperties/viscosity/viscosity.C](../../../08-thermophysical/files/82/viscosity.c--827014af0ad7.md)
- [src/physicalProperties/viscosityModels/viscosityModel/viscosityModel.H](../../../08-thermophysical/files/71/viscositymodel.h--71ddc0685b08.md)
- [src/thermophysicalModels/basic/fluidThermo/fluidThermo.H](../../../08-thermophysical/files/9e/fluidthermo.h--9e58ccc4fa8c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
