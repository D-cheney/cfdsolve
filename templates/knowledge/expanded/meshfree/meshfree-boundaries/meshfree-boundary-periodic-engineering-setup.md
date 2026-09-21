---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-boundary-periodic-engineering-setup
title: "周期边界：工程设置与参数选择"
summary: "给出周期域最短镜像距离的逐分量写法、盒子尺寸下限与核支撑的关系、驱动通道流的体积力取值与动量平衡核算，以及统计收敛所需的穿越时间与验收判据。"
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
  - "周期边界"
  - "工程设置与参数选择"
  - "最短镜像距离"
  - "动量平衡核算"
seo:
  title: "周期边界：工程设置与参数选择"
  description: "给出周期域最短镜像距离的逐分量写法、盒子尺寸下限与核支撑的关系、驱动通道流的体积力取值与动量平衡核算，以及统计收敛所需的穿越时间与验收判据。"
  keywords:
    - "周期边界"
    - "工程设置与参数选择"
    - "最短镜像距离"
    - "动量平衡核算"
    - "统计收敛"
---

# 周期边界：工程设置与参数选择

周期边界用最短镜像把计算盒首尾相连，让粒子从一侧离开后由对侧进入，从而在有限域内复现统计均匀的无限流场。它对 SPH 有两个硬约束：盒子尺寸必须大于两倍核支撑，否则粒子会与自身镜像发生虚假相互作用；粒子穿越必须与邻居表同步，否则密度求和会出现锯齿。本文给出最短镜像距离的写法、盒子尺寸下限、驱动体积力取值与动量平衡核算，以及统计收敛时间与验收判据。

## 最短镜像距离

周期域中粒子对的真实距离取所有镜像中的最小值，按分量计算：

$$\mathbf{r}_{ij}=\Delta\mathbf{x}-\mathbf{L}\circ\mathrm{round}\!\left(\frac{\Delta\mathbf{x}}{\mathbf{L}}\right),\qquad \Delta\mathbf{x}=\mathbf{x}_i-\mathbf{x}_j$$

符号 $\circ$ 表示逐分量相乘，$\mathrm{round}$ 取最近整数。等价的手写形式是逐维判断：当 $|\Delta x|>L_x/2$ 时执行 $\Delta x\leftarrow\Delta x-\mathrm{sign}(\Delta x)L_x$。两种写法结果相同，但后者更容易在只对一个方向做周期时按需启用。

## 盒子尺寸下限

若 $L<2\times2h$，粒子会通过周期镜像与自己的镜像一起落进核支撑域，产生虚假自相互作用，表现为密度被高估、压力偏高。因此

$$L_{\min}>4h=4.8\Delta p$$

$\Delta p=0.005$ m、$h=0.006$ m 时 $L_{\min}>0.024$ m。取 $L=0.1$ m 的盒子，每个方向有 20 个粒子间距，安全余量约 4 倍；取 $L=0.03$ m 时只有 6 个间距，已逼近下限，此时必须验证密度是否被高估。

## 驱动通道流与动量平衡

周期槽道没有进出口，流动靠体积力驱动：

$$\mathbf{a}_{drive}=\frac{G}{\rho}\hat{\mathbf{x}}$$

取 $G=2.0$ Pa/m、$\rho=1000$ kg/m³，得 $a=2.0\times10^{-3}$ m/s²，只有重力加速度的 0.02%，因此压力场几乎不受体积力方向影响，静水修正可以照常使用。

稳态时体积力与两侧壁面剪应力平衡，这是周期边界最直接的自检恒等式：

$$\rho a L_y=2\tau_w$$

$L_y=0.02$ m 代入得 $\tau_w=1000\times2.0\times10^{-3}\times0.02/2=0.020$ Pa，与解析 Poiseuille 的 $\tau_w=Gd/2=2.0\times0.02/2=0.020$ Pa 完全一致。把 $\rho aL_y$ 与 SPH 统计出的壁面剪切对比，误差应小于 2%；若偏差大于 5%，先检查体积力是否被错误地加在所有粒子上（包括壁面粒子）。

