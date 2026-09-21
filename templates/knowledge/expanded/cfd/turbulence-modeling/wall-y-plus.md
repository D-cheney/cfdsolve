---
template_version: "flowlab-knowledge/1.0"
slug: wall-y-plus
title: "壁面 y+ 与近壁分辨率：工程设置与参数选择"
summary: "把 y+ 从解后验量变成可设计的网格输入：用平板摩擦关联式估摩擦速度、按壁面处理反算首层单元高度、用几何级数校验棱柱层总厚度，并给出 OpenFOAM 的生成与核算配置。"
category:
  slug: turbulence-modeling
  name: "湍流与近壁建模"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "湍流与近壁建模"
  - "壁面 y+ 与近壁分辨率"
  - "工程设置与参数选择"
  - "摩擦速度"
  - "棱柱层设计"
seo:
  title: "壁面 y+ 与近壁分辨率：工程设置与参数选择"
  description: "把 y+ 从解后验量变成可设计的网格输入：用平板摩擦关联式估摩擦速度、按壁面处理反算首层单元高度、用几何级数校验棱柱层总厚度，并给出 OpenFOAM 的生成与核算配置。"
  keywords:
    - "壁面 y+ 与近壁分辨率"
    - "工程设置与参数选择"
    - "摩擦速度"
    - "棱柱层"
    - "壁函数"
---

# 壁面 y+ 与近壁分辨率：工程设置与参数选择

壁面 y+ 不是可以直接填进求解器的输入，而是网格、物性和壁面剪切共同决定的解后验量。可操作的做法是先用平板摩擦关联式估算摩擦速度 $u_\tau$，按所选近壁处理定下 y+ 目标，再反算首层单元高度并用几何级数校验棱柱层总厚度。下面以 $U_\infty = 30\,\mathrm{m/s}$、$x = 1\,\mathrm{m}$、空气 $\rho = 1.2\,\mathrm{kg/m^3}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$ 的平板湍流边界层为算例走完全流程。

## 1 先用摩擦关联式估出摩擦速度

取 1/7 次幂律的平板湍流摩擦关联式：

$$C_f = 0.026\,Re_x^{-1/7}, \qquad \tau_w = \tfrac12 C_f \rho U_\infty^{2}, \qquad u_\tau = \sqrt{\tau_w/\rho}$$

本例 $Re_x = U_\infty x/\nu = 2.0\times10^{6}$，$Re_x^{1/7} = 7.94$，所以 $C_f = 0.026/7.94 = 3.27\times10^{-3}$。代回得 $\tau_w = 1.77\,\mathrm{Pa}$、$u_\tau = 1.21\,\mathrm{m/s}$。用 Schlichting 的 $C_f = (2\log_{10}Re_x - 0.65)^{-2.3}$ 复核得 $3.32\times10^{-3}$，两者相差 1.5%，说明在 $5\times10^{5} < Re_x < 10^{7}$ 区间该估算足以支撑网格设计。

$u_\tau$ 是后续全部换算的唯一入口量，因此必须连同所用关联式与 $Re_x$ 一起记录。若换成边界层局部 $C_f$，首层高度会按 $u_\tau$ 的比例线性缩放。

## 2 由 y+ 目标反算首层单元高度

有限体积法把变量存于单元中心，单元中心到壁面的距离是 $y_1$，单元高度是它的两倍：

$$y_1 = \frac{y^{+}\nu}{u_\tau}, \qquad \Delta y_1 = \frac{2 y^{+}\nu}{u_\tau}$$

本例 $\nu/u_\tau = 1.24\times10^{-5}\,\mathrm{m}$，各目标 y+ 对应的结果如下。

| 目标 y+ | 单元中心高度 $y_1$ | 首层单元高度 $\Delta y_1$ | 对应近壁处理 |
|---|---|---|---|
| 1 | 12.4 μm | 24.7 μm | 低雷诺数 / SST 壁面解析 |
| 30 | 0.371 mm | 0.742 mm | 壁函数可用的下限 |
| 50 | 0.618 mm | 1.24 mm | 标准壁函数常用值 |
| 100 | 1.24 mm | 2.47 mm | 标准壁函数 |
| 300 | 3.71 mm | 7.42 mm | 壁函数可信上限 |

y+ 从 1 变到 50，首层高度相差 50 倍，这正是壁面解析与壁函数两类做法网格量差距的主要来源。设计时把目标 y+ 写在网格生成脚本的注释里，而不是事后从结果里读回来。

## 3 棱柱层总厚度与层数的自洽检查

棱柱层按几何级数增长，第 $i$ 层高度与 $n$ 层总厚度为：

$$\Delta y_i = \Delta y_1\,r^{\,i-1}, \qquad t_n = \Delta y_1\frac{r^{n}-1}{r-1}$$

