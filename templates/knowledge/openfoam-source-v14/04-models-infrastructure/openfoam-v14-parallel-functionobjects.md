---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-v14-parallel-functionobjects
title: OpenFOAM 14 并行通信、functionObjects 与结果写出
summary: 解释域分解后的 processor patch、Pstream 集体通信与全局归约，并梳理 functionObject 的生命周期、对象注册表查找、并行统计与结果写出流程，给出可复现的并行运行与最小归约代码。
category: { slug: openfoam-v14-models-infrastructure, name: OpenFOAM 14 物理模型与基础设施 }
level: 工程
reading_minutes: 21
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: lin-cfd
tags: [OpenFOAM14, Pstream, MPI, functionObject, 并行归约]
seo:
  title: OpenFOAM 14 并行通信、functionObjects 与结果写出
  description: 解析处理器边界通信、Pstream 全局归约与 functionObject 生命周期，说明并行后处理与结果写出的正确做法。
  keywords: [Pstream, MPI, functionObject, 并行归约, processor patch, OpenFOAM 14]
---

# OpenFOAM 14 并行通信、functionObjects 与结果写出

并行运行把网格切成若干子域，每个进程只持有一块，子域之间的内部面被转换成处理器边界（processor patch）。有限体积接口层负责交换相邻值，而核心离散代码仍按“面与相邻单元”的方式编写，这种设计让串行代码几乎无需改动即可并行。functionObject 则是运行时可插拔的后处理与诊断工具，它与并行通信共同依赖对象注册表与运行时选择机制。全局量的正确归约可以写成

$$ R=\sum_{r=0}^{N_p-1}R_r,\qquad Co_{\max}=\max_{r}Co_{\max,r} $$

其中 $R_r$ 是第 $r$ 个进程的局部贡献。残差范数也遵循同样思路：

$$ \text{residual}=\frac{\sum_P\left|r_P\right|}{\sum_P\left|a_P\phi_P\right|} $$

分子分母都必须先在各进程求和再合并。

## 1. 结论与适用场景

并行化的本质是“域分解 + 进程间通信”，functionObject 的本质是“运行时装配的后处理”。二者在 OpenFOAM 14 中都依赖对象注册表按名查找对象，也都能在不改动求解器主循环的前提下扩展。适用场景包括大规模算例的采样、力与力矩计算、残差监控、场平均与场统计、时间序列写出等。

三条结论值得先记住：第一，任何跨进程的全局量都必须通过 `reduce` 或 `gSum`/`gMax` 之类的封装进行归约，只在 master 计算会得到片面甚至错误的结果；第二，归约是集合通信，所有进程都必须参与调用，否则会死锁；第三，功能对象通过注册表取得场，因此其执行顺序与对象命名构成隐式接口，改动顺序可能让下游读不到派生场。从性能视角看，并行加速并非线性：按 Amdahl 定律，若可并行部分占比为 $\alpha$，则

$$ S(N_p)=\frac{1}{(1-\alpha)+\alpha/N_p} $$

即进程数增大到一定程度后，收益被串行部分与通信开销抵消。因此在扩大进程数之前，应先评估单进程热点与分解质量，而不是一味增加核数。从工程角度，判断是否值得并行的标准是单进程内存能否装下问题，以及壁钟时间是否可接受。若单进程已经装得下且时间可忍，并行的收益往往被分解、通信与后处理开销侵蚀，此时不如优化数值设置。只有当问题规模确实超出单机能力时，并行才成为必选项。

## 2. 总体架构

并行链路上，`decomposePar` 依据 `system/decomposeParDict` 把网格与场分块，跨子域面成为 `processorPolyPatch`（对周期性还有 `processorCyclicPolyPatch`），它们负责几何变换、`initMovePoints` 与值交换。通信层 `Pstream` 与 `UPstream` 封装 MPI 初始化、点对点与集合通信，默认后端为 MPI，也可换成其他实现。

