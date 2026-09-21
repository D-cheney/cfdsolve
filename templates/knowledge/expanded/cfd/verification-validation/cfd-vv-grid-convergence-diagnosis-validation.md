---
template_version: "flowlab-knowledge/1.0"
slug: cfd-vv-grid-convergence-diagnosis-validation
title: "网格收敛与 GCI：结果诊断与可信度验证"
summary: "从相邻差比值而不是 GCI 数字入手做网格收敛诊断：用三套 r=1.5 网格手算表观阶、Richardson 外推与 GCI，再用渐近性互检判定该 GCI 能否采信，并区分振荡收敛、非等比加密、迭代误差与 y+ 漂移四类伪收敛。"
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
  - "网格收敛与 GCI"
  - "结果诊断与可信度验证"
  - "渐近性互检"
  - "Richardson 外推"
seo:
  title: "网格收敛与 GCI：结果诊断与可信度验证"
  description: "从相邻差比值而不是 GCI 数字入手做网格收敛诊断：用三套 r=1.5 网格手算表观阶、Richardson 外推与 GCI，再用渐近性互检判定该 GCI 能否采信，并区分振荡收敛、非等比加密、迭代误差与 y+ 漂移四类伪收敛。"
  keywords:
    - "网格收敛与 GCI"
    - "结果诊断与可信度验证"
    - "渐近性互检"
    - "表观收敛阶"
    - "离散不确定度"
---

# 网格收敛与 GCI：结果诊断与可信度验证

网格收敛诊断的真正入口不是 GCI 的百分比，而是相邻两级结果之差的比值。比值落在合理区间、表观阶贴近格式名义阶、且粗网格 GCI 与细网格 GCI 满足渐近关系时，GCI 才可以写进报告；任一条不成立，算出来的百分比只是一个看似严谨的错数字。本文用一次完整的手算展示判读流程，并把振荡收敛、非等比加密、迭代误差与 y+ 漂移这四类伪收敛拆开。

## 诊断从相邻差比值开始

设粗、中、细三套网格的目标量为 $\phi_3,\phi_2,\phi_1$，对应代表网格尺度 $h_3 > h_2 > h_1$。先算两个相邻差与它们的比值：

$$
\epsilon_{21} = \phi_2 - \phi_1, \qquad \epsilon_{32} = \phi_3 - \phi_2, \qquad R = \frac{\epsilon_{32}}{\epsilon_{21}}
$$

$R$ 的符号比它的数值更有信息量。$R > 0$ 表示单调收敛，$R < 0$ 表示振荡收敛；后者几乎总意味着粗网格远离渐近区，或者某一级根本没算收敛。在恒定加密比 $r$ 下，表观阶由比值直接给出：

$$
p = \frac{\ln|R|}{\ln r}
$$

若 $|R|$ 落在 1 到 4 之间，说明相邻差正在按幂律缩小，具备进入渐近区的基本特征；$|R|$ 接近 1（例如 1.05）则说明结果几乎不随网格变化。

## 一次完整手算：三套 r=1.5 网格

某管内对流换热算例按等比加密生成三套网格，目标量取壁面平均 Nusselt 数，$r = 0.0150/0.0100 = 1.50$。

| 网格 | $h\ \mathrm{(m)}$ | 单元数 | $Nu$ | 相邻差 |
|---|---|---|---|---|
| 细 | 0.0100 | 3,200,000 | 25.60 | — |
| 中 | 0.0150 | 950,000 | 25.20 | $\epsilon_{21} = -0.40$ |
| 粗 | 0.0225 | 280,000 | 24.30 | $\epsilon_{32} = -0.90$ |

收敛比为 $R = -0.90/(-0.40) = 2.25$，同号，属单调收敛。表观阶

$$
p = \frac{\ln 2.25}{\ln 1.50} = \frac{0.8109}{0.4055} = 2.00
$$

与二阶格式的名义阶完全一致。Richardson 外推到 $h \to 0$：

$$
\phi_{ext} = \phi_1 + \frac{\phi_1 - \phi_2}{r^{p} - 1} = 25.60 + \frac{0.40}{2.25 - 1} = 25.60 + 0.32 = 25.92
$$

细网格 GCI 与中网格 GCI 分别为

$$
GCI_{21} = F_s \frac{|(\phi_2 - \phi_1)/\phi_1|}{r^{p} - 1} = 1.25 \times \frac{0.40/25.60}{1.25} = 1.56\%
$$

$$
GCI_{32} = F_s \frac{|(\phi_3 - \phi_2)/\phi_2|}{r^{p} - 1} = 1.25 \times \frac{0.90/25.20}{1.25} = 3.57\%
$$

$F_s = 1.25$ 适用于三套网格且已算出观测阶的情形；只有两套网格或阶次无法确认时取 3.0。

## 渐近性互检决定这个 GCI 能不能用

算出 $p$ 并不等于算出可信的 GCI。三套网格必须满足外推关系

$$
GCI_{32} \approx r^{p}\, GCI_{21}
$$

代入 $r^p = 1.50^{2.00} = 2.25$，右侧为 $2.25 \times 1.56\% = 3.51\%$，与 $GCI_{32} = 3.57\%$ 相差 $1.6\%$，远小于 10% 的判定线，说明该算例确实处于渐近区，$GCI_{21} = 1.56\%$ 可以采信。互检不通过时的诊断顺序是固定的：先看偏差是否超过 30%，若是则对最细网格再加密一级，观察偏差是否收敛到 10% 以内；若加密后偏差不降，检查三套网格是否用了同一残差收敛限值与同一后处理采样面。

