---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-hybrid-rans-les-diagnosis-validation
title: "DES 与混合 RANS–LES：结果诊断与可信度验证"
summary: "混合方法特有的四类失效怎么查：用延迟函数算出灰色区宽度、量化对数律错配的偏移量、核对解析应力与模化应力之比、检查 RANS–LES 界面是否落在分离点之前，并以方形柱绕流的 Strouhal 数与阻力系数做基准对照。"
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
  - "DES 与混合 RANS–LES"
  - "结果诊断与可信度验证"
  - "灰色区"
  - "对数律错配"
seo:
  title: "DES 与混合 RANS–LES：结果诊断与可信度验证"
  description: "混合方法特有的四类失效怎么查：用延迟函数算出灰色区宽度、量化对数律错配的偏移量、核对解析应力与模化应力之比、检查 RANS–LES 界面是否落在分离点之前，并以方形柱绕流的 Strouhal 数与阻力系数做基准对照。"
  keywords:
    - "DES 与混合 RANS–LES"
    - "结果诊断与可信度验证"
    - "灰色区"
    - "对数律错配"
    - "模化应力耗尽"
---

# DES 与混合 RANS–LES：结果诊断与可信度验证

混合方法会引入 RANS 与 LES 都没有的四类失效：灰色区、对数律错配、模化应力耗尽、以及 RANS–LES 界面落在分离点之前。它们不会在残差或积分量上暴露，必须靠专门构造的判据识别。本文以方形柱绕流为例，边长 $D = 0.04\,\mathrm{m}$、来流 $U = 8\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$（$Re_D = 2.1\times10^{4}$），给出四个判据的算式与阈值。

## 1 灰色区的边界与宽度估算

灰色区是延迟函数 $f_d$ 处于中间值、模型既非纯 RANS 也非充分 LES 的薄层。由 $f_d = 1 - \tanh\left[(C_{d1}r_d)^{C_{d2}}\right]$，取 $C_{d1} = 8$、$C_{d2} = 3$，反解两个阈值：

$$f_d = 0.8 \Rightarrow r_d = \frac{\left[\tanh^{-1}(0.2)\right]^{1/3}}{C_{d1}} = 0.0734, \qquad f_d = 0.2 \Rightarrow r_d = \frac{\left[\tanh^{-1}(0.8)\right]^{1/3}}{C_{d1}} = 0.1290$$

因 $r_d \propto (\nu_t+\nu)/d^{2}$，灰色区在壁距方向上的宽度为 $d_{0.2}/d_{0.8} = \sqrt{0.1290/0.0734} = 1.33$。若 $f_d = 0.8$ 出现在 $d = 3\,\mathrm{mm}$，$f_d = 0.2$ 出现在 3.98 mm，灰色带仅约 1 mm 厚。

真正的灰色区问题不在 $f_d$ 的过渡带，而在剪切层里解析湍流尚未建立的区域。判据是：在 $f_d > 0.8$ 的区域中，解析湍动能应在一个边界层厚度内升到当地总湍动能的 50% 以上。若下游 3δ 之内仍低于 30%，说明剪切层被人为拉长。

## 2 对数律错配的量化

在 RANS 区，解析速度剖面应满足 $u^{+} = \ln y^{+}/\kappa + B$。混合方法常见的失效是解析剖面与对数律之间存在一个固定的偏移量：

$$\Delta B = \bar u^{+}_{\text{res}} - \left(\frac{1}{\kappa}\ln y^{+} + B\right)$$

取 $\kappa = 0.41$、$B = 5.2$，$y^{+} = 200$ 处对数律给出 $u^{+} = 18.12$。若解析剖面给出 17.1，则 $\Delta B = -1.0$，相对偏差 5.5%。经验阈值是 $|\Delta B| < 0.5$；达到 1.0 以上时壁面摩擦被低估约 6%，误差沿流向累积并影响分离点位置。

错配的根源是 LES 区解析得到的 $u_\tau$ 与 RANS 区模化得到的 $\nu_t$ 在界面处不匹配。缓解手段是使用带壁面模化的 IDDES，或在界面附近加密壁法向网格使 $\Delta y^{+}$ 不超过 30。

## 3 解析应力与模化应力之比

在 LES 区必须确认解析尺度承担了主要湍流输运。解析份额定义为

$$f_{\text{res}} = \frac{\overline{u'u'}_{\text{res}}}{\overline{u'u'}_{\text{res}} + \overline{u'u'}_{\text{sgs}}}$$

亚格子湍动能由 $k_{sgs} = \left[\nu_{sgs}/(C_k\Delta)\right]^{2}$ 估算，$C_k \approx 0.07$，$\overline{u'u'}_{\text{sgs}} \approx \frac{2}{3}k_{sgs}$。取 $\nu_{sgs} = 5\times10^{-5}\,\mathrm{m^2/s}$、$\Delta = 2\,\mathrm{mm}$，得 $k_{sgs} = \left[5\times10^{-5}/(0.07\times0.002)\right]^{2} = 0.128\,\mathrm{m^2/s^2}$。

解析分量取 $u_{\text{rms}} = 0.80$、$v_{\text{rms}} = 0.50$、$w_{\text{rms}} = 0.60\,\mathrm{m/s}$，则 $k_{\text{res}} = 0.5\times(0.64+0.25+0.36) = 0.625\,\mathrm{m^2/s^2}$，$f_{\text{res}} = 0.625/(0.625+0.128) = 83\%$，超过 80% 的门槛。若低于 60%，说明 LES 分支分辨率不足，继续调整 $C_{DES}$ 无效，应加密网格或换用 WALE 类亚格子模型。

