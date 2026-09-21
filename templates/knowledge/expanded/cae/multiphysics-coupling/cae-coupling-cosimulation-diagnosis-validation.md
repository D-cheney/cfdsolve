---
template_version: "flowlab-knowledge/1.0"
slug: cae-coupling-cosimulation-diagnosis-validation
title: "异构联合仿真：结果诊断与可信度验证"
summary: "用相位滞后、接口能量残差与耦合环增益三个可测量判定异构联合仿真结果是否可信，给出 FMI 3.0 通信步长、外推阶次与代数环发散的阈值和对照试验。"
category:
  slug: multiphysics-coupling
  name: "多物理场耦合算法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "多物理场耦合算法"
  - "异构联合仿真"
  - "结果诊断与可信度验证"
  - "FMI 3.0"
  - "通信步长"
seo:
  title: "异构联合仿真：结果诊断与可信度验证"
  description: "用相位滞后、接口能量残差与耦合环增益三个可测量判定异构联合仿真结果是否可信，给出 FMI 3.0 通信步长、外推阶次与代数环发散的阈值和对照试验。"
  keywords:
    - "异构联合仿真"
    - "结果诊断与可信度验证"
    - "FMI 3.0"
    - "通信步长"
    - "接口能量残差"
---

# 异构联合仿真：结果诊断与可信度验证

异构联合仿真把机械多体、液压、热与电气模型分别交给不同求解器，通过 FMI 之类的接口按通信步长交换数据。它最常见的故障不是某个子模型算错，而是接口处的采样、外推与代数环把数值伪影伪装成物理现象。本文给出四类可直接测量的诊断量——相位滞后、幅值衰减、接口能量残差、耦合环增益——以及各自阈值和对照试验；范围限于显式与迭代式联合仿真的结果复核，不涉及子模型内部的建模选择。

## 误差来源分解与首要判据

联合仿真总误差由三块构成：子模型自身的离散误差、通信接口的采样-保持误差、耦合迭代未收敛的残差。诊断第一步是判定哪一块占主导，做法是在不改变物理的前提下只压缩其中一块。

- 把 $\Delta t_{comm}$ 减半后结果明显变化，说明接口采样误差主导；
- 把子求解器容差从 $10^{-6}$ 收到 $10^{-8}$ 后结果几乎不动，说明子模型误差已不是瓶颈；
- 增加耦合迭代次数后结果继续变化，说明此前一直工作在未收敛状态。

一个可用门槛是：接口误差应至少比要论证的物理效应小一个数量级。要论证 3% 的能耗差异，接口能量残差就必须低于 0.3%。

## 通信步长与相位滞后的定量核算

显式联合仿真中，从属求解器在整个通信窗口内把输入保持为常值，即零阶保持（ZOH）。这等价于纯延迟加轻微低通，在频率 $f$ 处的相位滞后为

$$\Delta\varphi = 360^\circ\, f\,\Delta t_{comm}$$

取 $\Delta t_{comm}=1.0\ \text{ms}$、关注 20 Hz 的液压执行器带宽，则 $\Delta\varphi=360\times20\times0.001=7.2^\circ$。这已与一个二阶执行器在带宽处的相位裕度同量级，足以把相位裕度本只有 25° 的闭环推到振荡边缘。幅值侧衰减为 $\mathrm{sinc}(\pi f\Delta t_{comm})$，在 $f\Delta t_{comm}=0.02$ 时约 0.99934，即仅 $-0.07\%$。所以 ZOH 的主要危害是相位而非幅值，靠幅值对比排查接口误差几乎无效。

线性外推用上一步斜率预测窗口内输入，把局部误差从 $O(\Delta t_{comm})$ 降到 $O(\Delta t_{comm}^2)$，但会在载荷突变处过冲。判据是：阶跃输入下，外推引起的超调不得超过子模型自身超调的 10%。

## 代数环：显式联合仿真的发散判据

两个子模型在同一时刻互相需要对方输出时形成代数环。以机械质量 $m_s$ 与提供附加质量 $m_a$ 的液压/流体子系统为例，显式交换的界面误差逐拍传播为

$$e^{n+1}\approx-\frac{m_a}{m_s}\,e^{n}$$

当耦合环增益 $L=m_a/m_s>1$ 时误差交替放大并翻倍，必须改用迭代式主算法加松弛，松弛上界 $\omega_{\max}=2/(1+L)$。例如 $m_a=3.0\ \text{kg}$、$m_s=1.0\ \text{kg}$ 得 $L=3.0$，显式必发散，迭代式取 $\omega\le0.5$；而 $m_a=0.2\ \text{kg}$、$m_s=2.0\ \text{kg}$ 得 $L=0.1$，显式可用。

还要区分代数环与纯延迟环：前者在 $\Delta t_{comm}\to0$ 时增益不衰减，后者随步长减小而缓解。测试方法是把 $\Delta t_{comm}$ 减小 10 倍——发散消失即延迟环，依旧发散即代数环，只能改耦合方案。

## 接口能量残差与守恒核对

接口处必须同时满足运动学条件（位移、速度一致）与动力学条件（力、热流平衡）。最灵敏的全局指标是接口功率残差，在一个时间窗口内定义为

