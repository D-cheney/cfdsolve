---
template_version: flowlab-knowledge/1.0
slug: openfoam-start-case-directory-engineering-setup
title: 算例目录与时间步结构：工程设置与诊断验证
summary: >-
  把 checkMesh 报出的最小单元尺度、入口最大速度与目标库朗数换算成可执行的 deltaT 与 maxCo，给出 controlDict
  时间控制条目的取值依据、写出节奏与磁盘容量估算，并附建案命令序列与归档约定。
  全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: openfoam-getting-started
  name: OpenFOAM 入门与案例组织
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - OpenFOAM
  - OpenFOAM 入门与案例组织
  - 算例目录与时间步结构
  - 工程设置与参数选择
  - controlDict
  - adjustTimeStep
  - 结果诊断与可信度验证
  - CourantNo
  - 重启一致性
seo:
  title: 算例目录与时间步结构：工程设置与诊断验证
  description: >-
    把 checkMesh 报出的最小单元尺度、入口最大速度与目标库朗数换算成可执行的 deltaT 与 maxCo，给出 controlDict
    时间控制条目的取值依据、写出节奏与磁盘容量估算，并附建案命令序列与归档约定。
    全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 算例目录与时间步结构
    - 工程设置与参数选择
    - adjustTimeStep
    - maxCo
    - writeInterval
    - 结果诊断与可信度验证
    - 库朗数分布
    - 采样定理
    - 重启一致性
---
# 算例目录与时间步结构：工程设置与诊断验证

## 工程设置与参数选择

时间步不是"先随便填一个再看"，它由网格最小尺度和场内最大速度唯一确定；写间隔则由你想捕捉的最快物理过程决定，而不是由耐心决定。本文给出从 `checkMesh` 输出反推 `deltaT` 的两条独立限制、`controlDict` 中与时间推进相关条目的取值依据、写出次数与磁盘占用的估算方法，以及一条可直接执行的建案命令序列。

### 三类目录各自承担什么

`system/` 放运行与数值控制（`controlDict`、`fvSchemes`、`fvSolution`、`fvModels`、`fvConstraints`），`constant/` 放推进过程中不变的对象（`polyMesh/`、`physicalProperties`、`momentumTransport`、`g`），起始时间目录放场的初值与边界。挪位置不会让求解器自动适配：v11 以后 `blockMeshDict` 位于 `system/`，若按旧教程把它留在 `constant/polyMesh/`，`blockMesh` 会报 `cannot open file`，并打印它实际尝试的路径 `.../system/blockMeshDict`。

时间目录名是数值而非字符串，`0.05` 与 `0.050000` 指向同一时刻但目录名不同。固定 `timePrecision` 并在建案时统一命名，可以避免后处理脚本按字典序取到错误的时间点，也能让 `foamListTimes` 的输出稳定可读。

### 由网格与速度反推 deltaT

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

### 写出节奏与磁盘容量

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

### controlDict 时间控制条目

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

### 建案与归档序列

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

### 典型故障与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 日志反复出现 `Courant Number mean: 3.1 max: 18.4` | `adjustTimeStep` 为 no 或 `maxCo` 写错层级 | `foamDictionary -entry maxCo -value system/controlDict` 应回显 0.8 |
| 时间目录只有 `0` 和 `0.5` | `writeInterval` 大于实际写出跨度 | 把 `writeInterval` 降到 0.01 重跑 0.05 s，看目录数是否增加 |
| 200 步内写满磁盘 | 未设 `purgeWrite` 且 `writeInterval` 过密 | `du -sh .` 与 $S_{\text{write}}\times N_{\text{write}}$ 估算值对比 |
| 重跑结果与上次不同 | 初场被覆盖，未从 `0.orig` 重建 | `diff -r 0.orig 0` 应无输出 |
| 瞬态被抹平，力曲线像阶跃 | `maxDeltaT` 过大，时间分辨率不足 | 减半 `maxDeltaT` 重跑，目标量峰值应继续上升 |

### 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Chapter 4 "Case Structure" and Chapter 5 "Time Control".
2. C. J. Greenshields, *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
3. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
4. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
5. H. Jasak, *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
6. BIPM, *Le Système international d'unités (SI)*, 9th ed., 2019.

## 诊断与可信度验证

时间步与写出设置留下的痕迹有两类：日志里逐行的库朗数与连续性误差，磁盘上一个个时间目录。前者反映求解器内部实际走过了什么，后者反映你事后能看到什么，两者不一致时"算过"和"看得到"之间就出现了断层。本文用库朗数分布、采样率和重启一致性三项可量化的证据，判断一次瞬态计算的时间离散是否可信。

### 时间目录的完整性先于任何后处理

先确认目录集合本身没有缺口。`foamListTimes -withZero` 按数值顺序列出时间目录，`foamListTimes -rm` 只删时间目录不动其他文件，比手工 `rm -rf` 安全。若某个中间时刻缺失，最可能的原因是重启：用 `startFrom latestTime` 从 0.30 s 续算时，`writeControl adjustableRunTime` 会把写出相位对齐到新的起点，于是 0.30 s 与 0.35 s 之间可能出现一个长度异常的间隔。判定试验是查看相邻时间目录的差值序列，正常应为等间隔的 0.05 s，出现 0.08 s 之类的跳变即为此类相位错位。

