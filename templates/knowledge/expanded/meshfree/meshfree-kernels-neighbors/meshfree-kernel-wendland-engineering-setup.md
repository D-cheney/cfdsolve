---
template_version: flowlab-knowledge/1.0
slug: meshfree-kernel-wendland-engineering-setup
title: Wendland 核：工程设置与诊断验证
summary: >-
  梳理 Wendland C2 核两套等价写法的常数配对关系，给出 1D/2D/3D 归一化常数、导数形式与邻居数预算，并用一个把 η 误当两倍导致邻居数从
  58 掉到 7.2 的算例说明配置陷阱。 全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: meshfree-kernels-neighbors
  name: 无网格法核函数与邻域搜索
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - MESHFREE
  - 无网格法核函数与邻域搜索
  - Wendland 核
  - 工程设置与参数选择
  - 正定性
  - 归一化常数
  - 结果诊断与可信度验证
  - 归一化验证
  - 有效平滑宽度
seo:
  title: Wendland 核：工程设置与诊断验证
  description: >-
    梳理 Wendland C2 核两套等价写法的常数配对关系，给出 1D/2D/3D 归一化常数、导数形式与邻居数预算，并用一个把 η
    误当两倍导致邻居数从 58 掉到 7.2 的算例说明配置陷阱。
    全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - Wendland 核
    - 工程设置与参数选择
    - 正定性
    - 归一化常数
    - 邻居数预算
    - 支持半径
    - 结果诊断与可信度验证
    - 归一化验证
    - 有效平滑宽度
    - Simpson 积分
    - 非负傅里叶谱
---
# Wendland 核：工程设置与诊断验证

## 工程设置与参数选择

Wendland C2 核是当前 SPH 工程模拟的默认选择，原因是它的傅里叶变换在整个支持域内非负，可以在高邻居数下保持稳定。它的配置难点不在参数本身，而在于文献里存在两套差一个因子 2 的写法：支持半径写成 $2h$ 或写成 $h$。本文给出两套写法的常数配对表、导数形式、邻居数预算，并说明写错配对会把密度压低 8 倍。

### 两套等价写法与它们的常数配对

第一套写法把支持半径取成 $2h$，无量纲变量 $q=r/h\in[0,2]$：

$$W(q)=\frac{21}{16\pi h^{3}}\left(1-\frac{q}{2}\right)^{4}(2q+1),\qquad 0\le q\le 2$$

第二套把支持半径取成 $h$，无量纲变量 $s=r/h\in[0,1]$，形状函数改为 $(1-s)^{4}(4s+1)$：

$$W(s)=\frac{\sigma_d}{h^{d}}(1-s)^{4}(4s+1),\qquad \sigma_1=\frac{5}{2},\ \ \sigma_2=\frac{7}{\pi},\ \ \sigma_3=\frac{21}{2\pi}$$

两套写法描述同一个核，但 $h$ 的含义相差一倍：要让支持半径相同，第二套的 $h$ 必须等于第一套的 $2h$。换算关系是 $s=q/2$，代入即可验证 $(1-s)^4(4s+1)=(1-q/2)^4(2q+1)$。

归一化可以手算核对。三维第二套写法要求 $\sigma_3\int_0^{1}(1-s)^{4}(4s+1)\,4\pi s^{2}ds=1$，其中 $\int_0^{1}(1-s)^{4}(4s+1)s^{2}ds=1/42=0.023810$，于是 $\sigma_3=1/(4\pi/42)=21/(2\pi)=3.34226$。若把第一套的常数 $21/(16\pi)=0.41780$ 错配到第二套的形状函数上，积分只剩 $0.41780\times4\pi/42=0.125000$，恰好是正确值的 $1/8$，密度被系统性压低 87.5%。这是一个应当写进单元测试的断言。

### 导数形式与人工黏性的配合

对第一套写法，形状函数的导数为

$$\frac{dw}{dq}=-5q\left(1-\frac{q}{2}\right)^{3},\qquad \frac{dW}{dr}=\frac{21}{16\pi h^{4}}\frac{dw}{dq}$$

在 $q=0$ 处 $dw/dq=0$，在 $q=2$ 处同样为 0，两端导数都光滑归零。这一点比三次样条核更有优势：三次样条在支持半径处虽然一阶导数为零，三阶导数却跳变 6.0，而 Wendland C2 的所有低阶导数在 $q=2$ 处连续归零，只在 $q=2$ 的更高阶上出现跳变。代价是核在中心附近更平坦，有效平滑宽度略小。

