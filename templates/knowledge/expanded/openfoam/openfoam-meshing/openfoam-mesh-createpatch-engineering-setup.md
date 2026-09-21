---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-createpatch-engineering-setup
title: "createPatch 边界重组：工程设置与参数选择"
summary: "给出 createPatchDict 的 constructFrom 四种来源、面积守恒核对、order 与 flipMap 的方向约定，以及 cyclic 配对与 patch 类型改写的判定步骤。"
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
  - "createPatch 边界重组"
  - "工程设置与参数选择"
  - "createPatchDict"
  - "cyclic"
seo:
  title: "createPatch 边界重组：工程设置与参数选择"
  description: "给出 createPatchDict 的 constructFrom 四种来源、面积守恒核对、order 与 flipMap 的方向约定，以及 cyclic 配对与 patch 类型改写的判定步骤。"
  keywords:
    - "createPatch 边界重组"
    - "工程设置与参数选择"
    - "createPatchDict"
    - "cyclic patch"
---

# createPatch 边界重组：工程设置与参数选择

`createPatch` 在已有网格上重新组织边界面：把几个 patch 合成一个、从一个大 patch 里切出一块、把普通 patch 改成 `cyclic` 或 `symmetryPlane`、或者把内部面提升成挡板。它不改变网格几何，只改变 `constant/polyMesh/boundary` 的内容，因此所有改动都可以用面积核对来验证。

## constructFrom 的四种来源

`createPatchDict` 中每个 patch 条目必须写 `constructFrom`，取值有四类：

- `patches`：从已有 patch 列表取面，配 `patches ( inlet outlet )`。
- `patch`：从单个已有 patch 取面，配同名条目。
- `faceSet`：从 `topoSet` 生成的 faceSet 取面，配 `set <name>`。
- `faceZone`：从 faceZone 取面，配 `set <name>`。

用错来源的典型表现是新 patch 面积为零，但 `createPatch` 不会报错。所以每次运行都必须做面积守恒核对：

$$
A_{new}=\sum_{k}A_{k},\qquad \mathbf{n}_{new}\cdot\mathbf{n}_{k}>0
$$

即新 patch 的面积等于各来源 patch 面积之和，且法向方向一致。设 `inlet` 面积 $0.02\,\mathrm{m^2}$、`outlet` $0.03\,\mathrm{m^2}$、`top` $0.05\,\mathrm{m^2}$，三者合成的新 patch 面积必须是 $0.10\,\mathrm{m^2}$；若日志给出 $0.07\,\mathrm{m^2}$，说明 `patches` 列表里漏了一项。

## 合并与切分的字典写法

```text
// system/createPatchDict
pointSync       false;

patches
(
    // 合并三个 patch 成一个 "freestream"
    {
        name            freestream;
        patchInfo       { type patch; }
        constructFrom   patches;
        patches         ( inlet outlet top );
    }

    // 从大 patch 里切出一块作为监测面
    {
        name            probeWall;
        patchInfo       { type wall; }
        constructFrom   faceSet;
        set             probeFaces;
        order           clockwise;
    }

    // 把一个 patch 拆成壁面
    {
        name            lowerWall;
        patchInfo       { type wall; }
        constructFrom   patch;
        patch           ground;
    }
);
```

`order` 只对 `faceSet`/`faceZone` 来源生效，取 `clockwise`、`counterClockwise` 或 `none`。它决定新 patch 上面法向相对于原单元的朝向，进而决定 `flipMap`。取反的后果是壁面法向朝内，`checkMesh` 的 `Boundary openness` 会报出非零值，或者求解器在壁面处产生反向的黏性通量。

## 从普通 patch 改成 cyclic 配对

把两个几何对应的 patch 改成 `cyclic` 是旋转机械与周期性通道的常见需求。两个 patch 必须满足平移或旋转对应关系：

$$
\mathbf{x}_{nb}=\mathbf{x}_{own}+\mathbf{d},\qquad \left|\mathbf{x}_{nb}-\mathbf{x}_{own}-\mathbf{d}\right|<\epsilon_{match}
$$

`d` 是 `offset` 向量，`matchTolerance` 是相对网格包围盒尺度的容差，默认 $0.001$。设包围盒对角线 $1.5\,\mathrm{m}$，则绝对容差 $1.5\,\mathrm{mm}$，要求两侧顶点坐标在这个量级内重合。若两个 patch 是分别生成的、坐标只保留到 $0.1\,\mathrm{mm}$，通常可以通过；若一个是四面体网格、一个是六面体网格，顶点根本对不上，就必须改用 `cyclicAMI`。

