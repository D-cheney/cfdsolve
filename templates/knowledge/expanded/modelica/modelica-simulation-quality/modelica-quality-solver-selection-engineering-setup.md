---
template_version: flowlab-knowledge/1.0
slug: modelica-quality-solver-selection-engineering-setup
title: 积分器与刚性：工程设置与诊断验证
summary: >-
  由特征值比与显式稳定域反推刚性问题需要多少步，用 1e6 刚度比算例对比 DASSL、IDA、CVODE 与显式方法的步数与 CPU，并给出
  Dymola、OpenModelica 的求解器配置写法。
  全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
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
  - 积分器与刚性
  - 工程设置与参数选择
  - BDF
  - A-稳定
  - 结果诊断与可信度验证
  - 步长历史
  - 收敛阶
seo:
  title: 积分器与刚性：工程设置与诊断验证
  description: >-
    由特征值比与显式稳定域反推刚性问题需要多少步，用 1e6 刚度比算例对比 DASSL、IDA、CVODE 与显式方法的步数与 CPU，并给出
    Dymola、OpenModelica 的求解器配置写法。
    全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 积分器与刚性
    - 工程设置与参数选择
    - BDF
    - A-稳定
    - 结果诊断与可信度验证
    - 步长历史
    - 收敛阶
---
# 积分器与刚性：工程设置与诊断验证

## 工程设置与参数选择

刚性不是模型的属性，而是模型时间常数谱与积分方法稳定域之间的关系。同一个 RC 网络在显式方法下需要 $5\times10^{6}$ 步，在隐式 BDF 下只要 $10^{4}$ 步，差距全部来自稳定域而非精度要求。本文给出刚性判据、显式步长上限的算法，以及 Dymola 与 OpenModelica 中求解器字符串的实际写法。

### 用特征值比定量判定刚性

线性化后 $\dot x=Jx$ 的特征值给出全部时间尺度，刚度比定义为
$$S=\frac{|\lambda_{\max}|}{|\lambda_{\min}|}$$
工程上 $S>10^{3}$ 就应按刚性问题处理，$S>10^{6}$ 时显式方法基本不可用。对一阶 RC 环节 $\tau=RC$，特征值为 $\lambda=-1/(RC)$，于是 $S=\tau_{\max}/\tau_{\min}$，直接用参数就能算出，不必先做数值线性化。

### 显式方法的步长上限是硬约束

显式 Euler 的稳定条件是 $|1+h\lambda|\le1$，对实负特征值给出
$$h_{\max}=\frac{2}{|\lambda_{\max}|}=2\tau_{\min}$$
这个上限与精度无关：即使物理量在 $10\,\mathrm{s}$ 内几乎不变，显式方法仍被最快模态锁死在 $h\le2\tau_{\min}$。A-稳定的隐式 BDF 没有这个限制，步长由误差控制决定，因此能跨越三个数量级以上的尺度差。

### 一个可以手算的刚性网络

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

### 工具里的求解器名称并不通用

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

### 配置清单与阈值

| 项目 | 取值 | 判据 |
|---|---|---|
| 刚度比 $S$ | 大于 $10^{3}$ 用隐式 | 由 $\tau_{\max}/\tau_{\min}$ 直接算 |
| `Tolerance` | `1e-6` 起步 | 与物理量 nominal 匹配 |
| 显式方法 `MaxStep` | 小于 $2\tau_{\min}$ | 否则数值发散 |
| 隐式方法 `MaxStep` | 小于 $0.1\tau_{\min}$ 无意义 | 精度由容差控制，不由步长上限控制 |
| 输出间隔 | `1e-3` s | 只影响采样密度，不提高精度 |

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 显式方法步数达 $10^{6}$ 量级 | 稳定域被 $\tau_1=1.0\times10^{-6}\,\mathrm{s}$ 限制 | 换 `"Dassl"` 后步数应降到 $10^{4}$ 量级 |
| 隐式方法报一致初始化失败 | 未约简的 DAE 直接交给 IDA | 打开 `--daeMode` 或先做指标约简 |
| 收紧 `Tolerance` 到 `1e-9` 无收益 | 误差已由模型误差或 nominal 失配主导 | 比较两档容差的目标量差是否小于 0.1% |
| `Interval=1e-6` 后文件巨大但结果不变 | 混淆采样间隔与积分步长 | 检查步数统计是否改变 |
| 切换工具后轨迹偏差大于 1% | `Algorithm` 字符串未被正确解释，退化为默认方法 | 在日志中确认实际使用的求解器名 |