$$R_P = \frac{\left|\int_{t_0}^{t_1}\left(\mathbf{F}_{12}\cdot\mathbf{v}_2+\mathbf{F}_{21}\cdot\mathbf{v}_1\right)dt\right|}{\int_{t_0}^{t_1}\left|\mathbf{F}_{12}\cdot\mathbf{v}_2\right|dt}$$

理想应为 0。取一例：$F=800\ \text{N}$、$v=0.5\ \text{m/s}$、持续 10.0 s，则单侧做功 $W=800\times0.5\times10=4000\ \text{J}$，平均功率 400 W。若要求残差低于 0.5%，接口漂移能量须小于 $4000\times0.005=20\ \text{J}$，即平均泄漏功率低于 2 W。实测残差超过 1% 时，先查映射是否一致（位移用一致插值、力用功率共轭插值），再查两侧时间戳与单位。热侧同理：$\left|\sum q_iA_i\right|/\sum|q_iA_i|$ 应低于 0.5%；界面两侧热流相差 12% 通常是面积权重缺失或网格映射未归一。

## 对照基准：单体求解与解析解

可信度验证的第三条腿是独立基准，联合仿真可用三类对照。

1. **单体等价模型**：把两子系统合成单体模型消除接口，稳态下两者应一致到 0.1% 以内，差异即接口误差。
2. **解析解**：一维热传导阶跃响应、单自由度振子、RC 电路都有闭式解。一阶系统 $\tau=RC=0.05\ \text{s}$ 时，$1\tau$ 处应达终值 63.2%、$3\tau$（0.15 s）处 95.0%，可逐点核对。
3. **步长收敛序列**：$\Delta t_{comm}=4,2,1,0.5\ \text{ms}$ 四档，观察是否按预期阶次收敛；若显著低于理论阶（ZOH 一阶、线性外推二阶），说明另有误差源。

```xml
<!-- FMI 3.0 modelDescription.xml 片段：从属模型暴露可调通信步长 -->
<fmiModelDescription fmiVersion="3.0" modelName="HydraulicActuator">
  <CoSimulation modelIdentifier="HydraulicActuator"
                canHandleVariableCommunicationStepSize="true"
                maxOutputDerivativeOrder="0"/>
  <DefaultExperiment startTime="0.0" stopTime="10.0" stepSize="0.001"/>
  <ModelVariables>
    <Float64 name="u_spool" valueReference="1" causality="input"/>
    <Float64 name="F_out"   valueReference="2" causality="output"/>
  </ModelVariables>
</fmiModelDescription>
```

主算法侧要记录 `fmi3DoStep` 的返回值、`eventHandlingNeeded` 与每步接口残差。`maxOutputDerivativeOrder="0"` 表示从属模型只给零阶输出，主算法只能用 ZOH 或自建外推，这正是相位滞后的根源。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 结果随通信步长漂移，减半即变 | ZOH 相位滞后主导 | 扫 $\Delta t_{comm}=4,2,1,0.5\ \text{ms}$，看是否一阶收敛 |
| 幅值吻合但相位差 7° 以上 | 纯延迟未被识别 | 正弦扫频测接口相位，与 $360^\circ f\Delta t$ 对照 |
| 每步交替放大，步长越小越糟 | 代数环，环增益 $L>1$ | 计算 $m_a/m_s$；减小步长看是否缓解 |
| 能量缓慢漂移，10 s 累积数十焦 | 力映射非功率共轭或时间戳错位 | 算接口功率残差 $R_P$，查映射转置关系 |
| 界面温度跳变、两侧热流不等 | 面积权重缺失或映射未归一 | 核对双侧 $\sum q_iA_i$ 残差与界面面积 |
| 改线性外推后阶跃处超调 | 外推在间断处过冲 | 施加阶跃，比外推超调与子模型自身超调 |
| 并行与串行结果不一致 | 归约顺序影响浮点求和 | 固定归约顺序，重复 10 次比对 |

诊断顺序：先做步长收敛序列判定接口是否主导，再算环增益判定是否需要迭代耦合，最后用能量残差与单体对照收尾。

## 参考文献

1. Modelica Association, *Functional Mock-up Interface Specification 3.0*, 2022.
2. Blochwitz T., Otter M., Arnold M., et al., "The Functional Mockup Interface for Tool Independent Exchange of Simulation Models," *Proc. 8th International Modelica Conference*, 2011.
3. Gomes C., Thule C., Broman D., et al., "Co-simulation: A Survey," *ACM Computing Surveys*, 51(3), 2018.
4. Felippa C.A., Park K.C., Farhat C., "Partitioned Analysis of Coupled Mechanical Systems," *Computer Methods in Applied Mechanics and Engineering*, 190, 2001.
5. Bungartz H.-J., Schäfer M. (eds.), *Fluid-Structure Interaction: Modelling, Simulation, Optimisation*, Springer, 2006.
6. Sadjina S., Pedersen E., "Energy Conservation and Coupling Error Reduction in Non-Iterative Co-Simulations," *Simulation Modelling Practice and Theory*, 79, 2017.
