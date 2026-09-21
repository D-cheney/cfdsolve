---
template_version: "flowlab-knowledge/1.0"
slug: modelica-integration-hardware-in-loop-diagnosis-validation
title: "实时与硬件在环：结果诊断与可信度验证"
summary: "HIL 的结论只有“能在截止时刻前算完”或“不能”。本文用截止期利用率、采样保持相位滞后与实时因子三条可测量判据，把 1 kHz 回路的偶发超时定位到调度、I/O 或模型三段。"
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
  - "实时与硬件在环"
  - "结果诊断与可信度验证"
  - "截止期利用率与相位滞后"
seo:
  title: "实时与硬件在环：结果诊断与可信度验证"
  description: "HIL 的结论只有“能在截止时刻前算完”或“不能”。本文用截止期利用率、采样保持相位滞后与实时因子三条可测量判据，把 1 kHz 回路的偶发超时定位到调度、I/O 或模型三段。"
  keywords:
    - "实时与硬件在环"
    - "结果诊断与可信度验证"
    - "截止期利用率"
    - "采样保持相位滞后"
---

# 实时与硬件在环：结果诊断与可信度验证

HIL 的结论只有两种：回路能在截止时刻前算完，或不能。验证的核心因此不是“结果是否好看”，而是“最坏执行时间加 I/O 延迟是否稳定小于步长”。下面给出三条可直接测量的判据——截止期利用率、采样保持相位滞后、实时因子——并用 1 kHz 回路的一次手算说明如何把偶发超时定位到具体环节。

## 实时性是可测的，不是可声称的

被测控制器与实时仿真机之间只有两类信号：定步长的模型输出和带时间戳的 I/O。`annotation(experiment(...))` 中的 `Interval` 决定导出 FMU 的默认步长，`Tolerance` 决定内部求解精度；导出为定步长 FMU 时 `Tolerance` 被忽略，实际误差改由步长与积分格式决定。

```modelica
model HilPlant "以定步长导出的 HIL 被控对象"
  parameter Real T_s(unit = "s") = 1.0e-3 "通信与采样步长";
  Real w(unit = "rad/s", start = 0.0, fixed = true);
  Real T_m(unit = "N.m");
  Modelica.Blocks.Interfaces.RealInput u(unit = "1");
  Modelica.Blocks.Interfaces.RealOutput y(unit = "rad/s");
equation
  T_m = 2.5*u - 0.02*w;
  der(w) = (T_m - 0.5*w)/0.8;
  y = w;
  annotation(experiment(StartTime = 0.0, StopTime = 600.0,
                        Tolerance = 1e-6, Interval = 1.0e-3),
             __Dymola_Algorithm = "Euler");
end HilPlant;
```

## 截止期利用率与超时归因

每个采样周期 $T_s$ 内必须完成模型推进、I/O 读写与调度开销，因此

$$U=\frac{C_{wcet}+L_{io}+J_{max}}{T_{s}}\le U_{max}\approx 0.7$$

取 $T_s=1.0\,\mathrm{ms}$、最坏执行时间 $C_{wcet}=0.42\,\mathrm{ms}$、I/O 往返 $L_{io}=0.15\,\mathrm{ms}$、抖动上界 $J_{max}=0.03\,\mathrm{ms}$，得 $U=0.60$，留有 40% 余量。余量看似充足，但实测 600 s 内有 3.5% 的周期 $C_{wcet}$ 升到 $1.10\,\mathrm{ms}$，此时 $U=1.28>1$，必然超时。归因办法是把每个周期的三段耗时分别打点：若 $C_{wcet}$ 的尖峰与网络中断处理同时出现，问题在操作系统调度而不在模型本身。

实时因子是另一把尺子：

$$\mathrm{RTF}=\frac{t_{sim}}{t_{wall}}\ge 1$$

本次运行 $t_{sim}=600\,\mathrm{s}$、$t_{wall}=444\,\mathrm{s}$，$\mathrm{RTF}=1.35$，平均意义上够快。但 RTF 是平均值，会掩盖那 3.5% 的超时周期，所以它不能替代 $U$ 的逐周期统计。

## 采样保持与相位滞后

定步长回路里，模型输出经零阶保持送入控制器，等效于半个步长的纯延迟；I/O 链路再叠加 $L_{io}$。总相位滞后为

$$\varphi=\omega\left(\frac{T_{s}}{2}+L_{io}\right)$$

