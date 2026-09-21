---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-flux-limiter-modeling
title: "通量限制器：离散原理与适用范围"
summary: "从总变差定义与 Godunov 定理出发，说明限制器为什么必须是非线性算子：给出 TVD 的充分条件、通量限制器形式、显式格式的 CFL 约束，并用一次手算对比中心差分与迎风的总变差变化。"
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
  - "通量限制器"
  - "离散原理与适用范围"
  - "总变差"
  - "Godunov 定理"
seo:
  title: "通量限制器：离散原理与适用范围"
  description: "从总变差定义与 Godunov 定理出发，说明限制器为什么必须是非线性算子：给出 TVD 的充分条件、通量限制器形式、显式格式的 CFL 约束，并用一次手算对比中心差分与迎风的总变差变化。"
  keywords:
    - "通量限制器"
    - "离散原理与适用范围"
    - "TVD"
    - "Godunov 定理"
---

# 通量限制器：离散原理与适用范围

限制器不是精度补丁，而是线性格式无法同时满足二阶精度与单调性这一结论的直接产物。理解这一点，才能判断某条 `div` 项该不该加限制器、加了之后能指望它解决什么。本文给出总变差的离散定义、Godunov 定理的表述、通量限制器的一般形式，并用一次四步手算说明中心差分怎样在一步内把总变差抬高 90 %。

## 总变差：把"不振荡"变成可测量的量

对一维网格上的离散解 $\phi_j$，定义总变差

$$TV(\phi^n)=\sum_{j}\left|\phi_{j+1}^{n}-\phi_{j}^{n}\right|$$

一个不产生新极值的格式应当满足

$$TV(\phi^{n+1})\le TV(\phi^{n})$$

满足该不等式的格式称为 TVD（Total Variation Diminishing）。这个定义的工程价值在于它是可测的：后处理脚本读入两个时刻的场，逐面求和即可得到两个数，比较大小就能判定格式是否振荡，不需要先知道解析解。

## Godunov 定理与非线性化的必然性

Godunov 定理指出：**保持单调性的线性格式最高只有一阶精度**。证明思路是，线性格式可以写成 $u_j^{n+1}=\sum_k c_k u_{j-k}^n$；单调性要求所有 $c_k\ge 0$，而二阶精度要求 $\sum_k k^2c_k=0$，两者不能同时成立。

结论是限制器必须是非线性的：它要根据局部解的形态改变自己的系数。这就是"通量限制器"这个名字的来源——限制的不是物理通量的大小，而是重构通量相对一阶与二阶通量的权重。

## 通量限制器的一般形式

把面通量写成一阶通量 $F_L$ 与二阶通量 $F_H$ 的加权组合：

$$F_{j+1/2}=F_L+\psi(r)\left(F_H-F_L\right)$$

其中 $r$ 是相邻梯度比。$\psi\equiv0$ 退化为迎风，$\psi\equiv1$ 退化为中心。要求格式 TVD，就要求 $\psi$ 落在 Sweby 带内 $0\le\psi(r)\le\min(2r,2)$。这个"一阶打底、二阶加修正"的结构是限制器在有限体积框架里唯一自然的落点：底通量保证有界，修正项恢复精度，限制器负责决定修正在哪里被削掉。

显式格式的 TVD 还需要 CFL 约束。对一维标量对流，充分条件是

$$\nu=\frac{u\Delta t}{\Delta x}\le 1$$

注意这是充分条件而非必要条件：限制器可以放宽某些格式的稳定域，但不能放宽到 $\nu>1$ 还能保持 TVD。

## 一次可核对的手算：TV 在一步后的变化

取温度阶跃作为被输运的标量：$\Delta x=2.0\times10^{-3}\ \mathrm{m}$ 的均匀网格，空气 $\rho=1.225\ \mathrm{kg/m^3}$，来流 $u=30\ \mathrm{m/s}$，取 $\nu=0.9$ 则

$$\Delta t=\frac{\nu\Delta x}{u}=\frac{0.9\times0.002}{30}=6.0\times10^{-5}\ \mathrm{s}$$

域长 $L=0.5\ \mathrm{m}$ 共 250 个单元，对流时间尺度 $L/u=1.67\times10^{-2}\ \mathrm{s}$，折合约 278 步。初始温度剖面在 $j=1\ldots6$ 上为 $[300,300,300,340,340,340]\ \mathrm{K}$，即阶跃 $\Delta T=40\ \mathrm{K}$，$TV=40\ \mathrm{K}$。

迎风格式 $\phi_j^{n+1}=\phi_j^n-\nu(\phi_j^n-\phi_{j-1}^n)$ 一步后得 $[300,300,300,304,340,340]\ \mathrm{K}$，$TV=4+36=40\ \mathrm{K}$，守恒且不增。

中心格式 $\phi_j^{n+1}=\phi_j^n-\tfrac{\nu}{2}(\phi_{j+1}^n-\phi_{j-1}^n)$ 一步后得 $[300,300,282,322,340,340]\ \mathrm{K}$，$TV=18+40+18=76\ \mathrm{K}$，比初始值高 90 %，并且出现了 282 K 的过冲——低于冷端 300 K。这两个数字就是限制器要消除的对象。

## 适用范围与失效信号

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

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 阶跃解在极值处被削平 | TVD 格式在 $\phi'=0$ 处强制降阶 | 把同一剖面做 4 次网格加密，若极值误差按一阶收敛即确认 |
| 密度有界但压力出现负值 | 分量式限制器不能保证方程组的物理可容许性 | 同时输出密度、压力极值，若只有压力越界则需换成特征变量限制 |
| $\nu=1.2$ 时限制器完全失效 | 显式 TVD 的 CFL 充分条件被破坏 | 固定限制器，把 $\nu$ 从 1.2 降到 0.9，观察 TV 是否恢复不增 |
| 二维斜向波前沿比法向波更陡 | 逐面一维判据引入方向偏差 | 把波前旋转 45° 重跑，比较前沿厚度是否随方向改变 |
| 换成 superbee 后 TV 不增但剖面呈阶梯 | 压缩性把圆滑过渡挤压成分段常数 | 计算剖面的二阶差分极值，若在光滑区出现符号交替即为压缩伪影 |

## 参考文献

1. Godunov S.K., *A difference method for numerical calculation of discontinuous solutions of the equations of hydrodynamics*, Matematicheskii Sbornik, 47(3):271–306, 1959.
2. Toro E.F., *Riemann Solvers and Numerical Methods for Fluid Dynamics*, 3rd ed., Springer, 2009.
3. LeVeque R.J., *Finite Volume Methods for Hyperbolic Problems*, Cambridge University Press, 2002.
4. Hirsch C., *Numerical Computation of Internal and External Flows, Volume 2*, Wiley, 1990.
