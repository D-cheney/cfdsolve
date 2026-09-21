---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-wall-y-plus-diagnosis-validation
title: "壁面 y+ 与近壁分辨率：结果诊断与可信度验证"
summary: "求解之后如何判定近壁网格是否真的合格：从壁面剪切场反推实际 y+、用对数律偏差量化壁面处理误差、统计缓冲层单元面积占比，并给出摩擦系数的网格收敛与解析对照流程。"
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
  - "壁面 y+ 与近壁分辨率"
  - "结果诊断与可信度验证"
  - "对数律偏差"
  - "网格收敛"
seo:
  title: "壁面 y+ 与近壁分辨率：结果诊断与可信度验证"
  description: "求解之后如何判定近壁网格是否真的合格：从壁面剪切场反推实际 y+、用对数律偏差量化壁面处理误差、统计缓冲层单元面积占比，并给出摩擦系数的网格收敛与解析对照流程。"
  keywords:
    - "壁面 y+ 与近壁分辨率"
    - "结果诊断与可信度验证"
    - "对数律"
    - "缓冲层"
    - "摩擦系数收敛"
---

# 壁面 y+ 与近壁分辨率：结果诊断与可信度验证

近壁网格是否合格，不能靠设计阶段的预估 y+ 自证，只能靠解出来的壁面剪切场回答。可信的做法有三步：从壁面剪切反推实际 y+ 分布、用对数律偏差量化壁面处理的系统性误差、把摩擦系数放到三套网格上做收敛与外部对照。本文以二维槽道为例给出可直接照做的判据，算例取半高 $h = 0.05\,\mathrm{m}$、体积平均速度 $U_b = 3\,\mathrm{m/s}$、空气 $\rho = 1.2\,\mathrm{kg/m^3}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$，即 $Re_b = 20000$。

## 1 用壁面剪切场反推实际 y+

设计阶段用的 $u_\tau$ 来自关联式，求解后的 $u_\tau$ 来自壁面剪切，两者可以差 20% 以上，所以诊断必须用后者：

$$u_\tau = \sqrt{\tau_w/\rho}, \qquad y^{+} = \frac{u_\tau\, y_p}{\nu}$$

槽道流的摩擦系数用 Dean 关联式 $C_f = 0.073\,Re_b^{-0.25}$，其中 $C_f = 2\tau_w/(\rho U_b^{2})$。代入 $Re_b = 20000$ 得 $C_f = 0.073/11.89 = 6.14\times10^{-3}$，于是 $u_\tau = U_b\sqrt{C_f/2} = 3\times0.0554 = 0.166\,\mathrm{m/s}$，$\tau_w = 0.0331\,\mathrm{Pa}$，$\nu/u_\tau = 90.3\,\mathrm{\mu m}$。

把三套网格的首层单元高度代入上式，得到完全不同的结论：

| 首层单元高度 | 单元中心 $y_p$ | 实际 y+ | 判定 |
|---|---|---|---|
| 0.2 mm | 0.10 mm | 1.11 | 可做壁面解析 |
| 3.0 mm | 1.50 mm | 16.6 | 落在缓冲层，两种处理都不可信 |
| 10.0 mm | 5.00 mm | 55.4 | 落在标准壁函数有效区 |

中间那套网格是最典型的陷阱：它既没有细到能解析黏性底层，也没有粗到能安全使用壁函数。

## 2 对数律偏差作为壁面处理健康指标

壁函数在单元中心施加的约束是

$$u^{+} = \frac{1}{\kappa}\ln y^{+} + B$$

取 $\kappa = 0.41$、$B = 5.2$，可算出几个参考值：$y^{+} = 30$ 时 $u^{+} = 13.50$，$y^{+} = 50$ 时 $u^{+} = 14.74$，$y^{+} = 100$ 时 $u^{+} = 16.43$。把 CFD 解出的 $u^{+}$ 与这些值逐点比较，定义对数律偏差

$$\epsilon_{\log} = \frac{u^{+}_{\mathrm{CFD}} - u^{+}_{\log}}{u^{+}_{\log}}$$

工程判据是：$y^{+} > 30$ 时 $|\epsilon_{\log}|$ 应小于 5%；若在 $y^{+} \approx 15$ 处取点，对数律本身已高估约 10%，此时出现大偏差不能直接归咎于求解器。因此取点位置必须与 y+ 一起报告，单说“对数律对不上”没有信息量。

## 3 缓冲层单元面积占比的统计口径

面积平均 y+ 会掩盖分布问题，必须分箱统计。对壁函数算例，把壁面单元按 y+ 分成四档：$y^{+} < 5$、$5 \le y^{+} < 30$、$30 \le y^{+} \le 300$、$y^{+} > 300$，用面积加权求各档占比。判据是第二档（缓冲层）面积占比低于 5%，第三档高于 85%。对壁面解析算例则相反：$y^{+} \le 1$ 的面积占比应高于 90%。

