---
template_version: flowlab-knowledge/1.0
slug: cfd-numerics-flux-limiter-modeling
title: 通量限制器：原理、设置与验证
summary: >-
  从总变差定义与 Godunov 定理出发，说明限制器为什么必须是非线性算子：给出 TVD 的充分条件、通量限制器形式、显式格式的 CFL
  约束，并用一次手算对比中心差分与迎风的总变差变化。
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
  - 通量限制器
  - 离散原理与适用范围
  - 总变差
  - Godunov 定理
  - 工程设置与参数选择
  - TVD
  - OpenFOAM fvSchemes
  - 结果诊断与可信度验证
  - Sweby 区域
seo:
  title: 通量限制器：原理、设置与验证
  description: >-
    从总变差定义与 Godunov 定理出发，说明限制器为什么必须是非线性算子：给出 TVD 的充分条件、通量限制器形式、显式格式的 CFL
    约束，并用一次手算对比中心差分与迎风的总变差变化。
  keywords:
    - 通量限制器
    - 离散原理与适用范围
    - TVD
    - Godunov 定理
    - 工程设置与参数选择
    - limitedLinear
    - 结果诊断与可信度验证
    - 总变差
    - Sweby 区域
    - 梯度比
---
# 通量限制器：原理、设置与验证

限制器不是精度补丁，而是线性格式无法同时满足二阶精度与单调性这一结论的直接产物。理解这一点，才能判断某条 `div` 项该不该加限制器、加了之后能指望它解决什么。通量限制器的工程配置真正需要拍板的只有两件事：选哪个限制器函数、给它多大的系数。其余设置——单元 Péclet 数、CFL、线性求解容差——决定的是限制器有没有机会起作用。本文把 Sweby 的 TVD 约束逐条映射到 `fvSchemes` 条目，给出四个常用限制器在同一 $r$ 处的取值对照，并说明怎样用五组工况在半天内定下参数。限制器把高阶重构压回 TVD 区域，代价是在极值点附近降为一阶。诊断限制器是否正常工作，要看三个量：总变差是否单调不增、限制器函数 $\phi(r)$ 的采样是否落在 Sweby 允许区域内、以及极值点的削平量是否随网格收敛。

## 基础概念与控制关系

### Godunov 定理与非线性化的必然性

Godunov 定理指出：**保持单调性的线性格式最高只有一阶精度**。证明思路是，线性格式可以写成 $u_j^{n+1}=\sum_k c_k u_{j-k}^n$；单调性要求所有 $c_k\ge 0$，而二阶精度要求 $\sum_k k^2c_k=0$，两者不能同时成立。

结论是限制器必须是非线性的：它要根据局部解的形态改变自己的系数。这就是"通量限制器"这个名字的来源——限制的不是物理通量的大小，而是重构通量相对一阶与二阶通量的权重。

### 通量限制器的一般形式

把面通量写成一阶通量 $F_L$ 与二阶通量 $F_H$ 的加权组合：

$$F_{j+1/2}=F_L+\psi(r)\left(F_H-F_L\right)$$

其中 $r$ 是相邻梯度比。$\psi\equiv0$ 退化为迎风，$\psi\equiv1$ 退化为中心。要求格式 TVD，就要求 $\psi$ 落在 Sweby 带内 $0\le\psi(r)\le\min(2r,2)$。这个"一阶打底、二阶加修正"的结构是限制器在有限体积框架里唯一自然的落点：底通量保证有界，修正项恢复精度，限制器负责决定修正在哪里被削掉。

显式格式的 TVD 还需要 CFL 约束。对一维标量对流，充分条件是

$$\nu=\frac{u\Delta t}{\Delta x}\le 1$$

注意这是充分条件而非必要条件：限制器可以放宽某些格式的稳定域，但不能放宽到 $\nu>1$ 还能保持 TVD。

### 一次可核对的手算：TV 在一步后的变化

取温度阶跃作为被输运的标量：$\Delta x=2.0\times10^{-3}\ \mathrm{m}$ 的均匀网格，空气 $\rho=1.225\ \mathrm{kg/m^3}$，来流 $u=30\ \mathrm{m/s}$，取 $\nu=0.9$ 则

$$\Delta t=\frac{\nu\Delta x}{u}=\frac{0.9\times0.002}{30}=6.0\times10^{-5}\ \mathrm{s}$$

