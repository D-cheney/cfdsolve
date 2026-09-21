---
template_version: flowlab-knowledge/1.0
slug: cfd-physics-separated-flow-modeling
title: 分离流动与再附：原理与诊断验证
summary: >-
  从逆压梯度下的边界层平衡出发，解释涡黏模型为何在分离区系统性失真，给出从 RANS 到 DES、LES、DNS
  的模型层级与网格代价，并附圆柱绕流的量级估算。
category:
  slug: physics
  name: 流体力学基础
level: 进阶
reading_minutes: 16
status: PUBLISHED
author_username: lin-cfd
published_at: '2026-09-20T00:00:00.000Z'
tags:
  - CFD
  - 流体力学基础
  - 分离流动与再附
  - 物理建模与适用边界
  - 逆压梯度
  - DES
  - 结果诊断与可信度验证
  - 壁面摩擦系数
  - 再附长度
seo:
  title: 分离流动与再附：原理与诊断验证
  description: >-
    从逆压梯度下的边界层平衡出发，解释涡黏模型为何在分离区系统性失真，给出从 RANS 到 DES、LES、DNS
    的模型层级与网格代价，并附圆柱绕流的量级估算。
  keywords:
    - 分离流动与再附
    - 物理建模与适用边界
    - 逆压梯度
    - DES
    - 形状因子
    - 结果诊断与可信度验证
    - 壁面摩擦系数
    - 再附长度
    - 后台阶
---
# 分离流动与再附：原理与诊断验证

分离区的湍流不是"更强的边界层湍流"，而是另一种东西：剪切层卷起、涡配对、再附点附近强非平衡。涡黏模型把雷诺应力写成局部应变的线性函数，这个前提在分离区恰恰不成立。分离流动的判据只有一条是硬性的：壁面剪应力为零。其余所有"看着像分离"的特征——回流、低速区、涡核——都是它的后果而不是定义。因此诊断分离算例时，第一件事是输出壁面摩擦系数分布，找出变号点，再把它与实验或基准的分离点、再附点逐一对比。

## 分离点与再附点由 Cf 变号定义

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

## 圆柱绕流量级估算

圆柱直径 $D=0.1\,\mathrm{m}$，来流 $U=20\,\mathrm{m/s}$，空气 $\rho=1.2\,\mathrm{kg/m^3}$、$\nu=1.5\times10^{-5}\,\mathrm{m^2/s}$。

1. 雷诺数 $Re=UD/\nu=20\times0.1/1.5\times10^{-5}=1.33\times10^{5}$，处于亚临界区（$300<Re<3\times10^{5}$）；
2. 亚临界圆柱的斯特劳哈尔数 $St=fD/U\approx0.2$，故涡脱落频率 $f=0.2\times20/0.1=40\,\mathrm{Hz}$；
3. 阻力系数 $C_D\approx1.2$，单位长度阻力 $F/L=\frac{1}{2}\rho U^{2}D C_D=0.5\times1.2\times400\times0.1\times1.2=28.8\,\mathrm{N/m}$；
4. 分离角约 $\theta_s\approx82^{\circ}$（从前驻点量起），分离点位置 $x_s=(D/2)(1-\cos\theta_s)=0.05\times(1-0.139)=0.043\,\mathrm{m}$。

第 2 步的 40 Hz 直接决定时间步：要解析脱落周期，每周期至少 100 步，则 $\Delta t\le1/(100\times40)=2.5\times10^{-4}\,\mathrm{s}$。第 4 步的 0.043 m 决定壁面展向与流向网格：分离点附近的剪切层厚度约 $0.05D=5\,\mathrm{mm}$，需至少 10 个单元跨过，即 $\Delta x\approx0.5\,\mathrm{mm}$。这些数字必须在建模之前算出来，而不是算完之后补。

## 建模选择的实用规则

**先判断分离是否由几何固定。** 尖角、台阶、钝体尾缘这类几何强迫分离，分离点由几何决定，RANS 通常够用。光滑表面上的压力驱动分离，分离点对湍流模型极敏感，必须用能捕捉非平衡的模型。

**再判断是否需要非定常。** 若分离区有周期性脱落（$St$ 明确），稳态解只是时间平均，峰值载荷会被低估 30% 以上。用 $St$ 与特征长度算出频率，再决定是 URANS、DES 还是 LES。

**最后核对网格是否支撑所选模型。** DES 在细网格区自动切换到 LES，但如果整个分离区网格都不足以解析剪切层，DES 会退化为带网格依赖的 RANS，结果比纯 RANS 更不可信——这是 DES 最常见的误用方式。

