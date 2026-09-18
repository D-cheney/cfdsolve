---
template_version: "flowlab-knowledge/1.0"
slug: multiphase-model-selection
title: CFD 多相流模型选择框架
summary: 从界面是否解析、分散相是否连续介质出发，在 VOF、Mixture、Euler–Euler 与 Euler–Lagrange 之间做选择，并给出 Stokes 数、耦合强度与相变判据。
category:
  slug: multiphase-flow
  name: 多相流与组分输运
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [多相流, VOF, Euler-Euler, Euler-Lagrange, 模型选择, 双向耦合]
seo:
  title: CFD 多相流模型选择框架｜CFD菜鸟
  description: 根据界面形态、相分数、Stokes 数与相间耦合强度选择 VOF、Mixture、Euler-Euler 或 Euler-Lagrange 方法。
  keywords: [多相流模型, VOF, Euler-Euler, DPM, Stokes 数]
---

# CFD 多相流模型选择框架

多相流建模的第一步不是选择软件里最"先进"的模型，而是回答两个前置问题：相界面是否需要被显式解析；分散相能否被当作统计连续介质处理。这两个答案基本决定方法族（VOF、Mixture、Euler–Euler、Euler–Lagrange），而子模型闭合、网格分辨率与时间步要求都由此推导。选型错了，后续再精细的网格与格式也无法补救。

## 1. 结论与适用场景

- **VOF（界面捕捉）**：适合可分辨的大尺度连续界面，如自由液面、溃坝、波浪、射流断裂与液滴合并；界面拓扑位于网格尺度以上，且表面张力与壁面接触角重要。
- **Mixture / 漂移流**：适合相间滑移较弱、只关心混合物整体输运与相含率分布的工况；成本最低，但界面被数值扩散抹平。
- **Euler–Euler（双流体）**：适合两相均按连续介质统计描述、各相体积分数都不可忽略的场景，如鼓泡塔、气固流化床、稠密气液管流；需要相间曳力、相内应力和湍流闭合。
- **Euler–Lagrange（DPM / 颗粒追踪）**：适合分散相体积分数较低（一般 $\alpha_d \leq 10^{-2}$）、且轨迹、停留时间、沉积与粒径分级重要的场景，如喷雾、旋风分离与气力输送稀相段。

当同一设备跨越稀相与稠密区时，应分区选型，或采用稠密离散相（DDPM）与模型切换策略，而不是用单一模型覆盖全域。选型不是二选一，而是"哪一段用哪种描述"的组合问题。

## 2. 物理与数学基础

多相流的共性是相体积分数守恒与相间交换。无论哪种方法，都从一个约束出发：各相体积分数之和为 1。

$$
\sum_{q=1}^{N} \alpha_q = 1
$$

混合物物性由相分数加权，例如混合物密度与黏度为

$$
\rho_m = \sum_{q=1}^{N} \alpha_q \rho_q, \qquad \mu_m = \sum_{q=1}^{N} \alpha_q \mu_q
$$

单相动量方程在加入表面张力与相间作用后成为多相动量方程：

$$
\frac{\partial (\rho \mathbf{u})}{\partial t} + \nabla \cdot (\rho \mathbf{u} \mathbf{u}) = -\nabla p + \nabla \cdot \boldsymbol{\tau} + \rho \mathbf{g} + \mathbf{f}_\sigma
$$

其中 $\mathbf{f}_\sigma$ 为表面张力体积力。区分方法的关键是无量纲弛豫时间比，即 Stokes 数：

$$
St = \frac{\tau_p}{\tau_f}, \qquad \tau_p = \frac{\rho_p d_p^{2}}{18 \mu_c}
$$

当 $St \ll 1$ 时颗粒紧跟流体，可用 Mixture 或漂移流近似；当 $St \sim 1$ 时滑移显著，需要 Euler–Lagrange 或多流体描述；分散相体积分数升高后，颗粒间碰撞与相内应力不可忽略，必须转向 Euler–Euler。

## 3. 关键方程与公式

相间耦合强度由动量传递决定。单颗粒曳力为

$$
\mathbf{F}_D = \frac{1}{2} C_D \rho_c A_p |\mathbf{u}_c - \mathbf{u}_p| (\mathbf{u}_c - \mathbf{u}_p)
$$

