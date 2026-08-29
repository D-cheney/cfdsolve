---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-41b257cda08f"
title: "OpenFOAM 14 源码解析：pimpleSingleRegionControl.H"
summary: "该文件声明或实现 `pimpleSingleRegionControl`，属于“有限体积离散”模块。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleSingleRegionControl/pimpleSingleRegionControl.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：pimpleSingleRegionControl.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleSingleRegionControl/pimpleSingleRegionControl.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：135 行
- 文件标识：`41b257cda08f`

## 2. 功能说明

该文件声明或实现 `pimpleSingleRegionControl`，属于“有限体积离散”模块。

中文导航角色：有限体积离散核心。

上游说明：Pimple single region control class. Provides time-loop control methods which exit the simulation once convergence criteria have been reached. Also provides Pimple-loop control methods which exit the iteration once corrector convergence criteria have been met. Example usage: \verbatim pimpleSingleRegionControl pimple(mesh); while (pimple.run(runTime)) { // pre-time-increment operations ... runTime ++; Info<< "Time = " << runTime.userTimeName() << nl << endl; while (pimple.loop()) { // solve ... } // post-solve operations ... } \endverbatim

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `pimpleSingleRegionControl` | 78 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **压力速度耦合**：在动量预测、压力校正和外/内迭代之间协调场更新。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。

## 7. 直接依赖

- [`pimpleLoop.H`](../../../05-finite-volume/files/67/pimpleloop.h--67b83fc7a8a9.md)
- [`pimpleNoLoopControl.H`](../../../05-finite-volume/files/21/pimplenoloopcontrol.h--211d4bd02bbb.md)
- [`pimpleSingleRegionControlI.H`](../../../05-finite-volume/files/7a/pimplesingleregioncontroli.h--7a983e656c96.md)

## 8. 直接上层引用

- [applications/solvers/foamRun/foamRun.C](../../../01-solver-entry/files/3d/foamrun.c--3d7dd5e70d12.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleControl/pimpleControl.H](../../../05-finite-volume/files/3f/pimplecontrol.h--3f53630c7d30.md)
- [src/finiteVolume/cfdTools/general/solutionControl/pimpleControl/pimpleSingleRegionControl/pimpleSingleRegionControl.C](../../../05-finite-volume/files/6c/pimplesingleregioncontrol.c--6cda4b7b1e7c.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
