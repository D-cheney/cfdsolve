---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-run-controldict-diagnosis-validation
title: "controlDict 时间与输出控制：结果诊断与可信度验证"
summary: "用时间步细化算观测阶与 GCI、用 Strouhal 数核算写出频率是否混叠，并给出从 log 提取 Courant 数与时间步序列、判断续算点完整性的具体阈值和诊断表。"
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
  - "controlDict 时间与输出控制"
  - "结果诊断与可信度验证"
  - "GCI"
  - "采样混叠"
seo:
  title: "controlDict 时间与输出控制：结果诊断与可信度验证"
  description: "用时间步细化算观测阶与 GCI、用 Strouhal 数核算写出频率是否混叠，并给出从 log 提取 Courant 数与时间步序列、判断续算点完整性的具体阈值和诊断表。"
  keywords:
    - "controlDict 时间与输出控制"
    - "结果诊断与可信度验证"
    - "GCI"
    - "Richardson 外推"
    - "采样混叠"
---

写出频率设错不会让算例报错，只会让结果看起来平滑而实际失真。判断 controlDict 是否设置得当，需要三类证据：时间步细化后的离散误差、写出频率相对物理特征频率的位置、以及续算点在磁盘上是否完整。以下给出可以当场算出来的判据。

## 用时间步细化而不是残差判断时间精度

残差下降到平台只说明线性方程解开了，不说明时间离散误差足够小。把 $\Delta t$ 依次减半跑三档，取同一物理时刻的目标量 $f_1, f_2, f_3$，用两点差商估观测阶：

$$
p = \frac{\ln\left|\dfrac{f_3 - f_2}{f_2 - f_1}\right|}{\ln r}, \qquad r = \frac{\Delta t_1}{\Delta t_2}
$$

以圆柱绕流 $Re = 100$ 的升力系数为例，$\Delta t$ 取 $1.0\times10^{-3}$、$5.0\times10^{-4}$、$2.5\times10^{-4}\ \mathrm{s}$ 时得到 $C_l = 0.3312,\ 0.3246,\ 0.3221$。代入 $r = 2$：$|(0.3221-0.3246)/(0.3246-0.3312)| = 0.0025/0.0066 = 0.3788$，$\ln 0.3788 = -0.9707$，除以 $\ln 2 = 0.6931$ 得 $p = -1.40$，取绝对值 1.40。这个值低于格式名义阶 2，说明误差里混有内迭代未收敛的贡献。

用 Richardson 外推估计最细网格的极限值：

$$
f_{\mathrm{ex}} \approx f_3 + \frac{f_3 - f_2}{r^{p} - 1}
$$

取名义阶 $p = 2$：$f_{\mathrm{ex}} = 0.3221 + (0.3221-0.3246)/3 = 0.3221 - 0.00083 = 0.3213$。网格收敛指数 $GCI = 1.25\,|f_3-f_2|/(r^p-1)/|f_3| = 1.25 \times 0.00083/0.3221 = 0.32\%$。任何小于 0.32% 的差异都不能当作物理效应。

## 写出频率与涡脱频率的混叠

采样定理对后处理同样成立。涡脱频率由 Strouhal 数给出：

$$
St = \frac{f_s D}{U}, \qquad T_s = \frac{1}{f_s}
$$

圆柱 $D = 0.1\ \mathrm{m}$、$U = 1.0\ \mathrm{m/s}$、$Re = 100$ 时 $St \approx 0.165$，于是 $f_s = 0.165 \times 1.0/0.1 = 1.65\ \mathrm{Hz}$，周期 $T_s = 0.606\ \mathrm{s}$。若 `writeInterval` 取 0.5 s，采样率 2 Hz 与涡脱频率同量级，幅值会被严重低估甚至冻结成常数。经验要求是每个周期至少 20 个采样点，即 `writeInterval` 不超过 $T_s/20 = 0.03\ \mathrm{s}$。

自适应步长下还须把 `writeControl` 从 `timeStep` 换成 `adjustableRunTime`，否则写出间隔在物理时间上不固定，FFT 的频率轴本身就是错的。

## 日志里能读到的三个诊断量

`log.foamRun` 每步会打印 `deltaT = `、`Courant Number mean: ... max: ...`、以及各方程的 `Final residual = `。用它们可以在一分钟内判断设置是否合理：

