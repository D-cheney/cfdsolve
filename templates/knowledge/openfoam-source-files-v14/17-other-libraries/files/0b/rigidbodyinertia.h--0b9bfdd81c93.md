---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-0b9bfdd81c93"
title: "OpenFOAM 14 源码解析：rigidBodyInertia.H"
summary: "该文件声明或实现 `Istream`、`Ostream`、`rigidBodyInertia`，属于“其他物理与支撑库”模块。"
category: { slug: openfoam-v14-17-other-libraries, name: OpenFOAM 源码 · 其他物理与支撑库 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/rigidBodyMotion/rigidBodyDynamics/rigidBodyInertia/rigidBodyInertia.H"
tags: [OpenFOAM14, 源码解析, 其他物理与支撑库]
---

# OpenFOAM 14 源码解析：rigidBodyInertia.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/rigidBodyMotion/rigidBodyDynamics/rigidBodyInertia/rigidBodyInertia.H`
- 功能分类：其他物理与支撑库
- 文件类型：C/C++ 或词法/语法源文件
- 规模：184 行
- 文件标识：`0b9bfdd81c93`

## 2. 功能说明

该文件声明或实现 `Istream`、`Ostream`、`rigidBodyInertia`，属于“其他物理与支撑库”模块。

中文导航角色：OpenFOAM 支撑代码。

上游说明：This class represents the linear and angular inertia of a rigid body by the mass, centre of mass and moment of inertia tensor about the centre of mass. Reference: \verbatim Featherstone, R. (2008). Rigid body dynamics algorithms. Springer. \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Istream` | 66 |
| `Ostream` | 67 |
| `rigidBodyInertia` | 73 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。
- 能量守恒的一般形式：$\partial_t(\rho e)+\nabla\cdot(\rho\mathbf{U}h)=\nabla\cdot(k\nabla T)+S_E$。

## 7. 直接依赖

- [`vector.H`](../../../04-core-runtime/files/64/vector.h--64124691b98b.md)
- [`symmTensor.H`](../../../04-core-runtime/files/79/symmtensor.h--791822a166c1.md)
- [`spatialVector.H`](../../../04-core-runtime/files/75/spatialvector.h--75345f519d47.md)
- [`spatialTensor.H`](../../../04-core-runtime/files/59/spatialtensor.h--5982154c9a53.md)
- [`rigidBodyInertiaI.H`](../../../17-other-libraries/files/5e/rigidbodyinertiai.h--5ebf093e24c5.md)

## 8. 直接上层引用

- [src/rigidBodyMotion/rigidBodyDynamics/bodies/rigidBody/rigidBody.H](../../../17-other-libraries/files/92/rigidbody.h--926f7cda0c41.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

先识别公共接口、数据所有权、调用方和输出副作用。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
