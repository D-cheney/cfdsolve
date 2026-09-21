---
template_version: flowlab-knowledge/1.0
slug: openfoam-numerics-convection-schemes-modeling
title: divSchemes 对流格式：原理、设置与验证
summary: >-
  从面值重构、限制器函数与 Godunov 定理出发解释 divSchemes 对流格式的作用机理，给出网格 Péclet
  数与数值耗散的量级判据，说明一阶迎风、linearUpwind 与 limitedLinear 各自何时成立、何时必须换档。
category:
  slug: openfoam-numerics-boundaries
  name: OpenFOAM 边界与数值设置
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 边界与数值设置
  - divSchemes 对流格式
  - 设置机理与适用范围
  - 限制器
  - 数值耗散
  - 工程设置与参数选择
  - linearUpwind
  - limitedLinear
  - 结果诊断与可信度验证
  - Richardson 外推
  - GCI
seo:
  title: divSchemes 对流格式：原理、设置与验证
  description: >-
    从面值重构、限制器函数与 Godunov 定理出发解释 divSchemes 对流格式的作用机理，给出网格 Péclet
    数与数值耗散的量级判据，说明一阶迎风、linearUpwind 与 limitedLinear 各自何时成立、何时必须换档。
  keywords:
    - divSchemes 对流格式
    - 设置机理与适用范围
    - 限制器函数
    - 网格 Péclet 数
    - Godunov 定理
    - 工程设置与参数选择
    - limitedLinear 系数
    - bounded 前缀
    - Courant 数
    - 结果诊断与可信度验证
    - Richardson 外推
    - 网格收敛指数
    - 数值耗散
---
# divSchemes 对流格式：原理、设置与验证

`divSchemes` 里 `div(phi,U)` 一行决定动量方程的对流通量在面上取什么值，也决定结果是有界光滑还是过冲振荡。一阶迎风在任何网格上都无条件有界，代价是把扩散项人为放大几个数量级；中心差分二阶精确，却要求单元 Péclet 数不超过 2，工程网格几乎不可能满足。本文把面值重构、限制器函数与 Godunov 定理串成一条机理链，并给出判断该用哪一档格式的量化边界。多数不可压缩算例里，`div(phi,U)` 用 `bounded Gauss linearUpwind grad(U)`、湍流量用 `bounded Gauss limitedLinear 1` 就能覆盖九成需求，真正的工程量在于把限制器系数、`bounded` 前缀、时间步与网格尺寸配成一套自洽的组合。残差降到 $10^{-6}$ 并不代表对流离散可信：一阶迎风能在任何网格上给出漂亮残差，同时把温度前沿抹宽两倍。验证对流格式要做的是把数值耗散从物理扩散里剥出来，再用网格收敛阶和极值统计给出量化结论。

## 基础概念与控制关系

### 对流通量离散的真正未知量

有限体积把对流体散度在控制体 $V_P$ 上积分，用散度定理转成面积分：

$$
\int_{V_P}\nabla\cdot(\rho\phi\mathbf{u})\,dV=\sum_f \rho_f\phi_f\mathbf{u}_f\cdot\mathbf{S}_f
$$

$\mathbf{S}_f$ 是面外法向面积矢量，量纲 $\mathrm{m^2}$。单元中心值 $\phi_P$、$\phi_N$ 是已知量，未知的只有面值 $\phi_f$，所以对流格式的全部工作就是用一个重构规则把两个中心值组合成面值。这一步不破坏守恒性——只要相邻单元共用的那个面只有一个面值，通量必然成对抵消——但它完全决定离散系统的单调性。

### 迎风、中心与限制器如何组合出面值

把面值写成迎风值加一个受限制的修正量：

$$
\phi_f=\phi_P+\frac{1}{2}\psi(r)\left(\phi_N-\phi_P\right),\qquad r=\frac{\phi_P-\phi_W}{\phi_N-\phi_P}
$$

