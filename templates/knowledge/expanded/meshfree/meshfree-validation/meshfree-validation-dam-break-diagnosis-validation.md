---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-validation-dam-break-diagnosis-validation
title: "溃坝自由表面基准：结果诊断与可信度验证"
summary: "以 Martin & Moyce 无量纲前缘曲线为参照，给出溃坝基准前缘位置误差、质量漂移、压力尖峰三类诊断量的阈值与三档粒子间距的观测收敛阶算法，并附可核对的手算与提取脚本。"
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
  - "溃坝自由表面基准"
  - "结果诊断与可信度验证"
  - "Martin-Moyce 前缘曲线"
  - "质量守恒预算"
seo:
  title: "溃坝自由表面基准：结果诊断与可信度验证"
  description: "以 Martin & Moyce 无量纲前缘曲线为参照，给出溃坝基准前缘位置误差、质量漂移、压力尖峰三类诊断量的阈值与三档粒子间距的观测收敛阶算法，并附可核对的手算与提取脚本。"
  keywords:
    - "溃坝自由表面基准"
    - "结果诊断与可信度验证"
    - "Martin-Moyce 前缘曲线"
    - "SPH 质量守恒"
    - "观测收敛阶"
---

# 溃坝自由表面基准：结果诊断与可信度验证

溃坝基准是否可信，不取决于末态水形看起来像不像，而取决于三件事：前缘位置能否落进 Martin & Moyce 无量纲曲线的容差带、水体质量相对漂移能否压到千分之一以内、压力峰值是否随粒子加密单调收敛。本文给出这三条诊断线的参照数据与阈值，并演示一次从三档粒子间距反算观测收敛阶的手算过程。

## 无量纲前缘曲线是最稳定的参照量

Martin & Moyce 在 1952 年用矩形水柱坍塌实验给出了前缘位置的无量纲曲线，它是溃坝基准中最不依赖数值细节的观测量，因为曲线只由重力和初始宽度决定，黏性、表面张力和壁面模型的影响都被折叠掉了。设水柱初始宽度为 $a$，前缘水平位置为 $x$，则

$$
x^{*}=\frac{x}{a},\qquad t^{*}=t\sqrt{\frac{2g}{a}} .
$$

式中 $g=9.81\ \mathrm{m/s^2}$，$a$ 为水柱初始宽度（m），$t$ 为物理时间（s）。该式的用途是让不同尺度的坍塌实验落到同一条曲线上，物理时间尺度随 $1/\sqrt{a}$ 缩放。

以 SPHERIC 与 SPHysics 常用的二维溃坝算例为例：水柱宽 $a=0.146\ \mathrm{m}$、初始高 $0.292\ \mathrm{m}$（长高比 2），闸门后蓄水长度 $0.584\ \mathrm{m}$。其时间尺度为

$$
\sqrt{\frac{2g}{a}}=\sqrt{\frac{2\times 9.81}{0.146}}=11.59\ \mathrm{s^{-1}} .
$$

由此 $t^{*}=1.0$ 对应物理时间 $t=1.0/11.59=0.0863\ \mathrm{s}$，而数字化读出的前缘约 $x^{*}\approx1.30$，换算成绝对位置 $x=1.30\times0.146=0.190\ \mathrm{m}$。若报告里把 $t^{*}$ 与物理时间混用，前缘曲线会整体错位，这是最常见的一类"假发散"。

## 前缘误差与观测收敛阶

把前缘曲线按等间隔的 $t^{*}$ 采样点离散后，用相对 L2 范数度量误差：

$$
E_{x}=\left(\frac{1}{N}\sum_{n=1}^{N}\left(x^{*}_{n}-x^{*,\mathrm{ref}}_{n}\right)^{2}\right)^{1/2},
$$

其中 $N$ 为采样点数，$x^{*,\mathrm{ref}}$ 取 Martin & Moyce 数字化曲线或高分辨率参考解。三档粒子间距 $\Delta x_1<\Delta x_2<\Delta x_3$ 上的误差 $E_1,E_2,E_3$ 给出观测收敛阶

$$
p=\frac{\ln\!\left(E_{2}/E_{1}\right)}{\ln\!\left(\Delta x_{2}/\Delta x_{1}\right)} .
$$

一次可核对的手算：取 $\Delta x=2,4,8\ \mathrm{mm}$ 三档，在 $t^{*}=0.5\sim2.0$ 区间上测得的绝对前缘误差分别为 $E_1=0.0085\ \mathrm{m}$、$E_2=0.0192\ \mathrm{m}$、$E_3=0.0431\ \mathrm{m}$。代入得

$$
p_{12}=\frac{\ln(0.0192/0.0085)}{\ln 2}=\frac{0.815}{0.693}=1.18,\qquad
p_{23}=\frac{\ln(0.0431/0.0192)}{\ln 2}=\frac{0.809}{0.693}=1.17 .
$$

两段阶次都在 1.2 附近且单调，说明已进入渐近区。若 $p_{23}$ 反而显著大于 $p_{12}$，通常不是格式精度变高，而是粗网格上自由表面被数值抹平、前缘被人为拖慢，此时应先加密再谈阶次。

## 质量与动量预算的逐段核算

