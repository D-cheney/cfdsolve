---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9028b909f549"
title: "OpenFOAM 14 源码解析：bEqn.H"
summary: "该文件实现 `bEqn` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/legacy/combustion/PDRFoam/bEqn.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：bEqn.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/legacy/combustion/PDRFoam/bEqn.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：105 行
- 文件标识：`9028b909f549`

## 2. 功能说明

该文件实现 `bEqn` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **隐式时间项**：把时间导数装配到矩阵对角与源项，参与线性方程求解。
3. **隐式对流项**：按面通量和选定格式把对流贡献装配到有限体积矩阵。
4. **隐式扩散项**：使用面扩散系数和法向梯度离散拉普拉斯项。
5. **显式散度**：由面通量求控制体净通量并返回单元场。
6. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。
7. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
8. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
9. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 时间项：$\int_V \partial \phi/\partial t\,\mathrm{d}V$。
- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 扩散项：$\int_{\partial V}\Gamma\nabla\phi\cdot\mathbf{n}\,\mathrm{d}S$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`StCorr.H`](../../../17-other-libraries/files/48/stcorr.h--48da3c33609f.md)
- [`StCourantNo.H`](../../../17-other-libraries/files/ab/stcourantno.h--abcb1c4555bc.md)
- [`ignite.H`](../../../17-other-libraries/files/7b/ignite.h--7b34dc3c46d8.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/PDRFoam.C](../../../17-other-libraries/files/1d/pdrfoam.c--1dd8c8cd6a5d.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
