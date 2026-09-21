---
template_version: "flowlab-knowledge/1.0"
slug: cfd-mesh-boundary-layer-mesh-engineering-setup
title: "边界层棱柱网格：工程设置与参数选择"
summary: "把棱柱层生成器的首层厚度、增长率、层数与最小厚度四个控制量写成互相约束的取值规则，用 1 m 弦长翼型算例算出 29 层方案，并给出 snappyHexMesh 加层配置。"
category:
  slug: mesh-generation
  name: "网格与离散质量"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "网格与离散质量"
  - "边界层棱柱网格"
  - "工程设置与参数选择"
  - "snappyHexMesh 加层"
  - "最小层厚"
seo:
  title: "边界层棱柱网格：工程设置与参数选择"
  description: "把棱柱层生成器的首层厚度、增长率、层数与最小厚度四个控制量写成互相约束的取值规则，用 1 m 弦长翼型算例算出 29 层方案，并给出 snappyHexMesh 加层配置。"
  keywords:
    - "边界层棱柱网格"
    - "snappyHexMesh 加层"
    - "增长率"
    - "最小层厚"
    - "棱柱层覆盖率"
---

# 边界层棱柱网格：工程设置与参数选择

棱柱层生成器的参数不是四个独立旋钮：首层厚度由目标 $y^+$ 定死，层数由覆盖率与增长率联合决定，增长率反过来受最小层厚约束。本文用 1 m 弦长翼型算例把四个量一次算清，并给出 snappyHexMesh 的加层字典写法与判据。

## 加层生成器的四个控制量

`snappyHexMesh` 的 `addLayersControls` 里真正影响近壁精度的是四个量：`firstLayerThickness`（首层目标厚度 $t_1$）、`expansionRatio`（相邻层厚比 $r$）、`numLayers`（层数 $n$）与 `minThickness`（层被压缩到目标厚度的多少比例以下就停止加层）。其余参数（`nSmoothSurfaceNormals`、`nRelaxIter`、`featureAngle`）只影响层能否贴住曲面，不改变设计口径。

`minThickness` 的默认值是 0.1，即层厚被压到 $0.1\,t_1$ 就放弃。这个值配合曲率决定了凸面上最多能加几层。

## 首层厚度由摩擦速度反算

首层厚度不能凭经验取，必须从目标 $y^+$ 反算：

$$
t_1 = \frac{y^+ \nu}{u_\tau}, \qquad u_\tau = \sqrt{\frac{\tau_w}{\rho}}, \qquad \tau_w = \frac{1}{2} C_f \rho U^2
$$

1 m 弦长翼型在 $U = 50\ \mathrm{m/s}$ 的常压空气中，$\nu = 1.5\times10^{-5}\ \mathrm{m^2/s}$，弦长雷诺数 $Re_c = 50 \times 1/1.5\times10^{-5} = 3.33\times10^{6}$。用湍流平板关联式 $C_f = 0.026\,Re_c^{-1/7}$：

$$
C_f = 0.026 \times (3.33\times10^{6})^{-1/7} = 0.026 \times 0.117 = 3.04\times10^{-3}
$$

$$
\tau_w = 0.5 \times 3.04\times10^{-3} \times 1.225 \times 50^2 = 4.66\ \mathrm{Pa}, \qquad u_\tau = \sqrt{4.66/1.225} = 1.95\ \mathrm{m/s}
$$

要壁面解析，取 $y^+ = 1$：

$$
t_1 = \frac{1 \times 1.5\times10^{-5}}{1.95} = 7.7\times10^{-6}\ \mathrm{m} = 0.0077\ \mathrm{mm}
$$

对应首层单元高度约 0.0154 mm。若改用壁函数、$y^+ = 30$，则 $t_1 = 0.23\ \mathrm{mm}$，比前者大 30 倍。

## 层数由覆盖率与增长率联合确定

棱柱层总厚度按等比求和，覆盖率定义为总厚度与边界层厚度之比：