```cpp
// LES 设置示例：分离区网格必须满足 dx+ < 100, dz+ < 30, dy+ < 1
LES
{
    LESModel        WALE;
    turbulence      on;
    printCoeffs     on;
    delta           cubeRootVol;
    cubeRootVolCoeffs { deltaCoeff 1.0; }
}

// DES 需要屏蔽函数避免网格诱导分离（MSD / IDDES）
```

```python
def des_grid_check(nu, u_tau, D=0.1):
    dx = 100 * nu / u_tau
    dz = 30 * nu / u_tau
    dy = 1.0 * nu / u_tau
    return dict(dx_mm=dx * 1e3, dz_mm=dz * 1e3, dy_um=dy * 1e6)

# u_tau = 0.274 m/s 时：dx=5.5 mm, dz=1.6 mm, dy=55 um
print(des_grid_check(1.5e-5, 0.274))
```

## 模型假设被突破时的信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 再附长度比实验短 30% 以上 | 涡黏假设在剪切层失效，$\mu_t$ 被高估 | 换 SST 或 DES 重算，比较再附长度 |
| 分离点对网格加密持续前移 | 分离点由数值耗散而非物理决定 | 做两次加密，要求分离点变化小于 2% |
| DES 结果比纯 RANS 更差 | 分离区网格不足以进入 LES 分支 | 检查分离区 $y^{+}$ 与流向单元数，必要时改 IDDES |
| 稳态解得到的阻力比实验低 30% | 周期性脱落被时间平均抹平 | 计算 $St$ 与脱落频率，改用 URANS 或 LES |
| 壁面热流峰值位置与实验偏差一个台阶高 | 再附点位置错误，剪切层未解析 | 加密分离剪切层，核对 $C_f$ 变号点 |
| 尖角分离的算例反而偏差最大 | 尖角处网格质量差，产生伪分离 | 检查尖角附近单元正交性与长宽比 |

## 分离的力学条件

二维不可压边界层在壁面处的动量方程退化为

$$
\left.\frac{\partial p}{\partial x}\right|_{w} = \mu\left.\frac{\partial^{2} u}{\partial y^{2}}\right|_{w}
$$

逆压梯度 $dp/dx>0$ 对应壁面处 $\partial^{2}u/\partial y^{2}>0$，即速度剖面近壁处上凸。当逆压梯度足够强，近壁速度被持续减速直到 $\partial u/\partial y|_{w}=0$，流动脱离壁面。两个常用的定量判据是壁面摩擦系数归零与形状因子临界：

$$
C_f = \frac{\tau_w}{\frac{1}{2}\rho U_e^{2}} \to 0,\qquad H=\frac{\delta^{*}}{\theta}\to 2.4\sim2.6
$$

层流边界层有解析判据 Thwaites 参数 $\lambda=(\theta^{2}/\nu)\,dU_e/dx$，分离发生在 $\lambda\approx-0.09$。湍流没有同等简洁的解析判据，工程上以 $H$ 与 $C_f$ 联合判断。

## 模型层级与网格代价

升级判据不是精度指标，而是"你要的量是否被模型抹掉"。若只要总阻力，SST 通常够；若要再附点附近的压力脉动、壁面热流峰值、或气动噪声频谱，必须上 DES 或 LES，因为这些都是分离剪切层非定常结构的直接产物。

| 层级 | 建模方式 | 分离区表现 | 网格量级（相对 RANS） |
|---|---|---|---|
| 标准 $k$-$\varepsilon$ + 壁函数 | 全 RANS，各向同性涡黏 | 再附长度偏短 30% | 1 |
| $k$-$\omega$ SST | 全 RANS，剪切应力输运限制 | 再附长度误差 10%~20% | 1~2 |
| 雷诺应力模型（RSM） | 直接解应力输运 | 各向异性改善，误差 10% | 3~5 |
| DES / IDDES | 近壁 RANS、分离区 LES | 误差 5%~10% | 10~50 |
| 壁面解析 LES | 全 LES | 误差 <5% | 100~1000 |
| DNS | 直接解 | 基准 | $10^{4}$ 以上 |

## 诊断脚本与求解器配置

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

## 故障模式与判定试验

Boussinesq 假设

$$
-\rho\overline{u_i'u_j'} = \mu_t\left(\frac{\partial \bar u_i}{\partial x_j}+\frac{\partial \bar u_j}{\partial x_i}\right) - \frac{2}{3}\rho k\delta_{ij}
$$

