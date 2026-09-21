---
template_version: flowlab-knowledge/1.0
slug: cfd-physics-rarefied-flow-modeling
title: 稀薄气体与滑移流：原理与诊断验证
summary: >-
  以 Knudsen 数为轴梳理连续介质、滑移、过渡与自由分子四个流区对应的模型层级，说明局部梯度 Kn 为何会推翻全局判据，并给出 80 km
  高空高超声速绕流的量级估算。 全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: physics
  name: 流体力学基础
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 流体力学基础
  - 稀薄气体与滑移流
  - 物理建模与适用边界
  - Boltzmann 方程
  - 梯度长度 Kn
  - 结果诊断与可信度验证
  - Maxwell 滑移
  - DSMC
seo:
  title: 稀薄气体与滑移流：原理与诊断验证
  description: >-
    以 Knudsen 数为轴梳理连续介质、滑移、过渡与自由分子四个流区对应的模型层级，说明局部梯度 Kn 为何会推翻全局判据，并给出 80 km
    高空高超声速绕流的量级估算。 全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 稀薄气体与滑移流
    - 物理建模与适用边界
    - Boltzmann 方程
    - 梯度长度 Kn
    - 高超声速稀薄流
    - 结果诊断与可信度验证
    - Maxwell 滑移
    - Knudsen 数
    - DSMC
---
# 稀薄气体与滑移流：原理与诊断验证

## 原理与适用范围

把 Navier-Stokes 换成 Boltzmann 方程，代价从"解 5 个守恒量"变成"解 7 维分布函数"。做这个替换之前，必须证明连续介质假设确实破了，而且要证明破在哪里。本文给出从分子平均自由程到模型层级的完整判据链，并指出全局 Knudsen 数在激波、膨胀扇这类强梯度区会严重低估稀薄程度。

### 1 从分子平均自由程到 Knudsen 数

$$
Kn = \frac{\lambda}{L},\qquad \lambda = \frac{\mu}{p}\sqrt{\frac{\pi R T}{2}}
$$

$L$ 是宏观梯度尺度，$\lambda$ 是分子平均自由程。按 $Kn$ 划分四个流区，并对应到模型：

| 流区 | Kn 范围 | 适用模型 | 失效信号 |
|---|---|---|---|
| 连续介质 | $<10^{-3}$ | Navier-Stokes + 无滑移 | 壁面滑移量超过速度的 1% |
| 滑移流 | $10^{-3}\sim10^{-1}$ | Navier-Stokes + Maxwell 滑移与温度跳跃 | 滑移修正后流量变化超过 20% |
| 过渡流 | $0.1\sim10$ | Boltzmann 直接求解、DSMC、Burnett/Grad-13 | 应力与热流不再正比于梯度 |
| 自由分子流 | $>10$ | 无碰撞 Boltzmann、分子-壁面作用主导 | 分子间碰撞可忽略 |

分界线不是硬门槛，而是模型误差的可接受范围。滑移流上界 0.1 的来源是：一阶滑移解的相对误差大致按 $Kn$ 线性增长，到 $Kn=0.1$ 时误差已达百分之几量级，再往上就必须换模型。

### 2 局部梯度 Kn 会推翻全局判据

$$
Kn_{GL} = \frac{\lambda}{\rho}\left|\nabla \rho\right|
$$

这是 Boyd 提出的梯度长度判据，工程上把 $Kn_{GL}>0.05$ 作为连续介质失效的阈值。它和 $Kn=\lambda/L$ 的区别在于：分母用的是当地密度梯度尺度，而不是几何尺寸。激波、膨胀扇、混合层里梯度尺度可以只有几何尺寸的百分之一，此时全局 Kn 说"没问题"，局部却早已失效。

**高超声速算例。** 80 km 高空：$\rho=1.85\times10^{-5}\,\mathrm{kg/m^3}$、$T=200\,\mathrm{K}$、$\mu=1.33\times10^{-5}\,\mathrm{Pa\cdot s}$。

1. $\mu/\rho=0.719$；$\sqrt{\pi/(2RT)}=\sqrt{3.1416/(2\times287\times200)}=\sqrt{2.7366\times10^{-5}}=5.231\times10^{-3}$；
2. $\lambda=0.719\times5.231\times10^{-3}=3.76\times10^{-3}\,\mathrm{m}\approx3.8\,\mathrm{mm}$；
3. 飞行器全长 2 m：$Kn=3.76\times10^{-3}/2=1.9\times10^{-3}$，勉强算连续介质；
4. 头部钝化半径 0.1 m：$Kn=0.038$，落在滑移区；
5. 激波脱体距离 0.05 m：$Kn=0.075$，接近过渡流上界；
6. 激波内部：密度在约 1 mm 内跃升 8 倍，$|\nabla\rho|/\rho\approx8/10^{-3}=8\times10^{3}\,\mathrm{m^{-1}}$，故 $Kn_{GL}=3.76\times10^{-3}\times8\times10^{3}=30$，远超 0.05。

