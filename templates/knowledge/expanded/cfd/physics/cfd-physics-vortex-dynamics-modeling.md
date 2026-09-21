---
template_version: flowlab-knowledge/1.0
slug: cfd-physics-vortex-dynamics-modeling
title: 旋涡动力学：原理与诊断验证
summary: >-
  逐项解读涡量输运方程的五项，比较 Rankine、Lamb-Oseen 与 Burgers 三个涡模型的适用域，给出点涡到涡粒子法的层级与代价，并用涡环与
  Burgers 涡各做一次手算。
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
  - 旋涡动力学
  - 物理建模与适用边界
  - 涡量输运方程
  - Burgers 涡
  - 结果诊断与可信度验证
  - Q 准则
  - Lamb-Oseen 涡
seo:
  title: 旋涡动力学：原理与诊断验证
  description: >-
    逐项解读涡量输运方程的五项，比较 Rankine、Lamb-Oseen 与 Burgers
    三个涡模型的适用域，给出点涡到涡粒子法的层级与代价，并用涡环与 Burgers 涡各做一次手算。
  keywords:
    - 旋涡动力学
    - 物理建模与适用边界
    - 涡量输运方程
    - Burgers 涡
    - 涡方法
    - 结果诊断与可信度验证
    - Q 准则
    - Lamb-Oseen 涡
    - 环量
---
# 旋涡动力学：原理与诊断验证

涡量方程把流动的演化写成五项收支，每一项都对应一个可以被实验或数值单独测量的机制。理解这五项，就能判断某个涡模型到底丢了什么：Rankine 涡丢了黏性扩散，点涡丢了核结构，涡粒子法丢了远场的可压缩性。涡结构是数值方法最容易"画出来"也最容易画错的东西：换个 Q 阈值，涡的数量可以翻倍；网格粗一倍，涡核可以胖一倍。判断一张涡图是否可信，需要三条不依赖阈值的证据：涡核半径随网格的收敛性、环量随时间的守恒性、以及拉伸项与耗散项的收支平衡。本文把这三条做成可执行的检查。

## 基础概念与控制关系

### 涡量输运方程的五项

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

### 环量与涡量通量守恒

对无黏正压流动，Kelvin 定理给出

$$
\frac{D\Gamma}{Dt}=0,\qquad \Gamma=\oint_C \mathbf{u}\cdot d\mathbf{l}
$$

数值解中环量会缓慢漂移，漂移率是离散质量的直接度量。判定阈值：在 10 个对流时间尺度内，绕涡核的环量相对变化应小于 1%。若超过 5%，说明数值耗散或边界通量有问题。

围道选择也有讲究：半径取 $3r_c$ 时已包含 99% 的环量，同时远离核心的高梯度区，积分误差最小。围道太靠近核心，切向速度的离散误差会被放大；围道太远，会被邻近涡污染。

### 量级估算：涡环与 Burgers 涡

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

### 涡方法层级与代价

选择依据是"涡结构是否主导你要的量"。直升机旋翼的桨尖涡、飞机尾涡、扑翼涡环这些以离散涡为骨架的流动，涡方法的效率可以比网格法高两个数量级。反过来，壁面附近的湍流边界层是连续谱、没有离散涡骨架，涡方法毫无优势。

| 方法 | 涡量表示 | 适用域 | 主要代价 |
|---|---|---|---|
| 点涡 | 奇点 | 二维远场、稳定性分析 | 近距离奇异性 |
| 涡团（blob） | 光滑核 | 二维自由剪切层 | 核尺度与分辨率耦合 |
| 涡丝 / 涡面 | 拉格朗日线面 | 尾迹、旋翼、三维涡管 | 涡丝变形需重划分 |
| 涡粒子法 | 粒子携带涡量 | 高雷诺数外部绕流 | 粒子畸变需重映射 |
| 涡-网格混合（VIC） | 粒子→网格投影 | 尾迹与壁面相互作用 | 投影耗散 |
| 网格法（LES/DNS） | 欧拉场 | 全部，含壁面与激波 | 全域网格代价 |

## 适用边界与方案选择

### 三个涡模型的适用域

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

### 二维假设何时成立

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

## 工程设置与实施

### 涡核半径的网格依赖性

涡核半径是比涡量峰值更稳健的诊断量，因为它对数值耗散的响应是单调的：网格越粗，耗散越强，核半径被数值地"撑大"。判定要求是

