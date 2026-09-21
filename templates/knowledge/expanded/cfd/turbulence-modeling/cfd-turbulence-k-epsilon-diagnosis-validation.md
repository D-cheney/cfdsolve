---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-k-epsilon-diagnosis-validation
title: "k–epsilon 模型：结果诊断与可信度验证"
summary: "用场量而不是残差判定 k-ε 结果是否可信：湍流黏度比与对数律一致性检验、局域平衡比 P_k/(rho epsilon) 的取值区间、停滞区产生项过冲排查，以及与摩擦关联式反算压降的定量对照。"
category:
  slug: turbulence-modeling
  name: "湍流与近壁建模"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "湍流与近壁建模"
  - "k–epsilon 模型"
  - "结果诊断与可信度验证"
  - "局域平衡"
  - "湍流黏度比"
seo:
  title: "k–epsilon 模型：结果诊断与可信度验证"
  description: "用场量而不是残差判定 k-ε 结果是否可信：湍流黏度比与对数律一致性检验、局域平衡比 P_k/(rho epsilon) 的取值区间、停滞区产生项过冲排查，以及与摩擦关联式反算压降的定量对照。"
  keywords:
    - "k–epsilon 模型"
    - "结果诊断与可信度验证"
    - "湍流黏度比"
    - "局域平衡"
    - "压降验证"
---

# k–epsilon 模型：结果诊断与可信度验证

k-ε 算例的残差曲线可以在结果完全错误时依旧漂亮，因为 ε 方程的源汇项量级接近，残差下降只说明两个大项互相抵消。真正有效的诊断来自三个场量：湍流黏度比、产生项与耗散项之比、以及壁面附近的 $k$ 与 $\varepsilon$ 是否同时满足对数律平衡关系。本文用一根圆管的完整算例给出阈值与手算对照，管径 $D = 0.1\,\mathrm{m}$、平均速度 $U = 5\,\mathrm{m/s}$、空气 $\rho = 1.2\,\mathrm{kg/m^3}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$，即 $Re = 33300$。

## 1 从壁面剪切反算对数律区的平衡值

诊断的基准不是经验数字，而是本算例自己的壁面剪切。由 Blasius 摩擦因子 $f = 0.316\,Re^{-0.25} = 0.0234$ 得

$$\tau_w = \frac{f\rho U^{2}}{8} = 0.0877\,\mathrm{Pa}, \qquad u_\tau = \sqrt{\tau_w/\rho} = 0.270\,\mathrm{m/s}$$

于是 $\nu/u_\tau = 55.5\,\mathrm{\mu m}$，据此得到对数律区两个必须成立的平衡关系：

$$k_{\text{eq}} = \frac{u_\tau^{2}}{\sqrt{C_\mu}} = 0.244\,\mathrm{m^2/s^2}, \qquad \varepsilon_{\text{eq}} = \frac{u_\tau^{3}}{\kappa y}$$

在 $y = 5\,\mathrm{mm}$ 处，$\varepsilon_{\text{eq}} = 0.01975/(0.41\times0.005) = 9.64\,\mathrm{m^2/s^3}$。这两个值应出现在对数律区中段，若求解结果在该处偏离 30% 以上，说明入口条件或壁面处理有问题，而不是模型本身。

## 2 湍流黏度比的双路一致性检验

对数律区还有一个很强的自洽条件：由混合长度得到的 $\mu_t = \rho\kappa u_\tau y$ 必须与由 $k$、$\varepsilon$ 得到的 $\mu_t = \rho C_\mu k^{2}/\varepsilon$ 相等。

$$\mu_t = \rho\kappa u_\tau y, \qquad \mu_t = \rho C_\mu\frac{k^{2}}{\varepsilon}, \qquad \frac{\mu_t}{\mu} = \frac{C_\mu k^{2}}{\varepsilon\nu}$$

在 $y = 5\,\mathrm{mm}$ 处，第一式给出 $\mu_t = 1.2\times0.41\times0.270\times0.005 = 6.65\times10^{-4}\,\mathrm{Pa\cdot s}$；第二式代入上面的平衡值给出 $1.2\times0.09\times0.0593/9.64 = 6.65\times10^{-4}\,\mathrm{Pa\cdot s}$，两路完全一致，对应 $\mu_t/\mu = 36.9$。这条检验的价值在于：只要有一个量被填错，两路结果就会分离，而分离的倍数直接指向出错的那一项。

内流核心区的 $\mu_t/\mu$ 常见区间是 30~300。低于 10 说明湍流被过度抑制（入口 $k$ 偏小或 $\varepsilon$ 偏大），高于 $10^{3}$ 说明长度尺度填得过大。

## 3 局域平衡比 $P_k/(\rho\varepsilon)$ 的取值区间

标准 k-ε 的核心假设是产生与耗散局域平衡。用 $P_k = \mu_t S^{2}$ 计算：

$$\frac{P_k}{\rho\varepsilon} = \frac{\mu_t S^{2}}{\rho\varepsilon}$$

对数律区 $S = u_\tau/(\kappa y) = 0.270/(0.41\times0.005) = 131.9\,\mathrm{s^{-1}}$，于是 $P_k = 6.65\times10^{-4}\times131.9^{2} = 11.56\,\mathrm{W/m^3}$，而 $\rho\varepsilon = 1.2\times9.64 = 11.57\,\mathrm{W/m^3}$，比值 1.00。这个恒等式是对数律区的必然结果，可以当作后处理脚本的自检项。

