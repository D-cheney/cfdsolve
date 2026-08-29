---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d9f5937815ae"
title: "OpenFOAM 14 源码解析：momentumTransportModel.C"
summary: "该文件实现 `momentumTransportModel` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/momentumTransportModel.C"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：momentumTransportModel.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/momentumTransportModel.C`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：182 行
- 文件标识：`d9f5937815ae`

## 2. 功能说明

该文件实现 `momentumTransportModel` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::momentumTransportModel::readModelDict` | 50 |
| `Foam::momentumTransportModel::phi` | 123 |
| `Foam::momentumTransportModel::y` | 128 |
| `Foam::momentumTransportModel::yb` | 134 |
| `Foam::momentumTransportModel::read` | 140 |
| `Foam::momentumTransportModel::divDevTauCorr` | 146 |
| `Foam::momentumTransportModel::validate` | 168 |
| `Foam::momentumTransportModel::predict` | 172 |
| `Foam::momentumTransportModel::correct` | 176 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`momentumTransportModel.H`](../../../09-turbulence-transport/files/36/momentumtransportmodel.h--36c367269e58.md)
- [`volFields.H`](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [`surfaceFields.H`](../../../05-finite-volume/files/46/surfacefields.h--468a61846d4e.md)
- [`wallFvPatch.H`](../../../05-finite-volume/files/91/wallfvpatch.h--91e9c7f67f00.md)
- [`wallDist.H`](../../../05-finite-volume/files/4f/walldist.h--4f861db401ea.md)
- [`nearWallDist.H`](../../../05-finite-volume/files/ed/nearwalldist.h--ed1ab672e5f3.md)
- [`fvcFlux.H`](../../../05-finite-volume/files/c9/fvcflux.h--c964e1bdde0c.md)
- [`fvmDiv.H`](../../../05-finite-volume/files/32/fvmdiv.h--32306f8dc3a6.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
