---
template_version: "flowlab-knowledge/1.0"
slug: lagrangian-particle-tracking
title: 拉格朗日颗粒追踪与双向耦合
summary: 说明离散颗粒的受力闭合、Schiller–Naumann 曳力、时间积分、湍流扩散、壁面行为与单向/双向耦合，并给出颗粒统计收敛与质量平衡检查。
category:
  slug: multiphase-flow
  name: 多相流与组分输运
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [颗粒追踪, DPM, 双向耦合, 沉积, 湍流扩散, Stokes 数]
seo:
  title: CFD 拉格朗日颗粒追踪指南｜CFD菜鸟
  description: 设置颗粒受力、注入、壁面行为与双向耦合，并检查颗粒统计量、曳力区与质量守恒。
  keywords: [DPM, 拉格朗日颗粒, 颗粒沉积, 双向耦合, 曳力系数]
---

# 拉格朗日颗粒追踪与双向耦合

Euler–Lagrange 方法在连续相流场中追踪大量代表性颗粒或颗粒包，适合分散相体积分数较低、且轨迹、停留时间、沉积与粒径分级重要的问题。它的主要误差来源往往不是求解器，而是受力闭合、湍流扩散模型与统计采样是否充分。把这几项做对，结果通常比换更贵的模型更有效。

## 1. 结论与适用场景

- **适合**：稀疏颗粒、液滴或气泡（一般 $\alpha_d \leq 10^{-2}$）；需要逐轨迹信息，如旋风分离效率、喷雾蒸发、气力输送稀相、颗粒沉积与冲蚀。
- **不适合**：稠密颗粒群（碰撞与相内应力主导）；界面可解析的连续液面（应改用 VOF）；相间强耦合且各相分数都大（应改用 Euler–Euler 或 DDPM）。
- **判据**：颗粒 Stokes 数决定跟随性，动量反馈量级 $\alpha_d \rho_d / \rho_c$ 决定是否需要双向耦合。
- **混合场景**：同一设备既有可解析液面又有稀疏液滴时，可局部切换 VOF 与 DPM，但需在交界处做通量一致性检查。

## 2. 物理与数学基础

在拉格朗日框架下，颗粒位置与速度由牛顿第二定律积分得到：

$$
m_p \frac{d \mathbf{u}_p}{dt} = \mathbf{F}_D + \mathbf{F}_g + \mathbf{F}_{lift} + \mathbf{F}_{pg} + \mathbf{F}_{vm}
$$

其中 $m_p$ 为颗粒质量，右侧依次为曳力、重力与浮力、升力、压力梯度力与虚质量力。对多数工程问题，曳力与重力主导，其余项在密度比接近 1 或强旋流时不可忽略。

颗粒松弛时间与 Stokes 数为

$$
\tau_p = \frac{\rho_p d_p^{2}}{18 \mu_c}, \qquad St = \frac{\tau_p}{\tau_f}
$$

$St$ 很小说明颗粒紧跟流体，$St$ 很大说明颗粒几乎沿直线运动、对湍流脉动不敏感。停留时间、沉积位置与分离效率都强依赖这两个量。

## 3. 关键方程与公式

单颗粒曳力是最关键的闭合项：

$$
\mathbf{F}_D = \frac{1}{2} C_D \rho_c A_p |\mathbf{u}_c - \mathbf{u}_p| (\mathbf{u}_c - \mathbf{u}_p)
$$

对球形颗粒，常用 Schiller–Naumann 关联式：

$$
C_D = \frac{24}{Re_p}\left(1 + 0.15 Re_p^{0.687}\right), \quad Re_p \leq 1000
$$

其中 $Re_p = \rho_c d_p |\mathbf{u}_c - \mathbf{u}_p| / \mu_c$。当颗粒密度远大于流体时，终端沉降速度近似为

$$
u_t = \frac{(\rho_p - \rho_c) d_p^{2} g}{18 \mu_c}
$$

双向耦合时，颗粒对连续相的反作用以动量源项形式加入：

$$
\mathbf{S}_p = -\frac{1}{V_{cell}} \sum_k \dot{m}_{p,k} \mathbf{F}_{D,k}
$$

当反馈量级达到百分之几，必须开启双向耦合，否则连续相会被高估。

## 4. 工程做法与参数

1. **注入定义**：给出粒径分布、密度、温度、初速度、质量流率、空间分布与释放时间；分布类型须与物理一致（如 Rosin–Rammler 或对数正态）。
2. **样本量**：颗粒包数量应使沉积率、停留时间统计不随样本量显著变化；做样本独立性检查并报告不确定度。
3. **湍流扩散**：RANS 只给平均场，需用随机游走或涡相互作用模型补充脉动；使用不同随机种子评估统计波动。
4. **壁面行为**：捕集、反弹、滑移、破碎或再悬浮需与物理场景一致；冲蚀需专门的冲蚀关联式。
5. **耦合策略**：先单向验证连续相，再开双向；负载很高时考虑四向（含颗粒碰撞）。
6. **时间步**：颗粒时间步应远小于单元穿越时间，避免颗粒"跳过"流场梯度。
7. **可重复性**：随机游走模型应固定随机种子并记录版本，保证不同并行核数与重复作业下统计可复现。

## 5. 可复现示例

下面用 Python 估算终端沉降速度与 Stokes 数，判断跟随性、曳力区与耦合需求。

```python
def terminal_velocity(dp, rho_p, rho_c, mu_c):
    return (rho_p - rho_c) * dp**2 * 9.81 / (18.0 * mu_c)

def relaxation_time(dp, rho_p, mu_c):
    return rho_p * dp**2 / (18.0 * mu_c)

dp = 80e-6                 # 80 微米
rho_p, rho_c, mu_c = 998.0, 1.2, 1.8e-5
ut = terminal_velocity(dp, rho_p, rho_c, mu_c)
Re_p = rho_c * dp * ut / mu_c
tau_p = relaxation_time(dp, rho_p, mu_c)
print("终端速度 ut = %.4f m/s, Re_p = %.2f" % (ut, Re_p))
print("松弛时间 tau_p = %.3e s, St = %.3f" % (tau_p, tau_p / 0.05))
```

若 $Re_p$ 超出 Stokes 区（约大于 1），需改用 Schiller–Naumann 曳力并按相对速度迭代求解，不能直接套用 Stokes 沉降公式。

## 6. 常见坑与排查

- **曳力区选错**：在 $Re_p$ 较大时仍用 Stokes 曳力，速度高估、沉积位置偏移。
- **样本量不足**：沉积率随机波动大，结论不稳。
- **忽略湍流扩散**：颗粒过度集中，混合与沉积被低估。
- **反馈量级忽视**：高负载下连续相剖面与湍流被高估。
- **颗粒越单元**：时间步过大，颗粒穿越多个单元，轨迹失真。
- **质量不闭合**：注入量不等于逃逸、捕集与域内之和。

## 7. 检查清单与参考

- [ ] 颗粒受力闭合是否与 $Re_p$、形状、浓度范围匹配？
- [ ] 是否做过样本独立性检查并报告统计不确定度？
- [ ] 湍流扩散模型与随机种子是否记录？
- [ ] 耦合方式与反馈量级是否匹配？
- [ ] 是否核验注入质量等于逃逸、捕集与域内存量之和？

参考：Crowe et al., *Multiphase Flows with Droplets and Particles*；Maxey & Riley, "Equation of Motion for a Small Rigid Sphere in a Nonuniform Flow," 1983。
