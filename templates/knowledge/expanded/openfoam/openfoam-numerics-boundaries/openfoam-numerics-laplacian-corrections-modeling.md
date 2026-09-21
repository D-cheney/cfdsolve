---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-laplacian-corrections-modeling
title: "laplacianSchemes 非正交修正：设置机理与适用范围"
summary: "把面法向导数拆成正交项与 k_f 修正项，推导 Δ_f 与 k_f 的几何表达式，给出忽略修正时 1-cosθ 的相对误差量级，说明 corrected、limited 与 uncorrected 各自的适用角度边界。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "laplacianSchemes 非正交修正"
  - "设置机理与适用范围"
  - "snGrad"
  - "非正交角"
seo:
  title: "laplacianSchemes 非正交修正：设置机理与适用范围"
  description: "把面法向导数拆成正交项与 k_f 修正项，推导 Δ_f 与 k_f 的几何表达式，给出忽略修正时 1-cosθ 的相对误差量级，说明 corrected、limited 与 uncorrected 各自的适用角度边界。"
  keywords:
    - "laplacianSchemes 非正交修正"
    - "设置机理与适用范围"
    - "snGrad 正交分解"
    - "非正交角"
    - "limited 系数"
---

# laplacianSchemes 非正交修正：设置机理与适用范围

扩散项离散里真正难处理的不是 $\Gamma$，而是面法向导数 $\mathbf{S}_f\cdot\nabla\phi_f$：只有当面法向与两单元中心连线平行时，它才能用 $( \phi_N-\phi_P )/|\mathbf{d}|$ 直接近似。网格一旦扭曲，面法向与连线夹角 $\theta$ 会把这项近似拉出几十个百分点的误差。本文推导正交分解的两个几何量 $\Delta_f$ 与 $\mathbf{k}_f$，给出误差随 $\theta$ 的量级规律，并说明三档修正设置的适用边界。

## 扩散项在面上需要什么

`laplacianSchemes` 处理的是 $\nabla\cdot(\Gamma\nabla\phi)$。用散度定理后每一项都要算面通量：

$$
\int_{V_P}\nabla\cdot(\Gamma\nabla\phi)\,dV=\sum_f \Gamma_f\left(\mathbf{S}_f\cdot\nabla\phi_f\right)
$$

其中 $\mathbf{S}_f$ 为面的外法向面积矢量（单位 $\mathrm{m^2}$），$\Gamma_f$ 为插值到面上的扩散系数。难点在括号里：$\nabla\phi_f$ 是面梯度，无法直接得到，只能沿某个方向做差分。唯一能自然做差分的方向就是两单元中心连线 $\mathbf{d}$，因此必须把 $\mathbf{S}_f$ 投影到 $\mathbf{d}$ 上。

## 正交分解：$\Delta_f$ 与 $\mathbf{k}_f$

把面法向导数写成沿连线的差分加一个修正：

$$
\mathbf{S}_f\cdot\nabla\phi_f=\underbrace{\Delta_f\left(\phi_N-\phi_P\right)}_{\text{正交项}}+\underbrace{\mathbf{k}_f\cdot(\overline{\nabla\phi})_f}_{\text{非正交修正}}
$$

其中两个几何量由下式定义：

$$
\Delta_f=\frac{|\mathbf{S}_f|^2}{\mathbf{S}_f\cdot\mathbf{d}},\qquad \mathbf{k}_f=\mathbf{S}_f-\Delta_f\,\mathbf{d}
$$

$\Delta_f$ 的量纲是长度（$\mathrm{m}$），$\mathbf{k}_f$ 的量纲是面积（$\mathrm{m^2}$）。当面法向与 $\mathbf{d}$ 夹角为 $\theta$ 时，$|\Delta_f\mathbf{d}|=|\mathbf{S}_f|/\cos\theta$，且

$$
|\mathbf{k}_f|=|\mathbf{S}_f|\tan\theta
$$

