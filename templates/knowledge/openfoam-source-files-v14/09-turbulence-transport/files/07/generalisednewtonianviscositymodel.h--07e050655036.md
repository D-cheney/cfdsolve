---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-07e050655036"
title: "OpenFOAM 14 源码解析：generalisedNewtonianViscosityModel.H"
summary: "该文件声明或实现 `generalisedNewtonianViscosityModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/generalisedNewtonianViscosityModel/generalisedNewtonianViscosityModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：generalisedNewtonianViscosityModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/generalisedNewtonianViscosityModel/generalisedNewtonianViscosityModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：158 行
- 文件标识：`07e050655036`

## 2. 功能说明

该文件声明或实现 `generalisedNewtonianViscosityModel`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：A namespace for the generalised Newtonian viscosity model implementations.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `generalisedNewtonianViscosityModel` | 64 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`viscosity.H`](../../../08-thermophysical/files/61/viscosity.h--6109322fab0a.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonian.H](../../../09-turbulence-transport/files/a4/generalisednewtonian.h--a4d935e461b9.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/generalisedNewtonianViscosityModel/generalisedNewtonianViscosityModel.C](../../../09-turbulence-transport/files/0f/generalisednewtonianviscositymodel.c--0f0ac801a831.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/generalisedNewtonianViscosityModel/generalisedNewtonianViscosityModelNew.C](../../../09-turbulence-transport/files/9a/generalisednewtonianviscositymodelnew.c--9ab50e117234.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/Newtonian/NewtonianViscosityModel.H](../../../09-turbulence-transport/files/e2/newtonianviscositymodel.h--e2a8c7140bf8.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/strainRateViscosityModel/strainRateViscosityModel.H](../../../09-turbulence-transport/files/7e/strainrateviscositymodel.h--7ea2bcf00c6b.md)
- [src/MomentumTransportModels/momentumTransportModels/LES/LESModel/LESModel.H](../../../09-turbulence-transport/files/b3/lesmodel.h--b313bdba577b.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/RASModel/RASModel.H](../../../09-turbulence-transport/files/88/rasmodel.h--88056730872d.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
