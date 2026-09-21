---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-toposet-engineering-setup
title: "topoSet 选择链：工程设置与参数选择"
summary: "把 topoSetDict 的输入集、动作类型与输出集串成一条可验证的选择链，给出几何判据公式、clear 与 add 的差异以及并行同步的注意事项。"
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
  - "topoSet 选择链"
  - "工程设置与参数选择"
  - "boxToCell"
  - "cellToFace"
seo:
  title: "topoSet 选择链：工程设置与参数选择"
  description: "把 topoSetDict 的输入集、动作类型与输出集串成一条可验证的选择链，给出几何判据公式、clear 与 add 的差异以及并行同步的注意事项。"
  keywords:
    - "topoSet 选择链"
    - "工程设置与参数选择"
    - "topoSetDict"
    - "cylinderToCell"
---

# topoSet 选择链：工程设置与参数选择

`topoSet` 的用法本质上是一条流水线：读入一个已有集合，施加一个几何或拓扑动作，输出一个新集合。绝大多数“选不到单元”的问题都出在链的两端——输入集合是空的，或者输出集合被上一次运行的同名结果污染。把链写成显式步骤、每步核对选中数量，就能把这类问题压缩到一次运行内定位。

## 动作的三段结构与常见类型

每个 `actions` 条目由“动作类型 + 目标集合名 + 参数字典”组成。按功能分三类：

- 几何选点：`boxToCell`、`cylinderToCell`、`sphereToCell`、`coneToCell`、`rotatedBoxToCell`。
- 拓扑派生：`cellToFace`、`faceToCell`、`cellToPoint`、`pointToCell`、`nearestToCell`、`nearestToPoint`。
- 集合运算：`add`、`subtract`、`subset`、`invert`、`clear`。

几何动作的判据都很直接。轴对齐长方体用分量比较：

$$
\mathbf{x}\in B\iff l_i\le x_i\le u_i,\quad i=1,2,3
$$

圆柱则要先算到轴线的距离，再判断轴向投影是否落在区间内：

$$
\mathbf{r}=\left(\mathbf{x}-\mathbf{p}\right)-\left[\left(\mathbf{x}-\mathbf{p}\right)\cdot\hat{\mathbf{a}}\right]\hat{\mathbf{a}},\qquad r=|\mathbf{r}|\le R,\qquad 0\le\left(\mathbf{x}-\mathbf{p}\right)\cdot\hat{\mathbf{a}}\le L
$$

$\mathbf{p}$ 是轴起点、$\hat{\mathbf{a}}$ 是单位轴向、$R$ 是半径、$L$ 是长度。写 `cylinderToCell` 时容易漏掉的是轴向区间，只给 `p1 p2 radius` 时两端会按点对定义，若两点顺序写反，得到的是“反方向”的圆柱，选中的单元完全一样但后续 `cellToFace` 的法向会反。

## 一条带校验的尾流加密链

```text
actions
(
    // 1) 清空历史集合，避免污染
    ( clear )

    // 2) 尾流圆柱：轴向 x，从 (0 0 0) 到 (0.6 0 0)，半径 0.15 m
    ( cylinderToCell
      wakeCyl
      {
          p1      (0 0 0);
          p2      (0.6 0 0);
          radius  0.15;
      }
    )

    // 3) 从圆柱里去掉物体附近的单元，避免和表面加密重叠
    ( boxToCell
      nearBody
      { box (-0.06 -0.06 -0.06) (0.06 0.06 0.06); }
    )
    ( subtract
      wakeCyl
      wakeCyl
      { sets ( nearBody ); }
    )

    // 4) 写回为 cellSet，再由 setsToZones 转 zone
    ( cellSetToCellZone wakeCells )
);
```

第 3 步的 `subtract` 语法是“目标集 源集 参数”，两个名字相同时表示原地更新。这一写法比先建两个集再合并更省事，但也更容易写成自我引用而看不到效果，所以必须靠日志中的数量核对。

## 数量核对与手算对照

选中数量是最可靠的中间证据。取圆柱 $R=0.15\,\mathrm{m}$、$L=0.6\,\mathrm{m}$，几何体积

$$
V_{cyl}=\pi R^{2}L=\pi\times0.0225\times0.6=4.241\times10^{-2}\,\mathrm{m^{3}}
$$

若该处单元尺寸为 $5\,\mathrm{mm}$，单元体积 $1.25\times10^{-7}\,\mathrm{m^3}$，预期单元数

