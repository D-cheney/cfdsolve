---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-mesh-field-types
title: OpenFOAM 14 polyMesh、fvMesh、几何量与场类型
summary: 从 points、faces、owner、neighbour 构造多面体拓扑，解释 fvMesh 的单元体积与面几何量、deltaCoeffs 的推导，以及 vol/surface/point 场、内部场与 patch field 的模板组合与守恒含义。
category: { slug: openfoam-v14-discretization, name: OpenFOAM 14 数学与离散 }
level: 进阶
reading_minutes: 20
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
seo:
  title: OpenFOAM 14 polyMesh、fvMesh 与场类型体系
  description: 讲清多面体网格拓扑、单元体积与面法向几何量、deltaCoeffs 的投影推导，以及 vol/surface/point 与 patch field 的模板组合。
  keywords: [OpenFOAM14, polyMesh, fvMesh, GeometricField, 网格拓扑]
tags: [OpenFOAM14, polyMesh, fvMesh, GeometricField, 网格拓扑]
---

# OpenFOAM 14 polyMesh、fvMesh、几何量与场类型

## 1. 结论与适用场景

OpenFOAM 14 把网格拆成两层：`polyMesh` 保存纯拓扑（点、面、单元及其连接关系），`fvMesh` 在其上叠加有限体积所需的几何量与离散配置。理解这条分工，是读懂一切离散代码的前提：拓扑回答“谁和谁相邻”，几何回答“距离、面积、体积各是多少”，而离散格式只消费几何，不关心拓扑细节。内部面恰好有一个 owner 与一个 neighbour；边界面只有 owner，并由 `boundaryMesh` 按 patch 分组。

适用场景包括：自定义网格生成或网格变形后核对几何量；理解面法向、面中心与单元中心如何决定离散系数；排查 `checkMesh` 报出的非正交、扭曲或负体积问题；以及在读取场文件时弄清 `volScalarField`、`surfaceScalarField`、`pointScalarField` 的差异。不适用场景是完全不涉及单元中心离散的有限差分/有限元算法——它们不使用 owner/neighbour 这套约定。

之所以把话题起点放在几何而不是离散格式上，是因为有限体积法中几乎每个系数都是几何量的函数：扩散系数含面面积与间距之比，对流系数含面通量与面面积，梯度重构含面法向。几何一旦错，格式再高阶也无效。反过来，只要几何量正确，很多“格式问题”其实会自动消失。因此读离散代码前先建立几何量的直觉，是最省时间的路径。

离散的根基是高斯散度定理：把单元上的体积分散度转成面通量之和。这正是“单元中心 + 面几何”能够成立的数学依据：

$$
\int_{V_P}\nabla\cdot\mathbf{F}\,dV=\oint_{\partial V_P}\mathbf{F}\cdot d\mathbf{S}\approx\sum_{f\in P}\mathbf{F}_f\cdot\mathbf{S}_f
$$

## 2. 总体架构

`polyMesh` 的最小数据是四张表：`points()`（顶点坐标）、`faces()`（每个面的顶点索引）、`faceOwner()`、`faceNeighbour()`。内部面的 owner 与 neighbour 给出两侧单元号，边界面只有 owner 且被记为负值占位；`boundaryMesh()` 把边界面按 patch 切成连续区间，使每种边界条件能独立处理。`cells()` 则给出每个单元的“点—面—边”邻接，供梯度重构与插值使用。

`fvMesh` 在此基础上计算并缓存几何量：单元体积 `V()`、面面积向量 `Sf()` 与面积大小 `magSf()`、面中心 `Cf()`、单元中心 `C()`、面法向距离 `delta()`，以及把几何压缩成离散系数的 `deltaCoeffs()` 与 `nonOrthDeltaCoeffs()`。这些量在网格读入或拓扑改变后由 `fvMesh` 统一更新，离散算子只读不写，从而保证同一份几何被所有方程共享。`fvMesh` 同时是注册表，所以挂在它上面的场可以按名被模型查找。

边界组织值得单独说明。`boundaryMesh()` 把边界面按 patch 切为连续区间，每个 patch 除了几何类型，还记录 `nFaces` 与 `startFace`，使得“把 patch 当作一段连续面数组”成为可能。这种“连续分块”设计让边界条件的遍历不需要额外的索引表，也让并行分区时能以整块粒度划分。理解这一点，就能解释为何边界字段的存储单位是“逐 patch 的数组”而不是“逐面”。

单元体积的构造是“面金字塔之和”：把每个面与该单元中心构成一个金字塔，累加带符号体积即可得到总容积，这也是多面体单元能处理任意面数的关键：

