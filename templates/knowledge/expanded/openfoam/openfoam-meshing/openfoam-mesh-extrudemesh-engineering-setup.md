---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-extrudemesh-engineering-setup
title: "extrudeMesh 拉伸网格：工程设置与参数选择"
summary: "给出 extrudeMesh 四种挤出模型的字典写法、层厚与总厚的关系、法向翻转与合并容差的取值，以及 2D 转 3D 与楔形轴对称算例的核对方法。"
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
  - "extrudeMesh 拉伸网格"
  - "工程设置与参数选择"
  - "extrudeModel"
  - "wedge"
seo:
  title: "extrudeMesh 拉伸网格：工程设置与参数选择"
  description: "给出 extrudeMesh 四种挤出模型的字典写法、层厚与总厚的关系、法向翻转与合并容差的取值，以及 2D 转 3D 与楔形轴对称算例的核对方法。"
  keywords:
    - "extrudeMesh 拉伸网格"
    - "工程设置与参数选择"
    - "extrudeModel"
    - "linearNormal"
---

# extrudeMesh 拉伸网格：工程设置与参数选择

`extrudeMesh` 把一个 patch 沿给定方向复制并连接，常用于两件事：把二维网格扩成一层厚的三维网格，以及把二维轴对称网格扩成一个窄楔形。它不改动源面本身，只在源面外侧生成新单元，所以参数只有三组：挤出模型、层数与厚度、合并与法向开关。

## 层厚分配与总厚度

`linearNormal` 模型的 `thickness` 是**所有层加起来的总厚度**，不是单层厚度。层厚按几何级数分配：

$$
H=t_1\frac{r^{\,n}-1}{r-1},\qquad t_1=\frac{H(r-1)}{r^{\,n}-1},\qquad t_k=t_1 r^{\,k-1}
$$

其中 $H$ 是字典里的 `thickness`、$r$ 是 `expansionRatio`、$n$ 是 `nLayers`。取 $H=0.05\,\mathrm{m}$、$n=5$、$r=1.2$：

$$
t_1=\frac{0.05\times0.2}{1.2^{5}-1}=\frac{0.01}{1.48832}=6.72\times10^{-3}\,\mathrm{m}
$$

首层 6.72 mm，末层 $t_5=6.72\times10^{-3}\times1.2^{4}=1.392\times10^{-2}\,\mathrm{m}$，五层之和 $6.72+8.06+9.68+11.61+13.92=50.0\,\mathrm{mm}$，与 $H$ 自洽。若把 `thickness` 误当成单层厚度，实际总厚会变成 250 mm，是整个域尺度的量级错误，而 `extrudeMesh` 不会报警。

当 `expansionRatio 1.0` 时分配退化均匀：$n=4$、$H=0.02\,\mathrm{m}$ 时每层 $0.02/4=5.0\,\mathrm{mm}$。

## 四种挤出模型的适用场合

- `linearNormal`：沿源面各自法向挤出，要求源面近似共面；适合平板、端面。
- `linearDirection`：沿固定向量挤出，源面可以不在同一平面；适合斜切端面。
- `wedge`：绕轴旋转一个小角度，用于二维轴对称；`nLayers 1` 配一个 5° 楔角即可。
- `sector` / `cylindrical` / `radial`：按角度或半径映射，用于回转体的一段。

二维轴对称的标准写法是单层楔形，角度取 5°：

```text
// system/extrudeMeshDict
constructFrom   patch;
sourceCase      ".";
sourcePatches   ( frontAndBack );

extrudeModel    wedge;
nLayers         1;
expansionRatio  1.0;

wedgeCoeffs
{
    axis        (0 0 1);
    angle       5;
}

flipNormals     false;
mergeFaces      true;
mergeTol        1e-6;
```

`angle 5` 的单位是度。若误填成弧度制的 0.087，楔角只有 5° 的百分之一，求解器会把 `frontAndBack` 判成 `empty` 而不是 `wedge`，轴对称条件失效。

## 二维转三维的层数与单元数

`extrudeMesh` 不改变源面的面内分辨率，单元数按层数线性增长：

$$
N_{3D}=N_{2D}\times n
$$

设源二维网格 4800 个单元，取 `nLayers 1` 得 4800 个单元，`nLayers 4` 得 19200 个单元。层数越多，展向分辨率越高，但每层都要满足质量约束：若源面单元边长 $5\,\mathrm{mm}$、单层厚度 $0.5\,\mathrm{mm}$，长宽比 $10$；若单层厚度取 $5\,\mathrm{mm}$，长宽比 $1$，这是更稳妥的选择。只有当展向确实需要比面内更细的分辨率时（例如展向有剪切层），才用多层薄单元。

