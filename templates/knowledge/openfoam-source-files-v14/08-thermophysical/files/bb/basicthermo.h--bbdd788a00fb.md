---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-bbdd788a00fb"
title: "OpenFOAM 14 源码解析：BasicThermo.H"
summary: "该文件声明或实现 `BasicThermo`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/basic/basicThermo/BasicThermo.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：BasicThermo.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/basic/basicThermo/BasicThermo.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：480 行
- 文件标识：`bbdd788a00fb`

## 2. 功能说明

该文件声明或实现 `BasicThermo`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Thermo implementation and storage of energy and heat capacities. Provides overloads of the functions defined in the basic thermo type that depend on the primitive thermo model.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `BasicThermo` | 65 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`physicalProperties.H`](../../../08-thermophysical/files/f7/physicalproperties.h--f79cf56c6a0d.md)
- [`uniformGeometricFields.H`](../../../05-finite-volume/files/a5/uniformgeometricfields.h--a50858295889.md)
- [`BasicThermo.C`](../../../08-thermophysical/files/87/basicthermo.c--87065cf422b3.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/PsiuMulticomponentThermo.H](../../../17-other-libraries/files/0a/psiumulticomponentthermo.h--0aed4917414a.md)
- [src/thermophysicalModels/basic/basicThermo/BasicThermo.C](../../../08-thermophysical/files/87/basicthermo.c--87065cf422b3.md)
- [src/thermophysicalModels/basic/basicThermo/BasicThermoName.C](../../../08-thermophysical/files/2c/basicthermoname.c--2c797808b9b0.md)
- [src/thermophysicalModels/basic/liquidThermo/LiquidThermo.H](../../../08-thermophysical/files/f4/liquidthermo.h--f41db13d1137.md)
- [src/thermophysicalModels/basic/psiThermo/PsiThermo.H](../../../08-thermophysical/files/57/psithermo.h--576143cd8bf2.md)
- [src/thermophysicalModels/basic/rhoFluidThermo/RhoFluidThermo.H](../../../08-thermophysical/files/26/rhofluidthermo.h--2685548fc62f.md)
- [src/thermophysicalModels/multicomponentThermo/fluidMulticomponentThermo/FluidMulticomponentThermo.H](../../../08-thermophysical/files/9a/fluidmulticomponentthermo.h--9a69104b7994.md)
- [src/thermophysicalModels/multicomponentThermo/multicomponentThermo/MulticomponentThermo.H](../../../08-thermophysical/files/c7/multicomponentthermo.h--c7fcbbf76845.md)
- [src/thermophysicalModels/solidThermo/solidThermo/SolidThermo.H](../../../08-thermophysical/files/88/solidthermo.h--880c5de2b7b5.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
