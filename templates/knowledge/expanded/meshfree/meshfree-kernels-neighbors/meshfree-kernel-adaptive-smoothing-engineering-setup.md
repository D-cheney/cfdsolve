---
template_version: flowlab-knowledge/1.0
slug: meshfree-kernel-adaptive-smoothing-engineering-setup
title: 自适应平滑长度：工程设置与诊断验证
summary: >-
  把变平滑长度 SPH 算例拆成平滑长度比、h 限幅与变化率、邻域网格单元尺寸、时间步四组参数，给出由目标邻居数反算 η、由 h_max 定格元与
  Verlet 重建的配置方法。
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
  - 自适应平滑长度
  - 工程设置与参数选择
  - 邻居数
  - Verlet 邻居表
  - 结果诊断与可信度验证
  - grad-h 修正
  - 动量守恒
seo:
  title: 自适应平滑长度：工程设置与诊断验证
  description: >-
    把变平滑长度 SPH 算例拆成平滑长度比、h 限幅与变化率、邻域网格单元尺寸、时间步四组参数，给出由目标邻居数反算 η、由 h_max 定格元与
    Verlet 重建的配置方法。
  keywords:
    - 自适应平滑长度
    - 工程设置与参数选择
    - 邻居数
    - Verlet 邻居表
    - 链表搜索
    - 结果诊断与可信度验证
    - grad-h 修正
    - 动量守恒
---
# 自适应平滑长度：工程设置与诊断验证

自适应平滑长度的配置有四个旋钮：平滑长度比 $\eta$、$h$ 的上下限与单步变化率、邻域网格的单元尺寸、以及时间步。四者互相牵制——放宽 $h$ 上限会放大格元与搜索成本，收紧 $h$ 下限会压小时间步。自适应平滑长度让每个粒子按自身密度取 $h_i$，从而在压缩区和膨胀区都保持大致恒定的邻居数。它的收益是分辨率自适应，代价是核不再距离对称、梯度多出一项 $\partial W/\partial h$ 的贡献。诊断这类结果时，最先看的不该是压力噪声，而是总动量是否漂移、$\Omega_i$ 修正是否被正确施加、以及邻居数分布是否真的被"拉平"。

## 工程设置与实施

### 邻域网格单元尺寸与 Verlet 表

链表搜索的格元边长必须覆盖最大支持半径：

$$L_{cell}\ge\kappa h_{\max}=2\times20\ \text{mm}=40\ \text{mm}$$

格元太小会漏邻居，太大则每格粒子过多、遍历变慢。取 $L_{cell}=40\ \text{mm}$ 时，搜索只需检查自身与相邻共 $3^{3}=27$ 个格元。若误取 $L_{cell}=h_{\max}=20\ \text{mm}$，$r_c=24\ \text{mm}$ 超出格元，必须搜到第二圈即 $5^{3}=125$ 个格元，遍历成本升 4.6 倍，且极易漏掉对角方向的邻居。

Verlet 表的缓冲半径取 $r_{skin}=1.2r_c=28.8\ \text{mm}$。重建判据是"任一位移超过 $\frac{1}{2}(r_{skin}-r_c)=2.4\ \text{mm}$"，按 $\Delta t=2\ \mu\text{s}$、最大流速 $2\ \text{m/s}$ 计，每步位移 $4\ \mu\text{m}$，可连续 600 步不重建。重建频率过低会漏邻居，过高则白费开销——把实际重建间隔与 600 步对比，偏差一个量级说明阈值设错。

### 从目标邻居数反推平滑长度比

自适应规则取

$$h_i=\eta\left(\frac{m_i}{\rho_i}\right)^{1/d}$$

$\eta$ 由目标邻居数反解，而不是凭经验给。三维内部粒子的邻居数估计为

$$N_{3}=\frac{4}{3}\pi\left(\eta\kappa\right)^{3}\;\Longrightarrow\;\eta=\frac{1}{\kappa}\left(\frac{3N}{4\pi}\right)^{1/3}$$

目标 $N=58$、支持半径倍数 $\kappa=r_c/h=2$，则 $\eta=\frac{1}{2}\left(\frac{3\times58}{4\pi}\right)^{1/3}=\frac{1}{2}\times2.401=1.20$。二维同样目标区间（$N\approx18$）时 $\eta=\frac{1}{\kappa}\sqrt{N/\pi}=1.20$，数值巧合但结论不同：跨维度迁移必须重新推导，不能直接照抄 1.2。

