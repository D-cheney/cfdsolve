---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-98737ce9aa06"
title: "OpenFOAM 14 源码解析：ReynoldsStress.H"
summary: "该文件声明或实现 `ReynoldsStress`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/ReynoldsStress/ReynoldsStress.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：ReynoldsStress.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/ReynoldsStress/ReynoldsStress.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：183 行
- 文件标识：`98737ce9aa06`

## 2. 功能说明

该文件声明或实现 `ReynoldsStress`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Reynolds-stress turbulence model base class

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ReynoldsStress` | 52 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`ReynoldsStress.C`](../../../09-turbulence-transport/files/7e/reynoldsstress.c--7e31133ec904.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/LES/DeardorffDiffStress/DeardorffDiffStress.H](../../../09-turbulence-transport/files/24/deardorffdiffstress.h--24721439ccc4.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/LRR/LRR.H](../../../09-turbulence-transport/files/a4/lrr.h--a4cdcb2712fb.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/SSG/SSG.H](../../../09-turbulence-transport/files/84/ssg.h--8425bb555165.md)
- [src/MomentumTransportModels/momentumTransportModels/ReynoldsStress/ReynoldsStress.C](../../../09-turbulence-transport/files/7e/reynoldsstress.c--7e31133ec904.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
