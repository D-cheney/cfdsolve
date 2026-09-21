---
template_version: flowlab-knowledge/1.0
slug: meshfree-kernel-cubic-spline-engineering-setup
title: 三次样条核：工程设置与诊断验证
summary: >-
  从粒子间距、平滑长度比、支持半径倍数三个输入反推三次样条核的 h、支持半径与内部邻居数，给出 1D/2D/3D 归一化常数、链表格元尺寸与 CFL
  的配套取值，并附可复算的三维设置算例。 全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
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
  - 三次样条核
  - 工程设置与参数选择
  - 归一化常数
  - 格元尺寸
  - 结果诊断与可信度验证
  - 配对不稳定
  - 二阶矩
seo:
  title: 三次样条核：工程设置与诊断验证
  description: >-
    从粒子间距、平滑长度比、支持半径倍数三个输入反推三次样条核的 h、支持半径与内部邻居数，给出 1D/2D/3D 归一化常数、链表格元尺寸与 CFL
    的配套取值，并附可复算的三维设置算例。 全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 三次样条核
    - 工程设置与参数选择
    - 归一化常数
    - 平滑长度比
    - 格元尺寸
    - 邻居数
    - 结果诊断与可信度验证
    - 配对不稳定
    - 离散归一化
    - 二阶矩
    - 重构误差
---
# 三次样条核：工程设置与诊断验证

## 工程设置与参数选择

三次样条核的工程配置只需要锁定三个输入：粒子间距 $\Delta p$、平滑长度比 $\eta$、支持半径倍数 $\kappa$。本文用 $\Delta p=5$ mm、$\eta=1.1$、$\kappa=2$ 的三维算例，把这三个数推成 $h=5.5$ mm、$r_c=11$ mm、内部邻居数 44.6，并给出可直接抄用的核函数与导数实现、链表格元边长和配套时间步。

### 三个归一化常数必须按维度取定

三次样条核写成尺度分离形式，把全部维度依赖集中到前置常数上：

$$W(r,h)=\frac{\sigma_d}{h^{d}}w\!\left(\frac{r}{h}\right),\qquad q=\frac{r}{h}$$

无量纲形状函数 $w(q)$ 分三段定义，上界 $q=2$ 就是支持半径的来源：

$$w(q)=\begin{cases}1-\dfrac{3}{2}q^{2}+\dfrac{3}{4}q^{3}, & 0\le q<1\\[4pt]\dfrac{1}{4}(2-q)^{3}, & 1\le q<2\\[4pt]0, & q\ge 2\end{cases}$$

由全空间归一化 $\int W\,d\mathbf{r}=1$ 得 $\sigma_1=2/3$、$\sigma_2=10/(7\pi)\approx0.45473$、$\sigma_3=1/\pi\approx0.31831$。三维可当场核对：$\int_0^{2}4\pi q^{2}w(q)\,dq=3.14159=\pi$，乘 $1/\pi$ 恰为 1；二维对应 $\int_0^{2}2\pi q\,w(q)\,dq=2.19911$，乘 $0.45473$ 得 1.0000。

维度混用会直接污染密度。二维算例里误用 $\sigma_3$，规则格点上的离散归一化量 $S_i=\sum_jV_jW_{ij}$ 落到 $0.31831\times2.19911=0.700$，密度整体偏低 30%；三维算例里误用 $\sigma_2$ 则得到 $0.45473\times3.14159=1.4286$，密度虚高 43%。这两个数字应当直接写成代码断言。

### 用目标邻居数反推平滑长度比

内部粒子的邻居数只由乘积 $\kappa\eta$ 决定，与 $\Delta p$ 的绝对值无关：

$$N_{3D}\approx\frac{4}{3}\pi(\kappa\eta)^{3},\qquad N_{2D}\approx\pi(\kappa\eta)^{2}$$

