---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-4354392339d2"
title: "OpenFOAM 14 源码解析：carried.C"
summary: "该文件实现 `readDUdtc`、`dUdtc`、`clearCarrierFields`、`resetCarrierFields` 等过程，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/clouds/carried/carried.C"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：carried.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/clouds/carried/carried.C`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：333 行
- 文件标识：`4354392339d2`

## 2. 功能说明

该文件实现 `readDUdtc`、`dUdtc`、`clearCarrierFields`、`resetCarrierFields` 等过程，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::clouds::carried::readDUdtc` | 63 |
| `Foam::clouds::carried::dUdtc` | 87 |
| `Foam::clouds::carried::clearCarrierFields` | 120 |
| `Foam::clouds::carried::resetCarrierFields` | 136 |
| `Foam::clouds::carried::carrierPhaseName` | 247 |
| `Foam::clouds::carried::phaseName` | 252 |
| `Foam::clouds::carried::hasPhase` | 271 |
| `Foam::clouds::carried::nameToCarrierName` | 277 |
| `Foam::clouds::carried::carrierNameToName` | 311 |

## 5. 算法与控制流程

1. **显式时间算子**：直接计算时间导数场，不把未知量系数写入矩阵。
2. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
6. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 时间项：$\int_V \partial \phi/\partial t\,\mathrm{d}V$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。

## 7. 直接依赖

- [`carried.H`](../../../11-lagrangian/files/86/carried.h--867c5f9831ed.md)
- [`fvcCurl.H`](../../../05-finite-volume/files/10/fvccurl.h--104eba47cf1f.md)
- [`fvcDdt.H`](../../../05-finite-volume/files/78/fvcddt.h--78d28871151f.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
