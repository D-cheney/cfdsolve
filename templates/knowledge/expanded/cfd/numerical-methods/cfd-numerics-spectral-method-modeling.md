---
template_version: flowlab-knowledge/1.0
slug: cfd-numerics-spectral-method-modeling
title: 谱方法：原理、设置与验证
summary: >-
  从全局基函数的投影误差出发，说明谱方法为何对解析函数指数收敛、对不光滑函数退化为代数收敛：给出 1/k 与 1/k! 系数衰减的手算对比、Lebesgue
  常数的节点依赖，以及四类典型失效场景。
category:
  slug: numerical-methods
  name: CFD 数值方法
level: 进阶
reading_minutes: 24
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - CFD 数值方法
  - 谱方法
  - 离散原理与适用范围
  - 指数收敛
  - Lebesgue 常数
  - 工程设置与参数选择
  - Chebyshev 配置点
  - IMEX 时间推进
  - 结果诊断与可信度验证
  - 谱系数衰减
  - 去混叠
seo:
  title: 谱方法：原理、设置与验证
  description: >-
    从全局基函数的投影误差出发，说明谱方法为何对解析函数指数收敛、对不光滑函数退化为代数收敛：给出 1/k 与 1/k!
    系数衰减的手算对比、Lebesgue 常数的节点依赖，以及四类典型失效场景。
  keywords:
    - 谱方法
    - 离散原理与适用范围
    - 指数收敛
    - Lebesgue 常数
    - 工程设置与参数选择
    - Chebyshev 配置点
    - IMEX
    - 结果诊断与可信度验证
    - 谱系数衰减
    - 去混叠
---
# 谱方法：原理、设置与验证

谱方法把解投影到全局基函数上，误差由基函数对目标函数的逼近能力决定，而不由网格间距决定。这带来两个截然不同的后果：对解析函数，误差随模态数指数下降，$N=32$ 就可能达到双精度；对含间断的函数，误差只按代数速率下降，$N=1024$ 也未必比二阶差分更好。判断一个算例值不值得上谱方法，只需要看解在域内是否解析。谱方法的配置量比有限差分少得多，但每个取值的影响都被放大：模态数 $N$ 每翻一倍，显式时间步的上限就掉到十六分之一。因此谱方法的工程设置实质上是一道时间步预算题——先算清楚 $N$ 带来的刚性，再决定哪些项必须隐式处理。谱方法的失效方式和有限差分完全不同：它不会因为网格太粗而耗散过度，而是把未解析的高频内容折叠回低频，产生看起来光滑但完全错误的结构。判断谱解是否可信，要看三个互相独立的指标：谱系数是否衰减到机器精度、非线性项是否发生混叠、壁面附近的配置点间距是否足以解析边界层。

## 基础概念与控制关系

### 手算：两种衰减的实际差距

取两个函数在 $k=10$ 处的系数幅值做对比。

锯齿波 $u(x)=x/\pi$（$x\in(-\pi,\pi)$）只有零阶连续，系数 $\hat{u}_k\sim 1/k$，在 $k=10$ 处幅值约

$$\left|\hat{u}_{10}\right|\approx\frac{1}{10}=1.0\times10^{-1}$$

解析函数 $u(x)=e^{\sin x}$ 的系数按阶乘衰减，$k=10$ 处幅值约

$$\left|\hat{u}_{10}\right|\approx\frac{1}{10!}=\frac{1}{3628800}=2.76\times10^{-7}$$

两者相差

$$\frac{1.0\times10^{-1}}{2.76\times10^{-7}}=3.6\times10^{5}$$

五个半量级。要让锯齿波的系数降到 $10^{-7}$，需要 $k\approx10^{7}$，即千万量级的模态；而解析函数用 10 个模态就做到了。这就是"谱方法只适合光滑问题"这句话的定量含义。

把模态数换成物理波数，取周期域长 $L=1.0\ \mathrm{m}$，则模态 $k$ 对应波数 $2\pi k/L\ \mathrm{rad/m}$：$k=10$ 对应 $62.8\ \mathrm{rad/m}$，即波长 $0.10\ \mathrm{m}$；而锯齿波降到 $10^{-7}$ 所需的 $k\approx10^{7}$ 对应 $6.3\times10^{7}\ \mathrm{rad/m}$，波长 $1.0\times10^{-7}\ \mathrm{m}$——已进入分子平均自由程量级，物理上不存在这样的结构。

