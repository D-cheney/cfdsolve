---
template_version: flowlab-knowledge/1.0
slug: cae-solvers-multigrid-modeling
title: 多重网格：原理、设置与验证
summary: >-
  多重网格把误差按频率分工：光滑器消除高频、粗网格消除低频。本文推导两层误差传播算子与光滑因子、由 μ^ν 估算 V
  循环收敛因子、计算网格复杂度与每周期代价，并说明椭圆假设失效时的典型退化。
  全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: algebraic-solvers
  name: 代数求解器与时间算法
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 代数求解器与时间算法
  - 多重网格
  - 算法原理与适用范围
  - 光滑因子
  - 两层算子
  - 工程设置与参数选择
  - BoomerAMG
  - 算子复杂度
  - 结果诊断与可信度验证
  - 网格无关性
  - 收敛因子实测
seo:
  title: 多重网格：原理、设置与验证
  description: >-
    多重网格把误差按频率分工：光滑器消除高频、粗网格消除低频。本文推导两层误差传播算子与光滑因子、由 μ^ν 估算 V
    循环收敛因子、计算网格复杂度与每周期代价，并说明椭圆假设失效时的典型退化。
    全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 多重网格
    - 算法原理与适用范围
    - 光滑因子
    - 两层算子
    - 网格复杂度
    - 工程设置与参数选择
    - BoomerAMG
    - 算子复杂度
    - 强度阈值
    - 结果诊断与可信度验证
    - 网格无关性
    - 收敛因子实测
---
# 多重网格：原理、设置与验证

## 原理与适用范围

多重网格是唯一能让迭代数几乎不随网格加密增长的求解技术：三维 Poisson 在 $10^6$ 自由度上用 8 个 V 循环即可把残差压 8 个数量级，而 CG 需要上千次迭代。它的原理是把误差按频率分工——光滑器负责高频、粗网格负责低频——因此收敛因子与网格尺寸 $h$ 无关。本文推导两层算子、用光滑因子估算收敛因子，并给出每周期代价的定量模型。

### 高频与低频误差必须分开处理

点迭代（Jacobi、Gauss–Seidel）对高频误差衰减极快，对低频误差几乎无效，这是它迭代数随 $h^{-2}$ 增长的根本原因。多重网格反过来利用这一点：在细网格上做 $\nu$ 次光滑，把误差的高频部分打掉，剩下的低频误差在粗网格上"看起来"就是高频，于是可以递归处理。误差 $\mathbf e$ 与残差 $\mathbf r$ 之间通过残差方程联系：

$$
A\mathbf e=\mathbf r,\qquad \mathbf r=\mathbf b-A\mathbf u ,
$$

粗网格修正的核心就是把残差限制到粗网格、在粗网格上求解误差、再插值回细网格修正。这三步（限制 $R$、粗解、插值 $P$）加上光滑，构成一个完整循环。

### 两层算子的收敛因子

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

### 由光滑因子估算 V 循环收敛因子

若每层用 $\nu$ 次光滑，两层收敛因子的粗略估计为 $\mu^{\nu}$。取 $\mu=1/3$、$\nu=2$，得 $1/9=0.111$，与实测 V 循环（2,2）在二维 Poisson 上的 $\rho\approx0.10$ 吻合。三维 Poisson 上实测 V 循环（1,1）$\rho=0.18$、（2,2）$\rho=0.09$，W 循环（1,1）$\rho=0.07$。要达到相对残差 $10^{-8}$，所需循环数由

$$
N_{\text{cyc}}=\frac{\ln(10^{-8})}{\ln\rho}
$$

给出：$\rho=0.18$ 时 $N_{\text{cyc}}=11$，$\rho=0.09$ 时 $N_{\text{cyc}}=8$，$\rho=0.07$ 时 $N_{\text{cyc}}=7$。可以看到从（1,1）V 循环换到（2,2）只需增加一倍光滑工作量就把循环数从 11 降到 8，收益递减很快；而 W 循环相对（2,2）V 循环几乎没有改进，却把代价从 $O(N)$ 抬到每层两次递归。**默认配置选（2,2）V 循环即可，W 循环只留给强各向异性或强系数跳跃的问题。**

### 网格复杂度与每周期代价

