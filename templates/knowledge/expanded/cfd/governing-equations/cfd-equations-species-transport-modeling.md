---
template_version: flowlab-knowledge/1.0
slug: cfd-equations-species-transport-modeling
title: 组分输运方程：原理与工程设置
summary: >-
  组分方程的闭合缺口在多组分扩散、热扩散（Soret）与湍流—化学耦合三处。本文用 Stefan–Maxwell 方程说明 Fick 近似的误差来源，并算出
  CH4/空气火焰厚度 57.9 μm、Kolmogorov 尺度 50 μm 与网格下限。
  全文同时覆盖原理与适用范围、工程设置与参数选择，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
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
  - 组分输运方程
  - 物理建模与适用边界
  - Stefan–Maxwell 扩散
  - 火焰厚度
  - 工程设置与参数选择
  - Arrhenius 参数
  - 质量分数约束
seo:
  title: 组分输运方程：原理与工程设置
  description: >-
    组分方程的闭合缺口在多组分扩散、热扩散（Soret）与湍流—化学耦合三处。本文用 Stefan–Maxwell 方程说明 Fick
    近似的误差来源，并算出 CH4/空气火焰厚度 57.9 μm、Kolmogorov 尺度 50 μm 与网格下限。
    全文同时覆盖原理与适用范围、工程设置与参数选择，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 组分输运方程
    - 物理建模与适用边界
    - Stefan–Maxwell 扩散
    - 火焰厚度
    - 工程设置与参数选择
    - Arrhenius 参数
    - 质量分数约束
---
# 组分输运方程：原理与工程设置

## 原理与适用范围

组分输运方程的形式与标量输运方程一样，差别全在扩散通量的闭合上。把 $\mathbf{j}_i$ 写成 $-\rho D_i\nabla Y_i$ 是最省事的做法，但它丢掉了三件事：组分之间的交叉扩散、温度梯度驱动的热扩散、以及湍流脉动与化学反应的耦合。这三项的量级并不小——氢燃料火焰中忽略 Soret 效应会让火焰位置偏移数毫米，而层流火焰厚度只有几十微米。下面把三层闭合缺口分别量化。

### 组分质量守恒的微分形式与闭合缺口

第 $i$ 个组分的质量守恒写成

$$
\frac{\partial(\rho Y_i)}{\partial t} + \nabla\cdot(\rho\mathbf{u}Y_i) = -\nabla\cdot\mathbf{j}_i + \dot\omega_i
$$

$\mathbf{j}_i$ 是扩散质量通量，$\dot\omega_i$ 是化学反应源项。方程有 $N$ 个，但只有 $N-1$ 个独立，因为质量分数之和恒为 1。扩散通量必须满足

$$
\sum_{i=1}^{N}\mathbf{j}_i = 0
$$

这是 Fick 形式 $\mathbf{j}_i=-\rho D_i\nabla Y_i$ 不自动满足的：各组分独立扩散会给出非零的净质量通量。修正方法是引入修正速度

$$
\mathbf{j}_i = -\rho D_i\nabla Y_i + \rho Y_i\mathbf{u}_c,\qquad
\mathbf{u}_c = \sum_{k=1}^{N} D_k\nabla Y_k
$$

这一步不是可选的细节。缺少修正时，即使每个组分的方程都"守恒"，总和仍会漂移，表现为质量分数之和偏离 1 并随时间累积。

### Stefan–Maxwell 与 Fick 的差距

严格的扩散关系来自动量平衡，写成 Stefan–Maxwell 形式

$$
\nabla X_i = \sum_{j\neq i}\frac{X_iX_j}{D_{ij}}\left(\mathbf{V}_j-\mathbf{V}_i\right) + \frac{\nabla T}{T}\sum_{j\neq i}\frac{X_iX_j}{D_{ij}}\left(\frac{D_j^{T}}{\rho_j}-\frac{D_i^{T}}{\rho_i}\right)
$$

第一项是浓度扩散，第二项是热扩散。$D_{ij}$ 是二元扩散系数矩阵，$D_i^{T}$ 是热扩散系数。Fick 形式相当于把求和项压成一个有效 $D_i$，在两种情况下误差可以接受：混合物中某一组分浓度远高于其余（稀释近似），或所有二元系数彼此接近（如空气—燃烧产物体系）。误差不能接受的情况是含氢混合物——$D_{\mathrm{H_2\text{-}H_2O}}$ 与 $D_{\mathrm{H_2\text{-}N_2}}$ 相差三倍以上，用单一 $D_i$ 会让氢的优先扩散（preferential diffusion）完全消失，而正是这一效应决定了氢火焰的胞状不稳定性。

