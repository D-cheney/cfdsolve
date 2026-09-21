---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-fracture-modeling
title: "断裂与裂纹：物理建模与适用边界"
summary: "断裂参数的边界由塑性区尺寸与裂纹长度之比决定。本文给出应力强度因子 $K=Y\\sigma\\sqrt{\\pi a}$、J 积分与 CTOD 的换算，由 $\\sigma=200\\,\\mathrm{MPa}$、$a=5\\,\\mathrm{mm}$ 算出 $K=28.1\\,\\mathrm{MPa\\sqrt{m}}$、塑性区 1.0 mm 与临界裂纹 15.9 mm，并给出小范围屈服的判据。"
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
  - "断裂与裂纹"
  - "物理建模与适用边界"
  - "应力强度因子"
  - "J 积分"
seo:
  title: "断裂与裂纹：物理建模与适用边界"
  description: "断裂参数的边界由塑性区尺寸与裂纹长度之比决定。本文给出应力强度因子 K=Yσ√(πa)、J 积分与 CTOD 的换算，由 σ=200 MPa、a=5 mm 算出 K=28.1 MPa√m、塑性区 1.0 mm 与临界裂纹 15.9 mm，并给出小范围屈服的判据。"
  keywords:
    - "断裂与裂纹"
    - "物理建模与适用边界"
    - "应力强度因子"
    - "J 积分"
    - "小范围屈服"
---

# 断裂与裂纹：物理建模与适用边界

选择线弹性断裂力学（LEFM）、J 积分还是黏聚区模型，取决于塑性区尺寸与裂纹长度之比，而不是材料是不是金属。比值小，$K$ 是唯一的控制参数；比值大，必须用弹塑性参数。本文给出 $K$、$J$、CTOD 三者的换算关系与适用判据，用一个含边裂纹的板完成从 $K$ 到临界裂纹尺寸的可核对计算，并说明裂纹尖端网格的处理要求。

## 应力强度因子与 J 积分

线弹性断裂力学用裂纹尖端应力场的奇异强度 $K$ 描述：

$$
K=Y\,\sigma\sqrt{\pi a}
$$

$Y$ 是几何修正因子（无限大板中心裂纹 $Y=1$，单边裂纹 $Y\approx1.12$，三点弯 $Y\approx1.0\sim1.2$），$\sigma$ 是远场应力，$a$ 是裂纹长度。断裂判据为 $K\ge K_{IC}$，$K_{IC}$ 是平面应变断裂韧度。当塑性区不可忽略时，用路径无关的 J 积分

$$
J=\int_{\Gamma}\left(W\,\mathrm dy-\mathbf T\cdot\frac{\partial\mathbf u}{\partial x}\,\mathrm ds\right)
$$

$\Gamma$ 是环绕裂纹尖端的任意路径，$W$ 是应变能密度，$\mathbf T$ 是路径上的面力。J 积分对小变形弹塑性材料成立，并与 $K$ 在线弹性下有换算关系

