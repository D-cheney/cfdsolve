---
template_version: "flowlab-knowledge/1.0"
slug: cfd-thermal-shock-capturing-diagnosis-validation
title: "激波捕捉：结果诊断与可信度验证"
summary: "把激波捕捉的可信度拆成四个可测量的量：激波位置误差随网格的收敛率、涂抹宽度与单元尺度的比值、过冲幅值、以及跨激波的熵增是否为正且与解析值一致，并给出对应的提取脚本与容差门槛。"
category:
  slug: heat-transfer
  name: "传热与可压缩流"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "传热与可压缩流"
  - "激波捕捉"
  - "结果诊断与可信度验证"
  - "激波位置"
  - "熵增"
seo:
  title: "激波捕捉：结果诊断与可信度验证"
  description: "把激波捕捉的可信度拆成四个可测量的量：激波位置误差随网格的收敛率、涂抹宽度与单元尺度的比值、过冲幅值、以及跨激波的熵增是否为正且与解析值一致，并给出对应的提取脚本与容差门槛。"
  keywords:
    - "激波捕捉"
    - "结果诊断与可信度验证"
    - "激波位置"
    - "熵增"
    - "过冲"
---

# 激波捕捉：结果诊断与可信度验证

激波捕捉的"激波厚度"永远是数值产物，把它当物理量比较没有意义；能用来验收的是位置、涂抹宽度、过冲幅值和熵增这四个量。本文给出每个量的定义、提取方法、随网格的期望收敛行为，以及一次完整的数值核对。

## 激波位置误差怎么量化

以域长 $L$ 归一化的位置误差定义为

$$
\epsilon_{pos}=\frac{\left|x_s^{CFD}-x_s^{exact}\right|}{L}
$$

$x_s^{exact}$ 可由激波速度与时间得到。二阶 TVD 格式在均匀网格上位置误差应按一阶到二阶收敛（受间断限制器影响，实际常为一阶）。三套网格的 $\epsilon_{pos}$ 若在 1.2%、0.6%、0.28% 附近，比值约 2，说明格式行为一致；若从 1.2% 降到 0.15% 再反弹到 0.9%，说明网格或初场在某套分辨率上触发了别的机制，而不是格式问题。

## 涂抹宽度与网格的对应

涂抹宽度用跨越激波 10%～90% 压力变化的单元数度量：

$$
\delta_{smear}=N_c\,\Delta x
$$

TVD 二阶格式的 $N_c$ 约为 3，一阶迎风格式则达到 8 至 10。对 $L=1\ \mathrm{m}$ 的管道，$N_c=3$ 时：500 单元（$\Delta x=2\ \mathrm{mm}$）给出 6 mm；2000 单元（0.5 mm）给出 1.5 mm；8000 单元（0.125 mm）给出 0.375 mm。$N_c$ 本身应随网格稳定在 3 附近；若 $N_c$ 从 3 涨到 7，说明限制器在更细网格上被触发得更频繁，通常是变量在间断附近的梯度比 $r$ 变得不稳定。

## 过冲与欠冲的识别

过冲定义为波后峰值超出解析波后值的相对量：

$$
\eta_{over}=\frac{p_{max}-p_2}{p_2}
$$

以上一节 $M_s=1.728$ 的算例，解析 $p_2=336180\ \mathrm{Pa}$。无限制的中心格式可给出 376 kPa，$\eta_{over}=11.8\%$；minmod 限制器下为 340 kPa，$\eta_{over}=1.1\%$；superbee 下为 344 kPa，$\eta_{over}=2.3\%$。工程容差取 2%：超过 2% 说明格式无界，低于 2% 但接触间断被抹平说明限制器过强，需要在这两个方向之间取舍。

## 熵增必须为正

跨激波的熵增由状态量直接算出：

$$
\Delta s=c_p\ln\frac{T_2}{T_1}-R\ln\frac{p_2}{p_1}
$$

取 $T_1=300\ \mathrm{K}$、$T_2=443.6\ \mathrm{K}$、$p_2/p_1=3.318$、$c_p=1005\ \mathrm{J/(kg\cdot K)}$、$R=287\ \mathrm{J/(kg\cdot K)}$：

$$
\Delta s=1005\ln 1.4787-287\ln 3.318=1005\times0.3912-287\times1.1991=393.1-344.1=49.0\ \mathrm{J/(kg\cdot K)}
$$

物理上必须 $\Delta s>0$。若数值解在激波处给出 $\Delta s<0$，那不是精度问题而是格式缺陷——出现了非物理的膨胀激波，通常源于熵修正缺失或限制器越界。把 $\Delta s$ 沿激波法向积分成一条曲线，还能看出熵产生是否被涂抹到 20 个单元以上：涂抹越宽，熵增曲线越平缓，总压损失会被系统性低估。

