---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-64d522417f9e"
title: "OpenFOAM 14 源码解析：alphaContactAngleFvPatchScalarField.H"
summary: "该文件声明或实现 `alphaContactAngleFvPatchScalarField`、`contactAngleProperties`，属于“多相与界面”模块。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/multiphaseModels/multiphaseProperties/alphaContactAngle/alphaContactAngleFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：alphaContactAngleFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/multiphaseModels/multiphaseProperties/alphaContactAngle/alphaContactAngleFvPatchScalarField.H`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：278 行
- 文件标识：`64d522417f9e`

## 2. 功能说明

该文件声明或实现 `alphaContactAngleFvPatchScalarField`、`contactAngleProperties`，属于“多相与界面”模块。

中文导航角色：欧拉多相与相间交换模型。

上游说明：Contact-angle boundary condition for multi-phase interface-capturing simulations. Sets of coefficients are given for the contact angle with each other phase. These coefficients can specify either a constant or a dynamic contact angle. Usage \table Property | Description | Required | Default value theta0 | Equilibrium contact angle | yes | uTheta | Velocity scale | no | none thetaA | Limiting advancing contact angle | if uTheta | none thetaR | Limiting receding contact angle | if uTheta | none \endtable Example of the boundary condition specification: \verbatim <patchName> { type alphaContactAngle; contactAngleProperties { // Constant contact angle with air air { theta0 90; } // Dynamic contact angle with water oil { theta0 70; uTheta 1; thetaA 100; thetaR 50; } } value uniform 0; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `alphaContactAngleFvPatchScalarField` | 94 |
| `contactAngleProperties` | 100 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`zeroGradientFvPatchFields.H`](../../../05-finite-volume/files/9a/zerogradientfvpatchfields.h--9a96ee93ac86.md)

## 8. 直接上层引用

- [src/multiphaseModels/multiphaseProperties/alphaContactAngle/alphaContactAngleFvPatchScalarField.C](../../../10-multiphase/files/2d/alphacontactanglefvpatchscalarfield.c--2d8245e145ad.md)
- [src/multiphaseModels/multiphaseProperties/correctContactAngle/correctContactAngle.H](../../../10-multiphase/files/88/correctcontactangle.h--885bf81b0021.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

核对相守恒、相间源项成对符号和耦合迭代。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
