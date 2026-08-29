---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-38da686189e1"
title: "OpenFOAM 14 源码解析：rotorDisk.H"
summary: "该文件声明或实现 `rotorDisk`、`flapData`，属于“边界、源项与约束”模块。"
category: { slug: openfoam-v14-12-boundaries-sources, name: OpenFOAM 源码 · 边界、源项与约束 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/fvModels/rotorDisk/rotorDisk.H"
tags: [OpenFOAM14, 源码解析, 边界、源项与约束]
---

# OpenFOAM 14 源码解析：rotorDisk.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/fvModels/rotorDisk/rotorDisk.H`
- 功能分类：边界、源项与约束
- 文件类型：C/C++ 或词法/语法源文件
- 规模：377 行
- 文件标识：`38da686189e1`

## 2. 功能说明

该文件声明或实现 `rotorDisk`、`flapData`，属于“边界、源项与约束”模块。

中文导航角色：有限体积物理源项。

上游说明：Cell based momentum source which approximates the mean effects of rotor forces on a cylindrical region within the domain. Usage Example usage: \verbatim rotorDisk1 { type rotorDisk; U U; // Name of the velocity field nBlades 3; // Number of blades tipEffect 0.96; // Normalised radius above which lift = 0 inletFlowType local; // Inlet flow type specification geometryMode auto; // Geometry specification refDirection (-1 0 0); // Reference direction for psi angle trimModel fixed; // Trim model; fixed or targetCoeff // see fixedTrim.H or targetCoeffTrim.H for documentation flap { beta0 0; // Coning angle [deg] beta1c 0; // Lateral flapping coeff (cos coeff) beta2s 0; // Longitudinal flapping coeff (sin coeff) } blade { // see bladeModel.H for documentation } profiles { profile1 { type lookup; // Profile model; lookup or series ... // see lookupProfile.H or seriesProfile.H for documentation }

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `rotorDisk` | 128 |
| `flapData` | 155 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **字典与场读取**：从对象注册表或字典读取配置，并处理必选项、默认值与热重载。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`fvModel.H`](../../../05-finite-volume/files/be/fvmodel.h--beab7979c40e.md)
- [`fvCellZone.H`](../../../05-finite-volume/files/be/fvcellzone.h--bee09cd009b8.md)
- [`cylindricalCS.H`](../../../07-mesh-geometry/files/d5/cylindricalcs.h--d5c5989683f8.md)
- [`cylindrical.H`](../../../07-mesh-geometry/files/f0/cylindrical.h--f07d994f48a5.md)
- [`NamedEnum.H`](../../../04-core-runtime/files/34/namedenum.h--3437c5255062.md)
- [`bladeModel.H`](../../../12-boundaries-sources/files/fe/blademodel.h--febc6d755748.md)
- [`profileModelList.H`](../../../12-boundaries-sources/files/7b/profilemodellist.h--7bbcbce45e5d.md)
- [`trimModel.H`](../../../12-boundaries-sources/files/2a/trimmodel.h--2a97fdc2b63b.md)
- [`rotorDiskI.H`](../../../12-boundaries-sources/files/ea/rotordiski.h--eabcf988d24d.md)
- [`rotorDiskTemplates.C`](../../../12-boundaries-sources/files/7c/rotordisktemplates.c--7cb1d76f1fdd.md)

## 8. 直接上层引用

- [src/fvModels/rotorDisk/rotorDisk.C](../../../12-boundaries-sources/files/e5/rotordisk.c--e521684fe532.md)
- [src/fvModels/rotorDisk/rotorDiskI.H](../../../12-boundaries-sources/files/ea/rotordiski.h--eabcf988d24d.md)
- [src/fvModels/rotorDisk/rotorDiskTemplates.C](../../../12-boundaries-sources/files/7c/rotordisktemplates.c--7cb1d76f1fdd.md)
- [src/fvModels/rotorDisk/trimModel/fixed/fixedTrim.C](../../../12-boundaries-sources/files/26/fixedtrim.c--26a89e7394e8.md)
- [src/fvModels/rotorDisk/trimModel/targetCoeff/targetCoeffTrim.C](../../../12-boundaries-sources/files/af/targetcoefftrim.c--afc880cbe453.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分显式源、隐式线性化、作用区域和网格更新。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
