---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-foamrun-lifecycle
title: OpenFOAM 14 foamRun 与模块化 solver 生命周期
summary: 以 foamRun.C 为入口，逐步解析参数与字典解析、solver 动态加载、网格创建、求解器构造、PIMPLE 时间循环以及预测/校正钩子的调用顺序，说明调度框架与物理方程如何彻底解耦。
category: { slug: openfoam-v14-solver-flow, name: OpenFOAM 14 求解流程 }
level: 工程
reading_minutes: 22
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, foamRun, solver模块, pimpleSingleRegionControl, 调用链]
seo:
  title: OpenFOAM 14 foamRun 与模块化 solver 生命周期
  description: 解析 foamRun 从字典到 solver 动态加载、网格创建、时间循环与预测校正钩子的完整调用链，说明框架与物理解耦的扩展点。
  keywords: [foamRun, OpenFOAM 14 solver, pimpleControl, 模块化, 调用链]
---

# OpenFOAM 14 foamRun 与模块化 solver 生命周期

`foamRun` 是 OpenFOAM 14 的通用求解入口，它把“求解调度”与“物理方程”彻底解耦：入口只负责读取参数、构造对象、推进时间，而真正的方程封装在运行时按名加载的 solver 模块里。理解这条生命周期，是读懂本系列其余文章的前提，也是二次开发时判断“该改哪里”的第一张地图。本文以 `applications/solvers/foamRun/foamRun.C` 为主线，把从命令行到写盘的每一步钉到具体源码。

## 1. 结论与适用场景

用一句话概括：`foamRun` 只做调度，`solver` 模块才做物理。凡是要新增物理场、调整预测与校正顺序、插入自定义闭包模型的工作，改动点几乎都落在 `applications/modules/<name>` 的 solver 派生类里，而不是 `foamRun.C`；这正是模块化架构想要的“对扩展开放、对修改封闭”。

它适用于标准不可压缩流、可压缩流、多相流与固体换热等单区域场景，也支持伪瞬态稳态、网格运动、旋转机械（MRF）以及六自由度耦合。从演进角度看，过去一求解器一可执行文件的写法（如 `icoFoam`、`pimpleFoam`）在 14 中已经被统一入口加模块取代，因此学习新的调度链几乎是读任何物理的必修课。反过来，如果你发现要改的是参数解析、时间推进或写盘逻辑，说明需求已经触及框架层；此时必须谨慎，并保持既有接口与行为向后兼容，否则所有模块都会受影响。

整条生命周期可以用四份“契约”来描述，它们彼此独立，任一模块只要满足契约即可被调度器驱动：入口契约规定命令行参数与字典的读取方式；加载契约规定如何由字符串选中并动态加载求解库；循环契约规定 PIMPLE 与时间推进钩子的名称和顺序；输出契约规定场数据与功能对象的写出时机。把这四份契约记牢，读任何模块都能迅速定位调用边界，也能判断新功能应当落在哪一份契约之下。从阅读源码的角度，建议按“入口 → 加载 → 循环 → 输出”的顺序追踪：先在 `foamRun.C` 中确认四份契约的落点，再跳到目标模块核对钩子实现，最后回到日志验证行为。如此即便是陌生模块，也能在较短时间内建立完整调用地图，而不必通读整个 `finiteVolume` 库。另外，读基类头文件时把每个钩子的默认实现与派生类的覆写并排对照，最容易发现那些被悄悄关掉的物理过程。

## 2. 总体架构

`applications/solvers/foamRun/foamRun.C` 是单区域通用入口。它依次执行：解析命令行得到 `argList` → 构造 `Time` → 从 `controlDict` 的 `solver` 条目（或命令行 `-solver` 覆盖）拿到模块名 → 调用 `solver::load` 动态加载对应库 → 通过 `createMesh` 建立网格（多区域时建立多个网格）→ 由 `solver::New(mesh, ...)` 构造具体 solver → 在循环内调用 `solver->run()`。因此入口内没有任何 `fvm::` 或 `fvMatrix` 调用，物理完全下沉到模块，入口只保留调度骨架。

在这条链里，`Time` 与 `objectRegistry` 是隐形的主角：所有场、模型与工具对象都注册在网格或时间对象之下，通过名称查找，这使得功能对象、边界条件与模型之间可以在不互相知道对方具体类型的情况下协作。多区域场景则改用 `pimpleMultiRegionControl` 与多网格构造，但每个区域仍然复用同一套 solver 钩子，调度逻辑保持同构。

