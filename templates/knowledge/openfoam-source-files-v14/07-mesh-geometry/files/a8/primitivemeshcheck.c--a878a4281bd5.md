---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-a878a4281bd5"
title: "OpenFOAM 14 源码解析：primitiveMeshCheck.C"
summary: "该文件实现 `faceSkewness`、`boundaryFaceSkewness`、`faceOrthogonality`、`facePyramidVolume` 等过程，属于“网格与几何”模块。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/meshCheck/primitiveMeshCheck/primitiveMeshCheck.C"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：primitiveMeshCheck.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/meshCheck/primitiveMeshCheck/primitiveMeshCheck.C`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：1986 行
- 文件标识：`a878a4281bd5`

## 2. 功能说明

该文件实现 `faceSkewness`、`boundaryFaceSkewness`、`faceOrthogonality`、`facePyramidVolume` 等过程，属于“网格与几何”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::meshCheck::faceSkewness` | 39 |
| `Foam::meshCheck::boundaryFaceSkewness` | 74 |
| `Foam::meshCheck::faceOrthogonality` | 113 |
| `Foam::meshCheck::facePyramidVolume` | 206 |
| `Foam::meshCheck::cellClosedness` | 245 |
| `Foam::meshCheck::faceConcavity` | 339 |
| `Foam::meshCheck::faceFlatness` | 409 |
| `Foam::meshCheck::cellDeterminant` | 458 |
| `Foam::meshCheck::checkClosedBoundary` | 556 |
| `Foam::meshCheck::checkClosedCells` | 612 |
| `Foam::meshCheck::checkFaceAreas` | 748 |
| `Foam::meshCheck::checkCellVolumes` | 807 |
| `Foam::meshCheck::checkFacePyramids` | 872 |
| `Foam::meshCheck::checkFaceAngles` | 953 |
| `Foam::meshCheck::checkFaceFlatness` | 1032 |
| `Foam::meshCheck::checkConcaveCells` | 1138 |
| `Foam::meshCheck::checkUpperTriangular` | 1251 |
| `Foam::meshCheck::checkCellsZipUp` | 1414 |
| `Foam::meshCheck::checkFaceVertices` | 1513 |
| `Foam::meshCheck::checkPoints` | 1587 |
| `Foam::meshCheck::checkDuplicateFaces` | 1660 |
| `Foam::meshCheck::checkCommonOrder` | 1702 |
| `Foam::meshCheck::checkFaceFaces` | 1864 |

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 压力校正：$\mathbf{U}=\mathbf{H}/A-(1/A)\nabla p$，并由连续性得到压力泊松方程。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`primitiveMeshCheck.H`](../../../07-mesh-geometry/files/e6/primitivemeshcheck.h--e6f3a433f96c.md)
- [`pyramidPointFaceRef.H`](../../../04-core-runtime/files/59/pyramidpointfaceref.h--59d9b4387191.md)
- [`PackedBoolList.H`](../../../04-core-runtime/files/6e/packedboollist.h--6eaf5d33f077.md)
- [`units.H`](../../../04-core-runtime/files/62/units.h--623c78073185.md)
- [`SortableList.H`](../../../04-core-runtime/files/67/sortablelist.h--6730cee0ba96.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
