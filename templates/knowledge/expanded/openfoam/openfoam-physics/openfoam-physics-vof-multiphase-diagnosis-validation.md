---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-physics-vof-multiphase-diagnosis-validation
title: "VOF 多相流：结果诊断与可信度验证"
summary: "用 Laplace 压力、Rayleigh-Taylor 增长率与 Martin-Moyce 溃坝基准三条独立证据审查 VOF 结果，给出相体积守恒、alpha 有界性与虚假流的量化阈值和判定试验。"
category:
  slug: openfoam-physics
  name: "OpenFOAM 物理模型"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 物理模型"
  - "VOF 多相流"
  - "结果诊断与可信度验证"
  - "Laplace 压力"
  - "Rayleigh-Taylor"
seo:
  title: "VOF 多相流：结果诊断与可信度验证"
  description: "用 Laplace 压力、Rayleigh-Taylor 增长率与 Martin-Moyce 溃坝基准三条独立证据审查 VOF 结果，给出相体积守恒、alpha 有界性与虚假流的量化阈值和判定试验。"
  keywords:
    - "VOF 多相流"
    - "结果诊断与可信度验证"
    - "Laplace 压力"
    - "Rayleigh-Taylor"
    - "虚假流"
---

# VOF 多相流：结果诊断与可信度验证

VOF 结果的可信度不能用"界面看起来像"来判断。真正有效的做法是先跑三个解析或半解析基准，确认求解器在你的网格与时间步下能复现已知答案，再去看工程几何。这三个基准是：静止液滴的 Laplace 压力、Rayleigh-Taylor 不稳定性增长率、以及 Martin-Moyce 溃坝前沿位置。

## 基准一：静止液滴的 Laplace 压力

静止液滴内部压力高于外部，压差由 Young-Laplace 关系给出：

$$\Delta p=\sigma\left(\frac{1}{R_1}+\frac{1}{R_2}\right)=\frac{2\sigma}{R}$$

取 $R=1.0\times10^{-3}\ \mathrm{m}$、$\sigma=0.072\ \mathrm{N/m}$，得 $\Delta p=2\times0.072/10^{-3}=144\ \mathrm{Pa}$。换算成水柱高，$h=\Delta p/(\rho g)=144/(998\times9.81)=1.47\times10^{-2}\ \mathrm{m}$，即 14.7 mm 水柱。

这个数值有双重用途：一是验收压力场，二是量化虚假流。真实静止液滴内速度应严格为零，数值解会出现由 CSF 源项离散误差引起的寄生速度。把该速度代入毛细数 $Ca_{sp}=\mu u_{sp}/\sigma$，合格标准是 $Ca_{sp}<10^{-3}$，即 $u_{sp}<0.072\ \mathrm{m/s}$。若你的算例给出 0.5 m/s，界面会在几个时间步内自发变形，后续所有结果作废。

## 基准二：Rayleigh-Taylor 增长率与截止波长

两层流体界面的线性增长率由重力与表面张力竞争决定：

$$\omega=\sqrt{A_t g k-\frac{\sigma k^{3}}{\rho_1+\rho_2}},\qquad A_t=\frac{\rho_1-\rho_2}{\rho_1+\rho_2}$$

水-空气的 Atwood 数 $A_t=(998-1.2)/(998+1.2)=0.9976$。取扰动波长 $\lambda=20\ \mathrm{mm}$，$k=2\pi/\lambda=314.2\ \mathrm{m^{-1}}$：$A_tgk=0.9976\times9.81\times314.2=3074\ \mathrm{s^{-2}}$，$\sigma k^{3}/(\rho_1+\rho_2)=0.072\times3.10\times10^{7}/999.2=2234\ \mathrm{s^{-2}}$，故 $\omega=\sqrt{840}=29.0\ \mathrm{s^{-1}}$，特征增长时间 34.5 ms。

令 $\omega=0$ 可解出截止波长 $\lambda_c=17.0\ \mathrm{mm}$：比它短的扰动被表面张力稳定。这意味着网格必须至少解析 $\lambda_c/4\approx4\ \mathrm{mm}$ 才能正确区分"稳定"与"失稳"，否则数值耗散会人为抹平所有短波扰动，得到一个永远稳定的假结果。

## 基准三：Martin-Moyce 溃坝前沿

二维溃坝的实验室数据被广泛用作 VOF 验证基准。无量纲前沿位置 $x/a$ 是 $t\sqrt{2g/a}$ 的函数，在 $0.5<t\sqrt{2g/a}<2.0$ 区间近似为线性：

$$\frac{x}{a}=1.2+1.6\,t\sqrt{\frac{2g}{a}}$$

