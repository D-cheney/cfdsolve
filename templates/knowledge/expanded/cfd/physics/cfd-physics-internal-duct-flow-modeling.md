---
template_version: flowlab-knowledge/1.0
slug: cfd-physics-internal-duct-flow-modeling
title: 内流与管网流动：原理与诊断验证
summary: >-
  管流建模的四个决定点是水力直径、层流/湍流区制、弯管二次流与气体可压缩性。本文给出各判据的公式、阈值与实算数值，并说明达西与范宁摩擦因子互换时的四倍陷阱。
  全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: physics
  name: 流体力学基础
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 流体力学基础
  - 内流与管网流动
  - 物理建模与适用边界
  - 水力直径
  - 迪恩数
  - 结果诊断与可信度验证
  - 达西摩擦因子
  - 质量收支
seo:
  title: 内流与管网流动：原理与诊断验证
  description: >-
    管流建模的四个决定点是水力直径、层流/湍流区制、弯管二次流与气体可压缩性。本文给出各判据的公式、阈值与实算数值，并说明达西与范宁摩擦因子互换时的四倍陷阱。
    全文同时覆盖原理与适用范围、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 内流与管网流动
    - 物理建模与适用边界
    - 水力直径
    - 迪恩数
    - 结果诊断与可信度验证
    - 达西摩擦因子
    - 质量收支
---
# 内流与管网流动：原理与诊断验证

## 原理与适用范围

管流看似最简单，但把截面形状、层流与湍流区制、弯管二次流、气体可压缩性这四件事处理错，任何网格都无法救回结果。本文按建模顺序逐项给出判据：先算水力直径，再定区制与摩擦因子，然后判断弯管和可压缩性是否必须保留，最后落到网格与边界设置。

### 1 非圆截面的等效直径

非圆截面用四个水力直径定义雷诺数：

$$
D_h = \frac{4A}{P}
$$

$A$ 为流通面积，$P$ 为湿周。取矩形风道 $0.3\,\mathrm{m}\times0.1\,\mathrm{m}$：$A = 0.03\,\mathrm{m^2}$、$P = 2\times(0.3+0.1) = 0.8\,\mathrm{m}$，故 $D_h = 4\times0.03/0.8 = 0.15\,\mathrm{m}$。注意 $D_h$ 只用于雷诺数与摩擦因子，不能用于几何建模或面积计算——把 $D_h$ 当作"等效圆管直径"去算流量是常见错误。

层流时不同截面的摩擦因子并不相同，用泊肃叶数 $f\,Re$ 区分：

| 截面 | $f\,Re$（达西因子） |
|---|---|
| 圆管 | 64.0 |
| 正方形 | 56.9 |
| 2:1 矩形 | 62.2 |
| 4:1 矩形 | 72.9 |
| 平行平板 | 96.0 |

### 2 层流还是湍流，摩擦因子用哪条

区制由雷诺数划分，摩擦因子各有对应关系：

$$
Re = \frac{\rho U D_h}{\mu}, \qquad f_{\text{lam}} = \frac{64}{Re}, \qquad f_{\text{Blasius}} = 0.316\,Re^{-1/4}
$$

取液压油 $\rho = 850\,\mathrm{kg/m^3}$、$\mu = 0.05\,\mathrm{Pa\cdot s}$ 在 $D_h = 0.15\,\mathrm{m}$ 的矩形通道中以 $U = 0.6\,\mathrm{m/s}$ 流动：$Re = 850\times0.6\times0.15/0.05 = 1530$，属层流，$f = 64/1530 = 0.0418$。若换成水（$\rho = 998.2\,\mathrm{kg/m^3}$、$\mu = 1.0\times10^{-3}\,\mathrm{Pa\cdot s}$），$Re = 9.0\times10^{4}$，属湍流，用 Blasius 式 $f = 0.316\times(9.0\times10^{4})^{-0.25} = 0.0182$。同一几何、同一速度，摩擦因子相差一倍以上——先定区制再谈别的。

这里有一个必须记住的换算：范宁摩擦因子 $f_F$ 与达西摩擦因子 $f_D$ 相差四倍，$f_D = 4f_F$，壁面剪切为

$$
\tau_w = \frac{1}{8}f_D\,\rho U^{2} = \frac{1}{2}f_F\,\rho U^{2}
$$

软件手册、教科书与实验报告三者常混用不同口径，拿错会让壁面剪切差 4 倍，首层网格高度随之全错。

### 3 弯管与二次流

弯管中离心力驱动二次流，形成 Dean 涡，其强弱由迪恩数衡量：

$$
De = Re\sqrt{\frac{D}{2R}}
$$

$D = 0.05\,\mathrm{m}$、弯管曲率半径 $R = 0.15\,\mathrm{m}$、$Re = 1.0\times10^{5}$ 时，$De = 1.0\times10^{5}\times\sqrt{0.05/0.3} = 4.1\times10^{4}$。Dean 涡在 $De \gtrsim 100$ 时已明显，$De$ 达到 $10^{4}$ 量级意味着弯头下游存在强二次流和附加压降。此时若用二维或轴对称模型，弯头损失会被低估 20% 以上，必须建三维并保证弯头处周向至少 40 个单元。

