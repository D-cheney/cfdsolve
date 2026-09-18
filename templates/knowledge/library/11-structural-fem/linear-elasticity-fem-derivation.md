---
template_version: "flowlab-knowledge/1.0"
slug: linear-elasticity-fem-derivation
title: 线弹性有限元：虚功原理、刚度矩阵与应力恢复
summary: 从平衡、应变位移与 Hooke 定律出发推导虚功弱式、单元刚度、等效节点载荷与应力恢复，讲清平面应力/平面应变、锁定现象、验证方法与一个可复现悬臂梁算例。
category:
  slug: structural-fem
  name: 结构与有限元算法
level: 工程
reading_minutes: 26
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [线弹性, 虚功原理, 刚度矩阵, 应力恢复, 有限元]
seo:
  title: 线弹性有限元：虚功原理、刚度矩阵与应力恢复｜CFD菜鸟
  description: 从三组基本方程推导虚功弱式、B 矩阵、材料矩阵、装配与应力恢复，并说明平面假设、锁定与验证。
  keywords: [线弹性有限元, 虚功, B矩阵, Hooke定律, 应力恢复]
---

# 线弹性有限元：虚功原理、刚度矩阵与应力恢复

小变形线弹性有限元是结构分析的基线工具。它把连续体的平衡、几何与本构关系，通过虚功原理化为节点位移的线性方程组。本文从三组基本方程出发，推导虚功弱式、单元刚度矩阵、等效节点载荷与应力恢复，并说明平面应力与平面应变的区别、锁定现象和验证方法。

## 1. 结论与适用场景

结论先行。第一，线弹性有限元的核心是**虚功原理**：把平衡方程乘以虚位移并在全域积分，得到"内虚功等于外虚功"，其最大好处是把对位移的求导阶次降低一档。第二，单元刚度矩阵由几何矩阵与材料矩阵决定，几何矩阵只依赖形函数与网格几何，材料矩阵只依赖本构，两者分离是有限元模块化的基础。第三，位移是主未知量，**应力是派生量**，要先在 Gauss 积分点计算再外推或平滑，跨材料界面不能简单平均。第四，当泊松比趋于 0.5 或使用低阶完全积分单元时，会遇到体积锁定或剪切锁定，需要混合格式、选择性降阶积分或 B-bar 类方法。

适用场景：小应变（一般小于 1%）、线弹性、静力或准静力、材料连续且无明显接触非线性。对于大变形、塑性、接触与屈曲后分析，应转入几何或材料非线性框架。判断能否用线弹性，可先问三点：载荷路径是否单调、最大应变是否远小于屈服应变、结构是否无失稳风险？三者均满足时，线弹性给出的是可信且经济的答案。

术语上还需一点澄清。工程实现普遍采用 Voigt（工程）记法：把对称应变张量的独立分量排成列向量，其中剪切分量为工程剪应变 $\gamma_{xy}=2\varepsilon_{xy}$，与之配套的应力分量为 $\sigma_{xy}$。这样本构关系就浓缩为一次矩阵乘法，便于编程与存储。但必须记住：工程化剪应变的目的是让功的表达 $\boldsymbol\sigma^T\boldsymbol\varepsilon$ 保持简洁，若在推导与代码之间来回切换时把张量剪应变与工程剪应变弄混，会凭空引入二倍误差。

## 2. 物理与数学基础

线弹性问题由三组关系闭合：平衡方程、几何方程（应变与位移）以及本构方程（应力与应变）：

$$
\nabla\cdot\boldsymbol\sigma+\mathbf b=\mathbf 0,
\qquad
\boldsymbol\varepsilon=\frac{1}{2}\left(\nabla\mathbf u+\nabla\mathbf u^T\right),
\qquad
\boldsymbol\sigma=\mathbf C:\boldsymbol\varepsilon.
$$