$r$ 是上游梯度比，$\psi(r)$ 是限制器函数。$\psi\equiv 0$ 退化为严格一阶迎风，$\psi\equiv 1$ 就是中心差分；Sweby 限制器 $\psi(r)=\max\left[0,\min(2r,1),\min(r,2)\right]$ 在 TVD 区域内取值，OpenFOAM 的 `limitedLinear` 实现为对 $\psi=2\min(r,1)$ 再截断到 $[0,2]$。$\psi$ 越接近 0，面值越贴近迎风值，数值耗散越大；越接近 2，越接近二阶中心。因此限制器系数不是精度旋钮，而是耗散与振荡之间的连续权衡。

数值耗散可以估出量级。一阶迎风的等效扩散系数约为 $\Gamma_{num}\approx \rho u\Delta x/2$。取空气 $\rho=1.2\ \mathrm{kg/m^3}$、$u=20\ \mathrm{m/s}$、$\Delta x=0.004\ \mathrm{m}$，得

$$
\Gamma_{num}\approx\frac{1.2\times20\times0.004}{2}=0.048\ \mathrm{Pa\cdot s}
$$

而空气分子黏度只有 $1.8\times10^{-5}\ \mathrm{Pa\cdot s}$，两者相差约 2700 倍。这就解释了一阶迎风为什么把温度或浓度前沿抹宽：在该网格上，标量输运的扩散几乎完全由数值耗散而不是物性决定。

### 有界性与单调性：高阶为什么必须配限制器

把离散写成 $a_P\phi_P=\sum_N a_N\phi_N+b_P$ 后，只要邻居系数非负且对角占优，无源处就不会产生新极值。中心差分对应的系数为

$$
a_E=D-\frac{F}{2},\qquad a_W=D+\frac{F}{2},\qquad F=\rho u A,\qquad D=\frac{\Gamma A}{\Delta x}
$$

$F$ 是对流通量（$\mathrm{kg/s}$），$D$ 是扩散导度。$a_E\ge0$ 要求 $|F|\le2D$，即单元 Péclet 数 $|Pe_\Delta|=|F|/D\le2$。仍用上面的空气参数：$F=1.2\times20\times A=24A$，$D=1.8\times10^{-5}A/0.004=4.5\times10^{-3}A$，于是

$$
Pe_\Delta=\frac{24A}{4.5\times10^{-3}A}\approx 5300
$$

比安全上限 2 高出三个数量级，中心差分在这种网格上必然振荡。把 $Pe_\Delta$ 压回 2 需要 $\Delta x\approx1.5\times10^{-6}\ \mathrm{m}$，对 $1\ \mathrm{m}$ 长的计算域意味着十亿量级的网格，工程上不可行——这正是必须引入限制器而不是一味加密的原因。

量级判断可以固化成一段可复算的估算，改几个数就能套到新工况上：

```text
输入: rho = 1.2 kg/m^3, u = 20 m/s, dx = 0.004 m, mu = 1.8e-5 Pa·s
F/A  = rho*u        = 24.0        kg/(m^2·s)
D/A  = mu/dx        = 4.5e-3      kg/(m^2·s)
Pe   = (F/A)/(D/A)  = 5.3e3       远大于安全上限 2
结论: 中心差分无界，必须使用 bounded 高阶格式或限制器
```

Godunov 定理给出更根本的限制：任何线性、守恒且单调的格式至多一阶精度。想同时拿到高阶与有界，格式必须是非线性的，即限制器依赖当地解。这条定理解释了为什么 `bounded` 前缀和限制器不是可选项，而是高阶对流在真实网格上能用的前提条件。

## 适用边界与方案选择

### 格式档位与适用边界

一个可直接用于不可压缩求解器的起点：

```cpp
divSchemes
{
    default                         none;
    div(phi,U)                      bounded Gauss linearUpwind grad(U);
    div(phi,k)                      bounded Gauss limitedLinear 1;
    div(phi,epsilon)                bounded Gauss limitedLinear 1;
    div(phi,omega)                  bounded Gauss limitedLinear 1;
    div(phi,nuTilda)                bounded Gauss limitedLinear 1;
    div((nuEff*dev2(T(grad(U)))))   Gauss linear;
}
```

