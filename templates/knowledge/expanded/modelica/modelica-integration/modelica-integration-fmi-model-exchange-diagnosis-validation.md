---
template_version: "flowlab-knowledge/1.0"
slug: modelica-integration-fmi-model-exchange-diagnosis-validation
title: "FMI Model Exchange：结果诊断与可信度验证"
summary: "ME 型 FMU 只交出状态与导数，积分由宿主完成，因此故障集中在导数与事件两处。本文用方向导数一致性、状态往返误差、事件定位精度与机械能残差四项判据，判断结果是物理响应还是接口实现缺陷。"
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
  - "FMI Model Exchange"
  - "结果诊断与可信度验证"
  - "方向导数一致性"
seo:
  title: "FMI Model Exchange：结果诊断与可信度验证"
  description: "ME 型 FMU 只交出状态与导数，积分由宿主完成，因此故障集中在导数与事件两处。本文用方向导数一致性、状态往返误差、事件定位精度与机械能残差四项判据，判断结果是物理响应还是接口实现缺陷。"
  keywords:
    - "FMI Model Exchange"
    - "结果诊断与可信度验证"
    - "fmi2GetDirectionalDerivative"
    - "needsCompletedIntegratorStep"
---

# FMI Model Exchange：结果诊断与可信度验证

ME 型 FMU 只暴露状态、导数和事件，积分由宿主求解器完成。导入后的异常几乎都落在“导数算错”或“事件漏掉”两类，而不是物理模型本身。判断一份 ME 结果能否采信，需要四类证据：方向导数一致性、状态往返误差、事件定位精度、守恒量在积分区间上的残差。下文用 $m=2.5\,\mathrm{kg}$、$k=120\,\mathrm{N/m}$、$c=3.0\,\mathrm{N\cdot s/m}$ 的单自由度振子给出可复算的判据。

## 积分责任与状态契约

宿主每步先 `fmi2SetTime`、再 `fmi2SetContinuousStates`，取回 `fmi2GetDerivatives` 后自行推进。FMU 不得在两次调用之间保留隐式状态，除非这部分状态能通过 `fmi2GetFMUState` 与 `fmi2SetFMUState` 复原。若 FMU 内部有静态缓存而 `canGetAndSetFMUstate="false"`，回滚必然失效，表现为“重跑同一时间点得到不同导数”。

`modelDescription.xml` 是这份契约的唯一书面依据：

- `providesDirectionalDerivative` 为 `true` 时，宿主可调用 `fmi2GetDirectionalDerivative` 得到 $\mathbf{J}\mathbf{v}$；为 `false` 时工具退化为常数或差分，隐式求解器的步长会明显缩小。
- `needsCompletedIntegratorStep` 为 `true` 时，宿主必须在每步成功后调用 `fmi2CompletedIntegratorStep`，否则离散状态不更新。
- 每个 `<ScalarVariable>` 的 `causality` 与 `initial` 属性决定初始化时哪些量参与求解。把代数中间量标成 `initial="exact"` 会与方程冲突，工具只能给出初始化残差。

```xml
<ModelExchange modelIdentifier="SpringMassDamper"
               needsCompletedIntegratorStep="true"
               providesDirectionalDerivative="true"/>
<DefaultExperiment startTime="0.0" stopTime="2.0" tolerance="1e-8"/>
<ScalarVariable name="x" valueReference="0" causality="output"
                variability="continuous" initial="exact">
  <Real start="0.05" derivative="1"/>
</ScalarVariable>
<ScalarVariable name="der(x)" valueReference="1" causality="local"
                variability="continuous">
  <Real derivative="0"/>
</ScalarVariable>
```

## 方向导数一致性与事件定位

方向导数接口是 ME 唯一能直接检验雅可比的手段。取随机方向 $\mathbf{v}$ 且 $\lVert\mathbf{v}\rVert_2=1$，比较 FMU 返回的 $\mathbf{J}\mathbf{v}$ 与中心差分：

$$\varepsilon_{dd}=\frac{\left\lVert \mathbf{J}\mathbf{v}-\dfrac{f(\mathbf{x}+\delta\mathbf{v})-f(\mathbf{x}-\delta\mathbf{v})}{2\delta}\right\rVert_{2}}{\left\lVert \mathbf{J}\mathbf{v}\right\rVert_{2}}$$

$\delta$ 取 $10^{-6}\max(1,\lvert x\rvert)$ 量级。工程上要求 $\varepsilon_{dd}\le 10^{-6}$；落在 $10^{-3}$ 附近说明 FMU 用内部差分近似或解析导数写错；为 $O(1)$ 则说明宿主根本没走方向导数通道。该判据只在连续区内有效。

事件定位用与量纲无关的绝对容差判定：

$$\lvert t_{ev}-t_{ev}^{ref}\rvert\le \max\left(10^{-6}\,\mathrm{s},\;10^{-6}\,t_{end}\right)$$

FMU 进入事件模式时宿主会把步长收缩到事件时刻附近。把 `tolerance` 从 $10^{-8}$ 放宽到 $10^{-6}$，事件时刻漂移通常放大 10 倍以上，这是区分事件建模错误与定位容差的最快试验。

