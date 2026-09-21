---
template_version: "flowlab-knowledge/1.0"
slug: modelica-quality-solver-selection-engineering-setup
title: "积分器与刚性：工程设置与参数选择"
summary: "由特征值比与显式稳定域反推刚性问题需要多少步，用 1e6 刚度比算例对比 DASSL、IDA、CVODE 与显式方法的步数与 CPU，并给出 Dymola、OpenModelica 的求解器配置写法。"
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
  - "积分器与刚性"
  - "工程设置与参数选择"
  - "BDF"
  - "A-稳定"
seo:
  title: "积分器与刚性：工程设置与参数选择"
  description: "由特征值比与显式稳定域反推刚性问题需要多少步，用 1e6 刚度比算例对比 DASSL、IDA、CVODE 与显式方法的步数与 CPU，并给出 Dymola、OpenModelica 的求解器配置写法。"
  keywords:
    - "积分器与刚性"
    - "工程设置与参数选择"
    - "BDF"
    - "A-稳定"
---

# 积分器与刚性：工程设置与参数选择

刚性不是模型的属性，而是模型时间常数谱与积分方法稳定域之间的关系。同一个 RC 网络在显式方法下需要 $5\times10^{6}$ 步，在隐式 BDF 下只要 $10^{4}$ 步，差距全部来自稳定域而非精度要求。本文给出刚性判据、显式步长上限的算法，以及 Dymola 与 OpenModelica 中求解器字符串的实际写法。

## 用特征值比定量判定刚性

线性化后 $\dot x=Jx$ 的特征值给出全部时间尺度，刚度比定义为
$$S=\frac{|\lambda_{\max}|}{|\lambda_{\min}|}$$
工程上 $S>10^{3}$ 就应按刚性问题处理，$S>10^{6}$ 时显式方法基本不可用。对一阶 RC 环节 $\tau=RC$，特征值为 $\lambda=-1/(RC)$，于是 $S=\tau_{\max}/\tau_{\min}$，直接用参数就能算出，不必先做数值线性化。

## 显式方法的步长上限是硬约束

显式 Euler 的稳定条件是 $|1+h\lambda|\le1$，对实负特征值给出
$$h_{\max}=\frac{2}{|\lambda_{\max}|}=2\tau_{\min}$$
这个上限与精度无关：即使物理量在 $10\,\mathrm{s}$ 内几乎不变，显式方法仍被最快模态锁死在 $h\le2\tau_{\min}$。A-稳定的隐式 BDF 没有这个限制，步长由误差控制决定，因此能跨越三个数量级以上的尺度差。

## 一个可以手算的刚性网络

取快支路 $R_1=1.0\,\Omega$、$C_1=1.0\times10^{-6}\,\mathrm{F}$，慢支路 $R_2=1.0\times10^{3}\,\Omega$、$C_2=1.0\times10^{-3}\,\mathrm{F}$：

- 快时间常数 $\tau_1=R_1C_1=1.0\times10^{-6}\,\mathrm{s}$，$\lambda_{\max}=-1.0\times10^{6}\,\mathrm{s^{-1}}$；
- 慢时间常数 $\tau_2=R_2C_2=1.0\,\mathrm{s}$，$\lambda_{\min}=-1.0\,\mathrm{s^{-1}}$；
- 刚度比 $S=1.0\times10^{6}$。

显式 Euler 的上限 $h\le2\times10^{-6}\,\mathrm{s}$，积分 $10\,\mathrm{s}$ 需要 $5\times10^{6}$ 步。隐式 BDF 在 `Tolerance=1e-6` 下平均步长约 $1.0\times10^{-3}\,\mathrm{s}$，只需约 $1.0\times10^{4}$ 步，步数比 500:1。若显式每步 $1.0\,\mu\mathrm{s}$、隐式每步 $10\,\mu\mathrm{s}$（含 Jacobian 与线性求解），总时间分别是 $5.0\,\mathrm{s}$ 与 $0.10\,\mathrm{s}$，实际加速 50 倍——步数优势被单步成本部分抵消，这正是选择求解器时必须一起看的两个量。

```modelica
model StiffRC "刚性双时间尺度 RC 网络"
  parameter Real R1=1.0 "快支路电阻 Ohm";
  parameter Real C1=1e-6 "快支路电容 F";
  parameter Real R2=1e3 "慢支路电阻 Ohm";
  parameter Real C2=1e-3 "慢支路电容 F";
  Real v1(start=0.0, fixed=true, nominal=1.0);
  Real v2(start=0.0, fixed=true, nominal=1.0);
  constant Real u=1.0;
equation
  R1*C1*der(v1) = u - v1 - (v1 - v2);
  R2*C2*der(v2) = v1 - v2;
  annotation(experiment(StartTime=0, StopTime=10,
    Tolerance=1e-6, Interval=1e-3, Algorithm="Dassl"));
end StiffRC;
```