`default none` 是有意设置：任何未显式列出的 `div` 项都会让求解器直接报错，避免新加的方程悄悄落在一个没被验证过的格式上。相分数、质量分数这类有硬边界的量要把限制器收紧到 `limitedLinear01 1` 或 `Minmod`，因为 `limitedLinear 1` 只保证不产生新极值，并不保证结果落在 $[0,1]$ 区间内。

| 格式 | 精度 | 有界性 | 典型适用场合 |
|---|---|---|---|
| `Gauss upwind` | 一阶 | 无条件有界 | 启动调试、极端畸变网格 |
| `Gauss linearUpwind grad(U)` | 二阶 | 需配 `bounded` | 光滑内流、外流主力格式 |
| `Gauss limitedLinear 1` | 二阶级 | 有界 | 湍流量、标量输运 |
| `Gauss linear` | 二阶 | 无界 | 高正交网格、小时间步 LES |

## 工程设置与实施

### 时间步与网格如何限制格式收益

格式的稳定性上限由 Courant 数控制：

$$
Co=\frac{\Delta t}{2}\frac{\sum_f|\phi_f|}{V_P}
$$

对 `backward` 时间格式，$Co$ 取到 5 甚至更高也不会发散，但时间离散误差会明显抹平峰值。工程建议：需要捕捉瞬态峰值时把 `maxCo` 设为 0.9 并打开 `adjustTimeStep yes`；只关心时均量时放宽到 2。以一个 $0.02\ \mathrm{m}$ 的网格和 $5\ \mathrm{m/s}$ 的来流为例，$Co=0.9$ 对应 $\Delta t\approx3.6\times10^{-3}\ \mathrm{s}$，而 $Co=2$ 允许 $\Delta t=8\times10^{-3}\ \mathrm{s}$。

网格尺度与格式阶数必须匹配。二阶格式的截断误差正比于 $\Delta x^2$，但如果长宽比超过 100 或最大非正交角超过 $70^\circ$，几何误差会吃掉二阶收益，此时应优先修网格而不是继续升阶。一个实用的判据是：把网格加密一倍后目标量的变化若大于格式换档带来的变化，就说明当前精度受网格而非格式限制。

### 极值监控与对照试验配置

极值监控是发现无界格式最快的办法，把它挂成常驻函数对象：

```cpp
functions
{
    fieldExtremes
    {
        type          fieldMinMax;
        libs          ("libfieldFunctionObjects.so");
        fields        (T U p k epsilon alpha.water);
        mode          component;
        writeControl  timeStep;
        writeInterval 1;
        log           true;
    }
}
```

前沿宽度对照试验按下面的流程走，每一步只改一个量：

```text
基线：div(phi,T) = bounded Gauss upwind            记录 前沿宽度 w0、峰值 Tmax、最小值 Tmin
换档：div(phi,T) = bounded Gauss linearUpwind grad(T)  记录 w1、Tmax、Tmin
收紧：div(phi,T) = bounded Gauss limitedLinear 1       记录 w2、Tmax、Tmin
加密：把上述三档各在 2Δx 与 Δx/2 上重跑
判定：w0 与 w1 的差若随网格加密而缩小，说明耗散来自格式；若不缩小，说明来自网格
```

在一条 $1\ \mathrm{m}$ 长的一维对流算例里，来流 $u=1\ \mathrm{m/s}$、$\Delta x=0.005\ \mathrm{m}$，精确阶跃界面的理想宽度为零。一阶迎风给出的 $10\%\sim90\%$ 前沿宽度约 $3\Delta x=0.015\ \mathrm{m}$，二阶有界格式约 $1.5\Delta x=0.0075\ \mathrm{m}$，而无限制 `linear` 会给出更窄的前沿但同时把峰值抬到 1.08。这三组数放在一起才能说明：`linear` 的"更准"是用无界换来的。

