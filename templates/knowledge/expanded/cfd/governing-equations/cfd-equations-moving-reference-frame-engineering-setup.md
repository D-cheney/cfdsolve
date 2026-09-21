---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-moving-reference-frame-engineering-setup
title: "移动与旋转参考系：工程设置与参数选择"
summary: "旋转参考系里绝对速度与相对速度相差 Ω×r，动量方程多出科氏与离心两项。本文用 1450 rpm 离心泵叶轮算出 Ω、叶尖速度、科氏加速度与离心压升，并给出 MRF 与滑移网格的 OpenFOAM 字典配置。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "移动与旋转参考系"
  - "工程设置与参数选择"
  - "MRF 冻结转子"
  - "科氏加速度"
seo:
  title: "移动与旋转参考系：工程设置与参数选择"
  description: "旋转参考系里绝对速度与相对速度相差 Ω×r，动量方程多出科氏与离心两项。本文用 1450 rpm 离心泵叶轮算出 Ω、叶尖速度、科氏加速度与离心压升，并给出 MRF 与滑移网格的 OpenFOAM 字典配置。"
  keywords:
    - "移动与旋转参考系"
    - "工程设置与参数选择"
    - "MRF 冻结转子"
    - "科氏加速度"
---

# 移动与旋转参考系：工程设置与参数选择

在旋转坐标系里求解的流体变量是相对速度，而用户关心的是绝对量（扬程、效率、噪声源）。两者相差 $\boldsymbol{\Omega}\times\mathbf{r}$，动量方程相应多出科氏项与离心项。设置的核心是四件事：转速换算成 rad/s、旋转轴与原点写对、选择 MRF 冻结转子还是滑移网格、以及在后处理里把相对速度还原成绝对速度。下面用一个 1450 rpm、叶轮外径 200 mm 的离心泵把每一步的数字算出来。

## 绝对速度、相对速度与两个惯性力

绕 $z$ 轴刚体旋转时，绝对切向速度比相对切向速度多出一个半径项

$$
u_\theta^{abs} = u_\theta^{rel} + \Omega r
$$

折算成单位体积的惯性力，动量方程右端要多出两项

$$
\mathbf{f}_{Cor} = -2\rho\,\boldsymbol{\Omega}\times\mathbf{u}_{rel},\qquad
\mathbf{f}_{cen} = -\rho\Omega^2\mathbf{r}_\perp
$$

科氏力方向同时垂直于转轴与相对速度；离心力沿径向向外，$\mathbf{r}_\perp$ 是位置矢量在转轴垂直平面内的投影，大小为 $\rho\Omega^2 r_\perp$。工程实现上，MRF 方法把离心项并入修正压力 $p^{*}=p-\frac{1}{2}\rho|\boldsymbol{\Omega}\times\mathbf{r}|^2$，只显式保留科氏项作为体积力源；滑移网格方法则让网格真实转动，两项都由网格运动自然产生，代价是必须用瞬态求解。这两种处理的差别只在离散层面，物理量本身是一致的。

## 转速换算与两个特征数

转速与角速度的换算必须先做对，否则后面全错

$$
\Omega = \frac{2\pi n}{60}
$$

$n=1450\ \mathrm{rpm}$ 时 $\Omega=2\pi\times1450/60=151.84\ \mathrm{rad/s}$。叶轮外半径 $r_2=0.1\ \mathrm{m}$ 处的叶尖速度 $U_2=\Omega r_2=151.84\times0.1=15.18\ \mathrm{m/s}$，进口半径 $r_1=0.04\ \mathrm{m}$ 处为 $6.07\ \mathrm{m/s}$。

判断旋转效应能否忽略用罗斯贝数

$$
Ro = \frac{U}{\Omega L}
$$

取 $U=U_2=15.18\ \mathrm{m/s}$、$L=r_2=0.1\ \mathrm{m}$，得 $Ro=15.18/(151.84\times0.1)=1.00$。$Ro\approx1$ 意味着科氏力与惯性力同量级，绝不能当作小量处理。对比两个极端：地球大气中 $U=10\ \mathrm{m/s}$、$L=10^6\ \mathrm{m}$、$\Omega=7.292\times10^{-5}\ \mathrm{rad/s}$，$Ro=0.137$，科氏力主导；实验室小型搅拌槽 $U=0.5\ \mathrm{m/s}$、$L=0.05\ \mathrm{m}$、$\Omega=10\ \mathrm{rad/s}$，$Ro=1.0$，同样是强旋转问题。凡是 $Ro<5$，就必须保留完整的旋转源项。

两个惯性力的量级也要分开看。叶尖处离心加速度 $\Omega^2 r_2=151.84^2\times0.1=2.31\times10^3\ \mathrm{m/s^2}$，约合 235 倍重力加速度；同一点的科氏加速度 $2\Omega U_2=2\times151.84\times15.18=4.61\times10^3\ \mathrm{m/s^2}$，是离心加速度的两倍。这一条常被忽略：直觉上"离心力更大"，但在 $Ro\approx1$ 的叶轮里科氏项才是主导的体积力，MRF 实现中把离心项吸收进压力、只显式处理科氏项，正是因为它更难被压力梯度吸收。

## 离心压升与扬程

忽略损失时，径向平衡给出离心压升

