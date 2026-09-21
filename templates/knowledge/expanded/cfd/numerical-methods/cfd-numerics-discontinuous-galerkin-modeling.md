---
template_version: flowlab-knowledge/1.0
slug: cfd-numerics-discontinuous-galerkin-modeling
title: 间断 Galerkin 方法：原理、设置与验证
summary: 从分片多项式空间出发推导间断 Galerkin 的弱形式与界面数值通量，说明守恒与任意高阶精度的共同来源，并给出阶数、代价与适用边界的对照表。
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
  - 间断 Galerkin 方法
  - 离散原理与适用范围
  - 分片多项式
  - Rusanov 通量
  - 工程设置与参数选择
  - SIPG 内罚
  - TVB 限制器
  - 结果诊断与可信度验证
  - 数值通量
  - 局部守恒
seo:
  title: 间断 Galerkin 方法：原理、设置与验证
  description: 从分片多项式空间出发推导间断 Galerkin 的弱形式与界面数值通量，说明守恒与任意高阶精度的共同来源，并给出阶数、代价与适用边界的对照表。
  keywords:
    - 间断 Galerkin 方法
    - 离散原理与适用范围
    - 分片多项式
    - Rusanov 通量
    - 超收敛
    - 工程设置与参数选择
    - SIPG 内罚
    - TVB 限制器
    - 库朗数
    - 结果诊断与可信度验证
    - 数值通量
    - 局部守恒
---
# 间断 Galerkin 方法：原理、设置与验证

DG 把有限元的局部多项式逼近和有限体积的单值界面通量拼在一起，因此同时具备任意高阶精度与逐元素守恒；代价是自由度按 $(k+1)^d$ 增长、显式步长按 $2k+1$ 收缩。DG 的工程配置只需确定五件事：多项式阶数 $k$、界面数值通量、显式时间步、内罚稳定化系数和限制器策略。间断 Galerkin（DG）方法的验算有三条互不替代的硬指标：离散守恒误差应落在机器精度量级、$L^2$ 误差随网格以 $k+1$ 阶下降、限制器只在间断邻域激活。

## 基础概念与控制关系

### 先把守恒量算到机器精度

DG 的守恒不是事后补上的修正，而是逐元素弱形式的直接推论：界面上左右两侧引用同一个单值数值通量，把所有单元的方程相加时内部界面通量逐对抵消。对一维标量守恒律 $\partial_t u+\partial_x f(u)=0$，单元 $K_j=[x_{j-1/2},x_{j+1/2}]$ 上的半离散弱形式为

$$
\int_{K_j}\partial_t u_h\,v_h\,dx-\int_{K_j}f(u_h)\,\partial_x v_h\,dx+\hat f_{j+1/2}\,v_h\!\left(x_{j+1/2}^-\right)-\hat f_{j-1/2}\,v_h\!\left(x_{j-1/2}^+\right)=0
$$

对全部 $j$ 求和并取 $v_h\equiv 1$，内部界面通量成对抵消，只剩两端边界项，得到可直接核对的全局预算

$$
\frac{d}{dt}\sum_{j=1}^{N}\int_{K_j}u_h\,dx=\hat f_{1/2}-\hat f_{N+1/2}
$$

因此守恒误差与数值通量单值性、Runge-Kutta 各阶段的状态更新是绑定的：这个恒等式不成立，就不必去调物理模型。

以 $[0,1]$ m 域、$N=200$ 个均匀单元、周期边界、初值 $u_0(x)=\sin(2\pi x)$ 为例，$\int_0^1 u_0\,dx=0$，精确解的积分恒为 0。$P^2$ 单元（$k=2$）取 $h=5\times10^{-3}$ m、波速 $a=1$ m/s、库朗数 0.2，则 $\Delta t=0.2\times5\times10^{-3}/(5\times1)=2\times10^{-4}$ s，积分到 $t=1$ s 共 5000 步。合格的实现里 $|\sum_j\int_{K_j}u_h\,dx|$ 应始终低于 $10^{-13}$；若量级停在 $10^{-6}$，几乎都是边界通量被两侧单元各算一次，或限制器在边界单元上把通量改成了非单值。

### 分片多项式空间

DG 的试探与检验函数取自同一个分片多项式空间

$$
V_h^k=\left\{v\in L^2(\Omega):\ v|_K\in P^k(K),\ \forall K\in\mathcal{T}_h\right\}
$$

