---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-02cd93f8c1d0"
title: "OpenFOAM 14 源码解析：atmosphericBoundaryLayer.H"
summary: "该文件实现 `atmosphericBoundaryLayer` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/atmosphericModels/atmosphericBoundaryLayer/atmosphericBoundaryLayer.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：atmosphericBoundaryLayer.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/atmosphericModels/atmosphericBoundaryLayer/atmosphericBoundaryLayer.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：287 行
- 文件标识：`02cd93f8c1d0`

## 2. 功能说明

该文件实现 `atmosphericBoundaryLayer` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：This class provides functions to evaluate the velocity and turbulence distributions appropriate for atmospheric boundary layers (ABL). The profile is derived from the friction velocity, flow direction and "vertical" direction: \f[ U = \frac{U^*}{\kappa} ln\left(\frac{z - z_g + z_0}{z_0}\right) \f] \f[ k = \frac{(U^*)^2}{\sqrt{C_mu}} \f] \f[ \epsilon = \frac{(U^*)^3}{\kappa(z - z_g + z_0)} \f] where \vartable U^* | Friction velocity \kappa | von Karman's constant C_mu | Turbulence viscosity coefficient z | Vertical coordinate z_0 | Surface roughness height [m] z_g | Minimum z-coordinate [m] \endvartable and \f[ U^* = \kappa\frac{U_{ref}}{ln\left(\frac{Z_{ref} + z_0}{z_0}\right)} \f] where \vartable U_{ref} | Reference velocity at \&#36;Z_{ref}\&#36; [m/s] Z_{ref} | Reference height [m] \endvartable The specification of the atmospheric boundary layer is centralised in the constant/atmosphericBou

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `atmosphericBoundaryLayer` | 142 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `kappa` | 229 |
| `Cmu` | 235 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`primitiveFields.H`](../../../04-core-runtime/files/02/primitivefields.h--022c36742947.md)
- [`Function2.H`](../../../04-core-runtime/files/11/function2.h--11115076f69a.md)

## 8. 直接上层引用

- [applications/utilities/preProcessing/setAtmBoundaryLayer/setAtmBoundaryLayer.C](../../../03-utilities/files/02/setatmboundarylayer.c--02d2d8cdb906.md)
- [src/atmosphericModels/atmosphericBoundaryLayer/atmosphericBoundaryLayer.C](../../../17-other-libraries/files/76/atmosphericboundarylayer.c--7655152047d7.md)
- [src/atmosphericModels/derivedFvPatchFields/atmosphericBoundaryLayerTurbulentEpsilon/atmosphericBoundaryLayerTurbulentEpsilonFvPatchScalarField.C](../../../17-other-libraries/files/0f/atmosphericboundarylayerturbulentepsilonfvpatchscalarfield.c--0f07e068188c.md)
- [src/atmosphericModels/derivedFvPatchFields/atmosphericBoundaryLayerTurbulentKineticEnergy/atmosphericBoundaryLayerTurbulentKineticEnergyFvPatchScalarField.C](../../../17-other-libraries/files/07/atmosphericboundarylayerturbulentkineticenergyfvpatchscalarfield.c--07f207a25536.md)
- [src/atmosphericModels/derivedFvPatchFields/atmosphericBoundaryLayerVelocity/atmosphericBoundaryLayerVelocityFvPatchVectorField.C](../../../17-other-libraries/files/25/atmosphericboundarylayervelocityfvpatchvectorfield.c--2580752db0ad.md)
- [src/atmosphericModels/derivedFvPatchFields/nutAtmosphericBoundaryLayerWallFunction/nutAtmosphericBoundaryLayerWallFunctionFvPatchScalarField.C](../../../17-other-libraries/files/1f/nutatmosphericboundarylayerwallfunctionfvpatchscalarfield.c--1ffa61071265.md)
- [src/atmosphericModels/DimensionedFieldFunctions/AtmosphericBoundaryLayerTurbulentEpsilon/AtmosphericBoundaryLayerTurbulentEpsilon_DimensionedFieldFunction.C](../../../17-other-libraries/files/98/atmosphericboundarylayerturbulentepsilon_dimensionedfieldfunction.c--982906259050.md)
- [src/atmosphericModels/DimensionedFieldFunctions/AtmosphericBoundaryLayerTurbulentKineticEnergy/AtmosphericBoundaryLayerTurbulentKineticEnergy_DimensionedFieldFunction.C](../../../17-other-libraries/files/5f/atmosphericboundarylayerturbulentkineticenergy_dimensionedfieldfunction.--5fbf427aa580.md)
- [src/atmosphericModels/DimensionedFieldFunctions/AtmosphericBoundaryLayerVelocity/AtmosphericBoundaryLayerVelocity_DimensionedFieldFunction.C](../../../17-other-libraries/files/99/atmosphericboundarylayervelocity_dimensionedfieldfunction.c--9945c4e6f5e6.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
