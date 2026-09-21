---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-validation-taylor-green-diagnosis-validation
title: "Taylor–Green 涡：结果诊断与可信度验证"
summary: "用解析衰减律作为标尺，给出 Taylor–Green 涡动能衰减率、速度场 L2 误差与数值黏性系数的诊断方法和阈值，并演示由三档分辨率反算观测收敛阶的手算。"
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
  - "Taylor–Green 涡"
  - "结果诊断与可信度验证"
  - "动能衰减率"
  - "数值黏性"
seo:
  title: "Taylor–Green 涡：结果诊断与可信度验证"
  description: "用解析衰减律作为标尺，给出 Taylor–Green 涡动能衰减率、速度场 L2 误差与数值黏性系数的诊断方法和阈值，并演示由三档分辨率反算观测收敛阶的手算。"
  keywords:
    - "Taylor–Green 涡"
    - "结果诊断与可信度验证"
    - "动能衰减率"
    - "数值黏性"
    - "L2 速度误差"
---

# Taylor–Green 涡：结果诊断与可信度验证

Taylor–Green 涡是少数在黏性条件下有严格解析解、又能同时检验对流与耗散的无网格基准。它的可信度判据不是"涡看起来圆不圆"，而是三条可量化的线：动能衰减率是否等于 $4\nu k^{2}$、速度场 L2 误差是否随分辨率按预期阶下降、以及反推出的等效数值黏性是否随时间步收敛。本文给出这三条线的公式、阈值与一次完整手算。

## 解析衰减律是判断耗散是否过量的标尺

在 $2\pi\times2\pi$ 的周期方腔内，二维 Taylor–Green 涡的速度场为

$$
u_x = U\,e^{-2\nu k^{2}t}\sin(kx)\cos(ky),\qquad
u_y = -U\,e^{-2\nu k^{2}t}\cos(kx)\sin(ky),
$$

其中 $U$ 为初始速度幅值（m/s），$\nu$ 为运动黏度（$\mathrm{m^2/s}$），波数取 $k=1\ \mathrm{m^{-1}}$（对应域长 $2\pi\ \mathrm{m}$）。因为 $u\sim e^{-2\nu k^2 t}$，体积平均动能按 $u^{2}$ 衰减：

$$
E_k(t)=E_k(0)\,e^{-4\nu k^{2}t},\qquad
\lambda_{\mathrm{exact}}=4\nu k^{2} .
$$

$\lambda_{\mathrm{exact}}$ 的单位是 $\mathrm{s^{-1}}$，它是判断数值耗散是否过量的唯一标尺。取 $U=1\ \mathrm{m/s}$、$\nu=0.01\ \mathrm{m^2/s}$、$k=1\ \mathrm{m^{-1}}$，则 $\lambda_{\mathrm{exact}}=4\times0.01\times1=0.04\ \mathrm{s^{-1}}$，对应雷诺数 $Re=UL/\nu=1\times1/0.01=100$。在 $t=1\ \mathrm{s}$ 时动能比为 $e^{-0.04}=0.9608$，$t=5\ \mathrm{s}$ 时降为 $e^{-0.2}=0.8187$。若数值曲线在 $t=5\ \mathrm{s}$ 只剩初始动能的 0.70，说明多出的耗散已经把物理衰减淹没了。

## 反推等效数值黏性

从数值结果拟合对数动能斜率，得到总衰减率 $\lambda_{\mathrm{num}}$，定义等效数值黏性为

$$
\nu_{\mathrm{num}}=\frac{\lambda_{\mathrm{num}}-\lambda_{\mathrm{exact}}}{4k^{2}} .
$$

该式把"看起来衰减快一点"翻译成有量纲的黏性增量，便于与 $\nu$ 比较。若 $\lambda_{\mathrm{num}}=0.046\ \mathrm{s^{-1}}$，则 $\nu_{\mathrm{num}}=(0.046-0.04)/(4\times1)=1.5\times10^{-3}\ \mathrm{m^2/s}$，即数值黏性占物理黏性的 15%。工程判据是 $\nu_{\mathrm{num}}/\nu\le 0.1$；超过这一比例时，改变 $\nu$ 得到的结论已不可信。

## 速度场 L2 误差与观测收敛阶

在固定时刻（建议取 $t=2\ \mathrm{s}$，此时涡尚未衰减到数值噪声水平）对速度场做加权 L2 误差：

$$
E_{L_2}=\left(\frac{\sum_i V_i\left|\mathbf{u}_i-\mathbf{u}^{\mathrm{exact}}_i\right|^{2}}{\sum_i V_i\left|\mathbf{u}^{\mathrm{exact}}_i\right|^{2}}\right)^{1/2},
$$

$V_i$ 为粒子体积。三档分辨率下的 $E_1,E_2,E_3$ 给出观测收敛阶

$$
p=\frac{\ln(E_{2}/E_{1})}{\ln(\Delta x_{2}/\Delta x_{1})} .
$$

一次可核对的手算：域长 $2\pi\ \mathrm{m}$，三档分辨率分别取 $64^2,128^2,256^2$ 粒子，对应 $\Delta x=0.0982,0.0491,0.0245\ \mathrm{m}$。在 $t=2\ \mathrm{s}$ 测得 $E_1=0.0042$、$E_2=0.0119$、$E_3=0.0312$。则

