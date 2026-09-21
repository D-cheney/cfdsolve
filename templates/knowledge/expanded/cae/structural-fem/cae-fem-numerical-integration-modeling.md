---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-numerical-integration-modeling
title: "单元数值积分：物理建模与适用边界"
summary: "积分点数不是越多越好：Gauss 求积的精确次数是 $2n-1$，欠积分引入零能模式，过积分引入锁死。本文给出被积多项式次数的估算方法、一维到三维的点数选择，并用 $\\int_{-1}^{1}x^2dx=2/3$ 逐点核对。"
category:
  slug: structural-fem
  name: "结构与有限元算法"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "结构与有限元算法"
  - "单元数值积分"
  - "物理建模与适用边界"
  - "Gauss 求积"
  - "零能模式"
seo:
  title: "单元数值积分：物理建模与适用边界"
  description: "积分点数不是越多越好：Gauss 求积的精确次数是 2n-1，欠积分引入零能模式，过积分引入锁死。本文给出被积多项式次数的估算方法、一维到三维的点数选择，并用 ∫x²dx=2/3 逐点核对。"
  keywords:
    - "单元数值积分"
    - "物理建模与适用边界"
    - "Gauss 求积"
    - "减缩积分"
    - "零能模式"
---

# 单元数值积分：物理建模与适用边界

有限元里绝大多数积分都不是解析算出来的，而是用 Gauss 求积在若干点上加权求和。点数选少了刚度矩阵出现零能模式，选多了又把弯曲锁死，所以"积分阶"是一个必须按被积函数次数推导、而不是凭经验设大的量。本文给出从形函数次数推算所需点数的方法，说明一维、二维、三维单元的具体点数，并用一个可手算的多项式积分核对实现是否正确。

## Gauss 求积的精确次数

一维区间 $[-1,1]$ 上，$n$ 点 Gauss–Legendre 求积

$$
\int_{-1}^{1} f(\xi)\,d\xi\approx\sum_{i=1}^{n} w_i\,f(\xi_i)
$$

对次数不超过 $2n-1$ 的多项式精确成立。这个结论决定了选点规则：先用单元形函数次数估计被积函数的最高次，再反解所需 $n$。单元刚度被积式为 $\mathbf B^{T}\mathbf C\mathbf B\lvert\mathbf J\rvert$，其中 $\mathbf B$ 含形函数的一阶导数。$d$ 维 $p$ 次完全单元，$\mathbf B$ 的次数约为 $p-1$，被积次数约 $2(p-1)$；若单元畸变或材料变系数，$\lvert\mathbf J\rvert$ 还会再抬一次。

## 从被积次数到点数

一维二节点单元、常系数：被积为常数（0 次），$n=1$ 即精确。一维三节点（二次）单元：被积为 2 次，$n=2$ 精确（$2\times2-1=3\ge2$）。三维八节点六面体在规则网格上，$\mathbf B$ 为一次，被积最高 2 次，每个方向 2 点即可，即 $2\times2\times2=8$ 个 Gauss 点；二十节点六面体 $\mathbf B$ 为二次，被积最高 4 次，需每方向 3 点，即 $3\times3\times3=27$ 点。工程软件里 C3D20 的默认完全积分正是 27 点，而 C3D20R 用 $2\times2\times2=8$ 点，属减缩。

用一维例子核对实现：$\int_{-1}^{1}x^{2}\,dx=2/3=0.6667$。

$$
n=1:\ \xi_1=0,\ w_1=2\ \Rightarrow\ 2\times0^{2}=0\quad(\text{失败，}2>2\times1-1)
$$

$$
n=2:\ \xi_{1,2}=\pm0.577350,\ w_{1,2}=1\ \Rightarrow\ 0.5774^{2}+0.5774^{2}=0.6667\quad(\text{正确})
$$

这段核对说明：被积次数 2 用 1 点必然失败，用 2 点恰好精确。凡是积分结果与解析值不符，先做这种单点核对，再怀疑单元实现。

