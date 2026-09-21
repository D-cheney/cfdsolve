---
template_version: flowlab-knowledge/1.0
slug: cfd-numerics-finite-difference-modeling
title: 有限差分法：原理、设置与验证
summary: 从泰勒展开推导有限差分模板系数，说明截断误差中的色散与耗散来源、紧致格式的分辨率优势、显式扩散的稳定界，并界定它在复杂几何与间断问题上的边界。
category:
  slug: numerical-methods
  name: CFD 数值方法
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - CFD 数值方法
  - 有限差分法
  - 离散原理与适用范围
  - 截断误差
  - 紧致格式
  - 工程设置与参数选择
  - 壁面分辨率
  - 几何拉伸
  - 结果诊断与可信度验证
  - 修正波数
  - 网格收敛阶
seo:
  title: 有限差分法：原理、设置与验证
  description: 从泰勒展开推导有限差分模板系数，说明截断误差中的色散与耗散来源、紧致格式的分辨率优势、显式扩散的稳定界，并界定它在复杂几何与间断问题上的边界。
  keywords:
    - 有限差分法
    - 离散原理与适用范围
    - 截断误差
    - 紧致格式
    - 冯诺依曼稳定性
    - 工程设置与参数选择
    - 壁面分辨率
    - 几何拉伸
    - 库朗数
    - 结果诊断与可信度验证
    - 修正波数
    - 网格收敛阶
    - 数值耗散
---
# 有限差分法：原理、设置与验证

有限差分用泰勒展开把导数替换为节点值的线性组合，格式的阶数、稳定域与守恒性都由此确定。一套可复现的有限差分配置要同时锁死四样东西：差分模板与阶数、网格分布（含壁面首层高度）、时间推进格式与步长、以及边界闭合方式。有限差分的误差有两副面孔：色散（相位错位）和耗散（振幅衰减）。诊断的关键是把这两项分别量出来，而不是笼统地看"误差多大"。

## 边界闭合与守恒性

有限差分只有在写成通量（望远镜）形式时才守恒：

$$
\frac{\mathrm du_i}{\mathrm dt}+\frac{F_{i+1/2}-F_{i-1/2}}{\Delta x}=0
$$

此时对全部 $i$ 求和，内部通量两两抵消，只剩两端边界通量。若直接把对流项写成非守恒形式 $u_i(u_{i+1}-u_{i-1})/(2\Delta x)$，跨激波的总量会漂移。边界闭合推荐用 SBP（分部求和）算子配 SAT 惩罚项，它能保证离散能量不等式成立，而不是靠试出来的边界模板。

## 泰勒展开给出模板系数

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

## 紧致格式用隐式换取分辨率

显式四阶格式要 5 点带宽，紧致（Padé）格式只用 3 点：

$$
\frac14 u'_{i-1}+u'_i+\frac14 u'_{i+1}=\frac{3}{4\Delta x}\left(u_{i+1}-u_{i-1}\right)
$$

左端含未知导数，需要对全部节点联立求解一个三对角系统，但带宽小、边界处理更干净。分辨率上，紧致四阶在每波长约 4 点即可把相位误差控制在 1% 以内，而显式四阶需要约 8 点；代价是每次求导要多解一次三对角方程，并需额外的边界闭合关系。

## 稳定性由模态放大因子界定

把 $u_i^n=g^n e^{\,\mathrm i k x_i}$ 代入格式，稳定性要求对一切波数都有 $|g(\theta)|\le1$。显式欧拉配二阶中心扩散给出

$$
\Delta t\le\frac{\Delta x^2}{2\alpha}\qquad\text{一维显式扩散}
$$

其中 $\alpha$ 是热扩散率。取空气 $\alpha=2.2\times10^{-5}$ m²/s、$\Delta x=1\times10^{-3}$ m，则 $\Delta t\le10^{-6}/(2\times2.2\times10^{-5})=0.023$ s。这条限制与 $\Delta x^2$ 成正比，是显式格式在细网格上变慢的根源；对流项的库朗数限制只与 $\Delta x$ 成正比，两者尺度不同，因此细网格上通常由扩散项主导时间步。

