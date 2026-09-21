---
template_version: flowlab-knowledge/1.0
slug: cae-physics-acoustics-modeling
title: 声学 Helmholtz 与波动方程：原理、设置与验证
summary: >-
  给出线性与高阶单元的离散色散关系、相位误差与污染误差的量级判据，说明每波长单元数门槛、吸收边界的角度极限与边界元内共振非唯一性，并附一组可由频率直接换算的网格尺寸。
category:
  slug: physics-discretization
  name: 跨物理场离散算法
level: 进阶
reading_minutes: 27
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CAE
  - 跨物理场离散算法
  - 声学 Helmholtz 与波动方程
  - 离散原理与适用范围
  - 数值色散
  - 污染误差
  - 工程设置与参数选择
  - 完美匹配层
  - 声学有限元
  - 结果诊断与可信度验证
  - 辐射阻抗
  - 网格收敛
seo:
  title: 声学 Helmholtz 与波动方程：原理、设置与验证
  description: >-
    给出线性与高阶单元的离散色散关系、相位误差与污染误差的量级判据，说明每波长单元数门槛、吸收边界的角度极限与边界元内共振非唯一性，并附一组可由频率直接换算的网格尺寸。
  keywords:
    - Helmholtz 方程
    - 离散原理与适用范围
    - 数值色散
    - 污染误差
    - 吸收边界条件
    - 工程设置与参数选择
    - 完美匹配层
    - 声学有限元
    - CFL 条件
    - 结果诊断与可信度验证
    - 辐射阻抗
    - 网格收敛
    - 声功率
---
# 声学 Helmholtz 与波动方程：原理、设置与验证

Helmholtz 方程的适用链条很短：介质静止、无黏无热传导、扰动为等熵小量，缺一条就得退回线化 Euler。在这个链条内，工程误差的主控项通常不是求解器残差，而是网格对波长的解析能力——低阶单元在 $kh>1$ 时累积的相位滞后会直接把共振峰推偏。声学模型的设置顺序是「定频率上限 → 定单元尺寸 → 定吸收层 → 定求解策略」，先划网格再补参数几乎一定返工。下面给出可直接照抄的换算流程与参数取值依据。声学结果最容易出现「云图漂亮但频率偏移」的假收敛，因此验收必须挂在解析解上，而不是挂在残差上。可用的独立基准有三类：闭域的模态频率、开域的辐射阻抗与声功率、以及远场的 $1/r$ 衰减与相位增长。

## 基础概念与控制关系

### 能量与功率守恒的附加检查

闭域无损耗时总声能应守恒：声能密度为 $E=\frac{|\hat p|^2}{4\rho c^2}+\frac{\rho|\hat v|^2}{4}$。以 $p_{\mathrm{rms}}=0.2\,\mathrm{Pa}$ 的平面波为例，声压级为 $20\log_{10}(0.2/2\times10^{-5})=80.0\,\mathrm{dB}$，声强为 $I=p_{\mathrm{rms}}^2/(\rho c)=0.04/413=9.69\times10^{-5}\,\mathrm{W/m^2}$。若施加阻抗边界，耗散功率必须等于边界上的 $\frac12\mathrm{Re}(1/Z)\int_\Gamma|\hat p|^2\,d\Gamma$，与体积内能量的下降速率之差应小于总能量的 $0.1\%$。

### 线性单元的离散色散关系

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

### 开放域截断与吸收边界的角度极限

一阶 Sommerfeld 条件 $\partial p/\partial n-ikp=0$ 在平面波以入射角 $\theta$ 打到截断面时的反射系数为

$$
R(\theta)=\left|\frac{1-\cos\theta}{1+\cos\theta}\right|.
$$

代入得 $\theta=0^\circ$ 时 $R=0$，$\theta=30^\circ$ 时 $R=7.2\%$（$-22.9\,\mathrm{dB}$），$\theta=45^\circ$ 时 $R=17.2\%$（$-15.3\,\mathrm{dB}$），$\theta=60^\circ$ 时 $R=33.3\%$（$-9.5\,\mathrm{dB}$）。这说明一阶条件只在近法向出射时可用；把截断球面半径取到 $r\ge 3\lambda$ 且大部分能量近法向出射，才能把反射压到 $-20\,\mathrm{dB}$ 以下。否则应改用 PML，层内复坐标拉伸使波幅按 $\exp(-\int\sigma\,ds)$ 衰减，典型层厚取 $0.25\lambda$ 以上、电导率按二次或三次幂律渐变。

