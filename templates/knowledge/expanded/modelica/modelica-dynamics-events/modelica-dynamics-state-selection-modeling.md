---
template_version: "flowlab-knowledge/1.0"
slug: modelica-dynamics-state-selection-modeling
title: "状态选择与 StateSelect：物理建模与适用边界"
summary: "解释 Modelica 工具如何从 DAE 中自动挑选状态变量、指数约简要微分几次约束，以及 StateSelect 四档位对应的代价模型；用带减速比的转动惯量算例给出等效惯量与条件数的可核对计算。"
category:
  slug: modelica-dynamics-events
  name: "Modelica 动态、初始化与事件"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 动态、初始化与事件"
  - "状态选择与 StateSelect"
  - "物理建模与适用边界"
  - "指数约简"
  - "虚拟导数"
seo:
  title: "状态选择与 StateSelect：物理建模与适用边界"
  description: "解释 Modelica 工具如何从 DAE 中自动挑选状态变量、指数约简要微分几次约束，以及 StateSelect 四档位对应的代价模型；用带减速比的转动惯量算例给出等效惯量与条件数的可核对计算。"
  keywords:
    - "状态选择与 StateSelect"
    - "物理建模与适用边界"
    - "指数约简"
    - "虚拟导数"
    - "StateSelect.always"
---

# 状态选择与 StateSelect：物理建模与适用边界

Modelica 模型在翻译期是一组微分代数方程，状态变量由工具自动挑选而非由作者声明。选择不唯一，不同选择给出数学等价但数值性质迥异的两组 ODE。StateSelect 是作者对这个选择过程的唯一干预手段，用错方向会直接导致病态 Jacobian 或结构奇异。

## 状态由工具从 DAE 里挑，不是你声明的

在 Modelica 中写 `der(x)` 并不保证 $x$ 成为状态。工具先做方程排序与结构分析，确定哪些变量必须由积分求出、哪些可以由代数方程求出。当某个变量有多条路径可以求解时，就出现自由度，状态集在此处由 `StateSelect` 的偏好排序决定。

这条规则的实际后果是：同一个模型在不同工具下可能得到不同数量的状态，进而得到不同的初始化方程组。若你依赖"状态数等于 `der()` 出现次数"来推方程计数，跨工具复现时就会出错。

## 指数约简要微分几次约束

带位置约束的机械系统是典型高指数 DAE。约束

$$ \mathbf{c}\big(\mathbf{x}\big)=\mathbf{0},\qquad \mathbf{J}_c(\mathbf{x})\,\dot{\mathbf{x}}=\mathbf{0} $$

其中 $\mathbf{J}_c = \partial \mathbf{c}/\partial \mathbf{x}$。对约束微分一次得到速度层关系，微分两次才得到含加速度的、能解出约束力的方程。微分次数就是指数，也是工具做 Pantelides 指数约简的依据。约简后引入的"虚拟导数"变量（dummy derivative）并不是真实状态，它的初值必须由约束方程确定，这正是这类模型初始化方程数偏多的原因。

以平面摆的笛卡尔坐标写法为例：摆长 $L = 0.5\ \mathrm{m}$、$g = 9.81\ \mathrm{m/s^2}$，小角度固有角频率 $\omega = \sqrt{g/L} = \sqrt{19.62} = 4.429\ \mathrm{rad/s}$，周期 $T = 2\pi/\omega = 1.419\ \mathrm{s}$。解析解存在，但笛卡尔写法下 $x$、$y$ 受约束耦合，工具会先把 $x^2+y^2=L^2$ 微分两次。约简后约束只在积分容差内成立，$L = 0.5\ \mathrm{m}$ 上的漂移量随 `Tolerance` 线性增长：`Tolerance = 1e-6` 跑 10 s 后漂移约 $10^{-4}\ \mathrm{m}$，这正是需要周期性投影或改用极坐标写法的判据。

## StateSelect 的四个档位

四个枚举值构成一个偏好序：`never` < `avoid` < `default` < `prefer` < `always`。工具在候选集合上求解一个最小代价的指派问题，把每个变量的档位折算成权重，选出代价最低的状态集。

- `always`：该变量必须成为状态，否则报结构奇异。用于你必须输出其积分轨迹的量。
- `prefer`：尽量选它，但不强求。用于数值性质更好的那一组变量。
- `never`：禁止选它。用于由其他状态代数决定的冗余量。
- `default`：不表态，交给工具。

两个常见误用：把 `always` 加在一个实际由代数方程确定的量上（例如已经由减速比与另一个角位移绑定的输出轴角度），工具会报 `Structurally singular system` 或 `The following variables are forced to be states but cannot`；把候选变量全部标成 `never`，则报无可用状态集。

## 双惯量减速器：等效惯量与条件数

