---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-stitchmesh-engineering-setup
title: "stitchMesh 接口缝合：工程设置与参数选择"
summary: "区分 -perfect 与 -partial 的适用条件，给出点匹配容差、法向相对判据、界面面积核对方法，以及缝合后悬挂节点与负体积的定位步骤。"
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
  - "stitchMesh 接口缝合"
  - "工程设置与参数选择"
  - "perfectInterface"
  - "mergeTol"
seo:
  title: "stitchMesh 接口缝合：工程设置与参数选择"
  description: "区分 -perfect 与 -partial 的适用条件，给出点匹配容差、法向相对判据、界面面积核对方法，以及缝合后悬挂节点与负体积的定位步骤。"
  keywords:
    - "stitchMesh 接口缝合"
    - "工程设置与参数选择"
    - "stitchMesh"
    - "partialInterface"
---

# stitchMesh 接口缝合：工程设置与参数选择

当两块网格是分别生成的时候，交界面上会出现两套重合的边界面。`stitchMesh` 的作用就是把这两套面缝成内部面，让流场在交界处连续。缝合能不能成功，取决于三个几何条件：两侧点是否在容差内重合、两侧面法向是否相对、两侧界面面积是否一致。这三条都能在缝合前用手算和 `checkMesh` 判定。

## 共形与非共形的分界

`-perfect` 要求两侧网格在界面上**拓扑等价**：面数相同、点一一对应、每个面的顶点顺序对应。判定条件是点集的一一映射在容差内成立：

$$
\max_{i}\left|\mathbf{x}^{m}_{i}-\mathbf{x}^{s}_{i}\right|<\epsilon_{merge}
$$

`-partial` 则允许两侧面数不同、点分布不同，缝合时按几何重叠关系重新组织面。典型场景是块结构化网格与非结构网格对接：一侧 1600 个面，另一侧 3200 个面。

以 $0.2\,\mathrm{m}\times0.2\,\mathrm{m}$ 的界面、单元尺寸 $5\,\mathrm{mm}$ 为例，一侧面数 $40\times40=1600$、点数 $41\times41=1681$；若另一侧单元 $2.5\,\mathrm{mm}$，面数 $80\times80=6400$、点数 $81\times81=6561$。两侧面积都是 $0.04\,\mathrm{m^2}$，但拓扑完全不同，只能用 `-partial`。用 `-perfect` 会以 `Cannot find point ...` 或 `not all faces matched` 中止。

## 法向相对与容差

缝合的前提是两侧法向相对而指：

$$
\mathbf{n}_{m}\cdot\mathbf{n}_{s}\approx-1
$$

若两侧法向同向（点积 $+1$），缝合后会出现两侧单元共享同一个面且朝向相同，等价于两个单元直接重叠，`checkMesh` 立刻报负体积。这一条在块拼接里很常见：同一个几何位置，一块的 `x1` 方向朝左、另一块朝右，交界面上的法向就都朝同一侧了。

缝合前先看 `boundary` 文件里这两个 patch 的类型与面数，确认它们都是普通的 `patch` 而不是 `wall`：

```text
// constant/polyMesh/boundary 片段
masterPatch
{
    type        patch;
    nFaces      1600;
    startFace   3720000;
}
slavePatch
{
    type        patch;
    nFaces      6400;
    startFace   3721600;
}
```

两侧面数分别是 1600 与 6400，比值 4，与两侧单元尺寸比 $5\,\mathrm{mm}:2.5\,\mathrm{mm}$ 的平方一致，说明几何面确实重合，可以直接进 `-partial`。

`-mergeTol` 默认 $1\times10^{-3}$，按网格包围盒尺度归一化。设包围盒对角线 $1.5\,\mathrm{m}$，绝对容差为 $1.5\,\mathrm{mm}$。若两块网格分别用单精度导出、坐标只保留到 $0.1\,\mathrm{mm}$，$1.5\,\mathrm{mm}$ 容差足够；若容差压到 $1\times10^{-6}$（绝对 $1.5\,\mu\mathrm{m}$），双精度坐标也会因浮点累加误差匹配失败。

## 命令行与验收

```bash
stitchMesh -perfect -mergeTol 1e-3 masterPatch slavePatch 2>&1 | tee log.stitch.perfect
stitchMesh -partial -mergeTol 1e-3 masterPatch slavePatch 2>&1 | tee log.stitch.partial
checkMesh -allGeometry -allTopology | tee log.checkMesh.stitch
grep -E "unmatched|open|Min volume|Max skew" log.checkMesh.stitch
```

