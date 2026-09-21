---
template_version: flowlab-knowledge/1.0
slug: cfd-physics-rotating-flow-modeling
title: 旋转流与旋转参考系：原理与诊断验证
summary: >-
  从旋转参考系的动量方程出发，用 Rossby、Ekman 与 Richardson 数划定流态，说明 MRF
  到滑移网格的升级判据、湍流模型对旋转与曲率的响应，并给出两个可手算的量级估算。
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
  - 旋转流与旋转参考系
  - 物理建模与适用边界
  - Rossby 数
  - Ekman 层
  - 结果诊断与可信度验证
  - MRF
  - 功率数
seo:
  title: 旋转流与旋转参考系：原理与诊断验证
  description: >-
    从旋转参考系的动量方程出发，用 Rossby、Ekman 与 Richardson 数划定流态，说明 MRF
    到滑移网格的升级判据、湍流模型对旋转与曲率的响应，并给出两个可手算的量级估算。
  keywords:
    - 旋转流与旋转参考系
    - 物理建模与适用边界
    - Rossby 数
    - Ekman 层
    - Taylor-Proudman
    - 结果诊断与可信度验证
    - MRF
    - 功率数
    - 科里奥利力
---
# 旋转流与旋转参考系：原理与诊断验证

旋转把一个平直的管道流变成带二次流的螺旋流，也把一个简单的混合问题变成需要选择参考系的工程判断。建模的核心不是"要不要加旋转"，而是三个无量纲数各自落在什么区间：Rossby 数决定旋转是否主导，Ekman 数决定边界层厚度，Richardson 数决定湍流模型是否必须加曲率修正。本文把这三点讲成可计算的选择规则。旋转参考系算例里，最常见的"结果不对"其实不是求解错了，而是后处理取错了速度分量：旋转域里求解器存的是相对速度，但用户按绝对速度去和实验对比，于是得到一个"叶轮不出力"的荒谬结论。真正的诊断顺序应当是先对齐速度口径，再查交界面守恒，最后才判断 MRF 假设是否成立。下面给出这三步的可执行判据。

## 基础概念与控制关系

### 交界面守恒是第二道关

MRF（冻结转子）在交界面上不做通量插值，而是各自求解、靠压力耦合传递信息，因此会出现速度的切向跳跃——这是方法本身的特征，不是错误。需要检查的是守恒量：

- 通过交界面的质量流量两侧应相等，相对误差小于 0.1%；
- 总扭矩应等于外环流体角动量的变化率，误差小于 1%；
- 交界面上的压力应连续，若出现压力跳变，多半是网格非共形或插值权重问题。

若交界面两侧的旋转域与静止域网格尺度相差 3 倍以上，即使都是六面体，也会出现明显的数值耗散，表现为叶轮出口的滑移因子偏低。此时应先做网格匹配，再讨论物理。

### 三个无量纲数划定流态

$$
Ro = \frac{U}{\Omega L},\qquad Ek = \frac{\nu}{\Omega L^{2}},\qquad \delta_{Ek} = \sqrt{\frac{\nu}{\Omega}}
$$

$Ro$ 是惯性力与科里奥利力之比；$Ek$ 是黏性扩散与旋转周期之比；$\delta_{Ek}$ 是 Ekman 层厚度，即旋转把黏性影响压缩到的那层薄壳。

**算例一：旋转通道。** 槽道半宽 $L=0.05\,\mathrm{m}$，平均流速 $U=5\,\mathrm{m/s}$，$\Omega=100\,\mathrm{rad/s}$，空气 $\nu=1.5\times10^{-5}\,\mathrm{m^2/s}$。

1. $Ro=5/(100\times0.05)=1.0$，旋转与对流同量级，两侧壁面的稳定/失稳不对称会明显改变湍流结构；
2. $Ek=1.5\times10^{-5}/(100\times0.0025)=6.0\times10^{-5}$，远小于 1，说明黏性影响被压缩在极薄的边界层内；
3. $\delta_{Ek}=\sqrt{1.5\times10^{-5}/100}=3.87\times10^{-4}\,\mathrm{m}=0.39\,\mathrm{mm}$。

第 3 步直接给出网格要求：要解析 Ekman 层，壁面首层厚度应取 $\delta_{Ek}$ 的三分之一量级，即约 0.13 mm。若用壁函数跨过这一层，等于把旋转产生的主要湍流源区丢掉了。

**算例二：中纬度大气。** $\Omega=7.292\times10^{-5}\,\mathrm{rad/s}$，$\varphi=45^\circ$，科里奥利参数

$$
f = 2\Omega\sin\varphi = 2\times7.292\times10^{-5}\times0.7071 = 1.031\times10^{-4}\,\mathrm{s^{-1}}
$$

