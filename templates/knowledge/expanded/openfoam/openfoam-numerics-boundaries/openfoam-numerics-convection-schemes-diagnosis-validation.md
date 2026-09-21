---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-convection-schemes-diagnosis-validation
title: "divSchemes 对流格式：结果诊断与可信度验证"
summary: "用等效数值扩散、Richardson 观测精度阶与 GCI 把对流格式误差与网格误差分开，给出极值监控配置、前沿宽度对照试验和症状到根因的判定表，使格式可信度有可核对的量化结论。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "divSchemes 对流格式"
  - "结果诊断与可信度验证"
  - "Richardson 外推"
  - "GCI"
seo:
  title: "divSchemes 对流格式：结果诊断与可信度验证"
  description: "用等效数值扩散、Richardson 观测精度阶与 GCI 把对流格式误差与网格误差分开，给出极值监控配置、前沿宽度对照试验和症状到根因的判定表，使格式可信度有可核对的量化结论。"
  keywords:
    - "divSchemes 对流格式"
    - "结果诊断与可信度验证"
    - "Richardson 外推"
    - "网格收敛指数"
    - "数值耗散"
---

# divSchemes 对流格式：结果诊断与可信度验证

残差降到 $10^{-6}$ 并不代表对流离散可信：一阶迎风能在任何网格上给出漂亮残差，同时把温度前沿抹宽两倍。验证对流格式要做的是把数值耗散从物理扩散里剥出来，再用网格收敛阶和极值统计给出量化结论。本文给出一条从症状到判定试验的完整路径，并附一次可逐步核对的 Richardson 外推。

## 先量化数值耗散，再谈云图

一阶迎风引入的等效扩散系数可以写成

$$
\Gamma_{num}=\frac{\rho u\Delta x}{2}\left(1-Co\right)
$$

取空气 $\rho=1.2\ \mathrm{kg/m^3}$、$u=15\ \mathrm{m/s}$、$\Delta x=0.002\ \mathrm{m}$、$Co=0.5$，得 $\Gamma_{num}=1.2\times15\times0.002\times0.5/2=9\times10^{-3}\ \mathrm{Pa\cdot s}$。而该温度下空气的分子黏度是 $1.8\times10^{-5}\ \mathrm{Pa\cdot s}$，数值扩散比它高出两个多数量级，说明在该网格上用一阶迎风算出的浓度扩散宽度几乎完全由数值耗散决定，绝不能拿来反推物性扩散系数。

换成二阶 `linearUpwind` 后数值耗散降到 $\mathcal{O}(\Delta x^2)$。此时把 $\Delta x$ 从 $0.002\ \mathrm{m}$ 减到 $0.001\ \mathrm{m}$，一阶迎风的 $\Gamma_{num}$ 只减半到 $4.5\times10^{-3}\ \mathrm{Pa\cdot s}$，而二阶格式的等效耗散约降为四分之一。这条差异就是判断当前误差由格式还是由网格主导的试验：加密一倍，若前沿宽度显著收窄，说明格式仍在主导；若基本不变，说明已进入网格主导区。

## 用观测精度阶把两类误差分开

对同一算例做加密比为 $r$ 的三级网格，用 Richardson 外推估计观测精度阶：

$$
p=\frac{\log\left(\frac{\phi_2-\phi_1}{\phi_3-\phi_2}\right)}{\log r},\qquad \phi_{ext}=\phi_3+\frac{\phi_3-\phi_2}{r^{p}-1}
$$

其中 $\phi_1$ 为最粗网格、$\phi_3$ 为最细网格。用一阶迎风时 $p$ 应接近 1，换二阶格式后 $p$ 应接近 2。举一组实测的阻力系数：$\phi_1=0.320$、$\phi_2=0.302$、$\phi_3=0.296$，加密比 $r=2$，则

$$
p=\frac{\log\left(\frac{0.302-0.320}{0.296-0.302}\right)}{\log 2}=\frac{\log 3}{\log 2}=1.585
$$

$p=1.585$ 落在 1 与 2 之间，说明限制器在部分单元退化为迎风，空间离散尚未完全达到二阶。外推值 $\phi_{ext}=0.296+(-0.006)/(2^{1.585}-1)=0.296-0.003=0.293$。把最细网格结果与网格收敛指数一起报告：

