---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-vortex-dynamics-diagnosis-validation
title: "旋涡动力学：结果诊断与可信度验证"
summary: "涡识别准则的阈值敏感性、涡核半径的网格依赖性、环量与涡量通量守恒是三条独立证据。本文给出判定阈值、失败现象表，并用 Lamb-Oseen 涡的解析衰减做逐项手算核对。"
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
  - "旋涡动力学"
  - "结果诊断与可信度验证"
  - "Q 准则"
  - "Lamb-Oseen 涡"
seo:
  title: "旋涡动力学：结果诊断与可信度验证"
  description: "涡识别准则的阈值敏感性、涡核半径的网格依赖性、环量与涡量通量守恒是三条独立证据。本文给出判定阈值、失败现象表，并用 Lamb-Oseen 涡的解析衰减做逐项手算核对。"
  keywords:
    - "旋涡动力学"
    - "结果诊断与可信度验证"
    - "Q 准则"
    - "Lamb-Oseen 涡"
    - "环量"
---

# 旋涡动力学：结果诊断与可信度验证

涡结构是数值方法最容易"画出来"也最容易画错的东西：换个 Q 阈值，涡的数量可以翻倍；网格粗一倍，涡核可以胖一倍。判断一张涡图是否可信，需要三条不依赖阈值的证据：涡核半径随网格的收敛性、环量随时间的守恒性、以及拉伸项与耗散项的收支平衡。本文把这三条做成可执行的检查。

## 1 涡识别准则及其阈值敏感性

三个常用准则都从速度梯度张量 $\nabla\mathbf{u}=\mathbf{S}+\boldsymbol{\Omega}$ 出发。Q 准则取

$$
Q = \frac{1}{2}\left(\|\boldsymbol{\Omega}\|^{2} - \|\mathbf{S}\|^{2}\right) > 0
$$

$\lambda_2$ 准则取 $\mathbf{S}^{2}+\boldsymbol{\Omega}^{2}$ 的第二大特征值 $\lambda_2<0$；$\Delta$ 准则取 $\nabla\mathbf{u}$ 的特征方程判别式为正。三者给出的拓扑结构相近，但对阈值的敏感度不同：Q 需要同时给正负号与一个绝对阈值，$\lambda_2$ 只需符号，因此 $\lambda_2$ 在跨工况比较时更稳健。

诊断方法是阈值扫描：把 Q 的阈值按 $2$ 倍步长取 5 档，统计识别出的连通涡结构数量。若数量在相邻档之间变化超过 50%，说明涡结构之间没有清晰的尺度分离，此时任何"涡的个数"都不可报告，只能报告积分量如总环量或涡量峰值。

## 2 涡核半径的网格依赖性

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

## 3 环量与涡量通量守恒

对无黏正压流动，Kelvin 定理给出

$$
\frac{D\Gamma}{Dt}=0,\qquad \Gamma=\oint_C \mathbf{u}\cdot d\mathbf{l}
$$

数值解中环量会缓慢漂移，漂移率是离散质量的直接度量。判定阈值：在 10 个对流时间尺度内，绕涡核的环量相对变化应小于 1%。若超过 5%，说明数值耗散或边界通量有问题。

围道选择也有讲究：半径取 $3r_c$ 时已包含 99% 的环量，同时远离核心的高梯度区，积分误差最小。围道太靠近核心，切向速度的离散误差会被放大；围道太远，会被邻近涡污染。

## 4 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 阈值微调后涡结构数量翻倍 | 流场没有清晰的涡尺度分离，准则阈值无物理依据 | 做 5 档阈值扫描，改报告总环量与涡量峰值 |
| 网格加密后涡核半径持续缩小 | 数值耗散尚未收敛 | 做两次加密，要求 $r_c$ 变化小于 5% |
| 涡量峰值按 $1/t^{2}$ 而非 $1/t$ 衰减 | 离散耗散大于物理黏性耗散 | 与 Lamb-Oseen 解析衰减逐时刻对比 |
| 绕涡核的环量随时间单调下降 | 数值耗散或出口涡量通量未处理 | 计算 $\Delta\Gamma/\Gamma$，并检查出口边界 |
| 壁面附近出现非物理的高涡量层 | 涡量边界条件与壁面条件不自洽 | 检查壁面 $\omega$ 与 $\nabla\times\mathbf{u}$ 的一致性 |
| 拉伸项 $\omega\cdot\nabla u$ 很大但涡不增强 | 拉伸被离散耗散抵消 | 输出涡量方程各项的体积分收支 |

## 5 后处理与涡量收支脚本

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

## 6 归档要点

报告需要写明：使用的涡识别准则、阈值取值及其扫描结果、涡核半径的网格收敛表、以及环量随时间的曲线。若涡图用于定量结论（如"涡脱落频率提高了 15%"），必须额外给出频率的谱峰与谱宽，并说明采样窗口长度。仅凭若干张彩色涡图得出的趋势判断，无法排除阈值选择带来的假象。

## 参考资料

1. Hunt J.C.R., Wray A.A., Moin P., "Eddies, Streams, and Convergence Zones in Turbulent Flows," *Center for Turbulence Research Proceedings*, 193-208, 1988.
2. Jeong J., Hussain F., "On the Identification of a Vortex," *Journal of Fluid Mechanics*, 285, 69-94, 1995.
3. Lamb H., *Hydrodynamics*, 6th ed., Cambridge University Press, 1932.
4. Saffman P.G., *Vortex Dynamics*, Cambridge University Press, 1992.
5. Taylor G.I., Green A.E., "Mechanism of the Production of Small Eddies from Large Ones," *Proceedings of the Royal Society A*, 158(895), 499-521, 1937.
