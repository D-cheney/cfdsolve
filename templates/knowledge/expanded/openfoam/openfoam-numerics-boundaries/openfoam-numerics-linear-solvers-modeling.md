---
template_version: flowlab-knowledge/1.0
slug: openfoam-numerics-linear-solvers-modeling
title: fvSolution 线性求解器：原理、设置与验证
summary: >-
  从隐式离散产生的代数方程组出发，解释压力方程的对称性与动量方程的非对称性如何决定求解器选型，用条件数推导 CG 迭代次数估计，并说明 GAMG
  多重网格的适用条件。
category:
  slug: openfoam-numerics-boundaries
  name: OpenFOAM 边界与数值设置
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 边界与数值设置
  - fvSolution 线性求解器
  - 设置机理与适用范围
  - GAMG
  - 共轭梯度
  - 工程设置与参数选择
  - relTol
  - 结果诊断与可信度验证
  - 条件数
  - 残差归一化
seo:
  title: fvSolution 线性求解器：原理、设置与验证
  description: >-
    从隐式离散产生的代数方程组出发，解释压力方程的对称性与动量方程的非对称性如何决定求解器选型，用条件数推导 CG 迭代次数估计，并说明 GAMG
    多重网格的适用条件。
  keywords:
    - fvSolution 线性求解器
    - 设置机理与适用范围
    - GAMG 多重网格
    - 条件数
    - 共轭梯度迭代
    - 工程设置与参数选择
    - relTol 取值
    - GAMG 参数
    - Final 段
    - 结果诊断与可信度验证
    - 条件数误差上界
    - 残差归一化
    - 代数误差
---
# fvSolution 线性求解器：原理、设置与验证

`fvSolution` 的 `solvers` 段决定每个隐式方程用哪种 Krylov 方法、哪种预条件器、以及什么时候停止。选错求解器不会让解变错，只会让迭代数爆炸或在容差处提前停下，留下一个看起来收敛实际没解开的代数系统。`fvSolution` 里真正需要斟酌的数字只有两类：`tolerance` 和 `relTol`。前者决定代数误差的绝对下限，后者决定外迭代过程中愿意接受的相对收敛程度。其余参数（求解器、预条件器、GAMG 层数）都有明确的选型规则。日志里 `Final residual = 4.2e-09` 看起来非常干净，但这个数只说明当前迭代步的残差小，并不保证解的误差小。残差与真实误差之间差着一个条件数因子，在坏网格或强耦合算例上这个因子可以达到 $10^6$。

## 按方程分档选型

压力用 `GAMG` 的理由是它把等效条件数从 $\mathcal{O}(h^{-2})$ 压到 $\mathcal{O}(1)$ 量级，迭代数不再随网格加密而线性增长。速度类方程矩阵非对称，只能用 `PBiCGStab` 系；若误用 `PCG`，求解器会在第一次迭代就报矩阵非对称错误。

| 方程 | 求解器 | 预条件器 | `tolerance` | `relTol` |
|---|---|---|---|---|
| `p`（压力） | `GAMG` | `GaussSeidel` 光滑 | `1e-7` | `0.01` |
| `pFinal` | `GAMG` | 同上 | `1e-7` | `0` |
| `U`、`k`、`epsilon`、`omega` | `PBiCGStab` | `DILU` | `1e-8` | `0.1` |
| `*Final` | `PBiCGStab` | `DILU` | `1e-8` | `0` |
| 组分 `Yi` | `PBiCGStab` | `DILU` | `1e-8` | `0.1` |
| 相分数 `alpha` | `PBiCGStab` | `DILU` | `1e-8` | `0.1` |

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

| 求解器 | 要求矩阵 | 典型用于 | 关键参数 |
|---|---|---|---|
| `PCG` | 对称正定 | 压力、拉普拉斯类标量 | `preconditioner DIC` |
| `PBiCGStab` | 非对称 | 速度、湍流量、组分 | `preconditioner DILU` |
| `GAMG` | 对称，可处理非对称 | 压力方程 | `nCoarsestCells`、`smootherGaussSeidel` |
| `smoothSolver` | 任意 | 便宜场、松弛迭代 | `sweeps` |

## 容差的语义与取值

迭代在满足下式时停止：

$$
\|r_k\|_2\le\max\left(\text{tolerance},\ \text{relTol}\cdot\|r_0\|_2\right)
$$

