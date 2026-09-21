---
template_version: flowlab-knowledge/1.0
slug: cfd-equations-momentum-transport-modeling
title: 动量输运与应力张量：原理与工程设置
summary: >-
  应力张量把动量方程闭合起来，但牛顿本构、Stokes 假设与连续介质假设各有失效门槛。本文用 Knudsen 数、幂律黏度与 Weissenberg
  数给出三类升级判据，并算出 10 μm 通道的滑移流量增量。
category:
  slug: governing-equations
  name: 控制方程与物理建模
level: 进阶
reading_minutes: 17
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 控制方程与物理建模
  - 动量输运与应力张量
  - 物理建模与适用边界
  - Knudsen 数
  - 非牛顿本构
  - 工程设置与参数选择
  - 松弛因子
  - 动量收支
seo:
  title: 动量输运与应力张量：原理与工程设置
  description: >-
    应力张量把动量方程闭合起来，但牛顿本构、Stokes 假设与连续介质假设各有失效门槛。本文用 Knudsen 数、幂律黏度与 Weissenberg
    数给出三类升级判据，并算出 10 μm 通道的滑移流量增量。
  keywords:
    - 动量输运与应力张量
    - 物理建模与适用边界
    - Knudsen 数
    - 非牛顿本构
    - 工程设置与参数选择
    - 松弛因子
    - 动量收支
---
# 动量输运与应力张量：原理与工程设置

动量方程本身只是牛顿第二定律的连续形式，真正决定它能算什么的，是应力张量的闭合关系。牛顿本构、Stokes 假设、连续介质假设这三层假设各自有独立的失效门槛：第一层被高剪切下的非牛顿流体打破，第二层被多原子气体的体积黏性打破，第三层被稀薄气体打破。下面把三层判据写成可计算的无量纲数，并用 10 μm 空气通道与聚合物溶液两个算例给出具体数值。动量方程的四个贡献项——压力梯度、黏性应力散度、对流惯性与体积力——在具体工况里的量级可以相差四五个数量级。先算清哪几项占主导，再决定是否打开重力、是否需要高阶对流格式、松弛因子能给到多大，比从默认字典起步再反复试错要省得多。下面用一条 50 mm 水力直径的水通道把四项换算成 Pa/m，然后给出对应的求解控制参数与字典片段。

## 基础概念与控制关系

### 动量方程的四项贡献与量纲

不可压动量方程写成守恒形式

$$
\frac{\partial(\rho\mathbf{u})}{\partial t} + \nabla\cdot(\rho\mathbf{u}\mathbf{u}) = -\nabla p + \nabla\cdot\boldsymbol{\tau} + \rho\mathbf{g}
$$

其中应力张量对牛顿流体取

$$
\boldsymbol{\tau} = \mu\left(\nabla\mathbf{u} + (\nabla\mathbf{u})^{\mathrm{T}}\right) - \frac{2}{3}\mu(\nabla\cdot\mathbf{u})\mathbf{I}
$$

不可压条件下 $\nabla\cdot\mathbf{u}=0$，体积黏性项自动消失，应力张量退化为 $\boldsymbol{\tau}=2\mu\mathbf{S}$，$\mathbf{S}$ 为应变率张量的对称部分。每一项量纲都是 $\mathrm{N/m^3}$，即"单位体积的力"，除以密度得 $\mathrm{m/s^2}$。工程上更习惯折算成 $\mathrm{Pa/m}$：惯性项按 $\rho U^2/L$ 估、黏性项按 $\mu U/L^2$ 估、重力项按 $\rho g$ 估、压力梯度本身就是 $\mathrm{Pa/m}$。

### 应力张量的分解与本构闭合缺口

柯西动量方程把应力张量的散度作为唯一未知

$$
\rho\frac{D\mathbf{u}}{Dt} = \nabla\cdot\boldsymbol{\sigma} + \rho\mathbf{b},\qquad
\boldsymbol{\sigma} = -p\mathbf{I} + \boldsymbol{\tau}
$$

