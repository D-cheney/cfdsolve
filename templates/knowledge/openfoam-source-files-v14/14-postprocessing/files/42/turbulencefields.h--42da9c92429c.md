---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-42da9c92429c"
title: "OpenFOAM 14 源码解析：turbulenceFields.H"
summary: "该文件声明或实现 `turbulenceFields`，属于“功能对象与采样”模块。"
category: { slug: openfoam-v14-14-postprocessing, name: OpenFOAM 源码 · 功能对象与采样 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/functionObjects/field/turbulenceFields/turbulenceFields.H"
tags: [OpenFOAM14, 源码解析, 功能对象与采样]
---

# OpenFOAM 14 源码解析：turbulenceFields.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/functionObjects/field/turbulenceFields/turbulenceFields.H`
- 功能分类：功能对象与采样
- 文件类型：C/C++ 或词法/语法源文件
- 规模：230 行
- 文件标识：`42da9c92429c`

## 2. 功能说明

该文件声明或实现 `turbulenceFields`，属于“功能对象与采样”模块。

中文导航角色：运行时后处理功能对象。

上游说明：Stores derived turbulence fields on the mesh database for further manipulation. Usage \table Property | Description | Required | Default value type | Type name: processorField | yes | fields | Fields to store (see below) | yes | prefix | If true prefix fields | no | no phase | phase name | no | \endtable Where \c fields can include: \plaintable k | turbulence kinetic energy epsilon | turbulence kinetic energy dissipation rate omega | turbulence specific dissipation rate nut | turbulence viscosity (incompressible) nuEff | effective turbulence viscosity (incompressible) nut | turbulence viscosity (compressible) nuEff | effective turbulence viscosity (compressible) kappaEff | effective turbulence thermal diffusivity (compressible) R | Reynolds stress tensor \endplaintable If the optional \c prefix entry is set true the turbulence fields are stored with the prefix "momentumTransportModel:", 

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `turbulenceFields` | 107 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`fvMeshFunctionObject.H`](../../../05-finite-volume/files/db/fvmeshfunctionobject.h--dba760a6abe8.md)
- [`HashSet.H`](../../../04-core-runtime/files/92/hashset.h--9275c74165f4.md)
- [`NamedEnum.H`](../../../04-core-runtime/files/34/namedenum.h--3437c5255062.md)
- [`volFieldsFwd.H`](../../../05-finite-volume/files/b9/volfieldsfwd.h--b9367566be92.md)
- [`turbulenceFieldsTemplates.C`](../../../14-postprocessing/files/99/turbulencefieldstemplates.c--995cbc8ed944.md)

## 8. 直接上层引用

- [src/functionObjects/field/turbulenceFields/turbulenceFields.C](../../../14-postprocessing/files/3e/turbulencefields.c--3e7b3e8ff534.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

追踪 read、execute、write 生命周期及对象注册表查找。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
