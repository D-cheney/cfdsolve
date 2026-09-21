---
template_version: "flowlab-knowledge/1.0"
slug: cfd-turbulence-k-omega-sst-engineering-setup
title: "k–omega SST 模型：工程设置与参数选择"
summary: "从常数推导到字典落地：由 beta1、sigma_omega1 反算 alpha1 与 alpha2、用 (1~10)U/L 规则给定自由来流 omega 并量化其对湍流黏度比的影响、壁面距离场算法选择、产生项限制与旋转域设置。"
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
  - "k–omega SST 模型"
  - "工程设置与参数选择"
  - "自由来流 omega"
  - "壁面距离"
seo:
  title: "k–omega SST 模型：工程设置与参数选择"
  description: "从常数推导到字典落地：由 beta1、sigma_omega1 反算 alpha1 与 alpha2、用 (1~10)U/L 规则给定自由来流 omega 并量化其对湍流黏度比的影响、壁面距离场算法选择、产生项限制与旋转域设置。"
  keywords:
    - "k–omega SST 模型"
    - "工程设置与参数选择"
    - "自由来流 omega"
    - "壁面距离"
    - "混合函数"
---

# k–omega SST 模型：工程设置与参数选择

SST 的设置难点集中在两处：混合常数是否被软件按同一口径定义，以及自由来流 $\omega$ 怎么给。前者用一条代数恒等式就能核验，后者必须按几何尺度和来流速度换算，否则整个远场的湍流黏度会被抬高一个数量级。本文以 NACA 4412 翼型为例，弦长 $c = 1\,\mathrm{m}$、来流 $U_\infty = 23\,\mathrm{m/s}$、$\nu = 1.5\times10^{-5}\,\mathrm{m^2/s}$，即 $Re = 1.53\times10^{6}$。

## 1 混合常数的推导与逐项核对

SST 的内外层常数按 $F_1$ 插值：$\phi = F_1\phi_1 + (1-F_1)\phi_2$。内层取 $\sigma_{k1} = 0.85$、$\sigma_{\omega 1} = 0.5$、$\beta_1 = 0.075$；外层取 $\sigma_{k2} = 1.0$、$\sigma_{\omega 2} = 0.856$、$\beta_2 = 0.0828$。$\alpha$ 不是独立标定值，而是由下式反算：

$$\alpha = \frac{\beta}{\beta^{*}} - \frac{\sigma_\omega \kappa^{2}}{\sqrt{\beta^{*}}}, \qquad \beta^{*} = 0.09,\; \kappa = 0.41$$

代入内层得 $\alpha_1 = 0.075/0.09 - 0.5\times0.1681/0.3 = 0.8333 - 0.2802 = 0.553$；代入外层得 $\alpha_2 = 0.0828/0.09 - 0.856\times0.1681/0.3 = 0.9200 - 0.4796 = 0.440$。若某软件把 $\alpha$ 直接开放为可填项而默认值不等于 0.553 与 0.440，就必须手工改回，否则 $\omega$ 方程的产生项被系统性缩放。

```cpp
// constant/momentumTransport（OpenFOAM v10 及以后；v9 及以前在 turbulenceProperties）
simulationType  RAS;
RAS
{
    model           kOmegaSST;
    turbulence      on;
    printCoeffs     on;
}

kOmegaSSTCoeffs
{
    alphaK1     0.85;    // sigma_k1
    alphaK2     1.0;     // sigma_k2
    alphaOmega1 0.5;     // sigma_omega1
    alphaOmega2 0.856;   // sigma_omega2
    beta1       0.075;
    beta2       0.0828;
    betaStar    0.09;
    a1          0.31;    // 剪切应力限制常数
    c1          10;      // 产生项限制系数
    F3          false;   // 粗糙壁/涡量修正开关
}
```

## 2 自由来流 ω 的两种给定方式与量级后果

第一种方式沿用 k-ε 的长度尺度习惯：$\omega = \sqrt{k}/(C_\mu^{1/4} l)$，$l = 0.07 L$。取 $I = 0.5\%$ 得 $k = 1.5\times(23\times0.005)^{2} = 0.0198\,\mathrm{m^2/s^2}$，$l = 0.07\,\mathrm{m}$，于是 $\omega = 0.1409/(0.5477\times0.07) = 3.67\,\mathrm{s^{-1}}$。

第二种方式是直接按几何尺度给：$\omega_{\text{far}} = (1\sim10)\,U_\infty/L$。取系数 5 得 $\omega = 115\,\mathrm{s^{-1}}$。

两种给法在远场的湍流黏度比上差了一个数量级。自由来流中 $S \to 0$、$F_2 \to 0$，剪切应力限制失效，$\mu_t = \rho k/\omega$，故

$$\frac{\mu_t}{\mu} = \frac{k}{\nu\omega}$$

第一种给法得 $\mu_t/\mu = 0.0198/(1.5\times10^{-5}\times3.67) = 360$；第二种得 $0.0198/(1.5\times10^{-5}\times115) = 11.5$。远场合理的 $\mu_t/\mu$ 是个位数到几十，因此第一种给法把整个外部流场的湍流黏度抬高了约 30 倍。反过来看，第二种给法隐含的长度尺度是 $l = \sqrt{k}/(C_\mu^{1/4}\omega) = 2.24\,\mathrm{mm}$，只有弦长的 0.22%，远小于 $0.07c$——这说明 k-ε 的混合长度经验不能直接搬到 $\omega$ 上。

