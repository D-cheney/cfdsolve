---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-viscosity-models-modeling
title: "物理与人工黏性：SPH 离散原理与适用边界"
summary: "区分层流黏性与人工黏性两类耗散的物理来源与离散式，给出由 α 反算等效运动黏度的手算、Balsara 开关的构造，以及数值黏度如何封顶可达到的雷诺数。"
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
  - "物理与人工黏性"
  - "SPH 离散原理与适用边界"
  - "Monaghan 人工黏性"
  - "Balsara 开关"
seo:
  title: "物理与人工黏性：SPH 离散原理与适用边界"
  description: "区分层流黏性与人工黏性两类耗散的物理来源与离散式，给出由 α 反算等效运动黏度的手算、Balsara 开关的构造，以及数值黏度如何封顶可达到的雷诺数。"
  keywords:
    - "物理与人工黏性"
    - "SPH 离散原理与适用边界"
    - "Monaghan 人工黏性"
    - "Balsara 开关"
    - "等效运动黏度"
---

# 物理与人工黏性：SPH 离散原理与适用边界

SPH 里存在两类完全不同的黏性：一类是代表真实流体动量输运的层流黏性项，另一类是为抑制冲击振荡与粒子飞散而人为加入的数值黏性。把二者混为一谈会让雷诺数失去物理意义，也会让"调黏性"变成掩盖其他误差的手段。本文给出两类项的离散式、由系数反算等效运动黏度的方法，以及 Balsara 开关把人工黏性限制在激波处的条件。

## 层流黏性项的离散构造

真实黏性来自动量方程的 $\nabla\cdot(\mu\nabla\mathbf{v})$，SPH 用核近似把它写成沿粒子连线的差分：

$$
\mathbf{a}_{\nu,i}=\sum_j m_j\frac{\mu_i+\mu_j}{\rho_i\rho_j}\frac{\mathbf{v}_{ij}\cdot\mathbf{x}_{ij}}{|\mathbf{x}_{ij}|^2+\epsilon h^2}\nabla_i W_{ij}
$$

其中 $\mathbf{v}_{ij}=\mathbf{v}_i-\mathbf{v}_j$，$\mathbf{x}_{ij}=\mathbf{x}_i-\mathbf{x}_j$，$\epsilon=0.01$ 防止粒子接近时除零。该式对 $\mu_i=\mu_j=\mu$ 退化为标准的拉普拉斯近似，量纲为 $\mathrm{m/s^2}$。它的耗散正比于真实动力黏度，因此 $\mu$ 应由流体物性给定，而非调节。

## 人工黏性的 Monaghan 形式

人工黏性以压力项附加量的形式进入动量方程：

$$
\Pi_{ij}=
\begin{cases}
\dfrac{-\alpha_\Pi\,\bar c_{ij}\,\phi_{ij}+\beta_\Pi\,\phi_{ij}^2}{\bar\rho_{ij}}, & \mathbf{v}_{ij}\cdot\mathbf{x}_{ij}<0\\[6pt]
0, & \mathbf{v}_{ij}\cdot\mathbf{x}_{ij}\ge0
\end{cases},\qquad
\phi_{ij}=\frac{h\,\mathbf{v}_{ij}\cdot\mathbf{x}_{ij}}{|\mathbf{x}_{ij}|^2+\epsilon h^2}
$$

$\bar c_{ij}=(c_i+c_j)/2$、$\bar\rho_{ij}=(\rho_i+\rho_j)/2$，$\Pi_{ij}$ 只在与粒子相互接近时激活。$\alpha_\Pi$ 控制线性项，用于平滑冲击与抑制飞散，常用 $0.01\sim0.1$；$\beta_\Pi$ 控制二次项，仅在超音速冲击中启用，亚音速算例取 $0$。水动力问题马赫数 $Ma=u_{\max}/c_s=2.80/30=0.093$，$\phi_{ij}^2$ 项比线性项小两个量级，因此 $\beta_\Pi=0$ 是正确选择。

## 由 α 反算等效运动黏度

人工黏性在连续极限下等效为一个运动黏度，二维近似为

$$
\nu_{\mathrm{art}}\approx\frac{\alpha_\Pi\,c_s\,h}{8}
$$

取 $\alpha_\Pi=0.05$、$c_s=30\ \mathrm{m/s}$、$h=0.012\ \mathrm{m}$，得 $\nu_{\mathrm{art}}=0.05\times30\times0.012/8=2.25\times10^{-3}\ \mathrm{m^2/s}$。20 °C 水的真实运动黏度为 $\nu=\mu/\rho=1.004\times10^{-3}/998.2=1.006\times10^{-6}\ \mathrm{m^2/s}$。两者相差 $2237$ 倍，说明默认 $\alpha_\Pi$ 的耗散完全由数值黏性主导。

## 数值黏度如何封顶雷诺数

