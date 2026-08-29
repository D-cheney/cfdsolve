---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-12cb9887ac15"
title: "OpenFOAM 14 源码解析：pointMeshMover.H"
summary: "该文件声明或实现 `polyMesh`、`polyTopoChangeMap`、`polyMeshMap`、`polyDistributionMap`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/pointMesh/pointMeshMover/pointMeshMover.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：pointMeshMover.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/pointMesh/pointMeshMover/pointMeshMover.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：162 行
- 文件标识：`12cb9887ac15`

## 2. 功能说明

该文件声明或实现 `polyMesh`、`polyTopoChangeMap`、`polyMeshMap`、`polyDistributionMap`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Abstract base class for pointMesh movers.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `polyMesh` | 54 |
| `polyTopoChangeMap` | 55 |
| `polyMeshMap` | 56 |
| `polyDistributionMap` | 57 |
| `pointMeshMover` | 62 |

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

- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)

## 8. 直接上层引用

- [src/finiteVolume/fvMesh/fvMeshMovers/pointMeshMover/pointMeshMover_fvMeshMover.C](../../../05-finite-volume/files/f8/pointmeshmover_fvmeshmover.c--f8a4416c20d4.md)
- [src/finiteVolume/fvMesh/fvMeshMovers/pointMeshMover/pointMeshMover_fvMeshMover.H](../../../05-finite-volume/files/a2/pointmeshmover_fvmeshmover.h--a22208c05c81.md)
- [src/finiteVolume/pointMesh/pointMeshMover/pointMeshMover.C](../../../05-finite-volume/files/ab/pointmeshmover.c--ab301e9e1293.md)
- [src/pointMeshMovers/displacementComponent/displacementComponent_pointMeshMover.H](../../../07-mesh-geometry/files/70/displacementcomponent_pointmeshmover.h--70e7ca3453af.md)
- [src/pointMeshMovers/displacementPoints0/displacementPoints0.H](../../../07-mesh-geometry/files/f1/displacementpoints0.h--f1ba6ac8c38d.md)
- [src/pointMeshMovers/list/list_pointMeshMover.H](../../../07-mesh-geometry/files/19/list_pointmeshmover.h--19ed7efb7080.md)
- [src/pointMeshMovers/velocity/velocity_pointMeshMover.H](../../../07-mesh-geometry/files/b7/velocity_pointmeshmover.h--b7bd0b7042cd.md)
- [src/pointMeshMovers/velocityComponent/velocityComponent_pointMeshMover.H](../../../07-mesh-geometry/files/83/velocitycomponent_pointmeshmover.h--83c2bf6d8a35.md)
- [src/rigidBodyMotion/rigidBodyForces/rigidBodyForces/rigidBodyForces.C](../../../17-other-libraries/files/a3/rigidbodyforces.c--a3a42e806a12.md)
- [src/rigidBodyMotion/rigidBodyForces/rigidBodySectionalForcesBase/rigidBodySectionalForcesBase.C](../../../17-other-libraries/files/30/rigidbodysectionalforcesbase.c--306c54be62ab.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
