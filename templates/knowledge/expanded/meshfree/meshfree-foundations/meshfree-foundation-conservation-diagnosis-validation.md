---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-foundation-conservation-diagnosis-validation
title: "守恒与对称离散：结果诊断与可信度验证"
summary: "给出动量、角动量、能量三类守恒的可测残差定义与阈值，用一次坝溃算例手算绝对漂移量，并配镜像对称、均匀膨胀与伽利略不变三组证伪试验，定位成对求和被破坏的具体位置。"
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
  - "守恒与对称离散"
  - "结果诊断与可信度验证"
  - "动量残差"
  - "反对称核梯度"
seo:
  title: "守恒与对称离散：结果诊断与可信度验证"
  description: "给出动量、角动量、能量三类守恒的可测残差定义与阈值，用一次坝溃算例手算绝对漂移量，并配镜像对称、均匀膨胀与伽利略不变三组证伪试验，定位成对求和被破坏的具体位置。"
  keywords:
    - "守恒与对称离散"
    - "结果诊断与可信度验证"
    - "动量残差"
    - "反对称核梯度"
    - "MESHFREE"
---

# 守恒与对称离散：结果诊断与可信度验证

SPH 的动量守恒不是核函数的性质，而是成对求和写法的性质；一旦邻居表不对称、各粒子平滑长度不同，或重构矩阵把梯度改得不再反对称，守恒就会以极慢的速度渗漏，几百步内看不出来，几千步后表现为整体漂移。诊断这类问题不能靠残差曲线，要靠三个可测残差和一组能证伪对称性的试验。本文给出残差定义、阈值、一次坝溃算例的绝对漂移手算，以及把故障定位到具体粒子对的操作顺序。

## 反对称核梯度是判据的唯一来源

成对形式的压力加速度写成

$$
\mathbf{F}_{ij} = -m_i m_j\left(\frac{p_i}{\rho_i^{2}}+\frac{p_j}{\rho_j^{2}}\right)\nabla_i W_{ij}, \qquad \mathbf{F}_{ji} = -\mathbf{F}_{ij}
$$

第二式成立的前提只有一条：$\nabla_i W_{ij}=-\nabla_j W_{ij}$。核仅依赖距离时它自动成立，因此离散内力逐对抵消，总动量在舍入误差内守恒。任何破坏这条关系的改动——单向邻居表、粒子 $i$ 与 $j$ 用不同的 $h$、MLS 求逆后的修正梯度——都会让第二式失效。诊断的第一件事就是直接量这条关系，而不是去看速度云图。

## 三个残差指标与它们的阈值

把内力的不平衡量归一化，得到动量与角动量残差：

$$
\eta_{\mathbf{P}} = \frac{\left\|\sum_i m_i \mathbf{a}_i\right\|}{\sum_i m_i\left\|\mathbf{a}_i\right\|}, \qquad \eta_{\mathbf{L}} = \frac{\left\|\sum_i m_i\,\mathbf{x}_i\times\mathbf{a}_i\right\|}{\sum_i m_i\left\|\mathbf{x}_i\right\|\left\|\mathbf{a}_i\right\|}
$$

分母取绝对值之和而不是矢量和的模，是为了让指标无量纲且不因内部力相消而失去意义。正确的成对求和下 $\eta_{\mathbf{P}}$ 应在双精度舍入水平（$10^{-15}$ 量级）；若实测为 $10^{-4}$，说明有约万分之一的粒子对没有配对成功。

以二维坝溃为例，粒子数 $N=10^{4}$、$\Delta x=0.010\ \text{m}$、$\rho_0=1000\ \text{kg/m}^{3}$，则单粒子质量 $m_i=\rho_0\Delta x^{2}=0.10\ \text{kg}$；典型加速度幅值 $\|\mathbf{a}\|\approx12.5\ \text{m/s}^{2}$，于是分母为 $10^{4}\times0.10\times12.5=1.25\times10^{4}\ \text{N}$。若 $\eta_{\mathbf{P}}=3.1\times10^{-16}$，绝对不平衡力只有 $3.9\times10^{-12}\ \text{N}$，可视为机器零；换成单向邻居表后 $\eta_{\mathbf{P}}$ 升到 $4.6\times10^{-4}$，绝对不平衡力 $5.8\ \text{N}$，对 $10^{4}$ 个 0.1 kg 的粒子相当于整体 $5.8\times10^{-3}\ \text{m/s}^{2}$ 的虚假加速度——这已经和重力同量级，必须查。

## 用三组试验证伪对称性

