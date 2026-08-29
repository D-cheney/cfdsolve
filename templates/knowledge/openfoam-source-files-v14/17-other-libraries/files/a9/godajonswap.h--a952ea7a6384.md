---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a952ea7a6384"
title: "OpenFOAM 14 源码解析：GodaJONSWAP.H"
summary: "该文件声明或实现 `GodaJONSWAP`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/waves/waveModels/irregular/waveSpectra/GodaJONSWAP/GodaJONSWAP.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：GodaJONSWAP.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/waves/waveModels/irregular/waveSpectra/GodaJONSWAP/GodaJONSWAP.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：161 行
- 文件标识：`a952ea7a6384`

## 2. 功能说明

该文件声明或实现 `GodaJONSWAP`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：GodaJONSWAP wave spectrum. This is an alternative, approximate parameterisation of the JONSWAP spectrum, in which the significant wave height and period are specified instead of the wind speed and fetch. References: \verbatim Goda, Y. (1988). Statistical variability of sea state parameters as a function of wave spectrum. Coastal Engineering in Japan, 31(1), 39-52. \endverbatim \verbatim Goda, Y. (2010). Random seas and design of maritime structures. World Scientific Publishing Company. \endverbatim See page 29 of the second reference for a convenient formulation. Usage \table Property | Description | Required? | Default Hs | The significant wave height [m] | yes | Tp | The significant wave period [s] | yes | gamma | Peaked-ness parameter | no | 3.3 \endtable Example specification: \verbatim spectrum GodaJONSWAP; GodaJONSWAP { Hs 2; Ts 6; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `GodaJONSWAP` | 96 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`waveSpectrum.H`](../../../17-other-libraries/files/f9/wavespectrum.h--f94d9c802ac4.md)

## 8. 直接上层引用

- [src/waves/waveModels/irregular/waveSpectra/GodaJONSWAP/GodaJONSWAP.C](../../../17-other-libraries/files/8d/godajonswap.c--8db6a7a522bf.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
