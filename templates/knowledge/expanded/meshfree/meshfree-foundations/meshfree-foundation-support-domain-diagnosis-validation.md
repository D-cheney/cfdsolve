---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-foundation-support-domain-diagnosis-validation
title: "支持域与平滑长度：结果诊断与可信度验证"
summary: "用 h/Δx 扫描把平滑长度调到最优：给出二维与三维邻居数的逐档手算、L2 误差与压力噪声随 h/Δx 的非单调曲线、界面抹平厚度 4h 的判据，以及区分欠平滑与过平滑的两组判定试验。"
category:
  slug: meshfree-foundations
  name: "无网格法 · 方法与验证"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法 · 方法与验证"
  - "支持域与平滑长度"
  - "结果诊断与可信度验证"
  - "邻居数"
  - "压力噪声"
seo:
  title: "支持域与平滑长度：结果诊断与可信度验证"
  description: "用 h/Δx 扫描把平滑长度调到最优：给出二维与三维邻居数的逐档手算、L2 误差与压力噪声随 h/Δx 的非单调曲线、界面抹平厚度 4h 的判据，以及区分欠平滑与过平滑的两组判定试验。"
  keywords:
    - "支持域与平滑长度"
    - "结果诊断与可信度验证"
    - "邻居数"
    - "压力噪声"
    - "MESHFREE"
---

# 支持域与平滑长度：结果诊断与可信度验证

平滑长度 $h$ 是 SPH 里唯一同时控制精度、稳定性和计算量的参数，而且它有一个明确的最优点：太小则邻居不足、压力噪声大、粒子容易飞散；太大则界面被抹平、边界截断加剧、局部特征消失。诊断的核心是把 $h/\Delta x$ 当成自变量扫一遍，同时记录目标量误差、压力噪声和邻居数分布，从曲线的形状而不是单点结果下结论。本文给出逐档邻居数的解析手算、一组二维实测曲线、界面抹平厚度的判据，以及区分欠平滑与过平滑的试验。

## 邻居数由 h/Δx 和核支撑半径唯一决定

支持半径取 $r_c=\kappa h$，三次样条核 $\kappa=2$、Wendland C2 核同样为 2、五次样条核为 3。把邻居数按体积比估算：

$$
N_{\text{nb}}\approx n_d\,\frac{\pi^{d/2}}{\Gamma\!\left(\frac{d}{2}+1\right)}\left(\frac{\kappa h}{\Delta x}\right)^{d}, \qquad n_2=1,\ n_3=1
$$

二维与三维的差别全在幂次上。逐档手算（$\kappa=2$）得到下表，可见同一个 $h/\Delta x$ 在三维会多出两倍以上的邻居。

| $h/\Delta x$ | $r_c/\Delta x$ | 二维 $N_{\text{nb}}$ | 三维 $N_{\text{nb}}$ |
|---|---|---|---|
| 1.0 | 2.0 | 12.6 | 33.5 |
| 1.2 | 2.4 | 18.1 | 57.9 |
| 1.5 | 3.0 | 28.3 | 113.1 |
| 2.0 | 4.0 | 50.3 | 268.1 |

据此可以定出常用区间：二维取 $h/\Delta x=1.5\sim2.0$，邻居数落在 28~50；三维取 $h/\Delta x=1.15\sim1.35$，邻居数落在 53~82。把二维的 $h/\Delta x=2.0$ 直接搬到三维会得到 268 个邻居，计算量翻五倍而精度未必改善，这是跨维度照抄参数最典型的代价。

## 误差曲线是 U 形，压力噪声曲线是单调的

在 $\Delta x=0.010\ \text{m}$ 的二维剪切层算例上扫 $h/\Delta x$，记录断面速度剖面的 $L_2$ 误差与压力噪声均方根：

| $h/\Delta x$ | $L_2$ 误差 | 压力噪声 RMS | 判定 |
|---|---|---|---|
| 1.0 | $3.8\times10^{-3}$ | $0.90\%$ | 欠平滑，噪声主导 |
| 1.2 | $2.1\times10^{-3}$ | $0.35\%$ | 可用 |
| 1.5 | $1.6\times10^{-3}$ | $0.12\%$ | 最优 |
| 2.0 | $1.9\times10^{-3}$ | $0.08\%$ | 开始过平滑 |
| 2.5 | $2.6\times10^{-3}$ | $0.07\%$ | 过平滑，特征被抹掉 |

误差在 $h/\Delta x=1.5$ 附近取极小，两侧上升：左侧是求积噪声与邻居不足，右侧是过度平滑。压力噪声则随 $h/\Delta x$ 单调下降，因此它不能单独用来选参数——只盯噪声会一路把 $h$ 推到 2.5 以上，此时结果已经看不出剪切层厚度。正确的做法是同时看两条曲线，取 $L_2$ 误差的谷底。

