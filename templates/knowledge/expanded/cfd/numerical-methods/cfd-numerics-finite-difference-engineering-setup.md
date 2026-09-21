---
template_version: "flowlab-knowledge/1.0"
slug: cfd-numerics-finite-difference-engineering-setup
title: "有限差分法：工程设置与参数选择"
summary: "锁定有限差分的四项配置：模板与阶数、由 y+ 反算的壁面首层高度、几何拉伸比与层数、时间步上限，附模板对照表、参数表与可直接运行的网格生成脚本。"
category:
  slug: numerical-methods
  name: "CFD 数值方法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "CFD 数值方法"
  - "有限差分法"
  - "工程设置与参数选择"
  - "壁面分辨率"
  - "几何拉伸"
seo:
  title: "有限差分法：工程设置与参数选择"
  description: "锁定有限差分的四项配置：模板与阶数、由 y+ 反算的壁面首层高度、几何拉伸比与层数、时间步上限，附模板对照表、参数表与可直接运行的网格生成脚本。"
  keywords:
    - "有限差分法"
    - "工程设置与参数选择"
    - "壁面分辨率"
    - "几何拉伸"
    - "库朗数"
---

# 有限差分法：工程设置与参数选择

一套可复现的有限差分配置要同时锁死四样东西：差分模板与阶数、网格分布（含壁面首层高度）、时间推进格式与步长、以及边界闭合方式。本文给出这四项的取值依据、壁面分辨率的反算过程，以及一段可直接运行的网格与步长生成脚本。

## 一、模板与阶数对照

| 目标导数 | 模板 | 名义阶数 | 带宽 |
|---|---|---|---|
| $u'$ | $(u_{i+1}-u_{i-1})/(2\Delta x)$ | 2 | 3 |
| $u'$ | $(-u_{i+2}+8u_{i+1}-8u_{i-1}+u_{i-2})/(12\Delta x)$ | 4 | 5 |
| $u'$ | Padé 紧致（隐式三对角） | 4 | 3 |
| $u''$ | $(u_{i+1}-2u_i+u_{i-1})/\Delta x^2$ | 2 | 3 |
| $u''$ | $(-u_{i+2}+16u_{i+1}-30u_i+16u_{i-1}-u_{i-2})/(12\Delta x^2)$ | 4 | 5 |

分辨率经验值：二阶格式每波长至少 20 点，四阶显式 8～10 点，六阶 5～6 点。选择依据是目标波长而非几何尺度——若最关心的涡尺度是 0.05 m，则二阶格式要求 $\Delta x\le2.5\times10^{-3}$ m。

## 二、壁面首层高度由 $y^+$ 反算

壁面解析的关键参数是首层高度，它由目标 $y^+$、运动粘度与摩擦速度共同决定：

$$
\Delta y_1=\frac{y^+_{\text{target}}\,\nu}{u_\tau}
$$

取空气 $\nu=1.5\times10^{-5}$ m²/s、壁面摩擦速度 $u_\tau=0.3$ m/s、目标 $y^+=1$，则 $\Delta y_1=1\times1.5\times10^{-5}/0.3=5\times10^{-5}$ m，即 50 μm。若改用壁面函数、目标 $y^+=30$，则 $\Delta y_1=1.5\times10^{-3}$ m，两者相差 30 倍。$y^+$ 目标一旦定错，后续所有层厚都会系统性偏离。

## 三、几何拉伸与层数

按几何级数 $\Delta y_i=\Delta y_1 r^{\,i-1}$ 拉伸，从 $\Delta y_1$ 累积到半槽高 $H$：

$$
\Delta y_1\frac{r^{n}-1}{r-1}=H\ \Longrightarrow\ \frac{1.15^{n}-1}{0.15}=\frac{0.05}{5\times10^{-5}}=1000
$$

解得 $1.15^n=151$，$n=\ln 151/\ln 1.15=5.017/0.1398\approx36$。即半槽 36 层、全槽 72 层。拉伸比 $r$ 常用上限为 1.2，超过后截断误差中的网格变化率项会显著增大，名义二阶格式可能只表现出一阶。

## 四、时间步上限

$$
\Delta t=\mathrm{CFL}\,\frac{\Delta x_{\min}}{|u|+c}
$$

取库朗数 0.8、$\Delta x_{\min}=5\times10^{-5}$ m、$|u|+c=50$ m/s（约 Ma 0.15 的空气流），得 $\Delta t=0.8\times5\times10^{-5}/50=8\times10^{-7}$ s。注意这里用的是全场最小网格尺度；若只在局部加密而全局用同一时间步，总步数由最细网格决定。

## 五、网格与步长生成脚本

```python
import numpy as np

def stretched_grid(dy1, r, H):
    """从首层高度 dy1 按比例 r 拉伸到半槽高 H，返回节点坐标。"""
    ys = [0.0]
    dy = dy1
    while ys[-1] < H:
        ys.append(ys[-1] + dy)
        dy *= r
    return np.array(ys)

def dt_max(dx_min, umax, c, cfl=0.8):
    return cfl * dx_min / (umax + c)

y = stretched_grid(5e-5, 1.15, 0.05)
print(f"层数={len(y)-1}, 首层={y[1]-y[0]:.2e} m, dt={dt_max(5e-5, 40.0, 10.0):.2e} s")
# 层数=36, 首层=5.00e-05 m, dt=8.00e-07 s
```

## 六、失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 壁面附近速度剖面偏离对数律 | 首层高度未按 $y^+$ 反算，或 $u_\tau$ 取自错误位置 | 输出壁面 $y^+$ 分布，检查是否与目标一致 |
| 拉伸区出现明显数值振荡 | 拉伸比 $r>1.2$，截断误差随网格变化率增大 | 把 $r$ 降到 1.1 重算，看振荡是否消失 |
| 显式步进在局部加密区失稳 | 时间步按平均网格而非最小网格选取 | 用 $\Delta x_{\min}$ 重算 $\Delta t$，看是否稳定 |
| 边界附近误差比内点高一个量级 | 边界模板阶数低于内点，或未用 SBP/SAT | 分别统计边界与内点的误差，比较收敛阶 |
| 均匀流场产生非零残差 | 变步长网格未满足几何守恒律 | 用常数初值运行一步，检查残差是否为零 |
| 长时间积分后总通量漂移 | 对流项写成非守恒形式 | 改用通量形式重算，比较两端边界通量之差 |

## 七、文献来源

1. Thompson J. F., Warsi Z. U. A., Mastin C. W., *Numerical Grid Generation: Foundations and Applications*, North-Holland, 1985.
2. Gustafsson B., *High Order Difference Methods for Time Dependent PDE*, Springer, 2008.
3. Mattsson K., Nordström J., "Summation by Parts Operators for Finite Difference Approximations of Second Derivatives", *Journal of Computational Physics*, 199(2), 503-540, 2004.
4. Shu C.-W., *Essentially Non-Oscillatory and Weighted Essentially Non-Oscillatory Schemes for Hyperbolic Conservation Laws*, NASA/CR-97-206253, ICASE Report No. 97-65, 1997.
