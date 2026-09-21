---
template_version: "flowlab-knowledge/1.0"
slug: cfd-boundary-coupled-interface-modeling
title: "共轭与耦合界面：物理建模与适用边界"
summary: "从界面通量与温度双条件出发，用热渗透系数估算界面温度、用 Biot 数判断固体内部是否可简化，并给出三种耦合方式的代价与 OpenFOAM 共轭界面配置。"
category:
  slug: boundary-conditions
  name: "边界条件与初始化"
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "边界条件与初始化"
  - "共轭与耦合界面"
  - "物理建模与适用边界"
  - "热渗透系数"
  - "Biot 数"
seo:
  title: "共轭与耦合界面：物理建模与适用边界"
  description: "从界面通量与温度双条件出发，用热渗透系数估算界面温度、用 Biot 数判断固体内部是否可简化，并给出三种耦合方式的代价与 OpenFOAM 共轭界面配置。"
  keywords:
    - "共轭与耦合界面"
    - "物理建模与适用边界"
    - "热渗透系数"
    - "Biot 数"
    - "界面热阻"
---

# 共轭与耦合界面：物理建模与适用边界

共轭传热的界面不是"一个边界条件"，而是两个耦合约束：温度连续和法向热流连续。把它们拆成"流体侧给温度、固体侧给热流"这类单向处理，在固体导热系数高、壁厚大或瞬态冲击时会产生数倍的界面温度误差。判断能否简化的关键量是 Biot 数，判断界面温度落在哪里的关键量是热渗透系数。本文给出这两个量的算式与一次可核对的估算，并对比三种耦合方式的代价。

## 界面上只有两个条件

无相变、无接触热阻的理想界面满足

$$
T_s\big|_{\Gamma} = T_f\big|_{\Gamma}, \qquad
-k_s \left.\frac{\partial T}{\partial n}\right|_{\Gamma,s} = -k_f \left.\frac{\partial T}{\partial n}\right|_{\Gamma,f}
$$

耦合性在于：界面温度 $T_\Gamma$ 由两侧的导热能力共同决定，若把它当作已知量输入，就等价于切断了耦合。当固体侧热阻远小于流体侧对流热阻时，单向处理误差在 $5\%$ 以内。

## 热渗透系数决定界面温度

两个半无限大物体突然接触时，界面温度由两侧的热渗透系数加权给出。热渗透系数定义为

$$
e = \sqrt{k \rho c_p}
$$

其量纲为 $\mathrm{J/(m^2 \cdot K \cdot s^{1/2})}$。界面温度为

$$
T_i = \frac{T_1 e_1 + T_2 e_2}{e_1 + e_2}
$$

一次可核对的手算：铝的 $k = 237\ \mathrm{W/(m\cdot K)}$、$\rho = 2700\ \mathrm{kg/m^3}$、$c_p = 900\ \mathrm{J/(kg\cdot K)}$，则

$$
e_{Al} = \sqrt{237 \times 2700 \times 900} = \sqrt{5.759\times 10^{8}} = 2.40\times 10^{4}
$$

水的 $k = 0.60\ \mathrm{W/(m\cdot K)}$、$\rho = 998\ \mathrm{kg/m^3}$、$c_p = 4182\ \mathrm{J/(kg\cdot K)}$：

$$
e_{w} = \sqrt{0.60 \times 998 \times 4182} = \sqrt{2.506\times 10^{6}} = 1.58\times 10^{3}
$$

铝在 $100\ ^\circ\mathrm{C}$、水在 $20\ ^\circ\mathrm{C}$ 时接触：

$$
T_i = \frac{100 \times 2.40\times 10^{4} + 20 \times 1.58\times 10^{3}}{2.40\times 10^{4} + 1.58\times 10^{3}}
= \frac{2.4316\times 10^{6}}{2.558\times 10^{4}} = 95.1\ ^\circ\mathrm{C}
$$

换成铜（$k = 401\ \mathrm{W/(m\cdot K)}$、$\rho = 8960\ \mathrm{kg/m^3}$、$c_p = 385\ \mathrm{J/(kg\cdot K)}$），$e_{Cu} = \sqrt{401 \times 8960 \times 385} = 3.72\times 10^{4}$，则

$$
T_i = \frac{100 \times 3.72\times 10^{4} + 20 \times 1.58\times 10^{3}}{3.72\times 10^{4} + 1.58\times 10^{3}} = 96.7\ ^\circ\mathrm{C}
$$

铜的界面温度比铝高 $1.6\ \mathrm{K}$，界面温度几乎完全由固体侧决定（$e_{Cu}/e_w \approx 24$）。反过来，隔热材料（$k = 0.05\ \mathrm{W/(m\cdot K)}$、$\rho = 50\ \mathrm{kg/m^3}$、$c_p = 1200\ \mathrm{J/(kg\cdot K)}$，$e = 55$）的界面温度会掉到 $22.5\ ^\circ\mathrm{C}$ 附近，此时把固体内部当作等温体是严重错误。

## 什么时候固体内部可以简化

固体内部温度梯度可否忽略，由 Biot 数判定：

$$
Bi = \frac{h L_c}{k_s}
$$

