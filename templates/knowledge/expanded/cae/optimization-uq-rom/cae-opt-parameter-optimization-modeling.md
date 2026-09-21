---
template_version: flowlab-knowledge/1.0
slug: cae-opt-parameter-optimization-modeling
title: 参数优化：原理、设置与验证
summary: >-
  把参数优化写成含不等式与等式约束的规划问题，推导 KKT 条件与 SQP
  二次子问题，给出梯度法与无梯度法的分界，并用一个可手算的边界最优例子说明乘子符号的判读。
  全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: optimization-uq-rom
  name: 优化、不确定性与降阶
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 优化、不确定性与降阶
  - 参数优化
  - 方法原理与适用范围
  - KKT 条件
  - SQP 子问题
  - 工程设置与参数选择
  - 有限差分步长
  - 期望改进准则
  - 结果诊断与可信度验证
  - KKT 残差
  - 多起点聚类
seo:
  title: 参数优化：原理、设置与验证
  description: >-
    把参数优化写成含不等式与等式约束的规划问题，推导 KKT 条件与 SQP
    二次子问题，给出梯度法与无梯度法的分界，并用一个可手算的边界最优例子说明乘子符号的判读。
    全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 参数优化
    - 方法原理与适用范围
    - KKT 条件
    - SQP
    - 局部最优
    - 工程设置与参数选择
    - 缩放
    - 期望改进
    - SLSQP
    - 结果诊断与可信度验证
    - KKT 残差
    - 数值噪声
---
# 参数优化：原理、设置与验证

## 原理与适用范围

参数优化的建模工作量集中在三件事：设计变量的物理意义与边界、约束的可微性、以及目标在设计域内是否单峰。写错任何一条，算法都会收敛到一个数学上正确、工程上无意义的点。

### 标准形式与可微性前提

$$ \min_{\mathbf{x}\in\mathbb{R}^{n}} f(\mathbf{x})\quad \text{s.t.}\quad g_i(\mathbf{x})\le0,\ i=1,\dots,m,\qquad h_j(\mathbf{x})=0,\ j=1,\dots,r $$

梯度型算法要求 $f$、$g$、$h$ 连续可微。绝对值型目标、最大值型约束与查表插值都会破坏可微性：前者要用平方光滑化，后者要用 p-norm 聚合或改用无梯度算法。若目标在最优解附近存在 1% 量级的跳变，梯度信息完全不可用。

### KKT 条件是停止准则的数学依据

在约束规范成立时，最优点满足

$$ \nabla f(\mathbf{x}^{\star})+\sum_{i=1}^{m}\lambda_i\nabla g_i(\mathbf{x}^{\star})+\sum_{j=1}^{r}\mu_j\nabla h_j(\mathbf{x}^{\star})=\mathbf{0},\qquad \lambda_i\ge0,\quad \lambda_i g_i(\mathbf{x}^{\star})=0 $$

手算一个例子：$\min (x-3)^2$ s.t. $x\le2$。无约束极小在 $x=3$，越界；取约束活跃 $x^\star=2$，$\nabla f=2(2-3)=-2$，$\nabla g=1$，于是 $\lambda=2>0$，KKT 成立，最优值 $f=(2-3)^2=1$。若解得 $\lambda<0$，说明该约束本不该活跃，应放开重解——这是识别"假收敛"最快的手段。

### SQP 把非线性问题变成一串二次规划

SQP 在当前点用二次模型近似拉格朗日函数、用线性化近似约束：

$$ \min_{\mathbf{d}}\ \frac{1}{2}\mathbf{d}^{\top}B_k\mathbf{d}+\nabla f(\mathbf{x}_k)^{\top}\mathbf{d}\quad \text{s.t.}\quad \nabla g_i(\mathbf{x}_k)^{\top}\mathbf{d}+g_i(\mathbf{x}_k)\le0 $$

$B_k$ 用 BFGS 更新。子问题是凸二次规划，可用有效集法求解，因此 SQP 对 5～50 个变量的工程问题非常高效，且天然处理变量上下界。

### 局部最优与全局最优的分界

SQP、信任域、内点法都只保证收敛到局部极小。判断是否需要全局搜索的依据是目标的单峰性：若从 20 个不同初值出发得到 3 个不同的最优值，且最优值相差 12%，说明目标多峰，应改用多起点策略或 CMA-ES、贝叶斯优化。多起点聚类时，最优值相对差小于 1% 的点视为同一局部解。

### 一个可核对的边界最优算例

