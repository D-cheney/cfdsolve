---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-case-structure-dictionaries
title: OpenFOAM 案例目录、字典语法与标准工作流
summary: 按"职责—读取者—检查顺序"解释 system、constant、初始时间目录的划分，梳理 FoamFile 头、量纲与边界语法，并给出从复制模板到归档结果的标准案例流程与守恒核对方法。
category: { slug: openfoam-getting-started, name: OpenFOAM 入门与案例组织 }
level: 入门
reading_minutes: 14
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM, case, 字典, controlDict, 量纲, 边界条件]
seo:
  title: OpenFOAM 案例结构与字典语法
  description: 掌握 system、constant、0 目录的职责划分、字典量纲语法与检查顺序，建立可复现的标准案例流程。
  keywords: [OpenFOAM case, controlDict, fvSchemes, fvSolution, 量纲]
---

# OpenFOAM 案例目录、字典语法与标准工作流

一个 OpenFOAM 算例（case）不是"一堆文件"，而是**按职责划分的三类目录加一套自描述的字典语法**：`system/` 管运行与数值控制，`constant/` 管时间推进中相对固定的网格与物性，初始时间目录（常为 `0/`）管初值与边界。理解"哪个文件归谁管、由谁读取、以什么顺序被检查"，比背诵命令更能避免翻车。本文给出目录职责、字典与量纲语法，以及一条从复制模板到归档结果的标准工作流，并把质量守恒核对作为"边界是否设对"的常用判据。

## 1. 结论与适用场景

结论：**以"职责—读取者—检查顺序"三要素理解目录**。求解器只读取它在启动时声明需要的文件；多余文件不生效，缺少必需文件则立即报错。换句话说，算例目录是一份"约定"，而求解器是这份约定的执行者。

- `system/controlDict`：应用名、起止时间、时间步、写出控制、运行时函数对象；
- `system/fvSchemes`：梯度、散度、拉普拉斯与时间项的离散格式；
- `system/fvSolution`：线性求解器、松弛与压力—速度耦合；
- `constant/`：网格、物性、湍流或输运模型、重力等；
- `0/`（起始时间目录）：各求解场的初值与边界条件。

适用于新建算例、接手他人算例、排查"缺字段 / 边界不匹配 / 物性读错"等问题，以及为自动化批量算例准备统一骨架。目录边界清晰、命名规范的算例，迁移与复现的成本会显著降低。

换一种说法：算例目录是"声明式"的，用户只描述意图（这里是什么物理、用什么数值方案），由求解器决定读取顺序与执行细节。正因为声明式，配置的"完整性"与"一致性"必须由使用者负责——缺一个文件、错一个 patch 名，求解器就只能直接报错退出。

## 2. 背景与原理

OpenFOAM 用**文本字典**描述算例：文件头 `FoamFile` 声明格式、类名与对象名，随后是关键字—值对。字典的基本单元包括：

- **dimensioned 类型**：物理量带量纲前缀 `dimensions [...]`，再给 `internalField` 与 `boundaryField`；
- **列表**：`uniform` 表示常量，`nonuniform List<scalar>` 表示逐单元存储；
- **宏与包含**：变量展开与 `#include` 复用可减少重复，但不改变"后定义覆盖先定义"的规则。

文件头的 `class` 与 `object` 并非装饰：`class` 告诉解析器这是哪种容器类型（如 `volVectorField`、`dictionary`、`fvMesh`），`object` 是它在内存中的名字，二者与文件名一起被用来校验。把 `volScalarField` 错写成 `volVectorField`，或在 `U` 文件里声明 `object p`，都会在启动时被识别为错误。体积场与表面场同样以 `class` 区分，边界条件只能放在对应的 `boundaryField` 中。

时间目录的名字是数值（如 `0`、`0.5`、`1`），排序与读取都按数值而非字符串；因此不要写会造成解析歧义的名字。起始时间目录既可以是 `0`，也可以是任意 `startTime`，但初值文件必须放在 `startFrom` 指向的时间目录中。

