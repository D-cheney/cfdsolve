---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-efd1a9628c7f"
title: "OpenFOAM 14 源码解析：simplifiedViscousStress.C"
summary: "该文件实现 `simplifiedViscousStress` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/simplifiedViscousStress/simplifiedViscousStress.C"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：simplifiedViscousStress.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/simplifiedViscousStress/simplifiedViscousStress.C`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：138 行
- 文件标识：`efd1a9628c7f`

## 2. 功能说明

该文件实现 `simplifiedViscousStress` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **隐式扩散项**：使用面扩散系数和法向梯度离散拉普拉斯项。
3. **面插值**：把单元中心量插值到面中心，为通量与面系数计算提供数据。
4. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 扩散项：$\int_{\partial V}\Gamma\nabla\phi\cdot\mathbf{n}\,\mathrm{d}S$。
- 梯度/法向梯度：$\nabla\phi$ 或 $(\nabla\phi)_f\cdot\mathbf{n}_f$。
- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`simplifiedViscousStress.H`](../../../09-turbulence-transport/files/bf/simplifiedviscousstress.h--bf37bb0dab22.md)
- [`fvmLaplacian.H`](../../../05-finite-volume/files/99/fvmlaplacian.h--99705f4e6ce0.md)
- [`fvcSnGrad.H`](../../../05-finite-volume/files/9c/fvcsngrad.h--9cae40f16e0c.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/momentumTransportModels/simplifiedViscousStress/simplifiedViscousStress.H](../../../09-turbulence-transport/files/bf/simplifiedviscousstress.h--bf37bb0dab22.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
