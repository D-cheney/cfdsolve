---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-time-discretization-engineering-setup
title: "时间离散与误差控制：工程设置与参数选择"
summary: "把时间离散的选项收敛到 controlDict 与 fvSolution 两处：给出 OpenFOAM Courant 数的实际定义、自适应步长的增长限幅手算、maxCo 与 maxAlphaCo 的取值依据，以及时间格式与内迭代次数的对照设置表。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "时间离散与误差控制"
  - "工程设置与参数选择"
  - "自适应时间步"
  - "maxCo"
seo:
  title: "时间离散与误差控制：工程设置与参数选择"
  description: "把时间离散的选项收敛到 controlDict 与 fvSolution 两处：给出 OpenFOAM Courant 数的实际定义、自适应步长的增长限幅手算、maxCo 与 maxAlphaCo 的取值依据，以及时间格式与内迭代次数的对照设置表。"
  keywords:
    - "时间离散与误差控制"
    - "工程设置与参数选择"
    - "自适应时间步"
    - "maxCo"
---

# 时间离散与误差控制：工程设置与参数选择

时间离散的工程配置集中在两个文件：`controlDict` 决定步长怎么走，`fvSolution` 决定每一步解到什么程度。两者的取值互相牵制——把 `maxCo` 放大的同时如果不动内迭代次数，多出来的时间误差会被代数误差掩盖，结果既不可信也看不出问题。本文给出从 Courant 数到实际步长的换算，以及一套四工况的内迭代对照设置。

## OpenFOAM 的 Courant 数到底怎么算

`CourantNo.H` 里的定义不是简单的 $u\Delta t/\Delta x$，而是

$$\mathrm{Co}=\frac{\Delta t}{2}\max_{P}\frac{\sum_{f}\left|\phi_f\right|}{V_P},\qquad \phi_f=\mathbf{u}_f\cdot\mathbf{S}_f$$

对一个来流与出流各占一个面的六面体单元，$V_P=\Delta x\,A$，$\sum_f\left|\phi_f\right|=2\left|u\right|A$，代回得

$$\mathrm{Co}=\frac{\Delta t}{2}\cdot\frac{2\left|u\right|A}{\Delta x\,A}=\frac{\left|u\right|\Delta t}{\Delta x}$$

与教科书定义一致。但若单元形状复杂、面数多于 6，OpenFOAM 给出的 $\mathrm{Co}$ 会大于 $\left|u\right|\Delta t/\Delta x$，这一点在多面体网格上必须注意。

手算一次：$u=5\ \mathrm{m/s}$，$\Delta x=2\ \mathrm{mm}=2.0\times10^{-3}\ \mathrm{m}$，取 $\mathrm{maxCo}=1$：

$$\Delta t=\frac{\mathrm{maxCo}\cdot\Delta x}{u}=\frac{1\times2.0\times10^{-3}}{5}=4.0\times10^{-4}\ \mathrm{s}$$

## 自适应步长的增长限幅

`adjustTimeStep yes` 打开后，求解器按上一步的 Courant 数调整步长，同时受两个上限约束：

$$\Delta t_{\text{new}}=\min\left(\Delta t\cdot\min\left(\frac{\mathrm{maxCo}}{\mathrm{Co}},\ 1.2\right),\ \mathrm{maxDeltaT}\right)$$

手算一次增长过程：某步 $\mathrm{Co}=0.4$，$\mathrm{maxCo}=1$，则比值 $1/0.4=2.5$，但被 1.2 的增长率上限截断，于是 $\Delta t_{\text{new}}=1.2\,\Delta t$。若 $\mathrm{Co}=1.3$，比值 $0.769$，则 $\Delta t_{\text{new}}=0.769\,\Delta t$。1.2 这个上限保证步长不会在流场突然变缓时暴涨，避免下一步立刻因 Co 超限而回落形成振荡。

