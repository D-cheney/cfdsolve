---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-beams-modeling
title: "梁单元：物理建模与适用边界"
summary: "梁单元的边界是长细比：Euler–Bernoulli 忽略剪切，Timoshenko 保留剪切。本文由 $\\delta=\\delta_{EB}+FL/(\\kappa GA)$ 推出剪切占比 $3(1+\\nu)h^{2}/(5L^{2})$，算出 $L/h=20$ 时剪切只占 0.195%、$L/h=2$ 时升到 19.5%，给出选用阈值与截面/扭转建模要点。"
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
  - "梁单元"
  - "物理建模与适用边界"
  - "Timoshenko 梁"
  - "剪切修正"
seo:
  title: "梁单元：物理建模与适用边界"
  description: "梁单元的边界是长细比：Euler–Bernoulli 忽略剪切，Timoshenko 保留剪切。本文由 δ=δEB+FL/(κGA) 推出剪切占比 3(1+ν)h²/(5L²)，算出 L/h=20 时剪切只占 0.195%、L/h=2 时升到 19.5%，给出选用阈值与截面/扭转建模要点。"
  keywords:
    - "梁单元"
    - "物理建模与适用边界"
    - "Timoshenko 梁"
    - "剪切修正"
    - "长细比"
---

# 梁单元：物理建模与适用边界

梁单元的选择只由一个问题决定：横向剪切变形是否可忽略。Euler–Bernoulli 梁假设截面保持垂直于变形后的轴线，忽略剪切；Timoshenko 梁允许截面转动独立于轴线斜率，保留剪切。前者细长构件够用，后者在短粗梁、夹层梁和高频振动中不可省。本文给出两种理论挠度的差值表达式、剪切修正系数取值，并把剪切占比算成一个只与长细比有关的可核对数字。

## 两种梁理论与剪切占比

Euler–Bernoulli 梁与 Timoshenko 梁的端部挠度（悬臂、端部集中力 $F$）分别为

$$
\delta_{EB}=\frac{FL^{3}}{3EI},\qquad \delta_{T}=\frac{FL^{3}}{3EI}+\frac{FL}{\kappa GA}
$$

$\kappa$ 是剪切修正系数，矩形截面 $\kappa=5/6=0.8333$，圆截面 0.9，薄壁开口截面需按实际剪流计算。剪切项与弯曲项之比

$$
\frac{\delta_{s}}{\delta_{EB}}=\frac{3EI}{\kappa GA L^{2}}=\frac{3(1+\nu)}{5}\left(\frac{h}{L}\right)^{2}
$$

最后一步代入矩形截面 $I/A=h^{2}/12$、$G=E/[2(1+\nu)]$ 与 $\kappa=5/6$ 得到，说明剪切占比只与泊松比和长细比有关。取 $\nu=0.3$，系数 $3(1+\nu)/5=0.78$：$L/h=20$ 时占比 $0.78\times0.0025=0.195\%$；$L/h=10$ 时为 0.78%；$L/h=5$ 时 3.12%；$L/h=2$ 时 19.5%。这给出清晰阈值：$L/h>10$ 用 Euler–Bernoulli 误差小于 1%，$L/h<5$ 必须用 Timoshenko。

## 一次可核对的挠度分解

取矩形截面钢悬臂梁，$L=1.0\,\mathrm m$，$h=0.05\,\mathrm m$（即 $L/h=20$），$b=0.02\,\mathrm m$，$E=210\,\mathrm{GPa}$，$\nu=0.3$，端部力 $F=1000\,\mathrm N$。截面参数

$$
I=\frac{bh^{3}}{12}=\frac{0.02\times(0.05)^{3}}{12}=2.083\times10^{-7}\,\mathrm{m^{4}},\qquad EI=4.375\times10^{4}\,\mathrm{N\cdot m^{2}}
$$

弯曲挠度

$$
\delta_{EB}=\frac{1000\times1.0^{3}}{3\times4.375\times10^{4}}=7.62\times10^{-3}\,\mathrm{m}=7.62\,\mathrm{mm}
$$

