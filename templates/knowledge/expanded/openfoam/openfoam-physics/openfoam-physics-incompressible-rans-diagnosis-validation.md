---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-physics-incompressible-rans-diagnosis-validation
title: "不可压 RANS 设置：结果诊断与可信度验证"
summary: "用压力-剪切力平衡、Colebrook 摩擦因子与网格收敛指数三条独立证据审查不可压 RANS 结果，给出残差之外的可核对判据与常见伪收敛的区分试验。"
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
  - "不可压 RANS 设置"
  - "结果诊断与可信度验证"
  - "Colebrook"
  - "网格收敛指数"
seo:
  title: "不可压 RANS 设置：结果诊断与可信度验证"
  description: "用压力-剪切力平衡、Colebrook 摩擦因子与网格收敛指数三条独立证据审查不可压 RANS 结果，给出残差之外的可核对判据与常见伪收敛的区分试验。"
  keywords:
    - "不可压 RANS 设置"
    - "结果诊断与可信度验证"
    - "Colebrook"
    - "网格收敛指数"
    - "Darcy-Weisbach"
---

# 不可压 RANS 设置：结果诊断与可信度验证

残差降到 1e-4 与结果可信之间没有必然联系：一个把出口压力写成帕斯卡的算例同样能收敛。判断不可压 RANS 结果是否可信，要用三组彼此独立的证据：积分量的力学平衡、与经验关联式的偏差、以及网格收敛指数。本文沿用 20 ℃ 水在 $D=0.02\ \mathrm{m}$、$L=10\ \mathrm{m}$ 圆管中 $U=2\ \mathrm{m/s}$ 的算例，逐条给出可手算的验收值。

## 先建立力学平衡这一硬约束

管内充分发展流的压力驱动力必须与壁面剪切力平衡，这是不依赖任何湍流模型的热力学约束：

$$\Delta p \cdot A = \tau_w \cdot \pi D L,\qquad \tau_w=\frac{f}{8}\rho U^{2}$$

其中 $A=\pi D^{2}/4=3.1416\times10^{-4}\ \mathrm{m^2}$。取 Petukhov 关联式给出的光滑管摩擦因子 $f=(0.790\ln Re-1.64)^{-2}$，$Re=3.98\times10^{4}$ 时 $f=0.0221$。则

$$\Delta p = f\frac{L}{D}\frac{\rho U^{2}}{2}=0.0221\times500\times1996.4=2.21\times10^{4}\ \mathrm{Pa}$$

反推剪切力：$\Delta p\cdot A=2.21\times10^{4}\times3.1416\times10^{-4}=6.94\ \mathrm{N}$，除以湿周面积 $\pi D L=0.6283\ \mathrm{m^2}$ 得 $\tau_w=11.05\ \mathrm{Pa}$，与 $f\rho U^{2}/8=11.03\ \mathrm{Pa}$ 一致，误差 0.2%。若你的模拟压降是 18 kPa 或 30 kPa，先算这条平衡，再谈模型。

## 用 Colebrook 式做外部对照

光滑管与粗糙管的统一参照是 Colebrook-White 隐式关系：

$$\frac{1}{\sqrt{f}}=-2\log_{10}\left(\frac{\varepsilon}{3.7D}+\frac{2.51}{Re\sqrt{f}}\right)$$

$Re=3.98\times10^{4}$、相对粗糙度 $\varepsilon/D=0$ 时迭代得 $f=0.0221$，与 Petukhov 式相差 0.1% 以内。若管壁取 $\varepsilon=0.05\ \mathrm{mm}$（$\varepsilon/D=2.5\times10^{-3}$，普通碳钢管量级），$f$ 升到约 0.0262，压降相应升至 26.2 kPa。这条对照能直接回答"我的算例偏大 18% 是粗糙度还是模型误差"——先确认几何与壁面参数是否与关联式口径一致，再讨论湍流模型。

## 质量守恒与动量预算的检查方式

不要只看 `continuity errors` 的绝对值，要把它换成有物理含义的指标：

$$\epsilon_m=\frac{\left|\sum_{faces}\dot m\right|}{\dot m_{ref}},\qquad \dot m_{ref}=\rho U A=998.2\times2\times3.1416\times10^{-4}=0.627\ \mathrm{kg/s}$$

定常收敛后 $\epsilon_m$ 应低于 $10^{-5}$，即净质量不平衡小于 $6.3\times10^{-6}\ \mathrm{kg/s}$。若该值停在 $10^{-2}$ 量级，通常是 SIMPLE 未开 `consistent`、压力松弛过小，或出口存在未处理的回流。后者可用 `inletOutlet` 消除，并在日志中监控出口面法向速度的最小值。

## 网格收敛指数给出不确定区间

只有两套网格无法证明收敛。按 Richardson 外推，用三套细化比 $r=1.5$ 的网格（单元数约 0.4 M、1.4 M、4.7 M）计算：

