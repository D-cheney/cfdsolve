---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-separated-flow-diagnosis-validation
title: "分离流动与再附：结果诊断与可信度验证"
summary: "以壁面摩擦系数变号点与再附长度为基准量，给出分离区结果的三类诊断：数值耗散伪造分离、网格分辨率不足、以及稳态求解抹平非定常。含后台阶算例与壁面网格要求的手算。"
category:
  slug: physics
  name: "流体力学基础"
level: 专题
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "流体力学基础"
  - "分离流动与再附"
  - "结果诊断与可信度验证"
  - "壁面摩擦系数"
  - "再附长度"
seo:
  title: "分离流动与再附：结果诊断与可信度验证"
  description: "以壁面摩擦系数变号点与再附长度为基准量，给出分离区结果的三类诊断：数值耗散伪造分离、网格分辨率不足、以及稳态求解抹平非定常。含后台阶算例与壁面网格要求的手算。"
  keywords:
    - "分离流动与再附"
    - "结果诊断与可信度验证"
    - "壁面摩擦系数"
    - "再附长度"
    - "后台阶"
---

# 分离流动与再附：结果诊断与可信度验证

分离流动的判据只有一条是硬性的：壁面剪应力为零。其余所有"看着像分离"的特征——回流、低速区、涡核——都是它的后果而不是定义。因此诊断分离算例时，第一件事是输出壁面摩擦系数分布，找出变号点，再把它与实验或基准的分离点、再附点逐一对比。本文按这个顺序给出判定量、阈值与三类常见误判。

## 1 分离点与再附点由 Cf 变号定义

$$
C_f = \frac{\tau_w}{\frac{1}{2}\rho U_\infty^{2}},\qquad
\tau_w = \mu\left.\frac{\partial u}{\partial y}\right|_{w}
$$

分离点处 $\partial u/\partial y|_w=0$，即 $C_f=0$；$C_f<0$ 的区间就是回流区；再次变号的位置是再附点。三个量必须同时报告：分离点位置、再附点位置、回流区内的 $C_f$ 最小值。只给一张速度云图，无法判断分离是否被数值耗散抹掉。

形状因子是独立的第二个判据。湍流边界层在零压梯度下 $H=\delta^{*}/\theta\approx1.4$；随逆压梯度增强 $H$ 上升，达到

$$
H = \frac{\delta^{*}}{\theta}\approx 2.4\sim2.6
$$

时进入分离临界。两个判据应当互相印证：若 $H$ 已经到 2.5 但 $C_f$ 始终为正，说明网格或格式有问题。

## 2 后台阶算例：手算基准

台阶高 $h=0.02\,\mathrm{m}$，来流 $U=10\,\mathrm{m/s}$，空气 $\nu=1.5\times10^{-5}\,\mathrm{m^2/s}$。

1. 台阶雷诺数 $Re_h=Uh/\nu=10\times0.02/1.5\times10^{-5}=1.33\times10^{4}$；
2. 该雷诺数下湍流后台阶的再附长度经验值 $x_r/h\approx6.0$，故 $x_r\approx0.12\,\mathrm{m}$，容许带取 $\pm10\%$，即 $0.108\sim0.132\,\mathrm{m}$；
3. 回流区内 $C_f$ 最小值约 $-1.5\times10^{-3}$，对应壁面剪应力 $\tau_w=C_f\cdot\frac{1}{2}\rho U^{2}=-1.5\times10^{-3}\times0.5\times1.2\times100=-0.09\,\mathrm{Pa}$；
4. 由该剪应力反算摩擦速度 $u_\tau=\sqrt{|\tau_w|/\rho}=\sqrt{0.09/1.2}=0.274\,\mathrm{m/s}$。

第 4 步给出网格要求。壁面解析型 LES 要求 $\Delta x^{+}\le100$、$\Delta z^{+}\le30$、$\Delta y^{+}\le1$，换算成物理尺度：

- 流向 $\Delta x\le100\nu/u_\tau=100\times1.5\times10^{-5}/0.274=5.5\,\mathrm{mm}$；
- 展向 $\Delta z\le30\times1.5\times10^{-5}/0.274=1.6\,\mathrm{mm}$；
- 壁面法向 $\Delta y\le1\times1.5\times10^{-5}/0.274=55\,\mu\mathrm{m}$。

后台阶算例的再附区长度 0.12 m，按 $\Delta x=5.5\,\mathrm{mm}$ 只需 22 个单元——看起来很省，但分离剪切层内的涡结构尺度远小于此，实际工程算例通常取 $\Delta x^{+}\approx20\sim50$ 才够。这三条数必须写进报告，否则网格无关性无从谈起。

