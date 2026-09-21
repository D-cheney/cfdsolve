---
template_version: "flowlab-knowledge/1.0"
slug: cae-coupling-fluid-thermal-engineering-setup
title: "流热耦合：工程设置与参数选择"
summary: "把共轭传热算例拆成网格、时间步、界面松弛、物性与辐射四组参数，给出傅里叶数反算时间步、y+ 反算首层厚度与 chtMultiRegionFoam 可填写的字典配置。"
category:
  slug: multiphysics-coupling
  name: "多物理场耦合算法"
level: 工程
reading_minutes: 8
status: PUBLISHED
author_username: lin-cfd
published_at: "2026-09-20T00:00:00.000Z"
tags:
  - "CAE"
  - "多物理场耦合算法"
  - "流热耦合"
  - "工程设置与参数选择"
  - "共轭传热"
  - "傅里叶数"
seo:
  title: "流热耦合：工程设置与参数选择"
  description: "把共轭传热算例拆成网格、时间步、界面松弛、物性与辐射四组参数，给出傅里叶数反算时间步、y+ 反算首层厚度与 chtMultiRegionFoam 可填写的字典配置。"
  keywords:
    - "流热耦合"
    - "工程设置与参数选择"
    - "共轭传热"
    - "傅里叶数"
    - "chtMultiRegionFoam"
---

# 流热耦合：工程设置与参数选择

共轭传热的设置难点在于流体与固体的要求互相冲突：流体侧要薄到能分辨热边界层，固体侧要厚到能容纳热扩散长度，而时间步同时受两侧扩散稳定性约束。本文给出四组可直接填写的参数——网格首层厚度与增长比、时间步与交换频率、界面松弛因子、物性与辐射设置——以及每一项的取值依据，工具层面以 OpenFOAM 的 `chtMultiRegionFoam` 为例。

## 网格：热边界层与固体侧的联合约束

流体侧首层高度由目标 $y^{+}$ 反算。取摩擦速度 $u_{\tau}=0.30\ \text{m/s}$、空气 $\nu=1.5\times10^{-5}\ \text{m}^2/\text{s}$，若要求 $y^{+}=1$，则

$$\Delta y_{1}=\frac{y^{+}\nu}{u_{\tau}}=\frac{1\times1.5\times10^{-5}}{0.30}=5.0\times10^{-5}\ \text{m}$$

即 0.05 mm。若用壁面函数（$y^{+}\approx30\sim300$），$\Delta y_1$ 可放宽到 1.5 mm，但壁面热流精度随之下降，工程上建议温度敏感区域仍用 $y^{+}<5$。增长比取 1.15～1.20，保证从 0.05 mm 过渡到主流区不超过 20 层。

固体侧的单元尺寸由热扩散长度约束，而不是由结构强度需求决定。要求固体首层厚度不超过热扩散长度的一半：

$$\delta_{th}=\sqrt{\frac{\alpha_{s}L_{c}}{u}}$$

以铝为例 $\alpha_s=k/(\rho c_p)=200/(2700\times900)=8.23\times10^{-5}\ \text{m}^2/\text{s}$；通道长度 $L_c=0.2\ \text{m}$、流速 $u=5\ \text{m/s}$，则 $\delta_{th}=\sqrt{8.23\times10^{-5}\times0.2/5}=1.8\times10^{-3}\ \text{m}$，即 1.8 mm，固体近界面单元取 0.9 mm 以下。两侧网格尽量共形；非共形时必须在界面做面积加权插值，否则热流会不守恒。

## 时间步：傅里叶数与耦合交换频率

显式或半隐式热扩散的稳定性由傅里叶数控制：

$$Fo=\frac{\alpha\Delta t}{\Delta x^{2}}\le 0.5$$

流体侧：$\alpha_f=k/(\rho c_p)=0.026/(1.18\times1005)=2.19\times10^{-5}\ \text{m}^2/\text{s}$，若最小单元 1.0 mm，则 $\Delta t\le0.5\times(1.0\times10^{-3})^{2}/2.19\times10^{-5}=0.0228\ \text{s}$。固体侧：铝 $\alpha_s=8.23\times10^{-5}$、单元 2.0 mm，则 $\Delta t\le0.5\times4.0\times10^{-6}/8.23\times10^{-5}=0.0243\ \text{s}$。两者取小，$\Delta t=0.02\ \text{s}$ 即可，再乘 0.8 安全系数得 0.016 s。

耦合交换频率是另一回事：稳态求解时每 5～10 个流体迭代交换一次界面温度即可；瞬态求解时，若固体热惯性远大于流体（$\tau_s/\tau_f>100$），可每 10～50 个流体步交换一次，但要用界面热流的相对变化率做触发（超过 1% 立即交换）。交换过疏会引入界面温度滞后，表现为固体温峰随交换周期出现阶梯状抖动。

## 界面耦合与松弛参数的选取

