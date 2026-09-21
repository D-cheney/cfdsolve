---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-mesh-conversion-engineering-setup
title: "外部网格转换：工程设置与参数选择"
summary: "给出 Fluent、Gmsh、STAR-CCM+ 等格式转入 OpenFOAM 的缩放与 patch 映射方法，用包围盒和总体积两项做单位核对，并列出退化单元与 zone 丢失的排查路径。"
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
  - "外部网格转换"
  - "工程设置与参数选择"
  - "fluentMeshToFoam"
  - "gmshToFoam"
seo:
  title: "外部网格转换：工程设置与参数选择"
  description: "给出 Fluent、Gmsh、STAR-CCM+ 等格式转入 OpenFOAM 的缩放与 patch 映射方法，用包围盒和总体积两项做单位核对，并列出退化单元与 zone 丢失的排查路径。"
  keywords:
    - "外部网格转换"
    - "工程设置与参数选择"
    - "fluentMeshToFoam"
    - "gmshToFoam"
---

# 外部网格转换：工程设置与参数选择

从商业前处理或开源网格器转入 OpenFOAM，出错的地方几乎不在转换器本身，而在三件事：单位是否一致、边界类型是否映射正确、zone 是否被保留。这三件事都能在转换后立即用两个数字判定——`Overall domain bounding box` 和 `Total volume`。把这两项核对做成固定动作，可以把大部分“导入后算不对”的问题挡在求解之前。

## 单位缩放与体积立方关系

各转换器都提供 `-scale` 选项，对坐标做线性缩放。设源文件单位为 mm、目标为 m，则

$$
\mathbf{x}_{FOAM}=s\,\mathbf{x}_{src},\qquad s=\frac{L_{target}}{L_{measured}},\qquad V_{FOAM}=s^{3}V_{src}
$$

体积按 $s^{3}$ 缩放，这一点常被忽略。设一个通道在源文件里的尺寸是 $250\times50\times10\,\mathrm{mm^3}$，体积 $1.25\times10^{5}\,\mathrm{mm^3}$。取 $s=0.001$ 后长度变成 $0.25\,\mathrm{m}\times0.05\,\mathrm{m}\times0.01\,\mathrm{m}$，体积

$$
V_{FOAM}=0.001^{3}\times1.25\times10^{5}=1.25\times10^{-4}\,\mathrm{m^{3}}
$$

若忘了缩放，`checkMesh` 会报 `Total volume = 0.125`（单位被当成 m³），比正确值大 $10^{9}$ 倍。这个量级差异一眼可辨，是判断单位问题最快的信号。

缩放也可以在转换后用 `transformPoints` 补做：

```bash
transformPoints -scale "(0.001 0.001 0.001)" 2>&1 | tee log.transformPoints
```

但补做缩放不会更新已有的场文件与 zone 定义中的长度量，因此只在纯网格场景下使用。带 zone 的网格应在转换时就用 `-scale`。

## 各格式的转换命令与关键选项

```bash
# Fluent .msh（二维或三维，自动识别）
fluentMeshToFoam -scale 0.001 -writeSets vtk case.msh 2>&1 | tee log.convert

# Gmsh .msh（v2 与 v4 格式）
gmshToFoam -scale 0.001 mesh.msh 2>&1 | tee log.convert

# STAR-CCM+ 导出的 .ccm
ccm26ToFoam -scale 0.001 case.ccm 2>&1 | tee log.convert

# 转换回 Fluent 用于交付
foamMeshToFluent 2>&1 | tee log.export
```

`-writeSets vtk` 会把源文件里的 cell zone 与 face zone 写成 VTK 集合，便于转换后用 `setsToZones` 恢复成 OpenFOAM 的 zone。不带这个选项时，zone 信息通常只留在日志里，转换完就找不回来了。`-noBoundary` 用于源文件没有边界信息、只想导入网格体的场合。

## patch 类型映射与二次修正

转换器只能做有限的类型映射：Fluent 的 `wall`、`pressure-inlet`、`pressure-outlet`、`symmetry`、`interior` 大体能对应到 OpenFOAM 的 `wall`、`patch`、`symmetryPlane`、`internal`，但 `velocity-inlet` 与 `pressure-inlet` 都会被压成 `patch`，因为边界条件的物理含义不在网格文件里。转换后必须用 `changeDictionary` 或手工编辑 `boundary` 补回正确类型：

```text
// system/changeDictionaryDict
boundary
{
    inlet
    {
        type        patch;
    }
    outlet
    {
        type        patch;
    }
    symmetryPlane1
    {
        type        symmetryPlane;
    }
    blade
    {
        type        wall;
    }
}
```

类型写错的后果各不相同：把 `symmetryPlane` 写成 `patch` 会引入人为的穿透通量；把 `internal` 写成 `wall` 会在内部插出一层无滑移面，表现为压降莫名增大。所以类型映射必须逐条核对，而不是信任转换器的默认输出。

