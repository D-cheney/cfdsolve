---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-models-boundaries-sources
title: OpenFOAM 14 物理模型、边界、源项与约束的统一扩展机制
summary: 以 runTimeSelection 运行时选择为主线，梳理 momentumTransport、thermo、fvPatchField、fvModels 与 fvConstraints 的职责边界，说明模型如何读取字典、注册类型、向方程添加闭合项并修正场。
category: { slug: openfoam-v14-models-infrastructure, name: OpenFOAM 14 物理模型与基础设施 }
level: 专题
reading_minutes: 24
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, runTimeSelection, fvPatchField, fvModels, fvConstraints]
seo:
  title: OpenFOAM 14 物理模型、边界、源项与约束的统一扩展机制
  description: 以运行时选择为核心，解析 momentumTransport、fvPatchField、fvModels 与 fvConstraints 的字典构造、类型注册与生命周期钩子。
  keywords: [runTimeSelection, momentumTransport, fvPatchField, fvModels, fvConstraints, OpenFOAM 14]
---

# OpenFOAM 14 物理模型、边界、源项与约束的统一扩展机制

OpenFOAM 把“方程主体”和“可替换闭合”彻底分离：方程主体写在求解器模块里，而湍流、热物性、边界条件、源项与数值约束都以可插拔对象的形式存在。连接二者的正是运行时选择（runTimeSelection，简称 RTS）机制——字典里的一个字符串，在运行时被解析成具体的 C++ 类型并构造实例。理解 RTS，就理解了 OpenFOAM 的扩展骨架。

以湍流应力的闭合为例，平均动量方程中的雷诺应力被建模为

$$ -\overline{u_i'u_j'}=2\nu_t S_{ij}-\frac{2}{3}k\delta_{ij} $$

而具体 $\nu_t$ 由所选模型提供；源项则以如下形式进入标量方程：

$$ \frac{\partial(\rho\phi)}{\partial t}+\nabla\cdot(\rho\mathbf{U}\phi)-\nabla\cdot(\Gamma\nabla\phi)=\rho S_\phi $$

## 1. 结论与适用场景

统一扩展机制可拆成三件事：运行时选择（把字符串映射到类型）、字典构造（用 `name` 与 `dictionary` 初始化）、生命周期钩子（在预测、校正、施加源或约束的时机被调用）。凡是需要新增湍流模型、热物性模型、边界条件、源项或数值约束，都无需改动求解器主循环，只需实现派生类并通过宏注册。

职责边界必须分清：`fvModels` 提供物理源项，`fvConstraints` 施加数值约束，`fvPatchField` 负责边界贡献。三者都可能改变方程或场，但语义不同；把物理源当成数值约束，或把边界贡献重复计入源项，都是常见错误。因此读源码时第一件事是判断“这个类属于哪一类扩展点”。这套机制的哲学是“组合优于继承”：求解器不必知道湍流是 k-epsilon 还是 k-omega，只调用统一的 nuT() 接口；边界不必知道某个 patch 是固定值还是固定通量，只调用 updateCoeffs()。因此新增物理几乎总是“写一个派生类、注册、填字典”，而不是改主循环；是否值得自定义，取决于现有模型能否经字典参数与组合表达出目标行为。从维护角度看，统一扩展机制的最大价值在于局部性：新增模型只影响自身的源文件与字典，不会像修改求解器那样牵动整个代码库。这也意味着模型作者必须自己保证接口契约，包括场的时间层、维度与边界一致性，框架不会替你做物理正确性检查。

## 2. 总体架构

RTS 的骨架由两部分宏构成。基类声明可被选择的类型表：

```cpp
TypeName("baseType");
declareRunTimeSelectionTable
(
    autoPtr,
    baseType,
    dictionary,
    (const word& name, const dictionary& dict),
    (name, dict)
);
static autoPtr<baseType> New(const word& name, const dictionary& dict);
```

派生类注册自身：

```cpp
defineTypeNameAndDebug(myModel, 0);
addToRunTimeSelectionTable(baseType, myModel, dictionary);
```