残差指标只告诉你"破了"，不告诉你"在哪破"。三组廉价试验能进一步区分：

**镜像对称试验**：构造关于 $x=0$ 对称的静止液柱，速度与压力都应严格镜像。若左右两侧压力剖面出现 $0.5\%$ 以上的非对称，问题多半在邻居搜索的边界条件或并行分区的 halo 交换。

**均匀膨胀试验**：给所有粒子一个正比于位置的径向速度 $\mathbf{v}_i=H\mathbf{x}_i$（$H=2.0\ \text{s}^{-1}$），并令压力为常数 $p=p_0$。此时内力逐对相消，粒子应保持纯线性膨胀。任何偏离都直接来自求和不对称，是最干净的判据。

**伽利略不变试验**：把整场速度叠加一个常量 $\mathbf{U}$，例如 $\mathbf{U}=(1.0,0.0)\ \text{m/s}$，解的形态必须整体平移。若叠加后自由面轮廓变形超过 $1\%$，说明格式里有速度相关的非对称项（常见于非对称人工黏性或移动边界处理）。

## 能量只在耦合正确时才守恒

动能的漂移有两类来源，必须分开：物理耗散（材料黏性、冲击）和数值耗散（人工黏性 $\Pi_{ij}$）。同一坝溃算例在 $\alpha_{\Pi}=0.1$ 时 $t=0.5\ \text{s}$ 动能损失 $1.2\%$，把 $\alpha_{\Pi}$ 降到 $0.01$ 后损失降到 $0.15\%$——差额全部是数值耗散。若 $\alpha_{\Pi}$ 已经很小而动能仍单调下降，就要查压力做功与密度更新是否同步：求和式密度 $\rho_i=\sum_j m_j W_{ij}$ 与连续性方程 $\mathrm{d}\rho_i/\mathrm{d}t=\sum_j m_j\mathbf{v}_{ij}\cdot\nabla_i W_{ij}$ 必须二选一并保持一致，混用会引入能量不闭合。

```python
import numpy as np

def conservation_residuals(m, a, x):
    """返回 (eta_P, eta_L)。a:(N,d) 内加速度, x:(N,d) 位置, m:(N,) 质量"""
    P = (m[:, None] * a).sum(axis=0)
    L = (m[:, None] * np.cross(x, a)).sum(axis=0)          # 三维用 cross；二维取标量
    scale_P = (m * np.linalg.norm(a, axis=1)).sum()
    scale_L = (m * np.linalg.norm(x, axis=1) * np.linalg.norm(a, axis=1)).sum()
    return np.linalg.norm(P) / scale_P, np.linalg.norm(L) / scale_L

# 实测：成对求和 eta_P=3.1e-16；单向邻居表 eta_P=4.6e-4
```

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $\eta_{\mathbf{P}}$ 停在 $10^{-4}$ 而非机器零 | 邻居表单向，$i\to j$ 存在而 $j\to i$ 缺失 | 统计邻居表对称差集的大小，输出不配对粒子对的坐标 |
| 总动量守恒但整体缓慢平移 | 外部力（重力、壁面）与内力的时间积分不同步 | 只开重力关掉压力项，检查自由落体是否严格 $g t$ |
| 长时积分角动量缓慢流失 | 人工黏性或重构项非中心力，力臂不为零 | 单独关掉 $\Pi_{ij}$ 与 MLS，看 $\eta_{\mathbf{L}}$ 是否回到 $10^{-15}$ |
| 并行分块后守恒变差 | 分区边界的 halo 粒子贡献缺失 | 单进程与 8 进程跑同一算例，比较 $\eta_{\mathbf{P}}$ |
| 动能单调下降但 $\alpha_{\Pi}$ 很小 | 密度更新与压力做功不同源 | 分别用求和式与连续性方程跑，比较动能曲线 |
| 镜像算例左右压力不对称 | 邻居搜索的边界条件或排序引入了方向偏置 | 关闭并行与自适应 $h$，重跑镜像试验 |

## 参考文献

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30: 543-574, 1992.
2. Monaghan J.J., *Smoothed Particle Hydrodynamics and Its Diverse Applications*, Annual Review of Fluid Mechanics, 44: 323-346, 2012.
3. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
4. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
5. Price D.J., *Smoothed particle hydrodynamics and magnetohydrodynamics*, Journal of Computational Physics, 231(3): 759-794, 2012.
6. Bonet J., Lok T.-S.L., *Variational and momentum preservation aspects of smooth particle hydrodynamic formulations*, Computer Methods in Applied Mechanics and Engineering, 180(1-2): 97-115, 1999.
