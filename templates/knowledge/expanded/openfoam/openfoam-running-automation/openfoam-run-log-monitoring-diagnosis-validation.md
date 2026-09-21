---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-run-log-monitoring-diagnosis-validation
title: "日志监控与自动停止：结果诊断与可信度验证"
summary: "从残差历史外推剩余步数、区分残差平台与真正收敛、用 ExecutionTime 与 ClockTime 之差定位 I/O 瓶颈，并分析自动停止的误触发与漏触发，附阈值表与一次收敛核算。"
category:
  slug: openfoam-running-automation
  name: "OpenFOAM 运行与自动化"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 运行与自动化"
  - "日志监控与自动停止"
  - "结果诊断与可信度验证"
  - "残差平台"
  - "收敛外推"
seo:
  title: "日志监控与自动停止：结果诊断与可信度验证"
  description: "从残差历史外推剩余步数、区分残差平台与真正收敛、用 ExecutionTime 与 ClockTime 之差定位 I/O 瓶颈，并分析自动停止的误触发与漏触发，附阈值表与一次收敛核算。"
  keywords:
    - "日志监控与自动停止"
    - "结果诊断与可信度验证"
    - "残差平台"
    - "收敛外推"
    - "ExecutionTime"
---

日志监控的难点不在读取，而在判断。同一段日志，残差曲线平了既可能是收敛，也可能是线性求解器容差到顶，还可能是解正在发散前的短暂停留。把残差历史、时间步序列和耗时统计放在一起看，才能把这三者分开。

## 残差平台与真正收敛的区别

残差到达平台有四种成因，日志本身能给出区分依据。

第一种是收敛：残差以稳定速率下降后趋缓，`No Iterations` 逐步减少到 1 到 2，`Final residual` 稳定在 $1\times10^{-9}$ 以下。第二种是线性求解器容差到底：`Initial residual` 与 `Final residual` 之比恒定在 $1\times10^{-2}$ 附近，`No Iterations` 停在 `maxIter` 上限，此时继续迭代只是浪费。第三种是欠松弛或耦合不足：残差在 $1\times10^{-4}$ 上下小幅振荡，`No Iterations` 忽高忽低。第四种是发散前兆：残差下降变慢，同时 `Courant Number max` 逐步抬升。

区分第二种与第三种看 `No Iterations` 是否触顶；区分第三种与第四种看 Courant 数是否同步上升。

## 从残差历史外推剩余步数

残差在对数坐标下接近直线时，可以用两步之间的几何衰减率外推：

$$
q = \left(\frac{\varepsilon_{n+\Delta n}}{\varepsilon_{n}}\right)^{1/\Delta n}, \qquad
N_{\mathrm{remain}} = \frac{\ln\left(\varepsilon_{\mathrm{target}}/\varepsilon_n\right)}{\ln q}
$$

压力方程在第 800 步末次残差 $4.2\times10^{-5}$，第 1000 步 $1.8\times10^{-5}$，$\Delta n = 200$。于是 $q = (0.4286)^{1/200} = 0.99577$，即每步下降 0.42%。要从 $1.8\times10^{-5}$ 降到 $1\times10^{-6}$，需要 $N_{\mathrm{remain}} = \ln(0.0556)/\ln(0.99577) = (-2.889)/(-0.004236) = 682$ 步。以单步墙钟 $0.30\ \mathrm{s}$ 计，还需约 205 s。

这个外推只在 $q$ 稳定的前提下有效。判断 $q$ 是否稳定，取三段相邻窗口各算一次 $q$，若三者相对偏差在 20% 以内就可以用。若 $q$ 逐段变慢，说明收敛已进入渐近尾部，外推会低估剩余步数。

```bash
# 每 100 步取一次压力末次残差，输出步号与残差
grep -n "Solving for p," log.foamRun \
  | sed 's/.*Final residual = \([^,]*\),.*/\1/' \
  | awk 'NR%100==0{print NR, $1}'
```

## 日志时间戳的三个用途

每步末尾的 `ExecutionTime = 3600 s  ClockTime = 3720 s` 给出两个计时。`ExecutionTime` 是求解器自身的 CPU 累计，`ClockTime` 是墙钟累计，两者之差是 I/O、MPI 等待与操作系统调度占用的时间：

$$
f_{\mathrm{io}} = \frac{T_{\mathrm{clock}} - T_{\mathrm{exec}}}{T_{\mathrm{clock}}}
$$

