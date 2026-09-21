---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-buckling-modeling
title: "线性与非线性屈曲：物理建模与适用边界"
summary: "特征值屈曲给出上限，真实承载能力由缺陷与后屈曲路径决定。本文由 Euler 公式算出 $P_{cr}=27.6\\,\\mathrm{kN}$、$\\sigma_{cr}=69.1\\,\\mathrm{MPa}$ 与长细比 173，给出弹性屈曲适用范围、缺陷幅值取值与 Riks 法的触发判据。"
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
  - "线性与非线性屈曲"
  - "物理建模与适用边界"
  - "Euler 临界载荷"
  - "Riks 法"
seo:
  title: "线性与非线性屈曲：物理建模与适用边界"
  description: "特征值屈曲给出上限，真实承载能力由缺陷与后屈曲路径决定。本文由 Euler 公式算出 Pcr=27.6 kN、σcr=69.1 MPa 与长细比 173，给出弹性屈曲适用范围、缺陷幅值取值与 Riks 法的触发判据。"
  keywords:
    - "线性与非线性屈曲"
    - "物理建模与适用边界"
    - "Euler 临界载荷"
    - "Riks 法"
    - "缺陷敏感性"
---

# 线性与非线性屈曲：物理建模与适用边界

特征值屈曲给出的是理想直杆、理想几何下的分岔载荷，它是承载能力的上限而非设计值。真实构件的临界载荷受初始缺陷、载荷偏心与后屈曲路径支配：对缺陷敏感的壳体，实测值可能只有特征值的 20%～50%。本文给出 Euler 公式与特征值问题的关系、弹性屈曲的长细比适用范围，并用一个可手算的压杆算例说明从线性到非线性分析的切换判据。

## 特征值屈曲与 Euler 公式

线性（特征值）屈曲在几何刚度上做分岔分析：

$$
\left(\mathbf K+\lambda\,\mathbf K_{\sigma}\right)\boldsymbol\phi=\mathbf 0
$$

$\mathbf K$ 是弹性刚度，$\mathbf K_{\sigma}$ 是由参考载荷产生的几何刚度，$\lambda$ 是最小特征值，即临界载荷因子。对等截面压杆，该问题的解析解就是 Euler 公式

$$
P_{cr}=\frac{\pi^{2}EI}{(KL)^{2}}
$$

$K$ 为有效长度系数：两端铰支 $K=1$，两端固支 $K=0.5$，一端固支一端自由 $K=2$，一端固支一端铰支 $K=0.7$。$K$ 的取值对结果影响是平方关系，把 $K=1$ 误取为 0.5 会让承载能力高估 4 倍，这是边界条件设置中最贵的一类错误。

## 一次可核对的压杆算例

取方形截面钢压杆，$L=1.0\,\mathrm m$，边长 20 mm，两端铰支（$K=1$），$E=210\,\mathrm{GPa}$，$\sigma_y=355\,\mathrm{MPa}$。截面 $A=4.0\times10^{-4}\,\mathrm{m^{2}}$，$I=1.333\times10^{-8}\,\mathrm{m^{4}}$，回转半径

$$
r=\sqrt{\frac{I}{A}}=\sqrt{\frac{1.333\times10^{-8}}{4.0\times10^{-4}}}=5.77\times10^{-3}\,\mathrm m=5.77\,\mathrm{mm}
$$

Euler 临界载荷与临界应力

$$
P_{cr}=\frac{\pi^{2}\times210\times10^{9}\times1.333\times10^{-8}}{(1.0)^{2}}=2.763\times10^{4}\,\mathrm{N}=27.6\,\mathrm{kN}
$$

$$
\sigma_{cr}=\frac{P_{cr}}{A}=\frac{2.763\times10^{4}}{4.0\times10^{-4}}=69.1\,\mathrm{MPa}
$$