functionObject 侧，`controlDict` 的 `functions{}` 子字典（或 `#includeFunc`）在运行时构造 `functionObjectList`，列表在时间循环的既定位置触发 `execute()` 与 `write()`。因为功能对象从 `objectRegistry` 按名称取场，任何先注册的求解量或派生场都可能成为其输入，所以顺序与命名是理解并行后处理的关键。分解方法的选择直接影响通信量与负载均衡：scotch 适合复杂几何、能自动平衡面数；hierarchical 与 simple 更可控，但依赖用户手工切分方向与权重；metis 也是常见选择。分解后每个子域应尽量“体积相近、面积最小”，前者决定计算均衡，后者决定通信开销，二者往往需要折中。分解质量可以用最大子域单元数与平均子域单元数之比粗略衡量，比值越接近一越好。若某个进程的单元数远超平均，它会成为整个求解的瓶颈，其余进程只能等待，加速比随之下降。因此在正式计算前应检查分解统计，而不是等运行中途才发现负载失衡。

## 3. 关键类与调用链

关键类与函数可归纳为：

```text
Pstream:
  parRun()          # 是否并行
  nProcs()          # 进程数
  init(argc,argv)   # 初始化通信环境
  reduce(x, sumOp<scalar>())   # 集合归约
  allReduce / combineReduce    # 变体

processorPolyPatch:
  initTransform / initMovePoints   # 交换并一致化几何与数据

functionObjectList:
  start()   -> 读取 controlDict.functions，构造对象
  execute() -> 每步/每隔若干步
  write()   -> 按写出控制触发
```

全局质量流量的归约是一个典型例子：

```cpp
scalar localMass = fvc::domainIntegrate(rho).value();
scalar globalMass = localMass;
reduce(globalMass, sumOp<scalar>());
if (Pstream::master()) Info<< "total mass = " << globalMass << endl;
```

积分用 `sumOp`，极值用 `maxOp`/`minOp`；`gSum`、`gMax`、`gMin` 是它们的便捷封装，语义等价于“先局部、再全局归约”。通信本身分为阻塞与非阻塞两类：Pstream::commsTypes::blocking、nonBlocking、scheduled 决定交换的调度方式。对大规模算例，非阻塞交换可以把计算与通信重叠，但要求代码正确地组织缓冲与等待点；理解这一点，能解释为何某些通信密集的功能对象在核数增大后加速比骤降。归约的正确性可以用对称算例快速自检：在均匀场中，正确的全局求和应等于解析值乘以总体积；若结果随进程数变化，就说明归约或重复计数出了问题。这个测试只需几秒钟，却能暴露大部分并行后处理缺陷，应纳入日常检查。

## 4. 代码走读要点

第一，`reduce` 是集合操作，所有进程都必须调用，绝不能写成“只有 master 才归约”。第二，算子要与物理量匹配：体积积分用求和，最大库朗数用取最大，加权平均要特别注意分母也是全局量，需两次归约或一并归约。第三，采样面 `sampledSurfaces` 在并行下要处理点归属与处理器面重复计数，否则统计会被重复累加。第四，功能对象生成的场会注册回注册表，后执行的对象才能读到它，因此顺序即接口。第五，无论走 `#includeFunc` 还是 `functions{}`，最终都构造同一种 `functionObjectList`，行为一致。功能对象的触发时机由 executeControl 与 writeControl 分别控制“执行”和“写出”的频率，二者可以不同，例如残差每步执行但每若干步写出。执行顺序即注册顺序，后加入的对象可以读取先加入者生成的派生场；若依赖关系被颠倒，就会出现读到空场或旧场的现象。另一个实用技巧是把功能对象的输出与场写出分离：诊断量写进日志或独立数据文件，避免污染场目录；需要长期保存的派生场再用 write 写出。这样既保持算例目录整洁，也便于后续用脚本批量提取时间序列。

## 5. 可复现示例

并行运行与结果重建：