其中 $C_D$ 为曳力系数，随颗粒 Reynolds 数变化；$A_p$ 为迎流面积。在 Euler–Euler 中，对应的相间动量交换项为

$$
\mathbf{M}_q = \frac{\alpha_q \rho_q}{\tau_q}(\mathbf{u}_r - \mathbf{u}_q)
$$

是否需要双向耦合，可用颗粒对流体动量的反馈量级判断：当 $\alpha_d \rho_d / \rho_c$ 达到百分之几时，单向耦合误差已经明显。对空化、汽蚀等相变问题，压力与相分数强耦合，空化数定义为

$$
\sigma = \frac{p_{ref} - p_v}{\frac{1}{2} \rho U^{2}}
$$

当局部压力接近饱和蒸气压 $p_v$ 时，液体可能汽化。可见一次完整的选型必须同时覆盖"动量耦合"与"相变传质"两类物理。

## 4. 工程做法与参数

1. **网格**：VOF 需在界面处加密并控制界面 Courant 数；Euler–Euler 要解析相含率梯度；拉格朗日需保证单元穿越时间远大于颗粒时间步。
2. **时间步**：界面输运、颗粒追踪与相变各有独立限制，不能互相挪用；空化与自由液面通常要求瞬态计算。
3. **闭合模型**：曳力、升力、湍流扩散、破碎聚并、传热相变须与粒径、Re、We 和体积分数范围匹配，不能把软件默认值当作已验证参数。
4. **耦合策略**：稀相先用单向耦合验证连续相，再开启双向耦合；高浓度考虑四向耦合与颗粒应力闭合。
5. **物性**：密度、黏度、表面张力、蒸气压须与温度一致，压力统一使用绝对压力。

## 5. 可复现示例

下面用一段无外部依赖的 Python 脚本，按相分数、Stokes 数与动量反馈量级给出初步选型建议，可直接运行。

```python
def select_model(alpha_d, stokes, feedback):
    if alpha_d <= 1e-2 and stokes > 0.1:
        base = "Euler-Lagrange (DPM)"
    elif alpha_d > 1e-2:
        base = "Euler-Euler (双流体) 或 DDPM"
    else:
        base = "Mixture/漂移流 (滑移弱)"
    coup = "双向/四向耦合" if feedback > 0.01 else "单向耦合"
    return base + " | " + coup

cases = [
    (0.001, 2.0, 0.002),   # 稀相、大滑移
    (0.005, 0.5, 0.010),   # 中等滑移
    (0.150, 5.0, 0.300),   # 稠密相
]
for a, st, rr in cases:
    print("alpha_d=%.3f St=%.1f ratio=%.3f -> %s"
          % (a, st, rr, select_model(a, st, rr)))
```

预期输出会区分稀相高 Stokes 的 DPM 与稠密相的 Euler–Euler，并按反馈量级提示单向或双向耦合。把该脚本接入工况表，即可批量给出候选方法。

## 6. 常见坑与排查

- **用 VOF 算稠密气泡群**：界面无法逐气泡解析，结果退化为假混合。
- **用 DPM 算高体积分数**：忽略碰撞与相内应力，相含率与压降失真。
- **忽略颗粒反馈**：负载较高时连续相速度剖面与湍流被高估。
- **网格与时间步不匹配**：界面数值扩散导致假混合；颗粒越单元使统计不收敛。
- **把软件默认子模型当验证值**：曳力与破碎系数需按基准校准。
- **绝对压力与表压混用**：空化与可压缩问题会直接出错。

## 7. 检查清单与参考

- [ ] 是否明确回答"界面是否解析""是否连续介质"两个前置问题？
- [ ] 是否监控各相分数之和与每相质量守恒？
- [ ] 耦合方式（单向/双向/四向）是否有量级依据？
- [ ] 子模型参数是否用基准实验校准并记录？
- [ ] 网格与时间步是否满足所选方法的独立限制？

参考：Crowe et al., *Multiphase Flows with Droplets and Particles*；Ishii & Hibiki, *Thermo-Fluid Dynamics of Two-Phase Flow*；Brennen, *Fundamentals of Multiphase Flow*。
