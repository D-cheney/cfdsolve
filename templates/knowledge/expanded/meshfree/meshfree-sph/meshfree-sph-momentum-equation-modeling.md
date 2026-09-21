---
template_version: flowlab-knowledge/1.0
slug: meshfree-sph-momentum-equation-modeling
title: 动量方程离散：原理、设置与验证
summary: >-
  对比 Monaghan 与 Colagrossi
  两种成对对称压力项的守恒结构与密度比适用性，给出离散动量守恒的成对证明、变平滑长度破坏反对称的机理，以及负压区拉伸不稳定性的判据。
category:
  slug: meshfree-sph
  name: 无网格法 · SPH 理论与实现
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - 无网格法
  - 无网格法 · SPH 理论与实现
  - 动量方程离散
  - SPH 离散原理与适用边界
  - 成对对称压力项
  - 拉伸不稳定性
  - 工程设置与参数选择
  - Adami 壁面边界
  - KDK 积分
  - 结果诊断与可信度验证
  - 动量预算
seo:
  title: 动量方程离散：原理、设置与验证
  description: >-
    对比 Monaghan 与 Colagrossi
    两种成对对称压力项的守恒结构与密度比适用性，给出离散动量守恒的成对证明、变平滑长度破坏反对称的机理，以及负压区拉伸不稳定性的判据。
  keywords:
    - 动量方程离散
    - SPH 离散原理与适用边界
    - 成对对称压力项
    - 拉伸不稳定性
    - 核梯度反对称
    - 工程设置与参数选择
    - Adami 壁面边界
    - KDK 积分
    - 邻居表重建
    - 结果诊断与可信度验证
    - 动量预算
    - 壁面穿透
---
# 动量方程离散：原理、设置与验证

动量方程的离散形式决定了三件事：离散线性动量是否严格守恒、界面两侧压力是否连续、以及负压区是否出现粒子聚簇。核心约束是压力项必须写成成对反对称形式，而这一点又与核梯度反对称性、平滑长度是否逐粒子变化直接耦合。本文比较两种主流成对压力项，给出守恒的成对证明与适用边界。动量方程的落地设置只有四件事会真正改变结果：压力项取哪种成对形式、壁面如何贡献动量、时间积分用哪种格式、邻居表多久重建一次。其余参数（平滑长度、时间步）已在密度篇讨论，这里只处理动量项特有的选择，并给出可直接填写的配置。动量离散的误差不会停留在残差里，它会以净动量漂移、弹道偏离、壁面穿透和粒子聚簇四种形式外显。这四项互为独立证据：任何一项失败都说明离散动量不守恒或外力项有误，四项同时通过才足以支撑"动量离散正确"的结论。

## 离散动量守恒的成对证明

把内部压力力记作 $m_i\mathbf{a}_i^{\mathrm{int}}=-\sum_j m_i m_j A_{ij}\nabla_i W_{ij}$，其中 $A_{ij}=p_i/\rho_i^2+p_j/\rho_j^2$ 满足 $A_{ij}=A_{ji}$。对 $(i,j)$ 与 $(j,i)$ 两对求和：

$$
m_i m_j A_{ij}\nabla_i W_{ij}+m_j m_i A_{ji}\nabla_j W_{ij}=m_i m_j A_{ij}\left(\nabla_i W_{ij}+\nabla_j W_{ij}\right)=0
$$

最后一步用了核梯度反对称关系 $\nabla_j W_{ij}=-\nabla_i W_{ij}$，它只要求核是径向对称且两粒子用同一平滑长度。结论：只要每对粒子都按上式成对累加，$\sum_i m_i\mathbf{a}_i^{\mathrm{int}}=0$ 精确成立，净内力在浮点舍入内为零。

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

## 两种成对对称压力项的差别

Monaghan 形式的压力加速度为

$$
\frac{d\mathbf{v}_i}{dt}=-\sum_j m_j\left(\frac{p_i}{\rho_i^2}+\frac{p_j}{\rho_j^2}\right)\nabla_i W_{ij}+\mathbf{g}
$$

括号内两项在交换 $i,j$ 后完全不变，因此该形式对离散线性动量严格守恒，是单相弱可压缩 SPH 的默认选择。它在强冲击下能正确产生压力做功，但对密度比悬殊的界面会因 $\rho_i^2$ 与 $\rho_j^2$ 量级差过大而引入偏置。

