---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-finite-difference-modeling
title: "有限差分法：离散原理与适用范围"
summary: "从泰勒展开推导有限差分模板系数，说明截断误差中的色散与耗散来源、紧致格式的分辨率优势、显式扩散的稳定界，并界定它在复杂几何与间断问题上的边界。"
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
  - "有限差分法"
  - "离散原理与适用范围"
  - "截断误差"
  - "紧致格式"
seo:
  title: "有限差分法：离散原理与适用范围"
  description: "从泰勒展开推导有限差分模板系数，说明截断误差中的色散与耗散来源、紧致格式的分辨率优势、显式扩散的稳定界，并界定它在复杂几何与间断问题上的边界。"
  keywords:
    - "有限差分法"
    - "离散原理与适用范围"
    - "截断误差"
    - "紧致格式"
    - "冯诺依曼稳定性"
---

# 有限差分法：离散原理与适用范围

有限差分用泰勒展开把导数替换为节点值的线性组合，格式的阶数、稳定域与守恒性都由此确定。本文从泰勒系数出发推导常用模板，说明色散与耗散如何进入截断误差，并界定它在复杂几何与间断问题上的边界。

## 一、泰勒展开给出模板系数

把相邻节点值在 $x_i$ 处展开：

$$
u_{i+1}=u_i+\Delta x\,u'_i+\frac{\Delta x^2}{2}u''_i+\frac{\Delta x^3}{6}u'''_i+\frac{\Delta x^4}{24}u''''_i+\mathcal O(\Delta x^5)
$$

将 $u_{i+1}$ 与 $u_{i-1}$ 相减，偶数阶项抵消，得到二阶中心差分及其截断误差：

$$
u'_i=\frac{u_{i+1}-u_{i-1}}{2\Delta x}-\frac{\Delta x^2}{6}u'''_i+\mathcal O(\Delta x^4)
$$

系数 $1/6$ 是关键：误差项含三阶导数，所以中心差分对线性解精确，对弯曲解产生色散误差；若把 $u_{i+1}$ 与 $u_{i-1}$ 相加并配 $u_i$，可得二阶精度的 $u''$ 模板 $(u_{i+1}-2u_i+u_{i-1})/\Delta x^2$。奇数阶导数用反对称模板、偶数阶导数用对称模板，是泰勒展开的直接推论。任意模板的系数都可以由一个小型线性系统解出：

```python
import numpy as np
from math import factorial

def fd_coeffs(offsets, deriv):
    """由泰勒展开求任意模板的有限差分系数；deriv=1 表示一阶导。"""
    A = np.array([[o**p / factorial(p) for o in offsets]
                  for p in range(len(offsets))], dtype=float)
    b = np.zeros(len(offsets))
    b[deriv] = 1.0
    return np.linalg.solve(A, b)

print(np.round(fd_coeffs([-1, 0, 1], 1), 4))          # [-0.5  0.   0.5 ]
print(np.round(fd_coeffs([-2, -1, 0, 1, 2], 1), 4))   # [ 0.0833 -0.6667  0.  0.6667 -0.0833]
print(np.round(fd_coeffs([-1, 0, 1], 2), 4))          # [ 1. -2.  1.]
```

第二行正是四阶中心差分 $(-u_{i+2}+8u_{i+1}-8u_{i-1}+u_{i-2})/(12\Delta x)$ 的系数乘以 12。

## 二、紧致格式用隐式换取分辨率

显式四阶格式要 5 点带宽，紧致（Padé）格式只用 3 点：

$$
\frac14 u'_{i-1}+u'_i+\frac14 u'_{i+1}=\frac{3}{4\Delta x}\left(u_{i+1}-u_{i-1}\right)
$$

左端含未知导数，需要对全部节点联立求解一个三对角系统，但带宽小、边界处理更干净。分辨率上，紧致四阶在每波长约 4 点即可把相位误差控制在 1% 以内，而显式四阶需要约 8 点；代价是每次求导要多解一次三对角方程，并需额外的边界闭合关系。

## 三、稳定性由模态放大因子界定

把 $u_i^n=g^n e^{\,\mathrm i k x_i}$ 代入格式，稳定性要求对一切波数都有 $|g(\theta)|\le1$。显式欧拉配二阶中心扩散给出

$$
\Delta t\le\frac{\Delta x^2}{2\alpha}\qquad\text{一维显式扩散}
$$

其中 $\alpha$ 是热扩散率。取空气 $\alpha=2.2\times10^{-5}$ m²/s、$\Delta x=1\times10^{-3}$ m，则 $\Delta t\le10^{-6}/(2\times2.2\times10^{-5})=0.023$ s。这条限制与 $\Delta x^2$ 成正比，是显式格式在细网格上变慢的根源；对流项的库朗数限制只与 $\Delta x$ 成正比，两者尺度不同，因此细网格上通常由扩散项主导时间步。

## 四、守恒性与适用边界

有限差分只有在写成通量形式时才守恒；把对流项写成非守恒形式，跨激波的总量会漂移。适用边界如下：

适合：结构化或可光滑拉伸的网格、高精度波传播与气动声学、边界层与直接数值模拟（几何简单）、以及需要极高阶（六阶以上）的谱式差分。

不适合：复杂几何（需重叠网格或浸入边界，代价高）、非结构网格上的严格局部守恒（应选有限体积或有限元）、以及无限制器情况下的强激波（会产生非物理振荡）。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 升到四阶后误差只降一阶 | 边界模板仍是二阶，污染内点 | 只在边界 5 点内统计误差，与内点分别定阶 |
| 细网格上时间步被迫极小 | 显式扩散限制按 $\Delta x^2$ 收缩 | 改用隐式或 IMEX 时间推进，比较步长 |
| 紧致格式求解很慢 | 每次求导都需解三对角系统 | 统计求导耗时占比，评估是否值得换分辨率 |
| 跨激波的总量缓慢漂移 | 对流项写成非守恒形式 | 改用通量形式，检查两端边界通量之差 |
| 高阶格式在间断处剧烈振荡 | 未使用限制器或 WENO 重构 | 换 WENO 重构，比较总变差与振荡幅度 |

## 五、参考文献

1. Lele S. K., "Compact Finite Difference Schemes with Spectral-like Resolution", *Journal of Computational Physics*, 103(1), 16-42, 1992.
2. Tam C. K. W., Webb J. C., "Dispersion-Relation-Preserving Finite Difference Schemes for Computational Acoustics", *Journal of Computational Physics*, 107(2), 262-281, 1993.
3. Strand B., "Summation by Parts for Finite Difference Approximations for d/dx", *Journal of Computational Physics*, 110(1), 47-67, 1994.
4. Colonius T., Lele S. K., "Computational Aeroacoustics: Progress on Nonlinear Problems of Sound Generation", *Progress in Aerospace Sciences*, 40(6), 345-416, 2004.
