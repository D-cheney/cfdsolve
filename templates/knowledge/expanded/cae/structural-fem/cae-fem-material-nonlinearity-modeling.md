---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-material-nonlinearity-modeling
title: "材料非线性：物理建模与适用边界"
summary: "材料非线性的边界在于本构是否匹配工况：单调加载用等向硬化，循环加载必须用随动硬化，率相关材料要写黏塑性。本文由 $\\varepsilon=0.5\\%$ 单轴拉伸算出 $\\sigma=361.6\\,\\mathrm{MPa}$ 与 $\\varepsilon^p=0.328\\%$，给出切线模量与升级判据。"
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
  - "材料非线性"
  - "物理建模与适用边界"
  - "J2 塑性"
  - "硬化模型"
seo:
  title: "材料非线性：物理建模与适用边界"
  description: "材料非线性的边界在于本构是否匹配工况：单调加载用等向硬化，循环加载必须用随动硬化，率相关材料要写黏塑性。本文由 ε=0.5% 单轴拉伸算出 σ=361.6 MPa 与 εp=0.328%，给出切线模量与升级判据。"
  keywords:
    - "材料非线性"
    - "物理建模与适用边界"
    - "J2 塑性"
    - "等向硬化"
    - "随动硬化"
---

# 材料非线性：物理建模与适用边界

材料非线性的核心问题不是"要不要开塑性"，而是所选本构的假设是否覆盖当前工况：加载是否单调、应变是否够小、温度与应变率是否稳定。选错硬化模型会让包辛格效应、循环软化和回弹预测整体失真。本文从 J2 塑性的屈服与返回映射出发，说明等向与随动硬化的分界、小应变假设的边界，并用一次单轴拉伸手算给出切线模量与塑性应变。

## J2 塑性与屈服面

金属在室温准静态下的屈服由偏应力第二不变量控制，von Mises 等效应力

$$
\sigma_v=\sqrt{\tfrac12\left[(\sigma_1-\sigma_2)^{2}+(\sigma_2-\sigma_3)^{2}+(\sigma_3-\sigma_1)^{2}\right]}
$$

屈服函数与一致性条件为

$$
f=\sigma_v-\sigma_y(\bar\varepsilon^{p})\le0,\qquad \dot{\bar\varepsilon}^{p}\ge0,\qquad f\,\dot{\bar\varepsilon}^{p}=0
$$

$\sigma_y$ 是当前屈服应力，$\bar\varepsilon^{p}$ 是累积等效塑性应变。这三式就是加载/卸载的判据：$f<0$ 为弹性，$f=0$ 且加载时产生塑性流动，$f=0$ 且卸载时退回弹性。硬化规律 $\sigma_y(\bar\varepsilon^{p})$ 的形式决定了模型适用性：等向硬化把屈服面均匀扩大，只适合单调加载；随动硬化让屈服面平移（Armstrong–Frederick 或线性 Ziegler），才能描述反向加载时的包辛格效应。

## 返回映射与切线模量

径向返回映射在每个增量步先做弹性试探，再按一致性条件投影回屈服面。对 J2 各向同性硬化，塑性乘子增量可写成

$$
\Delta\lambda=\frac{f^{tr}}{H+3G}
$$

$f^{tr}$ 是弹性试探屈服函数，$H=\mathrm d\sigma_y/\mathrm d\bar\varepsilon^{p}$ 是硬化模量，$G$ 是剪切模量。分母 $H+3G$ 说明：材料越硬（$H$ 大）或剪切模量越高，同样超调量对应的塑性流动越小。一致切线模量用于 Newton 迭代，其精度直接决定收敛速度；用弹性模量近似切线会导致迭代次数成倍增加。

## 一次单轴拉伸手算

取低碳钢，$E=210\,\mathrm{GPa}$，初始屈服 $\sigma_{y0}=355\,\mathrm{MPa}$，线性等向硬化 $H=2.0\,\mathrm{GPa}$，加载到总应变 $\varepsilon=0.5\%$。弹性极限应变为 $\varepsilon_y=\sigma_{y0}/E=355\times10^{6}/210\times10^{9}=1.69\times10^{-3}$，即 0.169%，所以 0.5% 已进入塑性。

