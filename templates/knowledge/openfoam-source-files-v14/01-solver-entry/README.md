# 求解器入口：逐文件源码索引

命令行求解器、统一运行入口及时间循环调度。

- 文件数：42
- 基线：`OpenFOAM-14@20260724`
- 说明：索引按真实源码路径排序；文件卡名包含路径哈希，用于规避大小写冲突。

| 源码路径 | 类型 | 行数 | 文件解析 |
|---|---|---:|---|
| `applications/solvers/boundaryFoam/boundaryFoam.C` | C/C++ 或词法/语法源文件 | 133 | [打开](files/3a/boundaryfoam.c--3a004ad2140b.md) |
| `applications/solvers/boundaryFoam/createFields.H` | C/C++ 或词法/语法源文件 | 58 | [打开](files/8e/createfields.h--8e63e6b43f7d.md) |
| `applications/solvers/boundaryFoam/evaluateNearWall.H` | C/C++ 或词法/语法源文件 | 40 | [打开](files/86/evaluatenearwall.h--86a58f00af6b.md) |
| `applications/solvers/boundaryFoam/interrogateWallPatches.H` | C/C++ 或词法/语法源文件 | 82 | [打开](files/d1/interrogatewallpatches.h--d11d15b53dc1.md) |
| `applications/solvers/boundaryFoam/Make/files` | 构建/运行清单 | 8 | [打开](files/13/files--13e3c4c412b6.md) |
| `applications/solvers/boundaryFoam/Make/options` | 构建/运行清单 | 22 | [打开](files/c4/options--c45886892c1a.md) |
| `applications/solvers/boundaryFoam/makeGraphs.H` | C/C++ 或词法/语法源文件 | 51 | [打开](files/1e/makegraphs.h--1e7fb1a3d61e.md) |
| `applications/solvers/chemFoam/chemFoam.C` | C/C++ 或词法/语法源文件 | 103 | [打开](files/41/chemfoam.c--41240cc5ed59.md) |
| `applications/solvers/chemFoam/createControls.H` | C/C++ 或词法/语法源文件 | 8 | [打开](files/48/createcontrols.h--48ab17f2dfec.md) |
| `applications/solvers/chemFoam/createFieldRefs.H` | C/C++ 或词法/语法源文件 | 34 | [打开](files/7e/createfieldrefs.h--7eec944a3373.md) |
| `applications/solvers/chemFoam/createFields.H` | C/C++ 或词法/语法源文件 | 75 | [打开](files/fe/createfields.h--fecec73ac249.md) |
| `applications/solvers/chemFoam/createInitialFields.H` | C/C++ 或词法/语法源文件 | 182 | [打开](files/0a/createinitialfields.h--0a1e65768973.md) |
| `applications/solvers/chemFoam/createZeroDimensionalFvMesh.H` | C/C++ 或词法/语法源文件 | 9 | [打开](files/6a/createzerodimensionalfvmesh.h--6aa838e719e8.md) |
| `applications/solvers/chemFoam/hEqn.H` | C/C++ 或词法/语法源文件 | 21 | [打开](files/d5/heqn.h--d55e6d5af8b2.md) |
| `applications/solvers/chemFoam/Make/files` | 构建/运行清单 | 8 | [打开](files/f0/files--f09cc7484abd.md) |
| `applications/solvers/chemFoam/Make/options` | 构建/运行清单 | 19 | [打开](files/70/options--70b455dcfbfe.md) |
| `applications/solvers/chemFoam/output.H` | C/C++ 或词法/语法源文件 | 16 | [打开](files/48/output.h--48f692def166.md) |
| `applications/solvers/chemFoam/pEqn.H` | C/C++ 或词法/语法源文件 | 22 | [打开](files/ff/peqn.h--ff3507db4956.md) |
| `applications/solvers/chemFoam/readControls.H` | C/C++ 或词法/语法源文件 | 8 | [打开](files/e4/readcontrols.h--e4a3e35c35bc.md) |
| `applications/solvers/chemFoam/readInitialConditions.H` | C/C++ 或词法/语法源文件 | 73 | [打开](files/bf/readinitialconditions.h--bfdeca5133e3.md) |
| `applications/solvers/chemFoam/setDeltaT.H` | C/C++ 或词法/语法源文件 | 11 | [打开](files/0b/setdeltat.h--0b7b57a53337.md) |
| `applications/solvers/chemFoam/solveChemistry.H` | C/C++ 或词法/语法源文件 | 9 | [打开](files/ed/solvechemistry.h--ed9dd652a3b5.md) |
| `applications/solvers/chemFoam/thermoTypeFunctions.H` | C/C++ 或词法/语法源文件 | 69 | [打开](files/0b/thermotypefunctions.h--0b69222fd523.md) |
| `applications/solvers/chemFoam/YEqn.H` | C/C++ 或词法/语法源文件 | 14 | [打开](files/6d/yeqn.h--6df2ec9d25ef.md) |
| `applications/solvers/foamMultiRun/foamMultiRun.C` | C/C++ 或词法/语法源文件 | 261 | [打开](files/82/foammultirun.c--82535a672380.md) |
| `applications/solvers/foamMultiRun/Make/files` | 构建/运行清单 | 10 | [打开](files/07/files--0777f2731f6e.md) |
| `applications/solvers/foamMultiRun/Make/options` | 构建/运行清单 | 11 | [打开](files/e7/options--e7cc1e188441.md) |
| `applications/solvers/foamMultiRun/regionSolvers/regionSolvers.C` | C/C++ 或词法/语法源文件 | 212 | [打开](files/e4/regionsolvers.c--e46558241789.md) |
| `applications/solvers/foamMultiRun/regionSolvers/regionSolvers.H` | C/C++ 或词法/语法源文件 | 204 | [打开](files/a3/regionsolvers.h--a333ef8c4315.md) |
| `applications/solvers/foamMultiRun/regionSolvers/regionSolversI.H` | C/C++ 或词法/语法源文件 | 144 | [打开](files/7b/regionsolversi.h--7b7566d17eb0.md) |
| `applications/solvers/foamMultiRun/setDeltaT.C` | C/C++ 或词法/语法源文件 | 107 | [打开](files/41/setdeltat.c--41ea8e12a980.md) |
| `applications/solvers/foamMultiRun/setDeltaT.H` | C/C++ 或词法/语法源文件 | 69 | [打开](files/e7/setdeltat.h--e75db1a5d022.md) |
| `applications/solvers/foamRun/foamRun.C` | C/C++ 或词法/语法源文件 | 221 | [打开](files/3d/foamrun.c--3d7dd5e70d12.md) |
| `applications/solvers/foamRun/Make/files` | 构建/运行清单 | 9 | [打开](files/58/files--581175d88369.md) |
| `applications/solvers/foamRun/Make/options` | 构建/运行清单 | 10 | [打开](files/02/options--023c34ba0aa6.md) |
| `applications/solvers/foamRun/setDeltaT.C` | C/C++ 或词法/语法源文件 | 80 | [打开](files/2a/setdeltat.c--2adf1d0ad108.md) |
| `applications/solvers/foamRun/setDeltaT.H` | C/C++ 或词法/语法源文件 | 69 | [打开](files/05/setdeltat.h--0533a25f5c17.md) |
| `applications/solvers/potentialFoam/createControls.H` | C/C++ 或词法/语法源文件 | 15 | [打开](files/3b/createcontrols.h--3bc158244d8a.md) |
| `applications/solvers/potentialFoam/createFields.H` | C/C++ 或词法/语法源文件 | 129 | [打开](files/37/createfields.h--37bcb1acc2af.md) |
| `applications/solvers/potentialFoam/Make/files` | 构建/运行清单 | 8 | [打开](files/8d/files--8d2a50a0d397.md) |
| `applications/solvers/potentialFoam/Make/options` | 构建/运行清单 | 14 | [打开](files/63/options--6342897e8b80.md) |
| `applications/solvers/potentialFoam/potentialFoam.C` | C/C++ 或词法/语法源文件 | 208 | [打开](files/3c/potentialfoam.c--3cd35945b82e.md) |