基函数不跨单元连续，界面上的跳跃是被允许的，这正是"间断"二字的来源。由于每个单元的未知量彼此独立，质量矩阵是块对角的，显式步进只需逐单元求逆；也正因为不强制连续性，$k$ 可以逐单元改变，形成 $hp$ 自适应。

### 弱形式如何产生界面通量

对守恒律 $\partial_t u+\nabla\cdot\mathbf f(u)=0$ 乘以检验函数并在单元上分部积分，边界项中出现的 $u_h$ 在界面两侧不相等，必须由两侧状态共同决定，于是引入数值通量 $\hat{\mathbf f}$：

$$
\int_K\partial_t u_h\,v_h\,d\Omega-\int_K\mathbf f(u_h)\cdot\nabla v_h\,d\Omega+\oint_{\partial K}\hat{\mathbf f}\!\left(u_h^-,u_h^+\right)\cdot\mathbf n\,v_h\,dS=0
$$

Rusanov（局部 Lax-Friedrichs）通量是最常用的选择：

$$
\hat{\mathbf f}(a,b)\cdot\mathbf n=\frac12\left[\mathbf f(a)+\mathbf f(b)\right]\cdot\mathbf n-\frac{\alpha}{2}(b-a),\qquad \alpha=\max_{u\in[a,b]}\left|\frac{\partial\mathbf f}{\partial u}\cdot\mathbf n\right|
$$

第一项是中心部分，守恒但不耗散；第二项是耗散部分，只在特征速度方向上起作用。由于 $\hat{\mathbf f}$ 在界面上单值，两侧单元引用的耗散方向相反，求和时内部界面贡献严格抵消——这就是 DG 逐元素守恒的机制。

### 精度与耗散的双重性格

$L^2$ 误差按 $O(h^{k+1})$ 收敛，$H^1$ 半范按 $O(h^{k})$；在 1D 线性问题配迎风通量时，单元下风向端点还有 $O(h^{2k+1})$ 的超收敛。与中心差分不同，DG 的数值耗散完全来自 $\alpha$ 项：光滑区可以把它调到最小以保持低耗散，间断区再通过限制器局部增大。代价随阶数的增长可以用下表估算：

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

| 指标（二维四边形） | $k=1$ | $k=2$ | $k=3$ |
|---|---|---|---|
| 每单元自由度 | 4 | 9 | 16 |
| 稳定库朗数上限（相对 $k=0$） | 约 1/3 | 约 1/5 | 约 1/7 |
| 每步算子代价（相对） | 4 | 9 | 16 |
| 达 $10^{-6}$ 所需单元数 | 基准 | 约 1/4 | 约 1/9 |
| 单位精度成本 | 基准 | 约 0.6 | 约 0.4 |

### 界面通量与内罚系数

数值通量决定界面上如何合并左右两个状态。对流项可用局部 Lax-Friedrichs（Rusanov），耗散系数取界面两侧最大特征速度；扩散项用对称内罚法（SIPG），其惩罚系数按单元阶数与尺度定标：

$$
\sigma_f=\sigma_0\,\frac{(k+1)^2}{h_f}
$$

$\sigma_0$ 取 4～10 保证强制稳定。取得过小，界面处会出现锯齿状梯度；取得过大，矩阵条件数被抬高一个量级，迭代求解变慢。$k=2$、$h_f=5\times10^{-3}$ m、$\sigma_0=6$ 时，$\sigma_f=6\times9/(5\times10^{-3})=1.08\times10^{4}\ \mathrm{m^{-1}}$。

## 适用边界与方案选择

### 适用边界

适合的场合：长距离低耗散的声学与线性对流传播、含激波与接触间断的可压缩流、需要逐单元守恒的组分输运、以及依靠局部改阶做 $hp$ 自适应的算例。

不适合的场合：强粘性主导的不可压 Navier-Stokes（椭圆算子下 DG 自由度冗余，连续有限元更经济）、要求速度场逐点无散的场合（DG 只保证逐元素守恒，不保证逐点无散，需要 H(div) 单元或投影）、以及三维大 $k$ 配置下的内存受限问题。

### 限制器的激活范围

DG 用 TVB/minmod 类限制器抑制激波振荡，但限制器一旦在光滑区被触发，就把局部精度降回一阶。诊断时不要只看误差云图，而应逐步输出限制器激活单元数：光滑解上该计数应恒为 0；若在解的光滑段持续非零，说明 TVB 参数 $M$ 设得过小，或者单元已退化。对含真实间断的算例，激活计数应集中在间断前后各 1～2 个单元内，且随网格加密不向外扩散。

