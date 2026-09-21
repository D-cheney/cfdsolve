---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-mesh-convergence-modeling
title: "结构网格收敛：物理建模与适用边界"
summary: "网格收敛的边界是误差是否进入渐近区。本文给出误差幂律 $e=Ch^{p}$、Richardson 外推与 GCI 指标，用三套网格数据（100.0/109.0/111.25）反算收敛阶 $p=2.0$、外推真值 112.0 与 3.75% 的网格不确定度，并区分光滑解与奇异点的收敛行为。"
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
  - "结构网格收敛"
  - "物理建模与适用边界"
  - "Richardson 外推"
  - "GCI"
seo:
  title: "结构网格收敛：物理建模与适用边界"
  description: "网格收敛的边界是误差是否进入渐近区。本文给出误差幂律 e=Ch^p、Richardson 外推与 GCI 指标，用三套网格数据（100.0/109.0/111.25）反算收敛阶 p=2.0、外推真值 112.0 与 3.75% 的网格不确定度，并区分光滑解与奇异点的收敛行为。"
  keywords:
    - "结构网格收敛"
    - "物理建模与适用边界"
    - "Richardson 外推"
    - "GCI"
    - "收敛阶"
---

# 结构网格收敛：物理建模与适用边界

网格收敛不是一个"加密到结果不变"的定性动作，而是用三套网格反算收敛阶、外推真值并给出不确定度的定量过程。关键前提是误差已进入渐近区：如果解还在奇异点或过渡区，加密只会得到不规则跳动。本文给出误差幂律、Richardson 外推与网格收敛指标（GCI）的形式，用一个可手算的三网格算例得到收敛阶 2.0 与 3.75% 的不确定度，并说明奇异点为何让收敛阶坍塌。

## 误差幂律与渐近区

对足够光滑的解与均匀加密，有限元误差满足

$$
e(h)=\lVert u-u_h\rVert=C\,h^{p}
$$

$h$ 是网格特征尺寸，$p$ 是收敛阶。线性单元在能量范数下 $p\approx1$，二次单元 $p\approx2$；位移范数通常高一阶。判据是：只有当三套网格的目标量单调趋近、且反算出的 $p$ 稳定在理论值附近，才认为进入渐近区。若 $p$ 在 0 附近或为负，说明存在奇异、网格质量差或目标量本身不收敛。

用加密比 $r$（相邻网格的尺寸比，均匀加密取 $r=2$）与三套网格的目标量 $f_1$（粗）、$f_2$（中）、$f_3$（细），收敛阶由相邻差值之比估计：

$$
p=\frac{\ln\left(\dfrac{f_2-f_1}{f_3-f_2}\right)}{\ln r}
$$

Richardson 外推给出真值估计，GCI 给出以百分比表示的网格不确定度：

$$
f_{ext}=f_3+\frac{f_3-f_2}{r^{p}-1},\qquad \mathrm{GCI}_{23}=\frac{F_s}{r^{p}-1}\left|\frac{f_2-f_1}{f_1}\right|
$$

$F_s$ 是安全因子，三网格研究取 1.25。

## 一次可核对的三网格计算

某结构峰值应力在三套网格上为 $f_1=100.0\,\mathrm{MPa}$（$h=4\,\mathrm{mm}$）、$f_2=109.0\,\mathrm{MPa}$（$h=2\,\mathrm{mm}$）、$f_3=111.25\,\mathrm{MPa}$（$h=1\,\mathrm{mm}$），加密比 $r=2$。收敛阶

$$
p=\frac{\ln\left(\dfrac{109.0-100.0}{111.25-109.0}\right)}{\ln 2}=\frac{\ln\left(\dfrac{9.0}{2.25}\right)}{\ln 2}=\frac{\ln 4}{\ln 2}=2.0
$$

$p=2.0$ 与二次单元的理论阶一致，说明已进入渐近区。外推真值

$$
f_{ext}=111.25+\frac{111.25-109.0}{2^{2}-1}=111.25+\frac{2.25}{3}=112.0\,\mathrm{MPa}
$$

