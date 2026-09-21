---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-internal-duct-flow-diagnosis-validation
title: "内流与管网流动：结果诊断与可信度验证"
summary: "内流算例的压降与流量分配偏差大多来自发展段未排除、出口边界太近、粗糙度遗漏和格式耗散。本文给出达西摩擦因子、质量收支与并联支路分配的手算核对方法及具体阈值。"
category:
  slug: physics
  name: "流体力学基础"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "流体力学基础"
  - "内流与管网流动"
  - "结果诊断与可信度验证"
  - "达西摩擦因子"
  - "质量收支"
seo:
  title: "内流与管网流动：结果诊断与可信度验证"
  description: "内流算例的压降与流量分配偏差大多来自发展段未排除、出口边界太近、粗糙度遗漏和格式耗散。本文给出达西摩擦因子、质量收支与并联支路分配的手算核对方法及具体阈值。"
  keywords:
    - "内流与管网流动"
    - "结果诊断与可信度验证"
    - "达西摩擦因子"
    - "质量收支"
---

# 内流与管网流动：结果诊断与可信度验证

管道算例最常见的"结果不对"是压降偏高或偏低 10%～30%，而求解器给出的残差曲线毫无异常。这类偏差有明确的来源清单：入口发展段被计入、出口边界压在弯头附近、壁面粗糙度没有生效、一阶格式带来额外耗散。本文给出用达西-魏斯巴赫公式与质量收支做独立核对的完整流程，每一步都能手算。

## 1 先手算出应该得到多少压降

充分发展管流的压降由达西-魏斯巴赫公式给出，摩擦因子用 Colebrook-White 隐式式：

$$
\Delta p = f\,\frac{L}{D}\,\frac{1}{2}\rho U^{2}, \qquad \frac{1}{\sqrt{f}} = -2\log_{10}\left(\frac{\varepsilon}{3.7D}+\frac{2.51}{Re\sqrt{f}}\right)
$$

取 $D = 0.05\,\mathrm{m}$ 钢管（$\varepsilon = 0.045\,\mathrm{mm}$）、$U = 2\,\mathrm{m/s}$、水 $\rho = 998.2\,\mathrm{kg/m^3}$、$\mu = 1.003\times10^{-3}\,\mathrm{Pa\cdot s}$：

- $Re = 998.2\times2\times0.05/1.003\times10^{-3} = 9.95\times10^{4}$
- 相对粗糙度 $\varepsilon/D = 4.5\times10^{-5}/0.05 = 9.0\times10^{-4}$
- 速度水头 $\frac{1}{2}\rho U^{2} = 0.5\times998.2\times4 = 1996\,\mathrm{Pa}$
- 迭代 Colebrook 得 $f = 0.0218$

于是每 10 m 直管的压降 $\Delta p = 0.0218\times(10/0.05)\times1996 = 8704\,\mathrm{Pa}$，约 8.7 kPa。这是写进验收表的基准值，偏差超过 5% 就必须解释来源。

## 2 发展段有多长

入口处速度剖面是均匀的，需要一段距离才能发展成充分发展的抛物线或对数剖面。层流与湍流的入口长度分别为：

$$
\frac{L_e}{D} \approx 0.06\,Re \ \ \text{laminar}, \qquad \frac{L_e}{D} \approx 4.4\,Re^{1/6} \ \ \text{turbulent}
$$

上例 $Re = 9.95\times10^{4}$，$Re^{1/6} = 6.81$，$L_e/D = 30.0$，即 $L_e = 1.5\,\mathrm{m}$。若把压降测点放在入口后 0.3 m 处，测到的摩擦因子会明显偏高——这是"算出来比手册大 15%"的头号原因。正确做法是把测点放在 $10D$ 之后，或者直接用周期性（cyclic）边界求充分发展解。

## 3 局部损失的量级与遗漏

弯头、阀门、突扩突缩的局部损失用损失系数 $K$ 表达，同样折算成速度水头：

$$
\Delta p_{\text{minor}} = K\,\frac{1}{2}\rho U^{2}
$$

常用值：锐边入口 $K = 0.5$、90° 长半径弯头 $K = 0.3$、全开闸阀 $K = 0.2$、突扩 $K = \left(1-A_1/A_2\right)^{2}$。一个含 2 个弯头加 1 个阀门的管段，$\sum K = 0.8$，局部损失 $0.8\times1996 = 1597\,\mathrm{Pa}$，相当于额外 1.8 m 直管。若网格在这些位置的流向分辨率不足 5 个单元，分离区会被抹平，$K$ 低估 20% 以上。