$\boldsymbol{\sigma}$ 有 9 个分量、由对称性降为 6 个，而动量方程只有 3 个，缺口必须用本构关系补上。牛顿流体的线性本构写成

$$
\tau_{ij} = 2\mu S_{ij} + \lambda_b\frac{\partial u_k}{\partial x_k}\delta_{ij},\qquad
S_{ij} = \frac{1}{2}\left(\frac{\partial u_i}{\partial x_j} + \frac{\partial u_j}{\partial x_i}\right)
$$

$\lambda_b$ 是体积黏度。不可压条件下 $\nabla\cdot\mathbf{u}=0$，第二项消失，这是"不可压流动里看不到体积黏性"的原因；但对可压缩流动、声波衰减与激波结构，$\lambda_b$ 直接进入耗散项。

### 广义牛顿与黏弹性：当应力不再瞬时跟随应变率

高剪切下的悬浮液、聚合物熔体、血液表现出剪切变稀，最简单的描述是幂律模型

$$
\mu_{\mathrm{eff}} = K\dot\gamma^{\,n-1}
$$

黄原胶水溶液取 $K=1.2\ \mathrm{Pa\cdot s^{\,n}}$、$n=0.45$，则 $\dot\gamma=1\ \mathrm{s^{-1}}$ 时 $\mu_{\mathrm{eff}}=1.2\ \mathrm{Pa\cdot s}$，$\dot\gamma=100\ \mathrm{s^{-1}}$ 时 $\mu_{\mathrm{eff}}=1.2\times100^{-0.55}=1.2\times0.0794=0.0953\ \mathrm{Pa\cdot s}$，两个数量级的剪切率带来 12.6 倍的黏度下降。幂律模型只改黏度的大小、不改应力的方向，属于"广义牛顿"范畴，把它塞进现有求解器只需替换 $\mu$ 场。

真正的分岔出现在弹性不可忽略时。判据是 Weissenberg 数

$$
Wi = \lambda_{\mathrm{relax}}\dot\gamma
$$

$\lambda_{\mathrm{relax}}$ 是流体的应力松弛时间。取典型聚丙烯酰胺溶液 $\lambda_{\mathrm{relax}}=0.01\ \mathrm{s}$、$\dot\gamma=1000\ \mathrm{s^{-1}}$，得 $Wi=10$，此时弹性应力与黏性应力同量级，会出现爬杆、挤出胀大、二次流这些牛顿流体中不存在的现象。判断是否需要上黏弹性本构（Oldroyd-B、Giesekus、PTT）的经验界线是 $Wi>1$；$Wi<0.1$ 时用广义牛顿足够。模型每升一级，都要新增一个独立可测参数（$\lambda_{\mathrm{relax}}$、第二法向应力差系数），这些参数难以从常规流变实验唯一确定，也是黏弹性 CFD 结果分散度大的根本原因。

```python
import math
lam, mu, rho = 6.8e-8, 1.825e-5, 1.204      # m, Pa.s, kg/m3
nu = mu / rho
for D in (10e-6, 1e-6, 0.1e-6):             # m
    Kn = lam / D
    print(f"D={D*1e6:5.1f} um  Kn={Kn:.3e}  Q/Q0={1+6*Kn:.3f}")
# D= 10.0 um  Kn=6.800e-03  Q/Q0=1.041
# D=  1.0 um  Kn=6.800e-02  Q/Q0=1.408
# D=  0.1 um  Kn=6.800e-01  Q/Q0=5.080   <- 一阶滑移已不适用
print(f"nu={nu:.3e} m2/s")                  # 1.516e-05
K, n, gdot = 1.2, 0.45, 100.0
print(f"mu_eff={K*gdot**(n-1):.4f} Pa.s")   # 0.0953
```

注意 0.1 μm 那行的 $Q/Q_0=5.08$ 是一阶滑移外推的产物，超出滑移区后这个公式本身已经失效，把结果当真会得到荒谬的结论——这也是把判据数值和公式适用范围一起记录的意义。

## 适用边界与方案选择

