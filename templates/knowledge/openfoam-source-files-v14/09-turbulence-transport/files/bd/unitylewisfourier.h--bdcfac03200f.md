---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-bdcfac03200f"
title: "OpenFOAM 14 源码解析：unityLewisFourier.H"
summary: "该文件实现 `unityLewisFourier` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/fluid/laminar/unityLewisFourier/unityLewisFourier.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：unityLewisFourier.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/fluid/laminar/unityLewisFourier/unityLewisFourier.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：203 行
- 文件标识：`bdcfac03200f`

## 2. 功能说明

该文件实现 `unityLewisFourier` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：热物性输运模型。

上游说明：unityLewisFourier's energy gradient heat flux model for laminar flow. Specie fluxes are computed assuming a unity turbulent Lewis number.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `unityLewisFourier` | 57 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`laminarThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/0e/laminarthermophysicaltransportmodel.h--0e5ff1789034.md)
- [`unityLewisFourier.C`](../../../09-turbulence-transport/files/2c/unitylewisfourier.c--2cb02be5e8e9.md)

## 8. 直接上层引用

- [applications/modules/film/filmThermophysicalTransportModels/filmThermophysicalTransportModels.C](../../../02-solver-modules/files/e4/filmthermophysicaltransportmodels.c--e4ea7022a15e.md)
- [src/ThermophysicalTransportModels/fluid/laminar/FickianFourier/FickianFourier.H](../../../09-turbulence-transport/files/40/fickianfourier.h--403a183ec054.md)
- [src/ThermophysicalTransportModels/fluid/laminar/laminarThermophysicalTransportModel/laminarThermophysicalTransportModel.C](../../../09-turbulence-transport/files/3a/laminarthermophysicaltransportmodel.c--3ab761857383.md)
- [src/ThermophysicalTransportModels/fluid/laminar/MaxwellStefanFourier/MaxwellStefanFourier.H](../../../09-turbulence-transport/files/3e/maxwellstefanfourier.h--3e8495e40321.md)
- [src/ThermophysicalTransportModels/fluid/laminar/unityLewisFourier/unityLewisFourier.C](../../../09-turbulence-transport/files/2c/unitylewisfourier.c--2cb02be5e8e9.md)
- [src/ThermophysicalTransportModels/fluidMulticomponentThermo/fluidMulticomponentThermophysicalTransportModels.C](../../../09-turbulence-transport/files/95/fluidmulticomponentthermophysicaltransportmodels.c--9594b1652741.md)
- [src/ThermophysicalTransportModels/fluidThermo/fluidThermoThermophysicalTransportModels.C](../../../09-turbulence-transport/files/44/fluidthermothermophysicaltransportmodels.c--4493e8e40b13.md)
- [src/ThermophysicalTransportModels/phaseFluidMulticomponentThermo/phaseFluidMulticomponentThermophysicalTransportModels.C](../../../09-turbulence-transport/files/d2/phasefluidmulticomponentthermophysicaltransportmodels.c--d216f0bfdb50.md)
- [src/ThermophysicalTransportModels/phaseFluidThermo/phaseFluidThermophysicalTransportModels.C](../../../09-turbulence-transport/files/e3/phasefluidthermophysicaltransportmodels.c--e3621cfaa654.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
