---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-post-yplus-output-diagnosis-validation
title: "yPlus 场后处理：结果诊断与可信度验证"
summary: "给出 yPlus functionObject 的输出口径与由目标 y+ 反算首层高度的手算，讲清 u_tau 随工况变化导致的 y+ 漂移，并用 fieldMinMax 与 patchAverage 判定壁面处理是否匹配。"
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
  - "yPlus 场后处理"
  - "结果诊断与可信度验证"
  - "wall functions"
seo:
  title: "yPlus 场后处理：结果诊断与可信度验证"
  description: "给出 yPlus functionObject 的输出口径与由目标 y+ 反算首层高度的手算，讲清 u_tau 随工况变化导致的 y+ 漂移，并用 fieldMinMax 与 patchAverage 判定壁面处理是否匹配。"
  keywords:
    - "yPlus 场后处理"
    - "结果诊断与可信度验证"
    - "wall functions"
    - "u_tau"
---

# yPlus 场后处理：结果诊断与可信度验证

y+ 不是用来"达标"的单一数字，而是一个分布。用面平均 y+ 判定壁面处理是否合适，会掩盖分离区与驻点区的局部超标。本文给出 y+ 的定义、`yPlus` functionObject 的输出口径、由目标 y+ 反算首层高度的手算，以及判定壁面处理是否匹配的分布检查方法。

## yPlus functionObject 与输出口径

```cpp
functions
{
    yPlus
    {
        type            yPlus;
        libs            ("libfieldFunctionObjects.so");
        writeFields     true;
        log             true;
    }
    yPlusStats
    {
        type        fieldMinMax;
        libs        ("libfieldFunctionObjects.so");
        fields      (yPlus);
        log         true;
    }
}
```

`writeFields yes` 才会把 `yPlus` 写成时间目录下的场文件，否则只在日志里打印统计。日志给出的 `min`/`max` 是全场面值，配合 `fieldMinMax` 才能看到分布形态。

## 定义与首层高度反算

$$y^+ = \frac{y\, u_\tau}{\nu}, \qquad u_\tau = \sqrt{\frac{\tau_w}{\rho}}$$

$y$ 是首层单元中心到壁面的距离，约等于首层单元高度的一半。以空气 $\nu = 1.5\times10^{-5}\ \mathrm{m^2/s}$、目标 $y^+ = 30$、壁面摩擦速度 $u_\tau = 0.5\ \mathrm{m/s}$ 为例：

$$y = \frac{y^+\nu}{u_\tau} = \frac{30 \times 1.5\times10^{-5}}{0.5} = 9.0\times10^{-4}\ \mathrm{m} = 0.9\ \mathrm{mm}$$

若 $y$ 指单元中心，则首层单元高度约为 1.8 mm。这个换算直接决定 `snappyHexMesh` 中 `firstLayerThickness` 的取值。

## 用实际摩擦速度复核首层设计

$u_\tau$ 也可以从 $c_f$ 得到：

$$u_\tau = U_\infty \sqrt{\frac{c_f}{2}}$$

取 $U_\infty = 20\ \mathrm{m/s}$、$c_f = 0.004$，则 $u_\tau = 20\times\sqrt{0.002} = 0.894\ \mathrm{m/s}$。若仍按 $u_\tau = 0.5$ 设计首层，$y^+$ 会变成

$$y^+ = \frac{0.9\times10^{-3}\times0.894}{1.5\times10^{-5}} = 53.6$$

从 30 跳到 53.6，直接越过缓冲层，壁面函数假设被破坏。这说明首层高度必须用实际 $u_\tau$ 复核，而不能用初值估计一次了事。

## 判定壁面处理是否匹配

- $y^+ < 1$：解析到黏性底层，可用低雷诺数模型或 `kOmegaSST` 的全解析模式。
- $1 < y^+ < 30$：落在缓冲层，壁面函数与低雷诺数模型都不适用，是最坏区间。
- $30 < y^+ < 200$：标准壁面函数适用区间，用 $k$-$\epsilon$ 或 $k$-$\omega$ SST 的高 $y^+$ 模式。

判定必须看分布。某车辆算例面平均 $y^+ = 45$ 看似合格，但尾部分离区局部 $y^+$ 达 180，该区摩擦阻力被高估约 15%。

## 用采样核对分布

```bash
postProcess -func "patchAverage(patch=body,fields=(yPlus))" -time 1000
postProcess -func "fieldMinMax(fields=(yPlus))" -time 1000
foamToVTK -fields "(yPlus)" -time 1000
```

`patchAverage` 给面积加权均值，`fieldMinMax` 给全域极值。若两者之比超过 4，说明分布极不均匀，应分区统计而不是报一个数。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 日志 y+ 全为 0 | 无壁面 patch 或缺湍流场 | 检查 `0/` 是否含 `nut` 且壁面已设壁面函数 |
| 面平均达标但阻力偏大 | 分离区局部 y+ 超标 | 用 `fieldMinMax` 看极值，超过 200 即定位 |
| 加层后 y+ 反而增大 | 首层被压薄、实际高度小于设定 | 用 `checkMesh` 看层厚，与 $y = y^+\nu/u_\tau$ 比对 |
| 层流算例 y+ 大于 5 | 首层太厚，未解析线性层 | 把首层降到 $y^+ < 1$ 重算 |
| 换网格后 y+ 系统性平移 | $u_\tau$ 随网格改变、首层未同步调整 | 用新 $u_\tau$ 重算首层高度 |

## 参考文献

1. F. R. Menter, "Two-equation eddy-viscosity turbulence models for engineering applications", *AIAA Journal*, 32(8), 1994.
2. D. B. Spalding, "A single formula for the law of the wall", *Journal of Applied Mechanics*, 28(3), 1961.
3. T. Cebeci, A. M. O. Smith, *Analysis of Turbulent Boundary Layers*, Academic Press, 1974.
4. M. Gad-el-Hak, *Flow Control: Passive, Active, and Reactive Flow Management*, Cambridge University Press, 2000.
5. OpenFOAM Foundation, *OpenFOAM User Guide*, §"yPlus".
