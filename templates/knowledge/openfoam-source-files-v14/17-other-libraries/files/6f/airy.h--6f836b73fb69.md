---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-6f836b73fb69"
title: "OpenFOAM 14 源码解析：Airy.H"
summary: "该文件声明或实现 `Airy`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/waves/waveModels/Airy/Airy.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：Airy.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/waves/waveModels/Airy/Airy.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：227 行
- 文件标识：`6f836b73fb69`

## 2. 功能说明

该文件声明或实现 `Airy`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：First-order wave model. Reference: \verbatim Stokes, G.G. (1847) On the theory of oscillatory waves. Transactions of the Cambridge Philosophical Society, 8, 441. \endverbatim See the leading terms of equations 18 and 19. Usage \table Property | Description | Required? | Default depth | The water depth [m] | no | great amplitude | The amplitude [m] | yes | length | The wave length [m] | if period not set | period | The wave period [s] | if length not set | phase | The phase offset [rad] | yes | \endtable Example specification in constant/waveProperties: \verbatim waves ( Airy { length 40; amplitude 0.5; phase 0; } ); \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Airy` | 89 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`waveModel.H`](../../../17-other-libraries/files/66/wavemodel.h--66f554bb0067.md)
- [`AiryCoeffs.H`](../../../17-other-libraries/files/59/airycoeffs.h--59bed4077dff.md)
- [`AiryI.H`](../../../17-other-libraries/files/14/airyi.h--14331ad0cb0f.md)

## 8. 直接上层引用

- [src/waves/waveModels/Airy/Airy.C](../../../17-other-libraries/files/7f/airy.c--7f75be160484.md)
- [src/waves/waveModels/Airy/AiryI.H](../../../17-other-libraries/files/14/airyi.h--14331ad0cb0f.md)
- [src/waves/waveModels/Stokes2/Stokes2.H](../../../17-other-libraries/files/71/stokes2.h--71f1a5c30c86.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
