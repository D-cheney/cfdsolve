---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-solver-selection
title: OpenFOAM 求解器与物理模型选择方法
summary: 用稳态或瞬态、不可压或可压、单相或多相、等温或传热等问题维度选择求解器，给出控制方程与马赫数、雷诺数、库朗数、瑞利数等判据，并说明如何用启动日志核实求解器实际读取的字段与模型。
category: { slug: openfoam-getting-started, name: OpenFOAM 入门与案例组织 }
level: 工程
reading_minutes: 12
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, 求解器选择, 物理模型, SIMPLE, PIMPLE, 无量纲数]
seo:
  title: OpenFOAM 求解器选择方法
  description: 按时间特性、可压缩性、相态与能量方程选择并核实 OpenFOAM 求解器，附常用判据与核对流程。
  keywords: [OpenFOAM solver, 求解器选择, SIMPLE, PIMPLE, 马赫数, 雷诺数]
---

# OpenFOAM 求解器与物理模型选择方法

求解器选择应从**控制方程组**出发，而不是从名字或经验猜测。新版本把多个经典求解器合并为模块化入口（如 `foamRun -solver incompressibleFluid`），旧博客里的求解器名可能已不存在。判断依据应当是当前版本的文档、随附教程与启动日志中打印的模型选择，而不是"名字里带 simple 就是稳态"这类表面线索。本文用六个问题维度组织选型，并给出常用无量纲判据与"实际启用核对"流程。

## 1. 结论与适用场景

结论：先用六个维度刻画问题，再在**当前安装版本**里找物理最接近的官方教程，最后用日志核对求解器与模型是否与预期一致。选型不是一次性的，随着对流动认识的加深，可能需要从更简模型升级到更完整模型。

六个维度：

1. 时间特性：求稳态统计量，还是必须解析瞬态？
2. 可压缩性：常密度、弱可压缩，还是完整可压缩（含激波）？
3. 相态：单相、自由液面、欧拉多相，还是拉格朗日颗粒？
4. 能量：等温、传热、浮力、共轭传热，还是反应？
5. 流变：牛顿、非牛顿或其他本构？
6. 区域：单区域，还是固体—流体多区域？

适用于新问题选型、接手算例时核对模型，以及"结果可疑、怀疑选错物理"的排查。抓住这六个维度，绝大多数选型问题都能收敛到少数候选求解器。

选型错误的代价往往远高于算错的代价：用错物理模型的算例，可能"顺利跑完、结果自洽"，却在工程上毫无意义。因此宁可在选型阶段多花半小时逐项核对，也不要等到后处理阶段才发现模型根本不适用。最后还要提醒：不要因为"某个求解器更熟悉"就优先选择它；熟悉度影响上手速度，却决定不了物理是否匹配。

## 2. 背景与原理

几乎所有求解器都在离散同一套守恒方程。不可压或低马赫数下的连续性与动量方程为

$$
\nabla\cdot\mathbf{u} = 0
$$

$$
\frac{\partial \mathbf{u}}{\partial t} + \nabla\cdot(\mathbf{u}\mathbf{u}) = -\nabla p + \nabla\cdot(\nu\nabla\mathbf{u}) + \mathbf{g}
$$

可压缩流则保留密度导数并耦合能量方程：

$$
\frac{\partial \rho}{\partial t} + \nabla\cdot(\rho\mathbf{u}) = 0
$$

密度变化由状态方程 $p = \rho R T$ 与能量方程共同决定。求解器之间的差别，本质是**保留了哪些项、加了哪些模型**：湍流、多相、传热、反应、辐射分别对应附加的输运方程与闭合关系。

以湍流为例，RANS 求解的是时均方程，需要额外的湍流黏度闭合；LES 求解滤波后的瞬态方程，直接解析大尺度涡；二者对网格、时间步与壁面处理的要求差异巨大。多相问题同理：VOF 追踪界面，适合分层与自由液面；欧拉多相把各相当作互相穿插的连续介质，适合气泡群与流化床。选型时先问"我要解析的物理尺度是什么"，再决定保留哪些方程。能量方程是否求解同样影响选型：等温不可压问题不需要能量方程；一旦涉及浮力或温度依赖物性，就需要传热与浮力求解器；共轭传热还要把固体区域一并纳入，使用多区域求解器。

