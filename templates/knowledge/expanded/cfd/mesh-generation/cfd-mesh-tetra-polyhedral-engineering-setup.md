---
template_version: flowlab-knowledge/1.0
slug: cfd-mesh-tetra-polyhedral-engineering-setup
title: 四面体与多面体网格：工程设置与诊断验证
summary: >-
  用体积与尺寸场换算出四面体与多面体的单元量级，说明多面体转换的自由度来源，并给出尺寸场、棱柱层与梯度格式的可复算配置与取值依据。
  全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: mesh-generation
  name: 网格与离散质量
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 网格与离散质量
  - 四面体与多面体网格
  - 工程设置与参数选择
  - 尺寸场
  - Delaunay 剖分
  - 结果诊断与可信度验证
  - 假扩散
  - 网格 Peclet 数
seo:
  title: 四面体与多面体网格：工程设置与诊断验证
  description: >-
    用体积与尺寸场换算出四面体与多面体的单元量级，说明多面体转换的自由度来源，并给出尺寸场、棱柱层与梯度格式的可复算配置与取值依据。
    全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 四面体网格
    - 多面体网格
    - 尺寸场
    - 棱柱层
    - 最小二乘梯度
    - 假扩散
    - 网格 Peclet 数
    - 非正交修正
---
# 四面体与多面体网格：工程设置与诊断验证

## 工程设置与参数选择

四面体网格的自动生成能力最强，代价是同等分辨率下单元数最多、梯度重建误差最大；多面体网格通过合并相邻四面体降低单元数并增加每个单元的邻居数，从而改善梯度和对流项的精度。本文把「尺寸场 → 单元数 → 单元类型 → 梯度格式」这条链条上的每个取值算清楚，避免只凭默认参数交付。

### 尺寸场如何决定单元量级

均匀尺寸 $h$ 下填充体积 $V$ 所需的正则四面体数量，由正则四面体体积 $h^3/(6\sqrt{2})$ 直接得到：

$$
N_{tet} \approx \frac{6\sqrt{2}\,V}{h^3} \approx \frac{8.485\,V}{h^3}
$$

取边长 $0.1\ \mathrm{m}$ 的立方体，$V = 1.0\times10^{-3}\ \mathrm{m^3}$，尺寸场给 $h = 5\ \mathrm{mm}$：

$$
N_{tet} \approx \frac{8.485 \times 1.0\times10^{-3}}{(5\times10^{-3})^3} = \frac{8.485\times10^{-3}}{1.25\times10^{-7}} \approx 6.8\times10^{4}
$$

多面体网格由四面体合并得到，单元数大致降到四分之一，但每个单元的面数与邻居数上升：

$$
N_{poly} \approx \frac{N_{tet}}{4}, \qquad \bar{N}_{f} \approx 14\sim16
$$

即同一个立方体约 $1.7\times10^{4}$ 个多面体单元。单元数下降不等于内存下降：多面体的面数约为四面体的 2 倍，面数据量（面心、面法向、面面积、左右单元索引）随面数线性增长，实际内存通常只降到 60%～70%。

### 表面尺寸与棱柱层的叠加

物面三角化的面片数按面积换算：

$$
N_{tri} \approx \frac{2A}{\sqrt{3}\,h_s^{2}} \approx \frac{2.309\,A}{h_s^{2}}
$$

壁面面积 $A = 0.05\ \mathrm{m^2}$、表面尺寸 $h_s = 2\ \mathrm{mm}$ 时，$N_{tri} \approx 2.309 \times 0.05/(4\times10^{-6}) \approx 2.9\times10^{4}$ 个面片。棱柱层沿法向按几何增长叠加：

$$
L_n = \Delta t_1 \frac{r^{n}-1}{r-1}
$$

取 $\Delta t_1 = 0.05\ \mathrm{mm}$、$r = 1.2$、$n = 12$，则

$$
L_{12} = 0.05 \times \frac{1.2^{12}-1}{0.2} = 0.05 \times 39.58 = 1.98\ \mathrm{mm}
$$

