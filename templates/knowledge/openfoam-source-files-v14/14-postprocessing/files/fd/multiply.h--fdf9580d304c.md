---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fdf9580d304c"
title: "OpenFOAM 14 源码解析：multiply.H"
summary: "该文件声明或实现 `multiply`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/field/multiply/multiply.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：multiply.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/field/multiply/multiply.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：119 行
- 文件标识：`fdf9580d304c`

## 2. 功能说明

该文件声明或实现 `multiply`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：Multiply a list of fields. The operation can be applied to any volume or surface fields provided that the resulting multiplication does not produce a tensor of rank greater than two. Example of function object specification: \verbatim Ttot { type multiply; libs ("libfieldFunctionObjects.so"); fields (rho U); result rhoU; executeControl writeTime; writeControl writeTime; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `multiply` | 77 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`fieldsExpression.H`](../../../14-postprocessing/files/5b/fieldsexpression.h--5b8c1ef643ae.md)

## 8. 直接上层引用

- [src/functionObjects/field/multiply/multiply.C](../../../14-postprocessing/files/32/multiply.c--32d7b376e942.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
