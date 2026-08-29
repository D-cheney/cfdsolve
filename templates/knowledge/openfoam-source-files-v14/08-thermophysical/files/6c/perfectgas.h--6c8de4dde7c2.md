---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6c8de4dde7c2"
title: "OpenFOAM 14 源码解析：perfectGas.H"
summary: "该文件声明或实现 `perfectGas`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/equationOfState/perfectGas/perfectGas.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：perfectGas.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/equationOfState/perfectGas/perfectGas.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：232 行
- 文件标识：`6c8de4dde7c2`

## 2. 功能说明

该文件声明或实现 `perfectGas`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Perfect gas equation of state: \verbatim rho = p/(R*T) \endverbatim Usage The gas constant R used by the perfect gas equation of state is obtained directly from the specie or mixture molecular weight so there is no need to provide an equation of \c equationOfState enry in the \c mixture specification.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `perfectGas` | 63 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`perfectGasI.H`](../../../08-thermophysical/files/96/perfectgasi.h--967d4779d1ac.md)
- [`perfectGas.C`](../../../08-thermophysical/files/a5/perfectgas.c--a56194430aca.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/psiuMulticomponentThermos.C](../../../17-other-libraries/files/cb/psiumulticomponentthermos.c--cbf50cf75a91.md)
- [applications/test/thermoMixture/Test-thermoMixture.C](../../../17-other-libraries/files/59/test-thermomixture.c--59423d9d86d3.md)
- [applications/utilities/thermophysical/adiabaticFlameT/adiabaticFlameT.C](../../../03-utilities/files/fd/adiabaticflamet.c--fd27ae0908bd.md)
- [applications/utilities/thermophysical/chemkinToFoam/chemkinReader/chemkinReader.H](../../../03-utilities/files/a6/chemkinreader.h--a64993417c06.md)
- [applications/utilities/thermophysical/equilibriumCO/equilibriumCO.C](../../../03-utilities/files/91/equilibriumco.c--917c36973ee4.md)
- [applications/utilities/thermophysical/equilibriumFlameT/equilibriumFlameT.C](../../../03-utilities/files/33/equilibriumflamet.c--3348ceeb96f0.md)
- [applications/utilities/thermophysical/mixtureAdiabaticFlameT/mixtureAdiabaticFlameT.C](../../../03-utilities/files/16/mixtureadiabaticflamet.c--161d90cf651a.md)
- [src/thermophysicalModels/specie/equationOfState/perfectGas/perfectGas.C](../../../08-thermophysical/files/a5/perfectgas.c--a56194430aca.md)
- [src/thermophysicalModels/specie/equationOfState/perfectGas/perfectGasI.H](../../../08-thermophysical/files/96/perfectgasi.h--967d4779d1ac.md)
- [src/thermophysicalModels/specie/include/forGases.H](../../../08-thermophysical/files/1a/forgases.h--1ae68ddb3b03.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
