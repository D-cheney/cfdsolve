---
template_version: flowlab-knowledge/1.0
slug: cfd-numerics-gradient-reconstruction-modeling
title: 梯度重构：原理、设置与验证
summary: >-
  从散度定理推出 Gauss–Green 梯度对线性场的精确性，再把最小二乘写成加权投影问题，推导非均匀网格上的截断误差公式，并用一次手算说明 2:1
  网格间距比怎样带来 50 % 的梯度误差。
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
  - 梯度重构
  - 离散原理与适用范围
  - 散度定理
  - 截断误差
  - 工程设置与参数选择
  - 非正交修正
  - snGradSchemes
  - 结果诊断与可信度验证
  - 最小二乘梯度
  - 网格非正交
seo:
  title: 梯度重构：原理、设置与验证
  description: >-
    从散度定理推出 Gauss–Green 梯度对线性场的精确性，再把最小二乘写成加权投影问题，推导非均匀网格上的截断误差公式，并用一次手算说明 2:1
    网格间距比怎样带来 50 % 的梯度误差。
  keywords:
    - 梯度重构
    - 离散原理与适用范围
    - 散度定理
    - 线性保持
    - 工程设置与参数选择
    - 非正交修正
    - cellLimited
    - 结果诊断与可信度验证
    - 最小二乘梯度
    - 收敛阶
---
# 梯度重构：原理、设置与验证

梯度重构的两种主流做法——Gauss–Green 与最小二乘——不是可以互换的偏好选项，它们的精度性质由完全不同的机制决定。Gauss–Green 的精度来自散度定理对线性场的精确性，最小二乘的精度来自加权投影对支撑域几何的要求。理解这两条机制，才能判断在给定网格上哪一种会先失效。梯度重构的配置只分布在三个地方：`gradSchemes` 决定单元梯度怎么算，`snGradSchemes` 决定面法向梯度怎么算，`nNonOrthogonalCorrectors` 决定非正交修正迭代几次。三者的取值都由网格质量指标——最大非正交角与最大歪斜度——唯一确定。梯度重构出错时的表现往往不是发散，而是收敛得很好、结果却系统性偏离。这类误差靠残差曲线看不出来，必须用与解析解无关的独立检验来暴露。

## 最小二乘：一个加权投影问题

把梯度估计写成最小化问题：求 $\mathbf{g}$ 使

$$J(\mathbf{g})=\sum_{N}w_N\left[\phi_N-\phi_P-\mathbf{g}\cdot\mathbf{d}_{PN}\right]^{2}$$

最小。令 $\partial J/\partial\mathbf{g}=0$ 得到法方程，解为

$$\mathbf{g}=\left(\sum_{N}w_N\mathbf{d}_{PN}\mathbf{d}_{PN}^{\mathsf{T}}\right)^{-1}\sum_{N}w_N\mathbf{d}_{PN}\left(\phi_N-\phi_P\right)$$

$3\times3$ 矩阵 $\mathbf{M}=\sum_N w_N\mathbf{d}_{PN}\mathbf{d}_{PN}^{\mathsf{T}}$ 可逆的条件是邻居方向张成三维空间，因此三维最少需要 4 个不共面的邻居，二维需要 3 个不共线邻居。四面体网格每个单元恰好 4 个面，最小二乘恰好适定；六面体网格有 6 个邻居，属于超定，对畸变的鲁棒性更好——这是最小二乘在歪斜网格上优于 Gauss–Green 的原因。

权重常取 $w_N=1/\left|\mathbf{d}_{PN}\right|^{2}$，使远近距离的邻居贡献均衡。若权重全取 1，长宽比大的单元会由远端邻居主导，条件数按长宽比的平方恶化。

## Gauss–Green：散度定理给出的精确性

对控制体 $V_P$ 与标量场 $\phi$，散度定理给出

$$\int_{V_P}\nabla\phi\,dV=\oint_{\partial V_P}\phi\,\mathbf{n}\,dS$$

取单元平均梯度近似左边，得到