反算一次具体尺度：水 $\rho=1000\ \text{kg/m}^3$、$\Delta p=10\ \text{mm}$ 时 $m=1.0\times10^{-3}\ \text{kg}$，$h=1.2\times(1.0\times10^{-6})^{1/3}=12\ \text{mm}$，$r_c=\kappa h=24\ \text{mm}$。若目标是把邻居数从 58 提到 100 以压低压力噪声，则 $\eta$ 需增到 $1.20\times(100/58)^{1/3}=1.20\times1.199=1.44$，代价是邻居数增加 72%、每步成本近似同比例上升。

### h 的限幅、变化率与平滑

无限制的自适应会在自由面把 $h$ 拉得过大（该处 $\rho$ 被人为低估），必须设上下限：$h_{\min}=4\ \text{mm}$、$h_{\max}=20\ \text{mm}$，跨度比 5。$h_{\max}$ 的选取准则是"不超过最小特征尺度的 1/3"，例如射流直径 60 mm，则 $h_{\max}\le20\ \text{mm}$，否则会把射流抹平。

单步变化率也要限：

$$\frac{\left|h_i^{n+1}-h_i^{n}\right|}{h_i^{n}}\le0.05$$

超过 5% 的跳变会把 $h$ 的高频噪声直接注入压力项。若某区域连续多步触到该限制，说明 $\Delta t$ 太大或密度估计本身在振荡，应先查密度求和而不是继续放宽限制。

此外建议对 $h$ 场做一次核加权平滑：

$$h_i\leftarrow h_i+\epsilon\left(\bar{h}_i-h_i\right),\qquad \bar{h}_i=\frac{\sum_jV_jh_jW_{ij}}{\sum_jV_jW_{ij}}$$

取 $\epsilon=0.1$。这一步只降噪，不改变量纲，但必须放在对称化 $h_{ij}=(h_i+h_j)/2$ 之前，否则会把平滑引入的不对称带进力项。

### 时间步与多分辨率时间步

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

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 自由面附近被过度抹平 | $h_{\max}$ 未限幅 | 打印 $h$ 分布，检查是否顶到 $h_{\max}$ |
| 压力场出现网格尺度噪声 | 单步 $h$ 变化率未限制 | 统计 $\Delta h/h$ 分布，应低于 0.05 |
| 出现漏邻居、密度偏低 | $L_{cell}<\kappa h_{\max}$ | 把格元从 20 mm 改 40 mm，看邻居数是否回升 |
| Verlet 表每步都重建 | 缓冲半径或阈值过小 | 比较实测重建间隔与 600 步 |
| 压缩区直接失稳 | $\Delta t$ 按平均 $h$ 而非 $h_{\min}$ | 按 $\Delta t\le0.25h_{\min}/c_s$ 重算 |
| 邻居数随密度漂移 | $\eta$ 与 $\kappa$ 设错 | 反算 $\eta=(3N/4\pi)^{1/3}/\kappa$ 并与实测 $N$ 对照 |
| 力出现方向性偏差 | $h$ 平滑在对称化之后执行 | 调整顺序：先平滑再对称化 |
| 总动量单调漂移 | $h_{ij}$ 未对称化 | 改为算术平均重跑，看 $\Delta P$ 是否降到 $10^{-14}$ |
| 均匀区 $\Omega_i$ 偏离 1 超过 1% | 归一化常数或求和截断错误 | 静水测试下打印 $\Omega_i$ 分布 |
| 自由面附近加速度系统性偏差 | 漏掉 $\partial W/\partial h$ 项 | 开关 grad-h 修正做双跑对照 |
| 邻居数均值随密度漂移 | $h$ 与 $\rho$ 更新不同步 | 检查同一子步内更新顺序 |
| 压缩区邻居数翻倍到约 116 | 误用固定 $h=12\ \text{mm}$ | 统计 $N$ 分布，核对 $\eta$、$\kappa$ |
| 静水算例出现 $10^{-3}$ 量级速度 | 自适应引入人为速度 | 算 $t=1.0\ \text{s}$ 最大速度，应低于 $10^{-6}$ |
| 时间步随 $h$ 变化后失稳 | 用了局部 $h$ 而非全局最小 | 按 $\Delta t\le0.25h_{\min}/c_s$ 重算 |

