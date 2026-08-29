---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1df2d957dd2e"
title: "OpenFOAM 14 源码解析：constantFluxCarrierTransfer.H"
summary: "该文件声明或实现 `constantFluxCarrierTransfer`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/LagrangianModels/constantFluxCarrierTransfer/constantFluxCarrierTransfer.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：constantFluxCarrierTransfer.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/LagrangianModels/constantFluxCarrierTransfer/constantFluxCarrierTransfer.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：201 行
- 文件标识：`1df2d957dd2e`

## 2. 功能说明

该文件声明或实现 `constantFluxCarrierTransfer`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Model to represent mass transfer into the carrier phase with a constant surface volume or mass flux. This model provides a crude approximation of phase change which neglects any thermal effects. It can be used by clouds and in solvers that do not feature any thermodynamic modelling. Usage Example specification: \verbatim <LagrangianModelName> { type constantFluxCarrierTransfer; volumeFlux 1 [ml/cm^2/s]; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `constantFluxCarrierTransfer` | 71 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`cloudLagrangianModel.H`](../../../11-lagrangian/files/2a/cloudlagrangianmodel.h--2a59a45d077b.md)
- [`LagrangianSource.H`](../../../11-lagrangian/files/50/lagrangiansource.h--50fcdc59e6b0.md)
- [`sharedRegIOobject.H`](../../../11-lagrangian/files/58/sharedregioobject.h--588892765480.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/LagrangianModels/constantFluxCarrierTransfer/constantFluxCarrierTransfer.C](../../../11-lagrangian/files/89/constantfluxcarriertransfer.c--89681227f93c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
