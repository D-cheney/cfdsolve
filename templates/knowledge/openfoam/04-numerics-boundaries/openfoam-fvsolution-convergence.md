---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-fvsolution-convergence
title: OpenFOAM fvSolution、耦合算法与收敛控制
summary: 说明线性求解器与预条件、tolerance/relTol、SIMPLE/PISO/PIMPLE 控制、松弛和残差控制的作用，建立由残差、守恒、监控量与时间步共同组成的收敛判据及排错顺序。
category: { slug: openfoam-numerics-boundaries, name: OpenFOAM 边界与数值设置 }
level: 工程
reading_minutes: 18
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, fvSolution, SIMPLE, PISO, PIMPLE, 收敛, relTol]
seo:
  title: OpenFOAM fvSolution、耦合算法与收敛控制
  description: 配置线性求解、压力速度耦合和松弛，用残差、守恒和监控量判定收敛并给出排错顺序。
  keywords: [fvSolution, OpenFOAM convergence, PIMPLE, residualControl, relTol]
---

# OpenFOAM fvSolution、耦合算法与收敛控制

`fvSolution` 控制两件事：每个代数方程如何被线性求解，以及方程之间如何在外层迭代中耦合。降低容差不等于提高物理准确性——内层线性误差、外层耦合误差和空间/时间离散误差三者必须匹配，把某一层压到极小而其余层粗糙，只会增加成本而不改善结果。本文给出参数含义、可直接抄用的字典与收敛判据。

## 1. 结论与适用场景

- 稳态问题：用 `SIMPLE`（或 `PIMPLE` 外循环加 `nOuterCorrectors` 的稳态模式），压力松弛 $0.2\sim0.3$、动量松弛 $0.5\sim0.7$；
- 瞬态小时间步：用 `PISO`，`nCorrectors 2`，每步做多次压力修正，无需松弛；
- 瞬态大时间步或强耦合：用 `PIMPLE`，`nOuterCorrectors 2\sim4`、`nCorrectors 1\sim2`，外循环相当于每步内嵌若干次 SIMPLE；
- 收敛困难的小规模问题：考虑耦合求解器（`coupled` 矩阵求解器），把动量与压力联立；
- 大规模问题：分离式 SIMPLE/PIMPLE 配代数多重网格（GAMG），内存友好、鲁棒。

判断依据：线性容差应与外层残差下降目标匹配，而不是一律设成 $10^{-8}$。`relTol` 控制相对下降、`tolerance` 控制绝对下限；外层残差目标是 $10^{-4}$ 量级时，内层把 `relTol` 设到 $0.01$ 通常足够。算法选择不是背名称，而是理解名字背后实际执行的循环：SIMPLE 在外迭代里一步到位，PISO 在时间步内多步修正，PIMPLE 把两者叠加；读日志时应看外循环计数，确认实际发生的是哪一种。

对多物理场，同一套 `fvSolution` 未必通用：能量、组分和湍流量方程的对称性与尺度差异很大，选错求解器会让 `No Iterations` 异常增大。经验是：对称方程（压力）用 CG/GAMG，非对称方程用 BiCGStab 族，湍流量这类标量场可用 `smoothSolver` 配对称 Gauss-Seidel。

## 2. 背景与原理

求解流程是嵌套的三层：外层（时间/非线性）迭代 → 内层（每个方程的线性求解）→ 线性求解器内部的预条件迭代。三层误差叠加，任何一层过松都会污染结果，任何一层无谓收紧都会拖慢计算。这里的“过松”指同时放宽两层：若内层容差比外层目标还粗，外层看似收敛，实质只是误差被掩盖。

线性求解器分两类：预条件共轭梯度（PCG）要求矩阵对称，常用于压力；双共轭梯度稳定法（PBiCGStab）适用于非对称矩阵，常用于动量、湍流与组分。预条件器必须与求解器匹配：对称矩阵配 DIC，非对称矩阵配 DILU，混用会导致不收敛或报错。GAMG 是代数多重网格，对压力泊松方程尤其高效，但网格极差时需要调整 smoother 与 agglomeration，否则单次迭代成本会很高。

线性系统的残差定义为

$$
\text{res}_P=\mathbf{b}_P-\sum_N a_N\phi_N-a_P\phi_P
$$

归一化后作为日志中的 `residual` 输出：

$$
\text{residual}=\frac{\sum_P\left|\text{res}_P\right|}{\sum_P\left|a_P\phi_P\right|}
$$

线性求解的停止判据是

$$
\|r^{(k)}\|\leq\max\left(\text{tolerance},\ \text{relTol}\cdot\|r^{(0)}\|\right)
$$

即“残差下降到初始值的 `relTol` 倍，或降到绝对 `tolerance`”二者取较松者。`tolerance` 是防止 `relTol` 在极小数上无限迭代的地板，也应保证它低于外层停止目标。