### Soret 效应与 Lewis 数不能取 1 的场合

热扩散的强弱用热扩散比衡量，量级上它与 Lewis 数直接相关

$$
Le = \frac{\alpha}{D} = \frac{\text{热扩散率}}{\text{质量扩散率}}
$$

$Le=1$ 时热扩散与质量扩散以相同速率进行，火焰结构最简单，这也是"恒 Lewis 数"模型默认取 1 的原因。298 K、1 atm 下甲烷在空气中的 $D=1.6\times10^{-5}\ \mathrm{m^2/s}$，空气热扩散率 $\alpha=2.2\times10^{-5}\ \mathrm{m^2/s}$，$Le=1.375$；氢气在空气中 $D=6.1\times10^{-5}\ \mathrm{m^2/s}$，$Le=2.2\times10^{-5}/6.1\times10^{-5}=0.361$。$Le<1$ 表示质量扩散快于热扩散，轻组分优先向反应区输运，火焰温度高于绝热值、燃烧速度增大；$Le>1$ 则相反。$Le$ 偏离 1 的幅度超过 20% 时（即 $Le<0.8$ 或 $Le>1.2$）就必须使用多组分或至少是逐组分 Fick 扩散，否则燃烧速度的预测误差会达到 20%～40%。

Soret 效应的独立判据是热扩散比 $k_T$。对氢气在 300 K 附近 $k_T\approx-0.3$，符号为负意味着氢向冷端富集；对氮气、甲烷这类较重分子 $k_T$ 在 $10^{-2}$ 量级，可以忽略。因此实用规则是：含 $\mathrm{H_2}$ 或 He 的混合物、且存在 100 K 以上温差的算例必须打开热扩散；碳氢燃料—空气体系可以关闭。

### 火焰厚度、Kolmogorov 尺度与网格下限

层流火焰厚度由热扩散率与火焰速度之比给出

$$
\delta_L = \frac{\alpha}{S_L}
$$

甲烷—空气在当量比 1、298 K、1 atm 下的层流火焰速度 $S_L=0.38\ \mathrm{m/s}$，代入得 $\delta_L=2.2\times10^{-5}/0.38=5.79\times10^{-5}\ \mathrm{m}$，即 57.9 μm；绝热火焰温度约 2223 K。同样口径下氢气—空气的 $S_L=2.1\ \mathrm{m/s}$，$\delta_L=1.05\times10^{-5}\ \mathrm{m}$，只有 10.5 μm。这两个数字直接决定网格：预混火焰至少需要 10 个单元落在火焰厚度内，甲烷要求 $\Delta x\le5.8\ \mu m$，氢气要求 $\Delta x\le1.0\ \mu m$。

湍流一侧的下限由 Kolmogorov 尺度给出

$$
\eta = L\,Re^{-3/4}
$$

取积分尺度 $L=0.05\ \mathrm{m}$、$Re=1.0\times10^4$，得 $\eta=0.05\times(10^4)^{-0.75}=0.05/1000=5.0\times10^{-5}\ \mathrm{m}=50\ \mu m$。于是卡洛维茨数

$$
Ka = \frac{\delta_L}{\eta} = \frac{57.9}{50} = 1.16
$$

$Ka<1$ 属于皱褶火焰面区，可以用火焰面模型加湍流输运闭合；$Ka>1$ 进入薄反应区，火焰面内部结构被小尺度涡扰动，必须解析内层或使用加厚火焰模型。甲烷算例恰好落在 $Ka\approx1$ 的分界上，说明用火焰面模型是可行的但余量很小，网格一旦放宽到 $\Delta x>60\ \mu m$ 就会既解析不了火焰又解析不了 Kolmogorov 涡，两侧的物理同时丢失。

