---
template_version: flowlab-knowledge/1.0
slug: cfd-turbulence-reynolds-stress-engineering-setup
title: 雷诺应力模型：工程设置与诊断验证
summary: >-
  七方程雷诺应力模型的落地要点：LRR 与 SSG
  压力应变项常数、入口各向同性假设带来的定量误差、耦合求解与松弛设置、壁面反射项与近壁处理匹配，以及与两方程模型的成本对比核算。
category:
  slug: turbulence-modeling
  name: 湍流与近壁建模
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 湍流与近壁建模
  - 雷诺应力模型
  - 工程设置与参数选择
  - 压力应变项
  - 各向异性
  - 结果诊断与可信度验证
  - 可实现性
  - Lumley 三角形
seo:
  title: 雷诺应力模型：工程设置与诊断验证
  description: >-
    七方程雷诺应力模型的落地要点：LRR 与 SSG
    压力应变项常数、入口各向同性假设带来的定量误差、耦合求解与松弛设置、壁面反射项与近壁处理匹配，以及与两方程模型的成本对比核算。
  keywords:
    - 雷诺应力模型
    - 工程设置与参数选择
    - 压力应变项
    - 各向异性
    - 壁面反射
    - 结果诊断与可信度验证
    - 可实现性
    - Lumley 三角形
---
# 雷诺应力模型：工程设置与诊断验证

雷诺应力模型（RSM）放弃涡黏假设，直接求解六个雷诺应力分量加一个尺度方程，代价是方程数从 2 涨到 7、耦合更强、对入口条件更敏感。它的价值只在强旋流、强曲率、二次流这类各向异性主导的流动里才体现得出来，因此在设置阶段就必须先量化各向异性有多强、代价有多高。本文以 DNS 槽道数据为标尺，给出入口给法、常数核对、求解设置与成本核算。雷诺应力模型的解可以残差收敛、场量光滑，却落在物理上不可能的状态里——负的法向应力、违反 Schwarz 不等式的剪应力、各向异性张量跑出 Lumley 三角形。这些都能用代数判据当场抓住。本文给出三个层次的诊断：逐点可实现性检验、各向异性不变量在三角形中的位置、以及压力应变项的收支核对，全部以 DNS 槽道 $Re_\tau = 395$ 的数据为基准。

## 七方程模型的方程清单与常数

雷诺应力输运方程为

$$\frac{D\overline{u_i'u_j'}}{Dt} = P_{ij} + \phi_{ij} - \varepsilon_{ij} + D_{ij}$$

其中压力应变项 $\phi_{ij} = \phi_{ij,1} + \phi_{ij,2} + \phi_{ij,w}$ 是模型化的核心。两种常用闭合：

$$\phi_{ij,1} = -C_1\frac{\varepsilon}{k}\left(\overline{u_i'u_j'} - \frac{2}{3}k\delta_{ij}\right), \qquad \phi_{ij,2} = -C_2\left(P_{ij} - \frac{2}{3}P\delta_{ij}\right)$$

线性 LRR 取 $C_1 = 1.8$、$C_2 = 0.6$；非线性 SSG 用各向异性张量 $b_{ij} = \overline{u_i'u_j'}/(2k) - \delta_{ij}/3$ 构造，常数取 $C_1 = 3.4$、$C_1^{*} = 1.8$、$C_2 = 4.2$、$C_3 = 0.8$、$C_3^{*} = 1.3$、$C_4 = 1.25$、$C_5 = 0.4$。两组常数量级完全不同，迁移算例时必须逐项核对。

```cpp
// constant/momentumTransport
RAS
{
    model           ReynoldsStress;
    turbulence      on;
    printCoeffs     on;
}
ReynoldsStressCoeffs
{
    couplingFactor  0.0;    // 0 为分离求解 R，1 为与动量方程紧耦合
}
```

