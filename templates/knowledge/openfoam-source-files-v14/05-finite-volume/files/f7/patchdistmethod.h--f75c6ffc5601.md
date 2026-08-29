---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f75c6ffc5601"
title: "OpenFOAM 14 源码解析：patchDistMethod.H"
summary: "该文件声明或实现 `fvMesh`、`patchDistMethod`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMesh/wallDist/patchDistMethods/patchDistMethod/patchDistMethod.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：patchDistMethod.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMesh/wallDist/patchDistMethods/patchDistMethod/patchDistMethod.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：192 行
- 文件标识：`f75c6ffc5601`

## 2. 功能说明

该文件声明或实现 `fvMesh`、`patchDistMethod`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Specialisation of patchDist for wall distance calculation

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMesh` | 56 |
| `patchDistMethod` | 62 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **分布式映射**：依据全局到局部寻址重排和交换数据。
4. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
5. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`polyTopoChangeMap.H`](../../../04-core-runtime/files/9a/polytopochangemap.h--9ad3af9fe142.md)
- [`fixedValueFvPatchFields.H`](../../../05-finite-volume/files/ff/fixedvaluefvpatchfields.h--ff21ae834f83.md)
- [`zeroGradientFvPatchFields.H`](../../../05-finite-volume/files/9a/zerogradientfvpatchfields.h--9a96ee93ac86.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`patchDistMethodTemplates.C`](../../../05-finite-volume/files/2d/patchdistmethodtemplates.c--2d8698dfa092.md)

## 8. 直接上层引用

- [src/finiteVolume/fvMesh/wallDist/patchDistMethods/advectionDiffusion/advectionDiffusionPatchDistMethod.H](../../../05-finite-volume/files/a8/advectiondiffusionpatchdistmethod.h--a8ac4552e875.md)
- [src/finiteVolume/fvMesh/wallDist/patchDistMethods/meshWave/meshWavePatchDistMethod.H](../../../05-finite-volume/files/5d/meshwavepatchdistmethod.h--5d9879b763a9.md)
- [src/finiteVolume/fvMesh/wallDist/patchDistMethods/patchDistMethod/patchDistMethod.C](../../../05-finite-volume/files/e2/patchdistmethod.c--e219ba703609.md)
- [src/finiteVolume/fvMesh/wallDist/patchDistMethods/patchDistMethod/patchDistMethodTemplates.C](../../../05-finite-volume/files/2d/patchdistmethodtemplates.c--2d8698dfa092.md)
- [src/finiteVolume/fvMesh/wallDist/patchDistMethods/Poisson/PoissonPatchDistMethod.H](../../../05-finite-volume/files/ae/poissonpatchdistmethod.h--ae2fe5d28002.md)
- [src/finiteVolume/fvMesh/wallDist/wallDist/wallDist.H](../../../05-finite-volume/files/4f/walldist.h--4f861db401ea.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