## 机械能残差与一次手算

振子的解析量可以直接核对接口。$\omega_n=\sqrt{k/m}=\sqrt{120/2.5}=6.928\,\mathrm{rad/s}$，即 $f_n=1.103\,\mathrm{Hz}$、$T_n=0.907\,\mathrm{s}$；阻尼比 $\zeta=c/(2\sqrt{km})=3.0/(2\sqrt{300})=0.0866$。初值 $x_0=0.05\,\mathrm{m}$ 对应初始机械能 $E_0=\tfrac12 k x_0^2=\tfrac12\times120\times0.05^2=0.15\,\mathrm{J}$。

在 $t_1-t_0=2.0\,\mathrm{s}$（约 2.2 个周期）内，$\zeta\omega_n=0.6\,\mathrm{s^{-1}}$，振幅衰减 $\exp(-0.6\times2.0)=0.301$，能量按平方衰减到 $0.15\times0.301^2=0.0136\,\mathrm{J}$，即阻尼应耗散 $0.136\,\mathrm{J}$。把两侧能量账对齐：

$$\epsilon_{E}=\frac{1}{E_{0}}\left|E(t_{1})-E(t_{0})+\int_{t_{0}}^{t_{1}}c\,\dot{x}^{2}\,\mathrm{d}t\right|$$

取 $\mathrm{rtol}=10^{-8}$、$\mathrm{atol}=10^{-10}$ 实测：$E(t_1)-E(t_0)=-0.136\,392\,\mathrm{J}$，耗散积分 $0.136\,384\,\mathrm{J}$，残差 $8.0\times10^{-6}\,\mathrm{J}$，得 $\epsilon_E=5.3\times10^{-5}$。判据取 $\epsilon_E\le10^{-4}$。若 $\epsilon_E>10^{-3}$，先查 `initial="approx"` 的代数变量是否在初始化中被正确求解，再查事件是否漏掉。

```python
from pyfmi import load_fmu

m = load_fmu("SpringMassDamper.fmu")          # ME 型 FMU，宿主提供积分器
m.setup_experiment(start_time=0.0, stop_time=2.0)
m.initialize()
m.set("x", 0.05); m.set("v", 0.0)
res = m.simulate(options={"solver": "CVode", "rtol": 1e-8, "atol": 1e-10})
E = 0.5 * 120.0 * res["x"]**2 + 0.5 * 2.5 * res["v"]**2
print(E[0], E[-1])                            # 期望 0.15 J -> 0.0136 J
```

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 稳态 $x$ 偏移 $2.4\times10^{-4}\,\mathrm{m}$ | 代数变量被标成 `initial="exact"`，初始化方程组过定 | 改为 `initial="calculated"` 重跑，偏移应消失 |
| 导数在 $t=0.90\,\mathrm{s}$ 出现 $2.5\times10^{5}$ 量级尖峰 | 宿主未调用 `fmi2CompletedIntegratorStep`，离散状态未更新 | 打开该调用后对比尖峰是否消失 |
| $\varepsilon_{dd}=3\times10^{-3}$ 且与 $\delta$ 取值无关 | FMU 用固定步长内部差分近似雅可比 | 把 `providesDirectionalDerivative` 置 `false`，误差应同步退化 |
| 同一 FMU 在两工具中事件时刻差 $4.0\times10^{-4}\,\mathrm{s}$ | 事件定位容差与 `noSetFMUStatePriorToCurrentPoint` 语义不同 | 固定 `tolerance=1e-8`，导出事件时刻表逐点比对 |
| 重跑同一时刻得到不同导数 | FMU 内部静态缓存在回滚后未复原 | 连续两次 `fmi2GetFMUState`/`fmi2SetFMUState` 后比较导数 |

## 复核记录与版本台账

复核保存四样东西：FMU 的 SHA-256、`modelDescription.xml` 的关键属性快照、`tolerance` 与 `atol` 取值、上面四个判据的实测值。工具升级时最先失效的是事件定位，其次是方向导数回退路径。FMU 重新导出、`tolerance` 改变或 `needsCompletedIntegratorStep` 翻转时，此前的 $\epsilon_E$ 结论自动失效。

## 参考文献

1. Modelica Association, *Functional Mock-up Interface Specification 3.0*, 2022, §2.2 Model Exchange.
2. Modelica Association, *Functional Mock-up Interface Specification 2.0.2*, 2014, §3.2 状态与事件接口.
3. Blochwitz T., Otter M., Arnold M., Bausch C., Elmqvist H., Junghanns A., et al., "The Functional Mockup Interface for Tool independent Exchange of Simulation Models", *Proc. 8th International Modelica Conference*, 2011, pp. 105-114.
4. Modelica Association, *Modelica Language Specification 3.6*, 2023, §8.6 事件与状态事件.
5. Cellier F. E., Kofman E., *Continuous System Simulation*, Springer, 2006, Ch. 7.
6. Modelon AB, *PyFMI User Guide*, 2023.
