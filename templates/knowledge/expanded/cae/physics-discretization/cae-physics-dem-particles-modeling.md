---
template_version: flowlab-knowledge/1.0
slug: cae-physics-dem-particles-modeling
title: 离散元与颗粒接触：原理、设置与验证
summary: >-
  从软球模型的控制方程出发给出 Hertz-Mindlin 接触力与重叠量的解析关系、Rayleigh
  波速时间步判据的推导与取值、刚度软化的上限约束，以及硬球与软球模型的切换条件。
category:
  slug: physics-discretization
  name: 跨物理场离散算法
level: 进阶
reading_minutes: 27
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 跨物理场离散算法
  - 离散元与颗粒接触
  - 离散原理与适用范围
  - Hertz 接触
  - Rayleigh 时间步
  - 工程设置与参数选择
  - 刚度软化
  - 恢复系数
  - 结果诊断与可信度验证
  - 休止角
  - 配位数
seo:
  title: 离散元与颗粒接触：原理、设置与验证
  description: >-
    从软球模型的控制方程出发给出 Hertz-Mindlin 接触力与重叠量的解析关系、Rayleigh
    波速时间步判据的推导与取值、刚度软化的上限约束，以及硬球与软球模型的切换条件。
  keywords:
    - 离散元
    - 离散原理与适用范围
    - Hertz 接触
    - Rayleigh 时间步
    - 颗粒接触
    - 工程设置与参数选择
    - 刚度软化
    - 恢复系数
    - 邻居列表
    - 结果诊断与可信度验证
    - 休止角
    - 配位数
    - 能量平衡
---
# 离散元与颗粒接触：原理、设置与验证

离散元把颗粒当作刚体、把接触当作可重叠的柔性弹簧，重叠量不是几何误差而是接触力的载体。模型的适用性由两条尺度决定：接触时长与平均自由时间之比决定能否用硬球近似，Rayleigh 表面波在颗粒内的传播时间决定最大稳定步长。下面给出接触力的解析关系、时间步判据的量级估算与刚度软化的合法边界。DEM 的参数设置有一条不可绕过的顺序：先按真实模量算时间步长，再判断这个步长能否承受目标颗粒数，不能承受才考虑刚度软化，并用重叠量上限约束软化倍数。把顺序颠倒（先随便软化再调步长）会让堆积结构失真，而且很难从结果上察觉。下面给出各参数的取值依据与对照设计。DEM 的结果可信度不能靠宏观云图判断，因为刚度软化、阻尼符号错误、接触漏检都会给出「看起来正常」的堆积形态。可用的独立证据有四类：单颗粒运动学的解析解、Hertz 力—位移曲线的解析关系、堆积统计量（孔隙率、配位数、休止角）的实验区间、以及时间步独立性与能量平衡。下面给出各基准的数值、阈值与判定试验。

## 基础概念与控制关系

### 软球模型的控制方程

对第 $i$ 个颗粒写出平动与转动方程

$$
m_i\frac{d v_i}{dt}=\sum_j F_{ij}+m_i g,
\qquad
I_i\frac{d\omega_i}{dt}=\sum_j T_{ij},
$$

$F_{ij}$ 为接触力（法向与切向之和），$T_{ij}$ 为接触力矩，$I_i$ 为转动惯量。方程本身是显式的常微分方程，时间推进的稳定性完全由接触刚度和质量决定。接触力由重叠量 $\delta$ 与相对速度决定，模型闭合的关键是给出 $F_n(\delta)$ 与 $F_t(\delta_t)$ 的关系式。

### Hertz-Mindlin 接触力与重叠量

两个弹性球体的法向接触力为

$$
F_n=\tfrac{4}{3}E^{*}\sqrt{R^{*}}\,\delta^{3/2},
\qquad
\frac{1}{E^{*}}=\frac{1-\nu_1^{2}}{E_1}+\frac{1-\nu_2^{2}}{E_2},
\qquad
\frac{1}{R^{*}}=\frac{1}{R_1}+\frac{1}{R_2}.
$$

