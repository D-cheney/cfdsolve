---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-locking-modeling
title: "剪切与体积锁死：物理建模与适用边界"
summary: "锁死不是网格问题而是形函数与积分不匹配。本文用体积模量比 $K/E=1/[3(1-2\\nu)]$ 定出体积锁死的 $\\nu$ 门槛，给出剪切锁死的长宽比判据与选择/减缩积分的适用边界，并附沙漏能诊断。"
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
  - "剪切与体积锁死"
  - "物理建模与适用边界"
  - "选择积分"
  - "沙漏控制"
seo:
  title: "剪切与体积锁死：物理建模与适用边界"
  description: "锁死不是网格问题而是形函数与积分不匹配。本文用体积模量比 K/E=1/[3(1-2ν)] 定出体积锁死的 ν 门槛，给出剪切锁死的长宽比判据与选择/减缩积分的适用边界，并附沙漏能诊断。"
  keywords:
    - "剪切与体积锁死"
    - "物理建模与适用边界"
    - "选择积分"
    - "体积模量"
    - "沙漏模式"
---

# 剪切与体积锁死：物理建模与适用边界

锁死的表现是"位移偏小、结构偏刚"，但它既不是网格太粗，也不是材料太硬，而是形函数能表达的应变模式与积分点要求相互矛盾：在积分点上被强制为零的应变，在物理上本应存在。本文分别给出剪切锁死与体积锁死的定量门槛、选择/减缩积分的取舍，以及用沙漏能判断是否矫枉过正的诊断方法。

## 两类锁死的机理

剪切锁死发生在弯曲主导问题。线性单元的位移场是双线性的，纯弯曲时单元内本应存在的线性变化正应变，与形函数只能给出的常值应变冲突，为了在积分点上满足零剪应变，单元被迫牺牲弯曲变形，表现为附加的寄生剪切刚度。这个寄生刚度与单元长宽比 $a$（单元边长与厚度之比）的平方成正比，$a=5$ 时它可让挠度误差超过 50%。

体积锁死发生在近不可压缩材料。体积模量与弹性模量之比为

$$
\frac{K}{E}=\frac{1}{3(1-2\nu)}
$$

$\nu=0.3$ 时该比值为 1.67，$\nu=0.45$ 时升到 3.33，$\nu=0.49$ 时为 16.7，$\nu=0.4999$ 时高达 1667。完全积分单元在每个积分点都近似强制 $\nabla\cdot\mathbf u=0$，当 $K/E$ 很大时，任何非零体积应变都会产生巨大能量，单元只能几乎零体积变形，横向膨胀被锁住。这个能量的具体形式是体积应变能的惩罚项

$$
W_{vol}=\tfrac12 K\,\varepsilon_{v}^{2}=\tfrac12 K\left(\nabla\cdot\mathbf u\right)^{2}
$$

$\varepsilon_v$ 是体积应变。$\nu\to0.5$ 时 $K$ 极大，$\varepsilon_v=10^{-4}$ 就能产生 $0.5\times16.7\times10^{9}\times10^{-8}=83.5\,\mathrm{J/m^{3}}$ 的能量密度，远高于同量级剪切变形，单元为降低总能量只能把 $\varepsilon_v$ 压到近零，于是横向膨胀被锁死。金属 $\nu\approx0.3$ 通常无此问题；橡胶类 $\nu\approx0.4999$ 则必须处理。

## 剪切锁死的判据与对策

对完全积分的线性单元，判断是否会发生剪切锁死可用长宽比阈值：弯曲主导时把单元长宽比控制在 3:1 以内可把寄生剪切误差压到 5% 以下；若长宽比必须达到 5:1 以上，应改用减缩积分或二次单元。

减缩积分的代价是沙漏。以 8 节点六面体为例，完全积分用 $2\times2\times2=8$ 个 Gauss 点，减缩积分只用 1 个点，单元刚度矩阵的秩不足以约束全部 24 个自由度，出现 6 个零能模式（沙漏模式）。判定是否失控看沙漏能：用沙漏控制后，沙漏能与总应变能之比应小于 5%；超过 10% 说明网格过粗或控制参数不足。

## 体积锁死的判据与对策

体积锁死的实用门槛是 $\nu>0.47$（对应 $K/E>7$）：此时完全积分的线性单元开始明显偏刚，$\nu>0.49$（$K/E>16.7$）时结果不可用。三条对策按推荐次序排列。

