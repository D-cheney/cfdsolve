---
template_version: "flowlab-knowledge/1.0"
slug: modelica-kb-initialization-dae
title: Modelica DAE 初始化、start/fixed 与稳态起点
summary: 解释初始化问题、start 与 fixed 属性、initial equation、稳态条件与同伦方法，推导结构平衡准则，提供从最小系统到完整网络逐步消除奇异与不一致初值的流程。
category: { slug: modelica-dynamics-events, name: Modelica 动态、初始化与事件 }
level: 工程
reading_minutes: 17
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [Modelica, 初始化, DAE, start, fixed, homotopy, 稳态]
seo:
  title: Modelica DAE 初始化与稳态起点
  description: 正确使用 start、fixed 和 initial equation，诊断过定、欠定与不一致初值，并用同伦稳健起步。
  keywords: [Modelica initialization, DAE, initial equation, homotopy, fixed]
---

# Modelica DAE 初始化、start/fixed 与稳态起点

仿真开始积分前，工具必须先求解一组初始化方程，确定所有状态、导数、代数变量与离散模式的初值。初始化失败绝大多数来自物理约束冲突或结构不平衡，而非单纯的求解器设置问题。

## 1. 结论与适用场景

结论：`start` 只是非线性求解的初猜；`fixed=true` 或 `initial equation` 才把起始值变成强制约束。初始化方程数必须与需要确定初值的变量数匹配，多一分冲突、少一分不唯一。

适用场景：

- 动态仿真从稳态或指定工况起步；
- 闭环控制、多容积流体网络的初始一致性；
- 物性/几何强非线性导致求解困难时的稳健起步。

不适用：纯代数、无状态的脚本模型通常无需显式初始化。

## 2. 语言机制与数学基础

初始化本质是求解一个（通常非线性、可能含离散）方程组。设需确定初值的未知量数为 $n_0$，可用初始化方程数为 $m_0$，则要求

$$ m_0 = n_0 $$

$m_0 < n_0$ 为欠定（初值不唯一或不确定），$m_0 > n_0$ 为过定（约束冲突）。固定值、`initial equation` 与 `der(x)=0` 都会贡献方程，累加后必须仍满足上式。

稳态初始化要求积分状态的时间导数为零：

$$ \frac{d x}{d t} = 0 $$

但并非所有状态都应稳态化：封闭系统的总质量/能量由初值决定，若同时对每个容积都施加 $der(x)=0$，可能相互冲突或使解不唯一。

同伦（homotopy）把困难方程按参数 $\lambda$ 从简单形式过渡到真实形式：

$$ F(x, \lambda) = (1-\lambda) F_{simple}(x) + \lambda F_{actual}(x) $$

$\lambda$ 由 0 连续增到 1，求解路径在 $\lambda=1$ 处即为目标模型。初始化质量可用残差度量：

$$ r = \left\| F_{init}(x_0) \right\| $$

理想初值应使 $r$ 接近机器精度。离散状态同样需要一致的初值：模式机的初始状态、阀门开闭、控制器积分器状态都必须在初始化阶段确定，否则第一次事件可能给出非物理跳变；工具通常为离散变量提供 `pre` 初值，或由 `initial equation` 指定。

## 3. 关键语法与公式

- `start = v`：给变量一个初猜；配合 `fixed = true` 成为约束。
- `initial equation`：仅在初始化阶段成立的方程。
- `der(x) = 0`：稳态条件。
- `homotopy(actual, simplified)`：声明同伦过渡。
- `nominal`：为缩放提供正规模。

关键约束写法：

```modelica
model InitDemo
  Modelica.Units.SI.Temperature T(start = 300, fixed = true);
  Modelica.Units.SI.Pressure p(start = 1.0e5, fixed = true);
  Real m(start = 1.0);
equation
  der(T) = 0;   // 稳态初始化
initial equation
  der(m) = 0;   // 初始库存不变
end InitDemo;
```

`fixed` 只在初始化阶段生效；仿真开始后变量按方程自由演化。

## 4. 工程做法与参数

只固定必要的状态：把所有变量设 `fixed=true` 会过定。通常固定物理上已知的储能状态或边界条件，其余由方程确定。

提供物理初猜与 nominal：让非线性变量的 `start` 与 `nominal` 同量级，改善缩放。

稳态起点：先确认外部质量、能量与控制信号允许稳态存在且唯一，再选择哪些状态设 $der(x)=0$。

同伦与参数渐进：先用简化物性或线性关联式起步，再逐步切换到真实模型；最终必须保留目标模型的完整方程。

分层诊断：从组件级最小示例开始，再逐步扩大网络。

诊断顺序：先看展开后的初始化未知量与方程；再识别冲突固定值、冗余边界与奇异连接；为非线性变量补充物理初猜与 nominal；必要时用同伦从简化方程起步，最后恢复完整模型并保存回归案例。

保存回归案例：把可复现的初始化场景固化为测试。

## 5. 可复现示例

```modelica
model TankInit
  parameter Modelica.Units.SI.Volume V = 1.0;
  Modelica.Units.SI.Mass m(start = 800, fixed = true);
  Modelica.Units.SI.MassFlowRate m_flow_in;
  Modelica.Units.SI.MassFlowRate m_flow_out;
  Modelica.Units.SI.Pressure p;
equation
  der(m) = m_flow_in - m_flow_out;
  p = homotopy(m * 1.0e5 / V, 1.0e5);
initial equation
  der(m) = 0;              // 稳态液位
  m_flow_in = m_flow_out;  // 进出平衡
end TankInit;
```

从简化同伦式起步可避免零流量、零压差造成的奇异；求解成功后 $\lambda=1$ 处的解即真实初值。

## 6. 常见坑与排查

- 过定：多个边界同时固定压力、总质量与各容积压力。检查是否 $m_0 > n_0$。
- 欠定：关键储能状态未固定。检查是否 $m_0 < n_0$。
- 不一致初值：各自合理的 `start` 组合无法同时满足方程，初始化失败。给出一致初猜。
- 盲目稳态化：对封闭系统所有状态施加 $der(x)=0$ 导致冲突或不唯一。
- 奇异缩放：变量量级跨多个数量级且未给 `nominal`。
- 数学可解但物理不可能：例如负质量、越界温度。检查物性有效范围。
- 升级库后初始化行为变化：参数默认值或方程结构改变，重跑回归。

## 7. 检查清单与参考

- $m_0 = n_0$ 是否成立；
- 仅固定必要状态；
- 关键非线性变量已给 `start` 与 `nominal`；
- 稳态条件与外部条件一致；
- 同伦/渐进保留最终真实方程；
- 检查 $t=0$ 的守恒残差、库存与离散模式；
- 不同初猜收敛到同一物理解；
- 已保存可复现的初始化回归案例。

参考：

1. Modelica Association, *Modelica Language Specification* — Initialization and Homotopy.
2. Cellier & Kofman, *Continuous System Simulation*.
3. Modelica Standard Library, `Modelica.Fluid` 的初始化与 `homotopy` 用法。
