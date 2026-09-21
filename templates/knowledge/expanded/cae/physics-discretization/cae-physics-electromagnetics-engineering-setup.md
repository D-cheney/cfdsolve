---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-electromagnetics-engineering-setup
title: "Maxwell 电磁场：工程设置与参数选择"
summary: "给出介质中导波波长的网格换算、波导端口与截止频率设置、PML 电导率上限公式与层厚取值、FDTD 步长与内存预算、常用材料损耗参数表，并附可复算的 Python 设置脚本。"
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
  - "Maxwell 电磁场"
  - "工程设置与参数选择"
  - "波导端口"
  - "完美匹配层"
seo:
  title: "Maxwell 电磁场：工程设置与参数选择"
  description: "给出介质中导波波长的网格换算、波导端口与截止频率设置、PML 电导率上限公式与层厚取值、FDTD 步长与内存预算、常用材料损耗参数表，并附可复算的 Python 设置脚本。"
  keywords:
    - "Maxwell 方程"
    - "工程设置与参数选择"
    - "波导端口"
    - "完美匹配层"
    - "FDTD 步长"
---

# Maxwell 电磁场：工程设置与参数选择

电磁模型的设置顺序是「介质 → 波长 → 网格 → 端口与 PML → 步长与求解器」。把真空波长当作网格尺度依据是最高频的错误来源：同一频率下 FR-4 内的波长只有空气中的 $48\%$，按真空波长定的网格在介质里只有约 5 个单元/波长。

## 介质中导波波长决定单元尺寸

设介质相对介电常数 $\epsilon_r$、相对磁导率 $\mu_r$，工作频率 $f$，则

$$
\lambda_g=\frac{c_0}{f\sqrt{\epsilon_r\mu_r}},
\qquad
h\le\frac{\lambda_g}{N_\lambda},
\qquad
\eta=\frac{376.73\,\Omega}{\sqrt{\epsilon_r/\mu_r}}.
$$

$N_\lambda$ 一般取 $10\sim20$：$10$ 对应约 $1\%$ 量级的相速误差，$20$ 对应 $0.2\%$ 以下。真空与三种常用介质在 $2.4\,\mathrm{GHz}$ 与 $10\,\mathrm{GHz}$ 下的取值：

| 介质 | $\epsilon_r$ | $f$ / GHz | $\lambda_g$ / mm | $h$ / mm（$N_\lambda=10$） | $\eta$ / $\Omega$ |
|---|---|---|---|---|---|
| 空气 | 1.00 | 2.4 | 124.9 | 12.49 | 376.7 |
| FR-4 | 4.30 | 2.4 | 60.2 | 6.02 | 181.7 |
| Rogers RO4003C | 3.55 | 10.0 | 15.9 | 1.59 | 199.9 |
| 氧化铝陶瓷 | 9.80 | 10.0 | 9.6 | 0.96 | 120.3 |

同一块 FR-4 板上，$2.4\,\mathrm{GHz}$ 的 $h=6.02\,\mathrm{mm}$ 到 $10\,\mathrm{GHz}$ 必须缩到 $1.45\,\mathrm{mm}$（$\lambda_g=14.46\,\mathrm{mm}$），宽带仿真必须按最高频率定尺。

## 波导端口与截止频率

矩形波导（宽 $a$、高 $b$）的截止频率与波阻抗为

$$
f_{c,mn}=\frac{c_0}{2}\sqrt{\Big(\frac{m}{a}\Big)^2+\Big(\frac{n}{b}\Big)^2},
\qquad
Z_{\mathrm{TE}}=\frac{\eta_0}{\sqrt{1-(f_c/f)^2}}.
$$

WR-90（$a=22.86\,\mathrm{mm}$、$b=10.16\,\mathrm{mm}$）的 TE10 截止频率为 $6.557\,\mathrm{GHz}$，TE20 为 $13.114\,\mathrm{GHz}$，TE01 为 $14.754\,\mathrm{GHz}$，单模工作区为 $6.56\sim13.11\,\mathrm{GHz}$。取 $f=10\,\mathrm{GHz}$，则 $\beta=\sqrt{k^2-(\pi/a)^2}=\sqrt{209.4^2-137.4^2}=158.0\,\mathrm{rad/m}$，$\lambda_g=39.76\,\mathrm{mm}$，$Z_{\mathrm{TE}}=499.3\,\Omega$。

设置要点：端口必须放在离不连续结构至少 $\lambda_g/2$ 处（$10\,\mathrm{GHz}$ 下即 $19.9\,\mathrm{mm}$），否则高阶凋落模污染 $S$ 参数；波导端口需给出模式编号与功率归一化方式，集总端口给 $50\,\Omega$ 参考阻抗。

## PML 的层厚与电导率上限

各向异性 PML 等效于在层内引入渐变损耗，最大电导率取

$$
\sigma_{\max}=-\frac{(m+1)\ln R_0}{2\eta L},
$$

$\sigma$ 单位为 $\mathrm{S/m}$，$L$ 为层厚，$m$ 为幂律指数，$R_0$ 为设计法向反射系数。取 $R_0=10^{-6}$、$m=3$、FR-4 内 $\eta=181.7\,\Omega$、层厚 $L=8\times6.02\,\mathrm{mm}=48.2\,\mathrm{mm}$，得 $\sigma_{\max}=3.16\,\mathrm{S/m}$；若层厚减到 $4$ 个单元（$24.1\,\mathrm{mm}$），$\sigma_{\max}$ 升到 $6.31\,\mathrm{S/m}$。工程取值：层厚 $8\sim16$ 个单元，$m=2\sim3$，目标 $R_0=10^{-5}\sim10^{-6}$，并在模型外用探针实测反射，要求低于 $-40\,\mathrm{dB}$。

