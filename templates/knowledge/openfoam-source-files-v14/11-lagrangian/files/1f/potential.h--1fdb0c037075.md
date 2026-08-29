---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1fdb0c037075"
title: "OpenFOAM 14 源码解析：potential.H"
summary: "该文件声明或实现 `potential`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/molecularDynamics/potential/potential/potential.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：potential.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/molecularDynamics/potential/potential/potential.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：161 行
- 文件标识：`1fdb0c037075`

## 2. 功能说明

该文件声明或实现 `potential`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：SourceFiles potentialI.H potential.C

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `potential` | 59 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`polyMesh.H`](../../../04-core-runtime/files/f8/polymesh.h--f8f0e21a1b7d.md)
- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`pairPotentialList.H`](../../../11-lagrangian/files/ef/pairpotentiallist.h--efaa16889115.md)
- [`electrostaticPotential.H`](../../../11-lagrangian/files/4a/electrostaticpotential.h--4a34650f4f4d.md)
- [`tetherPotentialList.H`](../../../11-lagrangian/files/39/tetherpotentiallist.h--390fc303d8e1.md)
- [`potentialI.H`](../../../11-lagrangian/files/c5/potentiali.h--c55dd46eb203.md)

## 8. 直接上层引用

- [src/lagrangian/molecularDynamics/moleculeCloud/moleculeCloud.H](../../../11-lagrangian/files/45/moleculecloud.h--4594a6062d01.md)
- [src/lagrangian/molecularDynamics/potential/potential/potential.C](../../../11-lagrangian/files/d6/potential.c--d6feab455ea8.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