其中 $\boldsymbol\sigma$ 为 Cauchy 应力（Pa），$\mathbf b$ 为体力（$\mathrm{N/m^3}$），$\mathbf u$ 为位移（m），$\boldsymbol\varepsilon$ 为小应变张量（无量纲），$\mathbf C$ 为四阶弹性张量（Pa）。边界条件分为位移边界 $\mathbf u=\bar{\mathbf u}$ 于 $\Gamma_u$（本质）与面力边界 $\boldsymbol\sigma\mathbf n=\bar{\mathbf t}$ 于 $\Gamma_t$（自然，面力单位为 Pa）。

连续体的最小势能原理指出，真实位移使总势能取极小：

$$
\Pi=\frac{1}{2}\int_\Omega\boldsymbol\varepsilon:\mathbf C:\boldsymbol\varepsilon\,d\Omega-\int_\Omega\mathbf u\cdot\mathbf b\,d\Omega-\int_{\Gamma_t}\mathbf u\cdot\bar{\mathbf t}\,d\Gamma.
$$

虚功原理就是该变分形式的等价表述，也是有限元离散的直接出发点。

从变分角度看，最小势能原理提供的是位移法的理论基础，而虚功原理更为一般：它不要求存在势能，因此可自然推广到非保守载荷、接触与非线性本构。两者在小变形线弹性、保守载荷下给出相同的弱式。正因为虚功原理适用面更广，工程有限元代码几乎都以"单元虚功或残量加切线"为统一内核，线弹性只是其中最简的一支。

## 3. 核心公式与推导

**虚功弱式。** 用满足 $\delta\mathbf u=\mathbf 0$ 于 $\Gamma_u$ 的虚位移乘平衡方程并积分：

$$
\int_\Omega \delta\mathbf u\cdot\left(\nabla\cdot\boldsymbol\sigma+\mathbf b\right)\,d\Omega=0.
$$

对第一项分部积分，并利用应力对称性 $\boldsymbol\sigma:\nabla\delta\mathbf u=\boldsymbol\sigma:\delta\boldsymbol\varepsilon$，得

$$
\int_\Omega \delta\boldsymbol\varepsilon:\boldsymbol\sigma\,d\Omega
=\int_\Omega \delta\mathbf u\cdot\mathbf b\,d\Omega
+\int_{\Gamma_t}\delta\mathbf u\cdot\bar{\mathbf t}\,d\Gamma.
$$

左端为内虚功，右端为外虚功；本质边界项因 $\delta\mathbf u=\mathbf 0$ 而消失。推导依赖准静态、Cauchy 应力对称与小应变假设。

**有限元离散。** 单元内 $\mathbf u=\mathbf N\mathbf d_e$，应变 $\boldsymbol\epsilon=\mathbf B\mathbf d_e$，虚应变 $\delta\boldsymbol\epsilon=\mathbf B\delta\mathbf d_e$。代入并因 $\delta\mathbf d_e$ 任意，得单元方程与刚度、载荷：

$$
\mathbf K_e\mathbf d_e=\mathbf f_e,
$$

$$
\mathbf K_e=\int_{\Omega_e}\mathbf B^T\mathbf D\mathbf B\,d\Omega,
\qquad
\mathbf f_e=\int_{\Omega_e}\mathbf N^T\mathbf b\,d\Omega+\int_{\Gamma_t^e}\mathbf N^T\bar{\mathbf t}\,d\Gamma.
$$

$\mathbf K_e$ 的对称性来自 $\mathbf D$ 对称，装配后全局 $\mathbf K$ 仍对称。未约束的三维模型有 6 个刚体零能模态（3 平动加 3 转动），约束不足就会奇异。

刚度矩阵的物理意义可直接从虚功读出：它把节点位移映射为节点内力，其每一列表示"某节点产生单位位移时引起的各节点反力"。对角线元素恒正，非对角元素符号取决于形函数与几何；对稳定结构，$\mathbf K$ 的特征值全为正，最小特征值对应最柔的变形模式，其量级也反映了结构的整体刚度水平。这为判断约束是否充分提供了直觉：若最小特征值接近零，往往意味着存在近似刚体模态。

**各向同性材料矩阵。** 三维 Hooke 定律为

