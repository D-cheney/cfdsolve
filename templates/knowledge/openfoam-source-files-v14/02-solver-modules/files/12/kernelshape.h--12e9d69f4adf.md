---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-12e9d69f4adf"
title: "OpenFOAM 14 源码解析：kernelShape.H"
summary: "该文件声明或实现 `kernelShape`，属于“模块化求解器”模块。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/XiFluid/fvModels/ignition/kernelShapes/kernelShape/kernelShape.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：kernelShape.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/XiFluid/fvModels/ignition/kernelShapes/kernelShape/kernelShape.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：147 行
- 文件标识：`12e9d69f4adf`

## 2. 功能说明

该文件声明或实现 `kernelShape`，属于“模块化求解器”模块。

中文导航角色：模块化求解器实现。

上游说明：Base class for ignition kernel flame wrinkling \c Xi correction Usage Example usage: \verbatim kernelShape { type <type>; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `kernelShape` | 65 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`dimensionedTypes.H`](../../../04-core-runtime/files/e7/dimensionedtypes.h--e7b52390401f.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [applications/modules/XiFluid/fvModels/ignition/bXiKernelCorr/bXiKernelCorr.H](../../../02-solver-modules/files/81/bxikernelcorr.h--818fccca44b1.md)
- [applications/modules/XiFluid/fvModels/ignition/GaussianbXiIgnition/GaussianbXiIgnition.H](../../../02-solver-modules/files/f1/gaussianbxiignition.h--f19b2c4b907a.md)
- [applications/modules/XiFluid/fvModels/ignition/kernelShapes/cylindrical/cylindricalKernelShape.H](../../../02-solver-modules/files/e3/cylindricalkernelshape.h--e386bcc57e69.md)
- [applications/modules/XiFluid/fvModels/ignition/kernelShapes/kernelShape/kernelShape.C](../../../02-solver-modules/files/eb/kernelshape.c--ebad75e30f4d.md)
- [applications/modules/XiFluid/fvModels/ignition/kernelShapes/kernelShape/kernelShapeNew.C](../../../02-solver-modules/files/04/kernelshapenew.c--04c13e4d32d3.md)
- [applications/modules/XiFluid/fvModels/ignition/kernelShapes/planar/planarKernelShape.H](../../../02-solver-modules/files/3f/planarkernelshape.h--3f19bacf12ce.md)
- [applications/modules/XiFluid/fvModels/ignition/kernelShapes/spherical/sphericalKernelShape.H](../../../02-solver-modules/files/32/sphericalkernelshape.h--32dc2e61a463.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
