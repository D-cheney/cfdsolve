---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3ba60c9198db"
title: "OpenFOAM 14 源码解析：MPLICfaceI.H"
summary: "该文件实现 `alphaPhiU`、`cutPoints`、`subPoints`、`cutEdges` 等过程，属于“多相与界面”模块。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/interfaceCompression/MPLIC/MPLICfaceI.H"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：MPLICfaceI.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/interfaceCompression/MPLIC/MPLICfaceI.H`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：184 行
- 文件标识：`3ba60c9198db`

## 2. 功能说明

该文件实现 `alphaPhiU`、`cutPoints`、`subPoints`、`cutEdges` 等过程，属于“多相与界面”模块。

中文导航角色：两相流与界面模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::MPLICface::alphaPhiU` | 35 |
| `Foam::MPLICface::cutPoints` | 100 |
| `Foam::MPLICface::subPoints` | 106 |
| `Foam::MPLICface::cutEdges` | 113 |
| `Foam::MPLICface::Sf` | 119 |
| `Foam::MPLICface::Cf` | 125 |

## 5. 算法与控制流程

1. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`MPLICface.H`](../../../10-multiphase/files/8a/mplicface.h--8a83e7af84b9.md)

## 8. 直接上层引用

- [src/twoPhaseModels/interfaceCompression/MPLIC/MPLICface.H](../../../10-multiphase/files/8a/mplicface.h--8a83e7af84b9.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
