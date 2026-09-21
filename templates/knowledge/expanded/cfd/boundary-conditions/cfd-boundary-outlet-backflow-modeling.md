---
template_version: "flowlab-knowledge/1.0"
slug: cfd-boundary-outlet-backflow-modeling
title: "出口回流处理：物理建模与适用边界"
summary: "区分物理回流与计算域截断伪影，给出突扩与钝体回流长度的量级估算、Orlanski 辐射条件与出口压力的两种给法及其适用范围。"
category:
  slug: boundary-conditions
  name: "边界条件与初始化"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "边界条件与初始化"
  - "出口回流处理"
  - "物理建模与适用边界"
  - "Orlanski 辐射条件"
  - "突扩回流"
seo:
  title: "出口回流处理：物理建模与适用边界"
  description: "区分物理回流与计算域截断伪影，给出突扩与钝体回流长度的量级估算、Orlanski 辐射条件与出口压力的两种给法及其适用范围。"
  keywords:
    - "出口回流处理"
    - "物理建模与适用边界"
    - "回流长度"
    - "辐射边界条件"
    - "压力出口"
---

# 出口回流处理：物理建模与适用边界

出口回流不是数值故障的同义词。扩压器、突扩、钝体尾迹、强旋流燃烧室在真实运行中都存在逆流区，把它压掉等于篡改物理；但在计算域过短或出口切进分离泡时出现的回流又纯粹是截断造成的。区分这两类回流决定了后续该延长计算域还是该正确指定回流变量。本文给出回流尺度的量级估算、出口压力的两种给法及其后果，以及非反射出口的适用条件。

## 两类回流的判别逻辑

判别的核心是**回流区是否被出口截面截断**。真实回流区有闭合的再循环结构：流体在分离点离开壁面，在再附点重新贴壁，回流区沿流向有确定的长度 $L_r$。若出口位于 $x < L_r$ 的位置，出口截面上必然存在逆流，且这个逆流区会随计算域延长而缩小、最终消失——这是截断伪影的指纹。反之，若把出口外移到 $x > 2L_r$ 后逆流仍然存在，且形态不随域长改变，则为物理回流，此时必须给出回流温度、湍流量与组分。

这个判据可以量化：延长出口后，记录出口逆流面积占比 $\Phi = A_{bf}/A_{out}$。若 $\Phi$ 随域长单调下降并在某长度后趋于常数，该常数即为物理回流的真实占比；若 $\Phi$ 持续下降不收敛，说明仍未脱离分离区。

## 突扩与钝体的回流尺度估算

对轴对称突扩，设上游直径 $D_1$、下游直径 $D_2$，台阶高度 $h = (D_2 - D_1)/2$。湍流条件下再附长度约为

$$
\frac{L_r}{h} \approx 6 \sim 8
$$

取内径 $D_1 = 50\ \mathrm{mm}$ 突扩到 $D_2 = 100\ \mathrm{mm}$，则 $h = 25\ \mathrm{mm}$，$L_r \approx 8 \times 25 = 200\ \mathrm{mm}$，即下游约 $2D_2$。若上游流速 $U_1 = 5\ \mathrm{m/s}$、介质为水（$\rho = 998\ \mathrm{kg/m^3}$，$\mu = 10^{-3}\ \mathrm{Pa\cdot s}$），台阶雷诺数 $Re_h = \rho U_1 h/\mu = 998 \times 5 \times 0.025/10^{-3} = 1.25\times 10^5$，属于充分湍流，用 $L_r/h = 8$ 合适；若 $Re_h < 400$ 则回流区拉长到 $L_r/h \approx 10 \sim 12$ 且不再自相似。

突扩的不可逆压损由 Borda-Carnot 关系给出：

$$
K = \left( 1 - \frac{A_1}{A_2} \right)^2, \qquad \Delta p = K \frac{1}{2}\rho U_1^2
$$

面积比 $A_1/A_2 = (50/100)^2 = 0.25$，故 $K = 0.75^2 = 0.5625$，$\Delta p = 0.5625 \times 0.5 \times 998 \times 5^2 = 7018\ \mathrm{Pa}$。这个压损是出口压力设置的下界参照：若 CFD 给出的突扩压降远小于 $7.0\ \mathrm{kPa}$，多半是出口位置切进了回流区，把不可逆损失"漏"出了计算域。

## 出口压力的两种给法及其后果

出口只允许一个自由度（不可压缩流为压力水平），但压力的**类型**可以不同：

- 给定**静压**：速度由内部解与外推共同决定，是内流标准做法。回流速度由压力梯度自然产生，物理上自洽。
- 给定**总压**：隐含规定了回流速度量级。回流区里总压几乎等于静压（动压小），因此给定总压会把回流速度强行压到接近零，抑制逆流。

第二种给法在扩压器算例中会给出偏乐观的结果：逆流被人为消除，出口压降偏低。若必须用总压（例如与上游总压入口配对做压差驱动系统），应同时用 `pressureInletOutletVelocity` 让速度在逆流时由压力反算，而不是固定为零。

## 辐射条件与对流出口的适用条件