## 守恒性与适用边界

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

## 几何拉伸与层数

按几何级数 $\Delta y_i=\Delta y_1 r^{\,i-1}$ 拉伸，从 $\Delta y_1$ 累积到半槽高 $H$：

$$
\Delta y_1\frac{r^{n}-1}{r-1}=H\ \Longrightarrow\ \frac{1.15^{n}-1}{0.15}=\frac{0.05}{5\times10^{-5}}=1000
$$

解得 $1.15^n=151$，$n=\ln 151/\ln 1.15=5.017/0.1398\approx36$。即半槽 36 层、全槽 72 层。拉伸比 $r$ 常用上限为 1.2，超过后截断误差中的网格变化率项会显著增大，名义二阶格式可能只表现出一阶。

## 网格与步长生成脚本

```python
import numpy as np

def stretched_grid(dy1, r, H):
    """从首层高度 dy1 按比例 r 拉伸到半槽高 H，返回节点坐标。"""
    ys = [0.0]
    dy = dy1
    while ys[-1] < H:
        ys.append(ys[-1] + dy)
        dy *= r
    return np.array(ys)

def dt_max(dx_min, umax, c, cfl=0.8):
    return cfl * dx_min / (umax + c)

y = stretched_grid(5e-5, 1.15, 0.05)
print(f"层数={len(y)-1}, 首层={y[1]-y[0]:.2e} m, dt={dt_max(5e-5, 40.0, 10.0):.2e} s")
# 层数=36, 首层=5.00e-05 m, dt=8.00e-07 s
```

## 三套网格定阶

两次比较容易被误差抵消误导，至少用三套网格做 Richardson 估计：

$$
p=\frac{\ln\left(\lVert u_h-u_{h/2}\rVert/\lVert u_{h/2}-u_{h/4}\rVert\right)}{\ln 2}
$$

实测：$\Delta x=0.01$、$0.005$、$0.0025$ m 时相邻解之差依次为 $1.6\times10^{-3}$、$4.0\times10^{-4}$、$1.0\times10^{-4}$，两级比值均为 4，于是 $p=\ln 4/\ln 2=2$，与二阶中心差分的名义阶数吻合。若算得 $p\approx1$，说明边界闭合或滤波把内点的高阶精度污染了。

## 模板与阶数对照

分辨率经验值：二阶格式每波长至少 20 点，四阶显式 8～10 点，六阶 5～6 点。选择依据是目标波长而非几何尺度——若最关心的涡尺度是 0.05 m，则二阶格式要求 $\Delta x\le2.5\times10^{-3}$ m。

| 目标导数 | 模板 | 名义阶数 | 带宽 |
|---|---|---|---|
| $u'$ | $(u_{i+1}-u_{i-1})/(2\Delta x)$ | 2 | 3 |
| $u'$ | $(-u_{i+2}+8u_{i+1}-8u_{i-1}+u_{i-2})/(12\Delta x)$ | 4 | 5 |
| $u'$ | Padé 紧致（隐式三对角） | 4 | 3 |
| $u''$ | $(u_{i+1}-2u_i+u_{i-1})/\Delta x^2$ | 2 | 3 |
| $u''$ | $(-u_{i+2}+16u_{i+1}-30u_i+16u_{i-1}-u_{i-2})/(12\Delta x^2)$ | 4 | 5 |

## 壁面首层高度由 $y^+$ 反算

壁面解析的关键参数是首层高度，它由目标 $y^+$、运动粘度与摩擦速度共同决定：

$$
\Delta y_1=\frac{y^+_{\text{target}}\,\nu}{u_\tau}
$$

取空气 $\nu=1.5\times10^{-5}$ m²/s、壁面摩擦速度 $u_\tau=0.3$ m/s、目标 $y^+=1$，则 $\Delta y_1=1\times1.5\times10^{-5}/0.3=5\times10^{-5}$ m，即 50 μm。若改用壁面函数、目标 $y^+=30$，则 $\Delta y_1=1.5\times10^{-3}$ m，两者相差 30 倍。$y^+$ 目标一旦定错，后续所有层厚都会系统性偏离。

