---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-fvc-fvm-fvmatrix
title: OpenFOAM 14 fvc/fvm 有限体积算子与 fvMatrix
summary: 以瞬态对流扩散方程为主线，解释 fvc 显式场计算、fvm 隐式矩阵装配、离散格式的运行时选择，以及 fvMatrix 中对角、上下三角、源项与边界贡献的装配与求解路径。
category: { slug: openfoam-v14-discretization, name: OpenFOAM 14 数学与离散 }
level: 工程
reading_minutes: 24
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
seo:
  title: OpenFOAM 14 fvc/fvm 算子与 fvMatrix 装配
  description: 讲清显式 fvc 与隐式 fvm 的区别、离散格式的运行时选择，以及 fvMatrix 的 LDU 系数、源项与边界贡献装配和求解。
  keywords: [OpenFOAM14, fvc, fvm, fvMatrix, 有限体积法]
tags: [OpenFOAM14, fvc, fvm, fvMatrix, 有限体积法]
---

# OpenFOAM 14 fvc/fvm 有限体积算子与 fvMatrix

## 1. 结论与适用场景

在 OpenFOAM 14 里，`fvc::` 与 `fvm::` 是有限体积离散的两个入口，分工只有一句话：`fvc::` 返回“已经算好的场”，表示显式操作；`fvm::` 返回 `tmp<fvMatrix<Type>>`，表示把未知量的系数装进矩阵、留给 `solve()` 统一求解。考虑守恒形式的输运方程：

$$
\frac{\partial(\rho\psi)}{\partial t}+\nabla\cdot(\rho\mathbf{U}\psi)-\nabla\cdot(\Gamma\nabla\psi)=S_\psi
$$

对控制体积分后，时间项进入对角与旧时间源项，对流和扩散在相邻单元之间形成耦合系数，源项则进入右端项或被线性化到对角。适用于：判断一个项该显式还是隐式、手写自定义方程、理解“同一个公式两种写法为何稳定性不同”。不适用于：把显式/隐式只当成写法偏好——它决定了稳定性、内存与迭代耦合，是有物理后果的选择。

把方程的每一项都标上“显式或隐式”，是读离散代码最有效的一项训练。隐式项把未知量留在方程左边，形成需要求解的矩阵；显式项用已知值算出后搬到右边，成为源项。这条简单规则背后，是两类完全不同的数值行为：隐式换取稳定性与更大的时间步，显式换取更低的装配成本与更简单的实现。工程上的成熟代码几乎从不极端地全显式或全隐式，而是在两者之间逐项权衡。

## 2. 总体架构

有限体积离散层的结构可以自上而下分为四步。第一步是插值：把单元中心值插到面上，得到面值与面通量，由 `surfaceInterpolation` 及各类插值格式完成。第二步是对流与扩散的离散：对流需要面值与通量，扩散需要面法向梯度，分别由 `convectionScheme` 与 `laplacianScheme` 处理。第三步是装配：`fvm` 把系数写进 `fvMatrix`，`fvc` 直接对各单元求和返回场。第四步是求解：`fvMatrix::solve()` 下沉到 LDU 线性代数层。

关键设计是“格式的运行时选择”。`fvm::div(phi, psi)` 并不硬编码某个格式，而是依据 mesh 上的 `fvSchemes` 字典查找对应的离散方案对象，再由该对象完成面插值、限制与系数装配。这就是为什么修改 `fvSchemes` 能在不重新编译的情况下改变数值方法：格式本身就是可插拔对象，与湍流模型用的是同一套选择机制。

显式与隐式的分界则塑造了整个求解器的结构。显式项只贡献右端，装配快、内存少，但受稳定性约束（例如显式对流受 Courant 数限制）；隐式项进入矩阵，无条件稳定但需要迭代求解并付出内存代价。真实求解器几乎总是混合使用：对稳定性敏感的项隐式，对精度敏感的项可显式，从而在代价与鲁棒之间取得平衡。

还有一个容易被忽略的事实：同一个物理项可以写出不同的隐式程度。例如对流项可以用延迟修正，拆成“隐式一阶部分加显式高阶差额”，既保持对角占优又逐步逼近高阶；扩散项的非正交修正也以显式方式迭代进去。这些做法的共同思路，是把难以隐式化的部分作为已知量搬到右端，并用多次迭代逐步逼近完整离散。理解这个模式，就能看懂许多看似“多此一举”的额外循环。

