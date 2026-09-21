---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-finite-element-fluids-engineering-setup
title: "流体有限元：工程设置与参数选择"
summary: "流体有限元的四个决定项是单元对、稳定化参数、时间推进与线性求解器；本文给出单元对对照表、由物性与网格反算 SUPG 时间的公式与代码，以及可直接复用的参数表。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "流体有限元"
  - "工程设置与参数选择"
  - "SUPG 稳定化"
  - "Taylor-Hood 单元"
seo:
  title: "流体有限元：工程设置与参数选择"
  description: "流体有限元的四个决定项是单元对、稳定化参数、时间推进与线性求解器；本文给出单元对对照表、由物性与网格反算 SUPG 时间的公式与代码，以及可直接复用的参数表。"
  keywords:
    - "流体有限元"
    - "工程设置与参数选择"
    - "SUPG 稳定化"
    - "Taylor-Hood 单元"
    - "鞍点系统"
---

# 流体有限元：工程设置与参数选择

流体有限元配置的四个决定项是单元对（速度/压力空间）、稳定化参数、时间推进格式与线性求解器。本文给出每一项的取值公式、单元 Péclet 的换算，以及一段由物性与网格反算稳定化参数的代码。

## 一、单元对的选择

| 单元对 | 速度/压力阶 | LBB | 适用场景 |
|---|---|---|---|
| $Q_1$–$Q_1$ | 1 / 1 | 不满足 | 必须配压力稳定化，不推荐 |
| $Q_2$–$Q_1$ | 2 / 1 | 满足 | 通用首选，精度与成本平衡 |
| $Q_2$–$P_{-1}$ | 2 / 单元常数 | 满足 | 省压力自由度，适合大网格 |
| $P_2$–$P_1$ | 2 / 1 | 满足 | 三角形/四面体网格 |

$Q_2$–$Q_1$ 每单元含 9 个速度节点（乘 2 个分量）与 4 个压力节点。$128\times128$ 网格上，速度自由度约 $2\times257^2=1.32\times10^5$，压力自由度 $129^2=1.66\times10^4$，合计约 $1.49\times10^5$。压力自由度约为速度的 1/8，这是 $Q_2$–$Q_1$ 在鞍点求解中相对便宜的原因。

## 二、稳定化参数按单元 Péclet 反算

对流主导时需要在弱形式中加入流线迎风项。其核心是单元 Péclet 数与内禀时间：

$$
Pe_e=\frac{|\mathbf u_e|\,h_e}{2\nu},\qquad \tau_e=\frac{h_e}{2|\mathbf u_e|}\left(\coth Pe_e-\frac{1}{Pe_e}\right)
$$

取 $|\mathbf u_e|=1$ m/s、$h_e=0.01$ m、$\nu=1\times10^{-3}$ m²/s：$Pe_e=5$，$\coth 5=1.0001$，于是 $\tau_e=\frac{0.01}{2}\times(1.0001-0.2)=4.00\times10^{-3}$ s。当 $Pe_e\to0$（扩散主导）时 $\coth Pe_e-1/Pe_e\to Pe_e/3$，$\tau_e\to h_e^2/(12\nu)$，稳定化自动退化，不会污染扩散主导区——这是该公式比常数 $\tau$ 更可取的原因。

## 三、时间推进与线性求解

混合离散给出的方程中，压力块的对角为零，直接消元会得到压力 Schur 补系统：

$$
\left(B A^{-1} B^{\mathsf T}\right)p=B A^{-1}\mathbf f,\qquad A\mathbf u=\mathbf f-B^{\mathsf T}p
$$

$A$ 含粘性与对流，无对流时对称正定；$B$ 是散度算子矩阵。工程上不显式构造 $A^{-1}$，而是用 $A$ 的一次近似求解代替，这就是分块预条件求解器的做法。零对角块使整体矩阵不定，共轭梯度失效，需用 GMRES。显式或半隐式推进的步长由 $h_e$ 与最大速度决定：取库朗数 0.5、$h_e=0.01$ m、$|\mathbf u|=1$ m/s，得 $\Delta t=0.5\times0.01/1=5\times10^{-3}$ s。

