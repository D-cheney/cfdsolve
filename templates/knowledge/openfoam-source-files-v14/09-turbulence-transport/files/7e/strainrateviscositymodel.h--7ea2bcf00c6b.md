---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-7ea2bcf00c6b"
title: "OpenFOAM 14 源码解析：strainRateViscosityModel.H"
summary: "该文件声明或实现 `strainRateViscosityModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/strainRateViscosityModel/strainRateViscosityModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：strainRateViscosityModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/strainRateViscosityModel/strainRateViscosityModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：150 行
- 文件标识：`7ea2bcf00c6b`

## 2. 功能说明

该文件声明或实现 `strainRateViscosityModel`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：An abstract base class for strain-rate dependent generalised Newtonian viscosity models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `strainRateViscosityModel` | 61 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`generalisedNewtonianViscosityModel.H`](../../../09-turbulence-transport/files/07/generalisednewtonianviscositymodel.h--07e050655036.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/BirdCarreau/BirdCarreau.H](../../../09-turbulence-transport/files/ba/birdcarreau.h--ba8a9550682f.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/Casson/Casson.H](../../../09-turbulence-transport/files/fc/casson.h--fc47c7e6a19b.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/CrossPowerLaw/CrossPowerLaw.H](../../../09-turbulence-transport/files/29/crosspowerlaw.h--292ce5a45079.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/HerschelBulkley/HerschelBulkley.H](../../../09-turbulence-transport/files/18/herschelbulkley.h--18455554d533.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/powerLaw/powerLaw.H](../../../09-turbulence-transport/files/cb/powerlaw.h--cbcb606f01ea.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/strainRateFunction/strainRateFunction.H](../../../09-turbulence-transport/files/7a/strainratefunction.h--7aa142f1b7c0.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/strainRateViscosityModel/strainRateViscosityModel.C](../../../09-turbulence-transport/files/fd/strainrateviscositymodel.c--fd9664778883.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
