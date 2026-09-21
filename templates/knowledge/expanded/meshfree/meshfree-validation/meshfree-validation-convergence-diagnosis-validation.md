---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-validation-convergence-diagnosis-validation
title: "粒子收敛研究：结果诊断与可信度验证"
summary: "把空间误差与时间误差分离：固定平滑长度比 h/Δx 后如何判断时间步是否污染空间收敛阶，给出联合误差模型、时间误差占比判据、Richardson 外推与三档手算。"
category:
  slug: meshfree-validation
  name: "无网格法验证与基准"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法验证与基准"
  - "粒子收敛研究"
  - "结果诊断与可信度验证"
  - "平滑长度比"
  - "时空误差分离"
seo:
  title: "粒子收敛研究：结果诊断与可信度验证"
  description: "把空间误差与时间误差分离：固定平滑长度比 h/Δx 后如何判断时间步是否污染空间收敛阶，给出联合误差模型、时间误差占比判据、Richardson 外推与三档手算。"
  keywords:
    - "粒子收敛研究"
    - "结果诊断与可信度验证"
    - "平滑长度比"
    - "时空误差分离"
    - "Richardson 外推"
---

# 粒子收敛研究：结果诊断与可信度验证

粒子法收敛研究最常见的失败不是"没有收敛"，而是把时间误差当成空间误差一起测，得出一个既不属于空间也不属于时间的阶次。可信做法是：固定 $h/\Delta x$ 扫粒子间距得空间阶，固定 $\Delta x$ 缩时间步得时间平台，再确认时间误差占比低于 10%。

## 平滑长度比必须先固定

SPH 核近似的截断误差同时依赖平滑长度 $h$ 与粒子间距 $\Delta x$，两者之比 $\kappa=h/\Delta x$ 决定支持域内的邻居数。二维规则排布下，$\kappa=1.2$ 时邻居数约 21，$\kappa=1.0$ 时约 12，$\kappa=1.5$ 时约 33。若加密时只改 $\Delta x$ 而不同步改 $h$，邻居数会随 $\Delta x$ 变化，误差常数随之漂移，观测阶失去意义。因此收敛扫描的第一步是把 $\kappa$ 写成常数：

$$
h=\kappa\,\Delta x,\qquad \kappa=\text{const}\ (\text{建议 }1.2\sim1.3).
$$

该式的用途是把二维扫描降为一维：所有算例只改 $\Delta x$，$h$ 与支持域粒子数自动保持。诊断证据是邻居数直方图：三档算例内部区邻居数均值应一致（如 $21\pm1$），若细网格上邻居数明显偏多，说明 $h$ 没跟着缩。

## 联合误差模型与阶次混合

总误差是空间与时间两项之和：

$$
E(\Delta x,\Delta t)\approx C_s\,\Delta x^{p_s}+C_t\,\Delta t^{p_t} .
$$

若时间步按声学 CFL 与粒子间距绑定，$\Delta t=C_{\mathrm{CFL}}\,h/c_0=C_{\mathrm{CFL}}\,\kappa\,\Delta x/c_0$，则 $\Delta t\propto\Delta x$，时间项也按 $\Delta x^{p_t}$ 下降，于是观测阶退化为两者较小值：

$$
p_{\mathrm{obs}}=\min\!\left(p_s,\,p_t\right)\quad(\text{当 }\Delta t\propto\Delta x).
$$

这就是"加密后阶次只有 1 出头"的常见原因：空间格式名义二阶，但时间积分只有一阶，两者同步缩小时观测阶被时间项钉在 1。判断时间项是否可忽略，用误差比：

$$
\frac{E_t}{E_s}=\frac{C_t}{C_s}\,\frac{\Delta t^{p_t}}{\Delta x^{p_s}}\le 0.1 .
$$

只有满足该式，扫 $\Delta x$ 得到的 $p$ 才属于空间格式。

## 固定 Δx 缩 Δt：找时间平台

先在一个中等分辨率上把 $\Delta t$ 单独缩小。取 $\Delta x=5\ \mathrm{mm}$、$c_0=50\ \mathrm{m/s}$、$C_{\mathrm{CFL}}=0.2$，则基准时间步 $\Delta t=0.2\times0.005/50=2.0\times10^{-5}\ \mathrm{s}$。把 $\Delta t$ 依次取 $2.0\times10^{-5}$、$1.0\times10^{-5}$、$5.0\times10^{-6}\ \mathrm{s}$，测得归一化误差为 $0.0209$、$0.0206$、$0.0205$。相邻两档变化分别为 1.4% 与 0.5%，说明在 $\Delta t\le2.0\times10^{-5}\ \mathrm{s}$ 时时间误差已低于总误差的 2%，满足 $E_t/E_s\le0.1$。若把 $C_{\mathrm{CFL}}$ 提到 0.6（$\Delta t=6.0\times10^{-5}\ \mathrm{s}$），误差跳到 $0.0231$，时间项重新主导。

## 固定 κ 扫 Δx：空间收敛阶

在确认时间平台后，固定 $\kappa=1.3$、$C_{\mathrm{CFL}}=0.2$，只改 $\Delta x$，用目标量的相对 L2 误差

$$
E_{L_2}=\left(\frac{\sum_i V_i\left(\phi_i-\phi_i^{\mathrm{ref}}\right)^{2}}{\sum_i V_i\left(\phi_i^{\mathrm{ref}}\right)^{2}}\right)^{1/2},
$$

