---
template_version: flowlab-knowledge/1.0
slug: cfd-numerics-finite-element-fluids-modeling
title: 流体有限元：原理、设置与验证
summary: >-
  把不可压 Navier-Stokes 写成混合变分问题，说明压力作为拉格朗日乘子如何产生鞍点结构、LBB
  约束与先验误差阶数，并界定有限元在粘性主导与纯对流问题上的取舍。
  全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
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
  - 流体有限元
  - 离散原理与适用范围
  - 混合变分
  - 鞍点系统
  - 工程设置与参数选择
  - SUPG 稳定化
  - Taylor-Hood 单元
  - 结果诊断与可信度验证
  - LBB 条件
  - 离散散度
seo:
  title: 流体有限元：原理、设置与验证
  description: >-
    把不可压 Navier-Stokes 写成混合变分问题，说明压力作为拉格朗日乘子如何产生鞍点结构、LBB
    约束与先验误差阶数，并界定有限元在粘性主导与纯对流问题上的取舍。
    全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 流体有限元
    - 离散原理与适用范围
    - 混合变分
    - 鞍点系统
    - 先验误差估计
    - 工程设置与参数选择
    - SUPG 稳定化
    - Taylor-Hood 单元
    - 结果诊断与可信度验证
    - LBB 条件
    - 离散散度
    - 单元 Péclet
---
# 流体有限元：原理、设置与验证

## 原理与适用范围

流体有限元把不可压 Navier-Stokes 写成混合变分问题，速度和压力作为独立未知量同时求解，由此得到鞍点型线性系统。本文说明弱形式的构造、LBB 约束的由来、误差估计的阶数，以及为什么它在粘性主导问题上有优势、在纯对流问题上有代价。

### 一、混合弱形式

把动量方程乘速度检验函数、连续性方程乘压力检验函数并在域上积分：

$$
\int_\Omega\rho\,\partial_t\mathbf u_h\cdot\mathbf v_h\,d\Omega+\int_\Omega\rho\left(\mathbf u_h\cdot\nabla\right)\mathbf u_h\cdot\mathbf v_h\,d\Omega-\int_\Omega p_h\,\nabla\cdot\mathbf v_h\,d\Omega+\int_\Omega2\mu\,\boldsymbol\varepsilon(\mathbf u_h):\boldsymbol\varepsilon(\mathbf v_h)\,d\Omega=\int_\Omega\mathbf f\cdot\mathbf v_h\,d\Omega
$$

$$
\int_\Omega q_h\,\nabla\cdot\mathbf u_h\,d\Omega=0,\qquad \forall q_h\in Q_h
$$

压力在这里不由状态方程给出，而是作为拉格朗日乘子强制不可压约束。这解释了它的两个特征：压力只在弱意义下确定到相差一个常数（所以必须固定参考点），以及压力空间不能任意取（否则乘子条件退化）。

### 二、鞍点系统与其求解含义

混合离散后得到分块方程组

$$
\begin{bmatrix}A & B^{\mathsf T}\\ B & 0\end{bmatrix}\begin{bmatrix}\mathbf u\\ p\end{bmatrix}=\begin{bmatrix}\mathbf f\\ \mathbf 0\end{bmatrix}
$$

$A$ 含粘性与对流，无对流时对称正定；零块使整个矩阵不定，因此共轭梯度失效，需要 GMRES、MINRES 或分块预条件。压力块的预条件常用 Schur 补 $S=BA^{-1}B^{\mathsf T}$ 的近似，例如 $S\approx B\,\mathrm{diag}(A)^{-1}B^{\mathsf T}$，这是各类分块预条件求解器的共同起点。

### 三、先验误差估计与阶数匹配

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

### 四、适用范围与代价权衡

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

### 五、参考资料

1. Fortin M., "An Analysis of the Convergence of Mixed Finite Element Methods", *RAIRO Analyse Numerique*, 11(3), 341-354, 1977.
2. Hughes T. J. R., Franca L. P., Balestra M., "A New Finite Element Formulation for Computational Fluid Dynamics: V. Circumventing the Babuska-Brezzi Condition", *Computer Methods in Applied Mechanics and Engineering*, 59(1), 85-99, 1986.
3. Codina R., "Comparison of Some Finite Element Methods for Solving the Diffusion-Convection-Reaction Equation", *Computer Methods in Applied Mechanics and Engineering*, 156(1-4), 185-210, 1998.
4. Bochev P. B., Gunzburger M. D., *Least-Squares Finite Element Methods*, Springer, 2009.