Colagrossi 与 Morris 采用另一条等价路径：

$$
\frac{d\mathbf{v}_i}{dt}=-\sum_j m_j\frac{p_i+p_j}{\rho_i\rho_j}\nabla_i W_{ij}+\mathbf{g}
$$

在界面处 $p_i\approx p_j=p$，该式退化为 $-2p/(\rho_i\rho_j)\sum_j m_j\nabla_i W_{ij}$，两侧受力对称，压力连续性更容易保持。水-气这类密度比 $1000{:}1$ 的算例应优先选这一形式，代价是它对内部密度梯度更敏感。

## 变平滑长度如何破坏反对称

自适应分辨率会让 $h$ 随密度变化，此时 $W_{ij}$ 对 $i$ 与 $j$ 不再对称：$\nabla_i W(r,h_i)\neq-\nabla_j W(r,h_j)$。工程上常用对称化 $\tilde h_{ij}=(h_i+h_j)/2$ 并把核梯度写成 $\nabla_i W_{ij}(\tilde h_{ij})$，恢复反对称性。若直接在两侧各用自己的 $h$，动量漂移会随运行时间线性累积，表现为整体缓慢平移，且无法通过减小时间步消除。诊断信号是净动量 $\sum_i m_i\mathbf{v}_i$ 随时间的单调漂移。

## 负压区与拉伸不稳定性

当核求和出现拉伸状态时，粒子会自发聚集成对，形成网格状伪结构，即拉伸不稳定性。Monaghan 给出的实用判据是检查压力极值与核梯度求和项：若运行中出现 $\min_i p_i<0$ 且伴随 $\left|\sum_j \nabla_i W_{ij}\right|$ 增大，则已进入不稳定区。工程上有三条出路：提高 $c_s$ 使 $\rho_i/\rho_0$ 不低于 $1$（Tait 状态方程在 $\rho_i\ge\rho_0$ 时才给出非负压力）、施加 Monaghan 应力正则化、或改用带背景压力的状态方程。取 $u_{\max}=2.80\ \mathrm{m/s}$、$c_s=30\ \mathrm{m/s}$，马赫数 $Ma=0.093$，密度波动约 $(u_{\max}/c_s)^2=0.87\%$，此时负压通常只出现在自由表面而非内部。

```
# 成对压力力累加（保证反对称）
for i in range(N):
    a[i] = g_vector.copy()
for i in range(N):
    for j in neighbors[i]:
        r  = x[i] - x[j]
        gw = gradW(r, h)
        A  = p[i]/rho[i]**2 + p[j]/rho[j]**2   # Monaghan
        a[i] -= m[j] * A * gw                  # j 一侧由邻居循环自动对称累加
        a[j] += m[i] * A * gw                  # 显式写另一侧，等价于反对称
```

## 压力项形式按密度比选择

单相水动力问题（密度比 $1{:}1$）用 Monaghan 形式 $\left(p_i/\rho_i^2+p_j/\rho_j^2\right)$，它对线性动量严格守恒且对冲击鲁棒。存在气液界面、密度比达到 $1000{:}1$ 时改用 Colagrossi 形式 $\left(p_i+p_j\right)/(\rho_i\rho_j)$，因为界面处 $p_i\approx p_j$ 时该式自动给出对称受力。判据是界面两侧密度比：低于 $10$ 用前者，高于 $10$ 用后者。这一条不随分辨率改变，应在建模阶段一次定好。

## 壁面边界的动量贡献

固定壁粒子需要给出压力才能产生正确斥力，Adami 等提出的壁面压力为

$$
p_w=\frac{\sum_j p_j W_{wj}+\left(\mathbf{g}-\mathbf{a}_w\right)\cdot\sum_j \rho_j\,\mathbf{x}_{wj}W_{wj}}{\sum_j W_{wj}}
$$

其中 $\mathbf{a}_w$ 是壁面加速度（静止壁为 $0$）。对 $\rho_0=998.2\ \mathrm{kg/m^3}$、$g=9.81\ \mathrm{m/s^2}$、水深 $0.4\ \mathrm{m}$ 的静水柱，底部壁粒子应给出 $p_w\approx3917\ \mathrm{Pa}$，与解析静水压一致。壁粒子层数必须覆盖支持半径 $r_c=2h$：$h=0.012\ \mathrm{m}$ 时至少 $3$ 层、层厚 $0.010\ \mathrm{m}$，否则近壁粒子一侧缺邻居会出现贴壁飞散。镜像粒子是等效替代，代价是每步多一次反射映射。

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

