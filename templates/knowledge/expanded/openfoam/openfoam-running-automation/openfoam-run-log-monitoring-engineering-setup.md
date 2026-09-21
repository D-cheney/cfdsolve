---
template_version: flowlab-knowledge/1.0
slug: openfoam-run-log-monitoring-engineering-setup
title: 日志监控与自动停止：工程设置与诊断验证
summary: >-
  给出从 log 中提取残差、Courant 数与时间步的可靠命令，设计残差加目标量漂移的两级停止判据，并用 stopAt writeNow
  实现优雅停止的监控脚本与判据阈值表。 全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: openfoam-running-automation
  name: OpenFOAM 运行与自动化
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 运行与自动化
  - 日志监控与自动停止
  - 工程设置与参数选择
  - foamJob
  - 自动停止判据
  - 结果诊断与可信度验证
  - 残差平台
  - 收敛外推
seo:
  title: 日志监控与自动停止：工程设置与诊断验证
  description: >-
    给出从 log 中提取残差、Courant 数与时间步的可靠命令，设计残差加目标量漂移的两级停止判据，并用 stopAt writeNow
    实现优雅停止的监控脚本与判据阈值表。 全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 日志监控与自动停止
    - 工程设置与参数选择
    - foamJob
    - stopAt writeNow
    - 收敛判据
    - 结果诊断与可信度验证
    - 残差平台
    - 收敛外推
    - ExecutionTime
---
# 日志监控与自动停止：工程设置与诊断验证

## 工程设置与参数选择

一个算例通常被配置成"跑到 endTime 为止"，但真正想知道的是"什么时候已经算够了"。多跑的部分白烧机时，早停的部分缺证据。把日志变成可判定的信号，需要先能稳定地抽出三个量，再给它们配上明确的阈值和对应的停止动作。

### 日志里真正需要盯的三个量

`foamRun` 的日志每步打印三类信息：`deltaT = ...`、`Courant Number mean: ... max: ...`、以及每个方程的 `Solving for p, Initial residual = ..., Final residual = ..., No Iterations ...`。此外每步末尾的 `ExecutionTime = ... s  ClockTime = ... s` 给出耗时。

判据只有三条：Courant 数最大值是否长期超过设定上限、残差是否到达平台、以及目标量在最近两个窗口之间是否还在漂移。前两条来自日志，第三条来自 functionObject 输出。

### 提取残差与 Courant 数

日志行的字段用空格分隔但宽度不定，直接数第几列容易错。用正则截取更稳：

```bash
# 压力方程末次残差（最近 20 步）
grep "Solving for p," log.foamRun \
  | sed 's/.*Final residual = \([^,]*\),.*/\1/' | tail -20

# Courant 数最大值序列，并统计超过 1.0 的步数
grep "Courant Number mean" log.foamRun | awk '{print $6}' > co_max.dat
awk '{if($1>1.0) n++; if($1>m) m=$1} END{printf "Co>1: %d steps, max=%.3f\n", n+0, m}' co_max.dat

# 时间步序列
grep "deltaT = " log.foamRun | awk '{print $3}' | tail -5
```

`Courant Number mean: 0.0412 max: 0.4736` 按空格切分后第 6 个字段是最大值，第 4 个是平均值。写脚本时先用 `head -1` 打印一行人工核对字段位置，能避免把平均值当最大值用这类错误。

### 自动停止的两级判据

单看残差会在两种情况下误判：残差停在 $1\times10^{-4}$ 的平台（线性求解器容差已到底）而目标量仍在演化，或者残差还在缓慢下降但目标量早已稳定。两级判据把两者都覆盖。

第一级是残差阈值。要求最近 $N$ 步内各方程末次残差都低于 $\varepsilon_r$：

$$
\varepsilon_r^{(k)} < \varepsilon_{\mathrm{target}}, \quad k = 1,\dots,N
$$

取 $\varepsilon_{\mathrm{target}} = 1\times10^{-6}$、$N = 200$。压力方程在 1200 步内从 $1\times10^{-3}$ 降到 $8.4\times10^{-7}$，第 1000 步之后全部满足。

第二级是目标量的窗口漂移：

$$
D = \frac{\left|\bar\phi_{[n-2W,\,n-W]} - \bar\phi_{[n-W,\,n]}\right|}{\left|\bar\phi_{[n-W,\,n]}\right|}
$$

$W = 200$ 步。阻力系数在最近 200 步的均值 1.3794，前一个 200 步均值 1.3821，则 $D = 0.0027/1.3794 = 0.196\%$。取阈值 $D_{\max} = 0.5\%$，$D$ 满足。两条同时成立才请求停止。

