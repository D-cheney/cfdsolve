---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-electromagnetics-modeling
title: "Maxwell 电磁场：离散原理与适用范围"
summary: "从旋度旋度方程出发说明 H(curl) 棱边元的自由度配置与离散 de Rham 序列，解释标量节点元产生非物理模态的机理，给出 FDTD 的 CFL 条件、准静态退化判据与趋肤深度对网格的约束。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 进阶
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "Maxwell 电磁场"
  - "离散原理与适用范围"
  - "H(curl) 棱边元"
  - "伪模态"
seo:
  title: "Maxwell 电磁场：离散原理与适用范围"
  description: "从旋度旋度方程出发说明 H(curl) 棱边元的自由度配置与离散 de Rham 序列，解释标量节点元产生非物理模态的机理，给出 FDTD 的 CFL 条件、准静态退化判据与趋肤深度对网格的约束。"
  keywords:
    - "Maxwell 方程"
    - "离散原理与适用范围"
    - "H(curl) 棱边元"
    - "伪模态"
    - "CFL 条件"
---

# Maxwell 电磁场：离散原理与适用范围

全波电磁问题的精度瓶颈通常不是求解器，而是电场被放进哪个函数空间。电场只在切向跨单元连续，其自然空间是 $H(\mathrm{curl})$，用标量节点元按分量插值会破坏这一结构，让非物理模态出现在物理频段内。本文从旋度旋度方程出发，说明棱边元的自由度配置、离散 de Rham 序列如何把伪模态压到零频，以及 CFL、准静态退化与趋肤深度三条尺度判据的适用边界。

## 从一阶方程到旋度旋度方程

线性介质中的 Maxwell 方程组为

$$
\nabla\times E=-\frac{\partial B}{\partial t},
\qquad
\nabla\times H=J+\sigma E+\frac{\partial D}{\partial t},
\qquad
B=\mu H,\quad D=\epsilon E.
$$

采用 $e^{-i\omega t}$ 约定（$\partial_t\to-i\omega$），由 Faraday 定律得 $H=-\frac{i}{\omega\mu}\nabla\times E$，代入 Ampère 定律后得到电场形式

$$
\nabla\times\big(\mu^{-1}\nabla\times E\big)-\omega^2\epsilon E-i\omega\sigma E=i\omega J.
$$

注意时间谐波约定会翻转损耗项的虚部符号：若改用 $e^{+i\omega t}$，左端第三项变成 $+i\omega\sigma E$。报告必须写明采用哪一种，否则把损耗算成增益的符号错误无法被发现。左端 $-i\omega\sigma E$ 与 $\omega^2\epsilon E$ 的比值 $\sigma/(\omega\epsilon)$ 是判断能否忽略位移电流的依据：铜在 $1\,\mathrm{MHz}$ 下 $\sigma=5.8\times10^{7}\,\mathrm{S/m}$、$\omega\epsilon=6.283\times10^{6}\times8.854\times10^{-12}=5.56\times10^{-5}\,\mathrm{S/m}$，比值达 $1.04\times10^{12}$，位移电流完全可以忽略，方程退化为涡流形式。

## H(curl) 空间与棱边自由度

电场的自然空间要求切向分量跨单元连续，对应的弱式为

$$
\big(\mu^{-1}\nabla\times E,\nabla\times F\big)-\omega^2\big(\epsilon E,F\big)
-i\omega\big(\sigma E,F\big)=i\omega\big(J,F\big)+\text{边界项}.
$$

Nédélec 棱边元把自由度定义在棱边的切向线积分 $\int_e E\cdot t\,dl$ 上。一个四面体的自由度配置：一阶标量节点元 4 个，一阶棱边元 6 个（每棱 1 个），二阶棱边元 20 个（每棱 2 个共 12 个，每面 2 个共 8 个）。棱边元只共享切向分量，天然满足 $H(\mathrm{curl})$ 的连续性要求；同时它与节点元、面元一起构成离散 de Rham 复形

$$
H^1\xrightarrow{\ \nabla\ }H(\mathrm{curl})\xrightarrow{\ \nabla\times\ }H(\mathrm{div})\xrightarrow{\ \nabla\cdot\ }L^2,
$$

离散后该序列的交换性成立，这是棱边元不产生伪模态的根本原因。

## 节点元为什么产生非物理模态

把电场三个分量各自用标量节点基插值，得到的离散空间不满足切向连续。更严重的是它的旋度零空间被污染：对特征问题 $\nabla\times(\mu^{-1}\nabla\times E)=\omega^2\epsilon E$，梯度场 $\nabla\phi$ 本应全部落在 $\omega=0$ 的零空间里，棱边元能做到这一点；节点元则会造出 $\omega>0$ 的伪解，表现为场图上出现无物理意义的尖峰，或在波导截止频率以下出现不该存在的传播模态。判定方法很简单：统计求解得到的模态中 $\omega$ 小于最低物理模态的频率个数，棱边元应恰为 $1$（对应 $\omega=0$），节点元通常远大于 $1$。若必须使用节点元（例如耦合静电势），应改用混合格式并对零空间做显式投影。

## FDTD 的 CFL 条件与色散

Yee 交错网格上 $E$、$H$ 在时间与空间上错开半格，离散旋度自动满足 $\nabla_h\cdot(\nabla_h\times\cdot)=0$，散度约束被天然维持。三维稳定条件为

