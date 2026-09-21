---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-acoustics-modeling
title: "声学 Helmholtz 与波动方程：离散原理与适用范围"
summary: "给出线性与高阶单元的离散色散关系、相位误差与污染误差的量级判据，说明每波长单元数门槛、吸收边界的角度极限与边界元内共振非唯一性，并附一组可由频率直接换算的网格尺寸。"
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
  - "声学 Helmholtz 与波动方程"
  - "离散原理与适用范围"
  - "数值色散"
  - "污染误差"
seo:
  title: "声学 Helmholtz 与波动方程：离散原理与适用范围"
  description: "给出线性与高阶单元的离散色散关系、相位误差与污染误差的量级判据，说明每波长单元数门槛、吸收边界的角度极限与边界元内共振非唯一性，并附一组可由频率直接换算的网格尺寸。"
  keywords:
    - "Helmholtz 方程"
    - "离散原理与适用范围"
    - "数值色散"
    - "污染误差"
    - "吸收边界条件"
---

# 声学 Helmholtz 与波动方程：离散原理与适用范围

Helmholtz 方程的适用链条很短：介质静止、无黏无热传导、扰动为等熵小量，缺一条就得退回线化 Euler。在这个链条内，工程误差的主控项通常不是求解器残差，而是网格对波长的解析能力——低阶单元在 $kh>1$ 时累积的相位滞后会直接把共振峰推偏。本文给出离散色散关系、相位与污染误差判据、吸收边界角度极限与边界元非唯一性机理。

## 线化假设与方程的成立条件

把声压与密度写成均值加扰动 $p=p_0+p'$、$\rho=\rho_0+\rho'$，速度扰动记为 $v'$，忽略二阶小量并消去 $v'$、$\rho'$ 后得到时域波动方程与频域 Helmholtz 方程

