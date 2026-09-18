---
template_version: "flowlab-knowledge/1.0"
slug: fem-weak-form-derivation
title: 有限元弱式推导：从 Poisson 强式到单元矩阵
summary: 从强式、加权余量与分部积分推导有限元弱式，讲清自然/本质边界、Galerkin 离散、单元刚度与装配，并给出 Lax–Milgram 理论依据、数值实现要点与一维可复现算例。
category:
  slug: structural-fem
  name: 结构与有限元算法
level: 进阶
reading_minutes: 22
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [有限元, 弱式, Galerkin, 单元矩阵, 变分法]
seo:
  title: 有限元弱式推导：从 Poisson 强式到单元矩阵｜CFD菜鸟
  description: 由强式出发，逐步推导加权余量、分部积分、自然边界、Galerkin 离散、单元刚度矩阵与装配，并给出收敛理论与可复现算例。
  keywords: [有限元推导, 弱形式, Galerkin, 单元刚度, 分部积分]
---

# 有限元弱式推导：从 Poisson 强式到单元矩阵

有限元法处理的是"以积分形式表达的平衡"。理解弱式推导，等于理解节点自由度为什么这样耦合、边界条件为什么分成两类、刚度矩阵为何天然对称稀疏。本文以稳态扩散/导热为统一模型，从强式出发，依次得到加权余量形式、分部积分降阶、自然边界进入右端、Galerkin 离散与单元矩阵，最后给出数值实现检查与一维可复现算例。

## 1. 结论与适用场景

核心结论有三条。第一，**弱式把二阶导数降为一阶**：原来要求解具备连续二阶导数，弱式中只出现一阶导数，因此连续分片一阶形函数就足够，这是线性单元可行的数学前提。第二，**边界条件被分成两类**：本质（Dirichlet）条件必须写进试探空间与试验空间，自然（Neumann 或 Robin）条件通过分部积分的边界项自动进入载荷向量，不需要额外约束。第三，**离散后得到对称稀疏线性系统**：对称性来自双线性型的对称性，稀疏性来自形函数的局部支撑。

弱式适用于椭圆型方程：稳态扩散、稳态导热、静电势、线弹性静力，以及作为时间离散之后的隐式结构问题。它也是有限元、谱元与间断 Galerkin 的共同起点。当问题以对流为主时，纯 Galerkin 弱式缺乏稳定性，需要加入迎风或 SUPG 等稳定化项；当需要严格逐面守恒（流量、能量收支）时，有限体积法往往更直接。要不要采用弱式，可以先问：方程是否具有"能量型"的双线性结构，且自然边界条件能否容忍作为软约束进入右端？若是，弱式就是自然选择。

还有两点工程直觉值得记住。其一，弱式与强式在精确解层面完全等价，差别只在离散之后：强式要求逐点满足平衡，弱式只要求满足积分意义下的加权平衡，因此对解的连续性要求更低、对复杂边界的适应性更好，数值解也更稳健。其二，弱式天然给出"功"或"能量"的度量，因而特别适合处理耦合场问题：多物理场求解时常把各场的弱式相加，界面上的通量项因两侧符号相反而自动抵消，界面耦合无需额外拼接，这正是弱式建模优雅且不易出错的原因。

## 2. 物理与数学基础

取有界区域 $\Omega$，边界 $\partial\Omega=\Gamma_D\cup\Gamma_N$。待求标量场 $u$ 可代表温度（K）或势（V）。强式问题为

$$
-\nabla\cdot(k\nabla u)=f\quad\text{in }\Omega,
\qquad u=\bar u\text{ on }\Gamma_D,
\qquad -k\nabla u\cdot\mathbf n=\bar q\text{ on }\Gamma_N.
$$