$$
\boldsymbol\sigma=2G\boldsymbol\varepsilon+\lambda\,\mathrm{tr}(\boldsymbol\varepsilon)\mathbf I,
\qquad
G=\frac{E}{2(1+\nu)},\quad
\lambda=\frac{E\nu}{(1+\nu)(1-2\nu)},
$$

$E$ 为杨氏模量（Pa），$\nu$ 为泊松比，$G$ 为剪切模量（Pa），$\lambda$ 为 Lamé 第一参数（Pa）。平面应力（$\sigma_{zz}=0$）下，$3\times3$ 材料矩阵 $\mathbf D_{ps}$ 的非零分量为

$$
D_{11}=D_{22}=\frac{E}{1-\nu^2},\quad
D_{12}=D_{21}=\frac{E\nu}{1-\nu^2},\quad
D_{33}=\frac{E}{2(1+\nu)}.
$$

平面应变（$\varepsilon_{zz}=0$）下则为

$$
D_{11}=D_{22}=\frac{E(1-\nu)}{(1+\nu)(1-2\nu)},\quad
D_{12}=\frac{E\nu}{(1+\nu)(1-2\nu)},\quad
D_{33}=G.
$$

两者不可混用：薄板面内受载宜用平面应力，长厚体截面受约束宜用平面应变；误用会系统性高估或低估刚度。

**应力恢复。** 求得 $\mathbf d$ 后，Gauss 点应力为 $\boldsymbol\sigma_g=\mathbf D\mathbf B_g\mathbf d_e$。节点应力由 Gauss 点外推、面积或体积加权平均，或 $L^2$ 投影得到。穿过材料界面时应保持法向应力连续、切向应力允许跳变。von Mises 等效应力为

$$
\sigma_v=\sqrt{\frac{3}{2}\mathbf s:\mathbf s},
\qquad
\mathbf s=\boldsymbol\sigma-\frac{1}{3}\mathrm{tr}(\boldsymbol\sigma)\mathbf I,
$$

$\mathbf s$ 为偏应力张量（Pa）。$\sigma_v$ 只适用于以偏应力驱动的延性金属屈服判断，不是脆性材料或多轴疲劳的通用失效指标。

以平面四节点单元为例，位移在单元内双线性插值，几何矩阵按节点排列为各节点形函数导数的组合：法向分量行含 $N_{i,x}$ 与 $N_{i,y}$，而剪切行同时含 $N_{i,y}$ 与 $N_{i,x}$。由于 $\mathbf B$ 通过 $\lvert\mathbf J\rvert^{-1}$ 依赖几何映射，网格畸变会直接进入应变计算，故网格质量与单元形状对精度的影响往往比对刚度矩阵本身更大。

## 4. 数值实现要点

几何矩阵按形函数导数在几何坐标下组装；等参单元用 $\mathbf B=\mathbf B(\xi)\lvert\mathbf J\rvert^{-1}$。刚度积分的被积次数决定 Gauss 阶：二维四节点单元完整积分取 $2\times2$。完全积分一阶单元在弯曲主导下会剪切锁定，选择性降阶积分（对剪切项取 1 点）可缓解，但可能引入沙漏模态，需配沙漏控制。$\nu$ 趋于 0.5 时，纯位移低阶单元体积锁定，需 $u$-$p$ 混合、B-bar 或 F-bar 方法。

载荷处理要注意：集中力直接加到节点；面力与体力用一致载荷积分；点载荷与尖角处应力奇异，网格加密时峰值不收敛，应报告远离奇异区的应力或采用能量型后处理。求解器方面，$\mathbf K$ 对称正定，可用 Cholesky、共轭梯度或直接法；大规模问题常用多重网格与迭代求解。

此外，热-结构耦合、接触与多点约束会破坏 $\mathbf K$ 的对称正定性或引入新未知量，此时应改用对称不定或非对称求解器。对含大量约束的装配体，用拉格朗日乘子或罚函数施加 tie 与耦合约束各有取舍：前者严格但增维，后者简单但引入罚刚度敏感性。无论哪种，都应在求解后检查约束反力与能量守恒。边界条件方面，位移约束应避免过约束导致的强迫变形，集中载荷与分布载荷的换算要交代清楚，面力需在边界面积分装配。

