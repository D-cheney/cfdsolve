---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f60bb6bb60cb"
title: "OpenFOAM 14 源码解析：thermophysicalPropertiesSelector.H"
summary: "该文件声明或实现 `thermophysicalPropertiesSelector`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/thermophysicalProperties/thermophysicalProperties/thermophysicalPropertiesSelector.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：thermophysicalPropertiesSelector.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/thermophysicalProperties/thermophysicalProperties/thermophysicalPropertiesSelector.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：200 行
- 文件标识：`f60bb6bb60cb`

## 2. 功能说明

该文件声明或实现 `thermophysicalPropertiesSelector`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：Wrapper class providing run-time selection of thermophysicalProperties for the templated thermodynamics packages.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `thermophysicalPropertiesSelector` | 56 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`thermophysicalProperties.H`](../../../08-thermophysical/files/9e/thermophysicalproperties.h--9e2f3ea8ee56.md)
- [`thermophysicalPropertiesSelectorI.H`](../../../08-thermophysical/files/de/thermophysicalpropertiesselectori.h--de0efed4e646.md)
- [`thermophysicalPropertiesSelector.C`](../../../08-thermophysical/files/53/thermophysicalpropertiesselector.c--53ec482c7f41.md)

## 8. 直接上层引用

- [src/thermophysicalModels/thermophysicalProperties/liquidProperties/liquidProperties/liquidPropertiesSelector.H](../../../08-thermophysical/files/7e/liquidpropertiesselector.h--7e8584ed272c.md)
- [src/thermophysicalModels/thermophysicalProperties/thermophysicalProperties/thermophysicalPropertiesSelector.C](../../../08-thermophysical/files/53/thermophysicalpropertiesselector.c--53ec482c7f41.md)
- [src/thermophysicalModels/thermophysicalProperties/thermophysicalProperties/thermophysicalPropertiesSelectorI.H](../../../08-thermophysical/files/de/thermophysicalpropertiesselectori.h--de0efed4e646.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