矩形截面悬臂梁，长度 $L=1.0\ \mathrm{m}$，端部集中力 $F=2.0\ \mathrm{kN}$，材料密度 $\rho=7850\ \mathrm{kg/m^3}$，许用弯曲应力 $\sigma_{\mathrm{allow}}=235\ \mathrm{MPa}$。设计变量为截面宽 $b\in[0.02,0.20]\ \mathrm{m}$ 与高 $h\in[0.05,0.40]\ \mathrm{m}$，目标是最小质量

$$ m=\rho\,b\,h\,L,\qquad \text{s.t.}\quad \sigma_{\max}=\frac{6FL}{b h^{2}}\le\sigma_{\mathrm{allow}} $$

先把约束写成几何量的形式：$bh^{2}\ge 6FL/\sigma_{\mathrm{allow}}=6\times2000\times1.0/(235\times10^{6})=5.106\times10^{-5}\ \mathrm{m^3}$。质量正比于 $bh$，在 $bh^{2}$ 取定值时 $bh=c/h$ 随 $h$ 单调下降，所以无约束方向上算法会把 $h$ 推向 0.40 m、$b$ 压到 $3.19\times10^{-4}\ \mathrm{m}$——这已经违反 $b\ge0.02\ \mathrm{m}$ 的下界。真正的解落在边界交点：取 $b=0.02\ \mathrm{m}$，由约束得 $h=\sqrt{5.106\times10^{-5}/0.02}=0.0505\ \mathrm{m}$，此时 $m=7850\times0.02\times0.0505\times1.0=7.93\ \mathrm{kg}$。

这个例子的价值在于：**最优解由两个活跃约束共同确定**（应力等式与 $b$ 的下界），$h$ 是自由的。若忽略变量上下界，问题退化为 $m\to0$ 的病态解；这正是"设计变量必须有物理边界"的原因。实际求解时中心差分步长取 $h_{\mathrm{fd}}=10^{-3}\max(1,|x|)$，对 $b=0.02$ 即 $1.0\times10^{-3}\ \mathrm{m}$，与下界的比值已达 5%，步长再大就会跨过活跃边界，梯度验证会假失败。单次有限元评估约 12 s，按上表 30～100 次评估估算，总机时为 6～20 min。

### 算法选择

| 目标/约束特征 | 推荐算法 | 变量规模 | 典型评估次数 |
|---|---|---|---|
| 光滑、有解析梯度 | SQP / 内点法 | 5～50 | 30～100 |
| 光滑、黑箱 | 信任域 + 有限差分 | 2～10 | 100～300 |
| 非光滑、多峰 | CMA-ES | 5～30 | $10^{3}\sim10^{4}$ |
| 单次评估昂贵 | 贝叶斯优化 | 1～15 | 50～200 |

### 边界情况

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

### 参考文献

1. Nocedal J., Wright S.J., *Numerical Optimization*, 2nd ed., Springer, 2006.
2. Fletcher R., *Practical Methods of Optimization*, 2nd ed., Wiley, 1987.
3. Jones D.R., Schonlau M., Welch W.J., "Efficient global optimization of expensive black-box functions," *Journal of Global Optimization*, 13, 1998.
4. Forrester A.I.J., Sóbester A., Keane A.J., *Engineering Design via Surrogate Modelling: A Practical Guide*, Wiley, 2008.
5. Conn A.R., Gould N.I.M., Toint P.L., *Trust-Region Methods*, SIAM, 2000.

## 工程设置与参数选择

同一套参数优化代码，换一组缩放或差分步长就可能从收敛变成停滞。本文给出可直接落地的配置项与判据，覆盖梯度型算法、代理模型与并行提交三类场景。

### 缩放是第一步而不是优化后的处理

变量量级相差 $10^{3}$ 以上时，Hessian 条件数会恶化到 BFGS 更新失效。做法是把变量除以名义值：

$$ \hat{x}_i=\frac{x_i}{s_i},\qquad s_i=\max\left(\frac{|x_i^{lo}|+|x_i^{up}|}{2},\ 10^{-12}\right) $$

半径 20 mm 与厚度 2 mm 同时作为变量时，$s$ 分别取 20 与 2，缩放后两者都在 1 附近，梯度的量级也随之可比。

### 有限差分步长的最优量级

求解器残差容差为 $10^{-6}$ 时函数值噪声约 $10^{-6}$。中心差分误差由噪声项 $\epsilon/h$ 与截断项 $h^{2}f'''/6$ 竞争，最优步长

$$ h^{\star}=\left(\frac{6\epsilon}{|f'''|}\right)^{1/3} $$

