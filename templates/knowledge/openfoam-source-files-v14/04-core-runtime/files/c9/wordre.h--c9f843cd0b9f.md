---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c9f843cd0b9f"
title: "OpenFOAM 14 源码解析：wordRe.H"
summary: "该文件声明或实现 `wordRe`、`Istream`、`Ostream`，属于“核心运行时”模块。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/primitives/strings/wordRe/wordRe.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：wordRe.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/primitives/strings/wordRe/wordRe.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：284 行
- 文件标识：`c9f843cd0b9f`

## 2. 功能说明

该文件声明或实现 `wordRe`、`Istream`、`Ostream`，属于“核心运行时”模块。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：A wordRe is a word, but can also have a regular expression for matching words. By default the constructors will generally preserve the argument as a string literal and the assignment operators will use the wordRe::compOption::detect compOption to scan the string for regular expression meta characters and/or invalid word characters and react accordingly. The exceptions are when constructing/assigning from another Foam::wordRe (preserve the same type) or from a Foam::word (always literal). Note: If the string contents are changed - eg, by the operator+=() or by string::replace(), etc - it will be necessary to use compile() or recompile() to synchronise the regular expression.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `wordRe` | 69 |
| `Istream` | 70 |
| `Ostream` | 71 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`word.H`](../../../04-core-runtime/files/76/word.h--763cd4c0a88d.md)
- [`regExp.H`](../../../17-other-libraries/files/44/regexp.h--4499a67e0d18.md)
- [`keyType.H`](../../../04-core-runtime/files/13/keytype.h--1316c9be1e31.md)
- [`wordReI.H`](../../../04-core-runtime/files/c0/wordrei.h--c06df97db73f.md)

## 8. 直接上层引用

- [applications/test/wordRe/Test-wordRe.C](../../../17-other-libraries/files/bc/test-wordre.c--bcd16d1e9a25.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/faceZoneToCell/faceZoneToCell.H](../../../03-utilities/files/5a/facezonetocell.h--5a506bed7225.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/cellSources/zoneToCell/zoneToCell.H](../../../03-utilities/files/d5/zonetocell.h--d511ad1b60bb.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/faceSources/patchToFace/patchToFace.H](../../../03-utilities/files/10/patchtoface.h--10e18839fac4.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/faceSources/zoneToFace/zoneToFace.H](../../../03-utilities/files/5f/zonetoface.h--5f7716e05a66.md)
- [applications/utilities/deprecated/topoSet/topoSetSources/pointSources/zoneToPoint/zoneToPoint.H](../../../03-utilities/files/e3/zonetopoint.h--e3352d9c78ce.md)
- [applications/utilities/postProcessing/dataConversion/foamToTecplot360/foamToTecplot360.C](../../../03-utilities/files/2d/foamtotecplot360.c--2d6babc61d79.md)
- [src/finiteVolume/cfdTools/general/porosityModel/porosityModel/porosityModel.H](../../../05-finite-volume/files/f3/porositymodel.h--f38befd5a70d.md)
- [src/OpenFOAM/containers/Dictionaries/PtrListDictionary/PtrListDictionary.H](../../../04-core-runtime/files/2b/ptrlistdictionary.h--2b4aa9e279df.md)
- [src/OpenFOAM/primitives/hashes/Hash/Hash.H](../../../04-core-runtime/files/47/hash.h--47f7216a2177.md)
- [src/OpenFOAM/primitives/strings/lists/wordReList.H](../../../04-core-runtime/files/b9/wordrelist.h--b94cbb5e26a3.md)
- [src/OpenFOAM/primitives/strings/wordRe/wordRe.C](../../../04-core-runtime/files/2e/wordre.c--2e05daf2249e.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