代入 $\eta=1.1$、$\kappa=2$：$(2.2)^{3}=10.648$，$N_{3D}=4.18879\times10.648=44.6$，二维同样参数只有 $\pi\times4.84=15.2$ 个邻居。三次样条在三维中的配对不稳定阈值约在 60 个邻居附近，因此 $\eta$ 应落在 0.95~1.10；把 $\eta$ 提到 1.3，邻居数升到 $4.18879\times2.6^{3}=73.6$，越界。这条关系也说明跨维度不能照抄 $\eta$：同一个 1.1 在二维给 15 个邻居，在三维给 45 个。

### 支持半径、格元边长与搜索成本

链表搜索的格元边长取 $r_c=\kappa h$ 时，二维检查 9 个格元、三维检查 27 个。本算例中 $h=1.1\times5=5.5$ mm，$r_c=2\times5.5=11$ mm，单个格元容纳 $(r_c/\Delta p)^{3}=(11/5)^{3}=10.65$ 个粒子，每步要做 $27\times10.65=287$ 次距离判定才能筛出 44.6 个真邻居，筛选效率约 15.5%。$2\times10^{6}$ 粒子体系单次邻居表重建约 $5.7\times10^{8}$ 次判定。

若把格元边长误设成 $h=5.5$ mm，$r_c$ 会跨越 5 个格元，必须遍历 $5^{3}=125$ 个格元而不是 27 个，遍历开销变为 4.6 倍。规则是格元边长不小于 $r_c$。

### 推荐参数台账

| 参数 | 符号 | 本算例取值 | 依据 |
|---|---|---|---|
| 粒子间距 | $\Delta p$ | 5.0 mm | 最细结构至少铺 5 个粒子 |
| 平滑长度比 | $\eta$ | 1.1 | 三维邻居数 44.6，低于阈值 60 |
| 支持半径倍数 | $\kappa$ | 2 | 三次样条定义域上界 |
| 支持半径 | $r_c$ | 11.0 mm | $r_c=\kappa h$ |
| 格元边长 | — | 11.0 mm | 三维 27 格元覆盖 |
| 时间步 | $\Delta t$ | $6.88\times10^{-5}$ s | $\Delta t=0.25h/c_s$ |
| 人工黏性 | $\alpha$ | 0.1 | 抑制压力振铃，与物理黏度分开记录 |
| 内部邻居数下限 | $N_{\min}$ | 20 | 低于此值核近似退化 |

### 可复算的核函数与设置脚本

```python
import math
SIGMA = {1: 2.0/3.0, 2: 10.0/(7.0*math.pi), 3: 1.0/math.pi}

def cubic_w(q):
    if q >= 2.0: return 0.0
    if q < 1.0:  return 1.0 - 1.5*q*q + 0.75*q**3
    return 0.25*(2.0-q)**3

def cubic_dw(q):                      # dw/dq
    if q >= 2.0: return 0.0
    if q < 1.0:  return -3.0*q + 2.25*q*q
    return -0.75*(2.0-q)**2

def kernel(r, h, d):                  # W
    return SIGMA[d]*cubic_w(r/h)/h**d

def kernel_grad(r, h, d):             # dW/dr
    return SIGMA[d]*cubic_dw(r/h)/h**(d+1)

def setup(dp, eta, kappa, d, cs, vmax):
    h, rc = eta*dp, kappa*h
    N = (4.0/3.0)*math.pi*(kappa*eta)**3 if d == 3 else math.pi*(kappa*eta)**2
    return dict(h=h, rc=rc, N_expected=round(N, 2),
                cell=rc, dt=0.25*h/max(cs, 10.0*vmax))

print(setup(dp=0.005, eta=1.1, kappa=2.0, d=3, cs=20.0, vmax=1.5))
# {'h': 0.0055, 'rc': 0.011, 'N_expected': 44.6, 'cell': 0.011, 'dt': 6.875e-05}
```

### 时间步与人工黏性的配套取值

时间步随 $h$ 与最大声速缩放，换核但不改 $h$ 时 $\Delta t$ 基本不变：

$$\Delta t=0.25\,\frac{h}{c_s},\qquad c_s\ge 10\,v_{\max}$$

