---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-469acbe74f35"
title: "OpenFOAM 14 源码解析：RASThermophysicalTransportModel.H"
summary: "该文件声明或实现 `RASThermophysicalTransportModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/fluid/turbulence/RAS/RASThermophysicalTransportModel/RASThermophysicalTransportModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：RASThermophysicalTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/fluid/turbulence/RAS/RASThermophysicalTransportModel/RASThermophysicalTransportModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：178 行
- 文件标识：`469acbe74f35`

## 2. 功能说明

该文件声明或实现 `RASThermophysicalTransportModel`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：Templated abstract base class for RAS thermophysical transport models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `RASThermophysicalTransportModel` | 54 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`ThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/9d/thermophysicaltransportmodel.h--9dc2721a261c.md)
- [`RASThermophysicalTransportModel.C`](../../../09-turbulence-transport/files/bd/rasthermophysicaltransportmodel.c--bd0b964b6924.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/PDRFoam.C](../../../17-other-libraries/files/1d/pdrfoam.c--1dd8c8cd6a5d.md)
- [src/ThermophysicalTransportModels/fluid/turbulence/RAS/RASThermophysicalTransportModel/RASThermophysicalTransportModel.C](../../../09-turbulence-transport/files/bd/rasthermophysicaltransportmodel.c--bd0b964b6924.md)
- [src/ThermophysicalTransportModels/fluidMulticomponentThermo/fluidMulticomponentThermophysicalTransportModel.H](../../../09-turbulence-transport/files/13/fluidmulticomponentthermophysicaltransportmodel.h--13891846bd32.md)
- [src/ThermophysicalTransportModels/fluidThermo/fluidThermoThermophysicalTransportModel.H](../../../09-turbulence-transport/files/a3/fluidthermothermophysicaltransportmodel.h--a324c10ffaa1.md)
- [src/ThermophysicalTransportModels/phaseFluidMulticomponentThermo/phaseFluidMulticomponentThermophysicalTransportModel.H](../../../09-turbulence-transport/files/ca/phasefluidmulticomponentthermophysicaltransportmodel.h--ca46d03d3c79.md)
- [src/ThermophysicalTransportModels/phaseFluidThermo/phaseFluidThermophysicalTransportModel.H](../../../09-turbulence-transport/files/80/phasefluidthermophysicaltransportmodel.h--80c2ec5cdb6b.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
