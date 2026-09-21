---
template_version: "flowlab-knowledge/1.0"
slug: cfd-thermal-conjugate-heat-transfer-modeling
title: "共轭传热：物理建模与适用边界"
summary: "共轭传热的建模难点在界面而非求解器。本文给出温度与热流连续条件的数值含义、用 Bi 数在薄壁与显式固体域之间切换的判据、固体热惯性与流体对流时间的比值、界面导热系数的调和平均插值，以及铝—水界面的完整量级估算。"
category:
  slug: heat-transfer
  name: "传热与可压缩流"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "传热与可压缩流"
  - "共轭传热"
  - "物理建模与适用边界"
  - "界面热流"
  - "毕渥数"
seo:
  title: "共轭传热：物理建模与适用边界"
  description: "共轭传热的建模难点在界面而非求解器。本文给出温度与热流连续条件的数值含义、用 Bi 数在薄壁与显式固体域之间切换的判据、固体热惯性与流体对流时间的比值、界面导热系数的调和平均插值，以及铝—水界面的完整量级估算。"
  keywords:
    - "共轭传热"
    - "物理建模与适用边界"
    - "界面热流"
    - "毕渥数"
    - "固体热惯性"
---

# 共轭传热：物理建模与适用边界

共轭传热的建模难点不在求解器，而在界面：流体与固体在同一个面上交换热流，任何一侧的离散方式都会改变另一侧看到的边界条件。本文给出界面两条守恒条件的数值含义、薄壁与显式固体域的分界判据、固体热惯性与流体对流时间的比值，以及一次铝—水界面的量级估算。

## 界面上的两条条件及其数值含义

流体侧与固体侧由两条条件耦合：

$$
T_f=T_s,\qquad -k_f\frac{\partial T_f}{\partial n}=-k_s\frac{\partial T_s}{\partial n}
$$

第一条是温度连续，第二条是法向热流连续。在有限体积里，这两条意味着界面上的热流必须由两侧分别算出并相等。若两侧网格共形，通量天然守恒；若网格不共形，界面通量由插值给出，此时"连续"退化为"插值后守恒"，必须显式检查两侧热流积分的差值，而不能假设它成立。

界面上还有一个常被忽略的自由度：界面可以带阻。涂层、氧化层、装配间隙都会在界面上产生温度跳跃

$$
T_{s,1}-T_{s,2}=q''R''_{tc}
$$

$R''_{tc}$ 的单位是 $\mathrm{m^2\cdot K/W}$。一旦把它写进模型，温度连续条件就变成带阻的跳跃条件，两侧不再共享同一个节点温度。

## 用 Bi 数决定薄壁还是显式固体域

$$
Bi=\frac{hL_s}{k_s}
$$

$L_s$ 为固体特征厚度。$Bi<0.1$ 表示固体内部温降小于表面温差的 10%，可用薄壁或集中参数；$0.1<Bi<10$ 必须显式建固体域；$Bi>10$ 时内部导热是瓶颈，表面换热系数的不确定性反而次要。同一块 5 mm 厚的板，水侧 $h=3000\ \mathrm{W/(m^2\cdot K)}$：

- 铝，$k_s=205\ \mathrm{W/(m\cdot K)}$：$Bi=3000\times0.005/205=0.073<0.1$，薄壁可用；
- 钢，$k_s=15\ \mathrm{W/(m\cdot K)}$：$Bi=3000\times0.005/15=1.0$，必须显式建固体域。

材料换一次，模型层级就换一级，这是共轭传热开题时最该先做的一次除法。

## 固体热惯性与流体对流时间的比值

瞬态共轭传热能否只跑流体时间步，取决于两个时间尺度的比值：

$$
\tau_s=\frac{\rho_s c_{p,s}L_s^2}{k_s},\qquad \tau_f=\frac{L_f}{U}
$$

对上述铝板，$\rho_s=2700\ \mathrm{kg/m^3}$、$c_{p,s}=900\ \mathrm{J/(kg\cdot K)}$：

$$
\tau_s=\frac{2700\times900\times0.005^2}{205}=0.296\ \mathrm{s}
$$