`couplingFactor` 从 0 改到 1 会让动量方程与应力方程同步更新，收敛更快但每次迭代更贵，且对强旋流更容易震荡，建议先用 0 建立稳定场，再视需要切换。

## 成本核算：与两方程模型的对比

以某旋流燃烧器算例为例，网格 320 万单元、8 核并行：

总成本约为四倍。这笔投入只有在各向异性确实主导目标量时才划算：判据是先用 $k$-$\varepsilon$ 与 RSM 各算一次，若目标量（旋流数衰减、二次流强度、分离区长度）差异超过 10%，且 RSM 更接近实验，才值得保留。旋流数按

$$S = \frac{\int \rho U W r^{2}\,\mathrm{d}A}{R\int \rho U^{2} r\,\mathrm{d}A}$$

计算，$S > 0.5$ 时两方程模型的误差通常已不可接受。

| 项目 | $k$-$\varepsilon$ | RSM | 比值 |
|---|---|---|---|
| 每迭代墙钟时间 | 4.5 s | 9.8 s | 2.2 |
| 达到同一残差平台所需迭代 | 1200 | 2200 | 1.8 |
| 总墙钟时间 | 90 min | 360 min | 4.0 |

## 可实现性判据与张量不变量的可计算边界

应力张量必须半正定，等价于两条可直接编程的判据：

$$\overline{u_\alpha'u_\alpha'} \ge 0, \qquad \left|\overline{u_i'u_j'}\right| \le \sqrt{\overline{u_i'u_i'}\;\overline{u_j'u_j'}}$$

第一条排除负法向应力，第二条是 Schwarz 不等式，用来抓住“剪应力大于两个法向应力几何平均”的非法状态。更强的判据用各向异性张量 $b_{ij} = \overline{u_i'u_j'}/(2k) - \delta_{ij}/3$：

$$b_{ij}b_{ij} \le \frac{2}{3}, \qquad II = -\tfrac12 b_{ij}b_{ji}, \qquad III = \tfrac13 b_{ij}b_{jk}b_{ki}$$

由 $b_{ii} = 0$ 可推出 $II \in [-1/3,\,0]$、$III \in [-2/27,\,2/27]$。极值点有明确的物理对应：$II = 0$ 是各向同性；$II = -1/3$ 时张量只剩一个非零特征值，即一维脉动；$II = -1/3$ 与 $III = 2/27$ 对应单分量极限。Lumley 三角形的两条边由下式给出：

$$III = -\frac{1}{27} - \frac{II}{3}\;\;(\text{二分量边界}), \qquad III = \pm\frac{1}{4}\left(-\frac{4}{3}II\right)^{3/2}\;\;(\text{轴对称边界})$$

把 $II = -1/3$ 代入两式都得 $III = 2/27$，两条边在单分量顶点相交，这是一个很好的实现自检。

## 入口雷诺应力的给法：各向同性假设的代价

多数算例只给入口 $k$，软件把六个应力按各向同性摊成 $2k/3$ 的对角线，剪应力为零。这个假设在入口（通常是自由来流或管道核心）误差可接受，但如果在边界层入口或旋流入口照搬，误差很大。

用 DNS 槽道 $Re_\tau = 395$ 在 $y^{+} \approx 15$ 处的数据量化：$\overline{u^2}^{+} = 7.29$、$\overline{v^2}^{+} = 0.90$、$\overline{w^2}^{+} = 1.32$，三者之和为 9.51，故 $k^{+} = 4.76$。各分量占比为

$$\frac{\overline{u^2}}{k} = 1.53, \qquad \frac{\overline{v^2}}{k} = 0.19, \qquad \frac{\overline{w^2}}{k} = 0.28$$

三者之和恰为 2.0，这是 $k = \frac12\overline{u_i'u_i'}$ 的必然结果，可用作入口张量的自检。各向同性假设给出 0.667，把流向分量低估 2.3 倍、把壁法向分量高估 3.5 倍。对应的各向异性张量对角元为 $b_{11} = 0.433$、$b_{22} = -0.238$、$b_{33} = -0.194$，与各向同性状态的零值相差甚远。

