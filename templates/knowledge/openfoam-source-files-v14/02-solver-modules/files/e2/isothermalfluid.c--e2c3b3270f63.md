---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e2c3b3270f63"
title: "OpenFOAM 14 源码解析：isothermalFluid.C"
summary: "该文件实现 `isothermalFluid` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/isothermalFluid/isothermalFluid.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：isothermalFluid.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/isothermalFluid/isothermalFluid.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：408 行
- 文件标识：`e2c3b3270f63`

## 2. 功能说明

该文件实现 `isothermalFluid` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::solvers::isothermalFluid::correctCoNum` | 55 |
| `Foam::solvers::isothermalFluid::continuityErrors` | 60 |
| `Foam::solvers::isothermalFluid::pressureWork` | 69 |
| `Foam::solvers::isothermalFluid::isothermalFluid` | 258 |
| `Foam::solvers::isothermalFluid::preSolve` | 273 |
| `Foam::solvers::isothermalFluid::prePredictor` | 334 |
| `Foam::solvers::isothermalFluid::momentumTransportPredictor` | 348 |
| `Foam::solvers::isothermalFluid::thermophysicalTransportPredictor` | 354 |
| `Foam::solvers::isothermalFluid::thermophysicalPredictor` | 358 |
| `Foam::solvers::isothermalFluid::pressureCorrector` | 364 |
| `Foam::solvers::isothermalFluid::momentumTransportCorrector` | 382 |
| `Foam::solvers::isothermalFluid::thermophysicalTransportCorrector` | 388 |
| `Foam::solvers::isothermalFluid::postSolve` | 392 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **显式散度**：由面通量求控制体净通量并返回单元场。
4. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
5. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
6. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
7. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
8. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
9. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 压力校正：$\mathbf{U}=\mathbf{H}/A-(1/A)\nabla p$，并由连续性得到压力泊松方程。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`isothermalFluid.H`](../../../02-solver-modules/files/4d/isothermalfluid.h--4db48b548d4f.md)
- [`localEulerDdtScheme.H`](../../../05-finite-volume/files/fb/localeulerddtscheme.h--fb7ce050de98.md)
- [`hydrostaticInitialisation.H`](../../../08-thermophysical/files/b3/hydrostaticinitialisation.h--b3fa4be8e72f.md)
- [`fvcMeshPhi.H`](../../../05-finite-volume/files/ea/fvcmeshphi.h--eae2819d7090.md)
- [`fvcVolumeIntegrate.H`](../../../05-finite-volume/files/64/fvcvolumeintegrate.h--6472da24b320.md)
- [`fvcReconstruct.H`](../../../05-finite-volume/files/bc/fvcreconstruct.h--bcc553314882.md)
- [`fvcDiv.H`](../../../05-finite-volume/files/f4/fvcdiv.h--f4f3d94a2b7a.md)
- [`fvcSnGrad.H`](../../../05-finite-volume/files/9c/fvcsngrad.h--9cae40f16e0c.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
