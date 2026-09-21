---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-validation-wave-propagation-diagnosis-validation
title: "规则波传播：结果诊断与可信度验证"
summary: "以线性色散关系为标尺，给出相速误差、幅值衰减系数、反射系数与波面 L2 误差的诊断阈值，并演示由周期和水深迭代求解波数、再反算相速的手算与诊断脚本。"
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
  - "规则波传播"
  - "结果诊断与可信度验证"
  - "色散关系"
  - "相速误差"
seo:
  title: "规则波传播：结果诊断与可信度验证"
  description: "以线性色散关系为标尺，给出相速误差、幅值衰减系数、反射系数与波面 L2 误差的诊断阈值，并演示由周期和水深迭代求解波数、再反算相速的手算与诊断脚本。"
  keywords:
    - "规则波传播"
    - "结果诊断与可信度验证"
    - "线性色散关系"
    - "相速误差"
    - "幅值衰减"
---

# 规则波传播：结果诊断与可信度验证

规则波基准的诊断难点在于三种误差会互相伪装：数值耗散让波幅衰减、数值色散让相速偏快或偏慢、下游反射让波面出现驻波条纹。若不分开测量，很容易把反射造成的幅值振荡当成耗散。本文以线性色散关系为标尺，给出相速、幅值、反射三类诊断量的阈值与一次迭代求解波数的手算。

## 色散关系给出相速参照

对水深 $h$、周期 $T$ 的线性规则波，角频率 $\omega=2\pi/T$，波数 $k$ 满足色散关系

$$
\omega^{2}=g\,k\tanh(kh),
$$

而相速为

$$
c=\frac{\omega}{k}=\sqrt{\frac{g}{k}\tanh(kh)},\qquad
c_0=\frac{gT}{2\pi}\ \ (\text{深水极限}).
$$

$c_0$ 是深水相速（m/s），用作快速量级估计。该式的用途是给出任意水深下的解析相速，作为数值相速的对照。

一次可核对的手算（深水）：取 $h=1.0\ \mathrm{m}$、$T=1.0\ \mathrm{s}$，则 $\omega=2\pi/1.0=6.283\ \mathrm{rad/s}$，深水波数 $k_0=\omega^{2}/g=39.48/9.81=4.024\ \mathrm{m^{-1}}$。因 $k_0h=4.024\gg\pi$，$\tanh(k_0h)\approx1.000$，深水假设成立，相速 $c_0=gT/(2\pi)=9.81/6.283=1.561\ \mathrm{m/s}$，波长 $L=c_0T=1.561\ \mathrm{m}$。

一次可核对的手算（有限水深）：取 $h=0.5\ \mathrm{m}$、$T=2.0\ \mathrm{s}$，则 $\omega=2\pi/2.0=3.142\ \mathrm{rad/s}$，$\omega^{2}/g=0.9859\ \mathrm{m^{-1}}$。需迭代求解 $k\tanh(kh)=0.9859$：取 $k=1.55$，$kh=0.775$，$\tanh(0.775)=0.6498$，乘积 $1.007$；取 $k=1.52$，$kh=0.760$，$\tanh=0.6418$，乘积 $0.976$；取 $k=1.545$，$kh=0.7725$，$\tanh=0.6485$，乘积 $1.002$；取 $k=1.535$，乘积 $0.993$。插值得 $k\approx1.538\ \mathrm{m^{-1}}$，相速 $c=\omega/k=3.142/1.538=2.043\ \mathrm{m/s}$，波长 $L=2\pi/k=4.085\ \mathrm{m}$。深水估计会给出 $c_0=9.81\times2.0/6.283=3.123\ \mathrm{m/s}$，比真实相速高 53%，这正是有限水深必须迭代求解的原因。

## 相速误差与幅值衰减系数

在沿程两个测点 $x_1,x_2$ 提取波面相位 $\phi$，相速由相位差反算：

$$
c_{\mathrm{num}}=\frac{\omega\,(x_2-x_1)}{\Delta\phi},
$$

相速相对误差 $\varepsilon_c=\lvert c_{\mathrm{num}}-c\rvert/c$，工程阈值取 $\le2\%$。幅值按指数衰减拟合：

$$
A(x)=A_0\,e^{-\alpha x},\qquad
\alpha=\frac{\ln\!\left(A_1/A_2\right)}{x_2-x_1},
$$

$\alpha$ 的单位是 $\mathrm{m^{-1}}$。对上述有限水深算例，若 $A_0=0.05\ \mathrm{m}$，在 $x=10\ \mathrm{m}$ 处测得 $A=0.045\ \mathrm{m}$，则 $\alpha=\ln(0.05/0.045)/10=0.0105\ \mathrm{m^{-1}}$，等效到 5 个波长（$5\times4.085=20.4\ \mathrm{m}$）后幅值降到 $e^{-0.214}=0.807$，即损失 19%——这一量级的耗散会严重污染后续的破碎与爬高分析，需要先降低人工黏性。

## 反射系数的分离测量

反射会同时改变幅值与相位，必须单独标定。用三点法（Goda 两点法）在波腹与波节处分别读取波高 $H_{\max}$ 与 $H_{\min}$，反射系数为

$$
K_R=\frac{H_{\max}-H_{\min}}{H_{\max}+H_{\min}} .
$$

