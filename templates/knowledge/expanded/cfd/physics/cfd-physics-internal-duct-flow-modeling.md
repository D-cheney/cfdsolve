---
template_version: "flowlab-knowledge/1.0"
slug: cfd-physics-internal-duct-flow-modeling
title: "内流与管网流动：物理建模与适用边界"
summary: "管流建模的四个决定点是水力直径、层流/湍流区制、弯管二次流与气体可压缩性。本文给出各判据的公式、阈值与实算数值，并说明达西与范宁摩擦因子互换时的四倍陷阱。"
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
  - "内流与管网流动"
  - "物理建模与适用边界"
  - "水力直径"
  - "迪恩数"
seo:
  title: "内流与管网流动：物理建模与适用边界"
  description: "管流建模的四个决定点是水力直径、层流/湍流区制、弯管二次流与气体可压缩性。本文给出各判据的公式、阈值与实算数值，并说明达西与范宁摩擦因子互换时的四倍陷阱。"
  keywords:
    - "内流与管网流动"
    - "物理建模与适用边界"
    - "水力直径"
    - "迪恩数"
---

# 内流与管网流动：物理建模与适用边界

管流看似最简单，但把截面形状、层流与湍流区制、弯管二次流、气体可压缩性这四件事处理错，任何网格都无法救回结果。本文按建模顺序逐项给出判据：先算水力直径，再定区制与摩擦因子，然后判断弯管和可压缩性是否必须保留，最后落到网格与边界设置。

## 1 非圆截面的等效直径

非圆截面用四个水力直径定义雷诺数：

$$
D_h = \frac{4A}{P}
$$

$A$ 为流通面积，$P$ 为湿周。取矩形风道 $0.3\,\mathrm{m}\times0.1\,\mathrm{m}$：$A = 0.03\,\mathrm{m^2}$、$P = 2\times(0.3+0.1) = 0.8\,\mathrm{m}$，故 $D_h = 4\times0.03/0.8 = 0.15\,\mathrm{m}$。注意 $D_h$ 只用于雷诺数与摩擦因子，不能用于几何建模或面积计算——把 $D_h$ 当作"等效圆管直径"去算流量是常见错误。

层流时不同截面的摩擦因子并不相同，用泊肃叶数 $f\,Re$ 区分：

| 截面 | $f\,Re$（达西因子） |
|---|---|
| 圆管 | 64.0 |
| 正方形 | 56.9 |
| 2:1 矩形 | 62.2 |
| 4:1 矩形 | 72.9 |
| 平行平板 | 96.0 |

## 2 层流还是湍流，摩擦因子用哪条

区制由雷诺数划分，摩擦因子各有对应关系：

$$
Re = \frac{\rho U D_h}{\mu}, \qquad f_{\text{lam}} = \frac{64}{Re}, \qquad f_{\text{Blasius}} = 0.316\,Re^{-1/4}
$$

取液压油 $\rho = 850\,\mathrm{kg/m^3}$、$\mu = 0.05\,\mathrm{Pa\cdot s}$ 在 $D_h = 0.15\,\mathrm{m}$ 的矩形通道中以 $U = 0.6\,\mathrm{m/s}$ 流动：$Re = 850\times0.6\times0.15/0.05 = 1530$，属层流，$f = 64/1530 = 0.0418$。若换成水（$\rho = 998.2\,\mathrm{kg/m^3}$、$\mu = 1.0\times10^{-3}\,\mathrm{Pa\cdot s}$），$Re = 9.0\times10^{4}$，属湍流，用 Blasius 式 $f = 0.316\times(9.0\times10^{4})^{-0.25} = 0.0182$。同一几何、同一速度，摩擦因子相差一倍以上——先定区制再谈别的。

这里有一个必须记住的换算：范宁摩擦因子 $f_F$ 与达西摩擦因子 $f_D$ 相差四倍，$f_D = 4f_F$，壁面剪切为

$$
\tau_w = \frac{1}{8}f_D\,\rho U^{2} = \frac{1}{2}f_F\,\rho U^{2}
$$

软件手册、教科书与实验报告三者常混用不同口径，拿错会让壁面剪切差 4 倍，首层网格高度随之全错。

## 3 弯管与二次流

弯管中离心力驱动二次流，形成 Dean 涡，其强弱由迪恩数衡量：

$$
De = Re\sqrt{\frac{D}{2R}}
$$

$D = 0.05\,\mathrm{m}$、弯管曲率半径 $R = 0.15\,\mathrm{m}$、$Re = 1.0\times10^{5}$ 时，$De = 1.0\times10^{5}\times\sqrt{0.05/0.3} = 4.1\times10^{4}$。Dean 涡在 $De \gtrsim 100$ 时已明显，$De$ 达到 $10^{4}$ 量级意味着弯头下游存在强二次流和附加压降。此时若用二维或轴对称模型，弯头损失会被低估 20% 以上，必须建三维并保证弯头处周向至少 40 个单元。

