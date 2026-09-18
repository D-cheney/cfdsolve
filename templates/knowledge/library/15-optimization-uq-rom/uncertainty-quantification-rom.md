---
template_version: "flowlab-knowledge/1.0"
slug: uncertainty-quantification-rom
title: 不确定性量化与降阶：Monte Carlo、PCE、POD 和 DMD
summary: 推导 Monte Carlo 估计误差、Polynomial Chaos 投影、POD 的 SVD 最优性、DMD 线性演化近似，并说明代理模型的训练验证隔离。
category:
  slug: optimization-uq-rom
  name: 优化、不确定性与降阶
level: 专题
reading_minutes: 36
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-29T00:00:00.000Z"
tags: [不确定性量化, Monte Carlo, PCE, POD, DMD, 降阶模型]
seo:
  title: CAE 不确定性量化与 POD/DMD 降阶推导｜CFD菜鸟
  description: 从概率估计、正交多项式和 SVD 推导 CAE UQ 与降阶模型核心算法。
  keywords: [UQ, Monte Carlo, PCE, POD, DMD]
---

# 不确定性量化与降阶：Monte Carlo、PCE、POD 和 DMD

CAE 结果的不确定性可分为离散误差、模型形式误差与输入不确定性三类，只有第三类属于本文的 UQ 范畴：先给出输入的概率或区间描述，再把它传播到响应量，得到响应的分布、矩或可靠度。降阶模型（ROM）则用于降低同一问题被反复求解的成本。本文推导 MC、PCE、POD、DMD 的核心公式，并说明代理模型的训练与验证隔离。

## 1. 结论与适用场景

- Monte Carlo（MC）：最通用、对维数不敏感，但收敛慢，误差量级为 $O(N^{-1/2})$；适合黑箱、强非线性、失效概率问题。
- 多项式混沌（PCE）：用正交多项式做谱展开，光滑问题下指数收敛，能直接给出矩与灵敏度；适合中低维（几个到几十个参数）的光滑响应。
- 本征正交分解（POD）：从快照中提取近最优低维基，压缩状态空间；适合参数化的场数据与降阶求解。
- 动态模态分解（DMD）：从时间序列拟合线性演化算子，给出模态、频率与增长率；适合拟线性动力学与模态识别。

选择原则：维数低且响应光滑，用 PCE；维数高或响应有间断、失效概率很小，用 MC 族；需要反复求解同一大系统，用 POD/DMD 降阶；黑箱且样本昂贵，用空间填充设计加高斯过程代理，再对代理做 MC 采样。无论用哪种，都要先明确降阶模型的有效参数域，超出训练范围就不再受控。

还有一层区分至关重要：随机不确定性（aleatory，固有随机，如材料批次波动）与认知不确定性（epistemic，知识不足，如未知模型参数）应分开处理。前者用概率分布描述，样本越多估计越准；后者用区间、证据或概率盒描述，样本再多也只能缩小范围而不能消除。把认知不确定性当成概率分布会低估风险，反之则可能过度保守。

## 2. 物理与数学基础

设随机输入 $\xi=(\xi_1,\dots,\xi_d)$ 具有联合概率密度 $f$，响应量 $Q=Q(\xi)$。正向 UQ 通常要计算：

- 矩：均值 $\mathbb{E}[Q]$、方差 $\mathrm{Var}[Q]$；
- 分布：累积分布 $F_Q(q)=\Pr(Q\leq q)$；
- 尾部/失效概率：$P_f=\Pr(Q>q_{crit})$；
- 灵敏度：各输入对方差的贡献。

总误差的合理表述是

$$ \epsilon_{tot}\approx\epsilon_{disc}+\epsilon_{model}+\epsilon_{input} $$

三者在量纲与量级上要分开报告：网格收敛性研究给出 $\epsilon_{disc}$，模型验证给出 $\epsilon_{model}$，UQ 给出输入传播部分。混在一起报告会掩盖真正的主导误差。对降阶模型，必须同时给出它的有效参数域：在训练参数范围之外外推时，ROM 的误差不受控，不能当作 UQ 的代理。

此外，响应量的定义本身会影响 UQ：同一物理过程，取瞬时峰值与取平均值作为 $Q$，其分布与灵敏度可能完全不同。因此在开始采样前必须先固定目标量与评价位置，并在报告中写明。

输入的描述方式决定了后续算法：连续概率分布对应 MC 与 PCE；区间或概率盒对应区间算术与优化型 UQ；贝叶斯方法则用后验分布同时更新参数与预测。工程中还常用高斯过程或径向基代理替代昂贵的直接求解：先在设计点上训练代理，再对代理做大规模采样，代价从“每样本一次求解”降为“一次代理评估”。但代理的误差必须独立评估，它自身的二阶矩不能直接当作真值。

## 3. 核心公式与算法

Monte Carlo：对随机输入 $\xi$ 与响应 $Q(\xi)$，用独立同分布样本估计

