---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9ba24c68b032"
title: "OpenFOAM 14 源码解析：rhoTabulated.H"
summary: "该文件声明或实现 `rhoTabulated`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/specie/equationOfState/rhoTabulated/rhoTabulated.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：rhoTabulated.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/specie/equationOfState/rhoTabulated/rhoTabulated.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：289 行
- 文件标识：`9ba24c68b032`

## 2. 功能说明

该文件声明或实现 `rhoTabulated`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Incompressible of equation of state using uniform tabulated density vs pressure and temperature. Thermodynamic contributions derived from tabulated density data are not sufficiently accurate and hence the h, Cp, e, Cv, sp, sv and CpMCv are not implemented. Thus this equation of state should be used in conjunction with hTabulated or eTabulated thermodynamics in which both the energy and heat capacity are tabulated w.r.t. pressure and temperature avoiding the need for equation of state contributions. Usage \table Property | Description rho | Density vs pressure and temperature table \endtable Example of the specification of the equation of state: \verbatim equationOfState { rho { pLow 1e4; pHigh 5e5; Tlow 200; Thigh 1500; values <m> <n> ( (..........) . . . (..........) ); } } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rhoTabulated` | 95 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`UniformTable2.H`](../../../04-core-runtime/files/25/uniformtable2.h--254fd36e56f1.md)
- [`rhoTabulatedI.H`](../../../08-thermophysical/files/77/rhotabulatedi.h--77b676b6873f.md)
- [`rhoTabulated.C`](../../../08-thermophysical/files/48/rhotabulated.c--48fb14ceb7d9.md)

## 8. 直接上层引用

- [src/thermophysicalModels/specie/equationOfState/rhoTabulated/rhoTabulated.C](../../../08-thermophysical/files/48/rhotabulated.c--48fb14ceb7d9.md)
- [src/thermophysicalModels/specie/equationOfState/rhoTabulated/rhoTabulatedI.H](../../../08-thermophysical/files/77/rhotabulatedi.h--77b676b6873f.md)
- [src/thermophysicalModels/specie/include/forTabulated.H](../../../08-thermophysical/files/34/fortabulated.h--34b9ccd302b4.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
