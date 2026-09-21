---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-reynolds-stress-engineering-setup
title: "雷诺应力模型：工程设置与参数选择"
summary: "七方程雷诺应力模型的落地要点：LRR 与 SSG 压力应变项常数、入口各向同性假设带来的定量误差、耦合求解与松弛设置、壁面反射项与近壁处理匹配，以及与两方程模型的成本对比核算。"
category:
  slug: turbulence-modeling
  name: "湍流与近壁建模"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "湍流与近壁建模"
  - "雷诺应力模型"
  - "工程设置与参数选择"
  - "压力应变项"
  - "各向异性"
seo:
  title: "雷诺应力模型：工程设置与参数选择"
  description: "七方程雷诺应力模型的落地要点：LRR 与 SSG 压力应变项常数、入口各向同性假设带来的定量误差、耦合求解与松弛设置、壁面反射项与近壁处理匹配，以及与两方程模型的成本对比核算。"
  keywords:
    - "雷诺应力模型"
    - "工程设置与参数选择"
    - "压力应变项"
    - "各向异性"
    - "壁面反射"
---

# 雷诺应力模型：工程设置与参数选择

雷诺应力模型（RSM）放弃涡黏假设，直接求解六个雷诺应力分量加一个尺度方程，代价是方程数从 2 涨到 7、耦合更强、对入口条件更敏感。它的价值只在强旋流、强曲率、二次流这类各向异性主导的流动里才体现得出来，因此在设置阶段就必须先量化各向异性有多强、代价有多高。本文以 DNS 槽道数据为标尺，给出入口给法、常数核对、求解设置与成本核算。

## 1 七方程模型的方程清单与常数

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

## 2 入口雷诺应力的给法：各向同性假设的代价

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

## 3 求解设置：耦合、松弛与稳定性

七个方程互相通过产生项与压力应变项耦合，稳定性明显差于两方程模型。可用的设置组合：

| 量 | 建议欠松弛 | 说明 |
|---|---|---|
| 压力 p | 0.2~0.3 | 与两方程模型相同 |
| 速度 U | 0.5~0.7 | 旋流算例取 0.5 |
| 雷诺应力 R | 0.5~0.7 | 低于 0.5 会显著拉长迭代 |
| 耗散率 ε 或 ω | 0.4~0.7 | 最难收敛的方程 |
| 湍流黏度 $\mu_t$ | 1.0 | 由应力迹与尺度代数求得 |

对流格式建议至少二阶迎风；一阶迎风带来的数值耗散会人为增强各向同性，把 RSM 相对两方程模型的优势直接抹掉。这一点在旋流算例里尤其明显：用一阶格式时，切向速度剖面的 Rankine 涡结构被过度抹平，结果与 $k$-$\varepsilon$ 几乎无差别。

## 4 近壁处理与壁面反射项

RSM 有两种近壁路线，选择依据仍是 y+：

- 壁函数路线：首层 $y^{+}$ 落在 30~300，$\phi_{ij,w}$ 关闭，$k$、$\varepsilon$、$\mu_t$ 用对应的壁函数边界。代价是近壁各向异性被壁函数抹平。
- 低雷诺路线：首层 $y^{+} \approx 1$，黏性底层布置 2~3 层，必须开启壁面反射项 $\phi_{ij,w}$，其作用是抑制壁面法向脉动、把能量重新分配给流向分量——这正是 RSM 能给出正确近壁各向异性的关键。若只加密网格而不开反射项，$\overline{v^2}$ 会显著偏大，湍流输运被高估。

判断反射项是否生效，看壁面附近 $\overline{v^2}/k$：正确的低雷诺 RSM 应在 $y^{+} \approx 15$ 处给出 0.19 左右，关闭反射项时会升到 0.3 以上。

## 5 成本核算：与两方程模型的对比

以某旋流燃烧器算例为例，网格 320 万单元、8 核并行：

| 项目 | $k$-$\varepsilon$ | RSM | 比值 |
|---|---|---|---|
| 每迭代墙钟时间 | 4.5 s | 9.8 s | 2.2 |
| 达到同一残差平台所需迭代 | 1200 | 2200 | 1.8 |
| 总墙钟时间 | 90 min | 360 min | 4.0 |

总成本约为四倍。这笔投入只有在各向异性确实主导目标量时才划算：判据是先用 $k$-$\varepsilon$ 与 RSM 各算一次，若目标量（旋流数衰减、二次流强度、分离区长度）差异超过 10%，且 RSM 更接近实验，才值得保留。旋流数按

$$S = \frac{\int \rho U W r^{2}\,\mathrm{d}A}{R\int \rho U^{2} r\,\mathrm{d}A}$$

计算，$S > 0.5$ 时两方程模型的误差通常已不可接受。

## 6 各向异性建模的失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 入口下游 5 倍直径内切向速度剖面与 $k$-$\varepsilon$ 几乎重合 | 入口应力按各向同性给，各向异性需要发展段才建立 | 把入口改为显式给定 $b_{11} = 0.4$ 的应力张量后重算 |
| 迭代初期 $\overline{v^2}$ 出现负值 | 压力应变项使应力张量失去可实现性 | 检查 $C_1$、$C_2$ 是否被改，并把 R 的欠松弛降到 0.5 |
| 壁面附近 $\overline{v^2}/k$ 达 0.3 以上 | 低雷诺路线未开启壁面反射项 | 打开 $\phi_{ij,w}$ 后重算，比较 $y^{+} \approx 15$ 处的比值 |
| 加密网格后旋流衰减反而变慢 | 一阶格式的数值耗散被减小，之前的结果是被抹平的 | 换二阶格式重算，比较切向速度峰值位置 |
| 结果与 $k$-$\varepsilon$ 差异小于 5% 但成本高 4 倍 | 流动的各向异性弱，RSM 没有发挥空间 | 计算 $S$ 与二次流强度，若 $S < 0.5$ 就退回两方程模型 |

## 7 闭合模型与实验数据出处

1. Launder B. E., Reece G. J., Rodi W., "Progress in the development of a Reynolds-stress turbulence closure," *Journal of Fluid Mechanics*, 1975.
2. Speziale C. G., Sarkar S., Gatski T. B., "Modelling the pressure–strain correlation of turbulence: an invariant dynamical systems approach," *Journal of Fluid Mechanics*, 1991.
3. Gibson M. M., Launder B. E., "Ground effects on pressure fluctuations in the atmospheric boundary layer," *Journal of Fluid Mechanics*, 1978.
4. Pope S. B., *Turbulent Flows*, Cambridge University Press, 2000.
