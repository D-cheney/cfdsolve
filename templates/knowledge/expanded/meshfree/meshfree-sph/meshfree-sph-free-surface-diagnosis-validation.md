---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-sph-free-surface-diagnosis-validation
title: "自由表面识别：结果诊断与可信度验证"
summary: "用溃坝前沿的自由落体解析极限、表面标记数与连通分量统计三项独立证据审查自由表面识别，给出假阳性与假阴性的区分试验、γ_i 与 ∇·r 的读数区间以及判定阈值。"
category:
  slug: meshfree-sph
  name: "无网格法 · SPH 理论与实现"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "无网格法"
  - "无网格法 · SPH 理论与实现"
  - "自由表面识别"
  - "结果诊断与可信度验证"
  - "溃坝基准"
  - "连通分量"
seo:
  title: "自由表面识别：结果诊断与可信度验证"
  description: "用溃坝前沿的自由落体解析极限、表面标记数与连通分量统计三项独立证据审查自由表面识别，给出假阳性与假阴性的区分试验、γ_i 与 ∇·r 的读数区间以及判定阈值。"
  keywords:
    - "自由表面识别"
    - "结果诊断与可信度验证"
    - "溃坝基准"
    - "连通分量"
    - "假阳性"
---

# 自由表面识别：结果诊断与可信度验证

自由表面判据会朝两个相反方向失效：把内部粒子误标为表面（假阳性）会强制该处 $p=0$，在流体内部撕出虚假空腔；漏掉真实表面粒子（假阴性）则让核截断造成的密度亏损与负压继续存在。两者的宏观表现都是粒子飞散，但修正方向相反，所以必须先分开。本文用溃坝前沿的解析极限、表面标记数区间与连通分量统计三项独立证据完成区分。

## 判据本身给出的两个读数

二维常用归一化位置散度作为表面指标：

$$
\gamma_i=\frac{1}{d}\sum_j V_j\,\mathbf{r}_{ij}\cdot\nabla_i W_{ij}
$$

其中 $d=2$ 为空间维数，$\mathbf{r}_{ij}=\mathbf{x}_i-\mathbf{x}_j$。$\gamma_i$ 等价于对常数场做差值近似的散度，内部粒子邻域完整时为 1.00，平面自由面上约 0.50，孤立粒子趋近 0。取 $\Delta p=0.010\ \mathrm{m}$、$h=1.2\Delta p=0.012\ \mathrm{m}$、$r_c=2h=0.024\ \mathrm{m}$，则二维内部邻居数约 $\pi r_c^2/\Delta p^2=18$，表面粒子只剩约一半，因此 $\gamma_i\approx0.5$ 的判据是几何必然而非经验值。

第二个读数是散度判据本身：$(\nabla\cdot\mathbf{r})_i$ 在二维内部为 2.00，在平面表面为 1.00。两个读数应当在多数粒子上一致；若 $\gamma_i$ 已降到 0.70 而 $(\nabla\cdot\mathbf{r})_i$ 仍为 1.85，说明该处处于拉伸区，粒子间距已被拉大——这是区分"真表面"与"拉伸稀疏"的关键。

## 溃坝前沿的自由落体解析极限

水柱在初期尚未受到底部反压显著影响时，前沿近似自由落体。用无量纲时间 $\tau=t\sqrt{2g/a}$，前沿位置满足

$$
\frac{x}{a}=\frac{\tau^2}{4},\qquad \tau=t\sqrt{\frac{2g}{a}}
$$

取水柱宽 $a=0.2\ \mathrm{m}$、高 $H=0.4\ \mathrm{m}$、$g=9.81\ \mathrm{m/s^2}$。在 $t=0.1\ \mathrm{s}$ 时 $\tau=0.1\times\sqrt{2\times9.81/0.2}=0.1\times9.9045=0.990$，于是 $x/a=0.990^2/4=0.2452$，即前沿推进 $x=0.0491\ \mathrm{m}$。对同一时刻求导得前沿速度 $\dot x=0.2\times0.990\times9.9045/2=0.980\ \mathrm{m/s}$，与自由落体速度 $gt=0.981\ \mathrm{m/s}$ 在三位有效数字内一致——这正是该极限自洽的证据。

数值前沿若慢于 0.049 m，说明表面被误判为固壁或耗散过强；若快于该值，说明有非物理斥力在推粒子。这是不需要实验数据就能执行的第一步检查。

## 表面标记数与几何预期

二维水柱 $0.2\ \mathrm{m}\times0.4\ \mathrm{m}$、$\Delta p=0.010\ \mathrm{m}$ 共 $20\times40=800$ 个粒子。单粒子质量 $m_i=\rho_0\Delta p^2=998.2\times1.0\times10^{-4}=0.09982\ \mathrm{kg/m}$，总质量 $800\times0.09982=79.856\ \mathrm{kg/m}$，与解析值 $\rho_0 aH=998.2\times0.2\times0.4=79.856\ \mathrm{kg/m}$ 逐位相符，可作为初始化的独立校核。

