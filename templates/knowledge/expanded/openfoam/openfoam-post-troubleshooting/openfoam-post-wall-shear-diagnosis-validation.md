---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-post-wall-shear-diagnosis-validation
title: "壁面剪切与摩擦系数：结果诊断与可信度验证"
summary: "给出 wallShearStress 的输出口径与符号约定，讲清 Fanning 与 Darcy 摩擦因子相差 4 倍的换算，并用达西—魏斯巴赫公式对壁面切应力积分做一次独立校核。"
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
  - "壁面剪切与摩擦系数"
  - "结果诊断与可信度验证"
  - "wallShearStress"
seo:
  title: "壁面剪切与摩擦系数：结果诊断与可信度验证"
  description: "给出 wallShearStress 的输出口径与符号约定，讲清 Fanning 与 Darcy 摩擦因子相差 4 倍的换算，并用达西—魏斯巴赫公式对壁面切应力积分做一次独立校核。"
  keywords:
    - "壁面剪切与摩擦系数"
    - "结果诊断与可信度验证"
    - "wallShearStress"
    - "Darcy 摩擦因子"
---

# 壁面剪切与摩擦系数：结果诊断与可信度验证

摩擦系数有 Fanning 与 Darcy 两套定义，二者相差 4 倍，是管道与边界层报告中最常见的量纲事故。本文给出 $\tau_w$ 的 OpenFOAM 输出口径与符号约定、两套摩擦因子的换算、用压降反算做独立校核的完整流程，以及层流与湍流口径的区分方法。

## wallShearStress 的输出与符号

```cpp
functions
{
    wallShearStress
    {
        type            wallShearStress;
        libs            ("libfieldFunctionObjects.so");
        patches         (walls);
        writeFields     true;
        log             true;
    }
    wallShearStressAverage
    {
        type            surfaceFieldValue;
        libs            ("libfieldFunctionObjects.so");
        regionType      patch;
        name            walls;
        operation       areaAverage;
        fields          (wallShearStress);
        log             true;
    }
}
```

`wallShearStress` 是矢量场，方向为壁面切向。符号与 patch 法向相关：对内部流道，壁面法向指向流体，$\tau_w$ 的正方向与流动方向一致。读出的切应力为负时，先确认 patch 法向，再确认是不是把 $\mu_{eff}$ 当成了层流 $\mu$。

## 两套摩擦因子

壁面剪切应力与摩擦系数的关系：

$$\tau_w = \mu \left.\frac{\partial u}{\partial y}\right|_{y=0}, \qquad c_f = \frac{\tau_w}{\tfrac12 \rho U_\infty^2}$$

管道中还有两套积分摩擦因子：

$$f_{Fanning} = \frac{2\tau_w}{\rho U_b^2}, \qquad f_{Darcy} = \frac{8\tau_w}{\rho U_b^2} = 4 f_{Fanning}$$

以空气 $\rho = 1.2\ \mathrm{kg/m^3}$、$U_b = 10\ \mathrm{m/s}$、$\tau_w = 2.0\ \mathrm{Pa}$ 为例：

$$c_f = \frac{2.0}{0.5\times1.2\times100} = 0.0333, \qquad f_{Fanning} = \frac{2\times2.0}{1.2\times100} = 0.0333$$

$$f_{Darcy} = 4 \times 0.0333 = 0.1333$$

$c_f$ 与 $f_{Fanning}$ 在管流中数值相同，这是定义一致性的结果；$f_{Darcy}$ 则是它的 4 倍。把 $f_{Fanning} = 0.0333$ 当成 Darcy 因子去查 Moody 图，会得到完全错误的相对粗糙度。

## 用压降做独立校核

达西—魏斯巴赫公式：

$$\Delta p = f_{Darcy}\,\frac{L}{D}\,\frac12 \rho U_b^2$$

某直管 $L = 2.0\ \mathrm{m}$、$D = 0.05\ \mathrm{m}$、$\rho = 998.2\ \mathrm{kg/m^3}$、$U_b = 2.0\ \mathrm{m/s}$，模拟读出 $\Delta p = 3200\ \mathrm{Pa}$。反算

$$f_{Darcy} = \frac{\Delta p\, D}{\tfrac12 \rho U_b^2 L} = \frac{3200 \times 0.05}{0.5\times998.2\times4\times2.0} = \frac{160}{3992.8} = 0.0401$$

再由壁面积分得到的 $\tau_w$ 反算：若 `areaAverage(wallShearStress)` 给出 $\tau_w = 20.0\ \mathrm{Pa}$，则 $f_{Darcy} = 8\times20.0/(998.2\times4.0) = 0.0401$，两条路径一致到 0.1%。不一致时应先检查是否取到了入口发展段——入口段长度约 $L_e \approx 0.06\,Re\,D$，其内压降偏高。

## 层流与湍流的口径

层流圆管 $f_{Darcy} = 64/Re$。该算例 $Re = \rho U_b D/\mu = 998.2\times2.0\times0.05/1.0\times10^{-3} = 99820$，属湍流，对应的 Blasius 估计 $f_{Darcy} \approx 0.3164\,Re^{-0.25} = 0.3164\times99820^{-0.25} = 0.0178$，比模拟值 0.0401 小一半以上，说明管内粗糙度或入口扰动使摩擦增大，需要核对壁面粗糙度设置与网格首层高度。

```bash
postProcess -func wallShearStress -time 1000
postProcess -func "patchAverage(patch=walls,fields=(wallShearStress))" -time 1000
```

第一条命令补算切应力场，第二条给出壁面面积加权平均值，代入 $f_{Darcy} = 8\tau_w/(\rho U_b^2)$ 即可与压降反算结果对照。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| $f$ 比文献大 4 倍 | Fanning 与 Darcy 混用 | 用 $\Delta p\,D/(0.5\rho U^2 L)$ 独立反算 |
| $\tau_w$ 恒为 0 | patch 选错或该 patch 不含壁面 | 打印 patch 名与单元数，检查是否含壁面 |
| 压降反算与壁面反算差 30% | 取样段含入口发展段 | 只取 $x > 0.06\,Re\,D$ 之后的段 |
| 层流算例 $f$ 偏离 $64/Re$ | 网格首层太厚、壁面解析不足 | 用 `yPlus` 检查首层 $y^+$ 是否小于 1 |
| 并行下 $\tau_w$ 出现阶梯 | patch 分块边界插值不一致 | 串行重跑比对同一时刻 |

## 参考文献

1. H. Schlichting, K. Gersten, *Boundary-Layer Theory*, 9th ed., Springer, 2017.
2. F. M. White, *Viscous Fluid Flow*, 3rd ed., McGraw-Hill, 2006.
3. J. O. Hinze, *Turbulence*, 2nd ed., McGraw-Hill, 1975.
4. L. F. Moody, "Friction factors for pipe flow", *Transactions of the ASME*, 66, 1944.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, §"wallShearStress".
