---
template_version: "flowlab-knowledge/1.0"
slug: cae-physics-heat-conduction-diagnosis-validation
title: "热传导离散：结果诊断与可信度验证"
summary: "用半无限体误差函数解、集总热容时间常数与稳态热阻网络三类解析基准验收热分析，给出界面热阻反演、能量平衡闭合与网格收敛阶的具体算法、阈值和判定试验。"
category:
  slug: physics-discretization
  name: "跨物理场离散算法"
level: 专题
reading_minutes: 9
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "跨物理场离散算法"
  - "热传导离散"
  - "结果诊断与可信度验证"
  - "误差函数解"
  - "热阻网络"
seo:
  title: "热传导离散：结果诊断与可信度验证"
  description: "用半无限体误差函数解、集总热容时间常数与稳态热阻网络三类解析基准验收热分析，给出界面热阻反演、能量平衡闭合与网格收敛阶的具体算法、阈值和判定试验。"
  keywords:
    - "热传导"
    - "结果诊断与可信度验证"
    - "误差函数解"
    - "热阻网络"
    - "能量平衡"
---

# 热传导离散：结果诊断与可信度验证

热分析结果最危险的失效方式不是发散，而是温降被系统性地抹平：界面热阻未生效、辐射未计入、或者数值扩散把梯度磨平，都能给出光滑且看似合理的温度云图。可用的独立证据有三类：半无限体的误差函数解、集总热容的指数衰减、以及稳态热阻网络的解析分配。下面给出各基准的表达式、可核对的手算过程与判定阈值。

## 四类解析基准与验收量

瞬态半无限体基准检验时间推进与物性，验收量是温度剖面与表面热流；集总热容基准检验对流边界与时间常数；稳态热阻网络基准检验界面与串联热阻的实现；一维导热板基准检验空间收敛阶。四者覆盖不同的失效路径，任何一类缺失都可能让系统性错误通过验收。

## 半无限体与误差函数解

初始温度 $T_i$、表面突加到 $T_s$ 的半无限体解为

$$
T(x,t)=T_i+(T_s-T_i)\,\mathrm{erfc}\!\left(\frac{x}{2\sqrt{\alpha t}}\right),
\qquad
q''_s(t)=\frac{k\,(T_s-T_i)}{\sqrt{\pi\alpha t}}.
$$

取钢（$k=45\,\mathrm{W/(m\cdot K)}$、$\alpha=1.22\times10^{-5}\,\mathrm{m^2/s}$）、$T_i=20\,^\circ\mathrm{C}$、$T_s=200\,^\circ\mathrm{C}$、$t=100\,\mathrm{s}$：$2\sqrt{\alpha t}=2\times0.03493=0.06986\,\mathrm{m}$。在 $x=34.93\,\mathrm{mm}$ 处辐角为 $0.5$，$\mathrm{erfc}(0.5)=0.4795$，得 $T=20+0.4795\times180=106.3\,^\circ\mathrm{C}$；在 $x=69.86\,\mathrm{mm}$ 处辐角为 $1.0$，$\mathrm{erfc}(1.0)=0.1573$，得 $T=48.3\,^\circ\mathrm{C}$。表面热流为 $q''_s=45\times180/\sqrt{\pi\times1.22\times10^{-5}\times100}=8100/0.0619=131\,\mathrm{kW/m^2}$。有限元结果与这两个温度点、一个热流值的偏差都应低于 $2\%$；若温度对而热流偏低，通常是表面单元厚度过大导致梯度被平均。

## 集总热容与时间常数

当 Biot 数 $Bi=hL_c/k<0.1$ 时，物体内部温差可忽略，温度按

$$
\frac{T-T_\infty}{T_i-T_\infty}=e^{-t/\tau},
\qquad
\tau=\frac{\rho V c_p}{hA}
$$

衰减。直径 $10\,\mathrm{mm}$ 的钢球（$R=5\,\mathrm{mm}$）：$Bi=hR/(3k)=100\times0.005/(3\times45)=0.0037$，远小于 $0.1$，集总假设成立；$\tau=\rho c_pR/(3h)=7850\times470\times0.005/(3\times100)=61.5\,\mathrm{s}$。于是 $t=61.5\,\mathrm{s}$ 时无量纲温度降到 $e^{-1}=0.368$，$t=184.5\,\mathrm{s}$ 时降到 $e^{-3}=0.0498$。这两点是检验对流边界与热容是否配对的最简基准：若衰减明显快于解析值，先查 $h$ 的单位是否被当成 $\mathrm{W/(m^2\,^\circ C)}$ 与 $\mathrm{W/(m^2K)}$ 混用，再查体积与表面积是否用了同一个特征长度。

## 稳态热阻网络与界面热阻反演

串联热阻给出稳态温升的解析分配：

$$
R_{\mathrm{cond}}=\frac{L}{kA},
\qquad
R_{\mathrm{conv}}=\frac{1}{hA},
\qquad
R_c^{\mathrm{area}}=\frac{\Delta T}{q''}.
$$

以 $20\,\mathrm{mm}\times20\,\mathrm{mm}$ 的芯片为例：硅片厚 $0.5\,\mathrm{mm}$、$k=148\,\mathrm{W/(m\cdot K)}$，$A=4\times10^{-4}\,\mathrm{m^2}$，得 $R_{\mathrm{die}}=5\times10^{-4}/(148\times4\times10^{-4})=8.45\times10^{-3}\,\mathrm{K/W}$；界面热阻 $R_c=2\times10^{-5}\,\mathrm{m^2K/W}$ 折合 $2\times10^{-5}/4\times10^{-4}=0.05\,\mathrm{K/W}$；散热器 $0.3\,\mathrm{K/W}$。总热阻 $0.3585\,\mathrm{K/W}$，功耗 $100\,\mathrm{W}$ 时结温升高 $35.8\,\mathrm{K}$，其中界面占 $5.0\,\mathrm{K}$、硅片占 $0.85\,\mathrm{K}$、散热器占 $30.0\,\mathrm{K}$。

