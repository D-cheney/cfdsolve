---
template_version: "flowlab-knowledge/1.0"
slug: openfoam-post-sampling-lines-diagnosis-validation
title: "线面采样：结果诊断与可信度验证"
summary: "说明 surfaces 采样中插值格式与采样密度如何决定线面剖面的可信度，给出 cellPoint 与 cell 的差异判定、采样间距的截断误差估算，以及用面积平均校验线平均的方法。"
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
  - "线面采样"
  - "结果诊断与可信度验证"
  - "libsampling"
seo:
  title: "线面采样：结果诊断与可信度验证"
  description: "说明 surfaces 采样中插值格式与采样密度如何决定线面剖面的可信度，给出 cellPoint 与 cell 的差异判定、采样间距的截断误差估算，以及用面积平均校验线平均的方法。"
  keywords:
    - "线面采样"
    - "结果诊断与可信度验证"
    - "libsampling"
    - "cuttingPlane"
---

# 线面采样：结果诊断与可信度验证

线面采样把体网格上的场降到线或面上，代价是引入插值误差。诊断的核心问题是：采样点上的值究竟由哪个插值格式算出，以及采样密度是否足够。本文给出 `surfaces` 的真实配置、线性插值的截断误差估算、用面积平均校验线平均的方法，以及阶梯化、端点缺值、与 ParaView 不一致三类症状的判定。

## 采样工具链与插值格式

```cpp
functions
{
    surfaces
    {
        type            surfaces;
        libs            ("libsampling.so");
        surfaceFormat   raw;
        interpolationScheme cellPoint;
        fields          (U p);
        surfaces
        {
            centreLine
            {
                type    cuttingPlane;
                plane
                {
                    type         plane;
                    basePoint    (0 0 0);
                    normalVector (1 0 0);
                }
            }
            wakeLine
            {
                type    uniform;
                axis    x;
                start   (0 0 0);
                end     (1 0 0);
                nPoints 201;
            }
        }
    }
}
```

`cellPoint` 先把单元值插到点、再在面上线性插值；`cellPointFace` 用面值，精度略高；`cell` 直接取宿主单元值，只有零阶精度。同一算例换成 `cell`，线附近会出现阶梯状轮廓——这是插值格式造成的，不是物理。

## 线性插值与采样密度

面上一点的线性插值：

$$\phi_P = (1-\lambda)\,\phi_A + \lambda\,\phi_B, \qquad \lambda = \frac{|\mathbf{x}_P - \mathbf{x}_A|}{|\mathbf{x}_B - \mathbf{x}_A|}$$

截断误差是 $O(h^2)$ 量级。以网格尺寸 $h = 5\ \mathrm{mm}$、尾流速度二阶导 $\partial^2 u/\partial y^2 = 4\times10^{4}\ \mathrm{s^{-1}m^{-1}}$ 为例，采样间距取 $10\ \mathrm{mm}$ 时：

$$\Delta u \approx \tfrac12 \left|\frac{\partial^2 u}{\partial y^2}\right| (\Delta y)^2 = \tfrac12 \times 4\times10^{4} \times (0.01)^2 = 2.0\ \mathrm{m/s}$$

这已超过典型尾流亏值的 20%。把 `nPoints` 从 101 提到 201（间距 5 mm），误差降到约 0.5 m/s。

## 用线采样校验面采样

`cuttingPlane` 的 `areaAverage` 与穿过该面的 `uniform` 线平均应一致。某散热器算例对出口面做 `areaAverage(p)` 得 118.6 Pa，对穿过该面中线的 `uniform` 线做 `weightedAverage` 得 121.3 Pa，差 2.3%。差异来自面内压力分布不均（边角低压区被中线漏掉），此时应以 `areaAverage` 为准。

## 常见语义错误

- `uniform` 的 `nPoints` 含首尾两点，间距是 $L/(n-1)$ 而非 $L/n$。
- `raw` 格式写 ASCII，`vtk` 格式带网格拓扑；前者便于 `gnuplot`，后者便于 ParaView。
- `fields` 只列场名，导数场要先用 `postProcess -func "grad(U)"` 生成。

```bash
postProcess -func surfaces -time 500
head -5 postProcessing/surfaces/500/centreLine_U.raw
```

第二条命令用于确认文件首列是弧长坐标、后续列是各分量，列序与 `fields` 中的顺序一致。

## 失败模式

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 线上值呈阶梯 | `interpolationScheme cell` | 改 `cellPoint` 重跑，看阶梯是否消失 |
| 线端点缺值 | `start`/`end` 落在域外或边界面上 | 把端点内缩一个网格尺寸 5 mm |
| 曲线抖动周期等于网格 | 采样间距小于网格、捕捉到插值噪声 | 把 `nPoints` 减半，观察抖动是否消失 |
| 与 ParaView 剖面差 5% | ParaView 用 `cell` 插值、OpenFOAM 用 `cellPoint` | 统一两端插值格式再比对 |
| 采样文件为空 | `fields` 写错或该时刻无此场 | 检查时间目录与 `fields` 名称拼写 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*, §"Sampling and cutting".
2. D. Shepard, "A two-dimensional interpolation function for irregularly-spaced data", *Proceedings of the 1968 ACM National Conference*, 1968.
3. P. K. Kundu, I. M. Cohen, D. R. Dowling, *Fluid Mechanics*, 6th ed., Academic Press, 2016.
4. ParaView Documentation, "Probing and sampling filters".
5. G. K. Batchelor, *An Introduction to Fluid Dynamics*, Cambridge University Press, 1967.
6. Roache P.J. 《Verification and Validation in Computational Science and Engineering》. Hermosa Publishers, 1998.
7. Celik I.B., Ghia U., Roache P.J., Freitas C.J., Coleman H., Raad P.E. 《Procedure for Estimation and Reporting of Uncertainty Due to Discretization in CFD Applications》. Journal of Fluids Engineering, 2008.
8. Schroeder W., Martin K., Lorensen B. 《The Visualization Toolkit》. Kitware, 2006.