雷诺数 $Re=UL/\nu$。取 $U=1.0\ \mathrm{m/s}$、$L=0.10\ \mathrm{m}$、$\nu=1.006\times10^{-6}\ \mathrm{m^2/s}$，真实 $Re=9.94\times10^4$。但求解器实际感受到的是 $\nu+\nu_{\mathrm{art}}=2.251\times10^{-3}\ \mathrm{m^2/s}$，对应 $Re_{\mathrm{eff}}=UL/(\nu+\nu_{\mathrm{art}})=1.0\times0.10/2.251\times10^{-3}=44.4$。也就是说，用 $\alpha_\Pi=0.05$ 的默认设置，无论怎么加密都只能得到 $Re\approx44$ 的流动。要模拟高雷诺数问题，必须把 $\alpha_\Pi$ 降到 $0.01$ 以下并配 Balsara 开关，或改用层流项承担全部物理黏性。

## Balsara 开关把耗散限制在激波处

Balsara 提出用当地压缩与剪切之比调制 $\alpha$：

$$
f_i=\frac{\left|\nabla\cdot\mathbf{v}\right|_i}{\left|\nabla\cdot\mathbf{v}\right|_i+\left|\nabla\times\mathbf{v}\right|_i+0.0001\,c_i/h_i},\qquad \alpha_i=\alpha_0 f_i
$$

纯剪切区 $\nabla\cdot\mathbf{v}\to0$ 时 $f_i\to0$，人工黏性自动关闭，涡结构得以保留；激波处 $\nabla\times\mathbf{v}\to0$、$\nabla\cdot\mathbf{v}$ 大，$f_i\to1$，耗散恢复。分母的 $0.0001c_i/h_i$ 是防止两者同时为零的奇异性项，量级上等于 $0.0001\times30/0.012=0.25\ \mathrm{s^{-1}}$。

## 失效边界与判定信号

层流项在 $\epsilon h^2$ 与 $\lvert\mathbf{x}_{ij}\rvert^2$ 可比时失效：$\sqrt{\epsilon}h=0.1\times0.012=1.2\times10^{-3}\ \mathrm{m}$，即粒子间距小于 $1.2\ \mathrm{mm}$ 时该项被正则化主导，此时应改用更高阶的拉普拉斯算子。人工黏性在拉伸区（$\mathbf{v}_{ij}\cdot\mathbf{x}_{ij}>0$）完全不激活，因此它无法抑制拉伸不稳定性，后者需靠应力正则化处理。若关闭 $\alpha_\Pi$ 后流场立即出现高频振荡，说明数值黏性在承担本应由分辨率承担的稳定作用，此时应先加密而非恢复 $\alpha$。

```
# 黏性加速度：层流项 + Balsara 调制的人工黏性
for i in range(N):
    for j in neighbors[i]:
        vij, xij = v[i]-v[j], x[i]-x[j]
        r2  = dot(xij, xij) + 1e-2*h*h
        # 层流（物理）项
        mu_ij = (mu[i]+mu[j]) / (rho[i]*rho[j])
        a_visc[i] += m[j]*mu_ij*dot(vij,xij)/r2 * gradW(xij,h)
        # 人工黏性（数值）项，仅接近时激活
        if dot(vij, xij) < 0:
            phi  = h*dot(vij,xij)/r2
            cbar = 0.5*(cs[i]+cs[j]); rbar = 0.5*(rho[i]+rho[j])
            Pi   = (-alpha*Balsara[i]*cbar*phi + beta*phi*phi)/rbar
            a_pres[i] -= m[j]*Pi*gradW(xij,h)
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 涡结构迅速衰减、涡量对消 | 人工黏性过大，数值黏度主导 | 由 $\alpha_\Pi c_s h/8$ 算 $\nu_{\mathrm{art}}$，与 $\nu$ 比较量级 |
| 冲击后出现高频振荡 | 线性项 $\alpha_\Pi$ 偏小或 $\beta_\Pi$ 未启用 | 固定 $\alpha_\Pi$ 扫 $\beta_\Pi=0,1,2$，看冲击后密度振荡幅值 |
| 剪切层被过度抹平 | 缺少 Balsara 开关，剪切区也在耗散 | 对比开/关 Balsara 后涡量峰值 |
| 加密后仍达不到目标 $Re$ | 数值黏度封顶了有效雷诺数 | 算 $Re_{\mathrm{eff}}=UL/(\nu+\nu_{\mathrm{art}})$ |
| 粒子近距离时加速度爆增 | $\epsilon h^2$ 正则化不足 | 检查最小粒子间距是否低于 $1.2\times10^{-3}\ \mathrm{m}$ |

## 参考

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
2. Monaghan J.J., Gingold R.A., *Shock simulation by the particle method SPH*, Journal of Computational Physics, Vol. 52, 1983.
3. Morris J.P., Fox P.J., Zhu Y., *Modeling low Reynolds number incompressible flows using SPH*, Journal of Computational Physics, Vol. 136, 1997.
4. Balsara D.S., *von Neumann stability analysis of smoothed particle hydrodynamics—suggestions for optimal algorithms*, Journal of Computational Physics, Vol. 121, 1995.
5. Español P., Revenga M., *Smoothed dissipative particle dynamics*, Physical Review E, Vol. 67, 2003.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
