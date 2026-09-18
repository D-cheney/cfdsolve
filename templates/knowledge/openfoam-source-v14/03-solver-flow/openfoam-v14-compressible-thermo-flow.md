---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-compressible-thermo-flow
title: OpenFOAM 14 可压缩流、能量与热物性调用链
summary: 以 fluid 模块为主线，梳理质量、动量、能量、状态方程与热物性模型之间的依赖，说明密度、压力、焓或内能、温度及热输运在预测校正顺序中的更新时机，并给出可复现的热物性字典。
category: { slug: openfoam-v14-solver-flow, name: OpenFOAM 14 求解流程 }
level: 专题
reading_minutes: 25
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, fluid, 可压缩流, 能量方程, basicThermo]
seo:
  title: OpenFOAM 14 可压缩流、能量与热物性调用链
  description: 解析 fluid 模块的质量、动量、能量与状态方程耦合，说明 basicThermo、heThermo 与热输运在预测校正链中的调用顺序。
  keywords: [fluid solver, 可压缩流, basicThermo, hePsiThermo, 能量方程, OpenFOAM 14]
---

# OpenFOAM 14 可压缩流、能量与热物性调用链

可压缩流必须同时闭合质量、动量、能量与状态关系，任一环缺失都会导致方程组不封闭。质量守恒与动量守恒为

$$ \frac{\partial\rho}{\partial t}+\nabla\cdot(\rho\mathbf{U})=0 $$

$$ \frac{\partial(\rho\mathbf{U})}{\partial t}+\nabla\cdot(\rho\mathbf{U}\mathbf{U})=-\nabla p+\nabla\cdot\boldsymbol{\tau}+\rho\mathbf{g} $$

能量守恒以显焓形式进入方程（$K$ 为比动能）：

$$ \frac{\partial(\rho h)}{\partial t}+\nabla\cdot(\rho\mathbf{U}h)+\frac{\partial(\rho K)}{\partial t}+\nabla\cdot(\rho\mathbf{U}K)-\frac{\partial p}{\partial t}=\nabla\cdot(\alpha_{\mathrm{eff}}\nabla h)+S_h $$

而状态方程与热力学关系把 $p$、$\rho$、$T$、$h$ 联系起来：

$$ \rho=\frac{p}{RT},\qquad h=\int c_p\,dT,\qquad a=\sqrt{\gamma R T} $$

其中 $a$ 是声速，直接决定可压缩性的强弱与时间步约束。

## 1. 结论与适用场景

在 OpenFOAM 14 中，可压缩、含能量的物理集中在 `extra` 之外的 `fluid` 模块，它建立在 `isothermalFluid`（只解质量与动量、密度可由状态方程给出但不解能量）之上，再叠加 `basicThermo` 与 `heThermo` 提供热物性。适用场景包括亚音速、跨音速与超音速内外流，自然对流与可压缩传热，以及燃烧计算之前的冷态流动。

它的核心结论有三：其一，求解变量由 `thermophysicalProperties` 的 `energy` 项决定，是显焓 `h` 还是内能 `e`，二者不可混用；其二，温度 `T` 通常不是求解量，而是由焓或内能经热物性反算的派生量；其三，密度 `rho` 由状态方程在压力校正后更新，密度一旦变化，质量通量 `phi` 也必须同步更新，否则质量守恒被破坏。除此之外，湍流引起的附加热扩散通过 `alphat` 进入有效扩散系数，忽略它会让壁面热流系统性偏低。从演进历史看，可压缩能量求解曾分散在 rhoCentralFoam、sonicFoam、buoyantPimpleFoam 等独立求解器中；14 把它们收敛到 fluid 与 isothermalFluid 两个模块，通过字典区分是否求解能量。这一收敛带来一个实践好处：同一算例可以在 isothermalFluid 与 fluid 之间切换来对比能量效应，而无需更换入口；代价是字典必须写全，缺失的 thermophysicalProperties 会让模块在构造期直接报错，而非静默取默认值。从工程实践看，可压缩算例最容易出问题的地方往往不是方程本身，而是物性数据与工况不匹配。给定的比热、粘度与分子量必须能覆盖求解过程中温度与压力的取值范围，否则热物性反算出的温度会失真，进而污染密度与压力。建议在设置阶段先用典型工况估算温度范围，再选择合适的状态方程与热容模型，而不是照搬他人算例的默认值。

## 2. 总体架构

