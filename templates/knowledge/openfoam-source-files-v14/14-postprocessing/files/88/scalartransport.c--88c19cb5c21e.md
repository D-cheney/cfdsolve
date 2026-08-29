---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-88c19cb5c21e"
title: "OpenFOAM 14 源码解析：scalarTransport.C"
summary: "该文件实现 `scalarTransport` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/solvers/scalarTransport/scalarTransport.C"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：scalarTransport.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/solvers/scalarTransport/scalarTransport.C`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：686 行
- 文件标识：`88c19cb5c21e`

## 2. 功能说明

该文件实现 `scalarTransport` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：运行时后处理功能对象。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::functionObjects::scalarTransport::D` | 86 |
| `Foam::functionObjects::scalarTransport::read` | 174 |
| `Foam::functionObjects::scalarTransport::fields` | 203 |
| `Foam::functionObjects::scalarTransport::execute` | 209 |
| `Foam::functionObjects::scalarTransport::subCycleMULES` | 333 |
| `Foam::functionObjects::scalarTransport::solveMULES` | 392 |
| `Foam::functionObjects::scalarTransport::write` | 676 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **隐式时间项**：把时间导数装配到矩阵对角与源项，参与线性方程求解。
4. **隐式对流项**：按面通量和选定格式把对流贡献装配到有限体积矩阵。
5. **隐式扩散项**：使用面扩散系数和法向梯度离散拉普拉斯项。
6. **显式时间算子**：直接计算时间导数场，不把未知量系数写入矩阵。
7. **显式散度**：由面通量求控制体净通量并返回单元场。
8. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。
9. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
10. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
11. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
12. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
13. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
14. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 时间项：$\int_V \partial \phi/\partial t\,\mathrm{d}V$。
- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 扩散项：$\int_{\partial V}\Gamma\nabla\phi\cdot\mathbf{n}\,\mathrm{d}S$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`scalarTransport.H`](../../../14-postprocessing/files/0e/scalartransport.h--0e169bc7ea11.md)
- [`surfaceFields.H`](../../../05-finite-volume/files/46/surfacefields.h--468a61846d4e.md)
- [`fvmDdt.H`](../../../05-finite-volume/files/be/fvmddt.h--bee4ba370e19.md)
- [`fvcDdt.H`](../../../05-finite-volume/files/78/fvcddt.h--78d28871151f.md)
- [`fvmDiv.H`](../../../05-finite-volume/files/32/fvmdiv.h--32306f8dc3a6.md)
- [`fvmLaplacian.H`](../../../05-finite-volume/files/99/fvmlaplacian.h--99705f4e6ce0.md)
- [`fvmSup.H`](../../../05-finite-volume/files/6c/fvmsup.h--6ce628800519.md)
- [`fvcFlux.H`](../../../05-finite-volume/files/c9/fvcflux.h--c964e1bdde0c.md)
- [`fvModels.H`](../../../05-finite-volume/files/60/fvmodels.h--6040b512bd89.md)
- [`fvConstraints.H`](../../../05-finite-volume/files/68/fvconstraints.h--68dca4db4ada.md)
- [`incompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/d6/incompressiblemomentumtransportmodel.h--d66b1dda583c.md)
- [`compressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/eb/compressiblemomentumtransportmodel.h--eb183e43a318.md)
- [`CMULES.H`](../../../05-finite-volume/files/e0/cmules.h--e02aced9d4a4.md)
- [`EulerDdtScheme.H`](../../../05-finite-volume/files/af/eulerddtscheme.h--afa5e4cb5ca0.md)
- [`localEulerDdtScheme.H`](../../../05-finite-volume/files/fb/localeulerddtscheme.h--fb7ce050de98.md)
- [`CrankNicolsonDdtScheme.H`](../../../05-finite-volume/files/a7/cranknicolsonddtscheme.h--a7153d5e8cf9.md)
- [`localMax.H`](../../../05-finite-volume/files/e7/localmax.h--e742ff61c302.md)
- [`zeroGradientFvPatchFields.H`](../../../05-finite-volume/files/9a/zerogradientfvpatchfields.h--9a96ee93ac86.md)
- [`subCycle.H`](../../../05-finite-volume/files/a3/subcycle.h--a3e7337023d3.md)
- [`interfaceCompression.H`](../../../10-multiphase/files/43/interfacecompression.h--431831891837.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
