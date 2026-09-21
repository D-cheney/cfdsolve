---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-laminar-transition-modeling
title: "层流到湍流的转捩：物理建模与适用边界"
summary: "转捩有三条互不相同的物理路径：自然转捩、旁路转捩与分离诱导转捩。本文说明各自的触发条件、e^N 与 γ-Re_θ 两类模型的适用域、N 值与粗糙度门槛的取值依据及失效信号。"
category:
  slug: physics
  name: "流体力学基础"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "流体力学基础"
  - "层流到湍流的转捩"
  - "物理建模与适用边界"
  - "e^N 方法"
  - "γ-Re_θ 模型"
seo:
  title: "层流到湍流的转捩：物理建模与适用边界"
  description: "转捩有三条互不相同的物理路径：自然转捩、旁路转捩与分离诱导转捩。本文说明各自的触发条件、e^N 与 γ-Re_θ 两类模型的适用域、N 值与粗糙度门槛的取值依据及失效信号。"
  keywords:
    - "层流到湍流的转捩"
    - "物理建模与适用边界"
    - "e^N 方法"
    - "γ-Re_θ 模型"
---

# 层流到湍流的转捩：物理建模与适用边界

把转捩当成"层流模型与湍流模型之间的开关"是绝大多数转捩算例失真的起点。实际存在三条触发机理不同、参数依赖不同的路径，选错路径等于用错了模型。本文按机理分类，给出每类机理对应的建模方法、关键参数取值依据与失效信号，并附可直接使用的求解器配置。

## 1 三条转捩路径与各自的判据

- **自然转捩**：来流湍流度极低（$Tu < 0.1\%$）时，Tollmien-Schlichting 波线性增长后非线性失稳。触发参数是稳定性特性，用 $e^N$ 方法描述。
- **旁路转捩**：来流湍流度较高（$Tu \gtrsim 1\%$）时，来流中的长条涡直接侵入边界层，跳过 T-S 波阶段。触发参数是 $Tu$ 与动量厚度雷诺数。
- **分离诱导转捩**：逆压梯度下层流边界层先分离，剪切层在分离泡内迅速失稳并转捩，再附为湍流。常见于低压涡轮叶片与低雷诺数翼型。

三者的判据不能互换。用旁路转捩关联式去算安静风洞中的自然转捩，会把转捩点提前 2～3 倍；反过来用 $N = 9$ 的 $e^N$ 去算 $Tu = 3\%$ 的工况，转捩点会晚得离谱。

## 2 自然转捩：无量纲频率与 e^N 方法

T-S 波的频率用无量纲量 $F$ 表示：

$$
F = \frac{2\pi f \nu}{U_\infty^{2}}
$$

取 $U_\infty = 30\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$，临界 $F \approx 100\times10^{-6}$ 对应的物理频率为 $f = F U_\infty^{2}/(2\pi\nu) = 100\times10^{-6}\times900/(9.425\times10^{-5}) = 955\,\mathrm{Hz}$。这个数字决定了时间推进算例的时间步与采样率：要分辨 955 Hz 的扰动，采样率至少 10 kHz。

$e^N$ 方法追踪最不稳定波的累积放大率，转捩判据为

$$
N(x) = \int_{x_0}^{x} \left(-\alpha_i\right)\mathrm{d}x \ge N_{\text{crit}}
$$

$N_{\text{crit}}$ 与来流湍流度强相关，工程取值：$Tu < 0.1\%$（安静风洞、高空）取 $N = 9$；$Tu \approx 1\%$ 取 $N = 4$；旁路转捩区（$Tu > 2\%$）取 $N = 1\sim2$。把 $N = 9$ 用于 $Tu = 2\%$ 的风洞工况，转捩点会晚到接近尾缘。

## 3 旁路转捩：以 Re_θ 为中介的关联

旁路转捩用动量厚度雷诺数与湍流度的关联描述：

$$
Re_\theta = \frac{\rho U \theta}{\mu}, \qquad Re_{\theta,t} = 163 + \exp\left(6.91-Tu\right)
$$

$Tu$ 以百分数代入，$Tu = 1\%$ 得 532，$Tu = 3\%$ 得 213。注意 $Tu$ 必须由湍动能换算，而不是拍一个数：

$$
Tu = \frac{\sqrt{2k/3}}{U_\infty}\times100\%, \qquad k = \frac{3}{2}\left(U_\infty Tu\right)^{2}
$$

反算一下：若希望入口 $Tu = 1\%$、$U_\infty = 30\,\mathrm{m/s}$，则 $k = 1.5\times(0.3)^{2} = 0.135\,\mathrm{m^2/s^2}$。这是可以直接写进入口边界的数值。

## 4 分离诱导转捩与粗糙度

分离诱导转捩不依赖来流扰动，只要分离泡长度超过约 1 倍边界层厚度就会转捩。建模时若使用不含分离诱导机制的模型，层流分离泡会被算成稳定的死水区，阻力与再附点位置全错。$\gamma$-$Re_\theta$ 模型通过输运方程处理这一机制：