### 连续介质假设的边界：从平均自由程算 Knudsen 数

Navier–Stokes 方程要求流体在比分子间距大得多的尺度上连续，判据是

$$
Kn = \frac{\lambda}{L}
$$

$\lambda$ 是分子平均自由程，$L$ 是流动特征尺度。20 ℃、1 atm 空气中 $\lambda\approx6.8\times10^{-8}\ \mathrm{m}$，对应黏度 $\mu=1.825\times10^{-5}\ \mathrm{Pa\cdot s}$、密度 $\rho=1.204\ \mathrm{kg/m^3}$，运动黏度

$$
\nu = \frac{\mu}{\rho} = \frac{1.825\times10^{-5}}{1.204} = 1.516\times10^{-5}\ \mathrm{m^2/s}
$$

分级标准是：$Kn<0.01$ 连续介质、无滑移边界成立；$0.01<Kn<0.1$ 滑移区，Navier–Stokes 仍可用但必须换成 Maxwell 滑移边界；$0.1<Kn<10$ 过渡区，需要 Burnett 方程或直接模拟（DSMC）；$Kn>10$ 自由分子流。把 $\lambda$ 代入：通道当量直径 10 μm 时 $Kn=6.8\times10^{-3}$，仍在连续介质区内，只是已经用了允许值的三分之二；直径 1 μm 时 $Kn=0.068$，进入滑移区；直径 0.1 μm 时 $Kn=0.68$，Navier–Stokes 失效。

滑移区的流量修正是可以手算的。平行板通道中一阶 Maxwell 滑移给出

$$
\frac{Q}{Q_0} = 1 + 6\,Kn
$$

$Q_0$ 为无滑移 Poiseuille 流量。$Kn=0.068$ 时 $Q/Q_0=1+6\times0.068=1.408$，滑移贡献了 40.8% 的流量——这个量级远大于常规离散误差，因此微通道计算中把壁面设成无滑移会直接给出错误的流量特性曲线。

同一通道取空气流速 $U=1\ \mathrm{m/s}$，雷诺数 $Re=\rho U D/\mu=1.204\times1\times10^{-5}/1.825\times10^{-5}=0.66$，层流、惯性可忽略，此时唯一的物理复杂度就来自稀薄效应，这也解释了微通道研究的注意力为什么集中在 $Kn$ 而不是 $Re$ 上。

### Stokes 假设对单原子气体成立，对多原子气体只是近似

Stokes 假设取 $\lambda_b=-2\mu/3$，其物理含义是流体在无黏性耗散下不产生体积黏性阻力，等价于假定分子只有平动自由度。氦、氩这类单原子气体在常温下满足得很好；氮气、二氧化碳、甲烷有转动和振动自由度，能量在平动与内自由度之间的弛豫会产生额外耗散，$\lambda_b$ 与 $\mu$ 同量级。后果出现在两类问题上：一是激波厚度与激波后松弛区，二是声波在管道中的衰减系数。工程做法是：定常亚声速可压缩流动可以放心用 $\lambda_b=-2\mu/3$；涉及声吸收、超声速激波结构、强膨胀（如喷嘴内凝结）时，要么使用带体积黏性的本构，要么用考虑内自由度弛豫的模型替代单纯的 Navier–Stokes。

## 工程设置与实施

### 输入参数台账

| 设置项 | 取值 | 取值依据 |
|---|---|---|
| 重力矢量 | $(0,-9.81,0)\ \mathrm{m/s^2}$ | $1/Fr^2=0.49$，与惯性同量级 |
| 水密度 / 黏度 | $998.2\ \mathrm{kg/m^3}$ / $1.002\times10^{-3}\ \mathrm{Pa\cdot s}$ | 20 ℃ 常压 |
| 入口 $k$ / $\omega$ | $3.75\times10^{-3}\ \mathrm{m^2/s^2}$ / $15.97\ \mathrm{s^{-1}}$ | $I=5\%$、$L_t=0.07D$ |
| 动量 / 压力松弛 | 0.7 / 0.3 | 稳态 SIMPLE 常规值 |

