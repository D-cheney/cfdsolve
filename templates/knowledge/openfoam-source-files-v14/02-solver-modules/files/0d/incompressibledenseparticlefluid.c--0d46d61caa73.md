---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0d46d61caa73"
title: "OpenFOAM 14 源码解析：incompressibleDenseParticleFluid.C"
summary: "该文件实现 `incompressibleDenseParticleFluid` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/incompressibleDenseParticleFluid/incompressibleDenseParticleFluid.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：incompressibleDenseParticleFluid.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/incompressibleDenseParticleFluid/incompressibleDenseParticleFluid.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：404 行
- 文件标识：`0d46d61caa73`

## 2. 功能说明

该文件实现 `incompressibleDenseParticleFluid` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::solvers::incompressibleDenseParticleFluid::correctCoNum` | 57 |
| `Foam::solvers::incompressibleDenseParticleFluid::continuityErrors` | 62 |
| `Foam::solvers::incompressibleDenseParticleFluid::preSolve` | 254 |
| `Foam::solvers::incompressibleDenseParticleFluid::prePredictor` | 291 |
| `Foam::solvers::incompressibleDenseParticleFluid::thermophysicalPredictor` | 365 |
| `Foam::solvers::incompressibleDenseParticleFluid::pressureCorrector` | 369 |
| `Foam::solvers::incompressibleDenseParticleFluid::postSolve` | 393 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
4. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
5. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
6. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
7. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 压力校正：$\mathbf{U}=\mathbf{H}/A-(1/A)\nabla p$，并由连续性得到压力泊松方程。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`incompressibleDenseParticleFluid.H`](../../../02-solver-modules/files/6e/incompressibledenseparticlefluid.h--6ec93149946f.md)
- `surfaceInterpolate.H`
- [`fvMatrix.H`](../../../05-finite-volume/files/72/fvmatrix.h--7269aa48a1c0.md)
- [`fvcFlux.H`](../../../05-finite-volume/files/c9/fvcflux.h--c964e1bdde0c.md)
- [`zeroGradientFvPatchFields.H`](../../../05-finite-volume/files/9a/zerogradientfvpatchfields.h--9a96ee93ac86.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
