---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-linear-solvers-engineering-setup
title: "fvSolution 线性求解器：工程设置与参数选择"
summary: "按方程类型给出求解器与预条件器的选型表、tolerance 与 relTol 的取值依据、GAMG 参数与 Final 段写法，并用迭代数随网格的缩放关系估算成本，附可复现的 fvSolution 模板。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "fvSolution 线性求解器"
  - "工程设置与参数选择"
  - "relTol"
  - "GAMG"
seo:
  title: "fvSolution 线性求解器：工程设置与参数选择"
  description: "按方程类型给出求解器与预条件器的选型表、tolerance 与 relTol 的取值依据、GAMG 参数与 Final 段写法，并用迭代数随网格的缩放关系估算成本，附可复现的 fvSolution 模板。"
  keywords:
    - "fvSolution 线性求解器"
    - "工程设置与参数选择"
    - "relTol 取值"
    - "GAMG 参数"
    - "Final 段"
---

# fvSolution 线性求解器：工程设置与参数选择

`fvSolution` 里真正需要斟酌的数字只有两类：`tolerance` 和 `relTol`。前者决定代数误差的绝对下限，后者决定外迭代过程中愿意接受的相对收敛程度。其余参数（求解器、预条件器、GAMG 层数）都有明确的选型规则。本文给出按方程分档的选型表、容差的取值依据、可复现模板，以及用迭代数缩放估算成本的算例。

## 容差的语义与取值

迭代在满足下式时停止：

$$
\|r_k\|_2\le\max\left(\text{tolerance},\ \text{relTol}\cdot\|r_0\|_2\right)
$$

两个参数是或的关系，先满足哪个就停。`tolerance` 通常取机器精度允许的绝对下限：双精度、场量量级为 $\mathcal{O}(1)$ 时取 $10^{-8}\sim10^{-7}$；压力残差被归一化后量级更小，取 $10^{-7}$ 足够。`relTol` 是省时间的主要手段：外迭代中每步都要重解压力，取 `0.1` 意味着只把残差降一个数量级就交差，可以省掉七成以上的迭代；到了最后一个外迭代，用 `Final` 版本把 `relTol` 压到 `0`，保证交付解是真正解开的。

一个常见错误是只写 `pFinal` 而忘了给 `p` 设 `relTol`，结果每个外迭代都精解到 $10^{-8}$，成本翻几倍却没有任何精度收益。另一个错误是 `Final` 段用 `$p` 继承时忘了覆盖 `relTol`，导致最终解仍停在相对容差上，表现为残差曲线在末步出现台阶。

## 按方程分档选型

| 方程 | 求解器 | 预条件器 | `tolerance` | `relTol` |
|---|---|---|---|---|
| `p`（压力） | `GAMG` | `GaussSeidel` 光滑 | `1e-7` | `0.01` |
| `pFinal` | `GAMG` | 同上 | `1e-7` | `0` |
| `U`、`k`、`epsilon`、`omega` | `PBiCGStab` | `DILU` | `1e-8` | `0.1` |
| `*Final` | `PBiCGStab` | `DILU` | `1e-8` | `0` |
| 组分 `Yi` | `PBiCGStab` | `DILU` | `1e-8` | `0.1` |
| 相分数 `alpha` | `PBiCGStab` | `DILU` | `1e-8` | `0.1` |

压力用 `GAMG` 的理由是它把等效条件数从 $\mathcal{O}(h^{-2})$ 压到 $\mathcal{O}(1)$ 量级，迭代数不再随网格加密而线性增长。速度类方程矩阵非对称，只能用 `PBiCGStab` 系；若误用 `PCG`，求解器会在第一次迭代就报矩阵非对称错误。

## 一份可复现的 fvSolution

```cpp
solvers
{
    p
    {
        solver          GAMG;
        tolerance       1e-7;
        relTol          0.01;
        smoother        GaussSeidel;
        cacheAgglomeration true;
        nCellsInCoarsestLevel 1000;
        agglomerator    faceAreaPair;
        mergeLevels     1;
    }
    pFinal { $p; relTol 0; }

    "(U|k|epsilon|omega)"
    {
        solver          PBiCGStab;
        preconditioner  DILU;
        tolerance       1e-8;
        relTol          0.1;
    }
    "(U|k|epsilon|omega)Final" { $U; relTol 0; }
}
```