边界层厚度用 $\delta \approx 0.37\,x\,Re_x^{-1/5}$ 估算，得 $\delta = 20.3\,\mathrm{mm}$。要求棱柱层总厚度覆盖 $1.0\delta$，增长率取 $r = 1.2$：

- 壁面解析方案（$\Delta y_1 = 24.7\,\mathrm{\mu m}$）：由 $24.7\times10^{-6}\times(1.2^n-1)/0.2 = 0.0203$ 解得 $n \approx 28$ 层；
- 壁函数方案（$\Delta y_1 = 0.742\,\mathrm{mm}$）：同式解得 $n \approx 11$ 层。

两套方案覆盖同一厚度，层数比约 2.5 倍，但网格量差别主要来自流向与展向的分辨率要求。增长率超过 1.3 会在棱柱层外缘产生高长宽比单元，污染湍流量的法向梯度，1.1~1.2 是更稳的取值。层数定下后还要确认棱柱层外缘落在边界层之外，否则混合函数会在尚未完成切换的位置被截断。

## 4 壁面处理与 y+ 区间必须匹配

近壁处理决定了 y+ 的合法区间，两者错配是近壁结果失真的首要原因。

| 近壁处理 | 目标 y+ | 首层单元高度（本算例） | 附加要求 |
|---|---|---|---|
| 标准壁函数 | 30~300 | 0.74~7.4 mm | 不允许大量单元落在 5~30 缓冲层 |
| 增强壁面处理（两层） | 全区间，最优 ≈1 | 24.7 μm 起 | 黏性底层至少 2 层 |
| 低雷诺数 / SST 解析 | ≈1，不超过 2 | 24.7 μm | 黏性底层 2~3 层 |
| 壁面解析 LES | <1 | 24.7 μm 或更小 | 流向、展向另按 $\Delta x^{+},\Delta z^{+} = 15\sim40$ 控制 |

同一套网格在 $y^{+} \approx 10$ 处对四种处理都不友好，属于典型的浪费网格又得不到精度的区间。

## 5 OpenFOAM 中的生成与核算

把上面算出的数字直接写进 snappyHexMesh 的加层字典，并在控制字典里挂 yPlus 函数对象。

```cpp
// system/snappyHexMeshDict
addLayersControls
{
    relativeSizes        false;
    firstLayerThickness  2.47e-05;   // 24.7 μm, 目标 y+ = 1
    expansionRatio       1.2;
    minThickness         1e-06;
    featureAngle         60;
    layers
    {
        "wall.*"  { nSurfaceLayers 28; }
    }
}
```

```bash
# 求解后按壁面面积加权统计 y+
postProcess -func "patchAverage(patch=walls,yPlus)" -latestTime
# 同时取最小与最大值，确认没有单元掉进缓冲层
postProcess -func "fieldMinMax(yPlus)" -latestTime
```

后处理阶段不要只看面积平均：最小值反映驻点或拐角处是否过密，最大值反映尾迹区是否过疏，两个数一起才有诊断价值。

## 6 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面面积平均 y+ 约 8，压降比经验值低 12% | 首层落在缓冲层，标准壁函数假设失效 | 只把首层高度放大到 y+≈50 重算，看压降是否回升 |
| 加密网格后摩擦系数反而下降且不收敛 | 加密使 y+ 从 40 降到 3，跨越了壁函数与解析区 | 固定 y+ 目标只改流向分辨率，把壁面处理效应与离散效应分离 |
| 前缘 y+ 远低于 30 而下游达 200 | 用平板中段剪切估的 $u_\tau$ 不适用于驻点区 | 用驻点局部 $C_f$ 单独估算 $u_\tau$，在前缘局部加密后重测 |
| y+ 场出现孤立尖峰 | 棱柱层塌陷或壁面法向网格非正交 | 检查 checkMesh 的 non-orthogonality 与 minThickness 触发日志 |
| 同一网格换模型后 y+ 变化 3 倍 | 不同模型预测的 $\tau_w$ 不同，y+ 是解的后验量 | 用新模型的 $\tau_w$ 反算目标首层高度后重新生成网格 |

最后一条最容易被忽略：y+ 由解决定，换模型等于换壁面剪切，网格必须跟着调整，否则前后对比同时改变了两类因素。

## 7 参考文献

1. Schlichting H., Gersten K., *Boundary-Layer Theory*, 9th ed., Springer, 2017.
2. White F. M., *Viscous Fluid Flow*, 3rd ed., McGraw-Hill, 2006.
3. Kalitzin G., Medic G., Iaccarino G., Durbin P., "Near-wall behavior of RANS turbulence models and implications for wall functions," *Journal of Computational Physics*, 2005.
4. Durbin P. A., "Near-wall turbulence closure modeling without damping functions," *Theoretical and Computational Fluid Dynamics*, 1991.