真正需要警惕的是另一端的过冲：在驻点、钝体前缘和突扩台阶后的回流滞留区，$P_k/(\rho\varepsilon)$ 可以超过 20，使 $k$ 出现非物理峰值并抬高整个下游的 $\mu_t$。经验阈值是：内流与附着流中该比值应低于 10；超过 20 的区域必须逐一列出位置并说明原因。若这些位置恰好是关注区域，就需要改用带产生项限制的变体或 SST。

## 4 与摩擦关联式反算压降的定量对照

积分量的对照最直接。同一摩擦因子给出单位长度压降

$$\frac{\Delta p}{L} = \frac{f\rho U^{2}}{2D} = \frac{0.0234\times1.2\times25}{0.2} = 3.51\,\mathrm{Pa/m}$$

仿真结果应落在该值的 ±5% 内（$3.33\sim3.69\,\mathrm{Pa/m}$）。若偏差超过 10%，按下面的顺序定位：先看首层 y+ 是否落在 30~300；再看对数律区中段的 $k$、$\varepsilon$ 是否接近第 1 节的平衡值；最后检查流向网格是否足以描述壁面切应力的展向分布。

同时应报告湍流强度场 $Tu = \sqrt{2k/3}/U$：入口按 5% 给定，内流核心通常升到 5%~10%，若某区域出现 $Tu > 30\%$，几乎总是产生项过冲或入口 $\varepsilon$ 偏小的结果。

## 5 诊断脚本与阈值表

```python
import numpy as np
rho, nu, U, D, kappa, Cmu = 1.2, 1.5e-5, 5.0, 0.1, 0.41, 0.09
Re = U * D / nu
f  = 0.316 * Re ** -0.25
u_tau = U * (f / 8) ** 0.5
print(f"Re={Re:.0f} f={f:.5f} u_tau={u_tau:.4f} m/s dp/L={f*rho*U**2/(2*D):.3f} Pa/m")

def check_log_layer(y, k, eps, S):
    mu_t_mix = rho * kappa * u_tau * y
    mu_t_ke  = rho * Cmu * k ** 2 / eps
    print(f"y={y*1e3:.1f}mm  mu_t/rho(nu)={mu_t_ke/(rho*nu):.1f}"
          f"  ratio_mix_ke={mu_t_mix/mu_t_ke:.3f}"
          f"  Pk/rho_eps={mu_t_ke*S**2/(rho*eps):.3f}")

check_log_layer(0.005, 0.244, 9.64, 131.9)   # 期望 ratio=1.000, Pk/rho_eps=1.00
```

阈值汇总如下，全部以本算例的手算值为基准。

| 诊断量 | 期望区间 | 越界含义 |
|---|---|---|
| 对数律区 $k$ | $0.24\,\mathrm{m^2/s^2}$ 附近 ±30% | 入口 $k$ 或壁面 $k$ 边界类型错误 |
| 对数律区 $\varepsilon$ | 与 $u_\tau^{3}/(\kappa y)$ 相差 ±30% | 长度尺度或壁函数常数口径不一致 |
| $\mu_t/\mu$（核心） | 30~300 | 低于 10 湍流被抑制，高于 $10^{3}$ 长度尺度过大 |
| $P_k/(\rho\varepsilon)$ | 附着流 < 10 | 超过 20 为产生项过冲，需列出位置 |
| 单位长度压降 | $3.33\sim3.69\,\mathrm{Pa/m}$ | 超出 ±10% 说明近壁或离散有问题 |

## 6 场量异常的诊断路径

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 残差平稳但压降比关联式低 12% | 首层 y+ 落在缓冲层，壁函数对数律外推失效 | 打印壁面 y+ 分布，只把首层调到 y+≈50 重算 |
| 对数律区 $k$ 与 $\varepsilon$ 同时偏低 3 倍 | 入口 $l$ 取得过大，$\varepsilon$ 被压低而 $\mu_t$ 抬高 | 用 $u_\tau^{3}/(\kappa y)$ 反算期望 $\varepsilon$ 并对比入口值 |
| 钝体前缘 $k$ 出现尖峰且下游 $\mu_t/\mu > 10^{3}$ | 停滞区 $P_k/(\rho\varepsilon)$ 过冲，标准模型无产生项限制 | 输出 $P_k/(\rho\varepsilon)$ 场，标出超过 20 的区域占比 |
| 双路 $\mu_t$ 相差 2 倍 | 混合长度关系不成立，说明该处不在对数律区 | 把采样点沿法向移到对数律区中段后重算比值 |
| 迭代后期 $\varepsilon$ 出现负值 | 源汇项量级接近且限幅未设 | 检查 `epsilonMin` 设置，并降低 $\varepsilon$ 的欠松弛因子 |

## 7 文献与判据出处

1. Speziale C. G., "On nonlinear K-l and K-ε models of turbulence," *Journal of Fluid Mechanics*, 1987.
2. Patel V. C., Rodi W., Scheuerer G., "Turbulence models for near-wall and low Reynolds number flows: A review," *AIAA Journal*, 1985.
3. Moser R. D., Kim J., Mansour N. N., "Direct numerical simulation of turbulent channel flow up to $Re_\tau = 590$," *Physics of Fluids*, 1999.
4. Yakhot V., Orszag S. A., "Renormalization group analysis of turbulence I. Basic theory," *Journal of Scientific Computing*, 1986.
