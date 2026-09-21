---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-momentum-equation-modeling
title: "动量方程离散：SPH 离散原理与适用边界"
summary: "对比 Monaghan 与 Colagrossi 两种成对对称压力项的守恒结构与密度比适用性，给出离散动量守恒的成对证明、变平滑长度破坏反对称的机理，以及负压区拉伸不稳定性的判据。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "动量方程离散"
  - "SPH 离散原理与适用边界"
  - "成对对称压力项"
  - "拉伸不稳定性"
seo:
  title: "动量方程离散：SPH 离散原理与适用边界"
  description: "对比 Monaghan 与 Colagrossi 两种成对对称压力项的守恒结构与密度比适用性，给出离散动量守恒的成对证明、变平滑长度破坏反对称的机理，以及负压区拉伸不稳定性的判据。"
  keywords:
    - "动量方程离散"
    - "SPH 离散原理与适用边界"
    - "成对对称压力项"
    - "拉伸不稳定性"
    - "核梯度反对称"
---

# 动量方程离散：SPH 离散原理与适用边界

动量方程的离散形式决定了三件事：离散线性动量是否严格守恒、界面两侧压力是否连续、以及负压区是否出现粒子聚簇。核心约束是压力项必须写成成对反对称形式，而这一点又与核梯度反对称性、平滑长度是否逐粒子变化直接耦合。本文比较两种主流成对压力项，给出守恒的成对证明与适用边界。

## 两种成对对称压力项的差别

Monaghan 形式的压力加速度为

$$
\frac{d\mathbf{v}_i}{dt}=-\sum_j m_j\left(\frac{p_i}{\rho_i^2}+\frac{p_j}{\rho_j^2}\right)\nabla_i W_{ij}+\mathbf{g}
$$

括号内两项在交换 $i,j$ 后完全不变，因此该形式对离散线性动量严格守恒，是单相弱可压缩 SPH 的默认选择。它在强冲击下能正确产生压力做功，但对密度比悬殊的界面会因 $\rho_i^2$ 与 $\rho_j^2$ 量级差过大而引入偏置。

Colagrossi 与 Morris 采用另一条等价路径：

$$
\frac{d\mathbf{v}_i}{dt}=-\sum_j m_j\frac{p_i+p_j}{\rho_i\rho_j}\nabla_i W_{ij}+\mathbf{g}
$$

在界面处 $p_i\approx p_j=p$，该式退化为 $-2p/(\rho_i\rho_j)\sum_j m_j\nabla_i W_{ij}$，两侧受力对称，压力连续性更容易保持。水-气这类密度比 $1000{:}1$ 的算例应优先选这一形式，代价是它对内部密度梯度更敏感。

## 离散动量守恒的成对证明

把内部压力力记作 $m_i\mathbf{a}_i^{\mathrm{int}}=-\sum_j m_i m_j A_{ij}\nabla_i W_{ij}$，其中 $A_{ij}=p_i/\rho_i^2+p_j/\rho_j^2$ 满足 $A_{ij}=A_{ji}$。对 $(i,j)$ 与 $(j,i)$ 两对求和：

$$
m_i m_j A_{ij}\nabla_i W_{ij}+m_j m_i A_{ji}\nabla_j W_{ij}=m_i m_j A_{ij}\left(\nabla_i W_{ij}+\nabla_j W_{ij}\right)=0
$$

最后一步用了核梯度反对称关系 $\nabla_j W_{ij}=-\nabla_i W_{ij}$，它只要求核是径向对称且两粒子用同一平滑长度。结论：只要每对粒子都按上式成对累加，$\sum_i m_i\mathbf{a}_i^{\mathrm{int}}=0$ 精确成立，净内力在浮点舍入内为零。

## 变平滑长度如何破坏反对称

