---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-validation-impact-diagnosis-validation
title: "液体冲击：结果诊断与可信度验证"
summary: "围绕冲击压力的采样频率、峰值统计与模型选择，给出声学冲击压力与驻点压力两种标尺、所需采样率估算、峰值收敛判据，并附可核对的量级手算与峰值提取脚本。"
category:
  slug: meshfree-validation
  name: "无网格法验证与基准"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法验证与基准"
  - "液体冲击"
  - "结果诊断与可信度验证"
  - "冲击压力峰值"
  - "采样频率"
seo:
  title: "液体冲击：结果诊断与可信度验证"
  description: "围绕冲击压力的采样频率、峰值统计与模型选择，给出声学冲击压力与驻点压力两种标尺、所需采样率估算、峰值收敛判据，并附可核对的量级手算与峰值提取脚本。"
  keywords:
    - "液体冲击"
    - "结果诊断与可信度验证"
    - "冲击压力峰值"
    - "采样频率"
    - "Wagner 理论"
---

# 液体冲击：结果诊断与可信度验证

液体冲击的诊断陷阱在于峰值压力对采样频率、粒子无序性和声速极其敏感，同一算例换一次输出间隔就可能差两三倍。可信做法是把峰值当作统计量而非单点，并用两个相差数量级的理论标尺判断结果落在哪一档：声学水锤压力还是驻点压力。本文给出标尺、所需采样率的估算、峰值收敛判据与一次量级手算。

## 两个理论标尺界定压力上界

液体撞击刚性壁面时，压力上限由声学水锤给出，下界由驻点压力给出：

$$
p_{\mathrm{ac}}=\rho\,c\,v,\qquad
p_{\mathrm{stag}}=\tfrac{1}{2}\rho v^{2},
$$

其中 $\rho$ 为密度（$\mathrm{kg/m^3}$），$c$ 为水中声速（约 $1480\ \mathrm{m/s}$），$v$ 为撞击法向速度（m/s）。两式相差 $2c/v$ 倍，对 $v=5\ \mathrm{m/s}$ 相差 592 倍，因此报告峰值时必须说明它对应哪一种机理。

一次可核对的手算：取 $\rho=1000\ \mathrm{kg/m^3}$、$c=1480\ \mathrm{m/s}$、$v=5.0\ \mathrm{m/s}$。则

$$
p_{\mathrm{ac}}=1000\times1480\times5.0=7.40\times10^{6}\ \mathrm{Pa}=7.40\ \mathrm{MPa},
$$

$$
p_{\mathrm{stag}}=\tfrac{1}{2}\times1000\times(5.0)^{2}=1.25\times10^{4}\ \mathrm{Pa}=12.5\ \mathrm{kPa} .
$$

真实冲击峰值通常落在两者之间，且随撞击角、气垫效应与壁面柔性变化。若数值峰值达到 $50\ \mathrm{MPa}$，已经超过声学上界近 7 倍，基本可判定为粒子重叠导致的非物理压力尖刺。

## 采样频率必须按上升时间反算

冲击脉冲的上升时间 $\tau_r$ 决定所需采样频率。按信号带宽经验关系 $f_{\max}\approx0.35/\tau_r$，采样率至少取 $f_s\ge2f_{\max}$，工程上留 5 倍余量：

$$
f_s\ge\frac{3.5}{\tau_r} .
$$

一次手算：若冲击上升时间 $\tau_r=0.5\ \mathrm{ms}=5\times10^{-4}\ \mathrm{s}$，则 $f_{\max}=0.35/5\times10^{-4}=700\ \mathrm{Hz}$，工程采样率 $f_s\ge3.5/5\times10^{-4}=7000\ \mathrm{Hz}$，即输出间隔不大于 $0.143\ \mathrm{ms}$。若算例只按 $1\ \mathrm{ms}$ 输出（$f_s=1000\ \mathrm{Hz}$），会直接漏掉峰值，报告出的峰值压力可能只有真实的 30%～50%。对 SPHERIC 二维晃荡基准（水箱宽 $1.0\ \mathrm{m}$、水深 $0.1\ \mathrm{m}$、激励周期 $1.0\ \mathrm{s}$），冲击发生在激励频率的约 1.2 倍处，特征时间尺度约 $0.02\ \mathrm{s}$，采样间隔取 $0.05\ \mathrm{ms}$ 才能稳定捕捉。

## 峰值统计而非单点极值

由于粒子无序性，冲击压力峰值是随机变量。正确做法是在同一测点、同一时刻窗口内对多次不同初始排布的运行做统计，报告分位数：

$$
\bar{p}_{99}=\text{第 99 百分位压力},\qquad
\sigma_p=\left(\frac{1}{M}\sum_{m=1}^{M}\left(p_{\max}^{(m)}-\bar{p}_{\max}\right)^{2}\right)^{1/2},
$$

$M$ 为重复运行次数。判据是峰值离散度 $\sigma_p/\bar{p}_{\max}\le0.1$；若超过 0.3，说明结果由粒子排布主导，必须加密或用更稳健的压力公式（如 $\delta$-SPH 的密度扩散项）。峰值随分辨率的收敛仍按观测阶估计：

