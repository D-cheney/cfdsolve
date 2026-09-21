---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-heat-conduction-modeling
title: "热传导离散：离散原理与适用范围"
summary: "从能量守恒方程出发给出显式格式的 Fourier 数稳定界、接触热阻的界面处理、辐射边界的线性化系数与热扩散长度判据，并说明温度相关物性和各向异性何时必须保留。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "热传导离散"
  - "离散原理与适用范围"
  - "Fourier 数"
  - "接触热阻"
seo:
  title: "热传导离散：离散原理与适用范围"
  description: "从能量守恒方程出发给出显式格式的 Fourier 数稳定界、接触热阻的界面处理、辐射边界的线性化系数与热扩散长度判据，并说明温度相关物性和各向异性何时必须保留。"
  keywords:
    - "热传导"
    - "离散原理与适用范围"
    - "Fourier 数"
    - "接触热阻"
    - "辐射边界"
---

# 热传导离散：离散原理与适用范围

热传导问题的离散误差有三个来源：时间推进的稳定与精度、界面处热阻的建模、以及边界上辐射与对流的相对权重。它们各自的量纲判据是 Fourier 数、Biot 数与辐射线性化系数，只要这三个数落在各自区间内，线性常物性模型就够用；越界则必须升级到非线性或共轭传热模型。下面给出各判据的推导与量级估算。

## 能量方程与三类边界

各向同性、无内热源的瞬态导热由

$$
\rho c_p\frac{\partial T}{\partial t}=\nabla\cdot\big(k\nabla T\big)+q
$$

描述，其中 $\alpha=k/(\rho c_p)$ 是热扩散率，单位 $\mathrm{m^2/s}$。三类边界分别为：第一类给定温度；第二类给定热流 $q''=-k\partial T/\partial n$；第三类对流 $\ -k\partial T/\partial n=h(T_\infty-T)$。辐射边界是非线性的第四类

$$
q''_{\mathrm{rad}}=\epsilon\sigma\big(T_s^4-T_\infty^4\big),
\qquad
\sigma=5.67\times10^{-8}\,\mathrm{W/(m^2K^4)}.
$$

取 $\epsilon=0.9$、$T_s=400\,\mathrm{K}$、$T_\infty=300\,\mathrm{K}$，得 $q''_{\mathrm{rad}}=0.9\times5.67\times10^{-8}\times(2.56\times10^{10}-8.1\times10^{9})=893\,\mathrm{W/m^2}$。把它线性化为等效换热系数 $h_r=4\epsilon\sigma T_m^3$，取平均温度 $T_m=350\,\mathrm{K}$ 得 $h_r=8.75\,\mathrm{W/(m^2K)}$；与自然对流的 $h=5\,\mathrm{W/(m^2K)}$ 同量级，因此室温附近的散热问题不能只算对流。

## 显式格式的 Fourier 数稳定界

显式时间推进的稳定条件为

$$
\mathrm{Fo}=\frac{\alpha\,\Delta t}{h^{2}}\le\frac{1}{2d},
$$

$d$ 为空间维数：一维 $1/2$、二维 $1/4$、三维 $1/6$。这条约束的来源是离散拉普拉斯算子的谱半径，与物性和网格同时挂钩。几种材料在 $h=1\,\mathrm{mm}$ 下的三维步长上限：

| 材料 | $\alpha$ / (m²·s⁻¹) | $\Delta t_{\max}$ / s | $k$ / (W·m⁻¹·K⁻¹) | $\rho$ / (kg·m⁻³) | $c_p$ / (J·kg⁻¹·K⁻¹) |
|---|---|---|---|---|---|
| 铜 | $1.166\times10^{-4}$ | $1.43\times10^{-3}$ | 401 | 8933 | 385 |
| 铝 | $9.75\times10^{-5}$ | $1.71\times10^{-3}$ | 237 | 2700 | 900 |
| 钢 | $1.22\times10^{-5}$ | $1.37\times10^{-2}$ | 45 | 7850 | 470 |
| 不锈钢 304 | $4.08\times10^{-6}$ | $4.09\times10^{-2}$ | 16.3 | 8000 | 500 |

以铝为例，$Fo=1/6$ 要求 $\Delta t\le h^2/(6\alpha)=10^{-6}/(6\times9.75\times10^{-5})=1.71\times10^{-3}\,\mathrm{s}$；网格加密到 $h=0.5\,\mathrm{mm}$ 时步长降到 $4.27\times10^{-4}\,\mathrm{s}$，即时间步按 $h^2$ 缩小。铜的 $\alpha$ 比不锈钢 304 高约 $29$ 倍，同样网格下稳定步长却小 $29$ 倍，这是金属瞬态问题必须用隐式格式的根本原因。

## 接触界面与接触热阻

两个固体在名义接触面上只有微观凸起导通，宏观上表现为温度跳变

$$
q''=\frac{\Delta T}{R_c},
$$

