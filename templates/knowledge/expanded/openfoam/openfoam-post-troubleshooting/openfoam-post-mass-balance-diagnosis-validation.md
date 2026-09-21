---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-post-mass-balance-diagnosis-validation
title: "质量守恒核查：结果诊断与可信度验证"
summary: "区分不可压 phi 的体积通量与可压质量通量，用 surfaceFieldValue 逐边界积分建立守恒预算，并给出一次 0.35% 不平衡的逐边界追责手算与定常/瞬态两种守恒形式。"
category:
  slug: openfoam-post-troubleshooting
  name: "OpenFOAM 后处理与排错"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "OPENFOAM"
  - "OpenFOAM 后处理与排错"
  - "质量守恒核查"
  - "结果诊断与可信度验证"
  - "surfaceFieldValue"
seo:
  title: "质量守恒核查：结果诊断与可信度验证"
  description: "区分不可压 phi 的体积通量与可压质量通量，用 surfaceFieldValue 逐边界积分建立守恒预算，并给出一次 0.35% 不平衡的逐边界追责手算与定常/瞬态两种守恒形式。"
  keywords:
    - "质量守恒核查"
    - "结果诊断与可信度验证"
    - "surfaceFieldValue"
    - "连续性误差"
---

# 质量守恒核查：结果诊断与可信度验证

质量守恒核查的目的不是"证明算得对"，而是给出一个可量化、可逐边界追责的守恒预算。OpenFOAM 的连续性误差行只给全域残差，追不到具体边界；要用 `surfaceFieldValue` 把每个 patch 的通量单独积出来。本文给出通量的量纲口径、逐边界积分配置，以及一次 0.35% 不平衡的完整追责过程。

## 不可压与可压的通量定义不同

`phi` 在不可压求解器里是体积通量 $[\mathrm{m^3/s}]$，在可压求解器里是质量通量 $[\mathrm{kg/s}]$。这决定了要不要乘密度：

$$\dot m = \int_A \rho\, \mathbf{U}\cdot\mathrm{d}\mathbf{A}, \qquad Q = \int_A \mathbf{U}\cdot\mathrm{d}\mathbf{A}$$

不可压算例 $\rho$ 为常数，$\dot m = \rho Q$。把不可压的 `phi` 直接当质量流率求和是常见错误，量纲对不上时会差三个数量级——水的密度是 998.2 kg/m³。

## 逐边界通量积分配置

```cpp
functions
{
    inletFlux
    {
        type            surfaceFieldValue;
        libs            ("libfieldFunctionObjects.so");
        regionType      patch;
        name            inlet;
        operation       areaIntegrate;
        fields          (phi);
        log             true;
    }
    outletFlux
    {
        type            surfaceFieldValue;
        libs            ("libfieldFunctionObjects.so");
        regionType      patch;
        name            outlet;
        operation       areaIntegrate;
        fields          (phi);
        log             true;
    }
}
```

`operation areaIntegrate` 对 $\phi$ 求和，正好是 $\int \mathbf{U}\cdot\mathrm{d}\mathbf{A}$ 的离散形式。

## 一次可核对的守恒手算

某水管算例入口 $\rho = 998.2\ \mathrm{kg/m^3}$、$U = 5.0\ \mathrm{m/s}$、$A = 0.02\ \mathrm{m^2}$：

$$\dot m_{in} = 998.2 \times 5.0 \times 0.02 = 99.82\ \mathrm{kg/s}$$

出口 `areaIntegrate(phi)` 读出 $Q_{out} = 0.09965\ \mathrm{m^3/s}$，换算 $\dot m_{out} = 99.47\ \mathrm{kg/s}$。相对不平衡

$$\epsilon_m = \frac{|\dot m_{in} - \dot m_{out}|}{\dot m_{in}} = \frac{0.35}{99.82} = 3.5\times10^{-3}$$

0.35% 对稳态内流偏高。逐边界查发现壁面 patch 的 `phi` 积分不是 0 而是 $3.5\times10^{-4}\ \mathrm{m^3/s}$，说明壁面处存在不应有的通量——速度边界未设 `noSlip`，或 `pressureInletOutletVelocity` 的方向设置错误。

```bash
postProcess -func "patchIntegrate(patch=inlet,fields=(phi))" -time 500
postProcess -func "patchIntegrate(patch=outlet,fields=(phi))" -time 500
```

两条命令分别给出进出口的体积流率，相减即为守恒预算的左侧；再对壁面 patch 做同样积分，即可定位泄漏位置。

## 定常与瞬态的守恒形式不同

稳态不可压要求净通量为零。瞬态则允许储集：

$$\frac{\mathrm{d}}{\mathrm{d}t}\int_V \rho\,\mathrm{d}V = \sum_{in}\dot m - \sum_{out}\dot m$$

可压瞬态必须把储集项计入预算，否则每步都会看到 1%～5% 的"不平衡"，那其实是储集而非误差。核查方法：用 `volFieldValue` 对 $\rho$ 做体积分再差分得到 $\mathrm{d}m/\mathrm{d}t$，与进出口通量差对照。

## 边界条件导致的守恒假象

- 出口用 `zeroGradient` 时 `phi` 由内部外推，回流发生时会出现通量脉动。
- `pressureInletOutletVelocity` 允许出口反向流动，此时进出口角色互换，符号必须按 $\mathbf{U}\cdot\mathbf{n}$ 判读。
- 周期性算例没有净通量，应核查 `cyclic` 两侧 `phi` 是否大小相等、符号相反。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 不平衡 0.3%，壁面有通量 | 壁面速度未置零或误用 `slip` | 对壁面 patch 积 `phi`，非零即定位 |
| 不平衡相差三个数量级 | 把不可压 `phi` 当质量通量 | 乘 $\rho = 998.2$ 后复算 |
| 不平衡随步数单调累积 | 出口通量符号或 `phi` 边界错误 | 分别积进出口并画时间序列 |
| 瞬态每步差 3% | 未计储集项 | 用 `volFieldValue` 积 $\rho$ 求 $\mathrm{d}m/\mathrm{d}t$ |
| 并行与串行结果不同 | 积分未做全局归约或 patch 被分割 | 串行重跑同一时刻比对 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, §"Field function objects".
2. H. K. Versteeg, W. Malalasekera, *An Introduction to Computational Fluid Dynamics*, 2nd ed., Pearson, 2007.
3. R. B. Bird, W. E. Stewart, E. N. Lightfoot, *Transport Phenomena*, 2nd ed., Wiley, 2002.
4. J. C. Tannehill, D. A. Anderson, R. H. Pletcher, *Computational Fluid Mechanics and Heat Transfer*, 3rd ed., CRC Press, 2018.
5. OpenFOAM Foundation, *Programmer's Guide*, §"Finite volume discretisation".
6. Ferziger J.H., Perić M., Street R.L. 《Computational Methods for Fluid Dynamics》. Springer, 2020.
7. Roache P.J. 《Verification and Validation in Computational Science and Engineering》. Hermosa Publishers, 1998.
8. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E. 《Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications》. Journal of Fluids Engineering, 2008.