$$
GCI=\frac{1.25}{\phi_3}\frac{|\phi_2-\phi_3|}{r^{p}-1}=\frac{1.25\times0.006}{0.296\times2}=1.27\%
$$

工程上把 GCI 当作离散不确定度带：若格式换档引起的阻力变化小于 1.27%，则该变化落在离散噪声内，不足以支撑格式选择结论。

注意 Richardson 外推要求序列单调收敛。若三级结果出现 $\phi_2<\phi_3>\phi_4$ 这类非单调，先排查是否混入了时间步自适应抖动或边界条件未收敛，固定时间步后重跑再算 $p$。

## 极值监控与对照试验配置

极值监控是发现无界格式最快的办法，把它挂成常驻函数对象：

```cpp
functions
{
    fieldExtremes
    {
        type          fieldMinMax;
        libs          ("libfieldFunctionObjects.so");
        fields        (T U p k epsilon alpha.water);
        mode          component;
        writeControl  timeStep;
        writeInterval 1;
        log           true;
    }
}
```

前沿宽度对照试验按下面的流程走，每一步只改一个量：

```text
基线：div(phi,T) = bounded Gauss upwind            记录 前沿宽度 w0、峰值 Tmax、最小值 Tmin
换档：div(phi,T) = bounded Gauss linearUpwind grad(T)  记录 w1、Tmax、Tmin
收紧：div(phi,T) = bounded Gauss limitedLinear 1       记录 w2、Tmax、Tmin
加密：把上述三档各在 2Δx 与 Δx/2 上重跑
判定：w0 与 w1 的差若随网格加密而缩小，说明耗散来自格式；若不缩小，说明来自网格
```

在一条 $1\ \mathrm{m}$ 长的一维对流算例里，来流 $u=1\ \mathrm{m/s}$、$\Delta x=0.005\ \mathrm{m}$，精确阶跃界面的理想宽度为零。一阶迎风给出的 $10\%\sim90\%$ 前沿宽度约 $3\Delta x=0.015\ \mathrm{m}$，二阶有界格式约 $1.5\Delta x=0.0075\ \mathrm{m}$，而无限制 `linear` 会给出更窄的前沿但同时把峰值抬到 1.08。这三组数放在一起才能说明：`linear` 的"更准"是用无界换来的。

## 前沿与极值异常的判定表

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 前沿宽度随加密不收敛 | 格式在多数单元退化为迎风 | 统计 $\psi<0.05$ 的单元占比，与网格尺度对照 |
| 峰值超过初值上限 5% 以上 | 高阶格式无界或限制器失效 | 关掉 `bounded` 与换 `limitedLinear 1` 各跑一次对比极值 |
| 阻力三级网格非单调 | 时间步自适应或边界未收敛混入 | 固定时间步重跑，再算观测阶 $p$ |
| 观测阶 $p$ 只有 1.0～1.3 | 网格长宽比或非正交角过大 | 用 `checkMesh` 量化几何质量，与格式换档结果对比 |
| 残差很低但极值缓慢漂移 | 延迟修正外迭代不足 | 加倍外迭代次数，观察极值与残差是否同时稳定 |

判据的顺序是：先看极值是否越界，再看前沿宽度是否随网格收敛，最后用 GCI 给出不确定度带。三者齐备才能宣称对流格式设置可信；只有残差曲线是不足以支撑结论的。

## 参考文献

1. Roache P.J., *Perspective: a method for uniform reporting of grid refinement studies*, Journal of Fluids Engineering, 116(3), 405–413, 1994.
2. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E., *Procedure for estimation and reporting of uncertainty due to discretization in CFD applications*, Journal of Fluids Engineering, 130(7), 078001, 2008.
3. Richardson L.F., *The approximate arithmetical solution by finite differences of physical problems*, Philosophical Transactions of the Royal Society A, 210, 307–357, 1911.
4. Sweby P.K., *High resolution schemes using flux limiters for hyperbolic conservation laws*, SIAM Journal on Numerical Analysis, 21(5), 995–1011, 1984.
5. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
6. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics*, 2nd ed., Pearson, 2007.
