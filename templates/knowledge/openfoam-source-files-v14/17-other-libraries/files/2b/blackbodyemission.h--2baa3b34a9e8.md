---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-2baa3b34a9e8"
title: "OpenFOAM 14 源码解析：blackBodyEmission.H"
summary: "该文件声明或实现 `blackBodyEmission`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/radiationModels/radiationModels/fvDOM/blackBodyEmission/blackBodyEmission.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：blackBodyEmission.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/radiationModels/radiationModels/fvDOM/blackBodyEmission/blackBodyEmission.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：162 行
- 文件标识：`2baa3b34a9e8`

## 2. 功能说明

该文件声明或实现 `blackBodyEmission`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Class black body emission Table of black body emissive power from: Modest, "Radiative Heat Transfer", pp.775-777, 1993

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `blackBodyEmission` | 62 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`dimensionedScalar.H`](../../../04-core-runtime/files/94/dimensionedscalar.h--94226c94054a.md)
- [`Table.H`](../../../04-core-runtime/files/ba/table.h--ba6009c9b8bf.md)
- [`Vector2D.H`](../../../04-core-runtime/files/98/vector2d.h--98f7e89a68b3.md)

## 8. 直接上层引用

- [src/radiationModels/radiationModels/fvDOM/blackBodyEmission/blackBodyEmission.C](../../../17-other-libraries/files/ee/blackbodyemission.c--eee7f21d42aa.md)
- [src/radiationModels/radiationModels/fvDOM/radiativeIntensityRay/radiativeIntensityRay.H](../../../17-other-libraries/files/fb/radiativeintensityray.h--fbeaab71086c.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