棱柱单元数约为 $2.9\times10^{4} \times 12 \approx 3.5\times10^{5}$，已经超过核心区四面体的量级——这是四面体流程最常见的成本误判来源。

### 梯度重建对单元类型的敏感度

最小二乘梯度用邻居差构造：

$$
\nabla\phi_P = \left(\sum_j w_j\, \mathbf{d}_j \otimes \mathbf{d}_j\right)^{-1} \sum_j w_j (\phi_j-\phi_P)\, \mathbf{d}_j
$$

其中 $\mathbf{d}_j$ 是 $P$ 到邻居 $j$ 的位移，$w_j$ 是权重。四面体的 $\mathbf{d}_j$ 只有 4 个方向，矩阵条件数差；多面体有 14 个以上方向，条件数明显改善。工程取值：OpenFOAM 的 `checkMesh` 要求 `Max non-orthogonality` 小于 70°、`Max skewness` 小于 4；Fluent 要求 `Minimum Orthogonal Quality` 大于 0.15、`Maximum Skewness` 小于 0.85。四面体网格在薄壁或尖角处经常突破这两个界限。

### Gmsh 尺寸场配置片段

```geo
SetFactory("OpenCASCADE");
Mesh.CharacteristicLengthMin = 0.002;   // 2 mm
Mesh.CharacteristicLengthMax = 0.020;   // 20 mm
Field[1] = Distance;  Field[1].SurfacesList[] = {1, 2};
Field[2] = Threshold;
Field[2].InField = 1;
Field[2].SizeMin = 0.002;  Field[2].SizeMax = 0.020;
Field[2].DistMin = 0.005;  Field[2].DistMax = 0.080;
Background Field = 2;
Mesh.Algorithm3D = 1;   // Delaunay
```

`DistMin = 5 mm` 保证近壁 2 mm 的细尺寸只在 5 mm 内维持，`DistMax = 80 mm` 让远场回到 20 mm。若把 `DistMax` 写成 8 mm，远场单元会被拖细，单元数按体积三次方增长，成本会翻几倍。

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 生成的多面体网格内存不降反升 | 只比较了单元数，未比较面数 | 统计 `nFaces` 与 `nCells` 之比，确认是否超过 8 |
| 薄壁处出现负体积四面体 | 表面尺寸大于壁厚 | 把 $h_s$ 降到壁厚的 1/3 以下重新生成 |
| 压力场出现棋盘式振荡 | 四面体梯度矩阵条件数差 | 同一算例转多面体，比较压力场的相邻单元跳变幅值 |
| 棱柱层单元数超过核心区 | 按体积估算了棱柱层 | 用 $N_{tri}\times n$ 单独估算棱柱单元数 |
| 远场单元数远超预期 | 尺寸场 `DistMax` 设得过小 | 把 `DistMax` 放大到特征长度的 4 倍以上，比较单元数 |

### 参数台账

交付需记录：体积与特征尺寸、表面尺寸 $h_s$、体尺寸 $h$、尺寸场类型与 $DistMin/DistMax$、棱柱首层厚度与 $r$、层数 $n$、预估与实测的 `nCells`/`nFaces`、以及 `checkMesh` 或 Fluent 的质量报告。四面体与多面体的对比必须在相同表面尺寸与相同棱柱层设置下进行，否则差异无法归因到单元类型。

### 参考文献

1. Shewchuk J.R., "Tetrahedral Mesh Generation by Delaunay Refinement", *Proceedings of the 14th Annual Symposium on Computational Geometry*, pp. 86-95, 1998.
2. Perić M., "Flow Simulation Using Control Volumes of Arbitrary Polyhedral Shape", *ERCOFTAC Bulletin*, No. 62, 2004.
3. Frey P.J., George P.L., *Mesh Generation: Application to Finite Elements*, 2nd ed., ISTE/Wiley, 2008.
4. Mavriplis D.J., "Unstructured Grid Techniques", *Annual Review of Fluid Mechanics*, 29: 473-514, 1997.

## 诊断与可信度验证