工程做法是：$I$ 按风洞实测取 0.5%~1% 给 $k$，$\omega$ 用 $(1\sim10)U_\infty/L$ 给，并把系数写进台账。系数从 1 变到 10，远场 $\mu_t/\mu$ 从 57.5 变到 5.75，升阻力对它的敏感度必须实测一遍。

## 3 壁面距离场的算法选择

$F_1$ 与 $F_2$ 都依赖壁面距离 $y$，因此壁面距离求解错误会直接破坏混合。OpenFOAM 在 `system/fvSchemes` 中配置：

```cpp
wallDist
{
    method          meshWave;   // 默认，精确但按最近壁面逐个传播
    // method       advectionDiffusion;  // 复杂遮挡几何下更平滑
}
```

`meshWave` 给出的是到最近壁面的真实距离，在薄缝、内腔和重叠网格交界处容易受网格质量影响；`advectionDiffusion` 通过求解一个扩散型方程得到近似距离场，在多体与遮挡几何中更稳健，但会抹平尖角附近的距离。判断方法很简单：输出 $y$ 场，检查翼型前缘、后缘与尾缘襟翼缝隙处的等值线是否连续，若出现突跳就换算法。

壁面网格仍按 $y$ 目标反算。取 $C_f = 0.026\,Re^{-1/7} = 3.40\times10^{-3}$，则 $\tau_w = 0.5C_f\rho U_\infty^{2} = 1.08\,\mathrm{Pa}$，$u_\tau = 0.948\,\mathrm{m/s}$，$\nu/u_\tau = 15.8\,\mathrm{\mu m}$。壁面解析取 $y^{+} = 1$ 得单元中心 15.8 μm、单元高度 31.6 μm；壁函数模式取 $y^{+} = 30$ 得单元高度 0.949 mm，两者相差 30 倍。

## 4 产生项限制与停滞区处理

SST 用 $\tilde{P}_k = \min(P_k,\; c_1\beta^{*}\rho k\omega)$ 限制产生项，$c_1 = 10$ 是默认值。前缘驻点处速度梯度大而湍流尺度小，不限制会算出虚假的高 $k$ 峰值，进而抬高前缘压力、改变升力斜率。核验方式是输出 $P_k/(\beta^{*}\rho k\omega)$ 的场：驻点附近该比值应被压在 10 以内；若最大值出现在前缘且超过 20，说明 `c1` 被改小或模型不是 SST。

`F3` 默认关闭。它引入基于涡量与应变率之比的修正，主要用于粗糙壁与旋转流；开启前必须确认所用版本对 $F_3$ 的定义一致，否则同一算例在不同版本间会给出不同结果。

## 5 旋转机械与多参考系下的额外设置

```cpp
// constant/MRFProperties
MRF
{
    cellZone    rotorZone;
    origin      (0 0 0);
    axis        (0 0 1);
    omega       104.7;      // rad/s，对应 1000 rpm
}
```

三个容易出错的点：$\omega$ 单位是 rad/s，$1000\,\mathrm{rpm} = 104.7\,\mathrm{rad/s}$；壁面距离必须在绝对坐标系下计算，否则旋转域内的 $F_1$ 会随转速漂移；转子与静子交界处的 $\omega$ 方程对流通量应按混合面处理，直接插值会引入额外的数值扩散，建议在交界面两侧各加密 2~3 层。

## 6 设置错误的识别与反证

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 远场 $\mu_t/\mu$ 达数百，尾迹衰减异常快 | 用 $l = 0.07L$ 反算 $\omega$，隐含长度尺度比实际大一个量级 | 输出远场 $\mu_t/\mu$ 并与 $k/(\nu\omega)$ 手算值比对 |
| 升力系数随远场边界距离变化超过 3% | 远场 $\omega$ 未按几何尺度给定，边界位置改变了 $\mu_t$ 水平 | 把 $\omega$ 系数在 1~10 之间扫三档，看升力是否收敛 |
| 前缘 $k$ 出现尖峰、升力斜率偏高 | 产生项限制失效或 `c1` 被改 | 输出 $P_k/(\beta^{*}\rho k\omega)$，检查前缘最大值是否被压在 10 内 |
| $F_1$ 等值线在缝隙处突跳 | `meshWave` 在遮挡几何中给出错误壁面距离 | 换 `advectionDiffusion` 重算，比较 $F_1$ 场的连续性 |
| 内外层常数不匹配，$\omega$ 场整体偏移 | 软件的 $\alpha$ 默认值不等于 0.553 与 0.440 | 打印生效常数，用 $\beta/\beta^{*} - \sigma_\omega\kappa^{2}/\sqrt{\beta^{*}}$ 反算核对 |
| 旋转域内壁面切应力随转速线性漂移 | 壁面距离在旋转坐标系下求解 | 切换为绝对坐标系重算 $y$ 场，比较 $F_1$ 分布 |

## 7 文献与常数出处

1. Menter F. R., "Zonal two equation k-ω turbulence models for aerodynamic flows," *AIAA Paper 93-2906*, 1993.
2. Menter F. R., Kuntz M., Langtry R., "Ten years of industrial experience with the SST turbulence model," *Turbulence, Heat and Mass Transfer 4*, 2003.
3. Coles D., Wadcock A. J., "Flying-hot-wire study of flow past an NACA 4412 airfoil at maximum lift," *AIAA Journal*, 1979.
4. Wilcox D. C., *Turbulence Modeling for CFD*, 3rd ed., DCW Industries, 2006.
