---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2b5eecc42fc2"
title: "OpenFOAM 14 源码解析：JONSWAP.H"
summary: "该文件声明或实现 `JONSWAP`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/waves/waveModels/irregular/waveSpectra/JONSWAP/JONSWAP.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：JONSWAP.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/waves/waveModels/irregular/waveSpectra/JONSWAP/JONSWAP.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：162 行
- 文件标识：`2b5eecc42fc2`

## 2. 功能说明

该文件声明或实现 `JONSWAP`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：JONSWAP wave spectrum. This is similar to the Pierson-Moskowitz spectrum, but with an additional empirical correction to account for the fetch (distance to the lee shore). References: \verbatim Hasselmann, K., Barnett, T. P., Bouws, E., Carlson, H., Cartwright, \\ D. E., Enke, K., ... & Walden, H. (1973). Measurements of wind-wave growth and swell decay during the Joint \\ North Sea Wave Project (JONSWAP). Ergaenzungsheft zur Deutschen Hydrographischen Zeitschrift, Reihe A. \endverbatim \verbatim Stewart, R. H. (2008). Introduction to physical oceanography. Robert H. Stewart. \endverbatim Usage \table Property | Description | Required? | Default U10 | The air speed 10 metres above the \\ surface [m/s] | yes | F | The fetch (distance from the lee \\ shore) [m] | yes | gamma | Peaked-ness parameter | no | 3.3 \endtable Example specification: \verbatim spectrum JONSWAP; JONSWAP { U10 10; F 

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `JONSWAP` | 97 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`waveSpectrum.H`](../../../17-other-libraries/files/f9/wavespectrum.h--f94d9c802ac4.md)

## 8. 直接上层引用

- [src/waves/waveModels/irregular/waveSpectra/JONSWAP/JONSWAP.C](../../../17-other-libraries/files/67/jonswap.c--67b904a9cf6c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