模块目录 `applications/modules/` 是物理的所在：`basicFluidSolver` 与 `fluidSolver` 提供通用流体框架，`incompressibleFluid`、`isothermalFluid`、`fluid`（可压缩）各自实现方程，`incompressibleVoF`、`compressibleVoF`、`multiphaseEuler` 处理多相，`solidDisplacement` 处理固体，`shockFluid` 处理激波。模块之间的公共部分被抽到基类，公共差异通过虚函数钩子表达，这就是所谓“框架固定、内容可变”。

运行时绑定靠 RTS（runTimeSelection）表完成：字典字符串被映射到具体构造函数，`solver::New` 查表后返回 `autoPtr<solver>`。时间推进与步长控制是循环契约的量化依据，时间层推进满足

$$ t^{n+1}=t^n+\Delta t $$

而打开 `adjustTimeStep` 后，全局库朗数决定步长上界：

$$ Co=\frac{\Delta t}{2V}\sum_f\left|\phi_f\right| \leq Co_{\max} $$

其中 $\phi_f$ 是面通量，$V$ 是单元体积，$Co_{\max}$ 来自字典。这两式决定了“循环何时结束、步长取多大”，也是伪瞬态稳态收敛快慢的根源：稳态问题通过像推进物理时间一样逐步放松，最终达到平衡。需要强调的是，库的加载是惰性的：只有被字典或默认列表引用的库才会载入，未被引用的模型类型在报错时甚至不会出现在可用类型清单中。因此看到 unknown type 时，第一步永远是确认相应库是否被加载，而不是怀疑类型名拼写。把 `libs` 按功能分块写在 `controlDict` 顶部，是长期维护的推荐做法。

## 3. 关键类与调用链

核心类是 `Foam::solvers::solver` 基类，它定义一组虚函数钩子，而 `foamRun.C` 只按固定骨架调用它们，完全不认识任何具体方程：

```text
foamRun:
  setRootCase -> createTime -> solver::load -> createMesh -> solver::New
  pimple = pimpleSingleRegionControl(...)
  solver->preSolve()
  while (runTime.run())
    {
      ++runTime                             # 时间推进
      solver->prePredictor()                # 网格运动 / 模型预测
      solver->thermophysicalPredictor()     # 能量 / 热物性（可压缩）
      solver->momentumPredictor()           # 动量预测
      solver->pressureCorrector()           # 压力校正（PIMPLE 内层）
      solver->thermophysicalTransportCorrector()
      solver->postSolve()
      runTime.write()
    }
```

这些钩子各司其职：`preSolve` 在时间循环前准备一次；`prePredictor` 处理网格运动与需要在预测前更新的模型；`thermophysicalPredictor` 只对含能量的可压缩模块有效；`momentumPredictor` 形成并求解动量方程；`pressureCorrector` 完成压力—速度耦合；`postSolve` 负责收尾与统计。派生类把不使用的钩子实现为空函数，这正是模块化能复用同一骨架的关键：不可压缩模块的 `thermophysicalPredictor` 是空实现，可压缩模块才在其中填入能量求解。换句话说，调度顺序由基类锁死，具体行为由派生类填充。理解这些钩子的另一条线索是 `solutionControl` 的状态机：它区分外层迭代与最终迭代，并据此决定是否收紧线性容差、是否更新湍流与热物性。许多看似神秘的数值行为，其实都来自“这次调用是不是最终迭代”这一判断。

`pimpleSingleRegionControl` 负责外循环计数 `nOuterCorrectors`、内循环 `nCorrectors`，以及在 `residualControl` 满足时提前跳出当前时间步。它把“外层 SIMPLE 迭代”与“内层 PISO 压力修正”两套循环统一到同一个控制对象里，因此同一个钩子 `pressureCorrector` 在各层中的行为由控制器状态区分。此外，`fvModels`、`fvConstraints`、`momentumTransport`、`thermophysicalTransport` 等对象由 solver 持有，并在标定的 `correct()` 阶段被驱动；它们本身就是 RTS 创建的模型，职责边界见 04 系列文章。

## 4. 代码走读要点

