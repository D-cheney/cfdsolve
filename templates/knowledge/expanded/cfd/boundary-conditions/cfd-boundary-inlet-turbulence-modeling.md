---
template_version: "flowlab-knowledge/1.0"
slug: cfd-boundary-inlet-turbulence-modeling
title: "入口湍流条件：物理建模与适用边界"
summary: "从湍流强度与积分尺度反算 k、ε、ω，说明湍流黏性比作为准入指标的物理含义，给出 OpenFOAM 入口字典写法与不同湍流模型的接口差异。"
category:
  slug: boundary-conditions
  name: "边界条件与初始化"
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "边界条件与初始化"
  - "入口湍流条件"
  - "物理建模与适用边界"
  - "湍流强度"
  - "湍流黏性比"
seo:
  title: "入口湍流条件：物理建模与适用边界"
  description: "从湍流强度与积分尺度反算 k、ε、ω，说明湍流黏性比作为准入指标的物理含义，给出 OpenFOAM 入口字典写法与不同湍流模型的接口差异。"
  keywords:
    - "入口湍流条件"
    - "物理建模与适用边界"
    - "湍动能"
    - "湍流耗散率"
    - "比耗散率"
---

# 入口湍流条件：物理建模与适用边界

入口湍流量是 CFD 中最容易被随手填成"5% 强度"的一类参数，但它的影响完全取决于流型：在管内充分发展流中入口湍流在 5～10 倍管径后被内部生成完全覆盖，而在边界层转捩、分离泡、射流剪切层这类对初始扰动敏感的流动里，入口湍流强度可以直接决定转捩位置和分离区长度。本文给出从强度与尺度反算 $k$、$\varepsilon$、$\omega$ 的完整链条、湍流黏性比这一准入指标，以及双方程模型与一方程模型的接口差异。

## 入口湍流为何在部分流型中被完全遗忘

入口湍流量的"记忆长度"由湍流自身的生成-耗散平衡决定。管流、槽道流这类壁面主导流动中，湍动能主要由近壁剪切生成，内部源项在几个边界层厚度内就把入口信息稀释掉。量化判据是湍流雷诺数

$$
Re_t = \frac{k^2}{\nu \varepsilon}
$$

当 $Re_t \gg 1$ 时湍流充分发展，涡结构的时间尺度远小于入口条件的记忆时间，入口值只影响上游很短一段。反之，自由剪切流（射流、尾迹、混合层）与层流-湍流转捩区没有壁面提供持续生成，入口扰动会被对流输运到下游几十倍尺度处，此时入口湍流量属于一阶参数，必须来自风洞测量或文献关联式，而不是默认值。

## 由强度和尺度反算 k、ε、ω

工程上能直接测到的是湍流强度 $I = u'/U$ 和积分尺度 $L_t$，各向同性假设下湍动能为

$$
k = \frac{3}{2} \left( U I \right)^2
$$

耗散率与比耗散率由 $k$ 和 $L_t$ 闭合，系数来自标准 $k$-$\varepsilon$ 模型，$C_\mu = 0.09$：

$$
\varepsilon = C_\mu^{3/4} \frac{k^{3/2}}{L_t}, \qquad
\omega = \frac{\sqrt{k}}{C_\mu^{1/4} L_t}
$$

其中 $C_\mu^{3/4} = 0.1643$，$C_\mu^{1/4} = 0.5477$。积分尺度无实测时，内流常取 $L_t = 0.07\,D_h$，外流常取 $L_t = 0.07\,\delta$。

一次可核对的手算：风道内 $U = 10\ \mathrm{m/s}$，来流强度 $I = 5\%$，水力直径 $D_h = 0.1\ \mathrm{m}$。先算 $UI = 0.5\ \mathrm{m/s}$，得

$$
k = 1.5 \times 0.5^2 = 0.375\ \mathrm{m^2/s^2}
$$

取 $L_t = 0.07 \times 0.1 = 7.0\times 10^{-3}\ \mathrm{m}$，则 $k^{3/2} = 0.375 \times 0.6124 = 0.2296\ \mathrm{m^3/s^3}$，

$$
\varepsilon = 0.1643 \times \frac{0.2296}{7.0\times 10^{-3}} = 5.39\ \mathrm{m^2/s^3}, \qquad
\omega = \frac{0.6124}{0.5477 \times 7.0\times 10^{-3}} = 160\ \mathrm{s^{-1}}
$$

代入 $Re_t = k^2/(\nu\varepsilon)$，空气 $\nu = 1.5\times 10^{-5}\ \mathrm{m^2/s}$，$k^2 = 0.1406\ \mathrm{m^4/s^4}$，$\nu\varepsilon = 8.09\times 10^{-5}$，得 $Re_t \approx 1.7\times 10^3$。若算得 $Re_t < 100$，则涡黏假设本身站不住，需要改用转捩模型或低雷诺数修正。

## 湍流黏性比才是真正的准入指标

$k$ 与 $\varepsilon$ 单独看都不足以判断入口是否合理，真正的准入指标是它们组合出的涡黏系数与分子黏性之比：

$$
\nu_t = C_\mu \frac{k^2}{\varepsilon}, \qquad \frac{\nu_t}{\nu} = \frac{0.09 \times 0.1406}{5.39 \times 1.5\times 10^{-5}} = \frac{0.01265}{8.09\times 10^{-5}} \approx 156
$$

