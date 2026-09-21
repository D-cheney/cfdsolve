---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-rarefied-flow-diagnosis-validation
title: "稀薄气体与滑移流：结果诊断与可信度验证"
summary: "给出微通道稀薄流的诊断量：Kn 分布、滑移速度与 Maxwell 解析值之比、以及连续介质的四条硬性约束；含一个 1 微米管径滑移流量手算核对与 DSMC 参数校核清单。"
category:
  slug: physics
  name: "流体力学基础"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "流体力学基础"
  - "稀薄气体与滑移流"
  - "结果诊断与可信度验证"
  - "Maxwell 滑移"
  - "DSMC"
seo:
  title: "稀薄气体与滑移流：结果诊断与可信度验证"
  description: "给出微通道稀薄流的诊断量：Kn 分布、滑移速度与 Maxwell 解析值之比、以及连续介质的四条硬性约束；含一个 1 微米管径滑移流量手算核对与 DSMC 参数校核清单。"
  keywords:
    - "稀薄气体与滑移流"
    - "结果诊断与可信度验证"
    - "Maxwell 滑移"
    - "Knudsen 数"
    - "DSMC"
---

# 稀薄气体与滑移流：结果诊断与可信度验证

稀薄流算例出错的方式很集中：要么滑移边界根本没用上，要么用了却在 Kn 已经超过 0.1 的地方继续用。判断结果是否可信，需要的不是更多云图，而是三个可以直接算出来的数：当地 Kn 分布、壁面滑移速度与 Maxwell 解析值之比、以及连续介质假设还剩下的裕度。下面给出这三个量的算法与判定阈值。

## 1 Kn 必须按当地梯度尺度算

$$
Kn = \frac{\lambda}{L},\qquad \lambda = \frac{\mu}{\rho}\sqrt{\frac{\pi}{2RT}}
$$

$L$ 是当地宏观梯度尺度，不是几何总长。管道内沿程压力下降会导致密度下降、$\lambda$ 上升，因此出口 Kn 可以比入口高一个量级。诊断时必须输出 $Kn$ 场，并在报告里给出最小、最大与出口面平均值。

以空气 $T=300\,\mathrm{K}$、$\mu=1.86\times10^{-5}\,\mathrm{Pa\cdot s}$ 为例：

- $p=101325\,\mathrm{Pa}$：$\rho=p/(RT)=101325/(287\times300)=1.177\,\mathrm{kg/m^3}$，$\lambda=67.5\,\mathrm{nm}$；
- $p=10132\,\mathrm{Pa}$：$\rho=0.1177\,\mathrm{kg/m^3}$，$\lambda=675\,\mathrm{nm}$，正好十倍。

所以同一根管子，只要压比到 10，两端就落在不同流区。用单一 $Kn$ 值选模型是这类算例最普遍的误判。

## 2 滑移速度的定量对账

Maxwell 一阶滑移边界给出壁面滑移速度：

$$
u_s - u_w = \frac{2-\sigma_v}{\sigma_v}\,\lambda\left.\frac{\partial u}{\partial n}\right|_w
$$

$\sigma_v$ 是切向动量适应系数，工程上常取 1（完全漫反射），真实表面在 0.8~1.0 之间。对圆管 Poiseuille 流，一阶滑移解给出流量增强因子：

$$
\frac{Q}{Q_0} = 1 + 4\,\frac{2-\sigma_v}{\sigma_v}\,Kn,\qquad Kn=\frac{\lambda}{R}
$$

**手算核对。** 微管半径 $R=1\,\mu\mathrm{m}$，常压空气 $\lambda=67.5\,\mathrm{nm}$，$\sigma_v=1$：

1. $Kn=67.5\times10^{-9}/1\times10^{-6}=0.0675$，落在滑移区（$0.001<Kn<0.1$）；
2. $Q/Q_0=1+4\times0.0675=1.27$，即滑移使流量提高 27%；
3. 反过来，若求解器用无滑移边界，质量流量会偏低 $1-1/1.27=21\%$。

因此诊断阈值可以定得很干脆：计算得到的 $u_s/u_{s,Maxwell}$ 应在 0.9~1.1 之间；偏离超过 20% 就说明适应系数、法向导数离散或壁面网格有问题。若 $Kn>0.1$（例如把压力降到 0.1 bar 后 $Kn=0.675$），一阶滑移解本身就失效，此时 $Q/Q_0$ 的解析式不再适用，必须换 DSMC 或二阶滑移/ Burnett 类模型。

## 3 连续介质还剩下的四条约束

