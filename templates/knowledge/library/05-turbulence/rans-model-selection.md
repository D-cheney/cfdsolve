---
template_version: "flowlab-knowledge/1.0"
slug: rans-model-selection
title: RANS 湍流模型选择框架
summary: 从附着流、逆压梯度、分离、旋流、浮力与转捩等特征出发，说明雷诺平均、Boussinesq 涡黏假设与各模型家族的取舍，并给出入口湍流量换算、近壁 y+ 匹配、模型敏感性与报告完整性检查流程。
category:
  slug: turbulence-modeling
  name: 湍流与近壁建模
level: 进阶
reading_minutes: 14
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [RANS, 湍流模型, 模型选择, 雷诺应力, 涡黏假设, 模型敏感性]
seo:
  title: RANS 湍流模型选择框架｜CFD菜鸟
  description: 依据流动特征、目标量与近壁需求选择 RANS 湍流模型，并完成敏感性与输入完整性检查。
  keywords: [RANS 模型, 湍流模型选择, k-epsilon, k-omega SST, 雷诺应力模型]
---

# RANS 湍流模型选择框架

RANS 把瞬时量分解为平均量与脉动量，平均后动量方程里浮现出未知的雷诺应力张量。湍流模型的任务就是为它提供闭合。问题在于：不同模型对剪切产生、逆压梯度、旋转曲率、近壁阻尼和各向异性的假设各不相同，因此**不存在对所有流动都最优的模型**。选型的本质，是把流动的主导物理逐条与模型的假设对齐，再用敏感性实验确认结论是否稳健。

## 1 结论与适用场景

选型可以落成一条固定流程：先识别主导物理特征，再明确要回答的目标量，然后挑选模型家族，接着让网格与入口条件匹配模型，最后用双模型敏感性对比确认结论。按特征给出的默认建议如下：

- 附着边界层、一般外流与内流，目标是整体压降或流量：Spalart–Allmaras 或标准 $k$-$\varepsilon$ 作基线，成本低、稳健。
- 强逆压梯度、流动分离、翼型、扩压器、叶栅、钝体绕流：优先 $k$-$\omega$ SST，它对近壁剪切与压力梯度的响应更好。
- 强旋流、强曲率、显著各向异性（旋风分离器、叶轮内流、自由射流、尾迹掺混）：考虑雷诺应力模型（RSM），它直接求解应力输运，代价与收敛难度更高。
- 浮力主导（热羽流、自然对流、大空间换热）：带浮力生成项的 $k$-$\varepsilon$ 或 RSM，普通涡黏模型会低估浮力湍流。
- 转捩主导阻力或换热（低湍流度来流、光滑翼型）：使用经过验证的转捩模型，完全湍流模型不能自动预测自然转捩。
- 冲击波—边界层干扰、强压缩：谨慎选择模型并开启可压缩修正，结论不确定度要如实标注。

RANS 的适用边界也要讲清：需要解析瞬态大尺度涡结构、声学噪声、强非定常脱落时，稳态 RANS 只能给平均值，应转向 URANS、DES 或 LES。

从计算成本看，模型大致呈阶梯排列：SA 只多一个输运方程，两方程涡黏模型每增加一个方程约带来两成的迭代开销，而雷诺应力模型需要七个方程、耦合强、收敛慢，实际耗时往往是 $k$-$\varepsilon$ 的数倍。因此默认策略是：能用两方程解决的问题就不轻易上 RSM，只有在涡黏假设被明确证明失效（强各向异性、强旋流、二次流、强曲率）时才升级。反过来，若只有粗糙网格和紧张工期，选择过复杂的模型只会放大数值误差，不如先把网格与入口做扎实。

## 2 物理与建模基础

雷诺分解把瞬时速度写成平均量与脉动之和：

$$
u_i = \overline{u_i} + u_i', \qquad \phi = \overline{\phi} + \phi'
$$

代入不可压 Navier–Stokes 并取时间平均，动量方程多出一项 $\rho \overline{u_i' u_j'}$，这就是雷诺应力：

