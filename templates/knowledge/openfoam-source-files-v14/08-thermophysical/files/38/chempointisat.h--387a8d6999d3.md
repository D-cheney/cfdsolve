---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-387a8d6999d3"
title: "OpenFOAM 14 源码解析：chemPointISAT.H"
summary: "该文件声明或实现 `binaryNode`、`ISAT`、`chemPointISAT`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/chemPointISAT/chemPointISAT.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：chemPointISAT.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/chemPointISAT/chemPointISAT.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：398 行
- 文件标识：`387a8d6999d3`

## 2. 功能说明

该文件声明或实现 `binaryNode`、`ISAT`、`chemPointISAT`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Leaf of the binary tree. The chemPoint stores the composition 'phi', the mapping of this composition Rphi, the mapping gradient matrix A and the matrix describing the Ellipsoid Of Accuracy (EOA). 1) When the chemPoint is created the region of accuracy is approximated by an ellipsoid E centered in 'phi' (obtained with the constant): E = {x| ||L^T.(x-phi)|| <= 1}, with x a point in the composition space and L^T the transpose of an upper triangular matrix describing the EOA (see below: "Computation of L" ). 2) To RETRIEVE the mapping from the chemPoint phi, the query point phiq has to be in the EOA of phi. It follows that, dphi=phiq-phi and to test if phiq is in the ellipsoid there are two methods. First, compare r=||dphi|| with rmin and rmax. If r < rmin, phiq is in the EOA. If r > rmax, phiq is out of the EOA. This operations is O(completeSpaceSize) and is performed first. If rmin < r < r

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `binaryNode` | 141 |
| `ISAT` | 146 |
| `chemPointISAT` | 153 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`scalarField.H`](../../../04-core-runtime/files/8b/scalarfield.h--8b96e2274e8a.md)
- [`LUscalarMatrix.H`](../../../06-linear-algebra/files/05/luscalarmatrix.h--05d029fc195b.md)
- [`Switch.H`](../../../04-core-runtime/files/d2/switch.h--d2bac00b16e8.md)
- [`chemPointISATI.H`](../../../08-thermophysical/files/3d/chempointisati.h--3deebc842d35.md)

## 8. 直接上层引用

- [src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/binaryNode/binaryNode.H](../../../08-thermophysical/files/09/binarynode.h--099b28f1a437.md)
- [src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/binaryTree/binaryTree.H](../../../08-thermophysical/files/e9/binarytree.h--e948bca55166.md)
- [src/thermophysicalModels/chemistryModel/Standard/tabulation/ISAT/chemPointISAT/chemPointISAT.C](../../../08-thermophysical/files/fc/chempointisat.c--fc1ebec8159e.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