由一致性条件 $\sigma=\sigma_{y0}+H\varepsilon^{p}$ 与 $\varepsilon=\sigma/E+\varepsilon^{p}$ 联立：

$$
\sigma=\frac{\sigma_{y0}+H\varepsilon}{1+H/E}=\frac{355\times10^{6}+2.0\times10^{9}\times0.005}{1+2.0/210}=361.6\,\mathrm{MPa}
$$

塑性应变

$$
\varepsilon^{p}=\varepsilon-\frac{\sigma}{E}=0.005-\frac{361.6\times10^{6}}{210\times10^{9}}=3.28\times10^{-3}=0.328\%
$$

回代校验：$\sigma_{y0}+H\varepsilon^{p}=355+2.0\times10^{3}\times3.28\times10^{-3}=361.6\,\mathrm{MPa}$，与上式一致。一致切线模量 $E_t=EH/(E+H)=1.98\,\mathrm{GPa}$，仅为弹性模量的 0.94%，这正是塑性阶段位移对载荷极为敏感、必须用增量加载的原因。

## 小应变假设与模型升级

J2 塑性默认小应变（$\varepsilon<5\%$）与金属不可压缩塑性。超出边界时按下列次序升级：总应变超过 5% 或伴随大转动时，改用有限应变塑性（乘性分解 $\mathbf F=\mathbf F^{e}\mathbf F^{p}$）；循环加载超过 100 周或存在反向屈服时，从等向硬化换为随动/混合硬化；应变率超过 $10^{-2}\,\mathrm{s^{-1}}$（冲击、成形）时加入率相关黏塑性（如 Johnson–Cook）；温度接近 0.4 倍熔点或保温时间超过 1 h 时加入蠕变。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 循环加载下滞回环不闭合、能量耗散异常 | 用了等向硬化，忽略包辛格效应 | 做单轴拉压循环，检查反向屈服应力是否下降 |
| Newton 迭代次数逐增量增加 | 切线模量不一致 | 用一致切线替换近似切线后比较迭代数 |
| 塑性区体积应变非零 | 未施加塑性不可压缩约束 | 检查等效塑性应变与体积应变是否解耦 |
| 回弹量比实测大很多 | 弹性卸载模量被硬化污染 | 对照卸载段斜率与初始 $E$ |
| 高速加载屈服应力被低估 | 未计入率相关 | 在两种应变率下分别标定屈服应力 |
| 大变形下应力明显偏大 | 用工程应力-应变代替真应力-真应变 | 超过 5% 应变后换算真应力真应变 |

## 返回映射伪代码

```
for each increment:
    eps = eps_old + d_eps
    sig_tr = C : eps                    # 弹性试探
    s_tr = dev(sig_tr)
    f_tr = norm(s_tr) - sqrt(2/3) * sig_y(epbar)
    if f_tr <= 0:                       # 弹性
        sig = sig_tr
    else:                               # 塑性
        dlam = f_tr / (H + 3*G)
        n = s_tr / norm(s_tr)
        sig = sig_tr - 2*G*dlam*n
        epbar += sqrt(2/3) * dlam
    C_alg = consistent_tangent(sig, dlam, H, G)   # 一致切线
```

## 参考文献

1. Simo, J.C., Hughes, T.J.R. *Computational Inelasticity*. Springer, 1998.
2. Lubliner, J. *Plasticity Theory*. Dover, 2008.
3. Lemaitre, J., Chaboche, J.-L. *Mechanics of Solid Materials*. Cambridge University Press, 1990.
4. Bathe, K.-J. *Finite Element Procedures*. Prentice Hall, 1996.
5. Crisfield, M.A. *Non-linear Finite Element Analysis of Solids and Structures*, Vol. 1. Wiley, 1991.
6. Hill, R. *The Mathematical Theory of Plasticity*. Oxford University Press, 1950.
