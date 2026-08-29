---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3f9ca3962c93"
title: "OpenFOAM 14 源码解析：heatTransferModel.H"
summary: "该文件实现 `heatTransferModel` 相关对象的读取、写出或流序列化。"
category: { slug: openfoam-v14-02-solver-modules, name: OpenFOAM 源码 · 模块化求解器 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/heatTransferModel/heatTransferModel.H"
tags: [OpenFOAM14, 源码解析, 模块化求解器]
---

# OpenFOAM 14 源码解析：heatTransferModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/heatTransferModel/heatTransferModel.H`
- 功能分类：模块化求解器
- 文件类型：C/C++ 或词法/语法源文件
- 规模：340 行
- 文件标识：`3f9ca3962c93`

## 2. 功能说明

该文件实现 `heatTransferModel` 相关对象的读取、写出或流序列化。

中文导航角色：模块化求解器实现。

上游说明：Model for heat transfer between phases

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `heatTransferModel` | 58 |
| `blendedHeatTransferModel` | 151 |
| `sidedBlendedHeatTransferModel` | 195 |
| `sidedHeatTransferModel` | 235 |
| `blendedSidedHeatTransferModel` | 282 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`BlendedInterfacialModel.H`](../../../02-solver-modules/files/87/blendedinterfacialmodel.h--87631113e4de.md)
- [`SidedInterfacialModel.H`](../../../02-solver-modules/files/23/sidedinterfacialmodel.h--23fdd8f588d4.md)

## 8. 直接上层引用

- [applications/modules/multiphaseEuler/phaseSystem/heatTransferSystem/heatTransferSystem.C](../../../02-solver-modules/files/75/heattransfersystem.c--75cbde9d884f.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/constantNu/constantNuHeatTransfer.H](../../../02-solver-modules/files/d2/constantnuheattransfer.h--d294801e6525.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/Gunn/Gunn.H](../../../02-solver-modules/files/73/gunn.h--73ff7a5bc442.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/heatTransferModel/heatTransferModel.C](../../../02-solver-modules/files/d4/heattransfermodel.c--d401c910650a.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/heatTransferModel/heatTransferModelNew.C](../../../02-solver-modules/files/a2/heattransfermodelnew.c--a2e78961e3bf.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/Prandtl/Prandtl.H](../../../02-solver-modules/files/c9/prandtl.h--c9bb3654c5ef.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/RanzMarshall/RanzMarshall.H](../../../02-solver-modules/files/9d/ranzmarshall.h--9d2c00ebb8bf.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/sphericalHeatTransfer/sphericalHeatTransfer.H](../../../02-solver-modules/files/c3/sphericalheattransfer.h--c3c53ffd01ad.md)
- [applications/modules/multiphaseEuler/phaseSystem/interfacialModels/heatTransferModels/timeScaleFilteredHeatTransfer/timeScaleFilteredHeatTransfer.H](../../../02-solver-modules/files/f3/timescalefilteredheattransfer.h--f31b717c3349.md)
- [applications/modules/multiphaseEuler/phaseSystem/oneResistanceHeatTransfer/oneResistanceHeatTransfer.H](../../../02-solver-modules/files/d5/oneresistanceheattransfer.h--d544601de081.md)
- [applications/modules/multiphaseEuler/phaseSystem/twoResistanceHeatTransfer/twoResistanceHeatTransfer.H](../../../02-solver-modules/files/c8/tworesistanceheattransfer.h--c897663c499f.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先读同名头文件的数据成员，再按 preSolve、predictor、corrector、postSolve 追踪。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