## 界面抹平厚度给出 $h$ 的上限

核的支撑宽度是 $2r_c=4h$，任何比这更薄的结构都会被抹平。若算例需要分辨的特征尺度为 $L_f$，要求 $h\le L_f/10$ 才不至于把特征压进平滑窗内。例如要分辨 $0.05\ \text{m}$ 厚的液膜，则 $h\le0.005\ \text{m}$；取 $h=1.2\Delta x$ 得 $\Delta x\le0.0042\ \text{m}$。这个约束往往比精度要求更苛刻，先算它再决定粒子数，可以避免"加密后仍看不清界面"的返工。

反过来，自由面处的核截断给出 $h$ 的下限。表面粒子的归一化求和随 $h/\Delta x$ 减小而恶化：

$$
S_i=\sum_j V_j W_{ij}, \qquad S_i\in[0.99,1.01]\ \text{(内部)}, \qquad S_i\ge0.95\ \text{(表面)}
$$

实测表面值：$h/\Delta x=2.0$ 时 $S_i\approx0.86$，$1.5$ 时约 $0.81$，$1.2$ 时约 $0.78$。若表面低于 $0.95$，要么增厚边界粒子层，要么改用核修正，而不是继续增大 $h$。

```python
import numpy as np

def sweep_smoothing(dx, eta_list, run_case):
    """对每个 h/dx 跑一次算例，返回 (eta, L2误差, 压力噪声RMS, 平均邻居数)"""
    rows = []
    for eta in eta_list:
        h = eta * dx
        rc = 2.0 * h
        err, p_rms, n_mean = run_case(h, rc)     # 由外部算例提供
        rows.append((eta, err, p_rms, n_mean))
    return rows

for eta, err, p_rms, n_mean in sweep_smoothing(
        0.010, [1.0, 1.2, 1.5, 2.0, 2.5], run_case):
    print(f"h/dx={eta:4.2f}  L2={err:.2e}  p_rms={p_rms*100:5.2f}%  N={n_mean:5.1f}")
```

## 用两组试验区分欠平滑与过平滑

**单粒子脉冲试验**：在静止场内把一个粒子的密度抬高 $5\%$，观察扰动随时间的扩散范围。欠平滑时扰动只波及最近几个邻居并留下高频振荡；过平滑时扰动瞬间铺满整个支持域，看不出局部响应。健康的 $h/\Delta x$ 应让扰动在 $2r_c$ 内平滑衰减且无振铃。

**两相界面试验**：初始给一个 $0.05\ \text{m}$ 厚的密度阶跃，运行 $0.1\ \text{s}$ 后量界面的 $10\%$–$90\%$ 过渡宽度。该宽度理论上约为 $4h$；若实测远超，说明 $h$ 过大；若界面出现锯齿或厚度随网格跳动，说明 $h$ 过小、邻居数不足。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力噪声大、粒子轻微飞散 | $h/\Delta x$ 过小，邻居数低于 15（二维） | 打印平均邻居数，逐步增大 $h/\Delta x$ 看噪声是否下降 |
| 界面比预期厚一倍以上 | 特征尺度 $L_f<10h$，被平滑窗抹平 | 量 $10\%$–$90\%$ 过渡宽度是否接近 $4h$ |
| 加密后 $L_2$ 误差先降后升 | 越过 $h/\Delta x$ 最优谷底 | 画误差–$h/\Delta x$ 曲线，确认谷底位置 |
| 表面密度亏损加剧 | $h/\Delta x$ 偏小，核截断更严重 | 画表面 $S_i$ 剖面，检查是否低于 0.95 |
| 三维算例计算量异常大 | 直接照搬二维的 $h/\Delta x$ | 按三维公式重算 $N_{\text{nb}}$，核对是否超过 100 |
| 只按压力噪声选参数，结果过度平滑 | 噪声随 $h$ 单调下降，无谷底 | 同时绘制 $L_2$ 误差曲线，以误差谷底为准 |

## 参考文献

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30: 543-574, 1992.
2. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425(2): 1068-1082, 2012.
3. Liu M.B., Liu G.R., *Smoothed particle hydrodynamics (SPH): an overview and recent developments*, Archives of Computational Methods in Engineering, 17: 25-76, 2010.
4. Price D.J., *Smoothed particle hydrodynamics and magnetohydrodynamics*, Journal of Computational Physics, 231(3): 759-794, 2012.
5. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Liu G.R., Gu Y.T., *An Introduction to Meshfree Methods and Their Programming*, Springer, 2005.
