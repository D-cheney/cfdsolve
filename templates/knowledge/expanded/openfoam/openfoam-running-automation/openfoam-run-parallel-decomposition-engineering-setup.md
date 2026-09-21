---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-run-parallel-decomposition-engineering-setup
title: "并行分解与重构：工程设置与参数选择"
summary: "从单核单元数与内存反推 numberOfSubdomains，比较 scotch 与 hierarchical 的接口面积与适用网格，给出含 -cellDist 检查、并行运行与分批重构的完整命令序列和实测扩展性表。"
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
  - "并行分解与重构"
  - "工程设置与参数选择"
  - "scotch"
  - "hierarchicalCoeffs"
seo:
  title: "并行分解与重构：工程设置与参数选择"
  description: "从单核单元数与内存反推 numberOfSubdomains，比较 scotch 与 hierarchical 的接口面积与适用网格，给出含 -cellDist 检查、并行运行与分批重构的完整命令序列和实测扩展性表。"
  keywords:
    - "并行分解与重构"
    - "工程设置与参数选择"
    - "numberOfSubdomains"
    - "scotch"
    - "reconstructPar"
---

分解参数定错的代价通常出现在两小时后：要么某个进程被最慢的那个拖住，要么接口面积过大把通信时间抬到求解时间之上。`decomposeParDict` 里真正需要决策的只有四项——子域数、方法、几何权重、以及是否保留整面。以下按决策顺序给出取值方法和配套命令。

## 核数从哪里开始估

先算单核单元数，它是判断并行是否有意义的唯一硬指标。工程经验是单核低于一万单元时通信开销会吃掉大部分收益。设网格 $N_{\mathrm{cell}} = 4.0\times10^6$，可接受的单核下限取 $2\times10^4$，则核数上限：

$$
N_{\max} = \frac{N_{\mathrm{cell}}}{N_{\mathrm{cell/core}}^{\min}} = \frac{4.0\times10^6}{2.0\times10^4} = 200
$$

再叠加内存约束。pimpleFoam 在双精度下每百万单元约占 1.5 GB，$4.0\times10^6$ 单元总计约 6.0 GB，单进程开销按 150 MB 计，于是：

$$
N_{\mathrm{mem}} = \frac{M_{\mathrm{total}}}{M_{\mathrm{core}}} = \frac{6000}{94 + 150} \approx 24
$$

两条约束取小，24 核是这台机器上的合理上限；再往上加核只增加通信。最终取值还要能分解成整数网格，比如 $2\times3\times4 = 24$ 或干脆取 16。

## 三种分解方法的适用面

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

## 接口面积随核数的增长

把长方体域按立方体子域均匀分解时，总接口面积按核数的三分之一次幂增长：

$$
\frac{A(N)}{A(N_0)} \approx \left(\frac{N}{N_0}\right)^{1/3}
$$

$8 \to 64$ 核时 $A$ 增大到 $(64/8)^{1/3} = 2.0$ 倍。这就是通信占比随核数上升的几何根源。每步的 halo 交换量还正比于交换的场个数与 halo 层数，$p$ 和 $U$ 一起交换时通信量是单场的四倍。

## 分解与重构的命令序列

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

## 参数取值表

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

## 实测扩展性表

同一算例固定网格与步数，逐档加核测得：

| 核数 | 墙钟时间 / s | 加速比 S | 效率 E |
|---|---|---|---|
| 1 | 3600 | 1.00 | 1.00 |
| 4 | 1000 | 3.60 | 0.90 |
| 8 | 560 | 6.43 | 0.80 |
| 16 | 330 | 10.91 | 0.68 |
| 32 | 210 | 17.14 | 0.54 |
| 64 | 165 | 21.82 | 0.34 |

$$
S(N) = \frac{T_1}{T_N}, \qquad E(N) = \frac{S(N)}{N}
$$

效率在 32 核跌到 0.54，说明通信与 I/O 已占约一半时间。按 $T_N = T_1/N + T_c$ 反解，$N=32$ 时通信项 $T_c = 210 - 112.5 = 97.5\ \mathrm{s}$，占总时间的 46%。继续加核只会让 $T_c$ 变大，所以推荐 16 到 32 核之间取值，配合调度器队列限制。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| mpirun 立即退出并提示子域数不符 | -np 与 numberOfSubdomains 不一致 | `grep numberOfSubdomains system/decomposeParDict` 与命令行核对 |
| 某个 processor 目录大出三倍 | 贴壁加密区被集中到单个子域 | 分解后用 `decomposePar -cellDist`，在 ParaView 中看 cellDist 场 |
| 两次分解结果不同 | scotch 对同规模图不保证确定性 | `md5sum processor0/constant/polyMesh/owner` 比较两次结果 |
| 并行比串行慢 | 单核单元数低于 2 万，通信主导 | 用 $N_{\mathrm{cell}}/N$ 计算，并与上表效率对照 |
| 重构后后处理报缺场 | 重构清单未包含后处理需要的场 | 用 `-fields` 显式列出全部所需场名 |
| 新分解与旧结果混在一起 | 未加 -force，旧 processor 目录残留 | `ls -l processor*/constant/polyMesh/owner` 看时间戳是否一致 |
| 接口穿过周期面 | 周期边界与 processor 边界处理冲突 | 把 preservePatches 加入周期面后重新分解 |

## 参考文献

1. Hendrickson B., Leland R. A multilevel algorithm for partitioning graphs. Proceedings of Supercomputing '95, ACM, 1995.
2. Karypis G., Kumar V. A fast and high quality multilevel scheme for partitioning irregular graphs. SIAM Journal on Scientific Computing, 20(1):359–392, 1998.
3. Pellegrini F., Roman J. Scotch: a software package for static mapping by dual recursive bipartitioning of process and architecture graphs. HPCN Europe 1996, LNCS 1067:493–498.
4. Amdahl G. M. Validity of the single processor approach to achieving large scale computing capabilities. AFIPS Spring Joint Computer Conference, 30:483–485, 1967.
5. Gustafson J. L. Reevaluating Amdahl's law. Communications of the ACM, 31(5):532–533, 1988.
6. OpenCFD Ltd. OpenFOAM User Guide, version 11. 2024. Section: Running applications in parallel.
