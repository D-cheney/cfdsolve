---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-d97ab300040a"
title: "OpenFOAM 14 源码解析：GeometricField.H"
summary: "该文件实现 `GeometricField` 相关对象的读取、写出或流序列化。"
category: { slug: openfoam-v14-05-finite-volume, name: OpenFOAM 源码 · 有限体积离散 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/finiteVolume/fields/GeometricFields/GeometricField/GeometricField.H"
tags: [OpenFOAM14, 源码解析, 有限体积离散]
---

# OpenFOAM 14 源码解析：GeometricField.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/finiteVolume/fields/GeometricFields/GeometricField/GeometricField.H`
- 功能分类：有限体积离散
- 文件类型：C/C++ 或词法/语法源文件
- 规模：840 行
- 文件标识：`d97ab300040a`

## 2. 功能说明

该文件实现 `GeometricField` 相关对象的读取、写出或流序列化。

中文导航角色：有限体积离散核心。

上游说明：Generic GeometricField class.

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `dictionary` | 55 |
| `PrimitiveField` | 59 |
| `GeometricField` | 78 |
| `PrimitiveField2` | 167 |
| `OldTimeFieldCopy` | 804 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
2. **边界回写**：内部场更新后重新执行各 patch 的边界条件计算。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **哈希索引**：以关键字或标签建立快速查找表，用于注册、去重或稀疏关系查询。
5. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

- 离散线性系统：$A_P\phi_P+\sum_N A_N\phi_N=b_P$。
- VOF 守恒：$\partial_t\alpha+\nabla\cdot(\alpha\mathbf{U})+\nabla\cdot[\alpha(1-\alpha)\mathbf{U}_c]=S_\alpha$。

## 7. 直接依赖

- [`GeometricFieldFwd.H`](../../../05-finite-volume/files/fa/geometricfieldfwd.h--fa80c4c7587c.md)
- [`GeometricBoundaryField.H`](../../../05-finite-volume/files/06/geometricboundaryfield.h--06eccfe142f5.md)
- [`GeometricFieldSources.H`](../../../05-finite-volume/files/d7/geometricfieldsources.h--d792cff5f790.md)
- [`GeometricFieldI.H`](../../../05-finite-volume/files/15/geometricfieldi.h--154e66a1bfb6.md)
- [`GeometricField.C`](../../../05-finite-volume/files/bc/geometricfield.c--bcc89db2c000.md)
- [`GeometricFieldFunctions.H`](../../../05-finite-volume/files/ed/geometricfieldfunctions.h--ed4fe48b5883.md)

## 8. 直接上层引用

- [applications/utilities/preProcessing/mapFields/MapConsistentVolFields.H](../../../03-utilities/files/16/mapconsistentvolfields.h--16f54fb67908.md)
- [applications/utilities/preProcessing/mapFields/MapLagrangianFields.H](../../../03-utilities/files/93/maplagrangianfields.h--93d2d5120eab.md)
- [applications/utilities/preProcessing/mapFields/MapVolFields.H](../../../03-utilities/files/4e/mapvolfields.h--4e0f6786c959.md)
- [src/finiteVolume/fields/DimensionedFields/DimensionedFieldFunctions/FieldFunction/FieldFunction_DimensionedFieldFunction.C](../../../05-finite-volume/files/7c/fieldfunction_dimensionedfieldfunction.c--7c3112eee09b.md)
- [src/finiteVolume/fields/fvsPatchFields/constraint/cyclic/cyclicFvsPatchField.C](../../../05-finite-volume/files/bd/cyclicfvspatchfield.c--bd6b1646b34c.md)
- [src/finiteVolume/fields/GeometricFields/GeometricField/GeometricField.C](../../../05-finite-volume/files/bc/geometricfield.c--bcc89db2c000.md)
- [src/finiteVolume/fields/GeometricFields/GeometricField/GeometricFieldI.H](../../../05-finite-volume/files/15/geometricfieldi.h--154e66a1bfb6.md)
- [src/finiteVolume/fields/GeometricFields/GeometricField/GeometricFieldReuseFunctions.H](../../../05-finite-volume/files/59/geometricfieldreusefunctions.h--592cb539018f.md)
- [src/finiteVolume/fields/GeometricFields/GeometricField/uniformInterpolate.H](../../../05-finite-volume/files/14/uniforminterpolate.h--14283d4dbae6.md)
- [src/finiteVolume/fields/GeometricFields/GeometricFieldFunctions/FunctionalGeometricField/FunctionalGeometricField.H](../../../05-finite-volume/files/6f/functionalgeometricfield.h--6f504e68317c.md)
- [src/finiteVolume/fields/GeometricFields/GeometricScalarField/GeometricScalarField.H](../../../05-finite-volume/files/8d/geometricscalarfield.h--8d515ea66f00.md)
- [src/finiteVolume/fields/GeometricFields/GeometricSphericalTensorField/GeometricSphericalTensorField.H](../../../05-finite-volume/files/11/geometricsphericaltensorfield.h--1185e0d47465.md)
- [src/finiteVolume/fields/GeometricFields/GeometricSymmTensorField/GeometricSymmTensorField.H](../../../05-finite-volume/files/78/geometricsymmtensorfield.h--78a4b9197aa5.md)
- [src/finiteVolume/fields/GeometricFields/GeometricVectorField/GeometricVectorField.H](../../../05-finite-volume/files/e1/geometricvectorfield.h--e1655e72ea49.md)
- [src/finiteVolume/fields/GeometricFields/SlicedGeometricField/SlicedGeometricField.H](../../../05-finite-volume/files/47/slicedgeometricfield.h--473e957ebe85.md)
- [src/finiteVolume/fields/GeometricFields/transformGeometricField/transformGeometricField.H](../../../05-finite-volume/files/b2/transformgeometricfield.h--b2edd0bd7599.md)
- [src/finiteVolume/fields/GeometricFields/volFields/volFields.H](../../../05-finite-volume/files/c8/volfields.h--c806db8d5ce2.md)
- [src/finiteVolume/finiteVolume/gradSchemes/fourthGrad/fourthGrad.C](../../../05-finite-volume/files/8d/fourthgrad.c--8d21f9ce4d2f.md)
- [src/finiteVolume/finiteVolume/gradSchemes/leastSquaresGrad/leastSquaresGrad.C](../../../05-finite-volume/files/f5/leastsquaresgrad.c--f569717e54c1.md)
- [src/finiteVolume/interpolation/interpolatePointToCell/interpolatePointToCell.H](../../../05-finite-volume/files/7d/interpolatepointtocell.h--7dfa23b58dad.md)
- [src/functionObjects/field/fieldValues/fieldValueDelta/fieldValueDeltaTemplates.C](../../../14-postprocessing/files/fd/fieldvaluedeltatemplates.c--fde1b5a045e6.md)
- [src/Lagrangian/Lagrangian/LagrangianEqn/LagrangianEqn.C](../../../11-lagrangian/files/d0/lagrangianeqn.c--d064fff4cc56.md)
- [src/thermophysicalModels/multicomponentThermo/include/DimensionedFieldListSlicer.H](../../../08-thermophysical/files/c2/dimensionedfieldlistslicer.h--c2ae82ec27a9.md)
- [src/thermophysicalModels/multicomponentThermo/include/GeometricFieldListSlicer.H](../../../08-thermophysical/files/e7/geometricfieldlistslicer.h--e71dc6d11684.md)

## 9. 运行时机制

`TypeName`

## 10. 阅读与验证建议

把 fvc 显式算子、fvm 隐式装配、fvMatrix 和边界系数对应到离散公式。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
