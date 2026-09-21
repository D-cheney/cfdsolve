---
template_version: "flowlab-knowledge/1.0"
slug: cae-coupling-thermo-mechanical-diagnosis-validation
title: "热固耦合：结果诊断与可信度验证"
summary: "用应力自由温度、接触界面温降与稳态能量平衡定位热固耦合异常，给出双金属片曲率与厚向温度梯度应力的解析对照，以及可复算的诊断脚本。"
category:
  slug: multiphysics-coupling
  name: "多物理场耦合算法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "多物理场耦合算法"
  - "热固耦合"
  - "结果诊断与可信度验证"
  - "双金属片"
  - "能量平衡"
seo:
  title: "热固耦合：结果诊断与可信度验证"
  description: "用应力自由温度、接触界面温降与稳态能量平衡定位热固耦合异常，给出双金属片曲率与厚向温度梯度应力的解析对照，以及可复算的诊断脚本。"
  keywords:
    - "热固耦合"
    - "结果诊断与可信度验证"
    - "应力自由温度"
    - "接触热阻"
---

# 热固耦合：结果诊断与可信度验证

热固耦合结果最常见的形态是"温度场看起来完全正确，应力却处处可疑"。这类矛盾几乎总是落在三个可检查的位置：应力自由温度、接触界面的温度跳变、以及物性随温度的变化。本文给出把这三点逐一锁定的诊断流程，并配两个解析对照与一段可复算脚本。

## 温度对而应力错：先查参考温度

热应变 $\boldsymbol{\varepsilon}^{th}=\alpha(T)(T-T_{ref})\mathbf{I}$ 中，$T_{ref}$ 的误差只让应力整体平移，不改变温度场，因此极难从温度云图上发现。诊断方法是做一个平移试验：把 $T_{ref}$ 提高 10 K，若全场应力近似减去同一个 $\Delta\sigma=E\alpha\Delta T/(1-\nu)=210\times10^9\times12\times10^{-6}\times10/(1-0.3)\approx3.6\times10^7\ \mathrm{Pa}=36\ \mathrm{MPa}$ 的常量，则说明 $T_{ref}$ 设置错了。另一条独立线索是符号：受约束构件升温应产生压应力，若云图显示拉应力，多半是 $T_{ref}$ 高于实际装配温度。

## 接触界面的温度跳变

接触热阻缺失时，温度云图在装配面上光滑连续，看似合理却漏掉了一段温降。诊断量是界面两侧的温度差

$$\Delta T_c=q''\,R_c''$$

取热流密度 $q''=8\times10^4\ \mathrm{W/m^2}$、$R_c''=2\times10^{-4}\ \mathrm{m^2\cdot K/W}$，应看到 $\Delta T_c=16\ \mathrm{K}$ 的跳变。若有限元结果给出 $\Delta T_c<1\ \mathrm{K}$，说明接触导热系数被设成了默认的无穷大。判定试验很直接：在界面上人为插入一层厚 0.1 mm、导热系数 $k=0.2\ \mathrm{W/(m\cdot K)}$ 的薄层，它等价于 $R_c''=5\times10^{-4}\ \mathrm{m^2K/W}$，若温降随之出现且量级吻合，即确认原模型漏设热阻。

## 与解析解逐项对照

自由变形的双金属片是热固耦合最好的解析基准。两层等厚度 $t$、等弹性模量、线膨胀系数分别为 $\alpha_A$、$\alpha_B$ 时，升温 $\Delta T$ 后的曲率为

$$\kappa=\frac{3(\alpha_A-\alpha_B)\Delta T}{4t}$$

取钢 $\alpha_A=12\times10^{-6}\ \mathrm{K^{-1}}$、黄铜 $\alpha_B=19\times10^{-6}\ \mathrm{K^{-1}}$、$t=0.5\ \mathrm{mm}=5\times10^{-4}\ \mathrm{m}$、$\Delta T=100\ \mathrm{K}$，得 $\kappa=3\times(-7\times10^{-6})\times100/(4\times5\times10^{-4})=-1.05\ \mathrm{m^{-1}}$，曲率半径约 0.95 m。长度 50 mm 的悬臂片端部挠度按 $\delta\approx\kappa L^2/2$ 估算为 $1.05\times0.0025/2\approx1.3\times10^{-3}\ \mathrm{m}=1.3\ \mathrm{mm}$。把仿真端部挠度与 1.3 mm 对照，偏差超过 10% 就要检查壳单元的厚向积分点数量或 $\alpha$ 的温度插值。

