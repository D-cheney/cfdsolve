---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-boundary-repulsive-force-engineering-setup
title: "排斥力边界：工程设置与参数选择"
summary: "给出 Lennard-Jones 型边界力的作用距离与指数取值、由静水载荷反算力幅值 k 的标定公式、刚度对时间步的约束，以及补足无滑移所需的切向黏性项与三个可复算验收算例。"
category:
  slug: meshfree-boundaries
  name: "无网格法边界处理"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法边界处理"
  - "排斥力边界"
  - "工程设置与参数选择"
  - "Lennard-Jones 边界力"
  - "惩罚力标定"
seo:
  title: "排斥力边界：工程设置与参数选择"
  description: "给出 Lennard-Jones 型边界力的作用距离与指数取值、由静水载荷反算力幅值 k 的标定公式、刚度对时间步的约束，以及补足无滑移所需的切向黏性项与三个可复算验收算例。"
  keywords:
    - "排斥力边界"
    - "工程设置与参数选择"
    - "Lennard-Jones 边界力"
    - "惩罚力标定"
    - "切向黏性补偿"
---

# 排斥力边界：工程设置与参数选择

排斥力边界用惩罚性近程力阻止粒子穿透，不改动核一致性，实现最简单，但强度与作用距离必须标定：过弱会穿透并在壁面留下空隙，过强会压缩时间步并在近壁注入虚假压力。本文给出 Lennard-Jones 型边界力的标定流程——由静水载荷反算力幅值、由刚度反算时间步、由切向黏性项补足无滑移，并给出静水、库埃特与穿透深度三个可复算的验收算例。

## Lennard-Jones 型边界力

Monaghan 提出的边界力在 $r_{ij}<r_0$ 时激活，超出作用距离即为零：

$$\mathbf{f}_{ij}=k\left[\left(\frac{r_0}{r_{ij}}\right)^{p_1}-\left(\frac{r_0}{r_{ij}}\right)^{p_2}\right]\hat{\mathbf{r}}_{ij},\qquad r_{ij}<r_0$$

指数常取 $p_1=4,\,p_2=2$，需要更陡的壁面时可取 $p_1=12,\,p_2=4$。$r_0$ 一般取 $1.0\sim1.2\Delta p$，因此这个力只作用于最靠近壁面的一两层粒子，不会污染内部流场。注意 $r_{ij}=r_0$ 时括号为零，力在作用距离边界处连续。

## 由静水载荷反算力幅值

标定原则是：让最靠近壁面的粒子被压到 $r=0.5r_0$ 时提供的支撑力，等于该处的静水压力载荷。取 $r_0=\Delta p=0.01$ m，此时括号项为 $(0.5)^{-4}-(0.5)^{-2}=16-4=12$。

水深 $H=1.0$ m 时底部压力 $p=\rho gH=1000\times9.81\times1.0=9810$ Pa。二维单粒子承担的载荷是 $p\Delta p=9810\times0.01=98.1$ N（按单位厚度计），于是

$$k=\frac{p\,\Delta p}{\left(r_0/r\right)^{p_1}-\left(r_0/r\right)^{p_2}}=\frac{98.1}{12}=8.2\ \mathrm{N}$$

这个数可以直接复算。若水深改成 $H=2.0$ m，$k$ 线性加倍到 16.4 N——排斥力强度随工况线性缩放，不能把 $H=1$ m 标定出的 $k$ 照抄到别的压力水平。

## 刚度对时间步的约束

排斥力是显式惩罚力，其等效刚度直接限制时间步：

$$\Delta t\le0.25\min_i\sqrt{\frac{m_i}{|\mathbf{F}_i|/h}}$$

二维单粒子质量 $m_i=\rho\Delta p^{2}=1000\times(0.01)^{2}=0.1$ kg。粒子被压到 $0.5r_0$ 时作用力约 98.1 N，加速度 $a=98.1/0.1=981$ m/s²。取 $h=0.012$ m，得

$$\Delta t=0.25\sqrt{\frac{0.012}{981}}=0.25\times3.50\times10^{-3}=8.7\times10^{-4}\ \mathrm{s}$$

声速 CFL 给出 $0.25h/c_s=0.25\times0.012/10=3.0\times10^{-4}$ s，比上式更严，说明当前 $k$ 下惩罚力还没有成为瓶颈，这正是惩罚法可用的前提。若把 $k$ 提高 100 倍，$\Delta t$ 降到 $8.7\times10^{-5}$ s，成本上升一个量级，此时应改用镜像法或半解析边界。