松弛把本次解与上一次解混合，用于抑制分离式算法的振荡：

$$
\phi_P^{(n+1)}=\phi_P^{(n)}+\alpha\left(\phi_P^{\text{new}}-\phi_P^{(n)}\right)
$$

其中 $\alpha$ 为松弛因子：$\alpha<1$ 为欠松弛。分离式求解中压力对质量守恒最敏感，因此压力松弛通常最小。欠松弛相当于在迭代矩阵上加一个对角项，能改善对角占优、抑制振荡，但会降低收敛速率；它不改变方程本身，因此当问题不自洽（边界流量不守恒、源项错误）时，任何松弛都得不到正确解。离散动量方程

$$
a_P\mathbf{u}_P=\sum_N a_N\mathbf{u}_N+\mathbf{b}-\frac{V_P}{\rho}(\nabla p)_P
$$

说明压力梯度以源项形式进入动量，动量松弛过大时压力方程系数（取决于 $a_P$）会恶化，这是“动量松弛带动量压力耦合”的根源。不可压缩流中压力没有独立演化方程，压力方程由连续性约束导出：对动量方程取散度并代入修正关系，得到一个泊松型方程；封闭域纯 Neumann 压力问题有解的必要条件是总入流等于总出流，否则压力修正右端无法平衡，残差会长期停滞。PISO 每个时间步内做多次压力修正：先预测速度，再用压力方程校正，反复若干次后更新面通量；它不做欠松弛，因此时间步不能过大，否则预测—校正的线性化误差会积累。

## 3. 关键配置与公式

**SIMPLE 与 PIMPLE 的循环结构**（伪代码）：

```text
PIMPLE 每个时间步:
  for outer in 1..nOuterCorrectors:        # SIMPLE 外循环
      求解动量（含松弛）
      for corr in 1..nCorrectors:          # PISO 压力修正
          求解压力方程，校正速度与通量
      if (residualControl 满足 && !finalIter) break
```

`nCorrectors` 是每个时间步内的压力修正次数（PISO 建议 2），`nOuterCorrectors` 是外循环次数；PIMPLE 的总内层工作量约为二者之积，这是大时间步稳定的代价。

**压力参考与奇异压力**：封闭域必须固定压力水平，否则压力方程奇异：

```cpp
pRefPoint    (0 0 0);
pRefValue    0;
```

**矩阵求解器选择**：压力方程是对称正定的泊松型，用 `PCG`/`GAMG` 配 `DIC`/`DICGaussSeidel`；动量与湍流方程非对称，用 `PBiCGStab`/`smoothSolver` 配 `DILU`。关键设置示例：

```cpp
solvers
{
    p
    {
        solver          GAMG;
        smoother        DICGaussSeidel;
        tolerance       1e-7;
        relTol          0.01;
        nPreSweeps      0;
        nPostSweeps     2;
    }
    "(U|k|omega|epsilon|nuTilda)"
    {
        solver          PBiCGStab;
        preconditioner  DILU;
        tolerance       1e-8;
        relTol          0.1;
    }
}

SIMPLE
{
    nNonOrthogonalCorrectors 1;
    consistent      yes;
    residualControl
    {
        p               1e-4;
        U               1e-5;
        "(k|omega)"     1e-4;
    }
}

relaxationFactors
{
    fields  { p 0.3; }
    equations { U 0.7; "k|omega" 0.7; }
}
```

`nNonOrthogonalCorrectors` 对压力方程做额外非正交修正，次数随网格非正交度增大，但只是固定点迭代，不能替代网格质量。`consistent yes` 表示 SIMPLE 采用一致性形式，收敛更快但需保证非正交修正次数足够；关掉它会退回经典 SIMPLE，更稳健但更慢。`residualControl` 是外循环的附加停止条件，只在 `PIMPLE`/`SIMPLE` 字典里生效，切记它约束的是外层而非线性求解。

GAMG 的 `smoother` 选择影响收敛：压力用 `DICGaussSeidel` 在多数网格上稳健；湍流标量场用 `smoothSolver` 配 `symGaussSeidel` 成本更低。若日志里压力方程迭代数长期在 $1\sim3$ 次就结束，通常说明 `relTol` 过松；反之堆积到几十次，则可能是网格或边界问题。

## 4. 工程做法与参数

**线性容差**：以“内层残差应比外层目标低一到两个数量级”为原则。稳态 `relTol` 取 $0.01\sim0.1$，瞬态可取 $0.1$；最终校正（`finalIteration`）可临时收紧。不要把所有方程设成同一容差。

