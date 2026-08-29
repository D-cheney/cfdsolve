---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-fvsolution-convergence
title: OpenFOAM fvSolution、耦合算法与收敛控制
summary: 说明线性求解器与预条件、SIMPLE/PISO/PIMPLE 控制、松弛和容差的作用，建立残差、守恒、监控量和时间步共同组成的收敛判据。
category: { slug: openfoam-numerics-boundaries, name: OpenFOAM 边界与数值设置 }
level: 工程
reading_minutes: 17
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, fvSolution, SIMPLE, PISO, PIMPLE, 收敛]
seo:
  title: OpenFOAM fvSolution 与收敛控制
  description: 配置线性求解、压力速度耦合和松弛，并用残差、守恒和监控量判定收敛。
  keywords: [fvSolution, OpenFOAM convergence, PIMPLE]
---

# OpenFOAM fvSolution、耦合算法与收敛控制

`fvSolution` 控制代数方程如何求解以及方程之间如何迭代。降低容差不等于提高物理准确性，内层线性误差必须与外层耦合误差和离散误差匹配。

## 1. 线性求解

根据矩阵对称性、正定性和问题尺度选择求解器与预条件。`tolerance` 控制绝对停止，`relTol` 控制相对下降；最终校正可使用更严格设置。若迭代数突然上升，应检查网格、时间步、边界和系数范围。

## 2. 耦合算法

SIMPLE 常用于稳态外迭代，PISO 常用于每个时间步内的瞬态校正，PIMPLE 结合外循环与压力校正。名称背后的实际循环由控制字典决定，不能只凭求解器名判断。

## 3. 松弛与时间步

稳态计算可对场或方程使用欠松弛；瞬态计算优先通过物理时间步和每步校正控制稳定性。过强松弛会掩盖本质非稳态，过大时间步即使迭代收敛也会造成时间离散误差。

## 4. 四类收敛证据

1. 线性与方程残差充分下降且无周期性增长；
2. 入口出口质量、能量和组分守恒；
3. 压降、力、热流等工程量稳定或达到统计稳定；
4. 网格、时间步、容差和格式敏感性可接受。

## 5. 排错顺序

先检查量纲和边界，再检查网格最差位置、初值和 Courant 数，最后才调松弛、求解器和格式。数值参数不应成为修补错误物理输入的第一手段。

## 6. 参考资料

1. 当前 OpenFOAM 版本的 Solution and Algorithm Control 文档。