这条关系式说明修正项不是小量。取一个边长 $0.005\ \mathrm{m}$ 的六面体面，$|\mathbf{S}_f|=2.5\times10^{-5}\ \mathrm{m^2}$，$\theta=60^\circ$，则 $|\mathbf{k}_f|=2.5\times10^{-5}\times1.732=4.33\times10^{-5}\ \mathrm{m^2}$，比 $|\mathbf{S}_f|$ 本身还大 73%。若 $\theta$ 增到 $70^\circ$，$\tan70^\circ=2.75$，修正项的几何权重变成主项的 2.75 倍——此时扩散算子的主导部分其实来自修正项，忽略它等于解另一个方程。

## 忽略修正会带来多大误差

若只用正交项，等价于把面法向导数近似为 $(\phi_N-\phi_P)/|\mathbf{d}|$。对线性场，真实的面法向导数为 $\cos\theta\,(\phi_N-\phi_P)/|\mathbf{d}|$，因此相对误差为

$$
\varepsilon_{orth}=1-\cos\theta
$$

代入几个典型角度：$\theta=10^\circ$ 时 $\varepsilon_{orth}=1.5\%$；$\theta=30^\circ$ 时 $13.4\%$；$\theta=60^\circ$ 时 $50\%$；$\theta=70^\circ$ 时 $65.8\%$。这就是 `uncorrected` 只能在非正交角小于约 $20^\circ$ 的网格上使用的原因——那时误差才与二阶截断误差同量级。

## 三档设置与适用边界

| 设置 | 修正项处理 | 适用非正交角 | 代价 |
|---|---|---|---|
| `uncorrected` | 完全忽略 $\mathbf{k}_f$ | $\theta<20^\circ$ | 最低，一阶误差 |
| `corrected` | 用上次迭代梯度显式修正 | $\theta<70^\circ$ | 需多次非正交修正迭代 |
| `limited k` | 只在 $\mathbf{k}_f$ 小时保留修正 | $\theta$ 局部超 $70^\circ$ | 略降精度换稳健 |

```cpp
laplacianSchemes
{
    default                     Gauss linear corrected;
    laplacian(nuEff,U)          Gauss linear corrected;
    laplacian((1|A(U)),p)       Gauss linear corrected;
    laplacian(DkEff,k)          Gauss linear limited 0.33;
}
snGradSchemes
{
    default         corrected;
    limited 0.33;
}
```

修正项用的是**上一次迭代**的梯度，因此它本质上是一个固定点迭代：每执行一次 `nNonOrthogonalCorrectors` 就更新一次梯度并把残差压低一截。次数不足会留下系统性误差，次数过多只增加成本而不改善精度，因为修正项本身也有截断误差。

```cpp
SIMPLE
{
    nNonOrthogonalCorrectors 1;   // 非正交角 < 60° 时足够
}
PIMPLE
{
    nNonOrthogonalCorrectors 2;   // 瞬态含动网格或 < 70° 时
    nCorrectors              2;
}
```

## 非正交修正的失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力场沿壁面出现锯齿 | 非正交修正次数不足 | 把 `nNonOrthogonalCorrectors` 从 1 提到 2，看锯齿是否消失 |
| 热流密度比解析解低 20% 以上 | 用 `uncorrected` 配扭曲网格 | 计算 $1-\cos\theta$，与热流偏差对比量级 |
| 修正次数翻倍后结果不再变化 | 已进入修正项截断误差主导区 | 记录每次修正后的残差，找到平台 |
| 局部出现非物理负值 | `corrected` 在坏单元上过冲 | 改用 `limited 0.33`，检查极值是否回到物理范围 |
| 与 `snGradSchemes` 结果矛盾 | 两处修正设置不一致 | 把 `snGrad` 与 `laplacian` 改成同一档再复跑 |

判断修正是否充分的标准不是残差降到多小，而是把 `nNonOrthogonalCorrectors` 加一再跑一遍，关键工程量是否变化小于工程容差。若变化仍然可见，问题在网格而非修正次数，应回到 `checkMesh` 处理最差的那些单元。

## 参考文献

1. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
2. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
3. Demirdžić I., Muzaferija S., *Numerical method for coupled fluid flow, heat transfer and stress analysis using unstructured moving meshes with cells of arbitrary topology*, Computer Methods in Applied Mechanics and Engineering, 125(1–4), 235–255, 1995.
4. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.4 Numerical Schemes, 2024.
6. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics*, 2nd ed., Pearson, 2007.