$$
p_{c}=\frac{\ln\!\left(P_{2}/P_{1}\right)}{\ln\!\left(\Delta x_{2}/\Delta x_{1}\right)} .
$$

一次手算：$\Delta x=5,2.5,1.25\ \mathrm{mm}$ 时归一化峰值 $P_1=1.08$、$P_2=1.19$、$P_3=1.42$（以解析峰值归一），则 $p_{c,12}=\ln(1.19/1.08)/\ln2=0.140$，$p_{c,23}=\ln(1.42/1.19)/\ln2=0.255$。阶次很低但为正，说明峰值尚未收敛，此时应报告"峰值未收敛"而不是给出具体数值。

## 冲量积分比峰值更稳健

短时压力峰值的重复性差，但压力时间积分（冲量）对采样与无序性不敏感：

$$
I=\int_{t_1}^{t_2}p(t)\,\mathrm{d}t .
$$

判据取相对误差 $\lvert I_{\mathrm{num}}-I_{\mathrm{ref}}\rvert/I_{\mathrm{ref}}\le5\%$。对冲量积分，采样间隔只需满足 $f_s\ge20f_0$（$f_0$ 为冲击主频），远低于峰值所需的 7000 Hz，因此当峰值不可信时，冲量往往仍可用于工程判断。诊断顺序建议为：先看冲量是否一致，再看峰值是否随加密收敛，最后才讨论峰值绝对值。

## 峰值提取与采样诊断脚本

```python
import numpy as np

rho, c_water = 1000.0, 1480.0

def acoustic_pressure(rho, c, v):
    return rho * c * v

def stagnation_pressure(rho, v):
    return 0.5 * rho * v**2

def required_fs(tau_r, safety=3.5):
    """按上升时间估算工程采样率"""
    return safety / tau_r

def peak_statistics(peaks):
    peaks = np.asarray(peaks)
    return peaks.mean(), peaks.std(), np.percentile(peaks, 99)

def order(P1, P2, dx1, dx2):
    return np.log(P2 / P1) / np.log(dx2 / dx1)

v = 5.0
print("p_ac = %.3e Pa, p_stag = %.3e Pa" % (acoustic_pressure(rho, c_water, v),
                                            stagnation_pressure(rho, v)))
print("required fs =", required_fs(0.5e-3), "Hz")     # 7000 Hz
print("order p12 =", round(order(1.08, 1.19, 0.005, 0.0025), 3))  # 0.140
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 峰值压力超过声学上界数倍 | 粒子重叠，压力由状态方程爆出 | 与 $\rho c v=7.40\ \mathrm{MPa}$ 比较，超界即判非物理 |
| 换一次输出间隔峰值差一倍 | 采样频率低于冲击上升时间要求 | 按 $f_s\ge3.5/\tau_r$ 反算，把间隔缩到 $0.143\ \mathrm{ms}$ 以下 |
| 同一算例重复运行峰值离散大 | 结果由初始粒子排布主导 | 统计 $M\ge10$ 次运行的 $\sigma_p/\bar{p}_{\max}$ |
| 峰值随加密不收敛 | 空间分辨率不足以解析射流头部 | 计算 $p_c$，若低于 0.3 则报告"未收敛" |
| 冲量一致但峰值偏高 | 峰值尖刺仅影响瞬时，不影响积分 | 比较 $I$ 的相对误差是否在 5% 内 |
| 测点压力出现高频振荡 | 声波在测点与壁面间来回反射 | 把测点移离壁面 $0.05\ \mathrm{m}$ 重测 |

## 复核与参考文献

通过条件：峰值不超 $\rho c v$、$f_s\ge3.5/\tau_r$、$\sigma_p/\bar{p}_{\max}\le0.1$、冲量误差 $\le5\%$。参考文献：

1. Wagner, H., "Über Stoß- und Gleitvorgänge an der Oberfläche von Flüssigkeiten," *Zeitschrift für Angewandte Mathematik und Mechanik*, 12(4), 1932, pp. 193–215.
2. SPHERIC, "SPHERIC Benchmark Test Cases," ERCOFTAC SPHERIC Workshop benchmark suite.
3. Monaghan, J. J., "Simulating Free Surface Flows with SPH," *Journal of Computational Physics*, 110(2), 1994, pp. 399–406.
4. Koshizuka, S., Oka, Y., "Moving-Particle Semi-Implicit Method for Fragmentation of Incompressible Fluid," *Nuclear Science and Engineering*, 123(3), 1996, pp. 421–434.
5. Cummins, S. J., Rudman, M., "An SPH projection method," *Journal of Computational Physics*, 152(2), 1999, pp. 584–607.
6. Antuono, M., Colagrossi, A., Marrone, S., "Numerical diffusive terms in weakly-compressible SPH schemes," *Computer Physics Communications*, 183(12), 2012, pp. 2570–2580.
7. Violeau, D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