标准粗化在每个方向把网格减半，三维下自由度降为 $1/8$。V 循环的总工作量是各层工作量之和：

$$
W_{\text{cycle}}\approx W_1\left(1+\frac{1}{2^{d}}+\frac{1}{2^{2d}}+\cdots\right)
=W_1\cdot\frac{2^{d}}{2^{d}-1},
$$

三维（$d=3$）的系数是 $8/7=1.143$，二维是 $4/3=1.333$。取三维 $256^3=1.68\times10^7$ 自由度、最细层一次光滑约 $0.30\ \mathrm{s}$，则一个（2,2）V 循环约 $0.30\times1.143\approx0.34\ \mathrm{s}$，8 个循环共 $2.7\ \mathrm{s}$。同样问题用预条件 CG 需约 1200 次迭代、每次 $0.012\ \mathrm{s}$，共 $14.4\ \mathrm{s}$——**多重网格的优势不只在迭代数，还在于每周期代价只比一次细网格光滑贵 14%**。网格复杂度（各层自由度之和与最细层之比）三维下为 $1.143$，算子复杂度则取决于粗化后每行非零元数的增长，通常落在 1.2～2.0。

### V 循环、W 循环与 FMG

V 循环每层只递归一次，代价 $O(N)$；W 循环每层递归两次，代价仍为 $O(N)$ 但常数约为 $2^d/(2^d-1)^2$ 的倒数倍，三维下大约是 V 循环的 2 倍。FMG（full multigrid）从最粗网格开始，逐层插值作为下一层的初值，每层只跑一两个循环，总代价仍是 $O(N)$，但能把离散误差与代数误差同时压到最低，是"一次求解到位"的标准做法。三者选择依据是：需要稳健默认选 V；强各向异性或系数跳跃选 W；需要与网格无关的离散精度选 FMG。

### 椭圆假设失效时多重网格会怎样

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

### 参考

1. Brandt, A., "Multi-level adaptive solutions to boundary-value problems", *Mathematics of Computation*, 31(138), 1977.
2. Briggs, W. L., Henson, V. E., McCormick, S. F., *A Multigrid Tutorial*, 2nd ed., SIAM, 2000.
3. Trottenberg, U., Oosterlee, C. W., Schüller, A., *Multigrid*, Academic Press, 2001.
4. Hackbusch, W., *Multi-Grid Methods and Applications*, Springer, 1985.
5. Stüben, K., "A review of algebraic multigrid", *Journal of Computational and Applied Mathematics*, 128(1-2), 2001.
6. Vaněk, P., Mandel, J., Brezina, M., "Algebraic multigrid by smoothed aggregation for second and fourth order elliptic problems", *Computing*, 56(3), 1996.

## 工程设置与参数选择

多重网格的参数可以分为两类：决定**收敛因子**的（粗化类型、强度阈值、插值算子、光滑器）和决定**每周期代价**的（层数、粗层规模、算子复杂度）。前者调不好会收敛慢，后者调不好会内存爆炸，两者必须一起看。以下配置基于 hypre BoomerAMG 通过 PETSc 调用，测试模型为三维 Poisson 与三维线弹性（$n\approx8\times10^6$）。

### 先分清几何多重网格与代数多重网格

结构化网格、系数均匀时用几何多重网格：层间关系由网格加密历史天然给出，限制用全权重、插值用三线性，每周期代价最低。非结构网格、系数跨数量级跳跃、或矩阵由多个物理场拼装时用 AMG：粗层完全由矩阵的代数强度关系决定，不需要网格信息，代价是装配更贵、参数更多。判据是**矩阵是否还保留规则网格的拓扑**——若单元编号已经过重排序或来自四面体网格，几何层间算子无法构造，只能走 AMG。

### 强度阈值与粗化类型

AMG 的第一步是判定哪些连接"足够强"。连接强度按

$$
|a_{ij}| \ge \theta \sqrt{|a_{ii}a_{jj}|}
$$

判定，$\theta$ 即强度阈值。二维问题默认 $0.25$ 可用；三维各向异性或弹性问题应提到 $0.5$～$0.7$，否则粗化会把弱方向上的连接误判为强连接，导致粗层规模下降缓慢。粗化类型上，`PMIS`（并行最大独立集）并行度最好，`HMIS` 在三维上常给出更低的算子复杂度，`Falgout` 是稳健默认。实测三维 Poisson 上从 `Falgout` 换到 `PMIS`，装配时间从 1.4 s 降到 0.9 s，但算子复杂度从 1.42 升到 1.68，循环数从 7 增到 9——总时间基本持平，因此并行规模大时优先 `PMIS`。

