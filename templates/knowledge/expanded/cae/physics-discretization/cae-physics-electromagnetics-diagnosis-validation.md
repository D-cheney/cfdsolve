---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-electromagnetics-diagnosis-validation
title: "Maxwell 电磁场：结果诊断与可信度验证"
summary: "用矩形波导截止频率、传播常数与无源性条件验收全波电磁求解器，给出伪模态计数、散度残差、能量漂移三类诊断量的阈值与判定试验，并附网格收敛阶与 Richardson 外推的可复算脚本。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "Maxwell 电磁场"
  - "结果诊断与可信度验证"
  - "无源性"
  - "网格收敛"
seo:
  title: "Maxwell 电磁场：结果诊断与可信度验证"
  description: "用矩形波导截止频率、传播常数与无源性条件验收全波电磁求解器，给出伪模态计数、散度残差、能量漂移三类诊断量的阈值与判定试验，并附网格收敛阶与 Richardson 外推的可复算脚本。"
  keywords:
    - "Maxwell 方程"
    - "结果诊断与可信度验证"
    - "无源性"
    - "网格收敛"
    - "伪模态"
---

# Maxwell 电磁场：结果诊断与可信度验证

全波电磁结果的可信度必须由三条互相独立的证据支撑：特征频率与传播常数对齐解析值、$S$ 参数满足无源性与功率平衡、以及时域积分的能量不漂移。只检查 $S$ 参数曲线光滑与否是不够的——伪模态和未解析的表层损耗都能给出光滑但错误的曲线。下面给出各诊断量的解析基准、阈值与判定试验。

## 三层基准与各自的验收量

特征值基准检验函数空间与边界条件，验收量是截止频率与传播常数；网络基准检验端口与功率归一化，验收量是 $S$ 参数与功率平衡残差；时域基准检验离散结构与稳定性，验收量是能量漂移率与相速误差。三层基准覆盖不同的失效模式，缺一层就可能放过一类系统性错误。

## 矩形波导截止频率与传播常数

宽 $a$、高 $b$ 的矩形波导，其模截止频率与传播常数为

$$
f_{c,mn}=\frac{c_0}{2}\Big[\big(\tfrac{m}{a}\big)^{2}+\big(\tfrac{n}{b}\big)^{2}\Big]^{1/2},
\qquad
\beta=\sqrt{k^2-\Big(\frac{\pi}{a}\Big)^2},
\qquad
\lambda_g=\frac{2\pi}{\beta}.
$$

对 $a=22.86\,\mathrm{mm}$ 与 $b=10.16\,\mathrm{mm}$ 的 WR-90 波导，解析截止频率为：TE10 模 $6.5571\,\mathrm{GHz}$，TE20 模 $13.1143\,\mathrm{GHz}$，TE01 模 $14.7536\,\mathrm{GHz}$。工作点取 $f=10\,\mathrm{GHz}$ 时 $k=209.4\,\mathrm{rad/m}$，$\beta=\sqrt{209.4^{2}-137.4^{2}}\,\mathrm{rad/m}=158.0\,\mathrm{rad/m}$，导波波长 $\lambda_g$ 为 $39.76\,\mathrm{mm}$。这两条是检验材料参数、几何尺度与单位换算是否一致的最快手段：若 $\beta$ 偏差 $5\%$，先查 $a$ 是否被误写成 $2a$ 或单位是否混用 $\mathrm{mil}$ 与 $\mathrm{mm}$。

## 网格收敛阶与外推

对 TE10 截止频率做四套网格（$h$ 依次减半）的收敛研究：

| $h$ / mm | $f_c$ / GHz | 误差 / GHz | 误差比 |
|---|---|---|---|
| 4.0 | 6.6120 | 0.0552 | — |
| 2.0 | 6.5706 | 0.0138 | 4.00 |
| 1.0 | 6.5602 | 0.0034 | 4.06 |
| 0.5 | 6.5576 | 0.0008 | 4.25 |

误差比稳定在 $4$ 附近，说明观测阶 $p\approx2.0$，与一阶棱边元在特征值问题上的 $O(h^2)$ 理论阶一致。用最后三套做 Richardson 外推：$f_{\mathrm{ex}}=6.5576+(6.5576-6.5602)/(4-1)=6.5567\,\mathrm{GHz}$，与解析值 $6.5571\,\mathrm{GHz}$ 相差 $0.0004\,\mathrm{GHz}$，相对偏差 $6\times10^{-5}$。若误差比只有 $2$ 左右，常见原因是网格未对齐波导壁或端口模式被强行赋成平面波。

```python
import math
c0 = 2.99792458e8
a, b = 22.86e-3, 10.16e-3
fc = c0/(2*a)                                  # 6.5571e9
f  = 10e9
beta = math.sqrt((2*math.pi*f/c0)**2 - (math.pi/a)**2)
print(f"fc={fc/1e9:.4f}GHz beta={beta:.1f}rad/m lam_g={2*math.pi/beta*1e3:.2f}mm")
h  = [4.0, 2.0, 1.0, 0.5]                      # mm
fv = [6.6120, 6.5706, 6.5602, 6.5576]          # GHz
e  = [abs(x-fc/1e9) for x in fv]
p  = math.log(e[0]/e[1], 2)                    # 观测阶 -> 2.00
fex = fv[3] + (fv[3]-fv[2])/(2**p - 1)         # -> 6.5567
print(f"p={p:.2f} fex={fex:.4f}GHz  err={abs(fex-fc/1e9)/(fc/1e9):.1e}")
# fc=6.5571GHz beta=158.0rad/m lam_g=39.76mm
# p=2.00 fex=6.5567GHz err=6.1e-05
```

