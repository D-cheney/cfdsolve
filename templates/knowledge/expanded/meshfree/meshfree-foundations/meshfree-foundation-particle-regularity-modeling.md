---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-foundation-particle-regularity-modeling
title: "粒子分布规则性：离散原理与适用边界"
summary: "从粒子求积误差解释为什么无序分布把二阶精度压到 d/2 阶，给出二维六边形与正方形点阵、三维 FCC/BCC/SC 的填充率与近邻数对照，并用 0.3Δx 抖动的随机游走估算 4.2% 的梯度误差量级。"
category:
  slug: meshfree-foundations
  name: "无网格法 · 方法与验证"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法 · 方法与验证"
  - "粒子分布规则性"
  - "离散原理与适用边界"
  - "粒子求积误差"
  - "粒子移位"
seo:
  title: "粒子分布规则性：离散原理与适用边界"
  description: "从粒子求积误差解释为什么无序分布把二阶精度压到 d/2 阶，给出二维六边形与正方形点阵、三维 FCC/BCC/SC 的填充率与近邻数对照，并用 0.3Δx 抖动的随机游走估算 4.2% 的梯度误差量级。"
  keywords:
    - "粒子分布规则性"
    - "离散原理与适用边界"
    - "粒子求积误差"
    - "粒子移位"
    - "MESHFREE"
---

# 粒子分布规则性：离散原理与适用边界

核近似的连续形式是二阶精确的，但落到粒子求积上，精度由点阵的几何决定。对称点阵能让一阶矩逐项抵消，误差维持二阶；粒子一旦随机错位，一阶矩变成一个随机量，误差降到 $\Delta x^{d/2}$ 阶。这条差异解释了为什么同样的格式在不同初始排布下表现相差一个数量级，也决定了粒子移位这类"整理分布"的技术应当被当成建模选择而非后期美化。本文给出求积误差的推导、常见点阵的几何参数，以及恢复规则性的几种手段各自适用到哪里为止。

## 一阶矩的抵消条件决定收敛阶

核近似把点值换成求和，误差来自把积分换成有限和：

$$
\sum_j V_j f_j W_{ij}=f_i+\frac{\sigma^{2}}{2}\nabla^{2}f_i+E_{\text{quad}}, \qquad \sum_j V_j\left(\mathbf{x}_j-\mathbf{x}_i\right)W_{ij}=\begin{cases}\mathbf{0}, & \text{对称点阵}\\[2pt] O\!\left(\Delta x^{d/2}\right), & \text{无序分布}\end{cases}
$$

规则点阵里每一对关于粒子 $i$ 对称的邻居贡献大小相等、方向相反，一阶矩精确为零，$E_{\text{quad}}$ 与核偏差同为 $O(\Delta x^{2})$。粒子位置一旦抖动，这种配对不再严格成立，一阶矩变成 $N_{\text{nb}}$ 个独立小量之和，按随机游走只衰减到 $\Delta x^{d/2}$。合并两项：

$$
e_{L_2}\sim C_1h^{2}+C_2\Delta x^{d/2}\quad\Longrightarrow\quad p=\min\left(2,\ \tfrac{d}{2}\right)
$$

二维无序分布的理论阶是 1，三维是 1.5。这解释了实测中二维抖动点阵稳定停在 1.0 附近，而三维同一算例往往测到 1.4~1.6——不是实现有 bug，是维度写在阶数里。

## 抖动幅度换算成梯度误差

把误差量级写出来更好用。设单粒子位置偏差 $\delta=0.3\Delta x$，平滑长度 $h=1.2\Delta x$，则单次偏差对梯度的相对贡献为 $\delta/h=0.25$；$N_{\text{nb}}=35$ 个邻居的随机抵消把它压到

$$
\frac{\delta}{h\sqrt{N_{\text{nb}}}}=\frac{0.3}{1.2\times\sqrt{35}}=\frac{0.25}{5.92}=0.042
$$

即约 $4.2\%$ 的梯度误差。把 $\delta$ 降到 $0.1\Delta x$ 后该值降到 $1.4\%$，把 $h/\Delta x$ 从 1.2 提到 1.5 后降到 $3.3\%$。三个旋钮里，整理分布（减小 $\delta$）的性价比最高，因为误差与 $\delta$ 成正比，而增大 $h$ 会同时抹掉物理特征。

## 点阵几何决定初始规则性与邻居数

二维常用两种排布：正方形点阵每个粒子有 4 个距离 $\Delta x$ 的近邻与 4 个距离 $\sqrt{2}\Delta x$ 的次近邻，填充率 $\pi/4=0.785$；六边形点阵有 6 个等距近邻，填充率 $\pi/(2\sqrt{3})=0.907$，各向同性更好，是自由面算例的首选初始构型。三维对应的三种常见排布为面心立方 $0.740$、体心立方 $0.680$、简单立方 $0.524$，同体积下近邻数依次为 12、8、6，规则性越差越容易在起步阶段就出现各向异性压力。

