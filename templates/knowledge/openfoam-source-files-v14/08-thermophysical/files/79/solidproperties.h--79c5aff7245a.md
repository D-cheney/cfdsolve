---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-79c5aff7245a"
title: "OpenFOAM 14 源码解析：solidProperties.H"
summary: "该文件声明或实现 `solidProperties`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/thermophysicalProperties/solidProperties/solidProperties/solidProperties.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：solidProperties.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/thermophysicalProperties/solidProperties/solidProperties/solidProperties.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：205 行
- 文件标识：`79c5aff7245a`

## 2. 功能说明

该文件声明或实现 `solidProperties`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：The thermophysical properties of a solid

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `solidProperties` | 55 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`solidPropertiesI.H`](../../../08-thermophysical/files/6f/solidpropertiesi.h--6fbe62eb0a06.md)

## 8. 直接上层引用

- [src/thermophysicalModels/thermophysicalProperties/solidProperties/ash/ash.H](../../../08-thermophysical/files/c6/ash.h--c69cd4093c52.md)
- [src/thermophysicalModels/thermophysicalProperties/solidProperties/C/C.H](../../../08-thermophysical/files/98/c.h--98d53fe681a3.md)
- [src/thermophysicalModels/thermophysicalProperties/solidProperties/CaCO3/CaCO3.H](../../../08-thermophysical/files/b4/caco3.h--b442285b7272.md)
- [src/thermophysicalModels/thermophysicalProperties/solidProperties/solidMixtureProperties/solidMixtureProperties.H](../../../08-thermophysical/files/04/solidmixtureproperties.h--045f205f7085.md)
- [src/thermophysicalModels/thermophysicalProperties/solidProperties/solidProperties/solidProperties.C](../../../08-thermophysical/files/48/solidproperties.c--48e25c093153.md)
- [src/thermophysicalModels/thermophysicalProperties/solidProperties/solidProperties/solidPropertiesNew.C](../../../08-thermophysical/files/27/solidpropertiesnew.c--27fc771118b7.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