自由表面粒子数按几何估算：初始只有上表面 $0.2\ \mathrm{m}$ 参与，故约 $0.2/0.010=20$ 个，加一圈过渡层后应标记 40~60 个。判据是标记数始终落在几何表面粒子数的 1.5~3 倍之间。若在 $t=0.2\ \mathrm{s}$ 就跳到 200 以上，即为假阳性爆发，通常同时伴随拉伸区 $\gamma_i$ 骤降到 0.4 以下。

## 连通分量统计

按 $r_c$ 邻域连通性给粒子分组，统计团簇数与最大团簇占比。健康溃坝在 $t<1.0\ \mathrm{s}$ 内应保持单连通，最大团簇占比超过 99%。若在 $t=0.3\ \mathrm{s}$ 出现 5 个以上团簇、最大团簇占比掉到 80%，说明表面识别或压力条件在制造断裂。区分试验：关闭表面张力后复跑，碎片消失则根因是表面张力施加位置错误；碎片依旧则根因是假阳性 $p=0$。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 前沿慢于 0.049 m | 表面被误判为固壁或耗散过强 | 比较 $t=0.1\ \mathrm{s}$ 的 $x/a$ 与 0.245 |
| 前沿快于 0.049 m | 非物理斥力推动粒子 | 关闭人工黏性后复跑，看前沿是否回落 |
| 表面标记数超过 200 | 拉伸区假阳性 | 联合输出 $\gamma_i$ 与 $(\nabla\cdot\mathbf{r})_i$ 分布 |
| 0.3 s 内出现 5 个以上团簇 | 表面张力位置错误或假阳性 $p=0$ | 关表面张力复跑，观察碎片是否消失 |
| 孤立液滴被标为内部 | 判据只看邻域完整性，不看连通性 | 做连通分量分析，检查最大团簇占比 |
| 表面压力恒为 0 但密度正常 | 判据阈值过紧，标记数为零 | 统计标记粒子数，与 40~60 区间比较 |
| 初始即出现负压 | 初始化后未做松弛 | 先跑 0.05 s 稳定化再开始统计前沿位置 |

## 诊断脚本

```python
import numpy as np
from collections import deque

def gamma_i(rij, gradW, V, d=2):
    # gamma_i = (1/d) * sum_j V_j (r_j - r_i) . grad_i W_ij
    return sum(V[j] * np.dot(rij[j], gradW[j]) for j in range(len(V))) / d

def clusters(x, rc):
    n = len(x)
    seen = [False] * n
    groups = []
    for s in range(n):
        if seen[s]:
            continue
        q, comp = deque([s]), []
        seen[s] = True
        while q:
            i = q.popleft()
            comp.append(i)
            for j in range(n):
                if not seen[j] and np.linalg.norm(x[i] - x[j]) < rc:
                    seen[j] = True
                    q.append(j)
        groups.append(comp)
    sizes = sorted((len(c) for c in groups), reverse=True)
    return len(groups), sizes[0] / n      # 目标: 1 个团簇, 占比 > 0.99

def front_check(a, H, g, t, x_num):
    tau = t * np.sqrt(2 * g / a)          # 0.990 at t = 0.1 s
    x_ref = a * tau**2 / 4                # 0.0491 m
    return dict(x_ref=x_ref, x_num=x_num,
                slow=x_num < 0.9 * x_ref, fast=x_num > 1.1 * x_ref)
```

脚本的三个输出对应三项证据：`clusters` 返回团簇数应为 1、最大占比应大于 0.99；`front_check` 的 `x_ref` 应为 0.0491 m；标记粒子数用 `gamma_i` 逐粒子算完后计数，应落在 40~60。任何一项越界，先用另外两项判断是假阳性还是假阴性，再决定收紧还是放松阈值。

## 参考

1. Martin J.C., Moyce W.J., *An experimental study of the collapse of liquid columns on a rigid horizontal plane*, Philosophical Transactions of the Royal Society A, Vol. 244, 1952.
2. Marrone S., Colagrossi A., Le Touzé D., Graziani G., *Fast free-surface detection and level-set definition in SPH*, Computer Physics Communications, Vol. 181, 2010.
3. Colagrossi A., Landrini M., *Numerical simulation of interfacial flows by smoothed particle hydrodynamics*, Journal of Computational Physics, Vol. 191, 2003.
4. Antuono M., Colagrossi A., Marrone S., Molteni D., *Free-surface flows solved by means of SPH schemes with numerical diffusive terms*, Computer Physics Communications, Vol. 181, 2010.
5. Violeau D., Rogers B.D., *Smoothed particle hydrodynamics (SPH) for free-surface flows: past, present and future*, Journal of Hydraulic Research, Vol. 54, 2016.
6. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, Vol. 17, 2010.
