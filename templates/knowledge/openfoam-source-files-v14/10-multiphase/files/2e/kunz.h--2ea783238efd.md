---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2ea783238efd"
title: "OpenFOAM 14 源码解析：Kunz.H"
summary: "该文件声明或实现 `Kunz`，属于“多相与界面”模块。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/compressibleCavitation/Kunz/Kunz.H"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：Kunz.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/compressibleCavitation/Kunz/Kunz.H`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：179 行
- 文件标识：`2ea783238efd`

## 2. 功能说明

该文件声明或实现 `Kunz`，属于“多相与界面”模块。

中文导航角色：两相流与界面模型。

上游说明：Kunz cavitation model. Slightly modified so that the condensation term is switched off when the pressure is less than the saturation vapour pressure. This change allows the condensation term to be formulated as a coefficient multiplying (p - p_sat) so that it can be included as an implicit term in the pressure equation. Reference: \verbatim Kunz, R. F., Boger, D. A., Stinebring, D. R., Chyczewski, T. S., Lindau, J. W., Gibeling, H. J., ... & Govindan, T. (2000). A preconditioned Navier–Stokes method for two-phase flows with application to cavitation prediction. Computers & Fluids, 29(8), 849-875. \endverbatim Usage: \table Property | Description | Required | Default value liquid | Name of the liquid phase | yes | pSat | Saturation vapor pressure | yes | Uinf | Free-stream velocity | yes | tInf | Vaporisation/condensation time scale | yes | Cv | Vapourisation rate coefficient | yes | Cc |

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Kunz` | 98 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- `cavitationModel.H`

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
