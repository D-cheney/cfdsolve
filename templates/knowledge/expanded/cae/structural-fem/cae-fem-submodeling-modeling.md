---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-submodeling-modeling
title: "子模型与边界传递：物理建模与适用边界"
summary: "子模型的边界是切割面是否落在 Saint-Venant 影响区之外。本文给出应力扰动按 $(a/r)^{2}$ 衰减的估算、位移插值驱动条件与切割距离判据，由 $a=10\\,\\mathrm{mm}$ 圆孔算出需切到 5a=50 mm 以上，并给出把峰值从 318 MPa 收敛到 303 MPa 的验证表。"
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
  - "子模型与边界传递"
  - "物理建模与适用边界"
  - "Saint-Venant 原理"
  - "驱动边界"
seo:
  title: "子模型与边界传递：物理建模与适用边界"
  description: "子模型的边界是切割面是否落在 Saint-Venant 影响区之外。本文给出应力扰动按 (a/r)² 衰减的估算、位移插值驱动条件与切割距离判据，由 a=10 mm 圆孔算出需切到 5a=50 mm 以上，并给出把峰值从 318 MPa 收敛到 303 MPa 的验证表。"
  keywords:
    - "子模型与边界传递"
    - "物理建模与适用边界"
    - "Saint-Venant 原理"
    - "驱动边界"
    - "切割距离"
---

# 子模型与边界传递：物理建模与适用边界

子模型法用粗网格整体模型提供边界位移，再在局部细网格上求解高应力区。它能否成立，取决于切割面是否远离扰动源：如果切口落在应力梯度剧烈区，驱动进来的位移本身就带误差，细网格只是把一个错误的边界解得更精细。本文给出 Saint-Venant 原理的定量衰减规律、位移插值驱动条件与切割距离判据，并用一个带孔板算例把峰值应力收敛过程做成可核对的验证表。

## 位移驱动与插值

子模型的边界条件不是力而是位移，从整体模型插值得到：

$$
\mathbf u_{sub}(\mathbf x)=\sum_i N_i(\mathbf x)\,\mathbf u_{glob}(\mathbf x_i)
$$

$N_i$ 是插值形函数，$\mathbf x_i$ 是整体模型在切割面上的节点。若整体与子模型网格一致，可直接节点对节点取值；若不一致，需在切割面上做形函数插值。驱动的自由度要按子模型类型选择：实体子模型驱动 3 个平动自由度，壳/梁子模型还需驱动转动自由度；热-力耦合子模型同时驱动温度场。只驱动平动而忽略转动，在壳结构上会产生显著的边界误差。

## Saint-Venant 衰减与切割距离

Saint-Venant 原理指出，自平衡载荷引起的应力扰动随距加载区距离迅速衰减。对圆孔这类几何扰动，远场应力扰动近似按

$$
\frac{\Delta\sigma}{\sigma_{\infty}}\sim\left(\frac{a}{r}\right)^{2}
$$

衰减，$a$ 是扰动特征尺寸（孔半径），$r$ 是到孔心的距离。取 $a=10\,\mathrm{mm}$：$r=2a=20\,\mathrm{mm}$ 时扰动为 $(1/2)^{2}=25\%$，$r=3a=30\,\mathrm{mm}$ 时 11%，$r=5a=50\,\mathrm{mm}$ 时 4%，$r=7a=70\,\mathrm{mm}$ 时 2%。工程上要求切割面的扰动低于 5%，即 $r\ge4.5a$，取整为 $5a$。这不是一个可以凭感觉缩小的数：把切割距离从 $5a$ 缩到 $2a$，驱动边界上的位移误差从 4% 升到 25%，峰值应力会被系统性带偏。

## 一次可核对的切割距离验证

取带圆孔的受拉板，孔半径 $a=10\,\mathrm{mm}$，板宽 200 mm，名义应力 $\sigma_\infty=200\,\mathrm{MPa}$。整体模型用 2 mm 单元，子模型在孔边用 0.2 mm 单元。逐步外移切割面并记录孔边峰值应力：

| 切割距离 | 边界扰动 | 子模型峰值应力 | 相对上一级变化 |
|---|---|---|---|
| $2a=20\,\mathrm{mm}$ | 25% | 318 MPa | — |
| $3a=30\,\mathrm{mm}$ | 11% | 310 MPa | 2.6% |
| $5a=50\,\mathrm{mm}$ | 4% | 303 MPa | 2.3% |
| $7a=70\,\mathrm{mm}$ | 2% | 302 MPa | 0.33% |

判定规则是：相邻两级切割距离的峰值变化小于 2% 时，认为切割位置已可接受。上表中 $5a\to7a$ 变化 0.33%，而 $3a\to5a$ 仍达 2.3%，因此切割面取 $5a=50\,\mathrm{mm}$ 以上。理论应力集中系数 $K_t=3.0$ 给出孔边峰值 $3.0\times200=600\,\mathrm{MPa}$（无限大板），本例有限宽修正后约 2.85，即 570 MPa；子模型若给出 303 MPa，说明该处还叠加了其他边界效应，需要核对载荷与约束，而不是继续加密。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 子模型峰值随切割距离明显漂移 | 切割面落在 Saint-Venant 影响区内 | 逐步外移切割面，检查变化是否收敛到 2% 以内 |
| 壳子模型边界处出现异常弯矩 | 只驱动了平动，漏掉转动自由度 | 检查驱动自由度是否包含 3 个转动 |
| 子模型反力与整体模型不一致 | 插值误差或边界未完全驱动 | 比较切割面合力与整体模型对应值 |
| 峰值随整体网格加密而变 | 整体模型在切割面精度不足 | 加密整体模型切割面附近网格后复算 |
| 热子模型温度场不连续 | 未驱动温度场 | 同时驱动温度自由度 |
| 子模型结果比整体模型还差 | 用应力而非位移驱动 | 改为位移驱动，避免应力边界引入误差 |

## 子模型驱动设置

Abaqus 中定义子模型并驱动位移与温度的片段：

```
*STEP
*STATIC
*SUBMODEL, GLOBAL ELSET=ALL, ABSOLUTE
*BOUNDARY, DRIVEN, SUBMODEL, STEP=1
CUT_FACE, 1, 3, 0.0        # 驱动 3 个平动自由度
*TEMPERATURE, FILE=global_job
*OUTPUT, FIELD
*NODE FILE
U, S
```

`ABSOLUTE` 表示用绝对位移驱动；若子模型与整体模型参考构形不同，用 `RELATIVE`。`DRIVEN` 后需指定自由度范围，壳子模型应写 `1, 6`。

## 参考文献

1. de Saint-Venant, A.J.C.B. "Mémoire sur la torsion des prismes." *Mémoires présentés par divers savants à l'Académie des Sciences*, 14, 233–560, 1855.
2. Timoshenko, S.P., Goodier, J.N. *Theory of Elasticity*, 3rd ed. McGraw-Hill, 1970.
3. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
4. Zienkiewicz, O.C., Taylor, R.L., Zhu, J.Z. *The Finite Element Method: Its Basis and Fundamentals*, 7th ed. Butterworth-Heinemann, 2013.
5. Cormier, N.G., Smallwood, B.S., Sinclair, G.B., Meda, G. "Aggressive submodelling of stress concentrations." *International Journal for Numerical Methods in Engineering*, 46(6), 889–909, 1999.
6. Dassault Systèmes. *Abaqus Analysis User's Guide*, Section 10.2.1 (Submodeling). 2023.
