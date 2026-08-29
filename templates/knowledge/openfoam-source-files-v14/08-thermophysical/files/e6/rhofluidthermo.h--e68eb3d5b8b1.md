---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e68eb3d5b8b1"
title: "OpenFOAM 14 源码解析：rhoFluidThermo.H"
summary: "该文件声明或实现 `rhoFluidThermo`、`composite`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/basic/rhoFluidThermo/rhoFluidThermo.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：rhoFluidThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/basic/rhoFluidThermo/rhoFluidThermo.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：185 行
- 文件标识：`e68eb3d5b8b1`

## 2. 功能说明

该文件声明或实现 `rhoFluidThermo`、`composite`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Base-class for fluid thermodynamic properties based on density.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rhoFluidThermo` | 60 |
| `composite` | 71 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`RhoFluidThermo.H`](../../../08-thermophysical/files/26/rhofluidthermo.h--2685548fc62f.md)
- [`pureThermo.H`](../../../08-thermophysical/files/b9/purethermo.h--b9bdef8aeb56.md)
- [`rhoThermo.H`](../../../08-thermophysical/files/05/rhothermo.h--057c1d9e24d5.md)
- [`fluidThermo.H`](../../../08-thermophysical/files/9e/fluidthermo.h--9e58ccc4fa8c.md)

## 8. 直接上层引用

- [applications/modules/compressibleMultiphaseVoF/compressibleMultiphaseVoFMixture/compressibleVoFphase/compressibleVoFphase.H](../../../02-solver-modules/files/41/compressiblevofphase.h--414508cad223.md)
- [applications/modules/compressibleVoF/compressibleTwoPhaseVoFMixture/compressibleTwoPhaseVoFMixture.H](../../../02-solver-modules/files/6e/compressibletwophasevofmixture.h--6ecbddd1b745.md)
- [applications/modules/isothermalFilm/isothermalFilm.H](../../../02-solver-modules/files/a7/isothermalfilm.h--a76e491fa6a0.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModel/phaseModel.H](../../../02-solver-modules/files/6a/phasemodel.h--6a4c6bcda31f.md)
- [applications/modules/multiphaseEuler/phaseSystem/phaseModels/phaseModels.C](../../../02-solver-modules/files/a1/phasemodels.c--a128ef34cd1e.md)
- [applications/modules/XiFluid/bRhoMulticomponentThermo/bRhoMulticomponentThermo.H](../../../02-solver-modules/files/da/brhomulticomponentthermo.h--dae91176faf1.md)
- [applications/modules/XiFluid/uRhoMulticomponentThermo/uRhoMulticomponentThermo.H](../../../02-solver-modules/files/74/urhomulticomponentthermo.h--7462c0884b23.md)
- [src/thermophysicalModels/basic/liquidThermo/liquidThermo.H](../../../08-thermophysical/files/f7/liquidthermo.h--f74ba456bb4a.md)
- [src/thermophysicalModels/basic/rhoFluidThermo/rhoFluidThermo.C](../../../08-thermophysical/files/c1/rhofluidthermo.c--c1b8d12c02e0.md)
- [src/thermophysicalModels/basic/rhoFluidThermo/rhoFluidThermos.C](../../../08-thermophysical/files/48/rhofluidthermos.c--4854ddff0372.md)
- [src/thermophysicalModels/multicomponentThermo/rhoFluidMulticomponentThermo/rhoFluidMulticomponentThermo.H](../../../08-thermophysical/files/48/rhofluidmulticomponentthermo.h--48a46ee83818.md)
- [src/twoPhaseModels/compressibleTwoPhases/compressibleTwoPhases.H](../../../10-multiphase/files/d0/compressibletwophases.h--d0db127aeeee.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
