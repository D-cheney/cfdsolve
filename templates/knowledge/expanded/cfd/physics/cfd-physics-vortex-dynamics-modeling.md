---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-vortex-dynamics-modeling
title: "旋涡动力学：物理建模与适用边界"
summary: "逐项解读涡量输运方程的五项，比较 Rankine、Lamb-Oseen 与 Burgers 三个涡模型的适用域，给出点涡到涡粒子法的层级与代价，并用涡环与 Burgers 涡各做一次手算。"
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
  - "旋涡动力学"
  - "物理建模与适用边界"
  - "涡量输运方程"
  - "Burgers 涡"
seo:
  title: "旋涡动力学：物理建模与适用边界"
  description: "逐项解读涡量输运方程的五项，比较 Rankine、Lamb-Oseen 与 Burgers 三个涡模型的适用域，给出点涡到涡粒子法的层级与代价，并用涡环与 Burgers 涡各做一次手算。"
  keywords:
    - "旋涡动力学"
    - "物理建模与适用边界"
    - "涡量输运方程"
    - "Burgers 涡"
    - "涡方法"
---

# 旋涡动力学：物理建模与适用边界

涡量方程把流动的演化写成五项收支，每一项都对应一个可以被实验或数值单独测量的机制。理解这五项，就能判断某个涡模型到底丢了什么：Rankine 涡丢了黏性扩散，点涡丢了核结构，涡粒子法丢了远场的可压缩性。本文按方程项、涡模型、数值方法三条线索说明各自的适用域。

## 1 涡量输运方程的五项

对可压缩、非正压流体，涡量 $\boldsymbol{\omega}=\nabla\times\mathbf{u}$ 满足

$$
\frac{\partial \boldsymbol{\omega}}{\partial t} + (\mathbf{u}\cdot\nabla)\boldsymbol{\omega}
= (\boldsymbol{\omega}\cdot\nabla)\mathbf{u}
- \boldsymbol{\omega}(\nabla\cdot\mathbf{u})
+ \frac{1}{\rho^{2}}\nabla\rho\times\nabla p
+ \nu\nabla^{2}\boldsymbol{\omega}
$$

五项依次是：对流、涡管拉伸、体积膨胀引起的涡量稀释、斜压项、黏性扩散。理解它们的关键是量纲与符号：

- **拉伸项** $(\boldsymbol{\omega}\cdot\nabla)\mathbf{u}$ 与 $\omega$ 同号时增强涡量。二维流动中该项恒为零——这是二维湍流与三维湍流本质不同的原因。
- **膨胀项** $-\boldsymbol{\omega}(\nabla\cdot\mathbf{u})$ 在膨胀区减弱涡量、在压缩区增强。
- **斜压项**只在密度与压力梯度不平行时出现，激波后与燃烧面后是主要来源。
- **扩散项**在二维下解析可解：核半径按 $\sqrt{\nu t}$ 增长。

对无黏正压流动，Kelvin 定理给出沿物质围道的环量守恒：

$$
\frac{D\Gamma}{Dt} = \frac{D}{Dt}\oint_C \mathbf{u}\cdot d\mathbf{l} = 0
$$

这个定理是涡方法全部合法性的来源：只要不涉及黏性、斜压与激波，涡量就随流体输运，可以用拉格朗日粒子或涡丝直接携带。

## 2 三个涡模型的适用域

**Rankine 涡**：核内刚体旋转、核外自由涡，

$$
u_\theta = \begin{cases} \Omega r, & r \le R \\ \dfrac{\Gamma}{2\pi r}, & r > R \end{cases}
$$

核边缘速度梯度不连续，涡量在 $r=R$ 处是狄拉克奇点。它适合做解析估计与远场衰减判断，不适合放进数值求解器。

**Lamb-Oseen 涡**：黏性扩散的自相似解，核半径按 $r_c=\sqrt{4\nu t}$ 增长，适合验证数值格式的涡量耗散。

**Burgers 涡**：把轴向拉伸与径向压缩同时考虑，

$$
u_r = -\alpha r,\quad u_z = 2\alpha z,\quad
u_\theta = \frac{\Gamma}{2\pi r}\left[1-\exp\left(-\frac{\alpha r^{2}}{2\nu}\right)\right]
$$

拉伸项与黏性扩散在稳态下平衡，给出固定的核半径 $r_c=\sqrt{2\nu/\alpha}$。这是唯一同时包含拉伸与耗散的最小模型，因此是检验涡量方程收支的标准算例。

## 3 量级估算：涡环与 Burgers 涡

**涡环平移速度。** 半径 $R$、核半径 $a$ 的圆形涡环，自诱导平移速度近似为

$$
U = \frac{\Gamma}{4\pi R}\left[\ln\frac{8R}{a} - 0.25\right]
$$

取 $\Gamma=2\,\mathrm{m^2/s}$、$R=0.1\,\mathrm{m}$、$a=0.01\,\mathrm{m}$：$8R/a=80$，$\ln 80=4.382$，括号内 $=4.132$，前因子 $=2/(4\pi\times0.1)=1.592$，得 $U=1.592\times4.132=6.58\,\mathrm{m/s}$。对数依赖意味着 $U$ 对 $a$ 极不敏感——把核半径缩小十倍只让 $U$ 增加约 30%。这正是涡方法能容忍一定核尺度误差的原因。

**Burgers 涡核。** 取 $\alpha=100\,\mathrm{s^{-1}}$、$\nu=1.5\times10^{-5}\,\mathrm{m^2/s}$、$\Gamma=2\,\mathrm{m^2/s}$：

