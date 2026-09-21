---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-acoustics-engineering-setup
title: "声学 Helmholtz 与波动方程：工程设置与参数选择"
summary: "把频率上限换算成单元尺寸、自由度预算、时域步长与吸收层参数，给出空气与水下工况的取值表、PML 电导率上限公式、阻抗边界来源与扫频求解设置，附可复算的 Python 换算脚本。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 工程
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "声学 Helmholtz 与波动方程"
  - "工程设置与参数选择"
  - "完美匹配层"
  - "声学有限元"
seo:
  title: "声学 Helmholtz 与波动方程：工程设置与参数选择"
  description: "把频率上限换算成单元尺寸、自由度预算、时域步长与吸收层参数，给出空气与水下工况的取值表、PML 电导率上限公式、阻抗边界来源与扫频求解设置，附可复算的 Python 换算脚本。"
  keywords:
    - "Helmholtz 方程"
    - "工程设置与参数选择"
    - "完美匹配层"
    - "声学有限元"
    - "CFL 条件"
---

# 声学 Helmholtz 与波动方程：工程设置与参数选择

声学模型的设置顺序是「定频率上限 → 定单元尺寸 → 定吸收层 → 定求解策略」，先划网格再补参数几乎一定返工。下面给出可直接照抄的换算流程与参数取值依据。

## 频率上限决定网格尺度

设最高分析频率 $f_{\max}$、声速 $c$、每波长单元数下限 $N_\lambda$，单元特征尺寸上限为

$$
h \le \frac{c}{f_{\max}N_\lambda},
\qquad
N_\lambda=\frac{c}{f\,h}.
$$

$N_\lambda$ 与相位误差的换算关系是 $N_\lambda\ge 2\pi/\sqrt{24\eta}$：$N_\lambda=6$ 对应 $5\%$ 相位误差，$10$ 对应 $1.6\%$，$13$ 对应 $1.0\%$。把 $N_\lambda$ 与目标精度挂钩，而不是一律取 6。

| 工况 | 介质 | $c$ / (m/s) | $f_{\max}$ / Hz | $\lambda$ / mm | $N_\lambda$ | $h$ / mm |
|---|---|---|---|---|---|---|
| 车厢空腔 NVH | 空气 | 343 | 5000 | 68.6 | 10 | 6.86 |
| 消声器传递损失 | 空气 | 343 | 2000 | 171.5 | 8 | 21.4 |
| 水下声呐基阵 | 海水 | 1480 | 50000 | 29.6 | 8 | 3.70 |

取车厢工况的 $h=8\,\mathrm{mm}$ 复核：$k=2\pi f/c=91.6\,\mathrm{rad/m}$，$kh=0.733$，相位误差 $(kh)^2/24=2.24\%$，实际 $N_\lambda=343/(5000\times0.008)=8.58$。把同一网格用到 $10\,\mathrm{kHz}$，$kh$ 升到 $1.466$、误差升到 $8.96\%$，此时 $h$ 必须减到 $4\,\mathrm{mm}$。

## 时域推进的步长与采样约束

显式时域格式的三维稳定条件为

$$
\Delta t \le \frac{h}{c\sqrt{3}}.
$$

空气 $c=343\,\mathrm{m/s}$、$h=8\,\mathrm{mm}$ 时 $\Delta t\le1.35\times10^{-5}\,\mathrm{s}$，对应采样率 $74.2\,\mathrm{kHz}$，对 $5\,\mathrm{kHz}$ 上限有 $14.8$ 倍余量。若 $h$ 缩到 $2\,\mathrm{mm}$，$\Delta t\le3.37\times10^{-6}\,\mathrm{s}$，采样率 $297\,\mathrm{kHz}$，$20\,\mathrm{ms}$ 物理时间需 $5930$ 步。取上限一半时每周期约 $30$ 个采样点，数值色散可忽略。

## 吸收层的层厚与电导率上限

PML 层内最大阻尼取

$$
\sigma_{\max}=-\frac{(m+1)\ln R_0}{2L},
$$

$\sigma$ 单位为 $\mathrm{m^{-1}}$，$m$ 为幂律指数，$L$ 为层厚，$R_0$ 为设计法向反射系数，层内往返衰减等于 $-\ln R_0$ 奈培。取 $R_0=10^{-6}$、$m=3$、$L=0.25\lambda$：$1\,\mathrm{kHz}$ 空气下 $\sigma_{\max}=322\,\mathrm{m^{-1}}$、往返衰减 $13.8\,\mathrm{Np}$（$-120\,\mathrm{dB}$）；放宽到 $R_0=10^{-4}$ 时 $\sigma_{\max}=215\,\mathrm{m^{-1}}$（$-80\,\mathrm{dB}$），层厚可减到 $0.15\lambda$。层厚下限建议不低于 $0.1\lambda$ 且层内至少 8 层单元。

## 阻抗与吸声边界的取值来源

局部反应阻抗边界为 Robin 形式

$$
\frac{\partial \hat p}{\partial n}=-\frac{i\omega\rho_0}{Z}\hat p,
\qquad
R=\frac{Z-\rho_0 c}{Z+\rho_0 c},
\quad
\alpha=1-|R|^2,
$$

$Z$ 为法向比阻抗（单位 $\mathrm{Rayl}$），空气 $\rho_0 c=413\,\mathrm{Rayl}$。$Z=2\rho_0 c$ 与 $Z=0.5\rho_0 c$ 都给出 $\alpha=0.889$，$Z=\rho_0 c$ 给出 $\alpha=1$，因此吸声材料的阻抗目标是实部接近 $\rho_0 c$。玻璃棉类材料在 $500\,\mathrm{Hz}$ 以上取流阻率 $10\sim30\,\mathrm{kPa\cdot s/m^2}$、厚度 $50\,\mathrm{mm}$ 可达 $\alpha>0.85$。

