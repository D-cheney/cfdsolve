---
template_version: "flowlab-knowledge/1.0"
slug: k-epsilon-model-guide
title: 标准、RNG 与可实现 k-ε 模型使用指南
summary: 从湍动能与耗散率的物理含义出发，对比标准、RNG 与可实现 k-ε 的方程形式、常数与适用流动，并给出入口湍流量换算、近壁 y+ 匹配、内流算例与检查清单。
category:
  slug: turbulence-modeling
  name: 湍流与近壁建模
level: 进阶
reading_minutes: 14
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [k-epsilon, RNG, 可实现模型, 湍流耗散率, 壁函数, 涡黏模型]
seo:
  title: 标准、RNG 与可实现 k-ε 模型使用指南｜CFD菜鸟
  description: 比较标准、RNG 与可实现 k-ε 的方程、常数、适用流动与近壁 y+ 要求。
  keywords: [k-epsilon, RNG k-epsilon, realizable k-epsilon, 湍流模型, 壁函数]
---

# 标准、RNG 与可实现 k-ε 模型使用指南

$k$-$\varepsilon$ 模型是最成熟的工程湍流模型：它求解湍动能 $k$ 与耗散率 $\varepsilon$ 两个标量，用它们构造湍流黏度，再借 Boussinesq 假设把雷诺应力表达出来。它便宜、稳健、有几十年验证积累，是大多数内流的默认基线。局限同样清晰——涡黏假设的各向同性、壁函数的经验性，都让它在强分离、强旋流与近壁细节上失真。本文把标准、RNG、可实现三个变体的方程、常数与适用边界讲透。

## 1 结论与适用场景

一句话选型：先用标准 $k$-$\varepsilon$ 做基线，遇到强应变、强旋流或射流扩张率问题换 RNG 或可实现变体，遇到强逆压梯度与分离优先考虑 $k$-$\omega$ SST。

- 标准 $k$-$\varepsilon$：充分发展管流、通道流、一般内流与自由剪切层的稳妥默认值。
- RNG $k$-$\varepsilon$：在耗散方程中引入应变率相关项，对强应变、旋流和低雷诺数效应有一定改善，常用于旋流器与复杂分离。
- 可实现 $k$-$\varepsilon$:$C_\mu$ 随局部场量变化并强制实现性约束，对平面与圆射流的扩张率、旋转剪切层预测更准，常用于射流与燃烧器。
- 应主动回避的场景：强逆压梯度下的精确分离点、强曲率与旋流的各向异性场、需要近壁细节的换热与摩擦阻力、自然转捩。这些场合应比较 SST、雷诺应力模型或转捩模型。

三类变体共享同一套骨架，差别集中在 $\varepsilon$ 方程与 $C_\mu$ 的处理，因此“换模型不换网格”常常行不通：可实现模型对近壁与流向分辨率的要求不同于标准模型。

从计算成本看，三类 $k$-$\varepsilon$ 都属于两方程涡黏模型，单次迭代开销接近，差别主要来自额外源项与函数求值；真正影响耗时的仍是网格与收敛性。实践中最省事的做法是先用标准模型拿到量级与收敛参数，再按需升级变体，并保证前后网格、边界与收敛判据一致，否则比较就失去意义。

## 2 物理与建模基础

$k$ 度量单位质量流体的速度脉动能量，$k = \frac{1}{2} \overline{u_i' u_i'}$；$\varepsilon$ 是这些脉动能量被黏性耗散的速率。二者构成湍流的两个特征尺度：速度尺度 $u \sim \sqrt{k}$，长度尺度 $L \sim k^{3/2}/\varepsilon$，时间尺度 $T \sim k/\varepsilon$。湍流黏度正是由这三个尺度拼出来的：

$$
\mu_t \sim \rho\, u\, L = \rho C_\mu \frac{k^{2}}{\varepsilon}
$$

