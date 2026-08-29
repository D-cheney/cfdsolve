---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a5d2a9eb0990"
title: "OpenFOAM 14 源码解析：qZeta.H"
summary: "该文件实现 `qZeta` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/incompressible/RAS/qZeta/qZeta.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：qZeta.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/incompressible/RAS/qZeta/qZeta.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：215 行
- 文件标识：`a5d2a9eb0990`

## 2. 功能说明

该文件实现 `qZeta` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Gibson and Dafa'Alla's q-zeta two-equation low-Re turbulence model for incompressible flows This turbulence model is described in: \verbatim Dafa'Alla, A.A., Juntasaro, E. & Gibson, M.M. (1996). Calculation of oscillating boundary layers with the q-zeta turbulence model. Engineering Turbulence Modelling and Experiments 3: Proceedings of the Third International Symposium, Crete, Greece, May 27-29, 141. \endverbatim which is a development of the original q-zeta model described in: \verbatim Gibson, M. M., & Dafa'Alla, A. A. (1995). Two-equation model for turbulent wall flow. AIAA journal, 33(8), 1514-1518. \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `qZeta` | 76 |

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

- [src/MomentumTransportModels/incompressible/RAS/qZeta/qZeta.C](../../../09-turbulence-transport/files/d5/qzeta.c--d5d75d08a71e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
