---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-86da3710a725"
title: "OpenFOAM 14 源码解析：interfaceProperties.C"
summary: "该文件实现 `interfaceProperties` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/interfaceProperties/interfaceProperties.C"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：interfaceProperties.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/interfaceProperties/interfaceProperties.C`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：248 行
- 文件标识：`86da3710a725`

## 2. 功能说明

该文件实现 `interfaceProperties` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：两相流与界面模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::interfaceProperties::correctContactAngle` | 46 |
| `Foam::interfaceProperties::calculateK` | 105 |
| `Foam::interfaceProperties::n` | 204 |
| `Foam::interfaceProperties::sigmaK` | 211 |
| `Foam::interfaceProperties::surfaceTensionForce` | 218 |
| `Foam::interfaceProperties::nearInterface` | 225 |
| `Foam::interfaceProperties::correct` | 232 |
| `Foam::interfaceProperties::read` | 238 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **显式散度**：由面通量求控制体净通量并返回单元场。
3. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。
4. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
5. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
6. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 守恒对流/散度：$\int_{\partial V}(\mathbf{F}\phi)\cdot\mathbf{n}\,\mathrm{d}S$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。

## 7. 直接依赖

- [`interfaceProperties.H`](../../../10-multiphase/files/36/interfaceproperties.h--36dd1adcc231.md)
- [`contactAngleFvPatchScalarField.H`](../../../10-multiphase/files/64/contactanglefvpatchscalarfield.h--64ea260f0a7a.md)
- `surfaceInterpolate.H`
- [`fvcDiv.H`](../../../05-finite-volume/files/f4/fvcdiv.h--f4f3d94a2b7a.md)
- [`fvcGrad.H`](../../../05-finite-volume/files/d3/fvcgrad.h--d32a079c3240.md)
- [`fvcSnGrad.H`](../../../05-finite-volume/files/9c/fvcsngrad.h--9cae40f16e0c.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
