---
template_version: "flowlab-knowledge/1.0"
slug: cfd-boundary-coupled-interface-diagnosis-validation
title: "共轭与耦合界面：结果诊断与可信度验证"
summary: "用界面通量不平衡、一维热阻网络解析基准与固体侧 Fourier 数校验共轭传热算例，给出可核对的界面温度手算与能量收支检查脚本。"
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
  - "共轭与耦合界面"
  - "结果诊断与可信度验证"
  - "界面能量守恒"
  - "Fourier 数"
seo:
  title: "共轭与耦合界面：结果诊断与可信度验证"
  description: "用界面通量不平衡、一维热阻网络解析基准与固体侧 Fourier 数校验共轭传热算例，给出可核对的界面温度手算与能量收支检查脚本。"
  keywords:
    - "共轭与耦合界面"
    - "结果诊断与可信度验证"
    - "界面热流"
    - "能量守恒"
    - "Fourier 数"
---

# 共轭与耦合界面：结果诊断与可信度验证

共轭传热算例容易出现"看起来收敛、账目对不上"的情况：残差降到 $10^{-5}$，温度场光滑，但界面两侧热流相差 15%。这类问题不会自己暴露，必须靠三项独立的守恒与基准检查。本文给出界面通量不平衡判据、一维热阻网络解析基准、固体侧网格与时间步的独立要求，以及对账脚本。

## 三项必查的守恒账

共轭算例的对账分三层，缺一层就无法定位误差来源：**界面局部账**要求每个面元上两侧法向热流相等，$q''_f = q''_s$；**区域整体账**要求流体域进出口焓差等于界面总传热量，$\dot Q_{in} - \dot Q_{out} = \dot Q_\Gamma$；**系统整体账**要求加热功率等于冷却侧带走的热量加储能变化。若第一层账合格而第二层不合格，说明界面之外还有未计入的换热面（通常是外壁面漏热）；若第一层就不合格，说明界面配对或插值有结构性错误，加密网格无效。

## 界面通量不平衡的判据

定义界面通量不平衡率

$$
\varepsilon_q = \frac{\left| q''_f - q''_s \right|}{\max \left( \left| q''_f \right|, \left| q''_s \right| \right)} \times 100\%
$$

该量应逐面元统计，报告最大值与面积加权平均值。判据：面匹配界面加权平均 $\varepsilon_q < 0.5\%$，非一致网格允许到 $2\%$；任何单面元的 $\varepsilon_q$ 都不应超过 $10\%$。举例：流体侧给出 $352\ \mathrm{kW/m^2}$、固体侧 $351\ \mathrm{kW/m^2}$，则 $\varepsilon_q = 1/352 = 0.28\%$，合格；若固体侧给出 $299\ \mathrm{kW/m^2}$，则 $\varepsilon_q = 15\%$，说明两侧温度场各自收敛到了不同解，耦合没有真正生效。

## 用一维热阻网络建立解析基准

验证共轭结果最有效的手段是构造一个有解析解的一维对照。对"热流体—固体板—冷流体"结构，忽略固体内部横向导热时总热阻为

$$
R''_{tot} = \frac{1}{h_h} + \frac{t}{k_s} + \frac{1}{h_c}, \qquad q'' = \frac{T_h - T_c}{R''_{tot}}
$$

取热侧 $T_h = 800\ \mathrm{K}$、$h_h = 1500\ \mathrm{W/(m^2\cdot K)}$，冷侧 $T_c = 350\ \mathrm{K}$、$h_c$ 极大（近等温壁），不锈钢板 $k_s = 16.3\ \mathrm{W/(m\cdot K)}$、厚度 $t = 10\ \mathrm{mm}$：

$$
R''_{tot} = \frac{1}{1500} + \frac{0.010}{16.3} = 6.667\times 10^{-4} + 6.135\times 10^{-4} = 1.280\times 10^{-3}\ \mathrm{m^2\cdot K/W}
$$

$$
q'' = \frac{800 - 350}{1.280\times 10^{-3}} = 3.52\times 10^{5}\ \mathrm{W/m^2} = 352\ \mathrm{kW/m^2}
$$

热侧界面温度（固体外表面）为

$$
T_\Gamma = T_h - \frac{q''}{h_h} = 800 - \frac{3.52\times 10^{5}}{1500} = 565.6\ \mathrm{K}
$$

校核：$q'' t/k_s = 3.52\times 10^{5} \times 6.135\times 10^{-4} = 215.9\ \mathrm{K}$，$565.6 - 215.9 = 349.7\ \mathrm{K}$，与冷侧 $350\ \mathrm{K}$ 相差 $0.3\ \mathrm{K}$，说明热阻分解正确。若 CFD 给出界面温度 $545\ \mathrm{K}$，与解析值差 $20.6\ \mathrm{K}$，占总体温差 $450\ \mathrm{K}$ 的 $4.6\%$。该偏差超过网格离散误差的量级，应优先检查流体侧对流换热系数的求解是否正确（壁面函数、$y^+$、物性），而不是继续加密固体网格。

## 固体侧网格与时间步的独立要求

固体侧只有导热，其网格与时间步要求与流体侧不同，必须独立校核。显式格式的稳定条件是

