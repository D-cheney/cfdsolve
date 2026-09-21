---
template_version: "flowlab-knowledge/1.0"
slug: cae-coupling-cosimulation-engineering-setup
title: "异构联合仿真：工程设置与参数选择"
summary: "把异构联合仿真拆成通信步长、子求解器容差、耦合迭代上限、接口映射与事件处理五组可填写参数，给出取值依据、量纲核对与并行确定性的配置清单。"
category:
  slug: multiphysics-coupling
  name: "多物理场耦合算法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "多物理场耦合算法"
  - "异构联合仿真"
  - "工程设置与参数选择"
  - "主算法"
  - "FMI 3.0"
seo:
  title: "异构联合仿真：工程设置与参数选择"
  description: "把异构联合仿真拆成通信步长、子求解器容差、耦合迭代上限、接口映射与事件处理五组可填写参数，给出取值依据、量纲核对与并行确定性的配置清单。"
  keywords:
    - "异构联合仿真"
    - "工程设置与参数选择"
    - "主算法"
    - "FMI 3.0"
    - "通信步长"
---

# 异构联合仿真：工程设置与参数选择

异构联合仿真的配置不是"把两个模型连起来"，而是要在相位误差预算、子求解器容差与计算成本之间定出五组参数：通信步长、耦合迭代上限、松弛因子、接口映射方式、事件与初始化策略。本文给出每一组的取值依据与核对方法，适用于 FMI 2.0/3.0 形式的工具耦合，也适用于自建 TCP 或共享内存接口的联合仿真。

## 主算法与通信步长的取值依据

先定主算法类型。若两个子模型互相提供对方在**同一时刻**所需的量（代数环），必须选迭代式主算法；否则可用显式主算法。判定量是耦合环增益 $L$，来自界面误差传播式

$$e^{n+1}\approx-\frac{m_a}{m_s}\,e^{n},\qquad L=\frac{m_a}{m_s}$$

$L<1$ 时显式可用；$L\ge1$ 时显式发散，迭代式松弛上界为 $\omega_{\max}=2/(1+L)$。

通信步长由相位误差预算反推，而不是凭经验拍一个数。给定关注频率 $f_{bw}$ 与允许的接口相位误差 $\Delta\varphi_{allow}$：

$$\Delta t_{comm}\le\frac{\Delta\varphi_{allow}}{360^\circ\,f_{bw}}$$

取 $\Delta\varphi_{allow}=5^\circ$、$f_{bw}=50\ \text{Hz}$（典型电液伺服带宽），得 $\Delta t_{comm}\le 5/(360\times50)=2.78\times10^{-4}\ \text{s}$，即约 0.28 ms，工程上取 0.25 ms。若带宽只有 5 Hz，同样预算下步长可放宽到 2.8 ms，成本相差 10 倍——所以带宽必须实测或由数据手册给定，不能假设。同时要求通信步长是子求解器内部最大步长的整数倍，例如液压子模型内部上限 $1.0\times10^{-4}\ \text{s}$ 时，$\Delta t_{comm}=0.25\ \text{ms}$ 恰为 2.5 倍，应改为 $0.2$ ms 或把内部上限降到 $5\times10^{-5}\ \text{s}$。

## 子求解器容差与耦合迭代上限的匹配

子求解器容差过松，接口残差会被子模型误差淹没；过严则每个通信步都在做无谓的迭代。实用规则是让两者同量级：

$$\varepsilon_{cpl}\approx \max\left(\varepsilon_{sub},\,10^{-3}\,\varepsilon_{phys}\right)$$

例如位移量级 5 mm、要分辨 5 μm，则 $\varepsilon_{phys}=10^{-3}$，$\varepsilon_{cpl}$ 取 $1.0\times10^{-6}$（相对范数）是合适的。耦合迭代上限取 30～50，配合 Aitken 松弛（起始 $\omega_0=0.3$，限制在 $[0.05,1.0]$）：

$$\omega_k=-\omega_{k-1}\frac{\left(\mathbf{r}^{k-1}\right)^{\top}\left(\mathbf{r}^{k}-\mathbf{r}^{k-1}\right)}{\left\lVert\mathbf{r}^{k}-\mathbf{r}^{k-1}\right\rVert^{2}}$$

若每个通信步都触到迭代上限，说明步长过大或应升级到 IQN-ILS（取最近 5～20 步的界面增量构造拟牛顿方向）。**不要靠调大迭代上限掩盖问题**：上限从 50 提到 200 而收敛步数仍是 50 以上，说明耦合算子谱半径接近 1。

## 接口变量与映射的配置

