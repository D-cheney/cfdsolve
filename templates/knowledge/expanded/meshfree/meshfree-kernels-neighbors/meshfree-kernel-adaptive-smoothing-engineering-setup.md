---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-kernel-adaptive-smoothing-engineering-setup
title: "自适应平滑长度：工程设置与参数选择"
summary: "把变平滑长度 SPH 算例拆成平滑长度比、h 限幅与变化率、邻域网格单元尺寸、时间步四组参数，给出由目标邻居数反算 η、由 h_max 定格元与 Verlet 重建的配置方法。"
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
  - "自适应平滑长度"
  - "工程设置与参数选择"
  - "邻居数"
  - "Verlet 邻居表"
seo:
  title: "自适应平滑长度：工程设置与参数选择"
  description: "把变平滑长度 SPH 算例拆成平滑长度比、h 限幅与变化率、邻域网格单元尺寸、时间步四组参数，给出由目标邻居数反算 η、由 h_max 定格元与 Verlet 重建的配置方法。"
  keywords:
    - "自适应平滑长度"
    - "工程设置与参数选择"
    - "邻居数"
    - "Verlet 邻居表"
    - "链表搜索"
---

# 自适应平滑长度：工程设置与参数选择

自适应平滑长度的配置有四个旋钮：平滑长度比 $\eta$、$h$ 的上下限与单步变化率、邻域网格的单元尺寸、以及时间步。四者互相牵制——放宽 $h$ 上限会放大格元与搜索成本，收紧 $h$ 下限会压小时间步。本文给出每一组的取值依据和一套可直接落盘的配置，适用于密度跨度大（射流、溃坝、冲击）的 SPH 算例。

## 从目标邻居数反推平滑长度比

自适应规则取

$$h_i=\eta\left(\frac{m_i}{\rho_i}\right)^{1/d}$$

$\eta$ 由目标邻居数反解，而不是凭经验给。三维内部粒子的邻居数估计为

$$N_{3}=\frac{4}{3}\pi\left(\eta\kappa\right)^{3}\;\Longrightarrow\;\eta=\frac{1}{\kappa}\left(\frac{3N}{4\pi}\right)^{1/3}$$

目标 $N=58$、支持半径倍数 $\kappa=r_c/h=2$，则 $\eta=\frac{1}{2}\left(\frac{3\times58}{4\pi}\right)^{1/3}=\frac{1}{2}\times2.401=1.20$。二维同样目标区间（$N\approx18$）时 $\eta=\frac{1}{\kappa}\sqrt{N/\pi}=1.20$，数值巧合但结论不同：跨维度迁移必须重新推导，不能直接照抄 1.2。

反算一次具体尺度：水 $\rho=1000\ \text{kg/m}^3$、$\Delta p=10\ \text{mm}$ 时 $m=1.0\times10^{-3}\ \text{kg}$，$h=1.2\times(1.0\times10^{-6})^{1/3}=12\ \text{mm}$，$r_c=\kappa h=24\ \text{mm}$。若目标是把邻居数从 58 提到 100 以压低压力噪声，则 $\eta$ 需增到 $1.20\times(100/58)^{1/3}=1.20\times1.199=1.44$，代价是邻居数增加 72%、每步成本近似同比例上升。

## h 的限幅、变化率与平滑

无限制的自适应会在自由面把 $h$ 拉得过大（该处 $\rho$ 被人为低估），必须设上下限：$h_{\min}=4\ \text{mm}$、$h_{\max}=20\ \text{mm}$，跨度比 5。$h_{\max}$ 的选取准则是"不超过最小特征尺度的 1/3"，例如射流直径 60 mm，则 $h_{\max}\le20\ \text{mm}$，否则会把射流抹平。

单步变化率也要限：

$$\frac{\left|h_i^{n+1}-h_i^{n}\right|}{h_i^{n}}\le0.05$$

超过 5% 的跳变会把 $h$ 的高频噪声直接注入压力项。若某区域连续多步触到该限制，说明 $\Delta t$ 太大或密度估计本身在振荡，应先查密度求和而不是继续放宽限制。

此外建议对 $h$ 场做一次核加权平滑：

$$h_i\leftarrow h_i+\epsilon\left(\bar{h}_i-h_i\right),\qquad \bar{h}_i=\frac{\sum_jV_jh_jW_{ij}}{\sum_jV_jW_{ij}}$$

取 $\epsilon=0.1$。这一步只降噪，不改变量纲，但必须放在对称化 $h_{ij}=(h_i+h_j)/2$ 之前，否则会把平滑引入的不对称带进力项。

## 邻域网格单元尺寸与 Verlet 表

链表搜索的格元边长必须覆盖最大支持半径：

$$L_{cell}\ge\kappa h_{\max}=2\times20\ \text{mm}=40\ \text{mm}$$

