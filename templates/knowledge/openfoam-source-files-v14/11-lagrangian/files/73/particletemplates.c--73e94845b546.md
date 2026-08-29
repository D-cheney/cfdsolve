---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-73e94845b546"
title: "OpenFOAM 14 源码解析：particleTemplates.C"
summary: "该文件实现 `readFields`、`writeFields`、`prepareForParallelTransfer`、`correctAfterParallelTransfer` 等过程，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/basic/particle/particleTemplates.C"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：particleTemplates.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/basic/particle/particleTemplates.C`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：422 行
- 文件标识：`73e94845b546`

## 2. 功能说明

该文件实现 `readFields`、`writeFields`、`prepareForParallelTransfer`、`correctAfterParallelTransfer` 等过程，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::particle::readFields` | 46 |
| `Foam::particle::writeFields` | 78 |
| `Foam::particle::prepareForParallelTransfer` | 110 |
| `Foam::particle::correctAfterParallelTransfer` | 134 |
| `Foam::particle::hitFace` | 165 |
| `Foam::particle::trackToAndHitFace` | 251 |
| `Foam::particle::hitPatch` | 268 |
| `Foam::particle::hitWedgePatch` | 275 |
| `Foam::particle::hitSymmetryPlanePatch` | 286 |
| `Foam::particle::hitSymmetryPatch` | 297 |
| `Foam::particle::hitCyclicPatch` | 305 |
| `Foam::particle::hitNonConformalCyclicPatch` | 328 |
| `Foam::particle::hitProcessorPatch` | 397 |
| `Foam::particle::hitWallPatch` | 408 |
| `Foam::particle::hitBasicPatch` | 413 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- `particle.H`
- [`tracking.H`](../../../17-other-libraries/files/7a/tracking.h--7aa80ba1b1b6.md)
- [`IOPosition.H`](../../../11-lagrangian/files/c1/ioposition.h--c1243b331877.md)
- [`cyclicPolyPatch.H`](../../../04-core-runtime/files/9f/cyclicpolypatch.h--9f84126e18a8.md)
- [`nonConformalCyclicPolyPatch.H`](../../../07-mesh-geometry/files/65/nonconformalcyclicpolypatch.h--65e4405a8265.md)
- [`processorPolyPatch.H`](../../../04-core-runtime/files/42/processorpolypatch.h--42c8af29a130.md)
- [`symmetryPlanePolyPatch.H`](../../../04-core-runtime/files/84/symmetryplanepolypatch.h--84e257f51b1b.md)
- [`symmetryPolyPatch.H`](../../../04-core-runtime/files/8a/symmetrypolypatch.h--8ac9fae5a0cc.md)
- [`wallPolyPatch.H`](../../../04-core-runtime/files/db/wallpolypatch.h--db96caab5170.md)
- [`wedgePolyPatch.H`](../../../04-core-runtime/files/c3/wedgepolypatch.h--c331343fe38f.md)
- [`meshTools.H`](../../../07-mesh-geometry/files/d3/meshtools.h--d36c3b5880aa.md)

## 8. 直接上层引用

- [src/lagrangian/basic/particle/particle.H](../../../11-lagrangian/files/a0/particle.h--a0fa02be07f4.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