## 3. 关键类与调用链

一条典型链条是：求解器写出 `fvm::ddt(rho, psi) + fvm::div(phi, psi) - fvm::laplacian(Gamma, psi) == fvOptions(psi)` → 运算符重载构造 `fvMatrix<Type>` → 每个 `fvm::` 项把系数累加进对角与上下三角 → `fvMatrix::solve()` 依据 `fvSolution` 选择 LDU 求解器 → 返回 `solverPerformance`。显式项（如 `fvc::div`）则在此过程中作为 `tmp<GeometricField>` 直接进入源项。

```text
fvm::ddt(rho,psi)   ->  对角 += rho*V/dt;  源项 += rho*V/dt*psi.oldTime()
fvm::div(phi,psi)   ->  格式对象装配上下三角与对角
fvm::laplacian(G,psi)->  对角与上下三角 += Gamma_f*Delta_f
fvc::div(phi,psi)   ->  直接返回面通量求和后的场（显式）
fvMatrix::solve()   ->  lduMatrix::solver（PCG/PBiCGStab/GAMG）
```

显式与隐式项在数学上等价、在实现上分道扬镳。把一个项写成隐式，意味着解方程 $A_P\psi_P+\sum_N A_N\psi_N=b_P$；写成显式，意味着把它挪到右端并以当前值计算。对流项的隐式装配依赖面值格式：

$$
\psi_f=\psi_P+\frac{1}{2}\psi_{\text{lim}}(r)\left(\psi_N-\psi_P\right)
$$

其中 $\psi_{\text{lim}}(r)$ 为限制器函数。限制器的存在，使对流离散在高阶与有界之间取得折中，也让“同一个 `div` 项改格式”成为最常调整的数值旋钮。时间项进入对角的形式则为：

$$
\frac{\partial}{\partial t}\int_{V_P}\rho\psi\,dV\approx\frac{\rho_P V_P}{\Delta t}\left(\psi_P^{(n)}-\psi_P^{(n-1)}\right)
$$

把这三类项放在一起，就能读出 `fvMatrix` 的构造逻辑：时间项与部分对流贡献堆到对角，交叉耦合进入上下三角，而显式项与边界贡献堆到右端。矩阵的每一次求解，本质上是在已知系数基础上把这条平衡重新满足一遍。

## 4. 代码走读要点

读 `fvMatrix` 时先看它的数据成员：LDU 三组系数（`diag()`、`upper()`、`lower()`）、体积源项数组（`source()`）、边界内部系数与边界系数（`internalCoeffs()`、`boundaryCoeffs()`）、对未知场的引用（`psi()`）以及量纲（`dimensions()`）。这些成员共同表达“这个矩阵代表哪条方程、作用于哪个场”。边界不是事后补丁，而是装配阶段就并入对角（内部系数）与右端（边界系数），因此边界条件的数学行为会直接改变矩阵性质。

读生成端时关注运算符重载。`fvm::ddt`、`fvm::div`、`fvm::laplacian` 返回 `fvMatrix`，它们之间用 `+`、`-`、`==` 组合时，会以表达式临时对象（`tmp`）的方式累加，避免不必要的深拷贝；`==` 把右端项并入源项。最终 `solve()` 调用时，矩阵已经是“对角 + 上下三角 + 源项 + 边界”的完整形态。二次开发中若手写方程，务必保持这一装配顺序，并确认量纲一致，否则会在求解或写出阶段报错。

需要特别留意的是 `==` 的语义：它不是 C++ 的比较，而是“把右边的表达式作为源项并入当前矩阵”。因此把两个 `fvMatrix` 用 `==` 相连会得到意料之外的结果，正确写法是把所有隐式项相加后用 `==` 接一个显式表达式。这个细节在自写方程时非常容易出错，也是阅读别人代码时需要提前建立的共识。

还有一个判断要点是“能不能线性化”。源项若依赖未知量，可以通过 `SuSp` 一类工具拆成显式部分（进右端）与隐式部分（进对角），从而在保持有界的同时改善对角占优。这属于工程技巧，但它的正确性依赖对矩阵结构的清晰理解。

