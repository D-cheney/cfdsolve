---
template_version: "flowlab-knowledge/1.0"
slug: cfd-multiphase-lagrangian-particles-engineering-setup
title: "拉格朗日颗粒跟踪：工程设置与参数选择"
summary: "从注入分布、曳力区、湍流扩散到颗粒时间步，给出拉格朗日颗粒跟踪的可落地设置：Rosin–Rammler 参数、Cunningham 滑移修正、涡寿命与穿越时间、颗粒 Courant 数，以及 kinematicCloudProperties 字典片段。"
category:
  slug: multiphase-flow
  name: "多相流与组分输运"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "多相流与组分输运"
  - "拉格朗日颗粒跟踪"
  - "工程设置与参数选择"
  - "Cunningham 滑移修正"
  - "湍流扩散"
seo:
  title: "拉格朗日颗粒跟踪：工程设置与参数选择"
  description: "从注入分布、曳力区、湍流扩散到颗粒时间步，给出拉格朗日颗粒跟踪的可落地设置：Rosin–Rammler 参数、Cunningham 滑移修正、涡寿命与穿越时间、颗粒 Courant 数，以及 kinematicCloudProperties 字典片段。"
  keywords:
    - "拉格朗日颗粒跟踪"
    - "工程设置与参数选择"
    - "Cunningham 滑移修正"
    - "湍流扩散"
---

# 拉格朗日颗粒跟踪：工程设置与参数选择

拉格朗日颗粒跟踪的结果由四个输入决定：粒径分布、曳力所在区间、湍流扩散模型和颗粒时间步。其中任何一项取错默认值，轨迹统计就会系统性偏移，而且不会体现在残差上。本文给出注入参数、微米颗粒的滑移修正、涡寿命与穿越时间的取值，以及 OpenFOAM `kinematicCloudProperties` 的写法。基准环境取空气 $\rho_g=1.2$ kg/m³、$\mu_g=1.8\times10^{-5}$ Pa·s、分子自由程 $\lambda=68$ nm、颗粒密度 $\rho_p=2500$ kg/m³。

## 注入定义：分布与质量流率

喷雾与粉碎产生的粒径分布通常用 Rosin–Rammler 累积分布描述：

$$F(d)=1-\exp\left[-\left(\frac{d}{d_m}\right)^{n}\right]$$

$d_m$ 为质量中位径，$n$ 为均匀性指数，喷雾常取 2.5 到 4。取 $d_m=50$ μm、$n=3$，则小于 25 μm 的颗粒占 $F=1-\exp(-0.5^{3})=1-\exp(-0.125)=11.8\%$。这个 11.8% 的细粉份额必须与实测筛分一致，否则喷雾蒸发与沉积位置都会偏。注入时还要给出总质量流率、释放起止时间与空间分布：OpenFOAM 用 `massTotal`、`SOI`、`flowRateProfile` 与 `cellZone` 共同定义，缺一项就会得到"凭空出现"的颗粒。

## Cunningham 滑移修正决定微米颗粒的曳力

当颗粒直径接近气体分子自由程时，颗粒表面出现速度滑移，实际曳力小于连续介质预测值。修正系数为

$$C_c=1+\frac{2\lambda}{d_p}\left(1.257+0.4\,e^{-1.1 d_p/(2\lambda)}\right)$$

取 $d_p=1$ μm、$\lambda=68$ nm，则 $2\lambda/d_p=0.136$、$d_p/(2\lambda)=7.35$，指数项 $e^{-8.09}=3.1\times10^{-4}$，得 $C_c=1+0.136\times1.257=1.17$。也就是说，不启用滑移修正会把 1 μm 颗粒的曳力高估约 17%，终端速度低估同样比例。经验门槛是 $d_p<5$ μm 时必须打开 `Cunningham` 修正，$d_p>50$ μm 时可忽略。

## 湍流扩散：涡寿命与穿越时间

RANS 只给平均速度场，颗粒的湍流扩散必须靠随机模型补足。Gosman–Ioannides 模型用两个时间尺度判断颗粒能否被涡携带：

$$\tau_e=0.3\frac{k}{\varepsilon},\qquad l_e=C_\mu^{3/4}\frac{k^{3/2}}{\varepsilon},\qquad t_c=\frac{l_e}{|\mathbf{u}_c-\mathbf{u}_p|}$$

其中 $C_\mu=0.09$。取 $k=1$ m²/s²、$\varepsilon=10$ m²/s³，则 $\tau_e=0.03$ s，$l_e=0.09^{0.75}\times1/10=0.0164$ m。若颗粒穿越时间 $t_c$ 小于涡寿命 $\tau_e$，颗粒会穿过涡而扩散减弱；反之则被涡完整携带。这两个量的比值正是判断"是否需要湍流扩散模型"的依据：$St$ 很小的细粉必须开启，$St>10$ 的大颗粒可关闭以省算力。