## 4 并联支路的流量分配

管网的核心验证量是流量分配。两条并联支路压降相同，因此：

$$
f_1\frac{L_1}{D_1}U_1^{2} = f_2\frac{L_2}{D_2}U_2^{2}
$$

取两支路管径相同（$D = 0.05\,\mathrm{m}$）、长度分别为 $L_1 = 10\,\mathrm{m}$ 与 $L_2 = 20\,\mathrm{m}$，若两路的 $f$ 接近，则 $U_1/U_2 = \sqrt{L_2/L_1} = \sqrt{2} = 1.414$。也就是短支路应走 58.6% 的流量。若 CFD 给出 52%/48% 的近似均分，通常说明网格或格式耗散把阻力差异抹平了，而不是物理上真的均分。

## 5 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压降比手算低 10%～20% | 一阶迎风带来数值耗散，壁面剪切被低估 | 换二阶格式复算，看压降是否上升并接近 $f = 0.0218$ |
| 压降比手算高 15% 以上 | 测点落在发展段内，或壁面粗糙度未生效 | 把测点移到 $10D$ 之后，核对 $\varepsilon$ 是否写入壁面 |
| 出口附近出现回流与压力奇异 | 出口边界压在弯头或突扩下游 | 把出口外移到 10D 之外，观察回流是否消失 |
| 并联支路流量接近均分 | 数值耗散抹平了两路阻力差 | 提高流向分辨率，检查两路 $f$ 的差异 |
| 残差平台但进出口质量不闭合 | 压力-速度耦合未收敛，或出口有回流 | 计算质量不平衡量，要求低于 0.1% |
| 弯头下游速度剖面出现非物理双峰 | 网格在二次流方向过粗 | 在弯头处加密并检查 Dean 涡结构 |

## 6 用质量收支与解析解交叉验证

收敛判据不看残差，看两件事：质量收支与摩擦因子。质量收支的相对不平衡量为

$$
\delta_m = \frac{\left|\sum \dot{m}_{\text{in}} - \sum \dot{m}_{\text{out}}\right|}{\sum \dot{m}_{\text{in}}}
$$

稳态管流要求 $\delta_m < 0.1\%$。若残差已降到 $10^{-5}$ 而 $\delta_m = 2\%$，说明压力-速度耦合尚未真正收敛，继续迭代即可，不必改模型。第二条证据是摩擦因子：由 CFD 的压降反算 $f = 2\Delta p D/(\rho U^{2}L)$，与 Colebrook 值比较。

```bash
# 提取进出口流量，核对质量收支
postProcess -func "flowRatePatch(name=inlet)" -latestTime
postProcess -func "flowRatePatch(name=outlet)" -latestTime

# 用独立脚本反算摩擦因子并与 Colebrook 对比
python3 - <<'PY'
import math
rho, U, D, L = 998.2, 2.0, 0.05, 10.0
dp_cfd = 9120.0                       # CFD 给出的压降, Pa
f_cfd = 2*dp_cfd*D/(rho*U**2*L)
Re, eps = 9.95e4, 4.5e-5
f = 0.02
for _ in range(50):                   # Colebrook 迭代
    f = (-2*math.log10(eps/(3.7*D) + 2.51/(Re*math.sqrt(f))))**-2
print(f"f_cfd={f_cfd:.4f}  f_Colebrook={f:.4f}  偏差={(f_cfd/f-1)*100:.1f}%")
PY
```

## 7 收敛与验收判据

1. $Re$ 是否落在湍流区（$Re > 4000$），层流关联式是否被误用？
2. 压降测点是否在 $10D$ 之外，或是否使用了周期性边界？
3. 壁面粗糙度是否真实写入求解器，还是只写在报告里？
4. 质量收支不平衡量是否低于 0.1%？
5. CFD 反算的 $f$ 与 Colebrook 值偏差是否小于 5%？
6. 并联支路的流量分配是否与 $1/\sqrt{L}$ 量级关系一致？
7. 对流格式是否为二阶或更高，网格加密后压降变化是否小于 2%？

## 8 参考文献

1. Colebrook C.F., "Turbulent Flow in Pipes, with Particular Reference to the Transition Region between the Smooth and Rough Pipe Laws," *Journal of the Institution of Civil Engineers*, 1939.
2. Moody L.F., "Friction Factors for Pipe Flow," *Transactions of the ASME*, 1944.
3. Idelchik I.E., *Handbook of Hydraulic Resistance*, 3rd ed., Begell House, 1994.
4. White F.M., *Fluid Mechanics*, 8th ed., McGraw-Hill, 2016.
