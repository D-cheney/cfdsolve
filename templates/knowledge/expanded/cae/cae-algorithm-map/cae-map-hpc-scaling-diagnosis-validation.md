---
template_version: "flowlab-knowledge/1.0"
slug: cae-map-hpc-scaling-diagnosis-validation
title: "高性能计算扩展性：结果诊断与可信度验证"
summary: "给出强/弱扩展效率的计算方法、Amdahl 律下的加速上限手算、通信占比与每核单元数的经验下限，以及用算术强度判断带宽受限的 roofline 判据，用于区分通信瓶颈、内存带宽瓶颈与负载不均。"
category:
  slug: cae-algorithm-map
  name: "CAE 算法全景图"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "CAE 算法全景图"
  - "高性能计算扩展性"
  - "结果诊断与可信度验证"
  - "Amdahl 律"
  - "roofline 模型"
seo:
  title: "高性能计算扩展性：结果诊断与可信度验证"
  description: "给出强/弱扩展效率的计算方法、Amdahl 律下的加速上限手算、通信占比与每核单元数的经验下限，以及用算术强度判断带宽受限的 roofline 判据，用于区分通信瓶颈、内存带宽瓶颈与负载不均。"
  keywords:
    - "高性能计算扩展性"
    - "结果诊断与可信度验证"
    - "强扩展效率"
    - "通信占比"
    - "算术强度"
---

# 高性能计算扩展性：结果诊断与可信度验证

扩展性诊断要回答的是"加核为什么不再变快"，而不是"能跑多少核"。本文给出强/弱扩展效率的计算方法、Amdahl 律下的加速上限、通信占比与每核单元数的经验下限，以及用算术强度区分带宽瓶颈的判据。适用于 CF 求解器在 $10^2\sim10^4$ 核区间的性能诊断。

## 强扩展与弱扩展测的不是同一件事

强扩展固定问题规模、增加核数，衡量"同一算例能不能更快"；弱扩展保持每核工作量不变、同时放大问题与核数，衡量"能不能算更大的题"。二者公式不同：

$$S_N=\frac{T_1}{T_N},\qquad \eta_N=\frac{S_N}{N},$$

$T_1$ 为单核（或基准核数）墙钟时间，$T_N$ 为 $N$ 核墙钟时间。弱扩展效率则用

$$\eta_w=\frac{T_1}{T_N},$$

其中 $T_N$ 是"每核工作量与单核时相同、$N$ 核时的墙钟时间"，理想值为 1。诊断时必须先声明测的是哪一种：一个求解器强扩展效率在 512 核掉到 40%，但弱扩展效率仍保持 0.92，说明它不适合加速小算例，却完全胜任更大规模的问题。

## Amdahl 律给出的加速上限

若程序中不可并行部分占 $f$，则

$$S_N=\frac{1}{f+\dfrac{1-f}{N}},\qquad S_\infty=\frac{1}{f}.$$

一次可核对的手算：$f=0.001$（0.1% 串行，来自 I/O、初始化与全局归约）时，加速上限 $S_\infty=1/0.001=1000$。在 $N=512$ 时

$$S_{512}=\frac{1}{0.001+0.999/512}=\frac{1}{0.002951}=338.9,\quad \eta_{512}=\frac{338.9}{512}=66.2\%.$$

在 $N=4096$ 时 $S_{4096}=1/(0.001+0.0002439)=803.9$，$\eta_{4096}=19.6\%$。仅 0.1% 的串行比例就足以让 4096 核的效率跌到 20% 以下；而 $f$ 只增加 0.1 个百分点（到 0.2%）就会把上限从 1000 砍到 500。这就是"扩展性下降点出现在千核量级"的定量来源。

## 通信占比与每核单元数的下限

分区并行中，每核通信量正比于子域表面积，计算量正比于子域体积，二者之比随子域尺寸 $L$ 下降：

$$f_{comm}\sim\frac{L^{2}}{L^{3}}=\frac{1}{L}\propto N^{-1/3}.$$

因此每核单元数（等价于 $L^3$）存在经验下限。手算：三维块状分解，每核 $10^4$ 个单元时子域边长约 $10^{4/3}=21.5$ 个单元，边界单元约 $6\times21.5^2=2774$，占 27.7%；每核 $2\times10^4$ 个单元时边界占比降到 22.1%；每核 $10^5$ 时降到 8.6%。工程经验是每核低于 $5\times10^3$ 个单元时通信占比超过 20%，扩展效率开始快速下降。