$$
\frac{1}{c^2}\frac{\partial^2 p'}{\partial t^2}-\nabla^2 p'=0,
\qquad
\nabla^2 \hat p + k^2 \hat p = 0,\quad k=\frac{2\pi f}{c}.
$$

$k$ 为波数（$\mathrm{rad/m}$），$c$ 为声速。丢弃对流项意味着存在平均流时该式失效，必须改用对流波动方程或线化 Euler；丢弃黏性与热传导意味着边界层内的高频耗散无法由本式给出。

量级估算：空气在 $20\,^\circ\mathrm{C}$ 下 $\rho_0=1.204\,\mathrm{kg/m^3}$、$c=343\,\mathrm{m/s}$，特性阻抗 $Z_0=\rho_0 c=413\,\mathrm{Rayl}$；水在 $20\,^\circ\mathrm{C}$ 下 $\rho_0=998\,\mathrm{kg/m^3}$、$c=1480\,\mathrm{m/s}$，$Z_0=1.477\times10^{6}\,\mathrm{Rayl}$，两者相差约 $3576$ 倍，边界阻抗取值不能互相套用。

## 线性单元的离散色散关系

均匀网格上采用一致质量矩阵的 P1 单元，把节点解 $u_j=e^{i k_h j h}$ 代入刚度与质量矩阵的差分形式，可得精确的离散色散关系

$$
\cos(k_h h)=\frac{6-2(kh)^2}{6+(kh)^2},
$$

其中 $k_h$ 是数值波数。对小 $kh$ 展开得

$$
\frac{k_h-k}{k}=-\frac{(kh)^2}{24}+O\big((kh)^4\big),
$$

负号说明数值波数偏小，即相速偏低、相位滞后。把相位误差按每波长累积后，控制相对相位误差不超过 $\eta$ 的条件是

$$
kh \le \sqrt{24\eta},
\qquad
N_\lambda=\frac{2\pi}{kh}\ge \frac{2\pi}{\sqrt{24\eta}}.
$$

取 $\eta=0.05$ 得 $kh\le1.095$、$N_\lambda\ge5.74$，即常说的「每波长 6 个单元」；取 $\eta=0.01$ 得 $kh\le0.49$、$N_\lambda\ge12.8$。6 单元/波长对应 $5\%$ 量级相位误差。p 阶单元领先项为 $O((kh)^{2p})$，故 p=2 用 2～3 单元/波长即可覆盖同样频段。

## 由频率反算网格尺寸

以空气 $c=343\,\mathrm{m/s}$、$f=1000\,\mathrm{Hz}$ 为例，$\lambda=c/f=0.343\,\mathrm{m}$，$k=18.32\,\mathrm{rad/m}$。按上式门槛逐档换算见脚本输出：$N_\lambda$ 从 6 增到 13，$h$ 从 $57.2\,\mathrm{mm}$ 降到 $26.4\,\mathrm{mm}$，相位误差从 $4.58\%$ 降到 $0.98\%$。

把同一套 $h=34.3\,\mathrm{mm}$ 的网格直接用到 $5000\,\mathrm{Hz}$，则 $k$ 变为 $91.6\,\mathrm{rad/m}$、$kh=3.14$，相对相位误差升到 $41\%$。网格必须按最高分析频率定尺：把上限频率从 $1\,\mathrm{kHz}$ 提到 $5\,\mathrm{kHz}$，在同样 $N_\lambda=8$ 下 $h$ 要从 $42.9\,\mathrm{mm}$ 缩到 $8.6\,\mathrm{mm}$，三维自由度按 $h^{-3}$ 增长约 $125$ 倍。

```python
import math
c, f = 343.0, 1000.0            # 空气, Hz
k = 2*math.pi*f/c               # 18.32 rad/m
for n in (6, 8, 10, 13):
    h = c/f/n; kh = k*h; pe = kh**2/24*100
    print(n, f"{h*1e3:.1f}mm", f"kh={kh:.3f}", f"{pe:.2f}% 相位误差")
# 6 57.2mm kh=1.048 err=4.58%    8 42.9mm kh=0.786 err=2.57%
# 10 34.3mm kh=0.628 err=1.64%   13 26.4mm kh=0.484 err=0.98%
```

## 污染误差为什么随频率三次方增长

有限元的 Helmholtz 误差估计为

$$
\|u-u_h\|_{H^1}\le C_1\,kh + C_2\,k(kh)^{2p},
$$

第一项是局部相位误差，第二项是污染误差。对 P1 单元（p=1），污染项为 $C_2 k^3h^2$：在网格固定、频率翻倍时，它增长 $8$ 倍，而局部项只增长 $2$ 倍。因此高频问题的加密策略必须与频率同步——只做一次网格无关性检查、然后在更宽频带上沿用同一网格，是声学计算中最常见的错误。

## 开放域截断与吸收边界的角度极限

一阶 Sommerfeld 条件 $\partial p/\partial n-ikp=0$ 在平面波以入射角 $\theta$ 打到截断面时的反射系数为

$$
R(\theta)=\left|\frac{1-\cos\theta}{1+\cos\theta}\right|.
$$

代入得 $\theta=0^\circ$ 时 $R=0$，$\theta=30^\circ$ 时 $R=7.2\%$（$-22.9\,\mathrm{dB}$），$\theta=45^\circ$ 时 $R=17.2\%$（$-15.3\,\mathrm{dB}$），$\theta=60^\circ$ 时 $R=33.3\%$（$-9.5\,\mathrm{dB}$）。这说明一阶条件只在近法向出射时可用；把截断球面半径取到 $r\ge 3\lambda$ 且大部分能量近法向出射，才能把反射压到 $-20\,\mathrm{dB}$ 以下。否则应改用 PML，层内复坐标拉伸使波幅按 $\exp(-\int\sigma\,ds)$ 衰减，典型层厚取 $0.25\lambda$ 以上、电导率按二次或三次幂律渐变。

## 边界元降维与内共振非唯一性

Helmholtz 基本解 $G=e^{ikr}/(4\pi r)$ 代入 Green 第二恒等式后得到边界积分方程

$$
c(\xi)\hat p(\xi)+\int_\Gamma \hat p\,\frac{\partial G}{\partial n}\,d\Gamma
=\int_\Gamma G\,\frac{\partial \hat p}{\partial n}\,d\Gamma,
$$

离散后得到 $Hp=Gq$。它只离散边界、自动满足无穷远辐射条件，但矩阵稠密：$N$ 个边界自由度需要 $N^2$ 个复数存储与 $O(N^3)$ 的 LU 分解。更隐蔽的问题是当 $k$ 恰好等于某个内域 Dirichlet 特征值（例如边长 $L=0.5\,\mathrm{m}$ 的立方体内域在 $k=n\pi/L$ 处，对应 $f=nc/(2L)=n\times343\,\mathrm{Hz}$）时，$H$、$G$ 同时奇异，解不唯一。Burton–Miller 组合方程把原方程与其法向导数方程线性组合，可消除全部虚假特征频率，代价是引入超奇异积分。

## 失效信号与判据

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 共振频率整体偏低且随频率加剧 | P1 单元相位滞后 $(kh)^2/24$ | 固定 $f$ 把 $h$ 减半，观察偏移量是否按 $4$ 倍下降 |
| 高频段响应明显偏大或出现虚假峰 | 污染误差 $C_2k^3h^2$ 主导 | 频率加倍、网格同时减半，比较误差是否回到 $O(kh)$ 水平 |
| 截断面附近出现驻波条纹 | 一阶吸收条件在斜入射处反射 | 把截断半径从 $2\lambda$ 增到 $4\lambda$，看条纹是否消失 |
| 扫频在个别频点迭代发散 | 该频点接近内共振，矩阵近奇异 | 检查是否落在 $f=nc/(2L)$ 序列上，改用 Burton–Miller |

## 参考文献

1. Ihlenburg, F. *Finite Element Analysis of Acoustic Scattering*. Springer, 1998.
2. Ihlenburg, F. & Babuška, I. Dispersion analysis and error estimation of Galerkin finite element methods for the Helmholtz equation. *International Journal for Numerical Methods in Engineering*, 38(22): 3745-3774, 1995.
3. Deraemaeker, A., Babuška, I. & Bouillard, P. Dispersion and pollution of the FEM solution for the Helmholtz equation in one, two and three dimensions. *International Journal for Numerical Methods in Engineering*, 46(4): 471-499, 1999.
4. Thompson, L. L. A review of finite-element methods for time-harmonic acoustics. *Journal of the Acoustical Society of America*, 119(3): 1315-1330, 2006.
5. Burton, A. J. & Miller, G. F. The application of integral equation methods to the numerical solution of some exterior boundary-value problems. *Proceedings of the Royal Society of London A*, 323(1553): 201-210, 1971.
6. Berenger, J.-P. A perfectly matched layer for the absorption of electromagnetic waves. *Journal of Computational Physics*, 114(2): 185-200, 1994.
