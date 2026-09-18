---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-incompressible-pimple
title: OpenFOAM 14 incompressibleFluid 的 PIMPLE 与压力校正
summary: 从不可压缩 Navier-Stokes 方程推导速度预测与压力泊松方程，逐行对照 incompressibleFluid 的动量矩阵缓存、rAU、HbyA、phiHbyA、非正交循环、pEqn.flux 通量更新与速度校正源码。
category: { slug: openfoam-v14-solver-flow, name: OpenFOAM 14 求解流程 }
level: 专题
reading_minutes: 28
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, incompressibleFluid, PIMPLE, 压力速度耦合, HbyA]
seo:
  title: OpenFOAM 14 incompressibleFluid 的 PIMPLE 与压力校正
  description: 逐行解析 incompressibleFluid 的 PIMPLE 循环与压力校正：rAU、HbyA、phiHbyA、压力泊松方程、pEqn.flux 通量更新与速度校正。
  keywords: [incompressibleFluid, PIMPLE, HbyA, phiHbyA, pressure correction, OpenFOAM 14]
---

# OpenFOAM 14 incompressibleFluid 的 PIMPLE 与压力校正

不可压缩等温流满足质量守恒

$$ \nabla\cdot\mathbf{U}=0 $$

与动量方程（源码中的 `p` 是运动学压力，量纲 m²/s²）：

$$ \frac{\partial\mathbf{U}}{\partial t}+\nabla\cdot(\mathbf{U}\mathbf{U})=-\nabla p+\nabla\cdot(\nu\nabla\mathbf{U})+\mathbf{s}_U $$

压力没有本征演化方程，它的作用只是把速度场“投影”回无散度空间。`incompressibleFluid` 用 PIMPLE 算法完成这一投影：先由动量方程预测速度，再用压力泊松方程校正，使离散连续性得以保证。这一“预测—校正”思想是分离式压力—速度耦合的全部内核，它把速度与压力解耦为两个较易求解的子问题：速度由动量方程显式预测，压力由泊松方程隐式求解，交替进行直至收敛；代价是收敛速度依赖耦合强度，因此需要外循环与松弛。

![机翼绕流速度云图与流线](../../assets/simulations/openfoam-airfoil-velocity-streamlines.png)

*图：不可压外流场的速度分布与流线概念图，用于理解压力—速度耦合后的场结构。该图为 AI 生成的教学示意，不代表经过网格无关性与实验验证的定量结果。*

## 1. 结论与适用场景

`incompressibleFluid` 采用 PIMPLE，即“PISO 压力修正内循环 + SIMPLE 外循环”的组合。它适用于常密度、低速、可视为不可压的流动，例如外流绕流、内流管道、低速风机等；配合浮力变体可扩展到热浮力驱动流。其要点有四：动量矩阵在一次外循环内被缓存复用；以 `rAU=1/A_P` 构造 `HbyA`；压力泊松方程决定修正量；面通量由压力方程直接更新以保证离散守恒。

选型判据很直接：当时间步小、对流主导时，PIMPLE 外循环可减到 1，退化为 PISO；当库朗数较大或方程强耦合时，则增大 `nOuterCorrectors`。伪瞬态稳态也走同一套代码，只是把“时间”当作收敛参数逐步放松。需要牢记的是，压力只被定义到相差一个常数，封闭域必须钉住压力水平，否则压力方程奇异。与可压缩流不同，这里的密度是常数或由浮力模型给定，不随压力变化，因此压力方程是纯泊松型而非含时间导数型，这直接决定了它必须由连续性约束导出。也正因为压力方程不含时间导数，它的“时间步”概念只通过动量矩阵对角与通量间接进入，这使得 PISO 需要在一个时间步内多次修正，才能让速度场逐步逼近无散度状态；每次修正都复用缓存的动量矩阵，因此线性系统规模不变，只是右端项更新。

## 2. 总体架构

模块继承链为 `incompressibleFluid → isothermalFluid → basicFluidSolver → solver`。文件层面：`incompressibleFluid.H/.C` 定义场与算法对象，`correctPressure.C` 实现压力校正，动量预测在 `momentumPredictor` 相关实现中。关键字段里 `p` 是运动学压力 `volScalarField`，`phi` 是面通量 `surfaceScalarField`，它是离散守恒量的真正载体；校正单元速度并不等价于校正通量，这是本模块最容易被忽视的守恒细节。