$$
V_P=\frac{1}{3}\sum_{f\in P}\mathbf{S}_f\cdot(\mathbf{C}_f-\mathbf{C}_P)
$$

其中 $\mathbf{S}_f$ 指向 owner 外侧，使相邻单元的体积符号自然抵消。

网格质量与这些几何量直接挂钩。非正交角衡量面法向与“owner—neighbour”连线的夹角偏离度，它越大，扩散项的非正交修正项越重；若修正不足，截断误差会明显上升。长宽比衡量单元各向拉伸程度，过大时面插值精度下降；扭曲度衡量面中心相对单元中心连线的偏移，过大会玷污梯度重构。`checkMesh` 把这些量汇总为可直接判读的报告，是网格阶段的必看输出。需要强调的是，这些指标不能互相替代：非正交良好但长宽比极差的网格，仍然会让离散结果变差。

## 3. 关键类与调用链

一条典型链条是：`polyMesh` 从 `constant/polyMesh` 读入 points、faces、owner、neighbour、boundary → `fvMesh` 据此计算几何量并写入注册表 → 离散算子通过 `mesh.Sf()`、`mesh.deltaCoeffs()`、`mesh.V()` 取用 → 场通过 `GeometricField` 持有对 mesh 的引用与内部值、边界字段。

```text
polyMesh        ->  points / faces / owner / neighbour / boundary
fvMesh          ->  Sf() / magSf() / Cf() / C() / V() / deltaCoeffs()
fvc / fvm       ->  用面几何组装通量与矩阵系数
GeometricField  ->  internalField() + boundaryField() + mesh 引用
```

面法向梯度是离散里被反复用到的量。把面两侧单元中心连线记为 $\mathbf{d}_f=\mathbf{C}_N-\mathbf{C}_P$，正交部分给出主系数，非正交残余由插值梯度修正：

$$
(\nabla\phi)_f\cdot\mathbf{S}_f=\underbrace{\frac{\mathbf{d}_f\cdot\mathbf{S}_f}{\mathbf{d}_f\cdot\mathbf{d}_f}}_{\Delta_f}(\phi_N-\phi_P)+\underbrace{\left(\mathbf{S}_f-\frac{\mathbf{d}_f\cdot\mathbf{S}_f}{\mathbf{d}_f\cdot\mathbf{d}_f}\mathbf{d}_f\right)}_{\mathbf{k}_f}\cdot(\overline{\nabla\phi})_f
$$

`deltaCoeffs()` 正是 $\Delta_f$ 的存储形式。owner/neighbour 的符号约定使同一内部面通量在相邻单元中一正一负，离散层天然保持局部守恒——这也是为什么 OpenFOAM 不需要额外的守恒修正。

把这个式子代回扩散项，就能看出离散系数的来源：对于拉普拉斯项，面通量近似为 $\Gamma_f\Delta_f(\phi_N-\phi_P)$，其中 $\Gamma_f$ 是面插值后的扩散系数，$\Delta_f$ 是几何项。矩阵的上下三角系数就是 $\pm\Gamma_f\Delta_f$，对角是它们的和。换言之，`fvm::laplacian` 在底层做的事情，就是把这条几何关系系统地填写进 LDU 三组数组。理解了这一转换，从几何到矩阵的“黑箱”就变成了一条透明流水线。

## 4. 代码走读要点

场类型由 `GeometricField<Type, PatchField, GeoMesh>` 模板三元组确定。`volScalarField` 是单元中心标量，`volVectorField` 是单元中心矢量，`surfaceScalarField` 常保存面通量，`pointScalarField` 则定义在网格点上。它们的共同结构是“内部值 + 边界字段 + 量纲 + mesh 引用”：内部值是逐单元的数组，边界字段是逐 patch 的数组，量纲由 `dimensionSet` 描述并在运算中检查。

读 `fvPatchField` 时要区分两层概念：几何 patch 描述拓扑连接（例如 `wall`、`patch`、`empty`），`fvPatchField` 描述某个场在该 patch 上的数学边界行为（例如 `fixedValue`、`zeroGradient`、`fixedFluxPressure`）。网格 patch 类型与字段边界类型不是同一层，但耦合边界（如 `cyclic`、`processor`）必须两侧兼容，否则构造期报错。`empty` patch 用于二维或轴对称情形，它要求对应方向上的场“无分量”，是几何与场耦合的典型案例。

关于性能，`fvMesh` 的几何量是缓存而非每次重算，因此网格一旦变形（如动网格），必须显式触发几何更新（`mesh.update()` 或对应的 mover），否则离散会用到过期几何。二次开发中若手工改动了点坐标，务必确认几何已刷新。

