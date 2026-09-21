---
template_version: flowlab-knowledge/1.0
slug: wall-y-plus
title: 壁面 y+ 与近壁分辨率：工程设置与诊断验证
summary: >-
  把 y+ 从解后验量变成可设计的网格输入：用平板摩擦关联式估摩擦速度、按壁面处理反算首层单元高度、用几何级数校验棱柱层总厚度，并给出 OpenFOAM
  的生成与核算配置。 全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
category:
  slug: turbulence-modeling
  name: 湍流与近壁建模
level: 工程
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 湍流与近壁建模
  - 壁面 y+ 与近壁分辨率
  - 工程设置与参数选择
  - 摩擦速度
  - 棱柱层设计
  - 结果诊断与可信度验证
  - 对数律偏差
  - 网格收敛
seo:
  title: 壁面 y+ 与近壁分辨率：工程设置与诊断验证
  description: >-
    把 y+ 从解后验量变成可设计的网格输入：用平板摩擦关联式估摩擦速度、按壁面处理反算首层单元高度、用几何级数校验棱柱层总厚度，并给出 OpenFOAM
    的生成与核算配置。 全文同时覆盖工程设置与参数选择、诊断与可信度验证，保留关键方程、量化参数、可执行示例、失败模式与参考资料。
  keywords:
    - 壁面 y+ 与近壁分辨率
    - 工程设置与参数选择
    - 摩擦速度
    - 棱柱层
    - 壁函数
    - 结果诊断与可信度验证
    - 对数律
    - 缓冲层
    - 摩擦系数收敛
---
# 壁面 y+ 与近壁分辨率：工程设置与诊断验证

## 工程设置与参数选择

壁面 y+ 不是可以直接填进求解器的输入，而是网格、物性和壁面剪切共同决定的解后验量。可操作的做法是先用平板摩擦关联式估算摩擦速度 $u_\tau$，按所选近壁处理定下 y+ 目标，再反算首层单元高度并用几何级数校验棱柱层总厚度。下面以 $U_\infty = 30\,\mathrm{m/s}$、$x = 1\,\mathrm{m}$、空气 $\rho = 1.2\,\mathrm{kg/m^3}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$ 的平板湍流边界层为算例走完全流程。

### 1 先用摩擦关联式估出摩擦速度

取 1/7 次幂律的平板湍流摩擦关联式：

$$C_f = 0.026\,Re_x^{-1/7}, \qquad \tau_w = \tfrac12 C_f \rho U_\infty^{2}, \qquad u_\tau = \sqrt{\tau_w/\rho}$$

本例 $Re_x = U_\infty x/\nu = 2.0\times10^{6}$，$Re_x^{1/7} = 7.94$，所以 $C_f = 0.026/7.94 = 3.27\times10^{-3}$。代回得 $\tau_w = 1.77\,\mathrm{Pa}$、$u_\tau = 1.21\,\mathrm{m/s}$。用 Schlichting 的 $C_f = (2\log_{10}Re_x - 0.65)^{-2.3}$ 复核得 $3.32\times10^{-3}$，两者相差 1.5%，说明在 $5\times10^{5} < Re_x < 10^{7}$ 区间该估算足以支撑网格设计。

$u_\tau$ 是后续全部换算的唯一入口量，因此必须连同所用关联式与 $Re_x$ 一起记录。若换成边界层局部 $C_f$，首层高度会按 $u_\tau$ 的比例线性缩放。

### 2 由 y+ 目标反算首层单元高度

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

### 3 棱柱层总厚度与层数的自洽检查

棱柱层按几何级数增长，第 $i$ 层高度与 $n$ 层总厚度为：

$$\Delta y_i = \Delta y_1\,r^{\,i-1}, \qquad t_n = \Delta y_1\frac{r^{n}-1}{r-1}$$

边界层厚度用 $\delta \approx 0.37\,x\,Re_x^{-1/5}$ 估算，得 $\delta = 20.3\,\mathrm{mm}$。要求棱柱层总厚度覆盖 $1.0\delta$，增长率取 $r = 1.2$：

