---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-spectral-method-diagnosis-validation
title: "谱方法：结果诊断与可信度验证"
summary: "用谱系数衰减、混叠指数与壁面分辨力三条独立指标判断谱解是否可信：给出 Chebyshev 配置点在壁面的间距手算、128 模态下模态 130 的混叠去向，以及 3/2 去混叠规则的实现与阈值。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "谱方法"
  - "结果诊断与可信度验证"
  - "谱系数衰减"
  - "去混叠"
seo:
  title: "谱方法：结果诊断与可信度验证"
  description: "用谱系数衰减、混叠指数与壁面分辨力三条独立指标判断谱解是否可信：给出 Chebyshev 配置点在壁面的间距手算、128 模态下模态 130 的混叠去向，以及 3/2 去混叠规则的实现与阈值。"
  keywords:
    - "谱方法"
    - "结果诊断与可信度验证"
    - "谱系数衰减"
    - "去混叠"
---

# 谱方法：结果诊断与可信度验证

谱方法的失效方式和有限差分完全不同：它不会因为网格太粗而耗散过度，而是把未解析的高频内容折叠回低频，产生看起来光滑但完全错误的结构。判断谱解是否可信，要看三个互相独立的指标：谱系数是否衰减到机器精度、非线性项是否发生混叠、壁面附近的配置点间距是否足以解析边界层。

## 指标一：谱系数的衰减形态

把解展开成 $\phi(x)=\sum_k\hat{\phi}_k e^{ikx}$，系数由

$$\hat{\phi}_k=\frac{1}{2\pi}\int_{0}^{2\pi}\phi(x)e^{-ikx}\,dx$$

给出。对解析函数，系数按指数衰减，误差满足

$$\left\|\phi-\phi_N\right\|\le C e^{-\alpha N}$$

而对只有 $m$ 阶连续导数的函数，衰减退化为代数型 $\left\|\phi-\phi_N\right\|\le CN^{-m}$。

这条判据的用法是：把 $\log\left|\hat{\phi}_k\right|$ 对 $k$ 画图。若尾部是直线下降，说明解在域内解析，谱方法正在发挥指数收敛；若尾部变成幂律，说明存在间断、尖角或未解析的边界层，继续增加 $N$ 收效甚微，应先定位不光滑的位置。

## 指标二：混叠的定量表现

在 $N$ 个模态的离散表示中，波数 $k$ 与 $k-mN$ 不可区分。取 $N=128$，则模态 130 被混叠到

$$130-128=2$$

也就是说，一个物理上属于高波数的分量，会伪装成模态 2 的低频结构。这类误差的可怕之处在于它不可通过观察解的光滑性发现：混叠后的解看起来比真实解更光滑。

对二次非线性项，两个模态最高到 $N/2$ 的量相乘会产生最高到 $N$ 的分量，因此需要 $3/2$ 去混叠规则：把模态数补零到

$$M=\frac{3N}{2}=\frac{3\times128}{2}=192$$

在 192 个模态上做乘法，再截断回 128 个。若不做这一步，$\mathrm{Re}=10^4$ 量级的湍流算例中混叠能量会在数个大涡翻转时间内累积到与物理模态同量级。

## 指标三：壁面处的实际间距

Chebyshev 配置点 $x_j=\cos\left(j\pi/N\right)$ 在端点处最密。$N=128$ 时端点附近的归一化间距为

$$1-\cos\left(\frac{\pi}{128}\right)=1-0.9996988=3.01\times10^{-4}$$

把它换算成物理长度。取槽道半高 $h=0.05\ \mathrm{m}$，空气 $\nu=1.5\times10^{-5}\ \mathrm{m^2/s}$，摩擦雷诺数 $\mathrm{Re}_\tau=180$，则摩擦速度为

$$u_\tau=\frac{\mathrm{Re}_\tau\,\nu}{h}=\frac{180\times1.5\times10^{-5}}{0.05}=5.4\times10^{-2}\ \mathrm{m/s}$$

壁面首层中心到壁面的距离与折算壁面单位分别为

$$\Delta y=3.01\times10^{-4}\times0.05=1.51\times10^{-5}\ \mathrm{m},\qquad y^{+}=\frac{\Delta y\,u_\tau}{\nu}=\frac{1.51\times10^{-5}\times0.054}{1.5\times10^{-5}}=0.054$$

$y^{+}=0.054$ 远小于 1，满足直接数值模拟对壁面分辨的要求。作为对照，均匀网格在半高 $0.05\ \mathrm{m}$ 内要达到同样间距需要 $0.05/1.51\times10^{-5}\approx3300$ 个点，而 Chebyshev 只用 128 个点就把精度集中在最需要的地方——这就是谱方法在壁湍流中的核心优势。

## 诊断脚本

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

## 三条指标的联合判读

| 症状 | 优先怀疑 | 判定试验 | 阈值 |
|---|---|---|---|
| 系数尾部呈幂律 | 域内存在不光滑结构 | 定位系数相位突变处 | 尾部应在 $k<N/2$ 前低于 $10^{-12}$ |
| 低频能量随分辨率提高而下降 | 非线性项混叠 | 开启 3/2 去混叠重跑 | 低频能量变化应 < 1 % |
| 壁面剪应力随 $N$ 提高持续变化 | 壁面分辨不足 | 计算 $y^{+}$ | 应 < 0.5 |
| 阶跃附近出现 9 % 过冲 | Gibbs 现象 | 计算过冲幅值与跳变之比 | 应为 0.0895 |
| 全场解光滑但动量不平衡 | 混叠把能量搬到不可见模态 | 逐模态核对总能量收支 | 残差应 < $10^{-10}$ |

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 阶跃处固定 8.95 % 过冲 | Gibbs 现象，谱展开无法消除 | 增加 $N$ 两倍，过冲幅值不变即确认（宽度变窄但幅值固定） |
| 长时间积分后出现高频噪声 | 二次非线性项混叠能量累积 | 同算例开启 3/2 去混叠，噪声应在数步内消失 |
| 壁面附近速度剖面出现振荡 | 配置点间距不足或壁面边界条件用配点强加不当 | 把 $N$ 从 128 提到 192，振荡若缩小则属分辨不足 |
| 系数在偶数模态异常偏大 | 混叠把 $k>N/2$ 的分量折回低频 | 检查 $k=N/2$ 附近的谱，若出现对称配对即为混叠 |
| 与有限差分解在粗网格上一致、细网格上分歧 | 谱解已收敛，差分仍在一阶耗散区 | 用差分做网格收敛研究，确认其观测阶后再比较 |

## 参考文献

1. Canuto C., Hussaini M.Y., Quarteroni A., Zang T.A., *Spectral Methods: Fundamentals in Single Domains*, Springer, 2006.
2. Boyd J.P., *Chebyshev and Fourier Spectral Methods*, 2nd ed., Dover, 2001.
3. Orszag S.A., *On the elimination of aliasing in finite-difference schemes by filtering high-wavenumber components*, Journal of the Atmospheric Sciences, 28(6):1074, 1971.
4. Trefethen L.N., *Spectral Methods in MATLAB*, SIAM, 2000.