$$
\Delta t\le\frac{1}{c\sqrt{\Delta x^{-2}+\Delta y^{-2}+\Delta z^{-2}}},
\qquad
c=\frac{1}{\sqrt{\mu\epsilon}};
$$

均匀网格下简化为 $c\Delta t\le h/\sqrt{3}$。取 $2.4\,\mathrm{GHz}$、FR-4（$\epsilon_r=4.3$）为例：$\lambda_0=125\,\mathrm{mm}$，介质中 $\lambda_g=125/\sqrt{4.3}=60.3\,\mathrm{mm}$，按每波长 10 个单元取 $h=6.03\,\mathrm{mm}$，则 $\Delta t\le6.03\times10^{-3}/(3\times10^{8}\times1.732)=1.16\times10^{-11}\,\mathrm{s}$。工程上取上限的 $0.95$ 倍，即 $11.0\,\mathrm{ps}$。网格必须按局部波长取：折射率高的介质内波长更短，用真空波长定网格会低估单元数。

## 趋肤深度对网格的约束

导体中的场按 $\delta=\sqrt{2/(\omega\mu\sigma)}$ 指数衰减。铜（$\sigma=5.8\times10^{7}\,\mathrm{S/m}$、$\mu_0=1.2566\times10^{-6}\,\mathrm{H/m}$）的趋肤深度为：$50\,\mathrm{Hz}$ 时 $9.35\,\mathrm{mm}$，$1\,\mathrm{MHz}$ 时 $66.1\,\mu\mathrm{m}$，$2.4\,\mathrm{GHz}$ 时 $1.35\,\mu\mathrm{m}$。这条数据直接决定建模方式：若结构尺度远大于 $\delta$，表层无需剖分，改用表面阻抗边界 $Z_s=(1+i)/(\sigma\delta)$ 即可；若必须解析表层，网格尺寸要小于 $\delta/3$，即 $1\,\mathrm{MHz}$ 下需要 $22\,\mu\mathrm{m}$ 量级的单元，三维剖分规模会迅速失控。

```python
import math
mu0, sig = 4*math.pi*1e-7, 5.8e7          # 铜
for f in (50.0, 1e6, 2.4e9):
    d = math.sqrt(2.0/(2*math.pi*f*mu0*sig))
    print(f"{f:9.1e} Hz  delta={d*1e6:9.2f} um  h_max={d/3*1e6:8.2f} um")
# 5.0e+01 Hz  delta=  9351.10 um  h_max= 3117.03 um
# 1.0e+06 Hz  delta=    66.09 um  h_max=   22.03 um
# 2.4e+09 Hz  delta=     1.35 um  h_max=    0.45 um
```

## 失效信号与判据

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 波导截止频率以下出现传播模态 | 标量节点元破坏切向连续，旋度零空间被污染 | 统计 $\omega$ 低于最低物理模态的模态个数，棱边元应为 $1$ |
| 时域推进若干步后场值指数发散 | 步长超过 Courant 上限 $h/(c\sqrt{3})$ | 步长减半重跑，恢复稳定即确认为稳定性越界 |
| 曲面导体上出现非物理反射 | 直角网格阶梯逼近，界面 $\epsilon$、$\mu$ 未做共形处理 | 用同一几何的两套网格比较 $S_{11}$ 相位 |
| 高频损耗被严重低估 | 未解析表层又未施加表面阻抗 | 核对 $h$ 与 $\delta/3$ 的大小关系 |
| 频域虚部符号与实测相反 | 时间谐波约定为 $e^{+i\omega t}$ 而按 $e^{-i\omega t}$ 解读 | 检查 $i\omega\sigma E$ 项的符号与报告声明是否一致 |
| 沿对角线传播的脉冲尾部振荡 | Yee 格式的数值各向异性，每波长单元数不足 | 把单元数从 10 增到 20，看尾部是否衰减 |

## 量级估算与模型选择

判断能否降维的标准是特征尺度与波长的比值：结构最大尺寸 $D$ 满足 $D\ll\lambda/10$ 时可忽略位移电流，用涡流或静场模型；$D\sim\lambda$ 必须做全波求解。以 $50\,\mathrm{Hz}$ 电力设备为例，$\lambda=6000\,\mathrm{km}$，$D=1\,\mathrm{m}$ 对应 $D/\lambda=1.7\times10^{-7}$，涡流模型完全够用；而 $2.4\,\mathrm{GHz}$ 的手机天线 $D=60\,\mathrm{mm}$ 对应 $D/\lambda=0.48$，必须全波。真空波阻抗 $\eta_0=376.73\,\Omega$，介质中 $\eta=\eta_0/\sqrt{\epsilon_r}$，FR-4 内为 $181.7\,\Omega$，这是端口归一化的基准值。

## 参考文献

1. Jin, J.-M. *The Finite Element Method in Electromagnetics*. 3rd ed., Wiley, 2014.
2. Monk, P. *Finite Element Methods for Maxwell's Equations*. Oxford University Press, 2003.
3. Nédélec, J.-C. Mixed finite elements in $\mathbb{R}^3$. *Numerische Mathematik*, 35(3): 315-341, 1980.
4. Taflove, A. & Hagness, S. C. *Computational Electrodynamics: The Finite-Difference Time-Domain Method*. 3rd ed., Artech House, 2005.
5. Boffi, D. Finite element approximation of eigenvalue problems. *Acta Numerica*, 19: 1-120, 2010.
6. Berenger, J.-P. A perfectly matched layer for the absorption of electromagnetic waves. *Journal of Computational Physics*, 114(2): 185-200, 1994.
