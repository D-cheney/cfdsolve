---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-dem-particles-engineering-setup
title: "离散元与颗粒接触：工程设置与参数选择"
summary: "给出时间步长与刚度软化倍数的取值表、恢复系数与阻尼系数的换算、摩擦与滚动阻力参数、邻居列表与颗粒生成设置，并附单因素对照表、错误判定表和可复算的配置脚本。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 工程
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "离散元与颗粒接触"
  - "工程设置与参数选择"
  - "刚度软化"
  - "恢复系数"
seo:
  title: "离散元与颗粒接触：工程设置与参数选择"
  description: "给出时间步长与刚度软化倍数的取值表、恢复系数与阻尼系数的换算、摩擦与滚动阻力参数、邻居列表与颗粒生成设置，并附单因素对照表、错误判定表和可复算的配置脚本。"
  keywords:
    - "离散元"
    - "工程设置与参数选择"
    - "刚度软化"
    - "恢复系数"
    - "邻居列表"
---

# 离散元与颗粒接触：工程设置与参数选择

DEM 的参数设置有一条不可绕过的顺序：先按真实模量算时间步长，再判断这个步长能否承受目标颗粒数，不能承受才考虑刚度软化，并用重叠量上限约束软化倍数。把顺序颠倒（先随便软化再调步长）会让堆积结构失真，而且很难从结果上察觉。下面给出各参数的取值依据与对照设计。

## 时间步长与刚度软化

时间步长由 Rayleigh 波速判据给出，工程上取该值的 $0.2$ 倍：

$$
\Delta t=\alpha\,\Delta t_{\mathrm{Ray}},
\qquad
\Delta t_{\mathrm{Ray}}=\frac{\pi\,R\,\sqrt{\rho/G}}{0.876+0.163\,\nu},
\qquad
\alpha=0.2 .
$$

| 颗粒 | $R$ / mm | $\rho$ / (kg/m³) | $G$ / GPa | $\nu$ | $\Delta t_{\mathrm{Ray}}$ / μs | $\Delta t$ / μs |
|---|---|---|---|---|---|---|
| 玻璃珠 | 1.00 | 2500 | 26.2 | 0.23 | 1.062 | 0.212 |
| 玻璃珠 | 0.50 | 2500 | 26.2 | 0.23 | 0.531 | 0.106 |
| 石英砂 | 0.25 | 2650 | 29.0 | 0.20 | 0.261 | 0.052 |
| 钢球 | 5.00 | 7850 | 79.3 | 0.30 | 5.343 | 1.069 |

$\Delta t$ 与 $R$ 成正比：颗粒缩小 $4$ 倍，步长也缩小 $4$ 倍。$1\,\mathrm{s}$ 物理时间对 $R=1\,\mathrm{mm}$ 玻璃珠需要 $4.7\times10^{6}$ 步，对 $R=0.25\,\mathrm{mm}$ 石英砂需要 $1.9\times10^{7}$ 步。这是细颗粒问题必须软化的直接原因。

软化把弹性模量除以系数 $s$，步长放大 $\sqrt{s}$，重叠量放大 $s^{2/3}$。约束条件是重叠量不超过粒径的 $1\%$：

$$
\delta_{\max}/R<0.01\ \Rightarrow\ s<27\ \ (\text{钢球 }100\,\mathrm{N}\text{ 算例}),
$$

取 $s=20$ 时步长放大 $4.47$ 倍、重叠量放大 $7.37$ 倍，仍满足 $1\%$ 约束；取 $s=100$ 时重叠量放大 $21.5$ 倍，孔隙率与力链结构明显失真。软化倍数应作为可追溯的模型参数记录，并在报告中标明「刚度已软化 $s$ 倍」。

## 恢复系数与阻尼的标定

粘性阻尼与恢复系数由下式换算：

$$
e=\exp\!\left(-\frac{\pi\zeta}{\sqrt{1-\zeta^2}}\right).
$$

| $\zeta$ | 0.10 | 0.20 | 0.30 | 0.50 |
|---|---|---|---|---|
| $e$ | 0.729 | 0.527 | 0.372 | 0.163 |

实验测得 $e$ 后反算 $\zeta$，不要直接凭经验取 $\zeta$。玻璃珠的 $e$ 约 $0.9$（$\zeta\approx0.03$），湿砂的 $e$ 约 $0.3$（$\zeta\approx0.37$），钢球碰撞 $e$ 可达 $0.95$ 以上。阻尼只作用于法向相对速度，不能施加在绝对速度上，否则颗粒会整体减速。

## 摩擦与滚动阻力参数

| 材料 | $\mu_s$ | $\mu_r$ | 典型休止角 |
|---|---|---|---|
| 玻璃珠（球形、光滑） | 0.30 | 0.05 | $21^\circ$ |
| 玻璃珠（加滚动阻力） | 0.30 | 0.10 | $25^\circ$ |
| 石英砂（近似球形） | 0.50 | 0.20 | $29^\circ$ |
| 煤颗粒 | 0.60 | 0.30 | $33^\circ$ |

球形颗粒的 DEM 模型若不加滚动阻力，休止角只能到 $20^\circ$ 左右，远低于真实砂堆的 $30^\circ\sim35^\circ$，因为真实颗粒的棱角提供了抗转动能力。滚动摩擦系数 $\mu_r$ 是标定休止角的主控参数，其取值必须针对具体材料重新标定，上表的对应关系只在相同粒径分布与生成方式下成立。静摩擦系数 $\mu_s$ 主要影响堆积体的稳定性与起动条件，对休止角的影响次之。

## 邻居列表与颗粒生成设置

邻居列表的搜索半径与重建频率必须覆盖颗粒在一个重建周期内的最大位移：