反向使用同一条关系即可从实测反演界面热阻：热流密度 $q''=100/4\times10^{-4}=250\,\mathrm{kW/m^2}$，若实测界面温降为 $5.0\,\mathrm{K}$，则 $R_c=5.0/250000=2.0\times10^{-5}\,\mathrm{m^2K/W}$。反演值若比材料手册低一个数量级，说明界面在网格中实际共了节点，热阻单元没有参与热流路径。

## 能量平衡与收敛阶

每次瞬态输出后核对

$$
\int_S q''_{\mathrm{in}}\,dS-\int_S q''_{\mathrm{out}}\,dS-\frac{dU}{dt}=0,
\qquad
U=\int_V \rho c_p T\,dV .
$$

输入 $100\,\mathrm{W}$、输出 $99.8\,\mathrm{W}$、内能变化率 $0.2\,\mathrm{W}$ 时闭合误差为 $0.2\%$，低于 $0.5\%$ 的验收阈值。一维导热板的网格收敛数据如下：

| $h$ / mm | $T_{\max}$ / $^\circ\mathrm{C}$ | 误差 / K | 误差比 |
|---|---|---|---|
| 4.0 | 100.320 | 0.320 | — |
| 2.0 | 100.080 | 0.080 | 4.00 |
| 1.0 | 100.020 | 0.020 | 4.00 |

误差比稳定在 $4$，观测阶 $p=\ln 4/\ln 2=2.00$，与线性单元在 $L^2$ 范数下的理论阶一致。Richardson 外推给出 $T_{\mathrm{ex}}=100.020+(100.020-100.080)/3=100.0000\,^\circ\mathrm{C}$，与解析值完全一致到四位小数。若观测阶只有 $1.0$ 左右，通常是表面热流边界被施加在节点而非面上，或界面处网格不匹配导致一阶插值。

## 症状、根因与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 半无限体剖面在 $x=34.93\,\mathrm{mm}$ 处偏高超过 $2\%$ | 表面单元过厚，梯度被平均 | 把首层单元厚度减半，观察该点温度是否向 $106.3\,^\circ\mathrm{C}$ 收敛 |
| 表面热流比 $131\,\mathrm{kW/m^2}$ 低 $10\%$ 以上 | 用了平均温度代替表面温度算梯度 | 输出面心温度并重算 $q''=-k\nabla T\cdot n$ |
| 集总体衰减比 $e^{-t/61.5}$ 快得多 | $h$ 的单位或体积表面积特征长度混用 | 用解析 $\tau=61.5\,\mathrm{s}$ 核对，检查 $h$ 是否为 $\mathrm{W/(m^2K)}$ |
| 结温升高远低于 $35.8\,\mathrm{K}$ | 界面共节点，$R_c$ 未进入热流路径 | 反演 $R_c$，$250\,\mathrm{kW/m^2}$ 下应得到 $2.0\times10^{-5}$ |
| 能量闭合误差超过 $0.5\%$ | 相变潜热或辐射项未计入内能变化 | 把 $h_r=4\epsilon\sigma T_m^3$ 并入边界后复测 |
| 收敛阶只有 $1.0$ | 表面热流施加在节点或界面插值不匹配 | 改用一致面载荷并检查界面网格匹配度 |

## 可复算的验证脚本

```python
import math
from math import erfc, sqrt, pi
k, alpha, Ti, Ts, t = 45.0, 1.22e-5, 20.0, 200.0, 100.0   # 钢
for x in (0.03493, 0.06986):
    T = Ti + (Ts-Ti)*erfc(x/(2*sqrt(alpha*t)))
    print(f"x={x*1e3:6.2f}mm  T={T:7.2f}C")
qs = k*(Ts-Ti)/sqrt(pi*alpha*t)
print(f"q''_s={qs/1e3:.1f} kW/m2")
Tv = [100.320, 100.080, 100.020]
e  = [abs(v-100.0) for v in Tv]
p  = math.log(e[0]/e[1], 2)
print(f"p={p:.2f}  T_ex={Tv[2]+(Tv[2]-Tv[1])/(2**p-1):.4f}C")
# x= 34.93mm  T= 106.31C
# x= 69.86mm  T=  48.31C
# q''_s=130.8 kW/m2
# p=2.00  T_ex=100.0000C
```

## 参考文献

1. Carslaw, H. S. & Jaeger, J. C. *Conduction of Heat in Solids*. 2nd ed., Oxford University Press, 1959.
2. Incropera, F. P., DeWitt, D. P., Bergman, T. L. & Lavine, A. S. *Fundamentals of Heat and Mass Transfer*. 6th ed., Wiley, 2007.
3. Roache, P. J. *Verification and Validation in Computational Science and Engineering*. Hermosa Publishers, 1998.
4. Madhusudana, C. V. *Thermal Contact Conductance*. 2nd ed., Springer, 2014.
5. Patankar, S. V. *Numerical Heat Transfer and Fluid Flow*. Hemisphere Publishing, 1980.
6. Oberkampf, W. L. & Roy, C. J. *Verification and Validation in Scientific Computing*. Cambridge University Press, 2010.