单次迭代的通信时间可估算为延迟项加带宽项：$t_{comm}=t_{lat}+V/B$。取 $t_{lat}=12\ \mathrm{\mu s}$、每核交换 $V=0.8\ \mathrm{MB}$、互连带宽 $B=20\ \mathrm{GB/s}$，则 $t_{comm}=12\ \mathrm{\mu s}+40\ \mathrm{\mu s}=52\ \mathrm{\mu s}$。若计算时间 $t_{comp}=1.2\ \mathrm{ms}$，通信占比 $52/1200=4.3\%$；当每核单元数降到 $2\times10^3$，计算时间降到 $0.24\ \mathrm{ms}$ 而通信因延迟项几乎不变，占比升到 17.8%，这就是下降点。

## 内存带宽与 roofline 判据

FVM 显式格式是典型的内存带宽受限算子。算术强度（每字节内存流量对应的浮点运算数）为

$$\mathrm{AI}=\frac{F}{B},$$

$F$ 为每单元浮点运算数，$B$ 为每单元内存流量（字节）。手算：六面体单元 6 邻域、每单元约 50 次浮点运算，需读写 7 个 double（$7\times8=56\ \mathrm{B}$），$\mathrm{AI}=50/56=0.89\ \mathrm{flop/B}$。节点峰值 $10\ \mathrm{TFLOPS}$、可持续带宽 $200\ \mathrm{GB/s}$ 时，可达到的浮点性能只有 $200\times0.89=178\ \mathrm{GFLOPS}$，仅为峰值的 1.8%。因此"扩展效率低"常常不是通信问题，而是算法本身带宽受限，加核无法改善。

```
# 用简单计时估计强扩展效率与通信占比
import math
def efficiency(t1, tN, N):
    S = t1 / tN
    return S, S / N
S, eta = efficiency(86400.0, 3120.0, 64)   # 86400 s -> 3120 s, 64 核
print(f"S={S:.1f}  eta={eta:.3f}")          # S=27.7  eta=0.433
t_comm, t_comp = 52e-6, 1.2e-3
print(f"f_comm={t_comm/(t_comm+t_comp):.3f}")  # 0.042
```

上面第一组数（$86400\ \mathrm{s}\to3120\ \mathrm{s}$、64 核）给出 $S=27.7$、$\eta=43.3\%$，明显低于线性；第二组显示通信只占 4.2%，说明效率损失主要来自负载不均或内存带宽，而非通信。

## 失败模式：现象、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 64 核效率 43%，通信占比仅 4% | 负载不均或分区边界过大 | 统计各 rank 计算时间与单元数离散度 |
| 512→1024 核耗时几乎不变 | 串行部分或全局归约主导 | 用 Amdahl 反解 $f$，检查 I/O 与全局通信 |
| 弱扩展效率随核数缓慢下降 | 表面积/体积比上升，通信占比增长 | 记录每核单元数与 $t_{comm}/t_{comp}$ |
| 每核单元数 3000 时效率骤降 | 低于通信占比 20% 的经验下限 | 增大问题规模或减少分解块数 |
| 加核后浮点性能停在峰值 2% | 算术强度低于 roofline 拐点 | 计算 AI，判断是否带宽受限 |
| 相同核数不同分解效率差 30% | 分区质量差（切割面或邻接失衡） | 比较不同分解器的邻接通信量 |

## 扩展性报告字段

一次扩展性测试至少要报告：问题规模（单元数）、核数序列、每核单元数、$S_N$ 与 $\eta_N$、$f_{comm}$、内存峰值（GB/核），以及瓶颈归类（通信/带宽/负载）。缺少每核单元数这一项，效率数字无法与别人的算例比较——同样的 50% 效率，在每核 5 万单元和每核 2 千单元下含义完全不同。

参考文献：

1. Amdahl, G. M., "Validity of the single processor approach to achieving large scale computing capabilities", *AFIPS Spring Joint Computer Conference*, 1967.
2. Gustafson, J. L., "Reevaluating Amdahl's law", *Communications of the ACM*, 31(5), 532–533, 1988.
3. Saad, Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
4. Gropp, W., Lusk, E., & Skjellum, A., *Using MPI: Portable Parallel Programming with the Message-Passing Interface*, 3rd ed., MIT Press, 2014.
5. Williams, S., Waterman, A., & Patterson, D., "Roofline: an insightful visual performance model for multicore architectures", *Communications of the ACM*, 52(4), 65–76, 2009.
6. PETSc Development Team, *PETSc/TAO Users Manual*, Argonne National Laboratory, ANL-21/39, 2023.
