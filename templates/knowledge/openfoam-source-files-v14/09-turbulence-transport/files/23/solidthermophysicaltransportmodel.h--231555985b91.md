---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-231555985b91"
title: "OpenFOAM 14 源码解析：solidThermophysicalTransportModel.H"
summary: "该文件声明或实现 `solidThermophysicalTransportModel`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/solid/solidThermophysicalTransportModel/solidThermophysicalTransportModel.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：solidThermophysicalTransportModel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/solid/solidThermophysicalTransportModel/solidThermophysicalTransportModel.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：191 行
- 文件标识：`231555985b91`

## 2. 功能说明

该文件声明或实现 `solidThermophysicalTransportModel`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：Abstract base class for solid thermophysical transport models

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `solidThermophysicalTransportModel` | 55 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`thermophysicalTransportModel.H`](../../../09-turbulence-transport/files/ad/thermophysicaltransportmodel.h--ad7d97fa3ad6.md)
- [`solidThermo.H`](../../../08-thermophysical/files/54/solidthermo.h--545f3a607faf.md)

## 8. 直接上层引用

- [applications/modules/solid/solid.H](../../../02-solver-modules/files/b5/solid.h--b5ea4188c462.md)
- [src/ThermophysicalTransportModels/solid/anisotropic/anisotropic.H](../../../09-turbulence-transport/files/56/anisotropic.h--56339a6059d7.md)
- [src/ThermophysicalTransportModels/solid/isotropic/isotropic.H](../../../09-turbulence-transport/files/ea/isotropic.h--ea60bec29aae.md)
- [src/ThermophysicalTransportModels/solid/solidThermophysicalTransportModel/solidThermophysicalTransportModel.C](../../../09-turbulence-transport/files/15/solidthermophysicaltransportmodel.c--15227322ae5f.md)
- [src/ThermophysicalTransportModels/solid/solidThermophysicalTransportModels.C](../../../09-turbulence-transport/files/6b/solidthermophysicaltransportmodels.c--6b1b21a7917b.md)

## 9. 运行时机制

`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
