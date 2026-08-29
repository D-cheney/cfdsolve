---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-5b10ab1fd805"
title: "OpenFOAM 14 源码解析：power.H"
summary: "该文件声明或实现 `power`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/field/power/power.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：power.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/field/power/power.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：197 行
- 文件标识：`5b10ab1fd805`

## 2. 功能说明

该文件声明或实现 `power`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：Evaluates and writes the following power fields. \verbatim + tauUSf: tauf & Uf + divTauU: fvc::div(tauUSf) + divTauDotU: fvc::div(tauf) & U + tauDDotGradU: divTauU - divTauDotU + pUSf: -pIf & Uf + divPU: fvc::div(pUSf) + gradPU: -fvc::grad(p) & U + pDivU: divPU - gradPU + stressUSf: tauUSf + pUSf + divStressU: fvc::div(stressUSf) + divStressDotU: fvc::div(stressf) & U + stressDDotGradU: divStressU - divStressDotU \endverbatim where: \verbatim + p, U = cell centre pressure and velocity + pIf, Uf = face normal pressure force, and velocity, vectors + tauf = face shear force vectors [-transport.devTau()*mesh().magSf()] + stressf = tauf - pIf \endverbatim The domain integral of the volume fields (all except '...Sf' fields) is also printed to a log file in the postProcessing directory. Domain integrals are scaled by a factor, which defaults to 1e9, to make them easier to process. Usage An exam

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `power` | 114 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **显式散度**：由面通量求控制体净通量并返回单元场。
2. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。

## 6. 数学与离散关系

- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)
- [`logFiles.H`](../../../04-core-runtime/files/da/logfiles.h--da24c47050f0.md)
- [`writeLocalObjects.H`](../../../04-core-runtime/files/0d/writelocalobjects.h--0dda5168d043.md)

## 8. 直接上层引用

- [src/functionObjects/field/power/power.C](../../../14-postprocessing/files/44/power.c--44495401227a.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
