---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b575eb9a5408"
title: "OpenFOAM 14 源码解析：kOmegaSSTLM.H"
summary: "该文件实现 `kOmegaSSTLM` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSSTLM/kOmegaSSTLM.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：kOmegaSSTLM.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSSTLM/kOmegaSSTLM.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：304 行
- 文件标识：`b575eb9a5408`

## 2. 功能说明

该文件实现 `kOmegaSSTLM` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Langtry-Menter 4-equation transitional SST model based on the k-omega-SST RAS model. References: \verbatim Langtry, R. B., & Menter, F. R. (2009). Correlation-based transition modeling for unstructured parallelized computational fluid dynamics codes. AIAA journal, 47(12), 2894-2906. Menter, F. R., Langtry, R., & Volker, S. (2006). Transition modelling for general purpose CFD codes. Flow, turbulence and combustion, 77(1-4), 277-303. Langtry, R. B. (2006). A correlation-based transition model using local variables for unstructured parallelized CFD codes. Phd. Thesis, Universität Stuttgart. \endverbatim The model coefficients are \verbatim kOmegaSST { // Default SST coefficients alphaK1 0.85; alphaK2 1; alphaOmega1 0.5; alphaOmega2 0.856; beta1 0.075; beta2 0.0828; betaStar 0.09; gamma1 5/9; gamma2 0.44; a1 0.31; b1 1; c1 10; F3 no; // Default LM coefficients ca1 2; ca2 0.06; ce1 1; ce2 50;

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `kOmegaSSTLM` | 106 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`kOmegaSST.H`](../../../09-turbulence-transport/files/61/komegasst.h--6149a32f6f70.md)
- [`kOmegaSSTLM.C`](../../../09-turbulence-transport/files/f3/komegasstlm.c--f394f2922d64.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/0c/compressiblemomentumtransportmodels.c--0c9c2be0db68.md)
- [src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/8e/incompressiblemomentumtransportmodels.c--8ef656aa90b7.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSSTLM/kOmegaSSTLM.C](../../../09-turbulence-transport/files/f3/komegasstlm.c--f394f2922d64.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
