---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-validation-poiseuille-diagnosis-validation
title: "Poiseuille 流：结果诊断与可信度验证"
summary: "用平面 Poiseuille 解析剖面与流量作标尺，给出中心线速度、壁面剪切、流量误差和近壁粒子亏缺的诊断阈值，并演示由压力梯度反算解析值与三档收敛阶的手算。"
category:
  slug: meshfree-validation
  name: "无网格法验证与基准"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法验证与基准"
  - "Poiseuille 流"
  - "结果诊断与可信度验证"
  - "抛物线剖面"
  - "壁面无滑移"
seo:
  title: "Poiseuille 流：结果诊断与可信度验证"
  description: "用平面 Poiseuille 解析剖面与流量作标尺，给出中心线速度、壁面剪切、流量误差和近壁粒子亏缺的诊断阈值，并演示由压力梯度反算解析值与三档收敛阶的手算。"
  keywords:
    - "Poiseuille 流"
    - "结果诊断与可信度验证"
    - "抛物线速度剖面"
    - "壁面无滑移"
    - "流量守恒"
---

# Poiseuille 流：结果诊断与可信度验证

压力驱动的 Poiseuille 流有闭式解，是检验黏性项、壁面无滑移与压力梯度施加方式最直接的基准。诊断它时，中心线速度接近解析值只能说明一半，还需要壁面剪切、流量积分和近壁粒子亏缺三项同时过关。本文给出各诊断量的解析参照、阈值，以及从压力梯度反算解析值的手算过程。

## 抛物线剖面给出全套解析参照

在两块平行平板之间、宽度为 $d$ 的通道内，充分发展的平面 Poiseuille 流速度剖面为

$$
u(y)=\frac{G}{2\mu}\,y\,(d-y),\qquad 0\le y\le d,
$$

其中 $G=-\dfrac{\mathrm{d}p}{\mathrm{d}x}$ 为压力梯度（$\mathrm{Pa/m}$），$\mu$ 为动力黏度（$\mathrm{Pa\cdot s}$）。由该式可直接得到三个可独立核对的量：

$$
u_{\max}=\frac{G d^{2}}{8\mu},\qquad
\bar{u}=\frac{2}{3}u_{\max},\qquad
Q=\frac{G d^{3}}{12\mu},
$$

$Q$ 为单位厚度流量（$\mathrm{m^2/s}$）。这三个量的好处是量纲清晰、互相约束：任何一项算错都会与另两项冲突。

一次可核对的手算：取通道宽 $d=0.01\ \mathrm{m}$、压力梯度 $G=1.0\ \mathrm{Pa/m}$、水 $\mu=1.0\times10^{-3}\ \mathrm{Pa\cdot s}$、$\rho=1000\ \mathrm{kg/m^3}$。则

$$
u_{\max}=\frac{1.0\times(0.01)^{2}}{8\times10^{-3}}=\frac{1.0\times10^{-4}}{8\times10^{-3}}=0.0125\ \mathrm{m/s},
$$

$$
Q=\frac{1.0\times(0.01)^{3}}{12\times10^{-3}}=\frac{1.0\times10^{-6}}{1.2\times10^{-2}}=8.33\times10^{-5}\ \mathrm{m^2/s},
$$

$\bar{u}=2/3\times0.0125=0.00833\ \mathrm{m/s}$，壁面剪切 $\tau_w=Gd/2=0.005\ \mathrm{Pa}$，雷诺数 $Re=\rho\bar{u}d/\mu=1000\times0.00833\times0.01/10^{-3}=83.3$，属于层流。这些数字应作为验收卡片的固定基准。

## 剖面 L2 误差与观测收敛阶

把数值剖面按等 $y$ 间隔插值后，用相对 L2 误差度量剖面偏离：

$$
E_{u}=\left(\frac{1}{N}\sum_{n=1}^{N}\left(u_{n}-u^{\mathrm{exact}}_{n}\right)^{2}\right)^{1/2}\Big/\bar{u},
$$

$N$ 为插值点数，分母用平均速度而非峰值，避免中心线单点误差主导。三档粒子间距的误差给出观测收敛阶

$$
p=\frac{\ln\!\left(E_{2}/E_{1}\right)}{\ln\!\left(\Delta x_{2}/\Delta x_{1}\right)} .
$$

一次手算：取 $\Delta x=1.0,0.5,0.25\ \mathrm{mm}$，测得 $E_1=0.0031$、$E_2=0.0089$、$E_3=0.0250$。则

$$
p_{12}=\frac{\ln(0.0089/0.0031)}{\ln 2}=\frac{1.055}{0.693}=1.52,\qquad
p_{23}=\frac{\ln(0.0250/0.0089)}{\ln 2}=\frac{1.033}{0.693}=1.49 .
$$

两段阶次稳定在 1.5 左右，说明黏性离散在内部区已达渐近；若近壁区单独统计出的阶次只有 0.5，问题集中在边界处理而非内部格式。

## 近壁粒子亏缺是最常见的偏差来源

