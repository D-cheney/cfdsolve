---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-99eb0e4db0f6"
title: "OpenFOAM 14 源码解析：convectionScheme.H"
summary: "该文件声明或实现 `fvMatrix`、`fvMesh`、`convectionScheme`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/finiteVolume/convectionSchemes/convectionScheme/convectionScheme.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：convectionScheme.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/finiteVolume/convectionSchemes/convectionScheme/convectionScheme.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：266 行
- 文件标识：`99eb0e4db0f6`

## 2. 功能说明

该文件声明或实现 `fvMatrix`、`fvMesh`、`convectionScheme`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Abstract base class for convection schemes.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMatrix` | 55 |
| `fvMesh` | 58 |
| `convectionScheme` | 69 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`tmp.H`](../../../04-core-runtime/files/ae/tmp.h--aed1da89cfb2.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`surfaceFieldsFwd.H`](../../../05-finite-volume/files/e4/surfacefieldsfwd.h--e4d506ea371b.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`multivariateSurfaceInterpolationScheme.H`](../../../05-finite-volume/files/a6/multivariatesurfaceinterpolationscheme.h--a602383e2fd2.md)
- [`convectionScheme.C`](../../../05-finite-volume/files/29/convectionscheme.c--29b6aa75e50a.md)

## 8. 直接上层引用

- [src/finiteVolume/finiteVolume/convectionSchemes/boundedConvectionScheme/boundedConvectionScheme.H](../../../05-finite-volume/files/8a/boundedconvectionscheme.h--8abae81b7d85.md)
- [src/finiteVolume/finiteVolume/convectionSchemes/convectionScheme/convectionSchemes.C](../../../05-finite-volume/files/78/convectionschemes.c--7897036b9273.md)
- [src/finiteVolume/finiteVolume/convectionSchemes/gaussConvectionScheme/gaussConvectionScheme.H](../../../05-finite-volume/files/2a/gaussconvectionscheme.h--2abb1c2b592f.md)
- [src/finiteVolume/finiteVolume/convectionSchemes/multivariateGaussConvectionScheme/multivariateGaussConvectionScheme.H](../../../05-finite-volume/files/0a/multivariategaussconvectionscheme.h--0a08a7e66db5.md)
- [src/finiteVolume/finiteVolume/fvc/fvcDiv.C](../../../05-finite-volume/files/da/fvcdiv.c--da35a3b0ee61.md)
- [src/finiteVolume/finiteVolume/fvc/fvcFluxTemplates.C](../../../05-finite-volume/files/ce/fvcfluxtemplates.c--ceff55a3cfb8.md)
- [src/finiteVolume/finiteVolume/fvm/fvmDiv.C](../../../05-finite-volume/files/24/fvmdiv.c--24156fc1821f.md)

## 9. 运行时机制

`declareRunTimeSelectionTable`、`defineNamedTemplateTypeNameAndDebug`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
