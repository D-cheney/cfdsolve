---
template_version: "flowlab-knowledge/1.0"
slug: cfd-boundary-periodic-boundary-diagnosis-validation
title: "周期与循环边界：结果诊断与可信度验证"
summary: "校验单通道周期解能否代表整环：量化面匹配残差、通道通量闭合与周向模态截断，给出 OpenFOAM cyclic 配置与多通道对照诊断流程。"
category:
  slug: boundary-conditions
  name: "边界条件与初始化"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "边界条件与初始化"
  - "周期与循环边界"
  - "结果诊断与可信度验证"
  - "周期性残差"
  - "周向模态"
seo:
  title: "周期与循环边界：结果诊断与可信度验证"
  description: "校验单通道周期解能否代表整环：量化面匹配残差、通道通量闭合与周向模态截断，给出 OpenFOAM cyclic 配置与多通道对照诊断流程。"
  keywords:
    - "周期与循环边界"
    - "结果诊断与可信度验证"
    - "cyclicAMI"
    - "周期性残差"
    - "周向模态"
---

# 周期与循环边界：结果诊断与可信度验证

单通道周期计算把整环的 $N$ 个叶片压缩成 1 个，代价是只保留周向模态中节点直径为 $N$ 的整数倍那一小部分。绝大多数叶轮机械算例中这个假设成立，但一旦出现非整数倍节点直径的旋转失速、周向不均匀来流或长波长进口畸变，单通道结果就会给出虚假的稳定解。本文给出三项可量化检查——周期面匹配残差、通道通量闭合、周向模态可分辨性——以及用 2～3 通道算例做对照的验证流程。

## 周期角与通道几何的换算

旋转周期边界的两侧相差一个节距角。对 $N$ 个均布叶片，

$$
\theta_p = \frac{360^\circ}{N}
$$

取平均半径 $r = 0.5\ \mathrm{m}$、叶片数 $N = 46$，则 $\theta_p = 360/46 = 7.826^\circ$，周向节距

$$
s = \frac{2\pi r}{N} = \frac{2\pi \times 0.5}{46} = 68.3\ \mathrm{mm}
$$

若弦长 $c = 80\ \mathrm{mm}$，节距弦长比 $s/c = 0.854$，落在轴流涡轮的常规区间 $0.7 \sim 0.9$。若计算时把 $N$ 误填成 45，$\theta_p$ 变成 $8.000^\circ$，节距变成 $69.8\ \mathrm{mm}$，周期面在几何上就错位 $1.5\ \mathrm{mm}$——`checkMesh` 会报周期面不匹配，但若使用 `cyclicAMI` 容错匹配，几何错误会被插值抹平而不报错，这时必须靠通量闭合检查来发现。

## 周期面匹配残差

`cyclic` 要求两侧面网格一一对应，`cyclicAMI` 允许非一致网格但引入插值误差。诊断量是映射后两侧场量的最大相对偏差：

$$
\varepsilon_\phi = \frac{\max \left| \phi_A - \phi_B^{\,\mathrm{rot}} \right|}{\phi_{ref}} \times 100\%
$$

以入口轴向速度 $60\ \mathrm{m/s}$ 为参考，若映射后两侧最大偏差为 $0.03\ \mathrm{m/s}$，则 $\varepsilon_\phi = 0.05\%$。阈值：`cyclic` 应低于 $0.01\%$（此时残差纯粹来自迭代未收敛），`cyclicAMI` 允许到 $0.1\%$，超过 $0.5\%$ 说明插值权重或面法向有系统性错误，会持续污染下游尾迹。

残差还随迭代单调下降才正常。若 $\varepsilon_\phi$ 在收敛后稳定在 $2\%$ 不再下降，典型的根因是两侧面的旋转轴定义不一致：OpenFOAM 中 `rotationAxis` 与 `rotationCentre` 必须与几何建模时的实际轴完全一致，轴偏 0.5 mm 在 $r = 0.5\ \mathrm{m}$ 处就产生 $0.1\%$ 的角向错位。

## 通道通量与整环量的闭合

周期边界不传递净质量，因此穿过周期面对的通量必须严格抵消：

$$
\dot m_A + \dot m_B = 0
$$

更实用的检查是把单通道结果外推到整环，与已知总流量对照。单通道入口面积 $A = s \times b = 68.3\ \mathrm{mm} \times 100\ \mathrm{mm} = 6.83\times 10^{-3}\ \mathrm{m^2}$，空气密度 $\rho = 1.20\ \mathrm{kg/m^3}$，入口法向速度 $32.0\ \mathrm{m/s}$：

$$
\dot m_{passage} = \rho A u_n = 1.20 \times 6.83\times 10^{-3} \times 32.0 = 0.262\ \mathrm{kg/s}
$$

整环 46 个通道合计 $0.262 \times 46 = 12.1\ \mathrm{kg/s}$。若试验台测得总流量 $12.0\ \mathrm{kg/s}$，相对偏差 $0.8\%$，属可接受；若偏差超过 $3\%$，先检查是否把 $N$ 用错，再检查入口是否被施加了额外的堵塞。