- 壁面解析方案（$\Delta y_1 = 24.7\,\mathrm{\mu m}$）：由 $24.7\times10^{-6}\times(1.2^n-1)/0.2 = 0.0203$ 解得 $n \approx 28$ 层；
- 壁函数方案（$\Delta y_1 = 0.742\,\mathrm{mm}$）：同式解得 $n \approx 11$ 层。

两套方案覆盖同一厚度，层数比约 2.5 倍，但网格量差别主要来自流向与展向的分辨率要求。增长率超过 1.3 会在棱柱层外缘产生高长宽比单元，污染湍流量的法向梯度，1.1~1.2 是更稳的取值。层数定下后还要确认棱柱层外缘落在边界层之外，否则混合函数会在尚未完成切换的位置被截断。

### 4 壁面处理与 y+ 区间必须匹配

近壁处理决定了 y+ 的合法区间，两者错配是近壁结果失真的首要原因。

| 近壁处理 | 目标 y+ | 首层单元高度（本算例） | 附加要求 |
|---|---|---|---|
| 标准壁函数 | 30~300 | 0.74~7.4 mm | 不允许大量单元落在 5~30 缓冲层 |
| 增强壁面处理（两层） | 全区间，最优 ≈1 | 24.7 μm 起 | 黏性底层至少 2 层 |
| 低雷诺数 / SST 解析 | ≈1，不超过 2 | 24.7 μm | 黏性底层 2~3 层 |
| 壁面解析 LES | <1 | 24.7 μm 或更小 | 流向、展向另按 $\Delta x^{+},\Delta z^{+} = 15\sim40$ 控制 |

同一套网格在 $y^{+} \approx 10$ 处对四种处理都不友好，属于典型的浪费网格又得不到精度的区间。

### 5 OpenFOAM 中的生成与核算

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

### 6 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面面积平均 y+ 约 8，压降比经验值低 12% | 首层落在缓冲层，标准壁函数假设失效 | 只把首层高度放大到 y+≈50 重算，看压降是否回升 |
| 加密网格后摩擦系数反而下降且不收敛 | 加密使 y+ 从 40 降到 3，跨越了壁函数与解析区 | 固定 y+ 目标只改流向分辨率，把壁面处理效应与离散效应分离 |
| 前缘 y+ 远低于 30 而下游达 200 | 用平板中段剪切估的 $u_\tau$ 不适用于驻点区 | 用驻点局部 $C_f$ 单独估算 $u_\tau$，在前缘局部加密后重测 |
| y+ 场出现孤立尖峰 | 棱柱层塌陷或壁面法向网格非正交 | 检查 checkMesh 的 non-orthogonality 与 minThickness 触发日志 |
| 同一网格换模型后 y+ 变化 3 倍 | 不同模型预测的 $\tau_w$ 不同，y+ 是解的后验量 | 用新模型的 $\tau_w$ 反算目标首层高度后重新生成网格 |

最后一条最容易被忽略：y+ 由解决定，换模型等于换壁面剪切，网格必须跟着调整，否则前后对比同时改变了两类因素。

### 7 参考文献

1. Schlichting H., Gersten K., *Boundary-Layer Theory*, 9th ed., Springer, 2017.
2. White F. M., *Viscous Fluid Flow*, 3rd ed., McGraw-Hill, 2006.
3. Kalitzin G., Medic G., Iaccarino G., Durbin P., "Near-wall behavior of RANS turbulence models and implications for wall functions," *Journal of Computational Physics*, 2005.
4. Durbin P. A., "Near-wall turbulence closure modeling without damping functions," *Theoretical and Computational Fluid Dynamics*, 1991.

## 诊断与可信度验证

近壁网格是否合格，不能靠设计阶段的预估 y+ 自证，只能靠解出来的壁面剪切场回答。可信的做法有三步：从壁面剪切反推实际 y+ 分布、用对数律偏差量化壁面处理的系统性误差、把摩擦系数放到三套网格上做收敛与外部对照。本文以二维槽道为例给出可直接照做的判据，算例取半高 $h = 0.05\,\mathrm{m}$、体积平均速度 $U_b = 3\,\mathrm{m/s}$、空气 $\rho = 1.2\,\mathrm{kg/m^3}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$，即 $Re_b = 20000$。

