---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-472ce4343416"
title: "OpenFOAM 14 源码解析：pointMesh.C"
summary: "该文件实现 `pointMesh` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/pointMesh/pointMesh.C"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：pointMesh.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/pointMesh/pointMesh.C`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：299 行
- 文件标识：`472ce4343416`

## 2. 功能说明

该文件实现 `pointMesh` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::pointMesh::C` | 85 |
| `Foam::pointMesh::movePoints` | 110 |
| `Foam::pointMesh::topoChange` | 127 |
| `Foam::pointMesh::mapMesh` | 142 |
| `Foam::pointMesh::swap` | 157 |
| `Foam::pointMesh::distribute` | 189 |
| `Foam::pointMesh::reorderPatches` | 204 |
| `Foam::pointMesh::addPatch` | 235 |
| `Foam::pointMesh::clear` | 268 |
| `Foam::pointMesh::reset` | 284 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **分布式映射**：依据全局到局部寻址重排和交换数据。
3. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
4. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`pointMesh.H`](../../../05-finite-volume/files/89/pointmesh.h--89d6d6fe0d17.md)
- [`globalMeshData.H`](../../../04-core-runtime/files/c7/globalmeshdata.h--c7a6bf9a1fa2.md)
- [`pointFields.H`](../../../05-finite-volume/files/ab/pointfields.h--ab4bc596bad4.md)
- [`SubField.H`](../../../04-core-runtime/files/82/subfield.h--82a0cf10f077.md)
- [`facePointPatch.H`](../../../05-finite-volume/files/9c/facepointpatch.h--9ce29ce49493.md)
- [`MapGeometricFields.H`](../../../05-finite-volume/files/bc/mapgeometricfields.h--bca4d3b5b322.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