## 工具里的求解器名称并不通用

`annotation(experiment(...))` 中的 `Algorithm` 字符串由工具解释，跨工具迁移必须改写。常用对应关系如下。

| 求解器字符串 | 类型 | 阶 | 适用 |
|---|---|---|---|
| `"Dassl"` / `"dassl"` | BDF 变阶变步长 | 1 到 5 | 通用刚性 DAE，默认首选 |
| `"Cvode"` / `"cvode"` | BDF 或 Adams 切换 | 1 到 5 | 刚性 ODE，支持稠密输出 |
| `"ida"` / `"IDA"` | BDF，DAE 形式 | 1 到 5 | index-1 DAE、`--daeMode` |
| `"Radau5"` / `"radau"` | 隐式 Runge-Kutta | 5 | 极高精度、需 A-稳定 |
| `"Euler"` / `"euler"` | 显式 | 1 | 教学与非刚性短时验证 |
| `"Dopri45"` / `"dopri45"` | 显式嵌入式 | 5 | 非刚性、事件密集 |

OpenModelica 用脚本批量对比时写成 `.mos`：

```modelica
// stiff.mos
simulate(StiffRC, startTime=0, stopTime=10, tolerance=1e-6,
         method="dassl", outputFormat="csv", resultFile="stiff_dassl");
simulate(StiffRC, startTime=0, stopTime=10, tolerance=1e-6,
         method="ida", outputFormat="csv", resultFile="stiff_ida");
simulate(StiffRC, startTime=0, stopTime=10, tolerance=1e-6,
         method="euler", outputFormat="csv", resultFile="stiff_euler");
```

Dymola 侧对应 `simulateModel("StiffRC", startTime=0, stopTime=10, tolerance=1e-6, method="Dassl", resultFile="stiff_dassl")`。切换 `method` 前先确认模型已做指标约简，否则 DAE 求解器可能直接报一致初始化失败。

## 配置清单与阈值

| 项目 | 取值 | 判据 |
|---|---|---|
| 刚度比 $S$ | 大于 $10^{3}$ 用隐式 | 由 $\tau_{\max}/\tau_{\min}$ 直接算 |
| `Tolerance` | `1e-6` 起步 | 与物理量 nominal 匹配 |
| 显式方法 `MaxStep` | 小于 $2\tau_{\min}$ | 否则数值发散 |
| 隐式方法 `MaxStep` | 小于 $0.1\tau_{\min}$ 无意义 | 精度由容差控制，不由步长上限控制 |
| 输出间隔 | `1e-3` s | 只影响采样密度，不提高精度 |

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 显式方法步数达 $10^{6}$ 量级 | 稳定域被 $\tau_1=1.0\times10^{-6}\,\mathrm{s}$ 限制 | 换 `"Dassl"` 后步数应降到 $10^{4}$ 量级 |
| 隐式方法报一致初始化失败 | 未约简的 DAE 直接交给 IDA | 打开 `--daeMode` 或先做指标约简 |
| 收紧 `Tolerance` 到 `1e-9` 无收益 | 误差已由模型误差或 nominal 失配主导 | 比较两档容差的目标量差是否小于 0.1% |
| `Interval=1e-6` 后文件巨大但结果不变 | 混淆采样间隔与积分步长 | 检查步数统计是否改变 |
| 切换工具后轨迹偏差大于 1% | `Algorithm` 字符串未被正确解释，退化为默认方法 | 在日志中确认实际使用的求解器名 |

## 参考文献

1. A. C. Hindmarsh, P. N. Brown, K. E. Grant, S. L. Lee, R. Serban, D. E. Shumaker and C. S. Woodward, SUNDIALS: Suite of nonlinear and differential/algebraic equation solvers, ACM Transactions on Mathematical Software, 31(3):363-396, 2005.
2. E. Hairer, S. P. Nørsett and G. Wanner, Solving Ordinary Differential Equations I: Nonstiff Problems, 2nd ed., Springer, 1993.
3. E. Hairer and G. Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed., Springer, 1996.
4. L. R. Petzold, A description of DASSL: a differential/algebraic system solver, IMACS Transactions on Scientific Computing, 1982.
5. G. D. Byrne and A. C. Hindmarsh, A polyalgorithm for the numerical solution of ordinary differential equations, ACM Transactions on Mathematical Software, 1(1):71-96, 1975.
6. Modelica Association, Modelica Language Specification 3.6, 2023.
