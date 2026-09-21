---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-reynolds-stress-diagnosis-validation
title: "雷诺应力模型：结果诊断与可信度验证"
summary: "用张量不变量而不是残差判断雷诺应力结果是否物理：可实现性判据与 Lumley 三角形边界、用 DNS 槽道数据逐点比对、压力应变项收支核对，以及七方程耦合收敛的诊断方式。"
category:
  slug: turbulence-modeling
  name: "湍流与近壁建模"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "湍流与近壁建模"
  - "雷诺应力模型"
  - "结果诊断与可信度验证"
  - "可实现性"
  - "Lumley 三角形"
seo:
  title: "雷诺应力模型：结果诊断与可信度验证"
  description: "用张量不变量而不是残差判断雷诺应力结果是否物理：可实现性判据与 Lumley 三角形边界、用 DNS 槽道数据逐点比对、压力应变项收支核对，以及七方程耦合收敛的诊断方式。"
  keywords:
    - "雷诺应力模型"
    - "结果诊断与可信度验证"
    - "可实现性"
    - "Lumley 三角形"
    - "压力应变项"
---

# 雷诺应力模型：结果诊断与可信度验证

雷诺应力模型的解可以残差收敛、场量光滑，却落在物理上不可能的状态里——负的法向应力、违反 Schwarz 不等式的剪应力、各向异性张量跑出 Lumley 三角形。这些都能用代数判据当场抓住。本文给出三个层次的诊断：逐点可实现性检验、各向异性不变量在三角形中的位置、以及压力应变项的收支核对，全部以 DNS 槽道 $Re_\tau = 395$ 的数据为基准。

## 1 可实现性判据与张量不变量的可计算边界

应力张量必须半正定，等价于两条可直接编程的判据：

$$\overline{u_\alpha'u_\alpha'} \ge 0, \qquad \left|\overline{u_i'u_j'}\right| \le \sqrt{\overline{u_i'u_i'}\;\overline{u_j'u_j'}}$$

第一条排除负法向应力，第二条是 Schwarz 不等式，用来抓住“剪应力大于两个法向应力几何平均”的非法状态。更强的判据用各向异性张量 $b_{ij} = \overline{u_i'u_j'}/(2k) - \delta_{ij}/3$：

$$b_{ij}b_{ij} \le \frac{2}{3}, \qquad II = -\tfrac12 b_{ij}b_{ji}, \qquad III = \tfrac13 b_{ij}b_{jk}b_{ki}$$

由 $b_{ii} = 0$ 可推出 $II \in [-1/3,\,0]$、$III \in [-2/27,\,2/27]$。极值点有明确的物理对应：$II = 0$ 是各向同性；$II = -1/3$ 时张量只剩一个非零特征值，即一维脉动；$II = -1/3$ 与 $III = 2/27$ 对应单分量极限。Lumley 三角形的两条边由下式给出：

$$III = -\frac{1}{27} - \frac{II}{3}\;\;(\text{二分量边界}), \qquad III = \pm\frac{1}{4}\left(-\frac{4}{3}II\right)^{3/2}\;\;(\text{轴对称边界})$$

把 $II = -1/3$ 代入两式都得 $III = 2/27$，两条边在单分量顶点相交，这是一个很好的实现自检。

## 2 把 DNS 槽道当作逐点基准

在 $y^{+} \approx 15$ 处，DNS 给出 $\overline{u^2}^{+} = 7.29$、$\overline{v^2}^{+} = 0.90$、$\overline{w^2}^{+} = 1.32$、$-\overline{u'v'}^{+} = 0.70$。三者之和 9.51 给出 $k^{+} = 4.76$，于是

$$b_{11} = 0.433, \quad b_{22} = -0.238, \quad b_{33} = -0.194, \quad b_{12} = -0.074$$

对角元之和为零，符合 $b_{ii} = 0$。计算不变量得 $b_{ij}b_{ij} = 0.293$，满足 $\le 2/3$；$II = -0.146$，落在 $[-1/3, 0]$ 内；$III = 0.0211$。

把 $II = -0.146$ 代回两条边界：二分量边界给出 $III = -0.0370 + 0.0488 = 0.0117$，轴对称边界给出 $III = 0.0215$。实测点 $0.0211$ 落在两者之间，且距轴对称边界的相对位置为 $(0.0211-0.0117)/(0.0215-0.0117) = 95\%$。这说明近壁湍流已非常接近轴对称拉伸状态，把它当成各向同性处理，误差就是整个三角形的尺度。

## 3 压力应变项的收支核对

压力应变项不改变湍动能，只重新分配能量，因此逐点应满足 $\phi_{ii} = 0$。把求解结果中的 $\phi_{ij}$ 张量求迹，若 $|\phi_{ii}|/\varepsilon$ 超过 0.05，说明模型实现或常数有误，而不是数值误差。

更实用的核对是慢项与快项的配比。线性 LRR 的两项为

$$\phi_{ij,1} = -2C_1\varepsilon\,b_{ij}, \qquad \phi_{ij,2} = -C_2\left(P_{ij} - \tfrac{2}{3}P\delta_{ij}\right)$$