$$
\Delta p_c = \frac{1}{2}\rho\Omega^2(r_2^2-r_1^2)
$$

水取 $\rho=998.2\ \mathrm{kg/m^3}$，代入得 $\Delta p_c=0.5\times998.2\times151.84^2\times(0.1^2-0.04^2)=499.1\times23055\times0.0084=9.67\times10^4\ \mathrm{Pa}$，即 96.7 kPa。折成扬程 $H=\Delta p_c/(\rho g)=96658/(998.2\times9.81)=9.87\ \mathrm{m}$，与单级离心泵 8～12 m 的典型扬程吻合。这个数字有两个用处：一是检查量纲与输入转速有没有搞错，二是为出口压力边界提供一个初值——把出口设成 0 Pa 让求解器自己"找到"96.7 kPa 的压升，收敛会慢很多。

## OpenFOAM 字典的四个必填位置

旋转设置在 OpenFOAM 中分散在四个位置，缺一个就会出现"叶轮不转"或"转速翻倍"这类难以从残差看出来的错误。

```cpp
// 1) constant/MRFProperties —— 冻结转子（稳态）
MRF
{
    cellZone        rotor;
    active          yes;
    nonRotatingPatches ();
    origin          (0 0 0);
    axis            (0 0 1);
    omega           151.84;          // rad/s，不是 rpm
}

// 2) constant/dynamicMeshDict —— 滑移网格（瞬态）
dynamicFvMesh   dynamicMotionSolverFvMesh;
solver          solidBody;
solidBodyCoeffs
{
    cellZone        rotor;
    solidBodyMotionFunction  rotatingMotion;
    rotatingMotionCoeffs
    {
        origin      (0 0 0);
        axis        (0 0 1);
        omega       151.84;
    }
}

// 3) 0/U 中给叶轮壁面绝对速度
"rotor.*"
{
    type            rotatingWallVelocity;
    origin          (0 0 0);
    axis            (0 0 1);
    omega           151.84;
}
```

第四处是转静交界面：MRF 冻结转子在稳态下直接把交界当作内部面，交界面必须用 `cyclic` 或 `cyclicAMI` 类型并保证两侧网格在周向有相同的分区数，否则质量通量在交界处不守恒。若要做混合平面法，把交界换成 `mixingPlane` 类型的 `cyclic` 面并指定径向与周向插值；`cyclicAMI` 用于两侧网格不匹配的滑移网格。检查方法是后处理时输出交界面的质量通量差，应在 $10^{-6}$ 相对量级。

| 参数 | 取值 | 依据 |
|---|---|---|
| 转速 $n$ | 1450 rpm | 四极异步电机 50 Hz 同步转速 1500 rpm，滑差约 3.3% |
| 角速度 $\Omega$ | 151.84 rad/s | $2\pi n/60$ |
| 转轴 | $(0,0,1)$ | 与几何建模坐标系一致 |
| 叶轮外半径 $r_2$ | 0.1 m | 叶轮外径 200 mm |
| 罗斯贝数 $Ro$ | 1.00 | 科氏力与惯性力同量级，必须保留 |
| 出口压力初值 | 96.7 kPa | 离心压升估算，加速收敛 |
| 时间步（滑移网格） | $5\times10^{-5}\ \mathrm{s}$ | 叶轮每步转过 $7.6\times10^{-3}\ \mathrm{rad}$，约 0.44° |

## 失败模式：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 叶轮区域速度场呈刚性旋转，无叶片做功迹象 | `omega` 写成 rpm（1450）而非 rad/s（151.84），离心项被放大 9.5 倍 | 打印 `MRFProperties` 中的 omega，与 $2\pi n/60$ 对比 |
| 出口压升为负或接近零 | 旋转轴符号与几何坐标系相反，科氏力方向错误 | 检查叶尖处绝对速度方向，应与叶片旋转方向一致 |
| 稳态 MRF 结果在叶片通道内出现回流 | 冻结转子假设在 $Ro\approx1$ 的强非定常流中不成立 | 改用滑移网格瞬态求解，比较一个叶道通过周期的时均压升 |
| 转静交界面质量不守恒 | 两侧网格周向分区数不一致，`cyclicAMI` 权重计算异常 | 输出交界面两侧 `phi` 的积分差，应小于 $10^{-6}$ 相对量 |
| 瞬态算例每步残差周期性尖峰 | 时间步过大，叶轮每步转过超过 1° 且外迭代不足 | 把 $\Delta t$ 减半，若尖峰幅度按比例下降则是时间离散误差 |
| 后处理扬程比设计值高 20% 以上 | 用相对速度直接算总压，漏掉了 $\frac{1}{2}|\boldsymbol{\Omega}\times\mathbf{r}|^2$ 项 | 在叶轮区把绝对速度 $u_{abs}=u_{rel}+\Omega\times r$ 还原后再积分总压 |

## 参考文献

1. Brennen C.E., *Hydrodynamics of Pumps*, Oxford University Press, 1994.
2. ANSYS Inc., *ANSYS Fluent Theory Guide*, ANSYS Inc., 2021.
3. Hirsch C., *Numerical Computation of Internal and External Flows*, 2nd ed., Butterworth-Heinemann, 2007.
4. Lakshminarayana B., *Fluid Dynamics and Heat Transfer of Turbomachinery*, Wiley, 1996.
