---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-43cec0631587"
title: "OpenFOAM 14 源码解析：LagrangianEqn.H"
summary: "该文件声明或实现 `LagrangianEqn`、`PsiRef`、`PrimitiveField`、`OtherPrimitiveField`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/Lagrangian/LagrangianEqn/LagrangianEqn.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：LagrangianEqn.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/Lagrangian/LagrangianEqn/LagrangianEqn.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：639 行
- 文件标识：`43cec0631587`

## 2. 功能说明

该文件声明或实现 `LagrangianEqn`、`PsiRef`、`PrimitiveField`、`OtherPrimitiveField`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：This class stores the coefficients of a Lagrangian equation, and facilitates solving that equation and updating the associated field. It is designed to behave and be used similarly to fvMatrix.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LagrangianEqn` | 57 |
| `PsiRef` | 67 |
| `PrimitiveField` | 151 |
| `OtherPrimitiveField` | 614 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **线性/非线性求解**：把已装配方程交给 fvSolution 选择的求解器与预条件器。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`LagrangianSp.H`](../../../11-lagrangian/files/b6/lagrangiansp.h--b6d7b828f888.md)
- [`LagrangianEqnBase.H`](../../../11-lagrangian/files/38/lagrangianeqnbase.h--38023205a1ae.md)
- [`LagrangianEqn.C`](../../../11-lagrangian/files/d0/lagrangianeqn.c--d064fff4cc56.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/clouds/coupled/CarrierEqn.H](../../../11-lagrangian/files/c7/carriereqn.h--c75570d78d2f.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianDdtSchemes/CrankNicolson/CrankNicolson_LagrangianDdtScheme.C](../../../11-lagrangian/files/a6/cranknicolson_lagrangianddtscheme.c--a68124ccce97.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianDdtSchemes/Euler/Euler_LagrangianDdtScheme.C](../../../11-lagrangian/files/5b/euler_lagrangianddtscheme.c--5bdcde19fb52.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianSpSchemes/Explicit/Explicit_LagrangianSpScheme.C](../../../11-lagrangian/files/f1/explicit_lagrangianspscheme.c--f1822b7d450c.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianSpSchemes/implicit/implicit_LagrangianSpScheme.C](../../../11-lagrangian/files/e3/implicit_lagrangianspscheme.c--e3e5ac4f563e.md)
- [src/Lagrangian/Lagrangian/Lagrangian/LagrangianSpSchemes/upwind/upwind_LagrangianSpScheme.C](../../../11-lagrangian/files/41/upwind_lagrangianspscheme.c--41c80e0eff95.md)
- [src/Lagrangian/Lagrangian/LagrangianEqn/LagrangianEqn.C](../../../11-lagrangian/files/d0/lagrangianeqn.c--d064fff4cc56.md)
- [src/Lagrangian/Lagrangian/LagrangianEqn/LagrangianVectorSp.C](../../../11-lagrangian/files/c9/lagrangianvectorsp.c--c9b0527f2ce1.md)
- [src/Lagrangian/Lagrangian/LagrangianEqn/LagrangianVectorSpTemplates.C](../../../11-lagrangian/files/7b/lagrangianvectorsptemplates.c--7bad730a34bc.md)
- [src/Lagrangian/Lagrangian/LagrangianModels/LagrangianModel/LagrangianModel.H](../../../11-lagrangian/files/76/lagrangianmodel.h--763630f98c15.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