其中 $k>0$ 为导热系数或扩散系数（$\mathrm{W/(m\cdot K)}$ 或 $\mathrm{m^2/s}$），$f$ 为体积源（$\mathrm{W/m^3}$），$\bar u$ 为给定边界值（K），$\bar q$ 为给定法向通量（$\mathrm{W/m^2}$），$\mathbf n$ 为外单位法向。物理含义是：内部扩散通量的散度由源项平衡，边界上要么固定状态量，要么固定通量。

数学上，弱式建立在 Sobolev 空间 $H^1(\Omega)$ 上。试探空间取 $V=\{\,u\in H^1(\Omega):u=\bar u\text{ on }\Gamma_D\,\}$，试验空间取 $V_0=\{\,v\in H^1(\Omega):v=0\text{ on }\Gamma_D\,\}$。$H^1$ 只要求函数及其一阶弱导数平方可积，恰好匹配弱式中出现的一阶导数，这就是"降阶"带来的函数空间放宽。

除 Dirichlet 与 Neumann 外，工程中还常见 Robin（第三类）边界，典型形式为 $-k\nabla u\cdot\mathbf n=h(u-u_\infty)$，它把对流换热或弹簧支撑并入弱式后进入双线性型而非右端。区分三类边界的判据是：它约束解本身（本质）、给定通量（自然），还是给出二者的线性组合（Robin）。编码时，本质边界需要修改自由度与右端，自然与 Robin 边界则通过面循环累加到刚度矩阵或载荷向量。这与强式里"所有边界一视同仁"的做法截然不同，是有限元实现中最需要小心的一致性环节。

## 3. 核心公式与推导

**加权余量与分部积分。** 用任意试验函数 $v\in V_0$ 与强式残量做内积并令其为零：

$$
\int_\Omega v\,\left[-\nabla\cdot(k\nabla u)-f\right]\,d\Omega=0.
$$

对第一项使用散度定理（分部积分）：

$$
-\int_\Omega v\,\nabla\cdot(k\nabla u)\,d\Omega
=\int_\Omega \nabla v\cdot k\nabla u\,d\Omega
-\int_{\partial\Omega} v\,(k\nabla u\cdot\mathbf n)\,d\Gamma.
$$

由于 $v=0$ 于 $\Gamma_D$，该段边界项消失；在 $\Gamma_N$ 上代入 $k\nabla u\cdot\mathbf n=-\bar q$，得弱式：求 $u\in V$，使任意 $v\in V_0$ 满足 $a(u,v)=\ell(v)$，其中双线性型与线性泛函为

$$
a(u,v)=\int_\Omega \nabla v\cdot k\nabla u\,d\Omega,
\qquad
\ell(v)=\int_\Omega v f\,d\Omega-\int_{\Gamma_N} v\bar q\,d\Gamma.
$$

注意 $\bar q$ 前的负号：自然边界给定的是通量，进入右端时符号由外法向约定决定，这是初学者最常犯的错误之一。

这三步的逻辑可以概括为：取残量建立加权余量式 → 分部积分降阶并暴露边界通量 → 用边界条件消去已知通量。值得强调的是，弱式对试探函数与试验函数的要求并不相同：试探函数必须事先满足本质边界（否则解不满足约束），试验函数必须在本质边界上为零（以便消去对应边界项）。这种"非对称"正是两类边界地位不同的根源，也是理论推导中容易含糊、实现时又必须严格区分的地方。

**Galerkin 离散。** 用形函数 $N_j$（$j=1,\dots,n$）展开 $u_h=\sum_j N_jU_j$，并取 $v_h=N_i$。代入后得

$$
\sum_{j}\left(\int_\Omega \nabla N_i\cdot k\nabla N_j\,d\Omega\right)U_j
=\int_\Omega N_i f\,d\Omega-\int_{\Gamma_N} N_i\bar q\,d\Gamma,
$$

即线性系统 $\mathbf K\mathbf U=\mathbf F$，其中刚度矩阵与载荷向量为

