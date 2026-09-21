---
template_version: "flowlab-knowledge/1.0"
slug: cfd-equations-mass-conservation-modeling
title: "质量守恒与连续性：物理建模与适用边界"
summary: "连续性方程有两个版本：守恒形式与不可压形式。本文推导 Ma² 密度变化判据、给出逐面质量收支容差与声学时间步约束，并用一段 0.2 m × 0.3 m 空气管道算例完成可核对的手算。"
category:
  slug: governing-equations
  name: "控制方程与物理建模"
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "控制方程与物理建模"
  - "质量守恒与连续性"
  - "物理建模与适用边界"
  - "马赫数判据"
  - "质量收支闭合"
seo:
  title: "质量守恒与连续性：物理建模与适用边界"
  description: "连续性方程有两个版本：守恒形式与不可压形式。本文推导 Ma² 密度变化判据、给出逐面质量收支容差与声学时间步约束，并用一段 0.2 m × 0.3 m 空气管道算例完成可核对的手算。"
  keywords:
    - "质量守恒与连续性"
    - "物理建模与适用边界"
    - "马赫数判据"
    - "质量收支闭合"
---

# 质量守恒与连续性：物理建模与适用边界

连续性方程在 CFD 里被写成两个版本：守恒形式 $\partial\rho/\partial t+\nabla\cdot(\rho\mathbf{u})=0$ 与不可压形式 $\nabla\cdot\mathbf{u}=0$。后者不是前者的化简写法，而是"密度沿质点轨迹不变"这一额外假设的推论。一旦局部马赫数超过约 0.3，或密度变化本身就是待求信号（浮力对流、热声、相变质量传递），就必须回到守恒形式。本文给出 Ma² 密度变化判据的推导、逐面质量收支的容差量级、声学时间步约束，并用一段空气管道算例把手算数字核对到小数位。

## 连续性方程的两种写法各自成立在什么条件下

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

## 用 Ma² 判据量化密度变化到底有多大

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

## 逐面质量收支该怎么核、容差取多少

把各边界质量流量求和，定义相对不平衡率

$$
\varepsilon_m = \frac{\left|\dot m_{\mathrm{in}} - \dot m_{\mathrm{out}}\right|}{\dot m_{\mathrm{in}}}
$$

定常计算收敛后，$\varepsilon_m$ 可以做到 $10^{-6}$ 量级（双精度舍入下限），工程验收通常取 $10^{-4}$；若只能做到 $10^{-2}$，说明线性求解容差太松、边界条件自相矛盾，或者根本没收敛。核算时必须逐 patch 列出流量，只报进出口两个数会掩盖其他 patch 上的补偿性误差。

## 声学时间步与对流 CFL 是两套约束

用可压缩或声学求解时，时间步由最快的信号速度决定

$$
\Delta t \le \frac{\Delta x}{|u| + a}
$$

而不可压 PISO 求解只受对流约束 $Co=|u|\Delta t/\Delta x\le 1$（实践中取 0.5 以内），PIMPLE 配合至少 3 次外迭代可以把 Co 放到 5～10。取 $\Delta x=2\ \mathrm{mm}$、$u=15\ \mathrm{m/s}$、$a=343.2\ \mathrm{m/s}$，声学约束给出 $\Delta t\le 0.002/358.2=5.58\ \mu s$；若换成 $Co=0.5$ 的不可压时间步则是 $0.5\times0.002/15=66.7\ \mu s$，相差约 12 倍。这是"算声场"与"只求定常场"在机时上的真实差距。

## 一段可以逐位核对的手算

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

## 失败模式：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差已降到 1e-5，出口浓度仍线性漂移 | 全局质量收支未闭合，误差被组分方程吸收 | 逐 patch 打印体积流量算 $\varepsilon_m$；超过 $10^{-4}$ 即不收敛 |
| 封闭腔内压力随时间单调上升 | 入口给定流量而出口用固定压力，质量只进不出 | 输出总质量 $\sum\rho V$ 随时间曲线，检查是否存在真实出口边界 |
| 低速浮力算例出现高频压力振荡 | 用不可压求解器承载了强密度变化，$\nabla\cdot\mathbf{u}\neq 0$ | 体积分 $\nabla\cdot\mathbf{u}$，若超过 $U/L$ 的 1% 则改用变密度形式 |
| Ma≈0.5 的喷管内激波位置整体偏移 | $\Delta\rho/\rho\approx12.5\%$，不可压假设失效 | 用 $\frac{1}{2}Ma^2$ 估算密度变化，超 5% 即换守恒形式 |
| 加大时间步后质量收支突然恶化 | Co > 1，面通量显式外推失稳 | 打印最大 Co，PISO 下超过 1 就把 $\Delta t$ 减半复算 |

## 参考文献

1. Batchelor G.K., *An Introduction to Fluid Dynamics*, Cambridge University Press, 1967.
2. Landau L.D., Lifshitz E.M., *Fluid Mechanics*, 2nd ed., Pergamon Press, 1987.
3. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
4. The OpenFOAM Foundation, *OpenFOAM User Guide*, The OpenFOAM Foundation, 2023.