再看一个真实的分辨需求。$\mathrm{Re}_\tau=180$ 的槽道，半高 $h=0.05\ \mathrm{m}$，空气 $\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$，摩擦速度 $u_\tau=5.4\times10^{-2}\ \mathrm{m/s}$，耗散率按 $\varepsilon=u_\tau^{3}/h=3.1\times10^{-3}\ \mathrm{m^2/s^3}$ 估算，则 Kolmogorov 尺度为

$$\eta=\left(\frac{\nu^{3}}{\varepsilon}\right)^{1/4}=\left(\frac{3.38\times10^{-15}}{3.1\times10^{-3}}\right)^{1/4}=1.0\times10^{-3}\ \mathrm{m}$$

对应波数 $6.2\times10^{3}\ \mathrm{rad/m}$，即需要解析到 $k\approx10^{3}$。这与上文 $k\approx10^{7}$ 的要求相差四个量级，说明不光滑解在物理上根本无法用谱展开覆盖。

### 谱微分矩阵的构造与代价

```python
import numpy as np

def cheb_D(N):
    x = np.cos(np.pi * np.arange(N + 1) / N)
    c = np.hstack(([2.0], np.ones(N - 1), [2.0])) * (-1.0) ** np.arange(N + 1)
    X = np.tile(x, (N + 1, 1)).T
    D = np.outer(c, 1.0 / c) / ((X - X.T) + np.eye(N + 1))
    return x, D - np.diag(D.sum(axis=1))

for N in (32, 64, 128):
    x, D = cheb_D(N)
    # 对 u = exp(sin(pi*x)) 做谱微分, 与解析导数比较
    u = np.exp(np.sin(np.pi * x))
    du_exact = np.pi * np.cos(np.pi * x) * u
    err = np.abs(D @ u - du_exact).max()
    print(f"N={N:4d}  max|err|={err:.3e}  cond(D)={np.linalg.cond(D):.2e}")
# N= 32  max|err|~1e-11   cond ~ 1e3
# N= 64  max|err|~1e-14   cond ~ 4e3
# N=128  max|err|~1e-13   cond ~ 2e4
```

注意误差在 $N=64$ 之后不再下降——不是收敛停滞，而是已经触到双精度的地板。同时条件数按 $N^2$ 增长：$N$ 从 32 到 128 翻了 4 倍，条件数翻了约 16 倍。这意味着谱方法在高模态下对舍入误差更敏感，长时间积分需要定期滤波。

## 适用边界与方案选择

### 适用边界

- **解析解**：指数收敛，$N$ 通常不超过 256；
- **含有限个间断**：全局谱展开受 Gibbs 现象限制，过冲固定为跳变的 8.95 %，不会随 $N$ 减小。此时应改用分片谱方法或间断 Galerkin；
- **复杂几何**：单区域谱方法要求张量积结构，绕流物体必须用多区域或谱元法，否则几何误差主导；
- **强非线性长时间积分**：混叠与条件数增长叠加，需要 3/2 去混叠配合指数滤波；
- **非周期边界层**：Chebyshev 能处理，但配置点间距在端点处为 $h/N^2$，显式时间步被压到 $N^{-2}$ 甚至 $N^{-4}$。

## 工程设置与实施

### 配置点的选择：Lebesgue 常数

插值误差满足 $\left\|u-I_Nu\right\|_{\infty}\le\left(1+\Lambda_N\right)\left\|u-p_N^{*}\right\|_{\infty}$，其中 $\Lambda_N$ 是节点的 Lebesgue 常数。等距节点的 $\Lambda_N$ 按指数增长：

$$\Lambda_N^{\text{equi}}\sim\frac{2^{N+1}}{e\,N\ln N}$$

$N=64$ 时该值约为 $2.6\times10^{16}$；而 Chebyshev 节点只有对数增长，$\Lambda_N^{\text{cheb}}\approx\frac{2}{\pi}\ln N+1$，$N=64$ 时为 2.65。相差 16 个数量级。

这就是为什么谱方法绝不能用等距配置点：Runge 函数 $1/\left(1+25x^2\right)$ 在等距节点上插值，$N=64$ 时端点附近误差达到 $10^{1}$ 量级，而在 Chebyshev 节点上误差随 $N$ 指数下降。Chebyshev 节点的作用不是"加密端点"，而是把 Lebesgue 常数从指数增长压到对数增长。

