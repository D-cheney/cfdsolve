---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-df9802383e66"
title: "OpenFOAM 14 源码解析：fvPatchDistWaveTemplates.C"
summary: "该文件声明或实现 `FvWallInfoType`、`TrackingData`、`GeoMesh`、`WallLocation`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/wallDist/fvPatchDistWave/fvPatchDistWaveTemplates.C"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvPatchDistWaveTemplates.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/wallDist/fvPatchDistWave/fvPatchDistWaveTemplates.C`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：479 行
- 文件标识：`df9802383e66`

## 2. 功能说明

该文件声明或实现 `FvWallInfoType`、`TrackingData`、`GeoMesh`、`WallLocation`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `FvWallInfoType` | 70 |
| `TrackingData` | 71 |
| `GeoMesh` | 72 |
| `WallLocation` | 283 |
| `DataType` | 288 |
| `WallLocationDataType` | 395 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::fvPatchDistWave::wave` | 74 |
| `Foam::fvPatchDistWave::calculate` | 205 |
| `Foam::fvPatchDistWave::correct` | 226 |
| `Foam::fvPatchDistWave::calculateAndCorrect` | 247 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fvPatchDistWave.H`](../../../05-finite-volume/files/8c/fvpatchdistwave.h--8ca958685393.md)
- [`FvWallInfo.H`](../../../05-finite-volume/files/2c/fvwallinfo.h--2c654df62986.md)

## 8. 直接上层引用

- [src/finiteVolume/fvMesh/wallDist/fvPatchDistWave/fvPatchDistWave.H](../../../05-finite-volume/files/8c/fvpatchdistwave.h--8ca958685393.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
