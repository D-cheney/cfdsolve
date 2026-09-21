---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-start-units-conventions-diagnosis-validation
title: "单位、坐标与符号约定：结果诊断与可信度验证"
summary: "用量级偏差定位单位错误、用力矩与功率的符号核对旋转约定、用包围盒细长比判定二维退化假设是否成立，并给出法向与通量符号的自洽检验与与基准对照的验证流程。"
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
  - "单位、坐标与符号约定"
  - "结果诊断与可信度验证"
  - "力矩符号"
  - "二维退化"
seo:
  title: "单位、坐标与符号约定：结果诊断与可信度验证"
  description: "用量级偏差定位单位错误、用力矩与功率的符号核对旋转约定、用包围盒细长比判定二维退化假设是否成立，并给出法向与通量符号的自洽检验与与基准对照的验证流程。"
  keywords:
    - "单位、坐标与符号约定"
    - "结果诊断与可信度验证"
    - "力矩符号"
    - "轴功率"
    - "包围盒"
---

# 单位、坐标与符号约定：结果诊断与可信度验证

单位错与坐标错的可观测后果不同：单位错让结果整体差一个固定倍数，坐标错让结果方向或符号反了，二维退化假设错则让结果系统性偏离参考值。三类偏差各有对应的诊断量，且都能在计算初期用低成本手段判定。本文给出量级比对、力矩—功率符号核对与包围盒细长比三种判定方法，以及法向约定自洽性的检验步骤。

## 单位错表现为固定倍数，可以直接反算

量纲不变而单位错时，所有结果按同一倍数缩放。以雷诺数为例

$$
Re = \frac{\rho U L}{\mu}
$$

取 $\rho = 998.2\ \mathrm{kg/m^3}$、$U = 1.5\ \mathrm{m/s}$、$\mu = 1.0022\times 10^{-3}\ \mathrm{Pa\cdot s}$，特征长度按 $L = 0.05\ \mathrm{m}$ 计得 $Re = 7.47\times 10^{4}$。若几何以毫米建模却未缩放，$L$ 实际为 $50$，$Re$ 变成 $7.47\times 10^{7}$；若把动力粘度填成了 $\mathrm{mPa\cdot s}$ 的数值，$Re$ 又会偏大 1000 倍。诊断方法是把算例报告的阻力、压降或换热系数与同 $Re$ 下的参考值比对：倍数偏差若恰好是 $10^{3}$ 或 $10^{-3}$，几乎必然来自长度或粘度单位。

另一种单位错不改变量级，只改变方向或零点。温度把摄氏度当开尔文填入，会让 $300\ \mathrm{K}$ 的算例实际按 $27\ \mathrm{K}$ 推进，密度与粘度全部偏离。判定试验：用 `postProcess -func 'fieldMinMax(T)'` 取值，若全场最低温度落在 $250\ \mathrm{K}$ 以下且分布均匀，先检查温度边界与初值的零点偏移。

## 力矩与功率的符号核对旋转约定

旋转约定是否正确，可由轴功率的符号与量级同时判定：

$$
P = M\omega
$$

其中 $M$ 是绕旋转轴的力矩、$\omega$ 是角速度。取 $\omega = 157.08\ \mathrm{rad/s}$（对应 1500 rpm）、力矩 $M = 2.5\ \mathrm{N\cdot m}$，则轴功率 $P = 2.5\times 157.08 = 392.7\ \mathrm{W}$。若流体处于被驱动状态（搅拌桨带动流体），$P$ 应为正；若流体反过来驱动叶轮（透平工况），$P$ 为负。$M$ 与 $\omega$ 的符号同号得正、异号得负，因此"功率为负"这一条本身就是转向或轴向写反的直接证据。

进一步可用效率核对量级：

$$
\eta = \frac{P_{\text{useful}}}{P_{\text{shaft}}}
$$

设计效率 0.72 时，轴功率 $392.7\ \mathrm{W}$ 对应的有效功率为 $282.7\ \mathrm{W}$。若算出的有效功率是 $2.83\times 10^{4}\ \mathrm{W}$，偏离 100 倍，那是半径或角速度的单位错，而不是效率假设问题。

