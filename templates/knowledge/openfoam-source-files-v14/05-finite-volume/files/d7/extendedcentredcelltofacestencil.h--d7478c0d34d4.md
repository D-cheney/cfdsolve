---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d7478c0d34d4"
title: "OpenFOAM 14 源码解析：extendedCentredCellToFaceStencil.H"
summary: "该文件声明或实现 `cellToFaceStencil`、`extendedCentredCellToFaceStencil`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/extendedStencil/cellToFace/extendedCentredCellToFaceStencil.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：extendedCentredCellToFaceStencil.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/extendedStencil/cellToFace/extendedCentredCellToFaceStencil.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：150 行
- 文件标识：`d7478c0d34d4`

## 2. 功能说明

该文件声明或实现 `cellToFaceStencil`、`extendedCentredCellToFaceStencil`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：SourceFiles extendedCentredCellToFaceStencil.C

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `cellToFaceStencil` | 49 |
| `extendedCentredCellToFaceStencil` | 55 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `collectData` | 102 |

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`extendedCellToFaceStencil.H`](../../../05-finite-volume/files/de/extendedcelltofacestencil.h--de520d120da2.md)

## 8. 直接上层引用

- [src/finiteVolume/finiteVolume/snGradSchemes/CentredFitSnGrad/CentredFitSnGradData.C](../../../05-finite-volume/files/5b/centredfitsngraddata.c--5b16f9ec35dd.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToFace/extendedCentredCellToFaceStencil.C](../../../05-finite-volume/files/f7/extendedcentredcelltofacestencil.c--f70298347198.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToFace/MeshObjects/centredCECCellToFaceStencilObject.H](../../../05-finite-volume/files/78/centredceccelltofacestencilobject.h--78301ca789df.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToFace/MeshObjects/centredCFCCellToFaceStencilObject.H](../../../05-finite-volume/files/b0/centredcfccelltofacestencilobject.h--b020d166f1cb.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToFace/MeshObjects/centredCPCCellToFaceStencilObject.H](../../../05-finite-volume/files/e3/centredcpccelltofacestencilobject.h--e3f7c92fbf9c.md)
- [src/finiteVolume/fvMesh/extendedStencil/cellToFace/MeshObjects/centredFECCellToFaceStencilObject.H](../../../05-finite-volume/files/af/centredfeccelltofacestencilobject.h--af626a65feee.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/schemes/CentredFitScheme/CentredFitData.C](../../../05-finite-volume/files/ab/centredfitdata.c--ab41b6ec4c44.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
