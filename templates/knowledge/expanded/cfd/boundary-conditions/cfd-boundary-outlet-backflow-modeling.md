---
template_version: flowlab-knowledge/1.0
slug: cfd-boundary-outlet-backflow-modeling
title: 出口回流处理：原理与诊断验证
summary: 区分物理回流与计算域截断伪影，给出突扩与钝体回流长度的量级估算、Orlanski 辐射条件与出口压力的两种给法及其适用范围。
category:
  slug: boundary-conditions
  name: 边界条件与初始化
level: 进阶
reading_minutes: 17
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 边界条件与初始化
  - 出口回流处理
  - 物理建模与适用边界
  - Orlanski 辐射条件
  - 突扩回流
  - 结果诊断与可信度验证
  - Richardson 外推
  - 网格收敛指数
seo:
  title: 出口回流处理：原理与诊断验证
  description: 区分物理回流与计算域截断伪影，给出突扩与钝体回流长度的量级估算、Orlanski 辐射条件与出口压力的两种给法及其适用范围。
  keywords:
    - 出口回流处理
    - 物理建模与适用边界
    - 回流长度
    - 辐射边界条件
    - 压力出口
    - 结果诊断与可信度验证
    - 域长收敛
    - Richardson 外推
    - Borda-Carnot 压损
---
# 出口回流处理：原理与诊断验证

出口回流不是数值故障的同义词。扩压器、突扩、钝体尾迹、强旋流燃烧室在真实运行中都存在逆流区，把它压掉等于篡改物理；但在计算域过短或出口切进分离泡时出现的回流又纯粹是截断造成的。区分这两类回流决定了后续该延长计算域还是该正确指定回流变量。"出口够远了吗"这个问题只有一个可验证的答案：把出口逐级外移，看目标量序列是否单调收敛，并用 Richardson 外推给出极限值。单看流场图判断回流是否消失是靠不住的——回流面积可能已经降到 1%，但压降仍在以每级 3% 的速率漂移。

## 基础概念与控制关系

### 突扩与钝体的回流尺度估算

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

### 两类回流的判别逻辑

判别的核心是**回流区是否被出口截面截断**。真实回流区有闭合的再循环结构：流体在分离点离开壁面，在再附点重新贴壁，回流区沿流向有确定的长度 $L_r$。若出口位于 $x < L_r$ 的位置，出口截面上必然存在逆流，且这个逆流区会随计算域延长而缩小、最终消失——这是截断伪影的指纹。反之，若把出口外移到 $x > 2L_r$ 后逆流仍然存在，且形态不随域长改变，则为物理回流，此时必须给出回流温度、湍流量与组分。

这个判据可以量化：延长出口后，记录出口逆流面积占比 $\Phi = A_{bf}/A_{out}$。若 $\Phi$ 随域长单调下降并在某长度后趋于常数，该常数即为物理回流的真实占比；若 $\Phi$ 持续下降不收敛，说明仍未脱离分离区。

### 出口压力的两种给法及其后果

出口只允许一个自由度（不可压缩流为压力水平），但压力的**类型**可以不同：

- 给定**静压**：速度由内部解与外推共同决定，是内流标准做法。回流速度由压力梯度自然产生，物理上自洽。
- 给定**总压**：隐含规定了回流速度量级。回流区里总压几乎等于静压（动压小），因此给定总压会把回流速度强行压到接近零，抑制逆流。

第二种给法在扩压器算例中会给出偏乐观的结果：逆流被人为消除，出口压降偏低。若必须用总压（例如与上游总压入口配对做压差驱动系统），应同时用 `pressureInletOutletVelocity` 让速度在逆流时由压力反算，而不是固定为零。

### 回流量化与阈值

回流的危害程度由质量流量而非面积占比决定。设出口面积 $A_{out} = \pi D_2^2/4 = 7.854\times 10^{-3}\ \mathrm{m^2}$，若逆流面积占 $\Phi = 30\%$，逆流区平均法向速度 $0.6\ \mathrm{m/s}$，则逆流质量流量

