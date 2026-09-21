---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-pimple-controls-engineering-setup
title: "PIMPLE 与松弛控制：工程设置与参数选择"
summary: "给出 PIMPLE 与 relaxationFactors 的可复现模板、外迭代次数与松弛因子的取值依据、adjustTimeStep 的时间步调整算法，以及用 residualControl 终止稳态计算的配置方法。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "PIMPLE 与松弛控制"
  - "工程设置与参数选择"
  - "relaxationFactors"
  - "adjustTimeStep"
seo:
  title: "PIMPLE 与松弛控制：工程设置与参数选择"
  description: "给出 PIMPLE 与 relaxationFactors 的可复现模板、外迭代次数与松弛因子的取值依据、adjustTimeStep 的时间步调整算法，以及用 residualControl 终止稳态计算的配置方法。"
  keywords:
    - "PIMPLE 与松弛控制"
    - "工程设置与参数选择"
    - "relaxationFactors 取值"
    - "adjustTimeStep"
    - "residualControl"
---

# PIMPLE 与松弛控制：工程设置与参数选择

PIMPLE 的工程设置集中在四个数字上：`nOuterCorrectors`、`nCorrectors`、`momentumPredictor` 和松弛因子。它们分别对应"每个时间步反复耦合几次""每次耦合里修正压力几次""是否先做动量预测"和"每步推进多少"。本文给出可复现模板、每个数字的取值依据、时间步自适应算法，以及稳态计算的终止条件配置。

## 外迭代次数与压力修正次数

`nOuterCorrectors` 决定动量方程与压力方程在一个时间步内耦合几轮。取 1 时 PIMPLE 退化为 PISO，要求 Courant 数小于 1；取 2 允许 $Co$ 到约 5；取 3～4 允许 $Co$ 到 10。代价是每步计算量按次数线性增加，因此原则是取到目标量稳定为止，而不是越大越好。

`nCorrectors` 是每次外迭代里压力修正的次数。取 2 是工程默认值；对多相流或强浮力算例可以取 3，让压力场在单次外迭代内更充分地传播。`momentumPredictor yes` 表示先解一次动量方程再解压力，对低黏度、强对流的算例能显著加快外迭代收敛；对蠕流或强浮力主导的算例设为 `no` 更省时间，因为动量预测步的信息价值很低。

| 场景 | `nOuterCorrectors` | `nCorrectors` | `momentumPredictor` |
|---|---|---|---|
| 层流瞬态，$Co<1$ | 1 | 2 | yes |
| 湍流瞬态，$Co\approx5$ | 2 | 2 | yes |
| 多相 VOF，$Co\approx2$ | 3 | 3 | yes |
| 自然对流，$Ra\sim10^{10}$ | 2 | 2 | no |
| 稳态用 PIMPLE | 3 | 1 | yes |

## 时间步自适应

打开 `adjustTimeStep` 后，求解器按 Courant 数调整步长：

$$
\Delta t_{new}=\min\left(\Delta t\frac{Co_{target}}{Co_{max}},\ \Delta t_{max}\right)
$$

$Co_{target}$ 就是 `maxCo`，$\Delta t_{max}$ 是 `maxDeltaT`。举一个可核对的例子：当前 $\Delta t=0.01\ \mathrm{s}$，本步算得 $Co_{max}=4$，`maxCo` 设为 2，则 $\Delta t_{new}=0.01\times2/4=0.005\ \mathrm{s}$。若下一阶段流场减速到 $Co_{max}=1$，步长会被 `maxDeltaT 0.02` 限制在 $0.02\ \mathrm{s}$，不会无限增长。一个总时长 $10\ \mathrm{s}$ 的算例在 $\Delta t=0.005\ \mathrm{s}$ 下需要 2000 步。

```cpp
PIMPLE
{
    nOuterCorrectors   2;
    nCorrectors        2;
    nNonOrthogonalCorrectors 1;
    momentumPredictor  yes;
    pRefCell           0;
    pRefValue          0;
}

relaxationFactors
{
    fields    { p 0.3; }
    equations { U 0.7; k 0.7; epsilon 0.7; }
}
```

瞬态 PIMPLE 通常把松弛因子全部设为 1，让外迭代承担收敛职责；稳态用 PIMPLE 时才保留上表的松弛值。

```cpp
// system/controlDict 中的时间步控制
adjustTimeStep  yes;
maxCo           2;
maxDeltaT       0.02;
writeControl    adjustableRunTime;
writeInterval   0.1;

// 稳态计算的终止条件（配合 SIMPLE 或 PIMPLE 的 outer 循环）
residualControl
{
    p       1e-4;
    U       1e-5;
    "(k|epsilon|omega)" 1e-5;
}
```

`residualControl` 的判据是所有列出场的初始残差同时低于给定容差：

$$
r_P^{(n)}<\text{tol}_P\quad\text{对所有列出的场 } P
$$

只要有一个场没达到，迭代就继续。它比固定迭代次数更省时间，但要求容差与物理量容差匹配——把压力容差设成 `1e-6` 在多数算例上永远达不到，只会把计算跑满 `endTime`。

## 外迭代与时间步的三轮对照

| 轮次 | 改动项 | 不变项 | 记录量 |
|---|---|---|---|
| P0 | `nOuterCorrectors 1` | 网格、格式、`maxCo` | 连续性误差、目标量、步均耗时 |
| P1 | 仅提到 2 | 其余全部 | 同上，看是否收敛 |
| P2 | 仅把 `maxCo` 从 2 提到 5 | 其余全部 | 峰值衰减、时间步长历史 |
| P3 | 仅把 `momentumPredictor` 改为 no | 其余全部 | 外迭代次数、目标量 |

判定规则：P1 相对 P0 的连续性误差若下降一个数量级，说明单次外迭代不够；P2 若把涡脱落峰值削掉 5% 以上，说明时间离散误差已经不可忽略，应把 `maxCo` 退回；P3 若目标量变化小于 0.5% 且耗时明显下降，就可以长期关掉动量预测。

## 外迭代参数与异常对照

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 每个时间步连续性误差超过 $10^{-4}$ | `nCorrectors` 不足 | 从 2 提到 3，看误差是否下降 |
| 时间步被压到极小并卡住 | `maxCo` 太小或存在坏单元 | 查看 `Courant Number max` 出现的位置 |
| 稳态算例跑到 `endTime` 仍未停 | `residualControl` 容差过严 | 放宽到 $10^{-4}$ 并观察目标量是否已稳定 |
| 目标量随时间步呈锯齿 | `maxDeltaT` 太大导致时间分辨率不足 | 把 `maxDeltaT` 减半再跑 |
| 打开动量预测后反而发散 | 强浮力下预测步引入压力失配 | 设 `momentumPredictor no` 复跑 |

记录时应把 `maxCo`、`nOuterCorrectors`、`nCorrectors` 与松弛因子写在同一行。只改其中一项而其余留白，事后无法判断目标量的变化来自时间分辨率还是内迭代收敛程度。

## 参考文献

1. Issa R.I., *Solution of the implicitly discretised fluid flow equations by operator-splitting*, Journal of Computational Physics, 62(1), 40–65, 1986.
2. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
3. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
4. Rhie C.M., Chow W.L., *Numerical study of the turbulent flow past an airfoil with trailing edge separation*, AIAA Journal, 21(11), 1525–1532, 1983.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.5 Solution and Algorithm Control, 2024.
6. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
