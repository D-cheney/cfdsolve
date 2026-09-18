---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-multiphase-lagrangian
title: OpenFOAM 14 多相、VOF、Lagrangian 与相间耦合源码体系
summary: 按界面捕捉、欧拉多相和模块化 Lagrangian 三条路线梳理求解模块、相系统、MULES、颗粒云与相间源项，给出质量、动量与能量耦合的公式框架和守恒审计方法。
category: { slug: openfoam-v14-models-infrastructure, name: OpenFOAM 14 物理模型与基础设施 }
level: 专题
reading_minutes: 26
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, VOF, MULES, multiphaseEuler, Lagrangian]
seo:
  title: OpenFOAM 14 多相、VOF、Lagrangian 与相间耦合源码体系
  description: 梳理 VOF、欧拉多相与模块化 Lagrangian 三条路线的求解模块、相系统、MULES 与相间源项，并给出守恒审计方法。
  keywords: [VOF, MULES, multiphaseEuler, Lagrangian, 相间耦合, OpenFOAM 14]
---

# OpenFOAM 14 多相、VOF、Lagrangian 与相间耦合源码体系

OpenFOAM 14 的多相主线分布在 `applications/modules/` 的 `*VoF` 与 `multiphaseEuler`、以及 `src/multiphaseModels/`、`src/twoPhaseModels/` 和新版 `src/Lagrangian/` 之中。三条路线对应三种界面与尺度处理方式，选择哪条取决于你要分辨的物理尺度。自由表面用界面捕捉（VOF）描述相分数的输运：

$$ \frac{\partial\alpha}{\partial t}+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot\left[\alpha(1-\alpha)\mathbf{U}_c\right]=S_\alpha,\qquad 0\leq\alpha\leq1 $$

其中 $\mathbf{U}_c$ 是界面压缩速度，用于抑制界面数值扩散。

## 1. 结论与适用场景

三条路线的选型判据很清晰：当需要清晰追踪自由液面（溃坝、波浪、液滴撞击）时用 VOF；当分散相体积分数较高、界面无法逐一定位（鼓泡床、气固流化）时用欧拉多相；当颗粒稀疏、需要追踪单颗粒轨迹与粒径分布（喷雾、颗粒输运）时用 Lagrangian。OpenFOAM 14 正在把 Lagrangian 迁移到模块化框架，新旧 `lagrangian` 路线接口并存，不能混为一套字典与类。

两条通用结论值得记住：第一，多相求解的绝大部分问题都可归结为守恒审计失败——质量、动量或能量的相间净交换不为零；第二，相分数有界性与守恒是一对需要同时满足的约束，多数稳定性补丁只是缓解而非根治。理解源项的成对性与时间层一致性，是读懂多相源码的关键。判断尺度分离程度常用两个无量纲量：其一是颗粒雷诺数 $Re_p=\rho d_p|\mathbf{U}-\mathbf{U}_p|/\mu$，它决定曳力关联式；其二是斯托克斯数 $St=\tau_p/\tau_f$，它衡量颗粒跟随性。$St$ 远小于 1 时颗粒几乎随流体，$St$ 远大于 1 时颗粒受惯性主导、轨迹强烈偏离流线。VOF 侧则关注毛细数与韦伯数，它们决定界面变形与破碎行为。选择路线时还要考虑计算成本：VOF 需要界面附近足够细的网格，欧拉多相与 Lagrangian 则要为每一相或每个颗粒付出额外开销。通常先用粗网格与简化模型确定趋势，再逐步加密网格与细化物理，是控制成本的有效策略，也能避免在还没弄清物理前就陷入数值细节。

## 2. 总体架构

VOF 线位于 `applications/modules/incompressibleVoF` 与 `compressibleVoF`，内部包含相分数方程 `alphaEqn`、通量限制器 `MULES`、界面属性 `interfaceProperties`（表面张力与接触角）。欧拉多相线以 `multiphaseEuler` 求解器模块为核心，配合 `src/multiphaseModels/` 的 `phaseSystem` 组织各相与相间交换。两相通用工具在 `src/twoPhaseModels/`。颗粒线在新 `src/Lagrangian/`（含 `cloud`、`particle` 与各类子模型），旧实现仍在 `src/lagrangian/`。

在 VOF 中，混合物性由相分数线性组合给出：

