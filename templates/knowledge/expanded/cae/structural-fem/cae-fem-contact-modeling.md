---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-contact-modeling
title: "接触与摩擦：物理建模与适用边界"
summary: "接触建模的边界由间隙状态与滑移量决定。本文给出罚刚度按 $\\epsilon_n=(10\\sim100)E/h$ 的取值依据、由 $200\\,\\mathrm{MPa}$ 接触压力反算 19 nm 穿透的核对方法，并区分小滑移与有限滑移、黏着与滑移的适用范围。"
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
  - "接触与摩擦"
  - "物理建模与适用边界"
  - "罚函数"
  - "库仑摩擦"
seo:
  title: "接触与摩擦：物理建模与适用边界"
  description: "接触建模的边界由间隙状态与滑移量决定。本文给出罚刚度按 εn=(10~100)E/h 的取值依据、由 200 MPa 接触压力反算 19 nm 穿透的核对方法，并区分小滑移与有限滑移、黏着与滑移的适用范围。"
  keywords:
    - "接触与摩擦"
    - "物理建模与适用边界"
    - "罚函数"
    - "库仑摩擦"
    - "小滑移"
---

# 接触与摩擦：物理建模与适用边界

接触分析里"结果对不对"往往取决于三个建模决定：接触对的主从面怎么选、罚刚度取多大、摩擦是黏着还是滑移。这些决定都有量化的适用边界，而不是靠试错。本文给出罚刚度与穿透量的估算关系、主从面的几何判据、小滑移与有限滑移的分界，并用一个 200 MPa 接触压力算例把穿透量核对到纳米量级。

## 接触约束的数学形式

法向接触要求不可穿透与压力非负，二者互补：

$$
g_n\ge0,\qquad p_n\ge0,\qquad g_n\,p_n=0
$$

$g_n$ 是沿接触法向的有符号间隙（分离为正），$p_n$ 是接触压力。这三式说明接触是一个活动集问题：开或闭的状态随载荷切换，边界上"恰好接触"的点对扰动极敏感。切向由库仑条件约束，$\lVert\mathbf t_t\rVert\le\mu p_n$，$\mu$ 为摩擦系数；未达上限时黏着，达到上限时滑移。

## 罚函数与约束施加方式的边界

罚函数法允许微小穿透，用接触刚度 $\epsilon_n$ 把穿透折算成压力：

$$
p_n=\epsilon_n\langle-g_n\rangle_+,\qquad \langle\cdot\rangle_+=\max(\cdot,0)
$$

$\epsilon_n$ 的取值直接决定穿透量与条件数。过小则穿透可见、结果偏软；过大则刚度矩阵条件数恶化、迭代发散。工程经验取 $\epsilon_n=(10\sim100)E/h$，$E$ 为接触体弹性模量、$h$ 为接触区单元特征尺寸。拉格朗日乘子法严格满足不可穿透，但引入鞍点系统并需满足 LBB 条件，接触压力易振荡；增广拉格朗日法在罚项上叠加乘子外迭代，兼得精度与稳定，代价是外循环。

## 一次可核对的穿透量估算

取钢-钢接触，$E=210\,\mathrm{GPa}$，接触区单元尺寸 $h=1.0\,\mathrm{mm}$，按中值取 $\epsilon_n=50E/h$：

$$
\epsilon_n=50\times\frac{210\times10^{9}}{1.0\times10^{-3}}=1.05\times10^{16}\,\mathrm{N/m^{3}}
$$

若该处接触压力为 $p_n=200\,\mathrm{MPa}$，则穿透量

$$
g_n=\frac{p_n}{\epsilon_n}=\frac{200\times10^{6}}{1.05\times10^{16}}=1.9\times10^{-8}\,\mathrm{m}=19\,\mathrm{nm}
$$

判定标准是穿透量相对单元尺寸可忽略：$19\,\mathrm{nm}/1.0\,\mathrm{mm}=1.9\times10^{-5}$，远小于 1% 的容差，说明罚刚度合适。若把 $\epsilon_n$ 降到 $10E/h=2.1\times10^{15}$，穿透升到 95 nm，仍可接受；降到 $1E/h$ 时穿透为 0.95 µm，达到单元尺寸的 0.1%，开始影响反力精度。这个反算就是选定罚刚度后的自检。

## 主从面、滑移与摩擦的适用边界

主从面选择遵循三条判据：取较硬或较密网格为主面，避免从节点穿透主面；主面法向必须外指且一致，否则压力整体反号；曲面接触需在接触区加密，减小几何离散带来的伪压力振荡。初始几何重叠会产生人为初始压力，建模时应先消除重叠再加载。

滑移量的边界决定算法：相对滑移小于接触面单元尺寸的 20% 时可用小滑移公式（接触点配对固定，成本低）；超过则需有限滑移（每步重新搜索）。摩擦系数取值的工程范围：钢-钢干摩擦 $\mu=0.15\sim0.6$（常用 0.3），钢-混凝土 0.4～0.7，润滑表面 0.05～0.15。当接触面存在黏着、磨损、胶合或脱层时，纯库仑模型失效，应改用内聚力（cohesive）或磨损模型。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 接触区压力振荡 | 主从面网格不匹配或罚刚度过大 | 加密接触区网格并降低 $\epsilon_n$，观察压力是否平滑 |
| 反力小于外载、有可见重叠 | 罚刚度过小，穿透超容差 | 由 $g_n=p_n/\epsilon_n$ 反算穿透，与单元尺寸比较 |
| 接触压力方向整体反号 | 主面法向定义错误 | 检查法向外指方向与初始间隙符号 |
| 加载初期就出现接触压力 | 存在初始几何重叠 | 检查初始间隙 $g_n$，应为非负 |
| 大滑移下结果不收敛 | 用了小滑移公式 | 统计相对滑移量与单元尺寸之比，超过 20% 换有限滑移 |
| 黏着区出现相对滑移 | 摩擦正则化刚度过低 | 提高正则化刚度，检查切向牵引是否达 $\mu p_n$ |

## 接触对与摩擦配置

Abaqus 中定义罚接触与库仑摩擦的最小片段：

```
*SURFACE INTERACTION, NAME=FRIC
*FRICTION
0.3,                      # 摩擦系数 mu
*SURFACE BEHAVIOR, PRESSURE-OVERCLOSURE=LINEAR
1.05e16,                  # 罚刚度 epsilon_n = 50E/h
*CONTACT PAIR, INTERACTION=FRIC, TYPE=SURFACE TO SURFACE
BLOCK_BOTTOM, RIGID_PLANE
*CONTACT CONTROLS, STABILIZE
```

`PRESSURE-OVERCLOSURE=LINEAR` 对应罚函数；`TYPE=SURFACE TO SURFACE` 适合有限滑移；若为小滑移可改为 `SMALL SLIDING` 以节省搜索成本。

## 参考文献

1. Wriggers, P. *Computational Contact Mechanics*, 2nd ed. Springer, 2006.
2. Laursen, T.A. *Computational Contact and Impact Mechanics*. Springer, 2002.
3. Kikuchi, N., Oden, J.T. *Contact Problems in Elasticity: A Study of Variational Inequalities and Finite Element Methods*. SIAM, 1988.
4. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
5. Zienkiewicz, O.C., Taylor, R.L., Zhu, J.Z. *The Finite Element Method: Its Basis and Fundamentals*, 7th ed. Butterworth-Heinemann, 2013.
6. Belytschko, T., Liu, W.K., Moran, B. *Nonlinear Finite Elements for Continua and Structures*. Wiley, 2000.