目录职责的本质是**数据生命周期**：网格与物性在时间推进中基本不变，放在 `constant/`；数值与时间控制随计算方案变化，放在 `system/`；场在时间上演化，放在时间目录。求解器启动时会打印它读取的模型与文件，可作为"实际读到什么"的第一手证据；出现"以为启用了某模型"的偏差时，这份日志就是最直接的裁判。

时间目录的产生由写出控制决定：从起始时间 $t_{\text{start}}$ 出发，第 $n$ 次写出对应的物理时间为

$$
t_n = t_{\text{start}} + n \, \Delta t_{\text{write}}
$$

其中 $\Delta t_{\text{write}}$ 由 `writeInterval` 与 `writeControl` 共同决定。理解这条关系，有助于规划磁盘占用与后处理时间点。目录结构的这种"声明式"，也解释了为什么同一份字典在不同求解器下可能报错：读取者不同，要求的文件与关键字就不同。规划写出间隔时，还要兼顾磁盘与后处理需求：间隔过密会占用大量存储，过疏则难以捕捉瞬态细节；稳态问题通常只需保留最终场。

## 3. 关键配置与公式

量纲向量是字典与模型之间的契约。以 SI 七基本量为基，任一物理量写作

$$
[\phi] = [M^{a}\, L^{b}\, T^{c}\, \Theta^{d}\, N^{e}\, I^{f}\, J^{g}]
$$

例如速度 $\mathbf{u}$ 的量纲为 $[0\,1\,-1\,0\,0\,0\,0]$，不可压常用的运动学压力为 $[0\,2\,-2\,0\,0\,0\,0]$。量纲写错会让求解器在启动时抛出维度错误；这类错误应在第一时间修正，而不是删除量纲字段绕过。

边界条件是否设对，可以用面通量守恒核对。对任一闭合控制体，净流出质量流量等于内部质量变化率的负值：

$$
\dot{m}_{\text{net}} = \sum_f \rho\,(\mathbf{u}_f \cdot \mathbf{A}_f) = -\frac{d}{dt}\int_V \rho\,dV
$$

稳态下右侧为零，因此入口与出口的质量流量必须平衡。这条关系是检查"边界设对没有"的常用手段，也解释了为什么不能只看残差：残差反映方程求解程度，而守恒反映物理一致性。

时间推进的稳定性直接约束时间步，库朗数应满足

$$
Co = \frac{|\mathbf{u}|\,\Delta t}{\Delta x} \leq Co_{\max}
$$

其中 $Co_{\max}$ 由格式与算法决定（显式对流常取 $Co_{\max}\approx 1$，隐式可更大）。`controlDict` 的 `adjustTimeStep` 与 `maxCo` 正是据此自动调节 $\Delta t$，使计算在稳定与效率之间取得平衡。

量纲、守恒与库朗数这三类检查，分别对应模型的"合法性、一致性与稳定性"。它们互相独立：量纲对不代表守恒对，守恒对也不代表稳定。工程上建议在正式计算前依次跑一遍这三项检查，用最低的成本把最粗的错误挡在门外。这三类量也提示了排查顺序：报错先看量纲，结果可疑先看守恒，发散先看库朗数与时间步。按这个顺序，多数问题能在几分钟内定位方向。

## 4. 工程做法与参数

目录划分看似简单，真正的工程量在于把"该放哪里""该叫什么""该检查什么"固化成习惯。下面几条做法覆盖建骨架、命名、备份、版本适配与并行目录，目标是一次配对、长期复用，而不是每接一个新算例都重新踩一遍坑。

- **骨架先于物理**：先复制同版本、同物理类型的官方教程，再逐步替换几何、物性与边界；不要从空目录手搭，以免遗漏必需文件。
- **命名一致**：`0/` 中 `boundaryField` 的子字典名必须与网格 patch 完全一致，大小写与连字符都不能错。
- **初场备份**：把初始时间目录另存为 `0.orig`，任何重算都从它重建，避免初场被覆盖后无法恢复。
- **网格位置**：较新版本 `blockMeshDict` 位于 `system/`，生成的网格在 `constant/polyMesh/`；先确认版本再改。
- **物性与模型**：不可压用 `physicalProperties`，可压用 `thermophysicalProperties`；湍流在新版本用 `momentumTransport`、旧版本用 `turbulenceProperties`，其中 `simulationType` 决定层流 / RAS / LES。
- **并行目录**：并行计算产生 `processorN/` 目录与各自的子时间目录，归档时应同时保存分解字典与 `reconstructPar` 结果。
- **单因素变更**：每次只改一类因素并留记录；同时改网格、湍流与格式，即使结果变好也无法归因。
- **工作目录固定**：始终从算例根目录运行求解器与工具，使相对路径、包含文件与输出目录的基准保持一致，避免"换个目录跑就出错"。
- **版本记录**：在算例根目录放一份简短的说明，写明求解器、版本与关键设置，方便他人接手时不致误用旧教程。

