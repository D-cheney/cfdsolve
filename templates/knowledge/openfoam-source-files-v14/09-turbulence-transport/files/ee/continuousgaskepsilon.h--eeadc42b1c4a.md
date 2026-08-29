---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-eeadc42b1c4a"
title: "OpenFOAM 14 源码解析：continuousGasKEpsilon.H"
summary: "该文件声明或实现 `continuousGasKEpsilon`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/phaseCompressible/RAS/continuousGasKEpsilon/continuousGasKEpsilon.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：continuousGasKEpsilon.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/phaseCompressible/RAS/continuousGasKEpsilon/continuousGasKEpsilon.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：183 行
- 文件标识：`eeadc42b1c4a`

## 2. 功能说明

该文件声明或实现 `continuousGasKEpsilon`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：k-epsilon model for the gas-phase in a two-phase system supporting phase-inversion. In the limit that the gas-phase fraction approaches zero a contribution from the other phase is blended into the k and epsilon equations up to the phase-fraction of alphaInversion at which point phase-inversion is considered to have occurred and the model reverts to the pure single-phase form. This model is unpublished and is provided as a stable numerical framework on which a more physical model may be built. The default model coefficients are \verbatim continuousGasKEpsilon { Cmu 0.09; C1 1.44; C2 1.92; C3 0; sigmak 1.0; sigmaEps 1.3; alphaInversion 0.7; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `continuousGasKEpsilon` | 80 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`kEpsilon.H`](../../../09-turbulence-transport/files/7f/kepsilon.h--7f9c956ca83a.md)
- [`continuousGasKEpsilon.C`](../../../09-turbulence-transport/files/9d/continuousgaskepsilon.c--9d7004debd7a.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/momentumTransportModels/momentumTransportModels.C](../../../02-solver-modules/files/5a/momentumtransportmodels.c--5ac150b956b3.md)
- [src/MomentumTransportModels/phaseCompressible/RAS/continuousGasKEpsilon/continuousGasKEpsilon.C](../../../09-turbulence-transport/files/9d/continuousgaskepsilon.c--9d7004debd7a.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
