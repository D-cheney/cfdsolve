---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-run-function-objects-engineering-setup
title: "functionObjects 在线统计：工程设置与参数选择"
summary: "给出 fieldAverage、forces、probes、residuals 等 functionObject 的选型依据，用时间加权平均与积分时间尺度确定统计时长，并完成一次力系数归一化的手算和完整配置片段。"
category:
  slug: openfoam-running-automation
  name: "OpenFOAM 运行与自动化"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 运行与自动化"
  - "functionObjects 在线统计"
  - "工程设置与参数选择"
  - "fieldAverage"
  - "forceCoeffs"
seo:
  title: "functionObjects 在线统计：工程设置与参数选择"
  description: "给出 fieldAverage、forces、probes、residuals 等 functionObject 的选型依据，用时间加权平均与积分时间尺度确定统计时长，并完成一次力系数归一化的手算和完整配置片段。"
  keywords:
    - "functionObjects 在线统计"
    - "工程设置与参数选择"
    - "fieldAverage"
    - "forceCoeffs"
    - "时间加权平均"
---
# functionObjects 在线统计：工程设置与参数选择

在线统计的价值在于不必保存全部时间步的场：`fieldAverage` 边算边累加，跑完就得到平均值与脉动均方值，磁盘占用只有若干标量文件。代价是统计窗口一旦设错，重算代价与整个算例相当。选型、时长、归一化这三件事必须在启动前定下来。

## 该用哪一类 functionObject

按输出形态分四类。场统计用 `fieldAverage`，产出 `UMean`、`UPrime2Mean` 这类时间平均场，用于后处理流场与雷诺应力。积分量用 `forces`、`forceCoeffs`、`surfaceFieldValue`、`volFieldValue`，产出标量时间序列。点值用 `probes`，在指定坐标处采样。求解器内部量用 `residuals`、`CourantNo`、`timeInfo`，用于监控而非结果。

`fieldAverage` 的关键限制是累加器只能从 `timeStart` 开始、到 `timeEnd` 结束，中途重启会重置。若算例预计要续算，应把统计分成若干段、每段用独立的 `timeStart`，或者改用保存场后离线平均。

## 时间加权平均与统计时长

自适应时间步下各时刻的权重不同，平均值必须按 $\Delta t$ 加权：

$$
\bar\phi = \frac{\sum_{n} \phi_n \Delta t_n}{\sum_{n} \Delta t_n}, \qquad
\phi_{\mathrm{rms}} = \sqrt{\overline{\phi^2} - \bar\phi^{\,2}}
$$

`fieldAverage` 内部就是按时间步权重累加的，所以用 `adjustTimeStep true` 时不能拿等间隔采样去复算它。

统计时长的下限由积分时间尺度决定。圆柱绕流 $D = 0.1\ \mathrm{m}$、$U = 1.0\ \mathrm{m/s}$ 时涡脱周期 $T_s = 0.606\ \mathrm{s}$，积分时间尺度取 $\tau \approx 0.4\,T_s = 0.24\ \mathrm{s}$。要得到 5% 精度的平均值，需要的独立样本数：

$$
N_{\mathrm{ind}} \approx \left(\frac{z_{0.975}\,\sigma_\phi}{\varepsilon_\phi\,\bar\phi}\right)^2
$$

取 $\sigma_\phi/\bar\phi = 0.5$、$\varepsilon_\phi = 0.05$、$z_{0.975} = 1.96$：$N_{\mathrm{ind}} = (1.96 \times 0.5/0.05)^2 = 384$。于是统计时长 $T = N_{\mathrm{ind}}\,\tau = 384 \times 0.24 = 92\ \mathrm{s}$。以 $\Delta t = 5.0\times10^{-4}\ \mathrm{s}$ 计，这相当于 $1.84\times10^5$ 步，统计段本身的机时就是主要成本。把精度放宽到 10%，$N_{\mathrm{ind}}$ 降到 96，时长缩到 23 s。

## 力与力矩系数的归一化

`forceCoeffs` 输出 $C_d$、$C_l$，其分母是动压乘参考面积：

$$
C_d = \frac{F_d}{\tfrac{1}{2}\rho U^2 A_{\mathrm{ref}}}
$$

取圆柱 $D = 0.1\ \mathrm{m}$、展长 $L_z = 0.5\ \mathrm{m}$，则 $A_{\mathrm{ref}} = DL_z = 0.05\ \mathrm{m^2}$；空气 $\rho = 1.225\ \mathrm{kg/m^3}$，$U = 10\ \mathrm{m/s}$。动压项为：