`New` 从字典读取 `type` 关键字，查表后调用对应构造函数；查不到时打印可用类型清单。动量输运、热物性、边界场、源项与约束共用同一套骨架，只是基类与构造签名不同。声明宏与注册宏必须成对出现，且注册所用基类与构造签名要与声明完全一致，否则会出现“类型已定义却查不到”的隐式错误。模板类（如热物性组合）通常借助 typedef 与特化注册，阅读时要把 typedef 展开到最内层，才能看清真正被实例化的类型。需要注意的是，类型只在其所属库被加载后才可见，因此 `libs` 或默认加载列表是把关环节。实际使用中，最常见的失败模式是“字典里写了但类型不存在”，其根因几乎总是库未加载或拼写不符；其次是“类型存在但参数缺失”，此时构造函数会在读取字典项时报错并指出缺失的键名。顺着这两条错误信息走，能快速定位问题，而不必通读模型实现。NEW 的查找是有序且显式的：它先读取字典中的 type，再在已注册的类型表中精确匹配；匹配失败会抛出异常并列出当前库中所有可用类型。这条错误信息极有价值：它既提示拼写错误，也提示库未加载。把 libs 写全、并在切换模型时同步更新字典，是避免这类问题的常规操作。

## 3. 关键类与调用链

各扩展点的关键类与作用如下。`momentumTransportModel`（`src/MomentumTransportModels/`）统一层流、RANS 与 LES 接口，由 `momentumTransport` 字典中的类型选中，RANS 提供 `nut`、`k`、`epsilon` 等量。`fvPatchField`（`src/finiteVolume/fields/fvPatchFields/`）根据每个场文件的 patch 字典构造具体边界，`updateCoeffs()` 生成边界系数，把边界数学关系转成矩阵贡献或显式值。`fvModels`（`src/fvModels/`）读取 `constant/fvModels`，向方程返回显式或隐式源；`fvConstraints`（`src/fvConstraints/`）读取 `constant/fvConstraints`，直接约束矩阵或场。

典型的源项施加流程是：

```cpp
fvMatrix<scalar> eqn(fvm::ddt(...) + fvm::div(...) - fvm::laplacian(...));
fvModels.source(eqn, field);      // 叠加物理源
fvConstraints.constrain(field);   // 施加数值约束
eqn.solve();
```

边界场与源项的作用可以用两个简化关系理解。边界条件把面值线性化进矩阵：

$$ a_P\phi_P=\sum_N a_N\phi_N+b_P+\left(\text{边界系数贡献}\right) $$

而约束常以逐点裁剪等形式出现：

$$ \phi\leftarrow\min\left(\max(\phi,\phi_{\min}),\phi_{\max}\right) $$

## 4. 代码走读要点

第一，RTS 表本质是“字符串到构造函数”的注册表，库未加载则类型不可见，遇到 unknown type 先查加载而非拼写。第二，`dictionary` 构造同时接收 `name` 与 `dict`，`name` 往往作为源或约束的标识，出现在日志与报错中，便于定位。第三，当 `momentumTransport` 选择层流模型 `laminar` 时，`nut` 表现为一个常量场，这是判读湍流是否真正启用的直接证据。第四，`fvModels` 的源可以进入右端（显式）或进入对角（隐式），`semiImplicitSource` 正是用线性化系数实现的。第五，边界类型的选择（如 `fixedFluxPressure`、`fixedValue`、`zeroGradient`）直接影响压力—通量一致性，不能随意替换。以动量输运为例，momentumTransport 字典同时决定层流/湍流策略与具体模型；RANS 模型内部还持有 k、epsilon、omega 等场，并在 correct() 中推进。若只改了字典却忘了在 0/ 目录补齐这些场文件，模块会在读取时找不到场而报错。因此模型类与场文件是一组必须同时维护的资产。对于边界条件，还要区分值型与系数型：前者直接给定面值，后者把边界并入矩阵系数，混用会破坏矩阵对称性或守恒性。因此在替换边界类型时，应同时检查它给方程带来的贡献是显式值还是隐式系数，并在算例收敛后核对通量平衡。若边界贡献被重复计入源项，质量或能量会出现系统性偏差，因此核对通量平衡是发现边界与源项冲突的有效手段。把边界通量与体积源分别记账并逐项相加，再与全局守恒量对比，是区分二者贡献的常用方法。