## 非等比加密与振荡收敛的处理

受几何清理限制，三套网格常常做不到严格等比，此时若直接用同一个 $r$ 硬算，表观阶会被系统性歪曲。正确做法是逐级代入有效加密比并迭代求解：

$$
p = \frac{1}{\ln r_{21}}\left|\ln\left|\frac{\epsilon_{32}}{\epsilon_{21}}\right| + \ln\frac{r_{21}^{p} - s}{r_{32}^{p} - s}\right|, \qquad s = \operatorname{sign}\!\left(\frac{\epsilon_{32}}{\epsilon_{21}}\right)
$$

以 $r_{21} = 1.50$、$r_{32} = 1.60$、$R = 2.25$ 为例，用 $p = 2.00$ 作初值代入右侧得 $p = 1.86$，再迭代一轮得 $p = 1.88$，两轮内即稳定。若某级加密比偏离超过 15%，例如 $r_{32} = 1.80$，则 $p$ 会掉到 1.55 以下，此时宁可补做一套等比网格。

$R < 0$ 时不应套用任何外推公式。判定的关键是补一级中间网格：若补入后 $R$ 恢复同号，说明原粗网格离群，可弃用它重算；若补入后仍反号，则要检查是否存在限制器在粗网格上频繁切换、或对称算例中的奇偶模式未被分辨。

## 迭代误差与 y+ 漂移会伪造网格收敛

网格收敛比较的是空间离散误差，一旦混入迭代误差，GCI 就被污染。判定线可以量化：把每套网格的目标量随迭代的历史画出来，要求最后 20% 迭代步内目标量漂移小于该网格 GCI 的十分之一，即 $U_i < 0.1\,GCI$。若细网格 GCI 为 1.56%，则 $Nu$ 在收敛段内的漂移应小于 0.04。

壁面网格加密还会改变 y+，从而改变壁面模型的适用性。以 $U_\infty = 20\ \mathrm{m/s}$、$\nu = 1.5\times10^{-5}\ \mathrm{m^2/s}$、$u_\tau = 1.05\ \mathrm{m/s}$ 为例，按 $y^+ = y u_\tau/\nu$ 计算，首层高度按 $r = 1.5$ 等比缩小时依次得到 $0.50\ \mathrm{mm} \to 35.0$、$0.33\ \mathrm{mm} \to 23.1$、$0.22\ \mathrm{mm} \to 15.4$。粗网格的 35.0 适合壁面函数，最细网格的 15.4 已落进缓冲层，壁面函数假设失效，三套网格比较的不再是同一套物理模型。处理办法是只加密流向与展向、保持首层高度不变。

```python
import math
def gci(phi1, phi2, phi3, r, Fs=1.25):
    R = (phi3 - phi2) / (phi2 - phi1)      # 相邻差之比, 负值为振荡收敛
    p = math.log(abs(R)) / math.log(r)     # 表观阶
    ext = phi1 + (phi1 - phi2) / (r**p - 1)
    g21 = Fs * abs((phi2 - phi1) / phi1) / (r**p - 1)
    g32 = Fs * abs((phi3 - phi2) / phi2) / (r**p - 1)
    return f"p={p:.2f} ext={ext:.2f} GCI21={g21:.2%} 互检={abs(g32-r**p*g21)/(r**p*g21):.1%}"
print(gci(25.60, 25.20, 24.30, 1.50))
# p=2.00 ext=25.92 GCI21=1.56% 互检=1.6%
```
## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $R < 0$，相邻差反号 | 粗网格远离渐近区，或某级未算收敛 | 补一级中间网格重算 $R$，符号恢复即确认粗网格离群 |
| $p \approx 1.00$ 而格式名义阶为 2 | 一阶迎风污染或边界处理降阶 | 把对流格式改纯中心（保证 $Pe_h < 2$）重算，$p$ 回升即格式问题 |
| 渐近性互检偏差超过 30% | 尚未进入渐近区 | 最细网格再加密一级，观察互检偏差是否收敛到 10% 以内 |
| 加密后 y+ 掉进缓冲层 | 首层高度随加密等比缩小 | 打印三套网格 y+，必要时只加密流向与展向 |

## 报告里必须成对出现的量

只写"网格已加密，离散不确定度约 2%"是不合格的报告。可复核的最小集合是：三套网格的单元数与代表尺度 $h$、有效加密比 $r_{21}$ 与 $r_{32}$、目标量定义与采样面、残差收敛限值与目标量漂移量、$R$、$p$ 与名义阶的对比、$F_s$ 取值、外推值、细网格与中网格 GCI、渐近性互检偏差，以及 y+ 范围。选生产网格的判据不是"最细的那套"：若中网格 GCI 已低于验收线且它与细网格的差异落在细网格 GCI 之内，可用中网格生产、保留细网格核验。

## 参考文献

1. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E., Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications, *Journal of Fluids Engineering*, 130(7), 2008.
2. Roache P.J., Perspective: A Method for Uniform Reporting of Grid Refinement Studies, *Journal of Fluids Engineering*, 116(3), 1994.
3. ASME V&V 20-2009, *Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, ASME, 2009.
4. Eça L., Hoekstra M., A procedure for the estimation of the numerical uncertainty of CFD calculations based on grid refinement studies, *Journal of Computational Physics*, 262, 2014.
5. Oberkampf W.L., Roy C.J., *Verification and Validation in Scientific Computing*, Cambridge University Press, 2010.
6. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