接口变量按因果性分三类：输入（causality="input"）、输出（causality="output"）、参数（causality="parameter"）。位移类接口用一致插值，力类接口必须用功率共轭（转置）映射，否则成对做功不为零。配置时逐条核对：

- 单位：接口一律用 SI（N、m、s、K、W、A），禁用 mm 与 rpm 混入；
- 参考系：明确界面法向朝向哪一侧，法向反号是最常见的低级错误；
- 时间戳：两侧都从 $t=0$ 起算，禁止从属模型自带偏移；
- 变量别名：输出端与输入端名称不同时显式建映射表，不要依赖顺序。

## 初始化与事件处理的设置

初始化阶段要指定一致初值，否则第一个通信步就会出现虚假瞬态。FMI 3.0 的顺序是 `fmi3EnterInitializationMode` → 设定所有 input 与 parameter → `fmi3ExitInitializationMode`。若子模型有内部状态，需用稳态解或实测值初始化，而不是默认零。

事件处理要显式开启：`fmi3DoStep` 返回 `eventHandlingNeeded=true` 时，主算法必须把通信步截断到 `lastSuccessfulTime` 并处理事件（阀门切换、接触、限位）。若忽略该标志，结果会在事件附近出现几十毫秒的相位错位。`terminateSimulation` 与 `earlyReturn` 也必须处理，前者终止仿真，后者要求缩短步长重试。

```python
# 联合仿真主算法骨架（FMI 3.0 风格），参数即上文的取值
dt_comm   = 2.5e-4      # s, 由 5 deg @ 50 Hz 预算得出
eps_cpl   = 1.0e-6      # 相对范数, 与子求解器同量级
max_iter  = 50
omega0    = 0.3         # Aitken 起始松弛
t, t_end  = 0.0, 10.0
while t < t_end:
    for k in range(max_iter):
        y = solve_sub_A(x)                 # 子模型 A 推进一步
        x_new = solve_sub_B(y)             # 子模型 B 推进一步
        r = x_new - x
        if norm(r) < eps_cpl * norm(x):
            break
        omega = aitken(omega_prev, r_prev, r)     # 限制在 [0.05, 1.0]
        x = (1.0 - omega) * x + omega * x_new
    else:
        raise RuntimeError("coupling not converged: reduce dt_comm")
    t += dt_comm
```

## 可复现记录与并行确定性

每个算例必须落盘的内容：两个 FMU 的版本号与校验和、`modelDescription.xml`、$\Delta t_{comm}$、$\varepsilon_{cpl}$、$\omega$ 序列、每步子迭代次数与最大接口残差、并行度。并行时浮点归约顺序会改变结果，若发现同一算例两次运行的界面残差末位不同，应固定归约顺序或改用确定性求和，而不是把它当作随机误差放过。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 首步就出现大瞬态 | 初值不一致，从属模型零初始化 | 检查初始化顺序与初值，比较 $t=0$ 与稳态值 |
| 每步迭代都触上限 | $\Delta t_{comm}$ 过大或环增益高 | 步长减半重跑，看迭代数是否下降 |
| 相位差约 7° 且随步长线性变化 | ZOH 滞后 | 按 $360^\circ f\Delta t$ 预测并对照实测 |
| 事件时刻结果错位数十毫秒 | 忽略 `eventHandlingNeeded` | 打印该标志，检查是否截断到 `lastSuccessfulTime` |
| 界面力方向反、能量不守恒 | 法向朝向或映射转置错误 | 算接口功率残差，检查映射矩阵转置关系 |
| 单位混用导致量级差 1000 倍 | mm 与 m、rpm 与 rad/s 混入 | 逐条核对接口变量单位表 |
| 并行两次结果末位不同 | 归约顺序不确定 | 固定归约顺序，重复 10 次比对残差 |

## 参考文献

1. Modelica Association, *Functional Mock-up Interface Specification 3.0*, 2022.
2. Blochwitz T., Otter M., Arnold M., et al., "The Functional Mockup Interface for Tool Independent Exchange of Simulation Models," *Proc. 8th International Modelica Conference*, 2011.
3. Gomes C., Thule C., Broman D., et al., "Co-simulation: A Survey," *ACM Computing Surveys*, 51(3), 2018.
4. Arnold M., Clauß C., Schierz T., "Error Analysis and Error Estimates for Co-Simulation in FMI for Model Exchange and Co-Simulation V2.0," *Archive of Numerical Software*, 1(2), 2013.
5. Felippa C.A., Park K.C., Farhat C., "Partitioned Analysis of Coupled Mechanical Systems," *Computer Methods in Applied Mechanics and Engineering*, 190, 2001.
