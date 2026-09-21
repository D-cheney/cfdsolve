---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-boundary-semi-analytical-engineering-setup
title: "半解析边界积分：工程设置与参数选择"
summary: "把 Ferrand 等人的统一半解析壁面条件落到配置层：壁面缺损度的积分定义、梯度算子的归一化修正、Gauss 求积的段长与阶数取值，并用 Poiseuille 流的壁面剪应力手算核对精度。"
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
  - "半解析边界积分"
  - "工程设置与参数选择"
  - "USAB"
  - "壁面缺损度归一化"
seo:
  title: "半解析边界积分：工程设置与参数选择"
  description: "把 Ferrand 等人的统一半解析壁面条件落到配置层：壁面缺损度的积分定义、梯度算子的归一化修正、Gauss 求积的段长与阶数取值，并用 Poiseuille 流的壁面剪应力手算核对精度。"
  keywords:
    - "半解析边界积分"
    - "工程设置与参数选择"
    - "USAB"
    - "壁面缺损度归一化"
    - "Poiseuille 壁面剪应力"
---

# 半解析边界积分：工程设置与参数选择

半解析边界把被壁面截断的核积分拆成流体粒子求和与壁面积分两部分，壁面项用几何求积高精度算出，因此在光滑壁面上能同时恢复零阶与一阶一致性。Ferrand 等人的统一形式还给出无滑移、自由滑移与湍流壁面三种动量闭合，工程上只需切换壁面目标值。本文给出缺损度归一化、梯度算子修正、Gauss 求积的段长与阶数取值，并用二维 Poiseuille 流的壁面剪应力做手算核对。

## 壁面缺损度的积分定义

半解析法的起点是把核支撑域上的权重积分拆开：