长细比 $\lambda=KL/r=1000/5.77=173.2$。弹性屈曲的适用条件是 $\lambda>\lambda_p=\pi\sqrt{E/\sigma_y}=\pi\sqrt{210000/355}=\pi\times24.32=76.4$。本例 173 > 76.4，说明屈曲发生在弹性范围（69.1 MPa < 355 MPa），Euler 公式有效。若杆长缩短到 $L=0.3\,\mathrm m$，则 $\lambda=52<76.4$，屈曲应力会超过比例极限，必须改用切线模量理论或弹塑性屈曲分析。

## 从特征值到非线性：缺陷与后屈曲

特征值分析只回答"分岔在多大载荷发生"，不回答"发生之后怎样"。要得到真实承载能力，需做带缺陷的非线性分析。初始缺陷幅值按结构类型取值：梁与柱取 $L/1000$ 或 $L/500$，加筋板取 $L/1000$，薄壳取 $0.1t\sim1.0t$（$t$ 为壁厚），缺陷形状通常取一阶屈曲模态。缺陷敏感的壳体，非线性临界载荷可能只有特征值的 30%～50%；对缺陷不敏感的柱，两者差别在 5% 以内。

后屈曲路径分为稳定与不稳定两类：柱与加筋板通常有稳定的后屈曲承载，载荷超过 $P_{cr}$ 后仍能继续承载；完整薄壳与受轴压的圆柱壳则可能突弹失稳（snap-through），需用弧长法（Riks）跟踪，普通载荷控制法在极限点附近会因切线刚度奇异而失败。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 特征值远大于实测承载 | 忽略缺陷敏感性 | 加 $L/1000$ 一阶模态缺陷做非线性复算 |
| 载荷控制法在极限点发散 | 切线刚度在极限点奇异 | 换 Riks 弧长法，跟踪负斜率段 |
| 临界载荷高估数倍 | 有效长度系数 $K$ 取错 | 按支承条件重定 $K$，核对 $K^{2}$ 影响 |
| 屈曲应力超过比例极限仍用 Euler | 长细比小于 $\lambda_p$ | 计算 $\lambda=KL/r$ 并与 76.4 比较 |
| 壳结构结果对网格极敏感 | 缺陷形状未按一阶模态施加 | 用一阶特征模态作缺陷，加密网格复算 |
| 加筋板局部与整体屈曲耦合被漏掉 | 只算了整体模态 | 提取更多阶模态，检查是否出现局部模态 |

## 特征值与 Riks 分析设置

Abaqus 中先做特征值屈曲，再引入缺陷做弧长法：

```
*STEP
*BUCKLE
4,                          # 提取前 4 阶屈曲模态
*CLOAD
TOP, 2, -1.0                # 单位参考载荷
*END STEP
*STEP, NLGEOM=YES
*STATIC, RIKS
0.01, 1.0, , , , TOP, 2, -1.0
*IMPERFECTION, FILE=buckle_job, STEP=1
1, 0.001                    # 一阶模态，幅值 L/1000 = 1 mm
```

`*IMPERFECTION` 把一阶模态按 0.001 m 幅值叠加到几何上，Riks 步的弧长半径 0.01 用于平稳跨越极限点。

## 参考文献

1. Timoshenko, S.P., Gere, J.M. *Theory of Elastic Stability*, 2nd ed. McGraw-Hill, 1961.
2. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
3. Crisfield, M.A. *Non-linear Finite Element Analysis of Solids and Structures*, Vol. 1. Wiley, 1991.
4. Brush, D.O., Almroth, B.O. *Buckling of Bars, Plates and Shells*. McGraw-Hill, 1975.
5. Zienkiewicz, O.C., Taylor, R.L., Zhu, J.Z. *The Finite Element Method: Its Basis and Fundamentals*, 7th ed. Butterworth-Heinemann, 2013.
6. Riks, E. "An incremental approach to the solution of snapping and buckling problems." *International Journal of Solids and Structures*, 15(7), 529–551, 1979.
