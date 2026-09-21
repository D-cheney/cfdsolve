---
template_version: "flowlab-knowledge/1.0"
slug: cfd-vv-uncertainty-budget-diagnosis-validation
title: "输入与模型不确定度预算：结果诊断与可信度验证"
summary: "把确认不确定度拆成 U_num、U_input、U_D 与模型族离散度四项并逐项算方差贡献：给出中心差分敏感度换算、ASME V&V 20 的确认判定口径，以及临界通过、敏感度相消、覆盖因子混用等预算失效的判定试验。"
category:
  slug: verification-validation
  name: "验证确认与后处理"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "验证确认与后处理"
  - "输入与模型不确定度预算"
  - "结果诊断与可信度验证"
  - "敏感度系数"
  - "ASME V&V 20"
seo:
  title: "输入与模型不确定度预算：结果诊断与可信度验证"
  description: "把确认不确定度拆成 U_num、U_input、U_D 与模型族离散度四项并逐项算方差贡献：给出中心差分敏感度换算、ASME V&V 20 的确认判定口径，以及临界通过、敏感度相消、覆盖因子混用等预算失效的判定试验。"
  keywords:
    - "输入与模型不确定度预算"
    - "结果诊断与可信度验证"
    - "敏感度系数"
    - "ASME V&V 20"
    - "确认不确定度"
---

# 输入与模型不确定度预算：结果诊断与可信度验证

不确定度预算的诊断价值不在最后那个合成数字，而在各项的方差贡献占比。占比决定资源投向：若实验数据项吃掉一半预算，再去加密网格就是浪费；若数值项占比不到 10%，任何"网格还不够细"的解释都站不住。本文给出从输入公差到确认判定的完整换算链、ASME V&V 20 的三项口径与显式加入模型族离散度的扩展口径，以及临界通过这一结局如何诊断。

## 三项分解与确认判定口径

ASME V&V 20 把确认不确定度定义为数值、输入与实验数据三部分的平方和：

$$
U_{val} = \sqrt{U_{num}^2 + U_{input}^2 + U_D^2}
$$

其中 $U_{num}$ 来自网格、时间步与迭代误差，$U_{input}$ 来自几何公差、边界测量与物性分散，$U_D$ 来自传感器标定、重复性与参考量测量。判定规则是：偏差 $E = \phi_{model} - \phi_{data}$ 满足 $|E| \le U_{val}$ 时，在该置信水平下模型获得确认；否则超出部分 $|E| - U_{val}$ 归为模型形式偏差。三项都必须换算到与 $E$ 相同的量纲与绝对量级。

需要显式估计模型形式不确定度时，用同一工况下模型族结果的半极差：

$$
U_{model} = \frac{1}{2}\left(\max_j \phi_j - \min_j \phi_j\right)
$$

$\phi_j$ 为第 $j$ 个闭合模型算出的同一目标量。这一项与 $U_{val}$ 的语义不同：前者是"不同模型彼此差多少"，后者是"已知的误差来源加起来有多大"。

## 敏感度系数把输入公差换算成目标量区间

输入不确定度不能直接读公差百分比，必须先乘敏感度系数。相对形式的敏感度与合成关系为

$$
S_i = \frac{\partial \phi}{\partial x_i}\cdot\frac{x_i}{\phi}, \qquad \frac{U_{input}}{\phi} = \sqrt{\sum_i \left(S_i \frac{U_{x_i}}{x_i}\right)^2}
$$

$S_i$ 无量纲，含义是输入 $x_i$ 相对变化 1% 时目标量相对变化百分之几。缺少解析导数时用中心差分估计 $\partial \phi/\partial x_i \approx [\phi(x_i + \Delta) - \phi(x_i - \Delta)]/(2\Delta)$，步长 $\Delta$ 取输入标准差的 1 到 2 倍：太大则跨过非线性区，太小则被输出有效位数淹没。以入口速度 $U = 10.0\ \mathrm{m/s}$、$\Delta = 0.1\ \mathrm{m/s}$ 为例，扫描得到 $\phi(10.1) = 13.35\ \mathrm{kPa}$、$\phi(9.9) = 12.85\ \mathrm{kPa}$，故 $\partial \Delta p/\partial U = 0.50/0.20 = 2.50\ \mathrm{kPa/(m/s)}$，在 $\Delta p = 13.1\ \mathrm{kPa}$ 处 $S_U = 2.50\times10.0/13.1 = 1.91$。这个值意味着压降对流量近似呈 1.91 次幂，与湍流管流的 1.8 到 2.0 次幂范围一致，可作为敏感度的交叉检查；多输入交互时先用 Morris 筛选排序，只对前 2 到 3 个参数做 Sobol 分解。

## 一次完整的预算表

工况为管内湍流压降确认，计算值 $\Delta p_{model} = 13.1\ \mathrm{kPa}$，实验值 $\Delta p_{data} = 12.4\ \mathrm{kPa}$，实验数据在 95% 置信水平下的半宽 $U_D = 0.5\ \mathrm{kPa}$。
| 来源 | 输入区间 | 敏感度 $S_i$ | 相对贡献 | 绝对量 $\mathrm{(kPa)}$ | 方差占比 |
|---|---|---|---|---|---|
| 入口速度 $U$ | $10.0 \pm 0.2\ \mathrm{m/s}$（2.0%） | 1.91 | 3.82% | 0.500 | — |
| 动力黏度 $\mu$ | $1.002\times10^{-3}\ \mathrm{Pa\cdot s}$（1.5%） | 0.20 | 0.30% | 0.039 | — |
| 管径 $D$ | $50.0 \pm 0.1\ \mathrm{mm}$（0.20%） | $-4.80$ | 0.96% | 0.126 | — |
| 输入合成 $U_{input}$ | — | — | 3.95% | 0.5175 | 47.9% |
| 数值 $U_{num}$（GCI） | — | — | 1.56% | 0.2044 | 7.5% |
| 数据 $U_D$（$k=2$） | — | — | 4.03% | 0.5000 | 44.7% |