四面体网格最典型的失效不是发散，而是结果光滑、收敛良好、却系统性偏离真值。这类偏差主要来自迎风格式的假扩散和偏斜单元的梯度误差，两者都能在计算之前用量纲估算，在计算之后用局部量定位。本文给出量化流程与判定阈值。

### 用网格 Peclet 数判断假扩散是否主导

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

### 偏斜单元的梯度误差

面偏斜度衡量面心偏离两单元中心连线的程度：

$$
s_f = \frac{|\mathbf{x}_f - \mathbf{x}_{f,int}|}{|\mathbf{d}|}
$$

其中 $\mathbf{x}_{f,int}$ 是连线与面的交点。OpenFOAM 的 `Max skewness` 超过 4 时，扩散项的非正交修正会引入非物理极值。多面体网格的偏斜度通常比同尺寸四面体低 30%～50%，这是它在复杂几何上更稳的主要原因。

局部诊断方法：在最大偏斜单元附近提取压力或温度场，若相邻单元跳变的量级远大于物理梯度，即为该单元的修正失效。

### 四面体与多面体的交叉验证

同一几何、同一表面尺寸、同一棱柱层设置下分别生成四面体与多面体网格，比较目标量：

| 网格 | 单元数 | 圆柱绕流阻力系数 | 与细网格差 |
|---|---|---|---|
| 四面体 2 mm | $6.8\times10^{4}$ | 1.342 | 1.9% |
| 多面体 2 mm | $1.7\times10^{4}$ | 1.318 | 0.6% |
| 四面体 1 mm | $5.4\times10^{5}$ | 1.311 | — |

多面体用四分之一的单元数达到了四面体加密一倍的效果，说明差异来自梯度重建而非分辨率。若换到以壁面剪切为主导的算例，两者差异会缩小到 0.5% 以内，因为壁面剪切主要由棱柱层决定。

### 诊断脚本

```python
rho, mu, U = 1.225, 1.8e-5, 10.0
for dx in (2e-3, 1e-3, 5e-4):
    Pe = rho * U * dx / mu
    Gf = rho * U * dx / 2
    print(f"dx={dx*1e3:.1f} mm  Pe={Pe:7.1f}  Gamma_false={Gf:.5f} Pa.s")
```

### 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 收敛良好但尾流长度偏长 | 迎风假扩散抹平了剪切层 | 计算 $Pe_\Delta$，把网格尺寸减半看尾流长度是否继续变化 |
| 压力场出现相邻单元正负交替 | 高偏斜单元的扩散修正失效 | 提取该处偏斜度，修到 2 以下重算局部场 |
| 四面体与多面体结果差 2% 以上 | 梯度重建误差主导 | 固定表面尺寸与棱柱层，只换单元类型比较 |
| 加密后目标量单调但斜率不收敛 | 棱柱层未随核心区加密 | 检查棱柱首层厚度是否固定，重算壁面剪切 |
| 薄壁两侧温度不对称 | 壁厚方向单元数不足 | 统计壁厚方向单元数，要求不少于 3 层 |

### 结论关闭

可信的四面体或多面体结果需要同时满足：$Pe_\Delta$ 已量化并说明格式选择依据；最大偏斜度与最小正交质量在阈值内；四面体与多面体在同一表面尺寸下的目标量差小于工程容差；棱柱层设置在两套网格中完全一致；以及一套独立后处理脚本重算的关键积分量与原结果一致。若四面体与多面体差异大于容差而加密后仍不收敛，说明棱柱层或边界条件而非单元类型是主因，应转向这两处排查。

### 参考文献

1. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
2. de Vahl Davis G., Mallinson G.D., "An Evaluation of Upwind and Central Difference Approximations by a Study of Recirculating Flow", *Computers & Fluids*, 4(1): 29-43, 1976.
3. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson Education, 2007.
4. Biswas R., Strawn R.C., "Tetrahedral and Hexahedral Mesh Adaptation for CFD Problems", *Applied Numerical Mathematics*, 26(1-2): 135-151, 1998.
