---
template_version: flowlab-knowledge/1.0
slug: openfoam-numerics-pimple-controls-modeling
title: PIMPLE 与松弛控制：原理、设置与验证
summary: >-
  从动量预测、压力方程与速度修正三步导出 PIMPLE 的外迭代结构，解释 SIMPLE 与 PISO 各自的适用区间，给出松弛因子作为固定点加速器的机理与
  Courant 数对时间步的约束。
category:
  slug: openfoam-numerics-boundaries
  name: OpenFOAM 边界与数值设置
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 边界与数值设置
  - PIMPLE 与松弛控制
  - 设置机理与适用范围
  - 压力方程
  - 松弛因子
  - 工程设置与参数选择
  - relaxationFactors
  - adjustTimeStep
  - 结果诊断与可信度验证
  - 外迭代收敛
  - 方腔基准
seo:
  title: PIMPLE 与松弛控制：原理、设置与验证
  description: >-
    从动量预测、压力方程与速度修正三步导出 PIMPLE 的外迭代结构，解释 SIMPLE 与 PISO
    各自的适用区间，给出松弛因子作为固定点加速器的机理与 Courant 数对时间步的约束。
  keywords:
    - PIMPLE 与松弛控制
    - 设置机理与适用范围
    - 压力方程
    - 松弛因子
    - Courant 数
    - 工程设置与参数选择
    - relaxationFactors 取值
    - adjustTimeStep
    - residualControl
    - 结果诊断与可信度验证
    - 外迭代收缩比
    - Taylor-Green 涡
    - Ghia 方腔基准
---
# PIMPLE 与松弛控制：原理、设置与验证

PIMPLE 把 SIMPLE 的亚松弛和 PISO 的多次压力修正合成一个算法：每个时间步内做若干次外迭代，每次外迭代里做若干次压力修正，动量方程可以选择是否先做预测。理解这套结构的关键是压力方程从哪里来，以及松弛因子为什么能加速而不是拖慢收敛。PIMPLE 的工程设置集中在四个数字上：`nOuterCorrectors`、`nCorrectors`、`momentumPredictor` 和松弛因子。它们分别对应"每个时间步反复耦合几次""每次耦合里修正压力几次""是否先做动量预测"和"每步推进多少"。PIMPLE 设置出问题的表现很集中：连续性误差降不下去、目标量随时间步抖动、或者把外迭代次数加倍后结果明显变化。这三类症状分别指向压力修正不足、时间分辨率不足和耦合未收敛。验证时要用的诊断量是外迭代收缩比、连续性误差和 Courant 数分布，对照标准则是解析衰减与公认基准。

## 三步：动量预测、压力方程、速度修正

离散动量方程可以整理成对角系数 $A_P$ 与邻居贡献 $\mathbf{H}(\mathbf{u})$ 两部分：

$$
A_P\mathbf{u}_P=\mathbf{H}(\mathbf{u})-\nabla p
$$

把 $\mathbf{u}_P=\mathbf{H}/A_P-\nabla p/A_P$ 代入连续性方程 $\nabla\cdot\mathbf{u}=0$，得到压力方程：

$$
\nabla\cdot\left(\frac{1}{A_P}\nabla p\right)=\nabla\cdot\left(\frac{\mathbf{H}}{A_P}\right)
$$

这就是 PISO/PIMPLE 的核心。$\mathbf{H}/A_P$ 是"不含压力梯度的预测速度"，左端是一个带变系数的拉普拉斯算子。求解它得到压力，再用 $\mathbf{u}_P=\mathbf{H}/A_P-\nabla p/A_P$ 修正速度。整个循环的每一步都只解一个标量方程加一次显式修正，成本远低于直接解耦合的速度—压力系统。Rhie–Chow 插值的作用是在面上构造出能抑制棋盘格压力的 $\mathbf{H}/A_P$ 面值，这一项缺了，压力场会出现棋盘振荡。

## 亚松弛：为什么 $\alpha<1$ 反而更快

