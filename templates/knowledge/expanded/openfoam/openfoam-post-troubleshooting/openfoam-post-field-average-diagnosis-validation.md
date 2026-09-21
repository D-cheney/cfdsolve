---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-post-field-average-diagnosis-validation
title: "时间平均与脉动统计：结果诊断与可信度验证"
summary: "给出 fieldAverage 的 timeStart/timeEnd 与 prime2Mean 配置，讲清均值、RMS、雷诺应力的离散形式，并用独立样本数把统计窗口长度换算成可判定的标准误阈值。"
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
  - "时间平均与脉动统计"
  - "结果诊断与可信度验证"
  - "fieldAverage"
seo:
  title: "时间平均与脉动统计：结果诊断与可信度验证"
  description: "给出 fieldAverage 的 timeStart/timeEnd 与 prime2Mean 配置，讲清均值、RMS、雷诺应力的离散形式，并用独立样本数把统计窗口长度换算成可判定的标准误阈值。"
  keywords:
    - "时间平均与脉动统计"
    - "结果诊断与可信度验证"
    - "fieldAverage"
    - "prime2Mean"
---

# 时间平均与脉动统计：结果诊断与可信度验证

`fieldAverage` 的 `timeStart` 决定统计窗口从哪里开始，选错会把启动瞬变算进平均值。本文给出 `fieldAverage` 的完整配置、均值与 RMS 的离散形式、由雷诺应力收缩求湍动能的手算，以及用独立样本数把窗口长度换算成可判定阈值的做法。

## fieldAverage 配置与 prime2Mean

```cpp
functions
{
    fieldAverage
    {
        type            fieldAverage;
        libs            ("libfieldFunctionObjects.so");
        timeStart       2;
        timeEnd         10;
        writeArea       false;
        fields
        (
            U
            {
                mean        on;
                prime2Mean  on;
                base        time;
            }
            p
            {
                mean        on;
            }
        );
    }
}
```

`timeStart 2` 表示 $t < 2\ \mathrm{s}$ 的启动段不参与平均，`timeEnd 10` 关闭统计，窗口长度 $T = 8\ \mathrm{s}$。`prime2Mean` 输出的是 $\overline{u_i' u_j'}$ 的六个分量，即雷诺应力；`base time` 表示按时间加权而非按样本数加权。

## 均值、RMS 与雷诺应力

$$\overline{\phi} = \frac{1}{T}\int_{t_0}^{t_0+T}\phi(t)\,\mathrm{d}t \approx \frac{\sum_k \phi_k \Delta t_k}{\sum_k \Delta t_k}$$

$$\phi_{rms} = \sqrt{\overline{(\phi-\overline{\phi})^2}}, \qquad \overline{u_i' u_j'} = \overline{u_i u_j} - \overline{u_i}\,\overline{u_j}$$

`prime2Mean` 给的是最后一个式子。湍动能由它收缩得到：

$$k = \tfrac12\left(\overline{u'u'} + \overline{v'v'} + \overline{w'w'}\right)$$

某算例得到 $\overline{u'u'} = 2.25\ \mathrm{m^2/s^2}$、$\overline{v'v'} = 0.81\ \mathrm{m^2/s^2}$、$\overline{w'w'} = 1.44\ \mathrm{m^2/s^2}$，则 $k = 0.5\times(2.25+0.81+1.44) = 2.25\ \mathrm{m^2/s^2}$。取 $U_\infty = 10\ \mathrm{m/s}$，湍流强度 $TI = \sqrt{2k/3}/U_\infty = \sqrt{1.5}/10 = 12.2\%$。

## 统计收敛的定量判定

均值标准误：

$$\sigma_{\bar\phi} \approx \frac{\sigma_\phi}{\sqrt{N_{eff}}}, \qquad N_{eff} = \frac{T}{\tau_{int}}$$

以 $T = 8\ \mathrm{s}$、积分时间尺度 $\tau_{int} = 0.04\ \mathrm{s}$ 得 $N_{eff} = 200$。若 $u_{rms} = 1.5\ \mathrm{m/s}$，则 $\sigma_{\bar u} = 1.5/\sqrt{200} = 0.106\ \mathrm{m/s}$，相对 $U_\infty = 10\ \mathrm{m/s}$ 为 1.06%。

判定收敛的实用做法是把窗口对半切，比较前后两半的均值。某尾流算例前半均值 8.42 m/s、后半 8.61 m/s，差 0.19 m/s，是 $2\sigma_{\bar u} = 0.212\ \mathrm{m/s}$ 的 0.9 倍，判定收敛；若差值超过 5%，应延长窗口。

```bash
postProcess -func "fieldMinMax(fields=(UMean UPrime2Mean))" -time 10
postProcess -func "patchAverage(patch=outlet,fields=(UMean))" -time 10
```

第一条命令确认均值场与脉动场都已生成，第二条给出出口面上的时间平均速度，用于与实验或基准比对。

## 启动段与采样控制

- `timeStart` 必须晚于流场进入统计平稳的时刻。圆柱绕流在 $Re = 100$ 时约 5～10 个脱落周期后平稳，即 $t > 5\times0.505 = 2.5\ \mathrm{s}$。
- 平均要求每个时间步都落盘，否则时间加权失真；`writeControl timeStep; writeInterval 1;` 是标准配置。
- 统计状态写在 `uniform/time/` 下，重启后从该目录续算，不会丢失窗口。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 平均值偏向初值 | `timeStart` 太早、含启动段 | 把 `timeStart` 后移 2 s 重算，看均值是否平移 |
| RMS 比文献小 30% | 采样稀疏、高频脉动被平均掉 | 改 `writeInterval 1` 并提高输出频率 |
| `prime2Mean` 全为 0 | 只开了 `mean on` | 在字段子字典里加 `prime2Mean on` |
| 重启后均值突变 | 统计目录 `uniform/time/` 未随算例迁移 | 确认重启时该目录存在且时间一致 |
| 均值随窗口线性漂移 | 流场未统计平稳 | 对半切窗口比对前后均值 |

## 参考文献

1. S. B. Pope, *Turbulent Flows*, Cambridge University Press, 2000.
2. G. K. Batchelor, *The Theory of Homogeneous Turbulence*, Cambridge University Press, 1953.
3. H. Tennekes, J. L. Lumley, *A First Course in Turbulence*, MIT Press, 1972.
4. OpenFOAM Foundation, *OpenFOAM User Guide*, §"fieldAverage".
5. P. Bradshaw, *An Introduction to Turbulence and its Measurement*, Pergamon Press, 1971.
