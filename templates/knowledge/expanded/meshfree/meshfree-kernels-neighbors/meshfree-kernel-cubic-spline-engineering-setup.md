---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-kernel-cubic-spline-engineering-setup
title: "三次样条核：工程设置与参数选择"
summary: "从粒子间距、平滑长度比、支持半径倍数三个输入反推三次样条核的 h、支持半径与内部邻居数，给出 1D/2D/3D 归一化常数、链表格元尺寸与 CFL 的配套取值，并附可复算的三维设置算例。"
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
  - "三次样条核"
  - "工程设置与参数选择"
  - "归一化常数"
  - "格元尺寸"
seo:
  title: "三次样条核：工程设置与参数选择"
  description: "从粒子间距、平滑长度比、支持半径倍数三个输入反推三次样条核的 h、支持半径与内部邻居数，给出 1D/2D/3D 归一化常数、链表格元尺寸与 CFL 的配套取值，并附可复算的三维设置算例。"
  keywords:
    - "三次样条核"
    - "工程设置与参数选择"
    - "归一化常数"
    - "平滑长度比"
    - "格元尺寸"
    - "邻居数"
---

# 三次样条核：工程设置与参数选择

三次样条核的工程配置只需要锁定三个输入：粒子间距 $\Delta p$、平滑长度比 $\eta$、支持半径倍数 $\kappa$。本文用 $\Delta p=5$ mm、$\eta=1.1$、$\kappa=2$ 的三维算例，把这三个数推成 $h=5.5$ mm、$r_c=11$ mm、内部邻居数 44.6，并给出可直接抄用的核函数与导数实现、链表格元边长和配套时间步。

## 三个归一化常数必须按维度取定

三次样条核写成尺度分离形式，把全部维度依赖集中到前置常数上：

$$W(r,h)=\frac{\sigma_d}{h^{d}}w\!\left(\frac{r}{h}\right),\qquad q=\frac{r}{h}$$

无量纲形状函数 $w(q)$ 分三段定义，上界 $q=2$ 就是支持半径的来源：

$$w(q)=\begin{cases}1-\dfrac{3}{2}q^{2}+\dfrac{3}{4}q^{3}, & 0\le q<1\\[4pt]\dfrac{1}{4}(2-q)^{3}, & 1\le q<2\\[4pt]0, & q\ge 2\end{cases}$$

由全空间归一化 $\int W\,d\mathbf{r}=1$ 得 $\sigma_1=2/3$、$\sigma_2=10/(7\pi)\approx0.45473$、$\sigma_3=1/\pi\approx0.31831$。三维可当场核对：$\int_0^{2}4\pi q^{2}w(q)\,dq=3.14159=\pi$，乘 $1/\pi$ 恰为 1；二维对应 $\int_0^{2}2\pi q\,w(q)\,dq=2.19911$，乘 $0.45473$ 得 1.0000。

维度混用会直接污染密度。二维算例里误用 $\sigma_3$，规则格点上的离散归一化量 $S_i=\sum_jV_jW_{ij}$ 落到 $0.31831\times2.19911=0.700$，密度整体偏低 30%；三维算例里误用 $\sigma_2$ 则得到 $0.45473\times3.14159=1.4286$，密度虚高 43%。这两个数字应当直接写成代码断言。

## 用目标邻居数反推平滑长度比

内部粒子的邻居数只由乘积 $\kappa\eta$ 决定，与 $\Delta p$ 的绝对值无关：

$$N_{3D}\approx\frac{4}{3}\pi(\kappa\eta)^{3},\qquad N_{2D}\approx\pi(\kappa\eta)^{2}$$

代入 $\eta=1.1$、$\kappa=2$：$(2.2)^{3}=10.648$，$N_{3D}=4.18879\times10.648=44.6$，二维同样参数只有 $\pi\times4.84=15.2$ 个邻居。三次样条在三维中的配对不稳定阈值约在 60 个邻居附近，因此 $\eta$ 应落在 0.95~1.10；把 $\eta$ 提到 1.3，邻居数升到 $4.18879\times2.6^{3}=73.6$，越界。这条关系也说明跨维度不能照抄 $\eta$：同一个 1.1 在二维给 15 个邻居，在三维给 45 个。

## 支持半径、格元边长与搜索成本

链表搜索的格元边长取 $r_c=\kappa h$ 时，二维检查 9 个格元、三维检查 27 个。本算例中 $h=1.1\times5=5.5$ mm，$r_c=2\times5.5=11$ mm，单个格元容纳 $(r_c/\Delta p)^{3}=(11/5)^{3}=10.65$ 个粒子，每步要做 $27\times10.65=287$ 次距离判定才能筛出 44.6 个真邻居，筛选效率约 15.5%。$2\times10^{6}$ 粒子体系单次邻居表重建约 $5.7\times10^{8}$ 次判定。

若把格元边长误设成 $h=5.5$ mm，$r_c$ 会跨越 5 个格元，必须遍历 $5^{3}=125$ 个格元而不是 27 个，遍历开销变为 4.6 倍。规则是格元边长不小于 $r_c$。

## 推荐参数台账

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

## 可复算的核函数与设置脚本

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

## 时间步与人工黏性的配套取值

时间步随 $h$ 与最大声速缩放，换核但不改 $h$ 时 $\Delta t$ 基本不变：

$$\Delta t=0.25\,\frac{h}{c_s},\qquad c_s\ge 10\,v_{\max}$$

取 $v_{\max}=1.5$ m/s 得 $c_s\ge15$ m/s，本算例用 $c_s=20$ m/s，对应最大密度波动约 $(v_{\max}/c_s)^{2}=0.56\%$，$\Delta t=0.25\times0.0055/20=6.88\times10^{-5}$ s。人工黏性取 Monaghan 形式 $\alpha=0.1$、$\beta=0$，只在接近声速的压缩对之间起作用；$\alpha$ 若与物理黏度混记，后处理会把数值耗散误判成黏性效应。

## 设置阶段的失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 内部密度整体偏低约 30% | 二维算例误用三维 $\sigma_3$ | 规则格点算 $S_i$，正确应得 0.999，误用得 0.700 |
| 内部密度虚高约 43% | 三维算例误用二维 $\sigma_2$ | 同上，误用得 1.4286 |
| 拉伸区出现成对粒子团 | $\eta=1.3$ 使三维邻居数达 73.6，越过配对阈值 | 统计 $r<0.5\Delta p$ 的粒子对，正常为 0，配对时可达数千 |
| 邻居表重建耗时是预估的 4.6 倍 | 格元边长设成 $h$ 而非 $r_c$，需遍历 125 个格元 | 打印单次查询的格元计数，三维应为 27 |
| 首步即发散 | $\Delta t$ 未随 $c_s$ 缩放 | $\Delta t$ 减半重跑；若仍发散则查 $c_s$ 是否取了物理声速 |
| 自由面粒子被吸向壁面 | 表面 $S_i$ 仅约 0.5，压力估计偏低 | 分别统计内部与表面粒子的 $S_i$ 分布 |

## 参考文献

1. Monaghan J.J., Lattanzio J.C., *A refined particle method for astrophysical problems*, Astronomy and Astrophysics, 149, 135–143, 1985.
2. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425, 1068–1082, 2012.
3. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, 17, 25–76, 2010.
4. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
5. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30, 543–574, 1992.
6. Gingold R.A., Monaghan J.J., *Smoothed particle hydrodynamics: theory and application to non-spherical stars*, Monthly Notices of the Royal Astronomical Society, 181, 375–389, 1977.
