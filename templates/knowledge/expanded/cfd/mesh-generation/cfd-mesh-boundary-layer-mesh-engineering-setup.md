---
template_version: flowlab-knowledge/1.0
slug: cfd-mesh-boundary-layer-mesh-engineering-setup
title: 边界层棱柱网格：工程设置与诊断验证
summary: >-
  把棱柱层生成器的首层厚度、增长率、层数与最小厚度四个控制量写成互相约束的取值规则，用 1 m 弦长翼型算例算出 29 层方案，并给出
  snappyHexMesh 加层配置。
category:
  slug: mesh-generation
  name: 网格与离散质量
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 网格与离散质量
  - 边界层棱柱网格
  - 工程设置与参数选择
  - snappyHexMesh 加层
  - 最小层厚
  - 结果诊断与可信度验证
  - 面积加权 y+
  - 缓冲层
seo:
  title: 边界层棱柱网格：工程设置与诊断验证
  description: >-
    把棱柱层生成器的首层厚度、增长率、层数与最小厚度四个控制量写成互相约束的取值规则，用 1 m 弦长翼型算例算出 29 层方案，并给出
    snappyHexMesh 加层配置。
  keywords:
    - 边界层棱柱网格
    - snappyHexMesh 加层
    - 增长率
    - 最小层厚
    - 棱柱层覆盖率
    - 面积加权 y+
    - 缓冲层
    - 棱柱四面体界面
---
# 边界层棱柱网格：工程设置与诊断验证

棱柱层生成器的参数不是四个独立旋钮：首层厚度由目标 $y^+$ 定死，层数由覆盖率与增长率联合决定，增长率反过来受最小层厚约束。棱柱层最容易出现「看起来有、实际没用」的状态：层数足够、云图漂亮，但首层落在了缓冲层，或者棱柱总厚度没盖住边界层外缘。诊断这三个量——面积加权 y+、缓冲层面积占比、覆盖率——比看层数更能说明问题。

## 参数台账

交付需留下：$U$、$c$、$\nu$、$Re_c$、$C_f$ 关联式与取值、$\tau_w$、$u_\tau$、目标 $y^+$、$t_1$、$r$、$n$、$H$ 与 $\delta_{99}$ 及覆盖率、`featureAngle`、`minThickness`，以及计算后按面积统计的 $y^+$ 分布。缺少 $u_\tau$ 来源的记录在换流速或换介质后无法复用。

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

## 分区复算脚本

壁面剪切沿弦长变化很大，必须分区统计而不是全场平均：

```python
import numpy as np
nu, t1 = 1.5e-5, 7.7e-6          # 运动黏度 [m2/s]，首层目标厚度 [m]
tau  = np.array([6.70, 4.10, 12.5])   # 分区壁面剪应力 [Pa]
area = np.array([0.30, 0.55, 0.05])   # 分区壁面面积 [m2]
u_tau = np.sqrt(tau / 1.225)
yplus = u_tau * (t1 / 2) / nu
print("分区 y+:", np.round(yplus, 2))
print("面积加权 y+:", round(float((yplus * area).sum() / area.sum()), 2))
print("缓冲层面积占比: {:.1%}".format(
    float(area[(yplus > 5) & (yplus < 30)].sum() / area.sum())))
```

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

## 故障模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 后缘附近层数从 29 掉到 3 | 锐边两侧法向冲突，层被 `minThickness` 截断 | 把 `featureAngle` 从 60 降到 30，比较后缘层数 |
| 凸面中部层厚被压薄 | 曲率半径小于层厚增长所需空间 | 用局部曲率半径 $R$ 与 $t_1$ 比较，要求 $t_1 < R/20$ |
| 覆盖率只有 0.6，外缘梯度断裂 | 层数按 $r = 1.25$ 估算但实际被截断 | 统计实际棱柱总厚度，重新解 $n$ |
| 首层 y+ 全在 3～8 | 按平板关联式估了 $u_\tau$，未考虑顺压梯度 | 用求解器 `wallShearStress` 分区反算 $u_\tau$ |
| 加层后核心区四面体质量骤降 | 棱柱外缘与四面体尺寸比过大 | 检查棱柱最外层厚度与相邻四面体尺寸之比，控制在 2 以内 |
| 首层 y+ 云图整片落在 3～10 | 前缘吸力峰使局部 $u_\tau$ 远高于设计估值 | 分区统计 $\tau_w$，对高剪切区单独减小 $t_1$ |
| 壁面阻力对核心区加密不敏感 | 覆盖率 $C < 1.0$，梯度断点在棱柱外缘 | 实测 $\delta_{99}$，补层数使 $C$ 回到 1.05 以上 |
| 后缘层数骤降为 2～3 | 锐边两侧法向冲突 | 降低 `featureAngle` 或对后缘单独禁用加层 |
| 界面处压力出现锯齿 | 棱柱最外层与四面体尺寸比超过 3 | 统计界面两侧单元尺寸比，加一层过渡 |
| 分离点明显推迟 | 棱柱长宽比过大，流向数值扩散增强 | 表面间距减半，比较分离点位置变化 |

## 复算与验收

诊断结论需要同时给出：按面积统计的 $y^+$ 最小值、最大值与分布、$f_{buf}$、实测 $\delta_{99}$ 与覆盖率、界面尺寸比、以及棱柱长宽比。任何一项缺失都会让「棱柱层已达标」的结论无法被复核。特别地，$y^+$ 必须与实测 $\tau_w$ 一起给出，只报 $y^+$ 数值无法判断它是在什么剪切条件下得到的。