非定常流动中，出口应允许涡结构以接近非反射的方式穿出。Orlanski 辐射条件的形式是

$$
\frac{\partial \phi}{\partial t} + c \frac{\partial \phi}{\partial n} = 0, \qquad
c = -\frac{\partial \phi / \partial t}{\partial \phi / \partial n}
$$

其中 $\phi$ 可取速度分量或压力，$c$ 是由边界上局部时间导数与法向梯度反算的对流速度。数值上 $c$ 需做上下限裁剪（$0 \le c \le U_{max}$）以避免梯度趋零时发散。一次可核对的估算：若在时间步 $\Delta t = 10^{-3}\ \mathrm{s}$ 内出口某点速度变化 $0.05\ \mathrm{m/s}$，同点法向梯度为 $12\ \mathrm{s^{-1}}$，则

$$
c = -\frac{0.05/10^{-3}}{12} = -4.17\ \mathrm{m/s}
$$

取绝对值 $4.17\ \mathrm{m/s}$ 作为该点的对流速度，与主流速度 $5\ \mathrm{m/s}$ 同量级，说明裁剪上限设为 $U_{max}$ 是必要的。这类边界适合周期性尾迹与涡脱落；对定常求解器没有意义，因为 $\partial\phi/\partial t \equiv 0$ 使 $c$ 无法定义。

## 回流量化与阈值

回流的危害程度由质量流量而非面积占比决定。设出口面积 $A_{out} = \pi D_2^2/4 = 7.854\times 10^{-3}\ \mathrm{m^2}$，若逆流面积占 $\Phi = 30\%$，逆流区平均法向速度 $0.6\ \mathrm{m/s}$，则逆流质量流量

$$
\dot m_{bf} = \rho A_{out} \Phi \bar{u}_{bf} = 998 \times 7.854\times 10^{-3} \times 0.30 \times 0.6 = 1.41\ \mathrm{kg/s}
$$

入口质量流量 $\dot m_{in} = \rho A_1 U_1 = 998 \times 1.9635\times 10^{-3} \times 5 = 9.80\ \mathrm{kg/s}$，故逆流占比 $1.41/9.80 = 14.4\%$。稳态算例中逆流占比超过 $5\%$ 就必须显式指定回流变量，否则默认值会通过出口持续注入错误的温度与湍流量。

## 出口边界字典

```text
boundaryField
{
    outlet
    {
        type            pressureInletOutletVelocity;   // 逆流时速度由压力反算
        value           uniform (0 0 0);
    }
}

// 0/p 出口：只给压力水平，速度由内部解决定
boundaryField
{
    outlet
    {
        type            fixedValue;
        value           uniform 0;                     // 表压基准
    }
}

// 逆流时携带的温度与湍流量，必须取外部环境代表值
// 0/T
outlet
{
    type            inletOutlet;
    inletValue      uniform 293.15;                    // 20 C
    value           uniform 293.15;
}

// 0/k
outlet
{
    type            inletOutlet;
    inletValue      uniform 0.24;                      // 按来流强度反算
    value           uniform 0.24;
}
```

运行后用 `postProcess -func 'surfaceFieldValue(name=outlet,operation=sum,fields=(phi))'` 拿到出口净通量，用 `fieldMinMax` 检查 $k$ 在出口面是否出现低于入口一个量级的异常值——那是默认值填充的痕迹。

## 失败模式对照

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 出口逆流面积随域长单调下降 | 出口切进分离泡，属截断伪影 | 出口外移 $1L_r$ 重算，若 $\Phi$ 减半则继续外移 |
| 域长加倍后逆流形态不变 | 物理回流，需要显式回流变量 | 检查回流温度/湍流量是否等于外部环境值 |
| 突扩压降远低于 $7.0\ \mathrm{kPa}$ | 出口给了总压，逆流速度被压制 | 改为固定静压，比较压降是否上升 |
| 残差在出口附近反复跳变 | 默认回流值与环境差 100 K 以上 | 输出出口逆流点温度，与外部环境逐点对比 |
| 周期性尾迹算例出口反射明显 | 用了定常压力出口，无对流项 | 改用 `waveTransmissive`，观察出口压力频谱是否变干净 |
| 出口面出现 $k$ 极低值 | `inletOutlet` 的 `inletValue` 未按环境设定 | `fieldMinMax` 读出口面 $k$ 最小值，应不低于环境的 $1/2$ |

## 参考文献

1. Orlanski I., "A Simple Boundary Condition for Unbounded Hyperbolic Flows", *Journal of Computational Physics*, 21(3), 251-269, 1976.
2. Eaton J.K., Johnston J.P., "A Review of Research on Subsonic Turbulent Flow Reattachment", *AIAA Journal*, 19(9), 1093-1100, 1981.
3. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
4. Borda J.C., "Mémoire sur l'écoulement des fluides dans les tuyaux cylindriques", *Mémoires de l'Académie Royale des Sciences*, 1766.
5. OpenFOAM Foundation, *OpenFOAM User Guide: pressureInletOutletVelocity and inletOutlet Boundaries*, v2312, 2023.
