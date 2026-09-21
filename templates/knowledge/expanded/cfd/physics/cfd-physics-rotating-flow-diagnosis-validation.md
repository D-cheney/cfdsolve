---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-rotating-flow-diagnosis-validation
title: "旋转流与旋转参考系：结果诊断与可信度验证"
summary: "旋转参考系算例的失效多数来自后处理口径与交界面处理，而非物理。本文给出绝对/相对速度对账、交界面通量与扭矩守恒、以及 MRF 适用性判据，并附搅拌槽功率数手算核对。"
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
  - "旋转流与旋转参考系"
  - "结果诊断与可信度验证"
  - "MRF"
  - "功率数"
seo:
  title: "旋转流与旋转参考系：结果诊断与可信度验证"
  description: "旋转参考系算例的失效多数来自后处理口径与交界面处理，而非物理。本文给出绝对/相对速度对账、交界面通量与扭矩守恒、以及 MRF 适用性判据，并附搅拌槽功率数手算核对。"
  keywords:
    - "旋转流与旋转参考系"
    - "结果诊断与可信度验证"
    - "MRF"
    - "功率数"
    - "科里奥利力"
---

# 旋转流与旋转参考系：结果诊断与可信度验证

旋转参考系算例里，最常见的"结果不对"其实不是求解错了，而是后处理取错了速度分量：旋转域里求解器存的是相对速度，但用户按绝对速度去和实验对比，于是得到一个"叶轮不出力"的荒谬结论。真正的诊断顺序应当是先对齐速度口径，再查交界面守恒，最后才判断 MRF 假设是否成立。下面给出这三步的可执行判据。

## 1 旋转坐标系里的源项与速度口径

在角速度 $\boldsymbol{\Omega}$ 的旋转系中，动量方程多出两项体积力：

$$
\mathbf{S} = -2\rho\,\boldsymbol{\Omega}\times\mathbf{u}_r - \rho\,\boldsymbol{\Omega}\times(\boldsymbol{\Omega}\times\mathbf{r})
$$

第一项是科里奥利力，方向垂直于相对速度；第二项是离心力，方向沿转轴径向向外。$\mathbf{u}_r$ 是相对速度，$\mathbf{u} = \mathbf{u}_r + \boldsymbol{\Omega}\times\mathbf{r}$ 才是实验室系绝对速度。求解器输出的是 $\mathbf{u}_r$，压力场里也已经吸收了离心项——因此旋转域内的静压与实验室系的静压定义不同，跨域比较压力前必须确认口径一致。

判定试验：在旋转壁面上，相对速度应为零。若打印出的壁面相对速度不为零，说明壁面条件给的是绝对速度零，等于给了一个反向滑移的壁面。

## 2 交界面守恒是第二道关

MRF（冻结转子）在交界面上不做通量插值，而是各自求解、靠压力耦合传递信息，因此会出现速度的切向跳跃——这是方法本身的特征，不是错误。需要检查的是守恒量：

- 通过交界面的质量流量两侧应相等，相对误差小于 0.1%；
- 总扭矩应等于外环流体角动量的变化率，误差小于 1%；
- 交界面上的压力应连续，若出现压力跳变，多半是网格非共形或插值权重问题。

若交界面两侧的旋转域与静止域网格尺度相差 3 倍以上，即使都是六面体，也会出现明显的数值耗散，表现为叶轮出口的滑移因子偏低。此时应先做网格匹配，再讨论物理。

## 3 MRF 什么时候能用

MRF 冻结转子的物理含义是"在某个瞬时把转子和静止件都当作稳态"。它成立的前提是转子与静止件之间的相互作用弱，判据是

$$
Ro = \frac{U}{\Omega L}
$$

$U$ 为特征速度、$L$ 为特征长度。$Ro\gg1$ 表示对流输运主导，非定常相互作用可以忽略；$Ro\lesssim1$ 表示旋转周期与对流时间同量级，MRF 会系统性失真。

**搅拌槽算例。** Rushton 涡轮 $D=0.1\,\mathrm{m}$、转速 $n=10\,\mathrm{rev/s}$（600 rpm）、$\rho=1000\,\mathrm{kg/m^3}$、$\mu=10^{-3}\,\mathrm{Pa\cdot s}$，带挡板。

