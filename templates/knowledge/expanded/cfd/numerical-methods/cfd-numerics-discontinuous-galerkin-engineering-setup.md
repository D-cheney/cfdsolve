---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-discontinuous-galerkin-engineering-setup
title: "间断 Galerkin 方法：工程设置与参数选择"
summary: "把间断 Galerkin 的五项配置一次讲清：多项式阶数与自由度换算、按 (2k+1) 收缩的显式步长、界面数值通量、SIPG 内罚系数与 TVB 限制器，附参数表与反算脚本。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "间断 Galerkin 方法"
  - "工程设置与参数选择"
  - "SIPG 内罚"
  - "TVB 限制器"
seo:
  title: "间断 Galerkin 方法：工程设置与参数选择"
  description: "把间断 Galerkin 的五项配置一次讲清：多项式阶数与自由度换算、按 (2k+1) 收缩的显式步长、界面数值通量、SIPG 内罚系数与 TVB 限制器，附参数表与反算脚本。"
  keywords:
    - "间断 Galerkin 方法"
    - "工程设置与参数选择"
    - "SIPG 内罚"
    - "TVB 限制器"
    - "库朗数"
---

# 间断 Galerkin 方法：工程设置与参数选择

DG 的工程配置只需确定五件事：多项式阶数 $k$、界面数值通量、显式时间步、内罚稳定化系数和限制器策略。本文给出每一项的取值依据与反算公式，并用一张参数表把一套可复现的 $Q_2$ 配置写清楚。

## 一、阶数决定自由度，自由度决定预算

在 $d$ 维张量积单元（四边形/六面体）上，$P^k$ 空间每单元的自由度是 $(k+1)^d$；在单纯形单元（三角形/四面体）上是组合数 $\binom{k+d}{d}$。

$$
\mathrm{DOF}_{\text{quad}}=(k+1)^d\,N_e,\qquad \mathrm{DOF}_{\text{simplex}}=\binom{k+d}{d}\,N_e
$$

二维 $Q_2$ 每单元 9 个自由度；若网格是 $200\times200=4\times10^4$ 个单元，总自由度约 $3.6\times10^5$。自由度直接决定质量矩阵规模与显式步进的每步代价，因此升阶前应先按上式外推内存，而不是等程序报错。

## 二、显式步长被 $(2k+1)$ 收缩

DG 的显式稳定域比同阶有限体积更窄，算子谱半径随阶数近似按 $2k+1$ 增长，因此时间步需按阶数折算：

$$
\Delta t\le \mathrm{CFL}\,\frac{h}{(2k+1)\,a_{\max}}
$$

其中 $a_{\max}$ 是全场最大特征速度。取 $h=5\times10^{-3}$ m、$a_{\max}=1$ m/s、库朗数 0.2：$k=1$ 时 $\Delta t=3.3\times10^{-4}$ s，$k=2$ 时 $2.0\times10^{-4}$ s，$k=3$ 时 $1.4\times10^{-4}$ s。同样网格上升一级阶数，步数增加约 40%，这是高阶 DG 的隐藏成本。

## 三、界面通量与内罚系数

数值通量决定界面上如何合并左右两个状态。对流项可用局部 Lax-Friedrichs（Rusanov），耗散系数取界面两侧最大特征速度；扩散项用对称内罚法（SIPG），其惩罚系数按单元阶数与尺度定标：

$$
\sigma_f=\sigma_0\,\frac{(k+1)^2}{h_f}
$$

$\sigma_0$ 取 4～10 保证强制稳定。取得过小，界面处会出现锯齿状梯度；取得过大，矩阵条件数被抬高一个量级，迭代求解变慢。$k=2$、$h_f=5\times10^{-3}$ m、$\sigma_0=6$ 时，$\sigma_f=6\times9/(5\times10^{-3})=1.08\times10^{4}\ \mathrm{m^{-1}}$。

## 四、一套可复现的 $Q_2$ 配置

