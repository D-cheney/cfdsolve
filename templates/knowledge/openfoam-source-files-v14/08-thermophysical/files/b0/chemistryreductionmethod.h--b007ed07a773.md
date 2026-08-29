---
template_version: "flowlab-knowledge/1.0"
slug: "openfoam-v14-file-b007ed07a773"
title: "OpenFOAM 14 源码解析：chemistryReductionMethod.H"
summary: "该文件声明或实现 `Standard`、`chemistryReductionMethod`，属于“热物性与反应”模块。"
category: { slug: openfoam-v14-08-thermophysical, name: OpenFOAM 源码 · 热物性与反应 }
level: 源码参考
reading_minutes: 4
status: PUBLISHED
published_at: "2026-08-30T00:00:00+08:00"
author_username: codex-generated
source_baseline: "OpenFOAM-14@20260724"
source_path: "src/thermophysicalModels/chemistryModel/Standard/reduction/chemistryReductionMethod/chemistryReductionMethod.H"
tags: [OpenFOAM14, 源码解析, 热物性与反应]
---

# OpenFOAM 14 源码解析：chemistryReductionMethod.H

> 本页由静态分析生成，再按可识别的 OpenFOAM 模式补充中文算法说明。它用于源码导航，不替代编译、调试和算例验证。

## 1. 文件定位

- 源码路径：`src/thermophysicalModels/chemistryModel/Standard/reduction/chemistryReductionMethod/chemistryReductionMethod.H`
- 功能分类：热物性与反应
- 文件类型：C/C++ 或词法/语法源文件
- 规模：270 行
- 文件标识：`b007ed07a773`

## 2. 功能说明

该文件声明或实现 `Standard`、`chemistryReductionMethod`，属于“热物性与反应”模块。

中文导航角色：热力学与物性模型。

上游说明：An abstract class for methods of chemical mechanism reduction References: \verbatim Contino, F., Jeanmart, H., Lucchini, T., & D’Errico, G. (2011). Coupling of in situ adaptive tabulation and dynamic adaptive chemistry: An effective method for solving combustion in engine simulations. Proceedings of the Combustion Institute, 33(2), 3057-3064. Contino, F., Lucchini, T., D'Errico, G., Duynslaegher, C., Dias, V., & Jeanmart, H. (2012). Simulations of advanced combustion modes using detailed chemistry combined with tabulation and mechanism reduction techniques. SAE International Journal of Engines, 5(2012-01-0145), 185-196. Contino, F., Foucher, F., Dagaut, P., Lucchini, T., D’Errico, G., & Mounaïm-Rousselle, C. (2013). Experimental and numerical analysis of nitric oxide effect on the ignition of iso-octane in a single cylinder HCCI engine. Combustion and Flame, 160(8), 1476-1483. Contino, F

## 3. 主要类型

| 名称 | 源码行 |
|---|---:|
| `Standard` | 89 |
| `chemistryReductionMethod` | 96 |

## 4. 主要函数/过程

未通过轻量静态规则识别到明确的函数定义；可能由宏或模板展开生成。

## 5. 算法与控制流程

1. **运行时选择**：通过宏注册构造函数，使字典中的类型名可在运行时映射到具体实现。
2. **工厂构造**：根据类型名查询选择表并返回受控所有权对象，隔离调用者与具体派生类。
3. **所有权与临时量**：使用 OpenFOAM 所有权包装器控制动态对象和表达式临时量生命周期。
4. **场与容器存储**：以连续或动态容器保存网格实体、系数或物理场数据。

## 6. 数学与离散关系

本文件未检测到可可靠映射为统一数学表达式的离散算子。若它是接口文件，方程通常位于同名实现或调用者中。

## 7. 直接依赖