### 优雅停止与调度器硬杀的区别

调度器在墙钟到期时往往直接发 `SIGKILL`，进程无法捕获，最后一段计算全部丢失。主动停止应该走 OpenFOAM 自己的机制：把 `stopAt` 改成 `writeNow`，求解器会在下一个写出点正常落盘后退出。

```bash
sed -i 's/^stopAt .*/stopAt          writeNow;/' system/controlDict
```

这条改动依赖 `runTimeModifiable true`，生效后日志里会出现 `Reading controlDict`，随后是 `Stop at writeNow` 与一次完整写出。比起 `kill` 掉 mpirun，这条路径保证最新时刻的场是完整的一套。

`foamJob` 适合无人值守的短算例：它在后台运行求解器并把输出写到 `log.<application>`，`-s` 表示不写日志，`-p` 表示并行，`-screen` 表示输出到终端。长时间算例仍建议显式重定向，便于后续 `grep`。

### 监控脚本

```bash
#!/usr/bin/env bash
set -u
LOG=${1:-log.foamRun}
CO_MAX=1.0; DRIFT_MAX=0.005; W=200
while pgrep -f "foamRun" >/dev/null 2>&1; do
    sleep 60
    co=$(grep "Courant Number mean" "$LOG" | tail -1 | awk '{print $6}')
    res=$(grep "Solving for p," "$LOG" | tail -1 \
          | sed 's/.*Final residual = \([^,]*\),.*/\1/')
    printf "%s  Co_max=%s  p_final=%s\n" "$(date +%H:%M)" "$co" "$res"
    if awk -v c="$co" -v t="$CO_MAX" 'BEGIN{exit !(c>t)}'; then
        echo "Courant $co 超过 $CO_MAX，请求停止" | tee -a monitor.log
        sed -i 's/^stopAt .*/stopAt          writeNow;/' system/controlDict
        break
    fi
done
```

`pgrep -f "foamRun"` 的模式要足够具体。写成 `pgrep -f foam` 会匹配到监控脚本自身或编辑器进程，导致循环永不退出；用 `pgrep -af` 打印匹配到的完整命令行可以在上线前确认。

### 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 脚本读到的 Co 恒为 0 | awk 字段位置错，取到了平均值或空串 | 手工 `grep` 一行并数空格分隔的字段 |
| 自动停止后没有最新写出 | stopAt 改了但 runTimeModifiable 为 false | 日志中是否出现 Reading controlDict |
| 脚本永不退出 | pgrep 模式过宽，匹配到脚本自身 | `pgrep -af "foamRun"` 检查匹配清单 |
| 日志行数远少于步数 | 重定向用了 `>` 覆盖，或磁盘写满 | 比较 `grep -c "^Time = " log` 与预期步数 |
| 停止时残差仍在 1e-3 | 判据只看单步残差，未看目标量漂移 | 计算最近两个 200 步窗口的均值漂移 |
| 作业被墙钟硬杀且无输出 | 检查点间隔大于墙钟余量 | 对比 writeInterval 与剩余墙钟时间 |
| 日志体积增长过快 | 每步都写 functionObject 输出 | `du -sh log.* postProcessing` 观察增长率 |

### 参考文献

1. Greenshields C. J. OpenFOAM User Guide, version 11. OpenCFD Ltd., 2024.
2. Patankar S. V. Numerical Heat Transfer and Fluid Flow. Hemisphere Publishing, 1980.
3. Ferziger J. H., Perić M., Street R. L. Computational Methods for Fluid Dynamics, 4th ed. Springer, 2020.
4. Barrett R., Berry M., Chan T. F., Demmel J., Donato J., Dongarra J., Eijkhout V., Pozo R., Romine C., van der Vorst H. Templates for the Solution of Linear Systems: Building Blocks for Iterative Methods. SIAM, 1994.
5. Saad Y. Iterative Methods for Sparse Linear Systems, 2nd ed. SIAM, 2003.
6. Daly J. T. A higher order estimate of the optimum checkpoint interval for restart dumps. Future Generation Computer Systems, 22(3):303–312, 2006.

## 诊断与可信度验证

日志监控的难点不在读取，而在判断。同一段日志，残差曲线平了既可能是收敛，也可能是线性求解器容差到顶，还可能是解正在发散前的短暂停留。把残差历史、时间步序列和耗时统计放在一起看，才能把这三者分开。

### 残差平台与真正收敛的区别

残差到达平台有四种成因，日志本身能给出区分依据。