### 限制器系数该取多少

`divSchemes` 里唯一需要按物理量调整的数字是限制器系数，它的含义是限制器函数的上界：

$$
\psi_{vanLeer}(r)=\frac{r+|r|}{1+|r|},\qquad \psi_{limitedLinear}(r)=2\min(r,1)
$$

`limitedLinear 1` 取满限制范围，是速度与湍流量的默认选择；`limitedLinearV 1` 对张量逐分量限制，在强旋流中比标量版更稳；`limitedLinear01 1` 额外把结果夹到 $[0,1]$，是多相体积分数与质量分数的唯一正确选项。把系数写成 `0.5` 会显著抬高耗散，只应在网格极差时临时使用，并在算例说明里标注为待整改项。

面值必须落在相邻单元值之间，这是有界性最直接的操作定义：

$$
\min(\phi_P,\phi_N)\le\phi_f\le\max(\phi_P,\phi_N)
$$

任何违反该式的重构都会在源项或极值附近制造新峰谷。`bounded` 前缀靠延迟修正实现这一点：

$$
\phi_f^{n+1}=\phi_f^{UP}+\left(\phi_f^{HO}-\phi_f^{UP}\right)^{n}
$$

隐式部分保留一阶迎风以维持对角占优，高阶差额显式计算并靠外迭代逐步收敛。代价是残差下降变慢，所以打开 `bounded` 后必须相应增加外迭代次数，否则会看到残差在 $10^{-3}$ 附近长时间停滞。

### 三轮单因素升阶对照

每轮之间只允许一项变化，否则目标量的漂移无法归因到具体格式。若 R1 与 R0 的阻力差小于 0.5%，说明一阶迎风的耗散没有污染目标量，可以放心升到 R2；若差到 3% 以上，就必须先用网格无关性把离散误差压下去，而不是急着叠加更多格式改动。

| 轮次 | 改动项 | 保持不动 | 记录量 |
|---|---|---|---|
| R0 基线 | 全部一阶迎风 | 网格、时间步、线性求解器 | 目标量、极值、平均迭代数 |
| R1 | 仅 `div(phi,U)` 换成 `linearUpwind grad(U)` | 其余全部 | 阻力或压降、$\psi$ 分布 |
| R2 | 仅湍流量换成 `limitedLinear 1` | 其余全部 | 湍动能极值、分离点位置 |

## 异常诊断与失效模式

### 故障模式与判定试验

判断格式是否够用的标准不是残差降到多小，而是关键工程量在网格与格式双重扰动下是否稳定。若把 `linearUpwind` 换成 `limitedLinear 1` 后目标量变化小于工程容差，说明对流离散已不是误差主导项；若变化显著，正确做法是继续加密网格，而不是在几档格式里挑一个看起来最顺眼的结果。

参数一旦定稿，就应连同网格尺寸、`maxCo`、限制器系数一起写进算例说明。脱离这些条件复制格式，等于把一套在特定网格上验证过的有界设置搬到它从未被检验过的地方。

