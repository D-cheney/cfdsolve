---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0fc05ef78cea"
title: "OpenFOAM 14 源码解析：solidification.H"
summary: "该文件声明或实现 `solidification`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/porosityModel/solidification/solidification.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：solidification.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/porosityModel/solidification/solidification.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：240 行
- 文件标识：`0fc05ef78cea`

## 2. 功能说明

该文件声明或实现 `solidification`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Simple solidification porosity model This is a simple approximation to solidification where the solid phase is represented as a porous blockage with the drag-coefficient evaluated from \f[ S = - \alpha \rho D(T) U \f] where \vartable \alpha | Optional phase-fraction of solidifying phase D(T) | User-defined drag-coefficient as function of temperature \endvartable Note that the latent heat of solidification is not included and the temperature is unchanged by the modelled change of phase. Example of the solidification model specification: \verbatim type solidification; solidification { // Solidify between 330K and 330.5K D table ( (330.0 10000) // Solid below 330K (330.5 0) // Liquid above 330.5K ); // Optional phase-fraction of solidifying phase alpha alpha.liquid; // Solidification porosity is isotropic // use the global coordinate system coordinateSystem { type cartesian; origin (0 0 0);

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `solidification` | 106 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`porosityModel.H`](../../../05-finite-volume/files/f3/porositymodel.h--f38befd5a70d.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)
- [`solidificationTemplates.C`](../../../05-finite-volume/files/fc/solidificationtemplates.c--fc5c31d72630.md)

## 8. 直接上层引用

- [src/finiteVolume/cfdTools/general/porosityModel/solidification/solidification.C](../../../05-finite-volume/files/f4/solidification.c--f40110bb288f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