### 邻居数统计作为分辨率诊断量

自适应 $h$ 的目的是保持邻居数恒定。内部粒子邻居数的解析估计为

$$N_{d}=\frac{2^{d}\pi^{d/2}}{\Gamma\!\left(\frac{d}{2}+1\right)}\left(\eta\kappa\right)^{d}$$

三维取平滑长度比 $\eta=h/\Delta p=1.2$、支持半径倍数 $\kappa=r_c/h=2$，则 $\eta\kappa=2.4$，$N_3=\frac{4}{3}\pi(2.4)^{3}=57.9\approx58$；二维 $N_2=\pi(2.4)^{2}=18.1$。这两个数就是诊断基线。

再看它如何随密度变化。水 $\rho=1000\ \text{kg/m}^3$、粒子间距 $\Delta p=10\ \text{mm}$，则 $m=\rho\Delta p^{3}=1000\times(0.01)^{3}=1.0\times10^{-3}\ \text{kg}$，$h=\eta(m/\rho)^{1/3}=1.2\times(1.0\times10^{-6})^{1/3}=1.2\times0.01=12\ \text{mm}$。若某区域密度翻倍到 $2000\ \text{kg/m}^3$，自适应 $h$ 变为 $12\times2^{-1/3}=12\times0.794=9.5\ \text{mm}$，邻居数仍约 58；**若误用固定 $h=12\ \text{mm}$，该区邻居数会翻到约 116**，同时时间步被拖慢、配对不稳定风险上升。判定试验：直接统计每步的邻居数最小/均值/最大值，自适应正确时均值应稳定在 58±10%，最大/最小比不超过 1.8。

## 验证、验收与复现

### 与恒定 h 基准和解析解对照

最可靠的验证是双跑对照：同一算例跑"自适应 $h$"与"全局恒定 $h$（取初始平均 $h$）"两版，比较宏观量。合格标准是：在密度变化小于 2 倍的算例中，两者对总动能、最大压力、界面位置的差异应小于 5%；若差异达 20% 以上，说明自适应部分引入了额外误差，需先查 $\Omega_i$ 与对称化，而不是直接调 $\eta$。

解析对照用静水压力测试：初始密度均匀、加恒定体积力，静止流体应保持静止。自适应实现中常见的失败是密度与 $h$ 的更新不同步——先更新 $\rho$ 再用旧 $h$，会引入一个与 $\Delta t$ 成正比的人为速度。判定量是 $t=1.0\ \text{s}$ 后的最大速度：应低于 $1.0\times10^{-6}\ \text{m/s}$；若达到 $10^{-3}\ \text{m/s}$，检查 $h$ 更新是否与密度在同一子步内完成。

时间步也要随 $h$ 一起核查：$\Delta t\le0.25\,h/c_s$。取水声速 $c_s=1500\ \text{m/s}$、$h=12\ \text{mm}$，则 $\Delta t\le0.25\times0.012/1500=2.0\times10^{-6}\ \text{s}$，即 2 μs；若某区域 $h$ 降到 9.5 mm，该区步长上限降到 1.6 μs。全局用统一时间步时，取全局最小 $h$ 计算，否则高速区会失稳。

```text
# 自适应 h + grad-h 修正的单步伪代码
h = eta * (m / rho)**(1.0/d)          # 密度反算 h, d=3
h_ij = 0.5*(h[i] + h[j])              # 对称化, 保证成对力反对称
W_ij = sigma_d / h_ij**d * w(r_ij/h_ij)
dW_dh = -sigma_d / h[i]**(d+1) * (d*w(q) + q*dw_dq(q))
Omega[i] = 1.0 - dh_drho * sum_j(V_j * dW_dh)   # 均匀区应精确为 1
grad_iW = dW_dr * r_hat + dW_dh * grad_h[i]
acc[i] += -m[j]*(P[i]/rho[i]**2 + P[j]/rho[j]**2) * grad_iW / Omega[i]
# 诊断输出
assert abs(total_momentum(t) - total_momentum(0)) < 1e-12
print(N_min, N_mean, N_max, Omega_min, Omega_max)
```

### 动量漂移：对称化缺失的指纹

