---
template_version: flowlab-knowledge/1.0
slug: meshfree-foundation-consistency-modeling
title: 一致性与收敛：原理与诊断验证
summary: >-
  把一致性拆成核近似截断项与粒子求积误差两部分，给出三次样条核二阶矩 sigma^2=h^2/6
  的手算、规则点阵与无序粒子的阶数对照，以及用加密序列判定收敛阶的可复现流程。
  全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: meshfree-foundations
  name: 无网格法 · 方法与验证
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - MESHFREE
  - 无网格法 · 方法与验证
  - 一致性与收敛
  - 离散原理与适用边界
  - 核近似截断误差
  - 收敛阶
  - 结果诊断与可信度验证
  - Richardson 外推
  - 网格收敛指数
seo:
  title: 一致性与收敛：原理与诊断验证
  description: >-
    把一致性拆成核近似截断项与粒子求积误差两部分，给出三次样条核二阶矩 sigma^2=h^2/6
    的手算、规则点阵与无序粒子的阶数对照，以及用加密序列判定收敛阶的可复现流程。
    全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 一致性与收敛
    - 离散原理与适用边界
    - 核近似截断误差
    - 收敛阶
    - MESHFREE
    - 结果诊断与可信度验证
    - Richardson 外推
    - 网格收敛指数
---
# 一致性与收敛：原理与诊断验证

## 原理与适用范围

一致性回答的是"把 $h$ 缩小一半，离散算子与连续算子的差是否按 $2^{p}$ 缩小"；收敛回答的是"目标量本身是否随 $h$ 趋向同一个极限"。两者不等价：一致的格式可以因为自由面缺损或粒子无序而不收敛，看起来收敛的算例也可能只是各项误差恰好抵消。下面把 SPH 的离散误差拆成核近似截断项与粒子求积误差两部分，给出可手算的系数，并说明怎样用加密序列把阶数测出来。

### 一致性由截断误差的幂次定义

设 $L$ 是连续算子，$L_h$ 是它在粒子上的离散对应。若对足够光滑的场 $f$ 存在与 $h$ 无关的常数 $C$，使

$$
\|L_h f - L f\|_{\infty} \le C h^{p}, \qquad h \to 0, \quad \frac{h}{\Delta x} = \text{const}
$$

则称格式具有 $p$ 阶一致性。式中的"$h/\Delta x$ 固定"是定义的一部分而不是实现细节：只缩 $\Delta x$ 而保持 $h$ 不变，测到的既不是旧格式的阶数，也不是新格式的阶数。SPH 的 $L_h$ 由两步串联——核近似把点值换成支撑域内的加权积分，粒子求和再把积分换成有限和——两步误差量级不同，必须分开评估。

### 核近似的二阶矩决定主截断项