## 诊断脚本

```python
import numpy as np

def momentum_budget(m, v, v0=None):
    P = np.sum(m[:, None] * v, axis=0)
    denom = np.sum(m * np.linalg.norm(v, axis=1))
    if v0 is None:
        return P, denom
    eps = np.linalg.norm(P - np.sum(m[:, None] * v0, axis=0)) / denom
    return eps                      # 目标 < 1e-10

def ballistic(v0, g, t):
    # x = x0 + v0*t + 0.5*g*t^2,  v0=(2.0,5.0), g=(0,-9.81), t=0.5
    return np.array(v0) * t + 0.5 * np.array(g) * t**2   # (1.000, 1.274)

def clump_ratio(x, dp):
    n = len(x)
    cnt = 0
    for i in range(n):
        for j in range(i + 1, n):
            if np.linalg.norm(x[i] - x[j]) < 0.5 * dp:
                cnt += 1
    return 2.0 * cnt / (n * (n - 1))     # 正常 < 0.005, 失稳 > 0.05
```

三个函数对应三条独立证据：`momentum_budget` 的 $\varepsilon_P$ 必须在 $10^{-10}$ 量级；`ballistic` 返回 $(1.000,\ 1.274)$，数值解与它的偏差应小于 $1.0\times10^{-3}\ \mathrm{m}$；`clump_ratio` 超过 0.05 时，必须先确认 $\min_i p_i$ 是否为负，再决定提高声速还是加入短程斥力。

## 邻居表与重建阈值

每步全量搜索邻居代价过高，实践中用 Verlet 表：搜索半径 $r_c+\text{skin}$，$\text{skin}=0.25h=0.003\ \mathrm{m}$，当任意粒子位移累计超过 $\text{skin}/2=0.0015\ \mathrm{m}$ 时重建。以 $\Delta t=9.0\times10^{-5}\ \mathrm{s}$、典型速度 $2.80\ \mathrm{m/s}$ 计，单步位移 $2.5\times10^{-4}\ \mathrm{m}$，约每 $6$ 步重建一次。重建过频则开销大，过疏则漏邻居导致密度与压力跳变。

## 时间步的三项分解

动量方程的显式时间步同时受三个尺度约束：

$$
\Delta t\le\min\left(0.25\frac{h}{c_s+u_{\max}},\ 0.25\sqrt{\frac{h}{a_{\max}}},\ 0.125\frac{h^2}{\nu}\right)
$$

