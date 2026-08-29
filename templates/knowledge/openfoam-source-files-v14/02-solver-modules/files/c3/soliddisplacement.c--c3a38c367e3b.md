---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c3a38c367e3b"
title: "OpenFOAM 14 源码解析：solidDisplacement.C"
summary: "该文件实现 `dependenciesModified`、`read`、`prePredictor`、`thermophysicalPredictor` 等过程，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/solidDisplacement/solidDisplacement.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：solidDisplacement.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/solidDisplacement/solidDisplacement.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：296 行
- 文件标识：`c3a38c367e3b`

## 2. 功能说明

该文件实现 `dependenciesModified`、`read`、`prePredictor`、`thermophysicalPredictor` 等过程，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::solvers::solidDisplacement::dependenciesModified` | 53 |
| `Foam::solvers::solidDisplacement::read` | 58 |
| `Foam::solvers::solidDisplacement::prePredictor` | 166 |
| `Foam::solvers::solidDisplacement::thermophysicalPredictor` | 174 |
| `Foam::solvers::solidDisplacement::pressureCorrector` | 183 |
| `Foam::solvers::solidDisplacement::thermophysicalTransportCorrector` | 245 |
| `Foam::solvers::solidDisplacement::postSolve` | 254 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **隐式扩散项**：使用面扩散系数和法向梯度离散拉普拉斯项。
3. **显式散度**：由面通量求控制体净通量并返回单元场。
4. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。
5. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
6. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
7. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
8. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
9. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 扩散项：$\int_{\partial V}\Gamma\nabla\phi\cdot\mathbf{n}\,\mathrm{d}S$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`solidDisplacement.H`](../../../02-solver-modules/files/bc/soliddisplacement.h--bc570606ce37.md)
- [`fvcGrad.H`](../../../05-finite-volume/files/d3/fvcgrad.h--d32a079c3240.md)
- [`fvcDiv.H`](../../../05-finite-volume/files/f4/fvcdiv.h--f4f3d94a2b7a.md)
- [`fvcLaplacian.H`](../../../05-finite-volume/files/e5/fvclaplacian.h--e5b7573a0e31.md)
- [`fvmD2dt2.H`](../../../05-finite-volume/files/d8/fvmd2dt2.h--d8889dbceb54.md)
- [`fvmLaplacian.H`](../../../05-finite-volume/files/99/fvmlaplacian.h--99705f4e6ce0.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