考虑电机惯量 $J_1 = 0.5\ \mathrm{kg\cdot m^2}$ 经减速比 $r = 5$ 驱动负载 $J_2 = 0.02\ \mathrm{kg\cdot m^2}$，刚性连接，负载侧恒转矩 $\tau = 2.0\ \mathrm{N\cdot m}$。折算到电机侧的等效惯量为

$$ J_{eff}=J_1+r^2J_2=0.5+25\times0.02=1.0\ \mathrm{kg\cdot m^2} $$

电机角加速度 $\dot\omega_1 = \tau/J_{eff} = 2.0/1.0 = 2.0\ \mathrm{rad/s^2}$。从静止积分 $t = 1.0\ \mathrm{s}$：$\omega_1 = 2.0\ \mathrm{rad/s}$、$\varphi_1 = 1.0\ \mathrm{rad}$，负载侧 $\omega_2 = r\,\omega_1 = 10.0\ \mathrm{rad/s}$、$\varphi_2 = 5.0\ \mathrm{rad}$。这四个数可以直接当验收值。

若把状态选在负载侧，等效惯量写成 $J_2 + J_1/r^2 = 0.02 + 0.02 = 0.04\ \mathrm{kg\cdot m^2}$，物理结果不变，但两个公式的条件数相差 $r^2 = 25$ 倍。把减速比换成 $r = 50$，$J_{eff} = 0.5 + 2500\times0.02 = 50.5\ \mathrm{kg\cdot m^2}$，两种写法的比值放大到 2500——此时选错状态的代价从"稍微不准"变成"容差必须收紧四个数量级"。

```modelica
model GearInertia
  parameter Real J1 = 0.5, J2 = 0.02, r = 5.0, tau = 2.0;
  Real phi1(start = 0, fixed = true, stateSelect = StateSelect.prefer);
  Real w1(start = 0, fixed = true);
  Real phi2(stateSelect = StateSelect.never);
  Real w2;
equation
  der(phi1) = w1;
  phi2 = r*phi1;
  w2 = r*w1;
  (J1 + r^2*J2)*der(w1) = tau;
  annotation(experiment(StopTime = 1.0, Tolerance = 1e-6, Interval = 1e-3));
end GearInertia;
```

`phi2` 标 `never` 是安全的：它由 `r*phi1` 唯一确定，作为状态只会增加一个恒等约束并让初始化多出一条冗余方程。`phi1` 标 `prefer` 则是在两个候选之间表明立场——若把它换成 `always`，工具在遇到减速比为零的退化工况时会直接报错而不是自动切换。

## 选错状态的失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `Structurally singular system` | 对代数确定量用了 `StateSelect.always` | 把该变量改为 `never`，看是否恢复 |
| 换减速比后结果偏差放大 25 倍 | 状态选在负载侧，$r^2$ 进入病态项 | 对比 $r = 5$ 与 $r = 50$ 两档的收敛步数 |
| 初始化方程数比预期多 2 条 | 虚拟导数的初值约束被重复计入 | 打印状态数与初始方程数，逐条对照约束 |
| 约束漂移超过 1e-4 m | 指数约简后未做投影 | 输出 $\|x^2+y^2-L^2\|$ 随时间的曲线 |
| 不同工具给出不同状态数 | 候选集合相同但档位权重不同 | 固定全部 `StateSelect` 取值后重新交叉验证 |

## 什么情况下不该干预

如果模型只有一组状态候选（每个 `der` 对应的变量都无歧义），写 `StateSelect` 只会增加噪声。只有在以下三种情形才值得显式标注：候选变量之间存在 $10^2$ 以上的尺度差；某个量必须作为输出被连续积分；某个量在退化工况下会失去物理意义（例如减速比趋于零时的负载角位移）。这三种情形的共同点是"选择影响数值结果或求解可行性"，其余场合让工具用默认策略即可。

## 参考文献

1. Modelica Association. *Modelica Language Specification, Version 3.6*. Section 8.4 "State Selection" and Section 4.8 "StateSelect", 2023.
2. Pantelides, C. C. "The consistent initialization of differential-algebraic systems." *SIAM J. Sci. Stat. Comput.*, 9(2):213–231, 1988.
3. Mattsson, S. E., Söderlind, G. "Index reduction in differential-algebraic equations using dummy derivatives." *SIAM Journal on Scientific Computing*, 14(3):677–692, 1993.
4. Cellier, F. E., Kofman, E. *Continuous System Simulation*. Springer, 2006.
5. Fritzson, P. *Principles of Object-Oriented Modeling and Simulation with Modelica 3.3*. Wiley-IEEE Press, 2015.
6. Hairer, E., Wanner, G. *Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems*. 2nd ed., Springer, 1996.
7. Modelica Association. *Modelica Standard Library 4.0.0*, package `Modelica.Mechanics.Rotational.Components`.
