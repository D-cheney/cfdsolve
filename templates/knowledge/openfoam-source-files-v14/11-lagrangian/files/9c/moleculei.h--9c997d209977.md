---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9c997d209977"
title: "OpenFOAM 14 源码解析：moleculeI.H"
summary: "该文件实现 `constantProperties`、`molecule`、`checkSiteListSizes`、`setInteractionSiteBools` 等过程，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/molecularDynamics/molecule/moleculeI.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：moleculeI.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/molecularDynamics/molecule/moleculeI.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：611 行
- 文件标识：`9c997d209977`

## 2. 功能说明

该文件实现 `constantProperties`、`molecule`、`checkSiteListSizes`、`setInteractionSiteBools` 等过程，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::molecule::constantProperties::constantProperties` | 35 |
| `Foam::molecule::molecule` | 226 |
| `Foam::molecule::constantProperties::checkSiteListSizes` | 265 |
| `Foam::molecule::constantProperties::setInteractionSiteBools` | 280 |
| `Foam::molecule::constantProperties::linearMoleculeTest` | 301 |
| `Foam::molecule::constantProperties::siteReferencePositions` | 336 |
| `Foam::molecule::constantProperties::siteMasses` | 342 |
| `Foam::molecule::constantProperties::siteCharges` | 349 |
| `Foam::molecule::constantProperties::siteIds` | 356 |
| `Foam::molecule::constantProperties::pairPotentialSites` | 370 |
| `Foam::molecule::constantProperties::pairPotentialSite` | 377 |
| `Foam::molecule::constantProperties::electrostaticSites` | 395 |
| `Foam::molecule::constantProperties::electrostaticSite` | 402 |
| `Foam::molecule::constantProperties::momentOfInertia` | 420 |
| `Foam::molecule::constantProperties::linearMolecule` | 427 |
| `Foam::molecule::constantProperties::pointMolecule` | 433 |
| `Foam::molecule::constantProperties::degreesOfFreedom` | 439 |
| `Foam::molecule::constantProperties::mass` | 456 |
| `Foam::molecule::constantProperties::nSites` | 462 |
| `Foam::molecule::Q` | 472 |
| `Foam::molecule::v` | 483 |
| `Foam::molecule::a` | 495 |
| `Foam::molecule::pi` | 507 |
| `Foam::molecule::tau` | 519 |
| `Foam::molecule::siteForces` | 531 |
| `Foam::molecule::sitePositions` | 543 |
| `Foam::molecule::specialPosition` | 555 |
| `Foam::molecule::potentialEnergy` | 567 |
| `Foam::molecule::rf` | 579 |
| `Foam::molecule::special` | 591 |
| `Foam::molecule::tethered` | 597 |
| `Foam::molecule::id` | 603 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`molecule.H`](../../../11-lagrangian/files/61/molecule.h--614396c741a1.md)

## 8. 直接上层引用

- [src/lagrangian/molecularDynamics/molecule/molecule.H](../../../11-lagrangian/files/61/molecule.h--614396c741a1.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