## 5. 可复现示例

一个场的典型结构（`0/U`）：

```cpp
FoamFile
{
    version     2.0;
    format      ascii;
    class       volVectorField;
    object      U;
}
dimensions      [0 1 -1 0 0 0 0];
internalField   uniform (0 0 0);
boundaryField
{
    inlet
    {
        type        fixedValue;
        value       uniform (1 0 0);
    }
    outlet
    {
        type        inletOutlet;
        inletValue  uniform (0 0 0);
        value       uniform (0 0 0);
    }
    walls
    {
        type        noSlip;
    }
}
```

从模板到结果的标准流程：

```bash
cp -r "$FOAM_TUTORIALS/incompressible/simpleFoam/pitzDaily" myCase
cd myCase
mv 0 0.orig && cp -r 0.orig 0                 # 备份并重建初场
blockMesh          > log.blockMesh 2>&1
checkMesh -allGeometry -allTopology > log.checkMesh 2>&1
foamDictionary -entry application -value system/controlDict
simpleFoam         > log.run 2>&1
```

验收：`checkMesh` 无非正交或负体积致命错误；时间目录正常产生；入口与出口质量流量平衡；目标量（压降、力）曲线平直，且在最后若干次迭代内基本不变。

值得强调的是，冒烟流程应在每次改动后重复，哪怕只改了一个边界值。把"网格—检查—求解—核对"固化成一条命令脚本，可以避免人为跳过检查步骤，也让不同成员的结果具有可比性。

## 6. 常见坑与排查

- **patch 名不匹配**：`boundaryField` 中的名字不在网格里，或网格 patch 缺少对应边界，求解器启动即报错。
- **缺字段**：求解器需要但 `0/` 未提供，报 "cannot find field"，按启动日志补齐相应场与量纲。
- **时间目录残留**：重算前未清理旧时间目录，后处理会混入旧结果，务必从 `0.orig` 重建。
- **二进制格式**：`format binary` 写出不可直接阅读，跨机复现时宜用 ascii 或保持工具链一致。
- **blockMeshDict 位置**：版本变化导致字典放错目录，`blockMesh` 找不到几何。
- **物性关键字过时**：旧教程的 `thermophysicalProperties` 在新版本可能改名，需按当前版本文档调整。
- **初始条件与边界混淆**：把入口的边界值当成全场的初值，会得到与预期不同的瞬态起点；`internalField` 与 `boundaryField` 各司其职，务必分开设置。
- **网格与场不匹配**：改了网格却沿用旧的 `0/`，会出现 patch 缺失或数量不符；重建网格后应同步核对所有场文件。
- **并行目录误用**：串行与并行的结果目录结构不同，混用会导致后处理读错数据；归档时应明确标注是否已执行 `reconstructPar`。

## 7. 检查清单与参考

- [ ] 三类目录齐备，职责清晰；
- [ ] `boundaryField` 名与网格 patch 逐一对齐；
- [ ] 量纲向量与模型期望一致；
- [ ] `checkMesh` 通过，`0.orig` 已备份；
- [ ] `controlDict` 的时间与写出设置经 `foamDictionary` 核对；
- [ ] 入口出口质量流量平衡，目标量曲线平直；
- [ ] 归档含输入字典、日志、后处理定义与版本信息。

参考：

把以上清单做成可勾选的检查表，附在算例根目录的说明文件中，能显著降低交接与复现成本。

1. OpenFOAM *User Guide*，Case Structure and File Format。
2. Greenshields & Weller，*Notes on Computational Fluid Dynamics*。
3. 本目录《字典覆盖、包含与最终配置核对》。