$$
K_{ij}=\int_\Omega \nabla N_i\cdot k\nabla N_j\,d\Omega,
\qquad
F_i=\int_\Omega N_i f\,d\Omega-\int_{\Gamma_N} N_i\bar q\,d\Gamma.
$$

$K_{ij}$ 的量纲为 W/K（以导热为例），$U_j$ 为 K，乘积为 W，与 $F_i$ 一致。

**一维二节点单元显式结果。** 单元 $[x_1,x_2]$ 长度 $h$，局部坐标 $\xi\in[-1,1]$，形函数及其导数为

$$
N_1=\frac{1-\xi}{2},\quad N_2=\frac{1+\xi}{2},\quad
\frac{dN_1}{dx}=-\frac{1}{h},\quad \frac{dN_2}{dx}=\frac{1}{h}.
$$

当 $k$ 为常数时，单元刚度矩阵各元素为 $K^e_{11}=K^e_{22}=k/h$ 与 $K^e_{12}=K^e_{21}=-k/h$。它形如"弹簧"矩阵：对角为正、非对角为负、行和为零。行和为零意味着常值场（$U_1=U_2$）对应零内虚功，这是刚体或常数模态的离散体现，也是纯 Neumann 问题奇异的根源。均匀源 $f$ 的一致载荷为 $F^e_f=(fh/2,\ fh/2)$，而集中载荷会把它按节点重新分配。在二维中，常应变三角形单元的刚度矩阵可写成 $\mathbf K^e=A_e\mathbf B^T\mathbf D\mathbf B$，其中 $A_e$ 为单元面积、$\mathbf B$ 为常数矩阵（三节点线性三角形内部应变恒定）。这恰好解释了常应变三角形为何在弯曲问题中偏刚：单元内部无法表达线性变化的应变场，只能以平均值近似。

**装配。** 局部矩阵经连接关系 $A_e$ 累加到全局：$\mathbf K=\sum_e A_e^T\mathbf K^eA_e$，$\mathbf F=\sum_e A_e^T\mathbf F^e$。共享节点上单元贡献相加，正是离散意义上的"通量守恒"。

装配的实现细节直接影响性能与内存。全局矩阵 $\mathbf K$ 的非零元只出现在共享节点的自由度之间，其稀疏结构完全由网格连接关系决定。节点编号顺序影响带宽与填充，采用带宽最小化或嵌套剖分可显著降低直接法求解的填充量。按单元循环"先计算局部矩阵、再散布到全局"的做法便于并行与缓存优化；只存上三角可节省近一半内存。对超大规模问题，装配与求解常采用无矩阵（matrix-free）格式与按行着色的向量化实现。

## 4. 数值实现要点

单元积分通常在参考坐标下用 Gauss 求积完成，即 $\int_{\Omega_e}(\cdot)\,d\Omega=\int_{\hat\Omega}(\cdot)\lvert\mathbf J\rvert\,d\xi$。体积分被积多项式的次数决定求积阶：$d$ 维 $p$ 次单元刚度被积约 $2(p-1)$ 次，至少取能精确积分该次数的 Gauss 点数，曲边或变系数再适当加阶。例如一维二节点单元、常 $k$ 时被积为常数，一点 Gauss 即可精确；二阶单元则需两点。

装配前必须检查单元 Jacobian 行列式 $\det\mathbf J>0$，否则单元翻转，刚度出现病态符号。施加本质边界时，建议用直接消元或乘子法，而不是简单"置大数"；前者保持对称正定，后者在约束众多时更规整。求解前应验证 $\mathbf K$ 对称、具有对角占优倾向、且施加约束后正定。

误差与收敛有明确理论依据。当双线性型连续且强制，即存在 $\alpha>0$ 使 $a(v,v)\geq\alpha\lVert v\rVert_{H^1}^2$，Lax–Milgram 定理给出解的存在唯一性；Galerkin 正交性 $a(u-u_h,v_h)=0$ 进一步导出 Céa 估计：