```python
alpha, SL_ch4, SL_h2 = 2.2e-5, 0.38, 2.1        # m2/s, m/s
L, Re = 0.05, 1.0e4
eta = L * Re**-0.75
for name, SL in (("CH4", SL_ch4), ("H2", SL_h2)):
    dL = alpha / SL
    print(f"{name}: delta_L={dL*1e6:6.1f} um  dx_max={dL*1e5:5.2f} um  Ka={dL/eta:5.2f}")
# CH4: delta_L=  57.9 um  dx_max= 5.79 um  Ka= 1.16
# H2:  delta_L=  10.5 um  dx_max= 1.05 um  Ka= 0.21
print(f"eta={eta*1e6:.1f} um")                  # 50.0 um
print(f"Le(H2)={alpha/6.1e-5:.3f}  Le(CH4)={alpha/1.6e-5:.3f}")
# Le(H2)=0.361  Le(CH4)=1.375
```

注意氢气那一行的 $Ka=0.21$ 反而更小：火焰更薄但 $S_L$ 更大，$\delta_L$ 缩小的速度快于 $Ka$ 的下降，因此氢气火焰在同样的湍流场里反而更容易维持在火焰面区，但它对网格的要求（1.05 μm）比甲烷严格 5.5 倍。

### 失败模式：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 质量分数之和随时间单调偏离 1 | 扩散通量缺少修正速度，$\sum\mathbf{j}_i\neq0$ | 输出 $\sum_i Y_i$ 的时间序列，修正后应在 $10^{-6}$ 内波动 |
| 氢火焰燃烧速度比实验低 30% | 用 $Le=1$ 抹掉了优先扩散 | 输出 $Le$ 场并改逐组分 Fick 扩散，比较 $S_L$ 变化 |
| 富氢混合物中火焰前锋出现非对称偏移 | 未打开 Soret 热扩散 | 打开热扩散复算，前锋位置应发生可测的毫米级移动 |
| 网格加密到 10 μm 后火焰速度仍在变 | 火焰厚度 57.9 μm，10 μm 只给 0.17 个单元/μm 的分辨率不足 | 按 $\Delta x\le\delta_L/10$ 加密到 5.8 μm 以下 |
| 湍流燃烧算例的火焰面模型在 $Ka>1$ 区失效 | 火焰面假设被小尺度涡破坏 | 由 $L$、$Re$ 算 $\eta$ 与 $Ka$，超过 1 时换加厚火焰或有限速率模型 |
| 燃烧室温度峰值比绝热火焰温度高 200 K | 用 $Le<1$ 燃料时超绝热效应被误判为数值误差 | 核对 $Le$：$Le<1$ 时局部超绝热是物理结果，不应做限制器截断 |

### 参考文献

1. Poinsot T., Veynante D., *Theoretical and Numerical Combustion*, 2nd ed., Edwards, 2005.
2. Williams F.A., *Combustion Theory*, 2nd ed., Benjamin/Cummings, 1985.
3. Law C.K., *Combustion Physics*, Cambridge University Press, 2006.
4. Peters N., *Turbulent Combustion*, Cambridge University Press, 2000.

## 工程设置与参数选择

组分输运方程比动量方程多两个坑：一是扩散系数不是常数，选 Fick、恒 Lewis 还是多组分扩散会让结果差几十个百分点；二是反应源项的 Arrhenius 指数对温度极其敏感，活化温度填错一位数就直接把火焰算成惰性混合。设置时的顺序应当是先定扩散模型与物性，再填反应参数，最后用有界格式把质量分数锁在 $[0,1]$ 内。

### 组分方程与质量分数约束

第 $i$ 个组分的质量守恒展开成随体形式

$$
\rho\frac{\partial Y_i}{\partial t} + \rho\mathbf{u}\cdot\nabla Y_i = \nabla\cdot(\rho D_i\nabla Y_i) + \dot\omega_i
$$

$\dot\omega_i$ 是单位体积的组分生成率，量纲 $\mathrm{kg/(m^3\cdot s)}$。与动量方程不同，这组方程有一个硬约束

$$
\sum_{i=1}^{N} Y_i = 1
$$

逐组分求解时这个约束不会被自动满足，必须靠扩散通量的一致性修正（把 $\sum_i \rho D_i\nabla Y_i$ 从对流通量中扣除）来维持。工程上最简单的检查是输出 $\sum_i Y_i$ 的极值：收敛算例应在 $10^{-6}$ 以内偏离 1，若偏离到 $10^{-3}$ 量级，说明修正没做或源项没有守恒地对各组分分配。

