---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-models-boundaries-sources
title: OpenFOAM 14 物理模型、边界、源项与约束的统一扩展机制
summary: 梳理 momentumTransport、thermo、fvPatchField、fvModels 和 fvConstraints 的职责边界，说明模型怎样读取字典、向方程添加闭合项、修正场并通过运行时选择扩展。
category: { slug: openfoam-v14-models-infrastructure, name: OpenFOAM 14 物理模型与基础设施 }
level: 专题
reading_minutes: 24
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, momentumTransport, fvPatchField, fvModels, fvConstraints]
---

# OpenFOAM 14 物理模型、边界、源项与约束的统一扩展机制

OpenFOAM 把“方程主体”和“可替换闭合”分离。模型大多通过工厂创建，并在生命周期的 predict/correct 或 source/constrain 阶段参与求解。

## 1. 动量输运

`src/MomentumTransportModels` 统一层流、RANS 和 LES 接口。平均动量方程中的未闭合应力可表示为：

```text
-\overline{u_i'u_j'}
=2\nu_t S_{ij}-\frac{2}{3}k\delta_{ij}
```

具体模型提供有效应力/扩散贡献，并在 `predict()`、`correct()` 中推进湍流变量。

## 2. 边界字段

`fvPatchField` 派生类把边界数学关系转成矩阵边界系数或显式值更新。运行时类型来自每个场文件的 patch 字典；因此同一几何 patch 上，不同场可以采用不同边界条件。

## 3. 源项与约束

`fvModels` 向方程返回显式/隐式源，并在网格变化前后更新；`fvConstraints` 对矩阵或解场施加约束。源码中应区分“物理源”“数值约束”和“边界贡献”，否则容易重复计入。

## 4. 参考源码

1. `src/MomentumTransportModels/`。
2. `src/finiteVolume/fields/fvPatchFields/`。
3. `src/fvModels/` 与 `src/fvConstraints/`。