格元太小会漏邻居，太大则每格粒子过多、遍历变慢。取 $L_{cell}=40\ \text{mm}$ 时，搜索只需检查自身与相邻共 $3^{3}=27$ 个格元。若误取 $L_{cell}=h_{\max}=20\ \text{mm}$，$r_c=24\ \text{mm}$ 超出格元，必须搜到第二圈即 $5^{3}=125$ 个格元，遍历成本升 4.6 倍，且极易漏掉对角方向的邻居。

Verlet 表的缓冲半径取 $r_{skin}=1.2r_c=28.8\ \text{mm}$。重建判据是"任一位移超过 $\frac{1}{2}(r_{skin}-r_c)=2.4\ \text{mm}$"，按 $\Delta t=2\ \mu\text{s}$、最大流速 $2\ \text{m/s}$ 计，每步位移 $4\ \mu\text{m}$，可连续 600 步不重建。重建频率过低会漏邻居，过高则白费开销——把实际重建间隔与 600 步对比，偏差一个量级说明阈值设错。

## 时间步与多分辨率时间步

自适应 $h$ 下时间步必须按全局最小 $h$ 取：

$$\Delta t\le0.25\,\frac{h_{\min}}{c_{s}}$$

水声速 $c_s=1500\ \text{m/s}$、$h_{\min}=4\ \text{mm}$，则 $\Delta t\le0.25\times0.004/1500=6.7\times10^{-7}\ \text{s}$，即 0.67 μs。若忽略 $h_{\min}$ 而按平均 $h=12\ \text{mm}$ 取到 2 μs，压缩区会直接失稳。这也是自适应 SPH 的主要成本来源：$h_{\min}$ 由几何决定，不由 $\eta$ 决定，所以在建算例时就要明确最细尺度。

```yaml
# adaptive_h 配置片段
kernel:
  family: cubic_spline      # sigma_d: 1D=2/3, 2D=10/(7*pi), 3D=1/pi
  dim: 3
  kappa: 2.0                # rc = kappa * h
  sigma_d: 0.31831          # = 1/pi
smoothing_length:
  adaptive: true
  eta: 1.2                  # N3D ~= 58
  h_min: 0.004              # m
  h_max: 0.020              # m
  max_rel_change_per_step: 0.05
  smooth_epsilon: 0.1
  symmetrize: arithmetic    # h_ij = (h_i + h_j)/2
  grad_h_correction: true   # Omega_i
neighbor_search:
  type: linked_list
  cell_size: 0.040          # >= kappa * h_max
  verlet_skin: 0.0288       # 1.2 * rc
  rebuild_displacement: 0.0024
time_step:
  dt_max: 6.7e-7            # s, 0.25 * h_min / c_s
  c_s: 1500.0
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 自由面附近被过度抹平 | $h_{\max}$ 未限幅 | 打印 $h$ 分布，检查是否顶到 $h_{\max}$ |
| 压力场出现网格尺度噪声 | 单步 $h$ 变化率未限制 | 统计 $\Delta h/h$ 分布，应低于 0.05 |
| 出现漏邻居、密度偏低 | $L_{cell}<\kappa h_{\max}$ | 把格元从 20 mm 改 40 mm，看邻居数是否回升 |
| Verlet 表每步都重建 | 缓冲半径或阈值过小 | 比较实测重建间隔与 600 步 |
| 压缩区直接失稳 | $\Delta t$ 按平均 $h$ 而非 $h_{\min}$ | 按 $\Delta t\le0.25h_{\min}/c_s$ 重算 |
| 邻居数随密度漂移 | $\eta$ 与 $\kappa$ 设错 | 反算 $\eta=(3N/4\pi)^{1/3}/\kappa$ 并与实测 $N$ 对照 |
| 力出现方向性偏差 | $h$ 平滑在对称化之后执行 | 调整顺序：先平滑再对称化 |

## 参考文献

1. Monaghan J.J., "Smoothed Particle Hydrodynamics," *Annual Review of Astronomy and Astrophysics*, 30, 1992.
2. Price D.J., Monaghan J.J., "An energy-conserving formalism for adaptive gravitational force softening in smoothed particle hydrodynamics and N-body codes," *Monthly Notices of the Royal Astronomical Society*, 374, 2007.
3. Springel V., Hernquist L., "Cosmological smoothed particle hydrodynamics simulations: the entropy equation," *Monthly Notices of the Royal Astronomical Society*, 333, 2002.
4. Dehnen W., Aly H., "Improving convergence in smoothed particle hydrodynamics simulations without pairing instability," *Monthly Notices of the Royal Astronomical Society*, 425, 2012.
5. Domínguez J.M., Crespo A.J.C., Gómez-Gesteira M., "Optimization strategies for CPU and GPU implementations of a smoothed particle hydrodynamics method," *Computer Physics Communications*, 184, 2013.
6. Liu M.B., Liu G.R., "Smoothed Particle Hydrodynamics: An Overview and Recent Developments," *Archives of Computational Methods in Engineering*, 17, 2010.