## 时域步长与内存预算

均匀网格下 FDTD 的稳定条件为 $c_0\Delta t\le h/\sqrt{3}$。沿用 WR-90 的 $h=3.98\,\mathrm{mm}$（$\lambda_g/10$）得 $\Delta t\le7.66\times10^{-12}\,\mathrm{s}$，取 $0.95$ 倍为 $7.28\,\mathrm{ps}$。仿真 $10\,\mathrm{ns}$ 需要 $N_t=1374$ 步。内存估算：$10^{6}$ 个网格点、每个点存 6 个场分量、双精度 $8$ 字节，共 $48\,\mathrm{MB}$；若改用单精度可降到 $24\,\mathrm{MB}$，但长时积分的舍入误差会累积，能量漂移可能超过 $10^{-3}$。非均匀网格中步长由最细单元决定，宜用亚网格替代整体加密。记录字段：$f$、$\epsilon_r$、$\tan\delta$、$\lambda_g$、$h$、$N_\lambda$、端口类型与参考阻抗、PML 的 $L$/$m$/$R_0$/$\sigma_{\max}$、$\Delta t$、$N_t$。

## 材料与损耗参数

有耗介质用 $\epsilon=\epsilon_r\epsilon_0(1-i\tan\delta)$ 表示；FR-4 的 $\tan\delta=0.020$、Rogers RO4003C 为 $0.0027$，铜的 $\sigma=5.8\times10^{7}\,\mathrm{S/m}$、铝为 $3.5\times10^{7}\,\mathrm{S/m}$。FR-4 的损耗对应每波长衰减 $0.55\,\mathrm{dB}$，长走线必须换低损耗板材。铜在 $10\,\mathrm{GHz}$ 的趋肤深度 $0.66\,\mu\mathrm{m}$ 远小于铜箔厚度 $17\,\mu\mathrm{m}$，铜箔可按理想导体处理。

## 求解器与扫频设置

- 频域有限元：自由度 $10^{6}$ 以下用稀疏直接法（MUMPS、PARDISO），更大规模用 FGMRES 配 AMG；系统条件数约按 $(kh)^{-2}$ 增长。
- 扫频：自适应采样优于等步长，先在粗网格上定位谐振点，再在 $\pm5\%$ 带宽内加密；每个频点的解可作下一频点初值。
- 时域：一次宽频激励即可覆盖全带，但总步数 $N_t$ 至少覆盖 $3Q$ 个周期，否则谐振未充分建立。

## 单因素对照与记录字段

| 对照项 | 固定量 | 变化量 | 观测量 |
|---|---|---|---|
| 每波长单元数 | 频率、介质、端口 | $N_\lambda=10,15,20$ | 端口传播常数与 $\beta=158.0\,\mathrm{rad/m}$ 的偏差 |
| PML 层厚 | $m$、$R_0$ | $L=4,8,16$ 个单元 | 模型外探针实测反射系数 |
| PML 幂律 | $L$、$R_0$ | $m=1,2,3,4$ | 斜入射反射与层内场幅值曲线 |
| 时间步长 | 网格 | $\Delta t/\Delta t_{\max}=0.5,0.8,0.95$ | 总能量漂移与谐振峰频率 |

## 常见设置错误的判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 介质内相速偏高约 $2\%$ | 网格按真空波长取，介质内仅约 5 个单元/波长 | 用 $\lambda_g$ 重算 $h$，观察相速是否回到理论值 |
| 端口处出现驻波、$S_{11}$ 周期性起伏 | 端口离不连续结构小于 $\lambda_g/2$ | 把端口外移 $\lambda_g/2$，看起伏是否消失 |
| 反射系数在斜入射时高于 $-20\,\mathrm{dB}$ | PML 层太薄或幂律太陡 | 层厚从 4 个单元增到 16 个，比较反射曲线 |
| 谐振峰频率随 $\Delta t$ 变化 | 时间步接近 CFL 上限，色散误差偏大 | 把 $\Delta t$ 降到上限的 $0.5$ 倍重跑 |
| 导体损耗比实测低一个数量级 | 未解析表层且未施加表面阻抗 | 核对 $h$ 与 $\delta/3$，$10\,\mathrm{GHz}$ 下 $\delta=0.66\,\mu\mathrm{m}$ |

## 可复算的设置脚本

```python
import math
c0, eta0, a, f = 2.99792458e8, 376.730313, 22.86e-3, 10e9
fc, k = c0/(2*a), 2*math.pi*f/c0
lg = 2*math.pi/math.sqrt(k*k - (math.pi/a)**2)
h  = lg/10
print(f"fc={fc/1e9:.3f}GHz lam_g={lg*1e3:.2f}mm h={h*1e3:.2f}mm "
      f"Zte={eta0/math.sqrt(1-(fc/f)**2):.1f}ohm dt={h/c0/math.sqrt(3)*1e12:.2f}ps")
# fc=6.557GHz lam_g=39.76mm h=3.98mm Zte=499.3ohm dt=7.66ps
```

## 参考文献

1. Taflove, A. & Hagness, S. C. *Computational Electrodynamics: The Finite-Difference Time-Domain Method*. 3rd ed., Artech House, 2005.
2. Jin, J.-M. *The Finite Element Method in Electromagnetics*. 3rd ed., Wiley, 2014.
3. Pozar, D. M. *Microwave Engineering*. 4th ed., Wiley, 2012.
4. Berenger, J.-P. A perfectly matched layer for the absorption of electromagnetic waves. *Journal of Computational Physics*, 114(2): 185-200, 1994.
5. Gedney, S. D. An anisotropic perfectly matched layer-absorbing medium for the truncation of FDTD lattices. *IEEE Transactions on Antennas and Propagation*, 44(12): 1630-1639, 1996.