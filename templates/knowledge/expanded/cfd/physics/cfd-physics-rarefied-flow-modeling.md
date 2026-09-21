---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-rarefied-flow-modeling
title: "稀薄气体与滑移流：物理建模与适用边界"
summary: "以 Knudsen 数为轴梳理连续介质、滑移、过渡与自由分子四个流区对应的模型层级，说明局部梯度 Kn 为何会推翻全局判据，并给出 80 km 高空高超声速绕流的量级估算。"
category:
  slug: physics
  name: "流体力学基础"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "流体力学基础"
  - "稀薄气体与滑移流"
  - "物理建模与适用边界"
  - "Boltzmann 方程"
  - "梯度长度 Kn"
seo:
  title: "稀薄气体与滑移流：物理建模与适用边界"
  description: "以 Knudsen 数为轴梳理连续介质、滑移、过渡与自由分子四个流区对应的模型层级，说明局部梯度 Kn 为何会推翻全局判据，并给出 80 km 高空高超声速绕流的量级估算。"
  keywords:
    - "稀薄气体与滑移流"
    - "物理建模与适用边界"
    - "Boltzmann 方程"
    - "梯度长度 Kn"
    - "高超声速稀薄流"
---

# 稀薄气体与滑移流：物理建模与适用边界

把 Navier-Stokes 换成 Boltzmann 方程，代价从"解 5 个守恒量"变成"解 7 维分布函数"。做这个替换之前，必须证明连续介质假设确实破了，而且要证明破在哪里。本文给出从分子平均自由程到模型层级的完整判据链，并指出全局 Knudsen 数在激波、膨胀扇这类强梯度区会严重低估稀薄程度。

## 1 从分子平均自由程到 Knudsen 数

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

## 2 局部梯度 Kn 会推翻全局判据

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

## 3 模型层级与升级判据

**第一级：Navier-Stokes + 无滑移。** 只适用于 $Kn<10^{-3}$ 且无强梯度区。它是所有后续模型的基准线。

**第二级：Navier-Stokes + 一阶滑移与温度跳跃。** 补回壁面附近分子的非平衡输运。代价极小，只需壁面边界条件与适应系数。升级判据是 $Kn>10^{-3}$ 或壁面滑移量超过特征速度的 1%。

**第三级：Burnett、Grad-13 等扩展流体力学方程。** 在 Navier-Stokes 的应力与热流里加入高阶梯度项，把适用范围推到 $Kn\sim0.5$。代价是方程出现病态解分支，边界条件数量也随之增加，工程使用需谨慎。

**第四级：DSMC。** 直接模拟分子运动与碰撞，$Kn$ 从 0.05 到自由分子流都适用。代价是单元尺寸受 $\lambda/3$ 限制，常压微尺度问题的计算量会爆炸。

**第五级：Boltzmann 直接求解。** 精度最高，但维度高、数值难度大，主要用于一维松弛与验证。

## 4 尺度判断决定选型，而不是几何判断

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

## 5 边界被跨越时的失败信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面热流对网格不收敛，加密后持续上升 | 无滑移/无温度跳跃，Knudsen 层被强行解析 | 加入温度跳跃项后重算，看热流是否稳定 |
| 激波厚度只有 2~3 个单元且随网格变化 | 用 Navier-Stokes 解析非连续结构 | 计算激波内 $Kn_{GL}$，若远大于 0.05 改用 DSMC |
| 全局 Kn 很小但阻力系数对来流压力异常敏感 | 局部梯度区已稀薄，全局判据失效 | 输出 $Kn_{GL}$ 场，定位超阈值区域 |
| 滑移修正后流量增强超过解析预测 | 已越过 $Kn=0.1$，一阶滑移不再成立 | 用二阶滑移或 DSMC 复算同一工况 |
| DSMC 与 Navier-Stokes 在远场也对不上 | 单元尺寸或时间步违反 DSMC 约束 | 做 $\lambda/3$ 与时间步减半两组收敛试验 |
| 真空腔算例残差正常但流场完全无梯度 | 实际处于自由分子流，碰撞项已可忽略 | 计算 $Kn$，若大于 10 改用无碰撞求解 |

## 参考资料

1. Chapman S., Cowling T.G., *The Mathematical Theory of Non-Uniform Gases*, 3rd ed., Cambridge University Press, 1970.
2. Cercignani C., *The Boltzmann Equation and Its Applications*, Springer-Verlag, New York, 1988.
3. Bird G.A., *Molecular Gas Dynamics and the Direct Simulation of Gas Flows*, Oxford Engineering Science Series, Clarendon Press, Oxford, 1994.
4. Boyd I.D., Chen G., Candler G.V., "Predicting Failure of the Continuum Fluid Equations in Transitional Hypersonic Flows," *Physics of Fluids*, 7(1), 210-219, 1995.
5. Tsien H.S., "Superaerodynamics, Mechanics of Rarefied Gases," *Journal of the Aeronautical Sciences*, 13(12), 653-664, 1946.