$E^*$ 为等效弹性模量，$R^*$ 为等效半径。取两个钢球（$R=5\,\mathrm{mm}$、$E=210\,\mathrm{GPa}$、$\nu=0.3$）、法向力 $F_n=100\,\mathrm{N}$：$E^*=210\times10^{9}/(2\times0.91)=1.154\times10^{11}\,\mathrm{Pa}$，$R^*=2.5\times10^{-3}\,\mathrm{m}$，于是

$$
\delta=\left(\frac{3F_n}{4E^*\sqrt{R^*}}\right)^{2/3}
=\left(\frac{300}{4\times1.154\times10^{11}\times0.05}\right)^{2/3}
=\big(1.30\times10^{-8}\big)^{2/3}=5.53\,\mu\mathrm{m}.
$$

接触半径 $a=\sqrt{R^*\delta}=1.18\times10^{-4}\,\mathrm{m}$（$0.118\,\mathrm{mm}$），最大接触压力 $p_0=3F_n/(2\pi a^2)=3.45\,\mathrm{GPa}$。该压力超过多数钢材的屈服强度，说明这个算例已经进入塑性区，实际仿真应改用弹塑性接触模型。切向刚度按 Mindlin 解取 $k_t/k_n=2(1-\nu)/(2-\nu)$，$\nu=0.3$ 时为 $0.824$；在 $\delta=5.53\,\mu\mathrm{m}$ 处的法向切线刚度为 $k_n=2E^*\sqrt{R^*\delta}=2.71\times10^{7}\,\mathrm{N/m}$，这是把 Hertz 接触折算成线性弹簧时的基准值。

### 接触刚度的标定与软化界限

软化把真实弹性模量除以系数 $s$，重叠量按 $\delta\propto s^{2/3}$ 放大。合法边界是重叠量不超过粒径的 $1\%$：

$$
\delta/R<0.01\ \Rightarrow\ s<\left(\frac{0.01R}{\delta_0}\right)^{3/2},
$$

$\delta_0$ 为真实模量下的重叠量。对上面的钢球算例，$\delta_0/R=5.53\times10^{-6}/5\times10^{-3}=1.1\times10^{-3}$，故 $s<(0.01/1.1\times10^{-3})^{3/2}=27$，即最多把模量降到 $1/27$，步长放大 $\sqrt{27}=5.2$ 倍。若把模量降到 $1/100$，重叠量放大 $21.5$ 倍达到粒径的 $2.4\%$，堆积孔隙率与力链结构都会明显偏离真实值。

## 适用边界与方案选择

### Rayleigh 波速时间步判据

显式时间积分的步长不能超过弹性波跨越最小颗粒所需时间的一部分。对半径为 $R$、密度 $\rho$、剪切模量 $G$、泊松比 $\nu$ 的球，Rayleigh 波速判据为

$$
\Delta t_{\mathrm{Ray}}=\frac{\pi R\sqrt{\rho/G}}{0.163\nu+0.876},
\qquad
\Delta t=0.2\,\Delta t_{\mathrm{Ray}}.
$$

取玻璃珠 $R=1\,\mathrm{mm}$、$\rho=2500\,\mathrm{kg/m^3}$、$G=26.2\,\mathrm{GPa}$、$\nu=0.23$：$\sqrt{\rho/G}=3.089\times10^{-4}\,\mathrm{s}$，得 $\Delta t_{\mathrm{Ray}}=1.06\,\mu\mathrm{s}$，实际步长取 $2.1\times10^{-7}\,\mathrm{s}$。

换成钢球 $R=5\,\mathrm{mm}$（$\rho=7850\,\mathrm{kg/m^3}$、$G=79.3\,\mathrm{GPa}$、$\nu=0.3$）：$\sqrt{\rho/G}=3.146\times10^{-4}\,\mathrm{s}$，$\Delta t_{\mathrm{Ray}}=5.34\,\mu\mathrm{s}$，实际步长 $1.07\,\mu\mathrm{s}$。注意 $\Delta t$ 与 $R$ 成正比、与 $\sqrt{G/\rho}$ 成反比：颗粒缩小 10 倍或刚度提高 100 倍，都会让步长缩小 10 倍，而步数按同样比例增加。这就是大规模 DEM 必须做刚度软化的原因。

### 硬球与软球的适用边界

硬球模型把碰撞当作瞬时事件，用恢复系数与冲量更新速度，不使用重叠量。它成立的条件是接触时长远小于平均自由时间。Hertz 接触时长可估为

