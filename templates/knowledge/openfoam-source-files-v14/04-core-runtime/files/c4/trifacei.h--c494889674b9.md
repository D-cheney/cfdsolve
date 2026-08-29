---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c494889674b9"
title: "OpenFOAM 14 源码解析：triFaceI.H"
summary: "该文件实现 `compare`、`triFace`、`collapse`、`flip` 等过程，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/meshes/meshShapes/triFace/triFaceI.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：triFaceI.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/meshes/meshShapes/triFace/triFaceI.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：399 行
- 文件标识：`c494889674b9`

## 2. 功能说明

该文件实现 `compare`、`triFace`、`collapse`、`flip` 等过程，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::triFace::compare` | 38 |
| `Foam::triFace::triFace` | 69 |
| `Foam::triFace::collapse` | 100 |
| `Foam::triFace::flip` | 126 |
| `Foam::triFace::points` | 132 |
| `Foam::triFace::triFaceFace` | 144 |
| `Foam::triFace::tri` | 156 |
| `Foam::triFace::centre` | 167 |
| `Foam::triFace::area` | 178 |
| `Foam::triFace::mag` | 188 |
| `Foam::triFace::normal` | 194 |
| `Foam::triFace::nTriangles` | 202 |
| `Foam::triFace::reverseFace` | 208 |
| `Foam::triFace::sweptVol` | 215 |
| `Foam::triFace::inertia` | 248 |
| `Foam::triFace::ray` | 260 |
| `Foam::triFace::intersection` | 273 |
| `Foam::triFace::nearestPoint` | 301 |
| `Foam::triFace::nearestPointClassify` | 311 |
| `Foam::triFace::nEdges` | 323 |
| `Foam::triFace::edges` | 329 |
| `Foam::triFace::faceEdge` | 346 |
| `Foam::triFace::edgeDirection` | 358 |

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`IOstreams.H`](../../../04-core-runtime/files/46/iostreams.h--46424b137685.md)
- [`face.H`](../../../04-core-runtime/files/bc/face.h--bc0ffa4a6982.md)
- [`triPointRef.H`](../../../04-core-runtime/files/b0/tripointref.h--b095b5632b50.md)
- [`Swap.H`](../../../04-core-runtime/files/c8/swap.h--c80854039106.md)

## 8. 直接上层引用

- [src/OpenFOAM/meshes/meshShapes/triFace/triFace.H](../../../04-core-runtime/files/6a/triface.h--6a1e567bfca7.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
