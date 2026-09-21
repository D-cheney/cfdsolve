---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-numerics-laplacian-corrections-engineering-setup
title: "laplacianSchemes 非正交修正：工程设置与参数选择"
summary: "按最大非正交角给出 corrected、limited k 与 uncorrected 的选用阈值表，推导修正迭代的收缩估计以确定 nNonOrthogonalCorrectors，并强调 laplacian 与 snGrad 修正档位必须一致。"
category:
  slug: openfoam-numerics-boundaries
  name: "OpenFOAM 边界与数值设置"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 边界与数值设置"
  - "laplacianSchemes 非正交修正"
  - "工程设置与参数选择"
  - "nNonOrthogonalCorrectors"
  - "limited"
seo:
  title: "laplacianSchemes 非正交修正：工程设置与参数选择"
  description: "按最大非正交角给出 corrected、limited k 与 uncorrected 的选用阈值表，推导修正迭代的收缩估计以确定 nNonOrthogonalCorrectors，并强调 laplacian 与 snGrad 修正档位必须一致。"
  keywords:
    - "laplacianSchemes 非正交修正"
    - "工程设置与参数选择"
    - "nNonOrthogonalCorrectors"
    - "limited 0.33"
    - "snGrad 一致性"
---

# laplacianSchemes 非正交修正：工程设置与参数选择

非正交修正的设置只有三个旋钮：选 `corrected` 还是 `limited k`，`k` 取多少，以及 `nNonOrthogonalCorrectors` 取几。三个都要由 `checkMesh` 报出的最大非正交角决定，而不是凭经验拍。本文给出按角度分档的阈值表、修正迭代次数的收缩估计、参数表，以及 `laplacian` 与 `snGrad` 必须同档的理由。

## 先读 checkMesh 的非正交角

设置修正之前必须先量化网格。`checkMesh` 报出的 `Max non-orthogonality` 就是各面 $\theta$ 的最大值，`Average non-orthogonality` 是均值。经验阈值是：均值低于 $20^\circ$ 且最大低于 $60^\circ$ 属于好网格；最大超过 $70^\circ$ 时修正已经很难补救，应优先改网格或换 `limited`。

`limited k` 的规则是把修正项夹到正交项的一个比例以内：

$$
\left|\,\mathbf{k}_f\cdot\nabla_f\phi\,\right|\le k\,\Delta_f\left|\phi_N-\phi_P\right|
$$

$k$ 是夹逼系数。取 `limited 0.33` 意味着修正项最多贡献正交项的 33%，在坏单元上牺牲精度换稳健；取 `limited 0.5` 更接近 `corrected`，适合最大角 $70^\circ$ 附近；取 `limited 1.0` 基本等价于不夹逼，意义不大。

## 修正迭代次数怎么定

修正项用上一次迭代的梯度显式计算，构成一个固定点迭代。设每轮的误差收缩因子为 $\rho$，则第 $m$ 轮后的修正残差为

$$
r^{(m)}=\rho^{m}\,r^{(0)},\qquad m\ge\frac{\log\left(r_{tol}/r^{(0)}\right)}{\log\rho}
$$

收缩因子 $\rho$ 随非正交角增大而接近 1。实测中 $\theta<40^\circ$ 时 $\rho\approx0.3$，$\theta\approx60^\circ$ 时 $\rho\approx0.4$，$\theta\approx70^\circ$ 时 $\rho\approx0.55$。若要把修正残差从 1 压到 $10^{-2}$，$\rho=0.3$ 需要 $m\ge\log(0.01)/\log(0.3)=3.8$ 即 4 次，$\rho=0.55$ 需要 $m\ge\log(0.01)/\log(0.55)=7.8$ 即 8 次——这就是为什么坏网格上单纯堆 `nNonOrthogonalCorrectors` 的性价比极低，工程上通常封顶在 3。

