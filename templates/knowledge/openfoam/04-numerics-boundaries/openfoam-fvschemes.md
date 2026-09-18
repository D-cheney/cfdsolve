---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-fvschemes
title: OpenFOAM fvSchemes 离散格式与有界性
summary: 按时间、梯度、对流、扩散和插值项逐一解释 fvSchemes 的格式选择，给出从有界一阶基线到高阶限制格式的升级路线、非正交修正设置与极值守恒验收方法。
category: { slug: openfoam-numerics-boundaries, name: OpenFOAM 边界与数值设置 }
level: 进阶
reading_minutes: 16
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, fvSchemes, 离散格式, 有界性, 数值耗散, 非正交修正]
seo:
  title: OpenFOAM fvSchemes 离散格式选择与有界性
  description: 为时间、梯度、对流和扩散项选择稳健准确的格式，检查有界性、数值扩散与非正交修正。
  keywords: [fvSchemes, divSchemes, OpenFOAM discretization, limitedLinear]
---

# OpenFOAM fvSchemes 离散格式与有界性

`fvSchemes` 决定有限体积方程里每一个导数项在面上如何被近似，直接决定数值耗散、振荡倾向与非正交误差。格式没有绝对的好坏，只有针对给定网格、目标物理量与精度要求的合适与否。工程上真正要紧的是：先建立有界且守恒的基线，再逐项升级精度，并用目标量而非残差来验收。本文按算子给出选择原则、可抄用的字典、升级路线与有界性检查方法。

## 1. 结论与适用场景

- 起步调试：对流项用 `bounded Gauss upwind`（一阶迎风），时间项用 `Euler`，先把物理流程跑通；
- 稳态/瞬态主力：对流项用 `bounded Gauss linearUpwind grad(U)` 或 `bounded Gauss limitedLinearV 1`，梯度用 `cellLimited Gauss linear 1`；
- 含尖锐界面、自由面、相分数或燃烧：优先带限制器的有界格式，避免中心差分振荡；
- 气动阻力等高精度后处理：仅在网格足够正交、Courant 数受控时用 `Gauss linear`，并做格式敏感性分析；
- 强非正交网格：加大 `laplacian` 的 `corrected` 次数或用 `limited 0.5`，同时优先修网格；
- 大涡模拟/格子模型：动量对流常用 `linearUpwind` 或 `filteredLinear`，需避免过量耗散污染小尺度结构；
- 多相 VOF：相分数对流必须用界面压缩格式（`interfaceCompression`/`limitedLinear01`），否则界面会过度扩散。

选择格式的判断链条是：网格质量决定能用多高阶的格式，目标量精度决定需要多高阶，计算预算决定能否承担。三者冲突时，应以降阶保稳健、以网格保精度，而不是长期用过保守的格式掩盖问题。判断“格式是否够用”的标准不是残差多小，而是关键工程量在网格与格式双重扰动下是否稳定。

适用边界：本文针对不可压缩与弱可压标准求解器（`incompressibleFluid`/`pimpleFoam` 等）。密度基求解器如 `rhoCentralFoam` 使用的格式名不同，道理相通但不要照抄格式名；有限差分/有限元代码的稳定化方式也不是本文范围。

## 2. 背景与原理

有限体积法把守恒方程在控制体（单元 $P$）上积分，用高斯散度定理把体积分转成面积分：

$$
\int_{V_P}\nabla\cdot(\rho\phi\mathbf{u})\,dV=\sum_f \rho_f\phi_f\mathbf{u}_f\cdot\mathbf{S}_f
$$

其中 $\mathbf{S}_f$ 是面法向面积矢量。于是每个方程都变成面上的通量之和，格式的全部问题归结为：**面值 $\phi_f$ 与面法向导数如何由单元中心值构造**。这正是 `interpolationSchemes`、`gradSchemes`、`divSchemes`、`laplacianSchemes` 的分工。

- `gradSchemes`：用高斯定理由面值重构单元梯度，是压力梯度、黏性应力和限制器的基础；
- `divSchemes`：对流与应力散度，是有界性风险的核心，需要限制器；
- `laplacianSchemes`：带非正交修正的扩散项，与 `snGradSchemes` 配套；
- `ddtSchemes`：时间层近似，决定瞬态精度；
- `interpolationSchemes`：把单元值插到面上，默认 `linear`，通常无需改动。

要注意 `gradSchemes` 的默认格式会同时影响所有需要梯度的项：`cellLimited` 会牺牲极值附近的梯度精度换取有界，适合压力与速度；光滑区可退回 `leastSquares` 或 `Gauss linear`。扩散项强度由 $\Gamma$ 决定，动量方程里 $\Gamma_{\text{eff}}=\mu+\mu_t$，湍流黏性远大于分子黏性时数值耗散相对影响下降，这也是湍流算例对格式不如层流敏感的原因之一。

