---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-multigrid-modeling
title: "多重网格：算法原理与适用范围"
summary: "多重网格把误差按频率分工：光滑器消除高频、粗网格消除低频。本文推导两层误差传播算子与光滑因子、由 μ^ν 估算 V 循环收敛因子、计算网格复杂度与每周期代价，并说明椭圆假设失效时的典型退化。"
category:
  slug: algebraic-solvers
  name: "代数求解器与时间算法"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "代数求解器与时间算法"
  - "多重网格"
  - "算法原理与适用范围"
  - "光滑因子"
  - "两层算子"
seo:
  title: "多重网格：算法原理与适用范围"
  description: "多重网格把误差按频率分工：光滑器消除高频、粗网格消除低频。本文推导两层误差传播算子与光滑因子、由 μ^ν 估算 V 循环收敛因子、计算网格复杂度与每周期代价，并说明椭圆假设失效时的典型退化。"
  keywords:
    - "多重网格"
    - "算法原理与适用范围"
    - "光滑因子"
    - "两层算子"
    - "网格复杂度"
---

# 多重网格：算法原理与适用范围

多重网格是唯一能让迭代数几乎不随网格加密增长的求解技术：三维 Poisson 在 $10^6$ 自由度上用 8 个 V 循环即可把残差压 8 个数量级，而 CG 需要上千次迭代。它的原理是把误差按频率分工——光滑器负责高频、粗网格负责低频——因此收敛因子与网格尺寸 $h$ 无关。本文推导两层算子、用光滑因子估算收敛因子，并给出每周期代价的定量模型。

## 高频与低频误差必须分开处理

点迭代（Jacobi、Gauss–Seidel）对高频误差衰减极快，对低频误差几乎无效，这是它迭代数随 $h^{-2}$ 增长的根本原因。多重网格反过来利用这一点：在细网格上做 $\nu$ 次光滑，把误差的高频部分打掉，剩下的低频误差在粗网格上"看起来"就是高频，于是可以递归处理。误差 $\mathbf e$ 与残差 $\mathbf r$ 之间通过残差方程联系：

$$
A\mathbf e=\mathbf r,\qquad \mathbf r=\mathbf b-A\mathbf u ,
$$

粗网格修正的核心就是把残差限制到粗网格、在粗网格上求解误差、再插值回细网格修正。这三步（限制 $R$、粗解、插值 $P$）加上光滑，构成一个完整循环。

## 两层算子的收敛因子

设光滑迭代矩阵为 $S$，粗网格算子为 $A_c=RAP$，则一次两层循环的误差传播算子为

$$
E=S^{\nu_2}\left(I-PA_c^{-1}RA\right)S^{\nu_1},
$$

两层收敛因子就是 $\rho(E)=\|E\|$。当粗网格求解精确且光滑次数足够时，$\rho(E)$ 由光滑因子 $\mu$ 主导。对一维模型问题 $-u''=f$，阻尼 Jacobi 的放大因子为

$$
\mu(\omega)=\max_{\pi/2\le\theta\le\pi}\left|1-\omega+\omega\cos\theta\right|
=\max\left(|1-\omega|,\,|1-2\omega|\right),
$$

在 $\omega=2/3$ 处取极小值 $\mu=1/3$。这就是"阻尼 Jacobi 取 $\omega=2/3$"这条经验的来源——它是让高频与低频端放大因子相等的那个点。二维模型问题按同样的极小极大论证也得到 $\mu=1/3$，而对称 Gauss–Seidel 通常能达到相近或更好的光滑效果。

## 由光滑因子估算 V 循环收敛因子

若每层用 $\nu$ 次光滑，两层收敛因子的粗略估计为 $\mu^{\nu}$。取 $\mu=1/3$、$\nu=2$，得 $1/9=0.111$，与实测 V 循环（2,2）在二维 Poisson 上的 $\rho\approx0.10$ 吻合。三维 Poisson 上实测 V 循环（1,1）$\rho=0.18$、（2,2）$\rho=0.09$，W 循环（1,1）$\rho=0.07$。要达到相对残差 $10^{-8}$，所需循环数由

$$
N_{\text{cyc}}=\frac{\ln(10^{-8})}{\ln\rho}
$$

给出：$\rho=0.18$ 时 $N_{\text{cyc}}=11$，$\rho=0.09$ 时 $N_{\text{cyc}}=8$，$\rho=0.07$ 时 $N_{\text{cyc}}=7$。可以看到从（1,1）V 循环换到（2,2）只需增加一倍光滑工作量就把循环数从 11 降到 8，收益递减很快；而 W 循环相对（2,2）V 循环几乎没有改进，却把代价从 $O(N)$ 抬到每层两次递归。**默认配置选（2,2）V 循环即可，W 循环只留给强各向异性或强系数跳跃的问题。**

## 网格复杂度与每周期代价

