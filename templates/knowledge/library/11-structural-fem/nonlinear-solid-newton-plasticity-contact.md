---
template_version: "flowlab-knowledge/1.0"
slug: nonlinear-solid-newton-plasticity-contact
title: 非线性结构算法：Newton 迭代、J2 塑性返回映射与接触
summary: 以残量方程为主线，统一推导几何与材料非线性、增量 Newton–Raphson、一致切线、小应变 J2 塑性径向返回映射与罚函数接触，强调状态提交时机与多判据收敛。
category:
  slug: structural-fem
  name: 结构与有限元算法
level: 专题
reading_minutes: 36
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [非线性有限元, Newton法, J2塑性, 返回映射, 接触]
seo:
  title: 非线性结构算法：Newton、J2 塑性返回映射与接触｜CFD菜鸟
  description: 从残量与一致切线推导非线性结构 Newton 迭代、J2 塑性径向返回、算法切线、罚接触与收敛判据，并给出可复现算例。
  keywords: [非线性有限元, J2塑性, 径向返回, 一致切线, 接触算法]
---

# 非线性结构算法：Newton 迭代、J2 塑性返回映射与接触

非线性结构分析的统一框架是"残量 + 切线 + 增量迭代"。几何非线性改写应力度量与几何矩阵，材料非线性改写本构更新，接触非线性则改变活动约束集。本文以残量方程为主线，推导增量 Newton–Raphson、小应变 J2 塑性径向返回映射与一致切线、罚函数接触，并强调状态提交时机与多判据收敛。

## 1. 结论与适用场景

三条主线结论。第一，**Newton 迭代的收敛速度取决于切线一致性**：使用与离散本构完全一致的一致切线，在解附近可获得二次收敛；若用弹性矩阵近似或固定刚度，则退化为线性或更慢的收敛。第二，**塑性状态更新必须"试探—返回"且只在全局收敛后提交**，迭代过程中的中间状态不得污染历史变量。第三，**接触是活动集问题**：法向互补条件决定开闭，摩擦决定粘着或滑移，二者的切换使切线非光滑，收敛更依赖加载策略与正则化。

适用场景：金属成形、碰撞、螺栓预紧、密封、齿轮啮合、大变形橡胶等。判断是否需要非线性框架：应变超过约 1%～2%、材料进入塑性、接触面积随载荷显著变化，或结构出现大转动与失稳。若这些均不满足，线弹性通常足够。

需要区分两类非线性的来源。几何非线性主要来自大位移、大转动与大应变，表现为应变度量、应力度量与几何矩阵随构型变化，其一致性还要求满足客观性；材料非线性来自本构（塑性、蠕变、损伤、超弹性），表现为状态变量与历史相关。二者常同时出现，但排查时应先分别确认：只开几何非线性而关掉塑性，看残量行为是否正常，再逐步加回，可快速定位问题来自哪一类。

## 2. 物理与数学基础

离散平衡写成残量方程

$$
\mathbf R(\mathbf u)=\mathbf F_{ext}(\mathbf u)-\mathbf F_{int}(\mathbf u)=\mathbf 0,
\qquad
\mathbf F_{int}=\int_{\Omega_0}\mathbf B^T(\mathbf u)\,\mathbf S(\mathbf u,\boldsymbol\alpha)\,d\Omega_0,
$$

其中 $\mathbf F_{ext}$ 为外力（N），$\mathbf F_{int}$ 为内力（N），$\mathbf B$ 为几何矩阵，$\mathbf S$ 为第二 Piola–Kirchhoff 应力（Pa），$\boldsymbol\alpha$ 汇集塑性应变、等效塑性应变、硬化变量与损伤等历史量。几何非线性改变 $\mathbf B$ 与应力度量（总拉格朗日或更新拉格朗日格式），材料非线性改变 $\mathbf S$ 与切线，接触则改变约束与活动集。

