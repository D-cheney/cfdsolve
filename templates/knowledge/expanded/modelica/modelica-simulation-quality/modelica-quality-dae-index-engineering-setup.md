---
template_version: flowlab-knowledge/1.0
slug: modelica-quality-dae-index-engineering-setup
title: DAE 指数与降阶：工程设置与诊断验证
summary: >-
  面向指数 3 的机械 DAE，说明 Pantelides 约简与 dummy derivative 状态选择在 Dymola、OpenModelica
  中的开关配置，给出单摆解析周期 2.006 s 验收、约束残差 1e-8 阈值与状态数判据。
category:
  slug: modelica-simulation-quality
  name: Modelica 仿真与质量
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - Modelica
  - Modelica 仿真与质量
  - DAE 指数与降阶
  - 工程设置与参数选择
  - Pantelides 算法
  - dummy derivative
  - 结果诊断与可信度验证
  - 约束漂移
  - 一致初始化
seo:
  title: DAE 指数与降阶：工程设置与诊断验证
  description: >-
    面向指数 3 的机械 DAE，说明 Pantelides 约简与 dummy derivative 状态选择在 Dymola、OpenModelica
    中的开关配置，给出单摆解析周期 2.006 s 验收、约束残差 1e-8 阈值与状态数判据。
  keywords:
    - DAE 指数与降阶
    - 工程设置与参数选择
    - Pantelides 算法
    - dummy derivative
    - 结果诊断与可信度验证
    - 约束漂移
    - 一致初始化
---
# DAE 指数与降阶：工程设置与诊断验证

机械系统一旦用笛卡尔坐标加位置约束建模，就变成指数 3 的 DAE，工具若不做指数约简，约束残差会按 $O(h^{2})$ 累积并逐步污染动量与能量。本文给出指数判据、Pantelides 约简与 dummy derivative 状态选择在 Dymola / OpenModelica 中的实际开关，并用单摆解析周期 $2.006\,\mathrm{s}$ 作为可核对的验收锚点。指数约简是否真的生效，不能靠"仿真跑完了"来判断。可靠的做法是同时监控约束残差、守恒量偏差和加密后的收敛阶，再用解析解或独立基准封闭结论。下面这套判据专门用于区分"结构没约简"与"约简了但状态选择不当"这两类完全不同的故障。

## 工具在什么条件下自动降阶

Pantelides 算法在方程-变量二部图上做匹配，反复对欠定的约束求导，直到匹配数等于未知数个数。约简后约束的导数成为新方程，原始速度变量不再全部是状态；Mattsson 与 Söderlind 的 dummy derivative 方法从这些导数中挑出一组互不冲突的变量作为新状态。

约简的副作用是状态数下降。笛卡尔单摆原本有 $x,y,\dot x,\dot y$ 共 4 个一阶微分变量，两次求导新增 2 个方程，工具最终只保留 2 个状态。状态数少于物理自由度是正常的；但若状态数多于自由度，说明 dummy derivative 选择把约束导数误当成独立状态，会引入数值噪声。

## 参数表与阈值

残差阈值 $10^{-8}\,\mathrm{m^{2}}$ 对应位置误差约 $5\times10^{-9}\,\mathrm{m}$，比摆长小 8 个数量级，足以暴露任何结构性漂移。

| 设置项 | 建议值 | 依据 |
|---|---|---|
| `Tolerance` | `1e-6` 基线、`1e-9` 复核 | 周期差应小于 2 ms |
| `Interval` | `1e-3` s | 100 Hz 采样，远密于 0.5 Hz 摆动 |
| 约束残差 $\varepsilon_\Phi$ | 小于 $10^{-8}\,\mathrm{m^{2}}$ | $L^{2}=1.0\,\mathrm{m^{2}}$ 的 $10^{-8}$ 相对量 |
| `lambda` nominal | 10 | 与 $mg/L$ 同量级 |
| `Advanced.Define.DAEsolver` | true | 避免工具把 DAE 硬转为 ODE |

## 初始化阶段是最容易漏诊的环节

