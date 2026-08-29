---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-1dd8c8cd6a5d"
title: "OpenFOAM 14 源码解析：PDRFoam.C"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `PDRFoam` 对应的工作流。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/legacy/combustion/PDRFoam/PDRFoam.C"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：PDRFoam.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/legacy/combustion/PDRFoam/PDRFoam.C`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：193 行
- 文件标识：`1dd8c8cd6a5d`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `PDRFoam` 对应的工作流。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Solver for compressible premixed/partially-premixed combustion with turbulence modelling. Combusting RANS code using the b-Xi two-equation model. Xi may be obtained by either the solution of the Xi transport equation or from an algebraic expression. Both approaches are based on Gulder's flame speed correlation which has been shown to be appropriate by comparison with the results from the spectral model. Strain effects are incorporated directly into the Xi equation but not in the algebraic approximation. Further work need to be done on this issue, particularly regarding the enhanced removal rate caused by flame compression. Analysis using results of the spectral model will be required. For cases involving very lean Propane flames or other flames which are very strain-sensitive, a transport equation for the laminar flame speed is present. This equation is derived using heuristic arguments 

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `main` | 109 |

## 5. 算法与控制流程

1. **程序入口**：解析命令行和案例环境，然后按既定生命周期调度核心对象。
2. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
3. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。

## 6. 数学与离散关系

- 压力校正：$\mathbf{U}=\mathbf{H}/A-(1/A)\nabla p$，并由连续性得到压力泊松方程。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`argList.H`](../../../04-core-runtime/files/fd/arglist.h--fd2ea9b60b1a.md)
- [`timeSelector.H`](../../../04-core-runtime/files/92/timeselector.h--928367fb3c5d.md)
- [`psiuMulticomponentThermo.H`](../../../17-other-libraries/files/69/psiumulticomponentthermo.h--699b22124b67.md)
- [`compressibleMomentumTransportModels.H`](../../../09-turbulence-transport/files/07/compressiblemomentumtransportmodels.h--0745b4a591f5.md)
- [`RASThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/46/rasthermophysicaltransportmodel.h--469acbe74f35.md)
- [`unityLewisEddyDiffusivity.H`](../../../09-turbulence-transport/files/b2/unitylewiseddydiffusivity.h--b2017b83ec08.md)
- `laminarFlameSpeed.H`
- `XiModel.H`
- [`PDRDragModel.H`](../../../17-other-libraries/files/8f/pdrdragmodel.h--8fe618ecfdae.md)
- [`ignition.H`](../../../17-other-libraries/files/68/ignition.h--688044627baa.md)
- [`pimpleControl.H`](../../../05-finite-volume/files/3f/pimplecontrol.h--3f53630c7d30.md)
- [`pressureReference.H`](../../../05-finite-volume/files/8a/pressurereference.h--8adb6fe34768.md)
- [`findRefCell.H`](../../../05-finite-volume/files/a8/findrefcell.h--a87d0d6cc087.md)
- [`constrainPressure.H`](../../../05-finite-volume/files/02/constrainpressure.h--0273510552c5.md)
- [`constrainHbyA.H`](../../../05-finite-volume/files/50/constrainhbya.h--50ce200e184c.md)
- [`adjustPhi.H`](../../../05-finite-volume/files/3e/adjustphi.h--3e2ba0e700bb.md)
- [`uniformDimensionedFields.H`](../../../05-finite-volume/files/4e/uniformdimensionedfields.h--4e5431e912f3.md)
- [`fvModels.H`](../../../05-finite-volume/files/60/fvmodels.h--6040b512bd89.md)
- [`fvConstraints.H`](../../../05-finite-volume/files/68/fvconstraints.h--68dca4db4ada.md)
- [`fvcDdt.H`](../../../05-finite-volume/files/78/fvcddt.h--78d28871151f.md)
- [`fvcGrad.H`](../../../05-finite-volume/files/d3/fvcgrad.h--d32a079c3240.md)
- [`fvcFlux.H`](../../../05-finite-volume/files/c9/fvcflux.h--c964e1bdde0c.md)
- [`fvcReconstruct.H`](../../../05-finite-volume/files/bc/fvcreconstruct.h--bcc553314882.md)
- [`fvcMeshPhi.H`](../../../05-finite-volume/files/ea/fvcmeshphi.h--eae2819d7090.md)
- [`fvmDdt.H`](../../../05-finite-volume/files/be/fvmddt.h--bee4ba370e19.md)
- [`fvmDiv.H`](../../../05-finite-volume/files/32/fvmdiv.h--32306f8dc3a6.md)
- [`fvmLaplacian.H`](../../../05-finite-volume/files/99/fvmlaplacian.h--99705f4e6ce0.md)
- [`postProcess.H`](../../../04-core-runtime/files/13/postprocess.h--13b7c061d102.md)
- [`setRootCase.H`](../../../04-core-runtime/files/95/setrootcase.h--95a4d6ea30cd.md)
- [`createTime.H`](../../../04-core-runtime/files/ff/createtime.h--ff253fee129e.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
