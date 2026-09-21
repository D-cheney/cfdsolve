---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-snappy-snap-engineering-setup
title: "snappyHexMesh 吸附阶段：工程设置与参数选择"
summary: "把 snapControls 的容差、平滑次数、特征吸附与求解迭代翻译成可核对的位移量，给出台阶残留、尖角拉平和负体积三类失败的具体判定命令。"
category:
  slug: openfoam-meshing
  name: "OpenFOAM 网格"
level: 工程
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OPENFOAM"
  - "OpenFOAM 网格"
  - "snappyHexMesh 吸附阶段"
  - "工程设置与参数选择"
  - "snapControls"
  - "feature edge"
seo:
  title: "snappyHexMesh 吸附阶段：工程设置与参数选择"
  description: "把 snapControls 的容差、平滑次数、特征吸附与求解迭代翻译成可核对的位移量，给出台阶残留、尖角拉平和负体积三类失败的具体判定命令。"
  keywords:
    - "snappyHexMesh 吸附阶段"
    - "工程设置与参数选择"
    - "snapControls"
    - "nSmoothPatch"
---

# snappyHexMesh 吸附阶段：工程设置与参数选择

吸附阶段把切割后阶梯状网格的表面顶点移到三角面上，使壁面连续贴体。它不改变单元数，只改变顶点坐标，因此失败的表现形式是质量指标恶化而不是单元丢失：台阶没抹平、尖角被拉圆、或者局部出现负体积。调参的关键是把 `snapControls` 里的每个数翻译成一个可量测的位移量。

## 容差与允许位移

`tolerance` 是相对局部单元尺寸的允许位移上限：

$$
\delta_{max}=\text{tolerance}\cdot h_\ell
$$

在 3 级加密、$h_0=50\,\mathrm{mm}$ 的算例里 $h_3=50/8=6.25\,\mathrm{mm}$，取 `tolerance 2.0` 时 $\delta_{max}=12.5\,\mathrm{mm}$。这个数字看起来很大，但它是“单次允许”的上限，实际位移由表面距离决定，通常只有 $0.1\sim0.5$ 个单元。若某个顶点距三角面 12 mm 以上，它就不会被吸附，台阶留在这里。

把 `tolerance` 从 2.0 降到 1.0，$\delta_{max}$ 变成 6.25 mm，尖角处被拉动的顶点减少，形状保住，但残留在 6～12 mm 距离上的台阶也保住了。这就是容差的两难：调大治台阶，调小保尖角。

## 拉普拉斯平滑与迭代次数

每次平滑把顶点向其邻点平均位置移动，带松弛因子 $\omega$ 的形式为

$$
\mathbf{x}^{k+1}=\mathbf{x}^{k}+\omega\left(\bar{\mathbf{x}}^{k}-\mathbf{x}^{k}\right),\qquad \bar{\mathbf{x}}^{k}=\frac{1}{N_n}\sum_{j=1}^{N_n}\mathbf{x}_j^{k}
$$

`nSmoothPatch` 是平滑作用于表面附近 patch 的次数，`nRelaxIter` 是外层迭代次数，`nSolveIter` 是位移方程的内部求解迭代数。三者的分工是：`nSmoothPatch` 决定表面有多光滑，`nRelaxIter` 决定整体收敛多少次，`nSolveIter` 决定每次内部解算的精度。

`nSmoothPatch` 从 3 提到 6，表面点的法向偏差通常会下降一个量级，但代价是小曲率特征被整体抹平。判据是：如果几何上有 $R=2\,\mathrm{mm}$ 的倒圆而 $h_3=6.25\,\mathrm{mm}$，倒圆本身只占 $0.32$ 个单元，平滑次数越高它消失得越快。这种情况下应先在 `refinementSurfaces` 里把该处 `level` 提到 4 或 5，再谈平滑次数。

## 特征吸附与字典

```text
snapControls
{
    nSmoothPatch           3;
    tolerance              2.0;
    nSolveIter             30;
    nRelaxIter             5;
    nFeatureSnapIter       10;
    implicitFeatureSnap    false;
    explicitFeatureSnap    true;
    multiRegionFeatureSnap false;
    nSmoothInternal        0;
    featureAttractionDistance 0.0;   // 相对局部单元尺寸
}
```

`explicitFeatureSnap true` 依赖 `surfaceFeatureExtract` 生成的 `.eMesh` 文件；若字典里开了它却没有特征边网格，snappyHexMesh 会以 `Cannot find file ...eMesh` 中止。`implicitFeatureSnap` 则直接从表面法向夹角推断特征，不需要额外文件，但对噪声法向敏感。工程上通常两者只开一个：几何干净用 `explicitFeatureSnap`，几何来自扫描数据、法向抖动明显时用 `implicitFeatureSnap`。

`featureAttractionDistance` 是特征边的吸引半径，按局部单元尺寸归一化。取 0.5 时，距特征边 0.5 个单元的顶点会被吸到边上。设这个值过大会把本应平滑的圆角拉成折线。