## 切向条件与黏性补偿

纯法向排斥力不传递切向动量，壁面会自然呈现自由滑移。要得到无滑移，必须在同一对粒子上叠加切向黏性力：

$$\mathbf{f}^{t}_{ij}=-2\nu\rho\,\frac{m_j}{\rho_j}\,\frac{\mathbf{v}_{ij}^{t}}{r_{ij}^{2}+0.01h^{2}}$$

$\mathbf{v}_{ij}^{t}$ 是相对速度的切向分量，分母中的 $0.01h^{2}$ 是 Morris 型正则化项，防止 $r_{ij}\to0$ 时发散。实现如下。

```python
r0 = 1.0 * dp
def boundary_force(f, w, mw, rhow):
    r = norm(f.x - w.x)
    if r >= r0:
        return zeros(3)
    e = (f.x - w.x) / r
    mag = k * ((r0/r)**4 - (r0/r)**2)          # 法向惩罚力
    f_rep = mag * e
    dv = f.v - w.v
    vt = dv - dot(dv, e) * e                   # 切向相对速度
    f_vis = -2.0 * nu * rho * (mw/rhow) * vt / (r*r + 0.01*h*h)
    return f_rep + f_vis
```

| 参数 | 取值 | 依据 |
|---|---|---|
| $r_0$ | $1.0\Delta p$ | 超过则与核力作用区重叠 |
| $p_1,\,p_2$ | 4, 2 | $r=0.5r_0$ 时括号项恰为 12 |
| $k$ | 8.2 N（$H=1$ m，二维） | 静水载荷标定 |
| 激活层数 | 最近 1～2 层 | 由 $r_0$ 限制 |
| 切向系数 | 与流体 $\nu$ 一致 | 无滑移所需，不额外调参 |

## 验收：静水、库埃特与穿透深度

静水柱 $H=1.0$ m：底部压力应等于 9810 Pa，最大穿透深度应小于 $0.1\Delta p=1$ mm。若穿透持续超过 2 mm，先检查 $k$ 是否按水深线性缩放，而不是先加密粒子。

库埃特流：板间距 $d=0.01$ m、上板 $U=0.05$ m/s、$\mu=1.0\times10^{-3}$ Pa·s，解析壁面剪应力 $\tau_w=\mu U/d=5.0\times10^{-3}$ Pa。只用纯排斥力时实测 $\tau_w<1.0\times10^{-4}$ Pa，滑移几乎完全；加入切向黏性项后应恢复到解析值的 90% 以上。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 粒子缓慢穿入壁面 | $k$ 未按压力水平缩放 | 统计最大穿透深度随 $H$ 的变化是否线性 |
| 时间步被迫减半 | $k$ 或指数 $p_1$ 过大，刚度上升 | 用 $0.25\sqrt{mh/F}$ 反算 $\Delta t$ |
| 近壁出现虚假高压层 | 作用距离 $r_0>1.2\Delta p$，与核力重复 | 把 $r_0$ 从 $1.5\Delta p$ 降回 $1.0\Delta p$ 看压力 |
| 壁面剪应力接近零 | 缺少切向黏性项 | 关掉黏性项对比 $\tau_w$ |
| 粒子在壁面附近高频抖动 | 惩罚力与时间步不匹配，出现振荡 | 减小 $\Delta t$ 看抖动是否消失 |

## 参考文献

1. Monaghan J.J. Simulating free surface flows with SPH. Journal of Computational Physics, 1994, 110(2): 399–406.
2. Monaghan J.J., Kos A. Solitary waves on a Cretan beach. Journal of Waterway, Port, Coastal, and Ocean Engineering, 1999, 125(3): 145–155.
3. Monaghan J.J. Smoothed particle hydrodynamics. Reports on Progress in Physics, 2005, 68(8): 1703–1759.
4. Violeau D. Fluid Mechanics and the SPH Method: Theory and Applications. Oxford University Press, 2012.
5. Rogers B.D., Dalrymple R.A. SPH modeling of breaking waves. Coastal Engineering 2004, World Scientific, 2005: 415–427.
6. Crespo A.J.C., Domínguez J.M., Rogers B.D., et al. DualSPHysics: Open-source parallel CFD solver based on SPH. Computer Physics Communications, 2015, 187: 204–216.