**松弛因子经验值（稳态）**：压力 $0.2\sim0.3$，动量 $0.5\sim0.7$，湍流量 $0.5\sim0.7$；耦合/瞬态通常不松弛或只轻微松弛。松弛过大会发散，过小则收敛极慢，还会掩盖本质非稳态。瞬态优先用物理时间步与每步修正次数控制稳定，而不是靠大松弛；当过大的时间步被松弛“抹平”后，得到的是严重耗散的解。网格质量、时间步与松弛要联调：坏网格靠松弛只能延续，不能治愈。

**PIMPLE 参数**：大 Courant 数时增加 `nOuterCorrectors`（如 3），小 Courant 时用 `nCorrectors 2` 即可。`momentumPredictor yes` 在浮力/强耦合时更稳；`turbOnFinalIterOnly no` 在多相/强瞬态时改善稳定性。瞬态可用 `adjustTimeStep yes` 配 `maxCo` 限制全局 Courant 数，通常在 $0.5\sim1$（PISO）到 $5$（PIMPLE 配外循环）之间，可压/多相还需限制 `maxDeltaT`。

**residualControl**：给外循环设残差阈值，达到后提前结束该时间步，能显著省时，但阈值要对每个方程分别设，且不能替代物理量判据。字典写法上，`relaxationFactors` 的 `fields` 用于场（压力、湍流），`equations` 用于方程；正则表达式（如 `"(k|omega)"`）可批量匹配多个场，避免遗漏。

**耦合与分离的取舍**：耦合求解器把动量和压力联立，减少外迭代次数，对强浮力、旋转或小规模问题有效，但单步内存和线性求解成本高，且对初始场与线性求解器更敏感。是否使用耦合，应通过算例对比总耗时，而不是想当然。

## 5. 可复现示例

在某稳态算例中写入上面的 `fvSolution`，并加一个残差监控：

```cpp
functions
{
    residuals
    {
        type            residuals;
        fields          (p U k omega);
        writeControl    timeStep;
        writeInterval   1;
    }
}
```

运行并观察：

```bash
foamRun -solver incompressibleFluid 2>&1 | tee log.run
tail -n 80 log.foamRun
# 关注: Time, 各场 Initial residual / Final residual / No Iterations
```

判读要点：Initial residual 逐外迭代下降；Final residual 应低于 `tolerance` 或 `relTol` 门槛；`No Iterations` 突增说明矩阵条件数变差（网格、时间步、边界或系数范围问题），应停下排查而不是加大松弛。若某方程 Final residual 一直停在较高水平，说明 `relTol` 太松或 `tolerance` 太高；若 `No Iterations` 达上限仍未达标，检查矩阵是否病态，可临时把该方程的 `relTol` 调到 $0.001$ 观察是否改善，以区分容差设置问题与矩阵本身病态。若把同一个 `fvSolution` 用在两个不同算例而收敛差异很大，应分别检查两者的网格非正交度与 Courant 数，而不是直接改容差。

## 6. 常见坑与排查

- 把降低容差当成提高精度：物理精度由离散误差决定，线性残差再小也救不回粗网格；
- `relTol` 过松：外层看似收敛，实际被未收敛的内层误差污染；
- `tolerance` 高于外层目标：内层提前停止，外层目标永远达不到；
- 松弛过强：掩盖本质非稳态或实现细节错误，得到“假稳态”；
- 时间步过大：即便线性收敛，时间离散误差也让结果失真；
- 封闭域漏设压力参考：残差长期不降，压力场漂移；
- 只看残差：残差达标却出现负温度、负相分数，说明有界性失守；
- 迭代数突增就加松弛：应先查网格、时间步与边界，而不是动数值参数。

排查顺序：量纲与边界 → 网格最差位置 → 初值与 Courant 数 → 松弛与求解器 → 格式与容差。数值参数不应成为修补错误物理输入的第一手段。

最后要记住：收敛是一个工程判断，不是单一数字。把残差阈值当作唯一标准，是新手最常犯的错误；成熟的判据是四类证据同时成立，且对网格、时间步与格式做过敏性验证。

## 7. 检查清单与参考

- [ ] 每个场都设了合适的 `solver`/`preconditioner`/`tolerance`/`relTol`；
- [ ] 稳态 `SIMPLE`/瞬态 `PIMPLE` 的循环参数与 Courant 数匹配；
- [ ] 封闭域已设 `pRefPoint`/`pRefValue`，或由压力边界钉住水平；
- [ ] 松弛因子已记录并在敏感性分析中确认；
- [ ] 收敛由残差、守恒、监控量、网格/时间步敏感性四类证据共同支撑；
- [ ] 时间步在关键阶段满足 Courant 数约束。

参考资料：

1. OpenFOAM 当前版本 *Solution and Algorithm Control* 文档。
2. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere, 1980.
3. Ferziger J.H., Perić M., *Computational Methods for Fluid Dynamics*, 3rd ed., Springer, 2002.
