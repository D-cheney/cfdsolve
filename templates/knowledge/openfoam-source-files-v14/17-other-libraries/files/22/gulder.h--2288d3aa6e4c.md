---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2288d3aa6e4c"
title: "OpenFOAM 14 源码解析：Gulder.H"
summary: "该文件声明或实现 `Gulder`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/legacy/combustion/PDRFoam/laminarFlameSpeed/Gulder/Gulder.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：Gulder.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/legacy/combustion/PDRFoam/laminarFlameSpeed/Gulder/Gulder.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：158 行
- 文件标识：`2288d3aa6e4c`

## 2. 功能说明

该文件声明或实现 `Gulder`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Laminar flame speed obtained from Gulder's correlation with optional support for EGR (exhaust gas recirculation) if the \c egr mass-fraction field is available. Reference: \verbatim Gülder, Ö. L. (1984). Correlations of laminar combustion data for alternative SI engine fuels (No. 841000). SAE technical paper. \endverbatim Note: the EGR \c f coefficient multiplies the \c egr mass-fraction, not the mole-fraction as stated in the paper so must be set accordingly.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Gulder` | 69 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- `laminarFlameSpeed.H`

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