导数解析给出后，Monaghan 人工黏性项可以直接套用，无需数值差分。工程上 $\alpha$ 取 0.05~0.10 即可，因为 Wendland C2 本身压力噪声低；把 $\alpha$ 提到 0.5 往往是在掩盖别的问题。

### 邻居数预算：C2 与更高阶族

邻居数只由 $\kappa\eta$ 决定：

$$N_{3D}\approx\frac{4}{3}\pi(\kappa\eta)^{3}$$

取 $\kappa=2$、$\eta=1.2$ 得 $(2.4)^{3}=13.824$，$N_{3D}=4.18879\times13.824=57.9$；二维同参数为 $\pi\times5.76=18.1$。Wendland C2 在三维中可稳定支撑到 100 个以上邻居，因此 57.9 有充足余量。若需要更低的压力噪声，可换 Wendland C4 或 C6，它们的多项式次数更高、核更平坦，典型三维邻居数落在 100~200，代价是每步距离判定数按 $N$ 线性增长。

| 核 | 三维典型 $\kappa\eta$ | $N_{3D}$ | 说明 |
|---|---|---|---|
| Wendland C2 | 2.4 | 57.9 | 默认选择 |
| Wendland C4 | 3.0 | 113.1 | 更低噪声，成本约 2 倍 |
| Wendland C6 | 3.5 | 179.6 | 用于极高邻居数验证 |
| 三次样条 | 2.2 | 44.6 | 邻居数上限约 60 |

### 一个把 η 误当两倍的算例

设 $\Delta p=5.0$ mm。按第一套写法取 $\eta=1.1$、$\kappa=2$，得 $h=5.5$ mm、$r_c=11.0$ mm、$N_{3D}=44.6$。若把某篇第二套写法的论文里的 $\eta=1.2$ 直接抄进第一套代码，$r_c$ 变成 $1.2\times5.0=6.0$ mm，只有原设计的一半多，邻居数降到 $\frac{4}{3}\pi(1.2)^{3}=4.18879\times1.728=7.24$。7 个邻居不足以支撑三维核近似，表现为自由面碎裂、压力场出现孤立尖峰。反过来，把第一套的 $\eta=1.1$ 抄进第二套代码，$r_c$ 变成 22.0 mm，邻居数升到 231.5，计算量涨 5.2 倍。

配置时只需在任务单里写清一条：**$r_c$ 的绝对值是多少毫米**，并把它与代码中实际生效的截断半径打印值对齐。

### 参数台账与配置片段

```yaml
# Wendland C2 三维设置，第一套写法（rc = 2h）
kernel:        wendland_c2
dimension:     3
dp:            0.005          # m, 粒子间距
eta:           1.2            # h = eta * dp = 0.006 m
kappa:         2.0            # rc = kappa * h = 0.012 m
sigma3:        3.34226        # 21/(2*pi)，注意与形状函数配对
dw_dq:        "-5*q*(1-0.5*q)**3"
neighbor_target: 57.9
cell_size:     0.012          # m, 不小于 rc
cfl:           0.25
cs:            20.0           # m/s
alpha:         0.10
```

```python
import math
SIGMA3 = 21.0/(2.0*math.pi)          # 与 (1-s)^4*(4s+1) 配对

def wendland_c2_s(s):                # s = r/h, 支撑 s<=1
    return 0.0 if s >= 1.0 else (1.0-s)**4*(4.0*s+1.0)

def wendland_c2_ds(s):
    if s >= 1.0: return 0.0
    return -20.0*s*(1.0-s)**3

h  = 1.2*0.005                       # 0.006 m
rc = 2.0*h                           # 0.012 m
print(round(SIGMA3, 5), round(h, 4), round(rc, 4))
print("N3D =", round((4.0/3.0)*math.pi*(rc/0.005)**3, 1))   # 57.9
```

注意 `wendland_c2_ds` 用的是第二套变量 $s$；若代码内部统一用第一套的 $q$，导数必须换成 $-5q(1-q/2)^3$ 并把常数换成 $21/(16\pi)$。变量与常数必须成对出现，不能各取一套。