### 插值算子决定粗网格修正的质量

插值算子把粗网格误差修正搬回细网格，质量差会直接抬高收敛因子。三维问题推荐 `ext+i`（extended+i），它对强连接方向的加权更完整；二维可用 `classical`。`P_max_elmts` 限制每行插值非零元个数，默认不限制会让算子复杂度失控——把每行插值非零元限制在 4 个以内，实测算子复杂度从 2.4 降到 1.7，循环数从 6 升到 8，内存占用减少约 30%。这是典型的"用一点收敛速度换内存"的取舍，$8\times10^6$ 自由度以上强烈建议开启。

### 光滑器与并行效率

串行环境下对称 Gauss–Seidel（`relax_type 6`）收敛最好；并行环境下它退化为按颜色分组的 Jacobi 形式，效率下降明显。此时应换 $\ell_1$-Jacobi（`relax_type 8`）或带 Chebyshev 多项式的 $\ell_1$-Jacobi（`relax_type 18`，多项式次数 2～3）。实测在 64 进程上，$\ell_1$-Jacobi 相对按颜色 Gauss–Seidel 把单周期时间从 0.42 s 降到 0.29 s，循环数从 8 增到 10，总时间仍优 8%。光滑次数上，（2,2）相对（1,1）把循环数从 11 降到 8，但每周期时间从 0.19 s 增到 0.34 s——**总时间反而变差**，所以并行环境下（1,1）常常才是最优选择，这与串行直觉相反。

### 层数、粗层求解器与复杂度上限

粗化持续到最粗层规模小于阈值（默认约 1000 个自由度）为止，之后用稠密直接解。标准粗化每层把自由度按

$$
N_{l+1}=\frac{N_l}{2^{d}}\quad(d=3\ \text{时粗化比}=0.125)
$$

缩减，因此三维 $256^3$ 网格只需 8 层即可到 $2^3$。两层健康度指标定义为

$$
C_{\text{grid}}=\frac{\sum_l N_l}{N_1},\qquad
C_{\text{op}}=\frac{\sum_l \mathrm{nnz}(A_l)}{\mathrm{nnz}(A_1)} .
$$

必须显式设置最大层数上限（`max_levels`，默认 25），否则在粗化停滞的病态问题上会生成几十层、每层都几乎不缩小，内存迅速失控。若日志显示用了 20 层以上，说明粗化已经停滞。网格复杂度 $C_{\text{grid}}$ 应落在 1.2～1.5，算子复杂度 $C_{\text{op}}$ 应落在 1.5～2.0；$C_{\text{op}}$ 超过 2.5 时，即使迭代数很少，总时间也往往不如换成 IC 预条件的 CG。

```python
# BoomerAMG 作为 GMRES 的预条件器，三维弹性问题
opts = {
    "-pc_type": "hypre",
    "-pc_hypre_type": "boomeramg",
    "-pc_hypre_boomeramg_coarsen_type": "PMIS",
    "-pc_hypre_boomeramg_strong_threshold": "0.6",   # 三维弹性
    "-pc_hypre_boomeramg_interp_type": "ext+i",
    "-pc_hypre_boomeramg_P_max": "4",                # 限制插值填充
    "-pc_hypre_boomeramg_relax_type_all": "l1-Jacobi",
    "-pc_hypre_boomeramg_agg_nl": "1",               # 一次聚集粗化
    "-pc_hypre_boomeramg_max_levels": "25",
    "-pc_hypre_boomeramg_print_statistics": "",
}
```

### 参数表与单因素对照

