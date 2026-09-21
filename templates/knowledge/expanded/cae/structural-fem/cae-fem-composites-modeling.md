---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-composites-modeling
title: "复合材料铺层：物理建模与适用边界"
summary: "铺层建模的边界是平面应力假设与失效准则的适用性。本文给出单层折减刚度 $Q_{11}$、经典层合板 ABD 与 Tsai–Wu 准则，由 T300/914 单层参数算出 $Q_{11}=135.9\\,\\mathrm{GPa}$，并用 Tsai–Wu 反算出 $X_t=1500\\,\\mathrm{MPa}$ 与一次混合载荷利用率 0.549。"
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
  - "复合材料铺层"
  - "物理建模与适用边界"
  - "Tsai-Wu 准则"
  - "经典层合板理论"
seo:
  title: "复合材料铺层：物理建模与适用边界"
  description: "铺层建模的边界是平面应力假设与失效准则的适用性。本文给出单层折减刚度 Q11、经典层合板 ABD 与 Tsai–Wu 准则，由 T300/914 单层参数算出 Q11=135.9 GPa，并用 Tsai–Wu 反算出 Xt=1500 MPa 与一次混合载荷利用率 0.549。"
  keywords:
    - "复合材料铺层"
    - "物理建模与适用边界"
    - "Tsai-Wu 准则"
    - "经典层合板理论"
    - "首层失效"
---

# 复合材料铺层：物理建模与适用边界

铺层结构不能用各向同性单元的强度判据评估，因为纤维方向的强度可以比横向高 30 倍，失效模式也从纤维断裂切换到基体开裂、分层。铺层建模的边界在于两条假设：单层处于平面应力状态，以及失效准则能区分不同模式。本文给出单层折减刚度、层合板 ABD 矩阵与 Tsai–Wu 准则的形式，用一个可手算的单层算例核对刚度与强度，并说明何时必须从壳升级到实体加黏聚单元。

## 单层的平面应力刚度

连续纤维单层在厚度方向应力可忽略，处于平面应力状态。由工程常数得到的折减刚度矩阵各分量为

$$
Q_{11}=\frac{E_1}{1-\nu_{12}\nu_{21}},\qquad Q_{22}=\frac{E_2}{1-\nu_{12}\nu_{21}},\qquad Q_{12}=\frac{\nu_{12}E_2}{1-\nu_{12}\nu_{21}},\qquad Q_{66}=G_{12}
$$

且 $\nu_{21}=\nu_{12}E_2/E_1$。取 T300/914 碳纤维/环氧单层：$E_1=135\,\mathrm{GPa}$，$E_2=10.0\,\mathrm{GPa}$，$G_{12}=5.0\,\mathrm{GPa}$，$\nu_{12}=0.30$。先算耦合项

$$
\nu_{21}=0.30\times\frac{10.0}{135}=0.0222,\qquad 1-\nu_{12}\nu_{21}=1-0.00667=0.9933
$$

$$
Q_{11}=\frac{135\times10^{3}}{0.9933}=1.359\times10^{5}\,\mathrm{MPa}=135.9\,\mathrm{GPa}
$$

$$
Q_{22}=\frac{10.0\times10^{3}}{0.9933}=1.007\times10^{4}\,\mathrm{MPa}=10.07\,\mathrm{GPa},\qquad Q_{12}=\frac{0.30\times10.0\times10^{3}}{0.9933}=3.02\,\mathrm{GPa}
$$

$Q_{11}$ 比 $Q_{22}$ 大 13.5 倍，正是这个各向异性让铺层方向成为设计变量。

## 层合板与铺层顺序

多层板按经典层合板理论（CLT）合成，内力与应变的关系为

$$
\begin{Bmatrix}\mathbf N\\ \mathbf M\end{Bmatrix}=\begin{bmatrix}\mathbf A & \mathbf B\\ \mathbf B & \mathbf D\end{bmatrix}\begin{Bmatrix}\boldsymbol\varepsilon^{0}\\ \boldsymbol\kappa\end{Bmatrix}
$$

$\mathbf A$ 是面内刚度，$\mathbf B$ 是耦合刚度，$\mathbf D$ 是弯曲刚度，三者由各层 $\bar{\mathbf Q}$ 沿厚度积分得到。铺层设计的经验判据：对称铺层使 $\mathbf B=0$，消除拉伸-弯曲耦合引起的固化翘曲；$\pm45^{\circ}$ 层提供剪切刚度；90° 层提高横向强度但降低纤维方向效率。准各向同性铺层 $[0/\pm45/90]_s$ 的面内模量约为 $0.55E_1$。单层厚度常用 0.125 mm，典型层合板 16 层总厚 2.0 mm。