$$
\Delta x \le \frac{r_c}{8}
$$

即涡核直径上至少 16 个单元。若网格加密后核半径持续单调减小而没有平台，说明尚未收敛。

**Lamb-Oseen 涡核对。** 该解析解给出切向速度与核半径演化：

$$
u_\theta(r) = \frac{\Gamma}{2\pi r}\left[1-\exp\left(-\frac{r^{2}}{r_c^{2}}\right)\right],\qquad r_c^{2}=4\nu t
$$

取 $\Gamma=1\,\mathrm{m^2/s}$、$\nu=1.5\times10^{-5}\,\mathrm{m^2/s}$、$t=1\,\mathrm{s}$：

1. $r_c=\sqrt{4\times1.5\times10^{-5}\times1}=\sqrt{6.0\times10^{-5}}=7.75\times10^{-3}\,\mathrm{m}=7.75\,\mathrm{mm}$；
2. 网格要求 $\Delta x\le r_c/8=0.97\,\mathrm{mm}$，即约 1 mm；
3. 峰值切向速度出现在 $r=1.396r_c=10.8\,\mathrm{mm}$ 处，其值 $u_{\theta,\max}=0.638\,\Gamma/(2\pi r_c)=0.638\times1/(2\pi\times0.00775)=13.1\,\mathrm{m/s}$；
4. 峰值涡量 $\omega_{\max}=\Gamma/(\pi r_c^{2})=1/(\pi\times6.0\times10^{-5})=5305\,\mathrm{s^{-1}}$；
5. 时间推进到 $t=2\,\mathrm{s}$：$r_c=\sqrt{1.2\times10^{-4}}=10.95\,\mathrm{mm}$，$\omega_{\max}=1/(\pi\times1.2\times10^{-4})=2653\,\mathrm{s^{-1}}$，恰为 $t=1\,\mathrm{s}$ 时的一半。

第 5 步是最有用的核对：在无外力的自由衰减阶段，峰值涡量必须严格按 $1/t$ 衰减、核半径严格按 $\sqrt{t}$ 增长。求解器若给出别的幂次，问题一定在离散而非物理。

### 后处理与涡量收支脚本

```cpp
// OpenFOAM 函数对象：直接输出 Q 与涡量
functions
{
    vorticity
    {
        type            vorticity;
        libs            ("libfieldFunctionObjects.so");
        writeControl    writeTime;
    }
    Q
    {
        type            Q;
        libs            ("libfieldFunctionObjects.so");
        writeControl    writeTime;
    }
    enstrophy
    {
        type            enstrophy;
        libs            ("libfieldFunctionObjects.so");
        writeControl    writeTime;
    }
}
```

```python
import numpy as np
def lamb_oseen_check(Gamma, nu, t, rc_measured):
    rc_exact = np.sqrt(4 * nu * t)
    w_exact = Gamma / (np.pi * rc_exact**2)
    return dict(rc_exact_mm=rc_exact * 1e3,
                rc_error=abs(rc_measured - rc_exact) / rc_exact,
                omega_max_exact=w_exact)

# Gamma=1, nu=1.5e-5, t=1 s -> rc=7.75 mm, omega_max=5305 1/s
print(lamb_oseen_check(1.0, 1.5e-5, 1.0, rc_measured=7.9e-3))
```

涡量方程的各项收支可以在后处理里直接积分核对：

$$
\int_V \frac{\partial \boldsymbol{\omega}}{\partial t}\,dV = \int_V (\boldsymbol{\omega}\cdot\nabla)\mathbf{u}\,dV - \int_V \boldsymbol{\omega}(\nabla\cdot\mathbf{u})\,dV + \nu\int_V \nabla^{2}\boldsymbol{\omega}\,dV
$$

