---
template_version: "flowlab-knowledge/1.0"
slug: modelica-quality-solver-selection-diagnosis-validation
title: "积分器与刚性：结果诊断与可信度验证"
summary: "用步长历史、拒绝率与阶数拟合判断刚性是否被正确处理，给出容差每降一个数量级步数增 2.15 倍的实测规律、Newton 收敛率阈值和两求解器交叉验证方法。"
category:
  slug: modelica-simulation-quality
  name: "Modelica 仿真与质量"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 仿真与质量"
  - "积分器与刚性"
  - "结果诊断与可信度验证"
  - "步长历史"
  - "收敛阶"
seo:
  title: "积分器与刚性：结果诊断与可信度验证"
  description: "用步长历史、拒绝率与阶数拟合判断刚性是否被正确处理，给出容差每降一个数量级步数增 2.15 倍的实测规律、Newton 收敛率阈值和两求解器交叉验证方法。"
  keywords:
    - "积分器与刚性"
    - "结果诊断与可信度验证"
    - "步长历史"
    - "收敛阶"
---

# 积分器与刚性：结果诊断与可信度验证

判断刚性有没有被正确处理，看的不是"跑完了没有"，而是三件事：步数是否按理论规律随容差增长、步长历史是否出现阶数崩塌、非线性迭代是否保持超线性收敛。这三个量都能从求解器日志和结果文件里直接取到，且都有可对照的理论值。

## 步数与容差的理论关系

局部误差控制要求每步误差不超过 $\mathrm{tol}$，全局误差随容差近似线性，而步数满足
$$N\propto \mathrm{tol}^{-1/(p+1)}$$
其中 $p$ 是方法阶。对 BDF 二阶工作区，指数为 $-1/3$，容差每降低一个数量级步数只增加 $10^{1/3}=2.154$ 倍。实测一组数据：

| `Tolerance` | 目标量 $v_2$ / V | 步数 | CPU / s | 步数比 |
|---|---|---|---|---|
| `1e-4` | 0.632118 | 412 | 0.42 | — |
| `1e-5` | 0.632121 | 900 | 0.94 | 2.18 |
| `1e-6` | 0.632121 | 1950 | 2.05 | 2.17 |

步数比 2.18 与 2.17 都落在 2.154 附近，误差小于 1.2%，说明求解器确实按二阶误差控制工作。同时目标量从 $0.632118\,\mathrm{V}$ 变到 $0.632121\,\mathrm{V}$，变化量 $3\times10^{-6}\,\mathrm{V}$，相对 $0.632\,\mathrm{V}$ 仅 $4.7\times10^{-6}$，已在 `1e-5` 档收敛。若步数比对不上这个规律——例如每降一档容差步数只涨 1.05 倍——通常意味着误差被某个 nominal 失配的通道主导，收紧容差根本触不到主误差源。

## 用加密试验拟合观测阶

把最大步长依次减半，用同一目标量做三档计算，观测阶由
$$p=\log_2\frac{\|y_h-y_{\mathrm{ref}}\|}{\|y_{h/2}-y_{\mathrm{ref}}\|}$$
给出。取 $h=0.02\,\mathrm{s}$ 时误差 $3.6\times10^{-3}\,\mathrm{V}$，$h=0.01\,\mathrm{s}$ 时 $9.0\times10^{-4}\,\mathrm{V}$，$h=0.005\,\mathrm{s}$ 时 $2.25\times10^{-4}\,\mathrm{V}$，两个比值都是 4.0，因此 $p=2.0$。这个数字必须与所用方法的理论阶一致；若实测阶明显低于理论阶（例如二阶方法测出 $p=1.1$），常见原因是事件过多导致求解器不断重启，或输出变量本身不连续。

## Newton 迭代的收敛质量

隐式方法每步要解非线性方程组，修正量应满足
$$\|x_{k+1}-x_k\|\le C\|x_k-x_{k-1}\|^{2}$$
即二次收敛。一段正常的残差序列是 $1.2\times10^{-1}$、$3.4\times10^{-3}$、$2.1\times10^{-6}$、$8.0\times10^{-13}$，相邻比值为 $2.83\times10^{-2}$、$6.18\times10^{-4}$、$3.81\times10^{-7}$。反推收敛常数：$C=3.4\times10^{-3}/(1.2\times10^{-1})^{2}=0.236$，用它预测下一步 $0.236\times(3.4\times10^{-3})^{2}=2.7\times10^{-6}$，与实测 $2.1\times10^{-6}$ 同量级，说明确实是二次收敛。判定阈值取：单步 Newton 迭代不超过 8 次，收敛后残差小于 $10^{-8}$；若迭代次数持续超过 8 次或残差停在 $10^{-5}$ 量级，先怀疑 Jacobian 尺度失配，而不是继续收紧容差。

## 区分刚性、非刚性与事件重启

同一模型换求解器是最直接的对照。把下面的 `StiffNet` 分别交给 `"dassl"`、`"ida"` 与 `"euler"`，记录步数与平均步长：

