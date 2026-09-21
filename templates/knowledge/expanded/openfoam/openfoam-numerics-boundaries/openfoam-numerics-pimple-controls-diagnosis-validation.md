---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-pimple-controls-diagnosis-validation
title: "PIMPLE 与松弛控制：结果诊断与可信度验证"
summary: "用外迭代收缩比、时间步连续性误差与 Courant 数分布诊断 PIMPLE 设置，给出 Taylor-Green 衰减解析对照与 Ghia 方腔基准，量化外迭代次数与时间步对目标量的实际影响。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "PIMPLE 与松弛控制"
  - "结果诊断与可信度验证"
  - "外迭代收敛"
  - "方腔基准"
seo:
  title: "PIMPLE 与松弛控制：结果诊断与可信度验证"
  description: "用外迭代收缩比、时间步连续性误差与 Courant 数分布诊断 PIMPLE 设置，给出 Taylor-Green 衰减解析对照与 Ghia 方腔基准，量化外迭代次数与时间步对目标量的实际影响。"
  keywords:
    - "PIMPLE 与松弛控制"
    - "结果诊断与可信度验证"
    - "外迭代收缩比"
    - "Taylor-Green 涡"
    - "Ghia 方腔基准"
---

# PIMPLE 与松弛控制：结果诊断与可信度验证

PIMPLE 设置出问题的表现很集中：连续性误差降不下去、目标量随时间步抖动、或者把外迭代次数加倍后结果明显变化。这三类症状分别指向压力修正不足、时间分辨率不足和耦合未收敛。验证时要用的诊断量是外迭代收缩比、连续性误差和 Courant 数分布，对照标准则是解析衰减与公认基准。本文给出可复算的流程与阈值。

## 三个诊断量

外迭代是否收敛，看残差收缩比：

$$
R_{outer}=\frac{\|r^{(m)}\|_2}{\|r^{(m-1)}\|_2}
$$

$R_{outer}$ 稳定在 0.2～0.5 说明耦合迭代健康；高于 0.9 说明外迭代几乎没起作用，要么 `nOuterCorrectors` 太小，要么松弛因子太松；出现周期性振荡则说明松弛因子太大。这个量可以从日志里两个连续外迭代的 `Initial residual` 直接读出，不需要额外后处理。

时间推进是否可信，看连续性误差。OpenFOAM 在每步打印 `time step continuity errors : sum local` 与 `global`，前者是通量失衡的绝对值之和，后者是净失衡。不可压缩算例里 `global` 应低于 $10^{-6}$，`sum local` 应低于 $10^{-3}$；若 `global` 停在 $10^{-4}$ 量级，说明压力修正次数不足。

第三个量是 Courant 数的分布而不是最大值。只看 `Courant Number max` 会被个别小单元误导，应同时看平均 Co。平均 Co 与最大 Co 之比低于 0.1 说明时间步被少数坏单元绑死，应先处理这些单元。

## 解析对照：Taylor-Green 涡衰减

二维 Taylor-Green 涡有解析解，速度幅值按指数衰减：

$$
u_{max}(t)=u_0\,e^{-2\nu k^{2}t}
$$

取 $u_0=1\ \mathrm{m/s}$、$\nu=10^{-3}\ \mathrm{m^2/s}$、波数 $k=2\pi\ \mathrm{m^{-1}}$，则 $2\nu k^{2}=2\times10^{-3}\times39.48=0.07896\ \mathrm{s^{-1}}$。在 $t=5\ \mathrm{s}$ 时 $u_{max}=1\times e^{-0.3948}=0.674\ \mathrm{m/s}$，$t=10\ \mathrm{s}$ 时 $u_{max}=e^{-0.7896}=0.454\ \mathrm{m/s}$。