因此入口应显式给出三个正应力与一个剪应力。若入口就是充分发展的槽道，可直接把 DNS 剖面插值进 `0/R`：

```cpp
// 0/R（symmTensor 场，按 xx xy xz yy yz zz 排列）
inlet
{
    type            fixedValue;
    value           uniform (0.0295 0 0 0.0037 0 0.0054);  // k=0.0193 m2/s2
}
wall
{
    type            kqRWallFunction;
    value           uniform (0 0 0 0 0 0);
}
```

## 求解设置：耦合、松弛与稳定性

七个方程互相通过产生项与压力应变项耦合，稳定性明显差于两方程模型。可用的设置组合：

对流格式建议至少二阶迎风；一阶迎风带来的数值耗散会人为增强各向同性，把 RSM 相对两方程模型的优势直接抹掉。这一点在旋流算例里尤其明显：用一阶格式时，切向速度剖面的 Rankine 涡结构被过度抹平，结果与 $k$-$\varepsilon$ 几乎无差别。

| 量 | 建议欠松弛 | 说明 |
|---|---|---|
| 压力 p | 0.2~0.3 | 与两方程模型相同 |
| 速度 U | 0.5~0.7 | 旋流算例取 0.5 |
| 雷诺应力 R | 0.5~0.7 | 低于 0.5 会显著拉长迭代 |
| 耗散率 ε 或 ω | 0.4~0.7 | 最难收敛的方程 |
| 湍流黏度 $\mu_t$ | 1.0 | 由应力迹与尺度代数求得 |

## 近壁处理与壁面反射项

RSM 有两种近壁路线，选择依据仍是 y+：

- 壁函数路线：首层 $y^{+}$ 落在 30~300，$\phi_{ij,w}$ 关闭，$k$、$\varepsilon$、$\mu_t$ 用对应的壁函数边界。代价是近壁各向异性被壁函数抹平。
- 低雷诺路线：首层 $y^{+} \approx 1$，黏性底层布置 2~3 层，必须开启壁面反射项 $\phi_{ij,w}$，其作用是抑制壁面法向脉动、把能量重新分配给流向分量——这正是 RSM 能给出正确近壁各向异性的关键。若只加密网格而不开反射项，$\overline{v^2}$ 会显著偏大，湍流输运被高估。

判断反射项是否生效，看壁面附近 $\overline{v^2}/k$：正确的低雷诺 RSM 应在 $y^{+} \approx 15$ 处给出 0.19 左右，关闭反射项时会升到 0.3 以上。

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 入口下游 5 倍直径内切向速度剖面与 $k$-$\varepsilon$ 几乎重合 | 入口应力按各向同性给，各向异性需要发展段才建立 | 把入口改为显式给定 $b_{11} = 0.4$ 的应力张量后重算 |
| 迭代初期 $\overline{v^2}$ 出现负值 | 压力应变项使应力张量失去可实现性 | 检查 $C_1$、$C_2$ 是否被改，并把 R 的欠松弛降到 0.5 |
| 壁面附近 $\overline{v^2}/k$ 达 0.3 以上 | 低雷诺路线未开启壁面反射项 | 打开 $\phi_{ij,w}$ 后重算，比较 $y^{+} \approx 15$ 处的比值 |
| 加密网格后旋流衰减反而变慢 | 一阶格式的数值耗散被减小，之前的结果是被抹平的 | 换二阶格式重算，比较切向速度峰值位置 |
| 结果与 $k$-$\varepsilon$ 差异小于 5% 但成本高 4 倍 | 流动的各向异性弱，RSM 没有发挥空间 | 计算 $S$ 与二次流强度，若 $S < 0.5$ 就退回两方程模型 |

