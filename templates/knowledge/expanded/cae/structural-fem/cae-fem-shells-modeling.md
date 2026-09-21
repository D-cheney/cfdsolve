---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-shells-modeling
title: "壳单元：物理建模与适用边界"
summary: "壳单元的边界是厚度与曲率半径之比，以及横向剪切是否可忽略。本文给出薄板弯曲刚度 $D=Et^{3}/[12(1-\\nu^{2})]$、Mindlin 剪切修正 $\\kappa=5/6$，由 5 mm 厚钢板算出 $D=2404\\,\\mathrm{N\\cdot m}$ 与 0.528 mm 挠度，并给出壳-实体过渡判据。"
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
  - "壳单元"
  - "物理建模与适用边界"
  - "Mindlin-Reissner"
  - "横向剪切"
seo:
  title: "壳单元：物理建模与适用边界"
  description: "壳单元的边界是厚度与曲率半径之比，以及横向剪切是否可忽略。本文给出薄板弯曲刚度 D=Et³/[12(1-ν²)]、Mindlin 剪切修正 κ=5/6，由 5 mm 厚钢板算出 D=2404 N·m 与 0.528 mm 挠度，并给出壳-实体过渡判据。"
  keywords:
    - "壳单元"
    - "物理建模与适用边界"
    - "Mindlin-Reissner"
    - "横向剪切"
    - "薄板弯曲"
---

# 壳单元：物理建模与适用边界

壳单元把三维问题降到中面加一个厚度参数，代价是引入 Kirchhoff–Love 或 Mindlin–Reissner 两套运动学假设。选错假设的后果很直接：薄壳用忽略剪切的公式没问题，厚壳或夹层结构忽略剪切则会低估挠度。本文给出两类壳理论的适用阈值、弯曲刚度与剪切修正系数的具体取值，用一个 5 mm 厚钢板的挠度计算说明薄厚判据，并说明壳与实体的过渡区怎么建。

## 两类壳理论与适用阈值

Kirchhoff–Love 薄壳假设中面法线保持垂直于中面，横向剪切应变为零，自由度少但要求 $C^{1}$ 连续，适合 $R/h>20$ 且 $a/h>20$ 的薄壁结构。Mindlin–Reissner 壳允许法线转动与中面分离，横向剪切应变不为零，只需 $C^{0}$ 连续，可退化为厚壳，但需引入剪切修正系数避免过刚。

薄板弯曲刚度与 Mindlin 剪切修正为

$$
D=\frac{Et^{3}}{12(1-\nu^{2})},\qquad \kappa=\frac{5}{6}
$$

$t$ 是厚度，$\kappa=5/6=0.8333$ 是矩形截面的默认值（圆管等截面取 0.9）。工程判据：$a/h>20$ 用薄壳，$10<a/h<20$ 用 Mindlin 壳，$a/h<10$ 应改用实体单元，因为厚度方向应力梯度已不可忽略。

## 一次可核对的薄板挠度

取四边简支方形钢板，边长 $a=0.5\,\mathrm m$，厚度 $t=5.0\,\mathrm{mm}$，$E=210\,\mathrm{GPa}$，$\nu=0.3$，均布压力 $q=5.0\,\mathrm{kPa}$。弯曲刚度

$$
D=\frac{210\times10^{9}\times(0.005)^{3}}{12\times(1-0.09)}=\frac{26250}{10.92}=2.404\times10^{3}\,\mathrm{N\cdot m}
$$

跨厚比 $a/t=500/5=100>20$，属薄板，可用 Kirchhoff–Love 解。四边简支方形板在均布载荷下的中心挠度

$$
w_{\max}=0.00406\,\frac{q\,a^{4}}{D}=0.00406\times\frac{5000\times(0.5)^{4}}{2404}=5.28\times10^{-4}\,\mathrm{m}=0.528\,\mathrm{mm}
$$

