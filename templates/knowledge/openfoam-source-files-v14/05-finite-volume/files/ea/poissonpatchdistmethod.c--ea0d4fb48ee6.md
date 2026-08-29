---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ea0d4fb48ee6"
title: "OpenFOAM 14 源码解析：PoissonPatchDistMethod.C"
summary: "该文件实现 `PoissonPatchDistMethod` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/wallDist/patchDistMethods/Poisson/PoissonPatchDistMethod.C"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：PoissonPatchDistMethod.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/wallDist/patchDistMethods/Poisson/PoissonPatchDistMethod.C`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：129 行
- 文件标识：`ea0d4fb48ee6`

## 2. 功能说明

该文件实现 `PoissonPatchDistMethod` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::patchDistMethods::Poisson::Poisson` | 59 |
| `Foam::patchDistMethods::Poisson::correct` | 72 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **隐式扩散项**：使用面扩散系数和法向梯度离散拉普拉斯项。
4. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。
5. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 扩散项：$\int_{\partial V}\Gamma\nabla\phi\cdot\mathbf{n}\,\mathrm{d}S$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`PoissonPatchDistMethod.H`](../../../05-finite-volume/files/ae/poissonpatchdistmethod.h--ae2fe5d28002.md)
- [`fvcGrad.H`](../../../05-finite-volume/files/d3/fvcgrad.h--d32a079c3240.md)
- [`fvmLaplacian.H`](../../../05-finite-volume/files/99/fvmlaplacian.h--99705f4e6ce0.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