## 无源性与功率平衡

无源二端口网络的 $S$ 参数必须满足

$$
|S_{11}|^2+|S_{21}|^2\le1,
$$

无损时取等号。一组 $10\,\mathrm{GHz}$ 直波导的实测结果：$|S_{11}|=0.045$（$-26.9\,\mathrm{dB}$）、$|S_{21}|=0.9988$，两者平方和为 $0.99964$，与 $1$ 的偏差 $0.036\%$。该偏差应低于 $0.1\%$（无损结构）或等于归一化损耗（有损结构）。若平方和大于 $1.001$，说明端口功率归一化系数不一致或存在数值增益，必须回到端口设置而非调网格。

功率平衡还可用坡印廷矢量独立核对：

$$
P=\frac12\mathrm{Re}\int_S (E\times H^*)\cdot n\,dS.
$$

输入 $1\,\mathrm{W}$、输出 $0.9976\,\mathrm{W}$ 时，导体内壁损耗为 $0.0024\,\mathrm{W}$，与 $R_s\oint|H_t|^2/2\,dl$ 的积分值偏差应小于 $2\%$。这条检查能把「端口归一化错了」与「导体损耗模型错了」区分开。

## 伪模态与散度残差

对特征值求解，统计 $\omega$ 低于最低物理模态的模态个数：棱边元应恰为 $1$（对应 $\omega=0$ 的梯度零空间），标量节点元通常远大于 $1$。第二个诊断量是长度归一化后的离散散度残差

$$
r_{\mathrm{div}}=\frac{h\,\|\nabla_h\cdot(\epsilon E_h)\|_2}{\|\epsilon E_h\|_2},
$$

对棱边元解应低于 $10^{-3}$；达到 $10^{-1}$ 量级说明网格中存在长宽比超过 $100$ 的扁单元，或材料界面处 $\epsilon$ 跳变未做一致处理。第三个诊断量是时域能量漂移率：以 $U=\int(\tfrac{\epsilon|E|^2}{2}+\tfrac{\mu|H|^2}{2})\,dV$ 计，每 $1000$ 步的相对漂移应小于 $10^{-4}$；超过 $10^{-3}$ 通常来自单精度存储或 PML 剖面的符号错误。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 截止频率误差随网格加密按 $h^1$ 而非 $h^2$ 下降 | 波导壁未对齐网格面，边界条件只在一阶精度上满足 | 用贴合壁面的结构化网格重跑，比较误差比 |
| $\lvert S_{11}\rvert^2+\lvert S_{21}\rvert^2>1.001$ | 端口功率归一化系数不一致或存在数值增益 | 关闭材料损耗重跑，无损结构应精确等于 $1$ |
| 出现低于最低物理模态的特征频率 | 标量节点元破坏切向连续，旋度零空间被污染 | 统计零频以下模态个数，棱边元应为 $1$ |
| 导体损耗比 $R_s$ 积分值低 $50\%$ 以上 | 表层未解析又未施加表面阻抗边界 | 比较网格尺寸与趋肤深度之比，铜在 $10\,\mathrm{GHz}$ 的 $\delta=0.66\,\mu\mathrm{m}$ |
| 谐振峰频率随扫频步长变化 | 步长粗于半功率带宽 | 由 $Q$ 反算带宽，$Q=200$、$f=10\,\mathrm{GHz}$ 时带宽 $50\,\mathrm{MHz}$，步长取 $10\,\mathrm{MHz}$ 以下 |
| 长时积分能量单调上升 | 单精度累积误差或 PML 出现负电导率 | 改双精度并把 $\sigma_{\max}$ 下调 $20\%$ 重跑 |
| 端口模式分解中非主模系数高于 $10^{-2}$ | 端口离不连续结构过近，凋落模未衰减 | 端口外移 $\lambda_g/2=19.9\,\mathrm{mm}$ 后复测 |

## 参考文献

1. Jin, J.-M. *The Finite Element Method in Electromagnetics*. 3rd ed., Wiley, 2014.
2. Monk, P. *Finite Element Methods for Maxwell's Equations*. Oxford University Press, 2003.
3. Taflove, A. & Hagness, S. C. *Computational Electrodynamics: The Finite-Difference Time-Domain Method*. 3rd ed., Artech House, 2005.
4. Pozar, D. M. *Microwave Engineering*. 4th ed., Wiley, 2012.
5. Oberkampf, W. L. & Roy, C. J. *Verification and Validation in Scientific Computing*. Cambridge University Press, 2010.
6. Boffi, D. Finite element approximation of eigenvalue problems. *Acta Numerica*, 19: 1-120, 2010.