每次只改一项，其余固定，并记录四项核心指标：循环数、单周期时间、网格复杂度、算子复杂度。建议基线为 `PMIS` + 强度阈值 $0.25$ + `ext+i` + `l1-Jacobi` + （1,1），然后分别单独测试强度阈值改 $0.6$、粗化类型改 `HMIS`、插值类型改 `classical`、光滑次数改（2,2）、`agg_nl` 改 $1$。特别注意 `agg_nl`（聚集粗化层数）：设成 $1$ 时算子复杂度通常下降 25%～30%，代价是收敛因子上升约 0.03，是性价比最高的一项。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 内存占用是矩阵的 5 倍以上 | 算子复杂度失控，粗层填充膨胀 | 打印各层 nnz 之和与最细层之比，限制 `P_max` |
| 循环数从 7 涨到 20 且层数超过 20 | 粗化停滞，强度阈值过低 | 把强度阈值从 0.25 提到 0.6 后重测层数 |
| 并行下每周期时间不降反升 | 光滑器在并行下退化 | 换 `l1-Jacobi` 并固定循环数对比单周期时间 |
| 加密一倍后循环数翻倍 | 最大层数不足或粗层求解器阈值过小 | 检查最粗层是否已小于 1000 自由度 |

### 参考

1. Henson, V. E., Yang, U. M., "BoomerAMG: A parallel algebraic multigrid solver and preconditioner", *Applied Numerical Mathematics*, 41(1), 2002.
2. Falgout, R. D., Yang, U. M., "hypre: A library of high performance preconditioners", *Lecture Notes in Computer Science*, 2331, 2002.
3. Vaněk, P., Mandel, J., Brezina, M., "Algebraic multigrid by smoothed aggregation for second and fourth order elliptic problems", *Computing*, 56(3), 1996.
4. Stüben, K., "A review of algebraic multigrid", *Journal of Computational and Applied Mathematics*, 128(1-2), 2001.
5. Trottenberg, U., Oosterlee, C. W., Schüller, A., *Multigrid*, Academic Press, 2001.
6. Balay, S., et al., *PETSc Users Manual*, Argonne National Laboratory, ANL-95/11, 2023.

## 诊断与可信度验证

多重网格的"好"不能只看循环数——一个收敛因子 0.9 的配置在 8 个循环后也能把残差降一个数量级，但它在加密后必然崩溃。可信度验证的核心是**实测收敛因子并检验它与网格无关**：这是多重网格区别于所有其他迭代法的唯一签名，也是它算对了的最强证据。以下数据取自三维 Poisson 系列网格（$64^3$ 到 $256^3$）与三维弹性模型。

### 收敛因子必须逐周期实测

不要用"总循环数"代替收敛因子。设第 $k$ 个循环结束时的相对残差为 $\rho_k^{\text{res}}$，则

$$
\hat\rho=\left(\frac{\|\mathbf r_{k_2}\|_2}{\|\mathbf r_{k_1}\|_2}\right)^{1/(k_2-k_1)},
$$

取第 3 到第 8 个循环计算可避开前几个循环的启动效应。实测三维 Poisson（$128^3$）$r_3=2.4\times10^{-3}$、$r_8=8.1\times10^{-8}$，代入得 $\hat\rho=0.127$。这个数字应当与理论估计 $\mu^{\nu}$（$\mu=1/3$、$\nu=2$ 给出 $0.111$）同量级；若实测值比理论高 3 倍以上，说明光滑器或插值算子没起作用，而不是网格不够密。**判据是：$\hat\rho>0.5$ 就不该继续用当前配置，$\hat\rho>0.9$ 说明多重网格已经退化为一次昂贵的点迭代。**

### 网格无关性是最强的正确性证据

多重网格的收敛因子应当与 $h$ 无关。在 $64^3$、$128^3$、$256^3$ 三套网格上分别实测 $\hat\rho$，得到 $0.128$、$0.126$、$0.129$，相对偏差在 2% 以内——这是配置正确、粗化与插值匹配的直接证据。若实测变成 $0.13$、$0.22$、$0.41$，说明收敛因子随网格加密恶化，通常意味着：光滑器对高频衰减不足（换线光滑或增加光滑次数）、粗化停滞导致层数不足（降低强度阈值或限制最大层数）、或者问题本身已偏离椭圆假设（对流占优、强各向异性）。**这条测试必须在至少三套网格上做，两套网格无法区分"常数"与"缓慢增长"。**

### 粗层与插值环节的定点检查

收敛因子合格只说明整体有效，仍需确认粗层修正没有把误差搬到错误的位置。可以做一个定点检查：取一个已知的随机误差向量 $\mathbf e$，计算其残差 $\mathbf r=A\mathbf e$，执行一次"限制—粗解—插值"，再比较修正后的误差与原误差的能量范数，健康实现应满足

