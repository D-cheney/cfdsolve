---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-source-map
title: OpenFOAM 14 版本基线、源码树与阅读路线
summary: 固定 Foundation OpenFOAM 14（标签 20260724）源码基线，逐层解释 applications、src、wmake、etc 与 tutorials 的职责，并建立从案例字典追到求解器、离散层与物理模型的可复现阅读路线。
category: { slug: openfoam-v14-architecture, name: OpenFOAM 14 源码架构 }
level: 入门
reading_minutes: 15
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
seo:
  title: OpenFOAM 14 源码基线、目录结构与阅读路线
  description: 以 Foundation OpenFOAM 14 标签 20260724 为基线，说明源码树分层、wmake 构建、字典到求解器的调用链与可复现阅读方法。
  keywords: [OpenFOAM14, 源码树, foamRun, wmake, 阅读路线]
tags: [OpenFOAM14, 源码解析, 架构, 源码树, Foundation]
---

# OpenFOAM 14 版本基线、源码树与阅读路线

## 1. 结论与适用场景

本系列只解析 Foundation 发行线的 OpenFOAM 14，源码基线为标签 `20260724`。类名相似的 OpenCFD（原 ESI）发行线拥有独立目录与 API，`pimpleFoam` 一类旧驱动仍保留在其中，两边头文件与库不能互换链接。阅读任何一行源码之前先把基线钉死，是后面所有结论能够复现的前提：同一个类名在不同发行线上可能有不同的虚函数、不同的字典键，甚至不同的量纲约定，混读会让“看起来对”的结论在另一个环境里失效。

这条纪律来自一次普遍误解。很多初学者把 `pimpleFoam`、`simpleFoam` 当成 OpenFOAM 的“标准求解器”，但在 v14 的 Foundation 线里，真正的入口已经收敛到统一的 `foamRun`，具体物理被下沉到模块。若仍按旧教程搜索 `pimpleFoam.C`，轻则找不到文件，重则误以为求解器被删除。区分“应用层驱动”和“模块层实现”，是本系列一切讨论的起点。

- 适用：需要从字典入口反查求解器与模型、准备二次开发、或在“改了 `fvSchemes` 却没生效”时定位的人；
- 不适用：只想调用高层求解器的纯使用者，以及有限差分、有限元代码的阅读；
- 前提：能编译并跑通一个 tutorial，会读 `.H` 头文件与 `Make/files`。

整条阅读路线围绕一个半离散守恒方程展开。把控制体 $V_P$ 上的守恒律写为面通量之和，是理解一切有限体积代码的原点：

$$
\frac{\partial}{\partial t}\int_{V_P}\rho\phi\,dV+\sum_{f}\rho_f\phi_f\mathbf{u}_f\cdot\mathbf{S}_f=\sum_{f}\Gamma_f(\nabla\phi)_f\cdot\mathbf{S}_f+\int_{V_P}S_\phi\,dV
$$

左边的瞬态与对流项、右边的扩散与源项，恰好对应代码里的 `fvm::ddt`、`fvm::div`、`fvm::laplacian` 与显式源项。把公式—字典—类名三者对上号，源码就不再是散落的文件。再往下一层，离散把所有单元的耦合收进一个稀疏线性系统，这是源码树中“离散层”与“线性代数层”的接缝，也是阅读顺序里最后才出现的一环：

$$
A_P\phi_P+\sum_{N}A_N\phi_N=b_P
$$

## 2. 总体架构

OpenFOAM 14 是清晰的三层结构，依赖方向单一：应用层依赖库层，库层内部由网格无关的核心流向具体物理模型，反向依赖被严格禁止。理解这条依赖方向，比记住任何单个目录名都重要，因为它是“可插拔”这一设计目标的物理体现。

- `applications/solvers/`：`foamRun`（单区域统一求解器）与 `foamMultiRun`（多区域、共轭传热与多区域耦合）是稳定调度入口。它们本身不含物理，只负责参数解析、时间推进、模块加载与结果写出；
- `applications/modules/`：`incompressibleFluid`、`fluid`、`incompressibleVoF`、`solid` 等物理模块，是真正的方程实现，动量、压力、能量、相分数的离散都写在这里；
- `applications/utilities/`：网格生成（`blockMesh`、`snappyHexMesh`）、前后处理、域分解与并行工具，是“辅助应用”而非求解核心；
- `src/OpenFOAM/`：容器、量纲、`Time`/`IOobject`/`objectRegistry`、`LduMatrix`、并行抽象 `Pstream` 等与网格无关的底座；
- `src/finiteVolume/`：`fvMesh`、`fvc`/`fvm`、`fvMatrix`、patch field，是有限体积离散的载体；
- `src/` 下各 `*Models`：动量输运（湍流）、热物性、多相、反应、辐射等可插拔物理；
- `tutorials/`：字典与模块组合的可执行规格，比多数文档更接近真实用法；
- `etc/` 与 `wmake/`：环境脚本、平台规则与编译驱动。

