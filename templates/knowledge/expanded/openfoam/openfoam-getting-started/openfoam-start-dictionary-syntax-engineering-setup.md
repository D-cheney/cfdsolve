---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-start-dictionary-syntax-engineering-setup
title: "字典语法与 include 机制：工程设置与参数选择"
summary: "讲清 FoamFile 头、dimensioned 条目、变量展开与 include 家族的四个指令，给出路径解析顺序、inputMode 覆盖优先级与跨算例共享字典的目录组织方式，并用重复行数估算收益。"
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
  - "字典语法与 include 机制"
  - "工程设置与参数选择"
  - "includeFunc"
  - "inputMode"
seo:
  title: "字典语法与 include 机制：工程设置与参数选择"
  description: "讲清 FoamFile 头、dimensioned 条目、变量展开与 include 家族的四个指令，给出路径解析顺序、inputMode 覆盖优先级与跨算例共享字典的目录组织方式，并用重复行数估算收益。"
  keywords:
    - "字典语法与 include 机制"
    - "工程设置与参数选择"
    - "include"
    - "includeFunc"
    - "inputMode"
---

# 字典语法与 include 机制：工程设置与参数选择

OpenFOAM 的字典是纯文本、声明式的键值容器，`#include` 家族让你把一份配置同时喂给几十个算例，代价是"我改的那一行到底生效没有"变得难以肉眼确认。本文给出 FoamFile 头的必需字段、include 的四个指令与路径解析顺序、`#inputMode` 决定的覆盖优先级，以及一套按共享层级组织 `system/` 的目录方案。

## 字典由哪些语法单元构成

一个字典文件由可选的 `FoamFile` 头、若干键值对、以及若干以 `#` 开头的指令组成。`FoamFile` 头的四个字段各有职责：`version` 声明格式版本，`format` 取 `ascii` 或 `binary`，`class` 决定解析器构造哪种容器类型，`object` 是该对象在对象注册表（objectRegistry）中的名字。`class` 与 `object` 会被校验，把 `volScalarField` 写成 `volVectorField`，或在 `U` 文件中声明 `object p`，都会在启动时被拒绝。

键值对的常见形态有四种：标量 `deltaT 1e-4;`、带量纲的 `nu 1.5e-5;` 与 `dimensions [0 2 -1 0 0 0 0];` 分离写法、列表 `nonuniform List<scalar>`、以及嵌套子字典。嵌套字典的键名不能重复，重复时后者覆盖前者并可能触发警告。

## include 家族的四个指令

```cpp
FoamFile
{
    version     2.0;
    format      ascii;
    class       dictionary;
    object      fvSolution;
}

#include            "solverSettings"          // 相对 case 路径
#includeIfPresent     "turbulenceOverrides"    // 缺失时静默跳过
#includeEtc          "caseDicts/setConstraintTypes"
#includeFunc        residuals                 // 从 etc/caseDicts 取函数对象

solvers
{
    p
    {
        solver          GAMG;
        tolerance       1e-7;
        relTol          0.01;
    }
}
```

四个指令的差别在于"文件不存在时怎么办"和"从哪里找"。`#include` 找不到文件立即报错并打印尝试过的路径；`#includeIfPresent` 静默跳过，适合放可选的团队覆盖文件；`#includeEtc` 专门搜索 `$WM_PROJECT_DIR/etc/`；`#includeFunc` 搜索 `$FOAM_CASE/system/` 与 `$WM_PROJECT_DIR/etc/caseDicts/`，后处理函数对象通常用它引入。

路径解析按固定顺序进行：

$$
p_{\text{resolve}} =
\begin{cases}
p & \text{若 } p \text{ 以 / 开头} \\
\$FOAM\_CASE/p & \text{若相对路径在算例根下存在} \\
\$FOAM\_CASE/system/p & \text{若相对路径在 system 下存在} \\
\$WM\_PROJECT\_DIR/etc/p & \text{否则回落到安装目录}
\end{cases}
$$