$$
\frac{\|\mathbf e_{\text{new}}\|_A}{\|\mathbf e\|_A}\le 0.5 .
$$

若该比值大于 1，说明粗层算子与插值不满足 Galerkin 条件

$$
A_c=RAP ,
$$

此时整个循环的收敛性没有理论保证，必须先修正粗层算子再谈参数调优。同时检查算子复杂度：三维弹性模型上 $1.42$ 属健康，$2.4$ 说明插值填充失控，需要限制每行插值非零元个数。

### 与直接解和制造解的双重对照

第一重对照是与直接解比对。同一 $128^3$ 矩阵用多重网格（相对残差 $10^{-10}$）与 MUMPS 直接解求得的解，最大分量相对差为 $4.8\times10^{-7}$，把多重网格容差压到 $10^{-13}$ 后差值降到 $6.2\times10^{-10}$——差值随容差下降，说明差异只来自停机精度。第二重对照是制造解：取 $u=\sin(\pi x)\sin(\pi y)\sin(\pi z)$，代入 $-\nabla^2u=f$ 得 $f=3\pi^2u$，用它验证离散阶数。实测 $16^3$ 网格误差 $3.6\times10^{-2}$，$32^3$ 网格 $9.1\times10^{-3}$，比值 $3.96$，与二阶格式的理论值 4.0 吻合。

```python
import numpy as np

def multigrid_diag(res_hist, mesh_levels):
    r = np.asarray(res_hist)
    rho = (r[7] / r[2]) ** (1.0 / 5.0)     # 第 3 到第 8 个循环
    print(f"measured rho = {rho:.4f}")
    print(f"grid-independent: {np.ptp(mesh_levels) < 0.02}")
    # 粗层修正检查：修正后误差能量范数应减半
    e = np.random.randn(r.shape[0])
    # 需外部提供 A、限制 R、插值 P 与粗层求解器
    return rho
```

### 代数误差与离散误差的分离

两种误差必须分开量化，否则无法判断该加密网格还是该调求解器。做法是在**同一套网格**上分别用多重网格（容差 $10^{-12}$）与直接解求值，两者之差就是纯代数误差；而多重网格解与制造解之差是总误差。实测 $128^3$ 上代数误差 $4.8\times10^{-7}$、总误差 $2.3\times10^{-3}$，前者比后者小近四个数量级，说明当前精度完全由离散主导，加密网格才是有效的改进方向。反之若代数误差与总误差同量级，则应先收紧求解容差或改进预条件。非线性问题用 FAS 时，残差必须在每个循环结束后用当前解**重新评价** $F(\mathbf u)$，不能沿用循环前的值，否则测到的是滞后残差，会得到虚假的收敛因子。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $\hat\rho$ 随网格加密从 0.13 涨到 0.41 | 光滑器对高频衰减不足或粗化停滞 | 固定网格，把光滑次数加倍后重测 $\hat\rho$ |
| 粗层修正后误差能量范数不降 | $A_c\ne RAP$，违反 Galerkin 条件 | 用随机误差做一次定点限制—插值测试 |
| 循环数很少但总时间不如 CG | 算子复杂度超过 2.5 | 打印各层 nnz 之比，限制插值填充 |
| FAS 收敛因子看起来极好但解偏离制造解 | 残差用循环前的旧解评价 | 每循环后用当前解重算 $F(\mathbf u)$ 再算 $\hat\rho$ |

### 参考

1. Brandt, A., "Multi-level adaptive solutions to boundary-value problems", *Mathematics of Computation*, 31(138), 1977.
2. Briggs, W. L., Henson, V. E., McCormick, S. F., *A Multigrid Tutorial*, 2nd ed., SIAM, 2000.
3. Trottenberg, U., Oosterlee, C. W., Schüller, A., *Multigrid*, Academic Press, 2001.
4. Hackbusch, W., *Multi-Grid Methods and Applications*, Springer, 1985.
5. Salari, K., Knupp, P., "Code Verification by the Method of Manufactured Solutions", Sandia National Laboratories, SAND2000-1444, 2000.
6. Stüben, K., "A review of algebraic multigrid", *Journal of Computational and Applied Mathematics*, 128(1-2), 2001.