问题在载荷增量步内求解：每个增量至少迭代至残量满足判据，增量大小随收敛难度自适应调整。总拉格朗日以初始构型 $\Omega_0$ 为参考，适合大变形但应变度量复杂；更新拉格朗日以当前构型为参考，工程上更常用。

求解策略上，线搜索用于在 Newton 方向不下降时缩减步长以恢复收敛；弧长法把载荷因子也当作未知量，从而能跟踪极限点之后的软化段，这是过屈曲与局部化问题上载荷控制无法完成的部分。判断是否需要弧长法，可观察残量在接近某个载荷时突然不再下降、甚至出现反向位移，这通常就是接近极限点的信号。

另一个必须记住的事实是：历史变量 $\boldsymbol\alpha$ 的更新是路径相关的，它依赖加载历史而非仅当前应变，因此求解器必须逐步记录并在切步失败时回滚。这与弹性问题有本质区别——弹性响应可仅由当前位移确定，而塑性、损伤与摩擦状态必须按增量推进，顺序与步长都会影响结果。

## 3. 核心公式与推导

**增量 Newton–Raphson。** 在 $\mathbf u_k$ 处对残量一阶展开：

$$
\mathbf R(\mathbf u_k+\Delta\mathbf u)\approx\mathbf R(\mathbf u_k)+\frac{\partial\mathbf R}{\partial\mathbf u}\Delta\mathbf u=\mathbf 0.
$$

定义切线刚度 $\mathbf K_T=\partial\mathbf F_{int}/\partial\mathbf u-\partial\mathbf F_{ext}/\partial\mathbf u$，则迭代为

$$
\mathbf K_T(\mathbf u_k)\Delta\mathbf u_k=\mathbf R(\mathbf u_k),
\qquad
\mathbf u_{k+1}=\mathbf u_k+\alpha_k\Delta\mathbf u_k.
$$

$\alpha_k$ 由线搜索或信赖域确定。一致切线下残量范数呈平方级下降；固定初始刚度即修正 Newton，单次迭代便宜但通常线性收敛。越过极限点后载荷控制失效，需改用位移控制或弧长法。

**小应变 J2 塑性径向返回。** 应变加性分解为弹性与塑性两部分。弹性预测：

$$
\boldsymbol\sigma_{tr}=\mathbf C:\left(\boldsymbol\varepsilon_{n+1}-\boldsymbol\varepsilon_n^p\right),
\qquad
\mathbf s_{tr}=\mathrm{dev}(\boldsymbol\sigma_{tr}),
\qquad
q_{tr}=\sqrt{\frac{3}{2}\mathbf s_{tr}:\mathbf s_{tr}}.
$$

各向同性线性硬化屈服函数

$$
f_{tr}=q_{tr}-\left[\sigma_{y0}+H\bar\varepsilon_n^p\right],
$$

$\sigma_{y0}$ 为初始屈服应力（Pa），$H$ 为硬化模量（Pa），$\bar\varepsilon^p$ 为等效塑性应变（无量纲）。若 $f_{tr}\leq0$ 则本步保持弹性；若 $f_{tr}>0$ 则发生塑性，塑性乘子增量与更新为

$$
\Delta\gamma=\frac{f_{tr}}{3G+H},
$$

$$
\mathbf n=\frac{\mathbf s_{tr}}{\lVert\mathbf s_{tr}\rVert},
\qquad
\mathbf s_{n+1}=\mathbf s_{tr}-2G\Delta\gamma\sqrt{\frac{3}{2}}\,\mathbf n,
\qquad
\bar\varepsilon^p_{n+1}=\bar\varepsilon^p_n+\Delta\gamma.
$$

