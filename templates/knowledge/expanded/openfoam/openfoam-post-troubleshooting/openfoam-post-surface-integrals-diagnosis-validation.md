---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-post-surface-integrals-diagnosis-validation
title: "表面积分与通量：结果诊断与可信度验证"
summary: "厘清 surfaceFieldValue 中 areaIntegrate、areaAverage、sum、flux 四种 operation 的语义边界，给出由压力积分求力、静压与总压换算、以及用 phi 而非 U 积分求流量的核对流程。"
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
  - "表面积分与通量"
  - "结果诊断与可信度验证"
  - "areaIntegrate"
seo:
  title: "表面积分与通量：结果诊断与可信度验证"
  description: "厘清 surfaceFieldValue 中 areaIntegrate、areaAverage、sum、flux 四种 operation 的语义边界，给出由压力积分求力、静压与总压换算、以及用 phi 而非 U 积分求流量的核对流程。"
  keywords:
    - "表面积分与通量"
    - "结果诊断与可信度验证"
    - "areaIntegrate"
    - "patchIntegrate"
---

# 表面积分与通量：结果诊断与可信度验证

`surfaceFieldValue` 的 operation 决定了你拿到的是总量还是均值，两者混用是后处理报告出错的头号来源。本文给出四种 operation 的语义边界、由压力积分求力的完整换算、静压与总压的口径区分，以及用 `phi` 而非 `U` 积分求流量的核对方法。

## 四种 operation 的语义

```cpp
functions
{
    dragIntegral
    {
        type            surfaceFieldValue;
        libs            ("libfieldFunctionObjects.so");
        regionType      patch;
        name            body;
        operation       areaIntegrate;
        fields          (p);
        log             true;
    }
    outletAverage
    {
        type            surfaceFieldValue;
        libs            ("libfieldFunctionObjects.so");
        regionType      patch;
        name            outlet;
        operation       areaAverage;
        fields          (p U);
        log             true;
    }
}
```

- `areaIntegrate`：$\sum_f \phi_f |S_f|$，即 $\int_A \phi\,\mathrm{d}A$，量纲为 $[\phi]\cdot\mathrm{m^2}$。
- `areaAverage`：面积加权均值，量纲同 $\phi$。
- `sum`：直接 $\sum_f \phi_f$，只对已经是通量的量（如 `phi`）有意义。
- `flux`：用于 `phi` 场，得到体积或质量流率。

把 `p` 配 `sum` 是典型错误：$\sum_f p_f$ 的单位是 Pa，既不等于力也不等于均值。

## 由压力积分得到力

$$\mathbf{F} = -\int_A p\,\mathbf{n}\,\mathrm{d}A \approx -\sum_f p_f\, \mathbf{S}_f$$

以出口面为例：$A = 0.25\ \mathrm{m^2}$，`areaAverage(p)` 读出 120.0 Pa，则总压差力 $F = 120.0 \times 0.25 = 30.0\ \mathrm{N}$。若面法向与流动方向夹角 30°，需投影：$F_x = 30.0 \times \cos 30° = 26.0\ \mathrm{N}$。这一步常被漏掉，导致"表面积分力"与 `forces` 输出差 15%。

## 静压、动压与总压

$$p_{total} = p_{static} + \tfrac12 \rho |\mathbf{U}|^2$$

OpenFOAM 的 `p` 在不可压求解器里是运动学压力 $p/\rho$，单位是 $\mathrm{m^2/s^2}$，不是 Pa。以 $p = 100\ \mathrm{m^2/s^2}$、$\rho = 1.2\ \mathrm{kg/m^3}$ 换算，静压为 120 Pa；若流速 $U = 15\ \mathrm{m/s}$，动压为 $0.5\times1.2\times225 = 135\ \mathrm{Pa}$，总压 255 Pa。报告里写"压力 100 Pa"会同时错量纲和错口径。

判定命令：

```bash
postProcess -func "patchIntegrate(patch=outlet,fields=(p))" -time 500
postProcess -func "patchAverage(patch=outlet,fields=(p))" -time 500
```

若两个结果之比恰好等于 patch 面积 0.25 m²，说明积分与均值自洽；不等则说明 patch 上有非均匀权重被忽略。

## 通量与速度积分不是一回事

对 `phi` 做 `areaIntegrate` 得到流量（不可压为 $\mathrm{m^3/s}$），对 `U` 做 `areaIntegrate` 得到 $\int U\,\mathrm{d}A$，两者只有在 $\mathbf{U}$ 均匀且垂直于面时才相等。某风道算例中 `areaIntegrate(U)` 的 x 分量为 $1.02\ \mathrm{m^3/s}$，`areaIntegrate(phi)` 为 $0.98\ \mathrm{m^3/s}$，差的 4% 来自速度与面法向的夹角。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 积分数值等于均值 | `areaAverage` 与 `areaIntegrate` 混用 | 检查 operation 字段，比值应等于面积 |
| 压力值小 1.2 倍 | 不可压 `p` 为 $p/\rho$ 未乘密度 | 乘 $\rho = 1.2$ 后与压力表读数比对 |
| 表面积分力与 forces 差 15% | 面法向投影未做 | 用 $\mathbf{F}\cdot\mathbf{n}$ 重算并检查夹角 |
| 流量与入口设定不符 | 用 `U` 积分而非 `phi` | 改积 `phi`，两者应差 5% 以内 |
| 并行结果与串行不同 | 未做全局归约或 patch 被分割 | 串行重算同一时刻 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, §"surfaceFieldValue".
2. J. D. Anderson Jr., *Computational Fluid Dynamics: The Basics with Applications*, McGraw-Hill, 1995.
3. F. M. White, *Fluid Mechanics*, 8th ed., McGraw-Hill, 2016.
4. D. C. Wilcox, *Turbulence Modeling for CFD*, 3rd ed., DCW Industries, 2006.
5. OpenFOAM Foundation, *Programmer's Guide*, §"Surface fields".
6. Greenshields C.J., Weller H.G. 《Notes on Computational Fluid Dynamics: General Principles》. CFD Direct, 2022.
7. Marić T., Höpken J., Mooney K. 《The OpenFOAM Technology Primer》. Sourceflux, 2014.
8. Ferziger J.H., Perić M., Street R.L. 《Computational Methods for Fluid Dynamics》. Springer, 2020.