## 统计收敛时间

周期域里只有统计稳态，没有确定性收敛点。流动穿越时间

$$t_c=\frac{L_x}{u_{bulk}},\qquad u_{bulk}=\frac{2}{3}u_{\max}$$

取 $u_{\max}=0.1$ m/s、$L_x=0.1$ m，则 $u_{bulk}=0.0667$ m/s、$t_c=1.5$ s。要得到稳定的平均剖面至少需要 20 个穿越时间，即 30 s；$\Delta t=3.0\times10^{-4}$ s 时对应 $1.0\times10^{5}$ 步。只跑 5 个穿越时间得到的 $u_{\max}$ 会偏高 3%～5%，因为速度剖面仍在从初始条件向抛物线形松弛。

## 穿越与邻居表片段

```python
def min_image(dx, L):               # 逐分量最短镜像
    return dx - L * np.round(dx / L)

def wrap(x, xmin, L):               # 穿越后重定位
    moved = False
    for d in range(3):
        if x[d] >= xmin[d] + L[d]:
            x[d] -= L[d]
            moved = True
        elif x[d] < xmin[d]:
            x[d] += L[d]
            moved = True
    return x, moved                 # moved=True 触发邻居表重建

# 主循环片段
for step in range(nsteps):
    for p in particles:
        p.x, moved = wrap(p.x, xmin, L)
        if moved:
            mark_for_rebuild(p)
    if any_moved:
        rebuild_neighbor_list()     # 必须在力计算之前
    compute_forces_with_min_image()
```

## 验收：周期槽道三查

$L_x=0.1$ m、$L_y=0.02$ m、$u_{\max}=0.1$ m/s、$Re=2000$ 的算例，检查三项。第一，$\tau_w$ 与 $\rho aL_y$ 的相对差小于 2%。第二，粒子总数在 $10^{5}$ 步内波动小于 0.01%，说明穿越没有丢失或复制粒子。第三，把 $L_x$ 从 0.1 m 加倍到 0.2 m，$u_{bulk}$ 变化小于 1%，说明盒子长度已足够容纳最长相关尺度。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 密度整体被高估 1%～3% | 盒子尺寸小于 $4h$，出现自相互作用 | 把 $L$ 加倍，看密度是否回落 |
| 密度沿周期方向出现锯齿 | 穿越后未重建邻居表 | 输出每步穿越粒子数与邻居表重建次数 |
| 通道流出现净动量漂移 | 体积力与壁面剪切不平衡 | 核算 $\rho aL_y$ 与 $2\tau_w$ |
| 统计量随盒子长度变化 | $L_x$ 不足，相关长度被截断 | 把 $L_x$ 加倍重跑，比较 $u_{bulk}$ |
| 速度在穿越瞬间跳变 | 穿越时对速度做了错误重置 | 检查穿越前后 $|\mathbf{v}|$ 是否连续 |
| 壁面剪应力偏高约 50% | 体积力被加到了壁面粒子上 | 统计体积力的作用粒子集合 |

## 参考文献

1. Allen M.P., Tildesley D.J. Computer Simulation of Liquids. Oxford University Press, 1987.
2. Monaghan J.J. Smoothed particle hydrodynamics. Annual Review of Astronomy and Astrophysics, 1992, 30: 543–574.
3. Violeau D. Fluid Mechanics and the SPH Method: Theory and Applications. Oxford University Press, 2012.
4. Morris J.P., Fox P.J., Zhu Y. Modeling low Reynolds number incompressible flows using SPH. Journal of Computational Physics, 1997, 136(1): 214–226.
5. Zhu Y., Fox P.J., Morris J.P. A pore-scale numerical model for flow through porous media. International Journal for Numerical and Analytical Methods in Geomechanics, 1999, 23(9): 881–904.
6. Crespo A.J.C., Domínguez J.M., Rogers B.D., et al. DualSPHysics: Open-source parallel CFD solver based on SPH. Computer Physics Communications, 2015, 187: 204–216.
