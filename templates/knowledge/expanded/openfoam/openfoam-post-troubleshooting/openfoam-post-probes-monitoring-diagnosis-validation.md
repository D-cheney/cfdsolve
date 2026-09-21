---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-post-probes-monitoring-diagnosis-validation
title: "探针与瞬态监控：结果诊断与可信度验证"
summary: "从采样定理出发确定探针采样率，给出 probes 与 fieldMinMax 的真实配置、由斯特劳哈尔数反算脱落频率的手算，以及用独立样本数估计统计窗口长度的定量方法。"
category:
  slug: openfoam-post-troubleshooting
  name: "OpenFOAM 后处理与排错"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OPENFOAM"
  - "OpenFOAM 后处理与排错"
  - "探针与瞬态监控"
  - "结果诊断与可信度验证"
  - "probes"
seo:
  title: "探针与瞬态监控：结果诊断与可信度验证"
  description: "从采样定理出发确定探针采样率，给出 probes 与 fieldMinMax 的真实配置、由斯特劳哈尔数反算脱落频率的手算，以及用独立样本数估计统计窗口长度的定量方法。"
  keywords:
    - "探针与瞬态监控"
    - "结果诊断与可信度验证"
    - "probes"
    - "采样定理"
---

# 探针与瞬态监控：结果诊断与可信度验证

探针的可靠性由采样频率和插值位置决定，而不是由探针数量决定。采样间隔选错会让 40 Hz 的脱落信号混叠成 20 Hz 的假低频，后续频谱分析全部失真。本文给出 `probes` 的真实配置、由斯特劳哈尔数反算采样率的手算、探针点插值的误差量级，以及统计窗口长度的估计方法。

## probes 配置与采样控制

```cpp
functions
{
    probes
    {
        type                probes;
        libs                ("libsampling.so");
        fields              (U p);
        probeLocations
        (
            (0.30 0 0)
            (0.35 0.02 0)
        );
        interpolationScheme cellPoint;
        writeControl        timeStep;
        writeInterval       1;
    }
    fieldMinMax
    {
        type        fieldMinMax;
        libs        ("libfieldFunctionObjects.so");
        fields      (U p);
        log         true;
    }
}
```

`writeControl timeStep` 保证每个时间步都落盘，这是频谱分析的前提；若改成 `writeControl time` 且 `writeInterval 0.1`，采样率被压到 10 Hz。

## 采样率与混叠

采样定理要求 $f_s > 2 f_{max}$。圆柱绕流的脱落频率由斯特劳哈尔数给出：

$$St = \frac{f D}{U_\infty} \Rightarrow f = \frac{St\, U_\infty}{D}$$

取 $St = 0.2$、$U_\infty = 20\ \mathrm{m/s}$、$D = 0.1\ \mathrm{m}$，得 $f = 0.2\times20/0.1 = 40\ \mathrm{Hz}$，要求 $f_s > 80\ \mathrm{Hz}$。若时间步 $\Delta t = 0.01\ \mathrm{s}$，则 $f_s = 100\ \mathrm{Hz}$，裕度 1.25。若 $\Delta t = 0.05\ \mathrm{s}$，则 $f_s = 20\ \mathrm{Hz}$，40 Hz 信号会混叠到 $|20-40| = 20\ \mathrm{Hz}$，与真实低频不可分。

## 探针点插值的误差量级

探针做点插值，误差为 $O(h^2)$。以网格 $h = 3\ \mathrm{mm}$、速度二阶导 $10^{5}\ \mathrm{s^{-1}m^{-1}}$ 估算：

$$\Delta u \approx \tfrac12 \times 10^{5} \times (0.003)^2 = 0.45\ \mathrm{m/s}$$

当地速度 20 m/s 时相对误差 2.25%。要降到 1% 以内，需把探针附近网格加密到 $h \approx 2\ \mathrm{mm}$，或改用 `cellPoint` 而非 `cell`。

## 用探针做统计的窗口长度

$$\overline{\phi} = \frac{1}{T}\int_{t_0}^{t_0+T}\phi(t)\,\mathrm{d}t, \qquad \sigma_{\bar\phi} \approx \frac{\sigma_\phi}{\sqrt{N_{eff}}}$$

$N_{eff}$ 是独立样本数。以 $T = 5.05\ \mathrm{s}$（10 个脱落周期）、$f_s = 100\ \mathrm{Hz}$ 为例，总样本 505 个，但相邻样本高度相关；取自相关时间 $\tau = 1/f = 0.025\ \mathrm{s}$ 得 $N_{eff} = 5.05/0.025 = 202$。若 $u_{rms} = 1.5\ \mathrm{m/s}$，均值标准误为 $1.5/\sqrt{202} = 0.106\ \mathrm{m/s}$，相当于脉动幅值的 7%。把窗口延长到 20 个周期可把该误差降到 5%。

## 探针失效的典型症状

- 探针值为 0 且不随时间变化：位置落在固体单元或域外。
- 探针曲线呈锯齿：`writeInterval` 与时间步不整除，落盘时刻抖动。
- 多个探针完全同值：`probeLocations` 重复或落进同一单元。

```bash
postProcess -func probes -time 0:10
tail -3 postProcessing/probes/0/U
```

`postProcess` 可对已有算例补算探针而不必重跑求解器，`tail` 用于确认时间列单调递增、数值列没有出现重复行。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 频谱出现 20 Hz 假峰 | $f_s = 20\ \mathrm{Hz}$ 低于 $2f = 80\ \mathrm{Hz}$ | 把 `writeInterval` 改成 1 步重新采样 |
| 探针恒定输出初值 | 位置在固体或域外 | 打印单元索引，确认 `cellId != -1` |
| 曲线台阶化 | `interpolationScheme cell` | 改 `cellPoint` 后比对 |
| 统计量随窗口变化超过 10% | 窗口短于 10 个特征周期 | 延长到 20 个周期看是否收敛 |
| 并行时探针文件缺行 | 探针落在处理器边界、归约时序不一致 | 串行重跑同一算例比对 |

## 参考文献

1. J. S. Bendat, A. G. Piersol, *Random Data: Analysis and Measurement Procedures*, 4th ed., Wiley, 2010.
2. A. A. Townsend, *The Structure of Turbulent Shear Flow*, 2nd ed., Cambridge University Press, 1976.
3. A. Roshko, "On the development of turbulent wakes from vortex streets", NACA Report 1191, 1954.
4. OpenFOAM Foundation, *OpenFOAM User Guide*, §"Probes".
5. C. Norberg, "Fluctuating lift on a circular cylinder", *Journal of Fluids and Structures*, 17(1), 2003.