$$
\dot m_{bf} = \rho A_{out} \Phi \bar{u}_{bf} = 998 \times 7.854\times 10^{-3} \times 0.30 \times 0.6 = 1.41\ \mathrm{kg/s}
$$

入口质量流量 $\dot m_{in} = \rho A_1 U_1 = 998 \times 1.9635\times 10^{-3} \times 5 = 9.80\ \mathrm{kg/s}$，故逆流占比 $1.41/9.80 = 14.4\%$。稳态算例中逆流占比超过 $5\%$ 就必须显式指定回流变量，否则默认值会通过出口持续注入错误的温度与湍流量。

## 适用边界与方案选择

### 辐射条件与对流出口的适用条件

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

## 工程设置与实施

### 出口边界字典

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

### 诊断脚本

下面的脚本对每对相邻域长解给出外推值与 GCI：

```python
import numpy as np
dp = np.array([8.42, 7.35, 7.11, 7.045])   # kPa, L/h = 8,16,32,64
r, p, Fs = 2.0, 2.0, 1.25
for i in range(1, len(dp) - 1):
    q_ext = dp[i+1] + (dp[i+1] - dp[i]) / (r**p - 1.0)
    gci = Fs * abs((dp[i+1] - dp[i]) / dp[i+1]) / (r**p - 1.0)
    print(f"L/h={2**(i+3):3d}  dp={dp[i+1]:.3f} kPa  "
          f"ext={q_ext:.3f} kPa  GCI={gci*100:.2f}%")
```

脚本对每一对相邻解给出外推值与 GCI，若外推值在三级之间漂移小于 GCI，序列可信；若漂移大于 GCI，说明尚未进入渐近区，需要继续外移。

## 异常诊断与失效模式

### 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
| --- | --- | --- |
| 出口逆流面积随域长单调下降 | 出口切进分离泡，属截断伪影 | 出口外移 $1L_r$ 重算，若 $\Phi$ 减半则继续外移 |
| 域长加倍后逆流形态不变 | 物理回流，需要显式回流变量 | 检查回流温度/湍流量是否等于外部环境值 |
| 突扩压降远低于 $7.0\ \mathrm{kPa}$ | 出口给了总压，逆流速度被压制 | 改为固定静压，比较压降是否上升 |
| 残差在出口附近反复跳变 | 默认回流值与环境差 100 K 以上 | 输出出口逆流点温度，与外部环境逐点对比 |
| 周期性尾迹算例出口反射明显 | 用了定常压力出口，无对流项 | 改用 `waveTransmissive`，观察出口压力频谱是否变干净 |
| 出口面出现 $k$ 极低值 | `inletOutlet` 的 `inletValue` 未按环境设定 | `fieldMinMax` 读出口面 $k$ 最小值，应不低于环境的 $1/2$ |
| 逆流占比已降到 1% 但压降仍每级变 3% | 回流面积小但速度大，动量通量仍显著 | 改用 $\beta$ 而非 $\Phi$ 判断，阈值取 $1\%$ |
| 外推值比 Borda-Carnot 高 10% 以上 | 出口仍位于分离区内 | 加一级 $L/h = 64$ 看外推值是否继续下降 |
| 稳态 $\Phi = 5\%$、瞬态峰值 $34\%$ | 涡脱落驱动，稳态掩盖了峰值 | 按 $St = 0.2$ 估 $f$，检查采样是否每周期 50 点以上 |
| 表观收敛阶 $p$ 拟合出 3.5 以上 | 序列未进入渐近区或存在非单调解 | 检查三级解是否单调，非单调时不可用 Richardson |
| GCI 小于 0.1% | 三级解被同一数值误差主导，序列无信息 | 换用更粗的域长序列重新构造 |
| 外推值比解析值低 10% 以上 | 出口给总压，逆流被抑制 | 改为固定静压重算，比较压降是否上升 |

