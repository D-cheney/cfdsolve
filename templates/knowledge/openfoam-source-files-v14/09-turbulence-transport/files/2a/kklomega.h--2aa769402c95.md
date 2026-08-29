---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2aa769402c95"
title: "OpenFOAM 14 源码解析：kkLOmega.H"
summary: "该文件实现 `kkLOmega` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/incompressible/RAS/kkLOmega/kkLOmega.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：kkLOmega.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/incompressible/RAS/kkLOmega/kkLOmega.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：322 行
- 文件标识：`2aa769402c95`

## 2. 功能说明

该文件实现 `kkLOmega` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Low Reynolds-number k-kl-omega turbulence model for incompressible flows. This turbulence model is described in: \verbatim Walters, D. K., & Cokljat, D. (2008). A three-equation eddy-viscosity model for Reynolds-averaged Navier–Stokes simulations of transitional flow. Journal of Fluids Engineering, 130(12), 121401. \endverbatim corrected according to: \verbatim Furst, J. (2013). Numerical simulation of transitional flows with laminar kinetic energy. Engineering Mechanics, 20(5), 379-388. \endverbatim and includes the improvements proposed in: \verbatim Lopez, M., and Keith Walters, D. (2016). A Recommended Correction to the kT−kL−ω Transition-Sensitive Eddy-Viscosity Model. Journal of Fluids Engineering, 139(2), 024501. \endverbatim The default model coefficients are \verbatim kkLOmega { A0 4.04 As 2.12 Av 6.75 Abp 0.6 Anat 200 Ats 200 CbpCrit 1.2 Cnc 0.1 CnatCrit 1250 Cint 0.75 CtsCrit 

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `kkLOmega` | 119 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`incompressibleMomentumTransportModels.H`](../../../09-turbulence-transport/files/17/incompressiblemomentumtransportmodels.h--177fb8e614f3.md)
- [`eddyViscosity.H`](../../../09-turbulence-transport/files/67/eddyviscosity.h--678d8cba3afc.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/incompressible/RAS/kkLOmega/kkLOmega.C](../../../09-turbulence-transport/files/07/kklomega.c--07ea7579446f.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