$$p=\frac{\ln\left|\frac{\phi_3-\phi_2}{\phi_2-\phi_1}\right|}{\ln r},\qquad GCI=\frac{1.25\left|\phi_2-\phi_1\right|/\phi_1}{r^{p}-1}$$

若三套网格压降分别为 21.3 kPa、22.0 kPa、22.4 kPa，则 $\phi_2-\phi_1=-0.7$、$\phi_3-\phi_2=-0.4$，比值 0.571，$\ln0.571/\ln1.5=-1.39$，出现负的观测阶，说明尚未进入渐近区，此时任何外推都不可信。正确做法是继续加密并把首层 $y^{+}$ 锁定在同一区间，直到观测阶落在 $1\sim2$。

## 把三条尺子写成脚本

下面的脚本把力平衡与关联式对照一次算完，可直接与求解器输出的压降对比。

```python
# 管道 RANS 结果的独立验收计算
import math
rho, U, D, L, nu = 998.2, 2.0, 0.02, 10.0, 1.004e-6
Re  = U*D/nu
f   = (0.790*math.log(Re) - 1.64)**-2          # Petukhov, 光滑管
dp  = f*(L/D)*rho*U**2/2                       # Pa
A   = math.pi*D**2/4
tau = dp*A/(math.pi*D*L)                       # Pa
print("Re=%.3e  f=%.5f  dp=%.1f Pa  tau_w=%.3f Pa" % (Re, f, dp, tau))
print("u_tau=%.5f m/s  y(y+=30)=%.4e m" % (math.sqrt(tau/rho), 30*nu/math.sqrt(tau/rho)))
```

```cpp
// system/controlDict
functions
{
    yPlusDist
    {
        type            yPlus;
        libs            ("libfieldFunctionObjects.so");
        executeControl  writeTime;
    }
    wallShear
    {
        type            wallShearStress;
        libs            ("libfieldFunctionObjects.so");
        writeControl    writeTime;
    }
    massFlow
    {
        type            surfaceFieldValue;
        libs            ("libfieldFunctionObjects.so");
        fields          (phi);
        operation       sum;
        regionType      patch;
        name            outlet;
    }
}
```

## 局部量与全局量要分别验收

| 诊断量 | 提取方式 | 可信阈值 |
|---|---|---|
| 壁面 $y^{+}$ 分布 | `postProcess -func yPlus` | 壁面函数方案：$30\sim300$；解析方案：$\le 1$ |
| 壁面剪切应力 | `wallShearStress` 功能对象 | 与 $\tau_w=11.05\ \mathrm{Pa}$ 偏差 $<5\%$ |
| 湍动能最小值 | `fieldMinMax -fields k` | $k>0$，无负值 |
| 出口回流比例 | 面积加权负法向速度占比 | $<2\%$ |
| 质量不平衡 | `sum(phi)` 全场积分 | $<10^{-5}$ |

全局压降达标不代表局部可信。曾有一个弯管算例整体压降只偏 3%，但弯头内壁 $y^{+}$ 高达 220，壁面剪切在分离点附近被高估 40%，只是被下游直管的欠预测抵消掉了。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 压降与 Colebrook 差 20% 以上 | 首层 $y^{+}$ 落在缓冲层，壁面函数失效 | 把首层加密到 $y^{+}<1$ 重算，看偏差是否收窄 |
| 残差平但压降随迭代缓慢爬升 | 出口回流未定常，或 SIMPLE 外循环不足 | 增加外循环次数至 2000，观察压降是否平直 |
| 加密网格压降单调下降 | 数值扩散主导，格式欠精 | 把 `div(phi,U)` 从 upwind 换为 `linearUpwind` 对比 |
| 出口 $k$ 出现负值 | 湍流格式无界或源项过大 | 换 `limitedLinear 1` 并把 k 松弛降到 0.3 |
| 剪应力与压力平衡差 15% | 壁面法向网格过粗，梯度重构失真 | 输出 `wallShearStress` 并与 $\Delta p A/(\pi D L)$ 对比 |

## 参考文献

1. Colebrook C.F., "Turbulent Flow in Pipes, with Particular Reference to the Transition Region between the Smooth and Rough Pipe Laws," Journal of the Institution of Civil Engineers, 1939.
2. Petukhov B.S., "Heat Transfer and Friction in Turbulent Pipe Flow with Variable Physical Properties," Advances in Heat Transfer, 1970.
3. Roache P.J., "Perspective: A Method for Uniform Reporting of Grid Refinement Studies," Journal of Fluids Engineering, 1994.
4. Celik I.B. et al., "Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications," Journal of Fluids Engineering, 2008.
5. OpenFOAM Foundation, OpenFOAM User Guide（当前发行版，function objects 与 postProcess 章节）.
