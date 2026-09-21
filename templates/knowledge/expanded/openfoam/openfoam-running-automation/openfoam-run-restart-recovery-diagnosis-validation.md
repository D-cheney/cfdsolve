---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-run-restart-recovery-diagnosis-validation
title: "续算、重启与故障恢复：结果诊断与可信度验证"
summary: "用重叠窗口对照、残差跨越量级与时间序列导数跳变三个指标判断续算是否连续，给出文件截断与静默损坏的识别方法、阈值表以及一次完整的重启一致性核算。"
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
  - "续算、重启与故障恢复"
  - "结果诊断与可信度验证"
  - "重叠窗口"
  - "残差连续性"
seo:
  title: "续算、重启与故障恢复：结果诊断与可信度验证"
  description: "用重叠窗口对照、残差跨越量级与时间序列导数跳变三个指标判断续算是否连续，给出文件截断与静默损坏的识别方法、阈值表以及一次完整的重启一致性核算。"
  keywords:
    - "续算、重启与故障恢复"
    - "结果诊断与可信度验证"
    - "重叠窗口"
    - "残差连续性"
    - "静默损坏"
---
# 续算、重启与故障恢复：结果诊断与可信度验证

续算最容易掩盖的错误是"看起来接上了"。求解器不会因为读入了稍早的时刻而报警，只会安静地重算一段。要证明一次重启是连续的，需要三个独立证据：一段与连续运行重叠的窗口、残差在接缝两侧的量级、以及目标量时间导数的跳变。

## 重叠窗口是唯一可信的对照

最直接的验证是让续算与连续运行有一段重叠。把连续运行跑到 $t = 5.0\ \mathrm{s}$，另从 $t = 2.5\ \mathrm{s}$ 的检查点重启并同样跑到 $t = 5.0\ \mathrm{s}$，比较两个解在重叠区间上的差异：

$$
\varepsilon_{\mathrm{ov}} = \sqrt{\frac{1}{M}\sum_{i=1}^{M}\left(\frac{\phi_i^{\mathrm{restart}} - \phi_i^{\mathrm{cont}}}{\phi^{\mathrm{ref}}}\right)^2}
$$

取升力系数序列，$M = 200$ 个采样点，$\phi^{\mathrm{ref}} = 0.3221$。若逐点差异的均方根为 $1.03\times10^{-4}$，则 $\varepsilon_{\mathrm{ov}} = 1.03\times10^{-4}/0.3221 = 3.2\times10^{-4}$，即 0.032%。这个量级与线性求解器容差同阶，说明重启没有引入额外误差。若 $\varepsilon_{\mathrm{ov}}$ 达到 $1\times10^{-2}$ 量级，问题出在检查点本身而不是求解器。

## 残差与时间步在重启点的连续性

续算后第一步的残差应当接续停止前最后一步的水平，而不是回到初值量级。用"跨越的量级数"作为判据：

$$
\Delta_{\mathrm{dec}} = \log_{10}\varepsilon_{\mathrm{first\ after}} - \log_{10}\varepsilon_{\mathrm{last\ before}}
$$

压力方程停止前末次残差 $3.2\times10^{-5}$，对应 $\log_{10} = -4.49$；重启后第一步末次残差 $1.1\times10^{-4}$，对应 $\log_{10} = -3.96$。于是 $\Delta_{\mathrm{dec}} = 0.53$ 个量级。判据是 $\Delta_{\mathrm{dec}} < 1$，因为残差从停止点恢复需要若干步；若超过 2 个量级，说明读入的场与停止时不是同一状态。

时间步的连续性同样可以查。停止前的 `deltaT` 由 Courant 判据决定，重启后应从相近值开始；若重启后第一步的 `deltaT` 回到初值 $5.0\times10^{-4}\ \mathrm{s}$ 而停止前已是 $2.4\times10^{-3}\ \mathrm{s}$，说明 `adjustTimeStep` 的初值没有随场更新，这本身无害，但会让重启后前几十步偏慢：

```bash
grep "deltaT = " log.cont | tail -3
grep "deltaT = " log.restart | head -3
```

## 时间序列台阶的成因分离

时间序列在接缝处出现台阶有四种互不相同的成因，用下面的判据逐个排除。

导数跳变指标用来区分"场不连续"与"采样点错位"：

$$
J = \frac{\left|\dfrac{\phi_{n+1}-\phi_n}{\Delta t}\right|_{\mathrm{after}} - \left|\dfrac{\phi_{n+1}-\phi_n}{\Delta t}\right|_{\mathrm{before}}}{\left|\dfrac{\phi_{n+1}-\phi_n}{\Delta t}\right|_{\mathrm{before}}}
$$