`tutorials/` 的地位容易被低估。它是仓库中唯一“可运行的真实配置集合”，每个目录都包含 `system`、`constant` 与初值场，当文档与源码不一致时，tutorial 通常最接近实际行为。阅读新模块时先找到对应 tutorial，再以它的字典为索引反查源码，比直接翻头文件更快。

配置与构建同样是分层的一部分。`etc/bashrc` 与 `etc/config.sh` 设置环境变量、编译器与 MPI，`wmake/rules/<平台>` 保存编译器选项与链接规则，`wmake` 依据各模块 `Make/files`、`Make/options` 扫描依赖并生成库或可执行文件。理解这层后，“为什么换个模块要重新 `wmake`”以及“库装在哪、名字叫什么”都能自答，不必凭记忆猜路径。

从依赖箭头看，`applications` 依赖 `finiteVolume`，`finiteVolume` 依赖 `src/OpenFOAM` 的核心，而核心库对任何具体模型一无所知。模型只在运行时由字符串选中，因此替换湍流模型、多相模型都不需要重新编译求解器。这正是“只改字典即可换模型”的结构性根因，也解释了为什么运行时选择机制是整棵树的枢纽：它是隔开“稳定框架”与“可换实现”的那道界面。分层一旦被违反（例如核心库反向 `#include` 某个模型头文件），整个可插拔体系就会退化为整体重编译，源码阅读时如果发现反向依赖，基本可以判断是有人改坏了结构。

## 3. 关键类与调用链

以不可压缩压力校正为例，一条完整调用链能从字典一路追到线性求解器：`controlDict` 的 `solver incompressibleFluid` → `foamRun.C` → `solver::load` 动态加载模块 → `solver::New` 工厂实例化 → 模块内动量预测与 `correctPressure.C` → `fvm::laplacian`/`fvc::div` → `fvMatrix::solve` → `lduMatrix::solver` 迭代。每一步都留下明确的文件与类名，可用搜索逐段验证，这也正是本系列要求“结论必须落到相对路径加类名”的原因。

```text
controlDict.solver  ->  "incompressibleFluid"
foamRun.C           ->  solver::load(name); solver::New(name, mesh)
module              ->  momentumPredictor(); correctPressure()
fvm/fvc             ->  fvScalarMatrix pEqn = fvm::laplacian(rAtU, p) == fvc::div(phiHbyA)
fvMatrix            ->  pEqn.solve()
lduMatrix::solver   ->  PCG / GAMG  +  preconditioner
```

压力校正把连续性约束投影到面通量上，最终形成泊松型方程：

$$
\nabla\cdot\left(\frac{1}{A_P}\nabla p\right)=\nabla\cdot\left(\frac{H(\mathbf{U})}{A_P}\right)
$$

读这条链时要注意两点。其一，调度器只依赖 solver 基类的虚函数合同，不依赖具体方程，因此换模块不触碰 `foamRun.C`，这是模块化架构的收益，也是排查时容易被忽略的间接层；其二，从 `fvm::laplacian` 到 `lduMatrix::solver` 之间有一次“量纲与场”到“纯代数”的降维，`fvMatrix` 这一层既保留场与边界信息，又向下暴露 LDU 三组系数，读懂这个转换点，就同时读懂了离散层和线性代数层。

## 4. 代码走读要点

读一个类时固定顺序：先看类声明与继承，再看数据成员（决定内存布局与所有权），再看纯虚函数合同（定义派生类必须实现的边界），最后才读构造函数与生命周期方法。数据成员往往比函数更能说明“这个类是谁”，因为它暴露了对象持有什么、依赖什么、生命周期由谁管理。

宏不要停在表面，要找到展开后创建的选择表与具体类。`TypeName("...")` 注入类型名与 `type()` 接口，`addToRunTimeSelectionTable` 把具体类的构造指针登记进基类选择表，基类的 `New` 才能按字符串返回 `autoPtr<Base>`。阅读时应当定位宏展开后的注册入口与那张哈希表，而不是盯着宏本身。构造函数里的 `IOobject` 决定对象的名称、时间实例、归属 registry 与读写策略，是对象生命周期的起点；读到 `registerObject`/`checkIn` 时，应顺着 registry 追到对象被谁持有、何时释放。所有权同样关键：`autoPtr` 表达唯一所有权，`tmp<Field>` 管理表达式临时对象以减少深拷贝，普通引用通常指向 registry 或拥有者中的长期对象。二次开发前必须先回答“这个对象由谁创建、何时销毁”。下面这段骨架把“类型名—选择表—工厂”三件事压缩到几行，便于对照头文件记忆：