### 4 气体管道：可压缩性什么时候必须打开

气体密度随压力变化，判据是相对压降：

$$
\frac{\Delta p}{p_{\text{abs}}} < 5\% \ \Rightarrow\ \text{可按不可压处理}
$$

$D = 0.05\,\mathrm{m}$ 的空气管（$f = 0.0218$、$L/D = 200$）、$p_{\text{abs}} = 1.013\times10^{5}\,\mathrm{Pa}$：

- $U = 20\,\mathrm{m/s}$（$\rho = 1.16\,\mathrm{kg/m^3}$）：$\Delta p = 0.0218\times200\times0.5\times1.16\times400 = 1011\,\mathrm{Pa}$，$\Delta p/p = 1.0\%$，不可压足够。
- $U = 60\,\mathrm{m/s}$：$\Delta p = 0.0218\times200\times0.5\times1.16\times3600 = 9104\,\mathrm{Pa}$，$\Delta p/p = 9.0\%$，必须用可压缩求解器。

注意在 $U = 60\,\mathrm{m/s}$ 时 $M = 60/343 = 0.17$，远低于 0.3 的常规马赫门槛，但压降判据已经越界。对长管道，压降判据比马赫数判据更严格，不能只看马赫数。

### 5 网格与边界：充分发展解怎么拿

内流算例应尽量使用周期性边界求充分发展解，避免为消除入口效应而把管子建到 $50D$。OpenFOAM 中用两个普通 patch 合并成周期性 patch：

```cpp
// system/createPatchDict
matchTolerance  1e-4;
pointSync       false;
patches
(
    {
        name            periodic;
        patchInfo       { type cyclic; }
        constructFrom   patches;
        patches         ( inlet outlet );
    }
);

// 周期性算例还需给出驱动压降或质量流量
// constant/fvOptions
momentumSource
{
    type            meanVelocityForce;
    selectionMode   all;
    fields          (U);
    Ubar            (2 0 0);        // 目标平均速度 m/s
}
```

壁面网格按所选近壁处理定首层：$y^{+} \approx 1$ 用于全解析，$30\sim300$ 用于标准壁函数。$Re = 9.9\times10^{4}$、$D = 0.05\,\mathrm{m}$ 的钢管、$U = 2\,\mathrm{m/s}$，$f_D = 0.0218$ 给出 $\tau_w = f_D\rho U^{2}/8 = 10.9\,\mathrm{Pa}$，$u_\tau = \sqrt{\tau_w/\rho} = 0.104\,\mathrm{m/s}$，$y^{+} = 1$ 对应 $y_1 = \nu/u_\tau \approx 9.6\,\mu\mathrm{m}$。管流用全解析近壁时，径向至少需要 30 个单元才能把对数层与黏性底层同时分辨。

### 6 适用边界与失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 层流工况压降只有手算的一半 | 误用了湍流摩擦因子关联式 | 先算 $Re$，$Re < 2300$ 必须用 $f = 64/Re$ |
| 壁面剪切差 4 倍 | 范宁与达西摩擦因子口径混用 | 核对软件输出的是 $f_F$ 还是 $f_D$，统一口径 |
| 弯头损失比手册低 25% | 用了二维/轴对称模型，二次流被抹掉 | 建三维算例，检查弯头截面是否出现 Dean 涡 |
| 气体管压降与实测差 20% | 忽略了密度沿程变化 | 计算 $\Delta p/p$，超过 5% 换可压缩求解器 |
| 非圆通道 $f$ 总是偏高 | 把圆管的 $f\,Re = 64$ 用到了矩形截面 | 查泊肃叶数表，2:1 矩形取 62.2 |
| 充分发展段速度剖面偏离对数律 | 网格径向太粗，或仍处在发展段 | 加密径向网格，或用周期性边界重算 |

### 7 建模步骤

1. 由 $A$ 与 $P$ 计算 $D_h$，非圆截面按泊肃叶数表选 $f\,Re$。
2. 计算 $Re$ 判定区制，层流用 $64/Re$，湍流用 Blasius 或 Colebrook。
3. 统一范宁与达西口径，据此换算壁面剪切与首层高度。
4. 计算 $De$，超过 100 就必须三维建模并加密弯头。
5. 对气体计算 $\Delta p/p$，超过 5% 切换到可压缩求解。
6. 优先使用周期性边界求充分发展解，并记录驱动压降或目标流量。

### 8 参考文献

1. Shah R.K., London A.L., *Laminar Flow Forced Convection in Ducts*, Academic Press, 1978.
2. Dean W.R., "Note on the Motion of Fluid in a Curved Pipe," *Philosophical Magazine*, 1927.
3. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
4. Pope S.B., *Turbulent Flows*, Cambridge University Press, 2000.

## 诊断与可信度验证

