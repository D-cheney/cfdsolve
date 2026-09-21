---
template_version: flowlab-knowledge/1.0
slug: navier-stokes
title: Navier–Stokes 方程：原理与工程设置
summary: >-
  从积分守恒推导不可压 Navier–Stokes，说明本构闭合与 Stokes 假设引入的额外假设，给出五个相似参数的分工，并用 1 m
  平板算例把边界层厚度、摩阻系数与 Kolmogorov 尺度算到具体数值。
category:
  slug: governing-equations
  name: 控制方程与物理建模
level: 进阶
reading_minutes: 18
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 控制方程与物理建模
  - Navier–Stokes 方程
  - 物理建模与适用边界
  - 本构闭合
  - Kolmogorov 尺度
  - 工程设置与参数选择
  - fvSchemes
  - 库朗数
seo:
  title: Navier–Stokes 方程：原理与工程设置
  description: >-
    从积分守恒推导不可压 Navier–Stokes，说明本构闭合与 Stokes 假设引入的额外假设，给出五个相似参数的分工，并用 1 m
    平板算例把边界层厚度、摩阻系数与 Kolmogorov 尺度算到具体数值。
  keywords:
    - Navier–Stokes 方程
    - 物理建模与适用边界
    - 本构闭合
    - Kolmogorov 尺度
    - 工程设置与参数选择
    - fvSchemes
    - 库朗数
---
# Navier–Stokes 方程：原理与工程设置

Navier–Stokes 方程并不是一条假设，而是三层假设的叠加：质量与动量的积分守恒、应力张量的线性本构、以及流体在特征尺度上连续。前两层决定方程形式，第三层决定方程能不能用。工程上出问题最多的地方不是推导，而是把这三层假设的适用条件当成"永远成立"。不可压 Navier–Stokes 方程落地时，真正需要用户决定的只有四类参数：用哪个压力—速度耦合算法、对流项用什么格式、时间步取多大、近壁首层网格多高。这四项里只有最后一项直接由目标 y+ 决定，其余三项都是精度与稳定性的折中。下面把四项拆开，用一块 1 m 长平板在 20 m/s 空气流中的算例把 y+、库朗数与首层高度换算成具体毫米和微秒，并给出可直接粘贴的 `fvSchemes`。

## 从积分守恒到微分形式

对任意固定控制体写出动量平衡：动量的变化率等于净对流通量、表面力与体积力之和

$$
\frac{\mathrm{d}}{\mathrm{d}t}\int_V \rho\mathbf{u}\,\mathrm{d}V + \oint_{\partial V}\rho\mathbf{u}(\mathbf{u}\cdot\mathrm{d}\mathbf{A}) = \oint_{\partial V}\boldsymbol{\sigma}\cdot\mathrm{d}\mathbf{A} + \int_V\rho\mathbf{b}\,\mathrm{d}V
$$

对面积分使用高斯散度定理，并令控制体体积趋于零，得到微分形式的柯西动量方程 $\rho D\mathbf{u}/Dt=\nabla\cdot\boldsymbol{\sigma}+\rho\mathbf{b}$。这一步要求被积函数连续可微，等价于要求流场在网格尺度上光滑——这正是后面连续介质假设要单独讨论的原因。

代入牛顿本构 $\boldsymbol{\sigma}=-p\mathbf{I}+\mu(\nabla\mathbf{u}+(\nabla\mathbf{u})^{\mathrm{T}})$，并在不可压条件下令 $\nabla\cdot\mathbf{u}=0$，得到常见的不可压形式

$$
\frac{\partial\mathbf{u}}{\partial t} + (\mathbf{u}\cdot\nabla)\mathbf{u} = -\frac{1}{\rho}\nabla p + \nu\nabla^{2}\mathbf{u} + \mathbf{b}
$$

这里 $\nu=\mu/\rho$ 是运动黏度。不可压形式里压力没有独立的状态方程，只承担维持 $\nabla\cdot\mathbf{u}=0$ 的拉格朗日乘子角色，因此数值上必须用压力—速度耦合算法。

## 连续介质与湍流分辨率的两道下限

