---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0e8501be114b"
title: "OpenFOAM 14 源码解析：LagrangianmSp.C"
summary: "该文件实现 `LagrangianmSp` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/Lagrangian/Lagrangian/Lagrangianm/LagrangianmSp.C"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：LagrangianmSp.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/Lagrangian/Lagrangian/Lagrangianm/LagrangianmSp.C`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：149 行
- 文件标识：`0e8501be114b`

## 2. 功能说明

该文件实现 `LagrangianmSp` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `PrimitiveField` | 61 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::Lagrangianm::Sp` | 39 |
| `Foam::Lagrangianm::explicitSp0` | 72 |
| `Foam::Lagrangianm::implicitDeltaTSp` | 127 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`LagrangianmSp.H`](../../../11-lagrangian/files/71/lagrangianmsp.h--71ddc2278058.md)
- [`LagrangianSpScheme.H`](../../../11-lagrangian/files/d8/lagrangianspscheme.h--d886908d81e1.md)
- [`LagrangianMesh.H`](../../../11-lagrangian/files/f1/lagrangianmesh.h--f1f1a7d6348f.md)
- [`LagrangianSubFields.H`](../../../11-lagrangian/files/be/lagrangiansubfields.h--be7d6ffac93f.md)
- [`Explicit_LagrangianSpScheme.H`](../../../11-lagrangian/files/65/explicit_lagrangianspscheme.h--65432935d8d3.md)

## 8. 直接上层引用

- [src/Lagrangian/Lagrangian/Lagrangian/Lagrangianm/LagrangianmSp.H](../../../11-lagrangian/files/71/lagrangianmsp.h--71ddc2278058.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
