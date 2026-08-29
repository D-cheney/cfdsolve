---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-blockmesh
title: OpenFOAM blockMesh 参数化结构网格
summary: 介绍 blockMeshDict 的顶点、六面体块、边、边界面和分级设置，给出坐标方向、块连接、局部加密与网格验收的工程检查清单。
category: { slug: openfoam-meshing, name: OpenFOAM 网格 }
level: 进阶
reading_minutes: 14
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, blockMesh, 结构网格, grading, 网格]
seo:
  title: OpenFOAM blockMesh 参数化网格指南
  description: 从顶点、块、边界和分级构造可复现的 OpenFOAM 结构六面体网格。
  keywords: [blockMeshDict, blockMesh, simpleGrading]
---

# OpenFOAM blockMesh 参数化结构网格

`blockMesh` 适合规则通道、外流域基底网格、二维楔形或可分块几何。优势是文本可审查、参数可复现和网格拓扑明确。

## 1. 建模元素

`vertices` 定义坐标，`blocks` 以八个顶点定义六面体及各方向单元数，`edges` 描述圆弧或样条，`boundary` 将外表面组织为 patch。顶点顺序决定局部坐标和面法向，顺序错误常导致负体积或块翻转。

## 2. 分级设计

`simpleGrading` 在块的三个局部方向控制末端与起始单元尺寸之比。先由目标首层/末层尺寸和总厚度反推单元数与增长率，不要盲目填写极端比例。相邻块公共面上的点分布必须兼容。

## 3. 二维和周期案例

二维案例通常仍是一层三维网格，并把前后面设为相应二维类型；旋转周期、平移周期或楔形边界必须满足几何映射条件。边界类型要与初始场文件中的 patch 名一致。

## 4. 验收步骤

```bash
blockMesh | tee log.blockMesh
checkMesh -allGeometry -allTopology | tee log.checkMesh
```

命令选项依版本而异。除汇总指标外，还应在 ParaView 中检查块连接、法向、局部尺寸跳变和边界名称。随后对目标工程量做系统网格加密。

## 5. 常见错误

- 用全局方向理解局部 grading；
- 公共面顶点顺序或单元划分不一致；
- 缩放因子造成毫米/米错误；
- patch 名改变后未同步更新 `0/` 字段；
- 仅看 `checkMesh` 的通过结论，不检查关键区分辨率。

## 6. 参考资料

1. 当前 OpenFOAM 版本的 blockMesh User Guide。

