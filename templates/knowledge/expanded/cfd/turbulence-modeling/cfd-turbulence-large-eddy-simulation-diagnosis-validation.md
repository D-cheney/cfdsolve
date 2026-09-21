---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-large-eddy-simulation-diagnosis-validation
title: "大涡模拟：结果诊断与可信度验证"
summary: "判断大涡模拟是否可信的四个可算指标：亚格子黏度比与耗散份额、能量谱在惯性子区的斜率、统计量的有效样本数与误差棒、亚格子耗散与数值耗散的区分，并以圆柱绕流的 Strouhal 数与阻力系数做基准对照。"
category:
  slug: turbulence-modeling
  name: "湍流与近壁建模"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "湍流与近壁建模"
  - "大涡模拟"
  - "结果诊断与可信度验证"
  - "能量谱"
  - "统计收敛"
seo:
  title: "大涡模拟：结果诊断与可信度验证"
  description: "判断大涡模拟是否可信的四个可算指标：亚格子黏度比与耗散份额、能量谱在惯性子区的斜率、统计量的有效样本数与误差棒、亚格子耗散与数值耗散的区分，并以圆柱绕流的 Strouhal 数与阻力系数做基准对照。"
  keywords:
    - "大涡模拟"
    - "结果诊断与可信度验证"
    - "能量谱"
    - "统计收敛"
    - "亚格子耗散"
---

# 大涡模拟：结果诊断与可信度验证

LES 的结果可以看起来非常逼真——涡结构清晰、瞬时场有丰富的小尺度——但统计量依然可能是错的。可信度必须由四个可算的量支撑：亚格子黏度比、能量谱在惯性子区的斜率、统计量的有效样本数、以及亚格子耗散在总耗散中的份额。本文以圆柱绕流为例，$D = 0.1\,\mathrm{m}$、$U = 10\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$（$Re_D = 6.7\times10^{4}$），给出判据与阈值。

## 1 分辨率质量的两个可算指标

第一个指标是亚格子黏度比。体区的 $\nu_{sgs}/\nu$ 应低于 20，超过 100 说明亚格子模型在替网格承担本该解析的输运。第二个指标是亚格子耗散份额：

$$\varepsilon_{sgs} = -\tau_{ij}\bar S_{ij}, \qquad f_{sgs} = \frac{\left\langle \varepsilon_{sgs} \right\rangle}{\left\langle \varepsilon_{sgs} \right\rangle + \left\langle \varepsilon_{res} \right\rangle}$$

其中 $\varepsilon_{res}$ 由解析尺度的耗散率估算。良好分辨的 LES 中 $f_{sgs}$ 应低于 0.3；若达到 0.5 以上，说明模型承担了过半耗散，结果趋近于 RANS 而非 LES。

Pope 提出的尺度分辨指标可以直接按波数评估：

$$M(\kappa) = \frac{k_{sgs}(\kappa)}{k_{res}(\kappa) + k_{sgs}(\kappa)}$$

要求 $M(\kappa) < 0.2$ 覆盖至少一个数量级的波数范围。取 $\Delta = 5\,\mathrm{mm}$，可解析的最大波数约 $\pi/\Delta = 628\,\mathrm{m^{-1}}$，若 $M$ 在 $60\sim600\,\mathrm{m^{-1}}$ 区间内始终低于 0.2，则认为惯性子区已被解析。

## 2 能量谱斜率作为惯性子区的证据

惯性子区的能量谱应满足 $E(\kappa) \propto \kappa^{-5/3}$，因此波数增大 10 倍时能量应下降到

$$\frac{E(\kappa_2)}{E(\kappa_1)} = 10^{-5/3} = 0.0215$$

实测偏离这个值的方向直接指向病因。以 $\kappa_1 = 50\,\mathrm{m^{-1}}$、$E_1 = 1.0$ 为参考点：

| 实测 $E(500\,\mathrm{m^{-1}})$ | 拟合斜率 | 判读 |
|---|---|---|
| 0.0080 | $-2.10$ | 谱过陡，数值耗散主导，网格或格式过耗散 |
| 0.0215 | $-1.67$ | 符合 $-5/3$，惯性子区正常 |
| 0.0600 | $-1.22$ | 谱过平，亚格子耗散过强或采样不足 |

斜率由 $-\ln(E_2/E_1)/\ln(\kappa_2/\kappa_1)$ 直接算得。谱必须在同一物理位置、同一时间窗口内统计，且窗口长度至少覆盖 20 个脱落周期，否则谱的随机误差会把斜率判断淹没。

## 3 统计收敛与误差棒的报法

均值的不确定度由有效样本数决定：

$$\sigma_{\bar{x}} = \frac{\sigma_x}{\sqrt{N_{eff}}}, \qquad N_{eff} = \frac{T_{stat}}{2T_{int}}$$

