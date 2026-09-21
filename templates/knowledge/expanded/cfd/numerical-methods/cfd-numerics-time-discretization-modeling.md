---
template_version: flowlab-knowledge/1.0
slug: cfd-numerics-time-discretization-modeling
title: 时间离散与误差控制：原理、设置与验证
summary: >-
  从放大因子与稳定域出发解释时间格式的阶数与稳定性不能兼得：推导 RK4 的实轴稳定上限
  2.785、对比显式欧拉与后向欧拉的刚性行为，并用一次手算给出同一扩散算例下两种格式允许的步长差。
  全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: numerical-methods
  name: CFD 数值方法
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - CFD 数值方法
  - 时间离散与误差控制
  - 离散原理与适用范围
  - A-稳定
  - 稳定域
  - 工程设置与参数选择
  - 自适应时间步
  - maxCo
  - 结果诊断与可信度验证
  - Richardson 外推
  - 刚性稳定性
seo:
  title: 时间离散与误差控制：原理、设置与验证
  description: >-
    从放大因子与稳定域出发解释时间格式的阶数与稳定性不能兼得：推导 RK4 的实轴稳定上限
    2.785、对比显式欧拉与后向欧拉的刚性行为，并用一次手算给出同一扩散算例下两种格式允许的步长差。
    全文同时覆盖原理与适用范围、工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 时间离散与误差控制
    - 离散原理与适用范围
    - A-稳定
    - 稳定域
    - 工程设置与参数选择
    - 自适应时间步
    - maxCo
    - 结果诊断与可信度验证
    - Richardson 外推
    - 刚性稳定性
---
# 时间离散与误差控制：原理、设置与验证

## 原理与适用范围

把空间离散后的半离散系统写成 $\mathrm{d}\mathbf{u}/\mathrm{d}t=\mathbf{L}\mathbf{u}+\mathbf{N}(\mathbf{u})$，时间离散的全部问题就归结为一个复标量模型方程 $\dot{u}=\lambda u$。格式的阶数决定精度，稳定域决定步长上限，而 Dahlquist 障碍告诉我们这两件事在隐式线性多步法里不能同时最优。理解这条限制，才能解释为什么生产算例几乎从不使用三阶以上的隐式格式。

### 放大因子：稳定性的唯一判据

对模型方程 $\dot{u}=\lambda u$（$\lambda$ 为空间算子的特征值，$\mathrm{Re}\,\lambda<0$），格式写成 $u^{n+1}=G(\lambda\Delta t)u^n$。稳定性要求

$$\left|G(z)\right|\le1,\qquad z=\lambda\Delta t$$

几个常用格式的 $G$：

$$G_{\text{EE}}(z)=1+z,\qquad G_{\text{BE}}(z)=\frac{1}{1-z},\qquad G_{\text{CN}}(z)=\frac{1+z/2}{1-z/2}$$

四阶 Runge–Kutta 的稳定多项式为

$$G_{\text{RK4}}(z)=1+z+\frac{z^{2}}{2}+\frac{z^{3}}{6}+\frac{z^{4}}{24}$$

在负实轴上，$\left|G_{\text{RK4}}\right|\le1$ 的边界为 $z=-2.785$，而显式欧拉只到 $z=-2$。两者相差 $2.785/2=1.39$，即同样问题下 RK4 允许的步长比显式欧拉大 39 %，代价是每步四次右端求值。

### 手算：扩散算例下的步长上限

一维扩散算子离散后最大特征值为 $\lambda=-2\nu/\Delta x^{2}$。取 $\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$，$\Delta x=1.0\times10^{-3}\ \mathrm{m}$：

$$\lambda=-\frac{2\times1.5\times10^{-5}}{\left(1.0\times10^{-3}\right)^{2}}=-30\ \mathrm{s^{-1}}$$

于是

$$\Delta t_{\text{EE}}\le\frac{2.0}{30}=6.7\times10^{-2}\ \mathrm{s},\qquad \Delta t_{\text{RK4}}\le\frac{2.785}{30}=9.3\times10^{-2}\ \mathrm{s}$$

