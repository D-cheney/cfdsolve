---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-free-surface-modeling
title: "自由表面识别：SPH 离散原理与适用边界"
summary: "讲清自由表面在 SPH 中为何只能由邻域完整性推断，给出归一化求和 γ_i 与位置散度 ∇·r 两类判据的阈值、Shepard 修正密度的构造，以及 p=0 边界条件的施加逻辑。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "自由表面识别"
  - "SPH 离散原理与适用边界"
  - "位置散度判据"
  - "Shepard 修正"
seo:
  title: "自由表面识别：SPH 离散原理与适用边界"
  description: "讲清自由表面在 SPH 中为何只能由邻域完整性推断，给出归一化求和 γ_i 与位置散度 ∇·r 两类判据的阈值、Shepard 修正密度的构造，以及 p=0 边界条件的施加逻辑。"
  keywords:
    - "自由表面识别"
    - "SPH 离散原理与适用边界"
    - "位置散度判据"
    - "Shepard 修正"
    - "归一化求和"
---

# 自由表面识别：SPH 离散原理与适用边界

SPH 没有显式界面几何，自由表面只能从"邻域被截断"这一事实反推。识别错误会同时污染三个环节：密度求和缺项、状态方程反算出虚假负压、表面张力施加在错误位置。本文给出两类主流判据的构造与阈值、Shepard 修正密度的作用，以及 $p=0$ 边界条件在弱可压缩框架下的施加逻辑。

## 自由表面为何必须显式标记

自由表面粒子的支持域只覆盖半个球（或圆），其核求和天然缺项。若不加区分地按内部粒子处理，$\rho_i=\sum_j m_j W_{ij}$ 会低估密度，经 Tait 状态方程 $p=c_s^2\rho_0[(\rho/\rho_0)^\gamma-1]/\gamma$ 反算出负压。取 $\rho_0=998.2\ \mathrm{kg/m^3}$、$c_s=30\ \mathrm{m/s}$、$\gamma=7$，表面亏损使 $\rho_i/\rho_0=0.5$ 时 $p_i\approx-1.27\times10^5\ \mathrm{Pa}$，而真实表面压力应为 $0$。因此识别不是后处理，而是求解循环内的必要步骤。

## 归一化求和判据

定义归一化核求和

$$
\gamma_i=\sum_j V_j W_{ij},\qquad V_j=\frac{m_j}{\rho_j}
$$

内部粒子邻域完整时 $\gamma_i\approx1.0$；平面自由表面粒子只剩半个支持域，二维给出 $\gamma_i\approx0.5$，三维在 $0.5\sim0.6$ 之间。工程阈值取 $\gamma_i<0.75$ 判为表面粒子，该值在 $h=0.012\ \mathrm{m}$、$\Delta p=0.010\ \mathrm{m}$ 下对曲率半径大于 $5h=0.06\ \mathrm{m}$ 的表面识别稳定；曲率更大的液滴尖端需要把阈值放宽到 $0.65$，否则会把内部粒子误判为表面。

## 位置散度判据

Marrone 等提出用位置矢量的散度作为几何判据：

$$
\left(\nabla\cdot\mathbf{r}\right)_i=\sum_j V_j\left(\mathbf{r}_j-\mathbf{r}_i\right)\cdot\nabla_i W_{ij}
$$

该量在连续极限下等于空间维度 $d$，与密度分布无关，因此比 $\gamma_i$ 更稳健。内部 $\left(\nabla\cdot\mathbf{r}\right)_i\approx d$，即二维 $2.0$、三维 $3.0$；自由表面处因缺一半邻居降到约 $d/2$。阈值取二维 $1.5$、三维 $2.4$，介于两者之间且留有容差。它的优点是对非均匀粒子分布不敏感，缺点是每个粒子需要额外一次向量求和，代价约为密度求和的 $1.3$ 倍。

## Shepard 修正密度把亏损拉回

识别出表面后，用 Shepard 归一化修正密度：

$$
\tilde\rho_i=\frac{\sum_j m_j W_{ij}}{\sum_j V_j W_{ij}}
$$

内部 $\gamma_i=1$ 时 $\tilde\rho_i=\rho_i$，不改变结果；表面 $\gamma_i=0.5$ 时分子约为 $0.5\rho_0$、分母约为 $0.5$，相除恢复到 $\rho_0$，把虚假负压从 $-1.27\times10^5\ \mathrm{Pa}$ 拉回到 $0$ 附近。代价是修正后的密度不再严格对应质量守恒，因此只能用于状态方程与表面压力，不能用于替代连续性方程中的密度更新。

```
# 自由表面识别与修正密度
for i in range(N):
    gamma = 0.0; divr = 0.0; m_sum = 0.0
    for j in neighbors[i]:
        Vj = m[j]/rho[j]
        gamma += Vj * W(i, j)
        divr  += Vj * dot(x[j]-x[i], gradW(x[i]-x[j], h))
        m_sum += m[j] * W(i, j)
    is_surface[i] = (gamma < 0.75) or (divr < 1.5)   # 2D
    rho_corr[i]   = m_sum / max(gamma, 1e-6)          # Shepard 修正
    if is_surface[i]:
        p[i] = 0.0                                     # 表面压力条件
```

## 适用边界与误判来源

两类判据都在粒子分布严重非均匀时失效：拉伸区的粒子稀疏会让内部粒子 $\gamma_i$ 降到 $0.7$ 以下，被误判为表面并强制 $p=0$，造成局部虚假空腔。反之，破碎后的孤立液滴若邻域完整，判据无法识别其表面，需要补充基于拓扑连通性的检测。曲率半径小于 $3\Delta p=0.03\ \mathrm{m}$ 的尖角处，两类判据都会给出模糊结果，此时应结合体积守恒而非单纯几何阈值。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 表面粒子持续飞散 | 未识别表面、未施加 $p=0$ | 统计被标记表面粒子数，检查是否接近几何表面粒子数 |
| 内部出现孤立空腔 | 拉伸区被误判为表面并强制 $p=0$ | 输出 $\gamma_i$ 与 $\nabla\cdot\mathbf{r}$ 的联合分布 |
| 液滴破碎后表面消失 | 判据只依赖邻域完整性 | 补充连通分量分析，检查孤立团簇数 |
| 尖端处表面抖动 | 曲率小于 $3\Delta p$，判据模糊 | 加密到 $\Delta p=0.005\ \mathrm{m}$ 后复跑 |
| 修正密度后质量不守恒 | Shepard 修正未与连续性方程分离 | 比较 $\sum m_i$ 与修正前后密度积分 |

## 参考

1. Marrone S., Colagrossi A., Le Touzé D., Graziani G., *Fast free-surface detection and level-set definition in SPH*, Computer Physics Communications, Vol. 181, 2010.
2. Antuono M., Colagrossi A., Marrone S., Molteni D., *Free-surface flows solved by means of SPH schemes with numerical diffusive terms*, Computer Physics Communications, Vol. 181, 2010.
3. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
4. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
5. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
6. Violeau D., Rogers B.D., *Smoothed particle hydrodynamics (SPH) for free-surface flows: past, present and future*, Journal of Hydraulic Research, Vol. 54, 2016.
