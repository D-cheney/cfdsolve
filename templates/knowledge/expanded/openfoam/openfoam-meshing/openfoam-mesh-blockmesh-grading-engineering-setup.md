---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-mesh-blockmesh-grading-engineering-setup
title: "blockMesh 分段与渐变：工程设置与参数选择"
summary: "从首层与末层尺寸反算 simpleGrading 比值，给出几何级数公式、multiGrading 三段语法和网格长宽比约束，附一段可核对的 0.1 m 通道手算。"
category:
  slug: openfoam-meshing
  name: "OpenFOAM 网格"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OPENFOAM"
  - "OpenFOAM 网格"
  - "blockMesh 分段与渐变"
  - "工程设置与参数选择"
  - "simpleGrading"
  - "几何级数"
seo:
  title: "blockMesh 分段与渐变：工程设置与参数选择"
  description: "从首层与末层尺寸反算 simpleGrading 比值，给出几何级数公式、multiGrading 三段语法和网格长宽比约束，附一段可核对的 0.1 m 通道手算。"
  keywords:
    - "blockMesh 分段与渐变"
    - "工程设置与参数选择"
    - "simpleGrading"
    - "expansion ratio"
---

# blockMesh 分段与渐变：工程设置与参数选择

渐变网格的作用是把单元预算堆到壁面附近，代价是引入额外的数值扩散与长宽比。`blockMesh` 提供三种写法：`simpleGrading` 单一比值、`edgeGrading` 十二条边各自比值、`multiGrading` 分段折线。选错的典型后果是首层厚度差两倍、共享面尺寸突变、或者长宽比大到 `checkMesh` 报 `high aspect ratio`。

## 几何级数与 simpleGrading 的含义

`simpleGrading (R1 R2 R3)` 中的 $R_i$ 是该方向上**末层厚度与首层厚度之比**，不是逐层增长率。层厚按几何级数排布：

$$
\Delta_k=\Delta_1\,q^{\,k-1},\qquad q=R^{1/(n-1)},\qquad L=\Delta_1\frac{q^{\,n}-1}{q-1}
$$

其中 $n$ 是该方向单元数、$L$ 是块边长、$q$ 才是逐层增长率。反解首层厚度只需 $L$ 与 $n$、$R$ 三个量：

$$
\Delta_1=\frac{L\,(q-1)}{q^{\,n}-1}
$$

把 $R$ 误当成 $q$ 代入，是渐变设置最常见的错误：$n=40$ 时两者相差近一倍。

## 0.1 m 通道的手算

设通道半高 $L=0.1\,\mathrm{m}$、$n=40$、取 `simpleGrading (6.7 1 1)`。先算增长率 $q=6.7^{1/39}$：$\ln 6.7=1.9021$，除以 39 得 0.04877，取指数得 $q\approx1.050$。再算首层：

$$
\Delta_1=\frac{0.1\times(1.050-1)}{1.050^{40}-1}=\frac{0.0050}{7.040-1}=8.28\times10^{-4}\,\mathrm{m}
$$

即首层 0.828 mm。末层 $\Delta_{40}=\Delta_1 q^{39}=8.28\times10^{-4}\times6.705=5.55\times10^{-3}\,\mathrm{m}$，比值 $5.55/0.828=6.70$，与字典里写的 $R=6.7$ 自洽。单元尺寸从 0.828 mm 递增到 5.55 mm，总长校验 $L=\sum\Delta_k=0.1\,\mathrm{m}$。

若目标首层是 0.5 mm，则 $R$ 要重算：由 $q^{39}=R$ 与 $\Delta_1=8.28\times10^{-4}$ 的对应关系，把 $\Delta_1$ 缩到 0.5 mm 需 $R$ 从 6.7 降到约 3.3，代价是末层只有 1.65 mm，过渡变缓。

## 三段 multiGrading 与边级控制

当渐变需要“近壁密、中段匀、外侧再拉”时，用 `multiGrading`。每个三元组是 `(长度分数 单元数分数 该段末/首比值)`，长度分数之和必须为 1，单元数分数之和也必须为 1。

```text
blocks
(
    hex (0 1 2 3 4 5 6 7) (40 20 1)
    multiGrading
    (
        (0.2 0.5 5)     // 近壁段：占 20% 长度、50% 单元、末/首 = 5
        (0.6 0.4 1)     // 中段：占 60% 长度、40% 单元、均匀
        (0.2 0.1 0.2)   // 外侧：占 20% 长度、10% 单元、末/首 = 0.2
    )
);
```

近壁段 20 个单元铺 20 mm，末/首比值 5，反算首层 $\Delta_1=0.02\times(q-1)/(q^{20}-1)$，$q=5^{1/19}=1.0885$，得 $\Delta_1=0.02\times0.0885/(5.434-1)=4.00\times10^{-4}\,\mathrm{m}$，即 0.40 mm。中段 16 个单元铺 60 mm，单元 3.75 mm；外侧 4 个单元铺 20 mm，首层与末层比值 0.2，单元从 8.33 mm 收到 1.67 mm。三段的单元尺寸在交界处分别为 2.0 mm、3.75 mm、8.33 mm，比值 1.9 与 2.2，属于可接受的过渡。

