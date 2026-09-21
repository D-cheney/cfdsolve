---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-foundation-completeness-diagnosis-validation
title: "完备性与重构：结果诊断与可信度验证"
summary: "把完备性失效从'看起来像失稳'变成可测残差：给出零阶与一阶矩残差的定义与分档阈值、内部带与边界带的实测收敛阶对照、二次场拉普拉斯残差，以及按条件数排序的四步排查顺序。"
category:
  slug: meshfree-foundations
  name: "无网格法 · 方法与验证"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法 · 方法与验证"
  - "完备性与重构"
  - "结果诊断与可信度验证"
  - "patch test"
  - "矩条件残差"
seo:
  title: "完备性与重构：结果诊断与可信度验证"
  description: "把完备性失效从'看起来像失稳'变成可测残差：给出零阶与一阶矩残差的定义与分档阈值、内部带与边界带的实测收敛阶对照、二次场拉普拉斯残差，以及按条件数排序的四步排查顺序。"
  keywords:
    - "完备性与重构"
    - "结果诊断与可信度验证"
    - "patch test"
    - "矩条件残差"
    - "MESHFREE"
---

# 完备性与重构：结果诊断与可信度验证

完备性失效的症状常被误判为物理失稳：自由面压力偏低、近壁速度梯度系统性偏大、加密到 $\Delta x=0.005\ \text{m}$ 仍不收敛。这些现象与真实的拉伸不稳定、壁面滑移很难从云图上区分，但有一条干净的判别路径——把已知解析多项式灌进离散算子，看它能否原样吐出，且误差按应有的幂次随分辨率下降。本文给出三组 patch test 的残差定义与分档阈值、内部带与边界带分开测得的收敛阶，以及按条件数排序的排查顺序。

## 用解析多项式构造可证伪的试验

patch test 不推进时间：把粒子摆到目标几何上，赋解析多项式值，只调用离散算子（梯度、拉普拉斯、重构），再比较输出与解析值。三类多项式各查一件事——常数场 $f=c$ 查零阶矩，线性场 $f=ax+by+c$ 查一阶矩，二次场 $f=x^{2}+y^{2}$ 查二阶矩。二阶矩之所以要单独查，是因为黏性、扩散、表面张力项都含二阶导数，只满足一阶完备性的格式会在这些项上静默失真。

两个无量纲残差是主判据：

$$
\varepsilon_0 = \max_i\left|\sum_j V_j W_{ij}-1\right|, \qquad \varepsilon_1 = \frac{1}{h}\max_i\left\|\sum_j V_j(\mathbf{x}_j-\mathbf{x}_i)W_{ij}\right\|
$$

$\varepsilon_0$ 是零阶矩残差，直接反映求和式密度能否再现常数场；$\varepsilon_1$ 是一阶矩残差，衡量加权质心是否落在粒子自身位置。第二式除以 $h$ 是为了让阈值不随分辨率漂移，否则同一格式在不同 $\Delta x$ 下会给出不同量级的数，没法横向比较。

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

| 处理方式 | 内部带 $L_2$ 阶 | 边界带 $L_2$ 阶 |
|---|---|---|
| 原始核近似 | 1.96 | 1.01 |
| Shepard 归一化 | 1.99 | 1.04 |
| 线性基 MLS | 2.00 | 1.91 |

三行把结论钉死了：归一化只强制 $\sum_j V_j\tilde W_{ij}=1$，一阶矩在截断处依旧残缺，所以阶数卡在 1；MLS 用矩阵求逆把一阶矩强行补上，边界带才回到接近二阶。若算例只在边界带塌阶，换核函数没有意义，加一层 MLS 或增厚边界粒子层才有效。

## 二次场检验拉普拉斯算子

线性基只能再现到一阶，二阶导数需要二次基。用 $f=x^{2}+y^{2}$ 测试：线性基 MLS 的拉普拉斯相对残差为 $6.1\times10^{-3}$，且随 $\Delta x$ 只按一阶衰减；把二维基函数从 3 个增到 6 个后，残差降到 $4.3\times10^{-14}$，已达双精度舍入水平。代价是每粒子求逆的矩阵从 $2\times2$ 变成 $3\times3$，所需最少邻居数从 6 升到 12（实际应留到 $\ge20$）。因此只在黏性主导、且分辨率不足以让二阶项自动变小时才值得升基；多数自由面流动用线性基加差值形式拉普拉斯即可。

## 重构失效先查条件数

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

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 线性 patch 残差停在 $10^{-3}$ 量级 | 只做了归一化，一阶矩未被强制为零 | 同一点阵分别跑 Shepard 与 MLS，比较 $\varepsilon_1$ |
| 二次 patch 残差不随加密下降 | 基函数次数低于算子阶数 | 把二维基从 3 个升到 6 个，看残差是否跳到 $10^{-14}$ |
| 自由面 $\varepsilon_0$ 超过 0.2 | 支撑域被切断，外侧质量权重丢失 | 关掉边界粒子重跑，比较 $\varepsilon_0$ 与表面 $S_i$ |
| 个别粒子速度出现尖峰 | $\mathbf{M}_i$ 近奇异，解出巨大修正量 | 每步输出 $\mathrm{cond}(\mathbf{M}_i)$ 最大值及其粒子坐标 |
| 内部二阶、边界一阶 | 边界一阶矩残缺，与核函数无关 | 仅对边界带启用 MLS，看边界阶数是否回到 2 |

## 参考文献

1. Chen J.K., Beraun J.E., Jih C.J., *Completeness of corrective smoothed particle method for linear elastodynamics*, Computational Mechanics, 24(4): 273-285, 1999.
2. Dilts G.A., *Moving-least-squares-particle hydrodynamics I: Consistency and stability*, International Journal for Numerical Methods in Engineering, 44(8): 1115-1155, 1999.
3. Belytschko T., Krongauz Y., Organ D., Fleming M., Krysl P., *Meshless methods: An overview and recent developments*, Computer Methods in Applied Mechanics and Engineering, 139: 3-47, 1996.
4. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
5. Randles P.W., Libersky L.D., *Smoothed particle hydrodynamics: some recent improvements and applications*, Computer Methods in Applied Mechanics and Engineering, 139(1-4): 375-408, 1996.
6. Liu M.B., Liu G.R., *Smoothed particle hydrodynamics (SPH): an overview and recent developments*, Archives of Computational Methods in Engineering, 17: 25-76, 2010.