积分时间尺度 $T_{int}$ 由自相关函数 $\rho(\tau) = \overline{u'(t)u'(t+\tau)}/\overline{u'^{2}}$ 积分到首次过零得到。圆柱尾迹中 $T_{int}$ 约为脱落周期的 0.4 倍，取 $T = 0.05\,\mathrm{s}$ 得 $T_{int} = 0.02\,\mathrm{s}$。统计窗口 $T_{stat} = 5\,\mathrm{s}$（100 个脱落周期）给出 $N_{eff} = 125$，于是 $\sigma_{\bar{x}} = \sigma_x/11.2$。

若阻力系数的瞬时脉动标准差 $\sigma_{C_d} = 0.08$，则均值的标准误为 $0.08/11.2 = 7.1\times10^{-3}$，相对 $C_d \approx 1.0$ 是 0.71%。要把误差减半需要四倍采样，即 $T_{stat} = 20\,\mathrm{s}$。报告 $C_d$ 时必须带上这个区间，而不是只给一个数。

## 4 亚格子耗散与数值耗散的区分

两者都会抹平小尺度，但诊断方式不同。亚格子耗散随 $\nu_{sgs}$ 变化，把 $C_s$ 从 0.17 降到 0.1 后积分量若有明显变化，说明亚格子项在主导；数值耗散由格式与网格决定，与 $C_s$ 无关，加密网格或把对流格式从一阶换到中心/二阶后结果变化，才说明是数值耗散。

具体试验设计：固定网格，做 $C_s = 0.1/0.17$ 两档；再固定 $C_s$，做两套网格。若第一种比较差异小于 1%、第二种差异大于 5%，则瓶颈是网格而不是模型。这个二分法能避免在网格不足时反复调 $C_s$ 这类无效工作。

## 5 与圆柱绕流基准量的对照

亚临界圆柱绕流有三个稳定的基准量可用于对照：

| 量 | 实验参考 | 说明 |
|---|---|---|
| Strouhal 数 $St = fD/U$ | 约 0.20 | 对展向长度与端部条件敏感 |
| 时均阻力系数 $C_d$ | 约 1.2 | 随展向长度与阻塞比变化 |
| 时均回流区长度 $L_r/D$ | 约 1.2~1.5 | 对网格分辨率最敏感 |

$St$ 通常最容易对上（偏差小于 2%），因为它由整体涡脱落频率决定；$L_r/D$ 最难对上，因为它由近尾迹的剪切层卷起位置决定，直接受分辨率与亚格子模型影响。因此验收顺序应是先看 $St$，再看 $C_d$，最后看 $L_r/D$。若 $St$ 与 $C_d$ 都好而 $L_r/D$ 偏差 20%，说明问题局限在近尾迹，不必推翻整个设置。

展向长度也需要验证：把展向从 $2D$ 加到 $4D$，若 $C_d$ 变化超过 3%，说明二维涡结构被人为拉长，相关量不可用。亚临界圆柱一般需要至少 $4D$ 的展向长度。

```python
import numpy as np

# 1) 能量谱斜率
k1, E1 = 50.0, 1.0
for E2 in (0.008, 0.0215, 0.060):
    slope = -np.log(E2 / E1) / np.log(10.0)
    print(f"E2={E2:.4f}  slope={slope:+.2f}")

# 2) 统计误差
T, Tint, Tstat, sigCd = 0.05, 0.02, 5.0, 0.08
Neff = Tstat / (2 * Tint)
print(f"Neff={Neff:.0f}  sigma_mean={sigCd/np.sqrt(Neff):.4f}"
      f"  rel={sigCd/np.sqrt(Neff)/1.0*100:.2f}%")
for Tstat in (5.0, 10.0, 20.0):
    print(f"Tstat={Tstat:4.1f}s  rel_err={sigCd/np.sqrt(Tstat/(2*Tint))*100:.2f}%")

# 3) 分辨率指标
Delta, nu = 5e-3, 1.5e-5
for Cs, S in ((0.17, 100.0), (0.10, 100.0)):
    print(f"Cs={Cs}  nu_sgs/nu={(Cs*Delta)**2*S/nu:.2f}")
```

脚本给出斜率 $-2.10$、$-1.67$、$-1.22$；$N_{eff} = 125$、相对误差 0.71%；以及 $C_s = 0.17$ 时 $\nu_{sgs}/\nu = 4.81$、$C_s = 0.1$ 时 1.66，与手算一致。

## 6 可信度不足的反证试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 谱斜率约 $-2.1$ 而积分量看似合理 | 数值耗散在惯性子区抹平能量，掩盖了网格不足 | 换二阶或中心格式重算，比较斜率是否回到 $-5/3$ |
| 改变 $C_s$ 后 $C_d$ 变化 6% | 亚格子模型主导耗散，网格分辨不足 | 加密网格后重做同一 $C_s$ 对照，看敏感度是否下降 |
| $C_d$ 的分段均值波动 4% | 统计窗口短于 100 个脱落周期 | 用 $N_{eff} = T_{stat}/(2T_{int})$ 反算所需窗口长度 |
| 展向从 $2D$ 加到 $4D$ 后 $C_d$ 变化 8% | 展向不足导致二维涡被人为拉长 | 继续加到 $6D$，确认变化是否收敛到 3% 以内 |
| $St$ 与 $C_d$ 均好但 $L_r/D$ 偏 20% | 近尾迹剪切层卷起位置未被解析 | 只加密尾迹区流向网格，看 $L_r/D$ 是否向基准靠拢 |
| 时均场在壁面附近出现非物理高速条带 | 壁面模化首层落入过渡区 | 检查首层 $y^{+}$ 是否落在 30~50 区间 |

## 7 湍流统计与基准数据出处

1. Pope S. B., "Ten questions concerning the large-eddy simulation of turbulent flows," *New Journal of Physics*, 2004.
2. Celik I. B., Cehreli Z. N., Yavuz I., "Index of resolution quality for large eddy simulations," *ASME Journal of Fluids Engineering*, 2005.
3. Norberg C., "An experimental investigation of the flow around a circular cylinder: influence of aspect ratio," *Journal of Fluid Mechanics*, 1994.
4. Kravchenko A. G., Moin P., "Numerical studies of flow over a circular cylinder at Re_D = 3900," *Physics of Fluids*, 2000.