## 求解设置与扫频策略

- 求解器：自由度 $10^{5}$ 以下用稀疏直接法；更大规模用移位 GMRES 配 AMG 预条件，移位量取 $0.9k^2$ 可避开实轴附近的近奇异。
- 扫频步长：半功率带宽 $\Delta f_{3\mathrm{dB}}=f_n/Q$。阻尼比 $\zeta=0.02$ 时 $Q\approx1/(2\zeta)=25$，$f_1=343\,\mathrm{Hz}$ 对应带宽 $13.7\,\mathrm{Hz}$，步长应取 $2.7\,\mathrm{Hz}$ 以下。
- 热启动：相邻频点复用上一步解，迭代次数可从 $200$ 降到 $30\sim50$。

## 可复算的换算脚本

```python
import math
for name, c, f in [("cabin",343.0,5e3), ("muffler",343.0,2e3), ("sonar",1480.0,5e4)]:
    lam, h = c/f, c/f/10
    kh = 2*math.pi*f/c*h
    L, sig = 0.25*lam, -(3+1)*math.log(1e-6)/(2*0.25*lam)
    print(name, f"h={h*1e3:.2f}mm", f"kh={kh:.3f}", f"err={kh**2/24*100:.2f}%",
          f"dt={h/c/math.sqrt(3)*1e6:.2f}us", f"sigma={sig:.0f}/m")
# cabin   h=6.86mm kh=0.628 err=1.64% dt=11.55us sigma=1611/m
# muffler h=17.15mm kh=0.628 err=1.64% dt=28.87us sigma=644/m
# sonar   h=2.96mm kh=0.628 err=1.64% dt=1.15us sigma=3734/m
```

## 单因素对照与记录字段

| 对照项 | 固定量 | 变化量 | 观测量 |
|---|---|---|---|
| 每波长单元数 | 其余全部 | $N_\lambda=6,8,10,13$ | 一阶模态与 $c/(2L)$ 的相对偏差 |
| 吸收层厚度 | 网格、频率 | $L=0.1\lambda,0.15\lambda,0.25\lambda$ | 截断面驻波幅值给出的反射系数 |
| 吸收层幂律 | $L$、$R_0$ | $m=1,2,3,4$ | 层内残余反射与幅值衰减曲线 |
| 边界阻抗 | 几何、网格 | $Z/\rho_0 c=0.5,1,2$ | 吸声系数 $\alpha$ 与解析值对照 |
| 扫频步长 | 求解器、网格 | $\Delta f=1,3,10\,\mathrm{Hz}$ | 峰值频率与半功率带宽 |

每个工况记录：$f_{\max}$、$\rho_0$、$c$、$N_\lambda$、$h$、$kh$、PML 的 $L$/$m$/$R_0$/$\sigma_{\max}$、求解器类型与迭代次数、参考声压（空气 $20\,\mu\mathrm{Pa}$、水中 $1\,\mu\mathrm{Pa}$）。

## 设置错误的症状与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 高频段共振频率成比例偏低 | 网格按中心频率而非 $f_{\max}$ 定尺 | 按 $N_\lambda=c/(f_{\max}h)$ 重算，$5\,\mathrm{kHz}$ 下 $h$ 应由 $42.9\,\mathrm{mm}$ 降到 $8.6\,\mathrm{mm}$ |
| 截断面附近出现驻波条纹 | 吸收层太薄或幂律太陡 | 层厚由 $0.1\lambda$ 增到 $0.25\lambda$，看条纹是否消失 |
| 峰值频率随扫频步长跳动 | 步长粗于半功率带宽 | $\zeta=0.02$ 时 $Q=25$，$f_1=343\,\mathrm{Hz}$ 对应带宽 $13.7\,\mathrm{Hz}$，步长应低于 $2.7\,\mathrm{Hz}$ |
| 迭代在共振峰处不收敛 | 矩阵在 $k^2$ 接近特征值时近奇异 | 移位量改取 $0.9k^2$ 并启用热启动 |
| 声压级比实测高 $26\,\mathrm{dB}$ | 参考声压口径用错 | 用 $20\log_{10}(20/1)=26.0\,\mathrm{dB}$ 核对，空气应取 $20\,\mu\mathrm{Pa}$ |
| 时域推进若干步后发散 | $\Delta t$ 超过 $h/(c\sqrt{3})$ | 把 $\Delta t$ 减半，若恢复稳定即为 CFL 超限 |

## 参考文献

1. Ihlenburg, F. *Finite Element Analysis of Acoustic Scattering*. Springer, 1998.
2. Berenger, J.-P. A perfectly matched layer for the absorption of electromagnetic waves. *Journal of Computational Physics*, 114(2): 185-200, 1994.
3. Marburg, S. & Nolte, B. (eds.) *Computational Acoustics of Noise Propagation in Fluids*. Springer, 2008.
4. Wu, T. W. *Boundary Element Acoustics: Fundamentals and Computer Codes*. WIT Press, 2000.
5. Harari, I. & Hughes, T. J. R. Galerkin/least-squares finite element methods for the reduced wave equation with non-reflecting boundary conditions in unbounded domains. *Computer Methods in Applied Mechanics and Engineering*, 98(3): 411-454, 1992.