`checkMesh -allGeometry -allTopology` 的报告要和 `constant/polyMesh/` 的时间戳一起看。若网格在上次运行后被重建而 `0/` 未同步，日志会在启动阶段抛出 patch 数量或名字不匹配的错误，而不是在几百步之后才暴露。

### 库朗数要看分布而不是最大值

`maxCo` 是控制目标，不是实测结果。用函数对象导出逐单元的库朗数场：

```bash
postProcess -func CourantNo -time 0.4
postProcess -func 'fieldMinMax(U)' -time 0.4
```

`CourantNo` 写出 `postProcessing/CourantNo/<time>/CourantNo.dat`，包含时间、平均库朗数与最大库朗数三列。判据是：稳态段的最大库朗数应稳定在 `maxCo` 之下且不随时间漂移；若最大库朗数在某个时刻后单调爬升，通常是局部速度被放大或网格出现畸形单元，而不是时间步设置的问题。局部分布同样重要——平均值 0.15 而最大值 0.87 说明大部分区域时间分辨率充裕，个别单元在拖后腿；此时应定位那些单元而不是全局减小 `maxDeltaT`。

### 采样率决定了你能看到的最快过程

后处理只能看到时间目录，因此写出频率构成一次采样：

$$
f_s = \frac{1}{\Delta t_{\text{write}}} \ge 2 f_{\max}
$$

圆柱绕流的脱落频率由斯特劳哈尔数给出，$St\approx 0.2$ 时

$$
f_{\text{shed}} = \frac{St\,U}{D}
$$

直径 $D = 0.02\ \mathrm{m}$、来流 $U = 10\ \mathrm{m/s}$ 代入得 $f_{\text{shed}} = 0.2\times 10/0.02 = 100\ \mathrm{Hz}$。按采样定理需要 $f_s \ge 200\ \mathrm{Hz}$，即 $\Delta t_{\text{write}} \le 5\times 10^{-3}\ \mathrm{s}$。若沿用 `writeInterval 0.01`（$f_s = 100\ \mathrm{Hz}$），升力谱会在 50 Hz 处出现一个虚假峰并把真实的 100 Hz 分量折叠过去，此时无论怎样加长统计窗口都得不到正确频率。判定试验：把 `writeInterval` 减半重跑同样的物理时长，若谱峰位置随之移动，说明先前的结果是混叠伪影。

### 重启一致性是一项独立证据

从某一时刻续算，物理上不应产生跳变。取续算前最后一个时间目录 $t_r^-$ 与续算后第一个时间目录 $t_r^+$，定义相对范数差

$$
\varepsilon_{r} = \frac{\lVert \phi(t_r^{+})-\phi(t_r^{-}) \rVert_2}{\lVert \phi(t_r^{-}) \rVert_2}
$$

$\phi$ 取 `U` 或 `p`。对 0.30 s 重启、0.35 s 首次写出的算例，若 $\varepsilon_r$ 在 $10^{-4}$ 量级，属于浮点与线性求解容差范围内的正常差异；若达到 $10^{-1}$，说明续算时读入了不同的物性、边界或松弛设置——常见原因是 `constant/` 中的字典在两次运行之间被修改。用 `md5sum constant/*.dict` 在两次运行前各记一次，可以直接排除这种可能。

### 时间步与网格的联合加密

单独加密网格或单独减小时间步都可能得出"已收敛"的错误结论，因为显式格式的总误差由两者共同决定。可操作的顺序是：先把 `maxCo` 从 0.8 降到 0.4 重跑，若目标量（如阻力系数）变化小于 1%，说明时间离散已足够；再对网格做一次系统加密，看变化是否同样小于 1%。两者都通过，才能把结果归因于物理而非离散。

### 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 升力谱主峰随 `writeInterval` 改变而移动 | 写出频率低于奈奎斯特要求，发生混叠 | 将 `writeInterval` 减半，谱峰应稳定在 $f_{\text{shed}}$ |
| 相邻时间目录间隔忽大忽小 | 重启后 `adjustableRunTime` 相位重置 | 比较 `foamListTimes` 输出相邻差值，正常应恒定 |
| 最大库朗数随时间单调上升 | 局部速度增大或单元畸变，非时间步设置问题 | `postProcess -func 'fieldMinMax(U)'` 定位最大值出现时刻 |
| 续算后目标量跳变超过 1% | 续算读入的字典与首段不一致 | 两次运行前对 `constant/` 做 `md5sum` 比对 |
| `checkMesh` 报负体积单元但计算仍推进 | 时间步与畸变单元共同作用 | 重建网格后重跑相同 `maxCo`，负体积应消失 |

### 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Section "Post-processing" and "Numerical Schemes".
2. C. J. Greenshields, *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
3. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
4. C. H. K. Williamson, "Vortex dynamics in the cylinder wake", *Annual Review of Fluid Mechanics*, 28:477–539, 1996.
5. H. Jasak, *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
6. R. D. Richtmyer, K. W. Morton, *Difference Methods for Initial-Value Problems*, 2nd ed., Interscience, 1967.
