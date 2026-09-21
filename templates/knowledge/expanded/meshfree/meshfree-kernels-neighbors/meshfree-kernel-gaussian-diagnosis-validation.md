---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-kernel-gaussian-diagnosis-validation
title: "Gaussian 核与截断：结果诊断与可信度验证"
summary: "用截断质量损失、截断处梯度跳变与离散归一化残差三项指标诊断 Gaussian 核 SPH 结果，给出 erfc 形式的尾部质量公式与 q_c=2/3/4 的定量对照。"
category:
  slug: meshfree-kernels-neighbors
  name: "无网格法核函数与邻域搜索"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法核函数与邻域搜索"
  - "Gaussian 核与截断"
  - "结果诊断与可信度验证"
  - "截断误差"
  - "离散归一化"
seo:
  title: "Gaussian 核与截断：结果诊断与可信度验证"
  description: "用截断质量损失、截断处梯度跳变与离散归一化残差三项指标诊断 Gaussian 核 SPH 结果，给出 erfc 形式的尾部质量公式与 q_c=2/3/4 的定量对照。"
  keywords:
    - "Gaussian 核与截断"
    - "结果诊断与可信度验证"
    - "截断误差"
    - "离散归一化"
    - "erfc"
---

# Gaussian 核与截断：结果诊断与可信度验证

Gaussian 核没有紧支撑，工程实现必须人为截断到 $r_c=q_c h$。截断半径取多少，直接决定三件事：丢失多少核质量、截断处梯度跳多大、以及离散归一化偏离 1 多少。这三项都可以手算，也正是诊断 Gaussian 核结果是否可信的入口。本文给出闭式表达、$q_c=2/3/4$ 三档的定量对照，以及把它与紧支撑核基准对比的判定方法。

## Gaussian 核的归一化与截断质量损失

$d$ 维 Gaussian 核写作

$$W(r,h)=\frac{1}{\left(h\sqrt{\pi}\right)^{d}}\exp\!\left(-\frac{r^{2}}{h^{2}}\right)$$

它在全空间的积分恰为 1，因此没有"归一化常数需要推导"的问题，只有"截掉多少"的问题。三维下 $r_c=q_ch$ 之外的剩余质量占比为

$$E_{3}(q_{c})=\mathrm{erfc}(q_{c})+\frac{2q_{c}}{\sqrt{\pi}}e^{-q_{c}^{2}}$$

代入三档：$q_c=2$ 时 $\mathrm{erfc}(2)=4.678\times10^{-3}$，第二项 $2\times2/1.7725\times e^{-4}=2.257\times0.01832=4.133\times10^{-2}$，合计 $4.60\times10^{-2}$，即损失 4.60%；$q_c=3$ 时 $\mathrm{erfc}(3)=2.209\times10^{-5}$，第二项 $3.385\times1.234\times10^{-4}=4.177\times10^{-4}$，合计 $4.40\times10^{-4}$，损失 0.044%；$q_c=4$ 时合计 $5.23\times10^{-7}$，损失 $5.2\times10^{-5}\%$。**这就是选择 $q_c$ 的第一条硬依据**：要论证 0.1% 量级的物理差异，$q_c$ 至少取 3；取 2 相当于一开始就丢了 4.6% 的质量。

## 截断半径选择：从质量损失到梯度跳变

质量损失只是系统误差，截断处的不连续才是噪声源。Gaussian 核在 $r_c$ 处 $W(r_c,h)\neq0$，而紧支撑核在该处严格为零。取 $h=12\ \text{mm}$，三维核中心值 $W(0)=1/(h^{3}\pi^{3/2})=1/(1.728\times10^{-6}\times5.568)=1.04\times10^{5}\ \text{m}^{-3}$。

$q_c=3$ 时 $W(3h)=1.04\times10^{5}\times e^{-9}=1.04\times10^{5}\times1.234\times10^{-4}=12.8\ \text{m}^{-3}$；$q_c=2$ 时 $W(2h)=1.04\times10^{5}\times e^{-4}=1.90\times10^{3}\ \text{m}^{-3}$，大了 148 倍。更有意义的是梯度跳变相对于峰值梯度的比例。$\left|dW/dr\right|$ 的峰值出现在 $q=1/\sqrt{2}$，为 $2\times0.7071\times W(0)e^{-0.5}/h=2\times0.7071\times6.30\times10^{4}/0.012=7.43\times10^{6}\ \text{m}^{-4}$；截断处 $\left|dW/dr\right|_{r_c}=2q_cW(q_ch)/h$，$q_c=2$ 时为 $6.35\times10^{5}$，占峰值 8.5%；$q_c=3$ 时为 $6.41\times10^{3}$，占 0.086%。

判定阈值：截断处梯度跳变应低于峰值梯度的 1%。据此 $q_c\ge2.6$ 即可，工程上取 $q_c=3.0$ 留余量。若实测力场在 $r_c$ 附近出现"壳层状"的规则噪声（粒子恰好排布在截断球面上），说明 $q_c$ 过小，应直接加大而不是调人工黏性。

## 离散归一化与 Shepard 修正的诊断

截断后连续积分不再是 1，离散求和更是如此。诊断量是