## 5. 可复现示例

最小自定义源项模型（RTS 骨架）：

```cpp
// mySource.H
class mySource : public fvModel
{
    scalar fieldValue_;
public:
    TypeName("mySource");
    mySource(const word& name, const dictionary& dict, const fvMesh& mesh);
    virtual ~mySource() = default;
    virtual bool addSup(fvMatrix<scalar>& eqn, const label fieldi);
};
// mySource.C
defineTypeNameAndDebug(mySource, 0);
addToRunTimeSelectionTable(fvModel, mySource, dictionary);
```

对应的字典与运行：

```cpp
// constant/fvModels
mySource
{
    type            mySource;
    fieldValue      1.0;
    selectionMode   all;
}
```

```bash
foamRun -solver incompressibleFluid 2>&1 | tee log.run
grep -i "Selecting fvModel" log.run
```

日志中出现 “Selecting fvModel mySource” 即说明运行时选择命中。若把扩展点换成边界，思路相同：在 0/<field> 的 patch 字典里给出 type，框架会在读取场时构造对应 fvPatchField。若换成数值约束，则在 constant/fvConstraints 中给出条目，框架在求解前对矩阵或场施加约束。三类扩展点共用 RTS 与字典构造，区别只在基类与其生命周期钩子的语义。理解 RTS 还要注意对象的生命周期：模型通常在网格或求解器构造时创建、在网格变化时更新、在时间步内被调用。若模型持有几何相关的缓存，就必须在网格拓扑改变时重建，否则会用到过期的系数，这在自适应网格或动网格算例中尤其重要。

## 6. 常见坑与排查

第一类坑是忘记 `addToRunTimeSelectionTable` 或库未加载，运行时报 unknown type。第二类是 `type` 拼写与 `TypeName` 不一致，注册表查不到。第三类是源项与边界重复计入同一物理效应，得到偏大的结果。第四类是隐式源的线性化符号错误，破坏了矩阵对角占优而发散。第五类是 `fvConstraints` 与 `fvModels` 顺序不当，约束被后续源项破坏。

排查顺序：确认类型已注册 → 确认字典条目被读取 → 打印源项贡献核对量级 → 检查矩阵对角是否为正 → 与无源算例对比。最后，源项与约束的调试要“看得见”：把每个模型的贡献打印出来，或在无源算例上叠加单一源验证其量级与符号，是定位重复计入与符号错误最快的方法。把这些检查固化进回归脚本，可以避免后续改动悄悄破坏既有平衡。最后，建议为每个自定义模型准备一个小型验证算例：在已知解析解或已知极限行为下运行，确认源项量级、符号与收敛后的场分布符合预期。这个算例既是回归测试，也是理解模型行为的活文档。对于源项模型，验证时应特别关注它是否在非设计工况下仍然守边界：例如温度限制源在达到限值后不应继续加源，否则会与其他约束互相打架；再如质量源应确保不会使密度或相分数越界。把这些边界行为写成断言，能让模型在异常工况下及早暴露问题。

## 7. 检查清单与参考

- [ ] 每个模型类都有 `TypeName` 与 RTS 注册；
- [ ] 对应库在 `libs` 或默认加载列表中；
- [ ] 字典 `type` 与类名一致且参数被正确读取；
- [ ] 区分物理源、数值约束与边界贡献，无重复计入；
- [ ] 隐式源线性化保持矩阵对角占优。

参考源码：

1. `src/MomentumTransportModels/`。
2. `src/finiteVolume/fields/fvPatchFields/`。
3. `src/fvModels/` 与 `src/fvConstraints/`。
4. `src/OpenFOAM/db/runTimeSelection/`。

此外，命名要与功能一致并尽量避免与内置类型冲突；若实验性模型与稳定模型同名，注册表会以后注册者为准，从而引发难以察觉的行为漂移。把自定义模型集中到独立库与独立命名前缀下，是长期维护的稳妥做法。最后再次强调：RTS 提供的是类型选择与装配能力，不提供任何物理验证。模型的正确性只能靠守恒关系、极限行为与网格敏感性来检验；把这三类验证写进文档与脚本，才是自定义扩展能够长期可信的根本保证。
