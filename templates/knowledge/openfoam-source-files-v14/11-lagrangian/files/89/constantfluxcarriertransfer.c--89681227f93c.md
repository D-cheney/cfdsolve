---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-89681227f93c"
title: "OpenFOAM 14 源码解析：constantFluxCarrierTransfer.C"
summary: "该文件实现 `readCoeffs`、`Sp`、`addSupType`、`addSupFields` 等过程，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/LagrangianModels/constantFluxCarrierTransfer/constantFluxCarrierTransfer.C"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：constantFluxCarrierTransfer.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/LagrangianModels/constantFluxCarrierTransfer/constantFluxCarrierTransfer.C`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：416 行
- 文件标识：`89681227f93c`

## 2. 功能说明

该文件实现 `readCoeffs`、`Sp`、`addSupType`、`addSupFields` 等过程，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::Lagrangian::constantFluxCarrierTransfer::readCoeffs` | 57 |
| `Foam::Lagrangian::constantFluxCarrierTransfer::Sp` | 84 |
| `Foam::Lagrangian::constantFluxCarrierTransfer::addSupType` | 121 |
| `Foam::Lagrangian::constantFluxCarrierTransfer::addSupFields` | 245 |
| `Foam::Lagrangian::constantFluxCarrierTransfer::addsSupToField` | 254 |
| `Foam::Lagrangian::constantFluxCarrierTransfer::calculate` | 272 |
| `Foam::Lagrangian::constantFluxCarrierTransfer::source` | 325 |
| `Foam::Lagrangian::constantFluxCarrierTransfer::preAddSup` | 343 |
| `Foam::Lagrangian::constantFluxCarrierTransfer::postAddSup` | 387 |
| `Foam::Lagrangian::constantFluxCarrierTransfer::read` | 397 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`LagrangianSubFieldsFwd.H`](../../../11-lagrangian/files/12/lagrangiansubfieldsfwd.h--12be4900f4ed.md)
- [`constantFluxCarrierTransfer.H`](../../../11-lagrangian/files/1d/constantfluxcarriertransfer.h--1df2d957dd2e.md)
- [`addToRunTimeSelectionTable.H`](../../../04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)
- [`coupledToConstantDensityFluid.H`](../../../11-lagrangian/files/6e/coupledtoconstantdensityfluid.h--6e28e3ddf497.md)
- [`massive.H`](../../../11-lagrangian/files/6c/massive.h--6c83956515b9.md)
- [`shaped.H`](../../../11-lagrangian/files/a2/shaped.h--a206041c7f1d.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`、`addToRunTimeSelectionTable`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