## 四、一套可复用的参数表

| 项目 | 取值 | 依据 |
|---|---|---|
| 单元对 | $Q_2$–$Q_1$ | LBB 满足，压力自由度约为速度的 1/8 |
| 稳定化 | SUPG/PSPG，$\tau_e$ 按 $Pe_e$ 逐单元计算 | 扩散主导时自动退化为零 |
| 时间推进 | 半隐式，库朗数 0.5 | $\Delta t=5\times10^{-3}$ s |
| 线性求解器 | GMRES + 块预条件 | 鞍点矩阵不定 |
| 压力容差 | 相对 $10^{-7}$ | 保证离散散度达 $10^{-8}$ |
| 速度容差 | 相对 $10^{-8}$ | 与压力容差匹配 |
| 时间步 $\Delta t$ | $5\times10^{-3}$ s | 由库朗数与最小单元尺度反算 |

## 五、稳定化参数脚本

```python
import numpy as np

def supg_tau(u, h, nu):
    """按单元 Péclet 数计算 SUPG 内禀时间。"""
    Pe = u * h / (2.0 * nu)
    if Pe < 1e-8:                      # 扩散主导极限
        return h * h / (12.0 * nu)
    return h / (2.0 * u) * (1.0 / np.tanh(Pe) - 1.0 / Pe)

nu, u = 1e-3, 1.0
for h in (0.02, 0.01, 0.005):
    Pe = u * h / (2 * nu)
    print(f"h={h:.3f} m  Pe={Pe:5.1f}  tau={supg_tau(u,h,nu):.3e} s")
# h=0.020 m  Pe= 10.0  tau=9.00e-03 s
# h=0.010 m  Pe=  5.0  tau=4.00e-03 s
# h=0.005 m  Pe=  2.5  tau=1.53e-03 s
```

注意 $\tau$ 随 $h$ 近似线性下降，而单元数按 $h^{-d}$ 增长，所以加密网格时稳定化总量会缓慢增加，这是正常的。

## 六、症状、根因与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力出现棋盘振荡 | 选用了等阶单元且未加压力稳定化 | 换 $Q_2$–$Q_1$ 重算，看棋盘是否消失 |
| 出口附近速度过冲 | $\tau_e$ 未按 $Pe_e$ 调整，稳定化不足 | 逐单元打印 $Pe_e$ 与 $\tau_e$，检查是否随 $h$ 更新 |
| 扩散主导算例出现虚假过冲 | 稳定化用了与 $h$ 无关的常数 $\tau$ | 换用 $\coth$ 形式并检查 $Pe_e<1$ 区域的 $\tau$ 是否趋零 |
| GMRES 迭代次数随网格暴涨 | 块预条件未包含压力 Schur 补近似 | 用直接求解同一系统，比较迭代次数与耗时 |
| 时间步减半后解明显变化 | 库朗数过高，或时间格式仅一阶 | 用一阶与二阶时间格式分别计算，比较差异 |
| 质量不守恒 | 对流项用非保守形式 | 改用斜对称拆分，检查总动能变化率 |

## 七、文献与来源

1. Brooks A. N., Hughes T. J. R., "Streamline Upwind/Petrov-Galerkin Formulations for Convection Dominated Flows with Particular Emphasis on the Incompressible Navier-Stokes Equations", *Computer Methods in Applied Mechanics and Engineering*, 32(1-3), 199-259, 1982.
2. Taylor C., Hood P., "A Numerical Solution of the Navier-Stokes Equations Using the Finite Element Technique", *Computers & Fluids*, 1(1), 73-100, 1973.
3. Franca L. P., Frey S. L., Hughes T. J. R., "Stabilized Finite Element Methods: I. Application to the Advective-Diffusive Model", *Computer Methods in Applied Mechanics and Engineering*, 95(2), 253-276, 1992.
4. Zienkiewicz O. C., Taylor R. L., Nithiarasu P., *The Finite Element Method for Fluid Dynamics*, 7th ed., Butterworth-Heinemann, 2014.
