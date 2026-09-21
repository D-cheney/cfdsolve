---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-separated-flow-modeling
title: "分离流动与再附：物理建模与适用边界"
summary: "从逆压梯度下的边界层平衡出发，解释涡黏模型为何在分离区系统性失真，给出从 RANS 到 DES、LES、DNS 的模型层级与网格代价，并附圆柱绕流的量级估算。"
category:
  slug: physics
  name: "流体力学基础"
level: 进阶
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CFD"
  - "流体力学基础"
  - "分离流动与再附"
  - "物理建模与适用边界"
  - "逆压梯度"
  - "DES"
seo:
  title: "分离流动与再附：物理建模与适用边界"
  description: "从逆压梯度下的边界层平衡出发，解释涡黏模型为何在分离区系统性失真，给出从 RANS 到 DES、LES、DNS 的模型层级与网格代价，并附圆柱绕流的量级估算。"
  keywords:
    - "分离流动与再附"
    - "物理建模与适用边界"
    - "逆压梯度"
    - "DES"
    - "形状因子"
---

# 分离流动与再附：物理建模与适用边界

分离区的湍流不是"更强的边界层湍流"，而是另一种东西：剪切层卷起、涡配对、再附点附近强非平衡。涡黏模型把雷诺应力写成局部应变的线性函数，这个前提在分离区恰恰不成立。本文说明失效的力学来源、模型升级的实际判据，以及每一级升级要付出的网格代价。

## 1 分离的力学条件

二维不可压边界层在壁面处的动量方程退化为

$$
\left.\frac{\partial p}{\partial x}\right|_{w} = \mu\left.\frac{\partial^{2} u}{\partial y^{2}}\right|_{w}
$$

逆压梯度 $dp/dx>0$ 对应壁面处 $\partial^{2}u/\partial y^{2}>0$，即速度剖面近壁处上凸。当逆压梯度足够强，近壁速度被持续减速直到 $\partial u/\partial y|_{w}=0$，流动脱离壁面。两个常用的定量判据是壁面摩擦系数归零与形状因子临界：

$$
C_f = \frac{\tau_w}{\frac{1}{2}\rho U_e^{2}} \to 0,\qquad H=\frac{\delta^{*}}{\theta}\to 2.4\sim2.6
$$

层流边界层有解析判据 Thwaites 参数 $\lambda=(\theta^{2}/\nu)\,dU_e/dx$，分离发生在 $\lambda\approx-0.09$。湍流没有同等简洁的解析判据，工程上以 $H$ 与 $C_f$ 联合判断。

## 2 涡黏假设在分离区为何失效

Boussinesq 假设

$$
-\rho\overline{u_i'u_j'} = \mu_t\left(\frac{\partial \bar u_i}{\partial x_j}+\frac{\partial \bar u_j}{\partial x_i}\right) - \frac{2}{3}\rho k\delta_{ij}
$$

要求雷诺应力的主轴与平均应变率主轴对齐，并且各向异性只由一个标量 $\mu_t$ 描述。分离剪切层里两件事同时被破坏：一是湍动能产生与耗散严重不平衡（$P_k/\rho\varepsilon$ 可低至 0.3），二是法向应力各向异性达到 30% 以上。后果是 $\mu_t$ 被高估，剪切层被人为"黏住"，分离区偏短、再附点上移。标准 $k$-$\varepsilon$ 对后台阶的再附长度常给出 $x_r/h\approx4$，而实验值是 6。

逆压梯度还会触发另一类错误：湍流模型把分离点预测得过于靠后，因为壁函数假设对数律一直成立，而分离区根本没有对数律。

## 3 模型层级与网格代价

| 层级 | 建模方式 | 分离区表现 | 网格量级（相对 RANS） |
|---|---|---|---|
| 标准 $k$-$\varepsilon$ + 壁函数 | 全 RANS，各向同性涡黏 | 再附长度偏短 30% | 1 |
| $k$-$\omega$ SST | 全 RANS，剪切应力输运限制 | 再附长度误差 10%~20% | 1~2 |
| 雷诺应力模型（RSM） | 直接解应力输运 | 各向异性改善，误差 10% | 3~5 |
| DES / IDDES | 近壁 RANS、分离区 LES | 误差 5%~10% | 10~50 |
| 壁面解析 LES | 全 LES | 误差 <5% | 100~1000 |
| DNS | 直接解 | 基准 | $10^{4}$ 以上 |