读 `foamRun.C` 与 `solutionControl` 时要抓住四条线。第一条是 solver 名解析：`controlDict.lookup("solver")` 给出默认名，命令行 `-solver` 会覆盖它，二者优先级必须清楚。第二条是 `solver::load`：库名由字典 `libs` 或内置默认映射决定，加载失败会立刻报 unknown solver，而不是拖到运行中途。第三条是 `solver::New`：它把字典与网格传入，内部走 RTS 表返回 `autoPtr<solver>`，这一步决定了后面所有虚函数分派的实际类型。第四条是 `run()` 的钩子顺序：顺序在基类固定、内容在派生类实现，因此覆写单个钩子不会打乱整体骨架。

还要注意 `argList` 提供的通用开关，它们虽然不属于物理，却直接改变调度行为：`-case` 指定算例目录，`-parallel` 打开并行，`-dry-run` 只建对象不求解，`-solver` 覆盖字典选中模块。调试时先确认这些开关，再进入模块内部，可以避免把“跑错目录”误判为算法问题。一个常见疑问是“为何改 `fvSolution` 就改变了执行路径”。原因是 `PIMPLE` 子字典控制 `nOuterCorrectors`、`nCorrectors`、`momentumPredictor`、`turbOnFinalIterOnly` 等开关，而 solver 的钩子正是按这些开关分派。把字典条目与分派条件逐一对应，是读懂模块调用的钥匙，也是排查“为什么这个方程没被求解”的起点。

## 5. 可复现示例

最小编译与运行（OpenFOAM 14）：

```bash
# 由命令行选择 solver 并运行（单区域）
foamRun -solver incompressibleFluid > log.foamRun 2>&1

# 也可由 controlDict 指定
foamDictionary system/controlDict -entry solver -set incompressibleFluid
foamRun 2>&1 | tee log.foamRun
```

对应的最小 `system/controlDict` 关键项：

```cpp
application     foamRun;
solver          incompressibleFluid;
startTime       0;
endTime         100;
deltaT          1e-3;
writeControl    timeStep;
writeInterval   100;
adjustTimeStep  yes;
maxCo           1;
```

启动日志会打印 “Selecting solver incompressibleFluid”，这是确认运行时选择命中的直接证据；若打印的是 unknown solver，则说明库未加载或名字拼写有误。运行中每一时间步会打印 `Time = ...`，并随 PIMPLE 外循环打印残差与库朗数，把这些行与 `fvSolution` 的开关对照，即可确认调度链按预期运行。

## 6. 常见坑与排查

第一类坑是概念混淆：把 `application` 写成具体求解器名（旧习惯），在 OpenFOAM 14 里入口应统一为 `foamRun`，物理由 `solver` 条目指定。第二类是字典缺失：`fvSolution` 缺少 `PIMPLE`/`SIMPLE` 控制时模块会取默认值，但外循环次数常与预期不符，应先看日志中的外循环计数而非直接怀疑数值格式。第三类是并行误区：只在 master 进程输出却指望全局结果，全局量必须归约，详见并行篇。第四类是越界修改：擅自改动基类钩子顺序会同时影响所有模块，必须做全量回归。第五类是版本不一致：加载的库与头文件版本不匹配，表现为符号缺失或段错误，应检查 `libs` 与编译产物。

排查顺序建议为：确认 solver 名 → 确认库已被加载 → 用临时 `Info` 确认钩子确实被调用 → 最后才怀疑数值设置。不要一上来就动 `fvSolution`，因为大多数“没算”或“算错”的问题根因在调度层，而不在参数层。若日志显示某个物理量从未参与求解，优先怀疑对应模块的钩子是空实现或字典开关未打开，而不是求解器本身。最后，建议在自研模块中主动打印 `type()`，把运行时真实类型写进日志；当同一算例需要在不同模块间切换时，这行日志能立刻区分配置生效与配置被忽略，是排查调度类问题最省时的习惯。

## 7. 检查清单与参考

- [ ] `controlDict` 含 `application foamRun` 与正确的 `solver` 条目；
- [ ] `fvSolution` 含对应的 `PIMPLE`/`SIMPLE` 控制字典；
- [ ] 时间推进与库朗控制（`adjustTimeStep`/`maxCo`）与算例匹配；
- [ ] 需要的模型库在 `libs` 或被默认加载；
- [ ] 已用日志确认运行时选择命中的是目标模块。

参考源码：

1. `applications/solvers/foamRun/foamRun.C`。
2. `applications/modules/basicFluidSolver/` 与 `fluidSolver/`。
3. `src/finiteVolume/cfdTools/general/solutionControl/`。
