---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-start-case-directory-engineering-setup
title: "算例目录与时间步结构：工程设置与参数选择"
summary: "把 checkMesh 报出的最小单元尺度、入口最大速度与目标库朗数换算成可执行的 deltaT 与 maxCo，给出 controlDict 时间控制条目的取值依据、写出节奏与磁盘容量估算，并附建案命令序列与归档约定。"
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
  - "算例目录与时间步结构"
  - "工程设置与参数选择"
  - "controlDict"
  - "adjustTimeStep"
seo:
  title: "算例目录与时间步结构：工程设置与参数选择"
  description: "把 checkMesh 报出的最小单元尺度、入口最大速度与目标库朗数换算成可执行的 deltaT 与 maxCo，给出 controlDict 时间控制条目的取值依据、写出节奏与磁盘容量估算，并附建案命令序列与归档约定。"
  keywords:
    - "算例目录与时间步结构"
    - "工程设置与参数选择"
    - "adjustTimeStep"
    - "maxCo"
    - "writeInterval"
---

# 算例目录与时间步结构：工程设置与参数选择

时间步不是"先随便填一个再看"，它由网格最小尺度和场内最大速度唯一确定；写间隔则由你想捕捉的最快物理过程决定，而不是由耐心决定。本文给出从 `checkMesh` 输出反推 `deltaT` 的两条独立限制、`controlDict` 中与时间推进相关条目的取值依据、写出次数与磁盘占用的估算方法，以及一条可直接执行的建案命令序列。

## 三类目录各自承担什么

`system/` 放运行与数值控制（`controlDict`、`fvSchemes`、`fvSolution`、`fvModels`、`fvConstraints`），`constant/` 放推进过程中不变的对象（`polyMesh/`、`physicalProperties`、`momentumTransport`、`g`），起始时间目录放场的初值与边界。挪位置不会让求解器自动适配：v11 以后 `blockMeshDict` 位于 `system/`，若按旧教程把它留在 `constant/polyMesh/`，`blockMesh` 会报 `cannot open file`，并打印它实际尝试的路径 `.../system/blockMeshDict`。

时间目录名是数值而非字符串，`0.05` 与 `0.050000` 指向同一时刻但目录名不同。固定 `timePrecision` 并在建案时统一命名，可以避免后处理脚本按字典序取到错误的时间点，也能让 `foamListTimes` 的输出稳定可读。

## 由网格与速度反推 deltaT

对流项要求单元库朗数不超过格式允许的上限，先取一个保守的 $Co_{\max}$ 交给自动调节：

$$
\Delta t_{\max} = \frac{Co_{\max}\,\Delta x_{\min}}{U_{\max}}
$$

$\Delta x_{\min}$ 取 `checkMesh` 报告的最小单元尺度，$U_{\max}$ 取所有入口与运动边界的最大速度。若最小单元 1.5 mm、入口速度 12 m/s、取 $Co_{\max}=0.8$，则 $\Delta t_{\max} = 0.8\times 1.5\times 10^{-3}/12 = 1.0\times 10^{-4}\ \mathrm{s}$。把 `maxCo` 设为 0.8、`maxDeltaT` 设为 1e-4，求解器会在每步结束后按实测最大库朗数调整下一步 $\Delta t$，实际步长通常落在 6e-5 到 1e-4 s 之间。

粘性扩散给出第二条独立限制：

$$
\Delta t_{\nu} = \frac{(\Delta x_{\min})^{2}}{2\nu}
$$

对常温空气 $\nu = 1.5\times 10^{-5}\ \mathrm{m^2/s}$、同样 1.5 mm 网格，$\Delta t_{\nu} = (1.5\times 10^{-3})^{2}/(2\times 1.5\times 10^{-5}) = 0.075\ \mathrm{s}$，比对流限制大三个数量级。这说明时间步由对流主导，加密网格时 $\Delta t$ 按 $\Delta x$ 的一次方缩小而非平方；但若换成 $\nu = 1.0\times 10^{-2}\ \mathrm{m^2/s}$ 的油类介质，$\Delta t_{\nu}$ 降到 $1.1\times 10^{-4}\ \mathrm{s}$，两条限制就同量级，必须同时检查。

## 写出节奏与磁盘容量

写出次数由总时长与写间隔共同决定：