### 边界元降维与内共振非唯一性

Helmholtz 基本解 $G=e^{ikr}/(4\pi r)$ 代入 Green 第二恒等式后得到边界积分方程

$$
c(\xi)\hat p(\xi)+\int_\Gamma \hat p\,\frac{\partial G}{\partial n}\,d\Gamma
=\int_\Gamma G\,\frac{\partial \hat p}{\partial n}\,d\Gamma,
$$

离散后得到 $Hp=Gq$。它只离散边界、自动满足无穷远辐射条件，但矩阵稠密：$N$ 个边界自由度需要 $N^2$ 个复数存储与 $O(N^3)$ 的 LU 分解。更隐蔽的问题是当 $k$ 恰好等于某个内域 Dirichlet 特征值（例如边长 $L=0.5\,\mathrm{m}$ 的立方体内域在 $k=n\pi/L$ 处，对应 $f=nc/(2L)=n\times343\,\mathrm{Hz}$）时，$H$、$G$ 同时奇异，解不唯一。Burton–Miller 组合方程把原方程与其法向导数方程线性组合，可消除全部虚假特征频率，代价是引入超奇异积分。

## 适用边界与方案选择

### 阻抗与吸声边界的取值来源

局部反应阻抗边界为 Robin 形式

$$
\frac{\partial \hat p}{\partial n}=-\frac{i\omega\rho_0}{Z}\hat p,
\qquad
R=\frac{Z-\rho_0 c}{Z+\rho_0 c},
\quad
\alpha=1-|R|^2,
$$

$Z$ 为法向比阻抗（单位 $\mathrm{Rayl}$），空气 $\rho_0 c=413\,\mathrm{Rayl}$。$Z=2\rho_0 c$ 与 $Z=0.5\rho_0 c$ 都给出 $\alpha=0.889$，$Z=\rho_0 c$ 给出 $\alpha=1$，因此吸声材料的阻抗目标是实部接近 $\rho_0 c$。玻璃棉类材料在 $500\,\mathrm{Hz}$ 以上取流阻率 $10\sim30\,\mathrm{kPa\cdot s/m^2}$、厚度 $50\,\mathrm{mm}$ 可达 $\alpha>0.85$。

### 线化假设与方程的成立条件

把声压与密度写成均值加扰动 $p=p_0+p'$、$\rho=\rho_0+\rho'$，速度扰动记为 $v'$，忽略二阶小量并消去 $v'$、$\rho'$ 后得到时域波动方程与频域 Helmholtz 方程