另一个容易被忽视的层面是量纲。`GeometricField` 携带一个 `dimensionSet`，加、减、乘、除、积分都会检查量纲一致性；量纲不匹配会在运行期中断，而不是默默给出错结果。这对数值稳定性反而有益：它把很多“单位写错”的错误提前拦截在构造阶段。相应地，二次开发中应给期望的物理量赋予正确量纲，而不是用 `dimensionedScalar` 随意填充，否则会失去这层安全检查。

在内存布局上，内部值与边界字段底层都是 `Field`（实际上是 `List` 的派生），所以逐单元访问是连续数组，效率较高；真正的开销来自跨单元耦合，即矩阵装配与求解。这也解释了为何有限体积代码强调“先做显式、只在必要时隐式”：显式操作只是数组运算，隐式操作才会构造矩阵并进入迭代。

## 5. 可复现示例

下面演示如何读取一个场并核对它与网格的对应关系，以及用工具检查网格几何：

```cpp
// 读取压力场并核对规模与 patch 数量
const volScalarField& p = mesh.lookupObject<volScalarField>("p");
Info<< "cells = " << mesh.nCells()
    << ", internal faces = " << mesh.nInternalFaces()
    << ", p size = " << p.size() << endl;
Info<< "boundary patches = " << mesh.boundary().size() << endl;
Info<< "first patch type = " << mesh.boundary()[0].type() << endl;
```

```bash
# 网格质量与几何量检查
checkMesh -allGeometry -allTopology 2>&1 | tee log.checkMesh
grep -Ei "non-orthogonality|max aspect|negative volume|skewness" log.checkMesh
# 查看某个边界的类型与字段
foamDictionary -entry boundary -value constant/polyMesh/boundary
head -40 0/p                       # 确认内部场与边界字段规模
```

判读要点：`p.size()` 应等于单元数（内部场逐单元），而 `p.boundaryField().size()` 应等于 patch 数；两者不匹配通常意味着读错了场的类型或读到了错误的时间目录。`checkMesh` 报出的最大非正交角决定扩散项需要几次非正交修正，长宽比过大则会放大截断误差。

建议把 `checkMesh` 的输出与网格尺寸一起存档，作为后续格式选择与网格无关性验证的基线。若某次修改后非正交角或长宽比突然变差，先回退网格改动，再讨论离散设置；否则很容易把几何误差误归于格式，得出错误结论。

## 6. 常见坑与排查

- 拓扑与几何分不清：把 `faces()` 的顶点索引当成几何坐标，误判问题所在；
- 混用 patch 概念：把几何 `wall` 直接当成 `fvPatchField` 类型，或期望 `empty` 方向有非零分量；
- 忽略几何缓存：手改点坐标后未刷新几何，离散仍用旧值；
- owner/neighbour 符号误读：把面法向当成指向 owner 内侧，导致通量符号整体反号；
- 二维与三维混淆：用 `empty` 表示二维却让场在该方向有分量，构造期即报错；
- 只查单元数不查 patch 数：边界规模错配常在运行时才暴露，先核对可省大量时间。

排查顺序建议：先 `checkMesh` 确认几何与拓扑合法 → 再确认目标场的类型与规模 → 再确认 patch 类型与字段边界是否兼容 → 最后才进离散代码。网格层面的错误一旦带入离散，几乎无法通过调格式补救。

还有一条常被忽视的原则：网格与物理量的尺度要匹配。边界层层数、首层高度与湍流模型的要求、以及特征长度与单元尺寸的关系，都会决定离散是否真正“看到”了关注的尺度。几何量只是必要条件，充分条件还取决于这些问题是否被回答过。

## 7. 检查清单与参考

- [ ] `checkMesh` 的几何与拓扑检查全部通过，坏单元已定位；
- [ ] 目标场的类型（vol/surface/point）与使用场景一致；
- [ ] 内部场规模等于单元数，边界字段规模等于 patch 数；
- [ ] 几何 patch 类型与 `fvPatchField` 边界类型兼容；
- [ ] 网格变形后已显式刷新几何量；
- [ ] 关键 patch 的法向方向与通量符号已核对。

参考资料：

1. `src/OpenFOAM/meshes/polyMesh/`。
2. `src/finiteVolume/fvMesh/fvMesh.H` 与 `fvMeshGeom.C`。
3. `src/finiteVolume/fields/GeometricFields/` 与 `src/finiteVolume/fields/fvPatchFields/`。
