---
template_version: flowlab-knowledge/1.0
slug: cfd-boundary-inlet-turbulence-modeling
title: 入口湍流条件：原理与诊断验证
summary: >-
  从湍流强度与积分尺度反算 k、ε、ω，说明湍流黏性比作为准入指标的物理含义，给出 OpenFOAM 入口字典写法与不同湍流模型的接口差异。
  全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: boundary-conditions
  name: 边界条件与初始化
level: 进阶
reading_minutes: 18
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 边界条件与初始化
  - 入口湍流条件
  - 物理建模与适用边界
  - 湍流强度
  - 湍流黏性比
  - 结果诊断与可信度验证
  - 湍流衰减
  - 积分尺度
seo:
  title: 入口湍流条件：原理与诊断验证
  description: >-
    从湍流强度与积分尺度反算 k、ε、ω，说明湍流黏性比作为准入指标的物理含义，给出 OpenFOAM 入口字典写法与不同湍流模型的接口差异。
    全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 入口湍流条件
    - 物理建模与适用边界
    - 湍动能
    - 湍流耗散率
    - 比耗散率
    - 结果诊断与可信度验证
    - 湍流衰减指数
    - 积分尺度
    - 热丝测量
---
# 入口湍流条件：原理与诊断验证

## 原理与适用范围

入口湍流量是 CFD 中最容易被随手填成"5% 强度"的一类参数，但它的影响完全取决于流型：在管内充分发展流中入口湍流在 5～10 倍管径后被内部生成完全覆盖，而在边界层转捩、分离泡、射流剪切层这类对初始扰动敏感的流动里，入口湍流强度可以直接决定转捩位置和分离区长度。本文给出从强度与尺度反算 $k$、$\varepsilon$、$\omega$ 的完整链条、湍流黏性比这一准入指标，以及双方程模型与一方程模型的接口差异。

### 入口湍流为何在部分流型中被完全遗忘

入口湍流量的"记忆长度"由湍流自身的生成-耗散平衡决定。管流、槽道流这类壁面主导流动中，湍动能主要由近壁剪切生成，内部源项在几个边界层厚度内就把入口信息稀释掉。量化判据是湍流雷诺数

$$
Re_t = \frac{k^2}{\nu \varepsilon}
$$

当 $Re_t \gg 1$ 时湍流充分发展，涡结构的时间尺度远小于入口条件的记忆时间，入口值只影响上游很短一段。反之，自由剪切流（射流、尾迹、混合层）与层流-湍流转捩区没有壁面提供持续生成，入口扰动会被对流输运到下游几十倍尺度处，此时入口湍流量属于一阶参数，必须来自风洞测量或文献关联式，而不是默认值。

### 由强度和尺度反算 k、ε、ω

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

### 湍流黏性比才是真正的准入指标

$k$ 与 $\varepsilon$ 单独看都不足以判断入口是否合理，真正的准入指标是它们组合出的涡黏系数与分子黏性之比：

$$
\nu_t = C_\mu \frac{k^2}{\varepsilon}, \qquad \frac{\nu_t}{\nu} = \frac{0.09 \times 0.1406}{5.39 \times 1.5\times 10^{-5}} = \frac{0.01265}{8.09\times 10^{-5}} \approx 156
$$

注意这里用 $\nu_t = C_\mu k^2/\varepsilon = 0.09\times 0.1406/5.39 = 2.35\times 10^{-3}\ \mathrm{m^2/s}$，再除以 $\nu$ 得到比值 156。工程上入口 $\nu_t/\nu$ 常见区间为 $1 \sim 10$（低湍流风洞）、$10 \sim 100$（一般内流）、$100 \sim 1000$（强湍流燃烧器或搅拌槽）。若入口给出 $\nu_t/\nu = 10^5$，涡黏会比实测大三个量级，表现为入口段压降被人为放大、射流扩散角过大。若直接给定 $\nu_t/\nu$，$\varepsilon$ 与 $\omega$ 必须由上式反算，而不能与 $k$ 各自独立指定。

### 双方程与一方程模型的接口差异

标准 $k$-$\varepsilon$、Realizable $k$-$\varepsilon$、$k$-$\omega$ SST 都需要两个入口量，但字段名不同：$k$-$\varepsilon$ 系列要 $k$ 与 $\varepsilon$，$k$-$\omega$ 系列要 $k$ 与 $\omega$，Spalart-Allmaras 只要一个 $\tilde\nu \approx \nu_t$。$\omega$ 在远场对数值极其敏感，SST 模型建议外流入口取 $\omega = 10\,U_\infty/L$ 量级并检查 $\nu_t/\nu$ 落在 $1 \sim 10$，而不是照搬管内公式。