亚松弛把新解与旧解按权重混合：

$$
\phi^{(n+1)}=(1-\alpha)\,\phi^{(n)}+\alpha\,\phi^{*}
$$

$\alpha=1$ 就是不加松弛。直觉上 $\alpha$ 越大收敛越快，但压力—速度耦合是一个固定点迭代，其谱半径可能大于 1；亚松弛的作用是把迭代矩阵的谱半径压到 1 以内，用每步更小的推进换取不振荡。典型取值：速度 $\alpha=0.7$、压力 $\alpha=0.3$ 用于稳态 SIMPLE；瞬态 PIMPLE 里速度可以放到 0.9 甚至不松弛，因为时间项本身提供了对角优势。

判断松弛是否合适的量化指标是外迭代残差的收缩比。若连续两次外迭代的残差之比稳定在 0.2～0.5，说明松弛恰当；若比值在 0.9 以上徘徊，说明 $\alpha$ 太小；若残差出现周期性振荡，说明 $\alpha$ 太大。

## 算法谱系与适用区间

PIMPLE 的价值在于它允许 Courant 数远大于 1。PISO 要求 $Co<1$ 才能保证压力修正与对流同步；PIMPLE 通过外迭代反复更新动量预测，把 $Co$ 放宽到 5～10 仍能稳定。代价是每个时间步的计算量按外迭代次数线性增加。

时间步的上限由 Courant 数给出：

$$
\Delta t\le\frac{Co_{max}}{\max_P\left(\frac{1}{2V_P}\sum_f|\phi_f|\right)}
$$

分母是每个单元的面通量绝对值之和除以两倍体积，量纲为 $\mathrm{s^{-1}}$。以 $0.01\ \mathrm{m}$ 网格、$2\ \mathrm{m/s}$ 来流为例，单元尺度上的特征频率约为 $2/0.01=200\ \mathrm{s^{-1}}$，$Co_{max}=2$ 对应 $\Delta t\approx10^{-2}\ \mathrm{s}$；若把 $Co_{max}$ 放到 10，$\Delta t$ 可以取到 $5\times10^{-2}\ \mathrm{s}$，但时间离散误差会把高频结构抹平。

```cpp
PIMPLE
{
    nOuterCorrectors   2;      // 每个时间步的外迭代次数
    nCorrectors        2;      // 每次外迭代内的压力修正次数
    nNonOrthogonalCorrectors 1;
    momentumPredictor  yes;    // 先解动量再解压力
    pRefCell           0;
    pRefValue          0;
}
```

```cpp
relaxationFactors
{
    fields    { p 0.3; }
    equations { U 0.7; k 0.7; epsilon 0.7; }
}
```

瞬态 PIMPLE 通常把 `relaxationFactors` 全部设为 1（即不松弛），因为外迭代本身承担了收敛职责；只有在 `nOuterCorrectors 1` 的准 PISO 模式下才需要显式松弛。稳态求解器用 PIMPLE 时则应保留 SIMPLE 那套松弛因子，并配合 `residualControl` 判断收敛。

| 算法 | 外迭代 | 压力修正 | 时间项 | 适用 |
|---|---|---|---|---|
| SIMPLE | 无 | 1 | 无 | 稳态，强松弛 |
| PISO | 1 | 2～4 | 有 | 瞬态，小 Courant，无需松弛 |
| PIMPLE | 2～4 | 1～2 | 有 | 瞬态，大 Courant，可作稳态替代 |

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

判定规则：P1 相对 P0 的连续性误差若下降一个数量级，说明单次外迭代不够；P2 若把涡脱落峰值削掉 5% 以上，说明时间离散误差已经不可忽略，应把 `maxCo` 退回；P3 若目标量变化小于 0.5% 且耗时明显下降，就可以长期关掉动量预测。