结论很明确：同一算例里，远场可用 Navier-Stokes，壁面需滑移，激波必须用 DSMC 或至少是激波修正的动理学方法。把整个流场交给单一模型，必然在某一区域出错。

### 3 模型层级与升级判据

**第一级：Navier-Stokes + 无滑移。** 只适用于 $Kn<10^{-3}$ 且无强梯度区。它是所有后续模型的基准线。

**第二级：Navier-Stokes + 一阶滑移与温度跳跃。** 补回壁面附近分子的非平衡输运。代价极小，只需壁面边界条件与适应系数。升级判据是 $Kn>10^{-3}$ 或壁面滑移量超过特征速度的 1%。

**第三级：Burnett、Grad-13 等扩展流体力学方程。** 在 Navier-Stokes 的应力与热流里加入高阶梯度项，把适用范围推到 $Kn\sim0.5$。代价是方程出现病态解分支，边界条件数量也随之增加，工程使用需谨慎。

**第四级：DSMC。** 直接模拟分子运动与碰撞，$Kn$ 从 0.05 到自由分子流都适用。代价是单元尺寸受 $\lambda/3$ 限制，常压微尺度问题的计算量会爆炸。

**第五级：Boltzmann 直接求解。** 精度最高，但维度高、数值难度大，主要用于一维松弛与验证。

### 4 尺度判断决定选型，而不是几何判断

同样 1 μm 的间隙，常压空气 $Kn=0.0675$（滑移），真空腔 $10^{-3}\,\mathrm{mbar}$ 下 $Kn=6.75\times10^{4}$（自由分子）。几何一模一样，物理完全不同。选型时先把这三个数写出来：$\lambda$、特征梯度尺度 $L$、以及二者之比；再看局部梯度判据 $Kn_{GL}$ 有没有超过 0.05。两组数都写不出来，任何模型选择都是猜测。

```python
import math
def regime(rho, T, mu, L, grad_len=None, Rs=287.0):
    lam = (mu / rho) * math.sqrt(math.pi / (2 * Rs * T))
    kn = lam / L
    tag = ("continuum" if kn < 1e-3 else "slip" if kn < 0.1
           else "transition" if kn < 10 else "free-molecular")
    kn_gl = lam / grad_len if grad_len else None
    return dict(lambda_m=lam, Kn=kn, region=tag, Kn_GL=kn_gl)

# 80 km 高空，2 m 飞行器
print(regime(1.85e-5, 200.0, 1.33e-5, 2.0))
# 激波内部，梯度尺度 1 mm
print(regime(1.85e-5, 200.0, 1.33e-5, 0.05, grad_len=1.0e-3))
```

### 5 边界被跨越时的失败信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面热流对网格不收敛，加密后持续上升 | 无滑移/无温度跳跃，Knudsen 层被强行解析 | 加入温度跳跃项后重算，看热流是否稳定 |
| 激波厚度只有 2~3 个单元且随网格变化 | 用 Navier-Stokes 解析非连续结构 | 计算激波内 $Kn_{GL}$，若远大于 0.05 改用 DSMC |
| 全局 Kn 很小但阻力系数对来流压力异常敏感 | 局部梯度区已稀薄，全局判据失效 | 输出 $Kn_{GL}$ 场，定位超阈值区域 |
| 滑移修正后流量增强超过解析预测 | 已越过 $Kn=0.1$，一阶滑移不再成立 | 用二阶滑移或 DSMC 复算同一工况 |
| DSMC 与 Navier-Stokes 在远场也对不上 | 单元尺寸或时间步违反 DSMC 约束 | 做 $\lambda/3$ 与时间步减半两组收敛试验 |
| 真空腔算例残差正常但流场完全无梯度 | 实际处于自由分子流，碰撞项已可忽略 | 计算 $Kn$，若大于 10 改用无碰撞求解 |

### 参考资料

1. Chapman S., Cowling T.G., *The Mathematical Theory of Non-Uniform Gases*, 3rd ed., Cambridge University Press, 1970.
2. Cercignani C., *The Boltzmann Equation and Its Applications*, Springer-Verlag, New York, 1988.
3. Bird G.A., *Molecular Gas Dynamics and the Direct Simulation of Gas Flows*, Oxford Engineering Science Series, Clarendon Press, Oxford, 1994.
4. Boyd I.D., Chen G., Candler G.V., "Predicting Failure of the Continuum Fluid Equations in Transitional Hypersonic Flows," *Physics of Fluids*, 7(1), 210-219, 1995.
5. Tsien H.S., "Superaerodynamics, Mechanics of Rarefied Gases," *Journal of the Aeronautical Sciences*, 13(12), 653-664, 1946.

## 诊断与可信度验证

稀薄流算例出错的方式很集中：要么滑移边界根本没用上，要么用了却在 Kn 已经超过 0.1 的地方继续用。判断结果是否可信，需要的不是更多云图，而是三个可以直接算出来的数：当地 Kn 分布、壁面滑移速度与 Maxwell 解析值之比、以及连续介质假设还剩下的裕度。下面给出这三个量的算法与判定阈值。