## 工程设置与实施

### 三套网格定阶，而不是两次比较

DG 的 $L^2$ 收敛阶应等于 $k+1$；在 1D 线性对流配迎风数值通量时，单元下风向端点还可观察到 $O(h^{2k+1})$ 的超收敛。用三套按 $2:1$ 加密的网格计算观测阶

$$
p_{\mathrm{obs}}=\frac{1}{\ln 2}\ln\frac{\lVert u-u_h\rVert_{L^2}}{\lVert u-u_{h/2}\rVert_{L^2}}
$$

实测一组 $P^2$ 数据：$h=2.0\times10^{-2}$ m 时误差 $3.2\times10^{-3}$，$h=1.0\times10^{-2}$ m 时 $4.0\times10^{-4}$，$h=5.0\times10^{-3}$ m 时 $5.0\times10^{-5}$。两级比值都是 8，于是 $p_{\mathrm{obs}}=\ln 8/\ln 2=3$，与 $k+1=3$ 吻合。只做两次比较时，一次偶然的误差抵消就能伪造出高阶假象；三套网格还能同时暴露"阶数在细网格上掉下来"这种典型故障。

定阶与守恒检查可以写成两段短脚本，便于在每次改动后重跑：

```python
import numpy as np

def observed_order(h, err):
    """由 2:1 加密网格的 L2 误差序列估计观测阶。"""
    return [np.log(err[i] / err[i + 1]) / np.log(h[i] / h[i + 1])
            for i in range(len(h) - 1)]

h   = [2.0e-2, 1.0e-2, 5.0e-3]      # 单元尺度，单位 m
err = [3.2e-3, 4.0e-4, 5.0e-5]      # 对应 L2 误差
print(observed_order(h, err))       # [3.0, 3.0]，与 k+1=3 一致

def conservation_residual(mass, f_left, f_right, dt):
    """检验 d/dt∫u 是否等于两端边界通量之差。"""
    return (mass[1] - mass[0]) / dt - (f_left - f_right)
```

### 一套可复现的 $Q_2$ 配置

| 参数 | 取值 | 依据 |
|---|---|---|
| 多项式阶数 $k$ | 2（$Q_2$） | 目标 $L^2$ 误差 $5\times10^{-5}$，$h$ 已由 $200\times200$ 网格锁定 |
| 单元尺度 $h$ | $5\times10^{-3}$ m | 特征波长 0.5 m 的 1/100 |
| 界面数值通量 | 局部 Lax-Friedrichs | 线性对流下无需特征分解，$\alpha$ 取局部最大特征速度 |
| 库朗数 | 0.2 | SSP-RK3 显式，留 40% 余量 |
| 时间步 $\Delta t$ | $2.0\times10^{-4}$ s | 由 $(2k+1)$ 与 $h$ 反算 |
| SIPG 惩罚 $\sigma_f$ | $1.08\times10^{4}\ \mathrm{m^{-1}}$ | $\sigma_0=6$，$(k+1)^2/h_f$ |
| 求积点数 | 3（Gauss-Legendre） | 恰好精确积分 $2k$ 次多项式 |
| 限制器 | TVB minmod，$M=50$ | 仅在间断邻域激活 |

### 配置反算脚本

```python
import math

def dg_setup(k, h, a_max, cfl, sigma0, dim=2, elem='quad'):
    """由目标阶数与网格反算 DG 配置。"""
    dof = (k + 1) ** dim if elem == 'quad' else math.comb(k + dim, dim)
    dt = cfl * h / ((2 * k + 1) * a_max)      # 显式稳定步长
    sigma = sigma0 * (k + 1) ** 2 / h         # SIPG 界面惩罚
    nq = k + 1                                # Gauss-Legendre 点数
    return dict(dof_per_elem=dof, dt=dt, sigma=sigma, nq=nq)

for k in (1, 2, 3):
    print(k, dg_setup(k, h=5e-3, a_max=1.0, cfl=0.2, sigma0=6.0))
# 1 {'dof_per_elem': 4,  'dt': 3.33e-04, 'sigma': 4800.0, 'nq': 2}
# 2 {'dof_per_elem': 9,  'dt': 2.00e-04, 'sigma': 10800.0, 'nq': 3}
# 3 {'dof_per_elem': 16, 'dt': 1.43e-04, 'sigma': 19200.0, 'nq': 4}
```