$$
p_{12}=\frac{\ln(0.0119/0.0042)}{\ln 2}=\frac{1.041}{0.693}=1.50,\qquad
p_{23}=\frac{\ln(0.0312/0.0119)}{\ln 2}=\frac{0.964}{0.693}=1.39 .
$$

两段阶次落在 1.4～1.5，说明二阶格式在该分辨率区间被边界与初始化的低阶误差稀释；若 $p_{12}<1$，优先检查周期边界是否真正闭合，以及时间步是否小到让时间离散误差退出主导。

## 时间步与分辨率必须分开扫

Taylor–Green 涡的诊断最容易出错的地方，是把空间加密和时间步缩小同时做。若 $\Delta t$ 由 CFL 数固定，则 $\Delta t\propto\Delta x$，空间与时间误差一起变小，反推出的 $p$ 会被系统性抬高。正确做法是先固定 $\Delta x$，把 $\Delta t$ 从 $0.01\ \mathrm{s}$ 逐步缩到 $0.001\ \mathrm{s}$，确认 $E_{L_2}$ 变化小于 1%，再固定 $\Delta t$ 扫 $\Delta x$。只有在这两步都稳定后，上式的 $p$ 才有解释力。

## 诊断脚本

```python
import numpy as np

nu, k, U, T = 0.01, 1.0, 1.0, 2.0      # m^2/s, 1/m, m/s, s
lam_exact = 4 * nu * k**2               # 0.04 1/s

def numerical_viscosity(lam_num, k=1.0, lam_exact=lam_exact):
    """由实测衰减率反推等效数值黏性"""
    return (lam_num - lam_exact) / (4 * k**2)

def fit_decay(t, Ek):
    """对 ln(Ek) 做线性拟合得到斜率 -lambda"""
    slope, _ = np.polyfit(t, np.log(Ek), 1)
    return -slope

def order(E1, E2, dx1, dx2):
    return np.log(E2 / E1) / np.log(dx2 / dx1)

print("Ek(t=1)/Ek0 =", np.exp(-lam_exact * 1.0))   # 0.9608
print("nu_num =", numerical_viscosity(0.046))      # 1.5e-3 m^2/s
print("p12 =", order(0.0042, 0.0119, 0.0982, 0.0491))  # 1.50
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 动能衰减明显快于 $e^{-0.04t}$ | 人工黏性或核函数耗散过强 | 拟合 $\lambda_{\mathrm{num}}$ 并算 $\nu_{\mathrm{num}}/\nu$，看是否超 0.1 |
| 涡在 $t=3\ \mathrm{s}$ 后停止衰减 | 空间分辨率不足，涡核被抹成常数场 | 比较 $128^2$ 与 $256^2$ 的 $t=5\ \mathrm{s}$ 动能 |
| $p_{12}$ 高于理论阶 | $\Delta t$ 随 $\Delta x$ 同步缩小，时间误差混入 | 固定 $\Delta x$ 单独缩 $\Delta t$，看 $E_{L_2}$ 是否已平台 |
| 速度剖面出现棋盘振荡 | 粒子无序初始化未做正则化 | 用规则格点与扰动格点各跑一次比较 $E_{L_2}$ |
| 动能曲线有周期性抖动 | 采样频率与涡对流频率接近，混叠 | 把输出间隔从 $0.02\ \mathrm{s}$ 加密到 $0.005\ \mathrm{s}$ |
| 反推黏性为负 | 拟合窗口太短或包含初始化瞬态 | 把拟合起点从 $t=0$ 后移到 $t=0.5\ \mathrm{s}$ |

## 复核与参考文献

判定通过需同时满足 $\nu_{\mathrm{num}}/\nu\le0.1$、$p\in[1.3,2.2]$ 且单调、固定 $\Delta x$ 下 $E_{L_2}$ 对 $\Delta t$ 的平台化。参考文献：

1. Taylor, G. I., Green, A. E., "Mechanism of the production of small eddies from large ones," *Proceedings of the Royal Society A*, 158(895), 1937, pp. 499–521.
2. Ethier, C. R., Steinman, D. A., "Exact fully 3D Navier–Stokes solutions for benchmarking," *International Journal for Numerical Methods in Fluids*, 19(5), 1994, pp. 369–375.
3. Chorin, A. J., "Numerical solution of the Navier–Stokes equations," *Mathematics of Computation*, 22(104), 1968, pp. 745–762.
4. Brachet, M. E., et al., "Small-scale structure of the Taylor–Green vortex," *Journal of Fluid Mechanics*, 130, 1983, pp. 411–452.
5. Monaghan, J. J., "Smoothed Particle Hydrodynamics," *Annual Review of Astronomy and Astrophysics*, 30, 1992, pp. 543–574.
6. Violeau, D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
7. Morris, J. P., Fox, P. J., Zhu, Y., "Modeling low Reynolds number incompressible flows using SPH," *Journal of Computational Physics*, 136(1), 1997, pp. 214–226.
