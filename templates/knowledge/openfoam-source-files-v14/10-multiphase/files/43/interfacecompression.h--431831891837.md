---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-431831891837"
title: "OpenFOAM 14 源码解析：interfaceCompression.H"
summary: "该文件实现 `interfaceCompression` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/interfaceCompression/interfaceCompression/interfaceCompression.H"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：interfaceCompression.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/interfaceCompression/interfaceCompression/interfaceCompression.H`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：163 行
- 文件标识：`431831891837`

## 2. 功能说明

该文件实现 `interfaceCompression` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：两相流与界面模型。

上游说明：Interface compression corrected scheme, based on counter-gradient transport, to maintain sharp interfaces during VoF simulations. The interface compression is applied to the face interpolated field from a suitable 2nd-order shape-preserving NVD or TVD scheme, e.g. vanLeer or vanAlbada. A coefficient is supplied to control the degree of compression, with a value of 1 suitable for most VoF cases to ensure interface integrity. A value larger than 1 can be used but the additional compression can bias the interface to follow the mesh more closely while a value smaller than 1 can lead to interface smearing. Example: \verbatim divSchemes { . . div(phi,alpha) Gauss interfaceCompression vanLeer 1; . . } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `interfaceCompressionNew` | 83 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`surfaceInterpolationScheme.H`](../../../05-finite-volume/files/10/surfaceinterpolationscheme.h--10c72ee316fc.md)

## 8. 直接上层引用

- [applications/modules/twoPhaseVoFSolver/twoPhaseVoFSolver.C](../../../02-solver-modules/files/80/twophasevofsolver.c--80a389978fb5.md)
- [src/functionObjects/solvers/scalarTransport/scalarTransport.C](../../../14-postprocessing/files/88/scalartransport.c--88c19cb5c21e.md)
- [src/twoPhaseModels/interfaceCompression/interfaceCompression/interfaceCompression.C](../../../10-multiphase/files/df/interfacecompression.c--df42a94972e9.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
