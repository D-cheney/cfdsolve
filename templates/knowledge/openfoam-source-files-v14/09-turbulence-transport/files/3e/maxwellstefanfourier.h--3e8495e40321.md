---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3e8495e40321"
title: "OpenFOAM 14 源码解析：MaxwellStefanFourier.H"
summary: "该文件声明或实现 `MaxwellStefanFourier`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/fluid/laminar/MaxwellStefanFourier/MaxwellStefanFourier.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：MaxwellStefanFourier.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/fluid/laminar/MaxwellStefanFourier/MaxwellStefanFourier.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：165 行
- 文件标识：`3e8495e40321`

## 2. 功能说明

该文件声明或实现 `MaxwellStefanFourier`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：Multi-component Maxwell Stefan generalised Fick's law diffusion coefficients and Fourier based temperature gradient heat flux model with optional Soret thermal diffusion of species for laminar flow. The binary mass diffusion coefficients are specified as Function2<scalar>s of pressure and temperature but independent of composition. The heat flux source is implemented as an implicit energy correction to the temperature gradient based flux source. At convergence the energy correction is 0. Usage \verbatim laminar { model MaxwellStefanFourier; D // [m^2/s] { O2-O2 1e-2; O3-O3 5e-2; N2-N2 1e-2; O3-O2 5e-2; O3-N2 5e-2; O2-N2 1e-2; } DT // [kg/m/s] Optional { O2 1e-2; O3 5e-2; N2 1e-2; } } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `MaxwellStefanFourier` | 91 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`MaxwellStefan.H`](../../../09-turbulence-transport/files/fb/maxwellstefan.h--fb966fa1f415.md)
- [`unityLewisFourier.H`](../../../09-turbulence-transport/files/bd/unitylewisfourier.h--bdcfac03200f.md)
- [`MaxwellStefanFourier.C`](../../../09-turbulence-transport/files/51/maxwellstefanfourier.c--5131a46970f4.md)

## 8. 直接上层引用

- [src/ThermophysicalTransportModels/fluid/laminar/MaxwellStefanFourier/MaxwellStefanFourier.C](../../../09-turbulence-transport/files/51/maxwellstefanfourier.c--5131a46970f4.md)
- [src/ThermophysicalTransportModels/fluidMulticomponentThermo/fluidMulticomponentThermophysicalTransportModels.C](../../../09-turbulence-transport/files/95/fluidmulticomponentthermophysicaltransportmodels.c--9594b1652741.md)
- [src/ThermophysicalTransportModels/phaseFluidMulticomponentThermo/phaseFluidMulticomponentThermophysicalTransportModels.C](../../../09-turbulence-transport/files/d2/phasefluidmulticomponentthermophysicaltransportmodels.c--d216f0bfdb50.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