## 5. 可复现示例

**二维平面应力悬臂梁。** 悬臂长 $L=1\,\mathrm m$，高 $h=0.1\,\mathrm m$，厚 $t=0.01\,\mathrm m$，$E=210\,\mathrm{GPa}$，$\nu=0.3$，端部集中力 $P=100\,\mathrm N$。按 Euler–Bernoulli 理论，端部挠度为

$$
\delta=\frac{PL^3}{3EI},
\qquad
I=\frac{t h^3}{12}.
$$

代入 $I=0.01\times0.1^3/12\approx8.33\times10^{-7}\,\mathrm{m^4}$，得 $\delta\approx1.9\times10^{-4}\,\mathrm m$。有限元用 $20\times2$ 的 Q4 网格。伪代码如下：

```
mesh = structured_Q4(L, h, nx=20, ny=2)
for e in elements:
    Be = grad(N) at Gauss points          # 3x8 几何矩阵（平面应力）
    Ke = sum_g Be^T Dps Be * detJ * w     # 2x2 Gauss 积分
    assemble(Ke, e)
fix left edge (ux = uy = 0)
apply P at right-mid nodes
solve K d = f
sigma_g = Dps @ Be @ de ; project to nodes
```

验证三点：其一，所有约束反力之和应等于 $P$；其二，挠度随网格加密收敛到 $\delta$，Q4 弯曲精度较低，需更细网格或改用 Q8；其三，远端应力分布接近 $\sigma=Mc/I$。若只用单层 Q4 单元，剪切锁定会让结果明显偏刚，这正说明单元选择要匹配变形模式。若改用 Q8（八节点二次单元），在相同网格下挠度应明显更接近解析解，这体现了单元阶对弯曲问题的重要性。网格加密时，$20\times2$、$40\times4$、$80\times8$ 三档的挠度应逐步逼近约 $1.9\times10^{-4}\,\mathrm m$，用 Richardson 外推可估计离散极限值；若加密后结果仍在明显变化，说明网格远未收敛。

## 6. 常见坑与排查

- **平面应力与平面应变混用**：先看几何与约束方向，误用导致刚度系统性偏差。
- **锁定**：弯曲主导或近不可压时结果偏刚，检查单元类型与积分方案。
- **点载荷奇异**：峰值应力随网格加密不收敛，属模型本身的奇异，而非求解错误。
- **节点应力越界平均**：跨材料界面直接平均会抹平真实跳变。
- **只查位移不查反力**：反力平衡是最基本的全局校验。
- **$\sigma_v$ 误用**：对脆性材料或多轴疲劳用错指标会误导安全判断。
- **单位不统一**：长度用 mm、模量用 Pa 混算，结果差若干数量级。
- **工程剪应变与张量剪应变混用**：二者相差二倍，混用会使剪切刚度错倍。
- **忽略剪切修正**：细长梁用实体单元且网格过粗时，会高估弯曲刚度。
- **对称约束滥用**：错误使用对称约束会把反对称变形锁死，得到错误结果。
- **边界约束过强**：用刚性约束模拟实际柔性支撑，会人为提高刚度与频率。

## 7. 检查清单与参考

清单：单位一致 → 材料矩阵与二维假设匹配 → 单元无锁定与沙漏 → 反力平衡 → 应变能与外力功相等 → 网格与单元阶收敛 → 远离奇异区的应力稳定。参考：Zienkiewicz, Taylor & Zhu《The Finite Element Method》；Bathe《Finite Element Procedures》；Hughes《The Finite Element Method》；MFEM Example 2（Linear Elasticity）。关于平面假设、锁定与后处理细节，可参考 Hughes 与 Bathe 教材相应章节；工程实现可对照 Abaqus 或 ANSYS 理论手册中单元公式的表述，注意其归一化与符号约定。
