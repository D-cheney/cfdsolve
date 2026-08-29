---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9dfbbe4fcc40"
title: "OpenFOAM 14 源码解析：Limited01.H"
summary: "该文件声明或实现 `Limited01Limiter`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/Limited01/Limited01.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：Limited01.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/Limited01/Limited01.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：75 行
- 文件标识：`9dfbbe4fcc40`

## 2. 功能说明

该文件声明或实现 `Limited01Limiter`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：A LimitedLimiter with the range 0-1

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Limited01Limiter` | 51 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`Limited.H`](../../../05-finite-volume/files/9d/limited.h--9dbdbe8f849a.md)

## 8. 直接上层引用

- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/Gamma/Gamma.C](../../../05-finite-volume/files/99/gamma.c--99072acb2d13.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/limitedCubic/limitedCubic.C](../../../05-finite-volume/files/66/limitedcubic.c--661e4d513231.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/limitedLinear/limitedLinear.C](../../../05-finite-volume/files/ee/limitedlinear.c--ee09f6128897.md)
- [src/finiteVolume/interpolation/surfaceInterpolation/limitedSchemes/MUSCL/MUSCL.C](../../../05-finite-volume/files/cd/muscl.c--cdbe0220228d.md)
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

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