## 3 三类误判及其区分试验

**误判一：数值耗散伪造"健康"流动。** 一阶迎风格式在分离剪切层里引入的等效黏性可以让回流区完全消失，而残差曲线完美收敛。区分试验是把对流格式从一阶换成二阶有界格式，若再附长度变化超过 15%，说明原结果被耗散污染。典型幅度是一阶格式把 $x_r/h$ 从 6.0 压到 4.0 左右。

**误判二：网格不足导致分离点漂移。** 加密网格后分离点持续向上游移动，说明尚未进入渐近区。判定要求是连续两次加密（网格量约 1.5 倍）之间，分离点位置变化小于 2%，再附长度变化小于 3%。

**误判三：稳态求解抹平非定常。** 后台阶在 $Re_h>10^{4}$ 时剪切层有低频摆动，稳态 RANS 会把再附点固定在某个中间值。区分试验是用 URANS 算 10 个流通周期，观察再附点的时间序列标准差；若超过 5%，则稳态结果只是一个平均值，不能用于峰值载荷判断。

## 4 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 回流区完全消失，残差却收敛良好 | 一阶迎风数值耗散过大 | 换二阶有界格式重算，比较再附长度 |
| 分离点随网格加密持续上移 | 网格未收敛 | 做两次加密，要求分离点变化小于 2% |
| 再附点位置随迭代低频振荡 | 流动本质非定常，稳态假设不成立 | 用 URANS 算 10 个流通周期，看标准差 |
| $H$ 已达 2.5 但 $C_f$ 处处为正 | 壁面剪应力离散误差或壁函数跨过了分离区 | 检查 $y^{+}$ 分布，分离区首层应落在 $y^{+}<1$ |
| 再附点下游 $C_f$ 出现伪振荡 | 壁面附近网格长宽比过大 | 检查壁面单元长宽比，应小于 50 |
| 二维结果与三维基准偏差超过 20% | 三维二次流与展向不均匀被忽略 | 用展向周期边界做三维对照 |
| 用壁函数算出的分离区长度明显偏短 | 壁函数在对流分离区失效 | 改用低雷诺模型或 $y^{+}\approx1$ 的壁面解析网格 |

## 5 诊断脚本与求解器配置

```bash
# 输出壁面剪应力与 Cf
postProcess -func wallShearStress -time 2000
postProcess -func "wallShearStress" -fields '(U p)' -time 2000

# 统计再附点：Cf 由正变负再变正的两个零点
```

```python
import numpy as np
def separation_points(x, cf):
    """返回 Cf 符号变化的两个位置: 分离点与再附点"""
    s = np.sign(cf)
    idx = np.where(np.diff(s) != 0)[0]
    return [(x[i], x[i + 1]) for i in idx]

# 归一化核对：xr/h 应落在 6.0 +/- 10%
h = 0.02
x = np.linspace(0.02, 0.4, 400)
# cf 由求解器导出后代入
```

```cpp
// 分离区需要壁面解析时，使用低雷诺处理
wallDist { method meshWave; }
// nut 壁面条件
nut     nutLowReWallFunction;   // 或 nutUWallFunction 仅在 y+ > 30 时
```

## 6 归档要点

一份分离流报告必须包含：$C_f$ 沿壁面的完整曲线（不是局部截图）、$H$ 沿程分布、$y^{+}$ 的最小值与分布、以及再附长度与基准值的对比表。另外要记录对流格式与其阶数——这是分离流里唯一一个能把结果改变 50% 的数值设置。若报告中只有速度云图和残差曲线，那么无论云图多漂亮，都不构成分离结果可信的证据。

## 参考资料

1. Kim J., Kline S.J., Johnston J.P., "Investigation of a Reattaching Turbulent Shear Layer: Flow over a Backward-Facing Step," *Journal of Fluids Engineering*, 102(3), 302-308, 1980.
2. Driver D.M., Seegmiller H.L., "Features of a Reattaching Turbulent Shear Layer in Divergent Channel Flow," *AIAA Journal*, 23(2), 163-171, 1985.
3. Simpson R.L., "Turbulent Boundary-Layer Separation," *Annual Review of Fluid Mechanics*, 21, 205-234, 1989.
4. Bradshaw P., Huang G.P., "The Law of the Wall in Turbulent Flow," *Proceedings of the Royal Society A*, 451(1941), 165-188, 1995.
5. Menter F.R., Kuntz M., Langtry R., "Ten Years of Industrial Experience with the SST Turbulence Model," *Turbulence, Heat and Mass Transfer 4*, Begell House, 625-632, 2003.
