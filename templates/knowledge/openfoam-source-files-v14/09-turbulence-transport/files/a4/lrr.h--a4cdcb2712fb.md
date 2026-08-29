---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a4cdcb2712fb"
title: "OpenFOAM 14 源码解析：LRR.H"
summary: "该文件实现 `LRR` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/RAS/LRR/LRR.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：LRR.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/RAS/LRR/LRR.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：244 行
- 文件标识：`a4cdcb2712fb`

## 2. 功能说明

该文件实现 `LRR` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Launder, Reece and Rodi Reynolds-stress turbulence model for incompressible and compressible flows. Reference: \verbatim Launder, B. E., Reece, G. J., & Rodi, W. (1975). Progress in the development of a Reynolds-stress turbulence closure. Journal of fluid mechanics, 68(03), 537-566. \endverbatim Including the recommended generalised gradient diffusion model of Daly and Harlow: \verbatim Daly, B. J., & Harlow, F. H. (1970). Transport equations in turbulence. Physics of Fluids (1958-1988), 13(11), 2634-2649. \endverbatim Optional Gibson-Launder wall-reflection is also provided: \verbatim Gibson, M. M., & Launder, B. E. (1978). Ground effects on pressure fluctuations in the atmospheric boundary layer. Journal of Fluid Mechanics, 86(03), 491-511. \endverbatim The default model coefficients are: \verbatim LRR { Cmu 0.09; C1 1.8; C2 0.6; Ceps1 1.44; Ceps2 1.92; Cs 0.25; Ceps 0.15; wallReflecti

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LRR` | 102 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`RASModel.H`](../../../09-turbulence-transport/files/88/rasmodel.h--88056730872d.md)
- [`ReynoldsStress.H`](../../../09-turbulence-transport/files/98/reynoldsstress.h--98737ce9aa06.md)
- [`LRR.C`](../../../09-turbulence-transport/files/5a/lrr.c--5a06382e202c.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/0c/compressiblemomentumtransportmodels.c--0c9c2be0db68.md)
- [src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/8e/incompressiblemomentumtransportmodels.c--8ef656aa90b7.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/LRR/LRR.C](../../../09-turbulence-transport/files/5a/lrr.c--5a06382e202c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