## 表面偏差的定量验收

吸附后必须量测实际表面偏差，而不是只看 `checkMesh` 通过。做法是取吸附前后网格中同一批表面顶点，比较它们到三角面的距离：

$$
\varepsilon_{rms}=\sqrt{\frac{1}{N_p}\sum_{i=1}^{N_p}d_i^{2}},\qquad d_i=\min_{T}\left|\mathbf{x}_i-\mathbf{p}_T\right|
$$

其中 $d_i$ 是顶点 $i$ 到最近三角面的距离。若 $\varepsilon_{rms}$ 与弦高容许值 $\varepsilon$ 同量级，说明吸附到位；若 $\varepsilon_{rms}$ 明显大于 $\varepsilon$，说明还有台阶未消。以圆柱 $R=50\,\mathrm{mm}$、容许偏差 $0.2\,\mathrm{mm}$ 为例，$\varepsilon_{rms}$ 应在 $0.1\,\mathrm{mm}$ 量级。

## 位移与质量指标的联动

吸附把点移向表面，必然牺牲单元正交性。位移后的非正交角大致随 $\delta/h$ 增大：

$$
\theta_{nonorth}\;\approx\;\arctan\!\left(\frac{\delta}{h_\ell}\right)\cdot\frac{180°}{\pi}
$$

取 $\delta=2.0\,\mathrm{mm}$、$h_\ell=6.25\,\mathrm{mm}$，$\delta/h_\ell=0.32$，$\theta\approx17.7°$，仍在 `maxNonOrtho 65` 之内。若某处 $\delta$ 达到 0.8 个单元，$\theta\approx38.7°$，加上切割阶段本身的角度，就逼近 65° 的护栏了。这条估算解释了为什么“把 tolerance 一路调大”最终会以 `maxNonOrtho exceeded` 收场。

```bash
snappyHexMesh -overwrite 2>&1 | tee log.snap
grep -E "Snapping|moved|Error" log.snap
checkMesh -allGeometry -allTopology | tee log.checkMesh.snap
```

日志中的 `Snapping ... moved N points` 是判断吸附是否真正发生的直接依据。若 N 接近 0，多半是 `tolerance` 太小或背景网格与表面距离过大。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 表面仍有明显台阶 | `tolerance` 偏小，顶点位移不够 | 提高到 3.0 重跑，看台阶处顶点是否移动 |
| 尖角被拉平、特征丢失 | `tolerance` 偏大或 `nSmoothPatch` 过大 | 单独把 `nSmoothPatch` 降回 1 对比尖角坐标 |
| 棱边被磨圆 | 未生成 `.eMesh` 或特征吸附未开 | 检查 `explicitFeatureSnap` 与特征边文件是否存在 |
| 吸附后出现负体积 | 局部位移超过单元尺度 | `checkMesh` 的 `minVol` 与 `max non-orthogonality` |
| 日志显示 `moved 0 points` | 背景网格太粗或 `tolerance` 过小 | 先减小 $h_0$ 或提高 `level` 再吸附 |
| 表面出现波浪状起伏 | `nSmoothPatch` 不足 | 提到 6 后重新量测 $\varepsilon_{rms}$ |
| 吸附耗时异常长 | `nSolveIter` 与 `nRelaxIter` 同时调大 | 对比每次迭代的日志耗时 |
| 并行与串行结果不同 | 分解后表面跨进程，特征吸附局部化 | 串行吸附后再 `decomposePar` |

## 单因素对照与记录

吸附阶段值得做的对照只有三组：`tolerance` 取 1.0/2.0/3.0；`nSmoothPatch` 取 1/3/6；特征吸附开关切换。每组只改一个量，其余固定，输出统一用 `checkMesh -allGeometry` 的 `max non-orthogonality`、`max skewness` 与自算的 $\varepsilon_{rms}$ 三项对比。记录里必须写明 $h_0$、$\ell$、$\delta_{max}$（mm）、实际移动点数、$\varepsilon_{rms}$（mm）、$\theta_{nonorth}$（°），这六项才能复现一次吸附。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §4.4.2 "Snapping", 2023.
2. OpenFOAM v11 源码 `src/mesh/snappyHexMesh/snappyHexMeshDriver/snapDriver.C`、`snapParameters.H`。
3. D. A. Field, "Laplacian smoothing and Delaunay triangulations", *Communications in Applied Numerical Methods*, 4(6): 709–712, 1988.
4. J. F. Thompson, B. K. Soni, N. P. Weatherill (eds.), *Handbook of Grid Generation*, CRC Press, 1999, Chapter 6 "Surface projection and smoothing".
5. P. J. Frey, P.-L. George, *Mesh Generation: Application to Finite Elements*, 2nd ed., ISTE/Wiley, 2008, §6.4 "Node relocation and smoothing".
6. OpenFOAM v11 教程 `tutorials/multiphase/interFoam/laminar/waterChannel` 的 `snappyHexMeshDict` 吸附段设置。
