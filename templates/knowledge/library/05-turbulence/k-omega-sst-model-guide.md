---
template_version: "flowlab-knowledge/1.0"
slug: k-omega-sst-model-guide
title: k-ω SST 模型与分离流计算指南
summary: 拆解 SST 的近壁 k-ω 与远场 k-ε 混合思想，给出 F1、F2 混合函数、交叉扩散项、剪切应力限制、模型常数、入口 ω 敏感性与 y+ 网格要求，并附翼型分离流的可复现设置。
category:
  slug: turbulence-modeling
  name: 湍流与近壁建模
level: 工程
reading_minutes: 14
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-08-06T00:00:00.000Z"
tags: [k-omega SST, 分离流, 逆压梯度, y+, 湍流, 混合函数]
seo:
  title: k-ω SST 湍流模型指南｜CFD菜鸟
  description: 理解 SST 的混合机制与剪切应力限制，并正确设置近壁网格与自由来流湍流量。
  keywords: [k-omega SST, SST 湍流模型, 分离流, 逆压梯度, 混合函数]
---

# k-ω SST 模型与分离流计算指南

$k$-$\omega$ SST（Shear Stress Transport）是工程气动与分离流计算的默认模型之一。它的巧妙之处在于分工：近壁区用 $k$-$\omega$ 的解析能力处理黏性底层，远场切换成 $k$-$\varepsilon$ 的行为以摆脱对自由流 $\omega$ 的过度敏感，再叠加一个剪切应力限制，让逆压梯度下的湍流剪切不过分膨胀。理解这套混合机制，才能把网格与入口条件设对。

## 1 结论与适用场景

SST 的核心价值是在逆压梯度和分离流里表现稳健，因此常用于翼型、扩压器、叶轮机械、汽车外形与钝体绕流的升阻力与分离点预测。它的适用判断如下：

- 强逆压梯度、边界层分离、再附：优先 SST，而非标准 $k$-$\varepsilon$。
- 需要解析近壁速度剖面与壁面剪切：SST 配 $y^+ \approx 1$ 的壁面解析网格。
- 只有粗网格、只想拿整体量级：SST 也能在 $y^+$ 较大时退化为壁函数行为，但精度下降。
- 强旋流与强各向异性、自然转捩：SST 仍会失准，需要 RSM 或转捩模型补充。

要记住一个关键事实：**SST 的模型优势不等于可以省掉网格**。分离泡的形状与再附位置由流向与展向分辨率决定，若网格不足以描述剪切层，再好的模型也救不回来。

与标准 $k$-$\varepsilon$ 相比，SST 在分离流上的优势来自两处：一是近壁不需壁函数即可积分到壁面（前提是 $y^+ \approx 1$ 的网格），二是剪切应力限制抑制了逆压梯度下的湍流过强。代价是它对网格更挑剔、对远场条件更敏感，因此“SST 跑得动”不等于“SST 跑得对”。若算例本来就是附着流、只关心压降，标准 $k$-$\varepsilon$ 或 SA 往往更省更稳；只有在分离与逆压梯度是主矛盾时，SST 的额外成本才划算。

## 2 物理与建模基础

SST 的出发点是“两种模型的互补”。$k$-$\omega$ 在近壁表现好：无需壁函数即可积分到壁面，对逆压梯度响应灵敏。但它的弱点在远场——自由流的 $\omega$ 取值会显著影响整个边界层内的湍流黏度，网格边界越远、越难给对。$k$-$\varepsilon$ 则相反：远场稳健，近壁却需要壁函数。

SST 用混合函数 $F_1$ 在两者之间插值：壁面附近 $F_1 \to 1$，模型退化为 $k$-$\omega$；边界层外缘 $F_1 \to 0$，模型切回 $k$-$\varepsilon$ 形式。它把标准 $k$-$\varepsilon$ 改写为 $\omega$ 方程后合并进来，并在切换处引入交叉扩散项，抵消 $k$-$\varepsilon$ 形式对 $\omega$ 漂移的敏感性。

第二个要素是剪切应力限制。标准涡黏模型在逆压梯度中会高估湍流剪切，延迟分离。SST 把湍流黏度限制为 $\mu_t = \rho a_1 k / \max(a_1 \omega, S F_2)$，使边界层内满足 $\tau \propto \rho a_1 k$ 的限制（Bradshaw 假设），从而在分离附近给出更合理的剪切水平。这套机制让 SST 在光滑翼型分离、激波—边界层干扰上优于标准两方程模型。

