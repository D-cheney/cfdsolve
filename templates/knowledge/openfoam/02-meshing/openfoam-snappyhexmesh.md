---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-snappyhexmesh
title: OpenFOAM snappyHexMesh 表面贴合与边界层网格
summary: 把 snappyHexMesh 拆成几何、背景网格、捕捉、贴合、加层阶段，给出关键字典字段与取值、加密与加层公式、失败定位顺序和可复用字典。
category: { slug: openfoam-meshing, name: OpenFOAM 网格 }
level: 工程
reading_minutes: 18
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, snappyHexMesh, STL, 边界层, addLayers]
seo:
  title: OpenFOAM snappyHexMesh 表面贴合与边界层网格
  description: 分阶段构造表面贴合与局部加密网格，给出字典字段取值、加层公式与失败定位顺序。
  keywords: [snappyHexMesh, snappyHexMeshDict, OpenFOAM STL, addLayers]
---

# OpenFOAM snappyHexMesh 表面贴合与边界层网格

`snappyHexMesh` 是 OpenFOAM 在背景六面体网格上生成**贴体网格与边界层**的主力工具。它最大的问题是"参数一多就玄学"，而根因几乎总是：把几何清理、背景网格、加密、贴合、加层混在一起一次调。可靠的用法是**把流程拆成可独立确认的阶段**，逐段验收。本文按这条主线展开，给出每个阶段的机制、关键字段、公式与失败定位方法。

## 1 结论与适用场景

- **机制**：从一个由 `blockMesh` 生成的背景六面体网格出发，按级别递归加密、切出几何、吸附表面，再挤出边界层。
- **适用**：车辆、建筑、叶片、换热器、含内部细节的装配体等复杂曲面的内流与外流。
- **不适用**：需要严格结构化、强各向异性的长通道，这类用 `blockMesh` 更省心；也不适合几何本身破损且无法清理的模型。
- **成本直觉**：每提高一级加密，体积单元数约增 8 倍，表面附近再加棱柱层；因此"先估内存与单元上限，再动手加密"。
- 核心结论：**背景网格决定方向与最粗尺度，表面 level 决定解析度，加层参数决定近壁精度**；三者要分开调、分开验。

**判断口诀**：STL 是否封闭可控、背景网格能否覆盖全域并与表面大致平行、目标 y+ 是否明确，是能否用好 snappyHexMesh 的三道门槛。任一条不满足，先解决它，再谈调参；否则只是在参数里反复碰运气。

**成本对比**：与结构化网格相比，snappyHexMesh 更省人力但更耗算力——表面附近单元数随加密级别呈立方增长，还要额外加棱柱层。因此它适合几何复杂、难以分块、但几何量级可控的模型。若目标只是粗略趋势、几何又简单，用 blockMesh 往往更快更可控。

## 2 背景与原理

整个过程是三个可独立开关的阶段，对应字典里的三个布尔量：

1. `castellatedMesh`：在背景网格上按 `level` 逐级二分，切出几何体，保留 `locationInMesh` 所在区域。这一步只做切割与加密，结果是一个有台阶的"积木块"网格。
2. `snap`：把单元面顶点吸附到三角面上，消除台阶，使壁面光滑贴体。表面与背景网格不贴合处会产生扭曲，`snapControls` 用光滑与迭代来控制这一过程。
3. `addLayers`：沿表面法向挤出棱柱层，构建贴壁边界层。加层受几何曲率、相邻面尺寸与 medial axis（中轴）约束，容易被压薄甚至删除。

**各阶段的机制**：`castellatedMesh` 只做直角切割，得到的网格呈阶梯状但拓扑干净；`snap` 反复移动表面附近的点、再做拉普拉斯光滑，用 `tolerance` 控制允许位移、`nSmoothPatch` 与 `nRelaxIter` 控制平滑程度，特征边（feature edge）会被单独吸附以保留尖锐棱边。`addLayers` 从表面向外逐层挤出，受邻域约束：一条棱柱层被夹在两条汇聚的壁面之间时，若设定的层厚总和超过可用空间，就会被压薄甚至整体删除——这正是薄壁、窄缝、尖角处覆盖率低的根源。

**为什么分阶段**：每一阶段的失败原因不同，混在一起调会让你无法判断到底是几何、背景网格还是加层参数的问题。分开后，每阶段只看一类变量，问题定位效率成倍提高。

每一级加密把单元尺寸减半，体积单元数约增 $2^3=8$ 倍，这是内存与时间的主要来源。表面加密用 `level (min max)`：`min` 是表面基础级别，`max` 是曲率与细节处允许的最大级别。背景网格的方向与质量会被继承，所以**背景网格不能草率**；背景若已非正交超标，贴合后只会更差。

