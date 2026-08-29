---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f604e7334918"
title: "OpenFOAM 14 源码解析：fvDOM.H"
summary: "该文件声明或实现 `fvDOM`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/radiationModels/radiationModels/fvDOM/fvDOM.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：fvDOM.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/radiationModels/radiationModels/fvDOM/fvDOM.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：263 行
- 文件标识：`f604e7334918`

## 2. 功能说明

该文件声明或实现 `fvDOM`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Finite Volume Discrete Ordinates Method. Solves the RTE equation for n directions in a participating media, not including scatter. In 1-D the ray directions are bound to one of the X, Y or Z directions. The total number of solid angles is 2. nPhi and nTheta are ignored. In 2-D the ray directions are within one of the X-Y, X-Z or Y-Z planes. The total number of solid angles is 4*nPhi. nTheta is ignored. In 3D the rays span all directions. The total number of solid angles is 4*nPhi*nTheta. Usage \verbatim fvDOM { nPhi 4; // azimuthal angles in PI/2 on X-Y (from Y to X) nTheta 0; // polar angles in PI (from Z to X-Y plane) convergence 1e-3; // convergence criteria for radiation iteration maxIter 4; // maximum number of iterations } solverFreq 1; // Number of flow iterations per radiation iteration \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvDOM` | 80 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`radiativeIntensityRay.H`](../../../17-other-libraries/files/fb/radiativeintensityray.h--fbeaab71086c.md)
- [`radiationModel.H`](../../../17-other-libraries/files/d3/radiationmodel.h--d3ba6e978f76.md)
- [`fvMatrices.H`](../../../05-finite-volume/files/4d/fvmatrices.h--4d784c209b6a.md)
- [`fvDOMI.H`](../../../17-other-libraries/files/57/fvdomi.h--57d51bb3ac86.md)

## 8. 直接上层引用

- [src/radiationModels/derivedFvPatchFields/greyDiffusiveRadiation/greyDiffusiveRadiationMixedFvPatchScalarField.C](../../../17-other-libraries/files/03/greydiffusiveradiationmixedfvpatchscalarfield.c--037ef86c27c9.md)
- [src/radiationModels/derivedFvPatchFields/wideBandDiffusiveRadiation/wideBandDiffusiveRadiationMixedFvPatchScalarField.C](../../../17-other-libraries/files/80/widebanddiffusiveradiationmixedfvpatchscalarfield.c--80cc3168940f.md)
- [src/radiationModels/radiationModels/fvDOM/fvDOM.C](../../../17-other-libraries/files/96/fvdom.c--96aad1ae0959.md)
- [src/radiationModels/radiationModels/fvDOM/radiativeIntensityRay/radiativeIntensityRay.C](../../../17-other-libraries/files/a8/radiativeintensityray.c--a8f9cb6c3bd6.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
