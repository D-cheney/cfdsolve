---
template_version: flowlab-knowledge/1.0
slug: meshfree-kernel-gaussian-engineering-setup
title: Gaussian 核与截断：工程设置与诊断验证
summary: >-
  给出 Gaussian 核的落地配置：σ_d=π^{-d/2} 归一化、q_c 与邻居数成本权衡、链表格元与 Verlet 缓冲联动、以及 Shepard
  重规化与换用 Wendland 核的选择依据。
category:
  slug: meshfree-kernels-neighbors
  name: 无网格法核函数与邻域搜索
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - MESHFREE
  - 无网格法核函数与邻域搜索
  - Gaussian 核与截断
  - 工程设置与参数选择
  - 归一化常数
  - 链表搜索
  - 结果诊断与可信度验证
  - 截断误差
  - 离散归一化
seo:
  title: Gaussian 核与截断：工程设置与诊断验证
  description: >-
    给出 Gaussian 核的落地配置：σ_d=π^{-d/2} 归一化、q_c 与邻居数成本权衡、链表格元与 Verlet 缓冲联动、以及
    Shepard 重规化与换用 Wendland 核的选择依据。
  keywords:
    - Gaussian 核与截断
    - 工程设置与参数选择
    - 归一化常数
    - 链表搜索
    - Shepard 重规化
    - 结果诊断与可信度验证
    - 截断误差
    - 离散归一化
    - erfc
---
# Gaussian 核与截断：工程设置与诊断验证

用 Gaussian 核的工程决策其实只有三个：截断半径取几倍 $h$、归一化怎么处理、以及值不值得为它付更高的邻居搜索成本。这三个问题都可以先用公式算出数字再决定，不必先跑一遍再看。Gaussian 核没有紧支撑，工程实现必须人为截断到 $r_c=q_c h$。截断半径取多少，直接决定三件事：丢失多少核质量、截断处梯度跳多大、以及离散归一化偏离 1 多少。这三项都可以手算，也正是诊断 Gaussian 核结果是否可信的入口。

## 截断半径选择：从质量损失到梯度跳变

质量损失只是系统误差，截断处的不连续才是噪声源。Gaussian 核在 $r_c$ 处 $W(r_c,h)\neq0$，而紧支撑核在该处严格为零。取 $h=12\ \text{mm}$，三维核中心值 $W(0)=1/(h^{3}\pi^{3/2})=1/(1.728\times10^{-6}\times5.568)=1.04\times10^{5}\ \text{m}^{-3}$。

$q_c=3$ 时 $W(3h)=1.04\times10^{5}\times e^{-9}=1.04\times10^{5}\times1.234\times10^{-4}=12.8\ \text{m}^{-3}$；$q_c=2$ 时 $W(2h)=1.04\times10^{5}\times e^{-4}=1.90\times10^{3}\ \text{m}^{-3}$，大了 148 倍。更有意义的是梯度跳变相对于峰值梯度的比例。$\left|dW/dr\right|$ 的峰值出现在 $q=1/\sqrt{2}$，为 $2\times0.7071\times W(0)e^{-0.5}/h=2\times0.7071\times6.30\times10^{4}/0.012=7.43\times10^{6}\ \text{m}^{-4}$；截断处 $\left|dW/dr\right|_{r_c}=2q_cW(q_ch)/h$，$q_c=2$ 时为 $6.35\times10^{5}$，占峰值 8.5%；$q_c=3$ 时为 $6.41\times10^{3}$，占 0.086%。

判定阈值：截断处梯度跳变应低于峰值梯度的 1%。据此 $q_c\ge2.6$ 即可，工程上取 $q_c=3.0$ 留余量。若实测力场在 $r_c$ 附近出现"壳层状"的规则噪声（粒子恰好排布在截断球面上），说明 $q_c$ 过小，应直接加大而不是调人工黏性。

## 邻域网格与 Verlet 缓冲的联动设置

链表格元必须覆盖最大支持半径：

$$L_{cell}\ge r_{c,\max}=q_{c}h_{\max}$$

取 $h_{\max}=20\ \text{mm}$、$q_c=3.0$，则 $L_{cell}\ge60\ \text{mm}$，搜索需检查 $3^{3}=27$ 个格元。若沿用紧支撑核时代的 $L_{cell}=40\ \text{mm}$（按 $\kappa h_{\max}$ 设的），$r_c=60\ \text{mm}$ 已超出一圈，必须搜 $5^{3}=125$ 个格元，遍历成本升 4.6 倍且极易漏邻居。**换核后必须重设格元**，这是 Gaussian 迁移中最常被漏掉的一步。

Verlet 缓冲半径取 $r_{skin}=1.2r_c=72\ \text{mm}$，重建阈值 $\frac{1}{2}(r_{skin}-r_c)=6\ \text{mm}$。以最大流速 $2\ \text{m/s}$、$\Delta t=2.0\times10^{-6}\ \text{s}$ 计，每步位移 $4.0\ \mu\text{m}$，可连续约 1500 步不重建；若实测每 50 步就重建，说明 $r_{skin}$ 取得太保守。