取 $v_{\max}=1.5$ m/s 得 $c_s\ge15$ m/s，本算例用 $c_s=20$ m/s，对应最大密度波动约 $(v_{\max}/c_s)^{2}=0.56\%$，$\Delta t=0.25\times0.0055/20=6.88\times10^{-5}$ s。人工黏性取 Monaghan 形式 $\alpha=0.1$、$\beta=0$，只在接近声速的压缩对之间起作用；$\alpha$ 若与物理黏度混记，后处理会把数值耗散误判成黏性效应。

### 设置阶段的失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 内部密度整体偏低约 30% | 二维算例误用三维 $\sigma_3$ | 规则格点算 $S_i$，正确应得 0.999，误用得 0.700 |
| 内部密度虚高约 43% | 三维算例误用二维 $\sigma_2$ | 同上，误用得 1.4286 |
| 拉伸区出现成对粒子团 | $\eta=1.3$ 使三维邻居数达 73.6，越过配对阈值 | 统计 $r<0.5\Delta p$ 的粒子对，正常为 0，配对时可达数千 |
| 邻居表重建耗时是预估的 4.6 倍 | 格元边长设成 $h$ 而非 $r_c$，需遍历 125 个格元 | 打印单次查询的格元计数，三维应为 27 |
| 首步即发散 | $\Delta t$ 未随 $c_s$ 缩放 | $\Delta t$ 减半重跑；若仍发散则查 $c_s$ 是否取了物理声速 |
| 自由面粒子被吸向壁面 | 表面 $S_i$ 仅约 0.5，压力估计偏低 | 分别统计内部与表面粒子的 $S_i$ 分布 |

### 参考文献

1. Monaghan J.J., Lattanzio J.C., *A refined particle method for astrophysical problems*, Astronomy and Astrophysics, 149, 135–143, 1985.
2. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425, 1068–1082, 2012.
3. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, 17, 25–76, 2010.
4. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
5. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30, 543–574, 1992.
6. Gingold R.A., Monaghan J.J., *Smoothed particle hydrodynamics: theory and application to non-spherical stars*, Monthly Notices of the Royal Astronomical Society, 181, 375–389, 1977.

## 诊断与可信度验证

三次样条核的多数"数值噪声"抱怨其实可以归到三个可测量上：核的二阶矩给出的有效平滑宽度、离散归一化量 $S_i$ 的分布、以及拉伸区里 $r<0.5\Delta p$ 的粒子对数量。本文给出这四个量的解析值与实测口径，并用一次可核对的重构误差验算说明三次样条核在什么条件下才开始退化。

### 核的形状函数及其光滑阶数

三次样条核的分段形状函数在 $q=1$ 处拼接，工程上真正需要知道的是它在哪一阶导数上失去连续性：

$$w(q)=\begin{cases}1-\dfrac{3}{2}q^{2}+\dfrac{3}{4}q^{3}, & 0\le q<1\\[4pt]\dfrac{1}{4}(2-q)^{3}, & 1\le q<2\end{cases}$$

逐阶求导可验证 $w$、$w'$、$w''$ 在 $q=1$ 处两侧都等于 $0.25$、$-0.75$、$1.5$，因此该核是 $C^{2}$ 的。但三阶导数不连续：