消波区的验收阈值通常取 $K_R\le0.05$；若 $K_R>0.1$，波面会呈现明显的空间包络，此时先延长消波区或改用主动吸收边界，再评估耗散。诊断顺序应是：先测 $K_R$，再测 $\alpha$，最后测 $c$，因为反射会同时污染后两项。

## 三档分辨率的波面误差

波面高度 $\eta$ 的 L2 误差为

$$
E_{\eta}=\left(\frac{1}{N}\sum_{n=1}^{N}\left(\eta_{n}-\eta^{\mathrm{exact}}_{n}\right)^{2}\right)^{1/2}\Big/A_0,
$$

$A_0$ 为入射波幅（m）。三档分辨率下的观测阶仍按 $p=\ln(E_2/E_1)/\ln(\Delta x_2/\Delta x_1)$ 估计。一次手算：$\Delta x=8,4,2\ \mathrm{mm}$ 时 $E_1=0.018$、$E_2=0.043$、$E_3=0.101$，得

$$
p_{12}=\frac{\ln(0.043/0.018)}{\ln 2}=\frac{0.871}{0.693}=1.26,\qquad
p_{23}=\frac{\ln(0.101/0.043)}{\ln 2}=\frac{0.854}{0.693}=1.23 .
$$

阶次约 1.25 且单调，说明波面误差由自由表面一致性误差主导；若阶次接近 0，通常是每波长粒子数不足，建议 $L/\Delta x\ge40$。对本例 $L=4.085\ \mathrm{m}$、$\Delta x=8\ \mathrm{mm}$，$L/\Delta x=511$，远超门槛，因此剩余误差来自时间积分与边界。

## 相速与衰减诊断脚本

```python
import numpy as np

g, h, T = 9.81, 0.5, 2.0
omega = 2 * np.pi / T
target = omega**2 / g

def solve_k(target, h, k=1.5, tol=1e-10):
    """迭代求解 k*tanh(kh)=omega^2/g"""
    for _ in range(200):
        f = k * np.tanh(k * h) - target
        df = np.tanh(k * h) + k * h * (1 - np.tanh(k * h)**2)
        k -= f / df
        if abs(f) < tol:
            break
    return k

k = solve_k(target, h)
c = omega / k
print("k = %.4f 1/m, c = %.4f m/s, L = %.4f m" % (k, c, 2*np.pi/k))

def damping_coeff(A1, A2, x1, x2):
    return np.log(A1 / A2) / (x2 - x1)

def reflection_coeff(Hmax, Hmin):
    return (Hmax - Hmin) / (Hmax + Hmin)

def order(E1, E2, dx1, dx2):
    return np.log(E2 / E1) / np.log(dx2 / dx1)

print("alpha =", damping_coeff(0.05, 0.045, 0.0, 10.0), "1/m")
print("KR =", reflection_coeff(0.104, 0.096))
print("p12 =", order(0.018, 0.043, 0.008, 0.004))
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 相速偏快但幅值不变 | 数值色散，每波长粒子数不足 | 把 $L/\Delta x$ 从 20 提到 60，看 $\varepsilon_c$ 是否回落 |
| 波面出现空间包络 | 下游反射形成驻波 | 用 $K_R=(H_{\max}-H_{\min})/(H_{\max}+H_{\min})$ 量化，看是否超 0.05 |
| 幅值沿程持续衰减 | 人工黏性过量或自由表面耗散 | 拟合 $\alpha$，与 5 波长内 5% 损失的目标比较 |
| 相速误差随水深突增 | 误用深水公式而实际为有限水深 | 用 $k\tanh(kh)=\omega^2/g$ 迭代求 $k$，与 $gT/2\pi$ 对比 |
| 波面在造波机附近高频抖动 | 造波边界冲量过强，产生寄生高频波 | 把造波速度斜坡从 0.5T 延长到 2T |
| 加密后波幅反而更小 | 时间步随分辨率缩小，数值耗散未同比例下降 | 固定 $\Delta x$ 单独缩 $\Delta t$，看 $\alpha$ 是否平台 |

## 复核与参考文献

通过条件：$K_R\le0.05$、$\varepsilon_c\le2\%$、5 波长内幅值损失 $\le5\%$、$p\in[1.0,2.2]$ 且单调。参考文献：

1. Dean, R. G., Dalrymple, R. A., *Water Wave Mechanics for Engineers and Scientists*, World Scientific, 1991.
2. Goda, Y., Suzuki, Y., "Estimation of incident and reflected waves in random wave experiments," *Proceedings of the 15th Coastal Engineering Conference*, ASCE, 1976, pp. 828–845.
3. Monaghan, J. J., "Simulating Free Surface Flows with SPH," *Journal of Computational Physics*, 110(2), 1994, pp. 399–406.
4. Antuono, M., Colagrossi, A., Marrone, S., "Numerical diffusive terms in weakly-compressible SPH schemes," *Computer Physics Communications*, 183(12), 2012, pp. 2570–2580.
5. SPHERIC, "SPHERIC Benchmark Test Cases," ERCOFTAC SPHERIC Workshop benchmark suite.
6. Violeau, D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
7. Liu, G. R., Liu, M. B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
