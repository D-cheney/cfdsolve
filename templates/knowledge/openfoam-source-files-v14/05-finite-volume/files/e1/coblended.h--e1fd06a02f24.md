---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e1fd06a02f24"
title: "OpenFOAM 14 源码解析：CoBlended.H"
summary: "该文件实现 `CoBlended` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/interpolation/surfaceInterpolation/schemes/CoBlended/CoBlended.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：CoBlended.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/interpolation/surfaceInterpolation/schemes/CoBlended/CoBlended.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：336 行
- 文件标识：`e1fd06a02f24`

## 2. 功能说明

该文件实现 `CoBlended` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：有限体积离散核心。

上游说明：Two-scheme Courant number based blending interpolation scheme. Similar to localBlended but uses a blending factor computed from the face-based Courant number and the lower and upper Courant number limits supplied: \f[ weight = 1 - max(min((Co - Co1)/(Co2 - Co1), 1), 0) \f] where \vartable Co1 | Courant number below which scheme1 is used Co2 | Courant number above which scheme2 is used \endvartable The weight applies to the first scheme and 1-weight to the second scheme. Example of the CoBlended scheme specification using LUST for Courant numbers less than 1 and linearUpwind for Courant numbers greater than 10: \verbatim divSchemes { . . div(phi,U) Gauss CoBlended 1 LUST grad(U) 10 linearUpwind grad(U); . . } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `CoBlended` | 83 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`surfaceInterpolationScheme.H`](../../../05-finite-volume/files/10/surfaceinterpolationscheme.h--10c72ee316fc.md)
- [`blendedSchemeBase.H`](../../../05-finite-volume/files/75/blendedschemebase.h--751f330483fc.md)
- `surfaceInterpolate.H`

## 8. 直接上层引用

- [src/finiteVolume/interpolation/surfaceInterpolation/schemes/CoBlended/CoBlended.C](../../../05-finite-volume/files/4a/coblended.c--4af440b04509.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
