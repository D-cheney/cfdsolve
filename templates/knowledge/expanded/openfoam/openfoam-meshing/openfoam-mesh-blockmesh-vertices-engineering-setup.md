---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-blockmesh-vertices-engineering-setup
title: "blockMesh 顶点与块拓扑：工程设置与参数选择"
summary: "给出 blockMesh 的 hex 右手系编号判据、共享面顶点复用规则和分块坐标台账格式，用一段双块弯管字典演示负体积的定位与修正。"
category:
  slug: openfoam-meshing
  name: "OpenFOAM 网格"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OPENFOAM"
  - "OpenFOAM 网格"
  - "blockMesh 顶点与块拓扑"
  - "工程设置与参数选择"
  - "hex 顶点编号"
  - "负体积"
seo:
  title: "blockMesh 顶点与块拓扑：工程设置与参数选择"
  description: "给出 blockMesh 的 hex 右手系编号判据、共享面顶点复用规则和分块坐标台账格式，用一段双块弯管字典演示负体积的定位与修正。"
  keywords:
    - "blockMesh 顶点与块拓扑"
    - "工程设置与参数选择"
    - "hex 顶点顺序"
    - "negative volume"
---

# blockMesh 顶点与块拓扑：工程设置与参数选择

`blockMesh` 的 `vertices` 与 `blocks` 是整条网格链的坐标基准：snappyHexMesh 的背景网格、extrudeMesh 的源面、createPatch 引用的 patch 名字都从这里继承。顶点写错不会报语法错误，只会得到负体积、漏面或左右手翻转的网格。下面给出编号判据、共享面写法和一张可直接改用的坐标台账。

## hex 块的右手系约定

一个 `hex` 块由 8 个顶点索引构成，顺序固定为 `(v0 v1 v2 v3 v4 v5 v6 v7)`。`v0→v1` 定义局部 $x_1$ 方向，`v1→v2` 定义 $x_2$ 方向，`v0→v4` 定义 $x_3$ 方向；`v0 v1 v2 v3` 是 $x_3$ 最小侧的那张面。合法性判据是三个边向量的混合积为正：

$$
\mathbf{e}_1=\mathbf{x}_{v1}-\mathbf{x}_{v0},\quad \mathbf{e}_2=\mathbf{x}_{v2}-\mathbf{x}_{v1},\quad \mathbf{e}_3=\mathbf{x}_{v4}-\mathbf{x}_{v0},\qquad V_b=\mathbf{e}_1\cdot(\mathbf{e}_2\times\mathbf{e}_3)>0
$$

$V_b$ 同时就是该块的体积，单位与坐标一致（通常为 m³）。若算出 $V_b<0$，说明索引是左旋的，`blockMesh` 会直接以 `negative volume` 中止，不会自动纠正顺序。

## 双块弯管的坐标台账

取一个 2D 平面弯管：水平段长 0.5 m、高 0.05 m，竖直段高 0.45 m、宽 0.05 m，展向厚度 0.01 m。两块在 $x=0.45\sim0.50$、$y=0.05$ 的竖直面上共用四个顶点。

```text
vertices
(
    (0.00 0.00 0.00)   // 0
    (0.50 0.00 0.00)   // 1
    (0.50 0.05 0.00)   // 2  与块 B 共用
    (0.00 0.05 0.00)   // 3
    (0.00 0.00 0.01)   // 4
    (0.50 0.00 0.01)   // 5
    (0.50 0.05 0.01)   // 6  与块 B 共用
    (0.00 0.05 0.01)   // 7
    (0.45 0.05 0.00)   // 8
    (0.45 0.50 0.00)   // 9
    (0.50 0.50 0.00)   // 10
    (0.45 0.05 0.01)   // 11
    (0.45 0.50 0.01)   // 12
    (0.50 0.50 0.01)   // 13
);

blocks
(
    hex (0 1 2 3 4 5 6 7) (20 10 1) simpleGrading (1 1 1)
    hex (8 2 10 9 11 6 13 12) (10 45 1) simpleGrading (1 1 1)
);
```

水平块 A 的 $\mathbf{e}_1=(0.5,0,0)$、$\mathbf{e}_2=(0,0.05,0)$、$\mathbf{e}_3=(0,0,0.01)$，混合积 $=0.5\times0.05\times0.01=2.5\times10^{-4}\,\mathrm{m^3}>0$，合法。竖直块 B 若误写成 `hex (8 9 10 2 11 12 13 6)`，则 $\mathbf{e}_1=(0,0.45,0)$、$\mathbf{e}_2=(0.05,0,0)$，二者叉乘指向 $-z$，与 $\mathbf{e}_3=(0,0,0.01)$ 反向，混合积 $=-2.25\times10^{-4}\,\mathrm{m^3}$，必然报负体积。修正只要把第 2、第 4 个索引互换即可。

