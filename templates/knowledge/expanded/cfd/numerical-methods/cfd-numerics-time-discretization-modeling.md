---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-time-discretization-modeling
title: "时间离散与误差控制：离散原理与适用范围"
summary: "从放大因子与稳定域出发解释时间格式的阶数与稳定性不能兼得：推导 RK4 的实轴稳定上限 2.785、对比显式欧拉与后向欧拉的刚性行为，并用一次手算给出同一扩散算例下两种格式允许的步长差。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "时间离散与误差控制"
  - "离散原理与适用范围"
  - "A-稳定"
  - "稳定域"
seo:
  title: "时间离散与误差控制：离散原理与适用范围"
  description: "从放大因子与稳定域出发解释时间格式的阶数与稳定性不能兼得：推导 RK4 的实轴稳定上限 2.785、对比显式欧拉与后向欧拉的刚性行为，并用一次手算给出同一扩散算例下两种格式允许的步长差。"
  keywords:
    - "时间离散与误差控制"
    - "离散原理与适用范围"
    - "A-稳定"
    - "稳定域"
---

# 时间离散与误差控制：离散原理与适用范围

把空间离散后的半离散系统写成 $\mathrm{d}\mathbf{u}/\mathrm{d}t=\mathbf{L}\mathbf{u}+\mathbf{N}(\mathbf{u})$，时间离散的全部问题就归结为一个复标量模型方程 $\dot{u}=\lambda u$。格式的阶数决定精度，稳定域决定步长上限，而 Dahlquist 障碍告诉我们这两件事在隐式线性多步法里不能同时最优。理解这条限制，才能解释为什么生产算例几乎从不使用三阶以上的隐式格式。

## 放大因子：稳定性的唯一判据

对模型方程 $\dot{u}=\lambda u$（$\lambda$ 为空间算子的特征值，$\mathrm{Re}\,\lambda<0$），格式写成 $u^{n+1}=G(\lambda\Delta t)u^n$。稳定性要求

$$\left|G(z)\right|\le1,\qquad z=\lambda\Delta t$$

几个常用格式的 $G$：

$$G_{\text{EE}}(z)=1+z,\qquad G_{\text{BE}}(z)=\frac{1}{1-z},\qquad G_{\text{CN}}(z)=\frac{1+z/2}{1-z/2}$$

四阶 Runge–Kutta 的稳定多项式为

$$G_{\text{RK4}}(z)=1+z+\frac{z^{2}}{2}+\frac{z^{3}}{6}+\frac{z^{4}}{24}$$

在负实轴上，$\left|G_{\text{RK4}}\right|\le1$ 的边界为 $z=-2.785$，而显式欧拉只到 $z=-2$。两者相差 $2.785/2=1.39$，即同样问题下 RK4 允许的步长比显式欧拉大 39 %，代价是每步四次右端求值。

## 手算：扩散算例下的步长上限

一维扩散算子离散后最大特征值为 $\lambda=-2\nu/\Delta x^{2}$。取 $\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$，$\Delta x=1.0\times10^{-3}\ \mathrm{m}$：

$$\lambda=-\frac{2\times1.5\times10^{-5}}{\left(1.0\times10^{-3}\right)^{2}}=-30\ \mathrm{s^{-1}}$$

于是

$$\Delta t_{\text{EE}}\le\frac{2.0}{30}=6.7\times10^{-2}\ \mathrm{s},\qquad \Delta t_{\text{RK4}}\le\frac{2.785}{30}=9.3\times10^{-2}\ \mathrm{s}$$

若改用后向欧拉，$\left|G_{\text{BE}}\right|=\left|1/(1-z)\right|$ 对任意 $z<0$ 都小于 1，步长不受稳定性限制，只受精度限制。这就是隐式格式在刚性扩散问题上的全部价值：把 $\Delta t$ 从 $10^{-2}$ 量级解放出来，代价是每步解一次线性系统。

## A-稳定与 L-稳定：两个不同的要求

A-稳定指稳定域包含整个左半平面 $\mathrm{Re}\,z\le0$；L-稳定在此外还要求 $\left|G(z)\right|\to0$ 当 $z\to-\infty$。

$$G_{\text{CN}}(z)\xrightarrow{z\to-\infty}-1,\qquad G_{\text{BE}}(z)\xrightarrow{z\to-\infty}0$$

两者都 A-稳定，但只有后向欧拉是 L-稳定。Crank–Nicolson 对刚性模态的放大因子模长为 1，意味着初始的刚性分量永不衰减，会以 $2\Delta t$ 周期在解中长期驻留。这就是为什么 `CrankNicolson 0.9` 需要配合启动阶段的 `Euler` 或改用 `backward`。