`ddtSchemes` 控制时间层：`Euler` 一阶、`backward` 二阶、`CrankNicolson c` 介于两者之间，$c=1$ 退化为隐式欧拉、$c=0$ 为纯二阶隐式。瞬态计算的总精度常被时间格式限制，而非空间格式；用二阶空间配一阶时间通常并不划算。时间格式与 Courant 数共同决定结果质量：隐式格式理论上无条件稳定，但过大的时间步会带来明显的时间离散误差，在非定常流动中会把峰值抹平，因此限制步长的往往是精度而非稳定性。

对流项的有界性与单元 Péclet 数相关。稳态离散要保证系数非负才有单调性，中心差分的条件是 $|Pe_\Delta|\leq 2$。真实网格很难满足，因此需要限制器在迎风（一阶、稳定）与中心（二阶、可能振荡）之间自适应插值。Godunov 定理进一步指出：线性、守恒且单调的格式至多一阶，这正是“高阶”与“有界”难以两全、必须引入非线性限制器的根本原因。

## 3. 关键配置与公式

**对流项面值（带限制器）**：

$$
\phi_f=\phi_P+\frac{1}{2}\psi(r)\left(\phi_N-\phi_P\right),\qquad r=\frac{\phi_P-\phi_W}{\phi_N-\phi_P}
$$

$\psi(r)$ 为限制器函数：`limitedLinear` 取 $\psi(r)=2\min(r,1)$ 并在 $[0,2]$ 内截断，`vanLeer` 取 $\psi(r)=\frac{r+|r|}{1+|r|}$，`linearUpwind` 近似无限制二阶迎风，必须配 `bounded` 才有界。相分数、质量分数等有硬边界的量建议用 `limitedLinearV` 或更保守的 `Minmod`。有界性要求面值不制造新极值：

$$
\min(\phi_P,\phi_N)\leq\phi_f\leq\max(\phi_P,\phi_N)
$$

**中心差分的系数条件**：把对流—扩散离散写成 $a_P\phi_P=a_E\phi_E+a_W\phi_W+b$，其中

$$
a_E=D-\frac{F}{2},\qquad a_W=D+\frac{F}{2},\qquad F=\rho u A,\qquad D=\frac{\Gamma A}{\Delta x}
$$

要保证系数非负（单调、无振荡）需 $|F|\leq 2D$，即 $|Pe_\Delta|\leq 2$。$Pe_\Delta$ 与网格尺寸成正比，加密网格可把它拉回安全区，但弱扩散时往往代价过高，这正是工程上更常采用有界高阶格式的原因。工程实现常用延迟修正把高阶通量拆成“隐式一阶部分加显式差额”，既保持对角占优又逐步逼近高阶，代价是需要多迭代几轮；OpenFOAM 的 `bounded` 前缀正是这一机制的开关，缺了它，含源项的对流项容易剧烈过冲。

**拉普拉斯项与非正交修正**：把面法向导数拆成正交部分与修正部分

$$
\nabla\phi\cdot\mathbf{S}_f=\Delta_f\left(\phi_N-\phi_P\right)+\mathbf{k}_f\cdot(\overline{\nabla\phi})_f
$$

$\Delta_f$ 是正交分量权重，$\mathbf{k}_f$ 是非正交残余，第二项由梯度插值提供。`corrected` 迭代修正该项，`limited k` 只在 $|\mathbf{k}_f|$ 小时保留修正以避免坏网格过冲，`uncorrected` 完全忽略修正，只在正交性极好时使用。非正交修正是扭曲网格上的主要误差来源，修正项用上一次迭代的梯度显式计算，因此 `nNonOrthogonalCorrectors` 的本质是固定点迭代次数：次数不足会残留误差，次数过多只增加成本。

**时间项**（隐式欧拉与 BDF2）：

$$
\frac{\partial}{\partial t}\int_V \rho\phi\,dV\approx \frac{\rho_P V_P}{\Delta t}\left(\phi_P^{(n)}-\phi_P^{(n-1)}\right)
$$

$$
\frac{\partial}{\partial t}\int_V \rho\phi\,dV\approx \frac{\rho_P V_P}{\Delta t}\left(\frac{3}{2}\phi_P^{(n)}-2\phi_P^{(n-1)}+\frac{1}{2}\phi_P^{(n-2)}\right)
$$

**梯度限制**：为避免强梯度区梯度重构发散，可用

$$
(\nabla\phi)_P=\min\left[(\nabla\phi)_P^{\text{unc}},\ \beta\max_{N}\frac{|\phi_N-\phi_P|}{|\mathbf{d}_{PN}|}\right]
$$

对应 `cellLimited Gauss linear beta`，$\beta\in[0,1]$，$\beta=1$ 最保守。

一个可直接抄用的 `fvSchemes` 起点（不可压缩通用）：

```cpp
ddtSchemes        { default backward; }   // 稳态改 steadyState
gradSchemes       { default cellLimited Gauss linear 1; grad(U) cellLimited Gauss linear 1; }
divSchemes
{
    default                         none;
    div(phi,U)                      bounded Gauss linearUpwind grad(U);
    div(phi,k)                      bounded Gauss limitedLinear 1;
    div(phi,epsilon)                bounded Gauss limitedLinear 1;
    div(phi,omega)                  bounded Gauss limitedLinear 1;
    div(phi,nuTilda)                bounded Gauss limitedLinear 1;
    div((nuEff*dev2(T(grad(U)))))   Gauss linear;
}
laplacianSchemes  { default Gauss linear corrected; }
interpolationSchemes { default linear; }
snGradSchemes     { default corrected; }
wallDist          { method meshWave; }
```