1. 核半径 $r_c=\sqrt{2\nu/\alpha}=\sqrt{2\times1.5\times10^{-5}/100}=\sqrt{3.0\times10^{-7}}=5.48\times10^{-4}\,\mathrm{m}=0.548\,\mathrm{mm}$；
2. 在 $r=r_c$ 处的切向速度 $u_\theta=\Gamma/(2\pi r_c)\times(1-e^{-0.5})=2/(2\pi\times5.48\times10^{-4})\times0.3935=228.6\,\mathrm{m/s}$；
3. 网格要求 $\Delta x\le r_c/8=68\,\mu\mathrm{m}$，这个尺度在整机算例中无法满足，因此工程上通常用亚格子涡模型代替解析。

第 3 步是这类模型的核心限制：涡核尺度由拉伸率与黏性之比决定，与几何尺寸无关，因此"加密到能解析"往往不现实。

## 4 涡方法层级与代价

| 方法 | 涡量表示 | 适用域 | 主要代价 |
|---|---|---|---|
| 点涡 | 奇点 | 二维远场、稳定性分析 | 近距离奇异性 |
| 涡团（blob） | 光滑核 | 二维自由剪切层 | 核尺度与分辨率耦合 |
| 涡丝 / 涡面 | 拉格朗日线面 | 尾迹、旋翼、三维涡管 | 涡丝变形需重划分 |
| 涡粒子法 | 粒子携带涡量 | 高雷诺数外部绕流 | 粒子畸变需重映射 |
| 涡-网格混合（VIC） | 粒子→网格投影 | 尾迹与壁面相互作用 | 投影耗散 |
| 网格法（LES/DNS） | 欧拉场 | 全部，含壁面与激波 | 全域网格代价 |

选择依据是"涡结构是否主导你要的量"。直升机旋翼的桨尖涡、飞机尾涡、扑翼涡环这些以离散涡为骨架的流动，涡方法的效率可以比网格法高两个数量级。反过来，壁面附近的湍流边界层是连续谱、没有离散涡骨架，涡方法毫无优势。

## 5 二维假设何时成立

涡量方程里拉伸项在二维恒为零，因此二维模拟天然丢失涡管拉伸这一最重要的三维涡量增强机制。判据是比较拉伸项与对流项的量级：

$$
\frac{\|(\boldsymbol{\omega}\cdot\nabla)\mathbf{u}\|}{\|(\mathbf{u}\cdot\nabla)\boldsymbol{\omega}\|} \sim \frac{u'}{U}\cdot\frac{L_{\parallel}}{L_{\omega}}
$$

$L_{\parallel}$ 是沿涡轴的变形尺度，$L_\omega$ 是涡量横向梯度尺度。当沿涡轴方向的变形可以忽略（长直涡管、展向均匀的二维剪切层）时该比值远小于 1，二维成立。自由剪切层的初期、大展弦比机翼的中段、以及准二维的浅水流动属于这一类。反之，涡环、旋翼尾迹、湍流斑点必须三维。

```python
import math
def burgers_vortex(Gamma, alpha, nu=1.5e-5):
    rc = math.sqrt(2 * nu / alpha)
    u_at_rc = Gamma / (2 * math.pi * rc) * (1 - math.exp(-0.5))
    return dict(rc_mm=rc * 1e3, u_theta_at_rc=u_at_rc,
                dx_max_um=rc / 8 * 1e6)

def vortex_ring(Gamma, R, a):
    return Gamma / (4 * math.pi * R) * (math.log(8 * R / a) - 0.25)

print(burgers_vortex(2.0, 100.0))     # rc=0.548 mm, u_theta=228.6 m/s
print(vortex_ring(2.0, 0.1, 0.01))    # U=6.58 m/s
```

## 6 模型假设失效时的信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 二维算例的涡量峰值不衰减也不增强 | 拉伸项在二维恒为零，物理上被抹掉 | 做三维展向周期算例对照，看涡量峰值变化 |
| 涡粒子法结果在长时间后出现非物理聚集 | 粒子畸变导致核尺度失真 | 开启粒子重映射并比较总环量守恒 |
| 涡环平移速度对核半径极敏感 | 公式误用，或核半径远大于 $R$ | 核对 $a\ll R$ 前提，检查对数项符号 |
| 有激波时涡量不守恒 | 斜压项被忽略 | 输出 $\nabla\rho\times\nabla p/\rho^{2}$ 的体积分 |
| 壁面附近涡量始终为零 | 涡方法未施加壁面无滑移 | 加入涡片生成项或改用混合方法 |
| 涡核半径随拉伸率增大而增大 | 用错了 $r_c=\sqrt{2\nu/\alpha}$ 的方向 | 核对 $\alpha$ 定义：拉伸应使核变细 |

## 参考资料

1. Saffman P.G., *Vortex Dynamics*, Cambridge University Press, 1992.
2. Lamb H., *Hydrodynamics*, 6th ed., Cambridge University Press, 1932.
3. Batchelor G.K., *An Introduction to Fluid Dynamics*, Cambridge University Press, 1967.
4. Burgers J.M., "A Mathematical Model Illustrating the Theory of Turbulence," *Advances in Applied Mechanics*, 1, 171-199, 1948.
5. Cottet G.-H., Koumoutsakos P.D., *Vortex Methods: Theory and Practice*, Cambridge University Press, 2000.
