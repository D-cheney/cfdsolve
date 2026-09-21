---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-kernel-gaussian-engineering-setup
title: "Gaussian 核与截断：工程设置与参数选择"
summary: "给出 Gaussian 核的落地配置：σ_d=π^{-d/2} 归一化、q_c 与邻居数成本权衡、链表格元与 Verlet 缓冲联动、以及 Shepard 重规化与换用 Wendland 核的选择依据。"
category:
  slug: meshfree-kernels-neighbors
  name: "无网格法核函数与邻域搜索"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法核函数与邻域搜索"
  - "Gaussian 核与截断"
  - "工程设置与参数选择"
  - "归一化常数"
  - "链表搜索"
seo:
  title: "Gaussian 核与截断：工程设置与参数选择"
  description: "给出 Gaussian 核的落地配置：σ_d=π^{-d/2} 归一化、q_c 与邻居数成本权衡、链表格元与 Verlet 缓冲联动、以及 Shepard 重规化与换用 Wendland 核的选择依据。"
  keywords:
    - "Gaussian 核与截断"
    - "工程设置与参数选择"
    - "归一化常数"
    - "链表搜索"
    - "Shepard 重规化"
---

# Gaussian 核与截断：工程设置与参数选择

用 Gaussian 核的工程决策其实只有三个：截断半径取几倍 $h$、归一化怎么处理、以及值不值得为它付更高的邻居搜索成本。这三个问题都可以先用公式算出数字再决定，不必先跑一遍再看。本文给出归一化常数的写法、$q_c$ 与邻居数的换算、链表格元与 Verlet 缓冲的联动取值，以及在什么条件下应直接换用 Wendland 核。

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

## 邻域网格与 Verlet 缓冲的联动设置

链表格元必须覆盖最大支持半径：

$$L_{cell}\ge r_{c,\max}=q_{c}h_{\max}$$

取 $h_{\max}=20\ \text{mm}$、$q_c=3.0$，则 $L_{cell}\ge60\ \text{mm}$，搜索需检查 $3^{3}=27$ 个格元。若沿用紧支撑核时代的 $L_{cell}=40\ \text{mm}$（按 $\kappa h_{\max}$ 设的），$r_c=60\ \text{mm}$ 已超出一圈，必须搜 $5^{3}=125$ 个格元，遍历成本升 4.6 倍且极易漏邻居。**换核后必须重设格元**，这是 Gaussian 迁移中最常被漏掉的一步。

Verlet 缓冲半径取 $r_{skin}=1.2r_c=72\ \text{mm}$，重建阈值 $\frac{1}{2}(r_{skin}-r_c)=6\ \text{mm}$。以最大流速 $2\ \text{m/s}$、$\Delta t=2.0\times10^{-6}\ \text{s}$ 计，每步位移 $4.0\ \mu\text{m}$，可连续约 1500 步不重建；若实测每 50 步就重建，说明 $r_{skin}$ 取得太保守。

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

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 归一化整体偏 1 倍以上 | 误用三维样条 $\sigma_d=1/\pi$ 作 Gaussian 常数 | 校验 $\sigma_d=\pi^{-d/2}$ 与维度绑定 |
| 每步耗时突然涨 4 倍 | 格元仍是 40 mm，未按 $r_c=60$ mm 更新 | 把 `cell_size` 改 60 mm，看耗时是否回落 |
| 出现漏邻居、密度偏低 | $L_{cell}<q_ch_{\max}$ | 统计实际邻居数与 195 对照 |
| Verlet 表重建过频 | `verlet_skin` 沿用紧支撑核的取值 | 比较实测重建间隔与 1500 步 |
| 自由面附近动量漂移 | 用了 Shepard 重规化 | 切到 `normalized_gradient` 复测总动量 |
| $q_c$ 提到 3.2 但精度无改善 | 误差已由 $\eta$ 或时间步主导 | 固定 $q_c$ 扫 $\eta=1.1/1.2/1.3$ |
| 结果与 Wendland 版差 20% | 等效邻居数不同 | 固定 $N=58$ 再对比两核 |

## 参考文献

1. Gingold R.A., Monaghan J.J., "Smoothed particle hydrodynamics: theory and application to non-spherical stars," *Monthly Notices of the Royal Astronomical Society*, 181, 1977.
2. Monaghan J.J., "Smoothed Particle Hydrodynamics," *Annual Review of Astronomy and Astrophysics*, 30, 1992.
3. Liu M.B., Liu G.R., "Smoothed Particle Hydrodynamics: An Overview and Recent Developments," *Archives of Computational Methods in Engineering*, 17, 2010.
4. Wendland H., "Piecewise polynomial, positive definite and compactly supported radial functions of minimal degree," *Advances in Computational Mathematics*, 4, 1995.
5. Domínguez J.M., Crespo A.J.C., Gómez-Gesteira M., "Optimization strategies for CPU and GPU implementations of a smoothed particle hydrodynamics method," *Computer Physics Communications*, 184, 2013.
6. Violeau D., Rogers B.D., "Smoothed particle hydrodynamics (SPH) for free-surface flows: past, present and future," *Journal of Hydraulic Research*, 54(1), 2016.
