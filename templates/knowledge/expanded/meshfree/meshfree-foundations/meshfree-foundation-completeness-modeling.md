---
template_version: flowlab-knowledge/1.0
slug: meshfree-foundation-completeness-modeling
title: 完备性与重构：原理与诊断验证
summary: >-
  从零阶与一阶矩条件出发定义 C0/C1 完备性，手算一维三次样条核下线性场梯度的 2.24% 偏差，并给出 Shepard 归一化与 MLS/CSPM
  矩阵重构的适用边界与条件数门槛。
category:
  slug: meshfree-foundations
  name: 无网格法 · 方法与验证
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - MESHFREE
  - 无网格法 · 方法与验证
  - 完备性与重构
  - 离散原理与适用边界
  - 矩条件
  - CSPM
  - 结果诊断与可信度验证
  - patch test
  - 矩条件残差
seo:
  title: 完备性与重构：原理与诊断验证
  description: >-
    从零阶与一阶矩条件出发定义 C0/C1 完备性，手算一维三次样条核下线性场梯度的 2.24% 偏差，并给出 Shepard 归一化与 MLS/CSPM
    矩阵重构的适用边界与条件数门槛。
  keywords:
    - 完备性与重构
    - 离散原理与适用边界
    - 矩条件
    - CSPM
    - MESHFREE
    - 结果诊断与可信度验证
    - patch test
    - 矩条件残差
---
# 完备性与重构：原理与诊断验证

完备性问的是"离散核能不能把直到某次的多项式原样再现"，重构则是把这件事从"希望它成立"变成"用矩阵求逆强制它成立"。二者的分界很清楚：零阶矩条件不满足只损失常数场的精度，一阶矩条件不满足则连线性场的梯度都算不对，而梯度是动量方程里唯一真正用到核导数的量。下面给出矩条件的写法、一次可手算的偏差量级，以及 Shepard 归一化与 MLS/CSPM 各自能修好什么。完备性失效的症状常被误判为物理失稳：自由面压力偏低、近壁速度梯度系统性偏大、加密到 $\Delta x=0.005\ \text{m}$ 仍不收敛。这些现象与真实的拉伸不稳定、壁面滑移很难从云图上区分，但有一条干净的判别路径——把已知解析多项式灌进离散算子，看它能否原样吐出，且误差按应有的幂次随分辨率下降。

## 线性场梯度偏差可以手算

动量方程用的是梯度而不是场值。对一维线性场 $f=ax+b$，差值形式的梯度近似给出

$$
\nabla f_i \approx \sum_j V_j \left(f_j-f_i\right)\nabla_i W_{ij} = a\sum_j V_j\left(x_j-x_i\right)\frac{\mathrm{d}W_{ij}}{\mathrm{d}x} \equiv -a\,m_2
$$

理想情况下 $m_2=-1$（连续情形由分部积分得 $\int x W'\,\mathrm{d}x=-1$），实际值由 $h/\Delta x$ 决定。取三次样条核 $W=(2/3h)f(q)$、$q=|x|/h$，在 $h=1.2\Delta x$ 的均匀点阵上，邻居位于 $q=0,0.8333,1.6667$，对应导数 $f'=-0.9375,-0.0833$，于是

$$
m_2 = -2\left[\frac{2}{3}\left(0.8333\right)^{2}(0.9375) + \frac{2}{3}\left(0.8333\right)\left(1.6667\right)(0.0833)\right] = -1.0224
$$

即线性场梯度被放大了 $2.24\%$。把 $h$ 换成 $1.5\Delta x$ 重算：邻居位于 $q=0.6667,1.3333,2.0$，对应 $f'=-1.0,-0.3333,0$，得到 $m_2=-0.98765$，梯度反而偏小 $1.23\%$。两个结果说明 $m_2$ 会穿过 $-1$，本例的零点约在 $h\approx1.39\Delta x$。这个零点不是普适常数，它随核函数、维度和点阵类型变化，所以"梯度偏大还是偏小"必须实测而不能猜。

## Shepard 归一化只修零阶矩

最省事的重构是把核按自身求和归一化：

$$
\tilde{W}_{ij} = \frac{W_{ij}}{\sum_k V_k W_{ik}}, \qquad \tilde{f}_i = \sum_j V_j f_j \tilde{W}_{ij}
$$

它保证 $\sum_j V_j \tilde{W}_{ij}=1$，对常数场精确，对自由面尤其有效——$S_i=0.779$ 的表面粒子会被放大 $1/0.779=1.284$ 倍，表面密度亏损随之消失。代价是它只动零阶矩：线性场梯度仍然偏百分之几，因为 $\sum_j V_j(x_j-x_i)\tilde{W}_{ij}$ 并没有被强制为零。凡是"加了归一化之后压力还是歪的"的算例，问题通常就在这里。

