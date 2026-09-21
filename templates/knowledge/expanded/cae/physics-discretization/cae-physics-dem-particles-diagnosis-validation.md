---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-dem-particles-diagnosis-validation
title: "离散元与颗粒接触：结果诊断与可信度验证"
summary: "用单颗粒自由落体与弹跳、Hertz 力—位移曲线、堆积分数与休止角三类基准验收 DEM 实现，给出时间步独立性、能量平衡与接触统计的具体阈值、判定试验与可复算脚本。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "离散元与颗粒接触"
  - "结果诊断与可信度验证"
  - "休止角"
  - "配位数"
seo:
  title: "离散元与颗粒接触：结果诊断与可信度验证"
  description: "用单颗粒自由落体与弹跳、Hertz 力—位移曲线、堆积分数与休止角三类基准验收 DEM 实现，给出时间步独立性、能量平衡与接触统计的具体阈值、判定试验与可复算脚本。"
  keywords:
    - "离散元"
    - "结果诊断与可信度验证"
    - "休止角"
    - "配位数"
    - "能量平衡"
---

# 离散元与颗粒接触：结果诊断与可信度验证

DEM 的结果可信度不能靠宏观云图判断，因为刚度软化、阻尼符号错误、接触漏检都会给出「看起来正常」的堆积形态。可用的独立证据有四类：单颗粒运动学的解析解、Hertz 力—位移曲线的解析关系、堆积统计量（孔隙率、配位数、休止角）的实验区间、以及时间步独立性与能量平衡。下面给出各基准的数值、阈值与判定试验。

## 四类基准与验收量

单颗粒基准检验积分器与接触检测，验收量是落体时间与反弹高度；Hertz 基准检验接触力模型，验收量是力—位移曲线的指数与刚度；堆积统计基准检验摩擦与生成方式，验收量是孔隙率、配位数与休止角；时间步基准检验稳定性与精度，验收量是最大重叠量随步长的收敛率。

## 单颗粒自由落体与弹跳恢复

高度 $h_0$ 自由落体到底面的解析结果为

$$
v_{\mathrm{in}}=\sqrt{2gh_0},
\qquad
t_{\mathrm{fall}}=\sqrt{\frac{2h_0}{g}},
\qquad
h_{\mathrm{reb}}=e^2h_0 .
$$

取 $h_0=0.1\,\mathrm{m}$、$g=9.81\,\mathrm{m/s^2}$：$v_{\mathrm{in}}=1.401\,\mathrm{m/s}$，$t_{\mathrm{fall}}=0.1428\,\mathrm{s}$。设定 $e=0.527$（对应 $\zeta=0.2$）时，反弹速度应为 $0.738\,\mathrm{m/s}$，反弹高度 $h_{\mathrm{reb}}=0.2777\times0.1=27.8\,\mathrm{mm}$。数值结果与解析值的偏差应低于 $2\%$（落体时间）与 $5\%$（反弹高度，因为高度对 $e$ 是二次敏感）。若反弹高度系统性偏低 $10\%$ 以上，先查阻尼是否施加在绝对速度上，再查接触检测是否在颗粒尚未分离时反复触发。

## Hertz 力—位移曲线对照

法向接触力必须满足

$$
F_n=\frac{4}{3}E^*\sqrt{R^*}\,\delta^{3/2},
$$

即双对数斜率恰为 $1.5$。取玻璃珠 $R=1\,\mathrm{mm}$、$E=70\,\mathrm{GPa}$、$\nu=0.22$，得 $E^*=70\times10^{9}/(2\times0.9516)=3.678\times10^{10}\,\mathrm{Pa}$、$R^*=5\times10^{-4}\,\mathrm{m}$。在 $F_n=1\,\mathrm{N}$ 时 $\delta=(3/(4\times3.678\times10^{10}\times0.02236))^{2/3}=9.41\times10^{-7}\,\mathrm{m}$，即 $0.94\,\mu\mathrm{m}$，$\delta/R=0.094\%$；该点切线刚度 $k_n=2E^*\sqrt{R^*\delta}=1.60\times10^{6}\,\mathrm{N/m}$。验证方法是让求解器输出若干 $\delta$ 对应的 $F_n$，在双对数坐标下拟合斜率：斜率偏离 $1.5$ 超过 $2\%$ 说明接触模型被写成了线性弹簧，或重叠量被几何检测截断。线性弹簧模型的等效刚度应取参考重叠处的割线值 $k_n^{\mathrm{lin}}=\frac{4}{3}E^*\sqrt{R^*\delta_{\mathrm{ref}}}$，$0.94\,\mu\mathrm{m}$ 处为 $1.06\times10^{6}\,\mathrm{N/m}$。

## 堆积分数与休止角基准

堆积统计量有明确的实验区间，可直接作为验收带：

| 指标 | 随机松散堆积 | 随机密堆积 | 玻璃珠实验 |
|---|---|---|---|
| 固体体积分数 $\phi$ | 0.60 | 0.64 | 0.60~0.62 |
| 平均配位数 $z$ | 4.5~5.5 | 6.0~7.0 | 4.8~5.6 |
| 休止角 | — | — | $23^\circ\sim28^\circ$ |

配位数由接触对数量定义：$z=2N_c/N_p$。孔隙率偏高 $3\%$ 以上通常意味着滚动摩擦过大或生成阶段留下了初始孔隙；配位数偏低则说明接触检测漏检或刚度太小让弱接触被忽略。休止角是摩擦标定的最终验收量：若模型给出 $21^\circ$ 而实验为 $25^\circ$，把滚动摩擦系数从 $0.05$ 调到 $0.10$ 通常即可对齐，但必须同时复查孔隙率是否仍在 $0.60\sim0.62$。