若改用后向欧拉，$\left|G_{\text{BE}}\right|=\left|1/(1-z)\right|$ 对任意 $z<0$ 都小于 1，步长不受稳定性限制，只受精度限制。这就是隐式格式在刚性扩散问题上的全部价值：把 $\Delta t$ 从 $10^{-2}$ 量级解放出来，代价是每步解一次线性系统。

### A-稳定与 L-稳定：两个不同的要求

A-稳定指稳定域包含整个左半平面 $\mathrm{Re}\,z\le0$；L-稳定在此外还要求 $\left|G(z)\right|\to0$ 当 $z\to-\infty$。

$$G_{\text{CN}}(z)\xrightarrow{z\to-\infty}-1,\qquad G_{\text{BE}}(z)\xrightarrow{z\to-\infty}0$$

两者都 A-稳定，但只有后向欧拉是 L-稳定。Crank–Nicolson 对刚性模态的放大因子模长为 1，意味着初始的刚性分量永不衰减，会以 $2\Delta t$ 周期在解中长期驻留。这就是为什么 `CrankNicolson 0.9` 需要配合启动阶段的 `Euler` 或改用 `backward`。

Dahlquist 第一障碍进一步限定：A-稳定的线性多步法阶数不超过 2。BDF1（后向欧拉）与 BDF2 是 A-稳定的，BDF3 到 BDF6 只具有 $A(\alpha)$ 稳定性，$\alpha$ 随阶数减小——BDF6 的 $\alpha$ 约为 $17^\circ$，意味着它对接近虚轴的特征值不稳定。这就是生产求解器中隐式格式极少超过二阶的结构性原因。

### 伪时间推进与物理时间的区别

稳态求解器引入伪时间 $\tau$，求解

$$\frac{\partial\phi}{\partial\tau}+R(\phi)=0$$

当 $\partial\phi/\partial\tau\to0$ 时 $R(\phi)=0$，得到定常解。伪时间步只影响收敛速度，不影响最终解——前提是流动本身存在定常解。对双时间步进的瞬态求解，物理时间项用二阶格式离散，伪时间用局部时间步加速内迭代：

$$\frac{\partial\phi}{\partial\tau}+\frac{3\phi^{n+1}-4\phi^{n}+\phi^{n-1}}{2\Delta t}+R(\phi^{n+1})=0$$

第二项的系数 $3/2$、$-2$、$1/2$ 来自二阶后向差分，物理时间精度由它决定，与伪时间步无关。

```python
import numpy as np

def stability_limit(scheme, neg_real=True):
    """返回负实轴上的稳定上限 z_min (G(z) 首次离开单位圆)"""
    z = np.linspace(0, -6, 600001)
    if scheme == "EE":   G = 1 + z
    elif scheme == "RK4":G = 1 + z + z**2/2 + z**3/6 + z**4/24
    elif scheme == "BE": G = 1/(1 - z)
    elif scheme == "CN": G = (1 + z/2)/(1 - z/2)
    stable = np.abs(G) <= 1.0 + 1e-12
    return z[stable].min()

for s in ("EE", "RK4"):
    print(s, round(stability_limit(s), 4))
# EE  -2.0      RK4  -2.7853

nu, dx = 1.5e-5, 1.0e-3
lam = -2*nu/dx**2
for s, lim in (("EE", 2.0), ("RK4", 2.7853)):
    print(f"{s}: lambda={lam:.1f} 1/s  dt_max={lim/abs(lam):.4e} s")
# EE:  dt_max=6.6667e-02 s
# RK4: dt_max=9.2843e-02 s
```

### 适用边界

