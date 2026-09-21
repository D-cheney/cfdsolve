---
template_version: "flowlab-knowledge/1.0"
slug: cfd-multiphase-vof-interface-diagnosis-validation
title: "VOF 自由液面：结果诊断与可信度验证"
summary: "用三个守恒量、静止液滴 Laplace 标定、Ritter 溃坝解析解与 Hysing 二维气泡基准逐层验收 VOF 结果，给出寄生流毛细数、界面 Courant 数与体积漂移的具体阈值和诊断脚本。"
category:
  slug: multiphase-flow
  name: "多相流与组分输运"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "多相流与组分输运"
  - "VOF 自由液面"
  - "结果诊断与可信度验证"
  - "寄生流"
  - "Laplace 压差"
seo:
  title: "VOF 自由液面：结果诊断与可信度验证"
  description: "用三个守恒量、静止液滴 Laplace 标定、Ritter 溃坝解析解与 Hysing 二维气泡基准逐层验收 VOF 结果，给出寄生流毛细数、界面 Courant 数与体积漂移的具体阈值和诊断脚本。"
  keywords:
    - "VOF 自由液面"
    - "结果诊断与可信度验证"
    - "寄生流"
    - "Laplace 压差"
---

# VOF 自由液面：结果诊断与可信度验证

VOF 结果的诊断有固定顺序：先证每相体积守恒，再用有解析解的算例标定表面张力与曲率，最后才拿设备工况与实验比。跳过前两步，任何"看起来合理"的自由液面都可能只是被寄生流和体积漂移粉饰过的假象。本文给出三档可核对的诊断量——体积漂移、寄生流毛细数、界面 Courant 数——以及静止液滴、溃坝与二维上升气泡三个基准的用法，物性统一取 $\rho_w=998$ kg/m³、$\sigma=0.072$ N/m、$\mu_w=1.0\times10^{-3}$ Pa·s。

## 三个守恒量必须先过

每相相对体积漂移定义为

$$\varepsilon_\alpha(t)=\frac{\left|V_q(t)-V_q(0)\right|}{V_q(0)}$$

当界面被 3 到 5 个单元覆盖且 $Co_\alpha\le0.25$ 时，$\varepsilon_\alpha$ 应稳定在 0.1% 以内。关键在于形状：随机游走式的小幅波动是离散误差，而随时间单调爬升说明界面通量存在系统性偏差，必须回到格式与时间步。同时逐单元检查相分数之和，$|\sum_q\alpha_q-1|$ 应小于 $10^{-6}$，否则是 MULES 限幅或压缩项越界。

## 静止液滴标定表面张力与寄生流

一个静止液滴给出两个独立标定：界面内外压差与界面附近的最大速度。压差由 Laplace 定律给出

$$\Delta p = \frac{2\sigma}{R},\qquad R = 1\ \text{mm} \Rightarrow \Delta p = \frac{2\times0.072}{10^{-3}} = 144\ \text{Pa}$$

数值解若给出 130 Pa 或 160 Pa，偏差约 10%，说明曲率估计被网格噪声污染。寄生流则用毛细数衡量：

$$Ca_{sp}=\frac{\mu_w u_{sp}}{\sigma}$$

当界面附近最大速度 $u_{sp}=10^{-3}$ m/s 时 $Ca_{sp}=1.4\times10^{-5}$，可忽略；若升到 $u_{sp}=0.1$ m/s，则 $Ca_{sp}=1.4\times10^{-3}$，已超过工程可接受上限 $10^{-3}$，此时液滴会缓慢自流，接触角与界面张力结果全部失效。

## 溃坝用 Ritter 解析解定位

干床溃坝在忽略阻力与湍流时存在 Ritter 解析解，溃坝前锋位置为

$$x_f(t)=2\sqrt{g\,a}\;t$$

其中 $a$ 为初始水柱半宽。取 Martin & Moyce 实验的 $a=0.05715$ m，则 $\sqrt{ga}=\sqrt{9.81\times0.05715}=0.749$ m/s，前锋速度 1.497 m/s。在 $t=0.1$ s 时

$$x_f = 2\times0.749\times0.1 = 0.150\ \text{m},\qquad x^{*}=x_f/a = 2.62$$

非量纲时间 $T^{*}=t\sqrt{2g/a}=0.1\times18.53=1.85$。把 $(T^{*},x^{*})$ 落在 Martin & Moyce 表列曲线上，粗网格 VOF 通常高估前锋 5% 到 10%，因为数值扩散使水柱提前"漏"向干区；若高估超过 15%，应先查界面 Courant 数而非加密网格。