$$
\frac{\partial （\rho \overline{u_i}）}{\partial t} + \frac{\partial （\rho \overline{u_i}\,\overline{u_j}）}{\partial x_j} = -\frac{\partial \overline{p}}{\partial x_i} + \frac{\partial}{\partial x_j}\left[\mu\left(\frac{\partial \overline{u_i}}{\partial x_j}+\frac{\partial \overline{u_j}}{\partial x_i}\right) - \rho \overline{u_i' u_j'}\right]
$$

未知量多于方程数，方程不封闭，这就是湍流闭合问题。最常用的闭合是 Boussinesq 涡黏假设，把雷诺应力类比为分子黏性应力：

$$
-\rho \overline{u_i' u_j'} = \mu_t\left(\frac{\partial \overline{u_i}}{\partial x_j}+\frac{\partial \overline{u_j}}{\partial x_i}\right) - \frac{2}{3}\rho k\,\delta_{ij}
$$

其中湍动能定义为 $k = \frac{1}{2} \overline{u_i' u_i'}$。该假设把六个独立应力分量压缩成一个标量 $\mu_t$，代价是强迫湍流黏性各向同性——这正是涡黏模型在强旋流、强曲率和分离区失准的根源。模型家族因此分成几档：零/一方程（如 SA）、两方程涡黏（$k$-$\varepsilon$、$k$-$\omega$、SST）、以及不做涡黏假设的七方程雷诺应力模型。方程越多，表达能力越强，但闭合项经验常数越多、对网格与数值的敏感度也越高。

从能量输运的角度看，湍流是一个级串过程：大尺度涡从平均剪切抽取能量，逐级传递给小尺度，最终被黏性耗散为热。RANS 不解析任何尺度，只用一个或几个标量描述“涡有多大、耗散多快”，这正是它必须依赖经验常数的根本原因。近壁处湍流被壁面强烈阻尼：脉动在黏性底层趋零，湍动能产生峰值约在 $y^+ \approx 15\text{–}20$，因此所有模型都必须对近壁做特殊处理，否则速度剖面与壁面剪切都会失真。

## 3 模型方程与公式

标准 $k$-$\varepsilon$ 是工程基线，求解湍动能与耗散率两个输运方程：

$$
\frac{\partial（\rho k）}{\partial t} + \frac{\partial（\rho k \overline{u_j}）}{\partial x_j} = P_k - \rho\varepsilon + \frac{\partial}{\partial x_j}\left[\left(\mu+\frac{\mu_t}{\sigma_k}\right)\frac{\partial k}{\partial x_j}\right]
$$

$$
\frac{\partial（\rho \varepsilon）}{\partial t} + \frac{\partial（\rho \varepsilon \overline{u_j}）}{\partial x_j} = C_{\varepsilon 1}\frac{\varepsilon}{k}P_k - C_{\varepsilon 2}\rho\frac{\varepsilon^{2}}{k} + \frac{\partial}{\partial x_j}\left[\left(\mu+\frac{\mu_t}{\sigma_\varepsilon}\right)\frac{\partial \varepsilon}{\partial x_j}\right]
$$

湍流黏度与产生项由下式给出，其中 $S$ 为平均应变率张量的模：

$$
\mu_t = \rho C_\mu \frac{k^{2}}{\varepsilon}, \qquad P_k = \mu_t S^{2}, \qquad S = \sqrt{2 S_{ij} S_{ij}}
$$

RNG 变体在耗散方程中引入附加应变率项，使高应变区的有效黏度下降；可实现（realizable）变体把 $C_\mu$ 变成应变、旋转与 $k$、$\varepsilon$ 的函数，改善对射流扩张率和旋流的预测，并强制实现性约束。$k$-$\omega$ SST 的湍流黏度用剪切应力限制收尾：

$$
\mu_t = \rho \frac{a_1 k}{\max（a_1 \omega,\, S F_2）}
$$

