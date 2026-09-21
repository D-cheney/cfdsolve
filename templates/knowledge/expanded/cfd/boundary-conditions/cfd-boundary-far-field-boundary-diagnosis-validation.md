---
template_version: "flowlab-knowledge/1.0"
slug: cfd-boundary-far-field-boundary-diagnosis-validation
title: "远场与开放边界：结果诊断与可信度验证"
summary: "利用远场误差按 1/R 收敛的特性做外推，用 Prandtl-Glauert 薄翼理论建立升力基准，并对风洞数据施加 Maskell 堵塞修正后对照。"
category:
  slug: boundary-conditions
  name: "边界条件与初始化"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "边界条件与初始化"
  - "远场与开放边界"
  - "结果诊断与可信度验证"
  - "Prandtl-Glauert 修正"
  - "堵塞修正"
seo:
  title: "远场与开放边界：结果诊断与可信度验证"
  description: "利用远场误差按 1/R 收敛的特性做外推，用 Prandtl-Glauert 薄翼理论建立升力基准，并对风洞数据施加 Maskell 堵塞修正后对照。"
  keywords:
    - "远场与开放边界"
    - "结果诊断与可信度验证"
    - "远场外推"
    - "堵塞修正"
    - "升力系数"
---

# 远场与开放边界：结果诊断与可信度验证

远场距离不足造成的误差有一个非常有用的性质：二维外流的积分量误差随远场半径按 $1/R$ 单调收敛。这意味着不必真的把域放到 $100c$，只要做三级远场并拟合外推，就能得到 $R \to \infty$ 的极限值。本文给出这条外推链的公式与一次可核对的拟合、用 Prandtl-Glauert 薄翼理论建立的独立基准，以及在对照风洞数据前必须完成的堵塞修正。

## 远场误差按 1/R 收敛，可以外推

二维升力体的远场扰动是点涡型，诱导速度按 $1/R$ 衰减，因此积分量的远场误差也按 $1/R$ 衰减。设 $R$ 以弦长 $c$ 为单位，则

$$
q(R) = q_\infty - \frac{A}{R}
$$

其中 $q_\infty$ 是无限远场的极限值，$A$ 是与环量有关的常数。三维外流的尾涡系统按 $1/R^2$ 衰减，同样的拟合要改成 $q(R) = q_\infty - A/R^2$；若把二维公式用在三维算例上，外推值会系统性偏离。这条关系成立的前提是远场足够远、扰动已进入点涡主导区，一般 $R \ge 10c$ 后成立。

用两级的解即可解出 $q_\infty$ 与 $A$，用三级可检验 $1/R$ 关系是否真的成立——把三级解分别两两配对，若得到的 $q_\infty$ 一致到 $0.5\%$ 以内，说明已进入渐近区；若不一致，需要把最小的一级远场排除或继续外移。

## 用薄翼理论建立升力基准

自洽外推只证明序列收敛，不证明结果正确。薄翼理论给出低速小迎角下的升力基准，配合 Prandtl-Glauert 可压缩修正：

$$
C_L = \frac{2\pi \alpha}{\sqrt{1 - M_\infty^2}}
$$

取迎角 $\alpha = 4^\circ = 0.06981\ \mathrm{rad}$、$M_\infty = 0.20$。先算二维不可压值 $2\pi\alpha = 2\pi \times 0.06981 = 0.4386$，再除以 $\sqrt{1-0.04} = 0.97980$：

$$
C_L^{theory} = \frac{0.4386}{0.97980} = 0.4477
$$

这个基准适用于薄翼型、小迎角、无分离的工况。若翼型相对厚度 $t/c = 0.12$，实际升力线斜率会因厚度效应略高于薄翼值（约 $+2\%$），因此基准的适用容差应放到 $\pm 3\%$。

## 三级远场的收敛拟合

对同一翼型算例，远场半径分别取 $R/c = 10, 20, 40$，提取升力系数：

| 远场半径 $R/c$ | 远场扰动比 $u_\theta/U_\infty$ | $C_L$ | 与上一级变化 |
| --- | --- | --- | --- |
| 10 | $0.40\%$ | 0.423 | — |
| 20 | $0.20\%$ | 0.435 | $+2.8\%$ |
| 40 | $0.10\%$ | 0.441 | $+1.4\%$ |

用 $R/c = 20$ 与 $40$ 两级拟合：$0.435 = q_\infty - A/20$，$0.441 = q_\infty - A/40$，相减得

$$
A = 40 \times (0.441 - 0.435) = 0.24, \qquad q_\infty = 0.441 + \frac{0.24}{40} = 0.447
$$

外推值 $0.447$ 与薄翼基准 $0.4477$ 相差 $0.2\%$，远优于最粗远场的 $5.5\%$ 偏差（$|0.423-0.4477|/0.4477$）。再用 $R/c = 10$ 与 $20$ 两级独立拟合，得到 $A = 0.24$、$q_\infty = 0.447$，完全一致，说明 $1/R$ 关系成立。

## 与风洞数据的对照需要先做堵塞修正

实验数据来自有限尺寸的风洞，必须先把堵塞效应修正到自由飞行条件才能与 CFD 对照。实心堵塞由模型厚度占试验段高度决定，尾流堵塞由阻力决定（Maskell 关系）：

$$
\epsilon_{wb} = \frac{c}{2H} C_D
$$

