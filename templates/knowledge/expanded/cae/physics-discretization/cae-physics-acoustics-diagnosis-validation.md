---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-acoustics-diagnosis-validation
title: "声学 Helmholtz 与波动方程：结果诊断与可信度验证"
summary: "用刚性管驻波、脉动球辐射阻抗与自由场衰减三个解析基准验收声学求解器，给出收敛阶计算、Richardson 外推、吸收边界反射系数实测与声压级口径核对的具体做法和判定阈值。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "声学 Helmholtz 与波动方程"
  - "结果诊断与可信度验证"
  - "辐射阻抗"
  - "网格收敛"
seo:
  title: "声学 Helmholtz 与波动方程：结果诊断与可信度验证"
  description: "用刚性管驻波、脉动球辐射阻抗与自由场衰减三个解析基准验收声学求解器，给出收敛阶计算、Richardson 外推、吸收边界反射系数实测与声压级口径核对的具体做法和判定阈值。"
  keywords:
    - "Helmholtz 方程"
    - "结果诊断与可信度验证"
    - "辐射阻抗"
    - "网格收敛"
    - "声功率"
---

# 声学 Helmholtz 与波动方程：结果诊断与可信度验证

声学结果最容易出现「云图漂亮但频率偏移」的假收敛，因此验收必须挂在解析解上，而不是挂在残差上。可用的独立基准有三类：闭域的模态频率、开域的辐射阻抗与声功率、以及远场的 $1/r$ 衰减与相位增长。本文给出三者的解析表达式、三套网格的收敛阶算法、吸收边界反射系数的实测流程，以及把症状映射到根因的判定表。

## 三类基准与各自的验收量

闭域基准检验的是体积离散与边界条件，验收量是模态频率与节点位置；开域基准检验的是辐射条件与表面积分，验收量是辐射阻抗、声功率与远场衰减指数；传播基准检验的是数值色散，验收量是相速误差。

## 刚性管驻波：频率与节点位置

长度 $L$ 的刚性管两端为刚壁（$\partial p/\partial n=0$），解析模态频率为

$$
f_n=\frac{nc}{2L},
\qquad n=1,2,3,\dots
$$

取 $L=1.0\,\mathrm{m}$、$c=343\,\mathrm{m/s}$ 得 $f_1=171.5\,\mathrm{Hz}$、$f_2=343.0\,\mathrm{Hz}$、$f_3=514.5\,\mathrm{Hz}$。节点位于 $x=(2m-1)L/(2n)$，一阶模态中间 $x=0.5\,\mathrm{m}$ 为节点。若把一端改为压力释放面，模态序列变成 $f_n=(2n-1)c/(4L)$，即 $85.75\,\mathrm{Hz}$、$257.25\,\mathrm{Hz}$、$428.75\,\mathrm{Hz}$——同一几何、只改边界类型，频率序列完全不同。

## 脉动球：辐射阻抗与声功率

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

## 自由场衰减与相位

无界域解的远场形式为 $\hat p(r)\propto e^{ikr}/r$。用两个半径上的探针核对：$r=1\,\mathrm{m}$ 与 $r=2\,\mathrm{m}$ 的幅值比应为 $0.5$，即 $-6.02\,\mathrm{dB}$；相位差应为 $k\Delta r=18.32\,\mathrm{rad}$。若幅值比偏离 $0.5$ 超过 $2\%$，说明反射波已经污染了场，应先加密吸收层而不是加密网格。

## 网格收敛阶与外推

对模态频率做三套网格（单元数按 $2$ 倍递增）的收敛研究。设第 $i$ 套网格误差为 $e_i$，观测阶为

$$
p=\frac{\ln\!\big[(f_3-f_2)/(f_2-f_1)\big]}{\ln r},
\qquad
f_{\mathrm{ex}}=f_3+\frac{f_3-f_2}{r^{\,p}-1},
$$

其中 $r$ 为加密比。一组 $L=1.0\,\mathrm{m}$ 刚性管一阶模态的实测数据如下：

| 单元数 $N$ | $h$ / mm | $f_1$ / Hz | 误差 / Hz | 误差比 |
|---|---|---|---|---|
| 50 | 20.0 | 170.800 | 0.700 | — |
| 100 | 10.0 | 171.325 | 0.175 | 4.00 |
| 200 | 5.0 | 171.456 | 0.044 | 3.98 |

误差比稳定在 $4$，故 $p=\ln 4/\ln 2=2.00$，与线性单元在 $H^1$ 范数下的理论阶一致。Richardson 外推给出 $f_{\mathrm{ex}}=171.456+(171.456-171.325)/(4-1)=171.500\,\mathrm{Hz}$，与解析值 $171.5\,\mathrm{Hz}$ 的相对偏差为 $2\times10^{-5}$。若观测阶只有 $1.2$ 左右，通常意味着边界条件施加位置有半个单元的偏移，或网格在端面处没有对齐。

