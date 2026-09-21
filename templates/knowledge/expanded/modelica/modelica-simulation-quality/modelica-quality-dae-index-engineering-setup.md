---
template_version: "flowlab-knowledge/1.0"
slug: modelica-quality-dae-index-engineering-setup
title: "DAE 指数与降阶：工程设置与参数选择"
summary: "面向指数 3 的机械 DAE，说明 Pantelides 约简与 dummy derivative 状态选择在 Dymola、OpenModelica 中的开关配置，给出单摆解析周期 2.006 s 验收、约束残差 1e-8 阈值与状态数判据。"
category:
  slug: modelica-simulation-quality
  name: "Modelica 仿真与质量"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 仿真与质量"
  - "DAE 指数与降阶"
  - "工程设置与参数选择"
  - "Pantelides 算法"
  - "dummy derivative"
seo:
  title: "DAE 指数与降阶：工程设置与参数选择"
  description: "面向指数 3 的机械 DAE，说明 Pantelides 约简与 dummy derivative 状态选择在 Dymola、OpenModelica 中的开关配置，给出单摆解析周期 2.006 s 验收、约束残差 1e-8 阈值与状态数判据。"
  keywords:
    - "DAE 指数与降阶"
    - "工程设置与参数选择"
    - "Pantelides 算法"
    - "dummy derivative"
---

# DAE 指数与降阶：工程设置与参数选择

机械系统一旦用笛卡尔坐标加位置约束建模，就变成指数 3 的 DAE，工具若不做指数约简，约束残差会按 $O(h^{2})$ 累积并逐步污染动量与能量。本文给出指数判据、Pantelides 约简与 dummy derivative 状态选择在 Dymola / OpenModelica 中的实际开关，并用单摆解析周期 $2.006\,\mathrm{s}$ 作为可核对的验收锚点。

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

## 工具在什么条件下自动降阶

Pantelides 算法在方程-变量二部图上做匹配，反复对欠定的约束求导，直到匹配数等于未知数个数。约简后约束的导数成为新方程，原始速度变量不再全部是状态；Mattsson 与 Söderlind 的 dummy derivative 方法从这些导数中挑出一组互不冲突的变量作为新状态。

约简的副作用是状态数下降。笛卡尔单摆原本有 $x,y,\dot x,\dot y$ 共 4 个一阶微分变量，两次求导新增 2 个方程，工具最终只保留 2 个状态。状态数少于物理自由度是正常的；但若状态数多于自由度，说明 dummy derivative 选择把约束导数误当成独立状态，会引入数值噪声。

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

## 用解析周期做一次可核对验收

单摆小角度周期为
$$T=2\pi\sqrt{L/g}$$
代入 $L=1.0\,\mathrm{m}$、$g=9.81\,\mathrm{m/s^{2}}$ 得 $T=2\pi\times0.31928=2.006\,\mathrm{s}$。若初始角 $\theta_0=0.1\,\mathrm{rad}$，大角度修正因子 $1+\theta_0^{2}/16=1.000625$，周期应为 $2.006\times1.000625=2.0074\,\mathrm{s}$。

验收步骤：以 $x(0)=L\cos\theta_0$、$y(0)=-L\sin\theta_0$ 初始化，取 $v_x(0)=v_y(0)=0$，先用 `Tolerance=1e-6` 跑 10 s，再用 `1e-9` 复跑。两次首个过零点之差应小于 2 ms（约 0.1%）；若差异随容差收紧而缩小，误差来自积分器；若不缩小，则来自约简后的状态选择。

## 参数表与阈值

| 设置项 | 建议值 | 依据 |
|---|---|---|
| `Tolerance` | `1e-6` 基线、`1e-9` 复核 | 周期差应小于 2 ms |
| `Interval` | `1e-3` s | 100 Hz 采样，远密于 0.5 Hz 摆动 |
| 约束残差 $\varepsilon_\Phi$ | 小于 $10^{-8}\,\mathrm{m^{2}}$ | $L^{2}=1.0\,\mathrm{m^{2}}$ 的 $10^{-8}$ 相对量 |
| `lambda` nominal | 10 | 与 $mg/L$ 同量级 |
| `Advanced.Define.DAEsolver` | true | 避免工具把 DAE 硬转为 ODE |

残差阈值 $10^{-8}\,\mathrm{m^{2}}$ 对应位置误差约 $5\times10^{-9}\,\mathrm{m}$，比摆长小 8 个数量级，足以暴露任何结构性漂移。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $\Phi$ 随时间线性增大 | index-3 约束被当作 ODE 直接积分 | 容差从 `1e-6` 收到 `1e-9`，残差不变即结构问题 |
| 翻译报 structurally singular | 方程数与未知数匹配失败 | 打开 `Advanced.PedanticModelica` 重翻译并定位约束 |
| 状态数为 4 而非 2 | dummy derivative 未生效 | 打印状态数并与物理自由度 2 比较 |
| 事件后残差跳变 | 事件时刻未重新投影到约束流形 | 检查事件后第一个输出点的 $\varepsilon_\Phi$ |
| 两工具周期差大于 1% | 状态选择不同 | 与 2.006 s 对照并比较两工具状态数 |

## 参考文献

1. C. C. Pantelides, The consistent initialization of differential-algebraic systems, SIAM Journal on Scientific and Statistical Computing, 9(2):213-231, 1988.
2. S. E. Mattsson and G. Söderlind, Index reduction in differential-algebraic equations using dummy derivatives, SIAM Journal on Scientific Computing, 14(3):677-692, 1993.
3. K. E. Brenan, S. L. Campbell and L. R. Petzold, Numerical Solution of Initial-Value Problems in Differential-Algebraic Equations, SIAM Classics in Applied Mathematics, 1996.
4. E. Hairer and G. Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed., Springer, 1996.
5. Modelica Association, Modelica Language Specification 3.6, 2023.
6. F. E. Cellier and E. Kofman, Continuous System Simulation, Springer, 2006.