为什么强调 `phi` 而不是 `U`？因为有限体积法的质量守恒是逐面累加的，只有面通量满足 $\sum_f\phi_f=0$ 才等价于离散连续性；由校正后的单元速度重新插值得到的面通量一般并不满足该关系，误差会随时间累积。因此本模块的所有守恒讨论都应围绕 `phi` 展开，`U` 只是它的“配套表示”。实践中还可以用 `phi` 与 `U` 的一致性做自检：由 `U` 插值得到的通量与 `phi` 之差应仅来自压力修正项；若二者差距异常大，通常说明某处对通量做了未同步的修改，例如自定义源项直接改了 `U` 却忘了改 `phi`。

运行过程中有三个必须成立的不变量：其一，单元级离散连续性，即对每个单元面通量满足 $\sum_f\phi_f=0$；其二，动量方程对角可逆，即 $A_P>0$，否则 `1/A_P` 无意义，矩阵病态时这一条最先失守；其三，压力水平固定，封闭域需 `pRefPoint`/`pRefValue`。任何一次校正若不满足这三条，都会在后续迭代中被放大成全局误差。这三个不变量也给出了调参方向：连续性不满足应查压力边界与参考点；对角非正应查动量方程系数与源项线性化；压力漂移则是参考条件问题。把不变量当作诊断清单，比盲目试参数高效得多。在与湍流模型耦合时，`nut` 随每次求解更新并改变动量矩阵对角，因此每个外循环都要重新形成矩阵，缓存只在单次外循环内有效。

## 3. 关键类与调用链

主调用链如下：

```text
incompressibleFluid::run() 每个时间步:
  momentumPredictor()
     tUEqn = fvm::ddt(U) + fvm::div(phi,U) - fvm::laplacian(nu,U)   # 缓存
     tUEqn.solve() 或 UEqn 求解（含 MRF / 源项）
  pressureCorrector()  -> correctPressure.C
     for corr in 1..nCorrectors:
        装配并求解 pEqn
     用 pEqn.flux() 更新 phi，松弛 p
     U = HbyA - rAU*grad(p);  U.correctBoundaryConditions()
```

把离散动量方程写成

$$ a_P\mathbf{u}_P=\mathbf{H}(\mathbf{u}) $$

其中 $\mathbf{H}$ 汇总邻居项与显式源项。据此定义动量预测的构造系数

$$ \mathrm{rAU}=\frac{1}{a_P},\qquad \mathbf{HbyA}=\mathrm{rAU}\,\mathbf{H}(\mathbf{u}) $$

于是速度可写为 $\mathbf{U}=\mathbf{HbyA}-\mathrm{rAU}\nabla p$。对其取散度并代入连续性 $\nabla\cdot\mathbf{U}=0$，散度作用于 $\mathbf{HbyA}$ 与压力梯度两项，得到压力泊松方程

$$ \nabla\cdot(\mathrm{rAU}\nabla p)=\nabla\cdot\mathrm{HbyA} $$

这是一个以 $p$ 为未知量的泊松型方程，系数 $\mathrm{rAU}$ 来自动量矩阵对角。注意 $\mathrm{rAU}$ 随空间变化：在边界层或系数变化剧烈处，它与 1 相差较大，这正是压力方程具有变系数的原因；把它当作常数会在这些区域引入额外误差。求解后回代即得速度校正

$$ \mathbf{U}=\mathbf{HbyA}-\mathrm{rAU}\nabla p $$

而面通量校正是守恒的关键：

$$ \phi=\mathrm{phiHbyA}-\left(\mathrm{rAtU}\right)_f(\nabla p)_f\cdot\mathbf{S}_f $$

值得注意的是，`rAtU` 是 `rAU` 在面上的插值，最后一项由压力方程的离散拉普拉斯直接给出，因此 `phi` 天然满足单元级连续性，无需额外修正。从能量观点看，压力在不可压缩流中不做功，只承担“投影”角色：它把动量预测得到的中间速度投影到散度为零的子空间；这也是为何压力水平可以任意平移而不改变速度——只有压力的梯度才有物理意义。

## 4. 代码走读要点

`correctPressure.C` 的结构可抽象为：

```cpp
// 取自 incompressibleFluid/correctPressure.C 的关键步骤
const volScalarField rAU(1.0/UEqn.A());
const volVectorField HbyA(constrainHbyA(rAU*UEqn.H(), U, p));
surfaceScalarField phiHbyA("phiHbyA", fvc::flux(HbyA));
// 此处叠加 MRF、浮力、网格运动等对 phiHbyA 的贡献

fvScalarMatrix pEqn(fvm::laplacian(rAU, p) == fvc::div(phiHbyA));
pEqn.setReference(pRefCell, pRefValue);   // 封闭域钉住压力水平
pEqn.solve();

phi = pEqn.flux();                       // 用压力方程通量更新 phi
U = HbyA - rAU*fvc::grad(p);             // 速度校正
U.correctBoundaryConditions();
```