$T_{\mathrm{exec}} = 3600\ \mathrm{s}$、$T_{\mathrm{clock}} = 3720\ \mathrm{s}$ 时 $f_{\mathrm{io}} = 120/3720 = 3.2\%$，正常。若这个比值超过 15%，说明写出或 MPI 归约已成瓶颈，应降低 `writeInterval` 的频率或改用 `collated` 文件处理器。

第三个用途是校验时间步序列。把 `ClockTime` 对步号作图，斜率突然翻倍的位置对应某一步的迭代数激增：

```bash
grep "ExecutionTime" log.foamRun | awk '{print NR, $6, $3}' > time_trace.dat
```

## 自动停止的误触发与漏触发

误触发指判据满足但解还没稳，最常见的成因是只看单步残差。压力残差在耦合较强时会在 $1\times10^{-6}$ 上下振荡，某一步偶然低于阈值就触发停止。防法是要求连续 $N$ 步全部满足，$N$ 至少取 100。

漏触发指解早已稳定但判据永不满足，成因通常是阈值设得比线性求解器容差还紧。双精度下 `Final residual` 的实际下限在 $1\times10^{-12}$ 量级，若把阈值设成 $1\times10^{-13}$，判据永远不成立。先跑 200 步看残差的实际下限，再把阈值定在它的 100 倍以上。

第三种情况是判据成立但目标量仍在缓慢漂移，这属于物理上的未稳态而非数值未收敛。区分方法是看目标量的窗口漂移 $D$ 与残差是否同步平台化：残差平台而 $D$ 仍在 1% 以上，说明该加的是物理时间而不是迭代次数。

## 诊断表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差停在 1e-4 不动 | 线性求解器容差到顶，No Iterations 触 maxIter | 看 Initial 与 Final residual 之比是否恒定 |
| 残差小幅振荡 | 欠松弛不足或压力速度耦合偏弱 | 把 nOuterCorrectors 从 2 提到 4 重跑 200 步 |
| 残差下降变慢且 Co 上升 | 时间步过大，进入发散前兆 | 把 maxCo 减半重跑同一段 |
| 残差瞬间变 NaN | 边界或物性设置导致除零 | 定位首个出现 NaN 的场与时间步 |
| 自动停止后目标量仍漂移 | 判据只看残差，未看窗口漂移 | 计算最近两个窗口的均值差 |
| 判据永不满足 | 阈值低于双精度可达下限 | 观察 200 步内 Final residual 的最小值 |
| ClockTime 与 ExecutionTime 差超过 15% | 写出或 MPI 归约成为瓶颈 | 对比开关 collated 后的 f_io |
| 单步墙钟突然翻倍 | 线性求解器迭代数激增 | 统计 No Iterations 列的分布 |

## 一次收敛性核算

算例在第 800 步残差 $4.2\times10^{-5}$，第 1000 步 $1.8\times10^{-5}$，衰减率 $q = 0.99577$。目标阈值 $1\times10^{-6}$，外推还需 682 步，合计约 1682 步。按单步 $0.30\ \mathrm{s}$ 计，总墙钟约 505 s，而 `ClockTime` 已累计 3720 s——说明前面大部分时间花在更早的收敛段，外推只覆盖尾部。

同时算窗口漂移：最近 200 步阻力系数均值 1.3794，前一个 200 步 1.3821，$D = 0.196\%$，低于 0.5% 的阈值。两条判据都满足，停止是合理的。若 $D$ 算出来是 1.4%，即使残差已到 $1\times10^{-7}$ 也不应停止，因为此时限制因素是物理时间不足，继续迭代不会改变结论，需要的是延长 `endTime` 而非收紧残差阈值。

## 参考文献

1. Patankar S. V. Numerical Heat Transfer and Fluid Flow. Hemisphere Publishing, 1980.
2. Saad Y. Iterative Methods for Sparse Linear Systems, 2nd ed. SIAM, 2003.
3. Barrett R., Berry M., Chan T. F., Demmel J., Donato J., Dongarra J., Eijkhout V., Pozo R., Romine C., van der Vorst H. Templates for the Solution of Linear Systems: Building Blocks for Iterative Methods. SIAM, 1994.
4. Ferziger J. H., Perić M., Street R. L. Computational Methods for Fluid Dynamics. Springer, 2020 (4th edition).
5. Jasak H. Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows. PhD thesis, Imperial College London, 1996.
6. OpenCFD Ltd. OpenFOAM v11 User Guide. 2024. Section: Solution monitoring.
