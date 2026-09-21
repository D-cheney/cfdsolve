---
template_version: "flowlab-knowledge/1.0"
slug: cae-fem-fatigue-modeling
title: "疲劳评估：物理建模与适用边界"
summary: "疲劳评估的边界是循环数区间与平均应力状态。本文给出 Basquin 幂律、Goodman 平均应力修正与 Miner 线性累积损伤，由两点 S–N 数据反算斜率 $m=5.68$，把 250 MPa 下寿命算到 $2.82\\times10^{5}$ 次，并完成一次 Miner 损伤累加。"
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
  - "疲劳评估"
  - "物理建模与适用边界"
  - "S-N 曲线"
  - "Miner 损伤"
seo:
  title: "疲劳评估：物理建模与适用边界"
  description: "疲劳评估的边界是循环数区间与平均应力状态。本文给出 Basquin 幂律、Goodman 平均应力修正与 Miner 线性累积损伤，由两点 S–N 数据反算斜率 m=5.68，把 250 MPa 下寿命算到 2.82×10⁵ 次，并完成一次 Miner 损伤累加。"
  keywords:
    - "疲劳评估"
    - "物理建模与适用边界"
    - "S-N 曲线"
    - "Miner 损伤"
    - "Goodman 修正"
---

# 疲劳评估：物理建模与适用边界

疲劳分析的适用边界由两个坐标决定：循环数落在高周还是低周区间，以及平均应力是否为零。用错区间会把寿命算错一到两个数量级，忽略平均应力则会让拉伸均值下的构件被系统性高估。本文给出应力-寿命（S–N）幂律、平均应力修正与 Miner 累积损伤的形式，用两点数据反算 S–N 斜率，并完成一次可核对的寿命与损伤累加。

## 应力-寿命曲线与 Basquin 幂律

高周疲劳（HCF，$N>10^{4}\sim10^{5}$）用应力幅控制，S–N 曲线在双对数坐标下近似直线：

$$
\sigma_a=\sigma_f'\left(2N_f\right)^{b}\quad\Longleftrightarrow\quad N_f=N_1\left(\frac{S_1}{\sigma_a}\right)^{m}
$$

$b$ 是疲劳强度指数（钢材约 $-0.05\sim-0.12$），$m=-1/b$ 是 S–N 斜率。低周疲劳（LCF，$N<10^{4}$）进入塑性，必须改用应变-寿命的 Coffin–Manson 关系

$$
\frac{\Delta\varepsilon}{2}=\frac{\sigma_f'}{E}\left(2N_f\right)^{b}+\varepsilon_f'\left(2N_f\right)^{c}
$$

$\sigma_f'$ 是疲劳强度系数、$\varepsilon_f'$ 是疲劳延性系数。判据很直接：缺口根部名义应力接近屈服、循环数低于 $10^{4}$ 时用应变法；应力远低于屈服、循环数高于 $10^{5}$ 时用应力法。钢材还有疲劳极限，约 $0.4\sim0.5$ 倍抗拉强度，低于该幅值的循环不产生损伤（铝合金无此极限）。

## 一次可核对的寿命与损伤计算

由两点 S–N 数据标定斜率：$S_1=300\,\mathrm{MPa}$ 对应 $N_1=1.0\times10^{5}$，$S_2=200\,\mathrm{MPa}$ 对应 $N_2=1.0\times10^{6}$。斜率

$$
m=\frac{\log(N_2/N_1)}{\log(S_1/S_2)}=\frac{\log 10}{\log 1.5}=\frac{1.000}{0.1761}=5.68
$$

在 $\sigma_a=250\,\mathrm{MPa}$ 下的寿命

$$
N=N_1\left(\frac{S_1}{\sigma_a}\right)^{m}=1.0\times10^{5}\times1.2^{5.68}=2.82\times10^{5}
$$

平均应力按 Goodman 关系修正：$\sigma_a/\sigma_e+\sigma_m/\sigma_u=1$。若材料在 $R=-1$ 下的等寿命幅值 $\sigma_e=200\,\mathrm{MPa}$、抗拉强度 $\sigma_u=700\,\mathrm{MPa}$、平均应力 $\sigma_m=100\,\mathrm{MPa}$，则允许的应力幅

$$
\sigma_a=\sigma_e\left(1-\frac{\sigma_m}{\sigma_u}\right)=200\times\left(1-\frac{100}{700}\right)=171.4\,\mathrm{MPa}
$$

比对称循环下的 200 MPa 低 14.3%，这就是拉伸平均应力的代价。

Miner 线性累积损伤把不同幅值的循环加权求和：

$$
D=\sum_i\frac{n_i}{N_i}\le1
$$

用上面的 S–N：载荷块 A 为 250 MPa、$n_A=1.0\times10^{5}$ 次，$N_A=2.82\times10^{5}$，损伤 $D_A=0.355$；载荷块 B 为 200 MPa、$n_B=3.0\times10^{5}$ 次，$N_B=1.0\times10^{6}$，损伤 $D_B=0.300$。合计 $D=0.655<1$，未达失效。要在 B 块内耗尽剩余寿命，需再循环 $(1-0.655)\times10^{6}=3.45\times10^{5}$ 次，即 B 块总计 $6.45\times10^{5}$ 次。

## 失效模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 寿命比试验值高一个数量级 | 用了对称循环 S–N 而未做平均应力修正 | 用 Goodman 或 Gerber 修正后复算 |
| 缺口件寿命被严重高估 | 未计入缺口应力集中与塑性重分布 | 用应变-寿命法并按 $K_t$ 修正 |
| 多轴载荷下方向判断错误 | 用单轴 S–N 处理多轴状态 | 用临界平面法求最大剪应变面 |
| 随机谱损伤明显偏小 | 未做雨流计数，幅值配对错误 | 按 ASTM E1049 做雨流计数后重算 Miner |
| 低周疲劳用应力法算不出寿命 | 循环数落在 LCF 区间 | 改用 Coffin–Manson 应变法 |
| 焊缝附近寿命异常长 | 未计入焊接残余应力与缺陷 | 加残余应力偏置并降低疲劳极限 |

## Miner 损伤累加脚本

```python
import numpy as np

def life(S, S1=300.0, N1=1.0e5, m=5.68):
    return N1 * (S1 / S)**m          # Basquin 幂律

blocks = [(250.0, 1.0e5), (200.0, 3.0e5)]
D = sum(n / life(S) for S, n in blocks)
print("N(250 MPa) =", life(250.0))   # 2.82e5
print("Miner D   =", round(D, 3))    # 0.655
# Goodman 修正后的许用幅值
sa = 200.0 * (1 - 100.0/700.0)
print("Goodman sigma_a =", round(sa, 1))   # 171.4 MPa
```

## 参考文献

1. Basquin, O.H. "The exponential law of endurance tests." *Proceedings of the American Society for Testing and Materials*, 10, 625–630, 1910.
2. Miner, M.A. "Cumulative damage in fatigue." *Journal of Applied Mechanics*, 12(3), A159–A164, 1945.
3. Coffin, L.F. "A study of the effects of cyclic thermal stresses on a ductile metal." *Transactions of the ASME*, 76, 931–950, 1954.
4. Dowling, N.E. *Mechanical Behavior of Materials: Engineering Methods for Deformation, Fracture, and Fatigue*, 4th ed. Pearson, 2013.
5. Stephens, R.I., Fatemi, A., Stephens, R.R., Fuchs, H.O. *Metal Fatigue in Engineering*, 2nd ed. Wiley, 2001.
6. ASTM E1049-85. *Standard Practices for Cycle Counting in Fatigue Analysis*. ASTM International, 2017.