### 阶数决定自由度，自由度决定预算

在 $d$ 维张量积单元（四边形/六面体）上，$P^k$ 空间每单元的自由度是 $(k+1)^d$；在单纯形单元（三角形/四面体）上是组合数 $\binom{k+d}{d}$。

$$
\mathrm{DOF}_{\text{quad}}=(k+1)^d\,N_e,\qquad \mathrm{DOF}_{\text{simplex}}=\binom{k+d}{d}\,N_e
$$

二维 $Q_2$ 每单元 9 个自由度；若网格是 $200\times200=4\times10^4$ 个单元，总自由度约 $3.6\times10^5$。自由度直接决定质量矩阵规模与显式步进的每步代价，因此升阶前应先按上式外推内存，而不是等程序报错。

### 显式步长被 $(2k+1)$ 收缩

DG 的显式稳定域比同阶有限体积更窄，算子谱半径随阶数近似按 $2k+1$ 增长，因此时间步需按阶数折算：

$$
\Delta t\le \mathrm{CFL}\,\frac{h}{(2k+1)\,a_{\max}}
$$

其中 $a_{\max}$ 是全场最大特征速度。取 $h=5\times10^{-3}$ m、$a_{\max}=1$ m/s、库朗数 0.2：$k=1$ 时 $\Delta t=3.3\times10^{-4}$ s，$k=2$ 时 $2.0\times10^{-4}$ s，$k=3$ 时 $1.4\times10^{-4}$ s。同样网格上升一级阶数，步数增加约 40%，这是高阶 DG 的隐藏成本。

## 异常诊断与失效模式

### 故障模式与判定试验

判断是否升阶，应比较"升阶带来的误差下降"与"自由度增长"的比值。若升阶后误差几乎不变，说明误差已被网格几何或时间离散主导，此时加密网格或缩小时间步比升阶更有效。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 升阶后误差几乎不变 | 误差由网格几何或时间离散主导 | 固定 $k$，加密网格，看误差是否按 $k+1$ 阶下降 |
| 激波处出现对称振荡 | 通量耗散不足，或限制器未启用 | 提高 $\alpha$ 或开启 TVB 限制器，比较总变差变化 |
| 长时间传播后波形被抹平 | 耗散系数取成全局最大特征速度，未局部化 | 改用局部 $\alpha$，比较振幅随时间衰减的斜率 |
| 粘性项界面出现跳跃 | 椭圆算子的内罚项缺失或过弱 | 关闭内罚重算，观察界面梯度是否失稳 |
| 速度场逐点散度不为零 | DG 只保证逐元素守恒 | 计算 $\lVert\nabla\cdot\mathbf u_h\rVert$，与 H(div) 单元结果对比 |
| 内存随阶数急剧膨胀 | 自由度按 $(k+1)^d$ 增长，未提前外推 | 按自由度公式外推 $k=3,4$ 的内存与每步耗时 |
| 显式步进在库朗数约 0.5 处失稳 | 时间步未按 $(2k+1)$ 折算，直接沿用了有限体积经验 | 固定 $h$ 与 $k$，二分搜索首次失稳的库朗数 |
| 扩散算例界面梯度呈锯齿 | SIPG 惩罚过小，界面跳跃未受罚 | 把 $\sigma_0$ 从 4 提到 10，看锯齿是否消失 |
| 光滑解上限制器频繁激活 | TVB 的 $M$ 取成 0，退化为 minmod | 统计激活单元数，逐级提高 $M$ 直到光滑区计数归零 |
| 质量矩阵出现显著非对角元 | 求积点数 $n_q<k+1$，Legendre 基的正交性被破坏 | 打印质量矩阵非对角范数，与 $10^{-14}$ 比较 |
| 内存超出预算 | 自由度按 $(k+1)^d$ 增长，未提前外推 | 按 DOF 公式外推 $k=3,4$ 的内存与每步耗时 |
| 时间步减半后误差几乎不变 | 误差由空间离散主导，时间方向已过度解析 | 固定 $\Delta t$，只加密网格，比较误差下降率 |
| $L^2$ 误差在细网格上停在 $10^{-4}$ 不再下降 | 时间离散阶数低于空间阶数，或限制器主导误差 | 固定 $h$，把 $\Delta t$ 连续减半三次，看误差是否按 RK 阶下降 |
| 总质量以每步 $10^{-6}$ 的速度单调漂移 | 界面通量非单值，或边界单元通量符号反了 | 逐步累加 $\frac{d}{dt}\sum_j\int u_h$，与 $\hat f_{1/2}-\hat f_{N+1/2}$ 逐项对差 |
| 高阶单元（$k\ge3$）在细网格上突然发散 | 时间步超过 $(2k+1)$ 的显式限制 | 固定 $h$，从库朗数 0.1 向上扫描，记录首次失稳的值 |
| 激波后出现等宽台阶 | minmod 过度压缩，解被削平 | 换 MC 或 van Leer，比较总变差与激波厚度 |
| 光滑区误差比 $k+1$ 阶预期大一档 | 限制器在光滑区被误触发 | 统计每步限制器激活单元数，检查 TVB 参数 $M$ |
| 单元下风向端点误差远低于单元内部 | 超收敛点被误当作整体精度 | 分别在单元内部与下风向端点采样，比较两组误差的阶 |

