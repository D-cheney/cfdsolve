---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-viscosity-models-diagnosis-validation
title: "物理与人工黏性：结果诊断与可信度验证"
summary: "用 Taylor-Green 涡解析衰减率、Poiseuille 抛物线剖面与耗散能量预算三项独立基准分离物理耗散与数值耗散，给出由实测衰减率反算等效黏度与等效 α 的手算流程及 Balsara 开关读数阈值。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "物理与人工黏性"
  - "结果诊断与可信度验证"
  - "Taylor-Green 涡"
  - "Balsara 开关"
seo:
  title: "物理与人工黏性：结果诊断与可信度验证"
  description: "用 Taylor-Green 涡解析衰减率、Poiseuille 抛物线剖面与耗散能量预算三项独立基准分离物理耗散与数值耗散，给出由实测衰减率反算等效黏度与等效 α 的手算流程及 Balsara 开关读数阈值。"
  keywords:
    - "物理与人工黏性"
    - "结果诊断与可信度验证"
    - "Taylor-Green 涡"
    - "Balsara 开关"
    - "Poiseuille"
---

# 物理与人工黏性：结果诊断与可信度验证

"结果太黏"至少有三个来源：真实物性、Monaghan 型人工黏性、分辨率不足带来的隐式耗散。三者都让动能单调下降，单看能量曲线无法区分。本文用 Taylor-Green 涡衰减率、Poiseuille 剖面与耗散预算三项基准把它们分开，并给出反算等效黏度的流程。

## 两个黏性项的离散形式

层流黏性用对称化的 Morris 形式，保证粒子间黏性力成对：

$$
\mathbf{a}_{\nu,i}=\sum_j m_j\frac{2\mu_i\mu_j}{\mu_i+\mu_j}\cdot\frac{\mathbf{v}_{ij}\cdot\mathbf{x}_{ij}}{|\mathbf{x}_{ij}|^2+\epsilon h^2}\nabla_iW_{ij}
$$

其中 $\mathbf{v}_{ij}=\mathbf{v}_i-\mathbf{v}_j$、$\mathbf{x}_{ij}=\mathbf{x}_i-\mathbf{x}_j$、$\epsilon=0.01$ 防止粒子接近时除零。人工黏性伴随压力项出现：

$$
\Pi_{ij}=-\alpha\frac{c_sh\,\mathbf{v}_{ij}\cdot\mathbf{x}_{ij}}{\bar\rho_{ij}\left(|\mathbf{x}_{ij}|^2+\epsilon h^2\right)},\qquad \mathbf{v}_{ij}\cdot\mathbf{x}_{ij}<0\ \text{时才激活}
$$

$\alpha$ 的工程取值是 0.01~0.1：激波主导取 0.1 附近，剪切主导取 0.01~0.02。

## 由 Taylor-Green 涡衰减率反算等效黏度

二维 Taylor-Green 涡的速度幅值按解析解衰减：

$$
u(t)=u_0\exp\left(-2\nu k^2t\right),\qquad k=\frac{2\pi}{L}
$$

取 $u_0=1.0\ \mathrm{m/s}$、$L=1.0\ \mathrm{m}$，则 $k=6.2832\ \mathrm{rad/m}$、$k^2=39.478\ \mathrm{rad^2/m^2}$。20 °C 水 $\nu=1.006\times10^{-6}\ \mathrm{m^2/s}$，$t=1.0\ \mathrm{s}$ 的衰减因子为 $\exp(-2\times1.006\times10^{-6}\times39.478)=0.99992$，幅值仅降 0.008%。人工黏性按 $\nu_{\text{art}}\approx\alpha c_sh/8$ 折算，取 $\alpha=0.05$、$c_s=30\ \mathrm{m/s}$、$h=0.012\ \mathrm{m}$ 得 $\nu_{\text{art}}=2.25\times10^{-3}\ \mathrm{m^2/s}$，衰减因子变为 $\exp(-0.1777)=0.837$，幅值下降 16.3%。两者相差约 2000 倍，实测衰减率因此可唯一确定有效黏度：

$$
\nu_{\text{eff}}=-\frac{\ln\left(u(t)/u_0\right)}{2k^2t}
$$

若实测 $t=1.0\ \mathrm{s}$ 时 $u/u_0=0.96$，则 $\nu_{\text{eff}}=0.040822/78.956=5.17\times10^{-4}\ \mathrm{m^2/s}$，反算 $\alpha_{\text{eff}}=8\times5.17\times10^{-4}/(30\times0.012)=0.0115$。该值落在 0.01~0.02 区间，与设定的 0.05 不符，说明额外耗散来自邻居数不足而非黏性系数本身。

## Poiseuille 剖面：分辨率不足会伪装成黏性

压力驱动槽道流有解析抛物线剖面：

$$
u(y)=\frac{G}{2\mu}y(H-y),\qquad u_{\max}=\frac{GH^2}{8\mu}
$$