## 面积加权 y+ 与缓冲层面积占比

首层网格点落在哪里，只能用求解器实际给出的壁面剪切反算。壁面摩擦速度由 $\tau_w$ 与 $\rho$ 确定，逐面 $y^+$ 由首层中心高度 $t_1/2$ 换算：

$$
u_\tau = \sqrt{\frac{\tau_w}{\rho}}, \qquad y^+_f = \frac{u_\tau (t_1/2)}{\nu}
$$

1 m 弦长翼型的设计值取 $t_1 = 0.0077\ \mathrm{mm}$、$\nu = 1.5\times10^{-5}\ \mathrm{m^2/s}$，设计阶段按平板关联式估得 $u_\tau = 1.95\ \mathrm{m/s}$，目标 $y^+ = 1$。求解器实际给出的前缘附近 $\tau_w = 6.70\ \mathrm{Pa}$，于是

$$
u_\tau = \sqrt{6.70/1.225} = 2.34\ \mathrm{m/s}, \qquad y^+ = \frac{2.34 \times 3.85\times10^{-6}}{1.5\times10^{-5}} = 1.20
$$

即真实 $y^+ = 1.2$，比设计值高 20%，仍在黏性底层内，可以接受。若某处实测 $\tau_w = 40\ \mathrm{Pa}$（强逆压梯度区），同样的 $t_1$ 会给出 $y^+ = 3.0$，逼近缓冲层下缘。

**必须按面积统计，不能只报平均值。** 面积加权 $y^+$ 与缓冲层面积占比为

$$
\bar{y}^+_A = \frac{\sum_f y^+_f A_f}{\sum_f A_f}, \qquad f_{buf} = \frac{\sum_{f:\,5<y^+_f<30} A_f}{A_{wall}}
$$

同一算例上，若 $f_{buf}$ 达到 6.3%（主要来自前缘吸力峰与后缘），说明这部分壁面既不适合壁函数也没有解析黏性底层，目标量中的壁面阻力在这片区域上是不可信的。

## 覆盖率不足的识别

覆盖率是棱柱总厚度与实测边界层厚度之比：

$$
C = \frac{H}{\delta_{99}}
$$

设计时 $H = 19.9\ \mathrm{mm}$、$\delta_{99} = 18.4\ \mathrm{mm}$，$C = 1.08$。计算后用速度剖面找到 $u = 0.99U$ 的位置，得到实际 $\delta_{99} = 21.5\ \mathrm{mm}$（逆压梯度使边界层增厚），此时 $C = 0.93$。棱柱外缘落在对数律区内部，最外层棱柱与相邻四面体之间出现梯度不连续，表现为壁面阻力对核心区加密不敏感——因为梯度断点掩盖了分辨率变化。

判据：$C$ 应落在 1.0～1.2。$C < 1.0$ 时先补层数，不要先加密核心区。

## 棱柱-四面体界面的尺寸跳变

最外层棱柱厚度为

$$
t_n = t_1 r^{\,n-1} = 0.0077 \times 1.25^{28} = 3.98\ \mathrm{mm}
$$

核心区四面体平均尺寸 20 mm 时，界面尺寸比为 $20/3.98 = 5.0$。这个跳变过大，会让界面处的对流项截断误差成为主要误差源。做法是给界面加过渡：把核心区表面尺寸降到 8 mm，尺寸比降到 2.0，或把 $r$ 从 1.25 降到 1.15 使 $t_{29}$ 降到 $0.0077 \times 1.15^{28} = 0.0077 \times 54.1 = 0.42\ \mathrm{mm}$（此时需要更多层才能覆盖同样厚度，须重新解 $n$）。

## 长宽比对流向数值扩散的影响

棱柱单元的长宽比由表面间距 $\Delta s$ 与首层厚度决定：

$$
AR_{prism} = \frac{\Delta s}{t_1} = \frac{2\ \mathrm{mm}}{0.0077\ \mathrm{mm}} = 260
$$

高长宽比本身不破坏守恒，但会把流向的数值扩散放大到与流向梯度同量级，使分离点被推迟。诊断方法：把表面间距从 2 mm 加密到 1 mm（$AR$ 降到 130），观察分离点位置是否前移。若前移超过 2% 弦长，说明当前网格的分离预测不可信。

## 参考资料

1. OpenFOAM Foundation, *OpenFOAM User Guide*, snappyHexMesh 章节, 2023.
2. ANSYS Inc., *ANSYS Fluent User's Guide*, Boundary Layer and Prism Layer Meshing 章节, 2023.
3. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications", *AIAA Journal*, 32(8): 1598-1605, 1994.
4. Pope S.B., *Turbulent Flows*, Cambridge University Press, 2000.
5. Spalding D.B., "A Single Formula for the Law of the Wall", *Journal of Applied Mechanics*, 28(3): 455-458, 1961.
6. Kader B.A., Yaglom A.M., "Heat and Mass Transfer Laws for Fully Turbulent Wall Flows", *International Journal of Heat and Mass Transfer*, 15(12): 2329-2351, 1972.
7. Wilcox D.C., *Turbulence Modeling for CFD*, 3rd ed., DCW Industries, 2006.
8. White F.M., *Viscous Fluid Flow*, 3rd ed., McGraw-Hill, 2006.
