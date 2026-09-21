---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-linear-solvers-modeling
title: "fvSolution 线性求解器：设置机理与适用范围"
summary: "从隐式离散产生的代数方程组出发，解释压力方程的对称性与动量方程的非对称性如何决定求解器选型，用条件数推导 CG 迭代次数估计，并说明 GAMG 多重网格的适用条件。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "fvSolution 线性求解器"
  - "设置机理与适用范围"
  - "GAMG"
  - "共轭梯度"
seo:
  title: "fvSolution 线性求解器：设置机理与适用范围"
  description: "从隐式离散产生的代数方程组出发，解释压力方程的对称性与动量方程的非对称性如何决定求解器选型，用条件数推导 CG 迭代次数估计，并说明 GAMG 多重网格的适用条件。"
  keywords:
    - "fvSolution 线性求解器"
    - "设置机理与适用范围"
    - "GAMG 多重网格"
    - "条件数"
    - "共轭梯度迭代"
---

# fvSolution 线性求解器：设置机理与适用范围

`fvSolution` 的 `solvers` 段决定每个隐式方程用哪种 Krylov 方法、哪种预条件器、以及什么时候停止。选错求解器不会让解变错，只会让迭代数爆炸或在容差处提前停下，留下一个看起来收敛实际没解开的代数系统。本文从矩阵性质出发说明压力为什么用 GAMG、速度为什么用 PBiCGStab，并给出由条件数估算迭代次数的可核对算例。

## 隐式离散产生的矩阵长什么样

任何隐式离散都把偏微分方程变成线性方程组：

$$
A\,\phi=b,\qquad r_k=b-A\phi_k
$$

$A$ 是稀疏矩阵，每行非零元个数等于单元的邻居数加对角。矩阵性质由方程类型决定：压力方程经 Rhie–Chow 处理后是对称正定的，条件数随网格尺寸按 $\mathcal{O}(h^{-2})$ 增长；动量方程含对流项，系数 $a_E=D-F/2$ 与 $a_W=D+F/2$ 不相等，矩阵非对称。这一条直接决定了选型：对称正定用 PCG，非对称用 PBiCGStab，两者不能互换。

迭代法的收敛速度由条件数 $\kappa=\|A\|\,\|A^{-1}\|$ 控制。共轭梯度法的经典界为

$$
\frac{\|e_k\|_A}{\|e_0\|_A}\le2\left(\frac{\sqrt{\kappa}-1}{\sqrt{\kappa}+1}\right)^{k}
$$

把它反过来解出达到给定误差所需的迭代数，就能事先估计成本。

## 迭代次数的手算估计

设要 $\|e_k\|_A/\|e_0\|_A\le10^{-6}$。若不加预条件，压力矩阵在 $100\times100$ 网格上的 $\kappa\approx10^4$，则收缩因子为 $(\sqrt{10^4}-1)/(\sqrt{10^4}+1)=99/101=0.9802$，需要

$$
k\ge\frac{\log\left(10^{-6}/2\right)}{\log 0.9802}=\frac{-14.51}{-0.0200}=726
$$

即约 726 次迭代。加上代数多重网格预条件后等效条件数可降到 $\kappa\approx10^2$，收缩因子变为 $9/11=0.8182$，需要 $k\ge -14.51/\log 0.8182=72$ 次，成本降一个数量级。这就是压力方程默认用 GAMG 的原因——不是 GAMG 精度更高，而是它把 $\kappa$ 压下来。

```text
目标: ||e_k||/||e_0|| <= 1e-6, 即 log(5e-7) = -14.51
无预条件  kappa = 1e4 : rho = 99/101  = 0.9802 → k ≈ 726
GAMG      kappa = 1e2 : rho = 9/11    = 0.8182 → k ≈ 72
结论: 预条件器的作用是把 kappa 从 O(h^-2) 拉回 O(1) 量级
```

## GAMG 与 PBiCGStab 的分工