## 周向模态：单通道能分辨什么

整环上的周向扰动可分解为节点直径 $m$ 的模态，波长 $\lambda_m = 2\pi r/m$。单通道只允许满足

$$
m = k N, \qquad k = 0, 1, 2, \dots
$$

的模态存在，其余模态在周期边界上被迫"首尾相接"，被人为抑制或混叠到 $m = 0$。这意味着 $N = 46$ 的单通道算例原则上无法捕捉任何 $m = 1 \sim 45$ 的低阶模态，而旋转失速、进口畸变传递、叶片颤振的典型模态恰恰落在这个区间。物理上这类模态的判据是周向波长与节距之比：若 $\lambda_m / s > 3$，单通道假设即失效，必须改用多通道或全环。

## 与多通道算例的对照

最可靠的验证是复制 2～3 个通道做同一算例，比较积分量：

| 检查项 | 单通道 | 3 通道 | 判据 |
| --- | --- | --- | --- |
| 单通道质量流量 | $0.262\ \mathrm{kg/s}$ | $0.259\ \mathrm{kg/s}$ | 偏差 $< 2\%$ |
| 总压损失系数 | $0.0812$ | $0.0796$ | 偏差 $< 5\%$ |
| 出口气流角 | $62.4^\circ$ | $61.8^\circ$ | 偏差 $< 1^\circ$ |
| 周期面残差 | $0.05\%$ | $0.04\%$ | 量级一致 |

若 3 通道结果与单通道偏差超过上表判据，且 3 通道内部三个通道之间本身就不一致（例如通道间流量相差 $4\%$），说明物理上存在非整数倍节点直径模态，单通道结论不可用。反之，若三个通道互相一致且与单通道一致，则单通道假设得到验证。

## 配置与检查命令

```text
// constant/polyMesh/boundary 中的周期对（由 createPatch 生成）
periodic1
{
    type            cyclic;
    inGroups        1(cyclic);
    nFaces          1240;
    startFace       48210;
    matchTolerance  1e-4;
    neighbourPatch  periodic2;
    transform       rotational;
    rotationAxis    (0 0 1);
    rotationCentre  (0 0 0);
    rotationAngle   7.82608695652174;      // 360/46
}
```

```bash
# 1) 几何与周期对检查
checkMesh -allGeometry -allTopology 2>&1 | grep -i -E "cyclic|non-orthogonality"

# 2) 周期面通量与残差
postProcess -func "surfaceFieldValue(name=periodic1,operation=sum,fields=(phi))" -latestTime
postProcess -func "surfaceFieldValue(name=periodic2,operation=sum,fields=(phi))" -latestTime

# 3) 两侧压力场的映射偏差（需先输出面场）
postProcess -func "patchAverage(name=periodic1,p)" -latestTime
postProcess -func "patchAverage(name=periodic2,p)" -latestTime
```

第 2 步两条命令的输出必须数值相等、符号相反；若相差超过入口通量的 $0.1\%$，说明周期对在拓扑上没有被求解器识别为同一对。

## 失败模式对照

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 收敛后 $\varepsilon_\phi$ 停在 $2\%$ 不降 | `rotationCentre` 与几何实际轴不一致 | 比较两侧面质心到轴的距离，差值应 $< 10^{-5}\ \mathrm{m}$ |
| 周期面两侧 $\phi$ 通量不等 | 周期对未被识别，退化为两个独立 patch | 两条 `surfaceFieldValue` 命令结果比对，必须严格反号 |
| 单通道流量外推与试验差 $> 3\%$ | 叶片数 $N$ 用错或节距算错 | 复核 $\theta_p = 360/N$ 与 $s = 2\pi r/N$ |
| 3 通道算例内部通道间流量差 $4\%$ | 存在 $m$ 非 $N$ 倍数的周向模态 | 检查是否为旋转失速工况，改用全环 |
| 出口气流角比试验小 $3^\circ$ 以上 | 单通道抑制了周向混合与二次流 | 对比 3 通道出口气流角，偏差应 $< 1^\circ$ |
| `cyclicAMI` 算例残差周期性尖峰 | AMI 插值在低权重点产生噪声 | 输出 AMI 权重场，检查是否有面权重 $< 0.1$ |

## 参考文献

1. Erdos J.I., Alzner E., McNally W., "Numerical Solution of Periodic Transonic Flow through a Fan Stage", *AIAA Journal*, 15(11), 1559-1568, 1977.
2. Denton J.D., "Loss Mechanisms in Turbomachines", *ASME Journal of Turbomachinery*, 115(4), 621-656, 1993.
3. Horlock J.H., *Axial Flow Turbines: Fluid Mechanics and Thermodynamics*, Butterworths, 1966.
4. Cumpsty N.A., *Compressor Aerodynamics*, Longman Scientific & Technical, 1989.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, section "Cyclic patches", v2312, 2023.