### 与近壁网格分辨率联立

入口 $k$ 还需与近壁网格匹配：管流摩擦系数可用 $C_f \approx 0.079\,Re^{-0.25}$，本例 $Re = U D_h/\nu = 6.67\times 10^4$ 得 $C_f = 0.0049$、$u_\tau = U\sqrt{C_f/2} = 0.496\ \mathrm{m/s}$，故 $y^+ = 1$ 对应首层高度

$$
y_1 = \frac{y^+ \nu}{u_\tau} = \frac{1.5\times 10^{-5}}{0.496} = 3.0\times 10^{-5}\ \mathrm{m} = 0.030\ \mathrm{mm}
$$

壁面函数区要求 $y^+ \approx 30 \sim 300$，首层高度取 $0.9\ \mathrm{mm} \sim 9\ \mathrm{mm}$。入口 $k$ 与近壁网格不匹配时，典型现象是入口段 $y^+$ 分布突跳。

### OpenFOAM 入口字典写法

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

### 失败模式对照

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 入口段压降比文献值高 30% 以上 | 入口 $\nu_t/\nu$ 给到 $10^4$ 量级，涡黏过大 | 输出入口面 $\nu_t/\nu$，应落在 $10 \sim 100$（一般内流） |
| 射流扩散角明显大于实验 | 入口 $k$ 偏大或 $L_t$ 偏小，耗散不足 | 固定 $k$ 改 $L_t$ 做两点对照，看扩散角是否随 $\varepsilon$ 单调变化 |
| SST 算例远场出现异常耗散 | 入口 $\omega$ 直接套用管内公式，数值过大 | 改用 $\omega = 10U_\infty/L$ 估算并复核 $\nu_t/\nu$ |
| 转捩位置比实验提前很多 | 入口 $I$ 用了默认 5%，而实验为 0.1% | 把 $I$ 降到风洞实测值，观察转捩点是否后移 |
| 入口面 $k$ 与给定值不符 | 场文件被后续 `setFields` 或映射覆盖 | `postProcess -func 'fieldMinMax' -latestTime` 直接读入口面数值 |
| 收敛后入口附近 $y^+$ 突跳 | 壁面函数区使用了 $y^+ \approx 1$ 的网格 | 输出壁面 $y^+$，检查入口段与下游是否落在同一区间 |

### 参考文献

1. Pope S.B., *Turbulent Flows*, Cambridge University Press, 2000.
2. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
3. Spalart P.R., Rumsey C.L., "Effective Inflow Conditions for Turbulence Models in Aerodynamic Calculations", *AIAA Journal*, 45(10), 2544-2553, 2007.
4. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications", *AIAA Journal*, 32(8), 1598-1605, 1994.
5. ANSYS Inc., *ANSYS Fluent Theory Guide*, Release 2023R1, 2023.

## 诊断与可信度验证

入口湍流量无法通过"再算一遍看结果变不变"来验证，因为它本身没有内部生成源提供参照。可验证的做法只有一条：沿流向布置采样线，把计算得到的湍动能衰减曲线与风洞或文献给出的网格湍流衰减律对齐，并用自相关函数独立估计积分尺度，两者一致才说明入口的 $k$ 与 $\varepsilon$ 是配套的。本文给出这条验证链的完整算式、一次可核对的手算和一份可直接运行的诊断脚本。

### 入口湍流量的验证只有衰减曲线可用

内流中入口湍流量在几倍管径后被壁面生成覆盖，验证退化为"改不改结果都一样"，无法分辨对错。自由来流、格栅湍流、风洞试验段这类无壁面生成的情形才有诊断价值：湍流在这里只耗散不生成，衰减曲线是入口条件留下的唯一指纹。判据是幂律指数：各向同性网格湍流的湍动能随下游距离按

$$
k(x) = k_0 \left( \frac{x}{x_0} \right)^{-n}, \qquad n \approx 1.0 \sim 1.3
$$

衰减，指数 $n$ 由格栅几何决定而与入口强度基本无关。因此**入口条件是否可信，等价于计算出的 $n$ 是否落在实验区间**。若算出的 $n$ 接近 0，说明耗散被严重低估（$\varepsilon$ 给得过小或数值耗散过弱）；若 $n > 2$，说明入口 $k$ 太高或 $\varepsilon$ 太大，湍流在入口下游几步内就被抹掉。