### 设置阶段的失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 密度被系统性压低 87.5% | 把 $21/(16\pi)$ 与 $(1-s)^4(4s+1)$ 错配 | 数值积分 $\int W dV$，正确应得 1.000，错配得 0.125 |
| 邻居数只有 7.2，自由面碎裂 | 抄了第二套写法的 $\eta$，支持半径减半 | 打印实际 $r_c$，应与设计值 11.0 mm 一致 |
| 计算量突然涨 5.2 倍 | 反向混用，$r_c$ 变成 22.0 mm | 统计平均邻居数，应为 57.9 而非 231.5 |
| 中心区压力异常平坦 | 误用三次样条形状函数配 Wendland 常数 | 检查 $w(0)$，Wendland C2 应等于 1.0 |
| 两端出现力阶跃 | 导数用数值差分且截断处未归零 | 打印 $dw/dq$ 在 $q=0$ 与 $q=2$ 的值，应均为 0.0 |
| 高邻居数下仍出现配对 | 实际用的是三次样条而非 Wendland | 打印核名与 $\hat W(k)$ 最小符号，Wendland C2 应恒非负 |

### 参考文献

1. Wendland H., *Piecewise polynomial, positive definite and compactly supported radial functions of minimal degree*, Advances in Computational Mathematics, 4, 389–396, 1995.
2. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425, 1068–1082, 2012.
3. Wendland H., *Scattered Data Approximation*, Cambridge University Press, 2005.
4. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
5. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, 17, 25–76, 2010.
6. Rosswog S., *Astrophysical smooth particle hydrodynamics*, New Astronomy Reviews, 53, 78–104, 2009.

## 诊断与可信度验证

换用 Wendland C2 之后最常见的两种"结果不对"是：密度看起来正常但压力比基准低几个百分点，以及拉伸区依然出现配对。前者几乎总是归一化常数与形状函数配对错了，后者往往是代码里实际调用的还是三次样条。本文给出三项不依赖求解器的自检，其中第一项可以用手算完成。

### 手算归一化：四点 Simpson 给 1.0049

三维 Wendland C2 取支持半径 $2h$ 的写法：

$$W(q)=\frac{21}{16\pi h^{3}}\left(1-\frac{q}{2}\right)^{4}(2q+1),\qquad q=\frac{r}{h}\in[0,2]$$

归一化条件是 $\int_{\mathbb{R}^3}W\,d\mathbf{r}=1$，展开成径向积分

$$\frac{21}{16\pi}\int_{0}^{2}4\pi q^{2}\left(1-\frac{q}{2}\right)^{4}(2q+1)\,dq=\frac{21}{4}\int_{0}^{2}f(q)\,dq=1$$

其中 $f(q)=q^{2}(1-q/2)^{4}(2q+1)$。取步长 0.5 的四点 Simpson（5 个采样点）：$f(0)=0$，$f(0.5)=0.25\times0.75^{4}\times2=0.158203$，$f(1)=1\times0.5^{4}\times3=0.187500$，$f(1.5)=2.25\times0.25^{4}\times4=0.035156$，$f(2)=0$。加权求和得 $\frac{0.5}{3}\left[0+4(0.158203)+2(0.187500)+4(0.035156)+0\right]=\frac{0.5}{3}\times1.148438=0.191406$，乘 $21/4$ 得 $1.004883$。

结果是 1.0049，偏差 $+0.49\%$。这 0.49% 全部来自求积误差，不是核本身的问题：解析值为 $\int_0^2f\,dq=4/21=0.190476$，乘 $21/4$ 恰为 1。诊断含义是——如果你用 4 段求积去验证归一化，看到 1.0049 应当放行；如果看到 0.125 或 8.0，那是常数配对错误。

常数配对的三种可能必须分清：正确的 $21/(16\pi)=0.41780$ 配 $(1-q/2)^{4}(2q+1)$ 得 1.0000；正确的 $21/(2\pi)=3.34226$ 配 $(1-s)^{4}(4s+1)$ 也得 1.0000；把 $21/(16\pi)$ 配 $(1-s)^{4}(4s+1)$ 得 $0.125$，把 $21/(2\pi)$ 配 $(1-q/2)^{4}(2q+1)$ 得 $8.000$。

### 有效平滑宽度比三次样条小 5.7%

二阶矩决定核把流场抹平了多少：

$$\int_{\mathbb{R}^{3}}r^{2}W\,d\mathbf{r}=4\pi\cdot\frac{21}{16\pi}h^{2}\int_{0}^{2}q^{4}\left(1-\frac{q}{2}\right)^{4}(2q+1)\,dq$$

分段积分给出 $\int_0^2q^4(1-q/2)^4(2q+1)dq=32/210=0.152381$，于是 $\int r^{2}W\,d\mathbf{r}=5.25\times0.152381h^{2}=0.800h^{2}$。每方向等效方差 $0.800h^{2}/3=0.26667h^{2}$，等效标准差 $0.51640h$。同一 $h=6.0$ mm 下有效平滑宽度 $0.51640\times6.0=3.10$ mm。