$w/t=0.528/5.0=10.6\%$，已接近小变形假设的上限（通常要求 $w/t<20\%$，但线性理论在 10% 以上开始出现偏差），因此该算例可作线性壳的验收基准，但若压力再翻倍应改用几何非线性。板中最大弯曲应力 $\sigma=6M/t^{2}$，$M\approx0.0479qa^{2}=0.0479\times5000\times0.25=59.9\,\mathrm{N\cdot m/m}$，$\sigma=6\times59.9/0.005^{2}=14.4\,\mathrm{MPa}$，远低于屈服，验证弹性假设。

## 壳单元选择与建模要点

常见单元：S4（4 节点完全积分）、S4R（减缩积分）、S8R（8 节点减缩）、S3（三角形）。S4R 是通用首选，减缩积分消除剪切锁死，但需沙漏控制；S3 用于过渡与复杂几何，但过刚，应避免在关键区大量使用。壳的 5 个或 6 个自由度中，平面内转动（drilling DOF）在共面单元上无刚度，需要人为约束或稳定项，否则整体刚度矩阵奇异。

壳与实体连接时，若实体在厚度方向只有一层，壳的中面节点与实体节点不在同一位置，需用壳-实体耦合或把壳延伸一段与实体搭接；直接共用节点会产生局部人工刚度。复合材料壳用铺层定义，层数超过 20 层时建议改用连续壳或实体单元以捕捉层间应力。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 厚壳挠度被低估 | 用 Kirchhoff 薄壳忽略了横向剪切 | 计算 $a/t$，小于 20 时换 Mindlin 壳 |
| 刚度矩阵奇异、无法求解 | drilling 自由度无刚度 | 检查是否出现零特征值，加稳定项或约束 |
| 壳-实体连接处应力异常 | 中面节点与实体节点不匹配 | 用耦合约束替代共用节点，检查连接处应力 |
| 减缩积分出现沙漏 | S4R 未加沙漏控制 | 输出沙漏能与应变能之比，应小于 5% |
| 曲壳结果对网格方向敏感 | 网格未沿主曲率 | 旋转网格后复算，比较峰值 |
| 分层或层间应力缺失 | 单层壳无法表示层间应力 | 改连续壳或实体加黏聚单元 |

## 壳截面与铺层设置

Abaqus 中壳单元与复合材料铺层的定义片段：

```
*ELEMENT, TYPE=S4R, ELSET=PANEL
*SHELL SECTION, ELSET=PANEL, MATERIAL=STEEL, CONTROLS=PANELHG
0.005,                      # 厚度 5 mm
*SECTION CONTROLS, NAME=PANELHG, HOURGLASS=ENHANCED
*ELEMENT, TYPE=S8R, ELSET=CURVED
*SHELL SECTION, ELSET=CURVED, COMPOSITE, STACK DIRECTION=3
0.125, 3, PLY0,    0.0
0.125, 3, PLY45,  45.0
0.125, 3, PLY45, -45.0
0.125, 3, PLY90,  90.0
```

`SHELL SECTION` 的厚度是必须输入的几何参数；`COMPOSITE` 关键字按层列出厚度、积分点数与铺层角。

## 参考文献

1. Timoshenko, S.P., Woinowsky-Krieger, S. *Theory of Plates and Shells*, 2nd ed. McGraw-Hill, 1959.
2. Mindlin, R.D. "Influence of rotary inertia and shear on flexural motions of isotropic, elastic plates." *Journal of Applied Mechanics*, 18, 31–38, 1951.
3. Reissner, E. "The effect of transverse shear deformation on the bending of elastic plates." *Journal of Applied Mechanics*, 12, A69–A77, 1945.
4. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
5. Reddy, J.N. *Theory and Analysis of Elastic Plates and Shells*, 2nd ed. CRC Press, 2006.
6. Zienkiewicz, O.C., Taylor, R.L., Zhu, J.Z. *The Finite Element Method: Its Basis and Fundamentals*, 7th ed. Butterworth-Heinemann, 2013.