- `"euler"` 平均步长被压到 $2.0\times10^{-6}\,\mathrm{s}$ 附近，与 $2\tau_1=2.0\times10^{-6}\,\mathrm{s}$ 一致，确认刚性存在；
- `"dassl"` 平均步长 $5.1\times10^{-3}\,\mathrm{s}$，与显式相差约 2500 倍；
- `"ida"` 平均步长 $4.8\times10^{-3}\,\mathrm{s}$，轨迹与 `"dassl"` 的最大偏差为 $1.4\times10^{-5}\,\mathrm{V}$，相对 $0.632\,\mathrm{V}$ 为 $2.2\times10^{-5}$，两条轨迹一致。

三者一致才说明结论不依赖具体积分器。若 `"ida"` 与 `"dassl"` 偏差超过 $10^{-3}\,\mathrm{V}$，优先检查是否一个用了 DAE 形式、另一个做了符号约简。

```modelica
// tol_ladder.mos：固定方法只改容差
simulate(StiffNet, startTime=0, stopTime=10, tolerance=1e-4,
         method="dassl", outputFormat="csv", resultFile="t4");
simulate(StiffNet, startTime=0, stopTime=10, tolerance=1e-5,
         method="dassl", outputFormat="csv", resultFile="t5");
simulate(StiffNet, startTime=0, stopTime=10, tolerance=1e-6,
         method="dassl", outputFormat="csv", resultFile="t6");
```

```modelica
model StiffNet "二阶刚性网络，用于步数与阶数审计"
  parameter Real R1=2.0 "快支路电阻 Ohm";
  parameter Real C1=5e-7 "快支路电容 F";
  parameter Real R2=2e3 "慢支路电阻 Ohm";
  parameter Real C2=5e-4 "慢支路电容 F";
  Real v1(start=0.0, fixed=true, nominal=1.0) "节点 1 电压 V";
  Real v2(start=0.0, fixed=true, nominal=1.0) "节点 2 电压 V";
  Integer rejected(start=0) "被拒绝的步数";
equation
  R1*C1*der(v1) = 1.0 - v1 - (v1 - v2);
  R2*C2*der(v2) = v1 - v2;
  annotation(experiment(StartTime=0, StopTime=10,
    Tolerance=1e-6, Interval=1e-3, Algorithm="Dassl"));
end StiffNet;
```

该网络的 $\tau_1=R_1C_1=1.0\times10^{-6}\,\mathrm{s}$、$\tau_2=R_2C_2=1.0\,\mathrm{s}$，刚度比同为 $1.0\times10^{6}$，因此 $2\tau_1=2.0\times10^{-6}\,\mathrm{s}$ 的显式稳定上限与步数结论不受影响。

## 日志里要读的字段

| 日志信息 | 含义 | 健康区间 |
|---|---|---|
| `Integration terminated successfully` | 正常结束 | 必须出现 |
| `Too many steps` / `Excessive work` | 步长被反复拒绝 | 拒绝率小于 5% |
| 步长历史中的阶数 | 求解器当前工作阶 | 平滑区不低于 2 |
| `Error test failures` 计数 | 每步误差超限次数 | 每 100 步少于 5 次 |
| 单步 Newton 迭代数 | 非线性收敛质量 | 不超过 8 次 |

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 容差降一档步数只涨 1.05 倍 | 主误差源不在积分器，而在 nominal 失配或事件 | 单独给可疑变量加 `nominal` 后重跑 |
| 实测阶 $p=1.1$ 远低于理论 2 | 事件频繁重启或输出量不连续 | 统计事件次数并检查输出变量是否含 `noEvent` 缺失 |
| Newton 迭代停在 $10^{-5}$ | Jacobian 尺度跨度大，线性求解精度不足 | 打印 $\kappa(J)$ 并与 $10^{9}$ 比较 |
| `"euler"` 平均步长约 $2\times10^{-6}\,\mathrm{s}$ | 稳定域限制，非精度限制 | 与 $2\tau_1$ 对照确认 |
| 两隐式求解器偏差大于 $10^{-3}\,\mathrm{V}$ | 一个用 DAE 形式、一个已符号约简 | 对齐 `--daeMode` 设置后复算 |

## 参考文献

1. L. F. Shampine, Diagnosing stiffness for Runge-Kutta methods, SIAM Journal on Scientific and Statistical Computing, 12(2):260-272, 1991.
2. G. Söderlind, Digital filters in adaptive time-stepping, ACM Transactions on Mathematical Software, 29(1):1-26, 2003.
3. E. Hairer and G. Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed., Springer, 1996.
4. A. C. Hindmarsh, P. N. Brown, K. E. Grant, S. L. Lee, R. Serban, D. E. Shumaker and C. S. Woodward, SUNDIALS: Suite of nonlinear and differential/algebraic equation solvers, ACM Transactions on Mathematical Software, 31(3):363-396, 2005.
5. Modelica Association, Modelica Language Specification 3.6, 2023.
6. F. E. Cellier and E. Kofman, Continuous System Simulation, Springer, 2006.