### 扩散系数模型：Fick、恒 Lewis 与多组分

层流扩散的严格形式是 Stefan–Maxwell 方程组，工程实现中通常退化为三种模型。Fick 模型逐组分给出二元扩散系数 $D_i$，最接近物理但需要 $N(N-1)/2$ 个系数；恒 Lewis 模型只给一个 Lewis 数，反算 $D_i=\alpha/Le$；恒 Schmidt 模型直接给 $Sc$。三者可以通过两个无量纲数互相换算

$$
Sc = \frac{\nu}{D},\qquad Le = \frac{\alpha}{D} = \frac{Sc}{Pr}
$$

以 298 K、1 atm 下甲烷在空气中的扩散为例，$D_{\mathrm{CH_4\text{-}air}}=1.6\times10^{-5}\ \mathrm{m^2/s}$，空气的运动黏度 $\nu=1.516\times10^{-5}\ \mathrm{m^2/s}$，热扩散率 $\alpha=2.2\times10^{-5}\ \mathrm{m^2/s}$，于是 $Sc=1.516\times10^{-5}/1.6\times10^{-5}=0.948$，$Pr=1.516\times10^{-5}/2.2\times10^{-5}=0.689$，$Le=0.948/0.689=1.375$。若按 OpenFOAM 的 `constantLewis` 默认取 $Le=1$，扩散系数会被设成 $\alpha=2.2\times10^{-5}\ \mathrm{m^2/s}$，比真实值高 37.5%；对甲烷这类 $Le$ 接近 1 的燃料误差可接受，但对氢气（$Le\approx0.3$）会显著改变火焰位置与燃烧速度，必须改用 Fick 或多组分扩散。

### 反应速率的 Arrhenius 参数怎么填

单步总包反应的速率常数写成

$$
k = A\,T^{\beta}\exp\left(-\frac{E_a}{R_u T}\right)
$$

$A$ 的单位随反应级数变化，$\beta$ 是无量纲温度指数，$E_a$ 是活化能，$R_u$ 是通用气体常数。甲烷—空气单步机理的常用取值是 $A=2.119\times10^{11}\ \mathrm{m^3/(kmol\cdot s)}$、$\beta=0$、$E_a=2.027\times10^{8}\ \mathrm{J/kmol}$。OpenFOAM 的 `irreversibleArrheniusReaction` 填的是活化温度 $T_a=E_a/R_u$，用 $R_u=8314\ \mathrm{J/(kmol\cdot K)}$ 换算得

$$
T_a = \frac{2.027\times10^{8}}{8314} = 2.438\times10^{4}\ \mathrm{K}
$$

这一步换算是输入正确性的关键：把 $T_a$ 误填成 $E_a$ 的数值（2.027e8）会让 $\exp(-E_a/R_uT)$ 直接下溢为零，反应完全不发生；反过来把 $E_a$ 当成 $T_a$ 填入又会让反应瞬时完成。两个温度的速率对比很能说明指数敏感性：$T=1500\ \mathrm{K}$ 时 $E_a/(R_uT)=2.027\times10^8/(8314\times1500)=16.25$，$k=2.119\times10^{11}\times e^{-16.25}=2.119\times10^{11}\times8.716\times10^{-8}=1.85\times10^{4}\ \mathrm{m^3/(kmol\cdot s)}$；$T=2000\ \mathrm{K}$ 时 $E_a/(R_uT)=12.19$，$k=2.119\times10^{11}\times5.109\times10^{-6}=1.08\times10^{6}$。温度只升 33%，速率放大 58.6 倍。

这个倍数决定了数值策略。设燃料摩尔浓度 $C_{\mathrm{CH_4}}=0.5\ \mathrm{kmol/m^3}$，化学时间尺度 $\tau_{chem}=1/(kC)=1/(1.85\times10^4\times0.5)=1.08\times10^{-4}\ \mathrm{s}$，即 0.108 ms；流动时间尺度取 $\tau_{flow}=L/U=0.3/20=0.015\ \mathrm{s}$，达姆科勒数

$$
Da = \frac{\tau_{flow}}{\tau_{chem}} = \frac{0.015}{1.08\times10^{-4}} = 139
$$

