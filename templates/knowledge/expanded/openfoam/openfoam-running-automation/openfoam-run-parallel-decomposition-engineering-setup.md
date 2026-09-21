---
template_version: flowlab-knowledge/1.0
slug: openfoam-run-parallel-decomposition-engineering-setup
title: 并行分解与重构：工程设置与诊断验证
summary: >-
  从单核单元数与内存反推 numberOfSubdomains，比较 scotch 与 hierarchical 的接口面积与适用网格，给出含
  -cellDist 检查、并行运行与分批重构的完整命令序列和实测扩展性表。
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
  - 并行分解与重构
  - 工程设置与参数选择
  - scotch
  - hierarchicalCoeffs
  - 结果诊断与可信度验证
  - 负载不均衡
  - processor patch
seo:
  title: 并行分解与重构：工程设置与诊断验证
  description: >-
    从单核单元数与内存反推 numberOfSubdomains，比较 scotch 与 hierarchical 的接口面积与适用网格，给出含
    -cellDist 检查、并行运行与分批重构的完整命令序列和实测扩展性表。
  keywords:
    - 并行分解与重构
    - 工程设置与参数选择
    - numberOfSubdomains
    - scotch
    - reconstructPar
    - 结果诊断与可信度验证
    - 负载不均衡度
    - processor patch
    - 并行效率
---
# 并行分解与重构：工程设置与诊断验证

分解参数定错的代价通常出现在两小时后：要么某个进程被最慢的那个拖住，要么接口面积过大把通信时间抬到求解时间之上。`decomposeParDict` 里真正需要决策的只有四项——子域数、方法、几何权重、以及是否保留整面。以下按决策顺序给出取值方法和配套命令。并行算例最容易出的问题不是崩溃，而是结果与串行略有不同却没人核对。分解本身不改变方程，但会改变浮点归约顺序、改变线性求解器的分区方式，进而改变迭代历史。判断一次并行运行是否可信，要把三个量算出来：串并行相对偏差、负载不均衡度、通信时间占比。

## 工程设置与实施

### 参数取值表

| 条目 | 取值 | 依据 |
|---|---|---|
| numberOfSubdomains | 16 | 单核 25 万单元，内存 94 MB/核 |
| method | scotch | 几何含 3 处倒角，结构化切分会产生长条子域 |
| delta | 0.001 | 几何方法下允许的单元不平衡容差 |
| hierarchicalCoeffs n | (4 4 1) | 备选方案，Z 向仅 1 m 不宜再切 |
| hierarchicalCoeffs order | xyz | 先切流向，减少跨流向接口 |
| distributed | false | 单机运行，共享内存 |
| preservePatches | (inlet outlet) | 进出口面需整体参与面积分 |
| fileHandler | collated | 共享 Lustre 文件系统 |

### 核数从哪里开始估

先算单核单元数，它是判断并行是否有意义的唯一硬指标。工程经验是单核低于一万单元时通信开销会吃掉大部分收益。设网格 $N_{\mathrm{cell}} = 4.0\times10^6$，可接受的单核下限取 $2\times10^4$，则核数上限：

$$
N_{\max} = \frac{N_{\mathrm{cell}}}{N_{\mathrm{cell/core}}^{\min}} = \frac{4.0\times10^6}{2.0\times10^4} = 200
$$

再叠加内存约束。pimpleFoam 在双精度下每百万单元约占 1.5 GB，$4.0\times10^6$ 单元总计约 6.0 GB，单进程开销按 150 MB 计，于是：

$$
N_{\mathrm{mem}} = \frac{M_{\mathrm{total}}}{M_{\mathrm{core}}} = \frac{6000}{94 + 150} \approx 24
$$

两条约束取小，24 核是这台机器上的合理上限；再往上加核只增加通信。最终取值还要能分解成整数网格，比如 $2\times3\times4 = 24$ 或干脆取 16。

### 三种分解方法的适用面

`scotch` 是图分区，以最小化接口为目标，复杂几何和不规则网格上负载最均衡，代价是分解本身要几秒到几十秒，且同一网格两次分解结果可能不同。`hierarchical` 按方向逐级切分，`n` 给出各方向切分数、`order` 指定切分顺序，适合主流方向明确、网格近结构化的情况。`simple` 只按几何方向一刀切块，可控但接口面积通常最大。

几何类方法的效果取决于 $n$ 与网格拉伸是否匹配。对 $2\ \mathrm{m} \times 2\ \mathrm{m} \times 1\ \mathrm{m}$ 的域分解为 $4\times4\times2$，子域尺寸 $0.5 \times 0.5 \times 0.5\ \mathrm{m}$，形状接近立方体，接口面积最小；若错写成 $16\times1\times1$，子域变成 $0.125 \times 2 \times 1\ \mathrm{m}$ 的长条，接口面积会涨到前者的三倍以上。对应的字典写法：

```text
// 方案 A：与几何匹配，推荐
method              hierarchical;
hierarchicalCoeffs
{
    n               (4 4 2);
    delta           0.001;
    order           xyz;
}

// 方案 B：单方向长条，接口面积约 3 倍
// n (16 1 1);
```

