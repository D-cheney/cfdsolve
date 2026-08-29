---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-foamrun-lifecycle
title: OpenFOAM 14 foamRun 与模块化 solver 生命周期
summary: 逐步解析 foamRun 从参数和 controlDict 读取 solver、动态加载模块、创建网格和 PIMPLE 控制器，到每步预测校正、网格运动、模型更新和结果写出的完整调用链。
category: { slug: openfoam-v14-solver-flow, name: OpenFOAM 14 求解流程 }
level: 工程
reading_minutes: 22
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, foamRun, solver模块, PIMPLE, 调用链]
---

# OpenFOAM 14 foamRun 与模块化 solver 生命周期

`foamRun.C` 是单区域模块化架构的稳定调度器，具体物理封装在 `applications/modules` 的 solver 派生类中。

## 1. 启动链

参数解析 → `setRootCase` → `createTime` → 从 `controlDict` 或 `-solver` 得到名称 → `solver::load` → `createMesh` → `solver::New` → `pimpleSingleRegionControl` → 初始时间步。

## 2. 每个时间步

`pimple.run(runTime)` 控制总循环；随后 `preSolve`、调整 `Δt`、时间递增。每个 PIMPLE 外迭代按开关调用：网格运动 → `fvModels.correct` → prePredictor → 动量/热输运预测 → 动量预测 → 热物性预测 → 压力校正 → 输运模型校正。结束后 `postSolve` 和 `runTime.write`。

## 3. 设计意义

调度器依赖 solver 基类的虚函数合同，而不依赖具体方程。稳态、伪瞬态和瞬态共用控制框架；不同模块可将不适用钩子实现为空函数。

## 4. 字典映射

`controlDict.solver` 决定模块；`fvSolution` 的 PIMPLE 子字典决定 flow/models/thermophysics、外循环、压力校正和输运预测时机。源码阅读必须把这些开关与实际调用条件逐一对应。

## 5. 参考源码

1. `applications/solvers/foamRun/foamRun.C`。
2. `applications/modules/basicFluidSolver/`。
3. `src/finiteVolume/cfdTools/general/solutionControl/`。