$$
N\approx\frac{V_{cyl}}{h^{3}}=\frac{4.241\times10^{-2}}{1.25\times10^{-7}}=3.39\times10^{5}
$$

因为圆柱表面会把边界单元切成非整数体积，实际选中数通常比该估计少 5%～15%，落在 $2.9\times10^{5}\sim3.3\times10^{5}$ 之间都算正常。若日志给出 2000 或 30 万以外的一个数量级，基本可以直接判定坐标或单位写错。

```bash
topoSet -dict system/topoSetDict 2>&1 | tee log.topoSet
grep -E "Selected|Found" log.topoSet
setsToZones -noFlipMap 2>&1 | tee log.setsToZones
```

`log.topoSet` 中每步都会打印类似 `Selected 314592 cells` 的行，把每步的数量按顺序抄进记录，就能一眼看出是哪一步把集合清空了。

## 面集派生与法向

从单元集派生面集常用 `cellToFace`，参数 `option all | both | inside | outside`：

```text
( cellToFace
  wakeFaces
  {
      set     wakeCyl;
      option  both;      // 取该单元集与外部相邻的全部面
  }
)
```

`option inside` 只取两侧都在集合内的面，`outside` 只取一侧在集合内的面，`both` 取两者并集。选错 `option` 会直接改变面集的几何含义：用 `inside` 去建内部监测面会得到集合内部的面（往往远少于预期），用 `outside` 会得到集合的外壳。工程上建议先用 `both` 建一个可核对的面集，再按需要收窄。

并行运行时 `topoSet` 默认在每个进程上独立执行并同步集合。若上游集合在某个进程上为空，同步后的全局集合仍然正确，但局部进程的计数会显示 0，不能据此判断失败。跨进程比较时应统一看 `constant/polyMesh/sets` 下的全局文件，或加 `-noSync` 后自行核对每个 `processor*/` 目录。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 目标集合为空 | 上游集合为空或坐标单位是 mm | 看每步日志的 `Selected N cells` 逐步递减到 0 的位置 |
| 选中的区域与预期镜像 | 坐标系方向或 `p1/p2` 顺序写反 | 打印包围盒并与网格 `Overall domain bounding box` 对照 |
| 结果包含上一次的单元 | 未在链首 `clear` | 加 `clear` 后重跑，比较数量是否下降 |
| `subtract` 后数量不变 | 源集合与目标集合写成了同一个名字 | 改成两个不同集合名重跑 |
| 面集包含集合内部的面 | `cellToFace` 的 `option` 取了 `inside` | 改 `both` 后面数应显著增加 |
| 并行结果与串行不同 | 未同步或同步顺序不同 | 串行重跑一次并与 `processor*/` 结果对比 |
| 派生面集法向朝内 | 派生自 `faceToCell` 而非 `cellToFace` | 检查面法向与所属单元的朝向关系 |
| 转 zone 后求解器仍找不到 | 只跑了 `topoSet` 未跑 `setsToZones` | 检查 `constant/polyMesh/cellZones` 是否存在 |

## 链式记录的写法

一次 `topoSet` 运行应留下一张“步骤-动作-集合名-数量”的表，例如：`1 clear - -；2 cylinderToCell wakeCyl 314592；3 boxToCell nearBody 1728；4 subtract wakeCyl 312864；5 cellSetToCellZone wakeCells 312864`。这张表把每一步的中间结果固定下来，之后无论改半径、改坐标还是改网格分辨率，都能立刻定位到数量异常的那一步。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §5.2.1 "topoSet and setSet", 2023.
2. OpenFOAM v11 源码 `src/utilities/mesh/manipulation/topoSet/`、`src/OpenFOAM/meshes/polyMesh/sets/cellSet/` 中各类 `topoSetSource` 的实现。
3. OpenFOAM v11 工具文档 `setSet` 的 `-batch`、`-noSync` 选项与 `topoSetDict` 动作类型清单。
4. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007, §4.1 "Grid arrangement and cell selection".
5. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020, §9.1 "Domain decomposition and region selection".
6. OpenFOAM v11 教程 `tutorials/incompressible/pimpleFoam/RAS/` 中若干算例的 `system/topoSetDict` 尾流加密写法。
7. Moukalled F., Mangani L., Darwish M. 《The Finite Volume Method in Computational Fluid Dynamics》. Springer, 2016.
8. Marić T., Höpken J., Mooney K. 《The OpenFOAM Technology Primer》. Sourceflux, 2014.
9. Jasak H. 《Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows》. Imperial College London, 1996.