`order xyz` 表示先沿 x 方向切、再沿 y、最后沿 z，把切分顺序放在网格尺度最小的方向上通常能得到更均匀的子域。

### 接口面积随核数的增长

把长方体域按立方体子域均匀分解时，总接口面积按核数的三分之一次幂增长：

$$
\frac{A(N)}{A(N_0)} \approx \left(\frac{N}{N_0}\right)^{1/3}
$$

$8 \to 64$ 核时 $A$ 增大到 $(64/8)^{1/3} = 2.0$ 倍。这就是通信占比随核数上升的几何根源。每步的 halo 交换量还正比于交换的场个数与 halo 层数，$p$ 和 $U$ 一起交换时通信量是单场的四倍。

### 分解与重构的命令序列

```bash
# 生成单元分布场，用于检查各子域负载
decomposePar -cellDist -force 2>&1 | tee log.decomposePar

# 只分解最新时刻的场，省去重算历史时间
decomposePar -latestTime -fields '(p U k omega)' 2>&1 | tee -a log.decomposePar

# 并行运行：-np 必须等于 numberOfSubdomains
mpirun -np 16 foamRun -parallel -fileHandler collated > log.parallel 2>&1

# 分批重构，避免一次性读入全部时间目录
reconstructPar -time 100:200 -fields '(p U)' 2>&1 | tee log.reconstruct
```

`-cellDist` 会在 `0/` 下写一个整数场 `cellDist`，在 ParaView 中按它着色就能看出各子域大小与形状。`-fields` 在分解和重构两端都要用同一份清单，否则重构时会因为缺场报错。`collated` 文件处理器把每个进程的数据合并成 `processors16/` 下的单个文件，共享文件系统上的元数据压力明显低于默认的 `uncollated`，但重构与后处理工具必须能识别它。

### 实测扩展性表

同一算例固定网格与步数，逐档加核测得：

$$
S(N) = \frac{T_1}{T_N}, \qquad E(N) = \frac{S(N)}{N}
$$

效率在 32 核跌到 0.54，说明通信与 I/O 已占约一半时间。按 $T_N = T_1/N + T_c$ 反解，$N=32$ 时通信项 $T_c = 210 - 112.5 = 97.5\ \mathrm{s}$，占总时间的 46%。继续加核只会让 $T_c$ 变大，所以推荐 16 到 32 核之间取值，配合调度器队列限制。

| 核数 | 墙钟时间 / s | 加速比 S | 效率 E |
|---|---|---|---|
| 1 | 3600 | 1.00 | 1.00 |
| 4 | 1000 | 3.60 | 0.90 |
| 8 | 560 | 6.43 | 0.80 |
| 16 | 330 | 10.91 | 0.68 |
| 32 | 210 | 17.14 | 0.54 |
| 64 | 165 | 21.82 | 0.34 |

### 判定试验设计

区分"分解引起的差异"与"物理差异"需要一次受控对照：固定网格与时间步，只换分解方式（`scotch` 换成 `hierarchical` 且 `n (4 4 1)`），其余完全不动，重跑相同步数。如果目标量随分解方式变化超过 $\delta_{p/s}$ 的 3 倍，说明算例对分区敏感，此时应把接口主动移出强梯度区，而不是继续调求解器参数。

## 异常诊断与失效模式

### 故障模式与判定试验

processor patch 上的场通过 halo 交换保持一致，出问题时有三种可辨认的表现。

第一种是残差在接口处周期性尖峰：分解面切过强梯度区（剪切层、激波），非正交修正的迭代次数在接口附近不足。判定方法是把分解方法换成 `scotch` 重新分解，如果尖峰消失或位置改变，问题就在分解而不在格式。

第二种是守恒量漂移。对 $U$ 的全局积分应与串行在 $1\times10^{-10}$ 量级内一致；若偏差达到 $1\times10^{-4}$，说明有 processor patch 上的面没有被正确纳入通量计算，常见原因是周期面与 processor 面重叠。

第三种是重构后场值不连续。用同一时刻的 `processor*/100/U` 与 `reconstructPar` 后的 `100/U` 比较极值，差值应在输出精度之内：

```bash
for p in processor*; do
    foamDictionary -entry internalField "$p/100/U" 2>/dev/null | head -1
done
```

| 现象 | 根因 | 判定试验 |
|---|---|---|
| mpirun 立即退出并提示子域数不符 | -np 与 numberOfSubdomains 不一致 | `grep numberOfSubdomains system/decomposeParDict` 与命令行核对 |
| 某个 processor 目录大出三倍 | 贴壁加密区被集中到单个子域 | 分解后用 `decomposePar -cellDist`，在 ParaView 中看 cellDist 场 |
| 两次分解结果不同 | scotch 对同规模图不保证确定性 | `md5sum processor0/constant/polyMesh/owner` 比较两次结果 |
| 并行比串行慢 | 单核单元数低于 2 万，通信主导 | 用 $N_{\mathrm{cell}}/N$ 计算，并与上表效率对照 |
| 重构后后处理报缺场 | 重构清单未包含后处理需要的场 | 用 `-fields` 显式列出全部所需场名 |
| 新分解与旧结果混在一起 | 未加 -force，旧 processor 目录残留 | `ls -l processor*/constant/polyMesh/owner` 看时间戳是否一致 |
| 接口穿过周期面 | 周期边界与 processor 边界处理冲突 | 把 preservePatches 加入周期面后重新分解 |