## 两项数值核对

```bash
checkMesh -allGeometry -allTopology | tee log.checkMesh.converted
grep -E "bounding box|Total volume|Min volume|non-orthogonality|skewness" log.checkMesh.converted
```

第一项核对是包围盒。设 CAD 中流体域的实际范围是 $x\in[0,0.25]$、$y\in[0,0.05]$、$z\in[0,0.01]$，则 `checkMesh` 必须打印 `Overall domain bounding box (0 0 0) (0.25 0.05 0.01)`。任何分量的量级偏差都指向单位问题。

第二项核对是总体积。把 `Total volume` 与 CAD 计算值比较，相对误差

$$
\epsilon_V=\frac{\left|V_{mesh}-V_{CAD}\right|}{V_{CAD}}
$$

若 CAD 的净流体体积为 $1.253\times10^{-4}\,\mathrm{m^3}$、网格报告 $1.25\times10^{-4}\,\mathrm{m^3}$，则 $\epsilon_V=0.24\%$。多面体网格对曲面边界的体积误差通常在 $0.1\%\sim1\%$ 之间，超过 $2\%$ 就要检查是否漏掉了内部零件或存在退化单元。

## 退化单元与 zone 丢失

外部网格器的容差设置与 OpenFOAM 不同，常带来两类问题：面积极小的退化面和体积接近零的薄单元。`checkMesh` 会通过 `Min volume` 与 `Min determinant` 暴露它们；`-writeSets vtk` 可以把坏单元导出后在 ParaView 中定位。处理方式通常是回到源网格器重新生成，而不是在 OpenFOAM 里修补。

zone 丢失的判定更直接：转换后检查 `constant/polyMesh/cellZones` 与 `faceZones` 是否存在且非空。若源文件里有 5 个 cell zone 而 OpenFOAM 只得到 2 个，多半是转换器不支持该 zone 类型（例如 STAR-CCM+ 的 `Interface` 类型），需要用 `topoSet` 按坐标重建。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 网格尺寸大 1000 倍 | 源单位是 mm，转换时未加 `-scale` | `checkMesh` 的 bounding box 与 CAD 对照 |
| 体积比 CAD 大 $10^{9}$ 倍 | 长度缩放未做，体积按三次方放大 | 用 $V_{FOAM}=s^3V_{src}$ 反算 $s$ |
| 全部 patch 都是 `patch` 类型 | 源求解器边界类型未映射 | 检查 `boundary` 中每个 patch 的 `type` |
| 内部面被当成壁面 | `internal` 被映射成 `wall` | 对比压降与无挡板算例 |
| 对称面产生穿透通量 | `symmetryPlane` 被映射成 `patch` | 检查对称面上法向速度是否为零 |
| `Min volume` 接近零 | 源网格存在退化或薄单元 | `-writeSets vtk` 导出坏单元定位 |
| cellZone 数量少于源文件 | 转换器不支持该 zone 类型 | 对比 `-writeSets vtk` 的集合数与源文件 |
| 转换器直接崩溃 | 源文件版本不被支持（如 Gmsh v4.1） | 用源网格器降版本重新导出 |

## 转换记录与交付

一次转换至少要留下六项：源文件名与哈希、转换器名与版本、`-scale` 取值、`log.convert`、转换后 `checkMesh` 的包围盒与总体积、以及 patch 类型映射表（源名 → 目标名 → 类型）。这六项齐了，别人才能在不动源网格的前提下复现同一个 `polyMesh`；缺了缩放这一项，后续所有基于长度的设置（边界层厚度、时间步、参考长度）都会一起错。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §3.6 "Mesh conversion", 2023.
2. OpenFOAM v11 源码 `src/utilities/mesh/conversion/fluentMeshToFoam/`、`gmshToFoam/`、`ccm26ToFoam/` 与 `src/utilities/mesh/manipulation/transformPoints/`。
3. C. Geuzaine, J.-F. Remacle, "Gmsh: a three-dimensional finite element mesh generator with built-in pre- and post-processing facilities", *International Journal for Numerical Methods in Engineering*, 79(11): 1309–1331, 2009.
4. ANSYS Inc., *ANSYS Fluent User's Guide*, Chapter 6 "Reading and Writing Files — Mesh File Formats", 2023.
5. J. F. Thompson, B. K. Soni, N. P. Weatherill (eds.), *Handbook of Grid Generation*, CRC Press, 1999, Chapter 22 "Mesh exchange formats and interoperability".
6. P. J. Frey, P.-L. George, *Mesh Generation: Application to Finite Elements*, 2nd ed., ISTE/Wiley, 2008, §10.2 "Mesh file formats and data transfer".