改完字典后先离线核对继承关系，再启动求解器，避免跑几个小时才发现 `Final` 段写错：

```bash
foamDictionary -entry solvers.pFinal.relTol -value system/fvSolution   # 期望输出 0
foamDictionary -entry solvers.UFinal.tolerance -value system/fvSolution
foamRun -solver incompressibleFluid 2>&1 | tee log.foamRun
grep "Solving for p" log.foamRun | tail -20   # 看末步迭代数与最终残差
```

## 迭代数如何随网格增长

对共轭梯度类方法，迭代数满足

$$
N_{iter}\propto\sqrt{\kappa}\propto\frac{L}{h}
$$

$L$ 是计算域特征长度，$h$ 是网格尺寸。用 `PCG` 解压力时，若 $100\times100$ 网格上平均 20 次迭代，加密到 $400\times400$（$h$ 缩小 4 倍）就需要约 80 次。而用 GAMG 时这个线性增长基本消失，$100\times100$ 与 $400\times400$ 的平均迭代数都在 10～20 之间。这就是大网格算例必须用多重网格的量化依据：$2\times10^6$ 单元的压力方程若用 `PCG`，单步迭代数可能到几百，整算例时间会长出数倍。

GAMG 参数按下面的规则取：`nCellsInCoarsestLevel` 取总单元数的千分之一量级，$2\times10^6$ 单元取 2000；`mergeLevels 1` 是默认值，只在粗化过快导致精度下降时提到 2；`cacheAgglomeration true` 在并行下通常更快，但内存占用上升。

## 求解器与容差的三轮对照

| 轮次 | 改动项 | 固定项 | 记录量 |
|---|---|---|---|
| S0 | `p` 用 `PCG` + `DIC` | 网格、格式、松弛 | 平均迭代数、单步耗时 |
| S1 | 仅把 `p` 换成 `GAMG` | 其余全部 | 同上，对比加速比 |
| S2 | 仅把 `p` 的 `relTol` 从 0.01 改到 0.1 | 其余全部 | 目标量、总耗时 |
| S3 | 仅把 `pFinal` 的 `relTol` 从 0 改到 0.01 | 其余全部 | 末步残差台阶、目标量漂移 |

S2 若目标量变化超过工程容差，说明 `relTol 0.1` 太松；S3 用来量化"最终解没解干净"的代价，若目标量漂移超过 0.5%，说明 `Final` 段的 `relTol` 必须保持 0。

## 容差与迭代数的记录

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 每个外迭代都跑几百次压力迭代 | `p` 段缺 `relTol` | `foamDictionary` 查 `solvers.p.relTol` 是否存在 |
| 末步残差出现台阶 | `Final` 段继承了非零 `relTol` | 查 `pFinal.relTol` 是否为 0 |
| `PCG` 报非对称矩阵 | 求解器与方程类型不匹配 | 速度类方程改 `PBiCGStab` |
| 并行加速比在 512 进程后下降 | GAMG 粗层通信占比过高 | 对比 128 与 512 进程的单步耗时 |
| 迭代数随网格线性增长 | 未启用多重网格预条件 | 记录两档网格的平均迭代数，检查是否随 $L/h$ 增长 |

容差参数必须与网格规模一起记录。把 $10^5$ 单元上调好的 `relTol` 直接搬到 $10^7$ 单元算例，代数误差的绝对量级会随之放大，原本可接受的相对容差可能已经不够。

## 参考文献

1. Saad Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
2. Henson V.E., Yang U.M., *BoomerAMG: a parallel algebraic multigrid solver and preconditioner*, Applied Numerical Mathematics, 41(1), 155–177, 2002.
3. Van der Vorst H.A., *Bi-CGSTAB: a fast and smoothly converging variant of Bi-CG for the solution of nonsymmetric linear systems*, SIAM Journal on Scientific and Statistical Computing, 13(2), 631–644, 1992.
4. Barrett R., Berry M., Chan T.F., et al., *Templates for the Solution of Linear Systems: Building Blocks for Iterative Methods*, SIAM, 1994.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.5 Solution and Algorithm Control, 2024.
6. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
