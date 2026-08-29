---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-820dd82da920"
title: "OpenFOAM 14 源码解析：nutkWallFunctionFvPatchScalarField.H"
summary: "该文件声明或实现 `nutkWallFunctionFvPatchScalarField`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutkWallFunction/nutkWallFunctionFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：nutkWallFunctionFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutkWallFunction/nutkWallFunctionFvPatchScalarField.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：155 行
- 文件标识：`820dd82da920`

## 2. 功能说明

该文件声明或实现 `nutkWallFunctionFvPatchScalarField`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Turbulent viscosity wall-function boundary condition for high Reynolds number flows based on near-wall turbulence kinetic energy. Usage Example of the boundary condition specification: \verbatim <patchName> { type nutkWallFunction; value uniform 0; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `nutkWallFunctionFvPatchScalarField` | 68 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`nutWallFunctionFvPatchScalarField.H`](../../../09-turbulence-transport/files/6c/nutwallfunctionfvpatchscalarfield.h--6c93d9fd221f.md)

## 8. 直接上层引用

- [src/atmosphericModels/derivedFvPatchFields/nutAtmosphericBoundaryLayerWallFunction/nutAtmosphericBoundaryLayerWallFunctionFvPatchScalarField.H](../../../17-other-libraries/files/82/nutatmosphericboundarylayerwallfunctionfvpatchscalarfield.h--829fd28c3d38.md)
- [src/MomentumTransportModels/incompressible/RAS/ShihQuadraticKE/ShihQuadraticKE.C](../../../09-turbulence-transport/files/0f/shihquadraticke.c--0fcdff66a9d8.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutkRoughWallFunction/nutkRoughWallFunctionFvPatchScalarField.H](../../../09-turbulence-transport/files/a8/nutkroughwallfunctionfvpatchscalarfield.h--a8e879237927.md)
- [src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutkWallFunction/nutkWallFunctionFvPatchScalarField.C](../../../09-turbulence-transport/files/dc/nutkwallfunctionfvpatchscalarfield.c--dc9211f8231b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