## 4. 工程做法与参数

升级路线固定为五步：一阶有界基线 → 确认边界与守恒 → 逐项升阶 → 对比目标量 → 网格与格式联合敏感性分析。每一步都要重新收敛到同一判据再比较，否则结论不可信。

参数取值经验：

- 对流项优先 `bounded Gauss linearUpwind grad(U)`；限制器优先 `limitedLinear 1`，对振荡敏感量用 `limitedLinearV 1` 或 `Minmod`；
- 非正交修正 `nNonOrthogonalCorrectors` 取 $0\sim3$，随非正交角增大而增加，但不要靠它去救严重坏网格；
- 时间格式：大时间步用 `backward`，需要抑制数值振荡时用 `CrankNicolson 0.9`；
- `snGradSchemes` 与 `laplacianSchemes` 的修正设置要一致，否则扩散项自相矛盾；
- `wallDist` 用 `meshWave` 与 `method` 版本影响壁面距离与壁函数，切换后需重跑；
- 各湍流量方程用 `limitedLinear 1` 即可，过度限制反而增加耗散。

有界性验收不能只看残差，要看极值与守恒：相分数与质量分数必须落在 $[0,1]$，湍流量与温度非负；同时核对进出口质量流量差与总体守恒。数值耗散的量级可以用一阶与二阶结果的前沿宽度差来估计：若前沿宽度随网格加密明显变化，说明分辨率仍不足。

做升级时要一次只改一类项。把对流、时间、修正次数同时改掉，即便结果变化也无法归因，工程上宁可分成三轮算例。格式切换后应保留完整日志（残差曲线、`executionTime`、极值监控），便于事后还原每一次改动的效果。

## 5. 可复现示例

在 `system/fvSchemes` 写入上面的字典后，先核对网格与格式自洽：

```bash
checkMesh -allGeometry -allTopology        # 关注非正交角、长宽比、负体积
foamRun -solver incompressibleFluid 2>&1 | tee log.foamRun
# v14 及更早版本用: pimpleFoam
```

对一个标量输运算例做格式对比（伪代码）：

```text
for scheme in [upwind, linearUpwind, limitedLinear 1, linear]:
    write system/fvSchemes with div(phi,T) = bounded Gauss <scheme>
    运行到同一收敛判据
    记录出口温度剖面、峰值温度、数值扩散宽度、极值
比较极值是否越界
若 linear 出现 T > 1 或 T < 0，判定为无界
```

判读：一阶迎风单调但把温度前沿抹宽；`linear` 精度高但有超调；`limitedLinear 1` 的极值应落在边界范围内且前沿更陡。把网格加密一倍再重复，若迎风耗散明显减小而二阶结果基本不变，说明空间离散已较充分。也可以统计限制器取值接近 0（退化为迎风）的单元占比：占比高说明网格不足或格式过保守。

需要强调，格式敏感性分析应当与网格无关性一起做，分开做容易把格式误差误判为网格误差；两者交叉对比才能把数值不确定度拆开。

## 6. 常见坑与排查

- 用降阶掩盖网格问题：一阶格式只压制振荡，坏网格的误差仍在并被耗散放大；
- `linear` 对流配差网格：产生棋盘格或过冲，先查是否漏了 `bounded` 与限制器；
- 非正交修正次数一味加大：成本上升却救不了坏网格，应定位最差单元；
- 时间格式与 Courant 数不匹配：显式/半隐式格式在 CFL 过大时仍会失稳；
- 改格式后未重新收敛就对比：格式差异被未收敛误差淹没；
- 只盯残差：残差下降却出现负相分数或温度，说明有界性失守；
- `snGrad` 与 `laplacian` 不一致：扩散项构造矛盾会污染结果；
- 忘记 `bounded` 前缀：二阶格式在有源项时可能剧烈过冲。

排查顺序：`checkMesh` 网格质量 → 边界与守恒 → 一阶基线 → 逐项升阶 → 目标量敏感性。所有数值参数都不应成为修补错误物理输入的手段；若残差或目标量异常，先回到网格、边界与量纲，再动格式与修正次数。

## 7. 检查清单与参考

- [ ] 网格非正交度与长宽比已量化，坏单元已定位；
- [ ] 每个 `div` 项都显式列出，`default` 未遗留危险值；
- [ ] 对流项为有界格式，所用限制器已记录；
- [ ] 关键标量极值未越界，守恒量已核对；
- [ ] `snGrad` 与 `laplacian` 修正设置一致；
- [ ] 格式与网格的联合敏感性已计入数值不确定度。

参考资料：

1. OpenFOAM 当前版本 *Numerical Schemes* 与 *Solution and Algorithm Control* 文档。
2. Greenshields C., Weller H., *Notes on Computational Fluid Dynamics*, 2022.
3. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics*, 2nd ed., Pearson, 2007.
