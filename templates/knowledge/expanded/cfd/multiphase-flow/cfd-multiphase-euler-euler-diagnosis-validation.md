---
template_version: "flowlab-knowledge/1.0"
slug: cfd-multiphase-euler-euler-diagnosis-validation
title: "Euler–Euler 多流体模型：结果诊断与可信度验证"
summary: "用相分率有界性、Ergun 压降反查、Richardson–Zaki 床高校验与曳力切换突跳定位来验收双流体结果，给出各诊断量的具体阈值、逐项手算与诊断脚本。"
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
  - "Euler–Euler 多流体模型"
  - "结果诊断与可信度验证"
  - "Ergun 方程"
  - "Richardson–Zaki"
seo:
  title: "Euler–Euler 多流体模型：结果诊断与可信度验证"
  description: "用相分率有界性、Ergun 压降反查、Richardson–Zaki 床高校验与曳力切换突跳定位来验收双流体结果，给出各诊断量的具体阈值、逐项手算与诊断脚本。"
  keywords:
    - "Euler–Euler 多流体模型"
    - "结果诊断与可信度验证"
    - "Ergun 方程"
    - "Richardson–Zaki"
---

# Euler–Euler 多流体模型：结果诊断与可信度验证

双流体结果的可信度靠三个可核对的量支撑：相分率的有界性、逐相质量守恒，以及压降与床高能否被经典关联式解释。残差收敛只能说明代数方程解开了，不能说明曳力闭合选对了。本文给出用 Ergun 方程反查压降、用 Richardson–Zaki 校验膨胀床床高、用曳力切换点定位突跳的诊断流程，物性取 $\rho_g=1.2$ kg/m³、$\mu_g=1.8\times10^{-5}$ Pa·s。

## 相分率有界性与守恒是第一道闸门

任何时刻都应满足

$$\left|\sum_q\alpha_q-1\right|<10^{-6},\qquad 0\le\alpha_s\le\alpha_{s,max}=0.63$$

若日志里出现 $\alpha_s>0.63$ 的单元，说明限幅器被触发，局部堆积是非物理的，床层高度与压降都会偏高。逐相质量守恒则要求

$$\varepsilon_m(t)=\frac{\left|\int_0^{t}\dot m_{in}\,dt-\left(m_{esc}+m_{trap}+m_{domain}\right)\right|}{\int_0^{t}\dot m_{in}\,dt}<0.5\%$$

该误差若随时间单调增长，问题在相间传质项或压力-速度耦合；若只在流化启动瞬间跳一下，属于瞬态压缩，可接受。

## 用 Ergun 方程反查压降

固定床与鼓泡床的压降由 Ergun 方程给出：

$$\frac{\Delta p}{L}=150\frac{(1-\varepsilon)^{2}}{\varepsilon^{3}}\frac{\mu_g u}{d_p^{2}}+1.75\frac{1-\varepsilon}{\varepsilon^{3}}\frac{\rho_g u^{2}}{d_p}$$

取 $\varepsilon=0.4$、$d_p=3\times10^{-3}$ m、$u=0.5$ m/s、$L=0.5$ m。第一项为 $150\times0.36/0.064\times(1.8\times10^{-5}\times0.5/9\times10^{-6})=843.8$ Pa/m；第二项为 $1.75\times0.6/0.064\times(1.2\times0.25/3\times10^{-3})=1640.6$ Pa/m。合计 2484 Pa/m，乘 $L=0.5$ m 得 $\Delta p=1242$ Pa。若数值解压降偏离该值超过 20%，先查曳力模型与网格，而不是先调松弛。

## Richardson–Zaki 校验膨胀床床高

均匀膨胀床的滑移速度满足

$$\frac{u}{u_t}=\varepsilon^{n},\qquad n\approx4.65\ (Re_p<0.2),\quad n\approx2.39\ (Re_p>500)$$

取 $\varepsilon=0.6$、$n=2.39$，则 $u/u_t=0.6^{2.39}=0.295$。若单颗粒终速 $u_t=0.48$ m/s，则表观液速应为 $0.142$ m/s。床高由固相质量守恒给出：

