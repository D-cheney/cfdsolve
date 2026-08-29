---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-19d60f4964db"
title: "OpenFOAM 14 源码解析：basic.H"
summary: "该文件声明或实现 `basic`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "applications/legacy/combustion/PDRFoam/PDRModels/dragModels/basic/basic.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：basic.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`applications/legacy/combustion/PDRFoam/PDRModels/dragModels/basic/basic.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：172 行
- 文件标识：`19d60f4964db`

## 2. 功能说明

该文件声明或实现 `basic`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：Basic sub-grid obstacle drag model. Details supplied by J Puttock 2/7/06. <b> Sub-grid drag term </b> The resistance term (force per unit of volume) is given by: \f[ R = -\frac{1}{2} \rho \vert \dwea{\vec{U}} \vert \dwea{\vec{U}}.D \f] where: \&#36; D \&#36; is the tensor field "CR" in \&#36; m^{-1} \&#36; This is term is treated implicitly in UEqn.H <b> Sub-grid turbulence generation </b> The turbulence source term \&#36; G_{R} \&#36; occurring in the \&#36; \kappa-\epsilon \&#36; equations for the generation of turbulence due to interaction with unresolved obstacles : \&#36; G_{R} = C_{s}\beta_{\nu} \mu_{eff} A_{w}^{2}(\dwea{\vec{U}}-\dwea{\vec{U}_{s}})^2 + \frac{1}{2} \rho \vert \dwea{\vec{U}} \vert \dwea{\vec{U}}.T.\dwea{\vec{U}} \&#36; where: \&#36; C_{s} \&#36; = 1 \&#36; \beta_{\nu} \&#36; is the volume porosity (file "betav"). \&#36; \mu_{eff} \&#36; is the effective viscosity. \&#36; A_{w}^{2}\&#36; is the obstacle surface area per

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `basic` | 101 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`PDRDragModel.H`](../../../17-other-libraries/files/8f/pdrdragmodel.h--8fe618ecfdae.md)
- `XiEqModel.H`

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/PDRModels/dragModels/basic/basic.C](../../../17-other-libraries/files/dd/basic.c--dd2c193aaec2.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
