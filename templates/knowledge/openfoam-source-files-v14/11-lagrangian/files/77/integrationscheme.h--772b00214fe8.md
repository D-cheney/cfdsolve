---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-772b00214fe8"
title: "OpenFOAM 14 源码解析：integrationScheme.H"
summary: "该文件声明或实现 `integrationScheme`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/integrationScheme/integrationScheme/integrationScheme.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：integrationScheme.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/integrationScheme/integrationScheme/integrationScheme.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：194 行
- 文件标识：`772b00214fe8`

## 2. 功能说明

该文件声明或实现 `integrationScheme`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Base for a set of schemes which integrate simple ODEs which arise from semi-implicit rate expressions. \f[ \frac{d \phi}{d t} = A - B \phi \f] The methods are defined in terms of the effective time-step \&#36;\Delta t_e\&#36; by which the explicit rate is multiplied. The effective time-step is a function of the actual time step and the implicit coefficient, which must be implemented in each derived scheme. \f[ \Delta t_e = f(\Delta t, B) \f] \f[ \Delta \phi = (A - B \phi^n) \Delta t_e \f] This class also facilitates integration in stages. If the explicit and implicit coefficients, \&#36;A\&#36; and \&#36;B\&#36;, are a summation of differing contributions, \&#36;\sum \alpha_i\&#36; and \&#36;\sum \beta_i\&#36;, then the integration can be split up to determine the effect of each contribution. \f[ \frac{d \phi_i}{d t} = \alpha_i - \beta_i \phi \f] \f[ \Delta \phi_i = \alpha_i \Delta t - \beta_i \int_0^{\Delta t} \phi 

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `integrationScheme` | 94 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`integrationSchemeTemplates.C`](../../../11-lagrangian/files/72/integrationschemetemplates.c--7200ef5d784a.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/clouds/Templates/MomentumCloud/MomentumCloud.C](../../../11-lagrangian/files/8f/momentumcloud.c--8ffc36e4736c.md)
- [src/lagrangian/parcel/clouds/Templates/ThermoCloud/ThermoCloud.C](../../../11-lagrangian/files/3e/thermocloud.c--3e895abe9081.md)
- [src/lagrangian/parcel/integrationScheme/analytical/analytical.H](../../../11-lagrangian/files/fe/analytical.h--fe577d257e2b.md)
- [src/lagrangian/parcel/integrationScheme/Euler/Euler.H](../../../11-lagrangian/files/16/euler.h--1612f96a2585.md)
- [src/lagrangian/parcel/integrationScheme/integrationScheme/integrationScheme.C](../../../11-lagrangian/files/86/integrationscheme.c--86563425118a.md)
- [src/lagrangian/parcel/integrationScheme/integrationScheme/integrationSchemeNew.C](../../../11-lagrangian/files/c1/integrationschemenew.c--c1bbd9f660a5.md)
- [src/lagrangian/parcel/integrationScheme/integrationScheme/integrationSchemeTemplates.C](../../../11-lagrangian/files/72/integrationschemetemplates.c--7200ef5d784a.md)
- [src/lagrangian/parcel/parcels/Templates/MomentumParcel/MomentumParcel.C](../../../11-lagrangian/files/4d/momentumparcel.c--4d439ed4674b.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