闭域溃坝应逐时间步记录相对质量漂移 $\varepsilon_m=\lvert m(t)-m_0\rvert/m_0$，并把阈值定在 $0.1\%$ 量级。对上述 0.146 m × 0.292 m 的二维水柱，单位厚度截面积 $0.0426\ \mathrm{m^2}$，水的线质量密度为 $42.6\ \mathrm{kg/m}$；$0.1\%$ 对应 $0.0426\ \mathrm{kg/m}$，一旦超出说明粒子逃逸或边界穿透未被拦截。线动量在水平方向应基本守恒（闸门撤除后无水平外力），在 2 s 内的相对漂移建议不超过 $2\%$，否则往往是壁面摩擦被人为放大。

## 压力尖峰与粒子聚团的伪影识别

溃坝撞击下游壁面时会出现短时压力尖峰。对弱可压缩 SPH，尖峰幅值对粒子间距非常敏感，正确做法不是比较单点峰值，而是比较"峰值随 $\Delta x$ 的变化趋势"和压力时间积分的冲量。可压缩性判据用声速 $c_0$ 与最大流速 $v_{\max}$ 之比控制：

$$
\frac{v_{\max}}{c_0}\le 0.1,\qquad c_0\ge 10\sqrt{gH},
$$

其中 $H$ 为初始水深（m）。取 $H=0.292\ \mathrm{m}$，则 $c_0\ge 10\sqrt{9.81\times0.292}=16.9\ \mathrm{m/s}$；若设 $c_0=20\ \mathrm{m/s}$，密度波动上限约 $\rho_0 (v/c_0)^2/2$，在 $v=3\ \mathrm{m/s}$ 时约 $1.1\%$，属于可接受范围。粒子聚团（clumping）会使局部密度偏高、压力出现非物理锯齿，诊断方法是统计邻居数分布：初始规则排布下二维支持域内邻居数应稳定在 $21\pm3$，若出现成对粒子邻居数骤降到 8 以下，说明存在张力不稳定。

## 前缘提取与收敛阶脚本

```python
import numpy as np

def front_position(x, y, a, surface_band=0.05):
    """取自由表面带内最右侧粒子作为前缘（二维）"""
    ymax = y.max()
    mask = y > ymax - surface_band * a
    return x[mask].max()

def observed_order(E_fine, E_coarse, dx_fine, dx_coarse):
    return np.log(E_coarse / E_fine) / np.log(dx_coarse / dx_fine)

a = 0.146                      # m, 水柱初始宽度
g = 9.81                       # m/s^2
tscale = np.sqrt(2 * g / a)    # 11.59 1/s
E  = [0.0085, 0.0192, 0.0431]  # m, fine -> coarse
dx = [0.002, 0.004, 0.008]     # m
print("p12 =", observed_order(E[0], E[1], dx[0], dx[1]))   # 1.18
print("p23 =", observed_order(E[1], E[2], dx[1], dx[2]))   # 1.17
print("t at t*=1.0 =", 1.0 / tscale, "s")                  # 0.0863 s
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 前缘曲线整体右移但形状不变 | 时间尺度换算用错，误把 $t$ 当 $t^{*}$ | 用 $a=0.146\ \mathrm{m}$ 反算 $t^{*}=1$ 对应 $0.0863\ \mathrm{s}$ 重新绘图 |
| 前缘在 $t^{*}>1.5$ 后明显偏慢 | 粒子间距过大，表面张力/人工黏性抹平前缘 | 在 2、4、8 mm 三档上比较 $p_{12}$ 与 $p_{23}$，看是否单调 |
| 壁面压力峰值随加密反而升高 | 弱可压缩声速偏低，密度波动放大 | 把 $c_0$ 从 $10\sqrt{gH}$ 提到 $20\sqrt{gH}$ 重算，看峰值是否回落 |
| 局部密度超 5% 且邻居数成对骤降 | 张力不稳定或粒子聚团 | 统计邻居数直方图，检查是否出现 8 以下的成对粒子 |
| 质量在闸门撤除瞬间跳变 | 边界粒子穿透或初始化重叠 | 输出 $t=0\sim0.05\ \mathrm{s}$ 的 $\varepsilon_m$ 时间历程 |
| 两档加密结果不单调 | 空间与时间步同时变化，误差混叠 | 固定 CFL 数只改 $\Delta x$，或固定 $\Delta x$ 只改 $\Delta t$ |

## 复核与参考文献

关闭诊断需同时满足：$p$ 在 1.0～1.5 区间单调、$\varepsilon_m<0.1\%$、冲量积分在 5% 内一致。参考文献：

1. Martin, J. C., Moyce, W. J., "An Experimental Study of the Collapse of Liquid Columns on a Rigid Horizontal Plane," *Philosophical Transactions of the Royal Society A*, 244(882), 1952, pp. 312–324.
2. Monaghan, J. J., "Simulating Free Surface Flows with SPH," *Journal of Computational Physics*, 110(2), 1994, pp. 399–406.
3. Colagrossi, A., Landrini, M., "Numerical simulation of interfacial flows by smoothed particle hydrodynamics," *Journal of Computational Physics*, 191(2), 2003, pp. 448–475.
4. Koshizuka, S., Oka, Y., "Moving-Particle Semi-Implicit Method for Fragmentation of Incompressible Fluid," *Nuclear Science and Engineering*, 123(3), 1996, pp. 421–434.
5. SPHERIC, "SPHERIC Benchmark Test Cases," ERCOFTAC SPHERIC Workshop benchmark suite.
6. Violeau, D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
7. Liu, G. R., Liu, M. B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