其中 $L_c$ 为特征长度，平板取半厚，圆柱取半径的一半，球取半径的三分之一。以对流系数 $h = 5000\ \mathrm{W/(m^2\cdot K)}$、铝 $k_s = 237\ \mathrm{W/(m\cdot K)}$ 为例：

- 板厚 $5\ \mathrm{mm}$，$L_c = 2.5\ \mathrm{mm}$，$Bi = 5000 \times 0.0025/237 = 0.053 < 0.1$，可用集总参数；
- 板厚 $20\ \mathrm{mm}$，$L_c = 10\ \mathrm{mm}$，$Bi = 5000 \times 0.01/237 = 0.211 > 0.1$，必须求解固体内部导热。

$Bi$ 跨越 0.1 的物理含义是：固体内部导热热阻与表面对流热阻可比，温度不再均匀。同一块铝板在气冷（$h = 50\ \mathrm{W/(m^2\cdot K)}$）下 $Bi = 0.002$，在液冷下 $Bi = 0.21$，可见集总假设是否成立取决于冷却方式。

## 三种耦合方式的代价

| 方式 | 界面处理 | 适用条件 | 代价 |
| --- | --- | --- | --- |
| 单向（给定壁温） | 流体侧固定 $T_w$ | $Bi < 0.05$ 且固体热容远大于流体 | 无法捕捉瞬态热冲击 |
| 单向（给定热流） | 流体侧固定 $q''$ | 热流已知且固体为等温体 | 壁温未知，可能算出非物理值 |
| 双向共轭 | 交替求解两侧，界面通量/温度互换 | $Bi > 0.1$ 或瞬态 | 每次外迭代都要重解两侧，收敛慢 |

## 界面热阻网络的一次手算

把界面到流体的传热串成热阻网络，可直接估算总温差。对流传热热阻与导热热阻分别为 $1/h$ 与 $t/k$：

$$
R''_{tot} = \frac{1}{h} + \frac{t}{k}
$$

取 $h = 5000\ \mathrm{W/(m^2\cdot K)}$、铝板厚 $t = 5\ \mathrm{mm}$：

$$
R''_{tot} = \frac{1}{5000} + \frac{0.005}{237} = 2.00\times 10^{-4} + 2.11\times 10^{-5} = 2.21\times 10^{-4}\ \mathrm{m^2\cdot K/W}
$$

若界面热流 $q'' = 100\ \mathrm{kW/m^2}$，则流体与固体外侧的温差

$$
\Delta T = q'' R''_{tot} = 1.0\times 10^{5} \times 2.21\times 10^{-4} = 22.1\ \mathrm{K}
$$

其中只有 $2.11\ \mathrm{K}$ 落在固体内部，$20.0\ \mathrm{K}$ 落在对流边界层内。这个分解说明为什么薄壁铝件可以用给定壁温近似：固体侧只占温差的一成。

## OpenFOAM 共轭界面配置

```text
// 流体侧 0/T 的界面 patch
interface
{
    type            compressible::turbulentTemperatureCoupledBaffleMixed;
    Tnbr            T;                 // 固体侧的场名
    kappaMethod     fluidThermo;
    kappa           fluidThermo;
    thicknessLayers ();
    kappaLayers     ();
    value           uniform 293.15;
}

// 固体侧 0/T 的界面 patch（region solid）
interface
{
    type            compressible::turbulentTemperatureCoupledBaffleMixed;
    Tnbr            T;
    kappaMethod     solidThermo;
    kappa           solidThermo;
    value           uniform 293.15;
}
```

两侧必须成对声明且 `Tnbr` 指向对方场名。运行 `chtMultiRegionFoam` 后分别对 `-region fluid` 与 `-region solid` 执行 `wallHeatFlux`，两者应严格相等、方向相反。

## 失败模式对照

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 界面两侧热流差 $20\%$ 以上 | 两侧 patch 未配对，退化为独立边界 | 两侧 `wallHeatFlux` 输出比对，必须数值相等、方向相反 |
| 界面温度随时间剧烈振荡 | 热阻比过大，交替迭代未加松弛 | 输出界面温度时程，若振幅 > 5 K 需降松弛因子 |
| 固体温度场呈棋盘状振荡 | 固体侧网格与流体侧量级不匹配 | 检查两侧界面首层网格厚度比，应 $< 5$ |
| 薄铝板被算出 300 K 温差 | 误用了固定热流且热流值超过物理上限 | 用 $R''_{tot}$ 反算可达热流，与给定值比较 |
| 瞬态算例界面温度阶跃 | 固体热容被忽略或密度给错 | 检查固体 `thermophysicalProperties` 的 $\rho c_p$ |
| 稳态解界面温度比解析值低 20 K | 把界面温度当已知量单向输入 | 改为双向共轭重算，比较界面温度 |

## 参考文献

1. Incropera F.P., DeWitt D.P., Bergman T.L., Lavine A.S., *Fundamentals of Heat and Mass Transfer*, 7th ed., Wiley, 2011.
2. Carslaw H.S., Jaeger J.C., *Conduction of Heat in Solids*, 2nd ed., Oxford University Press, 1959.
3. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
4. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, chtMultiRegionFoam and coupled temperature boundaries, v2312, 2023.