这个量纲关系把“涡有多大、耗散多快”翻译成一个黏性系数，从而把雷诺应力塞回平均流方程。它成立的前提是局部平衡——产生与耗散近似相当，且湍流近似各向同性。强分离、强曲率、冲击与旋转会破坏这两个前提，涡黏模型随即出现系统性偏差。

近壁行为是 $k$-$\varepsilon$ 的另一软肋。$\varepsilon$ 方程在壁面附近有奇异性，标准模型不能积分到壁面，必须借助壁函数跨过黏性底层与缓冲层。也就是说，$k$-$\varepsilon$ 的精度从设计之初就与网格首层高度绑定：首点必须落在壁函数成立的对数律区。能量级串的角度看，$k$-$\varepsilon$ 用一个标量耗散率描述整个耗散谱，这在大尺度非平衡时是粗糙的。

从建模哲学说，标准模型依赖“局部平衡”假设，即湍动能产生率与耗散率在局部近似相等。这一假设在剪切层与一般内流成立得不错，但在强分离、强旋转、快速畸变下不成立，导致 $\mu_t$ 被高估、分离被压制。RNG 与可实现变体正是针对这两处软肋：前者用重整化群方法导出有效黏度，把高应变下耗散的抑制显式写出；后者从实现性约束出发，强制 $C_\mu$ 随应变下降，让应力张量在物理上可实现。

$k$、$\varepsilon$ 输运方程的结构也值得注意：$k$ 由产生、耗散与扩散三项平衡，$\varepsilon$ 则由对应尺度的产生、衰减与扩散平衡。两个方程的源项经验常数是在一组经典流动（网格湍流衰减、平板边界层、均匀剪切、射流等）上标定出来的，因此模型在标定流动附近最可靠，离得越远越需要验证。

## 3 模型方程与公式

标准模型的湍动能输运方程为：

$$
\frac{\partial（\rho k）}{\partial t} + \frac{\partial（\rho k \overline{u_j}）}{\partial x_j} = P_k - \rho\varepsilon + \frac{\partial}{\partial x_j}\left[\left(\mu+\frac{\mu_t}{\sigma_k}\right)\frac{\partial k}{\partial x_j}\right]
$$

耗散率输运方程为：

$$
\frac{\partial（\rho \varepsilon）}{\partial t} + \frac{\partial（\rho \varepsilon \overline{u_j}）}{\partial x_j} = C_{\varepsilon 1}\frac{\varepsilon}{k}P_k - C_{\varepsilon 2}\rho\frac{\varepsilon^{2}}{k} + \frac{\partial}{\partial x_j}\left[\left(\mu+\frac{\mu_t}{\sigma_\varepsilon}\right)\frac{\partial \varepsilon}{\partial x_j}\right]
$$

其中产生项 $P_k = \mu_t S^{2}$，$S = \sqrt{2 S_{ij} S_{ij}}$。标准模型的常数取 $C_\mu = 0.09$、$C_{\varepsilon 1} = 1.44$、$C_{\varepsilon 2} = 1.92$、$\sigma_k = 1.0$、$\sigma_\varepsilon = 1.3$。\n\n$\varepsilon$ 方程三项的含义要看清：$C_{\varepsilon 1}(\varepsilon/k)P_k$ 表示耗散随产生而增长，$C_{\varepsilon 2}\rho \varepsilon^{2}/k$ 表示耗散的衰减（自毁），扩散项把耗散输运到邻近单元。$\varepsilon$ 的源项与汇项量级接近、符号相反，这也是 $\varepsilon$ 方程数值上最“硬”、最容易震荡的原因。

RNG 变体在 $\varepsilon$ 方程右端增加一项 $R_\varepsilon$，刻画高应变率下的耗散修正：

$$
R_\varepsilon = \frac{C_\mu \rho \eta^{3}（1 - \eta/\eta_0）}{1 + \beta \eta^{3}}\frac{\varepsilon^{2}}{k}, \qquad \eta = \frac{S k}{\varepsilon}
$$

取 $\eta_0 \approx 4.38$、$\beta \approx 0.012$；当 $\eta > \eta_0$ 时该项为负，有效降低高应变区的耗散，这正是 RNG 对强旋流更友好的原因。可实现变体则让 $C_\mu$ 不再恒定：

