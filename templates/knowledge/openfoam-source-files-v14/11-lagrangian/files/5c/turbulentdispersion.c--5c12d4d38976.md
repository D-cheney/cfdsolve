---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5c12d4d38976"
title: "OpenFOAM 14 源码解析：turbulentDispersion.C"
summary: "该文件实现 `turbulentDispersion` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/LagrangianModels/turbulentDispersion/turbulentDispersion.C"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：turbulentDispersion.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/LagrangianModels/turbulentDispersion/turbulentDispersion.C`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：444 行
- 文件标识：`5c12d4d38976`

## 2. 功能说明

该文件实现 `turbulentDispersion` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::Lagrangian::turbulentDispersion::initialiseTurbField` | 59 |
| `Foam::Lagrangian::turbulentDispersion::completeTurbField` | 87 |
| `Foam::Lagrangian::turbulentDispersion::addSupFields` | 176 |
| `Foam::Lagrangian::turbulentDispersion::addsSupToField` | 181 |
| `Foam::Lagrangian::turbulentDispersion::postConstruct` | 196 |
| `Foam::Lagrangian::turbulentDispersion::preAddSup` | 231 |
| `Foam::Lagrangian::turbulentDispersion::addSup` | 390 |
| `Foam::Lagrangian::turbulentDispersion::postAddSup` | 421 |
| `Foam::Lagrangian::turbulentDispersion::writeProcessorState` | 431 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
4. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
5. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
7. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`turbulentDispersion.H`](../../../11-lagrangian/files/d5/turbulentdispersion.h--d5060b9bce77.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)
- [`coupledToConstantDensityFluid.H`](../../../11-lagrangian/files/6e/coupledtoconstantdensityfluid.h--6e28e3ddf497.md)
- [`coupledToFluid.H`](../../../11-lagrangian/files/36/coupledtofluid.h--36b4c77a7f98.md)
- [`standardNormal.H`](../../../04-core-runtime/files/98/standardnormal.h--98bb32a671fd.md)
- [`wallPolyPatch.H`](../../../04-core-runtime/files/db/wallpolypatch.h--db96caab5170.md)
- [`maxLagrangianFieldSources.H`](../../../11-lagrangian/files/6d/maxlagrangianfieldsources.h--6d5aecdcf5f8.md)
- [`NaNLagrangianFieldSources.H`](../../../11-lagrangian/files/6b/nanlagrangianfieldsources.h--6bef9fdb6f20.md)
- [`internalLagrangianFieldSources.H`](../../../11-lagrangian/files/e8/internallagrangianfieldsources.h--e831f35bd67c.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