## 工程设置与参数选择

流体有限元配置的四个决定项是单元对（速度/压力空间）、稳定化参数、时间推进格式与线性求解器。本文给出每一项的取值公式、单元 Péclet 的换算，以及一段由物性与网格反算稳定化参数的代码。

### 一、单元对的选择

| 单元对 | 速度/压力阶 | LBB | 适用场景 |
|---|---|---|---|
| $Q_1$–$Q_1$ | 1 / 1 | 不满足 | 必须配压力稳定化，不推荐 |
| $Q_2$–$Q_1$ | 2 / 1 | 满足 | 通用首选，精度与成本平衡 |
| $Q_2$–$P_{-1}$ | 2 / 单元常数 | 满足 | 省压力自由度，适合大网格 |
| $P_2$–$P_1$ | 2 / 1 | 满足 | 三角形/四面体网格 |

$Q_2$–$Q_1$ 每单元含 9 个速度节点（乘 2 个分量）与 4 个压力节点。$128\times128$ 网格上，速度自由度约 $2\times257^2=1.32\times10^5$，压力自由度 $129^2=1.66\times10^4$，合计约 $1.49\times10^5$。压力自由度约为速度的 1/8，这是 $Q_2$–$Q_1$ 在鞍点求解中相对便宜的原因。

### 二、稳定化参数按单元 Péclet 反算

对流主导时需要在弱形式中加入流线迎风项。其核心是单元 Péclet 数与内禀时间：

$$
Pe_e=\frac{|\mathbf u_e|\,h_e}{2\nu},\qquad \tau_e=\frac{h_e}{2|\mathbf u_e|}\left(\coth Pe_e-\frac{1}{Pe_e}\right)
$$

取 $|\mathbf u_e|=1$ m/s、$h_e=0.01$ m、$\nu=1\times10^{-3}$ m²/s：$Pe_e=5$，$\coth 5=1.0001$，于是 $\tau_e=\frac{0.01}{2}\times(1.0001-0.2)=4.00\times10^{-3}$ s。当 $Pe_e\to0$（扩散主导）时 $\coth Pe_e-1/Pe_e\to Pe_e/3$，$\tau_e\to h_e^2/(12\nu)$，稳定化自动退化，不会污染扩散主导区——这是该公式比常数 $\tau$ 更可取的原因。

### 三、时间推进与线性求解

混合离散给出的方程中，压力块的对角为零，直接消元会得到压力 Schur 补系统：

$$
\left(B A^{-1} B^{\mathsf T}\right)p=B A^{-1}\mathbf f,\qquad A\mathbf u=\mathbf f-B^{\mathsf T}p
$$

$A$ 含粘性与对流，无对流时对称正定；$B$ 是散度算子矩阵。工程上不显式构造 $A^{-1}$，而是用 $A$ 的一次近似求解代替，这就是分块预条件求解器的做法。零对角块使整体矩阵不定，共轭梯度失效，需用 GMRES。显式或半隐式推进的步长由 $h_e$ 与最大速度决定：取库朗数 0.5、$h_e=0.01$ m、$|\mathbf u|=1$ m/s，得 $\Delta t=0.5\times0.01/1=5\times10^{-3}$ s。

### 四、一套可复用的参数表

| 项目 | 取值 | 依据 |
|---|---|---|
| 单元对 | $Q_2$–$Q_1$ | LBB 满足，压力自由度约为速度的 1/8 |
| 稳定化 | SUPG/PSPG，$\tau_e$ 按 $Pe_e$ 逐单元计算 | 扩散主导时自动退化为零 |
| 时间推进 | 半隐式，库朗数 0.5 | $\Delta t=5\times10^{-3}$ s |
| 线性求解器 | GMRES + 块预条件 | 鞍点矩阵不定 |
| 压力容差 | 相对 $10^{-7}$ | 保证离散散度达 $10^{-8}$ |
| 速度容差 | 相对 $10^{-8}$ | 与压力容差匹配 |
| 时间步 $\Delta t$ | $5\times10^{-3}$ s | 由库朗数与最小单元尺度反算 |

