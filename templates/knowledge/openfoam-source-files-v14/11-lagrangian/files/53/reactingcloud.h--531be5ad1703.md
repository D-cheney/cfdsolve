---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-531be5ad1703"
title: "OpenFOAM 14 源码解析：ReactingCloud.H"
summary: "该文件声明或实现 `PhaseChangeModel`、`ReactingCloud`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/parcel/clouds/Templates/ReactingCloud/ReactingCloud.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：ReactingCloud.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/parcel/clouds/Templates/ReactingCloud/ReactingCloud.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：330 行
- 文件标识：`531be5ad1703`

## 2. 功能说明

该文件声明或实现 `PhaseChangeModel`、`ReactingCloud`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Templated base class for reacting cloud - Adds to thermodynamic cloud - Variable composition (single phase) - Phase change

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `PhaseChangeModel` | 62 |
| `ReactingCloud` | 77 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`fvMatricesFwd.H`](../../../05-finite-volume/files/c0/fvmatricesfwd.h--c0b6e3525b0b.md)
- [`dimensionedTypes.H`](../../../04-core-runtime/files/e7/dimensionedtypes.h--e7b52390401f.md)
- [`fvMesh.H`](../../../05-finite-volume/files/3c/fvmesh.h--3ce82737dc41.md)
- [`fluidThermo.H`](../../../08-thermophysical/files/9e/fluidthermo.h--9e58ccc4fa8c.md)
- [`Cloud.H`](../../../11-lagrangian/files/0f/cloud.h--0fc43918cc09.md)
- [`ReactingCloudI.H`](../../../11-lagrangian/files/c3/reactingcloudi.h--c34958a05318.md)
- [`ReactingCloud.C`](../../../11-lagrangian/files/03/reactingcloud.c--03263e02f82b.md)

## 8. 直接上层引用

- [src/lagrangian/parcel/clouds/derived/reactingCloud/reactingCloud.H](../../../11-lagrangian/files/b7/reactingcloud.h--b76df5028c2b.md)
- [src/lagrangian/parcel/clouds/derived/reactingMultiphaseCloud/reactingMultiphaseCloud.H](../../../11-lagrangian/files/51/reactingmultiphasecloud.h--51b013e28311.md)
- [src/lagrangian/parcel/clouds/derived/sprayCloud/sprayCloud.H](../../../11-lagrangian/files/d3/spraycloud.h--d35676d3516d.md)
- [src/lagrangian/parcel/clouds/Templates/ReactingCloud/ReactingCloud.C](../../../11-lagrangian/files/03/reactingcloud.c--03263e02f82b.md)
- [src/lagrangian/parcel/clouds/Templates/ReactingCloud/ReactingCloudName.C](../../../11-lagrangian/files/a3/reactingcloudname.c--a3e1a269d5b2.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