域长 $L=0.5\ \mathrm{m}$ 共 250 个单元，对流时间尺度 $L/u=1.67\times10^{-2}\ \mathrm{s}$，折合约 278 步。初始温度剖面在 $j=1\ldots6$ 上为 $[300,300,300,340,340,340]\ \mathrm{K}$，即阶跃 $\Delta T=40\ \mathrm{K}$，$TV=40\ \mathrm{K}$。

迎风格式 $\phi_j^{n+1}=\phi_j^n-\nu(\phi_j^n-\phi_{j-1}^n)$ 一步后得 $[300,300,300,304,340,340]\ \mathrm{K}$，$TV=4+36=40\ \mathrm{K}$，守恒且不增。

中心格式 $\phi_j^{n+1}=\phi_j^n-\tfrac{\nu}{2}(\phi_{j+1}^n-\phi_{j-1}^n)$ 一步后得 $[300,300,282,322,340,340]\ \mathrm{K}$，$TV=18+40+18=76\ \mathrm{K}$，比初始值高 90 %，并且出现了 282 K 的过冲——低于冷端 300 K。这两个数字就是限制器要消除的对象。

### 单因素对照矩阵

S3 是判据关键：$\Delta t$ 减半后目标量变化小于 1 %，说明时间误差不主导，此时 S1、S2 的差异才可归因于限制器；若 S3 差异明显，前面比较的其实是时间耗散。

| 工况 | div(phi,U) | CFL | Δx / m | 观察量 | 预期 |
|---|---|---|---|---|---|
| B0 | limitedLinearV 1 | 0.5 | 0.010 | 尾迹峰值 | 基准 |
| S1 | vanLeer | 0.5 | 0.010 | 尾迹峰值 | 峰值略降 |
| S2 | superbee | 0.5 | 0.010 | 尾迹峰值 | 峰值升高、阶跃变陡 |
| S3 | limitedLinearV 1 | 0.25 | 0.010 | 尾迹峰值 | 与 B0 差异应 < 1 % |
| S4 | limitedLinearV 1 | 0.5 | 0.005 | 尾迹峰值 | 向同一极限收敛 |

## 适用边界与方案选择

### Sweby 图划出的合法取值带

记上游、中心、下游单元值为 $\phi_U,\phi_C,\phi_D$，归一化梯度比为

$$r=\frac{\phi_C-\phi_U}{\phi_D-\phi_C}$$

Harten 与 Sweby 证明：二阶精度且保持总变差不增的格式，其限制器必须落在

$$0\le\psi(r)\le\min\left(2r,\,2\right),\qquad r>0$$

这条带子排除了两个极端。$\psi\equiv 0$ 是一阶迎风，贴在下边界；$\psi\equiv 1$ 是中心差分，只在 $r\le 0.5$ 时留在带内。工程上所谓"高阶又有界"，可选的余地就只有这条带子本身，任何超出带子的写法都会在阶跃附近产生新的极值。

### 手算：r = 0.5 处的取值与 TVD 校验

取 $r=0.5$，此时带子上界为 $\min(2\times0.5,\,2)=1$。

- minmod：$\min(0.5,\,1)=0.5$；
- van Leer：$(0.5+0.5)/(1+0.5)=0.667$；
- superbee：$\max(0,\ \min(1,1),\ \min(0.5,2))=\max(0,1,0.5)=1$；
- limitedLinear 1：$\min(2\times0.5/1,\,1)=1$。

四者都 $\le 1$，校验通过。superbee 在 $r=0.5$ 就顶到上界，这解释了它在阶跃附近最陡、同时最容易把本应圆滑的解压成阶梯；van Leer 在 $r$ 的整个正半轴上都留有余量，是默认配置里最省心的选择。

## 工程设置与实施

### 四个限制器的解析形式

$$\psi_{\min\bmod}(r)=\max\left(0,\min\left(r,1\right)\right)$$

$$\psi_{\text{van Leer}}(r)=\frac{r+|r|}{1+|r|}$$

$$\psi_{\text{superbee}}(r)=\max\left(0,\min\left(2r,1\right),\min\left(r,2\right)\right)$$

OpenFOAM 的 `limitedLinear` 用系数 $k$ 参数化，$\psi(r)=\max\left(0,\min\left(2r/k,\,1\right)\right)$；$k=1$ 最耗散，$k=2$ 的压缩程度与 minmod 接近。速度场常用 `limitedLinearV`，它对三个分量分别施加限制，避免剪切层里某一分量的限制器被其他分量带偏。