交叉扩散项是混合的另一关键细节。若把 $k$-$\varepsilon$ 的 $\omega$ 形式直接与 $k$-$\omega$ 相加，两套方程在 $\omega$ 上的扩散行为不一致，会在边界层外缘产生非物理的 $\omega$ 源。SST 在 $\omega$ 方程中显式加入交叉扩散项，只在远场生效，正是为了抹平这一不一致，这也是 SST 比原版 $k$-$\omega$ 抗自由流干扰强的原因。此外，壁面距离 $y$ 的引入让混合函数能“感知”边界层位置，使得同一套方程在不同网格下都能保持近壁与远场的一致分工。

## 3 模型方程与公式

以 $\omega$ 为第二变量的 $k$ 方程与 $\omega$ 方程写作：

$$
\frac{\partial（\rho k）}{\partial t} + \frac{\partial（\rho k \overline{u_j}）}{\partial x_j} = \tilde{P}_k - \beta^{*}\rho k \omega + \frac{\partial}{\partial x_j}\left[（\mu + \sigma_k \mu_t）\frac{\partial k}{\partial x_j}\right]
$$

$$
\frac{\partial（\rho \omega）}{\partial t} + \frac{\partial（\rho \omega \overline{u_j}）}{\partial x_j} = \alpha \frac{\rho}{\mu_t}\tilde{P}_k - \beta \rho \omega^{2} + \frac{\partial}{\partial x_j}\left[（\mu + \sigma_\omega \mu_t）\frac{\partial \omega}{\partial x_j}\right] + 2（1 - F_1）\sigma_{\omega 2}\frac{\rho}{\omega}\frac{\partial k}{\partial x_j}\frac{\partial \omega}{\partial x_j}
$$

末项即交叉扩散项，只在远场（$F_1$ 小）起作用。为避免驻点区湍动能产生过大，产生项被限制：

$$
\tilde{P}_k = \min\left(P_k,\; 10\,\beta^{*}\rho k \omega\right)
$$

混合函数 $F_1$ 同时依赖壁面距离 $y$、$\sqrt{k}/(\beta^{*}\omega y)$ 与交叉扩散量：

$$
F_1 = \tanh（\arg_1^{4}）， \qquad \arg_1 = \min\left[\max\left(\frac{\sqrt{k}}{\beta^{*}\omega y},\, \frac{500\nu}{y^{2}\omega}\right)，\, \frac{4\rho\sigma_{\omega 2}k}{CD_{k\omega}\,y^{2}}\right]
$$

$$
CD_{k\omega} = \max\left(2\rho\sigma_{\omega 2}\frac{1}{\omega}\frac{\partial k}{\partial x_j}\frac{\partial \omega}{\partial x_j},\; 10^{-10}\right)
$$

所有内层/外层常数按 $\phi = F_1 \phi_1 + (1 - F_1)\phi_2$ 插值。第二个混合函数用于湍流黏度限制：

$$
F_2 = \tanh（\arg_2^{2}）， \qquad \arg_2 = \max\left(\frac{2\sqrt{k}}{\beta^{*}\omega y},\, \frac{500\nu}{y^{2}\omega}\right)， \qquad \mu_t = \rho\frac{a_1 k}{\max（a_1 \omega,\, S F_2）}
$$

逐项看：$k$ 方程右侧三项分别是产生 $\tilde{P}_k$、耗散 $\beta^{*}\rho k \omega$ 与扩散；$\omega$ 方程右侧四项分别是产生、耗散、扩散与交叉扩散。近壁 $F_1 \to 1$ 时交叉扩散项消失，方程回到 $k$-$\omega$；边界层外 $F_1 \to 0$ 时交叉扩散项接管，把 $\omega$ 拉回 $k$-$\varepsilon$ 的等价行为。$\arg_1$ 中三项分别代表湍流尺度、黏性尺度与交叉扩散尺度，取最小者保证混合函数在各限制下都单调，避免混合区出现跳变。

## 4 工程做法与参数取值