以水柱宽 $a=0.057\ \mathrm{m}$ 为例，$\sqrt{2g/a}=\sqrt{19.62/0.057}=18.6\ \mathrm{s^{-1}}$。在 $t=0.05\ \mathrm{s}$ 时 $t\sqrt{2g/a}=0.930$，理论 $x/a=2.69$，即前沿位于 0.153 m。若模拟给出 0.130 m，偏低 15%，说明界面处的对流被过度耗散，应检查 `cAlpha` 与网格各向异性。

## 相体积守恒与 alpha 有界性

VOF 不求解相质量方程，相体积守恒完全依赖输运格式。定义相对漂移

$$\epsilon_V=\frac{\left|V_p(t)-V_p(0)\right|}{V_p(0)}$$

在 1000 个时间步后应低于 $10^{-4}$。同时检查 alpha 场极值：合格范围是 $-10^{-6}\le\alpha\le1+10^{-6}$，超出即为限幅器失效。这两个指标可直接由 `volFieldValue` 与 `fieldMinMax` 功能对象在运行时输出。

```cpp
// system/controlDict
functions
{
    phaseVolume
    {
        type            volFieldValue;
        libs            ("libfieldFunctionObjects.so");
        fields          (alpha.water);
        operation       volIntegrate;
        writeFields     false;
    }
    alphaRange
    {
        type            fieldMinMax;
        libs            ("libfieldFunctionObjects.so");
        fields          (alpha.water);
        writeControl    timeStep;
        writeInterval   100;
    }
}
```

## 用命令行做三个基准的快速判读

```bash
# 1) Laplace 基准：液滴内外压差
postProcess -func "volFieldValue(p)" -region region0 -latestTime
#    读数为内部体积分压力，除以液滴体积即为 p_in；与 p_out=0 之差应为 144 Pa

# 2) 相体积漂移
postProcess -func "volFieldValue(alpha.water)" -latestTime

# 3) 界面厚度：沿一条线输出 alpha，统计 0.05~0.95 跨越的单元数
postProcess -func "graphUniform(alpha.water)" -latestTime
```

判读顺序建议固定为 Laplace → 相体积 → 界面厚度 → 溃坝前沿。前一项不达标时后一项的偏差无法归因，继续看下去只会浪费计算资源。

## 诊断量汇总

| 诊断量 | 提取方式 | 合格阈值 |
|---|---|---|
| Laplace 压差 | 液滴内外压力积分差 | $144\pm7\ \mathrm{Pa}$（5%） |
| 虚假流速度 | 静止液滴内最大 $|\mathbf{U}|$ | $<0.072\ \mathrm{m/s}$ |
| 界面厚度 | alpha 从 0.05 到 0.95 跨越的单元数 | $\le3$ |
| 相体积漂移 | `volIntegrate(alpha.water)` | $<10^{-4}$ |
| alpha 极值 | `fieldMinMax` | $[-10^{-6},1+10^{-6}]$ |
| 溃坝前沿 | 最大 $x$ 处 alpha=0.5 位置 | 与解析式偏差 $<10\%$ |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 静止液滴内部持续流动 | CSF 源项离散误差（虚假流） | 跑 Laplace 基准，测最大速度 |
| 界面跨越 6 个单元 | `cAlpha` 过小或网格过粗 | 把 `cAlpha` 提到 1 并比较界面厚度 |
| 相体积随时间单调减少 | 压缩项把水输运出计算域 | 监控出口面的相通量积分 |
| 溃坝前沿始终慢于基准 | 对流项数值耗散过强 | 加密界面附近网格，观察偏差是否收窄 |
| 短波扰动全部消失 | 网格未解析 $\lambda_c/4$ | 用 4 mm 与 2 mm 网格各算一遍对比 |
| alpha 出现 1.02 | 限幅迭代不足 | 把 `nLimiterIter` 从 5 提到 10 |

## 参考文献

1. Martin J.C., Moyce W.J., "An Experimental Study of the Collapse of Liquid Columns on a Rigid Horizontal Plane," Philosophical Transactions of the Royal Society A, 1952.
2. Sussman M., Smereka P., Osher S., "A Level Set Approach for Computing Solutions to Incompressible Two-Phase Flow," Journal of Computational Physics, 1994.
3. Lafaurie B., Nardone C., Scardovelli R., Zaleski S., Zanetti G., "Modelling Merging and Fragmentation in Multiphase Flows with SURFER," Journal of Computational Physics, 1994.
4. Popinet S., "An Accurate Adaptive Solver for Surface-Tension-Driven Interfacial Flows," Journal of Computational Physics, 2009.
5. Hirt C.W., Nichols B.D., "Volume of Fluid (VOF) Method for the Dynamics of Free Boundaries," Journal of Computational Physics, 1981.
