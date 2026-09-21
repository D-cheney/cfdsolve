---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-momentum-transport-engineering-setup
title: "动量输运与应力张量：工程设置与参数选择"
summary: "按量级把动量方程的压力、黏性、惯性与重力四项分开，给出 50 mm 水通道的四项预算数字，并列出松弛因子、线性求解器、湍流入口量与重力向量的具体取值和 OpenFOAM 配置片段。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 工程
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "动量输运与应力张量"
  - "工程设置与参数选择"
  - "松弛因子"
  - "动量收支"
seo:
  title: "动量输运与应力张量：工程设置与参数选择"
  description: "按量级把动量方程的压力、黏性、惯性与重力四项分开，给出 50 mm 水通道的四项预算数字，并列出松弛因子、线性求解器、湍流入口量与重力向量的具体取值和 OpenFOAM 配置片段。"
  keywords:
    - "动量输运与应力张量"
    - "工程设置与参数选择"
    - "松弛因子"
    - "动量收支"
---

# 动量输运与应力张量：工程设置与参数选择

动量方程的四个贡献项——压力梯度、黏性应力散度、对流惯性与体积力——在具体工况里的量级可以相差四五个数量级。先算清哪几项占主导，再决定是否打开重力、是否需要高阶对流格式、松弛因子能给到多大，比从默认字典起步再反复试错要省得多。下面用一条 50 mm 水力直径的水通道把四项换算成 Pa/m，然后给出对应的求解控制参数与字典片段。

## 动量方程的四项贡献与量纲

不可压动量方程写成守恒形式

$$
\frac{\partial(\rho\mathbf{u})}{\partial t} + \nabla\cdot(\rho\mathbf{u}\mathbf{u}) = -\nabla p + \nabla\cdot\boldsymbol{\tau} + \rho\mathbf{g}
$$

其中应力张量对牛顿流体取

$$
\boldsymbol{\tau} = \mu\left(\nabla\mathbf{u} + (\nabla\mathbf{u})^{\mathrm{T}}\right) - \frac{2}{3}\mu(\nabla\cdot\mathbf{u})\mathbf{I}
$$

不可压条件下 $\nabla\cdot\mathbf{u}=0$，体积黏性项自动消失，应力张量退化为 $\boldsymbol{\tau}=2\mu\mathbf{S}$，$\mathbf{S}$ 为应变率张量的对称部分。每一项量纲都是 $\mathrm{N/m^3}$，即"单位体积的力"，除以密度得 $\mathrm{m/s^2}$。工程上更习惯折算成 $\mathrm{Pa/m}$：惯性项按 $\rho U^2/L$ 估、黏性项按 $\mu U/L^2$ 估、重力项按 $\rho g$ 估、压力梯度本身就是 $\mathrm{Pa/m}$。

## 用无量纲数决定哪一项不能省

把动量方程按 $\rho U^2/L$ 无量纲化，惯性项系数为 1，其余三项分别得到

$$
\frac{\text{压力}}{\text{惯性}} = Eu,\qquad
\frac{\text{黏性}}{\text{惯性}} = \frac{1}{Re} = \frac{\mu}{\rho U L},\qquad
\frac{\text{重力}}{\text{惯性}} = \frac{1}{Fr^2} = \frac{gL}{U^2}
$$

取 $D=0.05\ \mathrm{m}$、水温 20 ℃（$\rho=998.2\ \mathrm{kg/m^3}$、$\mu=1.002\times10^{-3}\ \mathrm{Pa\cdot s}$）、平均流速 $U=1\ \mathrm{m/s}$。雷诺数 $Re=\rho U D/\mu=998.2\times1\times0.05/1.002\times10^{-3}=4.98\times10^4$，处于湍流区。动压 $\frac{1}{2}\rho U^2=0.5\times998.2\times1^2=499.1\ \mathrm{Pa}$。

四项折算到单位长度：

| 贡献项 | 估算式 | 数值 (Pa/m) | 与惯性之比 |
|---|---|---|---|
| 惯性 $\rho U^2/L$ | $998.2\times1^2/0.05$ | 19964 | 1 |
| 重力 $\rho g$ | $998.2\times9.81$ | 9792 | 0.49 |
| 湍流摩阻 $f\rho U^2/(2D)$ | Blasius $f=0.316Re^{-0.25}$ | 211 | 0.011 |
| 层流黏性 $\mu U/L^2$ | $1.002\times10^{-3}/0.0025$ | 0.40 | $2.0\times10^{-5}$ |

$Re^{-0.25}=(4.98\times10^4)^{-0.25}=1/14.93=0.0670$，故 $f=0.316\times0.0670=0.0212$，$\Delta p/L=f\rho U^2/(2D)=0.0212\times998.2\times1/(2\times0.05)=211\ \mathrm{Pa/m}$。弗劳德数 $Fr=U/\sqrt{gL}=1/\sqrt{9.81\times0.05}=1.43$，即重力与惯性同量级：这条通道里重力占比接近惯性的一半，绝对不能省略。相反，如果这是水平管路且只关心压降，重力沿流向分量为零，可以只保留压力与摩阻两项，把问题降成一维。$1/Fr^2$ 超过 0.1 就必须显式给出重力矢量；$1/Re$ 小于 $10^{-3}$ 时分子黏性对主流压降的贡献可并入湍流模型。

## 求解控制参数：松弛因子与线性求解器

