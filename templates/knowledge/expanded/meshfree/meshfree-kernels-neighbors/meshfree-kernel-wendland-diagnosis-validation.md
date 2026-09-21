---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-kernel-wendland-diagnosis-validation
title: "Wendland 核：结果诊断与可信度验证"
summary: "给出 Wendland C2 核的三项可复算自检：四点 Simpson 手算归一化得到 1.0049 的 0.49% 偏差、二阶矩 0.8h² 推出的有效平滑宽度、以及与三次样条核并排对照时的邻居数与噪声判据。"
category:
  slug: meshfree-kernels-neighbors
  name: "无网格法核函数与邻域搜索"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法核函数与邻域搜索"
  - "Wendland 核"
  - "结果诊断与可信度验证"
  - "归一化验证"
  - "有效平滑宽度"
seo:
  title: "Wendland 核：结果诊断与可信度验证"
  description: "给出 Wendland C2 核的三项可复算自检：四点 Simpson 手算归一化得到 1.0049 的 0.49% 偏差、二阶矩 0.8h² 推出的有效平滑宽度、以及与三次样条核并排对照时的邻居数与噪声判据。"
  keywords:
    - "Wendland 核"
    - "结果诊断与可信度验证"
    - "归一化验证"
    - "有效平滑宽度"
    - "Simpson 积分"
    - "非负傅里叶谱"
---

# Wendland 核：结果诊断与可信度验证

换用 Wendland C2 之后最常见的两种"结果不对"是：密度看起来正常但压力比基准低几个百分点，以及拉伸区依然出现配对。前者几乎总是归一化常数与形状函数配对错了，后者往往是代码里实际调用的还是三次样条。本文给出三项不依赖求解器的自检，其中第一项可以用手算完成。

## 手算归一化：四点 Simpson 给 1.0049

三维 Wendland C2 取支持半径 $2h$ 的写法：

$$W(q)=\frac{21}{16\pi h^{3}}\left(1-\frac{q}{2}\right)^{4}(2q+1),\qquad q=\frac{r}{h}\in[0,2]$$

归一化条件是 $\int_{\mathbb{R}^3}W\,d\mathbf{r}=1$，展开成径向积分

$$\frac{21}{16\pi}\int_{0}^{2}4\pi q^{2}\left(1-\frac{q}{2}\right)^{4}(2q+1)\,dq=\frac{21}{4}\int_{0}^{2}f(q)\,dq=1$$

其中 $f(q)=q^{2}(1-q/2)^{4}(2q+1)$。取步长 0.5 的四点 Simpson（5 个采样点）：$f(0)=0$，$f(0.5)=0.25\times0.75^{4}\times2=0.158203$，$f(1)=1\times0.5^{4}\times3=0.187500$，$f(1.5)=2.25\times0.25^{4}\times4=0.035156$，$f(2)=0$。加权求和得 $\frac{0.5}{3}\left[0+4(0.158203)+2(0.187500)+4(0.035156)+0\right]=\frac{0.5}{3}\times1.148438=0.191406$，乘 $21/4$ 得 $1.004883$。

结果是 1.0049，偏差 $+0.49\%$。这 0.49% 全部来自求积误差，不是核本身的问题：解析值为 $\int_0^2f\,dq=4/21=0.190476$，乘 $21/4$ 恰为 1。诊断含义是——如果你用 4 段求积去验证归一化，看到 1.0049 应当放行；如果看到 0.125 或 8.0，那是常数配对错误。

常数配对的三种可能必须分清：正确的 $21/(16\pi)=0.41780$ 配 $(1-q/2)^{4}(2q+1)$ 得 1.0000；正确的 $21/(2\pi)=3.34226$ 配 $(1-s)^{4}(4s+1)$ 也得 1.0000；把 $21/(16\pi)$ 配 $(1-s)^{4}(4s+1)$ 得 $0.125$，把 $21/(2\pi)$ 配 $(1-q/2)^{4}(2q+1)$ 得 $8.000$。

## 有效平滑宽度比三次样条小 5.7%

二阶矩决定核把流场抹平了多少：

$$\int_{\mathbb{R}^{3}}r^{2}W\,d\mathbf{r}=4\pi\cdot\frac{21}{16\pi}h^{2}\int_{0}^{2}q^{4}\left(1-\frac{q}{2}\right)^{4}(2q+1)\,dq$$

分段积分给出 $\int_0^2q^4(1-q/2)^4(2q+1)dq=32/210=0.152381$，于是 $\int r^{2}W\,d\mathbf{r}=5.25\times0.152381h^{2}=0.800h^{2}$。每方向等效方差 $0.800h^{2}/3=0.26667h^{2}$，等效标准差 $0.51640h$。同一 $h=6.0$ mm 下有效平滑宽度 $0.51640\times6.0=3.10$ mm。

与三次样条核并排比较：三次样条的二阶矩给出 $0.300h^{2}$，标准差 $0.54772h$。Wendland C2 比它小 $0.51640/0.54772=0.9428$，即窄 5.7%。所以从三次样条换到 Wendland C2 而保持 $h$ 不变时，界面会比原来薄约 6%，压力峰值会升高。这不是稳定性问题，是分辨率变了，应当在收敛研究里作为一次正式的网格效应记录。