`maxDeltaT` 的作用是给步长封顶，典型取值 0.01 s 到 0.1 s，主要防止长时间稳态阶段步长无限增大导致时间分辨率丢失。

## 完整配置

```cpp
// system/controlDict
application     pimpleFoam;
startTime       0;
endTime         2.0;
deltaT          1e-4;
writeControl    adjustableRunTime;
writeInterval   0.05;
purgeWrite      5;
adjustTimeStep  yes;
maxCo           1.0;
maxAlphaCo      0.5;      // VOF 界面 Courant 数
maxDeltaT       0.01;

// system/fvSchemes
ddtSchemes
{
    default         backward;        // 二阶隐式, L-稳定
}

// system/fvSolution
PIMPLE
{
    nOuterCorrectors     1;
    nCorrectors          2;          // PISO 压力修正次数
    nNonOrthogonalCorrectors 1;
    momentumPredictor    yes;
    correctPhi           yes;
}
solvers
{
    p  { solver GAMG; tolerance 1e-7; relTol 0.01; }
    pFinal { $p; relTol 0; }
    U  { solver smoothSolver; smoother symGaussSeidel; tolerance 1e-8; relTol 0.1; }
    UFinal { $U; relTol 0; }
}
```

`backward` 是二阶且 L-稳定，适合大多数瞬态算例；`CrankNicolson 0.9` 精度相当但刚性模态会残留 $2\Delta t$ 锯齿，只在需要更低的数值耗散时使用。`Euler` 一阶，只用于启动阶段或粗算。

## 四组内迭代对照

| 工况 | ddtSchemes | maxCo | nCorrectors | 观察量 | 判据 |
|---|---|---|---|---|---|
| T0 | backward | 1.0 | 2 | 升力周期均值 | 基准 |
| T1 | backward | 1.0 | 4 | 升力周期均值 | 与 T0 差异 < 0.5 % 则内迭代足够 |
| T2 | backward | 0.5 | 2 | 升力周期均值 | 与 T0 差异 < 1 % 则 Co=1 可接受 |
| T3 | CrankNicolson 0.9 | 1.0 | 2 | 升力周期均值与锯齿幅值 | 锯齿幅值应明显大于 T0 |

T1 与 T2 分别封住两条误差通道：T1 排除代数误差，T2 排除时间离散误差。两者都通过后，T3 的差异才可以归因于时间格式本身的耗散特性。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 步长在两步之间反复涨落 | 增长限幅被移除或 `maxDeltaT` 过小 | 打印步长序列，若呈锯齿则检查 `maxDeltaT` 与 `maxCo` 的比值 |
| `maxCo` 从 1 降到 0.5 结果变化 6 % | 内迭代不足，时间误差与代数误差混叠 | 固定 `maxCo`，把 `nCorrectors` 提到 4 重跑 |
| 界面出现非物理破碎 | VOF 界面 Courant 数超限 | 输出 `maxAlphaCo` 实际值，若 > 0.5 则降低该上限 |
| 稳态阶段步长被 `maxDeltaT` 卡住 | 封顶值设得过小，白白增加步数 | 比较步长序列与 `maxDeltaT`，相等即为被截断 |
| 残差在每步内不下降 | `nCorrectors` 太少或压力容差过松 | 把 `pFinal` 的 `relTol` 设为 0，观察残差是否继续下降 |

## 参考文献

1. Issa R.I., *Solution of the implicitly discretised fluid flow equations by operator-splitting*, Journal of Computational Physics, 62(1):40–65, 1986.
2. Patankar S.V., Spalding D.B., *A calculation procedure for heat, mass and momentum transfer in three-dimensional parabolic flows*, International Journal of Heat and Mass Transfer, 15(10):1787–1806, 1972.
3. Hairer E., Wanner G., *Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems*, 2nd ed., Springer, 1996.
4. OpenFOAM Foundation, *OpenFOAM v11 User Guide*, chapter on time control and `controlDict`, 2023.