取数方式：

```bash
postProcess -func forces -time 0.5
foamDictionary -entry functions/forces/CofR -value system/controlDict
```

`forces` 函数对象需要 `CofR`（力矩参考点）与 `patches` 列表。参考点写错会让力臂出错，力矩随之偏移——但合力不变，这一条可以用来区分"参考点错"与"转向错"：前者力与力矩不同时正确，后者两者同时反号。

## 二维退化假设用包围盒细长比判定

`empty` 边界成立的前提是几何确实退化。用 `checkMesh` 报告的包围盒计算细长比

$$
r_{\text{thin}} = \frac{L_z}{\sqrt{A_{xy}}}
$$

包围盒为 $1.0\ \mathrm{m}\times 0.2\ \mathrm{m}\times 0.1\ \mathrm{m}$ 时，$\sqrt{A_{xy}} = \sqrt{0.2} = 0.4472$，$r_{\text{thin}} = 0.1/0.4472 = 0.2236$。这个值说明厚度达到面内尺度的 22%，`empty` 假设不成立。经验阈值是 $r_{\text{thin}} < 10^{-2}$：达到 $0.01$ 时厚度对流场的约束已小于 1%，可以忽略；达到 $0.2$ 时误差量级与厚度同阶。

判定试验：把同一算例分别按"薄层 + `empty`"与"真实厚度 + `symmetryPlane` 或三维"各跑一次，比较目标量。若两者相差超过 5%，说明该几何不能用二维退化处理。这个试验的成本远低于事后发现结果无法解释的代价。

## 法向与通量符号的自洽检验

面矢量由单元指向外，通量以流出为正。由此可以构造一个不依赖物理模型的自洽检验：在封闭算例中，所有边界上的 $\sum_f \rho\,\mathbf u_f\cdot\mathbf A_f$ 应等于 $-\frac{d}{dt}\int_V \rho\,dV$；稳态时两边都为零。若把入口速度方向写反（指向域外），求解器会持续从入口抽走质量，体积流量核对会出现与入口流量同量级的缺口。

另一个常见的不自洽来自 `symmetryPlane` 与 `empty` 的混用：`symmetryPlane` 要求 patch 的几何平面与声明一致，若网格在该平面两侧都有单元，启动阶段会报该 patch 的法向与几何不符并中止。判定方式是查看 `checkMesh` 中该 patch 的 `nPoints`、`nFaces` 与面法向分布，法向应全部平行于声明的对称轴。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 阻力比同 $Re$ 参考值大 $10^{3}$ 倍 | 几何以毫米建模但未缩放 | 用 $\rho U L/\mu$ 重算 $Re$ 并与设计值比对 |
| 轴功率为负而工况应为驱动 | 角速度符号或轴向与右手螺旋约定不符 | 反转 `omega` 符号重跑，功率符号应同步改变 |
| 合力正确但力矩偏差大 | `CofR` 参考点设置错误 | 改变 `CofR` 后重跑，合力应不变而力矩随之变化 |
| 二维结果比三维参考偏大 20% 以上 | 厚度不满足退化条件，`empty` 假设失效 | 计算 $r_{\text{thin}}$，大于 $10^{-2}$ 时改用准三维设置 |
| 入口流量核对出现同量级缺口 | 入口速度方向指向域外 | 检查 `0/U` 入口 `value` 与 patch 外法向的夹角 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, v14, Section "Boundary conditions" and "Post-processing function objects".
2. C. J. Greenshields, *Notes on Computational Fluid Dynamics: General Principles*, CFD Direct, 2022.
3. BIPM, *Le Système international d'unités (SI)*, 9th ed., 2019.
4. ISO, *ISO 80000-1:2009 Quantities and units — Part 1: General*, International Organization for Standardization, 2009.
5. H. Jasak, *Error Analysis and Estimation for the Finite Volume Method with Applications to Fluid Flows*, PhD thesis, Imperial College London, 1996.
6. J. H. Ferziger, M. Perić, R. L. Street, *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
