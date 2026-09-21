---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-laminar-transition-diagnosis-validation
title: "层流到湍流的转捩：结果诊断与可信度验证"
summary: "转捩位置算错时，壁面摩擦可以差 5 倍以上。本文给出用临界雷诺数、Michel 关联式、形状因子与间歇因子三条独立证据定位转捩点的流程，以及网格与来流湍流度导致的假转捩识别方法。"
category:
  slug: physics
  name: "流体力学基础"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "流体力学基础"
  - "层流到湍流的转捩"
  - "结果诊断与可信度验证"
  - "形状因子"
  - "间歇因子"
seo:
  title: "层流到湍流的转捩：结果诊断与可信度验证"
  description: "转捩位置算错时，壁面摩擦可以差 5 倍以上。本文给出用临界雷诺数、Michel 关联式、形状因子与间歇因子三条独立证据定位转捩点的流程，以及网格与来流湍流度导致的假转捩识别方法。"
  keywords:
    - "层流到湍流的转捩"
    - "结果诊断与可信度验证"
    - "形状因子"
    - "间歇因子"
---

# 层流到湍流的转捩：结果诊断与可信度验证

转捩位置对结果的影响是阶跃式的：转捩点前后壁面摩擦系数可以相差 5 倍以上，边界层厚度与分离趋势随之改变。因此验证转捩算例的核心任务是定位转捩点，并用彼此独立的判据互相印证。本文给出三条可分别计算的判据，以及区分"物理转捩"与"网格或来流造成的假转捩"的判定试验。

## 1 判据一：临界雷诺数给出的预期位置

平板边界层的自然转捩在低湍流度来流中约发生在

$$
Re_{x,c} = \frac{U_\infty x_c}{\nu} \approx 5\times10^{5}
$$

取 $U_\infty = 30\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$，则 $x_c = 5\times10^{5}\times1.5\times10^{-5}/30 = 0.25\,\mathrm{m}$。若算例的转捩点落在 0.10 m 或 0.60 m，偏差已超过 100%，必须先解释来源再讨论其他量。作为对照，$x = 1\,\mathrm{m}$ 处 $Re_x = 2.0\times10^{6}$，早已处于湍流区。

## 2 判据二：动量厚度雷诺数与 Michel 关联式

动量厚度雷诺数 $Re_\theta = \rho U\theta/\mu$ 是转捩最常用的关联参数，Michel 关联式给出转捩对应的值：

$$
Re_{\theta,t} = 1.174\left(1+\frac{22400}{Re_x}\right)Re_x^{0.46}
$$

在 $Re_x = 5\times10^{5}$ 处代入：$Re_x^{0.46} = 418.4$，括号项 $= 1+22400/5\times10^{5} = 1.045$，得 $Re_{\theta,t} = 1.174\times1.045\times418.4 = 513$。这个数字很有用：算例中提取沿程 $Re_\theta$，它首次超过 513 的位置就是 CFD 认定的转捩点，与 $Re_x = 5\times10^{5}$ 的判据应当落在同一处（允许 20% 的位置差）。

## 3 判据三：壁面摩擦的阶跃与形状因子

转捩的另一个直接信号是壁面摩擦系数出现数量级跃升。层流与湍流的局部摩擦系数分别为

$$
c_{f,\text{lam}} = \frac{0.664}{\sqrt{Re_x}}, \qquad c_{f,\text{turb}} = \frac{0.0592}{Re_x^{0.2}}
$$

在 $Re_x = 1.0\times10^{6}$：层流 $c_f = 0.664/1000 = 6.64\times10^{-4}$，湍流 $c_f = 0.0592/15.85 = 3.74\times10^{-3}$，相差 5.6 倍。在 $Re_x = 2.0\times10^{6}$ 处相差 6.9 倍。因此把沿程 $c_f$ 曲线画出来，转捩点表现为一个明显的台阶。

形状因子 $H_{12} = \delta^{*}/\theta$ 提供第三条独立证据：层流边界层 $H_{12} \approx 2.5\sim2.6$，湍流降至 $1.3\sim1.4$。$H_{12}$ 的下降位置应与 $c_f$ 台阶位置一致；若两者相差很远，说明采样或后处理有问题。

## 4 来流湍流度把转捩提前多少

风洞与工程环境中的来流湍流度 $Tu$ 会显著前移转捩点。Abu-Ghannam 与 Shaw 的关联式为

$$
Re_{\theta,t} = 163 + \exp\left(6.91-Tu\right)
$$