$$
\lVert u-u_h\rVert_{H^1}\leq C\inf_{v_h\in V_h}\lVert u-v_h\rVert_{H^1},
$$

即离散误差不超过最佳逼近误差的常数倍。对线性或双线性单元与足够光滑解，$H^1$ 半范收敛率约为 $O(h)$，$L^2$ 约为 $O(h^2)$。

## 5. 可复现示例

**一维稳态导热，两端 Dirichlet。** 取 $L=1\,\mathrm m$，$k=1\,\mathrm{W/(m\cdot K)}$，均匀 $f=1\,\mathrm{W/m^3}$，两端温度 $\bar u(0)=\bar u(1)=0$，分 $n$ 个线性单元。内部节点 $i$ 的离散方程为

$$
\frac{k}{h}\left(-U_{i-1}+2U_i-U_{i+1}\right)=fh,
\qquad h=\frac{L}{n}.
$$

一致载荷对每个相邻节点贡献 $fh/2$，组装后右端恰为 $fh$；边界节点用 $\bar u$ 消元后右端相应平移。伪代码如下：

```
h = L / n
for e in elements:
    Ke = (k/h) * [[1, -1], [-1, 1]]      # 单元刚度
    Fe = (f*h/2) * [1, 1]                 # 一致载荷
    assemble(Ke, Fe, e)                   # 累加到全局
apply Dirichlet at node 0 and node n      # 消元并修正右端
solve K U = F                             # 对称正定，可用 CG 或 Cholesky
```

验证三步：其一，令 $f=0$、$\bar u(0)=0$、$\bar u(1)=1$，解应严格是线性场 $U_i=i/n$，即 patch test 精确通过；其二，与解析解 $u(x)=\dfrac{f}{2k}x(L-x)$ 对比，$h$ 减半时 $L^2$ 误差应约降为四分之一；其三，检查通量收支，左右端边界的 $k\,du/dx$ 之差应等于 $\int f\,dx=fL$。取 $n=10$ 时中心节点温度最大值约为 $fk^{-1}L^2/8=0.125\,\mathrm K$，可作为量级核对。

## 6. 常见坑与排查

- **自然边界符号错**：$\bar q$ 进入右端的符号与 $\mathbf n$ 约定相关，方向反了会出现"额外源/汇"。
- **本质边界未约束**：只在右端加、不解方程约束，导致解整体平移；纯 Neumann 时必须指定参考值或零均值约束。
- **求积阶不足**：变系数或曲边单元下欠积分，刚度失真、收敛率下降。
- **单元翻转**：$\det\mathbf J\leq0$，装配出负刚度或错误耦合。
- **混淆一致载荷与集中载荷**：集中载荷在粗网格上引入额外误差，峰值附近尤甚。
- **把派生量当真值**：弱式给出的是近似场，峰值往往需要更细网格与后处理确认。
- **形函数不满足单位分解**：$\sum_jN_j\ne1$ 时无法精确再现常值场，patch test 失败，收敛率坍塌。
- **网格质量差**：严重畸变的单元使 Jacobian 病态、积分精度下降，应先改善网格而非调参。
- **零空间未识别**：纯 Neumann 或未约束刚体模态使线性系统奇异，应在求解前检测。
- **积分点应力直接平均到节点**：跳单元直接平均会在材料界面与应力集中处抹平真实分布。

## 7. 检查清单与参考

提交前逐项确认：形函数满足单位分解（$\sum_j N_j=1$）→ Jacobian 处处为正 → 求积阶匹配被积次数 → patch test 通过 → $\mathbf K$ 对称且约束后正定 → 制造解收敛率符合理论 → 全局通量守恒误差可量化。参考资料：Hughes《The Finite Element Method: Linear Static and Dynamic Finite Element Analysis》；Brenner & Scott《The Mathematical Theory of Finite Element Methods》；Zienkiewicz, Taylor & Zhu《The Finite Element Method》；MFEM 弱式文档 https://mfem.org/fem_weak_form/ 。