对 $h=0.012\ \mathrm{m}$、$c_s=30\ \mathrm{m/s}$、$u_{\max}=2.80\ \mathrm{m/s}$，声学项给出 $9.15\times10^{-5}\ \mathrm{s}$；重力主导时 $a_{\max}=9.81\ \mathrm{m/s^2}$，加速度项给出 $0.25\sqrt{0.012/9.81}=8.74\times10^{-3}\ \mathrm{s}$；取水 $\nu=1.004\times10^{-6}\ \mathrm{m^2/s}$，黏性项给出 $0.125\times1.44\times10^{-4}/1.004\times10^{-6}=17.9\ \mathrm{s}$。三项中声学项主导，因此 $\Delta t$ 主要由 $c_s$ 决定，盲目减小 $\Delta t$ 只会在声学项已满足时浪费算力。

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 整体缓慢平移、净动量漂移 | 变平滑长度破坏了核梯度反对称 | 监控 $\sum_i m_i\mathbf{v}_i$，比较对称化 $\tilde h_{ij}$ 前后 |
| 界面处压力出现跳变 | 用了 Monaghan 形式而密度比过大 | 换 Colagrossi 形式，检查界面 $\lvert p_i-p_j\rvert$ |
| 粒子自发聚集成网格状 | 负压区拉伸不稳定性 | 输出 $\min_i p_i$，确认是否低于 $0$ |
| 静水柱出现虚假加速度 | 压力项负号或核梯度取向写反 | 核对 $\nabla p$ 是否等于 $9793\ \mathrm{Pa/m}$ 且方向朝下 |
| 减小 $\Delta t$ 后动量漂移不减 | 误差来自空间离散而非时间积分 | 对比 $\Delta t$ 减半与 $\Delta p$ 减半的效果 |
| 近壁粒子贴壁飞散 | 壁粒子层数不足，覆盖不到 $r_c$ | 统计近壁粒子邻居数，检查是否显著低于内部 |
| 壁面压力偏离 $3917\ \mathrm{Pa}$ | Adami 式漏掉 $\mathbf{g}\cdot\sum\rho_j\mathbf{x}_{wj}$ 项 | 关掉压力项只留重力，看壁面压力是否为静水值 |
| 长跑能量单调上升 | 用欧拉格式积分 | 换 KDK 复跑，比较 $10^4$ 步后总能量漂移 |
| 密度与压力周期性跳变 | 邻居表重建过疏 | 把重建阈值从 $0.0015$ 减到 $0.00075\ \mathrm{m}$ 观察 |
| 减小 $\Delta t$ 无改善 | 声学项早已满足，误差来自空间离散 | 分解三项时间步，确认主导项是否为声学 |
| 净动量线性漂移 | 变平滑长度破坏核梯度反对称 | 关外力跑 1 s，读 $\varepsilon_P$ 是否超过 $10^{-3}$ |
| 弹道 $y$ 偏离 1.274 m | 重力方向、积分格式或单位错误 | 单粒子无邻居复算，与解析解逐点比较 |
| 壁面穿透超过 $1.0\times10^{-3}\ \mathrm{m}$ | 壁粒子层数不足或斥力刚度偏低 | 加密至覆盖 $r_c=0.024\ \mathrm{m}$ 后复测 |
| 负压区粒子成网格状 | 核二阶导为正导致拉伸不稳定 | 同步输出 $\min_i p_i$ 与 $f_{\text{clump}}$ |
| 近壁切向速度不衰减 | 只有法向斥力，缺切向约束 | 提取近壁 $6.0\times10^{-3}\ \mathrm{m}$ 内速度剖面 |
| 静水柱内出现持续内部流动 | 压力项非成对，静水压力不平衡 | 检查压力加速度是否逐对抵消，$\varepsilon_P$ 是否为零 |

## 静水平衡的定量校核

动量方程在静水中必须精确平衡重力与压力梯度。解析条件为

$$
-\frac{1}{\rho_0}\nabla p=\mathbf{g}
$$

取 $\rho_0=998.2\ \mathrm{kg/m^3}$、$g=9.81\ \mathrm{m/s^2}$，则要求 $\nabla p=\rho_0 g=9793\ \mathrm{Pa/m}$，即每 $0.010\ \mathrm{m}$ 粒子间距对应压力差 $97.9\ \mathrm{Pa}$。深度 $0.4\ \mathrm{m}$ 处压力 $p=\rho_0 gH=3917\ \mathrm{Pa}$。若数值解在该处给出 $3917\ \mathrm{Pa}$ 但梯度符号相反，说明压力项前的负号或 $\nabla_i W_{ij}$ 的取向写反，是最常见的符号错误。

## 成对形式与反对称自检

压力加速度写成成对形式，使粒子 $i$ 与 $j$ 之间的内力大小相等、方向相反：

$$
\frac{d\mathbf{v}_i}{dt}=-\sum_j m_j\left(\frac{p_i}{\rho_i^2}+\frac{p_j}{\rho_j^2}\right)\nabla_i W_{ij}+\mathbf{g}+\mathbf{a}_{\nu,i}
$$

对称性的前提是核梯度的反对称关系 $\nabla_iW_{ij}=-\nabla_jW_{ij}$，只要 $W$ 只依赖距离就自动成立。数值上要验证的是净动量

$$
\varepsilon_P(t)=\frac{\left|\mathbf{P}(t)-\mathbf{P}(0)\right|}{\sum_i m_i|\mathbf{v}_i|},\qquad \mathbf{P}=\sum_i m_i\mathbf{v}_i
$$

关闭重力与外场后，$\varepsilon_P$ 应低于 $10^{-10}$。若它达到 $10^{-3}$ 量级并随时间线性增长，几乎一定是变平滑长度破坏了反对称——此时缩小 $\Delta t$ 不会改善，唯一有效做法是把平滑长度对称化为 $\tilde h_{ij}=(h_i+h_j)/2$。