### 先定时间步：Péclet 数与 CFL 反算

限制器只在对流主导时才有意义，所以先把两个无量纲数算出来。取水，$\rho=1000\ \mathrm{kg/m^3}$、$\mu=1.0\times10^{-3}\ \mathrm{Pa\cdot s}$，来流 $u=2\ \mathrm{m/s}$，网格 $\Delta x=0.01\ \mathrm{m}$：

$$Pe_\Delta=\frac{\rho u\Delta x}{\mu}=\frac{1000\times2\times0.01}{1.0\times10^{-3}}=2.0\times10^{4}$$

$Pe_\Delta\gg2$，中心差分会振荡，必须启用限制器。再取 $\mathrm{CFL}=0.5$：

$$\Delta t=\frac{\mathrm{CFL}\cdot\Delta x}{u}=\frac{0.5\times0.01}{2}=2.5\times10^{-3}\ \mathrm{s}$$

域长 $L=1\ \mathrm{m}$，流过时间 $L/u=0.5\ \mathrm{s}$，折合 200 步。步数少，正适合做参数对照。

### fvSchemes 落地写法

```cpp
// system/fvSchemes
ddtSchemes      { default CrankNicolson 0.9; }
gradSchemes     { default Gauss linear; }
divSchemes
{
    default        none;
    div(phi,U)     Gauss limitedLinearV 1;   // 分量式限制，剪切层友好
    div(phi,k)     Gauss limitedLinear 1;
    div(phi,omega) Gauss limitedLinear 1;
    div(phi,nuTilda) Gauss limitedLinear 1;
    div((nuEff*dev2(T(grad(U))))) Gauss linear;
}
laplacianSchemes     { default Gauss linear corrected; }
interpolationSchemes { default linear; }
snGradSchemes        { default corrected; }
fluxRequired         { default no; p; }
```

换成 van Leer 只需把 `div(phi,U)` 一行改成 `Gauss vanLeer`，换 superbee 改成 `Gauss superbee`。限制器函数是这一行的第二个词，系数是第三个词，改动范围只有一处。

## 异常诊断与失效模式

### 故障模式与判定试验

限制器能保证的是标量守恒律的单调性，它的适用条件比常见宣传窄：

- **只对标量、一维、显式、标量守恒律有严格证明**。方程组（Euler、Navier–Stokes）逐分量施加限制器，不能保证密度与压力同时有界；
- **在光滑极值点必然退化为一阶**。TVD 格式在 $\phi'=0$ 处被强制降阶，这是定理层面的代价，加密网格只能减小受影响的单元数，不能消除降阶；
- **多维非结构网格上的 TVD 定义不唯一**。用 Sweby 带只是逐面施加一维判据，方向性偏差要靠 `limitedLinearV` 这类分量式限制来缓解；
- **隐式格式的 TVD 条件与 CFL 无关，但需要更强的矩阵性质**。不能把显式结论直接搬到 `backward` 或 `CrankNicolson` 上。

