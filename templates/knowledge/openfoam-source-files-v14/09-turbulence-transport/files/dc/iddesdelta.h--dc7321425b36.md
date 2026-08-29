---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-dc7321425b36"
title: "OpenFOAM 14 源码解析：IDDESDelta.H"
summary: "该文件声明或实现 `IDDESDelta`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/IDDESDelta/IDDESDelta.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：IDDESDelta.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/IDDESDelta/IDDESDelta.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：133 行
- 文件标识：`dc7321425b36`

## 2. 功能说明

该文件声明或实现 `IDDESDelta`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：IDDESDelta used by the IDDES (improved low Re Spalart-Allmaras DES model) The min and max delta are calculated using the double distance of the min or max from the face centre to the cell centre.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `IDDESDelta` | 58 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`maxDeltaxyz.H`](../../../09-turbulence-transport/files/26/maxdeltaxyz.h--26683a3a34b3.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/IDDESDelta/IDDESDelta.C](../../../09-turbulence-transport/files/f5/iddesdelta.c--f515dd353249.md)
- [src/MomentumTransportModels/momentumTransportModels/LES/SpalartAllmarasIDDES/SpalartAllmarasIDDES.H](../../../09-turbulence-transport/files/2f/spalartallmarasiddes.h--2fa1a386a094.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