界面温度耦合本质是固定点迭代，强耦合（两侧导热率相差悬殊）时需要松弛：

$$T_{\Gamma}^{k+1}=(1-\omega)T_{\Gamma}^{k}+\omega\,\mathcal{H}\left(T_{\Gamma}^{k}\right)$$

$\omega$ 取 0.3～0.5 起步；若界面热流残差在 5 次迭代内下降不足一个数量级，改用 Aitken 自适应：

$$\omega_k=-\omega_{k-1}\frac{r^{k-1}\left(r^{k}-r^{k-1}\right)}{\left(r^{k}-r^{k-1}\right)^{2}},\qquad r^{k}=\mathcal{H}\left(T_{\Gamma}^{k}\right)-T_{\Gamma}^{k}$$

收敛判据用界面热流相对残差，阈值 $1.0\times10^{-4}$（与能量方程残差同量级）。若用 $\Delta T$ 作判据，需注意界面温差本身可能只有 0.5 K，绝对阈值必须按温差量级缩放。

## 物性、辐射与浮升力的设置

- **物性**：气体用可压缩或 Boussinesq 视温差而定。$\beta\Delta T L<0.1$ 时可用 Boussinesq；温差 100 K 以上必须用变密度。
- **导热率温度依赖**：不锈钢 $k$ 从 20 ℃ 的 16.2 W/(m·K) 升到 500 ℃ 的 21.5 W/(m·K)，变化 33%，不可用常数。
- **辐射**：$T^4$ 项在 300 K 时 $q''_{rad}=\varepsilon\sigma T^4=0.9\times5.67\times10^{-8}\times8.1\times10^{9}=413\ \text{W/m}^2$，与 $h=10$、$\Delta T=40$ K 的对流（400 W/m²）同量级，所以室温以上的算例不能随手关掉辐射。
- **浮升力**：用 $Gr/Re^2$ 判断，比值超过 0.1 就必须开浮升力项。
- **湍流普朗特数**：空气取 $Pr_t=0.85$，液态金属取 0.01～1.5 之间并需专门模型。

```text
# chtMultiRegionFoam 关键设置
system/controlDict
  deltaT          0.016;      // s, 由 Fo<=0.5 两侧取小再乘 0.8
  adjustTimeStep  no;
  endTime         600;        // s, 至少 3 倍固体时间常数

constant/regionProperties
  fluid   (air);
  solid   (heater steel_case);

0.orig/fluid/air 界面边界
  interface
  {
      type  compressible::turbulentTemperatureCoupledBaffleMixed;
      neighbourFieldName  T;
      kappaMethod         fluidThermo;
      value               uniform 300;
  }

system/fvSolution 中的界面松弛
  relaxationFactors
  {
      fields { T 0.5; }        // 稳态用；瞬态改用 Aitken
  }
```

## 失败模式与判定试验

| 现象 | 根因 | 判定试验 |
|---|---|---|
| 界面热流不守恒，偏差 >1% | 非共形界面未做面积加权插值 | 对界面做 $\int k\partial_nT\,dA$ 双侧对比 |
| 流体壁温偏差大而固体温峰正常 | 首层太厚、热边界层未分辨 | 反算 $y^{+}$，比较 $y^{+}=1$ 与 30 两套网格 |
| 温度随交换周期阶梯抖动 | 界面交换频率过疏 | 把交换周期减半，观察抖动是否消失 |
| 界面迭代 5 次不下降一个量级 | 松弛因子过大或耦合过强 | 用 Aitken 替换固定 $\omega$，记录 $\omega_k$ 序列 |
| 稳态算例长时间仍缓慢升温 | 未算够固体热时间常数 | 算 $\tau=\rho c_pV/(hA)$，积分至少 3τ |
| 高温算例总热量差 10% | 关闭了辐射项 | 比较 $\varepsilon\sigma T^4$ 与对流热流 |
| 竖通道温度分层异常 | 未开浮升力 | 检查 $Gr/Re^{2}$ 是否超过 0.1 |

## 参考文献

1. OpenFOAM Foundation, *OpenFOAM User Guide*（chtMultiRegionFoam 与 regionProperties 章节）, 2023.
2. Incropera F.P., DeWitt D.P., Bergman T.L., Lavine A.S., *Fundamentals of Heat and Mass Transfer*, 7th ed., Wiley, 2011.
3. Patankar S.V., *Numerical Heat Transfer and Fluid Flow*, Hemisphere Publishing, 1980.
4. Versteeg H.K., Malalasekera W., *An Introduction to Computational Fluid Dynamics: The Finite Volume Method*, 2nd ed., Pearson, 2007.
5. Kays W.M., Crawford M.E., Weigand B., *Convective Heat and Mass Transfer*, 4th ed., McGraw-Hill, 2005.
6. Menter F.R., "Two-equation eddy-viscosity turbulence models for engineering applications," *AIAA Journal*, 32(8), 1994.
