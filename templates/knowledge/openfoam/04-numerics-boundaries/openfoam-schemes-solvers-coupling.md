---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-schemes-solvers-coupling
title: OpenFOAM 离散格式、线性求解器与耦合控制
summary: 从 fvSchemes、fvSolution 到 PISO、SIMPLE、PIMPLE 的嵌套循环，梳理离散格式、矩阵求解器与压力—速度耦合参数之间的依赖，给出联动排查顺序与最小可运行字典。
category: { slug: openfoam-numerics-boundaries, name: "OpenFOAM 边界与数值设置" }
level: 进阶
reading_minutes: 14
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [OpenFOAM, fvSchemes, fvSolution, SIMPLE, PIMPLE, 线性求解器]
seo:
  title: OpenFOAM 离散格式、线性求解器与耦合控制
  description: 梳理 fvSchemes、矩阵求解器与 PISO/SIMPLE/PIMPLE 之间的依赖，避免孤立调整容差或格式。
  keywords: [SIMPLE, fvSchemes, fvSolution, PIMPLE, matrix solver]
---

# OpenFOAM 离散格式、线性求解器与耦合控制

`fvSchemes` 决定时间、梯度、散度和拉普拉斯项如何离散；`fvSolution` 选择矩阵求解器、预条件器、容差以及压力—速度耦合控制。两者共同决定稳定性和误差，不能独立评价：换了格式，矩阵系数与条件数随之改变，原来的求解器设置可能失效；改了容差，外层耦合的行为也会改变。本文把这三者串起来讲，并给出联动排查顺序。

## 1. 结论与适用场景

- **稳态**：SIMPLE（或 PIMPLE 外循环稳态模式），压力松弛 $0.2\sim0.3$、动量 $0.5\sim0.7$；
- **瞬态小步**：PISO，`nCorrectors 2`，每个时间步内多次压力修正，不松弛；
- **瞬态大步/强耦合**：PIMPLE，`nOuterCorrectors 2\sim4`、`nCorrectors 1\sim2`；
- **对称压力方程**：PCG 或 GAMG；非对称动量/湍流方程：PBiCGStab 或 smoothSolver；
- **想减少外迭代次数**：考虑耦合矩阵求解器，代价是内存与单步成本。

同一物理问题，稳态与瞬态可以用不同组合：不少稳态算例直接用 PIMPLE（`nOuterCorrectors` 较大、时间步当伪时间）推进，比纯 SIMPLE 更容易从差初值收敛，代价是每个“时间步”的开销更大。

三个概念必须分开：**格式**决定离散误差，**耦合算法**决定外层迭代结构，**线性求解器**决定每步代数误差。混在一起调，永远说不清是哪一个在起作用。

设计一套数值设置的正确顺序是：先判断问题类型（稳态/瞬态、单相/多相、是否可压），据此选耦合算法，再选格式，最后才是线性求解器与容差。反过来先调容差，往往白费功夫。

## 2. 背景与原理

不可压缩动量方程的离散形式为

$$
a_P\mathbf{u}_P=\sum_N a_N\mathbf{u}_N+\mathbf{b}-\frac{V_P}{\rho}(\nabla p)_P
$$

压力以源项形式出现，速度与压力通过系数互相耦合。分离式算法把“解动量”和“解压力”拆开交替执行：先用当前压力预测速度，再解压力修正满足连续性。压力修正方程由连续性导出：

