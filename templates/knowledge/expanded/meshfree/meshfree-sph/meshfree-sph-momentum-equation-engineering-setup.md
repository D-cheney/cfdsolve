---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-momentum-equation-engineering-setup
title: "动量方程离散：工程设置与参数选择"
summary: "给出压力项形式与密度比的匹配规则、Adami 壁面压力与镜像粒子的落地参数、KDK 积分与邻居表重建阈值，以及声学-加速度-黏性三项时间步的分解计算。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "动量方程离散"
  - "工程设置与参数选择"
  - "Adami 壁面边界"
  - "KDK 积分"
seo:
  title: "动量方程离散：工程设置与参数选择"
  description: "给出压力项形式与密度比的匹配规则、Adami 壁面压力与镜像粒子的落地参数、KDK 积分与邻居表重建阈值，以及声学-加速度-黏性三项时间步的分解计算。"
  keywords:
    - "动量方程离散"
    - "工程设置与参数选择"
    - "Adami 壁面边界"
    - "KDK 积分"
    - "邻居表重建"
---

# 动量方程离散：工程设置与参数选择

动量方程的落地设置只有四件事会真正改变结果：压力项取哪种成对形式、壁面如何贡献动量、时间积分用哪种格式、邻居表多久重建一次。其余参数（平滑长度、时间步）已在密度篇讨论，这里只处理动量项特有的选择，并给出可直接填写的配置。

## 压力项形式按密度比选择

单相水动力问题（密度比 $1{:}1$）用 Monaghan 形式 $\left(p_i/\rho_i^2+p_j/\rho_j^2\right)$，它对线性动量严格守恒且对冲击鲁棒。存在气液界面、密度比达到 $1000{:}1$ 时改用 Colagrossi 形式 $\left(p_i+p_j\right)/(\rho_i\rho_j)$，因为界面处 $p_i\approx p_j$ 时该式自动给出对称受力。判据是界面两侧密度比：低于 $10$ 用前者，高于 $10$ 用后者。这一条不随分辨率改变，应在建模阶段一次定好。

## 壁面边界的动量贡献

固定壁粒子需要给出压力才能产生正确斥力，Adami 等提出的壁面压力为

$$
p_w=\frac{\sum_j p_j W_{wj}+\left(\mathbf{g}-\mathbf{a}_w\right)\cdot\sum_j \rho_j\,\mathbf{x}_{wj}W_{wj}}{\sum_j W_{wj}}
$$

其中 $\mathbf{a}_w$ 是壁面加速度（静止壁为 $0$）。对 $\rho_0=998.2\ \mathrm{kg/m^3}$、$g=9.81\ \mathrm{m/s^2}$、水深 $0.4\ \mathrm{m}$ 的静水柱，底部壁粒子应给出 $p_w\approx3917\ \mathrm{Pa}$，与解析静水压一致。壁粒子层数必须覆盖支持半径 $r_c=2h$：$h=0.012\ \mathrm{m}$ 时至少 $3$ 层、层厚 $0.010\ \mathrm{m}$，否则近壁粒子一侧缺邻居会出现贴壁飞散。镜像粒子是等效替代，代价是每步多一次反射映射。

## 时间积分格式与守恒性

显式积分推荐 kick-drift-kick（KDK）辛格式，它比前向欧拉在同等 $\Delta t$ 下能量漂移小一个量级：

```
# kick-drift-kick
v += 0.5 * dt * a(x)          # kick
x += dt * v                    # drift
a_new = compute_accel(x)       # 重算加速度（含压力、黏性、壁面）
v += 0.5 * dt * a_new          # kick
t += dt
```

速度 Verlet 与 KDK 等价但需保存上一时刻加速度。欧拉格式在自由表面算例中会引入系统性能量增长，不建议用于超过 $10^4$ 步的模拟。

## 邻居表与重建阈值

