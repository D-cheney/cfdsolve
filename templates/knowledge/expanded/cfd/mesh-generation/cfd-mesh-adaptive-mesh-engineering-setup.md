---
template_version: "flowlab-knowledge/1.0"
slug: cfd-mesh-adaptive-mesh-engineering-setup
title: "自适应网格加密：工程设置与参数选择"
summary: "给出误差指示量、加密层数、阈值与滞后带的取值规则，用 8 mm 基网格与三层加密算出单元增长倍率，并给出 dynamicRefineFvMesh 的可复算配置片段。"
category:
  slug: mesh-generation
  name: "网格与离散质量"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "网格与离散质量"
  - "自适应网格加密"
  - "工程设置与参数选择"
  - "误差指示量"
  - "动态网格细化"
seo:
  title: "自适应网格加密：工程设置与参数选择"
  description: "给出误差指示量、加密层数、阈值与滞后带的取值规则，用 8 mm 基网格与三层加密算出单元增长倍率，并给出 dynamicRefineFvMesh 的可复算配置片段。"
  keywords:
    - "自适应网格加密"
    - "误差指示量"
    - "dynamicRefineFvMesh"
    - "加密层数"
    - "滞后带"
---

# 自适应网格加密：工程设置与参数选择

自适应加密的成败取决于两件事：指示量是否指向真正影响目标量的区域，以及阈值与层数是否与单元预算匹配。指示量选错，加密会落在漂亮的涡结构上而与目标量无关；层数与阈值失控，单元数会按八倍率爆炸。本文把这两件事算清楚。

## 误差指示量决定加密落在哪里

最简单可用的指示量是相对梯度指示量：

$$
\eta_e = \frac{h_e \left|\nabla \phi\right|_e}{\left|\phi\right|_{ref}}
$$

$h_e$ 是单元尺度，$\left|\phi\right|_{ref}$ 取该场量的特征幅值（如入口与出口压差）。当 $\eta_e$ 超过阈值 $\theta$ 时标记该单元。用特征幅值归一化很关键：不归一化的绝对梯度会让量纲大的场（压力，单位 Pa）永远压过量纲小的场（组分质量分数，无量纲）。

更严格的估计用梯度恢复型后验误差估计：

$$
\left\|e\right\| \approx \left(\sum_e \int_{\Omega_e} \left(\mathbf{q}^{*} - \nabla\phi_h\right)^{2} dV\right)^{1/2}
$$

其中 $\mathbf{q}^{*}$ 是由节点值重构得到的平滑梯度。它的好处是给出全局误差范数，可以直接判断「加密到何时为止」，代价是需要额外的重构步骤。

## 加密层数与单元尺寸的换算

二维四叉树与三维八叉树每次细分把单元边长减半，$L$ 层加密后的单元尺寸为

$$
h_L = \frac{h_0}{2^{L}}
$$

基网格 8 mm、$L = 3$ 时 $h_3 = 1\ \mathrm{mm}$。单个单元细分后的子单元数在三维是 $2^{3L} = 512$。

单元总量由被标记比例 $f$ 决定：

$$
N \approx N_0\left[1 + f\left(2^{3L}-1\right)\right]
$$

基网格 $N_0 = 5.0\times10^{5}$、标记比例 $f = 0.4\%$、$L = 3$：

$$
N \approx 5.0\times10^{5}\left[1 + 0.004 \times 511\right] = 5.0\times10^{5} \times 3.04 = 1.52\times10^{6}
$$

即单元数涨到 3.0 倍。把 $f$ 提到 2% 则 $N = 5.0\times10^{5}(1+10.2) = 5.6\times10^{6}$，涨到 11 倍。**阈值 $\theta$ 每放松一点，$f$ 就可能翻几倍，这是自适应算例超预算的首要原因。**

## 阈值与滞后带的取值

单一阈值会让单元在加密与粗化之间反复振荡。做法是设置滞后带：$\eta_e > \theta_u$ 才加密，$\eta_e < \theta_l$ 才粗化，且

$$
\theta_l \approx 0.3\,\theta_u
$$

典型取值 $\theta_u = 0.30$、$\theta_l = 0.10$。当 $\theta_u$ 取 0.30 时，上例的 $f$ 约为 0.4%；取 0.15 时 $f$ 升到约 2%。层数上限通常取 3～4，超过 4 后单元尺寸已经接近棱柱层厚度，继续加密对目标量的贡献趋近于零。

## dynamicRefineFvMesh 配置

```text
dynamicFvMesh   dynamicRefineFvMesh;

dynamicRefineFvMeshCoeffs
{
    field           alpha.water;
    lowerRefineLevel 0.001;
    upperRefineLevel 0.999;
    unrefineLevel    2;
    nBufferLayers    2;
    maxRefinement    3;
    maxCells         3000000;
    correctFluxes    (phi);
    dumpLevel        true;
}
```

`nBufferLayers 2` 保证被标记单元周围两圈单元同步加密，避免出现尺寸比为 4 的界面；`maxRefinement 3` 对应 $h = h_0/8$；`maxCells` 是硬预算闸门，达到后加密自动停止，避免算例在无人值守时撑爆内存。`dumpLevel true` 输出每层加密的单元分布，用于事后核查加密是否落在预期区域。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 加密全部落在涡核而非剪切层 | 指示量用了绝对梯度，被大尺度结构主导 | 改用相对梯度指示量，检查加密区域是否随阈值移动 |
| 单元数在两步之间来回跳变 | 阈值无滞后带，单元反复加密与粗化 | 设 $\theta_l = 0.3\theta_u$，观察单元数曲线是否单调 |
| 界面处出现压力锯齿 | 相邻单元尺寸比达到 4 | 把 `nBufferLayers` 从 1 增到 2，检查界面尺寸比 |
| 目标量在加密后不变 | 加密区域不包含目标量敏感区 | 关闭加密重算，若结果相同说明加密无效 |
| 内存溢出或运行时间失控 | 阈值过松且无单元上限 | 加 `maxCells` 闸门并记录触发时刻的 $f$ 与 $L$ |

## 参数台账

交付需记录：指示量定义与归一化方式、$\theta_u$ 与 $\theta_l$、$L$ 与 `maxRefinement`、`nBufferLayers`、`maxCells` 与是否触发、基网格 $h_0$ 与单元数 $N_0$、每层加密的单元比例 $f$、以及加密前后目标量的变化。若只记录了阈值而没有记录对应的 $f$，换几何后阈值无法复用。

## 参考文献

1. Berger M.J., Oliger J., "Adaptive Mesh Refinement for Hyperbolic Partial Differential Equations", *Journal of Computational Physics*, 53(3): 484-512, 1984.
2. Zienkiewicz O.C., Zhu J.Z., "A Simple Error Estimator and Adaptive Procedure for Practical Engineering Analysis", *International Journal for Numerical Methods in Engineering*, 24(2): 337-357, 1987.
3. Jasak H., *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD Thesis, Imperial College London, 1996.
4. Löhner R., *Applied CFD Techniques: An Introduction Based on Finite Element Methods*, 2nd ed., John Wiley & Sons, 2008.