要求雷诺应力的主轴与平均应变率主轴对齐，并且各向异性只由一个标量 $\mu_t$ 描述。分离剪切层里两件事同时被破坏：一是湍动能产生与耗散严重不平衡（$P_k/\rho\varepsilon$ 可低至 0.3），二是法向应力各向异性达到 30% 以上。后果是 $\mu_t$ 被高估，剪切层被人为"黏住"，分离区偏短、再附点上移。标准 $k$-$\varepsilon$ 对后台阶的再附长度常给出 $x_r/h\approx4$，而实验值是 6。

逆压梯度还会触发另一类错误：湍流模型把分离点预测得过于靠后，因为壁函数假设对数律一直成立，而分离区根本没有对数律。

**误判一：数值耗散伪造"健康"流动。** 一阶迎风格式在分离剪切层里引入的等效黏性可以让回流区完全消失，而残差曲线完美收敛。区分试验是把对流格式从一阶换成二阶有界格式，若再附长度变化超过 15%，说明原结果被耗散污染。典型幅度是一阶格式把 $x_r/h$ 从 6.0 压到 4.0 左右。

**误判二：网格不足导致分离点漂移。** 加密网格后分离点持续向上游移动，说明尚未进入渐近区。判定要求是连续两次加密（网格量约 1.5 倍）之间，分离点位置变化小于 2%，再附长度变化小于 3%。

**误判三：稳态求解抹平非定常。** 后台阶在 $Re_h>10^{4}$ 时剪切层有低频摆动，稳态 RANS 会把再附点固定在某个中间值。区分试验是用 URANS 算 10 个流通周期，观察再附点的时间序列标准差；若超过 5%，则稳态结果只是一个平均值，不能用于峰值载荷判断。

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 回流区完全消失，残差却收敛良好 | 一阶迎风数值耗散过大 | 换二阶有界格式重算，比较再附长度 |
| 分离点随网格加密持续上移 | 网格未收敛 | 做两次加密，要求分离点变化小于 2% |
| 再附点位置随迭代低频振荡 | 流动本质非定常，稳态假设不成立 | 用 URANS 算 10 个流通周期，看标准差 |
| $H$ 已达 2.5 但 $C_f$ 处处为正 | 壁面剪应力离散误差或壁函数跨过了分离区 | 检查 $y^{+}$ 分布，分离区首层应落在 $y^{+}<1$ |
| 再附点下游 $C_f$ 出现伪振荡 | 壁面附近网格长宽比过大 | 检查壁面单元长宽比，应小于 50 |
| 二维结果与三维基准偏差超过 20% | 三维二次流与展向不均匀被忽略 | 用展向周期边界做三维对照 |
| 用壁函数算出的分离区长度明显偏短 | 壁函数在对流分离区失效 | 改用低雷诺模型或 $y^{+}\approx1$ 的壁面解析网格 |

## 后台阶算例：手算基准

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

## 归档要点

一份分离流报告必须包含：$C_f$ 沿壁面的完整曲线（不是局部截图）、$H$ 沿程分布、$y^{+}$ 的最小值与分布、以及再附长度与基准值的对比表。另外要记录对流格式与其阶数——这是分离流里唯一一个能把结果改变 50% 的数值设置。若报告中只有速度云图和残差曲线，那么无论云图多漂亮，都不构成分离结果可信的证据。

## 参考资料

1. Simpson R.L., "Turbulent Boundary-Layer Separation," *Annual Review of Fluid Mechanics*, 21, 205-234, 1989.
2. Bradshaw P., Huang G.P., "The Law of the Wall in Turbulent Flow," *Proceedings of the Royal Society A*, 451(1941), 165-188, 1995.
3. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications," *AIAA Journal*, 32(8), 1598-1605, 1994.
4. Spalart P.R., "Detached-Eddy Simulation," *Annual Review of Fluid Mechanics*, 41, 181-202, 2009.
5. Driver D.M., Seegmiller H.L., "Features of a Reattaching Turbulent Shear Layer in Divergent Channel Flow," *AIAA Journal*, 23(2), 163-171, 1985.
6. Kim J., Kline S.J., Johnston J.P., "Investigation of a Reattaching Turbulent Shear Layer: Flow over a Backward-Facing Step," *Journal of Fluids Engineering*, 102(3), 302-308, 1980.
7. Menter F.R., Kuntz M., Langtry R., "Ten Years of Industrial Experience with the SST Turbulence Model," *Turbulence, Heat and Mass Transfer 4*, Begell House, 625-632, 2003.