还有一层常被忽视：求解器的"模块化"并不改变物理，只是把过去分散的入口整合起来。因此从旧求解器迁移到模块化入口（如 `foamRun`）时，应核对的是它默认启用了哪些子模型、读取了哪些字典，而不是简单替换命令名。

压力—速度耦合算法决定了"稳态还是瞬态"的实现路线：SIMPLE 面向稳态，用较大的伪时间步逐步逼近定常解；PISO 面向瞬态，用一次时间步内的多次压力修正保证连续性；PIMPLE 是二者结合，通过外迭代可在瞬态框架内逼近稳态，兼具鲁棒性与时间精度。

## 3. 关键配置与公式

**马赫数与可压缩性**。按 $Ma = U/c$ 判断流型：$Ma < 0.3$ 可近似不可压，$Ma \approx 1$ 附近需可压缩求解器，超声速含激波时用密度基或激波捕捉求解器：

$$
Ma = \frac{U}{c}, \qquad c = \sqrt{\gamma R T}
$$

**雷诺数**决定层流或湍流，以及壁面处理与边界层网格需求：

$$
Re = \frac{\rho U L}{\mu}
$$

**时间步**由库朗数约束，显式对流一般要求

$$
Co = \frac{U\,\Delta t}{\Delta x} \leq 1
$$

**浮力驱动**（自然对流）用格拉晓夫数与瑞利数判断：

$$
Gr = \frac{g\beta\,\Delta T\,L^{3}}{\nu^{2}}, \qquad Ra = Gr\,Pr
$$

其中 $\beta$ 为热膨胀系数，$Pr = \nu/\alpha$ 为普朗特数，$Ra$ 越大越可能湍流。PIMPLE 的外迭代则是对稳态的逐步逼近：

$$
\mathbf{u}^{(n+1)} = \mathbf{u}^{(n)} + \Delta \mathbf{u}, \qquad \|\Delta \mathbf{u}\| \to 0
$$

当外迭代残差不再下降时，继续增大 `nOuterCorrectors` 的收益有限，应转而排查网格、边界或格式。这些判据是选型的"量化罗盘"：$Ma$ 决定是否可压，$Re$ 决定层湍与网格密度，$Co$ 决定时间步，$Ra$ 决定是否需要浮力与湍流模型。先用特征尺度手算一遍，再对照教程的算例参数，就能快速判断自己的问题落在哪一类求解器的适用区间内。

## 4. 工程做法与参数

下面的分组按"时间—可压缩性—相态—能量—反应"的顺序排列，与前面六个维度一一对应。实际选用时，先定位到最接近的一组，再在组内按稳态或瞬态、层流或湍流进一步细分；遇到跨组问题（如可压缩多相），优先在教程目录里找同类算例作为起点。

按物理分组的常用求解器（两条线的名称可能不同）：

- **不可压单相**：瞬态层流 `icoFoam`；稳态湍流 `simpleFoam`；瞬态湍流 `pimpleFoam`；势流初值 `potentialFoam`；
- **可压缩单相**：亚声速 `rhoSimpleFoam` / `rhoPimpleFoam`；浮力驱动 `buoyantSimpleFoam` / `buoyantPimpleFoam`；跨 / 超声速 `sonicFoam`，密度基的 `rhoCentralFoam` / `shockFluid`；
- **多相**：自由液面 VOF `interFoam`、`multiphaseInterFoam`；可压缩 VOF `compressibleInterFoam`；欧拉多相 `multiphaseEulerFoam`（旧版 `twoPhaseEulerFoam`）；拉格朗日颗粒 `sprayFoam`、`MPPICFoam`；
- **传热与多区域**：共轭传热 `chtMultiRegionFoam`；共轭稳态 `chtMultiRegionSimpleFoam`；Boussinesq 浮力 `buoyantBoussinesqSimpleFoam`；
- **反应**：`reactingFoam`、`chemFoam`；
- **OpenCFD 模块化入口**：`foamRun -solver <type>`，类型含 `incompressibleFluid`、`compressibleFluid`、`shockFluid`、`multiphaseEuler`、`incompressibleVoF` 等；多区域用 `foamMultiRun`。
- **层流与湍流的切换**：层流求解器也能算低雷诺数流动，但把湍流场交给层流求解器会严重低估混合、阻力与换热；判断依据是 $Re$ 与流动几何，而非网格粗细。