以上表 3.0 mm 那套网格为例，若壁面共 4800 个面、缓冲层区间占 3600 个面，则缓冲层面积占比 75%，远超 5% 的阈值，无论残差降到多低都应判为近壁不可信。

## 4 摩擦系数的网格收敛与外部对照

近壁分辨率最终要落在积分量上。用三套按 $r = 1.5$ 加密的网格计算 $C_f = 2\tau_w/(\rho U_b^{2})$，得到 $6.41\times10^{-3}$、$6.24\times10^{-3}$、$6.17\times10^{-3}$（网格量 1.0 M、2.25 M、5.06 M）。按 Roache 的网格收敛指数：

$$GCI = \frac{F_s\,|\varepsilon|}{r^{p}-1}$$

其中 $\varepsilon$ 为相邻两套网格的相对差，$F_s = 1.25$。两级差分为 $-2.65\times10^{-2}$ 与 $-1.12\times10^{-2}$，比值 0.423 给出观测阶 $p = 2.1$，接近二阶格式的期望值，可以认为进入渐近区。于是 $GCI = 1.25\times2.65\times10^{-2}/(1.5^{2.1}-1) = 2.4\%$，即 $C_f = 6.24\times10^{-3} \pm 2.4\%$。Dean 关联式给出 $6.14\times10^{-3}$，落在区间内且相差 1.6%，可作为近壁处理未引入系统偏差的证据。

若三套网格的 $C_f$ 单调下降但两级比值远大于 0.25，说明仍在渐近区之外，此时的“收敛”只是误差互相抵消，不能用于验收。

## 5 把诊断写成可复算的脚本

```python
import numpy as np
rho, nu, Ub, h = 1.2, 1.5e-5, 3.0, 0.05
Cf_dean = 0.073 * (Ub * 2 * h / nu) ** -0.25
u_tau   = Ub * (Cf_dean / 2) ** 0.5
print(f"Cf={Cf_dean:.3e} u_tau={u_tau:.4f} m/s tau_w={rho*u_tau**2:.4f} Pa")

kappa, B = 0.41, 5.2
loglaw = lambda yp: np.log(yp) / kappa + B
for yp in (30, 50, 100):
    print(f"y+={yp:4d}  u+_log={loglaw(yp):.2f}")

# 壁面单元分箱：yplus 为面积加权数组，area 为对应面积
def bins(yplus, area, edges=(0, 5, 30, 300, 1e9)):
    tot = area.sum()
    return [(f"{edges[i]}-{edges[i+1]}", area[(yplus >= edges[i]) & (yplus < edges[i+1])].sum() / tot)
            for i in range(len(edges) - 1)]
```

脚本输出 $C_f = 6.139\times10^{-3}$、$u_\tau = 0.1662\,\mathrm{m/s}$、$\tau_w = 0.0331\,\mathrm{Pa}$，与手算一致，可作为交付记录里的复核凭证。

## 6 近壁诊断的失败模式与反证

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 面积平均 y+ 合格，但壁面压力分布出现台阶 | 局部区域 y+ 掉进缓冲层，被平均值掩盖 | 输出 y+ 的最小值场并标出缓冲层单元位置 |
| $y^{+} > 30$ 处 $u^{+}$ 比对数律低 8% | 壁面第一层单元过厚，对数律被外推到不该用的位置 | 保持流向网格不变，只把首层减半重算，看偏差是否收窄 |
| 加密后 $C_f$ 单调上升且不收敛 | 加密跨越了壁面处理分支，从壁函数滑向解析 | 在壁函数区与解析区各固定一种处理，分别做网格收敛 |
| 换用 SST 后 $C_f$ 下降 9% | 两模型预测的 $\tau_w$ 不同，y+ 随之整体平移 | 用新模型的 $\tau_w$ 重算 y+，确认网格是否仍落在原区间 |
| 壁面解析算例的 $u^{+}$ 在 $y^{+} < 5$ 偏离 $u^{+} = y^{+}$ | 黏性底层层数不足，或壁面边界条件用了零梯度 | 检查黏性底层内的单元数与壁面速度边界类型 |

## 7 方法与标准来源

1. Moser R. D., Kim J., Mansour N. N., "Direct numerical simulation of turbulent channel flow up to $Re_\tau = 590$," *Physics of Fluids*, 1999.
2. Kim J., Moin P., Moser R., "Turbulence statistics in fully developed channel flow at low Reynolds number," *Journal of Fluid Mechanics*, 1987.
3. Roache P. J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
4. Spalding D. B., "A single formula for the law of the wall," *Journal of Applied Mechanics*, 1961.