网格不确定度

$$
\mathrm{GCI}_{23}=\frac{1.25}{2^{2}-1}\times\left|\frac{109.0-100.0}{100.0}\right|=\frac{1.25}{3}\times0.09=0.0375=3.75\%
$$

结论：最细网格的峰值应力 111.25 MPa 相对外推真值 112.0 MPa 偏低 0.67%，网格不确定度为 3.75%。若工程容差是 5%，这个网格已可接受；若要求 2%，则需再加密一级或改用 $p$ 型提升。这套计算把"网格够不够"变成可报告的数字，而不是主观判断。

## 奇异点与应力恢复

应力奇异来自几何或载荷的数学不连续：凹角、裂纹尖端、点载荷作用点、材料界面端点。在奇异点附近，位移仍收敛，但应力不收敛——理论上应力趋于无穷，反算出的 $p$ 会降到 0.5 以下甚至为负，GCI 失去意义。此时正确的做法不是继续加密，而是：改用积分量（如沿路径的合力、J 积分、能量）作为目标量；或按结构力学方法对峰值做外推；或把尖锐角改为有限半径圆角，消除奇异。

单元应力是积分点上的值，节点应力由积分点外推或平均得到。跨材料界面的节点不应直接平均，否则会抹平真实的应力跳跃；应分别输出各侧材料的结果。误差估计可用 Zienkiewicz–Zhu 的恢复法：由超收敛积分点应力恢复光滑场，与有限元应力之差给出单元误差指示，用于自适应加密。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 加密后应力持续增大不收敛 | 落在应力奇异点 | 改看积分量或给尖角加圆角后复算 |
| 三网格反算 $p$ 为负或接近 0 | 未进入渐近区或目标量非光滑 | 检查目标量是否在奇异点，换积分量 |
| GCI 大于工程容差 | 网格不足 | 按 $r^{p}$ 关系估算所需网格量级 |
| 不同加密比给出不同 $p$ | 非均匀加密或网格质量变化 | 改用均匀加密并控制单元长宽比 |
| 节点应力出现非物理跳跃 | 跨材料界面直接平均 | 分材料输出，避免跨界面平均 |
| 二次单元加密后精度反降 | 网格畸变或积分不足 | 检查 Jacobian 与积分阶 |

## Richardson 外推与 GCI 脚本

```python
import math

def convergence(f1, f2, f3, r=2.0, Fs=1.25):
    p = math.log((f2-f1)/(f3-f2)) / math.log(r)
    f_ext = f3 + (f3-f2)/(r**p - 1)
    gci = Fs/(r**p - 1) * abs((f2-f1)/f1)
    return p, f_ext, gci

p, f_ext, gci = convergence(100.0, 109.0, 111.25)
print(f"p={p:.2f} f_ext={f_ext:.2f} MPa GCI={gci*100:.2f}%")
# p=2.00 f_ext=112.00 MPa GCI=3.75%
```

## 参考文献

1. Richardson, L.F. "The approximate arithmetical solution by finite differences of physical problems." *Philosophical Transactions of the Royal Society A*, 210, 307–357, 1911.
2. Roache, P.J. "Perspective: a method for uniform reporting of grid refinement studies." *Journal of Fluids Engineering*, 116(3), 405–413, 1994.
3. Roache, P.J. *Verification and Validation in Computational Science and Engineering*. Hermosa Publishers, 1998.
4. Zienkiewicz, O.C., Zhu, J.Z. "A simple error estimator and adaptive procedure for practical engineering analysis." *International Journal for Numerical Methods in Engineering*, 24(2), 337–357, 1987.
5. Babuška, I., Rheinboldt, W.C. "Error estimates for adaptive finite element computations." *SIAM Journal on Numerical Analysis*, 15(4), 736–754, 1978.
6. ASME V&V 10-2019. *Standard for Verification and Validation in Computational Solid Mechanics*. ASME, 2019.