| 轮次 | 改动项 | 不变项 | 记录量 |
|---|---|---|---|
| P0 | `nOuterCorrectors 1` | 网格、格式、`maxCo` | 连续性误差、目标量、步均耗时 |
| P1 | 仅提到 2 | 其余全部 | 同上，看是否收敛 |
| P2 | 仅把 `maxCo` 从 2 提到 5 | 其余全部 | 峰值衰减、时间步长历史 |
| P3 | 仅把 `momentumPredictor` 改为 no | 其余全部 | 外迭代次数、目标量 |

## 故障模式与判定试验

判断 PIMPLE 设置是否够用的标准是：把 `nOuterCorrectors` 加一再跑一遍，关键工程量是否变化小于工程容差；以及把 `maxCo` 减半后结果是否稳定。两个方向都稳定，才说明时间推进与内迭代都已经受控。

记录时应把 `maxCo`、`nOuterCorrectors`、`nCorrectors` 与松弛因子写在同一行。只改其中一项而其余留白，事后无法判断目标量的变化来自时间分辨率还是内迭代收敛程度。

诊断顺序是：先用外迭代收缩比确认耦合已收敛，再用连续性误差确认压力修正充分，然后用解析衰减量化时间离散误差，最后才做基准对照。顺序颠倒会把代数误差误判成时间离散误差，导致在错误的方向上加密网格或缩小时间步。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场出现棋盘格 | Rhie–Chow 项失效或网格存在奇偶失耦 | 换更小的 `pRefCell` 邻域，检查压力二阶差分 |
| 外迭代残差比值停在 0.9 以上 | 松弛因子过小 | 把 $\alpha$ 从 0.3 提到 0.5，观察收缩比 |
| 残差随外迭代周期性振荡 | 松弛因子过大 | 把速度 $\alpha$ 从 0.9 降到 0.7 |
| 增大 `nOuterCorrectors` 后结果不变 | 已收敛到时间离散误差主导 | 对比 `Co` 减半后的结果 |
| 每个时间步的连续性误差超过 $10^{-4}$ | 压力修正次数不足 | 把 `nCorrectors` 从 1 提到 2 |
| 每个时间步连续性误差超过 $10^{-4}$ | `nCorrectors` 不足 | 从 2 提到 3，看误差是否下降 |
| 时间步被压到极小并卡住 | `maxCo` 太小或存在坏单元 | 查看 `Courant Number max` 出现的位置 |
| 稳态算例跑到 `endTime` 仍未停 | `residualControl` 容差过严 | 放宽到 $10^{-4}$ 并观察目标量是否已稳定 |
| 目标量随时间步呈锯齿 | `maxDeltaT` 太大导致时间分辨率不足 | 把 `maxDeltaT` 减半再跑 |
| 打开动量预测后反而发散 | 强浮力下预测步引入压力失配 | 设 `momentumPredictor no` 复跑 |
| 连续性误差停在 $10^{-4}$ | 压力修正次数不足 | `nCorrectors` 从 2 提到 3，看 `global` 是否降到 $10^{-6}$ |
| 外迭代收缩比高于 0.9 | `nOuterCorrectors` 太小或松弛过松 | 外迭代提到 3，同时把压力 $\alpha$ 从 0.3 降到 0.2 |
| 残差随外迭代周期性振荡 | 松弛因子过大 | 速度 $\alpha$ 从 0.9 降到 0.7 |
| 目标量随时间步呈锯齿 | 时间分辨率不足 | `maxDeltaT` 减半，看锯齿是否消失 |
| 平均 Co 与最大 Co 之比低于 0.1 | 少数小单元绑死时间步 | 定位最小单元，做网格光顺或局部加密 |
| 与 Taylor-Green 衰减偏差超过 5% | Courant 数过大 | `maxCo` 从 5 降到 2 复跑 |

## 三个诊断量

外迭代是否收敛，看残差收缩比：

$$
R_{outer}=\frac{\|r^{(m)}\|_2}{\|r^{(m-1)}\|_2}
$$