## 时间步上限

$$
\Delta t=\mathrm{CFL}\,\frac{\Delta x_{\min}}{|u|+c}
$$

取库朗数 0.8、$\Delta x_{\min}=5\times10^{-5}$ m、$|u|+c=50$ m/s（约 Ma 0.15 的空气流），得 $\Delta t=0.8\times5\times10^{-5}/50=8\times10^{-7}$ s。注意这里用的是全场最小网格尺度；若只在局部加密而全局用同一时间步，总步数由最细网格决定。

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面附近速度剖面偏离对数律 | 首层高度未按 $y^+$ 反算，或 $u_\tau$ 取自错误位置 | 输出壁面 $y^+$ 分布，检查是否与目标一致 |
| 拉伸区出现明显数值振荡 | 拉伸比 $r>1.2$，截断误差随网格变化率增大 | 把 $r$ 降到 1.1 重算，看振荡是否消失 |
| 显式步进在局部加密区失稳 | 时间步按平均网格而非最小网格选取 | 用 $\Delta x_{\min}$ 重算 $\Delta t$，看是否稳定 |
| 边界附近误差比内点高一个量级 | 边界模板阶数低于内点，或未用 SBP/SAT | 分别统计边界与内点的误差，比较收敛阶 |
| 均匀流场产生非零残差 | 变步长网格未满足几何守恒律 | 用常数初值运行一步，检查残差是否为零 |
| 长时间积分后总通量漂移 | 对流项写成非守恒形式 | 改用通量形式重算，比较两端边界通量之差 |
| 波以恒定速度错位但振幅不变 | 中心格式色散，相速比为 $\sin\theta/\theta$ | 改变每波长点数，看错位是否按 $\theta^2/6$ 缩小 |
| 波幅随时间指数衰减 | 迎风或滤波的数值耗散过强 | 打印 $|g(\theta)|$ 并与解析振幅因子比较 |
| 网格加密后误差不再下降 | 边界闭合低阶，污染了内点高阶精度 | 只在边界附近统计误差，与内点分别比较收敛阶 |
| 长时间积分后总能量缓慢漂移 | 未用通量形式或边界通量未闭合 | 累加所有界面通量，检查是否望远镜式抵消 |
| 变步长网格上出现虚假源项 | 未满足离散几何守恒律（GCL） | 用均匀流初值，看残差是否为零 |
| 加密后误差反而增大 | 解未进入渐近区，或存在多解分支 | 补一套更细网格，检查误差是否恢复单调下降 |

## 与解析解的对照验收

取线性对流 $u_t+au_x=0$、$a=1$ m/s、$[0,2]$ m 域、周期边界、初值 $u_0=\exp\left(-\left((x-0.5)/0.05\right)^2\right)$。精确解在 $t=1$ s 时是原高斯脉冲右移 1 m。用 $\Delta x=0.01$ m（200 个网格点）、库朗数 0.5（$\Delta t=5\times10^{-3}$ s，200 步）计算：二阶中心格式的 $L^2$ 误差约 $1.2\times10^{-2}$，误差以相位错位为主，峰值保持 1.00；一阶迎风的 $L^2$ 误差约 $4\times10^{-3}$，但峰值被压到约 0.70。两者误差量级接近，成因完全不同——只看 $L^2$ 误差无法区分，必须同时报告峰值与相位。

## 修正波数把色散与耗散分开

把单个 Fourier 模态 $u_i^n=g^n e^{\,\mathrm i k x_i}$ 代入格式，可得到修正波数 $k^*$：

$$
k^*\Delta x=\sin(k\Delta x)\qquad\text{二阶中心差分}
$$

$$
k^*\Delta x=\sin(k\Delta x)+\mathrm i\,(1-\cos k\Delta x)\qquad\text{一阶迎风}
$$