### 求解控制参数：松弛因子与线性求解器

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

### 用无量纲数决定哪一项不能省

把动量方程按 $\rho U^2/L$ 无量纲化，惯性项系数为 1，其余三项分别得到

$$
\frac{\text{压力}}{\text{惯性}} = Eu,\qquad
\frac{\text{黏性}}{\text{惯性}} = \frac{1}{Re} = \frac{\mu}{\rho U L},\qquad
\frac{\text{重力}}{\text{惯性}} = \frac{1}{Fr^2} = \frac{gL}{U^2}
$$

取 $D=0.05\ \mathrm{m}$、水温 20 ℃（$\rho=998.2\ \mathrm{kg/m^3}$、$\mu=1.002\times10^{-3}\ \mathrm{Pa\cdot s}$）、平均流速 $U=1\ \mathrm{m/s}$。雷诺数 $Re=\rho U D/\mu=998.2\times1\times0.05/1.002\times10^{-3}=4.98\times10^4$，处于湍流区。动压 $\frac{1}{2}\rho U^2=0.5\times998.2\times1^2=499.1\ \mathrm{Pa}$。

四项折算到单位长度：

$Re^{-0.25}=(4.98\times10^4)^{-0.25}=1/14.93=0.0670$，故 $f=0.316\times0.0670=0.0212$，$\Delta p/L=f\rho U^2/(2D)=0.0212\times998.2\times1/(2\times0.05)=211\ \mathrm{Pa/m}$。弗劳德数 $Fr=U/\sqrt{gL}=1/\sqrt{9.81\times0.05}=1.43$，即重力与惯性同量级：这条通道里重力占比接近惯性的一半，绝对不能省略。相反，如果这是水平管路且只关心压降，重力沿流向分量为零，可以只保留压力与摩阻两项，把问题降成一维。$1/Fr^2$ 超过 0.1 就必须显式给出重力矢量；$1/Re$ 小于 $10^{-3}$ 时分子黏性对主流压降的贡献可并入湍流模型。

| 贡献项 | 估算式 | 数值 (Pa/m) | 与惯性之比 |
|---|---|---|---|
| 惯性 $\rho U^2/L$ | $998.2\times1^2/0.05$ | 19964 | 1 |
| 重力 $\rho g$ | $998.2\times9.81$ | 9792 | 0.49 |
| 湍流摩阻 $f\rho U^2/(2D)$ | Blasius $f=0.316Re^{-0.25}$ | 211 | 0.011 |
| 层流黏性 $\mu U/L^2$ | $1.002\times10^{-3}/0.0025$ | 0.40 | $2.0\times10^{-5}$ |

### 湍流入口量按经验公式定，而不是拍脑袋

动量方程的闭合缺口由湍流模型补上，入口湍流量决定整场的黏性应力水平。设湍流强度 $I=5\%$、特征长度 $L_t=0.07D=0.007\ \mathrm{m}$（入口当量直径 0.1 m），则

$$
k = \frac{3}{2}(I U)^2 = 1.5\times(0.05\times1)^2 = 3.75\times10^{-3}\ \mathrm{m^2/s^2}
$$

$$
\omega = \frac{k^{1/2}}{C_\mu^{1/4} L_t} = \frac{0.0612}{0.5477\times0.007} = 15.97\ \mathrm{s^{-1}}
$$