$$
H = t_1 \frac{r^{n}-1}{r-1}, \qquad C = \frac{H}{\delta_{99}}
$$

$Re_c = 3.33\times10^{6}$ 时 $\delta_{99} \approx 0.37\,c\,Re_c^{-1/5} = 0.37 \times 20.16^{-1} = 18.4\ \mathrm{mm}$。取 $C = 1.05$，目标厚度 $H = 19.3\ \mathrm{mm}$，增长率 $r = 1.25$，解出层数：

$$
n = \frac{\ln\left(1 + \frac{H(r-1)}{t_1}\right)}{\ln r} = \frac{\ln\left(1 + \frac{19.3 \times 0.25}{0.0077}\right)}{\ln 1.25} = \frac{\ln 627.6}{0.2231} = 28.9
$$

取 $n = 29$，实际总厚度 $H = 0.0077 \times (1.25^{29}-1)/0.25 = 0.0077 \times 2578 = 19.9\ \mathrm{mm}$，覆盖率 $19.9/18.4 = 1.08$，达标。若强行把 $r$ 提到 1.4，同样 $n = 29$ 时 $H$ 会涨到 0.0077×(1.4^29−1)/0.4 ≈ 0.0077×1.05×10^4 = 81 mm，远超边界层，纯粹浪费单元。

## snappyHexMesh 加层配置

```text
addLayersControls
{
    relativeSizes       false;
    layers
    {
        "airfoil.*"
        {
            nSurfaceLayers  29;
            firstLayerThickness 7.7e-06;
            expansionRatio  1.25;
            minThickness    7.7e-07;   // 0.1 * firstLayerThickness
        }
    }
    featureAngle        60;
    nSmoothSurfaceNormals 10;
    nSmoothNormals      3;
    nRelaxIter          5;
    nLayerIter          50;
}
```

`relativeSizes false` 时必须显式给出 `firstLayerThickness`；若设为 `true`，该字段表示相对于局部表面单元尺寸的比例，换网格尺寸后含义会变，不适合交付。`featureAngle 60` 让尾缘等锐边停止加层，避免层在尖角处塌陷。

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 后缘附近层数从 29 掉到 3 | 锐边两侧法向冲突，层被 `minThickness` 截断 | 把 `featureAngle` 从 60 降到 30，比较后缘层数 |
| 凸面中部层厚被压薄 | 曲率半径小于层厚增长所需空间 | 用局部曲率半径 $R$ 与 $t_1$ 比较，要求 $t_1 < R/20$ |
| 覆盖率只有 0.6，外缘梯度断裂 | 层数按 $r = 1.25$ 估算但实际被截断 | 统计实际棱柱总厚度，重新解 $n$ |
| 首层 y+ 全在 3～8 | 按平板关联式估了 $u_\tau$，未考虑顺压梯度 | 用求解器 `wallShearStress` 分区反算 $u_\tau$ |
| 加层后核心区四面体质量骤降 | 棱柱外缘与四面体尺寸比过大 | 检查棱柱最外层厚度与相邻四面体尺寸之比，控制在 2 以内 |

## 参数台账

交付需留下：$U$、$c$、$\nu$、$Re_c$、$C_f$ 关联式与取值、$\tau_w$、$u_\tau$、目标 $y^+$、$t_1$、$r$、$n$、$H$ 与 $\delta_{99}$ 及覆盖率、`featureAngle`、`minThickness`，以及计算后按面积统计的 $y^+$ 分布。缺少 $u_\tau$ 来源的记录在换流速或换介质后无法复用。

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, snappyHexMesh 章节, 2023.
2. ANSYS Inc., *ANSYS Fluent User's Guide*, Boundary Layer and Prism Layer Meshing 章节, 2023.
3. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications", *AIAA Journal*, 32(8): 1598-1605, 1994.
4. Pope S.B., *Turbulent Flows*, Cambridge University Press, 2000.
