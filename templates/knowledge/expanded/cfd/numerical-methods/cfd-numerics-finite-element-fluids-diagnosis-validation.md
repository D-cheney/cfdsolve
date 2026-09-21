---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-finite-element-fluids-diagnosis-validation
title: "流体有限元：结果诊断与可信度验证"
summary: "流体有限元的两个结构性缺陷是 LBB 不满足导致的压力棋盘与对流主导导致的界面振荡；本文给出 inf-sup 常数、离散散度与单元 Péclet 的阈值，并附 Poiseuille 对照算例。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "流体有限元"
  - "结果诊断与可信度验证"
  - "LBB 条件"
  - "离散散度"
seo:
  title: "流体有限元：结果诊断与可信度验证"
  description: "流体有限元的两个结构性缺陷是 LBB 不满足导致的压力棋盘与对流主导导致的界面振荡；本文给出 inf-sup 常数、离散散度与单元 Péclet 的阈值，并附 Poiseuille 对照算例。"
  keywords:
    - "流体有限元"
    - "结果诊断与可信度验证"
    - "LBB 条件"
    - "离散散度"
    - "单元 Péclet"
---

# 流体有限元：结果诊断与可信度验证

流体有限元的不可信结果往往不来自误差大小，而来自两个结构性缺陷：速度—压力空间不满足 LBB 条件导致的压力棋盘，以及对流主导下缺失稳定化导致的界面振荡。本文给出这两个缺陷的量化诊断量与阈值，并给出与解析解对照的验收流程。

## 一、LBB 条件决定压力场是否合法

速度与压力作为独立未知量同时求解，二者空间必须满足离散 inf-sup（LBB）条件：

$$
\inf_{q_h\in Q_h}\ \sup_{\mathbf v_h\in V_h}\frac{\int_\Omega q_h\,\nabla\cdot\mathbf v_h\,d\Omega}{\lVert\mathbf v_h\rVert_1\,\lVert q_h\rVert_0}\ge\beta>0
$$

$\beta$ 称为 inf-sup 常数。等阶插值（$Q_1$–$Q_1$、$P_1$–$P_1$）的 $\beta=0$，压力自由度中存在不产生任何速度响应的零能模态，表现为棋盘振荡；Taylor–Hood（$P_2$–$P_1$、$Q_2$–$Q_1$）的 $\beta$ 与网格尺度无关，实测在合理网格上约为 0.02～0.1。诊断时可以直接用等阶单元跑一个定常算例：若压力出现红黑交替的棋盘，且换 Taylor–Hood 后消失，即可确认是 LBB 问题而非边界条件问题。

## 二、离散散度检验速度场是否满足连续性

不可压求解器输出的速度场应逐点无散，其相对误差定义为

$$
\epsilon_{\mathrm{div}}=\frac{\lVert\nabla\cdot\mathbf u_h\rVert_{L^2}}{\lVert\nabla\mathbf u_h\rVert_{L^2}}
$$

收敛解应使 $\epsilon_{\mathrm{div}}$ 落在 $10^{-8}$～$10^{-10}$。若停在 $10^{-3}$，通常不是物理压缩性，而是压力方程未收敛或投影步的散度清理不足；此时提高压力求解器容差并增加投影次数即可验证。

## 三、单元 Péclet 数给出对流主导判据

中心 Galerkin 在 $Pe_h>1$ 时会产生振荡：

$$
Pe_h=\frac{|\mathbf u|\,h}{2\nu}
$$

以 $|\mathbf u|=1$ m/s、$h=0.01$ m、$\nu=1\times10^{-3}$ m²/s 计算，$Pe_h=1\times0.01/(2\times10^{-3})=5$，远大于 1，必须启用 SUPG/PSPG 或改用迎风型单元。同一算例的 Reynolds 数 $Re=UD/\nu=1\times0.1/1\times10^{-3}=100$，属于层流定常，因此振荡只能归因于离散而非湍流——这正是需要区分物理与数值伪影的典型场景。

## 四、诊断脚本

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

## 五、失败模式表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场呈红黑棋盘 | 速度—压力空间不满足 LBB，存在压力零能模态 | 换 Taylor–Hood 单元重算，看棋盘是否消失 |
| 出口附近速度过冲 | 对流主导且未加稳定化，$Pe_h>1$ | 保持网格不变，开启 SUPG 并比较过冲幅度 |
| 迭代收敛但散度不降 | 压力 Poisson 方程容差过松，投影步数不足 | 打印 $\epsilon_{\mathrm{div}}$ 与压力残差随迭代的曲线 |
| 加密后压力误差不降 | 压力空间阶数低于速度空间 | 同时加密速度与压力空间，比较两者的收敛阶 |
| 层流算例出现非定常摆动 | 稳定化过强，$\tau$ 过大引入人工惯性 | 把 $\tau$ 缩小一个量级，看摆动是否消失 |
| 质量在长时积分中缓慢漂移 | 对流项用非保守形式，未做斜对称拆分 | 改用斜对称拆分，检查总动能变化率 |

## 六、与解析解对照验收

Poiseuille 流是检验有限元实现最直接的基准：平板间距 $H=0.1$ m、驱动压力梯度 $\mathrm dp/\mathrm dx=-1$ Pa/m、动力粘度 $\mu=1\times10^{-3}$ Pa·s。解析峰值速度为

$$
u_{\max}=\frac{H^2}{8\mu}\left|\frac{\mathrm dp}{\mathrm dx}\right|=\frac{0.01}{8\times10^{-3}}\times1=1.25\ \mathrm{m/s}
$$

用 $Q_2$–$Q_1$ 网格 $64\times64$ 计算，中心线速度误差应低于 0.5%，且 $\epsilon_{\mathrm{div}}<10^{-8}$。两项中任一项不达标，先查 LBB 与稳定化参数，再考虑网格；因为结构性问题不会随网格加密而消失。

## 七、参考文献

1. Brezzi F., Fortin M., *Mixed and Hybrid Finite Element Methods*, Springer, 1991.
2. Gresho P. M., Sani R. L., *Incompressible Flow and the Finite Element Method*, Wiley, 2000.
3. Donea J., Huerta A., *Finite Element Methods for Flow Problems*, Wiley, 2003.
4. Elman H. C., Silvester D. J., Wathen A. J., *Finite Elements and Fast Iterative Solvers*, 2nd ed., Oxford University Press, 2014.
