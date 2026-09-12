---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-schemes-solvers-coupling
title: OpenFOAM 离散格式、线性求解器与耦合控制
summary: 从 fvSchemes、fvSolution 到 SIMPLE、PIMPLE 控制参数梳理数值设置之间的依赖，避免孤立调整容差或格式。
category: { slug: openfoam-numerics-boundaries, name: "OpenFOAM 边界与数值设置" }
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [OpenFOAM, fvSchemes, fvSolution, SIMPLE, PIMPLE]
---

# OpenFOAM 离散格式、线性求解器与耦合控制

`fvSchemes` 决定时间、梯度、散度和拉普拉斯项如何离散；`fvSolution` 选择线性求解器、预条件器、容差以及压力—速度耦合控制。两者共同决定稳定性和误差，不能独立评价。

对流项采用有界一阶格式常有利于获得初始稳定解，但会增加数值扩散。切换到二阶或限制格式后，应重新检查网格质量、时间步和非线性收敛。非正交修正次数过多会增加成本，过少则可能在差网格上留下明显误差。

线性求解通常同时设置绝对容差 `tolerance` 和相对容差 `relTol`。内层线性系统过早停止会拖慢或破坏外层耦合；求得过精确也可能浪费时间。应根据外层残差和目标量调整，而不是把所有方程设成同一容差。

## 联动排查顺序

1. 用 `checkMesh` 核对非正交、扭曲和负体积。
2. 确认边界条件与方程类型相容。
3. 以稳健格式建立基线并记录守恒量。
4. 检查线性迭代是否达到预期停止条件。
5. 再提高格式阶数、增大时间步或减少修正次数。

PIMPLE 中外循环、压力修正和非正交修正形成嵌套迭代。每层循环的数量都应与 Courant 数、网格质量和耦合强度一起评估。
