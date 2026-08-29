---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0c9c2be0db68"
title: "OpenFOAM 14 源码解析：compressibleMomentumTransportModels.C"
summary: "该文件为“湍流与输运”提供 `compressibleMomentumTransportModels` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.C"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：compressibleMomentumTransportModels.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.C`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：149 行
- 文件标识：`0c9c2be0db68`

## 2. 功能说明

该文件为“湍流与输运”提供 `compressibleMomentumTransportModels` 相关接口、模板实例或支撑定义。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：上游文件头未提供独立 Description 段。

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

- [`makeCompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/76/makecompressiblemomentumtransportmodel.h--76018bb87199.md)
- [`Stokes.H`](../../../09-turbulence-transport/files/5c/stokes.h--5cb44ff3b0a0.md)
- [`generalisedNewtonian.H`](../../../09-turbulence-transport/files/a4/generalisednewtonian.h--a4d935e461b9.md)
- [`lambdaThixotropic.H`](../../../09-turbulence-transport/files/98/lambdathixotropic.h--98a04b272627.md)
- [`Maxwell.H`](../../../09-turbulence-transport/files/05/maxwell.h--05b235c48f3a.md)
- [`Giesekus.H`](../../../09-turbulence-transport/files/ea/giesekus.h--ea88ae4178d2.md)
- [`PTT.H`](../../../09-turbulence-transport/files/8d/ptt.h--8d88e13d7935.md)
- [`SpalartAllmaras.H`](../../../09-turbulence-transport/files/6d/spalartallmaras.h--6d5f960e1e94.md)
- [`kEpsilon.H`](../../../09-turbulence-transport/files/7f/kepsilon.h--7f9c956ca83a.md)
- [`RNGkEpsilon.H`](../../../09-turbulence-transport/files/d9/rngkepsilon.h--d9af376b8d0e.md)
- [`realizableKE.H`](../../../09-turbulence-transport/files/36/realizableke.h--36bcc4e8a49c.md)
- [`buoyantKEpsilon.H`](../../../09-turbulence-transport/files/56/buoyantkepsilon.h--5669b8d680ec.md)
- [`LaunderSharmaKE.H`](../../../09-turbulence-transport/files/f2/laundersharmake.h--f2c54b49ac55.md)
- [`kOmega.H`](../../../09-turbulence-transport/files/4e/komega.h--4ed799604423.md)
- [`kOmega2006.H`](../../../09-turbulence-transport/files/44/komega2006.h--44f91656c154.md)
- [`kOmegaSST.H`](../../../09-turbulence-transport/files/61/komegasst.h--6149a32f6f70.md)
- [`kOmegaSSTSAS.H`](../../../09-turbulence-transport/files/4f/komegasstsas.h--4ffa5066a2f0.md)
- [`kOmegaSSTLM.H`](../../../09-turbulence-transport/files/b5/komegasstlm.h--b575eb9a5408.md)
- [`v2f.H`](../../../09-turbulence-transport/files/c5/v2f.h--c52817545b8a.md)
- [`LRR.H`](../../../09-turbulence-transport/files/a4/lrr.h--a4cdcb2712fb.md)
- [`SSG.H`](../../../09-turbulence-transport/files/84/ssg.h--8425bb555165.md)
- [`Smagorinsky.H`](../../../09-turbulence-transport/files/db/smagorinsky.h--db9a684deeb8.md)
- [`WALE.H`](../../../09-turbulence-transport/files/9d/wale.h--9d244983898f.md)
- [`kEqn.H`](../../../09-turbulence-transport/files/93/keqn.h--93cce00169b6.md)
- [`dynamicKEqn.H`](../../../09-turbulence-transport/files/c4/dynamickeqn.h--c42da8465b60.md)
- [`dynamicLagrangian.H`](../../../09-turbulence-transport/files/c0/dynamiclagrangian.h--c06204b8d7d9.md)
- [`kOmegaSSTDES.H`](../../../09-turbulence-transport/files/02/komegasstdes.h--02ed008467a3.md)
- [`SpalartAllmarasDES.H`](../../../09-turbulence-transport/files/77/spalartallmarasdes.h--77b942abde84.md)
- [`SpalartAllmarasDDES.H`](../../../09-turbulence-transport/files/1b/spalartallmarasddes.h--1b90e875bc5d.md)
- [`SpalartAllmarasIDDES.H`](../../../09-turbulence-transport/files/2f/spalartallmarasiddes.h--2fa1a386a094.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