取 $\epsilon=10^{-6}$、$|f'''|\approx1$，得 $h^\star\approx1.8\times10^{-2}$（相对步长）。工程常用 $10^{-3}\sim10^{-2}$；取 $10^{-6}$ 会因噪声得到完全错误的梯度方向。

### 算法与容差配置

| 配置项 | 取值 | 说明 |
|---|---|---|
| 算法 | SLSQP | 含等式与不等式约束 |
| 最优性容差 | $10^{-6}$ | 梯度无穷范数 |
| 约束容差 | $10^{-6}$ | 最大违反量 |
| 最大迭代 | 200 | 单起点 |
| 相对差分步长 | $10^{-3}$ | 无解析梯度时 |
| 多起点数 | 5 | LHS 抽样 |
| 并行核数 | 12 | 按评估分块 |
| 代理初始样本 | 64 | 8 变量 |
| EI 加点数 | 20 | 序贯加点 |

8 个变量取 64 个 LHS 样本，平均每个维度 8 个点；再加 20 个 EI 加点，总评估 84 次。若 84 次后代理的相对预测误差仍高于 5%，说明响应非光滑，应改用 CMA-ES 直接搜索。

### 期望改进准则与采样边界

代理模型给出预测均值 $\mu$ 与标准差 $\sigma$，相对当前最优 $f_{min}$ 的期望改进

$$ EI(\mathbf{x})=\left(f_{min}-\mu\right)\Phi(z)+\sigma\,\phi(z),\qquad z=\frac{f_{min}-\mu}{\sigma} $$

$\Phi$、$\phi$ 是标准正态分布函数与密度。$z<-3$ 的点几乎不会被选中，因此要靠显式的变量边界把搜索限制在物理可行域内，而不是指望 EI 自动避开。

```python
import numpy as np
from scipy.optimize import minimize
from scipy.stats import qmc

def optimize(f, g, x0, lo, hi, nstart=5, maxiter=200):
    s = (np.abs(lo) + np.abs(hi)) / 2.0
    obj = lambda x: f(x * s)
    cons = [{"type": "ineq", "fun": lambda x: -g(x * s)}]
    sampler = qmc.LatinHypercube(d=len(x0), seed=20260920)
    starts = qmc.scale(sampler.random(nstart), lo, hi)
    best = None
    for x in starts:
        r = minimize(obj, x / s, method="SLSQP",
                     bounds=list(zip(lo / s, hi / s)),
                     constraints=cons,
                     options=dict(ftol=1e-6, maxiter=maxiter, eps=1e-3))
        if best is None or r.fun < best.fun:
            best = r
    return best          # 5 起点取最优, 并记录聚类结果
```

### 并行提交与失败重试

参数评估天然并行，按 12 核分块提交，每块 8 个评估。求解失败的样本必须显式记录并重试 2 次，若仍失败则标记为缺失并排除出代理训练集；把失败样本当作"目标值很大"会污染响应面，让优化器绕开本可行但求解器不稳定的区域。

### 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 迭代 1 次即"收敛" | 差分步长过大，梯度被截断 | 步长从 $10^{-2}$ 降到 $10^{-3}$ |
| 梯度方向随机跳变 | 步长小于求解器噪声 $10^{-6}$ | 收紧求解器容差或放大步长 |
| 最优值随起点变化 20% | 目标多峰 | 5 起点聚类比较 |
| 约束违反停在 $10^{-4}$ | 约束与目标量级差过大 | 归一化约束后重跑 |
| 代理预测误差 8% | 响应非光滑 | 改用 CMA-ES |
| 部分样本目标值异常大 | 求解失败被当成目标值 | 记录求解状态并重试 |

### 参考文献

1. Box G.E.P., Wilson K.B., "On the experimental attainment of optimum conditions," *Journal of the Royal Statistical Society: Series B*, 13, 1951.
2. Myers R.H., Montgomery D.C., Anderson-Cook C.M., *Response Surface Methodology: Process and Product Optimization Using Designed Experiments*, 4th ed., Wiley, 2016.
3. Deb K., *Multi-Objective Optimization Using Evolutionary Algorithms*, Wiley, 2001.
4. Hansen N., Ostermeier A., "Completely derandomized self-adaptation in evolution strategies," *Evolutionary Computation*, 9, 2001.
5. Nelder J.A., Mead R., "A simplex method for function minimization," *The Computer Journal*, 7, 1965.

## 诊断与可信度验证

参数优化给出的只是一个"最优点"，验证它要回答三个问题：它是否满足一阶最优条件、它是不是全局的、以及它的最优值是否被数值误差污染。三类检查都要有独立证据。

### 用可解析算例标定求解器

Rosenbrock 函数

$$ f(x,y)=(1-x)^{2}+100\left(y-x^{2}\right)^{2} $$

的唯一全局极小在 $(1,1)$，$f=0$；在原点 $(0,0)$ 处 $f=1$。用同一求解器从 $(-1.2,1)$ 出发应回到 $(1,1)$ 且梯度无穷范数低于 $10^{-6}$。这一步用来确认缩放、步长与容差配置无误，之后再上真实模型，否则模型层面的错误会被算例掩盖。

### KKT 残差是收敛的硬判据

$$ r_{KKT}=\left\lVert\nabla f+\sum_i\lambda_i\nabla g_i+\sum_j\mu_j\nabla h_j\right\rVert_{\infty}+\left\lVert\max\left(0,\mathbf{g}\right)\right\rVert_{\infty}+\left\lVert\mathbf{h}\right\rVert_{\infty} $$

判据为 $r_{KKT}<10^{-6}$。若目标在最后 20 次迭代只下降 0.01% 而 $r_{KKT}$ 仍停在 $10^{-3}$，是约束容差过松而非真正收敛，此时报告"已收敛"是错的。

### 多起点识别局部解

从 20 个 LHS 初值出发，把最优值按 1% 的相对容差聚类。若得到 3 个聚类且最优值相差 12%，说明目标多峰。报告必须给出每个聚类的吸引域占比，不能只报最好的那一个——因为工程上初值往往来自既有设计，落在哪个吸引域是已知的。

### 约束违反要按类型分解

等式约束违反 $\lVert\mathbf{h}\rVert_\infty$、不等式违反 $\lVert\max(0,\mathbf{g})\rVert_\infty$、以及活跃约束的乘子符号必须分别报告。乘子为负意味着约束被错误判定为活跃，这是最常见的一类假收敛。互补松弛条件 $\lambda_i g_i=0$ 也应逐项核对。

### 目标改善量必须超过数值噪声

求解器容差 $10^{-6}$、目标量级 $10^{4}$ 时，相对噪声约 $10^{-10}$；若优化前后目标只改善 $10^{-4}$，改善量与噪声同量级，结论不成立。判据：目标改善量必须比求解器相对容差大至少两个数量级。更严格的做法是在同一点用两种容差各求一次，比较目标值差异作为噪声量级。

### 诊断表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $r_{KKT}=10^{-3}$ 但目标不再下降 | 约束容差过松 | 收紧到 $10^{-6}$ 重跑 |
| 20 起点得到 3 个最优值 | 目标多峰 | 报告各聚类吸引域占比 |
| 活跃约束乘子为负 | 约束不应活跃 | 放开该约束重解 |
| 目标改善量 $10^{-4}$ | 与求解器噪声同量级 | 收紧求解器容差后重算 |
| 梯度校核误差 50% | 步长不合适 | 扫 $h\in[10^{-6},10^{-2}]$ 找误差最小点 |
| Rosenbrock 算例未回到 $(1,1)$ | 缩放或容差配置错误 | 先修算例再上真实模型 |

```python
import numpy as np

def kkt_residual(grad_f, cons, x, lam, mu):
    r = grad_f(x).copy()
    for l, g in zip(lam, cons["ineq"]):
        r += l * g["grad"](x)
    for m, h in zip(mu, cons["eq"]):
        r += m * h["grad"](x)
    viol_ineq = np.max(np.maximum(0.0, [g["fun"](x) for g in cons["ineq"]]))
    viol_eq = np.max(np.abs([h["fun"](x) for h in cons["eq"]]))
    return np.max(np.abs(r)) + viol_ineq + viol_eq      # 判据 < 1e-6
```

### 参考文献

1. Moré J.J., Garbow B.S., Hillstrom K.E., "Testing unconstrained optimization software," *ACM Transactions on Mathematical Software*, 7, 1981.
2. Dennis J.E., Schnabel R.B., *Numerical Methods for Unconstrained Optimization and Nonlinear Equations*, SIAM, 1996.
3. Rios L.M., Sahinidis N.V., "Derivative-free optimization: a review of algorithms and comparison of software implementations," *Journal of Global Optimization*, 56, 2013.
4. Kolda T.G., Lewis R.M., Torczon V., "Optimization by direct search: new perspectives on some classical and modern methods," *SIAM Review*, 45, 2003.
5. Gill P.E., Murray W., Wright M.H., *Practical Optimization*, Academic Press, 1981.
