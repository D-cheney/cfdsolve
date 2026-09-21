---
template_version: "flowlab-knowledge/1.0"
slug: meshfree-foundation-consistency-diagnosis-validation
title: "一致性与收敛：结果诊断与可信度验证"
summary: "给出无网格解的收敛性验收流程：制造解、加密序列、Richardson 外推与 GCI 计算，并把时间积分误差与空间离散误差分离，配 Poiseuille 与 Taylor-Green 两个可对照的基准。"
category:
  slug: meshfree-foundations
  name: "无网格法 · 方法与验证"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "MESHFREE"
  - "无网格法 · 方法与验证"
  - "一致性与收敛"
  - "结果诊断与可信度验证"
  - "Richardson 外推"
  - "网格收敛指数"
seo:
  title: "一致性与收敛：结果诊断与可信度验证"
  description: "给出无网格解的收敛性验收流程：制造解、加密序列、Richardson 外推与 GCI 计算，并把时间积分误差与空间离散误差分离，配 Poiseuille 与 Taylor-Green 两个可对照的基准。"
  keywords:
    - "一致性与收敛"
    - "结果诊断与可信度验证"
    - "Richardson 外推"
    - "网格收敛指数"
    - "MESHFREE"
---

# 一致性与收敛：结果诊断与可信度验证

验收一个无网格解的可信度，靠的不是"残差曲线看起来平了"，而是三件事：误差随分辨率的单调收敛、由加密序列外推出的极限值、以及外推值与解析解或基准数据的差额。三者齐备才能给出量化区间；缺任一项，报告里的有效数字就只是打印精度。下面给出可照抄的诊断流程与两次完整手算。

## 诊断链从"换一套分辨率能否复现"开始

最省事的证伪手段是只改分辨率、其余一切不动，看目标量是否朝同一方向单调逼近。若 $\Delta x$ 从 $0.02\ \text{m}$ 减到 $0.01\ \text{m}$ 时目标量反而跳了 $3\%$，那么后续所有"调参改善"都不必谈，先查粒子分布、自由面处理和时间步。

需要固定的量：核函数、$h/\Delta x$、边界粒子层数、$\Delta t/\Delta x$、初始粒子排布方式。任何一项跟着分辨率一起变，测到的就是混合效应。诊断记录里至少要留三套网格的粒子数、平均邻居数、$h$ 值、时间步与目标量。

## 用制造解把误差变成可测的数

有解析解时用解析解，没有时用制造解（MMS）：先选一个光滑函数作为精确解，把它代回控制方程算出源项，再把源项加进求解器。取

$$
u(x,t)=\sin\!\left(\frac{2\pi x}{L}\right)\cos\!\left(\frac{2\pi t}{T}\right), \qquad L=1.0\ \text{m},\ T=1.0\ \text{s},\ \nu=1.0\times10^{-6}\ \text{m}^{2}/\text{s}
$$

源项为 $S=\partial_t u-\nu\,\partial_{xx}u$，量纲为 $\text{s}^{-1}$。这样得到的误差里没有模型误差，只剩离散误差，才能拿来判阶。若 MMS 测到二阶、而工程算例只有一阶，差异必然来自边界或自由面，不是格式本身。

## Richardson 外推与 GCI 给出量化区间

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

## 把时间误差与空间误差分开

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

## 两个可对照的基准算例

**平面 Poiseuille 流**：半宽 $H=0.05\ \text{m}$、$\nu=1.0\times10^{-6}\ \text{m}^{2}/\text{s}$、$\rho=1000\ \text{kg/m}^{3}$，驱动压力梯度 $\mathrm{d}p/\mathrm{d}x=-0.12\ \text{Pa/m}$。解析最大流速

$$
u_{\max}=\frac{H^{2}}{2\mu}\left|\frac{\mathrm{d}p}{\mathrm{d}x}\right| = \frac{(0.05)^{2}\times0.12}{2\times1.0\times10^{-3}} = 0.15\ \text{m/s}
$$

用 $H=0.05\ \text{m}$、每侧 $10$ 层粒子（$\Delta x=0.005\ \text{m}$）算得的中心线速度应落在 $0.148\sim0.152\ \text{m/s}$，超出即说明壁面黏性或边界粒子层数有问题。该算例的优势是解光滑、无自由面，专门用来单独检验一致性和壁面处理。

**Taylor-Green 涡**：$u=-U\cos(2\pi x/L)\sin(2\pi y/L)$、$v=U\sin(2\pi x/L)\cos(2\pi y/L)$，取 $U=1.0\ \text{m/s}$、$L=1.0\ \text{m}$、$\nu=0.01\ \text{m}^{2}/\text{s}$，动能按 $e^{-2\nu k^{2}t}$ 衰减，$k=2\pi/L=6.283\ \text{rad/m}$，衰减率 $2\nu k^{2}=0.790\ \text{s}^{-1}$。$t=1.0\ \text{s}$ 时动能应剩 $e^{-0.790}=0.454$。这个算例对压力噪声和粒子无序最敏感：同一分辨率下，规则点阵与 $0.3\Delta x$ 抖动点阵的 $t=1\ \text{s}$ 动能保留率若相差超过 $2\%$，就是分布问题而非格式问题。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 三套分辨率误差几乎重合 | 实际粒子数没变，只是换了文件名 | 打印每套的粒子数、平均邻居数与 $h$ |
| 观测阶为负或跳动 | 解在加密时非单调，GCI 前提不成立 | 画误差-分辨率曲线，检查单调性与符号 |
| GCI 仅 0.1% 但与实验差 5% | 模型误差主导，与离散无关 | 固定分辨率只换闭合关系或边界条件，看差额是否保留 |
| 加密后压力噪声反而变大 | 粒子无序度随加密上升 | 记录 $\sigma_N/N_{\text{mean}}$ 与 $h/\Delta x$ 的实际值 |
| 时间步减半结果变化超 1% | 时间积分误差主导 | 固定 $\Delta x$ 只减 $\Delta t$，比较目标量 |

## 参考文献

1. Roache P.J., *Perspective: A method for uniform reporting of grid refinement studies*, Journal of Fluids Engineering, 116(3): 405-413, 1994.
2. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E., *Procedure for estimation and reporting of uncertainty due to discretization in CFD applications*, Journal of Fluids Engineering, 130(7): 078001, 2008.
3. Richardson L.F., *The approximate arithmetical solution by finite differences of physical problems*, Philosophical Transactions of the Royal Society A, 210: 307-357, 1911.
4. Monaghan J.J., *Smoothed Particle Hydrodynamics and Its Diverse Applications*, Annual Review of Fluid Mechanics, 44: 323-346, 2012.
5. Violeau D., *Fluid Mechanics and the SPH Method: Theory and Applications*, Oxford University Press, 2012.
6. Liu M.B., Liu G.R., *Smoothed particle hydrodynamics (SPH): an overview and recent developments*, Archives of Computational Methods in Engineering, 17: 25-76, 2010.
