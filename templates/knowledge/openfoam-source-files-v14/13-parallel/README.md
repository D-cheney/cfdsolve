# 并行与域分解：逐文件源码索引

Pstream、MPI、域分解、重构和分布式网格。

- 文件数：118
- 基线：`OpenFOAM-14@20260724`
- 说明：索引按真实源码路径排序；文件卡名包含路径哈希，用于规避大小写冲突。

| 源码路径 | 类型 | 行数 | 文件解析 |
|---|---|---:|---|
| `src/parallel/Allwmake` | 脚本 | 16 | [打开](files/63/allwmake--6354b909da04.md) |
| `src/parallel/decompose/Allwmake` | 脚本 | 29 | [打开](files/f2/allwmake--f25074bfc3dd.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/decompositionConstraint/decompositionConstraint.C` | C/C++ 或词法/语法源文件 | 90 | [打开](files/51/decompositionconstraint.c--5146d18f261b.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/decompositionConstraint/decompositionConstraint.H` | C/C++ 或词法/语法源文件 | 154 | [打开](files/68/decompositionconstraint.h--689aa2af9dad.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/preserveBaffles/preserveBafflesConstraint.C` | C/C++ 或词法/语法源文件 | 249 | [打开](files/4d/preservebafflesconstraint.c--4d89cd511db0.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/preserveBaffles/preserveBafflesConstraint.H` | C/C++ 或词法/语法源文件 | 122 | [打开](files/c1/preservebafflesconstraint.h--c1a04a51fe0b.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/preserveFaceZones/preserveFaceZonesConstraint.C` | C/C++ 或词法/语法源文件 | 222 | [打开](files/8b/preservefacezonesconstraint.c--8b67cdd7272c.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/preserveFaceZones/preserveFaceZonesConstraint.H` | C/C++ 或词法/语法源文件 | 128 | [打开](files/db/preservefacezonesconstraint.h--db8427a4e53b.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/preservePatches/preservePatchesConstraint.C` | C/C++ 或词法/语法源文件 | 206 | [打开](files/58/preservepatchesconstraint.c--58bb8131e05d.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/preservePatches/preservePatchesConstraint.H` | C/C++ 或词法/语法源文件 | 129 | [打开](files/31/preservepatchesconstraint.h--312db0a3b263.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/refinementHistory/refinementHistoryConstraint.C` | C/C++ 或词法/语法源文件 | 228 | [打开](files/72/refinementhistoryconstraint.c--723cc228c751.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/refinementHistory/refinementHistoryConstraint.H` | C/C++ 或词法/语法源文件 | 120 | [打开](files/29/refinementhistoryconstraint.h--29265fa06963.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/singleProcessorFaceSets/singleProcessorFaceSetsConstraint.C` | C/C++ 或词法/语法源文件 | 325 | [打开](files/a4/singleprocessorfacesetsconstraint.c--a419eb8a5d9b.md) |
| `src/parallel/decompose/decompositionMethods/decompositionConstraints/singleProcessorFaceSets/singleProcessorFaceSetsConstraint.H` | C/C++ 或词法/语法源文件 | 130 | [打开](files/82/singleprocessorfacesetsconstraint.h--829c9d71b3b1.md) |
| `src/parallel/decompose/decompositionMethods/decompositionMethod/decompositionMethod.C` | C/C++ 或词法/语法源文件 | 1294 | [打开](files/c1/decompositionmethod.c--c1194bcc0467.md) |
| `src/parallel/decompose/decompositionMethods/decompositionMethod/decompositionMethod.H` | C/C++ 或词法/语法源文件 | 360 | [打开](files/27/decompositionmethod.h--273aef43a3a9.md) |
| `src/parallel/decompose/decompositionMethods/geometric/geometric.C` | C/C++ 或词法/语法源文件 | 72 | [打开](files/6a/geometric.c--6a83fa628310.md) |
| `src/parallel/decompose/decompositionMethods/geometric/geometric.H` | C/C++ 或词法/语法源文件 | 103 | [打开](files/71/geometric.h--71cb1412a9ec.md) |
| `src/parallel/decompose/decompositionMethods/hierarchical/hierarchical.C` | C/C++ 或词法/语法源文件 | 796 | [打开](files/45/hierarchical.c--45b2b91b0deb.md) |
| `src/parallel/decompose/decompositionMethods/hierarchical/hierarchical.H` | C/C++ 或词法/语法源文件 | 269 | [打开](files/44/hierarchical.h--44e0a7130c2d.md) |
| `src/parallel/decompose/decompositionMethods/Make/files` | 构建/运行清单 | 26 | [打开](files/44/files--4466018c0a94.md) |
| `src/parallel/decompose/decompositionMethods/Make/options` | 构建/运行清单 | 14 | [打开](files/f7/options--f71e1909c26f.md) |
| `src/parallel/decompose/decompositionMethods/manual/manual.C` | C/C++ 或词法/语法源文件 | 126 | [打开](files/b8/manual.c--b827dde1a713.md) |
| `src/parallel/decompose/decompositionMethods/manual/manual.H` | C/C++ 或词法/语法源文件 | 134 | [打开](files/8f/manual.h--8f970d4e1a5f.md) |
| `src/parallel/decompose/decompositionMethods/multiLevel/multiLevel.C` | C/C++ 或词法/语法源文件 | 353 | [打开](files/79/multilevel.c--7971543eefc0.md) |
| `src/parallel/decompose/decompositionMethods/multiLevel/multiLevel.H` | C/C++ 或词法/语法源文件 | 157 | [打开](files/0f/multilevel.h--0f94f75ae009.md) |
| `src/parallel/decompose/decompositionMethods/none/none.C` | C/C++ 或词法/语法源文件 | 60 | [打开](files/e5/none.c--e5c079f544c9.md) |
| `src/parallel/decompose/decompositionMethods/none/none.H` | C/C++ 或词法/语法源文件 | 131 | [打开](files/3d/none.h--3d41ecdc10ee.md) |
| `src/parallel/decompose/decompositionMethods/random/random.C` | C/C++ 或词法/语法源文件 | 117 | [打开](files/1f/random.c--1f5335354e4c.md) |
| `src/parallel/decompose/decompositionMethods/random/random.H` | C/C++ 或词法/语法源文件 | 132 | [打开](files/e6/random.h--e685465d54aa.md) |
| `src/parallel/decompose/decompositionMethods/simple/simple.C` | C/C++ 或词法/语法源文件 | 505 | [打开](files/98/simple.c--98218e035af0.md) |
| `src/parallel/decompose/decompositionMethods/simple/simple.H` | C/C++ 或词法/语法源文件 | 153 | [打开](files/d3/simple.h--d32c39eb069e.md) |
| `src/parallel/decompose/decompositionMethods/structured/structured.C` | C/C++ 或词法/语法源文件 | 198 | [打开](files/be/structured.c--be1db41d7612.md) |
| `src/parallel/decompose/decompositionMethods/structured/structured.H` | C/C++ 或词法/语法源文件 | 127 | [打开](files/b2/structured.h--b2d2f30a6140.md) |
| `src/parallel/decompose/metis/Allwmake` | 脚本 | 23 | [打开](files/47/allwmake--47bac96475d1.md) |
| `src/parallel/decompose/metis/Make/files` | 构建/运行清单 | 8 | [打开](files/ee/files--ee50a277f016.md) |
| `src/parallel/decompose/metis/Make/options` | 构建/运行清单 | 14 | [打开](files/d0/options--d042d4f5c514.md) |
| `src/parallel/decompose/metis/metis.C` | C/C++ 或词法/语法源文件 | 328 | [打开](files/35/metis.c--351efea6753e.md) |
| `src/parallel/decompose/metis/metis.H` | C/C++ 或词法/语法源文件 | 159 | [打开](files/9e/metis.h--9e9125c7513a.md) |
| `src/parallel/decompose/parMetis/Allwclean` | 脚本 | 13 | [打开](files/d9/allwclean--d9541c4efaee.md) |
| `src/parallel/decompose/parMetis/Allwmake` | 脚本 | 24 | [打开](files/5e/allwmake--5e6fbf3ecc1c.md) |
| `src/parallel/decompose/parMetis/Make/files` | 构建/运行清单 | 8 | [打开](files/28/files--2867c8913091.md) |
| `src/parallel/decompose/parMetis/Make/options` | 构建/运行清单 | 19 | [打开](files/a5/options--a5a208043d1f.md) |
| `src/parallel/decompose/parMetis/parMetis.C` | C/C++ 或词法/语法源文件 | 510 | [打开](files/30/parmetis.c--30ae126eab2f.md) |
| `src/parallel/decompose/parMetis/parMetis.H` | C/C++ 或词法/语法源文件 | 219 | [打开](files/8c/parmetis.h--8ca833f641fa.md) |
| `src/parallel/decompose/ptscotch/Allwclean` | 脚本 | 13 | [打开](files/b6/allwclean--b62286dcc385.md) |
| `src/parallel/decompose/ptscotch/Allwmake` | 脚本 | 29 | [打开](files/43/allwmake--43fe3514a571.md) |
| `src/parallel/decompose/ptscotch/Make/files` | 构建/运行清单 | 8 | [打开](files/75/files--75964a2c9313.md) |
| `src/parallel/decompose/ptscotch/Make/options` | 构建/运行清单 | 26 | [打开](files/93/options--93431d140045.md) |
| `src/parallel/decompose/ptscotch/ptscotch.C` | C/C++ 或词法/语法源文件 | 544 | [打开](files/59/ptscotch.c--597a65d8c408.md) |
| `src/parallel/decompose/ptscotch/ptscotch.H` | C/C++ 或词法/语法源文件 | 187 | [打开](files/dd/ptscotch.h--dd21a3cd67b3.md) |
| `src/parallel/decompose/scotch/Allwmake` | 脚本 | 23 | [打开](files/02/allwmake--026c3597b451.md) |
| `src/parallel/decompose/scotch/Make/files` | 构建/运行清单 | 8 | [打开](files/30/files--3069c86e87e1.md) |
| `src/parallel/decompose/scotch/Make/options` | 构建/运行清单 | 23 | [打开](files/77/options--771350c20007.md) |
| `src/parallel/decompose/scotch/scotch.C` | C/C++ 或词法/语法源文件 | 569 | [打开](files/89/scotch.c--89c86d68f624.md) |
| `src/parallel/decompose/scotch/scotch.H` | C/C++ 或词法/语法源文件 | 350 | [打开](files/e8/scotch.h--e87cfedbf0fc.md) |
| `src/parallel/decompose/zoltan/Allwclean` | 脚本 | 13 | [打开](files/37/allwclean--3796c3b9d410.md) |
| `src/parallel/decompose/zoltan/Allwmake` | 脚本 | 24 | [打开](files/7f/allwmake--7fada5359bf1.md) |
| `src/parallel/decompose/zoltan/Make/files` | 构建/运行清单 | 8 | [打开](files/d9/files--d90bcc1ca18d.md) |
| `src/parallel/decompose/zoltan/Make/options` | 构建/运行清单 | 19 | [打开](files/6e/options--6e6bbe86cd5c.md) |
| `src/parallel/decompose/zoltan/zoltan.C` | C/C++ 或词法/语法源文件 | 621 | [打开](files/a1/zoltan.c--a1bc2e018bc5.md) |
| `src/parallel/decompose/zoltan/zoltan.H` | C/C++ 或词法/语法源文件 | 201 | [打开](files/fd/zoltan.h--fdb4978baee3.md) |
| `src/parallel/distributed/distributedTriSurface/distributedTriSurface.C` | C/C++ 或词法/语法源文件 | 2440 | [打开](files/09/distributedtrisurface.c--093e592e90f2.md) |
| `src/parallel/distributed/distributedTriSurface/distributedTriSurface.H` | C/C++ 或词法/语法源文件 | 506 | [打开](files/47/distributedtrisurface.h--4790c98be74f.md) |
| `src/parallel/distributed/distributedTriSurface/distributedTriSurfaceTemplates.C` | C/C++ 或词法/语法源文件 | 120 | [打开](files/95/distributedtrisurfacetemplates.c--95c6e38297a0.md) |
| `src/parallel/distributed/Make/files` | 构建/运行清单 | 8 | [打开](files/4f/files--4fa9927280e1.md) |
| `src/parallel/distributed/Make/options` | 构建/运行清单 | 14 | [打开](files/3a/options--3a369829acbc.md) |
| `src/parallel/parallel/domainDecomposition/domainDecomposition.C` | C/C++ 或词法/语法源文件 | 1389 | [打开](files/5d/domaindecomposition.c--5d422484b2f9.md) |
| `src/parallel/parallel/domainDecomposition/domainDecomposition.H` | C/C++ 或词法/语法源文件 | 578 | [打开](files/72/domaindecomposition.h--72e414dc2f9e.md) |
| `src/parallel/parallel/domainDecomposition/domainDecompositionDecompose.C` | C/C++ 或词法/语法源文件 | 1287 | [打开](files/74/domaindecompositiondecompose.c--74995da3bf3c.md) |
| `src/parallel/parallel/domainDecomposition/domainDecompositionNonConformal.C` | C/C++ 或词法/语法源文件 | 1399 | [打开](files/d7/domaindecompositionnonconformal.c--d7cc265fe0fd.md) |
| `src/parallel/parallel/domainDecomposition/domainDecompositionReconstruct.C` | C/C++ 或词法/语法源文件 | 764 | [打开](files/13/domaindecompositionreconstruct.c--136ad4cfc719.md) |
| `src/parallel/parallel/fieldDecomposers/fvFieldDecomposer/fvFieldDecomposer.C` | C/C++ 或词法/语法源文件 | 144 | [打开](files/0b/fvfielddecomposer.c--0b9b54fce71d.md) |
| `src/parallel/parallel/fieldDecomposers/fvFieldDecomposer/fvFieldDecomposer.H` | C/C++ 或词法/语法源文件 | 207 | [打开](files/8e/fvfielddecomposer.h--8e7ef7350043.md) |
| `src/parallel/parallel/fieldDecomposers/fvFieldDecomposer/fvFieldDecomposerTemplates.C` | C/C++ 或词法/语法源文件 | 563 | [打开](files/04/fvfielddecomposertemplates.c--04c8c7dec626.md) |
| `src/parallel/parallel/fieldDecomposers/LagrangianFieldDecomposer/LagrangianFieldDecomposer.C` | C/C++ 或词法/语法源文件 | 220 | [打开](files/d3/lagrangianfielddecomposer.c--d384527051b9.md) |
| `src/parallel/parallel/fieldDecomposers/lagrangianFieldDecomposer/lagrangianFieldDecomposer.C` | C/C++ 或词法/语法源文件 | 198 | [打开](files/af/lagrangianfielddecomposer.c--afbbe3511dde.md) |
| `src/parallel/parallel/fieldDecomposers/LagrangianFieldDecomposer/LagrangianFieldDecomposer.H` | C/C++ 或词法/语法源文件 | 165 | [打开](files/ba/lagrangianfielddecomposer.h--ba0c9308b3c9.md) |
| `src/parallel/parallel/fieldDecomposers/lagrangianFieldDecomposer/lagrangianFieldDecomposer.H` | C/C++ 或词法/语法源文件 | 159 | [打开](files/38/lagrangianfielddecomposer.h--38d7c8ec06d7.md) |
| `src/parallel/parallel/fieldDecomposers/LagrangianFieldDecomposer/LagrangianFieldDecomposerTemplates.C` | C/C++ 或词法/语法源文件 | 231 | [打开](files/51/lagrangianfielddecomposertemplates.c--518686685c61.md) |
| `src/parallel/parallel/fieldDecomposers/lagrangianFieldDecomposer/lagrangianFieldDecomposerTemplates.C` | C/C++ 或词法/语法源文件 | 134 | [打开](files/fb/lagrangianfielddecomposertemplates.c--fbf86d758537.md) |
| `src/parallel/parallel/fieldDecomposers/pointFieldDecomposer/pointFieldDecomposer.C` | C/C++ 或词法/语法源文件 | 152 | [打开](files/2a/pointfielddecomposer.c--2a43a8f54f53.md) |
| `src/parallel/parallel/fieldDecomposers/pointFieldDecomposer/pointFieldDecomposer.H` | C/C++ 或词法/语法源文件 | 171 | [打开](files/d9/pointfielddecomposer.h--d9d8b7915a07.md) |
| `src/parallel/parallel/fieldDecomposers/pointFieldDecomposer/pointFieldDecomposerTemplates.C` | C/C++ 或词法/语法源文件 | 167 | [打开](files/43/pointfielddecomposertemplates.c--4359a8550a18.md) |
| `src/parallel/parallel/fieldReconstructors/fvFieldReconstructor/fvFieldReconstructor.C` | C/C++ 或词法/语法源文件 | 125 | [打开](files/da/fvfieldreconstructor.c--daf62c6bed3d.md) |
| `src/parallel/parallel/fieldReconstructors/fvFieldReconstructor/fvFieldReconstructor.H` | C/C++ 或词法/语法源文件 | 191 | [打开](files/71/fvfieldreconstructor.h--7145794d0709.md) |
| `src/parallel/parallel/fieldReconstructors/fvFieldReconstructor/fvFieldReconstructorTemplates.C` | C/C++ 或词法/语法源文件 | 564 | [打开](files/ff/fvfieldreconstructortemplates.c--ff6cef0531e6.md) |
| `src/parallel/parallel/fieldReconstructors/LagrangianFieldReconstructor/LagrangianFieldReconstructor.C` | C/C++ 或词法/语法源文件 | 172 | [打开](files/55/lagrangianfieldreconstructor.c--5567e49c2f69.md) |
| `src/parallel/parallel/fieldReconstructors/lagrangianFieldReconstructor/lagrangianFieldReconstructor.C` | C/C++ 或词法/语法源文件 | 148 | [打开](files/05/lagrangianfieldreconstructor.c--05a1d7492714.md) |
| `src/parallel/parallel/fieldReconstructors/LagrangianFieldReconstructor/LagrangianFieldReconstructor.H` | C/C++ 或词法/语法源文件 | 203 | [打开](files/5f/lagrangianfieldreconstructor.h--5f999c056ef8.md) |
| `src/parallel/parallel/fieldReconstructors/lagrangianFieldReconstructor/lagrangianFieldReconstructor.H` | C/C++ 或词法/语法源文件 | 185 | [打开](files/f1/lagrangianfieldreconstructor.h--f13b4aac95b8.md) |
| `src/parallel/parallel/fieldReconstructors/LagrangianFieldReconstructor/LagrangianFieldReconstructorTemplates.C` | C/C++ 或词法/语法源文件 | 249 | [打开](files/72/lagrangianfieldreconstructortemplates.c--7239743b95db.md) |
| `src/parallel/parallel/fieldReconstructors/lagrangianFieldReconstructor/lagrangianFieldReconstructorTemplates.C` | C/C++ 或词法/语法源文件 | 183 | [打开](files/30/lagrangianfieldreconstructortemplates.c--308d8f1d9460.md) |
| `src/parallel/parallel/fieldReconstructors/pointFieldReconstructor/pointFieldReconstructor.C` | C/C++ 或词法/语法源文件 | 119 | [打开](files/0a/pointfieldreconstructor.c--0a52b4735e39.md) |
| `src/parallel/parallel/fieldReconstructors/pointFieldReconstructor/pointFieldReconstructor.H` | C/C++ 或词法/语法源文件 | 148 | [打开](files/25/pointfieldreconstructor.h--25a57a1b05c8.md) |
| `src/parallel/parallel/fieldReconstructors/pointFieldReconstructor/pointFieldReconstructorTemplates.C` | C/C++ 或词法/语法源文件 | 213 | [打开](files/be/pointfieldreconstructortemplates.c--be3253168db1.md) |
| `src/parallel/parallel/Make/files` | 构建/运行清单 | 25 | [打开](files/8e/files--8ec4adbe1668.md) |
| `src/parallel/parallel/Make/options` | 构建/运行清单 | 21 | [打开](files/14/options--14a966bd31df.md) |
| `src/parallel/parallel/multiDomainDecomposition/multiDomainDecomposition.C` | C/C++ 或词法/语法源文件 | 248 | [打开](files/e2/multidomaindecomposition.c--e2ccbcf4814f.md) |
| `src/parallel/parallel/multiDomainDecomposition/multiDomainDecomposition.H` | C/C++ 或词法/语法源文件 | 139 | [打开](files/a4/multidomaindecomposition.h--a403d42751e6.md) |
| `src/parallel/parallel/processorRunTimes/processorRunTimes.C` | C/C++ 或词法/语法源文件 | 195 | [打开](files/0a/processorruntimes.c--0ae870d9f67d.md) |
| `src/parallel/parallel/processorRunTimes/processorRunTimes.H` | C/C++ 或词法/语法源文件 | 180 | [打开](files/3f/processorruntimes.h--3fea5c9ca7ae.md) |
| `src/Pstream/Allwclean` | 脚本 | 31 | [打开](files/de/allwclean--de0714154d3e.md) |
| `src/Pstream/Allwmake` | 脚本 | 39 | [打开](files/f8/allwmake--f8c022f99d0a.md) |
| `src/Pstream/dummy/Make/files` | 构建/运行清单 | 10 | [打开](files/6a/files--6a55ac4244d1.md) |
| `src/Pstream/dummy/Make/options` | 构建/运行清单 | 9 | [打开](files/f1/options--f18ceaa7fd60.md) |
| `src/Pstream/dummy/UIPread.C` | C/C++ 或词法/语法源文件 | 101 | [打开](files/00/uipread.c--00681d252028.md) |
| `src/Pstream/dummy/UOPwrite.C` | C/C++ 或词法/语法源文件 | 55 | [打开](files/3e/uopwrite.c--3e67f39437c7.md) |
| `src/Pstream/dummy/UPstream.C` | C/C++ 或词法/语法源文件 | 168 | [打开](files/bb/upstream.c--bb4676d5fb07.md) |
| `src/Pstream/mpi/allReduce.H` | C/C++ 或词法/语法源文件 | 79 | [打开](files/75/allreduce.h--752caeb2b0c0.md) |
| `src/Pstream/mpi/allReduceTemplates.C` | C/C++ 或词法/语法源文件 | 177 | [打开](files/f8/allreducetemplates.c--f882f2cc54e0.md) |
| `src/Pstream/mpi/Make/files` | 构建/运行清单 | 11 | [打开](files/ee/files--eea9511d8422.md) |
| `src/Pstream/mpi/Make/options` | 构建/运行清单 | 9 | [打开](files/84/options--84fa8a214c9e.md) |
| `src/Pstream/mpi/PstreamGlobals.C` | C/C++ 或词法/语法源文件 | 100 | [打开](files/5b/pstreamglobals.c--5b3d1aef8e04.md) |
| `src/Pstream/mpi/PstreamGlobals.H` | C/C++ 或词法/语法源文件 | 85 | [打开](files/f6/pstreamglobals.h--f690597e31ca.md) |
| `src/Pstream/mpi/UIPread.C` | C/C++ 或词法/语法源文件 | 366 | [打开](files/a3/uipread.c--a3f1e94b7414.md) |
| `src/Pstream/mpi/UOPwrite.C` | C/C++ 或词法/语法源文件 | 155 | [打开](files/6b/uopwrite.c--6b6104c00824.md) |
| `src/Pstream/mpi/UPstream.C` | C/C++ 或词法/语法源文件 | 918 | [打开](files/b0/upstream.c--b06b6ce23421.md) |