其中 $a_1 \approx 0.31$，$F_2$ 是第二个混合函数，在近壁趋于 1、在自由剪切层趋于 0，从而在近壁启用 $k$-$\omega$ 行为、在远场切回对自由流 $\omega$ 不敏感的 $k$-$\varepsilon$ 行为。SA 模型则只输运一个黏性变量 $\tilde{\nu}$，成本更低但对强分离的适应性较弱。

当涡黏假设失效时，雷诺应力模型直接输运六个应力分量，其输运方程的一般形式为

$$
\frac{\partial（\rho \overline{u_i' u_j'}）}{\partial t} + \frac{\partial（\rho \overline{u_k}\,\overline{u_i' u_j'}）}{\partial x_k} = P_{ij} + \Phi_{ij} - \varepsilon_{ij} + D_{ij}
$$

其中 $P_{ij}$ 为产生项、$\Phi_{ij}$ 为压力—应变再分配项、$\varepsilon_{ij}$ 为耗散项、$D_{ij}$ 为扩散项。压力—应变项决定各向异性的再分配，是闭合最困难、最容易引入经验假设的部分，也是 RSM 比涡黏模型更难收敛、更依赖验证的原因。

## 4 工程做法与参数取值

**模型常数。** 标准 $k$-$\varepsilon$ 取 $C_\mu = 0.09$、$C_{\varepsilon 1} = 1.44$、$C_{\varepsilon 2} = 1.92$、$\sigma_k = 1.0$、$\sigma_\varepsilon = 1.3$。RNG 取 $C_{\varepsilon 2} = 1.68$ 并附加应变项；可实现模型 $C_{\varepsilon 2} \approx 1.9$、$C_\mu$ 按局部场量计算。SST 取 $a_1 = 0.31$、$\beta^{*} = 0.09$、$\sigma_k = 0.85$（近壁）/ $1.0$（远场），内层与外层常数由混合函数插值。跨软件迁移时务必核对每个常数与修正开关，别默认它们一致。

**入口与远场湍流量。** 给定湍流强度 $I$ 与湍流长度尺度 $l$，可由平均速度和常数换算 $k$、$\varepsilon$、$\omega$：

$$
k = \frac{3}{2}（U I）^{2}, \qquad \varepsilon = C_\mu^{3/4}\frac{k^{3/2}}{l}, \qquad \omega = \frac{k^{1/2}}{C_\mu^{1/4} l}
$$

内流的 $l$ 常取特征尺寸的一个分数（如 $0.07\,D$）；外流改用与来流匹配的小 $I$，并对外场 $\omega$ 做敏感性检查。湍流黏度比 $\mu_t/\mu$ 是快速体检指标：外流入口常见 1～10，内流可更高，若出现 $10^{4}$ 量级说明来流湍流被严重夸大。

**近壁匹配。** 壁函数要求首点落在对数律区（$y^+ \approx 30\text{–}300$）；壁面解析要求 $y^+ \approx 1$ 且黏性底层内布置多层。$k$-$\varepsilon$ 默认走壁函数，若把 $y^+$ 压到 5 以下却不换低雷诺处理，等于让壁函数假设失效。SST、SA 在 $y^+$ 较大时会自动退化为壁函数，但想真正解析边界层仍要把 $y^+$ 做到 1 附近。近壁设计详见《边界层网格、首层高度与 y+ 设计》。

**数值与收敛。** 湍流输运方程的对流项建议用二阶迎风或更高阶格式，一阶迎风会引入过大数值耗散、系统性低估分离；压力—速度耦合与库朗数要保证稳定，稳态计算应至少收敛到残差平台后再读取积分量。$\mu_t/\mu$ 的上下限（外流常取 10，部分求解器设到 $10^{5}$）是稳定化手段，但限制过紧会掩盖真实物理，使用时必须记录具体取值。

**启动策略。** 工程上常用“先用稳健的一方程或两方程把流场到一个合理初场，再切换到目标模型继续迭代”的做法，可显著改善 RSM 与 SST 在强分离算例上的收敛鲁棒性；切换时要确认入口湍流量已按目标模型的口径重新换算。