## 二维上升气泡基准

Hysing 等给出的二维上升气泡基准用两个算例覆盖黏性与惯性主导。算例一的物性为 $\rho_1=1000$ kg/m³、$\rho_2=1$ kg/m³、$\mu_1=10$ Pa·s、$\mu_2=0.1$ Pa·s、$\sigma=24.5$ N/m、$g=0.98$ m/s²，域为 $1\times2$ m，气泡直径 0.5 m。其 Eötvös 数与 Morton 数为

$$Eo=\frac{\rho_1 g d^{2}}{\sigma}=\frac{1000\times0.98\times0.25}{24.5}=10.0,\qquad Mo=\frac{g\mu_1^{4}}{\rho_1\sigma^{3}}=6.7\times10^{-4}$$

报告量是气泡上升速度时程与圆度 $C=\pi d_a/P$，须与 Hysing 表列值逐点对比，而不是只看终速。圆度是界面解析度的直接证据：网格不足时圆度虚高，因为界面被抹平后周长被人为缩短。

## 界面 Courant 与体积漂移的联查

诊断脚本把三项检查一次性算出，便于每次改参数后复跑：

```python
import numpy as np
# 由日志逐时刻读入：界面最大法向速度、网格、时间步、每相体积
u_n, h, dt = 1.5, 1.0e-3, 2.0e-4
co = u_n * dt / h                      # 界面 Courant 数
mu, sigma, u_sp = 1.0e-3, 0.072, 1.0e-3
ca_sp = mu * u_sp / sigma              # 寄生流毛细数
V0, Vt = 1.0000e-3, 1.0003e-3          # 初始与当前水相体积 m^3
drift = abs(Vt - V0) / V0
print("Co_alpha = %.3f  (阈值 0.25)" % co)
print("Ca_sp    = %.2e  (阈值 1e-3)" % ca_sp)
print("体积漂移 = %.3f%%  (阈值 0.1%%)" % (100 * drift))
```

该例给出 $Co_\alpha=0.30$，已超阈值，应把时间步降到 $1.5\times10^{-4}$ s；漂移 0.03% 在容差内。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 液滴内速度场不衰减 | 曲率噪声驱动寄生流 | 加密界面网格一半，若 $Ca_{sp}$ 随之下降则为数值源 |
| 体积单调流失且与时间成正比 | 界面 Courant 数超限 | 固定网格把 $\Delta t$ 减半，漂移率是否同步减半 |
| 溃坝前锋快于解析解 20% | 界面过度扩散导致提前泄漏 | 改用几何重构或减小 cAlpha，观察前锋是否回退 |
| 气泡圆度接近 1 但不破裂 | 界面被抹平，周长被低估 | 提高网格分辨率看圆度是否下降并趋于基准 |
| 与实验趋势相反 | 接触角测量相或符号约定不同 | 用静止液滴重算 Laplace 压差方向 |

## 参考基准与文献

按"静止液滴 → 溃坝 → 上升气泡 → 设备工况"顺序推进，每级只在前一级全部通过后才进入下一级。基准曲线、诊断量与阈值一并存档，任何一级不通过都不得用后一级的"整体合理"来覆盖。

1. Martin, J.C. & Moyce, W.J., "An Experimental Study of the Collapse of Liquid Columns on a Rigid Horizontal Plane," *Philosophical Transactions of the Royal Society A*, 244(882), 1952.
2. Ritter, A., "Die Fortpflanzung der Wasserwellen," *Zeitschrift des Vereines Deutscher Ingenieure*, 36(33), 1892.
3. Hysing, S. et al., "Quantitative Benchmark Computations of Two-Dimensional Bubble Dynamics," *International Journal for Numerical Methods in Fluids*, 60(11), 2009.
4. Brackbill, J.U., Kothe, D.B. & Zemach, C., "A Continuum Method for Modeling Surface Tension," *Journal of Computational Physics*, 100(2), 1992.
5. Popinet, S., "An Accurate Adaptive Solver for Surface-Tension-Driven Interfacial Flows," *Journal of Computational Physics*, 228(16), 2009.
6. Kothe, D.B. & Rider, W.J., "A Marker Particle Method for Interface Tracking," *Proceedings of the 6th International Symposium on Computational Fluid Dynamics*, 1995.