自适应分辨率会让 $h$ 随密度变化，此时 $W_{ij}$ 对 $i$ 与 $j$ 不再对称：$\nabla_i W(r,h_i)\neq-\nabla_j W(r,h_j)$。工程上常用对称化 $\tilde h_{ij}=(h_i+h_j)/2$ 并把核梯度写成 $\nabla_i W_{ij}(\tilde h_{ij})$，恢复反对称性。若直接在两侧各用自己的 $h$，动量漂移会随运行时间线性累积，表现为整体缓慢平移，且无法通过减小时间步消除。诊断信号是净动量 $\sum_i m_i\mathbf{v}_i$ 随时间的单调漂移。

## 静水平衡的定量校核

动量方程在静水中必须精确平衡重力与压力梯度。解析条件为

$$
-\frac{1}{\rho_0}\nabla p=\mathbf{g}
$$

取 $\rho_0=998.2\ \mathrm{kg/m^3}$、$g=9.81\ \mathrm{m/s^2}$，则要求 $\nabla p=\rho_0 g=9793\ \mathrm{Pa/m}$，即每 $0.010\ \mathrm{m}$ 粒子间距对应压力差 $97.9\ \mathrm{Pa}$。深度 $0.4\ \mathrm{m}$ 处压力 $p=\rho_0 gH=3917\ \mathrm{Pa}$。若数值解在该处给出 $3917\ \mathrm{Pa}$ 但梯度符号相反，说明压力项前的负号或 $\nabla_i W_{ij}$ 的取向写反，是最常见的符号错误。

## 负压区与拉伸不稳定性

当核求和出现拉伸状态时，粒子会自发聚集成对，形成网格状伪结构，即拉伸不稳定性。Monaghan 给出的实用判据是检查压力极值与核梯度求和项：若运行中出现 $\min_i p_i<0$ 且伴随 $\left|\sum_j \nabla_i W_{ij}\right|$ 增大，则已进入不稳定区。工程上有三条出路：提高 $c_s$ 使 $\rho_i/\rho_0$ 不低于 $1$（Tait 状态方程在 $\rho_i\ge\rho_0$ 时才给出非负压力）、施加 Monaghan 应力正则化、或改用带背景压力的状态方程。取 $u_{\max}=2.80\ \mathrm{m/s}$、$c_s=30\ \mathrm{m/s}$，马赫数 $Ma=0.093$，密度波动约 $(u_{\max}/c_s)^2=0.87\%$，此时负压通常只出现在自由表面而非内部。

```
# 成对压力力累加（保证反对称）
for i in range(N):
    a[i] = g_vector.copy()
for i in range(N):
    for j in neighbors[i]:
        r  = x[i] - x[j]
        gw = gradW(r, h)
        A  = p[i]/rho[i]**2 + p[j]/rho[j]**2   # Monaghan
        a[i] -= m[j] * A * gw                  # j 一侧由邻居循环自动对称累加
        a[j] += m[i] * A * gw                  # 显式写另一侧，等价于反对称
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 整体缓慢平移、净动量漂移 | 变平滑长度破坏了核梯度反对称 | 监控 $\sum_i m_i\mathbf{v}_i$，比较对称化 $\tilde h_{ij}$ 前后 |
| 界面处压力出现跳变 | 用了 Monaghan 形式而密度比过大 | 换 Colagrossi 形式，检查界面 $\lvert p_i-p_j\rvert$ |
| 粒子自发聚集成网格状 | 负压区拉伸不稳定性 | 输出 $\min_i p_i$，确认是否低于 $0$ |
| 静水柱出现虚假加速度 | 压力项负号或核梯度取向写反 | 核对 $\nabla p$ 是否等于 $9793\ \mathrm{Pa/m}$ 且方向朝下 |
| 减小 $\Delta t$ 后动量漂移不减 | 误差来自空间离散而非时间积分 | 对比 $\Delta t$ 减半与 $\Delta p$ 减半的效果 |

## 参考

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, Vol. 30, 1992.
2. Monaghan J.J., *SPH without a tensile instability*, Journal of Computational Physics, Vol. 159, 2000.
3. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
4. Morris J.P., Fox P.J., Zhu Y., *Modeling low Reynolds number incompressible flows using SPH*, Journal of Computational Physics, Vol. 136, 1997.
5. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, Vol. 17, 2010.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
