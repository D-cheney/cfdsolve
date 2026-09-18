---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-log-diagnostics
title: OpenFOAM 日志中的残差、Courant 数与守恒诊断
summary: 把求解日志当作三级证据链来读：外层非线性残差、内层线性求解状态、全局守恒与时间步指标，并给出残差归一化形式、Courant 数判据、连续性误差三种读法以及可复现的解析流程。
category: { slug: openfoam-post-troubleshooting, name: "OpenFOAM 后处理与排错" }
level: 工程
reading_minutes: 13
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [OpenFOAM, 日志, 残差, Courant数, 连续性误差, 守恒]
seo:
  title: OpenFOAM 日志残差、Courant 数与守恒诊断
  description: 按时间步解析 OpenFOAM 求解日志，联合残差、Courant 数与连续性误差判定求解是否可信。
  keywords: [OpenFOAM 日志, 残差, Courant Number, continuity errors]
---

# OpenFOAM 日志中的残差、Courant 数与守恒诊断

求解日志是 OpenFOAM 留给工程师最完整的一份"体检报告"：它同时记录外层非线性残差、内层线性求解状态、时间步连续性误差、Courant 数和每个函数对象的采样值。绝大多数"算完了没有""为什么结果不对"的问题，答案都在日志里，而不在最后的场文件里。本文给出一条从日志提取证据、按时间步组织分析、并把残差、Courant 数与守恒误差三者交叉验证的工程路径。

## 1 结论与适用场景

先把结论摆在前面：

- 日志必须按"时间步—方程—迭代"三级结构去读，孤立的某个残差值没有意义。
- `Initial residual` 反映本次内层求解前该方程的不平衡，`Final residual` 与 `No Iterations` 反映这次线性求解解到什么程度；二者都不能直接证明外层非线性已经收敛。
- 瞬态计算要同时看 Courant 数的平均值与最大值：最大值决定稳定性，平均值决定精度与成本。
- `time step continuity errors` 的局部、全局、累计三个数各有用途：局部找坏单元，全局看总偏差，累计看系统漂移。
- 出现非有限值时，要回到"第一个出现非有限值的时间步和变量"，而不是看最后的崩溃堆栈。

适用场景包括稳态 RANS 的日常巡检、瞬态计算的稳定性监控、批量算例的自动验收，以及事后复盘。它的价值在于把散落在屏幕上的数字重新组织成可比较、可存档的证据。对于需要统计收敛判据的 LES/DES 大样本分析，本文只做提示，不展开。理解本文的前提是已经能跑通一个稳态或瞬态案例，并能读懂 `controlDict`、`fvSolution` 的基本结构。

## 2 背景与原理

OpenFOAM 每个时间步、每个方程都会打印一行求解信息，结构大致如下：

```text
Time = 0.15
smoothSolver:  Solving for Ux, Initial residual = 0.0012, Final residual = 3.4e-06, No Iterations 2
smoothSolver:  Solving for Uy, Initial residual = 0.0011, Final residual = 2.8e-06, No Iterations 2
GAMG:  Solving for p, Initial residual = 0.00089, Final residual = 4.1e-07, No Iterations 4
time step continuity errors : sum local = 1.2e-09, global = -3.4e-19, cumulative = 5.6e-14
ExecutionTime = 12.34 s  ClockTime = 15 s
```

读这几行就能还原整个时间步的健康状况。`Initial residual` 是求解器对当前线性系统算出的归一化不平衡量，它随外循环迭代与时间推进而下降；`Final residual` 是这次线性求解达到的停止水平，通常应比 `Initial residual` 至少低 1～2 个数量级。若某方程 `No Iterations` 长期顶到上限，例如压力方程总是 50 次打满，说明线性求解根本没解到位，外层迭代会被拖住。

还要看清日志的三层嵌套：最外层是时间步或 SIMPLE 外迭代，中间层是对方程的依次求解（先动量、再压力、再湍流与能量），最内层才是线性求解器。同一个 `Time` 下出现多组 `Solving for Ux`，说明压力–速度耦合做了多次外循环；PIMPLE 的 `Outer correction` 次数直接决定每步成本，也决定残差能降到多低。若开启了 `residualControl`，还要关注求解器在满足阈值后提前停止外迭代的提示，这正是稳态计算的正常收尾方式。

残差的归一化方式决定了它的绝对量级。OpenFOAM 用当前场与离散系数对残差做归一化，得到一个与问题尺度无关的相对量：

$$
R_\phi^{(n)} = \frac{\sum_P \left| a_P \phi_P - \sum_{nb} a_{nb} \phi_{nb} - b_P \right|}{\sum_P \left| a_P \phi_P \right|}
$$