## 验证、验收与复现

### 与精确解的对照验收

取线性对流 $u_t+u_x=0$、$u_0=\sin(2\pi x)$、周期边界，精确解为 $u(x,t)=\sin(2\pi(x-t))$。在 $t=1$ s 比较 $L^2$ 误差：$P^1$ 应约 $2\times10^{-3}$、$P^2$ 应约 $5\times10^{-5}$（对应第二节 $h=5\times10^{-3}$ 一列）。除误差外还应同时报告限制器激活计数、守恒偏差、以及 $\Delta t$ 减半后误差的变化量。任何一项超标，先按第四节定位，再考虑是否需要提高多项式阶数。

## 参考资料

1. Cockburn B., Hou S., Shu C.-W., "The Runge-Kutta Local Projection Discontinuous Galerkin Finite Element Method for Conservation Laws IV: The Multidimensional Case", *Mathematics of Computation*, 54(190), 545-581, 1990.
2. Bassi F., Rebay S., "A High-Order Accurate Discontinuous Finite Element Method for the Numerical Solution of the Compressible Navier-Stokes Equations", *Journal of Computational Physics*, 131(2), 267-279, 1997.
3. Krivodonova L., Xin J., Remacle J.-F., Chevaugeon N., Flaherty J. E., "Shock Detection and Limiting with Discontinuous Galerkin Methods for Hyperbolic Conservation Laws", *Applied Numerical Mathematics*, 48(3-4), 323-338, 2004.
4. Shu C.-W., "Discontinuous Galerkin Methods: General Approach and Stability", in *Numerical Solutions of Partial Differential Equations*, Advanced Courses in Mathematics CRM Barcelona, Birkhauser, 2009.
5. Cockburn B., Shu C.-W., "TVB Runge-Kutta Local Projection Discontinuous Galerkin Finite Element Method for Conservation Laws II: General Framework", *Mathematics of Computation*, 52(186), 411-435, 1989.
6. Arnold D. N., Brezzi F., Cockburn B., Marini L. D., "Unified Analysis of Discontinuous Galerkin Methods for Elliptic Problems", *SIAM Journal on Numerical Analysis*, 39(5), 1749-1779, 2002.
7. Gottlieb S., Shu C.-W., Tadmor E., "Strong Stability-Preserving High-Order Time Discretization Methods", *SIAM Review*, 43(1), 89-112, 2001.
8. Persson P.-O., Peraire J., "Sub-Cell Shock Capturing for Discontinuous Galerkin Methods", *44th AIAA Aerospace Sciences Meeting and Exhibit*, AIAA Paper 2006-0112, 2006.
9. Reed W. H., Hill T. R., *Triangular Mesh Methods for the Neutron Transport Equation*, Los Alamos Scientific Laboratory Report LA-UR-73-479, 1973.
10. Cockburn B., Shu C.-W., "The Runge-Kutta Discontinuous Galerkin Method for Conservation Laws V: Multidimensional Systems", *Journal of Computational Physics*, 141(2), 199-224, 1998.
11. Hesthaven J. S., Warburton T., *Nodal Discontinuous Galerkin Methods: Algorithms, Analysis, and Applications*, Springer, 2008.
12. Cockburn B., Karniadakis G. E., Shu C.-W. (eds.), *The Development of Discontinuous Galerkin Methods*, Springer, 2000.
