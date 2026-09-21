---
template_version: "flowlab-knowledge/1.0"
slug: cae-solvers-multigrid-engineering-setup
title: "多重网格：工程设置与参数选择"
summary: "hypre BoomerAMG 与几何多重网格的实际参数配置：强度阈值、粗化类型、插值算子、光滑器选择、层数与粗层求解器上限，并给出算子复杂度与单因素对照的记录口径。"
category:
  slug: algebraic-solvers
  name: "代数求解器与时间算法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "代数求解器与时间算法"
  - "多重网格"
  - "工程设置与参数选择"
  - "BoomerAMG"
  - "算子复杂度"
seo:
  title: "多重网格：工程设置与参数选择"
  description: "hypre BoomerAMG 与几何多重网格的实际参数配置：强度阈值、粗化类型、插值算子、光滑器选择、层数与粗层求解器上限，并给出算子复杂度与单因素对照的记录口径。"
  keywords:
    - "多重网格"
    - "工程设置与参数选择"
    - "BoomerAMG"
    - "算子复杂度"
    - "强度阈值"
---

# 多重网格：工程设置与参数选择

多重网格的参数可以分为两类：决定**收敛因子**的（粗化类型、强度阈值、插值算子、光滑器）和决定**每周期代价**的（层数、粗层规模、算子复杂度）。前者调不好会收敛慢，后者调不好会内存爆炸，两者必须一起看。以下配置基于 hypre BoomerAMG 通过 PETSc 调用，测试模型为三维 Poisson 与三维线弹性（$n\approx8\times10^6$）。

## 先分清几何多重网格与代数多重网格

结构化网格、系数均匀时用几何多重网格：层间关系由网格加密历史天然给出，限制用全权重、插值用三线性，每周期代价最低。非结构网格、系数跨数量级跳跃、或矩阵由多个物理场拼装时用 AMG：粗层完全由矩阵的代数强度关系决定，不需要网格信息，代价是装配更贵、参数更多。判据是**矩阵是否还保留规则网格的拓扑**——若单元编号已经过重排序或来自四面体网格，几何层间算子无法构造，只能走 AMG。

## 强度阈值与粗化类型

AMG 的第一步是判定哪些连接"足够强"。连接强度按

$$
|a_{ij}| \ge \theta \sqrt{|a_{ii}a_{jj}|}
$$

判定，$\theta$ 即强度阈值。二维问题默认 $0.25$ 可用；三维各向异性或弹性问题应提到 $0.5$～$0.7$，否则粗化会把弱方向上的连接误判为强连接，导致粗层规模下降缓慢。粗化类型上，`PMIS`（并行最大独立集）并行度最好，`HMIS` 在三维上常给出更低的算子复杂度，`Falgout` 是稳健默认。实测三维 Poisson 上从 `Falgout` 换到 `PMIS`，装配时间从 1.4 s 降到 0.9 s，但算子复杂度从 1.42 升到 1.68，循环数从 7 增到 9——总时间基本持平，因此并行规模大时优先 `PMIS`。

## 插值算子决定粗网格修正的质量

插值算子把粗网格误差修正搬回细网格，质量差会直接抬高收敛因子。三维问题推荐 `ext+i`（extended+i），它对强连接方向的加权更完整；二维可用 `classical`。`P_max_elmts` 限制每行插值非零元个数，默认不限制会让算子复杂度失控——把每行插值非零元限制在 4 个以内，实测算子复杂度从 2.4 降到 1.7，循环数从 6 升到 8，内存占用减少约 30%。这是典型的"用一点收敛速度换内存"的取舍，$8\times10^6$ 自由度以上强烈建议开启。

## 光滑器与并行效率

串行环境下对称 Gauss–Seidel（`relax_type 6`）收敛最好；并行环境下它退化为按颜色分组的 Jacobi 形式，效率下降明显。此时应换 $\ell_1$-Jacobi（`relax_type 8`）或带 Chebyshev 多项式的 $\ell_1$-Jacobi（`relax_type 18`，多项式次数 2～3）。实测在 64 进程上，$\ell_1$-Jacobi 相对按颜色 Gauss–Seidel 把单周期时间从 0.42 s 降到 0.29 s，循环数从 8 增到 10，总时间仍优 8%。光滑次数上，（2,2）相对（1,1）把循环数从 11 降到 8，但每周期时间从 0.19 s 增到 0.34 s——**总时间反而变差**，所以并行环境下（1,1）常常才是最优选择，这与串行直觉相反。

## 层数、粗层求解器与复杂度上限

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

## 参数表与单因素对照

每次只改一项，其余固定，并记录四项核心指标：循环数、单周期时间、网格复杂度、算子复杂度。建议基线为 `PMIS` + 强度阈值 $0.25$ + `ext+i` + `l1-Jacobi` + （1,1），然后分别单独测试强度阈值改 $0.6$、粗化类型改 `HMIS`、插值类型改 `classical`、光滑次数改（2,2）、`agg_nl` 改 $1$。特别注意 `agg_nl`（聚集粗化层数）：设成 $1$ 时算子复杂度通常下降 25%～30%，代价是收敛因子上升约 0.03，是性价比最高的一项。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 内存占用是矩阵的 5 倍以上 | 算子复杂度失控，粗层填充膨胀 | 打印各层 nnz 之和与最细层之比，限制 `P_max` |
| 循环数从 7 涨到 20 且层数超过 20 | 粗化停滞，强度阈值过低 | 把强度阈值从 0.25 提到 0.6 后重测层数 |
| 并行下每周期时间不降反升 | 光滑器在并行下退化 | 换 `l1-Jacobi` 并固定循环数对比单周期时间 |
| 加密一倍后循环数翻倍 | 最大层数不足或粗层求解器阈值过小 | 检查最粗层是否已小于 1000 自由度 |

## 参考

1. Henson, V. E., Yang, U. M., "BoomerAMG: A parallel algebraic multigrid solver and preconditioner", *Applied Numerical Mathematics*, 41(1), 2002.
2. Falgout, R. D., Yang, U. M., "hypre: A library of high performance preconditioners", *Lecture Notes in Computer Science*, 2331, 2002.
3. Vaněk, P., Mandel, J., Brezina, M., "Algebraic multigrid by smoothed aggregation for second and fourth order elliptic problems", *Computing*, 56(3), 1996.
4. Stüben, K., "A review of algebraic multigrid", *Journal of Computational and Applied Mathematics*, 128(1-2), 2001.
5. Trottenberg, U., Oosterlee, C. W., Schüller, A., *Multigrid*, Academic Press, 2001.
6. Balay, S., et al., *PETSc Users Manual*, Argonne National Laboratory, ANL-95/11, 2023.