升级判据不是精度指标，而是"你要的量是否被模型抹掉"。若只要总阻力，SST 通常够；若要再附点附近的压力脉动、壁面热流峰值、或气动噪声频谱，必须上 DES 或 LES，因为这些都是分离剪切层非定常结构的直接产物。

## 4 圆柱绕流量级估算

圆柱直径 $D=0.1\,\mathrm{m}$，来流 $U=20\,\mathrm{m/s}$，空气 $\rho=1.2\,\mathrm{kg/m^3}$、$\nu=1.5\times10^{-5}\,\mathrm{m^2/s}$。

1. 雷诺数 $Re=UD/\nu=20\times0.1/1.5\times10^{-5}=1.33\times10^{5}$，处于亚临界区（$300<Re<3\times10^{5}$）；
2. 亚临界圆柱的斯特劳哈尔数 $St=fD/U\approx0.2$，故涡脱落频率 $f=0.2\times20/0.1=40\,\mathrm{Hz}$；
3. 阻力系数 $C_D\approx1.2$，单位长度阻力 $F/L=\frac{1}{2}\rho U^{2}D C_D=0.5\times1.2\times400\times0.1\times1.2=28.8\,\mathrm{N/m}$；
4. 分离角约 $\theta_s\approx82^{\circ}$（从前驻点量起），分离点位置 $x_s=(D/2)(1-\cos\theta_s)=0.05\times(1-0.139)=0.043\,\mathrm{m}$。

第 2 步的 40 Hz 直接决定时间步：要解析脱落周期，每周期至少 100 步，则 $\Delta t\le1/(100\times40)=2.5\times10^{-4}\,\mathrm{s}$。第 4 步的 0.043 m 决定壁面展向与流向网格：分离点附近的剪切层厚度约 $0.05D=5\,\mathrm{mm}$，需至少 10 个单元跨过，即 $\Delta x\approx0.5\,\mathrm{mm}$。这些数字必须在建模之前算出来，而不是算完之后补。

## 5 建模选择的实用规则

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

## 6 模型假设被突破时的信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 再附长度比实验短 30% 以上 | 涡黏假设在剪切层失效，$\mu_t$ 被高估 | 换 SST 或 DES 重算，比较再附长度 |
| 分离点对网格加密持续前移 | 分离点由数值耗散而非物理决定 | 做两次加密，要求分离点变化小于 2% |
| DES 结果比纯 RANS 更差 | 分离区网格不足以进入 LES 分支 | 检查分离区 $y^{+}$ 与流向单元数，必要时改 IDDES |
| 稳态解得到的阻力比实验低 30% | 周期性脱落被时间平均抹平 | 计算 $St$ 与脱落频率，改用 URANS 或 LES |
| 壁面热流峰值位置与实验偏差一个台阶高 | 再附点位置错误，剪切层未解析 | 加密分离剪切层，核对 $C_f$ 变号点 |
| 尖角分离的算例反而偏差最大 | 尖角处网格质量差，产生伪分离 | 检查尖角附近单元正交性与长宽比 |

## 参考资料

1. Simpson R.L., "Turbulent Boundary-Layer Separation," *Annual Review of Fluid Mechanics*, 21, 205-234, 1989.
2. Bradshaw P., Huang G.P., "The Law of the Wall in Turbulent Flow," *Proceedings of the Royal Society A*, 451(1941), 165-188, 1995.
3. Menter F.R., "Two-Equation Eddy-Viscosity Turbulence Models for Engineering Applications," *AIAA Journal*, 32(8), 1598-1605, 1994.
4. Spalart P.R., "Detached-Eddy Simulation," *Annual Review of Fluid Mechanics*, 41, 181-202, 2009.
5. Driver D.M., Seegmiller H.L., "Features of a Reattaching Turbulent Shear Layer in Divergent Channel Flow," *AIAA Journal*, 23(2), 163-171, 1985.
