---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-80ff673a54f6"
title: "OpenFOAM 14 源码解析：tetherPotential.H"
summary: "该文件声明或实现 `tetherPotential`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/molecularDynamics/potential/tetherPotential/basic/tetherPotential.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：tetherPotential.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/molecularDynamics/potential/tetherPotential/basic/tetherPotential.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：149 行
- 文件标识：`80ff673a54f6`

## 2. 功能说明

该文件声明或实现 `tetherPotential`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：SourceFiles tetherPotential.C tetherPotentialNew.C

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `tetherPotential` | 58 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`IOdictionary.H`](../../../04-core-runtime/files/cb/iodictionary.h--cbc3096677d8.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`vector.H`](../../../04-core-runtime/files/64/vector.h--64124691b98b.md)

## 8. 直接上层引用

- [src/lagrangian/molecularDynamics/potential/tetherPotential/basic/tetherPotential.C](../../../11-lagrangian/files/73/tetherpotential.c--733daea070fe.md)
- [src/lagrangian/molecularDynamics/potential/tetherPotential/basic/tetherPotentialNew.C](../../../11-lagrangian/files/2c/tetherpotentialnew.c--2ca2a87e7772.md)
- [src/lagrangian/molecularDynamics/potential/tetherPotential/derived/harmonicSpring/harmonicSpring.H](../../../11-lagrangian/files/30/harmonicspring.h--306dc81fcf5c.md)
- [src/lagrangian/molecularDynamics/potential/tetherPotential/derived/pitchForkRing/pitchForkRing.H](../../../11-lagrangian/files/0a/pitchforkring.h--0a72f0cfa386.md)
- [src/lagrangian/molecularDynamics/potential/tetherPotential/derived/restrainedHarmonicSpring/restrainedHarmonicSpring.H](../../../11-lagrangian/files/7a/restrainedharmonicspring.h--7aa975f0c49a.md)
- [src/lagrangian/molecularDynamics/potential/tetherPotential/tetherPotentialList/tetherPotentialList.H](../../../11-lagrangian/files/39/tetherpotentiallist.h--390fc303d8e1.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
