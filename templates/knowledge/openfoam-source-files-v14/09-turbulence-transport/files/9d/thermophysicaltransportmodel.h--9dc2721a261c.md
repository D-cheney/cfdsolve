---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9dc2721a261c"
title: "OpenFOAM 14 源码解析：ThermophysicalTransportModel.H"
summary: "该文件声明或实现 `ThermophysicalTransportModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/fluid/ThermophysicalTransportModel/ThermophysicalTransportModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：ThermophysicalTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/fluid/ThermophysicalTransportModel/ThermophysicalTransportModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：167 行
- 文件标识：`9dc2721a261c`

## 2. 功能说明

该文件声明或实现 `ThermophysicalTransportModel`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：Templated abstract base class for thermophysical transport models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `ThermophysicalTransportModel` | 55 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`fluidThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/5b/fluidthermophysicaltransportmodel.h--5b059a3966c4.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`ThermophysicalTransportModel.C`](../../../09-turbulence-transport/files/aa/thermophysicaltransportmodel.c--aa9ffbf11cdb.md)

## 8. 直接上层引用

- [src/ThermophysicalTransportModels/fluid/laminar/laminarThermophysicalTransportModel/laminarThermophysicalTransportModel.H](../../../09-turbulence-transport/files/0e/laminarthermophysicaltransportmodel.h--0e5ff1789034.md)
- [src/ThermophysicalTransportModels/fluid/PhaseThermophysicalTransportModel/PhaseThermophysicalTransportModel.H](../../../09-turbulence-transport/files/75/phasethermophysicaltransportmodel.h--75091d8323e3.md)
- [src/ThermophysicalTransportModels/fluid/ThermophysicalTransportModel/ThermophysicalTransportModel.C](../../../09-turbulence-transport/files/aa/thermophysicaltransportmodel.c--aa9ffbf11cdb.md)
- [src/ThermophysicalTransportModels/fluid/turbulence/LES/LESThermophysicalTransportModel/LESThermophysicalTransportModel.H](../../../09-turbulence-transport/files/16/lesthermophysicaltransportmodel.h--16a0fa7a4b9b.md)
- [src/ThermophysicalTransportModels/fluid/turbulence/RAS/RASThermophysicalTransportModel/RASThermophysicalTransportModel.H](../../../09-turbulence-transport/files/46/rasthermophysicaltransportmodel.h--469acbe74f35.md)

## 9. 运行时机制

`declareRunTimeNewSelectionTable`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