```python
import math
f = [170.800, 171.325, 171.456]        # N=50/100/200, 解析值 171.5 Hz
e = [abs(x-171.5) for x in f]
p = math.log(e[0]/e[1], 2)             # 观测收敛阶 -> 2.00
fex = f[2] + (f[2]-f[1])/(2**p - 1)    # Richardson 外推 -> 171.500
```

## 吸收边界反射系数的实测

在吸收层外放一对探针，用两位置法分离入射波与反射波，反射系数取 $R=|p_r|/|p_i|$。验收阈值按用途分档：全消声验收要求 $R<-40\,\mathrm{dB}$（$1\%$），一般工程用 $-20\,\mathrm{dB}$（$10\%$）即可。作为对照，一阶 Sommerfeld 条件在 $30^\circ$ 入射时理论反射为 $7.2\%$（$-22.9\,\mathrm{dB}$），在 $60^\circ$ 入射时为 $33.3\%$（$-9.5\,\mathrm{dB}$）。因此若实测反射在斜入射方向超过 $-20\,\mathrm{dB}$，不应归因于网格，而应换用 PML 或高阶吸收条件。层厚从 $0.1\lambda$ 增到 $0.25\lambda$ 时，实测 $R$ 通常从约 $-25\,\mathrm{dB}$ 改善到 $-60\,\mathrm{dB}$ 以下；若加密层厚几乎无改善，问题多半出在幂律指数或层内单元数不足。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 一阶模态比 $c/(2L)$ 低 $3\%$，网格减半后降到 $0.8\%$ | 线性单元相位滞后 $(kh)^2/24$ | 固定频率加密网格，检查误差是否按 $4$ 倍下降 |
| 共振峰幅值随网格加密单调上升 | 边界无损耗，峰值由离散误差而非物理阻尼决定 | 给边界加 $\zeta=0.02$ 的阻抗，看峰值是否收敛到有限值 |
| 远场幅值比偏离 $0.5$ 超过 $2\%$ | 吸收层反射与直达波干涉 | 把探针半径从 $1.5\lambda$ 移到 $4\lambda$，看偏差是否消失 |
| 扫频在 $f=nc/(2L)$ 附近迭代不收敛 | 该频点矩阵近奇异 | 检查频点是否落在内域特征频率序列上 |
| 空气声压级比实验高约 $26\,\mathrm{dB}$ | 参考声压用了 $1\,\mu\mathrm{Pa}$ 而非 $20\,\mu\mathrm{Pa}$ | 按 $20\log_{10}(20)=26.0\,\mathrm{dB}$ 复核口径 |
| 同一模型两次运行的峰值频率差 $2\,\mathrm{Hz}$ | 扫频步长粗于半功率带宽 | 把步长压到 $\Delta f_{3\mathrm{dB}}/5$ 以下 |

## 能量与功率守恒的附加检查

闭域无损耗时总声能应守恒：声能密度为 $E=\frac{|\hat p|^2}{4\rho c^2}+\frac{\rho|\hat v|^2}{4}$。以 $p_{\mathrm{rms}}=0.2\,\mathrm{Pa}$ 的平面波为例，声压级为 $20\log_{10}(0.2/2\times10^{-5})=80.0\,\mathrm{dB}$，声强为 $I=p_{\mathrm{rms}}^2/(\rho c)=0.04/413=9.69\times10^{-5}\,\mathrm{W/m^2}$。若施加阻抗边界，耗散功率必须等于边界上的 $\frac12\mathrm{Re}(1/Z)\int_\Gamma|\hat p|^2\,d\Gamma$，与体积内能量的下降速率之差应小于总能量的 $0.1\%$。

## 参考文献

1. Ihlenburg, F. *Finite Element Analysis of Acoustic Scattering*. Springer, 1998.
2. Wu, T. W. *Boundary Element Acoustics: Fundamentals and Computer Codes*. WIT Press, 2000.
3. Roache, P. J. *Verification and Validation in Computational Science and Engineering*. Hermosa Publishers, 1998.
4. Oberkampf, W. L. & Roy, C. J. *Verification and Validation in Scientific Computing*. Cambridge University Press, 2010.
5. Morse, P. M. & Ingard, K. U. *Theoretical Acoustics*. Princeton University Press, 1986.
6. Deraemaeker, A., Babuška, I. & Bouillard, P. Dispersion and pollution of the FEM solution for the Helmholtz equation in one, two and three dimensions. *International Journal for Numerical Methods in Engineering*, 46(4): 471-499, 1999.