## 核参数化的两种写法与归一化常数

统一写成缩放律形式：

$$W_{ij}=\frac{\sigma_d}{h^{d}}\,w(q),\qquad q=\frac{r_{ij}}{h}$$

Gaussian 核取 $w(q)=e^{-q^{2}}$，归一化常数 $\sigma_d=\pi^{-d/2}$，即一维 $0.5642$、二维 $0.3183$、三维 $0.1796$。写成展开形式就是 $W=\left(h\sqrt{\pi}\right)^{-d}e^{-q^{2}}$，两种写法等价，但**缩放律写法便于与紧支撑核共用一套代码**——只换 $w(q)$ 与 $\sigma_d$ 即可。

对照三次样条核的 $\sigma_d$：一维 $2/3=0.6667$、二维 $10/(7\pi)=0.4547$、三维 $1/\pi=0.3183$。注意三维三次样条的 $\sigma_d$ 恰好等于二维 Gaussian 的 $\sigma_d=1/\pi$，这是纯粹的数值巧合，混用会让归一化错 1 倍以上。配置时把 $d$ 与 $\sigma_d$ 绑定校验，比事后查错省事。

## 截断半径 q_c 的成本-精度权衡

截断半径 $r_c=q_ch$。邻居数随 $q_c$ 三次增长：

$$N_{d}=\frac{2^{d}\pi^{d/2}}{\Gamma\!\left(\frac{d}{2}+1\right)}\left(\eta q_{c}\right)^{d}$$

三维取 $\eta=h/\Delta p=1.2$，则 $N_3=\frac{4}{3}\pi(1.2q_c)^{3}=18.10\,q_{c}^{3}$。三档结果：$q_c=2.0$ 得 $N=58$（截断丢 4.6% 质量）、$q_c=2.5$ 得 $N=113$（丢 0.13%）、$q_c=3.0$ 得 $N=195$（丢 0.044%）、$q_c=3.2$ 得 $N=237$（丢 0.014%）。

成本随 $q_c^3$ 涨，收益却是 $\mathrm{erfc}$ 型快速饱和。工程推荐 $q_c=2.5\sim3.0$：$q_c$ 从 2.0 提到 2.5，成本涨 1.95 倍而尾部损失从 4.6% 降到 0.13%（改善 35 倍）；再从 2.5 提到 3.0，成本再涨 1.73 倍而损失只从 0.13% 降到 0.044%（改善 3 倍），边际收益已明显递减。

同时要对照紧支撑核：同取 $\eta=1.2$，Wendland C2（$\kappa=2$）的 $N_3=58$，仅相当于 Gaussian $q_c=2.0$ 的成本。若算例对尾部精度要求不高于 0.5%，**换 Wendland 比加大 $q_c$ 更划算**。

## 归一化策略与替代方案

截断后离散归一化 $\sum_jV_jW_{ij}$ 不再等于 1，三种处理方式各有代价：

- **不修正**：只在 $q_c\ge3$、内部区使用，边界区误差大；实现最简单。
- **Shepard 重规化** $W_{ij}\leftarrow W_{ij}/S_i$：恢复零阶一致性，但破坏成对力反对称，长时间积分出现动量漂移。
- **归一化梯度形式** $\nabla W_{ij}\leftarrow(\nabla W_{ij}-\beta_iW_{ij})/S_i$，$\beta_i=\sum_jV_j\nabla_iW_{ij}$：兼顾一致性与动量守恒，推荐用于有自由面的算例。

若算例允许更换核族，直接换 Wendland C2/C4 可以绕开整个截断问题，且 $\kappa=2$ 的邻居数只有 Gaussian $q_c=3$ 的 30%。