## Tsai–Wu 强度准则与一次核对

Tsai–Wu 用一个张量型二次式统一描述各向异性强度：

$$
F_1\sigma_1+F_2\sigma_2+F_{11}\sigma_1^{2}+F_{22}\sigma_2^{2}+2F_{12}\sigma_1\sigma_2+F_{66}\tau_{12}^{2}=1
$$

强度参数由单层强度确定：$F_1=1/X_t-1/X_c$，$F_2=1/Y_t-1/Y_c$，$F_{11}=1/(X_tX_c)$，$F_{22}=1/(Y_tY_c)$，$F_{66}=1/S^{2}$，$F_{12}$ 由双轴试验标定，常取 $F_{12}=-\tfrac12\sqrt{F_{11}F_{22}}$。

取单层强度 $X_t=1500\,\mathrm{MPa}$、$X_c=1200\,\mathrm{MPa}$、$Y_t=50\,\mathrm{MPa}$、$Y_c=200\,\mathrm{MPa}$、$S=70\,\mathrm{MPa}$。纯纤维方向加载时 $\sigma_2=\tau_{12}=0$，方程退化为 $F_1\sigma_1+F_{11}\sigma_1^{2}=1$，即

$$
5.556\times10^{-7}\sigma_1^{2}-1.667\times10^{-4}\sigma_1-1=0
$$

解得 $\sigma_1=(300+\sqrt{300^{2}+4\times1.8\times10^{6}})/2=1500\,\mathrm{MPa}$，恰好回到 $X_t$，说明参数自洽。再看混合载荷 $\sigma_1=800\,\mathrm{MPa}$、$\tau_{12}=40\,\mathrm{MPa}$：

$$
\text{TSW}=(-1.667\times10^{-4})(800)+(5.556\times10^{-7})(800^{2})+(2.041\times10^{-4})(40^{2})=0.549
$$

利用率 0.549 < 1，安全裕度约 1.82 倍。其中纤维方向项贡献 0.222，剪应力项贡献 0.327，说明剪应力在此载荷下已占主导。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 首层失效后结构突然失去承载 | 未做逐层失效退化（ply discount） | 逐层计算 Tsai–Wu，检查首层位置与顺序 |
| 层合板固化后出现翘曲 | 铺层不对称，$\mathbf B\ne0$ | 检查铺层对称性，输出 $\mathbf B$ 矩阵范数 |
| 分层未被预测 | 壳模型无法表示层间应力 | 用实体单元加黏聚界面复算 |
| 强度预测偏乐观 | 用最大应力准则忽略耦合项 | 与 Tsai–Wu 或 Hashin 准则对比 |
| 横向开裂后刚度不变 | 未启用材料退化 | 检查退化后模量是否按模式降低 |
| 边缘应力异常高 | 自由边层间应力奇异 | 细化边缘网格并核对层间应力 |

## 铺层与强度校核脚本

```python
import numpy as np

E1, E2, G12, nu12 = 135000.0, 10000.0, 5000.0, 0.30   # MPa
nu21 = nu12 * E2 / E1
den = 1 - nu12 * nu21
Q11 = E1 / den; Q22 = E2 / den; Q12 = nu12 * E2 / den; Q66 = G12
print(round(Q11, 1), round(Q22, 1), round(Q12, 1))     # 135906.2 10067.1 3020.1

Xt, Xc, Yt, Yc, S = 1500.0, 1200.0, 50.0, 200.0, 70.0
F1 = 1/Xt - 1/Xc; F11 = 1/(Xt*Xc); F66 = 1/S**2
s1, t12 = 800.0, 40.0
TSW = F1*s1 + F11*s1**2 + F66*t12**2
print(round(TSW, 3))                                    # 0.549
```

## 参考文献

1. Jones, R.M. *Mechanics of Composite Materials*, 2nd ed. Taylor & Francis, 1999.
2. Tsai, S.W., Wu, E.M. "A general theory of strength for anisotropic materials." *Journal of Composite Materials*, 5(1), 58–80, 1971.
3. Daniel, I.M., Ishai, O. *Engineering Mechanics of Composite Materials*, 2nd ed. Oxford University Press, 2006.
4. Hashin, Z. "Failure criteria for unidirectional fiber composites." *Journal of Applied Mechanics*, 47(2), 329–334, 1980.
5. Herakovich, C.T. *Mechanics of Fibrous Composites*. Wiley, 1998.
6. ASTM D3039/D3039M-17. *Standard Test Method for Tensile Properties of Polymer Matrix Composite Materials*. ASTM International, 2017.