$$
\frac{1}{c^2}\frac{\partial^2 p'}{\partial t^2}-\nabla^2 p'=0,
\qquad
\nabla^2 \hat p + k^2 \hat p = 0,\quad k=\frac{2\pi f}{c}.
$$

$k$ 为波数（$\mathrm{rad/m}$），$c$ 为声速。丢弃对流项意味着存在平均流时该式失效，必须改用对流波动方程或线化 Euler；丢弃黏性与热传导意味着边界层内的高频耗散无法由本式给出。

量级估算：空气在 $20\,^\circ\mathrm{C}$ 下 $\rho_0=1.204\,\mathrm{kg/m^3}$、$c=343\,\mathrm{m/s}$，特性阻抗 $Z_0=\rho_0 c=413\,\mathrm{Rayl}$；水在 $20\,^\circ\mathrm{C}$ 下 $\rho_0=998\,\mathrm{kg/m^3}$、$c=1480\,\mathrm{m/s}$，$Z_0=1.477\times10^{6}\,\mathrm{Rayl}$，两者相差约 $3576$ 倍，边界阻抗取值不能互相套用。

## 工程设置与实施

### 由频率反算网格尺寸

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

### 频率上限决定网格尺度

设最高分析频率 $f_{\max}$、声速 $c$、每波长单元数下限 $N_\lambda$，单元特征尺寸上限为

$$
h \le \frac{c}{f_{\max}N_\lambda},
\qquad
N_\lambda=\frac{c}{f\,h}.
$$

$N_\lambda$ 与相位误差的换算关系是 $N_\lambda\ge 2\pi/\sqrt{24\eta}$：$N_\lambda=6$ 对应 $5\%$ 相位误差，$10$ 对应 $1.6\%$，$13$ 对应 $1.0\%$。把 $N_\lambda$ 与目标精度挂钩，而不是一律取 6。

取车厢工况的 $h=8\,\mathrm{mm}$ 复核：$k=2\pi f/c=91.6\,\mathrm{rad/m}$，$kh=0.733$，相位误差 $(kh)^2/24=2.24\%$，实际 $N_\lambda=343/(5000\times0.008)=8.58$。把同一网格用到 $10\,\mathrm{kHz}$，$kh$ 升到 $1.466$、误差升到 $8.96\%$，此时 $h$ 必须减到 $4\,\mathrm{mm}$。

| 工况 | 介质 | $c$ / (m/s) | $f_{\max}$ / Hz | $\lambda$ / mm | $N_\lambda$ | $h$ / mm |
|---|---|---|---|---|---|---|
| 车厢空腔 NVH | 空气 | 343 | 5000 | 68.6 | 10 | 6.86 |
| 消声器传递损失 | 空气 | 343 | 2000 | 171.5 | 8 | 21.4 |
| 水下声呐基阵 | 海水 | 1480 | 50000 | 29.6 | 8 | 3.70 |

### 可复算的换算脚本

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

### 时域推进的步长与采样约束

显式时域格式的三维稳定条件为

$$
\Delta t \le \frac{h}{c\sqrt{3}}.
$$

空气 $c=343\,\mathrm{m/s}$、$h=8\,\mathrm{mm}$ 时 $\Delta t\le1.35\times10^{-5}\,\mathrm{s}$，对应采样率 $74.2\,\mathrm{kHz}$，对 $5\,\mathrm{kHz}$ 上限有 $14.8$ 倍余量。若 $h$ 缩到 $2\,\mathrm{mm}$，$\Delta t\le3.37\times10^{-6}\,\mathrm{s}$，采样率 $297\,\mathrm{kHz}$，$20\,\mathrm{ms}$ 物理时间需 $5930$ 步。取上限一半时每周期约 $30$ 个采样点，数值色散可忽略。

### 吸收层的层厚与电导率上限

PML 层内最大阻尼取

$$
\sigma_{\max}=-\frac{(m+1)\ln R_0}{2L},
$$

$\sigma$ 单位为 $\mathrm{m^{-1}}$，$m$ 为幂律指数，$L$ 为层厚，$R_0$ 为设计法向反射系数，层内往返衰减等于 $-\ln R_0$ 奈培。取 $R_0=10^{-6}$、$m=3$、$L=0.25\lambda$：$1\,\mathrm{kHz}$ 空气下 $\sigma_{\max}=322\,\mathrm{m^{-1}}$、往返衰减 $13.8\,\mathrm{Np}$（$-120\,\mathrm{dB}$）；放宽到 $R_0=10^{-4}$ 时 $\sigma_{\max}=215\,\mathrm{m^{-1}}$（$-80\,\mathrm{dB}$），层厚可减到 $0.15\lambda$。层厚下限建议不低于 $0.1\lambda$ 且层内至少 8 层单元。

### 求解设置与扫频策略

- 求解器：自由度 $10^{5}$ 以下用稀疏直接法；更大规模用移位 GMRES 配 AMG 预条件，移位量取 $0.9k^2$ 可避开实轴附近的近奇异。
- 扫频步长：半功率带宽 $\Delta f_{3\mathrm{dB}}=f_n/Q$。阻尼比 $\zeta=0.02$ 时 $Q\approx1/(2\zeta)=25$，$f_1=343\,\mathrm{Hz}$ 对应带宽 $13.7\,\mathrm{Hz}$，步长应取 $2.7\,\mathrm{Hz}$ 以下。
- 热启动：相邻频点复用上一步解，迭代次数可从 $200$ 降到 $30\sim50$。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 共振频率整体偏低且随频率加剧 | P1 单元相位滞后 $(kh)^2/24$ | 固定 $f$ 把 $h$ 减半，观察偏移量是否按 $4$ 倍下降 |
| 高频段响应明显偏大或出现虚假峰 | 污染误差 $C_2k^3h^2$ 主导 | 频率加倍、网格同时减半，比较误差是否回到 $O(kh)$ 水平 |
| 截断面附近出现驻波条纹 | 一阶吸收条件在斜入射处反射 | 把截断半径从 $2\lambda$ 增到 $4\lambda$，看条纹是否消失 |
| 扫频在个别频点迭代发散 | 该频点接近内共振，矩阵近奇异 | 检查是否落在 $f=nc/(2L)$ 序列上，改用 Burton–Miller |
| 高频段共振频率成比例偏低 | 网格按中心频率而非 $f_{\max}$ 定尺 | 按 $N_\lambda=c/(f_{\max}h)$ 重算，$5\,\mathrm{kHz}$ 下 $h$ 应由 $42.9\,\mathrm{mm}$ 降到 $8.6\,\mathrm{mm}$ |
| 截断面附近出现驻波条纹 | 吸收层太薄或幂律太陡 | 层厚由 $0.1\lambda$ 增到 $0.25\lambda$，看条纹是否消失 |
| 峰值频率随扫频步长跳动 | 步长粗于半功率带宽 | $\zeta=0.02$ 时 $Q=25$，$f_1=343\,\mathrm{Hz}$ 对应带宽 $13.7\,\mathrm{Hz}$，步长应低于 $2.7\,\mathrm{Hz}$ |
| 迭代在共振峰处不收敛 | 矩阵在 $k^2$ 接近特征值时近奇异 | 移位量改取 $0.9k^2$ 并启用热启动 |
| 声压级比实测高 $26\,\mathrm{dB}$ | 参考声压口径用错 | 用 $20\log_{10}(20/1)=26.0\,\mathrm{dB}$ 核对，空气应取 $20\,\mu\mathrm{Pa}$ |
| 时域推进若干步后发散 | $\Delta t$ 超过 $h/(c\sqrt{3})$ | 把 $\Delta t$ 减半，若恢复稳定即为 CFL 超限 |
| 一阶模态比 $c/(2L)$ 低 $3\%$，网格减半后降到 $0.8\%$ | 线性单元相位滞后 $(kh)^2/24$ | 固定频率加密网格，检查误差是否按 $4$ 倍下降 |
| 共振峰幅值随网格加密单调上升 | 边界无损耗，峰值由离散误差而非物理阻尼决定 | 给边界加 $\zeta=0.02$ 的阻抗，看峰值是否收敛到有限值 |
| 远场幅值比偏离 $0.5$ 超过 $2\%$ | 吸收层反射与直达波干涉 | 把探针半径从 $1.5\lambda$ 移到 $4\lambda$，看偏差是否消失 |
| 扫频在 $f=nc/(2L)$ 附近迭代不收敛 | 该频点矩阵近奇异 | 检查频点是否落在内域特征频率序列上 |
| 空气声压级比实验高约 $26\,\mathrm{dB}$ | 参考声压用了 $1\,\mu\mathrm{Pa}$ 而非 $20\,\mu\mathrm{Pa}$ | 按 $20\log_{10}(20)=26.0\,\mathrm{dB}$ 复核口径 |
| 同一模型两次运行的峰值频率差 $2\,\mathrm{Hz}$ | 扫频步长粗于半功率带宽 | 把步长压到 $\Delta f_{3\mathrm{dB}}/5$ 以下 |

## 验证、验收与复现

### 三类基准与各自的验收量

闭域基准检验的是体积离散与边界条件，验收量是模态频率与节点位置；开域基准检验的是辐射条件与表面积分，验收量是辐射阻抗、声功率与远场衰减指数；传播基准检验的是数值色散，验收量是相速误差。

### 网格收敛阶与外推

对模态频率做三套网格（单元数按 $2$ 倍递增）的收敛研究。设第 $i$ 套网格误差为 $e_i$，观测阶为

$$
p=\frac{\ln\!\big[(f_3-f_2)/(f_2-f_1)\big]}{\ln r},
\qquad
f_{\mathrm{ex}}=f_3+\frac{f_3-f_2}{r^{\,p}-1},
$$

其中 $r$ 为加密比。一组 $L=1.0\,\mathrm{m}$ 刚性管一阶模态的实测数据如下：

误差比稳定在 $4$，故 $p=\ln 4/\ln 2=2.00$，与线性单元在 $H^1$ 范数下的理论阶一致。Richardson 外推给出 $f_{\mathrm{ex}}=171.456+(171.456-171.325)/(4-1)=171.500\,\mathrm{Hz}$，与解析值 $171.5\,\mathrm{Hz}$ 的相对偏差为 $2\times10^{-5}$。若观测阶只有 $1.2$ 左右，通常意味着边界条件施加位置有半个单元的偏移，或网格在端面处没有对齐。

```python
import math
f = [170.800, 171.325, 171.456]        # N=50/100/200, 解析值 171.5 Hz
e = [abs(x-171.5) for x in f]
p = math.log(e[0]/e[1], 2)             # 观测收敛阶 -> 2.00
fex = f[2] + (f[2]-f[1])/(2**p - 1)    # Richardson 外推 -> 171.500
```

| 单元数 $N$ | $h$ / mm | $f_1$ / Hz | 误差 / Hz | 误差比 |
|---|---|---|---|---|
| 50 | 20.0 | 170.800 | 0.700 | — |
| 100 | 10.0 | 171.325 | 0.175 | 4.00 |
| 200 | 5.0 | 171.456 | 0.044 | 3.98 |

### 污染误差为什么随频率三次方增长

有限元的 Helmholtz 误差估计为

$$
\|u-u_h\|_{H^1}\le C_1\,kh + C_2\,k(kh)^{2p},
$$

第一项是局部相位误差，第二项是污染误差。对 P1 单元（p=1），污染项为 $C_2 k^3h^2$：在网格固定、频率翻倍时，它增长 $8$ 倍，而局部项只增长 $2$ 倍。因此高频问题的加密策略必须与频率同步——只做一次网格无关性检查、然后在更宽频带上沿用同一网格，是声学计算中最常见的错误。

### 单因素对照与记录字段

每个工况记录：$f_{\max}$、$\rho_0$、$c$、$N_\lambda$、$h$、$kh$、PML 的 $L$/$m$/$R_0$/$\sigma_{\max}$、求解器类型与迭代次数、参考声压（空气 $20\,\mu\mathrm{Pa}$、水中 $1\,\mu\mathrm{Pa}$）。

| 对照项 | 固定量 | 变化量 | 观测量 |
|---|---|---|---|
| 每波长单元数 | 其余全部 | $N_\lambda=6,8,10,13$ | 一阶模态与 $c/(2L)$ 的相对偏差 |
| 吸收层厚度 | 网格、频率 | $L=0.1\lambda,0.15\lambda,0.25\lambda$ | 截断面驻波幅值给出的反射系数 |
| 吸收层幂律 | $L$、$R_0$ | $m=1,2,3,4$ | 层内残余反射与幅值衰减曲线 |
| 边界阻抗 | 几何、网格 | $Z/\rho_0 c=0.5,1,2$ | 吸声系数 $\alpha$ 与解析值对照 |
| 扫频步长 | 求解器、网格 | $\Delta f=1,3,10\,\mathrm{Hz}$ | 峰值频率与半功率带宽 |

### 刚性管驻波：频率与节点位置

长度 $L$ 的刚性管两端为刚壁（$\partial p/\partial n=0$），解析模态频率为

$$
f_n=\frac{nc}{2L},
\qquad n=1,2,3,\dots
$$

取 $L=1.0\,\mathrm{m}$、$c=343\,\mathrm{m/s}$ 得 $f_1=171.5\,\mathrm{Hz}$、$f_2=343.0\,\mathrm{Hz}$、$f_3=514.5\,\mathrm{Hz}$。节点位于 $x=(2m-1)L/(2n)$，一阶模态中间 $x=0.5\,\mathrm{m}$ 为节点。若把一端改为压力释放面，模态序列变成 $f_n=(2n-1)c/(4L)$，即 $85.75\,\mathrm{Hz}$、$257.25\,\mathrm{Hz}$、$428.75\,\mathrm{Hz}$——同一几何、只改边界类型，频率序列完全不同。

### 脉动球：辐射阻抗与声功率

半径 $a$ 的球面以均匀法向速度 $\hat v_n$ 脉动时，其比辐射阻抗有闭式解

$$
z_r=\rho c\left[\frac{(ka)^2}{1+(ka)^2}+i\,\frac{ka}{1+(ka)^2}\right],
\qquad
\sigma_{\mathrm{rad}}=\frac{(ka)^2}{1+(ka)^2}.
$$

$\sigma_{\mathrm{rad}}$ 是辐射效率。取 $a=0.1\,\mathrm{m}$、$f=1000\,\mathrm{Hz}$、$\rho c=413\,\mathrm{Rayl}$，则 $k=18.32\,\mathrm{rad/m}$、$ka=1.832$、$(ka)^2=3.356$，于是 $\mathrm{Re}(z_r)=413\times3.356/4.356=318.4\,\mathrm{Rayl}$、$\mathrm{Im}(z_r)=413\times1.832/4.356=173.8\,\mathrm{Rayl}$、$\sigma_{\mathrm{rad}}=0.770$。把频率降到 $54.6\,\mathrm{Hz}$ 使 $ka=0.1$，则 $\sigma_{\mathrm{rad}}=0.0099$，小尺寸声源低频辐射效率仅 $1\%$。

声功率由辐射阻抗与振速给出

$$
\Pi=\tfrac12\,\mathrm{Re}(z_r)\,|\hat v_n|^2 S,
\qquad S=4\pi a^2.
$$

取 $\hat v_n=0.01\,\mathrm{m/s}$、$S=0.1257\,\mathrm{m}^2$，得 $\Pi=\tfrac12\times318.4\times10^{-4}\times0.1257=2.00\times10^{-3}\,\mathrm{W}$，即 $2.0\,\mathrm{mW}$。有限元结果与解析值的偏差应控制在 $1\%$（$0.04\,\mathrm{dB}$）以内，否则先查表面积分面是否落在 PML 层内部——把吸收层表面当成辐射面会把被吸收的能量算成输出功率，使 $\Pi$ 偏高。

### 自由场衰减与相位

无界域解的远场形式为 $\hat p(r)\propto e^{ikr}/r$。用两个半径上的探针核对：$r=1\,\mathrm{m}$ 与 $r=2\,\mathrm{m}$ 的幅值比应为 $0.5$，即 $-6.02\,\mathrm{dB}$；相位差应为 $k\Delta r=18.32\,\mathrm{rad}$。若幅值比偏离 $0.5$ 超过 $2\%$，说明反射波已经污染了场，应先加密吸收层而不是加密网格。

### 吸收边界反射系数的实测

在吸收层外放一对探针，用两位置法分离入射波与反射波，反射系数取 $R=|p_r|/|p_i|$。验收阈值按用途分档：全消声验收要求 $R<-40\,\mathrm{dB}$（$1\%$），一般工程用 $-20\,\mathrm{dB}$（$10\%$）即可。作为对照，一阶 Sommerfeld 条件在 $30^\circ$ 入射时理论反射为 $7.2\%$（$-22.9\,\mathrm{dB}$），在 $60^\circ$ 入射时为 $33.3\%$（$-9.5\,\mathrm{dB}$）。因此若实测反射在斜入射方向超过 $-20\,\mathrm{dB}$，不应归因于网格，而应换用 PML 或高阶吸收条件。层厚从 $0.1\lambda$ 增到 $0.25\lambda$ 时，实测 $R$ 通常从约 $-25\,\mathrm{dB}$ 改善到 $-60\,\mathrm{dB}$ 以下；若加密层厚几乎无改善，问题多半出在幂律指数或层内单元数不足。

## 参考资料

1. Ihlenburg, F. *Finite Element Analysis of Acoustic Scattering*. Springer, 1998.
2. Ihlenburg, F. & Babuška, I. Dispersion analysis and error estimation of Galerkin finite element methods for the Helmholtz equation. *International Journal for Numerical Methods in Engineering*, 38(22): 3745-3774, 1995.
3. Deraemaeker, A., Babuška, I. & Bouillard, P. Dispersion and pollution of the FEM solution for the Helmholtz equation in one, two and three dimensions. *International Journal for Numerical Methods in Engineering*, 46(4): 471-499, 1999.
4. Thompson, L. L. A review of finite-element methods for time-harmonic acoustics. *Journal of the Acoustical Society of America*, 119(3): 1315-1330, 2006.
5. Burton, A. J. & Miller, G. F. The application of integral equation methods to the numerical solution of some exterior boundary-value problems. *Proceedings of the Royal Society of London A*, 323(1553): 201-210, 1971.
6. Berenger, J.-P. A perfectly matched layer for the absorption of electromagnetic waves. *Journal of Computational Physics*, 114(2): 185-200, 1994.
7. Marburg, S. & Nolte, B. (eds.) *Computational Acoustics of Noise Propagation in Fluids*. Springer, 2008.
8. Wu, T. W. *Boundary Element Acoustics: Fundamentals and Computer Codes*. WIT Press, 2000.
9. Harari, I. & Hughes, T. J. R. Galerkin/least-squares finite element methods for the reduced wave equation with non-reflecting boundary conditions in unbounded domains. *Computer Methods in Applied Mechanics and Engineering*, 98(3): 411-454, 1992.
10. Roache, P. J. *Verification and Validation in Computational Science and Engineering*. Hermosa Publishers, 1998.
11. Oberkampf, W. L. & Roy, C. J. *Verification and Validation in Scientific Computing*. Cambridge University Press, 2010.
12. Morse, P. M. & Ingard, K. U. *Theoretical Acoustics*. Princeton University Press, 1986.