$$
N_{\text{write}} = \left\lfloor \frac{t_{\text{end}}-t_{\text{start}}}{\Delta t_{\text{write}}} \right\rfloor + 1
$$

`writeControl adjustableRunTime` 会在步长被自动调整后仍对齐到 `writeInterval` 的整数倍，适合瞬态算例；`timeStep` 按步数写出；`runTime` 按物理时间写出，但可能因步长变化而错过整点。总时长 0.5 s、`writeInterval 0.05` 时 $N_{\text{write}} = \lfloor 0.5/0.05\rfloor + 1 = 11$ 个时间目录。

单次写出体积约等于单元数乘标量场数乘每值字节数。240 万单元、`p`、`k`、`omega` 三个标量加三分量 `U`，共 6 个标量，双精度 8 字节：

$$
S_{\text{write}} = N_{\text{cells}}\times N_{\text{scalar}}\times 8\ \mathrm{B}
$$

代入得 $2.4\times 10^{6}\times 6\times 8 = 1.152\times 10^{8}\ \mathrm{B}\approx 115\ \mathrm{MB}$，11 次写出约 1.27 GB。设 `purgeWrite 3` 只保留最近 3 组，占用降到约 345 MB；若需全程留档，就在写出后把早期时间目录迁到冷存储，而不是把 `writeInterval` 拉长到失去物理分辨率。

## controlDict 时间控制条目

```cpp
application     foamRun;
solver          incompressibleFluid;
startFrom       startTime;
startTime       0;
stopAt          endTime;
endTime         0.5;
deltaT          1e-4;
writeControl    adjustableRunTime;
writeInterval   0.05;
purgeWrite      3;
writeFormat     binary;
writePrecision  8;
timeFormat      general;
timePrecision   6;
runTimeModifiable true;
adjustTimeStep  yes;
maxCo           0.8;
maxDeltaT       1e-4;
```

`deltaT` 只是初值，`adjustTimeStep yes` 生效后每步被覆盖；`maxDeltaT` 是上限保护，防止库朗数很小时步长被拉得过大而跳过瞬态特征。`runTimeModifiable true` 允许运行中修改 `writeInterval`、`maxCo`，不必重启。

## 建案与归档序列

```bash
cp -r "$FOAM_TUTORIALS/incompressible/simpleFoam/pitzDaily" myCase
cd myCase
mv 0 0.orig && cp -r 0.orig 0
blockMesh  > log.blockMesh 2>&1
checkMesh -allGeometry -allTopology > log.checkMesh 2>&1
foamDictionary -entry maxCo -value system/controlDict
foamRun -solver incompressibleFluid > log.run 2>&1
```

`checkMesh` 日志中的最小单元尺度是上面估算的输入，先记下它再调 `maxCo`。归档时保留 `system/`、`constant/`、`0.orig/`、`log.*` 与后处理字典，并记录 `echo $WM_PROJECT_VERSION` 的结果；换版本后 `physicalProperties` 与 `momentumTransport` 的命名差异会让接手者多花一轮排查。

## 典型故障与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 日志反复出现 `Courant Number mean: 3.1 max: 18.4` | `adjustTimeStep` 为 no 或 `maxCo` 写错层级 | `foamDictionary -entry maxCo -value system/controlDict` 应回显 0.8 |
| 时间目录只有 `0` 和 `0.5` | `writeInterval` 大于实际写出跨度 | 把 `writeInterval` 降到 0.01 重跑 0.05 s，看目录数是否增加 |
| 200 步内写满磁盘 | 未设 `purgeWrite` 且 `writeInterval` 过密 | `du -sh .` 与 $S_{\text{write}}\times N_{\text{write}}$ 估算值对比 |
| 重跑结果与上次不同 | 初场被覆盖，未从 `0.orig` 重建 | `diff -r 0.orig 0` 应无输出 |
| 瞬态被抹平，力曲线像阶跃 | `maxDeltaT` 过大，时间分辨率不足 | 减半 `maxDeltaT` 重跑，目标量峰值应继续上升 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Chapter 4 "Case Structure" and Chapter 5 "Time Control".
2. C. J. Greenshields, *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
3. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
4. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
5. H. Jasak, *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
6. BIPM, *Le Système international d'unités (SI)*, 9th ed., 2019.