## 5 可复现示例

场景：用 $k$-$\varepsilon$ 与 $k$-$\omega$ SST 分别计算二维翼型在攻角下的升阻力与分离点，验证选型稳健性。步骤如下：

1. 确定来流：$U = 50\,\mathrm{m/s}$，特征长度 $c = 1\,\mathrm{m}$，湍流强度 $I = 0.05$，长度尺度 $l = 0.07\,c$。
2. 由上式换算入口 $k$、$\varepsilon$、$\omega$，两模型使用同一组物理量。
3. 网格用同一套棱柱层，SST 走壁面解析（$y^+ \approx 1$），$k$-$\varepsilon$ 走增强壁面处理并另做 $y^+ \approx 30$ 的壁函数网格对照。
4. 收敛标准一致（残差与积分量同时稳定），对比升力系数、阻力系数、壁面压力分布与分离位置。
5. 只接受在两种模型、两套网格下结论方向一致的结果；分歧点要回到物理与验证数据判断。

入口量换算的可复现脚本（伪代码，便于手算核对）：

```text
输入: U, I, l, Cmu=0.09
k  = 1.5 * (U * I) ** 2
eps = Cmu ** 0.75 * k ** 1.5 / l
omega = k ** 0.5 / (Cmu ** 0.25 * l)
mu_t_over_mu = ...      # 计算后从场中提取，检查量级
打印("k=", k, "epsilon=", eps, "omega=", omega)
```

代入数值可得 $k = 1.5 \times (50 \times 0.05)^2 \approx 9.4\,\mathrm{m^2/s^2}$，$\varepsilon \approx 0.09^{0.75} \times 9.4^{1.5} / 0.07 \approx 118\,\mathrm{m^2/s^3}$，$\omega \approx 9.4^{0.5} / (0.09^{0.25} \times 0.07) \approx 538\,\mathrm{1/s}$。把这三个量同时写入并对照两个模型的入口卡片，是避免“换模型顺手换错入口”的最简单办法。

## 6 常见坑与排查

- **只换模型不改网格**：雷诺应力模型对近壁与流向分辨率要求更高，直接沿用旧网格常得到更差的收敛与结果。
- **入口湍流凭感觉填**：入口量直接影响短发展段与分离位置，必须由 $I$ 与 $l$ 换算并留档。
- **比较不同网格/边界下的模型**：敏感性对比必须在网格、边界和收敛标准完全一致时才有意义。
- **用残差或云图选模型**：残差低不代表闭合正确，云图好看也不代表积分量准确，应比较目标量与验证数据。
- **忽略浮力与可压缩修正开关**：同一“模型”在不同开关下行为差别很大，报告里要写清。
- **超出验证范围仍给确定结论**：强旋流、强非定常分离下应注明不确定度，必要时升级到 RSM、URANS 或 LES。
- **无视来流湍流度的影响**：低湍流度外流的翼型阻力对转捩与 $I$ 极敏感，直接按完全湍流算会高估阻力，需与转捩模型配合。

## 7 检查清单与参考

1. 主导物理特征是否逐条列出，并与所选模型的假设对齐？
2. 目标量（压降、分离点、换热、力）是否明确，且纳入验收？
3. 入口 $k$、$\varepsilon$ 或 $\omega$ 是否由 $I$ 与 $l$ 换算并记录？
4. 近壁策略与 y+ 是否与模型匹配，且计算后按面积校核？
5. 是否用两个有物理依据的模型做了敏感性对比？
6. 常数与修正开关是否逐项核对并写入报告？
7. 结论是否标注了适用区间与不确定度？

参考资料：

1. Wilcox D.C., *Turbulence Modeling for CFD*, DCW Industries.
2. Pope S.B., *Turbulent Flows*, Cambridge University Press.
3. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications," *AIAA Journal*, 1994.
4. 本项目《标准、RNG 与可实现 k-ε 模型使用指南》《k-ω SST 模型与分离流计算指南》《边界层网格、首层高度与 y+ 设计》。
