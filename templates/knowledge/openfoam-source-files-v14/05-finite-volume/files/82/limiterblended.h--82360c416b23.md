---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-82360c416b23"
title: "OpenFOAM 14 源码解析：limiterBlended.H"
summary: "该文件实现 `limiterBlended` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/interpolation/surfaceInterpolation/schemes/limiterBlended/limiterBlended.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：limiterBlended.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/interpolation/surfaceInterpolation/schemes/limiterBlended/limiterBlended.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：245 行
- 文件标识：`82360c416b23`

## 2. 功能说明

该文件实现 `limiterBlended` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：Blends two specified schemes using the limiter function provided by a limitedSurfaceInterpolationScheme. The limited scheme is specified first followed by the scheme to be scaled by the limiter and then the scheme scaled by 1 - limiter e.g. div(phi,U) Gauss limiterBlended vanLeer linear linearUpwind grad(U);

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `limiterBlended` | 60 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`limitedSurfaceInterpolationScheme.H`](../../../05-finite-volume/files/c8/limitedsurfaceinterpolationscheme.h--c8a5897ffa65.md)

## 8. 直接上层引用

- [src/finiteVolume/interpolation/surfaceInterpolation/schemes/limiterBlended/limiterBlended.C](../../../05-finite-volume/files/f4/limiterblended.c--f416a9fd9d74.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
