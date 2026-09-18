---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-fmi-cosimulation
title: Modelica FMI 导出、模型交换与联合仿真
summary: 从 ME 与 CS 的语义差异出发，说明 FMU 的接口因果与可变性、直接馈通代数环、联合仿真步长的稳定性判据，以及导出导入两端的验证清单。
category: { slug: modelica-integration, name: Modelica 集成与联合仿真 }
level: 专题
reading_minutes: 21
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, FMI, FMU, Model Exchange, Co-Simulation, 通信步长]
seo:
  title: Modelica FMI 与 FMU 联合仿真
  description: 选择 Model Exchange 或 Co-Simulation，设计 FMU 接口因果并稳定联合仿真步长。
  keywords: [FMI, FMU, Modelica 联合仿真, 通信步长, 直接馈通]
---

# Modelica FMI 导出、模型交换与联合仿真

FMI（Functional Mock-up Interface）把动态模型打包成语言中立的 FMU，使 Modelica 模型可以脱离原建模工具，在控制系统、实时测试台与多工具联合仿真环境中复用。它是当前工业界最广泛采用的模型交换标准，但“能导入”只是语法层面的成功。真正决定结果一致性的是导出方与导入方对接口因果、事件语义与通信步长是否理解一致：同一个 FMU 在不同主控程序、不同步长下可能给出完全不同的轨迹，而工具通常不会报错。本文聚焦导出与导入两端、通信步长的选择与联合仿真的稳定性，并给出可复现的验证流程。

## 1. 结论与适用场景

选 Model Exchange（ME）还是 Co-Simulation（CS），取决于谁拥有积分器、谁负责事件定位。ME 的 FMU 只暴露方程与状态，由导入方主求解器积分并处理事件；CS 的 FMU 自带求解器，主控方只在通信点调用 `doStep`。这个分工决定了接口的复杂度和数值行为。

- ME 适用：导入方已有高性能或刚性问题求解器，希望把 FMU 与其它方程联立、希望自适应步长与精确事件处理，耦合较紧。代价是每个工具都要实现事件与状态处理，必要时还要导出 C 源码以适配不同编译器。
- CS 适用：导出方要封装专有模型或数值细节、导入方无法访问内部方程、需要把模型插入实时代码或已有 CS 主控、多个 FMU 松散耦合。代价是引入通信误差，强反馈时可能不稳定。
- 只做参数化稳态或准稳态查表：应使用特性图或 FMI 3.0 的 scheduled execution，不必强行上动态 CS，否则既慢又不稳。

此外还要考虑团队边界：如果模型由供应商提供且不允许查看方程，只能选 CS；如果模型需要在同一时间步内与其它连续方程严格联立（例如控制回路与热回路紧耦合），则 ME 更自然。

判据可归纳为：能否承受通信步长带来的滞后与稳定性损失；若不能，选 ME 并让主求解器统一积分。工程上应先做粗粒度的定性与定量估算，再决定接口类型，而不是先导出再发现问题。

还有一点常被忽略：ME 与 CS 并非只能二选一。同一模型可以同时导出两种接口，在系统级用 CS 快速搭原型、在标定或高精度分析时切到 ME 联立。这样既保留模块化，又在需要时恢复紧耦合；代价是要维护两套接口描述与测试用例，因此只在对结果一致性要求高时采用。

## 2. 原理与协议/语义

一个 FMU 是遵循固定目录结构的 zip 包：`modelDescription.xml` 描述变量、类型、因果、可变性、单位与初始属性；`binaries/<platform>/` 放各平台动态库；`sources/` 放可选 C 源；`resources/` 放数据表等外部资源。这个“描述加二进制加资源”的三段式设计，使同一模型可以跨工具、跨平台分发，而无需共享建模源文件。

FMI 用因果（causality）刻画接口方向：`input` 只能被主控方写入，`output` 由 FMU 计算，`parameter` 在初始化阶段可写、运行时通常固定，`independent` 是独立变量（一般为时间）。可变性（variability）进一步区分 `fixed`、`tunable`、`discrete`、`continuous`，它决定变量能否在通信点之间改变、是否会触发事件。因果与可变性写错，是导入后行为异常的常见根源。

关键语义差异在于状态与事件的归属。在 CS 中，`doStep(t,h)` 内部完成从 $t$ 到 $t+h$ 的积分，FMU 自行处理事件；主控方看不到中间状态，只能在通信点读写。在 ME 中，FMU 提供 `getContinuousStates`、`getDerivatives`、事件指示量 `getEventIndicators` 与 `enterEventMode`，主求解器负责积分和事件定位。二者对“状态是否连续”“事件何时发生”的假设不同，混用会得到不同轨迹。例如把一个含内部滞环的 CS 当成 ME 联立，主控方可能看不到内部开关，从而破坏守恒。