- [`dictionary.H`](../../../04-core-runtime/files/2b/dictionary.h--2b8c9d24050a.md)
- [`DynamicField.H`](../../../04-core-runtime/files/1d/dynamicfield.h--1d654d0be2f2.md)
- [`boolList.H`](../../../04-core-runtime/files/93/boollist.h--93cdb8823ed9.md)
- [`Switch.H`](../../../04-core-runtime/files/d2/switch.h--d2bac00b16e8.md)
- [`cpuTime.H`](../../../17-other-libraries/files/df/cputime.h--df3d0ebfb092.md)
- [`OFstream.H`](../../../04-core-runtime/files/81/ofstream.h--81d7ae24e906.md)
- [`chemistryReductionMethodI.H`](../../../08-thermophysical/files/c2/chemistryreductionmethodi.h--c288347162c6.md)
- [`chemistryReductionMethod.C`](../../../08-thermophysical/files/34/chemistryreductionmethod.c--3460a3538712.md)
- [`chemistryReductionMethodNew.C`](../../../08-thermophysical/files/3f/chemistryreductionmethodnew.c--3f2b9001a52d.md)

## 8. 直接上层引用

- [src/thermophysicalModels/chemistryModel/Standard/reduction/chemistryReductionMethod/chemistryReductionMethod.C](../../../08-thermophysical/files/34/chemistryreductionmethod.c--3460a3538712.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/chemistryReductionMethod/chemistryReductionMethodI.H](../../../08-thermophysical/files/c2/chemistryreductionmethodi.h--c288347162c6.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/chemistryReductionMethod/chemistryReductionMethodNew.C](../../../08-thermophysical/files/3f/chemistryreductionmethodnew.c--3f2b9001a52d.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/chemistryReductionMethod/chemistryReductionMethods.C](../../../08-thermophysical/files/7c/chemistryreductionmethods.c--7c77bc53d46f.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/DAC/DAC.H](../../../08-thermophysical/files/2e/dac.h--2e6de74c70b9.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/DAC/DACChemistryReductionMethods.C](../../../08-thermophysical/files/0a/dacchemistryreductionmethods.c--0a128d6af07b.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/DRG/DRG.H](../../../08-thermophysical/files/ec/drg.h--ecc9d088c16a.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/DRG/DRGChemistryReductionMethods.C](../../../08-thermophysical/files/2a/drgchemistryreductionmethods.c--2a7e88de4480.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/DRGEP/DRGEP.H](../../../08-thermophysical/files/cc/drgep.h--cc82f1d0ab82.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/DRGEP/DRGEPChemistryReductionMethods.C](../../../08-thermophysical/files/88/drgepchemistryreductionmethods.c--88859148e5f0.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/EFA/EFA.H](../../../08-thermophysical/files/96/efa.h--96902d594e78.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/EFA/EFAChemistryReductionMethods.C](../../../08-thermophysical/files/8e/efachemistryreductionmethods.c--8e8c57c29e87.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/noChemistryReduction/noChemistryReduction.H](../../../08-thermophysical/files/3a/nochemistryreduction.h--3a6659d74b87.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/noChemistryReduction/noChemistryReductionMethods.C](../../../08-thermophysical/files/79/nochemistryreductionmethods.c--79f9d14c349e.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/PFA/PFA.H](../../../08-thermophysical/files/08/pfa.h--08df0eeab6cd.md)
- [src/thermophysicalModels/chemistryModel/Standard/reduction/PFA/PFAChemistryReductionMethods.C](../../../08-thermophysical/files/23/pfachemistryreductionmethods.c--234baf9cc19e.md)
- [src/thermophysicalModels/chemistryModel/Standard/Standard_chemistryModel.H](../../../08-thermophysical/files/e1/standard_chemistrymodel.h--e136689c995e.md)

## 9. 运行时机制

`TypeName`、`declareRunTimeSelectionTable`

## 10. 阅读与验证建议

追踪状态方程、能量变量、混合物、输运性质和运行时模板组合。

建议结合调用者、同名头/实现文件、`Make/files`、`Make/options` 和对应教程阅读；涉及数值结果时，必须检查量纲、守恒、残差和网格/时间步敏感性。