第一道下限来自分子尺度。空气在 20 ℃、1 atm 下平均自由程 $\lambda\approx6.8\times10^{-8}\ \mathrm{m}$，取特征尺度 $L=1\ \mathrm{m}$ 得 $Kn=\lambda/L=6.8\times10^{-8}$，连续介质假设毫无压力；但若通道直径缩到 1 μm，$Kn$ 升到 $6.8\times10^{-2}$，无滑移边界失效，Navier–Stokes 方程本身仍可写但边界条件要改。

第二道下限来自湍流的最小尺度

$$
\frac{\eta}{L} = Re^{-3/4}
$$

$\eta$ 是 Kolmogorov 尺度。取平板算例的 $Re=2.0\times10^6$、积分尺度 $L=1\ \mathrm{m}$，得 $\eta=1\times(2.0\times10^6)^{-0.75}=1.88\times10^{-5}\ \mathrm{m}$，即 18.8 μm。直接数值模拟要求网格间距与 $\eta$ 同量级，三维单元数按 $N\sim Re^{9/4}$ 估计，$Re=2.0\times10^6$ 时 $N\approx(2.0\times10^6)^{2.25}=1.5\times10^{14}$。这说明工程雷诺数下 DNS 不可行，也解释了为什么必须用 RANS 或 LES 引入额外闭合假设。

## 平板算例：δ、C_f 与阻力的手算

取平板长 $L=1\ \mathrm{m}$、宽 $W=0.5\ \mathrm{m}$、来流 $U=30\ \mathrm{m/s}$、空气取 $\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$ 与 $\rho=1.204\ \mathrm{kg/m^3}$。

雷诺数 $Re=UL/\nu=30\times1/1.5\times10^{-5}=2.0\times10^6$，湍流。$Re^{0.2}=18.20$。湍流边界层厚度按 $\delta=0.37L/Re^{0.2}$ 得 $\delta=0.37/18.20=0.0203\ \mathrm{m}=20.3\ \mathrm{mm}$；平均摩阻系数按 $C_f=0.074/Re^{0.2}$ 得 $C_f=0.074/18.20=4.07\times10^{-3}$。

壁面剪应力 $\tau_w=\frac{1}{2}\rho U^2C_f=0.5\times1.204\times30^2\times4.07\times10^{-3}=541.8\times4.07\times10^{-3}=2.20\ \mathrm{Pa}$。双面浸润面积 $A=2LW=2\times1\times0.5=1.0\ \mathrm{m^2}$，总摩擦阻力 $F=\tau_wA=2.20\ \mathrm{N}$。这个 2.2 N 的量级可以直接与风洞测力对比，是验证网格与湍流模型设置的一个低成本基准。

最后核对两道下限在本题是否成立：$Kn=6.8\times10^{-8}$，连续介质成立；$\delta/\eta=20.3\times10^{-3}/1.88\times10^{-5}=1080$，说明边界层内跨越三个量级，RANS 模型必须对近壁区做专门处理而不能一视同仁。

```python
import math
U, L, W, nu, rho = 30.0, 1.0, 0.5, 1.5e-5, 1.204
Re = U * L / nu
delta = 0.37 * L / Re**0.2
Cf = 0.074 / Re**0.2
tau_w = 0.5 * rho * U**2 * Cf
print(f"Re={Re:.3e}  delta={delta*1e3:.2f} mm  Cf={Cf:.4e}")
print(f"tau_w={tau_w:.3f} Pa  F={tau_w*2*L*W:.3f} N")
# Re=2.000e+06  delta=20.33 mm  Cf=4.0656e-03
# tau_w=2.203 Pa  F=2.203 N
eta = L * Re**-0.75
print(f"eta={eta*1e6:.2f} um  delta/eta={delta/eta:.0f}  N_DNS~{Re**2.25:.2e}")
# eta=18.81 um  delta/eta=1081  N_DNS~1.47e+14
```

## 本构闭合与 Stokes 假设

柯西方程有 3 个分量方程、6 个独立应力分量，缺口靠本构关系填补。牛顿本构引入两个物性系数：剪切黏度 $\mu$ 与体积黏度 $\lambda_b$。Stokes 假设取

$$
\lambda_b = -\frac{2}{3}\mu
$$