$$\nabla\phi_P=\frac{1}{V_P}\sum_{f}\phi_f\mathbf{A}_f+\mathcal{O}\left(\Delta x\right)$$

关键性质是：当 $\phi$ 为线性场时，$\phi_f$ 用相邻单元中心值线性插值得到的值恰好等于面上的真实值，求和严格等于 $\nabla\phi$，误差为零——**与网格是否畸变无关**。这就是线性保持（linearity preserving）性质，也是线性场补丁检验能够成立的根据。

代价在于面值 $\phi_f$。在非正交网格上，面中心并不位于两单元中心的连线上，线性插值引入的是 $\mathcal{O}(\Delta x)$ 量级的偏差，且偏差随非正交角的正切增长。Gauss–Green 的精度完全押在网格正交性上。

## 适用边界

- **间断附近**：两种格式都在间断两侧取邻居，重构梯度会被污染，必须配合 `cellLimited` 或改用保单调重构；
- **强各向异性单元**：长宽比超过 $10^3$ 时，最小二乘法方程的 $3\times3$ 矩阵条件数达到 $10^6$ 量级，双精度下的有效位不足 10 位；
- **边界单元**：支撑域只剩一半，一维截断误差公式中的 $h_+-h_-$ 无法通过网格均匀化消除，只能降阶处理；
- **无网格与粒子法**：邻居集合随粒子运动变化，法方程需要每步重新装配并求逆，代价随邻居数三次方增长。

## 三处配置的取值规则

`cellLimited Gauss linear 1` 的作用是把重构梯度按单元内极值裁剪：

$$\mathbf{g}=\min\left(1,\ \frac{\phi_{\max}-\phi_P}{\mathbf{g}_0\cdot\Delta\mathbf{x}_{\max}}\right)\mathbf{g}_0$$

系数取 1 表示完全限制，取 0.5 表示只削掉一半超限量。限制会牺牲光滑区的精度，只在梯度会进入对流项且需要保证有界时才开。

| 网格指标 | gradSchemes | snGradSchemes | nNonOrthogonalCorrectors |
|---|---|---|---|
| 最大非正交角 < 20° | `Gauss linear` | `orthogonal` | 0 |
| 20° ～ 60° | `Gauss linear` | `corrected` | 1 |
| 60° ～ 70° | `cellLimited Gauss linear 1` | `corrected` | 2 |
| > 70° | `leastSquares` + `cellLimited` | `limited 0.5` | 3 或重建网格 |
| 存在长宽比 > 100 | `leastSquares` | `corrected` | 2 |

## 完整配置片段

```cpp
// system/fvSchemes
gradSchemes
{
    default         cellLimited Gauss linear 1;
    grad(U)         cellLimited Gauss linear 1;
    grad(p)         Gauss linear;
}
snGradSchemes
{
    default         corrected;
    snGrad(p)       limited 0.5;      // 压力面法向梯度更敏感
}
laplacianSchemes { default Gauss linear corrected; }
interpolationSchemes { default linear; }

// system/fvSolution
solvers
{
    p
    {
        solver          GAMG;
        tolerance       1e-7;
        relTol          0.01;
        smoother        GaussSeidel;
    }
    U
    {
        solver          smoothSolver;
        smoother        symGaussSeidel;
        tolerance       1e-8;
        relTol          0.1;
    }
}
SIMPLE
{
    nNonOrthogonalCorrectors 2;
    residualControl { p 1e-4; U 1e-5; }
}
```

`nNonOrthogonalCorrectors` 每增加一次，非正交修正的残差大约下降一个量级。若最大非正交角为 $65^\circ$、初始修正残差 $3\times10^{-3}$，取 2 次后可降到 $3\times10^{-5}$，低于压力方程容差 $10^{-7}$ 的上游影响已经可忽略；取 3 次收益递减，只增加约 30 % 的每步耗时。

## 实现骨架