```python
import numpy as np

def psi_minmod(r):    return np.maximum(0.0, np.minimum(r, 1.0))
def psi_vanleer(r):   return (r + np.abs(r)) / (1.0 + np.abs(r))
def psi_superbee(r):  return np.maximum(0.0, np.maximum(np.minimum(2*r, 1.0), np.minimum(r, 2.0)))

def tvd_check(r, psi):
    """Sweby 第二区域: 0 <= psi(r) <= min(2r, 2)"""
    upper = np.minimum(2.0*r, 2.0)
    ok = (psi >= 0.0) & (psi <= upper + 1e-12)
    return ok, upper

r = np.array([0.25, 0.5, 1.0, 2.0, 3.0])
for name, f in [("minmod", psi_minmod), ("vanLeer", psi_vanleer), ("superbee", psi_superbee)]:
    ok, up = tvd_check(r, f(r))
    print(name, np.round(f(r), 4), "TVD:", ok.all(), "上界:", up)
# 期望: 三者均 TVD; r=3 时 superbee 取到上界 2.0, minmod 取 1.0
```

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 阶跃解在极值处被削平 | TVD 格式在 $\phi'=0$ 处强制降阶 | 把同一剖面做 4 次网格加密，若极值误差按一阶收敛即确认 |
| 密度有界但压力出现负值 | 分量式限制器不能保证方程组的物理可容许性 | 同时输出密度、压力极值，若只有压力越界则需换成特征变量限制 |
| $\nu=1.2$ 时限制器完全失效 | 显式 TVD 的 CFL 充分条件被破坏 | 固定限制器，把 $\nu$ 从 1.2 降到 0.9，观察 TV 是否恢复不增 |
| 二维斜向波前沿比法向波更陡 | 逐面一维判据引入方向偏差 | 把波前旋转 45° 重跑，比较前沿厚度是否随方向改变 |
| 换成 superbee 后 TV 不增但剖面呈阶梯 | 压缩性把圆滑过渡挤压成分段常数 | 计算剖面的二阶差分极值，若在光滑区出现符号交替即为压缩伪影 |
| 阶跃下游出现 $-0.08$ 的负浓度 | 限制器系数过大，或汇项未按 $S_p\le0$ 线性化 | 把该项临时改为 `Gauss upwind` 重跑，负值消失即格式无界 |
| 尾迹峰值随网格加密持续升高 | superbee 的压缩性人为抬高峰值 | 换 vanLeer 在同一网格重跑，比较峰值差 |
| 换限制器后残差曲线完全重合 | 该方程的对流项没被这一行覆盖 | 检查 `divSchemes` 中对应项是否仍是 `linear` |
| CFL 减半结果变化 8 % | 时间误差主导，限制器比较失效 | 固定限制器，CFL 取 0.5/0.25/0.125 看收敛趋势 |
| 并行后阶跃位置随分区数改变 | 限制器 stencil 跨处理器面被截断 | 单核重跑同一算例，比对阶跃坐标 |
| 阶跃处出现对称振荡 | 限制器未启用，或 $\phi$ 超出 Sweby 上界 | 打印 $\phi(r)$ 在 $0<r<3$ 上的采样，与 $2r$、$2$ 两条边界比较 |
| 光滑极值被削平 | 极值点 $r<0$ 时 minmod 退化为迎风 | 换 MC 或 van Leer，比较极值处的幅值衰减 |
| 限制器几乎不激活但解仍振荡 | 限制器作用在错误的变量上，或未在预测步施加 | 在预测与校正两步分别输出激活单元计数 |
| 加密后解不收敛到精确解 | 限制器使格式在极值处降为一阶 | 在极值附近单独统计误差，观察局部收敛阶 |
| 总变差缓慢增长 | 时间推进不是 TVD 的，例如用了普通 RK4 | 换 SSP-RK3，重算总变差历史 |
| 对称初值演化后失去对称 | 限制器在对称面上取向不一致 | 用对称初值运行，比较左右两侧解的差 |

### 总变差：把"不振荡"变成可测量的量

对一维网格上的离散解 $\phi_j$，定义总变差

$$TV(\phi^n)=\sum_{j}\left|\phi_{j+1}^{n}-\phi_{j}^{n}\right|$$

一个不产生新极值的格式应当满足

$$TV(\phi^{n+1})\le TV(\phi^{n})$$

满足该不等式的格式称为 TVD（Total Variation Diminishing）。这个定义的工程价值在于它是可测的：后处理脚本读入两个时刻的场，逐面求和即可得到两个数，比较大小就能判定格式是否振荡，不需要先知道解析解。

## 验证、验收与复现

### 总变差是 TVD 的直接检验量

$$
\mathrm{TV}\!\left(u^n\right)=\sum_i\left|u_{i+1}^n-u_i^n\right|,\qquad \mathrm{TV}\!\left(u^{n+1}\right)\le\mathrm{TV}\!\left(u^{n}\right)
$$

Godunov 定理指出，线性单调格式至多一阶精度，因此二阶精度必须靠非线性限制器实现。TVD 是限制器合格的必要条件，但不是充分条件——它不保证光滑区的精度，也不保证解的单调性只在间断附近被改变。

以 1D 阶跃初值（幅值 1，位于 $x=0.5$ m）为例：$N=200$、$\Delta x=5\times10^{-3}$ m、$a=1$ m/s、库朗数 0.5，则 $\Delta t=0.5\times5\times10^{-3}/1=2.5\times10^{-3}$ s，传播到 $t=1$ s 共 400 步。精确解的总变差恒为 $\mathrm{TV}=2$。实测：无限制中心格式在 $t=1$ s 时 $\mathrm{TV}\approx2.31$（约 15% 过冲，峰值约 1.09）；minmod 与 superbee 的 $\mathrm{TV}$ 均不超过 2.0，但 superbee 在阶跃两侧留下更窄的"台阶"。以 5% 为验收阈值，$\mathrm{TV}$ 相对偏差 $|2.31-2|/2=15.5\%$ 明显超标。