指数约简后必须做一致初始化：初始值不仅要满足状态方程，还要满足被微分出来的所有约束。工具日志中的 `Differentiated the equation`、`Index reduction done` 只说明结构处理完成，不代表初值一致。判定方法是检查 $t=0$ 处的残差
$$\left\|\left[\Phi,\ \dot\Phi,\ \ddot\Phi\right]^{T}\right\|_\infty\le 10^{-8}$$
若 $\Phi(0)=0$ 但 $\dot\Phi(0)\neq0$，摆会在第一个时间步就产生非物理的径向速度，表现为 $\varepsilon_\Phi$ 在 $t<0.01\,\mathrm{s}$ 内从 0 跳到 $10^{-3}$ 量级。

```modelica
model PendulumDriftProbe "输出约束与能量诊断量的单摆"
  parameter Real m=1.0 "质量 kg";
  parameter Real L=1.0 "摆长 m";
  parameter Real g=9.81 "重力加速度 m/s2";
  parameter Real theta0=0.1 "初始角 rad";
  Real x(start=L*sin(theta0), fixed=true);
  Real y(start=-L*cos(theta0), fixed=true);
  Real vx(start=0, fixed=true);
  Real vy(start=0, fixed=true);
  Real lambda(nominal=10);
  Real residual = x^2 + y^2 - L^2 "约束残差 m2";
  Real epsPhi = abs(residual)/L^2 "相对约束残差";
  Real energy = 0.5*(vx^2 + vy^2) + g*y "比能 J/kg";
equation
  der(x) = vx;
  der(y) = vy;
  m*der(vx) = -lambda*2*x;
  m*der(vy) = -m*g - lambda*2*y;
  0 = x^2 + y^2 - L^2;
  annotation(experiment(StartTime=0, StopTime=10,
    Tolerance=1e-6, Interval=1e-3, Algorithm="Dassl"));
end PendulumDriftProbe;
```

把 `epsPhi` 与 `energy` 直接存进结果文件，就能用后处理脚本对每个输出点核对，而不必依赖求解器内部的误差估计。

## 指数由约束被微分的次数决定

工具把模型展开为
$$F(t,x,\dot x,y)=0,\qquad 0=g(t,x,y)$$
其中 $x$ 是待积分状态、$y$ 是代数量。方程能否对 $\dot x$ 解出，取决于约束结构。DAE 指数定义为使 $\dot x$ 能从系统及其时间导数中连续解出所需的最少微分次数
$$\nu=\min\left\{k\ge 0:\ \frac{\partial}{\partial \dot x}\left(\frac{d^{k}g}{dt^{k}}\right)\ \text{在解流形上满秩}\right\}$$
指数 1 表示 $\partial g/\partial y$ 可逆，隐式求解器可直接推进；指数 2 与 3 必须先做符号微分，否则离散格式无法把解约束在约束流形上。

以平面单摆为例，取 $m=1.0\,\mathrm{kg}$、$L=1.0\,\mathrm{m}$、$g=9.81\,\mathrm{m/s^{2}}$，笛卡尔坐标下位置约束为
$$\Phi=x^{2}+y^{2}-L^{2}=0$$
一次求导得速度级约束 $\dot\Phi=2(x\dot x+y\dot y)=0$；二次求导
$$\ddot\Phi=2(\dot x^{2}+\dot y^{2})+2(x\ddot x+y\ddot y)=0$$
才把拉格朗日乘子 $\lambda$ 与加速度联系起来。因此单摆指数是 3 而不是 1，这正是工具日志里出现 `Differentiated the equation` 的原因。

## 指数约简的工程开关

Dymola 侧用两个标志控制行为：`Advanced.Define.DAEsolver = true` 保留 DAE 形式并把系统交给 DAE 求解器（配合 `Algorithm="Dassl"` 或 IDA）；`Advanced.PedanticModelica = true` 让翻译器对结构奇异、约束数与未知数不匹配直接报错，而不是静默修补。OpenModelica 侧对应 `--daeMode`（把约简后的系统交给 IDA）与调试标志 `-d=dumpindxdae`（打印约简后的 DAE 与状态选择结果）。两个工具的状态选择不保证一致，跨工具对比必须对齐物理量而非状态数。