## 诊断表与反证

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 迭代中 $\overline{v^2}$ 变为负值 | 压力应变项使张量失去半正定性 | 逐点算 $\min(\overline{u_\alpha'u_\alpha'})$ 并定位到具体单元 |
| 不变量点落在二分量边界之外 | 压力应变常数被改或时间推进过大 | 用 $III = -1/27 - II/3$ 画边界，统计越界单元占比 |
| $\phi_{ii}/\varepsilon$ 达 0.2 | 压力应变项实现不含迹为零的约束 | 对 $\phi_{ij}$ 张量求迹并除以同点 $\varepsilon$ |
| 残差平台但 $\max(b_{ij}b_{ij})$ 持续上升 | 耦合迭代尚未收敛到实现性流形上 | 把该极值写入日志，继续迭代直到其停止漂移 |
| 弯管内外壁切应力之比仅 1.25 | 一阶格式的数值耗散压制了曲率效应 | 换二阶格式重算，比较比值是否升到 1.5 以上 |
| 旋流轴线附近 $\overline{u'w'}$ 为正 | 模型退化为涡黏行为或旋流修正未开 | 检查剪应力分量输出是否被 $\mu_t$ 覆盖 |

## 把 DNS 槽道当作逐点基准

在 $y^{+} \approx 15$ 处，DNS 给出 $\overline{u^2}^{+} = 7.29$、$\overline{v^2}^{+} = 0.90$、$\overline{w^2}^{+} = 1.32$、$-\overline{u'v'}^{+} = 0.70$。三者之和 9.51 给出 $k^{+} = 4.76$，于是

$$b_{11} = 0.433, \quad b_{22} = -0.238, \quad b_{33} = -0.194, \quad b_{12} = -0.074$$

对角元之和为零，符合 $b_{ii} = 0$。计算不变量得 $b_{ij}b_{ij} = 0.293$，满足 $\le 2/3$；$II = -0.146$，落在 $[-1/3, 0]$ 内；$III = 0.0211$。

把 $II = -0.146$ 代回两条边界：二分量边界给出 $III = -0.0370 + 0.0488 = 0.0117$，轴对称边界给出 $III = 0.0215$。实测点 $0.0211$ 落在两者之间，且距轴对称边界的相对位置为 $(0.0211-0.0117)/(0.0215-0.0117) = 95\%$。这说明近壁湍流已非常接近轴对称拉伸状态，把它当成各向同性处理，误差就是整个三角形的尺度。

## 七方程收敛的诊断方式

七个方程耦合，单一残差曲线不足以判断。有效的诊断是把收敛拆成三个同时成立的信号：

- 六个应力分量与尺度方程的残差同时低于 $10^{-5}$，且残差曲线呈平台而非持续缓降；
- 应力张量的迹 $2k$ 在最后 500 次迭代内变化小于 0.5%；
- 不变量场的极值稳定：$\max(b_{ij}b_{ij})$ 与 $\min(\overline{v^2})$ 不再随迭代漂移。

第三条最关键。耦合求解常出现“残差已平台、但 $\overline{v^2}$ 仍在缓慢变化”的状态，此时关掉求解会得到一张实现性边界附近的错误应力场。判据是把 $\max(b_{ij}b_{ij})$ 打印进日志：只要它还在单调爬升，迭代就没有结束。