返回后应力由 $\boldsymbol\sigma_{n+1}=\dfrac{q_{n+1}}{q_{tr}}\mathbf s_{tr}+\dfrac{1}{3}\mathrm{tr}(\boldsymbol\sigma_{tr})\mathbf I$ 给出，其中 $q_{n+1}=q_{tr}-3G\Delta\gamma$。$\Delta\gamma$ 无量纲，$2G\Delta\gamma$ 单位为 Pa，量纲自洽。这组公式的几何意义是把试探点沿偏应力方向"径向"拉回屈服面，故称径向返回。

**一致算法切线。** 全局 Newton 需要离散更新的导数

$$
\mathbf C_{alg}=\frac{\partial\boldsymbol\sigma_{n+1}}{\partial\boldsymbol\varepsilon_{n+1}}
=2G\theta\,\mathbf I_{dev}+\mathbf K_{bulk}+\text{硬化修正},
$$

其要点是**包含塑性流动方向与硬化模量**，其中 $\theta=q_{n+1}/q_{tr}$ 为返回因子。若用弹性矩阵 $\mathbf C$ 代替一致切线，理论解不变，但二次收敛被破坏，迭代数大增甚至切步失败。几何非线性的一致性还要求应力更新与几何矩阵满足客观性（旋转不变）。

**接触的 KKT 条件。** 设法向间隙 $g_n(\mathbf u)\geq0$、接触压力 $p_n\geq0$ 及互补条件

$$
g_n\,p_n=0,
$$

即 Karush–Kuhn–Tucker 条件。罚函数法近似为

$$
p_n=\epsilon_n\langle-g_n\rangle_+,
$$

$\epsilon_n$ 为罚（接触）刚度（Pa/m），$\langle\cdot\rangle_+$ 取正部。$\epsilon_n$ 太小产生穿透，太大则恶化条件数。拉格朗日乘子法严格满足约束但引入鞍点未知量；增广拉格朗日法用迭代乘子更新，兼取二者之长。摩擦用 Coulomb 条件 $\lVert\mathbf t_t\rVert\leq\mu p_n$，粘着与滑移由试探—返回切换，$\mu$ 为摩擦系数。

接触活动集的变化会破坏 Newton 的二次收敛：某节点从分离跳到接触时残量出现跳跃，此时应允许迭代回退并重新装配切线。增广拉格朗日的外循环正是为此设计，它把"约束满足"从内层 Newton 中分离出来，外层逐步修正乘子，内层则专注于平衡，从而让收敛更可控。摩擦问题中滑移区往往也是活动集频繁变化之处，应加密该区域网格并监控切向状态更新。一致算法切线的推导，本质上就是对上述返回映射公式逐项求导：先对弹性预测与屈服函数求导，再对返回后的应力表达式求偏导，最后消去塑性乘子得到关于应变的闭式表达。它看起来繁琐，却是保住二次收敛的关键。

## 4. 数值实现要点

状态量只在收敛后提交：迭代开始必须从上一增量已提交的状态重新积分，避免迭代次数影响结果。收敛判据至少同时检查

$$
\eta_R=\frac{\lVert\mathbf R\rVert}{\max(\lVert\mathbf F_{ext}\rVert,F_0)},
\qquad
\eta_u=\frac{\lVert\Delta\mathbf u\rVert}{\max(\lVert\mathbf u\rVert,u_0)},
\qquad
\eta_E=\frac{\lvert\Delta\mathbf u^T\mathbf R\rvert}{E_0},
$$

$F_0$、$u_0$、$E_0$ 为参考量，用以消除量纲与规模影响。还应监控塑性耗散非负、接触穿透、活动集振荡与能量平衡。自动切步在迭代失败时回滚全部历史变量。大变形时采用客观应力率或超弹性格式，避免虚假能量产生。

对于几何非线性，一致切线还需包含几何刚度（初应力刚度）项，它反映当前应力水平对切线刚度的贡献，受压时降低刚度并可能导致失稳。漏掉几何刚度会让切线偏硬、收敛变慢，且在接近失稳时给出错误的临界载荷，这也是非线性屈曲分析必须在每个增量重新组装完整切线的原因。