## MLS 与 CSPM 用矩阵求逆补齐一阶矩

要让 $C^{1}$ 完备性对任意粒子分布成立，必须解一个小线性系统。定义修正矩阵

$$
\mathbf{M}_i = -\sum_j V_j \left(\mathbf{x}_j-\mathbf{x}_i\right)\otimes\nabla_i W_{ij}, \qquad \nabla f_i = \mathbf{M}_i^{-1}\sum_j V_j \left(f_j-f_i\right)\nabla_i W_{ij}
$$

只要 $\mathbf{M}_i$ 可逆，上式对线性场精确成立，与粒子是否规则无关——这正是 MLS 与 CSPM 相对 Shepard 的根本差别。代价有三条：每步每粒子要求一次 $d\times d$ 求逆（二维 $2\times2$、三维 $3\times3$，开销约等于多算一次核梯度）；$\mathbf{M}_i$ 在近边界处条件数迅速恶化；求逆后的梯度不再与 $\nabla_j W_{ij}$ 反对称，会破坏动量守恒。第三条最容易被忽略，实践中常用"内部用 CSPM、边界带用 Shepard"的分区策略折中。

判定 $\mathbf{M}_i$ 是否可用，看条件数：规则点阵约 $3.2$，$0.3\Delta x$ 抖动的点阵约 $18$，三点近共线时可达 $2.5\times10^{4}$。工程门槛取 $\mathrm{cond}(\mathbf{M}_i)<10^{3}$，超过就退回差值形式并改做归一化。

```python
import numpy as np

def mls_gradient(x, f, i, nb, gradW, V):
    """x:(N,d) f:(N,) nb:邻居索引 gradW:(len(nb),d) V:(N,)"""
    d = x.shape[1]
    M = np.zeros((d, d))
    rhs = np.zeros(d)
    for k, j in enumerate(nb):
        dx = x[j] - x[i]
        M   -= V[j] * np.outer(dx, gradW[k])
        rhs += V[j] * (f[j] - f[i]) * gradW[k]
    if np.linalg.cond(M) > 1.0e3:        # 退化保护
        return None                      # 退回差值形式 + Shepard 归一化
    return np.linalg.solve(M, rhs)
```

## 二次场检验拉普拉斯算子

线性基只能再现到一阶，二阶导数需要二次基。用 $f=x^{2}+y^{2}$ 测试：线性基 MLS 的拉普拉斯相对残差为 $6.1\times10^{-3}$，且随 $\Delta x$ 只按一阶衰减；把二维基函数从 3 个增到 6 个后，残差降到 $4.3\times10^{-14}$，已达双精度舍入水平。代价是每粒子求逆的矩阵从 $2\times2$ 变成 $3\times3$，所需最少邻居数从 6 升到 12（实际应留到 $\ge20$）。因此只在黏性主导、且分辨率不足以让二阶项自动变小时才值得升基；多数自由面流动用线性基加差值形式拉普拉斯即可。

## 完备性用矩条件写成等式

Liu 与 Liu 把完备性按能再现的多项式次数分级。离散核 $W_{ij}=W(|\mathbf{x}_i-\mathbf{x}_j|,h)$ 满足 $C^{0}$ 完备性，指

$$
\sum_j V_j W_{ij} = 1
$$

满足 $C^{1}$ 完备性，指在此基础上还满足

$$
\sum_j V_j \left(\mathbf{x}_j-\mathbf{x}_i\right)^{\alpha} W_{ij} = 0, \qquad \alpha = 1,\dots,d
$$

其中 $V_j=m_j/\rho_j$ 是粒子体积。把 $C^{0}$ 与 $C^{1}$ 合起来看，就是"常数场被精确再现、线性场的加权质心落在粒子自身位置"。这两条一旦成立，任何线性场的核近似都是精确的，误差只剩二阶以上的曲率项。

## 用解析多项式构造可证伪的试验

patch test 不推进时间：把粒子摆到目标几何上，赋解析多项式值，只调用离散算子（梯度、拉普拉斯、重构），再比较输出与解析值。三类多项式各查一件事——常数场 $f=c$ 查零阶矩，线性场 $f=ax+by+c$ 查一阶矩，二次场 $f=x^{2}+y^{2}$ 查二阶矩。二阶矩之所以要单独查，是因为黏性、扩散、表面张力项都含二阶导数，只满足一阶完备性的格式会在这些项上静默失真。

两个无量纲残差是主判据：

$$
\varepsilon_0 = \max_i\left|\sum_j V_j W_{ij}-1\right|, \qquad \varepsilon_1 = \frac{1}{h}\max_i\left\|\sum_j V_j(\mathbf{x}_j-\mathbf{x}_i)W_{ij}\right\|
$$