两个参数是或的关系，先满足哪个就停。`tolerance` 通常取机器精度允许的绝对下限：双精度、场量量级为 $\mathcal{O}(1)$ 时取 $10^{-8}\sim10^{-7}$；压力残差被归一化后量级更小，取 $10^{-7}$ 足够。`relTol` 是省时间的主要手段：外迭代中每步都要重解压力，取 `0.1` 意味着只把残差降一个数量级就交差，可以省掉七成以上的迭代；到了最后一个外迭代，用 `Final` 版本把 `relTol` 压到 `0`，保证交付解是真正解开的。

一个常见错误是只写 `pFinal` 而忘了给 `p` 设 `relTol`，结果每个外迭代都精解到 $10^{-8}$，成本翻几倍却没有任何精度收益。另一个错误是 `Final` 段用 `$p` 继承时忘了覆盖 `relTol`，导致最终解仍停在相对容差上，表现为残差曲线在末步出现台阶。

## GAMG 的适用边界

GAMG 依赖几何上的粗细网格层次，对高度各向异性或长宽比极大的网格，粗化过程会把单元聚成薄片，光滑效果急剧下降。判据是长宽比：低于 100 时 GAMG 通常表现良好；超过 1000 时应改用 `PCG` 配 `DIC`，或者先做网格各向同性化。另一个边界是并行：GAMG 的粗化在处理器交界处会产生额外通信，进程数超过约 512 后加速比明显下降，此时可以考虑 `PCG`。

`nCoarsestCells` 控制粗化停止条件，取 1000 意味着最粗层至少 1000 个单元。取值过小会让最粗层求解变得昂贵，过大则层数不足、预条件效果下降。一般按总单元数的千分之一量级设置：$2\times10^6$ 单元的算例取 2000 是合理起点。

## 条件数、容差与迭代次数的换算

误差上界要能用，先得把 $\kappa$ 估出来。结构化网格上离散 Laplace 算子的最小特征值随域长与最小单元尺寸之比的平方下降，最大特征值固定在 $O(h_{\min}^{-2})$ 量级，于是压力矩阵的条件数可写成

$$
\kappa(A)\approx 0.405\left(\frac{L}{h_{\min}}\right)^{2}
$$

取流动方向域长 $L=1.0\ \mathrm{m}$、壁面首层厚度 $h_{\min}=6.3\times10^{-4}\ \mathrm{m}$，得 $L/h_{\min}=1.6\times10^{3}$，

$$
\kappa(A)\approx 0.405\times\left(1.6\times10^{3}\right)^{2}=1.0\times10^{6}
$$

这正是边界层网格上压力矩阵的典型量级。由误差上界反解，要把压力解的相对误差压到 $1.0\times10^{-4}$，相对残差必须满足

$$
\frac{\|r\|}{\|b\|}\le\frac{1.0\times10^{-4}}{1.0\times10^{6}}=1.0\times10^{-10}
$$

所以 `p` 的 `tolerance` 停在 `1e-8` 时，即便日志显示收敛，压力误差仍可能达 $1.0\times10^{-2}$。把首层厚度放大到 $6.3\times10^{-3}\ \mathrm{m}$，$L/h_{\min}$ 降到 $1.6\times10^{2}$，$\kappa$ 按平方律降到 $1.0\times10^{4}$，所需残差相应放宽到 $1.0\times10^{-8}$：容差是网格长宽比的函数，不是习惯值。

迭代数同样能算。共轭梯度法满足

$$
k_{\mathrm{CG}}\approx\frac{1}{2}\sqrt{\kappa}\,\ln\frac{2}{\varepsilon}
$$

取 $\kappa=1.0\times10^{6}$、$\varepsilon=1.0\times10^{-10}$，得 $\sqrt{\kappa}=1.0\times10^{3}$、$\ln(2/\varepsilon)=23.7$，故 $k_{\mathrm{CG}}\approx0.5\times1.0\times10^{3}\times23.7=1.2\times10^{4}$，一万次以上在工程上不可接受。GAMG 把有效条件数压到 $O(10)$，$\sqrt{\kappa}\approx3.2$，同精度下 $k_{\mathrm{CG}}\approx0.5\times3.2\times23.7=3.8\times10^{1}$，与日志中 `p` 的 15～40 次吻合。反过来，迭代数从几十次跳到几百次，说明预条件失效或长宽比恶化，而不是算例本身变难。

## 迭代数如何随网格增长

对共轭梯度类方法，迭代数满足

$$
N_{iter}\propto\sqrt{\kappa}\propto\frac{L}{h}
$$

$L$ 是计算域特征长度，$h$ 是网格尺寸。用 `PCG` 解压力时，若 $100\times100$ 网格上平均 20 次迭代，加密到 $400\times400$（$h$ 缩小 4 倍）就需要约 80 次。而用 GAMG 时这个线性增长基本消失，$100\times100$ 与 $400\times400$ 的平均迭代数都在 10～20 之间。这就是大网格算例必须用多重网格的量化依据：$2\times10^6$ 单元的压力方程若用 `PCG`，单步迭代数可能到几百，整算例时间会长出数倍。