模块层次是 `applications/modules/isothermalFluid` → `applications/modules/fluid`。热物性体系位于 `src/thermophysicalModels/`：`basic/` 提供公共接口（`basicThermo`、`heThermo`、`psiThermo`、`rhoThermo`），`specie/` 定义组分与摩尔质量，`thermo/` 提供状态方程（`perfectGas`、`rhoConst`、`PengRobinsonGas` 等），`transport/` 提供输运（`const`、`sutherland`、`polynomial` 等）。热扩散的闭合则在 `src/ThermophysicalTransportModels/`，例如层流 `Fourier` 与湍流 `eddyDiffusivity`。

这些组件并非手写组合，而是由运行时选择加模板递归组装，例如 `hePsiThermo<pureMixture<constTransport<hConstThermo<perfectGas<specie>>>>>`。字典 `constant/thermophysicalProperties` 的每一项最终都映射到模板的某层：`type` 选顶层热物性策略，`mixture` 选混合物，`equationOfState` 选状态方程，`thermo` 选热容模型，`transport` 选输运模型，`specie` 选组分。理解这一点，就能把字典里的字符串翻译成真实的 C++ 类型。构造完成后，热物性对象被注册到对象注册表中，求解器通过 thermo 引用访问 psi()、T()、rho()、Cp() 等接口。这一点很重要：rho、T、psi 往往既是注册表中的场，又由热物性对象维护其取值，二者之间的更新顺序决定了解是否自洽；追踪“谁在什么时候写了 rho”比通读整个热物性库更能揭示耦合结构。从耦合结构看，能量方程与动量方程通过密度相连，密度又通过状态方程与温度、压力相连，三者实际上构成一个整体。任何把其中两个固定、只调第三个的做法，都只能得到局部自洽的假象。正确做法是同时监控三者，并把它们之间的自洽性纳入收敛判据，而不是孤立地看单场残差。

## 3. 关键类与调用链

`fluid` 模块每个时间步的内层顺序可概括为：

```text
fluid::run() 每个时间步:
  thermophysicalPredictor()        # 能量方程求解，更新 h/e，再反算 T、psi、rho
  momentumPredictor()              # 动量方程（含 rho），得到预测速度
  pressureCorrector()              # 可压缩压力方程，更新 p 与 rho、phi
  thermophysicalTransportCorrector()   # 更新 alphat 等热输运系数
```

在 psi 路线（`hePsiThermo`）下，状态关系为

$$ \psi=\frac{1}{RT},\qquad \rho=\psi p $$

能量方程求解的变量由 `energy` 项决定：

$$ \frac{\partial(\rho e)}{\partial t}+\nabla\cdot(\rho\mathbf{U}e)=-\nabla\cdot(\alpha_{\mathrm{eff}}\nabla e)+S_e $$

（若选择 `sensibleEnthalpy`，则求解量为 $h$，形式相同。）压力校正在可压缩下不再是纯泊松型，而带有质量变化项

$$ \frac{\partial\rho}{\partial t}+\nabla\cdot(\mathrm{rhoHbyA})-\nabla\cdot(\mathrm{rAU}\,\rho\,\nabla p)=0 $$

其中 $\mathrm{rhoHbyA}$ 是把密度带入后的动量预测通量。与不可压缩的关键区别在于：这里 $p$ 通过状态方程直接影响 $\rho$，进而影响质量守恒，因此压力方程与密度、能量强耦合。这种强耦合在不同马赫数下表现不同：低马赫数时声速项使压力方程接近奇异，方程组刚性增大、收敛变慢，通常需要更多外循环与合适的预条件；高马赫数时对流主导，激波与接触间断要求通量格式具备足够的限制器，否则会出现非物理振荡。因此同一套字典在马赫数跨越很大范围时并不通用，应针对流态分别校核。对于涉及换热壁面的可压缩算例，除温度场外还应关注热流方向的正确性：热流应从高温指向低温，若出现反向，通常意味着温度梯度计算或热扩散系数符号有误。这类错误不会立刻导致发散，却会给出方向完全相反的结论，是后处理阶段最值得警惕的问题之一，务必用壁面热流与温度场相互印证。

## 4. 代码走读要点