- **刚性比 $\left|\lambda_{\max}/\lambda_{\min}\right|$ 小于 10**：显式格式更划算，隐式解线性系统的代价收不回来；
- **刚性比超过 $10^{4}$**：必须用 L-稳定格式，A-稳定但非 L-稳定的格式会产生不衰减的刚性振荡；
- **需要三阶以上精度**：只能用显式 RK 或隐式 RK（如 Radau IIA），线性多步法受 Dahlquist 障碍限制；
- **本质非定常流动**：伪时间推进只能加速，不能替代物理时间；用稳态求解器求卡门涡街只会得到被耗散抹平的伪定常场。

### 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 刚性模态以 $2\Delta t$ 周期不衰减 | 格式 A-稳定但非 L-稳定（如 CN） | 把格式换成 `backward`，振荡应在一个时间步内消失 |
| RK4 步长超过 9.3e-2 s 后发散 | 越过 $z=-2.785$ 的实轴稳定边界 | 把 $\Delta t$ 除以 2 重跑，若恢复稳定即确认 |
| 隐式格式在低阶下反而更慢 | 刚性比不足以补偿线性求解代价 | 统计每步线性求解耗时占比，> 70 % 说明选错格式 |
| BDF6 在周期流动上发散 | $A(\alpha)$ 稳定域不覆盖接近虚轴的特征值 | 换成 BDF2 重跑，或改用隐式 RK |
| 双时间步进下物理时间精度只有一阶 | 物理时间项用了隐式欧拉而非二阶后向差分 | 检查三项系数是否为 3/2、-2、1/2 |

### 参考文献

1. Dahlquist G., *A special stability problem for linear multistep methods*, BIT Numerical Mathematics, 3(1):27–43, 1963.
2. Gear C.W., *Numerical Initial Value Problems in Ordinary Differential Equations*, Prentice-Hall, 1971.
3. Butcher J.C., *Numerical Methods for Ordinary Differential Equations*, 2nd ed., Wiley, 2008.
4. Jameson A., *Time dependent calculations using multigrid, with applications to unsteady flows past airfoils and wings*, AIAA Paper 91-1596, 1991.

## 工程设置与参数选择

时间离散的工程配置集中在两个文件：`controlDict` 决定步长怎么走，`fvSolution` 决定每一步解到什么程度。两者的取值互相牵制——把 `maxCo` 放大的同时如果不动内迭代次数，多出来的时间误差会被代数误差掩盖，结果既不可信也看不出问题。本文给出从 Courant 数到实际步长的换算，以及一套四工况的内迭代对照设置。

### OpenFOAM 的 Courant 数到底怎么算

`CourantNo.H` 里的定义不是简单的 $u\Delta t/\Delta x$，而是

$$\mathrm{Co}=\frac{\Delta t}{2}\max_{P}\frac{\sum_{f}\left|\phi_f\right|}{V_P},\qquad \phi_f=\mathbf{u}_f\cdot\mathbf{S}_f$$

对一个来流与出流各占一个面的六面体单元，$V_P=\Delta x\,A$，$\sum_f\left|\phi_f\right|=2\left|u\right|A$，代回得

$$\mathrm{Co}=\frac{\Delta t}{2}\cdot\frac{2\left|u\right|A}{\Delta x\,A}=\frac{\left|u\right|\Delta t}{\Delta x}$$

与教科书定义一致。但若单元形状复杂、面数多于 6，OpenFOAM 给出的 $\mathrm{Co}$ 会大于 $\left|u\right|\Delta t/\Delta x$，这一点在多面体网格上必须注意。

手算一次：$u=5\ \mathrm{m/s}$，$\Delta x=2\ \mathrm{mm}=2.0\times10^{-3}\ \mathrm{m}$，取 $\mathrm{maxCo}=1$：

$$\Delta t=\frac{\mathrm{maxCo}\cdot\Delta x}{u}=\frac{1\times2.0\times10^{-3}}{5}=4.0\times10^{-4}\ \mathrm{s}$$

### 自适应步长的增长限幅

`adjustTimeStep yes` 打开后，求解器按上一步的 Courant 数调整步长，同时受两个上限约束：

