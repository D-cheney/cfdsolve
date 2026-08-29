---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-9d1fa1509f79"
title: "OpenFOAM 14 源码解析：MULESTemplates.C"
summary: "该文件声明或实现 `RhoType`、`SpType`、`SuType`、`PsiMaxType`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fvMatrices/solvers/MULES/MULESTemplates.C"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：MULESTemplates.C

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fvMatrices/solvers/MULES/MULESTemplates.C`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：515 行
- 文件标识：`9d1fa1509f79`

## 2. 功能说明

该文件声明或实现 `RhoType`、`SpType`、`SuType`、`PsiMaxType`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `RhoType` | 152 |
| `SpType` | 153 |
| `SuType` | 154 |
| `PsiMaxType` | 155 |
| `PsiMinType` | 156 |
| `RdeltaTType` | 218 |

## 4. 主要函数/过程

| 名称 | 源码行 |
|---|---:|
| `Foam::MULES::explicitSolve` | 40 |
| `Foam::MULES::limit` | 214 |

## 5. 算法与控制流程

1. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
2. **网格/容器遍历**：按 OpenFOAM 容器大小遍历元素，避免手写索引范围不一致。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`MULES.H`](../../../05-finite-volume/files/44/mules.h--4492211902ae.md)
- [`upwind.H`](../../../05-finite-volume/files/0c/upwind.h--0ccc1189e54f.md)
- [`fvcSurfaceIntegrate.H`](../../../05-finite-volume/files/4c/fvcsurfaceintegrate.h--4c6ccc53fb7e.md)
- [`localEulerDdtScheme.H`](../../../05-finite-volume/files/fb/localeulerddtscheme.h--fb7ce050de98.md)
- [`wedgeFvPatch.H`](../../../05-finite-volume/files/2c/wedgefvpatch.h--2c6baa534871.md)
- `linear.H`

## 8. 直接上层引用

- [src/finiteVolume/fvMatrices/solvers/MULES/MULES.H](../../../05-finite-volume/files/44/mules.h--4492211902ae.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
