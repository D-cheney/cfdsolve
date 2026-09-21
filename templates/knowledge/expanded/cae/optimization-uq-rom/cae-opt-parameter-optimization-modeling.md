---
template_version: "flowlab-knowledge/1.0"
slug: cae-opt-parameter-optimization-modeling
title: "参数优化：方法原理与适用范围"
summary: "把参数优化写成含不等式与等式约束的规划问题，推导 KKT 条件与 SQP 二次子问题，给出梯度法与无梯度法的分界，并用一个可手算的边界最优例子说明乘子符号的判读。"
category:
  slug: optimization-uq-rom
  name: "优化、不确定性与降阶"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "优化、不确定性与降阶"
  - "参数优化"
  - "方法原理与适用范围"
  - "KKT 条件"
  - "SQP 子问题"
seo:
  title: "参数优化：方法原理与适用范围"
  description: "把参数优化写成含不等式与等式约束的规划问题，推导 KKT 条件与 SQP 二次子问题，给出梯度法与无梯度法的分界，并用一个可手算的边界最优例子说明乘子符号的判读。"
  keywords:
    - "参数优化"
    - "方法原理与适用范围"
    - "KKT 条件"
    - "SQP"
    - "局部最优"
---

# 参数优化：方法原理与适用范围

参数优化的建模工作量集中在三件事：设计变量的物理意义与边界、约束的可微性、以及目标在设计域内是否单峰。写错任何一条，算法都会收敛到一个数学上正确、工程上无意义的点。

## 标准形式与可微性前提

$$ \min_{\mathbf{x}\in\mathbb{R}^{n}} f(\mathbf{x})\quad \text{s.t.}\quad g_i(\mathbf{x})\le0,\ i=1,\dots,m,\qquad h_j(\mathbf{x})=0,\ j=1,\dots,r $$

梯度型算法要求 $f$、$g$、$h$ 连续可微。绝对值型目标、最大值型约束与查表插值都会破坏可微性：前者要用平方光滑化，后者要用 p-norm 聚合或改用无梯度算法。若目标在最优解附近存在 1% 量级的跳变，梯度信息完全不可用。

## KKT 条件是停止准则的数学依据

在约束规范成立时，最优点满足

$$ \nabla f(\mathbf{x}^{\star})+\sum_{i=1}^{m}\lambda_i\nabla g_i(\mathbf{x}^{\star})+\sum_{j=1}^{r}\mu_j\nabla h_j(\mathbf{x}^{\star})=\mathbf{0},\qquad \lambda_i\ge0,\quad \lambda_i g_i(\mathbf{x}^{\star})=0 $$

手算一个例子：$\min (x-3)^2$ s.t. $x\le2$。无约束极小在 $x=3$，越界；取约束活跃 $x^\star=2$，$\nabla f=2(2-3)=-2$，$\nabla g=1$，于是 $\lambda=2>0$，KKT 成立，最优值 $f=(2-3)^2=1$。若解得 $\lambda<0$，说明该约束本不该活跃，应放开重解——这是识别"假收敛"最快的手段。

## SQP 把非线性问题变成一串二次规划

SQP 在当前点用二次模型近似拉格朗日函数、用线性化近似约束：

$$ \min_{\mathbf{d}}\ \frac{1}{2}\mathbf{d}^{\top}B_k\mathbf{d}+\nabla f(\mathbf{x}_k)^{\top}\mathbf{d}\quad \text{s.t.}\quad \nabla g_i(\mathbf{x}_k)^{\top}\mathbf{d}+g_i(\mathbf{x}_k)\le0 $$

$B_k$ 用 BFGS 更新。子问题是凸二次规划，可用有效集法求解，因此 SQP 对 5～50 个变量的工程问题非常高效，且天然处理变量上下界。

## 局部最优与全局最优的分界

SQP、信任域、内点法都只保证收敛到局部极小。判断是否需要全局搜索的依据是目标的单峰性：若从 20 个不同初值出发得到 3 个不同的最优值，且最优值相差 12%，说明目标多峰，应改用多起点策略或 CMA-ES、贝叶斯优化。多起点聚类时，最优值相对差小于 1% 的点视为同一局部解。

## 一个可核对的边界最优算例