取阻力系数时间序列，接缝前两点差 $1.2\times10^{-3}$、间隔 $5.0\times10^{-4}\ \mathrm{s}$，导数 $2.4\ \mathrm{s^{-1}}$；接缝后两点差 $4.1\times10^{-3}$、间隔 $5.0\times10^{-4}\ \mathrm{s}$，导数 $8.2\ \mathrm{s^{-1}}$。则 $J = (8.2-2.4)/2.4 = 2.42$。$J$ 超过 1 说明接缝处目标量确实跳变，需要继续查；若 $J$ 在 0.2 以内而曲线仍看似有台阶，那只是采样密度不足造成的视觉效应。

## 静默损坏的识别

写出过程被中断会在磁盘上留下截断的文件，求解器读取时可能不报错。两种低成本检查：一是比较同一时刻各场文件的大小，矢量场应是标量场的三倍左右；二是用 `foamDictionary` 尝试解析该时刻的场头。

```bash
ls -l 100/U 100/p 100/k
foamDictionary -entry internalField 100/U | head -c 200
grep -c "^(" 100/U
```

截断的文件在解析时通常报 `unexpected end of file` 或读出条目数不足。对 $4.0\times10^6$ 单元的算例，双精度下 `U` 的二进制文件应约 96 MB、`p` 约 32 MB；若 `U` 只有 12 MB，就是被截断了。

并行运行还会多一层风险：`processor*/100/U` 齐全但 `reconstructPar` 后缺一个子域的数据。用重构前后总单元数核对，$4.0\times10^6$ 单元重构后应精确等于该值。

## 诊断表与阈值

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 重叠窗口 $\varepsilon_{\mathrm{ov}} > 1\times10^{-2}$ | 检查点场不完整或不是同一物理时刻 | 用两套检查点各做一次重叠对照 |
| 残差跨越超过 2 个量级 | 读入的是初始场而非最新场 | `grep "Starting time" log.restart` |
| 时间序列在接缝处出现台阶且 $J > 1$ | 场确实不连续，边界或物性被改动 | `diff -r` 比较 constant/ 与 system/ 目录 |
| 曲线台阶但 $J < 0.2$ | 采样密度不足造成的视觉效应 | 把 writeInterval 减到 1/5 重跑同一段 |
| 场文件大小只有预期的一半 | 写出被中断，文件截断 | `ls -l` 比较同组场，或用 foamDictionary 解析 |
| 重构后单元数少于 processor 目录之和 | 某个子域未被重构 | 累加 `processor*/constant/polyMesh/owner` 记录数 |
| 重启后前 50 步明显偏慢 | deltaT 从初值重新起步 | 对比停止前后 deltaT 序列 |
| 湍流统计量在接缝处断裂 | fieldAverage 的累加起点被重置 | 看 postProcessing 时间列是否跳回起点 |

## 一次可核对的重启核算

算例在 $t = 2.5\ \mathrm{s}$ 被打断，检查点间隔 500 s 物理时间折合 0.42 s 物理时间（墙钟与物理时间比 12:1）。连续运行到 $t = 5.0\ \mathrm{s}$ 得 $C_d = 1.3795$，从 $t = 2.5\ \mathrm{s}$ 重启跑到 $t = 5.0\ \mathrm{s}$ 得 $C_d = 1.3798$，相对偏差 $2.2\times10^{-4}$，即 0.022%。该算例的时间离散不确定度 $GCI_t = 0.21\%$，偏差只有它的 10%，因此重启结果可用。

同时核对残差：停止前末次残差 $3.2\times10^{-5}$，重启后首步 $1.1\times10^{-4}$，跨越 0.53 个量级，在 1 个量级的容许范围内。三项证据一致，说明这次重启没有引入可检出的误差。反过来，若偏差超过 $GCI_t$ 的一半（0.1%），就应把检查点间隔减半，重新做一次重叠对照。

## 参考文献

1. Elnozahy E. N., Alvisi L., Wang Y.-M., Johnson D. B. A survey of rollback-recovery protocols in message-passing systems. ACM Computing Surveys, 34(3):375–408, 2002.
2. Daly J. T. A higher order estimate of the optimum checkpoint interval for restart dumps. Future Generation Computer Systems, 22(3):303–312, 2006.
3. Roache P. J. Verification and Validation in Computational Science and Engineering. Hermosa, 1998, ch. 5.
4. Ferziger J. H., Perić M., Street R. L. Computational Methods for Fluid Dynamics. 4th ed., Springer, 2020.
5. Oberkampf W. L., Roy C. J. Verification and Validation in Scientific Computing. Cambridge University Press, 2010.
6. OpenCFD Ltd. OpenFOAM User Guide, v11. 2024. Section: Restart and recovery.
