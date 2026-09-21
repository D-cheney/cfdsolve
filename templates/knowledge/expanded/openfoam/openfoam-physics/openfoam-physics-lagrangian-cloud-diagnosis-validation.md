---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-physics-lagrangian-cloud-diagnosis-validation
title: "拉格朗日颗粒云：结果诊断与可信度验证"
summary: "用颗粒质量平衡、parcel 统计收敛性与穿透长度判据审查拉格朗日结果，给出体积分数与耦合方式、弛豫时间与停留时间对照的量化阈值和诊断流程。"
category:
  slug: openfoam-physics
  name: "OpenFOAM 物理模型"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 物理模型"
  - "拉格朗日颗粒云"
  - "结果诊断与可信度验证"
  - "parcel 统计收敛"
  - "穿透长度"
seo:
  title: "拉格朗日颗粒云：结果诊断与可信度验证"
  description: "用颗粒质量平衡、parcel 统计收敛性与穿透长度判据审查拉格朗日结果，给出体积分数与耦合方式、弛豫时间与停留时间对照的量化阈值和诊断流程。"
  keywords:
    - "拉格朗日颗粒云"
    - "结果诊断与可信度验证"
    - "parcel 统计收敛"
    - "穿透长度"
    - "双向耦合"
---

# 拉格朗日颗粒云：结果诊断与可信度验证

拉格朗日结果的最大风险是"看起来有颗粒、统计上不可信"：parcel 数太少导致浓度场全是噪声，或者弛豫时间远大于停留时间导致颗粒根本没跟上流场。诊断要回答三个问题：颗粒质量守恒吗？统计量收敛了吗？当前耦合方式与体积分数匹配吗？

## 质量平衡：颗粒相的第一约束

拉格朗日云不求解连续性方程，颗粒质量守恒完全依赖注入与消失逻辑。定义累积不平衡

$$\epsilon_m=\frac{\left|\dot m_{inj}t-\sum_{parcels}m_p N_p-\dot m_{esc}t-\dot m_{dep}t\right|}{\dot m_{inj}t}$$

以 $\dot m_{inj}=1.0\times10^{-2}\ \mathrm{kg/s}$、$t=1\ \mathrm{s}$、$m_p=5.24\times10^{-10}\ \mathrm{kg}$ 为例，若 `nParticle` 为 $1\times10^{5}$，注入的颗粒总数为 $1.91\times10^{7}$，对应 191 个 parcel。收敛后 $\epsilon_m$ 应低于 $10^{-4}$。若在 $10^{-2}$ 量级，通常是颗粒碰到壁面后被 `escape` 而未计入沉积，或 `patchInteractionModel` 设为 `none` 导致颗粒被静默删除。

```python
# 从 postProcessing/cloudInfo 或颗粒场统计中核对质量平衡
m_p   = 1000 * 3.14159265/6 * (1e-4)**3      # kg, 单颗粒质量
nP    = 1.0e5                                # 每个 parcel 的颗粒数
n_par = 191                                  # 预期 parcel 数
m_inj = 0.01                                 # kg, massTotal
m_cld = n_par * nP * m_p
print("cloud mass = %.6e kg, imbalance = %.2e" % (m_cld, abs(m_cld-m_inj)/m_inj))
# 统计相对误差 ~ 1/sqrt(N)
for N in (100, 1000, 10000):
    print("N=%6d  rel.err=%.1f%%" % (N, 100/ N**0.5))
```

## parcel 数的统计收敛性

拉格朗日方法对 parcel 做蒙特卡洛采样，任意统计量的相对误差按 $1/\sqrt{N}$ 衰减：

$$\varepsilon_N\approx\frac{1}{\sqrt{N_{parcels}}}$$

$N=100$ 时误差 10.0%，$N=1000$ 时 3.2%，$N=10000$ 时 1.0%。若你的目标是用颗粒浓度场做定量判断（例如沉积率误差小于 5%），parcel 数至少需要 $N=400$；若只做定性可视化，100 个也够。这个判据与网格无关——加密网格不会降低统计噪声，只有增加 parcel 数才会。

诊断方法是把 `nParticle` 从 $10^{5}$ 降到 $10^{4}$ 再降 $10^{3}$，同一时刻的颗粒浓度场做面积加权平均，看均值是否稳定在 ±1% 内。若均值随 parcel 数单调漂移，说明采样尚未收敛。

## 穿透长度与弛豫时间的对照

颗粒能否跟上流场，取决于弛豫时间与停留时间之比：

$$\tau_p=\frac{\rho_p d_p^{2}}{18\mu},\qquad L_{pen}=U_0\tau_p,\qquad \tau_{res}=\frac{L_{domain}}{U}$$