`edgeGrading` 则给出 12 个值（每个方向 4 条边的比值），用于块被弯曲、四条边长度不等的场合；此时 `simpleGrading` 会把四个方向统一成一个比值，容易在短边上过密。

## 长宽比与过渡比的护栏

网格长宽比定义为最大边与最小边之比：

$$
AR=\frac{h_{\max}}{h_{\min}},\qquad \eta_k=\frac{\Delta_{k+1}}{\Delta_k}
$$

壁面解析用的边界层网格，$AR$ 达到 100 量级是正常的；但同一个单元面内的 $AR$ 超过约 200 会显著恶化对角占优性。相邻单元的过渡比 $\eta_k$ 建议控制在 1.2 以内，级数渐变天然满足；`multiGrading` 的段间跳变才需要单独检查。上面算例的段间跳变 1.9 与 2.2 已接近上限，若再放大到 3 以上，`checkMesh` 的 `max skewness` 会明显上升。

另外注意展向：2D 算例常把 $z$ 方向设成 1 个单元，此时 $h_3$ 就是几何厚度本身。若厚度取 0.01 m 而面内首层 0.4 mm，$AR=25$，在可接受范围；但如果把厚度误取成 1 m 做“伪 2D”，$AR$ 会到 2500，求解器压力修正方程的条件数会立刻恶化。

生成后可以直接把层厚提取出来核对，而不必只看 `checkMesh`：

```bash
blockMesh 2>&1 | tee log.blockMesh
postProcess -func "writeCellCentres" -time 0
checkMesh -allGeometry | grep -E "aspect ratio|non-orthogonality"
```

`writeCellCentres` 写出每个单元的中心坐标，取同一列相邻两个中心之差即为该处层厚，与手算的 $\Delta_1$、$\Delta_n$ 对照即可确认渐变是否按预期分布。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 首层厚度与设计差近 2 倍 | 把 `simpleGrading` 的末/首比值当成逐层增长率 | 用 $\Delta_1=L(q-1)/(q^n-1)$ 手算并与网格量测对照 |
| 相邻两块在共享面上尺寸突变 | 两块在该方向的 $n$ 或 $R$ 不同 | 提取两层单元中心间距，比值应接近 1 |
| `checkMesh` 报高长宽比 | 单方向 $R$ 过大或展向取了伪厚度 | 看 `max aspect ratio` 实际值与出现位置 |
| 段间出现坏单元 | `multiGrading` 相邻段尺寸跳变超过 2 倍 | 逐段手算末层与首层尺寸并对比 |
| `multiGrading` 解析报错 | 长度分数之和或单元数分数之和不为 1 | 把两个分数列分别求和 |
| 壁面 y+ 与设计不符 | 首层按单元中心还是壁面距口径混淆 | 用 $y^+=\Delta_1 u_\tau/(2\nu)$ 反算并对比求解器输出 |
| 过渡区残差抬升 | 渐变比过陡导致数值扩散 | 把 $R$ 减半重跑，比较同一监测点的时间平均 |

## 可复现记录

渐变参数必须与手算一起归档，否则换人接手时无法判断 $R$ 是设计值还是随手填的。记录项建议为：方向、$L$（m）、$n$、$R$、$q$、$\Delta_1$（mm）、$\Delta_n$（mm）、$AR$。上例中该行为：`x2, 0.1, 40, 6.7, 1.050, 0.828, 5.55, 6.7`。

改动 $n$ 而保留 $R$ 会同时改变 $\Delta_1$ 和 $\Delta_n$：$n$ 从 40 提到 60、$R$ 仍取 6.7 时，$q=6.7^{1/59}=1.0326$，$\Delta_1=0.1\times0.0326/(1.0326^{60}-1)=0.1\times0.0326/(6.83-1)=5.60\times10^{-4}\,\mathrm{m}$，首层从 0.828 mm 降到 0.560 mm，末层升到 3.75 mm。也就是说，加密并不只是“变细”，它同时改变了渐变形状，必须重算。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide* v11, §3.2.4 "Grading", 2023.
2. OpenFOAM v11 源码 `src/mesh/blockMesh/blockMesh/blockDescriptor/blockDescriptor.C` 中 `simpleGrading`/`edgeGrading`/`multiGrading` 的解析与 `calcCellSizes`。
3. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020, §4.6 "Non-uniform grids".
4. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007, §4.3.3.
5. P. J. Roache, *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
6. I. B. Celik, U. Ghia, P. J. Roache, C. J. Freitas, H. Coleman, P. E. Raad, "Procedure for estimation and reporting of uncertainty due to discretization in CFD applications", *Journal of Fluids Engineering*, 130(7): 078001, 2008.
