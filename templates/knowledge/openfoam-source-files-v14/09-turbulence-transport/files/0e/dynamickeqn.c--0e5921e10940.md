---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0e5921e10940"
title: "OpenFOAM 14 源码解析：dynamicKEqn.C"
summary: "该文件实现 `dynamicKEqn` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/LES/dynamicKEqn/dynamicKEqn.C"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：dynamicKEqn.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/LES/dynamicKEqn/dynamicKEqn.C`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：284 行
- 文件标识：`0e5921e10940`

## 2. 功能说明

该文件实现 `dynamicKEqn` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：层流/RANS/LES 动量输运模型。

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
7. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
8. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
9. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
10. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
11. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
12. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 时间项：$\int_V \partial \phi/\partial t\,\mathrm{d}V$。
- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 扩散项：$\int_{\partial V}\Gamma\nabla\phi\cdot\mathbf{n}\,\mathrm{d}S$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`dynamicKEqn.H`](../../../09-turbulence-transport/files/c4/dynamickeqn.h--c42da8465b60.md)
- [`fvModels.H`](../../../05-finite-volume/files/60/fvmodels.h--6040b512bd89.md)
- [`fvConstraints.H`](../../../05-finite-volume/files/68/fvconstraints.h--68dca4db4ada.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/LES/dynamicKEqn/dynamicKEqn.H](../../../09-turbulence-transport/files/c4/dynamickeqn.h--c42da8465b60.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
