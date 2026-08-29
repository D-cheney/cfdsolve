---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-dc6a092579ee"
title: "OpenFOAM 14 源码解析：Explicit.H"
summary: "该文件声明或实现 `Explicit`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/submodels/MPPIC/PackingModels/Explicit/Explicit.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：Explicit.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/submodels/MPPIC/PackingModels/Explicit/Explicit.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：147 行
- 文件标识：`dc6a092579ee`

## 2. 功能说明

该文件声明或实现 `Explicit`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Explicit model for applying an inter-particle stress to the particles. The inter-particle stress is calculated using current particle locations. This force is then applied only to the particles that are moving towards regions of close pack. The resulting velocity change is limited using an abstracted correction velocity limiter. Reference: \verbatim "An Incompressible Three-Dimensional Multiphase Particle-in-Cell Model for Dense Particle Flows" D Snider Journal of Computational Physics Volume 170, Issue 2, Pages 523-549, July 2001 \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Explicit` | 70 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`PackingModel.H`](../../../11-lagrangian/files/ce/packingmodel.h--cefab2b4c806.md)
- [`Explicit.C`](../../../11-lagrangian/files/6a/explicit.c--6af6296e2243.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/parcels/include/makeMPPICParcelPackingModels.H](../../../11-lagrangian/files/e6/makemppicparcelpackingmodels.h--e69387ae97f2.md)
- [src/lagrangian/parcel/submodels/MPPIC/PackingModels/Explicit/Explicit.C](../../../11-lagrangian/files/6a/explicit.c--6af6296e2243.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