## 单元尺寸与块内方向核算

每个方向的单元数为 $N_i$、边长为 $L_i$，则单元尺寸与块内单元总数为

$$
h_i=\frac{L_i}{N_i},\qquad N_{cell}=\prod_{i=1}^{3}N_i
$$

块 A 的 $h_1=0.5/20=0.025\,\mathrm{m}$，$h_2=0.05/10=0.005\,\mathrm{m}$，展向 $h_3=0.01/1=0.01\,\mathrm{m}$，面内长宽比 $0.025/0.005=5$。块 B 的 $h_1=0.05/10=0.005\,\mathrm{m}$、$h_2=0.45/45=0.01\,\mathrm{m}$。两块在共享面上的切向单元数分别是 20 与 10、尺寸 0.005 m 对 0.005 m，正好逐面配对，不产生悬挂节点。总单元数 $20\times10\times1+10\times45\times1=650$。

若共享面两侧单元尺寸不一致，`blockMesh` 不报错，但交界处会留下非共形面，`checkMesh` 会把差额计入 `nFaces` 与 `nInternalFaces`。工程上应把两侧 $h$ 与 $N$ 的乘积对齐，而不是依赖求解器去插值。

## 共享面、patch 与拓扑核对

两块共面时，顶点必须**复用同一组索引**，而不是各写一份坐标。坐标若差到 $10^{-9}\,\mathrm{m}$ 量级，合并容差可能判为两个独立点，交界就退化成两个互不连通的内部面。核对方式是看日志里的三个计数：

```bash
blockMesh | tee log.blockMesh
checkMesh -allTopology -allGeometry | tee log.checkMesh
```

`log.blockMesh` 开头的 `nCells`、`nFaces`、`nInternalFaces` 三项要能和手算对上：内部面数与边界面数之和等于总面数，内部面数应等于 $N_{cell}-1$ 加共享面数之和。对多块几何，用 `-allTopology` 还可以暴露 `number of non-manifold edges` 这类只有共享面写错才会出现的告警。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `negative volume` 直接中止 | 该块 hex 索引左旋 | 交换第 2、第 4 个索引重跑，混合积转正即确认 |
| `checkMesh` 报 `minVol` 为负 | 跨块索引串号，某块引用了别的块顶点 | 只保留该块运行，再逐块加回定位 |
| 交界处出现两个重叠内部面 | 共享面两侧各写一份坐标且未合并 | `checkMesh -allTopology` 看 `nInternalFaces` 是否偏大 |
| `boundary` 里的 patch 数比设计多 | 块内面未在 `boundary` 中归并 | 对比 `constant/polyMesh/boundary` 与坐标台账 |
| 网格只覆盖一半几何 | `vertices` 条目少写一个分量 | 看 `blockMesh` 日志开头的 `Found N vertices` |
| 单元数远超预算 | 长边方向误填了大 $N_i$ | 日志 `nCells` 与手算 $N_{cell}$ 对照 |
| 主流方向与预期相反 | 局部 $x_1$ 方向与物理流向相反 | 载入初始场看 $x$ 分量是否立刻逆流扩散 |

## 坐标台账与归档

把每个块的 `v0` 坐标、三个方向向量、$N_i$ 与 $h_i$ 列成表，是改几何时唯一不出错的做法。台账至少含：块编号、`v0`、$L_1,L_2,L_3$（m）、$N_1,N_2,N_3$、$h_1,h_2,h_3$（m）、共享面编号。改动任意一项，共享面上的 $h$ 必须同步更新，否则非共形面立刻回来。

归档时把 `blockMeshDict`、`blockMesh` 日志、`checkMesh` 输出和 OpenFOAM 版本号（如 v11）放在一起。只保留最终 `polyMesh` 而丢掉字典，后续任何几何微调都得从头反推顶点编号，这比重新建网格更费时间。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §3.2 "Mesh generation with blockMesh", 2023.
2. OpenFOAM Foundation, *OpenFOAM Programmer's Guide* v11, §4 "Mesh", 2023.
3. H. G. Weller, G. Tabor, H. Jasak, C. Fureby, "A tensorial approach to computational continuum mechanics using object-oriented techniques", *Computers in Physics*, 12(6): 620–631, 1998.
4. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
5. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
6. OpenFOAM v11 源码 `src/mesh/blockMesh/blockMesh.C`、`block.C` 中的 `block::checkBlock` 与 `block::createCells`。