```yaml
# Gaussian 核配置片段（含一致性校验）
kernel:
  family: gaussian
  dim: 3
  sigma_d: 0.17959          # = pi^(-3/2)，须与 dim 绑定校验
  w_form: exp(-q^2)
  q_c: 3.0                  # rc = 3.0 * h，尾部质量 4.4e-4
  eta: 1.2                  # h = eta * (m/rho)^(1/3)
normalization:
  mode: normalized_gradient # none | shepard | normalized_gradient
neighbor_search:
  type: linked_list
  cell_size: 0.060          # >= q_c * h_max = 3.0 * 0.020
  cells_per_query: 27       # 3^3
  verlet_skin: 0.072        # 1.2 * rc
  rebuild_displacement: 0.006
expected:
  neighbors_3d: 195         # 18.10 * q_c^3
  tail_mass: 4.4e-4
```

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 归一化整体偏 1 倍以上 | 误用三维样条 $\sigma_d=1/\pi$ 作 Gaussian 常数 | 校验 $\sigma_d=\pi^{-d/2}$ 与维度绑定 |
| 每步耗时突然涨 4 倍 | 格元仍是 40 mm，未按 $r_c=60$ mm 更新 | 把 `cell_size` 改 60 mm，看耗时是否回落 |
| 出现漏邻居、密度偏低 | $L_{cell}<q_ch_{\max}$ | 统计实际邻居数与 195 对照 |
| Verlet 表重建过频 | `verlet_skin` 沿用紧支撑核的取值 | 比较实测重建间隔与 1500 步 |
| 自由面附近动量漂移 | 用了 Shepard 重规化 | 切到 `normalized_gradient` 复测总动量 |
| $q_c$ 提到 3.2 但精度无改善 | 误差已由 $\eta$ 或时间步主导 | 固定 $q_c$ 扫 $\eta=1.1/1.2/1.3$ |
| 结果与 Wendland 版差 20% | 等效邻居数不同 | 固定 $N=58$ 再对比两核 |
| 内部区 $S_i$ 系统性偏低到 0.95 | $q_c=2$，尾部质量丢 4.6% | 按 $E_3(q_c)$ 手算并与实测 $S_i$ 对照 |
| 力场出现壳层状规则噪声 | 截断处梯度跳变过大 | 算 jump/peak，要求低于 1%（$q_c\ge2.6$） |
| 粒子在 $r_c$ 球面上聚集成壳 | 截断核吸引效应 | 加大 $q_c$ 到 3.0 后重跑 |
| 动量持续漂移 | Shepard 重规化破坏了反对称性 | 换用归一化梯度形式并复测总动量 |
| 每步耗时是紧支撑核的 3 倍以上 | $N_3=195$ 对 58 | 对比 $\frac{4}{3}\pi(\eta q_c)^3$ 与 $(\eta\kappa)^3$ |
| 换核后结果差 20% 以上 | $q_c$ 或 $\eta$ 不一致 | 固定 $\eta$ 与等效邻居数再比 |
| 边界附近结果对 $q_c$ 异常敏感 | 几何截断叠加尾部损失 | 分别统计内部、壁面、自由面的 $S_i$ |

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

## Gaussian 核的归一化与截断质量损失

$d$ 维 Gaussian 核写作

$$W(r,h)=\frac{1}{\left(h\sqrt{\pi}\right)^{d}}\exp\!\left(-\frac{r^{2}}{h^{2}}\right)$$

它在全空间的积分恰为 1，因此没有"归一化常数需要推导"的问题，只有"截掉多少"的问题。三维下 $r_c=q_ch$ 之外的剩余质量占比为

$$E_{3}(q_{c})=\mathrm{erfc}(q_{c})+\frac{2q_{c}}{\sqrt{\pi}}e^{-q_{c}^{2}}$$

代入三档：$q_c=2$ 时 $\mathrm{erfc}(2)=4.678\times10^{-3}$，第二项 $2\times2/1.7725\times e^{-4}=2.257\times0.01832=4.133\times10^{-2}$，合计 $4.60\times10^{-2}$，即损失 4.60%；$q_c=3$ 时 $\mathrm{erfc}(3)=2.209\times10^{-5}$，第二项 $3.385\times1.234\times10^{-4}=4.177\times10^{-4}$，合计 $4.40\times10^{-4}$，损失 0.044%；$q_c=4$ 时合计 $5.23\times10^{-7}$，损失 $5.2\times10^{-5}\%$。**这就是选择 $q_c$ 的第一条硬依据**：要论证 0.1% 量级的物理差异，$q_c$ 至少取 3；取 2 相当于一开始就丢了 4.6% 的质量。

## 参考资料

1. Gingold R.A., Monaghan J.J., "Smoothed particle hydrodynamics: theory and application to non-spherical stars," *Monthly Notices of the Royal Astronomical Society*, 181, 1977.
2. Monaghan J.J., "Smoothed Particle Hydrodynamics," *Annual Review of Astronomy and Astrophysics*, 30, 1992.
3. Liu M.B., Liu G.R., "Smoothed Particle Hydrodynamics: An Overview and Recent Developments," *Archives of Computational Methods in Engineering*, 17, 2010.
4. Wendland H., "Piecewise polynomial, positive definite and compactly supported radial functions of minimal degree," *Advances in Computational Mathematics*, 4, 1995.
5. Domínguez J.M., Crespo A.J.C., Gómez-Gesteira M., "Optimization strategies for CPU and GPU implementations of a smoothed particle hydrodynamics method," *Computer Physics Communications*, 184, 2013.
6. Violeau D., Rogers B.D., "Smoothed particle hydrodynamics (SPH) for free-surface flows: past, present and future," *Journal of Hydraulic Research*, 54(1), 2016.
7. Dehnen W., Aly H., "Improving convergence in smoothed particle hydrodynamics simulations without pairing instability," *Monthly Notices of the Royal Astronomical Society*, 425, 2012.
8. Colagrossi A., Landrini M., "Numerical simulation of interfacial flows by smoothed particle hydrodynamics," *Journal of Computational Physics*, 191, 2003.
