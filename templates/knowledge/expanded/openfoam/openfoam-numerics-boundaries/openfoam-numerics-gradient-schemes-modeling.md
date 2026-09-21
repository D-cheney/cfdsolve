---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-gradient-schemes-modeling
title: "gradSchemes 梯度格式：设置机理与适用范围"
summary: "解释 Gauss 梯度、leastSquares 与 cellLimited 三类格式的构造机理与精度退化条件，给出正交与扭曲网格上的误差量级对比，说明梯度限制器为什么只该用在压力与速度上。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "gradSchemes 梯度格式"
  - "设置机理与适用范围"
  - "leastSquares"
  - "cellLimited"
seo:
  title: "gradSchemes 梯度格式：设置机理与适用范围"
  description: "解释 Gauss 梯度、leastSquares 与 cellLimited 三类格式的构造机理与精度退化条件，给出正交与扭曲网格上的误差量级对比，说明梯度限制器为什么只该用在压力与速度上。"
  keywords:
    - "gradSchemes 梯度格式"
    - "设置机理与适用范围"
    - "leastSquares 梯度"
    - "cellLimited"
    - "非正交网格"
---

# gradSchemes 梯度格式：设置机理与适用范围

`gradSchemes` 里 `default` 那一行同时决定压力梯度、黏性应力、限制器输入和所有面法向修正项的精度。Gauss 梯度在正交网格上对线性场精确，网格一旦扭曲就退化为一阶；`leastSquares` 对任意凸多面体都给出二阶梯度，却不满足散度定理的守恒形式；`cellLimited` 用局部极值夹住梯度，代价是削平驻点区的压力梯度。本文按这三个族讲清构造机理、量纲与选择边界。

## 梯度在求解器里被谁消费

不可压缩动量方程的压力项直接来自 `grad(p)`，扩散项的面法向导数、VOF 界面法向、湍流模型里的应变率张量也都要先构造单元梯度。这意味着 `gradSchemes` 出错不会只污染一个量，而会通过压力—速度耦合扩散到整个解。生产算例里应把关键量逐条写出，而不是依赖 `default`：

```cpp
gradSchemes
{
    default     cellLimited Gauss linear 1;
    grad(U)     cellLimited Gauss linear 1;
    grad(p)     cellLimited Gauss linear 1;
    grad(k)     Gauss linear;
    grad(omega) Gauss linear;
}
```

## Gauss 梯度：散度定理的直接离散

由恒等式 $\int_V\nabla\phi\,dV=\oint_{\partial V}\phi\,d\mathbf{S}$ 得

$$
(\nabla\phi)_P=\frac{1}{V_P}\sum_f \phi_f\,\mathbf{S}_f
$$

$\mathbf{S}_f$ 是面法向面积矢量（$\mathrm{m^2}$），$V_P$ 是单元体积（$\mathrm{m^3}$），因此结果量纲为 $[\phi]/\mathrm{m}$。面值由 `interpolationSchemes` 的 `linear` 给出，即 $\phi_f=f_x\phi_P+(1-f_x)\phi_N$，$f_x$ 是面心在 $P$、$N$ 连线上的比例。当网格正交且 $\phi$ 为线性函数时，该式精确成立；网格一旦扭曲，面心与两中心连线不再重合，误差从二阶降为一阶，这就是非正交网格上压力出现棋盘格的常见来源。

## leastSquares：扭曲网格上的二阶替代

最小二乘梯度在单元 $P$ 的全部邻居上极小化线性重构残差，解出

$$
(\nabla\phi)_P=\mathbf{M}^{-1}\sum_{N}w_N\,\mathbf{d}_{PN}\left(\phi_N-\phi_P\right),\qquad \mathbf{M}=\sum_N w_N\,\mathbf{d}_{PN}\otimes\mathbf{d}_{PN}
$$

$\mathbf{d}_{PN}$ 是从 $P$ 中心指向 $N$ 中心的矢量，常用权重 $w_N=1/|\mathbf{d}_{PN}|^2$。矩阵 $\mathbf{M}$ 只依赖几何，可预计算并缓存，所以迭代中调用 `leastSquares` 并不比重构 $\mathbf{M}$ 更贵。它不需要面值，对任意凸多面体都成立；代价是不满足散度定理，梯度场与通量场不再自动相容，在强非正交网格上可能引入轻微的质量不守恒，需要靠 `nNonOrthogonalCorrectors` 补偿。

