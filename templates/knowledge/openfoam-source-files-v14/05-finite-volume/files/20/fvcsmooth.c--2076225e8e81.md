---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2076225e8e81"
title: "OpenFOAM 14 源码解析：fvcSmooth.C"
summary: "该文件实现 `smooth`、`spread`、`sweep` 等过程，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/finiteVolume/fvc/fvcSmooth/fvcSmooth.C"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvcSmooth.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/finiteVolume/fvc/fvcSmooth/fvcSmooth.C`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：351 行
- 文件标识：`2076225e8e81`

## 2. 功能说明

该文件实现 `smooth`、`spread`、`sweep` 等过程，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::fvc::smooth` | 39 |
| `Foam::fvc::spread` | 137 |
| `Foam::fvc::sweep` | 243 |

## 5. 算法与控制流程

1. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fvcSmooth.H`](../../../05-finite-volume/files/a8/fvcsmooth.h--a858fd31f13a.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`FvFaceCellWave.H`](../../../05-finite-volume/files/dd/fvfacecellwave.h--ddd88ed0a8a4.md)
- [`smoothData.H`](../../../05-finite-volume/files/ae/smoothdata.h--aea50a985009.md)
- [`sweepData.H`](../../../05-finite-volume/files/4a/sweepdata.h--4a3dc6b3c45e.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
