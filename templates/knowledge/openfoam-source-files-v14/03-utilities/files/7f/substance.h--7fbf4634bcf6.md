---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-7fbf4634bcf6"
title: "OpenFOAM 14 源码解析：substance.H"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `substance` 对应的工作流。"
category: { slug: openfoam-v14-03-utilities, name: OpenFOAM 源码 · 前后处理工具 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/utilities/thermophysical/mixtureAdiabaticFlameT/substance.H"
tags: [OpenFOAM14, 源码解析, 前后处理工具]
---

# OpenFOAM 14 源码解析：substance.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/utilities/thermophysical/mixtureAdiabaticFlameT/substance.H`
- 功能分类：前后处理工具
- 文件类型：C/C++ 或词法/语法源文件
- 规模：124 行
- 文件标识：`7fbf4634bcf6`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `substance` 对应的工作流。

中文导航角色：命令行工具。

上游说明：SourceFiles substanceI.H substance.C substanceIO.C

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `substance` | 57 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `volFrac` | 83 |

## 5. 算法与控制流程

1. **程序入口**：解析命令行和案例环境，然后按既定生命周期调度核心对象。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`scalar.H`](../../../04-core-runtime/files/cb/scalar.h--cb9b81900254.md)
- [`word.H`](../../../04-core-runtime/files/76/word.h--763cd4c0a88d.md)
- [`Istream.H`](../../../04-core-runtime/files/7d/istream.h--7d3485f426ae.md)

## 8. 直接上层引用

- [applications/utilities/thermophysical/mixtureAdiabaticFlameT/mixture.H](../../../03-utilities/files/72/mixture.h--723eb55d4d47.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 main() 追踪输入字典、网格/场操作和写出结果。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