**模型常数。** SST 内层（$k$-$\omega$ 侧）取 $\sigma_{k1} = 0.85$、$\sigma_{\omega 1} = 0.5$、$\beta_1 = 0.075$、$\alpha_1 = 0.553$；外层（$k$-$\varepsilon$ 侧）取 $\sigma_{k2} = 1.0$、$\sigma_{\omega 2} = 0.856$、$\beta_2 = 0.0828$、$\alpha_2 = 0.440$；另有 $\beta^{*} = 0.09$、$a_1 = 0.31$、$\kappa = 0.41$。不同软件对 $\alpha$ 与 $\beta$ 的定义（有的用 $\gamma$ 表示）略有差异，迁移时逐项核对。

**近壁与 y+ 要求。**

- 壁面解析：首层 $y^+ \approx 1$，黏性底层内布置 2～3 层，棱柱层总厚度覆盖 1.0～1.2 倍边界层。这是发挥 SST 优势的正解。
- 壁函数模式：$y^+$ 落在 30～300，模型自动退化，适合粗网格快速评估，但分离与摩擦阻力精度下降。
- **避免 $5 < y^+ < 30$ 的缓冲层堆积**：SST 在此处两套行为都不准，是精度最差的区间。计算后必须按面积统计 $y^+$ 分布。

**入口与远场 $\omega$。** 由 $k$、$l$ 换算：

$$
\omega = \frac{k^{1/2}}{C_\mu^{1/4} l}, \qquad k = \frac{3}{2}（U I）^{2}
$$

SST 比纯 $k$-$\omega$ 抗自由流 $\omega$ 干扰，但仍需注意：远场 $\omega$ 取得过小会抬高空域内的 $\mu_t$、改变边界层外缘，取得过大又会抑制湍流。外流入口建议给出小的 $I$（0.5%～1%）并对外场 $\omega$ 做敏感性检查，把换算关系写入报告。

**转捩。** 完全湍流 SST 从入口即按湍流处理，不能自动预测自然转捩。低湍流度来流的翼型阻力对转捩位置极敏感，应使用 $\gamma$-$Re_\theta$ 等经过验证的转捩模型，并让来流湍流度与实测一致。

**数值与网格。** SST 对近壁法向分辨与流向分辨都敏感。棱柱层增长率取 1.1～1.2、最高不超过 1.3；分离泡与尾迹内至少布置十几层以描述剪切。求解建议用二阶迎风或更高阶格式，$\omega$ 的壁面处理需与网格匹配（解析时用零梯度或壁面渐近，壁函数时用对应关系）。强分离下稳态计算可能不收敛，应转向 URANS 或限制欠松弛。

**棱柱层外过渡。** 从棱柱层过渡到核心四面体/六面体时，增长比不要突变，否则单元畸变会污染 $\omega$ 的梯度、影响混合函数。边界层外缘若离壁面过近，混合函数尚未完成切换，等于把 $k$-$\varepsilon$ 行为强加在边界层内，也会造成误差。

## 5 可复现示例

场景：NACA 0012 翼型在 $Re = 6 \times 10^{6}$、攻角接近失速下预测升力与分离。用 SST 壁面解析。

1. 确定尺度：弦长 $c = 1\,\mathrm{m}$，$U = 90\,\mathrm{m/s}$，$\nu = 1.5 \times 10^{-5}\,\mathrm{m^2/s}$，得 $Re = U c/\nu = 6 \times 10^{6}$。
2. 估算壁面剪切：平板式 $C_f \approx 0.026 Re^{-1/7} \approx 0.0028$，$\tau_w = 0.5 C_f \rho U^{2} \approx 13.9\,\mathrm{Pa}$，$u_\tau = \sqrt{\tau_w/\rho} \approx 3.4\,\mathrm{m/s}$。
3. 目标 $y^+ = 1$，首层中心高度 $y_1 = \nu/u_\tau \approx 4.4 \times 10^{-6}\,\mathrm{m}$，首层单元高度约 8.8 μm；冷网格会很重，需权衡。
4. 入口：$I = 0.005$，$l = 0.07 c$，则 $k = 1.5 \times (90 \times 0.005)^2 \approx 0.152\,\mathrm{m^2/s^2}$，$\omega = 0.152^{0.5}/(0.09^{0.25} \times 0.07) \approx 69\,\mathrm{1/s}$；远场用同样口径，并做 $\omega$ 上下浮动 10 倍的敏感性。
5. 走向设置：翼型尾向 400 个单元、法向棱柱层约 30 层、增长率 1.15，分离区与尾迹再做局部加密。
6. 收敛后比较升力系数、壁面压力分布与分离/再附位置，并与实验或高保真数据核对。
7. 做网格无关性与远场 $\omega$ 的敏感性，确认升力、阻力与分离位置对两者的变化在可接受范围内；分离强非定常时改用 URANS 取时均量。
8. 检查壁面距离场 $y$ 与混合函数 $F_1$ 的分布：翼型上下表面的 $F_1$ 应从前缘到后缘平滑地从 1 过渡到 0，若出现突变或异物，说明 $y$ 场或网格有问题。

