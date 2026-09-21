---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-start-solver-selection-engineering-setup
title: "求解器与 foamRun 模块选型：工程设置与参数选择"
summary: "按马赫数与雷诺数把问题分流到 incompressibleFluid、compressibleFluid、shockFluid、incompressibleVoF 等模块，给出 foamRun -solver 的调用方式、各模块所需的 constant 字典，以及旧求解器名到新模块的映射表。"
category:
  slug: openfoam-getting-started
  name: "OpenFOAM 入门与案例组织"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 入门与案例组织"
  - "求解器与 foamRun 模块选型"
  - "工程设置与参数选择"
  - "foamRun"
  - "马赫数"
seo:
  title: "求解器与 foamRun 模块选型：工程设置与参数选择"
  description: "按马赫数与雷诺数把问题分流到 incompressibleFluid、compressibleFluid、shockFluid、incompressibleVoF 等模块，给出 foamRun -solver 的调用方式、各模块所需的 constant 字典，以及旧求解器名到新模块的映射表。"
  keywords:
    - "求解器与 foamRun 模块选型"
    - "工程设置与参数选择"
    - "foamRun"
    - "compressibleFluid"
    - "incompressibleVoF"
---

# 求解器与 foamRun 模块选型：工程设置与参数选择

从 v10 起 OpenFOAM 把求解器拆成"一个可执行文件 `foamRun` + 若干物理模块"，模块名由 `-solver` 指定。选型不再靠背求解器清单，而是回答三个问题：流体是否可压、是否存在相界面或固体区域、时间推进是稳态还是瞬态。本文给出这三问的定量判据、模块与字典的对应关系，以及旧求解器名的迁移映射。

## 用马赫数决定是否求解能量方程

可压缩性是否需要建模，由马赫数决定：

$$
Ma = \frac{U}{a}, \qquad a = \sqrt{\gamma R T}
$$

常温空气取 $\gamma = 1.4$、$R = 287\ \mathrm{J/(kg\cdot K)}$、$T = 300\ \mathrm{K}$，声速 $a = \sqrt{1.4\times 287\times 300} = \sqrt{1.2054\times 10^{5}} = 347.2\ \mathrm{m/s}$。来流 $U = 30\ \mathrm{m/s}$ 时 $Ma = 30/347.2 = 0.086$。经验判据是 $Ma < 0.3$ 时密度变化小于约 5%，用不可压模块即可；$Ma$ 在 0.3 到 0.8 之间需要可压模块；超过 0.8 或存在激波时必须用密度基格式。

雷诺数决定湍流处理，但不改变模块选择：

$$
Re = \frac{\rho U L}{\mu}
$$

取 $20\ ^\circ\mathrm{C}$ 水 $\rho = 998.2\ \mathrm{kg/m^3}$、$\mu = 1.0022\times 10^{-3}\ \mathrm{Pa\cdot s}$、$U = 1.5\ \mathrm{m/s}$、$L = 0.05\ \mathrm{m}$，得 $Re = 7.47\times 10^{4}$。这个数只用来决定 `momentumTransport` 里选层流还是 RAS 模型，模块仍是 `incompressibleFluid`。

## 模块名与调用方式

```bash
foamRun -solver incompressibleFluid          # 不可压，稳态或瞬态由 ddtSchemes 决定
foamRun -solver compressibleFluid            # 可压，含能量方程
foamRun -solver isothermalFluid              # 可压但不解能量方程，T 由物性给定
foamRun -solver shockFluid                   # 密度基，可捕捉激波
foamRun -solver incompressibleVoF            # 两相不可压 VOF
foamRun -solver multiphaseEuler              # 多相欧拉
foamRun -solver solidDisplacement            # 固体位移
foamRun -solver incompressibleFluid -help    # 查看该模块的可用选项
```

`foamRun` 自身只负责构建模块并推进时间，物理内容全部在模块里。因此 `-solver` 的名字写错时不会"回退到某个默认模块"，而是在构建阶段抛出未知求解器的致命错误并终止。