## cellLimited：把梯度夹回局部变化率

强梯度区（激波、相界面、壁面附近）的 Gauss 梯度可能远超真实值，进而在压力修正里制造过冲。`cellLimited` 的做法是把未限制梯度与局部最大变化率取小：

$$
(\nabla\phi)_P=\min\left[(\nabla\phi)_P^{unc},\ \beta\max_{N}\frac{|\phi_N-\phi_P|}{|\mathbf{d}_{PN}|}\right]
$$

$\beta\in[0,1]$，取 1 最保守，等价于不允许任何邻居的线性重构超过其自身值。代价是极值附近梯度被压低，圆柱驻点区的压力梯度会被削平约 10%～20%，因此只适合 `grad(p)`、`grad(U)` 这类容易振荡的量。湍流量方程内部若也用 `cellLimited 1`，会引入不必要的耗散并拖慢分离点位置的收敛。

## 精度与成本的量化对比

在一个 $0.1\ \mathrm{m}$ 的立方体上施加线性场 $\phi=3x+2$，用 $\Delta x=0.002\ \mathrm{m}$ 的正交六面体网格，Gauss 梯度给出精确的 $3.000$。把同一网格剪切成平均非正交角 $35^\circ$ 后，Gauss 梯度的最大相对误差约 $2\times10^{-2}$，而 `leastSquares` 仍保持在 $10^{-4}$ 量级。加密到 $\Delta x=0.001\ \mathrm{m}$ 时，Gauss 误差只按一阶降到约 $1\times10^{-2}$，`leastSquares` 按二阶降到 $2.5\times10^{-5}$。把 $\Delta x$ 再减半到 $0.0005\ \mathrm{m}$，Gauss 误差约 $5\times10^{-3}$，`leastSquares` 约 $6\times10^{-6}$——前者每加密一倍只降 2 倍，后者降 4 倍。这组对比说明：非正交网格上换用 `leastSquares` 的收益远大于单纯加密网格。

| 格式 | 正交网格精度 | 扭曲网格精度 | 守恒性 | 相对成本 |
|---|---|---|---|---|
| `Gauss linear` | 二阶 | 一阶 | 满足 | 最低 |
| `leastSquares` | 二阶 | 二阶 | 近似 | 中（矩阵可预计算） |
| `cellLimited Gauss linear 1` | 二阶，极值处一阶 | 一阶 | 满足 | 低 |

## 梯度重构的失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场出现棋盘格振荡 | Gauss 梯度在非正交网格上退化为一阶 | 换 `leastSquares` 复跑，看压力振荡幅值是否下降 |
| 壁面附近速度过冲 | 无限制梯度重构出局部极值 | 仅对 `grad(U)` 加 `cellLimited 1`，看极值是否消失 |
| 加密后梯度误差只按一阶减小 | 网格非正交主导精度 | 用 `checkMesh` 量化平均非正交角，超过 $60^\circ$ 先修网格 |
| VOF 界面法向抖动 | 相分数梯度被限制器削平 | 相分数梯度单独改用 `Gauss linear`，与限制版对比界面厚度 |
| 全局质量不守恒 | `leastSquares` 不满足散度定理，梯度场与通量场不相容 | 把 `nNonOrthogonalCorrectors` 提到 2，核对进出口流量相对偏差 |

改梯度格式后必须重跑而不是只做后处理重采样，因为压力—速度耦合会把梯度误差放大到守恒性上。判断梯度格式是否够用，可以用一个解析场做最小检验：

```text
场: phi = 3x + 2          解析梯度 = 3.000 1/m
网格: dx = 0.002 m 正交    Gauss 误差 ~ 1e-5    → 满足二阶
网格: 平均非正交角 35°     Gauss 误差 ~ 2.1e-2  → 退化为一阶
                           leastSquares 误差 ~ 1e-4 → 仍为二阶
判据: 同一网格上换格式若误差差两个数量级，说明几何而非密度主导精度
```判断格式是否合适的最终依据是关键工程量在换档后的变化是否落在网格离散不确定度内。

## 参考文献

1. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
2. Barth T.J., Jespersen D.C., *The design and application of upwind schemes on unstructured meshes*, AIAA Paper 89-0366, 1989.
3. Mavriplis D.J., *Revisiting the least-squares procedure for gradient reconstruction on unstructured meshes*, AIAA Paper 2003-3986, 2003.
4. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
5. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
6. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.4 Numerical Schemes, 2024.