取模型弦长 $c = 0.3\ \mathrm{m}$、试验段高度 $H = 0.6\ \mathrm{m}$、阻力系数 $C_D = 0.0082$：

$$
\epsilon_{wb} = \frac{0.3}{2 \times 0.6} \times 0.0082 = 0.25 \times 0.0082 = 2.05\times 10^{-3} = 0.205\%
$$

实心堵塞按 $\epsilon_s \approx (t/c)^2$ 量级估算，$t/c = 0.12$ 时 $\epsilon_s \approx 1.4\%$，两者合计 $\epsilon \approx 1.6\%$。速度修正为 $U_c = U_\infty (1 + \epsilon)$，升力系数按 $C_L^{free} \approx C_L^{meas}(1 - 2\epsilon)$ 修正，即测得 $C_L = 0.459$ 时自由飞行值为 $0.459 \times (1 - 0.032) = 0.444$。若不做这一步直接与 CFD 的 $0.447$ 对照，会得到 $-2.7\%$ 的虚假偏差，而修正后偏差只有 $+0.7\%$。

## 阻力分解中的伪阻力

远场太近或远场边界反射会在阻力中产生不来自物理的"伪阻力"。判定方法是把阻力分解为压差阻力与黏性阻力两部分（通过壁面积分），再与动量亏损法（通过控制面通量积分）得到的阻力比较：

$$
C_D^{momentum} = \frac{2}{\rho U_\infty^2 c} \int_{S} \rho u (U_\infty - u)\,\mathrm{d}y
$$

若两者相差超过 $C_D$ 的 $2\%$，多出的部分即为伪阻力，来源通常是远场处的动量通量未被正确闭合。

## 诊断脚本

```bash
#!/usr/bin/env bash
# 三级远场扫描：只改 blockMeshDict 的外边界位置，其余保持一致
for R in 10 20 40; do
    cp -r base "case_${R}c"
    # 通过 topoSet/blockMesh 的外边界坐标缩放实现远场外移
    foamDictionary -entry "vertices" -set "" "case_${R}c/system/blockMeshDict"
    ( cd "case_${R}c" && ./Allrun > log.run 2>&1 )
    ( cd "case_${R}c" && postProcess -func forceCoeffs -latestTime >> log.run 2>&1 )
done
grep -h "^lift" case_*c/postProcessing/forceCoeffs/*/coefficient.dat | tail -3
```

```python
import numpy as np
R = np.array([10.0, 20.0, 40.0])          # 以弦长为单位
CL = np.array([0.423, 0.435, 0.441])      # 三级远场的升力系数

coef = np.polyfit(1.0 / R, CL, 1)         # CL = CL_inf - A/R
CL_inf, A = coef[1], -coef[0]
alpha, M = np.radians(4.0), 0.20
CL_th = 2 * np.pi * alpha / np.sqrt(1 - M**2)
print("A = %.4f, CL_inf = %.4f, 基准 = %.4f, 偏差 = %.2f %%"
      % (A, CL_inf, CL_th, abs(CL_inf - CL_th) / CL_th * 100))
for r, cl in zip(R, CL):
    print("R/c=%4.0f CL=%.4f 偏差=%.2f %%" % (r, cl, abs(cl - CL_th) / CL_th * 100))

c, H, CD, CL_meas = 0.3, 0.6, 0.0082, 0.459
eps_wb = c / (2 * H) * CD
print("eps_wb = %.3f %%, CL_free = %.4f"
      % (eps_wb * 100, CL_meas * (1 - 2 * (eps_wb + 0.014))))
```

脚本同时给出外推值、逐级偏差与堵塞修正，三行输出即可构成一份完整的远场验证记录。

## 失败模式对照

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 三级远场拟合出的 $A$ 不唯一 | 最小远场未进入 $1/R$ 渐近区 | 用 20c/40c 与 10c/20c 分别拟合，$q_\infty$ 应一致到 $0.5\%$ |
| 外推值比薄翼基准高 $5\%$ 以上 | 使用了三维的 $1/R^2$ 拟合二维数据 | 检查拟合幂次，二维必须用 $1/R$ |
| 与风洞数据差 $-2.7\%$ | 未做堵塞修正 | 用 $\epsilon_{wb} = cC_D/(2H)$ 加实心堵塞修正后重比 |
| 动量法与壁面法阻力差 $> 2\%$ | 远场反射产生伪阻力 | 检查远场动量通量闭合，改用无反射边界 |
| $C_L$ 随远场距离非单调变化 | 远场边界类型不匹配（固定值 vs 无反射） | 统一改用 `freestream` + `waveTransmissive` 重算 |
| 外推 $q_\infty$ 随网格加密漂移 | 离散误差与远场误差耦合 | 固定远场加密网格，看 $q_\infty$ 是否稳定 |

## 参考文献

1. Abbott I.H., von Doenhoff A.E., *Theory of Wing Sections*, Dover Publications, 1959.
2. Barlow J.B., Rae W.H., Pope A., *Low-Speed Wind Tunnel Testing*, 3rd ed., Wiley, 1999.
3. Maskell E.C., "A Theory of the Blockage Effects on Bluff Bodies and Stalled Wings in a Closed Wind Tunnel", *Aeronautical Research Council R&M 3400*, 1963.
4. Thomas J.L., Salas M.D., "Far-Field Boundary Conditions for Transonic Lifting Solutions to the Euler Equations", *AIAA Journal*, 24(7), 1074-1080, 1986.
5. Roache P.J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
