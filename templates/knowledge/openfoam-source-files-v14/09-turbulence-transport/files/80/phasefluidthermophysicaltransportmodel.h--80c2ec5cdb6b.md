---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-80c2ec5cdb6b"
title: "OpenFOAM 14 源码解析：phaseFluidThermophysicalTransportModel.H"
summary: "该文件为“湍流与输运”提供 `phaseFluidThermophysicalTransportModel` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/phaseFluidThermo/phaseFluidThermophysicalTransportModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：phaseFluidThermophysicalTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/phaseFluidThermo/phaseFluidThermophysicalTransportModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：88 行
- 文件标识：`80c2ec5cdb6b`

## 2. 功能说明

该文件为“湍流与输运”提供 `phaseFluidThermophysicalTransportModel` 相关接口、模板实例或支撑定义。

中文导航角色：热物性输运模型。

上游说明：Typedefs for laminar, RAS and LES thermophysical transport models for fluidThermo flow.

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`fluidThermo.H`](../../../08-thermophysical/files/9e/fluidthermo.h--9e58ccc4fa8c.md)
- [`PhaseThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/75/phasethermophysicaltransportmodel.h--75091d8323e3.md)
- [`laminarThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/0e/laminarthermophysicaltransportmodel.h--0e5ff1789034.md)
- [`RASThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/46/rasthermophysicaltransportmodel.h--469acbe74f35.md)
- [`LESThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/16/lesthermophysicaltransportmodel.h--16a0fa7a4b9b.md)
- [`phaseCompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/cc/phasecompressiblemomentumtransportmodel.h--cc1b40028f94.md)

## 8. 直接上层引用

- [src/ThermophysicalTransportModels/phaseFluidThermo/phaseFluidThermophysicalTransportModels.H](../../../09-turbulence-transport/files/62/phasefluidthermophysicaltransportmodels.h--627e6c835f86.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
