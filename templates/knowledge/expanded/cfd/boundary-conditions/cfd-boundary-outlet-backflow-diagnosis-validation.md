---
template_version: "flowlab-knowledge/1.0"
slug: cfd-boundary-outlet-backflow-diagnosis-validation
title: "出口回流处理：结果诊断与可信度验证"
summary: "用域长序列、Richardson 外推与网格收敛指数定量评估出口回流对目标量的污染，并与 Borda-Carnot 解析压损交叉校核。"
category:
  slug: boundary-conditions
  name: "边界条件与初始化"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "边界条件与初始化"
  - "出口回流处理"
  - "结果诊断与可信度验证"
  - "Richardson 外推"
  - "网格收敛指数"
seo:
  title: "出口回流处理：结果诊断与可信度验证"
  description: "用域长序列、Richardson 外推与网格收敛指数定量评估出口回流对目标量的污染，并与 Borda-Carnot 解析压损交叉校核。"
  keywords:
    - "出口回流处理"
    - "结果诊断与可信度验证"
    - "域长收敛"
    - "Richardson 外推"
    - "Borda-Carnot 压损"
---

# 出口回流处理：结果诊断与可信度验证

"出口够远了吗"这个问题只有一个可验证的答案：把出口逐级外移，看目标量序列是否单调收敛，并用 Richardson 外推给出极限值。单看流场图判断回流是否消失是靠不住的——回流面积可能已经降到 1%，但压降仍在以每级 3% 的速率漂移。本文给出一套以域长序列为自变量的验证流程，包括外推公式、网格收敛指数，以及用 Borda-Carnot 解析压损做交叉校核的方法。

## 用域长序列代替单点算例

验证出口位置需要至少三个域长构成序列，公比通常取 $r = 2$。以突扩下游为例，台阶高度 $h = 25\ \mathrm{mm}$，出口分别置于 $L = 8h, 16h, 32h$（即 $200\ \mathrm{mm}, 400\ \mathrm{mm}, 800\ \mathrm{mm}$），关注量为突扩总压损 $\Delta p$：

| 域长 | $L/h$ | 出口位置 | 逆流面积占比 $\Phi$ | $\Delta p$ |
| --- | --- | --- | --- | --- |
| $200\ \mathrm{mm}$ | 8 | $2.0 D_2$ | $18.5\%$ | $8.42\ \mathrm{kPa}$ |
| $400\ \mathrm{mm}$ | 16 | $4.0 D_2$ | $5.2\%$ | $7.35\ \mathrm{kPa}$ |
| $800\ \mathrm{mm}$ | 32 | $8.0 D_2$ | $1.1\%$ | $7.11\ \mathrm{kPa}$ |

两个信号同时收敛：逆流占比在 $32h$ 已降到 $1\%$ 量级，压降的逐级变化从 $14.5\%$ 降到 $3.3\%$。注意逆流占比的收敛速度快于压降，因此**不能只看回流面积来决定域长**。

## 回流质量流量而非面积占比

回流的危害由携带的质量、动量和能量通量决定。定义逆流质量分数

$$
\beta = \frac{\dot m_{bf}}{\dot m_{out}} = \frac{\displaystyle\int_{A_{bf}} \rho\, |u_n|\, \mathrm{d}A}{\displaystyle\int_{A_{out}} \rho\, u_n\, \mathrm{d}A}
$$

对上述 $L = 8h$ 算例，出口直径 $D_2 = 100\ \mathrm{mm}$，$A_{out} = \pi D_2^2/4 = 7.854\times 10^{-3}\ \mathrm{m^2}$，$\Phi = 18.5\%$ 对应逆流面积 $1.453\times 10^{-3}\ \mathrm{m^2}$，逆流区平均法向速度 $0.75\ \mathrm{m/s}$，水密度 $998\ \mathrm{kg/m^3}$：

$$
\dot m_{bf} = 998 \times 1.453\times 10^{-3} \times 0.75 = 1.09\ \mathrm{kg/s}
$$

上游质量流量 $\dot m_{out} = \rho A_1 U_1 = 998 \times 1.9635\times 10^{-3} \times 5 = 9.80\ \mathrm{kg/s}$，得 $\beta = 1.09/9.80 = 11.1\%$。工程阈值：$\beta < 1\%$ 可忽略回流变量；$1\% \sim 5\%$ 需检查回流温度与湍流量；$> 5\%$ 必须显式指定并复核能量收支。这里 $\beta = 11.1\%$，属于必须处理的情形。

## 瞬态峰值与稳态均值的差异

稳态求解器报告的逆流占比是时间平均，而真实的回流区往往由涡脱落驱动，瞬时峰值可以比均值大数倍。判定是否有周期性结构，用脱落频率估算：钝体尾迹的斯特劳哈尔数 $St = fD/U \approx 0.2$，在 $U = 5\ \mathrm{m/s}$、$D = 100\ \mathrm{mm}$ 下

$$
f = \frac{St\,U}{D} = \frac{0.2 \times 5}{0.1} = 10\ \mathrm{Hz}, \qquad T = \frac{1}{f} = 0.1\ \mathrm{s}
$$

瞬态验证时，时间步需每周期至少 50 点，即 $\Delta t \le 2\times 10^{-3}\ \mathrm{s}$，实际取 $10^{-3}\ \mathrm{s}$。此时记录逆流占比的时程，若峰值 $\Phi_{peak} = 34\%$ 而均值 $\bar\Phi = 5.2\%$，则峰值/均值比 6.5。**验证报告必须写明是峰值还是均值**，否则两个都"正确"的数字可以相差一个量级。

