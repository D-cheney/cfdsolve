---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e1ee77278507"
title: "OpenFOAM 14 源码解析：solidThermalEquilibrium.C"
summary: "该文件实现 `solidThermalEquilibrium` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/solidThermalEquilibrium/solidThermalEquilibrium.C"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：solidThermalEquilibrium.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/solidThermalEquilibrium/solidThermalEquilibrium.C`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：247 行
- 文件标识：`e1ee77278507`

## 2. 功能说明

该文件实现 `solidThermalEquilibrium` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积物理源项。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::fv::solidThermalEquilibrium::readCoeffs` | 58 |
| `Foam::fv::solidThermalEquilibrium::solidAlpha` | 65 |
| `Foam::fv::solidThermalEquilibrium::solidThermo` | 94 |
| `Foam::fv::solidThermalEquilibrium::addSupFields` | 141 |
| `Foam::fv::solidThermalEquilibrium::addSup` | 152 |
| `Foam::fv::solidThermalEquilibrium::movePoints` | 207 |
| `Foam::fv::solidThermalEquilibrium::topoChange` | 213 |
| `Foam::fv::solidThermalEquilibrium::mapMesh` | 220 |
| `Foam::fv::solidThermalEquilibrium::distribute` | 224 |
| `Foam::fv::solidThermalEquilibrium::read` | 231 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **隐式时间项**：把时间导数装配到矩阵对角与源项，参与线性方程求解。
4. **隐式扩散项**：使用面扩散系数和法向梯度离散拉普拉斯项。
5. **分布式映射**：依据全局到局部寻址重排和交换数据。
6. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
7. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。

## 6. 数学与离散关系

- 时间项：$\int_V \partial \phi/\partial t\,\mathrm{d}V$。
- 扩散项：$\int_{\partial V}\Gamma\nabla\phi\cdot\mathbf{n}\,\mathrm{d}S$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`solidThermalEquilibrium.H`](../../../12-boundaries-sources/files/98/solidthermalequilibrium.h--98e7c3da9cbc.md)
- [`fvmDdt.H`](../../../05-finite-volume/files/be/fvmddt.h--bee4ba370e19.md)
- [`fvmLaplacian.H`](../../../05-finite-volume/files/99/fvmlaplacian.h--99705f4e6ce0.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`、`addBackwardCompatibleToRunTimeSelectionTable`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
