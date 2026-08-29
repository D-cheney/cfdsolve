---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-bdbf6cd4f4c9"
title: "OpenFOAM 14 源码解析：IATEsource.H"
summary: "该文件实现 `IATEsource` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/diameterModels/IATE/IATEsources/IATEsource/IATEsource.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：IATEsource.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/diameterModels/IATE/IATEsources/IATEsource/IATEsource.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：205 行
- 文件标识：`bdbf6cd4f4c9`

## 2. 功能说明

该文件实现 `IATEsource` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：IATE (Interfacial Area Transport Equation) bubble diameter model run-time selectable sources.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `IATEsource` | 59 |
| `iNew` | 94 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `phi` | 159 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`IATE.H`](../../../02-solver-modules/files/14/iate.h--147405c9efa0.md)
- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [`mathematicalConstants.H`](../../../04-core-runtime/files/80/mathematicalconstants.h--8059f1c384fb.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/IATE/IATE.C](../../../02-solver-modules/files/61/iate.c--617b89faf05c.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/IATE/IATEsources/IATEsource/IATEsource.C](../../../02-solver-modules/files/0c/iatesource.c--0ceea8c508d8.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/IATE/IATEsources/randomCoalescence/IATErandomCoalescence.H](../../../02-solver-modules/files/cc/iaterandomcoalescence.h--ccaf1b920293.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/IATE/IATEsources/turbulentBreakUp/IATEturbulentBreakUp.H](../../../02-solver-modules/files/4d/iateturbulentbreakup.h--4d3a872e3df5.md)
- [applications/modules/multiphaseEuler/phaseSystem/diameterModels/IATE/IATEsources/wakeEntrainmentCoalescence/IATEwakeEntrainmentCoalescence.H](../../../02-solver-modules/files/33/iatewakeentrainmentcoalescence.h--3315d96f8f17.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
