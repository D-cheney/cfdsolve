---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-05b235c48f3a"
title: "OpenFOAM 14 源码解析：Maxwell.H"
summary: "该文件声明或实现 `Maxwell`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/laminar/Maxwell/Maxwell.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：Maxwell.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/laminar/Maxwell/Maxwell.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：240 行
- 文件标识：`05b235c48f3a`

## 2. 功能说明

该文件声明或实现 `Maxwell`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Generalised Maxwell model for viscoelasticity using the upper-convected time derivative of the stress tensor with support for multiple modes. See http://en.wikipedia.org/wiki/Upper-convected_Maxwell_model http://en.wikipedia.org/wiki/Generalised_Maxwell_model The model includes an additional viscosity (nu) from the viscosity model from which it is instantiated, which makes it equivalent to the Oldroyd-B model for the case of an incompressible viscosity model (where nu is non-zero). See https://en.wikipedia.org/wiki/Oldroyd-B_model Reference: \verbatim Wiechert, E. (1889). Ueber elastische Nachwirkung. (Doctoral dissertation, Hartungsche buchdr.). Wiechert, E. (1893). Gesetze der elastischen Nachwirkung für constante Temperatur. Annalen der Physik, 286(11), 546-570. Amoreira, L. J., & Oliveira, P. J. (2010). Comparison of different formulations for the numerical calculation of unsteady in

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Maxwell` | 81 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`laminarModel.H`](../../../09-turbulence-transport/files/38/laminarmodel.h--387d6eff7a10.md)
- [`Maxwell.C`](../../../09-turbulence-transport/files/86/maxwell.c--86bad486460a.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/filmCompressibleMomentumTransportModels/filmCompressibleMomentumTransportModels.C](../../../02-solver-modules/files/e6/filmcompressiblemomentumtransportmodels.c--e612672a24f4.md)
- [src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/0c/compressiblemomentumtransportmodels.c--0c9c2be0db68.md)
- [src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/8e/incompressiblemomentumtransportmodels.c--8ef656aa90b7.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/Giesekus/Giesekus.H](../../../09-turbulence-transport/files/ea/giesekus.h--ea88ae4178d2.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/Maxwell/Maxwell.C](../../../09-turbulence-transport/files/86/maxwell.c--86bad486460a.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/PTT/PTT.H](../../../09-turbulence-transport/files/8d/ptt.h--8d88e13d7935.md)
- [src/MomentumTransportModels/phaseCompressible/phaseCompressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/25/phasecompressiblemomentumtransportmodels.c--251b58c17fca.md)
- [src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/59/phaseincompressiblemomentumtransportmodels.c--59d4ebf56362.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
