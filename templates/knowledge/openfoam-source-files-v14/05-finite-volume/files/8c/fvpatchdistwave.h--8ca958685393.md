---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-8ca958685393"
title: "OpenFOAM 14 源码解析：fvPatchDistWave.H"
summary: "该文件声明或实现 `FvWallInfoType`、`TrackingData`、`GeoMesh`、`WallLocation`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/wallDist/fvPatchDistWave/fvPatchDistWave.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：fvPatchDistWave.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/wallDist/fvPatchDistWave/fvPatchDistWave.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：236 行
- 文件标识：`8ca958685393`

## 2. 功能说明

该文件声明或实现 `FvWallInfoType`、`TrackingData`、`GeoMesh`、`WallLocation`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Takes a set of patches to start FvFaceCellWave from and computed the distance at patches and possibly additional transported data.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `FvWallInfoType` | 77 |
| `TrackingData` | 78 |
| `GeoMesh` | 79 |
| `WallLocation` | 126 |
| `DataType` | 129 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`FvFaceCellWave.H`](../../../05-finite-volume/files/dd/fvfacecellwave.h--ddd88ed0a8a4.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`wallPoint.H`](../../../07-mesh-geometry/files/2f/wallpoint.h--2f3172239394.md)
- [`wallFace.H`](../../../07-mesh-geometry/files/21/wallface.h--2130a35ff721.md)
- [`WallLocationData.H`](../../../07-mesh-geometry/files/72/walllocationdata.h--72639c37b30c.md)
- [`FvWallInfo.H`](../../../05-finite-volume/files/2c/fvwallinfo.h--2c654df62986.md)
- [`fvPatchDistWaveTemplates.C`](../../../05-finite-volume/files/df/fvpatchdistwavetemplates.c--df9802383e66.md)

## 8. 直接上层引用

- [src/finiteVolume/fvMesh/wallDist/fvPatchDistWave/fvPatchDistWave.C](../../../05-finite-volume/files/56/fvpatchdistwave.c--5651ddbd8ae9.md)
- [src/finiteVolume/fvMesh/wallDist/fvPatchDistWave/fvPatchDistWaveTemplates.C](../../../05-finite-volume/files/df/fvpatchdistwavetemplates.c--df9802383e66.md)
- [src/finiteVolume/fvMesh/wallDist/nearWallDist/nearWallDist.C](../../../05-finite-volume/files/e0/nearwalldist.c--e0f576fdf337.md)
- [src/finiteVolume/fvMesh/wallDist/patchDistMethods/meshWave/meshWavePatchDistMethod.C](../../../05-finite-volume/files/a1/meshwavepatchdistmethod.c--a17ec2c87331.md)
- [src/fvMeshMovers/fvMotionSolvers/motionDiffusivity/inverseDistance/inverseDistanceDiffusivity.C](../../../07-mesh-geometry/files/fe/inversedistancediffusivity.c--fe73f2a9be20.md)
- [src/fvMeshMovers/fvMotionSolvers/motionDiffusivity/inverseFaceDistance/inverseFaceDistanceDiffusivity.C](../../../07-mesh-geometry/files/cb/inversefacedistancediffusivity.c--cb62b66a4845.md)
- [src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/vanDriestDelta/vanDriestDelta.C](../../../09-turbulence-transport/files/aa/vandriestdelta.c--aa660d8482ff.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