$$ \rho=\alpha\rho_1+(1-\alpha)\rho_2,\qquad \mu=\alpha\mu_1+(1-\alpha)\mu_2 $$

表面张力则作为动量源进入方程。在欧拉多相中，每个相拥有自己的体积分数与守恒方程，相间动量交换必须成对出现：

$$ \mathbf{M}_{ab}=-\mathbf{M}_{ba} $$

这一反对称关系是相间耦合守恒性的数学表达。phaseSystem 还负责相间传质、传热与拖曳的具体模型，例如 dragModel、massTransferModel 与群体平衡 populationBalance。这些模型通过运行时选择装配，并按“对每一对相成对施加”的原则工作；interfaceProperties 则在 VOF 中维护表面张力系数、接触角与曲率计算，把界面力作为动量源返回。无论哪条路线，最终都要回到守恒这一共同语言：质量、动量与能量的收支必须闭合。把每条路线的源项都写成“向连续相添加多少、从何处扣除多少”的记账形式，再逐项核对符号与时间层，是读懂多相代码最有效的统一视角，也便于在算例间迁移经验。在此视角下，VOF 的界面压缩通量、欧拉多相的相间传质与 Lagrangian 的颗粒反馈，本质上都是同一类记账项的不同实现形式；理解其一即可触类旁通，也能大幅降低切换到新路线时的学习成本，把注意力集中在物理而非接口细节上。

## 3. 关键类与调用链

三条路线的调用链可概括为：

```text
VOF (incompressibleVoF):
  alphaEqn.H            # 装配相分数对流与界面压缩
  MULES::explicitSolve  # 通量修正，保证有界与守恒
  alphaEqnSubCycle      # 按 cAlpha 与 Co 决定子步
  更新混合物性 -> 动量(含表面张力) -> 压力校正

multiphaseEuler:
  phaseSystem::solve()  # 驱动各相 solve()
  pair exchange / blendingMethod   # 相间质量、动量、能量交换

Lagrangian:
  cloud.evolve()        # 注入 -> 跟踪 -> 子模型 -> 回写源项
```

颗粒轨迹与动量方程满足

$$ \frac{d\mathbf{x}_p}{dt}=\mathbf{U}_p,\qquad m_p\frac{d\mathbf{U}_p}{dt}=\mathbf{F}_D+\mathbf{F}_g+\cdots $$

其中曳力可写为

$$ \mathbf{F}_D=\frac{m_p}{\tau_p}(\mathbf{U}-\mathbf{U}_p),\qquad \tau_p=\frac{\rho_p d_p^2}{18\mu} $$

$\tau_p$ 是颗粒响应时间，它与流动特征时间之比决定颗粒是否跟随流体。当 $St$ 处于量级 1 附近时，颗粒既不完全跟随也不完全自由，此时 Lagrangian 与欧拉方法的差异最大，最需要仔细校对曳力与湍流弥散模型。若采用双向耦合，颗粒对连续相的动量与质量反馈必须与颗粒自身方程使用同一时间层，否则会出现能量凭空产生或消失的假象。颗粒方程通常用分步积分或亚循环推进：当颗粒响应时间远小于流动时间步时会出现刚性问题，此时小步积分或解析积分格式更稳健。识别刚性并选择合适的积分方式，是颗粒计算稳定性的关键。对颗粒密集或需统计粒径分布的场景，还应关注颗粒数是否足以收敛统计量：样本过稀会让粒径分布与平均量都不可信，而样本过多又会让双向耦合的源项变得不平滑，需要在统计误差与稳定性之间取平衡。

## 4. 代码走读要点

VOF 方面，`MULES` 先在显式求解通量后施加通量限制，使 $\alpha$ 保持有界且守恒；子循环次数由界面压缩系数 `cAlpha` 与库朗数共同决定，`cAlpha` 过大虽能锐化界面却易引起寄生流。欧拉多相方面，相间交换由 `phaseSystem` 统一施加，每个相只贡献“自己那一半”，成对项集中处理可避免重复计入。Lagrangian 方面，颗粒向连续相回写的源项（质量、动量、焓）必须与连续相的时间层一致，且注入与删除也要纳入全局平衡统计。三条路线都应把“源项符号是否成对、时间层是否一致、是否被重复计入”作为阅读重点。VOF 的界面锐化是另一处易错点：alphaEqnSubCycle 按 cAlpha 与库朗数把一步拆成若干子步，使界面在每子步内移动不超过约一个网格，从而在保持有界的同时尽量锐化界面；若时间步过大而又指望单次 MULES 解决，界面会被数值扩散抹平，表面张力随之失真。此外，相分数梯度的计算方式会影响界面法向与曲率，进而影响表面张力。网格非正交度高时曲率误差会被放大，表现为界面上的高频波动，因此界面附近的网格正交性往往比全局网格质量更关键，值得在划分网格时单独优化。