$$ \hat\mu_N=\frac1N\sum_{i=1}^N Q_i,\qquad \hat\sigma_N^2=\frac{1}{N-1}\sum_{i=1}^N\left(Q_i-\hat\mu_N\right)^2 $$

均值标准误差约为 $\sigma/\sqrt N$，收敛率与维数无关但很慢；拉丁超立方与低差异序列改善空间覆盖但不改变渐进率；稀有失效概率需要重要抽样、子集模拟或可靠度方法。

多项式混沌展开（PCE）：选择与 $\xi$ 分布正交的多项式 $\Psi_\alpha$，把响应展开为

$$ Q(\xi)\approx\sum_{\alpha\in\mathcal{A}}c_\alpha\Psi_\alpha(\xi) $$

系数由投影或回归求出：

$$ c_\alpha=\frac{\left\langle Q,\Psi_\alpha\right\rangle}{\left\langle \Psi_\alpha,\Psi_\alpha\right\rangle},\qquad \left\langle f,g\right\rangle=\int f(\xi)g(\xi)f(\xi)\,d\xi $$

若多项式正交归一，则均值与方差有闭式

$$ \mathbb{E}[Q]\approx c_0,\qquad \mathrm{Var}[Q]\approx\sum_{\alpha\neq0}c_\alpha^2\left\lVert \Psi_\alpha\right\rVert^2 $$

投影积分用张量积或稀疏网格求积；高维时改用最小角回归或压缩感知挑选重要系数。

### 3.1 PCE 的两类求解方式

投影法：对每个基函数做数值积分，优点是可以精确确定系数，缺点是高维求积点数爆炸，需要稀疏网格或 Smolyak 构造。回归法则在采样点上令残差最小：

$$ \min_{c}\ \sum_{i=1}^{M}\left(Q(\xi_i)-\sum_{\alpha}c_\alpha\Psi_\alpha(\xi_i)\right)^2 $$

只需 $M$ 约为基函数个数的 2～3 倍，适合黑箱，但对样本位置敏感，需用 LHS 或 D-最优设计。

### 3.2 代理模型与高斯过程

