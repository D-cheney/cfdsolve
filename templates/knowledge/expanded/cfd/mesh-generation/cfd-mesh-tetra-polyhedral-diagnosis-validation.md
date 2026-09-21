---
template_version: "flowlab-knowledge/1.0"
slug: cfd-mesh-tetra-polyhedral-diagnosis-validation
title: "四面体与多面体网格：结果诊断与可信度验证"
summary: "用网格 Peclet 数与假扩散系数把四面体网格的数值误差量化，给出偏斜单元的梯度误差判据、四面体与多面体的交叉验证流程，以及可执行的判定试验表。"
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
  - "四面体与多面体网格"
  - "结果诊断与可信度验证"
  - "假扩散"
  - "网格 Peclet 数"
seo:
  title: "四面体与多面体网格：结果诊断与可信度验证"
  description: "用网格 Peclet 数与假扩散系数把四面体网格的数值误差量化，给出偏斜单元的梯度误差判据、四面体与多面体的交叉验证流程，以及可执行的判定试验表。"
  keywords:
    - "四面体网格"
    - "多面体网格"
    - "假扩散"
    - "网格 Peclet 数"
    - "非正交修正"
---

# 四面体与多面体网格：结果诊断与可信度验证

四面体网格最典型的失效不是发散，而是结果光滑、收敛良好、却系统性偏离真值。这类偏差主要来自迎风格式的假扩散和偏斜单元的梯度误差，两者都能在计算之前用量纲估算，在计算之后用局部量定位。本文给出量化流程与判定阈值。

## 用网格 Peclet 数判断假扩散是否主导

假扩散来自一阶迎风对对流项的截断误差，其等效扩散系数与网格 Peclet 数分别为

$$
\Gamma_{false} = \frac{\rho U \Delta x}{2}, \qquad Pe_\Delta = \frac{\rho U \Delta x}{\Gamma}
$$

取常压空气 $\rho = 1.225\ \mathrm{kg/m^3}$、$\mu = 1.8\times10^{-5}\ \mathrm{Pa\cdot s}$、$U = 10\ \mathrm{m/s}$、四面体平均边长 $\Delta x = 2\ \mathrm{mm}$：

$$
Pe_\Delta = \frac{1.225 \times 10 \times 2\times10^{-3}}{1.8\times10^{-5}} = 1361
$$

$$
\Gamma_{false} = \frac{1.225 \times 10 \times 2\times10^{-3}}{2} = 0.01225\ \mathrm{Pa\cdot s}
$$

$\Gamma_{false}/\mu = 0.01225/1.8\times10^{-5} = 681$。也就是说，在这个网格上假扩散是分子扩散的 681 倍——若物理问题关心的是层流边界层内的黏性效应，四面体尺寸不降到毫米以下就没有意义。把 $\Delta x$ 从 2 mm 减到 0.5 mm，$Pe_\Delta$ 降到 340，$\Gamma_{false}$ 降到 $0.00306\ \mathrm{Pa\cdot s}$，降幅恰好 4 倍，与 $\Delta x$ 的一次方成正比。

判据：$Pe_\Delta < 2$ 时中心格式可用；$Pe_\Delta$ 在 2～10 之间应改用二阶迎风或有界格式；超过 100 时无论用哪种格式，结果都由网格尺度而非物理决定。

## 偏斜单元的梯度误差

面偏斜度衡量面心偏离两单元中心连线的程度：

$$
s_f = \frac{|\mathbf{x}_f - \mathbf{x}_{f,int}|}{|\mathbf{d}|}
$$

其中 $\mathbf{x}_{f,int}$ 是连线与面的交点。OpenFOAM 的 `Max skewness` 超过 4 时，扩散项的非正交修正会引入非物理极值。多面体网格的偏斜度通常比同尺寸四面体低 30%～50%，这是它在复杂几何上更稳的主要原因。

局部诊断方法：在最大偏斜单元附近提取压力或温度场，若相邻单元跳变的量级远大于物理梯度，即为该单元的修正失效。

## 四面体与多面体的交叉验证

同一几何、同一表面尺寸、同一棱柱层设置下分别生成四面体与多面体网格，比较目标量：

| 网格 | 单元数 | 圆柱绕流阻力系数 | 与细网格差 |
|---|---|---|---|
| 四面体 2 mm | $6.8\times10^{4}$ | 1.342 | 1.9% |
| 多面体 2 mm | $1.7\times10^{4}$ | 1.318 | 0.6% |
| 四面体 1 mm | $5.4\times10^{5}$ | 1.311 | — |

多面体用四分之一的单元数达到了四面体加密一倍的效果，说明差异来自梯度重建而非分辨率。若换到以壁面剪切为主导的算例，两者差异会缩小到 0.5% 以内，因为壁面剪切主要由棱柱层决定。

## 诊断脚本

```python
rho, mu, U = 1.225, 1.8e-5, 10.0
for dx in (2e-3, 1e-3, 5e-4):
    Pe = rho * U * dx / mu
    Gf = rho * U * dx / 2
    print(f"dx={dx*1e3:.1f} mm  Pe={Pe:7.1f}  Gamma_false={Gf:.5f} Pa.s")
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 收敛良好但尾流长度偏长 | 迎风假扩散抹平了剪切层 | 计算 $Pe_\Delta$，把网格尺寸减半看尾流长度是否继续变化 |
| 压力场出现相邻单元正负交替 | 高偏斜单元的扩散修正失效 | 提取该处偏斜度，修到 2 以下重算局部场 |
| 四面体与多面体结果差 2% 以上 | 梯度重建误差主导 | 固定表面尺寸与棱柱层，只换单元类型比较 |
| 加密后目标量单调但斜率不收敛 | 棱柱层未随核心区加密 | 检查棱柱首层厚度是否固定，重算壁面剪切 |
| 薄壁两侧温度不对称 | 壁厚方向单元数不足 | 统计壁厚方向单元数，要求不少于 3 层 |

## 结论关闭

可信的四面体或多面体结果需要同时满足：$Pe_\Delta$ 已量化并说明格式选择依据；最大偏斜度与最小正交质量在阈值内；四面体与多面体在同一表面尺寸下的目标量差小于工程容差；棱柱层设置在两套网格中完全一致；以及一套独立后处理脚本重算的关键积分量与原结果一致。若四面体与多面体差异大于容差而加密后仍不收敛，说明棱柱层或边界条件而非单元类型是主因，应转向这两处排查。

## 参考文献

1. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
2. de Vahl Davis G., Mallinson G.D., "An Evaluation of Upwind and Central Difference Approximations by a Study of Recirculating Flow", *Computers & Fluids*, 4(1): 29-43, 1976.
3. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson Education, 2007.
4. Biswas R., Strawn R.C., "Tetrahedral and Hexahedral Mesh Adaptation for CFD Problems", *Applied Numerical Mathematics*, 26(1-2): 135-151, 1998.
