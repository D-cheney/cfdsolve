---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-discontinuous-galerkin-modeling
title: "间断 Galerkin 方法：离散原理与适用范围"
summary: "从分片多项式空间出发推导间断 Galerkin 的弱形式与界面数值通量，说明守恒与任意高阶精度的共同来源，并给出阶数、代价与适用边界的对照表。"
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
  - "间断 Galerkin 方法"
  - "离散原理与适用范围"
  - "分片多项式"
  - "Rusanov 通量"
seo:
  title: "间断 Galerkin 方法：离散原理与适用范围"
  description: "从分片多项式空间出发推导间断 Galerkin 的弱形式与界面数值通量，说明守恒与任意高阶精度的共同来源，并给出阶数、代价与适用边界的对照表。"
  keywords:
    - "间断 Galerkin 方法"
    - "离散原理与适用范围"
    - "分片多项式"
    - "Rusanov 通量"
    - "超收敛"
---

# 间断 Galerkin 方法：离散原理与适用范围

DG 把有限元的局部多项式逼近和有限体积的单值界面通量拼在一起，因此同时具备任意高阶精度与逐元素守恒；代价是自由度按 $(k+1)^d$ 增长、显式步长按 $2k+1$ 收缩。本文从分片多项式空间出发，说明弱形式如何产生界面通量，并界定它在哪类问题上不划算。

## 一、分片多项式空间

DG 的试探与检验函数取自同一个分片多项式空间

$$
V_h^k=\left\{v\in L^2(\Omega):\ v|_K\in P^k(K),\ \forall K\in\mathcal{T}_h\right\}
$$

基函数不跨单元连续，界面上的跳跃是被允许的，这正是"间断"二字的来源。由于每个单元的未知量彼此独立，质量矩阵是块对角的，显式步进只需逐单元求逆；也正因为不强制连续性，$k$ 可以逐单元改变，形成 $hp$ 自适应。

## 二、弱形式如何产生界面通量

对守恒律 $\partial_t u+\nabla\cdot\mathbf f(u)=0$ 乘以检验函数并在单元上分部积分，边界项中出现的 $u_h$ 在界面两侧不相等，必须由两侧状态共同决定，于是引入数值通量 $\hat{\mathbf f}$：

$$
\int_K\partial_t u_h\,v_h\,d\Omega-\int_K\mathbf f(u_h)\cdot\nabla v_h\,d\Omega+\oint_{\partial K}\hat{\mathbf f}\!\left(u_h^-,u_h^+\right)\cdot\mathbf n\,v_h\,dS=0
$$

Rusanov（局部 Lax-Friedrichs）通量是最常用的选择：

$$
\hat{\mathbf f}(a,b)\cdot\mathbf n=\frac12\left[\mathbf f(a)+\mathbf f(b)\right]\cdot\mathbf n-\frac{\alpha}{2}(b-a),\qquad \alpha=\max_{u\in[a,b]}\left|\frac{\partial\mathbf f}{\partial u}\cdot\mathbf n\right|
$$

第一项是中心部分，守恒但不耗散；第二项是耗散部分，只在特征速度方向上起作用。由于 $\hat{\mathbf f}$ 在界面上单值，两侧单元引用的耗散方向相反，求和时内部界面贡献严格抵消——这就是 DG 逐元素守恒的机制。

## 三、精度与耗散的双重性格

$L^2$ 误差按 $O(h^{k+1})$ 收敛，$H^1$ 半范按 $O(h^{k})$；在 1D 线性问题配迎风通量时，单元下风向端点还有 $O(h^{2k+1})$ 的超收敛。与中心差分不同，DG 的数值耗散完全来自 $\alpha$ 项：光滑区可以把它调到最小以保持低耗散，间断区再通过限制器局部增大。代价随阶数的增长可以用下表估算：

| 指标（二维四边形） | $k=1$ | $k=2$ | $k=3$ |
|---|---|---|---|
| 每单元自由度 | 4 | 9 | 16 |
| 稳定库朗数上限（相对 $k=0$） | 约 1/3 | 约 1/5 | 约 1/7 |
| 每步算子代价（相对） | 4 | 9 | 16 |
| 达 $10^{-6}$ 所需单元数 | 基准 | 约 1/4 | 约 1/9 |
| 单位精度成本 | 基准 | 约 0.6 | 约 0.4 |