输入合成按平方和计算：$\sqrt{3.82^2 + 0.30^2 + 0.96^2}\% = \sqrt{15.604}\% = 3.95\%$。合成确认不确定度为

$$
U_{val} = \sqrt{0.2044^2 + 0.5175^2 + 0.5000^2} = \sqrt{0.5596} = 0.748\ \mathrm{kPa}
$$

偏差 $E = 13.1 - 12.4 = 0.700\ \mathrm{kPa}$ 小于 $U_{val}$，确认通过，但余量仅 0.048 kPa，相当于 $U_{val}$ 的 6.4%。这个结局必须标为临界通过：三项已经吃掉几乎全部预算，任何一项被低估都会让结论翻转。诊断结论是主导项为 $U_{input}$（47.9%）与 $U_D$（44.7%），资源应投向收紧入口速度测量与实验重复性，而不是继续加密网格。

## 模型形式不确定度只能靠模型族离散度估计

把三个闭合模型在同一网格、同一后处理口径下重算，$\Delta p$ 分别为 k-ε 的 $12.4\ \mathrm{kPa}$、SST 的 $13.1\ \mathrm{kPa}$、雷诺应力模型的 $13.6\ \mathrm{kPa}$，半极差 $U_{model} = (13.6 - 12.4)/2 = 0.60\ \mathrm{kPa}$，即 4.58%。显式加入这一项后 $U_{val} = \sqrt{0.2044^2 + 0.5175^2 + 0.60^2 + 0.50^2} = 0.959\ \mathrm{kPa}$，余量升到 0.259 kPa。余量变大并不代表结论更可信，只是区间被拉宽。若模型族里三个模型都系统性偏低（本例实验值 12.4 kPa 正好等于最低的 k-ε 结果），半极差会把偏差的中心一起挪走，掩盖共同的模型偏差。诊断办法是比较模型族结果的中位数与实验值。

```python
import math
phi, U_D = 13.1, 0.500                        # kPa
S   = {'U': 1.91, 'mu': 0.20, 'D': -4.80}     # 相对敏感度
rel = {'U': 0.020, 'mu': 0.015, 'D': 0.002}   # 输入相对不确定度
u_in  = math.sqrt(sum((S[k]*rel[k])**2 for k in S)) * phi
u_num = 0.0156 * phi                          # GCI 相对值换算为绝对
U_val = math.sqrt(u_num**2 + u_in**2 + U_D**2)
share = {n: v**2/U_val**2 for n, v in
         [('U_num', u_num), ('U_input', u_in), ('U_D', U_D)]}
print(f"U_input={u_in:.4f} U_val={U_val:.4f} E={phi-12.4:.3f}")
print("方差占比:", {k: f"{v:.1%}" for k, v in share.items()})
# U_input=0.5175 U_val=0.7481 E=0.700
# {'U_num': '7.5%', 'U_input': '47.9%', 'U_D': '44.7%'}
```

## 覆盖因子与相对绝对混用

确认判定要求所有项在同一置信水平下合成。常见的错误是输入公差按 1σ 给出、实验区间按 95% 给出，两者直接进平方和；统一到 $k = 2$ 的做法是把每个标准不确定度乘覆盖因子后再合成，而不是给合成结果统一乘 2。另一类错误是相对量当绝对量：本例 $U_{input}$ 的 3.95% 相对计算值 13.1 kPa 定义，$U_D$ 的 4.03% 相对实验值 12.4 kPa 定义，两者基准相差 5.6%，直接相加会引入同量级偏差。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 换工况后 $U_{input}$ 翻倍 | 相对量被当绝对量相加，未乘回目标量 | 把每项换算成同一目标量的绝对单位后重新合成 |
| 合成不确定度异常小 | 正负敏感度代数相加相消 | 逐项打印 $\partial \phi/\partial x_i$ 的符号与绝对值，改用平方和 |
| 三项口径下临界通过 | 数值与输入误差已占满预算 | 打印各项方差占比，找出超过 40% 的主导项并优先收紧 |
| $U_{model}$ 估计为 0 或缺失 | 只用一个湍流模型或单一闭合 | 至少三个模型族重算取半极差，并比较中位数与实验值 |

## 预算记录的最小集合

一份可复核的记录包含：目标量定义与采样面、每个输入的标称值、区间与置信水平、敏感度的计算方法与差分步长、各项的绝对量与相对量、方差占比、$U_{val}$ 与 $E$ 的比较、结论等级，以及模型族清单与其离散度。临界通过的记录还要写明下一步收紧哪一项。

## 参考文献

1. ASME V&V 20-2009, *Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, ASME, 2009.
2. Oberkampf W.L., Roy C.J., *Verification and Validation in Scientific Computing*, Cambridge University Press, 2010.
3. AIAA G-077-1998, *Guide for the Verification and Validation of Computational Fluid Dynamics Simulations*, AIAA, 1998.
4. Coleman H.W., Steele W.G., *Experimentation, Validation, and Uncertainty Analysis for Engineers*, 3rd ed., Wiley, 2009.
5. Saltelli A., Ratto M., Andres T., et al., *Global Sensitivity Analysis: The Primer*, Wiley, 2008.
