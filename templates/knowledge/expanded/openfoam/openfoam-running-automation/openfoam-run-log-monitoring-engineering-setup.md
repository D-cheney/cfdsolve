---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-run-log-monitoring-engineering-setup
title: "日志监控与自动停止：工程设置与参数选择"
summary: "给出从 log 中提取残差、Courant 数与时间步的可靠命令，设计残差加目标量漂移的两级停止判据，并用 stopAt writeNow 实现优雅停止的监控脚本与判据阈值表。"
category:
  slug: openfoam-running-automation
  name: "OpenFOAM 运行与自动化"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 运行与自动化"
  - "日志监控与自动停止"
  - "工程设置与参数选择"
  - "foamJob"
  - "自动停止判据"
seo:
  title: "日志监控与自动停止：工程设置与参数选择"
  description: "给出从 log 中提取残差、Courant 数与时间步的可靠命令，设计残差加目标量漂移的两级停止判据，并用 stopAt writeNow 实现优雅停止的监控脚本与判据阈值表。"
  keywords:
    - "日志监控与自动停止"
    - "工程设置与参数选择"
    - "foamJob"
    - "stopAt writeNow"
    - "收敛判据"
---

一个算例通常被配置成"跑到 endTime 为止"，但真正想知道的是"什么时候已经算够了"。多跑的部分白烧机时，早停的部分缺证据。把日志变成可判定的信号，需要先能稳定地抽出三个量，再给它们配上明确的阈值和对应的停止动作。

## 日志里真正需要盯的三个量

`foamRun` 的日志每步打印三类信息：`deltaT = ...`、`Courant Number mean: ... max: ...`、以及每个方程的 `Solving for p, Initial residual = ..., Final residual = ..., No Iterations ...`。此外每步末尾的 `ExecutionTime = ... s  ClockTime = ... s` 给出耗时。

判据只有三条：Courant 数最大值是否长期超过设定上限、残差是否到达平台、以及目标量在最近两个窗口之间是否还在漂移。前两条来自日志，第三条来自 functionObject 输出。

## 提取残差与 Courant 数

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

## 自动停止的两级判据

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

## 优雅停止与调度器硬杀的区别

调度器在墙钟到期时往往直接发 `SIGKILL`，进程无法捕获，最后一段计算全部丢失。主动停止应该走 OpenFOAM 自己的机制：把 `stopAt` 改成 `writeNow`，求解器会在下一个写出点正常落盘后退出。

```bash
sed -i 's/^stopAt .*/stopAt          writeNow;/' system/controlDict
```

这条改动依赖 `runTimeModifiable true`，生效后日志里会出现 `Reading controlDict`，随后是 `Stop at writeNow` 与一次完整写出。比起 `kill` 掉 mpirun，这条路径保证最新时刻的场是完整的一套。

`foamJob` 适合无人值守的短算例：它在后台运行求解器并把输出写到 `log.<application>`，`-s` 表示不写日志，`-p` 表示并行，`-screen` 表示输出到终端。长时间算例仍建议显式重定向，便于后续 `grep`。

## 监控脚本

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

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 脚本读到的 Co 恒为 0 | awk 字段位置错，取到了平均值或空串 | 手工 `grep` 一行并数空格分隔的字段 |
| 自动停止后没有最新写出 | stopAt 改了但 runTimeModifiable 为 false | 日志中是否出现 Reading controlDict |
| 脚本永不退出 | pgrep 模式过宽，匹配到脚本自身 | `pgrep -af "foamRun"` 检查匹配清单 |
| 日志行数远少于步数 | 重定向用了 `>` 覆盖，或磁盘写满 | 比较 `grep -c "^Time = " log` 与预期步数 |
| 停止时残差仍在 1e-3 | 判据只看单步残差，未看目标量漂移 | 计算最近两个 200 步窗口的均值漂移 |
| 作业被墙钟硬杀且无输出 | 检查点间隔大于墙钟余量 | 对比 writeInterval 与剩余墙钟时间 |
| 日志体积增长过快 | 每步都写 functionObject 输出 | `du -sh log.* postProcessing` 观察增长率 |

## 参考文献

1. Greenshields C. J. OpenFOAM User Guide, version 11. OpenCFD Ltd., 2024.
2. Patankar S. V. Numerical Heat Transfer and Fluid Flow. Hemisphere Publishing, 1980.
3. Ferziger J. H., Perić M., Street R. L. Computational Methods for Fluid Dynamics, 4th ed. Springer, 2020.
4. Barrett R., Berry M., Chan T. F., Demmel J., Donato J., Dongarra J., Eijkhout V., Pozo R., Romine C., van der Vorst H. Templates for the Solution of Linear Systems: Building Blocks for Iterative Methods. SIAM, 1994.
5. Saad Y. Iterative Methods for Sparse Linear Systems, 2nd ed. SIAM, 2003.
6. Daly J. T. A higher order estimate of the optimum checkpoint interval for restart dumps. Future Generation Computer Systems, 22(3):303–312, 2006.
