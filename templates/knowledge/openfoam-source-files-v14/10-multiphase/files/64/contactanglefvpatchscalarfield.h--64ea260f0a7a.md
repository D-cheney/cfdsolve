---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-64ea260f0a7a"
title: "OpenFOAM 14 源码解析：contactAngleFvPatchScalarField.H"
summary: "该文件声明或实现 `contactAngleFvPatchScalarField`，属于“多相与界面”模块。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/interfaceProperties/contactAngle/contactAngleFvPatchScalarField.H"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：contactAngleFvPatchScalarField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/interfaceProperties/contactAngle/contactAngleFvPatchScalarField.H`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：211 行
- 文件标识：`64ea260f0a7a`

## 2. 功能说明

该文件声明或实现 `contactAngleFvPatchScalarField`，属于“多相与界面”模块。

中文导航角色：两相流与界面模型。

上游说明：General alpha contact angle boundary condition. The essential entry "limit" controls the gradient of alpha1 on the wall: - none - Calculate the gradient from the contact-angle without limiter - gradient - Limit the wall-gradient such that alpha1 remains bounded on the wall - alpha - Bound the calculated alpha1 on the wall - zeroGradient - Set the gradient of alpha1 to 0 on the wall, i.e. reproduce previous behaviour, the pressure BCs can be left as before. Note that if any of the first three options are used the boundary condition on \c p_rgh must set to guarantee that the flux is corrected to be zero at the wall. Usage \table Property | Description | Required | Default value limit | Limiting option | yes | contantAngle | Contact angle model settings | no | none \endtable Example of the boundary condition specification for a constant angle: \verbatim <patchName> { type contactAngle; limi

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `contactAngleFvPatchScalarField` | 104 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`fixedGradientFvPatchFields.H`](../../../05-finite-volume/files/6a/fixedgradientfvpatchfields.h--6a746d799068.md)
- [`contactAngleModel.H`](../../../10-multiphase/files/91/contactanglemodel.h--9107890df127.md)

## 8. 直接上层引用

- [src/twoPhaseModels/interfaceProperties/contactAngle/contactAngleFvPatchScalarField.C](../../../10-multiphase/files/1f/contactanglefvpatchscalarfield.c--1f82a4f42604.md)
- [src/twoPhaseModels/interfaceProperties/interfaceProperties.C](../../../10-multiphase/files/86/interfaceproperties.c--86da3710a725.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
