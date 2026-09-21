---
template_version: flowlab-knowledge/1.0
slug: cfd-equations-mass-conservation-modeling
title: 质量守恒与连续性：原理与工程设置
summary: >-
  连续性方程有两个版本：守恒形式与不可压形式。本文推导 Ma² 密度变化判据、给出逐面质量收支容差与声学时间步约束，并用一段 0.2 m × 0.3 m
  空气管道算例完成可核对的手算。
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
  - 质量守恒与连续性
  - 物理建模与适用边界
  - 马赫数判据
  - 质量收支闭合
  - 工程设置与参数选择
  - 通量审计
  - 压力方程
seo:
  title: 质量守恒与连续性：原理与工程设置
  description: >-
    连续性方程有两个版本：守恒形式与不可压形式。本文推导 Ma² 密度变化判据、给出逐面质量收支容差与声学时间步约束，并用一段 0.2 m × 0.3 m
    空气管道算例完成可核对的手算。
  keywords:
    - 质量守恒与连续性
    - 物理建模与适用边界
    - 马赫数判据
    - 质量收支闭合
    - 工程设置与参数选择
    - 通量审计
    - 压力方程
    - 连续性误差
---
# 质量守恒与连续性：原理与工程设置

连续性方程在 CFD 里被写成两个版本：守恒形式 $\partial\rho/\partial t+\nabla\cdot(\rho\mathbf{u})=0$ 与不可压形式 $\nabla\cdot\mathbf{u}=0$。后者不是前者的化简写法，而是"密度沿质点轨迹不变"这一额外假设的推论。一旦局部马赫数超过约 0.3，或密度变化本身就是待求信号（浮力对流、热声、相变质量传递），就必须回到守恒形式。质量守恒在 CFD 里不是一个需要额外施加的约束，而是压力方程的解所要满足的条件；也正因如此，"残差降下去了但流量对不上"是最常见的隐性错误。

## 基础概念与控制关系

### 连续性方程的两种写法各自成立在什么条件下

带质量源项的守恒形式为

$$
\frac{\partial \rho}{\partial t} + \nabla\cdot(\rho\mathbf{u}) = S_m
$$

其中 $S_m$ 的量纲是 $\mathrm{kg/(m^3\cdot s)}$，用于相变、质量注入或化学反应引起的净质量生成。把对流项展开，方程可以改写成随体形式

$$
\frac{1}{\rho}\frac{D\rho}{Dt} = -\nabla\cdot\mathbf{u} + \frac{S_m}{\rho}
$$

右端两项同时为零时才有 $\nabla\cdot\mathbf{u}=0$。注意 $D\rho/Dt=0$ 与"密度处处相同"是两回事：盐度分层水体中密度随深度单调增大，$\partial\rho/\partial z\neq 0$，但每个流体质点沿轨迹保持自身密度，因此仍然满足 $\nabla\cdot\mathbf{u}=0$，用不可压求解器是合法的。反过来，刚性容器中被活塞压缩的气体，密度场一开始是均匀的，却因为 $D\rho/Dt\neq 0$ 而出现非零的速度散度。判断依据应落在随体导数上，而不是落在密度场的空间梯度上。

多组分混合是常被误判的一类。理想气体在等温等压下混合时密度随组分变化，但按质量平均速度定义的速度场仍然满足 $\nabla\cdot\mathbf{u}=0$，原因是扩散通量之和按定义为零。

### 连续性方程的两种形态

守恒形式对所有求解器通用：

$$
\frac{\partial\rho}{\partial t}+\nabla\cdot(\rho\mathbf{u})=S_m
$$

不可压求解器不直接解它，而是把密度移出散度算子，得到运动学约束：

$$
\nabla\cdot\mathbf{u}=0
$$

然后用压力方程强制它成立。压力方程由动量离散的预测量 $\mathbf{HbyA}$ 构造：

$$
\nabla\cdot\left(\frac{1}{a_P}\nabla p\right)=\nabla\cdot\mathbf{HbyA}
$$

$a_P$ 是动量方程的对角系数。压力在这里扮演拉格朗日乘子的角色：它不改变总动量平衡，只负责把速度场投影到散度为零的空间。因此压力方程的收敛程度直接等于质量守恒的满足程度——这是设置时最需要记住的一条因果链。

### 一段可以逐位核对的手算

取矩形管道，截面 0.2 m × 0.3 m，20 ℃、1 atm 空气，物性取 $\rho=1.204\ \mathrm{kg/m^3}$、$\mu=1.825\times10^{-5}\ \mathrm{Pa\cdot s}$、$a=343.2\ \mathrm{m/s}$，平均流速 $U=15\ \mathrm{m/s}$。