取 $U=10\,\mathrm{m/s}$、$L=1000\,\mathrm{km}=10^{6}\,\mathrm{m}$，则 $Ro=U/(fL)=10/(1.031\times10^{-4}\times10^{6})=0.097\ll1$。此时地转平衡成立，风场近似沿等压线，压差力与科里奥利力平衡：

$$
f\,\mathbf{u}_g = -\frac{1}{\rho}\nabla p
$$

同一个公式在旋转机械里 $Ro\sim1$、在大气里 $Ro\ll1$，所以前者必须解全方程，后者可以先用地转近似构造初场——判据就是这一个数。

### 湍流模型对旋转与曲率的响应

标准 $k$-$\varepsilon$ 对旋转与流线曲率几乎不敏感，原因在于其产生项只依赖应变率不变量，而旋转对应变率张量没有贡献。这导致凹壁面上的 Görtler 涡与凸壁面上的湍流抑制都被算不出来。修正是把产生项乘以一个旋转/曲率函数：

$$
P_k^{mod} = P_k \cdot f_r,\qquad f_r = \frac{1}{1+C_r\,Ri},\qquad Ri = \frac{2\Omega}{S}\left(\frac{2\Omega}{S}-1\right)
$$

$S=\sqrt{2S_{ij}S_{ij}}$ 是应变率不变量，$C_r$ 为模型常数。$Ri$ 的符号区分稳定与失稳侧：$Ri>0$ 表示旋转稳定化，湍流被抑制。工程上另一条路是直接用 Spalart-Shur 修正或换用 $k$-$\omega$ SST 加曲率修正，后者在叶轮机械里更常见。

## 适用边界与方案选择

### MRF、滑移网格与瞬态的升级判据

判据不是"越贵越准"，而是"是否存在被抹掉的物理"。若关心的是叶轮出口的平均速度三角形，MRF 足够；若关心的是叶片通过频率下的压力脉动或转子-静子干涉噪声，必须上滑移网格。中间地带的判断可以靠一个便宜的试验：用 MRF 与滑移网格各算一次扭矩，若两者相差小于 5%，MRF 就够用。

| 方法 | 保留的物理 | 升级触发条件 | 代价倍数 |
|---|---|---|---|
| SRF 单旋转系 | 全流域同轴旋转 | 流域不轴对称 | 1 |
| MRF 冻结转子 | 各域独立稳态 | $Ro<1$ 或功率数误差 >10% | 1~2 |
| 滑移网格 | 真实相对运动 | 需要非定常尾迹、叶片通过频率 | 5~20 |
| 重叠网格 | 大位移/多体相对运动 | 网格变形过大 | 10~50 |

## 工程设置与实施

### 网格与后处理的两条硬约束

**旋转域内不需要旋转网格。** 相对速度场是稳态的，网格静止即可；把网格做成旋转的反而会引入网格速度项。**旋转壁面必须给相对速度零。** 若在旋转域里把壁面设成绝对速度零，会得到一个反向滑移的壁面，表现为近壁速度剖面整体偏移。

**单旋转参考系只能有一个轴。** 若计算域内存在绕不同轴旋转的部件（如行星齿轮箱、双轴涡轮），必须使用 MRF 多域或重叠网格，且每个域的轴与原点分别定义。

```python
import math
def rotation_regime(U, L, omega, nu=1.5e-5):
    Ro = U / (omega * L)
    Ek = nu / (omega * L * L)
    d_ek = math.sqrt(nu / omega)
    return dict(Rossby=Ro, Ekman=Ek,
                Ekman_layer_mm=d_ek * 1e3,
                first_cell_mm=d_ek / 3 * 1e3,
                regime=("rotation dominated" if Ro < 1 else "convection dominated"))

print(rotation_regime(U=5.0, L=0.05, omega=100.0))
# Rossby=1.0, Ekman=6.0e-5, Ekman 层 0.387 mm, 首层建议 0.129 mm

def coriolis(lat_deg, omega_earth=7.292e-5):
    return 2 * omega_earth * math.sin(math.radians(lat_deg))
print(coriolis(45.0))   # f = 1.031e-4 1/s
```