Dahlquist 第一障碍进一步限定：A-稳定的线性多步法阶数不超过 2。BDF1（后向欧拉）与 BDF2 是 A-稳定的，BDF3 到 BDF6 只具有 $A(\alpha)$ 稳定性，$\alpha$ 随阶数减小——BDF6 的 $\alpha$ 约为 $17^\circ$，意味着它对接近虚轴的特征值不稳定。这就是生产求解器中隐式格式极少超过二阶的结构性原因。

## 伪时间推进与物理时间的区别

稳态求解器引入伪时间 $\tau$，求解

$$\frac{\partial\phi}{\partial\tau}+R(\phi)=0$$

当 $\partial\phi/\partial\tau\to0$ 时 $R(\phi)=0$，得到定常解。伪时间步只影响收敛速度，不影响最终解——前提是流动本身存在定常解。对双时间步进的瞬态求解，物理时间项用二阶格式离散，伪时间用局部时间步加速内迭代：

$$\frac{\partial\phi}{\partial\tau}+\frac{3\phi^{n+1}-4\phi^{n}+\phi^{n-1}}{2\Delta t}+R(\phi^{n+1})=0$$

第二项的系数 $3/2$、$-2$、$1/2$ 来自二阶后向差分，物理时间精度由它决定，与伪时间步无关。

```python
import numpy as np

def stability_limit(scheme, neg_real=True):
    """返回负实轴上的稳定上限 z_min (G(z) 首次离开单位圆)"""
    z = np.linspace(0, -6, 600001)
    if scheme == "EE":   G = 1 + z
    elif scheme == "RK4":G = 1 + z + z**2/2 + z**3/6 + z**4/24
    elif scheme == "BE": G = 1/(1 - z)
    elif scheme == "CN": G = (1 + z/2)/(1 - z/2)
    stable = np.abs(G) <= 1.0 + 1e-12
    return z[stable].min()

for s in ("EE", "RK4"):
    print(s, round(stability_limit(s), 4))
# EE  -2.0      RK4  -2.7853

nu, dx = 1.5e-5, 1.0e-3
lam = -2*nu/dx**2
for s, lim in (("EE", 2.0), ("RK4", 2.7853)):
    print(f"{s}: lambda={lam:.1f} 1/s  dt_max={lim/abs(lam):.4e} s")
# EE:  dt_max=6.6667e-02 s
# RK4: dt_max=9.2843e-02 s
```

## 适用边界

- **刚性比 $\left|\lambda_{\max}/\lambda_{\min}\right|$ 小于 10**：显式格式更划算，隐式解线性系统的代价收不回来；
- **刚性比超过 $10^{4}$**：必须用 L-稳定格式，A-稳定但非 L-稳定的格式会产生不衰减的刚性振荡；
- **需要三阶以上精度**：只能用显式 RK 或隐式 RK（如 Radau IIA），线性多步法受 Dahlquist 障碍限制；
- **本质非定常流动**：伪时间推进只能加速，不能替代物理时间；用稳态求解器求卡门涡街只会得到被耗散抹平的伪定常场。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 刚性模态以 $2\Delta t$ 周期不衰减 | 格式 A-稳定但非 L-稳定（如 CN） | 把格式换成 `backward`，振荡应在一个时间步内消失 |
| RK4 步长超过 9.3e-2 s 后发散 | 越过 $z=-2.785$ 的实轴稳定边界 | 把 $\Delta t$ 除以 2 重跑，若恢复稳定即确认 |
| 隐式格式在低阶下反而更慢 | 刚性比不足以补偿线性求解代价 | 统计每步线性求解耗时占比，> 70 % 说明选错格式 |
| BDF6 在周期流动上发散 | $A(\alpha)$ 稳定域不覆盖接近虚轴的特征值 | 换成 BDF2 重跑，或改用隐式 RK |
| 双时间步进下物理时间精度只有一阶 | 物理时间项用了隐式欧拉而非二阶后向差分 | 检查三项系数是否为 3/2、-2、1/2 |

## 参考文献

1. Dahlquist G., *A special stability problem for linear multistep methods*, BIT Numerical Mathematics, 3(1):27–43, 1963.
2. Gear C.W., *Numerical Initial Value Problems in Ordinary Differential Equations*, Prentice-Hall, 1971.
3. Butcher J.C., *Numerical Methods for Ordinary Differential Equations*, 2nd ed., Wiley, 2008.
4. Jameson A., *Time dependent calculations using multigrid, with applications to unsteady flows past airfoils and wings*, AIAA Paper 91-1596, 1991.