$R_c$ 为接触热阻，单位 $\mathrm{m^2K/W}$。典型取值：机加工钢—钢干接触（表面粗糙度 $1.6\,\mu\mathrm{m}$、接触压力 $1\,\mathrm{MPa}$）为 $1\times10^{-4}\sim5\times10^{-4}$；铝—铝同条件为 $5\times10^{-5}\sim2\times10^{-4}$；涂导热硅脂后降到 $1\times10^{-5}\sim5\times10^{-5}$；夹一层 $1\,\mathrm{mm}$ 厚、$k=3\,\mathrm{W/(m\cdot K)}$ 的导热垫片则等于 $3.3\times10^{-4}$。取 $q''=10\,\mathrm{kW/m^2}$、$R_c=2.5\times10^{-4}$，界面温降为 $2.5\,\mathrm{K}$，与 $1\,\mathrm{mm}$ 厚铝板自身的温降（$q''L/k=10000\times0.001/237=0.042\,\mathrm{K}$）相比高出近两个数量级。忽略 $R_c$ 会让界面温降被完全抹掉。

## 何时必须保留温度相关物性与各向异性

判据是物性在温度区间内的相对变化。钢的 $k$ 从 $20\,^\circ\mathrm{C}$ 的 $51\,\mathrm{W/(m\cdot K)}$ 降到 $500\,^\circ\mathrm{C}$ 的 $38\,\mathrm{W/(m\cdot K)}$，变化约 $-25\%$；若工作区间跨越这一范围，用常数 $k$ 会把高温端的热流算高约 $25\%$，必须迭代更新物性。各向异性材料（层压板、纤维增强复合材料、硅钢片叠层）的面内与面外导热系数可相差 $10$ 倍以上，此时方程改为 $\rho c_p\partial_t T=\nabla\cdot(\mathbf{k}\nabla T)$，$\mathbf{k}$ 为张量，网格方向应尽量对齐材料主轴。热扩散长度的量级估算给出另一条边界：$\delta\sim\sqrt{\alpha t}$，铝在 $1\,\mathrm{s}$ 内扩散 $9.87\,\mathrm{mm}$，铜在 $1\,\mathrm{Hz}$ 交变热流下的穿透深度 $\delta=\sqrt{2\alpha/\omega}=6.09\,\mathrm{mm}$，$50\,\mathrm{Hz}$ 时降到 $0.86\,\mathrm{mm}$——高频热冲击只需要在表层 $1\,\mathrm{mm}$ 内加密。

## 失效信号与判据

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 显式推进若干步后温度场出现棋盘振荡 | $Fo$ 超过 $1/(2d)$ | 把 $\Delta t$ 减半重跑，若振荡消失即为稳定性越界 |
| 界面两侧温度连续、无跳变 | 接触热阻未施加，两侧网格共节点 | 用 $q''R_c$ 估算应有温降并与结果对比 |
| 高温端热流比手册值高 $20\%$ 以上 | 用常数 $k$ 忽略了 $k(T)$ 的下降 | 改用温度相关物性并比较两次结果 |
| 薄板厚度方向温降明显偏小 | 各向异性 $\mathbf{k}$ 被当成标量 | 用面外 $k$ 单独校核 $\Delta T=q''L/k_z$ |
| 室温自然对流散热偏低一半 | 辐射未计入或未线性化 | 计算 $h_r=4\epsilon\sigma T_m^3$ 并与 $h$ 比较 |
| 周期性加热的表层温度相位滞后 | 网格未解析热穿透深度 $\sqrt{2\alpha/\omega}$ | 按 $50\,\mathrm{Hz}$ 下 $0.86\,\mathrm{mm}$ 重新定网格 |
| 瞬态结束温度与稳态解不符 | 时间推进未走到稳态或内能未闭合 | 把计算时间延长到 $10\tau$ 后比较终态 |

## 可复算的量级脚本

```python
import math
mat = {"铜":(401,8933,385), "铝":(237,2700,900),
       "钢":(45,7850,470), "不锈钢304":(16.3,8000,500)}
h, dim = 1e-3, 3
for name,(k,rho,cp) in mat.items():
    alpha = k/(rho*cp)
    dt = h*h/(2*dim*alpha)
    print(f"{name:8s} alpha={alpha:.3e} m2/s  dt_max={dt:.3e} s")
# 铜       alpha=1.166e-04 m2/s  dt_max=1.429e-03 s
# 铝       alpha=9.750e-05 m2/s  dt_max=1.709e-03 s
# 钢       alpha=1.220e-05 m2/s  dt_max=1.366e-02 s
# 不锈钢304 alpha=4.075e-06 m2/s  dt_max=4.090e-02 s
```

## 参考文献

1. Carslaw, H. S. & Jaeger, J. C. *Conduction of Heat in Solids*. 2nd ed., Oxford University Press, 1959.
2. Incropera, F. P., DeWitt, D. P., Bergman, T. L. & Lavine, A. S. *Fundamentals of Heat and Mass Transfer*. 6th ed., Wiley, 2007.
3. Patankar, S. V. *Numerical Heat Transfer and Fluid Flow*. Hemisphere Publishing, 1980.
4. Madhusudana, C. V. *Thermal Contact Conductance*. 2nd ed., Springer, 2014.
5. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
6. Bergheau, J.-M. & Fortunier, R. *Finite Element Simulation of Heat Transfer*. Wiley, 2008.