管道算例最常见的"结果不对"是压降偏高或偏低 10%～30%，而求解器给出的残差曲线毫无异常。这类偏差有明确的来源清单：入口发展段被计入、出口边界压在弯头附近、壁面粗糙度没有生效、一阶格式带来额外耗散。本文给出用达西-魏斯巴赫公式与质量收支做独立核对的完整流程，每一步都能手算。

### 1 先手算出应该得到多少压降

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

### 2 发展段有多长

入口处速度剖面是均匀的，需要一段距离才能发展成充分发展的抛物线或对数剖面。层流与湍流的入口长度分别为：

$$
\frac{L_e}{D} \approx 0.06\,Re \ \ \text{laminar}, \qquad \frac{L_e}{D} \approx 4.4\,Re^{1/6} \ \ \text{turbulent}
$$

上例 $Re = 9.95\times10^{4}$，$Re^{1/6} = 6.81$，$L_e/D = 30.0$，即 $L_e = 1.5\,\mathrm{m}$。若把压降测点放在入口后 0.3 m 处，测到的摩擦因子会明显偏高——这是"算出来比手册大 15%"的头号原因。正确做法是把测点放在 $10D$ 之后，或者直接用周期性（cyclic）边界求充分发展解。

### 3 局部损失的量级与遗漏

弯头、阀门、突扩突缩的局部损失用损失系数 $K$ 表达，同样折算成速度水头：

$$
\Delta p_{\text{minor}} = K\,\frac{1}{2}\rho U^{2}
$$

常用值：锐边入口 $K = 0.5$、90° 长半径弯头 $K = 0.3$、全开闸阀 $K = 0.2$、突扩 $K = \left(1-A_1/A_2\right)^{2}$。一个含 2 个弯头加 1 个阀门的管段，$\sum K = 0.8$，局部损失 $0.8\times1996 = 1597\,\mathrm{Pa}$，相当于额外 1.8 m 直管。若网格在这些位置的流向分辨率不足 5 个单元，分离区会被抹平，$K$ 低估 20% 以上。

### 4 并联支路的流量分配

管网的核心验证量是流量分配。两条并联支路压降相同，因此：

$$
f_1\frac{L_1}{D_1}U_1^{2} = f_2\frac{L_2}{D_2}U_2^{2}
$$

取两支路管径相同（$D = 0.05\,\mathrm{m}$）、长度分别为 $L_1 = 10\,\mathrm{m}$ 与 $L_2 = 20\,\mathrm{m}$，若两路的 $f$ 接近，则 $U_1/U_2 = \sqrt{L_2/L_1} = \sqrt{2} = 1.414$。也就是短支路应走 58.6% 的流量。若 CFD 给出 52%/48% 的近似均分，通常说明网格或格式耗散把阻力差异抹平了，而不是物理上真的均分。

### 5 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压降比手算低 10%～20% | 一阶迎风带来数值耗散，壁面剪切被低估 | 换二阶格式复算，看压降是否上升并接近 $f = 0.0218$ |
| 压降比手算高 15% 以上 | 测点落在发展段内，或壁面粗糙度未生效 | 把测点移到 $10D$ 之后，核对 $\varepsilon$ 是否写入壁面 |
| 出口附近出现回流与压力奇异 | 出口边界压在弯头或突扩下游 | 把出口外移到 10D 之外，观察回流是否消失 |
| 并联支路流量接近均分 | 数值耗散抹平了两路阻力差 | 提高流向分辨率，检查两路 $f$ 的差异 |
| 残差平台但进出口质量不闭合 | 压力-速度耦合未收敛，或出口有回流 | 计算质量不平衡量，要求低于 0.1% |
| 弯头下游速度剖面出现非物理双峰 | 网格在二次流方向过粗 | 在弯头处加密并检查 Dean 涡结构 |

### 6 用质量收支与解析解交叉验证

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

### 7 收敛与验收判据

1. $Re$ 是否落在湍流区（$Re > 4000$），层流关联式是否被误用？
2. 压降测点是否在 $10D$ 之外，或是否使用了周期性边界？
3. 壁面粗糙度是否真实写入求解器，还是只写在报告里？
4. 质量收支不平衡量是否低于 0.1%？
5. CFD 反算的 $f$ 与 Colebrook 值偏差是否小于 5%？
6. 并联支路的流量分配是否与 $1/\sqrt{L}$ 量级关系一致？
7. 对流格式是否为二阶或更高，网格加密后压降变化是否小于 2%？

### 8 参考文献

1. Colebrook C.F., "Turbulent Flow in Pipes, with Particular Reference to the Transition Region between the Smooth and Rough Pipe Laws," *Journal of the Institution of Civil Engineers*, 1939.
2. Moody L.F., "Friction Factors for Pipe Flow," *Transactions of the ASME*, 1944.
3. Idelchik I.E., *Handbook of Hydraulic Resistance*, 3rd ed., Begell House, 1994.
4. White F.M., *Fluid Mechanics*, 8th ed., McGraw-Hill, 2016.
