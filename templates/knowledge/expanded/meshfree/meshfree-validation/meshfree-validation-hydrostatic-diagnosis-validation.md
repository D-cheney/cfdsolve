---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-validation-hydrostatic-diagnosis-validation
title: "静水压力平衡：结果诊断与可信度验证"
summary: "以线性静水压力律为标尺，给出压力相对噪声、伪速度幅值和边界亏缺三项判据的阈值，演示由水深反算静水压力并与数值结果逐点对照的手算，并给出压力噪声频谱诊断脚本。"
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
  - "静水压力平衡"
  - "结果诊断与可信度验证"
  - "伪速度判据"
  - "压力噪声"
seo:
  title: "静水压力平衡：结果诊断与可信度验证"
  description: "以线性静水压力律为标尺，给出压力相对噪声、伪速度幅值和边界亏缺三项判据的阈值，演示由水深反算静水压力并与数值结果逐点对照的手算，并给出压力噪声频谱诊断脚本。"
  keywords:
    - "静水压力平衡"
    - "结果诊断与可信度验证"
    - "压力噪声阈值"
    - "伪速度判据"
    - "边界亏缺"
---

# 静水压力平衡：结果诊断与可信度验证

静水压力平衡是最容易被"看起来没问题"掩盖的基准：水面不动、动画安静，但内部可能存在百分之几的压力噪声和持续的伪速度。可信度判据必须落到数字上——压力相对噪声是否低于 1%、伪速度幅值是否低于 $0.01\sqrt{gH}$、以及壁面压力是否在静水律的线性带上。本文给出这三条线的阈值、手算过程与频谱诊断脚本。

## 静水压力律给出逐点参照

静止水体中压力只随深度线性变化，与水平位置无关：

$$
p(z)=\rho g\,(H-z),\qquad 0\le z\le H,
$$

其中 $H$ 为水深（m），$z$ 为距底部的垂直坐标（m），$\rho$ 为密度（$\mathrm{kg/m^3}$），$g=9.81\ \mathrm{m/s^2}$。这一式子的用途是提供任意高度处的解析压力，用于与数值粒子压力逐点对照，而不只是比较底部单点。

一次可核对的手算：取 $H=1.0\ \mathrm{m}$、$\rho=1000\ \mathrm{kg/m^3}$。底部压力 $p(0)=1000\times9.81\times1.0=9810\ \mathrm{Pa}$；半深处 $p(0.5)=1000\times9.81\times0.5=4905\ \mathrm{Pa}$；距底 $0.75\ \mathrm{m}$ 处 $p(0.75)=1000\times9.81\times0.25=2452.5\ \mathrm{Pa}$。这些值应精确落在数值结果的 $\pm1\%$ 带内。

## 压力噪声的相对判据

定义压力相对噪声为

$$
\varepsilon_p=\frac{1}{\rho g H}\left(\frac{1}{N}\sum_{i=1}^{N}\left(p_i-p^{\mathrm{exact}}_i\right)^{2}\right)^{1/2},
$$

$N$ 为统计粒子数，$p^{\mathrm{exact}}_i$ 由静水律在该粒子高度处给出。分母用底部压力 $\rho gH$ 作尺度，使判据与水深无关。工程阈值取 $\varepsilon_p\le1\%$；对 $H=1.0\ \mathrm{m}$ 即压力均方根误差不超过 $98.1\ \mathrm{Pa}$。若只统计内部粒子（距壁面大于 $2h$）时 $\varepsilon_p$ 迅速降到 0.2% 以下，而全域统计仍高于 1%，则噪声集中在壁面，属于边界亏缺问题而非格式问题。

## 伪速度幅值判据

静止水体不应有宏观流动，因此用最大伪速度与重力波速的比值作为无量纲判据：

$$
\mathrm{Ma}_{s}=\frac{\max_i\lvert\mathbf{u}_i\rvert}{\sqrt{gH}}\le 0.01 .
$$

对 $H=1.0\ \mathrm{m}$，$\sqrt{gH}=\sqrt{9.81}=3.13\ \mathrm{m/s}$，阈值对应 $\max\lvert\mathbf{u}_i\rvert\le0.0313\ \mathrm{m/s}$。这个阈值比"速度看起来接近零"严格得多：$0.03\ \mathrm{m/s}$ 在 100 s 内可累积 3 m 位移，足以让静水面缓慢漂移。若伪速度超标，先用 $c_0\ge10\sqrt{gH}=31.3\ \mathrm{m/s}$ 检查弱可压缩声速是否足够高，再检查壁面粒子是否提供了足够的压力支撑。

## 三档分辨率的噪声收敛