$$
\mathrm{Fo} = \frac{\alpha \Delta t}{\Delta x^2} \le \frac{1}{2}, \qquad \alpha = \frac{k_s}{\rho c_p}
$$

不锈钢 $\rho = 8000\ \mathrm{kg/m^3}$、$c_p = 500\ \mathrm{J/(kg\cdot K)}$，则 $\alpha = 16.3/(8000 \times 500) = 4.08\times 10^{-6}\ \mathrm{m^2/s}$。取 $\Delta x = 0.5\ \mathrm{mm}$、$\Delta t = 0.01\ \mathrm{s}$，$\mathrm{Fo} = 4.08\times 10^{-6} \times 0.01/(5\times 10^{-4})^2 = 0.163$，稳定。另一个必须满足的条件是固体热扩散时间：

$$
t_{diff} \approx \frac{t^2}{\alpha} = \frac{(0.010)^2}{4.08\times 10^{-6}} = 24.5\ \mathrm{s}
$$

因此瞬态共轭算例至少需要运行 $3\,t_{diff} \approx 74\ \mathrm{s}$ 才能认为达到稳态。若只算到 $10\ \mathrm{s}$ 就提取界面温度，会系统性偏低——这是"瞬态共轭结果与稳态结果不一致"的最常见原因。固体侧网格还需在厚度方向至少布置 5 层单元，即 $\Delta x \le 2\ \mathrm{mm}$；若流体侧首层为 $0.05\ \mathrm{mm}$ 而固体侧为 $2\ \mathrm{mm}$，界面首层厚度比达 40，插值会产生 $5\%$ 以上的通量误差。

## 耦合外迭代的收敛证据

双向共轭的收敛不能只看流场残差，还要看界面量在外迭代之间的变化：

$$
\Delta T_\Gamma^{(n)} = \max_{\Gamma} \left| T_\Gamma^{(n+1)} - T_\Gamma^{(n)} \right| < 10^{-3}\ \mathrm{K}
$$

若 $\Delta T_\Gamma$ 在 $1\ \mathrm{K}$ 量级反复振荡而不下降，说明热阻比过大，需要在界面温度更新上加欠松弛（典型因子 $0.3 \sim 0.5$）；若 $\Delta T_\Gamma$ 单调下降但每步只降 $2\%$，说明欠松弛因子过小。

## 检查脚本

```bash
#!/usr/bin/env bash
for reg in fluid solid; do
    postProcess -func "wallHeatFlux" -region "$reg" -latestTime \
        > "log.wallHeatFlux.$reg" 2>&1
done
postProcess -func "flowIn"  -latestTime > log.flowIn  2>&1
postProcess -func "flowOut" -latestTime > log.flowOut 2>&1

python3 - <<'PY'
q_f, q_s = 352.0e3, 351.0e3          # W/m2, 界面两侧热流
print("eps_q = %.2f %% (判据 < 0.5)" % (abs(q_f-q_s)/q_f*100))

Th, Tc, hh, ks, t = 800.0, 350.0, 1500.0, 16.3, 0.010
R = 1/hh + t/ks; q = (Th-Tc)/R; Tg = Th - q/hh
print("R'' = %.3e m2K/W, q'' = %.1f kW/m2, T_G = %.1f K" % (R, q/1e3, Tg))

alpha = 16.3/(8000*500)
print("alpha = %.3e m2/s, t_ss ~ %.1f s, Fo = %.3f" %
      (alpha, 3*t*t/alpha, alpha*0.01/(0.5e-3)**2))
PY
```

## 失败模式对照

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 界面两侧热流差 $15\%$ | 两侧温度场未真正耦合，各自独立收敛 | 输出两侧 `wallHeatFlux` 逐面元比对，$\varepsilon_q$ 应 $< 0.5\%$ |
| 界面温度比一维解析值低 $20\ \mathrm{K}$ | 流体侧对流换热系数被壁面函数低估 | 检查 $y^+$ 分布，与 $h$ 反算值对照 |
| 瞬态算例界面温度持续上升不收敛 | 运行时长不足 $3t_{diff}$ | 用 $t^2/\alpha$ 估扩散时间，本例需约 $74\ \mathrm{s}$ |
| 固体温度场出现棋盘振荡 | 两侧界面首层网格厚度比过大 | 检查厚度比，应 $< 5$ |
| $\Delta T_\Gamma$ 在 $1\ \mathrm{K}$ 振荡 | 热阻比过大，外迭代无松弛 | 加欠松弛因子 $0.3 \sim 0.5$，观察是否单调下降 |
| 整体能量收支差 $3\%$ | 外壁面漏热未计入边界条件 | 输出所有壁面热流求和，与加热功率对照 |

## 参考文献

1. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
2. Incropera F.P., DeWitt D.P., Bergman T.L., Lavine A.S., *Fundamentals of Heat and Mass Transfer*, 7th ed., Wiley, 2011.
3. Verstraete T., Alsalihi Z., Van den Braembussche R.A., "Multidisciplinary Optimization of a Radial Compressor for Microgas Turbine Applications", *ASME Journal of Turbomachinery*, 132(3), 031004, 2010.
4. ASME, *Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer* (V&V 20-2009), 2009.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, v2312, 2023, wallHeatFlux function object.