直接馈通（direct feedthrough）是接口设计的核心风险：若某 `output` 在同一时刻显式依赖某 `input`，该对变量就构成代数耦合。此时 FMU 输出是输入的代数函数，主控方必须在通信点内迭代求解，否则会强行引入一步滞后。`modelDescription.xml` 中的 `dependencies`/`directDependencies` 属性正是用来声明这种瞬时依赖，导出时应如实填写，导入时据此决定耦合策略。

FMI 3.0 进一步引入时钟（clock）与网络化（networked）概念：scheduled execution 允许主控方按自身时间表驱动 FMU，适合稳态查表与批处理；时钟变量则显式描述采样与同步，减少对隐式事件猜测的依赖。使用新特性前应确认两端工具链都完整支持，否则宁可退回 2.0 的保守子集，因为“能用”比“用新”更重要。

## 3. 关键公式与接口

耦合的稳定性可以从误差传播角度定量分析。设耦合系统在界面上的线性化特征值为 $\lambda_c$，CS 主控方用固定通信步长 $\Delta t$ 显式交换一次数据，则一步误差传播放大因子为

$$ g(\Delta t) = 1 + \Delta t\,\lambda_c $$

显式（松散）耦合稳定的条件是

$$ \lvert g(\Delta t) \rvert \leq 1 $$

当 $\lambda_c$ 有正实部（强正反馈、刚性耦合）时，$\Delta t$ 必须足够小，否则每步误差被放大，轨迹逐渐发散。这就是“通信步长要解析跨组件最快动态”的定量来源：$\Delta t$ 不只是精度参数，更是稳定性参数。

若存在直接馈通，通信点的接口方程构成不动点问题

$$ u = h\bigl(g(u,t),t\bigr) $$

其中 $g$ 是 FMU 的代数输出映射，$h$ 是主控方连接映射。需用高斯—赛德尔或雅可比迭代求解，收敛要求接口雅可比的谱半径小于 1：

$$ \rho\!\left(\frac{\partial h}{\partial u}\,\frac{\partial g}{\partial u}\right) < 1 $$

这个谱半径同时也决定了迭代耦合的收敛速度和是否值得迭代：谱半径接近 1 时迭代收敛慢，还不如直接减小步长。

对于连续状态推进，若主控方在通信点之间用 $p$ 阶外推估计输入，则单位步长截断误差为 $O(\Delta t^{p+1})$，累积滞后误差为 $O(\Delta t^{p})$。零阶保持（$p=0$）最稳但相位滞后最大，线性外推（$p=1$）改善相位但可能在载荷跳变处过冲。选择外推阶次，本质是在稳定性与相位精度之间取舍。

特征值 $\lambda_c$ 可以从物理估算：热耦合回路约为 $-hA/(\rho V c_p)$，质量—压力回路则取决于容积刚度与阻力。先用一阶模型估出 $\lambda_c$ 的数量级，再据此反推 $\Delta t$ 上限，比盲目试错高效得多。经验上，$\Delta t$ 取 $1/\lvert\lambda_c\rvert$ 的十分之一通常已经安全。

## 4. 工程做法与参数

- 接口精简：只暴露稳定的参数与输入输出，避免用大量内部变量泄露实现；为每个变量填写 `unit`、`displayUnit`、`start`、`min/max`，并写明符号约定。
- 步长选择：先用跨组件最快时间常数 $\tau_{min}$ 估算，取 $\Delta t \leq \tau_{min}/10$；再对 $1/\Delta t$ 做敏感性扫描，直到关键轨迹对步长不敏感为止。
- 迭代耦合：出现直接馈通或强耦合时，在同一通信点内做 2～10 次高斯—赛德尔迭代并设残差容差；若残差下降很慢，说明耦合过强，应改选 ME 或重新划分系统边界。
- 迭代与步长的取舍：当接口谱半径略小于 1 时，迭代耦合比一味减小步长更划算，因为它不改变时间网格；反之若谱半径接近或超过 1，任何迭代都不收敛，必须改换耦合方式或拆分子系统。
- 版本与平台：FMI 2.0 成熟、工具支持广；FMI 3.0 增加数组、时钟、网络化与 scheduled execution，但要确认双方都支持。导出时按目标平台生成 32/64 位库，注明运行时依赖。
- 事件处理：CS 需确认 FMU 是否要求事件时刻强制截断步长（`eventModeUsed`）；ME 需把事件指示量一并导出，否则主求解器无法定位事件。
- 初值与状态管理：导入方必须完整走 `fmi2SetupExperiment`、`fmi2EnterInitializationMode`、`fmi2ExitInitializationMode` 流程，否则 `start` 值可能被默认值覆盖。
- 日志与复现：记录 `modelDescription.xml` 校验值、导出工具版本、编译器与二进制哈希，便于定位“同一模型不同结果”。