GAMG 参数按下面的规则取：`nCellsInCoarsestLevel` 取总单元数的千分之一量级，$2\times10^6$ 单元取 2000；`mergeLevels 1` 是默认值，只在粗化过快导致精度下降时提到 2；`cacheAgglomeration true` 在并行下通常更快，但内存占用上升。

## 求解器与容差的三轮对照

S2 若目标量变化超过工程容差，说明 `relTol 0.1` 太松；S3 用来量化"最终解没解干净"的代价，若目标量漂移超过 0.5%，说明 `Final` 段的 `relTol` 必须保持 0。

| 轮次 | 改动项 | 固定项 | 记录量 |
|---|---|---|---|
| S0 | `p` 用 `PCG` + `DIC` | 网格、格式、松弛 | 平均迭代数、单步耗时 |
| S1 | 仅把 `p` 换成 `GAMG` | 其余全部 | 同上，对比加速比 |
| S2 | 仅把 `p` 的 `relTol` 从 0.01 改到 0.1 | 其余全部 | 目标量、总耗时 |
| S3 | 仅把 `pFinal` 的 `relTol` 从 0 改到 0.01 | 其余全部 | 末步残差台阶、目标量漂移 |

## 故障模式与判定试验

求解器的职责只是把给定矩阵解到给定容差。若换求解器能让物理量变化，说明原设置根本没有解到收敛，问题在容差而不是求解器本身。

诊断顺序是：先确认没有 `solver did not converge`，再确认 `Final residual` 达到量级要求，然后用小网格直接解量化代数误差，最后才把剩余偏差归给离散或模型误差。把这三步倒过来做，很容易把代数误差误判成物理效应。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力迭代数从 20 跳到 500 | 预条件器与矩阵类型不匹配 | 确认压力用对称求解器，检查是否误用 `DILU` |
| `solver did not converge` 出现在 `Final` | `relTol` 未压到 0 | 检查 `Final` 段是否用 `$p` 继承并覆盖 `relTol` |
| GAMG 在并行下加速比很低 | 粗层通信占比过高 | 对比 64 与 512 进程的每步耗时 |
| 迭代数随网格加密线性增长 | 未使用多重网格预条件 | 记录不同网格上的平均迭代数，看是否随 $h^{-1}$ 增长 |
| 压力迭代数突然从 15 涨到 400 | 预条件器与矩阵不匹配或出现坏单元 | 定位最大长宽比单元，同时检查求解器类型 |
| 末步 `Final residual` 出现台阶 | `Final` 段继承了非零 `relTol` | `foamDictionary` 查 `pFinal.relTol` 是否为 0 |
| 残差很低但目标量仍在漂移 | 残差小不等于误差小，$\kappa$ 大 | 用小网格直接解界定代数误差量级 |
| 迭代数随网格加密线性增长 | 未启用多重网格 | 记录两档网格的平均迭代数，对比 $L/h$ 缩放 |
| `solver did not converge` 出现在中间步 | 时间步过大导致矩阵病态 | 减小 `maxCo` 或提高 `nNonOrthogonalCorrectors` |
| 不同场残差不可比 | 混淆了归一化与绝对残差 | 统一用 `Initial residual` 做横向比较 |

## 残差小不等于误差小

对 $A\phi=b$，第 $k$ 步的误差与残差满足

$$
\frac{\|e_k\|_2}{\|\phi\|_2}\le\kappa(A)\,\frac{\|r_k\|_2}{\|b\|_2},\qquad \kappa(A)=\|A\|_2\|A^{-1}\|_2
$$

这是一条上界，不是等式，但它给出了最坏情况的量级。举一个可核对的数：压力矩阵在长宽比 200 的边界层网格上 $\kappa\approx10^6$，若日志报告相对残差 $10^{-8}$，则相对误差上界为 $10^6\times10^{-8}=10^{-2}$，即 1%。也就是说，残差降到 $10^{-8}$ 的"收敛"解，其压力值仍可能有 1% 的误差。要把误差压到 $10^{-4}$，必须把残差降到 $10^{-10}$，或者把 $\kappa$ 降下来——后者靠改进网格或换更强的预条件器。

上界依赖 $\kappa$ 的估计，而 $\kappa$ 本身很难准确算出。更实用的替代量是范数型后向误差，它不依赖 $\kappa$：

$$
\eta_k=\frac{\|r_k\|_2}{\|A\|_2\|\phi_k\|_2+\|b\|_2}
$$