```text
    {
        name            periodicFront;
        patchInfo
        {
            type            cyclic;
            neighbourPatch  periodicBack;
            matchTolerance  0.001;
        }
        constructFrom   patch;
        patch           front;
    }
```

`neighbourPatch` 必须双向声明：两个条目互相指向，否则 `createPatch` 会以 `Cannot find neighbourPatch` 中止。旋转周期还要加 `transform rotational` 与 `rotationAxis`、`rotationCentre`。

## 面积与法向的核对命令

```bash
createPatch -overwrite 2>&1 | tee log.createPatch
grep -E "Creating|patch|area" log.createPatch
checkMesh -allGeometry -allTopology | tee log.checkMesh.patch
checkMesh -allGeometry | grep -A12 "Checking patch topology"
```

`createPatch` 日志里会逐条打印 `Creating patch ... from ...` 以及新 patch 的面数与面积，把这两项与来源 patch 的合计对照即可。`checkMesh` 的 `Checking patch topology for multiply connected surfaces` 段落会给出每个 patch 的 `Faces`、`Points` 和 `Surface topology`；合并后的 patch 若报 `multiply connected`，说明来源面在几何上不连通，这在物理上通常意味着漏选了某个面。

对于闭合的 `cyclic` 对，两侧面矢量应满足 $\sum_{f}\mathbf{S}_{f,own}=-\sum_{f}\mathbf{S}_{f,nb}$，即两侧法向相对而指。`checkMesh` 报 `Boundary openness` 非零时，先查这个关系。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 新 patch 面积为 0 | `constructFrom` 与来源字段不匹配 | 对比日志中 `Creating patch` 的面积与来源合计 |
| 新 patch 面积小于来源之和 | `patches` 列表漏项或名字拼错 | 逐项加总来源 patch 面积 |
| 壁面法向朝内 | `order` 取了相反方向 | 交换 `clockwise`/`counterClockwise` 重跑 |
| `cyclic` 配对报不匹配 | 顶点不重合或 `offset` 写错 | 把 `matchTolerance` 放大到 $0.01$ 试一次 |
| `Cannot find neighbourPatch` | 只写了一侧声明 | 检查两个条目的 `neighbourPatch` 是否互指 |
| 合并后报 `multiply connected` | 来源面在几何上不连通 | 用 `-writeSets vtk` 把新 patch 面导出查看 |
| 求解器报缺 patchField | `0/` 目录未同步新增 patch 名 | 比对 `constant/polyMesh/boundary` 与 `0/` 的 patch 列表 |
| 并行下新 patch 只在部分进程出现 | 未在所有进程一致执行 | 逐个检查 `processor*/constant/polyMesh/boundary` |

## 归档与回退

`createPatch -overwrite` 会直接覆盖 `constant/polyMesh`，调试阶段务必先复制一份 `polyMesh` 作为回退点。归档内容包括：`createPatchDict`、运行日志、改前后 `boundary` 文件的 diff、各 patch 的面积（m²）与面数、以及 `cyclic` 对的 `matchTolerance` 与 `offset`。面积这一列尤其重要，它是判断“重组是否正确”的唯一数值依据，缺了它就只能靠肉眼在 ParaView 里找面。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §3.4 "Mesh modification with createPatch", 2023.
2. OpenFOAM v11 源码 `src/utilities/mesh/manipulation/createPatch/createPatch.C` 与 `src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/cyclic/`。
3. OpenFOAM v11 文档 `createBaffles`、`changeDictionary` 与 `cyclicAMI` 边界条件的 `matchTolerance`、`offset` 说明。
4. H. Jasak, *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996, §3.5 "Coupled and cyclic boundaries".
5. F. Moukalled, L. Mangani, M. Darwish, *The Finite Volume Method in Computational Fluid Dynamics*, Springer, 2016, §13.4 "Periodic and cyclic boundary treatment".
6. OpenFOAM v11 教程 `tutorials/incompressible/simpleFoam/rotor2D/` 中的 `createPatchDict` 周期性设置。
7. Ferziger J.H., Perić M., Street R.L. 《Computational Methods for Fluid Dynamics》. Springer, 2020.
8. Beaudoin M., Jasak H. 《Development of a Generalized Grid Interface for Turbomachinery Simulations with OpenFOAM》. OpenFOAM Workshop, 2008.
9. Marić T., Höpken J., Mooney K. 《The OpenFOAM Technology Primer》. Sourceflux, 2014.