### 配置片段与后处理命令

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

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 封闭腔内出现无源的压力堆 | 只加了科里奥利项，漏掉离心项 | 检查动量源项实现，与解析旋转槽道解对比 |
| 壁面附近速度剖面整体偏移一个常数 | 旋转域壁面给了绝对速度零 | 打印壁面相对速度，应严格为零 |
| 凹壁面算不出 Görtler 涡 | 湍流模型对曲率不敏感 | 开启曲率修正或换 SST，比较涡结构 |
| 多轴算例出现非物理的切向速度跳跃 | 用了单旋转参考系 | 检查是否所有旋转件共用同一轴与原点 |
| 功率数对时间步敏感 | 已进入强非定常干涉区 | 做时间步减半试验，若解变化改用滑移网格 |
| Ekman 层内速度剖面被壁函数抹平 | 首层厚度远大于 $\delta_{Ek}$ | 按 $\delta_{Ek}/3$ 加密首层后重算 |
| 旋转域内速度剖面看似合理，但对比实验整体偏慢 | 后处理取相对速度与绝对速度混用 | 在同一位置分别输出两种速度，检查差值是否等于 $\Omega r$ |
| 叶轮输出功率只有手算值的 50% | MRF 冻结转子抹掉了叶片-挡板相互作用 | 换滑移网格重算，看功率是否回升到 $N_p\approx5.5$ |
| 旋转壁面附近出现反向速度层 | 壁面给了绝对速度零而非相对速度零 | 打印壁面相对速度，应严格为零 |
| 交界面两侧质量流量不相等 | 网格非共形或插值不保通量 | 统计交界面通量并改用共形界面 |
| 压力场跨域比较时出现整体偏移 | 旋转域压力已吸收离心项，口径不同 | 换算到绝对系压力后再比较 |
| 结果对时间步长敏感 | 非定常相互作用强，稳态假设不成立 | 做时间步减半试验；若解变化，说明该用滑移网格 |

## 验证、验收与复现

### 旋转坐标系里的源项与速度口径

在角速度 $\boldsymbol{\Omega}$ 的旋转系中，动量方程多出两项体积力：

$$
\mathbf{S} = -2\rho\,\boldsymbol{\Omega}\times\mathbf{u}_r - \rho\,\boldsymbol{\Omega}\times(\boldsymbol{\Omega}\times\mathbf{r})
$$

第一项是科里奥利力，方向垂直于相对速度；第二项是离心力，方向沿转轴径向向外。$\mathbf{u}_r$ 是相对速度，$\mathbf{u} = \mathbf{u}_r + \boldsymbol{\Omega}\times\mathbf{r}$ 才是实验室系绝对速度。求解器输出的是 $\mathbf{u}_r$，压力场里也已经吸收了离心项——因此旋转域内的静压与实验室系的静压定义不同，跨域比较压力前必须确认口径一致。

判定试验：在旋转壁面上，相对速度应为零。若打印出的壁面相对速度不为零，说明壁面条件给的是绝对速度零，等于给了一个反向滑移的壁面。

### MRF 什么时候能用

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

### 归档要点

一份可复算的旋转流报告至少写明：旋转域范围与轴定义、$\Omega$ 的 rad/s 值、旋转壁面用的是相对还是绝对条件、交界面的位置与网格匹配情况、以及后处理取的是哪种速度。另外必须给出一个独立的扭矩或功率核对值——实验数据、公开基准或手算功率数都行，只要它是从算例外部来的。若只有求解器自洽的残差与云图，就没有任何一条证据能证明旋转系设置是对的。

## 参考资料

设参考系以角速度 $\boldsymbol{\Omega}$ 绕固定轴旋转，相对速度为 $\mathbf{u}_r$，不可压缩动量方程为
$$
\frac{\partial \mathbf{u}_r}{\partial t} + (\mathbf{u}_r\cdot\nabla)\mathbf{u}_r = -\frac{1}{\rho}\nabla p_r - 2\boldsymbol{\Omega}\times\mathbf{u}_r - \boldsymbol{\Omega}\times(\boldsymbol{\Omega}\times\mathbf{r}) + \nu\nabla^{2}\mathbf{u}_r
两项附加体积力必须同时保留。只加科里奥利项而漏掉离心项，会让径向压力梯度整体偏掉，在封闭腔内表现为无源的压力堆。反之，若采用单旋转参考系（SRF）而计算域不是绕轴完全轴对称，离心项就无法用一个标量势吸收，必须走 MRF 或滑移网格。
1. Greenspan H.P., *The Theory of Rotating Fluids*, Cambridge University Press, 1968.
2. Tritton D.J., *Physical Fluid Dynamics*, 2nd ed., Oxford University Press, 1988.
3. Pedlosky J., *Geophysical Fluid Dynamics*, 2nd ed., Springer-Verlag, 1987.
4. Spalart P.R., Shur M., "On the Sensitization of Turbulence Models to Rotation and Curvature," *Aerospace Science and Technology*, 1(5), 297-302, 1997.
5. Denton J.D., "Some Limitations of Turbomachinery CFD," *ASME Turbo Expo*, GT2010-22540, 2010.
6. Luo J.Y., Gosman A.D., Issa R.I., Middleton J.C., Fitzgerald M.K., "Full Flow Field Computation of Mixing in Baffled Stirred Vessels," *Chemical Engineering Research and Design*, 71(A3), 342-344, 1993.
7. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications," *AIAA Journal*, 32(8), 1598-1605, 1994.
