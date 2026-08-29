---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d792cff5f790"
title: "OpenFOAM 14 源码解析：GeometricFieldSources.H"
summary: "该文件声明或实现 `dictionary`、`GeometricFieldSources`、`PrimitiveField2`、`PrimitiveField`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/GeometricFields/GeometricField/GeometricFieldSources.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：GeometricFieldSources.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/GeometricFields/GeometricField/GeometricFieldSources.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：261 行
- 文件标识：`d792cff5f790`

## 2. 功能说明

该文件声明或实现 `dictionary`、`GeometricFieldSources`、`PrimitiveField2`、`PrimitiveField`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Part of a geometric field used for setting the values associated with optional sources

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `dictionary` | 53 |
| `GeometricFieldSources` | 59 |
| `PrimitiveField2` | 87 |
| `PrimitiveField` | 167 |
| `NoFieldSource` | 180 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`dimensionedTypes.H`](../../../04-core-runtime/files/e7/dimensionedtypes.h--e7b52390401f.md)
- [`DimensionedField.H`](../../../05-finite-volume/files/5d/dimensionedfield.h--5d3e98805c1c.md)
- [`HashPtrTable.H`](../../../04-core-runtime/files/4a/hashptrtable.h--4ab8e1bdb8c9.md)
- [`GeometricFieldSources.C`](../../../05-finite-volume/files/f3/geometricfieldsources.c--f395183a0889.md)

## 8. 直接上层引用

- [src/finiteVolume/fields/GeometricFields/GeometricField/GeometricField.H](../../../05-finite-volume/files/d9/geometricfield.h--d97ab300040a.md)
- [src/finiteVolume/fields/GeometricFields/GeometricField/GeometricFieldSources.C](../../../05-finite-volume/files/f3/geometricfieldsources.c--f395183a0889.md)
- [src/finiteVolume/surfaceMesh/surfaceMesh.H](../../../05-finite-volume/files/13/surfacemesh.h--130b4e27ae72.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
