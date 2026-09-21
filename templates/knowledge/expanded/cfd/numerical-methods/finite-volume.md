---
template_version: "flowlab-knowledge/1.0"
slug: finite-volume
title: "有限体积法：离散原理与适用范围"
summary: "从离散散度定理与线性保持性质出发，说明有限体积法为什么在任意多面体上都能精确重构线性场、内部面通量为何严格抵消，并用手算验证一次通量预算与一次线性场补丁，给出格式适用边界。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "有限体积法"
  - "离散原理与适用范围"
  - "线性保持"
  - "Rhie-Chow 插值"
seo:
  title: "有限体积法：离散原理与适用范围"
  description: "从离散散度定理与线性保持性质出发，说明有限体积法为什么在任意多面体上都能精确重构线性场、内部面通量为何严格抵消，并用手算验证一次通量预算与一次线性场补丁，给出格式适用边界。"
  keywords:
    - "有限体积法"
    - "离散原理与适用范围"
    - "线性保持"
    - "离散守恒"
---

# 有限体积法：离散原理与适用范围

有限体积法的两个核心性质——内部面通量严格抵消、线性场可被精确重构——都可以从同一条离散散度定理直接推出，不需要任何关于网格形状的假设。这是它能在四面体、六面体、多面体及混合网格上通用的根本原因。本文给出这条定理的离散形式、两个可手算的验证，以及格式精度与网格质量共同决定的适用边界。

## 离散散度定理与内部面抵消

对控制体 $P$ 与任意标量场 $\phi$，离散形式的散度定理写作

$$\int_{V_P}\nabla\phi\,dV\approx\sum_{f}\phi_f\mathbf{A}_f$$

其中 $\mathbf{A}_f$ 是面 $f$ 的面积矢量，方向由 owner 指向 neighbour，边界面上指向域外。对内部面，同一个面在两侧单元的求和中出现两次，面积矢量等值反向，因此任意常数场 $\phi\equiv c$ 的贡献为

$$\sum_{f}c\,\mathbf{A}_f=c\sum_{f}\mathbf{A}_f=0$$

这条恒等式对任意闭合多面体成立，与网格是否畸变无关。它同时给出两条工程结论：常数场不会被重构出虚假梯度；内部面上的通量在全局求和中严格抵消，守恒误差只可能来自边界面。这就是"局部守恒"的精确含义，也是有限体积法在流量分配、能量收支这类核算任务中被默认选用的原因。

## 线性保持：为什么线性场补丁检验一定通过

若 $\phi$ 为线性场 $\phi=\mathbf{g}\cdot\mathbf{x}+c$，面值用两侧单元中心的线性插值恰好等于面上的真实值，于是

$$\frac{1}{V_P}\sum_{f}\phi_f\mathbf{A}_f=\frac{1}{V_P}\sum_{f}\left(\mathbf{g}\cdot\mathbf{x}_f+c\right)\mathbf{A}_f=\mathbf{g}\cdot\frac{1}{V_P}\sum_{f}\mathbf{x}_f\otimes\mathbf{A}_f=\mathbf{g}$$

最后一步用到 $\frac{1}{V_P}\sum_f\mathbf{x}_f\otimes\mathbf{A}_f=\mathbf{I}$，这是散度定理对位置矢量 $\mathbf{x}$ 的直接推论。因此有限体积法的梯度重构在**任意多面体网格**上都能精确再现线性场，误差只到浮点舍入量级。

手算验证一次。取边长 $h=2.0\times10^{-3}\ \mathrm{m}$ 的立方单元，$V=8.0\times10^{-9}\ \mathrm{m^3}$，每个面面积 $A_f=4.0\times10^{-6}\ \mathrm{m^2}$。场取 $\phi=3x+2y+1$，则 $x=+1.0\times10^{-3}\ \mathrm{m}$ 面与 $x=-1.0\times10^{-3}$ 面上的 $\phi$ 分别为

$$\phi_{+}=3\times1.0\times10^{-3}+1=1.003,\qquad \phi_{-}=-0.003+1=0.997$$

$x$ 方向的通量和为

$$\sum_{f}\phi_f A_{f,x}=\left(1.003-0.997\right)\times4.0\times10^{-6}=6.0\times10^{-3}\times4.0\times10^{-6}=2.4\times10^{-8}\ \mathrm{m^3}$$

除以体积：

$$\frac{2.4\times10^{-8}}{8.0\times10^{-9}}=3.0$$

精确等于 $\partial\phi/\partial x$。$y$ 方向同理给出 2.0。这就是线性场补丁检验必然通过的原因，也是它能作为实现正确性判据的依据。

## 通量预算：守恒误差必须单独核算

守恒是有限体积法的性质，但**离散守恒误差不为零**——它来自边界插值、非正交修正的显式滞后、以及迭代未收敛。因此必须单独核算。

取风道算例：空气 $\rho=1.2\ \mathrm{kg/m^3}$，来流 $u=10\ \mathrm{m/s}$，入口面积 $A=0.01\ \mathrm{m^2}$，则入口质量流量

$$\dot{m}_{\text{in}}=\rho u A=1.2\times10\times0.01=0.12\ \mathrm{kg/s}$$