把 $f(\mathbf{x}')$ 在 $\mathbf{x}$ 处做 Taylor 展开，一阶项因 $\int \mathbf{x}'W\,\mathrm{d}\mathbf{x}'=\mathbf{0}$ 而消失，剩下

$$
\langle f \rangle(\mathbf{x}) = \int_{\Omega} f(\mathbf{x}') W(\mathbf{x}-\mathbf{x}',h)\,\mathrm{d}\mathbf{x}' = f(\mathbf{x}) + \frac{\sigma^{2}}{2}\nabla^{2} f(\mathbf{x}) + O(h^{4}), \qquad \sigma^{2}=\int |\mathbf{x}'|^{2} W\,\mathrm{d}\mathbf{x}'
$$

$\sigma^{2}$ 是核的二阶矩，它把核的形状与误差系数直接绑定。一维三次样条核可以手算：写成 $W=(2/3h)f(q)$、$q=|x|/h$，则 $\sigma^{2}=h^{2}\frac{2}{3}\int_{0}^{2}q^{2}f(q)\,\mathrm{d}q$，其中

$$
\int_{0}^{1}\left(q^{2}-1.5q^{4}+0.75q^{5}\right)\mathrm{d}q = 0.15833, \qquad \int_{1}^{2} 0.25\,q^{2}(2-q)^{3}\,\mathrm{d}q = 0.09167
$$

两项之和为 $0.25$，于是 $\sigma^{2}=h^{2}/6\approx0.1667h^{2}$，主截断项为 $\sigma^{2}\nabla^{2}f/2\approx0.0833h^{2}\nabla^{2}f$。取 $h=0.012\ \text{m}$、$\Delta x=0.010\ \text{m}$，该系数为 $1.20\times10^{-5}\ \text{m}^{2}$，比 $h^{2}=1.44\times10^{-4}\ \text{m}^{2}$ 小 8.3%。

这一步的工程含义很直接：核近似本身是二阶一致的，$h$ 从 $0.024\ \text{m}$ 减到 $0.012\ \text{m}$ 时积分近似误差应降到 $1/4$。若实测只降到 $1/2$，问题必定出在粒子求和或边界，而不是核函数本身——此时换核纯属浪费。

### 粒子求积把二阶拉回一阶

把积分换成 $\sum_j V_j f_j W_{ij}$ 会引入求积误差 $E_{\text{quad}}$：

$$
\sum_j V_j f_j W_{ij} = f_i + \frac{\sigma^{2}}{2}\nabla^{2} f_i + E_{\text{quad}}, \qquad E_{\text{quad}} = \begin{cases} O(\Delta x^{2}), & \text{规则点阵} \\ O(\Delta x), & \text{无序分布} \end{cases}
$$

规则点阵上 $W$ 的对称性使一阶矩 $\sum_j V_j(\mathbf{x}_j-\mathbf{x}_i)W_{ij}$ 逐项抵消，求积误差与核偏差同为二阶；粒子位置一旦随机抖动，一阶矩不再为零而是一个量级为 $\Delta x^{d/2}$ 的随机量，误差退化为 $O(\Delta x)$。这正是 Quinlan 等（2006）所说的"无序破坏一致性"：把粒子摆整齐不是审美问题，而是精度问题。

以 $L=1\ \text{m}$ 的一维域为例，$\Delta x=0.010\ \text{m}$ 给出 $N=100$ 个粒子，$h=1.2\Delta x=0.012\ \text{m}$，支持半径 $r_c=2h=0.024\ \text{m}$，内部粒子单侧有 $r_c/\Delta x=2.4$ 个邻居，全支持域约 5 个。这个邻居数在一维够用，但同样的 $h/\Delta x$ 放到三维只有约 58 个，精度与稳定性余量都更紧。

### 收敛阶必须用加密序列测

判断一致性是否真的成立，最直接的办法是算一系列 $\Delta x$ 并拟合阶数：

$$
p = \frac{\ln(e_1/e_2)}{\ln(\Delta x_1/\Delta x_2)}
$$

两组对照数据说明问题。规则点阵下 $L_2$ 误差随 $\Delta x=0.040,0.020,0.010,0.005\ \text{m}$ 依次为 $6.7\times10^{-2},1.7\times10^{-2},4.2\times10^{-3},1.05\times10^{-3}$，相邻阶数 $1.98,2.02,2.00$；把同一算例的初始位置加上 $0.3\Delta x$ 的均匀随机抖动后，误差变为 $8.1\times10^{-2},4.1\times10^{-2},2.05\times10^{-2},1.02\times10^{-2}$，阶数掉到 $0.98,1.00,1.01$。两组唯一的差别就是粒子分布。

```python
import math

def order(e, dx):
    return [math.log(e[k] / e[k + 1]) / math.log(dx[k] / dx[k + 1])
            for k in range(len(e) - 1)]

dx   = [0.040, 0.020, 0.010, 0.005]           # m
e_rg = [6.7e-2, 1.7e-2, 4.2e-3, 1.05e-3]      # 规则点阵
e_ds = [8.1e-2, 4.1e-2, 2.05e-2, 1.02e-2]     # 位置抖动 0.3*dx
print(order(e_rg, dx))    # [1.98, 2.02, 2.00]
print(order(e_ds, dx))    # [0.98, 1.00, 1.01]
```

### 自由面是一致性最先失守的位置

支撑域被边界切断后，归一化条件 $\sum_j V_j W_{ij}=1$ 不再自动成立。记 $S_i=\sum_j V_j W_{ij}$，用一维三次样条核、$h=1.2\Delta x$ 手算：内部粒子的邻居距离为 $0,\pm\Delta x,\pm2\Delta x$，对应 $q=0,0.8333,1.6667$，$W$ 值分别为 $0.6667/h$、$0.2616/h$、$0.00617/h$，求和为 $1.2022/h$，乘 $V_j=\Delta x=0.8333h$ 得 $S_i\approx1.0018$。自由面粒子只剩一侧三个邻居，求和为 $0.9346/h$，$S_i\approx0.779$，比内部低 22%。

这 22% 的缺失直接表现为表面密度亏损和虚假表面张力，也解释了"内部二阶、表面一阶"为何是自由面 SPH 的典型收敛行为。判定方法是沿壁面法向画 $S_i$ 剖面：内部应落在 $[0.99,1.01]$，表面若低于 $0.95$ 就必须引入边界粒子层或核修正。

### 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 加密后 $L_2$ 误差不降 | 只缩 $\Delta x$ 未缩 $h$，有效分辨率没变 | 固定 $h/\Delta x=1.2$，比较 $\Delta x$ 减半前后的误差 |
| 阶数停在 0.9~1.0 | 粒子无序使求积误差退化为 $O(\Delta x)$ | 换成规则点阵重跑同一算例，看阶数是否回到 2 |
| 常数场出现虚假梯度 | 用 $\sum_j V_j A_j\nabla_i W_{ij}$ 而非差值形式 | 令 $A\equiv\text{const}$，检查 $\max|\nabla A|$ 是否低于 $10^{-12}$ |
| 内部正常、表面偏低 | 自由面核截断使 $S_i\approx0.78$ | 沿法向绘制 $S_i$，检查表面值是否低于 0.95 |
| 时间步减半结果仍漂移 | 空间一致性不足，时间误差掩盖了它 | 按 $\Delta t\propto\Delta x$ 做空间时间联合加密 |

### 参考文献

1. Monaghan J.J., *Smoothed Particle Hydrodynamics*, Annual Review of Astronomy and Astrophysics, 30: 543-574, 1992.
2. Quinlan N.J., Basa M., Lastiwka M., *Truncation error in mesh-free particle methods*, International Journal for Numerical Methods in Engineering, 66(13): 2064-2085, 2006.
3. Liu G.R., Liu M.B., *Smoothed Particle Hydrodynamics: A Meshfree Particle Method*, World Scientific, 2003.
4. Belytschko T., Krongauz Y., Organ D., Fleming M., Krysl P., *Meshless methods: An overview and recent developments*, Computer Methods in Applied Mechanics and Engineering, 139: 3-47, 1996.
5. Dilts G.A., *Moving-least-squares-particle hydrodynamics I: Consistency and stability*, International Journal for Numerical Methods in Engineering, 44(8): 1115-1155, 1999.
6. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.

## 诊断与可信度验证

验收一个无网格解的可信度，靠的不是"残差曲线看起来平了"，而是三件事：误差随分辨率的单调收敛、由加密序列外推出的极限值、以及外推值与解析解或基准数据的差额。三者齐备才能给出量化区间；缺任一项，报告里的有效数字就只是打印精度。下面给出可照抄的诊断流程与两次完整手算。

### 诊断链从"换一套分辨率能否复现"开始

最省事的证伪手段是只改分辨率、其余一切不动，看目标量是否朝同一方向单调逼近。若 $\Delta x$ 从 $0.02\ \text{m}$ 减到 $0.01\ \text{m}$ 时目标量反而跳了 $3\%$，那么后续所有"调参改善"都不必谈，先查粒子分布、自由面处理和时间步。

需要固定的量：核函数、$h/\Delta x$、边界粒子层数、$\Delta t/\Delta x$、初始粒子排布方式。任何一项跟着分辨率一起变，测到的就是混合效应。诊断记录里至少要留三套网格的粒子数、平均邻居数、$h$ 值、时间步与目标量。

### 用制造解把误差变成可测的数

有解析解时用解析解，没有时用制造解（MMS）：先选一个光滑函数作为精确解，把它代回控制方程算出源项，再把源项加进求解器。取

$$
u(x,t)=\sin\!\left(\frac{2\pi x}{L}\right)\cos\!\left(\frac{2\pi t}{T}\right), \qquad L=1.0\ \text{m},\ T=1.0\ \text{s},\ \nu=1.0\times10^{-6}\ \text{m}^{2}/\text{s}
$$

源项为 $S=\partial_t u-\nu\,\partial_{xx}u$，量纲为 $\text{s}^{-1}$。这样得到的误差里没有模型误差，只剩离散误差，才能拿来判阶。若 MMS 测到二阶、而工程算例只有一阶，差异必然来自边界或自由面，不是格式本身。

### Richardson 外推与 GCI 给出量化区间

设三套分辨率满足 $\Delta x_2=\Delta x_1/2$、$\Delta x_3=\Delta x_2/2$，加密比 $r=2$。观测阶数与外推值为

$$
p = \frac{1}{\ln r}\left|\ln\left|\frac{f_3-f_2}{f_2-f_1}\right|\right|, \qquad f_{\text{ext}} = f_3 + \frac{f_3-f_2}{r^{p}-1}
$$

再用 Roache 的网格收敛指数给出不确定度带：

$$
\text{GCI}_{32} = F_s\,\frac{\left|(f_3-f_2)/f_3\right|}{r^{p}-1}, \qquad F_s = 1.25
$$

$F_s=1.25$ 用于三套及以上网格；只有两套网格时习惯取 $F_s=3$。手算一次：某二维算例的断面平均速度在 $\Delta x=0.04,0.02,0.01\ \text{m}$ 下为 $f_1=0.862$、$f_2=0.851$、$f_3=0.8483\ \text{m/s}$，则 $|f_3-f_2|=2.70\times10^{-3}$、$|f_2-f_1|=1.10\times10^{-2}$，比值 $0.2455$，$\ln 0.2455=-1.4046$，除以 $\ln 2=0.6931$ 得 $p=2.03$。外推 $f_{\text{ext}}=0.8483-2.70\times10^{-3}/(2^{2.03}-1)=0.8483-8.75\times10^{-4}=0.84742\ \text{m/s}$，而 GCI $=1.25\times(2.70\times10^{-3}/0.8483)/3.084=1.29\times10^{-3}$，即 0.13%。

结论应写成"$0.8474\ \text{m/s}$，离散不确定度 0.13%"，而不是把 $f_3$ 的六位数字照抄。若 $p$ 算出来是负数或非整数且远离预期阶，说明解在加密过程中非单调，GCI 公式的前提不成立，此时要回到误差-分辨率曲线本身。

### 把时间误差与空间误差分开

无网格法常把 $\Delta t$ 与 $\Delta x$ 绑定成 $\Delta t\propto\Delta x$，一旦结果不对，无法判断是空间还是时间。分离办法是固定 $\Delta x$，只把 $\Delta t$ 减半再减半：某溃坝算例在 $\Delta x=0.01\ \text{m}$ 下，$\Delta t=5.7\times10^{-5}\ \text{s}$ 与 $2.85\times10^{-5}\ \text{s}$ 的最大爬高相差 $0.04\%$，说明时间误差已可忽略；若相差超过 $1\%$，则应先修时间积分或重新核算 CFL 系数，再谈空间精度。

```python
def richardson(f1, f2, f3, r=2.0, Fs=1.25):
    import math
    p   = abs(math.log(abs((f3 - f2) / (f2 - f1)))) / math.log(r)
    fex = f3 + (f3 - f2) / (r ** p - 1.0)
    gci = Fs * abs((f3 - f2) / f3) / (r ** p - 1.0)
    return p, fex, gci

p, fex, gci = richardson(0.862, 0.851, 0.8483)
print(f"p={p:.2f}  f_ext={fex:.5f} m/s  GCI={gci*100:.2f}%")
# p=2.03  f_ext=0.84742 m/s  GCI=0.13%
```

### 两个可对照的基准算例

**平面 Poiseuille 流**：半宽 $H=0.05\ \text{m}$、$\nu=1.0\times10^{-6}\ \text{m}^{2}/\text{s}$、$\rho=1000\ \text{kg/m}^{3}$，驱动压力梯度 $\mathrm{d}p/\mathrm{d}x=-0.12\ \text{Pa/m}$。解析最大流速

$$
u_{\max}=\frac{H^{2}}{2\mu}\left|\frac{\mathrm{d}p}{\mathrm{d}x}\right| = \frac{(0.05)^{2}\times0.12}{2\times1.0\times10^{-3}} = 0.15\ \text{m/s}
$$

用 $H=0.05\ \text{m}$、每侧 $10$ 层粒子（$\Delta x=0.005\ \text{m}$）算得的中心线速度应落在 $0.148\sim0.152\ \text{m/s}$，超出即说明壁面黏性或边界粒子层数有问题。该算例的优势是解光滑、无自由面，专门用来单独检验一致性和壁面处理。

**Taylor-Green 涡**：$u=-U\cos(2\pi x/L)\sin(2\pi y/L)$、$v=U\sin(2\pi x/L)\cos(2\pi y/L)$，取 $U=1.0\ \text{m/s}$、$L=1.0\ \text{m}$、$\nu=0.01\ \text{m}^{2}/\text{s}$，动能按 $e^{-2\nu k^{2}t}$ 衰减，$k=2\pi/L=6.283\ \text{rad/m}$，衰减率 $2\nu k^{2}=0.790\ \text{s}^{-1}$。$t=1.0\ \text{s}$ 时动能应剩 $e^{-0.790}=0.454$。这个算例对压力噪声和粒子无序最敏感：同一分辨率下，规则点阵与 $0.3\Delta x$ 抖动点阵的 $t=1\ \text{s}$ 动能保留率若相差超过 $2\%$，就是分布问题而非格式问题。

### 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 三套分辨率误差几乎重合 | 实际粒子数没变，只是换了文件名 | 打印每套的粒子数、平均邻居数与 $h$ |
| 观测阶为负或跳动 | 解在加密时非单调，GCI 前提不成立 | 画误差-分辨率曲线，检查单调性与符号 |
| GCI 仅 0.1% 但与实验差 5% | 模型误差主导，与离散无关 | 固定分辨率只换闭合关系或边界条件，看差额是否保留 |
| 加密后压力噪声反而变大 | 粒子无序度随加密上升 | 记录 $\sigma_N/N_{\text{mean}}$ 与 $h/\Delta x$ 的实际值 |
| 时间步减半结果变化超 1% | 时间积分误差主导 | 固定 $\Delta x$ 只减 $\Delta t$，比较目标量 |

### 参考文献

1. Roache P.J., *Perspective: A method for uniform reporting of grid refinement studies*, Journal of Fluids Engineering, 116(3): 405-413, 1994.
2. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E., *Procedure for estimation and reporting of uncertainty due to discretization in CFD applications*, Journal of Fluids Engineering, 130(7): 078001, 2008.
3. Richardson L.F., *The approximate arithmetical solution by finite differences of physical problems*, Philosophical Transactions of the Royal Society A, 210: 307-357, 1911.
4. Monaghan J.J., *Smoothed Particle Hydrodynamics and Its Diverse Applications*, Annual Review of Fluid Mechanics, 44: 323-346, 2012.
5. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Liu M.B., Liu G.R., *Smoothed particle hydrodynamics (SPH): an overview and recent developments*, Archives of Computational Methods in Engineering, 17: 25-76, 2010.