再把点数与单元刚度联系起来核对。取一维杆单元，$E=200\,\mathrm{GPa}$，$A=1.0\times10^{-4}\,\mathrm{m^{2}}$，单元长 $h=0.1\,\mathrm{m}$，则 $EA=2.0\times10^{7}\,\mathrm{N}$，单元刚度 $K^{e}=EA/h$ 的对角元为 $2.0\times10^{8}\,\mathrm{N/m}$、非对角元为 $-2.0\times10^{8}\,\mathrm{N/m}$。被积式 $\mathbf B^{T}EA\mathbf B\lvert\mathbf J\rvert$ 在常 $E$、$A$ 下为常数，1 点 Gauss 即精确。若把单元长缩到 $h=0.01\,\mathrm{m}$，刚度升到 $2.0\times10^{9}\,\mathrm{N/m}$，正好放大 10 倍，说明一维单元刚度与 $1/h$ 成正比，与 $1/h^{2}$ 无关。二维三节点三角形同理：单元面积 $A_e=5.0\times10^{-4}\,\mathrm{m^{2}}$、常应变矩阵 $\mathbf B$，刚度 $\mathbf K^{e}=A_e t\mathbf B^{T}\mathbf D\mathbf B$（$t=1.0\,\mathrm{mm}$ 为厚度），被积为常数，1 点（形心）积分精确。

## 欠积分与过积分的边界

减缩积分（比精确所需少一阶）消除剪切锁死，但会降低刚度矩阵的秩。8 节点六面体减缩到 1 点后，24 个自由度只剩 1 个积分点约束，出现 6 个沙漏零能模式；工程上用沙漏控制补足，并监测沙漏能占比。判定标准：沙漏能与总应变能之比超过 10% 说明点数不足或网格过粗。

过积分不会引入零能模式，但会把不可压缩约束逐点强制，产生体积锁死；同时提高计算成本。因此选点原则是"恰好精确，必要时减缩"，而不是"宁多勿少"。对于大变形、材料非线性问题，被积函数不再多项式，点数需额外增加，通常按经验加一阶。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 单元刚度矩阵奇异、位移出现沙漏 | 积分点数少于精确所需，秩亏 | 数单元零特征值个数，8 节点六面体应无零能模式（除刚体 6 个） |
| 结果对积分点数极敏感 | 被积次数估计错误 | 用单点核对 $\int x^{2}dx$ 类的多项式积分 |
| 加密网格后能量不收敛 | 畸变单元使 $\lvert\mathbf J\rvert$ 次数升高 | 检查单元 Jacobian 变化范围，控制在 5:1 以内 |
| 近不可压缩材料偏刚 | 完全积分体积锁死 | 换减缩/选择积分后比较变形 |
| 质量矩阵出现负对角元 | 质量积分用减缩且集中化不当 | 检查集中质量矩阵是否为正 |
| 谐响应高频段失真 | 一致质量矩阵积分阶不足 | 与解析模态频率对比 |

## Gauss 点生成与核对脚本

下面用 Python 生成任意阶 Gauss–Legendre 点并完成 $x^{2}$ 的核对，可直接用来验证自研单元：

```python
import numpy as np
from numpy.polynomial.legendre import leggauss

for n in (1, 2, 3):
    xi, w = leggauss(n)
    val = np.sum(w * xi**2)          # 数值积分 x^2
    print(n, xi.round(6), w, val)     # n=2 应输出 0.666667
# 三维 8 节点六面体完全积分 = 2x2x2
xi, w = leggauss(2)
pts = [(a, b, c) for a in xi for b in xi for c in xi]
print(len(pts))                       # 8
```

## 参考文献

1. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
2. Hughes, T.J.R. *The Finite Element Method: Linear Static and Dynamic Finite Element Analysis*. Dover, 2000.
3. Zienkiewicz, O.C., Taylor, R.L., Zhu, J.Z. *The Finite Element Method: Its Basis and Fundamentals*, 7th ed. Butterworth-Heinemann, 2013.
4. Stroud, A.H., Secrest, D. *Gaussian Quadrature Formulas*. Prentice Hall, 1966.
5. Flanagan, D.P., Belytschko, T. "A uniform strain hexahedron and quadrilateral with orthogonal hourglass control." *International Journal for Numerical Methods in Engineering*, 17(5), 679–706, 1981.
6. Cook, R.D., Malkus, D.S., Plesha, M.E., Witt, R.J. *Concepts and Applications of Finite Element Analysis*, 4th ed. Wiley, 2002.
