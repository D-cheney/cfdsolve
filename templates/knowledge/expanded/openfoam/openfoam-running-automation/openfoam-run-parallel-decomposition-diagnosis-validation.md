---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-run-parallel-decomposition-diagnosis-validation
title: "并行分解与重构：结果诊断与可信度验证"
summary: "给出串并行相对偏差、负载不均衡度与通信占比三个诊断量的算法与阈值，用 checkMesh 逐子域核单元数，并说明接口异常、重构缺场与分解不确定性的判定试验。"
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
  - "并行分解与重构"
  - "结果诊断与可信度验证"
  - "负载不均衡"
  - "processor patch"
seo:
  title: "并行分解与重构：结果诊断与可信度验证"
  description: "给出串并行相对偏差、负载不均衡度与通信占比三个诊断量的算法与阈值，用 checkMesh 逐子域核单元数，并说明接口异常、重构缺场与分解不确定性的判定试验。"
  keywords:
    - "并行分解与重构"
    - "结果诊断与可信度验证"
    - "负载不均衡度"
    - "processor patch"
    - "并行效率"
---
# 并行分解与重构：结果诊断与可信度验证

并行算例最容易出的问题不是崩溃，而是结果与串行略有不同却没人核对。分解本身不改变方程，但会改变浮点归约顺序、改变线性求解器的分区方式，进而改变迭代历史。判断一次并行运行是否可信，要把三个量算出来：串并行相对偏差、负载不均衡度、通信时间占比。

## 串并行一致性是唯一基准

同一网格、同一字典、同一步数，分别用 1 核和 $N$ 核跑到同一物理时刻，比较目标量：

$$
\delta_{p/s} = \frac{\left|\phi_{\mathrm{par}} - \phi_{\mathrm{ser}}\right|}{\left|\phi_{\mathrm{ser}}\right|}
$$

圆柱绕流算例中，串行升力系数 $C_l^{\mathrm{ser}} = 0.3221$，16 核 $C_l^{\mathrm{par}} = 0.3224$，则 $\delta_{p/s} = 0.0003/0.3221 = 9.3\times10^{-4}$，即 0.093%。而该算例的时间离散不确定度 $GCI_t = 0.32\%$，串并行差异只有它的 0.3 倍，属于可接受范围。判据是 $\delta_{p/s}$ 应显著小于该算例的数值不确定度；一旦超过，就不是浮点顺序问题，而是分解改变了边界处理或某个面被切错了。

## 三个可量化的诊断量

负载不均衡度定义为主子域单元数与平均值之比，$I = 1$ 表示完美均衡：

$$
I = \frac{\max_i N_i}{\bar N}, \qquad \bar N = \frac{1}{N}\sum_{i=1}^{N} N_i
$$

$4.0\times10^6$ 单元分解为 8 份，各子域单元数为 512000、498000、505000、512000、476000、502000、489000、506000，合计 $4.000\times10^6$，均值 500000，最大值 512000，于是 $I = 512000/500000 = 1.024$。最慢进程决定了整体墙钟时间，所以不均衡直接转化为约 2.4% 的额外耗时。

通信时间占比从计时模型反解：

$$
f_c = \frac{T_N - T_1/N}{T_N}
$$

串行 $T_1 = 3600\ \mathrm{s}$，8 核 $T_8 = 560\ \mathrm{s}$，理想并行时间 $T_1/8 = 450\ \mathrm{s}$，于是 $f_c = (560-450)/560 = 0.196$。近 20% 的时间花在 halo 交换与 I/O 上。$f_c$ 超过 0.4 时再加核通常不再缩短墙钟时间。

## 用 checkMesh 逐子域核负载

`decomposePar -cellDist` 给出的是可视化证据，要拿到数字则逐子域跑一次网格检查：

```bash
for p in processor*; do
    n=$(checkMesh -case "$p" -constant 2>/dev/null \
        | awk '/^ *cells:/{print $2; exit}')
    printf "%-12s %8d\n" "$p" "$n"
done | tee cellCounts.txt
awk '{s+=$2; if($2>m) m=$2} END{printf "mean=%.0f  max=%d  I=%.4f\n", s/NR, m, m/(s/NR)}' cellCounts.txt
```