矩形截面悬臂梁，长度 $L=1.0\ \mathrm{m}$，端部集中力 $F=2.0\ \mathrm{kN}$，材料密度 $\rho=7850\ \mathrm{kg/m^3}$，许用弯曲应力 $\sigma_{\mathrm{allow}}=235\ \mathrm{MPa}$。设计变量为截面宽 $b\in[0.02,0.20]\ \mathrm{m}$ 与高 $h\in[0.05,0.40]\ \mathrm{m}$，目标是最小质量

$$ m=\rho\,b\,h\,L,\qquad \text{s.t.}\quad \sigma_{\max}=\frac{6FL}{b h^{2}}\le\sigma_{\mathrm{allow}} $$

先把约束写成几何量的形式：$bh^{2}\ge 6FL/\sigma_{\mathrm{allow}}=6\times2000\times1.0/(235\times10^{6})=5.106\times10^{-5}\ \mathrm{m^3}$。质量正比于 $bh$，在 $bh^{2}$ 取定值时 $bh=c/h$ 随 $h$ 单调下降，所以无约束方向上算法会把 $h$ 推向 0.40 m、$b$ 压到 $3.19\times10^{-4}\ \mathrm{m}$——这已经违反 $b\ge0.02\ \mathrm{m}$ 的下界。真正的解落在边界交点：取 $b=0.02\ \mathrm{m}$，由约束得 $h=\sqrt{5.106\times10^{-5}/0.02}=0.0505\ \mathrm{m}$，此时 $m=7850\times0.02\times0.0505\times1.0=7.93\ \mathrm{kg}$。

这个例子的价值在于：**最优解由两个活跃约束共同确定**（应力等式与 $b$ 的下界），$h$ 是自由的。若忽略变量上下界，问题退化为 $m\to0$ 的病态解；这正是"设计变量必须有物理边界"的原因。实际求解时中心差分步长取 $h_{\mathrm{fd}}=10^{-3}\max(1,|x|)$，对 $b=0.02$ 即 $1.0\times10^{-3}\ \mathrm{m}$，与下界的比值已达 5%，步长再大就会跨过活跃边界，梯度验证会假失败。单次有限元评估约 12 s，按上表 30～100 次评估估算，总机时为 6～20 min。

## 算法选择

| 目标/约束特征 | 推荐算法 | 变量规模 | 典型评估次数 |
|---|---|---|---|
| 光滑、有解析梯度 | SQP / 内点法 | 5～50 | 30～100 |
| 光滑、黑箱 | 信任域 + 有限差分 | 2～10 | 100～300 |
| 非光滑、多峰 | CMA-ES | 5～30 | $10^{3}\sim10^{4}$ |
| 单次评估昂贵 | 贝叶斯优化 | 1～15 | 50～200 |

## 边界情况

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 收敛到 $\lambda<0$ | 约束本不该活跃 | 放开该约束重解 |
| 目标出现平台 | 变量对目标不敏感 | 扫单变量灵敏度曲线 |
| 20 个初值得到 3 个解 | 目标多峰 | 多起点加聚类 |
| 梯度法 1 步内"收敛" | 缩放错误导致步长被放行 | 检查变量量级差是否超 $10^{3}$ |
| 约束违反始终为 $10^{-3}$ | 约束容差过松 | 收紧到 $10^{-6}$ |

```text
参数优化建模检查
输入: f, g_i, h_j, 变量上下界
1) 检查可微性: 目标是否含 max/abs/查表 -> 需光滑化或聚合
2) 无量纲化: x_hat = x / s, s 取变量名义值
3) 梯度: 解析优先, 否则中心差分 h = 1e-3 * max(1, |x|)
4) 求解: SQP, 判据 ||grad L||_inf < 1e-6 且约束违反 < 1e-6
5) 多起点: 20 个 LHS 初值, 按最优值 1% 容差聚类
6) 验证 KKT: 检查乘子符号与互补松弛条件
```

## 参考文献

1. Nocedal J., Wright S.J., *Numerical Optimization*, 2nd ed., Springer, 2006.
2. Fletcher R., *Practical Methods of Optimization*, 2nd ed., Wiley, 1987.
3. Jones D.R., Schonlau M., Welch W.J., "Efficient global optimization of expensive black-box functions," *Journal of Global Optimization*, 13, 1998.
4. Forrester A.I.J., Sóbester A., Keane A.J., *Engineering Design via Surrogate Modelling: A Practical Guide*, Wiley, 2008.
5. Conn A.R., Gould N.I.M., Toint P.L., *Trust-Region Methods*, SIAM, 2000.
