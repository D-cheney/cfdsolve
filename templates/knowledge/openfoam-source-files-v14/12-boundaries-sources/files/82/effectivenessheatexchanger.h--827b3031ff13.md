---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-827b3031ff13"
title: "OpenFOAM 14 源码解析：effectivenessHeatExchanger.H"
summary: "该文件声明或实现 `effectivenessHeatExchanger`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/general/effectivenessHeatExchanger/effectivenessHeatExchanger.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：effectivenessHeatExchanger.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/general/effectivenessHeatExchanger/effectivenessHeatExchanger.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：261 行
- 文件标识：`827b3031ff13`

## 2. 功能说明

该文件声明或实现 `effectivenessHeatExchanger`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：Heat exchanger model, based on an effectiveness The total heat exchange source is given by: \f[ Q_t = e(\phi, \dot{m}_2) (T_2 - T_1) \phi c_p \f] where: \vartable Q_t | total heat source e(\phi,\dot{m}_2) | effectiveness table \phi | net mass flux entering heat exchanger [kg/s] \dot{m}_2 | secondary mass flow rate [kg/s] T_1 | primary inlet temperature [K] T_2 | secondary inlet temperature [K] c_p | specific heat capacity [J/kg/K] \endvartable The distribution inside the hear exchanger is given by: \f[ Q_c = \frac{V_c |U_c| (T_c - T_{ref})}{\sum(V_c |U_c| (T_c - T_{ref}))} \f] where: \vartable Q_c | source for cell V_c | volume of the cell [m^3] U_c | local cell velocity [m/s] T_c | local call temperature [K] T_{ref} | min or max(T) in cell zone depending on the sign of Q_t [K] \endvartable Usage Example usage: \verbatim effectivenessHeatExchanger1 { type effectivenessHeatExchanger; cell

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `effectivenessHeatExchanger` | 115 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`fvModel.H`](../../../05-finite-volume/files/be/fvmodel.h--beab7979c40e.md)
- [`fvCellZone.H`](../../../05-finite-volume/files/be/fvcellzone.h--bee09cd009b8.md)
- [`Function2.H`](../../../04-core-runtime/files/11/function2.h--11115076f69a.md)

## 8. 直接上层引用

- [src/fvModels/general/effectivenessHeatExchanger/effectivenessHeatExchanger.C](../../../12-boundaries-sources/files/f3/effectivenessheatexchanger.c--f31db6734663.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