这套设置的关键取舍是 $y^+$：解析模式把首层压到微米量级，网格量可能比壁函数模式高一个数量级。工程上可先用壁函数模式快速扫攻角范围定位失速区间，再在关注攻角用解析网格精算，用两阶段策略平衡成本与精度。

入口量换算脚本：

```text
输入: U, I, l, Cmu = 0.09
k     = 1.5 * (U * I) ** 2
omega = k ** 0.5 / (Cmu ** 0.25 * l)
y1    = nu / u_tau            # 目标 y+ 约等于 1
打印("k=", k, "omega=", omega, "y1=", y1)
```

若把目标改成壁函数模式（$y^+ = 50$），首层厚度放大到约 0.22 mm，网格量与计算时间大幅下降；代价是放弃黏性底层解析，失速附近的分离预测可信度降低。同一算例跑两套网格、对比积分量与分离位置，是判断“要不要解析边界层”的最直接方式。

## 6 常见坑与排查

- **以为 SST 不需要细网格**：模型再好也依赖分辨率，分离区与尾迹粗会系统性错。
- **首层落在缓冲层**：$y^+ \approx 10$ 附近是 SST 最不准的区间，要么细到 1，要么放到 30 以上。
- **自由流 $\omega$ 随手填**：外场 $\omega$ 影响边界层外缘与 $\mu_t$ 水平，必须换算并做敏感性。
- **转捩问题用完全湍流模型**：低湍流度翼型会高估阻力，需要转捩模型。
- **驻点附近 $k$ 过冲**：若未开启产生项限制，前缘会出现虚假高湍动能，影响压力分布。
- **高马赫数不开可压缩修正**：跨声速激波—边界层干扰需相应修正项。
- **只看升力不看分离位置**：两个量误差方向可能相反，应以主要验收量为准。
- **远场边界太近**：外边界落在边界层或尾迹里会污染入口湍流量，应把远场放到几何尺度几十倍外。
- **把 $\omega$ 当独立可调参数**：$\omega$ 与 $k$、$l$ 绑定，脱离物理换算的调参只会掩盖问题。
- **忽略壁面距离 $y$ 的依赖**：混合函数依赖 $y$，在多体或遮挡几何里壁面距离求解错误会直接破坏混合，需要检查 $y$ 场。
- **粗糙壁未修正**：粗糙度会改变近壁对数律，SST 需开启粗糙度修正，否则摩擦被低估。

## 7 检查清单与参考

1. 流动是否以逆压梯度或分离为主，SST 是否为合适选择？
2. 近壁策略（解析 $y^+ \approx 1$ 还是壁函数 $y^+ > 30$）是否明确，网格是否匹配？
3. 入口 $k$、$\omega$ 是否由 $I$、$l$ 换算，远场 $\omega$ 是否做过敏感性？
4. 是否开启产生项限制与必要的可压缩修正？
5. 分离区、尾迹的流向与展向分辨率是否足够？
6. 是否与另一模型或实验数据对比了升阻力、压力分布与分离位置？
7. 后处理是否报告了按面积统计的 $y^+$ 分布？

参考资料：

1. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications," *AIAA Journal*, 1994.
2. Menter F.R. et al., "Ten Years of Industrial Experience with the SST Turbulence Model," 2003.
3. Wilcox D.C., *Turbulence Modeling for CFD*, DCW Industries.
4. 本项目《RANS 湍流模型选择框架》《壁函数、低雷诺模型与近壁结果判读》《边界层网格、首层高度与 y+ 设计》。
