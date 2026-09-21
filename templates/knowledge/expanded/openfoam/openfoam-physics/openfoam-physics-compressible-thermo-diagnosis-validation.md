---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-physics-compressible-thermo-diagnosis-validation
title: "可压缩热物性：结果诊断与可信度验证"
summary: "用总焓沿流线守恒、等熵关系与正激波关系三把尺子校验可压缩算例，给出从场数据反查 molWeight、Cp、黏度错误的可执行判据与能量不平衡的量化方法。"
category:
  slug: openfoam-physics
  name: "OpenFOAM 物理模型"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OpenFOAM"
  - "OpenFOAM 物理模型"
  - "可压缩热物性"
  - "结果诊断与可信度验证"
  - "总焓守恒"
  - "等熵关系"
seo:
  title: "可压缩热物性：结果诊断与可信度验证"
  description: "用总焓沿流线守恒、等熵关系与正激波关系三把尺子校验可压缩算例，给出从场数据反查 molWeight、Cp、黏度错误的可执行判据与能量不平衡的量化方法。"
  keywords:
    - "可压缩热物性"
    - "结果诊断与可信度验证"
    - "总焓守恒"
    - "等熵关系"
    - "正激波关系"
---

# 可压缩热物性：结果诊断与可信度验证

可压缩算例最容易出现"收敛得很漂亮、物理完全错"的组合：压力场光滑、残差低，但 `molWeight` 或 `Cp` 与工况不匹配，导致密度、温度、马赫数同时偏。诊断这类问题的关键，是把热物性字典里的常数变成能从解场中反算出来的量，再用守恒律和等熵关系做交叉检验。下面所有数值均取 300 K、1 bar 空气。

## 第一把尺子：总焓沿流线守恒

绝热、无外功的定常流动，总焓沿流线为常数，这是不依赖状态方程的热力学约束：

$$h_0=h+\frac{|\mathbf{U}|^{2}}{2}=\text{const},\qquad h=C_pT$$

取 $T=300\ \mathrm{K}$、$C_p=1005\ \mathrm{J/(kg\,K)}$、$U=100\ \mathrm{m/s}$：静焓 $h=3.015\times10^{5}\ \mathrm{J/kg}$，动能为 $U^{2}/2=5000\ \mathrm{J/kg}$，总焓 $h_0=3.065\times10^{5}\ \mathrm{J/kg}$。在入口到出口的任意流线上，`h + 0.5*magSqr(U)` 的相对偏差应小于 0.5%。若偏差达 3%～8%，通常不是数值耗散而是 `Cp` 填错——把 1005 写成 1000 就会引入 0.5% 的静焓偏差，再叠加温度变化会放大到 2% 以上。

## 第二把尺子：等熵关系反算总压

亚声速区可用等熵关系把静压与总压联系起来，并借此核对 $\gamma$：

$$\frac{p_0}{p}=\left(1+\frac{\gamma-1}{2}Ma^{2}\right)^{\frac{\gamma}{\gamma-1}},\qquad a=\sqrt{\gamma RT}$$

$Ma=0.288$、$\gamma=1.40$ 时，$p_0/p=1.0166^{3.5}=1.0592$，即入口总压应为 $1.059\times10^{5}\ \mathrm{Pa}$。若你设置的是 $1.013\times10^{5}\ \mathrm{Pa}$（把 1 atm 当成总压），则静压只有 $0.956\times10^{5}\ \mathrm{Pa}$，密度相应偏低 4.4%。这条检查能在不打开任何后处理工具的情况下，用入口边界值直接判断字典是否自洽。

对应的总温为

$$T_0=T\left(1+\frac{\gamma-1}{2}Ma^{2}\right)=300\times1.0166=305.0\ \mathrm{K}$$

若 `0/T` 入口写成 `totalTemperature 300`，等于把总温当静温，整场温度会低 5 K，声速低 2.9 m/s。

## 第三把尺子：激波关系检验超声速段

若算例含超声速区或喷管，正激波前后的压比可作为强约束：

$$\frac{p_2}{p_1}=\frac{2\gamma Ma_1^{2}}{\gamma+1}-\frac{\gamma-1}{\gamma+1}$$

$Ma_1=2.0$、$\gamma=1.4$ 时 $p_2/p_1=4.5$，$T_2/T_1=1.687$，总压比 $p_{02}/p_{01}=0.7209$。激波捕捉结果若给出压比 3.9，通常是网格在激波处过粗加上 `div(phi,U)` 用了过强限制器；若给出 5.1，则要检查 `molWeight`——把空气当作 $W=29$ 与 $W=28$ 会改变 $R$ 约 3.6%，进而改变声速与激波位置。

## 能量不平衡的量化

不要只看温度云图，要算全局能量残差：

$$\epsilon_E=\frac{\left|\dot m\left(h_{0,out}-h_{0,in}\right)-\dot Q\right|}{\dot m\,h_{0,in}}$$