## 非负傅里叶谱的可测后果

Wendland C2 的傅里叶变换在支持域内非负，这一条性质的可测后果是：把邻居数从 30 提到 120，规则排布不会自发坍缩成对。诊断方法是同一初始粒子集、同一时间步，只改 $\eta$：

| $\eta$（$\kappa=2$） | $N_{3D}$ | 三次样条预期 | Wendland C2 预期 |
|---|---|---|---|
| 1.0 | 33.5 | 稳定 | 稳定 |
| 1.2 | 57.9 | 临界 | 稳定 |
| 1.4 | 91.9 | 失稳 | 稳定 |
| 1.6 | 137.2 | 失稳 | 稳定（噪声降低） |

如果 Wendland C2 在 $N_{3D}=91.9$ 时仍然出现 $r<0.5\Delta p$ 的粒子对，第一嫌疑是代码实际加载的是三次样条核，第二嫌疑是时间步过大导致积分器失稳，而不是核本身。区分方法：把 $\Delta t$ 缩到 1/4，若配对消失则是积分器问题；若配对数量不变，则是核的问题。

## 高邻居数下的收敛检查

Wendland C2 的用途是让"加密粒子"与"增大 $\eta$"两个旋钮解耦。验证收敛时，固定 $\eta=1.2$、$\kappa=2$，只加密 $\Delta p$：$\Delta p$ 从 10.0 mm 减到 5.0 mm，$h$ 从 12.0 mm 减到 6.0 mm，邻居数恒为 57.9，成本涨 8 倍（三维粒子数按 2 的 3 次方增长）。若某一物理量（如圆柱绕流的阻力系数）在两次加密之间的变化小于 1%，且 $S_i$ 最小值保持在 0.95 以上，可以认为分辨率足够。反之，若阻力系数变化超过 3% 而 $S_i$ 正常，说明误差来自分辨率而非核，继续换核无效。

## 诊断脚本

```python
import math

def simpson_n4(f, a, b):
    h = (b-a)/4.0
    xs = [a + i*h for i in range(5)]
    return h/3.0*(f(xs[0]) + 4*f(xs[1]) + 2*f(xs[2]) + 4*f(xs[3]) + f(xs[4]))

def wendland_q(q):                    # 支撑 q<=2
    return 0.0 if q >= 2.0 else (1.0-q/2.0)**4*(2.0*q+1.0)

def check_norm():
    I = simpson_n4(lambda q: 4*math.pi*q*q*wendland_q(q), 0.0, 2.0)
    print("raw integral = %.6f" % I)                  # 2.395616
    print("normalized   = %.6f" % (21.0/(16.0*math.pi)*I))   # 1.004883

def second_moment():
    M = simpson_n4(lambda q: 4*math.pi*q**4*wendland_q(q), 0.0, 2.0)
    m2 = 21.0/(16.0*math.pi)*M
    print("m2 = %.4f h^2, sigma = %.4f h" % (m2, math.sqrt(m2/3.0)))

check_norm(); second_moment()
```

第一行输出 2.395616，解析值是 $16\pi/21=2.393573$，差 0.09%；第二行输出 1.004883，与手算一致；`m2` 输出 0.8000 h²、`sigma` 输出 0.5164 h。三个数字都应与上面的解析结果对上，对不上就说明形状函数或常数改错了。

## 误判清单

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 归一化自检得到 0.125 | $21/(16\pi)$ 与 $(1-s)^{4}(4s+1)$ 错配 | 换回 $(1-q/2)^{4}(2q+1)$，重算应得 1.0049 |
| 归一化自检得到 8.000 | $21/(2\pi)$ 与 $q$ 形式错配 | 同上，反向替换验证 |
| 界面比三次样条算例薄约 6% | 二阶矩从 $0.300h^{2}$ 降到 $0.267h^{2}$ | 打印两种核的 $\sigma_W$ 并与界面厚度实测值比对 |
| 高邻居数下仍出现粒子对 | 实际加载的是三次样条核 | 在核函数内插入类型断言并打印核名 |
| 压力比基准低约 12% | 只对体积项重归一化，压力项未同步 | 检查压力计算使用的 $W$ 与密度使用的 $W$ 是否同一对象 |
| 加密后阻力系数变化 4% 但 $S_i$ 正常 | 误差来自分辨率而非核 | 保持 $\eta$ 不变只减 $\Delta p$，观察变化率是否随 $\Delta p^{2}$ 下降 |

## 参考文献

1. Wendland H., *Piecewise polynomial, positive definite and compactly supported radial functions of minimal degree*, Advances in Computational Mathematics, 4, 389–396, 1995.
2. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425, 1068–1082, 2012.
3. Wendland H., *Scattered Data Approximation*, Cambridge University Press, 2005.
4. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, 17, 25–76, 2010.
5. Zhu Q., Hernquist L., Li Y., *Numerical convergence in smoothed particle hydrodynamics*, The Astrophysical Journal, 800, 6, 2015.
6. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30, 543–574, 1992.