```python
import numpy as np

def gauss_green(vol, faces):
    """faces: list of (A_vec[m^2], phi_f)"""
    g = np.zeros(3)
    for A_f, phi_f in faces:
        g += phi_f * A_f
    return g / vol

def least_squares(dPN, dphi, w):
    """dPN: (N,3) m; dphi: (N,) ; w: (N,) 权重"""
    M = np.einsum('n,ni,nj->ij', w, dPN, dPN)   # 3x3
    b = np.einsum('n,ni,n->i', w, dPN, dphi)
    return np.linalg.solve(M, b)

# 线性场补丁: phi = 3x + 2y + 1, 期望 g = (3, 2, 0)
rng = np.random.default_rng(0)
dPN = rng.normal(size=(6, 3)) * 1e-3           # 6 个邻居, 单位 m
dphi = dPN @ np.array([3.0, 2.0, 0.0])         # 精确线性场
w = 1.0 / np.sum(dPN**2, axis=1)               # 1/|d|^2
print(least_squares(dPN, dphi, w))             # 应为 [3. 2. 0.]
```

线性场补丁是唯一能在任意网格上给出机器精度结论的检验：最小二乘在线性场上必须精确，与权重取法无关，因为法方程本身就是线性场的精确投影。

## 非正交角决定了修正项的权重

把面法向单位矢量与单元中心连线单位矢量记为 $\mathbf{n}_f$ 与 $\mathbf{d}_{PN}$，非正交角定义为

$$\theta_f=\arccos\left(\mathbf{n}_f\cdot\hat{\mathbf{d}}_{PN}\right)$$

面面积矢量可以拆成沿中心连线的正交部分与剩余的正交修正部分：

$$\mathbf{A}_f=\underbrace{\left(\mathbf{A}_f\cdot\hat{\mathbf{d}}_{PN}\right)\hat{\mathbf{d}}_{PN}}_{\text{正交}}+\underbrace{\mathbf{k}_f}_{\text{修正}},\qquad \left|\mathbf{k}_f\right|=\left|\mathbf{A}_f\right|\tan\theta_f$$

手算一次：某内部面 $\left|\mathbf{A}_f\right|=1.0\times10^{-6}\ \mathrm{m^2}$，$\theta_f=25^\circ$，则 $\left|\mathbf{k}_f\right|=1.0\times10^{-6}\times0.4663=4.66\times10^{-7}\ \mathrm{m^2}$，占面矢量的 46.6 %。若最大非正交角达到 $70^\circ$，$\tan70^\circ=2.747$，修正项是正交项的 2.75 倍——此时 `uncorrected` 的误差与物理梯度同量级，绝不能用。

把量级放到一个具体算例上：风道入口 $u_\infty=20\ \mathrm{m/s}$，空气 $\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$，边界层厚度 $\delta=5.0\times10^{-3}\ \mathrm{m}$，首层高度 $y_1=2.5\times10^{-4}\ \mathrm{m}$，即 $y_1/\delta=0.05$。壁面速度梯度按 $u_\infty/\delta$ 估算为 $4.0\times10^{3}\ \mathrm{s^{-1}}$，落在首层上的速度差为 $20\times0.05=1.0\ \mathrm{m/s}$。这个梯度值由 $\delta$ 与 $u_\infty$ 唯一确定，可以作为壁面梯度重构的独立参照——重构结果偏离它超过 5 % 就说明边界处理有问题，而不是网格不够密。

## 四组单因素工况

G2 是必做的反证：它直接量化"省掉修正"的代价。若 G2 与 G0 只差 0.3 %，说明网格的非正交度本来就低，可以直接用 `orthogonal` 省掉这部分开销。