最后一行的含义是：$k=2$ 通常比 $k=1$ 更省算力，但继续升到 $k=4$ 以上时，时间步的 $1/(2k+1)$ 收缩开始吃掉空间精度的收益。

Rusanov 通量的实现只有两行，但它体现了 DG 与连续有限元最本质的差别：

```python
import numpy as np

def rusanov(a, b, flux, alpha):
    """局部 Lax-Friedrichs (Rusanov) 通量：中心项 + 耗散项。"""
    return 0.5 * (flux(a) + flux(b)) - 0.5 * alpha * (b - a)

flux  = lambda u: 1.0 * u        # 线性对流，波速 1 m/s
alpha = 1.0                      # 界面局部最大特征速度
print(rusanov(1.0, 0.0, flux, alpha))   # 1.0
print(rusanov(0.0, 1.0, flux, alpha))   # 0.0
# 通量只依赖 (a, b) 与 alpha：界面只存一个值，两侧单元引用同值，内部面严格抵消
```

## 四、适用边界

适合的场合：长距离低耗散的声学与线性对流传播、含激波与接触间断的可压缩流、需要逐单元守恒的组分输运、以及依靠局部改阶做 $hp$ 自适应的算例。

不适合的场合：强粘性主导的不可压 Navier-Stokes（椭圆算子下 DG 自由度冗余，连续有限元更经济）、要求速度场逐点无散的场合（DG 只保证逐元素守恒，不保证逐点无散，需要 H(div) 单元或投影）、以及三维大 $k$ 配置下的内存受限问题。

## 五、升级判据与失效信号

判断是否升阶，应比较"升阶带来的误差下降"与"自由度增长"的比值。若升阶后误差几乎不变，说明误差已被网格几何或时间离散主导，此时加密网格或缩小时间步比升阶更有效。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 升阶后误差几乎不变 | 误差由网格几何或时间离散主导 | 固定 $k$，加密网格，看误差是否按 $k+1$ 阶下降 |
| 激波处出现对称振荡 | 通量耗散不足，或限制器未启用 | 提高 $\alpha$ 或开启 TVB 限制器，比较总变差变化 |
| 长时间传播后波形被抹平 | 耗散系数取成全局最大特征速度，未局部化 | 改用局部 $\alpha$，比较振幅随时间衰减的斜率 |
| 粘性项界面出现跳跃 | 椭圆算子的内罚项缺失或过弱 | 关闭内罚重算，观察界面梯度是否失稳 |
| 速度场逐点散度不为零 | DG 只保证逐元素守恒 | 计算 $\lVert\nabla\cdot\mathbf u_h\rVert$，与 H(div) 单元结果对比 |
| 内存随阶数急剧膨胀 | 自由度按 $(k+1)^d$ 增长，未提前外推 | 按自由度公式外推 $k=3,4$ 的内存与每步耗时 |

## 六、文献来源

1. Cockburn B., Hou S., Shu C.-W., "The Runge-Kutta Local Projection Discontinuous Galerkin Finite Element Method for Conservation Laws IV: The Multidimensional Case", *Mathematics of Computation*, 54(190), 545-581, 1990.
2. Bassi F., Rebay S., "A High-Order Accurate Discontinuous Finite Element Method for the Numerical Solution of the Compressible Navier-Stokes Equations", *Journal of Computational Physics*, 131(2), 267-279, 1997.
3. Krivodonova L., Xin J., Remacle J.-F., Chevaugeon N., Flaherty J. E., "Shock Detection and Limiting with Discontinuous Galerkin Methods for Hyperbolic Conservation Laws", *Applied Numerical Mathematics*, 48(3-4), 323-338, 2004.
4. Shu C.-W., "Discontinuous Galerkin Methods: General Approach and Stability", in *Numerical Solutions of Partial Differential Equations*, Advanced Courses in Mathematics CRM Barcelona, Birkhauser, 2009.