$$\Delta t_{\text{new}}=\min\left(\Delta t\cdot\min\left(\frac{\mathrm{maxCo}}{\mathrm{Co}},\ 1.2\right),\ \mathrm{maxDeltaT}\right)$$

手算一次增长过程：某步 $\mathrm{Co}=0.4$，$\mathrm{maxCo}=1$，则比值 $1/0.4=2.5$，但被 1.2 的增长率上限截断，于是 $\Delta t_{\text{new}}=1.2\,\Delta t$。若 $\mathrm{Co}=1.3$，比值 $0.769$，则 $\Delta t_{\text{new}}=0.769\,\Delta t$。1.2 这个上限保证步长不会在流场突然变缓时暴涨，避免下一步立刻因 Co 超限而回落形成振荡。

`maxDeltaT` 的作用是给步长封顶，典型取值 0.01 s 到 0.1 s，主要防止长时间稳态阶段步长无限增大导致时间分辨率丢失。

### 完整配置

```cpp
// system/controlDict
application     pimpleFoam;
startTime       0;
endTime         2.0;
deltaT          1e-4;
writeControl    adjustableRunTime;
writeInterval   0.05;
purgeWrite      5;
adjustTimeStep  yes;
maxCo           1.0;
maxAlphaCo      0.5;      // VOF 界面 Courant 数
maxDeltaT       0.01;

// system/fvSchemes
ddtSchemes
{
    default         backward;        // 二阶隐式, L-稳定
}

// system/fvSolution
PIMPLE
{
    nOuterCorrectors     1;
    nCorrectors          2;          // PISO 压力修正次数
    nNonOrthogonalCorrectors 1;
    momentumPredictor    yes;
    correctPhi           yes;
}
solvers
{
    p  { solver GAMG; tolerance 1e-7; relTol 0.01; }
    pFinal { $p; relTol 0; }
    U  { solver smoothSolver; smoother symGaussSeidel; tolerance 1e-8; relTol 0.1; }
    UFinal { $U; relTol 0; }
}
```

`backward` 是二阶且 L-稳定，适合大多数瞬态算例；`CrankNicolson 0.9` 精度相当但刚性模态会残留 $2\Delta t$ 锯齿，只在需要更低的数值耗散时使用。`Euler` 一阶，只用于启动阶段或粗算。

### 四组内迭代对照

| 工况 | ddtSchemes | maxCo | nCorrectors | 观察量 | 判据 |
|---|---|---|---|---|---|
| T0 | backward | 1.0 | 2 | 升力周期均值 | 基准 |
| T1 | backward | 1.0 | 4 | 升力周期均值 | 与 T0 差异 < 0.5 % 则内迭代足够 |
| T2 | backward | 0.5 | 2 | 升力周期均值 | 与 T0 差异 < 1 % 则 Co=1 可接受 |
| T3 | CrankNicolson 0.9 | 1.0 | 2 | 升力周期均值与锯齿幅值 | 锯齿幅值应明显大于 T0 |

T1 与 T2 分别封住两条误差通道：T1 排除代数误差，T2 排除时间离散误差。两者都通过后，T3 的差异才可以归因于时间格式本身的耗散特性。

### 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 步长在两步之间反复涨落 | 增长限幅被移除或 `maxDeltaT` 过小 | 打印步长序列，若呈锯齿则检查 `maxDeltaT` 与 `maxCo` 的比值 |
| `maxCo` 从 1 降到 0.5 结果变化 6 % | 内迭代不足，时间误差与代数误差混叠 | 固定 `maxCo`，把 `nCorrectors` 提到 4 重跑 |
| 界面出现非物理破碎 | VOF 界面 Courant 数超限 | 输出 `maxAlphaCo` 实际值，若 > 0.5 则降低该上限 |
| 稳态阶段步长被 `maxDeltaT` 卡住 | 封顶值设得过小，白白增加步数 | 比较步长序列与 `maxDeltaT`，相等即为被截断 |
| 残差在每步内不下降 | `nCorrectors` 太少或压力容差过松 | 把 `pFinal` 的 `relTol` 设为 0，观察残差是否继续下降 |

