---
template_version: "flowlab-knowledge/1.0"
slug: cfd-mesh-overset-mesh-diagnosis-validation
title: "重叠网格：结果诊断与可信度验证"
summary: "给出孤岛单元、界面压力跳变、时间插值精度与守恒漂移四个诊断量及其阈值，附压力跳变与动压的换算，并说明重叠网格结果怎样才能被独立复核。"
category:
  slug: mesh-generation
  name: "网格与离散质量"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "网格与离散质量"
  - "重叠网格"
  - "结果诊断与可信度验证"
  - "孤岛单元"
  - "插值精度"
seo:
  title: "重叠网格：结果诊断与可信度验证"
  description: "给出孤岛单元、界面压力跳变、时间插值精度与守恒漂移四个诊断量及其阈值，附压力跳变与动压的换算，并说明重叠网格结果怎样才能被独立复核。"
  keywords:
    - "重叠网格"
    - "孤岛单元"
    - "界面压力跳变"
    - "插值精度"
    - "守恒漂移"
---

# 重叠网格：结果诊断与可信度验证

重叠网格的误差不来自网格质量，而来自插值：供体-受体配对、模板跨越梯度方向、时间插值阶数下降，都会在残差正常的表象下污染结果。诊断这类问题要盯住四个量：孤岛单元数、界面压力跳变、时间子迭代次数带来的目标量变化、以及守恒量的逐步漂移。

## 孤岛单元与全局质量不平衡

孤岛单元是受体但找不到有效供体的单元，它通常被留成前一步的值或零值，直接破坏局部守恒。诊断量是孤岛单元数与受体总数的比，要求严格为 0。某 4.2×10⁶ 单元的算例报告 12 个孤岛单元，占比 $2.9\times10^{-6}$，看似可忽略，但全局质量不平衡立即上升到

$$
\epsilon_m = \frac{\left|\dot m_{in} - \dot m_{out}\right|}{\dot m_{in}} = 0.3\%
$$

稳态问题中 $\epsilon_m$ 应在 $10^{-4}$ 量级以下。0.3% 的失衡说明这 12 个孤岛单元所在的局部区域每步都在丢失或制造质量，必须先把它们消除再讨论其他误差。定位方法是输出孤岛单元坐标，检查它们到部件表面的距离是否小于两个背景单元尺寸。

## 重叠区界面的压力振荡

受体单元用插值取值，供体单元用方程求解，两者在界面处的不一致会表现为压力振荡。诊断量用压力跳变相对动压归一化：

$$
\Delta p_{fringe} = \frac{\left|p_{rec} - p_{don}\right|}{\frac{1}{2}\rho U^{2}}
$$

来流 $U = 30\ \mathrm{m/s}$ 的常压空气，动压为 $0.5 \times 1.225 \times 30^{2} = 551\ \mathrm{Pa}$。界面处实测跳变 15 Pa，即 $\Delta p_{fringe} = 2.7\%$。判据是 $\Delta p_{fringe} < 1\%$；达到 2.7% 时，界面附近的压力梯度已被污染，任何依赖界面附近压力的目标量（如部件升力）都不可信。修正手段是加宽重叠区或在界面附近把两侧网格尺寸比降到 2 以内。

## 时间插值的精度损失

运动界面在时间步内移动，插值需要用到时间步内的中间状态：

$$
\phi^{n+\alpha} = (1-\alpha)\phi^{n} + \alpha\phi^{n+1}
$$

若不做子迭代（$\alpha$ 取固定值），插值只有一阶精度，且会把运动界面的误差以「网格雷诺数」的形式注入动量方程。诊断方法是改变子迭代次数，观察目标量的变化：某旋翼算例在 1 次子迭代时给出力矩 12.4 N·m，4 次时给出 11.5 N·m，相差 7.8%。判据是把子迭代次数从 1 增到 3，若目标量变化超过 1%，说明时间插值是主要误差源。

## 守恒量的逐步漂移

重叠网格在界面处不严格守恒，误差会随步数累积。诊断方法是监控总质量、总动量与总能量随时间的漂移率，而不是只看单步残差。若每步漂移 $10^{-6}$，跑 $10^{5}$ 步后累积 10%——这类问题在长时程算例（如多圈旋转机械）中很常见。应对手段是缩短总时长、在每一步后做全局守恒修正，或改用严格守恒的界面通量格式。

## 界面与守恒量的复算脚本

```python
import numpy as np
rho, U = 1.225, 30.0
q = 0.5 * rho * U**2                      # 动压 [Pa]
dp = np.array([15.0, 4.0, 22.0])          # 界面压力跳变 [Pa]
print(f"q = {q:.1f} Pa")
print("dp_fringe =", [f"{v / q:.1%}" for v in dp])

mdot_in, mdot_out = 1.0000, 0.9970        # 进出口质量流量 [kg/s]
print(f"eps_m = {abs(mdot_in - mdot_out) / mdot_in:.2%}")
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 全局质量不平衡 0.3% | 存在孤岛单元 | 输出孤岛坐标，检查到部件表面的距离 |
| 界面压力呈周期性振荡 | 受体与供体在界面处不一致 | 计算 $\Delta p_{fringe}$，与 1% 阈值比较 |
| 力矩随子迭代次数显著变化 | 时间插值仅一阶 | 子迭代从 1 增到 3，比较目标量 |
| 长时程算例守恒量缓慢漂移 | 界面不严格守恒，误差累积 | 统计总质量随时间的漂移率与步数 |
| 加密背景网格后部件载荷不变 | 误差由部件网格或插值主导 | 固定背景，加密部件网格，比较载荷变化 |

## 复算与验收

可信的重叠网格结果需要同时给出：孤岛单元数与坐标、全局质量与动量不平衡、$\Delta p_{fringe}$、时间子迭代次数与目标量对该参数的敏感性、守恒量漂移率、以及两侧网格尺寸比。特别地，界面压力跳变必须与动压一起给出，只报绝对跳变值无法判断其严重程度。

## 参考文献

1. Steger J.L., Dougherty F.C., Benek J.A., "A Chimera Grid Scheme", *Advances in Grid Generation*, ASME FED-Vol. 5, pp. 59-69, 1983.
2. Hadzic H., *Development and Application of a Finite Volume Method for the Computation of Flows Around Moving Bodies on Unstructured, Overlapping Grids*, PhD Thesis, Technische Universität Hamburg-Harburg, 2006.
3. Nakahashi K., Togashi F., Sharov D., "Intergrid Boundary Movement for Overset Unstructured Grid Method", *AIAA Journal*, 41(3): 440-447, 2003.
4. Anderson D.A., Tannehill J.C., Pletcher R.H., *Computational Fluid Mechanics and Heat Transfer*, 3rd ed., CRC Press, 2016.