## 颗粒时间步与 Courant 数

颗粒时间步应同时满足响应与穿越两个限制：

$$\Delta t_p=\min\left(\frac{\tau_p}{5},\ \frac{h}{|\mathbf{u}_p|}\right)$$

取 $d_p=80$ μm，$\tau_p=\rho_p d_p^{2}/(18\mu_g)=2500\times6.4\times10^{-9}/(3.24\times10^{-4})=0.049$ s，则 $\tau_p/5=9.9\times10^{-3}$ s；网格 $h=2$ mm、颗粒速度 10 m/s 时 $h/|\mathbf{u}_p|=2\times10^{-4}$ s。取小者得 $\Delta t_p=2\times10^{-4}$ s，即 Courant 限制主导。开启 `subCycling` 让颗粒在流体步内多次积分，是保证 $\Delta t_p$ 不被流体时间步拖大的常用做法。

## kinematicCloudProperties 配置片段

```cpp
solution
{
    active          true;
    coupled         true;      // 双向耦合
    transient       yes;
    cellValueSourceCorrection on;
    maxCo           0.3;       // 颗粒 Courant 上限
    sourceTerms     { schemes { U U; } }
}
subModels
{
    particleForces  { sphereDrag; gravity; }
    dispersionModel stochasticDispersionRAS;   // 随机游走
    injectionModels
    {
        model1
        {
            type            coneInjection;
            massTotal       0.01;      // kg
            SOI             0;         // s
            duration        5;         // s
            parcelsPerSecond 5000;
            flowRateProfile constant 1;
            sizeDistribution
            {
                type        RosinRammler;
                RosinRammlerDistribution
                {
                    minDiameter 1e-6;
                    maxDiameter 1e-4;
                    d           5e-5;      // d_m = 50 um
                    n           3;
                }
            }
        }
    }
}
```

## 参数取值与依据

| 参数 | 推荐取值 | 依据 |
|---|---|---|
| 分布指数 $n$ | 2.5～4 | 喷雾粒径分散度 |
| Cunningham 修正 | $d_p<5$ μm 必开 | 分子滑移效应 |
| 颗粒 Courant 数 | ≤ 0.3 | 单步不跨多单元 |
| 颗粒包数 | 10⁴ 量级 | 统计误差 0.5% |
| 随机种子 | 固定并记录 | 统计可复现 |
| 耦合方式 | 反馈量级 >1% 开双向 | 相间动量交换 |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 细粉沉积率偏高 | 未启用 Cunningham 修正 | 开修正后看 1 μm 颗粒终速是否下降约 17% |
| 颗粒轨迹沿流线堆叠 | 未开湍流扩散 | 打开随机游走，看颗粒是否铺展到湍流核心 |
| 重复作业统计不一致 | 随机种子未固定 | 固定种子跑两遍，比较沉积率是否逐位一致 |
| 颗粒穿过单元边界无变化 | 时间步过大越单元 | 把 maxCo 从 0.3 降到 0.1，看轨迹是否改变 |
| 连续相被"抽空" | 双向耦合源项过强 | 关耦合算单向，看连续相剖面是否恢复 |

## 设置顺序与文献

先定粒径分布与质量流率，再按 $d_p$ 判断是否需要 Cunningham 修正，随后按 $k$、$\varepsilon$ 估涡寿命决定扩散模型，最后用 $\tau_p$ 与 $h/|\mathbf{u}_p|$ 的较小值定时间步并设 `maxCo`。这四步的顺序不能颠倒，因为后一步的取值依赖前一步的结论。

1. Crowe, C.T., Sommerfeld, M. & Tsuji, Y., *Multiphase Flows with Droplets and Particles*, CRC Press, 1998.
2. Morsi, S.A. & Alexander, A.J., "An Investigation of Particle Trajectories in Two-Phase Flow Systems," *Journal of Fluid Mechanics*, 55(2), 1972.
3. Gosman, A.D. & Ioannides, E., "Aspects of Computer Simulation of Liquid-Fuelled Combustors," *Journal of Energy*, 7(6), 1983.
4. Rosin, P. & Rammler, E., "The Laws Governing the Fineness of Powdered Coal," *Journal of the Institute of Fuel*, 7, 1933.
5. Cunningham, E., "On the Velocity of Steady Fall of Spherical Particles through Fluid Medium," *Proceedings of the Royal Society A*, 83(563), 1910.
6. Sommerfeld, M., Kohnen, G. & Rüger, M., "Some Comments on the Applicability of the Standard k-ε Turbulence Model," *Applied Scientific Research*, 51, 1993.