| 工况 | gradSchemes | snGradSchemes | nCorr | 观察量 | 判据 |
|---|---|---|---|---|---|
| G0 | Gauss linear | corrected | 2 | 阻力系数 | 基准 |
| G1 | leastSquares | corrected | 2 | 阻力系数 | 与 G0 差异 < 2 % 则 Gauss 足够 |
| G2 | Gauss linear | uncorrected | 2 | 阻力系数 | 差异 > 5 % 则非正交修正不可省 |
| G3 | cellLimited Gauss linear 1 | corrected | 2 | 阻力系数与最低压力 | 阻力变化 < 1 % 且最低压力不再越界才值得开 |

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 线性场补丁在畸变网格上误差 $10^{-4}$ | 面值插值不是线性保持的（用了距离倒数权重） | 换回线性插值重跑，误差应降到 $10^{-10}$ 以下 |
| 长宽比 500 的单元上梯度抖动 | 最小二乘法方程条件数过大 | 把权重从 1 改为 $1/\left|\mathbf{d}\right|^2$，抖动幅度应显著减小 |
| 二维算例中梯度在角点处发散 | 邻居共线，$2\times2$ 矩阵奇异 | 输出邻居方向的行列式，接近零即确认 |
| Gauss–Green 与最小二乘相差 15 % | 网格非正交角超过 60°，前者已丢阶 | 输出最大非正交角，若 > 60° 则以前者为不可信 |
| 加密网格后梯度误差停在 1 % 不动 | 误差来自网格间距比而非截断阶 | 计算相邻单元体积比，若 > 1.5 则先修网格 |
| `leastSquares` 下残差下降更慢 | 最小二乘的系数矩阵在高度歪斜单元上接近奇异 | 输出最小正交角，若 < 0.15 则改用 `cellLimited Gauss linear` |
| 加密网格后阻力不再单调收敛 | `nNonOrthogonalCorrectors` 随网格加密未同步提高 | 把该值从 2 提到 3 重跑，观察阻力是否恢复单调 |
| 开 `cellLimited` 后收敛变慢一倍 | 限制在光滑区被反复触发 | 统计被限制的单元占比，> 10 % 说明系数过严，改 `cellLimited Gauss linear 0.5` |
| 压力场在物面附近出现棋盘格 | 压力面法向梯度用 `corrected` 而非 `limited` | 把 `snGrad(p)` 改为 `limited 0.5` 重跑，棋盘格应消失 |
| 并行后交界面处梯度出现跳变 | 修正所需的邻居在分区边界被截断 | 减少分区数重跑，若跳变位置随之移动即确认 |
| 线性场补丁误差 $10^{-3}$ | 面面积矢量与体积不自洽 | 逐面重算 $\sum_f\mathbf{A}_f$，非零残差即定位到出错面 |
| 压力场出现 $2\Delta x$ 波长振荡 | 压力梯度与速度插值用了不同 stencil | 关闭压力方程，只看动量方程的梯度，振荡消失即确认 |
| 边界层内速度剖面偏厚 | 壁面法向梯度未降阶 | 用一阶单侧差分替换壁面梯度重跑，剖面变化 > 5 % 即确认 |
| 观测阶在 64→128 掉到 1.2 | 网格质量在细网格上恶化 | 输出最小正交角，若细网格更小则先修网格 |
| 同一算例单核与并行结果不同 | 并行面被排除在最小二乘支撑域外 | 单核重跑，比较边界单元梯度分量 |

## 诊断量一：线性场补丁上的精确性

Gauss–Green 梯度

$$\nabla\phi_P=\frac{1}{V_P}\sum_{f}\phi_f\mathbf{A}_f$$

对任意多面体上的**线性场**必须精确。取 $\phi=3x+2y+1$，则重构结果应逐分量等于 $(3,2,0)$，误差只来自浮点舍入。

这条检验的判别力在于它是网格无关的：畸变、歪斜、非正交都不影响结论。若某个单元上线性场补丁的误差超过 $10^{-10}$，问题一定在实现层面——面法向与面积矢量不匹配、面值插值用了非守恒权重、或者单元体积与面矢量不自洽。

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

## 诊断量二：光滑场的收敛阶

线性场检验只能查实现错误，查不出精度退化。用三次场 $\phi=x^3$ 在 $x=0.5\ \mathrm{m}$ 处做中心差分手算：网格 $\Delta x=0.01\ \mathrm{m}$ 时

$$\frac{(0.505)^3-(0.495)^3}{0.01}=\frac{0.1287876-0.1212874}{0.01}=0.750025$$

精确值 $3x^2=0.75$，误差 $2.5\times10^{-5}$。把 $\Delta x$ 加倍到 $0.02\ \mathrm{m}$：

