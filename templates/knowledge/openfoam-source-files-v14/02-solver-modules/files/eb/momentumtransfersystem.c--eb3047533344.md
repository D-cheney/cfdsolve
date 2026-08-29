---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-eb3047533344"
title: "OpenFOAM 14 源码解析：momentumTransferSystem.C"
summary: "该文件实现 `momentumTransferSystem` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/momentumTransferSystem/momentumTransferSystem.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：momentumTransferSystem.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/momentumTransferSystem/momentumTransferSystem.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1216 行
- 文件标识：`eb3047533344`

## 2. 功能说明

该文件实现 `momentumTransferSystem` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::momentumTransferSystem::io` | 69 |
| `Foam::momentumTransferSystem::modelsDict` | 130 |
| `Foam::momentumTransferSystem::readModels` | 142 |
| `Foam::momentumTransferSystem::addTmpField` | 181 |
| `Foam::momentumTransferSystem::Fs` | 230 |
| `Foam::momentumTransferSystem::Ffs` | 347 |
| `Foam::momentumTransferSystem::invADVs` | 465 |
| `Foam::momentumTransferSystem::invADVfs` | 773 |
| `Foam::momentumTransferSystem::alphaDByAf` | 973 |
| `Foam::momentumTransferSystem::ddtCorrs` | 1037 |
| `Foam::momentumTransferSystem::dragCorrs` | 1132 |
| `Foam::momentumTransferSystem::read` | 1197 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
3. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
4. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
5. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 时间项：$\int_V \partial \phi/\partial t\,\mathrm{d}V$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`momentumTransferSystem.H`](../../../02-solver-modules/files/27/momentumtransfersystem.h--2734c12df7e8.md)
- [`dragModel.H`](../../../02-solver-modules/files/24/dragmodel.h--243543c89a62.md)
- [`virtualMassModel.H`](../../../02-solver-modules/files/09/virtualmassmodel.h--09fe7de2598a.md)
- [`liftModel.H`](../../../02-solver-modules/files/27/liftmodel.h--277b3d1d6b7e.md)
- [`wallLubricationModel.H`](../../../02-solver-modules/files/35/walllubricationmodel.h--35025372820b.md)
- [`turbulentDispersionModel.H`](../../../02-solver-modules/files/65/turbulentdispersionmodel.h--655ee94cca1d.md)
- [`generateBlendedInterfacialModels.H`](../../../02-solver-modules/files/e0/generateblendedinterfacialmodels.h--e0a360db1f7d.md)
- [`fvmDdt.H`](../../../05-finite-volume/files/be/fvmddt.h--bee4ba370e19.md)
- [`fvmDiv.H`](../../../05-finite-volume/files/32/fvmdiv.h--32306f8dc3a6.md)
- [`fvmSup.H`](../../../05-finite-volume/files/6c/fvmsup.h--6ce628800519.md)
- [`fvcDdt.H`](../../../05-finite-volume/files/78/fvcddt.h--78d28871151f.md)
- [`fvcDiv.H`](../../../05-finite-volume/files/f4/fvcdiv.h--f4f3d94a2b7a.md)
- [`fvcFlux.H`](../../../05-finite-volume/files/c9/fvcflux.h--c964e1bdde0c.md)
- [`fvcSnGrad.H`](../../../05-finite-volume/files/9c/fvcsngrad.h--9cae40f16e0c.md)
- [`fvcMeshPhi.H`](../../../05-finite-volume/files/ea/fvcmeshphi.h--eae2819d7090.md)
- [`fvcReconstruct.H`](../../../05-finite-volume/files/bc/fvcreconstruct.h--bcc553314882.md)
- [`scalarMatrices.H`](../../../06-linear-algebra/files/64/scalarmatrices.h--64cd68897b02.md)
- [`pimpleNoLoopControl.H`](../../../05-finite-volume/files/21/pimplenoloopcontrol.h--211d4bd02bbb.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
