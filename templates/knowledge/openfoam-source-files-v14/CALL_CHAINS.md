# OpenFOAM 14 核心调用链索引

本页把逐文件卡片重新组织为可顺序阅读的算法链。

## 1. 统一求解器与不可压 PIMPLE

$A_P\mathbf{U}_P=H(\mathbf{U})-\nabla p$ → 压力泊松方程 → 守恒面通量 → 速度回代。

1. [`applications/solvers/foamRun/foamRun.C`](01-solver-entry/files/3d/foamrun.c--3d7dd5e70d12.md)
2. [`applications/modules/incompressibleFluid/incompressibleFluid.C`](02-solver-modules/files/f6/incompressiblefluid.c--f69e01ebae16.md)
3. [`applications/modules/incompressibleFluid/momentumPredictor.C`](02-solver-modules/files/b5/momentumpredictor.c--b598e15fafc6.md)
4. [`applications/modules/incompressibleFluid/correctPressure.C`](02-solver-modules/files/ae/correctpressure.c--ae7b387bbaad.md)
5. [`src/finiteVolume/fvMatrices/fvMatrix/fvMatrix.H`](05-finite-volume/files/72/fvmatrix.h--7269aa48a1c0.md)
6. [`src/OpenFOAM/matrices/lduMatrix/lduMatrix/lduMatrix.H`](06-linear-algebra/files/44/ldumatrix.h--4447a7923382.md)

## 2. 运行时选择与模型工厂

类型名经哈希选择表映射到构造函数指针，动态库加载完成注册后由 `New` 工厂实例化。

1. [`src/OpenFOAM/db/runTimeSelection/construction/runTimeSelectionTables.H`](04-core-runtime/files/f4/runtimeselectiontables.h--f471b6837913.md)
2. [`src/OpenFOAM/db/runTimeSelection/construction/addToRunTimeSelectionTable.H`](04-core-runtime/files/13/addtoruntimeselectiontable.h--137ad38b2f74.md)
3. [`applications/solvers/foamRun/foamRun.C`](01-solver-entry/files/3d/foamrun.c--3d7dd5e70d12.md)

## 3. 有限体积离散到线性系统

控制体积分与面通量离散产生 $A\phi=b$，再由 lduMatrix 求解器/预条件器完成迭代。

1. [`src/finiteVolume/finiteVolume/fvm/fvmDdt.H`](05-finite-volume/files/be/fvmddt.h--bee4ba370e19.md)
2. [`src/finiteVolume/finiteVolume/fvm/fvmDiv.H`](05-finite-volume/files/32/fvmdiv.h--32306f8dc3a6.md)
3. [`src/finiteVolume/finiteVolume/fvm/fvmLaplacian.H`](05-finite-volume/files/99/fvmlaplacian.h--99705f4e6ce0.md)
4. [`src/finiteVolume/fvMatrices/fvMatrix/fvMatrix.H`](05-finite-volume/files/72/fvmatrix.h--7269aa48a1c0.md)
5. [`src/OpenFOAM/matrices/lduMatrix/lduMatrix/lduMatrix.H`](06-linear-algebra/files/44/ldumatrix.h--4447a7923382.md)

## 4. 热物性与能量预测

求解器模块装配能量方程，thermo 对象根据状态方程和热容关系在 $p,T,h/e,\rho$ 之间闭合。

1. [`applications/solvers/foamRun/foamRun.C`](01-solver-entry/files/3d/foamrun.c--3d7dd5e70d12.md)
2. [`applications/modules/fluid/fluid.C`](02-solver-modules/files/f1/fluid.c--f1e280652de1.md)
3. [`applications/modules/fluid/thermophysicalPredictor.C`](02-solver-modules/files/ff/thermophysicalpredictor.c--ff3e975f83bb.md)
4. [`src/thermophysicalModels/basic/fluidThermo/fluidThermo.C`](08-thermophysical/files/30/fluidthermo.c--30d6a12411bc.md)

## 5. VOF 相分数与界面压缩

相分数守恒、界面压缩/重构、混合物物性和压力速度耦合共同推进自由液面。

1. [`applications/modules/twoPhaseVoFSolver/twoPhaseVoFSolver.C`](02-solver-modules/files/80/twophasevofsolver.c--80a389978fb5.md)
2. [`applications/modules/incompressibleVoF/incompressibleVoF.C`](02-solver-modules/files/fe/incompressiblevof.c--fea8d8ade25e.md)
3. [`applications/modules/incompressibleVoF/alphaSuSp.C`](02-solver-modules/files/08/alphasusp.c--083863a97857.md)
4. [`src/twoPhaseModels/interfaceCompression/MPLIC/MPLIC.C`](10-multiphase/files/93/mplic.c--93d04ab536ca.md)

## 6. 拉格朗日网格、云与粒子

拉格朗日网格保存轨迹几何与字段，cloud 管理粒子集合和模型生命周期，particle 实现单个离散实体的推进。

1. [`src/Lagrangian/Lagrangian/LagrangianMesh/LagrangianMesh.C`](11-lagrangian/files/ea/lagrangianmesh.c--eafb2e318052.md)
2. [`src/Lagrangian/cloud/cloud/cloud.C`](11-lagrangian/files/48/cloud.c--487a9fa2fabd.md)
3. [`src/Lagrangian/cloud/clouds/particle/particle.C`](11-lagrangian/files/e1/particle.c--e1a18a7fcc92.md)

## 7. 并行通信与全局归约

上层通信接口保持串并行一致，MPI 后端完成点对点/集合通信，归约模板形成全局残差与守恒统计。

1. [`src/OpenFOAM/db/IOstreams/Pstreams/UPstream.C`](04-core-runtime/files/2c/upstream.c--2c5060690dce.md)
2. [`src/Pstream/mpi/UPstream.C`](13-parallel/files/b0/upstream.c--b06b6ce23421.md)
3. [`src/Pstream/mpi/allReduceTemplates.C`](13-parallel/files/f8/allreducetemplates.c--f882f2cc54e0.md)

## 8. snappyHexMesh 网格生成

应用入口读取字典后依次调用体加密、表面贴合与边界层添加驱动，并在每阶段检查网格质量。

1. [`applications/utilities/mesh/generation/snappyHexMesh/snappyHexMesh.C`](03-utilities/files/18/snappyhexmesh.c--1856be2e0ca1.md)
2. [`src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyRefineDriver.C`](07-mesh-geometry/files/73/snappyrefinedriver.c--7392231fe379.md)
3. [`src/mesh/snappyHexMesh/snappyHexMeshDriver/snappySnapDriver.C`](07-mesh-geometry/files/40/snappysnapdriver.c--40de51c15316.md)
4. [`src/mesh/snappyHexMesh/snappyHexMeshDriver/snappyLayerDriver.C`](07-mesh-geometry/files/6e/snappylayerdriver.c--6e5dc56e8a5d.md)