$$
t_c\approx2.87\left(\frac{m^{*2}}{R^*E^{*2}v_n}\right)^{1/5},
\qquad
m^*=\frac{m_1m_2}{m_1+m_2}.
$$

对 $R=5\,\mathrm{mm}$ 的钢球、$v_n=0.1\,\mathrm{m/s}$：$m^*=2.06\times10^{-3}\,\mathrm{kg}$，代入得 $t_c=47.7\,\mu\mathrm{s}$，约为 Rayleigh 步长的 $8.9$ 倍。体积分数 $0.1$ 的稀疏流动中平均自由时间约 $0.5\,\mathrm{ms}$，比值约 $10$，硬球可用；体积分数升到 $0.4$ 后平均自由时间降到约 $60\,\mu\mathrm{s}$，比值降到 $1.3$，必须改用软球模型。

## 工程设置与实施

### 摩擦与滚动阻力参数

球形颗粒的 DEM 模型若不加滚动阻力，休止角只能到 $20^\circ$ 左右，远低于真实砂堆的 $30^\circ\sim35^\circ$，因为真实颗粒的棱角提供了抗转动能力。滚动摩擦系数 $\mu_r$ 是标定休止角的主控参数，其取值必须针对具体材料重新标定，上表的对应关系只在相同粒径分布与生成方式下成立。静摩擦系数 $\mu_s$ 主要影响堆积体的稳定性与起动条件，对休止角的影响次之。

| 材料 | $\mu_s$ | $\mu_r$ | 典型休止角 |
|---|---|---|---|
| 玻璃珠（球形、光滑） | 0.30 | 0.05 | $21^\circ$ |
| 玻璃珠（加滚动阻力） | 0.30 | 0.10 | $25^\circ$ |
| 石英砂（近似球形） | 0.50 | 0.20 | $29^\circ$ |
| 煤颗粒 | 0.60 | 0.30 | $33^\circ$ |

### 可复算的配置脚本

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

### 可复算的量级脚本

```python
import math
ray = lambda R,rho,G,nu,f=0.2: f*math.pi*R*math.sqrt(rho/G)/(0.163*nu+0.876)
print(f"glass {ray(1e-3,2500,26.2e9,0.23):.3e}s  steel {ray(5e-3,7850,79.3e9,0.30):.3e}s")
Es, Rs, Fn = 210e9/(2*(1-0.3**2)), 2.5e-3, 100.0
d = (3*Fn/(4*Es*math.sqrt(Rs)))**(2/3)
print(f"delta={d*1e6:.2f}um a={math.sqrt(Rs*d)*1e3:.3f}mm "
      f"p0={3*Fn/(2*math.pi*Rs*d)/1e9:.2f}GPa kn={2*Es*math.sqrt(Rs*d):.2e}N/m")
# glass 2.125e-07s  steel 1.069e-06s
# delta=5.53um a=0.118mm p0=3.45GPa kn=2.71e+07N/m
```

### 时间步长与刚度软化

时间步长由 Rayleigh 波速判据给出，工程上取该值的 $0.2$ 倍：

$$
\Delta t=\alpha\,\Delta t_{\mathrm{Ray}},
\qquad
\Delta t_{\mathrm{Ray}}=\frac{\pi\,R\,\sqrt{\rho/G}}{0.876+0.163\,\nu},
\qquad
\alpha=0.2 .
$$

$\Delta t$ 与 $R$ 成正比：颗粒缩小 $4$ 倍，步长也缩小 $4$ 倍。$1\,\mathrm{s}$ 物理时间对 $R=1\,\mathrm{mm}$ 玻璃珠需要 $4.7\times10^{6}$ 步，对 $R=0.25\,\mathrm{mm}$ 石英砂需要 $1.9\times10^{7}$ 步。这是细颗粒问题必须软化的直接原因。

软化把弹性模量除以系数 $s$，步长放大 $\sqrt{s}$，重叠量放大 $s^{2/3}$。约束条件是重叠量不超过粒径的 $1\%$：

$$
\delta_{\max}/R<0.01\ \Rightarrow\ s<27\ \ (\text{钢球 }100\,\mathrm{N}\text{ 算例}),
$$