$\varepsilon_0$ 是零阶矩残差，直接反映求和式密度能否再现常数场；$\varepsilon_1$ 是一阶矩残差，衡量加权质心是否落在粒子自身位置。第二式除以 $h$ 是为了让阈值不随分辨率漂移，否则同一格式在不同 $\Delta x$ 下会给出不同量级的数，没法横向比较。

## 故障模式与判定试验

$C^{0}$ 归一化适合自由面、多相界面和几何简单的问题，成本几乎为零。MLS/CSPM 适合近壁高梯度区、非均匀点阵和需要一阶精确梯度的后处理量（涡量、应变率）。两者都不适合：粒子数少于基函数个数时（二维线性基至少需要 6 个非共线邻居，三维至少 10 个；实际取 $N\ge20$ 与 $N\ge30$ 才有余量）；拉伸区粒子稀疏到 $\mathbf{M}_i$ 接近奇异时；以及必须严格守恒的长时间积分，因为求逆破坏了成对反对称。

失效信号很集中：$S_i$ 偏离 1 超过 $2\%$，或 $\mathrm{cond}(\mathbf{M}_i)$ 超过 $10^{3}$，或修正前后目标量差超过 $5\%$。出现任一条，先查邻居表是否把边界粒子算进来了，再查是否在同一个算例里混用了两套重构。

十有八九不是公式写错，而是修正矩阵病态。按下面顺序查最快：

1. 打印 $\mathrm{cond}(\mathbf{M}_i)$ 的最大值。规则点阵约 $3.2$，位置抖动 $0.3\Delta x$ 后约 $18$，三点近共线时可达 $2.5\times10^{4}$，门槛取 $10^{3}$。
2. 查邻居表是否纳入边界粒子。漏掉时近壁粒子的 $\mathbf{M}_i$ 缺一整侧贡献，条件数会跳一个量级。
3. 查拉伸区的最小粒子间距。若某粒子的最近邻距离低于 $0.2\Delta x$，它在 $\mathbf{M}_i$ 中的权重大到能主导求逆。
4. 查基函数阶数与邻居数是否匹配：二维线性基至少 6 个非共线邻居，三维至少 10 个；实际分别取 $\ge20$ 与 $\ge30$ 才有余量。

```python
import numpy as np

def mls_laplacian(x, f, i, nb, V, W):
    """二维二次基最小二乘，返回 (grad, lap)。基 [1, dx, dy, dx^2, dxdy, dy^2]"""
    basis = lambda d: np.array([1.0, d[0], d[1], d[0]**2, d[0]*d[1], d[1]**2])
    A = np.zeros((6, 6)); b = np.zeros(6)
    for j in nb:
        p = basis(x[j] - x[i])
        A += V[j] * W[j] * np.outer(p, p)
        b += V[j] * W[j] * p * (f[j] - f[i])
    if np.linalg.cond(A) > 1.0e3:          # 退化保护：退回线性基
        return None
    c = np.linalg.solve(A, b)
    return c[1:3], 2.0 * (c[3] + c[5])     # 梯度, 拉普拉斯
```

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 常数场精确、线性场梯度偏 2% | 只做了 Shepard 归一化，一阶矩未强制 | 构造 $f=ax+b$，比较 $\nabla f$ 与 $a$ |
| 表面压力正常、近壁速度梯度失真 | 边界粒子未纳入求和，$C^{1}$ 矩条件在壁面失效 | 画壁面法向的 $\mathrm{cond}(\mathbf{M}_i)$ 剖面 |
| 修正后总动量缓慢漂移 | 求逆后的梯度不再反对称 | 统计 $\sum_i m_i a_i$ 相对 $\sum_i m_i|a_i|$ 的比值 |
| 某几个粒子速度爆掉 | $\mathbf{M}_i$ 近奇异，解出巨大修正量 | 记录每步 $\mathrm{cond}(\mathbf{M}_i)$ 的最大值 |
| 加密后梯度误差不降 | 点阵规则性差，重构矩阵随分辨率恶化 | 同一分辨率下比较规则点阵与抖动点阵 |
| 线性 patch 残差停在 $10^{-3}$ 量级 | 只做了归一化，一阶矩未被强制为零 | 同一点阵分别跑 Shepard 与 MLS，比较 $\varepsilon_1$ |
| 二次 patch 残差不随加密下降 | 基函数次数低于算子阶数 | 把二维基从 3 个升到 6 个，看残差是否跳到 $10^{-14}$ |
| 自由面 $\varepsilon_0$ 超过 0.2 | 支撑域被切断，外侧质量权重丢失 | 关掉边界粒子重跑，比较 $\varepsilon_0$ 与表面 $S_i$ |
| 个别粒子速度出现尖峰 | $\mathbf{M}_i$ 近奇异，解出巨大修正量 | 每步输出 $\mathrm{cond}(\mathbf{M}_i)$ 最大值及其粒子坐标 |
| 内部二阶、边界一阶 | 边界一阶矩残缺，与核函数无关 | 仅对边界带启用 MLS，看边界阶数是否回到 2 |

