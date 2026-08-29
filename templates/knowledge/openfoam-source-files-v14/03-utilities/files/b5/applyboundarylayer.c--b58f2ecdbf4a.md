---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b58f2ecdbf4a"
title: "OpenFOAM 14 源码解析：applyBoundaryLayer.C"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `applyBoundaryLayer` 对应的工作流。"
category: { slug: openfoam-v14-03-utilities, name: OpenFOAM 源码 · 前后处理工具 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/utilities/preProcessing/applyBoundaryLayer/applyBoundaryLayer.C"
tags: [OpenFOAM14, 源码解析, 前后处理工具]
---

# OpenFOAM 14 源码解析：applyBoundaryLayer.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/utilities/preProcessing/applyBoundaryLayer/applyBoundaryLayer.C`
- 功能分类：前后处理工具
- 文件类型：C/C++ 或词法/语法源文件
- 规模：242 行
- 文件标识：`b58f2ecdbf4a`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `applyBoundaryLayer` 对应的工作流。

中文导航角色：命令行工具。

上游说明：Apply a simplified boundary-layer model to the velocity and turbulence fields based on the 1/7th power-law. The uniform boundary-layer thickness is either provided via the -ybl option or calculated as the average of the distance to the wall scaled with the thickness coefficient supplied via the option -Cbl. If both options are provided -ybl is used.

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `main` | 57 |

## 5. 算法与控制流程

1. **程序入口**：解析命令行和案例环境，然后按既定生命周期调度核心对象。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **显式梯度**：从单元/面数据重构梯度场，用于压力或输运量校正。
4. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
5. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
6. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
7. **结果写出**：按时间控制和对象写出策略序列化字段、字典或后处理结果。
8. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`argList.H`](../../../04-core-runtime/files/fd/arglist.h--fd2ea9b60b1a.md)
- [`viscosityModel.H`](../../../08-thermophysical/files/71/viscositymodel.h--71ddc0685b08.md)
- [`incompressibleMomentumTransportModels.H`](../../../09-turbulence-transport/files/17/incompressiblemomentumtransportmodels.h--177fb8e614f3.md)
- [`wallDist.H`](../../../05-finite-volume/files/4f/walldist.h--4f861db401ea.md)
- [`fvcFlux.H`](../../../05-finite-volume/files/c9/fvcflux.h--c964e1bdde0c.md)
- [`setRootCase.H`](../../../04-core-runtime/files/95/setrootcase.h--95a4d6ea30cd.md)
- [`createTime.H`](../../../04-core-runtime/files/ff/createtime.h--ff253fee129e.md)
- [`createMeshNoChangers.H`](../../../04-core-runtime/files/3d/createmeshnochangers.h--3dfd318ee25e.md)
- `createFields.H`
- `createPhi.H`

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

从 main() 追踪输入字典、网格/场操作和写出结果。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