路径中可以直接使用环境变量，`"$FOAM_CASE/system/fvSolution.base"` 与 `"$WM_PROJECT_DIR/etc/caseDicts/postProcessing/forces"` 都能被展开。写相对路径比写绝对路径更利于算例搬迁，但前提是算例根目录固定——始终从算例根启动求解器。

## inputMode 决定谁覆盖谁

同名键出现两次时，结果由 `#inputMode` 决定：

$$
v_{\text{eff}} = v_{i^{*}}, \quad i^{*} = \max\{\, i : k_i = k \,\}
$$

在默认的 `merge` 模式下 $v_{\text{eff}}$ 就是最后一次出现的值，因此"先写通用值、再用 include 覆盖"是可行的写法。`overwrite` 与 `merge` 在多数场景下行为接近，区别在列表与子字典的处理；`protect` 禁止后续覆盖，用于锁住关键条目；`error` 则在检测到重复键时直接报错，适合评审严格的交付算例。把 `#inputMode error` 放在共享字典里，能在配置被误改的第一时间暴露问题，而不是等到结果异常才回头翻文件。

## 按共享层级组织 system 目录

跨算例复用的配置适合分成三层：全项目通用的数值与求解设置放在一个共享仓库，按物理类型（不可压湍流、可压、多相）各自一份；单个算例只保留真正个性化的条目，例如几何相关的 patch 名与边界值。收益可以用重复行数直接衡量：

$$
R = 1 - \frac{n_{\text{case}} + L_{\text{shared}}}{n_{\text{case}}\,L_{\text{shared}}}
$$

以 20 个算例、共享字典 120 行、每算例原需复制一份计，$R = 1 - (20+120)/(20\times 120) = 1 - 140/2400 = 0.942$，即重复内容减少约 94.2%。剩下 20 行是每个算例自己的入口速度、patch 名与时间控制，这部分不该共享，因为一旦共享就失去了对照能力。

配合 `#includeFunc` 还能把后处理定义也集中起来：在 `controlDict` 里写 `#includeFunc mag(U)`、`#includeFunc CourantNo`、`#includeFunc residuals`，函数对象定义由安装目录提供，算例里不再出现几十行的 `functions` 子字典。

## 配置片段与核对命令

```bash
foamDictionary -entry solvers/p/solver -value system/fvSolution
foamDictionary -entry adjustTimeStep -value system/controlDict
foamDictionary -expand system/fvSolution > expanded.fvSolution
grep -rn "#include" system/ constant/ 0/
```

`-expand` 会输出展开 include 与变量之后的完整字典，把它与源文件对照，就能看出哪些条目来自共享层。第三条命令用于快速盘点算例实际引用了哪些外部文件，避免共享仓库被移动后无人察觉。

## 常见错误与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| `cannot open file` 后打印 `.../system/fvSolution.base` | `#include` 相对路径基准不在预期目录 | 从算例根运行，并用 `-expand` 查看实际解析路径 |
| 改了共享字典但结果不变 | `#include` 位置在覆盖段之后，或 `#inputMode protect` 生效 | 用 `foamDictionary -entry <key> -value` 回显生效值 |
| `keyword ... is undefined in dictionary` | 键名拼写错误或该键在被 include 的文件里 | `grep -rn "<key>" system/` 定位定义位置 |
| 出现 `Unknown directive '#includeIf'` | 指令名不存在，正确名为 `#includeIfPresent` | 修正后重跑，启动阶段不应再报指令错误 |
| 两个算例结果莫名相同 | 个性化条目被写进了共享字典 | 对比两算例的 `expanded.*` 展开文件差异 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Section 4.1 "Dictionaries" and "Include directives".
2. OpenFOAM Foundation, *OpenFOAM Programmer's Guide*, v14, Chapter on "Dictionaries and I/O".
3. C. J. Greenshields, *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
4. Weller, H. G., Tabor, G., Jasak, H., Fureby, C., "A tensorial approach to computational continuum mechanics using object-oriented techniques", *Computers in Physics*, 12(6):620–631, 1998.
5. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
6. IEEE, *POSIX.1-2017 Standard for Information Technology — Portable Operating System Interface*, IEEE Std 1003.1-2017, 2017.