**背景网格的布置要点**：单元面尽量与表面平行、方向尽量与主流一致，长宽比不要过大；覆盖范围要完整包住表面并留出一定余量，避免几何被切到域外。背景网格的质量决定了贴体网格的上限。

## 3 关键配置与公式

背景单元尺寸由域长与单元数决定：

$$
h_0 = \frac{L}{N}
$$

第 $\ell$ 级加密后的单元尺寸与单元数增长为

$$
h_\ell = \frac{h_0}{2^{\ell}}, \qquad N_\ell \propto 2^{\,3\ell}
$$

边界层按几何增长率逐层加厚，首层厚 $t_1$、增长率 $r$、层数 $n$，总厚为

$$
H = t_1 \frac{r^{\,n}-1}{r-1}
$$

末层厚度与增长率互锁：

$$
t_n = t_1\, r^{\,n-1} \;\Rightarrow\; r = \left(\frac{t_n}{t_1}\right)^{1/(n-1)}
$$

若 y+ 目标指单元中心到壁面，首层单元高度约为 $2t_1$，与 y+ 设计的换算一致。**`minThickness` 是加层失败的常客**：任何一层被压到低于该值就会被删除，局部覆盖率随之下降。以 $t_1=0.02$、$r=1.2$、$n=5$ 为例，末层 $t_5=0.02\times1.2^{4}\approx0.041$，总厚 $H=0.02(1.2^{5}-1)/0.2\approx0.149$，据此可核对是否覆盖目标边界层与首层 y+。

`relativeSizes true` 时，`finalLayerThickness` 与 `firstLayerThickness` 是**相对表面单元尺寸**的比例；改成绝对尺寸后，则需在几何单位下直接给出厚度值。首层高度还必须与目标 y+ 反算一致，由 $t_1 \approx y^+ \nu/u_\tau$（单元中心口径再乘 2），确保首层落在黏性底层。

`snapControls` 中 `tolerance` 是相对背景单元尺寸的允许位移，越大越容易贴合但越易拉坏小特征；`nSolveIter` 与 `nRelaxIter` 是求解与松弛迭代次数，过大会拖时间、过小会贴合不足。`addLayersControls` 中 `featureAngle` 决定哪些边视为需要保护的锐边，`nGrow` 则允许层在必要时向表面外扩展。这些参数之间互相牵制，应一次只动一两个并观察日志。日志会明确写出每一步保留的单元数、删除的层数与失败原因，是调参的第一手依据。

关键字段与推荐取值：

```text
castellatedMesh true; snap true; addLayers true;

castellatedMeshControls
{
    maxLocalCells       2000000;
    maxGlobalCells      20000000;
    minRefinementCells  10;
    nCellsBetweenLevels 3;
    resolveFeatureAngle 30;
    locationInMesh      (0.05 0.05 0.05);
    refinementSurfaces
    {
        body { level (2 4); patchInfo { type wall; } }
    }
    refinementRegions { wake { mode inside; levels ((1e9 3)); } }
}

snapControls
{
    nSmoothPatch     3;
    tolerance        2.0;
    nSolveIter       30;
    nRelaxIter       5;
    nFeatureSnapIter 10;
}

addLayersControls
{
    relativeSizes         true;
    expansionRatio        1.2;
    finalLayerThickness   0.3;
    minThickness          0.25;
    nGrow                 0;
    featureAngle          60;
    nRelaxIter            5;
    nSmoothSurfaceNormals 1;
    nLayerIter            50;
    layers { body { nSurfaceLayers 5; } }
}

meshQualityControls
{
    maxNonOrtho         65;
    maxBoundarySkewness 20;
    maxInternalSkewness 4;
    maxConcave          80;
    minVol              1e-13;
    minVolRatio         0.01;
    minFaceWeight       0.05;
}
```

## 4 工程做法与参数

