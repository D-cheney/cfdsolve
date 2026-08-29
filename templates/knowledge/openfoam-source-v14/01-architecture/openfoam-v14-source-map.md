---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-source-map
title: OpenFOAM 14 版本基线、源码树与阅读路线
summary: 固定 OpenFOAM 14.20260724 源码基线，解释 applications、src、tutorials、wmake 和 etc 的职责，并建立从案例字典追到求解器、离散层与物理模型的阅读方法。
category: { slug: openfoam-v14-architecture, name: OpenFOAM 14 源码架构 }
level: 入门
reading_minutes: 15
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, 源码解析, 架构, 源码树, Foundation]
---

# OpenFOAM 14 版本基线、源码树与阅读路线

本系列只解析 Foundation 的 OpenFOAM 14 标签 `20260724`。类名相似不代表能直接套用到 OpenCFD 发行线。

## 1. 顶层目录

- `applications/solvers/foamRun`：单区域模块化求解器入口；
- `applications/solvers/foamMultiRun`：多区域驱动；
- `applications/modules`：fluid、incompressibleFluid、VoF、solid 等 solver 模块；
- `applications/utilities`：网格、前后处理与并行工具；
- `src/OpenFOAM`：容器、场、矩阵、I/O、时间、并行抽象；
- `src/finiteVolume`：fvMesh、fvc/fvm、fvMatrix、patch field；
- `src/*Models`：动量输运、热物性、多相、反应、辐射等；
- `tutorials`：字典与模块组合的可执行规格；`wmake`/`etc`：构建和环境配置。

## 2. 纵向追踪模板

以不可压缩压力校正为例：`controlDict: solver incompressibleFluid` → `foamRun.C` → `solver::New` → `incompressibleFluid::pressureCorrector` → `correctPressure.C` → `fvm::laplacian`/`fvc::div` → `fvScalarMatrix::solve` → `lduMatrix` 求解器。

## 3. 阅读原则

先读 `.H` 的数据成员和虚函数合同，再读构造函数，最后读每个生命周期方法。宏只负责注册或生成样板时，不要停留在宏表面；应继续找到展开后创建的选择表和最终具体类。

## 4. 证据要求

知识条目必须记录版本标签、相对路径、类/函数、字典入口和验证案例。源码说明与数学解释分开：前者回答“代码怎么做”，后者回答“为什么这样做”。

## 5. 参考源码

1. `README.org`、`Allwmake`。
2. `applications/solvers/foamRun/foamRun.C`。
3. `applications/modules/` 与 `src/`。