其中 $C_\mu=0.09$、$C_\mu^{1/4}=0.5477$。若用 $k$-$\varepsilon$ 模型，$\varepsilon=C_\mu^{3/4}k^{3/2}/L_t=0.1643\times2.297\times10^{-4}/0.007=5.39\times10^{-3}\ \mathrm{m^2/s^3}$，且应满足 $\omega=\varepsilon/(C_\mu k)=5.39\times10^{-3}/(0.09\times3.75\times10^{-3})=15.97\ \mathrm{s^{-1}}$，与上式一致。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 微通道压降比理论值低 30%，流速偏高 | 壁面无滑移边界在 $Kn>0.01$ 时高估了阻力 | 算 $Kn=\lambda/D$，超过 0.01 就换 Maxwell 滑移边界重算 |
| 聚合物溶液算出的压降与实验相差一个量级 | 用常黏度代替剪切变稀，高剪切区黏度虚高 | 用流变仪给出 $\mu_{\mathrm{eff}}(\dot\gamma)$ 曲线，与幂律拟合对比 $R^2$ |
| 收敛解中出现非物理的二次流或爬杆 | 弹性应力未建模，$Wi>1$ | 由松弛时间与剪切率算 $Wi$，超过 1 时改用 Oldroyd-B 类本构 |
| 可压缩算例的声波衰减比实测弱 | 用了 Stokes 假设，忽略了多原子气体的体积黏性 | 对比 $\lambda_b=0$、$-2\mu/3$ 两组算例的衰减系数 |
| 高 $Kn$ 算例残差能收敛但结果无物理意义 | 方程形式超出连续介质假设，收敛只是代数收敛 | 输出 $Kn$ 分布，若最大值超过 0.1 则改用 DSMC 或 Burnett |
| 应力张量散度出现网格相关幅值 | 应变率张量在畸变网格上重构误差大 | 把梯度格式从 Gauss linear 换成 leastSquares，看散度场是否收敛 |
| 打开重力后残差立即抬升两个量级 | 重力矢量与几何坐标系不一致，产生横向虚假体积力 | 输出 `g` 与重力方向单位向量的点积，应接近 $\pm9.81$ |
| 压降比 Blasius 估算高 3 倍以上 | 入口湍流量偏大，湍流黏性虚高 | 把 $k$ 按 $I=1\%$ 重算（$1.5\times10^{-4}\ \mathrm{m^2/s^2}$）复算，看压降是否单调下降 |
| 动量残差在 $10^{-3}$ 附近平台化 | 松弛因子过小或线性容差过松 | 固定松弛为 0.7、把 $U$ 容差收紧到 $10^{-9}$，观察平台是否下移 |
| 层流算例被"算成"湍流 | 未关闭湍流模型，$k$ 方程仍在产生湍流黏性 | 输出 $\mu_t/\mu$，层流工况该比值应低于 $10^{-3}$ |
| 高长宽比网格上动量方程不收敛 | 非正交修正次数不足，面法向梯度误差累积 | 把 `nNonOrthogonalCorrectors` 从 1 加到 2，看残差是否再降一档 |
| 静水工况出现缓慢漂移速度场 | 压力边界与重力不平衡，缺少静水压力初始化 | 初始化时令 $p=p_{ref}-\rho g y$，漂移应立即消失 |

## 参考资料

1. Bird R.B., Armstrong R.C., Hassager O., *Dynamics of Polymeric Liquids, Vol. 1: Fluid Mechanics*, 2nd ed., Wiley, 1987.
2. Karniadakis G., Beskok A., Aluru N., *Microflows and Nanoflows: Fundamentals and Simulation*, Springer, 2005.
3. Stokes G.G., "On the theories of the internal friction of fluids in motion", *Transactions of the Cambridge Philosophical Society*, 8:287–305, 1845.
4. Truesdell C., Noll W., *The Non-Linear Field Theories of Mechanics*, 3rd ed., Springer, 2004.
5. Oldroyd J.G. 《On the formulation of rheological equations of state》. Proceedings of the Royal Society A, 1950.
6. Bird G.A. 《Molecular Gas Dynamics and the Direct Simulation of Gas Flows》. Oxford University Press, 1994.
7. Schowalter W.R. 《Mechanics of Non-Newtonian Fluids》. Pergamon Press, 1978.
8. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
9. White F.M., *Viscous Fluid Flow*, 3rd ed., McGraw-Hill, 2006.
10. Menter F.R., "Two-equation eddy-viscosity turbulence models for engineering applications", *AIAA Journal*, 32(8):1598–1605, 1994.
11. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics*, 2nd ed., Pearson, 2007.
