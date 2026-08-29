---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6ba2e32c132f"
title: "OpenFOAM 14 源码解析：kOmegaSSTSato.H"
summary: "该文件声明或实现 `kOmegaSSTSato`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/phaseCompressible/RAS/kOmegaSSTSato/kOmegaSSTSato.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：kOmegaSSTSato.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/phaseCompressible/RAS/kOmegaSSTSato/kOmegaSSTSato.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：226 行
- 文件标识：`6ba2e32c132f`

## 2. 功能说明

该文件声明或实现 `kOmegaSSTSato`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Implementation of the k-omega-SST turbulence model for dispersed bubbly flows with Sato (1981) bubble induced turbulent viscosity model. Bubble induced turbulent viscosity model described in: \verbatim Sato, Y., Sadatomi, M. "Momentum and heat transfer in two-phase bubble flow - I, Theory" International Journal of Multiphase FLow 7, pp. 167-177, 1981. \endverbatim Turbulence model described in: \verbatim Menter, F., Esch, T. "Elements of Industrial Heat Transfer Prediction" 16th Brazilian Congress of Mechanical Engineering (COBEM), Nov. 2001 \endverbatim with the addition of the optional F3 term for rough walls from \verbatim Hellsten, A. "Some Improvements in Menter’s k-omega-SST turbulence model" 29th AIAA Fluid Dynamics Conference, AIAA-98-2554, June 1998. \endverbatim Note that this implementation is written in terms of alpha diffusion coefficients rather than the more traditional si

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `kOmegaSSTSato` | 121 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`kOmegaSST.H`](../../../09-turbulence-transport/files/61/komegasst.h--6149a32f6f70.md)
- [`phaseSystem.H`](../../../02-solver-modules/files/78/phasesystem.h--78ffb3c63d36.md)
- [`hashedWordList.H`](../../../04-core-runtime/files/1f/hashedwordlist.h--1f1f3bb79433.md)
- [`kOmegaSSTSato.C`](../../../09-turbulence-transport/files/06/komegasstsato.c--065c807d3700.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/momentumTransportModels/momentumTransportModels.C](../../../02-solver-modules/files/5a/momentumtransportmodels.c--5ac150b956b3.md)
- [src/MomentumTransportModels/phaseCompressible/RAS/kOmegaSSTSato/kOmegaSSTSato.C](../../../09-turbulence-transport/files/06/komegasstsato.c--065c807d3700.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
