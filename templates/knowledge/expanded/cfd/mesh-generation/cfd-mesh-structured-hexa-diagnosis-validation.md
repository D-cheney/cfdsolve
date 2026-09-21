---
template_version: "flowlab-knowledge/1.0"
slug: cfd-mesh-structured-hexa-diagnosis-validation
title: "结构六面体网格：结果诊断与可信度验证"
summary: "给出结构六面体网格的 GCI 与 Richardson 外推手算流程、局部质量异常与目标量偏差的分离方法，以及一套能落地的判定试验表，用于判断加密收益是否真实。"
category:
  slug: mesh-generation
  name: "网格与离散质量"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "网格与离散质量"
  - "结构六面体网格"
  - "结果诊断与可信度验证"
  - "GCI"
  - "Richardson 外推"
seo:
  title: "结构六面体网格：结果诊断与可信度验证"
  description: "给出结构六面体网格的 GCI 与 Richardson 外推手算流程、局部质量异常与目标量偏差的分离方法，以及一套能落地的判定试验表，用于判断加密收益是否真实。"
  keywords:
    - "结构六面体网格"
    - "结果诊断与可信度验证"
    - "GCI"
    - "Richardson 外推"
    - "观测阶"
---

# 结构六面体网格：结果诊断与可信度验证

结构六面体网格的结果诊断要回答两个不同的问题：误差里有多少是网格造成的，以及局部质量异常有没有污染目标量。前者用三套网格的 GCI 量化，后者用局部场量与积分量的同步监控分离。本文给出可手算的完整流程，并说明每一步的判定阈值。

## 三套网格的构造与比值控制

GCI 的前提是网格族相似：三套网格只改变单元尺寸，块拓扑、边界层分配方式、离散格式与收敛准则必须完全一致。尺寸比 $r$ 建议取 1.3～2.0，太大则外推阶不可靠，太小则两套解之差被迭代误差淹没。

以某二维通道为例，取 $r = 2$，三套网格单元数为 $0.125\times10^{6}$、$1.0\times10^{6}$、$8.0\times10^{6}$，对应平均单元尺寸 4 mm、2 mm、1 mm。压降目标量分别为 $\phi_3 = 3.42\ \mathrm{kPa}$、$\phi_2 = 3.55\ \mathrm{kPa}$、$\phi_1 = 3.61\ \mathrm{kPa}$（下标 1 为最细）。

## Richardson 外推与观测阶的手算

相对变化与观测阶为

$$
\varepsilon_{21} = \frac{\phi_2-\phi_1}{\phi_1}, \qquad p = \frac{1}{\ln r}\left|\ln\left|\frac{\varepsilon_{32}}{\varepsilon_{21}}\right|\right|
$$

代入数值：$\varepsilon_{21} = (3.55-3.61)/3.61 = -0.01662$，$\varepsilon_{32} = (3.42-3.55)/3.55 = -0.03662$，比值 $2.203$，于是

$$
p = \frac{\ln 2.203}{\ln 2} = \frac{0.7899}{0.6931} = 1.14
$$

二阶格式配贴体六面体通常给出 $p \approx 1.8\sim2.2$；这里只有 1.14，说明误差里有相当一部分不是光滑的截断误差，而是角部高偏斜单元贡献的局部误差。继续加密之前应先修角部质量。

网格收敛指数与 Richardson 外推值：

$$
GCI_{fine} = \frac{F_s |\varepsilon_{21}|}{r^{p}-1}, \qquad \phi_{ext} = \phi_1 + \frac{\phi_1-\phi_2}{r^{p}-1}
$$

取安全因子 $F_s = 1.25$（三套网格时用 1.25，只有两套时用 3.0）：

$$
GCI_{fine} = \frac{1.25 \times 0.01662}{2.203-1} = 0.0173 = 1.73\%
$$

$$
\phi_{ext} = 3.61 + \frac{3.61-3.55}{1.203} = 3.61 + 0.050 = 3.66\ \mathrm{kPa}
$$

结论应写成「压降 $3.61\ \mathrm{kPa}$，离散不确定度 1.73%，外推极限 3.66 kPa」，而不是只报一个数。

## 局部质量异常与目标量偏差的分离

细网格上仍有若干单元非正交角超过 70° 时，要看这些单元是否落在高梯度区。分离方法是把目标量拆成体积分与面积分两类，各自检查：

- 体积分（如总压降）对局部误差不敏感，若它随加密单调收敛，角部异常影响有限。
- 面积分（如壁面总阻力）直接由壁面单元决定，角部异常会带来系统偏差。

算例中壁面阻力在三套网格上为 12.85 N、12.63 N、12.55 N，单调收敛但收敛率只有 0.6；把角部三处圆角块的偏斜从 74° 修到 45° 后，同样三套网格给出 12.71 N、12.62 N、12.58 N，观测阶升到 1.6。这一步证明偏差来自质量而非分辨率。

## 复算脚本

```python
import math
phi1, phi2, phi3, r, Fs = 3.61, 3.55, 3.42, 2.0, 1.25
e21 = (phi2 - phi1) / phi1
e32 = (phi3 - phi2) / phi2
p = abs(math.log(abs(e32 / e21))) / math.log(r)
gci = Fs * abs(e21) / (r**p - 1)
phi_ext = phi1 + (phi1 - phi2) / (r**p - 1)
print(f"p={p:.2f}  GCI={gci*100:.2f}%  phi_ext={phi_ext:.3f} kPa")
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 三套网格目标量单调但观测阶只有 1.1 | 局部高偏斜单元贡献非光滑误差 | 只修角部块质量、不加密，重算观测阶是否回升到 1.6 以上 |
| 粗网格与细网格之差小于迭代残差 | 收敛准则过松，差值被代数误差淹没 | 把残差阈收紧一个量级，确认两套解差值稳定后再算 GCI |
| 壁面阻力不收敛而压降收敛 | 面积分由壁面单元质量主导 | 单独统计壁面单元的最大非正交角与长宽比 |
| 加密后结果反而偏离外推值 | 块边界位置随网格改变，几何不再相似 | 固定块边界坐标，只改变单元数 |
| 三套网格 GCI 差异巨大 | 某套网格未收敛到同一流态 | 比较三套的壁面 $y^+$ 分布与流量，确认物理状态一致 |

## 报告与验收

可信的结论需要同时给出：三套网格的单元数与平均尺寸、目标量、$\varepsilon$ 与观测阶、$GCI$、外推极限、以及外推极限与最细网格之差是否小于 $GCI$。若外推极限落在最细网格与次细网格之间，说明序列合理；若落在两者之外，序列不单调，必须先查质量或收敛问题。局部质量异常必须记录修复前后的对比，否则后续使用者无法判断当前观测阶是网格分辨率的真实反映还是质量缺陷的残留。

## 参考文献

1. Roache P.J., "Perspective: A Method for Uniform Reporting of Grid Refinement Studies", *Journal of Fluids Engineering*, 116(3): 405-413, 1994.
2. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E., "Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications", *Journal of Fluids Engineering*, 130(7): 078001, 2008.
3. Richardson L.F., "The Approximate Arithmetical Solution by Finite Differences of Physical Problems", *Philosophical Transactions of the Royal Society A*, 210: 307-357, 1911.
4. ASME, *V&V 20-2009: Standard for Verification and Validation in Computational Fluid Dynamics and Heat Transfer*, ASME, 2009.