$$
J=\frac{K^{2}}{E'},\qquad E'=\begin{cases}E & \text{平面应力}\\ \dfrac{E}{1-\nu^{2}} & \text{平面应变}\end{cases}
$$

裂纹张开位移（CTOD）$\delta=J/(m\,\sigma_y)$，$m$ 取 $1.0\sim2.0$，是工程上更易测量的参量。

## 一次可核对的裂纹评估

取含单边裂纹的钢板，远场应力 $\sigma=200\,\mathrm{MPa}$，裂纹长度 $a=5.0\,\mathrm{mm}$，几何因子 $Y=1.12$，$E=210\,\mathrm{GPa}$，$\nu=0.3$，$\sigma_y=355\,\mathrm{MPa}$，材料 $K_{IC}=50\,\mathrm{MPa\sqrt{m}}$。

$$
K=1.12\times200\times10^{6}\times\sqrt{\pi\times0.005}=1.12\times200\times10^{6}\times0.1253=2.81\times10^{7}\,\mathrm{Pa\sqrt{m}}=28.1\,\mathrm{MPa\sqrt{m}}
$$

因 $28.1<50$，当前裂纹不扩展。平面应变下 $E'=210\times10^{9}/(1-0.09)=2.31\times10^{11}\,\mathrm{Pa}$，J 积分

$$
J=\frac{K^{2}}{E'}=\frac{(2.81\times10^{7})^{2}}{2.31\times10^{11}}=3.42\times10^{3}\,\mathrm{J/m^{2}}
$$

平面应力塑性区尺寸 $r_p=(1/2\pi)(K/\sigma_y)^{2}=(1/6.283)\times(28.1/355)^{2}=9.95\times10^{-4}\,\mathrm{m}=1.0\,\mathrm{mm}$。小范围屈服要求 $r_p<a/10=0.5\,\mathrm{mm}$，本例 1.0 mm 超过该限，严格说应改用 J 积分或弹塑性分析，而不是直接用 $K_{IC}$ 判据。反算临界裂纹尺寸：

$$
a_c=\frac{1}{\pi}\left(\frac{K_{IC}}{Y\sigma}\right)^{2}=\frac{1}{\pi}\left(\frac{50\times10^{6}}{1.12\times200\times10^{6}}\right)^{2}=1.59\times10^{-2}\,\mathrm{m}=15.9\,\mathrm{mm}
$$

即该应力下裂纹从 5.0 mm 扩展到 15.9 mm 才失稳，剩余裕度约 3.2 倍。

## 裂纹尖端的建模要求

裂纹尖端应力奇异，网格必须处理：四分之一节点奇异单元（把中间节点移到 1/4 边长处）可重现 $1/\sqrt{r}$ 奇异；J 积分需要环绕尖端的多层单元环，第一环半径约 $a/10$，且积分路径应落在塑性区之外的 $K$ 主导区。三维裂纹用 $J$ 积分沿裂纹前沿逐点计算，取最大值作为控制值。黏聚区模型适合无初始裂纹的界面与复合材料分层，其界面强度 $\sigma_{\max}$ 与断裂能 $G_c$ 需独立标定，网格尺寸应小于黏聚区长度。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| J 积分随路径剧烈变化 | 积分路径落在塑性区内或网格过粗 | 输出多环 J 值，检查路径无关性 |
| 计算的 $K$ 与手册差 20% 以上 | 几何因子 $Y$ 或裂纹长度定义不符 | 用标准试样（CT、SENB）标定 $Y$ |
| 塑性区尺寸接近裂纹长度仍用 $K_{IC}$ | 未检查小范围屈服条件 | 计算 $r_p$ 并与 $a/10$ 比较 |
| 裂纹不沿预期路径扩展 | 未考虑混合模式或材料各向异性 | 计算 $K_I$、$K_{II}$ 并检查方向准则 |
| 分层模拟的载荷-位移曲线过于脆 | 黏聚区网格过粗、断裂能偏小 | 细化界面网格并重新标定 $G_c$ |
| 尖端应力不收敛于有限值 | 未用奇异单元或节点未移到 1/4 处 | 检查尖端单元中间节点位置 |

## 围线积分设置

Abaqus 中定义裂纹与围线积分的片段：

```
*STEP
*STATIC
*CONTOUR INTEGRAL, CRACK TIP NODES, CONTOURS=8, TYPE=J
CRACKTIP_NODE,
*SEAM CRACK
CRACKSET
*OUTPUT, FIELD
*CONTOUR INTEGRAL OUTPUT
J, K
```

`CONTOURS=8` 表示输出 8 层环的 J 积分用于路径无关性检查；`TYPE=J` 对应弹塑性，线弹性问题可改为 `TYPE=K`。

## 参考文献

1. Anderson, T.L. *Fracture Mechanics: Fundamentals and Applications*, 4th ed. CRC Press, 2017.
2. Rice, J.R. "A path independent integral and the approximate analysis of strain concentration by notches and cracks." *Journal of Applied Mechanics*, 35(2), 379–386, 1968.
3. Irwin, G.R. "Analysis of stresses and strains near the end of a crack traversing a plate." *Journal of Applied Mechanics*, 24, 361–364, 1957.
4. Broek, D. *Elementary Engineering Fracture Mechanics*, 4th ed. Martinus Nijhoff, 1986.
5. Williams, M.L. "On the stress distribution at the base of a stationary crack." *Journal of Applied Mechanics*, 24, 109–114, 1957.
6. ASTM E1820-20. *Standard Test Method for Measurement of Fracture Toughness*. ASTM International, 2020.