### 一次可核对的衰减换算

某风洞试验段来流 $U = 15\ \mathrm{m/s}$，热丝在 $x_0 = 0.5\ \mathrm{m}$ 处测得 $k_0 = 0.30\ \mathrm{m^2/s^2}$。由 $k = 1.5 (UI)^2$ 反算入口强度：

$$
Tu_0 = \frac{\sqrt{2k_0/3}}{U} = \frac{\sqrt{0.2}}{15} = \frac{0.4472}{15} = 2.98\%
$$

设实验拟合给出 $n = 1.15$。在 $x = 4.0\ \mathrm{m}$ 处，$x/x_0 = 8$，

$$
\left( \frac{x}{x_0} \right)^{-n} = 8^{-1.15} = e^{-1.15 \times 2.0794} = e^{-2.3913} = 0.0915
$$

$$
k(4\ \mathrm{m}) = 0.30 \times 0.0915 = 0.0275\ \mathrm{m^2/s^2}, \qquad
Tu(4\ \mathrm{m}) = \frac{\sqrt{2 \times 0.0275/3}}{15} = \frac{0.1354}{15} = 0.90\%
$$

注意强度按 $Tu \propto \sqrt{k}$ 衰减，所以 $Tu$ 的等效指数是 $n/2 = 0.575$，而不是 $n$ 本身——把强度直接按 $k$ 的指数外推是常见错误。若 CFD 在同一位置给出 $Tu = 2.5\%$，相对偏差 $E = |0.90 - 2.50|/0.90 = 178\%$，说明入口 $\varepsilon$ 比应有值小了一个量级以上。

### 由衰减曲线反推耗散率

无生成时湍动能收支退化为 $\mathrm{d}k/\mathrm{d}t = -\varepsilon$，配合泰勒冻结假设 $\mathrm{d}k/\mathrm{d}t = -U\,\mathrm{d}k/\mathrm{d}x$，可得

$$
\varepsilon(x) = n\,U\,k_0\,x_0^{\,n}\,x^{-(n+1)}
$$

代入 $x = 4\ \mathrm{m}$：$x_0^{\,n} = 0.5^{1.15} = 0.4506$，$x^{-(n+1)} = 4^{-2.15} = 0.0508$，

$$
\varepsilon = 1.15 \times 15 \times 0.30 \times 0.4506 \times 0.0508 = 0.118\ \mathrm{m^2/s^3}
$$

再用 $\varepsilon = C_\mu^{3/4} k^{3/2}/L_t$ 反解尺度，$k^{3/2} = 0.00456\ \mathrm{m^3/s^3}$：

$$
L_t = \frac{0.1643 \times 0.00456}{0.118} = 6.3\times 10^{-3}\ \mathrm{m} = 6.3\ \mathrm{mm}
$$

涡黏系数 $\nu_t = C_\mu k^2/\varepsilon = 0.09 \times 7.56\times 10^{-4}/0.118 = 5.75\times 10^{-4}\ \mathrm{m^2/s}$，与空气 $\nu = 1.5\times 10^{-5}$ 之比为 38，落在风洞来流的合理区间。这三个量互相闭合，说明"衰减指数—耗散率—积分尺度"是同一套自洽的参数。

### 用自相关函数独立估计积分尺度

$L_t$ 的独立来源是单点时间序列的自相关函数。由泰勒冻结假设，空间积分尺度等于时间自相关在延迟上的积分乘以对流速度：