$$\frac{H}{H_0}=\frac{1-\varepsilon_0}{1-\varepsilon}=\frac{0.6}{0.4}=1.5$$

即床层膨胀 50%。数值解若给出 1.2 或 1.8 倍膨胀，说明曳力或固相黏度偏离，需按该式反推有效 $u_t$ 再回查曳力系数。

## 曳力切换导致的突跳定位

双流体结果最典型的伪影是"参数微调、结果突跳"，根因几乎都在曳力模型的分支切换。诊断方法是固定其余输入，只把切换阈值沿相分率轴平移，观察目标量（床高、压降）是否平滑过渡。若在某个分率处出现台阶，说明两支路在切换点未做混合，应改用连续混合（如 `blending` 线性权重）而不是硬切换。同理，Ishii–Zuber 与 Gidaspow 在小分率区的差异可达 30%，选型必须用同一算例交叉验证。

## 网格与数值扩散

相含率场的数值扩散会直接抹平气泡。诊断方法是对同一工况做三档网格（5 mm、3 mm、2 mm）并比较气泡当量直径与床层压降；若气泡直径随网格持续变化而无收敛趋势，说明网格仍在数值扩散主导区。经验上单元尺寸降到 $10\,d_p$ 以下后，压降变化应小于 5%，此时才可认为结果与网格无关。

## 诊断脚本

```python
import math
# 相分率有界性与 Ergun 压降一次性核算
def ergun_dp(eps, dp, u, rho, mu, L):
    visc = 150 * (1-eps)**2 / eps**3 * mu*u/dp**2
    inert = 1.75 * (1-eps) / eps**3 * rho*u**2/dp
    return (visc + inert) * L, visc, inert

dp_tot, v, i = ergun_dp(0.4, 3e-3, 0.5, 1.2, 1.8e-5, 0.5)
print("Ergun: 黏性 %.1f + 惯性 %.1f = %.1f Pa/m" % (v, i, v+i))
print("总压降 = %.0f Pa" % dp_tot)
n, eps = 2.39, 0.6
print("u/ut = %.3f, 床高比 H/H0 = %.2f" % (eps**n, 0.6/0.4))
```

运行输出与上文手算一致：2484 Pa/m、1242 Pa、0.295 与 1.50，可直接与求解器日志对照。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 局部 $\alpha_s$ 越 0.63 | packingLimiter 未开或过松 | 打印最大 $\alpha_s$，开启限幅后越界是否消失 |
| 压降比 Ergun 高 30% | 曳力模型低估滑移或网格过粗 | 用 Ergun 式核算并对比三档网格压降 |
| 床高随网格持续变化 | 相含率数值扩散未收敛 | 加密到 $10\,d_p$ 后看床高变化是否小于 5% |
| 参数微调结果突跳 | 曳力模型分支硬切换 | 平移切换阈值，看目标量是否出现台阶 |
| 压降正常但床层不膨胀 | 固相压力过大压制流化 | 打印 $g_0$ 与 $p_s$，与动理论量级对比 |

## 校验顺序与文献

先用相分率有界性排除数值越界，再用 Ergun 与 Richardson–Zaki 把压降与床高钉在解析量级，最后才比较气泡形态与实验。三档网格必须与这两个关联式同时通过，否则加密只是把误差搬了个位置。

1. Ergun, S., "Fluid Flow through Packed Columns," *Chemical Engineering Progress*, 48(2), 1952.
2. Richardson, J.F. & Zaki, W.N., "Sedimentation and Fluidisation: Part I," *Transactions of the Institution of Chemical Engineers*, 32, 1954.
3. Wen, C.Y. & Yu, Y.H., "A Generalized Method for Predicting the Minimum Fluidization Velocity," *AIChE Journal*, 12(3), 1966.
4. Gidaspow, D., *Multiphase Flow and Fluidization: Continuum and Kinetic Theory Descriptions*, Academic Press, 1994.
5. Syamlal, M. & O'Brien, T.J., "Computer Simulation of Bubbles in a Fluidized Bed," *AIChE Symposium Series*, 85, 1989.
6. Passalacqua, A. & Fox, R.O., "Implementation of an Iterative Solution of the Population Balance Equation in CFD Codes," *Chemical Engineering Science*, 66(20), 2011.