### 1 用壁面剪切场反推实际 y+

设计阶段用的 $u_\tau$ 来自关联式，求解后的 $u_\tau$ 来自壁面剪切，两者可以差 20% 以上，所以诊断必须用后者：

$$u_\tau = \sqrt{\tau_w/\rho}, \qquad y^{+} = \frac{u_\tau\, y_p}{\nu}$$

槽道流的摩擦系数用 Dean 关联式 $C_f = 0.073\,Re_b^{-0.25}$，其中 $C_f = 2\tau_w/(\rho U_b^{2})$。代入 $Re_b = 20000$ 得 $C_f = 0.073/11.89 = 6.14\times10^{-3}$，于是 $u_\tau = U_b\sqrt{C_f/2} = 3\times0.0554 = 0.166\,\mathrm{m/s}$，$\tau_w = 0.0331\,\mathrm{Pa}$，$\nu/u_\tau = 90.3\,\mathrm{\mu m}$。

把三套网格的首层单元高度代入上式，得到完全不同的结论：

| 首层单元高度 | 单元中心 $y_p$ | 实际 y+ | 判定 |
|---|---|---|---|
| 0.2 mm | 0.10 mm | 1.11 | 可做壁面解析 |
| 3.0 mm | 1.50 mm | 16.6 | 落在缓冲层，两种处理都不可信 |
| 10.0 mm | 5.00 mm | 55.4 | 落在标准壁函数有效区 |

中间那套网格是最典型的陷阱：它既没有细到能解析黏性底层，也没有粗到能安全使用壁函数。

### 2 对数律偏差作为壁面处理健康指标

壁函数在单元中心施加的约束是

$$u^{+} = \frac{1}{\kappa}\ln y^{+} + B$$

取 $\kappa = 0.41$、$B = 5.2$，可算出几个参考值：$y^{+} = 30$ 时 $u^{+} = 13.50$，$y^{+} = 50$ 时 $u^{+} = 14.74$，$y^{+} = 100$ 时 $u^{+} = 16.43$。把 CFD 解出的 $u^{+}$ 与这些值逐点比较，定义对数律偏差

$$\epsilon_{\log} = \frac{u^{+}_{\mathrm{CFD}} - u^{+}_{\log}}{u^{+}_{\log}}$$

工程判据是：$y^{+} > 30$ 时 $|\epsilon_{\log}|$ 应小于 5%；若在 $y^{+} \approx 15$ 处取点，对数律本身已高估约 10%，此时出现大偏差不能直接归咎于求解器。因此取点位置必须与 y+ 一起报告，单说“对数律对不上”没有信息量。

### 3 缓冲层单元面积占比的统计口径

面积平均 y+ 会掩盖分布问题，必须分箱统计。对壁函数算例，把壁面单元按 y+ 分成四档：$y^{+} < 5$、$5 \le y^{+} < 30$、$30 \le y^{+} \le 300$、$y^{+} > 300$，用面积加权求各档占比。判据是第二档（缓冲层）面积占比低于 5%，第三档高于 85%。对壁面解析算例则相反：$y^{+} \le 1$ 的面积占比应高于 90%。

以上表 3.0 mm 那套网格为例，若壁面共 4800 个面、缓冲层区间占 3600 个面，则缓冲层面积占比 75%，远超 5% 的阈值，无论残差降到多低都应判为近壁不可信。

### 4 摩擦系数的网格收敛与外部对照

近壁分辨率最终要落在积分量上。用三套按 $r = 1.5$ 加密的网格计算 $C_f = 2\tau_w/(\rho U_b^{2})$，得到 $6.41\times10^{-3}$、$6.24\times10^{-3}$、$6.17\times10^{-3}$（网格量 1.0 M、2.25 M、5.06 M）。按 Roache 的网格收敛指数：