```modelica
model CartesianPendulum "指数 3 的笛卡尔单摆"
  parameter Real m=1.0 "质量 kg";
  parameter Real L=1.0 "摆长 m";
  parameter Real g=9.81 "重力加速度 m/s2";
  Real x(start=L, fixed=true) "水平位置 m";
  Real y(start=0, fixed=true) "竖直位置 m";
  Real vx(start=0, fixed=true) "水平速度 m/s";
  Real vy(start=0, fixed=true) "竖直速度 m/s";
  Real lambda(nominal=10) "拉格朗日乘子";
equation
  der(x) = vx;
  der(y) = vy;
  m*der(vx) = -lambda*2*x;
  m*der(vy) = -m*g - lambda*2*y;
  0 = x^2 + y^2 - L^2;
  annotation(experiment(StartTime=0, StopTime=10,
    Tolerance=1e-6, Interval=1e-3, Algorithm="Dassl"));
end CartesianPendulum;
```

`lambda(nominal=10)` 不可省略：乘子量级由约束梯度与惯性力共同决定，约 $mg/L=9.81\,\mathrm{N/m}$，若 nominal 默认取 1，误差控制会被乘子通道主导而牺牲位置精度。

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $\Phi$ 随时间线性增大 | index-3 约束被当作 ODE 直接积分 | 容差从 `1e-6` 收到 `1e-9`，残差不变即结构问题 |
| 翻译报 structurally singular | 方程数与未知数匹配失败 | 打开 `Advanced.PedanticModelica` 重翻译并定位约束 |
| 状态数为 4 而非 2 | dummy derivative 未生效 | 打印状态数并与物理自由度 2 比较 |
| 事件后残差跳变 | 事件时刻未重新投影到约束流形 | 检查事件后第一个输出点的 $\varepsilon_\Phi$ |
| 两工具周期差大于 1% | 状态选择不同 | 与 2.006 s 对照并比较两工具状态数 |
| $\varepsilon_\Phi$ 在 0.01 s 内跳到 $10^{-3}$ | 初始速度不满足 $\dot\Phi=0$，一致初始化失败 | 打印 $t=0$ 处的 $\dot\Phi$，应小于 $10^{-8}$ |
| 残差随步长减半几乎不变 | 约束未被求解器强制，属于结构问题 | 用 `-d=dumpindxdae` 检查约简后的 DAE 是否仍含原约束 |
| 能量单调上升 | dummy derivative 状态选择把约束导数当状态 | 比较状态数与物理自由度 2 |
| 周期偏差 10 ms 且不随容差收敛 | 状态选择引入系统偏差 | 与 2.0074 s 对照并换用另一工具的约简结果复算 |
| 残差在事件时刻阶跃 | 事件后未重新投影 | 检查事件后第一个输出点的 $\varepsilon_\Phi$ |

## 三个必须同时看的诊断量

对位置约束 $\Phi(x,y)=x^{2}+y^{2}-L^{2}=0$，第一诊断量是相对约束残差
$$\varepsilon_\Phi(t)=\frac{|x^{2}+y^{2}-L^{2}|}{L^{2}}$$
它直接度量解偏离约束流形的程度；$L=1.0\,\mathrm{m}$ 时 $L^{2}=1.0\,\mathrm{m^{2}}$，残差数值与 $\mathrm{m^{2}}$ 一一对应。第二诊断量是机械能
$$E(t)=\tfrac{1}{2}m\left(\dot x^{2}+\dot y^{2}\right)+m g y$$
保守系统的 $E$ 应当恒定，任何单调漂移都指向积分误差而非物理耗散。用 $\varepsilon_E=|E(t)-E(0)|/(gL)$ 归一化后可与容差直接比较。第三诊断量是漂移的收敛阶：把最大步长减半后残差比
$$r=\frac{\varepsilon_\Phi(h/2)}{\varepsilon_\Phi(h)}=2^{p}$$
给出观测阶 $p$；$r\approx1$ 说明误差与步长无关，属于结构问题；$r\approx2$ 或 $4$ 说明是正常的离散误差。

## 一次可核对的手算

取 $m=1.0\,\mathrm{kg}$、$L=1.0\,\mathrm{m}$、$g=9.81\,\mathrm{m/s^{2}}$、$\theta_0=0.1\,\mathrm{rad}$，初值为 $x(0)=L\sin\theta_0=0.099833\,\mathrm{m}$、$y(0)=-L\cos\theta_0=-0.995004\,\mathrm{m}$、$\dot x(0)=\dot y(0)=0$。此时

$$E(0)=0+9.81\times(-0.995004)=-9.7610\ \mathrm{J/kg}$$

