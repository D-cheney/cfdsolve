---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-boundary-element-modeling
title: "边界元方法：离散原理与适用范围"
summary: "从加权残值与 Green 恒等式导出边界积分方程，说明三类核函数的奇异阶与对应处理方式、稠密矩阵的 O(N^2) 存储与 O(N^3) 求解代价、以及特征频率处解不唯一的成因与 CHIEF、Burton-Miller 的适用条件。"
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
  - "边界元方法"
  - "离散原理与适用范围"
  - "奇异积分"
  - "稠密矩阵"
seo:
  title: "边界元方法：离散原理与适用范围"
  description: "从加权残值与 Green 恒等式导出边界积分方程，说明三类核函数的奇异阶与对应处理方式、稠密矩阵的 O(N^2) 存储与 O(N^3) 求解代价、以及特征频率处解不唯一的成因与 CHIEF、Burton-Miller 的适用条件。"
  keywords:
    - "边界元"
    - "离散原理与适用范围"
    - "奇异积分"
    - "稠密矩阵"
    - "Burton-Miller"
---

# 边界元方法：离散原理与适用范围

边界元把三维问题降到二维边界上，并解析地满足无穷远辐射条件，代价是矩阵从稀疏变成稠密、核函数从光滑变成奇异。它的适用性由两条尺度决定：几何表面积与波长的比值决定自由度数量，基本解的奇异阶决定积分格式的复杂度。下面给出积分方程的来源、三类奇异的处理层级、代价量级估算与非唯一性的成因。

## 从 Green 恒等式到边界积分方程

对满足控制方程的基本解 $u^*$ 与场量 $u$ 使用 Green 第二恒等式，把域内积分化为边界积分，得到边界积分表示

$$
c(\xi)\,u(\xi)+\int_\Gamma q^*(x,\xi)\,u(x)\,d\Gamma(x)
=\int_\Gamma u^*(x,\xi)\,q(x)\,d\Gamma(x),
$$

其中 $\xi$ 为源点，$q=\partial u/\partial n$ 为通量，$q^*=\partial u^*/\partial n$。系数 $c(\xi)$ 在光滑边界上等于 $1/2$，在角点与棱边上由边界两侧的立体角决定。该式的关键性质是：域内任意点的解由边界上的 $u$ 与 $q$ 唯一确定，因此只需离散边界。对 Laplace 问题，三维与二维基本解分别为

$$
u^*_{3D}=\frac{1}{4\pi r},
\qquad
u^*_{2D}=-\frac{1}{2\pi}\ln r,
$$

$r=|x-\xi|$。对 Helmholtz 问题则换成 $u^*=e^{ikr}/(4\pi r)$；对弹性力学换成 Kelvin 张量解。基本解必须与维数和控制方程同时匹配，用错维数会让常数因子差 $2\pi$ 倍，是初学阶段最常见的量级错误。

## 三类核函数与奇异阶

核函数的奇异阶决定积分能否用常规高斯求积：

$$
u^*\sim\ln r\ (\text{弱奇异}),
\qquad
q^*\sim\frac{1}{r}\ (\text{强奇异}),
\qquad
\frac{\partial q^*}{\partial n}\sim\frac{1}{r^2}\ (\text{超奇异}).
$$

弱奇异积分在二维下可用对数加权的 Gauss 求积精确处理，三维下用极坐标变换把 $1/r$ 的 Jacobi 因子消掉；强奇异积分通过刚体位移法（对 Laplace 问题，把自由项 $c(\xi)$ 用单位解的积分表示替代）间接求出；超奇异积分只在 Burton–Miller 组合方程或薄体问题中出现，需要 Hadamard 有限部分或正则化技术。实现上必须区分三类并分别处理，把强奇异积分当成普通积分直接求积会得到随网格加密不收敛的结果。

## 稠密矩阵的代价与加速结构

离散后得到 $H u=G q$，$H$、$G$ 均为 $N\times N$ 满矩阵。以复双精度（$16$ 字节）计，$N=10^{4}$ 时存储为 $10^{8}\times16=1.6\,\mathrm{GB}$，LU 分解的浮点运算量为 $\frac{2}{3}N^{3}=6.7\times10^{11}$，按 $10\,\mathrm{GFLOP/s}$ 估算需要约 $67\,\mathrm{s}$。换成单层迭代求解可以把运算量降到 $O(N^2)$ 每次迭代，但迭代次数随频率上升，实际收益有限。

一个更具体的规模估算：半径 $a=1\,\mathrm{m}$ 的球在 $1\,\mathrm{kHz}$ 空气中（$\lambda=343\,\mathrm{mm}$），按每波长 6 个单元取 $h=57.2\,\mathrm{mm}$，表面积 $4\pi a^2=12.57\,\mathrm{m^2}$，单元面积约 $h^2=3.27\times10^{-3}\,\mathrm{m^2}$，得 $N=3840$ 个单元。此时存储 $3840^2\times16=236\,\mathrm{MB}$，LU 约 $3.8\times10^{10}$ 次浮点运算，尚可接受。把频率提到 $10\,\mathrm{kHz}$（$\lambda=34.3\,\mathrm{mm}$、$h=5.72\,\mathrm{mm}$），$N$ 升到 $3.85\times10^{5}$，存储达 $2.37\,\mathrm{TB}$——直接法彻底失效，必须改用快速多极子（FMM）把存储与单次矩阵向量积降到 $O(N)$ 与 $O(N\log N)$，或改用有限元加吸收层。