## 验证、验收与复现

### 与 Borda-Carnot 解析值的交叉校核

自洽不等于正确。突扩的不可逆压损有解析解，可作为独立校核：

$$
K = \left( 1 - \frac{A_1}{A_2} \right)^2, \qquad \Delta p_{theory} = K \frac{1}{2}\rho U_1^2
$$

面积比 $A_1/A_2 = (50/100)^2 = 0.25$，$K = 0.5625$，

$$
\Delta p_{theory} = 0.5625 \times 0.5 \times 998 \times 5^2 = 7018\ \mathrm{Pa} = 7.02\ \mathrm{kPa}
$$

外推值 $7.03\ \mathrm{kPa}$ 与解析值 $7.02\ \mathrm{kPa}$ 相差 $0.14\%$，远小于 GCI 的 $1.4\%$，同时确认了 $p = 2$ 的选择合理、$32h$ 的出口位置足够远。若外推值比解析值高 $10\%$ 以上，应优先怀疑出口仍在分离区内；若低 $10\%$ 以上，则可能是出口给了总压、抑制了逆流。

### Richardson 外推与网格收敛指数

域长序列的极限值用 Richardson 外推估计。设三级解 $q_1, q_2, q_3$ 对应公比 $r$ 的加密，表观收敛阶为 $p$，则

$$
q_{ext} = q_3 + \frac{q_3 - q_2}{r^{\,p} - 1}
$$

对本例 $q_2 = 7.35\ \mathrm{kPa}$，$q_3 = 7.11\ \mathrm{kPa}$，$r = 2$。对流主导的出口误差是一阶的，取 $p = 1$ 会给出 $q_{ext} = 7.11 + (7.11-7.35)/1 = 6.87\ \mathrm{kPa}$，低于解析值；取 $p = 2$（压力反馈主导）得

$$
q_{ext} = 7.11 + \frac{-0.24}{4 - 1} = 7.11 - 0.08 = 7.03\ \mathrm{kPa}
$$

网格收敛指数按 Roache 定义给出最细解的相对不确定度：

$$
\mathrm{GCI}_{32} = F_s \frac{\left| (q_3 - q_2)/q_3 \right|}{r^{\,p} - 1} = 1.25 \times \frac{0.0338}{3} = 1.4\%
$$

安全因子取 $F_s = 1.25$（三级解）。于是报告应写"$\Delta p = 7.11 \pm 0.10\ \mathrm{kPa}$（域长不确定度 1.4%）"，而不是一个裸数字。

### 用域长序列代替单点算例

验证出口位置需要至少三个域长构成序列，公比通常取 $r = 2$。以突扩下游为例，台阶高度 $h = 25\ \mathrm{mm}$，出口分别置于 $L = 8h, 16h, 32h$（即 $200\ \mathrm{mm}, 400\ \mathrm{mm}, 800\ \mathrm{mm}$），关注量为突扩总压损 $\Delta p$：

两个信号同时收敛：逆流占比在 $32h$ 已降到 $1\%$ 量级，压降的逐级变化从 $14.5\%$ 降到 $3.3\%$。注意逆流占比的收敛速度快于压降，因此**不能只看回流面积来决定域长**。

| 域长 | $L/h$ | 出口位置 | 逆流面积占比 $\Phi$ | $\Delta p$ |
| --- | --- | --- | --- | --- |
| $200\ \mathrm{mm}$ | 8 | $2.0 D_2$ | $18.5\%$ | $8.42\ \mathrm{kPa}$ |
| $400\ \mathrm{mm}$ | 16 | $4.0 D_2$ | $5.2\%$ | $7.35\ \mathrm{kPa}$ |
| $800\ \mathrm{mm}$ | 32 | $8.0 D_2$ | $1.1\%$ | $7.11\ \mathrm{kPa}$ |

### 回流质量流量而非面积占比

回流的危害由携带的质量、动量和能量通量决定。定义逆流质量分数