## 与精确解对照的容差

| 检验量 | 容差 | 越界时优先检查 |
|---|---|---|
| 激波位置 $\epsilon_{pos}$ | < 1%（粗网格可放宽到 2%） | 网格分辨率与初场对称性 |
| 涂抹单元数 $N_c$ | 2～4（二阶格式） | 限制器类型与 CFL 数 |
| 过冲 $\eta_{over}$ | < 2% | 格式有界性与限制器强度 |
| 熵增 $\Delta s$ | 与解析值偏差 < 5% 且恒为正 | 熵修正与通量函数选择 |
| 总压比 $p_{0,2}/p_{0,1}$ | 与 0.843 偏差 < 3% | 激波涂抹宽度与网格耗散 |

## 算例：波后压力、总压损失与熵增的核对

```python
import math
g, R, cp = 1.4, 287.0, 1005.0
T1, p1, W = 300.0, 101325.0, 600.0
a1 = math.sqrt(g * R * T1)            # 347.2 m/s
Ms = W / a1                           # 1.728
pr = 1 + 2 * g / (g + 1) * (Ms**2 - 1)          # 3.318
rr = (g + 1) * Ms**2 / (2 + (g - 1) * Ms**2)    # 2.244
T2 = T1 * pr / rr                     # 443.6 K
p0r = (rr ** (g / (g - 1))) * ((g + 1) / (2 * g * Ms**2 - (g - 1))) ** (1 / (g - 1))
ds = cp * math.log(T2 / T1) - R * math.log(pr)
print(a1, Ms, pr, rr, T2, p0r, ds)    # ... 0.8427, 49.0

# 网格收敛记录（位置误差与涂抹宽度）
for n in (500, 2000, 8000):
    dx = 1.0 / n
    print(n, dx, 3 * dx, abs(0.312 - 0.300) / 1.0 if n == 500 else "-")
```

配套的提取命令：

```bash
# 取激波前后压力剖面，用于定位与涂抹宽度统计
postProcess -func "graph(y=0,z=0,p)" -time 0.0005
postProcess -func "fieldMinMax(p)" -time 0.0005
# 检查质量守恒（保守格式应保持在机器精度量级）
postProcess -func "volFieldValue(volFieldValue1)" -time 0.0005
```

## 诊断表：现象、根因、判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 位置误差在网格细化后不降反升 | 初场不对称或激波与块界面相交 | 检查激波是否跨块，比较对称位置的波速 |
| 过冲 $\eta_{over}=11.8\%$ 且波后振荡 | 格式无界，限制器在间断处未生效 | 换 minmod 重算，观察峰值是否回到 2% 内 |
| 熵增算出来是负值 | 出现膨胀激波，熵修正缺失 | 把熵修正阈值从 0.05a 提到 0.1a 后重算 |
| 总压损失比解析值低 4% | 激波涂抹过宽，耗散把损失摊平 | 加密激波法向网格，观察 $p_{0,2}/p_{0,1}$ 是否趋近 0.843 |
| 强激波前出现锯齿状密度扰动 | 奇偶失稳或 carbuncle 现象 | 改用 HLLC/HLL 通量并降低 CFL 重算 |

## 验证记录该留什么

记录里应并列：三套网格的 $\epsilon_{pos}$ 与 $N_c$、过冲幅值、$\Delta s$ 的数值解与解析解、$p_{0,2}/p_{0,1}$ 的数值与 0.843 的偏差、以及质量守恒的相对误差。若 $\epsilon_{pos}$ 与 $\Delta s$ 同时收敛而 $N_c$ 保持不变，说明格式行为正常；若 $N_c$ 随网格持续增大，即使位置误差在降，也应先解决限制器问题，否则更细的网格只会让激波更"糊"。

## 参考文献

1. Sod G.A., "A survey of several finite difference methods for systems of nonlinear hyperbolic conservation laws", *Journal of Computational Physics*, 27(1), 1–31, 1978.
2. Quirk J.J., "A contribution to the great Riemann solver debate", *International Journal for Numerical Methods in Fluids*, 18(6), 555–574, 1994.
3. Woodward P., Colella P., "The numerical simulation of two-dimensional fluid flow with strong shocks", *Journal of Computational Physics*, 54(1), 115–173, 1984.
4. Harten A., Lax P.D., van Leer B., "On upstream differencing and Godunov-type schemes for hyperbolic conservation laws", *SIAM Review*, 25(1), 35–61, 1983.
5. Lax P.D., "Weak solutions of nonlinear hyperbolic equations and their numerical computation", *Communications on Pure and Applied Mathematics*, 7(1), 159–193, 1954.
6. Richtmyer R.D., Morton K.W., *Difference Methods for Initial-Value Problems*, 2nd ed., Interscience Publishers, 1967.