## 5. 可复现示例

用注解把模型声明为 FMI 导出单元，并指明代码生成选项：

```modelica
model PipeVolume "可导出为 FMU 的管道容积"
  parameter Modelica.Units.SI.Volume V = 0.01;
  parameter Modelica.Units.SI.Density rho = 998;
  Modelica.Units.SI.Pressure p(start = 1e5, fixed = true);
  Modelica.Units.SI.MassFlowRate m_flow_in;
  Modelica.Units.SI.MassFlowRate m_flow_out;
equation
  V * rho / (1e5 * 1.4) * der(p) = m_flow_in - m_flow_out;
  annotation(Icon(graphics = {Rectangle(extent = {{-20, 20}, {20, -20}})}),
    __cds(exportFMI = true, fmiVersion = "2.0"));
end PipeVolume;
```

导出后用命令行检查接口并按不同通信步长仿真：

```bash
# 解包并查看接口描述
unzip -o PipeVolume.fmu -d /tmp/fmu
xmllint --format /tmp/fmu/modelDescription.xml | head -n 60

# 按 1 ms 通信步长仿真
python -m fmpy.simulate /tmp/fmu/modelDescription.xml \
  --start-time 0 --stop-time 2 --output-interval 0.001 \
  --input 'm_flow_in=0.5'

# 2 秒时程、10 ms 输出间隔，用于比较滞后
python -m fmpy.simulate /tmp/fmu/modelDescription.xml \
  --stop-time 2 --output-interval 0.01
```

验证：同一 FMU 分别以 $10^{-3}$ 与 $10^{-2}$ s 通信步长仿真，把 $p(t)$ 画在同一图上。若大步长出现明显相位滞后或振荡，说明耦合被显式化，需减小步长或改用迭代耦合。再用一个已知质量的极简主控程序回放，排除主控程序本身的读取协议错误。

## 6. 常见坑与排查

- 代数环未解：接口存在直接馈通却用显式交换，表现为输出抖动或发散；检查 `directDependencies` 并启用迭代。
- 事件漏检：CS 主控方把通信点设在事件之间，输出出现突跳；确认 FMU 是否要求事件时截断。
- 平台不匹配：Linux 上导出的库在 Windows 主控方加载失败；核对 `binaries` 目录与 ABI。
- 时间单位错：`independent` 单位与主控方时钟不一致，步长差 1000 倍，结果看似“慢了”或“快了”。
- 因果冲突：把本应 `output` 的量声明为 `input`，或两个 FMU 同时强制同一界面量，导致连接集合过定。
- 求解器错配：ME 的 FMU 被当作 CS 使用（无内置求解器），或对刚性系统用显式主求解器。
- 初始不一致：导入方未走完整初始化流程，初值被静默覆盖；或两侧对同一储能的初始分配相矛盾。
- 版本混用：导出用 FMI 3.0，导入工具只支持 2.0，接口属性被忽略。

诊断顺序：接口描述核对 → 直接馈通与代数环 → 通信步长敏感性 → 事件截断 → 平台与单位。

## 7. 检查清单与参考

检查清单：
1. 明确选 ME 还是 CS，并记录理由；
2. 每个变量的因果、可变性、单位、初值与范围都显式声明；
3. 检查是否存在直接馈通，必要时在通信点内迭代；
4. 通信步长做过敏感性分析，且解析了最快跨组件动态；
5. 事件截断策略明确，无漏检突跳；
6. 目标平台二进制与运行时依赖齐全；
7. 交付前用独立最小主控程序回放基准轨迹；
8. 记录 FMI 版本、工具链与 FMU 校验值。

参考：
1. Modelica Association, *Functional Mock-up Interface Specification 2.0 / 3.0*.
2. Blochwitz T., et al., "Functional Mockup Interface 2.0," *Proc. 9th Modelica Conf.*, 2012.
3. Ochel L., et al., "FMI for Co-Simulation: Parallel, Robust, and Efficient," *ACM TOMACS*, 2018.
4. FMI Project, *Co-Simulation: Recommended Practices for Stability*, 2020.
