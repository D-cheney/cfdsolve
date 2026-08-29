---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-44e0a7130c2d"
title: "OpenFOAM 14 源码解析：hierarchical.H"
summary: "该文件声明或实现 `hierarchical`，属于“并行与域分解”模块。"
category: { slug: openfoam-v14-13-parallel, name: OpenFOAM 源码 · 并行与域分解 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/parallel/decompose/decompositionMethods/hierarchical/hierarchical.H"
tags: [OpenFOAM14, 源码解析, 并行与域分解]
---

# OpenFOAM 14 源码解析：hierarchical.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/parallel/decompose/decompositionMethods/hierarchical/hierarchical.H`
- 功能分类：并行与域分解
- 文件类型：C/C++ 或词法/语法源文件
- 规模：269 行
- 文件标识：`44e0a7130c2d`

## 2. 功能说明

该文件声明或实现 `hierarchical`，属于“并行与域分解”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Does hierarchical decomposition of points. Works by first sorting the points in x direction into equal sized bins, then in y direction and finally in z direction. Uses single array to hold decomposition which is indexed as if it is a 3 dimensional array: finalDecomp[i,j,k] is indexed as i*n[0]*n[1] + j*n[1] + k E.g. if we're sorting 'xyz': the first sort (over the x-component) determines in which x-domain the point goes. Then for each of the x-domains the points are sorted in y direction and each individual x-domain gets split into three y-domains. And similar for the z-direction. Since the domains are of equal size the maximum difference in size is n[0]*n[1] (or n[1]*n[2]?) (small anyway)

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `hierarchical` | 73 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`geometric.H`](../../../13-parallel/files/71/geometric.h--71cb1412a9ec.md)
- [`FixedList.H`](../../../04-core-runtime/files/56/fixedlist.h--5633be515ee5.md)
- [`direction.H`](../../../04-core-runtime/files/d9/direction.h--d9c7401eb13d.md)

## 8. 直接上层引用

- [src/parallel/decompose/decompositionMethods/hierarchical/hierarchical.C](../../../13-parallel/files/45/hierarchical.c--45b2b91b0deb.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