### 五、稳定化参数脚本

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

### 六、症状、根因与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力出现棋盘振荡 | 选用了等阶单元且未加压力稳定化 | 换 $Q_2$–$Q_1$ 重算，看棋盘是否消失 |
| 出口附近速度过冲 | $\tau_e$ 未按 $Pe_e$ 调整，稳定化不足 | 逐单元打印 $Pe_e$ 与 $\tau_e$，检查是否随 $h$ 更新 |
| 扩散主导算例出现虚假过冲 | 稳定化用了与 $h$ 无关的常数 $\tau$ | 换用 $\coth$ 形式并检查 $Pe_e<1$ 区域的 $\tau$ 是否趋零 |
| GMRES 迭代次数随网格暴涨 | 块预条件未包含压力 Schur 补近似 | 用直接求解同一系统，比较迭代次数与耗时 |
| 时间步减半后解明显变化 | 库朗数过高，或时间格式仅一阶 | 用一阶与二阶时间格式分别计算，比较差异 |
| 质量不守恒 | 对流项用非保守形式 | 改用斜对称拆分，检查总动能变化率 |

### 七、文献与来源

1. Brooks A. N., Hughes T. J. R., "Streamline Upwind/Petrov-Galerkin Formulations for Convection Dominated Flows with Particular Emphasis on the Incompressible Navier-Stokes Equations", *Computer Methods in Applied Mechanics and Engineering*, 32(1-3), 199-259, 1982.
2. Taylor C., Hood P., "A Numerical Solution of the Navier-Stokes Equations Using the Finite Element Technique", *Computers & Fluids*, 1(1), 73-100, 1973.
3. Franca L. P., Frey S. L., Hughes T. J. R., "Stabilized Finite Element Methods: I. Application to the Advective-Diffusive Model", *Computer Methods in Applied Mechanics and Engineering*, 95(2), 253-276, 1992.
4. Zienkiewicz O. C., Taylor R. L., Nithiarasu P., *The Finite Element Method for Fluid Dynamics*, 7th ed., Butterworth-Heinemann, 2014.

## 诊断与可信度验证

流体有限元的不可信结果往往不来自误差大小，而来自两个结构性缺陷：速度—压力空间不满足 LBB 条件导致的压力棋盘，以及对流主导下缺失稳定化导致的界面振荡。本文给出这两个缺陷的量化诊断量与阈值，并给出与解析解对照的验收流程。

### 一、LBB 条件决定压力场是否合法

速度与压力作为独立未知量同时求解，二者空间必须满足离散 inf-sup（LBB）条件：

$$
\inf_{q_h\in Q_h}\ \sup_{\mathbf v_h\in V_h}\frac{\int_\Omega q_h\,\nabla\cdot\mathbf v_h\,d\Omega}{\lVert\mathbf v_h\rVert_1\,\lVert q_h\rVert_0}\ge\beta>0
$$

$\beta$ 称为 inf-sup 常数。等阶插值（$Q_1$–$Q_1$、$P_1$–$P_1$）的 $\beta=0$，压力自由度中存在不产生任何速度响应的零能模态，表现为棋盘振荡；Taylor–Hood（$P_2$–$P_1$、$Q_2$–$Q_1$）的 $\beta$ 与网格尺度无关，实测在合理网格上约为 0.02～0.1。诊断时可以直接用等阶单元跑一个定常算例：若压力出现红黑交替的棋盘，且换 Taylor–Hood 后消失，即可确认是 LBB 问题而非边界条件问题。

### 二、离散散度检验速度场是否满足连续性

不可压求解器输出的速度场应逐点无散，其相对误差定义为

$$
\epsilon_{\mathrm{div}}=\frac{\lVert\nabla\cdot\mathbf u_h\rVert_{L^2}}{\lVert\nabla\mathbf u_h\rVert_{L^2}}
$$

收敛解应使 $\epsilon_{\mathrm{div}}$ 落在 $10^{-8}$～$10^{-10}$。若停在 $10^{-3}$，通常不是物理压缩性，而是压力方程未收敛或投影步的散度清理不足；此时提高压力求解器容差并增加投影次数即可验证。