$$GCI = \frac{F_s\,|\varepsilon|}{r^{p}-1}$$

其中 $\varepsilon$ 为相邻两套网格的相对差，$F_s = 1.25$。两级差分为 $-2.65\times10^{-2}$ 与 $-1.12\times10^{-2}$，比值 0.423 给出观测阶 $p = 2.1$，接近二阶格式的期望值，可以认为进入渐近区。于是 $GCI = 1.25\times2.65\times10^{-2}/(1.5^{2.1}-1) = 2.4\%$，即 $C_f = 6.24\times10^{-3} \pm 2.4\%$。Dean 关联式给出 $6.14\times10^{-3}$，落在区间内且相差 1.6%，可作为近壁处理未引入系统偏差的证据。

若三套网格的 $C_f$ 单调下降但两级比值远大于 0.25，说明仍在渐近区之外，此时的“收敛”只是误差互相抵消，不能用于验收。

### 5 把诊断写成可复算的脚本

```python
import numpy as np
rho, nu, Ub, h = 1.2, 1.5e-5, 3.0, 0.05
Cf_dean = 0.073 * (Ub * 2 * h / nu) ** -0.25
u_tau   = Ub * (Cf_dean / 2) ** 0.5
print(f"Cf={Cf_dean:.3e} u_tau={u_tau:.4f} m/s tau_w={rho*u_tau**2:.4f} Pa")

kappa, B = 0.41, 5.2
loglaw = lambda yp: np.log(yp) / kappa + B
for yp in (30, 50, 100):
    print(f"y+={yp:4d}  u+_log={loglaw(yp):.2f}")

# 壁面单元分箱：yplus 为面积加权数组，area 为对应面积
def bins(yplus, area, edges=(0, 5, 30, 300, 1e9)):
    tot = area.sum()
    return [(f"{edges[i]}-{edges[i+1]}", area[(yplus >= edges[i]) & (yplus < edges[i+1])].sum() / tot)
            for i in range(len(edges) - 1)]
```

脚本输出 $C_f = 6.139\times10^{-3}$、$u_\tau = 0.1662\,\mathrm{m/s}$、$\tau_w = 0.0331\,\mathrm{Pa}$，与手算一致，可作为交付记录里的复核凭证。

### 6 近壁诊断的失败模式与反证

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 面积平均 y+ 合格，但壁面压力分布出现台阶 | 局部区域 y+ 掉进缓冲层，被平均值掩盖 | 输出 y+ 的最小值场并标出缓冲层单元位置 |
| $y^{+} > 30$ 处 $u^{+}$ 比对数律低 8% | 壁面第一层单元过厚，对数律被外推到不该用的位置 | 保持流向网格不变，只把首层减半重算，看偏差是否收窄 |
| 加密后 $C_f$ 单调上升且不收敛 | 加密跨越了壁面处理分支，从壁函数滑向解析 | 在壁函数区与解析区各固定一种处理，分别做网格收敛 |
| 换用 SST 后 $C_f$ 下降 9% | 两模型预测的 $\tau_w$ 不同，y+ 随之整体平移 | 用新模型的 $\tau_w$ 重算 y+，确认网格是否仍落在原区间 |
| 壁面解析算例的 $u^{+}$ 在 $y^{+} < 5$ 偏离 $u^{+} = y^{+}$ | 黏性底层层数不足，或壁面边界条件用了零梯度 | 检查黏性底层内的单元数与壁面速度边界类型 |

### 7 方法与标准来源

1. Moser R. D., Kim J., Mansour N. N., "Direct numerical simulation of turbulent channel flow up to $Re_\tau = 590$," *Physics of Fluids*, 1999.
2. Kim J., Moin P., Moser R., "Turbulence statistics in fully developed channel flow at low Reynolds number," *Journal of Fluid Mechanics*, 1987.
3. Roache P. J., *Verification and Validation in Computational Science and Engineering*, Hermosa Publishers, 1998.
4. Spalding D. B., "A single formula for the law of the wall," *Journal of Applied Mechanics*, 1961.