## 弹道算例：把外力项单独隔离出来

无压力梯度时动量方程退化为 $\dot{\mathbf{v}}=\mathbf{g}$，有解析解

$$
\mathbf{x}(t)=\mathbf{x}_0+\mathbf{v}_0t+\tfrac12\mathbf{g}t^2
$$

取 $\mathbf{v}_0=(2.0,\ 5.0)\ \mathrm{m/s}$、$\mathbf{g}=(0,\ -9.81)\ \mathrm{m/s^2}$、$t=0.5\ \mathrm{s}$，则 $x=2.0\times0.5=1.000\ \mathrm{m}$，$y=5.0\times0.5-0.5\times9.81\times0.25=2.500-1.226=1.274\ \mathrm{m}$。单粒子、无邻居、$\Delta p=0.010\ \mathrm{m}$ 的条件下运行到 $0.5\ \mathrm{s}$，位置误差应低于 $\Delta p/10=1.0\times10^{-3}\ \mathrm{m}$。若 $y$ 偏离 1.274 m，问题必然出在重力方向、积分格式或单位换算，而不在压力项——这一步用一分钟就能排除整类外力错误。

## 壁面穿透与滑移

统计最大穿透深度 $\delta_{\text{pen}}=\max_i\left[-\mathbf{n}_w\cdot(\mathbf{x}_i-\mathbf{x}_w)\right]$，合格线是 $\delta_{\text{pen}}<0.1\Delta p=1.0\times10^{-3}\ \mathrm{m}$。穿透量随法向速度平方增长：溃坝前沿在 $t=0.3\ \mathrm{s}$ 时速度可达 $2.80\ \mathrm{m/s}$，若此处超限，应加密壁粒子层数而非缩小时间步——壁粒子层必须覆盖整个支持半径 $r_c=2h=0.024\ \mathrm{m}$，二维至少 3 层。滑移方面，无滑移壁要求切向速度在近壁 $0.5h=6.0\times10^{-3}\ \mathrm{m}$ 内衰减到主流值的 10% 以下；若完全不衰减，说明只加了法向斥力而漏了切向黏性约束。

## 拉伸不稳定性的判别式

在负压区，粒子会沿核梯度方向聚成网格状结构。Monaghan 指出该不稳定性的来源是核函数的二阶导符号：

$$
\frac{\partial^2 W}{\partial r^2}>0 \quad\text{当 } r<\Delta p
$$

此时粒子间的有效"弹簧刚度"为负，微小扰动被放大。对应的数值指标是聚簇比例 $f_{\text{clump}}$，定义为粒子对距离小于 $0.5\Delta p$ 的占比。正常自由面流动中 $f_{\text{clump}}$ 低于 0.5%；出现拉伸不稳定性时会升到 5% 以上，且与 $\min_i p_i<0$ 同步出现。缓解顺序按代价排列：先提高声速把密度波动压回 1% 以内（$c_s$ 由 $30\ \mathrm{m/s}$ 提到 $40\ \mathrm{m/s}$，相对密度波动从 0.87% 降到 0.49%），再考虑加入正比于 $(W_{ij}/W(\Delta p))^4$ 的短程斥力正则项。

## 参考资料

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
2. Monaghan J.J., *SPH without a tensile instability*, Journal of Computational Physics, Vol. 159, 2000.
3. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
4. Morris J.P., Fox P.J., Zhu Y., *Modeling low Reynolds number incompressible flows using SPH*, Journal of Computational Physics, Vol. 136, 1997.
5. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, Vol. 17, 2010.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
7. Adami S., Hu X.Y., Adams N.A., *A generalized wall boundary condition for smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 231, 2012.
8. Crespo A.J.C., Domínguez J.M., Rogers B.D. et al., *DualSPHysics: Open-source parallel CFD solver based on SPH*, Computer Physics Communications, Vol. 187, 2015.
9. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
10. Randles P.W., Libersky L.D., *Smoothed particle hydrodynamics: some recent improvements and applications*, Computer Methods in Applied Mechanics and Engineering, Vol. 139, 1996.
11. Violeau D., Rogers B.D., *Smoothed particle hydrodynamics (SPH) for free-surface flows: past, present and future*, Journal of Hydraulic Research, Vol. 54, 2016.
