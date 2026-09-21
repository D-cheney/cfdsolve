---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-element-selection-modeling
title: "单元类型选择：物理建模与适用边界"
summary: "单元类型选择的本质是选择运动学假设。本文给出实体/壳/梁的降维阈值、单元阶次与积分方案的取舍依据，并用一根悬臂梁把解析挠度算到 7.44 mm 作为选型对照基准。"
category:
  slug: structural-fem
  name: "结构与有限元算法"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "结构与有限元算法"
  - "单元类型选择"
  - "物理建模与适用边界"
  - "降维判据"
  - "减缩积分"
seo:
  title: "单元类型选择：物理建模与适用边界"
  description: "单元类型选择的本质是选择运动学假设。本文给出实体/壳/梁的降维阈值、单元阶次与积分方案的取舍依据，并用一根悬臂梁把解析挠度算到 7.44 mm 作为选型对照基准。"
  keywords:
    - "单元类型选择"
    - "物理建模与适用边界"
    - "降维判据"
    - "二次单元"
    - "减缩积分"
---

# 单元类型选择：物理建模与适用边界

选单元不是从库里挑一个名字，而是决定用什么运动学假设换取多少精度和成本。结论先给：三维应力状态用实体单元，长细比或跨厚比满足阈值且以弯曲为主的构件用梁或壳单元，二阶单元与减缩积分在弯曲、近不可压缩两类问题中明显更稳。一阶四面体是应力分析中最容易踩的坑，它的常应变假设让弯曲响应偏刚。

## 降维的三个阈值

从三维降到二维或一维，本质是承认某个方向的应力或应变可以忽略或线性分布。

第一，实体与壳的分界看跨厚比与曲率。当板的跨度与厚度之比 $a/t>20$、或壳的中面曲率半径满足 $R/h>20$ 时，横向剪切与厚度方向应力梯度可忽略，薄壳理论（Kirchhoff–Love）成立，用壳单元比实体单元省一个量级的自由度。若 $R/h<10$，横向剪切不可忽略，应改用 Mindlin–Reissner 壳或直接建实体。

第二，实体与梁的分界看长细比。Euler–Bernoulli 梁忽略剪切变形，其适用下限约 $L/h>10$；$5<L/h<10$ 时剪切贡献进入 1%～3% 量级，应改用 Timoshenko 梁；$L/h<5$ 时短梁效应显著，实体单元更可靠。

第三，平面应力与平面应变的判别看厚度约束：薄板自由收缩用平面应力，厚截面受刚性约束（如长坝、厚壁筒中部）用平面应变。两者的等效模量不同，平面应变下 $E'=E/(1-\nu^2)$，$\nu=0.3$ 时比平面应力刚 9.9%。

## 单元阶次与积分方案的取舍

线性单元（4 节点四面体、8 节点六面体）形函数为一次，应变在单元内常数或线性，弯曲时无法表达线性变化的曲率，产生剪切锁死而偏刚。二次单元（10 节点四面体、20 节点六面体）形函数为二次，能捕捉线性应变梯度，在弯曲问题中收敛更快。

积分方案要与阶次匹配。完全积分对 2×2×2 六面体用 8 个 Gauss 点，会锁死弯曲；减缩积分只用 1 个点，消除锁死但引入沙漏模式，需要沙漏控制。工程经验：弯曲主导用 C3D8R 或 C3D20R，近不可压缩用 C3D8RH（杂交）或 B-bar 公式。

## 悬臂梁选型基准

用一根解析可算的悬臂梁作为选型对照：长度 $L=0.5\,\mathrm m$，截面宽 $b=0.02\,\mathrm m$、高 $h=0.02\,\mathrm m$，$E=210\,\mathrm GPa$，$\nu=0.3$，端部集中力 $F=500\,\mathrm N$。截面惯性矩

$$
I=\frac{bh^{3}}{12}=\frac{0.02\times(0.02)^{3}}{12}=1.333\times10^{-8}\,\mathrm{m^4}
$$

按 Euler–Bernoulli 理论，端部挠度

$$
\delta=\frac{FL^{3}}{3EI}=\frac{500\times(0.5)^{3}}{3\times210\times10^{9}\times1.333\times10^{-8}}=7.44\times10^{-3}\,\mathrm m=7.44\,\mathrm{mm}
$$