```cpp
// 基类：声明选择表，New 按字符串查表
class base { public: TypeName("base"); declareRunTimeSelectionTable(autoPtr, base, dictionary, (const dictionary&, const fvMesh&));
  static autoPtr<base> New(const dictionary& d, const fvMesh& m) { return dictionaryConstructorTablePtr_->find(d.get<word>("type"))->second(d, m); } };
// 派生类：注册自己，TypeName 提供 type() 字符串
class derived : public base { public: TypeName("derived");
  addToRunTimeSelectionTable(base, derived, dictionary); };
```

读这段代码的重点不是语法，而是三个合同的耦合：`TypeName` 里那个字符串必须与字典里的 `type` 逐字符相等，注册宏必须真的被编译进某个库，工厂才会在哈希表里找到它。三者任一不合，错误信息都会指向“unknown type”，而真正的断点在别处。

## 5. 可复现示例

最省力的验证方式是把基线固定下来，再用只读命令做纵向追踪，不修改任何源码：

```bash
# 1) 跑通一个最小案例，确认基线可用
run
cp -r "$FOAM_TUTORIALS/incompressible/pimpleFoam/laminar/cylinder" . && cd cylinder
foamRun -solver incompressibleFluid > log.run 2>&1

# 2) 从字典追到类：确认模块被动态加载与实例化
grep -rn "solver::load" applications/solvers/foamRun/
grep -rln "declareRunTimeSelectionTable" applications/modules | head

# 3) 核对编译环境，排除混用发行线
wmake -show-cxx
echo "$WM_PROJECT_VERSION  $WM_PROJECT_DIR"
```

第一段确认“能跑”，第二段确认“字典里的字符串确实被翻译成某个类”，第三段确认“用的是哪条发行线”。三步都通过后，再开始深入任何单个模型，效率最高。若希望追踪到具体求解器实现，可临时给 `fvSolution` 降低 `tolerance` 或打开 `SolverPerformance` 的 debug 开关，让日志直接打印所选求解器、迭代次数与残差，这比逐层打断点更快。

值得补充的是，`foamRun` 也支持用 `-solver` 覆盖 `controlDict` 里的选项，两者不一致时命令行优先。排查“明明改了字典还是旧模块”时，先确认启动命令里没有传入冲突的 `-solver`，再去看模块是否真的重新编译过。把启动命令、字典与已编译库三方对齐，是最容易被忽略却最常出问题的一环。

## 6. 常见坑与排查

- 混用发行线：Foundation 与 OpenCFD 的目录、类名、库名都不同，报错对不上时先核对基线；
- 只看宏不看展开：停在 `TypeName`/`addToRunTimeSelectionTable` 会误判“没有实现”，应继续找到选择表与具体类；
- 把 tutorial 当权威规格：tutorial 只是可运行示例，边界与物理假设要回到源码确认；
- 用行号当证据：源码升级会让行号漂移，稳定证据应是相对路径加类名加函数名；
- 忽略版本一致性：链接混版本的 `.so` 会触发符号缺失或 ABI 崩溃，排查时先确认库与头文件同源；
- 只追调用链不看数据流：调用链回答“谁调用谁”，数据流回答“值怎么流动”，两者缺一，读到边界条件处就会卡住。

排查顺序建议固定为：先确认基线 → 再确认模块被正确加载 → 再确认字典键拼写 → 最后才进源码逐层追。多数“改了没生效”的问题，在前三步就能定位，不必一开始就钻头文件。

## 7. 检查清单与参考

- [ ] 基线标签已记录（`20260724`），发行线已确认；
- [ ] 每个结论都落到相对路径、类名与字典入口；
- [ ] 宏已展开到选择表与具体类，未止步于表面；
- [ ] 公式解释与源码解释分开书写，互不冒充；
- [ ] 对象所有权与生命周期已明确（谁创建、谁销毁）；
- [ ] 验证案例可复现，日志与极值监控已保留。

参考资料：

1. `README.org`、`Allwmake` 与 `wmake/` 目录。
2. `applications/solvers/foamRun/foamRun.C` 与 `applications/modules/`。
3. 本系列 [fvSchemes 离散格式与有界性](../../openfoam/04-numerics-boundaries/openfoam-fvschemes.md)。