取 $s=20$ 时步长放大 $4.47$ 倍、重叠量放大 $7.37$ 倍，仍满足 $1\%$ 约束；取 $s=100$ 时重叠量放大 $21.5$ 倍，孔隙率与力链结构明显失真。软化倍数应作为可追溯的模型参数记录，并在报告中标明「刚度已软化 $s$ 倍」。

| 颗粒 | $R$ / mm | $\rho$ / (kg/m³) | $G$ / GPa | $\nu$ | $\Delta t_{\mathrm{Ray}}$ / μs | $\Delta t$ / μs |
|---|---|---|---|---|---|---|
| 玻璃珠 | 1.00 | 2500 | 26.2 | 0.23 | 1.062 | 0.212 |
| 玻璃珠 | 0.50 | 2500 | 26.2 | 0.23 | 0.531 | 0.106 |
| 石英砂 | 0.25 | 2650 | 29.0 | 0.20 | 0.261 | 0.052 |
| 钢球 | 5.00 | 7850 | 79.3 | 0.30 | 5.343 | 1.069 |

### 邻居列表与颗粒生成设置

邻居列表的搜索半径与重建频率必须覆盖颗粒在一个重建周期内的最大位移：

$$
r_{\mathrm{skin}}\ge v_{\max}\,\Delta t\,n_{\mathrm{rebuild}},
\qquad
L_{\mathrm{cell}}\ge d_{\max}+r_{\mathrm{skin}} .
$$

取 $v_{\max}=1\,\mathrm{m/s}$、$\Delta t=0.212\,\mu\mathrm{s}$、每 $20$ 步重建一次，位移为 $4.24\times10^{-6}\,\mathrm{m}$，故 $r_{\mathrm{skin}}$ 取 $0.5\,\mathrm{mm}$ 有 $100$ 倍余量。网格边长 $L_{\mathrm{cell}}$ 必须大于最大颗粒直径加 $r_{\mathrm{skin}}$，否则同一对颗粒会跨格漏检。