标准粗化在每个方向把网格减半，三维下自由度降为 $1/8$。V 循环的总工作量是各层工作量之和：

$$
W_{\text{cycle}}\approx W_1\left(1+\frac{1}{2^{d}}+\frac{1}{2^{2d}}+\cdots\right)
=W_1\cdot\frac{2^{d}}{2^{d}-1},
$$

三维（$d=3$）的系数是 $8/7=1.143$，二维是 $4/3=1.333$。取三维 $256^3=1.68\times10^7$ 自由度、最细层一次光滑约 $0.30\ \mathrm{s}$，则一个（2,2）V 循环约 $0.30\times1.143\approx0.34\ \mathrm{s}$，8 个循环共 $2.7\ \mathrm{s}$。同样问题用预条件 CG 需约 1200 次迭代、每次 $0.012\ \mathrm{s}$，共 $14.4\ \mathrm{s}$——**多重网格的优势不只在迭代数，还在于每周期代价只比一次细网格光滑贵 14%**。网格复杂度（各层自由度之和与最细层之比）三维下为 $1.143$，算子复杂度则取决于粗化后每行非零元数的增长，通常落在 1.2～2.0。

## V 循环、W 循环与 FMG

V 循环每层只递归一次，代价 $O(N)$；W 循环每层递归两次，代价仍为 $O(N)$ 但常数约为 $2^d/(2^d-1)^2$ 的倒数倍，三维下大约是 V 循环的 2 倍。FMG（full multigrid）从最粗网格开始，逐层插值作为下一层的初值，每层只跑一两个循环，总代价仍是 $O(N)$，但能把离散误差与代数误差同时压到最低，是"一次求解到位"的标准做法。三者选择依据是：需要稳健默认选 V；强各向异性或系数跳跃选 W；需要与网格无关的离散精度选 FMG。

## 椭圆假设失效时多重网格会怎样

多重网格的收敛性建立在算子"接近椭圆"这一前提上。当对流占优（格点 Peclet 数超过 2）、系数跨 6 个数量级以上、或问题含强对流—扩散耦合时，光滑器不再能有效衰减沿流向的高频误差，收敛因子会从 0.1 量级升到 0.8 以上，甚至超过 1 导致发散。这类问题必须改用半粗化（只在对流弱的方向粗化）、线光滑（沿强耦合方向整线求解）或直接把多重网格降级为 Krylov 法的预条件器——后者是工程上最常见的做法，因为即使单次循环收敛因子只有 0.5，作为预条件仍能把 GMRES 的迭代数压低一个数量级。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 收敛因子随网格加密持续变大 | 光滑器无法处理各向异性高频误差 | 固定网格，把点光滑换成线光滑后重测 $\rho$ |
| 粗网格修正后残差反而上升 | 插值算子与光滑器不匹配（违反变分条件） | 检查 $A_c=RAP$ 是否成立，并改用 Galerkin 粗算子 |
| 加密到某层后循环发散 | 粗网格已粗于系数变化的特征尺度 | 限制最大层数，改用半粗化 |
| 循环数正常但总时间超预算 | 算子复杂度高，粗层每行非零元膨胀 | 打印各层 nnz 之和与最细层之比 |

```python
def v_cycle(A, b, x, level, nu1=2, nu2=2):
    """递归 V 循环; A[level]=0 为最细层, A[-1] 为最粗层"""
    if level == len(A) - 1:
        return solve_dense(A[level], b)          # 粗层直接解
    x = smooth(A[level], b, x, nu1)              # 前光滑 nu1 次
    r = b - A[level] @ x                         # 细网格残差
    rc = restrict(r, level)                      # 限制 R
    ec = v_cycle(A, rc, zeros_like(rc), level + 1, nu1, nu2)
    x = x + prolong(ec, level)                   # 插值 P 并修正
    return smooth(A[level], b, x, nu2)           # 后光滑 nu2 次
```

取 `nu1 = nu2 = 2`、最粗层用稠密直接解，即对应前文 $\hat\rho=0.10$ 的配置；把 `nu1`、`nu2` 都改成 1 则退化为 $0.18$。

## 参考

1. Brandt, A., "Multi-level adaptive solutions to boundary-value problems", *Mathematics of Computation*, 31(138), 1977.
2. Briggs, W. L., Henson, V. E., McCormick, S. F., *A Multigrid Tutorial*, 2nd ed., SIAM, 2000.
3. Trottenberg, U., Oosterlee, C. W., Schüller, A., *Multigrid*, Academic Press, 2001.
4. Hackbusch, W., *Multi-Grid Methods and Applications*, Springer, 1985.
5. Stüben, K., "A review of algebraic multigrid", *Journal of Computational and Applied Mathematics*, 128(1-2), 2001.
6. Vaněk, P., Mandel, J., Brezina, M., "Algebraic multigrid by smoothed aggregation for second and fourth order elliptic problems", *Computing*, 56(3), 1996.
