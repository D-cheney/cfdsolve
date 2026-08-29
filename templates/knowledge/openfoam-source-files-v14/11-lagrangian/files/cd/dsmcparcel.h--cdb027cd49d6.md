---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-cdb027cd49d6"
title: "OpenFOAM 14 源码解析：DSMCParcel.H"
summary: "该文件声明或实现 `DSMCParcel`、`constantProperties`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/lagrangian/DSMC/parcels/Templates/DSMCParcel/DSMCParcel.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：DSMCParcel.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/lagrangian/DSMC/parcels/Templates/DSMCParcel/DSMCParcel.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：280 行
- 文件标识：`cdb027cd49d6`

## 2. 功能说明

该文件声明或实现 `DSMCParcel`、`constantProperties`，属于“拉格朗日与颗粒”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：DSMC parcel class

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `DSMCParcel` | 56 |
| `constantProperties` | 87 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- `particle.H`
- [`IOstream.H`](../../../04-core-runtime/files/ad/iostream.h--adf73bfa6083.md)
- [`autoPtr.H`](../../../04-core-runtime/files/f8/autoptr.h--f8ef09e7d364.md)
- [`contiguous.H`](../../../04-core-runtime/files/7a/contiguous.h--7a4d443fff8c.md)
- [`DSMCCloud.H`](../../../11-lagrangian/files/dd/dsmccloud.h--dd9826c99d1f.md)
- [`DSMCParcelI.H`](../../../11-lagrangian/files/86/dsmcparceli.h--860b5058f957.md)
- [`DSMCParcel.C`](../../../11-lagrangian/files/cd/dsmcparcel.c--cd3ea514b3a6.md)

## 8. 直接上层引用

- [src/lagrangian/DSMC/parcels/derived/dsmcParcel/dsmcParcel.H](../../../11-lagrangian/files/25/dsmcparcel.h--25d7f56c95df.md)
- [src/lagrangian/DSMC/parcels/Templates/DSMCParcel/DSMCParcel.C](../../../11-lagrangian/files/cd/dsmcparcel.c--cd3ea514b3a6.md)
- [src/lagrangian/DSMC/parcels/Templates/DSMCParcel/DSMCParcelI.H](../../../11-lagrangian/files/86/dsmcparceli.h--860b5058f957.md)
- [src/lagrangian/DSMC/parcels/Templates/DSMCParcel/DSMCParcelIO.C](../../../11-lagrangian/files/bc/dsmcparcelio.c--bc4749315404.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