若流体域长度 $L_f=0.05\ \mathrm{m}$、$U=1.0\ \mathrm{m/s}$，则 $\tau_f=0.05\ \mathrm{s}$，比值 $\tau_s/\tau_f=5.9$。这意味着固体温度响应比流体慢近 6 倍，物理时间至少要覆盖 $3\tau_s\approx0.89\ \mathrm{s}$ 才能看到固体接近稳态；只跑几个流体穿越时间就宣布收敛，固体其实还没热起来。

## 界面导热系数的插值方式

界面上的有效导热系数不能用算术平均。对非均匀网格，正确写法是距离加权的调和平均：

$$
k_{face}=\frac{\Delta_P+\Delta_N}{\Delta_P/k_P+\Delta_N/k_N}
$$

取 $\Delta_P=\Delta_N$、$k_P=205$（铝）、$k_N=0.60$（水），得 $k_{face}=2/(1/205+1/0.60)=1.196\ \mathrm{W/(m\cdot K)}$。算术平均给出 $(205+0.60)/2=102.8\ \mathrm{W/(m\cdot K)}$，高估 86 倍。导热系数比超过 10 的界面必须用调和平均，否则界面热流会被彻底算错。

## 耦合算法与工具设置

松耦合（交替求解流体与固体，交换界面温度与热流）在 $\tau_s/\tau_f<10$、界面非线性弱时足够；强非线性、强源项或界面热阻随温度变化时应改用整体求解或界面 Newton 迭代。OpenFOAM 的 `chtMultiRegionFoam` 采用分区交替推进，需要为每个区域单独给物性字典：

```
// constant/regionProperties
regions
(
    fluid   (fluidDomain)
    solid   (solidDomain)
);

// constant/solidDomain/physicalProperties
thermoType
{
    type            heSolidThermo;
    mixture         pureMixture;
    transport       constIso;
    thermo          hConst;
    equationOfState rhoConst;
    specie          specie;
    energy          sensibleEnthalpy;
}
mixture
{
    specie        { molWeight 26.98; }
    transport     { kappa 205; }      // W/(m*K)，铝合金
    thermodynamics{ Cp 900; Hf 0; }   // J/(kg*K)
    density       { rho 2700; }       // kg/m^3
}
```

对应的命令行是 `chtMultiRegionFoam -parallel`，界面热流用 `wallHeatFlux` 函数对象在两侧各取一次。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 薄壁两侧温差是手算值的 2 倍 | 几何厚度与薄壁参数重复计入，厚度被算了两遍 | 检查几何厚度是否已置零或改用显式固体域 |
| 界面出现不连续的温度台阶却无接触热阻 | 两侧网格尺度相差过大，插值面偏移 | 加密固体首层至与流体同量级后重算 |
| 导热系数比 300 的界面上热流偏差 5 倍 | 界面用了算术平均导热系数 | 改调和平均，比较两侧热流积分 |
| 瞬态结温长时间不动 | 物理时间未覆盖 $\tau_s$，只跑了流体穿越时间 | 估算 $\tau_s$ 并检查是否跑满 $3\tau_s$ |
| 松耦合迭代在界面附近振荡 | 界面强非线性，交替推进不稳定 | 加界面欠松弛或改整体求解 |

## 参考文献

1. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson Education, 2007.
2. Bergman T.L., Lavine A.S., Incropera F.P., DeWitt D.P., *Fundamentals of Heat and Mass Transfer*, 8th ed., Wiley, 2018.
3. Mills A.F., *Heat Transfer*, 2nd ed., Prentice Hall, 1999.
4. Lienhard J.H., Lienhard J.H. V, *A Heat Transfer Textbook*, 5th ed., Phlogiston Press, 2020.
5. Çengel Y.A., Ghajar A.J., *Heat and Mass Transfer: Fundamentals and Applications*, 5th ed., McGraw-Hill, 2015.
6. Rohsenow W.M., Hartnett J.P., Cho Y.I., *Handbook of Heat Transfer*, 3rd ed., McGraw-Hill, 1998.
