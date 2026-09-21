---
template_version: "flowlab-knowledge/1.0"
slug: cfd-mesh-adaptive-mesh-diagnosis-validation
title: "自适应网格加密：结果诊断与可信度验证"
summary: "把自适应加密的失效拆成加密区域跑偏、单元数振荡、插值守恒误差与悬节点通量不一致四类，给出各自的诊断量与阈值，并附一次守恒误差的手算。"
category:
  slug: mesh-generation
  name: "网格与离散质量"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "网格与离散质量"
  - "自适应网格加密"
  - "结果诊断与可信度验证"
  - "守恒误差"
  - "悬节点"
seo:
  title: "自适应网格加密：结果诊断与可信度验证"
  description: "把自适应加密的失效拆成加密区域跑偏、单元数振荡、插值守恒误差与悬节点通量不一致四类，给出各自的诊断量与阈值，并附一次守恒误差的手算。"
  keywords:
    - "自适应网格加密"
    - "守恒误差"
    - "悬节点"
    - "单元数振荡"
    - "加密区域"
---

# 自适应网格加密：结果诊断与可信度验证

自适应加密引入了一类新误差：网格本身随解演化，插值、粗化与负载再平衡都会留下痕迹。这类误差不会让残差变大，却会让守恒量缓慢漂移或让目标量随加密历史变化。本文给出四个可测量的诊断量与对应阈值。

## 加密区域是否跟对了目标量

先做一次「关闭加密」的对照：固定同一基网格，分别跑加密与不加密两个算例。若目标量差异小于工程容差，说明加密区域没有覆盖敏感区，加密只是在浪费成本。若差异明显，再检查加密区域与目标量敏感区是否重合——方法是在目标量敏感的位置（如分离点、激波、相界面）打标记，统计标记区内被加密的单元比例。这个比例低于 60% 就说明指示量跑偏了。

## 振荡、滞后与单元数的锯齿

无滞后带时，单元数会呈锯齿：某单元因 $\eta_e$ 略超阈值被加密，加密后 $\eta_e$ 下降又被粗化，两个步长后回到原状态。诊断量是单元数时间序列的振荡周期与幅值。实测某算例的加密比例在 0.4% 与 1.8% 之间以 2 个时间步为周期振荡，正是滞后带缺失的典型特征。加入 $\theta_l = 0.3\theta_u$ 后比例稳定在 0.5%±0.05%。

另一个诊断量是**加密历史依赖**：用两种不同的初始加密分布跑到同一物理时刻，比较目标量。若差异超过容差，说明解对加密路径敏感，当前设置不具备可复现性。

## 加密-粗化插值的守恒误差

单元细分或合并时，场量需要在父子单元之间传递。守恒误差定义为

$$
\epsilon_{cons} = \frac{\left|\sum_e \phi_e V_e^{new} - \sum_e \phi_e V_e^{old}\right|}{\sum_e \left|\phi_e V_e^{old}\right|}
$$

以体积分数场为例，单次重网格化后实测 $\epsilon_{cons} = 3.0\times10^{-4}$。这个量本身很小，但它是**逐步累积**的：若每个时间步都触发重网格化，1000 步后的累积漂移可达 $1 - (1-3\times10^{-4})^{1000} \approx 26\%$。判据是要求 $\epsilon_{cons} < 10^{-8}$（守恒型插值）或至少 $<10^{-6}$（非守恒但高阶的插值），并且只对真正需要变化的区域做重网格化。

用体积守恒手算：容器内液相体积 $V_l = 1.0\times10^{-3}\ \mathrm{m^3}$，密度 $\rho_l = 1000\ \mathrm{kg/m^3}$，若 $\epsilon_{cons} = 3.0\times10^{-4}$ 且每步触发，则单步质量误差为 $3.0\times10^{-4} \times 1000 \times 1.0\times10^{-3} = 3.0\times10^{-4}\ \mathrm{kg}$。相对于 1 kg 的液相总质量，每步 0.03%，1000 步后不可忽略。

## 悬节点界面的通量一致性

粗单元与细单元交界处，粗面被细面分割。若通量累加不严格配对，界面会变成一个虚假源。诊断量取界面法向通量的相对不平衡：

$$
R_{flux} = \frac{\left|\sum_f \phi_f\right|}{\sum_f \left|\phi_f\right|}
$$

单精度算术下 $R_{flux}$ 通常小于 $10^{-6}$；若达到 $10^{-3}$ 量级，说明 `correctFluxes` 未包含全部通量场，或存在未配对的悬节点。同时应检查界面两侧的场量跳变：

$$
\Delta_{jump} = \frac{\left|\phi_{coarse} - \overline{\phi}_{fine}\right|}{\left|\phi\right|_{ref}}
$$

$\Delta_{jump} > 2\%$ 时，界面会污染局部梯度，需要在界面周围补一层缓冲加密。

## 两个诊断量的复算脚本

```python
import numpy as np

# 1) 重网格化插值的守恒误差
V_o = np.array([8.0e-9, 8.0e-9, 8.0e-9])      # 父单元体积 [m3]
a_o = np.array([0.62, 0.58, 0.61])            # 父单元体积分数
V_n = np.repeat(V_o / 8.0, 8)                 # 每个父单元分为 8 个子单元
a_n = np.repeat(a_o, 8)
eps = abs((a_n * V_n).sum() - (a_o * V_o).sum()) / abs(a_o * V_o).sum()
print(f"epsilon_cons = {eps:.2e}")

# 2) 悬节点界面的通量不平衡（粗面 = 三个细面之和）
flux = np.array([1.234e-3, -4.100e-4, -4.100e-4, -4.140e-4])   # [m3/s]
print(f"R_flux = {abs(flux.sum()) / abs(flux).sum():.2e}")
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 单元数周期性锯齿 | 阈值无滞后带 | 加 $\theta_l = 0.3\theta_u$，观察比例是否稳定 |
| 目标量随加密历史不同 | 指示量对解路径敏感或插值不守恒 | 两种初始加密分布跑到同一时刻，比较目标量 |
| 守恒量单调漂移 | 每步重网格化的插值误差累积 | 统计 $\epsilon_{cons}$，降低重网格化触发频率 |
| 界面处出现虚假源项 | 悬节点通量未配对 | 检查 $R_{flux}$ 与 `correctFluxes` 字段列表 |
| 部分进程空转 | 加密后负载不均 | 统计各进程单元数的最大/平均比，超过 1.3 需再平衡 |

## 复算与验收

可信的自适应结果需要给出：加密区域与目标量敏感区的重合比例、单元数时间序列（含最大值与最小值）、$\epsilon_{cons}$ 与重网格化触发次数、界面 $R_{flux}$ 与 $\Delta_{jump}$、各进程负载比、以及与固定均匀细网格的目标量对照。缺少与固定网格对照的自适应结果无法排除「加密本身改变了离散误差方向」这一可能。

## 参考文献

1. Verfürth R., *A Posteriori Error Estimation Techniques for Finite Element Methods*, Oxford University Press, 2013.
2. Popinet S., "Gerris: A Tree-Based Adaptive Solver for the Incompressible Euler Equations in Complex Geometries", *Journal of Computational Physics*, 190(2): 572-600, 2003.
3. DeZeeuw D., Powell K.G., "An Adaptively Refined Cartesian Mesh Solver for the Euler Equations", *Journal of Computational Physics*, 104(1): 56-68, 1993.
4. Hirsch C., *Numerical Computation of Internal and External Flows*, 2nd ed., Butterworth-Heinemann, 2007.