挤出后要把源面与新增面的边界类型改对：2D 转 3D 时 `frontAndBack` 要从 `empty` 改成 `patch`（或 `wall`），轴对称时保持 `wedge`。这一步在 `constant/polyMesh/boundary` 里手工改，或者用 `changeDictionary` 批量处理。

```bash
extrudeMesh 2>&1 | tee log.extrudeMesh
checkMesh -allGeometry | tee log.checkMesh.extrude
grep -E "Total volume|Min volume|Max aspect" log.checkMesh.extrude
```

`Total volume` 是最直接的验收量：源面面积 $A$、挤出总厚 $H$ 时应有 $V\approx A\times H$。设源面面积 $0.05\,\mathrm{m^2}$、$H=0.05\,\mathrm{m}$，则 $V\approx2.5\times10^{-3}\,\mathrm{m^3}$；若实测差出 5 倍以上，基本可以断定 `thickness` 被当成了单层厚度。

## 法向与合并

`flipNormals false` 表示新单元沿源面法向正方向生成。若源面法向指向域内（例如从 `outlet` patch 出发向外挤出），新单元会叠在已有网格上，`checkMesh` 报负体积或 `minVol` 为负。判据很简单：挤出后若 `Min volume` 为负，把 `flipNormals` 改成 `true` 重跑即可，不需要重建源网格。

`mergeFaces true` 与 `mergeTol 1e-6` 控制新生成的侧面与已有网格的重合面是否合并。多块挤出拼接时，相邻块在交界处的面若坐标一致，合并后单元数会减少，内部面变成真正连通的内部面；若不合并，会留下两套重合面，`checkMesh` 的 `nFaces` 会偏大，流场在交界处出现人为隔断。`mergeTol` 是相对网格包围盒的容差，取 $10^{-6}$ 对双精度坐标足够；若源面来自单精度外部网格，可放宽到 $10^{-4}$。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Min volume` 为负 | 源面法向指向域内 | 设 `flipNormals true` 重跑对比 |
| 总厚是设计值的 $n$ 倍 | 把 `thickness` 当成单层厚度 | 用 $V\approx A H$ 反算实际总厚 |
| 轴对称算例结果与理论不符 | 楔角写成弧度值，`frontAndBack` 退化为 `empty` | 检查 boundary 中该 patch 的 `type` |
| 交界处出现重合面 | `mergeFaces` 关闭或容差过小 | 开合并后比较 `nFaces` 是否下降 |
| 展向出现高长宽比单元 | 单层厚度远小于面内单元尺寸 | 计算 $AR=h_{面内}/t_k$，控制在 10 以内 |
| 挤出的单元叠在已有网格上 | 源面选择错误（选了内部面） | 对比挤出前后 `Overall domain bounding box` |
| `constructFrom patch` 报找不到源 | `sourcePatches` 名字与 boundary 不符 | 打印 `constant/polyMesh/boundary` 的 patch 列表 |
| 挤出后场文件缺 patch | `0/` 目录未同步新增 patch | 求解器报 `Cannot find patchField` |

## 单因素对照与记录

值得做的对照有三组：`nLayers` 取 1/2/4；`expansionRatio` 取 1.0/1.2/1.5；`flipNormals` 开与关。统一记录源面面积（m²）、$H$（m）、$n$、$r$、$t_1$（mm）、$t_n$（mm）、总单元数、`Total volume`（m³）、`Max aspect ratio`。这套记录足以在换几何时直接复算层厚，而不必重新推敲字典。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §3.3 "Mesh generation with extrudeMesh", 2023.
2. OpenFOAM v11 源码 `src/utilities/mesh/generation/extrudeMesh/`、`src/OpenFOAM/meshes/primitiveShapes/extrudeModel/` 中各模型的 `extrudeModel` 派生类。
3. OpenFOAM v11 教程 `tutorials/mesh/extrudeMesh/` 与 `tutorials/incompressible/simpleFoam/` 下的二维轴对称楔形算例。
4. J. F. Thompson, B. K. Soni, N. P. Weatherill (eds.), *Handbook of Grid Generation*, CRC Press, 1999, Chapter 3 "Algebraic and transfinite interpolation methods".
5. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007, §5.2 "Axisymmetric and 2D approximations".
6. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020, §9.2 "Extrusion and structured block methods".
