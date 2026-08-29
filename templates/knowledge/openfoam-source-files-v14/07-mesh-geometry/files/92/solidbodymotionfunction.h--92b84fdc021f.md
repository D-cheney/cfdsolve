---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-92b84fdc021f"
title: "OpenFOAM 14 源码解析：solidBodyMotionFunction.H"
summary: "该文件实现 `solidBodyMotionFunction` 相关对象的读取、写出或流序列化。"
category: { slug: openfoam-v14-07-mesh-geometry, name: OpenFOAM 源码 · 网格与几何 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/pointMeshMovers/solidBodyMotionFunctions/solidBodyMotionFunction/solidBodyMotionFunction.H"
tags: [OpenFOAM14, 源码解析, 网格与几何]
---

# OpenFOAM 14 源码解析：solidBodyMotionFunction.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/pointMeshMovers/solidBodyMotionFunctions/solidBodyMotionFunction/solidBodyMotionFunction.H`
- 功能分类：网格与几何
- 文件类型：C/C++ 或词法/语法源文件
- 规模：166 行
- 文件标识：`92b84fdc021f`

## 2. 功能说明

该文件实现 `solidBodyMotionFunction` 相关对象的读取、写出或流序列化。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Namespace for solid-body motions

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `solidBodyMotionFunction` | 65 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`Time.H`](../../../04-core-runtime/files/87/time.h--87f4ddb4742c.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`septernion.H`](../../../04-core-runtime/files/0f/septernion.h--0f0f9f4cf947.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [src/fvMeshMovers/multiValveEngine/solidBodyMotionFunctions/multiValveEnginePistonMotion/multiValveEnginePistonMotion.H](../../../07-mesh-geometry/files/94/multivalveenginepistonmotion.h--94f4c97f8768.md)
- [src/fvMeshMovers/multiValveEngine/solidBodyMotionFunctions/multiValveEngineValveMotion/multiValveEngineValveMotion.H](../../../07-mesh-geometry/files/48/multivalveenginevalvemotion.h--48719a51639d.md)
- [src/pointMeshMovers/multiSolidBody/multiSolidBody_pointMeshMover.H](../../../07-mesh-geometry/files/a2/multisolidbody_pointmeshmover.h--a240a9ec95d3.md)
- [src/pointMeshMovers/pointPatchFields/derived/rigidBodyMotionDisplacement/rigidBodyMotionDisplacementPointPatchVectorField.H](../../../07-mesh-geometry/files/30/rigidbodymotiondisplacementpointpatchvectorfield.h--30a27f6ecb5d.md)
- [src/pointMeshMovers/rigidBody/functionalRigidBody/functionalRigidBody_pointMeshMover.H](../../../07-mesh-geometry/files/e6/functionalrigidbody_pointmeshmover.h--e6b65072b647.md)
- [src/pointMeshMovers/solidBody/solidBody_pointMeshMover.H](../../../07-mesh-geometry/files/53/solidbody_pointmeshmover.h--53b7cc9ed0e5.md)
- [src/pointMeshMovers/solidBodyMotionFunctions/axisRotationMotion/axisRotationMotion.H](../../../07-mesh-geometry/files/c9/axisrotationmotion.h--c9470814dfb2.md)
- [src/pointMeshMovers/solidBodyMotionFunctions/linearMotion/linearMotion.H](../../../07-mesh-geometry/files/4d/linearmotion.h--4ded94615461.md)
- [src/pointMeshMovers/solidBodyMotionFunctions/multiMotion/multiMotion.H](../../../07-mesh-geometry/files/ac/multimotion.h--ac0100836ae5.md)
- [src/pointMeshMovers/solidBodyMotionFunctions/none/none_solidBodyMotionFunction.H](../../../07-mesh-geometry/files/09/none_solidbodymotionfunction.h--0962efda3013.md)
- [src/pointMeshMovers/solidBodyMotionFunctions/oscillatingLinearMotion/oscillatingLinearMotion.H](../../../07-mesh-geometry/files/85/oscillatinglinearmotion.h--85376dd5f78f.md)
- [src/pointMeshMovers/solidBodyMotionFunctions/oscillatingRotatingMotion/oscillatingRotatingMotion.H](../../../07-mesh-geometry/files/a2/oscillatingrotatingmotion.h--a273ab713bc9.md)
- [src/pointMeshMovers/solidBodyMotionFunctions/rotatingMotion/rotatingMotion.H](../../../07-mesh-geometry/files/87/rotatingmotion.h--8747f1304486.md)
- [src/pointMeshMovers/solidBodyMotionFunctions/SDA/SDA.H](../../../07-mesh-geometry/files/79/sda.h--792d09673523.md)
- [src/pointMeshMovers/solidBodyMotionFunctions/sixDoFMotion/sixDoFMotion.H](../../../07-mesh-geometry/files/56/sixdofmotion.h--5615297e7537.md)
- [src/pointMeshMovers/solidBodyMotionFunctions/solidBodyMotionFunction/solidBodyMotionFunction.C](../../../07-mesh-geometry/files/20/solidbodymotionfunction.c--20887b55a602.md)
- [src/pointMeshMovers/solidBodyMotionFunctions/solidBodyMotionFunction/solidBodyMotionFunctionNew.C](../../../07-mesh-geometry/files/59/solidbodymotionfunctionnew.c--59a9eb568b0e.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