SPH 的成对力反对称性依赖 $\nabla_iW_{ij}=-\nabla_jW_{ij}$。当 $h_i\neq h_j$ 时该等式不再自动成立，必须显式对称化：

$$W_{ij}=\frac{\sigma_d}{h_{ij}^{d}}\,w\!\left(\frac{r_{ij}}{h_{ij}}\right),\qquad h_{ij}=\frac{h_i+h_j}{2}$$

其中 $\sigma_d$ 是维度归一化常数：一维 $2/3$、二维 $10/(7\pi)$、三维 $1/\pi$（三次样条核）。诊断量是总动量的相对漂移

$$\Delta P=\frac{\left|\sum_i m_i\mathbf{v}_i(t)-\sum_i m_i\mathbf{v}_i(0)\right|}{\sum_i m_i\left|\mathbf{v}_i(0)\right|}$$

在无外力、封闭边界算例中，双精度下 $\Delta P$ 应保持在 $10^{-14}$ 量级（舍入误差累积）；若积分 5000 步后达到 $10^{-4}$ 甚至 $10^{-2}$，且呈单调增长而非随机游走，就是对称化缺失的指纹。判定试验：把 $h_{ij}$ 从算术平均改成 $h_i$ 单侧取值，$\Delta P$ 会立刻恶化若干个数量级，反证成立。

### grad-h 修正的必要性与可测量

对 $h_i$ 求导时，核的显式 $h$ 依赖不能漏：

$$W_{ij}=\frac{\sigma_d}{h_i^{d}}w(q),\quad q=\frac{r_{ij}}{h_i}\;\Longrightarrow\;\frac{\partial W_{ij}}{\partial h_i}=-\frac{\sigma_d}{h_i^{d+1}}\left[d\,w(q)+q\,w'(q)\right]$$

完整的梯度近似应写成

$$\nabla_i W_{ij}=\frac{\partial W_{ij}}{\partial r_{ij}}\hat{\mathbf{r}}_{ij}+\frac{\partial W_{ij}}{\partial h_i}\nabla_i h_i$$

把第二项吸收进一个修正因子后得到

$$\Omega_i=1-\frac{\partial h_i}{\partial\rho_i}\sum_j\frac{m_j}{\rho_j}\frac{\partial W_{ij}}{\partial h_i}$$

$\Omega_i$ 是可直接输出的诊断量。在密度均匀区，$\sum_j V_jW_{ij}\equiv1$ 与 $h$ 无关，故 $\sum_jV_j\partial W_{ij}/\partial h_i=0$，$\Omega_i$ 精确等于 1——这是最好的自检：若均匀区算出的 $\Omega_i$ 偏离 1 超过 1%，说明求和被截断或归一化常数用错。在密度梯度区（自由面、激波后），$\Omega_i$ 常见偏离 3%～8%；忽略该修正会系统性地高估或低估加速度，表现为自由面附近的"鼓包"不随网格加密收敛。

## 参考资料

1. Monaghan J.J., "Smoothed Particle Hydrodynamics," *Annual Review of Astronomy and Astrophysics*, 30, 1992.
2. Price D.J., Monaghan J.J., "An energy-conserving formalism for adaptive gravitational force softening in smoothed particle hydrodynamics and N-body codes," *Monthly Notices of the Royal Astronomical Society*, 374, 2007.
3. Springel V., Hernquist L., "Cosmological smoothed particle hydrodynamics simulations: the entropy equation," *Monthly Notices of the Royal Astronomical Society*, 333, 2002.
4. Dehnen W., Aly H., "Improving convergence in smoothed particle hydrodynamics simulations without pairing instability," *Monthly Notices of the Royal Astronomical Society*, 425, 2012.
5. Domínguez J.M., Crespo A.J.C., Gómez-Gesteira M., "Optimization strategies for CPU and GPU implementations of a smoothed particle hydrodynamics method," *Computer Physics Communications*, 184, 2013.
6. Liu M.B., Liu G.R., "Smoothed Particle Hydrodynamics: An Overview and Recent Developments," *Archives of Computational Methods in Engineering*, 17, 2010.
7. Hopkins P.F., "A new class of accurate, mesh-free hydrodynamic simulation methods," *Monthly Notices of the Royal Astronomical Society*, 450, 2015.