## 4 RANS–LES 界面位置的检查

把 $f_d$ 首次超过 0.5 的位置沿壁面法向投影到物面，得到界面高度 $d_{\text{int}}$，与当地边界层厚度比较：

| $d_{\text{int}}/\delta$ | 判读 |
|---|---|
| $< 0.1$ | 界面深入边界层，模化应力耗尽，壁面摩擦与分离点不可信 |
| $0.1\sim0.5$ | 处于灰色区，分离点对网格敏感，需要网格无关性确认 |
| $> 1.0$ | 界面位于边界层外，RANS 区完整，属期望状态 |

对分离主导的算例，界面必须位于分离点下游。若 $f_d > 0.5$ 的等值线出现在分离点上游，模型会在尚未分离的附着边界层里切换到 LES，结果必然依赖网格。

## 5 展向长度与基准量对照

方形柱绕流的基准量与展向长度强相关：

| 量 | 实验参考 | 敏感度 |
|---|---|---|
| Strouhal 数 $St = fD/U$ | 约 0.132 | 对展向长度中等敏感 |
| 时均阻力系数 $C_d$ | 约 2.1 | 对展向长度高度敏感 |

展向长度从 $4D$ 加到 $6D$，$C_d$ 应变化小于 3%、$St$ 小于 1%。展向单元数按 $\Delta z = 0.05D = 2\,\mathrm{mm}$ 布置，$4D$ 展向给出 80 个单元，属于可接受的下限。

统计时长按 $N_{eff} = T_{stat}/(2T_{int})$ 定。取 $T_{int} \approx 0.5T = 0.019\,\mathrm{s}$、$T_{stat} = 100T = 3.79\,\mathrm{s}$，得 $N_{eff} = 100$；阻力系数脉动标准差约 0.35，均值的标准误为 $0.35/\sqrt{100} = 0.035$，相对 $C_d \approx 2.1$ 是 1.7%。两套网格（$\Delta = 2\,\mathrm{mm}$ 与 $3\,\mathrm{mm}$）给出 $C_d = 2.14$ 与 $2.05$，相差 4.4%，大于统计误差，因此差异来自网格而非采样。

```python
import numpy as np
r_hi = np.arctanh(0.2) ** (1 / 3) / 8; r_lo = np.arctanh(0.8) ** (1 / 3) / 8
print(f"r_d={r_hi:.4f}/{r_lo:.4f} 宽度比={np.sqrt(r_lo/r_hi):.3f}")
u_log = np.log(200.) / 0.41 + 5.2
print(f"u+(200)={u_log:.2f} dB=-1 偏差={100/u_log:.1f}%")
k_res = 0.5 * (0.80 ** 2 + 0.50 ** 2 + 0.60 ** 2); k_sgs = (5e-5 / (0.07 * 2e-3)) ** 2
print(f"f_res={k_res/(k_res+k_sgs):.3f}")
Neff = 3.79 / (2 * 0.5 * 0.0379)
print(f"Neff={Neff:.0f} 相对误差={0.35/np.sqrt(Neff)/2.1*100:.1f}%")
```

脚本给出灰色区宽度比 1.325、对数律错配相对偏差 5.5%、解析应力份额 0.830、统计相对误差 1.7%，与手算一致。

## 6 界面与灰色区失效的反证

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面摩擦比 RANS 低 6%，分离点前移 | 对数律错配，RANS 与 LES 区的 $u_\tau$ 不匹配 | 算 $\Delta B$ 并检查界面的 $\Delta y^{+}$ 是否超过 30 |
| 界面高度 $d_{\text{int}}/\delta = 0.05$ | 模化应力耗尽，界面深入边界层 | 输出 $f_d = 0.5$ 等值线并与分离点位置比对 |
| 剪切层解析湍动能 3δ 内仍低于 30% | 灰色区过长，剪切层发展被推迟 | 统计 $f_d \in (0.2, 0.8)$ 区域沿流向的长度 |
| 展向从 $4D$ 加到 $6D$ 后 $C_d$ 变化 7% | 展向不足导致二维涡被人为拉长 | 继续加到 $8D$，确认变化是否收敛到 3% 以内 |
| 两套网格 $C_d$ 差 4.4% 而统计误差仅 1.7% | 网格效应主导，分辨率不足 | 对比两套网格的 $f_{\text{res}}$ 定位 |

## 7 混合方法诊断文献与实验数据

1. Spalart P. R., Deck S., Shur M. L., Squires K. D., Strelets M. K., Travin A., "A new version of detached-eddy simulation, resistant to ambiguous grid densities," *Theoretical and Computational Fluid Dynamics*, 2006.
2. Shur M. L., Spalart P. R., Strelets M. K., Travin A. K., "A hybrid RANS-LES approach with delayed-DES and wall-modelled LES capabilities," *International Journal of Heat and Fluid Flow*, 2008.
3. Lyn D. A., Einav S., Rodi W., Park J. H., "A laser-Doppler velocimetry study of ensemble-averaged characteristics of the turbulent near wake of a square cylinder," *Journal of Fluid Mechanics*, 1995.
4. Nikitin N. V., Nicoud F., Wasistho B., Squires K. D., Spalart P. R., "An approach to wall modeling in large-eddy simulations," *Physics of Fluids*, 2000.
