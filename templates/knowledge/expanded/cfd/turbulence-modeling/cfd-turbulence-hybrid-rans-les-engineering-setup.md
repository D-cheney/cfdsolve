---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-hybrid-rans-les-engineering-setup
title: "DES 与混合 RANS–LES：工程设置与参数选择"
summary: "DES 与 DDES 的落地设置：DES 长度尺度与 C_DES 的取值口径、由对数律关系推出模型切换位置并说明为何必须加屏蔽函数、按边界层厚度反推网格间距、时间步与统计窗口，以及 OpenFOAM 的模型配置。"
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
  - "DES 与混合 RANS–LES"
  - "工程设置与参数选择"
  - "延迟函数"
  - "网格诱导分离"
seo:
  title: "DES 与混合 RANS–LES：工程设置与参数选择"
  description: "DES 与 DDES 的落地设置：DES 长度尺度与 C_DES 的取值口径、由对数律关系推出模型切换位置并说明为何必须加屏蔽函数、按边界层厚度反推网格间距、时间步与统计窗口，以及 OpenFOAM 的模型配置。"
  keywords:
    - "DES 与混合 RANS–LES"
    - "工程设置与参数选择"
    - "延迟函数"
    - "网格诱导分离"
    - "DES 长度尺度"
---

# DES 与混合 RANS–LES：工程设置与参数选择

混合方法的核心参数只有一个——模型在离壁多远的地方从 RANS 切换到 LES。这个位置不是用户直接设定的，而是由网格间距和湍流长度尺度共同决定，因此可以算出来，也必须算出来。用对数律关系推出切换位置后，就能解释为什么原始 DES 在细网格上会产生网格诱导分离，以及为什么 DDES 的屏蔽函数是必需的。本文以扩张通道台阶流为例，台阶高度 $H = 0.05\,\mathrm{m}$、来流 $U = 11.25\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$，即 $Re_H = 3.75\times10^{4}$，来流边界层厚度 $\delta = 1.1H = 0.055\,\mathrm{m}$。

## 1 DES 长度尺度与模型常数的切换

DES 把 RANS 的湍流长度尺度 $L_t$ 替换为

$$L_{DES} = \min\left(L_t,\; C_{DES}\Delta\right), \qquad \Delta = \max\left(\Delta x, \Delta y, \Delta z\right)$$

湍流黏度随之缩放为 $\nu_t^{DES} = \nu_t^{RANS}\cdot L_{DES}/L_t$。基于 SST 的 $L_t = \sqrt{k}/(\beta^{*}\omega)$，$C_{DES}$ 由内外层常数按 $F_1$ 混合：$C_{DES}^{k-\varepsilon} = 0.61$、$C_{DES}^{k-\omega} = 0.78$。基于 SA 的模型统一取 $C_{DES} = 0.61$。迁移算例时最常见的错误是把 0.61 填给基于 SST 的实现，或反过来，这会直接改变切换位置约 28%。

$\Delta$ 的定义同样关键。$C_{DES}\Delta$ 用的是单元三个方向的最大边长，因此展向稍细并不改变切换位置，而壁法向一旦变粗就会推迟切换。用 `cubeRootVol`（体积立方根）会得到比 `maxDeltaxyz` 更大的 $\Delta$，两者在高度各向异性的边界层网格里差别可达 2 倍以上，必须与文献口径一致。

## 2 延迟函数如何屏蔽边界层

在对数律区，两个尺度有闭式关系：

$$k = \frac{u_\tau^{2}}{\sqrt{C_\mu}}, \qquad \omega = \frac{u_\tau}{\sqrt{\beta^{*}}\,\kappa y} \;\Longrightarrow\; L_t = \frac{\kappa y}{\sqrt{\beta^{*}}\,C_\mu^{1/4}} = 2.5\,y$$

代入 $\kappa = 0.41$、$\beta^{*} = 0.09$、$C_\mu = 0.09$ 得系数 2.5。于是原始 DES 的切换条件 $C_{DES}\Delta = L_t$ 给出切换高度

$$y_{\text{switch}} = \frac{C_{DES}\Delta}{2.5}$$

取壁面平行间距 $\Delta = 0.1\delta = 5.5\,\mathrm{mm}$、$C_{DES} = 0.61$，得 $y_{\text{switch}} = 1.34\,\mathrm{mm} = 0.024\delta$——模型在离壁 1.34 mm 处就切到 LES，边界层内部被强行降级，这就是网格诱导分离与模化应力耗尽的来源。要让切换点落到边界层之外，需要 $C_{DES}\Delta > 2.5\delta$，即 $\Delta > 4.1\delta = 0.23\,\mathrm{m}$，工程上无法实现。这正是 DDES 存在的原因。

DDES 用延迟函数把边界层屏蔽掉：

$$f_d = 1 - \tanh\left[\left(C_{d1}r_d\right)^{C_{d2}}\right], \qquad r_d = \frac{\nu_t + \nu}{\sqrt{U_{i,j}U_{i,j}}\;\kappa^{2}d^{2}}$$

取 $C_{d1} = 8$、$C_{d2} = 3$，长度尺度改为 $L_{DES} = L_t - f_d\max\left(0,\; L_t - C_{DES}\Delta\right)$。把对数律区的 $\nu_t = \kappa u_\tau y$ 与 $\sqrt{U_{i,j}U_{i,j}} \approx u_\tau/(\kappa y)$ 代入 $r_d$，得 $r_d = 1$；于是 $f_d = 1 - \tanh(8^{3}) = 1 - \tanh(512) \approx 0$，边界层内完全保持 RANS。$f_d$ 在 $r_d \approx 0.1$ 附近从 0 快速升到 0.5，因此后处理时可直接把 $r_d > 0.2$ 的区域判为 RANS 区、$r_d < 0.1$ 的区域判为 LES 区。