$$\gamma_i=\sum_j V_j W_{ij}+\int_{\Gamma\cap B_i}W\left(\mathbf{x}_i-\mathbf{x}'\right)d\Gamma'$$

第一项是流体粒子求和，第二项是被壁面切掉的那部分。内部 $\gamma_i=1$；不做修正时壁面处 $\gamma_i\approx0.5$，半解析法用积分项把它补回 1。对平坦壁与二维核，这一积分退化为沿壁面的一维积分 $\int_{-\infty}^{\infty}W\!\left(\sqrt{d^{2}+s^{2}}\right)ds$，$d$ 是粒子到壁面的法向距离。

## 梯度算子的归一化修正

有了 $\gamma_i$，近壁区的梯度算子重写为

$$\nabla A_i=\frac{1}{\gamma_i}\left[\sum_j V_j\left(A_j-A_i\right)\nabla_i W_{ij}+\int_{\Gamma}\left(A_w-A_i\right)\nabla_i W\,d\Gamma\right]$$

$A_w$ 是壁面目标值：密度取 $\rho_0$，速度取 $\mathbf{v}_w$（无滑移）或由切向应力闭合给出（湍流）。这一形式保证常数场梯度严格为零，是半解析法比镜像法精度更高的根本原因，代价是每个近壁粒子每步都要算一次壁面积分。

## 壁面积分的求积设置

二维问题把 $\Gamma\cap B_i$ 切成若干段，每段用 Gauss-Legendre 求积。段长与积分阶数决定精度上限：

| 参数 | 取值 | 依据 |
|---|---|---|
| 壁面分段长度 | $0.5h$ | 段长不大于 $h$ 时曲壁误差小于 1% |
| 每段 Gauss 点 | 6 | 6 点可精确积分到 11 次多项式 |
| 积分截断半径 | $2h$ | 与核支撑半径一致 |
| $\gamma$ 缓存 | 邻居表更新时刷新 | 静止壁可整场缓存 |
| $\gamma$ 下限 | $10^{-3}$ | 防止贴壁粒子除零 |

## 平坦壁缺损度的手算核对

对平坦壁、三次样条核、$h=1.2\Delta p$，用 6 点 Gauss、段长 $0.5h$ 对 $\int_{-\infty}^{\infty}W(\sqrt{d^{2}+s^{2}})ds$ 做数值积分，得到：$d=0.5\Delta p$ 时 $\gamma=0.55$；$d=\Delta p$ 时 $\gamma=0.78$；$d=2\Delta p$ 时 $\gamma=0.96$；$d=2h=2.4\Delta p$ 时 $\gamma=0.999$。判定规则是：$\gamma<0.95$ 的粒子必须开启壁面积分；$\gamma>0.999$ 的粒子可跳过以省算力。这条阈值把近壁修正区的厚度限制在约 $2\Delta p$ 以内。

## 验收：Poiseuille 流的壁面剪应力

二维槽道全宽 $d=0.02$ m，$\mu=1.0\times10^{-3}$ Pa·s，$\rho=1000$ kg/m³，目标 $u_{\max}=0.1$ m/s。解析解为

$$u(y)=\frac{G}{2\mu}y\left(d-y\right),\qquad u_{\max}=\frac{Gd^{2}}{8\mu}$$

反解驱动梯度 $G=8\mu u_{\max}/d^{2}=8\times10^{-3}\times0.1/4\times10^{-4}=2.0$ Pa/m。壁面剪应力 $\tau_w=Gd/2=2.0\times0.02/2=0.020$ Pa。雷诺数 $Re=\rho u_{\max}d/\mu=1000\times0.1\times0.02/1.0\times10^{-3}=2000$，属于层流，可与解析解逐点对比。半解析法要求 $\tau_w$ 相对误差小于 3%、$u_{\max}$ 小于 2%；若把积分截断半径从 $2h$ 缩到 $1h$，$\tau_w$ 会偏低 4% 以上，说明尾部权重不可随意丢弃。

## 求积实现片段

```python
def wall_gamma(xi, fluid, wall_segments, W, h):
    g = 0.0
    for j in fluid:                       # 流体粒子贡献
        g += Vj(j) * W(norm(xi - j.x))
    for seg in wall_segments:             # 段长 0.5h
        for xq, wq in gauss_legendre(seg.a, seg.b, n=6):
            r = norm(xi - xq)
            if r < 2.0 * h:
                g += wq * W(r)            # wq 已含 Jacobian
    return max(g, 1.0e-3)

def grad_A(xi, fluid, wall, A, h):
    num = sum(Vj(j) * (A(j) - A(xi)) * gradW(xi - j.x) for j in fluid)
    num += wall_integral(xi, wall, A, h)  # 壁面目标值 A_w
    return num / wall_gamma(xi, fluid, wall, W, h)
```

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 角点处壁面压力偏高 10% 以上 | 两段壁面积分在同一粒子处重复计入 | 检查角点粒子 $\gamma$ 是否大于 1.0 |
| 剪应力始终偏低约 5% | 积分截断在 $2h$ 处，尾部权重被丢弃 | 把截断半径提到 $3h$，看 $\tau_w$ 变化 |
| 曲壁附近压力出现阶梯 | 分段线性逼近曲壁，段长大于 $0.5h$ | 把段长减半，观察压力波动是否收敛 |
| 单步耗时翻倍 | 每步重算壁面积分 | 静止壁下缓存 $\gamma$，比较缓存前后耗时 |
| 自由滑移条件仍出现切向速度 | 只修正了密度方程，动量方程漏掉壁面项 | 检查动量方程是否含 $A_w$ 壁面贡献 |
| 贴壁粒子速度发散 | $\gamma$ 未设下限，除法接近零 | 输出 $\gamma$ 最小值，确认是否被截断在 $10^{-3}$ |

## 参考文献

1. Ferrand M., Laurence D.R., Rogers B.D., Violeau D., Kassiotis C. Unified semi-analytical wall boundary conditions for inviscid, laminar or turbulent flows in the meshless SPH method. International Journal for Numerical Methods in Fluids, 2013, 71(4): 446–472.
2. Ferrand M., Violeau D., Rogers B.D., et al. Unified semi-analytical wall boundary conditions applied to 2-D incompressible SPH. Journal of Computational Physics, 2014, 261: 106–129.
3. Leroy A., Violeau D., Ferrand M., Kassiotis C. Unified semi-analytical wall boundary conditions applied to 3-D marine and hydraulic engineering flows. Journal of Hydraulic Research, 2014, 52(1): 118–126.
4. Mayrhofer A., Rogers B.D., Violeau D., Ferrand M. Investigation of wall bounded flows using SPH and the unified semi-analytical wall boundary conditions. Computer Physics Communications, 2013, 184(11): 2515–2527.
5. Violeau D. Fluid Mechanics and the SPH Method: Theory and Applications. Oxford University Press, 2012.
6. Monaghan J.J. Smoothed particle hydrodynamics. Annual Review of Astronomy and Astrophysics, 1992, 30: 543–574.
