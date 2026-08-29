---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fc47c7e6a19b"
title: "OpenFOAM 14 源码解析：Casson.H"
summary: "该文件声明或实现 `Casson`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/Casson/Casson.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：Casson.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/Casson/Casson.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：140 行
- 文件标识：`fc47c7e6a19b`

## 2. 功能说明

该文件声明或实现 `Casson`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Casson generalised Newtonian viscosity model References: \verbatim Casson, N. (1959). Rheology of disperse systems. In Proceedings of a Conference Organised by the British Society of Rheology. Pergamon Press, New York. Fournier, R. L. (2011). Basic transport phenomena in biomedical engineering. CRC Press. \endverbatim Example specification for blood: \verbatim viscosityModel Casson; m 3.934986e-6; tau0 2.9032e-6; nuMax 13.3333e-6; nuMin 3.9047e-6; \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Casson` | 81 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`strainRateViscosityModel.H`](../../../09-turbulence-transport/files/7e/strainrateviscositymodel.h--7ea2bcf00c6b.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/Casson/Casson.C](../../../09-turbulence-transport/files/76/casson.c--76ec53ea789c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
