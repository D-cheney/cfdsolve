---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d03f165e0e1c"
title: "OpenFOAM 14 源码解析：phaseScalarTransport.C"
summary: "该文件实现 `phaseScalarTransport` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/solvers/phaseScalarTransport/phaseScalarTransport.C"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：phaseScalarTransport.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/solvers/phaseScalarTransport/phaseScalarTransport.C`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：567 行
- 文件标识：`d03f165e0e1c`

## 2. 功能说明

该文件实现 `phaseScalarTransport` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：运行时后处理功能对象。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::functionObjects::phaseScalarTransport::Phi` | 74 |
| `Foam::functionObjects::phaseScalarTransport::alphaPhi` | 116 |
| `Foam::functionObjects::phaseScalarTransport::D` | 235 |
| `Foam::functionObjects::phaseScalarTransport::read` | 324 |
| `Foam::functionObjects::phaseScalarTransport::fields` | 380 |
| `Foam::functionObjects::phaseScalarTransport::execute` | 386 |
| `Foam::functionObjects::phaseScalarTransport::write` | 547 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **隐式时间项**：把时间导数装配到矩阵对角与源项，参与线性方程求解。
4. **隐式对流项**：按面通量和选定格式把对流贡献装配到有限体积矩阵。
5. **隐式扩散项**：使用面扩散系数和法向梯度离散拉普拉斯项。
6. **显式时间算子**：直接计算时间导数场，不把未知量系数写入矩阵。
7. **显式散度**：由面通量求控制体净通量并返回单元场。
8. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
9. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
10. **非正交校正**：在外层解不变的条件下重复修正非正交拉普拉斯贡献，并在末次更新守恒通量。
11. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
12. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
13. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
14. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
15. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 时间项：$\int_V \partial \phi/\partial t\,\mathrm{d}V$。
- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 扩散项：$\int_{\partial V}\Gamma\nabla\phi\cdot\mathbf{n}\,\mathrm{d}S$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)
- [`fixedValueFvPatchField.H`](../../../05-finite-volume/files/58/fixedvaluefvpatchfield.h--589fa1c7e03a.md)
- [`fvcDdt.H`](../../../05-finite-volume/files/78/fvcddt.h--78d28871151f.md)
- [`fvcDiv.H`](../../../05-finite-volume/files/f4/fvcdiv.h--f4f3d94a2b7a.md)
- [`fvmDdt.H`](../../../05-finite-volume/files/be/fvmddt.h--bee4ba370e19.md)
- [`fvmDiv.H`](../../../05-finite-volume/files/32/fvmdiv.h--32306f8dc3a6.md)
- [`fvmLaplacian.H`](../../../05-finite-volume/files/99/fvmlaplacian.h--99705f4e6ce0.md)
- [`fvModels.H`](../../../05-finite-volume/files/60/fvmodels.h--6040b512bd89.md)
- [`fvConstraints.H`](../../../05-finite-volume/files/68/fvconstraints.h--68dca4db4ada.md)
- [`nonOrthogonalSolutionControl.H`](../../../05-finite-volume/files/bd/nonorthogonalsolutioncontrol.h--bda837720802.md)
- [`phaseScalarTransport.H`](../../../14-postprocessing/files/08/phasescalartransport.h--081e7a1871ed.md)
- [`surfaceFields.H`](../../../05-finite-volume/files/46/surfacefields.h--468a61846d4e.md)
- [`momentumTransportModel.H`](../../../09-turbulence-transport/files/36/momentumtransportmodel.h--36c367269e58.md)
- [`wallFvPatch.H`](../../../05-finite-volume/files/91/wallfvpatch.h--91e9c7f67f00.md)
- [`zeroGradientFvPatchField.H`](../../../05-finite-volume/files/f4/zerogradientfvpatchfield.h--f4010bab0960.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