100 μm 水滴在空气中 $\tau_p=3.09\times10^{-2}\ \mathrm{s}$。以 $U_0=10\ \mathrm{m/s}$ 注入，穿透长度 $L_{pen}=10\times3.09\times10^{-2}=0.309\ \mathrm{m}$。若计算域只有 0.2 m，停留时间 $\tau_{res}=0.2/10=0.02\ \mathrm{s}$ 小于 $\tau_p$，颗粒在出口处速度仍是初速度的 $\exp(-0.02/0.0309)=0.52$ 倍，即 5.2 m/s，远未与流场平衡。

这种情况下所有"颗粒跟随流场"的假设都不成立，必须保留 `gravity` 与准确的 `U0`，并且不能用平衡欧拉法替代。反过来，10 μm 颗粒 $\tau_p=3.09\times10^{-4}\ \mathrm{s}$，$\tau_{res}/\tau_p=65$，出口速度已是初值的 $e^{-65}\approx0$，跟随性良好。

## 体积分数决定耦合方式

颗粒相对流体的体积分数 $\alpha_p$ 决定是否需要双向耦合：

$$\alpha_p=\frac{\dot m_{inj}}{\rho_p U A}=\frac{1.0\times10^{-2}}{1000\times10\times7.854\times10^{-3}}=1.27\times10^{-4}$$

$\alpha_p<10^{-6}$ 时单向耦合即可；$10^{-6}<\alpha_p<10^{-3}$ 时双向耦合影响在 1%～10%，建议打开 `coupled`；$\alpha_p>10^{-3}$ 时必须用四向耦合并考虑颗粒碰撞。本算例 $1.27\times10^{-4}$ 落在第二档，打开 `coupled` 是正确选择，但不应期待相间动量交换带来超过 10% 的流场改变。若打开 `coupled` 后流场速度变化了 50%，说明 `sourceTerms` 的 `explicit` 系数设置不当，动量被重复计入。

## 诊断量与阈值

| 诊断量 | 提取方式 | 合格阈值 |
|---|---|---|
| 颗粒质量不平衡 | 注入量减云内量与逃逸量 | $<10^{-4}$ |
| parcel 统计误差 | $1/\sqrt{N_{parcels}}$ | 目标精度决定，$\ge400$ 个 |
| 弛豫/停留时间比 | $\tau_p/\tau_{res}$ | $<0.1$ 才算跟随良好 |
| 体积分数 | $\dot m/(\rho_p UA)$ | 与耦合方式匹配 |
| 出口颗粒速度 | 面积加权平均 $|\mathbf{U}_p|$ | 与 $U_0e^{-t/\tau_p}$ 对比 |
| 沉积率 | 壁面沉积质量 / 注入质量 | 与实验偏差 $<20\%$ |
| 单步 parcel 数 | 求解日志 | 无突变，避免单步超 $10^{5}$ |

```cpp
// system/controlDict
functions
{
    cloudStats
    {
        type            cloudInfo;
        libs            ("liblagrangianFunctionObjects.so");
        clouds          (spray);
        writeControl    timeStep;
        writeInterval   20;
    }
    particleCount
    {
        type            fieldMinMax;
        libs            ("libfieldFunctionObjects.so");
        fields          (alpha.spray);
        writeControl    writeTime;
    }
}
```

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 浓度场布满噪声斑点 | parcel 数不足 | 把 `nParticle` 降 10 倍看均值是否漂移 |
| 颗粒质量随时间持续减少 | 壁面 `patchInteractionModel` 设为 `none` | 统计逃逸与沉积质量之和 |
| 颗粒全程速度不变 | $\tau_{res}\ll\tau_p$，域太短 | 计算 $L_{pen}$ 与域长对比 |
| 打开双向耦合后流场剧变 | `sourceTerms` 系数重复计数 | 把 `explicit` 系数从 1 降到 0.5 对比 |
| 颗粒在注入面堆积 | `parcelsPerSecond` 过大导致单步过多 | 降低注入率并观察单步耗时 |
| 沉积率比实验高 2 倍 | 壁面恢复系数或捕集判据不合理 | 用 `standardWallInteraction` 的 `e` 与 `mu` 做敏感性 |
| 颗粒相体积分数超 1e-2 | 注入率或粒径设置量级错误 | 用 $\alpha_p$ 公式反算并核对 `massTotal` |

## 参考文献

1. Balachandar S., Eaton J.K., "Turbulent Dispersed Multiphase Flow," Annual Review of Fluid Mechanics, 2010.
2. Sommerfeld M., van Wachem B., Oliemans R., Best Practice Guidelines for Computational Fluid Dynamics of Dispersed Multi-Phase Flows, ERCOFTAC, 2008.
3. Elghobashi S., "On Predicting Particle-Laden Turbulent Flows," Applied Scientific Research, 1994.
4. Maxey M.R., Riley J.J., "Equation of Motion for a Small Rigid Sphere in a Nonuniform Flow," Physics of Fluids, 1983.
5. Gosman A.D., Ioannides E., "Aspects of Computer Simulation of Liquid-Fueled Combustors," Journal of Energy, 1981.
