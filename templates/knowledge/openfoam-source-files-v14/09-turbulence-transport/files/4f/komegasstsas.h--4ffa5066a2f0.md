---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4ffa5066a2f0"
title: "OpenFOAM 14 源码解析：kOmegaSSTSAS.H"
summary: "该文件声明或实现 `kOmegaSSTSAS`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSSTSAS/kOmegaSSTSAS.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：kOmegaSSTSAS.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSSTSAS/kOmegaSSTSAS.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：203 行
- 文件标识：`4ffa5066a2f0`

## 2. 功能说明

该文件声明或实现 `kOmegaSSTSAS`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Scale-adaptive URAS model based on the k-omega-SST RAS model. References: \verbatim Egorov, Y., & Menter F.R. (2008). Development and Application of SST-SAS Model in the DESIDER Project. Advances in Hybrid RANS-LES Modelling, Notes on Num. Fluid Mech. And Multidisciplinary Design, Volume 97, 261-270. \endverbatim The model coefficients are \verbatim kOmegaSSTSAS { // Default SST coefficients alphaK1 0.85; alphaK2 1.0; alphaOmega1 0.5; alphaOmega2 0.856; beta1 0.075; beta2 0.0828; betaStar 0.09; gamma1 5/9; gamma2 0.44; a1 0.31; b1 1.0; c1 10.0; F3 no; // Default SAS coefficients Cs 0.11; kappa 0.41; zeta2 3.51; sigmaPhi 2.0/3.0; C 2; // Delta must be specified for SAS e.g. delta cubeRootVol; cubeRootVol {} } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `kOmegaSSTSAS` | 100 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`kOmegaSST.H`](../../../09-turbulence-transport/files/61/komegasst.h--6149a32f6f70.md)
- [`LESdelta.H`](../../../09-turbulence-transport/files/de/lesdelta.h--de25de8aa635.md)
- [`kOmegaSSTSAS.C`](../../../09-turbulence-transport/files/2e/komegasstsas.c--2e3ab132dee3.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/0c/compressiblemomentumtransportmodels.c--0c9c2be0db68.md)
- [src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/8e/incompressiblemomentumtransportmodels.c--8ef656aa90b7.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSSTSAS/kOmegaSSTSAS.C](../../../09-turbulence-transport/files/2e/komegasstsas.c--2e3ab132dee3.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