$$
\sum_f d_f(\nabla p')_f\cdot\mathbf{A}_f=\sum_f \mathbf{u}^{*}_f\cdot\mathbf{A}_f
$$

右端是预测速度的净通量（连续性的不平衡），左端是以压力修正 $p'$ 为未知量的泊松系统，系数 $d_f$ 来自动量方程的对角元 $a_P$。这解释了为什么动量松弛、格式和网格质量都会影响压力方程的求解难易。

三种耦合算法的差别在于循环结构：SIMPLE 每个外迭代做一次压力修正，靠欠松弛稳定；PISO 在一个时间步内做多次压力修正，适合瞬态；PIMPLE 把 PISO 压力修正嵌进 SIMPLE 外循环，用外循环次数换取大时间步下的稳定性。嵌套循环的工作量近似为

$$
N_{\text{solve}}\approx n_{\text{outer}}\times\left(1+n_{\text{correctors}}\right)
$$

因此盲目增大 `nOuterCorrectors` 会成倍增加成本。

分离式算法之所以流行，是因为它把一个大而病态的系统拆成两个较小、各自容易求解的子系统，内存占用低、实现简单。代价是收敛依赖压力修正的线性化近似（SIMPLE 忽略邻点速度修正），因此必须欠松弛；PIMPLE 用外循环补回部分耦合强度。同位网格上还需要 Rhie-Chow 插值避免压力—速度解耦，否则会出现棋盘格压力振荡。

矩阵是稀疏的，但带宽随单元编号而变；迭代法对带宽不敏感，但条件数仍受网格长宽比与非正交度支配。因此“求解器突然变慢”常常是网格问题的信号，而不是求解器本身的问题。

耦合强度随物理而变：浮力、旋转、多相与高速可压流动的耦合更强，需要更多外循环或耦合求解器；简单外流耦合弱，PISO 一两步修正足够。判断耦合强度的实用信号，是外循环里压力残差下降的速度：降得快说明耦合弱，迟迟不降说明需要更强的耦合处理。

另一个易被忽略的依赖是时间格式与外循环：`backward` 引入两个历史时间层，外循环第 1 次与后续迭代的矩阵系数不同，因此 `nOuterCorrectors` 要足够让历史层影响收敛；若外循环只做 1 次，PIMPLE 几乎退化为 PISO。

## 3. 关键配置与公式

**矩阵求解器的选择依据**是矩阵的对称性与条件数。压力泊松方程对称，使用 CG 族；动量与湍流方程非对称，使用 BiCGStab 族；多重网格 GAMG 对压力尤其高效。收敛判据沿用相对容差与绝对容差：

$$
\|r^{(k)}\|\leq\max\left(\text{tolerance},\ \text{relTol}\cdot\|r^{(0)}\|\right)
$$

**松弛**在分离式算法中抑制振荡：

$$
\phi_P^{(n+1)}=\phi_P^{(n)}+\alpha\left(\phi_P^{\text{new}}-\phi_P^{(n)}\right)
$$

**PIMPLE 控制字典**（含 PISO 压力修正与外循环）：

```cpp
PIMPLE
{
    nOuterCorrectors    3;      // SIMPLE 外循环
    nCorrectors         1;      // PISO 压力修正
    nNonOrthogonalCorrectors 1; // 压力非正交修正
    momentumPredictor   yes;
    turbOnFinalIterOnly no;
    residualControl
    {
        p               1e-4;
        U               1e-5;
    }
}
```

`momentumPredictor yes` 会先解一次动量预测再解压力，能改善浮力与强耦合的稳定性；`turbOnFinalIterOnly no` 让湍流量在每个外循环都更新，多相与强瞬态时更稳。`residualControl` 的阈值决定外循环何时提前退出：设得太松损害每步精度，设得太紧则失去省时意义。注意 `PIMPLE`/`PISO`/`SIMPLE` 只是控制字典名，与求解器可执行文件无关。

**矩阵求解器字典**：

```cpp
solvers
{
    p
    {
        solver          GAMG;
        smoother        DICGaussSeidel;
        tolerance       1e-7;
        relTol          0.01;
    }
    "(U|k|omega)"
    {
        solver          PBiCGStab;
        preconditioner  DILU;
        tolerance       1e-8;
        relTol          0.1;
    }
}
```

配套的 `fvSchemes` 至少要有有界的对流项与一致的 `snGrad`/`laplacian`：

```cpp
divSchemes    { default none; div(phi,U) bounded Gauss linearUpwind grad(U); }
laplacianSchemes { default Gauss linear corrected; }
snGradSchemes { default corrected; }
```

GAMG 需要合适的 agglomeration：单元数少时层数不足，效果有限；单元数很大时，粗化过快会损失精度。`smoothSolver` 配 `symGaussSeidel` 适合对称的湍流标量场，成本低于 GAMG。选求解器的顺序是：先判对称性，再看规模，最后看日志里的迭代数是否稳定。

## 4. 工程做法与参数

**一致调整，不要孤立微调**。升级对流格式（如从 `upwind` 到 `linearUpwind`）会改变动量对角元 $a_P$，进而改变压力修正系数 $d_f$；此时应重新评估 `nNonOrthogonalCorrectors`、松弛与容差，而不是只换格式就完事。

**线性容差与外层目标的匹配**：稳态 `relTol` 取 $0.01\sim0.1$，瞬态取 $0.1$；`tolerance` 应低于外层停止目标。若某方程 `Final residual` 长期停在高水平，先怀疑 `relTol` 过松，再怀疑矩阵病态。

**松弛与 Courant 数联动**：稳态靠松弛，瞬态靠时间步与每步修正。把 PISO 的时间步压到 Courant $<1$，通常比加大松弛有效；把 PIMPLE 的外循环加到 3，通常比把时间步无限缩小划算。

**非正交修正次数**：与非正交角成正比，一般 $0\sim3$；它对压力方程是固定点迭代，次数不足会残留误差，次数过多只增成本。

**格式与网格的联动**：非结构网格上任一高阶格式的名义精度都难达到，实测阶数常低于名义值；因此期望“换格式即提精度”往往落空，需要网格配合。若限制器长期退化为一阶，说明网格不足，应先加密而非换格式。

格式—求解器—耦合还体现在稳定性上：中心差分（无界）会让非对称动量矩阵出现负系数，BiCGStab 也可能不稳定；有界格式使矩阵更对角占优，求解更稳。这也是“先有界、再高阶”的升级路线能同时改善数值精度与代数收敛的原因。

## 5. 可复现示例

在 `system/` 下把上面三段字典拼成一个最小 PIMPLE 瞬态算例（不可压缩），并加残差监控：

```cpp
functions
{
    res
    {
        type residuals;
        fields (p U k omega);
        writeControl timeStep;
        writeInterval 1;
    }
}
```

运行并判读：

```bash
checkMesh -allGeometry -allTopology
foamRun -solver incompressibleFluid 2>&1 | tee log.run
grep -E "Time =|Solving for|Initial residual|No Iterations" log.run | tail -n 60
```

排查路径（按依赖顺序）：先看 `checkMesh` 的 `Max non-orthogonality` 与 `Max skewness` → 再看边界与守恒 → 确认内层迭代数是否合理 → 再动格式与容差。结果对比时以工程量（压降、阻力、流量分配、峰值温度）为准，而非残差。若 `No Iterations` 随格式升阶而骤增，说明条件数被格式改变，应回退格式或改善网格，而不是单纯放大 `relTol`。

日志中每个方程块都会给出 GAMG/PBiCGStab 的迭代数。若 `p` 的迭代数在 $1\sim3$ 次就结束而初始残差仍高，说明 `relTol` 过松，压力方程未真正解好，外循环会因此多迭代；反之若 `U` 迭代数持续逼近上限，检查动量矩阵条件数与边界。

做敏感性分析时，一次只改一类参数（格式、容差、外循环次数），记录目标量变化，才能把影响归因。

## 6. 常见坑与排查

- 把 `fvSchemes` 与 `fvSolution` 分开调：换了格式不重评矩阵设置，收敛行为会莫名其妙变化；
- 只调容差不管格式：容差再严也补不回一阶格式的耗散；
- 用一阶格式建立“稳定假象”：求得的解耗散过大，却被当成真实解；
- 线性求解器与矩阵对称性不匹配：对称方程配 DILU、非对称方程配 DIC 都会出问题；
- `nCorrectors`/`nOuterCorrectors` 一味加大：成本成倍增长，收益递减；
- 非正交修正当保险：它救不了严重坏网格；
- 只看单场残差：必须同时看压力方程与目标量，压力方程先收敛不代表耦合已收敛；
- 把耦合求解器当万能：它对内存与线性求解器更敏感，网格/边界有问题时同样失效；
- 忽略 Rhie-Chow：同位网格上私自改写面通量插值会导致压力—速度解耦；
- 混淆稳定与准确：收敛到被耗散严重扭曲的解，比不收敛更隐蔽。

诊断顺序：网格质量 → 边界与守恒 → 线性求解器是否达停止条件 → 耦合外循环是否收敛 → 格式与外层目标是否匹配。

最常见也最昂贵的一类错误，是把数值设置当成“调参游戏”：在没确认网格、边界和量纲正确之前，反复更换求解器与格式。正确顺序永远是物理与网格先行，数值参数收尾。

## 7. 检查清单与参考

- [ ] `fvSchemes` 的对流项有界，`snGrad` 与 `laplacian` 一致；
- [ ] 压力用对称求解器、动量/湍流用非对称求解器，预条件器匹配；
- [ ] `tolerance`/`relTol` 与外层收敛目标匹配，未所有方程一刀切；
- [ ] `nCorrectors`/`nOuterCorrectors`/`nNonOrthogonalCorrectors` 与 Courant 数、网格一起评估；
- [ ] 格式升阶后重新评估了矩阵设置与松弛；
- [ ] 收敛证据覆盖残差、守恒、监控量与敏感性四类。

参考资料：

1. OpenFOAM 当前版本 *Solution and Algorithm Control* 与 *Numerical Schemes* 文档。
2. Issa R.I., "Solution of the implicitly discretised fluid flow equations by operator-splitting," *J. Comput. Phys.*, 62(1), 1986.
3. Ferziger J.H., Perić M., *Computational Methods for Fluid Dynamics*, 3rd ed., Springer, 2002.