| 求解器 | 要求矩阵 | 典型用于 | 关键参数 |
|---|---|---|---|
| `PCG` | 对称正定 | 压力、拉普拉斯类标量 | `preconditioner DIC` |
| `PBiCGStab` | 非对称 | 速度、湍流量、组分 | `preconditioner DILU` |
| `GAMG` | 对称，可处理非对称 | 压力方程 | `nCoarsestCells`、`smootherGaussSeidel` |
| `smoothSolver` | 任意 | 便宜场、松弛迭代 | `sweeps` |

一个覆盖不可压缩求解器的配置骨架：

```cpp
solvers
{
    p
    {
        solver          GAMG;
        tolerance       1e-7;
        relTol          0.01;
        smoother        GaussSeidel;
        nCoarsestCells  1000;
        nPreSweeps      0;
        nPostSweeps     2;
    }
    pFinal
    {
        $p;
        tolerance       1e-7;
        relTol          0;
    }
    "(U|k|epsilon|omega)"
    {
        solver          PBiCGStab;
        preconditioner  DILU;
        tolerance       1e-8;
        relTol          0.1;
    }
    "(U|k|epsilon|omega)Final"
    {
        $U;
        tolerance       1e-8;
        relTol          0;
    }
}
```

`relTol` 是相对首次残差的收敛门槛：迭代在残差降到 `tolerance` 或首次残差的 `relTol` 倍时停止，取两者中较松的那个。外迭代中每步都要解一次压力，用 `relTol 0.01` 可以省掉大量无意义的精解；只在最后一个外迭代用 `Final` 版本把 `relTol` 压到 0，保证最终解是真正解开的。

## GAMG 的适用边界

GAMG 依赖几何上的粗细网格层次，对高度各向异性或长宽比极大的网格，粗化过程会把单元聚成薄片，光滑效果急剧下降。判据是长宽比：低于 100 时 GAMG 通常表现良好；超过 1000 时应改用 `PCG` 配 `DIC`，或者先做网格各向同性化。另一个边界是并行：GAMG 的粗化在处理器交界处会产生额外通信，进程数超过约 512 后加速比明显下降，此时可以考虑 `PCG`。

`nCoarsestCells` 控制粗化停止条件，取 1000 意味着最粗层至少 1000 个单元。取值过小会让最粗层求解变得昂贵，过大则层数不足、预条件效果下降。一般按总单元数的千分之一量级设置：$2\times10^6$ 单元的算例取 2000 是合理起点。

## 求解器配置的失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力迭代数从 20 跳到 500 | 预条件器与矩阵类型不匹配 | 确认压力用对称求解器，检查是否误用 `DILU` |
| `solver did not converge` 出现在 `Final` | `relTol` 未压到 0 | 检查 `Final` 段是否用 `$p` 继承并覆盖 `relTol` |
| GAMG 在并行下加速比很低 | 粗层通信占比过高 | 对比 64 与 512 进程的每步耗时 |
| 迭代数随网格加密线性增长 | 未使用多重网格预条件 | 记录不同网格上的平均迭代数，看是否随 $h^{-1}$ 增长 |

求解器的职责只是把给定矩阵解到给定容差。若换求解器能让物理量变化，说明原设置根本没有解到收敛，问题在容差而不是求解器本身。

## 参考文献

1. Saad Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
2. Barrett R., Berry M., Chan T.F., et al., *Templates for the Solution of Linear Systems: Building Blocks for Iterative Methods*, SIAM, 1994.
3. Henson V.E., Yang U.M., *BoomerAMG: a parallel algebraic multigrid solver and preconditioner*, Applied Numerical Mathematics, 41(1), 155–177, 2002.
4. Van der Vorst H.A., *Bi-CGSTAB: a fast and smoothly converging variant of Bi-CG for the solution of nonsymmetric linear systems*, SIAM Journal on Scientific and Statistical Computing, 13(2), 631–644, 1992.
5. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
6. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.5 Solution and Algorithm Control, 2024.