## 5. 可复现示例

运行 VOF 溃坝类算例并检查界面处理：

```bash
foamRun -solver incompressibleVoF 2>&1 | tee log.vof
grep -i "MULES" log.vof
```

对应的 VOF 相关 `fvSolution` 片段：

```cpp
solvers
{
    "alpha.water.*"
    {
        solver          smoothSolver;
        smoother        symGaussSeidel;
        tolerance       1e-8;
        relTol          0;
    }
    p_rgh
    {
        solver          GAMG;
        tolerance       1e-7;
        relTol          0.01;
    }
}
PIMPLE
{
    nAlphaSubCycles 1;
    cAlpha          1;
    nCorrectors     2;
    nOuterCorrectors 1;
}
```

`nAlphaSubCycles` 与 `cAlpha` 是 VOF 稳定性的两个最重要旋钮。调参经验上，cAlpha 通常取 1 左右：过小界面扩散、过大产生寄生流；nAlphaSubCycles 则由时间步与网格决定，界面移动越快就需要越多子步。表面张力主导的问题还应保证界面附近网格足够细，使毛细波被解析，否则任何调参都无法消除寄生流。验证 VOF 算例时，可追踪液面高度或界面位置随时间的演化，与解析解或实验数据对照；能量方面则应确认动能与势能之间的转换守恒。把这些标量与全局质量曲线放在一起观察，能同时暴露界面处理与守恒两方面的缺陷。

## 6. 常见坑与排查

第一类坑是相分数越界（小于 0 或大于 1），通常因未启用 MULES 或 `cAlpha` 过大。第二类是相间源项重复计入或符号不一致，应核对 $\mathbf{M}_{ab}=-\mathbf{M}_{ba}$。第三类是颗粒删除或裁剪未纳入全局质量平衡，导致质量凭空消失。第四类是混淆新旧 Lagrangian 接口，字典与类不匹配。第五类是表面张力过强造成寄生流，需要连同网格分辨率一起调优。

排查顺序：先做全局质量与动量平衡，再查相分数有界性，然后核对相间源符号，最后审计颗粒质量收支。审计时建议绘制全局质量随时间的曲线：对 VOF，两相质量之和应守恒；对欧拉多相，各相质量变化应与进出口及相变源一致；对 Lagrangian，连续相质量加上颗粒携带质量应守恒，注入与删除要计入。曲线不平时，再回头定位是哪一对源项或哪一次裁剪出了问题。最后，多相问题的调试顺序应先粗后细：先确认相分数、速度与压力都在物理范围内，再核对全局守恒，然后检查相间源项与界面参数，最后才调整时间步与线性求解器。把守恒审计前置，可以避免在错误的物理上做精细的数值调参。

## 7. 检查清单与参考

- [ ] 相分数输运启用 MULES 且保持有界；
- [ ] 混合物性与表面张力正确更新；
- [ ] 相间与颗粒源项成对且时间层一致；
- [ ] 颗粒注入与删除纳入质量守恒统计；
- [ ] 全局质量、动量、能量平衡均通过审计。

值得强调的是，多相流的很多发散其实是裁剪累积的结果：相分数被反复裁剪而守恒量未同步修正，误差逐步积累最终爆发。把裁剪量作为监控量记录下来，往往能提前发现隐患。总结而言，多相建模的正确性不取决于模型有多复杂，而取决于守恒是否严密：只要每一份质量、动量与能量都能找到来源与去向，再复杂的相间耦合也是可控的；反过来，若一处源项来历不明，整条链路都可能因此失真。

参考源码：

1. `applications/modules/incompressibleVoF/` 与 `multiphaseEuler/`。
2. `src/multiphaseModels/`、`src/twoPhaseModels/`、`src/Lagrangian/`。
3. `src/finiteVolume/fvMatrices/solvers/MULES/`。