```bash
# 时间步序列：看是否长期贴着 maxDeltaT 上限
grep "deltaT = " log.foamRun | awk '{print $3}' | sort -n | uniq -c | tail -5

# Courant 数的最大值分布：超过 1.0 的步数占比
grep "Courant Number mean" log.foamRun | awk '{print $6}' \
  | awk '{if($1>1.0) n++} END{print n+0, "steps with Co>1"}'

# 压力方程末次残差，用于判断内迭代是否收敛
grep "Solving for p," log.foamRun | sed 's/.*Final residual = \([^,]*\),.*/\1/' | tail -20
```

判据：`deltaT` 长期等于 `maxDeltaT` 说明 Courant 判据没有起作用，此时步长由上限决定而非物理；$Co>1$ 的步数占比超过 5% 时非正交修正误差开始可观；压力方程末次残差停在 $1.0\times10^{-7}$ 以上而迭代次数为 1，说明线性求解器容差比离散误差还松。

## 重启点的完整性与可追溯性

`purgeWrite` 会删掉旧时间目录。如果调度器的墙钟时间恰好把作业打断在两个写出点之间，最近的可用重启点可能已经被清掉。检查方式是把时间目录与作业日志对齐：

```bash
ls -d postProcessing/../[0-9]* 2>/dev/null | sort -g | tail -3
grep "ExecutionTime" log.foamRun | tail -1
```

若最后写出时刻对应的 `ExecutionTime` 距离墙钟上限不足一个 `writeInterval` 的求解耗时，就应把 `purgeWrite` 设为 0，或者把 `writeInterval` 缩到原值的 1/3。续算要求写出点上的场是自洽的：只有 $p$ 和 $U$ 而没有湍流量时，重启后 $k$、$\varepsilon$ 会从初始场重新演化，时间序列在重启点出现台阶。

## 诊断表与阈值

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 目标量随 writeInterval 变化 | 采样率低于涡脱频率的 20 倍，幅值混叠 | 把 writeInterval 从 0.5 s 降到 0.03 s 重算，比较幅值 |
| 时间步减半后目标量不动 | 内迭代误差主导，时间离散误差被淹没 | 把 nOuterCorrectors 加倍，看目标量是否移动 |
| 观测阶只有 1.4 | 时间格式阶数被空间误差或迭代误差拉低 | 单独把空间格式升阶，看 p 是否回升到 2 |
| FFT 主峰频率漂移 | writeControl 用了 timeStep，采样间隔不等 | 检查时间目录间隔的极差 |
| 续算后压力场跳变 | 最近写出点被 purgeWrite 删除，读到更早的场 | 对比 log 首行 Starting time 与预期时刻 |
| 写出耗时超过求解耗时 | writeCompression on 且场数量多 | 对比 ClockTime 与 ExecutionTime 之差 |

## 一次完整的可信度核算

设圆柱算例在 $\Delta t = 2.5\times10^{-4}\ \mathrm{s}$ 下算到 $t = 30\ \mathrm{s}$，共 $1.2\times10^5$ 步。时间离散不确定度 $GCI_t = 0.32\%$；把 $U$ 提高 2% 后升力系数变化 0.9%。$0.9\% / 0.32\% = 2.8$，信噪比不足 3 倍，说明在 2% 速度扰动下无法从当前时间离散精度中分辨出升力系数的真实响应。要么把 $\Delta t$ 再减半把 $GCI_t$ 压到 0.1% 以下，要么把速度扰动提高到 5% 以上。这个判断不依赖任何主观描述，只用到三档时间步的目标量。

## 参考文献

1. Roache P. J. Verification and Validation in Computational Science and Engineering. Hermosa Publishers, 1998.
2. Celik I. B., Ghia U., Roache P. J., Freitas C. J., Coleman H., Raad P. E. Procedure for estimation and reporting of uncertainty due to discretization in CFD applications. ASME Journal of Fluids Engineering, 130(7):078001, 2008.
3. Richardson L. F. The approximate arithmetical solution by finite differences of physical problems. Philosophical Transactions of the Royal Society A, 210:307–357, 1911.
4. Perić M., Ferziger J. H., Street R. L. Computational Methods for Fluid Dynamics. 4th ed., Springer, 2020, ch. 6.
5. Norberg C. Fluctuating lift on a circular cylinder: review and new measurements. J. Fluids and Structures 17(1), 2003, 57–96.
6. OpenCFD Ltd. OpenFOAM v11 User Guide. 2024. Section: controlDict.