## 特征频率处的非唯一性与 CHIEF

对 Helmholtz 外问题，当波数等于内域 Dirichlet 问题的某个特征值时，$H$ 与 $G$ 同时奇异，边界积分方程的解不唯一。以半径 $a=0.5\,\mathrm{m}$ 的球为例，内域 Dirichlet 特征值由 $j_n(ka)=0$ 给出：第一个根 $ka=\pi$ 对应 $f=c/(2a)=343\,\mathrm{Hz}$，$j_1$ 的首根 $ka=4.4934$ 对应 $490.7\,\mathrm{Hz}$，$j_0$ 的次根 $ka=2\pi$ 对应 $686\,\mathrm{Hz}$。这些频率与外域物理共振无关，却会让数值解在这些频点附近出现虚假峰值或迭代停滞。

两种标准解法：CHIEF 法在域内选取若干点并要求边界积分表示在这些点上给出零场，用超定方程的最小二乘解恢复唯一性，实现简单但内点数量与位置需要调试；Burton–Miller 法把原方程与其法向导数方程按 $\alpha$ 线性组合，取 $\alpha=i/k$ 即可消除全部虚假特征频率，代价是引入超奇异积分。工程上低频段用 CHIEF 足够，宽频扫描或薄体问题建议直接用 Burton–Miller。

## 失效信号与判据

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 网格加密后近场解不收敛 | 强奇异积分被当作普通积分处理 | 检查 $r\to0$ 单元的求积方案，换用刚体位移法 |
| 结果整体差 $2\pi$ 倍 | 基本解维数或常数因子取错 | 用球面 Laplace 解析解核对系数 |
| 在 $343\,\mathrm{Hz}$ 附近出现虚假峰值 | 球半径 $0.5\,\mathrm{m}$ 的内域 Dirichlet 特征频率 | 改用 Burton–Miller 或增加 CHIEF 内点 |
| 求解时间随 $N$ 按 $N^3$ 增长 | 使用了稠密 LU 分解 | 统计单次求解时间对 $N$ 的双对数斜率 |
| 内存需求超过 $100\,\mathrm{GB}$ | 未采用 FMM，$N^2$ 存储 | 按 $16N^2$ 字节估算并与可用内存比较 |
| 角点处场量出现尖峰 | $c(\xi)$ 未按立体角修正 | 对含棱边的模型输出 $c(\xi)$ 分布并核对 |
| 迭代残差降到 $10^{-3}$ 后停滞 | 矩阵接近奇异，条件数过高 | 输出条件数，与 $10^{12}$ 比较 |

## 可复算的代价脚本

```python
import math
def bem_cost(N, direct=True):
    mem = 16.0*N*N/2**30                      # GiB, 复双精度
    flop = 2.0/3.0*N**3 if direct else 2.0*N**2
    return mem, flop

a, c = 1.0, 343.0
for f in (1e3, 5e3, 10e3):
    lam = c/f
    h   = lam/6.0
    N   = int(4*math.pi*a*a/(h*h))
    mem, flop = bem_cost(N)
    print(f"f={f/1e3:5.1f}kHz lam={lam*1e3:6.1f}mm h={h*1e3:5.2f}mm "
          f"N={N:8d} mem={mem:8.2f}GiB LU={flop:.2e}")
# f=  1.0kHz lam= 343.0mm h=57.17mm N=    3845 mem=    0.22GiB LU=3.79e+10
# f=  5.0kHz lam=  68.6mm h=11.43mm N=   96131 mem=  137.70GiB LU=5.92e+14
# f= 10.0kHz lam=  34.3mm h= 5.72mm N=  384528 mem= 2203.42GiB LU=3.79e+16
```

## 参考文献

1. Brebbia, C. A., Telles, J. C. F. & Wrobel, L. C. *Boundary Element Techniques: Theory and Applications in Engineering*. Springer, 1984.
2. Brebbia, C. A. & Dominguez, J. *Boundary Elements: An Introductory Course*. 2nd ed., Computational Mechanics Publications, 1992.
3. Burton, A. J. & Miller, G. F. The application of integral equation methods to the numerical solution of some exterior boundary-value problems. *Proceedings of the Royal Society of London A*, 323(1553): 201-210, 1971.
4. Schenck, H. A. Improved integral formulation for acoustic radiation problems. *Journal of the Acoustical Society of America*, 44(1): 41-58, 1968.
5. Greengard, L. & Rokhlin, V. A fast algorithm for particle simulations. *Journal of Computational Physics*, 73(2): 325-348, 1987.
6. Liu, Y. J. *Fast Multipole Boundary Element Method: Theory and Applications in Engineering*. Cambridge University Press, 2009.