高斯过程代理把响应看成随机函数的实现，$Q(x)\sim\mathcal{GP}(m(x),k(x,x'))$，核函数 $k$ 的尺度参数由最大似然估计；预测同时给出均值与方差，后者可直接用于主动学习（在方差最大处补点）。高斯过程与 PCE 可互相转化（核展开），选择取决于样本预算与响应光滑度。

本征正交分解（POD）：把 $n$ 个快照排成矩阵 $X$，做奇异值分解

$$ X=U\Sigma V^{\top},\qquad X\approx\sum_{k=1}^{r}\sigma_k\,u_k\,v_k^{\top} $$

截断到 $r$ 阶的投影误差等于被丢弃奇异值的平方和。取使能量占比

$$ \frac{\sum_{k=1}^{r}\sigma_k^2}{\sum_{k=1}^{n}\sigma_k^2}\geq99.9\% $$

的最小 $r$，即得到近最优低维基。

动态模态分解（DMD）：把相邻快照写成线性映射

$$ X'\approx A\,X $$

用截断 SVD 求其低秩近似

$$ A\approx X'\hat{V}\hat{\Sigma}^{-1}\hat{U}^{\top} $$

$A$ 的特征值给出模态频率与增长率，特征向量给出 DMD 模态。POD 与 DMD 常结合使用：POD 降维，DMD 在低维空间上建演化算子。

降阶求解：把 POD 基 $\Phi$ 代入原离散方程并左乘 $\Phi^{\top}$，得到低维的 Galerkin 系统

$$ \Phi^{\top}R\!\left(\Phi\,\hat{u},m\right)=0 $$

它在 $r$ 维空间上求解，单次成本大幅下降；但非线性项仍需在满维上求值，可用超降阶（DEIM、GNAT）进一步加速。ROM 的稳定性并非自动成立，需监控能量与质量守恒，必要时加入稳定化。

## 4. 工程实施与参数

- MC 样本量：给定期望标准误差 $\delta$ 时 $N\approx(\sigma/\delta)^2$；先小样本估 $\sigma$ 再定 $N$。
- PCE 阶数与样本：光滑响应 $p$ 取 3～5；稀疏网格的样本数远小于全张量积；回归法样本数约为基函数个数的 2～3 倍。
- 正交基与分布匹配：高斯用 Hermite、均匀用 Legendre、Beta 用 Jacobi；不匹配会破坏正交性。
- POD 能量比：取 99%～99.99%，按目标量对截断的敏感度选取，并报告截断误差。
- DMD 采样率：须满足 Nyquist，噪声大时用前后向 tlsDMD 或先做去噪。
- 训练/验证隔离：代理与 ROM 必须留出独立测试集，禁止用训练误差报告精度。
- 可复现：固定随机种子，记录样本设计、维度与收敛历史。
- 求解器噪声：迭代容差过松时，UQ 会把数值噪声当不确定性；先固定容差，并验证样本间噪声远小于目标信号。
- 参数筛选：先用 Morris 或局部敏感度剔掉不重要参数，再对保留参数做 PCE 或 Sobol，样本利用率更高。
- 并行与批处理：MC 天然并行，按样本分块提交，需规定失败样本的处理与重试策略。
- ROM 稳定性：Galerkin 投影可能产生伪模态；对对流主导问题加稳定化或改用最小二乘 Petrov–Galerkin。
- 超降阶：非线性项用 DEIM 或 GNAT 采样，降低 ROM 在线成本。

## 5. 可复现示例

小算例一（MC 与 PCE 对照）：设 $\xi\sim U(0,1)$，响应 $Q(\xi)=\sin(2\pi\xi)$，理论均值 $\mathbb{E}[Q]=0$、方差 $\mathrm{Var}[Q]=1/2$。

- MC：取 $N=10^3,10^4,10^5$ 组样本，观察均值标准误按 $N^{-1/2}$ 下降；
- PCE：用 Legendre 基展开到 2 阶，2～3 个求积点即可精确得到系数，验证 $\mathbb{E}\approx c_0$ 与 $\mathrm{Var}\approx\sum c_\alpha^2$。

小算例二（POD）：对一维热传导在不同初始温度下取若干快照，做 SVD，绘制奇异值衰减曲线。

```text
输入: 快照矩阵 X (每列一个快照), 能量阈值 e=0.999
1) U,S,Vt = svd(X)
2) 累计能量 = cumsum(S**2)/sum(S**2)
3) r = 第一个使累计能量 >= e 的指标
4) Phi = U[:, :r]                 # 降阶基
5) 对任意新参数: 把解投影到 Phi 上求解小系统
校验: 重建误差 = ||X - Phi@Phi.T@X|| / ||X||
```

把重建误差画成 $r$ 的函数，应随 $r$ 单调下降；若出现平台，说明快照本身含噪声或维数不足。

小算例三（失效概率）：设响应 $Q(\xi)$ 服从已知分布，用 MC 估计 $P_f$ 并给出 $1-\alpha$ 置信区间。当 $P_f$ 很小（如 $10^{-6}$）而 MC 样本仅 $10^4$ 时，估计值为零或极不稳定，这正是必须上重要抽样或子集模拟的直接证据。

## 6. 常见坑与排查

- 混淆误差类型：把离散误差当输入不确定性报告，或反之；应分项报告。
- 样本量不足：MC 用几十个样本报尾部概率，置信区间比估计值还大。
- PCE 基与分布不匹配：正交性破坏，系数与方差全错。
- 阶数过高：高阶 PCE 系数震荡、过拟合；用交叉验证定阶。
- POD 外推：在训练参数域外使用 ROM，误差不受控。
- DMD 混入噪声：模态与增长率被噪声主导；降噪或提高采样率。
- 用训练误差报告精度：必须用独立测试集。
- 忽略相关性：输入相关时不能独立采样，需 Copula 或变量变换。
- 只报均值：方差、分位数与尾部概率同样重要。
- 随机与认知不确定性混用：把认知不确定性当概率分布会低估风险。
- 代理误差未评估：用代理代替真值却不报告代理精度。
- 参数筛选缺失：对几十个参数直接做 PCE，基函数个数爆炸。
- 未做网格与时间步收敛：UQ 结果随离散而变，无法区分输入与数值贡献。
- ROM 基未更新：参数漂移后旧基失效，重建误差上升。

诊断顺序：误差分项 → 输入分布与相关性 → 样本量与收敛历史 → 基与阶数及验证集 → ROM 有效域。

## 7. 检查清单与参考

清单：
1. 明确区分离散、模型与输入不确定性并分项报告；
2. 输入的概率或区间描述有依据；
3. 样本量与设计（MC/LHS/稀疏网格）明确，给出收敛历史；
4. PCE 基与分布匹配，阶数经交叉验证；
5. POD 截断能量比与重建误差均报告；
6. DMD 采样率满足 Nyquist 且做过去噪；
7. 代理与 ROM 有独立测试集与有效参数域；
8. 报告均值、方差、分位数与尾部概率。

参考：
1. Ghanem R., Spanos P., *Stochastic Finite Elements: A Spectral Approach*, Springer, 1991.
2. Xiu D., Karniadakis G.E., "The Wiener–Askey polynomial chaos for stochastic differential equations," *SIAM J. Sci. Comput.*, 24(2), 2002.
3. Berkooz G., Holmes P., Lumley J.L., "The proper orthogonal decomposition in the analysis of turbulent flows," *Annu. Rev. Fluid Mech.*, 25, 1993.
4. Schmid P.J., "Dynamic mode decomposition of numerical and experimental data," *J. Fluid Mech.*, 656, 2010.
5. Saltelli A., et al., *Global Sensitivity Analysis: The Primer*, Wiley, 2008.
