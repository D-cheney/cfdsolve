---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3ff7ee67e8e7"
title: "OpenFOAM 14 源码解析：externalCoupledMixedFvPatchField.H"
summary: "该文件实现 `externalCoupledMixedFvPatchField` 相关对象的读取、写出或流序列化。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/fvPatchFields/derived/externalCoupledMixed/externalCoupledMixedFvPatchField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：externalCoupledMixedFvPatchField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/fvPatchFields/derived/externalCoupledMixed/externalCoupledMixedFvPatchField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：346 行
- 文件标识：`3ff7ee67e8e7`

## 2. 功能说明

该文件实现 `externalCoupledMixedFvPatchField` 相关对象的读取、写出或流序列化。

中文导航角色：有限体积离散核心。

上游说明：This boundary condition provides an interface to an external application. Values are transferred as plain text files, where OpenFOAM data is written as: \verbatim # Patch: <patch name> <magSf1> <value1> <surfaceNormalGradient1> <magSf2> <value2> <surfaceNormalGradient2> <magSf3> <value3> <surfaceNormalGradient3> ... <magSfN> <valueN> <surfaceNormalGradientN> \endverbatim and received as the constituent pieces of the `mixed' condition, i.e. \verbatim # Patch: <patch name> <value1> <gradient1> <valueFraction1> <value2> <gradient2> <valueFraction2> <value3> <gradient3> <valueFraction3> ... <valueN> <gradientN> <valueFractionN> \endverbatim Data is sent/received as a single file for all patches from the directory \verbatim \&#36;FOAM_CASE/<commsDir> \endverbatim At start-up, the boundary creates a lock file, i.e.. \verbatim OpenFOAM.lock \endverbatim ... to signal the external source to wait. Dur

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `IFstream` | 131 |
| `externalCoupledMixedFvPatchField` | 137 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `log` | 292 |
| `master` | 298 |

## 5. 算法与控制流程

1. **并行归约/通信**：在处理器间交换或归约局部量，形成全局一致结果。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
3. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`mixedFvPatchFields.H`](../../../05-finite-volume/files/fd/mixedfvpatchfields.h--fde273d73f26.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`externalCoupledMixedFvPatchField.C`](../../../05-finite-volume/files/2f/externalcoupledmixedfvpatchfield.c--2fd521aa3e73.md)

## 8. 直接上层引用

- [applications/utilities/preProcessing/createExternalCoupledPatchGeometry/createExternalCoupledPatchGeometryTemplates.C](../../../03-utilities/files/65/createexternalcoupledpatchgeometrytemplates.c--6577e51aee91.md)
- [src/finiteVolume/fields/fvPatchFields/derived/externalCoupledMixed/externalCoupledMixedFvPatchField.C](../../../05-finite-volume/files/2f/externalcoupledmixedfvpatchfield.c--2fd521aa3e73.md)
- [src/finiteVolume/fields/fvPatchFields/derived/externalCoupledMixed/externalCoupledMixedFvPatchFields.H](../../../05-finite-volume/files/8f/externalcoupledmixedfvpatchfields.h--8fceda4a5a9e.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