注意这里用 $\nu_t = C_\mu k^2/\varepsilon = 0.09\times 0.1406/5.39 = 2.35\times 10^{-3}\ \mathrm{m^2/s}$，再除以 $\nu$ 得到比值 156。工程上入口 $\nu_t/\nu$ 常见区间为 $1 \sim 10$（低湍流风洞）、$10 \sim 100$（一般内流）、$100 \sim 1000$（强湍流燃烧器或搅拌槽）。若入口给出 $\nu_t/\nu = 10^5$，涡黏会比实测大三个量级，表现为入口段压降被人为放大、射流扩散角过大。若直接给定 $\nu_t/\nu$，$\varepsilon$ 与 $\omega$ 必须由上式反算，而不能与 $k$ 各自独立指定。

## 双方程与一方程模型的接口差异

标准 $k$-$\varepsilon$、Realizable $k$-$\varepsilon$、$k$-$\omega$ SST 都需要两个入口量，但字段名不同：$k$-$\varepsilon$ 系列要 $k$ 与 $\varepsilon$，$k$-$\omega$ 系列要 $k$ 与 $\omega$，Spalart-Allmaras 只要一个 $\tilde\nu \approx \nu_t$。$\omega$ 在远场对数值极其敏感，SST 模型建议外流入口取 $\omega = 10\,U_\infty/L$ 量级并检查 $\nu_t/\nu$ 落在 $1 \sim 10$，而不是照搬管内公式。

## 与近壁网格分辨率联立

入口 $k$ 还需与近壁网格匹配：管流摩擦系数可用 $C_f \approx 0.079\,Re^{-0.25}$，本例 $Re = U D_h/\nu = 6.67\times 10^4$ 得 $C_f = 0.0049$、$u_\tau = U\sqrt{C_f/2} = 0.496\ \mathrm{m/s}$，故 $y^+ = 1$ 对应首层高度

$$
y_1 = \frac{y^+ \nu}{u_\tau} = \frac{1.5\times 10^{-5}}{0.496} = 3.0\times 10^{-5}\ \mathrm{m} = 0.030\ \mathrm{mm}
$$

壁面函数区要求 $y^+ \approx 30 \sim 300$，首层高度取 $0.9\ \mathrm{mm} \sim 9\ \mathrm{mm}$。入口 $k$ 与近壁网格不匹配时，典型现象是入口段 $y^+$ 分布突跳。

## OpenFOAM 入口字典写法

```text
boundaryField
{
    inlet
    {
        type            turbulentIntensityKineticEnergyInlet;
        intensity       0.05;                       // I = 5%
        value           uniform 0.375;              // k = 1.5*(10*0.05)^2
    }
}

// 0/epsilon：由混合长度驱动，L_t = 0.07*D_h = 7 mm
boundaryField
{
    inlet
    {
        type            turbulentMixingLengthDissipationRateInlet;
        mixingLength    0.007;
        value           uniform 5.39;
    }
}

// 0/omega（SST 时替换 epsilon）
boundaryField
{
    inlet
    {
        type            turbulentMixingLengthFrequencyInlet;
        mixingLength    0.007;
        value           uniform 160;
    }
}
```

用 `mixingLength` 驱动的好处是 $k$ 与 $\varepsilon$ 强制满足同一 $L_t$。运行后用 `fieldMinMax` 检查入口面数值，用 `turbulenceFields` 输出 $\nu_t$ 场确认 $\nu_t/\nu$。

## 失败模式对照

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 入口段压降比文献值高 30% 以上 | 入口 $\nu_t/\nu$ 给到 $10^4$ 量级，涡黏过大 | 输出入口面 $\nu_t/\nu$，应落在 $10 \sim 100$（一般内流） |
| 射流扩散角明显大于实验 | 入口 $k$ 偏大或 $L_t$ 偏小，耗散不足 | 固定 $k$ 改 $L_t$ 做两点对照，看扩散角是否随 $\varepsilon$ 单调变化 |
| SST 算例远场出现异常耗散 | 入口 $\omega$ 直接套用管内公式，数值过大 | 改用 $\omega = 10U_\infty/L$ 估算并复核 $\nu_t/\nu$ |
| 转捩位置比实验提前很多 | 入口 $I$ 用了默认 5%，而实验为 0.1% | 把 $I$ 降到风洞实测值，观察转捩点是否后移 |
| 入口面 $k$ 与给定值不符 | 场文件被后续 `setFields` 或映射覆盖 | `postProcess -func 'fieldMinMax' -latestTime` 直接读入口面数值 |
| 收敛后入口附近 $y^+$ 突跳 | 壁面函数区使用了 $y^+ \approx 1$ 的网格 | 输出壁面 $y^+$，检查入口段与下游是否落在同一区间 |

## 参考文献

1. Pope S.B., *Turbulent Flows*, Cambridge University Press, 2000.
2. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
3. Spalart P.R., Rumsey C.L., "Effective Inflow Conditions for Turbulence Models in Aerodynamic Calculations", *AIAA Journal*, 45(10), 2544-2553, 2007.
4. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications", *AIAA Journal*, 32(8), 1598-1605, 1994.
5. ANSYS Inc., *ANSYS Fluent Theory Guide*, Release 2023R1, 2023.
