# 湍流与输运：逐文件源码索引

层流、RANS、LES、动量与热物性输运闭合。

- 文件数：335
- 基线：`OpenFOAM-14@20260724`
- 说明：索引按真实源码路径排序；文件卡名包含路径哈希，用于规避大小写冲突。

| 源码路径 | 类型 | 行数 | 文件解析 |
|---|---|---:|---|
| `src/MomentumTransportModels/Allwmake` | 脚本 | 18 | [打开](files/0d/allwmake--0d3f3b81fc79.md) |
| `src/MomentumTransportModels/compressible/compressibleMomentumTransportModel.C` | C/C++ 或词法/语法源文件 | 99 | [打开](files/09/compressiblemomentumtransportmodel.c--0919654e3a0f.md) |
| `src/MomentumTransportModels/compressible/compressibleMomentumTransportModel.H` | C/C++ 或词法/语法源文件 | 175 | [打开](files/eb/compressiblemomentumtransportmodel.h--eb183e43a318.md) |
| `src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.C` | C/C++ 或词法/语法源文件 | 149 | [打开](files/0c/compressiblemomentumtransportmodels.c--0c9c2be0db68.md) |
| `src/MomentumTransportModels/compressible/compressibleMomentumTransportModels.H` | C/C++ 或词法/语法源文件 | 73 | [打开](files/07/compressiblemomentumtransportmodels.h--0745b4a591f5.md) |
| `src/MomentumTransportModels/compressible/compressibleMomentumTransportModelTemplates.C` | C/C++ 或词法/语法源文件 | 61 | [打开](files/0a/compressiblemomentumtransportmodeltemplates.c--0a161645855b.md) |
| `src/MomentumTransportModels/compressible/Make/files` | 构建/运行清单 | 9 | [打开](files/e0/files--e0bc1d737a79.md) |
| `src/MomentumTransportModels/compressible/Make/options` | 构建/运行清单 | 15 | [打开](files/65/options--65b258d8feb5.md) |
| `src/MomentumTransportModels/compressible/makeCompressibleMomentumTransportModel.H` | C/C++ 或词法/语法源文件 | 73 | [打开](files/76/makecompressiblemomentumtransportmodel.h--76018bb87199.md) |
| `src/MomentumTransportModels/compressible/RAS/buoyantKEpsilon/buoyantKEpsilon.C` | C/C++ 或词法/语法源文件 | 157 | [打开](files/3a/buoyantkepsilon.c--3a1795f74dea.md) |
| `src/MomentumTransportModels/compressible/RAS/buoyantKEpsilon/buoyantKEpsilon.H` | C/C++ 或词法/语法源文件 | 166 | [打开](files/56/buoyantkepsilon.h--5669b8d680ec.md) |
| `src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModel.C` | C/C++ 或词法/语法源文件 | 92 | [打开](files/18/incompressiblemomentumtransportmodel.c--18b92fa9f905.md) |
| `src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModel.H` | C/C++ 或词法/语法源文件 | 185 | [打开](files/d6/incompressiblemomentumtransportmodel.h--d66b1dda583c.md) |
| `src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.C` | C/C++ 或词法/语法源文件 | 146 | [打开](files/8e/incompressiblemomentumtransportmodels.c--8ef656aa90b7.md) |
| `src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModels.H` | C/C++ 或词法/语法源文件 | 70 | [打开](files/17/incompressiblemomentumtransportmodels.h--177fb8e614f3.md) |
| `src/MomentumTransportModels/incompressible/incompressibleMomentumTransportModelTemplates.C` | C/C++ 或词法/语法源文件 | 60 | [打开](files/f6/incompressiblemomentumtransportmodeltemplates.c--f64d8471d1f1.md) |
| `src/MomentumTransportModels/incompressible/Make/files` | 构建/运行清单 | 16 | [打开](files/1f/files--1f9afc351b9a.md) |
| `src/MomentumTransportModels/incompressible/Make/options` | 构建/运行清单 | 16 | [打开](files/e8/options--e8ff68d43184.md) |
| `src/MomentumTransportModels/incompressible/makeIncompressibleMomentumTransportModel.H` | C/C++ 或词法/语法源文件 | 73 | [打开](files/be/makeincompressiblemomentumtransportmodel.h--be4ca35e202a.md) |
| `src/MomentumTransportModels/incompressible/RAS/kkLOmega/kkLOmega.C` | C/C++ 或词法/语法源文件 | 564 | [打开](files/07/kklomega.c--07ea7579446f.md) |
| `src/MomentumTransportModels/incompressible/RAS/kkLOmega/kkLOmega.H` | C/C++ 或词法/语法源文件 | 322 | [打开](files/2a/kklomega.h--2aa769402c95.md) |
| `src/MomentumTransportModels/incompressible/RAS/LamBremhorstKE/LamBremhorstKE.C` | C/C++ 或词法/语法源文件 | 254 | [打开](files/20/lambremhorstke.c--20d36b6e5101.md) |
| `src/MomentumTransportModels/incompressible/RAS/LamBremhorstKE/LamBremhorstKE.H` | C/C++ 或词法/语法源文件 | 200 | [打开](files/e6/lambremhorstke.h--e61ef24883a0.md) |
| `src/MomentumTransportModels/incompressible/RAS/LienCubicKE/LienCubicKE.C` | C/C++ 或词法/语法源文件 | 322 | [打开](files/19/liencubicke.c--19f0daf41dd6.md) |
| `src/MomentumTransportModels/incompressible/RAS/LienCubicKE/LienCubicKE.H` | C/C++ 或词法/语法源文件 | 221 | [打开](files/c4/liencubicke.h--c4b18c802c1f.md) |
| `src/MomentumTransportModels/incompressible/RAS/LienLeschziner/LienLeschziner.C` | C/C++ 或词法/语法源文件 | 269 | [打开](files/06/lienleschziner.c--06e1b44dc215.md) |
| `src/MomentumTransportModels/incompressible/RAS/LienLeschziner/LienLeschziner.H` | C/C++ 或词法/语法源文件 | 208 | [打开](files/13/lienleschziner.h--138ee4b09998.md) |
| `src/MomentumTransportModels/incompressible/RAS/qZeta/qZeta.C` | C/C++ 或词法/语法源文件 | 278 | [打开](files/d5/qzeta.c--d5d75d08a71e.md) |
| `src/MomentumTransportModels/incompressible/RAS/qZeta/qZeta.H` | C/C++ 或词法/语法源文件 | 215 | [打开](files/a5/qzeta.h--a5d2a9eb0990.md) |
| `src/MomentumTransportModels/incompressible/RAS/ShihQuadraticKE/ShihQuadraticKE.C` | C/C++ 或词法/语法源文件 | 264 | [打开](files/0f/shihquadraticke.c--0fcdff66a9d8.md) |
| `src/MomentumTransportModels/incompressible/RAS/ShihQuadraticKE/ShihQuadraticKE.H` | C/C++ 或词法/语法源文件 | 202 | [打开](files/e0/shihquadraticke.h--e055395d2106.md) |
| `src/MomentumTransportModels/momentumTransportModels/Base/kOmegaSST/kOmegaSSTBase.C` | C/C++ 或词法/语法源文件 | 437 | [打开](files/6b/komegasstbase.c--6bbe04fe370f.md) |
| `src/MomentumTransportModels/momentumTransportModels/Base/kOmegaSST/kOmegaSSTBase.H` | C/C++ 或词法/语法源文件 | 344 | [打开](files/b5/komegasstbase.h--b5e102d24e39.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/fixedShearStress/fixedShearStressFvPatchVectorField.C` | C/C++ 或词法/语法源文件 | 124 | [打开](files/de/fixedshearstressfvpatchvectorfield.c--de40a1e0a5d9.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/fixedShearStress/fixedShearStressFvPatchVectorField.H` | C/C++ 或词法/语法源文件 | 141 | [打开](files/88/fixedshearstressfvpatchvectorfield.h--8856a2e41d8e.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/porousBafflePressure/porousBafflePressureFvPatchField.C` | C/C++ 或词法/语法源文件 | 219 | [打开](files/a1/porousbafflepressurefvpatchfield.c--a133af29b75d.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/porousBafflePressure/porousBafflePressureFvPatchField.H` | C/C++ 或词法/语法源文件 | 209 | [打开](files/8f/porousbafflepressurefvpatchfield.h--8f64b5984c7f.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/porousBafflePressure/porousBafflePressureFvPatchFieldFwd.H` | C/C++ 或词法/语法源文件 | 56 | [打开](files/62/porousbafflepressurefvpatchfieldfwd.h--628258a78e5a.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/epsilonWallFunctions/epsilonWallFunction/epsilonWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 300 | [打开](files/c5/epsilonwallfunctionfvpatchscalarfield.c--c5adf9770af4.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/epsilonWallFunctions/epsilonWallFunction/epsilonWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 209 | [打开](files/76/epsilonwallfunctionfvpatchscalarfield.h--768a5b75dfc0.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/fWallFunctions/fWallFunction/fWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 161 | [打开](files/c5/fwallfunctionfvpatchscalarfield.c--c50791d6141b.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/fWallFunctions/fWallFunction/fWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 155 | [打开](files/cb/fwallfunctionfvpatchscalarfield.h--cbf4c8563089.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/kqRWallFunctions/kLowReWallFunction/kLowReWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 162 | [打开](files/29/klowrewallfunctionfvpatchscalarfield.c--294d4cdff2ce.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/kqRWallFunctions/kLowReWallFunction/kLowReWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 170 | [打开](files/85/klowrewallfunctionfvpatchscalarfield.h--85e5cd368f88.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/kqRWallFunctions/kqRWallFunction/kqRWallFunctionFvPatchField.C` | C/C++ 或词法/语法源文件 | 93 | [打开](files/aa/kqrwallfunctionfvpatchfield.c--aab1caa954bc.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/kqRWallFunctions/kqRWallFunction/kqRWallFunctionFvPatchField.H` | C/C++ 或词法/语法源文件 | 163 | [打开](files/40/kqrwallfunctionfvpatchfield.h--40780b367470.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/kqRWallFunctions/kqRWallFunction/kqRWallFunctionFvPatchFields.C` | C/C++ 或词法/语法源文件 | 48 | [打开](files/3b/kqrwallfunctionfvpatchfields.c--3be10c641b39.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/kqRWallFunctions/kqRWallFunction/kqRWallFunctionFvPatchFields.H` | C/C++ 或词法/语法源文件 | 55 | [打开](files/06/kqrwallfunctionfvpatchfields.h--0690e0fd2b2c.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutkRoughWallFunction/nutkRoughWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 229 | [打开](files/56/nutkroughwallfunctionfvpatchscalarfield.c--566d659c8662.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutkRoughWallFunction/nutkRoughWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 232 | [打开](files/a8/nutkroughwallfunctionfvpatchscalarfield.h--a8e879237927.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutkWallFunction/nutkWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 148 | [打开](files/dc/nutkwallfunctionfvpatchscalarfield.c--dc9211f8231b.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutkWallFunction/nutkWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 155 | [打开](files/82/nutkwallfunctionfvpatchscalarfield.h--820dd82da920.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutLowReWallFunction/nutLowReWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 116 | [打开](files/d1/nutlowrewallfunctionfvpatchscalarfield.c--d160a9d9dafb.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutLowReWallFunction/nutLowReWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 156 | [打开](files/85/nutlowrewallfunctionfvpatchscalarfield.h--8502bf19cd48.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutURoughWallFunction/nutURoughWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 312 | [打开](files/af/nuturoughwallfunctionfvpatchscalarfield.c--afe17fb008ad.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutURoughWallFunction/nutURoughWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 228 | [打开](files/1a/nuturoughwallfunctionfvpatchscalarfield.h--1a66326bb96b.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutUSpaldingWallFunction/nutUSpaldingWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 202 | [打开](files/c5/nutuspaldingwallfunctionfvpatchscalarfield.c--c5dc7be3f381.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutUSpaldingWallFunction/nutUSpaldingWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 186 | [打开](files/40/nutuspaldingwallfunctionfvpatchscalarfield.h--400e929b9dba.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutUWallFunction/nutUWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 194 | [打开](files/eb/nutuwallfunctionfvpatchscalarfield.c--eb299db9eb40.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutUWallFunction/nutUWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 166 | [打开](files/01/nutuwallfunctionfvpatchscalarfield.h--0146e65147a3.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutWallFunction/nutWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 212 | [打开](files/ab/nutwallfunctionfvpatchscalarfield.c--ab31a6449b4f.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/nutWallFunctions/nutWallFunction/nutWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 230 | [打开](files/6c/nutwallfunctionfvpatchscalarfield.h--6c93d9fd221f.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/omegaWallFunctions/omegaWallFunction/omegaWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 342 | [打开](files/8f/omegawallfunctionfvpatchscalarfield.c--8f6bcae3bbe1.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/omegaWallFunctions/omegaWallFunction/omegaWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 221 | [打开](files/95/omegawallfunctionfvpatchscalarfield.h--9525db6c41c7.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/v2WallFunctions/v2WallFunction/v2WallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 152 | [打开](files/b3/v2wallfunctionfvpatchscalarfield.c--b334012e6b6d.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/v2WallFunctions/v2WallFunction/v2WallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 157 | [打开](files/0a/v2wallfunctionfvpatchscalarfield.h--0a09c9d266ca.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/wallCellWallFunction/wallCellWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 294 | [打开](files/e3/wallcellwallfunctionfvpatchscalarfield.c--e3e91af32ace.md) |
| `src/MomentumTransportModels/momentumTransportModels/derivedFvPatchFields/wallFunctions/wallCellWallFunction/wallCellWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 199 | [打开](files/6e/wallcellwallfunctionfvpatchscalarfield.h--6e3b5b2f33b2.md) |
| `src/MomentumTransportModels/momentumTransportModels/eddyViscosity/eddyViscosity.C` | C/C++ 或词法/语法源文件 | 113 | [打开](files/26/eddyviscosity.c--26bd5983005f.md) |
| `src/MomentumTransportModels/momentumTransportModels/eddyViscosity/eddyViscosity.H` | C/C++ 或词法/语法源文件 | 147 | [打开](files/67/eddyviscosity.h--678d8cba3afc.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonian.C` | C/C++ 或词法/语法源文件 | 130 | [打开](files/e7/generalisednewtonian.c--e7e4b6df6906.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonian.H` | C/C++ 或词法/语法源文件 | 153 | [打开](files/a4/generalisednewtonian.h--a4d935e461b9.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/generalisedNewtonianViscosityModel/generalisedNewtonianViscosityModel.C` | C/C++ 或词法/语法源文件 | 72 | [打开](files/0f/generalisednewtonianviscositymodel.c--0f0ac801a831.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/generalisedNewtonianViscosityModel/generalisedNewtonianViscosityModel.H` | C/C++ 或词法/语法源文件 | 158 | [打开](files/07/generalisednewtonianviscositymodel.h--07e050655036.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/generalisedNewtonianViscosityModel/generalisedNewtonianViscosityModelNew.C` | C/C++ 或词法/语法源文件 | 73 | [打开](files/9a/generalisednewtonianviscositymodelnew.c--9ab50e117234.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/Newtonian/NewtonianViscosityModel.C` | C/C++ 或词法/语法源文件 | 81 | [打开](files/50/newtonianviscositymodel.c--50f27ca7d3cb.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/Newtonian/NewtonianViscosityModel.H` | C/C++ 或词法/语法源文件 | 131 | [打开](files/e2/newtonianviscositymodel.h--e2a8c7140bf8.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/BirdCarreau/BirdCarreau.C` | C/C++ 或词法/语法源文件 | 134 | [打开](files/cc/birdcarreau.c--ccd5b2da2b0e.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/BirdCarreau/BirdCarreau.H` | C/C++ 或词法/语法源文件 | 162 | [打开](files/ba/birdcarreau.h--ba8a9550682f.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/Casson/Casson.C` | C/C++ 或词法/语法源文件 | 127 | [打开](files/76/casson.c--76ec53ea789c.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/Casson/Casson.H` | C/C++ 或词法/语法源文件 | 140 | [打开](files/fc/casson.h--fc47c7e6a19b.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/CrossPowerLaw/CrossPowerLaw.C` | C/C++ 或词法/语法源文件 | 131 | [打开](files/16/crosspowerlaw.c--164c64544f33.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/CrossPowerLaw/CrossPowerLaw.H` | C/C++ 或词法/语法源文件 | 147 | [打开](files/29/crosspowerlaw.h--292ce5a45079.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/HerschelBulkley/HerschelBulkley.C` | C/C++ 或词法/语法源文件 | 118 | [打开](files/f1/herschelbulkley.c--f1d07e7e3b43.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/HerschelBulkley/HerschelBulkley.H` | C/C++ 或词法/语法源文件 | 139 | [打开](files/18/herschelbulkley.h--18455554d533.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/powerLaw/powerLaw.C` | C/C++ 或词法/语法源文件 | 125 | [打开](files/9d/powerlaw.c--9dea0b856ce5.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/powerLaw/powerLaw.H` | C/C++ 或词法/语法源文件 | 137 | [打开](files/cb/powerlaw.h--cbcb606f01ea.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/strainRateFunction/strainRateFunction.C` | C/C++ 或词法/语法源文件 | 137 | [打开](files/4b/strainratefunction.c--4bb0550095ef.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/strainRateFunction/strainRateFunction.H` | C/C++ 或词法/语法源文件 | 127 | [打开](files/7a/strainratefunction.h--7aa142f1b7c0.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/strainRateViscosityModel/strainRateViscosityModel.C` | C/C++ 或词法/语法源文件 | 99 | [打开](files/fd/strainrateviscositymodel.c--fd9664778883.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/generalisedNewtonian/generalisedNewtonianViscosityModels/strainRateViscosityModels/strainRateViscosityModel/strainRateViscosityModel.H` | C/C++ 或词法/语法源文件 | 150 | [打开](files/7e/strainrateviscositymodel.h--7ea2bcf00c6b.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/Giesekus/Giesekus.C` | C/C++ 或词法/语法源文件 | 113 | [打开](files/4f/giesekus.c--4fcad118fe3c.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/Giesekus/Giesekus.H` | C/C++ 或词法/语法源文件 | 154 | [打开](files/ea/giesekus.h--ea88ae4178d2.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/lambdaThixotropic/lambdaThixotropic.C` | C/C++ 或词法/语法源文件 | 279 | [打开](files/42/lambdathixotropic.c--4200e672743b.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/lambdaThixotropic/lambdaThixotropic.H` | C/C++ 或词法/语法源文件 | 225 | [打开](files/98/lambdathixotropic.h--98a04b272627.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/laminarModel/laminarModel.C` | C/C++ 或词法/语法源文件 | 287 | [打开](files/99/laminarmodel.c--999123058ccc.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/laminarModel/laminarModel.H` | C/C++ 或词法/语法源文件 | 200 | [打开](files/38/laminarmodel.h--387d6eff7a10.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/Maxwell/Maxwell.C` | C/C++ 或词法/语法源文件 | 455 | [打开](files/86/maxwell.c--86bad486460a.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/Maxwell/Maxwell.H` | C/C++ 或词法/语法源文件 | 240 | [打开](files/05/maxwell.h--05b235c48f3a.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/PTT/PTT.C` | C/C++ 或词法/语法源文件 | 114 | [打开](files/17/ptt.c--172bf40dbdc7.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/PTT/PTT.H` | C/C++ 或词法/语法源文件 | 154 | [打开](files/8d/ptt.h--8d88e13d7935.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/Stokes/Stokes.C` | C/C++ 或词法/语法源文件 | 115 | [打开](files/d4/stokes.c--d4384cd6af2d.md) |
| `src/MomentumTransportModels/momentumTransportModels/laminar/Stokes/Stokes.H` | C/C++ 或词法/语法源文件 | 146 | [打开](files/5c/stokes.h--5cb44ff3b0a0.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/DeardorffDiffStress/DeardorffDiffStress.C` | C/C++ 或词法/语法源文件 | 200 | [打开](files/a5/deardorffdiffstress.c--a572b044a177.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/DeardorffDiffStress/DeardorffDiffStress.H` | C/C++ 或词法/语法源文件 | 178 | [打开](files/24/deardorffdiffstress.h--24721439ccc4.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/dynamicKEqn/dynamicKEqn.C` | C/C++ 或词法/语法源文件 | 284 | [打开](files/0e/dynamickeqn.c--0e5921e10940.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/dynamicKEqn/dynamicKEqn.H` | C/C++ 或词法/语法源文件 | 216 | [打开](files/c4/dynamickeqn.h--c42da8465b60.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/dynamicLagrangian/dynamicLagrangian.C` | C/C++ 或词法/语法源文件 | 232 | [打开](files/61/dynamiclagrangian.c--61f65b97c8b4.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/dynamicLagrangian/dynamicLagrangian.H` | C/C++ 或词法/语法源文件 | 183 | [打开](files/c0/dynamiclagrangian.h--c06204b8d7d9.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/kEqn/kEqn.C` | C/C++ 或词法/语法源文件 | 199 | [打开](files/48/keqn.c--48b38184a8f0.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/kEqn/kEqn.H` | C/C++ 或词法/语法源文件 | 185 | [打开](files/93/keqn.h--93cce00169b6.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/kOmegaSSTDES/kOmegaSSTDES.C` | C/C++ 或词法/语法源文件 | 152 | [打开](files/ac/komegasstdes.c--ac0d72485e6f.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/kOmegaSSTDES/kOmegaSSTDES.H` | C/C++ 或词法/语法源文件 | 175 | [打开](files/02/komegasstdes.h--02ed008467a3.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/cubeRootVolDelta/cubeRootVolDelta.C` | C/C++ 或词法/语法源文件 | 134 | [打开](files/b0/cuberootvoldelta.c--b02389f1dc7d.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/cubeRootVolDelta/cubeRootVolDelta.H` | C/C++ 或词法/语法源文件 | 122 | [打开](files/16/cuberootvoldelta.h--16602923dd17.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/IDDESDelta/IDDESDelta.C` | C/C++ 或词法/语法源文件 | 183 | [打开](files/f5/iddesdelta.c--f515dd353249.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/IDDESDelta/IDDESDelta.H` | C/C++ 或词法/语法源文件 | 133 | [打开](files/dc/iddesdelta.h--dc7321425b36.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/LESdelta/LESdelta.C` | C/C++ 或词法/语法源文件 | 155 | [打开](files/1c/lesdelta.c--1c0067b96ab0.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/LESdelta/LESdelta.H` | C/C++ 或词法/语法源文件 | 162 | [打开](files/de/lesdelta.h--de25de8aa635.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/maxDeltaxyz/maxDeltaxyz.C` | C/C++ 或词法/语法源文件 | 143 | [打开](files/92/maxdeltaxyz.c--921a6c27fd86.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/maxDeltaxyz/maxDeltaxyz.H` | C/C++ 或词法/语法源文件 | 127 | [打开](files/26/maxdeltaxyz.h--26683a3a34b3.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/PrandtlDelta/PrandtlDelta.C` | C/C++ 或词法/语法源文件 | 117 | [打开](files/c5/prandtldelta.c--c5f166d4b55f.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/PrandtlDelta/PrandtlDelta.H` | C/C++ 或词法/语法源文件 | 148 | [打开](files/03/prandtldelta.h--03abad2ad5a7.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/smoothDelta/smoothDelta.C` | C/C++ 或词法/语法源文件 | 201 | [打开](files/23/smoothdelta.c--23f97119c4b3.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/smoothDelta/smoothDelta.H` | C/C++ 或词法/语法源文件 | 299 | [打开](files/4d/smoothdelta.h--4d6a595f031c.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/smoothDelta/smoothDeltaDeltaDataI.H` | C/C++ 或词法/语法源文件 | 200 | [打开](files/5b/smoothdeltadeltadatai.h--5b3115d8fc0d.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/vanDriestDelta/vanDriestDelta.C` | C/C++ 或词法/语法源文件 | 206 | [打开](files/aa/vandriestdelta.c--aa660d8482ff.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/vanDriestDelta/vanDriestDelta.H` | C/C++ 或词法/语法源文件 | 129 | [打开](files/8a/vandriestdelta.h--8a899fa50d6f.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/vanDriestDelta/WallLocationYPlus.H` | C/C++ 或词法/语法源文件 | 137 | [打开](files/40/walllocationyplus.h--40a95734d87d.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESdeltas/vanDriestDelta/WallLocationYPlusI.H` | C/C++ 或词法/语法源文件 | 73 | [打开](files/5e/walllocationyplusi.h--5eee1239839a.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESeddyViscosity/LESeddyViscosity.C` | C/C++ 或词法/语法源文件 | 123 | [打开](files/16/leseddyviscosity.c--169b98060dab.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESeddyViscosity/LESeddyViscosity.H` | C/C++ 或词法/语法源文件 | 134 | [打开](files/8f/leseddyviscosity.h--8f016028d1ef.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/anisotropicFilter/anisotropicFilter.C` | C/C++ 或词法/语法源文件 | 220 | [打开](files/83/anisotropicfilter.c--838d7363aa86.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/anisotropicFilter/anisotropicFilter.H` | C/C++ 或词法/语法源文件 | 144 | [打开](files/98/anisotropicfilter.h--981c7a2c14c4.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/laplaceFilter/laplaceFilter.C` | C/C++ 或词法/语法源文件 | 166 | [打开](files/8a/laplacefilter.c--8ad71849525b.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/laplaceFilter/laplaceFilter.H` | C/C++ 或词法/语法源文件 | 140 | [打开](files/99/laplacefilter.h--99bd6de87b5e.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/LESfilter/LESfilter.C` | C/C++ 或词法/语法源文件 | 74 | [打开](files/9d/lesfilter.c--9db196cb9bbb.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/LESfilter/LESfilter.H` | C/C++ 或词法/语法源文件 | 180 | [打开](files/c6/lesfilter.h--c654a3e2b9c4.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/simpleFilter/simpleFilter.C` | C/C++ 或词法/语法源文件 | 136 | [打开](files/08/simplefilter.c--083361617e6a.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESfilters/simpleFilter/simpleFilter.H` | C/C++ 或词法/语法源文件 | 137 | [打开](files/39/simplefilter.h--3978af37efac.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESModel/LESModel.C` | C/C++ 或词法/语法源文件 | 213 | [打开](files/f9/lesmodel.c--f935aa13b57b.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/LESModel/LESModel.H` | C/C++ 或词法/语法源文件 | 240 | [打开](files/b3/lesmodel.h--b313bdba577b.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/Smagorinsky/Smagorinsky.C` | C/C++ 或词法/语法源文件 | 125 | [打开](files/78/smagorinsky.c--785d5ad49c75.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/Smagorinsky/Smagorinsky.H` | C/C++ 或词法/语法源文件 | 179 | [打开](files/db/smagorinsky.h--db9a684deeb8.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/SpalartAllmarasDDES/SpalartAllmarasDDES.C` | C/C++ 或词法/语法源文件 | 145 | [打开](files/ab/spalartallmarasddes.c--ab3a69b5df8b.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/SpalartAllmarasDDES/SpalartAllmarasDDES.H` | C/C++ 或词法/语法源文件 | 153 | [打开](files/1b/spalartallmarasddes.h--1b90e875bc5d.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/SpalartAllmarasDES/SpalartAllmarasDES.C` | C/C++ 或词法/语法源文件 | 434 | [打开](files/11/spalartallmarasdes.c--11f4b12a6df9.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/SpalartAllmarasDES/SpalartAllmarasDES.H` | C/C++ 或词法/语法源文件 | 226 | [打开](files/77/spalartallmarasdes.h--77b942abde84.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/SpalartAllmarasIDDES/SpalartAllmarasIDDES.C` | C/C++ 或词法/语法源文件 | 276 | [打开](files/b5/spalartallmarasiddes.c--b52cddf5f707.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/SpalartAllmarasIDDES/SpalartAllmarasIDDES.H` | C/C++ 或词法/语法源文件 | 186 | [打开](files/2f/spalartallmarasiddes.h--2fa1a386a094.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/WALE/WALE.C` | C/C++ 或词法/语法源文件 | 171 | [打开](files/ef/wale.c--efdd71ab6a3c.md) |
| `src/MomentumTransportModels/momentumTransportModels/LES/WALE/WALE.H` | C/C++ 或词法/语法源文件 | 179 | [打开](files/9d/wale.h--9d244983898f.md) |
| `src/MomentumTransportModels/momentumTransportModels/linearViscousStress/linearViscousStress.C` | C/C++ 或词法/语法源文件 | 153 | [打开](files/4d/linearviscousstress.c--4d4daec9f08b.md) |
| `src/MomentumTransportModels/momentumTransportModels/linearViscousStress/linearViscousStress.H` | C/C++ 或词法/语法源文件 | 134 | [打开](files/38/linearviscousstress.h--38e81cc9f583.md) |
| `src/MomentumTransportModels/momentumTransportModels/Make/files` | 构建/运行清单 | 91 | [打开](files/bb/files--bbd0c00c8524.md) |
| `src/MomentumTransportModels/momentumTransportModels/Make/options` | 构建/运行清单 | 13 | [打开](files/70/options--70e36b91d765.md) |
| `src/MomentumTransportModels/momentumTransportModels/makeMomentumTransportModel.H` | C/C++ 或词法/语法源文件 | 180 | [打开](files/a0/makemomentumtransportmodel.h--a098d76dd580.md) |
| `src/MomentumTransportModels/momentumTransportModels/momentumTransportModel.C` | C/C++ 或词法/语法源文件 | 182 | [打开](files/d9/momentumtransportmodel.c--d9f5937815ae.md) |
| `src/MomentumTransportModels/momentumTransportModels/momentumTransportModel.H` | C/C++ 或词法/语法源文件 | 270 | [打开](files/36/momentumtransportmodel.h--36c367269e58.md) |
| `src/MomentumTransportModels/momentumTransportModels/momentumTransportModelTemplates.C` | C/C++ 或词法/语法源文件 | 86 | [打开](files/77/momentumtransportmodeltemplates.c--77fde8e55515.md) |
| `src/MomentumTransportModels/momentumTransportModels/nonlinearEddyViscosity/nonlinearEddyViscosity.C` | C/C++ 或词法/语法源文件 | 153 | [打开](files/8c/nonlineareddyviscosity.c--8c6b0639995d.md) |
| `src/MomentumTransportModels/momentumTransportModels/nonlinearEddyViscosity/nonlinearEddyViscosity.H` | C/C++ 或词法/语法源文件 | 145 | [打开](files/b5/nonlineareddyviscosity.h--b587cc7f6fd7.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/derivedFvFieldSources/turbulentEpsilon/turbulentEpsilonFvScalarFieldSource.C` | C/C++ 或词法/语法源文件 | 152 | [打开](files/89/turbulentepsilonfvscalarfieldsource.c--89543700dcb8.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/derivedFvFieldSources/turbulentEpsilon/turbulentEpsilonFvScalarFieldSource.H` | C/C++ 或词法/语法源文件 | 195 | [打开](files/d8/turbulentepsilonfvscalarfieldsource.h--d882e241d4a9.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/derivedFvFieldSources/turbulentOmega/turbulentOmegaFvScalarFieldSource.C` | C/C++ 或词法/语法源文件 | 152 | [打开](files/ef/turbulentomegafvscalarfieldsource.c--ef85cf0bf39e.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/derivedFvFieldSources/turbulentOmega/turbulentOmegaFvScalarFieldSource.H` | C/C++ 或词法/语法源文件 | 195 | [打开](files/63/turbulentomegafvscalarfieldsource.h--6364f9720d8b.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/derivedFvPatchFields/turbulentEpsilon/turbulentEpsilonFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 160 | [打开](files/ce/turbulentepsilonfvpatchscalarfield.c--ce9ed2b62a35.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/derivedFvPatchFields/turbulentEpsilon/turbulentEpsilonFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 192 | [打开](files/87/turbulentepsilonfvpatchscalarfield.h--87fe18f696fa.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/derivedFvPatchFields/turbulentOmega/turbulentOmegaFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 160 | [打开](files/60/turbulentomegafvpatchscalarfield.c--60b0bd89ecd9.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/derivedFvPatchFields/turbulentOmega/turbulentOmegaFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 192 | [打开](files/fd/turbulentomegafvpatchscalarfield.h--fde5521ff1df.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kEpsilon/kEpsilon.C` | C/C++ 或词法/语法源文件 | 269 | [打开](files/53/kepsilon.c--53c081d84fbe.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kEpsilon/kEpsilon.H` | C/C++ 或词法/语法源文件 | 234 | [打开](files/7f/kepsilon.h--7f9c956ca83a.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kOmega/kOmega.C` | C/C++ 或词法/语法源文件 | 266 | [打开](files/ec/komega.c--eca278afd272.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kOmega/kOmega.H` | C/C++ 或词法/语法源文件 | 214 | [打开](files/4e/komega.h--4ed799604423.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kOmega2006/kOmega2006.C` | C/C++ 或词法/语法源文件 | 320 | [打开](files/82/komega2006.c--823a748590d5.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kOmega2006/kOmega2006.H` | C/C++ 或词法/语法源文件 | 229 | [打开](files/44/komega2006.h--44f91656c154.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSST/kOmegaSST.C` | C/C++ 或词法/语法源文件 | 77 | [打开](files/9f/komegasst.c--9fc6df91dcc0.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSST/kOmegaSST.H` | C/C++ 或词法/语法源文件 | 117 | [打开](files/61/komegasst.h--6149a32f6f70.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSSTLM/kOmegaSSTLM.C` | C/C++ 或词法/语法源文件 | 568 | [打开](files/f3/komegasstlm.c--f394f2922d64.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSSTLM/kOmegaSSTLM.H` | C/C++ 或词法/语法源文件 | 304 | [打开](files/b5/komegasstlm.h--b575eb9a5408.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSSTSAS/kOmegaSSTSAS.C` | C/C++ 或词法/语法源文件 | 169 | [打开](files/2e/komegasstsas.c--2e3ab132dee3.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/kOmegaSSTSAS/kOmegaSSTSAS.H` | C/C++ 或词法/语法源文件 | 203 | [打开](files/4f/komegasstsas.h--4ffa5066a2f0.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/LaunderSharmaKE/LaunderSharmaKE.C` | C/C++ 或词法/语法源文件 | 286 | [打开](files/7a/laundersharmake.c--7a4e5b2fb9d1.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/LaunderSharmaKE/LaunderSharmaKE.H` | C/C++ 或词法/语法源文件 | 236 | [打开](files/f2/laundersharmake.h--f2c54b49ac55.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/LRR/LRR.C` | C/C++ 或词法/语法源文件 | 335 | [打开](files/5a/lrr.c--5a06382e202c.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/LRR/LRR.H` | C/C++ 或词法/语法源文件 | 244 | [打开](files/a4/lrr.h--a4cdcb2712fb.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/RASModel/RASModel.C` | C/C++ 或词法/语法源文件 | 200 | [打开](files/4e/rasmodel.c--4ecf94997c81.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/RASModel/RASModel.H` | C/C++ 或词法/语法源文件 | 224 | [打开](files/88/rasmodel.h--88056730872d.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/realizableKE/realizableKE.C` | C/C++ 或词法/语法源文件 | 333 | [打开](files/48/realizableke.c--486256e5e0a4.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/realizableKE/realizableKE.H` | C/C++ 或词法/语法源文件 | 233 | [打开](files/36/realizableke.h--36bcc4e8a49c.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/RNGkEpsilon/RNGkEpsilon.C` | C/C++ 或词法/语法源文件 | 293 | [打开](files/93/rngkepsilon.c--937ef61bda3f.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/RNGkEpsilon/RNGkEpsilon.H` | C/C++ 或词法/语法源文件 | 237 | [打开](files/d9/rngkepsilon.h--d9af376b8d0e.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/SpalartAllmaras/SpalartAllmaras.C` | C/C++ 或词法/语法源文件 | 357 | [打开](files/4a/spalartallmaras.c--4abd4918f91b.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/SpalartAllmaras/SpalartAllmaras.H` | C/C++ 或词法/语法源文件 | 223 | [打开](files/6d/spalartallmaras.h--6d5f960e1e94.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/SSG/SSG.C` | C/C++ 或词法/语法源文件 | 324 | [打开](files/c9/ssg.c--c94b476ddef1.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/SSG/SSG.H` | C/C++ 或词法/语法源文件 | 235 | [打开](files/84/ssg.h--8425bb555165.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/v2f/v2f.C` | C/C++ 或词法/语法源文件 | 338 | [打开](files/b7/v2f.c--b727fd24beaa.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/v2f/v2f.H` | C/C++ 或词法/语法源文件 | 293 | [打开](files/c5/v2f.h--c52817545b8a.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/v2f/v2fBase.C` | C/C++ 或词法/语法源文件 | 47 | [打开](files/2c/v2fbase.c--2c64b0008a9d.md) |
| `src/MomentumTransportModels/momentumTransportModels/RAS/v2f/v2fBase.H` | C/C++ 或词法/语法源文件 | 99 | [打开](files/cc/v2fbase.h--ccf2b66baa1f.md) |
| `src/MomentumTransportModels/momentumTransportModels/ReynoldsStress/ReynoldsStress.C` | C/C++ 或词法/语法源文件 | 315 | [打开](files/7e/reynoldsstress.c--7e31133ec904.md) |
| `src/MomentumTransportModels/momentumTransportModels/ReynoldsStress/ReynoldsStress.H` | C/C++ 或词法/语法源文件 | 183 | [打开](files/98/reynoldsstress.h--98737ce9aa06.md) |
| `src/MomentumTransportModels/momentumTransportModels/simplifiedViscousStress/simplifiedViscousStress.C` | C/C++ 或词法/语法源文件 | 138 | [打开](files/ef/simplifiedviscousstress.c--efd1a9628c7f.md) |
| `src/MomentumTransportModels/momentumTransportModels/simplifiedViscousStress/simplifiedViscousStress.H` | C/C++ 或词法/语法源文件 | 146 | [打开](files/bf/simplifiedviscousstress.h--bf37bb0dab22.md) |
| `src/MomentumTransportModels/phaseCompressible/derivedFvPatchFields/wallFunctions/epsilonWallFunctions/epsilonmWallFunction/epsilonmWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 143 | [打开](files/8d/epsilonmwallfunctionfvpatchscalarfield.c--8deda0ce16a1.md) |
| `src/MomentumTransportModels/phaseCompressible/derivedFvPatchFields/wallFunctions/epsilonWallFunctions/epsilonmWallFunction/epsilonmWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 153 | [打开](files/e5/epsilonmwallfunctionfvpatchscalarfield.h--e51ad9f2c6dd.md) |
| `src/MomentumTransportModels/phaseCompressible/LES/continuousGasKEqn/continuousGasKEqn.C` | C/C++ 或词法/语法源文件 | 152 | [打开](files/d2/continuousgaskeqn.c--d288356bf15d.md) |
| `src/MomentumTransportModels/phaseCompressible/LES/continuousGasKEqn/continuousGasKEqn.H` | C/C++ 或词法/语法源文件 | 165 | [打开](files/63/continuousgaskeqn.h--63556d4f6bb0.md) |
| `src/MomentumTransportModels/phaseCompressible/LES/Niceno/NicenoKEqn.C` | C/C++ 或词法/语法源文件 | 220 | [打开](files/c4/nicenokeqn.c--c44d13ee2031.md) |
| `src/MomentumTransportModels/phaseCompressible/LES/Niceno/NicenoKEqn.H` | C/C++ 或词法/语法源文件 | 175 | [打开](files/48/nicenokeqn.h--481f5ef411e0.md) |
| `src/MomentumTransportModels/phaseCompressible/LES/SmagorinskyZhang/SmagorinskyZhang.C` | C/C++ 或词法/语法源文件 | 150 | [打开](files/e6/smagorinskyzhang.c--e66320a084bb.md) |
| `src/MomentumTransportModels/phaseCompressible/LES/SmagorinskyZhang/SmagorinskyZhang.H` | C/C++ 或词法/语法源文件 | 168 | [打开](files/2d/smagorinskyzhang.h--2dc26f3ed735.md) |
| `src/MomentumTransportModels/phaseCompressible/Make/files` | 构建/运行清单 | 11 | [打开](files/c7/files--c7a3b13da5f4.md) |
| `src/MomentumTransportModels/phaseCompressible/Make/options` | 构建/运行清单 | 16 | [打开](files/62/options--6215231955da.md) |
| `src/MomentumTransportModels/phaseCompressible/makePhaseCompressibleMomentumTransportModel.H` | C/C++ 或词法/语法源文件 | 74 | [打开](files/69/makephasecompressiblemomentumtransportmodel.h--69e94f4ee861.md) |
| `src/MomentumTransportModels/phaseCompressible/phaseCompressibleMomentumTransportModel.C` | C/C++ 或词法/语法源文件 | 117 | [打开](files/4e/phasecompressiblemomentumtransportmodel.c--4ecd6e5055e2.md) |
| `src/MomentumTransportModels/phaseCompressible/phaseCompressibleMomentumTransportModel.H` | C/C++ 或词法/语法源文件 | 184 | [打开](files/cc/phasecompressiblemomentumtransportmodel.h--cc1b40028f94.md) |
| `src/MomentumTransportModels/phaseCompressible/phaseCompressibleMomentumTransportModels.C` | C/C++ 或词法/语法源文件 | 92 | [打开](files/25/phasecompressiblemomentumtransportmodels.c--251b58c17fca.md) |
| `src/MomentumTransportModels/phaseCompressible/phaseCompressibleMomentumTransportModels.H` | C/C++ 或词法/语法源文件 | 73 | [打开](files/29/phasecompressiblemomentumtransportmodels.h--29529ee64d5a.md) |
| `src/MomentumTransportModels/phaseCompressible/phaseCompressibleMomentumTransportModelTemplates.C` | C/C++ 或词法/语法源文件 | 63 | [打开](files/3c/phasecompressiblemomentumtransportmodeltemplates.c--3c952269c560.md) |
| `src/MomentumTransportModels/phaseCompressible/RAS/continuousGasKEpsilon/continuousGasKEpsilon.C` | C/C++ 或词法/语法源文件 | 281 | [打开](files/9d/continuousgaskepsilon.c--9d7004debd7a.md) |
| `src/MomentumTransportModels/phaseCompressible/RAS/continuousGasKEpsilon/continuousGasKEpsilon.H` | C/C++ 或词法/语法源文件 | 183 | [打开](files/ee/continuousgaskepsilon.h--eeadc42b1c4a.md) |
| `src/MomentumTransportModels/phaseCompressible/RAS/kOmegaSSTSato/kOmegaSSTSato.C` | C/C++ 或词法/语法源文件 | 192 | [打开](files/06/komegasstsato.c--065c807d3700.md) |
| `src/MomentumTransportModels/phaseCompressible/RAS/kOmegaSSTSato/kOmegaSSTSato.H` | C/C++ 或词法/语法源文件 | 226 | [打开](files/6b/komegasstsato.h--6ba2e32c132f.md) |
| `src/MomentumTransportModels/phaseCompressible/RAS/LaheyKEpsilon/LaheyKEpsilon.C` | C/C++ 或词法/语法源文件 | 251 | [打开](files/b1/laheykepsilon.c--b1586909e032.md) |
| `src/MomentumTransportModels/phaseCompressible/RAS/LaheyKEpsilon/LaheyKEpsilon.H` | C/C++ 或词法/语法源文件 | 183 | [打开](files/de/laheykepsilon.h--de8a85654dc3.md) |
| `src/MomentumTransportModels/phaseCompressible/RAS/mixtureKEpsilon/mixtureKEpsilon.C` | C/C++ 或词法/语法源文件 | 653 | [打开](files/2f/mixturekepsilon.c--2f0d318ea27c.md) |
| `src/MomentumTransportModels/phaseCompressible/RAS/mixtureKEpsilon/mixtureKEpsilon.H` | C/C++ 或词法/语法源文件 | 278 | [打开](files/c8/mixturekepsilon.h--c89aed461f81.md) |
| `src/MomentumTransportModels/phaseIncompressible/Make/files` | 构建/运行清单 | 9 | [打开](files/8a/files--8aecacaf2069.md) |
| `src/MomentumTransportModels/phaseIncompressible/Make/options` | 构建/运行清单 | 16 | [打开](files/c2/options--c2bc44885fa2.md) |
| `src/MomentumTransportModels/phaseIncompressible/makePhaseIncompressibleMomentumTransportModel.H` | C/C++ 或词法/语法源文件 | 73 | [打开](files/6b/makephaseincompressiblemomentumtransportmodel.h--6be62506d9cc.md) |
| `src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModel.C` | C/C++ 或词法/语法源文件 | 133 | [打开](files/e3/phaseincompressiblemomentumtransportmodel.c--e35b4d894191.md) |
| `src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModel.H` | C/C++ 或词法/语法源文件 | 190 | [打开](files/71/phaseincompressiblemomentumtransportmodel.h--711c3bc93613.md) |
| `src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModels.C` | C/C++ 或词法/语法源文件 | 89 | [打开](files/59/phaseincompressiblemomentumtransportmodels.c--59d4ebf56362.md) |
| `src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModels.H` | C/C++ 或词法/语法源文件 | 73 | [打开](files/ce/phaseincompressiblemomentumtransportmodels.h--cecdff45f086.md) |
| `src/MomentumTransportModels/phaseIncompressible/phaseIncompressibleMomentumTransportModelTemplates.C` | C/C++ 或词法/语法源文件 | 61 | [打开](files/6c/phaseincompressiblemomentumtransportmodeltemplates.c--6cd20460d58a.md) |
| `src/ThermophysicalTransportModels/Allwmake` | 脚本 | 26 | [打开](files/da/allwmake--daace96597e2.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/coupledTemperature/coupledTemperatureFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 594 | [打开](files/9e/coupledtemperaturefvpatchscalarfield.c--9e0046dd1543.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/coupledTemperature/coupledTemperatureFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 252 | [打开](files/e3/coupledtemperaturefvpatchscalarfield.h--e39dd1ecb280.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/externalTemperature/externalTemperatureFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 578 | [打开](files/0c/externaltemperaturefvpatchscalarfield.c--0c64da0c2f71.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/externalTemperature/externalTemperatureFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 286 | [打开](files/4a/externaltemperaturefvpatchscalarfield.h--4a00be15d767.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/externalWallLayersHeatTransferCoefficient/externalWallLayersHeatTransferCoefficient_DimensionedFieldFunction.C` | C/C++ 或词法/语法源文件 | 134 | [打开](files/9d/externalwalllayersheattransfercoefficient_dimensionedfieldfunction.c--9d3017015a83.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/externalWallLayersHeatTransferCoefficient/externalWallLayersHeatTransferCoefficient_DimensionedFieldFunction.H` | C/C++ 或词法/语法源文件 | 152 | [打开](files/6d/externalwalllayersheattransfercoefficient_dimensionedfieldfunction.h--6df5db70cc12.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/lumpedMassTemperature/lumpedMassTemperatureFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 230 | [打开](files/71/lumpedmasstemperaturefvpatchscalarfield.c--71a85b4348cb.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/lumpedMassTemperature/lumpedMassTemperatureFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 225 | [打开](files/9c/lumpedmasstemperaturefvpatchscalarfield.h--9c6ab05e2902.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/Make/files` | 构建/运行清单 | 12 | [打开](files/31/files--31c8b73e8fea.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/Make/options` | 构建/运行清单 | 14 | [打开](files/24/options--249aadaeeb13.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/wallLayersHeatTransferCoefficient/wallLayersHeatTransferCoefficient_DimensionedFieldFunction.C` | C/C++ 或词法/语法源文件 | 139 | [打开](files/87/walllayersheattransfercoefficient_dimensionedfieldfunction.c--8783aff35c94.md) |
| `src/ThermophysicalTransportModels/coupledThermophysicalTransportModels/wallLayersHeatTransferCoefficient/wallLayersHeatTransferCoefficient_DimensionedFieldFunction.H` | C/C++ 或词法/语法源文件 | 152 | [打开](files/ed/walllayersheattransfercoefficient_dimensionedfieldfunction.h--edc25214a45b.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatJayatillekeWallFunction/alphatJayatillekeWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 269 | [打开](files/06/alphatjayatillekewallfunctionfvpatchscalarfield.c--06bfcfba5630.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatJayatillekeWallFunction/alphatJayatillekeWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 215 | [打开](files/2c/alphatjayatillekewallfunctionfvpatchscalarfield.h--2ce2c04eb86e.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatWallFunction/alphatWallFunctionFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 144 | [打开](files/c8/alphatwallfunctionfvpatchscalarfield.c--c88dd817007c.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/alphatWallFunctions/alphatWallFunction/alphatWallFunctionFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 193 | [打开](files/c8/alphatwallfunctionfvpatchscalarfield.h--c82cc54341ad.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/convectiveHeatTransfer/convectiveHeatTransferFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 159 | [打开](files/5e/convectiveheattransferfvpatchscalarfield.c--5e1791edfbfc.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/convectiveHeatTransfer/convectiveHeatTransferFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 190 | [打开](files/e7/convectiveheattransferfvpatchscalarfield.h--e7a11de25f94.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/externalCoupledTemperatureMixed/externalCoupledTemperatureMixedFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 223 | [打开](files/2b/externalcoupledtemperaturemixedfvpatchscalarfield.c--2b5dc4a10b03.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/externalCoupledTemperatureMixed/externalCoupledTemperatureMixedFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 239 | [打开](files/16/externalcoupledtemperaturemixedfvpatchscalarfield.h--1616e9aa85f2.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/thermalBaffle1D/thermalBaffle1DFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 416 | [打开](files/01/thermalbaffle1dfvpatchscalarfield.c--01f897f9e14e.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/thermalBaffle1D/thermalBaffle1DFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 258 | [打开](files/de/thermalbaffle1dfvpatchscalarfield.h--deb97ec754e7.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/thermalBaffle1D/thermalBaffle1DFvPatchScalarFields.C` | C/C++ 或词法/语法源文件 | 103 | [打开](files/cf/thermalbaffle1dfvpatchscalarfields.c--cf74f8677ddd.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/totalFlowRateAdvectiveDiffusive/totalFlowRateAdvectiveDiffusiveFvPatchScalarField.C` | C/C++ 或词法/语法源文件 | 195 | [打开](files/ee/totalflowrateadvectivediffusivefvpatchscalarfield.c--ee56e9b34129.md) |
| `src/ThermophysicalTransportModels/fluid/derivedFvPatchFields/totalFlowRateAdvectiveDiffusive/totalFlowRateAdvectiveDiffusiveFvPatchScalarField.H` | C/C++ 或词法/语法源文件 | 170 | [打开](files/15/totalflowrateadvectivediffusivefvpatchscalarfield.h--15704292203f.md) |
| `src/ThermophysicalTransportModels/fluid/fluidThermophysicalTransportModel/fluidThermophysicalTransportModel.C` | C/C++ 或词法/语法源文件 | 62 | [打开](files/c4/fluidthermophysicaltransportmodel.c--c4900f12b2f2.md) |
| `src/ThermophysicalTransportModels/fluid/fluidThermophysicalTransportModel/fluidThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 153 | [打开](files/5b/fluidthermophysicaltransportmodel.h--5b059a3966c4.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/Fickian/Fickian.C` | C/C++ 或词法/语法源文件 | 693 | [打开](files/52/fickian.c--522bf3e8e428.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/Fickian/Fickian.H` | C/C++ 或词法/语法源文件 | 217 | [打开](files/3e/fickian.h--3ed49b7efdf0.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/FickianFourier/FickianFourier.C` | C/C++ 或词法/语法源文件 | 80 | [打开](files/e4/fickianfourier.c--e4879b776a31.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/FickianFourier/FickianFourier.H` | C/C++ 或词法/语法源文件 | 192 | [打开](files/40/fickianfourier.h--403a183ec054.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/Fourier/Fourier.C` | C/C++ 或词法/语法源文件 | 252 | [打开](files/1e/fourier.c--1e639617be6d.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/Fourier/Fourier.H` | C/C++ 或词法/语法源文件 | 174 | [打开](files/a8/fourier.h--a8e6f60081bc.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/laminarThermophysicalTransportModel/laminarThermophysicalTransportModel.C` | C/C++ 或词法/语法源文件 | 190 | [打开](files/3a/laminarthermophysicaltransportmodel.c--3ab761857383.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/laminarThermophysicalTransportModel/laminarThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 208 | [打开](files/0e/laminarthermophysicaltransportmodel.h--0e5ff1789034.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/MaxwellStefan/MaxwellStefan.C` | C/C++ 或词法/语法源文件 | 979 | [打开](files/17/maxwellstefan.c--17d3adf3fb4e.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/MaxwellStefan/MaxwellStefan.H` | C/C++ 或词法/语法源文件 | 296 | [打开](files/fb/maxwellstefan.h--fb966fa1f415.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/MaxwellStefanFourier/MaxwellStefanFourier.C` | C/C++ 或词法/语法源文件 | 80 | [打开](files/51/maxwellstefanfourier.c--5131a46970f4.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/MaxwellStefanFourier/MaxwellStefanFourier.H` | C/C++ 或词法/语法源文件 | 165 | [打开](files/3e/maxwellstefanfourier.h--3e8495e40321.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/unityLewisFourier/unityLewisFourier.C` | C/C++ 或词法/语法源文件 | 202 | [打开](files/2c/unitylewisfourier.c--2cb02be5e8e9.md) |
| `src/ThermophysicalTransportModels/fluid/laminar/unityLewisFourier/unityLewisFourier.H` | C/C++ 或词法/语法源文件 | 203 | [打开](files/bd/unitylewisfourier.h--bdcfac03200f.md) |
| `src/ThermophysicalTransportModels/fluid/Make/files` | 构建/运行清单 | 16 | [打开](files/13/files--132803d25504.md) |
| `src/ThermophysicalTransportModels/fluid/Make/options` | 构建/运行清单 | 24 | [打开](files/3e/options--3e15c2c22245.md) |
| `src/ThermophysicalTransportModels/fluid/makeThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 209 | [打开](files/14/makethermophysicaltransportmodel.h--146136b1ca2b.md) |
| `src/ThermophysicalTransportModels/fluid/PhaseThermophysicalTransportModel/PhaseThermophysicalTransportModel.C` | C/C++ 或词法/语法源文件 | 81 | [打开](files/f6/phasethermophysicaltransportmodel.c--f66f04338fc1.md) |
| `src/ThermophysicalTransportModels/fluid/PhaseThermophysicalTransportModel/PhaseThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 108 | [打开](files/75/phasethermophysicaltransportmodel.h--75091d8323e3.md) |
| `src/ThermophysicalTransportModels/fluid/ThermophysicalTransportModel/ThermophysicalTransportModel.C` | C/C++ 或词法/语法源文件 | 92 | [打开](files/aa/thermophysicaltransportmodel.c--aa9ffbf11cdb.md) |
| `src/ThermophysicalTransportModels/fluid/ThermophysicalTransportModel/ThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 167 | [打开](files/9d/thermophysicaltransportmodel.h--9dc2721a261c.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/eddyDiffusivity/eddyDiffusivity.C` | C/C++ 或词法/语法源文件 | 294 | [打开](files/87/eddydiffusivity.c--87f9afb42eb0.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/eddyDiffusivity/eddyDiffusivity.H` | C/C++ 或词法/语法源文件 | 249 | [打开](files/41/eddydiffusivity.h--41092be91ce2.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/FickianEddyDiffusivity/FickianEddyDiffusivity.C` | C/C++ 或词法/语法源文件 | 131 | [打开](files/5e/fickianeddydiffusivity.c--5ebdbd1c097b.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/FickianEddyDiffusivity/FickianEddyDiffusivity.H` | C/C++ 或词法/语法源文件 | 212 | [打开](files/81/fickianeddydiffusivity.h--81dff56358bb.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/LES/LESThermophysicalTransportModel/LESThermophysicalTransportModel.C` | C/C++ 或词法/语法源文件 | 198 | [打开](files/6c/lesthermophysicaltransportmodel.c--6c66d9bd3809.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/LES/LESThermophysicalTransportModel/LESThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 178 | [打开](files/16/lesthermophysicaltransportmodel.h--16a0fa7a4b9b.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/nonUnityLewisEddyDiffusivity/nonUnityLewisEddyDiffusivity.C` | C/C++ 或词法/语法源文件 | 257 | [打开](files/4e/nonunitylewiseddydiffusivity.c--4e25196ed5bf.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/nonUnityLewisEddyDiffusivity/nonUnityLewisEddyDiffusivity.H` | C/C++ 或词法/语法源文件 | 179 | [打开](files/7e/nonunitylewiseddydiffusivity.h--7ead2f3939fd.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/RAS/RASThermophysicalTransportModel/RASThermophysicalTransportModel.C` | C/C++ 或词法/语法源文件 | 200 | [打开](files/bd/rasthermophysicaltransportmodel.c--bd0b964b6924.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/RAS/RASThermophysicalTransportModel/RASThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 178 | [打开](files/46/rasthermophysicaltransportmodel.h--469acbe74f35.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/unityLewisEddyDiffusivity/unityLewisEddyDiffusivity.C` | C/C++ 或词法/语法源文件 | 244 | [打开](files/38/unitylewiseddydiffusivity.c--380712ddfaec.md) |
| `src/ThermophysicalTransportModels/fluid/turbulence/unityLewisEddyDiffusivity/unityLewisEddyDiffusivity.H` | C/C++ 或词法/语法源文件 | 274 | [打开](files/b2/unitylewiseddydiffusivity.h--b2017b83ec08.md) |
| `src/ThermophysicalTransportModels/fluidMulticomponentThermo/fluidMulticomponentThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 87 | [打开](files/13/fluidmulticomponentthermophysicaltransportmodel.h--13891846bd32.md) |
| `src/ThermophysicalTransportModels/fluidMulticomponentThermo/fluidMulticomponentThermophysicalTransportModels.C` | C/C++ 或词法/语法源文件 | 92 | [打开](files/95/fluidmulticomponentthermophysicaltransportmodels.c--9594b1652741.md) |
| `src/ThermophysicalTransportModels/fluidMulticomponentThermo/fluidMulticomponentThermophysicalTransportModels.H` | C/C++ 或词法/语法源文件 | 87 | [打开](files/d6/fluidmulticomponentthermophysicaltransportmodels.h--d65aca1c9c59.md) |
| `src/ThermophysicalTransportModels/fluidMulticomponentThermo/Make/files` | 构建/运行清单 | 8 | [打开](files/d5/files--d5697c0dddf4.md) |
| `src/ThermophysicalTransportModels/fluidMulticomponentThermo/Make/options` | 构建/运行清单 | 25 | [打开](files/e5/options--e52d79160f0c.md) |
| `src/ThermophysicalTransportModels/fluidThermo/fluidThermoThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 87 | [打开](files/a3/fluidthermothermophysicaltransportmodel.h--a324c10ffaa1.md) |
| `src/ThermophysicalTransportModels/fluidThermo/fluidThermoThermophysicalTransportModels.C` | C/C++ 或词法/语法源文件 | 77 | [打开](files/44/fluidthermothermophysicaltransportmodels.c--4493e8e40b13.md) |
| `src/ThermophysicalTransportModels/fluidThermo/fluidThermoThermophysicalTransportModels.H` | C/C++ 或词法/语法源文件 | 87 | [打开](files/9e/fluidthermothermophysicaltransportmodels.h--9ef4c2f5f3cc.md) |
| `src/ThermophysicalTransportModels/fluidThermo/Make/files` | 构建/运行清单 | 8 | [打开](files/7f/files--7f01dbcf06cb.md) |
| `src/ThermophysicalTransportModels/fluidThermo/Make/options` | 构建/运行清单 | 25 | [打开](files/28/options--283f20ea5e83.md) |
| `src/ThermophysicalTransportModels/phaseFluidMulticomponentThermo/Make/files` | 构建/运行清单 | 8 | [打开](files/7d/files--7d6fd1ea9359.md) |
| `src/ThermophysicalTransportModels/phaseFluidMulticomponentThermo/Make/options` | 构建/运行清单 | 26 | [打开](files/bb/options--bb5af3795b11.md) |
| `src/ThermophysicalTransportModels/phaseFluidMulticomponentThermo/phaseFluidMulticomponentThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 88 | [打开](files/ca/phasefluidmulticomponentthermophysicaltransportmodel.h--ca46d03d3c79.md) |
| `src/ThermophysicalTransportModels/phaseFluidMulticomponentThermo/phaseFluidMulticomponentThermophysicalTransportModels.C` | C/C++ 或词法/语法源文件 | 95 | [打开](files/d2/phasefluidmulticomponentthermophysicaltransportmodels.c--d216f0bfdb50.md) |
| `src/ThermophysicalTransportModels/phaseFluidMulticomponentThermo/phaseFluidMulticomponentThermophysicalTransportModels.H` | C/C++ 或词法/语法源文件 | 88 | [打开](files/8d/phasefluidmulticomponentthermophysicaltransportmodels.h--8dd671bc1f16.md) |
| `src/ThermophysicalTransportModels/phaseFluidThermo/Make/files` | 构建/运行清单 | 8 | [打开](files/8c/files--8c3b9617e531.md) |
| `src/ThermophysicalTransportModels/phaseFluidThermo/Make/options` | 构建/运行清单 | 24 | [打开](files/4c/options--4cf91e7d533b.md) |
| `src/ThermophysicalTransportModels/phaseFluidThermo/phaseFluidThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 88 | [打开](files/80/phasefluidthermophysicaltransportmodel.h--80c2ec5cdb6b.md) |
| `src/ThermophysicalTransportModels/phaseFluidThermo/phaseFluidThermophysicalTransportModels.C` | C/C++ 或词法/语法源文件 | 77 | [打开](files/e3/phasefluidthermophysicaltransportmodels.c--e3621cfaa654.md) |
| `src/ThermophysicalTransportModels/phaseFluidThermo/phaseFluidThermophysicalTransportModels.H` | C/C++ 或词法/语法源文件 | 88 | [打开](files/62/phasefluidthermophysicaltransportmodels.h--627e6c835f86.md) |
| `src/ThermophysicalTransportModels/phaseSolid/Make/files` | 构建/运行清单 | 9 | [打开](files/26/files--26561f5375c5.md) |
| `src/ThermophysicalTransportModels/phaseSolid/Make/options` | 构建/运行清单 | 21 | [打开](files/27/options--27f1c4dd56fb.md) |
| `src/ThermophysicalTransportModels/phaseSolid/phaseSolidThermophysicalTransportModel/phaseSolidThermophysicalTransportModel.C` | C/C++ 或词法/语法源文件 | 175 | [打开](files/e3/phasesolidthermophysicaltransportmodel.c--e34653fadb22.md) |
| `src/ThermophysicalTransportModels/phaseSolid/phaseSolidThermophysicalTransportModel/phaseSolidThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 192 | [打开](files/b9/phasesolidthermophysicaltransportmodel.h--b9ffcb1c9c30.md) |
| `src/ThermophysicalTransportModels/phaseSolid/phaseSolidThermophysicalTransportModels.C` | C/C++ 或词法/语法源文件 | 77 | [打开](files/81/phasesolidthermophysicaltransportmodels.c--815751a406a3.md) |
| `src/ThermophysicalTransportModels/solid/anisotropic/anisotropic.C` | C/C++ 或词法/语法源文件 | 527 | [打开](files/ff/anisotropic.c--ff2a378e4c8e.md) |
| `src/ThermophysicalTransportModels/solid/anisotropic/anisotropic.H` | C/C++ 或词法/语法源文件 | 243 | [打开](files/56/anisotropic.h--56339a6059d7.md) |
| `src/ThermophysicalTransportModels/solid/isotropic/isotropic.C` | C/C++ 或词法/语法源文件 | 137 | [打开](files/8b/isotropic.c--8b42bdff0dd7.md) |
| `src/ThermophysicalTransportModels/solid/isotropic/isotropic.H` | C/C++ 或词法/语法源文件 | 129 | [打开](files/ea/isotropic.h--ea60bec29aae.md) |
| `src/ThermophysicalTransportModels/solid/Make/files` | 构建/运行清单 | 9 | [打开](files/77/files--772d18bf1fc7.md) |
| `src/ThermophysicalTransportModels/solid/Make/options` | 构建/运行清单 | 20 | [打开](files/58/options--58df195f45f0.md) |
| `src/ThermophysicalTransportModels/solid/solidThermophysicalTransportModel/solidThermophysicalTransportModel.C` | C/C++ 或词法/语法源文件 | 166 | [打开](files/15/solidthermophysicaltransportmodel.c--15227322ae5f.md) |
| `src/ThermophysicalTransportModels/solid/solidThermophysicalTransportModel/solidThermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 191 | [打开](files/23/solidthermophysicaltransportmodel.h--231555985b91.md) |
| `src/ThermophysicalTransportModels/solid/solidThermophysicalTransportModels.C` | C/C++ 或词法/语法源文件 | 77 | [打开](files/6b/solidthermophysicaltransportmodels.c--6b1b21a7917b.md) |
| `src/ThermophysicalTransportModels/thermophysicalTransportModel/Make/files` | 构建/运行清单 | 8 | [打开](files/74/files--74cc02fa3d9f.md) |
| `src/ThermophysicalTransportModels/thermophysicalTransportModel/Make/options` | 构建/运行清单 | 12 | [打开](files/af/options--afa013e8e559.md) |
| `src/ThermophysicalTransportModels/thermophysicalTransportModel/thermophysicalTransportModel.C` | C/C++ 或词法/语法源文件 | 85 | [打开](files/df/thermophysicaltransportmodel.c--df0116e4cb88.md) |
| `src/ThermophysicalTransportModels/thermophysicalTransportModel/thermophysicalTransportModel.H` | C/C++ 或词法/语法源文件 | 138 | [打开](files/ad/thermophysicaltransportmodel.h--ad7d97fa3ad6.md) |