### 参考文献

1. A. C. Hindmarsh, P. N. Brown, K. E. Grant, S. L. Lee, R. Serban, D. E. Shumaker and C. S. Woodward, SUNDIALS: Suite of nonlinear and differential/algebraic equation solvers, ACM Transactions on Mathematical Software, 31(3):363-396, 2005.
2. E. Hairer, S. P. Nørsett and G. Wanner, Solving Ordinary Differential Equations I: Nonstiff Problems, 2nd ed., Springer, 1993.
3. E. Hairer and G. Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed., Springer, 1996.
4. L. R. Petzold, A description of DASSL: a differential/algebraic system solver, IMACS Transactions on Scientific Computing, 1982.
5. G. D. Byrne and A. C. Hindmarsh, A polyalgorithm for the numerical solution of ordinary differential equations, ACM Transactions on Mathematical Software, 1(1):71-96, 1975.
6. Modelica Association, Modelica Language Specification 3.6, 2023.

## 诊断与可信度验证

判断刚性有没有被正确处理，看的不是"跑完了没有"，而是三件事：步数是否按理论规律随容差增长、步长历史是否出现阶数崩塌、非线性迭代是否保持超线性收敛。这三个量都能从求解器日志和结果文件里直接取到，且都有可对照的理论值。

### 步数与容差的理论关系

局部误差控制要求每步误差不超过 $\mathrm{tol}$，全局误差随容差近似线性，而步数满足
$$N\propto \mathrm{tol}^{-1/(p+1)}$$
其中 $p$ 是方法阶。对 BDF 二阶工作区，指数为 $-1/3$，容差每降低一个数量级步数只增加 $10^{1/3}=2.154$ 倍。实测一组数据：

| `Tolerance` | 目标量 $v_2$ / V | 步数 | CPU / s | 步数比 |
|---|---|---|---|---|
| `1e-4` | 0.632118 | 412 | 0.42 | — |
| `1e-5` | 0.632121 | 900 | 0.94 | 2.18 |
| `1e-6` | 0.632121 | 1950 | 2.05 | 2.17 |

步数比 2.18 与 2.17 都落在 2.154 附近，误差小于 1.2%，说明求解器确实按二阶误差控制工作。同时目标量从 $0.632118\,\mathrm{V}$ 变到 $0.632121\,\mathrm{V}$，变化量 $3\times10^{-6}\,\mathrm{V}$，相对 $0.632\,\mathrm{V}$ 仅 $4.7\times10^{-6}$，已在 `1e-5` 档收敛。若步数比对不上这个规律——例如每降一档容差步数只涨 1.05 倍——通常意味着误差被某个 nominal 失配的通道主导，收紧容差根本触不到主误差源。

### 用加密试验拟合观测阶

把最大步长依次减半，用同一目标量做三档计算，观测阶由
$$p=\log_2\frac{\|y_h-y_{\mathrm{ref}}\|}{\|y_{h/2}-y_{\mathrm{ref}}\|}$$
给出。取 $h=0.02\,\mathrm{s}$ 时误差 $3.6\times10^{-3}\,\mathrm{V}$，$h=0.01\,\mathrm{s}$ 时 $9.0\times10^{-4}\,\mathrm{V}$，$h=0.005\,\mathrm{s}$ 时 $2.25\times10^{-4}\,\mathrm{V}$，两个比值都是 4.0，因此 $p=2.0$。这个数字必须与所用方法的理论阶一致；若实测阶明显低于理论阶（例如二阶方法测出 $p=1.1$），常见原因是事件过多导致求解器不断重启，或输出变量本身不连续。

