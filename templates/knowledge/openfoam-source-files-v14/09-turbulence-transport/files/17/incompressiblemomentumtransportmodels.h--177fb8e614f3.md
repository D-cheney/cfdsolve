---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-177fb8e614f3"
title: "OpenFOAM 14 源码解析：incompressibleMomentumTransportModels.H"
summary: "该文件为“湍流与输运”提供 `incompressibleMomentumTransportModels` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：incompressibleMomentumTransportModels.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：70 行
- 文件标识：`177fb8e614f3`

## 2. 功能说明

该文件为“湍流与输运”提供 `incompressibleMomentumTransportModels` 相关接口、模板实例或支撑定义。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Typedefs for turbulence, RAS and LES models for incompressible flow based on the standard laminar transport package.

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`incompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/d6/incompressiblemomentumtransportmodel.h--d66b1dda583c.md)
- [`laminarModel.H`](../../../09-turbulence-transport/files/38/laminarmodel.h--387d6eff7a10.md)
- [`RASModel.H`](../../../09-turbulence-transport/files/88/rasmodel.h--88056730872d.md)
- [`LESModel.H`](../../../09-turbulence-transport/files/b3/lesmodel.h--b313bdba577b.md)

## 8. 直接上层引用

- [applications/legacy/incompressible/adjointShapeOptimisationFoam/adjointShapeOptimisationFoam.C](../../../17-other-libraries/files/ed/adjointshapeoptimisationfoam.c--edfd65cc01a2.md)
- [applications/legacy/incompressible/porousSimpleFoam/porousSimpleFoam.C](../../../17-other-libraries/files/23/poroussimplefoam.c--23250fda2f39.md)
- [applications/solvers/boundaryFoam/boundaryFoam.C](../../../01-solver-entry/files/3a/boundaryfoam.c--3a004ad2140b.md)
- [applications/utilities/preProcessing/applyBoundaryLayer/applyBoundaryLayer.C](../../../03-utilities/files/b5/applyboundarylayer.c--b58f2ecdbf4a.md)
- [src/MomentumTransportModels/incompressible/RAS/kkLOmega/kkLOmega.H](../../../09-turbulence-transport/files/2a/kklomega.h--2aa769402c95.md)
- [src/MomentumTransportModels/incompressible/RAS/LamBremhorstKE/LamBremhorstKE.H](../../../09-turbulence-transport/files/e6/lambremhorstke.h--e61ef24883a0.md)
- [src/MomentumTransportModels/incompressible/RAS/LienCubicKE/LienCubicKE.H](../../../09-turbulence-transport/files/c4/liencubicke.h--c4b18c802c1f.md)
- [src/MomentumTransportModels/incompressible/RAS/LienLeschziner/LienLeschziner.H](../../../09-turbulence-transport/files/13/lienleschziner.h--138ee4b09998.md)
- [src/MomentumTransportModels/incompressible/RAS/qZeta/qZeta.H](../../../09-turbulence-transport/files/a5/qzeta.h--a5d2a9eb0990.md)
- [src/MomentumTransportModels/incompressible/RAS/ShihQuadraticKE/ShihQuadraticKE.H](../../../09-turbulence-transport/files/e0/shihquadraticke.h--e055395d2106.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