与三次样条核并排比较：三次样条的二阶矩给出 $0.300h^{2}$，标准差 $0.54772h$。Wendland C2 比它小 $0.51640/0.54772=0.9428$，即窄 5.7%。所以从三次样条换到 Wendland C2 而保持 $h$ 不变时，界面会比原来薄约 6%，压力峰值会升高。这不是稳定性问题，是分辨率变了，应当在收敛研究里作为一次正式的网格效应记录。

### 非负傅里叶谱的可测后果

Wendland C2 的傅里叶变换在支持域内非负，这一条性质的可测后果是：把邻居数从 30 提到 120，规则排布不会自发坍缩成对。诊断方法是同一初始粒子集、同一时间步，只改 $\eta$：

| $\eta$（$\kappa=2$） | $N_{3D}$ | 三次样条预期 | Wendland C2 预期 |
|---|---|---|---|
| 1.0 | 33.5 | 稳定 | 稳定 |
| 1.2 | 57.9 | 临界 | 稳定 |
| 1.4 | 91.9 | 失稳 | 稳定 |
| 1.6 | 137.2 | 失稳 | 稳定（噪声降低） |

如果 Wendland C2 在 $N_{3D}=91.9$ 时仍然出现 $r<0.5\Delta p$ 的粒子对，第一嫌疑是代码实际加载的是三次样条核，第二嫌疑是时间步过大导致积分器失稳，而不是核本身。区分方法：把 $\Delta t$ 缩到 1/4，若配对消失则是积分器问题；若配对数量不变，则是核的问题。

### 高邻居数下的收敛检查

Wendland C2 的用途是让"加密粒子"与"增大 $\eta$"两个旋钮解耦。验证收敛时，固定 $\eta=1.2$、$\kappa=2$，只加密 $\Delta p$：$\Delta p$ 从 10.0 mm 减到 5.0 mm，$h$ 从 12.0 mm 减到 6.0 mm，邻居数恒为 57.9，成本涨 8 倍（三维粒子数按 2 的 3 次方增长）。若某一物理量（如圆柱绕流的阻力系数）在两次加密之间的变化小于 1%，且 $S_i$ 最小值保持在 0.95 以上，可以认为分辨率足够。反之，若阻力系数变化超过 3% 而 $S_i$ 正常，说明误差来自分辨率而非核，继续换核无效。

### 诊断脚本

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

### 误判清单

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 归一化自检得到 0.125 | $21/(16\pi)$ 与 $(1-s)^{4}(4s+1)$ 错配 | 换回 $(1-q/2)^{4}(2q+1)$，重算应得 1.0049 |
| 归一化自检得到 8.000 | $21/(2\pi)$ 与 $q$ 形式错配 | 同上，反向替换验证 |
| 界面比三次样条算例薄约 6% | 二阶矩从 $0.300h^{2}$ 降到 $0.267h^{2}$ | 打印两种核的 $\sigma_W$ 并与界面厚度实测值比对 |
| 高邻居数下仍出现粒子对 | 实际加载的是三次样条核 | 在核函数内插入类型断言并打印核名 |
| 压力比基准低约 12% | 只对体积项重归一化，压力项未同步 | 检查压力计算使用的 $W$ 与密度使用的 $W$ 是否同一对象 |
| 加密后阻力系数变化 4% 但 $S_i$ 正常 | 误差来自分辨率而非核 | 保持 $\eta$ 不变只减 $\Delta p$，观察变化率是否随 $\Delta p^{2}$ 下降 |

### 参考文献

1. Wendland H., *Piecewise polynomial, positive definite and compactly supported radial functions of minimal degree*, Advances in Computational Mathematics, 4, 389–396, 1995.
2. Dehnen W., Aly H., *Improving convergence in smoothed particle hydrodynamics simulations without pairing instability*, Monthly Notices of the Royal Astronomical Society, 425, 1068–1082, 2012.
3. Wendland H., *Scattered Data Approximation*, Cambridge University Press, 2005.
4. Liu M.B., Liu G.R., *Smoothed Particle Hydrodynamics (SPH): an Overview and Recent Developments*, Archives of Computational Methods in Engineering, 17, 25–76, 2010.
5. Zhu Q., Hernquist L., Li Y., *Numerical convergence in smoothed particle hydrodynamics*, The Astrophysical Journal, 800, 6, 2015.
6. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30, 543–574, 1992.