判据的顺序是：先看极值是否越界，再看前沿宽度是否随网格收敛，最后用 GCI 给出不确定度带。三者齐备才能宣称对流格式设置可信；只有残差曲线是不足以支撑结论的。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 标量出现负值或大于 1 的峰 | 高阶格式缺限制器或未加 `bounded` | 分别关掉 `bounded` 和限制器各跑一次，看极值是否消失 |
| 温度前沿明显宽于网格尺度 | 限制器退化到迎风 | 统计 $\psi<0.05$ 的单元占比，超过 30% 说明网格不足或格式过保守 |
| 加密网格后阻力反而上升 | 格式误差与网格误差混叠 | 固定格式只加密网格，检查阻力是否单调趋稳 |
| 加 `bounded` 后残差停在 $10^{-3}$ | 延迟修正的显式项未收敛 | 增加外迭代次数，观察残差是否继续下降 |
| 开 `bounded` 后残差停在 $10^{-3}$ | 延迟修正显式项未收敛 | 把外迭代次数加倍，看残差是否继续下降 |
| 体积分数出现 $-0.01$ 的负值 | 限制器未夹到 $[0,1]$ | 换成 `limitedLinear01 1` 复跑并对比极值历史 |
| 湍动能出现负值 | 迎风加过量限制带来过大耗散 | 换 `limitedLinear 1` 并检查 $\psi$ 统计 |
| 同一算例两次运行目标量差 5% | 格式无界或时间步自适应抖动 | 固定时间步、导出极值历史逐时刻比对 |
| 前沿宽度随加密不收敛 | 格式在多数单元退化为迎风 | 统计 $\psi<0.05$ 的单元占比，与网格尺度对照 |
| 峰值超过初值上限 5% 以上 | 高阶格式无界或限制器失效 | 关掉 `bounded` 与换 `limitedLinear 1` 各跑一次对比极值 |
| 阻力三级网格非单调 | 时间步自适应或边界未收敛混入 | 固定时间步重跑，再算观测阶 $p$ |
| 观测阶 $p$ 只有 1.0～1.3 | 网格长宽比或非正交角过大 | 用 `checkMesh` 量化几何质量，与格式换档结果对比 |
| 残差很低但极值缓慢漂移 | 延迟修正外迭代不足 | 加倍外迭代次数，观察极值与残差是否同时稳定 |

## 验证、验收与复现

### 有界性与守恒的验收指标

验收至少覆盖三类量，缺一类都不算通过：

- 极值：体积分数与质量分数落在 $[0,1]$，湍动能、耗散率、比耗散率非负；
- 守恒：进出口质量流量的相对偏差小于 $10^{-4}$，能量或组分总通量闭合；
- 限制器统计：取值接近 0（即退化到迎风）的单元占比，超过 30% 说明网格不足或格式过保守。

对内部流动可以用压降沿程线性度做快速筛查：沿流向每 $0.1\ \mathrm{m}$ 采样一次静压，若相邻区间压降的标准差超过均值的 2%，通常意味着对流项在局部产生了非物理振荡，应先看限制器统计再看网格。

### 用观测精度阶把两类误差分开

对同一算例做加密比为 $r$ 的三级网格，用 Richardson 外推估计观测精度阶：

$$
p=\frac{\log\left(\frac{\phi_2-\phi_1}{\phi_3-\phi_2}\right)}{\log r},\qquad \phi_{ext}=\phi_3+\frac{\phi_3-\phi_2}{r^{p}-1}
$$

其中 $\phi_1$ 为最粗网格、$\phi_3$ 为最细网格。用一阶迎风时 $p$ 应接近 1，换二阶格式后 $p$ 应接近 2。举一组实测的阻力系数：$\phi_1=0.320$、$\phi_2=0.302$、$\phi_3=0.296$，加密比 $r=2$，则

$$
p=\frac{\log\left(\frac{0.302-0.320}{0.296-0.302}\right)}{\log 2}=\frac{\log 3}{\log 2}=1.585
$$

$p=1.585$ 落在 1 与 2 之间，说明限制器在部分单元退化为迎风，空间离散尚未完全达到二阶。外推值 $\phi_{ext}=0.296+(-0.006)/(2^{1.585}-1)=0.296-0.003=0.293$。把最细网格结果与网格收敛指数一起报告：

$$
GCI=\frac{1.25}{\phi_3}\frac{|\phi_2-\phi_3|}{r^{p}-1}=\frac{1.25\times0.006}{0.296\times2}=1.27\%
$$

工程上把 GCI 当作离散不确定度带：若格式换档引起的阻力变化小于 1.27%，则该变化落在离散噪声内，不足以支撑格式选择结论。

注意 Richardson 外推要求序列单调收敛。若三级结果出现 $\phi_2<\phi_3>\phi_4$ 这类非单调，先排查是否混入了时间步自适应抖动或边界条件未收敛，固定时间步后重跑再算 $p$。

