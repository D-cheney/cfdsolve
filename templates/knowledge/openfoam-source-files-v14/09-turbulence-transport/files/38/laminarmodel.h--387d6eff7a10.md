---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-387d6eff7a10"
title: "OpenFOAM 14 源码解析：laminarModel.H"
summary: "该文件声明或实现 `laminarModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/laminar/laminarModel/laminarModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：laminarModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/laminar/laminarModel/laminarModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：200 行
- 文件标识：`387d6eff7a10`

## 2. 功能说明

该文件声明或实现 `laminarModel`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Templated abstract base class for laminar transport models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `laminarModel` | 54 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`momentumTransportModel.H`](../../../09-turbulence-transport/files/36/momentumtransportmodel.h--36c367269e58.md)
- [`laminarModel.C`](../../../09-turbulence-transport/files/99/laminarmodel.c--999123058ccc.md)

## 8. 直接上层引用

- [applications/modules/isothermalFilm/filmCompressibleMomentumTransportModels/filmCompressibleMomentumTransportModels.H](../../../02-solver-modules/files/cc/filmcompressiblemomentumtransportmodels.h--cc9f823ff5ae.md)
- [applications/modules/isothermalFilm/filmCompressibleMomentumTransportModels/makeFilmCompressibleMomentumTransportModel.H](../../../02-solver-modules/files/2a/makefilmcompressiblemomentumtransportmodel.h--2ad2d6fb1292.md)
- [src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.H](../../../09-turbulence-transport/files/07/compressiblemomentumtransportmodels.h--0745b4a591f5.md)
- [src/MomentumTransportModels/compressible/makeCompressibleMomentumTransportModel.H](../../../09-turbulence-transport/files/76/makecompressiblemomentumtransportmodel.h--76018bb87199.md)
- [src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.H](../../../09-turbulence-transport/files/17/incompressiblemomentumtransportmodels.h--177fb8e614f3.md)
- [src/MomentumTransportModels/incompressible/makeIncompressibleMomentumTransportModel.H](../../../09-turbulence-transport/files/be/makeincompressiblemomentumtransportmodel.h--be4ca35e202a.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonian.H](../../../09-turbulence-transport/files/a4/generalisednewtonian.h--a4d935e461b9.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/lambdaThixotropic/lambdaThixotropic.H](../../../09-turbulence-transport/files/98/lambdathixotropic.h--98a04b272627.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/laminarModel/laminarModel.C](../../../09-turbulence-transport/files/99/laminarmodel.c--999123058ccc.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/Maxwell/Maxwell.H](../../../09-turbulence-transport/files/05/maxwell.h--05b235c48f3a.md)
- [src/MomentumTransportModels/momentumTransportModels/laminar/Stokes/Stokes.H](../../../09-turbulence-transport/files/5c/stokes.h--5cb44ff3b0a0.md)
- [src/MomentumTransportModels/phaseCompressible/makePhaseCompressibleMomentumTransportModel.H](../../../09-turbulence-transport/files/69/makephasecompressiblemomentumtransportmodel.h--69e94f4ee861.md)
- [src/MomentumTransportModels/phaseCompressible/phaseCompressibleMomentumTransportModels.H](../../../09-turbulence-transport/files/29/phasecompressiblemomentumtransportmodels.h--29529ee64d5a.md)
- [src/MomentumTransportModels/phaseIncompressible/makePhaseIncompressibleMomentumTransportModel.H](../../../09-turbulence-transport/files/6b/makephaseincompressiblemomentumtransportmodel.h--6be62506d9cc.md)
- [src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModels.H](../../../09-turbulence-transport/files/ce/phaseincompressiblemomentumtransportmodels.h--cecdff45f086.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