### 配置骨架

```python
import numpy as np

def cheb(N):
    """Chebyshev 配置点与一阶微分矩阵 (Trefethen 2000, 程序 6)"""
    if N == 0:
        return np.array([1.0]), np.zeros((1, 1))
    x = np.cos(np.pi * np.arange(N + 1) / N)          # 从 +1 到 -1
    c = np.hstack(([2.0], np.ones(N - 1), [2.0])) * (-1.0) ** np.arange(N + 1)
    X = np.tile(x, (N + 1, 1)).T
    dX = X - X.T
    D = np.outer(c, 1.0 / c) / (dX + np.eye(N + 1))
    D = D - np.diag(D.sum(axis=1))
    return x, D

N = 64
x, D = cheb(N)
D2 = D @ D
lam_max = np.abs(np.linalg.eigvals(D2)).max()
nu, h, u = 1.0e-5, 0.05, 10.0
dt_diff = 2.0 / (nu * lam_max)
dt_adv = h / (u * N**2)
print(f"N={N}  lambda_max={lam_max:.3e} 1/m^2")
print(f"dt_diff={dt_diff:.3e} s   dt_adv={dt_adv:.3e} s   -> 取 {min(dt_diff, dt_adv):.3e} s")

# 去混叠模态数
print("去混叠需补零到:", 3 * N // 2, "个模态")
```

### 诊断脚本

```python
import numpy as np

def spectral_decay(u_hat, tol=1e-12):
    """返回尾部系数首次低于 tol 的模态号; 用于判断是否解析充分"""
    mag = np.abs(u_hat)
    below = np.where(mag < tol)[0]
    return int(below[0]) if below.size else -1

def dealias_32(u_hat):
    """3/2 去混叠: 补零到 1.5N, 逆变换后做非线性乘法, 再截断"""
    N = len(u_hat)
    M = 3 * N // 2
    u = np.fft.ifft(np.pad(u_hat, (0, M - N)))
    v = np.fft.ifft(np.pad(u_hat, (0, M - N)))
    w = np.fft.fft(u * v)          # 乘积在 M 个模态上完成
    return w[:N]                    # 截断回 N

# 验证混叠: N=128 时模态 130 应落到模态 2
N = 128
k_phys = 130
print("混叠目标模态:", k_phys - N)      # 输出 2

# 壁面间距手算
for N in (64, 128, 256):
    dy = 1.0 - np.cos(np.pi / N)
    print(f"N={N:4d}  dy_wall={dy:.3e}  y+@Re_tau=180: {dy*180:.3f}")
# N= 64  dy_wall=1.204e-03  y+ 0.217
# N=128  dy_wall=3.012e-04  y+ 0.054
# N=256  dy_wall=7.531e-05  y+ 0.014
```

### 模态数 N 决定刚性有多强

Chebyshev 配置点上二阶微分算子 $D^{(2)}$ 的最大特征值按 $N^4$ 标度。在 $N\le256$ 的常用范围内，可取

$$\lambda_{\max}\left(D^{(2)}\right)\approx\frac{N^{4}}{4}$$

显式推进扩散项要求 $\left|1+\nu\lambda_{\max}\Delta t\right|\le1$，即

$$\Delta t_{\text{diff}}\le\frac{2}{\nu\,\lambda_{\max}}\approx\frac{8}{\nu N^{4}}$$

手算两档。取空气 $\nu=1.0\times10^{-5}\ \mathrm{m^2/s}$，槽道半高 $h=0.05\ \mathrm{m}$：

- $N=64$：$\lambda_{\max}=64^4/4=4.19\times10^{6}\ \mathrm{m^{-2}}$，$\Delta t_{\text{diff}}=2/\left(1.0\times10^{-5}\times4.19\times10^{6}\right)=4.8\times10^{-2}\ \mathrm{s}$；
- $N=128$：$\lambda_{\max}=128^4/4=6.71\times10^{7}\ \mathrm{m^{-2}}$，$\Delta t_{\text{diff}}=2/\left(1.0\times10^{-5}\times6.71\times10^{7}\right)=3.0\times10^{-3}\ \mathrm{s}$。