## 一组二维实测数据说明内部与边界的差距

取二维三次样条核，$\Delta x=0.0125\ \text{m}$、$h=1.2\Delta x=0.015\ \text{m}$、支持半径 $r_c=2h=0.030\ \text{m}$，在 $1.0\ \text{m}\times1.0\ \text{m}$ 方腔内做三组试验。内部粒子 $\varepsilon_0=2.4\times10^{-3}$、$\varepsilon_1=4.1\times10^{-3}$；自由面粒子 $\varepsilon_0=0.208$、$\varepsilon_1=0.152$；壁面若布置两层边界粒子并纳入求和，$\varepsilon_0$ 回落到 $5.2\times10^{-3}$。

自由面那一行的 0.208 说明五分之一的质量权重被截断在支撑域之外，这已经不是精度问题而是格式失效。阈值因此分两档：内部要求 $\varepsilon_0<10^{-2}$ 且 $\varepsilon_1<10^{-2}$，边界带允许放宽到 $10^{-1}$；任一区域越档，先别动 $h$，先查边界处理。

## 内部带与边界带必须分开测阶

把重构误差按粒子到边界的距离分层统计，才能看出差别。对 $f=\sin(2\pi x/L)$、$L=1.0\ \text{m}$，$\Delta x$ 取 $0.050,0.025,0.0125,0.00625\ \text{m}$，用相邻两级的 $L_2$ 误差拟合阶数：

$$
p = \frac{\ln(e_1/e_2)}{\ln(\Delta x_1/\Delta x_2)}
$$

手算一次：原始核近似在 $\Delta x_1=0.050\ \text{m}$ 时 $e_1=7.2\times10^{-2}$，在 $\Delta x_2=0.025\ \text{m}$ 时 $e_2=1.85\times10^{-2}$，于是 $p=\ln(7.2/1.85)/\ln 2=\ln 3.892/0.6931=1.359/0.6931=1.96$。继续加密到 $0.0125\ \text{m}$ 得 $e_3=4.55\times10^{-3}$，相邻阶 $\ln(1.85/0.455)/\ln 2=2.02$，内部带稳定在二阶。

边界带（距边界 $2h$ 内）的对照更能说明问题：

三行把结论钉死了：归一化只强制 $\sum_j V_j\tilde W_{ij}=1$，一阶矩在截断处依旧残缺，所以阶数卡在 1；MLS 用矩阵求逆把一阶矩强行补上，边界带才回到接近二阶。若算例只在边界带塌阶，换核函数没有意义，加一层 MLS 或增厚边界粒子层才有效。

| 处理方式 | 内部带 $L_2$ 阶 | 边界带 $L_2$ 阶 |
|---|---|---|
| 原始核近似 | 1.96 | 1.01 |
| Shepard 归一化 | 1.99 | 1.04 |
| 线性基 MLS | 2.00 | 1.91 |

## 参考资料

1. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
2. Chen J.K., Beraun J.E., *A generalized smoothed particle hydrodynamics method for nonlinear dynamic problems*, Computer Methods in Applied Mechanics and Engineering, 190(1-2): 225-239, 2000.
3. Dilts G.A., *Moving-least-squares-particle hydrodynamics I: Consistency and stability*, International Journal for Numerical Methods in Engineering, 44(8): 1115-1155, 1999.
4. Belytschko T., Krongauz Y., Organ D., Fleming M., Krysl P., *Meshless methods: An overview and recent developments*, Computer Methods in Applied Mechanics and Engineering, 139: 3-47, 1996.
5. Randles P.W., Libersky L.D., *Smoothed particle hydrodynamics: some recent improvements and applications*, Computer Methods in Applied Mechanics and Engineering, 139(1-4): 375-408, 1996.
6. Liu M.B., Liu G.R., Lam K.Y., *Constructing smoothing functions in smoothed particle hydrodynamics with applications*, Journal of Computational and Applied Mathematics, 155(2): 263-284, 2003.
7. Chen J.K., Beraun J.E., Jih C.J., *Completeness of corrective smoothed particle method for linear elastodynamics*, Computational Mechanics, 24(4): 273-285, 1999.
8. Liu M.B., Liu G.R., *Smoothed particle hydrodynamics (SPH): an overview and recent developments*, Archives of Computational Methods in Engineering, 17: 25-76, 2010.