### 一份可复现的 fvSchemes

```cpp
ddtSchemes      { default backward; }
gradSchemes     { default cellLimited Gauss linear 1; }
divSchemes
{
    default                         none;
    div(phi,U)                      bounded Gauss linearUpwind grad(U);
    div(phi,k)                      bounded Gauss limitedLinear 1;
    div(phi,epsilon)                bounded Gauss limitedLinear 1;
    div(phi,omega)                  bounded Gauss limitedLinear 1;
    div(phi,nuTilda)                bounded Gauss limitedLinear 1;
    div((nuEff*dev2(T(grad(U)))))   Gauss linear;
}
laplacianSchemes     { default Gauss linear corrected; }
interpolationSchemes { default linear; }
snGradSchemes        { default corrected; }
```

`default none` 是刻意为之：任何未显式列出的 `div` 项都会触发报错，从而避免新增方程悄悄落到一个不安全的默认格式上。

配合上面的字典，运行与取证命令固定成两条：

```bash
checkMesh -allGeometry -allTopology 2>&1 | tee log.checkMesh
foamRun -solver incompressibleFluid 2>&1 | tee log.foamRun
# v14 及更早版本使用: pimpleFoam 或 simpleFoam
```

### 先量化数值耗散，再谈云图

一阶迎风引入的等效扩散系数可以写成

$$
\Gamma_{num}=\frac{\rho u\Delta x}{2}\left(1-Co\right)
$$

取空气 $\rho=1.2\ \mathrm{kg/m^3}$、$u=15\ \mathrm{m/s}$、$\Delta x=0.002\ \mathrm{m}$、$Co=0.5$，得 $\Gamma_{num}=1.2\times15\times0.002\times0.5/2=9\times10^{-3}\ \mathrm{Pa\cdot s}$。而该温度下空气的分子黏度是 $1.8\times10^{-5}\ \mathrm{Pa\cdot s}$，数值扩散比它高出两个多数量级，说明在该网格上用一阶迎风算出的浓度扩散宽度几乎完全由数值耗散决定，绝不能拿来反推物性扩散系数。

换成二阶 `linearUpwind` 后数值耗散降到 $\mathcal{O}(\Delta x^2)$。此时把 $\Delta x$ 从 $0.002\ \mathrm{m}$ 减到 $0.001\ \mathrm{m}$，一阶迎风的 $\Gamma_{num}$ 只减半到 $4.5\times10^{-3}\ \mathrm{Pa\cdot s}$，而二阶格式的等效耗散约降为四分之一。这条差异就是判断当前误差由格式还是由网格主导的试验：加密一倍，若前沿宽度显著收窄，说明格式仍在主导；若基本不变，说明已进入网格主导区。

## 参考资料

1. Godunov S.K., *A difference method for numerical calculation of discontinuous solutions of the equations of hydrodynamics*, Matematicheskii Sbornik, 47(3), 271–306, 1959.
2. Sweby P.K., *High resolution schemes using flux limiters for hyperbolic conservation laws*, SIAM Journal on Numerical Analysis, 21(5), 995–1011, 1984.
3. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
4. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
5. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
6. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
7. Waterson N.P., Deconinck H., *Design principles for bounded higher-order convection schemes*, Journal of Computational Physics, 224(1), 182–207, 2007.
8. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.4 Numerical Schemes, 2024.
9. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics*, 2nd ed., Pearson, 2007.
10. Roache P.J., *Perspective: a method for uniform reporting of grid refinement studies*, Journal of Fluids Engineering, 116(3), 405–413, 1994.
11. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E., *Procedure for estimation and reporting of uncertainty due to discretization in CFD applications*, Journal of Fluids Engineering, 130(7), 078001, 2008.
12. Richardson L.F., *The approximate arithmetical solution by finite differences of physical problems*, Philosophical Transactions of the Royal Society A, 210, 307–357, 1911.