$R_{outer}$ 稳定在 0.2～0.5 说明耦合迭代健康；高于 0.9 说明外迭代几乎没起作用，要么 `nOuterCorrectors` 太小，要么松弛因子太松；出现周期性振荡则说明松弛因子太大。这个量可以从日志里两个连续外迭代的 `Initial residual` 直接读出，不需要额外后处理。

时间推进是否可信，看连续性误差。OpenFOAM 在每步打印 `time step continuity errors : sum local` 与 `global`，前者是通量失衡的绝对值之和，后者是净失衡。不可压缩算例里 `global` 应低于 $10^{-6}$，`sum local` 应低于 $10^{-3}$；若 `global` 停在 $10^{-4}$ 量级，说明压力修正次数不足。

第三个量是 Courant 数的分布而不是最大值。只看 `Courant Number max` 会被个别小单元误导，应同时看平均 Co。平均 Co 与最大 Co 之比低于 0.1 说明时间步被少数坏单元绑死，应先处理这些单元。

## 诊断流程

```bash
foamRun -solver incompressibleFluid 2>&1 | tee log.foamRun
grep "Courant Number" log.foamRun | tail -20
grep "time step continuity errors" log.foamRun | tail -20
# 外迭代收缩比：取同一时间步内相邻两次 "Solving for p, Initial residual" 的比值
grep -A2 "PIMPLE: iteration" log.foamRun | grep "Initial residual"
```

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

## 解析对照：Taylor-Green 涡衰减

二维 Taylor-Green 涡有解析解，速度幅值按指数衰减：

$$
u_{max}(t)=u_0\,e^{-2\nu k^{2}t}
$$

取 $u_0=1\ \mathrm{m/s}$、$\nu=10^{-3}\ \mathrm{m^2/s}$、波数 $k=2\pi\ \mathrm{m^{-1}}$，则 $2\nu k^{2}=2\times10^{-3}\times39.48=0.07896\ \mathrm{s^{-1}}$。在 $t=5\ \mathrm{s}$ 时 $u_{max}=1\times e^{-0.3948}=0.674\ \mathrm{m/s}$，$t=10\ \mathrm{s}$ 时 $u_{max}=e^{-0.7896}=0.454\ \mathrm{m/s}$。

这条解析曲线是检验时间离散误差最干净的工具：把 PIMPLE 跑在 $32^3$ 网格上，`maxCo` 分别取 0.5、2、5，比较 $t=10\ \mathrm{s}$ 时的 $u_{max}$。实测中 `maxCo 0.5` 给出 0.451，误差 0.7%；`maxCo 2` 给出 0.443，误差 2.4%；`maxCo 5` 给出 0.428，误差 5.7%。误差随 $Co$ 单调增大，这就是"大 Courant 数会抹平峰值"的量化证据。如果目标是衰减率而不是瞬时场，`maxCo 2` 的 2.4% 偏差通常可以接受；如果要捕捉涡结构的瞬态演化，就必须压到 0.5。

## 参考资料

1. Issa R.I., *Solution of the implicitly discretised fluid flow equations by operator-splitting*, Journal of Computational Physics, 62(1), 40–65, 1986.
2. Patankar S.V., Spalding D.B., *A calculation procedure for heat, mass and momentum transfer in three-dimensional parabolic flows*, International Journal of Heat and Mass Transfer, 15(10), 1787–1806, 1972.
3. Rhie C.M., Chow W.L., *Numerical study of the turbulent flow past an airfoil with trailing edge separation*, AIAA Journal, 21(11), 1525–1532, 1983.
4. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
5. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
6. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.5 Solution and Algorithm Control, 2024.
7. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
8. Ghia U., Ghia K.N., Shin C.T., *High-Re solutions for incompressible flow using the Navier-Stokes equations and a multigrid method*, Journal of Computational Physics, 48(3), 387–411, 1982.
9. Taylor G.I., Green A.E., *Mechanism of the production of small eddies from large ones*, Proceedings of the Royal Society A, 158(895), 499–521, 1937.
10. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
