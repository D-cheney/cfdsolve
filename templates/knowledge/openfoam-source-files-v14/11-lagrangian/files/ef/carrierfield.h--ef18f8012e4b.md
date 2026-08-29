---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ef18f8012e4b"
title: "OpenFOAM 14 源码解析：CarrierField.H"
summary: "该文件声明或实现 `CarrierFieldBase`、`Functor`、`Function`、`CarrierFieldGradBase`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/clouds/carried/CarrierField.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：CarrierField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/clouds/carried/CarrierField.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：244 行
- 文件标识：`ef18f8012e4b`

## 2. 功能说明

该文件声明或实现 `CarrierFieldBase`、`Functor`、`Function`、`CarrierFieldGradBase`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：A field interpolated from the carrier to the cloud. Uses CloudDerivedField to provide flexible access and caching.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `CarrierFieldBase` | 59 |
| `Functor` | 68 |
| `Function` | 71 |
| `CarrierFieldGradBase` | 148 |
| `CarrierField` | 209 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`CloudDerivedField.H`](../../../11-lagrangian/files/dc/cloudderivedfield.h--dc71477214ea.md)
- [`interpolation.H`](../../../05-finite-volume/files/81/interpolation.h--8143f5455db1.md)
- [`CarrierField.C`](../../../11-lagrangian/files/07/carrierfield.c--072b9b4d5f05.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/clouds/carried/carriedTemplates.C](../../../11-lagrangian/files/bd/carriedtemplates.c--bdd45e8a7dbf.md)
- [src/Lagrangian/cloud/clouds/carried/CarrierField.C](../../../11-lagrangian/files/07/carrierfield.c--072b9b4d5f05.md)
- [src/Lagrangian/cloud/LagrangianModels/collisionPhaseTransfer/collisionPhaseTransfer.H](../../../11-lagrangian/files/af/collisionphasetransfer.h--afd3602dc327.md)
- [src/Lagrangian/cloud/LagrangianModels/turbulentDispersion/turbulentDispersion.H](../../../11-lagrangian/files/d5/turbulentdispersion.h--d5060b9bce77.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
