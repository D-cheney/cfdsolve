---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fd9664778883"
title: "OpenFOAM 14 源码解析：strainRateViscosityModel.C"
summary: "该文件为“湍流与输运”提供 `strainRateViscosityModel` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/strainRateViscosityModel/strainRateViscosityModel.C"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：strainRateViscosityModel.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/strainRateViscosityModel/strainRateViscosityModel.C`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：99 行
- 文件标识：`fd9664778883`

## 2. 功能说明

该文件为“湍流与输运”提供 `strainRateViscosityModel` 相关接口、模板实例或支撑定义。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。
2. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`strainRateViscosityModel.H`](../../../09-turbulence-transport/files/7e/strainrateviscositymodel.h--7ea2bcf00c6b.md)
- [`fvcGrad.H`](../../../05-finite-volume/files/d3/fvcgrad.h--d32a079c3240.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
