---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-ceb8b0840d55"
title: "OpenFOAM 14 源码解析：twoPhaseMixture.C"
summary: "该文件实现 `twoPhaseMixture` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/twoPhaseMixture/twoPhaseMixture.C"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：twoPhaseMixture.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/twoPhaseMixture/twoPhaseMixture.C`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：296 行
- 文件标识：`ceb8b0840d55`

## 2. 功能说明

该文件实现 `twoPhaseMixture` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：两相流与界面模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::twoPhaseMixture::readPhasePropertiesDict` | 45 |
| `Foam::twoPhaseMixture::read` | 213 |
| `Foam::twoPhaseMixture::interfaceFraction` | 218 |

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。
3. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
4. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
5. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
6. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
7. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。

## 7. 直接依赖

- [`twoPhaseMixture.H`](../../../10-multiphase/files/7d/twophasemixture.h--7d0880803117.md)
- [`viscosityModel.H`](../../../08-thermophysical/files/71/viscositymodel.h--71ddc0685b08.md)
- `surfaceInterpolate.H`
- [`fvcGrad.H`](../../../05-finite-volume/files/d3/fvcgrad.h--d32a079c3240.md)

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

`defineTypeNameAndDebug`

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