以 $\dot m=0.5\ \mathrm{kg/s}$ 为例，$\dot m h_{0,in}=0.5\times3.065\times10^{5}=1.533\times10^{5}\ \mathrm{W}$。若壁面加热 $\dot Q=5000\ \mathrm{W}$，则出口总焓应为 $3.098\times10^{5}\ \mathrm{J/kg}$，出口总温 $308.3\ \mathrm{K}$。$\epsilon_E$ 在收敛后应低于 $10^{-3}$；若在 $10^{-1}$ 量级，先查 `fvModels` 中的 `q` 单位是 W/kg（specific）还是 W（absolute），这两者相差整个域的质量。

## 把检查做成可重复的后处理

下面两段可直接放进案例：前一段从 `h`、`U`、`p`、`T` 场重算总焓并给出漂移统计，后一段把关键极值写入日志。

```python
# 用 foamToVTK 导出的 CSV 逐点核对总焓守恒
import csv, math
Cp = 1005.0                     # J/(kg K)
h0_ref = None
worst = 0.0
for row in csv.DictReader(open("slice.csv")):
    h0 = float(row["h"]) + 0.5*(float(row["Ux"])**2 + float(row["Uy"])**2)
    if h0_ref is None:
        h0_ref = h0
    worst = max(worst, abs(h0 - h0_ref)/h0_ref)
print("h0_ref = %.4e J/kg, max drift = %.3f%%" % (h0_ref, 100*worst))
```

```cpp
// system/controlDict
functions
{
    thermoExtrema
    {
        type            fieldMinMax;
        libs            ("libfieldFunctionObjects.so");
        fields          (p T rho Ma);
        writeControl    timeStep;
        writeInterval   50;
    }
    enthalpyFlux
    {
        type            surfaceFieldValue;
        libs            ("libfieldFunctionObjects.so");
        fields          (h);
        operation       areaIntegrate;
        regionType      patch;
        name            outlet;
    }
}
```

## 从解场反查热物性错误

| 症状 | 根因假设 | 判定试验 |
|---|---|---|
| 全场密度与 $p/(RT)$ 手算差 >5% | `molWeight` 与 `Cp` 不自洽 | 用求解日志中 `R` 反算 $W$，与字典对比 |
| 高温区温度梯度异常陡 | 黏度用 `const` 未随温度变化 | 提取 $\mu$ 场与 Sutherland 式逐点对比 |
| 总焓沿流线漂移 5% | `Cp` 与温度区间不匹配 | 用 `hConst` 与 `janaf` 各算一遍对比 |
| 入口马赫数与设定不符 | 把总温当静温或反之 | 核对 $Ma=U/\sqrt{\gamma RT}$ |
| 壁面热流比实验高 30% | 黏度低估导致边界层过薄 | 输出 $y^{+}$ 与 $T^{+}$，确认热边界层分辨率 |

## 与解析解和实验的对照

最省事的独立对照是等熵喷管：给定面积比 $A/A^{*}=2.0$，理论出口马赫数为 1.688，出口静压比 $p/p_0=0.2176$。若模拟给出 0.23 或 0.20，偏差在 6%～8%，需要先确认喉部网格是否足以捕捉 $Ma=1$ 的临界截面。对更复杂的几何，可对照 NIST 公布的空气热物性表（300 K 时 $C_p=1005\ \mathrm{J/(kg\,K)}$、$\mu=1.846\times10^{-5}\ \mathrm{Pa\,s}$、$k=0.0262\ \mathrm{W/(m\,K)}$），逐项核对字典中的常数，而不是整场地调参。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 温度场出现负值并随即发散 | 线性焓外推越界 | 加 `limitTemperature`，观察是否仍触发 |
| 收敛后质量流率与设定差 29 倍 | `molWeight` 单位错误 | 用 $\rho=p/(RT)$ 手算全场均值 |
| 总压损失远小于理论值 | 激波被数值耗散抹平 | 加密激波区网格并降低限制器强度 |
| 能量不平衡停在 1e-1 | `fvModels` 源项单位与 `volumeMode` 不符 | 把 `specific` 换 `absolute` 重算对比 |
| 出口温度不随加热量变化 | `0/h` 未作为求解变量写出 | 检查求解器日志中的能量方程变量名 |

## 参考文献

1. Anderson J.D., Modern Compressible Flow: With Historical Perspective, 2nd ed., McGraw-Hill, 1990.
2. Shapiro A.H., The Dynamics and Thermodynamics of Compressible Fluid Flow, Ronald Press, 1953.
3. Lemmon E.W., Jacobsen R.T., Penoncello S.G., Friend D.G., "Thermodynamic Properties of Air and Mixtures of Nitrogen, Argon, and Oxygen from 60 to 2000 K at Pressures to 2000 MPa," Journal of Physical and Chemical Reference Data, 2000.
4. Roache P.J., Verification and Validation in Computational Science and Engineering, Hermosa Publishers, 1998.
5. OpenFOAM Foundation, OpenFOAM User Guide（当前发行版，compressible solvers 与 thermophysical properties 章节）.