其依据是单原子气体只有平动自由度，能量耗散完全由剪切承担。对氮气、二氧化碳、水蒸气等多原子气体，内自由度弛豫会带来额外的体积耗散，$\lambda_b$ 与 $\mu$ 同量级，因此 Stokes 假设在激波内部结构、声波衰减、强膨胀流动中会低估耗散。判别方法很直接：不可压流动中 $\nabla\cdot\mathbf{u}=0$ 使 $\lambda_b$ 项整体消失，用不用 Stokes 假设结果完全相同；只有可压缩且存在显著体积变化的算例才需要复核这一项。

## 首层网格高度：从 y+ 反算到毫米

湍流边界层的第一层网格高度由目标 $y^+$ 反算

$$
y^+ = \frac{\rho u_\tau y}{\nu},\qquad u_\tau = U_\infty\sqrt{\frac{C_f}{2}}
$$

平板湍流摩阻系数用 Schlichting 关联式

$$
C_f = \frac{0.058}{Re^{0.2}}
$$

取板长 $L=1\ \mathrm{m}$、$U_\infty=20\ \mathrm{m/s}$、空气 $\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$，则 $Re=20\times1/1.5\times10^{-5}=1.333\times10^6$，$Re^{0.2}=16.79$，$C_f=0.058/16.79=3.455\times10^{-3}$。摩擦速度 $u_\tau=20\times\sqrt{3.455\times10^{-3}/2}=20\times0.04156=0.8313\ \mathrm{m/s}$。

由此：壁面函数法要求首层落在对数层，取 $y^+=30$ 得 $y=30\times1.5\times10^{-5}/0.8313=5.41\times10^{-4}\ \mathrm{m}$，即 0.54 mm；低雷诺数解法要求 $y^+\approx1$，得 $y=1.80\times10^{-5}\ \mathrm{m}$，即 18 μm，两者相差 30 倍。若介质换成水（$\nu=1.0\times10^{-6}\ \mathrm{m^2/s}$），同样的 $u_\tau$ 下 $y^+=30$ 对应 $3.61\times10^{-5}\ \mathrm{m}=36\ \mu m$。

自洽性检查：边界层厚度按 $\delta=0.37L/Re^{0.2}=0.37/16.79=0.0220\ \mathrm{m}=22.0\ \mathrm{mm}$，则 $Re_\tau=u_\tau\delta/\nu=0.8313\times0.0220/1.5\times10^{-5}=1.22\times10^3$，与 $Re=10^6$ 平板的经典值 $Re_\tau\approx1200$ 吻合，说明两个关联式取用一致。

## 无量纲化：五个相似参数各自的含义

以 $L$、$U$、$\rho U^2$ 为参考量无量纲化，动量方程里出现五个相似参数

$$
Re = \frac{UL}{\nu},\quad
Ma = \frac{U}{a},\quad
Fr = \frac{U}{\sqrt{gL}},\quad
Eu = \frac{\Delta p}{\rho U^2},\quad
St = \frac{fL}{U}
$$

分工是明确的：$Re$ 衡量惯性对黏性，决定层流/湍流与边界层厚度；$Ma$ 衡量可压缩性，$\frac{1}{2}Ma^2$ 给出密度变化量级；$Fr$ 衡量惯性对重力，决定浮力能否忽略；$Eu$ 衡量压力对惯性，是压力边界与压降换算的基准；$St$ 衡量非定常频率，$St\ll1$ 时可用准定常假设。五个参数并不独立，$Eu$ 与 $Fr$ 通过压力场耦合。常见错误是只报 $Re$ 而忽略 $Fr$：同一台设备在重力场与微重力下 $Re$ 相同，流动结构却完全不同。

## 配置片段与参数台账

```cpp
// system/fvSchemes
ddtSchemes      { default backward; }              // 二阶隐式；启动阶段可先用 Euler
gradSchemes     { default cellLimited Gauss linear 1; }
divSchemes
{
    default             none;
    div(phi,U)          Gauss linearUpwind grad(U);
    div(phi,k)          Gauss limitedLinear 1;
    div(phi,omega)      Gauss limitedLinear 1;
    div((nuEff*dev2(T(grad(U))))) Gauss linear;
}
laplacianSchemes { default Gauss linear corrected; }
interpolationSchemes { default linear; }
snGradSchemes   { default corrected; }             // 非正交角余弦 < 0.5 时改 limited 0.5
```