$\eta_k$ 的含义是"计算解是某个相对扰动为 $\eta_k$ 的邻近系统的精确解"。$\eta_k$ 达到机器精度量级（双精度约 $10^{-16}$）说明线性系统已被解到极限；$\eta_k$ 停在 $10^{-6}$ 说明矩阵或右端项本身的量级导致残差无法再降，继续迭代没有意义。这个量比单纯看残差绝对值更能说明"是否还值得继续迭代"。

```
算例: 边界层网格, 长宽比 200, 压力矩阵 kappa ≈ 1e6
目标: 相对误差 <= 1e-4
需要: ||r||/||b|| <= 1e-4 / 1e6 = 1e-10
若网格长宽比降到 20, kappa ≈ 1e4
需要: ||r||/||b|| <= 1e-8   ← 容差可以放宽两个数量级
结论: 容差的合理取值由 kappa 决定，不由习惯决定
```

## 用直接解界定代数误差

迭代误差到底有多大，可以用一个缩小版算例直接回答：把网格粗化到 $50\times50$ 以内，用 `PCG` 把 `tolerance` 压到 `1e-14`、`relTol` 设为 0，得到一个近似"精确"的代数解；再在同样网格上用生产设置的容差跑一遍，两者之差就是代数误差。若这个差在 $10^{-6}$ 量级，说明生产容差足够；若在 $10^{-3}$ 量级，就必须收紧容差或改进预条件。

这个方法把"代数误差"从"离散误差"里单独剥出来，是唯一不依赖条件数估计的实证手段。它的代价只在于小网格算例的求解成本可以忽略。

## 容差与迭代数的记录

容差参数必须与网格规模一起记录。把 $10^5$ 单元上调好的 `relTol` 直接搬到 $10^7$ 单元算例，代数误差的绝对量级会随之放大，原本可接受的相对容差可能已经不够。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 每个外迭代都跑几百次压力迭代 | `p` 段缺 `relTol` | `foamDictionary` 查 `solvers.p.relTol` 是否存在 |
| 末步残差出现台阶 | `Final` 段继承了非零 `relTol` | 查 `pFinal.relTol` 是否为 0 |
| `PCG` 报非对称矩阵 | 求解器与方程类型不匹配 | 速度类方程改 `PBiCGStab` |
| 并行加速比在 512 进程后下降 | GAMG 粗层通信占比过高 | 对比 128 与 512 进程的单步耗时 |
| 迭代数随网格线性增长 | 未启用多重网格预条件 | 记录两档网格的平均迭代数，检查是否随 $L/h$ 增长 |

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

## 日志里两个残差的口径不同

OpenFOAM 打印的 `Initial residual` 是归一化后的量：对对称求解器，它被除以解项范数；`Final residual` 则是**未归一化**的绝对 L2 残差。这导致两个后果：不同方程的 `Initial residual` 可以横向比较，因为它们被各自归一化过；不同方程的 `Final residual` 不能直接比大小，因为场量纲和量级不同——压力的 $10^{-9}$ 与湍动能的 $10^{-9}$ 不代表同等精度。

诊断时应该看三件事：`No Iterations` 是否稳定、`Initial residual` 是否随外迭代单调下降、以及 `Final residual` 是否达到 `tolerance` 量级。若 `Final residual` 卡在 `tolerance` 之上而迭代数达到 `maxIter`，说明求解器根本没解到位。

```bash
grep -E "Solving for (p|U|k|epsilon)" log.foamRun | tail -40
# 关注字段: Initial residual / Final residual / No Iterations
grep -c "solver did not converge" log.foamRun   # 应为 0
grep "time step continuity errors" log.foamRun | tail -10
```

## 参考资料

1. Saad Y., *Iterative Methods for Sparse Linear Systems*, 2nd ed., SIAM, 2003.
2. Barrett R., Berry M., Chan T.F., et al., *Templates for the Solution of Linear Systems: Building Blocks for Iterative Methods*, SIAM, 1994.
3. Henson V.E., Yang U.M., *BoomerAMG: a parallel algebraic multigrid solver and preconditioner*, Applied Numerical Mathematics, 41(1), 155–177, 2002.
4. Van der Vorst H.A., *Bi-CGSTAB: a fast and smoothly converging variant of Bi-CG for the solution of nonsymmetric linear systems*, SIAM Journal on Scientific and Statistical Computing, 13(2), 631–644, 1992.
5. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
6. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.5 Solution and Algorithm Control, 2024.
7. Golub G.H., Van Loan C.F., *Matrix Computations*, 4th ed., Johns Hopkins University Press, 2013.
8. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