若出口按同一面通量定义算得 $\dot{m}_{\text{out}}=0.12005\ \mathrm{kg/s}$，则

$$\varepsilon=\frac{\left|\dot{m}_{\text{out}}-\dot{m}_{\text{in}}\right|}{\dot{m}_{\text{in}}}=\frac{4.2\times10^{-4}}{0.12}=3.5\times10^{-3}$$

即 0.35 %。稳态算例的验收阈值通常取 0.1 %，此例不达标，需要继续迭代或收紧压力容差。注意这个误差在残差曲线上完全看不出来：归一化残差可能已经降到 $10^{-5}$，通量预算仍然差 0.35 %。

## 网格质量与格式精度的耦合

| 网格指标 | 合格范围 | 超限后果 |
|---|---|---|
| 最大非正交角 | < 70° | 非正交修正项发散，需增加修正迭代 |
| 最大歪斜度 | < 4 | 面值插值误差主导，梯度失真 |
| 最大长宽比 | < 100（边界层内可放宽） | 最小二乘法方程条件数恶化 |
| 最小正交角余弦 | > 0.15 | 扩散项符号可能出错 |
| 最小体积 | > 0 | 负体积导致求解器立即终止 |

## 检查脚本

```bash
# 1. 网格质量
checkMesh -allGeometry -allTopology | tee log.checkMesh
# 关键行: Max non-orthogonality, Max skewness, Min volume
# 期望: non-orthogonality < 70, skewness < 4, min volume > 0

# 2. 通量预算: 入口与出口分别积分
postProcess -func "surfaceFieldValue(name=inlet,  operation=sum, fields=(phi))" -time 0
postProcess -func "surfaceFieldValue(name=outlet, operation=sum, fields=(phi))" -time 0
# 两个值之差除以入口值即为相对守恒误差
```

```python
# 线性场补丁检验: 任意多面体上都应给出机器精度
import numpy as np
g = np.array([3.0, 2.0, 0.0])          # 解析梯度 1/m
faces = [                              # (面积矢量 m^2, 面中心 m)
    (np.array([ 4e-6, 0, 0]), np.array([ 1e-3, 0, 0])),
    (np.array([-4e-6, 0, 0]), np.array([-1e-3, 0, 0])),
    (np.array([0,  4e-6, 0]), np.array([0,  1e-3, 0])),
    (np.array([0, -4e-6, 0]), np.array([0, -1e-3, 0])),
    (np.array([0, 0,  4e-6]), np.array([0, 0,  1e-3])),
    (np.array([0, 0, -4e-6]), np.array([0, 0, -1e-3])),
]
V, acc = 8e-9, np.zeros(3)
for A_f, x_f in faces:
    acc += (g @ x_f + 1.0) * A_f        # phi_f = g·x_f + c, 线性插值精确
print("重构梯度:", acc / V, " 误差:", np.abs(acc/V - g).max())
# 重构梯度: [3. 2. 0.]  误差: 0.0
```

## 适用边界

- **守恒律问题**：有限体积法是首选，局部守恒是结构性的而非附加的；
- **需要三阶以上精度**：标准二阶重构不够，必须用 k-exact 或 WENO 重构，代价是 stencil 扩张，破坏紧致性，并行通信量上升；
- **非守恒形式方程**：没有通量平衡结构，散度定理无法直接使用，有限元或谱方法更自然；
- **共置网格上的压力—速度耦合**：必须引入 Rhie–Chow 型插值抑制棋盘格压力振荡，否则动量方程无法感知压力梯度；
- **高超声速与强激波**：需要限制器配合，而限制器在光滑极值处降阶，网格加密只能缩小受影响单元数，不能恢复精度。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 通量预算差 0.35 % 而残差已到 $10^{-5}$ | 守恒误差与残差下降无关 | 单独积分入口与出口通量，比较相对差 |
| 压力场出现棋盘格振荡 | 共置网格缺少 Rhie–Chow 插值 | 关闭压力方程只跑动量，振荡若消失即确认 |
| 线性场补丁误差 $10^{-5}$ | 面面积矢量与体积不自洽 | 逐面累加 $\sum_f\mathbf{A}_f$，非零即定位到出错面 |
| 非正交角 75° 处解出现局部尖峰 | 非正交修正项在显式滞后下发散 | 把修正迭代次数从 1 提到 3，尖峰应显著减小 |
| 加密网格后目标量不收敛 | 限制器在光滑极值处降阶，精度被钉死在一阶 | 改用无限制高阶格式在光滑区重跑，观察阶数恢复 |

## 参考文献

1. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
2. Rhie C.M., Chow W.L., *Numerical study of the turbulent flow past an airfoil with trailing edge separation*, AIAA Journal, 21(11):1525–1532, 1983.
3. Demirdžić I., Muzaferija S., *Numerical method for coupled fluid flow, heat transfer and stress analysis using unstructured moving meshes with cells of arbitrary topology*, Computer Methods in Applied Mechanics and Engineering, 125(1–4):235–255, 1995.
4. Wesseling P., *Principles of Computational Fluid Dynamics*, Springer, 2001.