取 $H=0.010\ \mathrm{m}$、$G=1.0\ \mathrm{Pa/m}$、$\mu=1.004\times10^{-3}\ \mathrm{Pa\cdot s}$，得 $u_{\max}=1.0\times10^{-4}/(8\times1.004\times10^{-3})=1.245\times10^{-2}\ \mathrm{m/s}$，$Re=998.2\times1.245\times10^{-2}\times0.010/1.004\times10^{-3}=124$，抛物线剖面应被严格保持。叠加 $\nu_{\text{art}}=2.25\times10^{-3}\ \mathrm{m^2/s}$ 后 $Re_{\text{eff}}=1.245\times10^{-4}/2.251\times10^{-3}=0.055$，剖面被压成接近塞流；判据是中心速度与 $1.245\times10^{-2}\ \mathrm{m/s}$ 的偏差小于 3%。

## Balsara 开关读数

剪切区不需要激波级黏性，开关用散度与旋度之比给出逐粒子权重：

$$
f_i=\frac{|\nabla\cdot\mathbf{v}_i|}{|\nabla\cdot\mathbf{v}_i|+|\nabla\times\mathbf{v}_i|+10^{-4}c_s/h}
$$

人工黏性乘 $(f_i+f_j)/2$。纯剪切层中 $|\nabla\times\mathbf{v}|\gg|\nabla\cdot\mathbf{v}|$，$f\approx0.05$；正激波中散度主导，$f\approx1.00$。取 $c_s=30\ \mathrm{m/s}$、$h=0.012\ \mathrm{m}$，正则项为 $10^{-4}\times30/0.012=0.25\ \mathrm{s^{-1}}$。

## 耗散能量预算

$\dot E_{\text{diss}}=\sum_im_i(\mathbf{a}_{\nu,i}+\mathbf{a}_{\Pi,i})\cdot\mathbf{v}_i$ 分别统计层流项与人工项，人工占比应与 $\nu_{\text{art}}/(\nu+\nu_{\text{art}})=2.25\times10^{-3}/(1.006\times10^{-6}+2.25\times10^{-3})=0.9996$ 一致。层流算例中 99.96% 的耗散来自人工黏性，这本身就是错误信号。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 涡量峰值快速下降 | 人工黏性主导 | 由 TGV 衰减反算 $\nu_{\text{eff}}$，与 $1.006\times10^{-6}\ \mathrm{m^2/s}$ 比较 |
| 槽道剖面被压平 | 有效雷诺数从 124 掉到 0.055 | 比较中心速度与 $1.245\times10^{-2}\ \mathrm{m/s}$ |
| 近壁速度不衰减到零 | 缺无滑移切向约束 | 提取近壁 $0.5h$ 内速度剖面 |
| 反算 $\alpha_{\text{eff}}=0.0115$ 却设定 0.05 | 邻居数不足产生额外隐式耗散 | 统计平均邻居数，二维应不低于 20 |
| 剪切区耗散过大 | 未启用 Balsara 开关 | 打印 $f_i$ 分布，剪切区应为 0.05 量级 |

## 反算脚本

```python
import numpy as np

def nu_eff(u0, u_t, L, t):          # Taylor-Green 反算等效黏度
    return -np.log(u_t / u0) / (2.0 * (2.0 * np.pi / L) ** 2 * t)

def alpha_eff(nu, cs, h):           # nu_art ~ alpha*cs*h/8
    return 8.0 * nu / (cs * h)

def poiseuille(H, G, mu, rho0):     # 解析剖面与雷诺数
    u_max = G * H**2 / (8.0 * mu)
    return u_max, rho0 * u_max * H / mu

def balsara(div_v, curl_v, cs, h):
    return abs(div_v) / (abs(div_v) + abs(curl_v) + 1e-4 * cs / h)

print(nu_eff(1.0, 0.96, 1.0, 1.0))             # 5.17e-4 m^2/s
print(alpha_eff(5.17e-4, 30.0, 0.012))         # 0.0115
print(poiseuille(0.010, 1.0, 1.004e-3, 998.2)) # (0.01245, 124.0)
print(balsara(0.0, 40.0, 30.0, 0.012))         # ~0.0   纯剪切
print(balsara(40.0, 0.0, 30.0, 0.012))         # ~0.99  纯压缩
```

判读顺序：先反算 $\nu_{\text{eff}}$，若比物理黏度大两个量级以上则问题在人工黏性；再核对 $Re$ 是否从 124 掉到 0.055 量级；最后看剪切区 $f$ 是否接近 0.05。

## 参考

1. Taylor G.I., Green A.E., *Mechanism of the production of small eddies from large ones*, Proceedings of the Royal Society A, Vol. 158, 1937.
2. Morris J.P., Fox P.J., Zhu Y., *Modeling low Reynolds number incompressible flows using SPH*, Journal of Computational Physics, Vol. 136, 1997.
3. Balsara D.S., *von Neumann stability analysis of smoothed particle hydrodynamics—suggestions for optimal algorithms*, Journal of Computational Physics, Vol. 121, 1995.
4. Español P., Revenga M., *Smoothed dissipative particle dynamics*, Physical Review E, Vol. 67, 2003.
5. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