静水基准不追求高收敛阶，而要求噪声随加密单调下降。用三档粒子间距统计 $\varepsilon_p$：

$$
\varepsilon_p(\Delta x)\approx C\,\Delta x^{q},\qquad
q=\frac{\ln\!\left(\varepsilon_{p,2}/\varepsilon_{p,1}\right)}{\ln\!\left(\Delta x_{2}/\Delta x_{1}\right)} .
$$

一次手算：$\Delta x=20,10,5\ \mathrm{mm}$ 时 $\varepsilon_{p,1}=0.0042$、$\varepsilon_{p,2}=0.0101$、$\varepsilon_{p,3}=0.0243$。则

$$
q_{12}=\frac{\ln(0.0101/0.0042)}{\ln 2}=\frac{0.878}{0.693}=1.27,\qquad
q_{23}=\frac{\ln(0.0243/0.0101)}{\ln 2}=\frac{0.878}{0.693}=1.27 .
$$

两段阶次几乎相同，说明噪声来源于一致性的零阶/一阶误差，且随加密稳定下降；若 $q<0.5$，多半是壁面粒子间距没有随流体粒子同步缩小。

## 压力噪声频谱诊断脚本

```python
import numpy as np

H, rho, g = 1.0, 1000.0, 9.81

def exact_pressure(z, H=H, rho=rho, g=g):
    return rho * g * (H - z)

def pressure_noise(p, z, H=H, rho=rho, g=g):
    """相对压力噪声，分母取底部压力"""
    return np.sqrt(np.mean((p - exact_pressure(z))**2)) / (rho * g * H)

def spurious_velocity(u, H=H, g=g):
    """伪速度无量纲判据"""
    return np.max(np.abs(u)) / np.sqrt(g * H)

# 逐点对照：H=1.0 m 时解析压力
for z in (0.0, 0.25, 0.5, 0.75):
    print("z=%.2f m -> p=%.1f Pa" % (z, exact_pressure(z)))

# 噪声收敛阶
eps = [0.0042, 0.0101, 0.0243]     # fine -> coarse
dx  = [0.005, 0.010, 0.020]        # m
q = np.log(eps[1] / eps[0]) / np.log(dx[1] / dx[0])
print("noise order q =", round(q, 2))            # 1.27
print("threshold v_max =", 0.01 * np.sqrt(g * H), "m/s")  # 0.0313
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 水面静止但 $\varepsilon_p$ 高于 5% | 壁面粒子亏缺，压力支撑不足 | 只统计距壁面 $2h$ 以外的粒子，看 $\varepsilon_p$ 是否骤降 |
| 伪速度长期缓慢漂移 | 弱可压缩声速偏低或存在静压不平衡 | 把 $c_0$ 从 $10\sqrt{gH}$ 提到 $20\sqrt{gH}$ 重跑 |
| 压力沿水平方向出现梯度 | 初始密度或粒子排布不均匀 | 用规则格点重初始化，比较 $\varepsilon_p$ 变化 |
| 底部压力低于解析值 5% | 底部边界粒子缺失，最近粒子距底过远 | 检查最近粒子距底距离是否大于 $0.5\Delta x$ |
| 噪声不随加密下降 | 壁面层间距未与流体同步缩小 | 计算 $q$，看是否低于 0.5 |
| 长时间后水面抬升 | 伪速度累积位移未被阻尼抑制 | 输出 $\max\lvert u\rvert$ 时间历程，看是否单调增长 |

## 复核与参考文献

通过条件：全域 $\varepsilon_p\le1\%$、内部区 $\varepsilon_p\le0.2\%$、$\mathrm{Ma}_s\le0.01$、$q\ge0.8$ 且单调。参考文献：

1. Monaghan, J. J., "Simulating Free Surface Flows with SPH," *Journal of Computational Physics*, 110(2), 1994, pp. 399–406.
2. Adami, S., Hu, X. Y., Adams, N. A., "A generalized wall boundary condition for smoothed particle hydrodynamics," *Journal of Computational Physics*, 231(21), 2012, pp. 7057–7075.
3. Colagrossi, A., Landrini, M., "Numerical simulation of interfacial flows by smoothed particle hydrodynamics," *Journal of Computational Physics*, 191(2), 2003, pp. 448–475.
4. Antuono, M., Colagrossi, A., Marrone, S., "Numerical diffusive terms in weakly-compressible SPH schemes," *Computer Physics Communications*, 183(12), 2012, pp. 2570–2580.
5. SPHERIC, "SPHERIC Benchmark Test Cases," ERCOFTAC SPHERIC Workshop benchmark suite.
6. Violeau, D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
7. Liu, G. R., Liu, M. B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