$$
\beta = \frac{\dot m_{bf}}{\dot m_{out}} = \frac{\displaystyle\int_{A_{bf}} \rho\, |u_n|\, \mathrm{d}A}{\displaystyle\int_{A_{out}} \rho\, u_n\, \mathrm{d}A}
$$

对上述 $L = 8h$ 算例，出口直径 $D_2 = 100\ \mathrm{mm}$，$A_{out} = \pi D_2^2/4 = 7.854\times 10^{-3}\ \mathrm{m^2}$，$\Phi = 18.5\%$ 对应逆流面积 $1.453\times 10^{-3}\ \mathrm{m^2}$，逆流区平均法向速度 $0.75\ \mathrm{m/s}$，水密度 $998\ \mathrm{kg/m^3}$：

$$
\dot m_{bf} = 998 \times 1.453\times 10^{-3} \times 0.75 = 1.09\ \mathrm{kg/s}
$$

上游质量流量 $\dot m_{out} = \rho A_1 U_1 = 998 \times 1.9635\times 10^{-3} \times 5 = 9.80\ \mathrm{kg/s}$，得 $\beta = 1.09/9.80 = 11.1\%$。工程阈值：$\beta < 1\%$ 可忽略回流变量；$1\% \sim 5\%$ 需检查回流温度与湍流量；$> 5\%$ 必须显式指定并复核能量收支。这里 $\beta = 11.1\%$，属于必须处理的情形。

### 瞬态峰值与稳态均值的差异

稳态求解器报告的逆流占比是时间平均，而真实的回流区往往由涡脱落驱动，瞬时峰值可以比均值大数倍。判定是否有周期性结构，用脱落频率估算：钝体尾迹的斯特劳哈尔数 $St = fD/U \approx 0.2$，在 $U = 5\ \mathrm{m/s}$、$D = 100\ \mathrm{mm}$ 下

$$
f = \frac{St\,U}{D} = \frac{0.2 \times 5}{0.1} = 10\ \mathrm{Hz}, \qquad T = \frac{1}{f} = 0.1\ \mathrm{s}
$$

瞬态验证时，时间步需每周期至少 50 点，即 $\Delta t \le 2\times 10^{-3}\ \mathrm{s}$，实际取 $10^{-3}\ \mathrm{s}$。此时记录逆流占比的时程，若峰值 $\Phi_{peak} = 34\%$ 而均值 $\bar\Phi = 5.2\%$，则峰值/均值比 6.5。**验证报告必须写明是峰值还是均值**，否则两个都"正确"的数字可以相差一个量级。

## 参考资料

1. Orlanski I., "A Simple Boundary Condition for Unbounded Hyperbolic Flows", *Journal of Computational Physics*, 21(3), 251-269, 1976.
2. Eaton J.K., Johnston J.P., "A Review of Research on Subsonic Turbulent Flow Reattachment", *AIAA Journal*, 19(9), 1093-1100, 1981.
3. Ferziger J.H., Perić M., Street R.L., *Computational Methods for Fluid Dynamics*, 4th ed., Springer, 2020.
4. Borda J.C., "Mémoire sur l'écoulement des fluides dans les tuyaux cylindriques", *Mémoires de l'Académie Royale des Sciences*, 1766.
5. OpenFOAM Foundation, *OpenFOAM User Guide: pressureInletOutletVelocity and inletOutlet Boundaries*, v2312, 2023.
6. Richardson L.F., "The Approximate Arithmetical Solution by Finite Differences of Physical Problems", *Philosophical Transactions of the Royal Society A*, 210, 307-357, 1911.
7. Roache P.J., "Perspective: A Method for Uniform Reporting of Grid Refinement Studies", *Journal of Fluids Engineering*, 116(3), 405-413, 1994.
8. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E., "Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications", *Journal of Fluids Engineering*, 130(7), 078001, 2008.
9. ASME, *V&V 20-2009: Standard for Verification and Validation in CFD and Heat Transfer*, 2009.
