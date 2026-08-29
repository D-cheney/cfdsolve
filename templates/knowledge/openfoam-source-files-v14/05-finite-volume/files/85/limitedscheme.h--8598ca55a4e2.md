---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-8598ca55a4e2"
title: "OpenFOAM 14 源码解析：LimitedScheme.H"
summary: "该文件声明或实现 `LimitedScheme`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/LimitedScheme/LimitedScheme.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：LimitedScheme.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/LimitedScheme/LimitedScheme.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：252 行
- 文件标识：`8598ca55a4e2`

## 2. 功能说明

该文件声明或实现 `LimitedScheme`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Class to create NVD/TVD limited weighting-factors. The particular interpolation scheme class is supplied as a template argument, the weight function of which is called by the weight function of this class for the internal faces as well as faces of coupled patches (e.g. processor-processor patches). The weight function is supplied the centred interpolation weighting factor, the face-flux, the cell and face gradients (from which the normalised variable distribution may be created) and the cell centre distance. This code organisation is both neat and efficient, allowing for convenient implementation of new schemes to run on parallelised cases.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LimitedScheme` | 68 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`limitedSurfaceInterpolationScheme.H`](../../../05-finite-volume/files/c8/limitedsurfaceinterpolationscheme.h--c8a5897ffa65.md)
- [`LimitFuncs.H`](../../../05-finite-volume/files/e5/limitfuncs.h--e596899ab0b0.md)
- [`NVDTVD.H`](../../../05-finite-volume/files/68/nvdtvd.h--6857f1e95df4.md)
- [`NVDVTVDV.H`](../../../05-finite-volume/files/35/nvdvtvdv.h--35799a5e9c9e.md)
- [`LimitedScheme.C`](../../../05-finite-volume/files/0a/limitedscheme.c--0ad6ea7e9a05.md)

## 8. 直接上层引用

- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/filteredLinear/filteredLinear.C](../../../05-finite-volume/files/39/filteredlinear.c--39f5cb86e351.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/filteredLinear2/filteredLinear2.C](../../../05-finite-volume/files/c2/filteredlinear2.c--c250d784aa7a.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/filteredLinear3/filteredLinear3.C](../../../05-finite-volume/files/c6/filteredlinear3.c--c61486800712.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/Gamma/Gamma.C](../../../05-finite-volume/files/99/gamma.c--99072acb2d13.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/limitedCubic/limitedCubic.C](../../../05-finite-volume/files/66/limitedcubic.c--661e4d513231.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/limitedLinear/limitedLinear.C](../../../05-finite-volume/files/ee/limitedlinear.c--ee09f6128897.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/Minmod/Minmod.C](../../../05-finite-volume/files/16/minmod.c--16cc9731b81c.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/MUSCL/MUSCL.C](../../../05-finite-volume/files/cd/muscl.c--cdbe0220228d.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/OSPRE/OSPRE.C](../../../05-finite-volume/files/3f/ospre.c--3fec44a26480.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/QUICK/QUICK.C](../../../05-finite-volume/files/1d/quick.c--1d45df70ffe6.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/SFCD/SFCD.C](../../../05-finite-volume/files/4d/sfcd.c--4dd77a7aceaf.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/SuperBee/SuperBee.C](../../../05-finite-volume/files/b9/superbee.c--b90eb4377dc6.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/UMIST/UMIST.C](../../../05-finite-volume/files/c9/umist.c--c984ea7a41e0.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/vanAlbada/vanAlbada.C](../../../05-finite-volume/files/e4/vanalbada.c--e4069d350479.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/vanLeer/vanLeer.C](../../../05-finite-volume/files/aa/vanleer.c--aad330d362e4.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/multivariateSchemes/Gamma/multivariateGamma.C](../../../05-finite-volume/files/ca/multivariategamma.c--ca5df5fa8f51.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/multivariateSchemes/limitedCubic/multivariateLimitedCubic.C](../../../05-finite-volume/files/e1/multivariatelimitedcubic.c--e125fb2dae14.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/multivariateSchemes/limitedLinear/multivariateLimitedLinear.C](../../../05-finite-volume/files/49/multivariatelimitedlinear.c--49dbec5ef8f5.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/multivariateSchemes/Minmod/multivariateMinmod.C](../../../05-finite-volume/files/e5/multivariateminmod.c--e5e8378aa5c3.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/multivariateSchemes/MUSCL/multivariateMUSCL.C](../../../05-finite-volume/files/8b/multivariatemuscl.c--8b705ecc3d27.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/multivariateSchemes/SuperBee/multivariateSuperBee.C](../../../05-finite-volume/files/8b/multivariatesuperbee.c--8b6542ed325e.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/multivariateSchemes/vanLeer/multivariateVanLeer.C](../../../05-finite-volume/files/9e/multivariatevanleer.c--9e64cbda00f7.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