### 三、单元 Péclet 数给出对流主导判据

中心 Galerkin 在 $Pe_h>1$ 时会产生振荡：

$$
Pe_h=\frac{|\mathbf u|\,h}{2\nu}
$$

以 $|\mathbf u|=1$ m/s、$h=0.01$ m、$\nu=1\times10^{-3}$ m²/s 计算，$Pe_h=1\times0.01/(2\times10^{-3})=5$，远大于 1，必须启用 SUPG/PSPG 或改用迎风型单元。同一算例的 Reynolds 数 $Re=UD/\nu=1\times0.1/1\times10^{-3}=100$，属于层流定常，因此振荡只能归因于离散而非湍流——这正是需要区分物理与数值伪影的典型场景。

### 四、诊断脚本

```python
import numpy as np

# 解析 Poiseuille 剖面与中心线峰值
H, dpdx, mu = 0.1, -1.0, 1e-3          # m, Pa/m, Pa*s
y = np.linspace(0.0, H, 65)
u = (-dpdx) / (2 * mu) * y * (H - y)
print(f"u_max = {u.max():.4f} m/s")     # 1.2500 m/s

# 离散散度相对量：不可压收敛解应落在 1e-8 量级
def rel_divergence(ux, uy, dx, dy):
    dux = np.gradient(ux, axis=1) / dx
    duy = np.gradient(uy, axis=0) / dy
    div = dux + duy
    return np.linalg.norm(div) / np.linalg.norm(np.hypot(dux, duy))

ux = np.ones((65, 65)); uy = np.zeros((65, 65))   # 均匀流基线
print(f"均匀流 eps_div = {rel_divergence(ux, uy, 1/64, 1/64):.1e}")
```

### 五、失败模式表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场呈红黑棋盘 | 速度—压力空间不满足 LBB，存在压力零能模态 | 换 Taylor–Hood 单元重算，看棋盘是否消失 |
| 出口附近速度过冲 | 对流主导且未加稳定化，$Pe_h>1$ | 保持网格不变，开启 SUPG 并比较过冲幅度 |
| 迭代收敛但散度不降 | 压力 Poisson 方程容差过松，投影步数不足 | 打印 $\epsilon_{\mathrm{div}}$ 与压力残差随迭代的曲线 |
| 加密后压力误差不降 | 压力空间阶数低于速度空间 | 同时加密速度与压力空间，比较两者的收敛阶 |
| 层流算例出现非定常摆动 | 稳定化过强，$\tau$ 过大引入人工惯性 | 把 $\tau$ 缩小一个量级，看摆动是否消失 |
| 质量在长时积分中缓慢漂移 | 对流项用非保守形式，未做斜对称拆分 | 改用斜对称拆分，检查总动能变化率 |

### 六、与解析解对照验收

Poiseuille 流是检验有限元实现最直接的基准：平板间距 $H=0.1$ m、驱动压力梯度 $\mathrm dp/\mathrm dx=-1$ Pa/m、动力粘度 $\mu=1\times10^{-3}$ Pa·s。解析峰值速度为

$$
u_{\max}=\frac{H^2}{8\mu}\left|\frac{\mathrm dp}{\mathrm dx}\right|=\frac{0.01}{8\times10^{-3}}\times1=1.25\ \mathrm{m/s}
$$

用 $Q_2$–$Q_1$ 网格 $64\times64$ 计算，中心线速度误差应低于 0.5%，且 $\epsilon_{\mathrm{div}}<10^{-8}$。两项中任一项不达标，先查 LBB 与稳定化参数，再考虑网格；因为结构性问题不会随网格加密而消失。

### 七、参考文献

1. Brezzi F., Fortin M., *Mixed and Hybrid Finite Element Methods*, Springer, 1991.
2. Gresho P. M., Sani R. L., *Incompressible Flow and the Finite Element Method*, Wiley, 2000.
3. Donea J., Huerta A., *Finite Element Methods for Flow Problems*, Wiley, 2003.
4. Elman H. C., Silvester D. J., Wathen A. J., *Finite Elements and Fast Iterative Solvers*, 2nd ed., Oxford University Press, 2014.
