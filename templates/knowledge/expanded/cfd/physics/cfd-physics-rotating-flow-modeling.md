---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-rotating-flow-modeling
title: "旋转流与旋转参考系：物理建模与适用边界"
summary: "从旋转参考系的动量方程出发，用 Rossby、Ekman 与 Richardson 数划定流态，说明 MRF 到滑移网格的升级判据、湍流模型对旋转与曲率的响应，并给出两个可手算的量级估算。"
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
  - "旋转流与旋转参考系"
  - "物理建模与适用边界"
  - "Rossby 数"
  - "Ekman 层"
seo:
  title: "旋转流与旋转参考系：物理建模与适用边界"
  description: "从旋转参考系的动量方程出发，用 Rossby、Ekman 与 Richardson 数划定流态，说明 MRF 到滑移网格的升级判据、湍流模型对旋转与曲率的响应，并给出两个可手算的量级估算。"
  keywords:
    - "旋转流与旋转参考系"
    - "物理建模与适用边界"
    - "Rossby 数"
    - "Ekman 层"
    - "Taylor-Proudman"
---

# 旋转流与旋转参考系：物理建模与适用边界

旋转把一个平直的管道流变成带二次流的螺旋流，也把一个简单的混合问题变成需要选择参考系的工程判断。建模的核心不是"要不要加旋转"，而是三个无量纲数各自落在什么区间：Rossby 数决定旋转是否主导，Ekman 数决定边界层厚度，Richardson 数决定湍流模型是否必须加曲率修正。本文把这三点讲成可计算的选择规则。

## 1 旋转参考系中的动量方程

设参考系以角速度 $\boldsymbol{\Omega}$ 绕固定轴旋转，相对速度为 $\mathbf{u}_r$，不可压缩动量方程为

$$
\frac{\partial \mathbf{u}_r}{\partial t} + (\mathbf{u}_r\cdot\nabla)\mathbf{u}_r = -\frac{1}{\rho}\nabla p_r - 2\boldsymbol{\Omega}\times\mathbf{u}_r - \boldsymbol{\Omega}\times(\boldsymbol{\Omega}\times\mathbf{r}) + \nu\nabla^{2}\mathbf{u}_r
$$

两项附加体积力必须同时保留。只加科里奥利项而漏掉离心项，会让径向压力梯度整体偏掉，在封闭腔内表现为无源的压力堆。反之，若采用单旋转参考系（SRF）而计算域不是绕轴完全轴对称，离心项就无法用一个标量势吸收，必须走 MRF 或滑移网格。

## 2 三个无量纲数划定流态

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

## 3 MRF、滑移网格与瞬态的升级判据

| 方法 | 保留的物理 | 升级触发条件 | 代价倍数 |
|---|---|---|---|
| SRF 单旋转系 | 全流域同轴旋转 | 流域不轴对称 | 1 |
| MRF 冻结转子 | 各域独立稳态 | $Ro<1$ 或功率数误差 >10% | 1~2 |
| 滑移网格 | 真实相对运动 | 需要非定常尾迹、叶片通过频率 | 5~20 |
| 重叠网格 | 大位移/多体相对运动 | 网格变形过大 | 10~50 |

判据不是"越贵越准"，而是"是否存在被抹掉的物理"。若关心的是叶轮出口的平均速度三角形，MRF 足够；若关心的是叶片通过频率下的压力脉动或转子-静子干涉噪声，必须上滑移网格。中间地带的判断可以靠一个便宜的试验：用 MRF 与滑移网格各算一次扭矩，若两者相差小于 5%，MRF 就够用。

## 4 湍流模型对旋转与曲率的响应

标准 $k$-$\varepsilon$ 对旋转与流线曲率几乎不敏感，原因在于其产生项只依赖应变率不变量，而旋转对应变率张量没有贡献。这导致凹壁面上的 Görtler 涡与凸壁面上的湍流抑制都被算不出来。修正是把产生项乘以一个旋转/曲率函数：

$$
P_k^{mod} = P_k \cdot f_r,\qquad f_r = \frac{1}{1+C_r\,Ri},\qquad Ri = \frac{2\Omega}{S}\left(\frac{2\Omega}{S}-1\right)
$$

$S=\sqrt{2S_{ij}S_{ij}}$ 是应变率不变量，$C_r$ 为模型常数。$Ri$ 的符号区分稳定与失稳侧：$Ri>0$ 表示旋转稳定化，湍流被抑制。工程上另一条路是直接用 Spalart-Shur 修正或换用 $k$-$\omega$ SST 加曲率修正，后者在叶轮机械里更常见。

## 5 网格与后处理的两条硬约束

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

## 6 假设失效时的信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 封闭腔内出现无源的压力堆 | 只加了科里奥利项，漏掉离心项 | 检查动量源项实现，与解析旋转槽道解对比 |
| 壁面附近速度剖面整体偏移一个常数 | 旋转域壁面给了绝对速度零 | 打印壁面相对速度，应严格为零 |
| 凹壁面算不出 Görtler 涡 | 湍流模型对曲率不敏感 | 开启曲率修正或换 SST，比较涡结构 |
| 多轴算例出现非物理的切向速度跳跃 | 用了单旋转参考系 | 检查是否所有旋转件共用同一轴与原点 |
| 功率数对时间步敏感 | 已进入强非定常干涉区 | 做时间步减半试验，若解变化改用滑移网格 |
| Ekman 层内速度剖面被壁函数抹平 | 首层厚度远大于 $\delta_{Ek}$ | 按 $\delta_{Ek}/3$ 加密首层后重算 |

## 参考资料

1. Greenspan H.P., *The Theory of Rotating Fluids*, Cambridge University Press, 1968.
2. Tritton D.J., *Physical Fluid Dynamics*, 2nd ed., Oxford University Press, 1988.
3. Pedlosky J., *Geophysical Fluid Dynamics*, 2nd ed., Springer-Verlag, 1987.
4. Spalart P.R., Shur M., "On the Sensitization of Turbulence Models to Rotation and Curvature," *Aerospace Science and Technology*, 1(5), 297-302, 1997.
5. Denton J.D., "Some Limitations of Turbomachinery CFD," *ASME Turbo Expo*, GT2010-22540, 2010.