1. **网格尺度必须大于 $\lambda$**。若壁面首层高度小于 67.5 nm 的若干倍，Navier-Stokes 在单元内已无意义；滑移边界的作用正是避免解析 Knudsen 层，因此首层高度应取 $\gg\lambda$。
2. **时间步需小于当地流动特征时间，但不必小于分子碰撞时间**，因为连续介质已经把碰撞平均掉了。
3. **温度跳跃不能忽略**。若壁面有热流，需同时施加 Smoluchowski 温度跳跃：

$$
T_s - T_w = \frac{2-\sigma_T}{\sigma_T}\frac{2\gamma}{\gamma+1}\frac{\lambda}{Pr}\left.\frac{\partial T}{\partial n}\right|_w
$$

空气 $\gamma=1.4$、$Pr=0.71$，系数 $2\gamma/(\gamma+1)=1.167$。只给速度滑移不给温度跳跃，会系统性高估壁面热流。

4. **压比不能太大**。若进出口压比超过 2，管内出现强可压缩与黏性加热，一阶滑移解误差快速上升，应改用可压缩滑移求解器并做网格无关性。

## 4 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面滑移速度恒为零，但 Kn 已在 0.01 量级 | 求解器未施加滑移边界 | 输出壁面切向速度并与 $\lambda\partial u/\partial n$ 手算值对比 |
| 质量流量比解析解低约 20%，其余量都正常 | 用了无滑移边界 | 把边界换成滑移重算，看流量是否跳到 $1+4Kn$ 倍 |
| 出口 Kn 与入口相差十倍而模型未分段 | 用全局单一 Kn 选模型 | 输出 Kn 场并检查出口面平均值 |
| 壁面热流偏高，速度场却对得上 | 缺少温度跳跃条件 | 加入温度跳跃项，比较壁面热流变化 |
| DSMC 结果随网格变粗单调变化 | 单元尺寸超过 $\lambda/3$ | 按 $\lambda/3$ 细化并对时间步做二分之一收敛试验 |
| 减压后流量增强远超 $1+4Kn$ 预测 | 已越过 $Kn=0.1$，一阶滑移失效 | 用 DSMC 或二阶滑移复算同一工况 |

## 5 DSMC 参数校核与边界片段

DSMC 的三条硬约束：单元尺寸小于 $\lambda/3$、时间步小于 $0.1\lambda/\bar c$、每单元模拟分子数不少于 20。常压空气 $\lambda=67.5\,\mathrm{nm}$，分子平均速率

$$
\bar c = \sqrt{\frac{8RT}{\pi}} = \sqrt{\frac{8\times287\times300}{3.1416}} = 468\,\mathrm{m/s}
$$

于是单元上限 $22.5\,\mathrm{nm}$、时间步上限 $0.1\times67.5\times10^{-9}/468=1.44\times10^{-11}\,\mathrm{s}$。这个尺度意味着常压微米管的全三维 DSMC 代价极高，实际做法是升压或缩短计算域，并明确记录这一取舍。

滑移边界在 OpenFOAM 中的写法：

```cpp
wall
{
    type                maxwellSlipU;
    accommodationCoeff  1.0;      // 切向动量适应系数 sigma_v
    Uwall               uniform (0 0 0);
    Twall               uniform 300;
    value               uniform (0 0 0);
}

outlet
{
    type        pressureInletOutletVelocity;
    value       uniform (0 0 0);
}
// 建议同时开启: fvSchemes 中用二阶迎风; fvSolution 中 p 残差 < 1e-7
```

## 6 归档要点

记录 $\lambda$ 的计算公式与所用 $\mu(T)$ 关系；记录 $\sigma_v$、$\sigma_T$ 取值及其来源（实验值还是默认 1.0）；记录 $Kn$ 的场统计与出口面平均值；记录滑移开关的开与关两组结果，二者之差应恰好等于解析预测的流量增强因子。若这个差值与解析值不符，先查壁面法向导数的离散精度，再查适应系数，最后才怀疑求解器。

## 参考资料

1. Maxwell J.C., "On Stresses in Rarified Gases Arising from Inequalities of Temperature," *Philosophical Transactions of the Royal Society of London*, 170, 231-256, 1879.
2. Kennard E.H., *Kinetic Theory of Gases, with an Introduction to Statistical Mechanics*, McGraw-Hill, New York, 1938.
3. Bird G.A., *Molecular Gas Dynamics and the Direct Simulation of Gas Flows*, Oxford University Press, 1994.
4. Schaaf S.A., Chambré P.L., "Flow of Rarefied Gases," in *Fundamentals of Gas Dynamics*, Princeton University Press, 1958.
5. Gad-el-Hak M., "The Fluid Mechanics of Microdevices—The Freeman Scholar Lecture," *Journal of Fluids Engineering*, 121(1), 5-33, 1999.