## 3 网格设计：从边界层厚度反推间距

| 区域 | 流向与展向间距 | 壁法向首层 | 依据 |
|---|---|---|---|
| 附着边界层（DES97） | $\ge 0.1\delta = 5.5\,\mathrm{mm}$ | $y^{+} \approx 1$，约 50 μm | 间距不得细于 0.1δ，否则切换点深入边界层 |
| 附着边界层（DDES） | 可细至 $0.05\delta$ | $y^{+} \approx 1$，约 50 μm | 屏蔽函数已接管，不受 0.1δ 限制 |
| 分离剪切层与回流区 | $\delta/20 \approx 2.8\,\mathrm{mm}$ | — | 解析 Kelvin–Helmholtz 不稳定性 |

首层高度由壁面剪切反算：$C_f = 0.026\,Re_\delta^{-1/7} = 5.70\times10^{-3}$，$Re_\delta = 4.13\times10^{4}$，故 $\tau_w = 0.433\,\mathrm{Pa}$、$u_\tau = 0.600\,\mathrm{m/s}$、$\nu/u_\tau = 25.0\,\mathrm{\mu m}$，$y^{+} = 1$ 对应单元高度 50 μm。若改用壁面模化的 IDDES 路线，首层可放宽到 $y^{+} \approx 30$，对应单元高度 1.50 mm，网格量下降一个量级。

## 4 时间推进与统计采样

时间步按 LES 区的对流 CFL 定：取 $\Delta x = 3\,\mathrm{mm}$、$\mathrm{CFL} = 0.5$，得 $\Delta t = 0.5\times0.003/11.25 = 1.33\times10^{-4}\,\mathrm{s}$。台阶流的特征时间是大尺度流动通过时间 $L/U = 1.0/11.25 = 0.089\,\mathrm{s}$，统计需要约 30 个通过时间，即 2.67 s、约 20000 步。瞬态舍弃段取 5 个通过时间。

与 LES 不同的是，DES 的时均量在 RANS 区与 LES 区的时间尺度不同，因此统计窗口要按 LES 区的要求定，不能按 RANS 的“几百次迭代”概念套用。

## 5 求解器配置与 DES 相关输出量

```cpp
// constant/momentumTransport
simulationType  RAS;
RAS
{
    model           kOmegaSSTDDES;
    turbulence      on;
    delta           maxDeltaxyz;   // 与 C_DES 口径配套，勿随意改
    printCoeffs     on;
}
```

必须输出的三个场用于验收：$r_d$ 与 $f_d$（判断屏蔽是否生效）、$L_{DES}/L_t$（判断模型是否切换）、以及 $\nu_t^{DES}/\nu_t^{RANS}$（量化切换幅度）。这三个量在 OpenFOAM 中可用 `fieldExpression` 函数对象从 $k$、$\omega$、$y$ 与网格尺寸组合得到，无需修改求解器。

## 6 常数与网格失配的判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 附着段壁面摩擦比 RANS 低 20% | 切换点深入边界层，模化应力耗尽 | 输出 $y_{\text{switch}} = C_{DES}\Delta/2.5$，与 $y^{+}$ 剖面比对 |
| $f_d$ 在边界层内升到 0.5 以上 | $r_d$ 偏小，通常因 $d$ 场错误或 $\nu_t$ 被低估 | 用对数律区 $r_d = 1$ 的性质检查该处 $r_d$ 计算 |
| 改用 `cubeRootVol` 后分离点后移 8% | $\Delta$ 变大，切换点被推离壁面 | 固定 $C_{DES}$，比较两种 $\Delta$ 定义下的 $L_{DES}/L_t$ 场 |
| 回流区长度比实验短 15% | 剪切层分辨率不足，Kelvin–Helmholtz 卷起被压制 | 只加密分离剪切层流向网格，看回流区是否延长 |
| 切换到 LES 后速度谱仍无惯性子区 | $\Delta$ 在尾迹区过大，LES 分支分辨不足 | 检查尾迹区 $\Delta/\eta$ 是否超过 20 |
| 时均量与 RANS 结果几乎相同 | 网格过粗，$C_{DES}\Delta$ 始终大于 $L_t$，模型从未切换 | 输出 $L_{DES}/L_t$ 的最小值，应显著小于 1 |

## 7 混合方法原始文献与实验数据

1. Spalart P. R., Jou W.-H., Strelets M., Allmaras S. R., "Comments on the feasibility of LES for wings, and on a hybrid RANS/LES approach," *Advances in DNS/LES*, 1997.
2. Spalart P. R., Deck S., Shur M. L., Squires K. D., Strelets M. K., Travin A., "A new version of detached-eddy simulation, resistant to ambiguous grid densities," *Theoretical and Computational Fluid Dynamics*, 2006.
3. Shur M. L., Spalart P. R., Strelets M. K., Travin A. K., "A hybrid RANS-LES approach with delayed-DES and wall-modelled LES capabilities," *International Journal of Heat and Fluid Flow*, 2008.
4. Driver D. M., Seegmiller H. L., "Features of a reattaching turbulent shear layer in divergent channel flow," *AIAA Journal*, 1985.
