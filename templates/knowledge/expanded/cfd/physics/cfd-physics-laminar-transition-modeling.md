---
template_version: flowlab-knowledge/1.0
slug: cfd-physics-laminar-transition-modeling
title: 层流到湍流的转捩：原理与诊断验证
summary: >-
  转捩有三条互不相同的物理路径：自然转捩、旁路转捩与分离诱导转捩。本文说明各自的触发条件、e^N 与 γ-Re_θ 两类模型的适用域、N
  值与粗糙度门槛的取值依据及失效信号。 全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: physics
  name: 流体力学基础
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 流体力学基础
  - 层流到湍流的转捩
  - 物理建模与适用边界
  - e^N 方法
  - γ-Re_θ 模型
  - 结果诊断与可信度验证
  - 形状因子
  - 间歇因子
seo:
  title: 层流到湍流的转捩：原理与诊断验证
  description: >-
    转捩有三条互不相同的物理路径：自然转捩、旁路转捩与分离诱导转捩。本文说明各自的触发条件、e^N 与 γ-Re_θ 两类模型的适用域、N
    值与粗糙度门槛的取值依据及失效信号。 全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 层流到湍流的转捩
    - 物理建模与适用边界
    - e^N 方法
    - γ-Re_θ 模型
    - 结果诊断与可信度验证
    - 形状因子
    - 间歇因子
---
# 层流到湍流的转捩：原理与诊断验证

## 原理与适用范围

把转捩当成"层流模型与湍流模型之间的开关"是绝大多数转捩算例失真的起点。实际存在三条触发机理不同、参数依赖不同的路径，选错路径等于用错了模型。本文按机理分类，给出每类机理对应的建模方法、关键参数取值依据与失效信号，并附可直接使用的求解器配置。

### 1 三条转捩路径与各自的判据

- **自然转捩**：来流湍流度极低（$Tu < 0.1\%$）时，Tollmien-Schlichting 波线性增长后非线性失稳。触发参数是稳定性特性，用 $e^N$ 方法描述。
- **旁路转捩**：来流湍流度较高（$Tu \gtrsim 1\%$）时，来流中的长条涡直接侵入边界层，跳过 T-S 波阶段。触发参数是 $Tu$ 与动量厚度雷诺数。
- **分离诱导转捩**：逆压梯度下层流边界层先分离，剪切层在分离泡内迅速失稳并转捩，再附为湍流。常见于低压涡轮叶片与低雷诺数翼型。

三者的判据不能互换。用旁路转捩关联式去算安静风洞中的自然转捩，会把转捩点提前 2～3 倍；反过来用 $N = 9$ 的 $e^N$ 去算 $Tu = 3\%$ 的工况，转捩点会晚得离谱。

### 2 自然转捩：无量纲频率与 e^N 方法

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

### 3 旁路转捩：以 Re_θ 为中介的关联

旁路转捩用动量厚度雷诺数与湍流度的关联描述：

$$
Re_\theta = \frac{\rho U \theta}{\mu}, \qquad Re_{\theta,t} = 163 + \exp\left(6.91-Tu\right)
$$

$Tu$ 以百分数代入，$Tu = 1\%$ 得 532，$Tu = 3\%$ 得 213。注意 $Tu$ 必须由湍动能换算，而不是拍一个数：

$$
Tu = \frac{\sqrt{2k/3}}{U_\infty}\times100\%, \qquad k = \frac{3}{2}\left(U_\infty Tu\right)^{2}
$$

反算一下：若希望入口 $Tu = 1\%$、$U_\infty = 30\,\mathrm{m/s}$，则 $k = 1.5\times(0.3)^{2} = 0.135\,\mathrm{m^2/s^2}$。这是可以直接写进入口边界的数值。

### 4 分离诱导转捩与粗糙度

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

### 5 求解器配置示例

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

### 6 适用边界与失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 低湍流度工况阻力比实验高 30% | 用了全湍流模型，全程无转捩 | 换 $\gamma$-$Re_\theta$ 模型，比较 $c_f$ 台阶位置 |
| 转捩点比预期晚一倍 | $N_{\text{crit}}$ 或入口 $Tu$ 取值与实验条件不符 | 按风洞 $Tu$ 重取 $N$ 值，核对入口 $k$ 的换算 |
| 转捩点随入口 $Re_{\theta t}$ 默认值变化 | 未按 $Tu$ 关联式给定入口值 | 显式写入 $Re_{\theta t}$ 并记录推导过程 |
| 喷砂表面算例的转捩点与光滑面相同 | 未打开粗糙度，或 $k_s$ 未写入壁面 | 计算 $k_s^{+}$，确认超过 5 后是否生效 |
| 层流分离泡后不再附 | 模型无分离诱导转捩机制 | 换 $\gamma$-$Re_\theta$ 并检查分离泡长度与 $\delta$ 之比 |
| 时间推进算例中 955 Hz 扰动被抹平 | 时间步过大，采样率不足 | 检查时间步对应采样率是否达到 10 kHz 量级 |

