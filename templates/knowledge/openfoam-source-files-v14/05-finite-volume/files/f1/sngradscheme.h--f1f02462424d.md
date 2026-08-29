---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f1f02462424d"
title: "OpenFOAM 14 源码解析：snGradScheme.H"
summary: "该文件声明或实现 `fvMesh`、`snGradScheme`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/finiteVolume/snGradSchemes/snGradScheme/snGradScheme.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：snGradScheme.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/finiteVolume/snGradSchemes/snGradScheme/snGradScheme.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：234 行
- 文件标识：`f1f02462424d`

## 2. 功能说明

该文件声明或实现 `fvMesh`、`snGradScheme`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Abstract base class for snGrad schemes.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMesh` | 54 |
| `snGradScheme` | 65 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`tmp.H`](../../../04-core-runtime/files/ae/tmp.h--aed1da89cfb2.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`surfaceFieldsFwd.H`](../../../05-finite-volume/files/e4/surfacefieldsfwd.h--e4d506ea371b.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`snGradScheme.C`](../../../05-finite-volume/files/aa/sngradscheme.c--aa7a4173fa6f.md)

## 8. 直接上层引用

- [src/finiteVolume/finiteVolume/fvc/fvcSnGrad.C](../../../05-finite-volume/files/58/fvcsngrad.c--58d49265e5bc.md)
- [src/finiteVolume/finiteVolume/snGradSchemes/CentredFitSnGrad/CentredFitSnGradScheme.H](../../../05-finite-volume/files/45/centredfitsngradscheme.h--45acf798d4b8.md)
- [src/finiteVolume/finiteVolume/snGradSchemes/correctedSnGrad/correctedSnGrad.H](../../../05-finite-volume/files/e4/correctedsngrad.h--e4b3aa35861e.md)
- [src/finiteVolume/finiteVolume/snGradSchemes/faceCorrectedSnGrad/faceCorrectedSnGrad.H](../../../05-finite-volume/files/d6/facecorrectedsngrad.h--d69e6ec1927b.md)
- [src/finiteVolume/finiteVolume/snGradSchemes/orthogonalSnGrad/orthogonalSnGrad.H](../../../05-finite-volume/files/1c/orthogonalsngrad.h--1c25cac6d80f.md)
- [src/finiteVolume/finiteVolume/snGradSchemes/snGradScheme/snGradScheme.C](../../../05-finite-volume/files/aa/sngradscheme.c--aa7a4173fa6f.md)
- [src/finiteVolume/finiteVolume/snGradSchemes/snGradScheme/snGradSchemes.C](../../../05-finite-volume/files/58/sngradschemes.c--58f48fae7ccc.md)
- [src/finiteVolume/finiteVolume/snGradSchemes/uncorrectedSnGrad/uncorrectedSnGrad.H](../../../05-finite-volume/files/8f/uncorrectedsngrad.h--8f38aac83889.md)

## 9. 运行时机制

`declareRunTimeSelectionTable`、`defineNamedTemplateTypeNameAndDebug`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