每步全量搜索邻居代价过高，实践中用 Verlet 表：搜索半径 $r_c+\text{skin}$，$\text{skin}=0.25h=0.003\ \mathrm{m}$，当任意粒子位移累计超过 $\text{skin}/2=0.0015\ \mathrm{m}$ 时重建。以 $\Delta t=9.0\times10^{-5}\ \mathrm{s}$、典型速度 $2.80\ \mathrm{m/s}$ 计，单步位移 $2.5\times10^{-4}\ \mathrm{m}$，约每 $6$ 步重建一次。重建过频则开销大，过疏则漏邻居导致密度与压力跳变。

## 时间步的三项分解

动量方程的显式时间步同时受三个尺度约束：

$$
\Delta t\le\min\left(0.25\frac{h}{c_s+u_{\max}},\ 0.25\sqrt{\frac{h}{a_{\max}}},\ 0.125\frac{h^2}{\nu}\right)
$$

对 $h=0.012\ \mathrm{m}$、$c_s=30\ \mathrm{m/s}$、$u_{\max}=2.80\ \mathrm{m/s}$，声学项给出 $9.15\times10^{-5}\ \mathrm{s}$；重力主导时 $a_{\max}=9.81\ \mathrm{m/s^2}$，加速度项给出 $0.25\sqrt{0.012/9.81}=8.74\times10^{-3}\ \mathrm{s}$；取水 $\nu=1.004\times10^{-6}\ \mathrm{m^2/s}$，黏性项给出 $0.125\times1.44\times10^{-4}/1.004\times10^{-6}=17.9\ \mathrm{s}$。三项中声学项主导，因此 $\Delta t$ 主要由 $c_s$ 决定，盲目减小 $\Delta t$ 只会在声学项已满足时浪费算力。

## 配置清单

| 设置项 | 基线取值 | 依据 |
|---|---|---|
| 压力项形式 | Monaghan | 单相水，密度比 $1{:}1$ |
| 壁面处理 | Adami 固定壁粒子 | 底部 $p_w=3917\ \mathrm{Pa}$ |
| 壁粒子层数 | $3$ 层，层厚 $0.010\ \mathrm{m}$ | 覆盖 $r_c=0.024\ \mathrm{m}$ |
| 积分格式 | KDK | 能量漂移比欧拉小一个量级 |
| 邻居表 skin | $0.003\ \mathrm{m}$ | $0.25h$ |
| 重建阈值 | $0.0015\ \mathrm{m}$ | $\text{skin}/2$，约每 $6$ 步 |
| 时间步 $\Delta t$ | $9.0\times10^{-5}\ \mathrm{s}$ | 声学 CFL 主导 |

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 近壁粒子贴壁飞散 | 壁粒子层数不足，覆盖不到 $r_c$ | 统计近壁粒子邻居数，检查是否显著低于内部 |
| 壁面压力偏离 $3917\ \mathrm{Pa}$ | Adami 式漏掉 $\mathbf{g}\cdot\sum\rho_j\mathbf{x}_{wj}$ 项 | 关掉压力项只留重力，看壁面压力是否为静水值 |
| 长跑能量单调上升 | 用欧拉格式积分 | 换 KDK 复跑，比较 $10^4$ 步后总能量漂移 |
| 密度与压力周期性跳变 | 邻居表重建过疏 | 把重建阈值从 $0.0015$ 减到 $0.00075\ \mathrm{m}$ 观察 |
| 减小 $\Delta t$ 无改善 | 声学项早已满足，误差来自空间离散 | 分解三项时间步，确认主导项是否为声学 |

## 参考

1. Adami S., Hu X.Y., Adams N.A., *A generalized wall boundary condition for smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 231, 2012.
2. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
3. Crespo A.J.C., Domínguez J.M., Rogers B.D. et al., *DualSPHysics: Open-source parallel CFD solver based on SPH*, Computer Physics Communications, Vol. 187, 2015.
4. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
5. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Morris J.P., Fox P.J., Zhu Y., *Modeling low Reynolds number incompressible flows using SPH*, Journal of Computational Physics, Vol. 136, 1997.