$$
C_\mu = \frac{1}{A_0 + A_s \dfrac{k U^{*}}{\varepsilon}}
$$

其中 $A_0 = 4.04$，$U^{*}$ 由应变率与旋转率张量组合而成，$A_s$ 依赖应变率不变量。该形式保证在强剪切下 $C_\mu$ 自动下降，且满足实现性不等式，因此可用于射流扩张率这类对 $C_\mu$ 敏感的流动。

## 4 工程做法与参数取值

**模型常数与开关。** 迁移不同软件时要逐项核对常数，尤其 RNG 的 $C_{\varepsilon 2}$、可实现模型的 $A_0$ 与 $A_s$。此外还有浮力生成项、可压缩（膨胀耗散）修正、旋流修正等开关，同一名字的模型在不同开关下行为差别很大，报告里必须写清。

**入口与远场。** 由湍流强度 $I$ 与长度尺度 $l$ 换算：

$$
k = \frac{3}{2}（U I）^{2}, \qquad \varepsilon = C_\mu^{3/4}\frac{k^{3/2}}{l}, \qquad l = 0.07\,L_{\text{特征}}
$$

内流特征长度取水力直径的 7% 左右是常见起点；$I$ 可按经验取：充分发展管流入口约 5%，风洞低湍流度来流 0.5%~1%。入口是短发展段结果的主要不确定性来源，必须做敏感性检查。

**近壁与 y+ 要求。**

- 标准壁函数：首点落在 $y^+ \approx 30\text{-}300$，且不应让大量单元落在 $y^+ < 30$ 的缓冲层。
- 增强壁面处理/两层模型：可覆盖全 $y^+$，但接触壁面一层仍需较细，$y^+ \approx 1$ 时精度最好。
- 低雷诺 $k$-$\varepsilon$：要求 $y^+ \approx 1$，黏性底层内布置 2~3 层。

**低雷诺 $k$-$\varepsilon$ 变体。** 通过壁面阻尼函数与黏性修正把方程积分到壁面，典型如 Launder-Sharma、Abe-Kondoh-Nagano；它们不依赖壁函数，但近壁网格必须足够细（$y^+ \approx 1$），否则阻尼函数反而引入误差。

**数值。** $k$ 与 $\varepsilon$ 方程用二阶迎风或更高阶格式；$\varepsilon$ 比 $k$ 更难收敛，常需要更小的欠松弛因子与更长的迭代。稳态求解应看到残差平台与积分量双稳定。$\mu_t/\mu$ 的外流上限常取 10 或 $10^{5}$，要记录。

**后处理体检指标。** 湍流黏度比 $\mu_t/\mu$ 应在物理合理区间：内流核心常为几十到几百，若出现 $10^{4}$ 量级说明来流湍流或长度尺度填得过大。壁面附近 $k$ 应趋于零、$\varepsilon$ 不应出现负值，这些都是快速判断闭合是否健康的信号。

## 5 可复现示例

场景：圆管湍流流动，管径 $D = 0.05\,\mathrm{m}$，平均速度 $U = 10\,\mathrm{m/s}$，空气 $\nu = 1.5 \times 10^{-5}\,\mathrm{m^2/s}$。用标准 $k$-$\varepsilon$ 加标准壁函数。

