---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-species-transport-modeling
title: "组分输运方程：物理建模与适用边界"
summary: "组分方程的闭合缺口在多组分扩散、热扩散（Soret）与湍流—化学耦合三处。本文用 Stefan–Maxwell 方程说明 Fick 近似的误差来源，并算出 CH4/空气火焰厚度 57.9 μm、Kolmogorov 尺度 50 μm 与网格下限。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "组分输运方程"
  - "物理建模与适用边界"
  - "Stefan–Maxwell 扩散"
  - "火焰厚度"
seo:
  title: "组分输运方程：物理建模与适用边界"
  description: "组分方程的闭合缺口在多组分扩散、热扩散（Soret）与湍流—化学耦合三处。本文用 Stefan–Maxwell 方程说明 Fick 近似的误差来源，并算出 CH4/空气火焰厚度 57.9 μm、Kolmogorov 尺度 50 μm 与网格下限。"
  keywords:
    - "组分输运方程"
    - "物理建模与适用边界"
    - "Stefan–Maxwell 扩散"
    - "火焰厚度"
---

# 组分输运方程：物理建模与适用边界

组分输运方程的形式与标量输运方程一样，差别全在扩散通量的闭合上。把 $\mathbf{j}_i$ 写成 $-\rho D_i\nabla Y_i$ 是最省事的做法，但它丢掉了三件事：组分之间的交叉扩散、温度梯度驱动的热扩散、以及湍流脉动与化学反应的耦合。这三项的量级并不小——氢燃料火焰中忽略 Soret 效应会让火焰位置偏移数毫米，而层流火焰厚度只有几十微米。下面把三层闭合缺口分别量化。

## 组分质量守恒的微分形式与闭合缺口

第 $i$ 个组分的质量守恒写成

$$
\frac{\partial(\rho Y_i)}{\partial t} + \nabla\cdot(\rho\mathbf{u}Y_i) = -\nabla\cdot\mathbf{j}_i + \dot\omega_i
$$

$\mathbf{j}_i$ 是扩散质量通量，$\dot\omega_i$ 是化学反应源项。方程有 $N$ 个，但只有 $N-1$ 个独立，因为质量分数之和恒为 1。扩散通量必须满足

$$
\sum_{i=1}^{N}\mathbf{j}_i = 0
$$

这是 Fick 形式 $\mathbf{j}_i=-\rho D_i\nabla Y_i$ 不自动满足的：各组分独立扩散会给出非零的净质量通量。修正方法是引入修正速度

$$
\mathbf{j}_i = -\rho D_i\nabla Y_i + \rho Y_i\mathbf{u}_c,\qquad
\mathbf{u}_c = \sum_{k=1}^{N} D_k\nabla Y_k
$$

这一步不是可选的细节。缺少修正时，即使每个组分的方程都"守恒"，总和仍会漂移，表现为质量分数之和偏离 1 并随时间累积。

## Stefan–Maxwell 与 Fick 的差距

严格的扩散关系来自动量平衡，写成 Stefan–Maxwell 形式

$$
\nabla X_i = \sum_{j\neq i}\frac{X_iX_j}{D_{ij}}\left(\mathbf{V}_j-\mathbf{V}_i\right) + \frac{\nabla T}{T}\sum_{j\neq i}\frac{X_iX_j}{D_{ij}}\left(\frac{D_j^{T}}{\rho_j}-\frac{D_i^{T}}{\rho_i}\right)
$$

第一项是浓度扩散，第二项是热扩散。$D_{ij}$ 是二元扩散系数矩阵，$D_i^{T}$ 是热扩散系数。Fick 形式相当于把求和项压成一个有效 $D_i$，在两种情况下误差可以接受：混合物中某一组分浓度远高于其余（稀释近似），或所有二元系数彼此接近（如空气—燃烧产物体系）。误差不能接受的情况是含氢混合物——$D_{\mathrm{H_2\text{-}H_2O}}$ 与 $D_{\mathrm{H_2\text{-}N_2}}$ 相差三倍以上，用单一 $D_i$ 会让氢的优先扩散（preferential diffusion）完全消失，而正是这一效应决定了氢火焰的胞状不稳定性。

## Soret 效应与 Lewis 数不能取 1 的场合

热扩散的强弱用热扩散比衡量，量级上它与 Lewis 数直接相关

$$
Le = \frac{\alpha}{D} = \frac{\text{热扩散率}}{\text{质量扩散率}}
$$

$Le=1$ 时热扩散与质量扩散以相同速率进行，火焰结构最简单，这也是"恒 Lewis 数"模型默认取 1 的原因。298 K、1 atm 下甲烷在空气中的 $D=1.6\times10^{-5}\ \mathrm{m^2/s}$，空气热扩散率 $\alpha=2.2\times10^{-5}\ \mathrm{m^2/s}$，$Le=1.375$；氢气在空气中 $D=6.1\times10^{-5}\ \mathrm{m^2/s}$，$Le=2.2\times10^{-5}/6.1\times10^{-5}=0.361$。$Le<1$ 表示质量扩散快于热扩散，轻组分优先向反应区输运，火焰温度高于绝热值、燃烧速度增大；$Le>1$ 则相反。$Le$ 偏离 1 的幅度超过 20% 时（即 $Le<0.8$ 或 $Le>1.2$）就必须使用多组分或至少是逐组分 Fick 扩散，否则燃烧速度的预测误差会达到 20%～40%。

