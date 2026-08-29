---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f903427be699"
title: "OpenFOAM 14 源码解析：viscousHeating.C"
summary: "该文件实现 `readCoeffs`、`addSupFields`、`addSup`、`movePoints` 等过程，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/viscousHeating/viscousHeating.C"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：viscousHeating.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/viscousHeating/viscousHeating.C`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：171 行
- 文件标识：`f903427be699`

## 2. 功能说明

该文件实现 `readCoeffs`、`addSupFields`、`addSup`、`movePoints` 等过程，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::fv::viscousHeating::readCoeffs` | 58 |
| `Foam::fv::viscousHeating::addSupFields` | 83 |
| `Foam::fv::viscousHeating::addSup` | 94 |
| `Foam::fv::viscousHeating::movePoints` | 137 |
| `Foam::fv::viscousHeating::topoChange` | 143 |
| `Foam::fv::viscousHeating::mapMesh` | 147 |
| `Foam::fv::viscousHeating::distribute` | 151 |
| `Foam::fv::viscousHeating::read` | 155 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **显式散度**：由面通量求控制体净通量并返回单元场。
3. **分布式映射**：依据全局到局部寻址重排和交换数据。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。

## 6. 数学与离散关系

- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`viscousHeating.H`](../../../12-boundaries-sources/files/16/viscousheating.h--1682304c9ca2.md)
- [`basicThermo.H`](../../../08-thermophysical/files/f6/basicthermo.h--f61d8b7b6dd2.md)
- [`compressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/eb/compressiblemomentumtransportmodel.h--eb183e43a318.md)
- [`fvMatrices.H`](../../../05-finite-volume/files/4d/fvmatrices.h--4d784c209b6a.md)
- [`fvcDiv.H`](../../../05-finite-volume/files/f4/fvcdiv.h--f4f3d94a2b7a.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
