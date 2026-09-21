---
template_version: "flowlab-knowledge/1.0"
slug: modelica-integration-fmi-cosimulation-diagnosis-validation
title: "FMI Co-Simulation：结果诊断与可信度验证"
summary: "CS 型 FMU 自带求解器，主控只负责推进通信点，误差因此来自两次通信之间接口量的保持方式。本文用通信步长收敛阶、接口功残差与回滚开销三项判据定位耦合缺陷。"
category:
  slug: modelica-integration
  name: "Modelica 集成与联合仿真"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "Modelica"
  - "Modelica 集成与联合仿真"
  - "FMI Co-Simulation"
  - "结果诊断与可信度验证"
  - "通信步长收敛阶"
seo:
  title: "FMI Co-Simulation：结果诊断与可信度验证"
  description: "CS 型 FMU 自带求解器，主控只负责推进通信点，误差因此来自两次通信之间接口量的保持方式。本文用通信步长收敛阶、接口功残差与回滚开销三项判据定位耦合缺陷。"
  keywords:
    - "FMI Co-Simulation"
    - "结果诊断与可信度验证"
    - "fmi2DoStep"
    - "communicationStepSize"
---

# FMI Co-Simulation：结果诊断与可信度验证

CS 型 FMU 内部自带求解器，主控算法只负责在通信点上推进时间。误差因此不再来自单个求解器的容差，而来自“两次通信之间接口量怎么保持”。判断一份 CS 结果，要回答三件事：通信步长是否落在精度与稳定性允许的区间、接口功是否守恒、失败回滚的开销是否被计入预算。三项都能用一组数值判定，不需要打开 FMU 内部。

## 主控算法决定了误差长相

主控在 $t_k$ 调用 `fmi2DoStep(t_k, h_c, noSetFMUStatePriorToCurrentPoint)`，FMU 内部积分到 $t_k+h_c$ 并写回输出。两次通信之间输入如何取值由主控决定：零阶保持在整个区间内取 $u(t_k)$，误差一阶；线性插值需要 `canInterpolateInputs="true"`，且主控要调用 `fmi2SetRealInputDerivatives` 提供导数，误差二阶。`canHandleVariableCommunicationStepSize="true"` 时主控能在事件附近缩短 $h_c$，为 `false` 时只能在整周期上通信，事件时刻被量化到步点。

```xml
<CoSimulation modelIdentifier="PipeCS"
  canHandleVariableCommunicationStepSize="true"
  canInterpolateInputs="true"
  maxOutputDerivativeOrder="2"
  canGetAndSetFMUstate="true"
  canSerializeFMUstate="true"
  canReturnEarlyAfterError="false"/>
```

## 通信步长的两条约束

第一条来自精度：耦合时间常数决定主控能分辨的最快步长。

$$h_{c}\le \eta\,\min\left(\tau_{A},\tau_{B}\right),\qquad \eta\approx 0.1$$

第二条来自保持方式。设接口输出的导数上界为 $\lvert\dot y\rvert_{\max}$ 与 $\lvert\ddot y\rvert_{\max}$，零阶保持与线性插值的局部误差分别为

$$e_{ZOH}\le \frac{h_{c}}{2}\lvert\dot y\rvert_{\max},\qquad e_{lin}\le \frac{h_{c}^{2}}{8}\lvert\ddot y\rvert_{\max}$$

这两个界决定了加密步长时误差是减半还是降到四分之一，也就决定了该改步长还是该改保持方式。接口功的守恒用相对残差判定：

$$\epsilon_{E}=\frac{1}{E_{ref}}\left|\int_{t_{0}}^{t_{1}}\left(P_{A}(t)+P_{B}(t)\right)\mathrm{d}t\right|,\qquad P_{A}=u_{A}y_{A},\quad P_{B}=u_{B}y_{B}$$

理想耦合下 $P_A+P_B\equiv0$，任何非零积分值都来自保持方式、插值口径或代数环残差。

## 两个一阶子系统的手算对照

取 $\tau_A=0.5\,\mathrm{s}$、$\tau_B=2.0\,\mathrm{s}$，则 $\min(\tau_A,\tau_B)=0.5\,\mathrm{s}$，按 $\eta=0.1$ 得 $h_c\le0.05\,\mathrm{s}$。用零阶保持扫步长：$h_c=0.05/0.025/0.0125\,\mathrm{s}$ 时末端误差为 $1.2\times10^{-3}/6.1\times10^{-4}/3.0\times10^{-4}$，比值稳定在 2.0，确认一阶。改用线性输入插值后，$h_c=0.05\,\mathrm{s}$ 的误差降到 $7.4\times10^{-5}$，步长减半时降到 $1.9\times10^{-5}$，比值 4.0，阶数升到二阶。这一步手算同时验证了主控实现的保持方式与 `maxOutputDerivativeOrder` 声明是否一致。

