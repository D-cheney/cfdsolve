---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-56339a6059d7"
title: "OpenFOAM 14 源码解析：anisotropic.H"
summary: "该文件声明或实现 `anisotropic`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/solid/anisotropic/anisotropic.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：anisotropic.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/solid/anisotropic/anisotropic.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：243 行
- 文件标识：`56339a6059d7`

## 2. 功能说明

该文件声明或实现 `anisotropic`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：Solid thermophysical transport model for anisotropic thermal conductivity The anisotropic thermal conductivity field is evaluated from the solid material anisotropic kappa specified in the physicalProperties dictionary transformed into the global coordinate system using default coordinate system and optionally additional coordinate systems specified per-zone in the thermophysicalTransport dictionary. If the coordinate transformed kappa does not align exactly with the boundary because the patch face orientations do not conform to the coordinate system exactly it may be beneficial for convergence and accuracy to enforce alignment at the boundary by setting the optional \c boundaryAligned to true. Usage Example of the anisotropic thermal conductivity specification in thermophysicalTransport with two zone-based coordinate systems in addition to the default: \verbatim model anisotropic; // Fo

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `anisotropic` | 122 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`solidThermophysicalTransportModel.H`](../../../09-turbulence-transport/files/23/solidthermophysicaltransportmodel.h--231555985b91.md)
- [`coordinateSystem.H`](../../../07-mesh-geometry/files/7d/coordinatesystem.h--7d8486f45faa.md)
- [`PtrDictionary.H`](../../../04-core-runtime/files/a9/ptrdictionary.h--a997693df97a.md)
- [`MeshObjects.H`](../../../04-core-runtime/files/63/meshobjects.h--6336979d5381.md)
- [`anisotropic.C`](../../../09-turbulence-transport/files/ff/anisotropic.c--ff2a378e4c8e.md)

## 8. 直接上层引用

- [src/ThermophysicalTransportModels/phaseSolid/phaseSolidThermophysicalTransportModels.C](../../../09-turbulence-transport/files/81/phasesolidthermophysicaltransportmodels.c--815751a406a3.md)
- [src/ThermophysicalTransportModels/solid/anisotropic/anisotropic.C](../../../09-turbulence-transport/files/ff/anisotropic.c--ff2a378e4c8e.md)
- [src/ThermophysicalTransportModels/solid/solidThermophysicalTransportModels.C](../../../09-turbulence-transport/files/6b/solidthermophysicaltransportmodels.c--6b1b21a7917b.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