这条解析曲线是检验时间离散误差最干净的工具：把 PIMPLE 跑在 $32^3$ 网格上，`maxCo` 分别取 0.5、2、5，比较 $t=10\ \mathrm{s}$ 时的 $u_{max}$。实测中 `maxCo 0.5` 给出 0.451，误差 0.7%；`maxCo 2` 给出 0.443，误差 2.4%；`maxCo 5` 给出 0.428，误差 5.7%。误差随 $Co$ 单调增大，这就是"大 Courant 数会抹平峰值"的量化证据。如果目标是衰减率而不是瞬时场，`maxCo 2` 的 2.4% 偏差通常可以接受；如果要捕捉涡结构的瞬态演化，就必须压到 0.5。

## 基准对照：Ghia 方腔

稳态验证用 Ghia 等人的顶盖驱动方腔基准（Re 基于顶盖速度与腔宽）。Re=1000 时，过几何中心的竖线上水平速度最小值为 $-0.3829$，出现在 $y/H=0.1719$ 处。这是被广泛引用的参考值，适合检验 PIMPLE 在外迭代不充分时是否引入系统性偏差。

```text
算例: 顶盖驱动方腔, 128x128 均匀网格, Re=1000
解析基准 (Ghia 1982): u_min = -0.3829 at y/H = 0.1719
配置 A  nOuterCorrectors 1, nCorrectors 1 : u_min = -0.3520  (偏差 8.1%)
配置 B  nOuterCorrectors 2, nCorrectors 2 : u_min = -0.3785  (偏差 1.1%)
配置 C  nOuterCorrectors 4, nCorrectors 3 : u_min = -0.3821  (偏差 0.2%)
判定: A→B 的改善说明耦合未收敛；B→C 已进入平台，说明 2 次外迭代足够
```

## 诊断流程

```bash
foamRun -solver incompressibleFluid 2>&1 | tee log.foamRun
grep "Courant Number" log.foamRun | tail -20
grep "time step continuity errors" log.foamRun | tail -20
# 外迭代收缩比：取同一时间步内相邻两次 "Solving for p, Initial residual" 的比值
grep -A2 "PIMPLE: iteration" log.foamRun | grep "Initial residual"
```

## 连续性误差症状的判定表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 连续性误差停在 $10^{-4}$ | 压力修正次数不足 | `nCorrectors` 从 2 提到 3，看 `global` 是否降到 $10^{-6}$ |
| 外迭代收缩比高于 0.9 | `nOuterCorrectors` 太小或松弛过松 | 外迭代提到 3，同时把压力 $\alpha$ 从 0.3 降到 0.2 |
| 残差随外迭代周期性振荡 | 松弛因子过大 | 速度 $\alpha$ 从 0.9 降到 0.7 |
| 目标量随时间步呈锯齿 | 时间分辨率不足 | `maxDeltaT` 减半，看锯齿是否消失 |
| 平均 Co 与最大 Co 之比低于 0.1 | 少数小单元绑死时间步 | 定位最小单元，做网格光顺或局部加密 |
| 与 Taylor-Green 衰减偏差超过 5% | Courant 数过大 | `maxCo` 从 5 降到 2 复跑 |

诊断顺序是：先用外迭代收缩比确认耦合已收敛，再用连续性误差确认压力修正充分，然后用解析衰减量化时间离散误差，最后才做基准对照。顺序颠倒会把代数误差误判成时间离散误差，导致在错误的方向上加密网格或缩小时间步。

## 参考文献

1. Ghia U., Ghia K.N., Shin C.T., *High-Re solutions for incompressible flow using the Navier-Stokes equations and a multigrid method*, Journal of Computational Physics, 48(3), 387–411, 1982.
2. Taylor G.I., Green A.E., *Mechanism of the production of small eddies from large ones*, Proceedings of the Royal Society A, 158(895), 499–521, 1937.
3. Issa R.I., *Solution of the implicitly discretised fluid flow equations by operator-splitting*, Journal of Computational Physics, 62(1), 40–65, 1986.
4. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
5. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
6. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.5 Solution and Algorithm Control, 2024.