从阅读效率看，建议先建立“每个 `fvm::` 项对应一块矩阵贡献”的心智模型，再去看具体格式实现。与直接逐行读插值与限制器代码相比，先掌握装配骨架，能让后面的细节都有地方落地。反之，一开始就扎进限制器公式，很容易在细节中失去方向，不知道为什么在算这个面值。

## 5. 可复现示例

下面展示一个标量输运方程的最小写法，以及把某项从显式改为隐式时唯一需要改动的位置：

```cpp
// 瞬态对流扩散：T 为标量，phi 为面通量
fvScalarMatrix TEqn
(
    fvm::ddt(T) + fvm::div(phi, T) - fvm::laplacian(DT, T)
    ==
    fvOptions(T)          // 源项/约束
);
TEqn.relax();             // 可选：显式松弛
TEqn.solve();
```

```bash
# 改格式后必须重新收敛到同一判据再对比
sed -i 's/div(phi,T).*/div(phi,T) bounded Gauss linearUpwind grad(T);/' system/fvSchemes
foamRun -solver scalarTransport > log.run 2>&1
grep -E "Solving for T|residual" log.run | tail
# 对比显式与隐式两种写法的稳定性（伪代码）
#   仅把 - fvm::laplacian 改为 + fvc::laplacian（显式），观察 Courant 数上限制
```

判读要点：隐式写法在较大时间步下仍稳定，但每步需要迭代；显式写法装配快，却要求 Courant 数受控。将同一算例的两种写法在相同网格上对比，能直观建立“稳定性—代价”的对应关系，而不是停留在公式层面。

建议把“显式还是隐式”作为一个可验证的实验变量：固定其他条件，只改一项的显隐属性，记录能稳定推进的最大时间步与总耗时。这样的对照能把抽象结论变成可重复的经验，也能在后续选型时有数可依。

## 6. 常见坑与排查

- 把显式与隐式当成纯风格：忽略稳定性差异，导致大时间步下震荡或发散；
- 漏掉 `bounded` 前缀：含源项的对流项在二阶格式下剧烈过冲，极值越界；
- 边界当作事后修正：忘了边界系数会进入对角，误以为边界只影响右端；
- 量纲不一致：两个不同量纲的项相加会在运行期报错，应在写方程时立即核对；
- 表达式临时对象使用不当：对 `tmp<fvMatrix>` 反复取用或提前释放，引发悬空引用；
- 改格式后未重新收敛：格式差异被未收敛误差淹没，结论不可信；
- 忽视边界与内部项的耦合：边界系数同样进入对角，边界设置不当会直接恶化矩阵条件数；
- 把松弛当万能：松弛只能改善迭代行为，无法修复错误的离散或量纲。

排查顺序建议：先确认方程各项的量纲与显隐属性 → 再确认 `fvSchemes` 中每个 `div` 项都已显式列出且为有界格式 → 再确认边界条件与矩阵装配相容 → 最后看求解器残差与目标量。把“格式—装配—求解”三层分开定位，能避免在错误的层面反复试错。

最后强调一个常被忽视的前提：离散层只负责把方程忠实地变成矩阵，它不能修正错误的物理模型或劣质网格。若目标量异常，先回到物理设置与网格质量，再回来调整显隐与格式，才是正确的排查次序。

## 7. 检查清单与参考

- [ ] 每个离散项都明确是 `fvm::`（隐式）还是 `fvc::`（显式）；
- [ ] `fvSchemes` 中所有 `div` 项显式列出，对流用有界格式；
- [ ] `fvMatrix` 的对角、上下三角、源项与边界系数装配顺序正确；
- [ ] 边界条件通过 `internalCoeffs`/`boundaryCoeffs` 正确并入矩阵；
- [ ] 量纲一致，表达式临时对象生命周期安全；
- [ ] 格式改动后已重新收敛到同一判据再对比。

参考资料：

1. `src/finiteVolume/finiteVolume/fvc/` 与 `fvm/`。
2. `src/finiteVolume/fvMatrices/fvMatrix/fvMatrix.H`。
3. `src/finiteVolume/finiteVolume/convectionSchemes/` 与 [fvSchemes 离散格式与有界性](../../openfoam/04-numerics-boundaries/openfoam-fvschemes.md)。