这段脚本一次给出全部子域单元数、均值、最大值与不均衡度。同时 `checkMesh` 会在输出中列出每个 processor patch 的面数，接口面数异常偏大的子域往往就是通信热点。

## 接口处的异常信号

processor patch 上的场通过 halo 交换保持一致，出问题时有三种可辨认的表现。

第一种是残差在接口处周期性尖峰：分解面切过强梯度区（剪切层、激波），非正交修正的迭代次数在接口附近不足。判定方法是把分解方法换成 `scotch` 重新分解，如果尖峰消失或位置改变，问题就在分解而不在格式。

第二种是守恒量漂移。对 $U$ 的全局积分应与串行在 $1\times10^{-10}$ 量级内一致；若偏差达到 $1\times10^{-4}$，说明有 processor patch 上的面没有被正确纳入通量计算，常见原因是周期面与 processor 面重叠。

第三种是重构后场值不连续。用同一时刻的 `processor*/100/U` 与 `reconstructPar` 后的 `100/U` 比较极值，差值应在输出精度之内：

```bash
for p in processor*; do
    foamDictionary -entry internalField "$p/100/U" 2>/dev/null | head -1
done
```

## 判定试验设计

区分"分解引起的差异"与"物理差异"需要一次受控对照：固定网格与时间步，只换分解方式（`scotch` 换成 `hierarchical` 且 `n (4 4 1)`），其余完全不动，重跑相同步数。如果目标量随分解方式变化超过 $\delta_{p/s}$ 的 3 倍，说明算例对分区敏感，此时应把接口主动移出强梯度区，而不是继续调求解器参数。

## 诊断表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差在固定位置周期性尖峰 | 分解面切过强梯度区，接口处修正不足 | 换成 scotch 重分解，看尖峰位置是否随之移动 |
| 全局动量积分与串行差 1e-4 | processor patch 面未纳入通量，或与周期面重叠 | 把周期面加入 preservePatches 后重跑 |
| 加核后墙钟时间上升 | 单核单元数不足，$f_c$ 超过 0.4 | 计算 $f_c$ 与单核单元数，对照扩展性表 |
| 某子域单元数高 20% | 贴壁加密区集中到单个子域 | 跑 checkMesh 逐子域计数，算 $I$ |
| 重构结果与 processor 目录极值不符 | 重构了错误的时间或场清单 | 比较同一时刻两侧的场极值 |
| 两次分解的 owner 文件不同 | scotch 不保证确定性 | md5sum processor0/constant/polyMesh/owner |
| 并行算例在特定时刻发散 | 分解改变线性求解器分区，迭代数不足 | 把 nOuterCorrectors 从 2 提到 4 重跑同一段 |

## 一次完整的可信度核算

设 $4.0\times10^6$ 单元算例在 16 核上运行，$I = 1.024$，$f_c = 0.196$，$\delta_{p/s} = 9.3\times10^{-4}$，时间离散 $GCI_t = 0.32\%$。把不均衡与通信合并估计额外开销：理想时间 $T_1/16 = 225\ \mathrm{s}$，实测 330 s，其中 97.5 s 为通信与不均衡贡献。串并行偏差 0.093% 只占时间离散不确定度的 29%，因此并行结果可以直接用于后续分析。若把核数提到 32，按 $f_c$ 随 $N^{1/3}$ 增长的规律估计通信项会再涨约 26%，墙钟时间只从 330 s 降到 210 s，收益已经明显放缓。

## 参考文献

1. Fox G. C., Williams R. D., Messina P. C. Parallel Computing Works! Morgan Kaufmann, 1994.
2. Gropp W., Lusk E., Skjellum A. Using MPI: Portable Parallel Programming with the Message-Passing Interface, 3rd ed. MIT Press, 2014.
3. Roache P. J. Verification and Validation in Computational Science and Engineering. Hermosa, Albuquerque, 1998.
4. Hendrickson B., Leland R. A multilevel algorithm for partitioning graphs. Proceedings of Supercomputing '95, ACM, 1995.
5. Chevalier C., Pellegrini F. PT-Scotch: a tool for efficient parallel graph ordering. Parallel Computing, 34(6–8):318–331, 2008.
6. OpenCFD Ltd. OpenFOAM v11 User Guide. 2024. Section: decomposePar and reconstructPar.
