---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1194f6e26799"
title: "OpenFOAM 14 源码解析：janafThermo.H"
summary: "该文件声明或实现 `janafThermo`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/thermo/janaf/janafThermo.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：janafThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/thermo/janaf/janafThermo.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：320 行
- 文件标识：`1194f6e26799`

## 2. 功能说明

该文件声明或实现 `janafThermo`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Enthalpy based thermodynamics package using JANAF tables: \verbatim Cp/R = (((a4*T + a3)*T + a2)*T + a1)*T + a0 ha/R = ((((a4/5*T + a3/4)*T + a2/3)*T + a1/2)*T + a0)*T + a5 \endverbatim Usage \table Property | Description Tlow | Lower temperature limit [K] Thigh | Upper temperature limit [K] Tcommon | Transition temperature from low to high polynomials [K] lowCpCoeffs | Low temperature range heat capacity coefficients highCpCoeffs | High temperature range heat capacity coefficients \endtable Example specification of janafThermo for air: \verbatim thermodynamics { Tlow 100; Thigh 10000; Tcommon 1000; lowCpCoeffs ( 3.5309628 -0.0001236595 -5.0299339e-07 2.4352768e-09 -1.4087954e-12 -1046.9637 2.9674391 ); highCpCoeffs ( 2.9525407 0.0013968838 -4.9262577e-07 7.8600091e-11 -4.6074978e-15 -923.93753 5.8718221 ); } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `janafThermo` | 101 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`scalar.H`](../../../04-core-runtime/files/cb/scalar.h--cb9b81900254.md)
- [`FixedList.H`](../../../04-core-runtime/files/56/fixedlist.h--5633be515ee5.md)
- [`HtoEthermo.H`](../../../08-thermophysical/files/a4/htoethermo.h--a4e08a5299ff.md)
- [`janafThermoI.H`](../../../08-thermophysical/files/70/janafthermoi.h--703986f2b860.md)
- [`janafThermo.C`](../../../08-thermophysical/files/eb/janafthermo.c--eb3e03d9c048.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermos.C](../../../17-other-libraries/files/cb/psiumulticomponentthermos.c--cbf50cf75a91.md)
- [applications/utilities/thermophysical/adiabaticFlameT/adiabaticFlameT.C](../../../03-utilities/files/fd/adiabaticflamet.c--fd27ae0908bd.md)
- [applications/utilities/thermophysical/chemkinToFoam/chemkinReader/chemkinReader.H](../../../03-utilities/files/a6/chemkinreader.h--a64993417c06.md)
- [applications/utilities/thermophysical/equilibriumCO/equilibriumCO.C](../../../03-utilities/files/91/equilibriumco.c--917c36973ee4.md)
- [applications/utilities/thermophysical/equilibriumFlameT/equilibriumFlameT.C](../../../03-utilities/files/33/equilibriumflamet.c--3348ceeb96f0.md)
- [applications/utilities/thermophysical/mixtureAdiabaticFlameT/mixtureAdiabaticFlameT.C](../../../03-utilities/files/16/mixtureadiabaticflamet.c--161d90cf651a.md)
- [src/thermophysicalModels/specie/include/forGases.H](../../../08-thermophysical/files/1a/forgases.h--1ae68ddb3b03.md)
- [src/thermophysicalModels/specie/thermo/janaf/janafThermo.C](../../../08-thermophysical/files/eb/janafthermo.c--eb3e03d9c048.md)
- [src/thermophysicalModels/specie/thermo/janaf/janafThermoI.H](../../../08-thermophysical/files/70/janafthermoi.h--703986f2b860.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