## Richardson 外推与网格收敛指数

域长序列的极限值用 Richardson 外推估计。设三级解 $q_1, q_2, q_3$ 对应公比 $r$ 的加密，表观收敛阶为 $p$，则

$$
q_{ext} = q_3 + \frac{q_3 - q_2}{r^{\,p} - 1}
$$

对本例 $q_2 = 7.35\ \mathrm{kPa}$，$q_3 = 7.11\ \mathrm{kPa}$，$r = 2$。对流主导的出口误差是一阶的，取 $p = 1$ 会给出 $q_{ext} = 7.11 + (7.11-7.35)/1 = 6.87\ \mathrm{kPa}$，低于解析值；取 $p = 2$（压力反馈主导）得

$$
q_{ext} = 7.11 + \frac{-0.24}{4 - 1} = 7.11 - 0.08 = 7.03\ \mathrm{kPa}
$$

网格收敛指数按 Roache 定义给出最细解的相对不确定度：

$$
\mathrm{GCI}_{32} = F_s \frac{\left| (q_3 - q_2)/q_3 \right|}{r^{\,p} - 1} = 1.25 \times \frac{0.0338}{3} = 1.4\%
$$

安全因子取 $F_s = 1.25$（三级解）。于是报告应写"$\Delta p = 7.11 \pm 0.10\ \mathrm{kPa}$（域长不确定度 1.4%）"，而不是一个裸数字。

## 与 Borda-Carnot 解析值的交叉校核

自洽不等于正确。突扩的不可逆压损有解析解，可作为独立校核：

$$
K = \left( 1 - \frac{A_1}{A_2} \right)^2, \qquad \Delta p_{theory} = K \frac{1}{2}\rho U_1^2
$$

面积比 $A_1/A_2 = (50/100)^2 = 0.25$，$K = 0.5625$，

$$
\Delta p_{theory} = 0.5625 \times 0.5 \times 998 \times 5^2 = 7018\ \mathrm{Pa} = 7.02\ \mathrm{kPa}
$$

外推值 $7.03\ \mathrm{kPa}$ 与解析值 $7.02\ \mathrm{kPa}$ 相差 $0.14\%$，远小于 GCI 的 $1.4\%$，同时确认了 $p = 2$ 的选择合理、$32h$ 的出口位置足够远。若外推值比解析值高 $10\%$ 以上，应优先怀疑出口仍在分离区内；若低 $10\%$ 以上，则可能是出口给了总压、抑制了逆流。

## 诊断脚本

下面的脚本对每对相邻域长解给出外推值与 GCI：

```python
import numpy as np
dp = np.array([8.42, 7.35, 7.11, 7.045])   # kPa, L/h = 8,16,32,64
r, p, Fs = 2.0, 2.0, 1.25
for i in range(1, len(dp) - 1):
    q_ext = dp[i+1] + (dp[i+1] - dp[i]) / (r**p - 1.0)
    gci = Fs * abs((dp[i+1] - dp[i]) / dp[i+1]) / (r**p - 1.0)
    print(f"L/h={2**(i+3):3d}  dp={dp[i+1]:.3f} kPa  "
          f"ext={q_ext:.3f} kPa  GCI={gci*100:.2f}%")
```

脚本对每一对相邻解给出外推值与 GCI，若外推值在三级之间漂移小于 GCI，序列可信；若漂移大于 GCI，说明尚未进入渐近区，需要继续外移。

## 失败模式对照

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 逆流占比已降到 1% 但压降仍每级变 3% | 回流面积小但速度大，动量通量仍显著 | 改用 $\beta$ 而非 $\Phi$ 判断，阈值取 $1\%$ |
| 外推值比 Borda-Carnot 高 10% 以上 | 出口仍位于分离区内 | 加一级 $L/h = 64$ 看外推值是否继续下降 |
| 稳态 $\Phi = 5\%$、瞬态峰值 $34\%$ | 涡脱落驱动，稳态掩盖了峰值 | 按 $St = 0.2$ 估 $f$，检查采样是否每周期 50 点以上 |
| 表观收敛阶 $p$ 拟合出 3.5 以上 | 序列未进入渐近区或存在非单调解 | 检查三级解是否单调，非单调时不可用 Richardson |
| GCI 小于 0.1% | 三级解被同一数值误差主导，序列无信息 | 换用更粗的域长序列重新构造 |
| 外推值比解析值低 10% 以上 | 出口给总压，逆流被抑制 | 改为固定静压重算，比较压降是否上升 |

## 参考文献

1. Richardson L.F., "The Approximate Arithmetical Solution by Finite Differences of Physical Problems", *Philosophical Transactions of the Royal Society A*, 210, 307-357, 1911.
2. Roache P.J., "Perspective: A Method for Uniform Reporting of Grid Refinement Studies", *Journal of Fluids Engineering*, 116(3), 405-413, 1994.
3. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E., "Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications", *Journal of Fluids Engineering*, 130(7), 078001, 2008.
4. ASME, *V&V 20-2009: Standard for Verification and Validation in CFD and Heat Transfer*, 2009.
5. Eaton J.K., Johnston J.P., "A Review of Research on Subsonic Turbulent Flow Reattachment", *AIAA Journal*, 19(9), 1093-1100, 1981.