```cpp
// system/fvSolution（瞬态 PIMPLE）
solvers
{
    p    { solver PCG; preconditioner DIC;  tolerance 1e-8; relTol 0.05; }
    "U|k|omega" { solver PBiCGStab; preconditioner DILU; tolerance 1e-9; relTol 0.1; }
}
PIMPLE { nOuterCorrectors 3; nCorrectors 2; nNonOrthogonalCorrectors 1; }
```

| 参数 | 取值 | 依据 |
|---|---|---|
| 板长 / 来流 | 1 m / 20 m/s | 设计工况 |
| 雷诺数 | $1.333\times10^6$ | $U_\infty L/\nu$，空气 $\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$ |
| 摩阻系数 $C_f$ | $3.455\times10^{-3}$ | Schlichting $0.058Re^{-0.2}$ |
| 摩擦速度 $u_\tau$ | 0.8313 m/s | $U_\infty\sqrt{C_f/2}$ |
| 首层高度（壁面函数） | 0.54 mm | $y^+=30$ 反算 |
| 首层高度（低雷诺数） | 18 μm | $y^+=1$ 反算 |
| 时间步 | $5.0\times10^{-5}\ \mathrm{s}$（PISO）/ $2.5\times10^{-4}\ \mathrm{s}$（PIMPLE） | $Co=1$ / $Co=5$，$\Delta x=1\ \mathrm{mm}$ |

## 压力—速度耦合：SIMPLE、PISO 与 PIMPLE 的分工

不可压动量方程缺少压力自己的演化方程，压力只以梯度的形式出现，只能通过连续性方程间接求解

$$
\frac{\partial\mathbf{u}}{\partial t} + \nabla\cdot(\mathbf{u}\mathbf{u}) - \nabla\cdot(\nu\nabla\mathbf{u}) = -\frac{1}{\rho}\nabla p
$$

网格同位布置时压力与速度存在棋盘格解耦，必须用 Rhie–Chow 型面通量插值，OpenFOAM 通过 `phi` 的构造隐式完成。算法层面的分工是：SIMPLE 用一次压力修正加欠松弛逼近定常解，适合稳态；PISO 用两次以上压力修正保证时间精度，适合瞬态且库朗数较小；PIMPLE 是两者的混合，用外层迭代把每一时间步推进到准定常，从而允许远大于 1 的库朗数。选择标准：定常结果用 SIMPLE；解析非定常涡结构用 PISO 并把 $Co$ 压到 0.5 以内；要大时间步又保留非定常信息用 PIMPLE，外层迭代 3 次起步。

## 对流项格式与限制器

对流项离散决定数值耗散的大小，也决定有界性。一阶迎风（`upwind`）无条件有界但把涡结构抹平；中心格式（`linear`）精度高但在 $Pe_\Delta>2$ 时产生非物理振荡；`linearUpwind` 用梯度外插到面，是二阶且耗散适中的常规选择；`limitedLinear` 与 `vanLeer` 带限制器，在有界性和精度之间取折中，适合自由面、激波与强标量梯度。

梯度格式决定扩散项与高阶对流项的面法向梯度。畸变网格上用 `leastSquares` 比 `Gauss linear` 稳健，代价是机时增加约 20%～30%；用 `cellLimited Gauss linear 1` 可以把单元梯度限制在相邻单元值的凸包内，抑制过冲。拉普拉斯项在非正交网格上必须带 `corrected` 或 `limited 0.5` 的非正交修正，否则光滑解上会留下与网格歪斜成正比的系统偏差。

## 库朗数、时间步与内迭代次数

库朗数定义为单元内流体在一个时间步内穿过的单元数比例

$$
Co = \frac{|\mathbf{u}|\Delta t}{\Delta x}
$$