```python
import numpy as np

def invariants(R):
    """R: 3x3 雷诺应力张量（单位 m2/s2），返回 (k, II, III, b_ij b_ij)"""
    R = np.asarray(R, float)
    k = 0.5 * np.trace(R)
    b = R / (2 * k) - np.eye(3) / 3
    return k, -0.5 * np.sum(b * b), np.trace(b @ b @ b) / 3, np.sum(b * b)

def realizable(R):
    ok_norm = np.all(np.diag(R) >= 0)
    ok_schw = all(abs(R[i, j]) <= np.sqrt(R[i, i] * R[j, j] + 1e-30)
                  for i in range(3) for j in range(3))
    k, II, III, b2 = invariants(R)
    return ok_norm and ok_schw and b2 <= 2 / 3 + 1e-9, (II, III, b2)

utau2 = 1.0                                   # 以 u_tau^2 为单位
R_dns = np.array([[7.29, -0.70, 0.0],
                  [-0.70, 0.90, 0.0],
                  [0.0,   0.0, 1.32]]) * utau2
print(realizable(R_dns))
# (True, (-0.1463, 0.02110, 0.2926))

II = -0.1463
print("二分量边界 III =", -1/27 - II/3)          # 0.01174
print("轴对称边界 III =", 0.25 * (-4*II/3) ** 1.5)  # 0.02154
```

脚本输出的不变量与手算完全一致，可直接作为交付记录中的复核凭证。

## 压力应变项的收支核对

压力应变项不改变湍动能，只重新分配能量，因此逐点应满足 $\phi_{ii} = 0$。把求解结果中的 $\phi_{ij}$ 张量求迹，若 $|\phi_{ii}|/\varepsilon$ 超过 0.05，说明模型实现或常数有误，而不是数值误差。

更实用的核对是慢项与快项的配比。线性 LRR 的两项为

$$\phi_{ij,1} = -2C_1\varepsilon\,b_{ij}, \qquad \phi_{ij,2} = -C_2\left(P_{ij} - \tfrac{2}{3}P\delta_{ij}\right)$$

取 $C_1 = 1.8$、$C_2 = 0.6$。在 $y^{+} \approx 15$ 处，$P/\varepsilon \approx 1.4$，故 $|\phi_{2}|/|\phi_{1}| \approx C_2 P/(C_1\varepsilon) = 0.6\times1.4/1.8 = 0.47$。若后处理给出的比值与 0.47 相差超过 30%，通常是 $C_1$、$C_2$ 被改，或该点不在对数律区附近导致 $P/\varepsilon$ 偏离。

## 旋流与曲率算例的对照要点

RSM 的价值在强旋流和强曲率中体现，因此验收也应在这些量上做。对旋流算例，应同时报告三个剖面：切向速度的峰值半径、轴向速度在轴线上的亏损量、以及湍流剪应力 $\overline{u'w'}$ 的符号。标准 $k$-$\varepsilon$ 会在轴线附近给出正的 $\overline{u'w'}$，而实验与 RSM 给出负值，这一符号差异比任何积分量都更能说明模型的必要性。

对弯曲管道与 U 型弯，曲率使外侧湍流增强、内侧减弱，用两方程模型会把这一不对称抹掉。诊断量是内外侧壁面切应力之比：实验值通常在 1.6~2.0，$k$-$\varepsilon$ 给出接近 1.2，RSM 给出 1.5~1.8。若 RSM 结果仍接近 1.2，先怀疑对流格式的数值耗散，而不是模型本身。

## 参考资料

1. Launder B. E., Reece G. J., Rodi W., "Progress in the development of a Reynolds-stress turbulence closure," *Journal of Fluid Mechanics*, 1975.
2. Speziale C. G., Sarkar S., Gatski T. B., "Modelling the pressure–strain correlation of turbulence: an invariant dynamical systems approach," *Journal of Fluid Mechanics*, 1991.
3. Gibson M. M., Launder B. E., "Ground effects on pressure fluctuations in the atmospheric boundary layer," *Journal of Fluid Mechanics*, 1978.
4. Pope S. B., *Turbulent Flows*, Cambridge University Press, 2000.
5. Lumley J. L., "Computational modeling of turbulent flows," *Advances in Applied Mechanics*, 1978.
6. Moser R. D., Kim J., Mansour N. N., "Direct numerical simulation of turbulent channel flow up to $Re_\tau = 590$," *Physics of Fluids*, 1999.