| 最大非正交角 | 推荐设置 | `nNonOrthogonalCorrectors` |
|---|---|---|
| $<20^\circ$ | `Gauss linear uncorrected` | 0 |
| $20^\circ\sim60^\circ$ | `Gauss linear corrected` | 1 |
| $60^\circ\sim70^\circ$ | `Gauss linear corrected` | 2 |
| $>70^\circ$，局部坏单元 | `Gauss linear limited 0.33` | 2 |
| $>75^\circ$ | 先修网格 | 2～3，仅作过渡 |

## 一份配套字典

```cpp
laplacianSchemes
{
    default                     Gauss linear corrected;
    laplacian(nuEff,U)          Gauss linear corrected;
    laplacian((1|A(U)),p)       Gauss linear corrected;
    laplacian(DkEff,k)          Gauss linear limited 0.33;
    laplacian(DepsilonEff,epsilon) Gauss linear limited 0.33;
}
snGradSchemes
{
    default     corrected;
    limited     limited 0.33;
}
```

`snGradSchemes` 必须与 `laplacianSchemes` 同档。原因是 `corrected` 的 `snGrad` 也要调用同一套 $\mathbf{k}_f$ 修正；如果 `laplacian` 用 `limited 0.33` 而 `snGrad` 用 `corrected`，同一个面上会出现两个不同的法向导数，扩散项与梯度项自相矛盾，表现为壁面热流与体平均耗散对不上。

改完字典后用一条命令核对两处档位是否一致，再启动求解器：

```bash
foamDictionary -entry laplacianSchemes.default -value system/fvSchemes
foamDictionary -entry snGradSchemes.default   -value system/fvSchemes
# 两者应同为 corrected 或同为 limited 0.33；不一致即为配置缺陷
checkMesh -allGeometry -allTopology 2>&1 | grep -i "non-orthogonality"
```

## 修正次数与夹逼的三轮对照

| 轮次 | 改动项 | 保持不动 | 记录量 |
|---|---|---|---|
| N0 | `nNonOrthogonalCorrectors 0` | 网格、格式、求解器 | 压力残差、壁面热流 |
| N1 | 仅提到 1 | 其余全部 | 同上，看变化是否超容差 |
| N2 | 仅提到 2 | 其余全部 | 同上，确认是否进入平台 |
| N3 | 仅把 `corrected` 换成 `limited 0.33` | 次数回到 N1 的值 | 极值、坏单元附近的压力 |

判定规则：若 N2 与 N1 的壁面热流差小于 0.5%，说明一次修正已足够；若 N3 相对 N1 的热流下降超过 2%，说明 `limited 0.33` 正在削掉真实扩散通量，只应作为过渡方案并同步安排网格整改。

## 夹逼系数与修正次数的记录

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压力沿壁面锯齿 | 修正次数不足 | 从 1 提到 2，看锯齿幅值是否减半 |
| 热流比解析解低 20% | 网格扭曲但用 `uncorrected` | 由 $1-\cos\theta$ 估算应有误差，与实测对比 |
| 加修正次数后结果不动 | 已到修正项截断误差平台 | 记录每轮残差，找到 $\rho^{m}$ 的平台 |
| 坏单元附近出现负温度 | `corrected` 在 $\theta>70^\circ$ 处过冲 | 把该条 `laplacian` 换成 `limited 0.33` 并核对极值 |
| 改 `snGrad` 后结果跳变 | 两处修正档位不一致 | 把两者改成同一档再复跑 |

记录时必须把最大非正交角、`limited` 系数与 `nNonOrthogonalCorrectors` 写在一起。换网格而不更新这三个数，等于把一套为 $60^\circ$ 网格调好的设置直接用到 $75^\circ$ 网格上。

## 参考文献

1. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
2. Demirdžić I., Muzaferija S., *Numerical method for coupled fluid flow, heat transfer and stress analysis using unstructured moving meshes with cells of arbitrary topology*, Computer Methods in Applied Mechanics and Engineering, 125(1–4), 235–255, 1995.
3. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
4. Greenshields C.J., Weller H.G., *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, Section 4.4 Numerical Schemes, 2024.
6. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics*, 2nd ed., Pearson, 2007.