$$
r_{\mathrm{skin}}\ge v_{\max}\,\Delta t\,n_{\mathrm{rebuild}},
\qquad
L_{\mathrm{cell}}\ge d_{\max}+r_{\mathrm{skin}} .
$$

取 $v_{\max}=1\,\mathrm{m/s}$、$\Delta t=0.212\,\mu\mathrm{s}$、每 $20$ 步重建一次，位移为 $4.24\times10^{-6}\,\mathrm{m}$，故 $r_{\mathrm{skin}}$ 取 $0.5\,\mathrm{mm}$ 有 $100$ 倍余量。网格边长 $L_{\mathrm{cell}}$ 必须大于最大颗粒直径加 $r_{\mathrm{skin}}$，否则同一对颗粒会跨格漏检。

颗粒生成阶段需要限制初始重叠：插入速率过快会让新颗粒与已落颗粒产生 $10\%$ 量级的重叠，瞬间释放的弹性能会把床层吹起。做法是设置最大允许插入重叠（一般取 $0.1R$），并在插入后执行 $1000\sim5000$ 步的松弛。颗粒数超过 $10^{6}$ 时还需开启并行域分解，并把域边界厚度设为大于 $d_{\max}$。

## 单因素对照与记录字段

| 对照项 | 固定量 | 变化量 | 观测量 |
|---|---|---|---|
| 时间步长比例 | 网格、物性 | $\alpha=0.1,0.2,0.4$ | 最大重叠量与总能量漂移 |
| 刚度软化倍数 | 步长比例 | $s=1,5,20,100$ | 孔隙率、底部压力、休止角 |
| 恢复系数 | 摩擦、几何 | $e=0.3,0.6,0.9$ | 弹跳高度与能量衰减曲线 |
| 滚动摩擦 | 其余摩擦参数 | $\mu_r=0.05,0.10,0.20$ | 休止角 |
| 邻居列表重建间隔 | 颗粒数 | $n=10,20,50$ 步 | 计算耗时与接触漏检次数 |

记录字段：颗粒数、粒径分布、$\rho$、$E$、$\nu$、软化倍数 $s$、$\Delta t_{\mathrm{Ray}}$ 与 $\Delta t$、$e$ 与 $\zeta$、$\mu_s$、$\mu_r$、$r_{\mathrm{skin}}$、重建间隔、生成速率与最大插入重叠、并行域数量。

## 设置错误的症状与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 颗粒在接触后穿透或飞出 | $\Delta t$ 超过 Rayleigh 判据 | 把 $\alpha$ 从 $0.4$ 降到 $0.1$，若最大重叠量下降即为步长问题 |
| 床层在生成阶段被吹起 | 初始插入重叠过大 | 统计插入后 $1000$ 步内的最大重叠，应低于 $0.1R$ |
| 休止角只有 $21^\circ$ 而实测 $32^\circ$ | 未设滚动摩擦 | 把 $\mu_r$ 从 $0$ 调到 $0.2$ 重算 |
| 计算耗时随颗粒数超线性增长 | 邻居列表重建间隔过小或 $r_{\mathrm{skin}}$ 过大 | 把重建间隔从 $5$ 步放宽到 $20$ 步，观察耗时 |
| 恢复系数实测值与设定不符 | 阻尼施加在绝对速度而非相对速度 | 用单颗粒弹跳算例测 $e$ 并与设定值对照 |
| 长时间模拟后总能量缓慢上升 | 软化倍数过大导致重叠量超限 | 统计最大 $\delta/R$，钢球算例应低于 $0.01$ |

## 可复算的配置脚本

```python
import math
ray = lambda R,rho,G,nu,a=0.2: a*math.pi*R*math.sqrt(rho/G)/(0.876+0.163*nu)
ez  = lambda z: math.exp(-math.pi*z/math.sqrt(1-z*z))
ze  = lambda e: -math.log(e)/math.sqrt(math.pi**2+math.log(e)**2)
for name,R,rho,G,nu in [("玻璃珠1.0mm",1e-3,2500,26.2e9,0.23),
                        ("石英砂0.25mm",0.25e-3,2650,29e9,0.20),
                        ("钢球5mm",5e-3,7850,79.3e9,0.30)]:
    print(f"{name:14s} dt_ray={ray(R,rho,G,nu,1.0)*1e6:6.3f}us "
          f"dt={ray(R,rho,G,nu)*1e9:7.1f}ns steps/1s={1/ray(R,rho,G,nu):.2e}")
print(round(ez(0.2),3), round(ze(0.527),3))
# 玻璃珠1.0mm    dt_ray= 1.062us dt=  212.5ns steps/1s=4.71e+06
# 石英砂0.25mm   dt_ray= 0.261us dt=   52.3ns steps/1s=1.91e+07
# 钢球5mm        dt_ray= 5.343us dt= 1068.6ns steps/1s=9.36e+05
# 0.527 0.2
```

## 参考文献

1. Cundall, P. A. & Strack, O. D. L. A discrete numerical model for granular assemblies. *Géotechnique*, 29(1): 47-65, 1979.
2. O'Sullivan, C. *Particulate Discrete Element Modelling: A Geomechanics Perspective*. Spon Press, 2011.
3. Tsuji, Y., Tanaka, T. & Ishida, T. Lagrangian numerical simulation of plug flow of cohesionless particles in a horizontal pipe. *Powder Technology*, 71(3): 239-250, 1992.
4. Zhu, H. P., Zhou, Z. Y., Yang, R. Y. & Yu, A. B. Discrete particle simulation of particulate systems: theoretical developments. *Chemical Engineering Science*, 62(13): 3378-3396, 2007.
5. Johnson, K. L. *Contact Mechanics*. Cambridge University Press, 1985.