## 时间步独立性与能量平衡

最大重叠量随步长线性收敛，可作为精度指标：

| $\alpha=\Delta t/\Delta t_{\mathrm{Ray}}$ | 最大 $\delta/R$ | 收敛比 |
|---|---|---|
| 0.40 | $2.20\times10^{-3}$ | — |
| 0.20 | $1.10\times10^{-3}$ | 2.00 |
| 0.10 | $5.50\times10^{-4}$ | 2.00 |

收敛比为 $2$ 说明格式对 $\Delta t$ 是一阶的，与显式中心差分一致；外推的最大重叠量趋于零。若收敛比只有 $1.2$，说明接触力在步内被多次触发或存在刚性约束冲突。能量平衡用总能量 $E_{\mathrm{tot}}=E_k+E_p+E_{\mathrm{contact}}$ 核对：无阻尼弹性碰撞（$\zeta=0$、$e=1$）时每 $1000$ 步的相对漂移应低于 $0.05\%$；有阻尼时每次碰撞的动能按 $e^2$ 衰减，$e=0.9$ 对应单次损失 $19\%$，可与实测衰减曲线逐次对照。静床底部压力还可与 $\rho_{\mathrm{bulk}}gH$ 对照：$\phi=0.61$、$\rho=2500\,\mathrm{kg/m^3}$ 时 $\rho_{\mathrm{bulk}}=1525\,\mathrm{kg/m^3}$，床高 $0.5\,\mathrm{m}$ 的底部压力为 $7.48\,\mathrm{kPa}$。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 落体时间比 $0.1428\,\mathrm{s}$ 偏长 | 积分器被大时间步引入额外阻尼 | 把 $\Delta t$ 减半重跑，落体时间应向 $0.1428\,\mathrm{s}$ 收敛 |
| 反弹高度低于 $27.8\,\mathrm{mm}$ 超过 $10\%$ | 阻尼施加在绝对速度或接触重复触发 | 用单颗粒算例输出速度时程，检查接触事件计数 |
| 双对数力—位移斜率偏离 $1.5$ | 接触模型写成线性弹簧或被截断 | 输出多组 $(\delta,F_n)$ 并拟合斜率 |
| 孔隙率高于 $0.62$ | 滚动摩擦过大或生成留下初始孔隙 | 把 $\mu_r$ 从 $0.10$ 降到 $0.05$，并延长生成后松弛步数 |
| 配位数低于 $4.8$ | 接触检测漏检或刚度太小 | 统计接触对数量并检查格子尺寸是否大于 $d_{\max}+r_{\mathrm{skin}}$ |
| 休止角只有 $21^\circ$ 而实验为 $25^\circ$ | 未设滚动摩擦 | 把 $\mu_r$ 调到 $0.10$ 并复查孔隙率 |
| 最大重叠量随步长的收敛比只有 $1.2$ | 步内多次触发接触或存在约束冲突 | 输出每步接触事件数，正常应接近 $1$ |
| 无阻尼时总能量每千步漂移超过 $0.05\%$ | 积分器非辛或软化倍数过大 | 换用速度 Verlet 并把 $s$ 从 $20$ 降到 $10$ |

## 可复算的验证脚本

```python
import math
g, h0, e = 9.81, 0.1, 0.527
print(f"v_in={math.sqrt(2*g*h0):.4f} m/s  t_fall={math.sqrt(2*h0/g):.4f} s")
print(f"h_reb={e*e*h0*1e3:.2f} mm  v_out={e*math.sqrt(2*g*h0):.4f} m/s")

R1, E1, nu1, Fn = 1e-3, 70e9, 0.22, 1.0
Es = E1/(2*(1-nu1**2)); Rs = R1/2
d  = (3*Fn/(4*Es*math.sqrt(Rs)))**(2/3)
kn = 2*Es*math.sqrt(Rs*d)
kl = 4.0/3.0*Es*math.sqrt(Rs*d)
print(f"Estar={Es:.3e} delta={d*1e6:.3f}um d/R={d/R1*100:.3f}% "
      f"kn={kn:.2e} k_lin={kl:.2e} N/m")

phi, rho, H = 0.61, 2500.0, 0.5
print(f"rho_bulk={phi*rho:.0f} kg/m3  p_bottom={phi*rho*g*H:.0f} Pa")
# v_in=1.4007 m/s  t_fall=0.1428 s
# h_reb=27.77 mm  v_out=0.7382 m/s
# Estar=3.678e+10 delta=0.941um d/R=0.094% kn=1.60e+06 k_lin=1.06e+06 N/m
# rho_bulk=1525 kg/m3  p_bottom=7479 Pa
```

## 参考文献

1. Cundall, P. A. & Strack, O. D. L. A discrete numerical model for granular assemblies. *Géotechnique*, 29(1): 47-65, 1979.
2. Mindlin, R. D. Compliance of elastic bodies in contact. *Journal of Applied Mechanics*, 16(3): 259-268, 1949.
3. Johnson, K. L. *Contact Mechanics*. Cambridge University Press, 1985.
4. Li, Y., Xu, Y. & Thornton, C. A comparison of discrete element simulations and experiments for sandpiles composed of spherical particles. *Powder Technology*, 160(3): 219-228, 2005.
5. O'Sullivan, C. *Particulate Discrete Element Modelling: A Geomechanics Perspective*. Spon Press, 2011.
6. Zhu, H. P., Zhou, Z. Y., Yang, R. Y. & Yu, A. B. Discrete particle simulation of particulate systems: theoretical developments. *Chemical Engineering Science*, 62(13): 3378-3396, 2007.