### 7 建模选择顺序

1. 由实验或现场条件确定来流湍流度，换算成入口 $k$ 与 $\omega$。
2. 按 $Tu$ 判断属于自然转捩、旁路转捩还是分离诱导转捩。
3. 自然转捩用 $e^N$ 并明确 $N_{\text{crit}}$；工程算例优先用 $\gamma$-$Re_\theta$ 本地关联模型。
4. 由 $Tu$ 与压力梯度关联式给出入口 $Re_{\theta t}$，不使用默认值。
5. 计算 $k_s^{+}$ 判断粗糙度是否需要建模，需要时把 $k_s$ 写入壁面条件。
6. 检查流向网格能否分辨 T-S 波长，壁面 $y^{+}$ 是否小于 1。

### 8 参考文献

1. Smith A.M.O., Gamberoni N., "Transition, Pressure Gradient and Stability Theory," *Douglas Aircraft Report ES 26388*, 1956.
2. van Ingen J.L., "A Suggested Semi-Empirical Method for the Calculation of the Boundary Layer Transition Region," *TU Delft Report VTH-74*, 1956.
3. Schubauer G.B., Skramstad H.K., "Laminar-Boundary-Layer Oscillations and Transition on a Flat Plate," *NACA Report 909*, 1948.
4. Menter F.R., Langtry R.B., Likki S.R., Suzen Y.B., Huang P.G., Völker S., "A Correlation-Based Transition Model Using Local Variables — Part I: Model Formulation," *ASME Journal of Turbomachinery*, 2006.

## 诊断与可信度验证

转捩位置对结果的影响是阶跃式的：转捩点前后壁面摩擦系数可以相差 5 倍以上，边界层厚度与分离趋势随之改变。因此验证转捩算例的核心任务是定位转捩点，并用彼此独立的判据互相印证。本文给出三条可分别计算的判据，以及区分"物理转捩"与"网格或来流造成的假转捩"的判定试验。

### 1 判据一：临界雷诺数给出的预期位置

平板边界层的自然转捩在低湍流度来流中约发生在

$$
Re_{x,c} = \frac{U_\infty x_c}{\nu} \approx 5\times10^{5}
$$

取 $U_\infty = 30\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$，则 $x_c = 5\times10^{5}\times1.5\times10^{-5}/30 = 0.25\,\mathrm{m}$。若算例的转捩点落在 0.10 m 或 0.60 m，偏差已超过 100%，必须先解释来源再讨论其他量。作为对照，$x = 1\,\mathrm{m}$ 处 $Re_x = 2.0\times10^{6}$，早已处于湍流区。

### 2 判据二：动量厚度雷诺数与 Michel 关联式

动量厚度雷诺数 $Re_\theta = \rho U\theta/\mu$ 是转捩最常用的关联参数，Michel 关联式给出转捩对应的值：

$$
Re_{\theta,t} = 1.174\left(1+\frac{22400}{Re_x}\right)Re_x^{0.46}
$$

在 $Re_x = 5\times10^{5}$ 处代入：$Re_x^{0.46} = 418.4$，括号项 $= 1+22400/5\times10^{5} = 1.045$，得 $Re_{\theta,t} = 1.174\times1.045\times418.4 = 513$。这个数字很有用：算例中提取沿程 $Re_\theta$，它首次超过 513 的位置就是 CFD 认定的转捩点，与 $Re_x = 5\times10^{5}$ 的判据应当落在同一处（允许 20% 的位置差）。

### 3 判据三：壁面摩擦的阶跃与形状因子

转捩的另一个直接信号是壁面摩擦系数出现数量级跃升。层流与湍流的局部摩擦系数分别为

$$
c_{f,\text{lam}} = \frac{0.664}{\sqrt{Re_x}}, \qquad c_{f,\text{turb}} = \frac{0.0592}{Re_x^{0.2}}
$$

在 $Re_x = 1.0\times10^{6}$：层流 $c_f = 0.664/1000 = 6.64\times10^{-4}$，湍流 $c_f = 0.0592/15.85 = 3.74\times10^{-3}$，相差 5.6 倍。在 $Re_x = 2.0\times10^{6}$ 处相差 6.9 倍。因此把沿程 $c_f$ 曲线画出来，转捩点表现为一个明显的台阶。

形状因子 $H_{12} = \delta^{*}/\theta$ 提供第三条独立证据：层流边界层 $H_{12} \approx 2.5\sim2.6$，湍流降至 $1.3\sim1.4$。$H_{12}$ 的下降位置应与 $c_f$ 台阶位置一致；若两者相差很远，说明采样或后处理有问题。

### 4 来流湍流度把转捩提前多少

风洞与工程环境中的来流湍流度 $Tu$ 会显著前移转捩点。Abu-Ghannam 与 Shaw 的关联式为

$$
Re_{\theta,t} = 163 + \exp\left(6.91-Tu\right)
$$