这种定义让不同方程之间可以横向比较，代价是它随场本身变化，因此跨案例、跨软件比较"下降了几个数量级"意义有限。理解这一点，是读懂残差曲线的前提。

Courant 数是时间推进的核心稳定性指标。对不可压求解器，它源于每个单元面上对流通量与单元体积之比：

$$
Co_P = \frac{\Delta t}{2 V_P} \sum_f \left| \phi_f \right|
$$

其中 $\phi_f$ 是面通量，$V_P$ 是单元体积。对可压缩或含声波的问题，特征速度要加上声速：

$$
Co_{ac} = \frac{\left( \left| \mathbf{u} \right| + c \right) \Delta t}{\Delta x}
$$

当 $Co_{ac} > 1$ 时，信息在一个时间步内跨越超过一个单元，显式格式会出现非物理传播。即便隐式格式数值上稳定，过大的 Courant 数仍会带来严重的时间离散误差，使结果"能算但不对"。在日志中，`Courant Number mean` 与 `max` 是一对：平均值持续上升说明整体时间分辨率不足，最大值远高于平均值则说明存在局部热点，应回到网格定位该单元。

残差、Courant 数与连续性误差三者互为约束：残差保证代数方程被解开，Courant 数保证时间推进稳定，连续性误差保证质量账本平衡。只满足其中两项时，结论都是不可信的。这也是为什么日志诊断要以"证据链"而非"单指标"的方式组织。

连续性误差衡量离散后质量守恒被破坏的程度。全局项可写成带符号通量的归一化形式：

$$
\varepsilon_m = \frac{\sum_P \sum_f \phi_f}{\sum_P \sum_f \left| \phi_f \right|}
$$

分子是带符号的净通量，正负相消，因而适合发现系统性质量泄漏；分母提供量级参照，使它无量纲。局部和先把每个单元的绝对误差取模再求和，对坏单元最敏感；累计和把每一步的全局误差按时间累加，适合发现"每步只差一点点"的慢性漂移。

## 3 关键配置与公式

要让这些量稳定落盘，应在 `system/controlDict` 里显式配置函数对象，而不是依赖零散的屏幕输出。下面是一份可直接抄用的片段：

```cpp
functions
{
    residuals
    {
        type       residuals;
        libs       (utilityFunctionObjects);
        fields     (U p);
        writeControl writeTime;
    }

    CourantNo
    {
        type       CourantNo;
        libs       (fieldFunctionObjects);
    }

    continuity
    {
        type       continuityError;
        libs       (fieldFunctionObjects);
    }
}
```

`residuals` 输出到 `postProcessing/residuals/<time>/residuals.dat`，`CourantNo` 输出平均与最大 Courant 数，`continuityError` 输出各相的局部、全局与累计误差。三者落盘后即可用统一脚本做批量验收。

判读参考值建议固定成表：

- 缩放后的连续性、动量残差进入 $10^{-4}$ 量级，能量进入 $10^{-6}$ 量级，作为稳态起步参考；
- 瞬态最大 Courant 数对 PISO 常控制在 1 以下，对 PIMPLE 可放宽到 5～10，但必须做时间步敏感性；
- 全局连续性误差控制在 $10^{-3}$ 以内，累计误差不应单调增长；
- `ExecutionTime` 与 `ClockTime` 的差距可判断 I/O 与并行通信是否成为瓶颈。

## 4 工程做法与参数

**按时间步组织日志。** 不要用整段 `grep` 只抓最后一个残差，而应把日志解析成 `[time, eq, initRes, finalRes, nIter, CoMean, CoMax, contLocal, contGlobal]` 的表，再按时间画曲线。稳态外迭代用迭代序号当横轴，瞬态用物理时间当横轴。

**区分"看起来停滞"与"真的停滞"。** 若残差在低量级小幅震荡、质量守恒稳定、目标量平台化，这通常是收敛；若残差停滞而目标量仍单调漂移，则未收敛。判定要用监控量，不能只看残差。

**自动时间步的限度。** `adjustTimeStep` 与 `maxCo` 只能限制已配置的判据，不会替你检查物理时间分辨率。多相界面、化学反应、声学过程各有更严格的时间尺度，需人工核对。建议同时设置 `maxDeltaT` 上限，防止 Courant 数很小但步长被放到荒谬的大值。

**线性停止条件要匹配。** 若 `Final residual` 与 `Initial residual` 相差不到一个数量级，往往说明 `relTol` 太松或 `tolerance` 不合理。压力方程尤其应保证最终校正阶段更严格，避免把线性误差当成非线性收敛。

