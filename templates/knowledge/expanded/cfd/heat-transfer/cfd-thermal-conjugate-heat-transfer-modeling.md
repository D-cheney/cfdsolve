---
template_version: flowlab-knowledge/1.0
slug: cfd-thermal-conjugate-heat-transfer-modeling
title: 共轭传热：原理与诊断验证
summary: >-
  共轭传热的建模难点在界面而非求解器。本文给出温度与热流连续条件的数值含义、用 Bi
  数在薄壁与显式固体域之间切换的判据、固体热惯性与流体对流时间的比值、界面导热系数的调和平均插值，以及铝—水界面的完整量级估算。
category:
  slug: heat-transfer
  name: 传热与可压缩流
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 传热与可压缩流
  - 共轭传热
  - 物理建模与适用边界
  - 界面热流
  - 毕渥数
  - 结果诊断与可信度验证
  - 界面热流守恒
  - 接触热阻
seo:
  title: 共轭传热：原理与诊断验证
  description: >-
    共轭传热的建模难点在界面而非求解器。本文给出温度与热流连续条件的数值含义、用 Bi
    数在薄壁与显式固体域之间切换的判据、固体热惯性与流体对流时间的比值、界面导热系数的调和平均插值，以及铝—水界面的完整量级估算。
  keywords:
    - 共轭传热
    - 物理建模与适用边界
    - 界面热流
    - 毕渥数
    - 固体热惯性
    - 结果诊断与可信度验证
    - 界面热流守恒
    - 接触热阻
    - 热阻网络
---
# 共轭传热：原理与诊断验证

共轭传热的建模难点不在求解器，而在界面：流体与固体在同一个面上交换热流，任何一侧的离散方式都会改变另一侧看到的边界条件。共轭传热结果的第一个可信度证据不在温度云图里，而在界面上：两侧分别积分出的热流若不相等，整个解就是不可信的。

## 界面热流守恒是第一条证据

把界面上的热流分别从流体侧和固体侧积分，定义相对不平衡量

$$
\varepsilon_{flux}=\frac{\left|\displaystyle\int_{A_f}q''_f\,dA-\int_{A_s}q''_s\,dA\right|}{\tfrac{1}{2}\left(\displaystyle\int_{A_f}|q''_f|\,dA+\int_{A_s}|q''_s|\,dA\right)}
$$

共形网格上 $\varepsilon_{flux}$ 应低于 $10^{-6}$；非共形接口靠插值传递，工程上要求 $\varepsilon_{flux}<10^{-2}$。若界面存在接触热阻或薄壁，两侧热流本身不相等是物理的，此时应比较"固体侧入流"与"固体侧出流"的差值，并把热阻层作为独立环节放入网络，而不是把不平衡量当误差。

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

## 工具设置与后处理

