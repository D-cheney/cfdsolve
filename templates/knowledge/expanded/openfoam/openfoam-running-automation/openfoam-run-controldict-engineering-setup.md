---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-run-controldict-engineering-setup
title: "controlDict 时间与输出控制：工程设置与参数选择"
summary: "从 Courant 数反算 deltaT、用磁盘预算反推 purgeWrite，并给出 controlDict 时间步与写出两组旋钮的取值表、运行中改参的安全做法和六类失败模式的判定试验。"
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
  - "controlDict 时间与输出控制"
  - "工程设置与参数选择"
  - "adjustTimeStep"
  - "purgeWrite"
seo:
  title: "controlDict 时间与输出控制：工程设置与参数选择"
  description: "从 Courant 数反算 deltaT、用磁盘预算反推 purgeWrite，并给出 controlDict 时间步与写出两组旋钮的取值表、运行中改参的安全做法和六类失败模式的判定试验。"
  keywords:
    - "controlDict 时间与输出控制"
    - "工程设置与参数选择"
    - "adjustTimeStep"
    - "purgeWrite"
    - "writeControl"
---

controlDict 里其实有两组互不相干的旋钮：一组管时间怎么走（`deltaT`、`adjustTimeStep`、`maxCo`），一组管什么时候落盘（`writeControl`、`writeInterval`、`purgeWrite`）。把这两组混在一起试，最常见的后果是磁盘被写爆，或者关心的物理时刻恰好落在两个写出点之间。下面给出从 Courant 数反算步长、从磁盘预算反推保留个数的完整取值过程。

## 时间步的两种驱动方式

固定步长时 `deltaT` 由使用者给定，求解器不做稳定性判断；自适应时 `adjustTimeStep true` 让求解器按 `maxCo`（自由面问题另有 `maxAlphaCo`）反算步长。做频谱分析、需要严格等间隔采样时用前者；有加速段、自由面或强瞬态的算例基本必须用后者。

对流项的库朗数定义为一步之内流体跨过的网格分数：

$$
Co = \frac{|U|\,\Delta t}{\Delta x}
$$

隐式格式理论上不受 $Co \le 1$ 约束，但 $Co$ 增大后非正交修正的迭代次数和算子分裂误差同步上升，所以工程上把 `maxCo` 放在 0.5 到 1.0，自由面另用 `maxAlphaCo 0.5` 单独约束界面。

## 从 Courant 数反算初始 deltaT

取顶盖驱动方腔，边长 $L = 0.1\ \mathrm{m}$，顶盖速度 $U = 1\ \mathrm{m/s}$，网格 $100 \times 100$，则 $\Delta x = 1.0\times10^{-3}\ \mathrm{m}$。取 $Co_{\max} = 0.5$：

$$
\Delta t = \frac{Co_{\max}\,\Delta x}{|U|} = \frac{0.5 \times 1.0\times10^{-3}}{1.0} = 5.0\times10^{-4}\ \mathrm{s}
$$

以 $Re = 1000$ 计，运动黏度 $\nu = UL/Re = 1.0\times10^{-4}\ \mathrm{m^2/s}$，主涡回转周期约 $L/U = 0.1\ \mathrm{s}$，即 200 个时间步覆盖一个周期。要拿到统计稳态需要约 $20\ \mathrm{s}$ 物理时间，折合 40000 步——这个步数才是决定机时的量，而不是 $\Delta t$ 本身。

`maxDeltaT` 必须设。启动段 $|U|$ 很小，Courant 判据会把 $\Delta t$ 推到 0.05 s 以上，一步跳过整个启动瞬态。把它限制在特征时间的 10%，即 `maxDeltaT 0.01;`。

## 写出策略与磁盘预算

`writeControl` 有 `timeStep`、`runTime`、`adjustableRunTime`、`clockTime` 四种。自适应步长下用 `timeStep` 会让写出时刻随步长漂移；`adjustableRunTime` 按物理时间对齐，是瞬态可调步长算例的默认选择。

单个写出时刻的二进制体积可按下式估算，$n_s$ 为标量场个数、$n_v$ 为矢量场个数：

$$
V \approx N_{\mathrm{cell}}\left(8\,n_s + 24\,n_v\right)\ \mathrm{bytes}
$$

