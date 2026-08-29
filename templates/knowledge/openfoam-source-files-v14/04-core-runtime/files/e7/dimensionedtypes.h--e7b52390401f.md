---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-e7b52390401f"
title: "OpenFOAM 14 源码解析：dimensionedTypes.H"
summary: "该文件为“核心运行时”提供 `dimensionedTypes` 相关接口、模板实例或支撑定义。"
category: { slug: openfoam-v14-04-core-runtime, name: OpenFOAM 源码 · 核心运行时 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/OpenFOAM/dimensionedTypes/dimensionedTypes.H"
tags: [OpenFOAM14, 源码解析, 核心运行时]
---

# OpenFOAM 14 源码解析：dimensionedTypes.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/OpenFOAM/dimensionedTypes/dimensionedTypes.H`
- 功能分类：核心运行时
- 文件类型：C/C++ 或词法/语法源文件
- 规模：47 行
- 文件标识：`e7b52390401f`

## 2. 功能说明

该文件为“核心运行时”提供 `dimensionedTypes` 相关接口、模板实例或支撑定义。

中文导航角色：OpenFOAM 核心基础设施。

上游说明：上游文件头未提供独立 Description 段。

## 3. 主要类型

未通过轻量静态规则识别到明确的类或结构体；可能由宏或模板展开生成。

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. 本文件以声明、类型别名、模板实例或数据定义为主，未检测到独立数值流程。
2. 阅读时应从公开类型/函数进入，再到对应 `.C`、`.H` 或模板实现文件核对具体控制流。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`dimensionedScalar.H`](../../../04-core-runtime/files/94/dimensionedscalar.h--94226c94054a.md)
- [`dimensionedVector.H`](../../../04-core-runtime/files/6f/dimensionedvector.h--6f5f78c5f142.md)
- [`dimensionedSphericalTensor.H`](../../../04-core-runtime/files/91/dimensionedsphericaltensor.h--918eef8de140.md)
- [`dimensionedSymmTensor.H`](../../../04-core-runtime/files/23/dimensionedsymmtensor.h--23b789f27a9d.md)
- [`dimensionedTensor.H`](../../../04-core-runtime/files/98/dimensionedtensor.h--986eb1e8f89d.md)

## 8. 直接上层引用

- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/mixtures/homogeneousMixture/homogeneousMixture.H](../../../17-other-libraries/files/46/homogeneousmixture.h--46b98e0971d4.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/mixtures/inhomogeneousEGRMixture/inhomogeneousEGRMixture.H](../../../17-other-libraries/files/e4/inhomogeneousegrmixture.h--e4c15ad6a7cb.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/mixtures/inhomogeneousMixture/inhomogeneousMixture.H](../../../17-other-libraries/files/08/inhomogeneousmixture.h--08a7e93d8a06.md)
- [applications/legacy/combustion/PDRFoam/psiuMulticomponentThermo/mixtures/leanInhomogeneousMixture/leanInhomogeneousMixture.H](../../../17-other-libraries/files/eb/leaninhomogeneousmixture.h--ebb332d1f871.md)
- [applications/modules/multiphaseEuler/fvModels/wallBoiling/wallBoilingModelsCoefficient.H](../../../02-solver-modules/files/9a/wallboilingmodelscoefficient.h--9a19ccadce34.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/conductivityModel/conductivityModel/conductivityModel.H](../../../02-solver-modules/files/c3/conductivitymodel.h--c32b022cb714.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/frictionalStressModel/frictionalStressModel/frictionalStressModel.H](../../../02-solver-modules/files/c0/frictionalstressmodel.h--c0108992b2e4.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/granularPressureModel/granularPressureModel/granularPressureModel.H](../../../02-solver-modules/files/e2/granularpressuremodel.h--e27a801f0542.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/radialModel/radialModel/radialModel.H](../../../02-solver-modules/files/ce/radialmodel.h--ce3901752d45.md)
- [applications/modules/multiphaseEuler/momentumTransportModels/kineticTheoryModels/viscosityModel/viscosityModel/kineticTheoryViscosityModel.H](../../../02-solver-modules/files/ca/kinetictheoryviscositymodel.h--ca67544ffe9c.md)
- [applications/modules/XiFluid/fvModels/ignition/kernelShapes/cylindrical/cylindricalKernelShape.H](../../../02-solver-modules/files/e3/cylindricalkernelshape.h--e386bcc57e69.md)
- [applications/modules/XiFluid/fvModels/ignition/kernelShapes/kernelShape/kernelShape.H](../../../02-solver-modules/files/12/kernelshape.h--12e9d69f4adf.md)
- [applications/modules/XiFluid/fvModels/ignition/kernelShapes/planar/planarKernelShape.H](../../../02-solver-modules/files/3f/planarkernelshape.h--3f19bacf12ce.md)
- [applications/modules/XiFluid/fvModels/ignition/kernelShapes/spherical/sphericalKernelShape.H](../../../02-solver-modules/files/32/sphericalkernelshape.h--32dc2e61a463.md)
- [applications/utilities/thermophysical/adiabaticFlameT/adiabaticFlameT.C](../../../03-utilities/files/fd/adiabaticflamet.c--fd27ae0908bd.md)
- [applications/utilities/thermophysical/equilibriumFlameT/equilibriumFlameT.C](../../../03-utilities/files/33/equilibriumflamet.c--3348ceeb96f0.md)
- [src/finiteVolume/fields/GeometricFields/GeometricField/GeometricBoundaryField.H](../../../05-finite-volume/files/06/geometricboundaryfield.h--06eccfe142f5.md)
- [src/finiteVolume/fields/GeometricFields/GeometricField/GeometricFieldSources.H](../../../05-finite-volume/files/d7/geometricfieldsources.h--d792cff5f790.md)
- [src/finiteVolume/finiteVolume/fvc/fvcDdt.H](../../../05-finite-volume/files/78/fvcddt.h--78d28871151f.md)
- [src/finiteVolume/finiteVolume/fvc/fvcLaplacian.H](../../../05-finite-volume/files/e5/fvclaplacian.h--e5b7573a0e31.md)
- [src/finiteVolume/finiteVolume/fvc/fvcMeshPhi.H](../../../05-finite-volume/files/ea/fvcmeshphi.h--eae2819d7090.md)
- [src/finiteVolume/finiteVolume/fvc/fvcVolumeIntegrate.H](../../../05-finite-volume/files/64/fvcvolumeintegrate.h--6472da24b320.md)
- [src/finiteVolume/fvMatrices/fvMatrix/fvMatrix.H](../../../05-finite-volume/files/72/fvmatrix.h--7269aa48a1c0.md)
- [src/fvModels/general/sixDoFAcceleration/sixDoFAcceleration.H](../../../12-boundaries-sources/files/99/sixdofacceleration.h--99b644452f56.md)
- [src/Lagrangian/cloud/cloud/cloud.C](../../../11-lagrangian/files/48/cloud.c--487a9fa2fabd.md)

## 9. 运行时机制

未检测到运行时选择/类型注册宏。

## 10. 阅读与验证建议

重点关注所有权、对象注册、运行时选择、I/O、容器或矩阵合同。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