### 三个可量化的诊断量

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

### 诊断表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差在固定位置周期性尖峰 | 分解面切过强梯度区，接口处修正不足 | 换成 scotch 重分解，看尖峰位置是否随之移动 |
| 全局动量积分与串行差 1e-4 | processor patch 面未纳入通量，或与周期面重叠 | 把周期面加入 preservePatches 后重跑 |
| 加核后墙钟时间上升 | 单核单元数不足，$f_c$ 超过 0.4 | 计算 $f_c$ 与单核单元数，对照扩展性表 |
| 某子域单元数高 20% | 贴壁加密区集中到单个子域 | 跑 checkMesh 逐子域计数，算 $I$ |
| 重构结果与 processor 目录极值不符 | 重构了错误的时间或场清单 | 比较同一时刻两侧的场极值 |
| 两次分解的 owner 文件不同 | scotch 不保证确定性 | md5sum processor0/constant/polyMesh/owner |
| 并行算例在特定时刻发散 | 分解改变线性求解器分区，迭代数不足 | 把 nOuterCorrectors 从 2 提到 4 重跑同一段 |

## 验证、验收与复现

### 串并行一致性是唯一基准

同一网格、同一字典、同一步数，分别用 1 核和 $N$ 核跑到同一物理时刻，比较目标量：

$$
\delta_{p/s} = \frac{\left|\phi_{\mathrm{par}} - \phi_{\mathrm{ser}}\right|}{\left|\phi_{\mathrm{ser}}\right|}
$$

圆柱绕流算例中，串行升力系数 $C_l^{\mathrm{ser}} = 0.3221$，16 核 $C_l^{\mathrm{par}} = 0.3224$，则 $\delta_{p/s} = 0.0003/0.3221 = 9.3\times10^{-4}$，即 0.093%。而该算例的时间离散不确定度 $GCI_t = 0.32\%$，串并行差异只有它的 0.3 倍，属于可接受范围。判据是 $\delta_{p/s}$ 应显著小于该算例的数值不确定度；一旦超过，就不是浮点顺序问题，而是分解改变了边界处理或某个面被切错了。

### 用 checkMesh 逐子域核负载

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

### 一次完整的可信度核算

设 $4.0\times10^6$ 单元算例在 16 核上运行，$I = 1.024$，$f_c = 0.196$，$\delta_{p/s} = 9.3\times10^{-4}$，时间离散 $GCI_t = 0.32\%$。把不均衡与通信合并估计额外开销：理想时间 $T_1/16 = 225\ \mathrm{s}$，实测 330 s，其中 97.5 s 为通信与不均衡贡献。串并行偏差 0.093% 只占时间离散不确定度的 29%，因此并行结果可以直接用于后续分析。若把核数提到 32，按 $f_c$ 随 $N^{1/3}$ 增长的规律估计通信项会再涨约 26%，墙钟时间只从 330 s 降到 210 s，收益已经明显放缓。

## 参考资料

1. Hendrickson B., Leland R. A multilevel algorithm for partitioning graphs. Proceedings of Supercomputing '95, ACM, 1995.
2. Karypis G., Kumar V. A fast and high quality multilevel scheme for partitioning irregular graphs. SIAM Journal on Scientific Computing, 20(1):359–392, 1998.
3. Pellegrini F., Roman J. Scotch: a software package for static mapping by dual recursive bipartitioning of process and architecture graphs. HPCN Europe 1996, LNCS 1067:493–498.
4. Amdahl G. M. Validity of the single processor approach to achieving large scale computing capabilities. AFIPS Spring Joint Computer Conference, 30:483–485, 1967.
5. Gustafson J. L. Reevaluating Amdahl's law. Communications of the ACM, 31(5):532–533, 1988.
6. OpenCFD Ltd. OpenFOAM User Guide, version 11. 2024. Section: Running applications in parallel.
7. Fox G. C., Williams R. D., Messina P. C. Parallel Computing Works! Morgan Kaufmann, 1994.
8. Gropp W., Lusk E., Skjellum A. Using MPI: Portable Parallel Programming with the Message-Passing Interface, 3rd ed. MIT Press, 2014.
9. Roache P. J. Verification and Validation in Computational Science and Engineering. Hermosa, Albuquerque, 1998.
10. Chevalier C., Pellegrini F. PT-Scotch: a tool for efficient parallel graph ordering. Parallel Computing, 34(6–8):318–331, 2008.
11. OpenCFD Ltd. OpenFOAM v11 User Guide. 2024. Section: decomposePar and reconstructPar.