$$S_{i}=\sum_j V_j W_{ij},\qquad V_j=\frac{m_j}{\rho_j}$$

在密度均匀的内部区域，$q_c=3$、$\eta=h/\Delta p=1.2$ 时 $S_i$ 应落在 $1.00\pm0.01$；$q_c=2$ 时会系统性偏低到约 0.95（与 4.6% 的尾部损失一致，这是**可核对的一致性**）。自由面与壁面处 $S_i<1$ 属几何截断，不算缺陷，但若内部区也低于 0.98，说明 $q_c$ 不足或求和被静默截断。

修正方式有两种，诊断时要知道自己在用哪一种：一是 Shepard 重规化 $W_{ij}^{corr}=W_{ij}/S_i$，它恢复零阶一致性但会破坏成对力反对称性；二是改用归一化梯度形式 $\nabla W_{ij}^{corr}=(\nabla W_{ij}-\beta_iW_{ij})/S_i$，其中 $\beta_i=\sum_jV_j\nabla_iW_{ij}$。若只做了第一种却报告"动量守恒到机器精度"，结论就是错的——Shepard 修正后的力不再反对称，动量会有可测的漂移。

## 与紧支撑核基准的对照

最直接的验证是换核双跑：把 Gaussian（$q_c=3$）与 Wendland C2（$\kappa=2$）在同一算例上对比。合格标准是：内部区密度波动、最大压力、总动能差异小于 5%；若 Gaussian 版压力噪声明显更大，先查 $q_c$ 与 $S_i$，而不是归因于"核不够光滑"。

第二个对照是粒子数收敛：$q_c=3$ 时邻居数 $N_3=\frac{4}{3}\pi(1.2\times3)^{3}=4.189\times46.66=195$，而 Wendland C2 取 $\kappa=2$ 时 $N_3=\frac{4}{3}\pi(2.4)^{3}=58$。同样的 $\eta=1.2$，Gaussian 的每步求和量是紧支撑核的 3.4 倍。若结果质量提升不到 5%，这笔开销就不划算——**"值不值得用 Gaussian"应当用这个比值来回答**。

```python
# Gaussian 核截断误差与梯度跳变诊断
import math
h, d = 0.012, 3            # m, 3D
W0 = 1.0 / (h * math.sqrt(math.pi))**d
dW_peak = 2.0 * (1/math.sqrt(2)) * W0 * math.exp(-0.5) / h
for qc in (2.0, 2.5, 3.0, 4.0):
    tail = math.erfc(qc) + 2*qc/math.sqrt(math.pi)*math.exp(-qc*qc)  # 3D
    Wc   = W0 * math.exp(-qc*qc)
    jump = 2.0 * qc * Wc / h
    print("qc=%.1f  tail=%.3e  W(rc)/W(0)=%.3e  jump/peak=%.3f%%"
          % (qc, tail, Wc/W0, 100.0*jump/dW_peak))
# 参考输出: qc=2.0 jump/peak=8.5% ; qc=3.0 jump/peak=0.086%
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 内部区 $S_i$ 系统性偏低到 0.95 | $q_c=2$，尾部质量丢 4.6% | 按 $E_3(q_c)$ 手算并与实测 $S_i$ 对照 |
| 力场出现壳层状规则噪声 | 截断处梯度跳变过大 | 算 jump/peak，要求低于 1%（$q_c\ge2.6$） |
| 粒子在 $r_c$ 球面上聚集成壳 | 截断核吸引效应 | 加大 $q_c$ 到 3.0 后重跑 |
| 动量持续漂移 | Shepard 重规化破坏了反对称性 | 换用归一化梯度形式并复测总动量 |
| 每步耗时是紧支撑核的 3 倍以上 | $N_3=195$ 对 58 | 对比 $\frac{4}{3}\pi(\eta q_c)^3$ 与 $(\eta\kappa)^3$ |
| 换核后结果差 20% 以上 | $q_c$ 或 $\eta$ 不一致 | 固定 $\eta$ 与等效邻居数再比 |
| 边界附近结果对 $q_c$ 异常敏感 | 几何截断叠加尾部损失 | 分别统计内部、壁面、自由面的 $S_i$ |

## 参考文献

1. Gingold R.A., Monaghan J.J., "Smoothed particle hydrodynamics: theory and application to non-spherical stars," *Monthly Notices of the Royal Astronomical Society*, 181, 1977.
2. Monaghan J.J., "Smoothed Particle Hydrodynamics," *Annual Review of Astronomy and Astrophysics*, 30, 1992.
3. Liu M.B., Liu G.R., "Smoothed Particle Hydrodynamics: An Overview and Recent Developments," *Archives of Computational Methods in Engineering*, 17, 2010.
4. Dehnen W., Aly H., "Improving convergence in smoothed particle hydrodynamics simulations without pairing instability," *Monthly Notices of the Royal Astronomical Society*, 425, 2012.
5. Wendland H., "Piecewise polynomial, positive definite and compactly supported radial functions of minimal degree," *Advances in Computational Mathematics*, 4, 1995.
6. Colagrossi A., Landrini M., "Numerical simulation of interfacial flows by smoothed particle hydrodynamics," *Journal of Computational Physics*, 191, 2003.
