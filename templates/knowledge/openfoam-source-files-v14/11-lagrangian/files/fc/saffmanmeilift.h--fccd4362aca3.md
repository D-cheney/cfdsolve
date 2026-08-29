---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-fccd4362aca3"
title: "OpenFOAM 14 源码解析：SaffmanMeiLift.H"
summary: "该文件声明或实现 `SaffmanMeiLift`，属于“拉格朗日与颗粒”模块。"
category: { slug: openfoam-v14-11-lagrangian, name: OpenFOAM 源码 · 拉格朗日与颗粒 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/Lagrangian/cloud/LagrangianModels/SaffmanMeiLift/SaffmanMeiLift.H"
tags: [OpenFOAM14, 源码解析, 拉格朗日与颗粒]
---

# OpenFOAM 14 源码解析：SaffmanMeiLift.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/Lagrangian/cloud/LagrangianModels/SaffmanMeiLift/SaffmanMeiLift.H`
- 功能分类：拉格朗日与颗粒
- 文件类型：C/C++ 或词法/语法源文件
- 规模：168 行
- 文件标识：`fccd4362aca3`

## 2. 功能说明

该文件声明或实现 `SaffmanMeiLift`，属于“拉格朗日与颗粒”模块。

中文导航角色：模块化拉格朗日颗粒框架。

上游说明：Lift model of Saffman (1965) as extended by Mei (1992). Applicable to spherical particles. References: \verbatim Saffman, P. G. T. (1965). The lift on a small sphere in a slow shear flow. Journal of fluid mechanics, 22(2), 385-400. Mei, R. (1992). An approximate expression for the shear lift force on a spherical particle at finite Reynolds number. International Journal of Multiphase Flow, 18(1), 145-147. \endverbatim Usage Example specification: \verbatim <LagrangianModelName> { type SaffmanMeiLift; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `SaffmanMeiLift` | 79 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
2. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`cloudLagrangianModel.H`](../../../11-lagrangian/files/2a/cloudlagrangianmodel.h--2a59a45d077b.md)
- [`CloudDerivedField.H`](../../../11-lagrangian/files/dc/cloudderivedfield.h--dc71477214ea.md)

## 8. 直接上层引用

- [src/Lagrangian/cloud/LagrangianModels/SaffmanMeiLift/SaffmanMeiLift.C](../../../11-lagrangian/files/0f/saffmanmeilift.c--0f660d80787d.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

从 mesh/cloud、模型选择、轨迹积分追到连续相源项回写。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
