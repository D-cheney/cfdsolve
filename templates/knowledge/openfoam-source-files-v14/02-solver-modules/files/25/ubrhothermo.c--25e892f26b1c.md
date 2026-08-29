---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-25e892f26b1c"
title: "OpenFOAM 14 源码解析：ubRhoThermo.C"
summary: "该文件实现 `ubRhoThermo` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/XiFluid/ubRhoThermo/ubRhoThermo.C"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：ubRhoThermo.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/XiFluid/ubRhoThermo/ubRhoThermo.C`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：554 行
- 文件标识：`25e892f26b1c`

## 2. 功能说明

该文件实现 `ubRhoThermo` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：模块化求解器实现。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::ubRhoThermo::properties` | 104 |
| `Foam::ubRhoThermo::mesh` | 117 |
| `Foam::ubRhoThermo::phaseName` | 123 |
| `Foam::ubRhoThermo::mixtureName` | 129 |
| `Foam::ubRhoThermo::thermoName` | 136 |
| `Foam::ubRhoThermo::correct` | 143 |
| `Foam::ubRhoThermo::prompt` | 158 |
| `Foam::ubRhoThermo::reset` | 164 |
| `Foam::ubRhoThermo::W` | 199 |
| `Foam::ubRhoThermo::p` | 213 |
| `Foam::ubRhoThermo::psi` | 225 |
| `Foam::ubRhoThermo::T` | 231 |
| `Foam::ubRhoThermo::he` | 245 |
| `Foam::ubRhoThermo::Cp` | 257 |
| `Foam::ubRhoThermo::Cv` | 263 |
| `Foam::ubRhoThermo::Cpv` | 269 |
| `Foam::ubRhoThermo::rho` | 275 |
| `Foam::ubRhoThermo::correctRho` | 293 |
| `Foam::ubRhoThermo::hs` | 370 |
| `Foam::ubRhoThermo::ha` | 420 |
| `Foam::ubRhoThermo::The` | 504 |
| `Foam::ubRhoThermo::mu` | 540 |
| `Foam::ubRhoThermo::kappa` | 546 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`ubRhoThermo.H`](../../../02-solver-modules/files/e5/ubrhothermo.h--e5f0c905448b.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
