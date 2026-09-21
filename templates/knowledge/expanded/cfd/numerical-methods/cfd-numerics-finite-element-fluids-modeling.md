---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-finite-element-fluids-modeling
title: "流体有限元：离散原理与适用范围"
summary: "把不可压 Navier-Stokes 写成混合变分问题，说明压力作为拉格朗日乘子如何产生鞍点结构、LBB 约束与先验误差阶数，并界定有限元在粘性主导与纯对流问题上的取舍。"
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
  - "流体有限元"
  - "离散原理与适用范围"
  - "混合变分"
  - "鞍点系统"
seo:
  title: "流体有限元：离散原理与适用范围"
  description: "把不可压 Navier-Stokes 写成混合变分问题，说明压力作为拉格朗日乘子如何产生鞍点结构、LBB 约束与先验误差阶数，并界定有限元在粘性主导与纯对流问题上的取舍。"
  keywords:
    - "流体有限元"
    - "离散原理与适用范围"
    - "混合变分"
    - "鞍点系统"
    - "先验误差估计"
---

# 流体有限元：离散原理与适用范围

流体有限元把不可压 Navier-Stokes 写成混合变分问题，速度和压力作为独立未知量同时求解，由此得到鞍点型线性系统。本文说明弱形式的构造、LBB 约束的由来、误差估计的阶数，以及为什么它在粘性主导问题上有优势、在纯对流问题上有代价。

## 一、混合弱形式

把动量方程乘速度检验函数、连续性方程乘压力检验函数并在域上积分：

$$
\int_\Omega\rho\,\partial_t\mathbf u_h\cdot\mathbf v_h\,d\Omega+\int_\Omega\rho\left(\mathbf u_h\cdot\nabla\right)\mathbf u_h\cdot\mathbf v_h\,d\Omega-\int_\Omega p_h\,\nabla\cdot\mathbf v_h\,d\Omega+\int_\Omega2\mu\,\boldsymbol\varepsilon(\mathbf u_h):\boldsymbol\varepsilon(\mathbf v_h)\,d\Omega=\int_\Omega\mathbf f\cdot\mathbf v_h\,d\Omega
$$

$$
\int_\Omega q_h\,\nabla\cdot\mathbf u_h\,d\Omega=0,\qquad \forall q_h\in Q_h
$$

压力在这里不由状态方程给出，而是作为拉格朗日乘子强制不可压约束。这解释了它的两个特征：压力只在弱意义下确定到相差一个常数（所以必须固定参考点），以及压力空间不能任意取（否则乘子条件退化）。

## 二、鞍点系统与其求解含义

混合离散后得到分块方程组

$$
\begin{bmatrix}A & B^{\mathsf T}\\ B & 0\end{bmatrix}\begin{bmatrix}\mathbf u\\ p\end{bmatrix}=\begin{bmatrix}\mathbf f\\ \mathbf 0\end{bmatrix}
$$

$A$ 含粘性与对流，无对流时对称正定；零块使整个矩阵不定，因此共轭梯度失效，需要 GMRES、MINRES 或分块预条件。压力块的预条件常用 Schur 补 $S=BA^{-1}B^{\mathsf T}$ 的近似，例如 $S\approx B\,\mathrm{diag}(A)^{-1}B^{\mathsf T}$，这是各类分块预条件求解器的共同起点。

## 三、先验误差估计与阶数匹配

在 LBB 条件与适当正则性下，存在与网格无关的常数 $C$ 使

$$
\lVert\mathbf u-\mathbf u_h\rVert_1+\lVert p-p_h\rVert_0\le C h^{k}\left(\lVert\mathbf u\rVert_{k+1}+\lVert p\rVert_{k}\right)
$$

$Q_2$–$Q_1$ 中速度取 $k=2$、压力取 $k=1$，于是 $H^1$ 速度误差 $O(h^2)$、$L^2$ 速度误差 $O(h^3)$、$L^2$ 压力误差 $O(h^2)$。注意压力误差的阶数受压力空间限制：只加密速度空间而不升压力空间，压力精度不会改善，这是"升阶后压力误差不变"的结构性原因。

自由度统计可以直接核对鞍点系统的规模，也解释了为什么压力块虽然小却是预条件的难点：

```python
def dof_q2q1(nx, ny):
    """Taylor-Hood Q2-Q1 的自由度统计。"""
    vel = 2 * (2 * nx + 1) * (2 * ny + 1)   # 双二次速度节点 x 2 个分量
    pre = (nx + 1) * (ny + 1)               # 双线性压力节点
    return vel, pre, vel + pre

for n in (64, 128, 256):
    v, p, t = dof_q2q1(n, n)
    print(f"{n:>3}x{n:<3} 速度={v:>8d}  压力={p:>7d}  合计={t:>8d}  压力占比={p/t:.1%}")
#  64x64   速度=   33282  压力=   4225  合计=   37507  压力占比=11.3%
# 128x128  速度=  132098  压力=  16641  合计=  148739  压力占比=11.2%
# 256x256  速度=  526338  压力=  66049  合计=  592387  压力占比=11.2%
```

## 四、适用范围与代价权衡

适合：低到中等 Reynolds 数的粘性流、流固耦合、非牛顿与广义牛顿流体、以及需要与结构有限元共用网格的共轭传热。有限元对复杂几何的适应性来自非结构网格上的形函数，不需要像有限体积那样单独处理非正交修正。

不适合：纯对流且不加稳定化的高速流（中心 Galerkin 无耗散，必然振荡）、要求严格逐点无散的场合（需 H(div) 单元或投影）、以及超大规模显式瞬态（连续有限元的矩阵带宽代价高于有限体积）。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 升阶速度空间后压力误差不变 | 压力空间阶数未同步提高 | 同时升阶速度与压力，比较两者收敛阶 |
| 对流主导算例出现全局振荡 | 中心 Galerkin 无耗散，$Pe_h>1$ | 关闭对流项重算，看振荡是否消失 |
| 迭代次数随 Reynolds 数爆炸 | 对流项使 $A$ 非对称，Schur 补近似失效 | 用直接求解同一系统，比较迭代次数 |
| 压力解相差一个常数 | 混合形式中压力只确定到常数 | 固定一个压力参考点后重新比较 |
| 长时积分动能缓慢增长 | 对流项用非保守形式，未做斜对称拆分 | 改用斜对称拆分，检查总动能变化率 |
| 质量守恒但动量不守恒 | 弱形式中未对对流项做守恒化处理 | 用均匀流初值运行，检查动量残差是否为零 |

## 五、参考资料

1. Fortin M., "An Analysis of the Convergence of Mixed Finite Element Methods", *RAIRO Analyse Numerique*, 11(3), 341-354, 1977.
2. Hughes T. J. R., Franca L. P., Balestra M., "A New Finite Element Formulation for Computational Fluid Dynamics: V. Circumventing the Babuska-Brezzi Condition", *Computer Methods in Applied Mechanics and Engineering*, 59(1), 85-99, 1986.
3. Codina R., "Comparison of Some Finite Element Methods for Solving the Diffusion-Convection-Reaction Equation", *Computer Methods in Applied Mechanics and Engineering*, 156(1-4), 185-210, 1998.
4. Bochev P. B., Gunzburger M. D., *Least-Squares Finite Element Methods*, Springer, 2009.