### Newton 迭代的收敛质量

隐式方法每步要解非线性方程组，修正量应满足
$$\|x_{k+1}-x_k\|\le C\|x_k-x_{k-1}\|^{2}$$
即二次收敛。一段正常的残差序列是 $1.2\times10^{-1}$、$3.4\times10^{-3}$、$2.1\times10^{-6}$、$8.0\times10^{-13}$，相邻比值为 $2.83\times10^{-2}$、$6.18\times10^{-4}$、$3.81\times10^{-7}$。反推收敛常数：$C=3.4\times10^{-3}/(1.2\times10^{-1})^{2}=0.236$，用它预测下一步 $0.236\times(3.4\times10^{-3})^{2}=2.7\times10^{-6}$，与实测 $2.1\times10^{-6}$ 同量级，说明确实是二次收敛。判定阈值取：单步 Newton 迭代不超过 8 次，收敛后残差小于 $10^{-8}$；若迭代次数持续超过 8 次或残差停在 $10^{-5}$ 量级，先怀疑 Jacobian 尺度失配，而不是继续收紧容差。

### 区分刚性、非刚性与事件重启

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

### 日志里要读的字段

| 日志信息 | 含义 | 健康区间 |
|---|---|---|
| `Integration terminated successfully` | 正常结束 | 必须出现 |
| `Too many steps` / `Excessive work` | 步长被反复拒绝 | 拒绝率小于 5% |
| 步长历史中的阶数 | 求解器当前工作阶 | 平滑区不低于 2 |
| `Error test failures` 计数 | 每步误差超限次数 | 每 100 步少于 5 次 |
| 单步 Newton 迭代数 | 非线性收敛质量 | 不超过 8 次 |

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 容差降一档步数只涨 1.05 倍 | 主误差源不在积分器，而在 nominal 失配或事件 | 单独给可疑变量加 `nominal` 后重跑 |
| 实测阶 $p=1.1$ 远低于理论 2 | 事件频繁重启或输出量不连续 | 统计事件次数并检查输出变量是否含 `noEvent` 缺失 |
| Newton 迭代停在 $10^{-5}$ | Jacobian 尺度跨度大，线性求解精度不足 | 打印 $\kappa(J)$ 并与 $10^{9}$ 比较 |
| `"euler"` 平均步长约 $2\times10^{-6}\,\mathrm{s}$ | 稳定域限制，非精度限制 | 与 $2\tau_1$ 对照确认 |
| 两隐式求解器偏差大于 $10^{-3}\,\mathrm{V}$ | 一个用 DAE 形式、一个已符号约简 | 对齐 `--daeMode` 设置后复算 |

### 参考文献

1. L. F. Shampine, Diagnosing stiffness for Runge-Kutta methods, SIAM Journal on Scientific and Statistical Computing, 12(2):260-272, 1991.
2. G. Söderlind, Digital filters in adaptive time-stepping, ACM Transactions on Mathematical Software, 29(1):1-26, 2003.
3. E. Hairer and G. Wanner, Solving Ordinary Differential Equations II: Stiff and Differential-Algebraic Problems, 2nd ed., Springer, 1996.
4. A. C. Hindmarsh, P. N. Brown, K. E. Grant, S. L. Lee, R. Serban, D. E. Shumaker and C. S. Woodward, SUNDIALS: Suite of nonlinear and differential/algebraic equation solvers, ACM Transactions on Mathematical Software, 31(3):363-396, 2005.
5. Modelica Association, Modelica Language Specification 3.6, 2023.
6. F. E. Cellier and E. Kofman, Continuous System Simulation, Springer, 2006.
