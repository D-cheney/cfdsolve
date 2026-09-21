---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-momentum-equation-diagnosis-validation
title: "动量方程离散：结果诊断与可信度验证"
summary: "用净动量预算、弹道解析解、壁面穿透深度与聚簇比例四项独立证据审查动量离散，给出成对反对称自检的数值阈值、拉伸不稳定性的判别式与一次可核对的位置手算。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "动量方程离散"
  - "结果诊断与可信度验证"
  - "动量预算"
  - "拉伸不稳定性"
seo:
  title: "动量方程离散：结果诊断与可信度验证"
  description: "用净动量预算、弹道解析解、壁面穿透深度与聚簇比例四项独立证据审查动量离散，给出成对反对称自检的数值阈值、拉伸不稳定性的判别式与一次可核对的位置手算。"
  keywords:
    - "动量方程离散"
    - "结果诊断与可信度验证"
    - "动量预算"
    - "拉伸不稳定性"
    - "壁面穿透"
---

# 动量方程离散：结果诊断与可信度验证

动量离散的误差不会停留在残差里，它会以净动量漂移、弹道偏离、壁面穿透和粒子聚簇四种形式外显。这四项互为独立证据：任何一项失败都说明离散动量不守恒或外力项有误，四项同时通过才足以支撑"动量离散正确"的结论。本文给出每项的判定量、阈值与一次可核对的手算。

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

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 净动量线性漂移 | 变平滑长度破坏核梯度反对称 | 关外力跑 1 s，读 $\varepsilon_P$ 是否超过 $10^{-3}$ |
| 弹道 $y$ 偏离 1.274 m | 重力方向、积分格式或单位错误 | 单粒子无邻居复算，与解析解逐点比较 |
| 壁面穿透超过 $1.0\times10^{-3}\ \mathrm{m}$ | 壁粒子层数不足或斥力刚度偏低 | 加密至覆盖 $r_c=0.024\ \mathrm{m}$ 后复测 |
| 负压区粒子成网格状 | 核二阶导为正导致拉伸不稳定 | 同步输出 $\min_i p_i$ 与 $f_{\text{clump}}$ |
| 近壁切向速度不衰减 | 只有法向斥力，缺切向约束 | 提取近壁 $6.0\times10^{-3}\ \mathrm{m}$ 内速度剖面 |
| 静水柱内出现持续内部流动 | 压力项非成对，静水压力不平衡 | 检查压力加速度是否逐对抵消，$\varepsilon_P$ 是否为零 |

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

## 参考

1. Monaghan J.J., *SPH without a tensile instability*, Journal of Computational Physics, Vol. 159, 2000.
2. Adami S., Hu X.Y., Adams N.A., *A generalized wall boundary condition for smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 231, 2012.
3. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
4. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, Vol. 17, 2010.
5. Randles P.W., Libersky L.D., *Smoothed particle hydrodynamics: some recent improvements and applications*, Computer Methods in Applied Mechanics and Engineering, Vol. 139, 1996.
6. Violeau D., Rogers B.D., *Smoothed particle hydrodynamics (SPH) for free-surface flows: past, present and future*, Journal of Hydraulic Research, Vol. 54, 2016.
