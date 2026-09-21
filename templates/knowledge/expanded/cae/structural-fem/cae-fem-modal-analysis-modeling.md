---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-modal-analysis-modeling
title: "模态分析：物理建模与适用边界"
summary: "模态分析的边界是线性、无阻尼、边界条件确定。本文给出特征值问题与悬臂梁一阶频率解析式，用 1 m 长 20 mm 方钢算出 $f_1=16.71\\,\\mathrm{Hz}$、$f_2/f_1=6.27$，并说明质量参与、刚体模态与预应力的影响。"
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
  - "模态分析"
  - "物理建模与适用边界"
  - "特征值问题"
  - "质量参与系数"
seo:
  title: "模态分析：物理建模与适用边界"
  description: "模态分析的边界是线性、无阻尼、边界条件确定。本文给出特征值问题与悬臂梁一阶频率解析式，用 1 m 长 20 mm 方钢算出 f1=16.71 Hz、f2/f1=6.27，并说明质量参与、刚体模态与预应力的影响。"
  keywords:
    - "模态分析"
    - "物理建模与适用边界"
    - "特征值问题"
    - "质量参与系数"
    - "刚体模态"
---

# 模态分析：物理建模与适用边界

模态分析给出结构在无外载、无阻尼下的固有频率与振型，它的三个前提是线性、无阻尼、边界条件确定。只要结构进入接触、塑性或大变形，模态结果就失去严格意义，只能作为参考。本文给出特征值问题的形式与悬臂梁频率的解析式，用一个可手算的算例核对软件结果，并说明质量参与系数与刚体模态这两个最常被误读的输出。

## 特征值问题与振型

无阻尼自由振动 $\mathbf M\ddot{\mathbf u}+\mathbf K\mathbf u=\mathbf 0$，设 $\mathbf u=\boldsymbol\phi e^{i\omega t}$ 得广义特征值问题

$$
\mathbf K\boldsymbol\phi=\omega^{2}\mathbf M\boldsymbol\phi
$$

$\omega^{2}$ 是特征值，$\boldsymbol\phi$ 是振型。$\mathbf K$ 对称半正定、$\mathbf M$ 对称正定，因此特征值为实数非负；振型关于 $\mathbf M$ 与 $\mathbf K$ 正交，$\boldsymbol\phi_i^{T}\mathbf M\boldsymbol\phi_j=0$（$i\ne j$）。正是这条正交性让模态叠加法能把耦合的 $n$ 自由度系统解耦成 $n$ 个单自由度方程，也是线性瞬态与响应谱分析的基础。边界条件通过 $\mathbf K$ 进入：约束越少，固有频率越低，自由-自由结构出现 6 个零特征值。

## 一次可核对的悬臂梁频率

对等截面悬臂梁，一阶弯曲频率有闭式解

$$
f_1=\frac{\beta_1^{2}}{2\pi}\sqrt{\frac{EI}{\rho A L^{4}}},\qquad \beta_1L=1.8751
$$

取方形截面钢梁，$L=1.0\,\mathrm m$，边长 20 mm，$E=210\,\mathrm{GPa}$，$\rho=7850\,\mathrm{kg/m^{3}}$。截面参数 $A=4.0\times10^{-4}\,\mathrm{m^{2}}$，$I=1.333\times10^{-8}\,\mathrm{m^{4}}$。于是

$$
EI=210\times10^{9}\times1.333\times10^{-8}=2800\,\mathrm{N\cdot m^{2}},\qquad \rho A=3.14\,\mathrm{kg/m}
$$

$$
f_1=\frac{3.516}{2\pi}\sqrt{\frac{2800}{3.14\times1.0}}=0.5596\times29.86=16.71\,\mathrm{Hz}
$$

二阶模态 $\beta_2^{2}=22.03$，得 $f_2=22.03\times29.86/6.283=104.7\,\mathrm{Hz}$，比值 $f_2/f_1=6.27$，与等截面悬臂梁的理论比值 6.267 一致。这个 16.71 Hz 可作为有限元模型的验收基准：一阶频率与它相差超过 5% 时，应检查约束是否过刚、单元是否锁死或质量矩阵是否用了不一致的集中化。

## 质量参与系数与刚体模态

模态结果里最容易被误读的两个量。第一是质量参与系数，它衡量某阶模态在特定方向上的有效质量占比。对上述悬臂梁，一阶弯曲模态在横向的参与系数约 61%，前 5 阶累计超过 90%；若做响应谱或地震分析，累计参与质量需达到 90% 以上才能截断模态，否则漏掉的是真实响应。第二是刚体模态：自由-自由三维实体有 6 个零特征值（3 平移 + 3 转动），壳与梁模型视自由度而定；若约束不足，求解器会给出接近零的频率，这不是结构柔，而是欠约束。

预应力会改变模态：受拉结构频率上升（应力刚化），受压接近屈曲时频率下降，到屈曲载荷时一阶频率趋于零。旋转结构还有离心刚化与科氏效应，需用旋转坐标系下的复特征值求解。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 出现接近零的频率 | 结构欠约束，存在刚体模态 | 数零特征值个数，与理论刚体自由度比较 |
| 一阶频率比解析值低 10% 以上 | 质量矩阵集中化不当或单元过柔 | 用 16.71 Hz 对照，换一致质量矩阵复算 |
| 一阶频率比解析值高 | 单元锁死或约束过刚 | 加密网格并检查单元类型 |
| 模态叠加法结果偏离直接积分 | 模态截断不足 | 检查累计质量参与是否达 90% |
| 受压结构频率随载荷下降异常快 | 接近屈曲，刚度矩阵趋于奇异 | 施加预应力后重算特征值，观察频率趋势 |
| 同一结构两次求解频率不一致 | 约束或连接定义不同 | 核对边界条件与连接单元刚度 |

## 特征值提取设置

Abaqus 中用 Lanczos 法提取前若干阶模态的典型设置：

```
*STEP
*FREQUENCY, EIGENSOLVER=LANCZOS, NORMALIZATION=MASS
10,                         # 提取前 10 阶
*BOUNDARY
FIXED_END, 1, 6             # 固定端约束全部 6 个自由度
*OUTPUT, FIELD
*NODE FILE
U,                        # 输出振型
*OUTPUT, HISTORY
*MODAL FILE
```

`NORMALIZATION=MASS` 使振型关于质量矩阵归一，便于计算参与系数；提取阶数应按累计质量参与 90% 的要求确定，而不是固定取 10 阶。

## 参考文献

1. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
2. Hughes, T.J.R. *The Finite Element Method: Linear Static and Dynamic Finite Element Analysis*. Dover, 2000.
3. Zienkiewicz, O.C., Taylor, R.L., Zhu, J.Z. *The Finite Element Method: Its Basis and Fundamentals*, 7th ed. Butterworth-Heinemann, 2013.
4. Ewins, D.J. *Modal Testing: Theory, Practice and Application*, 2nd ed. Research Studies Press, 2000.
5. Chopra, A.K. *Dynamics of Structures: Theory and Applications to Earthquake Engineering*, 4th ed. Prentice Hall, 2011.
6. Clough, R.W., Penzien, J. *Dynamics of Structures*, 2nd ed. McGraw-Hill, 1993.