| 点阵 | 维数 | 填充率 | 最近邻数 | 适用情形 |
|---|---|---|---|---|
| 六边形 | 2D | 0.907 | 6 | 自由面、多相界面首选 |
| 正方形 | 2D | 0.785 | 4 | 简单几何、需与结构化数据对齐 |
| FCC/HCP | 3D | 0.740 | 12 | 三维流体默认 |
| BCC | 3D | 0.680 | 8 | 需较低初始密度时 |
| 简单立方 | 3D | 0.524 | 6 | 仅用于最简验证算例 |

## 无序从哪来，以及三种整理手段的边界

无序有三个来源：初始点阵本身不规则；流动的剪切与涡量把粒子沿流线拉伸；稀疏波把粒子拉散形成低密度区。第一种靠生成器解决，后两种必须在线处理。粒子移位技术（particle shifting technique）在每步后给粒子一个沿密度梯度的微小位移，把聚集区推开、把空洞填上，二维自由面算例中可把 $C_V$ 从 $38\%$ 压回 $10\%$ 以内。代价是移位本身引入的数值耗散，需要控制移位系数并单独做敏感性分析。XSPH 速度平滑是另一条路，它抑制粒子间的相对无序运动，实现简单但会额外耗散动能，不适合强剪切。第三种是提高 $h/\Delta x$，用更大的支持域把随机误差平均掉，代价是界面模糊、边界截断更严重。

适用边界很清楚：全拉格朗日固体 SPH 不能随意移位，因为粒子携带材料坐标，移动会破坏本构历史的对应关系，此时应改用在构型空间重构应力（如 CSPM 或 MLS 应力修正）。开边界算例中移位会把粒子推入流出区，需与通量边界协调。多相流中移位系数必须按相分别设置，否则会把轻相粒子推入重相。任何情况下，移位都不应被用来掩盖边界处理错误——如果只有近壁区 $C_V$ 高，先查边界粒子层数，而不是加大移位。

```python
import numpy as np

def hexagonal_lattice(nx, ny, dx):
    """生成六边形（三角）点阵，行间距 sqrt(3)/2*dx，奇偶行交错 dx/2"""
    pts = []
    for iy in range(ny):
        for ix in range(nx):
            x = ix * dx + (0.5 * dx if iy % 2 else 0.0)
            y = iy * dx * np.sqrt(3.0) / 2.0
            pts.append((x, y))
    return np.array(pts)

def shift_particles(x, dx, rho, grad_rho, delta=0.02):
    """密度梯度驱动的粒子移位，delta 为位移上限系数（相对 dx）"""
    g = grad_rho / (np.linalg.norm(grad_rho, axis=1, keepdims=True) + 1e-12)
    return x - delta * dx * g        # 沿密度减小的方向推开聚集区
```

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 二维阶数停在 1.0、三维停在 1.5 | 无序分布使求积误差退化为 $\Delta x^{d/2}$ 阶 | 换成规则点阵重跑，看阶数是否回到 2 |
| 起步阶段压力出现棋盘状振荡 | 正方形点阵各向异性，四个方向邻居数不足 | 换六边形点阵，比较初始压力场的方差 |
| 剪切层内粒子成串 | 流线拉伸使局部各向异性增长 | 统计剪切层内 Voronoi 面积变异系数 |
| 开启移位后质量或动量漂移 | 移位位移未与守恒更新同步 | 关掉移位重跑，比较总动量残差 |
| 固体算例移位后应力错乱 | 移位破坏材料坐标与粒子的对应关系 | 用重构应力方案替换移位，比较变形历史 |
| 近壁 $C_V$ 高而内部正常 | 边界粒子层数不足，缺外侧邻居 | 增厚边界粒子层，重测近壁 $C_V$ |

## 参考文献

1. Quinlan N.J., Basa M., Lastiwka M., *Truncation error in mesh-free particle methods*, International Journal for Numerical Methods in Engineering, 66(13): 2064-2085, 2006.
2. Lind S.J., Xu R., Stansby P.K., Rogers B.D., *Incompressible smoothed particle hydrodynamics for free-surface flows: A generalised diffusion-based algorithm for stability and validations for impulsive flows and propagating waves*, Journal of Computational Physics, 231(4): 1499-1523, 2012.
3. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30: 543-574, 1992.
4. Liu M.B., Liu G.R., *Smoothed particle hydrodynamics (SPH): an overview and recent developments*, Archives of Computational Methods in Engineering, 17: 25-76, 2010.
5. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Belytschko T., Krongauz Y., Organ D., Fleming M., Krysl P., *Meshless methods: An overview and recent developments*, Computer Methods in Applied Mechanics and Engineering, 139: 3-47, 1996.