$Tu$ 以百分数代入：$Tu = 1\%$ 得 $Re_{\theta,t} = 163+369 = 532$；$Tu = 3\%$ 得 $163+49.9 = 213$；$Tu = 6\%$ 得 $163+2.49 = 165$。也就是说湍流度从 1% 升到 3%，转捩所需的 $Re_\theta$ 下降了 60%，转捩点会明显前移。算例入口若未显式给出 $Tu$，求解器会取默认值（常见 1%～5%），这本身就是转捩位置不可复现的根源。

### 5 网格能否分辨转捩过程

T-S 波是转捩的物理载体，其波长约为边界层厚度的 6 倍。$Re_x = 5\times10^{5}$ 处 Blasius 边界层厚度 $\delta \approx 5x/\sqrt{Re_x} = 5\times0.25/707 = 1.77\,\mathrm{mm}$，对应 T-S 波长约 10 mm。要在数值上让扰动增长，流向网格至少需要 20 个点/波长，即 $\Delta x \le 0.5\,\mathrm{mm}$；同时壁面 $y^{+}$ 必须小于 1。若流向网格是 5 mm，扰动无法增长，转捩要么不发生、要么被数值扰动强行触发在网格尺度上。

### 6 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 转捩点比 Michel 关联式晚一倍 | 入口 $Tu$ 太小，或未开转捩模型 | 打印入口 $k$、$\omega$ 与 $Tu$，用 Abu-Ghannam 式反算预期 $Re_{\theta,t}$ |
| 转捩点在入口第一格就完成 | 入口湍流量过大，把扰动直接灌进来 | 把入口 $Tu$ 降到 0.5% 复算，看转捩点是否后移 |
| 转捩位置随网格加密持续移动 | 数值扰动而非物理扰动在触发转捩 | 用三套流向网格，若位置不收敛则判为网格控制 |
| $c_f$ 台阶与 $H_{12}$ 下降位置不重合 | 后处理采样面或统计方式不一致 | 用同一套采样面重算 $c_f$、$\delta^{*}$、$\theta$ |
| 全湍流模型给出的 $c_f$ 比层流段高 5 倍 | 模型无转捩机制，全程按湍流处理 | 检查是否使用 $\gamma$-$Re_\theta$ 或 $e^N$ 方法 |
| 层流分离泡被抹平、阻力偏低 | 分离泡内流向网格不足 | 加密分离区，检查是否出现压力平台与再附点 |

### 7 用独立脚本核对转捩点

```bash
# 提取壁面剪切并沿程反算 cf
postProcess -func "wallShearStress(patches=(plate))" -latestTime
python3 - <<'PY'
import math
rho, U, nu = 1.225, 30.0, 1.5e-5
tau = [0.0009, 0.0011, 0.0026, 0.0049, 0.0071]   # 壁面剪切, Pa
x   = [0.10, 0.20, 0.30, 0.40, 0.50]             # 沿程位置, m
for xi, tw in zip(x, tau):
    Rex = U * xi / nu
    cf  = tw / (0.5 * rho * U**2)
    print(f"x={xi:.2f} m  Re_x={Rex:.2e}  cf={cf:.2e}")
# 用 Michel 关联式反算预期转捩 Re_x
Rx = 5.0e5
print("Re_theta,t(Michel) =", 1.174*(1+22400/Rx)*Rx**0.46)
PY
```

$c_f$ 在 $x = 0.20\sim0.30\,\mathrm{m}$ 之间的跃升与 $Re_{x,c} = 5\times10^{5}$ 给出的 $x_c = 0.25\,\mathrm{m}$ 一致，说明转捩点物理合理。

### 8 验收时要能回答的问题

1. 沿程 $c_f$ 台阶位置与 $Re_{x,c} = 5\times10^{5}$ 的预期是否在 20% 以内一致？
2. 提取的 $Re_\theta$ 首次超过 Michel 值的横坐标是否与台阶位置一致？
3. $H_{12}$ 是否从 2.5 量级下降到 1.4 量级，且下降位置一致？
4. 入口湍流度是否显式给定并记录，是否与实验条件匹配？
5. 流向网格是否满足 20 点/波长、壁面 $y^{+} < 1$？
6. 三套网格下的转捩位置是否收敛（变化小于 10%）？
7. 若使用全湍流模型，是否说明了不能预测转捩这一事实？

### 9 参考文献

1. Schlichting H., Gersten K., *Boundary-Layer Theory*, 9th ed., Springer, 2017.
2. Mayle R.E., "The Role of Laminar-Turbulent Transition in Gas Turbine Engines," *ASME Journal of Turbomachinery*, 1991.
3. Morkovin M.V., "On the Many Faces of Transition," in *Viscous Drag Reduction*, Plenum Press, 1969.
4. Langtry R.B., Menter F.R., "Correlation-Based Transition Modeling for Unstructured Parallelized CFD Codes," *AIAA Journal*, 2009.