比值 $4.8\times10^{-2}/3.0\times10^{-3}=16$，正是 $2^4$。这就是谱方法不能靠加模态换精度的地方。

### 对流项往往比扩散项更紧

对流的显式限制由最小配置点间距决定。Chebyshev 网格的壁面间距约 $h/N^2$，于是

$$\Delta t_{\text{adv}}\le\frac{C\,h}{u\,N^{2}}$$

取来流 $u=10\ \mathrm{m/s}$，$h=0.05\ \mathrm{m}$，$C=1$，$N=64$：

$$\Delta t_{\text{adv}}=\frac{1\times0.05}{10\times64^{2}}=\frac{0.05}{40960}=1.2\times10^{-6}\ \mathrm{s}$$

比同模态下的扩散限制紧 4 万倍。本例的雷诺数为 $\mathrm{Re}=uh/\nu=10\times0.05/1.0\times10^{-5}=5.0\times10^{4}$，属于对流主导，因此**对流项而非扩散项才是决定步长的瓶颈**。反过来，在 $\mathrm{Re}<100$ 的算例中扩散项会重新成为瓶颈，配置时必须两项都算。

### IMEX 分裂：把刚性项交给隐式

标准做法是把线性刚性项（扩散、线性源）隐式处理，非线性项显式处理。写成

$$\frac{\hat{u}^{n+1}-\hat{u}^{n}}{\Delta t}=-ik\,\widehat{u^2}^{\,n}-\nu k^{2}\hat{u}^{n+1}$$

整理后每个模态独立求解，隐式部分只需求一个标量除法：

$$\hat{u}^{n+1}=\frac{\hat{u}^{n}+\Delta t\left(-ik\,\widehat{u^2}^{\,n}\right)}{1+\nu k^{2}\Delta t}$$

谱方法隐式推进的代价之所以低，是因为 Fourier 基下 $D^{(2)}$ 是对角的。Chebyshev 基下 $D^{(2)}$ 是满阵，需要解一个 $N\times N$ 的带状或稠密系统，每次求解代价 $O(N^2)$ 至 $O(N^3)$，这是 Chebyshev 与 Fourier 在配置上最重要的差别。

### 设置台账

| 设置项 | 取值 | 依据 | 失效信号 |
|---|---|---|---|
| 基函数 | Chebyshev（非周期）/ Fourier（周期） | 边界条件类型 | 非周期问题用 Fourier 会出现边界振荡 |
| 模态数 N | 128（壁湍流 $\mathrm{Re}_\tau=180$） | 需 $y^{+}<0.5$ | 系数尾部未衰减到 $10^{-12}$ |
| 显式/隐式分裂 | 扩散隐式、对流显式 | $\Delta t_{\text{diff}}\gg\Delta t_{\text{adv}}$ | 隐式系统求解时间超过总时间的 50 % |
| 去混叠模态数 | $3N/2=192$ | 二次非线性项的 3/2 规则 | 低频能量随 $N$ 提高而变化 |
| 时间格式 | 显式部分 RK3、隐式部分 Crank–Nicolson | 三阶精度的低存储需求 | 观测时间阶低于 2.8 |
| 滤波 | 指数滤波器，截断到 $k=2N/3$ | 抑制混叠残余 | 滤波后总能量下降超过 1 % |

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 端点附近误差达 $10^{1}$ | 用了等距配置点，Lebesgue 常数指数增长 | 换成 Chebyshev 节点重跑，误差应指数下降 |
| 间断处过冲固定为 8.95 % | Gibbs 现象，与 $N$ 无关 | $N$ 翻倍，过冲幅值不变即确认 |
| 误差在 $N=64$ 后不再下降 | 已触及双精度舍入地板 | 改用高精度算术重跑，若误差继续下降即为舍入限制 |
| 长时间积分后谱微分结果抖动 | 微分矩阵条件数按 $N^2$ 增长 | 输出 $\mathrm{cond}(D)$，与误差增长幅度对照 |
| 解在域内处处光滑但收敛仍是代数 | 边界条件不匹配导致解在边界处不解析 | 检查边界处解的高阶导数，若跳变则边界条件有误 |
| $N$ 从 64 提到 128 后立刻发散 | 时间步未按 $N^4$ 同步缩小 | 把 $\Delta t$ 除以 16 重跑，若稳定即确认 |
| 每个时间步耗时随 $N$ 增长过快 | Chebyshev 的 $D^{(2)}$ 满阵被反复求逆 | 把求逆结果缓存，比较装配与求解耗时占比 |
| 谱解能量随时间单调下降 | 滤波截断过低，物理模态被削 | 把截断从 $2N/3$ 提到 $0.9N$，能量下降应停止 |
| 壁面附近出现 $2\Delta x$ 振荡 | 边界条件用配点强加而非 Galerkin 投影 | 换成 tau 方法施加边界条件，振荡应消失 |
| 低 Re 算例中步长由对流项决定 | 误判主导项 | 分别计算 $\Delta t_{\text{diff}}$ 与 $\Delta t_{\text{adv}}$，取小者 |
| 阶跃处固定 8.95 % 过冲 | Gibbs 现象，谱展开无法消除 | 增加 $N$ 两倍，过冲幅值不变即确认（宽度变窄但幅值固定） |
| 长时间积分后出现高频噪声 | 二次非线性项混叠能量累积 | 同算例开启 3/2 去混叠，噪声应在数步内消失 |
| 壁面附近速度剖面出现振荡 | 配置点间距不足或壁面边界条件用配点强加不当 | 把 $N$ 从 128 提到 192，振荡若缩小则属分辨不足 |
| 系数在偶数模态异常偏大 | 混叠把 $k>N/2$ 的分量折回低频 | 检查 $k=N/2$ 附近的谱，若出现对称配对即为混叠 |
| 与有限差分解在粗网格上一致、细网格上分歧 | 谱解已收敛，差分仍在一阶耗散区 | 用差分做网格收敛研究，确认其观测阶后再比较 |