流通面积 $A=0.2\times0.3=0.06\ \mathrm{m^2}$，体积流量 $Q=UA=15\times0.06=0.9\ \mathrm{m^3/s}$，质量流量 $\dot m=\rho Q=1.204\times0.9=1.0836\ \mathrm{kg/s}$。马赫数 $Ma=15/343.2=0.0437$，密度相对变化 $0.5\times0.0437^2=9.55\times10^{-4}$，即 0.096%，绝对量 $\Delta\rho=1.204\times9.55\times10^{-4}=0.00115\ \mathrm{kg/m^3}$。水力直径 $D_h=2ab/(a+b)=2\times0.2\times0.3/0.5=0.24\ \mathrm{m}$，雷诺数 $Re=\rho U D_h/\mu=1.204\times15\times0.24/1.825\times10^{-5}=2.375\times10^5$。结论是：该工况用不可压求解器带来的密度误差不足 0.1%，完全在网格离散误差之下。

反过来，如果后处理得到出口质量流量 1.0826 kg/s，则 $\varepsilon_m=(1.0836-1.0826)/1.0836=9.2\times10^{-4}$，比 $10^{-4}$ 的验收线高出一个数量级，应判定为未收敛，而不是"结果看起来合理"。

```python
rho, mu, a = 1.204, 1.825e-5, 343.2     # kg/m3, Pa.s, m/s
A, U = 0.2 * 0.3, 15.0                  # m2, m/s
Dh = 2 * 0.2 * 0.3 / (0.2 + 0.3)        # m
mdot, Ma = rho * U * A, U / a
print(f"mdot={mdot:.4f} kg/s  Ma={Ma:.4f}  "
      f"drho/rho={0.5*Ma**2:.2e}  Re={rho*U*Dh/mu:.3e}")
# mdot=1.0836 kg/s  Ma=0.0437  drho/rho=9.55e-04  Re=2.375e+05
print(f"eps_m={(1.0836-1.0826)/1.0836:.2e}")   # 9.23e-04
```

```bash
# OpenFOAM：逐 patch 取体积流量，再从日志提取连续性误差
postProcess -func "flowRatePatch(name=inlet)"  -latestTime
postProcess -func "flowRatePatch(name=outlet)" -latestTime
grep -a "continuity errors" log.pimpleFoam | tail -5
# 日志三列含义：sum local（局部最大不平衡）/ global（全局净通量）/ cumulative
```

## 适用边界与方案选择

### 用 Ma² 判据量化密度变化到底有多大

等熵关系给出声速与密度的联系

$$
\frac{\mathrm{d}p}{\mathrm{d}\rho} = a^2
$$

忽略损失时动压与密度变化的关系由伯努利式给出 $\Delta p\sim\frac{1}{2}\rho U^2$，代入上式得到

$$
\frac{\Delta\rho}{\rho} \approx \frac{\Delta p}{\rho a^2} \approx \frac{1}{2}\left(\frac{U}{a}\right)^2 = \frac{1}{2}Ma^2
$$

这个二次关系决定了工程上把 Ma 当作可压缩性开关的合理性：Ma = 0.1 时密度变化仅 0.5%，Ma = 0.3 时是 4.5%，Ma = 0.5 时已经到 12.5%，Ma = 0.8 时达到 32%。若把 5% 作为可接受的密度误差上限，允许的最大马赫数是 $Ma=\sqrt{2\times 0.05}=0.316$。判据要用局部最大马赫数而非截面平均，叶顶、缝隙、阀门喉部的 Ma 常比主流高一个量级；热声问题中密度脉动本身就是输出信号，即使 Ma = 0.01 也需用可压缩求解器。

浮力驱动流动有对应的判据。Boussinesq 近似要求 $\beta\Delta T\ll 1$，水的体胀系数在 20 ℃ 附近约为 $2.07\times10^{-4}\ \mathrm{K^{-1}}$，$\Delta T=10\ \mathrm{K}$ 时 $\beta\Delta T=2.07\times10^{-3}$，远小于 1，近似成立；空气在 300 K 时 $\beta\approx 1/T=3.33\times10^{-3}\ \mathrm{K^{-1}}$，$\Delta T=30\ \mathrm{K}$ 就给出 $\beta\Delta T=0.1$，已经处在近似的边缘，需要改用变密度或可压缩形式。

## 工程设置与实施

### 声学时间步与对流 CFL 是两套约束