**保留原始日志。** 每次运行把屏幕输出重定向到独立文件并防覆盖，解析脚本与日志一起归档，才能让不同工况使用同一诊断口径。

**跨工况复用同一诊断口径。** 把解析脚本、阈值表与曲线模板固化下来，每个新工况只替换输入日志路径，就能保证结论稳定。建议同时记录求解器版本、并行核数与启动命令，因为并行分解和 I/O 设置会改变日志中单步耗时的分布，但不应该改变物理残差与连续性误差的收敛趋势；若两者混淆，很容易把并行配置差异误判成数值问题。

**阈值应有标定依据。** 与其背诵固定阈值，不如先跑一个已确认可用的算例，找出目标量进入小幅波动带时各类残差所处的量级，把它作为本项目的收敛线，再推广到同网格、同模型的其他工况。

## 5 可复现示例

运行并保留日志：

```bash
foamRun -case . > log.foamRun 2>&1
```

```bash
grep -E "Time = |Initial residual|continuity errors|Courant Number" log.foamRun | tail -n 40
```

把残差与连续性误差解析成表格的伪代码：

```text
输入: log 文本
对每一行:
  若匹配 "Time = x": 记录 t = x
  若匹配 "Solving for <eq>, Initial residual = a, Final residual = b, No Iterations c":
      追加记录 (t, eq, a, b, c)
  若匹配 "time step continuity errors : sum local = l, global = g, cumulative = m":
      追加记录 (t, l, g, m)
  若匹配 "Courant Number mean: cmu max: cmx": 追加记录 (t, cmx)
输出: 按 t 排序的记录表 -> 写 CSV -> 画曲线
```

判定与告警逻辑：

```text
窗口 = 最近 200 条记录
漂移 = (max(pressureDrop[窗口]) - min(pressureDrop[窗口])) / abs(mean(pressureDrop[窗口]))
若 连续性全局误差 < 1e-3 且 漂移 < 2e-3 且 所有残差在窗口内平直:
    标记 收敛
否则:
    输出未达标项，进入排查(见第 6 节)
```

一个具体数字例子：某稳态案例日志显示，最后 200 次迭代中 `Ux` 初始残差稳定在 $4 \times 10^{-5}$，压力残差在 $9 \times 10^{-5}$，`time step continuity errors` 的全局值为 $-3.4 \times 10^{-19}$、累计为 $5.6 \times 10^{-14}$，压降监控量窗口漂移 0.05%。四项达标，判定收敛。若同样的日志里压降仍以每百步约 1% 单调下降，则应判未收敛。

## 6 常见坑与排查

- 只看最后一行残差：忽略随时间的变化趋势，容易把震荡当收敛。
- 把 `Final residual` 当成外层收敛证据：它只是内层线性求解的停止水平。
- 跨软件比较残差量级：归一化分母不同，数值不可比。
- 忽略 `No Iterations` 顶满：压力方程打满迭代上限，通常是外层拖累或线性预条件不足。
- 只看平均 Courant 数：最大值才是稳定性决定因素，热点常在体积最小的单元。
- 把累计连续性误差的下降当好事：它本就应是平的，单调增长意味着系统性质量不平衡。
- 自动时间步一开就不管：`maxCo` 保稳定不保精度，物理时间分辨率要单独检查。
- 只保留最近一次日志：覆盖式重定向会让历史诊断证据丢失，务必按时间戳命名。
- 把 `ExecutionTime` 增长忽略掉：单步耗时突然翻倍往往预兆求解困难或负载不均。

排查顺序：① 定位首个异常时间步；② 判断是哪个方程、哪个场先异常；③ 查 Courant 数热点对应的单元与源项；④ 查边界回流与压力基准；⑤ 查物性与时间步；⑥ 最后才动容差与松弛。

## 7 检查清单与参考

检查清单：

1. 残差、Courant 数、连续性误差是否都已落盘到 `postProcessing/`？
2. 日志是否按时间步解析成表格，而非只取末值？
3. `Initial residual`、`Final residual`、`No Iterations` 是否三项一起看？
4. 最大 Courant 数是否满足所选格式与算法的要求？
5. 全局与累计连续性误差是否达标？
6. 目标量窗口漂移是否已平直？
7. 原始日志、解析脚本与版本信息是否一并归档？

参考资料：

1. 当前 OpenFOAM 发行版 User Guide 中 Solution and Algorithm Control、Function Objects 两章。
2. 本项目《OpenFOAM fvSolution、耦合算法与收敛控制》《OpenFOAM functionObjects、采样与守恒后处理》《OpenFOAM 发散、浮点异常与结果异常排查》。