$\delta/L=1.49\%<2\%$，小变形假设成立。根部弯矩 $M=FL=250\,\mathrm{N\cdot m}$，表面弯曲应力

$$
\sigma=\frac{Mc}{I}=\frac{250\times0.01}{1.333\times10^{-8}}=1.875\times10^{8}\,\mathrm{Pa}=187.5\,\mathrm{MPa}
$$

把 7.44 mm 与 187.5 MPa 作为标尺：任何实体建模方案若挠度偏小超过 10%（即小于 6.7 mm），基本可判定为弯曲锁死或厚度方向单元数不足。工程上，线性六面体在厚度方向至少布置 4 层、二次单元至少 2 层，才能把弯曲误差压到 5% 以内。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 一阶四面体算弯曲，挠度比解析解小 30% 以上 | 常应变单元无法表达曲率，剪切锁死 | 与 7.44 mm 解析值对比，或换二次单元复算 |
| 减缩积分出现锯齿状位移云图 | 沙漏模式未被约束 | 检查沙漏能与总应变能之比，应小于 5% |
| 壳单元结果对网格方向敏感 | 网格未沿主曲率或主应力方向 | 把网格旋转 45° 后复算，比较峰值 |
| 实体模型整体偏刚 | 厚度方向单元层数不足 | 厚度方向从 2 层加密到 4 层复算 |
| 平面应变结果比平面应力刚很多 | 厚度约束假设与实际不符 | 用三维实体做一次完整复算对照 |
| 网格加密后应力不收敛反而振荡 | 单元畸变或长宽比过大 | 检查长宽比，控制在 3:1 以内 |

## 单元与积分配置片段

Abaqus 中实体与壳的典型配置如下，注意减缩积分必须配沙漏控制：

```
*ELEMENT, TYPE=C3D8R, ELSET=SOLID
*SECTION CONTROLS, NAME=HG, HOURGLASS=ENHANCED
*SOLID SECTION, ELSET=SOLID, CONTROLS=HG, MATERIAL=STEEL
*ELEMENT, TYPE=C3D20R, ELSET=SOLID2
*ELEMENT, TYPE=S4R, ELSET=SHELL
*SHELL SECTION, ELSET=SHELL, MATERIAL=STEEL
0.005,
*ELEMENT, TYPE=B31, ELSET=BEAM
*BEAM SECTION, ELSET=BEAM, MATERIAL=STEEL, SECTION=RECT
0.02, 0.02
```

`HOURGLASS=ENHANCED` 是减缩积分的必要配套；`S4R` 的 R 表示减缩积分，`B31` 为 Timoshenko 梁。

## 选型判据汇总

| 几何特征 | 推荐单元 | 积分 | 关键阈值 |
|---|---|---|---|
| 三维块体、无弯曲主导 | C3D8 / C3D20 | 完全 | 长宽比 <3:1 |
| 三维弯曲、近不可压缩 | C3D8R / C3D8RH | 减缩 | 厚度方向 ≥4 层 |
| 薄板薄壳 $a/t>20$ | S4R / S8R | 减缩 | 网格沿主曲率 |
| 细长杆 $L/h>10$ | B31（Timoshenko） | — | $L/h<10$ 需考虑剪切 |
| 短粗构件 $L/h<5$ | 实体单元 | — | 放弃梁理论 |

## 参考文献

1. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
2. Hughes, T.J.R. *The Finite Element Method: Linear Static and Dynamic Finite Element Analysis*. Dover, 2000.
3. Zienkiewicz, O.C., Taylor, R.L., Zhu, J.Z. *The Finite Element Method: Its Basis and Fundamentals*, 7th ed. Butterworth-Heinemann, 2013.
4. MacNeal, R.H. *Finite Elements: Their Design and Performance*. Marcel Dekker, 1994.
5. Cook, R.D., Malkus, D.S., Plesha, M.E., Witt, R.J. *Concepts and Applications of Finite Element Analysis*, 4th ed. Wiley, 2002.
6. Dassault Systèmes. *Abaqus Analysis User's Guide*, Section 28 (Elements). 2023.