颗粒生成阶段需要限制初始重叠：插入速率过快会让新颗粒与已落颗粒产生 $10\%$ 量级的重叠，瞬间释放的弹性能会把床层吹起。做法是设置最大允许插入重叠（一般取 $0.1R$），并在插入后执行 $1000\sim5000$ 步的松弛。颗粒数超过 $10^{6}$ 时还需开启并行域分解，并把域边界厚度设为大于 $d_{\max}$。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 颗粒穿透或弹出计算域 | 时间步超过 Rayleigh 判据 | 把 $\Delta t$ 从 $0.4\Delta t_{\mathrm{Ray}}$ 降到 $0.2\Delta t_{\mathrm{Ray}}$，观察是否恢复 |
| 堆积体异常致密、孔隙率偏低 | 刚度软化过度，重叠量超过粒径 $1\%$ | 统计最大 $\delta/R$，钢球算例应低于 $1.1\times10^{-3}$ |
| 弹性碰撞后总能量持续上升 | 阻尼系数为负或接触检测重复计数 | 关闭阻尼，能量漂移应低于 $0.1\%/1000$ 步 |
| 稀疏流动中颗粒轨迹异常黏滞 | 体积分数低却仍用软球阻尼 | 计算 $t_c$ 与平均自由时间之比，大于 $10$ 时可换硬球 |
| 接触压力远超材料屈服强度 | Hertz 模型超出弹性范围 | 用 $p_0=3F_n/(2\pi a^2)$ 校核，钢球 $100\,\mathrm{N}$ 时达 $3.45\,\mathrm{GPa}$ |
| 恢复系数与设定值不符 | 阻尼系数与恢复系数的换算关系用错 | 用 $e=\exp(-\pi\zeta/\sqrt{1-\zeta^2})$ 反算，$\zeta=0.2$ 应得 $e=0.527$ |
| 颗粒在接触后穿透或飞出 | $\Delta t$ 超过 Rayleigh 判据 | 把 $\alpha$ 从 $0.4$ 降到 $0.1$，若最大重叠量下降即为步长问题 |
| 床层在生成阶段被吹起 | 初始插入重叠过大 | 统计插入后 $1000$ 步内的最大重叠，应低于 $0.1R$ |
| 休止角只有 $21^\circ$ 而实测 $32^\circ$ | 未设滚动摩擦 | 把 $\mu_r$ 从 $0$ 调到 $0.2$ 重算 |
| 计算耗时随颗粒数超线性增长 | 邻居列表重建间隔过小或 $r_{\mathrm{skin}}$ 过大 | 把重建间隔从 $5$ 步放宽到 $20$ 步，观察耗时 |
| 恢复系数实测值与设定不符 | 阻尼施加在绝对速度而非相对速度 | 用单颗粒弹跳算例测 $e$ 并与设定值对照 |
| 长时间模拟后总能量缓慢上升 | 软化倍数过大导致重叠量超限 | 统计最大 $\delta/R$，钢球算例应低于 $0.01$ |
| 落体时间比 $0.1428\,\mathrm{s}$ 偏长 | 积分器被大时间步引入额外阻尼 | 把 $\Delta t$ 减半重跑，落体时间应向 $0.1428\,\mathrm{s}$ 收敛 |
| 反弹高度低于 $27.8\,\mathrm{mm}$ 超过 $10\%$ | 阻尼施加在绝对速度或接触重复触发 | 用单颗粒算例输出速度时程，检查接触事件计数 |
| 双对数力—位移斜率偏离 $1.5$ | 接触模型写成线性弹簧或被截断 | 输出多组 $(\delta,F_n)$ 并拟合斜率 |
| 孔隙率高于 $0.62$ | 滚动摩擦过大或生成留下初始孔隙 | 把 $\mu_r$ 从 $0.10$ 降到 $0.05$，并延长生成后松弛步数 |
| 配位数低于 $4.8$ | 接触检测漏检或刚度太小 | 统计接触对数量并检查格子尺寸是否大于 $d_{\max}+r_{\mathrm{skin}}$ |
| 休止角只有 $21^\circ$ 而实验为 $25^\circ$ | 未设滚动摩擦 | 把 $\mu_r$ 调到 $0.10$ 并复查孔隙率 |
| 最大重叠量随步长的收敛比只有 $1.2$ | 步内多次触发接触或存在约束冲突 | 输出每步接触事件数，正常应接近 $1$ |
| 无阻尼时总能量每千步漂移超过 $0.05\%$ | 积分器非辛或软化倍数过大 | 换用速度 Verlet 并把 $s$ 从 $20$ 降到 $10$ |

### 恢复系数与阻尼的标定

粘性阻尼与恢复系数由下式换算：

$$
e=\exp\!\left(-\frac{\pi\zeta}{\sqrt{1-\zeta^2}}\right).
$$

实验测得 $e$ 后反算 $\zeta$，不要直接凭经验取 $\zeta$。玻璃珠的 $e$ 约 $0.9$（$\zeta\approx0.03$），湿砂的 $e$ 约 $0.3$（$\zeta\approx0.37$），钢球碰撞 $e$ 可达 $0.95$ 以上。阻尼只作用于法向相对速度，不能施加在绝对速度上，否则颗粒会整体减速。

| $\zeta$ | 0.10 | 0.20 | 0.30 | 0.50 |
|---|---|---|---|---|
| $e$ | 0.729 | 0.527 | 0.372 | 0.163 |

### 单颗粒自由落体与弹跳恢复

高度 $h_0$ 自由落体到底面的解析结果为

$$
v_{\mathrm{in}}=\sqrt{2gh_0},
\qquad
t_{\mathrm{fall}}=\sqrt{\frac{2h_0}{g}},
\qquad
h_{\mathrm{reb}}=e^2h_0 .
$$

取 $h_0=0.1\,\mathrm{m}$、$g=9.81\,\mathrm{m/s^2}$：$v_{\mathrm{in}}=1.401\,\mathrm{m/s}$，$t_{\mathrm{fall}}=0.1428\,\mathrm{s}$。设定 $e=0.527$（对应 $\zeta=0.2$）时，反弹速度应为 $0.738\,\mathrm{m/s}$，反弹高度 $h_{\mathrm{reb}}=0.2777\times0.1=27.8\,\mathrm{mm}$。数值结果与解析值的偏差应低于 $2\%$（落体时间）与 $5\%$（反弹高度，因为高度对 $e$ 是二次敏感）。若反弹高度系统性偏低 $10\%$ 以上，先查阻尼是否施加在绝对速度上，再查接触检测是否在颗粒尚未分离时反复触发。