1. 叶端速度：$U_{tip}=\pi n D=3.1416\times10\times0.1=3.14\,\mathrm{m/s}$；
2. 搅拌雷诺数：$Re=\rho n D^2/\mu=1000\times10\times0.01/10^{-3}=1.0\times10^{5}$，充分湍流；
3. 湍流区 Rushton 涡轮功率数 $N_p\approx5.5$，故功率 $P=N_p\rho n^3 D^5=5.5\times1000\times10^{3}\times10^{-5}=55\,\mathrm{W}$；
4. 扭矩 $M=P/(2\pi n)=55/62.83=0.875\,\mathrm{N\cdot m}$。

这个 55 W 就是 MRF 结果必须对上的数。带挡板的槽里叶片与挡板的周期相互作用很强，MRF 常给出 $N_p$ 偏低 30%~50%，即 30~40 W。若把挡板去掉改成轴对称槽，MRF 立刻变准——因为此时流动接近轴对称，转子与静止件之间没有强相互作用。这组对照本身就是判定 MRF 是否适用的最好试验。

角速度换算：$600\,\mathrm{rpm}\times2\pi/60=62.83\,\mathrm{rad/s}$，这个数直接写进字典。

## 4 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 旋转域内速度剖面看似合理，但对比实验整体偏慢 | 后处理取相对速度与绝对速度混用 | 在同一位置分别输出两种速度，检查差值是否等于 $\Omega r$ |
| 叶轮输出功率只有手算值的 50% | MRF 冻结转子抹掉了叶片-挡板相互作用 | 换滑移网格重算，看功率是否回升到 $N_p\approx5.5$ |
| 旋转壁面附近出现反向速度层 | 壁面给了绝对速度零而非相对速度零 | 打印壁面相对速度，应严格为零 |
| 交界面两侧质量流量不相等 | 网格非共形或插值不保通量 | 统计交界面通量并改用共形界面 |
| 压力场跨域比较时出现整体偏移 | 旋转域压力已吸收离心项，口径不同 | 换算到绝对系压力后再比较 |
| 结果对时间步长敏感 | 非定常相互作用强，稳态假设不成立 | 做时间步减半试验；若解变化，说明该用滑移网格 |

## 5 配置片段与后处理命令

```cpp
// constant/MRFProperties
MRF1
{
    cellZone        rotor;
    active          yes;
    nonRotatingPatches ();
    origin          (0 0 0);
    axis            (0 0 1);
    omega           62.83;      // rad/s, 即 600 rpm
}

// 旋转壁面：给出相对速度为零
wall_rotor
{
    type        noSlip;         // 在旋转域内即表示相对速度为零
}
```

```bash
# 后处理取绝对速度：U 为相对速度，需加上 Omega x r
postProcess -func "components(U)" -time 2000
# 交界面通量核对
postProcess -func "surfaceFieldValue(name=flux, surfaceName=mrfInterface, operation=sum, fields=(phi))" -time 2000
```

## 6 归档要点

一份可复算的旋转流报告至少写明：旋转域范围与轴定义、$\Omega$ 的 rad/s 值、旋转壁面用的是相对还是绝对条件、交界面的位置与网格匹配情况、以及后处理取的是哪种速度。另外必须给出一个独立的扭矩或功率核对值——实验数据、公开基准或手算功率数都行，只要它是从算例外部来的。若只有求解器自洽的残差与云图，就没有任何一条证据能证明旋转系设置是对的。

## 参考资料

1. Luo J.Y., Gosman A.D., Issa R.I., Middleton J.C., Fitzgerald M.K., "Full Flow Field Computation of Mixing in Baffled Stirred Vessels," *Chemical Engineering Research and Design*, 71(A3), 342-344, 1993.
2. Denton J.D., "Some Limitations of Turbomachinery CFD," *ASME Turbo Expo*, GT2010-22540, 2010.
3. Tritton D.J., *Physical Fluid Dynamics*, 2nd ed., Oxford University Press, 1988.
4. Greenspan H.P., *The Theory of Rotating Fluids*, Cambridge University Press, 1968.
5. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications," *AIAA Journal*, 32(8), 1598-1605, 1994.