不可压且无边界通量时，右端只有拉伸项与耗散项。若两者之和与左端的时间变化率相差超过 10%，说明离散误差主导了涡量演化，此时讨论涡结构细节没有意义。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 二维算例的涡量峰值不衰减也不增强 | 拉伸项在二维恒为零，物理上被抹掉 | 做三维展向周期算例对照，看涡量峰值变化 |
| 涡粒子法结果在长时间后出现非物理聚集 | 粒子畸变导致核尺度失真 | 开启粒子重映射并比较总环量守恒 |
| 涡环平移速度对核半径极敏感 | 公式误用，或核半径远大于 $R$ | 核对 $a\ll R$ 前提，检查对数项符号 |
| 有激波时涡量不守恒 | 斜压项被忽略 | 输出 $\nabla\rho\times\nabla p/\rho^{2}$ 的体积分 |
| 壁面附近涡量始终为零 | 涡方法未施加壁面无滑移 | 加入涡片生成项或改用混合方法 |
| 涡核半径随拉伸率增大而增大 | 用错了 $r_c=\sqrt{2\nu/\alpha}$ 的方向 | 核对 $\alpha$ 定义：拉伸应使核变细 |
| 阈值微调后涡结构数量翻倍 | 流场没有清晰的涡尺度分离，准则阈值无物理依据 | 做 5 档阈值扫描，改报告总环量与涡量峰值 |
| 网格加密后涡核半径持续缩小 | 数值耗散尚未收敛 | 做两次加密，要求 $r_c$ 变化小于 5% |
| 涡量峰值按 $1/t^{2}$ 而非 $1/t$ 衰减 | 离散耗散大于物理黏性耗散 | 与 Lamb-Oseen 解析衰减逐时刻对比 |
| 绕涡核的环量随时间单调下降 | 数值耗散或出口涡量通量未处理 | 计算 $\Delta\Gamma/\Gamma$，并检查出口边界 |
| 壁面附近出现非物理的高涡量层 | 涡量边界条件与壁面条件不自洽 | 检查壁面 $\omega$ 与 $\nabla\times\mathbf{u}$ 的一致性 |
| 拉伸项 $\omega\cdot\nabla u$ 很大但涡不增强 | 拉伸被离散耗散抵消 | 输出涡量方程各项的体积分收支 |

## 验证、验收与复现

### 涡识别准则及其阈值敏感性

三个常用准则都从速度梯度张量 $\nabla\mathbf{u}=\mathbf{S}+\boldsymbol{\Omega}$ 出发。Q 准则取

$$
Q = \frac{1}{2}\left(\|\boldsymbol{\Omega}\|^{2} - \|\mathbf{S}\|^{2}\right) > 0
$$

$\lambda_2$ 准则取 $\mathbf{S}^{2}+\boldsymbol{\Omega}^{2}$ 的第二大特征值 $\lambda_2<0$；$\Delta$ 准则取 $\nabla\mathbf{u}$ 的特征方程判别式为正。三者给出的拓扑结构相近，但对阈值的敏感度不同：Q 需要同时给正负号与一个绝对阈值，$\lambda_2$ 只需符号，因此 $\lambda_2$ 在跨工况比较时更稳健。

诊断方法是阈值扫描：把 Q 的阈值按 $2$ 倍步长取 5 档，统计识别出的连通涡结构数量。若数量在相邻档之间变化超过 50%，说明涡结构之间没有清晰的尺度分离，此时任何"涡的个数"都不可报告，只能报告积分量如总环量或涡量峰值。

### 归档要点

报告需要写明：使用的涡识别准则、阈值取值及其扫描结果、涡核半径的网格收敛表、以及环量随时间的曲线。若涡图用于定量结论（如"涡脱落频率提高了 15%"），必须额外给出频率的谱峰与谱宽，并说明采样窗口长度。仅凭若干张彩色涡图得出的趋势判断，无法排除阈值选择带来的假象。

## 参考资料

1. Saffman P.G., *Vortex Dynamics*, Cambridge University Press, 1992.
2. Lamb H., *Hydrodynamics*, 6th ed., Cambridge University Press, 1932.
3. Batchelor G.K., *An Introduction to Fluid Dynamics*, Cambridge University Press, 1967.
4. Burgers J.M., "A Mathematical Model Illustrating the Theory of Turbulence," *Advances in Applied Mechanics*, 1, 171-199, 1948.
5. Cottet G.-H., Koumoutsakos P.D., *Vortex Methods: Theory and Practice*, Cambridge University Press, 2000.
6. Hunt J.C.R., Wray A.A., Moin P., "Eddies, Streams, and Convergence Zones in Turbulent Flows," *Center for Turbulence Research Proceedings*, 193-208, 1988.
7. Jeong J., Hussain F., "On the Identification of a Vortex," *Journal of Fluid Mechanics*, 285, 69-94, 1995.
8. Taylor G.I., Green A.E., "Mechanism of the Production of Small Eddies from Large Ones," *Proceedings of the Royal Society A*, 158(895), 499-521, 1937.