## 验证、验收与复现

### 四类基准与验收量

单颗粒基准检验积分器与接触检测，验收量是落体时间与反弹高度；Hertz 基准检验接触力模型，验收量是力—位移曲线的指数与刚度；堆积统计基准检验摩擦与生成方式，验收量是孔隙率、配位数与休止角；时间步基准检验稳定性与精度，验收量是最大重叠量随步长的收敛率。

### 堆积分数与休止角基准

堆积统计量有明确的实验区间，可直接作为验收带：

配位数由接触对数量定义：$z=2N_c/N_p$。孔隙率偏高 $3\%$ 以上通常意味着滚动摩擦过大或生成阶段留下了初始孔隙；配位数偏低则说明接触检测漏检或刚度太小让弱接触被忽略。休止角是摩擦标定的最终验收量：若模型给出 $21^\circ$ 而实验为 $25^\circ$，把滚动摩擦系数从 $0.05$ 调到 $0.10$ 通常即可对齐，但必须同时复查孔隙率是否仍在 $0.60\sim0.62$。

| 指标 | 随机松散堆积 | 随机密堆积 | 玻璃珠实验 |
|---|---|---|---|
| 固体体积分数 $\phi$ | 0.60 | 0.64 | 0.60~0.62 |
| 平均配位数 $z$ | 4.5~5.5 | 6.0~7.0 | 4.8~5.6 |
| 休止角 | — | — | $23^\circ\sim28^\circ$ |

### 时间步独立性与能量平衡

最大重叠量随步长线性收敛，可作为精度指标：

收敛比为 $2$ 说明格式对 $\Delta t$ 是一阶的，与显式中心差分一致；外推的最大重叠量趋于零。若收敛比只有 $1.2$，说明接触力在步内被多次触发或存在刚性约束冲突。能量平衡用总能量 $E_{\mathrm{tot}}=E_k+E_p+E_{\mathrm{contact}}$ 核对：无阻尼弹性碰撞（$\zeta=0$、$e=1$）时每 $1000$ 步的相对漂移应低于 $0.05\%$；有阻尼时每次碰撞的动能按 $e^2$ 衰减，$e=0.9$ 对应单次损失 $19\%$，可与实测衰减曲线逐次对照。静床底部压力还可与 $\rho_{\mathrm{bulk}}gH$ 对照：$\phi=0.61$、$\rho=2500\,\mathrm{kg/m^3}$ 时 $\rho_{\mathrm{bulk}}=1525\,\mathrm{kg/m^3}$，床高 $0.5\,\mathrm{m}$ 的底部压力为 $7.48\,\mathrm{kPa}$。

| $\alpha=\Delta t/\Delta t_{\mathrm{Ray}}$ | 最大 $\delta/R$ | 收敛比 |
|---|---|---|
| 0.40 | $2.20\times10^{-3}$ | — |
| 0.20 | $1.10\times10^{-3}$ | 2.00 |
| 0.10 | $5.50\times10^{-4}$ | 2.00 |

### 可复算的验证脚本

```python
import math
g, h0, e = 9.81, 0.1, 0.527
print(f"v_in={math.sqrt(2*g*h0):.4f} m/s  t_fall={math.sqrt(2*h0/g):.4f} s")
print(f"h_reb={e*e*h0*1e3:.2f} mm  v_out={e*math.sqrt(2*g*h0):.4f} m/s")

R1, E1, nu1, Fn = 1e-3, 70e9, 0.22, 1.0
Es = E1/(2*(1-nu1**2)); Rs = R1/2
d  = (3*Fn/(4*Es*math.sqrt(Rs)))**(2/3)
kn = 2*Es*math.sqrt(Rs*d)
kl = 4.0/3.0*Es*math.sqrt(Rs*d)
print(f"Estar={Es:.3e} delta={d*1e6:.3f}um d/R={d/R1*100:.3f}% "
      f"kn={kn:.2e} k_lin={kl:.2e} N/m")

phi, rho, H = 0.61, 2500.0, 0.5
print(f"rho_bulk={phi*rho:.0f} kg/m3  p_bottom={phi*rho*g*H:.0f} Pa")
# v_in=1.4007 m/s  t_fall=0.1428 s
# h_reb=27.77 mm  v_out=0.7382 m/s
# Estar=3.678e+10 delta=0.941um d/R=0.094% kn=1.60e+06 k_lin=1.06e+06 N/m
# rho_bulk=1525 kg/m3  p_bottom=7479 Pa
```

