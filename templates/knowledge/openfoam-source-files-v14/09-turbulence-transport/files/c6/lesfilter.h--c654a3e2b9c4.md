---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-c654a3e2b9c4"
title: "OpenFOAM 14 源码解析：LESfilter.H"
summary: "该文件声明或实现 `fvMesh`、`LESfilter`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/LESfilter/LESfilter.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：LESfilter.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/LESfilter/LESfilter.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：180 行
- 文件标识：`c654a3e2b9c4`

## 2. 功能说明

该文件声明或实现 `fvMesh`、`LESfilter`，属于“湍流与输运”模块。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Abstract class for LES filters

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `fvMesh` | 54 |
| `LESfilter` | 60 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `correctBoundaryConditions` | 79 |

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`typeInfo.H`](../../../04-core-runtime/files/48/typeinfo.h--48c452bf8f91.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`runTimeSelectionTables.H`](../../../04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/anisotropicFilter/anisotropicFilter.H](../../../09-turbulence-transport/files/98/anisotropicfilter.h--981c7a2c14c4.md)
- [src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/laplaceFilter/laplaceFilter.H](../../../09-turbulence-transport/files/99/laplacefilter.h--99bd6de87b5e.md)
- [src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/LESfilter/LESfilter.C](../../../09-turbulence-transport/files/9d/lesfilter.c--9db196cb9bbb.md)
- [src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/simpleFilter/simpleFilter.H](../../../09-turbulence-transport/files/39/simplefilter.h--3978af37efac.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
