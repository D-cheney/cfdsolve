---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-result-validation
title: Modelica 仿真结果的守恒、步长与回归验证
summary: 用方程残差、能量与质量预算、容差扫描和带容差的回归指标检验系统模型，区分"翻译初始化成功"与"动态结果可信"，并给出自带解析解断言与守恒断言的回归示例。
category: { slug: modelica-simulation-quality, name: "Modelica 仿真与质量" }
level: 工程
reading_minutes: 13
status: PUBLISHED
author_username: codex-generated
published_at: "2026-09-13T00:00:00.000Z"
tags: [Modelica, 验证, 守恒, 容差, 回归测试]
seo:
  title: Modelica 仿真结果的守恒、步长与回归验证｜CFD菜鸟
  description: 用残差、能量预算、容差扫描与回归指标判断动态仿真结果是否可信。
  keywords: [Modelica 验证, 守恒, 容差扫描, 回归测试]
---

# Modelica 仿真结果的守恒、步长与回归验证

模型成功翻译和初始化，只说明工具找到了一个可用的代数初始状态；动态结果是否可信，还需要对守恒、残差、容差与回归逐项检查。把"能算出来"当作"算得对"，是系统仿真最常见的误判。

## 1. 结论与适用场景

应区分 verification（数值上是否正确求解了方程组）与 validation（方程组是否描述了真实系统）。当存在解析解、守恒量或实验基准时，应优先用于验证；当只有工程经验时，退而检查量级、趋势与守恒是否合理。若模型会被反复使用、持续迭代，应把验证固化为带容差的自动回归指标，而不是每次靠人眼比对曲线。适用场景包括部件级组件、系统级回路以及联合仿真接口：越是被下游复用的模型，越需要自动化验证，否则一次看似无害的改动可能在数周后才暴露问题。

## 2. 物理/数学基础

Modelica 求解的是微分代数方程组的残差

$$r(t)=F(t,x,\dot x,y)$$

数值解在每个输出点都应让残差接近零。对封闭机械系统，总能量可写成

$$E(t)=\sum_i\left(\frac{1}{2}m_iv_i^2+V_i(q_i)\right)$$

无阻尼、无外功时，$E(t)$ 的变化应与积分误差一致；有阻尼与外部输入时，应建立能量预算

$$\Delta E=\int_0^T\left(\dot Q+\dot W\right)dt-D,\qquad D\geq 0$$

其中 $D$ 为耗散，应恒为非负。与之并列的是质量守恒

$$\frac{dm}{dt}=\sum_{j}\dot m_{j,\mathrm{in}}-\sum_{j}\dot m_{j,\mathrm{out}}$$

热、流体与电气域都应建立对应守恒量：焓、质量、电荷与磁链。验证前先确认每个子系统的守恒与量级合理，再逐层向上组合，这样一旦预算不闭合，可以快速缩小到某个分支。

## 3. 关键模型与公式

把仿真结果与基准比较时，常用相对范数误差

$$\varepsilon=\frac{\lVert\hat y-y\rVert_2}{\lVert y\rVert_2}$$

以及均方根误差

$$\mathrm{RMSE}=\sqrt{\frac{1}{N}\sum_{k=1}^{N}\left(\hat y_k-y_k\right)^2}$$

对逐点回归则要求满足绝对容差

$$|\hat y_k-y_k^{ref}|\leq \mathrm{tol}_k$$

不同求解器可能使用不同步长仍得到等价轨迹，因此回归容限应围绕物理输出定义，而不是逐点比较全部浮点结果。事件系统可用事件次数、切换序列与首次触发时间作为回归指标，这些量对数值细节不敏感，却对逻辑错误非常敏感。

## 4. 工程做法与参数

可行的验证组合是：对可解析的简化模型比较频率、稳态值与时间常数；把相对容差收紧十倍，比较峰值、事件时刻与积分量；限制最大步长，确认快速动态与控制采样被解析；改变初始化猜值，检查是否落入不同工作点。发布结果时记录工具版本、求解算法、容差、输出间隔与参数集。只保存绘图采样点可能遗漏求解器内部事件与高频变化，因此结果文件应保留足够密集的输出。回归基线应随代码一起纳入版本管理，并在语言、标准库或第三方库升级后批量重跑。建议对每个守恒量生成预算曲线（储能、输入功、耗散随时间的变化），一旦某段时间出现非物理的负耗散或突变，就说明模型或数值出了问题，应定位到具体组件而非整体。

## 5. 可复现示例

下面用自由落体给出自带解析解断言的回归检查。

```modelica
model FreeFallCheck "解析解回归：自由落体"
  parameter Real g = 9.81;
  parameter Real h0 = 100;
  Real y(start=h0, fixed=true);
  Real v(start=0, fixed=true);
equation
  der(y) = v;
  der(v) = -g;
  when terminal() then
    assert(abs(y - (h0 - 0.5*g*1^2)) < 1e-3,
           "t=1s 时 y 应等于解析解 95.095 m");
  end when;
  annotation(experiment(
    StartTime=0, StopTime=1, Tolerance=1e-8, Interval=0.01));
end FreeFallCheck;
```

下面再给出一个运行到稳态后核算能量预算的断言，用于检查守恒是否闭合。

```modelica
model EnergyBudgetCheck "能量预算断言"
  parameter Real c=500, m=2, T_amb=293.15, P_heat=100;
  Real T(start=T_amb, fixed=true);
  Real E_in(start=0, fixed=true);
  Real E_loss(start=0, fixed=true);
equation
  m*c*der(T) = P_heat - 5*(T - T_amb);
  der(E_in) = P_heat;
  der(E_loss) = 5*(T - T_amb);
  when terminal() then
    assert(abs(E_in - E_loss - m*c*(T - T_amb)) < 1.0,
           "能量预算不闭合");
  end when;
end EnergyBudgetCheck;
```

运行通过表示数值解在容差内复现了解析解或守恒关系；若断言失败，应优先检查单位、容差与事件设置，而不是直接归咎于求解器。

## 6. 常见坑与排查

- 把翻译或初始化成功当作结果正确；
- 只比对曲线形状，不核算守恒量；
- 用默认容差直接下结论，未做容差扫描；
- 回归逐点比较浮点，产生无意义抖动；
- 未固定工具与库版本，升级后无法复现；
- 只保存稀疏采样，丢失内部事件与高频变化；
- 事件时刻偏移被忽略，导致切换逻辑错位。

## 7. 检查清单与参考

1. 是否有解析解、守恒量或实验基准可用；
2. 残差、能量预算与质量/电荷平衡是否闭合；
3. 是否完成至少十倍的容差扫描并确认收敛；
4. 回归指标是否带容差且面向物理输出；
5. 是否记录工具版本与完整实验设置。

参考：1. Modelica Association, *Modelica Language Specification*；2. 所用 Modelica 工具的 Simulation 与 Validation 文档；3. Roache, *Verification and Validation in Computational Science and Engineering*。
