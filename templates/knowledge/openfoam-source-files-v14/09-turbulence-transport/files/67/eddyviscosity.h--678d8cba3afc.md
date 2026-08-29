---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-678d8cba3afc"
title: "OpenFOAM 14 源码解析：eddyViscosity.H"
summary: "该文件声明或实现 `eddyViscosity`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/eddyViscosity/eddyViscosity.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：eddyViscosity.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/eddyViscosity/eddyViscosity.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：147 行
- 文件标识：`678d8cba3afc`

## 2. 功能说明

该文件声明或实现 `eddyViscosity`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Eddy viscosity turbulence model base class

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `eddyViscosity` | 54 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`linearViscousStress.H`](../../../09-turbulence-transport/files/38/linearviscousstress.h--38e81cc9f583.md)
- [`eddyViscosity.C`](../../../09-turbulence-transport/files/26/eddyviscosity.c--26bd5983005f.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/kineticTheoryModel/kineticTheoryModel.H](../../../02-solver-modules/files/ac/kinetictheorymodel.h--accedfde16f8.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/phasePressureModel/phasePressureModel.H](../../../02-solver-modules/files/a4/phasepressuremodel.h--a4af1831149f.md)
- [src/atmosphericModels/kEpsilonLopesdaCosta/kEpsilonLopesdaCosta.H](../../../17-other-libraries/files/eb/kepsilonlopesdacosta.h--eb1bcbbb66e8.md)
- [src/MomentumTransportModels/incompressible/RAS/kkLOmega/kkLOmega.H](../../../09-turbulence-transport/files/2a/kklomega.h--2aa769402c95.md)
- [src/MomentumTransportModels/incompressible/RAS/LamBremhorstKE/LamBremhorstKE.H](../../../09-turbulence-transport/files/e6/lambremhorstke.h--e61ef24883a0.md)
- [src/MomentumTransportModels/incompressible/RAS/LienLeschziner/LienLeschziner.H](../../../09-turbulence-transport/files/13/lienleschziner.h--138ee4b09998.md)
- [src/MomentumTransportModels/incompressible/RAS/qZeta/qZeta.H](../../../09-turbulence-transport/files/a5/qzeta.h--a5d2a9eb0990.md)
- [src/MomentumTransportModels/momentumTransportModels/eddyViscosity/eddyViscosity.C](../../../09-turbulence-transport/files/26/eddyviscosity.c--26bd5983005f.md)
- [src/MomentumTransportModels/momentumTransportModels/LES/LESeddyViscosity/LESeddyViscosity.H](../../../09-turbulence-transport/files/8f/leseddyviscosity.h--8f016028d1ef.md)
- [src/MomentumTransportModels/momentumTransportModels/nonlinearEddyViscosity/nonlinearEddyViscosity.H](../../../09-turbulence-transport/files/b5/nonlineareddyviscosity.h--b587cc7f6fd7.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/kEpsilon/kEpsilon.H](../../../09-turbulence-transport/files/7f/kepsilon.h--7f9c956ca83a.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/kOmega/kOmega.H](../../../09-turbulence-transport/files/4e/komega.h--4ed799604423.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/kOmega2006/kOmega2006.H](../../../09-turbulence-transport/files/44/komega2006.h--44f91656c154.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSST/kOmegaSST.H](../../../09-turbulence-transport/files/61/komegasst.h--6149a32f6f70.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/LaunderSharmaKE/LaunderSharmaKE.H](../../../09-turbulence-transport/files/f2/laundersharmake.h--f2c54b49ac55.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/realizableKE/realizableKE.H](../../../09-turbulence-transport/files/36/realizableke.h--36bcc4e8a49c.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/RNGkEpsilon/RNGkEpsilon.H](../../../09-turbulence-transport/files/d9/rngkepsilon.h--d9af376b8d0e.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/SpalartAllmaras/SpalartAllmaras.H](../../../09-turbulence-transport/files/6d/spalartallmaras.h--6d5f960e1e94.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/v2f/v2f.H](../../../09-turbulence-transport/files/c5/v2f.h--c52817545b8a.md)
- [src/MomentumTransportModels/phaseCompressible/LES/SmagorinskyZhang/SmagorinskyZhang.H](../../../09-turbulence-transport/files/2d/smagorinskyzhang.h--2dc26f3ed735.md)
- [src/MomentumTransportModels/phaseCompressible/RAS/mixtureKEpsilon/mixtureKEpsilon.H](../../../09-turbulence-transport/files/c8/mixturekepsilon.h--c89aed461f81.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