不可压与可压共用同一模块名下的两套行为：`incompressibleFluid` 既跑稳态也跑瞬态，切换方式是 `system/fvSchemes` 里的 `ddtSchemes { default steadyState; }` 与 `steadyState` 求解控制；瞬态则写 `Euler` 或 `backward`。这意味着同一个算例目录可以在两种模式间切换，只需改 ddt 方案与 `fvSolution` 中的松弛设置。

## 模块需要的 constant 字典

| 模块 | 必需字典 | 关键条目 |
|---|---|---|
| incompressibleFluid | physicalProperties, momentumTransport | nu, simulationType |
| compressibleFluid | thermophysicalProperties, momentumTransport | thermoType, mixture, equationOfState |
| isothermalFluid | physicalProperties, momentumTransport | pRef, rho 模型 |
| shockFluid | thermophysicalProperties, momentumTransport | energy 变量选择 |
| incompressibleVoF | physicalProperties, momentumTransport | 两相 nu、rho、sigma |
| solidDisplacement | physicalProperties | mechanicalProperties |

不可压用 `physicalProperties`，可压用 `thermophysicalProperties`，这个区别是最常见的启动失败来源。`constant/g` 在所有涉及重力的模块中都要提供，2D 竖直流道写 `(0 -9.81 0)`，若写反方向，浮力项会把流动推向相反侧。

## 从旧求解器名迁移

| 旧求解器 | v14 模块 | 备注 |
|---|---|---|
| simpleFoam, pimpleFoam | incompressibleFluid | 由 ddtSchemes 区分稳态与瞬态 |
| buoyantSimpleFoam, buoyantPimpleFoam | fluid | 需 buoyancy 模型与 g |
| rhoPimpleFoam | fluid | 含能量方程 |
| rhoCentralFoam | shockFluid | 密度基，适合激波 |
| interFoam | incompressibleVoF | 两相不可压 |
| reactingFoam | combustion | 需反应机理 |
| chtMultiRegionFoam | foamMultiRun | 多区域耦合，模块按区域分别指定 |

多区域算例不再由单一求解器承担，而是用 `foamMultiRun` 驱动多个模块，每个区域有自己的 `system/<region>/` 目录与模块名。迁移时最容易漏掉的是区域目录层级——把所有字典平铺在算例根下会导致区域初始化失败。

## 选型决策与常见错误

```bash
# 先确认问题类型
foamDictionary -entry simulationType -value constant/momentumTransport
foamDictionary -entry ddtSchemes/default -value system/fvSchemes
grep -n "thermoType" constant/thermophysicalProperties

# 试运行，只构建不推进，确认模块与字典匹配
foamRun -solver incompressibleFluid -dry-run
```

`-dry-run` 用于在正式计算前确认模块能被正确构建、所有必需字典都能读到，代价远低于跑完整算例。对于长周期瞬态，建议先做一次 0.02 s 的短跑，确认时间步与残差行为正常。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 启动即报未知求解器 | `-solver` 名称拼写错误 | 用 `foamRun -solver <name> -help` 逐个验证名称 |
| 报 `physicalProperties` 未定义 | 可压算例误用不可压字典名 | `ls constant/` 确认应存在 thermophysicalProperties |
| 稳态算例残差持续震荡不下降 | 误用瞬态 ddt 方案 | `foamDictionary -entry ddtSchemes/default` 应为 steadyState |
| 温度场完全不变 | 用了 isothermalFluid 或能量方程被关闭 | 检查 `thermophysicalProperties` 的 energy 条目 |
| 自由液面消失或两相混成一体 | 用了单相模块跑 VOF 算例 | 确认模块为 incompressibleVoF 且存在 alpha 场 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Chapter "Solvers and Modules".
2. C. J. Greenshields, *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
3. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
4. J. D. Anderson, *Modern Compressible Flow: With Historical Perspective*, 3rd ed., McGraw-Hill, 2003.
5. R. I. Issa, "Solution of the implicitly discretised fluid flow equations by operator-splitting", *Journal of Computational Physics*, 62(1):40–65, 1986.
6. Weller, H. G., Tabor, G., Jasak, H., Fureby, C., "A tensorial approach to computational continuum mechanics using object-oriented techniques", *Computers in Physics*, 12(6):620–631, 1998.