第一种是收敛：残差以稳定速率下降后趋缓，`No Iterations` 逐步减少到 1 到 2，`Final residual` 稳定在 $1\times10^{-9}$ 以下。第二种是线性求解器容差到底：`Initial residual` 与 `Final residual` 之比恒定在 $1\times10^{-2}$ 附近，`No Iterations` 停在 `maxIter` 上限，此时继续迭代只是浪费。第三种是欠松弛或耦合不足：残差在 $1\times10^{-4}$ 上下小幅振荡，`No Iterations` 忽高忽低。第四种是发散前兆：残差下降变慢，同时 `Courant Number max` 逐步抬升。

区分第二种与第三种看 `No Iterations` 是否触顶；区分第三种与第四种看 Courant 数是否同步上升。

### 从残差历史外推剩余步数

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

### 日志时间戳的三个用途

每步末尾的 `ExecutionTime = 3600 s  ClockTime = 3720 s` 给出两个计时。`ExecutionTime` 是求解器自身的 CPU 累计，`ClockTime` 是墙钟累计，两者之差是 I/O、MPI 等待与操作系统调度占用的时间：

$$
f_{\mathrm{io}} = \frac{T_{\mathrm{clock}} - T_{\mathrm{exec}}}{T_{\mathrm{clock}}}
$$

$T_{\mathrm{exec}} = 3600\ \mathrm{s}$、$T_{\mathrm{clock}} = 3720\ \mathrm{s}$ 时 $f_{\mathrm{io}} = 120/3720 = 3.2\%$，正常。若这个比值超过 15%，说明写出或 MPI 归约已成瓶颈，应降低 `writeInterval` 的频率或改用 `collated` 文件处理器。

第三个用途是校验时间步序列。把 `ClockTime` 对步号作图，斜率突然翻倍的位置对应某一步的迭代数激增：

```bash
grep "ExecutionTime" log.foamRun | awk '{print NR, $6, $3}' > time_trace.dat
```

### 自动停止的误触发与漏触发

误触发指判据满足但解还没稳，最常见的成因是只看单步残差。压力残差在耦合较强时会在 $1\times10^{-6}$ 上下振荡，某一步偶然低于阈值就触发停止。防法是要求连续 $N$ 步全部满足，$N$ 至少取 100。

漏触发指解早已稳定但判据永不满足，成因通常是阈值设得比线性求解器容差还紧。双精度下 `Final residual` 的实际下限在 $1\times10^{-12}$ 量级，若把阈值设成 $1\times10^{-13}$，判据永远不成立。先跑 200 步看残差的实际下限，再把阈值定在它的 100 倍以上。

第三种情况是判据成立但目标量仍在缓慢漂移，这属于物理上的未稳态而非数值未收敛。区分方法是看目标量的窗口漂移 $D$ 与残差是否同步平台化：残差平台而 $D$ 仍在 1% 以上，说明该加的是物理时间而不是迭代次数。

### 诊断表

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

### 一次收敛性核算

算例在第 800 步残差 $4.2\times10^{-5}$，第 1000 步 $1.8\times10^{-5}$，衰减率 $q = 0.99577$。目标阈值 $1\times10^{-6}$，外推还需 682 步，合计约 1682 步。按单步 $0.30\ \mathrm{s}$ 计，总墙钟约 505 s，而 `ClockTime` 已累计 3720 s——说明前面大部分时间花在更早的收敛段，外推只覆盖尾部。

同时算窗口漂移：最近 200 步阻力系数均值 1.3794，前一个 200 步 1.3821，$D = 0.196\%$，低于 0.5% 的阈值。两条判据都满足，停止是合理的。若 $D$ 算出来是 1.4%，即使残差已到 $1\times10^{-7}$ 也不应停止，因为此时限制因素是物理时间不足，继续迭代不会改变结论，需要的是延长 `endTime` 而非收紧残差阈值。

### 参考文献

1. Patankar S. V. Numerical Heat Transfer and Fluid Flow. Hemisphere Publishing, 1980.
2. Saad Y. Iterative Methods for Sparse Linear Systems, 2nd ed. SIAM, 2003.
3. Barrett R., Berry M., Chan T. F., Demmel J., Donato J., Dongarra J., Eijkhout V., Pozo R., Romine C., van der Vorst H. Templates for the Solution of Linear Systems: Building Blocks for Iterative Methods. SIAM, 1994.
4. Ferziger J. H., Perić M., Street R. L. Computational Methods for Fluid Dynamics. Springer, 2020 (4th edition).
5. Jasak H. Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows. PhD thesis, Imperial College London, 1996.
6. OpenCFD Ltd. OpenFOAM v11 User Guide. 2024. Section: Solution monitoring.