$$
\frac{\partial\left(\rho\gamma\right)}{\partial t} + \frac{\partial\left(\rho U_j\gamma\right)}{\partial x_j} = P_\gamma - E_\gamma + \frac{\partial}{\partial x_j}\left[\left(\mu+\frac{\mu_t}{\sigma_\gamma}\right)\frac{\partial\gamma}{\partial x_j}\right]
$$

$\gamma$ 为间歇因子，在层流区为 0、湍流区为 1，转捩区内从 0 平滑过渡到 1。模型还需要一个 $Re_{\theta t}$ 输运方程，其入口值由 $Tu$ 与压力梯度关联式给出。

壁面粗糙度用摩擦速度雷诺数判断影响：

$$
k_s^{+} = \frac{k_s u_\tau}{\nu}
$$

$k_s^{+} < 5$ 为水力光滑，$k_s^{+} > 70$ 为完全粗糙。平板算例中 $U_\infty = 30\,\mathrm{m/s}$ 时湍流段 $u_\tau \approx 1.21\,\mathrm{m/s}$，故 $k_s = 62\,\mu\mathrm{m}$ 对应水力光滑上限，$k_s = 0.87\,\mathrm{mm}$ 进入完全粗糙区。风洞模型表面加工到 $Ra < 5\,\mu\mathrm{m}$ 通常可以忽略粗糙度；而喷砂表面（$k_s \approx 100\,\mu\mathrm{m}$）足以让转捩提前。

## 5 求解器配置示例

OpenFOAM 中使用 $\gamma$-$Re_\theta$ 模型需要额外的两个场与正确的入口换算：

```cpp
// constant/momentumTransport
simulationType  RAS;
RAS
{
    RASModel        kOmegaSSTLM;   // Langtry-Menter 关联式转捩模型
    turbulence      on;
    printCoeffs     on;
}

// 0/k      inlet: 由 Tu 换算, Tu=1%, U=30 m/s
internalField   uniform 0.135;     // m^2/s^2
// 0/omega  inlet: omega = k^0.5 / (Cmu^0.25 * l), l = 0.07*L
// 0/gammaInt   inlet: uniform 1.0
// 0/ReThetat   inlet: uniform 532      (由 Tu=1% 的关联式得到)
// 壁面: gammaInt 用 zeroGradient, ReThetat 用 zeroGradient
```

入口 $Re_{\theta t}$ 若直接取默认值而不按 $Tu$ 计算，转捩点就完全由软件默认值决定，这是转捩算例最常见的不可复现来源。

## 6 适用边界与失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 低湍流度工况阻力比实验高 30% | 用了全湍流模型，全程无转捩 | 换 $\gamma$-$Re_\theta$ 模型，比较 $c_f$ 台阶位置 |
| 转捩点比预期晚一倍 | $N_{\text{crit}}$ 或入口 $Tu$ 取值与实验条件不符 | 按风洞 $Tu$ 重取 $N$ 值，核对入口 $k$ 的换算 |
| 转捩点随入口 $Re_{\theta t}$ 默认值变化 | 未按 $Tu$ 关联式给定入口值 | 显式写入 $Re_{\theta t}$ 并记录推导过程 |
| 喷砂表面算例的转捩点与光滑面相同 | 未打开粗糙度，或 $k_s$ 未写入壁面 | 计算 $k_s^{+}$，确认超过 5 后是否生效 |
| 层流分离泡后不再附 | 模型无分离诱导转捩机制 | 换 $\gamma$-$Re_\theta$ 并检查分离泡长度与 $\delta$ 之比 |
| 时间推进算例中 955 Hz 扰动被抹平 | 时间步过大，采样率不足 | 检查时间步对应采样率是否达到 10 kHz 量级 |

## 7 建模选择顺序

1. 由实验或现场条件确定来流湍流度，换算成入口 $k$ 与 $\omega$。
2. 按 $Tu$ 判断属于自然转捩、旁路转捩还是分离诱导转捩。
3. 自然转捩用 $e^N$ 并明确 $N_{\text{crit}}$；工程算例优先用 $\gamma$-$Re_\theta$ 本地关联模型。
4. 由 $Tu$ 与压力梯度关联式给出入口 $Re_{\theta t}$，不使用默认值。
5. 计算 $k_s^{+}$ 判断粗糙度是否需要建模，需要时把 $k_s$ 写入壁面条件。
6. 检查流向网格能否分辨 T-S 波长，壁面 $y^{+}$ 是否小于 1。

## 8 参考文献

1. Smith A.M.O., Gamberoni N., "Transition, Pressure Gradient and Stability Theory," *Douglas Aircraft Report ES 26388*, 1956.
2. van Ingen J.L., "A Suggested Semi-Empirical Method for the Calculation of the Boundary Layer Transition Region," *TU Delft Report VTH-74*, 1956.
3. Schubauer G.B., Skramstad H.K., "Laminar-Boundary-Layer Oscillations and Transition on a Flat Plate," *NACA Report 909*, 1948.
4. Menter F.R., Langtry R.B., Likki S.R., Suzen Y.B., Huang P.G., Völker S., "A Correlation-Based Transition Model Using Local Variables — Part I: Model Formulation," *ASME Journal of Turbomachinery*, 2006.