用可压缩或声学求解时，时间步由最快的信号速度决定

$$
\Delta t \le \frac{\Delta x}{|u| + a}
$$

而不可压 PISO 求解只受对流约束 $Co=|u|\Delta t/\Delta x\le 1$（实践中取 0.5 以内），PIMPLE 配合至少 3 次外迭代可以把 Co 放到 5～10。取 $\Delta x=2\ \mathrm{mm}$、$u=15\ \mathrm{m/s}$、$a=343.2\ \mathrm{m/s}$，声学约束给出 $\Delta t\le 0.002/358.2=5.58\ \mu s$；若换成 $Co=0.5$ 的不可压时间步则是 $0.5\times0.002/15=66.7\ \mu s$，相差约 12 倍。这是"算声场"与"只求定常场"在机时上的真实差距。

### 时间步与柯朗数

瞬态求解应开启自适应时间步，把流场柯朗数压在 1 以下：

$$
\mathrm{Co}=\frac{|\mathbf{u}|\Delta t}{\Delta x}
$$

```
// system/controlDict
adjustTimeStep  yes;
maxCo           0.9;
maxDeltaT       1.0e-03;

// system/fvSolution —— 压力修正次数决定连续性误差
PIMPLE
{
    nOuterCorrectors         2;
    nCorrectors              3;
    nNonOrthogonalCorrectors 1;
}

// system/controlDict —— 逐 patch 记录体积通量，用于质量审计
functions
{
    inletFlow
    {
        type            surfaceFieldValue;
        surfaceFormat   none;
        fields          (phi);
        operation       sum;
        regionType      patch;
        name            inlet;
        writeFields     false;
    }
}
```

`nCorrectors` 是 PISO 的压力修正次数，取 2～3 时连续性误差通常能降到 $10^{-6}$ 量级；取 1 虽然便宜，但 `global` 项往往停留在 $10^{-3}$ 不再下降。`nNonOrthogonalCorrectors` 针对网格非正交性，取值应与最大非正交角挂钩：非正交角小于 $60^\circ$ 取 1 即可，$70^\circ$ 以上建议取 2～3。

### 手算：入口流量与不平衡率

一条圆管水路：密度 $\rho=998.2\ \mathrm{kg/m^3}$（$20\ ^\circ\mathrm{C}$ 水），入口面积 $A=0.01\ \mathrm{m^2}$，入口速度 $U=2.0\ \mathrm{m/s}$。质量流量

$$
\dot m_{\mathrm{in}}=\rho UA=998.2\times2.0\times0.01=19.964\ \mathrm{kg/s}
$$

对应的体积流量 $\dot V=UA=2.0\times0.01=0.02\ \mathrm{m^3/s}$，即 OpenFOAM 中入口 patch 上 $\sum\varphi=+0.02$，出口应为 $-0.02$。

若求解器输出出口质量流量 $19.940\ \mathrm{kg/s}$，不平衡率

$$
\varepsilon_m=\frac{\left|\dot m_{\mathrm{in}}-\dot m_{\mathrm{out}}\right|}{\dot m_{\mathrm{in}}}=\frac{0.024}{19.964}=1.2\times10^{-3}
$$

即 $0.12\%$，对于工程验收偏高，应把 `nCorrectors` 提到 3 并检查出口边界类型。若出口质量流量为 $19.960\ \mathrm{kg/s}$，不平衡率降到 $2.0\times10^{-4}$，即 $0.02\%$，可以接受。

时间步侧核对：单元尺度 $\Delta x=2.0\ \mathrm{mm}$，若手动固定 $\Delta t=1.0\times10^{-3}\ \mathrm{s}$，则 $\mathrm{Co}=2.0\times1.0\times10^{-3}/2.0\times10^{-3}=1.0$，已到上限；开启 `adjustTimeStep` 后求解器会把 $\Delta t$ 压到 $\Delta t=0.9\Delta x/|\mathbf{u}|=0.9\times2.0\times10^{-3}/2.0=9.0\times10^{-4}\ \mathrm{s}$。

顺带核对流动状态：圆管水力直径 $D=\sqrt{4A/\pi}=\sqrt{4\times0.01/\pi}=0.113\ \mathrm{m}$，$20\ ^\circ\mathrm{C}$ 水 $\mu=1.002\times10^{-3}\ \mathrm{Pa\cdot s}$，

$$
Re=\frac{\rho UD}{\mu}=\frac{998.2\times2.0\times0.113}{1.002\times10^{-3}}=2.25\times10^{5}
$$