$Da\gg1$ 表示反应远快于流动，火焰薄且强耦合，必须用小时间步或隐式化学积分（`seulex`、`EulerImplicit`）配合 $10^{-7}\ \mathrm{s}$ 量级的初始化学时间步。

```cpp
// constant/combustionProperties
reactions
{
    methaneAir
    {
        type        irreversibleArrheniusReaction;
        reaction    "CH4 + 2O2 = CO2 + 2H2O";
        A           2.119e11;      // m^3/(kmol s)
        beta        0;
        Ta          24380;         // = Ea/Ru，K；不是 Ea
    }
}

// constant/chemistryProperties
chemistry       on;
initialChemicalTimeStep 1e-7;
odeCoeffs { solver seulex; absTol 1e-12; relTol 1e-4; }
```

### 边界条件与数值有界性

入口给定质量分数、出口用 `inletOutlet`（回流时取内部值）、不参与反应的壁面用 `zeroGradient`。若壁面有催化或吸附，需要换成对应的通量边界，此时壁面反应速率与体相速率用同一套 Arrhenius 参数会更自洽。

数值上，组分方程在反应区极薄、梯度极陡，普通二阶格式会产生负质量分数。做法是把对流项设成 `Gauss limitedLinear 1`，并在源项很强时启用 MULES 限制器做显式有界修正，同时保留隐式源项做时间推进。判据很直接：输出各 $Y_i$ 的最小值，出现负值就说明限制器没生效或时间步过大。

| 参数 | 取值 | 依据 |
|---|---|---|
| $D_{\mathrm{CH_4\text{-}air}}$ | $1.6\times10^{-5}\ \mathrm{m^2/s}$ | 298 K、1 atm |
| $Sc$ / $Le$ | 0.948 / 1.375 | $\nu/D$ 与 $\alpha/D$ |
| 预混甲烷质量分数 | 0.055 | 化学当量：16.04 g CH₄ 配 275.9 g 空气 |
| $A$ / $\beta$ / $T_a$ | $2.119\times10^{11}$ / 0 / 24380 K | 甲烷单步机理 |
| 化学时间步 | $1\times10^{-7}\ \mathrm{s}$ | $\tau_{chem}=0.108\ \mathrm{ms}$ 的千分之一 |
| 达姆科勒数 | 139 | $\tau_{flow}/\tau_{chem}$ |

### 失败模式：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 温度场升到 2000 K 但组分完全不变 | $T_a$ 填成了 $E_a$，指数项下溢 | 打印 $T_a$ 与 $E_a/R_u$ 的比值，应为 1 |
| 质量分数之和偏离 1 达 1% | 扩散通量未做一致性修正，各组分独立扩散 | 输出 $\sum_i Y_i$ 极值，应在 $10^{-6}$ 内 |
| 火焰面上出现负质量分数 | 对流格式无界或时间步过大 | 检查 $Y_i$ 最小值；把格式换成 `limitedLinear 1` 并把 $\Delta t$ 减半 |
| 氢燃料火焰位置比实验靠下游 | 用 $Le=1$ 代替真实 $Le\approx0.3$，扩散被低估 | 改成 Fick 扩散并输出 $Le$ 场，观察火焰前锋是否上移 |
| 反应区温度出现网格相关的尖峰 | 化学时间步未自适应，刚性方程显式积分失稳 | 输出化学积分器接受的步长，应小于 $10^{-6}\ \mathrm{s}$ |
| 封闭腔内燃料缓慢单调减少 | 出口边界泄漏，或源项符号写反 | 积分总体燃料质量随时间，质量守恒应闭合到 $10^{-6}$ |

### 参考文献

1. Westbrook C.K., Dryer F.L., "Simplified reaction mechanisms for the oxidation of hydrocarbon fuels in flames", *Combustion Science and Technology*, 27:31–43, 1981.
2. Bird R.B., Stewart W.E., Lightfoot E.N., *Transport Phenomena*, 2nd ed., Wiley, 2002.
3. Kee R.J., Rupley F.M., Miller J.A., *CHEMKIN-II: A Fortran Chemical Kinetics Package for the Analysis of Gas-Phase Chemical Kinetics*, Sandia National Laboratories, SAND89-8009, 1989.
4. Turns S.R., *An Introduction to Combustion*, 3rd ed., McGraw-Hill, 2012.
