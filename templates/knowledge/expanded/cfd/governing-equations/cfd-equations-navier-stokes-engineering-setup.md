---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-navier-stokes-engineering-setup
title: "Navier–Stokes 方程：工程设置与参数选择"
summary: "把不可压 Navier–Stokes 的落地设置拆成四件事：压力—速度耦合算法的分工、对流格式与限制器、库朗数决定的时间步、以及由 y+ 反算的首层网格高度。含平板算例与完整 fvSchemes 配置。"
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
  - "Navier–Stokes 方程"
  - "工程设置与参数选择"
  - "fvSchemes"
  - "库朗数"
seo:
  title: "Navier–Stokes 方程：工程设置与参数选择"
  description: "把不可压 Navier–Stokes 的落地设置拆成四件事：压力—速度耦合算法的分工、对流格式与限制器、库朗数决定的时间步、以及由 y+ 反算的首层网格高度。含平板算例与完整 fvSchemes 配置。"
  keywords:
    - "Navier–Stokes 方程"
    - "工程设置与参数选择"
    - "fvSchemes"
    - "库朗数"
---

# Navier–Stokes 方程：工程设置与参数选择

不可压 Navier–Stokes 方程落地时，真正需要用户决定的只有四类参数：用哪个压力—速度耦合算法、对流项用什么格式、时间步取多大、近壁首层网格多高。这四项里只有最后一项直接由目标 y+ 决定，其余三项都是精度与稳定性的折中。下面把四项拆开，用一块 1 m 长平板在 20 m/s 空气流中的算例把 y+、库朗数与首层高度换算成具体毫米和微秒，并给出可直接粘贴的 `fvSchemes`。

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

## 失败模式：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场出现棋盘格振荡 | 同位网格未使用 Rhie–Chow 型面通量插值 | 把面通量换成紧致插值重算，振荡应消失 |
| 残差收敛但阻力系数随网格加密持续下降 | 一阶迎风数值耗散随网格细化减小，尚未进入渐近区 | 换成 `linearUpwind` 复算，若阻力立即抬升即为格式耗散 |
| 高 $Co$ 下解出现非物理过冲 | 限制器缺失，对流格式在有界性上失守 | 把 `limitedLinear 1` 的系数降到 0.5，看过冲是否被压住 |
| 壁面热流或剪应力比实验低 30% 以上 | 首层 $y^+$ 落在 5～30 的缓冲层，壁面函数与低雷诺数解法都不适用 | 输出首层单元中心的 $y^+$ 分布，确认全部落在 30～300 或全部小于 1 |
| 非正交网格上压力场出现与歪斜同相位的偏差 | 拉普拉斯项未做非正交修正 | 把 `corrected` 改为 `limited 0.5` 并增加一次非正交修正迭代 |

## 参考文献

1. Rhie C.M., Chow W.L., "Numerical study of the turbulent flow past an airfoil with trailing edge separation", *AIAA Journal*, 21(11):1525–1532, 1983.
2. Schlichting H., *Boundary-Layer Theory*, 7th ed., McGraw-Hill, 1979.
3. Weller H.G., Tabor G., Jasak H., Fureby C., "A tensorial approach to computational continuum mechanics using object-oriented techniques", *Computers in Physics*, 12(6):620–631, 1998.
4. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