```bash
decomposePar -force
mpirun -np 4 foamRun -solver incompressibleFluid -parallel 2>&1 | tee log.run
reconstructPar
```

最小全局归约代码：

```cpp
#include "fvCFD.H"
// ... 在 solver 内或功能对象中
scalar sumLocal = gSum(mag(U));      // 全局求和，等价于 reduce(sumOp)
scalar maxLocal = gMax(mag(U));      // 全局最大，等价于 reduce(maxOp)
Info<< "gSum(|U|) = " << sumLocal << ", gMax(|U|) = " << maxLocal << nl;
```

`gSum`/`gMax`/`gMin` 把“先局部再规约”的样板代码封装好，是新增统计量时最省心的写法。一个最小功能对象骨架通常实现 read、execute、write 三件事：在 read 中解析字典与查找输入场，在 execute 中做局部计算并归约，在 write 中输出全局量。把归约放在 execute 内、输出放在 write 内，符合框架约定，也能保证并行下行为一致。新增功能对象时，务必在 execute 与 write 中都考虑并行分支：局部量直接计算，全局量先归约再输出，并且只在主进程打印。把这两条固化成模板，是复用性最高的做法，也能避免并行下日志重复与数值错乱。

## 6. 常见坑与排查

第一类坑是只在 master 计算全局量，其他进程不参与集合通信，轻则结果错误，重则死锁。第二类是用错算子，例如把最大值当成求和。第三类是忘记 `reconstructPar`，只看到一堆 processor 目录而误以为没结果。第四类是 `decomposeParDict` 的分解方法与网格或算例不匹配，导致负载不均或通信量爆炸。第五类是功能对象顺序错乱，下游读不到上游生成的派生场。第六类是采样面在处理器边界被重复计数。

排查顺序：先确认 `Pstream::parRun()` 分支是否正确，再确认归约是否为集合调用，然后检查采样是否去重，最后用串行与多进程结果对比验证一致性。此外，串并行一致性是并行后处理唯一的可靠验收标准：同一算例在 1 个进程与多个进程下应给出在容差内一致的时间序列；若不一致，问题几乎总在归约、采样去重或边界场交换，而不在物理模型本身。调试并行问题时，先降到一个进程复现，再逐步增加进程数观察行为从何处开始变化，是最高效的二分策略；大多数并行缺陷都会在特定进程数区间首次显现，这一信号本身就是重要线索。此外，把处理器数设为 1 与 2 做对照，往往就能区分“分解引入”与“通信引入”的问题。最后提醒一点：并行结果的一致性应以物理量为准，而非以浮点逐位相等为准。归约顺序不同会带来舍入差异，只要在合理容差内一致即可，追求逐位相等既不现实也无必要。把握住这一点，可以避免把大量时间耗在无意义的精度比对之上；真正需要逐位一致的是单进程内部的重现性，而不是跨不同进程数的浮点等价。把比对口径统一为物理量容差，才能让并行回归测试稳定而高效。

## 7. 检查清单与参考

- [ ] 所有全局量都用 `reduce` 或 `gSum`/`gMax` 等正确归约；
- [ ] `decomposeParDict` 的分解方法与进程数匹配；
- [ ] 功能对象所需的输入场在注册表中已存在；
- [ ] 采样与写出在并行和串行下结果一致；
- [ ] 回归测试覆盖单进程与多进程两种运行方式。

以上检查项的核心是两点：跨进程的全局量必须正确归约，串行与并行结果必须在容差内一致。只要这两条成立，功能对象在并行下就是可信的；任何一条不成立，都应以调试归约与采样为首要方向，而不是先去怀疑物理模型。

参考源码：

1. `src/OpenFOAM/db/IOstreams/Pstreams/` 与 `src/Pstream/`。
2. `src/OpenFOAM/db/functionObjects/functionObject/`。
3. `src/functionObjects/` 与 `src/sampling/`。
4. `src/OpenFOAM/meshes/polyMesh/polyPatches/constraint/processor/`。