$$\frac{(0.51)^3-(0.49)^3}{0.02}=\frac{0.132651-0.117649}{0.02}=0.7501$$

误差 $1.0\times10^{-4}$，恰为前一档的 4 倍。二阶收敛被复现，说明该单元的梯度算子没有丢阶。

最小二乘梯度

$$\mathbf{g}=\left(\sum_N w_N\mathbf{d}_{PN}\mathbf{d}_{PN}^{\mathsf{T}}\right)^{-1}\sum_N w_N\mathbf{d}_{PN}\left(\phi_N-\phi_P\right)$$

在正交均匀网格上与 Gauss 等价，但在畸变网格上权重 $w_N$ 的选取会改变结果。若把 $w_N=1$ 换成 $w_N=1/|\mathbf{d}_{PN}|^2$，收敛阶应从一阶提到二阶——这正是区分两种实现的最快试验。

## 非均匀网格上的截断误差

一维三点梯度是最小二乘在单方向上的特例。设中心点 $x_i$ 到左右邻居的距离分别为 $h_+$ 与 $h_-$，泰勒展开相减得

$$\frac{\phi_{i+1}-\phi_{i-1}}{h_++h_-}=\phi'_i+\frac{h_+-h_-}{2}\phi''_i+\mathcal{O}\left(h^2\right)$$

手算一次：取 $h_+=0.2\ \mathrm{m}$、$h_-=0.1\ \mathrm{m}$，$\phi=x^2$（$\phi''=2\ \mathrm{m^{-1}}$），中心点 $x_i=0.1\ \mathrm{m}$。真实梯度 $\phi'_i=2x_i=0.2\ \mathrm{m^{-1}}$。

$$\frac{0.3^2-0.0^2}{0.3}=\frac{0.09}{0.3}=0.30\ \mathrm{m^{-1}}$$

误差 $0.30-0.20=0.10\ \mathrm{m^{-1}}$，相对误差 50 %。公式预测的误差是 $\frac{h_+-h_-}{2}\phi''=\frac{0.1}{2}\times2=0.10\ \mathrm{m^{-1}}$，与实测完全一致。

结论很直接：网格间距比达到 2:1 时，梯度误差是 O(1) 量级，不是小量。任何依赖梯度的项（对流、扩散、湍流源项）都会继承这 50 % 的偏差。均匀化网格间距的收益远大于换梯度格式。

## 参考资料

1. Barth T.J., *Aspects of unstructured grids and finite-volume solvers for the Euler and Navier-Stokes equations*, VKI Lecture Series 1992-05, 1992.
2. Aftosmis M., Gaitonde D., Tavares T.S., *Behavior of linear reconstruction techniques on unstructured meshes*, AIAA Journal, 33(11):2038–2049, 1995.
3. Frink N.T., *Upwind scheme for solving the Euler equations on unstructured tetrahedral meshes*, AIAA Journal, 30(1):70–77, 1992.
4. Hyman J.M., Shashkov M., *Natural discretizations for the divergence, gradient, and curl on logically rectangular grids*, Computers & Mathematics with Applications, 33(4):81–104, 1997.
5. Barth T.J., Jespersen D.C., *The design and application of upwind schemes on unstructured meshes*, AIAA Paper 89-0366, 1989.
6. Crumpton P.I., Moinier P., Giles M.B., *An unstructured algorithm for high Reynolds number flows on highly stretched grids*, Numerical Methods for Laminar and Turbulent Flow, 1997.
7. OpenFOAM Foundation, *OpenFOAM User Guide*, sections on `gradSchemes` and `snGradSchemes`, 2023.
8. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics*, 2nd ed., Pearson, 2007.
9. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
10. Ferziger J.H., Perić M., *Computational Methods for Fluid Dynamics*, 3rd ed., Springer, 2002.
11. Mavriplis D.J., *Revisiting the least-squares procedure for gradient reconstruction on unstructured meshes*, AIAA Paper 2003-3986, 2003.
12. Moukalled F., Mangani L., Darwish M., *The Finite Volume Method in Computational Fluid Dynamics*, Springer, 2016.