## 验证、验收与复现

### 投影误差由系数衰减速率决定

把周期函数展开成 Fourier 级数，截断到 $N$ 项的误差为

$$\left\|u-u_N\right\|_{L^2}^{2}=\sum_{\left|k\right|>N/2}\left|\hat{u}_k\right|^{2}$$

所以收敛速度完全由尾部系数的衰减决定。若 $u$ 在宽为 $\rho$ 的复带内解析，则

$$\left|\hat{u}_k\right|\le C e^{-\rho\left|k\right|}\quad\Longrightarrow\quad\left\|u-u_N\right\|\le C' e^{-\rho N/2}$$

若 $u$ 只有 $m$ 阶连续导数（第 $m$ 阶导数有跳变），则 $\left|\hat{u}_k\right|\sim k^{-(m+1)}$，误差按 $N^{-m}$ 下降。

### 指标一：谱系数的衰减形态

把解展开成 $\phi(x)=\sum_k\hat{\phi}_k e^{ikx}$，系数由

$$\hat{\phi}_k=\frac{1}{2\pi}\int_{0}^{2\pi}\phi(x)e^{-ikx}\,dx$$

给出。对解析函数，系数按指数衰减，误差满足

$$\left\|\phi-\phi_N\right\|\le C e^{-\alpha N}$$

而对只有 $m$ 阶连续导数的函数，衰减退化为代数型 $\left\|\phi-\phi_N\right\|\le CN^{-m}$。

这条判据的用法是：把 $\log\left|\hat{\phi}_k\right|$ 对 $k$ 画图。若尾部是直线下降，说明解在域内解析，谱方法正在发挥指数收敛；若尾部变成幂律，说明存在间断、尖角或未解析的边界层，继续增加 $N$ 收效甚微，应先定位不光滑的位置。

### 指标二：混叠的定量表现

在 $N$ 个模态的离散表示中，波数 $k$ 与 $k-mN$ 不可区分。取 $N=128$，则模态 130 被混叠到

$$130-128=2$$

也就是说，一个物理上属于高波数的分量，会伪装成模态 2 的低频结构。这类误差的可怕之处在于它不可通过观察解的光滑性发现：混叠后的解看起来比真实解更光滑。

对二次非线性项，两个模态最高到 $N/2$ 的量相乘会产生最高到 $N$ 的分量，因此需要 $3/2$ 去混叠规则：把模态数补零到

$$M=\frac{3N}{2}=\frac{3\times128}{2}=192$$

在 192 个模态上做乘法，再截断回 128 个。若不做这一步，$\mathrm{Re}=10^4$ 量级的湍流算例中混叠能量会在数个大涡翻转时间内累积到与物理模态同量级。