### 单因素对照与记录字段

记录字段：颗粒数、粒径分布、$\rho$、$E$、$\nu$、软化倍数 $s$、$\Delta t_{\mathrm{Ray}}$ 与 $\Delta t$、$e$ 与 $\zeta$、$\mu_s$、$\mu_r$、$r_{\mathrm{skin}}$、重建间隔、生成速率与最大插入重叠、并行域数量。

| 对照项 | 固定量 | 变化量 | 观测量 |
|---|---|---|---|
| 时间步长比例 | 网格、物性 | $\alpha=0.1,0.2,0.4$ | 最大重叠量与总能量漂移 |
| 刚度软化倍数 | 步长比例 | $s=1,5,20,100$ | 孔隙率、底部压力、休止角 |
| 恢复系数 | 摩擦、几何 | $e=0.3,0.6,0.9$ | 弹跳高度与能量衰减曲线 |
| 滚动摩擦 | 其余摩擦参数 | $\mu_r=0.05,0.10,0.20$ | 休止角 |
| 邻居列表重建间隔 | 颗粒数 | $n=10,20,50$ 步 | 计算耗时与接触漏检次数 |

### Hertz 力—位移曲线对照

法向接触力必须满足

$$
F_n=\frac{4}{3}E^*\sqrt{R^*}\,\delta^{3/2},
$$

即双对数斜率恰为 $1.5$。取玻璃珠 $R=1\,\mathrm{mm}$、$E=70\,\mathrm{GPa}$、$\nu=0.22$，得 $E^*=70\times10^{9}/(2\times0.9516)=3.678\times10^{10}\,\mathrm{Pa}$、$R^*=5\times10^{-4}\,\mathrm{m}$。在 $F_n=1\,\mathrm{N}$ 时 $\delta=(3/(4\times3.678\times10^{10}\times0.02236))^{2/3}=9.41\times10^{-7}\,\mathrm{m}$，即 $0.94\,\mu\mathrm{m}$，$\delta/R=0.094\%$；该点切线刚度 $k_n=2E^*\sqrt{R^*\delta}=1.60\times10^{6}\,\mathrm{N/m}$。验证方法是让求解器输出若干 $\delta$ 对应的 $F_n$，在双对数坐标下拟合斜率：斜率偏离 $1.5$ 超过 $2\%$ 说明接触模型被写成了线性弹簧，或重叠量被几何检测截断。线性弹簧模型的等效刚度应取参考重叠处的割线值 $k_n^{\mathrm{lin}}=\frac{4}{3}E^*\sqrt{R^*\delta_{\mathrm{ref}}}$，$0.94\,\mu\mathrm{m}$ 处为 $1.06\times10^{6}\,\mathrm{N/m}$。

## 参考资料

1. Cundall, P. A. & Strack, O. D. L. A discrete numerical model for granular assemblies. *Géotechnique*, 29(1): 47-65, 1979.
2. Mindlin, R. D. Compliance of elastic bodies in contact. *Journal of Applied Mechanics*, 16(3): 259-268, 1949.
3. Johnson, K. L. *Contact Mechanics*. Cambridge University Press, 1985.
4. Li, Y., Xu, Y. & Thornton, C. A comparison of discrete element simulations and experiments for sandpiles composed of spherical particles. *Powder Technology*, 160(3): 219-228, 2005.
5. O'Sullivan, C. *Particulate Discrete Element Modelling: A Geomechanics Perspective*. Spon Press, 2011.
6. Zhu, H. P., Zhou, Z. Y., Yang, R. Y. & Yu, A. B. Discrete particle simulation of particulate systems: theoretical developments. *Chemical Engineering Science*, 62(13): 3378-3396, 2007.
7. Tsuji, Y., Tanaka, T. & Ishida, T. Lagrangian numerical simulation of plug flow of cohesionless particles in a horizontal pipe. *Powder Technology*, 71(3): 239-250, 1992.