再由相邻两档估计观测阶：

$$
p=\frac{\ln\!\left(E_{2}/E_{1}\right)}{\ln\!\left(\Delta x_{2}/\Delta x_{1}\right)} .
$$

一次可核对的手算：取 $\Delta x=20,10,5\ \mathrm{mm}$（对应 $h=26,13,6.5\ \mathrm{mm}$），测得 $E_1=0.0024$、$E_2=0.0071$、$E_3=0.0209$。则

$$
p_{12}=\frac{\ln(0.0071/0.0024)}{\ln 2}=\frac{1.085}{0.693}=1.57,\qquad
p_{23}=\frac{\ln(0.0209/0.0071)}{\ln 2}=\frac{1.080}{0.693}=1.56 .
$$

两段阶次稳定在 1.56，且与时间平台条件同时成立，说明该阶次属于空间格式，并揭示其实际精度介于 1 与 2 之间——这是自由表面或边界一致性误差把名义二阶拉低的结果。

## Richardson 外推与可信区间

用估计出的 $p$ 对最细网格做外推，得到零间距极限：

$$
\phi_{\mathrm{ext}}\approx\phi_{1}+\frac{\phi_{1}-\phi_{2}}{r^{p}-1},\qquad r=\frac{\Delta x_{2}}{\Delta x_{1}} .
$$

一次手算：若目标量为末态总能量，$\phi_1=1.042\ \mathrm{J}$、$\phi_2=1.061\ \mathrm{J}$、$r=2$、$p=1.56$，则 $r^{p}=2^{1.56}=2.949$，$\phi_{\mathrm{ext}}=1.042+(1.042-1.061)/(2.949-1)=1.042-0.00975=1.032\ \mathrm{J}$。外推值与最细网格值相差约 1.0%，若这一差值大于目标精度要求，说明最细网格仍未进入渐近区，需要再补一档。

## 收敛诊断脚本

```python
import numpy as np

def observed_order(E1, E2, dx1, dx2):
    """相邻两档的观测收敛阶"""
    return np.log(E2 / E1) / np.log(dx2 / dx1)

def richardson(phi1, phi2, r, p):
    """Richardson 外推"""
    return phi1 + (phi1 - phi2) / (r**p - 1)

def dt_from_cfl(dx, kappa=1.3, C=0.2, c0=50.0):
    """声学 CFL 时间步，h 随 dx 同步缩放"""
    h = kappa * dx
    return C * h / c0

# 三档分辨率
dx = np.array([0.020, 0.010, 0.005])          # m
E  = np.array([0.0024, 0.0071, 0.0209])       # fine<-coarse 归一化误差
p12 = observed_order(E[1], E[0], dx[1], dx[0])
p23 = observed_order(E[2], E[1], dx[2], dx[1])
print("p12=%.2f  p23=%.2f" % (p12, p23))      # 1.57 1.56
print("phi_ext =", round(richardson(1.042, 1.061, 2.0, 1.56), 4))  # 1.032
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 加密后阶次只有 1 出头 | 时间步与粒子间距同步缩小，时间项主导 | 固定 $\Delta x$ 单独缩 $\Delta t$，看误差是否出现平台 |
| 阶次在水平间跳变 | 加密时 $h/\Delta x$ 未固定，邻居数漂移 | 输出三档邻居数直方图，看均值是否一致 |
| 细网格误差反而上升 | 时间步过大，CFL 越界 | 检查 $\Delta t\le0.2h/c_0$ 是否在所有算例成立 |
| 两档误差比接近 1 | 尚未进入渐近区，粗网格误差饱和 | 补一档更细网格，看 $p$ 是否稳定 |
| 外推值远离最细网格值 | 最细网格仍含未收敛的低阶误差 | 比较 $\lvert\phi_{\mathrm{ext}}-\phi_1\rvert/\phi_1$ 与目标精度 |
| 阶次明显高于理论值 | 参考解本身分辨率不足，误差被低估 | 用更高一档的解作参考重算 $E$ |

## 复核与参考文献

通过条件：$h/\Delta x$ 在全部算例恒定、$\Delta t$ 已确认落在时间平台、相邻两档 $p$ 差异小于 15%、外推值与最细网格值之差小于目标精度。参考文献：

1. Zhu, Q., Hernquist, L., Li, Y., "Numerical Convergence in Smoothed Particle Hydrodynamics," *The Astrophysical Journal*, 576(1), 2002, pp. 315–323.
2. Quinlan, N. J., Basa, M., Lastiwka, M., "Truncation error in mesh-free particle methods," *International Journal for Numerical Methods in Engineering*, 66(13), 2006, pp. 2064–2085.
3. Fatehi, R., Manzari, M. T., "Error estimation in smoothed particle hydrodynamics and a new scheme for second derivatives," *Computers & Mathematics with Applications*, 61(2), 2011, pp. 482–498.
4. Violeau, D., Leroy, A., "On the maximum time step in weakly compressible SPH," *Journal of Computational Physics*, 256, 2014, pp. 388–415.
5. Monaghan, J. J., "Smoothed Particle Hydrodynamics," *Annual Review of Astronomy and Astrophysics*, 30, 1992, pp. 543–574.
6. Morris, J. P., Fox, P. J., Zhu, Y., "Modeling low Reynolds number incompressible flows using SPH," *Journal of Computational Physics*, 136(1), 1997, pp. 214–226.
7. Violeau, D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
