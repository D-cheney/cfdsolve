---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-259deb712a29"
title: "OpenFOAM 14 源码解析：WatersKing.C"
summary: "这是一个可执行程序入口，负责准备运行环境并调度 `WatersKing` 对应的工作流。"
category: { slug: openfoam-v14-16-tests-tutorials, name: OpenFOAM 源码 · 测试与教程脚本 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "tutorials/incompressibleFluid/planarPoiseuille/validation/WatersKing/WatersKing.C"
tags: [OpenFOAM14, 源码解析, 测试与教程脚本]
---

# OpenFOAM 14 源码解析：WatersKing.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`tutorials/incompressibleFluid/planarPoiseuille/validation/WatersKing/WatersKing.C`
- 功能分类：测试与教程脚本
- 文件类型：C/C++ 或词法/语法源文件
- 规模：157 行
- 文件标识：`259deb712a29`

## 2. 功能说明

这是一个可执行程序入口，负责准备运行环境并调度 `WatersKing` 对应的工作流。

中文导航角色：教程运行脚本。

上游说明：Analytical solution for the start-up planar Poiseuille flow of an Oldroyd-B fluid. References: \verbatim Waters, N. D., & King, M. J. (1970). Unsteady flow of an elasto-viscous liquid. Rheologica Acta, 9, 345-355. Amoreira, L. J., & Oliveira, P. J. (2010). Comparison of different formulations for the numerical calculation of unsteady incompressible viscoelastic fluid flow. Adv. Appl. Math. Mech, 4, 483-502. \endverbatim

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `main` | 61 |

## 5. 算法与控制流程

1. **程序入口**：解析命令行和案例环境，然后按既定生命周期调度核心对象。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`argList.H`](../../../04-core-runtime/files/fd/arglist.h--fd2ea9b60b1a.md)
- [`viscosityModel.H`](../../../08-thermophysical/files/71/viscositymodel.h--71ddc0685b08.md)
- [`incompressibleMomentumTransportModel.H`](../../../09-turbulence-transport/files/d6/incompressiblemomentumtransportmodel.h--d66b1dda583c.md)
- [`meshSearch.H`](../../../07-mesh-geometry/files/49/meshsearch.h--49ea9d1012c2.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`setRootCase.H`](../../../04-core-runtime/files/95/setrootcase.h--95a4d6ea30cd.md)
- [`createTime.H`](../../../04-core-runtime/files/ff/createtime.h--ff253fee129e.md)
- [`createMesh.H`](../../../04-core-runtime/files/fe/createmesh.h--fe0a757e3b8e.md)
- `createFields.H`

## 8. 直接上层引用

- 未从直接头文件包含关系中找到上层依赖；它仍可能经模板、宏、链接库或运行时选择表被使用。

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把命令顺序与案例目录、日志和验证量对应。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
