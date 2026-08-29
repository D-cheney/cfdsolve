---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-8a83e7af84b9"
title: "OpenFOAM 14 源码解析：MPLICface.H"
summary: "该文件声明或实现 `MPLICface`，属于“多相与界面”模块。"
category: { slug: openfoam-v14-10-multiphase, name: OpenFOAM 源码 · 多相与界面 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/twoPhaseModels/interfaceCompression/MPLIC/MPLICface.H"
tags: [OpenFOAM14, 源码解析, 多相与界面]
---

# OpenFOAM 14 源码解析：MPLICface.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/twoPhaseModels/interfaceCompression/MPLIC/MPLICface.H`
- 功能分类：多相与界面
- 文件类型：C/C++ 或词法/语法源文件
- 规模：183 行
- 文件标识：`8a83e7af84b9`

## 2. 功能说明

该文件声明或实现 `MPLICface`，属于“多相与界面”模块。

中文导航角色：两相流与界面模型。

上游说明：Class that deals with cutting faces based on face point values and target value.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `MPLICface` | 58 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`face.H`](../../../04-core-runtime/files/bc/face.h--bc0ffa4a6982.md)
- [`pointField.H`](../../../04-core-runtime/files/c6/pointfield.h--c646fe39b2fe.md)
- [`DynamicList.H`](../../../04-core-runtime/files/d0/dynamiclist.h--d0fb805f1b2f.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`MPLICfaceI.H`](../../../10-multiphase/files/3b/mplicfacei.h--3ba60c9198db.md)

## 8. 直接上层引用

- [src/twoPhaseModels/interfaceCompression/MPLIC/MPLICcell.H](../../../10-multiphase/files/25/mpliccell.h--25a453750620.md)
- [src/twoPhaseModels/interfaceCompression/MPLIC/MPLICface.C](../../../10-multiphase/files/95/mplicface.c--9586e36587aa.md)
- [src/twoPhaseModels/interfaceCompression/MPLIC/MPLICfaceI.H](../../../10-multiphase/files/3b/mplicfacei.h--3ba60c9198db.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

关注相分数、界面性质、表面张力和相变贡献。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