## 5. 可复现示例

**单轴拉伸下的 J2 径向返回（单积分点）。** 取 $E=210\,\mathrm{GPa}$，$\nu=0.3$，$\sigma_{y0}=250\,\mathrm{MPa}$，$H=1\,\mathrm{GPa}$，施加轴向增量应变至 $\varepsilon=0.005$。伪代码如下：

```
eps_p, beq = 0, 0
for deps in strain_increments:
    eps = eps_prev + deps
    s_tr = 2G * dev(eps - eps_p)          # 弹性预测
    q_tr = sqrt(1.5 * s_tr:s_tr)
    f = q_tr - (sy0 + H*beq)
    if f <= 0:                            # 弹性
        sigma = dev(s_tr) + K*tr(eps)*I
    else:                                 # 塑性径向返回
        dgamma = f / (3G + H)
        n = s_tr / norm(s_tr)
        s_n = s_tr - 2G*dgamma*sqrt(1.5)*n
        beq  = beq + dgamma
        eps_p = eps_p + dgamma*sqrt(1.5)*n
        sigma = s_n + K*tr(eps)*I
    commit(state)
```

验证：弹性段 $\sigma=E\varepsilon$ 应严格线性；首次屈服约在 $\varepsilon\approx\sigma_{y0}/E\approx1.19\times10^{-3}$ 出现；屈服后弹塑性切线模量为 $E_t=EH/(E+H)\approx9.5\,\mathrm{GPa}$；检查 $\eta_R$ 每步平方级下降、$\Delta\gamma\geq0$、塑性耗散单调非负。进一步，可把增量应变细分成若干子步，检查 $\Delta\gamma$ 随子步细化是否稳定；理想情况下它是路径相关的，但只要步长足够小结果应收敛到同一应力—应变曲线。若细化后曲线仍明显漂移，多半是硬化模型或流动法则系数实现有误。

## 6. 常见坑与排查

- **切线不一致**：收敛慢、迭代多，先查是否使用了算法切线。
- **状态提前提交**：迭代中更新历史量，结果依赖迭代次数、不可复现。
- **流动法则系数错**：$\sqrt{3/2}$ 系数与 $\mathbf n$ 定义必须自洽，否则体积变形不为零。
- **接触刚度失当**：穿透与病态两头难，按材料刚度比例设定并做敏感性。
- **摩擦正则化不当**：小滑移响应失真，需在粘着刚度与收敛之间权衡。
- **只用残差判据**：接触活动集未稳定，残差下降也可能是假收敛。
- **极限点用载荷控制**：会直接失败，应改位移控制或弧长法。
- **切步失败不回滚**：后续增量从被污染的状态出发，误差累积。
- **漏掉几何刚度**：几何非线性下切线偏硬，接近失稳时临界载荷错误。
- **不做线搜索**：Newton 方向不下降时硬走一步，导致残量震荡或发散。
- **硬化曲线外推不当**：超出试验数据范围的硬化模量外推会显著影响大应变结果。
- **初始应力未平衡**：给入的初始应力若不自平衡，第一步就出现虚假残量。

## 7. 检查清单与参考

清单：残量定义与符号一致 → 切线来源明确（一致或近似）→ 状态提交时机正确 → 三项收敛判据同时满足 → 切步失败可回滚 → 塑性/接触耗散单调 → 网格与增量收敛性 → 与解析或实验基准对比。参考：Simo & Hughes《Computational Inelasticity》；Wriggers《Computational Contact Mechanics》；Crisfield《Non-linear Finite Element Analysis of Solids and Structures》；Belytschko 等《Nonlinear Finite Elements for Continua and Structures》。关于一致切线的详细推导可参考 Simo & Hughes 中塑性更新与算法切线的章节；关于接触搜索、主从面与摩擦切换的工程细节，可参考 Wriggers 相应章节。