`-perfect` 成功时日志会给出 `All faces matched` 与匹配的面数，应与手算的 1600 对上。`-partial` 成功时日志给出的是建立的耦合面对数与未被覆盖的面积；未被覆盖面积应接近 0，若占界面的 5% 以上，说明两侧几何面并不完全重合（常见于一侧网格做了轻微变形）。

缝合后必须重跑 `checkMesh`。关键三项是 `Min volume`（应仍为正）、`Max skewness`（缝合不会引入新单元，所以不应变化）、以及 `Boundary openness`（应下降，因为界面面从边界变成了内部面）。若 `Boundary openness` 反而上升，说明缝合把法向搞反了。

`-noFields` 用于 `0/` 目录里没有对应场文件或场文件与 patch 名不匹配的场合；加了这个开关后，缝合只改网格不改场。默认情况下 `stitchMesh` 会尝试同步场文件，patch 名对不上时会中止。

## 缝合 vs 非共形耦合

OpenFOAM v10 与 ESI 版本引入了 `createNonConformalCouples`，它不需要缝合几何，而是在两侧 patch 之间建立插值耦合，保留两套独立的边界。两者的选择判据是：

- 两侧点能在容差内对齐、且希望界面完全共形 → 用 `stitchMesh`。
- 两侧网格尺度差一倍以上、或需要保留各自的边界层结构 → 用 `createNonConformalCouples`。

缝合会把交界面从边界变成内部面，因此两侧的边界层必须同时连续；若一侧有 5 层边界层、另一侧没有，缝合后界面处会出现长宽比突变，`checkMesh` 的 `max aspect ratio` 会明显跳升。这种情况下非共形耦合是更合理的选择。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `-perfect` 报 `not all faces matched` | 两侧拓扑不等价 | 对比两侧面数与点数，1600 对 6400 时应改 `-partial` |
| 报 `Cannot find point within tolerance` | 点距超过 `-mergeTol` | 把容差从 $1\times10^{-3}$ 放大到 $1\times10^{-2}$ 重试 |
| 缝合后 `Min volume` 为负 | 两侧面法向同向 | 取两侧法向点积，应接近 $-1$ |
| `Boundary openness` 上升 | 缝合方向反了（master/slave 写反） | 交换两个 patch 名重跑对比 |
| 缝合后仍有内流面 | 用了 `-partial` 但几何实际共形 | 改用 `-perfect`，看是否报全匹配 |
| 界面处出现悬挂节点 | 非共形接口未做 `-partial` 处理 | 看 `checkMesh` 的 `unmatched faces` 计数 |
| 结果随并行度变化 | 先分解后缝合，跨进程缝合不完整 | 串行缝合后再 `decomposePar` |
| 求解器报 patchField 缺失 | 缝合后 patch 消失但 `0/` 未更新 | 加 `-noFields` 或手工清理 `0/` 中的该 patch |

## 顺序与记录

固定顺序是：先生成两块网格并各自 `checkMesh` → 量测界面点距与法向点积 → 串行执行 `stitchMesh` → 重跑 `checkMesh` → 最后 `decomposePar`。这个顺序把最容易出错的几何核对放在缝合之前，避免在缝合失败后还要回头判断到底是哪一块网格的问题。

记录项：两侧 patch 名、面数与点数、界面面积（m²）、实测最大点距（mm）、法向点积、所用选项（`-perfect`/`-partial`）、`-mergeTol`、缝合前后 `nFaces` 与 `nInternalFaces` 的差值。缝合正确时 `nInternalFaces` 应增加与界面面数相当的量，这个差值是最直接的成功证据。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §3.5 "Mesh stitching with stitchMesh", 2023.
2. OpenFOAM v11 源码 `src/utilities/mesh/manipulation/stitchMesh/stitchMesh.C` 与 `src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/` 下 `perfectInterface`、`partialInterface` 的实现。
3. OpenFOAM v11 工具文档 `createNonConformalCouples`、`mergeMeshes` 的选项与限制。
4. H. Jasak, *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996, §3.5 "Interface treatment in domain decomposition".
5. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020, §9.4 "Block interfaces and conservative coupling".
6. F. Moukalled, L. Mangani, M. Darwish, *The Finite Volume Method in Computational Fluid Dynamics*, Springer, 2016, §13.5 "Non-conformal and sliding interfaces".