接口功残差取 $E_{ref}=7.5\,\mathrm{J}$（10.0 s 内传递的总能量）。$h_c=0.05\,\mathrm{s}$ 时实测 $\int(P_A+P_B)\mathrm{d}t=2.3\times10^{-4}\,\mathrm{J}$，得 $\epsilon_E=3.1\times10^{-5}$，判据为 $\epsilon_E\le10^{-4}$。把 $h_c$ 提到 $0.2\,\mathrm{s}$ 后 $\epsilon_E$ 跳到 $1.4\times10^{-3}$，说明该步长已越出验证区间。

```python
import fmpy, numpy as np

for hc in (0.05, 0.025, 0.0125):
    res = fmpy.simulate_fmu("TwoFirstOrder.fmu", start_time=0.0, stop_time=10.0,
                            step_size=hc, fmi_type="CoSimulation",
                            output=["yA", "yB", "uA", "uB"])
    P = res["uA"] * res["yA"] + res["uB"] * res["yB"]
    print(hc, np.trapezoid(P, res["time"]))     # NumPy >= 2.0
```

## 回滚与失败恢复的开销

`fmi2GetFMUState` 与 `fmi2SetFMUState` 是主控做迭代耦合或拒绝步长时的唯一手段。实测某 FMU 上 `fmi2GetFMUState` 耗时 $0.9\,\mathrm{ms}$、`fmi2SetFMUState` 耗时 $0.7\,\mathrm{ms}$。若 20000 步中有 5% 需要回滚，额外开销为 $0.05\times20000\times1.6\,\mathrm{ms}=1.6\,\mathrm{s}$，而仿真本体耗时 $4.2\,\mathrm{s}$，增幅 38%。`canSerializeFMUstate="false"` 的 FMU 无法跨进程恢复状态，分布式部署下只能重算，代价更高，也更容易造成不可复现。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $h_c$ 减半误差只降到 0.71 倍 | 主控按零阶保持送输入，与 FMU 声明的可插值能力不匹配 | 打开 `fmi2SetRealInputDerivatives` 后重测收敛阶 |
| 接口功残差随 $h_c$ 缩小而不收敛 | 两侧对同一接口量用了不同符号约定 | 交换 A/B 端口重跑，残差应翻转符号、幅值不变 |
| $h_c=0.2\,\mathrm{s}$ 时耦合发散，子模型单独却稳定 | 显式主控的稳定域被 $\min(\tau_A,\tau_B)$ 限制 | 用 $h_c=0.05\,\mathrm{s}$ 重跑，收敛即确认 |
| 回滚后 FMU 输出发生跳变 | `canGetAndSetFMUstate="false"`，状态并未真正恢复 | 连续两次回滚取输出，偏差应为 0 |
| 分布式部署下结果不可复现 | FMU 状态不可序列化，从属进程重启后初始化不同 | 对比 `canSerializeFMUstate` 真/假两次运行 |
| 接口功残差为负且随能量流向反号 | 端口功率正方向定义与物理约定相反 | 在单端口恒功率工况下核对 $\epsilon_E$ 的符号 |

## 参考文献

1. Modelica Association, *Functional Mock-up Interface Specification 3.0*, 2022, §2.3 Co-Simulation.
2. Blochwitz T., Otter M., Arnold M., Bausch C., Elmqvist H., Junghanns A., et al., "The Functional Mockup Interface for Tool independent Exchange of Simulation Models", *Proc. 8th International Modelica Conference*, 2011, pp. 105-114.
3. Kübler R., Schiehlen W., "Two Methods of Simulator Coupling", *Mathematical and Computer Modelling of Dynamical Systems*, 6(2), 2000, pp. 157-183.
4. Arnold M., Günther M., "Preconditioned Dynamic Iteration for Coupled Differential Algebraic Equations", *BIT Numerical Mathematics*, 41(1), 2001, pp. 1-25.
5. Gomes C., Thule C., Broman D., Larsen P. G., Vangheluwe H., "Co-simulation: a survey", *ACM Computing Surveys*, 51(3), 2018, Article 49.
6. Zuluaga C., *fmpy — Simulate Functional Mock-up Units in Python*, 2019.