对 $N_{\mathrm{cell}} = 10^6$、写出 $p$ 与 $U$，$V \approx 10^6 \times (8 + 24) = 32\ \mathrm{MB}$。20 个写出时刻约 640 MB，加上 `uniform/time` 与 `postProcessing` 按 700 MB 估。设 `purgeWrite 5` 只留最近 5 个时刻，占用回落到 160 MB 上下。

```text
writeControl    adjustableRunTime;
writeInterval   0.5;            // s，物理时间间隔
purgeWrite      5;
writeFormat     binary;
writePrecision  8;
writeCompression on;
timeFormat      general;
timePrecision   6;
```

`binary` 比 `ascii` 省约一半空间且读写更快，`writeCompression on` 通常再省 20% 到 40%，代价是占用 CPU。`timeFormat general` 配合 `timePrecision 6` 能避免目录名出现 `0.30000000000000004` 这类浮点尾数，否则后续按目录名匹配时刻的脚本会直接失效。

## 运行中改参：runTimeModifiable 的正确用法

`runTimeModifiable true` 时求解器每个时间步重读 controlDict，可以在不中断作业的情况下延长时间：

```bash
# 单个算例：把 endTime 从 20 s 延到 50 s
foamDictionary -entry endTime -set 50 system/controlDict

# 一批算例：只改 system/controlDict 里的 endTime 行
for d in case-*/; do
    sed -i 's/^endTime .*/endTime         50;/' "${d}system/controlDict"
done
```

`sed -i` 是纯文本替换，注释里的同名行会被一起改掉；`foamDictionary -entry -set` 解析字典语法，只改目标条目，参数化流程里应优先用它。另外只有 `runTimeModifiable true` 时改动才被读取，日志中会出现 `Reading controlDict`，用它确认改动是否生效。

## 参数取值与依据

| 条目 | 取值 | 依据 |
|---|---|---|
| deltaT | 5e-4 s | 由 Co=0.5、Δx=1 mm、U=1 m/s 反算 |
| adjustTimeStep | true | 启动段与稳定段速度相差 3 倍以上 |
| maxCo | 0.5 | 网格最大非正交角 65°，留出修正余量 |
| maxAlphaCo | 0.5 | 界面重构需要更小库朗数 |
| maxDeltaT | 0.01 s | 特征时间 0.1 s 的 10% |
| writeInterval | 0.5 s | 每 5 个涡周期存一次 |
| purgeWrite | 5 | 磁盘占用控制在 200 MB 内 |

## 失败模式与排查

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 总步数远超手算值 | maxCo 过小，或 maxDeltaT 缺失导致步长被反复裁剪 | `grep -c "^Time = " log` 与 40000 步对比，再用 `grep "deltaT = " log \| sort -u` 看步长分布 |
| 时间目录名带浮点长尾 | timeFormat 未设为 general | `ls case \| grep -E "[0-9]{6,}"` |
| 两小时内磁盘写满 | purgeWrite 未设，且矢量场数量多 | `du -sh case/*/ \| sort -h \| tail` |
| 改 controlDict 无反应 | runTimeModifiable 为 false，或改到了别的算例目录 | 运行中用 foamDictionary 改 endTime，观察日志是否打印 Reading controlDict |
| 目标时刻没有数据 | writeControl 用 timeStep，配合可调步长后写出点漂移 | 列出实际时间目录与关心的时刻对照 |
| 稳定段步长突然减半 | 局部速度尖峰触发 maxCo | `grep "Courant Number" log \| tail -50` 看 max 列 |

## 参考文献

1. Courant R., Friedrichs K., Lewy H. Über die partiellen Differenzengleichungen der mathematischen Physik. Mathematische Annalen, 100(1):32–74, 1928.
2. Ferziger J. H., Perić M., Street R. L. Computational Methods for Fluid Dynamics, 4th ed. Springer, 2020.
3. Greenshields C. J. OpenFOAM User Guide, version 11. OpenCFD Ltd., 2024.
4. Jasak H. Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows. PhD thesis, Imperial College London, 1996.
5. Issa R. I. Solution of the implicitly discretised fluid flow equations by operator-splitting. Journal of Computational Physics, 62(1):40–65, 1986.
6. Weller H. G., Tabor G., Jasak H., Fureby C. A tensorial approach to computational continuum mechanics using object-oriented techniques. Computers in Physics, 12(6):620–631, 1998.
