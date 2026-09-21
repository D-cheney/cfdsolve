---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-foundation-conservation-modeling
title: "守恒与对称离散：离散原理与适用边界"
summary: "从连续守恒律推到成对对称的离散形式，逐条列出保证动量、角动量与能量守恒的四个前提，给出 Tait 状态方程下声速与密度波动的量级估算，并说明 MLS 重构、变平滑长度与开边界各自放弃了哪一条守恒。"
category:
  slug: meshfree-foundations
  name: "无网格法 · 方法与验证"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法 · 方法与验证"
  - "守恒与对称离散"
  - "离散原理与适用边界"
  - "成对对称"
  - "Tait 状态方程"
seo:
  title: "守恒与对称离散：离散原理与适用边界"
  description: "从连续守恒律推到成对对称的离散形式，逐条列出保证动量、角动量与能量守恒的四个前提，给出 Tait 状态方程下声速与密度波动的量级估算，并说明 MLS 重构、变平滑长度与开边界各自放弃了哪一条守恒。"
  keywords:
    - "守恒与对称离散"
    - "离散原理与适用边界"
    - "成对对称"
    - "Tait 状态方程"
    - "MESHFREE"
---

# 守恒与对称离散：离散原理与适用边界

连续介质的守恒律在离散化后不会自动继承。SPH 之所以能在无网格的散点上保住动量与角动量，靠的是把内力写成逐对反对称的形式，并让核梯度满足一条纯几何的关系。这条关系的成立条件很窄：核只依赖距离、两侧用同一个平滑长度、邻居表双向一致。任何一条被破坏，守恒就从"精确"退化成"近似"，而近似的程度随时间累积。本文把四个前提逐条拆开，给出声速与密度波动的量级估算，并说明哪些工程需求必须付出放弃某条守恒的代价。

## 质量守恒由构造保证，密度场不保证

总质量 $M=\sum_i m_i$ 在显式拉格朗日框架里是常数，因为粒子既不生成也不消失，求和式密度

$$
\rho_i=\sum_j m_j W_{ij}
$$

只是把 $M$ 重新分配，所以 $\sum_i m_i/\rho_i\cdot\rho_i$ 恒等于 $M$。但"总量守恒"与"密度正确"是两回事：自由面处 $W_{ij}$ 被截断，$\rho_i$ 系统性偏低，总量仍然守恒。若改用连续性方程形式 $\mathrm{d}\rho_i/\mathrm{d}t=\sum_j m_j\mathbf{v}_{ij}\cdot\nabla_i W_{ij}$，总量同样守恒，但两种密度的差会随时间放大到百分级，同一算例里不能混用。

## 动量守恒等价于一条核梯度关系

压力加速度取成对形式：

$$
\frac{\mathrm{d}\mathbf{v}_i}{\mathrm{d}t}=-\sum_j m_j\left(\frac{p_i}{\rho_i^{2}}+\frac{p_j}{\rho_j^{2}}\right)\nabla_i W_{ij}+\mathbf{g}
$$

把整个系统的动量变化率写成双重求和，再交换 $i$ 与 $j$ 的哑标，两次结果相加：

$$
\sum_i m_i\frac{\mathrm{d}\mathbf{v}_i}{\mathrm{d}t}=-\sum_i\sum_j m_i m_j\left(\frac{p_i}{\rho_i^{2}}+\frac{p_j}{\rho_j^{2}}\right)\nabla_i W_{ij}=\mathbf{g}\sum_i m_i
$$

中间的双重求和之所以为零，完全依赖 $\nabla_i W_{ij}=-\nabla_j W_{ij}$。核写成 $W(|\mathbf{x}_i-\mathbf{x}_j|,h)$ 时该式恒成立，因为梯度方向沿连线且大小相同。于是总动量只受外力支配，且这个结论是精确的，不是渐近的。

角动量比线动量多一个要求：内力必须沿粒子连线。只有当核是径向函数时才有 $\mathbf{x}_{ij}\times\nabla_i W_{ij}=\mathbf{0}$，力臂为零，角动量才守恒。人工黏性 $\Pi_{ij}$ 含 $\mathbf{v}_{ij}\cdot\mathbf{x}_{ij}$，仍是中心力，不破坏这一条；而 MLS 求逆得到的修正梯度不再沿连线，角动量会缓慢流失。

## 四个前提与各自的失效后果

| 前提 | 物理含义 | 被破坏后的直接后果 |
|---|---|---|
| $\nabla_i W_{ij}=-\nabla_j W_{ij}$ | 核为径向函数 | 线动量逐对不抵消，整体漂移 |
| 两侧用同一 $h$ | 平滑长度全场一致 | 同一对粒子受力大小不等，净内力非零 |
| 邻居表双向一致 | $j\in\mathcal{N}_i\Leftrightarrow i\in\mathcal{N}_j$ | 等价于单向力，出现约 $10^{-4}$ 量级的动量残差 |
| 压力项与体积项配对 | 用 $p_i/\rho_i^{2}+p_j/\rho_j^{2}$ 而非 $p_i/\rho_i\rho_j$ | 能量不闭合，压力做功与密度更新不同源 |