剪切项：$G=E/[2(1+\nu)]=80.8\,\mathrm{GPa}$，$A=bh=1.0\times10^{-3}\,\mathrm{m^{2}}$，$\kappa GA=6.73\times10^{7}\,\mathrm{N}$，

$$
\delta_{s}=\frac{1000\times1.0}{6.73\times10^{7}}=1.49\times10^{-5}\,\mathrm{m}=0.0149\,\mathrm{mm}
$$

占比 $0.0149/7.62=0.195\%$，与上面公式算出的 0.195% 完全一致。这个分解说明：对该细长梁，用 Euler–Bernoulli 单元与 Timoshenko 单元的差别只有 0.015 mm，可以忽略；若把梁长缩到 $L=0.1\,\mathrm m$（$L/h=2$），剪切项变为 $1.49\times10^{-3}\,\mathrm m=1.49\,\mathrm{mm}$，占比升到 19.5%，两者结果相差近 20%，此时必须用 Timoshenko 单元。

## 截面、扭转与连接

一般截面梁用截面积分点定义，软件在每个积分点计算应力并沿截面求和。开口薄壁截面的扭转刚度包含翘曲贡献，纯 Saint-Venant 扭转会低估刚度，需启用翘曲自由度（Abaqus 的 `WARPING` 或 7 自由度梁）。闭口截面翘曲可忽略。梁与实体连接时，若把梁端节点直接焊到实体表面，会引入人工局部刚度；应使用梁-实体耦合或把梁延伸入实体一段（约 1～2 倍截面高度）。端部释放（release）用于模拟铰接，但过量释放会产生机构，需检查求解器是否报出刚体模态。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 短粗梁挠度偏小 | 用 Euler–Bernoulli 忽略剪切 | 计算 $L/h$，小于 5 时换 Timoshenko |
| 开口截面扭转刚度偏小 | 忽略翘曲约束 | 启用翘曲自由度后比较扭转角 |
| 梁-实体连接处出现应力尖峰 | 端节点直接连接到实体表面 | 用耦合约束或延伸梁段后复算 |
| 求解器报刚体模态 | 端部释放过多形成机构 | 检查释放组合，确认约束数量 |
| 高频模态频率偏低 | 忽略转动惯量与剪切 | 用 Timoshenko 梁并计入转动惯量 |
| 结果随截面积分点数变化大 | 截面积分点不足 | 增加截面积分点至结果稳定 |

## 梁单元定义

Abaqus 中 Timoshenko 梁（B31）与 Euler–Bernoulli 梁（B33）的定义：

```
*ELEMENT, TYPE=B31, ELSET=FRAME        # 线性 Timoshenko 梁
*BEAM SECTION, ELSET=FRAME, MATERIAL=STEEL, SECTION=RECT
0.02, 0.05              # b=20 mm, h=50 mm
0., 0., -1.             # 截面局部 1 轴方向
*ELEMENT, TYPE=B33, ELSET=SLENDER       # 三次 Euler-Bernoulli 梁
*BEAM GENERAL SECTION, ELSET=SLENDER, SECTION=I
2.083e-7, 1.0e-3, 2.083e-7, 0.02, 0.05
```

`B31` 为线性 Timoshenko 单元，`B33` 为三次 Euler–Bernoulli 单元；`BEAM GENERAL SECTION` 直接给惯性矩，适合自定义截面。

## 参考文献

1. Timoshenko, S.P. "On the correction for shear of the differential equation for transverse vibrations of prismatic bars." *Philosophical Magazine*, 41(245), 744–746, 1921.
2. Timoshenko, S.P., Gere, J.M. *Mechanics of Materials*. Van Nostrand Reinhold, 1972.
3. Przemieniecki, J.S. *Theory of Matrix Structural Analysis*. McGraw-Hill, 1968.
4. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
5. Hughes, T.J.R. *The Finite Element Method: Linear Static and Dynamic Finite Element Analysis*. Dover, 2000.
6. Reddy, J.N. *Mechanics of Laminated Composite Plates and Shells: Theory and Analysis*. CRC Press, 2004.