```cpp
// system/fluid/functions  —— 流体侧界面热流
functions
{
    interfaceFluxFluid
    {
        type            wallHeatFlux;
        libs            ("libfieldFunctionObjects.so");
        patches         (fluid_to_solid);
        executeControl  writeTime;
    }
}

```bash
# 提取界面两侧热流并按面法向积分，比较不平衡量
postProcess -func "wallHeatFlux" -region fluid -time 1500
postProcess -func "wallHeatFlux" -region solid -time 1500
postProcess -func "fieldMinMax(T)" -region solid -time 1500
```

```python
q_solid, q_fluid = 8.42, 8.51          # W/m^2，两侧积分均值
eps = abs(q_solid - q_fluid) / (0.5 * (abs(q_solid) + abs(q_fluid)))
print("eps_flux =", eps)               # 1.05e-2
R_tc = 0.85 / 8500.0                   # 1.0e-4 m^2*K/W
t_gap = 4.0e-4 * 0.026                 # 1.04e-5 m
print(R_tc, t_gap)
```

## 诊断表：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 非共形界面 $\varepsilon_{flux}=1.05\times10^{-2}$ | 插值未守恒，或面法向投影点落在对侧单元外 | 加密两侧面网格一倍，看 $\varepsilon_{flux}$ 是否按阶收敛 |
| 结温比热阻网络低 30 K | 接触热阻未施加或被薄壁参数覆盖 | 用 $R''_{tc}=q''^{-1}\Delta T$ 反算并与手册区间对照 |
| 固体背面温度对固体网格数不敏感 | 界面通量由流体侧单边决定，固体只被动接收 | 检查固体是否真的参与了耦合，而非只输出温度场 |
| 界面附近温度沿面呈锯齿状 | 两侧网格尺度差超过 5 倍，插值跨度太大 | 加密固体首层至与流体同量级后重算 |
| 瞬态结果在 $t<0.1\ \mathrm{s}$ 就达到稳态 | 物理时间步过大，跳过了固体热响应 | 用 $\tau_s$ 估算所需物理时间并检查时间步 |

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 薄壁两侧温差是手算值的 2 倍 | 几何厚度与薄壁参数重复计入，厚度被算了两遍 | 检查几何厚度是否已置零或改用显式固体域 |
| 界面出现不连续的温度台阶却无接触热阻 | 两侧网格尺度相差过大，插值面偏移 | 加密固体首层至与流体同量级后重算 |
| 导热系数比 300 的界面上热流偏差 5 倍 | 界面用了算术平均导热系数 | 改调和平均，比较两侧热流积分 |
| 瞬态结温长时间不动 | 物理时间未覆盖 $\tau_s$，只跑了流体穿越时间 | 估算 $\tau_s$ 并检查是否跑满 $3\tau_s$ |
| 松耦合迭代在界面附近振荡 | 界面强非线性，交替推进不稳定 | 加界面欠松弛或改整体求解 |

## 与热阻网络和解析解对照

对一维串联结构，总温差应满足

$$
\Delta T=\dot Q\,R_{tot},\qquad R_{tot}=\sum_i\frac{t_i}{k_iA}+\sum_j\frac{R''_{tc,j}}{A}+\frac{1}{hA}
$$

把 CFD 得到的固体背面温度与热阻网络对照，是最省算力的独立校验。以 $\dot Q=5\ \mathrm{W}$、$A=0.001\ \mathrm{m^2}$、$h=50\ \mathrm{W/(m^2\cdot K)}$、TIM 厚 $100\ \mu\mathrm{m}$、$k_{TIM}=3\ \mathrm{W/(m\cdot K)}$、两处 $R''_{tc}=1\times10^{-4}\ \mathrm{m^2\cdot K/W}$ 为例：$R_{conv}=1/(50\times0.001)=20\ \mathrm{K/W}$，$R_{TIM}=1\times10^{-4}/(3\times0.001)=0.0333\ \mathrm{K/W}$，$R_{tc}=2\times10^{-4}/0.001=0.20\ \mathrm{K/W}$，合计 $R_{tot}=20.23\ \mathrm{K/W}$，$\Delta T=101.2\ \mathrm{K}$。CFD 若给出温差 70 K，几乎可以断定接触热阻被漏掉了。

## 非共形接口的插值误差如何暴露

非共形接口的误差有三个可观测特征：两侧热流积分差随网格细化不单调；界面附近出现网格尺度量级的温度锯齿；把两侧网格同时加密一个量级后界面通量仍在漂移。诊断方法是保持物理模型不变，只把界面两侧的面网格加密一倍再重算，看 $\varepsilon_{flux}$ 是否按一阶或二阶收敛。若不收敛，问题在插值方向而不是精度，应检查面法向定义与投影点是否落在对侧单元内。

## 由界面温差反算接触热阻

实测到界面两侧温差后，接触热阻可直接反算：

$$
R''_{tc}=\frac{T_{s,1}-T_{s,2}}{q''}
$$

若测得 $q''=8500\ \mathrm{W/m^2}$、$T_{s,1}-T_{s,2}=0.85\ \mathrm{K}$，则

$$
R''_{tc}=\frac{0.85}{8500}=1.0\times10^{-4}\ \mathrm{m^2\cdot K/W}
$$

这与金属—金属干接触的典型区间 $10^{-4}\sim10^{-3}\ \mathrm{m^2\cdot K/W}$ 一致，说明界面建模合理。若同一工况下温差变成 $3.4\ \mathrm{K}$，则 $R''_{tc}=4.0\times10^{-4}\ \mathrm{m^2\cdot K/W}$。把它折算成等效静止气隙厚度：空气 $k=0.026\ \mathrm{W/(m\cdot K)}$，

$$
t_{gap}=R''_{tc}\,k=4.0\times10^{-4}\times0.026=1.04\times10^{-5}\ \mathrm{m}=10.4\ \mu\mathrm{m}
$$

一个 10 μm 的装配间隙就足以让结温上升约 3 K。这个折算比单看热阻数值更能说明装配公差为什么重要。

## 交付前需要留存的量

至少并列：界面两侧热流的积分值与 $\varepsilon_{flux}$；$R''_{tc}$ 的取值来源或反算值；薄壁厚度是否与几何重复；$R_{tot}$ 的各段占比；固体背面温度与热阻网络的差值；以及网格加密时 $\varepsilon_{flux}$ 的收敛记录。有了这几项，读者可以直接判断误差来自界面模型还是来自离散。若某一段热阻占总热阻 80% 以上，优化应集中在该段，而不是继续加密网格。

## 参考资料

1. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson Education, 2007.
2. Bergman T.L., Lavine A.S., Incropera F.P., DeWitt D.P., *Fundamentals of Heat and Mass Transfer*, 8th ed., Wiley, 2018.
3. Mills A.F., *Heat Transfer*, 2nd ed., Prentice Hall, 1999.
4. Lienhard J.H., Lienhard J.H. V, *A Heat Transfer Textbook*, 5th ed., Phlogiston Press, 2020.
5. Çengel Y.A., Ghajar A.J., *Heat and Mass Transfer: Fundamentals and Applications*, 5th ed., McGraw-Hill, 2015.
6. Rohsenow W.M., Hartnett J.P., Cho Y.I., *Handbook of Heat Transfer*, 3rd ed., McGraw-Hill, 1998.
7. Oberkampf W.L., Roy C.J., *Verification and Validation in Scientific Computing*, Cambridge University Press, 2010.
8. Stern F., Wilson R.V., Coleman H.W., Paterson E.G., "Comprehensive approach to verification and validation of CFD simulations—Part 1: Methodology and procedures", *Journal of Fluids Engineering*, 123(4), 793–802, 2001.
9. Eça L., Hoekstra M., "A procedure for the estimation of the numerical uncertainty of CFD calculations based on grid refinement studies", *Journal of Computational Physics*, 262, 104–130, 2014.
10. Coleman H.W., Steele W.G., *Experimentation, Validation, and Uncertainty Analysis for Engineers*, 3rd ed., Wiley, 2009.
11. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, OpenCFD Ltd, 2022.
12. AIAA, *Guide for the Verification and Validation of Computational Fluid Dynamics Simulations*, AIAA G-077-1998, 1998.