选型参数要点：稳态用较大的伪时间步加速，但本质非定常的流动（分离、振荡、浮力羽流）不能用稳态强收敛为唯一解；瞬态的时间步按目标频率与 $Co$ 确定，统计窗口要足够长，使均值与脉动统计收敛。

## 5. 可复现示例

先把问题写进控制字典，再选求解器。以不可压湍流瞬态为例：

```cpp
FoamFile
{
    version     2.0;
    format      ascii;
    class       dictionary;
    object      controlDict;
}
application     pimpleFoam;    // OpenCFD 线改用：foamRun -solver incompressibleFluid
startFrom       latestTime;
deltaT          1e-3;
writeControl    adjustableRunTime;
writeInterval   0.05;
adjustTimeStep  yes;
maxCo           1.0;
maxDeltaT       1e-2;
```

确定湍流模型的字典（新版本为 `constant/momentumTransport`）：

```cpp
simulationType  RAS;
RAS
{
    model           kOmegaSST;
    turbulence      on;
    printCoeffs     on;
}
```

运行并用日志核对"实际启用"的模型：

```bash
foamRun -solver incompressibleFluid > log.foamRun 2>&1
grep -E "Selecting|simulationType|RAS|LES|SIMPLE|PISO|PIMPLE" log.foamRun | head -n 20
```

日志应打印所选湍流模型与压力—速度算法；若与预期不符，先改字典或换求解器，而不是继续往下跑。选型完成后，务必用一次短算例核对：启动日志里打印的求解器、湍流模型、压力—速度算法与物性模型，必须与你的意图逐项一致。日志是最廉价、最客观的"配置体检报告"，养成通读日志前几十行的习惯，能及早发现大量选型与配置错误。对同一问题，建议至少比较两个候选求解器的短算例结果：若目标量在两者之间差异显著，往往说明物理或网格的敏感区被触及，应回到维度清单重新审视。

## 6. 常见坑与排查

- **用稳态求本质非定常流动**：得到被数值耗散抹平的"伪定常"场，必须改瞬态并做时间统计。
- **可压缩性选错**：高 $Ma$ 用不可压求解器会丢失激波与密度变化。
- **湍流模型与 $y^+$ 不匹配**：壁函数与低雷诺数模型需要不同的边界层网格。
- **沿用旧求解器名**：新版本已移除或改名为模块化入口，命令会直接报错。
- **多区域当单区域**：共轭传热需要多区域求解器与分区网格。
- **只看残差判正确**：残差平不代表物理对，须核对守恒、量级与目标量趋势。
- **物性模型不匹配**：可压缩求解器与不可压求解器读取的物性文件不同，混用会导致物性未定义或量纲错误，切换求解器时必须一并迁移物性字典。
- **湍流模型默认值被忽略**：许多模型的系数有默认值，直接沿用可能在特定工况下失准；启用前应确认系数的适用范围并记录来源。
- **时间步与目标频率不匹配**：瞬态问题若时间步过大，会抹平高频脉动；应先按库朗数与目标频率共同确定时间步。

## 7. 检查清单与参考

- [ ] 六个维度已明确，且与所选求解器匹配；
- [ ] 官方教程与所用求解器同版本、同物理类型；
- [ ] 启动日志打印的湍流、物性与算法与预期一致；
- [ ] $Ma$、$Re$、$Co$（及需要的 $Ra$）已估算并用于设置；
- [ ] 分阶段加物理，每层保留守恒与工程量基准；
- [ ] 归档求解器、版本、模型字典与日志。

参考：

以上清单建议与《字典覆盖、包含与最终配置核对》配合使用，把"选对求解器"与"确认求解器真的读了预期配置"连成一条闭环。选型不是终点：在正式计算前，仍应按《CFD 问题定义与标准计算流程》核对目标量、精度与验收标准，使求解器服务于问题，而不是相反。

1. 当前安装发行版的 Solver / Applications 文档与 `tutorials`。
2. OpenCFD，*foamRun* 与模块化求解器文档。
3. Greenshields & Weller，*Notes on Computational Fluid Dynamics*。