### 参考文献

1. Issa R.I., *Solution of the implicitly discretised fluid flow equations by operator-splitting*, Journal of Computational Physics, 62(1):40–65, 1986.
2. Patankar S.V., Spalding D.B., *A calculation procedure for heat, mass and momentum transfer in three-dimensional parabolic flows*, International Journal of Heat and Mass Transfer, 15(10):1787–1806, 1972.
3. Hairer E., Wanner G., *Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems*, 2nd ed., Springer, 1996.
4. OpenFOAM Foundation, *OpenFOAM v11 User Guide*, chapter on time control and `controlDict`, 2023.

## 诊断与可信度验证

时间方向的误差最难诊断，因为它在空间网格不变的情况下不会随迭代次数下降，残差曲线也完全看不出来。真正能区分"物理上确实在演化"和"数值上在漂移"的只有三件事：观测时间阶是否等于格式的名义阶、步长是否还在稳定性域内、刚性模态有没有被正确耗散。

### 指标一：用 Richardson 外推读出观测时间阶

设某个目标量在步长 $\Delta t$、$\Delta t/2$、$\Delta t/4$ 下的解为 $\phi_1,\phi_2,\phi_3$，相邻差作为误差估计：

$$p=\frac{\ln\left(\dfrac{\left\|\phi_1-\phi_2\right\|}{\left\|\phi_2-\phi_3\right\|}\right)}{\ln 2}$$

手算一次。某算例的涡脱频率在三个步长下的解依次为 1.0023 kHz、1.0006 kHz、1.0002 kHz，则相邻差为 $1.7\ \mathrm{Hz}$ 与 $0.4\ \mathrm{Hz}$：

$$p=\frac{\ln\left(1.7/0.4\right)}{\ln 2}=\frac{\ln 4.25}{0.6931}=\frac{1.447}{0.6931}=2.09$$

观测阶 2.09 与二阶格式的名义阶相符，说明时间步已经进入渐近区。若观测阶只有 0.8，先怀疑内迭代没有收敛，而不是怀疑格式。

### 指标二：步长是否还在稳定性域内

显式欧拉推进扩散项，放大因子 $G=1+\lambda\Delta t$，要求 $\left|G\right|\le1$ 即 $\lambda\Delta t\ge-2$。取 $\lambda=-2\nu/\Delta x^{2}$，得到

$$\Delta t\le\frac{\Delta x^{2}}{2\nu}$$

手算：$\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$，$\Delta x=5.0\times10^{-4}\ \mathrm{m}$：

$$\Delta t_{\text{diff}}\le\frac{\left(5.0\times10^{-4}\right)^{2}}{2\times1.5\times10^{-5}}=\frac{2.5\times10^{-7}}{3.0\times10^{-5}}=8.3\times10^{-3}\ \mathrm{s}$$

同一网格上取 $u=1.0\ \mathrm{m/s}$，对流 CFL 限制为

$$\Delta t_{\text{adv}}\le\frac{\Delta x}{u}=\frac{5.0\times10^{-4}}{1.0}=5.0\times10^{-4}\ \mathrm{s}$$

对流限制比扩散紧 17 倍。诊断时如果发现解在 $\Delta t=10^{-3}\ \mathrm{s}$ 附近开始振荡，对应的其实是对流 CFL 被突破（$\mathrm{CFL}=2$），不是扩散不稳定。

### 指标三：刚性模态被耗散还是被保留

Crank–Nicolson 的放大因子是

$$G_{\text{CN}}=\frac{1+\lambda\Delta t/2}{1-\lambda\Delta t/2}$$

当 $\lambda\Delta t\to-\infty$ 时 $G_{\text{CN}}\to-1$：模值趋于 1 且符号交替，意味着刚性模态既不被耗散也不被放大，会以 $2\Delta t$ 周期长期驻留。后向欧拉