- **清理 STL**：三角面必须封闭、无自交、无重复与退化面，法向一致，单位与命名明确。几何脏是失败的头号原因，先用 `surfaceCheck` 过一遍。
- **背景网格**：用 `blockMesh` 生成覆盖全域的六面体；方向尽量与主流一致，保证最粗尺度合理，并让单元面尽量平行于表面。
- **`locationInMesh`**：必须落在希望保留的流体区域内，且**不能正好落在表面或边界上**，否则判定歧义。
- **加密分级**：`nCellsBetweenLevels` 取 2 至 4；表面 `level` 的差不要超过 2 至 3，过渡突变会产生坏单元；区域加密（尾流、射流）用 `refinementRegions`。
- **调试顺序**：先只开 `castellatedMesh` 确认区域正确；再加 `snap` 看贴合与狭缝；最后开 `addLayers`。加层失败优先查局部表面质量、首层尺寸、总厚、层数、曲率与相邻面尺寸，而不是一味加迭代次数。
- **质量护栏**：`meshQualityControls` 在每一步后强制检查并可能回退，阈值过松会留下坏单元，过严会反复回退拖慢甚至失败。
- **表面与 patch**：`refinementSurfaces` 中的 `patchInfo` 决定生成壁面 patch 的类型与名称，新增的面要在 `0/` 里对应；内部挡板用 `faceZone`/`cellZone` 配合 `baffles` 声明。
- **y+ 闭环**：加层参数不能只看几何先验，最终要用初步流场按面积统计 y+，让首层落在目标区间。
- **几何简化**：能删的小圆角、垫片、螺栓孔先删，几何越干净，贴合越稳、单元越省。
- **并行与确定性**：大网格可并行生成，但分解方式与版本会影响表面附近细节；验收记录应包含几何文件哈希、字典、进程数、单元数与质量统计，保证可复现。

**验收要点**：贴合完成后，逐项确认最差单元的空间位置、patch 完整性、狭缝是否堵塞、层覆盖率、首层高度与增长率。对湍流计算还要用初步流场复核 y+，不能只依据几何先验宣布合格。

## 5 可复现示例

先跑"只切不贴不层"的版本（把 `snap`、`addLayers` 置 `false`）确认切割区域，再逐阶段打开：

```bash
surfaceCheck body.stl | tee log.surfaceCheck
snappyHexMesh -overwrite | tee log.snappyHexMesh
checkMesh -allGeometry -allTopology | tee log.checkMesh
```

在 `snappyHexMeshDict` 中把 `debug` 适当调大，可分别输出 castellated、snapped、layered 三个网格，便于逐段比对。**建议在每阶段结束后都用 `checkMesh` 和 ParaView 核对一次**，确认该阶段结果正确再进入下一阶段。`-overwrite` 会直接覆盖当前网格，调试阶段建议先备份。

若某个阶段反复失败，回退到上一阶段往往比在本阶段死磕更有效——例如贴合不好，先确认切割区域对不对，再怀疑 snap 参数。**日志优先**：每次运行都保存日志，把 `Cells`、`Layers`、`Failed` 等关键字提取出来对比，比反复看图更快找到突变点。

## 6 常见坑与排查

- **STL 不封闭或有自交**：`snap` 后出现漏面或内部残留面。
- **`locationInMesh` 落在面上**：区域判定错误，切出的是固体而非流体。
- **加层覆盖率低**：`minThickness` 过大、首层太薄、曲率半径小于层厚、`featureAngle` 不当。
- **表面 level 跨度太大**：级间过渡单元收缩过快，产生偏斜。
- **背景网格太粗或方向不对**：贴合区单元被严重拉伸。
- **忽略背景网格质量**：背景若已非正交超标，贴合后只会更差。
- **只信 checkMesh 通过**：还要按面积统计 y+、检查层覆盖率与狭缝是否堵塞。
- **薄壁与尖角层塌陷**：相邻面汇聚的空间放不下设定层厚，需减小 `nSurfaceLayers` 或局部层厚。
- **`snap` 把几何拉坏**：`tolerance` 过大或表面网格太粗，小特征被抹平。
- **`meshQualityControls` 过严**：反复回退、snappyHexMesh 长时间不结束，应看日志定位具体指标。
- **`locationInMesh` 太靠近壁面**：浮点误差下可能被判到固体侧，挪到区域中心附近更稳。
- **表面加密不足**：级别太低导致细节丢失，需提高 `level` 上限或增加区域加密。
- **背景网格边界太近**：几何贴近域边界处贴合质量差，应让域边离表面留出几个背景单元。

## 7 检查清单与参考

1. STL 是否封闭、法向一致、单位正确？
2. `locationInMesh` 是否稳在流体内部、远离表面？
3. 背景网格方向与尺度是否合理？
4. 表面 `level` 与区域加密是否分级平滑？
5. `addLayers` 的 `expansionRatio`、`finalLayerThickness`、`minThickness` 是否自洽？
6. `meshQualityControls` 阈值是否与求解器需求匹配？
7. 加层覆盖率、首层高度、y+ 分布是否按面积统计过？
8. 是否记录了几何哈希、字典与进程数以保证可复现？

参考资料：

1. OpenFOAM 用户指南，snappyHexMesh 章节与 `snappyHexMeshDict` 词条。
2. OpenFOAM 官方教程中 motorBike、flange 等 snappyHexMesh 算例。
3. 本项目《OpenFOAM blockMesh 参数化结构网格》《边界层网格、首层高度与 y+ 设计》。
