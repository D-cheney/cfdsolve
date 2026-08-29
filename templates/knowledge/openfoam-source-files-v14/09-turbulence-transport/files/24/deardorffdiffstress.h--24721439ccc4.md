---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-24721439ccc4"
title: "OpenFOAM 14 源码解析：DeardorffDiffStress.H"
summary: "该文件声明或实现 `DeardorffDiffStress`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/LES/DeardorffDiffStress/DeardorffDiffStress.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：DeardorffDiffStress.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/LES/DeardorffDiffStress/DeardorffDiffStress.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：178 行
- 文件标识：`24721439ccc4`

## 2. 功能说明

该文件声明或实现 `DeardorffDiffStress`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Differential SGS Stress Equation Model for incompressible and compressible flows Reference: \verbatim Deardorff, J. W. (1973). The use of subgrid transport equations in a three-dimensional model of atmospheric turbulence. Journal of Fluids Engineering, 95(3), 429-438. \endverbatim This SGS model uses a full balance equation for the SGS stress tensor to simulate the behaviour of B. This implementation is as described in the above paper except that the triple correlation model of Donaldson is replaced with the generalised gradient diffusion model of Daly and Harlow: \verbatim Daly, B. J., & Harlow, F. H. (1970). Transport equations in turbulence. Physics of Fluids (1958-1988), 13(11), 2634-2649. \endverbatim with the default value for the coefficient Cs of 0.25 from \verbatim Launder, B. E., Reece, G. J., & Rodi, W. (1975). Progress in the development of a Reynolds-stress turbulence closur

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `DeardorffDiffStress` | 84 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`LESModel.H`](../../../09-turbulence-transport/files/b3/lesmodel.h--b313bdba577b.md)
- [`ReynoldsStress.H`](../../../09-turbulence-transport/files/98/reynoldsstress.h--98737ce9aa06.md)
- [`DeardorffDiffStress.C`](../../../09-turbulence-transport/files/a5/deardorffdiffstress.c--a572b044a177.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/0c/compressiblemomentumtransportmodels.c--0c9c2be0db68.md)
- [src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/8e/incompressiblemomentumtransportmodels.c--8ef656aa90b7.md)
- [src/MomentumTransportModels/momentumTransportModels/LES/DeardorffDiffStress/DeardorffDiffStress.C](../../../09-turbulence-transport/files/a5/deardorffdiffstress.c--a572b044a177.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