处于充分湍流区，入口湍流量必须按 $Re$ 与湍流强度给定，否则前几倍管径内的质量分配会偏离。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差已降到 1e-5，出口浓度仍线性漂移 | 全局质量收支未闭合，误差被组分方程吸收 | 逐 patch 打印体积流量算 $\varepsilon_m$；超过 $10^{-4}$ 即不收敛 |
| 封闭腔内压力随时间单调上升 | 入口给定流量而出口用固定压力，质量只进不出 | 输出总质量 $\sum\rho V$ 随时间曲线，检查是否存在真实出口边界 |
| 低速浮力算例出现高频压力振荡 | 用不可压求解器承载了强密度变化，$\nabla\cdot\mathbf{u}\neq 0$ | 体积分 $\nabla\cdot\mathbf{u}$，若超过 $U/L$ 的 1% 则改用变密度形式 |
| Ma≈0.5 的喷管内激波位置整体偏移 | $\Delta\rho/\rho\approx12.5\%$，不可压假设失效 | 用 $\frac{1}{2}Ma^2$ 估算密度变化，超 5% 即换守恒形式 |
| 加大时间步后质量收支突然恶化 | Co > 1，面通量显式外推失稳 | 打印最大 Co，PISO 下超过 1 就把 $\Delta t$ 减半复算 |
| 每步 `global` 连续性误差同号累积 | 压力方程未收敛到容差 | 把 `nCorrectors` 从 2 提到 3，看该项是否降到 $10^{-6}$ |
| 残差很低但出入口流量差 2% | 出口速度用 `fixedValue`，与入口质量流量不匹配 | 逐 patch 对 `phi` 求和并与入口对比 |
| 不可压算例里密度出现 5% 变化 | 马赫数不低，不可压假设已失效 | 计算 $\gamma M^2/2$ 并与容差比较 |
| 局部单元质量不守恒 | 网格非正交度大而修正次数不足 | `nNonOrthogonalCorrectors` 由 1 加到 3，看是否改善 |
| 瞬态解质量随时间缓慢漂移 | 关闭自适应步且柯朗数超过 1 | 监控 `maxCo` 与累计连续性误差 |
| 出入口流量相等但压力场不平 | 压力参考点缺失或与封闭边界冲突 | 检查 `pressureReference` 设置是否与边界类型相容 |

## 验证、验收与复现

### 验收时要留的三条证据

第一条是逐 patch 的体积通量积分，覆盖全部进出口与壁面（壁面应为零），并给出不平衡率的具体数值。第二条是压力方程的最终残差与 `nCorrectors` 的对应关系，用来证明容差不是靠放松换来的。第三条是柯朗数的时间序列，确认整个统计窗口内没有被时间步放大掩盖的局部超限。三条证据都指向同一个物理量——面通量，因此它们可以互相校验：任一条对不上，优先怀疑边界类型而不是数值格式。

### 逐面质量收支该怎么核、容差取多少

把各边界质量流量求和，定义相对不平衡率

$$
\varepsilon_m = \frac{\left|\dot m_{\mathrm{in}} - \dot m_{\mathrm{out}}\right|}{\dot m_{\mathrm{in}}}
$$

定常计算收敛后，$\varepsilon_m$ 可以做到 $10^{-6}$ 量级（双精度舍入下限），工程验收通常取 $10^{-4}$；若只能做到 $10^{-2}$，说明线性求解容差太松、边界条件自相矛盾，或者根本没收敛。核算时必须逐 patch 列出流量，只报进出口两个数会掩盖其他 patch 上的补偿性误差。

## 参考资料

1. Batchelor G.K., *An Introduction to Fluid Dynamics*, Cambridge University Press, 1967.
2. Landau L.D., Lifshitz E.M., *Fluid Mechanics*, 2nd ed., Pergamon Press, 1987.
3. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
4. The OpenFOAM Foundation, *OpenFOAM User Guide*, The OpenFOAM Foundation, 2023.
5. Patankar S.V., Numerical Heat Transfer and Fluid Flow, Hemisphere, 1980.
6. Issa R.I., "Solution of the implicitly discretised fluid flow equations by operator-splitting", Journal of Computational Physics, 62(1), 1986, 40-65.
7. Rhie C.M., Chow W.L., "Numerical study of the turbulent flow past an airfoil with trailing edge separation", AIAA Journal, 21(11), 1983, 1525-1532.
8. Versteeg H.K., Malalasekera W., An Introduction to Computational Fluid Dynamics: The Finite Volume Method, 2nd ed., Pearson, 2007.