$Tu$ 以百分数代入：$Tu = 1\%$ 得 $Re_{\theta,t} = 163+369 = 532$；$Tu = 3\%$ 得 $163+49.9 = 213$；$Tu = 6\%$ 得 $163+2.49 = 165$。也就是说湍流度从 1% 升到 3%，转捩所需的 $Re_\theta$ 下降了 60%，转捩点会明显前移。算例入口若未显式给出 $Tu$，求解器会取默认值（常见 1%～5%），这本身就是转捩位置不可复现的根源。

## 5 网格能否分辨转捩过程

T-S 波是转捩的物理载体，其波长约为边界层厚度的 6 倍。$Re_x = 5\times10^{5}$ 处 Blasius 边界层厚度 $\delta \approx 5x/\sqrt{Re_x} = 5\times0.25/707 = 1.77\,\mathrm{mm}$，对应 T-S 波长约 10 mm。要在数值上让扰动增长，流向网格至少需要 20 个点/波长，即 $\Delta x \le 0.5\,\mathrm{mm}$；同时壁面 $y^{+}$ 必须小于 1。若流向网格是 5 mm，扰动无法增长，转捩要么不发生、要么被数值扰动强行触发在网格尺度上。

## 6 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 转捩点比 Michel 关联式晚一倍 | 入口 $Tu$ 太小，或未开转捩模型 | 打印入口 $k$、$\omega$ 与 $Tu$，用 Abu-Ghannam 式反算预期 $Re_{\theta,t}$ |
| 转捩点在入口第一格就完成 | 入口湍流量过大，把扰动直接灌进来 | 把入口 $Tu$ 降到 0.5% 复算，看转捩点是否后移 |
| 转捩位置随网格加密持续移动 | 数值扰动而非物理扰动在触发转捩 | 用三套流向网格，若位置不收敛则判为网格控制 |
| $c_f$ 台阶与 $H_{12}$ 下降位置不重合 | 后处理采样面或统计方式不一致 | 用同一套采样面重算 $c_f$、$\delta^{*}$、$\theta$ |
| 全湍流模型给出的 $c_f$ 比层流段高 5 倍 | 模型无转捩机制，全程按湍流处理 | 检查是否使用 $\gamma$-$Re_\theta$ 或 $e^N$ 方法 |
| 层流分离泡被抹平、阻力偏低 | 分离泡内流向网格不足 | 加密分离区，检查是否出现压力平台与再附点 |

## 7 用独立脚本核对转捩点

```bash
# 提取壁面剪切并沿程反算 cf
postProcess -func "wallShearStress(patches=(plate))" -latestTime
python3 - <<'PY'
import math
rho, U, nu = 1.225, 30.0, 1.5e-5
tau = [0.0009, 0.0011, 0.0026, 0.0049, 0.0071]   # 壁面剪切, Pa
x   = [0.10, 0.20, 0.30, 0.40, 0.50]             # 沿程位置, m
for xi, tw in zip(x, tau):
    Rex = U * xi / nu
    cf  = tw / (0.5 * rho * U**2)
    print(f"x={xi:.2f} m  Re_x={Rex:.2e}  cf={cf:.2e}")
# 用 Michel 关联式反算预期转捩 Re_x
Rx = 5.0e5
print("Re_theta,t(Michel) =", 1.174*(1+22400/Rx)*Rx**0.46)
PY
```

$c_f$ 在 $x = 0.20\sim0.30\,\mathrm{m}$ 之间的跃升与 $Re_{x,c} = 5\times10^{5}$ 给出的 $x_c = 0.25\,\mathrm{m}$ 一致，说明转捩点物理合理。

## 8 验收时要能回答的问题

1. 沿程 $c_f$ 台阶位置与 $Re_{x,c} = 5\times10^{5}$ 的预期是否在 20% 以内一致？
2. 提取的 $Re_\theta$ 首次超过 Michel 值的横坐标是否与台阶位置一致？
3. $H_{12}$ 是否从 2.5 量级下降到 1.4 量级，且下降位置一致？
4. 入口湍流度是否显式给定并记录，是否与实验条件匹配？
5. 流向网格是否满足 20 点/波长、壁面 $y^{+} < 1$？
6. 三套网格下的转捩位置是否收敛（变化小于 10%）？
7. 若使用全湍流模型，是否说明了不能预测转捩这一事实？

## 9 参考文献

1. Schlichting H., Gersten K., *Boundary-Layer Theory*, 9th ed., Springer, 2017.
2. Mayle R.E., "The Role of Laminar-Turbulent Transition in Gas Turbine Engines," *ASME Journal of Turbomachinery*, 1991.
3. Morkovin M.V., "On the Many Faces of Transition," in *Viscous Drag Reduction*, Plenum Press, 1969.
4. Langtry R.B., Menter F.R., "Correlation-Based Transition Modeling for Unstructured Parallelized CFD Codes," *AIAA Journal*, 2009.