取 $C_1 = 1.8$、$C_2 = 0.6$。在 $y^{+} \approx 15$ 处，$P/\varepsilon \approx 1.4$，故 $|\phi_{2}|/|\phi_{1}| \approx C_2 P/(C_1\varepsilon) = 0.6\times1.4/1.8 = 0.47$。若后处理给出的比值与 0.47 相差超过 30%，通常是 $C_1$、$C_2$ 被改，或该点不在对数律区附近导致 $P/\varepsilon$ 偏离。

## 4 七方程收敛的诊断方式

七个方程耦合，单一残差曲线不足以判断。有效的诊断是把收敛拆成三个同时成立的信号：

- 六个应力分量与尺度方程的残差同时低于 $10^{-5}$，且残差曲线呈平台而非持续缓降；
- 应力张量的迹 $2k$ 在最后 500 次迭代内变化小于 0.5%；
- 不变量场的极值稳定：$\max(b_{ij}b_{ij})$ 与 $\min(\overline{v^2})$ 不再随迭代漂移。

第三条最关键。耦合求解常出现“残差已平台、但 $\overline{v^2}$ 仍在缓慢变化”的状态，此时关掉求解会得到一张实现性边界附近的错误应力场。判据是把 $\max(b_{ij}b_{ij})$ 打印进日志：只要它还在单调爬升，迭代就没有结束。

```python
import numpy as np

def invariants(R):
    """R: 3x3 雷诺应力张量（单位 m2/s2），返回 (k, II, III, b_ij b_ij)"""
    R = np.asarray(R, float)
    k = 0.5 * np.trace(R)
    b = R / (2 * k) - np.eye(3) / 3
    return k, -0.5 * np.sum(b * b), np.trace(b @ b @ b) / 3, np.sum(b * b)

def realizable(R):
    ok_norm = np.all(np.diag(R) >= 0)
    ok_schw = all(abs(R[i, j]) <= np.sqrt(R[i, i] * R[j, j] + 1e-30)
                  for i in range(3) for j in range(3))
    k, II, III, b2 = invariants(R)
    return ok_norm and ok_schw and b2 <= 2 / 3 + 1e-9, (II, III, b2)

utau2 = 1.0                                   # 以 u_tau^2 为单位
R_dns = np.array([[7.29, -0.70, 0.0],
                  [-0.70, 0.90, 0.0],
                  [0.0,   0.0, 1.32]]) * utau2
print(realizable(R_dns))
# (True, (-0.1463, 0.02110, 0.2926))

II = -0.1463
print("二分量边界 III =", -1/27 - II/3)          # 0.01174
print("轴对称边界 III =", 0.25 * (-4*II/3) ** 1.5)  # 0.02154
```

脚本输出的不变量与手算完全一致，可直接作为交付记录中的复核凭证。

## 5 旋流与曲率算例的对照要点

RSM 的价值在强旋流和强曲率中体现，因此验收也应在这些量上做。对旋流算例，应同时报告三个剖面：切向速度的峰值半径、轴向速度在轴线上的亏损量、以及湍流剪应力 $\overline{u'w'}$ 的符号。标准 $k$-$\varepsilon$ 会在轴线附近给出正的 $\overline{u'w'}$，而实验与 RSM 给出负值，这一符号差异比任何积分量都更能说明模型的必要性。

对弯曲管道与 U 型弯，曲率使外侧湍流增强、内侧减弱，用两方程模型会把这一不对称抹掉。诊断量是内外侧壁面切应力之比：实验值通常在 1.6~2.0，$k$-$\varepsilon$ 给出接近 1.2，RSM 给出 1.5~1.8。若 RSM 结果仍接近 1.2，先怀疑对流格式的数值耗散，而不是模型本身。

## 6 诊断表与反证

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 迭代中 $\overline{v^2}$ 变为负值 | 压力应变项使张量失去半正定性 | 逐点算 $\min(\overline{u_\alpha'u_\alpha'})$ 并定位到具体单元 |
| 不变量点落在二分量边界之外 | 压力应变常数被改或时间推进过大 | 用 $III = -1/27 - II/3$ 画边界，统计越界单元占比 |
| $\phi_{ii}/\varepsilon$ 达 0.2 | 压力应变项实现不含迹为零的约束 | 对 $\phi_{ij}$ 张量求迹并除以同点 $\varepsilon$ |
| 残差平台但 $\max(b_{ij}b_{ij})$ 持续上升 | 耦合迭代尚未收敛到实现性流形上 | 把该极值写入日志，继续迭代直到其停止漂移 |
| 弯管内外壁切应力之比仅 1.25 | 一阶格式的数值耗散压制了曲率效应 | 换二阶格式重算，比较比值是否升到 1.5 以上 |
| 旋流轴线附近 $\overline{u'w'}$ 为正 | 模型退化为涡黏行为或旋流修正未开 | 检查剪应力分量输出是否被 $\mu_t$ 覆盖 |

## 7 文献与数据来源

1. Lumley J. L., "Computational modeling of turbulent flows," *Advances in Applied Mechanics*, 1978.
2. Launder B. E., Reece G. J., Rodi W., "Progress in the development of a Reynolds-stress turbulence closure," *Journal of Fluid Mechanics*, 1975.
3. Speziale C. G., Sarkar S., Gatski T. B., "Modelling the pressure–strain correlation of turbulence: an invariant dynamical systems approach," *Journal of Fluid Mechanics*, 1991.
4. Moser R. D., Kim J., Mansour N. N., "Direct numerical simulation of turbulent channel flow up to $Re_\tau = 590$," *Physics of Fluids*, 1999.