$$G_{\text{BE}}=\frac{1}{1-\lambda\Delta t}\xrightarrow{\ \lambda\Delta t\to-\infty\ }0$$

则把刚性模态直接抹掉。这就是 L-稳定性与 A-稳定性的差别：两者都稳定，但只有 L-稳定能抑制刚性振荡。

工程判据：若时间步内 $2\Delta t$ 周期的锯齿在固定位置反复出现、且降低内迭代次数不改变其幅值，就是 CN 的非 L-稳定行为，应改用 `Euler` 或 `backward` 推进启动阶段，或用 `CrankNicolson 0.9` 加上限。

### 区分伪时间残差与物理时间精度

```bash
# 1. 观测时间阶: 三档步长, 同一物理时刻取样
for dt in 1e-3 5e-4 2.5e-4; do
  sed -i "s/^deltaT .*/deltaT ${dt};/" system/controlDict
  ./Allrun
  postProcess -func "probes" -time 0.5 > probe_${dt}.dat
done

# 2. 内迭代是否收敛: 固定步长, 只改 nCorrectors
for nc in 1 2 4; do
  sed -i "s/nCorrectors .*/nCorrectors ${nc};/" system/fvSolution
  ./Allrun && postProcess -func "probes" -time 0.5 > nc_${nc}.dat
done

# 3. 伪时间残差单独观察: 稳态求解器下看 continuity 误差
grep "time step continuity errors" log.run | tail -20
```

第 2 步是关键对照：内迭代从 1 加到 4 后探针值变化小于 0.5 %，说明代数误差已不主导，此时步长研究才有意义。若内迭代次数改变就让结果跳变 5 % 以上，前面做的三档步长比较测的是内迭代残差而不是时间离散误差。

### 诊断量汇总

| 诊断量 | 计算方式 | 合格阈值 | 不合格时的含义 |
|---|---|---|---|
| 观测时间阶 | Richardson 公式 | 与名义阶差 < 0.3 | 未进入渐近区或内迭代不足 |
| 对流 CFL | $u\Delta t/\Delta x$ | $\le1$（显式） | 对流不稳定 |
| 扩散数 | $\nu\Delta t/\Delta x^{2}$ | $\le0.5$ | 扩散不稳定 |
| 内迭代敏感性 | nCorrectors 1→4 的目标量差 | < 0.5 % | 代数误差主导 |
| 刚性模态放大因子 | $\left|G(\lambda\Delta t)\right|$ | 刚性模态应 $\to0$ | 格式非 L-稳定 |
| 周期平均窗口 | 至少 20 个周期 | 统计量漂移 < 1 % | 统计未收敛 |

### 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 目标量以 $2\Delta t$ 周期锯齿 | Crank–Nicolson 非 L-稳定 | 改 `backward` 重跑，锯齿应消失 |
| 观测阶在细步长上掉到 0.5 | 内迭代残差地板高于时间误差 | nCorrectors 翻倍，观测阶应回升 |
| 残差降到 $10^{-6}$ 但探针值持续漂移 | 伪时间收敛不等于物理时间收敛 | 固定内迭代，改步长看探针值是否收敛 |
| $\Delta t$ 减半结果变化 8 % | 仍在稳定性边缘附近 | 计算 CFL 与扩散数，确认哪一个被突破 |
| 稳态求解器给出周期性解 | 流动本质非定常，被伪时间推进掩盖 | 换成瞬态求解器重跑，周期性应更清晰 |

### 参考文献

1. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
2. Oberkampf W.L., Roy C.J., *Verification and Validation in Scientific Computing*, Cambridge University Press, 2010.
3. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E., *Procedure for estimation and reporting of uncertainty due to discretization in CFD applications*, ASME Journal of Fluids Engineering, 130(7):078001, 2008.
4. Richardson L.F., *The approximate arithmetical solution by finite differences of physical problems involving differential equations*, Philosophical Transactions of the Royal Society A, 210:307–357, 1911.