无网格法在固壁附近支持域被截断，导致密度亏缺、黏性力被低估，表现为剖面在壁面附近"翘起"、壁面剪切偏小。诊断方法有三条：其一，检查最靠近壁面的粒子是否落在 $\Delta x/2$ 以内，若最近粒子距离壁面超过 $0.6\Delta x$，无滑移条件会明显松弛；其二，比较近壁三层粒子的速度与解析剖面的偏差，要求相对偏差小于 $2\%$；其三，核对邻居数，二维内部区应约 21 个，近壁区若降到 12 以下需要加边界粒子层。对 $d=0.01\ \mathrm{m}$、$\Delta x=0.25\ \mathrm{mm}$，通道内共有 40 层粒子，近壁三层对应 $y<0.75\ \mathrm{mm}$，该区间解析速度从 0 增至 $u(0.00075)=1.0\times0.00075\times0.00925/(2\times10^{-3})=0.00347\ \mathrm{m/s}$，可直接作为逐层对照表。

## 流量守恒与稳态判据

流量 $Q$ 的数值值由 $\int_0^d u\,\mathrm{d}y$ 数值积分得到，验收阈值取相对误差 $\lvert Q_{\mathrm{num}}-Q\rvert/Q\le 1\%$。稳态判据不能只看速度场是否停止变化，而应同时监控：动能变化率小于初值的 $10^{-4}\ \mathrm{s^{-1}}$、以及驱动压力梯度与黏性阻力积分之比在 1% 内闭合。若压力梯度施加为体积力 $g_x=G/\rho=1.0\ \mathrm{m/s^2}$，则每步动量输入应与壁面动量通量平衡，这一平衡被破坏通常意味着周期方向存在非物理反射。

## 诊断脚本

```python
import numpy as np

d, G, mu, rho = 0.01, 1.0, 1.0e-3, 1000.0   # m, Pa/m, Pa.s, kg/m^3

def exact_profile(y, G=G, mu=mu, d=d):
    return G / (2 * mu) * y * (d - y)

umax = G * d**2 / (8 * mu)          # 0.0125 m/s
Q    = G * d**3 / (12 * mu)         # 8.33e-5 m^2/s
ubar = 2 / 3 * umax                 # 0.00833 m/s
tau_w = G * d / 2                   # 0.005 Pa
print("umax=%.5f Q=%.3e ubar=%.5f tau_w=%.5f" % (umax, Q, ubar, tau_w))

def profile_error(u_num, y, ubar=ubar):
    u_ref = exact_profile(y)
    return np.sqrt(np.mean((u_num - u_ref)**2)) / ubar

def order(E1, E2, dx1, dx2):
    return np.log(E2 / E1) / np.log(dx2 / dx1)

print("p12 =", order(0.0031, 0.0089, 1.0e-3, 0.5e-3))   # 1.52
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 剖面整体偏低但形状正确 | 体积力与黏性项量纲不匹配，或 $\mu$ 单位误用 | 用 $u_{\max}=Gd^{2}/(8\mu)=0.0125\ \mathrm{m/s}$ 直接核对峰值 |
| 近壁速度"翘起" | 固壁支持域被截断，密度亏缺 | 逐层比对近壁三层与解析值，检查偏差是否超 2% |
| 中心线速度对分辨率不敏感 | 中心线是驻点区，误差被平滑掉 | 改看流量积分 $Q$ 与壁面剪切随 $\Delta x$ 的变化 |
| 流量始终偏大 3%～5% | 无滑移未生效，等效滑移速度非零 | 检查最近粒子距壁面距离是否大于 $0.6\Delta x$ |
| 稳态后仍有低频振荡 | 周期方向声波未耗散，弱可压缩声速偏低 | 把 $c_0$ 提高一倍重跑，看振荡是否消失 |
| 收敛阶只有 0.5 | 近壁低阶误差主导全域统计 | 把统计区间限制在 $0.2d<y<0.8d$ 内重算 $p$ |

## 复核与参考文献

验收需同时满足 $E_u<1\%$、$\lvert Q_{\mathrm{num}}-Q\rvert/Q\le1\%$、$p\in[1.3,2.2]$ 且近壁偏差小于 2%。参考文献：

1. Poiseuille, J. L. M., "Recherches expérimentales sur le mouvement des liquides dans les tubes de très petits diamètres," *Comptes Rendus*, 11, 1840, pp. 961–967.
2. Morris, J. P., Fox, P. J., Zhu, Y., "Modeling low Reynolds number incompressible flows using SPH," *Journal of Computational Physics*, 136(1), 1997, pp. 214–226.
3. Monaghan, J. J., "Simulating Free Surface Flows with SPH," *Journal of Computational Physics*, 110(2), 1994, pp. 399–406.
4. Adami, S., Hu, X. Y., Adams, N. A., "A generalized wall boundary condition for smoothed particle hydrodynamics," *Journal of Computational Physics*, 231(21), 2012, pp. 7057–7075.
5. Violeau, D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Liu, G. R., Liu, M. B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
7. SPHERIC, "SPHERIC Benchmark Test Cases," ERCOFTAC SPHERIC Workshop benchmark suite.