| 参数 | 取值 | 依据 |
|---|---|---|
| 多项式阶数 $k$ | 2（$Q_2$） | 目标 $L^2$ 误差 $5\times10^{-5}$，$h$ 已由 $200\times200$ 网格锁定 |
| 单元尺度 $h$ | $5\times10^{-3}$ m | 特征波长 0.5 m 的 1/100 |
| 界面数值通量 | 局部 Lax-Friedrichs | 线性对流下无需特征分解，$\alpha$ 取局部最大特征速度 |
| 库朗数 | 0.2 | SSP-RK3 显式，留 40% 余量 |
| 时间步 $\Delta t$ | $2.0\times10^{-4}$ s | 由 $(2k+1)$ 与 $h$ 反算 |
| SIPG 惩罚 $\sigma_f$ | $1.08\times10^{4}\ \mathrm{m^{-1}}$ | $\sigma_0=6$，$(k+1)^2/h_f$ |
| 求积点数 | 3（Gauss-Legendre） | 恰好精确积分 $2k$ 次多项式 |
| 限制器 | TVB minmod，$M=50$ | 仅在间断邻域激活 |

## 五、配置反算脚本

```python
import math

def dg_setup(k, h, a_max, cfl, sigma0, dim=2, elem='quad'):
    """由目标阶数与网格反算 DG 配置。"""
    dof = (k + 1) ** dim if elem == 'quad' else math.comb(k + dim, dim)
    dt = cfl * h / ((2 * k + 1) * a_max)      # 显式稳定步长
    sigma = sigma0 * (k + 1) ** 2 / h         # SIPG 界面惩罚
    nq = k + 1                                # Gauss-Legendre 点数
    return dict(dof_per_elem=dof, dt=dt, sigma=sigma, nq=nq)

for k in (1, 2, 3):
    print(k, dg_setup(k, h=5e-3, a_max=1.0, cfl=0.2, sigma0=6.0))
# 1 {'dof_per_elem': 4,  'dt': 3.33e-04, 'sigma': 4800.0, 'nq': 2}
# 2 {'dof_per_elem': 9,  'dt': 2.00e-04, 'sigma': 10800.0, 'nq': 3}
# 3 {'dof_per_elem': 16, 'dt': 1.43e-04, 'sigma': 19200.0, 'nq': 4}
```

## 六、失败模式表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 显式步进在库朗数约 0.5 处失稳 | 时间步未按 $(2k+1)$ 折算，直接沿用了有限体积经验 | 固定 $h$ 与 $k$，二分搜索首次失稳的库朗数 |
| 扩散算例界面梯度呈锯齿 | SIPG 惩罚过小，界面跳跃未受罚 | 把 $\sigma_0$ 从 4 提到 10，看锯齿是否消失 |
| 光滑解上限制器频繁激活 | TVB 的 $M$ 取成 0，退化为 minmod | 统计激活单元数，逐级提高 $M$ 直到光滑区计数归零 |
| 质量矩阵出现显著非对角元 | 求积点数 $n_q<k+1$，Legendre 基的正交性被破坏 | 打印质量矩阵非对角范数，与 $10^{-14}$ 比较 |
| 内存超出预算 | 自由度按 $(k+1)^d$ 增长，未提前外推 | 按 DOF 公式外推 $k=3,4$ 的内存与每步耗时 |
| 时间步减半后误差几乎不变 | 误差由空间离散主导，时间方向已过度解析 | 固定 $\Delta t$，只加密网格，比较误差下降率 |

## 七、参考资料

1. Cockburn B., Shu C.-W., "TVB Runge-Kutta Local Projection Discontinuous Galerkin Finite Element Method for Conservation Laws II: General Framework", *Mathematics of Computation*, 52(186), 411-435, 1989.
2. Arnold D. N., Brezzi F., Cockburn B., Marini L. D., "Unified Analysis of Discontinuous Galerkin Methods for Elliptic Problems", *SIAM Journal on Numerical Analysis*, 39(5), 1749-1779, 2002.
3. Gottlieb S., Shu C.-W., Tadmor E., "Strong Stability-Preserving High-Order Time Discretization Methods", *SIAM Review*, 43(1), 89-112, 2001.
4. Persson P.-O., Peraire J., "Sub-Cell Shock Capturing for Discontinuous Galerkin Methods", *44th AIAA Aerospace Sciences Meeting and Exhibit*, AIAA Paper 2006-0112, 2006.