$$
L_{11} = U \int_0^{\infty} \rho_{11}(\tau)\,\mathrm{d}\tau, \qquad \rho_{11}(\tau) = \frac{\overline{u'(t)u'(t+\tau)}}{\overline{u'^2}}
$$

工程上常取 $\rho_{11}$ 降到 $1/e = 0.368$ 的延迟 $\tau_{1/e}$ 近似积分尺度。若热丝在 $U = 15\ \mathrm{m/s}$ 下测得 $\tau_{1/e} = 0.42\ \mathrm{ms}$，则

$$
L_{11} \approx U\,\tau_{1/e} = 15 \times 4.2\times 10^{-4} = 6.3\times 10^{-3}\ \mathrm{m} = 6.3\ \mathrm{mm}
$$

与上面由衰减曲线反解出的 $6.3\ \mathrm{mm}$ 完全一致。两条独立路径给出同一尺度，是入口条件可信的强证据；若二者相差 3 倍以上，应优先怀疑采样频率不足（时间序列被低通滤波，自相关被拉宽）或衰减拟合区间选在了近场非自相似区。

### 失败模式对照

验证报告应把误差分成三层：输入层（实验 $I$ 与 $L_t$ 的测量不确定度，$5\% \sim 15\%$）、模型层（涡黏假设对无生成衰减的适用性，$10\% \sim 30\%$）、数值层（采样位置、网格分辨率、数值耗散，$3\% \sim 10\%$）。三层之和给出 $k$ 的不确定度上界。

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 拟合出的衰减指数 $n \approx 0$ | 耗散率给得过小，湍流几乎不衰减 | 沿流向采样 $k$ 并拟合 $\ln k$ 对 $\ln(x/x_0)$ 的斜率 |
| 拟合出 $n > 2$ | 入口 $k$ 偏高或 $\varepsilon$ 偏大 | 用 $\varepsilon = C_\mu^{3/4}k^{3/2}/L_t$ 反算应有 $\varepsilon$ 并对比 |
| 自相关积分尺度与衰减反解尺度差 3 倍 | 采样频率不足，时间序列被低通滤波 | 提高采样率重算 $\rho_{11}$，看 $\tau_{1/e}$ 是否缩短 |
| 同一下游位置 $Tu$ 比实验高 1 倍以上 | 强度按 $k$ 的指数外推，忽略了 $Tu \propto \sqrt{k}$ | 用 $n/2$ 作为强度的等效衰减指数重新外推 |
| $\nu_t/\nu$ 在采样段内单调升到 300 | 采样落在远场耗散区，$L_t$ 已不代表入口 | 把采样段前移到 $x/x_0 < 8$，检查 $\nu_t/\nu$ 是否稳定 |
| 加密流向网格后 $n$ 明显漂移 | 数值耗散主导了衰减 | 用二阶以上对流格式重算，比较 $n$ 的漂移量 |

### 诊断脚本

```python
import numpy as np

# 采样线数据: x [m], k [m2/s2]
x = np.array([0.5, 1.0, 2.0, 4.0, 6.0])
k = np.array([0.300, 0.152, 0.0650, 0.0275, 0.0160])

n_fit = -np.polyfit(np.log(x / x[0]), np.log(k / k[0]), 1)[0]
print(f"衰减指数 n = {n_fit:.2f}  (实验区间 1.0 ~ 1.3)")

U, nu, Cmu = 15.0, 1.5e-5, 0.09
eps = n_fit * U * k[0] * (x / x[0]) ** (-(n_fit + 1)) / x * x[0]
Lt = Cmu ** 0.75 * k ** 1.5 / eps
nu_t = Cmu * k ** 2 / eps
for xi, ki, ei, li, ri in zip(x, k, eps, Lt, nu_t / nu):
    print(f"x={xi:4.1f} m  k={ki:.4f} m2/s2  eps={ei:.4f} m2/s3  "
          f"Lt={li*1e3:.2f} mm  nu_t/nu={ri:6.1f}")

Tu = np.sqrt(2 * k / 3) / U
print("Tu [%] =", np.round(Tu * 100, 3))
```

脚本输出 $n$、逐点 $\varepsilon$、$L_t$ 与 $\nu_t/\nu$，与热丝数据并列即可判断入口是否可信。若 $\nu_t/\nu$ 在采样段内从 38 单调升到 300，说明采样落在了远场耗散区，$L_t$ 已不再代表入口尺度，需要把入口按同一 $L_t$ 重新标定。

### 参考文献

1. Roach P.E., "The generation of nearly isotropic turbulence by means of grids", *International Journal of Heat and Fluid Flow*, 8(2), 82-92, 1987.
2. Comte-Bellot G., Corrsin S., "The use of a contraction to improve the isotropy of grid-generated turbulence", *Journal of Fluid Mechanics*, 25(4), 657-682, 1966.
3. Pope S.B., *Turbulent Flows*, Cambridge University Press, 2000.
4. ASME Standards Committee, *Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, ASME V&V 20-2009, New York, 2009.
5. Spalart P.R., Rumsey C.L., "Effective Inflow Conditions for Turbulence Models in Aerodynamic Calculations", *AIAA Journal*, 45(10), 2544-2553, 2007.