动量方程与连续性方程通过压力耦合，非线性来自对流项，因此求解控制参数分三层：外层迭代次数、方程级松弛因子、线性求解器容差。稳态求解常用动量松弛 0.7、压力松弛 0.3；高长宽比或强浮力时降到 0.5 / 0.2 换稳定，代价是迭代步数增加。瞬态 PIMPLE 每步做 3 次外迭代时动量可取 1.0、压力取 0.3～0.5。

线性求解器方面，压力方程对称正定，用 GAMG 配 GaussSeidel，容差 $10^{-7}$、relTol 0.01；动量方程非对称，用 smoothSolver 配 symGaussSeidel，容差 $10^{-8}$、relTol 0.1。relTol 不能太小，否则最后几次迭代只在处理舍入噪声。

```cpp
// system/fvSolution
solvers
{
    p
    {
        solver          GAMG;
        smoother        GaussSeidel;
        tolerance       1e-7;
        relTol          0.01;
    }
    "(U|k|omega)"
    {
        solver          smoothSolver;
        smoother        symGaussSeidel;
        tolerance       1e-8;
        relTol          0.1;
    }
}
SIMPLE
{
    nNonOrthogonalCorrectors 1;   // 面法向与中心连线夹角余弦 < 0.5 时加到 2
}
relaxationFactors
{
    equations
    {
        U               0.7;
        "(k|omega)"     0.7;
        p               0.3;
    }
}
```

重力在 `constant/g` 中以矢量给出，量纲 $\mathrm{m/s^2}$，与坐标系方向绑定；几何做过旋转时必须同步旋转该矢量，否则会出现"重力侧向分量"这类输入错误的发散。

## 湍流入口量按经验公式定，而不是拍脑袋

动量方程的闭合缺口由湍流模型补上，入口湍流量决定整场的黏性应力水平。设湍流强度 $I=5\%$、特征长度 $L_t=0.07D=0.007\ \mathrm{m}$（入口当量直径 0.1 m），则

$$
k = \frac{3}{2}(I U)^2 = 1.5\times(0.05\times1)^2 = 3.75\times10^{-3}\ \mathrm{m^2/s^2}
$$

$$
\omega = \frac{k^{1/2}}{C_\mu^{1/4} L_t} = \frac{0.0612}{0.5477\times0.007} = 15.97\ \mathrm{s^{-1}}
$$

其中 $C_\mu=0.09$、$C_\mu^{1/4}=0.5477$。若用 $k$-$\varepsilon$ 模型，$\varepsilon=C_\mu^{3/4}k^{3/2}/L_t=0.1643\times2.297\times10^{-4}/0.007=5.39\times10^{-3}\ \mathrm{m^2/s^3}$，且应满足 $\omega=\varepsilon/(C_\mu k)=5.39\times10^{-3}/(0.09\times3.75\times10^{-3})=15.97\ \mathrm{s^{-1}}$，与上式一致。

## 输入参数台账

| 设置项 | 取值 | 取值依据 |
|---|---|---|
| 重力矢量 | $(0,-9.81,0)\ \mathrm{m/s^2}$ | $1/Fr^2=0.49$，与惯性同量级 |
| 水密度 / 黏度 | $998.2\ \mathrm{kg/m^3}$ / $1.002\times10^{-3}\ \mathrm{Pa\cdot s}$ | 20 ℃ 常压 |
| 入口 $k$ / $\omega$ | $3.75\times10^{-3}\ \mathrm{m^2/s^2}$ / $15.97\ \mathrm{s^{-1}}$ | $I=5\%$、$L_t=0.07D$ |
| 动量 / 压力松弛 | 0.7 / 0.3 | 稳态 SIMPLE 常规值 |

## 失败模式：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 打开重力后残差立即抬升两个量级 | 重力矢量与几何坐标系不一致，产生横向虚假体积力 | 输出 `g` 与重力方向单位向量的点积，应接近 $\pm9.81$ |
| 压降比 Blasius 估算高 3 倍以上 | 入口湍流量偏大，湍流黏性虚高 | 把 $k$ 按 $I=1\%$ 重算（$1.5\times10^{-4}\ \mathrm{m^2/s^2}$）复算，看压降是否单调下降 |
| 动量残差在 $10^{-3}$ 附近平台化 | 松弛因子过小或线性容差过松 | 固定松弛为 0.7、把 $U$ 容差收紧到 $10^{-9}$，观察平台是否下移 |
| 层流算例被"算成"湍流 | 未关闭湍流模型，$k$ 方程仍在产生湍流黏性 | 输出 $\mu_t/\mu$，层流工况该比值应低于 $10^{-3}$ |
| 高长宽比网格上动量方程不收敛 | 非正交修正次数不足，面法向梯度误差累积 | 把 `nNonOrthogonalCorrectors` 从 1 加到 2，看残差是否再降一档 |
| 静水工况出现缓慢漂移速度场 | 压力边界与重力不平衡，缺少静水压力初始化 | 初始化时令 $p=p_{ref}-\rho g y$，漂移应立即消失 |

## 参考文献

1. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
2. White F.M., *Viscous Fluid Flow*, 3rd ed., McGraw-Hill, 2006.
3. Menter F.R., "Two-equation eddy-viscosity turbulence models for engineering applications", *AIAA Journal*, 32(8):1598–1605, 1994.
4. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics*, 2nd ed., Pearson, 2007.