## 4 气体管道：可压缩性什么时候必须打开

气体密度随压力变化，判据是相对压降：

$$
\frac{\Delta p}{p_{\text{abs}}} < 5\% \ \Rightarrow\ \text{可按不可压处理}
$$

$D = 0.05\,\mathrm{m}$ 的空气管（$f = 0.0218$、$L/D = 200$）、$p_{\text{abs}} = 1.013\times10^{5}\,\mathrm{Pa}$：

- $U = 20\,\mathrm{m/s}$（$\rho = 1.16\,\mathrm{kg/m^3}$）：$\Delta p = 0.0218\times200\times0.5\times1.16\times400 = 1011\,\mathrm{Pa}$，$\Delta p/p = 1.0\%$，不可压足够。
- $U = 60\,\mathrm{m/s}$：$\Delta p = 0.0218\times200\times0.5\times1.16\times3600 = 9104\,\mathrm{Pa}$，$\Delta p/p = 9.0\%$，必须用可压缩求解器。

注意在 $U = 60\,\mathrm{m/s}$ 时 $M = 60/343 = 0.17$，远低于 0.3 的常规马赫门槛，但压降判据已经越界。对长管道，压降判据比马赫数判据更严格，不能只看马赫数。

## 5 网格与边界：充分发展解怎么拿

内流算例应尽量使用周期性边界求充分发展解，避免为消除入口效应而把管子建到 $50D$。OpenFOAM 中用两个普通 patch 合并成周期性 patch：

```cpp
// system/createPatchDict
matchTolerance  1e-4;
pointSync       false;
patches
(
    {
        name            periodic;
        patchInfo       { type cyclic; }
        constructFrom   patches;
        patches         ( inlet outlet );
    }
);

// 周期性算例还需给出驱动压降或质量流量
// constant/fvOptions
momentumSource
{
    type            meanVelocityForce;
    selectionMode   all;
    fields          (U);
    Ubar            (2 0 0);        // 目标平均速度 m/s
}
```

壁面网格按所选近壁处理定首层：$y^{+} \approx 1$ 用于全解析，$30\sim300$ 用于标准壁函数。$Re = 9.9\times10^{4}$、$D = 0.05\,\mathrm{m}$ 的钢管、$U = 2\,\mathrm{m/s}$，$f_D = 0.0218$ 给出 $\tau_w = f_D\rho U^{2}/8 = 10.9\,\mathrm{Pa}$，$u_\tau = \sqrt{\tau_w/\rho} = 0.104\,\mathrm{m/s}$，$y^{+} = 1$ 对应 $y_1 = \nu/u_\tau \approx 9.6\,\mu\mathrm{m}$。管流用全解析近壁时，径向至少需要 30 个单元才能把对数层与黏性底层同时分辨。

## 6 适用边界与失效信号

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 层流工况压降只有手算的一半 | 误用了湍流摩擦因子关联式 | 先算 $Re$，$Re < 2300$ 必须用 $f = 64/Re$ |
| 壁面剪切差 4 倍 | 范宁与达西摩擦因子口径混用 | 核对软件输出的是 $f_F$ 还是 $f_D$，统一口径 |
| 弯头损失比手册低 25% | 用了二维/轴对称模型，二次流被抹掉 | 建三维算例，检查弯头截面是否出现 Dean 涡 |
| 气体管压降与实测差 20% | 忽略了密度沿程变化 | 计算 $\Delta p/p$，超过 5% 换可压缩求解器 |
| 非圆通道 $f$ 总是偏高 | 把圆管的 $f\,Re = 64$ 用到了矩形截面 | 查泊肃叶数表，2:1 矩形取 62.2 |
| 充分发展段速度剖面偏离对数律 | 网格径向太粗，或仍处在发展段 | 加密径向网格，或用周期性边界重算 |

## 7 建模步骤

1. 由 $A$ 与 $P$ 计算 $D_h$，非圆截面按泊肃叶数表选 $f\,Re$。
2. 计算 $Re$ 判定区制，层流用 $64/Re$，湍流用 Blasius 或 Colebrook。
3. 统一范宁与达西口径，据此换算壁面剪切与首层高度。
4. 计算 $De$，超过 100 就必须三维建模并加密弯头。
5. 对气体计算 $\Delta p/p$，超过 5% 切换到可压缩求解。
6. 优先使用周期性边界求充分发展解，并记录驱动压降或目标流量。

## 8 参考文献

1. Shah R.K., London A.L., *Laminar Flow Forced Convection in Ducts*, Academic Press, 1978.
2. Dean W.R., "Note on the Motion of Fluid in a Curved Pipe," *Philosophical Magazine*, 1927.
3. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
4. Pope S.B., *Turbulent Flows*, Cambridge University Press, 2000.