### 1 Kn 必须按当地梯度尺度算

$$
Kn = \frac{\lambda}{L},\qquad \lambda = \frac{\mu}{\rho}\sqrt{\frac{\pi}{2RT}}
$$

$L$ 是当地宏观梯度尺度，不是几何总长。管道内沿程压力下降会导致密度下降、$\lambda$ 上升，因此出口 Kn 可以比入口高一个量级。诊断时必须输出 $Kn$ 场，并在报告里给出最小、最大与出口面平均值。

以空气 $T=300\,\mathrm{K}$、$\mu=1.86\times10^{-5}\,\mathrm{Pa\cdot s}$ 为例：

- $p=101325\,\mathrm{Pa}$：$\rho=p/(RT)=101325/(287\times300)=1.177\,\mathrm{kg/m^3}$，$\lambda=67.5\,\mathrm{nm}$；
- $p=10132\,\mathrm{Pa}$：$\rho=0.1177\,\mathrm{kg/m^3}$，$\lambda=675\,\mathrm{nm}$，正好十倍。

所以同一根管子，只要压比到 10，两端就落在不同流区。用单一 $Kn$ 值选模型是这类算例最普遍的误判。

### 2 滑移速度的定量对账

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

### 3 连续介质还剩下的四条约束

1. **网格尺度必须大于 $\lambda$**。若壁面首层高度小于 67.5 nm 的若干倍，Navier-Stokes 在单元内已无意义；滑移边界的作用正是避免解析 Knudsen 层，因此首层高度应取 $\gg\lambda$。
2. **时间步需小于当地流动特征时间，但不必小于分子碰撞时间**，因为连续介质已经把碰撞平均掉了。
3. **温度跳跃不能忽略**。若壁面有热流，需同时施加 Smoluchowski 温度跳跃：

$$
T_s - T_w = \frac{2-\sigma_T}{\sigma_T}\frac{2\gamma}{\gamma+1}\frac{\lambda}{Pr}\left.\frac{\partial T}{\partial n}\right|_w
$$

空气 $\gamma=1.4$、$Pr=0.71$，系数 $2\gamma/(\gamma+1)=1.167$。只给速度滑移不给温度跳跃，会系统性高估壁面热流。

4. **压比不能太大**。若进出口压比超过 2，管内出现强可压缩与黏性加热，一阶滑移解误差快速上升，应改用可压缩滑移求解器并做网格无关性。

### 4 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面滑移速度恒为零，但 Kn 已在 0.01 量级 | 求解器未施加滑移边界 | 输出壁面切向速度并与 $\lambda\partial u/\partial n$ 手算值对比 |
| 质量流量比解析解低约 20%，其余量都正常 | 用了无滑移边界 | 把边界换成滑移重算，看流量是否跳到 $1+4Kn$ 倍 |
| 出口 Kn 与入口相差十倍而模型未分段 | 用全局单一 Kn 选模型 | 输出 Kn 场并检查出口面平均值 |
| 壁面热流偏高，速度场却对得上 | 缺少温度跳跃条件 | 加入温度跳跃项，比较壁面热流变化 |
| DSMC 结果随网格变粗单调变化 | 单元尺寸超过 $\lambda/3$ | 按 $\lambda/3$ 细化并对时间步做二分之一收敛试验 |
| 减压后流量增强远超 $1+4Kn$ 预测 | 已越过 $Kn=0.1$，一阶滑移失效 | 用 DSMC 或二阶滑移复算同一工况 |

### 5 DSMC 参数校核与边界片段

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

### 6 归档要点

记录 $\lambda$ 的计算公式与所用 $\mu(T)$ 关系；记录 $\sigma_v$、$\sigma_T$ 取值及其来源（实验值还是默认 1.0）；记录 $Kn$ 的场统计与出口面平均值；记录滑移开关的开与关两组结果，二者之差应恰好等于解析预测的流量增强因子。若这个差值与解析值不符，先查壁面法向导数的离散精度，再查适应系数，最后才怀疑求解器。

### 参考资料

1. Maxwell J.C., "On Stresses in Rarified Gases Arising from Inequalities of Temperature," *Philosophical Transactions of the Royal Society of London*, 170, 231-256, 1879.
2. Kennard E.H., *Kinetic Theory of Gases, with an Introduction to Statistical Mechanics*, McGraw-Hill, New York, 1938.
3. Bird G.A., *Molecular Gas Dynamics and the Direct Simulation of Gas Flows*, Oxford University Press, 1994.
4. Schaaf S.A., Chambré P.L., "Flow of Rarefied Gases," in *Fundamentals of Gas Dynamics*, Princeton University Press, 1958.
5. Gad-el-Hak M., "The Fluid Mechanics of Microdevices—The Freeman Scholar Lecture," *Journal of Fluids Engineering*, 121(1), 5-33, 1999.
