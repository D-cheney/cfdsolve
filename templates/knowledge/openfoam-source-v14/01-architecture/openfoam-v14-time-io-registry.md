---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-time-io-registry
title: OpenFOAM 14 Time、IOobject、objectRegistry 与字段生命周期
summary: 解析案例时间推进、文件寻址、读写策略和对象注册表，说明场对象如何从时间目录构造、被模型按名称查找、随网格更新并按 controlDict 写出。
category: { slug: openfoam-v14-architecture, name: OpenFOAM 14 源码架构 }
level: 进阶
reading_minutes: 17
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, Time, IOobject, objectRegistry, regIOobject]
---

# OpenFOAM 14 Time、IOobject、objectRegistry 与字段生命周期

`Time` 既代表仿真时钟，也是案例顶层对象注册表；`fvMesh` 是其子 registry，速度、压力和模型对象通常注册在 mesh 上。

## 1. 构造链

`createTime.H` 根据案例路径和 `controlDict` 构造 `Time`；`createMesh.H` 读取 `constant/polyMesh` 并构造 `fvMesh`。场构造函数中的 `IOobject(name, instance, registry, readOpt, writeOpt)` 决定名称、时间实例、归属、读取和写出策略。

## 2. 查找与依赖

模型可以用名称从 registry 查找场，避免把所有对象逐层传参。代价是名称与注册时机成为隐式合同：同名冲突、对象尚未构造或注册在错误区域都会失败。

## 3. 时间推进

数学上从 `t^n` 前进到 `t^{n+1}=t^n+Δt`。`foamRun` 在进入 PIMPLE 外循环前调整 `Δt`，递增 `runTime`，求解并调用 `runTime.write()`。写出时间与内部时间步不是同一概念。

```text
t^{n+1}=t^n+\Delta t, \qquad Co_f=\frac{|\phi_f|\Delta t}{V_P}
```

## 4. 参考源码

1. `src/OpenFOAM/db/Time/Time.H`。
2. `src/OpenFOAM/db/IOobject/`、`regIOobject/`、`objectRegistry/`。
3. `applications/modules/incompressibleFluid/incompressibleFluid.C` 的场构造函数。

