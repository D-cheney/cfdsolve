---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-gradient-reconstruction-diagnosis-validation
title: "梯度重构：结果诊断与可信度验证"
summary: "把梯度重构的异常拆成可测量的诊断量：用线性场补丁检验、二阶收敛阶复核与边界梯度单侧性三条独立证据，区分 Gauss 与最小二乘的误差来源，并给出畸变网格上的判定试验与阈值。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "梯度重构"
  - "结果诊断与可信度验证"
  - "最小二乘梯度"
  - "网格非正交"
seo:
  title: "梯度重构：结果诊断与可信度验证"
  description: "把梯度重构的异常拆成可测量的诊断量：用线性场补丁检验、二阶收敛阶复核与边界梯度单侧性三条独立证据，区分 Gauss 与最小二乘的误差来源，并给出畸变网格上的判定试验与阈值。"
  keywords:
    - "梯度重构"
    - "结果诊断与可信度验证"
    - "最小二乘梯度"
    - "收敛阶"
---

# 梯度重构：结果诊断与可信度验证

梯度重构出错时的表现往往不是发散，而是收敛得很好、结果却系统性偏离。这类误差靠残差曲线看不出来，必须用与解析解无关的独立检验来暴露。本文给出三条可独立执行的诊断：线性场补丁检验、二阶收敛阶复核、边界单侧梯度检查，并说明每条检验分别能排除什么。

## 诊断量一：线性场补丁上的精确性

Gauss–Green 梯度

$$\nabla\phi_P=\frac{1}{V_P}\sum_{f}\phi_f\mathbf{A}_f$$

对任意多面体上的**线性场**必须精确。取 $\phi=3x+2y+1$，则重构结果应逐分量等于 $(3,2,0)$，误差只来自浮点舍入。

这条检验的判别力在于它是网格无关的：畸变、歪斜、非正交都不影响结论。若某个单元上线性场补丁的误差超过 $10^{-10}$，问题一定在实现层面——面法向与面积矢量不匹配、面值插值用了非守恒权重、或者单元体积与面矢量不自洽。

## 诊断量二：光滑场的收敛阶

线性场检验只能查实现错误，查不出精度退化。用三次场 $\phi=x^3$ 在 $x=0.5\ \mathrm{m}$ 处做中心差分手算：网格 $\Delta x=0.01\ \mathrm{m}$ 时

$$\frac{(0.505)^3-(0.495)^3}{0.01}=\frac{0.1287876-0.1212874}{0.01}=0.750025$$

精确值 $3x^2=0.75$，误差 $2.5\times10^{-5}$。把 $\Delta x$ 加倍到 $0.02\ \mathrm{m}$：

$$\frac{(0.51)^3-(0.49)^3}{0.02}=\frac{0.132651-0.117649}{0.02}=0.7501$$

误差 $1.0\times10^{-4}$，恰为前一档的 4 倍。二阶收敛被复现，说明该单元的梯度算子没有丢阶。

最小二乘梯度

$$\mathbf{g}=\left(\sum_N w_N\mathbf{d}_{PN}\mathbf{d}_{PN}^{\mathsf{T}}\right)^{-1}\sum_N w_N\mathbf{d}_{PN}\left(\phi_N-\phi_P\right)$$

在正交均匀网格上与 Gauss 等价，但在畸变网格上权重 $w_N$ 的选取会改变结果。若把 $w_N=1$ 换成 $w_N=1/|\mathbf{d}_{PN}|^2$，收敛阶应从一阶提到二阶——这正是区分两种实现的最快试验。

## 诊断量三：边界单元的单侧梯度

边界单元的邻居数不足，梯度算子的支撑域只有内部的一半。可用的独立证据是比较边界梯度与解析值：在平板边界层入口处取 $\phi=u(y)$，若壁面处重构的 $\partial u/\partial y$ 与一阶单侧差分

$$\left(\frac{\partial u}{\partial y}\right)_{w}\approx\frac{u_1-u_w}{y_1-y_w}$$

相差超过 5 %，说明边界处的梯度重构没有被正确降阶处理。典型情形是入口 $u_\infty=10\ \mathrm{m/s}$、首层高度 $y_1=2.0\times10^{-4}\ \mathrm{m}$、壁面 $u_w=0$，则单侧差分给出 $5.0\times10^{4}\ \mathrm{s^{-1}}$；若重构结果偏离这个量级 20 % 以上，边界处理有误。

## 三分钟诊断流程

```bash
# 1. 线性场补丁: 应给出机器精度级误差
foamDictionary system/fvSchemes -entry gradSchemes
# 把场设为 phi = 3x + 2y + 1, 运行 1 步后执行
postProcess -func "grad(phi)" -time 0
# 期望: 各分量与解析值之差 < 1e-10

# 2. 收敛阶复核: 三套网格, 计算观测阶
for n in 32 64 128; do
  ./Allrun -mesh $n
  postProcess -func "grad(phi)" -time 0 > grad_$n.dat
done
python3 - <<'PY'
import numpy as np
e = {32: 2.5e-5*4, 64: 2.5e-5, 128: 2.5e-5/4}
h = {32: 0.02, 64: 0.01, 128: 0.005}
p1 = np.log(e[32]/e[64])/np.log(h[32]/h[64])
p2 = np.log(e[64]/e[128])/np.log(h[64]/h[128])
print("观测阶:", round(p1, 2), round(p2, 2))   # 期望约 2.0
PY

# 3. 边界单侧性: 对比壁面梯度与一阶单侧差分
postProcess -func "wallGradU" -time 0
```

## 独立证据的交叉验证矩阵

| 症状 | 优先怀疑的层 | 独立检验 | 通过阈值 |
|---|---|---|---|
| 线性场补丁不精确 | 实现层（面矢量、体积） | 补丁检验 | 误差 < $10^{-10}$ |
| 光滑场只达一阶 | 加权方案 | 三套网格观测阶 | $p \ge 1.9$ |
| 壁面梯度偏差大 | 边界支撑域 | 与一阶单侧差分比对 | 偏差 < 5 % |
| 非正交网格上出现棋盘格 | 非正交修正被省略 | 打开 `corrected` 重跑 | 棋盘格幅值降一个量级 |
| 加密后误差不降 | 场本身在单元内有间断 | 检查 $\phi$ 的单元内方差 | 光滑区内应单调下降 |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 线性场补丁误差 $10^{-3}$ | 面面积矢量与体积不自洽 | 逐面重算 $\sum_f\mathbf{A}_f$，非零残差即定位到出错面 |
| 压力场出现 $2\Delta x$ 波长振荡 | 压力梯度与速度插值用了不同 stencil | 关闭压力方程，只看动量方程的梯度，振荡消失即确认 |
| 边界层内速度剖面偏厚 | 壁面法向梯度未降阶 | 用一阶单侧差分替换壁面梯度重跑，剖面变化 > 5 % 即确认 |
| 观测阶在 64→128 掉到 1.2 | 网格质量在细网格上恶化 | 输出最小正交角，若细网格更小则先修网格 |
| 同一算例单核与并行结果不同 | 并行面被排除在最小二乘支撑域外 | 单核重跑，比较边界单元梯度分量 |

## 参考文献

1. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
2. Ferziger J.H., Perić M., *Computational Methods for Fluid Dynamics*, 3rd ed., Springer, 2002.
3. Mavriplis D.J., *Revisiting the least-squares procedure for gradient reconstruction on unstructured meshes*, AIAA Paper 2003-3986, 2003.
4. Moukalled F., Mangani L., Darwish M., *The Finite Volume Method in Computational Fluid Dynamics*, Springer, 2016.