自适应平滑长度是第四条最常见的牺牲品：让 $h$ 随密度变化能改善分辨率，但 $h_i\neq h_j$ 时核值不再对称，必须改用对称化写法（如取 $h_{ij}=(h_i+h_j)/2$ 并同时修正归一化），否则守恒性直接丢失。

## 状态方程与时间步把守恒约束转成数值参数

弱可压缩 SPH 用 Tait 状态方程闭合压力：

$$
p_i=\frac{\rho_0 c_s^{2}}{\gamma}\left[\left(\frac{\rho_i}{\rho_0}\right)^{\gamma}-1\right], \qquad \gamma=7
$$

$c_s$ 的选取决定了不可压性与时间步的折中。密度波动的量级为 $\delta\rho/\rho_0\sim(v_{\max}/c_s)^{2}$。取溃坝最大流速 $v_{\max}=3.0\ \text{m/s}$、要求波动不超过 $1\%$，则 $c_s\ge v_{\max}/\sqrt{0.01}=30\ \text{m/s}$，此时 $\rho_0 c_s^{2}=1000\times900=9.0\times10^{5}\ \text{Pa}$。用 $\Delta x=0.010\ \text{m}$、$h=1.2\Delta x=0.012\ \text{m}$，声学 CFL 项给出 $\Delta t\le0.25\,h/(c_s+v_{\max})=0.25\times0.012/33=9.1\times10^{-5}\ \text{s}$。把 $c_s$ 从 30 提到 60 m/s 可把波动压到 $0.25\%$，代价是时间步减半、总计算量翻倍——这就是守恒精度与成本之间的直接换算。

```python
for i in range(N):
    for j in neigh[i]:                      # 双向表：j 一定也在 neigh[j] 里
        if j <= i:
            continue                        # 每对只算一次，写入两侧
        r = x[i] - x[j]; rn = np.linalg.norm(r)
        if rn > rc or rn < 1e-12:
            continue
        gW = dWdr(rn, h) * r / rn
        coef = -(p[i] / rho[i]**2 + p[j] / rho[j]**2) * m[i] * m[j]
        a[i] += coef * gW / m[i]            # 等价于 -m_j*(...)*gW
        a[j] -= coef * gW / m[j]            # 反对称写入，动量精确守恒
```

## 什么情况下必须放弃守恒

MLS/CSPM 重构能恢复一阶完备性，代价是梯度不再反对称，长时间积分会累积角动量漂移，适合做后处理量或短时高梯度区。变平滑长度适合密度反差极大的多相流，代价是必须额外做对称化。开边界（入流、出流、周期性粒子搬运）必然引入粒子增删，质量守恒退化为"流入减流出"的收支平衡，需要用通量账本单独核对。弹性固体用全拉格朗日形式时，人工应力 $\Pi_{ij}$ 与人工黏性都写成对称对，守恒性可以保住，但自由面处依然受截断影响。工程上合理的做法是：内部用严格成对求和，只在真正需要一阶精确梯度的边界带局部启用重构，并在报告里写明该区域不保证严格守恒。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 内部守恒、近壁动量漂移 | 壁面粒子与流体粒子用不同 $h$ | 打印壁面与内部粒子的 $h$ 直方图 |
| 加密后守恒残差反而变大 | 粒子数增加使无序度上升，单向配对概率变高 | 同一算例比较不同粒子数下的邻居表对称差集 |
| 压力做功与动能变化不闭合 | 密度更新用了与压力项不同源的公式 | 同一算例分别用求和式与连续性方程跑，比较能量收支 |
| 多相界面附近虚假动量 | 两侧密度差大，$p_i/\rho_i^{2}+p_j/\rho_j^{2}$ 与体积项不匹配 | 改用密度加权对称形式后重测动量残差 |
| 变 $h$ 后长时漂移 | $h_i\neq h_j$ 破坏核梯度反对称 | 固定 $h$ 与自适应 $h$ 各跑一遍，比较总动量曲线 |

## 参考文献

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30: 543-574, 1992.
2. Bonet J., Lok T.-S.L., *Variational and momentum preservation aspects of smooth particle hydrodynamic formulations*, Computer Methods in Applied Mechanics and Engineering, 180(1-2): 97-115, 1999.
3. Price D.J., *Smoothed particle hydrodynamics and magnetohydrodynamics*, Journal of Computational Physics, 231(3): 759-794, 2012.
4. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
5. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Springel V., *Smoothed particle hydrodynamics in astrophysics*, Annual Review of Astronomy and Astrophysics, 48: 391-430, 2010.