### 指标三：壁面处的实际间距

Chebyshev 配置点 $x_j=\cos\left(j\pi/N\right)$ 在端点处最密。$N=128$ 时端点附近的归一化间距为

$$1-\cos\left(\frac{\pi}{128}\right)=1-0.9996988=3.01\times10^{-4}$$

把它换算成物理长度。取槽道半高 $h=0.05\ \mathrm{m}$，空气 $\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$，摩擦雷诺数 $\mathrm{Re}_\tau=180$，则摩擦速度为

$$u_\tau=\frac{\mathrm{Re}_\tau\,\nu}{h}=\frac{180\times1.5\times10^{-5}}{0.05}=5.4\times10^{-2}\ \mathrm{m/s}$$

壁面首层中心到壁面的距离与折算壁面单位分别为

$$\Delta y=3.01\times10^{-4}\times0.05=1.51\times10^{-5}\ \mathrm{m},\qquad y^{+}=\frac{\Delta y\,u_\tau}{\nu}=\frac{1.51\times10^{-5}\times0.054}{1.5\times10^{-5}}=0.054$$

$y^{+}=0.054$ 远小于 1，满足直接数值模拟对壁面分辨的要求。作为对照，均匀网格在半高 $0.05\ \mathrm{m}$ 内要达到同样间距需要 $0.05/1.51\times10^{-5}\approx3300$ 个点，而 Chebyshev 只用 128 个点就把精度集中在最需要的地方——这就是谱方法在壁湍流中的核心优势。

### 三条指标的联合判读

| 症状 | 优先怀疑 | 判定试验 | 阈值 |
|---|---|---|---|
| 系数尾部呈幂律 | 域内存在不光滑结构 | 定位系数相位突变处 | 尾部应在 $k<N/2$ 前低于 $10^{-12}$ |
| 低频能量随分辨率提高而下降 | 非线性项混叠 | 开启 3/2 去混叠重跑 | 低频能量变化应 < 1 % |
| 壁面剪应力随 $N$ 提高持续变化 | 壁面分辨不足 | 计算 $y^{+}$ | 应 < 0.5 |
| 阶跃附近出现 9 % 过冲 | Gibbs 现象 | 计算过冲幅值与跳变之比 | 应为 0.0895 |
| 全场解光滑但动量不平衡 | 混叠把能量搬到不可见模态 | 逐模态核对总能量收支 | 残差应 < $10^{-10}$ |

## 参考资料

1. Hesthaven J.S., Gottlieb S., Gottlieb D., *Spectral Methods for Time-Dependent Problems*, Cambridge University Press, 2007.
2. Fornberg B., *A Practical Guide to Pseudospectral Methods*, Cambridge University Press, 1996.
3. Weideman J.A.C., Reddy S.C., *A MATLAB differentiation matrix suite*, ACM Transactions on Mathematical Software, 26(4):465–519, 2000.
4. Runge C., *Über empirische Funktionen und die Interpolation zwischen äquidistanten Ordinaten*, Zeitschrift für Mathematik und Physik, 46:224–243, 1901.
5. Peyret R., *Spectral Methods for Incompressible Viscous Flow*, Springer, 2002.
6. Gottlieb D., Orszag S.A., *Numerical Analysis of Spectral Methods: Theory and Applications*, SIAM, 1977.
7. Karniadakis G.E., Sherwin S.J., *Spectral/hp Element Methods for Computational Fluid Dynamics*, 2nd ed., Oxford University Press, 2005.
8. Spalart P.R., *Direct simulation of a turbulent boundary layer up to $Re_\theta=1410$*, Journal of Fluid Mechanics, 187:61–98, 1988.
9. Canuto C., Hussaini M.Y., Quarteroni A., Zang T.A., *Spectral Methods: Fundamentals in Single Domains*, Springer, 2006.
10. Boyd J.P., *Chebyshev and Fourier Spectral Methods*, 2nd ed., Dover, 2001.
11. Orszag S.A., *On the elimination of aliasing in finite-difference schemes by filtering high-wavenumber components*, Journal of the Atmospheric Sciences, 28(6):1074, 1971.
12. Trefethen L.N., *Spectral Methods in MATLAB*, SIAM, 2000.
