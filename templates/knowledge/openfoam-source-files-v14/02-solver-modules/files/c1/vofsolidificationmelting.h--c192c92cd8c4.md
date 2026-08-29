---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c192c92cd8c4"
title: "OpenFOAM 14 源码解析：VoFSolidificationMelting.H"
summary: "该文件声明或实现 `compressibleTwoPhaseVoFMixture`、`VoFSolidificationMelting`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/compressibleVoF/fvModels/VoFSolidificationMelting/VoFSolidificationMelting.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：VoFSolidificationMelting.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/compressibleVoF/fvModels/VoFSolidificationMelting/VoFSolidificationMelting.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：244 行
- 文件标识：`c192c92cd8c4`

## 2. 功能说明

该文件声明或实现 `compressibleTwoPhaseVoFMixture`、`VoFSolidificationMelting`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Solidification and melting model for VoF simulations. The presence of the solid phase in the flow field is incorporated into the model as a momentum porosity contribution; the energy associated with the phase change is added as an enthalpy contribution. The solid fraction as a function of temperature \c alphaSolidT is specified as a Foam::Function1. The model writes the field \c alpha[01].solid which can be visualised to to show the solid distribution. Usage Example usage: \verbatim VoFSolidificationMelting1 { type VoFSolidificationMelting; cellZone solidZone; alphaSolidT table ( (330 1) (335 0) ); L 334000; } \endverbatim Where: \table Property | Description | Required | Default value alphaSolidT | Solid fraction as function of temperature | yes | L | Latent heat of fusion [J/kg] | yes | relax | Relaxation coefficient [0-1] | no | 0.9 Cu | Model coefficient | no | 100000 q | Model coeff

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `compressibleTwoPhaseVoFMixture` | 96 |
| `VoFSolidificationMelting` | 105 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`fvModel.H`](../../../05-finite-volume/files/be/fvmodel.h--beab7979c40e.md)
- [`fvCellZone.H`](../../../05-finite-volume/files/be/fvcellzone.h--bee09cd009b8.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`Function1.H`](../../../04-core-runtime/files/bf/function1.h--bfbc00bbb006.md)

## 8. 直接上层引用

- [applications/modules/compressibleVoF/fvModels/VoFSolidificationMelting/VoFSolidificationMelting.C](../../../02-solver-modules/files/c7/vofsolidificationmelting.c--c7a6854523bf.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
