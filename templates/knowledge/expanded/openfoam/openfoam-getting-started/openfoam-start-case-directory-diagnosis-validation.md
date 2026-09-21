---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-start-case-directory-diagnosis-validation
title: "算例目录与时间步结构：结果诊断与可信度验证"
summary: "用采样定理、重启一致性范数与库朗数分布三项证据审查时间步与写出设置，给出 foamListTimes、postProcess -func CourantNo 与 fieldMinMax 的具体用法，并说明如何区分时间离散伪影与真实物理变化。"
category:
  slug: openfoam-getting-started
  name: "OpenFOAM 入门与案例组织"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 入门与案例组织"
  - "算例目录与时间步结构"
  - "结果诊断与可信度验证"
  - "CourantNo"
  - "重启一致性"
seo:
  title: "算例目录与时间步结构：结果诊断与可信度验证"
  description: "用采样定理、重启一致性范数与库朗数分布三项证据审查时间步与写出设置，给出 foamListTimes、postProcess -func CourantNo 与 fieldMinMax 的具体用法，并说明如何区分时间离散伪影与真实物理变化。"
  keywords:
    - "算例目录与时间步结构"
    - "结果诊断与可信度验证"
    - "库朗数分布"
    - "采样定理"
    - "重启一致性"
---

# 算例目录与时间步结构：结果诊断与可信度验证

时间步与写出设置留下的痕迹有两类：日志里逐行的库朗数与连续性误差，磁盘上一个个时间目录。前者反映求解器内部实际走过了什么，后者反映你事后能看到什么，两者不一致时"算过"和"看得到"之间就出现了断层。本文用库朗数分布、采样率和重启一致性三项可量化的证据，判断一次瞬态计算的时间离散是否可信。

## 时间目录的完整性先于任何后处理

先确认目录集合本身没有缺口。`foamListTimes -withZero` 按数值顺序列出时间目录，`foamListTimes -rm` 只删时间目录不动其他文件，比手工 `rm -rf` 安全。若某个中间时刻缺失，最可能的原因是重启：用 `startFrom latestTime` 从 0.30 s 续算时，`writeControl adjustableRunTime` 会把写出相位对齐到新的起点，于是 0.30 s 与 0.35 s 之间可能出现一个长度异常的间隔。判定试验是查看相邻时间目录的差值序列，正常应为等间隔的 0.05 s，出现 0.08 s 之类的跳变即为此类相位错位。

`checkMesh -allGeometry -allTopology` 的报告要和 `constant/polyMesh/` 的时间戳一起看。若网格在上次运行后被重建而 `0/` 未同步，日志会在启动阶段抛出 patch 数量或名字不匹配的错误，而不是在几百步之后才暴露。

## 库朗数要看分布而不是最大值

`maxCo` 是控制目标，不是实测结果。用函数对象导出逐单元的库朗数场：

```bash
postProcess -func CourantNo -time 0.4
postProcess -func 'fieldMinMax(U)' -time 0.4
```

`CourantNo` 写出 `postProcessing/CourantNo/<time>/CourantNo.dat`，包含时间、平均库朗数与最大库朗数三列。判据是：稳态段的最大库朗数应稳定在 `maxCo` 之下且不随时间漂移；若最大库朗数在某个时刻后单调爬升，通常是局部速度被放大或网格出现畸形单元，而不是时间步设置的问题。局部分布同样重要——平均值 0.15 而最大值 0.87 说明大部分区域时间分辨率充裕，个别单元在拖后腿；此时应定位那些单元而不是全局减小 `maxDeltaT`。

## 采样率决定了你能看到的最快过程

后处理只能看到时间目录，因此写出频率构成一次采样：

$$
f_s = \frac{1}{\Delta t_{\text{write}}} \ge 2 f_{\max}
$$

圆柱绕流的脱落频率由斯特劳哈尔数给出，$St\approx 0.2$ 时

$$
f_{\text{shed}} = \frac{St\,U}{D}
$$

直径 $D = 0.02\ \mathrm{m}$、来流 $U = 10\ \mathrm{m/s}$ 代入得 $f_{\text{shed}} = 0.2\times 10/0.02 = 100\ \mathrm{Hz}$。按采样定理需要 $f_s \ge 200\ \mathrm{Hz}$，即 $\Delta t_{\text{write}} \le 5\times 10^{-3}\ \mathrm{s}$。若沿用 `writeInterval 0.01`（$f_s = 100\ \mathrm{Hz}$），升力谱会在 50 Hz 处出现一个虚假峰并把真实的 100 Hz 分量折叠过去，此时无论怎样加长统计窗口都得不到正确频率。判定试验：把 `writeInterval` 减半重跑同样的物理时长，若谱峰位置随之移动，说明先前的结果是混叠伪影。

## 重启一致性是一项独立证据

从某一时刻续算，物理上不应产生跳变。取续算前最后一个时间目录 $t_r^-$ 与续算后第一个时间目录 $t_r^+$，定义相对范数差

$$
\varepsilon_{r} = \frac{\lVert \phi(t_r^{+})-\phi(t_r^{-}) \rVert_2}{\lVert \phi(t_r^{-}) \rVert_2}
$$

$\phi$ 取 `U` 或 `p`。对 0.30 s 重启、0.35 s 首次写出的算例，若 $\varepsilon_r$ 在 $10^{-4}$ 量级，属于浮点与线性求解容差范围内的正常差异；若达到 $10^{-1}$，说明续算时读入了不同的物性、边界或松弛设置——常见原因是 `constant/` 中的字典在两次运行之间被修改。用 `md5sum constant/*.dict` 在两次运行前各记一次，可以直接排除这种可能。

## 时间步与网格的联合加密

单独加密网格或单独减小时间步都可能得出"已收敛"的错误结论，因为显式格式的总误差由两者共同决定。可操作的顺序是：先把 `maxCo` 从 0.8 降到 0.4 重跑，若目标量（如阻力系数）变化小于 1%，说明时间离散已足够；再对网格做一次系统加密，看变化是否同样小于 1%。两者都通过，才能把结果归因于物理而非离散。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 升力谱主峰随 `writeInterval` 改变而移动 | 写出频率低于奈奎斯特要求，发生混叠 | 将 `writeInterval` 减半，谱峰应稳定在 $f_{\text{shed}}$ |
| 相邻时间目录间隔忽大忽小 | 重启后 `adjustableRunTime` 相位重置 | 比较 `foamListTimes` 输出相邻差值，正常应恒定 |
| 最大库朗数随时间单调上升 | 局部速度增大或单元畸变，非时间步设置问题 | `postProcess -func 'fieldMinMax(U)'` 定位最大值出现时刻 |
| 续算后目标量跳变超过 1% | 续算读入的字典与首段不一致 | 两次运行前对 `constant/` 做 `md5sum` 比对 |
| `checkMesh` 报负体积单元但计算仍推进 | 时间步与畸变单元共同作用 | 重建网格后重跑相同 `maxCo`，负体积应消失 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Section "Post-processing" and "Numerical Schemes".
2. C. J. Greenshields, *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
3. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
4. C. H. K. Williamson, "Vortex dynamics in the cylinder wake", *Annual Review of Fluid Mechanics*, 28:477–539, 1996.
5. H. Jasak, *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
6. R. D. Richtmyer, K. W. Morton, *Difference Methods for Initial-Value Problems*, 2nd ed., Interscience, 1967.