控制带宽取 $f=20\,\mathrm{Hz}$ 时 $\omega=125.66\,\mathrm{rad/s}$，$\varphi=125.66\times(0.5\times10^{-3}+0.15\times10^{-3})=0.0817\,\mathrm{rad}=4.68^{\circ}$。同一保持环节还带来幅值衰减 $\mathrm{sinc}(\omega T_s/2)=\sin(0.0628)/0.0628=0.9993$，即 $-0.006\,\mathrm{dB}$，可以忽略。加入一阶超前补偿 $\tau_{lead}=0.65\,\mathrm{ms}$ 后残差相位降到 $0.9^{\circ}$；若把 $T_s$ 放宽到 $5.0\,\mathrm{ms}$，相位滞后升到 $23.4^{\circ}$，此时再用补偿会把高频噪声放大 3.8 倍。

## 一次 1 kHz 回路的判定计算

把三段拼成一次完整判定：$U=0.60$ 却存在 3.5% 超时周期，定位到调度抖动 $J_{max}$ 从 $0.03\,\mathrm{ms}$ 恶化到 $0.60\,\mathrm{ms}$，把余量吃满。把实时任务优先级提到 I/O 线程之上后，超时周期占比降到 0.2%，$C_{wcet}$ 的 99.9 分位从 $1.10\,\mathrm{ms}$ 回到 $0.58\,\mathrm{ms}$。相位滞后 $4.68^{\circ}$ 与幅值衰减 $0.006\,\mathrm{dB}$ 均在接受范围内。最终验收取三条：超时周期占比小于 0.5%、$\mathrm{RTF}\ge1.2$、接口功残差相对值不大于 $10^{-3}$。

```bash
python - <<'PY'
import fmpy
md = fmpy.read_model_description("HilPlant.fmu")
de = md.default_experiment
print(de.start_time, de.stop_time, de.tolerance, de.step_size)
# 0.0 600.0 1e-06 0.001
PY
```

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 3.5% 周期超时，$C_{wcet}$ 升到 $1.10\,\mathrm{ms}$ | 实时任务优先级低于 I/O 线程，被抢占 | 提升优先级后重跑，超时占比应小于 0.5% |
| $\mathrm{RTF}=1.35$ 却仍丢帧 | RTF 是平均值，掩盖尾部超时 | 统计每周期耗时分布，看 99.9 分位 |
| 20 Hz 处相位滞后比理论大 $2.5^{\circ}$ | I/O 链路实际延迟大于标称 $0.15\,\mathrm{ms}$ | 用时间戳打点测往返延迟，逐段核对 |
| 高频段噪声被放大 3.8 倍 | 超前补偿时间常数与步长同量级 | 把 $T_s$ 从 $5.0\,\mathrm{ms}$ 收回 $1.0\,\mathrm{ms}$ |
| 实时机与离线结果偏差 0.8% | 定步长导出忽略 `Tolerance`，误差由步长决定 | 用 `Interval=1e-4` 重新导出并对比 |
| 步长减半后超时占比翻倍 | $C_{wcet}$ 中 I/O 固定开销占比过高 | 分别记录模型耗时与 I/O 耗时，看哪一项不随步长缩放 |

## 降级策略与版本核对

超时不可避免时，回路必须有确定的降级行为：跳过本次 I/O 并保持上一拍输出，还是切到更简化的降级 FMU。无论选哪种，都要在验收记录里写明触发阈值（本算例取连续 3 个周期超时）与恢复条件。版本核对三件事：`modelDescription.xml` 中的 `stepSize` 与 `tolerance`、实时机上的编译选项（是否开启会改变浮点行为的快速数学开关）、以及 FMU 的 SHA-256。任何一项变化都会让 $U$ 与相位判定的结论失效。

## 参考文献

1. Kopetz H., *Real-Time Systems: Design Principles for Distributed Embedded Applications*, 2nd ed., Springer, 2011.
2. Isermann R., Schaffnit J., Sinsel S., "Hardware-in-the-loop simulation for the design and testing of engine-control systems", *Control Engineering Practice*, 7(5), 1999, pp. 643-653.
3. Bacic M., "On hardware-in-the-loop simulation", *Proc. 44th IEEE Conference on Decision and Control*, 2005, pp. 3194-3198.
4. Franklin G. F., Powell J. D., Emami-Naeini A., *Feedback Control of Dynamic Systems*, 7th ed., Pearson, 2015.
5. Modelica Association, *Functional Mock-up Interface Specification 3.0*, 2022, §2.3 Co-Simulation.
6. Modelica Association, *Distributed Co-Simulation Protocol (DCP) Specification 1.0*, 2019.
7. Modelica Association, *Modelica Language Specification 3.6*, 2023, §8.6 事件与状态事件.