读 `fluid` 源码时抓五条线。第一，温度是派生量：`heThermo` 依据当前焓或内能反算 `T`，除非你显式求解温度场。第二，`rho` 的拥有者：可压缩模块中 `rho` 由状态方程在压力校正后更新，任何手动修改 `rho` 的地方都必须同步 `phi`。第三，字典映射：把 `thermophysicalProperties` 每项对应到具体模板类型，确认没有落到默认值。第四，热扩散闭合：`alphat` 由 `thermophysicalTransport` 提供，湍流普朗特数经此进入有效扩散。第五，$psi$ 的角色：它把压力与密度线性联系，出现在压力方程系数中，因此 `psi` 的更新时机直接影响压力方程的正确性。若把这几条线的更新时机画成时序图，能量与压力的耦合就一目了然。另一个容易忽略的点是密度的“所有者”：在 fluid 中，rho 既可由状态方程在压力校正后更新，也可能被求解器在读场时刷新；如果自定义的 fvModel 或边界也去改 rho 却不更新 phi，质量守恒会立刻被破坏。稳妥的做法是只在一个明确的位置更新 rho，并紧跟一次通量更新，把这一对操作当作原子步骤。可压缩算例的时间步还与声速紧密相关：由库朗数定义可知，声速越大允许的时间步越小。当马赫数很低时，声速项会把时间步压得过低，此时可考虑低马赫数预处理或改用不可压近似，以免为几乎不可压的流动付出可压缩的代价。

## 5. 可复现示例

最小可压缩热物性字典（关键片段）：

```cpp
// constant/thermophysicalProperties
thermoType
{
    type            hePsiThermo;
    mixture         pureMixture;
    transport       const;
    thermo          hConst;
    equationOfState perfectGas;
    specie          specie;
    energy          sensibleEnthalpy;
}
mixture
{
    specie          { molWeight 28.96; }
    thermodynamics  { Cp 1005; Hf 0; }
    transport       { mu 1.8e-5; Pr 0.7; }
}
```

运行并检查温度、压力与密度范围：

```bash
foamRun -solver fluid 2>&1 | tee log.fluid
grep -E "Min/Max (T|p|rho)" log.fluid
```

若 `T` 出现负值或压力出现非物理跳变，应先降低库朗数并检查能量边界，而不是先调线性求解器容差。验证可压缩解时，除连续性外还应核算全局能量收支：总焓随时间的变化应等于进出口焓通量、壁面热流与体积源之和，任何显著残差都提示能量离散或物性映射有误。壁面热流可由 wallHeatFlux 功能对象直接给出，与温度梯度手算对照，是定位热扩散闭合问题的快捷手段。阅读 fluid 模块时，建议从 run() 出发，按热物性预测、动量预测、压力校正、热输运校正的顺序画出时序，并为每个钩子标注它读写哪些场。把这张时序图与热物性字典的类型展开图叠在一起，几乎可以解释可压缩算例中的全部数值现象，也让定位问题的范围迅速收窄。

## 6. 常见坑与排查

第一类坑是物性超出有效温压范围，例如负温度或负压力，这通常是能量方程发散或库朗数过大的后果，应先降时间步。第二类是能量变量不一致：字典 `energy` 与实际求解场不符，导致能量记账错误。第三类是热扩散被忽略：只给 `mu` 而不给 `Pr` 或 `alphat`，壁面热流会明显偏差。第四类是压力校正未同步更新密度与通量，造成质量不守恒。第五类是状态方程与边界冲突，例如同时固定相互矛盾的 $p$ 与 $\rho$。

排查顺序为：先查量纲与 $p$、$\rho$、$T$ 三者一致性，再核算壁面热流平衡与总能量通量，最后回到库朗数与线性求解。物性越界的报错往往只是后果，根因多在能量离散或时间步。调试顺序建议为：先确认 p、rho、T 的上下界是否物理，再核对能量收支，然后检查热扩散系数与湍流普朗特数，最后才调整线性求解器与松弛。把“物性越界”当成症状而非病因，可以少走很多弯路。总而言之，可压缩求解的难点从来不是单个方程，而是四个方程之间错综的依赖关系。把依赖关系画清楚、把守恒量盯住、把物性范围守好，剩下的数值参数才有意义；反之，若这三点不成立，再好的求解器设置也只是在错误的基础上堆砌细节，无法得到可信的结果。

## 7. 检查清单与参考

- [ ] `thermophysicalProperties` 每项都能映射到具体模板类型；
- [ ] 明确能量求解变量（`h` 或 `e`）且与 `energy` 字典一致；
- [ ] `alphat`/`Pr` 已按湍流模型正确设置；
- [ ] 压力校正后 `rho` 与 `phi` 同步更新；
- [ ] 监控总焓与壁面热流，核对其守恒。

参考源码：

1. `applications/modules/fluid/` 与 `isothermalFluid/`。
2. `src/thermophysicalModels/basic/` 与 `specie/`。
3. `src/ThermophysicalTransportModels/`。