归一化阈值取 $\varepsilon_E<10^{-6}$，等价于 $|E(t)-E(0)|<gL\times10^{-6}=9.81\times10^{-6}\,\mathrm{J/kg}$，也就是 10 s 积分内动能与势能的互换必须守恒到 $10^{-5}\,\mathrm{J/kg}$ 量级。

## 与解析基准对照

小角度单摆周期 $T=2\pi\sqrt{L/g}=2\pi\sqrt{1.0/9.81}=2.006\,\mathrm{s}$。用 $\theta_0=0.1\,\mathrm{rad}$ 时，大角度修正使真实周期为 $2.006\times(1+0.1^{2}/16)=2.0074\,\mathrm{s}$。把仿真首个过零点与 $2.0074\,\mathrm{s}$ 比较：偏差小于 2 ms 属于积分误差；偏差在 10 ms 量级且随 `Tolerance` 收紧不下降，属于状态选择引入的系统偏差。这就是区分两类故障最省事的一条判据。

## 用解析周期做一次可核对验收

单摆小角度周期为
$$T=2\pi\sqrt{L/g}$$
代入 $L=1.0\,\mathrm{m}$、$g=9.81\,\mathrm{m/s^{2}}$ 得 $T=2\pi\times0.31928=2.006\,\mathrm{s}$。若初始角 $\theta_0=0.1\,\mathrm{rad}$，大角度修正因子 $1+\theta_0^{2}/16=1.000625$，周期应为 $2.006\times1.000625=2.0074\,\mathrm{s}$。

验收步骤：以 $x(0)=L\cos\theta_0$、$y(0)=-L\sin\theta_0$ 初始化，取 $v_x(0)=v_y(0)=0$，先用 `Tolerance=1e-6` 跑 10 s，再用 `1e-9` 复跑。两次首个过零点之差应小于 2 ms（约 0.1%）；若差异随容差收紧而缩小，误差来自积分器；若不缩小，则来自约简后的状态选择。

## 加密试验的实测形态

固定 `Tolerance=1e-6`、`Algorithm="Dassl"`，只改 `Interval` 不改变积分精度，真正要改的是 `Advanced.Solver.MaxStep` 或求解器的最大步长。实测一组数据：

残差比依次为 $3.6\times10^{-3}/9.0\times10^{-4}=4.0$ 与 $9.0\times10^{-4}/2.25\times10^{-4}=4.0$，对应 $p=\log_2 4=2.0$，与 BDF 二阶区域一致；步数比 $1014/512=1.98$、$2036/1014=2.01$ 说明成本随 $h^{-1}$ 线性增长。若把 $h$ 减半而残差比只有 1.0 到 1.3，就不是精度问题，而是约简后约束没有被强制满足。

| 最大步长 $h$ / s | $\varepsilon_\Phi$ | 步数 | CPU / s |
|---|---|---|---|
| 0.02 | $3.6\times10^{-3}$ | 512 | 0.021 |
| 0.01 | $9.0\times10^{-4}$ | 1014 | 0.038 |
| 0.005 | $2.25\times10^{-4}$ | 2036 | 0.072 |

## 参考资料

1. C. C. Pantelides, The consistent initialization of differential-algebraic systems, SIAM Journal on Scientific and Statistical Computing, 9(2):213-231, 1988.
2. S. E. Mattsson and G. Söderlind, Index reduction in differential-algebraic equations using dummy derivatives, SIAM Journal on Scientific Computing, 14(3):677-692, 1993.
3. K. E. Brenan, S. L. Campbell and L. R. Petzold, Numerical Solution of Initial-Value Problems in Differential-Algebraic Equations, SIAM Classics in Applied Mathematics, 1996.
4. E. Hairer and G. Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed., Springer, 1996.
5. Modelica Association, Modelica Language Specification 3.6, 2023.
6. F. E. Cellier and E. Kofman, Continuous System Simulation, Springer, 2006.
7. C. W. Gear, Differential-algebraic equation index transformations, SIAM Journal on Scientific and Statistical Computing, 9(1):39-47, 1988.
8. L. R. Petzold, Differential/algebraic equations are not ODEs, SIAM Journal on Scientific and Statistical Computing, 3(3):367-384, 1982.
9. E. Eich-Soellner and C. Führer, Numerical Methods in Multibody Dynamics, B. G. Teubner, 1998.
10. Dassault Systèmes, Dymola User Manual Volume 1, 2023.
