---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-545f3a607faf"
title: "OpenFOAM 14 源码解析：solidThermo.H"
summary: "该文件声明或实现 `solidThermo`、`implementation`、`composite`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/solidThermo/solidThermo/solidThermo.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：solidThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/solidThermo/solidThermo/solidThermo.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：239 行
- 文件标识：`545f3a607faf`

## 2. 功能说明

该文件声明或实现 `solidThermo`、`implementation`、`composite`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Base-class for solid thermodynamic properties.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `solidThermo` | 61 |
| `implementation` | 72 |
| `composite` | 75 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`SolidThermo.H`](../../../08-thermophysical/files/88/solidthermo.h--880c5de2b7b5.md)
- [`pureThermo.H`](../../../08-thermophysical/files/b9/purethermo.h--b9bdef8aeb56.md)
- [`rhoThermo.H`](../../../08-thermophysical/files/05/rhothermo.h--057c1d9e24d5.md)
- [`uniformGeometricFields.H`](../../../05-finite-volume/files/a5/uniformgeometricfields.h--a50858295889.md)
- [`fvScalarMatrix.H`](../../../05-finite-volume/files/2e/fvscalarmatrix.h--2e8428896826.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/phaseModels.C](../../../02-solver-modules/files/a1/phasemodels.c--a128ef34cd1e.md)
- [src/fvModels/general/solidThermalEquilibrium/solidThermalEquilibrium.H](../../../12-boundaries-sources/files/98/solidthermalequilibrium.h--98e7c3da9cbc.md)
- [src/thermophysicalModels/solidThermo/constSolidThermo/constSolidThermo.H](../../../08-thermophysical/files/cc/constsolidthermo.h--ccd222e08596.md)
- [src/thermophysicalModels/solidThermo/solidThermo/solidThermo.C](../../../08-thermophysical/files/31/solidthermo.c--31e4d7d13d51.md)
- [src/thermophysicalModels/solidThermo/solidThermo/solidThermos.C](../../../08-thermophysical/files/d4/solidthermos.c--d401170a8b6f.md)
- [src/thermophysicalModels/solidThermo/solidZonalThermo/solidZonalThermo.H](../../../08-thermophysical/files/af/solidzonalthermo.h--afcc1d3d7252.md)
- [src/ThermophysicalTransportModels/phaseSolid/phaseSolidThermophysicalTransportModel/phaseSolidThermophysicalTransportModel.H](../../../09-turbulence-transport/files/b9/phasesolidthermophysicaltransportmodel.h--b9ffcb1c9c30.md)
- [src/ThermophysicalTransportModels/solid/solidThermophysicalTransportModel/solidThermophysicalTransportModel.H](../../../09-turbulence-transport/files/23/solidthermophysicaltransportmodel.h--231555985b91.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