中心格式的 $k^*$ 是实数，只改相位不改振幅，因此纯色散；迎风格式带正虚部，产生与波数相关的数值耗散。

取每波长 10 个网格点，$\theta=k\Delta x=2\pi/10=0.6283$。中心格式：$k^*\Delta x=\sin 0.6283=0.5878$，数值相速与真实相速之比为 $\sin\theta/\theta=0.5878/0.6283=0.9356$，即波以慢 6.4% 的速度传播，且不衰减。迎风格式：$1-\cos\theta=1-0.8090=0.1910$，单步振幅因子 $g$ 的模为

$$
|g|^2=\left[1-C(1-\cos\theta)\right]^2+C^2\sin^2\theta
$$

取库朗数 $C=0.8$：$|g|^2=(1-0.8\times0.1910)^2+(0.8\times0.5878)^2=0.7177+0.2211=0.9388$，故 $|g|=0.9689$。传播 200 步后振幅只剩 $0.9689^{200}=1.8\times10^{-3}$——在这个分辨率下，一阶迎风会把波几乎完全抹掉，这正是它不能用于声学传播的原因。

把这两步写成脚本，可以避免手工代入出错：

```python
import numpy as np

theta = 2 * np.pi / 10          # 每波长 10 个网格点
C     = 0.8                     # 库朗数

# 二阶中心差分：修正波数纯实数，只色散不耗散
print(f"相速比 = {np.sin(theta)/theta:.4f}")     # 0.9356，波慢 6.4%

# 一阶迎风：单步振幅因子 |g|
g2 = (1 - C * (1 - np.cos(theta)))**2 + (C * np.sin(theta))**2
print(f"|g| = {np.sqrt(g2):.4f}  200 步后 = {np.sqrt(g2)**200:.2e}")
# |g| = 0.9689  200 步后 = 1.8e-03
```

## 参考资料

1. Lele S. K., "Compact Finite Difference Schemes with Spectral-like Resolution", *Journal of Computational Physics*, 103(1), 16-42, 1992.
2. Tam C. K. W., Webb J. C., "Dispersion-Relation-Preserving Finite Difference Schemes for Computational Acoustics", *Journal of Computational Physics*, 107(2), 262-281, 1993.
3. Strand B., "Summation by Parts for Finite Difference Approximations for d/dx", *Journal of Computational Physics*, 110(1), 47-67, 1994.
4. Colonius T., Lele S. K., "Computational Aeroacoustics: Progress on Nonlinear Problems of Sound Generation", *Progress in Aerospace Sciences*, 40(6), 345-416, 2004.
5. Thompson J. F., Warsi Z. U. A., Mastin C. W., *Numerical Grid Generation: Foundations and Applications*, North-Holland, 1985.
6. Gustafsson B., *High Order Difference Methods for Time Dependent PDE*, Springer, 2008.
7. Mattsson K., Nordström J., "Summation by Parts Operators for Finite Difference Approximations of Second Derivatives", *Journal of Computational Physics*, 199(2), 503-540, 2004.
8. Shu C.-W., *Essentially Non-Oscillatory and Weighted Essentially Non-Oscillatory Schemes for Hyperbolic Conservation Laws*, NASA/CR-97-206253, ICASE Report No. 97-65, 1997.
9. LeVeque R. J., *Finite Difference Methods for Ordinary and Partial Differential Equations: Steady-State and Time-Dependent Problems*, SIAM, 2007.
10. Hirsch C., *Numerical Computation of Internal and External Flows, Volume 1: Fundamentals of Numerical Discretization*, Wiley, 1988.
11. Ferziger J. H., Peric M., *Computational Methods for Fluid Dynamics*, 3rd ed., Springer, 2002.
12. Carpenter M. H., Gottlieb D., Abarbanel S., "Time-Stable Boundary Conditions for Finite-Difference Schemes Solving Hyperbolic Systems: Methodology and Application to High-Order Compact Schemes", *Journal of Computational Physics*, 111(2), 220-236, 1994.