第二个对照是厚向线性温度梯度。板上下表面温差 $\Delta T$ 时，表面应力

$$\sigma_{surf}=\frac{E\,\alpha\,\Delta T}{2(1-\nu)}$$

取 $E=210\ \mathrm{GPa}$、$\alpha=12\times10^{-6}\ \mathrm{K^{-1}}$、$\Delta T=100\ \mathrm{K}$、$\nu=0.3$，得 $\sigma_{surf}=210\times10^9\times12\times10^{-6}\times100/1.4\approx1.8\times10^8\ \mathrm{Pa}=180\ \mathrm{MPa}$。若仿真表面应力明显小于此值，通常是厚向只放了 1～2 个单元，梯度被抹平。

## 稳态能量平衡闭合

传热分析的独立校验是界面热流与边界热流的总和为零：

$$\sum_{in}Q_i-\sum_{out}Q_j\le\varepsilon_Q\sum_{in}|Q_i|,\qquad \varepsilon_Q\le10^{-3}$$

一个 20 mm 厚钢板上表面施加热流 $1\times10^4\ \mathrm{W/m^2}$、下表面自然对流（$h=10\ \mathrm{W/(m^2\cdot K)}$、环境 25 ℃），稳态下表面温度应满足 $q''=h(T_s-25)$，即 $T_s=25+1\times10^4/10=1025\ \mathrm{^\circ C}$。把这个解析值同仿真下表面平均温度对比，若偏差超过 5 K，先查辐射是否被误开——在 1025 ℃ 下辐射通量 $\epsilon\sigma(T^4-T_\infty^4)$ 已不可忽略。

## 诊断脚本

```python
import numpy as np
# 读取传热结果: 各边界热流 Q_face[W], 界面温降 dTc[K], 下表面平均温度 Ts[K]
Q_in, Q_out = 1.0e4 * 1.0, np.load("q_out.npy").sum()   # W
res = abs(Q_in - Q_out) / abs(Q_in)
print(f"能量平衡残差 = {res:.2e} (阈值 1e-3)")

dTc = np.load("dTc.npy")
Rc = 2e-4                                    # m^2 K/W
q  = Q_in / 1.0                              # W/m^2
print(f"期望界面温降 = {q*Rc:.1f} K, 实测均值 = {dTc.mean():.1f} K")

kappa = 3 * (-7e-6) * 100 / (4 * 5e-4)       # 1/m
print(f"双金属片解析曲率 = {kappa:.3f} 1/m, 端部挠度 = {abs(kappa)*0.05**2/2*1e3:.2f} mm")
```

把能量残差、界面温降与解析挠度三个数写进每次提交的报告，比单看最大应力更能暴露设置错误。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 温度场正确但应力整体偏移 | 应力自由温度 $T_{ref}$ 取值错误 | 平移 $T_{ref}$ 10 K，看应力是否整体平移 36 MPa |
| 装配界面温度光滑无跳变 | 未设置接触热阻 | 插入 0.1 mm 低导热薄层，看是否出现温降 |
| 厚向应力梯度偏小 | 厚向单元过少 | 单元数由 2 增到 6，看表面应力是否升到 180 MPa |
| 高温面温度远低于解析值 | 辐射被误开或发射率过大 | 关闭辐射重算，对比 1025 ℃ 解析值 |
| 循环载荷后应力持续累积 | 物性未随温度更新 | 检查 $E(T)$ 是否只在首个增量步插值一次 |

## 参考文献

1. Timoshenko S., "Analysis of bi-metal thermostats," *Journal of the Optical Society of America*, 11(3), 1925.
2. Boley B.A., Weiner J.H., *Theory of Thermal Stresses*, Wiley, 1960.
3. Hetnarski R.B., Eslami M.R., *Thermal Stresses—Advanced Theory and Applications*, Springer, 2009.
4. Incropera F.P., DeWitt D.P., *Fundamentals of Heat and Mass Transfer*, 5th ed., Wiley, 2002.
5. Roache P.J., "Perspective: a method for uniform reporting of grid refinement studies," *ASME Journal of Fluids Engineering*, 116, 1994.
6. Dassault Systèmes, *Abaqus Theory Guide*, Section on heat transfer and thermal stress.