$$w'''(q)=\begin{cases}4.5, & 0<q<1\\[4pt]-1.5, & 1<q<2\end{cases}$$

跳变幅度 6.0。核在三维中的三阶径向导数携带 $6\sigma_3/h^{6}=6\times0.31831/h^{6}=1.910/h^{6}$ 的阶跃，这一项会以 $O(\Delta p^{3})$ 的形式进入压力噪声。若仿真中压力场出现与粒子间距同尺度的高频振铃，而 $S_i$ 与邻居数都正常，应当怀疑的就是这个跳变，而不是时间步。

### 二阶矩给出的有效平滑宽度

诊断"结果被抹平了多少"，最直接的工具是核的二阶矩。三维中

$$\int_{\mathbb{R}^{3}}r^{2}W\,d\mathbf{r}=4\pi\sigma_3h^{4}\int_{0}^{2}q^{4}w(q)\,dq$$

分段积分给出 $\int_0^2q^4w\,dq=0.225$，代入 $\sigma_3=1/\pi$ 得 $\int r^2W\,d\mathbf{r}=4\pi\times0.31831\times0.225h^{2}=0.900h^{2}$。按每方向折算，等效方差为 $0.900h^{2}/3=0.300h^{2}$，等效标准差 $0.5477h$。取 $h=5.5$ mm，等效平滑宽度 $0.5477\times5.5=3.01$ mm——任何比 3 mm 更细的流场结构在三次样条核下都会被抹掉。

用同一组数据可以预判重构误差。对 $f=x^{2}$ 做核插值，规则格点上的一阶误差项是 $\frac{1}{2}\sigma_W^{2}f''=\frac{1}{2}\times0.300h^{2}\times2=0.300h^{2}$。在 $h=5.5$ mm 处该偏差为 $0.300\times30.25=9.08$ mm²；若评估点位于 $x=100$ mm，真值 $10^{4}$ mm²，相对误差 $9.08/10^{4}=0.091\%$。所以"三次样条核把结果算歪了"在二阶场量上通常只有千分之一量级，真正的误差源是下面两项。

### 离散归一化量与梯度一致性量

离散化之后，连续归一化不再自动成立，必须逐粒子检查：

$$S_i=\sum_j V_jW_{ij},\qquad \boldsymbol{\beta}_i=\sum_j V_j\nabla_iW_{ij}$$

内部规则粒子上 $S_i$ 应落在 $0.999$ 附近（三维、$\eta=1.1$ 时实测 0.998~1.001）。自由面上的粒子因为核被几何截断，$S_i$ 约为 $0.5$；壁面角点可低到 0.25。$\boldsymbol{\beta}_i$ 的理想值是零向量，实测其模长应小于 $10^{-3}$ 倍的 $\max_j|\nabla_iW_{ij}|$；若 $\boldsymbol{\beta}_i$ 的模长与 $\nabla_iW_{ij}$ 同量级，说明该粒子处于极度无序区，梯度近似已经失效。

判断准则很简单：$S_i$ 的**最小值**决定是否出现伪力，而不是均值。均值 0.99 但最小值 0.30 的算例，在最小值所在位置会产生肉眼可见的粒子堆积。

### 配对不稳定：从谱条件到粒子对计数

三次样条核的傅里叶变换在邻居数偏高时出现负瓣，规则排布失稳并坍缩成对。三维中的经验阈值约在 60 个邻居附近，用 $N_{3D}\approx\frac{4}{3}\pi(\kappa\eta)^{3}$ 反推：

| $\eta$（$\kappa=2$，三维） | $N_{3D}$ | 预期行为 |
|---|---|---|
| 1.0 | 33.5 | 稳定，无配对 |
| 1.1 | 44.6 | 稳定，余量约 25% |
| 1.2 | 57.9 | 临界，拉伸区开始出现成对 |
| 1.3 | 73.6 | 失稳，团聚成对 |

现场判定不看谱，只数粒子对：定义 $\Xi_i$ 为粒子 $i$ 邻域内 $r_{ij}<0.5\Delta p$ 的邻居个数。规则初始排布下 $\Xi_i=0$；一旦配对，$\Xi_i$ 会出现 1 到 2 的密集取值，全场非零粒子数从 0 跳到数千。这个指标比压力噪声曲线更早给出信号，且不需要任何后处理假设。

### 自由面与壁面的截断诊断

同一套粒子在内部与表面的表现差异极大，必须分开统计。三维中把粒子按 $S_i$ 分成三档：$S_i>0.95$ 视为内部，$0.5<S_i\le0.95$ 视为近表面，$S_i\le0.5$ 视为表面或角点。三次样条核在表面处 $S_i\approx0.5$，若不做 Shepard 重归一化，密度被低估一半，压力随之被低估，表现为粒子被壁面"吸住"。诊断时不要把这个当作核函数缺陷：它是几何截断，正确的处置是补边界粒子或改用重归一化核，而不是给密度强行加下限。

### 诊断脚本

```python
import math
SIGMA3 = 1.0/math.pi

def w(q):
    if q >= 2.0: return 0.0
    return 1.0-1.5*q*q+0.75*q**3 if q < 1.0 else 0.25*(2.0-q)**3

def dw(q):
    if q >= 2.0: return 0.0
    return -3.0*q+2.25*q*q if q < 1.0 else -0.75*(2.0-q)**2

def diagnose(pos, m, rho, h, dp, rc):
    V = [mi/ri for mi, ri in zip(m, rho)]
    S, beta, pairs = [], [], 0
    for i, xi in enumerate(pos):
        s = gx = gy = gz = 0.0
        for j, xj in enumerate(pos):
            r = math.dist(xi, xj)
            if r >= rc or r == 0.0: continue
            q = r/h
            s  += V[j]*SIGMA3*w(q)/h**3
            g  = SIGMA3*dw(q)/h**4
            gx += V[j]*g*(xi[0]-xj[0])/r
            gy += V[j]*g*(xi[1]-xj[1])/r
            gz += V[j]*g*(xi[2]-xj[2])/r
            if r < 0.5*dp: pairs += 1
        S.append(s); beta.append(math.sqrt(gx*gx+gy*gy+gz*gz))
    print("S  min/mean/max = %.3f / %.3f / %.3f" % (min(S), sum(S)/len(S), max(S)))
    print("beta max       = %.3e" % max(beta))
    print("paired pairs   = %d  (expect 0)" % pairs)
    return S, beta
```

脚本里的三个输出对应三种不同的失效：`S` 的最小值低说明几何截断或归一化常数错；`beta` 偏大说明局部无序；`pairs` 非零说明配对不稳定。

### 误判清单

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场出现与 $\Delta p$ 同尺度的高频振铃 | 三阶导数在 $q=1$ 处跳变 6.0，噪声以 $O(\Delta p^{3})$ 进入 | 把 $\Delta p$ 减半，若振铃幅度降到约 1/8 则确认为该项 |
| 拉伸区粒子聚成对，压力反而变平滑 | $\eta=1.2$ 使 $N_{3D}=57.9$，越过配对阈值 | 统计 $\Xi_i$ 非零粒子数，同时把 $\eta$ 降到 1.0 重跑 |
| 重构 $f=x^2$ 的相对误差远大于 0.1% | 核二阶矩被误当成 $h^{2}$，实际为 $0.300h^{2}$ | 用 $0.300h^{2}$ 重算理论偏差并对比实测 |
| 内部 $S_i$ 只有 0.70 | 三维算例用了二维常数 $\sigma_2$ 或反之 | 打印所用 $\sigma_d$，与 $1/\pi$、$10/(7\pi)$ 对照 |
| 壁面附近粒子被吸住 | 表面 $S_i\approx0.5$，压力被低估 | 按 $S_i$ 分档统计内部/近表面/表面三组密度均值 |
| 时间步减半后振铃不变 | 误差来自核而非积分器 | 同上第 1 行，检查振铃随 $\Delta p$ 的缩放指数 |

### 参考文献

1. Monaghan J.J., Lattanzio J.C., *A refined particle method for astrophysical problems*, Astronomy and Astrophysics, 149, 135–143, 1985.
2. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425, 1068–1082, 2012.
3. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, 17, 25–76, 2010.
4. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
5. Zhu Q., Hernquist L., Li Y., *Numerical convergence in smoothed particle hydrodynamics*, The Astrophysical Journal, 800, 6, 2015.
6. Price D.J., *Smoothed particle hydrodynamics and magnetohydrodynamics*, Journal of Computational Physics, 231, 759–794, 2012.