$$
\tfrac{1}{2}\rho U^2 A_{\mathrm{ref}} = 0.5 \times 1.225 \times 100 \times 0.05 = 3.063\ \mathrm{N}
$$

`forces` 输出的流向力为 $3.68\ \mathrm{N}$，则 $C_d = 3.68/3.063 = 1.20$，与 $Re = 1.0\times10^5$ 圆柱的公认值 1.2 吻合。若忘了设 `rhoInf`（默认取 1），$C_d$ 会变成 1.47，误差 22%。`magUInf` 与 `lRef`、`Aref` 三个量必须与物理设置一致，`CofR` 只影响力矩不影响力。

`forceCoeffs` 把原始力与归一化系数写在同一个文件里，核对时可以直接取列相除：

```bash
head -12 postProcessing/forceCoeffs1/0/coefficient.dat | tail -3
awk '!/^#/ && NF>=5 {printf "t=%.2f  Fd=%.4f  Cd=%.4f\n", $1, $2, $5}' \
    postProcessing/forceCoeffs1/0/coefficient.dat | tail -5
```

若 $C_d$ 列与手算的 $F_d/3.063$ 对不上，问题一定在归一化参数而非流场。

## 配置片段

```text
functions
{
    #includeFunc residuals
    #includeFunc CourantNo

    fieldAverage1
    {
        type            fieldAverage;
        libs            ("libfieldFunctionObjects.so");
        fields
        (
            U   { mean on; prime2Mean on; }
            p   { mean on; }
        );
        timeStart       20;      // 跳过前 20 s 启动瞬态
        timeEnd         112;
    }

    forceCoeffs1
    {
        type            forceCoeffs;
        libs            ("libforces.so");
        patches         (cylinder);
        rho             rhoInf;
        rhoInf          1.225;
        magUInf         10;
        lRef            0.1;
        Aref            0.05;
        CofR            (0 0 0);
        writeControl    timeStep;
        writeInterval   10;
    }
}
```

`writeControl` 在 functionObject 内部是独立的，与全局 controlDict 无关。`forceCoeffs` 用 `timeStep` 配 `writeInterval 10` 得到每 10 步一个系数样本，足以做频谱；`fieldAverage` 不需要写控制，它在内存中累加、只在全局写出时刻落盘。

## 失败模式与判定

| 现象 | 根因 | 判定试验 |
|---|---|---|
| postProcessing 目录为空 | 未加载 libs，或 FO 名与已有对象重名 | 日志中 grep 该 FO 名，看是否报 "already exists" |
| 平均值随 timeStart 改变 | 统计窗口仍包含启动瞬态 | 用 timeStart 20 与 40 各算一次，比较均值 |
| UPrime2Mean 出现负的对角分量 | mean 与 prime2Mean 的时间列未对齐 | 检查 postProcessing 两个文件的时间戳是否逐行一致 |
| 在线 Cd 与手算差 20% | rhoInf 未设或 Aref 用了直径而非投影面积 | 用 $0.5\rho U^2 A$ 手算分母核对 |
| 并行运行时 probes 输出出现两份 | 探针落在子域交界，被多个进程各写一次 | 把探针坐标移到单元中心后重测 |
| 开统计后每步时间明显上升 | writeInterval 过小，每步都落盘 | 对比开/关 FO 的单步墙钟时间 |
| 统计场在重启后从头累加 | fieldAverage 累加器随运行重置 | 看 postProcessing 时间列首值是否回到 timeStart |

## 参考文献

1. Pope S. B. Turbulent Flows. Cambridge University Press, 2000.
2. Tennekes H., Lumley J. L. A First Course in Turbulence. MIT Press, 1972.
3. Weller H. G., Tabor G., Jasak H., Fureby C. A tensorial approach to computational continuum mechanics using object-oriented techniques. Computers in Physics, 12(6):620–631, 1998.
4. Franke J., Hellsten A., Schlünzen H., Carissimo B. (eds.) Best Practice Guideline for the CFD Simulation of Flows in the Urban Environment. COST Action 732, 2007.
5. Schlichting H., Gersten K. Boundary-Layer Theory, 9th ed. Springer, 2017.
6. OpenCFD Ltd. OpenFOAM v11 User Guide. 2024. Chapter on function objects.