这里有四个要点。第一，`phiHbyA` 与 `phi` 之差正是压力修正对通量的贡献，二者不可混用。第二，`pEqn.flux()` 直接给出满足离散连续性的面通量，比自己插值更可靠。第三，非正交网格需借 `nNonOrthogonalCorrectors` 让压力方程重复修正，以消除非正交引起的滞后，迭代次数随网格非正交度增大。第四，移动网格必须把绝对通量换算为相对网格通量，否则通量里混入了网格运动速度，压力方程会随之失真。此外，`constrainHbyA` 会把边界上的 `HbyA` 约束到与边界压力条件一致，避免边界附近出现不物理的修正。对于 MRF 与多参考系，还需在 `phiHbyA` 中补入旋转引起的相对通量；对变密度扩展，则在 `rAU` 与通量中携带密度因子，思路完全一致，只是系数量纲不同。

## 5. 可复现示例

下面给出的骨架省略了 MRF、浮力与非正交循环，只保留压力—速度耦合的最核心步骤，把它补全即可得到完整实现。最小 PISO 压力校正骨架，可直接对照 `correctPressure.C`：

```cpp
// 简化自 incompressibleFluid/correctPressure.C
fvVectorMatrix UEqn(fvm::ddt(U) + fvm::div(phi, U) - fvm::laplacian(nu, U));
UEqn.solve();

const volScalarField rAU(1.0/UEqn.A());
const volVectorField HbyA(rAU*UEqn.H());
surfaceScalarField phiHbyA("phiHbyA", fvc::flux(HbyA));

fvScalarMatrix pEqn(fvm::laplacian(rAU, p) == fvc::div(phiHbyA));
pEqn.setReference(pRefCell, pRefValue);
pEqn.solve();

phi = pEqn.flux();
U = HbyA - rAU*fvc::grad(p);
U.correctBoundaryConditions();
```

运行并检查离散连续性误差：

```bash
foamRun -solver incompressibleFluid 2>&1 | tee log.incompressibleFluid
grep -i "continuity errors" log.incompressibleFluid
```

连续性误差应保持在机器精度到 $10^{-6}$ 量级；若长期偏高，多半是压力边界或参考压力设置有问题，而不是线性求解器容差不够。把该误差与压力方程的外迭代残差并列观察，可快速区分“压力未收敛”与“压力边界不一致”两类问题。读日志时再配合库朗数与速度上下界一起看：若连续性误差大而压力残差小，多半是边界输入不守恒；若两者都大，则更可能是时间步或非正交修正不足。

## 6. 常见坑与排查

第一类坑是压力边界用 `fixedValue` 而非 `fixedFluxPressure`，导致压力与通量不一致，连续性残差居高不下。第二类是封闭域漏设 `pRefPoint`/`pRefValue`，压力方程奇异，解沿常数方向漂移。第三类是忘记 `U.correctBoundaryConditions()`，边界速度与内部解不一致。第四类是非正交修正次数不足，压力场出现棋盘或振荡。第五类是用校正后的单元速度重新插值求通量，破坏了单元级守恒，正确做法是 `phi = pEqn.flux()`。第六类是松弛不当，`p` 松弛过大导致压力场滞后、连续性漂移。

排查顺序：连续性误差 → 压力边界类型 → 参考压力 → 非正交修正次数 → 松弛因子。数值参数不应作为修补错误物理输入的第一手段；先用量纲、边界与守恒关系把问题范围缩小，再动求解器参数。尤其当连续性误差随时间单调增长时，应优先检查进出口通量是否整体平衡，而不是加大压力修正次数。当问题确实源于欠松弛过度时，可先在同一算例上做松弛敏感性对比，确认结果对松弛因子不敏感后再固化参数。

## 7. 检查清单与参考

- [ ] 明确 `p` 为运动学压力，单位 m²/s²；
- [ ] 壁面/出口用 `fixedFluxPressure`，封闭域设参考压力；
- [ ] `nCorrectors`/`nOuterCorrectors` 与库朗数匹配；
- [ ] 通量始终由 `pEqn.flux()` 更新，而非对单元速度重新插值；
- [ ] 每步日志中都监控离散连续性误差与残差。

以上检查项的核心是：压力方程的解必须与面通量守恒绑定，任何绕过 `pEqn.flux()` 的自定义修正都要单独验证其守恒性。建议在开发阶段把连续性误差作为一等公民写入监控，而不是等结果出现质量漂移后才回头追查。

参考源码：

1. `applications/modules/incompressibleFluid/incompressibleFluid.{H,C}`。
2. `applications/modules/incompressibleFluid/correctPressure.C`。
3. `applications/modules/isothermalFluid/`。
4. `src/finiteVolume/cfdTools/general/constrainHbyA/`。