PISO 要求 $Co\le1$（工程上取 0.5 以内），PIMPLE 在外迭代 3 次时可放宽到 5～10；隐式格式对 $Co$ 无硬上限，但时间精度随之下降。取平板近前缘最小流向网格 $\Delta x=1\ \mathrm{mm}$、来流 $U=20\ \mathrm{m/s}$，$Co=1$ 对应 $\Delta t\le1\times10^{-3}/20=5.0\times10^{-5}\ \mathrm{s}$；若用 PIMPLE 允许 $Co=5$，$\Delta t$ 可以放大到 $2.5\times10^{-4}\ \mathrm{s}$，机时省 5 倍。库朗数应按最大速度算，绕流中缝隙与尖角处的局部速度可达来流的 2～3 倍。

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 算例在 $Ma=0.6$ 下用不可压求解器，压比完全错误 | 密度变化 $\frac{1}{2}Ma^2=18\%$，不可压假设失效 | 用 $\frac{1}{2}Ma^2$ 估算密度变化，超 5% 换可压缩形式 |
| 微通道算例阻力偏高、流量偏低 | 特征尺度进入滑移区，无滑移边界不成立 | 算 $Kn=\lambda/L$，超过 0.01 时改用 Maxwell 滑移边界 |
| 平板阻力比 $C_f$ 关联式高 40% | 边界层内网格未解析到对数层，壁面剪应力被高估 | 输出首层 $y^+$，确认落在 30～300 或小于 1 |
| 声波衰减计算值远小于实测 | 使用 Stokes 假设，忽略多原子气体体积黏性 | 对比 $\lambda_b=0$ 与 $\lambda_b=-2\mu/3$ 两组衰减系数 |
| 低 $Re$ 算例中出现非物理惯性振荡 | 惯性项未按 $Re\ll1$ 量级处理，网格分辨率超出需要 | 算 $Re$ 并与 1 比较，$Re<1$ 时可用 Stokes 近似并放大时间步 |
| 自由表面算例在 $Fr$ 接近 1 时结果失真 | 重力项被忽略或时间步未限制到表面波尺度 | 算 $Fr=U/\sqrt{gL}$，接近 1 时必须保留重力并限制 $\Delta t$ |
| 压力场出现棋盘格振荡 | 同位网格未使用 Rhie–Chow 型面通量插值 | 把面通量换成紧致插值重算，振荡应消失 |
| 残差收敛但阻力系数随网格加密持续下降 | 一阶迎风数值耗散随网格细化减小，尚未进入渐近区 | 换成 `linearUpwind` 复算，若阻力立即抬升即为格式耗散 |
| 高 $Co$ 下解出现非物理过冲 | 限制器缺失，对流格式在有界性上失守 | 把 `limitedLinear 1` 的系数降到 0.5，看过冲是否被压住 |
| 壁面热流或剪应力比实验低 30% 以上 | 首层 $y^+$ 落在 5～30 的缓冲层，壁面函数与低雷诺数解法都不适用 | 输出首层单元中心的 $y^+$ 分布，确认全部落在 30～300 或全部小于 1 |
| 非正交网格上压力场出现与歪斜同相位的偏差 | 拉普拉斯项未做非正交修正 | 把 `corrected` 改为 `limited 0.5` 并增加一次非正交修正迭代 |

## 参考资料

1. Pope S.B., *Turbulent Flows*, Cambridge University Press, 2000.
2. Tennekes H., Lumley J.L., *A First Course in Turbulence*, MIT Press, 1972.
3. Chorin A.J., Marsden J.E., *A Mathematical Introduction to Fluid Mechanics*, 3rd ed., Springer, 1993.
4. Davidson P.A., *Turbulence: An Introduction for Scientists and Engineers*, 2nd ed., Oxford University Press, 2015.
5. Rhie C.M., Chow W.L., "Numerical study of the turbulent flow past an airfoil with trailing edge separation", *AIAA Journal*, 21(11):1525–1532, 1983.
6. Schlichting H., *Boundary-Layer Theory*, 7th ed., McGraw-Hill, 1979.
7. Weller H.G., Tabor G., Jasak H., Fureby C., "A tensorial approach to computational continuum mechanics using object-oriented techniques", *Computers in Physics*, 12(6):620–631, 1998.
8. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