Soret 效应的独立判据是热扩散比 $k_T$。对氢气在 300 K 附近 $k_T\approx-0.3$，符号为负意味着氢向冷端富集；对氮气、甲烷这类较重分子 $k_T$ 在 $10^{-2}$ 量级，可以忽略。因此实用规则是：含 $\mathrm{H_2}$ 或 He 的混合物、且存在 100 K 以上温差的算例必须打开热扩散；碳氢燃料—空气体系可以关闭。

## 火焰厚度、Kolmogorov 尺度与网格下限

层流火焰厚度由热扩散率与火焰速度之比给出

$$
\delta_L = \frac{\alpha}{S_L}
$$

甲烷—空气在当量比 1、298 K、1 atm 下的层流火焰速度 $S_L=0.38\ \mathrm{m/s}$，代入得 $\delta_L=2.2\times10^{-5}/0.38=5.79\times10^{-5}\ \mathrm{m}$，即 57.9 μm；绝热火焰温度约 2223 K。同样口径下氢气—空气的 $S_L=2.1\ \mathrm{m/s}$，$\delta_L=1.05\times10^{-5}\ \mathrm{m}$，只有 10.5 μm。这两个数字直接决定网格：预混火焰至少需要 10 个单元落在火焰厚度内，甲烷要求 $\Delta x\le5.8\ \mu m$，氢气要求 $\Delta x\le1.0\ \mu m$。

湍流一侧的下限由 Kolmogorov 尺度给出

$$
\eta = L\,Re^{-3/4}
$$

取积分尺度 $L=0.05\ \mathrm{m}$、$Re=1.0\times10^4$，得 $\eta=0.05\times(10^4)^{-0.75}=0.05/1000=5.0\times10^{-5}\ \mathrm{m}=50\ \mu m$。于是卡洛维茨数

$$
Ka = \frac{\delta_L}{\eta} = \frac{57.9}{50} = 1.16
$$

$Ka<1$ 属于皱褶火焰面区，可以用火焰面模型加湍流输运闭合；$Ka>1$ 进入薄反应区，火焰面内部结构被小尺度涡扰动，必须解析内层或使用加厚火焰模型。甲烷算例恰好落在 $Ka\approx1$ 的分界上，说明用火焰面模型是可行的但余量很小，网格一旦放宽到 $\Delta x>60\ \mu m$ 就会既解析不了火焰又解析不了 Kolmogorov 涡，两侧的物理同时丢失。

```python
alpha, SL_ch4, SL_h2 = 2.2e-5, 0.38, 2.1        # m2/s, m/s
L, Re = 0.05, 1.0e4
eta = L * Re**-0.75
for name, SL in (("CH4", SL_ch4), ("H2", SL_h2)):
    dL = alpha / SL
    print(f"{name}: delta_L={dL*1e6:6.1f} um  dx_max={dL*1e5:5.2f} um  Ka={dL/eta:5.2f}")
# CH4: delta_L=  57.9 um  dx_max= 5.79 um  Ka= 1.16
# H2:  delta_L=  10.5 um  dx_max= 1.05 um  Ka= 0.21
print(f"eta={eta*1e6:.1f} um")                  # 50.0 um
print(f"Le(H2)={alpha/6.1e-5:.3f}  Le(CH4)={alpha/1.6e-5:.3f}")
# Le(H2)=0.361  Le(CH4)=1.375
```

注意氢气那一行的 $Ka=0.21$ 反而更小：火焰更薄但 $S_L$ 更大，$\delta_L$ 缩小的速度快于 $Ka$ 的下降，因此氢气火焰在同样的湍流场里反而更容易维持在火焰面区，但它对网格的要求（1.05 μm）比甲烷严格 5.5 倍。

## 失败模式：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 质量分数之和随时间单调偏离 1 | 扩散通量缺少修正速度，$\sum\mathbf{j}_i\neq0$ | 输出 $\sum_i Y_i$ 的时间序列，修正后应在 $10^{-6}$ 内波动 |
| 氢火焰燃烧速度比实验低 30% | 用 $Le=1$ 抹掉了优先扩散 | 输出 $Le$ 场并改逐组分 Fick 扩散，比较 $S_L$ 变化 |
| 富氢混合物中火焰前锋出现非对称偏移 | 未打开 Soret 热扩散 | 打开热扩散复算，前锋位置应发生可测的毫米级移动 |
| 网格加密到 10 μm 后火焰速度仍在变 | 火焰厚度 57.9 μm，10 μm 只给 0.17 个单元/μm 的分辨率不足 | 按 $\Delta x\le\delta_L/10$ 加密到 5.8 μm 以下 |
| 湍流燃烧算例的火焰面模型在 $Ka>1$ 区失效 | 火焰面假设被小尺度涡破坏 | 由 $L$、$Re$ 算 $\eta$ 与 $Ka$，超过 1 时换加厚火焰或有限速率模型 |
| 燃烧室温度峰值比绝热火焰温度高 200 K | 用 $Le<1$ 燃料时超绝热效应被误判为数值误差 | 核对 $Le$：$Le<1$ 时局部超绝热是物理结果，不应做限制器截断 |

## 参考文献

1. Poinsot T., Veynante D., *Theoretical and Numerical Combustion*, 2nd ed., Edwards, 2005.
2. Williams F.A., *Combustion Theory*, 2nd ed., Benjamin/Cummings, 1985.
3. Law C.K., *Combustion Physics*, Cambridge University Press, 2006.
4. Peters N., *Turbulent Combustion*, Cambridge University Press, 2000.
