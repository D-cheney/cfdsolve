---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-3ed49b7efdf0"
title: "OpenFOAM 14 源码解析：Fickian.H"
summary: "该文件声明或实现 `Fickian`，属于“湍流与输运”模块。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/ThermophysicalTransportModels/fluid/laminar/Fickian/Fickian.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：Fickian.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/ThermophysicalTransportModels/fluid/laminar/Fickian/Fickian.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：217 行
- 文件标识：`3ed49b7efdf0`

## 2. 功能说明

该文件声明或实现 `Fickian`，属于“湍流与输运”模块。

中文导航角色：热物性输运模型。

上游说明：Base class for multi-component Fickian based temperature gradient heat flux models with optional Soret thermal diffusion of species. The mixture diffusion coefficients are specified as Function2<scalar>s of pressure and temperature but independent of composition. The heat flux source is implemented as an implicit energy correction to the temperature gradient based flux source. At convergence the energy correction is 0.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Fickian` | 62 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **分布式映射**：依据全局到局部寻址重排和交换数据。
2. **网格变化响应**：在拓扑或点位置变化后重建寻址、缓存和依赖场。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`Function2.H`](../../../04-core-runtime/files/11/function2.h--11115076f69a.md)
- [`Fickian.C`](../../../09-turbulence-transport/files/52/fickian.c--522bf3e8e428.md)

## 8. 直接上层引用

- [src/ThermophysicalTransportModels/fluid/laminar/Fickian/Fickian.C](../../../09-turbulence-transport/files/52/fickian.c--522bf3e8e428.md)
- [src/ThermophysicalTransportModels/fluid/laminar/FickianFourier/FickianFourier.H](../../../09-turbulence-transport/files/40/fickianfourier.h--403a183ec054.md)
- [src/ThermophysicalTransportModels/fluid/turbulence/FickianEddyDiffusivity/FickianEddyDiffusivity.H](../../../09-turbulence-transport/files/81/fickianeddydiffusivity.h--81dff56358bb.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

追踪有效导热/扩散系数及其进入能量方程的位置。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
