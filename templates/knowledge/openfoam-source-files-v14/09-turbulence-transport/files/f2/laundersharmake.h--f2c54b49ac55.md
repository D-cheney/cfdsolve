---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-f2c54b49ac55"
title: "OpenFOAM 14 源码解析：LaunderSharmaKE.H"
summary: "该文件实现 `LaunderSharmaKE` 的运行时工厂选择，根据类型名创建具体实现。"
category: { slug: openfoam-v14-09-turbulence-transport, name: OpenFOAM 源码 · 湍流与输运 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/MomentumTransportModels/momentumTransportModels/RAS/LaunderSharmaKE/LaunderSharmaKE.H"
tags: [OpenFOAM14, 源码解析, 湍流与输运]
---

# OpenFOAM 14 源码解析：LaunderSharmaKE.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/MomentumTransportModels/momentumTransportModels/RAS/LaunderSharmaKE/LaunderSharmaKE.H`
- 功能分类：湍流与输运
- 文件类型：C/C++ 或词法/语法源文件
- 规模：236 行
- 文件标识：`f2c54b49ac55`

## 2. 功能说明

该文件实现 `LaunderSharmaKE` 的运行时工厂选择，根据类型名创建具体实现。

中文导航角色：层流/RANS/LES 动量输运模型。

上游说明：Launder and Sharma low-Reynolds k-epsilon turbulence model for incompressible and compressible and combusting flows including rapid distortion theory (RDT) based compression term. References: \verbatim Launder, B. E., & Sharma, B. I. (1974). Application of the energy-dissipation model of turbulence to the calculation of flow near a spinning disc. Letters in heat and mass transfer, 1(2), 131-137. For the RDT-based compression term: El Tahry, S. H. (1983). k-epsilon equation for compressible reciprocating engine flows. Journal of Energy, 7(4), 345-353. \endverbatim The default model coefficients are \verbatim LaunderSharmaKE { Cmu 0.09; C1 1.44; C2 1.92; C3 0; alphah 1.0; // only for compressible alphahk 1.0; // only for compressible alphaEps 0.76923; } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `LaunderSharmaKE` | 86 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。
- RANS 闭合以雷诺应力或湍黏度补充平均动量方程，例如 $-\overline{u_i'u_j'}\approx2\nu_t S_{ij}-2k\delta_{ij}/3$。

## 7. 直接依赖

- [`RASModel.H`](../../../09-turbulence-transport/files/88/rasmodel.h--88056730872d.md)
- [`eddyViscosity.H`](../../../09-turbulence-transport/files/67/eddyviscosity.h--678d8cba3afc.md)
- [`LaunderSharmaKE.C`](../../../09-turbulence-transport/files/7a/laundersharmake.c--7a4e5b2fb9d1.md)

## 8. 直接上层引用

- [src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/0c/compressiblemomentumtransportmodels.c--0c9c2be0db68.md)
- [src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.C](../../../09-turbulence-transport/files/8e/incompressiblemomentumtransportmodels.c--8ef656aa90b7.md)
- [src/MomentumTransportModels/momentumTransportModels/RAS/LaunderSharmaKE/LaunderSharmaKE.C](../../../09-turbulence-transport/files/7a/laundersharmake.c--7a4e5b2fb9d1.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

区分公共接口、具体闭合模型、predict/correct 时机和方程贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
