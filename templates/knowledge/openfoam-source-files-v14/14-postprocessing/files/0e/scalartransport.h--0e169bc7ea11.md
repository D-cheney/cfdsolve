---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0e169bc7ea11"
title: "OpenFOAM 14 源码解析：scalarTransport.H"
summary: "该文件声明或实现 `scalarTransport`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/solvers/scalarTransport/scalarTransport.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：scalarTransport.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/solvers/scalarTransport/scalarTransport.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：251 行
- 文件标识：`0e169bc7ea11`

## 2. 功能说明

该文件声明或实现 `scalarTransport`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：Evolves a passive scalar transport equation. - To specify the field name set the \c field entry - To employ the same numerical schemes as another field set the \c schemesField entry, - To employ the same solver settings as another field set the \c solverField entry, - The \c diffusivity entry can be set to \c none, \c constant, \c viscosity - A constant diffusivity is specified with the \c D entry, - If a momentum transport model is available and the \c viscosity diffusivity option specified an effective diffusivity may be constructed from the laminar and turbulent viscosities using the diffusivity coefficients \c alphal and \c alphat: \verbatim D = alphal*nu + alphat*nut \endverbatim Example: \verbatim #includeFunc scalarTransport(T, alphal=1, alphat=1) \endverbatim For incompressible flow the passive scalar may optionally be solved with the MULES limiter and sub-cycling or semi-implici

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `scalarTransport` | 117 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)

## 8. 直接上层引用

- [src/functionObjects/solvers/phaseScalarTransport/phaseScalarTransport.H](../../../14-postprocessing/files/08/phasescalartransport.h--081e7a1871ed.md)
- [src/functionObjects/solvers/scalarTransport/scalarTransport.C](../../../14-postprocessing/files/88/scalartransport.c--88c19cb5c21e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
