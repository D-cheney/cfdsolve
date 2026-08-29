---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-711c3bc93613"
title: "OpenFOAM 14 源码解析：phaseIncompressibleMomentumTransportModel.H"
summary: "该文件声明或实现 `phaseIncompressibleMomentumTransportModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：phaseIncompressibleMomentumTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：190 行
- 文件标识：`711c3bc93613`

## 2. 功能说明

该文件声明或实现 `phaseIncompressibleMomentumTransportModel`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Templated abstract base class for multiphase incompressible momentum transport models.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `phaseIncompressibleMomentumTransportModel` | 55 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`incompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/d6/incompressiblemomentumtransportmodel.h--d66b1dda583c.md)
- [`phaseIncompressibleMomentumTransportModelTemplates.C`](../../../09-turbulence-transport/files/6c/phaseincompressiblemomentumtransportmodeltemplates.c--6cd20460d58a.md)

## 8. 直接上层引用

- [applications/modules/incompressibleDenseParticleFluid/incompressibleDenseParticleFluid.H](../../../02-solver-modules/files/6e/incompressibledenseparticlefluid.h--6ec93149946f.md)
- [applications/modules/incompressibleVoF/incompressibleInterPhaseTransportModel/incompressibleInterPhaseTransportModel.H](../../../02-solver-modules/files/2b/incompressibleinterphasetransportmodel.h--2bf4a52a4cd1.md)
- [src/functionObjects/forces/forcesBase/forcesBase.C](../../../14-postprocessing/files/a2/forcesbase.c--a21561ee004f.md)
- [src/functionObjects/forces/sectionalForcesBase/sectionalForcesBase.C](../../../14-postprocessing/files/ef/sectionalforcesbase.c--ef6d57e454d5.md)
- [src/MomentumTransportModels/phaseIncompressible/makePhaseIncompressibleMomentumTransportModel.H](../../../09-turbulence-transport/files/6b/makephaseincompressiblemomentumtransportmodel.h--6be62506d9cc.md)
- [src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModel.C](../../../09-turbulence-transport/files/e3/phaseincompressiblemomentumtransportmodel.c--e35b4d894191.md)
- [src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModels.H](../../../09-turbulence-transport/files/ce/phaseincompressiblemomentumtransportmodels.h--cecdff45f086.md)

## 9. 运行时机制

`declareRunTimeNewSelectionTable`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
