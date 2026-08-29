---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-38eaf2c57e07"
title: "OpenFOAM 14 源码解析：JohnsonJacksonParticleSlipFvPatchVectorField.H"
summary: "该文件声明或实现 `JohnsonJacksonParticleSlipFvPatchVectorField`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/momentumTransportModels/derivedFvPatchFields/JohnsonJacksonParticleSlip/JohnsonJacksonParticleSlipFvPatchVectorField.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：JohnsonJacksonParticleSlipFvPatchVectorField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/momentumTransportModels/derivedFvPatchFields/JohnsonJacksonParticleSlip/JohnsonJacksonParticleSlipFvPatchVectorField.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：156 行
- 文件标识：`38eaf2c57e07`

## 2. 功能说明

该文件声明或实现 `JohnsonJacksonParticleSlipFvPatchVectorField`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Partial slip boundary condition for the particulate velocity. References: \verbatim Reuge, N., Cadoret, L., Coufort-Saudejaud, C., Pannala, S., Syamlal, M., & Caussat, B. (2008). Multifluid Eulerian modeling of dense gas–solids fluidised bed hydrodynamics: influence of the dissipation parameters. Chemical Engineering Science, 63(22), 5540-5551. \endverbatim \verbatim Johnson, P. C., & Jackson, R. (1987). Frictional–collisional constitutive relations for granular materials, with application to plane shearing. Journal of fluid Mechanics, 176, 67-93. \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `JohnsonJacksonParticleSlipFvPatchVectorField` | 70 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`partialSlipFvPatchFields.H`](../../../05-finite-volume/files/dc/partialslipfvpatchfields.h--dc0e0fe01ca3.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/momentumTransportModels/derivedFvPatchFields/JohnsonJacksonParticleSlip/JohnsonJacksonParticleSlipFvPatchVectorField.C](../../../02-solver-modules/files/09/johnsonjacksonparticleslipfvpatchvectorfield.c--099b379ec8ce.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