其一是选择减缩积分（SRI）：对偏量部分用完全积分点，对体积部分只用减缩点，使体积约束不逐点强制。其二是 B-bar 或 F-bar 方法：用单元平均的 $\bar{\mathbf B}$ 计算体积应变，让体积项在单元上取平均而非逐点满足。F-bar 用单元平均体积比替换逐点值：

$$
\bar J=\frac{1}{V_e}\int_{\Omega_e}\det\mathbf F\,\mathrm d\Omega
$$

把 $\bar J$ 只用于体积项、逐点 $\det\mathbf F$ 用于偏量项，即可解除逐点不可压缩约束而不损失剪切精度。其三是杂交/混合单元（如 Abaqus 的 C3D8H），把压力作为独立未知量，需满足 LBB 稳定性条件。

## 一次可核对的量级估算

取 $E=200\,\mathrm{GPa}$、$\nu=0.3$ 的钢材，由上式得 $K=200/1.67=120\,\mathrm{GPa}$，与实测约 160 GPa 同量级（差异来自上式假设 $K=2G(1+\nu)/[3(1-2\nu)]$ 的简化）。当材料换成 $\nu=0.4999$ 的橡胶（取 $E=10\,\mathrm{MPa}$）时，$K/E=1667$，即 $K=16.7\,\mathrm{GPa}$，比剪切模量 $G=E/[2(1+\nu)]=3.33\,\mathrm{MPa}$ 大 5000 倍。这个悬殊比例解释了为什么橡胶件用完全积分线性单元会算不出变形：任何 0.1% 的体积应变都会产生 $16.7\,\mathrm{GPa}\times10^{-3}=16.7\,\mathrm{MPa}$ 量级的压力，远超材料的剪切承载能力。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 细长弯曲构件挠度远小于解析值 | 完全积分线性单元剪切锁死 | 把长宽比从 5:1 降到 2:1 或换二次单元，挠度应回升 |
| 橡胶/软组织几乎不变形 | 体积锁死，$K/E$ 过大 | 换杂交单元 C3D8H 或 B-bar 复算 |
| 减缩积分位移云图出现交替锯齿 | 沙漏模式未被约束 | 输出沙漏能与总应变能之比，应 <5% |
| 加密网格后锁死反而加重 | 单元长宽比随加密恶化 | 检查加密后长宽比是否上升 |
| 应力场出现棋盘格压力振荡 | 混合单元违反 LBB 条件 | 改用满足 LBB 的插值对或加稳定项 |
| 塑性区体积应变被强制为零 | 体积锁死污染不可压缩塑性 | 用 F-bar 单元复算塑性应变 |

## 单元与积分配置

处理近不可压缩与弯曲时，Abaqus 的典型写法如下，`C3D8RH` 中的 H 表示杂交、R 表示减缩：

```
*ELEMENT, TYPE=C3D8R, ELSET=BEND
*SECTION CONTROLS, NAME=SOLIDHG, HOURGLASS=ENHANCED
*SOLID SECTION, ELSET=BEND, CONTROLS=SOLIDHG, MATERIAL=STEEL
*ELEMENT, TYPE=C3D8RH, ELSET=RUBBER
*SOLID SECTION, ELSET=RUBBER, MATERIAL=RUBBER
*HYPERELASTIC, NEO-HOOKE
0.5, 0.0
```

橡胶用 Neo-Hookean 时，体积项由杂交单元或默认的混合格式处理；金属弯曲用 `C3D8R` 加 `HOURGLASS=ENHANCED`。

## 参考文献

1. Hughes, T.J.R. *The Finite Element Method: Linear Static and Dynamic Finite Element Analysis*. Dover, 2000.
2. Malkus, D.S., Hughes, T.J.R. "Mixed finite element methods — reduced and selective integration techniques: a unification of concepts." *Computer Methods in Applied Mechanics and Engineering*, 15(1), 63–81, 1978.
3. Nagtegaal, J.C., Parks, D.M., Rice, J.R. "On numerically accurate finite element solutions in the fully plastic range." *Computer Methods in Applied Mechanics and Engineering*, 4(2), 153–177, 1974.
4. Zienkiewicz, O.C., Taylor, R.L., Zhu, J.Z. *The Finite Element Method: Its Basis and Fundamentals*, 7th ed. Butterworth-Heinemann, 2013.
5. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
6. Flanagan, D.P., Belytschko, T. "A uniform strain hexahedron and quadrilateral with orthogonal hourglass control." *International Journal for Numerical Methods in Engineering*, 17(5), 679–706, 1981.
