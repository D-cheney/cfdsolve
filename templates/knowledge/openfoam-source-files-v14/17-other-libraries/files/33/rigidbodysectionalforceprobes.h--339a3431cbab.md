---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-339a3431cbab"
title: "OpenFOAM 14 源码解析：rigidBodySectionalForceProbes.H"
summary: "该文件声明或实现 `rigidBodySectionalForceProbes`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/rigidBodyForces/rigidBodySectionalForceProbes/rigidBodySectionalForceProbes.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：rigidBodySectionalForceProbes.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/rigidBodyForces/rigidBodySectionalForceProbes/rigidBodySectionalForceProbes.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：174 行
- 文件标识：`339a3431cbab`

## 2. 功能说明

该文件声明或实现 `rigidBodySectionalForceProbes`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：This function calculates the fluid and acceleration forces and moments at a number of section-planes through a given rigid body. It writes the result into a log file. The cut-planes are defined as normal to an axis in the local coordinate system of the rigid body, and through a number of coordinates along that axis. Note that this function does not take into account the effect of joints or restraints attached to the body, so if these are applied then the forces generated will be somewhat incomplete. Note that ramping, acceleration relaxation, and solution tolerance can also result in components of the forces and moments to be missing from the output. Example of function object specification \verbatim rigidBodySectionalForceProbes { type rigidBodySectionalForceProbes; libs ("librigidBodyForces.so"); body beam; patches (beam); axis x; coordinates (4.2 5 5.8); } \endverbatim Usage \table Pr

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rigidBodySectionalForceProbes` | 98 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`rigidBodySectionalForcesBase.H`](../../../17-other-libraries/files/c6/rigidbodysectionalforcesbase.h--c60508adaf10.md)
- [`logFiles.H`](../../../04-core-runtime/files/da/logfiles.h--da24c47050f0.md)

## 8. 直接上层引用

- [src/rigidBodyMotion/rigidBodyForces/rigidBodySectionalForceProbes/rigidBodySectionalForceProbes.C](../../../17-other-libraries/files/2e/rigidbodysectionalforceprobes.c--2ec2811c4416.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