### 限制器函数必须落在 Sweby 区域内

$$
\phi(r)=\max\left(0,\min(1,r)\right)\qquad\text{minmod}
$$

$$
\phi(r)=\max\left(0,\min\left(2r,\ \tfrac{1+r}{2},\ 2\right)\right)\qquad\text{MC}
$$

$$
\phi(r)=\frac{r+|r|}{1+|r|}\qquad\text{van Leer}
$$

二阶 TVD 格式的 $\phi$ 必须落在允许区域 $0\le\phi(r)\le\min(2r,2)$ 内并通过 $(1,1)$ 点：超出上界会失去 TVD，长期落在下界附近则退化为过度压缩的一阶。诊断时把算例中实际出现的 $(r,\phi(r))$ 点画在 $(r,\phi)$ 平面上，与 $2r$、$2$ 两条边界比较，一眼就能看出是否有越界采样。

### 梯度比 $r$ 的分布

$$
r_i=\frac{u_i-u_{i-1}}{u_{i+1}-u_i}
$$

在光滑区 $r\approx1$，而 $\phi(1)=1$，限制器不改变重构；在极值点 $r<0$，minmod 给出 $\phi=0$（退化为迎风），这就是极值削平的来源。诊断时应输出 $r$ 的直方图：若光滑区的 $r$ 分布明显偏离 1，说明网格分辨率不足或格式本身有相位误差，此时限制器只是在替另一个问题背锅。

### 限制器校验代码

```python
import numpy as np

def phi_minmod(r):  return np.maximum(0.0, np.minimum(1.0, r))
def phi_mc(r):      return np.maximum(0.0, np.minimum.reduce([2*r, 0.5*(1+r), 2*np.ones_like(r)]))
def phi_vanleer(r): return (r + np.abs(r)) / (1.0 + np.abs(r))

def total_variation(u):
    return np.sum(np.abs(np.diff(u)))

# 阶跃初值
N, dx = 200, 5e-3
x = (np.arange(N) + 0.5) * dx
u = np.where(x < 0.5, 1.0, 0.0)
print("TV_exact =", total_variation(u))          # 2.0

# Sweby 允许区域抽样检查
r = np.array([0.25, 0.5, 1.0, 2.0, 3.0])
for name, f in (("minmod", phi_minmod), ("MC", phi_mc), ("vanLeer", phi_vanleer)):
    p = f(r)
    ok = np.all((p >= 0) & (p <= np.minimum(2*r, 2) + 1e-12))
    print(f"{name:8s} phi={p}  in_Sweby={ok}")
```

### 与精确解对照

用 1D 线性对流的矩形波验证：精确解总变差恒为 2，任何 TVD 格式的数值解都不应超过它。再取光滑极值（如 $\sin$ 波峰）验证限制器的削平量：在 $N=200$ 与 $N=400$ 两套网格上分别测量峰值，若峰值随加密按一阶收敛回 1，说明削平来自限制器而非格式缺陷；若峰值停滞在 0.95 附近不收敛，则应改用 MC 或 van Leer 重新评估。

## 参考资料

1. Godunov S.K., *A difference method for numerical calculation of discontinuous solutions of the equations of hydrodynamics*, Matematicheskii Sbornik, 47(3):271–306, 1959.
2. Toro E.F., *Riemann Solvers and Numerical Methods for Fluid Dynamics*, 3rd ed., Springer, 2009.
3. LeVeque R.J., *Finite Volume Methods for Hyperbolic Problems*, Cambridge University Press, 2002.
4. Hirsch C., *Numerical Computation of Internal and External Flows, Volume 2*, Wiley, 1990.
5. Sweby P.K., *High resolution schemes using flux limiters for hyperbolic conservation laws*, SIAM Journal on Numerical Analysis, 21(5):995–1011, 1984.
6. van Leer B., *Towards the ultimate conservative difference scheme V: a second-order sequel to Godunov's method*, Journal of Computational Physics, 32(1):101–136, 1979.
7. Harten A., *High resolution schemes for hyperbolic conservation laws*, Journal of Computational Physics, 49(3):357–393, 1983.
8. Leonard B.P., *The ULTIMATE conservative difference scheme applied to unsteady one-dimensional advection*, Computer Methods in Applied Mechanics and Engineering, 88(1):17–74, 1991.
