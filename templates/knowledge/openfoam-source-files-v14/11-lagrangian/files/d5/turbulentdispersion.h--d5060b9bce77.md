---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d5060b9bce77"
title: "OpenFOAM 14 源码解析：turbulentDispersion.H"
summary: "该文件声明或实现 `turbulentDispersion`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/LagrangianModels/turbulentDispersion/turbulentDispersion.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：turbulentDispersion.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/LagrangianModels/turbulentDispersion/turbulentDispersion.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：215 行
- 文件标识：`d5060b9bce77`

## 2. 功能说明

该文件声明或实现 `turbulentDispersion`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Model for turbulent dispersion. This model creates a random turbulent velocity fluctuation based on the carrier's turbulent properties. It then uses the drag model to construct a corresponding force which it applies for a duration equal to the carrier's turbulent time scale. Usage Example specification: \verbatim <LagrangianModelName> { type turbulentDispersion; Cmu 0.09; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `turbulentDispersion` | 73 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`cloudLagrangianModel.H`](../../../11-lagrangian/files/2a/cloudlagrangianmodel.h--2a59a45d077b.md)
- [`drag.H`](../../../11-lagrangian/files/1c/drag.h--1cb54962abcc.md)
- [`momentumTransportModel.H`](../../../09-turbulence-transport/files/36/momentumtransportmodel.h--36c367269e58.md)
- [`restartableRandomGenerator.H`](../../../04-core-runtime/files/30/restartablerandomgenerator.h--304292ca6e1f.md)
- [`CarrierField.H`](../../../11-lagrangian/files/ef/carrierfield.h--ef18f8012e4b.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/LagrangianModels/turbulentDispersion/turbulentDispersion.C](../../../11-lagrangian/files/5c/turbulentdispersion.c--5c12d4d38976.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