1. 雷诺数：$Re = U D / \nu = 10 \times 0.05 / 1.5 \times 10^{-5} \approx 3.3 \times 10^{4}$，充分发展湍流。
2. 摩擦因子用 Blasius 式 $f \approx 0.316 Re^{-1/4} \approx 0.0234$，壁面剪切 $\tau_w = \frac18 f \rho U^{2} \approx 0.36\,\mathrm{Pa}$。
3. 摩擦速度 $u_\tau = \sqrt{\tau_w/\rho} \approx 0.54\,\mathrm{m/s}$。
4. 壁函数网格目标 $y^+ = 50$，首层中心高度 $y_1 = y^+ \nu / u_\tau \approx 1.4 \times 10^{-3}\,\mathrm{m}$，首层单元高度约 2.8 mm。
5. 入口湍流：取 $I = 0.05$，$l = 0.07 D = 3.5 \times 10^{-3}\,\mathrm{m}$，则 $k = 1.5 \times (0.5)^2 = 0.375\,\mathrm{m^2/s^2}$，$\varepsilon = 0.09^{0.75} \times 0.375^{1.5} / 3.5 \times 10^{-3} \approx 3.2\,\mathrm{m^2/s^3}$。
6. 计算后按面积统计 $y^+$，确认主体落在 30～300；比较压降与充分发展速度剖面（对数律）验证闭合。
7. 用更细的网格重算做网格无关性检查，再换 RNG 变体重复步骤 3～6，比较压降与剖面是否在允差内一致。

可复现的入口量换算脚本：

```text
输入: U, I, l, Cmu = 0.09
k   = 1.5 * (U * I) ** 2
eps = Cmu ** 0.75 * k ** 1.5 / l
打印("k=", k, "epsilon=", eps)
```

壁面剪切可由 Darcy 摩擦因子 $f$ 反推：$\tau_w = \frac18 f \rho U^{2}$，注意区分范宁摩擦因子与达西摩擦因子（两者差 4 倍，是最常见的量纲陷阱）。设计首层时再套用 $y_1 = y^+ \nu / u_\tau$。

## 6 常见坑与排查

- **壁函数网格却把 $y^+$ 压到 5 以下**：标准壁函数假设失效，等于用错模型；要么加细到低雷诺处理，要么把首层放回对数区。
- **入口湍流量拍脑袋**:$k$、$\varepsilon$ 直接决定发展段与分离，须由 $I$、$l$ 换算并留档。
- **混淆范宁与达西摩擦因子**：导致壁面剪切差 4 倍，首层高度跟着全错。
- **用一阶迎风**：数值耗散过大，分离区与尾迹被抹平，看似收敛实则失真。
- **强旋流直接上标准模型**：各向异性与旋流效应被忽略，切向速度剖面明显偏离实验，应换 RSM 或带旋流修正的变体。
- **只看 $k$ 不看 $\varepsilon$ 场**:$\varepsilon$ 出现负值或极端峰值往往意味着网格或格式问题，早期排查比事后归因省事。
- **忽略浮力与可压缩开关**：热羽流或高速流中不开相应修正，结果会系统性偏。
- **网格太粗就想着换模型**：换模型不能弥补分辨率不足，先确认网格能支撑所选模型。
- **只报一个平均 y+**：必须给出最小值、最大值与面积分布，并标出异常位置。

## 7 检查清单与参考

1. 所选变体（标准/RNG/可实现）是否与流动特征匹配，理由是否写明？
2. 模型常数与浮力、压缩、旋流等开关是否逐项核对并记录？
3. 入口 $k$、$\varepsilon$ 是否由 $I$、$l$ 换算，且与求解器口径一致？
4. 近壁策略与 y+ 目标是否与所选近壁处理匹配，计算后是否按面积校核？
5. 对流格式是否至少二阶，收敛是否达到残差平台与积分量双稳定？
6. 是否用另一个有物理依据的模型做了敏感性对比？
7. 是否检查了 $k$、$\varepsilon$、$\mu_t/\mu$ 场与壁面量的合理性？

参考资料：

1. Launder B.E., Spalding D.B., "The Numerical Computation of Turbulent Flows," *Computer Methods in Applied Mechanics and Engineering*, 1974.
2. Yakhot V., Orszag S.A., "Renormalization Group Analysis of Turbulence," *Journal of Scientific Computing*, 1986.
3. Shih T.-H. et al., "A New k-ε Eddy-Viscosity Model for High Reynolds Number Turbulent Flows," *Computers & Fluids*, 1995.
4. 本项目《RANS 湍流模型选择框架》《k-ω SST 模型与分离流计算指南》《壁函数、低雷诺模型与近壁结果判读》。
